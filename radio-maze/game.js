/* AnMaCha Radio Maze 3D – Three.js-Darstellung, Steuerung, Ton und Spielstand. Kein Build-Schritt. */
(function () {
'use strict';
const L = window.RadioMazeLogic, THREE = window.THREE;
const $ = id => document.getElementById(id);
const SAVE_KEY = 'easygames.radio-maze.v1', MAX_LEVEL = 60;
const WORLD = [
  { name:'Neon-Frequenzen', wall:0x1f3fd8, floor:0x050a1e, accent:0x5f8bff, fog:0x070c22 },
  { name:'Disco-Labyrinth', wall:0xb03aa8, floor:0x12071d, accent:0xff78e3, fog:0x15081f },
  { name:'Goldene Hits', wall:0xc7861f, floor:0x171006, accent:0xffd36e, fog:0x1a1206 },
  { name:'Rock-Frequenz', wall:0xb3304f, floor:0x170811, accent:0xff6f88, fog:0x1b0914 },
  { name:'Cosmic Radio', wall:0x6040c8, floor:0x0a0720, accent:0xb29bff, fog:0x0e0a28 },
  { name:'Finale: Senderturm', wall:0x1c9c84, floor:0x041515, accent:0x75ffe2, fog:0x061a1a }
];
const GHOSTS = [
  { name:'Rauschi', color:0xff2b2b }, { name:'Pfeifi', color:0xffa0d8 },
  { name:'Knacki', color:0x2ce8ff }, { name:'Brummi', color:0xffa640 }
];
const ROT = [-Math.PI / 2, Math.PI, Math.PI / 2, 0]; // Blickrichtung hoch, rechts, runter, links
const DEFAULT = () => ({ version:1, unlocked:1, lastLevel:1, best:0, completed:0, progress:null, sound:true, cam:'classic' });
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
      sound:raw.sound !== false,
      cam:raw.cam === 'follow' ? 'follow' : 'classic'
    };
  } catch (_) { return DEFAULT(); }
}
let save = getSave(), state = null, game = null, scene = null, camera = null, renderer = null, board = null;
let pacMesh = null, dotMesh = null, capMesh = null, powerMeshes = [], ghostViews = [], fruitMesh = null, popup = null, door = null;
let logoTextures = [], shared = null, dotIndex = new Map(), boardTheme = -1;
let lastFrame = 0, lastSave = 0, toastTimeout = 0, selectedWorld = 0, audioCtx = null, siren = null, initialized = false;
let needsRender = false, wakaFlip = false, lastWaka = 0, popupTime = 0, deathTime = 0, gamepadDir = -1;
const temp = THREE ? new THREE.Matrix4() : null;
const camTarget = THREE ? new THREE.Vector3() : null, camLook = THREE ? new THREE.Vector3() : null;
const hud = $('hud'), pad = $('pad'), stage = $('stage');
const directionKeys = { ArrowUp:0, KeyW:0, ArrowRight:1, KeyD:1, ArrowDown:2, KeyS:2, ArrowLeft:3, KeyA:3 };
const wx = x => x - (L.COLS - 1) / 2, wz = z => z - (L.ROWS - 1) / 2;

function updateLoader(value, message) {
  $('loadBar').style.width = Math.round(value) + '%'; $('loadPercent').textContent = Math.round(value) + ' %';
  $('loadText').textContent = message;
}
function saveLocal() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { console.warn('Radio Maze: localStorage unavailable', e); }
}
function checkpoint(force) {
  if (!state || !game || state.mode !== 'playing' || game.phase === 'over' || game.phase === 'done') return;
  const now = Date.now();
  if (!force && now - lastSave < 4000) return;
  lastSave = now;
  save.lastLevel = state.level;
  save.best = Math.max(save.best, game.score);
  save.progress = { level:state.level, score:game.score, lives:game.lives, extra:game.extraGiven, used:L.eatenList(game), at:now };
  saveLocal();
}

