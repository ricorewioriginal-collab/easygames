const KEY='kiko-sterneninseln-v1';
export const defaults={version:1,unlocked:1,stars:Array(8).fill(0),best:Array(8).fill(0),settings:{music:.4,sfx:.6,quality:'auto',language:'de',sensitivity:1},keys:{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',interact:'KeyE'}};
export class SaveManager{
 constructor(){this.data=this.load()}
 load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d?.version!==1||!Number.isInteger(d.unlocked)||d.unlocked<1||d.unlocked>8||!Array.isArray(d.stars)||d.stars.length!==8||!Array.isArray(d.best)||d.best.length!==8)return structuredClone(defaults);return {...structuredClone(defaults),...d,settings:{...defaults.settings,...Object.fromEntries(Object.entries(d.settings||{}).filter(([k,v])=>k in defaults.settings&&(typeof v===typeof defaults.settings[k])&&(typeof v!=='number'||Number.isFinite(v))))},keys:{...defaults.keys,...Object.fromEntries(Object.entries(d.keys||{}).filter(([k,v])=>k in defaults.keys&&typeof v==='string'&&/^[A-Za-z][A-Za-z0-9]{0,20}$/.test(v)))},stars:d.stars.map(n=>Number.isInteger(n)?Math.max(0,Math.min(3,n)):0),best:d.best.map(n=>Number.isFinite(n)?Math.max(0,n):0)}}catch{return structuredClone(defaults)}}
 write(){try{localStorage.setItem(KEY,JSON.stringify(this.data))}catch{}}
 finish(i,stars,score){this.data.stars[i]=Math.max(this.data.stars[i],stars);this.data.best[i]=Math.max(this.data.best[i],score);this.data.unlocked=Math.max(this.data.unlocked,Math.min(8,i+2));this.write()}
 reset(){this.data=structuredClone(defaults);this.write()}
}
