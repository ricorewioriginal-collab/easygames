'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const M=require('../mimori/model.js');
const epoch=Date.UTC(2026,9,15,12);
let pet=M.fresh(epoch);
assert.equal(pet.hunger,82);assert.equal(M.evolve(pet),0);
pet=M.advance(pet,epoch+6*3600000);assert.equal(pet.hunger,34);
assert(M.needs(pet).includes('hunger'),'Hunger alert still required after offline time');
let action=M.act(pet,'feed',epoch+6*3600000);
assert(action.ok);assert.equal(action.pet.hunger,64);assert.equal(action.pet.inventory.berry,6);
assert.equal(M.load(JSON.parse(JSON.stringify(action.pet)),epoch+7*3600000).hunger,56);
assert.equal(M.act({...pet,energy:0},'play',epoch+6*3600000).ok,false);
for(let i=0;i<65;i++)pet=M.act(pet,'cuddle',epoch+6*3600000+i*1000).pet;
assert(M.evolve(pet)>=1);
assert.equal(M.rename(pet,'<Mimi>').name,'Mimi');
assert.equal(M.fresh(epoch).coins,0);
assert.equal(M.load(M.fresh(epoch),epoch).accessory,0);
const earned=M.rewardMini(M.fresh(epoch),'catch',500,true,epoch);
assert(earned.ok&&earned.coins>0&&earned.xp>0);
assert.equal(earned.pet.records.catch,500);
assert.equal(M.rewardMini(earned.pet,'catch',200,false,epoch).pet.records.catch,500);
const daily=M.claimDaily(earned.pet,epoch);
assert(daily.ok);assert.equal(M.claimDaily(daily.pet,epoch).ok,false);
const purchase=M.shop({...daily.pet,coins:300},'accessory',2);
assert(purchase.ok&&purchase.pet.accessory===2);
assert.equal(M.load(purchase.pet,epoch+1000).accessory,2);
assert.equal(M.shop(M.fresh(epoch),'theme',2).ok,false);
// Classic pet-care tests: accidents, care, medicine and sleep.
let messy=M.advance(M.fresh(epoch),epoch+6*3600000);
assert(messy.mess>0,'No surprise toilet accident');
assert.equal(messy.sick,true,'Long unattended waste should cause sickness');
assert(M.needs(messy).includes('mess')&&M.needs(messy).includes('sick'));
const beforeCure=messy.health;
let treated=M.act(messy,'medicine',epoch+6*3600000);
assert(treated.ok&&!treated.pet.sick&&treated.pet.health>beforeCure);
assert(M.act(treated.pet,'medicine',epoch+6*3600000).ok!==undefined);
const removed=M.act(treated.pet,'cleanup',epoch+6*3600000);
assert(removed.ok&&removed.pet.mess===0);
assert.equal(M.act(removed.pet,'cleanup',epoch+6*3600000).ok,false);
let tired={...M.fresh(epoch),energy:22,hunger:85},withLights=M.act(tired,'sleep',epoch).pet;
assert(withLights.sleeping);
const lightOnRecovery=M.advance(withLights,epoch+3600000).energy;
let dark=M.act(withLights,'light',epoch).pet;
assert(dark.lightsOff);
const deepSleep=M.advance(dark,epoch+3600000);
assert(deepSleep.energy>lightOnRecovery+20,'Dark room did not improve sleeping recovery');
assert(M.load(JSON.parse(JSON.stringify(deepSleep)),epoch+3600000).lightsOff);
const needsToilet={...M.fresh(epoch),toiletNeed:83,nextAccident:epoch+3600000};
const bathroom=M.act(needsToilet,'toilet',epoch);
assert(bathroom.ok&&bathroom.pet.toiletNeed===0);
assert(bathroom.pet.nextAccident>epoch+3600000);
const legacy=M.load({version:1,born:epoch,updated:epoch,name:'Alt',hunger:80,energy:70,joy:70,clean:70,health:70},epoch+1);
assert.equal(legacy.mess,0);assert.equal(legacy.sick,false);assert(legacy.nextAccident>epoch);


assert.deepEqual(M.species,['Fluffi','Nubbi','Foxi','Drachi']);
assert.equal(M.fresh(epoch).species,0);
for(let i=0;i<4;i++){
 const animal=M.changeSpecies(pet,i);assert.equal(animal.species,i);
 assert.equal(M.load(JSON.parse(JSON.stringify(animal)),epoch+6*3600000).species,i);
 for(let color=0;color<4;color++)assert.equal(M.load({...animal,color},epoch+6*3600000).color,color);
}
assert.equal(M.load({version:1,name:'Alt',born:epoch,updated:epoch,color:2,hunger:70,joy:70,energy:70,clean:70,health:70,inventory:{berry:2,soap:1}},epoch+10).species,0);

