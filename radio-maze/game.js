/* AnMaCha Radio Maze 3D – Three.js arcade engine. No build step. */
(function () {
'use strict';
const L = window.RadioMazeLogic, THREE = window.THREE;
const $ = id => document.getElementById(id);
const SAVE_KEY = 'easygames.radio-maze.v1', MAX_LEVEL = 60;
const WORLD = [
  { name:'Neon-Frequenzen', wall:0x2789e9, floor:0x080e29, accent:0x57edff, fog:0x101e49 },
  { name:'Disco-Labyrinth', wall:0xc043b8, floor:0x1a0b29, accent:0xff78e3, fog:0x280e32 },
  { name:'Goldene Hits', wall:0xd59126, floor:0x241808, accent:0xffde7e, fog:0x31200a },
  { name:'Rock-Frequenz', wall:0xb93c60, floor:0x210d18, accent:0xff748b, fog:0x2f0e20 },
  { name:'Cosmic Radio', wall:0x6545c9, floor:0x0e0a25, accent:0xb29bff, fog:0x1d1240 },
  { name:'Finale: Senderturm', wall:0x22a88e, floor:0x071d1d, accent:0x75ffe2, fog:0x0a3030 }
];
const DEFAULT = () => ({ version:1, unlocked:1, lastLevel:1, best:0, completed:0, progress:null, sound:true });
function getSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return DEFAULT();
    return {
      version:1,
      unlocked:Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(raw.unlocked)||1))),
      lastLevel:Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(raw.lastLevel)||1))),
      best:Math.max(0,Math.floor(Number(raw.best)||0)),
      completed:Math.max(0,Math.floor(Number(raw.completed)||0)),
      progress:raw.progress && typeof raw.progress === 'object' ? raw.progress : null,
      sound:raw.sound !== false
    };
  } catch (_) { return DEFAULT(); }
}
let save = getSave(), state = null, scene = null, camera = null, renderer = null, board = null;
let playerMesh = null, pelletMesh = null, extras = [], ghosts = [], logoTextures = [];
let lastFrame = 0, lastSave = 0, toastTimeout = 0, selectedWorld = 0, audioCtx = null, initialized = false;
const temp = new THREE.Matrix4();
const hud = $('hud'), pad = $('pad'), stage = $('stage');
const directionKeys = { ArrowUp:0, KeyW:0, ArrowRight:1, KeyD:1, ArrowDown:2, KeyS:2, ArrowLeft:3, KeyA:3 };
function updateLoader(value, message) {
  $('loadBar').style.width = Math.round(value) + '%'; $('loadPercent').textContent = Math.round(value) + ' %';
  $('loadText').textContent = message;
}
function saveLocal() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { console.warn('Radio Maze: localStorage unavailable',e); }
}
function checkpoint(force) {
  if (!state || state.mode !== 'playing') return;
  const now = Date.now();
  if (!force && now - lastSave < 4000) return;
  lastSave = now;
  save.lastLevel = state.level;
  save.best = Math.max(save.best,state.score);
  save.progress = { level:state.level, score:state.score, lives:state.lives, x:state.player.x, z:state.player.z,
                    used:Array.from(state.used), at:now };
  saveLocal();
}
function tone(freq, length=.08, wave='sine', volume=.055) {
  if (!save.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    const osc=audioCtx.createOscillator(), gain=audioCtx.createGain(), t=audioCtx.currentTime;
    osc.type=wave; osc.frequency.setValueAtTime(freq,t); gain.gain.setValueAtTime(volume,t);
    gain.gain.exponentialRampToValueAtTime(.0001,t+length);
    osc.connect(gain).connect(audioCtx.destination); osc.start(t); osc.stop(t+length+.015);
  } catch (_) {}
}
function say(message) {
  const el=$('message'); el.textContent=message; el.hidden=false;
  clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>{el.hidden=true},2100);
}
function updateHud() {
  if (!state) return;
  $('world').textContent=WORLD[state.theme].name;
  $('level').textContent='Level '+state.level+' / '+MAX_LEVEL;
  $('score').textContent=state.score.toLocaleString('de-DE');
  $('best').textContent=Math.max(save.best,state.score).toLocaleString('de-DE');
  $('lives').textContent=''+state.lives;
  $('remaining').textContent=''+state.remaining;
  $('powerStatus').hidden=!(state.power > 0);
  $('powerLeft').textContent=Math.ceil(state.power)+' s';
  $('soundBtn').textContent=save.sound?'♫':'♪̸';
}
function showMenu() {
  if (state && state.mode==='playing') checkpoint(true);
  if (state) state.mode='menu';
  save=getSave();
  $('menu').hidden=false; $('picker').hidden=true; $('overlay').hidden=true; hud.hidden=true; pad.hidden=true;
  $('powerStatus').hidden=true;
  $('resumeTitle').textContent=save.unlocked>1?'Willkommen zurück!':'Dein Radio-Abenteuer';
  $('saveInfo').textContent='Freigeschaltet: '+save.unlocked+' / '+MAX_LEVEL+' · Highscore: '+save.best.toLocaleString('de-DE')+' Punkte';
  $('continueLabel').textContent='Level '+(save.progress && save.progress.level<=save.unlocked?save.progress.level:save.lastLevel);
  $('unlockInfo').textContent='('+save.unlocked+' offen)';
}
function showDialog(symbol, title, message, primaryText, action, secondText='Zum Hauptmenü', secondary=showMenu) {
  $('overlaySymbol').textContent=symbol; $('overlayTitle').textContent=title; $('overlayText').textContent=message;
  $('primaryAction').textContent=primaryText; $('secondaryAction').textContent=secondText;
  $('primaryAction').onclick=action; $('secondaryAction').onclick=secondary; $('overlay').hidden=false;
}
function pause(toggle=true) {
  if (!state || !['playing','paused'].includes(state.mode)) return;
  if (state.mode==='paused') { state.mode='playing'; $('overlay').hidden=true; lastFrame=performance.now(); return; }
  if (!toggle) return;
  checkpoint(true); state.mode='paused';
  showDialog('⏸','Sendepause','Dein Fortschritt ist lokal gespeichert. Weiter geht’s, sobald du bereit bist.',
    '▶ Weiterspielen',()=>pause(), 'Hauptmenü',showMenu);
}
function gameOver() {
  state.mode='gameover'; save.best=Math.max(save.best,state.score); save.progress=null; saveLocal();
  tone(165,.28,'sawtooth');
  showDialog('💔','Sendepause auf unbestimmt','Die Geister haben dich erwischt! Punkte: '+state.score.toLocaleString('de-DE'),
    '↺ Level erneut spielen',()=>startLevel(state.level,false), 'Hauptmenü',showMenu);
}
function finishLevel() {
  state.mode='completed'; tone(740,.3,'triangle');
  save.best=Math.max(save.best,state.score);
  save.completed+=1; save.unlocked=Math.max(save.unlocked,Math.min(MAX_LEVEL,state.level+1));
  save.lastLevel=Math.min(MAX_LEVEL,state.level+1); save.progress=null; saveLocal();
  updateHud();
  showDialog('🏆','Frequenz gerettet!',WORLD[state.theme].name+' geschafft! '+state.score.toLocaleString('de-DE')+' Punkte gesammelt.',
    state.level<MAX_LEVEL?'▶ Nächstes Level':'↺ Noch einmal spielen',
    ()=>startLevel(state.level<MAX_LEVEL?state.level+1:MAX_LEVEL,false,state.level<MAX_LEVEL?state.score:0,Math.min(5,state.lives+1)), 'Zum Hauptmenü',showMenu);
}
function makeScene() {
  scene=new THREE.Scene();
  camera=new THREE.OrthographicCamera(-20,20,20,-20,.1,120);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.65));
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.setClearColor(0x070c1b);
  stage.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xc1d9ff,0x24304a,1.25));
  const sun=new THREE.DirectionalLight(0xffffff,1.15);sun.position.set(-6,22,12);scene.add(sun);
  const gl= new THREE.PointLight(0x6eeeff,1.7,70);gl.position.set(0,10,0);scene.add(gl);
  window.addEventListener('resize',resize);
  resize();
}
function resize() {
  if (!renderer) return;
  const w=Math.max(stage.clientWidth,1), h=Math.max(stage.clientHeight,1), aspect=w/h;
  renderer.setSize(w,h,false);
  const s=state?.maze?.size||21;
  const side=s+4.5;
  // View from above at a slight 3D angle: keep complete level in viewport.
  const viewH=Math.max(side*1.06,side/(aspect*.91));
  camera.left=-viewH*aspect/2;camera.right=viewH*aspect/2;camera.top=viewH/2;camera.bottom=-viewH/2;
  camera.position.set(0,s*2.15,s*.67);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
}
function material(hex,emissive=.16,roughness=.38) {
  return new THREE.MeshStandardMaterial({color:hex,emissive:hex,emissiveIntensity:emissive,metalness:.23,roughness});
}
function disposeScene() {
  if (!board) return;
  scene.remove(board);
  board.traverse(obj=>{
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) (Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>m.dispose());
  });
  board=null;pelletMesh=null;playerMesh=null;ghosts=[];extras=[];
}
function makeBox(w,h,d,mat,x,y,z) {
  const obj=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);obj.position.set(x,y,z);board.add(obj);return obj;
}
function makeGhost(p,index) {
  const colors=[0xff5d85,0x45e7ff,0xffb74d,0xb580ff], g=new THREE.Group();
  const bodyMat=material(colors[index%4],.37,.46);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.39,18,12),bodyMat);head.position.y=.67;g.add(head);
  const robe=new THREE.Mesh(new THREE.CylinderGeometry(.37,.35,.48,14),bodyMat);robe.position.y=.36;g.add(robe);
  const white=new THREE.MeshBasicMaterial({color:0xffffff}), black=new THREE.MeshBasicMaterial({color:0x111a36});
  for (const xx of [-.15,.15]) {
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.105,10,8),white);
    eye.position.set(xx,.71,-.32);g.add(eye);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(.047,8,8),black);
    pupil.position.set(xx,.71,-.42);g.add(pupil);
  }
  board.add(g);
  const ghost={x:p.x,z:p.z,oldX:p.x,oldZ:p.z,home:{x:p.x,z:p.z},group:g,cool:1,seed:index};
  ghosts.push(ghost);return ghost;
}
function putOnGrid(mesh,x,z,y=.0) {
  mesh.position.set(x-(state.maze.size-1)/2,y,z-(state.maze.size-1)/2);
}
function buildBoard() {
  disposeScene();
  const data=state.maze,n=data.size,theme=WORLD[state.theme];
  board=new THREE.Group();scene.add(board);
  scene.background=new THREE.Color(theme.fog);
  const floorMat=material(theme.floor,.18,.95);
  makeBox(n+.4,.24,n+.4,floorMat,0,-.16,0);
  const grid=new THREE.GridHelper(n,n,theme.accent,0x254059);
  grid.position.y=.008;grid.material.opacity=.19;grid.material.transparent=true;board.add(grid);
  const wallMat=material(theme.wall,.28,.23),topMat=material(theme.accent,.56,.29);
  const blocks=[];
  for(let z=0;z<n;z++)for(let x=0;x<n;x++)if(data.grid[z][x]===1)blocks.push({x,z});
  const wall=new THREE.InstancedMesh(new THREE.BoxGeometry(.96,1.04,.96),wallMat,blocks.length);
  const caps=new THREE.InstancedMesh(new THREE.BoxGeometry(.96,.09,.96),topMat,blocks.length);
  blocks.forEach((p,i)=>{
    temp.makeTranslation(p.x-(n-1)/2,.55,p.z-(n-1)/2);wall.setMatrixAt(i,temp);
    temp.makeTranslation(p.x-(n-1)/2,1.11,p.z-(n-1)/2);caps.setMatrixAt(i,temp);
  });
  wall.instanceMatrix.needsUpdate=true;caps.instanceMatrix.needsUpdate=true;
  board.add(wall,caps);
  const dotMat=new THREE.MeshStandardMaterial({color:0xffe9aa,emissive:0xffcf57,emissiveIntensity:.92,roughness:.25});
  const dots=data.pellets;pelletMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.103,8,6),dotMat,dots.length);
  state.pelletIndex=new Map();
  dots.forEach((p,i)=>{state.pelletIndex.set(L.key(p.x,p.z),i);temp.makeTranslation(p.x-(n-1)/2,.26,p.z-(n-1)/2);pelletMesh.setMatrixAt(i,temp)});
  pelletMesh.instanceMatrix.needsUpdate=true;board.add(pelletMesh);
  const powerMat=material(theme.accent,1.1,.25);
  for(const p of data.power){
    const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.28,1),powerMat);
    putOnGrid(mesh,p.x,p.z,.36);board.add(mesh);extras.push({type:'power',mesh,x:p.x,z:p.z});
  }
  for(const p of data.logos){
    const disk=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.49,.065,8,24),topMat);ring.rotation.x=-Math.PI/2;disk.add(ring);
    const tex=logoTextures[(p.id-1)%logoTextures.length];
    const circle=new THREE.Mesh(new THREE.CircleGeometry(.40,32),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,color:0xffffff}));
    circle.rotation.x=-Math.PI/2;disk.add(circle);
    putOnGrid(disk,p.x,p.z,.48);board.add(disk);extras.push({type:'logo',mesh:disk,x:p.x,z:p.z});
  }
  const playerMat=material(0xffcb37,.40,.3);
  playerMesh=new THREE.Group();
  const mouth=new THREE.Mesh(new THREE.SphereGeometry(.44,28,16,.26,Math.PI*2-.52),playerMat);
  playerMesh.add(mouth);
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),new THREE.MeshBasicMaterial({color:0x22253d}));
  eye.position.set(.12,.30,-.19);playerMesh.add(eye);
  board.add(playerMesh);putOnGrid(playerMesh,state.player.x,state.player.z,.49);
  data.ghosts.forEach((p,i)=>makeGhost(p,i));
  resize();
  // Checkpoint: restore collected cells without counting them a second time.
  for(const k of state.used) {
    const [x,z]=k.split(',').map(Number);
    removeObjectAt(x,z,false);
  }
  updateHud();
}
function removeObjectAt(x,z,award=true) {
  const k=L.key(x,z);
  const dot=state.pelletIndex?.get(k);
  if (dot!==undefined) {
    temp.makeScale(0,0,0);pelletMesh.setMatrixAt(dot,temp);
    pelletMesh.instanceMatrix.needsUpdate=true;state.pelletIndex.delete(k);
    if (award) {state.score+=10;state.remaining--;tone(440+((state.remaining%6)*60),.042);}
    return true;
  }
  const idx=extras.findIndex(p=>p.x===x && p.z===z);
  if(idx!==-1) {
    const item=extras[idx];
    item.mesh.visible=false;extras.splice(idx,1);
    if(award) {
      state.remaining--;
      if(item.type==='power'){state.power=8;tone(810,.18,'triangle');say('⚡ TURBO-FREQUENZ! Geister fangen!');state.score+=50;}
      else{state.score+=250;tone(1040,.23,'triangle');say('📻 Senderlogo gerettet! +250');}
    }
    return true;
  }
  return false;
}
function startLevel(level,resume=false,score=0,lives=4) {
  level=Math.max(1,Math.min(save.unlocked,Math.floor(level)));
  const maze=L.createLevel(level);
  let used=new Set(),x=1,z=1;
  if(resume && save.progress && +save.progress.level===level) {
    const p=save.progress;
    score=Math.max(0,Math.floor(Number(p.score)||0));
    lives=Math.max(1,Math.min(5,Math.floor(Number(p.lives)||4)));
    if(L.walkable(maze.grid,+p.x,+p.z)){x=+p.x;z=+p.z;}
    const possible=new Set([...maze.pellets,...maze.power,...maze.logos].map(v=>L.key(v.x,v.z)));
    if(Array.isArray(p.used)) used=new Set(p.used.filter(k=>typeof k==='string'&&possible.has(k)));
  }
  state={
    mode:'playing',level,maze,theme:Math.floor((level-1)/10),score,lives,used,remaining:maze.pellets.length+maze.power.length+maze.logos.length-used.size,
    player:{x,z,oldX:x,oldZ:z,dir:1,want:1},ghostElapsed:0,moveElapsed:0,power:0,invul:2.8,elapsed:0,pelletIndex:null
  };
  save.lastLevel=level;saveLocal();
  $('menu').hidden=true;$('picker').hidden=true;$('overlay').hidden=true;
  hud.hidden=false;pad.hidden=false;buildBoard();lastFrame=performance.now();lastSave=0;
  if(state.remaining===0){finishLevel();return;}
  say('♪ '+WORLD[state.theme].name+' · Level '+level);
}
function steer(direction) {
  if (!state || state.mode!=='playing') return;
  state.player.want=direction;
}
function collect() {
  const k=L.key(state.player.x,state.player.z);
  if(state.used.has(k)) return;
  if(removeObjectAt(state.player.x,state.player.z,true)){
    state.used.add(k);
    updateHud();checkpoint(false);
    if(state.remaining===0)finishLevel();
  }
}
function collision() {
  if(!state||state.mode!=='playing')return;
  for(const g of ghosts) {
    if(g.cool>0||g.x!==state.player.x||g.z!==state.player.z)continue;
    if(state.power>0){
      state.score+=200;g.x=g.home.x;g.z=g.home.z;g.oldX=g.x;g.oldZ=g.z;g.cool=1.9;
      putOnGrid(g.group,g.x,g.z,0);tone(960,.2,'square');say('👻 Geist gefangen! +200');updateHud();continue;
    }
    if(state.invul>0)continue;
    state.lives--;state.power=0;state.invul=2.4;tone(170,.23,'sawtooth');
    if(state.lives<=0){gameOver();return;}
    const p=state.maze.start;
    state.player.x=p.x;state.player.z=p.z;state.player.oldX=p.x;state.player.oldZ=p.z;
    state.player.dir=1;state.player.want=1;state.moveElapsed=0;
    putOnGrid(playerMesh,p.x,p.z,.49);
    checkpoint(true);say('❤ Achtung, ein Leben weniger!');updateHud();return;
  }
}
function movePlayer() {
  if(!state||state.mode!=='playing')return;
  const p=state.player,dirs=L.DIRS;
  function can(i){const d=dirs[i];return L.walkable(state.maze.grid,p.x+d.x,p.z+d.z)}
  if(can(p.want)) p.dir=p.want;
  if(!can(p.dir)){p.oldX=p.x;p.oldZ=p.z;return;}
  p.oldX=p.x;p.oldZ=p.z;p.x+=dirs[p.dir].x;p.z+=dirs[p.dir].z;
  collect();collision();
}
function moveGhosts() {
  for(const g of ghosts){
    if(g.cool>0)continue;
    const options=L.neighbors(state.maze.grid,g.x,g.z);
    if(!options.length)continue;
    let choice;
    if(state.power>0){
      options.sort((a,b)=> (Math.abs(b.x-state.player.x)+Math.abs(b.z-state.player.z))-
                            (Math.abs(a.x-state.player.x)+Math.abs(a.z-state.player.z)));
      choice=options[Math.floor(Math.random()*Math.min(2,options.length))];
    }else{
      const chase=Math.random()<(.64+state.theme*.035);
      if(chase){
        const dir=L.shortestDirection(state.maze.grid,g.x,g.z,state.player.x,state.player.z);
        choice=options.find(p=>p.dir===dir);
      }
      if(!choice)choice=options[Math.floor(Math.random()*options.length)];
    }
    g.oldX=g.x;g.oldZ=g.z;g.x=choice.x;g.z=choice.z;
    collision();if(state.mode!=='playing')return;
  }
}
function frame(now) {
  requestAnimationFrame(frame);
  const dt=Math.min(.045,Math.max(0,(now-lastFrame)/1000||0));lastFrame=now;
  if(!state||state.mode!=='playing'){if(renderer&&scene)renderer.render(scene,camera);return;}
  state.elapsed+=dt;
  state.invul=Math.max(0,state.invul-dt);
  state.power=Math.max(0,state.power-dt);
  for(const g of ghosts)g.cool=Math.max(0,g.cool-dt);
  const step=Math.max(.105,.175-state.theme*.010);
  const ghostStep=Math.max(.18,.39-(state.level-1)*.0031);
  state.moveElapsed+=dt;state.ghostElapsed+=dt;
  if(state.moveElapsed>=step){state.moveElapsed%=step;movePlayer();}
  if(state.mode==='playing'&&state.ghostElapsed>=ghostStep){state.ghostElapsed%=ghostStep;moveGhosts();}
  if(state.mode!=='playing'){renderer.render(scene,camera);return;}
  const f=Math.min(1,state.moveElapsed/step),p=state.player;
  const px=p.oldX+(p.x-p.oldX)*f,pz=p.oldZ+(p.z-p.oldZ)*f;
  putOnGrid(playerMesh,px,pz,.48+Math.sin(now*.012)*.035);
  playerMesh.rotation.y=([Math.PI/2,0,-Math.PI/2,Math.PI])[p.dir];
  playerMesh.scale.set(1,1+.035*Math.sin(now*.022),1);
  playerMesh.visible=state.invul<=0||Math.floor(state.elapsed*9)%2===0;
  const gf=Math.min(1,state.ghostElapsed/ghostStep);
  for(const g of ghosts){
    putOnGrid(g.group,g.oldX+(g.x-g.oldX)*gf,g.oldZ+(g.z-g.oldZ)*gf,Math.sin(now*.004+g.seed)*.075);
    g.group.scale.setScalar(state.power>0?.86:1);
    g.group.visible=g.cool<=0||Math.floor(now/135)%2===0;
  }
  for(const e of extras) {
    if(!e.mesh.visible)continue;
    e.mesh.position.y=(e.type==='logo'?.48:.35)+Math.sin(now*.003+e.x)*.1;
    e.mesh.rotation.y+=dt*(e.type==='logo'?.5:1.3);
  }
  if(state.power>0)$('powerLeft').textContent=Math.ceil(state.power)+' s';
  else $('powerStatus').hidden=true;
  renderer.render(scene,camera);
}
function levelPicker() {
  $('menu').hidden=true;$('picker').hidden=false;
  selectedWorld=Math.floor((save.lastLevel-1)/10);drawPicker();
}
function drawPicker() {
  $('worldTabs').textContent='';$('levelGrid').textContent='';
  WORLD.forEach((w,i)=>{
    const b=document.createElement('button');
    b.textContent=(i+1)+'. '+w.name;b.className=i===selectedWorld?'active':'';
    b.onclick=()=>{selectedWorld=i;drawPicker()};$('worldTabs').appendChild(b);
  });
  for(let i=1+selectedWorld*10;i<=10+selectedWorld*10;i++){
    const b=document.createElement('button');b.type='button';
    b.textContent=i<=save.unlocked?i:'🔒';b.disabled=i>save.unlocked;
    b.className=i<save.unlocked?'done':i===save.unlocked?'unlocked':'';
    b.title='Level '+i;b.setAttribute('aria-label','Level '+i+(b.disabled?' gesperrt':' spielen'));
    b.onclick=()=>startLevel(i,false);
    $('levelGrid').appendChild(b);
  }
}
function fullscreen() {
  const el=document.documentElement;
  if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});}
  else if(el.requestFullscreen){el.requestFullscreen().catch(()=>say('Vollbild wird von diesem Browser nicht unterstützt.'));}
  else say('Vollbild nicht verfügbar – Spiel passt sich automatisch an.');
}
function setInputs() {
  window.addEventListener('keydown',e=>{
    if(e.code in directionKeys) {if(state?.mode==='playing'){e.preventDefault();steer(directionKeys[e.code]);}}
    else if(e.code==='Escape'||e.code==='KeyP'){if(state&&['playing','paused'].includes(state.mode)){e.preventDefault();pause();}}
    else if(e.code==='KeyF'&&state?.mode==='playing'){fullscreen();}
  });
  for(const btn of document.querySelectorAll('[data-dir]')){
    btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture?.(e.pointerId);steer(Number(btn.dataset.dir));},{passive:false});
  }
  let touch=null;
  stage.addEventListener('pointerdown',e=>{if(state?.mode==='playing')touch={x:e.clientX,y:e.clientY};});
  stage.addEventListener('pointerup',e=>{
    if(!touch||state?.mode!=='playing')return;
    const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;
    if(Math.hypot(dx,dy)<18)return;
    steer(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));
  });
  $('continueBtn').onclick=()=>{
    const progress=save.progress,lv=progress&&progress.level<=save.unlocked?+progress.level:save.lastLevel;
    startLevel(lv,!!progress && +progress.level===lv);
  };
  $('newBtn').onclick=()=>{save.progress=null;saveLocal();startLevel(1,false)};
  $('levelsBtn').onclick=levelPicker;
  $('closePicker').onclick=showMenu;
  $('menuFullBtn').onclick=fullscreen;
  $('fullBtn').onclick=fullscreen;
  $('pauseBtn').onclick=()=>pause();
  $('soundBtn').onclick=()=>{save.sound=!save.sound;saveLocal();updateHud();if(save.sound)tone(650)};
  window.addEventListener('pagehide',()=>checkpoint(true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state?.mode==='playing')pause();});
  document.addEventListener('fullscreenchange',resize);
}
function preloadLogos() {
  const loader=new THREE.TextureLoader();
  return new Promise(resolve=>{
    let done=0;
    const finish=()=>{
      done++;updateLoader(17+Math.round(done/13*68),'Lade Senderlogos ('+done+'/13) …');
      if(done===13)resolve();
    };
    for(let i=1;i<=13;i++){
      const fallback=new THREE.Texture();
      logoTextures.push(fallback);
      const path='../anmacha-memory/logos/'+String(i).padStart(2,'0')+'.png';
      loader.load(path,tex=>{tex.encoding=THREE.sRGBEncoding;logoTextures[i-1]=tex;finish();},
        undefined,()=>{ // Fehlendes Logo: neutrale, aber spielbare Sender-Münze
          const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
          const c=canvas.getContext('2d');
          c.fillStyle='#15346a';c.fillRect(0,0,128,128);c.fillStyle='#4be9ff';
          c.font='bold 56px system-ui';c.textAlign='center';c.fillText('♪',64,83);
          const t=new THREE.CanvasTexture(canvas);logoTextures[i-1]=t;finish();
        });
    }
    // Fehlende Assets oder eine blockierte Anfrage dürfen den Start nicht endlos aufhalten.
    setTimeout(()=>{if(done<13)resolve()},7000);
  });
}
async function boot() {
  if(initialized)return;initialized=true;
  try {
    if(!THREE||!L)throw new Error('3D-Bibliothek konnte nicht geladen werden.');
    updateLoader(8,'Prüfe 3D-Engine …');makeScene();setInputs();
    updateLoader(17,'Initialisiere Radiowelten …');
    await preloadLogos();
    updateLoader(92,'Baue das erste Labyrinth …');
    // Build once for a real first frame, then show the menu.
    const lvl=L.createLevel(1);
    state={mode:'menu',level:1,maze:lvl,theme:0,score:0,lives:4,used:new Set(),remaining:lvl.pellets.length+lvl.power.length+lvl.logos.length,
      player:{x:1,z:1,oldX:1,oldZ:1,dir:1,want:1},ghostElapsed:0,moveElapsed:0,power:0,invul:0,elapsed:0,pelletIndex:null};
    buildBoard();
    renderer.render(scene,camera);lastFrame=performance.now();requestAnimationFrame(frame);
    updateLoader(100,'Sendestudio bereit!');
    $('loading').hidden=true;showMenu();
    if('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').then(reg=>{
        reg.addEventListener('updatefound',()=>{
          if(!navigator.serviceWorker.controller)return;
          const worker=reg.installing;
          worker?.addEventListener('statechange',()=>{
            if(worker.state==='activated')say('Neue Version verfügbar – nach dem nächsten Start aktiv.');
          });
        });
      }).catch(()=>{});
    }
  } catch (error) {
    console.error('Radio Maze konnte nicht starten',error);
    updateLoader(0,'Start fehlgeschlagen: '+(error?.message||'3D konnte nicht gestartet werden.'));
    $('loading').insertAdjacentHTML('beforeend','<button id="retry" class="primary" style="max-width:240px">↻ Erneut versuchen</button>');
    $('retry').onclick=()=>location.reload();
  }
}
boot();
})();