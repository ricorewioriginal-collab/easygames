const THREE=globalThis.THREE;
if(!THREE)throw Error('Lokale Three.js-Bibliothek konnte nicht geladen werden.');
const $=id=>document.getElementById(id), rand=(a,b)=>a+Math.random()*(b-a);
const TYPES={normal:'⭐',feuer:'🔥',wasser:'💧',pflanze:'🌱',elektro:'⚡',gestein:'🪨',flug:'🪽',geist:'👻'};
const SPEC={
 blitzi:{name:'Blitzi',type:'elektro',color:0xffd23e,hp:40,atk:55,def:40,speed:90,catch:.49,moves:['stoss','funken'],evo:['blitzor',18]},
 blitzor:{name:'Blitzor',type:'elektro',color:0xf9a82e,hp:65,atk:90,def:55,speed:110,catch:.23,moves:['funken','stoss']},
 fellino:{name:'Fellino',type:'normal',color:0xb9825a,hp:55,atk:55,def:50,speed:55,catch:.5,moves:['stoss','hieb']},
 glutzahn:{name:'Glutzahn',type:'feuer',color:0xf47d3b,hp:44,atk:52,def:43,speed:65,catch:.44,moves:['stoss','glut'],evo:['glutdrach',16]},
 glutdrach:{name:'Glutdrach',type:'feuer',color:0xda532d,hp:78,atk:84,def:78,speed:100,catch:.23,moves:['glut','hieb']},
 samenling:{name:'Samenling',type:'pflanze',color:0x59bfa4,hp:45,atk:49,def:49,speed:45,catch:.48,moves:['stoss','ranke'],evo:['bluetling',16]},
 bluetling:{name:'Blütling',type:'pflanze',color:0x36bfa0,hp:80,atk:82,def:83,speed:80,catch:.23,moves:['ranke','hieb']},
 plaetscher:{name:'Plätscherchen',type:'wasser',color:0x5caafa,hp:44,atk:48,def:65,speed:43,catch:.46,moves:['stoss','spritzer'],evo:['panzerlon',16]},
 panzerlon:{name:'Panzerlon',type:'wasser',color:0x367dc9,hp:79,atk:83,def:100,speed:78,catch:.24,moves:['spritzer','hieb']},
 flatterling:{name:'Flatterling',type:'flug',color:0xc5a07c,hp:40,atk:45,def:40,speed:56,catch:.7,moves:['stoss','fluegel']},
 felsling:{name:'Felsling',type:'gestein',color:0x9594a4,hp:40,atk:80,def:100,speed:20,catch:.6,moves:['stoss','stein']},
 geisterchen:{name:'Geisterchen',type:'geist',color:0x9675d8,hp:30,atk:50,def:35,speed:80,catch:.57,moves:['spuk','stoss']},
 quappi:{name:'Quappi',type:'wasser',color:0x478fd6,hp:40,atk:50,def:40,speed:90,catch:.66,moves:['spritzer','stoss']},
 kaeferli:{name:'Käferli',type:'pflanze',color:0x83c64a,hp:40,atk:45,def:55,speed:40,catch:.7,moves:['stoss','ranke']},
 knister:{name:'Knister',type:'elektro',color:0xffdf42,hp:35,atk:60,def:40,speed:75,catch:.64,moves:['funken','stoss']},
 funkli:{name:'Funkli',type:'feuer',color:0xff6d37,hp:38,atk:58,def:38,speed:70,catch:.64,moves:['glut','stoss']},
 schlummi:{name:'Schlummi',type:'normal',color:0x947052,hp:110,atk:85,def:70,speed:25,catch:.3,moves:['stoss','hieb']}
};
// 208 catalog entries total. New regional forms are procedurally derived from original Taschi species.
// They have distinct game IDs, names, colors and stats; handcrafted 3D models remain future work.
const REGIONS=['Moos','Polar','Glanz','Schatten','Korall','Sturm','Kristall','Sonnen','Nebel','Mond','Wald','Dünen'];
const ENDINGS=['ling','dorn','feder','zahn','glut','wisp','pfote','horn','stern','floss','wirbel','blitz','drache','golem','schweif','geist'];
const TYPES_LIST=Object.keys(TYPES);
const TYPE_MOVE={normal:'stoss',feuer:'glut',wasser:'spritzer',pflanze:'ranke',elektro:'funken',gestein:'stein',flug:'fluegel',geist:'spuk'};
const originals=Object.entries(SPEC);
for(let region=0;region<12;region++)for(let i=0;i<16;i++){
 const base=originals[(i+region*3)%originals.length][1],id='form_'+region+'_'+i;
 const type=TYPES_LIST[(region+i)%TYPES_LIST.length],stage=i%3;
 const tint=new THREE.Color(base.color);tint.offsetHSL(((region+1)%7)*.045-.12,.08,(stage-1)*.09);
 const evo=i<14&&stage!==2?['form_'+region+'_'+(i+1),17+stage*15+region]:undefined;
 SPEC[id]={name:REGIONS[region]+ENDINGS[i],type,color:tint.getHex(),hp:base.hp+(region%4)*3+stage*20,atk:base.atk+(i%4)*2+stage*13,def:base.def+(i%5)*2+stage*12,speed:base.speed+(region%3)*3+stage*9,catch:Math.max(.12,base.catch-(region%4)*.025-stage*.1),moves:['stoss',type==='normal'?'hieb':TYPE_MOVE[type]],evo,bio:'Ein Wesen aus der Region '+REGIONS[region]+'. Seine Form entwickelt sich mit seiner Umgebung.'};
}
const MOVES={stoss:['Kugelstoß','normal',40],hieb:['Wirbelhieb','normal',65],funken:['Funkenschlag','elektro',48],glut:['Glutfunken','feuer',48],ranke:['Rankenhieb','pflanze',48],spritzer:['Wasserperlen','wasser',48],fluegel:['Windstoß','flug',48],stein:['Steinwurf','gestein',48],spuk:['Spukhauch','geist',48]};
const ADV={feuer:{pflanze:2,wasser:.5,gestein:.5},wasser:{feuer:2,gestein:2,pflanze:.5},pflanze:{wasser:2,gestein:2,feuer:.5,flug:.5},elektro:{wasser:2,flug:2,pflanze:.5},gestein:{feuer:2,flug:2},flug:{pflanze:2,gestein:.5},geist:{geist:2,normal:0},normal:{geist:0}};
const GYMS=[['Fels-Fiete','felsling',8],['Perla','quappi',11],['Käpt’n Volt','blitzi',14],['Blüte','samenling',17],['Forscher Nilo','kaeferli',19],['Jette vom Team Funke','knister',21],['Kapitän Rumo','glutzahn',24],['Meisterin Aurelia','blitzor',27],['Kira vom Nebelpass','geisterchen',30],['Rokko vom Gletscher','panzerlon',32],['Taro vom Waldturm','bluetling',34],['Mira vom Sturmfeld','knister',36],['Nona der Kristallhöhle','felsling',38],['Lio der Mondbucht','funkli',40],['Sora vom Sonnenplateau','glutdrach',42],['Großmeisterin Aurelia','blitzor',45]];
const SAVE='easygames.taschi.eight-lights.v1',SELECTED=SAVE+'.selected';
let slot=Number(localStorage.getItem(SELECTED)||1);if(![1,2,3].includes(slot))slot=1;
const saveKey=()=>SAVE+'.slot'+slot;
const blankSave=()=>({team:[],box:[],badges:0,balls:8,potions:3,coins:120,dex:{},x:0,z:6,wins:0});
function clean(s){if(!s||!Array.isArray(s.team))return null;s.team=s.team.filter(m=>SPEC[m.id]&&Number.isFinite(m.lv)&&Number.isFinite(m.hp)).slice(0,6);s.box=(s.box||[]).filter(m=>SPEC[m.id]).slice(0,100);s.badges=Math.max(0,Math.min(16,Number(s.badges)||0));s.coins=Math.max(0,Math.min(999999,Number(s.coins??120)||0));s.balls=Math.max(0,Number(s.balls)||0);s.potions=Math.max(0,Number(s.potions)||0);s.dex=s.dex||{};s.x=Number.isFinite(s.x)?Math.max(-58,Math.min(58,s.x)):0;s.z=Number.isFinite(s.z)?Math.max(-58,Math.min(58,s.z)):6;return s;}
let save;try{save=clean(JSON.parse(localStorage.getItem(saveKey())||(slot===1?localStorage.getItem(SAVE):null)))}catch{}
save ||= blankSave();
const maxHp=m=>Math.floor(SPEC[m.id].hp*2*m.lv/100)+m.lv+10;
const make=(id,lv)=>{const m={id,lv,xp:0,hp:1};m.hp=maxHp(m);return m};
const persist=()=>{try{localStorage.setItem(saveKey(),JSON.stringify(save))}catch{}};
let active=null,locked=true,near=null,combat=null,steps=0,toastUntil=0,caveSteps={},insideCave=null,booted=false;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x83b7d4);scene.fog=new THREE.FogExp2(0xb4e1e7,.009);
const camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.1,190);const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.35:1.7));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.8;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe9f9ff,0x7b9864,.85));const sun=new THREE.DirectionalLight(0xfff3d3,1.12);sun.position.set(28,46,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-75;sun.shadow.camera.right=75;sun.shadow.camera.top=75;sun.shadow.camera.bottom=-75;scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const green=mat(0x50965a),path=mat(0xc8a77e),stone=mat(0xc2c1b4),roof=mat(0xec735e),wood=mat(0x836248);
function mesh(parent,geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(parent,x,y,z,w,h,d,m){return mesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z)}
function ball(parent,x,y,z,r,m){return mesh(parent,new THREE.SphereGeometry(r,14,10),m,x,y,z)}
function cylinder(parent,x,y,z,r1,r2,h,m){return mesh(parent,new THREE.CylinderGeometry(r1,r2,h,9),m,x,y,z)}

// Subtle hand-generated repeating surface textures; no external image assets.
function tileTexture(kind){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle=kind==='grass'?'#6ca56d':'#c4ab83';ctx.fillRect(0,0,128,128);
 let seed=kind==='grass'?71:19;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<520;i++){
  const x=random()*128,y=random()*128,r=kind==='grass'?random()*2+1:random()*3+1;
  ctx.fillStyle=kind==='grass'?(random()>.5?'rgba(35,91,58,.22)':'rgba(217,242,174,.28)'):(random()>.5?'rgba(110,84,61,.15)':'rgba(253,229,182,.28)');
  ctx.fillRect(x,y,r*2,r);
 }
 const tx=new THREE.CanvasTexture(canvas);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(kind==='grass'?32:18,kind==='grass'?32:18);
 tx.colorSpace=THREE.SRGBColorSpace;return tx;
}
green.color.setHex(0xffffff);green.map=tileTexture('grass');green.needsUpdate=true;
path.color.setHex(0xffffff);path.map=tileTexture('path');path.needsUpdate=true;

