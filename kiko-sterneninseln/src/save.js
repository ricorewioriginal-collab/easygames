import {characterById} from './characters.js?v=11';
import {LEVEL_COUNT,LEGACY_LEVEL_MAP} from './data.js?v=11';
// The storage key stays stable so existing Google saves are found and migrated.
export const KEY='kiko-sterneninseln-v1';
export const defaults={version:2,unlocked:1,character:'kiko',tutorialDone:false,records:Array.from({length:LEVEL_COUNT},()=>({medal:0,time:0,runs:0})),stars:Array(LEVEL_COUNT).fill(0),best:Array(LEVEL_COUNT).fill(0),settings:{music:.4,sfx:.6,quality:'auto',language:'de',sensitivity:1},keys:{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',interact:'KeyE'}};
export class SaveManager{
 constructor(){this.reload()}
 reload(){this.data=this.load();try{this.lastStored=localStorage.getItem(KEY)}catch{this.lastStored=null}}
 load(){
  try{
   const d=JSON.parse(localStorage.getItem(KEY)),legacy=d?.version===1&&d.stars?.length===8&&d.best?.length===8;
   if(!d||![1,2].includes(d.version)||!Number.isInteger(d.unlocked)||d.unlocked<1||d.unlocked>(legacy?8:LEVEL_COUNT)||!Array.isArray(d.stars)||!Array.isArray(d.best)||(!legacy&&(d.stars.length!==LEVEL_COUNT||d.best.length!==LEVEL_COUNT)))return structuredClone(defaults);
   const out=structuredClone(defaults);out.unlocked=legacy?LEGACY_LEVEL_MAP[d.unlocked-1]+1:d.unlocked;out.character=characterById(d.character).id;out.tutorialDone=d.tutorialDone===true||d.best[0]>0;
   for(let i=0;i<d.stars.length;i++){const j=legacy?LEGACY_LEVEL_MAP[i]:i,r=d.records?.[i];out.stars[j]=Number.isInteger(d.stars[i])?Math.max(0,Math.min(3,d.stars[i])):0;out.best[j]=Number.isFinite(d.best[i])?Math.max(0,d.best[i]):0;out.records[j]={medal:Number.isInteger(r?.medal)?Math.max(0,Math.min(3,r.medal)):0,time:Number.isFinite(r?.time)?Math.max(0,r.time):0,runs:Number.isInteger(r?.runs)?Math.max(0,r.runs):0}}
   for(const [k,v] of Object.entries(d.settings||{}))if(k in out.settings&&typeof v===typeof out.settings[k]&&(typeof v!=='number'||Number.isFinite(v)))out.settings[k]=v;
   for(const [k,v] of Object.entries(d.keys||{}))if(k in out.keys&&typeof v==='string'&&/^[A-Za-z][A-Za-z0-9]{0,20}$/.test(v))out.keys[k]=v;
   for(const k of ['music','sfx'])out.settings[k]=Math.max(0,Math.min(1,out.settings[k]));out.settings.sensitivity=Math.max(.3,Math.min(2,out.settings.sensitivity));if(!['de','en'].includes(out.settings.language))out.settings.language='de';if(!['auto','low','high'].includes(out.settings.quality))out.settings.quality='auto';return out
  }catch{return structuredClone(defaults)}
 }
 nextLevel(){const i=this.data.best.findIndex((score,i)=>i<this.data.unlocked&&score===0);return i<0?Math.min(LEVEL_COUNT-1,this.data.unlocked-1):i}
 refresh(){try{if(localStorage.getItem(KEY)===this.lastStored)return false;this.reload();return true}catch{return false}}
 write(){try{const value=JSON.stringify(this.data);localStorage.setItem(KEY,value);this.lastStored=value}catch{}}
 finish(i,stars,score,run={}){if(!Number.isInteger(i)||i<0||i>=LEVEL_COUNT)return;const r=this.data.records[i],time=Number.isFinite(run.time)?Math.max(0,run.time):0;r.runs++;if(time>0)r.time=r.time>0?Math.min(r.time,time):time;r.medal=Math.max(r.medal,stars===3&&!run.hits&&!run.deaths?3:stars>=2?2:1);if(i===0)this.data.tutorialDone=true;this.data.stars[i]=Math.max(this.data.stars[i],stars);this.data.best[i]=Math.max(this.data.best[i],score);this.data.unlocked=Math.max(this.data.unlocked,Math.min(LEVEL_COUNT,i+2));this.write()}
 reset(){this.data=structuredClone(defaults);this.write()}
}
