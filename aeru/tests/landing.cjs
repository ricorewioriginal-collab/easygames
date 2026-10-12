const {load}=require('./harness.cjs');
for(const [name,sx,sz,ix,iz] of [['ost',24,2,37,2],['west',-24,-5,-36,-5]]){
 const h=load();h.api.settings.camAssist=false;h.els.start.onclick();h.finish();
 h.api.teleport(sx,10,sz);h.tick(1);h.api.flight();
 const dir=ix>sx?'KeyD':'KeyA';
 for(let i=0;i<600;i++){const s=h.snap().state;const d=ix-s.x; if(Math.abs(d)>5){h.key(dir)}else{h.up('KeyA');h.up('KeyD');} h.tick(1); if(s.onGround&&i>20)break;}
 h.up('KeyA');h.up('KeyD');h.tick(60);const s=h.snap().state;if(!s.onGround||Math.hypot(s.x-ix,s.z-iz)>6){console.log('FAIL Landung '+name);process.exit(1);}}
console.log('PASS landen: Anflug auf beide Außeninseln ohne G oder Sinken');