const ground=mesh(scene,new THREE.PlaneGeometry(132,132),green);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
const trail=mesh(scene,new THREE.PlaneGeometry(9,124),path);trail.rotation.x=-Math.PI/2;trail.position.y=.012;
const cross=mesh(scene,new THREE.PlaneGeometry(117,8),path);cross.rotation.x=-Math.PI/2;cross.position.y=.014;cross.position.z=-18;
const colliders=[];function solid(x,z,r){colliders.push({x,z,r})}
function tree(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(g,0,1.3*s,0,.35*s,.5*s,2.6*s,wood);ball(g,0,3.2*s,0,1.65*s,mat([0x389c64,0x56a34c,0x65b95a][Math.floor(rand(0,3))]));ball(g,-1*s,2.7*s,.4*s,1.15*s,mat(0x62b467));solid(x,z,1.4*s)}
for(let i=0;i<90;i++){const x=rand(-60,60),z=rand(-60,60);if(Math.abs(x)<8||Math.abs(z+18)<7||Math.hypot(x-14,z-10)<12||Math.hypot(x+18,z+32)<13)continue;tree(x,z,rand(.7,1.3))}
function house(x,z,label,color){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(g,0,2,0,8,4,7,mat(color));const top=mesh(g,new THREE.ConeGeometry(6.6,3,4),roof,0,5.4,0);top.rotation.y=Math.PI/4;box(g,0,1,3.56,1.6,2,0.15,wood);for(let dx of [-2.7,2.7])box(g,dx,2.5,3.57,1.1,1.3,.2,mat(0x6fcce8));solid(x,z,5);return {x,z,label}};
const places=[house(14,10,'Professor Ulmes Labor',0xf8e5c2),house(-18,10,'Heilhaus',0xf4a9b7),house(14,-32,'Fangladen',0x91cce1)];
// Arena monuments: 8 stations around the valley, visible and approachable.
const gyms=[];GYMS.forEach((g,i)=>{const x=-51+(i%4)*34,z=-51+Math.floor(i/4)*31;const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);cylinder(group,0,.8,0,2.6,3.2,1.6,stone);cylinder(group,0,3,0,1.1,1.7,3.5,mat([0x9199b5,0x66addf,0xe4b95c,0x8cc77b][i%4]));ball(group,0,5,0,1.25,mat(0xffd96a,.3));gyms.push({x,z,label:g[0],gym:i});townLabel((i+1)+'. Siegel',x,z,7)});
// Additional villages and cave landscapes; cave sites are explorable above-ground rock caverns.


const routeTrainers=[];
const trainSpecs=[
 ['Jule',-8,31,'flatterling',7],['Finn',8,27,'quappi',9],
 ['Lea',-9,-4,'kaeferli',12],['Ben',7,-7,'felsling',15],
 ['Tina',-9,-28,'knister',19],['Oskar',8,-44,'funkli',23],
 ['Jara',-20,-13,'geisterchen',27],['Nils',23,-14,'schlummi',32]
];
for(let i=0;i<trainSpecs.length;i++){
 const [name,x,z,id,lv]=trainSpecs[i],t={name,x,z,id,lv,trainer:i};
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 box(g,0,.88,0,.75,.95,.45,mat([0x3e78ad,0xc8777b,0x54a37a,0xa883c5][i%4]));
 ball(g,0,1.72,0,.43,mat(0xf1be9b));
 const cap=ball(g,0,2.08,0,.47,mat([0x355ea0,0xb34d5b][i%2]));cap.scale.y=.27;
 for(let side of [-1,1]){box(g,side*.24,.23,0,.26,.46,.29,mat(0x36415d));box(g,side*.54,1.02,0,.21,.69,.24,mat(0xefbc9a))}
 ball(g,0,2.65,0,.14,mat(0xffd45f));
 routeTrainers.push(t);
}
function approachTrainer(t){
 save.trainers ||= {};
 if(save.trainers[t.trainer]){dialog('Trainer '+t.name,'„Unser Duell war klasse! Viel Glück auf deiner Reise.“',choice());return}
 dialog('Trainer '+t.name,'„Hey, ein anderer Taschi-Freund! Lust auf ein ehrliches Duell? Meine Taschis sind Level '+t.lv+'.“',[
 ['Herausforderung annehmen',()=>battle(make(t.id,t.lv),false,t.trainer)],
 ['Später',close]
 ]);
}

const villageTasks={
 'Moosbach':{type:'pflanze',person:'Waldhüterin Mira',story:'Die Pflanzen-Taschis bewahren unsere Waldwege. Zeige mir zwei verschiedene Pflanzen-Freunde.'},
 'Korallendorf':{type:'wasser',person:'Fischerin Nele',story:'Das Meer erzählt Geschichten. Entdecke und fange zwei verschiedene Wasser-Taschis.'},
 'Nebelau':{type:'geist',person:'Forscherin Noa',story:'Hier schweben sanfte Geister herum. Bringe zwei verschiedene Geist-Taschis mit.'},
 'Sternental':{type:'feuer',person:'Schmiedin Sira',story:'Unser Schmiedefeuer lebt von Mut. Zeige mir zwei verschiedene Feuer-Taschis.'},
 'Kristallhain':{type:'gestein',person:'Bergführer Bruno',story:'Die Kristalle summen. Finde und fange zwei verschiedene Fels-Taschis.'},
 'Winddorf':{type:'flug',person:'Pilotin Liv',story:'Ich möchte zwei Flug-Taschis sehen, die über den Hügeln leben.'}
};
function villageVisit(v){
 const task=villageTasks[v.name],n=Object.keys(save.dex).filter(id=>save.dex[id]===2&&SPEC[id]?.type===task.type).length;
 save.quests ||= {};const completed=!!save.quests[v.name];
 const options=[
  ['Im Dorf ausruhen',()=>{save.team.forEach(m=>m.hp=maxHp(m));close();toast('Deine Taschis sind ausgeruht!')}],
  ['Wiese erkunden',()=>{close();findWild(task.type)}],
 ];
 if(!completed&&n>=2)options.unshift(['Aufgabe abschließen',()=>{save.quests[v.name]=true;save.balls+=8;save.potions+=4;stats();dialog('Nebenaufgabe erfüllt!',task.person+' schenkt dir 8 Taschibälle und 4 Tränke. Danke für deine Hilfe!',choice())}]);
 options.push(['Weiterziehen',close]);
 dialog('Willkommen in '+v.name,'<p><b>'+task.person+'</b>: '+task.story+'</p><p>Fangfortschritt: '+n+'/2 · '+(completed?'✓ Auftrag abgeschlossen':'Belohnung: 8 Taschibälle, 4 Tränke')+'</p>',options);
}
function townLabel(title,x,z,height=4){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 ctx.fillStyle='#123148dd';ctx.beginPath();ctx.roundRect(12,18,488,92,21);ctx.fill();
 ctx.strokeStyle='#fff7e0';ctx.lineWidth=5;ctx.stroke();
 ctx.font='bold 39px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff9e4';ctx.fillText(title,256,64,460);
 const tex=new THREE.CanvasTexture(canvas);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
 sprite.position.set(x,height,z);sprite.scale.set(7.8,1.95,1);scene.add(sprite);
}

