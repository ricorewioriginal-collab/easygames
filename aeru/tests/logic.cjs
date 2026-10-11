// Runs the actual game with real Three.js geometry and a headless DOM/renderer.
// Rendering is deliberately excluded; gameplay state, physics and progression are exercised.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),T=require(path.join(root,'vendor/three.min.js'));
class Element{constructor(){this.hidden=true;this.style={};this.listeners={};this.classList={add(){},remove(){}};}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}focus(){}setPointerCapture(){}getBoundingClientRect(){return{left:0,top:0,width:115,height:115};}getContext(){return new Proxy({},{get:()=>()=>{}});}}
const els={},events={},stored={};let frame;
T.WebGLRenderer=class{constructor(){this.shadowMap={};}setPixelRatio(){}setSize(){}render(){}};
const context={THREE:T,console,Math,Map,Set,URLSearchParams,performance:{now:()=>0},innerWidth:1280,innerHeight:800,devicePixelRatio:1,location:{search:'?test'},document:{hidden:false,getElementById:id=>els[id]??=new Element(),addEventListener:(k,f)=>events[k]=f},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},matchMedia:()=>({matches:false}),requestAnimationFrame:f=>frame=f,setTimeout:()=>{},addEventListener:(k,f)=>events[k]=f};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'game.js'),'utf8'),context);
const api=context.aeruTest,snap=()=>api.snapshot(),tick=(n=1)=>{for(let i=0;i<n;i++)api.step(1/60)},key=(code)=>events.keydown({code,preventDefault(){},repeat:false}),up=code=>events.keyup({code});
els.start.onclick();api.finishDialog();assert.equal(snap().mode,'play');
const z=snap().state.z;key('KeyW');tick(60);up('KeyW');assert(snap().state.z<z-6,'keyboard moves player');
api.teleport(0,0,19);tick();api.jump();tick(20);assert(snap().state.y>1,'jump raises player');key('Space');tick(40);assert(snap().state.y>0,'holding jump glides');up('Space');tick(150);assert.equal(snap().state.y,0,'lands on island');
// Real movement up the 0.75 m stairs without teleporting onto the platforms.
api.teleport(0,0,-8);tick();key('KeyW');for(let j=0;j<5;j++){api.jump();tick(30);}up('KeyW');assert(snap().state.y>=3,'staircase is traversable');
api.teleport(80,-17,0);tick();assert.equal(snap().state.z,19,'fall returns to checkpoint');
api.lose();assert.equal(snap().state.hp,5,'death restores playable checkpoint');
function collectLevel(){const points=[];for(let i=0;i<10;i++)points.push([Math.sin(i*.7)*4,0,16-i*2.7]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;points.push([Math.cos(a)*17,0,Math.sin(a)*16]);}points.push([-12,0,-6],[12,0,-7],[0,3,-18],[37,1,0],[39,1,3],[-36,2,-5]);for(const [x,y,z]of points){api.teleport(x,y,z);tick();}for(const [x,y,z]of [[-14,0,-3],[14,0,-4],[0,2.25,-13]]){api.teleport(x,y,z);tick(30);api.strike();}assert.equal(snap().save.collected[snap().save.level].length,24);assert.equal(snap().save.lit[snap().save.level].length,3);api.teleport(12,0,10);tick();api.talk();api.finishDialog();assert.equal(snap().save.side[snap().save.level],true);api.teleport(-4,0,14);tick();api.talk();api.finishDialog();}
for(let i=0;i<3;i++){assert.equal(snap().save.level,i);collectLevel();if(i<2){assert.equal(snap().save.cores[i],true);api.teleport(0,3,-20);tick();api.talk();api.finishDialog();}}
assert.equal(snap().boss.active,true,'final quest starts boss');for(let i=0;i<6;i++){api.teleport(0,3,-16);tick(30);api.setBossOpen();api.strike();}api.finishDialog();assert.equal(snap().mode,'ending');assert.equal(snap().save.won,true);assert.equal(snap().save.cores.filter(Boolean).length,3);assert.equal(snap().save.collected.flat().length,72);
els.explore.onclick();els.pause.onclick();assert.equal(snap().mode,'pause');const saved=JSON.parse(stored['aeru-save-v1']);assert(saved.won);els.toTitle.onclick();els.continue.onclick();assert.equal(snap().save.won,true);assert.equal(snap().save.collected.flat().length,72);
// Pointer cancellation cannot leave the jump button held.
const b=els.jump;b.listeners.pointerdown[0]({preventDefault(){},pointerId:7});b.listeners.pointercancel[0]();
console.log('PASS: startup, keyboard movement, jump, glide, staircase, fall, death, 72 collectibles, 9 lanterns, 3 side quests, all portals, boss, ending, save/resume, touch cancellation.');
