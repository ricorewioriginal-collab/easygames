'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../mimori/radio.js'),'utf8');
let audio,playCount=0;
class FakeAudio{
 constructor(){this.src='';this.events={};audio=this}
 addEventListener(name,fn){this.events[name]=fn}
 pause(){}
 play(){playCount++;return Promise.resolve()}
 load(){}
 removeAttribute(attr){if(attr==='src')this.src=''}
}
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.handlers={};this.classList={toggle(){}};
 this.dataset={};this.textContent=''}
 append(...items){this.children.push(...items)}
 appendChild(child){this.children.push(child)}
 replaceChildren(...items){this.children=items}
 addEventListener(type,fn){this.handlers[type]=fn}
 querySelectorAll(selector){
 const all=[];const visit=e=>{if(e.dataset.station)all.push(e);for(const child of e.children)visit(child)};
 visit(this);return selector==='[data-station]'?all:[];
 }
}
const document={createElement:tag=>new Element(tag)},window={};
vm.runInNewContext(source,{window,document,Audio:FakeAudio});
const radio=window.MimoriRadio;
assert.equal(radio.stations.length,13);
const panel=new Element('div');radio.mount(panel);
assert.equal(panel.querySelectorAll('[data-station]').length,13);
async function run(){
 const ok=await radio.play('ricorewi');assert(ok);
 assert.equal(audio.src,'https://stream.laut.fm/ricorewi');
 assert.equal(radio.getStatus().live,true);
 const other=panel.querySelectorAll('[data-station]')[12];
 await other.handlers.click();await Promise.resolve();
 assert.equal(audio.src,'https://stream.laut.fm/special-radio');
 assert.equal(playCount,2);
 radio.stop();assert.equal(radio.getStatus().live,false);assert.equal(audio.src,'');
 assert.equal(await radio.play('not-a-real-station'),false);
 console.log('PASS Mimori Radio: 13 choices, exact stream URLs, user-triggered playback, switching and stop');
}
run().catch(e=>{console.error(e);process.exitCode=1});
