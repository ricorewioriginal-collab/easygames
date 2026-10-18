// Spinwelten 3D – Datenprüfung: 30 Welten, 150 Bauwerke, 240 Karten, 60 Aufgaben, Erfolge, Story (Texte DE+EN vollständig).
'use strict';
const test = require('node:test'), assert = require('node:assert');
test('Spieldaten vollständig und gültig', () => {
globalThis.SW={};const D=require('path').join(__dirname,'..','js','data')+'/';
['worlds','cards','quests','achievements','story'].forEach(f=>require(D+f+'.js'));
const SW=globalThis.SW;const E=[];const err=m=>E.push(m);
const S=a=>new Set(a.split(' '));
const ARCH=S('tower lighthouse hall house dome pier windmill bridge fountain treehouse tent pagoda pyramid crystal gate ship greenhouse factory igloo theater station temple mushroom clocktower market obelisk palace arch');
const ROOF=S('cone dome flat gable spire onion crystal none tiers');
const DECOR=S('pine round_tree palm bamboo mushroom crystal rock flower coral cactus ice lantern gear lava_rock cloud_puff book_stack candy pillar reed willow fern bush');
const ANIM=S('windmill birds boats fireflies clouds gears waterfall lanterns fish smoke aurora sparkles balloons butterflies snow embers bubbles leaves airship rain banners');
const MG=S('lichtpfad kristallsuche wolkengleiter runenmemory funkelpuzzle reparaturwerk portalsprung schatzkarte');
const NPC=S('golem sprite sproutling robot fox owl yeti fish dragonling jester');
const MOTIF=S('star moon sun crystal gear leaf flower drop flame snowflake wave shell key book bell lantern feather mushroom tree fish bird ship compass crown mask potion scroll heart eye hourglass cloud mountain dragon wing ring tower');
const QT=S('spin build island album cards raid attack shield repair minigame visit companion train chest event trade mult jackpot bigwin revenge');
const STAT=S('spins coins_earned builds islands attacks raids blocks repairs cards albums chests minigames mg_wins companions trains quests event_points trades bigwins jackpots online_games online_wins days max_mult revenges visits ngplus');
const tx=(o,w)=>{if(!o||typeof o.de!=='string'||typeof o.en!=='string'||!o.de.trim()||!o.en.trim())err('text '+w);};
const hex=/^#[0-9a-f]{6}$/i, slug=/^[a-z0-9_]+$/;
const EXP=[['Sternenbucht','Leuchtturm,Sternenpier,Segelwerft,Glasmarkt,Observatorium'],['Mooshafen','Pilzherberge,Wurzelbrücke,Honigladen,Waldschmiede,Baumhaus'],['Regenlicht','Regenbogenbrunnen,Wolkengarten,Tropfenturm,Gewächshaus,Café'],['Bambusklang','Bambusvilla,Teegarten,Klangtor,Laternenweg,Quellenhaus'],['Wurzelwinkel','Eichentempel,Tierschutzhaus,Moosmühle,Gärtnerhof,Waldforum'],['Wolkenwerft','Luftschiffdock,Aufwindturm,Segelhalle,Windmühle,Pilotenhaus'],['Mechanopolis','Uhrwerkrathaus,Zahnradturm,Roboterwerkstatt,U-Bahn-Halle,Fabrikpark'],['Glaswüste','Oasenpalast,Sanduhr,Kristallbrunnen,Karawanentor,Glashalle'],['Vulkanflamme','Lava-Schild,Basaltschmiede,Aschegarten,Glutrestaurant,Gipfelbahn'],['Eisleuchten','Sterneniglu,Frostbrücke,Nordlichtgalerie,Schlittenwerk,Eisresidenz'],['Korallenreich','Tauchglocke,Perlenturm,Riffgarten,Muscheltheater,Uferhafen'],['Prisma-Delta','Lichtbrücke,Farblichtlabor,Prismaschule,Spektralwerk,Spiegelkuppel'],['Mondgarten','Silberteich,Nachtblütenhaus,Mondlichttempel,Sternentor,Hängematte'],['Spiegelwald','Spiegelsee,Echohaus,Baumportal,Irrlichtturm,Glasbaum'],['Kristallkaverne','Grottenbahn,Edelsteinbörse,Lichtschacht,Kristalltheater,Bergstation'],['Drachenwiesen','Drachenstall,Federnest,Feuerbrücke,Flugschule,Wolkenburg'],['Himmelsbibliothek','Leseturm,Schriftgarten,Papiermühle,Archivkuppel,Geschichtensaal'],['Uhrwerkstadt','Zeittor,Glockenhaus,Automatenplatz,Pendelturm,Museum'],['Nebelzirkus','Luftartistenzelt,Zauberbühne,Spiegelkabinett,Jahrmarkt,Lichtorgel'],['Jadeparadies','Wasserpalast,Blätterterrasse,Zenbrücke,Pflanzenlabor,Jadeportal'],['Ruinenatoll','Tempelhof,Moosstele,Brückenrest,Entdeckerhütte,Sonnentor'],['Sturmkap','Blitzfänger,Kapitänshaus,Sturmbarriere,Hafenkran,Kommandoturm'],['Tieflichtsee','Leuchtboot,Schwimmgarten,Lichtfisch-Zentrum,Wasserturm,Seebühne'],['Pilzkönigreich','Pilzpalast,Sporenfarm,Trampolinplatz,Heilgarten,Zunfthaus'],['Polarlichtstadt','Lichtkristall,Eispalast,Sternenstraße,Wintermarkt,Himmelsbahn'],['Zuckerwind','Bonbonwerkstatt,Wirbelmühle,Zuckerbrücke,Konditorei,Wolkenpalast'],['Gluttempel','Sonnenaltar,Hitzeschmiede,Feuergalerie,Steinweg,Tempelwache'],['Weltenbahn','Lokwerkstatt,Portalbahnhof,Signalsäule,Reisehotel,Bahnhofshalle'],['Ewiger Horizont','Luftgarten,Nebelwarte,Himmelstreppe,Portalring,Panorama-Palast'],['Sternenherz','Kernreaktor (magisch),Denkmal,Bündnishalle,Lichtbaum,Finalportal']];
// chapters
if(SW.CHAPTERS.length!==6)err('chapters');
SW.CHAPTERS.forEach((c,i)=>{tx(c.name,'ch'+i);tx(c.intro,'ch'+i);tx(c.finale,'ch'+i);tx(c.giver.role,'ch'+i);if(!c.giver.name)err('giver');if(c.id!=='abcdef'[i])err('chid');});
// worlds
const W=SW.WORLDS;if(W.length!==30)err('worlds '+W.length);
const combo=new Map();let nb=0;const mgc={};const wids=new Set();const sea={};
W.forEach((w,i)=>{const t='W'+(i+1);
 if(w.n!==i+1)err(t+' n');if(w.ch!==Math.floor(i/5))err(t+' ch');if(!slug.test(w.id)||wids.has(w.id))err(t+' id');wids.add(w.id);
 if(w.name.de!==EXP[i][0])err(t+' name '+w.name.de);
 ['name','sub','story','album'].forEach(k=>tx(w[k],t+k));
 if(w.sub.de.split(/\s+/).length>6||w.sub.en.split(/\s+/).length>6)err(t+' sub long');
 const PK='sky horizon fog grass grass2 rock rock2 sea accent accent2 glow sun'.split(' ');PK.forEach(k=>{if(!hex.test(w.pal[k]))err(t+' pal '+k);});
 if(!['day','dusk','night','dawn'].includes(w.time))err(t+' time');
 if(!['water','clouds','lava','ice','sand','void','candy'].includes(w.sea))err(t+' sea');
 const s=w.shape;if(!(s.r>=11&&s.r<=15&&s.tiers>=1&&s.tiers<=3&&s.lobes>=0&&s.lobes<=4&&s.cliff>=.5&&s.cliff<=1.5&&s.flat>=0&&s.flat<=1&&Number.isInteger(s.seed)))err(t+' shape');
 if(w.decor.length<3||w.decor.length>6)err(t+' decor len');let dt=0;w.decor.forEach(([k,c])=>{if(!DECOR.has(k))err(t+' decor '+k);if(!(c>0))err(t+' decor cnt');dt+=c;});if(dt<20||dt>45)err(t+' decor total '+dt);
 if(w.anim.length<4||w.anim.length>6)err(t+' anim len');w.anim.forEach(a=>{if(!ANIM.has(a))err(t+' anim '+a);});
 if(!NPC.has(w.npc))err(t+' npc');
 if(w.buildings.length!==5)err(t+' nb');const archs=new Set();const bids=new Set();
 const en=EXP[i][1].split(',');
 w.buildings.forEach((b,j)=>{nb++;const bt=t+' '+b.id;if(b.name.de!==en[j])err(bt+' name '+b.name.de);tx(b.name,bt);tx(b.desc,bt);
  if(!slug.test(b.id)||bids.has(b.id))err(bt+' id');bids.add(b.id);
  if(!ARCH.has(b.arch))err(bt+' arch');if(!ROOF.has(b.roof))err(bt+' roof');if(archs.has(b.arch))err(bt+' dup arch '+b.arch);archs.add(b.arch);
  if(!(b.tall>=.8&&b.tall<=1.6&&b.wide>=.8&&b.wide<=1.4))err(bt+' size');
  const k=[b.arch,b.roof,b.tall.toFixed(1),b.wide.toFixed(1)].join('|');if(combo.has(k))err('combo '+k+' '+bt+' vs '+combo.get(k));combo.set(k,bt);});
 const x=w.extra;if(x.kind!=='minigame'||!MG.has(x.id))err(t+' extra');tx(x.name,t);tx(x.desc,t);mgc[x.id]=(mgc[x.id]||0)+1;
 const m=w.music;if(!(m.root>=40&&m.root<=64&&['major','minor','dorian','pentatonic','lydian'].includes(m.scale)&&m.tempo>=70&&m.tempo<=120))err(t+' music');
 sea[w.sea]=(sea[w.sea]||0)+1;});
MG.forEach(m=>{if(!(mgc[m]>=2))err('mg rare '+m);});
// cards
const C=SW.CARDS;if(C.length!==240)err('cards '+C.length);const ci=new Set(),cd=new Set(),ce=new Set();
C.forEach((c,i)=>{const w=Math.floor(i/8)+1,j=i%8+1;const id='w'+String(w).padStart(2,'0')+'c'+j;if(c.id!==id||c.w!==w)err('card id '+c.id);
 if(ci.has(c.id))err('dup id');ci.add(c.id);if(cd.has(c.name.de))err('dup de '+c.name.de);cd.add(c.name.de);if(ce.has(c.name.en))err('dup en '+c.name.en);ce.add(c.name.en);
 if(c.r!==[0,0,0,0,1,1,2,3][j-1])err('rar '+c.id);if(!MOTIF.has(c.motif))err('motif '+c.id+' '+c.motif);tx(c.name,c.id);tx(c.flavor,c.id);
 if(c.flavor.de.split(/\s+/).length>12)err('flavor long '+c.id);});
// quests
const Q=SW.QUESTS;if(Q.length<60)err('quests');const qi=new Set();
Q.forEach((q,i)=>{if(qi.has(q.id))err('dup q');qi.add(q.id);if(q.id!=='q'+String(i+1).padStart(2,'0'))err('qid '+q.id);if(!QT.has(q.type))err('qtype '+q.id);tx(q.title,q.id);tx(q.text,q.id);
 if(!(q.n>0))err('qn');if(q.type==='minigame'&&q.arg&&!MG.has(q.arg))err('qarg');if(!q.giver)err('qgiver');
 const r=q.reward;if(!r||!Object.keys(r).length)err('rew '+q.id);for(const k in r){if(k==='chest'){if(!['holz','silber','gold','stern'].includes(r[k]))err('chest');}else if(k==='coins'){if(r[k]<5||r[k]>80)err('coins '+q.id);}else if(k==='spins'||k==='relics'){if(r[k]<5||r[k]>40)err(k+' '+q.id);}else err('rew key '+k);}
 const lim={spin:300,raid:15,attack:15,cards:200,album:12,event:3000};if(lim[q.type]&&q.n>lim[q.type])err('lim '+q.id);});
for(let c=0;c<6;c++){const cq=Q.filter(q=>q.ch===c);if(cq.length<10)err('ch q '+c);const l=cq[cq.length-1];if(l.type!=='island'||l.n!==5*(c+1))err('finale '+c);
 cq.filter(q=>q.type==='island').forEach(q=>{if(q.n>5*(c+1))err('island too high '+q.id);});}
// achievements
const A=SW.ACHIEVEMENTS;if(A.length<44)err('ach');const ai=new Set(),used=new Set();
A.forEach(a=>{if(ai.has(a.id))err('dup ach '+a.id);ai.add(a.id);if(!STAT.has(a.stat))err('stat '+a.stat);used.add(a.stat);tx(a.name,a.id);tx(a.desc,a.id);if(!a.icon)err('icon');if(!(a.n>0))err('an');});
STAT.forEach(s=>{if(!used.has(s))err('unused stat '+s);});
// story
const ST=SW.STORY;['intro','ending'].forEach(k=>{if(ST[k].length<4||ST[k].length>6)err('story '+k);ST[k].forEach((l,i)=>{if(!l.who)err('who');tx(l,k+i);});});
if(ST.islandDone.length!==6)err('islandDone');ST.islandDone.forEach((l,i)=>{tx(l,'done'+i);if(!l.de.includes('{island}')||!l.en.includes('{island}'))err('placeholder '+i);});tx(ST.ngplus,'ngplus');

assert.deepStrictEqual(E, []);
});
