'use strict';
// Lumo – Wolkenpfad: klassisches 16-Bit-Jump-and-Run mit eigener Figur, eigenen Gegnern und eigenen Levels.
// Alle Namen, Figuren und Grafiken sind neu erfunden und orientieren sich nur am Spielgefühl alter Plattformer.
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=256,H=240,TILE=16,SAVE_KEY='easygames.lumo.v1';
ctx.imageSmoothingEnabled=false;
const panel=document.getElementById('panel'),message=document.getElementById('message'),saveStatus=document.getElementById('saveStatus');

// ---------- Levelkarten: 16 Zeilen, je 12 Blöcke à 10 Zeichen = 120 Kacheln breit ----------
// Zeichen: # Boden  = Plattform  B Ziegel  ? Fragezeile(Münze)  M Fragezeile(Schutzpilz)  U leerer Block
//          P Säule  C Münze  K Krabbler  F Fahnenstange  . leer
const rowFrom=o=>{let s='';for(let i=0;i<12;i++)s+=(o[i]||'..........').padEnd(10,'.');return s;};
const GROUND=rowFrom({0:'##########',1:'##########',2:'##########',3:'   #######',4:'##########',5:'##########',6:'##   #####',7:'##########',8:'##########',9:'  ########',10:'##########',11:'##########'});
const GROUND2=rowFrom({0:'##########',1:'##########',2:'    ######',3:'##########',4:'##########',5:'   #######',6:'##########',7:'##########',8:'   #######',9:'##########',10:'  ########',11:'##########'});
const GROUND3=rowFrom({0:'##########',1:'######   #',2:'##########',3:'##########',4:'     #####',5:'##########',6:'##########',7:'  ########',8:'##########',9:'######    ',10:'##########',11:'##########'});
const GROUND4=rowFrom({0:'##########',1:'##########',2:'##########',3:'##########',4:'  ########',5:'##########',6:'##########',7:'   #######',8:'##########',9:'##########',10:'##########',11:'##########'});
const STAGES=[
  {name:'1-1',title:'Wolkenwiese',theme:0,time:300,rows:[
    rowFrom({}),rowFrom({}),rowFrom({}),rowFrom({}),
    rowFrom({11:'..F.......'}),rowFrom({11:'..F.......'}),rowFrom({11:'..F.......'}),
    rowFrom({0:'.........C',1:'CC........',11:'..F.......'}),
    rowFrom({11:'..F.......'}),
    rowFrom({0:'........?B',1:'?B?.......',4:'........BM',5:'B?........',11:'..F.......'}),
    rowFrom({8:'....PP....',11:'..F.......'}),
    rowFrom({3:'.....CCC..',6:'......CCC.',8:'....PP....',11:'..F.......'}),
    rowFrom({1:'..====....',2:'K.........',4:'K.....====',5:'=.......K.',7:'K....====.',8:'....PP....',9:'.....K....',10:'.....K....',11:'..F.......'}),
    GROUND,GROUND,GROUND
  ]},
  {name:'2-1',title:'Bernsteinhöhlen',theme:1,time:280,rows:[
    rowFrom({}),rowFrom({}),rowFrom({}),rowFrom({}),
    rowFrom({11:'.....F....'}),rowFrom({11:'.....F....'}),rowFrom({11:'.....F....'}),
    rowFrom({4:'..C.C.C...',11:'.....F....'}),
    rowFrom({6:'....?B?...',11:'.....F....'}),
    rowFrom({0:'.....?B?..',5:'.....?M?..',11:'.....F....'}),
    rowFrom({2:'...====...',6:'..====....',8:'....PP....',11:'.....F....'}),
    rowFrom({3:'..CCC.....',8:'....PP....',11:'.....F....'}),
    rowFrom({1:'K.........',3:'..K.......',4:'...====...',6:'K...=.....',7:'.....K....',8:'....PP....',9:'..K.......',10:'.....====.',11:'.....F....'}),
    GROUND2,GROUND2,GROUND2
  ]},
  {name:'3-1',title:'Frostgipfel',theme:2,time:280,rows:[
    rowFrom({}),rowFrom({}),rowFrom({}),rowFrom({}),
    rowFrom({11:'......F...'}),rowFrom({11:'......F...'}),rowFrom({11:'......F...'}),rowFrom({11:'......F...'}),
    rowFrom({3:'.....CCC..',11:'......F...'}),
    rowFrom({1:'.....?B?..',5:'..?M?.....',11:'......F...'}),
    rowFrom({3:'..====....',6:'....====..',11:'......F...'}),
    rowFrom({11:'......F...'}),
    rowFrom({0:'.......K..',2:'.......K..',5:'..K.......',6:'....K.....',8:'....K.....',10:'...K......',11:'......F...'}),
    GROUND3,GROUND3,GROUND3
  ]},
  {name:'4-1',title:'Sternenschloss',theme:3,time:260,rows:[
    rowFrom({}),rowFrom({}),rowFrom({}),rowFrom({}),
    rowFrom({11:'....F.....'}),rowFrom({11:'....F.....'}),rowFrom({11:'....F.....'}),
    rowFrom({2:'........C.',4:'..C.C.C...',11:'....F.....'}),
    rowFrom({5:'..====....',9:'..?B?M....',11:'....F.....'}),
    rowFrom({0:'....?B?...',6:'..==......',11:'....F.....'}),
    rowFrom({1:'.===......',4:'..====....',7:'....====..',10:'.===......',11:'....F.....'}),
    rowFrom({3:'PP........',11:'....F.....'}),
    rowFrom({2:'K.........',3:'PP........',6:'K..K......',9:'..K.......',10:'.....K....',11:'....F.....'}),
    GROUND4,GROUND4,GROUND4
  ]}
];

