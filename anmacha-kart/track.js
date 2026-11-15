'use strict';
/* Strecken: geschlossene Spline -> gleichmäßig abgetastete Mittellinie (reine Mathematik, ohne Three.js). */
const Track = (() => {
  const DEFS = [
    { id: 'wiese', name: 'Funkturm-Wiese', theme: 'wiese', w: 20, sky: ['#2a78e8', '#79c4ff', '#e4f4ff'], ground: '#4cae3a', road: '#4b505c', wall: ['#e8412a', '#ffffff'], fog: '#cfeaff', fogR: [220, 760], light: [0.62, 0.62, '#ffffff', '#405030'], props: ['#2e9a3a', '#3fb84a', '#237a30', '#58c850'],
      pts: [[0, -190], [130, -190], [230, -120], [250, 0], [190, 100], [80, 80], [20, 150], [-60, 230], [-180, 200], [-230, 80], [-170, -30], [-230, -120], [-130, -190]] },
    { id: 'strand', name: 'Sonnen-Strand', theme: 'strand', w: 20, sky: ['#1f6fe0', '#6ec6ff', '#fff2c8'], ground: '#f0dc96', road: '#4a4d58', wall: ['#1a9ae0', '#ffffff'], fog: '#d8f0ff', fogR: [240, 800], light: [0.7, 0.75, '#fff6e0', '#a8d8ff'], props: ['#2f9a4a', '#46b85a', '#e8a23a', '#d8664a'],
      pts: [[0, -250], [140, -230], [240, -120], [210, 20], [300, 130], [230, 250], [90, 230], [0, 150], [-100, 230], [-240, 245], [-320, 120], [-250, 20], [-310, -80], [-220, -200], [-100, -170]] },
    { id: 'gruft', name: 'Geistergruft', theme: 'gruft', w: 19, sky: ['#05030f', '#241048', '#5a2a7a'], ground: '#17102a', road: '#3a3548', wall: ['#7a8090', '#4a4f60'], fog: '#1a0e30', fogR: [50, 330], light: [0.5, 0.38, '#9ab0ff', '#2a1a4a'], props: ['#4a4f60', '#5a5f70', '#3a3f50'],
      pts: [[0, -180], [120, -170], [200, -90], [170, 10], [80, 40], [105, 135], [200, 175], [190, 265], [80, 305], [-35, 255], [-55, 150], [-160, 120], [-255, 175], [-310, 70], [-270, -30], [-200, -85], [-215, -160], [-110, -195]] },
    { id: 'fantasia', name: 'Fantasia-Land', theme: 'fantasia', w: 21, sky: ['#7a5cff', '#ff9ad0', '#fff0b0'], ground: '#6ed89c', road: '#6a5a8a', wall: ['#ff6ac8', '#ffffff'], fog: '#f4d8ff', fogR: [200, 760], light: [0.8, 0.7, '#fff0ff', '#a8e8c8'], props: ['#ff6ac8', '#6ac8ff', '#ffd24a', '#a86aff', '#7cff9a'],
      pts: [[0, -200], [160, -230], [300, -150], [330, -20], [250, 80], [130, 60], [60, 160], [110, 270], [0, 340], [-130, 300], [-170, 190], [-280, 170], [-340, 60], [-305, -75], [-225, -110], [-225, -210], [-120, -265]] },
    { id: 'neon', name: 'Neon-City', theme: 'neon', w: 18, sky: ['#05030f', '#2a0a5a', '#ff1a8a'], ground: '#05040f', road: '#1c1c2c', wall: ['#7CFF6A', '#00e5ff'], fog: '#150a30', fogR: [120, 520], light: [0.75, 0.8, '#ffffff', '#303050'], props: ['#1a2a6a', '#5a1a6a', '#0a5a6a', '#6a1a3a'],
      pts: [[0, -210], [150, -210], [250, -130], [250, -10], [170, 60], [205, 165], [120, 255], [-5, 220], [-45, 135], [-170, 160], [-275, 100], [-275, -20], [-205, -105], [-185, -190], [-100, -235]] }
  ];
  // Zusätzliche eigenständige Streckenlayouts mit eigenen Farbwelten und Kurvenprofilen.
  // Die bestehenden fünf Strecken und ihre Indizes bleiben unverändert.
  const extra = [
    { id: 'vulkan', name: 'Lavasturm-Ring', base: 2, theme: 'neon', sky: ['#21080a','#9e2812','#f8a342'], ground:'#39201d', road:'#43383a', wall:['#ff5b17','#ffd36c'], fog:'#5b211a', fogR:[125,540], light:[0.6,0.85,'#ffb773','#692a21'], props:['#9e3e24','#f1712c','#6b2520'] },
    { id: 'eis', name: 'Eiskristall-Piste', base: 1, theme: 'fantasia', sky: ['#316da8','#bbecff','#ffffff'], ground:'#c5eaf2', road:'#9fb4c9', wall:['#60c8ff','#ffffff'], fog:'#e6faff', fogR:[210,770], light:[0.75,0.8,'#ffffff','#9ad6e8'], props:['#ffffff','#87d8f5','#b0a4f6'] },
    { id: 'dschungel', name: 'Dschungel-Express', base: 0, theme: 'wiese', sky:['#145f67','#65bba2','#e9ffa8'], ground:'#286a31', road:'#4a5241', wall:['#eacb47','#f8f5c6'], fog:'#b7e0a3', fogR:[150,630], light:[0.65,0.66,'#ffefbc','#214b2e'], props:['#176331','#34954b','#a2b83d'] },
    { id: 'kosmos', name: 'Sternen-Highway', base: 4, theme: 'neon', sky:['#030418','#19105c','#ba55ff'], ground:'#100d29', road:'#29204c', wall:['#bc77ff','#40f4ff'], fog:'#1a1350', fogR:[130,640], light:[0.6,0.75,'#c8baff','#182255'], props:['#512ca0','#1366be','#bb31b0'] },
    { id: 'wueste', name: 'Wüsten-Rallye', base: 1, theme: 'strand', sky:['#7d9ec1','#ffd49c','#fff4cb'], ground:'#ce985b', road:'#856c58', wall:['#eaa43c','#ffffff'], fog:'#ffe0af', fogR:[230,800], light:[0.75,0.85,'#ffe4b2','#8e5b38'], props:['#ab6e3d','#d29a52','#786049'] },
    { id: 'regenbogen', name: 'Regenbogen-Boulevard', base: 3, theme: 'fantasia', sky:['#5a67e8','#ffb0dc','#fef5b2'], ground:'#5dcbae', road:'#6f6194', wall:['#fa65c5','#67fff2'], fog:'#f1d5ff', fogR:[250,850], light:[0.8,0.8,'#ffffff','#72b88a'], props:['#f56aac','#ffd850','#54ecba','#7f87ff'] }
  ];
  extra.forEach((e, index) => {
    const origin = DEFS[e.base], angle = (index + 1) * 0.21, cs = Math.cos(angle), sn = Math.sin(angle);
    const pts = origin.pts.map(([x,z], i) => {
      const wave = 1 + 0.13 * Math.sin(i * 1.91 + index * 0.7);
      return [Math.round((x * cs - z * sn) * wave * 1.1), Math.round((x * sn + z * cs) * wave * 1.1)];
    });
    DEFS.push({ ...origin, ...e, pts, w: 20 });
  });
  // Eigenständige Hommagen an allgemeine Fantasy-/JRPG-Motive; keine Fremdmarken, Figuren oder Original-Levels.
  // ZOTIK und Bunte Insel sind hauseigene Themen. Alle Strecken erhalten neue Kontrollpunkte und eigene Rennmechaniken.
  const themed = [
    { id:'herzportal', name:'Herzportal-Boulevard', base:3, theme:'fantasia', sky:['#39286e','#d877db','#ffe5bf'], ground:'#5a468f', road:'#72629c', wall:['#ffc1f1','#72dfff'], fog:'#c6a9f4', fogR:[180,710], light:[0.78,0.68,'#ffddf8','#56337f'], props:['#e2a7ff','#fff4c4','#78d9f7'], mechanic:'portal' },
    { id:'kristallsturm', name:'Kristallsturm-Pass', base:2, theme:'gruft', sky:['#213659','#729bd6','#e7f8ff'], ground:'#556e98', road:'#576b80', wall:['#80edff','#e4fbff'], fog:'#b8d7fa', fogR:[170,670], light:[0.73,0.78,'#e5ffff','#5879ab'], props:['#62dfff','#c9a7ff','#78aef7'], mechanic:'crystal' },
    { id:'monsterfreunde', name:'Monsterfreunde-Safari', base:0, theme:'wiese', sky:['#4b9bd0','#baf4ff','#fffbc9'], ground:'#82b961', road:'#718365', wall:['#ffcb71','#ffffff'], fog:'#d7f3cc', fogR:[200,770], light:[0.83,0.72,'#ffffff','#5f8f48'], props:['#f6ba58','#72dca8','#c5e874'], mechanic:'safari' },
    { id:'ahnenruinen', name:'Ahnenruinen-Ring', base:2, theme:'gruft', sky:['#263449','#74828b','#ddc89a'], ground:'#667665', road:'#666764', wall:['#d2bc8e','#f5e0b5'], fog:'#9da695', fogR:[150,600], light:[0.64,0.67,'#ffebc9','#4c5e53'], props:['#b7a079','#8da790','#d2c7a2'], mechanic:'ruins' },
    { id:'drachenflug', name:'Drachenflug-Tal', base:3, theme:'fantasia', sky:['#326dc2','#9dcaf8','#fff0cf'], ground:'#78a983', road:'#79749e', wall:['#fcad63','#fff2b2'], fog:'#c1dcfa', fogR:[200,790], light:[0.79,0.75,'#fff2dc','#5d8d91'], props:['#f6a45a','#92d9c6','#bf8cf8'], mechanic:'dragon' },
    { id:'splitterwelten', name:'Splitterwelten-Kurs', base:4, theme:'neon', sky:['#251054','#933cba','#f6aa63'], ground:'#302149', road:'#343351', wall:['#ff963d','#8debff'], fog:'#503876', fogR:[165,660], light:[0.7,0.8,'#ffca8c','#503c8b'], props:['#f89339','#6ad7e6','#bf79ff'], mechanic:'shards' },
    { id:'farbeninsel', name:'Farbeninsel-Rundkurs', base:1, theme:'strand', sky:['#429ee6','#b6efff','#ffefbc'], ground:'#87d18a', road:'#82a5a1', wall:['#ff93c8','#ffffff'], fog:'#cbf9ef', fogR:[230,850], light:[0.82,0.76,'#ffffff','#75b2ac'], props:['#fd97cb','#fcd46c','#84e9ac'], mechanic:'island' }
  ];
  themed.forEach((theme, index) => {
    const source = DEFS[theme.base], spin = 0.33 * (index + 1), cs = Math.cos(spin), sn = Math.sin(spin);
    const pts = source.pts.map(([x,z], i) => {
      const scale = 1.07 + (index === 3 ? 0.04 : 0.09) * Math.sin(i * 1.6 + index * 0.74) + (index === 3 ? 0.035 : 0.12) * Math.sin(i * (index % 2 ? 2.1 : 1.3) + index);
      return [Math.round((x * cs - z * sn) * scale), Math.round((x * sn + z * cs) * scale)];
    });
    DEFS.push({ ...source, ...theme, pts, w: index === 2 || index === 6 ? 23 : 20 });
  });
  // Weltentour: neun Strecken in den Welten der easygames (eigene Layouts, Höhenprofile und Kulissen in view.js → tourLandscape).
  // Rennmechanik wie überall; nur Optik und Höhenprofil sind neu. Indizes 18–26.
  const tour = [
    {"id":"zotik","name":"Zotiks Märchenwald","world":"zotik","desc":"Mit Fuchs Zotik durch Sherwood: Riesenpilze, Burgtürme und Laternen im Wald.","w":20,"theme":"wiese","sky":["#1d3b6e","#6fb0e8","#fbe6b0"],"ground":"#3f8a3a","road":"#4a4a52","wall":["#7a4a2a","#e8d4a0"],"curb":["#7a4a2a","#f4e4b0"],"fog":"#bfe0c8","fogR":[160,650],"light":[0.7,0.75,"#fff0d0","#2f5a2a"],"props":["#2e7d32","#43a047","#8d6e63","#ffb74d"],"profile":[[0,0],[0.14,0],[0.24,6],[0.36,6],[0.44,0],[0.66,0],[0.74,4],[0.84,4],[0.9,0],[1,0]],"pts":[[99,-219],[189,-215],[231,-133],[325,-61],[296,28],[151,87],[168,229],[99,301],[-30,216],[-113,223],[-205,193],[-236,127],[-324,64],[-300,-25],[-153,-84],[-169,-200],[-94,-300],[32,-215]]},
    {"id":"taschi","name":"Taschi-Lichtertal","world":"taschi","desc":"Abendrot im Tal der 16 Lichter – leuchtende Laternen und neugierige Taschis am Wegesrand.","w":20,"theme":"wiese","sky":["#160c3a","#5a3a9a","#ffb27a"],"ground":"#4f7f45","road":"#3d3b4f","wall":["#ffd54a","#3a2f6a"],"curb":["#ffd54a","#3a2f6a"],"fog":"#6a4a8a","fogR":[130,560],"light":[0.62,0.62,"#ffd8b0","#3a2a5a"],"props":["#ffd54a","#ff8a65","#4dd0e1","#ba68c8"],"profile":[[0,0],[0.2,0],[0.3,8],[0.45,8],[0.55,0],[1,0]],"pts":[[-235,145],[-327,75],[-231,-66],[-232,-157],[-111,-201],[-16,-154],[92,-295],[234,-241],[166,-60],[227,-1],[227,118],[152,164],[86,340],[-32,280],[-64,115]]},
    {"id":"aeru","name":"AERU-Sterneninseln","world":"aeru","desc":"Schwebende Inseln über dem Wolkenmeer – mit Drachenfelsen und Sternenbögen.","w":20,"theme":"fantasia","sky":["#0b1a3a","#3a5aa8","#ffc0d8"],"ground":"#2a5a8a","road":"#5a5470","wall":["#ffe08a","#7a6ad0"],"curb":["#ffe08a","#7a6ad0"],"fog":"#8aa0d8","fogR":[180,760],"light":[0.72,0.75,"#ffe8f0","#3a4a7a"],"props":["#8ae0a0","#ffd08a","#c0a0ff","#f0f0ff"],"profile":[[0,0],[0.1,0],[0.2,12],[0.35,12],[0.45,4],[0.55,4],[0.65,14],[0.8,14],[0.9,0],[1,0]],"pts":[[151,190],[15,143],[-45,215],[-139,211],[-212,150],[-373,144],[-383,52],[-267,-50],[-254,-168],[-126,-182],[-28,-135],[52,-221],[141,-207],[187,-148],[375,-143],[381,-51],[268,48],[256,164]]},
    {"id":"bunte","name":"Bunte-Insel-Hafen","world":"bunte","desc":"Quer über die Bunte Insel: Spielzeugladen, Seifenblasen, Leuchtturm-Mole und Inselbahn.","w":20,"theme":"strand","sky":["#2a8ae8","#8ad8ff","#fff4d0"],"ground":"#3cc0d0","road":"#55606a","wall":["#ff5a8a","#ffffff"],"curb":["#ff5a8a","#ffe14a"],"fog":"#d0f0ff","fogR":[240,850],"light":[0.72,0.78,"#ffffff","#5a98a8"],"props":["#ff5a8a","#ffd24a","#4ac8ff","#7cff9a","#b07aff"],"land":"#55c043","profile":[[0,0],[0.3,0],[0.38,5],[0.5,5],[0.58,0],[1,0]],"pts":[[-14,252],[-119,284],[-156,173],[-272,120],[-288,46],[-149,-42],[-179,-136],[-135,-180],[-39,-157],[8,-245],[121,-282],[156,-172],[268,-122],[272,-27],[148,45],[179,131],[121,178],[46,153]]},
    {"id":"leuchtfeuer","name":"Leuchtfeuer-Nordstrand","world":"leuchtfeuer","desc":"Warnholm bei Sonnenuntergang: Dünen, Strandkörbe und der große Leuchtturm.","w":20,"theme":"strand","sky":["#1a2a4a","#e0806a","#ffd8a0"],"ground":"#3a7a9a","road":"#4a4c56","wall":["#d0302a","#ffffff"],"curb":["#d0302a","#ffffff"],"fog":"#e8b8a0","fogR":[150,650],"light":[0.62,0.8,"#ffc890","#4a5a7a"],"props":["#c8b890","#5a7a5a","#d0302a","#ffffff"],"land":"#e2d2a4","profile":[[0,0],[0.15,0],[0.22,4],[0.3,4],[0.38,0],[0.6,0],[0.7,6],[0.8,6],[0.88,0],[1,0]],"pts":[[234,39],[302,190],[196,248],[42,202],[-38,259],[-146,245],[-172,171],[-285,132],[-364,11],[-215,-72],[-120,-103],[-107,-276],[12,-313],[106,-251],[210,-251],[255,-150],[176,-35]]},
    {"id":"sonnenhof","name":"Sonnenhof-Felder","world":"sonnenhof","desc":"Über Feldwege am Sonnenhof: Windmühle, Scheunen, Heuballen und Sonnenblumen.","w":20,"theme":"wiese","sky":["#3a8ae8","#a8dcff","#fff8d8"],"ground":"#8acb5a","road":"#6a5a4a","wall":["#a0522d","#f5deb3"],"curb":["#c0392b","#ffffff"],"fog":"#e8f8d8","fogR":[220,800],"light":[0.8,0.85,"#fff4d0","#6a8a3a"],"props":["#f4d03f","#e67e22","#8bc34a","#c0392b"],"profile":[[0,0],[0.25,0],[0.35,5],[0.45,0],[0.6,0],[0.7,7],[0.8,0],[1,0]],"pts":[[246,115],[201,268],[61,219],[-25,278],[-122,243],[-117,97],[-235,65],[-272,-77],[-159,-154],[-130,-293],[-31,-333],[52,-163],[150,-194],[227,-137],[179,-1]]},
    {"id":"ricopoly","name":"RicoPoly-Metropolis","world":"ricopoly","desc":"Nachtrennen durch die Metropole: Hochhäuser in Straßenfarben, Hotels und eine Hochstraße.","w":20,"theme":"neon","sky":["#05061a","#1a1a5a","#ff6a3a"],"ground":"#2a2d38","road":"#22242e","wall":["#ffd24a","#20232e"],"curb":["#ffd24a","#222222"],"fog":"#2a1a3a","fogR":[140,600],"light":[0.58,0.7,"#cfd8ff","#202030"],"props":["#8b4513","#87ceeb","#ff69b4","#ffa500","#ff2a2a","#ffe600","#1fa04a","#2a3aa8"],"profile":[[0,0],[0.3,0],[0.4,10],[0.55,10],[0.65,0],[1,0]],"pts":[[69,170],[-14,149],[-126,275],[-216,257],[-219,131],[-264,62],[-230,-29],[-110,-77],[-103,-182],[-39,-328],[67,-285],[104,-157],[202,-160],[242,-106],[213,-23],[252,91],[207,197]]},
    {"id":"wolken","name":"Wolkenhopser-Himmel","world":"wolken","desc":"Hoch über dem Wolkenmeer: Hopsis Plattformen, Federn, Trampoline und Sternschnuppen.","w":20,"theme":"fantasia","sky":["#2a62d8","#7ab8ff","#e8f4ff"],"ground":"#c8dcff","road":"#7a8ab8","wall":["#ff9ad0","#ffffff"],"curb":["#ffd24a","#ffffff"],"fog":"#d6e8ff","fogR":[200,760],"light":[0.75,0.78,"#ffffff","#8aa8e0"],"props":["#ffffff","#ffd24a","#7cff9a","#ff9ad0"],"profile":[[0,0],[0.1,0],[0.2,10],[0.3,16],[0.4,16],[0.5,8],[0.6,8],[0.7,14],[0.82,14],[0.92,0],[1,0]],"pts":[[-242,-85],[-85,-102],[-63,-270],[76,-283],[94,-98],[253,-104],[313,-20],[232,89],[84,105],[52,292],[-81,269],[-87,105],[-242,107],[-311,3]]},
    {"id":"huepf","name":"Hüpfstraßen-Klötzchenstadt","world":"huepf","desc":"Klötzchen-Look wie in der Hüpfstraße: Autos, Laster, Fluss mit Baumstämmen und Bahnübergang.","w":20,"theme":"wiese","sky":["#4aa0e8","#a0e0ff","#f0fff0"],"ground":"#6ad04a","road":"#3a3e48","wall":["#ffffff","#ff4a4a"],"curb":["#ffffff","#222222"],"fog":"#d8f4ff","fogR":[220,800],"light":[0.85,0.8,"#ffffff","#5a9a4a"],"props":["#ff4a4a","#4a8aff","#ffd24a","#7a4a2a","#4ad04a"],"profile":[[0,0],[0.45,0],[0.52,5],[0.6,5],[0.67,0],[1,0]],"pts":[[96,-266],[241,-291],[278,-200],[204,-66],[255,16],[254,121],[177,195],[121,325],[19,328],[-64,200],[-156,212],[-255,160],[-266,83],[-348,-14],[-245,-135],[-126,-144],[-89,-239],[-8,-291]]}
  ];
  tour.forEach(t => DEFS.push(t));
  // Oma-Welt (aus „Oma-Rennen“ übernommen): sechs Stadt-Strecken mit Omas auf Raketen-Rollatoren. Indizes 27–32, Kulissen in oma.js.
  const oma = [
    { id: 'omamarkt', scene: 'markt', name: 'Marktplatz-Meile', theme: 'gruft', sky: ['#3a8ae8', '#9fd2ff', '#fff4dc'], ground: '#b8a890', road: '#8a7f74', wall: ['#c03a5a', '#ffffff'], curb: ['#e84a5a', '#ffffff'], fog: '#dbe8f5', fogR: [200, 720], light: [0.68, 0.85, '#fff4dc', '#7a6a5a'], desc: 'Kopfsteinpflaster, Marktstände und Kirchturm.',
      pts: [[0, -200], [150, -210], [250, -150], [260, -40], [180, 30], [220, 140], [150, 240], [20, 220], [-40, 130], [-150, 190], [-260, 130], [-250, 0], [-180, -90], [-200, -180], [-100, -230]] },
    { id: 'omapark', scene: 'park', name: 'Kurpark-Kurven', theme: 'wiese', mechanic: 'safari', sky: ['#2f7ee0', '#a8e0ff', '#fffbe0'], ground: '#5cb84a', road: '#c8b48a', wall: ['#2f7a2a', '#ffffff'], curb: ['#2f7a2a', '#f4f0d8'], fog: '#d8f0d8', fogR: [200, 740], light: [0.7, 0.85, '#fffbe0', '#3a6a2a'], desc: 'Springbrunnen, Musikpavillon – und freche Tauben auf der Strecke.',
      pts: [[0, -230], [170, -220], [280, -120], [230, -10], [300, 90], [250, 220], [110, 250], [30, 170], [-70, 250], [-220, 230], [-300, 110], [-210, 20], [-290, -90], [-200, -200]] },
    { id: 'omamall', scene: 'mall', name: 'Einkaufszentrum', theme: 'fantasia', mechanic: 'portal', sky: ['#5a3a8a', '#d080ff', '#ffe0f8'], ground: '#e8e0f0', road: '#bfb6cc', wall: ['#ff2d95', '#00e5ff'], curb: ['#ff2d95', '#ffffff'], fog: '#f0e0ff', fogR: [180, 680], light: [0.75, 0.75, '#ffe0f8', '#8a6aaa'], desc: 'Rolltreppen-Abkürzungen und Schaufensterbummel.',
      pts: [[0, -180], [140, -200], [240, -110], [200, -10], [110, 10], [130, 120], [240, 170], [200, 270], [60, 280], [-60, 200], [-170, 250], [-280, 170], [-250, 40], [-150, -10], [-230, -110], [-140, -200]] },
    { id: 'omastrand', scene: 'strand', name: 'Strandpromenade', theme: 'strand', mechanic: 'island', sky: ['#ff8a5a', '#ffc08a', '#fff0c0'], ground: '#f0d898', road: '#a89a88', wall: ['#2a6ad0', '#ffffff'], curb: ['#2a6ad0', '#ffffff'], fog: '#ffe0c0', fogR: [220, 800], light: [0.66, 0.8, '#ffc890', '#8a6a4a'], land: '#f0d898', desc: 'Sonnenuntergang, Strandkörbe und Möwen.',
      pts: [[0, -260], [200, -250], [320, -150], [300, -20], [340, 120], [250, 240], [80, 250], [-50, 180], [-180, 250], [-320, 200], [-340, 40], [-260, -80], [-300, -190], [-160, -250]] },
    { id: 'omaxmas', scene: 'xmas', name: 'Weihnachtsmarkt', theme: 'gruft', mechanic: 'ruins', sky: ['#060a24', '#1a2a5a', '#4a3a7a'], ground: '#eef4ff', road: '#7a8094', wall: ['#d0202a', '#ffffff'], curb: ['#d0202a', '#ffffff'], fog: '#2a3050', fogR: [120, 560], light: [0.6, 0.55, '#ffd8a0', '#4a5a8a'], desc: 'Lichterketten, Schnee und Lebkuchenstände.',
      pts: [[0, -200], [120, -210], [210, -140], [160, -40], [230, 40], [250, 160], [150, 250], [20, 230], [-30, 120], [-140, 90], [-240, 170], [-310, 60], [-240, -60], [-260, -170], [-130, -220]] },
    { id: 'omagrusel', scene: 'grusel', name: 'Geisterstunde im Altenheim', theme: 'gruft', mechanic: 'dragon', sky: ['#05030f', '#22104a', '#5a2a7a'], ground: '#2a2440', road: '#4a4458', wall: ['#ff7a1a', '#3a3a4a'], curb: ['#ff7a1a', '#2a2a30'], fog: '#1a1030', fogR: [80, 420], light: [0.5, 0.5, '#b0a0ff', '#2a1a4a'], desc: 'Mitternacht, Kürbisse – und Gespenster auf dem Flur.',
      pts: [[0, -220], [160, -240], [270, -160], [250, -50], [150, -10], [200, 110], [300, 170], [230, 280], [60, 270], [-40, 180], [-150, 260], [-290, 220], [-320, 80], [-220, -20], [-280, -140], [-170, -230]] }
  ];
  oma.forEach(t => DEFS.push({ ...t, world: 'oma', w: 20, pts: t.pts.map(([x, z]) => [Math.round(x * 1.15), Math.round(z * 1.15)]), props: [t.wall[0], t.wall[1], t.ground, t.road] }));
  // Eigene Streckenform je Strecke: Polygon mit Eckradien [x, z, r] (Fahrtrichtung = Reihenfolge, Start in der Mitte der ersten Kante).
  // Büroklammer, Wellen-Strand, Kartbahn, Grand Prix, H-Block, Alpha-Schleife und Acht mit Brücke, Serpentinen, Herz, Stern, Kleeblatt …
  const LAYOUT = {
    wiese: { w: 20, p: [[-380,-110,95],[380,-110,95],[380,110,95],[60,110,30],[0,60,30],[-60,110,30],[-380,110,95]] },
    strand: { w: 21, p: [[-399,-161,67],[399,-161,76],[399,162,57],[285,86,43],[171,181,43],[57,86,43],[-57,181,43],[-171,86,43],[-285,181,43],[-399,162,67]] },
    gruft: { w: 17, p: [[-200,-170,32],[200,-170,32],[200,-40,32],[60,-40,28],[60,50,28],[200,50,32],[200,170,32],[-80,170,30],[-80,60,28],[-200,60,32]] },
    fantasia: { w: 24, p: [[-476,-221,81],[357,-221,99],[476,-51,81],[323,34,63],[408,187,81],[170,272,72],[51,136,50],[-68,255,63],[-289,255,81],[-357,68,54],[-476,34,72]] },
    neon: { w: 18, p: [[-295,-213,27],[-107,-213,23],[-107,-98,23],[107,-98,23],[107,-213,23],[295,-213,27],[295,213,27],[107,213,23],[107,98,23],[-107,98,23],[-107,213,23],[-295,213,27]] },
    vulkan: { w: 20, cross: 1, p: [[-420,300,60],[420,300,60],[-180,-130,90],[0,-400,120],[180,-130,90]] },
    eis: { w: 20, cross: 1, p: [[-380,-200,120],[-380,200,120],[380,-200,120],[380,200,120]] },
    dschungel: { w: 19, p: [[-344,-189,63],[164,-189,63],[246,-74,54],[-131,-74,36],[-131,8,36],[246,8,54],[344,123,63],[246,213,54],[-246,213,54],[-344,115,54]] },
    kosmos: { w: 24, p: [[-480,-150,140],[480,-150,140],[480,150,140],[60,150,25],[20,110,25],[-20,110,25],[-60,150,25],[-480,150,140]] },
    wueste: { w: 23, p: [[-520,240,190],[0,320,600],[520,240,190],[0,-420,190]] },
    regenbogen: { w: 20, p: [[-502,125,60],[-398,-74,220],[-220,-211,220],[0,-260,220],[220,-211,220],[398,-74,220],[502,125,60],[299,121,60],[208,4,160],[74,-62,160],[-74,-62,160],[-208,4,160],[-299,121,60]] },
    herzportal: { w: 20, p: [[0,360,50],[-300,80,120],[-380,-180,120],[-180,-320,100],[0,-200,40],[180,-320,100],[380,-180,120],[300,80,120]] },
    kristallsturm: { w: 18, p: [[-256,-224,63],[141,-224,45],[141,-144,45],[-160,-144,45],[-160,-64,45],[141,-64,45],[141,16,45],[-160,16,45],[-160,96,45],[141,96,54],[141,176,54],[-256,176,63]] },
    monsterfreunde: { w: 21, p: [[-300,-260,140],[300,-260,150],[420,40,140],[200,260,120],[60,120,70],[-80,260,110],[-380,140,140],[-400,-120,120]] },
    ahnenruinen: { w: 20, p: [[0,-400,80],[180,-220,30],[220,-230,30],[400,0,80],[220,180,30],[180,230,30],[0,400,80],[-180,220,30],[-220,230,30],[-400,0,80],[-220,-180,30],[-180,-230,30]] },
    drachenflug: { w: 20, p: [[-176,-40,54],[176,-40,54],[352,-229,108],[528,0,126],[352,229,108],[176,40,54],[-176,40,54],[-352,229,108],[-528,0,126],[-352,-229,108]] },
    splitterwelten: { w: 20, p: [[0,-430,45],[129,-178,80],[409,-133,45],[209,68,80],[253,348,45],[0,220,80],[-253,348,45],[-209,68,80],[-409,-133,45],[-129,-178,80]] },
    farbeninsel: { w: 22, p: [[-203,-297,120],[0,-360,120],[203,-297,120],[130,-75,60],[359,-27,120],[312,180,120],[156,325,120],[0,150,60],[-156,325,120],[-312,180,120],[-359,-27,120],[-130,-75,60]] },
    zotik: { w: 20, p: [[-303,246,99],[303,246,99],[303,-230,81],[123,-230,63],[123,82,63],[-123,82,63],[-123,-230,63],[-303,-230,81]] },
    taschi: { w: 20, p: [[-320,-320,110],[320,-320,110],[90,0,60],[320,320,110],[-320,320,110],[-90,0,60]] },
    aeru: { w: 20, p: [[-422,-264,81],[53,-264,63],[-53,-70,41],[422,-70,81],[422,264,63],[-53,264,63],[53,70,41],[-422,70,81]] },
    bunte: { w: 20, p: [[40,480,40],[40,250,30],[125,217,140],[231,96,140],[241,-65,140],[152,-198,140],[0,-250,140],[-152,-198,140],[-241,-65,140],[-231,96,140],[-125,217,140],[-40,250,30],[-40,480,40]] },
    leuchtfeuer: { w: 21, p: [[-382,272,81],[383,272,63],[383,136,63],[-153,136,54],[-153,-323,41],[-382,-323,81]] },
    sonnenhof: { w: 20, p: [[-378,-288,81],[-153,-288,36],[-153,-153,36],[27,-153,36],[27,-18,36],[207,-18,36],[207,117,36],[378,117,54],[378,288,72],[-378,288,81]] },
    ricopoly: { w: 20, p: [[-297,-297,63],[-45,-297,23],[0,-252,23],[45,-297,23],[297,-297,63],[297,-45,23],[252,0,23],[297,45,23],[297,297,63],[45,297,23],[0,252,23],[-45,297,23],[-297,297,63],[-297,45,23],[-252,0,23],[-297,-45,23]] },
    wolken: { w: 20, p: [[-99,-342,54],[99,-342,54],[99,-99,36],[342,-99,54],[342,99,54],[99,99,36],[99,342,54],[-99,342,54],[-99,99,36],[-342,99,54],[-342,-99,54],[-99,-99,36]] },
    huepf: { w: 19, p: [[-328,156,54],[328,156,54],[328,-156,36],[211,-156,36],[211,62,36],[94,62,36],[94,-156,36],[-23,-156,36],[-23,62,36],[-140,62,36],[-140,-156,36],[-328,-156,54]] }
  };
  DEFS.forEach(d => { const l = LAYOUT[d.id]; if (l) { d.poly = l.p; d.w = l.w; d.cross = !!l.cross; } });
  const CUPS = [{ name: 'Sonnen-Cup', tracks: [0, 1, 3] }, { name: 'Spuk-Cup', tracks: [2, 4, 3] },
    { name: 'Elemente-Cup', tracks: [5, 6, 9] }, { name: 'Abenteuer-Cup', tracks: [7, 10, 8] }, { name: 'Portal-Cup', tracks: [11, 12, 14] }, { name: 'Fantasy-Cup', tracks: [13, 15, 16] }, { name: 'RicoReWi-Cup', tracks: [17, 16, 11] },
    { name: 'Märchen-Cup', tracks: [18, 19, 20] }, { name: 'Insel-Cup', tracks: [21, 22, 23] }, { name: 'Stadt-Cup', tracks: [24, 25, 26] },
    { name: 'Kaffee-Cup', icon: '☕', tracks: [27, 28, 29] }, { name: 'Kuchen-Cup', icon: '🍰', tracks: [30, 31, 32] }, { name: 'Großer Rentenpokal', icon: '🏆', tracks: [29, 32, 28, 30] }];
  const SP = 3;                                       // Abstand der Abtastpunkte in Metern
  function cr(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return [0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)); }
  // Polygon mit Eckradien -> dichte Kontrollpunkte (Geraden bleiben gerade, Ecken werden Kreisbögen)
  function polyPts(v) {
  const n = v.length, out = [], seg = [];
  for (let i = 0; i < n; i++) {
    const A = v[(i + n - 1) % n], B = v[i], Cc = v[(i + 1) % n];
    let ux = A[0] - B[0], uz = A[1] - B[1], wx = Cc[0] - B[0], wz = Cc[1] - B[1]; const lu = Math.hypot(ux, uz), lw = Math.hypot(wx, wz); ux /= lu; uz /= lu; wx /= lw; wz /= lw;
    const th = Math.acos(Math.max(-1, Math.min(1, ux * wx + uz * wz)));
    let r = B[2] || 0, t = r / Math.tan(th / 2); const tm = Math.min(lu, lw) * 0.49; if (t > tm) { t = tm; r = t * Math.tan(th / 2); }
    if (r < 1 || th > 3.1) { seg.push([[B[0], B[1]]]); continue; }
    const p1 = [B[0] + ux * t, B[1] + uz * t], p2 = [B[0] + wx * t, B[1] + wz * t];
    let bx = ux + wx, bz = uz + wz; const lb = Math.hypot(bx, bz); bx /= lb; bz /= lb; const d = r / Math.sin(th / 2), cx = B[0] + bx * d, cz = B[1] + bz * d;
    let a1 = Math.atan2(p1[1] - cz, p1[0] - cx), a2 = Math.atan2(p2[1] - cz, p2[0] - cx), da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    const k = Math.max(2, Math.ceil(Math.abs(da) * r / 14)), arc = []; for (let j = 0; j <= k; j++) { const a = a1 + da * j / k; arc.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
    seg.push(arc);
  }
  // Kanten zwischen den Bögen fein unterteilen (Catmull-Rom bleibt dann gerade)
  for (let i = 0; i < n; i++) {
    const s = seg[(i + 1) % n], e = seg[i][seg[i].length - 1], b = s[0], L = Math.hypot(b[0] - e[0], b[1] - e[1]), m = Math.max(1, Math.round(L / 30));
    const edge = []; for (let j = 1; j < m; j++) edge.push([e[0] + (b[0] - e[0]) * j / m, e[1] + (b[1] - e[1]) * j / m]);
    if (i === 0) { const h = edge.length >> 1; out.push(...edge.slice(h)); seg.tail = edge.slice(0, h); } else out.push(...edge);
    out.push(...s);
  }
  // Start in der Kantenmitte: Schluss mit dem Anfang der ersten Kante
  const res = out.concat(seg.tail || []);
  return res.filter((p, i) => i === 0 || Math.hypot(p[0] - res[i - 1][0], p[1] - res[i - 1][1]) > 2).map(p => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]);
}
  function build(def) {
    const q = def.poly ? (def._pts || (def._pts = polyPts(def.poly))) : def.pts, n = q.length, dense = [];
    for (let i = 0; i < n; i++) for (let s = 0; s < 40; s++) dense.push(cr(q[(i + n - 1) % n], q[i], q[(i + 1) % n], q[(i + 2) % n], s / 40));
    let len = 0; const cum = [0]; for (let i = 1; i <= dense.length; i++) { const a = dense[i - 1], b = dense[i % dense.length]; len += Math.hypot(b[0] - a[0], b[1] - a[1]); cum.push(len); }
    const N = Math.round(len / SP), P = new Float32Array(N * 2); let j = 0;
    for (let i = 0; i < N; i++) { const target = i * len / N; while (cum[j + 1] < target) j++; const a = dense[j], b = dense[(j + 1) % dense.length], t = (target - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]); P[i * 2] = a[0] + (b[0] - a[0]) * t; P[i * 2 + 1] = a[1] + (b[1] - a[1]) * t; }
    const T = new Float32Array(N * 2), Nm = new Float32Array(N * 2), K = new Float32Array(N);
    for (let i = 0; i < N; i++) { const a = (i + N - 1) % N, b = (i + 1) % N, dx = P[b * 2] - P[a * 2], dz = P[b * 2 + 1] - P[a * 2 + 1], l = Math.hypot(dx, dz) || 1; T[i * 2] = dx / l; T[i * 2 + 1] = dz / l; Nm[i * 2] = dz / l; Nm[i * 2 + 1] = -dx / l; }
    for (let i = 0; i < N; i++) { const a = (i + N - 2) % N, b = (i + 2) % N; let da = Math.atan2(T[b * 2], T[b * 2 + 1]) - Math.atan2(T[a * 2], T[a * 2 + 1]); while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; K[i] = Math.abs(da) / (4 * len / N); }
    const tr = { def, N, len, P, T, Nm, K, W: def.w, half: def.w / 2, wallD: def.w / 2 + 4, roughD: def.w / 2 + 1.2 };
    // Höhenprofil ist Teil der Streckendaten und damit für Host, Clients und Renderer identisch.
    // Weiche Rampen statt harter Sprünge; Brücken sind echte Abschnitte der Fahrbahn.
    let profile = {
      portal: [[0,0],[.12,0],[.18,7],[.31,7],[.38,0],[.57,0],[.67,9],[.78,9],[.86,0],[1,0]],
      crystal: [[0,0],[.10,0],[.22,11],[.34,11],[.44,2],[.56,0],[.68,15],[.81,15],[.91,0],[1,0]],
      safari: [[0,0],[.16,0],[.29,5],[.42,5],[.53,0],[.69,0],[.80,6],[.9,6],[1,0]],
      ruins: [[0,0],[.12,0],[.24,8],[.36,8],[.46,0],[.61,0],[.71,11],[.84,11],[.93,0],[1,0]],
      dragon: [[0,0],[.10,0],[.27,18],[.40,18],[.58,0],[.70,0],[.82,12],[.90,12],[1,0]],
      shards: [[0,0],[.13,0],[.25,12],[.37,12],[.49,0],[.61,0],[.72,16],[.84,16],[.95,0],[1,0]],
      island: [[0,0],[.12,0],[.21,5],[.32,5],[.42,0],[.62,0],[.73,7],[.84,7],[.93,0],[1,0]]
    }[def.mechanic] || def.profile || null;
    // Flache Klassik-Strecken bekommen Hügel (Dämme statt Pfeiler): echte Höhenunterschiede, Physik bleibt gleich
    if (!profile) { profile = [[0, 0], [1, 0]]; tr.hills = true; }
    // Kreuzende Strecken (Acht, Alpha-Schleife): der zweite Durchgang führt als Brücke über die Kreuzung.
    if (def.cross) {
      const cp = []; for (let a = 0; a < N; a += 2) for (let b = a + 30; b < N; b += 2) if (Math.min(b - a, N - b + a) * SP > 90 && Math.hypot(P[a * 2] - P[b * 2], P[a * 2 + 1] - P[b * 2 + 1]) < 8) cp.push([a, b]);
      if (cp.length) { const c = cp[cp.length >> 1], u = c[1] / N; tr.crossPt = { x: P[c[0] * 2], z: P[c[0] * 2 + 1], lo: c[0], hi: c[1] };
        profile = [[0, 0], [u - 0.11, 0], [u - 0.04, 9], [u + 0.04, 9], [u + 0.11, 0], [1, 0]]; }
    }
    tr.hilly = profile.some(p => p[1] > 0);
    tr.height = f => {
      const u = ((f % N) + N) % N / N;
      for (let i=1;i<profile.length;i++) {
        if (u <= profile[i][0]) {
          const a=profile[i-1],b=profile[i], t=Math.max(0,Math.min(1,(u-a[0])/(b[0]-a[0])));
          const smooth=t*t*(3-2*t);
          return a[1]+(b[1]-a[1])*smooth;
        }
      }
      return 0;
    };
    tr.bridge = f => tr.height(f)>3;
    // Abkürzungen: schmale Wege quer durch das Innenfeld enger Kehren (Wegstrecke deutlich länger als Luftlinie, kreuzt keine andere Fahrbahn)
    tr.cuts = []; if (!def.cross) {
      const flat = i => tr.height(i) < 0.4, cand = [];
      for (let a = 12; a < N - 30; a += 2) { if (!flat(a)) continue; for (let b = a + Math.ceil(70 / SP); b < Math.min(N - 4, a + N / 2); b += 2) { if (!flat(b)) continue; const ax = P[a * 2], az = P[a * 2 + 1], bx = P[b * 2], bz = P[b * 2 + 1], D = Math.hypot(bx - ax, bz - az), L = (b - a) * SP; if (D < 26 || D > 200 || L < 1.3 * D || L - D < 35 || L - D > 300) continue;
        let ok = true; const m0 = def.w / 2 + 3, steps = Math.floor((D - 2 * m0) / 3);
        for (let q = 0; q <= steps && ok; q++) { const t = (m0 + q * 3) / D, x = ax + (bx - ax) * t, z = az + (bz - az) * t; for (let i = 0; i < N; i += 1) { const dd = Math.hypot(x - P[i * 2], z - P[i * 2 + 1]); if (dd < def.w / 2 + 7 && !((i >= a - 6 && i <= a + 6 && t < 0.5) || (i >= b - 6 && i <= b + 6 && t > 0.5))) { ok = false; break; } if (!tr.hills && !flat(i) && dd < def.w / 2 + 12) { ok = false; break; } } }
        if (ok) cand.push({ a, b, gain: L - D }); } }
      cand.sort((p, q) => Math.abs(p.gain - 120) - Math.abs(q.gain - 120));
      for (const c of cand) { if (tr.cuts.length >= 2) break; if (tr.cuts.some(o => c.a < o.b + 20 && c.b > o.a - 20)) continue; const ax = P[c.a * 2], az = P[c.a * 2 + 1], bx = P[c.b * 2], bz = P[c.b * 2 + 1], D = Math.hypot(bx - ax, bz - az); tr.cuts.push({ a: c.a, b: c.b, ax, az, bx, bz, len: D, ux: (bx - ax) / D, uz: (bz - az) / D, w: 8 }); }
    }
    // Hügel erst nach den Abkürzungen setzen: deren Enden bleiben eben
    if (tr.hills) { let hs = 0; for (const ch of def.id) hs = (hs * 31 + ch.charCodeAt(0)) % 997; const free = u => !tr.cuts.some(c => u > c.a / N - 0.13 && u < c.b / N + 0.13) && u > 0.14 && u < 0.86, hl = [];
      for (let k = 0; k < 40 && hl.length < 2; k++) { const u = (0.18 + ((hs + k * 37) % 64) / 100); if (free(u) && hl.every(v => Math.abs(v - u) > 0.3)) hl.push(u); }
      hl.sort((p, q) => p - q); profile = [[0, 0]]; hl.forEach((u, k) => { const h = k ? 5 + (hs >> 2) % 5 : 4 + hs % 4; profile.push([u - 0.11, 0], [u - 0.04, h], [u + 0.04, h], [u + 0.11, 0]); }); profile.push([1, 0]); tr.hilly = hl.length > 0; }
    // Rampen: auf den zwei ruhigsten flachen Geraden (abseits Start, Abkürzungen und Item-Reihen)
    tr.ramps = []; { const sc = []; for (let i = 40; i < N - 20; i += 2) { let k = 0; for (let j = -10; j <= 14; j++) k = Math.max(k, K[(i + j + N) % N]); const u = i / N; if (Math.abs(tr.height(i) - tr.height(i + 6)) > 0.3 || tr.cuts.some(c => i > c.a - 12 && i < c.b + 12) || Math.abs((u * 6 + 0.5) % 1 - 0.5) < 0.12) continue; sc.push([k, i]); } sc.sort((p, q) => p[0] - q[0]); for (const [, i] of sc) { if (tr.ramps.length >= 2) break; if (tr.ramps.every(r => Math.min(Math.abs(r - i), N - Math.abs(r - i)) > N / 4)) tr.ramps.push(i); } }
    // Position auf einer Abkürzung: Fortschritt t (0..1) und seitlicher Abstand e
    tr.onCut = (x, z, out) => { for (let ci = 0; ci < tr.cuts.length; ci++) { const c = tr.cuts[ci], rx = x - c.ax, rz = z - c.az, t = (rx * c.ux + rz * c.uz) / c.len, e = rx * c.uz - rz * c.ux; if (t >= -0.02 && t <= 1.02 && Math.abs(e) < c.w / 2 + 1.5) { out.c = ci; out.t = t; out.e = e; return out; } } out.c = -1; return out; };
    // nächster Punkt: lokale Suche um hint (hint < 0 = alles absuchen); out = {i,f,d}
    tr.nearest = (x, z, hint, out) => {
      let bi = 0, bd = 1e18; const lo = hint < 0 ? 0 : -14, hi = hint < 0 ? N - 1 : 14;
      for (let k = lo; k <= hi; k++) { const i = hint < 0 ? k : (hint + k + N) % N, dx = x - P[i * 2], dz = z - P[i * 2 + 1], d2 = dx * dx + dz * dz; if (d2 < bd) { bd = d2; bi = i; } }
      let f = bi; const nx = (bi + 1) % N, dx = P[nx * 2] - P[bi * 2], dz = P[nx * 2 + 1] - P[bi * 2 + 1], l2 = dx * dx + dz * dz, t = ((x - P[bi * 2]) * dx + (z - P[bi * 2 + 1]) * dz) / l2;
      if (t > 0) f = bi + Math.min(1, t); else { const pv = (bi + N - 1) % N, ex = P[bi * 2] - P[pv * 2], ez = P[bi * 2 + 1] - P[pv * 2 + 1], tt = ((x - P[pv * 2]) * ex + (z - P[pv * 2 + 1]) * ez) / (ex * ex + ez * ez); f = bi - 1 + Math.max(0, tt); if (f < 0) f += N; }
      out.i = bi; out.f = f; out.d = (x - P[bi * 2]) * Nm[bi * 2] + (z - P[bi * 2 + 1]) * Nm[bi * 2 + 1]; return out;
    };
    tr.at = (f, off, out) => { const i = ((Math.floor(f) % N) + N) % N, nx = (i + 1) % N, t = f - Math.floor(f); out.x = P[i * 2] + (P[nx * 2] - P[i * 2]) * t + Nm[i * 2] * (off || 0); out.z = P[i * 2 + 1] + (P[nx * 2 + 1] - P[i * 2 + 1]) * t + Nm[i * 2 + 1] * (off || 0); out.tx = T[i * 2]; out.tz = T[i * 2 + 1]; return out; };
    return tr;
  }
  // Prüfung: Selbstüberschneidung / Mindestabstand nicht benachbarter Streckenteile / engster Radius
  function check(tr) {
    let minGap = 1e9, maxK = 0; const N = tr.N;
    for (let i = 0; i < N; i += 2) for (let j = i + 1; j < N; j += 2) { let dj = Math.min(j - i, N - (j - i)); if (dj * SP < 90) continue; const d = Math.hypot(tr.P[i * 2] - tr.P[j * 2], tr.P[i * 2 + 1] - tr.P[j * 2 + 1]); if (d < minGap) minGap = d; }
    for (let i = 0; i < N; i++) maxK = Math.max(maxK, tr.K[i]);
    return { len: Math.round(tr.len), minGap: Math.round(minGap), minRadius: Math.round(1 / maxK) };
  }
  return { DEFS, CUPS, build, check, SP };
})();
if (typeof module !== 'undefined') module.exports = Track;
