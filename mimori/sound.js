/* Mimori – original synthesised sounds. No external audio files or samples. */
(function(root){
 'use strict';
 const KEY='easygames.mimori.sound.v1';
 let enabled=true,context=null;
 try{enabled=localStorage.getItem(KEY)!=='off'}catch(_){}
 const AudioCtor=()=>root.AudioContext||root.webkitAudioContext;
 function audio(){
  if(!enabled)return null;
  try{
   if(!context){const C=AudioCtor();if(!C)return null;context=new C()}
   if(context.state==='suspended'&&context.resume)context.resume().catch(()=>{});
   return context;
  }catch(_){return null}
 }
 function note(f,d=0.12,delay=0,type='sine',vol=.075){
  const ctx=audio();if(!ctx)return;
  try{const at=ctx.currentTime+Math.max(0,delay),osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type=type;osc.frequency.setValueAtTime(Math.max(70,f),at);
   osc.frequency.exponentialRampToValueAtTime(Math.max(55,f*.84),at+d);
   gain.gain.setValueAtTime(.0001,at);
   gain.gain.exponentialRampToValueAtTime(vol,at+.012);
   gain.gain.exponentialRampToValueAtTime(.0001,at+d+.12);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+d+.14);
  }catch(_){}
 }
 const patterns={
   feed:[[430,.13,0],[660,.16,.1],[830,.13,.23]],
   play:[[520,.1,0],[640,.11,.09],[770,.12,.19],[1010,.15,.31]],
   wash:[[780,.1,0],[1050,.12,.09],[930,.12,.21],[1240,.2,.35]],
   sleep:[[610,.18,0],[505,.22,.19],[395,.31,.42]],
   cuddle:[[585,.18,0],[745,.2,.13],[890,.25,.3]],
   minigame:[[550,.12,0],[680,.12,.11],[835,.15,.23],[1040,.2,.37],[1270,.2,.52]],
   evolve:[[440,.13,0],[560,.13,.14],[700,.14,.28],[860,.17,.44],[1050,.25,.62],[1320,.34,.82]],
   color:[[640,.08,0],[900,.12,.11]],star:[[830,.1,0],[1220,.17,.12]],
   error:[[220,.12,0],[164,.19,.12]],reminder:[[400,.15,0],[520,.17,.2],[670,.18,.4]]
 };
 function play(kind){
  const pattern=patterns[kind]||patterns.color;
  for(const [f,d,delay]of pattern)note(f,d,delay,kind==='wash'||kind==='star'?'sine':'triangle',kind==='reminder'?.035:.065);
 }
 function toggle(){
  enabled=!enabled;try{localStorage.setItem(KEY,enabled?'on':'off')}catch(_){}
  if(enabled)play('color');
  return enabled;
 }
 root.MimoriSound={play,toggle,isEnabled:()=>enabled};
})(window);