// ---------- Welt-Farben (Himmel, Berge, Boden, Oberkante, Ziegel) ----------
const THEMES=[
  {sky:'#5c94fc',far:'#3c8a3c',ground:'#b5562a',top:'#3cbc3c',brick:'#c86a3a'},
  {sky:'#e9a85a',far:'#b06b3a',ground:'#7a4a2a',top:'#f2c05a',brick:'#a5622f'},
  {sky:'#9fd8ef',far:'#e8f4ff',ground:'#3c5a86',top:'#f0faff',brick:'#5a7eb0'},
  {sky:'#14143a',far:'#2e2e66',ground:'#4a3c70',top:'#8a7ac8',brick:'#6a5aa0'}
];

// ---------- Spielzustand ----------
let state='title',stageIdx=0,lives=3,score=0,coins=0,timeLeft=0,stage=null,menuSel=0,frameNo=0,stateT=0,pausedFromState=null;
let tiles=[],camX=0,player=null,enemies=[],pickups=[],particles=[],popups=[],levelWidth=0;
let saved={v:2,hiscore:0,reached:0,bestTime:{}};
const held={left:false,right:false,jump:false};
const pressed={};
function takePress(k){if(pressed[k]){pressed[k]=false;return true;}return false;}

// ---------- Eingabe: Tastatur, Touch-Knöpfe, Klick auf dem Canvas ----------
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',KeyZ:'jump',ArrowUp:'jump',KeyW:'jump',Enter:'start',ArrowDown:'down',KeyS:'down',KeyP:'pause',Escape:'pause'};
addEventListener('keydown',e=>{
  const k=KEYMAP[e.code];if(!k)return;e.preventDefault();
  if(k==='left'||k==='right'||k==='jump'){if(!held[k]&&k==='jump')pressed.jump=true;held[k]=true;}
  else pressed[k]=true;
  Audio.unlock();
});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k&&(k==='left'||k==='right'||k==='jump')){e.preventDefault();held[k]=false;}});
document.querySelectorAll('[data-key]').forEach(b=>{
  const k=b.dataset.key;
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);Audio.unlock();held[k]=true;if(k==='jump')pressed.jump=true;});
  for(const t of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(t,()=>held[k]=false);
});
function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
canvas.addEventListener('pointerdown',e=>{
  Audio.unlock();
  if(state!=='title')return;
  const p=canvasPoint(e);
  for(let i=0;i<menuItems().length;i++){if(p.y>=118+i*18&&p.y<118+i*18+16){menuSel=i;activateMenu();}}
});
addEventListener('blur',()=>{held.left=held.right=held.jump=false;if(state==='play')pauseGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){held.left=held.right=held.jump=false;if(state==='play')pauseGame();}});

