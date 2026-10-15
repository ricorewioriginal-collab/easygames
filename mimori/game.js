(()=>{'use strict';
const $=id=>document.getElementById(id),M=window.MimoriModel,KEY='easygames.mimori.v1',DEVICE='easygames.mimori.device.v1';
let pet;try{pet=M.load(JSON.parse(localStorage.getItem(KEY)),Date.now())}catch(_){pet=M.fresh()}
const state={busy:false,fx:0,activity:'idle',spin:0,orbit:0,mini:0,renderer:null,model:null,room:null,balls:[],pushBase:'',pushKey:'',pushEnabled:false,pushBusy:false};
const stats=[['hunger','Satt','🍓'],['joy','Freude','💗'],['energy','Energie','🌙'],['clean','Sauber','🫧']];
let deviceId='';try{deviceId=localStorage.getItem(DEVICE)||crypto.randomUUID();localStorage.setItem(DEVICE,deviceId)}catch(_){deviceId=String(Math.random()).slice(2)}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(pet))}catch(_){}};
const say=(msg)=>{$('speech').textContent=msg;$('speech').classList.remove('pop');void $('speech').offsetWidth;$('speech').classList.add('pop')};
const time=(n)=>Math.max(0,Math.round(n));
function ui(){
 $('petname').textContent=pet.name;$('age').textContent=M.stages[M.evolve(pet)]+' · '+Math.floor((Date.now()-pet.born)/3600000)+' Stunden';
 $('xp').textContent=Math.round(pet.xp)+' XP';$('mood').textContent=M.mood(pet);
 $('foodCount').textContent=pet.inventory.berry;$('soapCount').textContent=pet.inventory.soap;
 for(const [key]of stats){const n=time(pet[key]);$(key+'Val').textContent=n+' %';$(key+'Fill').style.width=n+'%';$(key+'Fill').classList.toggle('low',n<=35)}
 $('careLevel').textContent='Fürsorge '+pet.care;
 $('stageBadge').textContent=['Eiweiß-Baby','Kleines Wesen','Mutiger Freund','Sternenwesen'][M.evolve(pet)];
}
function persist(){pet=M.advance(pet,Date.now());save();ui()}
function act(kind){
 if(state.busy)return;
 const response=M.act(pet,kind,Date.now());pet=response.pet;
 if(!response.ok){say(response.reason);ui();return}
 state.fx=1.2;state.activity=kind;say(response.evolved?'Wow! Ich bin größer geworden! ✨':pet.lastAction);
 if(kind==='minigame')state.fx=2;
 save();ui();syncPush().catch(()=>{});
}
document.querySelectorAll('[data-care]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.care;if(k==='minigame'){startMinigame();return}act(k)}));
$('rename').addEventListener('click',()=>{
 const name=window.prompt('Wie soll dein Wesen heißen?',pet.name);
 if(name===null)return;pet=M.rename(pet,name);save();ui();syncPush().catch(()=>{});say('Hallo! Ich bin '+pet.name+'!');
});
$('changeColor').addEventListener('click',()=>{pet.color=(pet.color+1)%4;save();paint();say('Ein neues Lieblingsfell!')});
$('infoBtn').addEventListener('click',()=>{$('help').hidden=!$('help').hidden});
$('helpClose').addEventListener('click',()=>{$('help').hidden=true});
$('installBtn').addEventListener('click',()=>{$('installInfo').hidden=!$('installInfo').hidden});
let minigameTimer=0,minigameScore=0;
function miniDraw(){
 const area=$('miniArea');area.replaceChildren();
 const ball=document.createElement('button');ball.className='catchBall';ball.type='button';
 ball.textContent='⭐';ball.style.left=(10+Math.random()*74)+'%';ball.style.top=(10+Math.random()*64)+'%';
 ball.setAttribute('aria-label','Stern einsammeln');ball.addEventListener('click',()=>{
  if(!state.mini)return;minigameScore++;$('miniScore').textContent='Sterne: '+minigameScore+'/5';
  if(minigameScore>=5){stopMinigame(true);return}miniDraw()
 });area.appendChild(ball)
}
function stopMinigame(success){
 clearTimeout(minigameTimer);state.mini=0;$('miniOverlay').hidden=true;
 if(success)act('minigame');else say('Fast! Noch einmal versuchen?');
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
  while(petGroup.children.length){const o=petGroup.children[0];petGroup.remove(o);o.geometry?.dispose();if(o.material?.dispose)o.material.dispose()}
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
  petGroup.rotation.z=Math.sin(t*2.2)*.04;
  petGroup.scale.setScalar(.81+M.evolve(pet)*.05);
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
async function readConfig(){
 try{const r=await fetch('./push-config.json',{cache:'no-cache'});if(!r.ok)throw Error('no config');
 const config=await r.json();if(config.apiBase&&/^https:\/\//.test(config.apiBase)){
 state.pushBase=config.apiBase.replace(/\/+$/,'');
 const x=await fetch(state.pushBase+'/api/config',{cache:'no-store'});if(!x.ok)throw Error('server offline');
 const obj=await x.json();if(!obj.publicKey)throw Error('missing VAPID public key');state.pushKey=obj.publicKey;
 $('pushInfo').textContent='Push-Server erreichbar. Benachrichtigungen sind freiwillig.';
 }else $('pushInfo').textContent='Push-Server noch nicht verbunden. Spielstand und Erinnerung im geöffneten Spiel funktionieren trotzdem.';
 }catch(_){$('pushInfo').textContent='Push-Server nicht erreichbar. Hintergrundbenachrichtigungen sind noch nicht verfügbar.'}
 if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){
 $('pushInfo').textContent+=' Dieser Browser unterstützt Web Push hier nicht.';$('pushToggle').disabled=true;return}
 try{const reg=await navigator.serviceWorker.ready;state.pushEnabled=!!(await reg.pushManager.getSubscription());pushLabel()}catch(_){}
}
function pushLabel(){
 $('pushToggle').textContent=state.pushEnabled?'Benachrichtigungen ausschalten':'Benachrichtigungen einschalten';
 $('pushTest').disabled=!state.pushEnabled||!state.pushBase;
}
const urlBytes=b64=>Uint8Array.from(atob(b64.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(b64.length/4)*4,'=')),c=>c.charCodeAt(0));
async function api(path,body){
 if(!state.pushBase)throw Error('Kein Push-Server konfiguriert.');
 const r=await fetch(state.pushBase+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!r.ok)throw Error('Push-Dienst meldet Fehler '+r.status);return r.json()
}
function payload(extra={}){return {deviceId,pet:{name:pet.name,updated:pet.updated,hunger:pet.hunger,joy:pet.joy,energy:pet.energy,clean:pet.clean,health:pet.health},settings:{threshold:35,cooldownHours:5,quietStart:22,quietEnd:8,offsetMinutes:-new Date().getTimezoneOffset()},...extra}}
async function syncPush(){
 if(!state.pushEnabled||!state.pushBase)return;
 try{await api('/api/state',payload())}catch(_){}
}
async function togglePush(){
 if(state.pushBusy)return;
 state.pushBusy=true;$('pushToggle').disabled=true;
 try{
 if(!state.pushBase||!state.pushKey)throw Error('Bitte zuerst den Push-Server einrichten. Die App allein kann keine Erinnerungen im Hintergrund verschicken.');
 if(!('PushManager'in window)||!('Notification'in window))throw Error('Browser unterstützt Web Push nicht.');
 // Start the browser permission request inside the click gesture, before awaiting SW readiness.
 const permissionRequest=state.pushEnabled?null:Notification.requestPermission();
 const reg=await navigator.serviceWorker.ready;
 if(state.pushEnabled){
  const s=await reg.pushManager.getSubscription();
  if(s)await api('/api/unsubscribe',payload({endpoint:s.endpoint}));
  if(s)await s.unsubscribe();state.pushEnabled=false;
  $('pushInfo').textContent='Ausgeschaltet. Es werden keine weiteren Erinnerungen verschickt.';
 }else{
  const permission=await permissionRequest;
  if(permission!=='granted')throw Error('Benachrichtigungsberechtigung nicht erteilt.');
  let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBytes(state.pushKey)});
  await api('/api/subscribe',payload({subscription:sub.toJSON()}));
  state.pushEnabled=true;$('pushInfo').textContent='Aktiv! Auch bei geschlossenem Spiel sind Erinnerungen möglich, solange der Push-Server läuft.';
 }
 }catch(e){$('pushInfo').textContent=String(e.message||e).slice(0,240)}
 finally{state.pushBusy=false;$('pushToggle').disabled=false;pushLabel()}
}
$('pushToggle').addEventListener('click',togglePush);
$('pushTest').addEventListener('click',async()=>{
 try{await api('/api/test',payload());$('pushInfo').textContent='Testbenachrichtigung wurde an den Push-Dienst übergeben.'}
 catch(e){$('pushInfo').textContent='Test fehlgeschlagen: '+String(e.message||e)}
});
window.addEventListener('focus',()=>{persist();syncPush().catch(()=>{})});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)persist();else save()});
window.addEventListener('pagehide',save);
setInterval(()=>{if(document.hidden)return;persist();if(Math.min(pet.hunger,pet.energy,pet.clean,pet.joy)<35)say(M.mood(pet)+' – kümmere dich um mich!')},60000);
ui();make3D();readConfig();
window.MimoriDebug={get:()=>({...pet}),act,advance:()=>{persist();return pet},stage:()=>M.evolve(pet)};
})();