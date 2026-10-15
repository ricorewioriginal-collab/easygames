(function(root,make){const api=make();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MimoriModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION=1,DAY=86400000,stages=['Baby','Jungtier','Freund','Sternenwesen'];
const species=['Fluffi','Nubbi','Foxi','Drachi'];
const bound=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,Number.isFinite(x)?x:lo));
const HOUR=3600000;
// An unannounced accident happens at reproducible, irregular intervals even while offline.
// Stable time-based scheduling avoids duplicate incidents after a cloud restore.
function accidentInterval(seed,index){const n=(Math.sin(seed/1231+index*71.13)*43758.5453)%1;
 return (1.5+Math.abs(n)*2.2)*HOUR;
}
function fresh(now=Date.now()){
 return {version:VERSION,name:'Mimori',born:now,updated:now,hunger:82,joy:82,energy:82,clean:88,health:92,xp:0,care:0,color:0,species:0,coins:0,records:{},lastDaily:'',accessory:0,theme:0,owns:{accessory:[0],theme:[0]},lastAction:'Willkommen zu Hause!',toiletNeed:12,mess:0,messSince:0,accidents:0,
 nextAccident:now+accidentInterval(now,0),sick:false,sleeping:false,lightsOff:false,
 inventory:{berry:7,soap:5}};
}
function evolve(p){
const age=Math.max(0,(p.updated-p.born)/DAY);
return p.xp>=390&&age>=2?3:p.xp>=145&&age>=.5?2:p.xp>=35?1:0;
}
function advance(raw,now=Date.now()){
 const p={...raw},end=Math.max(Number(p.updated)||0,Number(now)||0);
 const start=Math.max(0,Number(p.updated)||end),hours=Math.min(14*24,Math.max(0,(end-start)/HOUR));
 if(hours===0)return p;
 const until=start+hours*HOUR;
 p.hunger=bound(p.hunger-hours*8);p.joy=bound(p.joy-hours*4.5);
 // The animal only regenerates meaningfully when both sleeping and in darkness.
 p.energy=bound(p.energy+hours*(p.sleeping?(p.lightsOff?27:1):-5.5));
 p.clean=bound(p.clean-hours*(5+Math.min(3,p.mess||0)*3.8));
 p.toiletNeed=bound((p.toiletNeed||0)+hours*24);
 let next=Number(p.nextAccident)||start+accidentInterval(p.born||start,p.accidents||0),events=0;
 while(next<=until&&events<15){
  p.mess=Math.min(4,(p.mess||0)+1);
  if(!p.messSince)p.messSince=next;
  p.accidents=(p.accidents||0)+1;
  p.toiletNeed=0;
  p.clean=bound(p.clean-9);
  p.joy=bound(p.joy-4);
  next+=accidentInterval(p.born||start,p.accidents);
  events++;
 }
 p.nextAccident=next;
 const dirtyHours=p.mess?Math.max(0,(until-Math.max(start,p.messSince||start))/HOUR):0;
 const distressed=[p.hunger,p.joy,p.energy,p.clean].filter(v=>v<20).length;
 const hygienePenalty=p.mess?Math.min(3,p.mess)*1.8*dirtyHours:0;
 p.health=bound(p.health+hours*(distressed?-1.4*distressed:.3)-hygienePenalty,10,100);
 p.sick=Boolean(p.sick||p.health<42||(p.mess>0&&dirtyHours>=3));
 if(p.sick)p.joy=bound(p.joy-hours*1.7);
 p.updated=end;
 return p;
}
function load(raw,now=Date.now()){
if(!raw||raw.version!==VERSION||typeof raw!=='object')return fresh(now);
const p=fresh(now);
p.name=String(raw.name||'Mimori').replace(/[<>]/g,'').trim().slice(0,18)||'Mimori';
p.born=bound(Number(raw.born),0,now)||now;
p.updated=bound(Number(raw.updated),0,now)||now;
for(const k of ['hunger','joy','energy','clean','health'])p[k]=bound(Number(raw[k]),0,100);
p.xp=bound(Number(raw.xp),0,100000);p.care=bound(Number(raw.care),0,100000);
p.color=Math.floor(bound(Number(raw.color),0,3));
p.species=Math.floor(bound(Number(raw.species??0),0,3));
p.toiletNeed=bound(Number(raw.toiletNeed??12));
p.mess=Math.floor(bound(Number(raw.mess??0),0,4));
p.accidents=Math.floor(bound(Number(raw.accidents??0),0,100000));
p.messSince=p.mess?bound(Number(raw.messSince??p.updated),0,now):0;
p.nextAccident=bound(Number(raw.nextAccident??(p.updated+accidentInterval(p.born,p.accidents))),0,now+7*DAY);
p.sick=raw.sick===true;
p.sleeping=raw.sleeping===true;
p.lightsOff=raw.lightsOff===true;
p.coins=Math.floor(bound(Number(raw.coins??0),0,1000000));
p.records={};for(const id of ['catch','memory','rhythm','runner','bubbles'])p.records[id]=Math.floor(bound(Number(raw.records?.[id]??0),0,1000000));
p.lastDaily=typeof raw.lastDaily==='string'?raw.lastDaily.slice(0,12):'';
p.accessory=Math.floor(bound(Number(raw.accessory??0),0,3));
p.theme=Math.floor(bound(Number(raw.theme??0),0,2));
p.owns={accessory:[0],theme:[0]};
for(const kind of ['accessory','theme'])for(const value of raw.owns?.[kind]||[]){
 const id=Math.floor(Number(value));
 if(Number.isFinite(id)&&id>=0&&id<=(kind==='accessory'?3:2)&&!p.owns[kind].includes(id))p.owns[kind].push(id);
}
if(!p.owns.accessory.includes(p.accessory))p.accessory=0;
if(!p.owns.theme.includes(p.theme))p.theme=0;
p.lastAction=String(raw.lastAction||p.lastAction).slice(0,100);
p.inventory={berry:Math.floor(bound(Number(raw.inventory?.berry),0,999)),soap:Math.floor(bound(Number(raw.inventory?.soap),0,999))};
return advance(p,now);
}
function act(raw,kind,now=Date.now()){
const p=advance(raw,now),old=evolve(p);let reward=0,message='';
const boost=(k,d)=>p[k]=bound(p[k]+d);
switch(kind){
case 'toilet':
 if(p.toiletNeed<30){return {ok:false,pet:p,reason:'Mimori muss gerade nicht aufs Klo.'}}
 p.toiletNeed=0;p.nextAccident=now+accidentInterval(p.born,p.accidents);
 boost('joy',4);reward=4;message='Geschafft! Rechtzeitig auf die Toilette! 🚽';break;
case 'cleanup':
 if(p.mess<1)return {ok:false,pet:p,reason:'Der Boden ist bereits sauber!'};
 p.mess=0;p.messSince=0;boost('clean',30);boost('joy',4);reward=8;message='Alles blitzblank! Danke fürs Saubermachen! 🧹';break;
case 'medicine':
 if(!p.sick&&p.health>=70)return {ok:false,pet:p,reason:'Mimori ist gesund und braucht keine Medizin.'};
 p.sick=false;boost('health',48);boost('joy',6);reward=5;
 message=p.mess>0?'Medizin hilft – aber räume bitte auch den Dreck weg!':'Puh! Die Medizin tut mir gut! 💊';break;
case 'light':
 p.lightsOff=!p.lightsOff;
 reward=0;message=p.lightsOff?'Licht aus – gute Nacht! 🌙':'Licht an – guten Morgen! ☀️';break;
case 'feed':
 if(p.inventory.berry<1)return {ok:false,pet:p,reason:'Keine Beeren mehr! Gewinne beim Spielen neue.'};
 p.inventory={...p.inventory,berry:p.inventory.berry-1};boost('hunger',30);boost('joy',5);boost('clean',-5);reward=8;message='Mmmh! Das schmeckt!';break;
case 'play':
 if(p.energy<9)return {ok:false,pet:p,reason:'Zu müde zum Spielen!'};
 boost('joy',25);boost('energy',-15);boost('hunger',-7);reward=10;message='Juhu! Noch eine Runde!';break;
case 'wash':
 if(p.inventory.soap<1)return {ok:false,pet:p,reason:'Keine Seife! Spiele, um neue zu bekommen.'};
 p.inventory={...p.inventory,soap:p.inventory.soap-1};boost('clean',38);boost('joy',4);reward=7;message='Frisch gebadet!';break;
case 'sleep':
 p.sleeping=!p.sleeping;
 if(p.sleeping){boost('energy',2);reward=3;
  message=p.lightsOff?'Mimori schläft jetzt. Gute Nacht! 💤':'Mimori möchte schlafen – mach bitte das Licht aus! 💡'}
 else{reward=1;message='Mimori ist wieder wach! ☀️'}
 break;
case 'cuddle':
 boost('joy',14);boost('health',3);reward=4;message='Ich hab dich lieb!';break;
case 'minigame':
 boost('joy',13);boost('energy',-10);boost('hunger',-4);
 p.inventory={berry:Math.min(999,p.inventory.berry+2),soap:Math.min(999,p.inventory.soap+1)};
 reward=18;message='Spiel gewonnen – neue Vorräte!';break;
default:return {ok:false,pet:p,reason:'Unbekannte Aktion'};
}
p.xp+=reward;p.care++;p.lastAction=message;return {ok:true,pet:p,reward,evolved:evolve(p)>old};
}
const prices={accessory:[0,60,110,180],theme:[0,80,140]};
function rewardMini(raw,id,score,won,now=Date.now()){
 if(!['catch','memory','rhythm','runner','bubbles'].includes(id))return {ok:false,pet:raw};
 const p=advance(raw,now),old=evolve(p);
 const points=Math.floor(bound(Number(score),0,5000)),win=won===true;
 const coinReward=Math.min(65,Math.floor(points/25)+(win?14:0));
 const xpReward=Math.min(35,Math.floor(points/40)+(win?12:0));
 p.coins=Math.floor(bound(p.coins+coinReward,0,1000000));
 p.xp=bound(p.xp+xpReward,0,100000);
 p.joy=bound(p.joy+(win?15:5),0,100);
 p.energy=bound(p.energy-6,0,100);
 p.records={...p.records,[id]:Math.max(p.records?.[id]||0,points)};
 p.lastAction='Minispiel: '+coinReward+' Sterne gesammelt!';
 return {ok:true,pet:p,coins:coinReward,xp:xpReward,record:p.records[id],evolved:evolve(p)>old};
}
function claimDaily(raw,now=Date.now()){
 const p=advance(raw,now),date=new Date(now).toISOString().slice(0,10);
 if(p.lastDaily===date)return {ok:false,pet:p,reason:'Den Tagesbonus hast du bereits abgeholt.'};
 p.lastDaily=date;p.coins=Math.floor(bound(p.coins+25,0,1000000));
 p.inventory={...p.inventory,berry:Math.min(999,p.inventory.berry+3),soap:Math.min(999,p.inventory.soap+2)};
 p.lastAction='Dein tägliches Geschenk: 25 Sterne, 3 Beeren und 2 Seifen!';
 return {ok:true,pet:p};
}
function shop(raw,kind,id){
 const p={...raw};
 if(!Object.hasOwn(prices,kind))return {ok:false,pet:p,reason:'Unbekannter Artikel'};
 const n=Math.floor(Number(id)),cost=prices[kind][n];
 if(!Number.isFinite(n)||cost===undefined)return {ok:false,pet:p,reason:'Artikel nicht vorhanden'};
 const owns={accessory:[...(p.owns?.accessory||[0])],theme:[...(p.owns?.theme||[0])]};
 const owned=owns[kind].includes(n);
 if(!owned&&p.coins<cost)return {ok:false,pet:p,reason:'Dafür fehlen dir noch Sterne.'};
 if(!owned){p.coins-=cost;owns[kind].push(n)}
 p.owns=owns;p[kind]=n;return {ok:true,pet:p,purchased:!owned};
}
function mood(p){
const min=Math.min(p.hunger,p.joy,p.clean,p.energy);
return p.sick?'Krank – Medizin benötigt':p.mess>0?'Boden verschmutzt':p.sleeping?(p.lightsOff?'Schläft friedlich':'Licht aus!'):p.toiletNeed>=70?'Muss aufs Klo':p.health<25||min<25?'Braucht dich':p.energy<35?'Schläfrig':p.joy>75&&min>55?'Überglücklich':'Zufrieden';
}
function needs(p,threshold=35){
 const basic=['hunger','joy','energy','clean'].filter(k=>p[k]<=threshold);
 if(p.mess>0)basic.unshift('mess');if(p.sick)basic.unshift('sick');
 if(p.toiletNeed>=75)basic.unshift('toilet');
 if(p.sleeping&&!p.lightsOff)basic.unshift('light');
 return basic;
}
function changeSpecies(p,id){const next=Math.floor(Number(id));if(!Number.isInteger(next)||next<0||next>=species.length)return p;return {...p,species:next}}
function rename(p,name){const safe=String(name||'').replace(/[<>]/g,'').trim().slice(0,18);return {...p,name:safe||p.name}}
return {VERSION,DAY,stages,species,fresh,load,advance,act,evolve,mood,needs,rename,changeSpecies,rewardMini,claimDaily,shop,prices};
});