'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const get=n=>fs.readFileSync(path.join(__dirname,'../mimori',n),'utf8');
const html=get('index.html'),css=get('scene-ui.css');
for(const name of ['scene-ui.js','scene-ui.css','fallback.js'])assert(html.includes('./'+name));
assert(css.includes('z-index:20')&&css.includes('height:calc(100dvh'));
class Elem{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.hidden=false;this.dataset={};this.style={};this.children=[];this.h={};this.cls=new Set();
 this.classList={toggle:(n,on)=>{on=on===undefined?!this.cls.has(n):on;on?this.cls.add(n):this.cls.delete(n)},contains:n=>this.cls.has(n)}}
 append(...items){this.children.push(...items)}appendChild(item){this.children.push(item)}
 addEventListener(n,fn){(this.h[n]??=[]).push(fn)}click(){(this.h.click||[]).forEach(fn=>fn())}
 querySelectorAll(s){return s==='[data-scene-nav]'?this.children.filter(x=>x.dataset.sceneNav):s==='button'?this.children.filter(x=>x.tagName==='BUTTON'):[]}
 setAttribute(){}focus(){}after(){}
}
const scene=new Elem(),stack=new Elem(),care=new Elem(),status=new Elem(),world=new Elem(),panel=new Elem(),head=new Elem(),settings=new Elem(),sections=Array.from({length:6},()=>new Elem());
world.hidden=true;settings.hidden=true;
stack.querySelector=s=>s==='.carePanel'?care:s==='.statusPanel'?status:null;
world.querySelector=()=>panel;panel.querySelector=()=>head;panel.querySelectorAll=()=>sections;
let launches=0;const mini=new Elem();mini.click=()=>launches++;care.querySelector=()=>mini;
const ids={worldOverlay:world,settingsDrawer:settings,worldOpen:new Elem(),worldClose:new Elem(),settingsClose:new Elem(),settingsShortcut:new Elem(),radioLaunch:new Elem(),radioSection:sections[5],petAlert:new Elem()};
ids.worldOpen.addEventListener('click',()=>world.hidden=false);ids.worldClose.addEventListener('click',()=>world.hidden=true);ids.settingsClose.addEventListener('click',()=>settings.hidden=true);
const document={querySelector:s=>s==='.scene'?scene:s==='.layout>.stack'?stack:s==='#worldOpen'?ids.worldOpen:null,
 getElementById:s=>ids[s]||null,createElement:s=>new Elem(s),addEventListener(){},body:{classList:{toggle(){}}}};
const win={};vm.runInNewContext(get('scene-ui.js'),{window:win,document});const ui=win.MimoriSceneUI;
assert(ui&&stack.hidden);
for(const [tab,worldExpected,sheetExpected] of [['care',false,true],['status',false,true],['rooms',true,false],['family',true,false],['radio',true,false],['games',false,false]]){
 ui.navigate(tab);assert.equal(ui.getState().worldOpen,worldExpected,tab);assert.equal(ui.getState().sheetOpen,sheetExpected,tab)}
assert.equal(launches,1);ids.petAlert.click();assert(ids.petAlert.classList.contains('expanded'));
let painted=0,cuddles=0;const noop=()=>{};
const ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop})},{get:(obj,k)=>k in obj?obj[k]:()=>painted++});
class Canvas extends Elem{constructor(){super('canvas')}getContext(){return ctx}setPointerCapture(){}remove(){this.removed=true}}
const canvas=new Canvas(),mod={exports:{}};
vm.runInNewContext(get('fallback.js'),{module:mod,window:{devicePixelRatio:2},document:{createElement:()=>canvas},
 requestAnimationFrame:()=>1,cancelAnimationFrame:noop});
const box={clientWidth:360,clientHeight:650,querySelectorAll:()=>[],appendChild(){}};
const render=mod.exports.start({target:box,getPet:()=>({species:3,color:1,appearance:2}),getHouse:()=>({room:2}),onCuddle:()=>cuddles++});
assert(render&&painted>40);assert.equal(canvas.width,540);
canvas.h.pointerdown[0]({pointerId:1,clientX:100,preventDefault:noop});canvas.h.pointerup[0]({pointerId:1});assert.equal(cuddles,1);
canvas.h.pointerdown[0]({pointerId:2,clientX:100,preventDefault:noop});canvas.h.pointermove[0]({pointerId:2,clientX:180,preventDefault:noop});canvas.h.pointerup[0]({pointerId:2});assert.equal(cuddles,1);
render.dispose();assert(canvas.removed);
console.log('PASS Mimori single-window UI and Android Canvas fallback');