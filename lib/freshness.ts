import type { FreshnessState } from './types';
export function freshness(iso: string | null, now = new Date(), kind: 'weather'|'river'|'survey'|'drought'='weather'): FreshnessState {
  if (!iso) return 'UNAVAILABLE';
  const age=(now.getTime()-new Date(iso).getTime())/36e5;
  const limits = kind==='survey' ? [36,168,336] : kind==='drought' ? [72,240,504] : [1,3,12];
  if (age <= limits[0]) return 'LIVE';
  if (age <= limits[1]) return 'RECENT';
  if (age <= limits[2]) return 'AGING';
  return 'STALE';
}
export function ageLabel(iso: string | null, now=new Date()) {
  if(!iso) return 'Unavailable';
  const min=Math.max(0,Math.round((now.getTime()-new Date(iso).getTime())/60000));
  if(min<60) return `Updated ${min} min ago`;
  const hr=Math.round(min/60); if(hr<48) return `Updated ${hr} hr ago`;
  return `Updated ${Math.round(hr/24)} days ago`;
}
