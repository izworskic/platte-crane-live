import { freshness } from '@/lib/freshness';
import type { RiverGauge } from '@/lib/types';
const SITES: Record<string,string> = {'06768000':'Overton','06770200':'Kearney','06770500':'Grand Island'};
export async function fetchRiverGauges(): Promise<RiverGauge[]> {
  const url='https://waterservices.usgs.gov/nwis/iv/?format=json&sites=06768000,06770200,06770500&parameterCd=00060,00065,00010&siteStatus=all';
  try {
    const r=await fetch(url,{next:{revalidate:900},signal:AbortSignal.timeout(6500)}); if(!r.ok) throw new Error(`USGS ${r.status}`);
    const j=await r.json(); const bySite=new Map<string,RiverGauge>();
    for(const ts of j?.value?.timeSeries ?? []) {
      const code=ts?.variable?.variableCode?.[0]?.value; const site=ts?.sourceInfo?.siteCode?.[0]?.value; if(!site || !SITES[site]) continue;
      const v=ts?.values?.[0]?.value?.at(-1); const value=v?.value==null?null:Number(v.value); const observedAt=v?.dateTime ?? null;
      const g=bySite.get(site) ?? {site,name:SITES[site],discharge:null,gageHeight:null,waterTempC:null,observedAt,qualifiers:v?.qualifiers??[],freshness:'UNAVAILABLE',sourceUrl:`https://waterdata.usgs.gov/monitoring-location/${site}/`};
      if(code==='00060') g.discharge=value; if(code==='00065') g.gageHeight=value; if(code==='00010') g.waterTempC=value;
      if(observedAt && (!g.observedAt || observedAt>g.observedAt)) g.observedAt=observedAt; g.freshness=freshness(g.observedAt,new Date(),'river'); bySite.set(site,g);
    }
    return Object.keys(SITES).map(site=>bySite.get(site)??{site,name:SITES[site],discharge:null,gageHeight:null,waterTempC:null,observedAt:null,qualifiers:[],freshness:'UNAVAILABLE',sourceUrl:`https://waterdata.usgs.gov/monitoring-location/${site}/`});
  } catch {
    return Object.entries(SITES).map(([site,name])=>({site,name,discharge:null,gageHeight:null,waterTempC:null,observedAt:null,qualifiers:[],freshness:'UNAVAILABLE',sourceUrl:`https://waterdata.usgs.gov/monitoring-location/${site}/`}));
  }
}
