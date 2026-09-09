import type { WeatherHour } from '@/lib/types';
const POINTS=[{key:'grand-island',name:'Grand Island',lat:40.9264,lon:-98.342},{key:'gibbon',name:'Gibbon / Rowe',lat:40.7478,lon:-98.8446},{key:'kearney',name:'Kearney',lat:40.6993,lon:-99.0817}];
const HEADERS={'User-Agent':'PlatteCraneLive/0.1 (https://chrisizworski.com; public-data client)','Accept':'application/geo+json'};
function windDeg(dir:string){const d:Record<string,number>={N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5}; return d[dir]??0;}
function speed(s:string){const m=s.match(/(\d+)(?:\s*to\s*(\d+))?\s*mph/i); return m?(Number(m[1])+Number(m[2]??m[1]))/2:0;}
function durationMs(iso:string){const h=Number(iso.match(/(\d+)H/)?.[1]??0),m=Number(iso.match(/(\d+)M/)?.[1]??0);return (h*60+m)*60000||3600000;}
function gridAt(values:any[]|undefined, target:string){const t=new Date(target).getTime(); for(const row of values??[]){const [start,dur='PT1H']=String(row.validTime??'').split('/'); const a=new Date(start).getTime(),b=a+durationMs(dur); if(Number.isFinite(a)&&t>=a&&t<b)return row.value??null;} return null;}
async function latestObservation(url:string|undefined){try{if(!url)return null; const stations=await fetch(url,{headers:HEADERS,next:{revalidate:3600},signal:AbortSignal.timeout(4500)}); if(!stations.ok)return null; const sj=await stations.json(); const station=sj.features?.[0]?.id; if(!station)return null; const r=await fetch(`${station}/observations/latest`,{headers:HEADERS,next:{revalidate:900},signal:AbortSignal.timeout(4500)}); if(!r.ok)return null; const j=await r.json(); const p=j.properties??{}; return {timestamp:p.timestamp??null,visibilityMiles:p.visibility?.value==null?null:Math.round((p.visibility.value/1609.344)*10)/10,temperatureF:p.temperature?.value==null?null:Math.round((p.temperature.value*9/5+32)*10)/10,textDescription:p.textDescription??null};}catch{return null;}}
export async function fetchCorridorWeather(){
  return Promise.all(POINTS.map(async p=>{
    try{const meta=await fetch(`https://api.weather.gov/points/${p.lat},${p.lon}`,{headers:HEADERS,next:{revalidate:86400},signal:AbortSignal.timeout(5000)}); if(!meta.ok) throw new Error('points'); const mj=await meta.json();
      const [hourly,grid,observation]=await Promise.all([
        fetch(mj.properties.forecastHourly,{headers:HEADERS,next:{revalidate:900},signal:AbortSignal.timeout(6000)}),
        fetch(mj.properties.forecastGridData,{headers:HEADERS,next:{revalidate:900},signal:AbortSignal.timeout(6000)}).catch(()=>null),
        latestObservation(mj.properties.observationStations)
      ]);
      if(!hourly.ok) throw new Error('hourly'); const hj=await hourly.json(); const gj=grid&&grid.ok?await grid.json():null;
      const hours:WeatherHour[]=(hj.properties.periods??[]).slice(0,36).map((x:any)=>({startTime:x.startTime,temperature:x.temperature,temperatureUnit:x.temperatureUnit,windSpeedMph:speed(x.windSpeed),windDirectionDeg:windDeg(x.windDirection),precipProbability:x.probabilityOfPrecipitation?.value??null,skyCover:gridAt(gj?.properties?.skyCover?.values,x.startTime),relativeHumidity:x.relativeHumidity?.value??gridAt(gj?.properties?.relativeHumidity?.values,x.startTime),shortForecast:x.shortForecast}));
      return {...p,hours,currentObservation:observation,updatedAt:hj.properties.updateTime??new Date().toISOString(),source:'https://api.weather.gov/'};
    }catch{return {...p,hours:[] as WeatherHour[],currentObservation:null,updatedAt:null,source:'https://api.weather.gov/'};}
  }));
}
export async function fetchActiveAlerts(){
  try{const r=await fetch('https://api.weather.gov/alerts/active?point=40.75,-98.85',{headers:HEADERS,next:{revalidate:300},signal:AbortSignal.timeout(5000)}); if(!r.ok)return[]; const j=await r.json(); return (j.features??[]).map((f:any)=>({event:f.properties.event,severity:f.properties.severity,headline:f.properties.headline,expires:f.properties.expires}));}catch{return[];}
}
