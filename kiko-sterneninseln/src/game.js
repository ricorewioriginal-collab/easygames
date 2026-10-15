import {puzzleComplete,activateLight,windAt,updateMechanics} from './mechanics.js?v=10';
import {levels,worlds,validateLevels,LEVEL_COUNT} from './data.js?v=10';
import {SaveManager} from './save.js?v=10';
import {Input} from './input.js?v=10';
import {Audio} from './audio.js?v=10';
import {Renderer,Kiko,LevelView} from './scene.js?v=10';
import {Player} from './physics.js?v=10';
import {UI} from './ui.js?v=10';
import {cameraRelative} from './controls.js?v=10';
import {characterById} from './characters.js?v=10';
window.__worlds=worlds;
export class Game{
 constructor(){
  if(!window.THREE)throw Error('Three.js konnte nicht geladen werden.');if(!validateLevels())throw Error('Leveldaten sind ungültig.');
  this.state='BOOT';this.save=new SaveManager;this.renderer=new Renderer(document.querySelector('#stage'),this.save);this.input=new Input(this.save,this.renderer.renderer.domElement,()=>this.state==='PLAYING');this.audio=new Audio(this.save);
  this.kiko=new Kiko(this.save.data.character);this.renderer.scene.add(this.kiko.root);this.player=new Player(this.kiko);this.view=new LevelView(this.renderer,levels[0]);this.kiko.root.position.set(0,0,-1);
  this.index=0;this.time=0;this.yaw=0;this.count=0;this.bonus=0;this.puzzle=0;this.bossHits=0;this.lastInteract=false;this.lastJump=false;this.ui=new UI(this);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.state==='PLAYING')this.pause()});this.fpsFrames=0;this.fpsTime=0;this.clock=performance.now();requestAnimationFrame(t=>this.frame(t))
 }
 selectCharacter(id,persist=true){const c=characterById(id);this.kiko.setCharacter(c.id);this.player.setCharacter(c.id);this.save.data.character=c.id;if(persist)this.save.write();if(this.state==='PLAYING')this.ui.updateHud();return c}
 start(i){
  if(i<0||i>=LEVEL_COUNT||i>=this.save.data.unlocked)return;this.input.reset();this.state='LOADING';
  try{
   this.view?.dispose();this.index=i;this.view=new LevelView(this.renderer,levels[i]);this.kiko.setCharacter(this.save.data.character);const p=levels[i].start;this.player.spawn([p[0],p[1],levels[i].path[0][1]-1]);this.kiko.root.visible=true;
   this.count=0;this.bonus=0;this.puzzle=0;this.bossHits=0;this.score=0;this.yaw=0;this.time=0;this.hits=0;this.falls=0;this.deaths=0;this.stomps=0;this.lastPickup=-99;this.combo=0;this.pulseReadyAt=0;this.checkpointReached=false;this.routeIndex=0;this.timerUntil=0;this.lesson=i===0&&!this.save.data.tutorialDone?{moved:false,collected:false,jumped:false}:null;
   this.lastInteract=false;this.lastJump=false;this.lastBossHit=-9;this.lastBossAttack=-9;this.renderer.snapFollow(this.player.pos,this.yaw);this.state='PLAYING';this.ui.playing();
   if(this.lesson&&!this.introShown){this.introShown=true;this.ui.intro()}else this.ui.message(levels[i].notes,5000)
  }catch(e){console.error(e);this.state='ERROR';this.ui.error(e)}
 }
 pause(){if(this.state==='PLAYING'){this.input.reset();this.state='PAUSED';this.ui.pause()}}
 resume(){if(this.state==='PAUSED'){this.input.reset();this.lastJump=false;this.lastInteract=false;this.state='PLAYING';this.ui.playing()}}
 endSequence(){this.state='ENDING';this.view.startEnding();const p=this.view.portal.position;this.player.pos.set(p.x,p.y,p.z-3);this.yaw=0;this.renderer.snapFollow(this.player.pos,this.yaw)}
 retryCheckpoint(){this.input.reset();this.lastJump=false;this.lastInteract=false;this.player.hearts=3;this.player.respawn();this.state='PLAYING';this.ui.playing()}
 puzzleDone(){return puzzleComplete(this)}
 near(a,b,r=1.45){return Math.hypot(a.x-b.x,a.z-b.z)<r&&Math.abs(a.y-b.y)<2}
 damage(reason='contact'){
  const dead=this.player.hit(reason);
  if(this.player.lastHit==='shield'){this.ui.message('Boros Schild hat den Treffer abgefangen!');this.view.burst(this.player.pos,0xffd37b)}
  if(this.player.lastHit==='damage'){this.hits++;this.kiko.react('hit');this.audio.tone(160,.25,'sawtooth');this.ui.message('Autsch! Ein Herz verloren. Bonussterne und Checkpoints heilen.');this.ui.updateHud()}
  if(dead){this.deaths++;this.state='GAME_OVER';this.input.reset();this.ui.gameOver()}return dead
 }
 pulse(){
  if(this.time<this.pulseReadyAt){this.ui.message('Der Sternenpuls lädt noch auf.');return false}
  const c=this.player.profile;this.pulseReadyAt=this.time+c.cooldown;this.view.pulse(this.player.pos,c.pulse);let caught=0;
  for(const e of this.view.enemies)if(this.near(this.player.pos,e.mesh.position,c.pulse)){if(!e.stunned){this.score+=10;caught++}e.stunned=3.5}
  let lit=0;if(this.view.level.puzzle==='beacons')for(const s of this.view.switches)if(this.near(this.player.pos,s.mesh.position,c.pulse)&&activateLight(this,s))lit++;this.view.setPuzzle(this.puzzleDone());this.kiko.react('collect');this.audio.tone(340,.3,'triangle',.2);this.ui.message(lit?`Leuchtfeuer ${this.puzzle}/${this.view.level.switchStages.length} entzündet`:caught?'Schattenwesen kurz betäubt!':'Sternenpuls! Er betäubt nahe Schattenwesen.');return true
 }
 interact(){
  const l=levels[this.index],p=this.player.pos;
  for(const s of this.view.switches){
   if(!this.near(p,s.mesh.position,1.9))continue;
   if(l.puzzle==='boss'){
    if(this.bossHits>=3)return true;
    if(this.count<5){this.ui.message('Sammle zuerst alle fünf Kristalle.');return true}
    if(Math.sin(this.time*(2.2+this.bossHits*.4))<=.2){this.ui.message('Warte, bis das Herz blau leuchtet.');return true}
    if(this.time-this.lastBossHit<1.3)return true;
    this.lastBossHit=this.time;this.bossHits++;this.kiko.react('collect');this.audio.tone(180+this.bossHits*140,.3,'triangle',.4);this.view.burst(s.mesh.position,0x8bedff);this.ui.message(['Phase 2: Dem Lichtstrahl seitlich ausweichen!','Phase 3: Über die Schattenwelle springen!','Das Sternenherz ist gereinigt!'][this.bossHits-1]);return true
   }
   if(l.puzzle==='beacons')return this.pulse();if(l.puzzle==='plates'){this.ui.message('Bleibe kurz auf der Sternenplatte stehen.');return true}if(l.puzzle==='timed'){this.timerUntil=this.time+(l.timer||18);this.puzzle=1;s.active=true;s.mesh.children[1].material.color.set(0x7cfff3);this.view.setPuzzle(true);this.ui.message('Zeitfenster geöffnet – folge dem Weg zum Portal!');return true}
   if(s.active){this.ui.message('Dieser Lichtstein ist bereits aktiviert.');return true}
   if(l.puzzle==='sequence'&&s.index!==this.puzzle){this.puzzle=0;this.view.switches.forEach(a=>{a.active=false;a.mesh.children[1].material.color.set(0xffe38d)});this.ui.message('Falsche Reihenfolge. Beginne bei 1.');return true}
   s.active=true;this.puzzle++;s.mesh.children[1].material.color.set(0x7cfff3);this.kiko.react('collect');this.audio.tone(500+this.puzzle*140,.18);
   this.ui.message(l.puzzle==='key'?'Schlüssel gefunden – Tor geöffnet!':l.puzzle==='sequence'?`Lichtstein ${this.puzzle}/3`:`Schalter ${this.puzzle}/${this.view.switches.length} aktiviert`);this.view.setPuzzle(this.puzzleDone());return true
  }
  return this.pulse()
 }
 collect(){
  const p=this.player.pos;
  for(const c of this.view.crystals)if(!c.got&&this.near(p,c.mesh.position,1)){
   c.got=true;c.mesh.visible=false;this.count++;this.combo=this.time-this.lastPickup<6?Math.min(3,this.combo+1):1;this.lastPickup=this.time;this.score+=100+(this.combo-1)*25;this.kiko.react('collect');this.view.burst(c.mesh.position,0x89f8ff);this.audio.tone(450+this.count*80,.18);if(this.lesson)this.lesson.collected=true;this.ui.updateHud()
  }
  for(const s of this.view.stars)if(!s.got&&this.near(p,s.mesh.position,1)){s.got=true;s.mesh.visible=false;this.bonus++;this.score+=50;this.player.hearts=Math.min(3,this.player.hearts+1);this.kiko.react('collect');this.view.burst(s.mesh.position,0xffdb77);this.audio.tone(780,.25);this.ui.message('Bonusstern! Ein Herz aufgefüllt.');this.ui.updateHud()}
 }
 updateEnemies(){
  for(const e of this.view.enemies){
   if(e.stunned||!this.near(this.player.pos,e.mesh.position,.8))continue;
   if(e.type==='hopper'&&this.player.velocity.y<-.5&&this.player.pos.y>e.mesh.position.y+.15){e.stunned=4;this.player.velocity.y=6.8;this.player.ground=false;this.score+=40;this.stomps++;this.kiko.react('collect');this.view.burst(e.mesh.position,0xd9b6ff);this.ui.message('Sprungtreffer! Schattenhüpfer betäubt.');continue}
   if(this.player.invincible<=0&&this.damage())return
  }
  for(const e of this.view.obstacles)if(this.near(this.player.pos,e.mesh.position,.8)&&this.player.invincible<=0&&this.damage())return
 }
 updateBoss(){
  if(levels[this.index].puzzle!=='boss')return;
  const sw=this.view.switches[0],phase=this.bossHits,cycle=Math.sin(this.time*(2.2+phase*.4)),p=this.player.pos,near=Math.hypot(p.x-sw.mesh.position.x,p.z-sw.mesh.position.z);
  this.view.setBossState(phase,cycle,this.count===5&&phase<3);const onGround=p.y<levels[this.index].path.at(-1)[4]+.45;
  const danger=phase===0?near<2.3&&onGround:phase===1?Math.abs(p.x-(sw.mesh.position.x+Math.sin(this.time*3)*2.7))<.65&&near<4:near<3.2&&onGround;
  if(this.count===5&&phase<3&&danger&&cycle<-.6&&this.time-this.lastBossAttack>1.3){this.lastBossAttack=this.time;this.damage('boss')}
 }
 update(dt){
  const raw=this.input.sample(dt);if(raw.pause){this.pause();return}this.time+=dt;this.yaw+=raw.look*this.save.data.settings.sensitivity;
  const input={...cameraRelative(raw.x,raw.z,this.yaw),jump:raw.jump&&!this.lastJump,windX:windAt(this)};this.lastJump=raw.jump;if(raw.interact&&!this.lastInteract)this.interact();this.lastInteract=raw.interact;
  const p=this.player.pos,previousZ=p.z;
  const fallen=this.player.step(dt,input,[...this.view.platforms.filter(x=>x.active),...this.view.links,...(this.view.bridgeFloor?.active?[this.view.bridgeFloor]:[]),...this.view.bonusFloors],levels[this.index].world,this.view.blockers);
  if(fallen){this.falls++;if(this.damage('fall'))return;this.player.respawn();this.ui.message('Zurück auf sicherem Boden. Springe über die Lücken.')}
  if(this.lesson){if(Math.hypot(p.x-levels[0].start[0],p.z+1)>.7)this.lesson.moved=true;if(input.jump&&this.player.velocity.y>0)this.lesson.jumped=true}
  this.kiko.animate(this.time,Math.min(1,Math.hypot(this.player.velocity.x,this.player.velocity.z)/5),this.player.ground,this.player.invincible>0,dt);this.view.touchFloor(this.player);this.view.update(dt,true);
  for(const f of this.view.platforms)if(f.moving&&this.player.ground&&Math.abs(p.y-f.y)<.05&&Math.abs(p.x-(f.x-f.shift))<f.w/2-.4&&Math.abs(p.z-f.z)<f.d/2-.4)p.x+=f.shift;
  if(this.view.gate?.visible){const gate=this.view.gate.position;if(Math.abs(p.x-gate.x)<(this.view.gate.userData.width||7)/2+.32&&Math.abs(p.z-gate.z)<.52&&p.y<gate.y+1.4&&p.y+1.15>gate.y-1.4){p.z=gate.z+(previousZ<gate.z?-.52:.52);this.player.velocity.z=0}}
  updateMechanics(this,dt);if(this.state!=='PLAYING')return;this.collect();this.updateEnemies();if(this.state!=='PLAYING')return;
  const mid=levels[this.index].path[levels[this.index].checkpoint];if(!this.checkpointReached&&this.near(p,{x:mid[0]+2,y:mid[4],z:mid[1]},1.2)){this.checkpointReached=true;this.player.checkpoint={x:mid[0]+2,y:mid[4]+.02,z:mid[1]};this.player.hearts=3;this.view.checkpoint.material.color.set(0x54dfae);this.view.burst(this.view.checkpoint.position,0xa1ffd7);this.ui.message('Checkpoint gespeichert – alle Herzen aufgefüllt!');this.ui.updateHud()}
  this.updateBoss();if(this.state!=='PLAYING')return;
  const ready=this.count===5&&this.puzzleDone();this.view.portalActive(ready);this.ui.updateObjective();
  if(ready&&this.near(p,this.view.portal.position,1.2)){
   this.lastRun={time:this.time,hits:this.hits,deaths:this.deaths+this.falls,stomps:this.stomps};this.save.finish(this.index,this.bonus,this.score,this.lastRun);this.lastRun.medal=this.bonus===3&&!this.lastRun.hits&&!this.lastRun.deaths?3:this.bonus>=2?2:1;
   this.state='LEVEL_COMPLETE';this.kiko.react('win');this.audio.tone(880,.6,'sine',.4);this.ui.complete()
  }
 }
 frame(now){
  try{
   const dt=Math.min(.05,(now-this.clock)/1000||0);this.clock=now;this.fpsFrames++;this.fpsTime+=dt;if(this.fpsTime>4){if(this.save.data.settings.quality==='auto'&&this.fpsFrames/this.fpsTime<42&&this.renderer.autoScale>1){this.renderer.autoScale=1;this.renderer.resize()}this.fpsFrames=0;this.fpsTime=0}
   if(this.state==='PLAYING')this.update(dt);
   else if(this.state==='MENU'){this.time+=dt;this.yaw+=dt*.04;this.player.pos.set(0,0,-1);this.kiko.root.rotation.y=this.time*.25;this.kiko.animate(this.time,.25,true,false,dt);this.view?.update(dt,true)}
   else if(this.state==='ENDING'||this.state==='LEVEL_COMPLETE'){this.time+=dt;this.kiko.root.rotation.y+=dt*.7;this.kiko.animate(this.time,.4,true,false,dt);this.view?.update(dt,true)}
   this.renderer.follow(this.player.pos,this.yaw,dt);this.renderer.render();this.audio.tick(dt,this.state==='PLAYING')
  }catch(e){console.error(e);this.state='ERROR';this.ui.error(e)}requestAnimationFrame(t=>this.frame(t))
 }
}
