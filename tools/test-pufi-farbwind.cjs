'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../pufi-farbwind/game.js'),'utf8');
function boot(saved){
 const els={},storage=new Map(saved?[['easygames.pufi-farbwind.v1',saved]]:[]),
 noop=()=>{},context=new Proxy({createLinearGradient:()=>({addColorStop:noop})},{get:(o,k)=>k in o?o[k]:noop});
 const mk=()=>({hidden:false,dataset:{},classList:{add:noop,remove:noop},addEventListener:noop,replaceChildren:noop,getContext:()=>context});
 const document={getElementById:id=>els[id]??=mk(),createElement:mk,querySelectorAll:()=>[],addEventListener:noop};
 const win={addEventListener:noop};const ctx={window:win,document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:noop};
 vm.createContext(ctx);vm.runInContext(code,ctx);return{game:win.PufiTest,els,storage};
}
const b=boot(),a=b.game;
assert.equal(a.state().mode,'title');assert.equal(b.els.primary.textContent,'START GAME ▶');
a.start(0);assert.equal(a.state().world.segments.length,5);
for(let i=0;i<90;i++)a.tick(1/60);
assert.equal(a.state().hero.ground,true);
a.action('jump',true);a.tick(1/60);assert(a.state().hero.vy<0);a.action('jump',false);
a.action('throw',true);for(let i=0;i<14;i++)a.tick(1/60);a.action('throw',false);
assert.equal(a.state().hero.ammo,3);
a.gameover('Test');assert.equal(a.state().mode,'gameover');
a.start(0);assert.equal(a.state().hero.ammo,4);assert.equal(a.state().world.score,0);
a.finished();assert.equal(a.state().save.unlocked,2);
assert.equal(boot(b.storage.get('easygames.pufi-farbwind.v1')).game.state().save.unlocked,2);
for(let i=0;i<6;i++){a.start(i);const w=a.state().world;assert(w.goal<w.segments.at(-1).x+w.segments.at(-1).w);assert.equal(!!w.boss,i===2||i===5);a.draw()}
console.log('PASS: menu, walk, jump, throw, game over, complete reset, unlock, persistence, six stages and two bosses.');
