import type {MetadataRoute} from 'next';
const publicUrl='https://chrisizworski.com/national-tools/platte-crane-live';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/'},sitemap:`${publicUrl}/sitemap.xml`}}
