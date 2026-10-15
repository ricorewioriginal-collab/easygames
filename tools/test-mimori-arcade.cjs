'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../mimori/arcade.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../mimori/arcade.css'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../mimori/index.html'),'utf8');
assert(html.includes('src="./arcade.js"'));assert(html.includes('href="./arcade.css"'));
assert(!html.includes('Sammle fünf Sterne innerhalb von 14 Sekunden'));
for(const id of ['arcadeShell','arcadeCards','arcadeLaneButtons','arcadeCanvas','arcadeMemory','arcadeResult'])assert(source.includes(id));
assert(css.includes('.arcadeCard')&&css.includes('.arcadeMemoryGrid')&&css.includes('.arcadeLane'));
let ids={},lastId=0,queue=new Map(),timeoutId=0,now=0,rewardCalls=[],soundCalls=[];
const body={classList:{add(){},remove(){}},appendChild(el){this.child=el}};
const noop=()=>{};
const gradient=()=>({addColorStop:noop});
const ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>{o[k]=v;return true}});
function node(tag){
 const object={tagName:tag.toUpperCase(),id:'',className:'',hidden:false,disabled:false,
  textContent:'',style:{},dataset:{},children:[],handlers:{},
  classList:{add(){},remove(){},toggle(){}},
  setAttribute(){},appendChild(child){this.children.push(child);return child},append(...a){for(const el of a)this.appendChild(el)},
  replaceChildren(...a){this.children=a},remove(){},focus(){},
  addEventListener(k,cb){(this.handlers[k]??=[]).push(cb)},
  querySelector(sel){if(sel[0]==='#')return ids[sel.slice(1)]||null;return null},
  querySelectorAll(sel){if(sel==='[data-card]')return this.children;return []},
  getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:360,height:420}),
  get innerHTML(){return this._innerHTML||''},
  set innerHTML(s){this._innerHTML=s;
   if(this.id==='arcadeShell')for(const m of s.matchAll(/id="([^"]+)"/g)){
    const tag=m[1]==='arcadeCanvas'?'canvas':'div';ids[m[1]]=node(tag);ids[m[1]].id=m[1];
   }
  }
 };
 return object;
}
const doc={body,hidden:false,createElement:node,addEventListener:noop};
const win={};
const controls={
 requestAnimationFrame:fn=>{const id=++lastId;queue.set(id,fn);return id},
 cancelAnimationFrame:id=>queue.delete(id)
};
vm.runInNewContext(source,{window:win,document:doc,Math,console,
 requestAnimationFrame:controls.requestAnimationFrame,cancelAnimationFrame:controls.cancelAnimationFrame,
 setTimeout:()=>++timeoutId,clearTimeout:noop});
assert(win.MimoriArcade,'Arcade module did not boot');
assert.equal(win.MimoriArcade.games.length,5);
const api=win.MimoriArcade;
const options={records:()=>({catch:0}),sound:k=>soundCalls.push(k),
 onReward:(id,score,won)=>{rewardCalls.push({id,score,won});return {coins:10,xp:5}}};
api.open(options);assert.equal(body.child.hidden,false);
assert.equal(ids.arcadeLobby.children.length,2);
function tick(count){
 for(let i=0;i<count;i++){now+=1000/60;const next=[...queue.entries()][0];if(!next)break;queue.delete(next[0]);next[1](now)}
}
for(const g of api.games){
 const before=rewardCalls.length;
 api.start(g.id);
 assert.equal(api.debug().id,g.id);assert.equal(api.debug().score,0);
 if(g.id==='catch'){
  assert.equal(ids.arcadeCanvas.hidden,false);
  ids.arcadeCanvas.handlers.pointerdown[0]({clientX:200,clientY:330,preventDefault:noop});
 }
 if(g.id==='memory'){
  assert.equal(ids.arcadeCanvas.hidden,true);
  assert.equal(ids.arcadeMemory.children.length,12);
  ids.arcadeMemory.handlers.click[0]({target:{closest:()=>ids.arcadeMemory.children[0]}});
  assert.notEqual(ids.arcadeMemory.children[0].textContent,'✦');
 }
 if(g.id==='rhythm'){
  assert.equal(ids.arcadeLaneButtons.hidden,false);
  assert.equal(ids.arcadeLaneButtons.children.length,4);
  ids.arcadeLaneButtons.handlers.pointerdown[0]({target:{closest:()=>ids.arcadeLaneButtons.children[0]},preventDefault:noop});
 }
 if(g.id==='runner'){
  assert.equal(ids.arcadeAction.hidden,false);
  ids.arcadeAction.handlers.click[0]();
  ids.arcadeCanvas.handlers.pointerdown[0]({clientX:180,clientY:180,preventDefault:noop});
 }
 if(g.id==='bubbles')ids.arcadeCanvas.handlers.pointerdown[0]({clientX:180,clientY:180,preventDefault:noop});
 tick(4000);
 assert.equal(rewardCalls.length,before+1,'game '+g.id+' did not terminate exactly once');
 assert.equal(rewardCalls.at(-1).id,g.id);
 assert(Number.isFinite(rewardCalls.at(-1).score));
 assert.equal(api.debug().ended,true);
 assert.equal(ids.arcadeResult.hidden,false);
 tick(60);assert.equal(rewardCalls.length,before+1,'duplicate payout in '+g.id);
 api.close();assert.equal(body.child.hidden,true);
 api.open(options);
}
assert.equal(rewardCalls.length,5);
console.log('PASS Mimori Arcade: five actual game loops, touch input, timers, exits, finite scores and one reward per game');