const villages=[
 {name:'Moosbach',x:-37,z:13,c:0xa4d89d},
 {name:'Korallendorf',x:36,z:25,c:0x86c9df},
 {name:'Nebelau',x:-37,z:-24,c:0xbea6db},
 {name:'Sternental',x:36,z:-24,c:0xf9bf91},
 {name:'Kristallhain',x:-8,z:41,c:0x9adcd5},
 {name:'Winddorf',x:9,z:-50,c:0xe0cc96}
];
for(const v of villages){townLabel(v.name,v.x,v.z,7);
 const citizen=new THREE.Group();citizen.position.set(v.x+3.1,0,v.z-4);scene.add(citizen);
 box(citizen,0,.9,0,.78,.95,.47,mat(v.c));
 ball(citizen,0,1.78,0,.41,mat(0xe6b891));
 const hair=ball(citizen,0,2.1,-.08,.41,mat(0x53372d));hair.scale.y=.4;
 for(const side of [-1,1]){box(citizen,side*.25,.24,0,.26,.5,.3,mat(0x364a63));box(citizen,side*.56,1,0,.21,.7,.25,mat(0xe6b891))}

 for(let i=0;i<3;i++){
 const h=new THREE.Group();h.position.set(v.x+(i-1)*5,0,v.z+(i%2)*5);scene.add(h);
 box(h,0,1.25,0,3.7,2.5,3.5,mat(v.c));const roofMesh=mesh(h,new THREE.ConeGeometry(3.25,1.9,4),roof,0,3.3,0);roofMesh.rotation.y=Math.PI/4;
 box(h,0,.85,1.8,.8,1.6,.1,wood);
 }
 const banner=new THREE.Group();banner.position.set(v.x,0,v.z-6);scene.add(banner);cylinder(banner,0,2,0,.12,.16,4,wood);box(banner,1.1,3.5,0,2,.65,.1,mat(v.c));
}
const caves=[
 {name:'Flüsterhöhle',x:-51,z:0}, {name:'Bernsteingrotte',x:49,z:0},
 {name:'Kristallgrotte',x:-52,z:49},{name:'Mondhöhle',x:52,z:48}
];
for(const cave of caves){townLabel(cave.name,cave.x,cave.z,7);
 const group=new THREE.Group();group.position.set(cave.x,0,cave.z);scene.add(group);
 for(let j=0;j<9;j++){const angle=j/9*Math.PI*2;const rr=4.4+(j%3)*.35;
 const rock=mesh(group,new THREE.DodecahedronGeometry(2.5+(j%3)*.55,0),mat(j%2?0x728797:0x536c75),Math.cos(angle)*rr,2,Math.sin(angle)*rr);rock.rotation.set(j*.4,j*.6,j*.2)}
 for(let j=0;j<6;j++){
 const x=(j%3-1)*2.4,z=Math.floor(j/3)*2.4-1.6;
 const crystal=mesh(group,new THREE.ConeGeometry(.55,2+j%3,5),mat([0x71e8da,0x8da7ff,0xffd18c][j%3],.2),x,1,z);crystal.rotation.z=.2;
 }
}

const dungeon=new THREE.Group();dungeon.position.set(300,0,0);scene.add(dungeon);
const caveFloor=mesh(dungeon,new THREE.PlaneGeometry(65,55),mat(0x5a6875));caveFloor.rotation.x=-Math.PI/2;caveFloor.position.y=.02;
const caveWallMat=mat(0x394d60),caveCrystalMat=mat(0x73dded,.25);
for(const z of [-27,27])box(dungeon,0,4,z,65,8,2,caveWallMat);
for(const x of [-32,32])box(dungeon,x,4,0,2,8,55,caveWallMat);
for(const [x,z] of [[-18,-13],[-10,-5],[11,-14],[20,5],[-21,12],[3,13]]){
 const pillar=mesh(dungeon,new THREE.DodecahedronGeometry(3.3),caveWallMat,x,3,z);pillar.scale.y=1.5;
}
const crystalLocations=[[-14,13],[0,-18],[15,12]];
const caveCrystals=crystalLocations.map(([x,z],i)=>{
 const group=new THREE.Group();group.position.set(x,0,z);dungeon.add(group);
 cylinder(group,0,.45,0,1.3,1.6,.9,caveWallMat);
 const crystal=mesh(group,new THREE.OctahedronGeometry(1.5+i*.2),caveCrystalMat,0,2.1,0);
 crystal.rotation.z=.14;return crystal;
});
const caveExit=new THREE.Group();caveExit.position.set(0,0,23);dungeon.add(caveExit);
box(caveExit,0,2.5,0,5,5,.2,mat(0x9ed7b7));
const dungeonLamp=new THREE.PointLight(0x87d9ff,65,58);dungeonLamp.position.set(0,6,0);dungeon.add(dungeonLamp);
function caveEnter(c){
 insideCave=c;player.position.set(300,0,20);
 scene.background.setHex(0x151b33);
 scene.fog=new THREE.FogExp2(0x263149,.014);
 caveCrystalMat.color.setHex([0x73dded,0xffc072,0xae96fa,0x98e5cf][caves.indexOf(c)]||0x73dded);
 close();toast(c.name+' – finde die drei Kristalle und den Ausgang.');
}
function caveLeave(){
 if(!insideCave)return;const old=insideCave;insideCave=null;
 player.position.set(old.x+4,0,old.z+5);
 scene.background.setHex(0x83b7d4);scene.fog=new THREE.FogExp2(0xb4e1e7,.009);
 save.x=player.position.x;save.z=player.position.z;stats();toast('Du hast '+old.name+' verlassen.');
}
function caveInteract(target){
 if(target.exit){caveLeave();return}
 if(target.crystal!==undefined){
  const id=insideCave.name+':'+target.crystal;save.crystals ||= {};
  if(save.crystals[id]){toast('Dieser Kristall wurde bereits gefunden.');return}
  save.crystals[id]=true;
  save.balls+=3;save.potions+=1;stats();
  dialog('Kristall geborgen!','Du findest drei Taschibälle und einen Trank. Ein Höhlen-Taschi taucht auf!',[
  ['Kampf beginnen',()=>{close();findWild()}],['Weiter erkunden',close]]);
 }
}

