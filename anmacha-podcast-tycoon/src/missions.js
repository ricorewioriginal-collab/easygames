/* AnMaCha – Der Podcast · Aufträge (Missionen) in der freien Stadt.
   Auftraggeber mit ❗ stehen in Stadt und Welten. Jeder Auftrag ist eine kleine Geschichte in mehreren Schritten:
   hinfahren (auch auf Zeit), Teile einsammeln, Leute befragen, Gäste begleiten, Minispiel vor Ort, Rangelei mit Rauschmanns Leuten.
   Zwischensequenzen am Anfang und Ende, Lichtsäule und Karte zeigen das Ziel. Fortschritt bleibt über Szenenwechsel erhalten (Save.data.missions). */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  let T = root.THREE;
  const MS = AMC.Missions = {};

  // ------------------------------------------------------------------ Aufträge
  // Schritt-Typen: at (Ort erreichen, car = im Auto, time = Sekunden), enter (Gebäude betreten), talk (Person befragen, Szene),
  // collect (n Teile einsammeln), mini (Minispiel vor Ort, need = Mindestergebnis), rival (Rangelei), escort (Gast begleiten)
  const STORY = [
    { id: 'mikro', icon: '🎙️', t: 'Das verschwundene Mikro', giver: { name: 'Tontechnikerin Sanne', seed: 41, st: 'live' }, reward: { fan: 80, abos: 60, rub: { tech: 3 } },
      intro: [['Tontechnikerin Sanne', 'Katastrophe! Unser Großmembran-Mikro ist beim Umzug in Einzelteile zerfallen – überall im Viertel verstreut.'], ['marco', 'Ohne das Mikro klingt Andrew wie ein Toaster.'], ['andrew', 'Hey! … Okay, stimmt. Wir sammeln alles ein.']],
      steps: [
        { t: 'collect', st: 'live', n: 5, icon: '🎙️', rad: 26, txt: 'Mikro-Teile einsammeln' },
        { t: 'enter', st: 'room:kind=tonstudio', txt: 'Teile im Tonstudio zusammenlöten lassen' },
        { t: 'at', st: 'live', txt: 'Mikro zurück ins Funkhaus bringen' }],
      outro: [['Tontechnikerin Sanne', 'Wie neu! Hört ihr das? Dieses Rauschen … ist weg!'], ['marco', 'Und Andrew klingt wieder wie Andrew.'], ['andrew', 'Ich nehm das als Kompliment.']] },
    { id: 'band', icon: '📼', t: 'Eilzustellung für Kanal 9', giver: { name: 'Producer Jonas', seed: 77, st: 'radio' }, reward: { fan: 120, abos: 120, rub: { tv: 4 } },
      intro: [['Producer Jonas', 'Kanal 9 braucht euren Trailer für die Morgenshow – in 90 Sekunden geht die Sendung raus!'], ['andrew', 'Zu Fuß schaffen wir das nie.'], ['marco', 'Dann leihen wir uns ein Auto. Gisela verzeiht uns das.']],
      steps: [
        { t: 'at', st: 'world:kanal9', car: true, time: 90, txt: 'Mit einem Auto zu Kanal 9 rasen' },
        { t: 'talk', who: { name: 'Redakteurin Mia', seed: 312 }, st: 'world:kanal9', txt: 'Band bei Redakteurin Mia abgeben', lines: [['Redakteurin Mia', 'Gerade noch rechtzeitig! Kommt mit in die Regie, ihr dürft die Kamera führen.']] },
        { t: 'mini', kind: 'frame', st: 'world:kanal9', need: 0.35, o: { title: '🎥 Kanal 9: Trailer live einspielen', subj: ['🎙️', '📻', '🚐'], shots: 3 }, txt: 'Trailer live einspielen (Kamera)' }],
      outro: [['Redakteurin Mia', 'Die Morgenshow hat euren Trailer dreimal gespielt. Die Telefone glühen!'], ['marco', 'Wir sind im Fernsehen, Andrew.'], ['andrew', 'Mama wird so stolz sein.']] },
    { id: 'stoer', icon: '📡', t: 'Rauschen über dem Meer', giver: { name: 'Funkerin Edda', seed: 515, st: 'world:leucht' }, reward: { fan: 150, abos: 150, rub: { serious: 3, tech: 2 } },
      intro: [['Funkerin Edda', 'Seit Tagen stört etwas den Seefunk. Jemand hat kleine Störsender an der Küste versteckt.'], ['marco', 'Das riecht nach Ralf Rauschmann.'], ['andrew', 'Dann suchen wir die Dinger und schalten sie ab!']],
      steps: [
        { t: 'collect', st: 'world:leucht', n: 4, icon: '📡', rad: 22, txt: 'Versteckte Störsender finden' },
        { t: 'mini', kind: 'simon', st: 'world:leucht', need: 0.4, o: { title: '📡 Seefunk neu einmessen', rounds: 3, len: 3 }, txt: 'Seefunk am Leuchtturm neu einmessen' },
        { t: 'rival', name: 'Kabel-Kalle', st: 'world:druck', txt: 'Kabel-Kalle stellen (Rangelei)' }],
      outro: [['Funkerin Edda', 'Klarer Empfang bis Neuseeland! Ein Fischkutter grüßt euch.'], ['andrew', 'Kabel-Kalle hat alles gestanden. Rauschmann steckt dahinter.'], ['marco', 'Das ist noch nicht vorbei.']] },
    { id: 'gast', icon: '⭐', t: 'Star-Gast abholen', giver: { name: 'Managerin Bea', seed: 902, st: 'world:arena' }, reward: { fan: 160, abos: 200, rub: { musik: 4 }, idea: 'Studiogast: Conny Glitzer' },
      intro: [['Managerin Bea', 'Schlagerstar Conny Glitzer will unbedingt zu euch in die Sendung. Aber nur, wenn ihr sie persönlich abholt.'], ['andrew', 'Conny Glitzer?! Ich hab ihr Poster über dem Bett!'], ['marco', 'Das wollte ich nicht wissen.']],
      steps: [
        { t: 'escort', who: { name: 'Conny Glitzer', seed: 1207, top: '#ff3da8' }, st: 'world:arena', to: 'live', txt: 'Conny Glitzer ins Funkhaus begleiten (Auto erlaubt)' }],
      outro: [['Conny Glitzer', 'Was für ein süßes kleines Studio! Wann geht’s los, Schätzchen?'], ['andrew', 'Ich … ähm … wir … Mikro!'], ['marco', 'Er meint: Herzlich willkommen bei AnMaCha.']] },
    { id: 'kaffee', icon: '☕', t: 'Koffein-Notfall', giver: { name: 'Praktikant Tim', seed: 233, st: 'menu' }, reward: { fan: 90, abos: 70, rub: { feel: 3 } },
      intro: [['Praktikant Tim', 'Die ganze Crew ist eingeschlafen. Wir brauchen Kaffee. Viel Kaffee. Sofort.'], ['marco', 'Ich kenn da ein Café …'], ['andrew', 'Und ich kenn den schnellsten Weg zurück.']],
      steps: [
        { t: 'enter', st: 'room:kind=cafe', txt: 'Kaffee im Café holen' },
        { t: 'at', st: 'menu', time: 75, txt: 'Kaffee heiß ins Funkhaus bringen' }],
      outro: [['Praktikant Tim', 'Die Crew lebt wieder! Und ich hab drei Becher allein getrunken.'], ['marco', 'Man sieht’s. Du vibrierst.']] },
    { id: 'umfrage', icon: '🗣️', t: 'Die große Straßenumfrage', giver: { name: 'Reporterin Lale', seed: 640, st: 'quiz' }, reward: { fan: 140, abos: 160, rub: { serious: 2, feel: 2, fun: 2 } },
      intro: [['Reporterin Lale', 'Was hört die Medienstadt eigentlich? Fragt im Hafen, auf dem Berg und auf der Festival-Insel nach!'], ['andrew', 'Eine Umfrage-Rundreise. Ich hol die Snacks.'], ['marco', 'Ich hol das Mikro. Du hast genug Snacks.']],
      steps: [
        { t: 'talk', who: { name: 'Hafenarbeiter Olaf', seed: 1501 }, st: 'world:druck', txt: 'Hafen: Hafenarbeiter Olaf befragen', lines: [['Hafenarbeiter Olaf', 'Beim Kistenstapeln läuft bei mir Rockradio24. Laut. Sehr laut.'], ['andrew', 'Notiert: Rock für starke Arme.']] },
        { t: 'talk', who: { name: 'Försterin Helga', seed: 1502 }, st: 'world:museum', txt: 'Berg: Försterin Helga befragen', lines: [['Försterin Helga', 'Im Wald? Podcasts! Am liebsten zwei Typen, die sich über Camper streiten.'], ['marco', 'Das … sind wir.']] },
        { t: 'talk', who: { name: 'Festival-Fan Jule', seed: 1503 }, st: 'world:merch', txt: 'Insel: Festival-Fan Jule befragen', lines: [['Festival-Fan Jule', 'Clubradio24 bis zum Sonnenaufgang! Und danach AnMaCha zum Runterkommen.'], ['andrew', 'Wir sind der Kater-Podcast. Ich liebe es.']] },
        { t: 'at', st: 'quiz', txt: 'Ergebnisse zu Lale ins Funkhaus bringen' }],
      outro: [['Reporterin Lale', 'Rock, Podcasts, Club – und überall AnMaCha. Das wird eine Top-Folge!'], ['marco', 'Wir sind offiziell Stadtgespräch.']] },
    { id: 'platte', icon: '💿', t: 'Die verschollene Erstpressung', giver: { name: 'Sammler Rudi', seed: 777, st: 'music' }, reward: { fan: 200, abos: 220, rub: { musik: 5 } },
      intro: [['Sammler Rudi', 'In Wellenburg soll die Erstpressung der ersten AnMaCha-Titelmelodie liegen. Gerüchte, Gerüchte …'], ['andrew', 'Wir haben eine Titelmelodie auf Vinyl?'], ['marco', 'Roadtrip! Ich hol Gisela … oder irgendein Auto.']],
      steps: [
        { t: 'at', st: 'world:platten', car: true, txt: 'Über die Autobahn nach Wellenburg fahren' },
        { t: 'mini', kind: 'catch', st: 'world:platten', need: 0.4, o: { title: '💿 Die Erstpressung finden', good: ['💿', '📀', '🎵'], bad: ['🕷️', '💣'], basket: '🧺' }, txt: 'Im Plattenladen die Erstpressung finden' },
        { t: 'at', st: 'music', car: true, time: 150, txt: 'Platte sicher zu Sammler Rudi bringen (im Auto)' }],
      outro: [['Sammler Rudi', 'Unglaublich. Die echte Erstpressung. Die kommt bei euch ins Studio – an die Wand!'], ['andrew', 'Ich hab Gänsehaut.'], ['marco', 'Das ist der Fahrtwind.']] },
    { id: 'kabel', icon: '🔌', t: 'Strom für das Festival', giver: { name: 'Bühnenchef Kemal', seed: 1810, st: 'world:buehne' }, reward: { fan: 220, abos: 260, rub: { tech: 4, fun: 2 } },
      intro: [['Bühnenchef Kemal', 'Heute Abend spielen hier zwanzig Acts – und jemand hat die Kabeltrommeln über die ganze Insel verteilt.'], ['marco', 'Rauschmann?'], ['Bühnenchef Kemal', 'Oder der Wind. Hier weht ganz schön was.']],
      steps: [
        { t: 'collect', st: 'world:buehne', n: 6, icon: '🔌', rad: 30, txt: 'Kabeltrommeln auf der Insel einsammeln' },
        { t: 'mini', kind: 'cables', st: 'world:buehne', need: 0.4, o: { title: '🔌 Hauptbühne verkabeln', n: 5 }, txt: 'Hauptbühne verkabeln' }],
      outro: [['Bühnenchef Kemal', 'Licht an, Ton an! Ihr habt das Festival gerettet.'], ['andrew', 'Kriegen wir dafür Backstage-Pässe?'], ['Bühnenchef Kemal', 'Ihr kriegt die Hauptbühne.']] },
    { id: 'pirat', icon: '🏴‍☠️', t: 'Showdown bei Radio Funkloch', giver: { name: 'Funkerin Edda', seed: 515, st: 'world:funker' }, reward: { fan: 300, abos: 400, rub: { serious: 4, tech: 3 } },
      intro: [['Funkerin Edda', 'Ich hab das Störsignal angepeilt: Es kommt direkt aus Wellenburg. Radio Funkloch.'], ['marco', 'Rauschmanns Hauptquartier.'], ['andrew', 'Zeit, den Stecker zu ziehen. Wortwörtlich.']],
      steps: [
        { t: 'at', st: 'world:funkloch', car: true, txt: 'Nach Wellenburg zu Radio Funkloch fahren' },
        { t: 'mini', kind: 'cables', st: 'world:funkloch', need: 0.45, o: { title: '🔌 Hauptstörsender abklemmen', n: 6 }, txt: 'Hauptstörsender abklemmen' },
        { t: 'rival', name: 'Ralf Rauschmann', st: 'world:funkloch', txt: 'Ralf Rauschmann stellen' }],
      outro: [['Ralf Rauschmann', 'Okay, okay! Ich wollte doch nur, dass mir auch mal jemand zuhört …'], ['marco', 'Dann mach was Nettes. Wir helfen dir sogar.'], ['andrew', 'Erste Regel: Kein Störsender.']] },
    { id: 'turm', icon: '📡', t: 'Live vom Fernsehturm', giver: { name: 'Producer Jonas', seed: 77, st: 'world:turm' }, reward: { fan: 350, abos: 500, rub: { feel: 3, tv: 3, fun: 3 } },
      intro: [['Producer Jonas', 'Das große Finale: eine Live-Folge ganz oben vom Fernsehturm, übertragen auf allen Kanälen.'], ['andrew', 'Ich hab Höhenangst.'], ['marco', 'Du hast Mikrofonangst, wenn du Höhenangst hast. Los!']],
      steps: [
        { t: 'talk', who: { name: 'Turmwart Bernd', seed: 1999 }, st: 'world:turm', txt: 'Mit Turmwart Bernd sprechen', lines: [['Turmwart Bernd', 'Der Aufzug ist frisch gewartet. Fast sicher. Viel Erfolg da oben!'], ['andrew', 'FAST sicher?!']] },
        { t: 'mini', kind: 'qte', st: 'world:turm', need: 0.4, o: { title: '🔴 Live vom Turm: Pointen-Timing', n: 5 }, txt: 'Live-Folge vom Turm: Pointen setzen' }],
      outro: [['n', 'Die ganze Medienstadt schaut nach oben. Auf dem Turm blinkt es orange: AnMaCha ist live.'], ['marco', 'Andrew, wir sind ganz oben.'], ['andrew', 'Ja. Und ich schau nicht runter.']] }
  ];
  // Tagesjobs: jeden Tag neu, beliebig wiederholbar (einer pro Tag je Vorlage)
  const DAILY = [
    { id: 'kurier', icon: '📦', t: 'Kurierjob', make: r => { const a = pickSt(r), b = pickSt(r, a); return { giver: { name: 'Kurier-Zentrale', seed: 60, st: a }, reward: { fan: 50, abos: 40 }, intro: [['Kurier-Zentrale', 'Eiliges Paket für die Stadt! Schnell hin, schnell zurück.']], steps: [{ t: 'at', st: b, time: 80, txt: 'Paket zustellen' }], outro: [['marco', 'Zugestellt. Wir sind die schnellsten Podcaster der Stadt.']] }; } },
    { id: 'funken', icon: '✨', t: 'Funken-Regen', make: r => { const a = pickSt(r); return { giver: { name: 'Wetterfrosch Fritz', seed: 61, st: a }, reward: { fan: 45, abos: 30, rub: { fun: 2, feel: 2 } }, intro: [['Wetterfrosch Fritz', 'Heute regnet es Themen! Sammelt die glitzernden Kisten, bevor sie verpuffen.']], steps: [{ t: 'collect', st: a, n: 6, icon: '✨', rad: 24, txt: 'Themen-Kisten sammeln' }], outro: [['andrew', 'Genug Stoff für drei Folgen!']] }; } },
    { id: 'foto', icon: '📸', t: 'Fotojob', make: r => { const a = pickSt(r, null, true); return { giver: { name: 'Fotografin Ines', seed: 62, st: 'radio' }, reward: { fan: 55, abos: 50, rub: { tv: 2 } }, intro: [['Fotografin Ines', 'Für eure App brauche ich Fotos von unterwegs. Fahrt hin und knipst los!']], steps: [{ t: 'mini', kind: 'frame', st: a, need: 0.3, o: { title: '📸 Fotos für die App', subj: ['🎙️', '🚐', '🕊️'], shots: 3 }, txt: 'Fotos schießen' }], outro: [['marco', 'Die Fotos gehen in die App. Die Follower lieben uns.']] }; } }
  ];
  const ALL_ST = ['live', 'radio', 'shop', 'quiz', 'music', 'arcade', 'world:kanal9', 'world:druck', 'world:museum', 'world:merch', 'world:riesenrad'];
  const FAR_ST = ['world:kanal9', 'world:druck', 'world:leucht', 'world:museum', 'world:turm', 'world:riesenrad', 'world:merch', 'world:arena', 'world:casting'];
  function pickSt(r, not, far) { const l = (far ? FAR_ST : ALL_ST).filter(x => x !== not); return l[Math.floor(r() * l.length)]; }

  // ------------------------------------------------------------------ Spielstand
  function st() { const m = Save.data.missions = Save.data.missions || { done: {}, cur: null, step: 0, day: {} }; m.done = m.done || {}; m.day = m.day || {}; return m; }
  const today = () => (AMC.Career ? AMC.Career.state().day : 1);
  const MEMO = {};
  function dailyOf(id) { const k = id + ':' + today(); if (MEMO[k]) return MEMO[k]; const d = DAILY.find(x => x.id === id), r = U.seeded(today() * 131 + id.length * 17); return (MEMO[k] = Object.assign({ id: 'daily:' + id, icon: d.icon, t: d.t + ' (Tag ' + today() + ')', daily: id }, d.make(r))); }
  function def(id) { if (!id) return null; if (id.startsWith('daily:')) return dailyOf(id.slice(6)); return STORY.find(m => m.id === id) || null; }
  function nextStory() { const m = st(); return STORY.find(x => !m.done[x.id]) || null; }
  /** angebotene Aufträge: nächster Story-Auftrag + Tagesjobs, die heute noch offen sind */
  function offers() {
    const m = st(), out = []; if (m.cur) return out;
    const n = nextStory(); if (n) out.push(n);
    for (const d of DAILY) if (m.day[d.id] !== today()) out.push(dailyOf(d.id));
    return out;
  }
  MS.STORY = STORY; MS.state = st; MS.def = def;
  MS.progress = () => ({ done: STORY.filter(x => st().done[x.id]).length, of: STORY.length });
  MS.active = () => { const m = st(), d = def(m.cur); return d ? { id: d.id, t: d.t, step: m.step, of: d.steps.length, txt: d.steps[m.step] && d.steps[m.step].txt } : null; };

  // ------------------------------------------------------------------ Stadt-Teil
  let C = null, V = null;
  const spr = (emo, bg, acc, s) => { const tx = W.textTex([emo], { w: 128, h: 128, bg: bg || '#1a1020', size: 84, accent: acc || '#ffd23f' }); const m = new T.Sprite(new T.SpriteMaterial({ map: tx, depthTest: false })); m.scale.set(s || 0.7, s || 0.7, 1); m.renderOrder = 5; return m; };
  function beam(color) {
    const g = new T.Group();
    const m = new T.Mesh(new T.CylinderGeometry(0.7, 1.2, 70, 16, 1, true), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
    m.position.y = 35; g.add(m);
    const ring = new T.Mesh(new T.TorusGeometry(2.2, 0.08, 6, 40), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.25; g.add(ring); g.userData.ring = ring;
    W.glow(color, 5, g, 0, 1.2, 0); g.visible = false; return g;
  }
  /** Stations-Position: exakte id oder 'room:kind=<id>' (nächstes Haus dieser Art) */
  function pos(spec) {
    const S = C.S, sts = S.stations || [];
    if (Array.isArray(spec)) return { x: spec[0], z: spec[1], r: 3 };
    if (spec && spec.startsWith('room:kind=')) {
      const kind = spec.slice(10); let best = null, bd = 1e9;
      for (const s of sts) if (s.id.startsWith('room:') && AMC.Rooms && AMC.Rooms.kind(+s.id.slice(5)).id === kind) { const d = Math.hypot(s.x - S.pl.x, s.z - S.pl.z); if (d < bd) { bd = d; best = s; } }
      return best;
    }
    return sts.find(s => s.id === spec) || sts.find(s => s.id === 'live') || null;
  }
  const matches = (spec, id) => spec === id || (spec.startsWith('room:kind=') && id.startsWith('room:') && AMC.Rooms && AMC.Rooms.kind(+id.slice(5)).id === spec.slice(10));
  // freier Platz neben einem Ort
  function near(p, dist, seed) {
    const r = U.seeded(seed || 7);
    for (let k = 0; k < 24; k++) {
      const a = r() * Math.PI * 2, d = dist * (0.6 + r() * 0.6), x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
      if (!C.solidAt(x, 0.6, z) && !C.solidAt(x + 0.7, 0.6, z) && !C.solidAt(x - 0.7, 0.6, z) && !C.solidAt(x, 0.6, z + 0.7) && !C.solidAt(x, 0.6, z - 0.7) && (!AMC.Worlds || AMC.Worlds.inside(x, z, 1))) return { x, z };
    }
    return { x: p.x + 1.5, z: p.z + 1.5 };
  }
  async function person(o, x, z, mark) {
    const my = V, fig = await W.makeFan(o.seed || 5, o.top ? { top: o.top } : null).catch(() => null);
    if (V !== my || !fig) { if (fig) fig.dispose(); return null; }
    fig.root.position.set(x, 0.16, z); C.S.group.add(fig.root);
    const n = { fig, x, y: 0.16, z, vx: 0, vy: 0, vz: 0, yaw: 0, onGround: true, anim: '', name: o.name };
    const tag = W.textTex([o.name], { w: 512, h: 96, size: 44, bg: '#120e1c', accent: '#ffd23f' }), lab = new T.Sprite(new T.SpriteMaterial({ map: tag, depthTest: false, transparent: true }));
    lab.scale.set(2.4, 0.45, 1); lab.position.y = 2.25; lab.renderOrder = 5; fig.root.add(lab);
    if (mark) { n.mark = spr(mark, '#2a1206', '#ff8a1e', 0.75); n.mark.position.y = 2.95; fig.root.add(n.mark); }
    C.setAnim(n, 'idle'); return n;
  }
  function drop(n) { if (!n) return; if (n.fig) { if (n.fig.root.parent) n.fig.root.parent.remove(n.fig.root); n.fig.dispose(); } n.fig = null; }

  MS.build = function (ctx) {
    MS.stop(); T = root.THREE; if (!ctx.S || ctx.S.mode !== 'free' || ctx.S.net) return;
    C = ctx; V = { givers: [], items: [], npc: null, rival: false, timer: 0, beam: beam(0xff8a1e), t: 0, built: false, wait: 1.2 };
    C.S.group.add(V.beam);
  };
  MS.stop = function () {
    if (!V) return; V.givers.forEach(g => drop(g.n)); drop(V.npc); V.items.forEach(i => i.m.parent && i.m.parent.remove(i.m));
    V = null; C = null;
  };
  // Auftraggeber und aktuellen Schritt aufbauen (nach dem Laden der Stadt, damit alle Orte stehen)
  function setup() {
    V.built = true; V.givers.forEach(g => drop(g.n)); V.givers = [];
    offers().forEach((d, i) => {
      const p = pos(d.giver.st); if (!p) return; const sp = near(p, 5.5, d.giver.seed * 3 + i);
      const g = { d, x: sp.x, z: sp.z, n: null }; V.givers.push(g);
      person(d.giver, sp.x, sp.z, d.daily ? '❔' : '❗').then(n => { if (n && V && V.givers.includes(g)) { g.n = n; n.fig.root.rotation.y = Math.atan2(p.x - sp.x, p.z - sp.z); } else drop(n); });
    });
    stepSetup();
  }
  function cur() { const m = st(); return def(m.cur); }
  function step() { const d = cur(); return d ? d.steps[st().step] : null; }
  function stepSetup() {
    drop(V.npc); V.npc = null; V.items.forEach(i => i.m.parent && i.m.parent.remove(i.m)); V.items = []; V.rival = false; V.timer = 0; V.miniBusy = false;
    const s = step(); V.beam.visible = false; if (!s) return;
    const p = pos(s.st); if (!p) return; V.target = p;
    if (s.time) V.timer = s.time;
    if (s.t === 'collect') {
      const r = U.seeded((st().step + 3) * 97 + s.n);
      for (let i = 0; i < s.n; i++) {
        const q = near(p, (s.rad || 20) * (0.35 + 0.65 * r()), Math.floor(r() * 1e6));
        const g = new T.Group(); g.position.set(q.x, 1.1, q.z); g.add(spr(s.icon, '#1a1020', '#ffd23f', 0.8)); W.glow(0xffd23f, 2.2, g, 0, 0, 0); C.S.group.add(g);
        V.items.push({ x: q.x, z: q.z, m: g, got: false, t: r() * 6 });
      }
    }
    if (s.t === 'talk' || s.t === 'escort') {
      const q = near(p, 3, (s.who.seed || 3) + st().step);
      person(s.who, q.x, q.z, s.t === 'talk' ? '💬' : '⭐').then(n => { if (!V || step() !== s || V.npc) return drop(n); V.npc = n; });
    }
  }
  function aim() {
    const s = step(); if (!s || !V.target) { V.beam.visible = false; return null; }
    let x = V.target.x, z = V.target.z;
    if (s.t === 'collect') { const it = V.items.filter(i => !i.got).sort((a, b) => Math.hypot(a.x - C.S.pl.x, a.z - C.S.pl.z) - Math.hypot(b.x - C.S.pl.x, b.z - C.S.pl.z))[0]; if (it) { x = it.x; z = it.z; } }
    if (s.t === 'talk' && V.npc) { x = V.npc.x; z = V.npc.z; }
    if (s.t === 'escort') { if (V.npc && !V.npc.follow) { x = V.npc.x; z = V.npc.z; } else { const t = pos(s.to); if (t) { x = t.x; z = t.z; } } }
    V.beam.visible = true; V.beam.position.set(x, 0, z); return { x, z };
  }

  MS.update = function (dt) {
    if (!V || !C || C.S !== AMC.Play.state()) return; const S = C.S;
    if (!V.built) { if ((V.wait -= dt) <= 0) setup(); return; }
    V.t += dt;
    for (const g of V.givers) if (g.n) { g.n.fig.update(dt); if (g.n.mark) g.n.mark.position.y = 2.95 + Math.sin(V.t * 3 + g.x) * 0.12; }
    if (V.npc && V.npc.fig) V.npc.fig.update(dt);
    if (V.beam.visible) { const r = V.beam.userData.ring; r.scale.setScalar(1 + Math.sin(V.t * 4) * 0.12); }
    const s = step(); if (!s) return; aim();
    if (AMC.Cut && AMC.Cut.active()) return;
    const p = S.pl, drv = !!S.drive, dT = V.target ? Math.hypot(V.target.x - p.x, V.target.z - p.z) : 1e9;
    if (V.timer > 0) {
      V.timer -= dt;
      if (V.timer <= 0) { AMC.Audio.sfx('miss'); C.msg('⏱ Zu spät! ' + s.txt + ' – nochmal ab hier.', 3); stepSetup(); }
    }
    if (s.t === 'at' && dT < (V.target.r || 2) + 2.5) {
      if (s.car && !drv) { if (!V.carHint) { V.carHint = true; C.msg('🚗 Für diesen Auftrag musst du im Auto ankommen!', 2.6); } }
      else return advance();
    }
    if (s.t === 'collect') {
      for (const it of V.items) {
        if (it.got) continue; it.t += dt; it.m.position.y = 1.1 + Math.sin(it.t * 2.5) * 0.18; it.m.rotation.y += dt;
        if (Math.hypot(it.x - p.x, it.z - p.z) < (drv ? 2.6 : 1.7)) {
          it.got = true; it.m.parent && it.m.parent.remove(it.m); AMC.Audio.sfx('collect'); W.particles.burst(it.x, 1.2, it.z, 0xffd23f, 22, { speed: 5 });
          const k = V.items.filter(i => i.got).length; C.msg(s.icon + ' ' + k + '/' + s.n, 1.2);
          if (k >= s.n) return advance();
        }
      }
    }
    if (s.t === 'rival' && !V.rival && dT < 22 && AMC.Drive && AMC.Drive.spawnRival) {
      V.rival = true; const q = near(V.target, 5, 99); C.msg('🤼 Da ist ' + s.name + '! Schnapp ihn dir und rangel ihn mit ' + AMC.glyph('x') + ' nieder!', 3.5);
      AMC.Drive.spawnRival(s.name, q.x, q.z, () => { if (V && step() === s) { C.msg('🤼 ' + s.name + ' gibt auf!', 2.4); advance(); } });
    }
    if (s.t === 'escort' && V.npc && V.npc.follow) {
      const n = V.npc;
      if (drv) { n.fig.root.visible = false; n.x = p.x; n.z = p.z; n.inCar = true; }
      else {
        if (n.inCar) { n.inCar = false; n.x = p.x + 1.2; n.z = p.z + 1.2; n.y = p.y; n.fig.root.visible = true; }
        const dx = p.x - n.x, dz = p.z - n.z, d = Math.hypot(dx, dz);
        if (d > 30) { n.x = p.x - dx / d * 2; n.z = p.z - dz / d * 2; }
        const sp = C.moveBody(n, dt, d > 2.4 ? dx / d : 0, d > 2.4 ? dz / d : 0, Math.min(8, 2 + d), 8);
        C.setAnim(n, sp > 0.6 ? (sp > 4 ? 'run' : 'walk') : 'idle');
      }
      const t = pos(s.to); if (t && Math.hypot(t.x - p.x, t.z - p.z) < (t.r || 2) + 3) { if (!drv) { n.fig.root.visible = true; } return advance(); }
    }
  };
  /** Interaktion: Auftraggeber ansprechen, Person befragen, Minispiel starten, Gast abholen */
  MS.interact = function (p) {
    if (!V || !V.built || !C || p !== C.S.pl) return null;
    const S = C.S;
    const atSt = (S.stations || []).some(x => Math.hypot(x.x - p.x, x.z - p.z) < x.r);
    if (!st().cur && !atSt) for (const g of V.givers) if (g.n && Math.hypot(g.x - p.x, g.z - p.z) < 2.6) return { label: (g.d.daily ? '❔ ' : '❗ ') + 'Auftrag: ' + g.d.icon + ' ' + g.d.t, run: () => accept(g) };
    const s = step(); if (!s) return null;
    if (s.t === 'talk' && V.npc && Math.hypot(V.npc.x - p.x, V.npc.z - p.z) < 2.6) return { label: '💬 ' + s.who.name + ' befragen', run: () => talkScene(s) };
    if (s.t === 'escort' && V.npc && !V.npc.follow && Math.hypot(V.npc.x - p.x, V.npc.z - p.z) < 2.6) return { label: '⭐ ' + s.who.name + ' abholen', run: () => { V.npc.follow = true; if (V.npc.mark) V.npc.mark.visible = false; AMC.Audio.sfx('cheer'); C.msg('⭐ ' + s.who.name + ' folgt dir. Mit Auto geht’s schneller!', 3); } };
    if (s.t === 'mini' && !V.miniBusy && V.target && Math.hypot(V.target.x - p.x, V.target.z - p.z) < (V.target.r || 2) + 3) return { label: '🎯 ' + s.txt, run: () => playMini(s) };
    return null;
  };
  /** Gebäude betreten (aus play.js, bevor die Szene wechselt) */
  MS.enter = function (id) {
    const s = step(); if (!s || s.t !== 'enter' || !matches(s.st, id)) return;
    const m = st(); m.step++; Save.save(); AMC.UI.toast('✅ ' + s.txt, 2600);
    if (m.step >= cur().steps.length) complete(true); else if (V) stepSetup();
  };
  function playMini(s) {
    if (!AMC.Worlds || !AMC.Worlds.play) return advance();
    V.miniBusy = true; const my = s;
    AMC.Worlds.play(s.kind, Object.assign({ color: '#ff8a1e' }, s.o), q => {
      if (!V) return; V.miniBusy = false; if (step() !== my) return;
      if (q >= (s.need || 0.3)) { AMC.Audio.sfx('applause'); advance(); } else { AMC.Audio.sfx('miss'); C.msg('😬 Knapp daneben – versuch es gleich nochmal!', 2.8); }
    });
  }
  function scene(lines, at, done) {
    const S = C.S, p = at || S.pl, a = Math.atan2(S.pl.x - p.x, S.pl.z - p.z) + 0.6;
    const cam = [p.x + Math.sin(a) * 4.6, 2.4, p.z + Math.cos(a) * 4.6], to = [p.x + Math.sin(a + 0.5) * 3.6, 2.0, p.z + Math.cos(a + 0.5) * 3.6];
    const shots = [{ cam, to, look: [(p.x + S.pl.x) / 2, 1.5, (p.z + S.pl.z) / 2], dur: 7, lines }];
    if (!AMC.Cut || !AMC.Cut.play(shots, done)) { const l = lines[lines.length - 1]; AMC.UI.bubble(l[0] === 'n' ? '🎙️' : (D.HOSTS[l[0]] || {}).name || l[0], l[1]); done && done(); }
  }
  function accept(g) {
    const d = g.d, m = st(); m.cur = d.id; m.step = 0; Save.save();
    AMC.Audio.sfx('star'); if (g.n) { g.n.fig.root.rotation.y = Math.atan2(C.S.pl.x - g.x, C.S.pl.z - g.z); C.setAnim(g.n, 'yes'); if (g.n.mark) g.n.mark.visible = false; }
    const go = () => { if (!V) return; V.givers.filter(x => x !== g).forEach(x => drop(x.n)); V.givers = V.givers.filter(x => x === g); stepSetup(); AMC.UI.toast(d.icon + ' Auftrag angenommen: ' + d.t + ' · ' + d.steps[0].txt, 4200); };
    scene(d.intro, { x: g.x, z: g.z }, go);
  }
  function talkScene(s) {
    const n = V.npc; n.fig.root.rotation.y = Math.atan2(C.S.pl.x - n.x, C.S.pl.z - n.z); C.setAnim(n, 'yes');
    if (n.fig.talk) { n.fig.talk(true); setTimeout(() => n.fig && n.fig.talk(false), 2600); }
    scene(s.lines, { x: n.x, z: n.z }, () => { if (V && step() === s) advance(); });
  }
  function advance() {
    const m = st(), d = cur(); if (!d) return; const s = d.steps[m.step];
    m.step++; Save.save(); V.carHint = false;
    AMC.Audio.sfx('perfect'); const p = C.S.pl; W.particles.burst(p.x, p.y + 1.6, p.z, 0xff8a1e, 30, { speed: 6 });
    if (m.step >= d.steps.length) return complete();
    AMC.UI.toast('✅ ' + s.txt + ' · Weiter: ' + d.steps[m.step].txt, 3600); stepSetup();
  }
  function complete(quiet) {
    const m = st(), d = cur(); if (!d) return;
    m.cur = null; m.step = 0; if (d.daily) m.day[d.daily] = today(); else m.done[d.id] = Date.now(); Save.save();
    const r = d.reward || {}, f = Save.earn(r.fan || 0), c = AMC.Career && AMC.Career.state(); if (c && r.abos) c.abos += r.abos;
    const S = AMC.Play.state();
    if (S && r.rub) { for (const k in r.rub) if (S.got[k] != null) S.got[k] += r.rub[k]; if (C && C.drawRub) C.drawRub(); }
    if (r.idea && AMC.Home && S) { const n = AMC.Home.needs(S.pl.H.id === 'rico' ? 'andrew' : S.pl.H.id); if (n && (n.ideas || []).length < 3) n.ideas.push(r.idea); }
    if (AMC.Feed && !d.daily) AMC.Feed.post(d.icon, 'Auftrag erledigt: ' + d.t + ' – danke Medienstadt!', 'story');
    if (AMC.Career) AMC.Career.state().today.errands = (AMC.Career.state().today.errands || 0) + 1;
    const fx = () => { if (!S) return; for (let i = 0; i < 6; i++) setTimeout(() => S === AMC.Play.state() && W.particles.burst(S.pl.x + U.rand(-3, 3), S.pl.y + 3 + U.rand(0, 2), S.pl.z + U.rand(-3, 3), U.pick([0xff3da8, 0x3dd6ff, 0xffd23f, 0x6cff8a]), 36, { speed: 8 }), i * 160); };
    const done = () => { AMC.Audio.sfx('win'); fx(); if (AMC.WorldFX) AMC.WorldFX.cheer && AMC.WorldFX.cheer(); AMC.UI.bubble(d.icon + ' Auftrag geschafft!', d.t, '+' + f + ' 🎟️' + (r.abos ? ' · +' + r.abos + ' Abos' : '') + (r.rub ? ' · Themen-Funken' : '') + (d.daily ? '' : ' · Story ' + MS.progress().done + '/' + STORY.length)); if (V && C) setup(); };
    if (!quiet && V && C && C.S === S && d.outro) scene(d.outro, null, done); else { if (V) V.beam.visible = false; done(); }
  }
  /** Auftrag abbrechen (aus dem Auftragsbuch) */
  MS.abort = function () { const m = st(); m.cur = null; m.step = 0; Save.save(); if (V) setup(); };

  // ------------------------------------------------------------------ HUD, Karte
  MS.text = function () {
    if (!V) return null; const d = cur(), s = step(); if (!d || !s) return null;
    const m = st(); let extra = '';
    if (s.t === 'collect') extra = ' (' + V.items.filter(i => i.got).length + '/' + s.n + ')';
    if (V.timer > 0) extra += ' · ⏱ ' + Math.ceil(V.timer) + ' s';
    if (s.car && !C.S.drive) extra += ' · 🚗 Auto nötig';
    return [d.icon + ' ' + U.esc(d.t) + ' · ' + U.esc(s.txt) + extra, (m.step + (s.t === 'collect' ? V.items.filter(i => i.got).length / s.n : 0)) / d.steps.length, 'Auftrag ' + (m.step + 1) + '/' + d.steps.length];
  };
  MS.mapDots = function () {
    if (!V || !V.built) return []; const out = [];
    if (!st().cur) V.givers.forEach(g => out.push({ x: g.x, z: g.z, c: g.d.daily ? '#3dd6ff' : '#ffd23f', t: g.d.daily ? '❔' : '❗' }));
    if (V.beam.visible) out.push({ x: V.beam.position.x, z: V.beam.position.z, c: '#ff8a1e', ring: true });
    return out;
  };
  MS.timer = () => (V && V.timer > 0 ? V.timer : 0);

  // ------------------------------------------------------------------ Auftragsbuch (Gesamtmenü)
  MS.panel = function () {
    const m = st(), a = MS.active();
    const row = (d, i) => { const done = m.done[d.id], curr = m.cur === d.id, open = !done && STORY.findIndex(x => !m.done[x.id]) === i; return '<div class="st-item' + (curr ? ' on' : '') + '"><span class="st-ic">' + (done ? '✅' : curr ? '▶' : open ? '❗' : '🔒') + '</span><span><b>' + d.icon + ' ' + U.esc(d.t) + '</b><small>' + (done ? 'Erledigt' : curr ? 'Läuft: ' + U.esc(d.steps[m.step].txt) : open ? 'Auftraggeber: ' + U.esc(d.giver.name) + ' (❗ auf der Karte)' : 'Noch gesperrt') + '</small></span></div>'; };
    const daily = DAILY.map(x => '<div class="st-item"><span class="st-ic">' + (m.day[x.id] === today() ? '✅' : '❔') + '</span><span><b>' + x.icon + ' ' + x.t + '</b><small>' + (m.day[x.id] === today() ? 'Heute erledigt – morgen gibt’s einen neuen' : 'Tagesjob: ❔ auf der Karte') + '</small></span></div>').join('');
    const s = AMC.UI.open('<div class="panel glass"><header><h2>📋 Auftragsbuch</h2><button class="btn small" data-nav id="msB">' + AMC.glyph('b') + ' Zurück</button></header><p class="hint">' + (a ? '▶ Aktiv: ' + U.esc(a.t) + ' – ' + U.esc(a.txt || '') : 'Sprich Leute mit ❗ (Story) oder ❔ (Tagesjob) an. Die Lichtsäule zeigt dir das Ziel.') + ' · Story ' + MS.progress().done + '/' + STORY.length + '</p>' +
      (a ? '<button type="button" class="btn small" data-nav id="msX">✖ Auftrag abbrechen</button>' : '') + '<div class="st-list">' + STORY.map(row).join('') + daily + '</div></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#msB').onclick = () => AMC.UI.close(s);
    const x = s.el.querySelector('#msX'); if (x) x.onclick = () => { MS.abort(); AMC.UI.close(s); AMC.UI.toast('Auftrag abgebrochen. Der Auftraggeber wartet wieder auf dich.', 3000); };
    return s;
  };
})(typeof window !== 'undefined' ? window : globalThis);