/* ---------- Ton: kurze Oszillator-Töne und eine einzige Sirene, die nur während des Spiels läuft ---------- */
function audio() {
  if (!save.sound) return null;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  } catch (_) { return null; }
}
function tone(freq, length=.08, wave='sine', volume=.05, delay=0, slideTo=0) {
  const ctx = audio(); if (!ctx) return;
  const osc=ctx.createOscillator(), gain=ctx.createGain(), t=ctx.currentTime+delay;
  osc.type=wave; osc.frequency.setValueAtTime(freq,t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo,t+length);
  gain.gain.setValueAtTime(volume,t); gain.gain.exponentialRampToValueAtTime(.0001,t+length);
  osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t+length+.02);
}
function jingle() {
  // Eigene kurze Startmelodie im Radio-Stil.
  const notes=[523,659,784,1046,784,880,1046,1318];
  notes.forEach((f,i)=>tone(f,.16,'square',.035,i*.2));
}
function sirenSet(on, fright) {
  if (!on || !save.sound || document.hidden) {
    if (siren) { try { siren.gain.gain.setTargetAtTime(0,audioCtx.currentTime,.03); } catch (_) {} }
    return;
  }
  const ctx = audio(); if (!ctx) return;
  if (!siren) {
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.type='triangle'; gain.gain.value=0; osc.connect(gain).connect(ctx.destination); osc.start();
    siren={osc,gain};
  }
  const t=ctx.currentTime, phase=(t*(fright?7:2.2))%1;
  const f=fright?190+Math.abs(phase-.5)*240:330+Math.sin(phase*Math.PI*2)*80*(1+(game?L.TOTAL-L.remaining(game):0)/244);
  siren.osc.frequency.setTargetAtTime(f,t,.02);
  siren.gain.gain.setTargetAtTime(.018,t,.05);
}
function say(message) {
  const el=$('message'); el.textContent=message; el.hidden=false;
  clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>{el.hidden=true},2100);
}

/* ---------- Anzeige ---------- */
function updateHud() {
  if (!state || !game) return;
  $('world').textContent=WORLD[state.theme].name;
  $('level').textContent='Level '+state.level+' / '+MAX_LEVEL;
  $('score').textContent=game.score.toLocaleString('de-DE');
  $('best').textContent=Math.max(save.best,game.score).toLocaleString('de-DE');
  $('lives').textContent=''+game.lives;
  $('remaining').textContent=''+L.remaining(game);
  $('soundBtn').textContent=save.sound?'♫':'♪̸';
  $('camBtn').textContent=save.cam==='follow'?'🎥':'🗺';
}
function setReady(text) { const el=$('ready'); el.textContent=text||''; el.hidden=!text; }
function showMenu() {
  if (state && state.mode==='playing') checkpoint(true);
  if (state) state.mode='menu';
  sirenSet(false);
  save=getSave();
  $('menu').hidden=false; $('picker').hidden=true; $('overlay').hidden=true; hud.hidden=true; pad.hidden=true;
  $('powerStatus').hidden=true; setReady('');
  $('resumeTitle').textContent=save.unlocked>1||save.progress?'Willkommen zurück!':'Dein Radio-Abenteuer';
  $('saveInfo').textContent='Freigeschaltet: '+save.unlocked+' / '+MAX_LEVEL+' · Highscore: '+save.best.toLocaleString('de-DE')+' Punkte';
  $('continueLabel').textContent='Level '+(save.progress && save.progress.level<=save.unlocked?save.progress.level:save.lastLevel);
  $('unlockInfo').textContent='('+save.unlocked+' offen)';
}
function showDialog(symbol, title, message, primaryText, action, secondText='Zum Hauptmenü', secondary=showMenu) {
  $('overlaySymbol').textContent=symbol; $('overlayTitle').textContent=title; $('overlayText').textContent=message;
  $('primaryAction').textContent=primaryText; $('secondaryAction').textContent=secondText;
  $('primaryAction').onclick=action; $('secondaryAction').onclick=secondary; $('overlay').hidden=false;
  needsRender=true;
}
function pause(toggle=true) {
  if (!state || !['playing','paused'].includes(state.mode)) return;
  if (state.mode==='paused') { state.mode='playing'; $('overlay').hidden=true; lastFrame=performance.now(); return; }
  if (!toggle) return;
  checkpoint(true); state.mode='paused'; sirenSet(false);
  showDialog('⏸','Sendepause','Dein Fortschritt ist lokal gespeichert. Weiter geht’s, sobald du bereit bist.',
    '▶ Weiterspielen',()=>pause(), 'Hauptmenü',showMenu);
}
function gameOver() {
  state.mode='gameover'; sirenSet(false);
  save.best=Math.max(save.best,game.score); save.progress=null; saveLocal();
  showDialog('💔','Sendepause auf unbestimmt','Die Störsender haben dich erwischt! Punkte: '+game.score.toLocaleString('de-DE'),
    '↺ Level erneut spielen',()=>startLevel(state.level,false), 'Hauptmenü',showMenu);
}
function finishLevel() {
  state.mode='completed'; sirenSet(false);
  save.best=Math.max(save.best,game.score);
  save.completed+=1; save.unlocked=Math.max(save.unlocked,Math.min(MAX_LEVEL,state.level+1));
  save.lastLevel=Math.min(MAX_LEVEL,state.level+1); save.progress=null; saveLocal();
  updateHud();
  const last=state.level>=MAX_LEVEL, score=game.score, lives=game.lives, extra=game.extraGiven;
  showDialog(last?'👑':'🏆', last?'Alle 60 Sender gerettet!':'Frequenz gerettet!',
    'Level '+state.level+' geschafft! '+score.toLocaleString('de-DE')+' Punkte.',
    last?'↺ Noch einmal ab Level 1':'▶ Nächstes Level',
    ()=>last?startLevel(1,false):startLevel(state.level+1,false,score,lives,extra), 'Zum Hauptmenü',showMenu);
}

