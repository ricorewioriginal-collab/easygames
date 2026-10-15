'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const dir=path.join(__dirname,'../mimori');
const ui=fs.readFileSync(path.join(dir,'scene-ui.js'),'utf8'),
 css=fs.readFileSync(path.join(dir,'scene-ui.css'),'utf8'),
 fallback=fs.readFileSync(path.join(dir,'fallback.js'),'utf8'),
 html=fs.readFileSync(path.join(dir,'index.html'),'utf8'),
 game=fs.readFileSync(path.join(dir,'game.js'),'utf8');
for(const name of ['scene-ui.css','scene-ui.js','fallback.js'])assert(html.includes('./'+name),'Script/style not loaded: '+name);
for(const part of ['.sceneDock','.sceneSheet','#worldOverlay{position:absolute','.carePanel[hidden]']){
 assert(css.includes(part),'Missing CSS '+part)}
for(const part of ['function startLowGraphics','renderer.render(scene,camera)','startLowGraphics(err)','window.MimoriFallback']){
 assert(game.includes(part),'Missing GPU-failure recovery '+part)}
const noop=()=>{};
class Element{
 constructor(tag='div'){
 this.tagName=tag.toUpperCase();this.children=[];this.handlers={};this.style={};this.dataset={};
 this.hidden=false;this.attributes={};this.ids=new Set();
 this.classList={add:x=>this.ids.add(x),remove:x=>this.ids.delete(x),contains:x=>this.ids.has(x),
 toggle:(x,value)=>{const yes=value===undefined?!this.ids.has(x):value;if(yes)this.ids.add(x);else this.ids.delete(x);return yes}}}
 append(...items){this.children.push(...items)}
 appendChild(x){this.children.push(x)}
 replaceChildren(...items){this.children=items}
 addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)}
 setAttribute(k,v){this.attributes[k]=v}
 after(){}
 focus(){}
 click(){for(const fn of this.handlers.click||[])fn({preventDefault:noop})}
 remove(){}
 querySelectorAll(sel){
 if(sel==='button')return this.children.filter(x=>x.tagName==='BUTTON');
 if(sel==='[data-scene-nav]')return this.children.filter(x=>x.dataset.sceneNav);
 return []}
}
const scene=new Element(),stack=new Element(),care=new Element(),stats=new Element(),
 world=new Element(),settings=new Element(),panel=new Element(),worldHead=new Element();
const sections=Array.from({length:6},()=>new Element('section'));
let playCount=0;
world.hidden=true;settings.hidden=true;
world.querySelector=()=>panel;panel.querySelector=()=>worldHead;
panel.querySelectorAll=()=>sections;
stack.querySelector=q=>q==='.carePanel'?care:q==='.statusPanel'?stats:null;
care.querySelector=()=>({click:()=>playCount++});
const ids={worldOverlay:world,settingsDrawer:settings,
worldClose:new Element('button'),settingsClose:new Element('button'),
settingsShortcut:new Element('button'),worldOpen:new Element('button'),radioLaunch:new Element('button'),
petAlert:new Element(),radioSection:sections[5]};
ids.worldOpen.addEventListener('click',()=>{world.hidden=false});
ids.worldClose.addEventListener('click',()=>{world.hidden=true});
ids.settingsClose.addEventListener('click',()=>{settings.hidden=true});
const doc={body:{classList:{toggle:noop}},
 getElementById:id=>ids[id]||null,
 querySelector:q=>q==='.scene'?scene:q==='.layout>.stack'?stack:q==='#worldOpen'?ids.worldOpen:null,
 createElement:tag=>new Element(tag),addEventListener:noop};
const win={};
vm.runInNewContext(ui,{window:win,document:doc});
const control=win.MimoriSceneUI;
assert(control,'UI did not boot');
assert.equal(stack.hidden,true);
assert.equal(scene.children.length,4,'Original care/status moved rather than duplicated');
control.navigate('care');assert.equal(care.hidden,false);assert.equal(stats.hidden,true);
control.navigate('status');assert.equal(care.hidden,true);assert.equal(stats.hidden,false);
control.navigate('rooms');assert.equal(world.hidden,false);assert.equal(sections[0].hidden,false);
assert.equal(sections[2].hidden,true);
control.navigate('family');assert.equal(sections[2].hidden,false);assert.equal(sections[0].hidden,true);
control.navigate('radio');assert.equal(sections[5].hidden,false);assert.equal(sections[1].hidden,true);
control.navigate('games');assert.equal(playCount,1);assert.equal(world.hidden,true);
ids.petAlert.click();assert.equal(ids.petAlert.classList.contains('expanded'),true);
ids.petAlert.click();assert.equal(ids.petAlert.classList.contains('expanded'),false);
control.close();assert.equal(control.getState().sheetOpen,false);
const gradient=()=>({addColorStop:noop});
const ctx=new Proxy({createLinearGradient:gradient},{get:(o,k)=>k in o?o[k]:noop});
const canvas=new Element('canvas');canvas.setPointerCapture=noop;canvas.getContext=()=>ctx;
const fakeDoc={createElement:()=>canvas};
let scheduled=0,cuddles=0;
const winFallback={devicePixelRatio:2};
vm.runInNewContext(fallback,{document:fakeDoc,window:winFallback,
 requestAnimationFrame:()=>++scheduled,cancelAnimationFrame:noop,console});
assert(winFallback.MimoriFallback,'2D fallback module not initialized');
const area={clientWidth:360,clientHeight:600,querySelectorAll:()=>[],appendChild:noop};
const engine=winFallback.MimoriFallback.start({target:area,
 getPet:()=>({species:2,appearance:1,color:1,accessory:0,lightsOff:false}),
 getHouse:()=>({room:3}),onCuddle:()=>cuddles++});
assert(engine);assert(scheduled>0);
canvas.handlers.pointerdown[0]({pointerId:1,clientX:140,preventDefault:noop});
canvas.handlers.pointerup[0]({pointerId:1});
assert.equal(cuddles,1);
engine.turn(.5);engine.dispose();
console.log('PASS Mimori one-scene: six nav screens, exclusive panels, collapsible alert, playable Canvas fallback');