// ---------- Speicher (nur Bestwerte und erreichte Welt; Fortschritt pro Stufe) ----------
function setStatus(t){if(saveStatus)saveStatus.textContent=t;}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&s.v===2)saved={...saved,...s};}catch(e){}}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(saved));setStatus('Fortschritt auf diesem Gerät gespeichert. Mit Google auch geräteübergreifend.');}catch(e){setStatus('Speichern auf diesem Gerät nicht verfügbar.');}}

// ---------- Kollision: Kachelraster, Boxen bewegen sich Achse für Achse ----------
const Audio=window.LumoAudio||{unlock(){},play(){},tick(){},toggle(){},isMuted(){return true;}};
const SOLID='#B?MUP=';
function tileAt(c,r){if(r<0)return '.';if(r>=tiles.length)return '.';if(c<0)return '#';if(c>=levelWidth)return '#';return tiles[r][c];}
function isSolid(c,r){return SOLID.includes(tileAt(c,r));}
function cells(b){return[Math.floor(b.x/TILE),Math.floor((b.x+b.w-0.01)/TILE),Math.floor(b.y/TILE),Math.floor((b.y+b.h-0.01)/TILE)];}
function moveBox(b){
  b.x+=b.vx;b.wall=false;
  let[c0,c1,r0,r1]=cells(b);
  outerX:for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(isSolid(c,r)){b.wall=true;b.x=b.vx>0?c*TILE-b.w:(c+1)*TILE;break outerX;}
  b.y+=b.vy;b.grounded=false;b.ceil=null;
  [c0,c1,r0,r1]=cells(b);
  outerY:for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(isSolid(c,r)){
    if(b.vy>=0){b.y=r*TILE-b.h;b.grounded=true;}else{b.y=(r+1)*TILE;b.ceil={c,r};}
    b.vy=0;break outerY;}
}
function bumpTile(c,r){const k=c+','+r;bumps[k]=6;}
let bumps={};

// ---------- Level aufbauen ----------
function findGround(col){for(let r=0;r<tiles.length;r++)if(isSolid(col,r))return r*TILE;return 0;}
function newPlayer(x){const y=findGround(Math.floor(x/TILE))-14;return{x,y,w:12,h:14,vx:0,vy:0,face:1,big:false,grounded:false,coyote:0,buffer:0,inv:0,ceil:null,wall:false,dead:false,deadT:0,clearT:0,flagX:0};}
function loadStage(i){
  stageIdx=i;stage=STAGES[i];levelWidth=stage.rows[0].length;
  tiles=stage.rows.map(r=>r.split(''));
  enemies=[];pickups=[];particles=[];popups=[];bumps={};
  let flagCol=-1;
  for(let r=0;r<tiles.length;r++)for(let c=0;c<levelWidth;c++){
    const ch=tiles[r][c];
    if(ch==='K'){enemies.push({x:c*TILE,y:r*TILE+2,w:14,h:14,vx:-0.45,vy:0,dead:0,anim:0,wall:false,grounded:false,ceil:null});tiles[r][c]='.';}
    else if(ch==='C'){tiles[r][c]='.';pickups.push({kind:'coin',x:c*TILE+4,y:r*TILE+3,w:8,h:10});}
    else if(ch==='F'&&flagCol<0)flagCol=c;
  }
  stage.flagX=flagCol<0?levelWidth*TILE:flagCol*TILE;
  timeLeft=stage.time;camX=0;
  player=newPlayer(24);
}
function hitBlock(c,r){
  const ch=tiles[r][c];
  if(ch==='?'){tiles[r][c]='U';addCoin(200,c*TILE,(r-1)*TILE);bumpTile(c,r);Audio.play('block');}
  else if(ch==='M'){tiles[r][c]='U';pickups.push({kind:'shroom',x:c*TILE,y:(r-1)*TILE,w:14,h:14,vx:0.6,vy:0,grounded:false,wall:false,ceil:null});bumpTile(c,r);Audio.play('block');}
  else if(ch==='B'){if(player.big){tiles[r][c]='.';burst(c*TILE+8,r*TILE+8,stage.theme_brick||THEMES[stage.theme].brick,14);addScore(50,c*TILE,(r-1)*TILE);Audio.play('stomp');}else{bumpTile(c,r);Audio.play('bump');}}
  else if(ch==='U')Audio.play('bump');
}
function addScore(n,x,y){score+=n;popups.push({x,y,text:String(n),life:40});}
function addCoin(n,x,y){coins++;score+=n;popups.push({x,y,text:'+1',life:40});if(coins%100===0){lives++;popups.push({x,y:y-8,text:'1UP',life:60});}}
function burst(x,y,color,n=10){for(let i=0;i<n;i++){const a=i*2.4;particles.push({x,y,vx:Math.cos(a)*(1+(i%3)*0.4),vy:Math.sin(a)*1.2-1.2,life:24+(i%4)*6,color});}if(particles.length>160)particles.splice(0,particles.length-160);}

