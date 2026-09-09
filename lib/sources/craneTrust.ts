import counts from '@/data/crane-counts.json'; import type { CraneSurvey } from '@/lib/types';
const staticCounts=counts as CraneSurvey[];
const COUNT_RE=/(?:estimated?|estimate there are|count(?:ed)?)(?:\s+at least)?\s+([0-9,]{3,})\s*(?:\+\/-|\+\/−|±|\+)?\s*([0-9,]{2,})?/i;
export function historicalSurveys(){return staticCounts;}
export function latestVerifiedSurvey(now=new Date()){return staticCounts.filter(r=>new Date(r.date)<=now).sort((a,b)=>b.date.localeCompare(a.date))[0]??null;}
export async function discoverCurrentYearSurvey(year:number): Promise<CraneSurvey|null>{
  const q=encodeURIComponent(`${year} Spring Crane Migration`); const search=`https://www.cranetrust.org/wp-json/wp/v2/search?search=${q}&per_page=20`;
  try{const r=await fetch(search,{next:{revalidate:1800},signal:AbortSignal.timeout(6500)}); if(!r.ok) return null; const hits=await r.json();
    for(const h of hits){const pr=await fetch(`https://www.cranetrust.org/wp-json/wp/v2/posts/${h.id}`,{next:{revalidate:1800},signal:AbortSignal.timeout(5000)}); if(!pr.ok) continue; const p=await pr.json(); const text=(p.content?.rendered??'').replace(/<[^>]+>/g,' '); const m=text.match(COUNT_RE); if(!m) continue; const count=Number(m[1].replaceAll(',','')); const error=m[2]?Number(m[2].replaceAll(',','')):null; const date=(p.date_gmt??p.date)?.slice(0,10); if(!date?.startsWith(String(year))) continue;
      return {date,datePrecision:'exact',year,surveyWeek:0,count,lowerBound:error?Math.max(0,count-error):null,upperBound:error?count+error:null,error,surveyType:'Crane Trust public-update abundance index',sourceUrl:p.link,sourceOrganization:'Crane Trust',retrievedAt:new Date().toISOString(),notes:'Automatically discovered from Crane Trust WordPress public update; parser is conservative and requires a count phrase.'}; }
  }catch{} return null;
}
