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
const maxPP=id=>MOVES[id]?.[2]>=60?12:20;
const ensurePP=m=>{m.pp ||= {};for(const id of SPEC[m.id].moves)if(!Number.isFinite(m.pp[id]))m.pp[id]=maxPP(id);return m.pp};
const maxHp=m=>Math.floor(SPEC[m.id].hp*2*m.lv/100)+m.lv+10;
const make=(id,lv)=>{const m={id,lv,xp:0,hp:1,pp:{}};for(const move of SPEC[id].moves)m.pp[move]=maxPP(move);m.hp=maxHp(m);return m};
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
function tree(x,z,s=1){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 const bark=mat(0x785a44),foliage=[0x3f925f,0x50985a,0x3a8665,0x74a75b].map(c=>mat(c));
 cylinder(g,0,1.65*s,0,.27*s,.44*s,3.3*s,bark);
 const style=Math.floor(Math.abs(x*17+z*11))%3;
 if(style===0){
  for(let j=0;j<3;j++){const f=ball(g,(j-1)*.58*s,(3.4+j%2*.5)*s,(j%2)*.35*s,1.18*s,foliage[j]);f.scale.set(1.05,.83,1.03)}
 }else if(style===1){
  for(let j=0;j<3;j++){const cone=mesh(g,new THREE.ConeGeometry((1.65-j*.28)*s,2*s,8),foliage[j],0,(2.7+j*.96)*s,0);cone.rotation.y=j*.3}
 }else{
  const crown=ball(g,0,3.45*s,0,1.7*s,foliage[3]);crown.scale.y=.76;
  for(let j=0;j<5;j++){const a=j*Math.PI*2/5;ball(g,Math.sin(a)*1.13*s,3.3*s,Math.cos(a)*1.1*s,.65*s,foliage[j%4])}
 }
 solid(x,z,.85*s);
}
for(let i=0;i<90;i++){const x=rand(-60,60),z=rand(-60,60);if(Math.abs(x)<8||Math.abs(z+18)<7||Math.hypot(x-14,z-10)<12||Math.hypot(x+18,z+32)<13)continue;tree(x,z,rand(.7,1.3))}
function house(x,z,label,color){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 const wall=mat(color),trim=mat(0xfff6df),glass=mat(0x79c5e5,.18),roofing=mat(label.includes('Heil')?0xd95d76:label.includes('Fang')?0x487ba8:0xab6254);
 box(g,0,2,0,8,4,7,wall);
 box(g,0,.4,0,8.7,.65,7.6,mat(0x8c988a));
 const top=mesh(g,new THREE.ConeGeometry(6.6,3,4),roofing,0,5.45,0);top.rotation.y=Math.PI/4;
 box(g,0,1.23,3.61,1.8,2.45,.19,mat(0x77543f));
 ball(g,.45,1.3,3.75,.08,mat(0xf0bd6a,.2));
 for(const dx of [-2.7,2.7]){
  box(g,dx,2.5,3.6,1.42,1.54,.14,trim);
  box(g,dx,2.5,3.7,1.2,1.3,.09,glass);
  box(g,dx,2.5,3.78,.11,1.3,.06,trim);
  box(g,dx,2.5,3.79,1.2,.1,.06,trim);
  box(g,dx,1.67,3.85,1.45,.22,.42,mat(0x6b9d69));
 }
 for(const dx of [-3.6,3.6])box(g,dx,2.2,3.56,.28,4.3,.22,trim);
 box(g,0,4.2,3.58,8.1,.22,.25,trim);
 cylinder(g,2.2,6.3,-.4,.39,.43,2.5,mat(0xc5bdae));
 ball(g,2.2,7.55,-.4,.48,roofing);
 solid(x,z,4.3);return {x,z,label};
}
const places=[house(14,10,'Professor Ulmes Labor',0xf8e5c2),house(-18,10,'Heilhaus',0xf4a9b7),house(14,-32,'Fangladen',0x91cce1)];
// Arena monuments: 8 stations around the valley, visible and approachable.
const gyms=[];GYMS.forEach((g,i)=>{
 const x=-51+(i%4)*34,z=-51+Math.floor(i/4)*31;
 const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
 const theme=[0x8590a3,0x639db7,0xd4a95b,0x7cb982,0x9c91b9,0xcf7e82,0x82b6b4,0xe0bc73][i%8];
 const base=mat(theme),pale=mat(0xfff1d4),dark=mat(0x374f65);
 cylinder(group,0,.44,0,5.4,5.9,.88,mat(0x879994));
 cylinder(group,0,.9,0,4.4,4.7,.24,base);
 for(let j=0;j<6;j++){const angle=j*Math.PI/3;const px=Math.sin(angle)*3.6,pz=Math.cos(angle)*3.6;
  cylinder(group,px,2.65,pz,.19,.26,3.8,pale);
  const orb=ball(group,px,4.6,pz,.29,base);orb.scale.y=.8;
 }
 const canopy=mesh(group,new THREE.ConeGeometry(5.15,2.25,6),dark,0,5.7,0);canopy.rotation.y=Math.PI/6;
 const roofTrim=mesh(group,new THREE.CylinderGeometry(4.8,4.8,.21,6),base,0,4.8,0);roofTrim.rotation.y=Math.PI/6;
 const jewel=mesh(group,new THREE.OctahedronGeometry(.85),mat(theme,.18),0,7.2,0);
 jewel.rotation.y=i*.2;
 const emblem=mesh(group,new THREE.TorusGeometry(1.3,.13,8,32),pale,0,2.8,0);emblem.rotation.x=Math.PI/2;
 for(const side of [-1,1]){box(group,side*4.3,2.3,0,.18,2.9,1.1,base)}
 gyms.push({x,z,label:g[0],gym:i});townLabel((i+1)+'. Siegel',x,z,8.3);
});
// Additional villages and cave landscapes; cave sites are explorable above-ground rock caverns.



/* Guided region routes: a continuous walkway through all sixteen challenges.
 * Existing arena positions are preserved to avoid invalidating saves. */
const routeStops=[{x:0,z:6,label:'Sonnenhain'},...gyms.map((g,i)=>({x:g.x,z:g.z,label:'Route '+(i+1)}))];
const roadMaterial=mat(0xb99d79),roadEdge=mat(0x728f68);
const routeSignposts=[];
function makeRouteSegment(a,b){
 const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
 const group=new THREE.Group();group.position.set((a.x+b.x)/2,.025,(a.z+b.z)/2);group.rotation.y=Math.atan2(dx,dz);scene.add(group);
 const road=mesh(group,new THREE.PlaneGeometry(4.2,length),roadMaterial);road.rotation.x=-Math.PI/2;
 for(const edge of [-2.4,2.4]){const strip=mesh(group,new THREE.PlaneGeometry(.18,length),roadEdge,edge,.015,0);strip.rotation.x=-Math.PI/2}
}
for(let i=1;i<routeStops.length;i++)makeRouteSegment(routeStops[i-1],routeStops[i]);
for(let i=0;i<routeStops.length;i++){
 const p=routeStops[i];if(i===0)continue;
 const sign=new THREE.Group();sign.position.set(p.x+5,0,p.z+4);scene.add(sign);
 cylinder(sign,0,1,0,.11,.13,2,wood);
 box(sign,0,1.95,0,2.4,.75,.22,mat(0x254a60));
 routeSignposts.push({x:p.x+5,z:p.z+4,label:'Wegweiser '+i,route:i});
}
function routeInfo(p){
 const target=gyms[p.route-1],complete=save.badges>=p.route;
 dialog('Route '+p.route,'<p>Auf dieser Strecke liegt die Arena von <b>'+GYMS[p.route-1][0]+'</b>.</p><p>'+(complete?'Das Licht-Siegel dieser Route besitzt du bereits.':'Aufgabe: Bereite dein Team vor und bestreite die nächste Arena.')+'</p>',[
 ['Zur Arena orientieren',()=>{close();toast('Arena: '+Math.round(Math.hypot(target.x-player.position.x,target.z-player.position.z))+' Meter entfernt')}],
 ['Weiter',close]
 ]);
}


