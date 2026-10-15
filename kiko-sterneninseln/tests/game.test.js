import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,validateLevels} from '../src/data.js';
import {SaveManager} from '../src/save.js';

test('all eight levels have reachable chained platforms, five crystals and three stars',()=>{
 assert.equal(levels.length,8);assert.ok(validateLevels());
 for(const l of levels){assert.equal(l.crystals.length,5);assert.equal(l.stars.length,3);assert.ok(l.portal[1]>l.path[4][1]);for(let i=1;i<5;i++){const a=l.path[i-1],b=l.path[i];const dx=Math.max(0,Math.abs(a[0]-b[0])-(a[2]+b[2])/2),dz=Math.max(0,Math.abs(a[1]-b[1])-(a[3]+b[3])/2);assert.ok(Math.hypot(dx,dz)<2.5,`${l.name}: jump ${i}`);assert.ok(b[4]-a[4]<1)}}
});
test('save validation, unlock and best score',()=>{
 const storage=new Map;globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};let s=new SaveManager;assert.equal(s.data.unlocked,1);s.finish(0,2,500);s.finish(0,1,300);assert.equal(s.data.unlocked,2);assert.equal(s.data.stars[0],2);assert.equal(s.data.best[0],500);storage.set('kiko-sterneninseln-v1','{bad');s=new SaveManager;assert.equal(s.data.unlocked,1);s.reset();assert.equal(s.data.unlocked,1)
});
