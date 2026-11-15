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
  const CUPS = [{ name: 'Sonnen-Cup', tracks: [0, 1, 3] }, { name: 'Spuk-Cup', tracks: [2, 4, 3] },
    { name: 'Elemente-Cup', tracks: [5, 6, 9] }, { name: 'Abenteuer-Cup', tracks: [7, 10, 8] }, { name: 'Portal-Cup', tracks: [11, 12, 14] }, { name: 'Fantasy-Cup', tracks: [13, 15, 16] }, { name: 'RicoReWi-Cup', tracks: [17, 16, 11] },
    { name: 'Märchen-Cup', tracks: [18, 19, 20] }, { name: 'Insel-Cup', tracks: [21, 22, 23] }, { name: 'Stadt-Cup', tracks: [24, 25, 26] }];
  const SP = 3;                                       // Abstand der Abtastpunkte in Metern
  function cr(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return [0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)); }
  function build(def) {
    const q = def.pts, n = q.length, dense = [];
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
    const profile = {
      portal: [[0,0],[.12,0],[.18,7],[.31,7],[.38,0],[.57,0],[.67,9],[.78,9],[.86,0],[1,0]],
      crystal: [[0,0],[.10,0],[.22,11],[.34,11],[.44,2],[.56,0],[.68,15],[.81,15],[.91,0],[1,0]],
      safari: [[0,0],[.16,0],[.29,5],[.42,5],[.53,0],[.69,0],[.80,6],[.9,6],[1,0]],
      ruins: [[0,0],[.12,0],[.24,8],[.36,8],[.46,0],[.61,0],[.71,11],[.84,11],[.93,0],[1,0]],
      dragon: [[0,0],[.10,0],[.27,18],[.40,18],[.58,0],[.70,0],[.82,12],[.90,12],[1,0]],
      shards: [[0,0],[.13,0],[.25,12],[.37,12],[.49,0],[.61,0],[.72,16],[.84,16],[.95,0],[1,0]],
      island: [[0,0],[.12,0],[.21,5],[.32,5],[.42,0],[.62,0],[.73,7],[.84,7],[.93,0],[1,0]]
    }[def.mechanic] || def.profile || [[0,0],[1,0]];
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
