import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const scenarios=JSON.parse(fs.readFileSync(new URL('./fixtures/scenarios.json',import.meta.url),'utf8'));
test('all 20 required deterministic scenarios exist with useful fallback states',()=>{assert.equal(scenarios.length,20);assert.equal(new Set(scenarios.map(s=>s.id)).size,20);for(const s of scenarios){assert.ok(s.name);assert.ok(s.mode);assert.ok(s.usefulState);}});
test('safety fixture overrides normal trip advice',()=>{const s=scenarios.find(x=>x.id==='severe-warning');assert.match(s.safety,/Warning/);assert.match(s.usefulState,/unsafe/i)});
test('all-source outage fixture never becomes zero-count state',()=>{const s=scenarios.find(x=>x.id==='all-outage');assert.equal(s.mode,'HISTORICAL_GUIDANCE');assert.equal('count' in s,false);assert.match(s.usefulState,/without misleading zeros/i)});
test('off-season fixture suppresses fake live probability',()=>{const s=scenarios.find(x=>x.id==='september-offseason');assert.equal(s.mode,'OFF_SEASON');assert.match(s.usefulState,/no live probability/i)});