/* Distinct landscape landmarks: readable biomes, terrain detail and environmental props. */
const gravel=mat(0x88939a),cliffStone=mat(0x697b85),sand=mat(0xdabf8a),pondWater=new THREE.MeshStandardMaterial({color:0x418caa,metalness:.1,roughness:.27,transparent:true,opacity:.89,side:THREE.DoubleSide});
function rockFormation(x,z,r=1){
 const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);
 for(let i=0;i<4;i++){
  const a=i*1.8,pr=mesh(root,new THREE.DodecahedronGeometry((.9+i%3*.3)*r,0),i%2?gravel:cliffStone,Math.sin(a)*r, (.5+i%2*.15)*r,Math.cos(a)*r);
  pr.rotation.set(i*.2,i*.45,i*.14);
 }
}
function pond(x,z,rx,rz){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 const water=mesh(g,new THREE.CircleGeometry(1,40),pondWater,0,.06,0);water.rotation.x=-Math.PI/2;water.scale.set(rx,rz,1);
 const shore=mesh(g,new THREE.RingGeometry(.88,1.13,48),sand,0,.04,0);shore.rotation.x=-Math.PI/2;shore.scale.set(rx,rz,1);
 for(let i=0;i<13;i++){const angle=i*Math.PI*2/13;const xx=Math.cos(angle)*rx*1.06,zz=Math.sin(angle)*rz*1.06;
  const reed=cylinder(g,xx,.42,zz,.04,.06,.8,mat(0x648f56));reed.rotation.z=Math.sin(angle)*.25;
 }
}
function flowerBed(x,z,color){
 const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
 for(let i=0;i<9;i++){const a=i*2.399,r=.35+Math.sqrt(i)*.38;
  cylinder(group,Math.sin(a)*r,.17,Math.cos(a)*r,.04,.05,.34,mat(0x4d9255));
  ball(group,Math.sin(a)*r,.39,Math.cos(a)*r,.15,mat(i%3?color:0xffe18b))}
}
function streetLamp(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 cylinder(g,0,2.3,0,.1,.19,4.6,mat(0x3e5a63));
 ball(g,0,4.5,0,.37,mat(0xffe3a7,.18));
 const shade=mesh(g,new THREE.ConeGeometry(.65,.45,8),mat(0x47616d),0,4.87,0);shade.rotation.z=Math.PI;
}
pond(-27,24,7,4);
pond(29,38,6,3.5);
for(let i=0;i<32;i++){
 const a=i*2.399,x=Math.sin(a)*(20+i*.9),z=Math.cos(a)*(18+i*.84);
 if(Math.abs(x)<9||Math.abs(z+18)<9)continue;
 rockFormation(x,z,.45+(i%5)*.13);
}
for(const [x,z,col] of [[-14,16,0xf39ab2],[8,17,0xeeb864],[18,-24,0xc2a2fa],[-29,-23,0xb6cde9],[-5,35,0xf9a87b]])flowerBed(x,z,col);
for(const [x,z] of [[-7,15],[7,15],[-7,-18],[7,-18],[-6,-39],[6,-39]])streetLamp(x,z);


/* Sixteen regional destinations, each with its own city, healing house, arena,
 * champion gate, quest puzzle and one-time item chest. Travel is deliberate,
 * existing overworld and save coordinates are preserved. */
const REGION_NAMES=['Moostal','Korallküste','Funkenfeld','Blütenhain','Käferwald','Sturmklippe','Glutland','Sternenau','Nebelmoor','Frosttal','Wipfelreich','Donnersteppe','Kristallberg','Mondbucht','Sonnenhöhe','Himmelskrone'];
const regions=GYMS.map((g,i)=>({id:i,name:REGION_NAMES[i],gym:g[0],level:g[2],x:gyms[i].x,z:gyms[i].z}));

// Each region has dominant habitats; rare ancient Taschis are unique catches.
const REGION_TYPES=[
 ['pflanze','normal'],['wasser','flug'],['elektro','normal'],['pflanze','geist'],
 ['pflanze','flug'],['flug','elektro'],['feuer','gestein'],['geist','normal'],
 ['geist','wasser'],['wasser','gestein'],['pflanze','flug'],['elektro','feuer'],
 ['gestein','geist'],['geist','wasser'],['feuer','flug'],['flug','feuer']
];
const ANCIENTS=[
 {id:'auraflamme',name:'Auraflamme',type:'feuer',color:0xff9654,hp:115,atk:125,def:94,speed:106,catch:.045,moves:['glut','hieb'],bio:'Ein uraltes Taschi des Sonnenfeuers.',region:14},
 {id:'tiefenlied',name:'Tiefenlied',type:'wasser',color:0x478fc7,hp:120,atk:105,def:114,speed:91,catch:.045,moves:['spritzer','spuk'],bio:'Wächter der tiefsten Korallenströme.',region:1},
 {id:'sturmkron',name:'Sturmkron',type:'elektro',color:0xf4d974,hp:103,atk:132,def:86,speed:124,catch:.04,moves:['funken','fluegel'],bio:'Der sagenumwobene Herrscher des Sturmwinds.',region:11},
 {id:'mondhueter',name:'Mondhüter',type:'geist',color:0x9a8bd6,hp:111,atk:112,def:110,speed:105,catch:.04,moves:['spuk','ranke'],bio:'Ein stiller Beschützer des Mondlichts.',region:13}
];
for(const a of ANCIENTS)SPEC[a.id]={...a,ancient:true};
function regionAtPosition(x=player.position.x,z=player.position.z){
 return regions.reduce((best,r)=>Math.hypot(x-r.x,z-r.z)<Math.hypot(x-best.x,z-best.z)?r:best,regions[0]);
}
function regionalEncounter(regionId,habitat=null){
 const focus=REGION_TYPES[regionId]||REGION_TYPES[0];
 const type=habitat&&Math.random()<.2?habitat:focus[Math.random()<.76?0:1];
 let pool=Object.keys(SPEC).filter(id=>!SPEC[id].ancient&&SPEC[id].type===type);
 if(!pool.length)pool=Object.keys(SPEC).filter(id=>!SPEC[id].ancient);
 const id=pool[Math.floor(Math.random()*pool.length)];
 return make(id,Math.max(3,Math.min(59,(regions[regionId]?.level||8)-3+Math.floor(rand(-2,3)))));
}
function ancientEncounter(r){
 const ancient=ANCIENTS.find(a=>a.region===r.id);
 if(!ancient){toast('In dieser Region ist kein legendäres Taschi bekannt.');return}
 if(save.badges<r.id+1){toast('Gewinne zuerst den regionalen Orden.');return}
 if(save.dex[ancient.id]===2){toast(ancient.name+' wurde bereits gefangen.');return}
 dialog('Legende von '+r.name,'<p>'+ancient.bio+'</p><p>Ein seltener Wächter erscheint nur nach Erringen des regionalen Siegels.</p>',[
 ['Begegnung beginnen',()=>battle(make(ancient.id,50+r.id%10))],['Zurück',close]
 ]);
}


