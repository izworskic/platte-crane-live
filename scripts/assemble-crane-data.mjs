import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const files=fs.readdirSync(path.join(root,'data')).filter(f=>/^crane-counts-\d{4}-\d{4}\.json$/.test(f)).sort();
const all=files.flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'data',f),'utf8'))).sort((a,b)=>a.date.localeCompare(b.date)||a.surveyWeek-b.surveyWeek);
fs.writeFileSync(path.join(root,'data','crane-counts.json'),JSON.stringify(all,null,2)+'\n'); console.log(`assembled ${all.length} crane survey records from ${files.length} shards`);