// ---------- Figur ----------
function updatePlayer(){
  const p=player;
  const target=((held.right?1:0)-(held.left?1:0))*1.9;
  const ax=p.grounded?0.15:0.1;
  if(target!==0){p.vx+=Math.max(-ax,Math.min(ax,target-p.vx));p.face=Math.sign(target);}
  else{const f=p.grounded?0.2:0.04;p.vx=Math.abs(p.vx)<f?0:p.vx-Math.sign(p.vx)*f;}
  p.coyote=p.grounded?6:Math.max(0,p.coyote-1);
  if(takePress('jump'))p.buffer=6;else if(p.buffer>0)p.buffer--;
  if(p.buffer>0&&p.coyote>0){p.vy=-5.6;p.buffer=0;p.coyote=0;Audio.play('jump');burst(p.x+6,p.y+p.h,'#ffffff',4);}
  if(!held.jump&&p.vy<-2)p.vy=-2;
  p.vy=Math.min(p.vy+((held.jump&&p.vy<0)?0.22:0.36),5.2);
  moveBox(p);
  if(p.wall)p.vx=0;
  if(p.ceil){const{c,r}=p.ceil;hitBlock(c,r);}
  if(p.inv>0)p.inv--;
}
function hurt(){
  const p=player;
  if(p.big){p.big=false;p.inv=120;p.h=14;p.y+=12;Audio.play('bump');burst(p.x+6,p.y+6,'#ffffff',8);return;}
  die('Erwischt');
}
function die(reason){
  if(player.dead)return;
  player.dead=true;player.deadT=0;player.vy=-5;player.vx=0;lives--;
  state='dying';stateT=0;Audio.play('death');
  setStatus(reason+'.');
  popups.push({x:player.x,y:player.y-8,text:reason,life:90});
}

