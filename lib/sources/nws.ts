import type { WeatherHour } from '@/lib/types';
const POINTS=[{key:'grand-island',name:'Grand Island',lat:40.9264,lon:-98.342},{key:'gibbon',name:'Gibbon / Rowe',lat:40.7478,lon:-98.8446},{key:'kearney',name:'Kearney',lat:40.6993,lon:-99.0817}];
function windDeg(dir:string){const d:Record<string,number>={N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5}; return d[dir]??0;}
function speed(s:string){const m=s.match(/(\d+)(?:\s*to\s*(\d+))?\s*mph/i); return m?(Number(m[1])+Number(m[2]??m[1]))/2:0;}
export async function fetchCorridorWeather(){
  return Promise.all(POINTS.map(async p=>{
    try{const headers={'User-Agent':'PlatteCraneLive/0.1 (https://chrisizworski.com; public-data client)','Accept':'application/geo+json'};
      const meta=await fetch(`https://api.weather.gov/points/${p.lat},${p.lon}`,{headers,next:{revalidate:86400},signal:AbortSignal.timeout(5000)}); if(!meta.ok) throw new Error('points'); const mj=await meta.json();
      const hourly=await fetch(mj.properties.forecastHourly,{headers,next:{revalidate:900},signal:AbortSignal.timeout(6000)}); if(!hourly.ok) throw new Error('hourly'); const hj=await hourly.json();
      const hours:WeatherHour[]=(hj.properties.periods??[]).slice(0,36).map((x:any)=>({startTime:x.startTime,temperature:x.temperature,temperatureUnit:x.temperatureUnit,windSpeedMph:speed(x.windSpeed),windDirectionDeg:windDeg(x.windDirection),precipProbability:x.probabilityOfPrecipitation?.value??null,skyCover:null,relativeHumidity:x.relativeHumidity?.value??null,shortForecast:x.shortForecast}));
      return {...p,hours,updatedAt:hj.properties.updateTime??new Date().toISOString(),source:'https://api.weather.gov/'};
    }catch{return {...p,hours:[] as WeatherHour[],updatedAt:null,source:'https://api.weather.gov/'};}
  }));
}
export async function fetchActiveAlerts(){
  try{const r=await fetch('https://api.weather.gov/alerts/active?point=40.75,-98.85',{headers:{'User-Agent':'PlatteCraneLive/0.1 (https://chrisizworski.com)'},next:{revalidate:300},signal:AbortSignal.timeout(5000)}); if(!r.ok)return[]; const j=await r.json(); return (j.features??[]).map((f:any)=>({event:f.properties.event,severity:f.properties.severity,headline:f.properties.headline,expires:f.properties.expires}));}catch{return[];}
}
