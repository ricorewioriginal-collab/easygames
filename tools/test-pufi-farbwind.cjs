'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../pufi-farbwind/game.js'),'utf8');
function boot(saved){
 const els={},storage=new Map(saved?[['easygames.pufi-farbwind.v1',saved]]:[]),winEvents={},buttons=[];
 const noop=()=>{},ctx2d=new Proxy({createLinearGradient:()=>({addColorStop:noop}),setLineDash:noop},{get:(obj,key)=>key in obj?obj[key]:noop});
 function element(id='generated'){
  return {id,hidden:false,textContent:'',style:{},dataset:{},handlers:{},
   classList:{add:noop,remove:noop,toggle:noop},
   addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)},
   replaceChildren:noop,setPointerCapture:noop,setAttribute:noop,getContext:()=>ctx2d};
 }
 for(const key of ['left','right','down','grab','mount','jump','throw']){
  const b=element('control-'+key);b.dataset.action=key;buttons.push(b);
 }
 const document={getElementById:id=>els[id]??=element(id),createElement:()=>element(),querySelectorAll:()=>buttons,addEventListener:noop};
 const win={addEventListener(type,fn){(winEvents[type]??=[]).push(fn)}};
 const c={window:win,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:noop};
 vm.createContext(c);vm.runInContext(code,c);
 const emit=(el,type,props={})=>{for(const fn of el.handlers[type]||[])fn({pointerId:9,clientX:100,clientY:100,cancelable:true,preventDefault:noop,...props})};
 return {api:win.PufiTest,els,buttons,storage,emit,winEvents};
}
let b=boot(),a=b.api;
assert.equal(a.state().mode,'title');
assert.equal(b.els.primary.textContent,'START GAME ▶');
assert.equal(a.state().save.controls,'dpad');
// Original, keyboard-free options menu and persistent controller choice.
b.emit(b.els.options,'click');
assert.equal(a.state().mode,'options');
b.emit(b.els.chooseSwipe,'click');
assert.equal(a.state().save.controls,'swipe');
assert.equal(b.els.dpadControls.hidden,true);
assert.equal(b.els.swipeControls.hidden,false);
b.emit(b.els.primary,'click');
assert.equal(a.state().mode,'title');
assert.equal(boot(b.storage.get('easygames.pufi-farbwind.v1')).api.state().save.controls,'swipe');
// Play and swipe right: release must stop movement, not become a stuck button.
a.start(0);
assert.equal(a.state().world.segments.length,5);
for(let i=0;i<90;i++)a.tick(1/60);
assert.equal(a.state().hero.ground,true);
const zone=b.els.swipeZone;
b.emit(zone,'pointerdown',{pointerId:81});
b.emit(zone,'pointermove',{pointerId:81,clientX:168,clientY:100});
for(let i=0;i<20;i++)a.tick(1/60);
const x1=a.state().hero.x;assert(x1>38);
b.emit(zone,'pointerup',{pointerId:81,clientX:168,clientY:100});
for(let i=0;i<25;i++)a.tick(1/60);
assert(a.state().hero.x-x1<21);
// Multi-touch: releasing one source must not cancel the other.
a.action('right',true,'touch:200');
a.action('right',true,'swipe');
a.action('right',false,'touch:200');
const oldX=a.state().hero.x;
for(let i=0;i<6;i++)a.tick(1/60);
assert(a.state().hero.x>oldX+4);
a.action('right',false,'swipe');
// Face buttons A, B and Y, plus a rideable original companion.
const jump=b.buttons.find(x=>x.dataset.action==='jump');
b.emit(jump,'pointerdown',{pointerId:21});
a.tick(1/60);assert(a.state().hero.vy<0);
b.emit(jump,'pointerup',{pointerId:21});
const throwButton=b.buttons.find(x=>x.dataset.action==='throw');
b.emit(throwButton,'pointerdown',{pointerId:22});
for(let i=0;i<12;i++)a.tick(1/60);
b.emit(throwButton,'pointerup',{pointerId:22});
assert.equal(a.state().hero.ammo,3);
assert.equal(a.state().hero.mounted,true);
const mount=b.buttons.find(x=>x.dataset.action==='mount');
b.emit(mount,'pointerdown',{pointerId:23});
assert.equal(a.state().hero.mounted,false);
b.emit(mount,'pointerup',{pointerId:23});
for(let i=0;i<22;i++)a.tick(1/60);
a.action('mount',true);assert.equal(a.state().hero.mounted,true);
a.state().hero.inv=0;a.hurt();
assert.equal(a.state().hero.hp,3);
assert.equal(a.state().hero.mounted,false);
// Options from gameplay return to pause, then resume safely.
a.openOptions();assert.equal(a.state().mode,'options');
a.setControls('dpad');assert.equal(a.state().save.controls,'dpad');
a.closeOptions();assert.equal(a.state().mode,'pause');
a.action('pause',true);assert.equal(a.state().mode,'play');
// Game over = no pickups carried into the next attempt.
a.gameover('Test');assert.equal(a.state().mode,'gameover');
a.start(0);assert.equal(a.state().hero.ammo,4);
assert.equal(a.state().hero.mounted,true);
assert.equal(a.state().world.score,0);
a.finished();assert.equal(a.state().save.unlocked,2);
assert.equal(boot(b.storage.get('easygames.pufi-farbwind.v1')).api.state().save.unlocked,2);
// All original stages still load, draw, and preserve the two boss locations.
for(let i=0;i<6;i++){
 a.start(i);const w=a.state().world;
 assert.equal(w.segments.length,5);
 assert(w.goal<w.segments.at(-1).x+w.segments.at(-1).w);
 assert.equal(!!w.boss,i===2||i===5);
 a.draw();
}
console.log('PASS: 6 stages, 2 bosses, Start/Options/Pause/Game Over, Tamo, gamepad A/B/Y, swipe/dpad, simultaneous pointers, persistence.');