/* ---------- 3D-Szene ---------- */
function makeScene() {
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(40,1,.5,200);
  renderer=new THREE.WebGLRenderer({antialias:(window.devicePixelRatio||1)<2,alpha:false,powerPreference:'default'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  stage.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xdde8ff,0x202840,.75));
  const sun=new THREE.DirectionalLight(0xffffff,.65);sun.position.set(-8,30,18);scene.add(sun);
  // Gemeinsame Geometrien werden einmal erzeugt und für alle Level wiederverwendet.
  shared={
    wall:new THREE.BoxGeometry(1,.8,1), edge:new THREE.BoxGeometry(1.1,.07,.12),
    dot:new THREE.SphereGeometry(.1,8,6), power:new THREE.SphereGeometry(.3,12,8),
    head:new THREE.SphereGeometry(.42,16,8,0,Math.PI*2,0,Math.PI/2), skirt:new THREE.CylinderGeometry(.42,.46,.42,16,1,true),
    eye:new THREE.SphereGeometry(.12,8,6), pupil:new THREE.SphereGeometry(.065,6,4),
    disk:new THREE.CircleGeometry(.42,24), ring:new THREE.TorusGeometry(.48,.06,6,24),
    mouths:[.05,.3,.6,.9,1.2].map(a=>new THREE.SphereGeometry(.45,20,14,a/2,Math.PI*2-a)),
    fright:new THREE.MeshLambertMaterial({color:0x2238ff,emissive:0x1028cc,emissiveIntensity:.6}),
    flash:new THREE.MeshLambertMaterial({color:0xffffff,emissive:0xbbbbbb,emissiveIntensity:.6}),
    white:new THREE.MeshBasicMaterial({color:0xffffff}), pupilMat:new THREE.MeshBasicMaterial({color:0x1a2a8a}),
    pac:new THREE.MeshLambertMaterial({color:0xffdd00,emissive:0x664c00,emissiveIntensity:.8,side:THREE.DoubleSide})
  };
  window.addEventListener('resize',resize);
  resize();
}
function fitClassic() {
  const aspect=camera.aspect, tilt=.42; // ca. 24° gekippt für den 3D-Eindruck
  const half=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  const mobileHud=stage.clientWidth<=520?1.18:1.1;
  const needH=(L.ROWS+2)*mobileHud/2/half, needW=(L.COLS+.8)/2/(half*aspect);
  const dist=Math.max(needH,needW);
  camera.position.set(0,dist*Math.cos(tilt),dist*Math.sin(tilt)+ .5);
  camera.lookAt(0,0,.8);
}
function resize() {
  if (!renderer) return;
  const w=Math.max(stage.clientWidth,1), h=Math.max(stage.clientHeight,1);
  renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix();
  if (save.cam!=='follow' || !game) fitClassic();
  needsRender=true;
}
function material(hex,emissive=.2) {
  return new THREE.MeshLambertMaterial({color:hex,emissive:hex,emissiveIntensity:emissive});
}
function disposeBoard() {
  if (!board) return;
  scene.remove(board);
  for (const m of board.userData.own) m.dispose();
  board=null; pacMesh=null; dotMesh=null; capMesh=null; powerMeshes=[]; ghostViews=[]; fruitMesh=null; popup=null; door=null; boardTheme=-1;
}
function own(x) { board.userData.own.push(x); return x; }
function buildBoard(theme) {
  disposeBoard();
  const t=WORLD[theme];
  board=new THREE.Group(); board.userData.own=[]; scene.add(board); boardTheme=theme;
  scene.background=new THREE.Color(t.fog);
  const floorGeo=own(new THREE.PlaneGeometry(L.COLS+.6,L.ROWS+.6)), floor=new THREE.Mesh(floorGeo,own(material(t.floor,.4)));
  floor.rotation.x=-Math.PI/2; floor.position.y=-.01; board.add(floor);
  const walls=[];
  for(let z=0;z<L.ROWS;z++)for(let x=0;x<L.COLS;x++)if(L.MAZE[z][x]==='#')walls.push({x,z});
  // Dunkle Blöcke mit leuchtender Kontur nur an den Kanten zum Weg – wie die Neonlinien am Automaten.
  const side=own(material(t.wall,.3)), top=own(new THREE.MeshBasicMaterial({color:new THREE.Color(t.wall).multiplyScalar(.22)}));
  const wallMesh=new THREE.InstancedMesh(shared.wall,[side,side,top,side,side,side],walls.length);
  const edges=[], isWall=(x,z)=>z>=0&&z<L.ROWS&&x>=0&&x<L.COLS&&L.MAZE[z][x]==='#';
  walls.forEach((p,i)=>{
    temp.makeTranslation(wx(p.x),.4,wz(p.z));wallMesh.setMatrixAt(i,temp);
    L.DIRS.forEach((d,k)=>{if(!isWall(p.x+d.x,p.z+d.z))edges.push({x:p.x+d.x*.44,z:p.z+d.z*.44,rot:k%2?Math.PI/2:0});});
  });
  capMesh=new THREE.InstancedMesh(shared.edge,own(new THREE.MeshBasicMaterial({color:t.accent})),edges.length);
  const rot=new THREE.Matrix4();
  edges.forEach((e,i)=>{rot.makeRotationY(e.rot);temp.makeTranslation(wx(e.x),.81,wz(e.z)).multiply(rot);capMesh.setMatrixAt(i,temp);});
  board.add(wallMesh,capMesh);
  door=new THREE.Mesh(own(new THREE.BoxGeometry(2,.12,.18)),own(new THREE.MeshBasicMaterial({color:0xffb8de})));
  door.position.set(wx(13.5),.45,wz(12)); board.add(door);
  dotMesh=new THREE.InstancedMesh(shared.dot,own(new THREE.MeshBasicMaterial({color:0xffd9b0})),L.ALL_DOTS.length);
  dotIndex=new Map();
  L.ALL_DOTS.forEach((k,i)=>{dotIndex.set(k,i);});
  board.add(dotMesh);
  const powerMat=own(new THREE.MeshBasicMaterial({color:0xffe2c0}));
  powerMeshes=L.ALL_POWER.map(k=>{
    const [x,z]=k.split(',').map(Number), m=new THREE.Mesh(shared.power,powerMat);
    m.position.set(wx(x),.35,wz(z)); m.userData.key=k; board.add(m); return m;
  });
  pacMesh=new THREE.Mesh(shared.mouths[2],shared.pac); board.add(pacMesh);
  ghostViews=GHOSTS.map(def=>{
    const group=new THREE.Group(), body=new THREE.Group(), mat=own(material(def.color,.45));
    const head=new THREE.Mesh(shared.head,mat); head.position.y=.46; body.add(head);
    const skirt=new THREE.Mesh(shared.skirt,mat); skirt.position.y=.25; body.add(skirt);
    const eyes=new THREE.Group();
    for(const s of [-.16,.16]){
      const eye=new THREE.Mesh(shared.eye,shared.white); eye.position.set(-.3,.55,s); eyes.add(eye);
      const pupil=new THREE.Mesh(shared.pupil,shared.pupilMat); pupil.position.set(-.4,.55,s); eyes.add(pupil);
    }
    group.add(body,eyes); board.add(group);
    return {group,body,eyes,head,skirt,mat};
  });
  fruitMesh=new THREE.Group();
  const ring=new THREE.Mesh(shared.ring,own(new THREE.MeshBasicMaterial({color:t.accent})));ring.rotation.x=-Math.PI/2;fruitMesh.add(ring);
  const logo=new THREE.Mesh(shared.disk,own(new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide})));
  logo.rotation.x=-Math.PI/2;fruitMesh.add(logo);fruitMesh.userData.logo=logo;
  fruitMesh.position.set(wx(13.5),.6,wz(17));fruitMesh.visible=false;board.add(fruitMesh);
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;
  const tex=own(new THREE.CanvasTexture(canvas));
  popup=new THREE.Sprite(own(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false})));
  popup.scale.set(2.4,1.2,1);popup.visible=false;popup.userData.canvas=canvas;popup.userData.tex=tex;board.add(popup);
}
function syncDots() {
  L.ALL_DOTS.forEach((k,i)=>{
    const [x,z]=k.split(',').map(Number);
    if (game.dots.has(k)) temp.makeTranslation(wx(x),.3,wz(z)); else temp.makeScale(0,0,0);
    dotMesh.setMatrixAt(i,temp);
  });
  dotMesh.instanceMatrix.needsUpdate=true;
  for (const m of powerMeshes) m.visible=game.power.has(m.userData.key);
}
function hideDot(k) {
  const i=dotIndex.get(k);
  if (i!==undefined){temp.makeScale(0,0,0);dotMesh.setMatrixAt(i,temp);dotMesh.instanceMatrix.needsUpdate=true;return;}
  for (const m of powerMeshes) if (m.userData.key===k) m.visible=false;
}
function showPopup(text,x,z) {
  const c=popup.userData.canvas.getContext('2d');
  c.clearRect(0,0,128,64);c.font='bold 40px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.lineWidth=6;c.strokeStyle='#061024';c.strokeText(text,64,34);c.fillStyle='#4be9ff';c.fillText(text,64,34);
  popup.userData.tex.needsUpdate=true;popup.position.set(wx(x),1.4,wz(z));popup.visible=true;popupTime=1.2;
}

