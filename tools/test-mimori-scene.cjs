'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const js=fs.readFileSync(path.join(__dirname,'../mimori/scene-ui.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../mimori/index.html'),'utf8');
assert(html.includes('src="./scene-ui.js"'));
class Node{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.handlers={};this.dataset={};
 this.hidden=false;this.style={};this.attributes={};this.textContent='';this.scrollTop=0;
 this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x),
 toggle:(x,force)=>{const yes=force===undefined?!this.classes.has(x):force;yes?this.classes.add(x):this.classes.delete(x);return yes}};
 }
 append(...children){this.children.push(...children)}
 appendChild(child){this.children.push(child)}
 replaceChildren(...children){this.children=children}
 addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)}
 setAttribute(name,value){this.attributes[name]=String(value)}
 after(node){this.afterItem=node}
 focus(){}
 click(){for(const fn of this.handlers.click||[])fn({preventDefault(){}})}
 querySelectorAll(selector){
  if(selector==='button'||selector==='[data-scene-nav]')return this.children.filter(n=>selector==='button'?n.tagName==='BUTTON':n.dataset.sceneNav);
  return [];
 }
}
const scene=new Node(),stack=new Node(),care=new Node(),status=new Node(),
 world=new Node(),settings=new Node(),panel=new Node(),head=new Node(),drawer=new Node(),drawerHead=new Node();
const sections=Array.from({length:6},()=>new Node('section'));
const drawerSections=Array.from({length:4},()=>new Node('section'));
world.hidden=true;settings.hidden=true;
let livingRoomOpens=0,roomsOpens=0,arcadeOpens=0;
const ids={worldOverlay:world,settingsDrawer:settings,worldOpen:new Node('button'),worldClose:new Node('button'),
settingsClose:new Node('button'),settingsShortcut:new Node('button'),radioLaunch:new Node('button'),
radioSection:sections[5],petAlert:new Node(),miniVitals:new Node()};
panel.querySelectorAll=sel=>sel===':scope > section'?sections:[];
panel.querySelector=sel=>sel==='.worldHead'?head:null;
world.querySelector=sel=>sel==='.worldPanel'?panel:null;
stack.querySelector=sel=>sel==='.carePanel'?care:sel==='.statusPanel'?status:null;
settings.querySelector=sel=>sel==='.drawerPanel'?drawer:null;
drawer.querySelector=sel=>sel==='.drawerHead'?drawerHead:null;
drawer.querySelectorAll=sel=>sel===':scope > section'?drawerSections:[];
const arcade=new Node('button');arcade.addEventListener('click',()=>arcadeOpens++);
care.querySelector=sel=>sel==='[data-care="minigame"]'?arcade:null;
ids.worldOpen.addEventListener('click',()=>{world.hidden=false;roomsOpens++});
ids.worldClose.addEventListener('click',()=>world.hidden=true);
ids.settingsClose.addEventListener('click',()=>settings.hidden=true);
ids.settingsShortcut.addEventListener('click',()=>settings.hidden=false);
const document={querySelector:sel=>sel==='.scene'?scene:sel==='.layout>.stack'?stack:sel==='#worldOpen'?ids.worldOpen:null,
 getElementById:name=>ids[name],createElement:tag=>new Node(tag),
 body:{classList:{toggle(){}}},addEventListener(){}};
const window={MimoriWorldActions:{showLivingRoomRadio(){livingRoomOpens++;world.hidden=false;sections[5].hidden=false}}};
vm.runInNewContext(js,{document,window});
const actions=window.MimoriSceneUI;
assert(actions,'Scene controls failed to boot');
assert.equal(stack.hidden,true);
actions.navigate('care');assert.equal(actions.getState().current,'care');assert.equal(care.hidden,false);
actions.navigate('rooms');assert.equal(actions.getState().current,'rooms');assert.equal(roomsOpens,1);assert.equal(sections[0].hidden,false);
actions.navigate('family');assert.equal(sections[2].hidden,false);assert.equal(sections[0].hidden,true);
actions.navigate('radio');
assert.equal(livingRoomOpens,1,'Radio button must switch to living room');
assert.equal(actions.getState().current,'radio');
assert.equal(sections[5].hidden,false,'Radio stations must be visible');
assert.equal(sections[0].hidden,true,'Room chooser must be hidden');
actions.navigate('games');assert.equal(arcadeOpens,1);assert.equal(world.hidden,true);
ids.radioLaunch.click();
assert.equal(livingRoomOpens,2,'Top-bar radio button must work');
assert.equal(sections[5].hidden,false);
ids.petAlert.click();assert(ids.petAlert.classes.has('expanded'),'Need alerts expandable');
actions.navigate('style');assert.equal(settings.hidden,false);assert.equal(drawerSections[0].hidden,false);
assert.equal(drawerSections[1].hidden,true);
console.log('PASS Mimori scene: one-screen care, room, family, radio via toolbar/dock, arcade, styling and alert');
