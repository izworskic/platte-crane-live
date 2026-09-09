'use client';

import {useState} from 'react';
const CAMERA_URL='https://explore.org/livecams/national-audubon-society/crane-camera';
function track(event:string){if(typeof window!=='undefined')window.dataLayer?.push(['event',event])}

type Expectation={label:string;text:string;className:string};
function cameraExpectation(now=new Date()):Expectation{
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',month:'numeric',hour:'numeric',hour12:false}).formatToParts(now);
  const month=Number(parts.find(p=>p.type==='month')?.value??0);
  const hour=Number(parts.find(p=>p.type==='hour')?.value??12);
  const spring=month>=2&&month<=4;
  if(!spring)return {label:'Off-season river view',text:'The camera can be working perfectly with few or no cranes visible. Large Platte River roost concentrations are a spring phenomenon.',className:'camera-offseason'};
  if(hour<=8||hour>=17)return {label:'High-value camera window',text:'This is the part of the day when cranes are most likely to be arriving at or lifting from the river during migration season.',className:'camera-prime'};
  return {label:'Between roost windows',text:'During the day, many cranes feed in fields and wet meadows away from the river. A quiet river camera at midday does not mean the migration is absent.',className:'camera-between'};
}

export default function CameraCard(){
  const [expectation]=useState<Expectation>(()=>cameraExpectation());
  return <section className="panel camera-card">
    <p className="eyebrow">CHECK THE RIVER LIVE</p>
    <h2>Rowe Sanctuary live crane camera</h2>
    <p>This button goes directly to Audubon’s Rowe Sanctuary camera page on Explore.org, not to a generic camera directory.</p>
    <div className="camera-status"><span className="live-dot" aria-hidden="true"/><div><strong>Exact Rowe camera page</strong><span>Gibbon, Nebraska · Explore.org / National Audubon Society</span></div></div>
    <div className={`camera-expectation ${expectation.className}`}><span>WHAT SHOULD I EXPECT NOW?</span><strong>{expectation.label}</strong><p>{expectation.text}</p></div>
    <a className="primary-btn camera-btn" href={CAMERA_URL} target="_blank" rel="noreferrer" onClick={()=>track('crane_live_camera_click')}>Watch the Rowe live camera ↗</a>
    <p className="fine">During crane season, dawn and dusk are the highest-value river windows. Outside the migration window you may see the Platte and other wildlife rather than large crane concentrations.</p>
    <a className="source-link" href="https://www.audubon.org/rowe" target="_blank" rel="noreferrer">Rowe Sanctuary visitor information ↗</a>
  </section>
}