/* ---------- Spielablauf ---------- */
function startLevel(level,resume=false,score=0,lives=3,extra=false) {
  level=Math.max(1,Math.min(save.unlocked,Math.floor(level)));
  let eaten=[];
  if(resume && save.progress && +save.progress.level===level) {
    const p=save.progress, valid=new Set([...L.ALL_DOTS,...L.ALL_POWER]);
    score=Math.max(0,Math.floor(Number(p.score)||0));
    lives=Math.max(1,Math.min(9,Math.floor(Number(p.lives)||3)));
    extra=!!p.extra;
    if(Array.isArray(p.used)) eaten=p.used.filter(k=>typeof k==='string'&&valid.has(k));
  }
  game=L.createGame(level,{score,lives,eaten,extraGiven:extra,readyTime:resume?2:4.2});
  if(L.remaining(game)===0) game=L.createGame(level,{score,lives,extraGiven:extra});
  state={mode:'playing',level,theme:Math.floor((level-1)/10)};
  save.lastLevel=level;
  if(!resume)save.progress=null;
  saveLocal();
  $('menu').hidden=true;$('picker').hidden=true;$('overlay').hidden=true;
  hud.hidden=false;pad.hidden=false;
  if(boardTheme!==state.theme) buildBoard(state.theme);
  fruitMesh.visible=false;popup.visible=false;capMesh.material.color.setHex(WORLD[state.theme].accent);
  syncDots();syncActors(performance.now());resize();snapCamera();
  lastFrame=performance.now();lastSave=0;deathTime=0;
  checkpoint(true);updateHud();
  setReady('READY!');
  if(!resume)jingle();
  say('♪ '+WORLD[state.theme].name+' · Level '+level);
}
function steer(direction) {
  if (!state || state.mode!=='playing' || !game) return;
  L.steer(game,direction);
}
function handleEvents(events, now) {
  let hudDirty=false;
  for (const e of events) {
    switch (e.type) {
      case 'dot':
        hideDot(e.key);hudDirty=true;
        if (now-lastWaka>90){lastWaka=now;wakaFlip=!wakaFlip;tone(wakaFlip?520:380,.07,'triangle',.04);}
        checkpoint(false);break;
      case 'power':
        hideDot(e.key);hudDirty=true;tone(300,.25,'sawtooth',.04,0,900);
        if (game.spec.fright>0) say('⚡ TURBO-FREQUENZ! Störsender fangen!');
        checkpoint(false);break;
      case 'ghost': tone(200,.35,'square',.05,0,1600);showPopup(''+e.points,e.x,e.z);hudDirty=true;break;
      case 'fruitShow':
        fruitMesh.userData.logo.material.map=logoTextures[(state.level-1)%logoTextures.length]||null;
        fruitMesh.userData.logo.material.needsUpdate=true;fruitMesh.visible=true;break;
      case 'fruit':
        fruitMesh.visible=false;tone(880,.25,'triangle',.05,0,1760);showPopup(''+e.points,13.5,17);
        say('📻 Senderlogo gerettet! +'+e.points);hudDirty=true;break;
      case 'fruitGone': fruitMesh.visible=false;break;
      case 'extra': tone(1046,.5,'square',.04);say('❤ Extraleben bei 10.000 Punkten!');hudDirty=true;break;
      case 'death': sirenSet(false);deathTime=now;tone(900,1.4,'sawtooth',.05,.25,90);break;
      case 'respawn': syncActors(now);snapCamera();setReady('READY!');hudDirty=true;checkpoint(true);break;
      case 'go': setReady('');break;
      case 'cleared': sirenSet(false);fruitMesh.visible=false;tone(660,.15,'square',.04);tone(880,.15,'square',.04,.18);tone(1320,.3,'square',.04,.36);break;
      case 'levelDone': finishLevel();return;
      case 'gameover': hudDirty=true;updateHud();gameOver();return;
    }
  }
  if (hudDirty) updateHud();
}
function syncActors(now) {
  const p=game.pac, t=now/1000;
  pacMesh.visible=p.px>-.6&&p.px<L.COLS-.4;
  pacMesh.position.set(wx(p.px),.45,wz(p.pz));
  pacMesh.rotation.set(0,ROT[p.dir],0);pacMesh.scale.setScalar(1);
  if (game.phase==='dying' && deathTime) {
    const k=Math.min(1,(now-deathTime)/1600);
    pacMesh.geometry=shared.mouths[Math.min(4,Math.floor(k*5))];
    pacMesh.scale.setScalar(Math.max(.01,1-k));pacMesh.rotation.y+=k*8;
  } else {
    const open=p.moving&&game.phase==='play'?Math.floor((Math.sin(t*28)+1)*2.4):2;
    pacMesh.geometry=shared.mouths[Math.max(0,Math.min(4,open))];
  }
  const fright=game.frightTime, flash=fright>0&&fright<2&&game.spec.flashes>0&&Math.floor(t*6)%2===0;
  game.ghosts.forEach((gh,i)=>{
    const v=ghostViews[i], dying=game.phase==='dying'&&now-deathTime>700;
    v.group.visible=!dying&&gh.px>-.6&&gh.px<L.COLS-.4&&game.phase!=='cleared';
    v.group.position.set(wx(gh.px),Math.sin(t*5+i)*.04,wz(gh.pz));
    const eyesOnly=gh.state==='eaten'||gh.state==='entering';
    v.body.visible=!eyesOnly;
    const m=gh.fright?(flash?shared.flash:shared.fright):v.mat;
    v.head.material=m;v.skirt.material=m;
    v.eyes.rotation.y=ROT[gh.dir];
  });
}
function snapCamera() {
  if (save.cam!=='follow'||!game) { fitClassic(); return; }
  followTarget(); camera.position.copy(camTarget); camera.lookAt(camLook);
}
function followTarget() {
  const p=game.pac, x=wx(Math.max(0,Math.min(L.COLS-1,p.px))), z=wz(p.pz);
  camLook.set(x*.85,0,z-.5);
  camTarget.set(x*.85,19,z+11);
}
function pollGamepad() {
  if (!navigator.getGamepads) return;
  const pads=navigator.getGamepads(); let dir=-1;
  for (const gp of pads) {
    if (!gp) continue;
    const b=gp.buttons, ax=gp.axes[0]||0, ay=gp.axes[1]||0;
    if (b[12]?.pressed||ay<-.5) dir=0; else if (b[15]?.pressed||ax>.5) dir=1;
    else if (b[13]?.pressed||ay>.5) dir=2; else if (b[14]?.pressed||ax<-.5) dir=3;
    if (b[9]?.pressed && !pollGamepad.start) { pollGamepad.start=true; pause(); }
    else if (!b[9]?.pressed) pollGamepad.start=false;
    break;
  }
  if (dir!==-1 && dir!==gamepadDir) steer(dir);
  gamepadDir=dir;
}
let gamepads=0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt=Math.min(.1,Math.max(0,(now-lastFrame)/1000||0));lastFrame=now;
  if(!state||state.mode!=='playing'||!game){
    if(needsRender&&renderer&&scene&&state&&state.mode!=='menu'){renderer.render(scene,camera);}
    needsRender=false;return;
  }
  if(gamepads){pollGamepad();if(state.mode!=='playing')return;}
  // Schwache Geräte: in kleinen Schritten rechnen, damit das Tempo stimmt und nichts durch Wände rutscht.
  const events=[];
  for(let rest=dt;rest>1e-6;rest-=1/30)for(const e of L.step(game,Math.min(rest,1/30)))events.push(e);
  handleEvents(events,now);
  if(state.mode!=='playing'){needsRender=true;return;}
  syncActors(now);
  const t=now/1000;
  for(const m of powerMeshes) if(game.power.has(m.userData.key)) m.visible=Math.floor(t*4)%2===0||game.phase!=='play';
  if(fruitMesh.visible){fruitMesh.rotation.y+=dt*1.6;fruitMesh.position.y=.6+Math.sin(t*3)*.08;}
  if(popup.visible){popupTime-=dt;popup.position.y+=dt*.6;if(popupTime<=0)popup.visible=false;}
  // Levelende: Wände blinken wie am Automaten.
  if(game.phase==='cleared')capMesh.material.color.setHex(Math.floor(t*5)%2===0?0xffffff:WORLD[state.theme].accent);
  door.visible=game.phase!=='cleared';
  const fright=game.frightTime>0;
  $('powerStatus').hidden=!fright;
  if(fright)$('powerLeft').textContent=Math.ceil(game.frightTime)+' s';
  sirenSet(state.mode==='playing'&&game.phase==='play',fright);
  if(save.cam==='follow'){followTarget();camera.position.lerp(camTarget,Math.min(1,dt*5));camera.lookAt(camLook);}
  renderer.render(scene,camera);
}

