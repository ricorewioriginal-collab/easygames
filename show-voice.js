/* AnMaCha Show-Moderation: optionales deutschsprachiges Geräte-TTS.
   Unabhängig von Musik/SFX; es werden ausschließlich Moderatorentexte gesprochen. */
(function () {
  'use strict';
  const key='anmacha_show_voice_'+(location.pathname.split('/').filter(Boolean).pop()||'game');
  const synth=window.speechSynthesis;
  const supported=!!(synth&&window.SpeechSynthesisUtterance);
  let enabled=true,known='',voice=null,lastSpoken='',lastAt=0;
  try{const saved=localStorage.getItem(key);if(saved!==null)enabled=saved==='1'}catch(_){}
  function stop(){try{synth&&synth.cancel()}catch(_){}}
  function pickVoice(){
    if(!supported)return;
    const voices=synth.getVoices();
    voice=voices.find(v=>/^de[-_]/i.test(v.lang)&&/natural|neural|google|premium/i.test(v.name))
      ||voices.find(v=>/^de[-_]/i.test(v.lang))||null;
  }
  if(supported){pickVoice();synth.addEventListener?.('voiceschanged',pickVoice)}
  function speak(message){
    const text=String(message||'').replace(/\s+/g,' ').trim();
    if(!enabled||!supported||!text)return;
    if(text===lastSpoken&&Date.now()-lastAt<1200)return;
    lastSpoken=text;lastAt=Date.now();
    stop();
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang='de-DE';utterance.rate=.97;utterance.pitch=1.03;
    if(voice)utterance.voice=voice;
    try{synth.speak(utterance)}catch(_){}
  }
  function setup(){
    const host=document.getElementById('hostTxt');
    if(!host)return;
    const top=document.querySelector('#game .top');
    const button=document.createElement('button');
    button.type='button';button.className='ib';
    button.id='bVoice';button.title='Moderationsstimme ein-/ausschalten';
    button.setAttribute('aria-label','Moderationsstimme');
    function render(){button.textContent=enabled?'🎙️':'🎙️̸';button.setAttribute('aria-pressed',String(enabled));button.title=enabled?'Moderation an – ausschalten':'Moderation aus – einschalten';button.style.opacity=enabled?'1':'.55'}
    button.onclick=()=>{enabled=!enabled;try{localStorage.setItem(key,enabled?'1':'0')}catch(_){}render();if(!enabled)stop();else speak('Die Moderation ist eingeschaltet.')};
    render();if(!supported){button.disabled=true;button.title='Auf diesem Gerät ist keine Sprachausgabe verfügbar';button.style.opacity='.4'}
    if(top)top.insertBefore(button,top.querySelector('#bSnd')||null);
    let scheduled=false;
    const observer=new MutationObserver(()=>{
      if(scheduled)return;scheduled=true;
      queueMicrotask(()=>{scheduled=false;const t=host.textContent.trim();if(t&&t!==known){known=t;speak(t)}})
    });
    observer.observe(host,{childList:true,subtree:true,characterData:true});
    // Manche Android-WebViews erlauben Sprache erst nach Interaktion.
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
    window.addEventListener('pagehide',stop);
    document.addEventListener('click',e=>{if(e.target.closest('#bMenu,#bEndMenu,#bAgain'))stop()},true);
    window.AnMaChaShowVoice={speak,stop,isEnabled:()=>enabled};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();