// Two instanced meshes replace hundreds of separate draw calls on mobile GPUs.
const flowerCount=300,stemInstances=new THREE.InstancedMesh(new THREE.CylinderGeometry(.052,.06,.44,5),mat(0x418a49),flowerCount);
const flowerInstances=new THREE.InstancedMesh(new THREE.SphereGeometry(.18,7,5),mat(0xffffff),flowerCount);
const flowerColors=[0xffdc72,0xfc9aa3,0xffffff,0xbc94ee],transform=new THREE.Object3D();
for(let i=0;i<flowerCount;i++){
 let x=rand(-60,60),z=rand(-60,60);if(Math.abs(x)<5)x+=x<0?-6:6;if(Math.abs(z+18)<4)z+=z<-18?-5:5;
 transform.position.set(x,.22,z);transform.updateMatrix();stemInstances.setMatrixAt(i,transform.matrix);
 transform.position.y=.48;transform.updateMatrix();flowerInstances.setMatrixAt(i,transform.matrix);
 flowerInstances.setColorAt(i,new THREE.Color(flowerColors[i%4]));
}
stemInstances.instanceMatrix.needsUpdate=true;flowerInstances.instanceMatrix.needsUpdate=true;scene.add(stemInstances,flowerInstances);
const grass=[];for(const [x,z] of [[-29,-9],[30,-9],[-30,25],[31,28],[-8,-42]]){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);for(let i=0;i<42;i++){const a=rand(-7,7),b=rand(-7,7);const blade=mesh(g,new THREE.ConeGeometry(.22,rand(.7,1.4),3),mat(0x2e9e58),a,.5,b);blade.rotation.y=rand(0,6)}grass.push({x,z,r:8,type:['pflanze','wasser','gestein','feuer','flug'][grass.length]})}
function creature(id,scale=1){const s=SPEC[id],g=new THREE.Group(),main=mat(s.color,.77),belly=mat(0xf6eee0),dark=mat(0x252d42,.32);const form=s.type;const body=ball(g,0,.84,0,.76,main);body.scale.set(1,1.12,.82);ball(g,0,1.77,.06,.62,main);ball(g,-.23,1.87,.58,.085,dark);ball(g,.23,1.87,.58,.085,dark);ball(g,0,1.58,.63,.105,belly);for(const xx of [-.49,.49]){ball(g,xx,.38,.3,.25,main);ball(g,xx,2.34,-.01,.27,main)}if(form==='pflanze'){const leaf=mesh(g,new THREE.ConeGeometry(.34,.8,5),mat(0x288e57),0,2.6,0);leaf.rotation.z=.4}else if(form==='feuer'){mesh(g,new THREE.ConeGeometry(.35,.8,6),mat(0xffe078),0,2.61,0)}else if(form==='elektro'){for(let xx of [-.75,.75])mesh(g,new THREE.ConeGeometry(.23,.8,4),mat(0xfff7a1),xx,2.42,0)}else if(form==='wasser'){ball(g,0,2.45,0,.3,mat(0x75dafa))}else if(form==='flug'){for(let xx of [-1,1]){const wing=ball(g,xx*.77,1.1,0,.55,main);wing.scale.set(1.3,.3,.6)}}else if(form==='gestein'){body.scale.set(1.2,.94,1);for(let xx of [-.65,.65])ball(g,xx,2.25,0,.34,mat(0xbcc0c8))}else if(form==='geist'){g.position.y=.38;body.scale.set(1,1.3,.9)}
// Deterministic modular silhouette traits make regional forms visually distinct.
let seed=0;for(let i=0;i<id.length;i++)seed=(seed*31+id.charCodeAt(i))>>>0;
const trait=(n)=>((seed>>((n*5)%23))&31)/31;
const accent=mat(new THREE.Color(s.color).offsetHSL(.14,.1,.15));
const appendage=trait(0);
if(appendage<.25){for(let side of [-1,1]){const ear=mesh(g,new THREE.ConeGeometry(.21+trait(1)*.2,.65+trait(2)*.65,5),accent,side*.52,2.46,0);ear.rotation.z=side*.22}}
else if(appendage<.5){for(let side of [-1,1]){const horn=mesh(g,new THREE.ConeGeometry(.15,.8+trait(3)*.7,5),accent,side*.38,2.49,-.1);horn.rotation.z=side*.15}}
else if(appendage<.75){for(let side of [-1,1]){const fin=ball(g,side*.83,1.3,-.15,.41,accent);fin.scale.set(1.4,.28,.8)}}
else {ball(g,0,2.53,-.1,.35,accent);mesh(g,new THREE.ConeGeometry(.3,.55,5),main,0,2.88,-.15)}
const tail=ball(g,0,.82,-.9,.28+trait(4)*.4,accent);tail.scale.set(1.4,.7,1.4);
if(trait(5)>.43){for(let n=0;n<3;n++){const plate=mesh(g,new THREE.ConeGeometry(.15,.38+trait(6)*.25,4),accent,0,1.2+n*.32,-.68);plate.rotation.x=-.5}}
const eyeGlow=mat(0xffffff,.15);
if(trait(7)>.67){ball(g,-.23,1.89,.65,.032,eyeGlow);ball(g,.23,1.89,.65,.032,eyeGlow)}
g.scale.setScalar(scale);return g}

const battleStage=new THREE.Group();battleStage.position.set(180,0,0);scene.add(battleStage);battleStage.visible=false;
const stageGround=mesh(battleStage,new THREE.CylinderGeometry(11,11,.5,32),mat(0x6ca77c));stageGround.position.y=-.25;
const circleA=mesh(battleStage,new THREE.CylinderGeometry(2.7,2.7,.12,32),mat(0xd3ead5),-3,.04,1.3);
const circleB=mesh(battleStage,new THREE.CylinderGeometry(2.7,2.7,.12,32),mat(0xd3ead5),3,.04,-2);
const battleFriends=new THREE.Group(),battleFoes=new THREE.Group();
battleFriends.position.set(-3,0,1.3);battleFoes.position.set(3,0,-2);
battleStage.add(battleFriends,battleFoes);
function updateBattleScene(){
 battleFriends.clear();battleFoes.clear();
 if(!combat){battleStage.visible=false;return}
 battleStage.visible=true;
 const ally=first();
 if(ally){const model=creature(ally.id,1.55);model.rotation.y=2.35;battleFriends.add(model)}
 const rival=creature(combat.enemy.id,1.5);rival.rotation.y=-.55;battleFoes.add(rival);
}

