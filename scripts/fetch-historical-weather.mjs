import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'data', 'historical-weather-era5.json');
const START_YEAR = Number(process.env.WEATHER_START_YEAR || 2016);
const END_YEAR = Number(process.env.WEATHER_END_YEAR || 2025);
const LOCATIONS = [
  { key: 'grand-island', name: 'Grand Island', lat: 40.9264, lon: -98.3420 },
  { key: 'gibbon-rowe', name: 'Gibbon / Rowe', lat: 40.7478, lon: -98.8446 },
  { key: 'kearney', name: 'Kearney', lat: 40.6993, lon: -99.0817 },
];
const DAILY = [
  'temperature_2m_mean','temperature_2m_max','precipitation_sum','precipitation_hours','cloud_cover_mean','wind_speed_10m_mean','wind_speed_10m_max','wind_direction_10m_dominant','sunshine_duration','shortwave_radiation_sum',
];
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function finiteOrNull(v){return Number.isFinite(Number(v))?Number(v):null;}
async function fetchJson(url,attempts=4){let last;for(let i=0;i<attempts;i++){try{const r=await fetch(url,{headers:{'User-Agent':'PlatteCraneLiveHistoricalBacktest/1.0 (+https://github.com/izworskic/platte-crane-live)'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`HTTP ${r.status}: ${await r.text()}`);return await r.json();}catch(err){last=err;if(i<attempts-1)await sleep(800*(i+1));}}throw last;}
async function main(){const rows=[],requestLog=[];for(const loc of LOCATIONS){for(let year=START_YEAR;year<=END_YEAR;year++){const params=new URLSearchParams({latitude:String(loc.lat),longitude:String(loc.lon),start_date:`${year}-02-01`,end_date:`${year}-04-15`,daily:DAILY.join(','),timezone:'America/Chicago',temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'inch',models:'era5'});const url=`https://archive-api.open-meteo.com/v1/archive?${params}`;const j=await fetchJson(url);const d=j.daily||{};if(!Array.isArray(d.time))throw new Error(`Missing daily data for ${loc.key} ${year}`);for(let i=0;i<d.time.length;i++)rows.push({date:d.time[i],year,location:loc.key,latitude:loc.lat,longitude:loc.lon,temperatureMeanF:finiteOrNull(d.temperature_2m_mean?.[i]),temperatureMaxF:finiteOrNull(d.temperature_2m_max?.[i]),precipitationIn:finiteOrNull(d.precipitation_sum?.[i]),precipitationHours:finiteOrNull(d.precipitation_hours?.[i]),cloudCoverMeanPct:finiteOrNull(d.cloud_cover_mean?.[i]),windSpeedMeanMph:finiteOrNull(d.wind_speed_10m_mean?.[i]),windSpeedMaxMph:finiteOrNull(d.wind_speed_10m_max?.[i]),windDirectionDominantDeg:finiteOrNull(d.wind_direction_10m_dominant?.[i]),sunshineDurationSeconds:finiteOrNull(d.sunshine_duration?.[i]),shortwaveRadiationSum:finiteOrNull(d.shortwave_radiation_sum?.[i])});requestLog.push({location:loc.key,year,generationtime_ms:j.generationtime_ms??null,gridLatitude:j.latitude??null,gridLongitude:j.longitude??null,elevation:j.elevation??null});console.log(`fetched ${loc.key} ${year}: ${d.time.length} days`);await sleep(150);}}
const payload={schemaVersion:1,source:'Open-Meteo Historical Weather API using ECMWF ERA5 reanalysis',sourceDocumentation:'https://open-meteo.com/en/docs/historical-weather-api',upstreamDataset:'ECMWF ERA5',purpose:'Retrospective model validation only. Live product weather remains NOAA/NWS.',retrievedAt:new Date().toISOString(),period:{startYear:START_YEAR,endYear:END_YEAR,seasonStart:'02-01',seasonEnd:'04-15'},locations:LOCATIONS,requestLog,rows};fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(payload,null,2)+'\n');console.log(`wrote ${rows.length} daily location records to ${OUT}`);}
main().catch(err=>{console.error(err);process.exit(1);});
