import type { CraneSurvey } from '@/lib/types';
import { median, quantile } from './core';
export function weeklyClimatology(all:CraneSurvey[]){return Array.from({length:9},(_,i)=>i+1).map(week=>{const vals=all.filter(r=>r.year>=2016&&r.year<=2025&&r.surveyWeek===week).map(r=>r.count); return {week,median:median(vals),p20:quantile(vals,.2),p80:quantile(vals,.8),min:Math.min(...vals),max:Math.max(...vals),variance:vals.reduce((s,x)=>s+(x-median(vals))**2,0)/(vals.length||1)};});}
export function seasonMode(now=new Date(),hasCurrentSurvey=false){const m=now.getMonth()+1; if(hasCurrentSurvey||m===2||m===3||m===4)return'SPRING_LIVE'; if(m===11||m===12||m===1)return'WINTER_WATCH'; return'OFF_SEASON';}