/* Regional scenery and population. Reuses simple low-poly assets for mobile budgets. */
const regionalNPCs=[];
const PROF_NAMES=['Ulme','Marea','Volt','Liora','Bork','Aeris','Ignis','Nova','Nebel','Fjella','Linde','Tessa','Granit','Luna','Solan','Astra'];
const ENV_COLORS={pflanze:0x53986b,wasser:0x4eafc5,elektro:0xe9c74d,flug:0x96c5db,feuer:0xe88559,gestein:0x82919b,geist:0x9286b8,normal:0xb3a270};
for(const r of regions){
 const mainType=REGION_TYPES[r.id][0],tone=mat(ENV_COLORS[mainType]);
 const root=new THREE.Group();root.position.set(r.x,0,r.z);scene.add(root);
 const district=mesh(root,new THREE.CircleGeometry(12.5,32),new THREE.MeshStandardMaterial({color:ENV_COLORS[mainType],roughness:1,transparent:true,opacity:.38,depthWrite:false}),0,.019,0);district.rotation.x=-Math.PI/2;
 if(mainType==='wasser'){
  for(let j=0;j<4;j++){const rock=mesh(root,new THREE.CylinderGeometry(.45,.68,1.5,7),tone,Math.sin(j*1.6)*8,.75,Math.cos(j*1.6)*8);rock.rotation.z=.12}
 }else if(mainType==='feuer'){
  const cone=mesh(root,new THREE.ConeGeometry(2.7,5,8),mat(0x665e60),8,2.5,-8);
  const lava=mesh(root,new THREE.ConeGeometry(.9,1.1,8),tone,8,5.3,-8);
 }else if(mainType==='gestein'){
  for(let j=0;j<5;j++)mesh(root,new THREE.OctahedronGeometry(1+j*.18),tone,Math.sin(j*1.5)*8,1,Math.cos(j*1.5)*8);
 }else if(mainType==='elektro'){
  for(let j=0;j<3;j++){cylinder(root,-7+j*7,2,-8,.14,.2,4,tone);ball(root,-7+j*7,4.3,-8,.42,mat(0xffea9e))}
 }else if(mainType==='geist'){
  for(let j=0;j<5;j++){const stone=mesh(root,new THREE.ConeGeometry(.65,2.6,5),tone,Math.sin(j*1.4)*7,1.3,Math.cos(j*1.4)*7);stone.rotation.z=.14}
 }else{
  for(let j=0;j<5;j++){ball(root,Math.sin(j*1.7)*8,.75,Math.cos(j*1.7)*8,.7,tone)}
 }
 for(let j=0;j<7;j++){
  const a=(j/7)*Math.PI*2,dist=10+(j%2)*2,x=r.x+Math.cos(a)*dist,z=r.z+Math.sin(a)*dist;
  const person=new THREE.Group();person.position.set(x,0,z);scene.add(person);
  const dress=mat([0x67a7a0,0xd58489,0xc8a666,0x8e83b4,0x5b91bd][(j+r.id)%5]);
  box(person,0,1,0,.75,1,.45,dress);ball(person,0,1.82,0,.4,mat(0xeac2a2));
  const hairstyle=ball(person,0,2.15,-.08,.41,mat((j%2)?0x493a37:0x916848));hairstyle.scale.y=.4;
  for(const side of [-1,1]){box(person,side*.25,.26,0,.23,.5,.28,mat(0x3e4e61));box(person,side*.54,1,0,.2,.65,.23,mat(0xeac2a2))}
  regionalNPCs.push({x,z,region:r.id,npc:j,label:j===0?'Professor '+PROF_NAMES[r.id]:'Bewohner '+(j+1)});
 }
}
function regionalTalk(p){
 const r=regions[p.region];
 if(p.npc===0){
  const count=Object.keys(save.dex).filter(id=>save.dex[id]===2).length;
  dialog('Professor '+PROF_NAMES[r.id]+' · '+r.name,'<p>„Unsere Region ist berühmt für '+REGION_TYPES[r.id].map(t=>TYPES[t]+' '+t).join(' und ')+'. Halte Ausschau nach besonderen Taschis!“</p><p>Dein Taschidex: '+count+' Arten gefangen.</p>',[
   ['Team versorgen',()=>{save.team.forEach(m=>{m.hp=maxHp(m);for(const move of SPEC[m.id].moves)ensurePP(m)[move]=maxPP(move)});stats();close();toast('Professor '+PROF_NAMES[r.id]+' hat dein Team geheilt.')}],
   ['Über die Region',()=>regionSelect()],['Weiter',close]
  ]);return;
 }
 const lines=[
  'Auf den Wegen warten Trainer und spannende Kämpfe.',
  'In dieser Stadt kannst du versteckte Truhen entdecken.',
  'Unsere Arenaprüfung beginnt erst nach dem Siegelrätsel.',
  'Die örtlichen Taschis unterscheiden sich von denen anderer Städte.',
  'Die Luftschiff-Bande wurde in der Nähe gesichtet!',
  'Man sagt, einige Taschis seien uralte Wächter.'
 ];
 dialog('Bewohner von '+r.name,'„'+lines[(p.npc-1)%lines.length]+'“',choice());
}


/* Original recurring antagonists: the Stormveil Guild steals Taschis for experiments. */
SPEC.schnurrik={name:'Schnurrik',type:'normal',color:0xd4aa78,hp:48,atk:61,def:50,speed:75,catch:.24,moves:['stoss','hieb'],bio:'Ein gewitztes wildes Katzentaschi mit abgewinkelten Ohren.'};
const SHADOW_SITES=[{region:2,x:gyms[2].x+10,z:gyms[2].z-8},{region:6,x:gyms[6].x+10,z:gyms[6].z-8},{region:10,x:gyms[10].x+10,z:gyms[10].z-8},{region:14,x:gyms[14].x+10,z:gyms[14].z-8}];
for(let i=0;i<SHADOW_SITES.length;i++){
 const site=SHADOW_SITES[i],balloon=new THREE.Group();balloon.position.set(site.x,0,site.z);scene.add(balloon);
 const purple=mat(0x72518b),orange=mat(0xe69f6b),rope=mat(0x72634b);
 const basket=box(balloon,0,3,0,2.4,1.7,2,mat(0x916b43));
 for(const dx of [-.9,.9])for(const dz of [-.72,.72])cylinder(balloon,dx,5.1,dz,.06,.06,3.7,rope);
 const canopy=ball(balloon,0,9,0,3.1,purple);canopy.scale.y=1.15;
 for(let j=0;j<8;j++){const angle=j*Math.PI/4;const stripe=ball(balloon,Math.sin(angle)*2.15,9.1,Math.cos(angle)*2.15,.95,j%2?orange:purple);stripe.scale.y=2.4}
 const cat=new THREE.Group();cat.position.set(2.2,0,2.2);balloon.add(cat);
 ball(cat,0,.56,0,.48,orange);ball(cat,0,1.23,0,.44,orange);
 for(const side of [-1,1]){const ear=mesh(cat,new THREE.ConeGeometry(.24,.62,4),orange,side*.28,1.7,0);ear.rotation.z=side*.25;ball(cat,side*.17,1.3,.37,.07,mat(0x24304a))}
 const tail=mesh(cat,new THREE.TorusGeometry(.55,.13,8,24,Math.PI*1.4),orange,.5,.53,-.22);tail.rotation.x=Math.PI/2;
 for(let j=0;j<2;j++){const person=new THREE.Group();person.position.set((j-.5)*1.1,1,0);balloon.add(person);
 box(person,0,.62,0,.7,.9,.45,purple);ball(person,0,1.42,0,.32,mat(0xe8bd97));}
 townLabel('Schattengilde',site.x,site.z,14);
}
function shadowGuildEvent(site){
 save.guild ||= {};
 const idx=SHADOW_SITES.indexOf(site);if(idx<0)return;
 if(save.guild[idx]){dialog('Verlassener Ballon','Die Schattengilde ist aus dieser Region vertrieben. Schnurrik und die Forscher sind weitergezogen.',choice());return}
 dialog('Schattengilde · gestohlene Taschis','<p>Über dir schwebt ein violetter Heißluftballon. Zwei Mitglieder der Schattengilde und ihr listiges Katzentaschi Schnurrik versuchen, wilde Taschis für geheime Versuche einzufangen.</p><p>„Halt! Diese Taschis brauchen Hilfe!“</p>',[
 ['Gefangene Taschis retten',()=>battle(make('schnurrik',Math.min(55,15+idx*10)),false,200+idx)],
 ['Später zurückkehren',close]
 ]);
}

