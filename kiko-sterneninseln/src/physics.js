import {characterById} from './characters.js?v=9';
import {floorHeight,insideFloor} from './terrain.js?v=9';
export class Player{
 constructor(kiko){this.kiko=kiko;this.pos=kiko.root.position;this.velocity={x:0,y:0,z:0};this.ground=false;this.hearts=3;this.invincible=0;this.checkpoint={x:0,y:0,z:0};this.facing=0;this.jumpBuffer=0;this.coyote=0;this.profile=characterById(kiko.characterId);this.shield=0;this.shieldUsed=false;this.lastHit=''}
 setCharacter(id){this.profile=characterById(id);this.shield=this.profile.shield&&!this.shieldUsed?1:0}
 spawn(p){this.shieldUsed=false;this.setCharacter(this.kiko.characterId);this.pos.set(p[0],p[1]+.02,p[2]);this.velocity={x:0,y:0,z:0};this.ground=false;this.jumpBuffer=0;this.coyote=0;this.hearts=3;this.checkpoint={x:this.pos.x,y:this.pos.y,z:this.pos.z}}
 step(dt,input,platforms,world,blockers=[]){
  if(input.jump)this.jumpBuffer=.13;
  let remaining=Math.max(0,Math.min(dt,.1)),fallen=false;
  while(remaining>1e-7){const slice=Math.min(remaining,1/120);fallen=this.integrate(slice,input,platforms,world,blockers)||fallen;remaining-=slice}
  return fallen
 }
 integrate(dt,input,platforms,world,blockers){
  this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);this.coyote=this.ground?.08:Math.max(0,this.coyote-dt);this.invincible=Math.max(0,this.invincible-dt);
  const speed=this.profile.speed*(world===2?.945:1),accel=this.ground?(world===2?3:13):6;
  this.velocity.x+=(input.x*speed-this.velocity.x)*Math.min(1,accel*dt);
  this.velocity.z+=(input.z*speed-this.velocity.z)*Math.min(1,accel*dt);
  if(this.jumpBuffer>0&&this.coyote>0){this.velocity.y=this.profile.jump;this.ground=false;this.coyote=0;this.jumpBuffer=0}
  this.velocity.y-=25*dt;
  const old={x:this.pos.x,y:this.pos.y,z:this.pos.z},wasGround=this.ground,radius=.32;
  // Resolve the two horizontal axes separately. Higher ledges block Kiko until he jumps.
  const solid=p=>{const h=floorHeight(p,this.pos.x,this.pos.z);return p.active!==false&&!p.slope&&old.y<h-.04&&old.y+1.15>h-(p.thickness||1.4)};
  this.pos.x+=this.velocity.x*dt;
  for(const p of platforms)if(solid(p)&&Math.abs(old.z-p.z)<p.d/2+radius&&Math.abs(this.pos.x-p.x)<p.w/2+radius){
   if(old.x<=p.x-p.w/2-radius){this.pos.x=p.x-p.w/2-radius;this.velocity.x=0}
   else if(old.x>=p.x+p.w/2+radius){this.pos.x=p.x+p.w/2+radius;this.velocity.x=0}
  }
  this.pos.z+=this.velocity.z*dt;
  for(const p of platforms)if(solid(p)&&Math.abs(this.pos.x-p.x)<p.w/2+radius&&Math.abs(this.pos.z-p.z)<p.d/2+radius){
   if(old.z<=p.z-p.d/2-radius){this.pos.z=p.z-p.d/2-radius;this.velocity.z=0}
   else if(old.z>=p.z+p.d/2+radius){this.pos.z=p.z+p.d/2+radius;this.velocity.z=0}
  }
  for(const b of blockers)if(old.y<b.y+.8&&Math.hypot(this.pos.x-b.x,this.pos.z-b.z)<b.r+radius){this.pos.x=old.x;this.pos.z=old.z;this.velocity.x=0;this.velocity.z=0}
  this.pos.y+=this.velocity.y*dt;this.ground=false;
  // The underside is solid too: Kiko cannot jump through a floating slab.
  if(this.velocity.y>0)for(const p of platforms)if(p.active!==false&&insideFloor(p,this.pos.x,this.pos.z,-radius)&&old.y+1.15<=floorHeight(p,this.pos.x,this.pos.z)-(p.thickness||1.4)&&this.pos.y+1.15>=floorHeight(p,this.pos.x,this.pos.z)-(p.thickness||1.4)){this.pos.y=floorHeight(p,this.pos.x,this.pos.z)-(p.thickness||1.4)-1.15;this.velocity.y=0}
  if(this.velocity.y<=0){let landing=null;for(const p of platforms)if(p.active!==false&&insideFloor(p,this.pos.x,this.pos.z,.12)&&((old.y>=floorHeight(p,this.pos.x,this.pos.z)-.08&&this.pos.y<=floorHeight(p,this.pos.x,this.pos.z))||(p.slope&&wasGround&&Math.abs(old.y-floorHeight(p,this.pos.x,this.pos.z))<.18))&&(!landing||floorHeight(p,this.pos.x,this.pos.z)>floorHeight(landing,this.pos.x,this.pos.z)))landing=p;
   if(landing){this.pos.y=floorHeight(landing,this.pos.x,this.pos.z);this.velocity.y=0;this.ground=true}
  }
  if(Math.hypot(this.velocity.x,this.velocity.z)>.15){const target=Math.atan2(this.velocity.x,this.velocity.z);this.facing+=Math.atan2(Math.sin(target-this.facing),Math.cos(target-this.facing))*(1-Math.exp(-dt*15))}
  this.kiko.root.rotation.y=this.facing;return this.pos.y<-5
 }
 hit(reason='contact'){this.lastHit='';if(this.invincible)return false;this.invincible=1.5;if(this.shield&&reason!=='fall'){this.shield=0;this.shieldUsed=true;this.lastHit='shield';return false}this.hearts--;this.lastHit='damage';return this.hearts<=0}
 respawn(){this.pos.set(this.checkpoint.x,this.checkpoint.y,this.checkpoint.z);this.velocity={x:0,y:0,z:0};this.ground=false;this.jumpBuffer=0;this.coyote=0;this.invincible=1.5}
}