const html=fs.readFileSync(path.join(__dirname,'../mimori/index.html'),'utf8');
assert(html.includes('data-game="mimori"'));
assert(html.includes('data-prefix="easygames.mimori.v1"'));
assert(html.includes('data-mount="#cloudMount"'));
assert(html.includes('src="./sound.js"'));
assert(html.includes('property="og:image"')&&html.includes('mimori/cover.png'),'Mimori OG preview metadata missing');
assert(html.includes('name="twitter:card"')&&html.includes('summary_large_image'));
assert(html.includes('id="fxLayer"'));
for(const id of ['settingsDrawer','settingsShortcut','settingsClose','settingsBackdrop','turnLeft','turnRight','resetView','speciesName','danceBtn','voiceBtn','surpriseBtn','toiletBtn','cleanupBtn','medicineBtn','lightBtn','alertSoundToggle','petAlert','petAlertText','nightShade','messScene','toiletNeed','messLabel','sickLabel','lightLabel']){
 assert(html.includes('id="'+id+'"'),'missing '+id);
}
for(let i=0;i<4;i++)assert(html.includes('data-species="'+i+'"'));
assert(html.includes('grid-template-areas:"scene" "care" "stats"'),'mobile pet-first layout missing');
assert(!html.includes('Push-Server')&&!html.includes('Web-Push'));
const sw=fs.readFileSync(path.join(__dirname,'../mimori/sw.js'),'utf8');
assert(sw.includes("'./sound.js'")&&sw.includes("'../cloud/anmacha-cloud.js'"));
assert(!sw.includes("addEventListener('push'"));

const ui={},ls=new Map(),events={window:{}},notifications=[],noop=()=>{};
let renderFrame=null;const speciesButtons=[],careButtons=[];
function element(){
 return {textContent:'',hidden:false,clientWidth:570,clientHeight:500,dataset:{},children:[],
  style:{setProperty:noop},handlers:{},classList:{add:noop,remove:noop,toggle:noop},focus:noop,setPointerCapture:noop,querySelector:()=>element(),
  addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)},
  appendChild(child){this.children.push(child)},replaceChildren(){this.children=[]},
  setAttribute:noop,getContext:()=>({})};
}
class Shape{
 constructor(){this.position={set:noop};this.rotation={x:0,y:0,z:0};this.scale={set:noop,setScalar:noop};this.children=[];this.geometry={dispose:noop};this.material={dispose:noop}}
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
 MeshStandardMaterial:class{dispose(){}},MeshBasicMaterial:class{dispose(){}},SphereGeometry:Geometry,CylinderGeometry:Geometry,
 BoxGeometry:Geometry,CircleGeometry:Geometry,TorusGeometry:Geometry,ConeGeometry:Geometry,sRGBEncoding:3001};
const C={playCalls:[],enabled:true,play(k){this.playCalls.push(k)},isEnabled(){return this.enabled},toggle(){return this.enabled=!this.enabled}};
const mockNotification={permission:'default',requestPermission:async()=>{mockNotification.permission='granted';return 'granted'}};
const serviceWorker={getRegistration:async()=>({showNotification:async(t,d)=>notifications.push({title:t,...d})})};
const win={MimoriModel:M,MimoriSound:C,THREE,Notification:mockNotification,isSecureContext:true,addEventListener:noop,prompt:()=>null};
for(let i=0;i<4;i++){const b=element();b.dataset.species=String(i);speciesButtons.push(b)}
for(const kind of ['feed','toilet','cleanup','medicine','light','sleep']){
 const b=element();b.dataset.care=kind;careButtons.push(b);
}
const document={getElementById:id=>ui[id]??=element(),
 querySelectorAll:sel=>sel==='[data-species]'?speciesButtons:sel==='[data-care]'?careButtons:[],
 addEventListener:noop,createElement:element,hidden:false,body:{classList:{add:noop,remove:noop}}};
const localStorage={getItem:k=>ls.get(k)||null,setItem:(k,v)=>ls.set(k,v)};
const context={window:win,document,localStorage,navigator:{serviceWorker},Notification:mockNotification,
 location:{href:'https://example.org/easygames/mimori/'},URL,performance:{now:()=>100},Date,Math,console,
 requestAnimationFrame:cb=>{if(!renderFrame)renderFrame=cb},setInterval:noop,clearTimeout:noop,setTimeout:noop};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../mimori/game.js'),'utf8'),context);
