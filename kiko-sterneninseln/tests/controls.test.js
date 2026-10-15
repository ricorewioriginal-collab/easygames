import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraRelative} from '../src/controls.js';

test('up always moves away from the camera as it rotates',()=>{
 for(const yaw of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
  const forward=cameraRelative(0,-1,yaw);
  assert.ok(Math.abs(forward.x-Math.sin(yaw))<1e-9);
  assert.ok(Math.abs(forward.z-Math.cos(yaw))<1e-9);
  const right=cameraRelative(1,0,yaw);
  assert.ok(Math.abs(right.x-Math.cos(yaw))<1e-9);
  assert.ok(Math.abs(right.z+Math.sin(yaw))<1e-9);
 }
});
