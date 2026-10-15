'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const M=require('../mimori/model.js');
const epoch=Date.UTC(2026,9,15,12);
let pet=M.fresh(epoch);
assert.equal(pet.hunger,82);assert.equal(M.evolve(pet),0);
pet=M.advance(pet,epoch+6*3600000);assert.equal(pet.hunger,34);
assert.deepEqual(M.needs(pet),['hunger']);
let action=M.act(pet,'feed',epoch+6*3600000);
assert(action.ok);assert.equal(action.pet.hunger,64);assert.equal(action.pet.inventory.berry,6);
assert.equal(M.load(JSON.parse(JSON.stringify(action.pet)),epoch+7*3600000).hunger,56);
assert.equal(M.act({...pet,energy:0},'play',epoch+6*3600000).ok,false);
for(let i=0;i<65;i++)pet=M.act(pet,'cuddle',epoch+6*3600000+i*1000).pet;
assert(M.evolve(pet)>=1);
assert.equal(M.rename(pet,'<Mimi>').name,'Mimi');

const html=fs.readFileSync(path.join(__dirname,'../mimori/index.html'),'utf8');
assert(html.includes('data-game="mimori"'));
assert(html.includes('data-prefix="easygames.mimori.v1"'));
assert(html.includes('data-mount="#cloudMount"'));
assert(html.includes('src="./sound.js"'));
assert(html.includes('id="fxLayer"'));
assert(!html.includes('Push-Server')&&!html.includes('Web-Push'));
const sw=fs.readFileSync(path.join(__dirname,'../mimori/sw.js'),'utf8');
assert(sw.includes("'./sound.js'")&&sw.includes("'../cloud/anmacha-cloud.js'"));
assert(!sw.includes("addEventListener('push'"));

const ui={},ls=new Map(),events={window:{}},notifications=[],noop=()=>{};
function element(){
 return {textContent:'',hidden:false,clientWidth:570,clientHeight:500,dataset:{},children:[],
  style:{setProperty:noop},handlers:{},classList:{add:noop,remove:noop,toggle:noop},
  addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)},
  appendChild(child){this.children.push(child)},replaceChildren(){this.children=[]},
  setAttribute:noop,getContext:()=>({})};
}
class Shape{
 constructor(){this.position={set:noop};this.rotation={};this.scale={set:noop,setScalar:noop};this.children=[];this.geometry={dispose:noop};this.material={dispose:noop}}
 add(a){this.children.push(a)}remove(a){this.children=this.children.filter(v=>v!==a)}
}
class Geometry{dispose(){}}
class Renderer{
 constructor(){this.domElement=element();this.domElement.width=570;this.domElement.height=500;this.shadowMap={enabled:false}}
 setPixelRatio(){}getPixelRatio(){return 1}setClearColor(){}setSize(){}render(){}
}
class Camera extends Shape{lookAt(){}updateProjectionMatrix(){}}
const THREE={WebGLRenderer:Renderer,Scene:Shape,Fog:class{},PerspectiveCamera:Camera,
 HemisphereLight:Shape,DirectionalLight:Shape,PointLight:Shape,Group:Shape,Mesh:Shape,
 MeshStandardMaterial:class{dispose(){}},SphereGeometry:Geometry,CylinderGeometry:Geometry,
 BoxGeometry:Geometry,CircleGeometry:Geometry,TorusGeometry:Geometry,ConeGeometry:Geometry,sRGBEncoding:3001};
const C={playCalls:[],enabled:true,play(k){this.playCalls.push(k)},isEnabled(){return this.enabled},toggle(){return this.enabled=!this.enabled}};
const mockNotification={permission:'default',requestPermission:async()=>{mockNotification.permission='granted';return 'granted'}};
const serviceWorker={getRegistration:async()=>({showNotification:async(t,d)=>notifications.push({title:t,...d})})};
const win={MimoriModel:M,MimoriSound:C,THREE,Notification:mockNotification,isSecureContext:true,addEventListener:noop,prompt:()=>null};
const document={getElementById:id=>ui[id]??=element(),querySelectorAll:()=>[],addEventListener:noop,createElement:element,hidden:false};
const localStorage={getItem:k=>ls.get(k)||null,setItem:(k,v)=>ls.set(k,v)};
const context={window:win,document,localStorage,navigator:{serviceWorker},Notification:mockNotification,
 location:{href:'https://example.org/easygames/mimori/'},performance:{now:()=>100},Date,Math,console,
 requestAnimationFrame:noop,setInterval:noop,clearTimeout:noop,setTimeout:noop};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../mimori/game.js'),'utf8'),context);
assert(win.MimoriDebug,'3D scene failed to start');
assert.equal(win.MimoriDebug.get().hunger,82);
win.MimoriDebug.act('feed');
assert.equal(win.MimoriDebug.get().inventory.berry,6);
assert(C.playCalls.includes('feed'));
assert(ui.fxLayer.children.length>0,'missing animated care effects');
assert.equal(ui.petname.textContent,'Mimori');
assert(!ui.webglError||ui.webglError.hidden!==false,'failed WebGL mock init');
async function testNotifications(){
 const toggle=ui.pushToggle.handlers.click[0];
 await toggle();assert.equal(win.MimoriDebug.reminders().enabled,true);
 await win.MimoriDebug.checkReminders(true);assert.equal(notifications.length,1);
 assert(notifications[0].title.includes('Mimori'));
 await toggle();assert.equal(win.MimoriDebug.reminders().enabled,false);
 assert.equal(ui.pushTest.disabled,true);
}
testNotifications().then(()=>console.log('PASS Mimori: sounds, FX, 3D, local reminders, care progression, Google markup and offline SW'))
.catch(e=>{console.error(e);process.exitCode=1});
