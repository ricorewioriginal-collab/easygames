/* Original synthesized chiptune; no samples or external assets. */
'use strict';
window.LumoAudio=(()=>{
let context=null,master=null,muted=false,next=0,beat=0;
try{muted=localStorage.getItem('easygames.lumo.v1.sound')==='off';}catch(e){}
function unlock(){try{if(!context){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;context=new C();master=context.createGain();master.gain.value=muted?0:.22;master.connect(context.destination);}if(context.state==='suspended')context.resume().catch(()=>{});}catch(e){}}
function tone(freq,duration=.1,type='square',delay=0,end=freq,volume=.16){
if(!context||muted||context.state!=='running')return;
const at=context.currentTime+delay,o=context.createOscillator(),g=context.createGain();
o.type=type;o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(Math.max(30,end),at+duration);
g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.008);g.gain.exponentialRampToValueAtTime(.001,at+duration);
o.connect(g);g.connect(master);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
}
function play(name){if(name==='jump')tone(180,.15,'square',0,600);
else if(name==='coin'){tone(880,.08);tone(1320,.13,'square',.07);}
else if(name==='block'){tone(150,.07,'triangle',0,80);tone(740,.12,'square',.04,980);}
else if(name==='bump')tone(120,.07,'triangle',0,65);
else if(name==='stomp')tone(190,.15,'triangle',0,70);
else if(name==='death'){[440,330,220,110].forEach((f,i)=>tone(f,.18,'sawtooth',i*.11,f*.7,.1));}
else if(name==='finish'){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.18,'square',i*.13));}
else if(name==='start'){[392,523,784].forEach((f,i)=>tone(f,.12,'square',i*.1));}
else if(name==='shield'){[400,600,800,1200].forEach((f,i)=>tone(f,.1,'triangle',i*.06));}
else if(name==='tick')tone(660,.05,'triangle');
}
const melody=[0,4,7,12,7,4,2,7,4,9,7,4,2,0,2,7];
function tick(playing,world){
if(!context)return;
if(!playing||muted||context.state!=='running'){next=context.currentTime+.08;return;}
if(next<context.currentTime)next=context.currentTime;
if(next<context.currentTime+.1){
const base=[220,196,174.61,164.81][world%4],f=base*2**(melody[beat%16]/12);
tone(f,.12,'square',Math.max(0,next-context.currentTime),f,.055);
if(beat%2===0)tone(base/2,.18,'triangle',Math.max(0,next-context.currentTime),base/2,.12);
beat++;next+=.19;
}}
function toggle(){unlock();muted=!muted;if(master)master.gain.setTargetAtTime(muted?0:.22,context.currentTime,.02);try{localStorage.setItem('easygames.lumo.v1.sound',muted?'off':'on');}catch(e){}return muted;}
return {unlock,play,tick,toggle,isMuted:()=>muted};
})();
