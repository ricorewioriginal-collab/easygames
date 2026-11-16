'use strict';
// Lumo – Wolkenpfad: Minispiel in „Pufi & der Farbwind“. Jump-and-Run mit eigener Figur, eigenen Gegnern und eigenen Levels.
// Aufgewertete Fassung des früheren Einzelspiels: gleiche Level und Spielregeln, neue weiche Vektorgrafik in voller Auflösung,
// Breitbild, Parallax-Himmel, Licht und Partikel. Alle Namen, Figuren und Grafiken sind neu erfunden.
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
// Spielkoordinaten: 240 hoch, Breite passt sich dem Bildschirm an (256–432, Breitbild); gezeichnet wird in Gerätepixeln.
let W=256,SCALE=2;
const H=240,TILE=16,SAVE_KEY='easygames.pufi-farbwind.wolkenpfad.v1',OLD_KEY='easygames.lumo.v1';
function resize(){
  const vw=Math.max(1,innerWidth),vh=Math.max(1,innerHeight);
  W=Math.round(Math.max(256,Math.min(432,H*vw/vh)));
  const cssH=Math.min(vh,vw*H/W),cssW=cssH*W/H,dpr=Math.min(2.5,devicePixelRatio||1);
  SCALE=Math.max(1,cssH*dpr/H);
  canvas.width=Math.round(W*SCALE);canvas.height=Math.round(H*SCALE);
  canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';
  if(typeof sprites!=='undefined')sprites.clear();
}
addEventListener('resize',resize);
const panel=document.getElementById('panel'),message=document.getElementById('message'),saveStatus=document.getElementById('saveStatus');

// ---------- Levelkarten: 16 Zeilen, je 12 Blöcke à 10 Zeichen = 120 Kacheln breit ----------
// Zeichen: # Boden  = Plattform  B Ziegel  ? Fragezeile(Münze)  M Fragezeile(Schutzpilz)  U leerer Block
//          P Säule  C Münze  K Krabbler  F Fahnenstange  . leer
const rowFrom=o=>{let s='';for(let i=0;i<12;i++)s+=(o[i]||'..........').padEnd(10,'.');return s;};
const GROUND=rowFrom({0:'##########',1:'##########',2:'##########',3:'   #######',4:'##########',5:'##########',6:'##   #####',7:'##########',8:'##########',9:'  ########',10:'##########',11:'##########'});
// Zusätzliche Zeichen: X Stachelspitzen (Gefahr) · O bewegliche Plattform · Q Sternblock · R Stern · J Herz
// Gegner: K Krabbler · H Hüpfer · V Fledermaus (fliegt) · S Stachelkäfer (nur ausweichen, nicht treten)
const GROUND2=rowFrom({0:'##########',1:'##########',2:'    ######',3:'##########',4:'##########',5:'   #######',6:'##########',7:'##########',8:'   #######',9:'##########',10:'  ########',11:'##########'});
const GROUND3=rowFrom({0:'##########',1:'######   #',2:'##########',3:'##########',4:'     #####',5:'##########',6:'##########',7:'  ########',8:'##########',9:'######    ',10:'##########',11:'##########'});
const GROUND4=rowFrom({0:'##########',1:'##########',2:'##########',3:'##########',4:'  ########',5:'##########',6:'##########',7:'   #######',8:'##########',9:'##########',10:'##########',11:'##########'});
const HAND_LEVELS=[
  {name:'1-1',title:'Wolkenwiese',theme:0,time:300,rows:[
    rowFrom({}),rowFrom({}),rowFrom({}),rowFrom({}),
    rowFrom({11:'..F.......'}),rowFrom({11:'..F.......'}),rowFrom({11:'..F.......'}),
    rowFrom({0:'.........C',1:'CC........',11:'..F.......'}),
    rowFrom({3:'.........J',6:'.....V....',11:'..F.......'}),
    rowFrom({0:'........?B',1:'?B?.......',4:'........BM',5:'B?.......Q',11:'..F.......'}),
    rowFrom({2:'..OOO.....',8:'....PP....',11:'..F.......'}),
    rowFrom({3:'.....CCC..',6:'......CCC.',8:'....PP....',11:'..F.......'}),
    rowFrom({1:'..====....',2:'K.........',4:'K.XX..====',5:'=...H..K..',7:'K....====.',8:'S...PP....',9:'.....K..X.',10:'.....K....',11:'..F.......'}),
    GROUND,GROUND,GROUND
  ]},
  {name:'2-1',title:'Bernsteinhöhlen',theme:1,time:280,rows:[
    rowFrom({}),rowFrom({}),rowFrom({}),rowFrom({}),
    rowFrom({11:'.....F....'}),rowFrom({11:'.....F....'}),rowFrom({11:'.....F....'}),
    rowFrom({4:'..C.C.C...',7:'.....R....',11:'.....F....'}),
    rowFrom({3:'..V.......',6:'....?B?...',11:'.....F....'}),
    rowFrom({0:'.....?B?..',5:'.....?M?..',7:'..Q.......',11:'.....F....'}),
    rowFrom({2:'...====...',5:'OOO.......',6:'..====....',8:'....PP....',11:'.....F....'}),
    rowFrom({3:'..CCC.....',8:'....PP....',11:'.....F....'}),
    rowFrom({1:'K.........',3:'..K.S.....',4:'...====.X.',6:'K.H.=.....',7:'.....K....',8:'....PP....',9:'..K.......',10:'.....====.',11:'.....F....'}),
    GROUND2,GROUND2,GROUND2
  ]},
  {name:'3-1',title:'Frostgipfel',theme:2,time:280,rows:[
    rowFrom({}),rowFrom({}),rowFrom({}),rowFrom({}),
    rowFrom({11:'......F...'}),rowFrom({11:'......F...'}),rowFrom({11:'......F...'}),rowFrom({11:'......F...'}),
    rowFrom({3:'.....CCC..',6:'.........J',11:'......F...'}),
    rowFrom({1:'.....?B?..',5:'..?M?.....',6:'..Q.......',8:'..V.......',11:'......F...'}),
    rowFrom({3:'..====....',6:'....====..',9:'OOO.......',11:'......F...'}),
    rowFrom({11:'......F...'}),
    rowFrom({0:'.......K..',2:'.......K..',3:'.X........',5:'..K.H.....',6:'..S.K.....',8:'....K.X...',10:'...K......',11:'......F...'}),
    GROUND3,GROUND3,GROUND3
  ]},
  {name:'4-1',title:'Sternenschloss',theme:3,time:260,rows:[
    rowFrom({}),rowFrom({}),rowFrom({}),rowFrom({}),
    rowFrom({11:'....F.....'}),rowFrom({11:'....F.....'}),rowFrom({11:'....F.....'}),
    rowFrom({2:'........C.',4:'..C.C.C...',7:'....R.....',11:'....F.....'}),
    rowFrom({5:'..====....',9:'..?B?M....',10:'J.........',11:'....F.....'}),
    rowFrom({0:'....?B?...',6:'..==......',8:'V.........',11:'....F.....'}),
    rowFrom({1:'.===......',3:'OOO.......',4:'..====....',7:'....====..',10:'.===......',11:'....F.....'}),
    rowFrom({3:'PP........',11:'....F.....'}),
    rowFrom({2:'K.........',3:'PP..X.....',4:'..S.......',6:'K..K......',7:'...X......',9:'..K..H....',10:'.....K....',11:'....F.....'}),
    GROUND4,GROUND4,GROUND4
  ]}
];

