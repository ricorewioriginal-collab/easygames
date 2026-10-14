(()=>{
'use strict';
const C=document.getElementById('stage'),ctx=C.getContext('2d'),W=480,H=270,$=id=>document.getElementById(id);
const LEVELS=[
{name:'Blütenbucht',sky:['#81d9f1','#fff4c4'],hill:'#9fd7ae',soil:'#98725f',grass:'#8acf91',gap:80,boss:0},
{name:'Honigklippen',sky:['#ffc49b','#f8edc5'],hill:'#e4b085',soil:'#a37662',grass:'#ecd07e',gap:90,boss:0},
{name:'Pilzlichtwald',sky:['#c4b3e6','#ead1eb'],hill:'#8e98c2',soil:'#765d82',grass:'#afd28d',gap:98,boss:4},
{name:'Federwolken',sky:['#90d7ee','#fff3e5'],hill:'#a3c8e4',soil:'#8d98ba',grass:'#d2f1dc',gap:105,boss:0},
{name:'Kreidegrotten',sky:['#959ed4','#e4e2f8'],hill:'#8998c2',soil:'#5b6489',grass:'#b9d7cc',gap:102,boss:0},
{name:'Farbwind-Finale',sky:['#e4a4cc','#fbedc8'],hill:'#b28fca',soil:'#80638c',grass:'#e4b4cb',gap:110,boss:7}
];
const KEY='easygames.pufi-farbwind.v1',input={left:false,right:false,jump:false,throw:false,grab:false,down:false};
let save={unlocked:1,records:{},sound:true};
try{const x=JSON.parse(localStorage.getItem(KEY));if(x){save.unlocked=Math.min(6,Math.max(1,+x.unlocked||1));save.records=x.records||{};save.sound=x.sound!==false}}catch(_){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(save))}catch(_){}};
let level=0,selected=0,mode='title',world=null,hero=null,cam=0,t=0,aim=0,particles=[],audio=null,frameN=0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function tone(f=440,d=.1){if(!save.sound)return;try{const X=window.AudioContext||window.webkitAudioContext;if(!X)return;audio=audio||new X();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(80,f*.68),audio.currentTime+d);v.gain.setValueAtTime(.06,audio.currentTime);v.gain.exponentialRampToValueAtTime(.0005,audio.currentTime+d);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+d+.01)}catch(_){}}
function splash(x,y,color,n=12){for(let i=0;i<n;i++){const a=i*2.4;particles.push({x,y,vx:Math.cos(a)*(40+i%5*23),vy:Math.sin(a)*(40+i%5*23)-65,life:.35+i%5*.12,color})}if(particles.length>200)particles.splice(0,particles.length-200)}
function build(n){
level=n;let segments=[],ledges=[],gems=[],enemies=[],pods=[],springs=[],switches=[],x=0;
for(let i=0;i<5;i++){
const w=(!i?560:500)+(i%2)*85, y=222-((i+n)%3===2?7:0);
segments.push({x,y,w,h:220});
for(let j=0;j<4;j++){let cx=x+90+j*105;if(cx<x+w-40)gems.push({x:cx,y:y-39-j%2*24,kind:'drop',got:false})}
if(i){for(let j=0;j<2;j++){let xx=x+75+j*150;ledges.push({x:xx,y:y-75-(j%2)*25,w:72,h:12,one:true});gems.push({x:xx+30,y:y-107-j%2*25,kind:j===0?'flower':'drop',got:false})}
enemies.push({x:x+175,y:y-22,base:y-22,w:23,h:22,v:30+n*4,min:x+110,max:x+w-70,kind:(i+n)%3,alive:true,phase:i});
enemies.push({x:x+w-130,y:y-22,base:y-22,w:23,h:22,v:-39,min:x+w-180,max:x+w-50,kind:(i+n+1)%3,alive:true,phase:i*1.4})}
pods.push({x:x+Math.min(w-95,265),y:y-19,used:false});
springs.push({x:x+w-74,y:y-12,w:35,h:12});
if(i===3){switches.push({x:x+165,y:y-95,w:19,h:22,on:false});gems.push({x:x+198,y:y-145,kind:'secret',got:false})}
if(i<4)x+=w+LEVELS[n].gap;
}
for(let i=0;i<4;i++){const a=segments[i],b=segments[i+1],start=a.x+a.w;
ledges.push({x:start-30,y:a.y-62,w:62,h:11,one:true},{x:b.x-34,y:b.y-78,w:66,h:11,one:true});
for(let j=1;j<4;j++)gems.push({x:start+(b.x-start)*j/4,y:a.y-115-Math.sin(j*Math.PI/4)*11,kind:'drop',got:false})}
gems.push({x:440,y:93,kind:'flower',got:false});
const goal=segments.at(-1).x+segments.at(-1).w-48,boss=LEVELS[n].boss?{x:goal-335,y:148,w:66,h:65,hp:LEVELS[n].boss,max:LEVELS[n].boss,phase:0,cool:1.9}:null;
world={segments,ledges,gems,enemies,pods,springs,switches,bullets:[],hazards:[],goal,boss,score:0,flowers:0};
hero={x:38,y:165,w:23,h:30,vx:0,vy:0,ground:false,coyote:0,jumpBuffer:0,hover:1.5,face:1,hp:3,inv:1,ammo:4,dive:false,grabCd:0,mounted:true,pet:{x:0,y:165},rideCd:0};
hero.pet.x=hero.x-40;hero.pet.y=hero.y;cam=t=aim=0;frameN=0;particles=[];Object.keys(input).forEach(k=>input[k]=false);hud();
}
function hud(){if(!hero||!world)return;$('where').textContent=(level+1)+'/6 · '+LEVELS[level].name;$('hearts').textContent='♥'.repeat(hero.hp)+'♡'.repeat(3-hero.hp);$('ammo').textContent='● '+hero.ammo+'/6';$('flowers').textContent='❀ '+world.flowers;$('score').textContent='✦ '+world.score;$('mountStatus').textContent=hero.mounted?'🐾 TAMO AN BORD':'🐾 R: TAMO RUFEN'}
function overlay(type,title,description,primary,secondary){
mode=type;$('overlay').hidden=false;$('overlay').dataset.view=type;
$('heading').textContent=title;$('description').textContent=description;$('primary').textContent=primary;
$('secondary').hidden=!secondary;if(secondary)$('secondary').textContent=secondary;
$('stageList').hidden=type!=='map';if(type==='map')renderMap();$('touch').hidden=true;hud();
}
function title(){overlay('title','PUFI & DER FARBWIND','Pufi und sein Wolkentaps Tamo retten sechs bunte Inseln! Reite, springe, schwebe und wirf Farbkugeln in einem eigenständigen Retro-Abenteuer.','START GAME ▶','INSELKARTE')}
function renderMap(){const list=$('stageList');list.replaceChildren();LEVELS.forEach((l,i)=>{const b=document.createElement('button');b.className='island'+(selected===i?' picked':'');b.disabled=i>=save.unlocked;const r=save.records[i];b.textContent=(i<save.unlocked?'✦ ':'🔒 ')+(i+1)+'. '+l.name+(r?' · ❀ '+r.flowers:'');b.addEventListener('click',()=>{selected=i;renderMap();tone(650)});list.appendChild(b)})}
function openMap(){selected=Math.min(level,save.unlocked-1);overlay('map','DIE FARBWIND-INSELN','Wähle eine freigeschaltete Insel. Finde versteckte Farbblüten und sammle einen neuen Rekord.','INSEL SPIELEN ▶','ZUM TITEL')}
function start(n=level){build(n);mode='play';$('overlay').hidden=true;$('touch').hidden=false;tone(560);hud()}
function pause(){if(mode==='play')overlay('pause','PAUSE','Dein Abenteuer wartet. Drücke Weiter, sobald du bereit bist.','WEITERSPIELEN ▶','INSELKARTE')}
function resume(){mode='play';$('overlay').hidden=true;$('touch').hidden=false;Object.keys(input).forEach(k=>input[k]=false)}
function gameover(reason){if(mode!=='play')return;tone(130,.35);overlay('gameover','GAME OVER',reason+' Der gesamte Abschnitt startet wieder von vorne.','LEVEL NEU STARTEN ▶','INSELKARTE')}
function finished(){if(mode!=='play')return;const old=save.records[level]||{flowers:0,score:0};save.records[level]={flowers:Math.max(old.flowers,world.flowers),score:Math.max(old.score,world.score)};save.unlocked=Math.max(save.unlocked,Math.min(6,level+2));persist();tone(980,.38);splash(hero.x,hero.y,'#ffeab5',40);
if(level===5)overlay('win','FARBWIND GERETTET!','Alle sechs Inseln geschafft! Du kannst jetzt zurückkehren und nach Geheimnissen suchen.','ZUR INSELKARTE','NEUES ABENTEUER');
else overlay('clear','INSEL GESCHAFFT!','Du hast '+world.score+' Farbpunkte und '+world.flowers+' Farbblüten gefunden. Die nächste Insel wurde freigeschaltet.','NÄCHSTE INSEL ▶','INSELKARTE')}
$('primary').addEventListener('click',()=>{tone(600);if(mode==='title')start(0);else if(mode==='map')start(selected);else if(mode==='gameover')start(level);else if(mode==='pause')resume();else if(mode==='clear')start(level+1);else if(mode==='win')openMap()});
$('secondary').addEventListener('click',()=>{tone(540);if(mode==='map')title();else if(mode==='title'||mode==='pause'||mode==='clear'||mode==='gameover')openMap();else if(mode==='win')start(0)});
$('pause').addEventListener('click',()=>{if(mode==='play')pause();else if(mode==='pause')resume()});
$('sound').textContent=save.sound?'♪ AN':'♪ AUS';$('sound').addEventListener('click',()=>{save.sound=!save.sound;persist();$('sound').textContent=save.sound?'♪ AN':'♪ AUS';if(save.sound)tone(600)});
// Tamo is an original cloud-tapir companion: his broad padded feet and fins make
// riding faster and give one additional hit before Pufi loses a heart.
function toggleMount(){
if(mode!=='play'||!hero||hero.rideCd>0)return;
const p=hero;
if(p.mounted){
p.mounted=false;p.rideCd=.32;p.pet.x=p.x-33;p.pet.y=p.y;p.hover=Math.min(p.hover,1.0);
tone(370);splash(p.x,p.y+18,'#a9e7dc',7);
}else if(Math.hypot(p.pet.x-p.x,p.pet.y-p.y)<90){
p.mounted=true;p.rideCd=.32;p.hover=Math.max(p.hover,1.3);
tone(740);splash(p.x,p.y+18,'#fff3c0',10);
}
hud();
}
function absorb(){
if(!hero||mode!=='play'||hero.grabCd>0)return;hero.grabCd=.3;
let closest=null,best=hero.mounted?67:49;
for(const a of world.pods){if(!a.used){const d=Math.hypot(a.x-(hero.x+12),a.y-(hero.y+13));if(d<best){best=d;closest=a}}}
for(const a of world.enemies){if(a.alive){const d=Math.hypot(a.x-(hero.x+12),a.y-(hero.y+13));if(d<best){best=d;closest=a}}}
if(closest){if('alive'in closest)closest.alive=false;else closest.used=true;hero.ammo=Math.min(6,hero.ammo+2);world.score+=35;splash(closest.x,closest.y,'#d3ffb6');tone(670)}else tone(270,.05);
}
function throwPaint(){
if(mode!=='play'||hero.ammo<1)return;
hero.ammo--;const angle=aim>.3?clamp(.52+Math.sin(t*3.2)*.55,.04,1.12):.23;
world.bullets.push({x:hero.x+11+hero.face*(hero.mounted?22:13),y:hero.y+(hero.mounted?9:12),w:10,h:10,vx:hero.face*Math.cos(angle)*330,vy:-Math.sin(angle)*330,life:2.2,bounces:1});
aim=0;splash(hero.x+12,hero.y+9,'#ffe3ab',5);tone(480);
}
function action(key,on){
if(key==='pause'){if(on){if(mode==='play')pause();else if(mode==='pause')resume()}return}
if(mode!=='play')return;
if(key==='mount'){if(on)toggleMount();return}
if(key==='jump'&&on&&!input.jump)hero.jumpBuffer=.13;
if(key==='throw'){if(on&&!input.throw)aim=.01;else if(!on&&input.throw)throwPaint()}
if(key==='grab'&&on&&!input.grab)absorb();
if(key==='down'&&on&&!input.down&&!hero.ground){hero.dive=true;hero.vy=Math.max(420,hero.vy);tone(280)}
input[key]=on;
}
const keymap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',KeyW:'jump',ArrowUp:'jump',KeyK:'throw',KeyX:'throw',KeyJ:'grab',KeyC:'grab',KeyE:'grab',ArrowDown:'down',KeyS:'down',KeyR:'mount',KeyV:'mount',Escape:'pause',KeyP:'pause'};
window.addEventListener('keydown',e=>{const key=keymap[e.code];if(key){e.preventDefault();if(!e.repeat)action(key,true)}if(e.code==='Enter'&&mode==='title')start(0)});
window.addEventListener('keyup',e=>{const key=keymap[e.code];if(key){e.preventDefault();action(key,false)}});
window.addEventListener('blur',()=>{if(mode==='play')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')pause()});
document.querySelectorAll('[data-action]').forEach(b=>{const key=b.dataset.action;b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}action(key,true);b.classList.add('pressed')});for(const kind of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(kind,e=>{if(e.cancelable)e.preventDefault();action(key,false);b.classList.remove('pressed')})});
function hurt(){if(mode!=='play'||hero.inv>0)return;
if(hero.mounted){hero.mounted=false;hero.pet.x=hero.x-43;hero.pet.y=hero.y;hero.rideCd=.9;hero.inv=1.5;hero.vy=-185;hero.hover=.7;splash(hero.x,hero.y,'#a9ecdd',18);tone(230,.18);hud();return}
hero.hp--;hero.inv=1.5;hero.vy=-250;splash(hero.x,hero.y,'#ffa5c6',20);tone(155,.24);if(hero.hp<=0)gameover('Pufi hat seine Farbenergie verloren.')}
function defeat(e){e.alive=false;hero.ammo=Math.min(6,hero.ammo+1);world.score+=80;splash(e.x,e.y,'#beffd3',15);tone(770)}
function tick(dt){
if(mode!=='play')return;dt=Math.min(dt,.04);t+=dt;frameN++;const p=hero;
p.inv=Math.max(0,p.inv-dt);p.grabCd=Math.max(0,p.grabCd-dt);p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.coyote=Math.max(0,p.coyote-dt);p.rideCd=Math.max(0,p.rideCd-dt);if(input.throw)aim+=dt;
const dir=Number(input.right)-Number(input.left);p.vx+=(dir*(p.mounted?215:184)-p.vx)*Math.min(1,dt*(p.ground?17:10));if(dir)p.face=dir;
if(p.jumpBuffer>0&&(p.ground||p.coyote>0)){p.vy=-370;p.ground=false;p.coyote=0;p.jumpBuffer=0;p.hover=p.mounted?1.5:1.05;p.dive=false;tone(530);splash(p.x,p.y+p.h,'#fff1d4',6)}
if(input.jump&&!input.down&&!p.ground&&p.vy>0&&p.hover>0){p.vy=Math.min(p.vy,74);p.hover-=dt}
p.vy=Math.min(p.dive?565:420,p.vy+(p.dive?1140:790)*dt);p.x=Math.max(0,p.x+p.vx*dt);
const previousBottom=p.y+p.h;p.y+=p.vy*dt;
let onGround=false;
for(const f of world.segments.concat(world.ledges)){if(p.x+p.w<=f.x+2||p.x>=f.x+f.w-2)continue;if(p.vy>=0&&previousBottom<=f.y+9&&p.y+p.h>=f.y){p.y=f.y-p.h;p.vy=0;onGround=true;if(p.dive){splash(p.x,f.y,'#fff1b7',12);tone(340)}p.dive=false}}
if(onGround){p.ground=true;p.coyote=.11;p.hover=p.mounted?1.5:1.05}else if(p.ground){p.ground=false;p.coyote=.1}
for(const s of world.springs){if(p.vy>=0&&previousBottom<=s.y+10&&hit(p,s)){p.y=s.y-p.h;p.vy=-450;p.ground=false;p.hover=1;splash(s.x,s.y,'#ffdaf1');tone(880)}}
for(const it of world.gems){if(it.got||it.kind==='secret'&&!world.switches.some(s=>s.on))continue;
if(Math.hypot(it.x-(p.x+12),it.y-(p.y+13))<19){it.got=true;world.score+=it.kind==='drop'?10:it.kind==='flower'?250:400;if(it.kind==='flower')world.flowers++;splash(it.x,it.y,it.kind==='flower'?'#ffd6e6':'#fff2a6',9);tone(it.kind==='flower'?1100:820)}}
for(const e of world.enemies){if(!e.alive)continue;e.phase+=dt;e.x+=e.v*dt;if(e.x<e.min||e.x>e.max){e.x=clamp(e.x,e.min,e.max);e.v=-e.v}e.y=e.base+(e.kind===0?0:Math.sin(e.phase*4)*(e.kind===1?12:19));
if(hit(p,e)){if(p.vy>55&&previousBottom<=e.y+12){defeat(e);p.vy=-280;p.dive=false}else hurt()}}
for(const s of world.switches)if(!s.on&&p.dive&&hit(p,s)){s.on=true;world.score+=120;tone(900);splash(s.x,s.y,'#ffeaa9')}
const boss=world.boss;
if(boss&&boss.hp>0){boss.phase+=dt;boss.y=151+Math.sin(boss.phase*2.1)*18;boss.cool-=dt;if(boss.cool<=0&&Math.abs(p.x-boss.x)<520){boss.cool=2.05;world.hazards.push({x:boss.x+25,y:boss.y+25,w:13,h:13,vx:p.x<boss.x?-175:175,vy:-42,life:3})}
if(hit(p,boss)){if(p.vy>65&&previousBottom<=boss.y+14){boss.hp--;p.vy=-315;p.dive=false;splash(boss.x,boss.y,'#ffd0df',25);tone(290)}else hurt()}}
for(const b of world.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=350*dt;b.life-=dt;
for(const f of world.segments.concat(world.ledges))if(hit(b,f)){if(b.bounces>0){b.bounces--;b.y=f.y-b.h-1;b.vy=-Math.abs(b.vy)*.6}else b.life=0;break}
for(const e of world.enemies)if(e.alive&&hit(b,e)){defeat(e);b.life=0;break}
for(const sw of world.switches)if(!sw.on&&hit(b,sw)){sw.on=true;world.score+=120;b.life=0;splash(sw.x,sw.y,'#ffedab');tone(970)}
if(boss&&boss.hp>0&&hit(b,boss)){boss.hp--;world.score+=130;b.life=0;splash(boss.x,boss.y,'#fdd5f2',23);tone(265)}}
world.bullets=world.bullets.filter(b=>b.life>0&&b.y<H+35);
for(const b of world.hazards){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=190*dt;b.life-=dt;if(hit(p,b)){b.life=0;hurt()}}
world.hazards=world.hazards.filter(b=>b.life>0&&b.y<H+50);
if(p.y>H+90){gameover('Pufi ist ins Wolkenmeer gefallen.');return}
// When dismounted, Tamo follows along the nearest platform without spawning in mid-air.
if(p.mounted){p.pet.x=p.x;p.pet.y=p.y}
else{
const followX=p.x-38,dx=followX-p.pet.x;
p.pet.x+=Math.abs(dx)>360?dx:clamp(dx,-130*dt,130*dt);
const platform=world.segments.find(s=>p.pet.x+15>=s.x&&p.pet.x+9<s.x+s.w);
p.pet.y=platform?platform.y-30:p.y;
}
if(p.x>world.goal&&(!boss||boss.hp<=0)){finished();return}
const far=world.segments.at(-1);cam=clamp(p.x-180,0,far.x+far.w-W);
for(const q of particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=220*dt;q.life-=dt}particles=particles.filter(q=>q.life>0);
if(frameN%12===0)hud();
}
const rect=(x,y,w,h,col)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))};
function oval(x,y,rx,ry,col,border='#62536f',width=2){ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();if(border){ctx.strokeStyle=border;ctx.lineWidth=width;ctx.stroke()}}
function drawTamo(x,y,face=1){
ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(face,1);
const foot=Math.sin(t*16)*1.8,tail=Math.sin(t*8)*3;
oval(-21,tail-2,10,7,'#86d9cb','#506678',2);oval(-28,tail-8,7,8,'#86d9cb','#506678',2);
oval(-13,13+foot,9,6,'#6282ad','#506678',2);oval(13,13-foot,10,6,'#6282ad','#506678',2);
oval(0,0,24,19,'#78c7bf','#4d687a',2.5);
oval(-4,4,13,9,'#bae6cf',null);
oval(-16,-12,10,9,'#a3dfd6','#4d687a',1.5);
oval(-13,-21,7,9,'#87cabc','#4d687a',1.5);
oval(17,-14,12,12,'#89d7ce','#4d687a',2);
oval(13,-23,5,12,'#78c7bf','#4d687a',1.7);
oval(27,-3,11,10,'#89d7ce','#4d687a',2);
oval(22,-6,5,6,'#fff9e3',null);oval(23,-6,2,3,'#3e5469',null);
oval(34,1,2,2,'#4d687a',null);oval(12,1,4,3,'#f2b8b4',null);
oval(-3,-17,10,4,'#f7d9a7','#766482',1);
ctx.restore();
}
function draw(){
if(!world)return;const q=LEVELS[level],grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,q.sky[0]);grad.addColorStop(1,q.sky[1]);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
oval(381-cam*.02%45,51,28,28,'#fff0b9',null);
for(let i=0;i<12;i++){const x=(i*119-cam*.13)%720-50,y=25+(i*37)%107;oval(x,y,27,12,'#fffaf0',null);oval(x-14,y-6,15,10,'#fffaf0',null);oval(x+13,y-9,20,13,'#fffaf0',null)}
for(let layer=0;layer<2;layer++){ctx.beginPath();ctx.moveTo(0,H);for(let x=-20;x<=W+25;x+=9){const wx=x+cam*(layer?.36:.19),y=(layer?201:167)-Math.sin(wx/111+level)*31-Math.sin(wx/49+layer)*11;ctx.lineTo(x,y)}ctx.lineTo(W,H);ctx.fillStyle=layer?q.hill:'#ffffff66';ctx.fill()}
ctx.save();ctx.translate(-Math.floor(cam),0);
for(const s of world.segments){rect(s.x,s.y,s.w,190,q.soil);rect(s.x,s.y,s.w,9,q.grass);rect(s.x,s.y,s.w,3,'#fff3d0');
for(let x=s.x+11;x<s.x+s.w-12;x+=26){rect(x,s.y+23+(x%4)*6,12,4,'#ffffff36');
if(x%3===0){rect(x,s.y-11,3,11,'#57947b');oval(x+1,s.y-13,4,4,'#ffe29d',null)}
if(x%5===0){rect(x,s.y-45,8,48,'#977d79');oval(x+4,s.y-50,20,19,q.hill,'#6b7884',1);oval(x+5,s.y-56,12,10,q.grass,null)}}}
for(const f of world.ledges){rect(f.x,f.y,f.w,f.h,q.soil);rect(f.x,f.y,f.w,6,q.grass);rect(f.x+7,f.y+7,8,3,'#fff8c4')}
for(const s of world.springs){rect(s.x,s.y+6,s.w,6,'#696985');rect(s.x,s.y,s.w,5,'#ffd2c4');for(let i=0;i<3;i++)rect(s.x+4+i*10,s.y+5,5,5,'#f8e3be')}
for(const f of world.pods)if(!f.used){oval(f.x,f.y,10,11,'#e5ac76','#765b76');oval(f.x-2,f.y-4,3,3,'#fff3c4',null)}
for(const sw of world.switches){oval(sw.x+10,sw.y+11,11,12,sw.on?'#f5dfab':'#b0a0d5','#5f5876');oval(sw.x+10,sw.y+11,5,6,sw.on?'#fff':'#686191',null)}
for(const item of world.gems)if(!item.got&&!(item.kind==='secret'&&!world.switches.some(s=>s.on))){
const y=item.y+Math.sin(t*4+item.x)*3;if(item.kind==='flower'){for(let z=0;z<5;z++){const a=z*2*Math.PI/5;oval(item.x+Math.cos(a)*9,y+Math.sin(a)*9,6,7,'#f6b6ca','#866880',1)}oval(item.x,y,5,5,'#fff1ac',null)}
else{oval(item.x,y,item.kind==='secret'?10:6,item.kind==='secret'?11:7,item.kind==='secret'?'#b1f1df':'#ffe5a1','#937077',1);oval(item.x-2,y-2,2,3,'#fffdf2',null)}}
for(const e of world.enemies)if(e.alive){oval(e.x+12,e.y+13,12,10,['#d897c1','#e6b26c','#a8addf'][e.kind],'#60516c');if(e.kind===2){oval(e.x-2,e.y+10,9,5,'#d7c9fa',null);oval(e.x+26,e.y+10,9,5,'#d7c9fa',null)}
oval(e.x+7,e.y+10,3,4,'#fff9dc',null);oval(e.x+18,e.y+10,3,4,'#fff9dc',null);rect(e.x+7,e.y+10,2,3,'#44415a');rect(e.x+18,e.y+10,2,3,'#44415a')}
const boss=world.boss;if(boss&&boss.hp>0){oval(boss.x+33,boss.y+33,40,38,level===2?'#bba8d8':'#c88faf','#605275',4);
for(let i=0;i<7;i++){const a=i*Math.PI*2/7+t*.3;oval(boss.x+33+Math.cos(a)*34,boss.y+33+Math.sin(a)*31,12,11,'#f1bfd5','#605275',2)}
oval(boss.x+21,boss.y+27,7,10,'#fff7e5',null);oval(boss.x+48,boss.y+27,7,10,'#fff7e5',null);oval(boss.x+24,boss.y+30,3,5,'#45415c',null);oval(boss.x+51,boss.y+30,3,5,'#45415c',null);
rect(boss.x+4,boss.y-17,58*boss.hp/boss.max,5,'#fbe3a0')}
for(const b of world.bullets)oval(b.x+5,b.y+5,6,6,'#fdd9a7','#87687b');for(const b of world.hazards)oval(b.x+6,b.y+6,7,7,'#8d72b4','#ffbcb8');
// Tamo always exists as a distinct, animated creature, even when Pufi hops off.
if(hero.mounted)drawTamo(hero.x+13,hero.y+17,hero.face);
else if(hero.pet){
drawTamo(hero.pet.x+13,hero.pet.y+16,hero.face);
if(Math.abs(hero.pet.x-hero.x)<90){oval(hero.pet.x+12,hero.pet.y-33,9,9,'#fff6d6','#73617e',1);ctx.fillStyle='#5b5576';ctx.font='bold 11px sans-serif';ctx.fillText('R',hero.pet.x+9,hero.pet.y-29)}
}
rect(world.goal,128,5,92,'#fff2dc');ctx.fillStyle='#f5a9ba';ctx.beginPath();ctx.moveTo(world.goal+5,131);ctx.lineTo(world.goal+45,145);ctx.lineTo(world.goal+5,156);ctx.fill();
if(!(hero.inv>0&&Math.floor(t*12)%2)){
const p=hero;ctx.save();ctx.translate(Math.round(p.x)+(p.face<0?p.w:0),Math.round(p.y)-(p.mounted?17:0));ctx.scale(p.face,1);
oval(-4,20,11,7,'#f6afa9','#6b526c');oval(12,18,13,12,'#ef91ad','#765872');
oval(5,4,6,16,'#e58daf','#765872');oval(20,3,6,17,'#e58daf','#765872');
oval(12,10,15,12,'#f39bb9','#765872');oval(12,11,11,9,'#ffe6cb',null);
oval(8,10,2.7,4,'#47415c',null);oval(20,10,2.7,4,'#47415c',null);oval(15,17,3,2,'#d9889f',null);
oval(5,29,7,3,'#627ca4','#665978',1);oval(20,29,7,3,'#627ca4','#665978',1);
if(input.jump&&!p.ground){oval(-9,10,8,5,'#ffdaef','#ae80a0',1);oval(31,10,8,5,'#ffdaef','#ae80a0',1)}
ctx.restore();
if(input.throw){const angle=clamp(.52+Math.sin(t*3.2)*.55,.04,1.12),dx=Math.cos(angle)*65*p.face,dy=-Math.sin(angle)*65;
ctx.setLineDash([4,5]);ctx.strokeStyle='#fff8d0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x+12,p.y+13);ctx.lineTo(p.x+12+dx,p.y+13+dy);ctx.stroke();ctx.setLineDash([]);oval(p.x+12+dx,p.y+13+dy,4,4,'#fff0b7','#977e9b',1)}
}
for(const b of particles)rect(b.x,b.y,3,3,b.color);
ctx.restore();
}
let prev=0,accum=0;function frame(ms){const dt=prev?Math.min(.05,(ms-prev)/1000):0;prev=ms;accum+=dt;while(accum>=1/60){tick(1/60);accum-=1/60}draw();requestAnimationFrame(frame)}
build(0);title();requestAnimationFrame(frame);
// Test seam; does not affect gameplay.
window.PufiTest={state:()=>({mode,level,hero,world,save}),start,tick,finished,gameover,action,absorb,throwPaint,draw,toggleMount,hurt};
})();