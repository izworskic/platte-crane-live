'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import type {Map as MLMap} from 'maplibre-gl';
import sites from '@/data/viewing-sites.json';

type Site=(typeof sites)[number];
type PersonaId='first-time'|'dawn-dusk'|'photography'|'family';
type BaseTown='kearney'|'grand-island';

const personas:{id:PersonaId;label:string;short:string;matches:string[]}[]=[
  {id:'first-time',label:'First crane trip',short:'Easy orientation + reliable public access',matches:['first-time','guided']},
  {id:'dawn-dusk',label:'Dawn / dusk self-guided',short:'River viewing without a tour reservation',matches:['dawn-dusk','self-guided']},
  {id:'photography',label:'Birder / photographer',short:'Immersive or specialized viewing',matches:['photography','birder','bucket-list']},
  {id:'family',label:'Family / accessibility',short:'Parking, facilities and easier access matter',matches:['family','accessible']}
];

const baseTowns:{id:BaseTown;label:string;summary:string;tourismUrl:string;origin:string}[]=[
  {id:'kearney',label:'Kearney',summary:'Best western base for Rowe, Plautz and Fort Kearny, with the shortest reset between dawn and dusk on the west side of the corridor.',tourismUrl:'https://visitkearney.org/sandhill-cranes/',origin:'Kearney, NE'},
  {id:'grand-island',label:'Grand Island',summary:'Best eastern base for Crane Trust and Alda, with strong visitor infrastructure for the eastern half of the migration corridor.',tourismUrl:'https://www.visitgrandisland.com/crane-migration',origin:'Grand Island, NE'}
];

const freeFallbackIds=['plautz','alda','fort-kearny'] as const;

