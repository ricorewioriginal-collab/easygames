// Rendering, guidance and collision all use this same timed attack description.
export const BOSS_ACTION_RADIUS=2.5;
export function bossFrame(game){
 const phase=game.bossHits||0,active=game.count===5&&phase<3&&game.bossStartedAt!=null;
 const warning=1.2,attack=phase===2?1.1:1.5,recovery=3.2,total=warning+attack+recovery;
 const elapsed=active?Math.max(0,game.time-game.bossStartedAt)%total:0;
 const mode=!active?'idle':elapsed<warning?'warning':elapsed<warning+attack?'attack':'recovery';
 const progress=Math.max(0,Math.min(1,(elapsed-warning)/attack));
 return {phase,mode,weak:mode==='recovery',type:phase===1?'beam':'ring',
  remaining:mode==='warning'?warning-elapsed:mode==='attack'?warning+attack-elapsed:total-elapsed,
  radius:.5+progress*(phase===2?3.5:3.3),maxRadius:phase===2?4:3.8,
  angle:-Math.PI/2+progress*Math.PI,width:.28,length:8,height:.18,thickness:.12};
}
export function bossTouchesPlayer(frame,player,center){
 if(frame.mode!=='attack')return false;
 // Feet must overlap the low attack. Every guardian's normal jump clears it.
 const y=player.pos.y-center.y;
 if(y>=frame.height+frame.thickness/2+.1||y+1.15<frame.height-frame.thickness/2)return false;
 const dx=player.pos.x-center.x,dz=player.pos.z-center.z,radius=.32;
 if(frame.type==='ring')return Math.abs(Math.hypot(dx,dz)-frame.radius)<frame.thickness/2*frame.radius+radius;
 const across=dx*Math.cos(frame.angle)-dz*Math.sin(frame.angle),along=dx*Math.sin(frame.angle)+dz*Math.cos(frame.angle);
 return Math.abs(across)<frame.width/2+radius&&Math.abs(along)<frame.length/2+radius;
}
export function bossJumpSoon(game){
 const center=game.view.switches[0]?.mesh.position;
 return !!center&&game.player.ground&&bossTouchesPlayer(bossFrame({...game,time:game.time+.2}),game.player,center);
}
