(()=>{'use strict';
const $=id=>document.getElementById(id),M=window.MimoriModel,Home=window.MimoriHome,
 Rooms3D=window.MimoriRooms3D,Radio=window.MimoriRadio,
 KEY='easygames.mimori.v1',REMIND='easygames.mimori.reminders.v1';
let pet,priorSave=null;
try{priorSave=JSON.parse(localStorage.getItem(KEY));pet=M.load(priorSave,Date.now())}catch(_){pet=M.fresh()}
const house=Home.restore(priorSave,pet,M,Date.now());
pet=M.load(house.members[house.active],Date.now());
const state={busy:false,fx:0,activity:'idle',spin:0,orbit:0,mini:0,renderer:null,model:null,room:null,balls:[],speciesName:'Fluffi'};
const sound=window.MimoriSound||{play:()=>{},toggle:()=>false,isEnabled:()=>false};
const stats=[['hunger','Satt','🍓'],['joy','Freude','💗'],['energy','Energie','🌙'],['clean','Sauber','🫧'],['health','Gesundheit','💚']];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(Home.persist(house,pet)))}catch(_){}};
const themeStyles=['linear-gradient(160deg,#8b829f,#4c496b 72%,#343855)','linear-gradient(160deg,#709aa0,#3d6b78 72%,#2b4558)','linear-gradient(160deg,#9d7987,#6c4975 72%,#37314e)'];
let lastSaveAt=Date.now();
let alertSoundsEnabled=false,alertLastAt=0,alertLastCause='';
try{alertSoundsEnabled=localStorage.getItem('easygames.mimori.alerts.sound.v1')==='on'}catch(_){}
const careNames={toilet:'🚽 Mimori muss aufs Klo!',mess:'💩 Bitte die Hinterlassenschaften entfernen!',
 sick:'💊 Mimori ist krank und braucht Medizin!',light:'💡 Licht ausschalten, damit Mimori schlafen kann!',
 hunger:'🍓 Mimori hat Hunger!',joy:'💗 Mimori ist unzufrieden!',
 energy:'🌙 Mimori ist müde!',clean:'🫧 Mimori braucht Pflege!'};
function refreshAttention(){
 const needs=M.needs(pet,35);
 const main=needs[0]||'';
 $('petAlert').hidden=!main;
 if(main)$('petAlertText').textContent=careNames[main]||'Mimori braucht dich!';
 $('alertSoundToggle').textContent=alertSoundsEnabled?'🔔 Hilferuf-Ton an':'🔕 Hilferuf-Ton aus';
 $('alertSoundToggle').setAttribute('aria-pressed',String(alertSoundsEnabled));
 if(main&&alertSoundsEnabled&&sound.isEnabled()&&(main!==alertLastCause||Date.now()-alertLastAt>4*60000)){
  alertLastAt=Date.now();alertLastCause=main;sound.play('alert',pet.species);
 }
 if(!main)alertLastCause='';
}
$('alertSoundToggle').addEventListener('click',()=>{
 alertSoundsEnabled=!alertSoundsEnabled;
 try{localStorage.setItem('easygames.mimori.alerts.sound.v1',alertSoundsEnabled?'on':'off')}catch(_){}
 alertLastAt=0;alertLastCause='';
 refreshAttention();
});

