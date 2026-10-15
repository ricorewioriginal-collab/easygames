(()=>{'use strict';
const $=id=>document.getElementById(id),M=window.MimoriModel,KEY='easygames.mimori.v1',REMIND='easygames.mimori.reminders.v1';
let pet;try{pet=M.load(JSON.parse(localStorage.getItem(KEY)),Date.now())}catch(_){pet=M.fresh()}
const state={busy:false,fx:0,activity:'idle',spin:0,orbit:0,mini:0,renderer:null,model:null,room:null,balls:[]};
const sound=window.MimoriSound||{play:()=>{},toggle:()=>false,isEnabled:()=>false};
const stats=[['hunger','Satt','🍓'],['joy','Freude','💗'],['energy','Energie','🌙'],['clean','Sauber','🫧'],['health','Gesundheit','💚']];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(pet))}catch(_){}};
let lastSaveAt=Date.now();
const say=(msg)=>{$('speech').textContent=msg;$('speech').classList.remove('pop');void $('speech').offsetWidth;$('speech').classList.add('pop')};
const time=(n)=>Math.max(0,Math.round(n));
function ui(){
 $('petname').textContent=pet.name;$('age').textContent=M.stages[M.evolve(pet)]+' · '+Math.floor((Date.now()-pet.born)/3600000)+' Stunden';
 $('xp').textContent=Math.round(pet.xp)+' XP';$('mood').textContent=M.mood(pet);
 $('foodCount').textContent=pet.inventory.berry;$('soapCount').textContent=pet.inventory.soap;
 for(const [key]of stats){const n=time(pet[key]);$(key+'Val').textContent=n+' %';$(key+'Fill').style.width=n+'%';$(key+'Fill').classList.toggle('low',n<=35)}
 $('careLevel').textContent='Fürsorge '+pet.care;
 $('stageBadge').textContent=['Wolkenbaby','Kleines Wesen','Mutiger Freund','Sternenwesen'][M.evolve(pet)];
}
function persist(force=false){pet=M.advance(pet,Date.now());if(force||Date.now()-lastSaveAt>300000){save();lastSaveAt=Date.now()}ui()}
function act(kind){
 if(state.busy)return;
 const response=M.act(pet,kind,Date.now());pet=response.pet;
 if(!response.ok){say(response.reason);sound.play('error');ui();return}
 state.fx=1.2;state.activity=kind;say(response.evolved?'Wow! Ich bin größer geworden! ✨':pet.lastAction);
 sound.play(response.evolved?'evolve':kind);effects(response.evolved?'evolve':kind);
 if(kind==='minigame')state.fx=2;
 if(response.evolved)paint();
 save();ui();
}
document.querySelectorAll('[data-care]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.care;if(k==='minigame'){startMinigame();return}act(k)}));
$('rename').addEventListener('click',()=>{
 const name=window.prompt('Wie soll dein Wesen heißen?',pet.name);
 if(name===null)return;pet=M.rename(pet,name);save();ui();sound.play('cuddle');effects('cuddle');say('Hallo! Ich bin '+pet.name+'!');
});
$('changeColor').addEventListener('click',()=>{pet.color=(pet.color+1)%4;save();paint();sound.play('color');effects('color');say('Ein neues Lieblingsfell!')});
$('infoBtn').addEventListener('click',()=>{$('help').hidden=!$('help').hidden});
$('helpClose').addEventListener('click',()=>{$('help').hidden=true});
$('installBtn').addEventListener('click',()=>{$('installInfo').hidden=!$('installInfo').hidden});
function effects(kind){
 const layer=$('fxLayer');if(!layer)return;
 layer.replaceChildren();
 const icons={feed:['🍓','✨','💗'],play:['⭐','✨','🎉'],wash:['🫧','💧','🫧'],sleep:['💤','🌙','✨'],
 cuddle:['💖','💕','💗'],minigame:['⭐','✨','🌟'],evolve:['✨','🌟','💫','✨'],color:['🎨','✨']};
 const arr=icons[kind]||icons.play,count=kind==='evolve'?24:kind==='wash'?18:12;
 for(let i=0;i<count;i++){
  const p=document.createElement('span');p.className='fx-particle';
  p.textContent=arr[i%arr.length];p.style.left=(19+Math.random()*62)+'%';
  p.style.top=(27+Math.random()*42)+'%';
  p.style.setProperty('--dx',((Math.random()-.5)*180)+'px');
  p.style.setProperty('--dy',(-55-Math.random()*155)+'px');
  p.style.setProperty('--delay',(Math.random()*.24)+'s');
  p.style.fontSize=(18+Math.random()*18)+'px';
  layer.appendChild(p);
 }
 setTimeout(()=>layer.replaceChildren(),1750);
}
$('soundToggle').textContent=sound.isEnabled()?'🔊 Ton an':'🔇 Ton aus';
$('soundToggle').addEventListener('click',()=>{
 const on=sound.toggle();$('soundToggle').textContent=on?'🔊 Ton an':'🔇 Ton aus';
 effects(on?'color':'sleep');
});

let minigameTimer=0,minigameScore=0;
function miniDraw(){
 const area=$('miniArea');area.replaceChildren();
 const ball=document.createElement('button');ball.className='catchBall';ball.type='button';
 ball.textContent='⭐';ball.style.left=(10+Math.random()*74)+'%';ball.style.top=(10+Math.random()*64)+'%';
 ball.setAttribute('aria-label','Stern einsammeln');ball.addEventListener('click',()=>{
  if(!state.mini)return;minigameScore++;$('miniScore').textContent='Sterne: '+minigameScore+'/5';
  sound.play('star');effects('play');if(minigameScore>=5){stopMinigame(true);return}miniDraw()
 });area.appendChild(ball)
}
function stopMinigame(success){
 clearTimeout(minigameTimer);state.mini=0;$('miniOverlay').hidden=true;
 if(success)act('minigame');else{say('Fast! Noch einmal versuchen?');sound.play('error')}
}
function startMinigame(){
 if(state.mini)return;state.mini=1;minigameScore=0;
 $('miniOverlay').hidden=false;$('miniScore').textContent='Sterne: 0/5';
 miniDraw();minigameTimer=setTimeout(()=>stopMinigame(false),14000);
}
$('miniExit').addEventListener('click',()=>stopMinigame(false));
function make3D(){
 const THREE=window.THREE;
 if(!THREE){$('webglError').hidden=false;return}
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.outputEncoding=THREE.sRGBEncoding;
 renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=false;}
 catch(_){$('webglError').hidden=false;return}
 state.renderer=renderer;
 const target=$('viewport');target.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interaktives 3D-Haustier');
 const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xf7e2dc,13,29);
 const camera=new THREE.PerspectiveCamera(37,1,.1,50);camera.position.set(0,3.45,8.6);camera.lookAt(0,1.15,0);
 scene.add(new THREE.HemisphereLight(0xfef3ef,0xa9a2c7,1.55));
 const key=new THREE.DirectionalLight(0xfff7df,1.65);key.position.set(-4,7,6);scene.add(key);
 const rim=new THREE.PointLight(0xbadfff,.9,18);rim.position.set(4,5,-2);scene.add(rim);
 const material=(c,r=.55)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:.02});
 const mesh=(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o};
 const sphere=new THREE.SphereGeometry(1,28,20),cyl=new THREE.CylinderGeometry(1,1,1,32),box=new THREE.BoxGeometry(1,1,1);
 const room=new THREE.Group();scene.add(room);state.room=room;
 mesh(room,new THREE.CircleGeometry(5.7,72),material('#f0d8ca'),0,-.08,0).rotation.x=-Math.PI/2;
 mesh(room,cyl,material('#ead0c9'),0,-.04,0,3.7,.12,3.7);
 mesh(room,cyl,material('#fff6e6'),0,.01,0,3.22,.08,3.22);
 // Cozy pieces: little flower, bowl, bed and hanging stars.
 mesh(room,cyl,material('#eeb996'),-2.45,.25,1.45,.45,.25,.45);
 mesh(room,new THREE.TorusGeometry(.44,.08,12,32),material('#a5c1a8'),-2.45,.48,1.45).rotation.x=Math.PI/2;
 const bed=mesh(room,cyl,material('#bb9fd0'),2.25,.15,-.85,.95,.17,.72);
 mesh(room,sphere,material('#ffedf6'),2.25,.27,-.85,.87,.19,.63);
 for(let i=0;i<7;i++){const ang=i*Math.PI*2/7;mesh(room,sphere,material(i%2?'#f5c9d6':'#b4d2e8'),2.25+Math.cos(ang)*.88,.32,-.85+Math.sin(ang)*.62,.13,.13,.13)}
 for(let i=0;i<4;i++){
  const x=-2.85+(i%2)*.6,z=-1.4-Math.floor(i/2)*.7;
  mesh(room,cyl,material('#a9c2a0'),x,.28,z,.06,.5,.06);
  for(let j=0;j<5;j++){const a=j*Math.PI*2/5;mesh(room,sphere,material(i%2?'#edb6bc':'#d6bee2'),x+Math.cos(a)*.2,.57+Math.sin(a)*.2,z,.13,.18,.10)}
  mesh(room,sphere,material('#fff1a9'),x,.57,z,.13,.13,.11);
 }
 const petGroup=new THREE.Group();scene.add(petGroup);state.model=petGroup;
 const palettes=[
  ['#e8adc7','#fff0e6','#c887a8'],
  ['#a1d6cb','#fff3df','#64ada6'],
  ['#c6b4e9','#fff3ed','#997fd3'],
  ['#f7cd8f','#fff3df','#e4ab68']
 ];
 let body,faceParts=[],horns=[];
 const buildPet=()=>{
  while(petGroup.children.length){const o=petGroup.children[0];petGroup.remove(o);if(o.material?.dispose)o.material.dispose()}
  const [c,belly,accent]=palettes[pet.color],skin=material(c),light=material(belly),dark=material(accent),
   white=material('#fffafa'),eye=material('#262641',.1),cheek=material('#ff9caf'),mouth=material('#a86b87'),spark=material('#fff3bb');
  const growth=1+M.evolve(pet)*.12;
  body=mesh(petGroup,sphere,skin,0,1.25,0,.92*growth,1.02*growth,.81*growth);
  mesh(petGroup,sphere,light,0,1.02,.61,.56*growth,.56*growth,.28);
  mesh(petGroup,sphere,skin,-.74,1.08,.09,.28,.42,.30).rotation.z=-.35;
  mesh(petGroup,sphere,skin,.74,1.08,.09,.28,.42,.30).rotation.z=.35;
  mesh(petGroup,sphere,dark,-.52,.35,.20,.30,.21,.37);
  mesh(petGroup,sphere,dark,.52,.35,.20,.30,.21,.37);
  // Long, leaf-shaped ears with inner accent, not borrowed character design.
  const l=mesh(petGroup,sphere,skin,-.58,2.05,-.05,.29,.75,.24);l.rotation.z=.23;
  const r=mesh(petGroup,sphere,skin,.58,2.05,-.05,.29,.75,.24);r.rotation.z=-.23;
  mesh(petGroup,sphere,light,-.56,2.09,.17,.14,.54,.08).rotation.z=.23;
  mesh(petGroup,sphere,light,.56,2.09,.17,.14,.54,.08).rotation.z=-.23;
  const leftEye=mesh(petGroup,sphere,white,-.37,1.57,.72,.19,.25,.14),rightEye=mesh(petGroup,sphere,white,.37,1.57,.72,.19,.25,.14);
  mesh(petGroup,sphere,eye,-.33,1.55,.845,.10,.16,.075);
  mesh(petGroup,sphere,eye,.41,1.55,.845,.10,.16,.075);
  mesh(petGroup,sphere,spark,-.35,1.61,.9,.04,.052,.022);
  mesh(petGroup,sphere,spark,.39,1.61,.9,.04,.052,.022);
  mesh(petGroup,sphere,cheek,-.66,1.31,.61,.16,.08,.08);
  mesh(petGroup,sphere,cheek,.66,1.31,.61,.16,.08,.08);
  mesh(petGroup,sphere,mouth,0,1.23,.81,.13,.058,.035);
  for(let i=0;i<M.evolve(pet);i++){
   const x=(i-1)*.28;
   horns.push(mesh(petGroup,new THREE.ConeGeometry(.11,.34,16),spark,x,2.71,.02))}
  faceParts=[leftEye,rightEye];
 };
 state.paint=buildPet;buildPet();
 let pointer=null,dragX=0,dragged=false;
 renderer.domElement.addEventListener('pointerdown',e=>{pointer=e.pointerId;dragX=e.clientX;dragged=false;try{renderer.domElement.setPointerCapture(e.pointerId)}catch(_){}});
 renderer.domElement.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;const dx=e.clientX-dragX;if(Math.abs(dx)>3)dragged=true;state.orbit=clamp(state.orbit+dx*.008,-.8,.8);dragX=e.clientX});
 renderer.domElement.addEventListener('pointerup',e=>{if(pointer!==e.pointerId)return;pointer=null;if(!dragged)act('cuddle')});
 let previous=performance.now();
 function frame(ms){
  const dt=Math.min(.06,(ms-previous)/1000);previous=ms;const t=ms*.001;
  const jumping=state.fx>0;
  state.fx=Math.max(0,state.fx-dt);petGroup.rotation.y+=(state.orbit-petGroup.rotation.y)*.06;
  const mood=M.mood(pet);
  const energy=pet.energy/100;
  petGroup.position.y=.04+Math.sin(t*(mood==='Schläfrig'?1.2:2.25))*.06+(jumping?Math.abs(Math.sin(t*14))*Math.min(1,state.fx)*.33:0);
  const pulse=state.fx>0?Math.min(1,state.fx):0;
  petGroup.rotation.z=Math.sin(t*2.2)*.04+(state.activity==='play'?Math.sin(t*16)*.13*pulse:0);
  petGroup.rotation.x=state.activity==='sleep'?Math.sin(t*1.2)*.13*pulse:state.activity==='cuddle'?-Math.sin(t*7)*.08*pulse:0;
  petGroup.scale.setScalar((.81+M.evolve(pet)*.05)*(1+Math.sin(t*11)*.055*pulse));
  if(faceParts.length){const blink=(t%4.4)<.11;faceParts.forEach(o=>o.scale.y=blink?.04:.25)}
  if(state.activity==='sleep'&&state.fx>0)petGroup.rotation.z=.22;
  room.rotation.y=Math.sin(t*.12)*.025;
  const w=$('viewport').clientWidth,h=$('viewport').clientHeight;
  if(w&&h){if(renderer.domElement.width!==Math.floor(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.floor(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}renderer.render(scene,camera)}
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
function paint(){if(state.paint)state.paint()}
/* Local browser/PWA reminders: no push server, no background delivery guarantee. */
let reminders={enabled:false,lastSent:{},day:-1,dayCount:0};
try{const stored=JSON.parse(localStorage.getItem(REMIND)||'null');if(stored&&typeof stored==='object'){
 reminders.enabled=stored.enabled===true;
 reminders.lastSent=stored.lastSent&&typeof stored.lastSent==='object'?stored.lastSent:{};
 reminders.day=Number(stored.day)||-1;reminders.dayCount=Number(stored.dayCount)||0;
}}catch(_){}
function saveReminders(){try{localStorage.setItem(REMIND,JSON.stringify(reminders))}catch(_){}}
function remindersUi(message){
 $('pushToggle').textContent=reminders.enabled?'🔔 Erinnerungen an':'🔕 Erinnerungen aus';
 $('pushToggle').setAttribute('aria-pressed',String(reminders.enabled));
 $('pushTest').disabled=!reminders.enabled;
 $('pushInfo').textContent=message||(
  reminders.enabled?'Aktiv: Mimori meldet sich bei dir, solange das Spiel oder die PWA läuft.':
  'Ausgeschaltet. Aktiviere die Erinnerungen nur, wenn du sie möchtest.');
}
function quietTime(d=new Date()){const h=d.getHours();return h>=22||h<8}
function reminderCandidates(){
 return ['hunger','joy','energy','clean','health'].filter(k=>pet[k]<=(k==='health'?25:35))
 .sort((a,b)=>pet[a]-pet[b]);
}
const reminderLines={
 hunger:'hat Hunger und möchte etwas essen 🍓',joy:'möchte mit dir spielen 💗',
 energy:'ist müde und braucht Schlaf 🌙',clean:'wünscht sich ein Bad 🫧',
 health:'braucht deine Fürsorge 💚'
};
async function notify(title,body){
 if(!('Notification'in window)||Notification.permission!=='granted')return false;
 // Running page triggers this, not a remotely delivered push event.
 try{
  if(navigator.serviceWorker&&navigator.serviceWorker.getRegistration){
   const reg=await navigator.serviceWorker.getRegistration();
   if(reg&&reg.showNotification){
    await reg.showNotification(title,{body,tag:'mimori-reminder',icon:'./icon.svg',
      data:{url:new URL('./',location.href).href}});
    return true;
   }
  }
  const n=new Notification(title,{body,icon:'./icon.svg',tag:'mimori-reminder'});
  if(n&&n.onclick)n.onclick=()=>window.focus&&window.focus();
  return true;
 }catch(_){return false}
}
async function checkReminders(force=false){
 if(!reminders.enabled||!('Notification'in window)||Notification.permission!=='granted')return false;
 const now=Date.now(),day=Math.floor(now/86400000);
 if(day!==reminders.day){reminders.day=day;reminders.dayCount=0}
 if(!force&&(quietTime()||reminders.dayCount>=3))return false;
 const needs=force?['test']:reminderCandidates();
 for(const key of needs){
  if(!force&&now-(Number(reminders.lastSent[key])||0)<4*3600000)continue;
  const message=key==='test'?'Die Erinnerung funktioniert! 🐣':pet.name+' '+reminderLines[key];
  const delivered=await notify(pet.name+' braucht dich!',message);
  if(delivered&&!force){reminders.lastSent[key]=now;reminders.dayCount++;saveReminders()}
  return delivered;
 }
 return false;
}
$('pushToggle').addEventListener('click',async()=>{
 if(reminders.enabled){reminders.enabled=false;saveReminders();remindersUi();sound.play('color');return}
 if(!('Notification'in window)||!window.isSecureContext){
  remindersUi('Dein Browser kann hier keine Benachrichtigungen anzeigen. Im sicheren Browserfenster erneut versuchen.');return;
 }
 let permission=Notification.permission;
 if(permission!=='granted'){try{permission=await Notification.requestPermission()}catch(_){permission='denied'}}
 if(permission==='granted'){reminders.enabled=true;saveReminders();remindersUi();sound.play('color')}
 else remindersUi('Benachrichtigungen wurden im Browser nicht erlaubt. Du kannst die Berechtigung später in den Browser-Einstellungen ändern.');
});
$('pushTest').addEventListener('click',async()=>{
 const ok=await checkReminders(true);
 remindersUi(ok?'Test-Erinnerung gesendet.':'Benachrichtigung konnte nicht angezeigt werden – prüfe die Browser-Berechtigung.');
 if(ok)sound.play('reminder');
});
window.addEventListener('focus',()=>{persist();checkReminders().catch(()=>{})});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){persist();checkReminders().catch(()=>{})}else save()});
window.addEventListener('pagehide',save);
setInterval(()=>{
 persist();if(reminders.enabled)checkReminders().catch(()=>{});
 if(!document.hidden&&Math.min(pet.hunger,pet.energy,pet.clean,pet.joy)<35)say(M.mood(pet)+' – kümmere dich um mich!');
},60000);
ui();make3D();remindersUi();
window.MimoriDebug={get:()=>({...pet}),act,advance:()=>{persist();return pet},stage:()=>M.evolve(pet),reminders:()=>({...reminders}),checkReminders,effects};
})();