const player=new THREE.Group();scene.add(player);ball(player,0,1.35,0,.43,mat(0xf2caad));const torso=box(player,0,.84,0,.7,.9,.4,mat(0x294c82));box(player,-.21,.22,0,.25,.47,.29,mat(0x333f62));box(player,.21,.22,0,.25,.47,.29,mat(0x333f62));const hat=ball(player,0,1.72,0,.46,mat(0xd85f4a));hat.scale.y=.3;player.position.set(save.x,0,save.z);
const follower=new THREE.Group();scene.add(follower);let currentFollower=null;function updateFollower(){follower.clear();if(save.team.length){currentFollower=creature(save.team[0].id,.6);follower.add(currentFollower)}}updateFollower();
function stats(){ $('badge').textContent='✦ '+save.badges+'/16';$('count').textContent='◉ '+(save.team.length+save.box.length);$('coins').textContent='★ '+save.coins;$('location').textContent=save.badges===16?'Taschi-Meister':'Sonnenhain';persist()}
function toast(t,sec=3){$('message').textContent=t;$('message').style.display='block';toastUntil=performance.now()+sec*1000}
function dialog(title,desc,buttons){locked=true;$('panel').classList.remove('battle');$('title').textContent=title;$('desc').innerHTML=desc;$('options').replaceChildren();for(const [label,fn,disabled] of buttons){const b=document.createElement('button');b.className='option';b.textContent=label;b.disabled=!!disabled;b.addEventListener('click',fn);$('options').append(b)}$('panel').classList.add('show')}
function close(){locked=!booted;$('panel').classList.remove('show','battle');combat=null;updateBattleScene();stats()}
function choice(){return [['Weiter',close]]}
function pct(m){return Math.max(0,Math.min(100,100*m.hp/maxHp(m)))}
function hpbar(m){return '<div class="hp"><span style="width:'+pct(m)+'%"></span></div>'}
function summary(m){const s=SPEC[m.id];return '<b>'+TYPES[s.type]+' '+s.name+'</b> · Lv '+m.lv+' · '+m.hp+'/'+maxHp(m)+' KP'+hpbar(m)}
function first(){return save.team.find(m=>m.hp>0)}
function start(){dialog('Kapitel 1 · Der Ruf der Lichter','<p>Ein sanfter Lichtstrahl fällt über Sonnenhain. Professor Ulme wartet vor seinem Labor: „Unsere sechzehn Lichtquellen verlieren ihre Kraft. Ich brauche deine Hilfe!“</p><p>Deine Reise beginnt mit einem treuen Taschi an deiner Seite.</p>',[['Professor Ulme folgen',chooseStarter]])}
function chooseStarter(){dialog('Professor Ulmes Labor','<p>„Jedes Taschi ist etwas Besonderes. Entscheide mit dem Herzen! Du kannst später viele weitere Freunde finden.“</p>',[['🔥 Glutzahn · Feuer',()=>starter('glutzahn')],['💧 Plätscherchen · Wasser',()=>starter('plaetscher')],['🌱 Samenling · Pflanze',()=>starter('samenling')]])}
function starter(id){save.team.push(make(id,5));save.dex[id]=2;updateFollower();stats();dialog('Dein Abenteuer beginnt!', '<p>'+SPEC[id].name+' begleitet dich! Bewege dich zum hohen Gras, entdecke Taschis und besiege die 16 Arenen. Im Heilhaus werden deine Freunde geheilt.</p>',choice())}
const wild=['flatterling','felsling','geisterchen','quappi','kaeferli','knister','funkli','schlummi','fellino','blitzi','glutzahn','samenling','plaetscher'];
function findWild(habitat=null){if(!first()){toast('Dein Team braucht Heilung! Suche das Heilhaus.');return}const choices=habitat?Object.keys(SPEC).filter(id=>SPEC[id].type===habitat):Object.keys(SPEC);const pool=(Math.random()<.48&&habitat===null)?wild:choices;const id=pool[Math.floor(rand(0,pool.length))],lv=Math.max(2,Math.min(48,Math.floor(rand(3,8))+save.badges*3));battle(make(id,lv),false)}
function battle(enemy,isGym=false,trainerId=null){const me=first();if(!me){toast('Kein kampffähiges Taschi');return}save.dex[enemy.id] ||=1;const queue=isGym?Array.from({length:isGym<5?1:isGym<11?2:3},(_,i)=>make(wild[(isGym*3+i)%wild.length],Math.max(3,enemy.lv-2+i))):[];combat={enemy,isGym,turn:0,queue,trainerId};updateBattleScene();battleMenu('Ein '+SPEC[enemy.id].name+' erscheint!')}
function battleMenu(log='Was soll dein Taschi tun?'){
 const c=combat;if(!c)return;
 const me=first();
 if(!me){
  combat=null;updateBattleScene();save.team.forEach(m=>m.hp=maxHp(m));
  player.position.set(-18,0,16);save.x=-18;save.z=16;stats();
  dialog('Im Heilhaus erwacht','Dein Team wurde geheilt. Versuche es erneut!',choice());return;
 }
 const e=c.enemy;
 const banner='<p>'+log+'</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div>'+summary(me)+'</div><div>'+summary(e)+'</div></div>';
 dialog(c.isGym?'Arena-Herausforderung':'Wilde Begegnung',banner,[
 ['⚔️ Kampf',()=>attackMenu()],
 ['◉ Fangbeutel',()=>bagMenu()],
 ['🔁 Taschis',battleSwitch],
 ['🏃 Flucht',()=>{if(c.isGym){battleMenu('Aus einem Arenakampf kannst du nicht fliehen.');return}close()}]
 ]);
 $('panel').classList.add('battle');
}
function attackMenu(){
 const me=first();if(!me||!combat)return;
 dialog('Attacke auswählen','<p>'+SPEC[me.id].name+' · Lv '+me.lv+'</p>',[
 ...SPEC[me.id].moves.map(id=>[TYPES[MOVES[id][1]]+' '+MOVES[id][0]+' · Stärke '+MOVES[id][2],()=>attack(id)]),
 ['↩ Zurück',()=>battleMenu()]
 ]);$('panel').classList.add('battle');
}
function bagMenu(){
 if(!combat)return;
 dialog('Fangbeutel','<p>Setze deine Ausrüstung im Kampf ein.</p>',[
 ['◉ Taschiball · '+save.balls,capture,save.balls===0||!!combat.isGym],
 ['🧪 Trank · '+save.potions,potion,save.potions===0],
 ['↩ Zurück',()=>battleMenu()]
 ]);$('panel').classList.add('battle');
}
function damage(a,d,move){const [name,type,power]=MOVES[move],sa=SPEC[a.id],sd=SPEC[d.id];const mul=ADV[type]?.[sd.type]??1;return Math.max(mul===0?0:1,Math.floor(((2*a.lv/5+2)*power*(sa.atk+a.lv/2)/(sd.def+d.lv/2)/50+2)*(type===sa.type?1.4:1)*mul*rand(.85,1)))}
function battleSwitch(){
 if(!combat)return;
 dialog('Taschi wechseln','Wähle einen kampffähigen Begleiter. Der Gegner greift beim Wechsel an.',[
 ...save.team.map((m,i)=>[SPEC[m.id].name+' · '+m.hp+'/'+maxHp(m)+' KP',()=>{
  save.team.splice(i,1);save.team.unshift(m);updateFollower();updateBattleScene();enemyTurn(SPEC[m.id].name+' ist jetzt im Kampf!');
 },m.hp<=0||i===0]),
 ['Zurück',()=>battleMenu()]
 ]);
 $('panel').classList.add('battle');
}
function enemyTurn(log){const c=combat;if(!c)return;const me=first(),enemy=c.enemy,id=SPEC[enemy.id].moves[Math.floor(rand(0,SPEC[enemy.id].moves.length))];if(me){me.hp=Math.max(0,me.hp-damage(enemy,me,id));log+=' '+SPEC[enemy.id].name+' nutzt '+MOVES[id][0]+'!';if(me.hp===0){log+=' '+SPEC[me.id].name+' ist erschöpft!';if(!first()){dialog('Kampf verloren',log+'<p>Heile deine Taschis im Heilhaus.</p>',choice());combat=null;updateBattleScene();return}updateFollower()}}persist();updateBattleScene();battleMenu(log)}
function attack(id){const c=combat;if(!c)return;audioTone(260+MOVES[id][2]*4,.18,.05,'sawtooth');const me=first(),e=c.enemy;const dmg=damage(me,e,id);e.hp=Math.max(0,e.hp-dmg);const log=SPEC[me.id].name+' nutzt '+MOVES[id][0]+'! '+dmg+' Schaden.';if(e.hp<=0){win(log);return}enemyTurn(log)}
function win(log){audioTone(784,.3,.07);const c=combat,me=first();const xp=35+c.enemy.lv*24;save.coins+=10+Math.floor(c.enemy.lv/2);me.xp+=xp;let extra=' +'+xp+' EP.';while(me.xp>=me.lv*me.lv*.9+12&&me.lv<60){me.xp-=Math.floor(me.lv*me.lv*.9+12);me.lv++;const old=maxHp({...me,lv:me.lv-1});me.hp+=maxHp(me)-old;extra+=' Level '+me.lv+'!';const evo=SPEC[me.id].evo;if(evo&&me.lv>=evo[1]){me.id=evo[0];save.dex[me.id]=2;extra+=' Entwicklung zu '+SPEC[me.id].name+'!'}}if(c.queue?.length){const next=c.queue.shift();c.enemy=next;updateBattleScene();persist();battleMenu(log+' '+SPEC[me.id].name+' bekommt '+xp+' EP. '+(c.queue.length+1)+' gegnerische Taschis warten noch.');return}if(c.trainerId!==null){save.trainers ||= {};save.trainers[c.trainerId]=1;save.coins+=70;extra+=' Trainerduell gewonnen! ★70';}if(c.isGym){save.team.forEach(m=>m.hp=Math.max(m.hp,Math.round(maxHp(m)*.7)));save.badges=Math.max(save.badges,c.isGym);save.balls+=3;save.potions+=1;save.coins+=65+c.enemy.lv*3;extra+=' Licht-Siegel '+save.badges+'/16 verdient!';if(save.badges===16)extra+=' Du bist Taschi-Meister! Die Reise ist abgeschlossen, freie Erkundung bleibt möglich.';if(save.badges%4===0)extra+=' Ein neues Storykapitel wurde freigeschaltet!'}save.wins++;updateFollower();combat=null;updateBattleScene();stats();dialog('Gewonnen!','<p>'+log+extra+'</p>',c.isGym&&save.badges%4===0?[['Neues Storykapitel',chapterDialog],['Weiterspielen',close]]:choice())}
function capture(){audioTone(510,.12,.06);const c=combat;if(!c||c.isGym||save.balls<=0)return;save.balls--;const e=c.enemy;const rate=Math.min(.94,SPEC[e.id].catch*(.65+1.5*(1-e.hp/maxHp(e))));if(Math.random()<rate){save.dex[e.id]=2;if(save.team.length<6)save.team.push(e);else save.box.push(e);combat=null;updateFollower();updateBattleScene();stats();dialog('Gefangen!','<p>'+SPEC[e.id].name+' ist jetzt dein Freund! '+(save.team.includes(e)?'Im Team.':'Im Lager.')+'</p>',choice())}else enemyTurn('Der Taschiball wackelt … oh nein, entwischt!')}
function potion(){if(!combat||save.potions<1)return;const m=first();save.potions--;m.hp=Math.min(maxHp(m),m.hp+35);enemyTurn(SPEC[m.id].name+' erhält bis zu 35 KP!')}
function team(){dialog('Dein Taschi-Team','<p>Tippe auf ein Taschi, um es nach vorne zu stellen. Maximale Teamgröße: sechs.</p>'+save.team.map((m,i)=>'<p>'+(i?'':'⭐ ')+summary(m)+'</p>').join('')+'<p>Lager: '+save.box.length+' · Tränke: '+save.potions+' · Bälle: '+save.balls+'</p>',[...save.team.map((m,i)=>[SPEC[m.id].name+' führen',()=>{save.team.splice(i,1);save.team.unshift(m);updateFollower();close()}]),['Lager verwalten',storage],['Abenteuerbuch',journalView],['Reisekarte',mapView],['Schließen',close]])}
function storage(){dialog('Taschi-Lager','<p>Hier kannst du Team-Taschis und gelagerte Taschis tauschen.</p>',[...save.box.map((m,i)=>['Aufnehmen: '+SPEC[m.id].name,()=>{if(save.team.length>=6){toast('Team ist voll');return}save.box.splice(i,1);save.team.push(m);updateFollower();storage()}]),...save.team.map((m,i)=>['Einlagern: '+SPEC[m.id].name,()=>{if(save.team.length<2){toast('Behalte mindestens ein Taschi');return}save.team.splice(i,1);save.box.push(m);updateFollower();storage()}]),['Zurück',team]])}
function dex(){dialog('Taschidex','<p>'+Object.keys(SPEC).length+' Arten: Entdecke regionale Taschis in Wiesen, Dörfern, Bergen und Höhlen.</p>'+Object.entries(SPEC).map(([id,s])=>'<div style="padding:7px;border-bottom:1px solid #ccd">'+(save.dex[id]?TYPES[s.type]+' '+s.name+(save.dex[id]===2?' ✓':' · gesehen'):'???')+'</div>').join(''),choice())}
function enterCave(c){const stage=caveSteps[c.name]||0;dialog(c.name,'<p>Vor dir liegt ein begehbares Höhlensystem mit drei Kristallen, wilden Taschis und einem Ausgang.</p>',[['Höhle betreten',()=>caveEnter(c)],['Tiefer erkunden',()=>{caveSteps[c.name]=(stage+1)%3;close();findWild()}],['Kristalle untersuchen',()=>{save.balls+=2;stats();dialog('Kristallfund','Du findest zwei Taschibälle zwischen den Kristallen.',choice())}],['Höhle verlassen',close]])}