/* ---------- Menüs und Eingaben ---------- */
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
function toggleCam() {
  save.cam=save.cam==='follow'?'classic':'follow';saveLocal();updateHud();snapCamera();needsRender=true;
  say(save.cam==='follow'?'🎥 Verfolger-Kamera':'🗺 Klassische Übersicht');
}
function setInputs() {
  window.addEventListener('keydown',e=>{
    if(e.code in directionKeys) {if(state?.mode==='playing'){e.preventDefault();steer(directionKeys[e.code]);}}
    else if(e.code==='Escape'||e.code==='KeyP'){if(state&&['playing','paused'].includes(state.mode)){e.preventDefault();pause();}}
    else if(e.code==='KeyF'&&state?.mode==='playing'){fullscreen();}
    else if(e.code==='KeyC'&&state?.mode==='playing'){toggleCam();}
    else if(e.code==='KeyM'&&state?.mode==='playing'){$('soundBtn').click();}
  });
  for(const btn of document.querySelectorAll('[data-dir]')){
    btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture?.(e.pointerId);steer(Number(btn.dataset.dir));},{passive:false});
  }
  // Wischen: Richtung schon während der Bewegung übernehmen, damit Kurven rechtzeitig klappen.
  let touch=null;
  stage.addEventListener('pointerdown',e=>{if(state?.mode==='playing')touch={x:e.clientX,y:e.clientY};});
  stage.addEventListener('pointermove',e=>{
    if(!touch||state?.mode!=='playing')return;
    const dx=e.clientX-touch.x,dy=e.clientY-touch.y;
    if(Math.hypot(dx,dy)<22)return;
    steer(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));touch={x:e.clientX,y:e.clientY};
  });
  const end=()=>{touch=null;};
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  window.addEventListener('gamepadconnected',()=>{gamepads++;say('🎮 Controller verbunden');});
  window.addEventListener('gamepaddisconnected',()=>{gamepads=Math.max(0,gamepads-1);});
  $('continueBtn').onclick=()=>{
    const progress=save.progress,lv=progress&&progress.level<=save.unlocked?+progress.level:save.lastLevel;
    startLevel(lv,!!progress && +progress.level===lv);
  };
  $('newBtn').onclick=()=>{save.progress=null;saveLocal();startLevel(1,false)};
  $('levelsBtn').onclick=levelPicker;
  $('closePicker').onclick=showMenu;
  $('menuFullBtn').onclick=fullscreen;
  $('fullBtn').onclick=fullscreen;
  $('camBtn').onclick=toggleCam;
  $('pauseBtn').onclick=()=>pause();
  $('soundBtn').onclick=()=>{save.sound=!save.sound;saveLocal();updateHud();if(save.sound)tone(650);else sirenSet(false);};
  window.addEventListener('pagehide',()=>checkpoint(true));
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){sirenSet(false);if(state?.mode==='playing')pause();}
  });
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
      logoTextures.push(null);
      const path='../anmacha-memory/logos/'+String(i).padStart(2,'0')+'.png';
      loader.load(path,tex=>{logoTextures[i-1]=tex;finish();},
        undefined,()=>{ // Fehlendes Logo: neutrale, aber spielbare Sender-Münze
          const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
          const c=canvas.getContext('2d');
          c.fillStyle='#15346a';c.fillRect(0,0,128,128);c.fillStyle='#4be9ff';
          c.font='bold 56px system-ui';c.textAlign='center';c.fillText('♪',64,83);
          logoTextures[i-1]=new THREE.CanvasTexture(canvas);finish();
        });
    }
    // Fehlende Assets oder eine blockierte Anfrage dürfen den Start nicht endlos aufhalten.
    setTimeout(()=>{if(done<13)resolve()},7000);
  });
}
function webglAvailable() {
  try { const c=document.createElement('canvas'); return !!(c.getContext('webgl')||c.getContext('experimental-webgl')); }
  catch (_) { return false; }
}
async function boot() {
  if(initialized)return;initialized=true;
  try {
    if(!THREE||!L)throw new Error('3D-Bibliothek konnte nicht geladen werden.');
    if(!webglAvailable())throw new Error('Dieser Browser unterstützt kein WebGL (3D).');
    updateLoader(8,'Prüfe 3D-Engine …');makeScene();setInputs();
    updateLoader(17,'Initialisiere Radiowelten …');
    await preloadLogos();
    updateLoader(92,'Baue das Labyrinth …');
    buildBoard(0);
    lastFrame=performance.now();requestAnimationFrame(frame);
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
    if(!$('retry'))$('loading').insertAdjacentHTML('beforeend','<button id="retry" class="primary" style="max-width:240px">↻ Erneut versuchen</button>');
    $('retry').onclick=()=>location.reload();
  }
}
boot();
})();
