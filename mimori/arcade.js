/* Mimori Spielhalle – five playable, original mini games. Self-contained, mobile-first. */
(function(root){
'use strict';
const GAMES=[
 {id:'catch',name:'Beerensturm',icon:'🍓',sub:'Fange Früchte, weiche Bomben aus!',theme:'berry',length:34},
 {id:'memory',name:'Zauber-Memory',icon:'🃏',sub:'Finde 6 Paare gegen die Uhr!',theme:'memory',length:50},
 {id:'rhythm',name:'Beat-Party',icon:'🎵',sub:'Triff die Noten im richtigen Moment!',theme:'rhythm',length:32},
 {id:'runner',name:'Wolken-Sprint',icon:'☁️',sub:'Spring über Hindernisse, sammle Sterne!',theme:'runner',length:34},
 {id:'bubbles',name:'Blasenlabor',icon:'🫧',sub:'Ploppe Blasen – meide den roten Schleim!',theme:'bubbles',length:30}
];
const W=360,H=420;
const rand=(lo,hi)=>lo+Math.random()*(hi-lo);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const circleHit=(x,y,c)=>Math.hypot(c.x-x,c.y-y)<=c.r;
const ease=(a,b,t)=>a+(b-a)*t;
const api={};
let rootEl,canvas,ctx,display,title,line,bar,game,raf,last=0,session=null,visible=false,listener=null,timerText,help,keyHeld={};
function node(tag,cls,text){
 const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;
}
function init(){
 if(rootEl)return;
 rootEl=node('div','arcadeShell');rootEl.id='arcadeShell';rootEl.hidden=true;
 rootEl.innerHTML=
  '<section class="arcadePanel" role="dialog" aria-modal="true" aria-label="Mimori Spielhalle">'+
  '<header class="arcadeTop"><div><small>✦ MIMORI ARCADE ✦</small><h2 id="arcadeTitle">Spielhalle</h2></div>'+
  '<button class="arcadeClose" id="arcadeExit" aria-label="Spielhalle schließen">✕</button></header>'+
  '<div id="arcadeLobby" class="arcadeLobby"></div>'+
  '<div id="arcadePlay" hidden><div class="arcadeHud"><strong id="arcadeScore">⭐ 0</strong>'+
  '<strong id="arcadeTimer">⏱ 30s</strong><strong id="arcadeLives">❤ 3</strong></div>'+
  '<div class="arcadeBar"><span id="arcadeProgress"></span></div>'+
  '<p class="arcadeHint" id="arcadeHint"></p>'+
  '<div class="arcadeScreen"><canvas id="arcadeCanvas" width="360" height="420"></canvas>'+
  '<div id="arcadeMemory" hidden></div><div id="arcadeLaneButtons" hidden></div>'+
  '<div id="arcadeResult" hidden></div></div>'+
  '<div class="arcadeControls"><button id="arcadeBack">← Spielauswahl</button>'+
  '<button id="arcadeAction" hidden>SPRINGEN ↑</button></div></div>'+
  '</section>';
 document.body.appendChild(rootEl);
 canvas=rootEl.querySelector('#arcadeCanvas');ctx=canvas.getContext('2d');
 display=rootEl.querySelector('#arcadeLobby');title=rootEl.querySelector('#arcadeTitle');
 line=rootEl.querySelector('#arcadeHint');bar=rootEl.querySelector('#arcadeProgress');
 timerText=rootEl.querySelector('#arcadeTimer');
 rootEl.querySelector('#arcadeExit').addEventListener('click',close);
 rootEl.querySelector('#arcadeBack').addEventListener('click',lobby);
 rootEl.querySelector('#arcadeAction').addEventListener('click',()=>{if(game?.jump)game.jump()});
 canvas.addEventListener('pointerdown',e=>{
  if(!game||!visible)return;
  e.preventDefault();const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
  if(game.press)game.press(x,y);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!game||!visible||!game.move)return;
  const r=canvas.getBoundingClientRect();game.move((e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height)
 });
 canvas.addEventListener('pointerup',()=>{if(game)game.pressing=false});
 canvas.addEventListener('pointercancel',()=>{if(game)game.pressing=false});
 rootEl.querySelector('#arcadeLaneButtons').addEventListener('pointerdown',e=>{
  const b=e.target.closest('[data-lane]');if(b&&game?.hitLane){e.preventDefault();game.hitLane(Number(b.dataset.lane))}
 });
 rootEl.querySelector('#arcadeMemory').addEventListener('click',e=>{
  const b=e.target.closest('[data-card]');if(b&&game?.flip)game.flip(Number(b.dataset.card))
 });
 listener=e=>{
  if(!visible)return;
  if(e.key==='Escape'){e.preventDefault();lobby();return}
  if(e.type==='keydown'&&(e.key===' '||e.key==='ArrowUp')){e.preventDefault();if(game?.jump)game.jump()}
  if(e.type==='keydown'&&game?.hitLane){const keys=['KeyD','KeyF','KeyJ','KeyK'];const i=keys.indexOf(e.code);if(i>=0&&!e.repeat)game.hitLane(i)}
  if(e.type==='keydown'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();keyHeld[e.key]=true}
  if(e.type==='keyup'&&(e.key==='ArrowLeft'||e.key==='ArrowRight'))keyHeld[e.key]=false;
 };
 document.addEventListener('keydown',listener);document.addEventListener('keyup',listener);
}
function sound(name){try{session?.sound?.(name)}catch(_){}}
function open(options={}){
 init();session=options;rootEl.hidden=false;document.body.classList.add('arcadeOpen');visible=true;lobby();
}
function close(){
 cleanup();visible=false;rootEl.hidden=true;document.body.classList.remove('arcadeOpen');
}
function cleanup(){
 if(raf)cancelAnimationFrame(raf);raf=null;last=0;
 if(game?.dispose)game.dispose();game=null;keyHeld={};
}
function lobby(){
 cleanup();if(!rootEl)return;
 rootEl.querySelector('#arcadePlay').hidden=true;display.hidden=false;title.textContent='Die Spielhalle';
 display.replaceChildren();
 const intro=node('div','arcadeIntro','Fünf Abenteuer warten! Spiele um Sterne, Rekorde und neue Belohnungen.');display.appendChild(intro);
 const cards=node('div','arcadeCards');display.appendChild(cards);
 for(const def of GAMES){
  const b=node('button','arcadeCard theme-'+def.theme);
  b.innerHTML='<span class="arcadeIllustration">'+def.icon+'</span><span class="arcadeCardText"><strong>'+def.name+'</strong><small>'+def.sub+'</small><em>🏆 Rekord: '+Math.max(0,Number(session?.records?.()[def.id]||0))+'</em></span><span class="arcadeArrow">›</span>';
  b.addEventListener('click',()=>start(def.id));cards.appendChild(b);
 }
}
function scoreText(){if(!game)return;rootEl.querySelector('#arcadeScore').textContent='⭐ '+Math.floor(game.score);
 rootEl.querySelector('#arcadeTimer').textContent='⏱ '+Math.ceil(Math.max(0,game.left))+'s';
 rootEl.querySelector('#arcadeLives').textContent=game.lives===null?'⚡ '+game.combo+' Combo':'❤ '+Math.max(0,game.lives);
 bar.style.width=clamp(100*(1-game.left/game.maxTime),0,100)+'%'}
function start(id){
 const def=GAMES.find(g=>g.id===id);if(!def)return;
 cleanup();display.hidden=true;rootEl.querySelector('#arcadePlay').hidden=false;
 rootEl.querySelector('#arcadeMemory').hidden=true;rootEl.querySelector('#arcadeLaneButtons').hidden=true;
 rootEl.querySelector('#arcadeResult').hidden=true;canvas.hidden=false;
 rootEl.querySelector('#arcadeAction').hidden=id!=='runner';
 title.textContent=def.icon+' '+def.name;line.textContent=def.sub;
 game=({catch:createCatch,memory:createMemory,rhythm:createRhythm,runner:createRunner,bubbles:createBubbles})[id]();
 game.id=id;game.maxTime=def.length;game.left=def.length;game.score=0;game.ended=false;
 scoreText();last=0;raf=requestAnimationFrame(frame);
}
function finish(won,label){
 const g=game;if(!g||g.ended)return;g.ended=true;
 if(raf)cancelAnimationFrame(raf);raf=null;
 let rewards={coins:0,xp:0,record:g.score};
 try{rewards=session?.onReward?.(g.id,Math.floor(g.score),!!won)||rewards}catch(_){}
 sound(won?'minigame':'error');
 const result=rootEl.querySelector('#arcadeResult');result.hidden=false;
 const over=node('div','arcadeResultCard');
 over.innerHTML='<div class="arcadeWinIcon">'+(won?'🏆':'🌈')+'</div><h3>'+(won?'Super gespielt!':'Runde beendet!')+'</h3>'+
 '<p>'+label+'</p><p class="arcadeFinalScore">⭐ '+Math.floor(g.score)+' Punkte</p>'+
 '<p>🪙 +'+Math.max(0,rewards.coins||0)+' Sterne · ✨ +'+Math.max(0,rewards.xp||0)+' XP</p>';
 const again=node('button','arcadeAgain','↻ Nochmal spielen');again.addEventListener('click',()=>start(g.id));
 const back=node('button','arcadeBackBtn','Spielauswahl');back.addEventListener('click',lobby);
 over.append(again,back);result.replaceChildren(over);
}
function frame(now){
 if(!visible||!game||game.ended)return;
 if(!last)last=now;
 const dt=clamp((now-last)/1000,0,.042);last=now;
 if(document.hidden){raf=requestAnimationFrame(frame);return}
 game.left=Math.max(0,game.left-dt);
 if(game.step)game.step(dt);
 if(game.draw&&!game.ended)game.draw();
 scoreText();
 if(!game.ended&&game.left<=0)finish(!!game.won?.(),game.outcome?.()||'Zeit abgelaufen!');
 if(game&&!game.ended)raf=requestAnimationFrame(frame);
}
function bg(tone='#18264b'){
 ctx.clearRect(0,0,W,H);
 const gr=ctx.createLinearGradient(0,0,0,H);gr.addColorStop(0,tone);gr.addColorStop(1,'#0d1632');
 ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
 for(let i=0;i<24;i++){
  ctx.fillStyle='#ffffff14';const x=(i*117)%360,y=(i*73)%420;ctx.beginPath();ctx.arc(x,y,1+i%3,0,7);ctx.fill();
 }
}
function text(str,x,y,size=24,color='#fff',align='center'){
 ctx.font='900 '+size+'px system-ui';ctx.textAlign=align;ctx.fillStyle=color;
 ctx.shadowColor='#100a31';ctx.shadowBlur=6;ctx.fillText(str,x,y);ctx.shadowBlur=0;
}
function pill(x,y,w,h,c){
 ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(h/2,20));ctx.fill();
}
function createCatch(){
 const g={score:0,lives:3,combo:0,basket:180,fruit:[],spawn:.1,elapsed:0};
 g.move=x=>{g.basket=clamp(x,34,326)};
 g.press=x=>g.move(x);
 g.step=dt=>{
  g.elapsed+=dt;g.spawn-=dt;
  if(g.spawn<=0){g.spawn=rand(.24,.52)*Math.max(.54,1-g.elapsed/100);
   const bad=Math.random()<.25;
   g.fruit.push({x:rand(18,342),y:-22,vy:rand(132,210)+g.elapsed*2,r:bad?15:17,
    bad,kind:bad?'💣':Math.random()<.16?'🌟':'🍓'});}
  if(keyHeld.ArrowLeft)g.basket=clamp(g.basket-290*dt,34,326);
  if(keyHeld.ArrowRight)g.basket=clamp(g.basket+290*dt,34,326);
  for(let i=g.fruit.length-1;i>=0;i--){
   const f=g.fruit[i];f.y+=f.vy*dt;
   if(f.y>=366&&f.y<397&&Math.abs(f.x-g.basket)<44){
    if(f.bad){g.lives--;g.combo=0;g.score=Math.max(0,g.score-15);sound('error')}
    else{g.combo++;g.score+=(f.kind==='🌟'?35:15)+Math.min(g.combo,10);sound('star')}
    g.fruit.splice(i,1);continue;
   }
   if(f.y>450){if(!f.bad)g.combo=0;g.fruit.splice(i,1)}
  }
  if(g.lives<=0)finish(false,'Die Bomben waren schneller. Nächste Runde schaffst du!');
 };
 g.draw=()=>{
  bg('#314976');
  for(let j=0;j<4;j++){const x=j*115-20;ctx.fillStyle='#ffffff18';ctx.beginPath();ctx.arc(x+30,86+(j%2)*35,49,0,7);ctx.fill()}
  pill(0,398,W,22,'#384b70');text('🧺',g.basket,389,51);
  for(const f of g.fruit)text(f.kind,f.x,f.y+13,37);
  text('🍓 FANG DIE FRÜCHTE!',180,45,21,'#fff2ca');
  text('Bombe = -1 Leben',180,74,15,'#ecbfcd');
  if(g.combo>=3)text(g.combo+'x KOMBO!',180,117,23,'#ffe08a');
 };
 g.won=()=>g.score>=160&&g.lives>0;
 g.outcome=()=>g.won()?'Dein Korb ist voller Früchte!':'Sammle beim nächsten Mal noch mehr Beeren!';
 return g;
}
function createMemory(){
 const g={score:0,lives:null,combo:0,opened:[],matched:new Set(),locked:false,tries:0,timeout:null};
 const symbols=['🍓','🐉','💗','⭐','🦊','🫧'];
 g.cards=[...symbols,...symbols].map((s,i)=>({s,id:i})).sort(()=>Math.random()-.5);
 const board=rootEl.querySelector('#arcadeMemory');board.hidden=false;canvas.hidden=true;
 board.className='arcadeMemoryGrid';board.replaceChildren();
 const render=()=>{board.querySelectorAll('[data-card]').forEach((b,i)=>{
  const shown=g.opened.includes(i)||g.matched.has(i);
  b.textContent=shown?g.cards[i].s:'✦';b.classList.toggle('flipped',shown);
  b.classList.toggle('matched',g.matched.has(i));b.disabled=g.matched.has(i);
 })};
 for(let i=0;i<12;i++){const b=node('button','memoryCard','✦');b.dataset.card=i;b.setAttribute('aria-label','Karte '+(i+1));board.appendChild(b)}
 g.flip=i=>{
  if(g.ended||g.locked||g.matched.has(i)||g.opened.includes(i))return;
  g.opened.push(i);sound('star');render();
  if(g.opened.length===2){
   g.tries++;
   const [a,b]=g.opened;
   if(g.cards[a].s===g.cards[b].s){
    g.matched.add(a);g.matched.add(b);g.opened=[];g.combo++;g.score+=100+Math.max(0,12-g.tries)*4;
    sound('minigame');render();
    if(g.matched.size===12)finish(true,'Alle sechs Paare gefunden – großartig!');
   }else{
    g.combo=0;g.locked=true;
    g.timeout=setTimeout(()=>{g.opened=[];g.locked=false;render()},650);
   }
  }
 };
 g.draw=()=>{};g.step=()=>{};
 g.dispose=()=>{if(g.timeout)clearTimeout(g.timeout)};
 g.won=()=>g.matched.size===12;
 g.outcome=()=>'Du hast '+g.matched.size/2+' von 6 Paaren gefunden.';
 return g;
}
function createRhythm(){
 const g={score:0,lives:null,combo:0,miss:0,hits:0,index:0,elapsed:0,notes:[],beat:.46};
 const buttons=rootEl.querySelector('#arcadeLaneButtons');buttons.hidden=false;buttons.replaceChildren();
 const keys=['◆ D','● F','▲ J','★ K'];
 for(let i=0;i<4;i++){const b=node('button','arcadeLane lane-'+i,keys[i]);b.dataset.lane=i;buttons.appendChild(b)}
 const track=[];for(let i=0;i<64;i++)track.push({lane:(i*7+Math.floor(i/3))%4,time:1.4+i*.45,judged:false});
 g.notes=track;
 g.hitLane=lane=>{
  const candidates=g.notes.filter(n=>!n.judged&&n.lane===lane);
  const target=candidates.reduce((best,n)=>!best||Math.abs(n.time-g.elapsed)<Math.abs(best.time-g.elapsed)?n:best,null);
  if(target&&Math.abs(target.time-g.elapsed)<.23){
   target.judged=true;g.hits++;g.combo++;g.score+=Math.abs(target.time-g.elapsed)<.095?45:25;
   sound('star');
  }else{g.combo=0;sound('error')}
 };
 g.step=dt=>{
  g.elapsed+=dt;
  for(const n of g.notes){
   if(!n.judged&&n.time<g.elapsed-.25){n.judged=true;g.miss++;g.combo=0}
  }
 };
 g.draw=()=>{
  bg('#26183e');
  const colors=['#fc8cab','#9eddd4','#f1d58c','#afa6ff'];
  for(let i=0;i<4;i++){
   const x=i*90;ctx.fillStyle=i%2?'#ffffff0b':'#0000001e';ctx.fillRect(x,0,90,420);
   pill(x+7,325,76,6,colors[i]);pill(x+17,350,55,12,colors[i]+'99');
  }
  for(const note of g.notes){if(note.judged)continue;
   const y=332-(note.time-g.elapsed)*260;
   if(y< -40||y>390)continue;
   const x=note.lane*90+45;
   ctx.fillStyle=colors[note.lane];ctx.shadowColor=colors[note.lane];ctx.shadowBlur=19;
   ctx.beginPath();ctx.arc(x,y,25,0,7);ctx.fill();ctx.shadowBlur=0;
   text(['◆','●','▲','★'][note.lane],x,y+9,24,'#1c1938');
  }
  text('♪ BEAT-PARTY ♪',180,40,23,'#ffdfbd');
  if(g.combo>2)text('🔥 '+g.combo+' KOMBO',180,93,21,'#f5e3a9');
  text('Treffer: '+g.hits+'  ·  Verpasst: '+g.miss,180,402,15);
 };
 g.won=()=>g.hits>=27;
 g.outcome=()=>'Du hast '+g.hits+' von '+g.notes.length+' Beats getroffen.';
 return g;
}
function createRunner(){
 const g={score:0,lives:3,combo:0,distance:0,vy:0,py:342,onGround:true,obstacles:[],spawn:1,inv:0};
 g.jump=()=>{if(g.onGround){g.vy=-585;g.onGround=false;sound('play')}};
 g.press=()=>g.jump();
 g.step=dt=>{
  g.distance+=dt*110;g.score+=dt*5;g.inv=Math.max(0,g.inv-dt);
  g.vy+=1400*dt;g.py+=g.vy*dt;
  if(g.py>=342){g.py=342;g.vy=0;g.onGround=true}
  g.spawn-=dt;
  if(g.spawn<=0){
   g.spawn=rand(.70,1.25);const star=Math.random()<.35;
   g.obstacles.push({x:390,y:star?rand(243,304):348,w:star?22:30,h:star?22:36,star,used:false});
  }
  for(let i=g.obstacles.length-1;i>=0;i--){
   const o=g.obstacles[i];o.x-=dt*(204+g.distance*.015);
   if(!o.used&&o.x<128&&o.x+o.w>83&&g.py<o.y+o.h&&g.py+35>o.y){
    o.used=true;if(o.star){g.score+=55;g.combo++;sound('star')}
    else if(!g.inv){g.lives--;g.combo=0;g.inv=1.0;sound('error')}
   }
   if(o.x< -40)g.obstacles.splice(i,1);
  }
  if(g.lives<=0)finish(false,'Du bist über zu viele Hindernisse gestolpert.');
 };
 g.draw=()=>{
  bg('#23516c');
  for(let i=0;i<8;i++){
   const x=((i*130-g.distance*.35)%520+520)%520-80;
   ctx.fillStyle='#d0eff3a6';ctx.beginPath();ctx.ellipse(x,110+i%3*58,59,18,0,0,7);ctx.fill();
  }
  pill(0,382,360,38,'#365a70');
  for(let i=0;i<10;i++)pill(((i*49-g.distance)%500+500)%500-49,397,29,4,'#98c8bc');
  for(const o of g.obstacles)text(o.star?'⭐':'🌵',o.x+15,o.y+24,o.star?28:43);
  ctx.globalAlpha=g.inv>0&&Math.floor(g.inv*14)%2===0?.35:1;text('🐾',106,g.py+22,48);ctx.globalAlpha=1;
  text('WOLKEN-SPRINT',180,50,24,'#fff0c6');
  text('↑ Tippen = Springen',180,79,16,'#daeee7');
 };
 g.won=()=>g.lives>0&&g.score>=150;
 g.outcome=()=>'Du bist '+Math.floor(g.distance)+' Wolkenmeter gelaufen!';
 return g;
}
function createBubbles(){
 const g={score:0,lives:3,combo:0,bubbles:[],spawn:0,clean:0};
 g.press=(x,y)=>{
  for(let i=g.bubbles.length-1;i>=0;i--){
   const b=g.bubbles[i];if(circleHit(x,y,b)){
    g.bubbles.splice(i,1);
    if(b.bad){g.lives--;g.combo=0;sound('error')}
    else{g.combo++;g.clean++;g.score+=20+Math.min(g.combo,8)*3;sound('wash')}
    break;
   }
  }
 };
 g.step=dt=>{
  g.spawn-=dt;
  if(g.spawn<=0){g.spawn=rand(.15,.32);
   const bad=Math.random()<.18,r=rand(16,31);
   g.bubbles.push({x:rand(r+10,W-r-10),y:450,r,bad,vy:rand(43,105),phase:rand(0,6)});
  }
  for(let i=g.bubbles.length-1;i>=0;i--){
   const b=g.bubbles[i];b.y-=b.vy*dt;b.x+=Math.sin(b.phase+=dt*2)*dt*12;
   if(b.y<-45)g.bubbles.splice(i,1);
  }
  if(g.lives<=0)finish(false,'Der freche rote Schleim hat dich erwischt!');
 };
 g.draw=()=>{
  bg('#205776');
  for(let i=0;i<9;i++){ctx.strokeStyle='#b4f7ff1c';ctx.lineWidth=5;ctx.beginPath();
   ctx.arc(i*52-25,420-(i%3)*44,32,0,7);ctx.stroke()}
  for(const b of g.bubbles){
   const glow=ctx.createRadialGradient(b.x-8,b.y-8,2,b.x,b.y,b.r);
   glow.addColorStop(0,b.bad?'#ffe1d1':'#ffffffdd');glow.addColorStop(.55,b.bad?'#e04f7d':'#65d8ec88');glow.addColorStop(1,b.bad?'#7d2b62':'#9aaffd77');
   ctx.fillStyle=glow;ctx.strokeStyle=b.bad?'#ff97ad':'#deffffbb';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();ctx.stroke();
   if(b.bad)text('✕',b.x,b.y+8,27,'#fff');
  }
  text('BLASENLABOR',180,47,25,'#fff2d5');
  text('Plopp die hellen Blasen!',180,74,16,'#dbecfa');
  text('Saubere Blasen: '+g.clean,180,393,17,'#fcefc0');
 };
 g.won=()=>g.clean>=20&&g.lives>0;
 g.outcome=()=>'Du hast '+g.clean+' Blasen gereinigt!';
 return g;
}
api.open=open;api.close=close;api.start=start;api.games=GAMES.map(({id,name,icon})=>({id,name,icon}));
api.debug=()=>game?{id:game.id,score:game.score,left:game.left,lives:game.lives,ended:game.ended}:null;
root.MimoriArcade=api;
})(window);