const STORY=[
 ['Das Erwachen','Im Sonnenhain verblasst das uralte Himmelslicht. Professor Ulme bittet dich, die 16 Licht-Siegel zusammenzuführen.'],
 ['Die Funken von Moosbach','Ein rätselhaftes Echo wandert durch die Wälder. Die ersten vier Licht-Siegel lassen die Karte des Sternengipfels leuchten.'],
 ['Das Geheimnis der Höhlen','Kristalle weisen auf eine vergessene Quelle der Taschi-Kraft hin. Acht Siegel eröffnen den zweiten Teil der Reise.'],
 ['Die Schatten über dem Tal','Zwölf Siegel sind vereint. Die letzten Prüfungen sollen zeigen, ob Mensch und Taschi einander wirklich vertrauen.'],
 ['Das letzte Licht','Alle sechzehn Siegel leuchten. Du bist Taschi-Meister! Die Region ist gerettet, und das Abenteuer geht frei weiter.']
];
function chapterIndex(){return save.badges>=16?4:save.badges>=12?3:save.badges>=8?2:save.badges>=4?1:0}
function chapterDialog(){
 const c=STORY[chapterIndex()];
 dialog('Kapitel '+(chapterIndex()+1)+' · '+c[0],'<p>'+c[1]+'</p><p>Aktuelle Aufgabe: '+(save.badges===16?'Erkunde die Region und vervollständige deinen Taschidex.':'Fordere '+GYMS[save.badges][0]+' heraus und gewinne das nächste Licht-Siegel.')+'</p>',[['Weiter',close],['Reisekarte',mapView]]);
}
function directionToNext(){
 if(save.badges>=16)return 'Alle 16 Licht-Siegel gesammelt';
 const g=gyms[save.badges],dx=g.x-player.position.x,dz=g.z-player.position.z,dist=Math.round(Math.hypot(dx,dz));
 const ang=Math.atan2(dx,-dz);
 const dirs=['N','NO','O','SO','S','SW','W','NW'];
 const heading=dirs[Math.round(((ang+Math.PI*2)%(Math.PI*2))/(Math.PI/4))%8];
 return 'Ziel: '+GYMS[save.badges][0]+' · '+dist+' m '+heading;
}

const journal=[
 ['Die ersten Schritte','Sprich mit Professor Ulme und wähle ein Starter-Taschi.'],
 ['Der erste Fang','Fange ein wildes Taschi im hohen Gras.'],
 ['Die sechzehn Lichter','Fordere die 16 Arena-Meister der Reihe nach heraus.'],
 ['Reise durch Sonnenhain','Entdecke die sechs Dörfer und vier Höhlen.'],
 ['Der Sternengipfel','Besiege Großmeisterin Aurelia und werde Taschi-Meister.']
];
function questStatus(){const caught=Object.values(save.dex).filter(v=>v===2).length;return [
 save.team.length>0,
 caught>=2,
 save.badges>=16,
 (save.visited&&Object.keys(save.visited).length>=10)||false,
 save.badges>=16
]}

