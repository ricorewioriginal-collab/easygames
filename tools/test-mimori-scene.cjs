'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=name=>fs.readFileSync(path.join(__dirname,'../mimori',name),'utf8');
const html=file('index.html'),css=file('scene-ui.css'),arcadeJs=file('arcade.js'),arcadeCss=file('arcade.css');
for(const name of ['scene-ui.js','scene-ui.css','fallback.js'])assert(html.includes('./'+name),name+' not loaded');
assert(css.includes('.sceneDock')&&css.includes('.sceneSheet')&&css.includes('#worldOverlay{position:absolute'));
assert(css.includes('#petAlert[hidden]'));assert(css.includes('#app > header{'));
assert(arcadeJs.includes("document.querySelector?.('.scene')||document.body"));
assert(arcadeCss.includes('.scene .arcadeShell{position:absolute'));
class Element{
 constructor(tag='div'){
  this.tagName=tag.toUpperCase();this.children=[];this.handlers={};this.hidden=false;this.dataset={};this.style={};this.attributes={};
  this._classes=new Set();
  this.classList={add:k=>this._classes.add(k),remove:k=>this._classes.delete(k),contains:k=>this._classes.has(k),
   toggle:(k,v)=>{const on=v===undefined?!this._classes.has(k):v;if(on)this._classes.add(k);else this._classes.delete(k);return on}};
 }
 append(...items){this.children.push(...items)}
 appendChild(item){this.children.push(item)}
 replaceChildren(...items){this.children=items}
 addEventListener(type,cb){(this.handlers[type]??=[]).push(cb)}
 setAttribute(k,v){this.attributes[k]=String(v)}
 after(x){this.afterElement=x}
 focus(){}
 click(){for(const cb of this.handlers.click||[])cb({preventDefault(){}})}
 querySelectorAll(s){if(s==='[data-scene-nav]')return this.children.filter(x=>x.dataset.sceneNav);
 if(s==='button')return this.children.filter(x=>x.tagName==='BUTTON');return []}
}
const scene=new Element(),stack=new Element(),care=new Element(),status=new Element(),world=new Element(),settings=new Element(),panel=new Element(),worldHead=new Element();
const sections=Array.from({length:6},()=>new Element('section'));
world.hidden=true;settings.hidden=true;
const ids={worldOverlay:world,settingsDrawer:settings,worldOpen:new Element('button'),worldClose:new Element('button'),
 settingsClose:new Element('button'),settingsShortcut:new Element('button'),radioLaunch:new Element('button'),
 radioSection:sections[5],petAlert:new Element()};
stack.querySelector=s=>s==='.carePanel'?care:s==='.statusPanel'?status:null;
world.querySelector=s=>s==='.worldPanel'?panel:null;
panel.querySelector=s=>s==='.worldHead'?worldHead:null;
panel.querySelectorAll=s=>s===':scope > section'?sections:[];
let games=0;
care.querySelector=s=>s==='[data-care="minigame"]'?{click:()=>games++}:null;
ids.worldOpen.addEventListener('click',()=>world.hidden=false);
ids.worldClose.addEventListener('click',()=>world.hidden=true);
ids.settingsClose.addEventListener('click',()=>settings.hidden=true);
const document={
 querySelector:s=>s==='.scene'?scene:s==='.layout>.stack'?stack:s==='#worldOpen'?ids.worldOpen:null,
 getElementById:id=>ids[id],createElement:tag=>new Element(tag),body:{classList:{toggle(){}}},addEventListener(){}
};
const window={};
vm.runInNewContext(file('scene-ui.js'),{document,window});
const ui=window.MimoriSceneUI;
assert(ui);assert(stack.hidden,'Old screen should be hidden once dock initialized');
assert(scene.children.includes(world)&&scene.children.includes(settings),'Panels should be moved inside the scene');
ui.navigate('care');assert.equal(care.hidden,false);assert.equal(status.hidden,true);
ui.navigate('status');assert.equal(status.hidden,false);assert.equal(care.hidden,true);
ui.navigate('rooms');assert.equal(world.hidden,false);assert.equal(sections[0].hidden,false);assert.equal(sections[2].hidden,true);
ui.navigate('family');assert.equal(sections[2].hidden,false);assert.equal(sections[0].hidden,true);
ui.navigate('radio');assert.equal(sections[5].hidden,false);assert.equal(sections[1].hidden,true);
ui.navigate('games');assert.equal(games,1);assert.equal(world.hidden,true);
ids.petAlert.click();assert(ids.petAlert.classList.contains('expanded'));
ids.petAlert.click();assert(!ids.petAlert.classList.contains('expanded'));
ui.close();assert.equal(ui.getState().sheetOpen,false);
const noop=()=>{},gradient={addColorStop:noop};
let drawings=0,strokes=0;
const ctx=new Proxy({createLinearGradient:()=>gradient},{get:(obj,key)=>key in obj?obj[key]:()=>{drawings++}});
const canvas=new Element('canvas');
canvas.getContext=kind=>kind==='2d'?ctx:null;
canvas.setPointerCapture=noop;canvas.remove=()=>{canvas.removed=true};
canvas.width=0;canvas.height=0;
const area={clientWidth:360,clientHeight:600,querySelectorAll:()=>[],appendChild:c=>{area.child=c}};
let requestCount=0;const frames=new Map();
const fallback={exports:{}};
vm.runInNewContext(file('fallback.js'),{
 window:{devicePixelRatio:1.5},module:fallback,globalThis:{},
 document:{createElement:()=>canvas},
 requestAnimationFrame:cb=>{frames.set(++requestCount,cb);return requestCount},
 cancelAnimationFrame:id=>frames.delete(id)
});
const draw=fallback.exports.start({target:area,getPet:()=>({color:2,species:3,appearance:1,accessory:0,lightsOff:false}),
 getHouse:()=>({room:0}),onCuddle:()=>strokes++});
assert(draw&&area.child===canvas);assert.equal(canvas.width,540);
const next=frames.entries().next().value;frames.delete(next[0]);next[1](1000);
assert(drawings>30);
canvas.handlers.pointerdown[0]({pointerId:1,clientX:100,preventDefault(){}});
canvas.handlers.pointerup[0]({pointerId:1});assert.equal(strokes,1);
canvas.handlers.pointerdown[0]({pointerId:2,clientX:100,preventDefault(){}});
canvas.handlers.pointermove[0]({pointerId:2,clientX:160,preventDefault(){}});
canvas.handlers.pointerup[0]({pointerId:2});assert.equal(strokes,1,'Dragging must not cuddle');
draw.turn(.25);draw.dispose();assert(canvas.removed);
console.log('PASS Mimori scene: 6 tabs, 1 shared screen, alert, in-scene arcade and interactive low-power graphics');
