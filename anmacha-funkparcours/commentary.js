/* Live-Kommentator für Funkparcours: eine Stimme, keine Überlagerung. */
export function makeCommentator(){
 const synth=window.speechSynthesis,enabledAPI=!!(synth&&window.SpeechSynthesisUtterance);
 const KEY='fpVoice',saved=(()=>{try{return localStorage.getItem(KEY)}catch(e){return null}})();
 let on=saved===null?true:saved==='1',active=false,queue=[],generation=0,lastText='',lastWhen=0,voice=null,timeout=0;
 function refreshVoice(){if(!enabledAPI)return;const a=synth.getVoices();voice=a.find(v=>/^de[-_]/i.test(v.lang)&&/natural|neural|google/i.test(v.name))||a.find(v=>/^de[-_]/i.test(v.lang))||null}
 if(enabledAPI){refreshVoice();synth.addEventListener?.('voiceschanged',refreshVoice)}
 function stop(){generation++;queue=[];active=false;clearTimeout(timeout);try{synth?.cancel()}catch(e){}}
 function pump(){
  if(!on||!enabledAPI||active||!queue.length)return;
  const text=queue.shift(),g=generation;active=true;
  try{
   const u=new SpeechSynthesisUtterance(text);u.lang='de-DE';u.rate=1.08;u.pitch=.94;if(voice)u.voice=voice;
   let finished=false;
   const done=()=>{if(finished||g!==generation)return;finished=true;clearTimeout(timeout);active=false;pump()};
   u.onend=done;u.onerror=done;
   timeout=setTimeout(()=>{if(g!==generation)return;try{synth.cancel()}catch(e){}done()},Math.min(14000,Math.max(4500,text.length*120)));
   synth.speak(u);
  }catch(e){active=false;pump()}
 }
 function speak(text,priority=false){
  text=String(text||'').trim();if(!text||!on||!enabledAPI)return;
  if(text===lastText&&Date.now()-lastWhen<3000)return;lastText=text;lastWhen=Date.now();
  if(priority)stop();
  if(queue.length>=2)queue.shift();
  queue.push(text);pump();
 }
 function setOn(v){on=!!v;try{localStorage.setItem(KEY,on?'1':'0')}catch(e){}if(!on)stop();return on}
 return {speak,stop,setOn,get on(){return on},supported:enabledAPI};
}