// ---------- Prozedurale Level: 20 Level in 4 Welten + 4 Münzgärten (Bonus) ----------
// Jede Welt beginnt mit einem handgebauten Level; die übrigen werden deterministisch erzeugt.
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function genLevel(L){
  const R=rng((L+1)*97531+5),d=L/19,W=120;
  const g=Array.from({length:16},()=>Array(W).fill('.'));
  const pit=Array(W).fill(false);
  let c=6;
  while(c<W-16){ // Gruben: 1–3 Kacheln breit, immer mit festem Boden dazwischen
    c+=3+Math.floor(R()*7);
    if(c>=W-16)break;
    const pw=1+Math.floor(R()*(d>0.4?3:2));
    for(let k=0;k<pw&&c+k<W-16;k++)pit[c+k]=true;
    c+=pw+1;
  }
  for(let x=0;x<W;x++)if(!pit[x]){g[13][x]='#';g[14][x]='#';g[15][x]='#';}
  const free=(x,y)=>x>=0&&x<W&&y>=0&&y<16&&g[y][x]==='.';
  const put=(x,y,ch)=>{if(free(x,y))g[y][x]=ch;};
  const groundOK=x=>x>=0&&x<W&&!pit[x]&&x<W-16;
  const nearPit=x=>pit[x-1]||pit[x]||pit[x+1];
  const enemy=()=>{const q=R();if(q<d*0.35)return 'S';if(q<0.35+d*0.35)return 'H';if(q<0.5+d*0.2)return 'V';return 'K';};
  for(let x=8;x<W-18;){
    const roll=R();
    if(roll<0.2){ // Plattform mit Münzen darüber
      const row=R()<0.5?9:10,len=3+Math.floor(R()*3);
      for(let k=0;k<len;k++)put(x+k,row,'=');
      if(R()<0.8)for(let k=0;k<len;k++)put(x+k,row-2,'C');
    }else if(roll<0.34){ // Fragezeilen mit Münze, Schutzpilz oder Stern
      put(x,9,'?');put(x+1,9,R()<0.3?'M':'B');put(x+2,9,'?');
      if(d>0.4&&R()<0.25)put(x+3,9,'Q');
    }else if(roll<0.42){ // Münzreihe knapp über dem Boden
      for(let k=0;k<3;k++)put(x+k,11,'C');
    }else if(roll<0.5){ // Stacheln oder Röhre am Boden
      if(groundOK(x)&&!nearPit(x)&&free(x,12)){
        if(R()<0.6+d*0.2)g[12][x]='X';else{put(x,11,'P');put(x,12,'P');}
      }
    }else if(roll<0.56){ // bewegliche Plattform
      for(let k=0;k<3;k++)put(x+k,10,'O');
    }else if(roll<0.82){ // Gegner
      const kind=enemy();
      if(kind==='V')put(x,9,'V');
      else if(groundOK(x)&&free(x,12))put(x,12,kind);
    }else if(roll<0.86){
      put(x,9,'J');
    }
    x+=5+Math.floor(R()*6);
  }
  // Ein Stern pro Level in Welt-Mitte, damit der Stern nicht selten bleibt
  for(let t=0;t<40;t++){const x=20+Math.floor(R()*80);if(groundOK(x)&&free(x,12)){g[12][x]='R';break;}}
  for(let r=4;r<=12;r++)g[r][W-6]='F';
  return g.map(row=>row.join(''));
}
function genBonus(){ // Münzgarten: keine Gegner, nur Münzen auf Stufen
  const g=Array.from({length:16},()=>Array(120).fill('.'));
  for(let x=0;x<120;x++){g[13][x]='#';g[14][x]='#';g[15][x]='#';}
  for(let i=0;i<6;i++){const x0=8+i*18,row=i%2?10:12;for(let k=0;k<4;k++){g[row][x0+k]='=';g[row-2][x0+k]='C';}}
  for(let x=6;x<112;x+=3)g[7][x]='C';
  return g.map(row=>row.join(''));
}
const WORLD_TITLES=['Wolkenwiese','Bernsteinhöhlen','Frostgipfel','Sternenschloss'];
const STAGES=[];
for(let w=0;w<4;w++){
  for(let k=0;k<5;k++){
    const L=w*5+k;
    if(k===0){const h=HAND_LEVELS[w];STAGES.push({name:h.name,title:WORLD_TITLES[w],theme:w,time:h.time,rows:h.rows,bonus:false});}
    else STAGES.push({name:`${w+1}-${k+1}`,title:WORLD_TITLES[w],theme:w,time:Math.round(300-(L/19)*40),rows:genLevel(L),bonus:false});
  }
  STAGES.push({name:`${w+1}-B`,title:'Münzgarten',theme:w,time:20,rows:genBonus(),bonus:true});
}

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
  if(state==='title'&&(e.code==='ArrowUp'||e.code==='KeyW')){e.preventDefault();pressed.up=true;Audio.unlock();return;}
  if(state==='title'&&e.code==='Escape'){e.preventDefault();pressed.back=true;return;}
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
  for(let i=0;i<menuItems().length;i++){const m=menuRect(i);if(p.y>=m.y&&p.y<m.y+m.h&&p.x>=m.x-10&&p.x<m.x+m.w+10){menuSel=i;activateMenu();return;}}
  if(p.y<120){menuSel=0;activateMenu();}
});
addEventListener('blur',()=>{held.left=held.right=held.jump=false;if(state==='play')pauseGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){held.left=held.right=held.jump=false;if(state==='play')pauseGame();}});

// ---------- Speicher (nur Bestwerte und erreichte Welt; Fortschritt pro Stufe) ----------
function setStatus(t){if(saveStatus)saveStatus.textContent=t;}
function loadSave(){ // übernimmt einmalig den Spielstand des früheren Einzelspiels
  try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||localStorage.getItem(OLD_KEY));if(s&&s.v===2)saved={...saved,...s};}catch(e){}}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(saved));setStatus('Fortschritt auf diesem Gerät gespeichert. Mit Google auch geräteübergreifend.');}catch(e){setStatus('Speichern auf diesem Gerät nicht verfügbar.');}}

// ---------- Kollision: Kachelraster, Boxen bewegen sich Achse für Achse ----------
const Audio=window.LumoAudio||{unlock(){},play(){},tick(){},toggle(){},isMuted(){return true;}};
const SOLID='#B?MUPQ=';
let movers=[];
function tileAt(c,r){if(r<0)return '.';if(r>=tiles.length)return '.';if(c<0)return '#';if(c>=levelWidth)return '#';return tiles[r][c];}
function isSolid(c,r){return SOLID.includes(tileAt(c,r));}
function cells(b){return[Math.floor(b.x/TILE),Math.floor((b.x+b.w-0.01)/TILE),Math.floor(b.y/TILE),Math.floor((b.y+b.h-0.01)/TILE)];}
function moveBox(b){
  b.x+=b.vx;b.wall=false;
  let[c0,c1,r0,r1]=cells(b);
  outerX:for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(isSolid(c,r)){b.wall=true;b.x=b.vx>0?c*TILE-b.w:(c+1)*TILE;break outerX;}
  const prevBottom=b.y+b.h;
  b.y+=b.vy;b.grounded=false;b.ceil=null;b.mover=null;
  [c0,c1,r0,r1]=cells(b);
  outerY:for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(isSolid(c,r)){
    if(b.vy>=0){b.y=r*TILE-b.h;b.grounded=true;}else{b.y=(r+1)*TILE;b.ceil={c,r};}
    b.vy=0;break outerY;}
  if(b.vy>=0&&!b.grounded)for(const m of movers){
    if(b.x+b.w>m.x&&b.x<m.x+m.w&&prevBottom<=m.y+0.5&&b.y+b.h>=m.y){b.y=m.y-b.h;b.vy=0;b.grounded=true;b.mover=m;break;}
  }
}
function bumpTile(c,r){const k=c+','+r;bumps[k]=6;}
let bumps={};