const regionMarkers=[];
for(let i=0;i<regions.length;i++){
 const r=regions[i],root=new THREE.Group();root.position.set(r.x-5,0,r.z-5);scene.add(root);
 const color=mat([0x8ecf93,0x8dbbd6,0xe0bb72,0xa8cd8c][i%4]);
 box(root,0,1.5,0,4,3,3.6,color);
 const cap=mesh(root,new THREE.ConeGeometry(3.1,1.7,4),roof,0,3.85,0);cap.rotation.y=Math.PI/4;
 box(root,0,1,1.85,1.1,1.8,.15,wood);
 const chest=new THREE.Group();chest.position.set(r.x+6,0,r.z-5);scene.add(chest);
 box(chest,0,.54,0,1.4,.8,.92,mat(0x8b5b35));
 box(chest,0,1,0,1.5,.26,1.05,mat(0xc9904b));
 box(chest,0,.74,.49,.23,.33,.06,mat(0xffdc78,.25));
 const switchGroup=new THREE.Group();switchGroup.position.set(r.x-6,0,r.z+5);scene.add(switchGroup);
 cylinder(switchGroup,0,.35,0,1.2,1.2,.7,mat(0x6b7c8e));
 ball(switchGroup,0,.91,0,.42,mat(0xf4bf65,.2));
 regionMarkers.push({x:r.x-5,z:r.z-5,label:'Heilzentrum '+r.name,region:i,kind:'heal'},
 {x:r.x+6,z:r.z-5,label:'Truhe '+r.name,region:i,kind:'chest'},
 {x:r.x-6,z:r.z+5,label:'Siegelrätsel '+r.name,region:i,kind:'puzzle'});
}
function regionAction(p){
 const r=regions[p.region];save.chests ||= {};save.puzzles ||= {};
 if(p.kind==='heal'){
  save.team.forEach(m=>{m.hp=maxHp(m);for(const id of SPEC[m.id].moves)ensurePP(m)[id]=maxPP(id)});
  stats();dialog('Heilzentrum · '+r.name,'Deine Taschis sind vollständig geheilt. Auch alle Attackenpunkte wurden aufgefüllt.',choice());return;
 }
 if(p.kind==='chest'){
  if(save.chests[r.id]){toast('Diese Schatztruhe wurde bereits geöffnet.');return}
  save.chests[r.id]=true;save.balls+=4;save.potions+=2;save.coins+=80+r.id*10;stats();
  dialog('Schatztruhe geöffnet!','Du findest 4 Taschibälle, 2 Tränke und '+(80+r.id*10)+' Sternmünzen.',choice());return;
 }
 if(save.puzzles[r.id]){toast('Dieses Rätsel wurde bereits gelöst.');return}
 const answer=(r.id*3+2)%3;
 const symbols=['Kristall','Flamme','Stern'];
 dialog('Siegelrätsel · '+r.name,'Ein altes Steintor zeigt drei Runen. Hinweis: Der '+(r.id+1)+'. Pfad trägt das Zeichen „'+symbols[answer]+'“. Wähle die richtige Rune.',[
 ...symbols.map((sym,i)=>[sym,()=>{
  if(i!==answer){dialog('Die Rune erlischt','Nicht ganz! Beobachte den Hinweis und versuche es erneut.',[['Noch einmal',()=>regionAction(p)],['Zurück',close]]);return}
  save.puzzles[r.id]=true;save.coins+=100;stats();
  dialog('Rätsel gelöst!','Das Siegel leuchtet auf. Du erhältst 100 Sternmünzen und darfst die regionale Arena herausfordern.',choice());
 }]),
 ['Später',close]
 ]);
}
const REGION_CHAMPIONS=['Meisterin Lin','Kapitän Marek','Donnerfürstin Edda','Hüterin Flora','Waldmeister Rian','Sturmmeister Taro','Glutkönigin Sina','Sternenhüter Aven','Nebelkönig Nox','Frostmeisterin Elin','Wipfelmeister Fynn','Donnerkönigin Ira','Kristallhüter Kai','Mondmeisterin Nova','Sonnenmeister Sol','Himmelsmeisterin Auri'];
function regionalChampion(i){
 save.champions ||= {};
 if(save.badges<=i){dialog('Regionale Meisterschaft','Gewinne zuerst den Arena-Orden von '+REGION_NAMES[i]+'.',choice());return}
 if(save.champions[i]){dialog('Regionaler Champion','Du hast '+REGION_CHAMPIONS[i]+' bereits besiegt und die Region gemeistert.',choice());return}
 const enemyId=['bluetling','quappi','blitzor','samenling','kaeferli','flatterling','glutdrach','funkli','geisterchen','panzerlon','bluetling','knister','felsling','geisterchen','glutzahn','blitzor'][i];
 dialog('Champion · '+REGION_NAMES[i],'<p>'+REGION_CHAMPIONS[i]+' fordert dich zum letzten Kampf dieser Region heraus. Erst danach gilt die Stadt als gemeistert.</p>',[
 ['Champion herausfordern',()=>battle(make(enemyId,Math.min(60,GYMS[i][2]+3)),false,null,null,i)],
 ['Später',close]
 ]);
}
function ancientMenu(){
 dialog('Die vier uralten Taschis','<p>In besonderen Regionen erzählen sich Reisende Legenden über seltene Wächter.</p>',[
 ...ANCIENTS.map(a=>[a.name+' · '+regions[a.region].name,()=>ancientEncounter(regions[a.region]),save.badges<=a.region]),
 ['Zurück',mainMenu]
 ]);
}

function championSelect(){
 dialog('Regionale Champions','<p>Nach jedem Orden erwartet dich ein eigener Champion. Besiegte Champions sind dauerhaft vermerkt.</p>',[
 ...regions.map(r=>[(save.champions?.[r.id]?'✓ ':'⚔ ')+REGION_CHAMPIONS[r.id]+' · '+r.name,()=>regionalChampion(r.id),save.badges<=r.id]),
 ['Zurück',mainMenu]
 ]);
}
function regionSelect(){
 dialog('Taschi-Regionen','<p>Jede Region besitzt zwei vorherrschende Taschi-Typen und eigene Begegnungen. Jede Stadt bietet Heilzentrum, Schatztruhe, Rätsel, Arena und Champion.</p><p>Freigeschaltet sind die bisherigen und die jeweils nächste Region.</p>',[
 ...regions.map(r=>[(r.id<save.badges?'✓ ':'➜ ')+(r.id+1)+'. '+r.name+' · '+REGION_TYPES[r.id].map(t=>TYPES[t]).join(' '),()=>{
  player.position.set(Math.max(-58,Math.min(58,r.x+9)),0,Math.max(-58,Math.min(58,r.z+7)));
  save.x=player.position.x;save.z=player.position.z;stats();close();toast('Ankunft in '+r.name);
 },r.id>save.badges || (r.id>0&&r.id===save.badges&&!save.champions?.[r.id-1])]),
 ['Zurück',mainMenu]
 ]);
}

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
  ['Im Dorf ausruhen',()=>{save.team.forEach(m=>{m.hp=maxHp(m);for(const move of SPEC[m.id].moves)ensurePP(m)[move]=maxPP(move)});close();toast('Deine Taschis sind ausgeruht!')}],
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

/* Adventurer design: face, hair, backpack, clothing details and gear. */
const skin=mat(0xf2c5a7),hairMat=mat(0x483831),cloth=mat(0xf3e3cb),pack=mat(0xbe764a);
const hairCap=ball(player,0,1.53,-.11,.45,hairMat);hairCap.scale.set(1,.52,.75);
for(const side of [-1,1]){ball(player,side*.155,1.43,.399,.052,mat(0x24384c,.25));ball(player,side*.157,1.445,.441,.018,mat(0xffffff,.15))}
box(player,0,.87,-.35,.68,.8,.26,pack);
box(player,0,.89,-.5,.34,.28,.06,cloth);
for(const side of [-1,1])box(player,side*.38,.89,.08,.13,.7,.22,mat(0xf1d19c));
box(player,0,.88,.24,.23,.28,.03,mat(0xffd47c));

const follower=new THREE.Group();scene.add(follower);let currentFollower=null;function updateFollower(){follower.clear();if(save.team.length){currentFollower=creature(save.team[0].id,.6);follower.add(currentFollower)}}updateFollower();
function stats(){ $('badge').textContent='✦ '+save.badges+'/16';$('count').textContent='◉ '+(save.team.length+save.box.length);$('coins').textContent='★ '+save.coins;$('location').textContent=save.badges===16?'Taschi-Meister':'Sonnenhain';persist()}
function toast(t,sec=3){$('message').textContent=t;$('message').style.display='block';toastUntil=performance.now()+sec*1000}

// Explicit game-state lifecycle: no movement/input leaks between modes.
const GAME_STATES=Object.freeze({BOOT:'boot',TITLE:'title',WORLD:'world',DIALOG:'dialog',BATTLE:'battle',RESULT:'result'});
let gameState=GAME_STATES.BOOT,returnState=GAME_STATES.WORLD;
function transition(next){
 const allowed={
  boot:['title'],title:['world','dialog'],world:['dialog','battle','title'],
  dialog:['world','battle','title','dialog','result'],battle:['battle','result','world','dialog'],
  result:['world','dialog','battle','title']
 };
 if(gameState===next)return true;
 if(!allowed[gameState]?.includes(next)){console.warn('TASCHI invalid state transition',gameState,next);return false}
 gameState=next;
 locked=next!==GAME_STATES.WORLD;
 document.body.dataset.gameState=next;
 return true;
}
function returnToWorld(){transition(booted?GAME_STATES.WORLD:GAME_STATES.TITLE)}

