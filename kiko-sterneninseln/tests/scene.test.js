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
 const renderer={scene:new context.THREE.Scene(),world(){}};const view=new LevelView(renderer,levels[0]);const player=new Player(new Kiko);player.spawn([0,0,-1]);for(let i=0;i<30;i++)player.step(1/60,{x:0,z:0,jump:false},view.platforms,0);assert.equal(player.ground,true);player.step(1/60,{x:0,z:-1,jump:true},view.platforms,0);const first=player.velocity.y;player.step(1/60,{x:0,z:-1,jump:true},view.platforms,0);assert.ok(player.velocity.y<first);for(let i=0;i<75;i++)player.step(1/60,{x:0,z:-1,jump:false},view.platforms,0);assert.ok(player.pos.z>3.5);assert.ok(player.pos.y>-4);view.dispose()
});