const say=(msg)=>{$('speech').textContent=msg;$('speech').classList.remove('pop');void $('speech').offsetWidth;$('speech').classList.add('pop')};
const time=(n)=>Math.max(0,Math.round(n));
function ui(){
 $('petname').textContent=pet.name;$('age').textContent=M.stages[M.evolve(pet)]+' · '+Math.floor((Date.now()-pet.born)/3600000)+' Stunden';
 $('xp').textContent=Math.round(pet.xp)+' XP';$('mood').textContent=M.mood(pet);
 $('foodCount').textContent=pet.inventory.berry;$('soapCount').textContent=pet.inventory.soap;
 for(const [key]of stats){const n=time(pet[key]);$(key+'Val').textContent=n+' %';$(key+'Fill').style.width=n+'%';$(key+'Fill').classList.toggle('low',n<=35)}
 $('careLevel').textContent='Fürsorge '+pet.care;
 $('coins').textContent='⭐ '+pet.coins;
 $('dailyBtn').disabled=pet.lastDaily===new Date().toISOString().slice(0,10);
 $('dailyBtn').textContent=$('dailyBtn').disabled?'🎁 Heute abgeholt':'🎁 Tagesgeschenk';
 document.querySelectorAll('[data-shop]').forEach(b=>{
  const [kind,idText]=b.dataset.shop.split(':');const id=Number(idText);
  const owned=pet.owns[kind].includes(id),active=pet[kind]===id,cost=M.prices[kind][id];
  b.classList.toggle('shopOwned',owned);b.classList.toggle('shopActive',active);
  b.querySelector('small').textContent=active?'✓ Ausgewählt':owned?'✓ Bereits gekauft':'⭐ '+cost;
 });

 $('speciesName').textContent=M.species[pet.species]||M.species[0];
 document.querySelectorAll('[data-color]').forEach(btn=>{
  const selected=Number(btn.dataset.color)===pet.color;
  btn.classList.toggle('selected',selected);
  btn.setAttribute('aria-pressed',String(selected));
 });
 const miniKeys=[['Joy','joy'],['Hunger','hunger'],['Energy','energy'],['Clean','clean'],['Health','health']];
 for(const [part,key] of miniKeys){
   const value=Math.max(0,Math.round(pet[key]));
   $('mini'+part).textContent=String(value);
   $('mini'+part+'Fill').style.width=value+'%';
   const parent=$('mini'+part).closest?.('[data-mini]');
   parent?.classList.toggle('low',value<=35);
 }
 const memberId=house.members[house.active].memberId;
 const spouseIds=[...new Set(house.weddings.filter(w=>w.ids.includes(memberId)).flatMap(w=>w.ids).filter(id=>id!==memberId))].slice(0,3);
 $('partnerNameTags').replaceChildren();
 for(const id of spouseIds){
  const spouse=house.members.find(m=>m.memberId===id);if(!spouse)continue;
  const badge=document.createElement('span');badge.textContent='💍 '+spouse.name;
  $('partnerNameTags').appendChild(badge);
 }
 $('partnerNameTags').hidden=!spouseIds.length;
 document.querySelectorAll('[data-species]').forEach(b=>{const active=Number(b.dataset.species)===pet.species;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});
 $('stageBadge').textContent=['Wolkenbaby','Kleines Wesen','Mutiger Freund','Sternenwesen'][M.evolve(pet)];
 document.querySelectorAll('[data-appearance]').forEach(btn=>{
  const active=Number(btn.dataset.appearance)===(pet.appearance??2);
  btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));
 });
 $('roomLabel').textContent=Home.rooms[house.room][1]+' '+Home.rooms[house.room][0];
 $('radioLaunch').hidden=false;
 $('radioHotspot').hidden=house.room!==0;
 $('newPetName').disabled=house.members.length>=4;
 $('addPet').disabled=house.members.length>=4;
 $('toiletNeed').textContent=Math.round(pet.toiletNeed)+'%';
 $('messLabel').textContent=pet.mess?pet.mess+'× Dreck':'Sauber';
 $('sickLabel').textContent=pet.sick?'Krank':'Gesund';
 $('lightLabel').textContent=pet.lightsOff?'Aus':'An';
 $('lightBtn').querySelector('b').textContent=pet.lightsOff?'Licht an':'Licht aus';
 $('sleepBtn').querySelector('span').textContent=pet.sleeping?'Aufwecken':'Schlafen';
 $('cleanupBtn').classList.toggle('needsCare',pet.mess>0);
 $('medicineBtn').classList.toggle('needsCare',pet.sick);
 $('toiletBtn').classList.toggle('needsCare',pet.toiletNeed>=70);
 $('lightBtn').classList.toggle('needsCare',pet.sleeping&&!pet.lightsOff);
 $('messScene').replaceChildren();
 for(let i=0;i<Math.min(4,pet.mess||0);i++){
  const poop=document.createElement('span');poop.textContent='💩';$('messScene').appendChild(poop);
 }
 $('nightShade').classList.toggle('active',pet.lightsOff);
 $('sleepStatus').hidden=!(pet.sleeping&&pet.lightsOff);
 refreshAttention();
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
 if(kind==='light'&&state.applyLight)state.applyLight();
 save();ui();
}
document.querySelectorAll('[data-care]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.care;if(k==='minigame'){startMinigame();return}act(k)}));
$('rename').addEventListener('click',()=>{
 const name=window.prompt('Wie soll dein Wesen heißen?',pet.name);
 if(name===null)return;pet=M.rename(pet,name);save();ui();sound.play('cuddle',pet.species);effects('cuddle');say('Hallo! Ich bin '+pet.name+'!');
});
function chooseColor(color){
 const next=Number(color);if(!Number.isInteger(next)||next<0||next>=4)return;
 pet.color=next;save();paint();ui();
 sound.play('color',pet.species);effects('color');
 say('Deine Fellfarbe ist jetzt '+['Rosa','Mint','Lavendel','Gold'][next]+'!');
}
$('changeColor').addEventListener('click',()=>chooseColor((pet.color+1)%4));
document.querySelectorAll('[data-color]').forEach(btn=>btn.addEventListener('click',()=>chooseColor(btn.dataset.color)));
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
document.querySelectorAll('[data-appearance]').forEach(btn=>btn.addEventListener('click',()=>{
 pet=M.changeAppearance(pet,Number(btn.dataset.appearance));
 save();paint();ui();sound.play('color',pet.species);effects('color');
 say('Neue Mimori-Variante: '+Home.looks[pet.appearance]);
}));
// Household, weddings and rooms share the existing pet save key, so Google sync transports all residents.
let worldOpen=false;
function switchMember(index){
 const next=Home.select(house,index,pet,M,Date.now());
 if(!next)return;
 pet=next;state.orbit=0;
 save();paint();state.applyRoom?.();state.applyLight?.();ui();renderWorld();
 say('Hallo, ich bin '+pet.name+'! 💗');
}
function enterRoom(id){
 if(!Home.rooms[id])return;
 const answer=Home.buyRoom(house,pet,id);
 if(!answer.ok){say(answer.reason);$('weddingResult').textContent=answer.reason;return}
 if(house.room!==0)Radio.stop();
 save();state.applyRoom?.();ui();renderWorld();
 say(Home.rooms[id][1]+' Willkommen im '+Home.rooms[id][0]+'!');
}
function roomStep(dir){
 const unlocked=house.rooms.slice().sort((a,b)=>a-b),idx=unlocked.indexOf(house.room);
 enterRoom(unlocked[(idx+dir+unlocked.length)%unlocked.length]);
}
$('prevRoom').addEventListener('click',()=>roomStep(-1));
$('nextRoom').addEventListener('click',()=>roomStep(1));
function showWorld(open,radio=false){
 worldOpen=open;$('worldOverlay').hidden=!open;
 document.body.classList.toggle('drawerOpen',open);
 if(open){renderWorld();if(radio&&!window.MimoriSceneUI)$('radioSection').scrollIntoView?.({behavior:'smooth',block:'start'})}
 else $('worldOpen').focus();
}
$('worldOpen').addEventListener('click',()=>showWorld(true));
$('worldClose').addEventListener('click',()=>showWorld(false));
$('radioLaunch').addEventListener('click',()=>{if(!window.MimoriSceneUI)showLivingRoomRadio()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&worldOpen)showWorld(false)});
function button(cls,emoji,label,small,click){
 const b=document.createElement('button');b.className=cls;
 const i=document.createElement('b');i.textContent=emoji;
 const title=document.createElement('strong');title.textContent=label;
 const sub=document.createElement('small');sub.textContent=small;
 b.append(i,title,sub);b.addEventListener('click',click);return b;
}
function renderWorld(){
 if(!worldOpen)return;
 const rooms=$('roomTiles');rooms.replaceChildren();
 Home.rooms.forEach(([name,icon,cost],id)=>{
  const owned=house.rooms.includes(id),selected=house.room===id;
  const b=button('worldTile'+(owned?'':' locked')+(selected?' selected':''),
    icon,name,selected?'✓ Aktueller Raum':owned?'✓ Freigeschaltet':'⭐ '+cost,()=>enterRoom(id));
  rooms.appendChild(b);
 });
 const dec=$('decorTiles');dec.replaceChildren();
 Home.decorations.forEach(([name,icon,cost],id)=>{
  const owned=(house.decor[house.room]||[]).includes(id);
  dec.appendChild(button('worldTile'+(owned?' selected':''),
   icon,name,owned?'✓ Aufgestellt':'⭐ '+cost,()=>{
    const result=Home.buyDecor(house,pet,id);
    if(!result.ok){say(result.reason);return}
    save();state.applyRoom?.();ui();renderWorld();say(name+' steht jetzt im Zimmer!');sound.play('color');
   }));
 });
 const list=$('familyCards');list.replaceChildren();
 house.members.forEach((member,i)=>{
  const latest=i===house.active?pet:M.load(member,Date.now());
  const needs=M.needs(latest);
  const b=button('familyCard'+(i===house.active?' active':''),
   ['🐰','🦦','🦊','🐉'][latest.species],latest.name,
   Home.looks[latest.appearance??2]+' · '+M.species[latest.species]+' · '+(needs.length?needs.length+' Bedürfnisse':'Zufrieden'),
   ()=>switchMember(i));
  b.querySelector('small').classList.toggle('familyAlert',needs.length>0);
  list.appendChild(b);
 });
 $('familyStatus').textContent=house.members.length+' / 4 Mimoris im Haushalt · '+house.weddings.length+' Hochzeit(en)';
 const partners=$('partnerChoices');const selected=Array.from(partners.querySelectorAll('input:checked')).map(c=>c.value);
 partners.replaceChildren();
 house.members.forEach((member,i)=>{
  if(i===house.active)return;
  const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';
  check.value=member.memberId;check.checked=selected.includes(check.value);
  const score=house.bonds[Home.pairKey(house.members[house.active].memberId,member.memberId)]||0;
  const title=document.createElement('span');title.textContent=member.name+' · 💗 '+score+'/100';
  label.append(check,title);partners.appendChild(label);
 });
 $('radioSection').hidden=house.room!==0;
}
function selectedPartners(){
 return Array.from($('partnerChoices').querySelectorAll('input:checked')).map(x=>x.value);
}
$('addPet').addEventListener('click',()=>{
 const r=Home.create(house,M,$('newPetName').value,$('newPetSpecies').value,$('newPetAppearance').value);
 if(!r.ok){say(r.reason);return}
 save();renderWorld();switchMember(r.index);sound.play('evolve');
 say('Willkommen in unserer Familie, '+pet.name+'! ❤️');
});
$('datePartners').addEventListener('click',()=>{
 const selected=selectedPartners();if(!selected.length){$('weddingResult').textContent='Wähle erst einen Partner aus.';return}
 const anchor=house.members[house.active].memberId;
 selected.forEach(id=>Home.addBond(house,anchor,id,35));
 save();renderWorld();effects('cuddle');sound.play('cuddle');
 $('weddingResult').textContent='Ein schönes Date! Eure Beziehung ist gewachsen. 💗';
});
$('marryPartners').addEventListener('click',()=>{
 const result=Home.marry(house,house.members[house.active].memberId,selectedPartners());
 if(!result.ok){$('weddingResult').textContent=result.reason;return}
 save();state.paint?.();ui();renderWorld();effects('evolve');sound.play('evolve');
 $('weddingResult').textContent='💍 Hochzeit! '+result.ids.length+' Mimoris feiern ihre Partnerschaft!';
 say('Heute wird geheiratet! 💍');
});
$('familyParty').addEventListener('click',()=>{
 if(!house.weddings.length){$('weddingResult').textContent='Lade zuerst die Familie zur Hochzeit ein!';return}
 const result=Home.careAll(house,pet,M,'cuddle',Date.now());
 pet=result.pet;save();ui();renderWorld();sound.play('dance');effects('play');
 $('weddingResult').textContent='🎉 Familienfest! Alle '+result.helped+' Mimoris freuen sich.';
});
document.querySelectorAll('[data-family-care]').forEach(b=>b.addEventListener('click',()=>{
 const result=Home.careAll(house,pet,M,b.dataset.familyCare,Date.now());
 pet=result.pet;save();paint();ui();renderWorld();
 say(result.helped+' von '+result.total+' Mimoris versorgt!');sound.play('cuddle');
}));
Radio.mount($('mimoriRadio'));
function showLivingRoomRadio(){
 // The bottom Radio button always works, including when another room is selected.
 if(house.room!==0)enterRoom(0);
 showWorld(true,true);
}
$('radioHotspot').addEventListener('click',showLivingRoomRadio);
window.MimoriWorldActions={showLivingRoomRadio,selectColor:chooseColor,refresh:ui};

