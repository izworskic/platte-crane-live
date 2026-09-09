import type {CraneSurvey} from '@/lib/types';
import {median,quantile} from './core';
import {historicalForDate} from './dailyClimatology';

export interface OperationalContext {
  movementScore?:number|null;
  tempDepartureF?:number|null;
  precipProbability?:number|null;
  seasonProgress?:number;
}
export interface CurrentAbundanceEstimate {
  medianEstimate:number;
  p10:number;
  p25:number;
  p75:number;
  p90:number;
  change48hPct:number;
  peakProbability:number;
  dataAgeHours:number;
  primaryDrivers:string[];
  operationalAdjustmentPct:number;
}

export function estimateCurrentAbundance(all:CraneSurvey[],now=new Date(),_ctx?:OperationalContext):CurrentAbundanceEstimate|null{
  void _ctx;
  const year=now.getUTCFullYear();
  const current=all.filter(r=>r.year===year&&r.surveyWeek>0).sort((a,b)=>a.date.localeCompare(b.date));
  if(current.length<2)return null;
  const latest=current.at(-1)!;
  const ageHours=Math.max(0,(now.getTime()-new Date(`${latest.date}T12:00:00Z`).getTime())/36e5);
  if(ageHours>24*18)return null;
  const hist=all.filter(r=>r.year>=2016&&r.year<=2025);
  const years=[...new Set(hist.map(r=>r.year))];
  const ratios=years.map(y=>{const a=hist.find(r=>r.year===y&&r.surveyWeek===latest.surveyWeek)?.count;const b=hist.find(r=>r.year===y&&r.surveyWeek===latest.surveyWeek+1)?.count;return a!=null&&a>0&&b!=null?b/a:null;}).filter((x):x is number=>x!=null&&Number.isFinite(x)&&x>=0);
  if(ratios.length<4)return null;
  const daily=historicalForDate(all,now);
  const histPeak=median(years.map(y=>Math.max(...hist.filter(r=>r.year===y).map(r=>r.count))).filter(Number.isFinite));
  const days=Math.min(10,ageHours/24);
  const frac=Math.max(0,days/7);
  let seed=year*1000+latest.surveyWeek*17+Math.round(days*10);
  const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const paths:number[]=[];
  const changes:number[]=[];
  for(let i=0;i<2500;i++){
    const ratio=Math.max(.02,ratios[Math.floor(rnd()*ratios.length)]);
    const uncertainty=.94+rnd()*.12+(Math.min(1,days/10))*(rnd()-.5)*.18;
    const historicalPull=daily?.median??latest.count;
    const transition=latest.count*Math.pow(ratio,frac);
    const base=.84*transition+.16*historicalPull;
    const projected=Math.max(0,base*uncertainty);
    const projected48=Math.max(0,projected*Math.pow(ratio,2/7));
    paths.push(projected);
    changes.push(projected>0?(projected48/projected-1)*100:0);
  }
  const round5=(n:number)=>Math.max(0,Math.round(n/5000)*5000);
  const peakProbability=Math.round(paths.filter(v=>v>=.85*histPeak).length/paths.length*100);
  const drivers=[
    `Latest official survey: ${latest.count.toLocaleString()} on ${latest.date}.`,
    'Backtested survey-transition base uses comparable 2016–2025 seasons plus the daily historical migration shape.',
    'Weather is intentionally not used to alter abundance in this release: the ERA5 leave-one-year-out experiment improved median error only 2.55% while worsening mean error, log error, peak classification, and interval coverage. Weather remains a separate movement/outlook signal.',
    ageHours>120?'Survey age is widening uncertainty.':'Recent survey age supports narrower uncertainty.',
  ];
  return {medianEstimate:round5(median(paths)),p10:round5(quantile(paths,.10)),p25:round5(quantile(paths,.25)),p75:round5(quantile(paths,.75)),p90:round5(quantile(paths,.90)),change48hPct:Math.round(median(changes)*10)/10,peakProbability,dataAgeHours:ageHours,primaryDrivers:drivers,operationalAdjustmentPct:0};
}
