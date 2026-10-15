'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const here=path.join(__dirname,'../mimori');
const src=name=>fs.readFileSync(path.join(here,name),'utf8');
const noop=()=>{};
class Node{
 constructor(tag='div'){
  this.tagName=tag.toUpperCase();this.children=[];this.handlers={};this.dataset={};this.attributes={};
  this.style={};this.id='';this.hidden=false;this.textContent='';this.className='';
  this.classes=new Set();
  this.classList={
   add:name=>this.classes.add(name),remove:name=>this.classes.delete(name),
   contains:name=>this.classes.has(name),
   toggle:(name,forced)=>{const active=forced===undefined?!this.classes.has(name):forced;
    if(active)this.classes.add(name);else this.classes.delete(name);return active}
  };
 }
 append(...elements){this.children.push(...elements)}
 appendChild(child){this.children.push(child)}
 replaceChildren(...elements){this.children=elements}
 after(){}
 focus(){}
 setAttribute(name,value){this.attributes[name]=String(value)}
 addEventListener(name,fn){(this.handlers[name]??=[]).push(fn)}
 click(){for(const fn of this.handlers.click||[])fn({preventDefault:noop})}
 querySelectorAll(selector){
  if(selector==='button')return this.children.filter(n=>n.tagName==='BUTTON');
  if(selector==='[data-scene-nav]')return this.children.filter(n=>n.dataset.sceneNav);
  return [];
 }
}
const stage=new Node(),stack=new Node(),care=new Node(),status=new Node(),
 world=new Node(),settings=new Node(),panel=new Node(),head=new Node();
world.hidden=true;settings.hidden=true;
const sections=Array.from({length:6},()=>new Node('section'));
panel.querySelectorAll=selector=>selector===':scope > section'?sections:[];
panel.querySelector=selector=>selector==='.worldHead'?head:null;
world.querySelector=selector=>selector==='.worldPanel'?panel:null;
stack.querySelector=selector=>selector==='.carePanel'?care:selector==='.statusPanel'?status:null;
let minigames=0;
const minigame=new Node('button');minigame.addEventListener('click',()=>minigames++);
care.querySelector=selector=>selector==='[data-care="minigame"]'?minigame:null;
const ids={worldOverlay:world,settingsDrawer:settings,worldClose:new Node('button'),
 settingsClose:new Node('button'),settingsShortcut:new Node('button'),
 worldOpen:new Node('button'),radioLaunch:new Node('button'),
 radioSection:sections[5],petAlert:new Node('div')};
ids.worldOpen.addEventListener('click',()=>world.hidden=false);
ids.worldClose.addEventListener('click',()=>world.hidden=true);
ids.settingsClose.addEventListener('click',()=>settings.hidden=true);
const document={
 querySelector:selector=>selector==='.scene'?stage:selector==='.layout>.stack'?stack:
  selector==='#worldOpen'?ids.worldOpen:null,
 getElementById:id=>ids[id]||null,createElement:tag=>new Node(tag),
 body:{classList:{toggle:noop}},addEventListener:noop
};
const client={};
vm.runInNewContext(src('scene-ui.js'),{document,window:client});
const ui=client.MimoriSceneUI;
assert(ui,'One-screen UI not initialized');
assert.equal(stack.hidden,true,'Old two-column panels must be hidden');
const dock=stage.children.find(e=>e.id==='sceneDock');
const sheet=stage.children.find(e=>e.id==='sceneSheet');
assert(dock&&sheet,'Dock and inside-scene sheet missing');
assert(sheet.children.includes(care)&&sheet.children.includes(status),
 'Original real controls must be moved instead of copied');
assert.equal(dock.children.length,6,'Six navigation tabs needed');
ui.navigate('care');
assert.equal(ui.getState().current,'care');
assert.equal(care.hidden,false);assert.equal(status.hidden,true);
ui.navigate('status');
assert.equal(status.hidden,false);assert.equal(care.hidden,true);
ui.navigate('rooms');
assert.equal(world.hidden,false,'Rooms button must open the world');
assert.equal(sections[0].hidden,false);assert.equal(sections[2].hidden,true);
ui.navigate('family');
assert.equal(world.hidden,false);assert.equal(sections[0].hidden,true);
assert.equal(sections[2].hidden,false);assert.equal(sections[4].hidden,false);
ui.navigate('radio');
assert.equal(sections[5].hidden,false,'Radio tab must show live radio');
assert.equal(sections[1].hidden,true);
ui.navigate('games');
assert.equal(minigames,1,'Arcade opener must call original click handler');
assert.equal(world.hidden,true,'World overlay must close before arcade');
ids.petAlert.click();
assert(ids.petAlert.classList.contains('expanded'),'Tapping alert should show the hint');
ids.petAlert.click();
assert(!ids.petAlert.classList.contains('expanded'));
ui.close();
assert.equal(ui.getState().sheetOpen,false);
const fallbackWindow={devicePixelRatio:2};
let paints=0,frames=[];
const ctx=new Proxy({
 createLinearGradient:()=>({addColorStop:noop})
},{get:(target,key)=>key in target?target[key]:(...args)=>{paints++;}});
class Canvas extends Node{
 constructor(){super('canvas');this.width=0;this.height=0}
 getContext(name){return name==='2d'?ctx:null}
 setPointerCapture(){}
 remove(){}
}
const canvas=new Canvas();
const target={clientWidth:360,clientHeight:600,
 querySelectorAll:()=>[],appendChild:noop};
const env={window:fallbackWindow,document:{createElement:()=>canvas},
 requestAnimationFrame:callback=>{frames.push(callback);return frames.length},
 cancelAnimationFrame:noop,performance:{now:()=>100}};
vm.runInNewContext(src('fallback.js'),env);
const fallback=fallbackWindow.MimoriFallback;
assert(fallback&&typeof fallback.start==='function');
let cuddles=0;
const pet={species:3,color:1,appearance:2,lightsOff:false};
const house={room:0};
const runner=fallback.start({target,getPet:()=>pet,getHouse:()=>house,onCuddle:()=>cuddles++});
assert(runner&&paints>0,'2D fallback must render when WebGL fails');
for(let i=0;i<12;i++){
 house.room=i;pet.species=i%4;pet.appearance=i%3;
 const tick=frames.shift();tick(200+i*60);
}
canvas.handlers.pointerdown[0]({pointerId:1,clientX:150,preventDefault:noop});
canvas.handlers.pointerup[0]({pointerId:1});
assert.equal(cuddles,1,'Pet should still react to taps in fallback');
runner.turn(Math.PI/3);runner.dispose();
assert.equal(runner.canvas,canvas);
for(const file of ['scene-ui.css','scene-ui.js','fallback.js'])
 assert(src('index.html').includes('./'+file),'Missing runtime asset '+file);
assert(src('scene-ui.css').includes('#worldOverlay{position:absolute'),
 'Household drawers must stay within the scene rather than covering the entire phone');
console.log('PASS Mimori single scene: live controls and six menus, 12 fallback rooms, 4 characters, touch care and WebGL-free canvas.');