function dialog(title,desc,buttons){if(gameState!==GAME_STATES.BATTLE&&gameState!==GAME_STATES.RESULT){returnState=gameState;transition(GAME_STATES.DIALOG)}locked=true;gamepadFocus=0;$('panel').classList.remove('battle');$('title').textContent=title;$('desc').innerHTML=desc;$('options').replaceChildren();for(const [label,fn,disabled] of buttons){const b=document.createElement('button');b.className='option';b.textContent=label;b.disabled=!!disabled;b.addEventListener('click',fn);$('options').append(b)}$('panel').classList.add('show')}
function close(){returnToWorld();$('panel').classList.remove('show','battle');combat=null;updateBattleScene();stats()}
function choice(){return [['Weiter',close]]}
function pct(m){return Math.max(0,Math.min(100,100*m.hp/maxHp(m)))}
function hpbar(m){return '<div class="hp"><span style="width:'+pct(m)+'%"></span></div>'}
function summary(m){const s=SPEC[m.id];return '<b>'+TYPES[s.type]+' '+s.name+'</b> · Lv '+m.lv+' · '+m.hp+'/'+maxHp(m)+' KP'+hpbar(m)}
function first(){return save.team.find(m=>m.hp>0)}
function start(){dialog('Kapitel 1 · Der Ruf der Lichter','<p>Du stehst in Sonnenhain vor Professor Ulmes gläserner Kuppel. Darin warten drei Taschibälle auf dich.</p><p>Sprich zuerst mit dem Professor links neben der Kuppel und untersuche danach einen der Bälle.</p>',[['Abenteuer beginnen',close]])}
function chooseStarter(){dialog('Professor Ulmes Labor','<p>„Jedes Taschi ist etwas Besonderes. Entscheide mit dem Herzen! Du kannst später viele weitere Freunde finden.“</p>',[['🔥 Glutzahn · Feuer',()=>starter('glutzahn')],['💧 Plätscherchen · Wasser',()=>starter('plaetscher')],['🌱 Samenling · Pflanze',()=>starter('samenling')]])}
function starter(id){if(save.team.length)return;save.team.push(make(id,5));save.dex[id]=2;updateFollower();stats();dialog('Dein Abenteuer beginnt!', '<p>'+SPEC[id].name+' begleitet dich! Bewege dich zum hohen Gras, entdecke Taschis und besiege die 16 Arenen. Im Heilhaus werden deine Freunde geheilt.</p>',choice())}

const starterStation=[];
const lab=new THREE.Group();lab.position.set(0,0,13);scene.add(lab);
const stand=mat(0x6c94a7),gold=mat(0xf5cd77);
cylinder(lab,0,.3,0,4.25,4.5,.6,stand);
const dome=mesh(lab,new THREE.SphereGeometry(4.4,28,14,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x7bd1ee,transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}),0,.55,0);
for(let i=0;i<3;i++){
 const x=(i-1)*2.35;
 cylinder(lab,x,.75,0,.76,.88,.8,gold);
 const ballTop=mesh(lab,new THREE.SphereGeometry(.53,16,12,0,Math.PI*2,0,Math.PI/2),mat([0xf1845b,0x64b7e4,0x79be88][i]),x,1.28,0);
 const ballBottom=mesh(lab,new THREE.SphereGeometry(.53,16,12,0,Math.PI*2,Math.PI/2,Math.PI/2),mat(0xf3f2e9),x,1.28,0);
 ball(lab,x,1.28,.53,.13,stand);
 starterStation.push({x,z:13,starterBall:i,label:['Glutzahn','Plätscherchen','Samenling'][i]});
}
const professorEntry={x:-5,z:10,introProfessor:true,label:'Professor Ulme'};
const professorMesh=new THREE.Group();professorMesh.position.set(-5,0,10);scene.add(professorMesh);
box(professorMesh,0,.95,0,.85,1.2,.5,mat(0xe8f1f1));ball(professorMesh,0,1.88,0,.42,mat(0xe5bf9d));
for(let side of [-1,1])box(professorMesh,side*.52,.97,0,.19,1,.25,mat(0xe8f1f1));
function professorIntroduction(){
 if(save.team.length){dialog('Professor Ulme','„Dein Begleiter ist gut bei dir aufgehoben! Erkunde nun die sechzehn Regionen.“',choice());return}
 save.metProfessor=true;persist();
 dialog('Professor Ulme · Sonnenhain','„Willkommen! Unter der Glaskuppel liegen drei besondere Taschibälle. Gehe zum Podest und untersuche einen davon. Erst dann beginnt deine Reise.“',[['Zur Kuppel',()=>{close();toast('Untersuche einen der drei Bälle auf dem Podest.')}],['Noch eine Frage',()=>{dialog('Professor Ulme','„Feuer, Wasser oder Pflanze: Jedes Starter-Taschi besitzt eigene Stärken. Entscheide selbst.“',choice())}]]);
}
function inspectStarterBall(i){
 if(save.team.length){toast('Du hast deinen Starter bereits gewählt.');return}
 if(!save.metProfessor){dialog('Versiegelte Taschibälle','Die Bälle lassen sich erst öffnen, wenn du mit Professor Ulme gesprochen hast.',choice());return}
 const ids=['glutzahn','plaetscher','samenling'],id=ids[i];
 dialog('Starter-Taschi: '+SPEC[id].name,'<p>'+TYPES[SPEC[id].type]+' '+SPEC[id].type+' · Level 5</p><p>Willst du '+SPEC[id].name+' als ersten Begleiter wählen?</p>',[
 ['Ja, '+SPEC[id].name+' wählen',()=>starter(id)],
 ['Andere Bälle ansehen',close]
 ]);
}