function turnBy(rad){state.orbit+=rad;state.fallback?.turn?.(rad);state.activity='turn';state.fx=.22}
$('turnLeft').addEventListener('click',()=>turnBy(-Math.PI/3));
$('turnRight').addEventListener('click',()=>turnBy(Math.PI/3));
$('resetView').addEventListener('click',()=>{state.orbit=0;state.activity='turn';state.fx=.22});
$('danceBtn').addEventListener('click',()=>{
 state.activity='dance';state.fx=3.3;
 sound.play('dance',pet.species);effects('play');
 say(M.species[pet.species]+' tanzt vor Freude! 💃');
});
$('voiceBtn').addEventListener('click',()=>{
 state.activity='greet';state.fx=.65;sound.play('species',pet.species);effects('cuddle');
 say(['Piep! Ich mag dich!','Brummel, brummel!','Fiiip! Komm spielen!','Rrrr! Kleiner Drache!'][pet.species]);
});
$('surpriseBtn').addEventListener('click',()=>{
 const kinds=['wash','feed','cuddle','evolve','play'];
 const kind=kinds[Math.floor(Math.random()*kinds.length)];
 state.activity='surprise';state.fx=2;sound.play(kind,pet.species);effects(kind);
 say(['Ein kleines Geschenk! ✨','Huch! Ein Zauber! 🌈','Hihi, du hast mich überrascht! 🎉'][Math.floor(Math.random()*3)]);
});


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

