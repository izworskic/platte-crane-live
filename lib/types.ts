export type FreshnessState = 'LIVE'|'RECENT'|'AGING'|'STALE'|'UNAVAILABLE';
export type Confidence = 'High'|'Moderate'|'Low'|'Historical guidance';
export interface CraneSurvey { date:string; datePrecision:'exact'|'survey-week-bin'|'publication-date-proxy'; year:number; surveyWeek:number; count:number; lowerBound:number|null; upperBound:number|null; error:number|null; surveyType:string; sourceUrl:string; sourceOrganization:string; retrievedAt:string; notes:string; }
export interface RiverGauge { site:string; name:string; discharge:number|null; gageHeight:number|null; waterTempC:number|null; observedAt:string|null; qualifiers:string[]; freshness:FreshnessState; sourceUrl:string; }
export interface WeatherHour { startTime:string; temperature:number; temperatureUnit:string; windSpeedMph:number; windDirectionDeg:number; precipProbability:number|null; skyCover:number|null; relativeHumidity:number|null; shortForecast:string; }