function exportSave(){
 persist();
 const blob=new Blob([JSON.stringify({format:'taschi-save',version:1,created:new Date().toISOString(),state:save},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='taschi-spielstand.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('Spielstand exportiert.');
}
function importSave(){
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{
 try{
 const file=input.files?.[0];if(!file||file.size>2e6)throw Error('Datei zu groß oder fehlt.');
 const payload=JSON.parse(await file.text());if(payload?.format!=='taschi-save'||payload.version!==1)throw Error('Kein passender Taschi-Spielstand.');
 const restored=clean(payload.state);if(!restored)throw Error('Ungültige Speicherdaten.');
 save=restored;insideCave=null;scene.background.setHex(0x83b7d4);scene.fog=new THREE.FogExp2(0xb4e1e7,.009);player.position.set(save.x,0,save.z);updateFollower();stats();close();toast('Spielstand erfolgreich wiederhergestellt.');
 }catch(error){dialog('Import fehlgeschlagen','<p>'+String(error.message||error).replace(/[<>]/g,'')+'</p>',choice())}
 };input.click();
}

function chooseSaveSlot(){
 dialog('Spielstände','<p>Wechsle zwischen drei voneinander unabhängigen Speicherplätzen. Der aktuelle Stand wird automatisch gesichert.</p>',[
 ...[1,2,3].map(n=>['Spielplatz '+n+(n===slot?' ✓ aktiv':''),()=>{persist();slot=n;localStorage.setItem(SELECTED,String(slot));try{save=clean(JSON.parse(localStorage.getItem(saveKey())))}catch{save=null}save ||= blankSave();insideCave=null;scene.background.setHex(0x83b7d4);scene.fog=new THREE.FogExp2(0xb4e1e7,.009);player.position.set(save.x,0,save.z);updateFollower();stats();if(!save.team.length)start();else{close();toast('Spielplatz '+n+' geladen!')}}]),
 ['Zurück',mainMenu]
 ]);
}
function restartGame(){
 dialog('Neues Abenteuer?','<p>Nur der aktuelle Speicherplatz '+slot+' wird neu gestartet. Der bisherige Stand kann nicht wiederhergestellt werden, außer du hast ihn exportiert.</p>',[
 ['Ja, dieses Spiel neu beginnen',()=>{localStorage.removeItem(saveKey());save=blankSave();insideCave=null;scene.background.setHex(0x83b7d4);scene.fog=new THREE.FogExp2(0xb4e1e7,.009);player.position.set(save.x,0,save.z);updateFollower();stats();start()}],
 ['Abbrechen',mainMenu]
 ]);
}

function mainMenu(){dialog('Taschi · Pause','<p>Dein Abenteuer wird automatisch gespeichert. Du kannst zusätzlich eine Backup-Datei sichern.</p>',[['Weiterspielen',close],['Zum Titelbildschirm',()=>{close();showTitle()}],['Steuerung & Controller',inputSettings],['Geschichte',chapterDialog],['Abenteuerbuch',journalView],['Reisekarte',mapView],['Spielstand exportieren',exportSave],['Spielstand importieren',importSave],['Speicherplätze',chooseSaveSlot],['Neues Spiel',restartGame]])}

function journalView(){const done=questStatus();dialog('Abenteuerbuch','<p>Deine Reise durch die Taschi-Region.</p>'+journal.map((q,i)=>'<p><b>'+(done[i]?'✓ ':'□ ')+q[0]+'</b><br>'+q[1]+'</p>').join('')+'<p>Siegel: '+save.badges+'/16 · Gefangene Arten: '+Object.values(save.dex).filter(v=>v===2).length+'/'+Object.keys(SPEC).length+'</p>',[['Zurück',close]])}
function mapView(){dialog('Reisekarte','<p>Die Reiseorte sind in der 3D-Welt an ihren Positionen markiert. Erkunde mit dem Joystick oder den Pfeiltasten.</p>'+[...gyms.map((p,i)=>({...p,name:(i+1)+'. Arena: '+GYMS[i][0]})),...villages,...caves,...places].map(p=>'<p>📍 '+(p.name||p.label)+' – '+Math.round(Math.hypot(p.x-player.position.x,p.z-player.position.z))+' m</p>').join(''),[['Abenteuerbuch',journalView],['Zurück',close]])}
function recordVisit(place){save.visited ||= {};save.visited[place.name||place.label]=true;persist()}


function shop(){
 dialog('Fangladen · Sternmünzen','<p>Guthaben: ★ '+save.coins+' · Bälle: '+save.balls+' · Tränke: '+save.potions+'</p>',[
 ['5 Taschibälle · ★ 30',()=>buy(30,()=>save.balls+=5),save.coins<30],
 ['3 Tränke · ★ 45',()=>buy(45,()=>save.potions+=3),save.coins<45],
 ['10 Taschibälle · ★ 55',()=>buy(55,()=>save.balls+=10),save.coins<55],
 ['Zurück',close]
 ]);
}
function buy(cost,award){
 if(save.coins<cost){toast('Nicht genug Sternmünzen');return}
 save.coins-=cost;award();stats();shop();
}

function interact(){if(locked)return;if(!save.team.length){start();return}if(!near){toast('Erkunde die Lichtung und das hohe Gras.');return}if(insideCave){caveInteract(near);return}recordVisit(near);if(near.cave){enterCave(near)}else if(near.trainer!==undefined){approachTrainer(near)}else if(near.village){villageVisit(near)}else if(near.label==='Professor Ulmes Labor'){dialog('Professor Ulme','<p>Die 16 Licht-Siegel machen dich zum Meister. Deine Reise beginnt im Sonnenhain. Sprich mit den Arena-Meistern!</p><p>Entdeckte Taschis: '+Object.keys(save.dex).length+'</p>',choice())}else if(near.label==='Heilhaus'){save.team.forEach(m=>m.hp=maxHp(m));stats();dialog('Schwester Hanna','<p>Alle Taschis sind wieder topfit! Pass gut auf sie auf.</p>',choice())}else if(near.label==='Fangladen'){shop()}else if(near.gym!==undefined){const i=near.gym;if(i>save.badges){toast('Besiege zuerst die vorherige Arena!');return}if(i<save.badges){dialog(near.label,'Du besitzt dieses Licht-Siegel bereits.',choice());return}dialog('Arena: '+near.label,'<p>Fordere '+near.label+' heraus? Stufe '+GYMS[i][2]+'. Ein Sieg verleiht Licht-Siegel '+(i+1)+'.</p>',[['Kämpfen',()=>battle(make(GYMS[i][1],GYMS[i][2]),i+1)],['Später',close]])}}
$('team').onclick=team;$('dex').onclick=dex;$('map').onclick=mapView;$('menu').onclick=mainMenu;$('sound').onclick=toggleSound;$('interact').onclick=interact;

let soundOn=false,audioContext=null,nextNote=0,noteStep=0;
const song=[0,4,7,9,7,4,2,5,9,7,5,2,0,2,4,7,5,9,12,9,7,5,4,2,7,9,11,9,7,4,2,0];
function audioTone(freq,duration=.16,volume=.025,kind='triangle'){
 if(!soundOn)return;
 try{
  audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
  if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
  const now=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();
  osc.type=kind;osc.frequency.setValueAtTime(freq,now);
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume),now+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  osc.connect(gain).connect(audioContext.destination);osc.start(now);osc.stop(now+duration+.03);
 }catch{}
}
function toggleSound(){
 soundOn=!soundOn;$('sound').textContent=soundOn?'♫ An':'♫ Aus';
 if(soundOn){audioTone(523,.16,.055);nextNote=0;}
}
function soundtrack(){
 if(!soundOn||document.hidden||performance.now()<nextNote)return;
 const freq=196*Math.pow(2,song[noteStep%song.length]/12);
 audioTone(freq,.25,.009);
 noteStep++;nextNote=performance.now()+380;
}

// Shared configurable keyboard, touch and standard Gamepad API input.
const INPUT_KEY='taschi.input.v2';
const defaults={up:'w',down:'s',left:'a',right:'d',action:'e',menu:'escape',run:'shift',joystickSize:126,joystickOpacity:75,deadzone:.16,speed:1,camera:'follow',vibration:true,hand:'left'};
let controls;try{controls={...defaults,...JSON.parse(localStorage.getItem(INPUT_KEY)||'{}')}}catch{controls={...defaults}}
const keys=new Set(),joy=$('joy'),nub=$('nub');let joyX=0,joyY=0,gamepadX=0,gamepadY=0,gamepadLast={},remapping=null;
const normKey=e=>(e.key===' '?'space':e.key.toLowerCase());
function keyMatch(key,direction){return key===controls[direction]||({up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[direction]===key)}
function gamepadPoll(){
 const pads=navigator.getGamepads?.()||[];const pad=Array.from(pads).find(p=>p&&p.connected);
 if(!pad){gamepadX=gamepadY=0;$('padstate').textContent='Kein Controller';gamepadLast={};return}
 $('padstate').textContent=pad.id.slice(0,65);
 const axis=(v)=>Math.abs(v)<controls.deadzone?0:Math.sign(v)*(Math.abs(v)-controls.deadzone)/(1-controls.deadzone);
 gamepadX=axis(pad.axes[0]||0);gamepadY=axis(pad.axes[1]||0);
 const pressed=i=>!!pad.buttons[i]?.pressed;
 const edge=(i,callback)=>{if(pressed(i)&&!gamepadLast[i])callback();gamepadLast[i]=pressed(i)};
 edge(0,()=>{if(!locked)interact();else if($('panel').classList.contains('show'))$('options').querySelector('button:not(:disabled)')?.click();else if(!booted)enterGame()});
 edge(1,()=>{if($('panel').classList.contains('show')&&!combat)close()});
 edge(9,()=>booted?mainMenu():enterGame());
 edge(3,()=>{if(booted&&!locked)team()});
 if(pad.buttons[12]?.pressed)gamepadY=-1;if(pad.buttons[13]?.pressed)gamepadY=1;
 if(pad.buttons[14]?.pressed)gamepadX=-1;if(pad.buttons[15]?.pressed)gamepadX=1;
}
function applyControls(){
 joy.style.width=joy.style.height=controls.joystickSize+'px';
 nub.style.left=nub.style.top=(controls.joystickSize-48)/2+'px';
 joy.style.opacity=String(controls.joystickOpacity/100);
 document.body.dataset.hand=controls.hand;
 localStorage.setItem(INPUT_KEY,JSON.stringify(controls));
}
function inputSettings(){
 const options=[
 ['Hand: '+(controls.hand==='left'?'Links':'Rechts'),()=>{controls.hand=controls.hand==='left'?'right':'left';applyControls();inputSettings()}],
 ['Joystickgröße: '+controls.joystickSize+'px',()=>{controls.joystickSize=controls.joystickSize>=170?100:controls.joystickSize+14;applyControls();inputSettings()}],
 ['Joystick-Sichtbarkeit: '+controls.joystickOpacity+'%',()=>{controls.joystickOpacity=controls.joystickOpacity>=100?40:controls.joystickOpacity+15;applyControls();inputSettings()}],
 ['Joystick-Totzone: '+Math.round(controls.deadzone*100)+'%',()=>{controls.deadzone=controls.deadzone>=.3?.08:+(controls.deadzone+.04).toFixed(2);applyControls();inputSettings()}],
 ['Lauftempo: '+controls.speed+'×',()=>{controls.speed=controls.speed>=1.5?.7:+(controls.speed+.2).toFixed(1);applyControls();inputSettings()}],
 ...['up','down','left','right','action','menu','run'].map(action=>[{up:'Vorwärts',down:'Rückwärts',left:'Links',right:'Rechts',action:'Interaktion',menu:'Pause',run:'Sprinten'}[action]+': '+controls[action].toUpperCase(),()=>{remapping=action;dialog('Taste zuweisen','Drücke die gewünschte Tastaturtaste. Escape bricht die Belegung ab.',[['Abbrechen',()=>{remapping=null;inputSettings()}]])}]),
 ['Standardbelegung',()=>{controls={...defaults};applyControls();inputSettings()}],
 ['Zurück',mainMenu]
 ];
 dialog('Steuerung & Controller','<p>Tastatur, Touch-Joystick und Standard-Gamepads. Controller: linker Stick bewegen, A bestätigen, B zurück, Start Menü, Y Team.</p><p id="padstate">Controller werden automatisch erkannt.</p>',options);
}
addEventListener('keydown',e=>{
 const key=normKey(e);
 if(remapping){e.preventDefault();if(key==='escape'){remapping=null;inputSettings();return}controls[remapping]=key;remapping=null;applyControls();inputSettings();return}
 if(['arrowup','arrowdown','arrowleft','arrowright','space'].includes(key))e.preventDefault();
 keys.add(key);
 if(!e.repeat&&key===controls.action)interact();
 if(!e.repeat&&key===controls.menu){if(locked&&!combat&&booted)close();else if(!locked&&booted)mainMenu()}
});
addEventListener('keyup',e=>keys.delete(normKey(e)));addEventListener('blur',()=>{keys.clear();joyX=joyY=0});
function pointer(e){const r=joy.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,mag=Math.max(1,Math.hypot(x,y)/(controls.joystickSize*.36));joyX=x/(controls.joystickSize*.36)/mag;joyY=y/(controls.joystickSize*.36)/mag;nub.style.transform='translate('+(joyX*controls.joystickSize*.31)+'px,'+(joyY*controls.joystickSize*.31)+'px)'}
joy.addEventListener('pointerdown',e=>{e.preventDefault();joy.setPointerCapture(e.pointerId);pointer(e)});
joy.addEventListener('pointermove',e=>{if(joy.hasPointerCapture(e.pointerId)){e.preventDefault();pointer(e)}});
function resetJoy(){joyX=joyY=0;nub.style.transform=''}
joy.addEventListener('pointerup',resetJoy);joy.addEventListener('pointercancel',resetJoy);
applyControls();
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}addEventListener('resize',resize);

function showTitle(){
 booted=false;locked=true;document.body.classList.remove('playing');
 $('boot').classList.remove('hidden');$('boot').classList.add('ready');
 $('slotinfo').textContent='Speicherplatz '+slot+' · '+save.badges+'/16 Orden · '+save.team.length+' im Team';
 $('continue').textContent=save.team.length?'Abenteuer fortsetzen':'Abenteuer beginnen';
}
function enterGame(){
 booted=true;locked=false;$('boot').classList.add('hidden');document.body.classList.add('playing');
 if(!save.team.length)start();else toast('Willkommen zurück in der Taschi-Region!');
}
$('continue').onclick=enterGame;
$('newgame').onclick=()=>{
 if(save.team.length){$('boot').classList.add('hidden');document.body.classList.add('playing');booted=true;restartGame();return}
 enterGame();
};
$('slotselect').onclick=()=>{
 $('boot').classList.add('hidden');document.body.classList.add('playing');booted=true;
 chooseSaveSlot();
};


const mini=$('minimap'),mctx=mini.getContext('2d');
let miniNext=0;
function drawMinimap(){
 if(!mctx)return;
 const w=mini.width,h=mini.height,scale=1.13;
 mctx.clearRect(0,0,w,h);
 mctx.save();mctx.beginPath();mctx.arc(w/2,h/2,72,0,Math.PI*2);mctx.clip();
 mctx.fillStyle=insideCave?'#374759':'#65a575';mctx.fillRect(0,0,w,h);
 if(insideCave){mctx.strokeStyle='#d1d5cf';mctx.strokeRect(11,11,128,128);}
 else{
 const convert=(x,z)=>[w/2+(x-player.position.x)*scale,h/2+(z-player.position.z)*scale];
 mctx.strokeStyle='#d4c291';mctx.lineWidth=10;mctx.beginPath();
 let a=convert(0,-60),b=convert(0,60);mctx.moveTo(...a);mctx.lineTo(...b);mctx.stroke();
 a=convert(-60,-18);b=convert(60,-18);mctx.beginPath();mctx.moveTo(...a);mctx.lineTo(...b);mctx.stroke();
 for(const item of villages){const [x,y]=convert(item.x,item.z);mctx.fillStyle='#fff5cb';mctx.fillRect(x-4,y-4,8,8)}
 for(const item of caves){const [x,y]=convert(item.x,item.z);mctx.fillStyle='#8d86be';mctx.beginPath();mctx.arc(x,y,5,0,Math.PI*2);mctx.fill()}
 for(const item of gyms){const [x,y]=convert(item.x,item.z);mctx.fillStyle=item.gym<save.badges?'#f7cf70':'#e7eeee';mctx.beginPath();mctx.arc(x,y,4,0,Math.PI*2);mctx.fill()}
 }
 mctx.restore();
 mctx.beginPath();mctx.arc(75,75,7,0,Math.PI*2);mctx.fillStyle='#f95a49';mctx.fill();
 mctx.lineWidth=2;mctx.strokeStyle='#fff';mctx.stroke();
 mctx.fillStyle='#fff';mctx.font='bold 13px sans-serif';mctx.fillText('N',71,12);
}

const clock=new THREE.Clock();let time=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(.05,clock.getDelta());time+=dt;gamepadPoll();if(!locked){const dx=Number([...keys].some(k=>keyMatch(k,'right')))-Number([...keys].some(k=>keyMatch(k,'left')))+joyX+gamepadX,dz=Number([...keys].some(k=>keyMatch(k,'down')))-Number([...keys].some(k=>keyMatch(k,'up')))+joyY+gamepadY,len=Math.hypot(dx,dz);if(len>.12){const speed=7*controls.speed*(keys.has(controls.run)?1.45:1);const vx=dx/len*dt*speed,vz=dz/len*dt*speed,nx=Math.max(insideCave?270:-60,Math.min(insideCave?330:60,player.position.x+vx)),nz=Math.max(insideCave?-24:-60,Math.min(insideCave?24:60,player.position.z+vz));if(insideCave||!colliders.some(c=>Math.hypot(nx-c.x,nz-c.z)<c.r+.45)){player.position.x=nx;player.position.z=nz}player.rotation.y=Math.atan2(dx,dz);steps+=dt;if(steps>1.8){steps=0;if(!insideCave){save.x=player.position.x;save.z=player.position.z;persist()}if(insideCave&&Math.random()<.3)findWild(['geist','gestein','wasser','elektro'][caves.indexOf(insideCave)]);if(!insideCave){const habitat=grass.find(g=>Math.hypot(g.x-save.x,g.z-save.z)<g.r);if(habitat&&Math.random()<.38)findWild(habitat.type)}}}}follower.position.lerp(new THREE.Vector3(player.position.x-1.3,.12+Math.sin(time*3)*.12,player.position.z+1.5),Math.min(1,dt*5));follower.rotation.y=player.rotation.y;follower.visible=!combat;player.visible=!combat;if(combat){battleFriends.position.y=Math.sin(time*2)*.07;battleFoes.position.y=Math.sin(time*2.2+1)*.06}
near=(insideCave?[{x:300,z:23,label:'Höhlenausgang',exit:true},...crystalLocations.map(([x,z],i)=>({x:300+x,z,label:'Kristall '+(i+1),crystal:i}))]:[...places,...gyms,...caves.map(c=>({...c,cave:true})),...villages.map(v=>({...v,label:v.name,village:true})),...routeTrainers.map(t=>({...t,label:'Trainer '+t.name}))]).map(p=>({...p,dist:Math.hypot(p.x-player.position.x,p.z-player.position.z)})).sort((a,b)=>a.dist-b.dist)[0];if(near.dist>9)near=null;$('interact').textContent=near?'✦ '+(near.exit?'Verlassen':near.crystal!==undefined?'Kristall':near.trainer!==undefined?'Trainer':near.cave?'Höhle':near.village?'Dorf':near.gym!==undefined?'Arena':near.label==='Heilhaus'?'Heilen':near.label==='Fangladen'?'Shop':'Reden'):'Aktion · E';if(combat){camera.position.lerp(new THREE.Vector3(191,9,17),Math.min(1,dt*4));camera.lookAt(180,1.5,0)}else{camera.position.lerp(new THREE.Vector3(player.position.x+8.5,11.5,player.position.z+14),Math.min(1,dt*3.5));camera.lookAt(player.position.x,1.4,player.position.z-4)}$('objective').textContent=insideCave?'Höhlenexpedition · Drei Kristalle finden':directionToNext();soundtrack();if(performance.now()>miniNext){drawMinimap();miniNext=performance.now()+400}if(toastUntil&&performance.now()>toastUntil){$('message').style.display='none';toastUntil=0}renderer.render(scene,camera)}
stats();showTitle();animate();