// The old one-button star chase is replaced by five complete arcade games.
function startMinigame(){
 if(!window.MimoriArcade){say('Die Spielhalle wird noch geladen.');return}
 window.MimoriArcade.open({
  records:()=>pet.records||{},
  sound:k=>sound.play(k,pet.species),
  onReward:(id,points,won)=>{
   const result=M.rewardMini(pet,id,points,won,Date.now());
   if(!result.ok)return null;
   pet=result.pet;save();ui();effects(won?'evolve':'play');
   if(result.evolved)paint();
   say((won?'Gewonnen! ':'Gut gespielt! ')+'⭐ '+result.coins+' Sterne erhalten!');
   return result;
  }
 });
}
$('dailyBtn').addEventListener('click',()=>{
 const result=M.claimDaily(pet,Date.now());
 pet=result.pet;save();ui();
 if(result.ok){sound.play('minigame');effects('evolve')}
 else sound.play('error');
 say(result.ok?pet.lastAction:result.reason);
});
document.querySelectorAll('[data-shop]').forEach(b=>b.addEventListener('click',()=>{
 const [kind,id]=b.dataset.shop.split(':');const result=M.shop(pet,kind,Number(id));
 pet=result.pet;if(result.ok){
  save();ui();if(kind==='accessory')paint();
  else if(state.applyRoom)state.applyRoom();
  sound.play('color');effects('color');
 }
 else sound.play('error');
 say(result.ok?(result.purchased?'Neuer Schatz freigeschaltet!':'Dein neues Design ist aktiv!'):result.reason);
}));
$('photoBtn').addEventListener('click',()=>{
 const renderer=state.renderer;
 if(!renderer){say('3D ist noch nicht bereit.');return}
 try{
  const url=renderer.domElement.toDataURL('image/png'),a=document.createElement('a');
  a.href=url;a.download='mimori-'+M.species[pet.species].toLowerCase()+'.png';
  document.body.appendChild(a);a.click();a.remove();
  say('Dein Mimori-Foto ist bereit! 📷');sound.play('star');
 }catch(_){say('Foto nicht möglich – bitte Screenshot erstellen.')}
});
function startLowGraphics(reason){
 if(state.fallback)return;
 const out=$('webglError');
 out.hidden=false;
 out.textContent='2D-Sparmodus: WebGL nicht verfügbar. Mimori bleibt spielbar.';
 if(window.console&&console.warn)console.warn('[Mimori] 3D-Start fehlgeschlagen:',reason);
 state.useFallback=true;
 state.fallback=window.MimoriFallback?.start({
  target:$('viewport'),getPet:()=>pet,getHouse:()=>house,onCuddle:()=>act('cuddle'),
  onError:()=>{out.textContent='Darstellung auf diesem Gerät nicht möglich. Die Pflege funktioniert weiterhin.'}
 });
 if(state.fallback){
  state.renderer={domElement:state.fallback.canvas};
  state.paint=()=>state.fallback.redraw();
  state.applyRoom=()=>state.fallback.redraw();
  state.applyLight=()=>state.fallback.redraw();
 }
}
function make3D(){
 const THREE=window.THREE;
 if(!THREE){startLowGraphics('Three.js konnte nicht geladen werden');return}
 let renderer,lastRendererError=null;
 const modes=[
  {antialias:true,alpha:true,powerPreference:'low-power',preserveDrawingBuffer:true},
  {antialias:false,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:false,stencil:false},
  {antialias:false,alpha:false,powerPreference:'default',preserveDrawingBuffer:false,stencil:false}
 ];
 for(const mode of modes){
  try{renderer=new THREE.WebGLRenderer(mode);break}
  catch(err){lastRendererError=err;renderer=null}
 }
 if(!renderer){startLowGraphics(lastRendererError||'Kein WebGL-Kontext');return}
 try{
  renderer.setPixelRatio(Math.min(1.6,window.devicePixelRatio||1));
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.83;
  renderer.setClearColor(0x000000,0);
  renderer.shadowMap.enabled=false;
 }catch(err){renderer.dispose?.();startLowGraphics(err);return}
 state.renderer=renderer;
 renderer.domElement.addEventListener?.('webglcontextlost',e=>{
  e.preventDefault?.();startLowGraphics('WebGL-Kontext verloren');
 });
 const target=$('viewport');target.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interaktives 3D-Haustier');
 const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x817790,12,23);
 const camera=new THREE.PerspectiveCamera(37,1,.1,50);camera.position.set(0,3.45,8.6);camera.lookAt(0,1.15,0);
 scene.add(new THREE.HemisphereLight(0xe9e3ed,0x51466e,.69));
 const key=new THREE.DirectionalLight(0xffe7d5,.87);key.position.set(-4,7,6);scene.add(key);
 const rim=new THREE.PointLight(0x98aacf,.31,12);rim.position.set(4,4,-2);scene.add(rim);
 state.applyLight=()=>{
  const dark=pet.lightsOff;
  key.intensity=dark?.19:.87;
  rim.intensity=dark?.08:.31;
 };
 state.applyLight();
 const material=(c,r=.72)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:0});
 const mesh=(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o};
 const sphere=new THREE.SphereGeometry(1,28,20),cyl=new THREE.CylinderGeometry(1,1,1,32),box=new THREE.BoxGeometry(1,1,1);
 const room=new THREE.Group();scene.add(room);state.room=room;
 const roomScene=new THREE.Group();room.add(roomScene);
 const floorBack=material('#736c91');
 const floorOuter=material('#a18aa4');
 const floorInner=material('#b8abb7');
 mesh(room,new THREE.CircleGeometry(5.7,72),floorBack,0,-.08,0).rotation.x=-Math.PI/2;
 mesh(room,cyl,floorOuter,0,-.04,0,3.7,.12,3.7);
 mesh(room,cyl,floorInner,0,.01,0,3.22,.08,3.22);
 // Soft contact shadow grounds the figure without washing out the floor.
 const shadow=new THREE.MeshBasicMaterial({color:0x3c2f53,transparent:true,opacity:.24,depthWrite:false});
 mesh(room,new THREE.CircleGeometry(.82,36),shadow,0,.055,.1,1,.52,1).rotation.x=-Math.PI/2;
 state.applyRoom=()=>{
  $('viewport').style.background=Rooms3D.css(house.room);
  Rooms3D.build(THREE,roomScene,house.room,house.decor[house.room]||[]);
 };
 state.applyRoom();
 const petGroup=new THREE.Group();scene.add(petGroup);state.model=petGroup;
 const palettes=[
  ['#c9799f','#e5c3c4','#a65784'],
  ['#69aaa3','#c2dad1','#4c8588'],
  ['#a18bcc','#ded1de','#765faf'],
  ['#d2a66a','#e6d0a9','#a98356']
 ];
 let body,faceParts=[],horns=[];
 const buildPet=()=>{
  while(petGroup.children.length){const old=petGroup.children[0];petGroup.remove(old);
    // Shared geometry remains alive; only material instances belong to the old character.
    if(old.material?.dispose)old.material.dispose();
  }
  faceParts=[];
  const [base,belly,accent]=palettes[pet.color],skin=material(base),light=material(belly),dark=material(accent),
    white=material('#e8e1dd'),eyes=material('#25243f',.18),blush=material('#d57d95'),mouth=material('#955468'),
    shine=material('#e9d1a0'),scale=material('#6f9b9b');
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
  const eyeHeight=[1.63,1.39,1.76,1.60][id],eyeDepth=[.69,.86,.53,.74][id];
  if(pet.accessory===1){
   // A tiny bell collar around the neck.
   mesh(petGroup,new THREE.TorusGeometry(.55,.07,10,34),material('#d7a469'),0,.82,.54).rotation.x=.28;
   oval(shine,0,.69,1.03,.14,.14,.10);
  }else if(pet.accessory===2){
   const bow=material('#bf6491');
   oval(bow,-.18,2.59,.13,.23,.15,.12);oval(bow,.18,2.59,.13,.23,.15,.12);
   oval(shine,0,2.60,.24,.10,.1,.09);
  }else if(pet.accessory===3){
   const ring=mesh(petGroup,new THREE.TorusGeometry(.57,.08,10,30),shine,0,2.83,.02);
   ring.rotation.x=.12;
   for(let i=0;i<4;i++)oval(shine,Math.cos(i*Math.PI/2)*.57,2.83+Math.sin(i*Math.PI/2)*.5,.02,.11,.11,.1);
  }else if(pet.accessory>=4&&pet.accessory<=19){
   const idWear=pet.accessory;
   const gold=material('#e6c783'),pink=material('#db7eae'),blue=material('#80bfd4'),black=material('#3c354d');
   const side=(m,y,z,sz=.18)=>{for(const dir of [-1,1])oval(m,dir*.46,y,z,sz,.14,.10)};
   switch(idWear){
    case 4: // sunglasses
     side(black,eyeHeight+.06,eyeDepth+.27,.26);
     mesh(petGroup,box,black,0,eyeHeight+.08,eyeDepth+.31,.45,.065,.09);
     break;
    case 5: // top hat
     mesh(petGroup,cyl,black,0,2.78,0,.45,.48,.45);
     mesh(petGroup,cyl,gold,0,2.56,0,.67,.06,.64);break;
    case 6: // flower crown
     for(let k=0;k<6;k++)oval(k%2?pink:shine,Math.cos(k)*.45,2.49+Math.sin(k)*.10,.30,.14,.14,.10);break;
    case 7: // scarf
     mesh(petGroup,new THREE.TorusGeometry(.63,.13,8,25),pink,0,.88,.58).rotation.x=.33;
     oval(pink,.31,.50,.80,.13,.42,.12);break;
    case 8: // headphones
     mesh(petGroup,new THREE.TorusGeometry(.64,.11,9,24,Math.PI),black,0,2.23,.12).rotation.z=.1;
     side(blue,1.75,.13,.21);break;
    case 9: // straw hat
     mesh(petGroup,cyl,gold,0,2.59,0,.55,.23,.55);
     mesh(petGroup,cyl,pink,0,2.49,0,.83,.065,.78);break;
    case 10: // crystal headband
     mesh(petGroup,new THREE.TorusGeometry(.48,.055,7,27,Math.PI),blue,0,2.33,.1);
     oval(shine,0,2.67,.33,.15,.26,.11);break;
    case 11: // cap
     oval(blue,0,2.59,.02,.58,.20,.44);
     oval(black,0,2.51,.49,.44,.045,.32);break;
    case 12: // rainbow winglets
     for(const dir of [-1,1]){oval(pink,dir*.95,1.49,-.24,.31,.49,.16);oval(blue,dir*1.13,1.31,-.13,.29,.33,.12)}
     break;
    case 13: // antennae
     for(const dir of [-1,1]){const stem=oval(black,dir*.45,2.66,.1,.055,.35,.05);stem.rotation.z=dir*.36;oval(pink,dir*.61,2.91,.13,.17,.17,.13)}
     break;
    case 14: // wand
     mesh(petGroup,cyl,black,.92,.97,.71,.045,.75,.045).rotation.z=-.35;
     oval(shine,1.11,1.38,.71,.22,.19,.11);break;
    case 15: // mask
     side(pink,eyeHeight+.12,eyeDepth+.27,.29);
     mesh(petGroup,box,pink,0,eyeHeight+.14,eyeDepth+.28,.44,.065,.07);break;
    case 16: // medal
     mesh(petGroup,new THREE.TorusGeometry(.35,.055,8,20),blue,0,.96,.80);
     oval(gold,0,.74,1.04,.17,.22,.09);break;
    case 17: // winter hat
     oval(pink,0,2.64,.02,.57,.36,.46);oval(white,0,2.42,.25,.65,.11,.51);
     oval(white,0,3.01,.04,.14,.14,.12);break;
    case 18: // lightning
     oval(gold,.62,2.15,.45,.13,.30,.08);
     oval(shine,.68,2.46,.48,.11,.13,.09);break;
    case 19: // feather crown
     for(let k=-2;k<=2;k++){const v=oval(k%2?blue:gold,k*.23,2.72,.15,.12,.34+(.2-Math.abs(k)*.07),.08);v.rotation.z=-k*.21}
     break;
   }
  }
  // Distinct opt-in appearance sets for every species, independent of sex/relationship rules.
  if(pet.appearance===0){ // masculine silhouette: short angular fringe and raised brows
   oval(dark,-.29,eyeHeight+.37,eyeDepth+.13,.24,.075,.065);oval(dark,.29,eyeHeight+.37,eyeDepth+.13,.24,.075,.065);
   cone(dark,-.28,2.60,.03,.18,.31);
  }else if(pet.appearance===1){ // feminine silhouette: side flower and soft eye accents
   for(const sign of [-1,1]){oval(eyes,sign*.45,eyeHeight+.19,eyeDepth+.20,.11,.065,.05)}
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5;
    oval(blush,.77+Math.cos(a)*.18,2.26+Math.sin(a)*.17,.33,.15,.17,.10)}
   oval(shine,.77,2.26,.47,.13,.13,.10);
  }else{ // androgynous silhouette: sweeping asymmetric crest and star details
   const tuft=oval(dark,-.22,2.43,.08,.39,.23,.27);tuft.rotation.z=.40;
   oval(shine,.79,eyeHeight+.19,eyeDepth+.14,.10,.12,.07);
  }
  // Shared stage growth still changes the silhouette of every species.
  petGroup.scale.setScalar(.86+M.evolve(pet)*.055);
  state.speciesName=M.species[id]||M.species[0];
 };
 const familyGroup=new THREE.Group();scene.add(familyGroup);
 function family3D(){
  // Separate meshes and materials from the active pet so wedding partners are visible.
  while(familyGroup.children.length){
   const node=familyGroup.children[0];familyGroup.remove(node);
   node.traverse?.(part=>{
    if(part.geometry&&part.geometry!==sphere&&part.geometry!==cyl&&part.geometry!==box)part.geometry.dispose?.();
    const mats=Array.isArray(part.material)?part.material:[part.material];for(const mat of mats)mat?.dispose?.();
   });
  }
  const me=house.members[house.active].memberId;
  const ids=Array.from(new Set(house.weddings.filter(w=>w.ids.includes(me)).flatMap(w=>w.ids).filter(id=>id!==me))).slice(0,3);
  // The partners stand closer to the camera, rather than hidden behind the oversized pet.
  const positions=ids.length===1?[[-.98,1.35]]:
   ids.length===2?[[-1.12,1.28],[1.12,1.28]]:
   [[-1.15,1.30],[1.15,1.30],[0,2.62]];
  ids.forEach((id,i)=>{
   const p=house.members.find(m=>m.memberId===id);if(!p)return;
   const [x,z]=positions[i],character=new THREE.Group();
   character.position.set(x,.13,z);
   const [base,belly,accent]=palettes[p.color%4],skin=material(base),light=material(belly),
     dark=material(accent),eye=material('#29223d'),shine=material('#faf2ed');
   const spherePart=(mat,x,y,z,a,b,c)=>mesh(character,sphere,mat,x,y,z,a,b,c);
   spherePart(skin,0,1.1,0,.58,p.species===1?.61:.73,.53);
   spherePart(light,0,.99,.43,.36,.43,.15);
   for(const dir of [-1,1]){
    if(p.species===0){
     const ear=spherePart(skin,dir*.36,1.97,.06,.15,.46,.15);ear.rotation.z=-dir*.2;
    }else if(p.species===2){
     mesh(character,new THREE.ConeGeometry(.19,.51,9),skin,dir*.34,1.91,.02);
    }else if(p.species===3){
     mesh(character,new THREE.ConeGeometry(.17,.37,9),light,dir*.33,1.89,.01);
     spherePart(dark,dir*.62,1.10,-.36,.37,.31,.12);
    }else spherePart(skin,dir*.48,1.46,-.1,.29,.20,.25);
    spherePart(shine,dir*.24,1.42,.44,.15,.21,.09);
    spherePart(eye,dir*.24,1.42,.52,.085,.12,.055);
    spherePart(light,dir*.25,.32,.17,.24,.14,.25);
   }
   if(p.species===2)spherePart(skin,.58,.95,-.52,.25,.56,.23);
   if(p.appearance===1)spherePart(material('#e9a2d4'),.49,1.89,.15,.15,.15,.10);
   if(p.appearance===0)spherePart(dark,-.25,1.70,.46,.24,.07,.06);
   if(p.appearance===2)spherePart(light,0,1.97,.09,.18,.18,.12);
   if(p.accessory===3)mesh(character,new THREE.TorusGeometry(.35,.06,8,24),light,0,2.00,.07);
   // Third partner is foreground-scaled so all three fit, the first two are clearly larger.
   const scaleValue=ids.length===3&&i===2?.64:.90;
   character.scale.setScalar(scaleValue);
   familyGroup.add(character);
  });
  state.partnerCount=familyGroup.children.length;
 }
 state.paint=()=>{buildPet();family3D()};state.paint();
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
  if(e.type==='pointerup'&&!wasDragged){
   if(house.room===0&&THREE.Raycaster&&THREE.Vector2){
    try{
     const rect=renderer.domElement.getBoundingClientRect();
     const point=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));
     const ray=new THREE.Raycaster();ray.setFromCamera(point,camera);
     const radioMeshes=roomScene.children.filter(item=>item.userData?.mimoriRadio);
     if(radioMeshes.length&&ray.intersectObjects(radioMeshes,false).length){
      showLivingRoomRadio();return;
     }
    }catch(_){}
   }
   act('cuddle');
  }
 }
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>renderer.domElement.addEventListener(type,releasePointer));
 let previous=performance.now();
 function frame(ms){
  if(state.useFallback)return;
  const dt=Math.min(.06,Math.max(0,(ms-previous)/1000));previous=ms;const t=ms*.001;
  const jumping=state.fx>0;
  state.fx=Math.max(0,state.fx-dt);petGroup.rotation.y+=(state.orbit-petGroup.rotation.y)*Math.min(1,dt*18);
  const mood=M.mood(pet);
  const energy=pet.energy/100;
  petGroup.position.y=.04+Math.sin(t*(mood==='Schläfrig'?1.2:2.25))*.06+(jumping?Math.abs(Math.sin(t*(state.activity==='dance'?20:14)))*Math.min(1,state.fx)*.33:0);
  const pulse=state.fx>0?Math.min(1,state.fx):0;
  petGroup.rotation.z=Math.sin(t*2.2)*.04+(state.activity==='play'?Math.sin(t*16)*.13*pulse:0)+(state.activity==='dance'?Math.sin(t*15)*.20*pulse:0);
  petGroup.rotation.x=state.activity==='sleep'?Math.sin(t*1.2)*.13*pulse:state.activity==='cuddle'?-Math.sin(t*7)*.08*pulse:0;
  petGroup.scale.setScalar((.81+M.evolve(pet)*.05)*(1+Math.sin(t*11)*.055*pulse));
  if(faceParts.length){const blink=(t%4.4)<.11;faceParts.forEach(({obj,height})=>obj.scale.y=blink?.04:height)}
  if(state.activity==='sleep'&&state.fx>0)petGroup.rotation.z=.22;
  room.rotation.y=Math.sin(t*.12)*.025;
  const w=$('viewport').clientWidth,h=$('viewport').clientHeight;
  if(w&&h){if(renderer.domElement.width!==Math.floor(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.floor(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}try{renderer.render(scene,camera)}catch(err){startLowGraphics(err);return}}
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
 return ['hunger','joy','energy','clean','health','mess','sick','toiletNeed'].filter(k=>k==='mess'?pet.mess>0:k==='sick'?pet.sick:k==='toiletNeed'?pet.toiletNeed>=75:pet[k]<=(k==='health'?25:35))
 .sort((a,b)=>pet[a]-pet[b]);
}
const reminderLines={
 hunger:'hat Hunger und möchte etwas essen 🍓',joy:'möchte mit dir spielen 💗',
 energy:'ist müde und braucht Schlaf 🌙',clean:'wünscht sich ein Bad 🫧',
 health:'braucht deine Fürsorge 💚',mess:'hat Dreck gemacht und braucht Hilfe 💩',
 sick:'ist krank und braucht Medizin 💊',toiletNeed:'muss dringend aufs Klo 🚽'
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
  const message=key==='test'?'Die Erinnerung funktioniert! 🐣':pet.name+' '+(reminderLines[key]||'braucht dich!');
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
ui();try{make3D()}catch(err){startLowGraphics(err)}remindersUi();
window.MimoriDebug={household:()=>JSON.parse(JSON.stringify(house)),openWorld:()=>showWorld(true),switchMember,enterRoom,get:()=>({...pet}),act,advance:()=>{persist();return pet},stage:()=>M.evolve(pet),reminders:()=>({...reminders}),checkReminders,effects,switchSpecies,turnBy,orbit:()=>state.orbit,model:()=>state.model,partnerCount:()=>state.partnerCount||0,graphicsMode:()=>state.useFallback?'2d':'3d',startMinigame,attention:()=>M.needs(pet),alertSound:()=>alertSoundsEnabled};
})();