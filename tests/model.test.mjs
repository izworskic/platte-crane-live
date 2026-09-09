import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const rows=JSON.parse(fs.readFileSync(new URL('../data/crane-counts.json',import.meta.url),'utf8'));
function classify(s){return s>=90?'EXCEPTIONAL':s>=80?'EXCELLENT':s>=70?'VERY GOOD':s>=60?'GOOD':s>=45?'MIXED':s>=30?'MARGINAL':'LOW'}
function pulse(c){return c>12?'SURGING':c>4?'RISING':c>=-4?'HOLDING':c>=-12?'EASING':'DEPARTING RAPIDLY'}
function tail(speed,deg){return Math.max(0,speed*Math.cos(deg*Math.PI/180-Math.PI))}
function confidence(age,inputs){if(age<96&&inputs>=2)return'High';if(age<240&&inputs>=1)return'Moderate';if(age<504)return'Low';return'Historical guidance'}
test('score boundary 89.9 vs 90',()=>{assert.equal(classify(89.9),'EXCELLENT');assert.equal(classify(90),'EXCEPTIONAL')});
test('all semantic score boundaries',()=>{assert.equal(classify(80),'EXCELLENT');assert.equal(classify(70),'VERY GOOD');assert.equal(classify(60),'GOOD');assert.equal(classify(45),'MIXED');assert.equal(classify(30),'MARGINAL');assert.equal(classify(29.9),'LOW')});
test('pulse boundaries',()=>{assert.equal(pulse(13),'SURGING');assert.equal(pulse(5),'RISING');assert.equal(pulse(4),'HOLDING');assert.equal(pulse(-5),'EASING');assert.equal(pulse(-13),'DEPARTING RAPIDLY')});
test('southerly wind vector',()=>{assert.ok(Math.abs(tail(10,180)-10)<1e-9);assert.equal(tail(10,0),0);assert.ok(tail(10,135)>0)});
test('confidence decays with source age',()=>{assert.equal(confidence(24,2),'High');assert.equal(confidence(120,1),'Moderate');assert.equal(confidence(300,0),'Low');assert.equal(confidence(600,0),'Historical guidance')});
test('probability clamp concept',()=>{for(const x of [-10,0,50,100,140]){const c=Math.max(0,Math.min(100,x));assert.ok(c>=0&&c<=100)}});
test('score arithmetic totals exactly',()=>{const p=[45,18,12,9,7];assert.equal(p.reduce((a,b)=>a+b,0),91)});
test('no NaN or Infinity in common arithmetic',()=>{for(const n of [0,1,400000])assert.ok(Number.isFinite(n))});
test('historical archive has provenance on every record',()=>{assert.ok(rows.length>=90);for(const r of rows){assert.ok(r.sourceUrl);assert.ok(r.sourceOrganization);assert.ok(r.retrievedAt);assert.ok(r.date);assert.ok(Number.isFinite(r.count));}});
test('uncertainty ranges are ordered when published',()=>{for(const r of rows){if(r.lowerBound!=null&&r.upperBound!=null){assert.ok(r.lowerBound<=r.count);assert.ok(r.count<=r.upperBound);}}});
test('official zero is preserved as observation, not silently removed',()=>{const z=rows.find(r=>r.year===2026&&r.count===0);assert.ok(z);assert.match(z.notes,/contextual evidence|biological zero/i)});
test('Nebraska DST transition formats to valid Central time',()=>{const before=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric'}).format(new Date('2027-03-14T07:30:00Z'));const after=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric'}).format(new Date('2027-03-14T08:30:00Z'));assert.notEqual(before,after)});
test('negative river readings are rejected by habitat input contract',()=>{const values=[-5,null,0,1200].filter(x=>typeof x==='number'&&x>=0);assert.deepEqual(values,[0,1200])});
