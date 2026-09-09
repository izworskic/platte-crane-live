import fallback from '@/data/climate-normals.json';

export interface DailyNormal {
  stationId:string;
  stationName:string;
  dateKey:string;
  tmaxNormalF:number|null;
  tavgNormalF:number|null;
  sourceUrl:string;
  basis:'daily-1991-2020'|'monthly-fallback';
}

const STATIONS=[
  {id:'USW00014935',name:'Grand Island Central Nebraska Regional Airport'},
  {id:'USW00014905',name:'Kearney Municipal Airport'},
];

function keyFor(date:Date){return `${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;}
function n(v:unknown){const x=Number(v);return Number.isFinite(x)&&x>-9000?x:null;}
function dateKey(row:Record<string,unknown>){const raw=String(row.DATE??row.date??row.Date??''); const m=raw.match(/(?:\d{4}-)?(\d{2})-(\d{2})$/); return m?`${m[1]}-${m[2]}`:null;}

function monthlyFallback(date:Date):DailyNormal[]{
  if(date.getUTCMonth()!==2)return [];
  return [{stationId:'central-nebraska-representative',stationName:fallback.station,dateKey:keyFor(date),tmaxNormalF:fallback.march.dailyMaxF,tavgNormalF:fallback.march.dailyMeanF,sourceUrl:fallback.sourceUrl,basis:'monthly-fallback'}];
}

export async function fetchDailyTemperatureNormals(date=new Date()):Promise<DailyNormal[]>{
  const wanted=keyFor(date);
  const params=new URLSearchParams({dataset:'normals-daily-1991-2020',stations:STATIONS.map(s=>s.id).join(','),dataTypes:'DLY-TMAX-NORMAL,DLY-TAVG-NORMAL',format:'json',units:'standard'});
  const url=`https://www.ncei.noaa.gov/access/services/data/v1?${params}`;
  try{
    const r=await fetch(url,{next:{revalidate:86400},signal:AbortSignal.timeout(7000)});
    if(!r.ok)throw new Error(`NCEI ${r.status}`);
    const rows=await r.json() as Record<string,unknown>[];
    const out:DailyNormal[]=[];
    for(const st of STATIONS){
      const row=rows.find(x=>String(x.STATION??x.station??'')===st.id&&dateKey(x)===wanted);
      if(!row)continue;
      const normal:DailyNormal={stationId:st.id,stationName:st.name,dateKey:wanted,tmaxNormalF:n(row['DLY-TMAX-NORMAL']),tavgNormalF:n(row['DLY-TAVG-NORMAL']),sourceUrl:url,basis:'daily-1991-2020'};
      if(normal.tmaxNormalF!=null)out.push(normal);
    }
    return out.length?out:monthlyFallback(date);
  }catch{return monthlyFallback(date);}
}

export function forecastDailyMax(hours:{startTime:string;temperature:number}[],date=new Date()){
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'});
  const localKey=fmt.format(date);
  const values=hours.filter(h=>fmt.format(new Date(h.startTime))===localKey).map(h=>h.temperature).filter(Number.isFinite);
  return values.length?Math.max(...values):null;
}

export function temperatureDepartureF(hours:{startTime:string;temperature:number}[],normals:DailyNormal[],date=new Date()){
  const max=forecastDailyMax(hours,date); const daily=normals.filter(n=>n.basis==='daily-1991-2020'&&n.tmaxNormalF!=null); const usable=daily.length?daily:normals.filter(n=>n.tmaxNormalF!=null); if(max==null||!usable.length)return null; const normal=usable.reduce((s,n)=>s+(n.tmaxNormalF??0),0)/usable.length; return {departureF:Math.round((max-normal)*10)/10,forecastMaxF:max,normalMaxF:Math.round(normal*10)/10,basis:daily.length?'NOAA 1991–2020 daily maximum normal':'NOAA 1991–2020 March maximum-normal fallback',sourceUrls:[...new Set(usable.map(n=>n.sourceUrl))]};
}
