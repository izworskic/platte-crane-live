import {NextResponse} from 'next/server';
import counts from '@/data/crane-counts.json';
import sites from '@/data/viewing-sites.json';
import type {CraneSurvey,WeatherHour} from '@/lib/types';
import {discoverCurrentYearDistribution,discoverCurrentYearSurveys} from '@/lib/sources/craneTrust';
import {fetchRiverGauges} from '@/lib/sources/usgs';
import {fetchActiveAlerts,fetchCorridorWeather} from '@/lib/sources/nws';
import {fetchDroughtStates} from '@/lib/sources/droughtMonitor';
import {fetchDailyTemperatureNormals,temperatureDepartureF} from '@/lib/sources/climateNormals';
import {estimateCurrentAbundance} from '@/lib/models/currentAbundance';
import {classifyPulse,confidenceFromSurvey,movementPotential,riverHabitat,roostOutlook,safetyOverride} from '@/lib/models/core';
import {seasonMode} from '@/lib/models/climatology';
import {dailyHistoricalClimatology} from '@/lib/models/dailyClimatology';
import {preseasonTimingPressure} from '@/lib/models/seasonTiming';
import {rankViewingSites,type ViewingSite} from '@/lib/models/siteRanking';
import {solarTimes} from '@/lib/astronomy/solar';
const archived=counts as CraneSurvey[];
function closest(hours:WeatherHour[]|undefined,iso:string|null){if(!hours?.length)return undefined;if(!iso)return hours[0];const t=new Date(iso).getTime();return [...hours].sort((a,b)=>Math.abs(new Date(a.startTime).getTime()-t)-Math.abs(new Date(b.startTime).getTime()-t))[0];}
function merge(base:CraneSurvey[],live:CraneSurvey[]){const m=new Map<string,CraneSurvey>();for(const r of [...base,...live])m.set(`${r.year}-${r.surveyWeek}-${r.count}`,r);return [...m.values()].sort((a,b)=>a.date.localeCompare(b.date));}
export async function GET(){
  const now=new Date(),year=now.getUTCFullYear(),solar=solarTimes(now);
  const [live,gauges,weather,alerts,drought,distribution,normals]=await Promise.all([discoverCurrentYearSurveys(year),fetchRiverGauges(),fetchCorridorWeather(),fetchActiveAlerts(),fetchDroughtStates(),discoverCurrentYearDistribution(year),fetchDailyTemperatureNormals(now)]);
  const all=merge(archived,live),current=all.filter(r=>r.year===year).sort((a,b)=>a.date.localeCompare(b.date)),latest=current.at(-1)??null; const mode=seasonMode(now,!!latest&&now.getUTCMonth()<=4); const river=riverHabitat(gauges),gibbon=weather.find(w=>w.key==='gibbon'); const warmest=(gibbon?.hours??[]).slice(0,18).reduce<WeatherHour|undefined>((best,h)=>!best||h.temperature>best.temperature?h:best,undefined); const progress=Math.max(0,Math.min(1,(now.getTime()-Date.UTC(year,1,15))/(Date.UTC(year,3,10)-Date.UTC(year,1,15)))); const movement=movementPotential(warmest,progress); const tempDeparture=temperatureDepartureF(gibbon?.hours??[],normals,now); const abundance=mode==='SPRING_LIVE'?estimateCurrentAbundance(all,now,{movementScore:movement.score,tempDepartureF:tempDeparture?.departureF??null,precipProbability:warmest?.precipProbability??null,seasonProgress:progress}):null; const safety=safetyOverride(alerts); const confidence=abundance?confidenceFromSurvey(abundance.dataAgeHours,[gibbon?.hours?.length?1:0,gauges.filter(g=>g.discharge!=null).length>=2?1:0].reduce((a,b)=>a+b,0)):'Historical guidance'; const histPeak=Math.max(...dailyHistoricalClimatology(all).map(x=>x.median)); const evening=closest(gibbon?.hours,solar.sunset); const weatherPoints=evening?Math.max(0,Math.min(20,Math.round(20-(evening.precipProbability??0)*.12-Math.max(0,evening.windSpeedMph-25)*.3))):8; const abundancePoints=abundance?Math.round(Math.min(45,45*abundance.medianEstimate/Math.max(1,histPeak))):0; const outlook=abundance?roostOutlook(abundancePoints,weatherPoints,river.score,10,confidence==='High'?10:confidence==='Moderate'?8:confidence==='Low'?5:3,safety.unsafe):null; const timing=preseasonTimingPressure(now,current,all,drought); const dusk=rankViewingSites(sites as ViewingSite[],'dusk',weather,gauges,distribution,river.score,solar.sunset)[0]??null; const dawn=rankViewingSites(sites as ViewingSite[],'dawn',weather,gauges,distribution,river.score,solar.sunrise)[0]??null;
  return NextResponse.json({mode,latestOfficial:latest,modeled:abundance?{...abundance,label:'Modeled estimate — not a live count'}:null,migrationPulse:abundance?classifyPulse(abundance.change48hPct):null,movement,temperatureDeparture:tempDeparture,seasonTiming:timing,distribution,river,outlook,safety,confidence,recommendations:mode==='SPRING_LIVE'?{dusk,dawn}:null,generatedAt:now.toISOString()});
}
