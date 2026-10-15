(()=>{'use strict';
const $=id=>document.getElementById(id),M=window.MimoriModel,KEY='easygames.mimori.v1',REMIND='easygames.mimori.reminders.v1';
let pet;try{pet=M.load(JSON.parse(localStorage.getItem(KEY)),Date.now())}catch(_){pet=M.fresh()}
const state={busy:false,fx:0,activity:'idle',spin:0,orbit:0,mini:0,renderer:null,model:null,room:null,balls:[],speciesName:'Fluffi'};
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
 $('speciesName').textContent=M.species[pet.species]||M.species[0];
 document.querySelectorAll('[data-species]').forEach(b=>{const active=Number(b.dataset.species)===pet.species;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});
 $('stageBadge').textContent=['Wolkenbaby','Kleines Wesen','Mutiger Freund','Sternenwesen'][M.evolve(pet)];
}
function persist(force=false){pet=M.advance(pet,Date.now());if(force||Date.now()-lastSaveAt>300000){save();lastSaveAt=Date.now()}ui()}
function act(kind){
 if(state.busy)return;
 const response=M.act(pet,kind,Date.now());pet=response.pet;
 if(!response.ok){say(response.reason);sound.play('error');ui();return}
 state.fx=1.2;state.activity=kind;say(response.evolved?'Wow! Ich bin größer geworden! ✨':pet.lastAction);
 sound.play(response.evolved?'evolve':kind,pet.species);effects(response.evolved?'evolve':kind);
 if(kind==='minigame')state.fx=2;
 if(response.evolved)paint();
 save();ui();
}
document.querySelectorAll('[data-care]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.care;if(k==='minigame'){startMinigame();return}act(k)}));
$('rename').addEventListener('click',()=>{
 const name=window.prompt('Wie soll dein Wesen heißen?',pet.name);
 if(name===null)return;pet=M.rename(pet,name);save();ui();sound.play('cuddle',pet.species);effects('cuddle');say('Hallo! Ich bin '+pet.name+'!');
});
$('changeColor').addEventListener('click',()=>{pet.color=(pet.color+1)%4;save();paint();sound.play('color',pet.species);effects('color');say('Ein neues Lieblingsfell!')});
$('infoBtn').addEventListener('click',()=>{$('help').hidden=!$('help').hidden});
$('helpClose').addEventListener('click',()=>{$('help').hidden=true});
$('installBtn').addEventListener('click',()=>{$('installInfo').hidden=!$('installInfo').hidden});
function showSettings(open){
 const drawer=$('settingsDrawer');drawer.hidden=!open;
 if(open){$('settingsClose').focus();document.body.classList.add('drawerOpen')}
 else{document.body.classList.remove('drawerOpen');$('settingsShortcut').focus()}
}
$('settingsShortcut').addEventListener('click',()=>showSettings(true));
$('settingsClose').addEventListener('click',()=>showSettings(false));
$('settingsBackdrop').addEventListener('click',()=>showSettings(false));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!$('settingsDrawer').hidden){showSettings(false);return}
 if(e.key==='ArrowLeft'&&e.target.tagName!=='INPUT')turnBy(-.3);
 if(e.key==='ArrowRight'&&e.target.tagName!=='INPUT')turnBy(.3);
});
function switchSpecies(id){
 if(id===pet.species)return;
 pet=M.changeSpecies(pet,id);state.orbit=0;
 save();paint();ui();effects('evolve');sound.play('species',pet.species);
 say('Hallo! Ich bin '+M.species[pet.species]+'!');showSettings(false);
}
document.querySelectorAll('[data-species]').forEach(btn=>btn.addEventListener('click',()=>switchSpecies(Number(btn.dataset.species))));
function turnBy(rad){state.orbit+=rad;state.activity='turn';state.fx=.22}
$('turnLeft').addEventListener('click',()=>turnBy(-Math.PI/3));
$('turnRight').addEventListener('click',()=>turnBy(Math.PI/3));
$('resetView').addEventListener('click',()=>{state.orbit=0;state.activity='turn';state.fx=.22});

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
  while(petGroup.children.length){const old=petGroup.children[0];petGroup.remove(old);
    // Shared geometry remains alive; only material instances belong to the old character.
    if(old.material?.dispose)old.material.dispose();
  }
  faceParts=[];
  const [base,belly,accent]=palettes[pet.color],skin=material(base),light=material(belly),dark=material(accent),
    white=material('#fffaf4'),eyes=material('#30304b',.18),blush=material('#ef93a9'),mouth=material('#ae6978'),
    shine=material('#fff0a9'),scale=material('#8ebcb8');
  const growth=1+M.evolve(pet)*.1,id=pet.species||0;
  const oval=(mat,x,y,z,sx,sy,sz,par=petGroup)=>mesh(par,sphere,mat,x,y,z,sx,sy,sz);
  const cone=(mat,x,y,z,rad,len,down=false)=>{
   const o=mesh(petGroup,new THREE.ConeGeometry(rad,len,12),mat,x,y,z);
   if(down)o.rotation.z=Math.PI;return o;
  };
  function face(y,z,spread=.29,size=.13){
   for(const dir of [-1,1]){
    const x=dir*spread;
    const eyeWhite=oval(white,x,y,z,size*1.57,size*1.96,.11);
    oval(eyes,x+.032,y-.01,z+.095,size*.84,size*1.25,.06);
    oval(shine,x-.022,y+.066,z+.154,.035,.044,.026);
    oval(blush,dir*(spread+.22),y-.19,z-.02,.12,.067,.045);
    faceParts.push({obj:eyeWhite,height:size*1.96});
   }
   oval(mouth,0,y-.28,z+.06,.105,.04,.035);
  }
  if(id===0){ // Fluffi – pear-shaped bunny with leaf-ears and cotton tail
   oval(skin,0,1.20,0,.89,1.02,.74);
   oval(light,0,1.01,.62,.56,.60,.20);
   for(const dir of [-1,1]){
    const ear=oval(skin,dir*.52,2.2,-.05,.245,.71,.19);ear.rotation.z=-dir*.23;
    const inner=oval(dark,dir*.52,2.21,.125,.11,.51,.07);inner.rotation.z=-dir*.23;
    oval(skin,dir*.79,1.02,.02,.23,.38,.26);
    oval(dark,dir*.50,.34,.20,.32,.19,.33);
   }
   oval(white,0,.82,-.83,.27,.26,.29);
   face(1.63,.69,.35,.137);
   for(let i=0;i<M.evolve(pet);i++)cone(shine,(i-1)*.23,2.86,0,.12,.32);
  }else if(id===1){ // Nubbi – squat moon-otter with beak, belly pads and dorsal shell
   oval(skin,0,1.04,0,1.10,.75,.93);
   oval(dark,0,1.19,-.65,.93,.65,.53);
   for(const dir of [-1,1]){
    oval(skin,dir*.89,.72,.28,.31,.30,.43);
    oval(light,dir*.88,.54,.61,.31,.17,.32);
    oval(skin,dir*.45,1.79,0,.16,.31,.19);
    oval(shine,dir*.45,2.08,.03,.17,.19,.19);
   }
   oval(light,0,.96,.84,.62,.45,.15);
   oval(shine,0,1.05,1.00,.29,.18,.24);
   oval(dark,0,.83,1.18,.14,.07,.08);
   for(let i=0;i<5;i++){const x=(i-2)*.32;oval(scale,x,1.58,-.91, .12,.12,.11)}
   for(let i=0;i<3;i++)oval(white,(i-1)*.26,1.67,-.60,.10,.08,.10);
   face(1.39,.86,.37,.12);
  }else if(id===2){ // Foxi – upright pointed-eared forest fox with enormous plume tail
   oval(skin,0,1.24,0,.67,1.12,.56);
   oval(light,0,1.08,.51,.44,.71,.18);
   for(const dir of [-1,1]){
    const ear=cone(skin,dir*.45,2.48,-.08,.26,.94);
    const inner=cone(dark,dir*.45,2.41,.16,.13,.57);
    oval(skin,dir*.58,1.09,.0,.20,.38,.23);
    oval(dark,dir*.34,.35,.14,.23,.24,.31);
   }
   oval(skin,0,1.35,.66,.36,.28,.44);
   oval(light,0,1.25,.94,.23,.14,.18);
   oval(eyes,0,1.32,1.109,.065,.048,.05);
   // Tail deliberately offset, so the rotation is visibly three-dimensional.
   const tail=oval(skin,.76,1.02,-.80,.34,.93,.35);tail.rotation.z=-.66;
   const tip=oval(light,1.12,1.73,-.86,.33,.37,.30);tip.rotation.z=-.59;
   oval(light,0,.82,-.62,.26,.25,.28);
   face(1.76,.53,.30,.126);
  }else{ // Drachi – baby dragon with snout, three dorsal spines, wings and tail
   oval(skin,0,1.13,0,.83,.87,.81);
   oval(light,0,1.03,.70,.48,.62,.19);
   for(const dir of [-1,1]){
    oval(skin,dir*.74,.97,.05,.23,.37,.27);
    oval(dark,dir*.46,.33,.20,.29,.18,.32);
    const wing=oval(dark,dir*1.06,1.45,-.45,.56,.56,.17);wing.rotation.z=dir*.45;
    const wingInner=oval(scale,dir*1.11,1.48,-.30,.36,.39,.09);wingInner.rotation.z=dir*.45;
    const horn=cone(shine,dir*.54,2.13,-.12,.21,.57);
   }
   oval(skin,0,1.26,.78,.53,.34,.43);
   oval(light,0,1.13,1.04,.38,.23,.20);
   for(let i=0;i<3;i++)cone(dark,0,2.12-i*.43,-.67,.23-i*.03,.37);
   const tail=oval(skin,.67,.67,-.83,.38,.29,.71);tail.rotation.y=-.38;
   cone(dark,1.03,.77,-1.26,.23,.44);
   face(1.60,.74,.31,.135);
  }
  // Shared stage growth still changes the silhouette of every species.
  petGroup.scale.setScalar(.86+M.evolve(pet)*.055);
  state.speciesName=M.species[id]||M.species[0];
 };
 state.paint=buildPet;buildPet();
 // Entire 3D surface rotates via touch, mouse or pen. A small tap still cuddles.
 let pointer=null,originX=0,lastX=0,dragged=false;
 renderer.domElement.style.touchAction='none';
 renderer.domElement.addEventListener('pointerdown',e=>{
  if(pointer!==null)return;
  pointer=e.pointerId;originX=lastX=e.clientX;dragged=false;
  e.preventDefault?.();
  try{renderer.domElement.setPointerCapture(e.pointerId)}catch(_){}
 });
 renderer.domElement.addEventListener('pointermove',e=>{
  if(pointer!==e.pointerId)return;
  const dx=e.clientX-lastX;
  if(Math.abs(e.clientX-originX)>7)dragged=true;
  if(dragged&&Number.isFinite(dx)){
   state.orbit+=dx*.015;
   if(Math.abs(state.orbit)>Math.PI*200)state.orbit%=Math.PI*2;
  }
  lastX=e.clientX;
  e.preventDefault?.();
 });
 function releasePointer(e){
  if(pointer!==e.pointerId)return;
  const wasDragged=dragged;pointer=null;dragged=false;
  if(e.type==='pointerup'&&!wasDragged)act('cuddle');
 }
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>renderer.domElement.addEventListener(type,releasePointer));
 let previous=performance.now();
 function frame(ms){
  const dt=Math.min(.06,Math.max(0,(ms-previous)/1000));previous=ms;const t=ms*.001;
  const jumping=state.fx>0;
  state.fx=Math.max(0,state.fx-dt);petGroup.rotation.y+=(state.orbit-petGroup.rotation.y)*Math.min(1,dt*18);
  const mood=M.mood(pet);
  const energy=pet.energy/100;
  petGroup.position.y=.04+Math.sin(t*(mood==='Schläfrig'?1.2:2.25))*.06+(jumping?Math.abs(Math.sin(t*14))*Math.min(1,state.fx)*.33:0);
  const pulse=state.fx>0?Math.min(1,state.fx):0;
  petGroup.rotation.z=Math.sin(t*2.2)*.04+(state.activity==='play'?Math.sin(t*16)*.13*pulse:0);
  petGroup.rotation.x=state.activity==='sleep'?Math.sin(t*1.2)*.13*pulse:state.activity==='cuddle'?-Math.sin(t*7)*.08*pulse:0;
  petGroup.scale.setScalar((.81+M.evolve(pet)*.05)*(1+Math.sin(t*11)*.055*pulse));
  if(faceParts.length){const blink=(t%4.4)<.11;faceParts.forEach(({obj,height})=>obj.scale.y=blink?.04:height)}
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
window.MimoriDebug={get:()=>({...pet}),act,advance:()=>{persist();return pet},stage:()=>M.evolve(pet),reminders:()=>({...reminders}),checkReminders,effects,switchSpecies,turnBy,orbit:()=>state.orbit,model:()=>state.model};
})();