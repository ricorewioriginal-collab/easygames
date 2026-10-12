const {load}=require('./harness.cjs');
let seed=7;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
let bad=0;
for(let lv=0;lv<6;lv++){
 const h=load();h.api.settings.camAssist=false;h.els.start.onclick();h.finish();
 if(lv)h.api.level(lv,false);
 h.api.resume&&h.api.resume();
 const lay=h.snap().layout;const solids=lay.solids;
 const keys=['KeyW','KeyA','KeyS','KeyD'];let held=new Set();
 for(let t=0;t<20000;t++){
  if(t%20===0){for(const k of keys){const on=rnd()<.5;on?h.key(k):h.up(k);}
   if(rnd()<.3)h.api.hold('jump',rnd()<.6); if(rnd()<.05)h.api.flight(); if(rnd()<.2){rnd()<.5?h.key('ShiftLeft'):h.up('ShiftLeft');}
   if(rnd()<.03)h.api.dodge();}
  const before=h.snap().state;
  h.tick(1);
  const s=h.snap().state;
  if(s.y<-10){ if(bad<10)console.log('fell out lv',lv,'t',t,'pos',s.x.toFixed(1),s.y.toFixed(1),s.z.toFixed(1),'before',before.x.toFixed(1),before.y.toFixed(1),before.z.toFixed(1));bad++;h.api.teleport(0,0,19);}
  for(const o of solids){const inside=o.r?Math.hypot(s.x-o.x,s.z-o.z)<o.r-.4:Math.abs(s.x-o.x)<o.w/2-.2&&Math.abs(s.z-o.z)<o.d/2-.2;
   if(inside&&s.y<o.y-.15&&s.y>o.y-o.thick+.3&&before.y>=o.y-.1){console.log('PENETRATION lv',lv,'t',t,JSON.stringify({o:{x:o.x,z:o.z,y:o.y,w:o.w,d:o.d,r:o.r}}),'from',before.y.toFixed(2),'to',s.y.toFixed(2),'vy',s.vy.toFixed(1));bad++;h.api.teleport(0,0,19);break;}}
 }
}
console.log(bad ? 'Abstürze vom Rand (erwartet): ' + bad : ''); process.exit(0);
