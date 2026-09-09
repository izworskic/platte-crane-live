import {NextResponse} from 'next/server';
import counts from '@/data/crane-counts.json';
import type {CraneSurvey} from '@/lib/types';
import {discoverCurrentYearSurveys} from '@/lib/sources/craneTrust';
import {fetchRiverGauges} from '@/lib/sources/usgs';
import {fetchActiveAlerts,fetchCorridorWeather} from '@/lib/sources/nws';
import {estimateCurrentAbundance} from '@/lib/models/currentAbundance';
import {classifyPulse,confidenceFromSurvey,movementPotential,riverHabitat,roostOutlook,safetyOverride} from '@/lib/models/core';
import {seasonMode} from '@/lib/models/climatology';
const archived=counts as CraneSurvey[];
export async function GET(){const now=new Date(),year=now.getUTCFullYear();const [live,gauges,weather,alerts]=await Promise.all([discoverCurrentYearSurveys(year),fetchRiverGauges(),fetchCorridorWeather(),fetchActiveAlerts()]);const map=new Map<string,CraneSurvey>();for(const r of [...archived,...live])map.set(`${r.year}-${r.surveyWeek}-${r.count}`,r);const all=[...map.values()];const current=all.filter(r=>r.year===year).sort((a,b)=>a.date.localeCompare(b.date));const latest=current.at(-1)??null;const mode=seasonMode(now,!!latest&&now.getUTCMonth()<=4);const abundance=mode==='SPRING_LIVE'?estimateCurrentAbundance(all,now):null;const gibbon=weather.find(w=>w.key==='gibbon');const movement=movementPotential(gibbon?.hours?.[0],.5);const river=riverHabitat(gauges);const safety=safetyOverride(alerts);const confidence=abundance?confidenceFromSurvey(abundance.dataAgeHours,[gibbon?.hours?.length?1:0,gauges.filter(g=>g.discharge!=null).length>=2?1:0].reduce((a,b)=>a+b,0)):'Historical guidance';const outlook=abundance?roostOutlook(Math.min(45,Math.round(abundance.medianEstimate/15000)),18,river.score,10,confidence==='High'?10:confidence==='Moderate'?8:5,safety.unsafe):null;return NextResponse.json({mode,latestOfficial:latest,modeled:abundance?{...abundance,label:'Modeled estimate — not a live count'}:null,migrationPulse:abundance?classifyPulse(abundance.change48hPct):null,movement,river,outlook,safety,confidence,generatedAt:now.toISOString()});}
