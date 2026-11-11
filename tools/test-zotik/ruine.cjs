/* Werkzeug-Ruinen: Der Schiebeblock erreicht das Siegel und öffnet das Tor (Welten 1, 2, 3, 7, 10). */
const { chromium, ARGS, open, skip, intro, shot } = require('./lib.cjs');
(async()=>{const b=await chromium.launch({args:ARGS});const p=await open(b,{ctx:{viewport:{width:386,height:858},hasTouch:true,isMobile:true,deviceScaleFactor:1}});const w=ms=>p.waitForTimeout(ms);
await p.evaluate(()=>{const Z=__zotik;Z.startDbg();const S=Z.S();S.stage=8;S.lvl=29});await intro(p);let bad=0;
for(const n of [1,2,3,7,10]){
await p.evaluate(n=>{const Z=__zotik,S=Z.S();S.cd={};for(let q=2;q<=10;q++)S.cd[q]={st:7,fin:1,bd:1,arr:1,e1:1,e2:1,k:0,b:[0,0,0],ord:0};if(n>1)Z.switchWorld(n);S.chx={god:true}},n);await w(900);await skip(p);
const g=await p.evaluate(()=>{const Z=__zotik;const bl=Z.OB.find(o=>o.t==='block'),pt=Z.OB.find(o=>o.t==='plate');if(!bl)return null;Z.pl.x=bl.x-1.7;Z.pl.z=bl.z;Z.pl.y=Z.hgt(Z.pl.x,Z.pl.z);Z.pl.face=Math.PI/2;Z.setCam(0,.5,9);return {b:[bl.x,bl.z],p:[pt.x,pt.z]}});
if(!g){console.log(n,'kein Block');continue}
await w(500);let r;
for(let i=0;i<40;i++){r=await p.evaluate(()=>{const Z=__zotik,bl=Z.OB.find(o=>o.t==='block'),pt=Z.OB.find(o=>o.t==='plate'),gt=Z.OB.find(o=>o.t==='gate'&&o.grp===pt.grp);if(!bl.mv){Z.pl.x=bl.x-1.7;Z.pl.z=bl.z}Z.joy.x=1;Z.joy.y=0;Z.joy.on=true;const v=Z.inputVec();return {x:bl.x,on:!!pt.on,gate:!!gt.done,v}});if(r.gate)break;await w(250)}
await p.evaluate(()=>{const Z=__zotik;Z.joy.x=0;Z.joy.on=false});
console.log(n,JSON.stringify(g),JSON.stringify(r));if(!r.gate)bad++;
}
console.log(bad?'FEHLER '+bad:'alle Tore offen');await b.close()})();
