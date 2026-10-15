import test from 'node:test';
import assert from 'node:assert/strict';
import {SaveManager,KEY,defaults} from '../src/save.js';
class Element{
 constructor(){this.children=[];this.parentElement=null;this.hidden=false;this.textContent=''}
 append(...nodes){for(const n of nodes){if(n.parentElement)n.parentElement.children=n.parentElement.children.filter(x=>x!==n);n.parentElement=this;this.children.push(n)}}
 replaceChildren(...nodes){for(const c of this.children)c.parentElement=null;this.children=[];this.append(...nodes)}
}
const elements=Object.fromEntries(['#screen','#hud','#hud-left','#hud-right','#hint','#touch','#objective','#pause','#cloudAccount','#cloudMount','#jump small','#interact small'].map(k=>[k,new Element]));
globalThis.document={querySelector:s=>elements[s],createElement:()=>new Element};
class Observer{constructor(callback){this.callback=callback}observe(){}}
globalThis.MutationObserver=Observer;globalThis.window={MutationObserver:Observer,addEventListener(){}};
const {UI}=await import('../src/ui.js');
function setup(){for(const e of Object.values(elements))e.replaceChildren();const values=new Map;globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};let resized=0;const game={state:'BOOT',index:0,count:0,bonus:0,score:0,yaw:0,input:{touch:true},save:new SaveManager,renderer:{resize(){resized++}},player:{hearts:3,pos:{x:0,y:0,z:0}},view:{level:{puzzle:'none'},crystals:[],switches:[],portal:{position:{x:0,y:0,z:0}}},puzzleDone:()=>true,pause(){},resume(){},start(){}};const widget=new Element;elements['#cloudMount'].append(widget);elements['#cloudAccount'].append(elements['#cloudMount']);const ui=new UI(game);return {ui,game,widget,values,get resized(){return resized}}}
test('one Google widget survives menu changes and is absent from gameplay',()=>{const {ui,game,widget}=setup(),card=ui.cloudAccount;assert.equal(card.hidden,false);assert.equal(card.parentElement,elements['#screen'].children[0]);game.state='PLAYING';ui.playing();assert.equal(card.hidden,true);assert.equal(card.parentElement.parentElement,null);game.state='PAUSED';ui.pause();assert.equal(card.hidden,false);assert.equal(ui.cloudAccount,card);assert.equal(elements['#cloudMount'].children[0],widget);ui.complete();assert.equal(ui.cloudAccount,card);assert.equal(elements['#cloudMount'].children[0],widget)});
test('a restored cloud save refreshes level unlocks and settings in the active menu',()=>{const h=setup(),remote=structuredClone(defaults);remote.unlocked=6;remote.stars[0]=3;h.values.set(KEY,JSON.stringify(remote));h.ui.cloudObserver.callback();assert.equal(h.game.save.data.unlocked,6);assert.equal(h.game.save.data.stars[0],3);assert.equal(h.resized,1);assert.equal(elements['#cloudMount'].children[0],h.widget);h.ui.cloudObserver.callback();assert.equal(h.resized,1)});