// ---------- Level aufbauen ----------
function findGround(col){for(let r=0;r<tiles.length;r++)if(isSolid(col,r))return r*TILE;return 0;}
function newPlayer(x){const y=findGround(Math.floor(x/TILE))-14;return{x,y,w:12,h:14,vx:0,vy:0,face:1,big:false,grounded:false,coyote:0,buffer:0,inv:0,ceil:null,wall:false,dead:false,deadT:0,clearT:0,flagX:0,star:0,mover:null};}
function loadStage(i){
  stageIdx=i;stage=STAGES[i];levelWidth=stage.rows[0].length;
  tiles=stage.rows.map(r=>r.split(''));
  enemies=[];pickups=[];particles=[];popups=[];bumps={};movers=[];
  let flagCol=-1;
  for(let r=0;r<tiles.length;r++)for(let c=0;c<levelWidth;c++){
    const ch=tiles[r][c];
    if('KHVS'.includes(ch)){enemies.push(spawnEnemy(ch,c,r));tiles[r][c]='.';}
    else if(ch==='C'){tiles[r][c]='.';pickups.push({kind:'coin',x:c*TILE+4,y:r*TILE+3,w:8,h:10});}
    else if(ch==='R'){tiles[r][c]='.';pickups.push({kind:'star',x:c*TILE,y:r*TILE,w:14,h:14,vx:0.5,vy:0,grounded:false,wall:false,ceil:null});}
    else if(ch==='J'){tiles[r][c]='.';pickups.push({kind:'heart',x:c*TILE+2,y:r*TILE+2,w:12,h:12});}
    else if(ch==='F'&&flagCol<0)flagCol=c;
    else if(ch==='O'&&(c===0||tiles[r][c-1]!=='O')){
      let len=0;while(c+len<levelWidth&&tiles[r][c+len]==='O'){tiles[r][c+len]='.';len++;}
      movers.push({x:c*TILE,y:r*TILE,w:len*TILE,h:6,ox:c*TILE,vx:0.5,dx:0});
    }
  }
  stage.flagX=flagCol<0?levelWidth*TILE:flagCol*TILE;
  if(stage.bonus)stage.flagX=Infinity; // Münzgarten endet mit der Zeit, nicht mit einer Fahne
  timeLeft=stage.time;camX=0;
  player=newPlayer(24);
}
function spawnEnemy(kind,c,r){
  const e={kind,x:c*TILE,y:r*TILE+2,w:14,h:14,vx:-0.45,vy:0,dead:0,anim:0,wall:false,grounded:false,ceil:null,t:60+Math.floor(Math.random()*60)};
  if(kind==='H')e.vx=-0.35;
  if(kind==='S')e.vx=-0.5;
  if(kind==='V'){e.ox=e.x;e.baseY=r*TILE-22;e.y=e.baseY;e.vx=-0.6;}
  return e;
}
function updateMovers(){for(const m of movers){const px=m.x;m.x+=m.vx;if(m.x<m.ox-24||m.x>m.ox+24)m.vx=-m.vx;m.dx=m.x-px;}}
function hitBlock(c,r){
  const ch=tiles[r][c];
  if(ch==='Q'){tiles[r][c]='U';pickups.push({kind:'star',x:c*TILE,y:(r-1)*TILE,w:14,h:14,vx:0.6,vy:0,grounded:false,wall:false,ceil:null,rise:true});bumpTile(c,r);Audio.play('block');return;}
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
  if(p.star>0)p.star--;
  if(p.mover&&p.grounded)p.x+=p.mover.dx;
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
    if(e.kind==='V'){ // Fledermaus: fliegt in Wellen zwischen zwei Punkten
      e.x+=e.vx;if(e.x<e.ox-48||e.x>e.ox+48)e.vx=-e.vx;
      e.y=e.baseY+Math.sin(e.anim/18)*10;continue;
    }
    if(e.kind==='H'&&e.grounded&&--e.t<=0){e.vy=-4.6;e.t=80+Math.floor(Math.random()*70);} // Hüpfer springt von allein
    e.vy=Math.min(e.vy+0.36,5);
    const fx=e.vx>0?e.x+e.w+1:e.x-1;
    if(e.grounded&&!isSolid(Math.floor(fx/TILE),Math.floor((e.y+e.h+1)/TILE)))e.vx=-e.vx;
    moveBox(e);
    if(e.wall)e.vx=-e.vx;
  }
  enemies=enemies.filter(e=>!e.dead||e.dead<30);
  for(const q of pickups){
    if(q.kind!=='shroom'&&q.kind!=='star')continue;
    q.vy=Math.min(q.vy+0.36,5);moveBox(q);if(q.wall)q.vx=-q.vx;
  }
}
function overlapBox(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function checkInteractions(){
  const p=player;
  for(const e of enemies){
    if(e.dead||!overlapBox(p,e))continue;
    if(p.star>0){ // Sternzeit: alles wird weggestoßen
      e.dead=1;addScore(200,e.x,e.y-8);burst(e.x+7,e.y+7,'#ffec27',12);Audio.play('stomp');continue;
    }
    if(e.kind==='S'){if(p.inv===0)hurt();continue;} // Stachelkäfer kann man nicht treten
    if(p.vy>0&&p.y+p.h<=e.y+7){
      e.dead=1;p.vy=held.jump?-5.2:-3.6;Audio.play('stomp');burst(e.x+7,e.y+7,'#ffffff',10);addScore(100,e.x,e.y-8);
    }else if(p.inv===0)hurt();
  }
  // Stachelspitzen: Berührung kostet Leben, außer mit Stern oder Unverwundbarkeit
  if(p.inv===0&&p.star===0&&!p.dead){
    const[c0,c1,r0,r1]=cells(p);
    outerX:for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(tileAt(c,r)==='X'){hurt();break outerX;}
  }
  for(const q of pickups){
    if(!overlapBox(p,q))continue;
    if(q.kind==='coin'){q.gone=true;addCoin(200,q.x,q.y-8);Audio.play('coin');}
    if(q.kind==='shroom'){q.gone=true;if(!p.big){p.big=true;p.h=26;p.y-=12;}addScore(1000,q.x,q.y-8);Audio.play('shield');}
    if(q.kind==='star'){q.gone=true;p.star=480;addScore(1000,q.x,q.y-8);Audio.play('finish');}
    if(q.kind==='heart'){q.gone=true;lives++;popups.push({x:q.x,y:q.y-8,text:'1UP',life:60});Audio.play('shield');}
  }
  pickups=pickups.filter(q=>!q.gone);
  if(p.y>H+8)die('Abgestürzt');
  if(p.x+p.w>=stage.flagX&&!p.dead){startClear();}
}

// ---------- Zeichnen: weiche Vektorgrafik in hoher Auflösung (Kacheln als vorgerenderte Sprites) ----------
const FONT="'Nunito','Baloo 2','Trebuchet MS',system-ui,sans-serif";
const SKY=[ // Himmelverlauf oben/unten, Lichtfarbe, Nebel
  {top:'#4fa8ff',bot:'#c9ecff',sun:'#fff3c4',haze:'#ffffff'},
  {top:'#ff9a5a',bot:'#ffe0a0',sun:'#fff0c8',haze:'#ffd9a0'},
  {top:'#6fb6e8',bot:'#e8f7ff',sun:'#ffffff',haze:'#ffffff'},
  {top:'#0c0a2e',bot:'#3d2a7a',sun:'#fdf6d8',haze:'#9a7aff'}
];
const LAYERS=[ // Parallax-Silhouetten: Farbe fern, Farbe nah
  ['#7cc6a8','#3f9a6a'],['#c98a52','#8a5530'],['#b8d4f0','#7fa4cf'],['#3a2f7a','#251c55']
];
const sprites=new Map();
function shade(hex,amt){ // Farbe aufhellen (+) oder abdunkeln (-), amt -1..1
  const n=parseInt(hex.slice(1,7),16);let r=n>>16,g=n>>8&255,b=n&255;
  const f=v=>Math.round(amt>=0?v+(255-v)*amt:v*(1+amt));
  return '#'+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1);
}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function lin(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g;}
function sprite(key,w,h,paint){ // einmal pro Auflösung zeichnen, danach nur noch kopieren
  let s=sprites.get(key);
  if(!s){s=document.createElement('canvas');s.width=Math.ceil(w*SCALE);s.height=Math.ceil(h*SCALE);const c=s.getContext('2d');c.scale(SCALE,SCALE);paint(c);sprites.set(key,s);}
  return s;
}
function blit(s,x,y,w,h){ctx.drawImage(s,x,y,w,h);}
function text(s,x,y,color='#fff',size=8,align='left',weight=900){
  ctx.font=weight+' '+size+'px '+FONT;ctx.textAlign=align;ctx.lineJoin='round';
  ctx.lineWidth=Math.max(1.5,size/4);ctx.strokeStyle='#1b1840cc';ctx.strokeText(s,x,y);
  ctx.fillStyle=color;ctx.fillText(s,x,y);ctx.textAlign='left';
}
function pad(n,len=6){return String(Math.max(0,n)).padStart(len,'0');}
function glow(x,y,r,color,a=.5){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(255,255,255,0)');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}

// --- Hintergrund ---
function ridge(offset,base,amp,freq,color,seed){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-2,H);
  for(let x=-2;x<=W+8;x+=6){const u=(x+offset)*freq;ctx.lineTo(x,base-amp*(.55+.3*Math.sin(u+seed)+.15*Math.sin(u*2.7+seed*3)));}
  ctx.lineTo(W+8,H);ctx.closePath();ctx.fill();
}
function softCloud(x,y,s,a=.9){
  ctx.globalAlpha=a;ctx.fillStyle='#ffffff';ctx.beginPath();
  ctx.arc(x,y,7*s,0,7);ctx.arc(x+9*s,y-4*s,9*s,0,7);ctx.arc(x+19*s,y,7*s,0,7);ctx.rect(x,y,19*s,7*s);ctx.fill();
  ctx.globalAlpha=a*.35;ctx.fillStyle='#9ac4ff';ctx.fillRect(x-2*s,y+4*s,23*s,3*s);ctx.globalAlpha=1;
}
function drawSky(theme,cx,t){
  const sk=SKY[theme],ly=LAYERS[theme];
  ctx.fillStyle=lin(ctx,0,H,[sk.top,sk.bot]);ctx.fillRect(0,0,W,H);
  const sx=W-58,sy=38;
  glow(sx,sy,70,sk.sun,.55);
  ctx.fillStyle=sk.sun;ctx.beginPath();ctx.arc(sx,sy,theme===3?11:14,0,7);ctx.fill();
  if(theme===3){ctx.fillStyle=sk.top;ctx.beginPath();ctx.arc(sx+5,sy-3,9,0,7);ctx.fill();
    for(let i=0;i<46;i++){const hx=Math.abs(Math.sin(i*12.9898)*43758.5453)%1,hy=Math.abs(Math.sin(i*78.233)*12345.678)%1,x=hx*W-cx*.05%W,y=hy*150,tw=.4+.6*Math.abs(Math.sin(t/40+i));ctx.globalAlpha=tw;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc((x+W)%W,y,i%4?0.7:1.2,0,7);ctx.fill();}
    ctx.globalAlpha=1;}
  if(theme===1){ // Bernsteinhöhlen: warme Lichtstrahlen
    ctx.globalAlpha=.12;ctx.fillStyle='#fff6d0';
    for(let i=0;i<4;i++){const x=((i*110-cx*.15)%(W+120)+W+120)%(W+120)-60;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+26,0);ctx.lineTo(x+80,H);ctx.lineTo(x+30,H);ctx.fill();}
    ctx.globalAlpha=1;}
  for(let i=0;i<4;i++){const x=((i*130-cx*.12-t*.08)%(W+90)+W+90)%(W+90)-50;softCloud(x,26+(i%3)*20,i%2?.8:1.1,theme===3?.18:.85);}
  ridge(cx*.18,178,62,.012,shade(ly[0],.25),1);
  ctx.fillStyle=lin(ctx,120,H,[sk.haze+'00',sk.haze+'55']);ctx.fillRect(0,110,W,H-110);
  ridge(cx*.35,196,46,.02,ly[0],4);
  if(theme===3){ // Schloss-Silhouette
    ctx.fillStyle=shade(ly[1],-.2);const bx=((300-cx*.35)%(W+260)+W+260)%(W+260)-120;
    ctx.fillRect(bx,126,70,80);for(let k=0;k<4;k++)ctx.fillRect(bx-6+k*24,104+(k%2)*10,14,40);
    for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(bx-8+k*24,104+(k%2)*10);ctx.lineTo(bx+1+k*24,88+(k%2)*10);ctx.lineTo(bx+10+k*24,104+(k%2)*10);ctx.fill();}
    ctx.fillStyle='#ffe58a';for(let k=0;k<3;k++)ctx.fillRect(bx+12+k*20,140,4,7);}
  ridge(cx*.6,214,30,.03,ly[1],7);
  if(theme===2){ctx.fillStyle='#ffffff';for(let i=0;i<34;i++){const x=((i*53-cx*.7+Math.sin(t/50+i)*10)%W+W)%W,y=(i*29+t*(.3+(i%3)*.15))%H;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(x,y,i%3?0.8:1.4,0,7);ctx.fill();}ctx.globalAlpha=1;}
  if(theme===0||theme===1){ctx.fillStyle=theme?'#fff2b0':'#fffbe0';for(let i=0;i<14;i++){const x=((i*83-cx*.5)%W+W)%W,y=60+(i*41)%120+Math.sin(t/30+i)*6;ctx.globalAlpha=.25+.25*Math.sin(t/20+i);ctx.beginPath();ctx.arc(x,y,1,0,7);ctx.fill();}ctx.globalAlpha=1;}
}
function drawBackground(){drawSky(stage.theme,camX,frameNo);}

