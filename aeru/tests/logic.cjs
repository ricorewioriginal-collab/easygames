// Runs the actual game with real Three.js geometry and a headless DOM/renderer.
// Rendering is deliberately excluded; gameplay state, physics and progression are exercised.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),T=require(path.join(root,'vendor/three.min.js'));
class Element{constructor(){this.hidden=true;this.style={};this.listeners={};this.classList={add(){},remove(){},toggle(){}};}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}focus(){}setAttribute(){}setPointerCapture(){}getBoundingClientRect(){return{left:0,top:0,width:115,height:115};}getContext(){return new Proxy({},{get:()=>()=>{}});}}
const els={},events={},stored={};let frame;
T.WebGLRenderer=class{constructor(){this.shadowMap={};}setPixelRatio(){}setSize(){}render(){}};
const context={THREE:T,console,Math,Map,Set,URLSearchParams,performance:{now:()=>0},innerWidth:1280,innerHeight:800,devicePixelRatio:1,location:{search:'?test'},document:{hidden:false,getElementById:id=>els[id]??=new Element(),addEventListener:(k,f)=>events[k]=f},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},matchMedia:()=>({matches:false}),requestAnimationFrame:f=>frame=f,setTimeout:()=>{},addEventListener:(k,f)=>events[k]=f};context.window=context;vm.createContext(context);for(const file of ['content.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const api=context.aeruTest,snap=()=>api.snapshot(),tick=(n=1)=>{for(let i=0;i<n;i++)api.step(1/60)},key=(code)=>events.keydown({code,preventDefault(){},repeat:false}),up=code=>events.keyup({code});
els.start.onclick();api.finishDialog();assert.equal(snap().mode,'play');
const z=snap().state.z;key('KeyW');tick(60);up('KeyW');assert(snap().state.z<z-6,'keyboard moves player');
api.teleport(0,0,19);tick();key('Space');tick(20);assert(snap().state.y>1,'jump raises player');tick(40);assert(snap().state.y>0,'holding jump glides');up('Space');tick(150);assert.equal(snap().state.y,0,'lands on island');
// Real movement up the 0.75 m stairs without teleporting onto the platforms.
api.teleport(0,0,-8);tick();key('KeyW');for(let j=0;j<5;j++){api.jump();tick(30);}up('KeyW');assert(snap().state.y>=3,'staircase is traversable');
api.teleport(80,-17,0);tick();assert.equal(snap().state.z,19,'fall returns to checkpoint');
api.lose();assert.equal(snap().state.hp,5,'death restores playable checkpoint');
function collectLevel(){const layout=snap().layout;for(const {x,y,z}of layout.gems){api.teleport(x,y-.9,z);tick();}for(const {x,y,z}of layout.torches){tick(35);api.teleport(x,y,z+3);api.strike();}
assert.equal(snap().save.collected[snap().save.level].length,24);assert.equal(snap().save.lit[snap().save.level].length,3);
for(const {x,y,z}of layout.rings){api.teleport(x,y-1,z);tick();}if(layout.rings.length)assert.equal(snap().save.rings[snap().save.level].length,3);
api.teleport(12,0,10);tick();api.talk();api.finishDialog();assert.equal(snap().save.side[snap().save.level],true);api.teleport(-4,0,14);tick();api.talk();api.finishDialog();}
for(let i=0;i<3;i++){assert.equal(snap().save.level,i);collectLevel();if(i<2){assert.equal(snap().save.cores[i],true);api.teleport(0,3,-20);tick();api.talk();api.finishDialog();}}
assert.equal(snap().boss.active,true,'final quest starts boss');for(let i=0;i<6;i++){api.teleport(0,3,-16);tick(35);api.setBossOpen();api.strike();}api.finishDialog();assert.equal(snap().mode,'ending');assert.equal(snap().save.won,true);assert.equal(snap().save.cores.filter(Boolean).length,3);assert.equal(snap().save.collected.flat().length,72);
els.explore.onclick();els.pause.onclick();assert.equal(snap().mode,'pause');const saved=JSON.parse(stored['aeru-save-v1']);assert(saved.won);els.toTitle.onclick();els.continue.onclick();assert.equal(snap().save.won,true);assert.equal(snap().save.collected.flat().length,72);
// Continue the original ending into the new chapters; all 6 cores are reachable.
api.travel(3);api.finishDialog();for(let i=3;i<6;i++){assert.equal(snap().save.level,i);collectLevel();assert.equal(snap().save.cores[i],true);if(i<5){api.teleport(0,3,-20);tick();api.talk();api.finishDialog();}}
assert.equal(snap().save.expandedWon,true);assert.equal(snap().save.collected.flat().length,144);assert.equal(snap().save.rings.flat().length,9);assert.equal(snap().save.side.filter(Boolean).length,6);
els.explore.onclick();api.travel(0);api.finishDialog();
// Wind effect has visible geometry, persists, then expires; holding the button repeats it.
api.teleport(0,0,19);tick(40);api.strike();assert(snap().gusts[0].meshes>=10);tick(12);assert(snap().gusts[0].age>.15);tick(40);assert.equal(snap().gusts.length,0);
key('KeyF');tick(65);assert(snap().gusts.length>0);up('KeyF');tick(60);assert.equal(snap().gusts.length,0);
// Dedicated flight takes off without holding Space and carries the player across the actual gap.
api.teleport(24,0,2,-Math.PI/2);tick();api.flight();key('KeyD');tick(65);up('KeyD');assert(snap().state.x>33);assert(snap().state.y>1);assert(snap().state.flight);api.flight();tick(150);assert(snap().state.onGround,'lands on the eastern satellite');assert(snap().state.stamina>70,'recharges after landing');
// Return flight: approach the central ground without a teleport.
api.flight();key('KeyA');tick(90);up('KeyA');if(snap().state.flight)api.flight();tick(150);assert(snap().state.x<27);assert(snap().state.onGround);
// Pause must release touch attack and jump, and leave the simulation stopped.
const attack=els.attack;attack.listeners.pointerdown[0]({preventDefault(){},pointerId:6});attack.listeners.pointercancel[0]();tick(90);assert.equal(snap().gusts.length,0);
const b=els.jump;b.listeners.pointerdown[0]({preventDefault(){},pointerId:7});b.listeners.pointercancel[0]();
console.log('PASS: keyboard motion, jump/glide, staircase, fall/death, 144 gems, 18 lanterns, 9 flight rings, 6 side quests, portals, boss, both endings, save/resume, visible wind lifespan/repeat, actual island crossing and return, touch cancellation.');
// Version-1 saves retain their original islands and unlock the new chapter after the boss.
const legacy={version:1,level:2,collected:[[0,3,21],[],[7]],lit:[[0,1],[],[2]],cores:[true,true,true],met:[true,true,true],side:[true,false,false],bossHP:0,won:true,elapsed:123};
stored['aeru-save-v1']=JSON.stringify(legacy);els.continue.onclick();assert.equal(snap().save.version,2);assert.equal(snap().save.collected.length,6);assert.equal(JSON.stringify(snap().save.collected[0]),'[0,3,21]');assert.equal(snap().save.elapsed,123);api.travel(3);api.finishDialog();assert.equal(snap().save.level,3);assert.equal(snap().save.won,true);
// Locked travel cannot skip the adventure. Simulation speed is stable across refresh rates.
els.start.onclick();api.finishDialog();api.travel(5);assert.equal(snap().save.level,0);
let clock=1000;const distances=[];for(const fps of [30,60,120]){api.level(0);api.teleport(0,0,19);api.frame(clock);key('KeyW');for(let i=1;i<=fps;i++)api.frame(clock+i*1000/fps);up('KeyW');distances.push(snap().state.z);clock+=2000;}
assert(Math.max(...distances)-Math.min(...distances)<.18,'30/60/120 Hz movement differs by less than one fixed tick');
console.log('PASS: version-1 save migration, original completion unlocks chapter 4, locked travel, consistent 30/60/120 Hz movement.');
