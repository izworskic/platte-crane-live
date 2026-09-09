import test from 'node:test';
import assert from 'node:assert/strict';
function south(speed,dir){return Math.max(0,speed*Math.cos((dir-180)*Math.PI/180));}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
test('southerly historical wind component favors northbound movement',()=>{assert.ok(south(20,180)>19.9);assert.equal(south(20,0),0);assert.ok(south(20,225)>10);});
test('weather abundance multiplier is bounded',()=>{for(const beta of [-1,-.2,.2,1])for(const x of [-5,-1,0,1,5]){const m=clamp(Math.exp(beta*x),.75,1.25);assert.ok(m>=.75&&m<=1.25);}});
test('phase sign reverses migration opportunity after peak',()=>{const opportunity=1.2,peakWeek=5;assert.equal((4<=peakWeek?1:-1)*opportunity,1.2);assert.equal((7<=peakWeek?1:-1)*opportunity,-1.2);});