// --- Kacheln ---
function tileSprite(ch,top){
  const th=THEMES[stage.theme],key=stage.theme+ch+(top?1:0);
  return sprite(key,TILE,TILE+4,c=>{
    c.translate(0,4);
    if(ch==='#'){
      c.fillStyle=lin(c,0,TILE,[shade(th.ground,.08),shade(th.ground,-.25)]);c.fillRect(0,0,TILE,TILE);
      c.fillStyle=shade(th.ground,-.35);c.globalAlpha=.5;
      c.beginPath();c.ellipse(4,9,2.2,1.4,0,0,7);c.ellipse(12,13,1.8,1.2,0,0,7);c.ellipse(11,5,1.3,1,0,0,7);c.fill();
      c.globalAlpha=.18;c.fillStyle='#fff';c.beginPath();c.ellipse(3.5,8.4,1.2,.6,0,0,7);c.fill();c.globalAlpha=1;
      if(top){
        c.fillStyle=lin(c,0,6,[shade(th.top,.35),th.top,shade(th.top,-.25)]);
        c.beginPath();c.moveTo(0,0);c.lineTo(16,0);c.lineTo(16,4);
        for(let x=16;x>=0;x-=4)c.quadraticCurveTo(x-1,7,x-2,4.6),c.quadraticCurveTo(x-3,6,x-4,4);
        c.closePath();c.fill();
        c.fillStyle='rgba(255,255,255,.55)';c.fillRect(0,.4,16,.8);
        c.strokeStyle=shade(th.top,.4);c.lineWidth=.6;c.beginPath();
        for(let x=2;x<16;x+=5){c.moveTo(x,0);c.lineTo(x-.8,-2.2);c.moveTo(x+1.5,0);c.lineTo(x+2,-1.6);}c.stroke();
      }
    }else if(ch==='='){
      rr(c,0,1,TILE,10,3);c.fillStyle=lin(c,1,11,[shade(th.brick,.25),shade(th.brick,-.3)]);c.fill();
      rr(c,0,0,TILE,4,2);c.fillStyle=lin(c,0,4,[shade(th.top,.4),th.top]);c.fill();
      c.fillStyle='rgba(0,0,0,.18)';c.fillRect(7.5,4,1,7);
    }else if(ch==='B'){
      c.fillStyle=shade(th.brick,-.45);c.fillRect(0,0,TILE,TILE);
      const br=(x,y,w,h)=>{rr(c,x+.5,y+.5,w-1,h-1,1.6);c.fillStyle=lin(c,y,y+h,[shade(th.brick,.25),shade(th.brick,-.15)]);c.fill();c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x+1.5,y+1,w-3,.8);};
      br(0,0,8,8);br(8,0,8,8);br(-4,8,8,8);br(4,8,8,8);br(12,8,8,8);
    }else if(ch==='?'||ch==='M'||ch==='Q'){
      const col=ch==='?'?'#ffc83a':ch==='M'?'#4aa3ff':'#b86cff';
      rr(c,.3,.3,TILE-.6,TILE-.6,3);c.fillStyle=lin(c,0,TILE,[shade(col,.45),col,shade(col,-.3)]);c.fill();
      c.lineWidth=.8;c.strokeStyle=shade(col,-.45);c.stroke();
      rr(c,1.6,1.4,TILE-3.2,4,2);c.fillStyle='rgba(255,255,255,.35)';c.fill();
      c.fillStyle=shade(col,-.5);[[2.5,2.5],[13.5,2.5],[2.5,13.5],[13.5,13.5]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,.8,0,7);c.fill();});
    }else if(ch==='U'){
      rr(c,.3,.3,TILE-.6,TILE-.6,3);c.fillStyle=lin(c,0,TILE,['#9a7a5a','#5c4330']);c.fill();
      c.lineWidth=.8;c.strokeStyle='#3a2a1c';c.stroke();
    }else if(ch==='P'){
      const g=c.createLinearGradient(2,0,14,0);g.addColorStop(0,'#1f7a32');g.addColorStop(.3,'#8ce99a');g.addColorStop(.6,'#40c057');g.addColorStop(1,'#1a6a2a');
      c.fillStyle=g;c.fillRect(2,0,12,TILE);
      if(top){const g2=c.createLinearGradient(0,0,16,0);g2.addColorStop(0,'#2a8a3c');g2.addColorStop(.3,'#a8f0b4');g2.addColorStop(.6,'#4ccc62');g2.addColorStop(1,'#1f7a32');rr(c,0,0,TILE,6,2);c.fillStyle=g2;c.fill();}
    }else if(ch==='X'){
      for(let j=0;j<4;j++){const sx=j*4,g=c.createLinearGradient(sx,0,sx+4,0);g.addColorStop(0,'#f4f4ff');g.addColorStop(.5,'#b8bcd0');g.addColorStop(1,'#6a6e88');
        c.fillStyle=g;c.beginPath();c.moveTo(sx,TILE);c.lineTo(sx+2,3);c.lineTo(sx+4,TILE);c.fill();}
      c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,TILE-1.2,TILE,1.2);
    }
  });
}
const BLOCK_ICON={'?':'?','M':'✚','Q':'★'};
function drawTileAt(ch,x,y,c,r){
  const up=tileAt(c,r-1),top=(ch==='#'&&up!=='#')||(ch==='P'&&up!=='P');
  blit(tileSprite(ch,top),x,y-4,TILE+.5,TILE+4.5);
  if(BLOCK_ICON[ch]){const p=1+Math.sin(frameNo/9+c)*.08;ctx.save();ctx.translate(x+8,y+8.6);ctx.scale(p,p);
    ctx.font='900 10px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillText(BLOCK_ICON[ch],.6,.8);ctx.fillStyle='#fffdf2';ctx.fillText(BLOCK_ICON[ch],0,0);ctx.restore();ctx.textBaseline='alphabetic';}
}
function drawMovers(){ // bewegliche Wolkenplattformen
  for(const m of movers){
    const x=m.x-camX,y=m.y+Math.sin(frameNo/20+m.ox)*.6;
    ctx.fillStyle='rgba(40,60,120,.18)';ctx.beginPath();ctx.ellipse(x+m.w/2,y+9,m.w/2,2.5,0,0,7);ctx.fill();
    ctx.fillStyle=lin(ctx,y-3,y+m.h+2,['#ffffff','#dcecff']);ctx.beginPath();
    for(let i=0;i<=m.w;i+=8)ctx.arc(x+i,y+2,4.5+(i/8%2),0,7);ctx.rect(x,y,m.w,m.h);ctx.fill();
    ctx.fillStyle='rgba(150,180,230,.45)';ctx.fillRect(x,y+m.h-1.5,m.w,1.5);
  }
}
function drawFlag(x,top,len){
  const yb=top+len*TILE;
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x+1,yb,6,1.6,0,0,7);ctx.fill();
  const g=ctx.createLinearGradient(x,0,x+3,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#a8b0c8');ctx.fillStyle=g;ctx.fillRect(x,top,2.4,len*TILE);
  glow(x+1,top-2,12,'#ffe27a',.7);
  ctx.fillStyle='#ffe27a';starPath(x+1.2,top-2,4.2,1.9);ctx.fill();
  ctx.fillStyle=lin(ctx,top,top+10,['#ffb0d4','#ff6fa8']);ctx.beginPath();ctx.moveTo(x+2.4,top+1);
  for(let i=0;i<=14;i+=2)ctx.lineTo(x+2.4+i,top+1+Math.sin(frameNo/7+i/3)*1.4);
  for(let i=14;i>=0;i-=2)ctx.lineTo(x+2.4+i,top+10+Math.sin(frameNo/7+i/3)*1.4-(14-i)*.15);
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';starPath(x+9,top+5.5+Math.sin(frameNo/7+2)*1.4,2.2,1);ctx.fill();
}
function starPath(x,y,R,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r:R;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}ctx.closePath();}
function drawTiles(){
  const cx=Math.round(camX*SCALE)/SCALE;
  const c0=Math.max(0,Math.floor(cx/TILE)),c1=Math.min(levelWidth-1,c0+Math.ceil(W/TILE)+1);
  for(let r=0;r<tiles.length;r++)for(let c=c0;c<=c1;c++){
    const ch=tiles[r][c];if(ch==='.'||ch==='F')continue;
    const bump=bumps[c+','+r]||0;
    const y=r*TILE-(bump?Math.sin(bump/6*Math.PI)*4:0);
    drawTileAt(ch,c*TILE-cx,y,c,r);
  }
  for(let r=0;r<tiles.length;r++)for(let c=c0;c<=c1;c++)if(tiles[r][c]==='F'&&(r===0||tiles[r-1][c]!=='F')){
    let len=0;while(r+len<tiles.length&&tiles[r+len][c]==='F')len++;
    drawFlag(c*TILE-cx+7,r*TILE,len);
  }
}

