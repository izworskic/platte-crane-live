import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{const b=process.env.NEXT_PUBLIC_SITE_URL||'https://platte-crane-live.vercel.app';return [
{url:b,changeFrequency:'daily',priority:1},
{url:`${b}/crane-counts-nebraska`,changeFrequency:'daily',priority:.9},
{url:`${b}/best-time-to-see-sandhill-cranes-nebraska`,changeFrequency:'weekly',priority:.85},
{url:`${b}/platte-river-crane-viewing-map`,changeFrequency:'weekly',priority:.85},
{url:`${b}/methodology`,changeFrequency:'monthly',priority:.6}
]}