// ---------- Gegner, Pilze, Münzen ----------
function updateEnemies(){
  for(const e of enemies){
    if(e.dead){e.dead++;continue;}
    e.anim++;
    e.vy=Math.min(e.vy+0.36,5);
    const fx=e.vx>0?e.x+e.w+1:e.x-1;
    if(e.grounded&&!isSolid(Math.floor(fx/TILE),Math.floor((e.y+e.h+1)/TILE)))e.vx=-e.vx;
    moveBox(e);
    if(e.wall)e.vx=-e.vx;
  }
  enemies=enemies.filter(e=>!e.dead||e.dead<30);
  for(const q of pickups){
    if(q.kind!=='shroom')continue;
    q.vy=Math.min(q.vy+0.36,5);moveBox(q);if(q.wall)q.vx=-q.vx;
  }
}
function overlapBox(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function checkInteractions(){
  const p=player;
  for(const e of enemies){
    if(e.dead||!overlapBox(p,e))continue;
    if(p.vy>0&&p.y+p.h<=e.y+7){
      e.dead=1;p.vy=held.jump?-5.2:-3.6;Audio.play('stomp');burst(e.x+7,e.y+7,'#ffffff',10);addScore(100,e.x,e.y-8);
    }else if(p.inv===0)hurt();
  }
  for(const q of pickups){
    if(!overlapBox(p,q))continue;
    if(q.kind==='coin'){q.gone=true;addCoin(200,q.x,q.y-8);Audio.play('coin');}
    if(q.kind==='shroom'){q.gone=true;if(!p.big){p.big=true;p.h=26;p.y-=12;}addScore(1000,q.x,q.y-8);Audio.play('shield');}
  }
  pickups=pickups.filter(q=>!q.gone);
  if(p.y>H+8)die('Abgestürzt');
  if(p.x+p.w>=stage.flagX&&!p.dead){startClear();}
}

// ---------- Zeichnen (alles mit Rechtecken und Text, pixelig skaliert) ----------
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function text(s,x,y,color='#fff',size=8,align='left'){ctx.font='bold '+size+'px monospace';ctx.textAlign=align;ctx.fillStyle='#000';ctx.fillText(s,Math.round(x)+1,Math.round(y)+1);ctx.fillStyle=color;ctx.fillText(s,Math.round(x),Math.round(y));ctx.textAlign='left';}
function pad(n,len=6){return String(Math.max(0,n)).padStart(len,'0');}
function drawCloud(x,y,s=1){rect(x+4*s,y,12*s,4*s,'#ffffff');rect(x,y+4*s,20*s,4*s,'#ffffff');rect(x+2*s,y-4*s,8*s,4*s,'#ffffff');}
function drawHills(th,offset,color,baseY,amp){for(let i=-1;i<6;i++){const x=i*96-offset%96;rect(x,baseY-amp,64,amp+16,color);rect(x+16,baseY-amp-8,32,8,color);}}
function drawBackground(){
  const th=THEMES[stage.theme];
  rect(0,0,W,H,th.sky);
  rect(200,28,28,28,stage.theme===3?'#fdf6d8':'#fff0bc');
  if(stage.theme===3)for(let i=0;i<30;i++)rect((i*71+11)%W,(i*29)%120,i%3?1:2,i%3?1:2,'#ffffff');
  drawHills(th,camX*0.4,th.far,190,36);
  for(let i=0;i<3;i++)drawCloud(((i*120-camX*0.2)%(W+60)+W+60)%(W+60)-30,30+i*18,1);
}
function drawTileAt(ch,x,y,c,r){
  const th=THEMES[stage.theme];
  if(ch==='#'){rect(x,y,TILE,TILE,th.ground);if(tileAt(c,r-1)!=='#')rect(x,y,TILE,4,th.top);rect(x+2,y+7,4,2,'#00000044');rect(x+10,y+11,4,2,'#00000044');return;}
  if(ch==='='){rect(x,y,TILE,TILE,th.brick);rect(x,y,TILE,4,th.top);rect(x,y+8,TILE,1,'#00000055');return;}
  if(ch==='B'){rect(x,y,TILE,TILE,th.brick);rect(x,y+7,TILE,1,'#00000066');rect(x+7,y,1,7,'#00000066');rect(x+3,y+8,1,8,'#00000066');return;}
  if(ch==='?'||ch==='M'){const col=ch==='?'?'#ffc83a':'#4aa3ff';rect(x,y,TILE,TILE,col);rect(x,y,TILE,2,'#ffffffaa');rect(x,y+14,TILE,2,'#00000066');text(ch==='?'?'?':'+',x+5,y+12,'#000',10);return;}
  if(ch==='U'){rect(x,y,TILE,TILE,'#8a6a4a');rect(x,y,TILE,1,'#5c4330');rect(x+2,y+2,2,2,'#5c4330');rect(x+12,y+12,2,2,'#5c4330');return;}
  if(ch==='P'){rect(x+2,y,12,TILE,'#2f9e44');rect(x+4,y,3,TILE,'#8ce99a');if(tileAt(c,r-1)!=='P'){rect(x,y,TILE,5,'#40c057');rect(x,y,TILE,1,'#ffffff88');}return;}
}
function drawTiles(){
  const c0=Math.max(0,Math.floor(camX/TILE)),c1=Math.min(levelWidth-1,c0+17);
  for(let r=0;r<tiles.length;r++)for(let c=c0;c<=c1;c++){
    const ch=tiles[r][c];if(ch==='.'||ch==='F')continue;
    const bump=bumps[c+','+r]||0;
    const y=r*TILE-(bump?Math.round(Math.sin(bump/6*Math.PI)*4):0);
    drawTileAt(ch,c*TILE-Math.round(camX),y,c,r);
  }
  for(let r=0;r<tiles.length;r++)for(let c=c0;c<=c1;c++)if(tiles[r][c]==='F'&&(r===0||tiles[r-1][c]!=='F')){
    const x=c*TILE-Math.round(camX)+7;let len=0;while(r+len<tiles.length&&tiles[r+len][c]==='F')len++;
    rect(x,r*TILE,2,len*TILE,'#e8e8e8');rect(x-1,r*TILE-2,4,4,'#ffec27');
    rect(x+2,r*TILE,12,8,'#e52521');
  }
}
function drawCoin(q){const w=Math.max(2,Math.round(8*Math.abs(Math.sin(frameNo/12+q.x))));rect(q.x+4-w/2,q.y,w,10,'#ffd23c');rect(q.x+4-w/2+1,q.y+2,Math.max(1,w-2),6,'#fff3a0');}
function drawShroom(q){const x=q.x-Math.round(camX),y=q.y;rect(x+1,y,12,7,'#e52521');rect(x+3,y+2,2,2,'#ffffff');rect(x+8,y+2,2,2,'#ffffff');rect(x+3,y+7,8,7,'#ffe0b1');rect(x+5,y+10,4,2,'#243449');}
function drawKrabbler(e){
  const x=e.x-Math.round(camX),y=e.y,flat=e.dead>0;
  if(flat){rect(x,y+9,14,5,'#8a4f9c');return;}
  const leg=(Math.floor(e.anim/6)%2)*2;
  rect(x,y+3,14,9,'#a060c0');rect(x+2,y,10,4,'#a060c0');
  rect(x+3,y+4,3,3,'#ffffff');rect(x+8,y+4,3,3,'#ffffff');rect(x+4,y+5,1,1,'#243449');rect(x+9,y+5,1,1,'#243449');
  rect(x+1,y+12,3,2+leg,'#4a2c5c');rect(x+10,y+12,3,2+(2-leg),'#4a2c5c');
}
function drawLumo(p){
  if(p.inv>0&&Math.floor(p.inv/4)%2===0)return;
  const x=Math.round(p.x-2-camX),y=Math.round(p.y);
  if(p.big){rect(x,y,16,26,'#2ab3a0');rect(x+2,y+2,12,2,'#63cfba');rect(x+2,y+12,12,4,'#ffe0b1');rect(x,y+18,16,2,'#ffb347');rect(x+3,y+14,2,2,'#243449');rect(x+11,y+14,2,2,'#243449');rect(x+2,y+20,12,4,'#2e6e7a');rect(x+3,y+24,4,2,'#263d56');rect(x+9,y+24,4,2,'#263d56');return;}
  const step=p.grounded&&p.vx?(Math.floor(frameNo/5)%2):0;
  rect(x+1,y,12,4,'#2ab3a0');rect(x+2,y+3,10,6,'#ffe0b1');rect(x+(p.face>0?8:4),y+5,2,2,'#243449');
  rect(x+1,y+9,14,2,'#ffb347');rect(x+3,y+11,8,3,'#2e6e7a');rect(x+2,y+12+step,3,2,'#263d56');rect(x+8,y+12-step,3,2,'#263d56');
}
function drawEntities(){
  for(const q of pickups){if(q.kind==='coin')drawCoin(q);else drawShroom(q);}
  for(const e of enemies)if(!e.dead||e.dead<30)drawKrabbler(e);
  if(state!=='gameover')drawLumo(player);
}
function drawFx(){
  for(const q of particles)rect(q.x-camX,q.y,2,2,q.color);
  for(const q of popups)text(q.text,q.x-camX,q.y,'#fff8dc',8);
}
function drawHUD(){
  rect(0,0,W,14,'#000000aa');
  text('LUMO x'+pad(lives,2),6,10,'#fff',8);
  text('◎'+pad(coins,2),78,10,'#ffd23c',8);
  text(pad(score),W-6,10,'#ffffff',8,'right');
  text('WELT '+stage.name,W/2,10,'#fff',8,'center');
  const left=Math.ceil(Math.max(0,timeLeft));
  rect(0,H-14,W,14,'#000000aa');
  text('ZEIT '+pad(left,3),6,H-4,left<60?'#ff8a80':'#ffffff',8);
  text(stage.title.toUpperCase(),W-6,H-4,'#fff8dc',8,'right');
}
function drawTitle(){
  const th=THEMES[0];camX=0;
  rect(0,0,W,H,'#5c94fc');
  rect(0,H-48,W,48,th.ground);rect(0,H-48,W,6,th.top);
  for(let i=0;i<5;i++)drawHills(th,i*0,'#3c8a3c',H-48,36);
  for(let i=0;i<4;i++)drawCloud(((i*90+frameNo*0.3)%(W+60))-30,20+(i%2)*26,1);
  // Logo mit Konturen
  ctx.font='bold 48px monospace';ctx.textAlign='center';
  for(const[dx,dy]of[[-2,0],[2,0],[0,-2],[0,2],[-2,-2],[2,2],[-2,2],[2,-2]]){ctx.fillStyle='#000';ctx.fillText('LUMO',W/2+dx,58+dy);}
  const g=ctx.createLinearGradient(0,20,0,60);g.addColorStop(0,'#fff27a');g.addColorStop(1,'#ff9d2a');
  ctx.fillStyle=g;ctx.fillText('LUMO',W/2,58);ctx.textAlign='left';
  text('W O L K E N P F A D',W/2,70,'#ffffff',9,'center');
  const bob=Math.round(Math.sin(frameNo/14)*2);
  drawLumo({...player,x:W/2-6,y:86+bob,face:1,grounded:true,vx:0,big:false,inv:0});
  const items=menuItems();
  items.forEach((label,i)=>{const y=118+i*18;if(i===menuSel)text('▶',W/2-62,y+11,'#ffec27',8);text(label,W/2-52,y+11,i===menuSel?'#fff':'#dfe9ff',9);});
  text('HI-SCORE '+pad(saved.hiscore),W/2,186,'#ffec27',8,'center');
  if(Math.floor(frameNo/30)%2===0)text('DRÜCKE ENTER ODER A',W/2,206,'#ffffff',8,'center');
  text('©  FAN-SPIEL',W/2,226,'#dfe9ff',7,'center');
}
function menuItems(){return saved.reached>0?['NEUES SPIEL','WEITER ('+STAGES[saved.reached].name+')']:['NEUES SPIEL'];}
function drawOverlay(title,lines,color){
  rect(0,0,W,H,'#000000cc');
  text(title,W/2,96,color,18,'center');
  lines.forEach((l,i)=>text(l,W/2,128+i*14,'#ffffff',8,'center'));
}
function draw(){
  if(state==='title'){drawTitle();return;}
  drawBackground();drawTiles();drawEntities();drawFx();
  if(state==='intro'){drawHUD();drawOverlay('WELT '+stage.name,[stage.title.toUpperCase(),'LUMO x'+lives],'#ffec27');return;}
  if(state==='play'||state==='dying'||state==='clear'||state==='paused'){drawHUD();}
  if(state==='paused')drawOverlay('PAUSE',['P oder ENTER zum Weiterspielen'],'#ffffff');
  if(state==='clear')drawOverlay('WELT '+stage.name+' GESCHAFFT!',['ZEITBONUS '+pad(Math.floor(timeLeft)*50)],'#ffec27');
  if(state==='gameover')drawOverlay('GAME OVER',['PUNKTE '+pad(score),'HI-SCORE '+pad(saved.hiscore),'ENTER ZUM NEUSTART'],'#e52521');
  if(state==='credits')drawOverlay('ENDE',['LUMO HAT DEN WOLKENPFAD GEMEISTERT!','PUNKTE '+pad(score),'ENTER FÜR DEN TITEL'],'#ffec27');
}

// ---------- Zustände: title, intro, play, dying, clear, paused, gameover, credits ----------
function setPanel(show){panel.classList.toggle('show',show);}
function newGame(continueAt){
  lives=3;score=0;coins=0;
  const i=continueAt?saved.reached:0;
  loadStage(i);saved.reached=Math.max(saved.reached,i);
  state='intro';stateT=0;setPanel(false);
  persist();
}
function activateMenu(){
  Audio.unlock();
  const items=menuItems();const label=items[menuSel];
  if(label.startsWith('WEITER'))newGame(true);else newGame(false);
}
function pauseGame(){if(state==='play'){state='paused';Audio.play('tick');}}
function startClear(){
  if(state!=='play')return;
  state='clear';stateT=0;Audio.play('finish');
  score+=Math.floor(Math.max(0,timeLeft))*50;
  saved.hiscore=Math.max(saved.hiscore,score);
  const best=saved.bestTime[stageIdx];const t=Math.round((stage.time-timeLeft)*10)/10;
  if(!best||t<best)saved.bestTime[stageIdx]=t;
  persist();
  burst(player.x,player.y,'#ffec27',20);
}
function nextStage(){
  if(stageIdx+1<STAGES.length){
    loadStage(stageIdx+1);saved.reached=Math.max(saved.reached,stageIdx);
    state='intro';stateT=0;persist();
  }else{state='credits';stateT=0;saved.hiscore=Math.max(saved.hiscore,score);persist();}
}
function updateCamera(){
  const maxX=Math.max(0,levelWidth*TILE-W);
  camX=Math.max(0,Math.min(maxX,player.x+player.w/2-W/2));
}
function updateFx(){
  particles.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=0.12;q.life--;});particles=particles.filter(q=>q.life>0);
  popups.forEach(q=>{q.y-=0.35;q.life--;});popups=popups.filter(q=>q.life>0);
  for(const k in bumps){bumps[k]--;if(bumps[k]<=0)delete bumps[k];}
  for(const q of pickups)if(q.kind==='shroom'&&q.y>H+32)q.gone=true;
  pickups=pickups.filter(q=>!q.gone);
}
function update(){
  stateT++;
  switch(state){
    case'title':{
      if(takePress('down')){menuSel=(menuSel+1)%menuItems().length;}
      if(takePress('pause')||takePress('start')||takePress('jump'))activateMenu();
      break;}
    case'intro':{
      if(stateT>=120){state='play';stateT=0;setPanel(false);}
      break;}
    case'play':{
      if(takePress('pause')){pauseGame();break;}
      frameNo++;
      timeLeft-=1/60;
      if(timeLeft<=0){die('Zeit abgelaufen');break;}
      updatePlayer();
      updateEnemies();
      checkInteractions();
      updateCamera();
      updateFx();
      break;}
    case'dying':{
      const p=player;p.deadT++;
      p.vy=Math.min(p.vy+0.36,5);p.y+=p.vy;
      if(stateT>=120){
        if(lives>0){loadStage(stageIdx);state='intro';stateT=0;}
        else{state='gameover';stateT=0;saved.hiscore=Math.max(saved.hiscore,score);persist();}
      }
      break;}
    case'clear':{
      if(stateT>=200)nextStage();
      break;}
    case'paused':{
      if(takePress('pause')||takePress('start'))state='play';
      break;}
    case'gameover':{
      if(takePress('start')||stateT>240){state='title';stateT=0;menuSel=0;}
      break;}
    case'credits':{
      if(takePress('start')){state='title';stateT=0;menuSel=0;}
      break;}
  }
  for(const k in pressed)pressed[k]=false;
  setPanel(state==='title');
  document.body.classList.toggle('playing',['intro','play','dying','clear'].includes(state));
  Audio.tick(state==='play',stageIdx);
}