// --- Figuren und Gegenstände ---
function eye(x,y,r,lookX=0,blink=false){
  if(blink){ctx.strokeStyle='#243449';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.stroke();return;}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x,y,r,r*1.2,0,0,7);ctx.fill();
  ctx.fillStyle='#243449';ctx.beginPath();ctx.arc(x+lookX*r*.35,y+r*.15,r*.6,0,7);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+lookX*r*.35-r*.2,y-r*.15,r*.22,0,7);ctx.fill();
}
function shadowAt(x,y,w){ctx.fillStyle='rgba(20,20,60,.22)';ctx.beginPath();ctx.ellipse(x,y,w,1.6,0,0,7);ctx.fill();}
function drawCoin(q){
  const x=q.x-camX+4,y=q.y+5+Math.sin(frameNo/14+q.x)*.8,s=Math.cos(frameNo/12+q.x*.3);
  glow(x,y,9,'#ffe27a',.35);
  ctx.fillStyle=lin(ctx,y-5,y+5,['#fff3a0','#ffc83a','#d88a10']);ctx.beginPath();ctx.ellipse(x,y,Math.max(.8,4*Math.abs(s)),5,0,0,7);ctx.fill();
  if(Math.abs(s)>.35){ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.ellipse(x-1.2*s,y-1.6,.9*Math.abs(s),1.6,0,0,7);ctx.fill();}
}
function drawStar(q){const x=q.x-camX+7,y=q.y+7+Math.sin(frameNo/6)*1.5;
  glow(x,y,16,'#fff27a',.6);ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(frameNo/10)*.25);ctx.translate(-x,-y);
  ctx.fillStyle=lin(ctx,y-7,y+7,['#fffbc0','#ffd23c','#ff9d2a']);starPath(x,y,7.5,3.4);ctx.fill();ctx.restore();
  eye(x-2,y,1.1,0);eye(x+2,y,1.1,0);}