const wild=['flatterling','felsling','geisterchen','quappi','kaeferli','knister','funkli','schlummi','fellino','blitzi','glutzahn','samenling','plaetscher'];
function findWild(habitat=null){
 if(!first()){toast('Dein Team braucht Heilung! Suche das Heilzentrum.');return}
 const r=regionAtPosition();
 battle(regionalEncounter(r.id,habitat),false);
}
function battle(enemy,isGym=false,trainerId=null,leagueIndex=null,championIndex=null){const me=first();if(!me){toast('Kein kampffähiges Taschi');return}save.dex[enemy.id] ||=1;const queue=isGym?Array.from({length:isGym<5?1:isGym<11?2:3},(_,i)=>make(wild[(isGym*3+i)%wild.length],Math.max(3,enemy.lv-2+i))):[];transition(GAME_STATES.BATTLE);combat={enemy,isGym,turn:0,queue:leagueIndex!==null?[make(['felsling','geisterchen','knister','bluetling','blitzor'][leagueIndex],enemy.lv-2),...queue]:queue,trainerId,leagueIndex,championIndex};battleStartedAt=performance.now();updateBattleScene();battleMenu('Ein '+SPEC[enemy.id].name+' erscheint!')}
function battleMenu(log='Was soll dein Taschi tun?'){transition(GAME_STATES.BATTLE);
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
 ...SPEC[me.id].moves.map(id=>[TYPES[MOVES[id][1]]+' '+MOVES[id][0]+' · '+ensurePP(me)[id]+'/'+maxPP(id)+' AP',()=>attack(id),ensurePP(me)[id]<=0]),
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
function attack(id){const c=combat;if(!c)return;const me=first();if(!me||ensurePP(me)[id]<=0){attackMenu();return}me.pp[id]--;persist();audioTone(260+MOVES[id][2]*4,.18,.05,'sawtooth');const e=c.enemy;const dmg=damage(me,e,id);e.hp=Math.max(0,e.hp-dmg);battleFoes.rotation.z=dmg?-.13:0;setTimeout(()=>{battleFoes.rotation.z=0},230);const log=SPEC[me.id].name+' nutzt '+MOVES[id][0]+'! '+dmg+' Schaden.';if(e.hp<=0){win(log);return}enemyTurn(log)}
function win(log){audioTone(784,.3,.07);const c=combat,me=first();const xp=35+c.enemy.lv*24;save.coins+=10+Math.floor(c.enemy.lv/2);me.xp+=xp;let extra=' +'+xp+' EP.';while(me.xp>=me.lv*me.lv*.9+12&&me.lv<60){me.xp-=Math.floor(me.lv*me.lv*.9+12);me.lv++;const old=maxHp({...me,lv:me.lv-1});me.hp+=maxHp(me)-old;extra+=' Level '+me.lv+'!';const evo=SPEC[me.id].evo;if(evo&&me.lv>=evo[1]){me.id=evo[0];save.dex[me.id]=2;extra+=' Entwicklung zu '+SPEC[me.id].name+'!'}}if(c.queue?.length){const next=c.queue.shift();c.enemy=next;updateBattleScene();persist();battleMenu(log+' '+SPEC[me.id].name+' bekommt '+xp+' EP. '+(c.queue.length+1)+' gegnerische Taschis warten noch.');return}if(c.championIndex!==null){save.champions ||= {};save.champions[c.championIndex]=true;save.coins+=200;extra+=' Champion der Region '+REGION_NAMES[c.championIndex]+' besiegt! ★200';}if(c.leagueIndex!==null){save.league=Math.max(Number(save.league)||0,c.leagueIndex+1);save.coins+=250;extra+=' Sternenliga-Prüfung '+save.league+'/5 gewonnen!';if(save.league===5)extra+=' Du bist Sternenmeister der Taschi-Region!';}if(c.trainerId!==null){save.trainers ||= {};save.trainers[c.trainerId]=1;if(c.trainerId>=200){save.guild ||= {};save.guild[c.trainerId-200]=true;save.balls+=6;save.coins+=150;extra+=' Die gefangenen Taschis sind befreit! Du erhältst 6 Bälle und ★150.'}else{save.coins+=70;extra+=' Trainerduell gewonnen! ★70'}}if(c.isGym){save.team.forEach(m=>m.hp=Math.max(m.hp,Math.round(maxHp(m)*.7)));save.badges=Math.max(save.badges,c.isGym);save.balls+=3;save.potions+=1;save.coins+=65+c.enemy.lv*3;extra+=' Licht-Siegel '+save.badges+'/16 verdient!';if(save.badges===16)extra+=' Alle 16 Siegel errungen! Die Sternenliga ist nun im Menü verfügbar.';if(save.badges%4===0)extra+=' Ein neues Storykapitel wurde freigeschaltet!'}save.wins++;updateFollower();combat=null;updateBattleScene();transition(GAME_STATES.RESULT);stats();dialog('Gewonnen!','<p>'+log+extra+'</p>',c.isGym&&save.badges%4===0?[['Neues Storykapitel',chapterDialog],['Weiterspielen',close]]:choice())}
function capture(){audioTone(510,.12,.06);const c=combat;if(!c||c.isGym||save.balls<=0)return;save.balls--;const e=c.enemy;const rate=Math.min(.94,SPEC[e.id].catch*(.65+1.5*(1-e.hp/maxHp(e))));if(Math.random()<rate){save.dex[e.id]=2;if(save.team.length<6)save.team.push(e);else save.box.push(e);combat=null;updateFollower();updateBattleScene();transition(GAME_STATES.RESULT);stats();dialog('Gefangen!','<p>'+SPEC[e.id].name+' ist jetzt dein Freund! '+(save.team.includes(e)?'Im Team.':'Im Lager.')+'</p>',choice())}else enemyTurn('Der Taschiball wackelt … oh nein, entwischt!')}
function potion(){if(!combat||save.potions<1)return;const m=first();save.potions--;m.hp=Math.min(maxHp(m),m.hp+35);enemyTurn(SPEC[m.id].name+' erhält bis zu 35 KP!')}
function team(){dialog('Dein Taschi-Team','<p>Tippe auf ein Taschi, um es nach vorne zu stellen. Maximale Teamgröße: sechs.</p>'+save.team.map((m,i)=>'<p>'+(i?'':'⭐ ')+summary(m)+'</p>').join('')+'<p>Lager: '+save.box.length+' · Tränke: '+save.potions+' · Bälle: '+save.balls+'</p>',[...save.team.map((m,i)=>[SPEC[m.id].name+' führen',()=>{save.team.splice(i,1);save.team.unshift(m);updateFollower();close()}]),['Lager verwalten',storage],['Abenteuerbuch',journalView],['Reisekarte',mapView],['Schließen',close]])}
function storage(){dialog('Taschi-Lager','<p>Hier kannst du Team-Taschis und gelagerte Taschis tauschen.</p>',[...save.box.map((m,i)=>['Aufnehmen: '+SPEC[m.id].name,()=>{if(save.team.length>=6){toast('Team ist voll');return}save.box.splice(i,1);save.team.push(m);updateFollower();storage()}]),...save.team.map((m,i)=>['Einlagern: '+SPEC[m.id].name,()=>{if(save.team.length<2){toast('Behalte mindestens ein Taschi');return}save.team.splice(i,1);save.box.push(m);updateFollower();storage()}]),['Zurück',team]])}
function dex(){dialog('Taschidex','<p>'+Object.keys(SPEC).length+' Arten: Entdecke regionale Taschis in Wiesen, Dörfern, Bergen und Höhlen.</p>'+Object.entries(SPEC).map(([id,s])=>'<div style="padding:7px;border-bottom:1px solid #ccd">'+(save.dex[id]?TYPES[s.type]+' '+s.name+(save.dex[id]===2?' ✓':' · gesehen'):'???')+'</div>').join(''),choice())}
function enterCave(c){const stage=caveSteps[c.name]||0;dialog(c.name,'<p>Vor dir liegt ein begehbares Höhlensystem mit drei Kristallen, wilden Taschis und einem Ausgang.</p>',[['Höhle betreten',()=>caveEnter(c)],['Tiefer erkunden',()=>{caveSteps[c.name]=(stage+1)%3;close();findWild()}],['Kristalle untersuchen',()=>{save.balls+=2;stats();dialog('Kristallfund','Du findest zwei Taschibälle zwischen den Kristallen.',choice())}],['Höhle verlassen',close]])}


// Original Taschi championship after all 16 region seals.
const STAR_LEAGUE=[
 ['Hüterin des Waldes','bluetling',46],
 ['Hüter des Meeres','panzerlon',49],
 ['Hüterin der Berge','felsling',52],
 ['Hüter des Sturms','blitzor',55],
 ['Sternenmeisterin Lyra','glutdrach',58]
];
function leagueMenu(){
 if(save.badges<16){dialog('Sternenliga','Erst mit allen 16 Licht-Siegeln darfst du die fünf Meisterprüfungen beginnen.',[['Zurück',close]]);return}
 const rank=Math.max(0,Math.min(5,Number(save.league)||0));
 if(rank===5){dialog('Sternenliga','Du bist Sternenmeister! Du kannst erneut antreten oder deinen Taschidex vervollständigen.',[['Erneut antreten',()=>{save.league=0;stats();leagueMenu()}],['Zurück',close]]);return}
 const opponent=STAR_LEAGUE[rank];
 dialog('Sternenliga · Prüfung '+(rank+1)+'/5','<p>'+opponent[0]+' erwartet dich. Jedes Duell zählt, dein Fortschritt bleibt gespeichert. Bereite dein Team gut vor.</p>',[
 ['Herausfordern',()=>{if(!first()){toast('Heile zuerst dein Team!');return}battle(make(opponent[1],opponent[2]),false,null,rank)}],
 ['Team ansehen',team],['Zurück',close]
 ]);
}
const STORY=[
 ['Das Erwachen','Im Sonnenhain verblasst das uralte Himmelslicht. Professor Ulme bittet dich, die 16 Licht-Siegel zusammenzuführen.'],
 ['Die Funken von Moosbach','Ein rätselhaftes Echo wandert durch die Wälder. Die ersten vier Licht-Siegel lassen die Karte des Sternengipfels leuchten.'],
 ['Das Geheimnis der Höhlen','Kristalle weisen auf eine vergessene Quelle der Taschi-Kraft hin. Acht Siegel eröffnen den zweiten Teil der Reise.'],
 ['Die Schatten über dem Tal','Zwölf Siegel sind vereint. Die letzten Prüfungen sollen zeigen, ob Mensch und Taschi einander wirklich vertrauen.'],
 ['Das letzte Licht','Alle sechzehn Siegel leuchten. Bestehe nun die fünf Prüfungen der Sternenliga, um Sternenmeister zu werden.']
];
function chapterIndex(){return save.badges>=16?4:save.badges>=12?3:save.badges>=8?2:save.badges>=4?1:0}
function chapterDialog(){
 const c=STORY[chapterIndex()];
 dialog('Kapitel '+(chapterIndex()+1)+' · '+c[0],'<p>'+c[1]+'</p><p>Aktuelle Aufgabe: '+(save.badges===16?'Bestehe die fünf Prüfungen der Sternenliga.':'Fordere '+GYMS[save.badges][0]+' heraus und gewinne das nächste Licht-Siegel.')+'</p>',[['Weiter',close],['Reisekarte',mapView]]);
}
function directionToNext(){
 if(save.badges>=16)return save.league>=5?'Sternenmeister · Region abgeschlossen':'Sternenliga · '+(save.league||0)+'/5 Meisterprüfungen (☰ Menü)';
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
 ['Der Sternengipfel','Sammle 16 Licht-Siegel und besiege anschließend alle fünf Prüfungen der Sternenliga.']
];
function questStatus(){const caught=Object.values(save.dex).filter(v=>v===2).length;return [
 save.team.length>0,
 caught>=2,
 save.badges>=16,
 (save.visited&&Object.keys(save.visited).length>=10)||false,
 save.badges>=16 && save.league>=5
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

async function toggleFullscreen(){
 try{
  if(document.fullscreenElement){await document.exitFullscreen()}
  else if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen()}
  else toast('Vollbild wird von diesem Browser nicht unterstützt.');
 }catch{toast('Vollbild ist hier nicht verfügbar.')}
}
function mainMenu(){if(!booted||combat)return;dialog('Taschi · Pause','<p>Dein Abenteuer wird automatisch gespeichert. Du kannst zusätzlich eine Backup-Datei sichern.</p>',[['Weiterspielen',close],['Zum Titelbildschirm',()=>{close();showTitle()}],['Steuerung & Controller',inputSettings],['Vollbild an/aus',()=>{close();toggleFullscreen()}],['Geschichte',chapterDialog],['Reiseführer',journeyMenu],['Regionen & Schnellreise',regionSelect],['Regionale Champions',championSelect],['Regionale Legenden',ancientMenu],['Sternenliga',leagueMenu],['Abenteuerbuch',journalView],['Reisekarte',mapView],['Spielstand exportieren',exportSave],['Spielstand importieren',importSave],['Speicherplätze',chooseSaveSlot],['Neues Spiel',restartGame]])}

function journalView(){const done=questStatus();dialog('Abenteuerbuch','<p>Deine Reise durch die Taschi-Region.</p>'+journal.map((q,i)=>'<p><b>'+(done[i]?'✓ ':'□ ')+q[0]+'</b><br>'+q[1]+'</p>').join('')+'<p>Siegel: '+save.badges+'/16 · Gefangene Arten: '+Object.values(save.dex).filter(v=>v===2).length+'/'+Object.keys(SPEC).length+'</p>',[['Zurück',close]])}

function journeyMenu(){
 const next=Math.min(save.badges,15);
 const list=GYMS.map((g,i)=>{
  const done=i<save.badges,now=i===save.badges;
  return '<p style="margin:7px 0;padding:8px;border-radius:9px;background:'+(now?'#ffe19b':'#eff5f8')+'"><b>'+(done?'✓':now?'➜':'◌')+' Route '+(i+1)+' · '+g[0]+'</b><br>Empfohlene Stufe '+g[2]+' · '+(done?'Siegel gewonnen':now?'Nächstes Ziel':'Noch nicht abgeschlossen')+'</p>';
 }).join('');
 dialog('Reiseführer · 16 Routen','<p>Von Sonnenhain bis zur Sternenliga. Sammle alle Licht-Siegel und qualifiziere dich für fünf Meisterprüfungen.</p><div style="max-height:42vh;overflow-y:auto">'+list+'</div><p>Sternenliga: '+(save.league||0)+'/5</p>',[
 ['Nächstes Ziel',()=>{close();toast(save.badges<16?'Arena '+(next+1)+': '+GYMS[next][0]:'Sternenliga im Pausemenü')}],
 ['Reisekarte',mapView],['Zurück',mainMenu]
 ]);
}

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

function interact(){if(gameState!==GAME_STATES.WORLD)return;if(!near){toast('Erkunde die Lichtung und das hohe Gras.');return}if(insideCave){caveInteract(near);return}if(near.guild){if(!save.team.length){toast('Wähle zuerst dein Starter-Taschi.');return}shadowGuildEvent(SHADOW_SITES.find(g=>g.x===near.x&&g.z===near.z));return}if(near.introProfessor){professorIntroduction();return}if(near.starterBall!==undefined){inspectStarterBall(near.starterBall);return}if(!save.team.length){toast('Sprich erst mit Professor Ulme und wähle ein Starter-Taschi.');return}recordVisit(near);if(near.cave){enterCave(near)}else if(near.npc!==undefined){regionalTalk(near)}else if(near.kind){regionAction(near)}else if(near.route!==undefined){routeInfo(near)}else if(near.trainer!==undefined){approachTrainer(near)}else if(near.village){villageVisit(near)}else if(near.label==='Professor Ulmes Labor'){dialog('Professor Ulme','<p>Die 16 Licht-Siegel machen dich zum Meister. Deine Reise beginnt im Sonnenhain. Sprich mit den Arena-Meistern!</p><p>Entdeckte Taschis: '+Object.keys(save.dex).length+'</p>',choice())}else if(near.label==='Heilhaus'){save.team.forEach(m=>m.hp=maxHp(m));stats();dialog('Schwester Hanna','<p>Alle Taschis sind wieder topfit! Pass gut auf sie auf.</p>',choice())}else if(near.label==='Fangladen'){shop()}else if(near.gym!==undefined){const i=near.gym;if(i>save.badges){toast('Besiege zuerst die vorherige Arena!');return}if(i<save.badges){dialog(near.label,'Du besitzt dieses Licht-Siegel bereits.',choice());return}if(!save.puzzles?.[i]){dialog('Arena verschlossen','Löse zunächst das Siegelrätsel dieser Stadt. Es befindet sich nahe der Arena.',choice());return}dialog('Arena: '+near.label,'<p>Fordere '+near.label+' heraus? Stufe '+GYMS[i][2]+'. Ein Sieg verleiht Licht-Siegel '+(i+1)+'.</p>',[['Kämpfen',()=>battle(make(GYMS[i][1],GYMS[i][2]),i+1)],['Später',close]])}}
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
const defaults={up:'w',down:'s',left:'a',right:'d',action:'e',menu:'escape',run:'shift',joystickSize:126,joystickOpacity:75,deadzone:.16,speed:1,camera:'follow',vibration:true,hand:'left',graphics:'balanced'};
let gamepadFocus=0;let controls;try{controls={...defaults,...JSON.parse(localStorage.getItem(INPUT_KEY)||'{}')}}catch{controls={...defaults}}
const keys=new Set(),joy=$('joy'),nub=$('nub');let joyX=0,joyY=0,gamepadX=0,gamepadY=0,gamepadLast={},remapping=null;
const normKey=e=>(e.key===' '?'space':e.key.toLowerCase());
function keyMatch(key,direction){return key===controls[direction]||({up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[direction]===key)}
function gamepadPoll(){
 const pads=navigator.getGamepads?.()||[];const pad=Array.from(pads).find(p=>p&&p.connected);
 if(!pad){gamepadX=gamepadY=0;($('padstate')||{textContent:''}).textContent='Kein Controller';gamepadLast={};return}
 ($('padstate')||{textContent:''}).textContent=pad.id.slice(0,65);
 const axis=(v)=>Math.abs(v)<controls.deadzone?0:Math.sign(v)*(Math.abs(v)-controls.deadzone)/(1-controls.deadzone);
 gamepadX=axis(pad.axes[0]||0);gamepadY=axis(pad.axes[1]||0);
 const pressed=i=>!!pad.buttons[i]?.pressed;
 const edge=(i,callback)=>{if(pressed(i)&&!gamepadLast[i])callback();gamepadLast[i]=pressed(i)};
 edge(0,()=>{if(gameState===GAME_STATES.WORLD)interact();else if($('panel').classList.contains('show')){const bs=[...$('options').querySelectorAll('button:not(:disabled)')];bs[Math.min(gamepadFocus,bs.length-1)]?.click()}else if(!booted)enterGame()});
 edge(1,()=>{if($('panel').classList.contains('show')&&!combat)close()});
 edge(9,()=>{if(booted){if(locked&&!combat)close();else if(!locked)mainMenu()}else enterGame()});
 edge(3,()=>{if(booted&&!locked)team()});
 const options=locked&&booted?[...$('options').querySelectorAll('button:not(:disabled)')]:[];
 const moveSelection=(delta)=>{if(!options.length)return;gamepadFocus=(gamepadFocus+delta+options.length)%options.length;options[gamepadFocus]?.focus()};
 edge(12,()=>moveSelection(-1));edge(13,()=>moveSelection(1));
 if(!locked&&pad.buttons[12]?.pressed)gamepadY=-1;if(!locked&&pad.buttons[13]?.pressed)gamepadY=1;
 if(pad.buttons[14]?.pressed)gamepadX=-1;if(pad.buttons[15]?.pressed)gamepadX=1;
}
function applyControls(){
 joy.style.width=joy.style.height=controls.joystickSize+'px';
 nub.style.left=nub.style.top=(controls.joystickSize-48)/2+'px';
 joy.style.opacity=String(controls.joystickOpacity/100);
 document.body.dataset.hand=controls.hand;
 if(typeof renderer!=='undefined'&&renderer){const dpr=controls.graphics==='performance'?1:controls.graphics==='quality'?Math.min(devicePixelRatio,2):Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.35:1.7);renderer.setPixelRatio(dpr)}
 localStorage.setItem(INPUT_KEY,JSON.stringify(controls));
}
function inputSettings(){
 const options=[
 ['Hand: '+(controls.hand==='left'?'Links':'Rechts'),()=>{controls.hand=controls.hand==='left'?'right':'left';applyControls();inputSettings()}],
 ['Joystickgröße: '+controls.joystickSize+'px',()=>{controls.joystickSize=controls.joystickSize>=170?100:controls.joystickSize+14;applyControls();inputSettings()}],
 ['Joystick-Sichtbarkeit: '+controls.joystickOpacity+'%',()=>{controls.joystickOpacity=controls.joystickOpacity>=100?40:controls.joystickOpacity+15;applyControls();inputSettings()}],
 ['Joystick-Totzone: '+Math.round(controls.deadzone*100)+'%',()=>{controls.deadzone=controls.deadzone>=.3?.08:+(controls.deadzone+.04).toFixed(2);applyControls();inputSettings()}],
 ['Kamera: '+(controls.camera==='follow'?'Nah':'Klassisch'),()=>{controls.camera=controls.camera==='follow'?'classic':'follow';applyControls();inputSettings()}],
 ['Grafik: '+controls.graphics,()=>{controls.graphics=controls.graphics==='balanced'?'performance':controls.graphics==='performance'?'quality':'balanced';applyControls();inputSettings()}],
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
 if(!e.repeat&&key===controls.menu){if(gameState===GAME_STATES.DIALOG&&!combat&&booted)close();else if(gameState===GAME_STATES.WORLD)mainMenu()}
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
 booted=false;transition(GAME_STATES.TITLE);document.body.classList.remove('playing');
 $('boot').classList.remove('hidden');$('boot').classList.add('ready');
 $('slotinfo').textContent='Speicherplatz '+slot+' · '+save.badges+'/16 Orden · '+save.team.length+' im Team';
 $('continue').textContent=save.team.length?'Abenteuer fortsetzen':'Abenteuer beginnen';
}
function enterGame(){
 booted=true;transition(GAME_STATES.WORLD);$('boot').classList.add('hidden');document.body.classList.add('playing');
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

const clock=new THREE.Clock();let time=0,walkPhase=0,wasMoving=false,battleStartedAt=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(.05,clock.getDelta());time+=dt;gamepadPoll();wasMoving=false;if(gameState===GAME_STATES.WORLD){const dx=Number([...keys].some(k=>keyMatch(k,'right')))-Number([...keys].some(k=>keyMatch(k,'left')))+joyX+gamepadX,dz=Number([...keys].some(k=>keyMatch(k,'down')))-Number([...keys].some(k=>keyMatch(k,'up')))+joyY+gamepadY,len=Math.hypot(dx,dz);if(len>.12){const speed=7*controls.speed*(keys.has(controls.run)?1.45:1);const vx=dx/len*dt*speed,vz=dz/len*dt*speed,nx=Math.max(insideCave?270:-60,Math.min(insideCave?330:60,player.position.x+vx)),nz=Math.max(insideCave?-24:-60,Math.min(insideCave?24:60,player.position.z+vz));if(insideCave||!colliders.some(c=>Math.hypot(nx-c.x,nz-c.z)<c.r+.45)){player.position.x=nx;player.position.z=nz}player.rotation.y=Math.atan2(dx,dz);walkPhase+=dt*(keys.has(controls.run)?17:11);wasMoving=true;steps+=dt;if(steps>1.8){steps=0;if(!insideCave){save.x=player.position.x;save.z=player.position.z;persist()}if(insideCave&&Math.random()<.3)findWild(['geist','gestein','wasser','elektro'][caves.indexOf(insideCave)]);if(!insideCave){const habitat=grass.find(g=>Math.hypot(g.x-save.x,g.z-save.z)<g.r);if(habitat&&Math.random()<.38)findWild(habitat.type)}}}}follower.position.lerp(new THREE.Vector3(player.position.x-1.3,.12+Math.sin(time*3)*.12,player.position.z+1.5),Math.min(1,dt*5));player.children[1].rotation.z=wasMoving?Math.sin(walkPhase)*.06:0;player.children[2].rotation.x=wasMoving?Math.sin(walkPhase)*.33:0;player.children[3].rotation.x=wasMoving?-Math.sin(walkPhase)*.33:0;player.children[0].position.y=1.35+(wasMoving?Math.abs(Math.sin(walkPhase))*.055:0);follower.rotation.y=player.rotation.y;follower.visible=!combat;player.visible=!combat;if(combat){battleFriends.position.y=Math.sin(time*2)*.07;battleFoes.position.y=Math.sin(time*2.2+1)*.06;const entry=Math.min(1,(performance.now()-battleStartedAt)/600);battleFriends.scale.setScalar(Math.max(.04,entry));battleFoes.scale.setScalar(Math.max(.04,entry))}
near=(insideCave?[{x:300,z:23,label:'Höhlenausgang',exit:true},...crystalLocations.map(([x,z],i)=>({x:300+x,z,label:'Kristall '+(i+1),crystal:i}))]:[...places,...gyms,...caves.map(c=>({...c,cave:true})),...villages.map(v=>({...v,label:v.name,village:true})),...routeTrainers.map(t=>({...t,label:'Trainer '+t.name})),...routeSignposts,...regionMarkers,...regionalNPCs,...starterStation,professorEntry,...SHADOW_SITES.map(g=>({...g,guild:true,label:'Schattengilde'}))]).map(p=>({...p,dist:Math.hypot(p.x-player.position.x,p.z-player.position.z)})).sort((a,b)=>a.dist-b.dist)[0];if(near.dist>9)near=null;$('interact').textContent=near?'✦ '+(near.exit?'Verlassen':near.crystal!==undefined?'Kristall':near.guild?'Schattengilde':near.introProfessor?'Professor':near.starterBall!==undefined?'Ball wählen':near.npc!==undefined?'Sprechen':near.kind==='heal'?'Heilen':near.kind==='chest'?'Truhe':near.kind==='puzzle'?'Rätsel':near.route!==undefined?'Wegweiser':near.trainer!==undefined?'Trainer':near.cave?'Höhle':near.village?'Dorf':near.gym!==undefined?'Arena':near.label==='Heilhaus'?'Heilen':near.label==='Fangladen'?'Shop':'Reden'):'Aktion · E';if(combat){camera.position.lerp(new THREE.Vector3(191,9,17),Math.min(1,dt*4));camera.lookAt(180,1.5,0)}else{camera.position.lerp(new THREE.Vector3(player.position.x+(controls.camera==='classic'?12:6.5),controls.camera==='classic'?19:9,player.position.z+(controls.camera==='classic'?18:11)),Math.min(1,dt*3.5));camera.lookAt(player.position.x,1.35,player.position.z-(controls.camera==='classic'?3.5:4))}$('objective').textContent=insideCave?'Höhlenexpedition · Drei Kristalle finden':directionToNext();soundtrack();if(performance.now()>miniNext){drawMinimap();miniNext=performance.now()+400}if(toastUntil&&performance.now()>toastUntil){$('message').style.display='none';toastUntil=0}renderer.render(scene,camera)}
stats();showTitle();animate();
