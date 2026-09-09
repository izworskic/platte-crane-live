'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import type {Map as MLMap} from 'maplibre-gl';
import sites from '@/data/viewing-sites.json';

type Site=(typeof sites)[number];
type PersonaId='first-time'|'dawn-dusk'|'photography'|'family';

const personas:{id:PersonaId;label:string;short:string;matches:string[]}[]=[
  {id:'first-time',label:'First crane trip',short:'Easy orientation + reliable public access',matches:['first-time','guided']},
  {id:'dawn-dusk',label:'Dawn / dusk self-guided',short:'River viewing without a tour reservation',matches:['dawn-dusk','self-guided']},
  {id:'photography',label:'Birder / photographer',short:'Immersive or specialized viewing',matches:['photography','birder','bucket-list']},
  {id:'family',label:'Family / accessibility',short:'Parking, facilities and easier access matter',matches:['family','accessible']}
];

function mapsUrl(site:Site){return `https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lon}`}
function isPersonaMatch(site:Site,persona:PersonaId){const match=personas.find(p=>p.id===persona)?.matches??[];return site.bestFor.some(x=>match.includes(x))}
function track(event:string,params:Record<string,string>){if(typeof window!=='undefined')window.dataLayer?.push(['event',event,params])}

export default function CorridorMap(){
  const ref=useRef<HTMLDivElement>(null);
  const mapRef=useRef<MLMap|null>(null);
  const [focus,setFocus]=useState(false);
  const [persona,setPersona]=useState<PersonaId>('first-time');
  const [selectedId,setSelectedId]=useState(sites[0].id);
  const selected=sites.find(s=>s.id===selectedId)??sites[0];
  const ordered=useMemo(()=>[...sites].sort((a,b)=>Number(isPersonaMatch(b,persona))-Number(isPersonaMatch(a,persona))),[persona]);

  useEffect(()=>{
    let alive=true;
    (async()=>{
      if(!ref.current||mapRef.current)return;
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
          map.easeTo({center:[site.lon,site.lat],zoom:10.4,duration:650});
        });
        new ml.Marker({element:el}).setLngLat([site.lon,site.lat]).addTo(map);
      });
      map.fitBounds(bounds,{padding:55,maxZoom:9.1,duration:0});
      mapRef.current=map;
    })();
    return()=>{alive=false;mapRef.current?.remove();mapRef.current=null};
  },[]);

  useEffect(()=>{
    if(!ref.current)return;
    ref.current.querySelectorAll<HTMLElement>('.map-marker').forEach(el=>el.classList.toggle('is-selected',el.dataset.siteId===selectedId));
  },[selectedId]);

  function choose(site:Site){
    setSelectedId(site.id);
    track('crane_destination_select',{site:site.id,persona});
    mapRef.current?.easeTo({center:[site.lon,site.lat],zoom:10.4,duration:650});
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
  </section>
}
