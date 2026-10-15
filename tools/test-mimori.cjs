'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const M=require('../mimori/model.js'),P=require('../mimori/push-server/push-logic.cjs');
const epoch=Date.UTC(2026,9,15,12);
let pet=M.fresh(epoch);
assert.equal(pet.hunger,82);assert.equal(M.evolve(pet),0);
pet=M.advance(pet,epoch+6*3600000);assert.equal(pet.hunger,34);
assert.deepEqual(M.needs(pet),['hunger']);
let result=M.act(pet,'feed',epoch+6*3600000);assert(result.ok);assert.equal(result.pet.hunger,64);
assert.equal(result.pet.inventory.berry,6);
const restore=M.load(JSON.parse(JSON.stringify(result.pet)),epoch+7*3600000);
assert.equal(restore.hunger,56);
assert.equal(M.act({...restore,energy:0},'play',epoch+7*3600000).ok,false);
for(let i=0;i<60;i++){pet=M.act(pet,'cuddle',epoch+6*3600000+i*1000).pet;}
assert(M.evolve(pet)>=1);
assert(M.rename(pet,'<Mimi>').name==='Mimi');
const entry={pet:{name:'Mimori',updated:epoch,hunger:82,joy:82,energy:82,clean:88},
settings:{quietStart:22,quietEnd:8,offsetMinutes:0,threshold:35,cooldownHours:5},lastSent:{}};
const note=P.selectReminder(entry,epoch+7*3600000);
assert.equal(note.key,'hunger');
assert.equal(P.selectReminder(entry,epoch+11*3600000),null);
entry.lastSent.hunger=epoch+7*3600000;
assert.notEqual(P.selectReminder(entry,epoch+8*3600000)?.key,'hunger');
// Browser smoke test: simulate UI, local storage, Three.js and basic 3D setup.
const ui={},ls=new Map(),noop=()=>{};
function element(){
 return {textContent:'',hidden:false,clientWidth:570,clientHeight:500,style:{},dataset:{},
 classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild:noop,replaceChildren:noop,
 setAttribute:noop,getContext:()=>({})};
}
class Shape {constructor(){this.position={set:noop};this.rotation={};this.scale={set:noop,setScalar:noop};this.children=[];this.geometry={dispose:noop};this.material={dispose:noop}}
 add(a){this.children.push(a)}remove(a){this.children=this.children.filter(v=>v!==a)}}
class Geometry{dispose(){}}
class Renderer{constructor(){this.domElement=element();this.domElement.width=570;this.domElement.height=500}
 setPixelRatio(){}getPixelRatio(){return 1}setClearColor(){}setSize(){}render(){}}
class Camera extends Shape{lookAt(){}updateProjectionMatrix(){}}
const fakeThree={WebGLRenderer:Renderer,Scene:Shape,Fog:class{},PerspectiveCamera:Camera,
 HemisphereLight:Shape,DirectionalLight:Shape,PointLight:Shape,Group:Shape,Mesh:Shape,
 MeshStandardMaterial:class{dispose(){}},SphereGeometry:Geometry,CylinderGeometry:Geometry,BoxGeometry:Geometry,
 CircleGeometry:Geometry,TorusGeometry:Geometry,ConeGeometry:Geometry,sRGBEncoding:3001};
const win={MimoriModel:M,THREE:fakeThree,addEventListener:noop,prompt:()=>null};
const document={getElementById:id=>ui[id]??=element(),querySelectorAll:()=>[],addEventListener:noop,createElement:element};
const context={window:win,document,crypto:{randomUUID:()=> '550e8400-e29b-41d4-a716-446655440000'},
 localStorage:{getItem:k=>ls.get(k)||null,setItem:(k,v)=>ls.set(k,v)},navigator:{},
 fetch:async()=>({ok:true,json:async()=>({apiBase:''})}),performance:{now:()=>100},
 requestAnimationFrame:noop,setInterval:noop,clearTimeout:noop,setTimeout:noop,Date,Math,console};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../mimori/game.js'),'utf8'),context);
assert(win.MimoriDebug,'3D client failed to initialize');
assert.equal(win.MimoriDebug.get().hunger,82);
win.MimoriDebug.act('feed');
assert.equal(win.MimoriDebug.get().inventory.berry,6);
assert(ui.petname.textContent==='Mimori');
assert(ui.webglError.hidden!==false,'WebGL initialization reported failure');
console.log('PASS Mimori: time-aware pet care, growth, push quiet hours/thresholds, 3D scene initialization and feeding UI');