// ---------- Leiste oben: Ton, Pause, Vollbild ----------
const soundBtn=document.getElementById('sound');
function refreshSound(){const on=!Audio.isMuted();soundBtn.textContent=on?'♫ An':'♫ Aus';soundBtn.setAttribute('aria-pressed',String(on));}
soundBtn.onclick=()=>{Audio.unlock();Audio.toggle();refreshSound();};
document.getElementById('pause').onclick=()=>{if(state==='play')pauseGame();else if(state==='paused')state='play';};
document.getElementById('fullscreen').onclick=async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){setStatus('Vollbild wird hier nicht unterstützt.');}
};
refreshSound();

// ---------- Schleife: festes 60-Hz-Update, Zeichnen pro Bild ----------
let last=performance.now(),acc=0;
const STEP=1000/60;
function frame(now){
  acc+=Math.min(now-last,100);last=now;
  while(acc>=STEP){update();acc-=STEP;}
  draw();
  requestAnimationFrame(frame);
}
loadSave();
loadStage(0);
state='title';
setStatus(saved.reached>0?'Fortschritt gefunden – „WEITER“ setzt bei der letzten Welt fort.':'Dein Fortschritt wird automatisch lokal gespeichert.');
message.innerHTML='← → laufen · Leertaste / ↑ / W / A springen · P oder Esc Pause<br>Sternpilze machen dich groß und schützen einmal. Tritt auf Krabbler, sammle Münzen und erreiche die Fahnenstange.';
setPanel(true);
requestAnimationFrame(frame);
