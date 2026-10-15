import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {levels,worlds} from '../src/data.js';

const context={};vm.runInNewContext(readFileSync(new URL('../vendor/three.min.js',import.meta.url),'utf8'),context);
globalThis.window={THREE:context.THREE,__worlds:worlds};
const {Kiko,LevelView}=await import('../src/scene.js');
const {Player}=await import('../src/physics.js');

test('all eight 3D worlds build with active objects and dispose cleanly',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 for(const l of levels){const view=new LevelView(renderer,l);assert.equal(view.platforms.length,5);assert.equal(view.crystals.length,5);assert.equal(view.stars.length,3);assert.ok(view.portal);view.update(1/60,true);view.portalActive(true);view.dispose();assert.equal(renderer.scene.children.length,0)}
});
test('Kiko lands, cannot double jump, and can cross the first gap',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};const view=new LevelView(renderer,levels[0]);const player=new Player(new Kiko);player.spawn([0,0,-1]);for(let i=0;i<30;i++)player.step(1/60,{x:0,z:0,jump:false},view.platforms,0);assert.equal(player.ground,true);player.step(1/60,{x:0,z:1,jump:true},view.platforms,0);const first=player.velocity.y;player.step(1/60,{x:0,z:1,jump:true},view.platforms,0);assert.ok(player.velocity.y<first);for(let i=0;i<75;i++)player.step(1/60,{x:0,z:1,jump:false},view.platforms,0);assert.ok(player.pos.z>3.5);assert.ok(player.pos.y>-4);view.dispose()
});
test('physics route reaches every level portal across all platform gaps',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 for(const l of levels){const view=new LevelView(renderer,l),player=new Player(new Kiko);player.spawn([l.path[0][0],l.path[0][4],l.path[0][1]-1]);for(let j=1;j<5;j++){let reached=false;for(let n=0;n<450;n++){const a=l.path[j-1],b=l.path[j],dx=b[0]-player.pos.x,dz=b[1]-player.pos.z,m=Math.max(1,Math.hypot(dx,dz));const jump=player.ground&&player.pos.z>a[1]+1.2&&player.pos.z<b[1]-1.2;view.update(1/60,true);player.step(1/60,{x:dx/m,z:dz/m,jump},view.platforms.filter(p=>p.active),l.world);if(Math.hypot(dx,dz)<.9&&player.ground){reached=true;break}if(player.pos.y<-9)break}assert.ok(reached,`${l.name}: platform ${j}`)}assert.ok(Math.abs(player.pos.z-l.portal[1])<4);view.dispose()}
});
test('sun meadow decoration and switch bridge have real 3D meshes and collision',()=>{
 const renderer={scene:new context.THREE.Scene(),world(){}};
 const meadow=new LevelView(renderer,levels[0]);
 assert.ok(meadow.root.children.some(o=>o.isInstancedMesh&&o.count===12));
 meadow.dispose();
 const bridge=new LevelView(renderer,levels[1]);
 assert.equal(bridge.bridge.visible,false);
 assert.equal(bridge.bridgeFloor.active,false);
 bridge.setPuzzle(true);
 assert.equal(bridge.bridge.visible,true);
 assert.equal(bridge.bridgeFloor.active,true);
 bridge.dispose();
});
