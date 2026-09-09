import counts from '@/data/crane-counts.json';
import type { CraneSurvey } from '@/lib/types';

const staticCounts = counts as CraneSurvey[];
const COUNT_PATTERNS = [
  /(?:estimated?|estimate(?:d)?\s+(?:there\s+are|of)?|count(?:ed)?|total(?:\s+estimate)?(?:\s+of)?)(?:\s+at\s+least)?\s*([0-9][0-9,]{2,})\s*(?:\+\/-|\+\/−|±|\+)?\s*([0-9][0-9,]{1,})?/i,
  /([0-9][0-9,]{2,})\s*(?:\+\/-|\+\/−|±)\s*([0-9][0-9,]{1,})/i
];

export function historicalSurveys() { return staticCounts; }
export function latestVerifiedSurvey(now = new Date()) {
  return staticCounts.filter(r => new Date(r.date) <= now).sort((a,b)=>b.date.localeCompare(a.date))[0] ?? null;
}

function plain(html:string){ return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim(); }
function parseCount(text:string){ for(const re of COUNT_PATTERNS){ const m=text.match(re); if(m){ const count=Number(m[1].replaceAll(',','')); const error=m[2]?Number(m[2].replaceAll(',','')):null; if(Number.isFinite(count)&&count>=0) return {count,error:Number.isFinite(error as number)?error:null}; } } return null; }
function parseWeek(title:string, text:string){ const m=(title+' '+text.slice(0,500)).match(/week\s*(\d{1,2})/i); return m?Number(m[1]):0; }
function inferredWeek(date:string){ const d=new Date(`${date}T12:00:00Z`); const start=new Date(Date.UTC(d.getUTCFullYear(),1,8)); return Math.max(1,Math.min(10,Math.floor((d.getTime()-start.getTime())/604800000)+1)); }

export async function discoverCurrentYearSurveys(year:number): Promise<CraneSurvey[]> {
  const query=encodeURIComponent(`${year} spring crane migration`);
  const search=`https://www.cranetrust.org/wp-json/wp/v2/search?search=${query}&per_page=50`;
  try{
    const r=await fetch(search,{next:{revalidate:1800},signal:AbortSignal.timeout(6500)}); if(!r.ok) return [];
    const hits=await r.json(); const found:CraneSurvey[]=[];
    for(const h of hits){
      const pr=await fetch(`https://www.cranetrust.org/wp-json/wp/v2/posts/${h.id}`,{next:{revalidate:1800},signal:AbortSignal.timeout(5000)}); if(!pr.ok) continue;
      const p=await pr.json(); const title=plain(p.title?.rendered??''); const text=plain(p.content?.rendered??''); const parsed=parseCount(text); if(!parsed) continue;
      const publicationDate=(p.date_gmt??p.date)?.slice(0,10); if(!publicationDate?.startsWith(String(year))) continue;
      const week=parseWeek(title,text)||inferredWeek(publicationDate); const error=parsed.error;
      found.push({date:publicationDate,datePrecision:'publication-date-proxy',year,surveyWeek:week,count:parsed.count,lowerBound:error!=null?Math.max(0,parsed.count-error):null,upperBound:error!=null?parsed.count+error:null,error,surveyType:'Crane Trust public-update abundance index',sourceUrl:p.link,sourceOrganization:'Crane Trust',retrievedAt:new Date().toISOString(),notes:`Automatically discovered from Crane Trust public update “${title}”. Publication date is used unless the update supplies a structured survey date. Parser is conservative.`});
    }
    const dedup=new Map<string,CraneSurvey>(); for(const row of found){ const key=`${row.surveyWeek}-${row.count}`; if(!dedup.has(key)||row.date<dedup.get(key)!.date) dedup.set(key,row); }
    return [...dedup.values()].sort((a,b)=>a.date.localeCompare(b.date));
  }catch{return [];}
}

export async function discoverCurrentYearSurvey(year:number): Promise<CraneSurvey|null>{
  const rows=await discoverCurrentYearSurveys(year); return rows.at(-1)??null;
}

export interface DistributionNarrative {text:string;date:string|null;keywords:string[];sourceUrl:string|null;}
const DISTRIBUTION_TERMS=['grand island','alda','wood river','shelton','gibbon','rowe','kearney','overton','highway 10','hwy 10','minden','highway 281','hwy 281','prosser','chapman'];
function narrativeSentence(text:string){const sentences=text.split(/(?<=[.!?])\s+/).filter(s=>s.length>=35&&s.length<=420); return sentences.find(s=>DISTRIBUTION_TERMS.some(k=>s.toLowerCase().includes(k))&&/(crane|roost|concentrat|distribution|majority|most|birds)/i.test(s))??null;}
export async function discoverCurrentYearDistribution(year:number):Promise<DistributionNarrative|null>{
  const query=encodeURIComponent(`${year} spring crane migration`); const search=`https://www.cranetrust.org/wp-json/wp/v2/search?search=${query}&per_page=30`;
  try{const r=await fetch(search,{next:{revalidate:1800},signal:AbortSignal.timeout(6500)});if(!r.ok)return null;const hits=await r.json() as Array<{id:number}>; const candidates:Array<DistributionNarrative&{sortDate:string}>=[];
    for(const h of hits.slice(0,18)){const pr=await fetch(`https://www.cranetrust.org/wp-json/wp/v2/posts/${h.id}`,{next:{revalidate:1800},signal:AbortSignal.timeout(5000)});if(!pr.ok)continue;const p=await pr.json();const text=plain(p.content?.rendered??'');const sentence=narrativeSentence(text);const date=(p.date_gmt??p.date)?.slice(0,10);if(!sentence||!date?.startsWith(String(year)))continue;const keywords=DISTRIBUTION_TERMS.filter(k=>sentence.toLowerCase().includes(k)).map(k=>k.replace(/^hwy /,'highway ')); candidates.push({text:sentence,date,keywords:[...new Set(keywords)],sourceUrl:p.link??null,sortDate:date});}
    const latest=candidates.sort((a,b)=>b.sortDate.localeCompare(a.sortDate))[0];if(!latest)return null;const {sortDate:_,...out}=latest;void _;return out;
  }catch{return null;}
}