function mapsUrl(site:Site){return `https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lon}`}
function mapsFromBaseUrl(base:BaseTown,site:Site){const town=baseTowns.find(b=>b.id===base)??baseTowns[0];return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(town.origin)}&destination=${site.lat},${site.lon}`}
function isPersonaMatch(site:Site,persona:PersonaId){const match=personas.find(p=>p.id===persona)?.matches??[];return site.bestFor.some(x=>match.includes(x))}
function track(event:string,params:Record<string,string>){if(typeof window!=='undefined')window.dataLayer?.push(['event',event,params])}
function moveMap(map:MLMap|null,site:Site){try{map?.easeTo({center:[site.lon,site.lat],zoom:10.4,duration:650})}catch{/* Destination selection must still work if map tiles/style fail. */}}
function firstSiteWith(windowName:'dawn'|'daytime'|'dusk'){return sites.find(s=>s.bestTime.includes(windowName))??sites[0]}

export default function CorridorMap(){
  const ref=useRef<HTMLDivElement>(null);
  const mapRef=useRef<MLMap|null>(null);
  const [focus,setFocus]=useState(false);
  const [persona,setPersona]=useState<PersonaId>('first-time');
  const [selectedId,setSelectedId]=useState(sites[0].id);
  const [baseTown,setBaseTown]=useState<BaseTown>('kearney');
  const selected=sites.find(s=>s.id===selectedId)??sites[0];
  const ordered=useMemo(()=>[...sites].sort((a,b)=>Number(isPersonaMatch(b,persona))-Number(isPersonaMatch(a,persona))),[persona]);
  const freeFallbacks=sites.filter(s=>freeFallbackIds.includes(s.id as (typeof freeFallbackIds)[number]));
  const dawnSite=selected.bestTime.includes('dawn')?selected:(sites.find(s=>s.id==='plautz')??firstSiteWith('dawn'));
  const daySite=selected.bestTime.includes('daytime')?selected:(persona==='family'?(sites.find(s=>s.id==='crane-trust')??firstSiteWith('daytime')):(sites.find(s=>s.id==='windmill')??firstSiteWith('daytime')));
  const duskSite=selected.bestTime.includes('dusk')?selected:(sites.find(s=>s.id==='plautz')??firstSiteWith('dusk'));
  const selectedNeedsBooking='bookingUrl' in selected&&!!selected.bookingUrl;
  const selectedNeedsPermit=selected.id==='fort-kearny'||selected.id==='windmill';

  useEffect(()=>{
    let alive=true;
    (async()=>{
      if(!ref.current||mapRef.current)return;
      try{
        const ml=await import('maplibre-gl');
        if(!alive||!ref.current)return;
        const map=new ml.Map({container:ref.current,style:'https://tiles.openfreemap.org/styles/liberty',center:[-98.73,40.72],zoom:8.3,attributionControl:false});
        map.addControl(new ml.NavigationControl({showCompass:false}),'top-right');
        map.addControl(new ml.AttributionControl({compact:true}));
        const bounds=new ml.LngLatBounds();
        sites.forEach((site,index)=>{
          bounds.extend([site.lon,site.lat]);
          const el=document.createElement('button');
          el.type='button';
          el.className='map-marker';
          el.dataset.siteId=site.id;
          el.setAttribute('aria-label',`Open ${site.name}`);
          el.title=site.name;
          el.textContent=String(index+1);
          el.addEventListener('click',ev=>{
            ev.preventDefault();
            ev.stopPropagation();
            setSelectedId(site.id);
            track('crane_map_marker_select',{site:site.id});
            moveMap(map,site);
          });
          new ml.Marker({element:el}).setLngLat([site.lon,site.lat]).addTo(map);
        });
        try{map.fitBounds(bounds,{padding:55,maxZoom:9.1,duration:0})}catch{}
        mapRef.current=map;
      }catch{/* The destination list remains fully usable without the basemap. */}
    })();
    return()=>{alive=false;try{mapRef.current?.remove()}catch{}mapRef.current=null};
  },[]);

  useEffect(()=>{
    if(!ref.current)return;
    ref.current.querySelectorAll<HTMLElement>('.map-marker').forEach(el=>el.classList.toggle('is-selected',el.dataset.siteId===selectedId));
  },[selectedId]);

  function choose(site:Site){
    setSelectedId(site.id);
    track('crane_destination_select',{site:site.id,persona});
    moveMap(mapRef.current,site);
    if(focus)ref.current?.focus();
  }

  return <section className={`panel map-panel ${focus?'map-focus':''}`}>
    <div className="section-head"><div><p className="eyebrow">PUBLIC ACCESS ONLY</p><h2>Choose a crane-viewing stop</h2><p>Every numbered point is a real public or controlled-access destination. Pick how you are traveling, then click a marker or destination name to see exactly what it is and how to get there.</p></div><button onClick={()=>setFocus(v=>!v)}>{focus?'Exit focus':'Focus map'}</button></div>

    <div className="persona-picker" aria-label="Choose your trip style">
      {personas.map(p=><button key={p.id} className={persona===p.id?'is-on':''} aria-pressed={persona===p.id} onClick={()=>{setPersona(p.id);track('crane_persona_select',{persona:p.id})}}><strong>{p.label}</strong><span>{p.short}</span></button>)}
    </div>

    <div className="map-experience-grid">
      <div>
        <div ref={ref} className="map" tabIndex={-1}/>
        <div className="map-fallback"><strong>How to use this map:</strong> numbered markers match the destination list. Exact private roost coordinates are intentionally excluded; all pins are visitor destinations.</div>
      </div>
      <div className="map-place-list" aria-label="Viewing destinations">
        {ordered.map(site=>{const n=sites.findIndex(s=>s.id===site.id)+1;const match=isPersonaMatch(site,persona);return <button key={site.id} className={`${selectedId===site.id?'is-selected':''} ${match?'persona-match':''}`} onClick={()=>choose(site)} aria-pressed={selectedId===site.id}><span className="map-list-number">{n}</span><span><strong>{site.mapLabel}</strong><small>{site.type}</small>{match&&<em>Good fit for this trip</em>}</span></button>})}
      </div>
    </div>

    <article className="map-detail-card" aria-live="polite">
      <div className="map-detail-top"><div><span className="tag">{selected.type}</span><h3>{selected.name}</h3><p className="map-detail-summary">{selected.summary}</p></div><span className="map-detail-number">{sites.findIndex(s=>s.id===selected.id)+1}</span></div>
      <div className="map-detail-grid">
        <div><span>Best viewing window</span><strong>{selected.bestTime.join(' · ')}</strong></div>
        <div><span>What you’ll find</span><strong>{selected.whatToExpect}</strong></div>
        <div><span>Access / reservation</span><strong>{selected.permit}</strong></div>
        <div><span>Parking / mobility</span><strong>{selected.parking}. {selected.accessibility}</strong></div>
      </div>
      <p className="trip-tip"><b>Trip tip:</b> {selected.visitTip}</p>
      <div className="map-actions">
        <a className="primary-btn" href={mapsUrl(selected)} target="_blank" rel="noreferrer" onClick={()=>track('crane_google_maps_click',{site:selected.id,persona})}>Directions in Google Maps ↗</a>
        <a className="secondary-btn" href={selected.source} target="_blank" rel="noreferrer" onClick={()=>track('crane_official_details_click',{site:selected.id})}>Official site details ↗</a>
        {'bookingUrl' in selected&&selected.bookingUrl&&<a className="secondary-btn" href={selected.bookingUrl} target="_blank" rel="noreferrer" onClick={()=>track('crane_booking_click',{site:selected.id})}>Tours / reservations ↗</a>}
      </div>
      <p className="fine">Directions point only to the public destination above. Platte Crane Live does not publish private feeding locations or precise river-roost coordinates.</p>
    </article>

    <section className="trip-completer" aria-labelledby="complete-trip-title">
      <div className="section-head"><div><p className="eyebrow">FINISH THE TRIP</p><h2 id="complete-trip-title">Turn this stop into a complete crane day</h2><p>Choosing a viewing site is only half the decision. Pick your base, confirm reservations or permits, and keep a free fallback so one sold-out tour or weather change does not ruin the trip.</p></div></div>

      <div className="base-town-picker" aria-label="Choose a trip base">
        {baseTowns.map(t=><button key={t.id} aria-pressed={baseTown===t.id} className={baseTown===t.id?'is-on':''} onClick={()=>{setBaseTown(t.id);track('crane_base_town_select',{base:t.id,site:selected.id})}}><strong>{t.label}</strong><span>{t.summary}</span></button>)}
      </div>

      <div className="trip-route-card">
        <div><span className="trip-kicker">YOUR ROUTE</span><h3>{(baseTowns.find(t=>t.id===baseTown)??baseTowns[0]).label} → {selected.mapLabel}</h3><p>Use this as the anchor leg, then build dawn and dusk around the river rather than trying to chase feeding flocks across private roads.</p></div>
        <a className="primary-btn" href={mapsFromBaseUrl(baseTown,selected)} target="_blank" rel="noreferrer" onClick={()=>track('crane_base_route_click',{base:baseTown,site:selected.id})}>Open route in Google Maps ↗</a>
      </div>

      <div className="crane-day-grid" aria-label="Suggested crane day">
        <article><span>DAWN</span><strong>{dawnSite.mapLabel}</strong><p>Arrive 30–45 minutes before sunrise. Watch cranes lift from the river; stay at a designated public site.</p></article>
        <article><span>DAYTIME</span><strong>{daySite.mapLabel}</strong><p>Use visitor-center interpretation, designated pull-offs or daytime facilities while most cranes feed away from the river.</p></article>
        <article><span>DUSK</span><strong>{duskSite.mapLabel}</strong><p>Be in place 45–60 minutes before sunset. The return to the Platte is often the most dramatic part of the day.</p></article>
      </div>

      <div className="trip-readiness-grid">
        <article className="trip-checklist"><p className="eyebrow">BEFORE YOU LEAVE</p><h3>{selected.mapLabel} readiness</h3><ul>
          <li><b>{selectedNeedsBooking?'Reservation likely required':'No guided reservation required for general access'}</b> — verify the current official site page before driving.</li>
          <li><b>{selectedNeedsPermit?'Nebraska park permit required':'No state-park permit identified for this selected destination'}</b> — rules can change, so use the official link above.</li>
          <li><b>Dress colder than the forecast.</b> Crane Trust advises very warm layers for unheated blinds; binoculars are worth bringing.</li>
          <li><b>No flash / no chasing birds.</b> Respect private property, farm traffic, provider rules and dark-condition restrictions.</li>
        </ul></article>
        <article className="fallback-card"><p className="eyebrow">TOUR SOLD OUT?</p><h3>You still have a crane trip</h3><p>Guided experiences are premium, not mandatory. These designated self-guided river options keep the trip viable without publishing sensitive roost coordinates.</p><div className="fallback-links">{freeFallbacks.map(site=><a key={site.id} href={mapsUrl(site)} target="_blank" rel="noreferrer" onClick={()=>track('crane_free_fallback_click',{site:site.id})}><strong>{site.mapLabel}</strong><span>{site.id==='fort-kearny'?'State park permit required':'Free public viewing'}</span></a>)}</div></article>
      </div>

      <div className="planning-links"><a href={(baseTowns.find(t=>t.id===baseTown)??baseTowns[0]).tourismUrl} target="_blank" rel="noreferrer">Plan lodging & local logistics in {(baseTowns.find(t=>t.id===baseTown)??baseTowns[0]).label} ↗</a><a href="https://www.cranetrust.org/crane-viewing/" target="_blank" rel="noreferrer">Crane Trust current tour rules ↗</a><a href="https://www.audubon.org/rowe/explore/crane-season" target="_blank" rel="noreferrer">Rowe current crane-season details ↗</a></div>
      <p className="fine">Future tour inventory and opening dates are intentionally not hard-coded here. Platte Crane Live links to the official providers because schedules, capacity and access rules can change from season to season.</p>
    </section>
  </section>
}
