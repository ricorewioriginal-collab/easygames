/* Keep the whole Mimori game in the 3D stage without duplicate page panels. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const scene=document.querySelector('.scene');
if(!scene)return;
const stack=document.querySelector('.layout>.stack');
const world=$('worldOverlay'),settings=$('settingsDrawer');
const status=stack?.querySelector('.statusPanel'),care=stack?.querySelector('.carePanel');
if(!stack||!world||!settings||!status||!care)return;
// Preserve real event handlers by moving nodes, not cloning them.
const dock=document.createElement('nav');dock.className='sceneDock';dock.id='sceneDock';
dock.setAttribute('aria-label','Mimori Schnellnavigation');
const sheet=document.createElement('aside');sheet.id='sceneSheet';sheet.className='sceneSheet';sheet.hidden=true;
sheet.setAttribute('aria-label','Pflege und Werte');
const head=document.createElement('div');head.className='sceneSheetTop';
const heading=document.createElement('h2');heading.textContent='Pflege';
const close=document.createElement('button');close.id='sceneSheetClose';close.textContent='✕ Schließen';
head.append(heading,close);sheet.append(head,care,status);
scene.append(sheet,dock,world,settings);stack.hidden=true;
let current='',worldTab='rooms';
const nav=[
 ['care','🫶','Pflege'],['status','💚','Werte'],['rooms','🏡','Räume'],
 ['family','💞','Familie'],['radio','📻','Radio'],['games','🎮','Spiele']
];
function makeButton([id,icon,title]){
 const button=document.createElement('button');button.type='button';button.dataset.sceneNav=id;
 button.setAttribute('aria-label',title);button.setAttribute('aria-pressed','false');
 const picture=document.createElement('b');picture.textContent=icon;
 const name=document.createElement('span');name.textContent=title;
 button.append(picture,name);button.addEventListener('click',()=>navigate(id));
 dock.appendChild(button);
}
nav.forEach(makeButton);
const worldPanel=world.querySelector('.worldPanel'),worldHead=worldPanel?.querySelector('.worldHead');
const sections=Array.from(worldPanel?.querySelectorAll(':scope > section')||[]);
const tabs=document.createElement('div');tabs.className='worldTabs';tabs.id='worldTabs';
const group={
 rooms:sections.slice(0,2),family:sections.slice(2,5),radio:sections.slice(5)
};
for(const [id,label] of [['rooms','🏡 Zimmer'],['family','💞 Familie'],['radio','📻 Radio']]){
 const b=document.createElement('button');b.textContent=label;b.dataset.worldTab=id;
 b.addEventListener('click',()=>switchWorldTab(id));tabs.appendChild(b);
}
if(worldHead)worldHead.after(tabs);
const prevOpen=document.querySelector('#worldOpen');
function markWorldTab(id){worldTab=id;}
function syncDock(){
 dock.querySelectorAll('[data-scene-nav]').forEach(b=>{
  const chosen=b.dataset.sceneNav===current;
  b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));
 });
}
function hideSheet(){sheet.hidden=true;care.hidden=true;status.hidden=true}
function closeOther(){
 if(!world.hidden)$('worldClose')?.click();
 if(!settings.hidden)$('settingsClose')?.click();
 hideSheet();
}
function switchWorldTab(id){
 worldTab=id;
 for(const [name,list] of Object.entries(group))for(const section of list)section.hidden=name!==id;
 for(const b of tabs.querySelectorAll('button'))b.classList.toggle('selected',b.dataset.worldTab===id);
 if(id==='radio'&&$('radioSection')?.hidden){$('radioSection').hidden=false}
 worldPanel.scrollTop=0;
}
function showWorldTab(id){
 if(id==='radio'&&$('radioLaunch')?.hidden){
  window.MimoriWorldActions?.showLivingRoomRadio?.();
 }
 closeOther();worldTab=id;
 if(world.hidden)prevOpen?.click();
 if(world.hidden)return;
 switchWorldTab(id);current=id;syncDock();
}
function navigate(id){
 if(id===current&&id!=='games'){current='';closeOther();syncDock();return}
 if(id==='games'){current='';closeOther();syncDock();const game=care.querySelector('[data-care="minigame"]');game?.click();return}
 if(id==='rooms'||id==='family'||id==='radio'){showWorldTab(id);return}
 closeOther();
 if(id==='care'||id==='status'){
  current=id;heading.textContent=id==='care'?'🫶 Mimori versorgen':'💚 So geht es Mimori';
  care.hidden=id!=='care';status.hidden=id!=='status';sheet.hidden=false;
 }
 syncDock();
}
close.addEventListener('click',()=>{current='';hideSheet();syncDock()});
$('worldClose')?.addEventListener('click',()=>{current='';syncDock()});
$('settingsClose')?.addEventListener('click',()=>{current='';syncDock()});
$('settingsShortcut')?.addEventListener('click',()=>{current='';hideSheet();syncDock()});
prevOpen?.addEventListener('click',()=>{
 if(world.hidden){current='';syncDock();return}
 switchWorldTab('rooms');current='rooms';syncDock();
});
$('radioLaunch')?.addEventListener('click',()=>{if(!world.hidden){switchWorldTab('radio');current='radio';syncDock()}});
const attention=$('petAlert');
if(attention){
 attention.tabIndex=0;attention.setAttribute('role','button');
 attention.setAttribute('aria-label','Mimoris Hilferuf anzeigen');
 attention.addEventListener('click',()=>attention.classList.toggle('expanded'));
 attention.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();attention.click()}});
}
// Room navigation and care buttons remain fully operable from this very scene.
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 if(!world.hidden||!settings.hidden)return;
 if(!sheet.hidden){current='';hideSheet();syncDock()}
});
window.MimoriSceneUI={navigate,openRadio:()=>showWorldTab('radio'),close:()=>{current='';closeOther();syncDock()},getState:()=>({current,sheetOpen:!sheet.hidden,worldOpen:!world.hidden})};
})();