function drawHeart(q){const x=q.x-camX+6,y=q.y+6+Math.sin(frameNo/10),p=1+Math.sin(frameNo/8)*.06;
  glow(x,y,13,'#ff8aa8',.45);ctx.save();ctx.translate(x,y);ctx.scale(p,p);
  ctx.fillStyle=lin(ctx,-6,6,['#ff9ab4','#e52550']);ctx.beginPath();ctx.moveTo(0,5.5);ctx.bezierCurveTo(-8,0,-5,-7,0,-2.6);ctx.bezierCurveTo(5,-7,8,0,0,5.5);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.ellipse(-2.6,-2.2,1.4,.9,-.5,0,7);ctx.fill();ctx.restore();}
function drawShroom(q){const x=q.x-camX+7,y=q.y;
  shadowAt(x,y+14,6);
  ctx.fillStyle=lin(ctx,y+6,y+14,['#fff1d6','#ffcf9a']);rr(ctx,x-4,y+6,8,8,2.5);ctx.fill();
  ctx.fillStyle=lin(ctx,y,y+8,['#ff8a7a','#e52521','#b0141a']);ctx.beginPath();ctx.ellipse(x,y+6.5,7,6.5,0,Math.PI,0);ctx.fill();
  ctx.fillStyle='#fff';[[-3.5,3.6,1.6],[2.5,2.4,1.9],[4.8,5.6,1]].forEach(([dx,dy,r])=>{ctx.beginPath();ctx.arc(x+dx,y+dy,r,0,7);ctx.fill();});
  eye(x-1.8,y+9.6,.9);eye(x+1.8,y+9.6,.9);}