assert(win.MimoriDebug,'3D scene failed to start');
assert.equal(win.MimoriDebug.get().hunger,82);
win.MimoriDebug.act('feed');
assert.equal(win.MimoriDebug.get().inventory.berry,6);
assert(C.playCalls.includes('feed'));
assert(ui.fxLayer.children.length>0,'missing animated care effects');
assert.equal(ui.petname.textContent,'Mimori');
assert.equal(ui.messScene.children.length,0);
assert.equal(ui.lightBtn.handlers.click?.length||0,0,'care button should be bound through data-care delegation');
const lightCare=careButtons.find(b=>b.dataset.care==='light'),sleepCare=careButtons.find(b=>b.dataset.care==='sleep');
assert(lightCare.handlers.click.length===1&&sleepCare.handlers.click.length===1);
lightCare.handlers.click[0]();assert.equal(win.MimoriDebug.get().lightsOff,true);
assert.equal(ui.lightLabel.textContent,'Aus');
sleepCare.handlers.click[0]();assert.equal(win.MimoriDebug.get().sleeping,true);
assert.equal(ui.sleepStatus.hidden,false);
lightCare.handlers.click[0]();assert.equal(ui.lightLabel.textContent,'An');
assert.equal(ui.sleepStatus.hidden,true);
sleepCare.handlers.click[0]();assert.equal(win.MimoriDebug.get().sleeping,false);
ui.alertSoundToggle.handlers.click[0]();assert.equal(win.MimoriDebug.alertSound(),true);


assert(!ui.webglError||ui.webglError.hidden!==false,'failed WebGL mock init');
// Four models must truly change shape and not just color.
const meshCounts=[];
for(let i=0;i<4;i++){
 win.MimoriDebug.switchSpecies(i);
 assert.equal(win.MimoriDebug.get().species,i);
 meshCounts.push(win.MimoriDebug.model().children.length);
}
assert.equal(new Set(meshCounts).size,4,'all creatures share the same geometry');
assert.equal(JSON.parse(ls.get('easygames.mimori.v1')).species,3,'species not persisted to Google-synced save');
// Each of four species retains the selected color on model reconstruction.
ui.changeColor.handlers.click[0]();
assert.equal(JSON.parse(ls.get('easygames.mimori.v1')).color,1);
// Touch/swipe rotation and the visible turn controls must change actual 3D model orientation.
const canvas=ui.viewport.children[0],oldOrbit=win.MimoriDebug.orbit();
const fire=(type,e)=>canvas.handlers[type][0]({pointerId:77,clientX:130,preventDefault:noop,...e});
fire('pointerdown',{});fire('pointermove',{clientX:330});fire('pointerup',{clientX:330});
assert(win.MimoriDebug.orbit()>oldOrbit+1.0,'touch drag did not rotate');
assert.equal(typeof renderFrame,'function');
renderFrame(240);assert(win.MimoriDebug.model().rotation.y>0,'render did not rotate creature');
const last=win.MimoriDebug.orbit();ui.turnLeft.handlers.click[0]();
assert(win.MimoriDebug.orbit()<last,'turn-left button did nothing');
ui.resetView.handlers.click[0]();assert.equal(win.MimoriDebug.orbit(),0);
ui.settingsShortcut.handlers.click[0]();assert.equal(ui.settingsDrawer.hidden,false);
speciesButtons[2].handlers.click[0]();assert.equal(win.MimoriDebug.get().species,2);
assert.equal(ui.settingsDrawer.hidden,true);
ui.danceBtn.handlers.click[0]();assert(C.playCalls.includes('dance'),'dance sound absent');
ui.voiceBtn.handlers.click[0]();assert(C.playCalls.includes('species'),'species voice absent');
ui.surpriseBtn.handlers.click[0]();assert(ui.fxLayer.children.length>0,'surprise effects absent');
async function testNotifications(){
 const toggle=ui.pushToggle.handlers.click[0];
 await toggle();assert.equal(win.MimoriDebug.reminders().enabled,true);
 await win.MimoriDebug.checkReminders(true);assert.equal(notifications.length,1);
 assert(notifications[0].title.includes('Mimori'));
 await toggle();assert.equal(win.MimoriDebug.reminders().enabled,false);
 assert.equal(ui.pushTest.disabled,true);
}
testNotifications().then(()=>console.log('PASS Mimori: four unique models, working touch rotation, app layout, dancing/voices/surprises, clouds and notifications'))
.catch(e=>{console.error(e);process.exitCode=1});
