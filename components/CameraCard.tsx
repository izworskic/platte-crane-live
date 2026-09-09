'use client';

const CAMERA_URL='https://explore.org/livecams/national-audubon-society/crane-camera';

export default function CameraCard(){
  return <section className="panel camera-card">
    <p className="eyebrow">CHECK THE RIVER LIVE</p>
    <h2>Rowe Sanctuary live crane camera</h2>
    <p>This button goes directly to Audubon’s Rowe Sanctuary camera page on Explore.org, not to a generic camera directory.</p>
    <div className="camera-status"><span className="live-dot" aria-hidden="true"/><div><strong>Exact Rowe camera page</strong><span>Gibbon, Nebraska · Explore.org / National Audubon Society</span></div></div>
    <a className="primary-btn camera-btn" href={CAMERA_URL} target="_blank" rel="noreferrer">Watch the Rowe live camera ↗</a>
    <p className="fine">The camera page is available all day. During crane season, the most useful river viewing is usually around dawn and dusk; outside the migration window you may see the river and other wildlife rather than large crane concentrations.</p>
    <a className="source-link" href="https://www.audubon.org/rowe" target="_blank" rel="noreferrer">Rowe Sanctuary visitor information ↗</a>
  </section>
}