function blob(x,y,w,h,col,squash=0){ // weicher Körper mit Glanzlicht
  const hw=w/2*(1+squash*.15),hh=h/2*(1-squash*.15),cy=y+h-hh;
  ctx.fillStyle=lin(ctx,cy-hh,cy+hh,[shade(col,.35),col,shade(col,-.35)]);
  ctx.beginPath();ctx.ellipse(x+w/2,cy,hw,hh,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(x+w/2-hw*.35,cy-hh*.45,hw*.35,hh*.22,-.4,0,7);ctx.fill();
}
function drawKrabbler(e){
  const x=e.x-camX,y=e.y,d=Math.sign(e.vx)||-1;
  if(e.dead>0){ctx.globalAlpha=1-e.dead/30;blob(x,y+8,14,6,'#a060c0',1);ctx.globalAlpha=1;return;}
  shadowAt(x+7,y+14,6);
  const leg=Math.sin(e.anim/3)*1.4;ctx.fillStyle='#4a2c5c';
  ctx.beginPath();ctx.ellipse(x+3.5,y+13+leg*.3,2.4,1.5,0,0,7);ctx.ellipse(x+10.5,y+13-leg*.3,2.4,1.5,0,0,7);ctx.fill();
  blob(x,y+1+Math.abs(leg)*.3,14,12,'#a060c0');
  eye(x+4.5,y+6,1.9,d);eye(x+9.5,y+6,1.9,d);
  ctx.strokeStyle='#4a2c5c';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+3,y+2.6);ctx.lineTo(x+6,y+3.6);ctx.moveTo(x+11,y+2.6);ctx.lineTo(x+8,y+3.6);ctx.stroke();
}
function drawHopper(e){
  const x=e.x-camX,y=e.y,sq=e.grounded?.4:-.6;
  if(e.dead>0){ctx.globalAlpha=1-e.dead/30;blob(x,y+9,14,5,'#e0832a',1);ctx.globalAlpha=1;return;}
  shadowAt(x+7,y+14+(e.grounded?0:2),5);
  ctx.fillStyle='#5a2e0c';ctx.beginPath();ctx.ellipse(x+3.5,y+13,2,1.4,0,0,7);ctx.ellipse(x+10.5,y+13,2,1.4,0,0,7);ctx.fill();
  blob(x,y,14,12,'#f08a2a',sq);
  ctx.fillStyle='#ffd0a0';[[3.5,2.6],[10,2]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx,y+dy+1,1.2,0,7);ctx.fill();});
  eye(x+4.8,y+6.5,1.8,Math.sign(e.vx));eye(x+9.4,y+6.5,1.8,Math.sign(e.vx));
}
function drawBat(e){
  const x=e.x-camX+7,y=e.y+6,f=Math.sin(e.anim*.5);
  if(e.dead>0){ctx.globalAlpha=1-e.dead/30;}
  ctx.fillStyle=lin(ctx,y-6,y+6,['#a894e0','#6a52a8']);
  for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(x+s*3,y);ctx.quadraticCurveTo(x+s*10,y-6-f*4,x+s*13,y-1-f*3);ctx.quadraticCurveTo(x+s*10,y+1,x+s*9,y+4-f);ctx.quadraticCurveTo(x+s*6,y+2,x+s*3,y+4);ctx.fill();}
  blob(x-5.5,y-5,11,11,'#6a4a9a');
  ctx.fillStyle='#6a4a9a';ctx.beginPath();ctx.moveTo(x-4,y-3);ctx.lineTo(x-3,y-7.5);ctx.lineTo(x-1,y-4);ctx.moveTo(x+4,y-3);ctx.lineTo(x+3,y-7.5);ctx.lineTo(x+1,y-4);ctx.fill();
  ctx.fillStyle='#ffec27';ctx.beginPath();ctx.ellipse(x-2,y-.5,1.3,1.5,0,0,7);ctx.ellipse(x+2,y-.5,1.3,1.5,0,0,7);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(x-1.5,y+2.6);ctx.lineTo(x-.8,y+4.2);ctx.lineTo(x-.1,y+2.6);ctx.moveTo(x+1.5,y+2.6);ctx.lineTo(x+.8,y+4.2);ctx.lineTo(x+.1,y+2.6);ctx.fill();
  ctx.globalAlpha=1;
}
function drawSpiky(e){
  const x=e.x-camX,y=e.y,d=Math.sign(e.vx)||-1;
  if(e.dead>0){ctx.globalAlpha=1-e.dead/30;blob(x,y+9,14,5,'#c0392b',1);ctx.globalAlpha=1;return;}
  shadowAt(x+7,y+14,6);
  const leg=Math.sin(e.anim/3)*1.2;ctx.fillStyle='#5c1a14';
  ctx.beginPath();ctx.ellipse(x+3,y+13.4+leg*.3,2.2,1.4,0,0,7);ctx.ellipse(x+11,y+13.4-leg*.3,2.2,1.4,0,0,7);ctx.fill();
  for(let j=0;j<4;j++){const sx=x+1.5+j*3.6,g=ctx.createLinearGradient(sx,0,sx+3,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#9aa0b8');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(sx,y+4);ctx.lineTo(sx+1.6,y-2.5-(j%2));ctx.lineTo(sx+3.4,y+4);ctx.fill();}
  blob(x,y+2,14,11,'#d8402e');
  eye(x+4.5,y+7.5,1.7,d);eye(x+9.5,y+7.5,1.7,d);
  ctx.strokeStyle='#5c1a14';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x+2.6,y+4.6);ctx.lineTo(x+6,y+5.8);ctx.moveTo(x+11.4,y+4.6);ctx.lineTo(x+8,y+5.8);ctx.stroke();
}
function drawLumo(p){
  if(p.inv>0&&Math.floor(p.inv/4)%2===0)return;
  const big=p.big,w=big?16:14,h=big?26:15,x=p.x-2-camX+w/2,yb=p.y+p.h;
  const air=!p.grounded,stretch=air?Math.max(-.12,Math.min(.14,-p.vy*.03)):0,sx=1-stretch,sy=1+stretch;
  if(p.grounded)shadowAt(x,yb,6);
  if(p.star>0)glow(x,yb-h/2,22,Math.floor(frameNo/4)%2?'#fff27a':'#ff9cc7',.75);
  ctx.save();ctx.translate(x,yb);ctx.scale(p.face*sx,sy);
  const step=p.grounded&&p.vx?Math.sin(frameNo/3)*1.6:0;
  // Füße
  ctx.fillStyle='#2b4a6a';ctx.beginPath();ctx.ellipse(-3.4,-1.4+(step>0?-step*.4:0),3,1.8,0,0,7);ctx.ellipse(3.4,-1.4+(step<0?step*.4:0),3,1.8,0,0,7);ctx.fill();
  // Körper: Wolkenwesen
  const bh=h-2,col=p.star>0&&Math.floor(frameNo/3)%2?'#7fe8d8':'#2ec4b0';
  ctx.fillStyle=lin(ctx,-bh-2,0,['#8ef0de',col,shade('#2ec4b0',-.3)]);
  ctx.beginPath();ctx.ellipse(0,-bh/2-1.5,w/2,bh/2,0,0,7);ctx.fill();
  ctx.beginPath();ctx.arc(-3,-bh-.5,3.4,0,7);ctx.arc(1.5,-bh-1.5,3.8,0,7);ctx.arc(4.5,-bh+1,2.6,0,7);ctx.fill();
  // Gesicht
  const fy=-bh*.62-1.5;
  ctx.fillStyle='#ffe9c8';ctx.beginPath();ctx.ellipse(1.4,fy,5,4.2,0,0,7);ctx.fill();
  const blink=Math.floor(frameNo/4)%60===0;
  eye(0,fy-.6,1.5,1,blink);eye(3.6,fy-.6,1.5,1,blink);
  ctx.fillStyle='rgba(255,120,150,.55)';ctx.beginPath();ctx.ellipse(-2,fy+1.8,1.3,.8,0,0,7);ctx.ellipse(5.4,fy+1.8,1.3,.8,0,0,7);ctx.fill();
  ctx.strokeStyle='#7a3a3a';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(1.8,fy+1.4,1.1,.2,Math.PI-.2);ctx.stroke();
  // Schal mit flatterndem Ende
  const sy0=fy+4.6,wave=Math.sin(frameNo/5)*1.2;
  ctx.fillStyle=lin(ctx,sy0-1.5,sy0+1.5,['#ffd07a','#ff9a3a']);rr(ctx,-w/2+.6,sy0-1.5,w-1.2,3,1.5);ctx.fill();
  ctx.beginPath();ctx.moveTo(-w/2+2,sy0);ctx.quadraticCurveTo(-w/2-3,sy0+1+wave,-w/2-5-Math.abs(p.vx),sy0+2+wave*1.5);ctx.lineTo(-w/2-4-Math.abs(p.vx),sy0+4+wave);ctx.quadraticCurveTo(-w/2-1,sy0+3,-w/2+3,sy0+1.5);ctx.fill();
  if(big){ctx.fillStyle='rgba(255,255,255,.85)';starPath(1.5,-bh*.25-1,2.6,1.1);ctx.fill();}
  ctx.restore();
}
function drawEntities(){
  drawMovers();
  for(const q of pickups){if(q.kind==='coin')drawCoin(q);else if(q.kind==='star')drawStar(q);else if(q.kind==='heart')drawHeart(q);else drawShroom(q);}
  for(const e of enemies){
    if(e.dead>=30)continue;
    if(e.kind==='H')drawHopper(e);else if(e.kind==='V')drawBat(e);else if(e.kind==='S')drawSpiky(e);else drawKrabbler(e);
  }
  if(state!=='gameover')drawLumo(player);
}
function drawFx(){
  for(const q of particles){ctx.globalAlpha=Math.min(1,q.life/18);ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x-camX,q.y,1.1+q.life/30,0,7);ctx.fill();}
  ctx.globalAlpha=1;
  for(const q of popups){ctx.globalAlpha=Math.min(1,q.life/20);text(q.text,q.x-camX+6,q.y,'#fff6c8',8,'center');}
  ctx.globalAlpha=1;
}
function pill(x,y,w,h){rr(ctx,x,y,w,h,h/2);ctx.fillStyle='rgba(30,26,64,.55)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=.6;ctx.stroke();}
function drawHUD(){
  pill(5,5,40,13);text('♥ '+lives,25,14.6,'#ffb0c8',8.5,'center');
  pill(49,5,40,13);text('● '+pad(coins,2),69,14.6,'#ffd77a',8.5,'center');
  pill(93,5,52,13);text(pad(score),119,14.6,'#ffffff',8.5,'center');
  if(player&&player.star>0){pill(149,5,30,13);text('★'+Math.ceil(player.star/60),164,14.6,'#fff27a',8.5,'center');}
  const left=Math.ceil(Math.max(0,timeLeft));
  pill(W/2-34,H-19,68,13);text('⏱ '+pad(left,3),W/2,H-9.4,left<60?'#ff9aa8':'#ffffff',8.5,'center');
  text(stage.name+' · '+stage.title,W/2,30,'rgba(255,248,238,.85)',7,'center',800);
}
function drawVignette(){const g=ctx.createRadialGradient(W/2,H*.55,H*.45,W/2,H*.55,W*.75);g.addColorStop(0,'rgba(10,6,40,0)');g.addColorStop(1,'rgba(10,6,40,.38)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
function menuRect(i){return{x:W/2-62,y:126+i*22,w:124,h:18};}
function drawTitle(){
  camX=0;drawSky(0,frameNo*.6,frameNo);
  // Bodeninsel mit Gras
  const gy=H-40;ctx.fillStyle=lin(ctx,gy,H,['#c8703a','#7a3a1a']);ctx.beginPath();ctx.moveTo(0,gy+4);ctx.quadraticCurveTo(W/2,gy-8,W,gy+4);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
  ctx.fillStyle=lin(ctx,gy-6,gy+8,['#8ff08a','#3cbc3c']);ctx.beginPath();ctx.moveTo(0,gy+4);ctx.quadraticCurveTo(W/2,gy-8,W,gy+4);ctx.lineTo(W,gy+9);ctx.quadraticCurveTo(W/2,gy-1,0,gy+9);ctx.fill();
  // Logo
  const ly=58+Math.sin(frameNo/30)*1.5;
  ctx.font='900 50px '+FONT;ctx.textAlign='center';ctx.lineJoin='round';
  ctx.lineWidth=9;ctx.strokeStyle='#1b1840';ctx.strokeText('LUMO',W/2,ly+2);
  ctx.lineWidth=5;ctx.strokeStyle='#ffffff';ctx.strokeText('LUMO',W/2,ly);
  ctx.fillStyle=lin(ctx,ly-40,ly,['#fff7a0','#ffd77a','#ff9cc7']);ctx.fillText('LUMO',W/2,ly);
  ctx.textAlign='left';
  pill(W/2-58,ly+7,116,14);text('W O L K E N P F A D',W/2,ly+17.2,'#ffffff',8.5,'center');
  text('ein Minispiel aus Pufi & der Farbwind',W/2,ly+32,'#fff8ee',6.8,'center',800);
  const bob=Math.sin(frameNo/14)*2;
  drawLumo({...player,x:W/2-6,y:gy-14+bob-2,face:1,grounded:bob>1.6,vx:0,vy:-bob*.4,big:false,inv:0,star:0});
  // Freund Pufi winkt am Rand
  const px=W/2+44,py=gy-4;shadowAt(px,py+2,7);blob(px-8,py-15,16,15,'#ff9cc7');eye(px-2.5,py-9,1.6,-1);eye(px+2.5,py-9,1.6,-1);
  ctx.fillStyle='#ffd77a';ctx.beginPath();ctx.ellipse(px,py-5.6,2.4,1.4,0,0,7);ctx.fill();
  ctx.fillStyle='#ff9cc7';ctx.save();ctx.translate(px+8,py-8);ctx.rotate(-.6+Math.sin(frameNo/6)*.5);ctx.beginPath();ctx.ellipse(0,-3,1.8,3.6,0,0,7);ctx.fill();ctx.restore();
  const items=menuItems();
  items.forEach((label,i)=>{const m=menuRect(i),sel=i===menuSel;
    rr(ctx,m.x,m.y,m.w,m.h,9);
    ctx.fillStyle=sel?lin(ctx,m.y,m.y+m.h,['#ffe29a','#ff9cc7']):'rgba(30,26,64,.55)';ctx.fill();
    ctx.strokeStyle=sel?'#ffffff':'rgba(255,255,255,.35)';ctx.lineWidth=sel?1.2:.6;ctx.stroke();
    if(sel)glow(m.x+m.w/2,m.y+m.h/2,70,'#ff9cc7',.25);
    ctx.font='900 9px '+FONT;ctx.textAlign='center';ctx.fillStyle=sel?'#4a2550':'#fff8ee';ctx.fillText(label,W/2,m.y+12.4);ctx.textAlign='left';});
  text('BESTWERT '+pad(saved.hiscore),W/2,H-22,'#ffd77a',8,'center');
  text(IS_TOUCH?'◀ ▶ laufen · A springen':'← → laufen · Leertaste/A springen · P Pause',W/2,ly+44,'rgba(255,248,238,.9)',6.5,'center',800);
  ctx.globalAlpha=.6+.4*Math.sin(frameNo/12);text(IS_TOUCH?'TIPPE ZUM STARTEN':'ENTER · A · KLICK',W/2,H-9,'#ffffff',7,'center',800);ctx.globalAlpha=1;
  drawVignette();
}
const IS_TOUCH=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;
function menuItems(){return saved.reached>0?['NEUES SPIEL','WEITER ('+STAGES[saved.reached].name+')','← ZURÜCK ZU PUFI']:['NEUES SPIEL','← ZURÜCK ZU PUFI'];}
function drawOverlay(title,lines,color){
  ctx.fillStyle='rgba(20,16,56,.55)';ctx.fillRect(0,0,W,H);
  const bw=Math.min(W-30,230),bh=46+lines.length*14,bx=W/2-bw/2,by=H/2-bh/2-6;
  rr(ctx,bx,by,bw,bh,14);ctx.fillStyle=lin(ctx,by,by+bh,['rgba(80,70,150,.9)','rgba(30,26,64,.92)']);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=.8;ctx.stroke();
  text(title,W/2,by+28,color,16,'center');
  lines.forEach((l,i)=>text(l,W/2,by+46+i*14,'#fff8ee',8,'center',800));
}
function draw(){
  ctx.setTransform(SCALE,0,0,SCALE,0,0);ctx.imageSmoothingEnabled=true;
  if(state==='title'){drawTitle();return;}
  drawBackground();drawTiles();drawEntities();drawFx();drawVignette();
  if(state==='intro'){drawHUD();drawOverlay('Welt '+stage.name,[stage.title,'Lumo × '+lives],'#ffd77a');return;}
  if(state==='play'||state==='dying'||state==='clear'||state==='paused'){drawHUD();}
  if(state==='paused')drawOverlay('Pause',['P, Enter oder Start zum Weiterspielen'],'#ffffff');
  if(state==='clear')drawOverlay('Geschafft!',['Welt '+stage.name+' · Zeitbonus '+pad(Math.floor(timeLeft)*50)],'#ffd77a');
  if(state==='gameover')drawOverlay('Game Over',['Punkte '+pad(score),'Bestwert '+pad(saved.hiscore),'Enter zum Neustart'],'#ff9aa8');
  if(state==='credits')drawOverlay('Ende',['Lumo hat den Wolkenpfad gemeistert!','Punkte '+pad(score),'Enter für den Titel'],'#ffd77a');
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
  if(label.startsWith('←')){toPufi();return;}
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
  if(state!=='play'&&state!=='paused')frameNo++; // Animationen laufen auch im Titel und in Zwischenbildern
  switch(state){
    case'title':{
      if(takePress('down')){menuSel=(menuSel+1)%menuItems().length;}
      if(takePress('up')){menuSel=(menuSel+menuItems().length-1)%menuItems().length;}
      if(takePress('back')){toPufi();break;}
      if(takePress('pause')||takePress('start')||takePress('jump'))activateMenu();
      break;}
    case'intro':{
      if(stateT>=120){state='play';stateT=0;setPanel(false);}
      break;}
    case'play':{
      if(takePress('pause')){pauseGame();break;}
      frameNo++;
      timeLeft-=1/60;
      if(timeLeft<=0){if(stage.bonus)startClear();else die('Zeit abgelaufen');break;}
      updateMovers();
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
function refreshSound(){const on=!Audio.isMuted();soundBtn.textContent=on?'♫':'🔇';soundBtn.setAttribute('aria-pressed',String(on));}
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
resize();
loadSave();
loadStage(0);
state='title';
setStatus(saved.reached>0?'Fortschritt gefunden – „WEITER“ setzt bei der letzten Welt fort.':'Dein Fortschritt wird automatisch lokal gespeichert.');
message.innerHTML='← → laufen · Leertaste / ↑ / W / A springen · P oder Esc Pause<br>Pilze machen Lumo groß und schützen einmal. Tritt auf Krabbler, sammle Münzen und erreiche die Fahnenstange.';
function toPufi(){location.href='../';}
setPanel(true);
requestAnimationFrame(frame);
