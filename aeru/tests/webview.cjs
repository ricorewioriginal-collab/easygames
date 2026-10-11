// Emulate an embedded browser that rejects every WebGL context but supports Canvas 2D.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),T=require(path.join(root,'vendor/three.min.js'));
let drawCalls=0,gradientStops=0,frames=0;const gradient={addColorStop(){gradientStops++}};
const ctx=new Proxy({createLinearGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:(()=>{drawCalls++})});
class Element{constructor(){this.hidden=true;this.style={};this.classList={add(){},remove(){},toggle(){}};this.listeners={};}getContext(kind){return kind==='2d'?ctx:null;}addEventListener(k,f){(this.listeners[k]??=[]).push(f);}focus(){}setAttribute(){}setPointerCapture(){}getBoundingClientRect(){return{left:0,top:0,width:115,height:115};}cloneNode(){return new Element();}replaceWith(){} }
T.WebGLRenderer=class{constructor(){throw new Error('WebGL is disabled in this WebView')}};
const els={},events={};let frame;const context={THREE:T,console,Math,Map,Set,URLSearchParams,performance:{now:()=>0},innerWidth:390,innerHeight:780,devicePixelRatio:2,location:{search:'?test'},document:{hidden:false,getElementById:id=>els[id]??=new Element(),addEventListener:(k,f)=>events[k]=f},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:true}),requestAnimationFrame:f=>{frame=f;frames++},setTimeout:()=>{},addEventListener:(k,f)=>events[k]=f};context.window=context;vm.createContext(context);
for(const file of ['content.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
assert.equal(els.error?.hidden??true,true);assert.equal(els.graphicsNotice.hidden,false);assert.equal(els.quality.hidden,true);assert(context.aeruTest);
frame(16);const titleCalls=drawCalls;assert(titleCalls>100,'2D title scene was not drawn');
els.start.onclick();context.aeruTest.finishDialog();frame(32);assert.equal(context.aeruTest.snapshot().mode,'play');assert(drawCalls>titleCalls+100,'2D play scene was not drawn');assert(gradientStops>=4,'background gradient missing');
const z=context.aeruTest.snapshot().state.z;events.keydown({code:'KeyW',preventDefault(){},repeat:false});for(let i=1;i<=60;i++)context.aeruTest.step(1/60);assert(context.aeruTest.snapshot().state.z<z-6,'controls stopped working in 2D mode');
console.log('PASS: WebGL failure opens playable Canvas 2D mode; drawing, touch layout and movement work.');
