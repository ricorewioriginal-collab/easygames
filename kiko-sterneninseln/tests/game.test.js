import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,validateLevels,LEVEL_COUNT,LEGACY_LEVEL_MAP} from '../src/data.js';
import {SaveManager} from '../src/save.js';

test('all 20 unique levels have reachable chained platforms, five crystals and three stars',()=>{
 assert.equal(levels.length,20);assert.ok(validateLevels());
 for(const l of levels){assert.equal(l.crystals.length,5);assert.equal(l.stars.length,3);assert.ok(l.portal[1]>l.path.at(-1)[1]);for(let i=1;i<l.path.length;i++){const a=l.path[i-1],b=l.path[i];const dx=Math.max(0,Math.abs(a[0]-b[0])-(a[2]+b[2])/2),dz=Math.max(0,Math.abs(a[1]-b[1])-(a[3]+b[3])/2);assert.ok(Math.hypot(dx,dz)<2.5,`${l.name}: jump ${i}`);assert.ok(b[4]-a[4]<1)}}
});
test('save validation, unlock and best score',()=>{
 const storage=new Map;globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};let s=new SaveManager;assert.equal(s.data.unlocked,1);s.finish(0,2,500);s.finish(0,1,300);assert.equal(s.data.unlocked,2);assert.equal(s.data.stars[0],2);assert.equal(s.data.best[0],500);storage.set('kiko-sterneninseln-v1','{bad');s=new SaveManager;assert.equal(s.data.unlocked,1);s.reset();assert.equal(s.data.unlocked,1)
});

test('legacy eight-level saves migrate every result to its matching level without losing the chosen figure',()=>{const values=new Map;globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};const old={version:1,unlocked:8,character:'mira',stars:[1,2,3,1,2,3,2,3],best:[500,600,700,800,900,1000,1100,1200],records:Array.from({length:8},(_,i)=>({medal:2,time:40+i,runs:1})),settings:{music:.2},keys:{jump:'KeyJ'}};values.set('kiko-sterneninseln-v1',JSON.stringify(old));const s=new SaveManager;assert.equal(s.data.version,2);assert.equal(s.data.unlocked,20);assert.equal(s.data.character,'mira');assert.equal(s.data.settings.music,.2);assert.equal(s.data.keys.jump,'KeyJ');assert.equal(s.data.best.length,20);for(let i=0;i<8;i++){const j=LEGACY_LEVEL_MAP[i];assert.equal(s.data.best[j],old.best[i]);assert.equal(s.data.stars[j],old.stars[i]);assert.equal(s.data.records[j].time,old.records[i].time)}assert.equal(s.nextLevel(),2);s.write();const again=new SaveManager;assert.deepEqual(again.data,s.data)});
