/* Mimori – handmade Web Audio effects. No copyrighted samples. */
(function(root){
 'use strict';
 const KEY='easygames.mimori.sound.v1';
 let enabled=true,ctx=null;
 try{enabled=localStorage.getItem(KEY)!=='off'}catch(_){}
 const tone=(hz,duration,delay=0,{wave='sine',vol=.08,end=null,lfo=0}={})=>{
  if(!enabled)return;
  let ac;
  try{
   if(!ctx){const C=root.AudioContext||root.webkitAudioContext;if(!C)return;ctx=new C()}
   ac=ctx;if(ac.state==='suspended'&&ac.resume)ac.resume().catch(()=>{});
   const start=ac.currentTime+delay,osc=ac.createOscillator(),gain=ac.createGain();
   osc.type=wave;osc.frequency.setValueAtTime(hz,start);
   if(end)osc.frequency.exponentialRampToValueAtTime(Math.max(35,end),start+duration);
   const intensity= Math.max(.0001,vol);
   gain.gain.setValueAtTime(.0001,start);
   gain.gain.exponentialRampToValueAtTime(intensity,start+Math.min(.03,duration/5));
   gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
   osc.connect(gain);gain.connect(ac.destination);
   if(lfo){
    const mod=ac.createOscillator(),modGain=ac.createGain();
    mod.type='sine';mod.frequency.setValueAtTime(lfo,start);
    modGain.gain.setValueAtTime(Math.min(intensity*.34,.045),start);
    mod.connect(modGain);modGain.connect(gain.gain);mod.start(start);mod.stop(start+duration);
   }
   osc.start(start);osc.stop(start+duration+.015);
  }catch(_){}
 };
 const chirp=(notes,wave='sine')=>notes.forEach(([freq,time,len,fin])=>tone(freq,len,time,{wave,end:fin||freq*.9,vol:.075}));
 function purr(){
  // Low, gently rolling, double-oscillator purr instead of the generic melody.
  tone(105,1.15,0,{wave:'triangle',vol:.08,end:96,lfo:28});
  tone(151,1.08,.06,{wave:'sine',vol:.035,end:133,lfo:27});
  for(let i=0;i<7;i++)tone(142+i%2*8,.11,.10+i*.135,{wave:'sine',vol:.021,end:106});
 }
 function munch(){
  for(let i=0;i<5;i++){
   const t=i*.165; tone(285+i%2*46,.09,t,{wave:'triangle',vol:.065,end:154});
   tone(680+i%2*80,.028,t+.055,{wave:'sine',vol:.025,end:260});
  }
  tone(570,.2,.91,{end:800,vol:.05});
 }
 function bath(){
  for(let i=0;i<11;i++){
   const t=i*.11;const h=540+i%4*140;
   tone(h,.15,t,{wave:'sine',vol:.035,end:h*1.45});
  }
  tone(350,.29,1.12,{wave:'triangle',vol:.042,end:480});
 }
 function sleepy(){
  for(let i=0;i<3;i++){
   const t=i*.44;
   tone(272-i*19,.38,t,{wave:'sine',vol:.045,end:218-i*16,lfo:3});
  }
  tone(185,.5,1.2,{wave:'sine',vol:.022,end:145,lfo:2});
 }
 function playful(){
  chirp([[610,0,.12,990],[760,.14,.12,1180],[480,.29,.15,820],[880,.47,.2,1320]],'triangle');
 }
 function speciesVoice(kind,index){
  switch(index){
   case 1: chirp([[170,0,.19,135],[240,.23,.17,193]],'sawtooth');break;
   case 2: chirp([[690,0,.13,1010],[580,.17,.19,890]],'triangle');break;
   case 3: chirp([[195,0,.33,125],[144,.31,.37,92]],'sawtooth');break;
   default: chirp([[740,0,.13,930],[610,.14,.15,790]],'sine');
  }
 }
 function play(kind,species=0){
  if(!enabled)return;
  switch(kind){
   case 'cuddle':purr();break;
   case 'feed':munch();break;
   case 'wash':bath();break;
   case 'sleep':sleepy();break;
   case 'play':playful();break;
   case 'minigame':chirp([[500,0,.13,680],[720,.15,.13,1000],[920,.3,.13,1280],[1180,.46,.27,1450]],'triangle');break;
   case 'evolve':chirp([[400,0,.16,530],[580,.17,.15,730],[780,.34,.16,940],[1010,.52,.18,1270],[1350,.72,.35,1450]]);break;
   case 'error':chirp([[220,0,.15,175],[155,.17,.2,113]],'triangle');break;
   case 'color':chirp([[460,0,.10,650],[710,.12,.17,900]]);break;
   case 'star':chirp([[1100,0,.08,1280],[1440,.10,.12,1630]]);break;
   case 'reminder':chirp([[420,0,.12,510],[570,.16,.17,650]]);break;
   case 'species':speciesVoice('hello',species);break;
   default:speciesVoice(kind,species);
  }
 }
 function toggle(){enabled=!enabled;try{localStorage.setItem(KEY,enabled?'on':'off')}catch(_){}if(enabled)play('color');return enabled}
 root.MimoriSound={play,toggle,isEnabled:()=>enabled};
})(window);
