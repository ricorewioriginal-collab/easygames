(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'easygames.kraterkommando.match.v2';
  const SETTINGS = 'easygames.kraterkommando.settings.v1';
  const PROGRESS = 'easygames.kraterkommando.campaign.v1';
  // Gelände: 64 × 64 Einheiten, Höhenraster mit 0,5er Auflösung (129 × 129 Punkte).
  const SIZE = 64, GRID = 128, HALF = SIZE / 2, CELL = SIZE / GRID, VERTS = GRID + 1;
  const SEABED = -4, TURN_SECONDS = 45, RETREAT_SECONDS = 4, G_PROJ = 13, G_UNIT = 17, STEP = 1 / 120, WIND = .9;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const names = [['Nova', 'Keks', 'Pixel', 'Bolt', 'Rübe', 'Zappa', 'Krümel', 'Wumme'], ['Funk', 'Momo', 'Komet', 'Blitz', 'Boris', 'Fussel', 'Tango', 'Wanze']];
  const teamNames = ['ROT', 'BLAU'], teamColors = ['#ff6f61', '#4cc3ff'];
  const worlds = {
    island: { name: 'Smaragdinsel', sky: 0x8fd3f0, water: 0x2f86b8, sand: 0xe9d8a0, low: 0x58b04a, high: 0x9cc65e, rock: 0x8b8172, dirt: 0x5e4430, bed: 0xc7b884, trunk: 0x745340, leaf: 0x3f9a4f },
    desert: { name: 'Staub-Canyon', sky: 0xf2c38f, water: 0x3c8da0, sand: 0xedcb8f, low: 0xdcaa68, high: 0xc58049, rock: 0xa0603c, dirt: 0x5d3c28, bed: 0xb88f5e, trunk: 0x6e8f4c, leaf: 0x6e8f4c },
    snow: { name: 'Frostfestung', sky: 0xbad7ea, water: 0x3d7590, sand: 0xc9dbe6, low: 0xeef5fa, high: 0xffffff, rock: 0x6f7f8f, dirt: 0x56606b, bed: 0x8aa5b3, trunk: 0x5a4636, leaf: 0x2f6a55 },
    volcano: { name: 'Lava-Krater', sky: 0x3d2b33, water: 0xe0480f, sand: 0x2e2628, low: 0x3a3234, high: 0x5a4a44, rock: 0x231e20, dirt: 0x1c1617, bed: 0x5a2a1a, trunk: 0x2a2224, leaf: 0xff8a3d, lava: true }
  };
  // Feldzug: Würmer pro Seite wachsen mit dem Level, der Gegner wächst schneller.
  const LEVELS = [
    [2, 2, 'island'], [2, 3, 'desert'], [3, 3, 'snow'], [3, 4, 'volcano'], [3, 4, 'island'], [4, 5, 'desert'],
    [4, 5, 'snow'], [4, 6, 'volcano'], [5, 6, 'island'], [5, 7, 'desert'], [6, 7, 'snow'], [6, 8, 'volcano']
  ];
  const WORLD_ORDER = ['island', 'desert', 'snow', 'volcano'];
  function levelConfig(level) {
    const row = LEVELS[Math.min(level, LEVELS.length) - 1], extra = Math.max(0, level - LEVELS.length);
    return { player: row[0], enemy: row[1], world: extra ? WORLD_ORDER[(level - 1) % 4] : row[2], mines: Math.min(14, 2 + level), barrels: Math.min(9, 3 + (level >> 1)),
      skill: .22 + Math.min(level, 16) * .05, suddenDeath: Math.max(7, 15 - (level >> 1)), windMax: Math.min(3.2, 1 + level * .2), enemyHp: 100 + Math.min(50, extra * 10) };
  }
  const WEAPONS = [
    ['rocket', '🚀', 'Bazooka', 'Fliegt mit dem Wind'],
    ['grenade', '💣', 'Granate', '3 s Zünder, springt'],
    ['shotgun', '🔫', 'Schrotflinte', 'Zwei Schüsse'],
    ['cluster', '✨', 'Streubombe', 'Zerplatzt in 5 Bomben'],
    ['homing', '🎯', 'Zielsuchrakete', 'Ziel antippen'],
    ['airstrike', '✈️', 'Luftangriff', 'Ziel antippen'],
    ['bat', '🏏', 'Baseballschläger', 'Nahkampf, fliegt weit'],
    ['dynamite', '🧨', 'Dynamit', 'Ablegen und weg!'],
    ['mine', '⚙️', 'Mine', 'Ablegen, scharf nach 2 s'],
    ['sheep', '🐑', 'Schaf', 'Läuft los · Feuer = Bumm'],
    ['banana', '🍌', 'Bananenbombe', 'Riesige Streuwirkung'],
    ['holy', '🔆', 'Heilige Granate', 'Halleluja!'],
    ['drill', '⛏️', 'Bohrrakete', 'Bohrt sich ins Gelände'],
    ['teleport', '🌀', 'Teleporter', 'Ziel antippen']
  ];
  const LABEL = Object.fromEntries(WEAPONS.map(w => [w[0], w]));
  const CHARGE = new Set(['rocket', 'grenade', 'cluster', 'homing', 'banana', 'holy', 'drill']);
  const NEEDS_TARGET = new Set(['airstrike', 'teleport', 'homing']);
  const PROJ = {
    rocket: { wind: 1, impact: 1, r: 3.2, dmg: 50 },
    homing: { wind: 1, impact: 1, r: 3, dmg: 50, homing: 1 },
    drill: { impact: 1, r: 2.8, dmg: 42, drill: 1 },
    grenade: { bounce: .45, fuse: 3, r: 3.2, dmg: 50 },
    cluster: { bounce: .4, fuse: 3, r: 2.4, dmg: 30, split: 'bomblet' },
    banana: { bounce: .55, fuse: 3, r: 4, dmg: 55, split: 'bananalet' },
    holy: { bounce: .3, fuse: 3, r: 6.5, dmg: 95, holy: 1 },
    bomblet: { impact: 1, r: 1.9, dmg: 24 },
    bananalet: { impact: 1, r: 3.2, dmg: 42 },
    airbomb: { wind: 1, impact: 1, r: 2.4, dmg: 30 }
  };
  const quips = {
    turn: ['So. Wer möchte heute enttäuscht werden?', 'Ich hab einen Plan. Er ist nur nicht gut.', 'Kurze Frage: Wer von euch kann schwimmen?', 'Keine Sorge, ich ziele nur ungefähr.', 'Ich bin dran. Eure Lebensentscheidungen auch.'],
    fire: ['Liefere jetzt schlechte Nachrichten per Express!', 'Das ist keine Rakete, das ist Kritik.', 'Bitte lächeln. Für den Krater.', 'Ich nenne das diplomatische Eskalation.', 'Kopf hoch. Noch.'],
    hit: ['Sogar dein Schatten ist jetzt beleidigt.', 'Treffer! Dein Schutzengel hat gekündigt.', 'Das war Absicht. Ausnahmsweise.', 'Du hast gerade Bodenhaftung beantragt.', 'Die Landschaft steht dir besser als Deckung.'],
    hurt: ['Wow. Und ich mochte dieses Körperteil.', 'War das ein Angriff oder eine Charakterstudie?', 'Okay, das war unhöflich präzise.', 'Mein Anwalt hört von dir. Wenn ich einen finde.', 'Ich hab schon sanftere Autotüren erlebt.'],
    death: ['Ich geh dann mal… sehr weit nach unten.', 'Sagt meiner Deckung, sie war nutzlos.', 'Das war strategischer Rückzug. Für immer.', 'War schön. Für euch offenbar.'],
    drown: ['Blubb.', 'Ich kann doch gar nicht schwimmen!', 'Wasser ist auch nur Boden, der nachgibt.'],
    miss: ['Der Boden hat sich wenigstens erschrocken.', 'Mein Ziel war die Atmosphäre. Getroffen.', 'Nur ein Warnschuss. Für die Physik.', 'Die Rakete hatte eigene Pläne.', 'Nicht verfehlt. Weiträumig beleidigt.'],
    victory: ['Ich nehme Dankesreden in bar.', 'Taktik? Nein. Aber es sah teuer aus.', 'Der Krater bekommt meinen Namen.', 'Für euch war das Lernen. Für mich Dienstag.'],
    pass: ['Ich schenke euch einen Zug. Bereut ihn.', 'Großzügigkeit ist meine gefährlichste Waffe.'],
    timeout: ['Die Uhr ist eindeutig gegen mich.', 'Zu spät? Ich nenne das dramatisch.'],
    teleport: ['Ich bin dann mal woanders besser.', 'Überraschung! Ich kann auch weglaufen.'],
    crate: ['Geschenk! Für mich? Wie aufmerksam.', 'Kiste gefunden. Mein Glückstag.']
  };
  const signatureQuips = { Nova: 'Ich bin nicht aggressiv. Nur sehr überzeugend bewaffnet.', Keks: 'Man hat mich unterschätzt. Ausnahmsweise ein Fehler.', Pixel: 'Ich ziele in 4K. Du weichst in 144p aus.', Funk: 'Ist das Mikro an? Gut, gleich wird’s peinlich.', Momo: 'Ich schieße erst und lese dann die Anleitung.', Komet: 'Mein Auftritt wird einschlagen. Wortwörtlich.' };

  let scene, camera, renderer, terrain, water, sun, raycaster, aimLine, aimPositions, arrow, crosshair, targetMarker;
  let S = null, H = null, scar = null, active = false, paused = false, charging = false, overview = false;
  let gameTime = 0, last = 0, acc = 0, shake = 0, camDistance = 13, cameraFocus = null, cameraAz = 0, overviewAz = .6, lastBlast = null;
  let strikeFocus = null, projectiles = [], particles = [], events = [], sheep = null, bot = null, holdUntil = 0, waitStart = 0, retreatLeft = 0, shotsLeft = 0, pausedFrames = 0;
  let stickX = 0, stickY = 0, actionDamage = 0, actionFired = false, hurtActive = false, hudDirty = true, timerShown = -1, matchId = 0;
  let audioContext = null, soundEnabled = true, musicAcc = 0, musicStep = 0, lastFlash = 0, menuWorld = 'island', menuLevel = 1, progress = 1, messageTimer = 0;
  let bodies = [], deco = [], itemMeshes = new Map();
  // Freie 3D-Modelle (CC0, siehe models/LIZENZ.md): Figuren je Team, Requisiten mit Vertexfarben
  const FIG_TEAM = [['cat', 'ninja', 'chicken', 'pigeon'], ['orc', 'alien', 'yeti', 'wizard']];
  const ASSET = { fig: {}, props: {}, ready: false };
  let attract = null, celebrate = null, inputMode = 'touch', padKind = 'xbox';
  const pressed = new Set(), speeches = [], lastQuip = new Map(), GEO = {}, MAT = {};
  let UP, TMP;

  // ---------- Klang ----------
  function ctx() {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }
  function sound(freq, duration = .16, type = 'square', gain = .035) {
    if (!soundEnabled) return;
    try {
      const a = ctx(), osc = a.createOscillator(), vol = a.createGain(), t = a.currentTime;
      osc.type = type; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(Math.max(35, freq * .38), t + duration);
      vol.gain.setValueAtTime(gain, t); vol.gain.exponentialRampToValueAtTime(.001, t + duration);
      osc.connect(vol).connect(a.destination); osc.start(t); osc.stop(t + duration);
    } catch (_) {}
  }
  let noiseBuffer = null;
  function noiseSound(duration = .3, volume = .08, freq = 750) {
    if (!soundEnabled) return;
    try {
      const a = ctx();
      if (!noiseBuffer) {
        noiseBuffer = a.createBuffer(1, a.sampleRate, a.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      const source = a.createBufferSource(), filter = a.createBiquadFilter(), gain = a.createGain(), t = a.currentTime;
      source.buffer = noiseBuffer; filter.type = 'lowpass'; filter.frequency.value = freq;
      gain.gain.setValueAtTime(volume, t); gain.gain.exponentialRampToValueAtTime(.001, t + duration);
      source.connect(filter).connect(gain).connect(a.destination); source.start(t); source.stop(t + duration);
    } catch (_) {}
  }
  function boomSound(r) { sound(70 + 40 / r, .3 + r * .04, 'sawtooth', .06); noiseSound(.3 + r * .06, .05 + r * .012, 500 + 80 * r); }
  function musicTick(dt) {
    if (!active || paused || !soundEnabled) return;
    musicAcc += dt;
    if (musicAcc < .36) return;
    musicAcc = 0;
    const notes = [196, 0, 247, 0, 294, 0, 247, 0, 220, 0, 262, 0, 330, 0, 262, 0];
    const note = notes[musicStep++ % notes.length];
    if (note) sound(note, .22, 'triangle', .007);
  }
  function setSound(enabled) {
    soundEnabled = enabled;
    $('pauseSoundBtn').textContent = enabled ? '🔊 Spielsound an' : '🔇 Spielsound aus';
    if ($('soundVal')) $('soundVal').textContent = enabled ? 'An' : 'Aus';
    try { localStorage.setItem('easygames.kraterkommando.sound', enabled ? '1' : '0'); } catch (_) {}
    if (enabled) sound(520, .1, 'triangle', .03);
  }

  // ---------- Texte ----------
  const updateLoad = (v, s) => { $('progress').style.width = v + '%'; $('loadStatus').textContent = s; };
  function announce(s, ms = 2200) {
    $('message').textContent = s; $('message').classList.add('show');
    clearTimeout(messageTimer); messageTimer = setTimeout(() => $('message').classList.remove('show'), ms);
  }
  function clearSpeeches() { for (const item of speeches) item.el.remove(); speeches.length = 0; }
  function say(unit, event) {
    if (!unit || !quips[event] || !active) return;
    const key = unit.name + ':' + event, lines = quips[event], previous = lastQuip.get(key);
    const choices = lines.filter(line => line !== previous);
    const line = event === 'turn' && Math.random() < .35 && signatureQuips[unit.name] ? signatureQuips[unit.name] : choices[Math.floor(Math.random() * choices.length)];
    lastQuip.set(key, line);
    for (let i = speeches.length - 1; i >= 0; i--) if (speeches[i].unit === unit) { speeches[i].el.remove(); speeches.splice(i, 1); }
    if (speeches.length >= 2) speeches.shift().el.remove();
    const el = document.createElement('div'); el.className = 'speech-bubble ' + (unit.team ? 'blue' : 'red');
    const speaker = document.createElement('strong'), words = document.createElement('span');
    speaker.textContent = unit.name; words.textContent = line; el.append(speaker, words); $('game').appendChild(el);
    speeches.push({ unit, el, expires: performance.now() + (event === 'death' || event === 'victory' ? 3600 : 2600) });
    const pitch = 420 + S.units.indexOf(unit) * 30;
    sound(pitch, .08, 'triangle', .012);
  }
  const project = (x, y, z) => new THREE.Vector3(x, y, z).project(camera);
  function updateSpeeches(now) {
    for (let i = speeches.length - 1; i >= 0; i--) {
      const item = speeches[i];
      if (now > item.expires || !active) { item.el.remove(); speeches.splice(i, 1); continue; }
      const u = item.unit, p = project(u.x, u.y + 3.4, u.z);
      const x = (p.x + 1) * innerWidth / 2, y = (1 - p.y) * innerHeight / 2;
      const off = p.z > 1 || x < 20 || x > innerWidth - 20 || y < 110 || y > innerHeight - 150;
      item.el.classList.toggle('offscreen', off);
      item.el.style.left = (off ? innerWidth / 2 : clamp(x, 105, innerWidth - 105)) + 'px';
      item.el.style.top = (off ? 145 + i * 66 : y - 4) + 'px';
    }
  }
  function damageNumber(u, amount) {
    const p = project(u.x, u.y + 2.6, u.z);
    if (p.z > 1) return;
    const el = document.createElement('div'); el.className = 'damage-number' + (u.team ? ' blue' : ' red'); el.textContent = '−' + amount;
    el.style.left = ((p.x + 1) * innerWidth / 2) + 'px'; el.style.top = ((1 - p.y) * innerHeight / 2) + 'px';
    $('game').appendChild(el); setTimeout(() => el.remove(), 1200);
  }

  // ---------- Gelände ----------
  function mulberry(a) {
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function makeNoise(seed) {
    const hash = (x, z) => { let h = Math.imul(x, 374761393) + Math.imul(z, 668265263) + Math.imul(seed, 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const sm = t => t * t * (3 - 2 * t);
    const value = (x, z) => {
      const ix = Math.floor(x), iz = Math.floor(z), fx = sm(x - ix), fz = sm(z - iz);
      const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
      return (a + (b - a) * fx) * (1 - fz) + (c + (d - c) * fx) * fz;
    };
    return (x, z, oct = 4) => { let s = 0, amp = 1, f = 1, n = 0; for (let i = 0; i < oct; i++) { s += value(x * f, z * f) * amp; n += amp; amp *= .5; f *= 2.03; } return s / n * 2 - 1; };
  }
  const segDist = (x, z, a, b) => {
    const dx = b.x - a.x, dz = b.z - a.z, t = clamp(((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz), 0, 1);
    return Math.hypot(x - a.x - dx * t, z - a.z - dz * t);
  };
  // Jede Welt hat ein eigenes Kartenprinzip wie die klassischen Worms-Karten.
  function generateMap(world, seed) {
    const R = mulberry(seed), n = makeNoise(seed), h = new Float32Array(VERTS * VERTS);
    let shape;
    if (world === 'island') {
      // Inselgruppe: zwei bis drei hügelige Inseln, oft mit schmaler Landbrücke.
      const count = R() < .55 ? 3 : 2, blobs = [], start = R() * Math.PI * 2;
      for (let i = 0; i < count; i++) {
        const a = start + i / count * Math.PI * 2 + rand(-.25, .25) * 0 + (R() - .5) * .5;
        blobs.push({ x: Math.cos(a) * (count === 2 ? 14 : 14.5), z: Math.sin(a) * (count === 2 ? 9 : 13), r: 10.5 + R() * 3.5, top: 5 + R() * 4.5 });
      }
      const bridges = [];
      for (let i = 0; i < count; i++) if (R() < .7) bridges.push([blobs[i], blobs[(i + 1) % count]]);
      shape = (x, z) => {
        let land = -2, top = 0;
        for (const b of blobs) { const m = 1 - Math.hypot(x - b.x, z - b.z) / b.r; if (m > land) { land = m; top = b.top; } }
        land += n(x * .08, z * .08) * .3;
        const hills = 1.2 + top * smoothstep(0, .75, land) + n(x * .16 + 9, z * .16 - 3, 3) * 1.6 + Math.max(0, n(x * .11 - 4, z * .11 + 7)) * 4;
        let y = SEABED + (hills - SEABED) * smoothstep(-.12, .12, land);
        for (const [a, b] of bridges) { const d = segDist(x, z, a, b); if (d < 1.8) y = Math.max(y, 1.3 + n(x * .3, z * .3) * .25 - Math.max(0, d - 1) * 1.5); }
        return y;
      };
    } else if (world === 'desert') {
      // Canyon: terrassierte Tafelberge mit Steilwänden, ein Fluss teilt die Karte, Felsbrücken führen hinüber.
      const phase = R() * 6, bridgesX = [rand(-14, -6), rand(6, 14)];
      shape = (x, z) => {
        const land = 1 - Math.hypot(x / 28, z / 23) + n(x * .06, z * .06) * .22;
        let v = 1.6 + (n(x * .055 + 3, z * .055 - 2) * .5 + .5) * 11;
        const step = 2.7, t = v / step, f = Math.floor(t);
        v = (f + smoothstep(.72, .96, t - f)) * step;
        const path = Math.sin(x * .11 + phase) * 7 + n(x * .05, 3.1) * 3, d = Math.abs(z - path);
        if (d < 4.5 && !bridgesX.some(bx => Math.abs(x - bx) < 1.7)) v = -1.2 + (v + 1.2) * smoothstep(2.2, 4.5, d);
        return SEABED + (v - SEABED) * smoothstep(-.06, .1, land);
      };
    } else if (world === 'snow') {
      // Festungen: zwei Burgen mit Mauern und Tor, Tal mit Eishügeln, Turm in der Mitte.
      const fx = 17 + R() * 2, gateSide = R() < .5 ? 1 : -1;
      const fort = (x, z, cx) => {
        const dx = Math.abs(x - cx) - 7.5, dz = Math.abs(z) - 9;
        const outside = Math.hypot(Math.max(dx, 0), Math.max(dz, 0)), inside = Math.min(Math.max(dx, dz), 0);
        let y = 7.6 - outside * 2.6 + n(x * .4, z * .4, 2) * .25;
        const toCenter = Math.sign(-cx) === Math.sign(x - cx);
        if (inside > -1.1 && outside === 0 && !(toCenter && dx > -1.1 && Math.abs(z - gateSide * 3) < 2.2)) y = 10.4;
        return y;
      };
      shape = (x, z) => {
        const land = 1 - Math.max(Math.abs(x) / 29.5, Math.abs(z) / 21) + n(x * .07, z * .07) * .1;
        let y = 2.2 + n(x * .1, z * .1) * 1.6 + Math.max(0, n(x * .2 + 5, z * .2)) * 1.4;
        y = Math.max(y, fort(x, z, -fx), fort(x, z, fx), 9.5 - Math.max(0, Math.hypot(x, z) - 2.6) * 3);
        return SEABED + (y - SEABED) * smoothstep(0, .1, land);
      };
    } else {
      // Vulkan: Kraterrand als Ring-Insel, Lavasee, Vulkankegel in der Mitte, zwei Grate als Brücken.
      const a1 = R() * Math.PI * 2, a2 = a1 + Math.PI * (.75 + R() * .5);
      shape = (x, z) => {
        const r = Math.hypot(x, z) + n(x * .09, z * .09) * 2.4, ang = Math.atan2(z, x);
        let cone = 12 - r * 1.05;
        if (r < 3) cone = Math.min(cone, 7.6 + r * .4);
        const t = (r - 12.5) / 15;
        const rim = t > 0 && t < 1 ? 1.4 + 6.4 * Math.pow(Math.sin(t * Math.PI), .7) + n(x * .15, z * .15) * 1.5 : -3;
        let y = Math.max(cone, rim, -2.2);
        for (const a of [a1, a2]) {
          const da = Math.abs(Math.atan2(Math.sin(ang - a), Math.cos(ang - a))) * r;
          if (r > 7 && r < 15 && da < 1.6) y = Math.max(y, 2.4 - Math.max(0, da - .9) * 2);
        }
        return y;
      };
    }
    for (let j = 0; j < VERTS; j++) for (let i = 0; i < VERTS; i++) {
      const x = -HALF + i * CELL, z = -HALF + j * CELL;
      const e = smoothstep(31.5, 27.5, Math.max(Math.abs(x), Math.abs(z)));
      h[j * VERTS + i] = clamp(SEABED + (shape(x, z) - SEABED) * e, SEABED, 14);
    }
    return h;
  }
  function height(x, z) {
    if (x <= -HALF || x >= HALF || z <= -HALF || z >= HALF) return SEABED;
    const gx = Math.min((x + HALF) / CELL, GRID - 1e-4), gz = Math.min((z + HALF) / CELL, GRID - 1e-4);
    const ix = gx | 0, iz = gz | 0, tx = gx - ix, tz = gz - iz, i = iz * VERTS + ix;
    return (H[i] * (1 - tx) + H[i + 1] * tx) * (1 - tz) + (H[i + VERTS] * (1 - tx) + H[i + VERTS + 1] * tx) * tz;
  }
  function terrainNormal(x, z) {
    const e = .3, nx = height(x - e, z) - height(x + e, z), nz = height(x, z - e) - height(x, z + e), ny = 2 * e, l = Math.hypot(nx, ny, nz);
    return { x: nx / l, y: ny / l, z: nz / l };
  }
  const palette = {};
  function setPalette() {
    const w = worlds[S.world];
    for (const k of ['sand', 'low', 'high', 'rock', 'dirt', 'bed']) palette[k] = new THREE.Color(w[k]);
  }
  function vertexColor(i, out, o) {
    const x = i % VERTS, z = (i / VERTS) | 0, h = H[i];
    const dx = (H[z * VERTS + Math.min(GRID, x + 1)] - H[z * VERTS + Math.max(0, x - 1)]) / (2 * CELL);
    const dz = (H[Math.min(GRID, z + 1) * VERTS + x] - H[Math.max(0, z - 1) * VERTS + x]) / (2 * CELL);
    const slope = Math.hypot(dx, dz), wl = S.water;
    let r, g, b;
    const mix = (c, t) => { r += (c.r - r) * t; g += (c.g - g) * t; b += (c.b - b) * t; };
    if (h < wl - .3) { r = palette.bed.r; g = palette.bed.g; b = palette.bed.b; }
    else {
      const t = clamp((h - wl - .8) / 9, 0, 1);
      r = palette.low.r; g = palette.low.g; b = palette.low.b; mix(palette.high, t);
      if (h < wl + .9) mix(palette.sand, 1 - smoothstep(wl + .4, wl + .9, h));
      mix(palette.rock, smoothstep(.9, 1.7, slope));
    }
    if (scar[i]) mix(palette.dirt, .55);
    const v = .93 + ((Math.imul(i, 2654435761) >>> 24) / 255) * .12;
    out[o] = r * v; out[o + 1] = g * v; out[o + 2] = b * v;
  }
  function buildTerrain() {
    if (terrain) { scene.remove(terrain); terrain.geometry.dispose(); }
    setPalette();
    const pos = new Float32Array(VERTS * VERTS * 3), col = new Float32Array(VERTS * VERTS * 3), idx = new Uint16Array(GRID * GRID * 6);
    for (let i = 0; i < VERTS * VERTS; i++) {
      pos[i * 3] = -HALF + (i % VERTS) * CELL; pos[i * 3 + 1] = H[i]; pos[i * 3 + 2] = -HALF + ((i / VERTS) | 0) * CELL;
      vertexColor(i, col, i * 3);
    }
    let k = 0;
    for (let z = 0; z < GRID; z++) for (let x = 0; x < GRID; x++) {
      const a = z * VERTS + x, b = a + 1, c = a + VERTS, d = c + 1;
      idx[k++] = a; idx[k++] = c; idx[k++] = b; idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals();
    terrain = new THREE.Mesh(g, MAT.terrain); terrain.receiveShadow = true; scene.add(terrain);
  }
  function refreshTerrain(i0, i1, j0, j1) {
    const g = terrain.geometry, pos = g.attributes.position.array, col = g.attributes.color.array;
    for (let j = Math.max(0, j0 - 1); j <= Math.min(GRID, j1 + 1); j++) for (let i = Math.max(0, i0 - 1); i <= Math.min(GRID, i1 + 1); i++) {
      const v = j * VERTS + i; pos[v * 3 + 1] = H[v]; vertexColor(v, col, v * 3);
    }
    g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.computeVertexNormals();
  }
  function crater(x, y, z, r) {
    const i0 = Math.max(0, Math.floor((x - r + HALF) / CELL)), i1 = Math.min(GRID, Math.ceil((x + r + HALF) / CELL));
    const j0 = Math.max(0, Math.floor((z - r + HALF) / CELL)), j1 = Math.min(GRID, Math.ceil((z + r + HALF) / CELL));
    let changed = false;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const wx = -HALF + i * CELL, wz = -HALF + j * CELL, d = Math.hypot(wx - x, wz - z);
      if (d >= r) continue;
      const s = Math.sqrt(r * r - d * d), bottom = y - s * .75, top = y + s * .9, v = j * VERTS + i, hv = H[v];
      if (hv <= bottom) continue;
      let nh;
      if (hv <= top) nh = bottom;
      else if (hv - top < 2.5) nh = hv - (top - bottom) * .3;
      else continue;
      H[v] = Math.max(SEABED, nh); scar[v] = 1; changed = true;
    }
    if (changed) refreshTerrain(i0, i1, j0, j1);
  }

  // ---------- Zustand ----------
  const alive = u => !u.dead && u.hp > 0;
  function encodeHeights(h) {
    const a = new Int16Array(h.length);
    for (let i = 0; i < h.length; i++) a[i] = Math.round(h[i] * 100);
    const bytes = new Uint8Array(a.buffer); let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function decodeHeights(str) {
    const s = atob(str), bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
    const a = new Int16Array(bytes.buffer), h = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) h[i] = a[i] / 100;
    return h;
  }
  function startAmmo(campaign, level) {
    return { rocket: -1, grenade: -1, shotgun: -1, bat: 2, cluster: 3, homing: 2, airstrike: 1, dynamite: 2, mine: 2, sheep: 2,
      banana: !campaign || level >= 3 ? 1 : 0, holy: !campaign || level >= 6 ? 1 : 0, drill: 2, teleport: 2 };
  }
  function findSpot(taken, minDist, waterGap = 1.2) {
    for (let tries = 0; tries < 900; tries++) {
      const relax = tries > 600 ? .5 : tries > 300 ? .75 : 1;
      const x = rand(-28, 28), z = rand(-28, 28), y = height(x, z);
      if (y < S.water + waterGap) continue;
      const slope = Math.abs(height(x + .6, z) - height(x - .6, z)) + Math.abs(height(x, z + .6) - height(x, z - .6));
      if (slope > 1.1) continue;
      if ([0, 1, 2, 3, 4, 5].some(k => height(x + Math.cos(k * 1.05) * 2.6, z + Math.sin(k * 1.05) * 2.6) < S.water + waterGap * .4)) continue;
      if (taken.some(p => Math.hypot(p.x - x, p.z - z) < minDist * relax)) continue;
      return { x, z, y };
    }
    return null;
  }
  function newState(cfg) {
    const seed = Math.floor(Math.random() * 1e9);
    S = { version: 2, seed, world: cfg.world, mode: cfg.mode, level: cfg.level, difficulty: cfg.difficulty, water: 0, wind: 0,
      round: 0, team: 1, current: -1, lastByTeam: [-1, -1], units: [], items: [], ammo: [], winner: null,
      skill: cfg.skill, suddenDeath: cfg.suddenDeath, windMax: cfg.windMax, help: cfg.difficulty, yaw: 90, angle: 35, power: 0, weapon: 'rocket', target: null };
    H = generateMap(cfg.world, seed); scar = new Uint8Array(H.length);
    const taken = [];
    const counts = [cfg.player, cfg.enemy], order = [];
    for (let t = 0; t < 2; t++) for (let i = 0; i < counts[t]; i++) order.push([t, i]);
    order.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    for (const [team, i] of order) {
      const p = findSpot(taken, 5.5) || findSpot(taken, 2, .6) || { x: 0, z: 0, y: height(0, 0) };
      taken.push(p);
      S.units.push({ team, name: names[team][i], x: p.x, y: p.y, z: p.z, hp: team === 1 ? cfg.enemyHp : 100, maxHp: team === 1 ? cfg.enemyHp : 100,
        face: Math.atan2(-p.x, p.z) * 180 / Math.PI, dead: false, drowned: false, vx: 0, vy: 0, vz: 0, air: false });
    }
    S.units.sort((a, b) => a.team - b.team);
    for (let i = 0; i < cfg.mines; i++) { const p = findSpot(taken, 3.2); if (p) { taken.push(p); S.items.push({ t: 'mine', x: p.x, y: p.y, z: p.z, fuse: null, arm: 0 }); } }
    for (let i = 0; i < cfg.barrels; i++) { const p = findSpot(taken, 3); if (p) { taken.push(p); S.items.push({ t: 'barrel', x: p.x, y: p.y, z: p.z, fuse: null }); } }
    const ammo = startAmmo(cfg.mode === 'campaign', cfg.level);
    S.ammo = [{ ...ammo }, { ...ammo }];
    return S;
  }
  function serialize() {
    const units = S.units.map(u => ({ team: u.team, name: u.name, x: +u.x.toFixed(2), y: +u.y.toFixed(2), z: +u.z.toFixed(2), hp: u.hp, maxHp: u.maxHp, face: Math.round(u.face), dead: u.dead, drowned: u.drowned }));
    const items = S.items.filter(it => it.t !== 'dynamite').map(it => ({ t: it.t, x: +it.x.toFixed(2), y: +it.y.toFixed(2), z: +it.z.toFixed(2), fuse: null, arm: 0, kind: it.kind }));
    const { version, seed, world, mode, level, difficulty, water, wind, round, team, current, lastByTeam, ammo, winner, skill, suddenDeath, windMax, help } = S;
    return JSON.stringify({ version, seed, world, mode, level, difficulty, water, wind, round, team, current, lastByTeam, ammo, winner, skill, suddenDeath, windMax, help, units, items, heights: encodeHeights(H), scar: encodeScar() });
  }
  function encodeScar() { const out = []; for (let i = 0; i < scar.length; i++) if (scar[i]) out.push(i); return out; }
  function save() {
    if (!S) return;
    try { localStorage.setItem(KEY, serialize()); } catch (_) { announce('Speicher voll – Gefecht konnte nicht gespeichert werden'); }
  }
  function read() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!s || s.version !== 2 || !worlds[s.world] || !Array.isArray(s.units) || !s.units.length || typeof s.heights !== 'string') return null;
      const h = decodeHeights(s.heights);
      if (h.length !== VERTS * VERTS) return null;
      return { s, h };
    } catch (_) { return null; }
  }
  function loadSaved() {
    const r = read(); if (!r) return false;
    S = r.s; H = r.h; scar = new Uint8Array(H.length);
    for (const i of S.scar || []) scar[i] = 1;
    delete S.scar; delete S.heights;
    for (const u of S.units) Object.assign(u, { vx: 0, vy: 0, vz: 0, air: false });
    Object.assign(S, { yaw: S.units[S.current]?.face ?? 0, angle: 35, power: 0, weapon: 'rocket', target: null });
    return true;
  }

  // ---------- 3D-Welt ----------
  function init3D() {
    if (!window.THREE) throw Error('Three.js konnte nicht geladen werden.');
    scene = new THREE.Scene();
    UP = new THREE.Vector3(0, 1, 0); TMP = new THREE.Vector3();
    scene.background = new THREE.Color(0x8fd3f0);
    scene.fog = new THREE.Fog(0x8fd3f0, 55, 120);
    camera = new THREE.PerspectiveCamera(58, 1, .1, 220);
    raycaster = new THREE.Raycaster();
    const dpr = devicePixelRatio || 1;
    renderer = new THREE.WebGLRenderer({ antialias: dpr < 1.5, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(dpr, 1.5));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    $('viewport').appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xf0fcff, 0x5d6448, 1.05));
    sun = new THREE.DirectionalLight(0xffe9c4, 1.25);
    sun.position.set(-26, 40, -18); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -36, right: 36, top: 36, bottom: -36, near: 1, far: 110 });
    sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -.002;
    scene.add(sun);
    MAT.terrain = new THREE.MeshLambertMaterial({ vertexColors: true });
    MAT.water = new THREE.MeshLambertMaterial({ color: 0x2f86b8, transparent: true, opacity: .82 });
    water = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), MAT.water);
    water.rotation.x = -Math.PI / 2; scene.add(water);
    MAT.bed = new THREE.MeshBasicMaterial({ color: 0x1d4f6e });
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), MAT.bed); bed.rotation.x = -Math.PI / 2; bed.position.y = SEABED + .02; scene.add(bed);
    MAT.skin = new THREE.MeshLambertMaterial({ color: 0xf6a5b4 });
    MAT.team = [new THREE.MeshLambertMaterial({ color: 0xe8453c }), new THREE.MeshLambertMaterial({ color: 0x1f8fe0 })];
    MAT.teamRing = [0xff6f61, 0x4cc3ff].map(c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .85, depthWrite: false }));
    MAT.activeRing = new THREE.MeshBasicMaterial({ color: 0xfff27a, transparent: true, opacity: .95, depthWrite: false });
    MAT.prop = new Map();
    MAT.white = new THREE.MeshBasicMaterial({ color: 0xffffff });
    MAT.black = new THREE.MeshBasicMaterial({ color: 0x15202b });
    MAT.metal = new THREE.MeshLambertMaterial({ color: 0x55646f });
    MAT.stone = new THREE.MeshLambertMaterial({ color: 0x9aa0a6 });
    MAT.barrel = new THREE.MeshLambertMaterial({ color: 0xc8372d });
    MAT.barrelBand = new THREE.MeshLambertMaterial({ color: 0x2b2b2b });
    MAT.mine = new THREE.MeshLambertMaterial({ color: 0x3a3f44 });
    MAT.mineLight = new THREE.MeshBasicMaterial({ color: 0xff2a2a });
    MAT.crate = new THREE.MeshLambertMaterial({ color: 0xc9924f });
    MAT.health = new THREE.MeshLambertMaterial({ color: 0xf4f1ea });
    MAT.cross = new THREE.MeshBasicMaterial({ color: 0xe23a3a });
    MAT.chute = new THREE.MeshLambertMaterial({ color: 0xffd36b, side: THREE.DoubleSide });
    MAT.trunk = new THREE.MeshLambertMaterial({ color: 0x745340 });
    MAT.leaf = new THREE.MeshLambertMaterial({ color: 0x4b986d, flatShading: true });
    MAT.rock = new THREE.MeshLambertMaterial({ color: 0x8a8478, flatShading: true });
    MAT.debris = new THREE.MeshLambertMaterial({ color: 0x5e4430, flatShading: true });
    MAT.proj = new THREE.MeshLambertMaterial({ color: 0x48565e });
    MAT.projTip = new THREE.MeshLambertMaterial({ color: 0xff6a4d });
    MAT.yellow = new THREE.MeshLambertMaterial({ color: 0xffd23f });
    MAT.wool = new THREE.MeshLambertMaterial({ color: 0xfafafa, flatShading: true });
    MAT.dynamite = new THREE.MeshLambertMaterial({ color: 0xd8332b });
    MAT.arrow = new THREE.MeshBasicMaterial({ color: 0xfff27a });
    GEO.body = new THREE.SphereGeometry(.42, 12, 9);
    GEO.head = new THREE.SphereGeometry(.44, 14, 10);
    GEO.eye = new THREE.SphereGeometry(.14, 8, 6);
    GEO.pupil = new THREE.SphereGeometry(.065, 6, 5);
    GEO.band = new THREE.TorusGeometry(.42, .07, 6, 18);
    GEO.gun = new THREE.CylinderGeometry(.12, .15, .9, 8); GEO.gun.rotateX(-Math.PI / 2); GEO.gun.translate(0, 0, -.25);
    GEO.grave = new THREE.BoxGeometry(.7, 1.1, .25); GEO.grave.translate(0, .55, 0);
    GEO.cross = new THREE.BoxGeometry(.18, .5, .27); GEO.cross.translate(0, 1.3, 0);
    GEO.barrel = new THREE.CylinderGeometry(.42, .42, 1.1, 12); GEO.barrel.translate(0, .55, 0);
    GEO.band2 = new THREE.CylinderGeometry(.44, .44, .1, 12);
    GEO.mine = new THREE.CylinderGeometry(.34, .4, .2, 10); GEO.mine.translate(0, .1, 0);
    GEO.light = new THREE.SphereGeometry(.09, 6, 5);
    GEO.crate = new THREE.BoxGeometry(1, 1, 1); GEO.crate.translate(0, .5, 0);
    GEO.chute = new THREE.SphereGeometry(1.1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    GEO.trunk = new THREE.CylinderGeometry(.13, .2, 1.3, 6); GEO.trunk.translate(0, .65, 0);
    GEO.crown = new THREE.IcosahedronGeometry(.95, 0);
    GEO.pine = new THREE.ConeGeometry(.85, 2, 7);
    GEO.rock = new THREE.DodecahedronGeometry(.7, 0);
    GEO.debris = new THREE.TetrahedronGeometry(.18, 0);
    GEO.smoke = new THREE.IcosahedronGeometry(.4, 0);
    GEO.ball = new THREE.SphereGeometry(.24, 10, 8);
    GEO.rocket = new THREE.CylinderGeometry(.13, .16, .7, 8);
    GEO.tip = new THREE.ConeGeometry(.13, .26, 8); GEO.tip.translate(0, .48, 0);
    GEO.banana = new THREE.TorusGeometry(.22, .08, 6, 10, Math.PI);
    GEO.dynamite = new THREE.CylinderGeometry(.14, .14, .7, 8); GEO.dynamite.translate(0, .35, 0);
    GEO.fire = new THREE.SphereGeometry(1, 14, 10);
    GEO.ring = new THREE.RingGeometry(.75, 1, 28); GEO.ring.rotateX(-Math.PI / 2);
    arrow = new THREE.Mesh(new THREE.ConeGeometry(.32, .7, 4), MAT.arrow); arrow.rotation.x = Math.PI; scene.add(arrow);
    crosshair = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTexture('#ff3b30'), depthTest: false, transparent: true }));
    crosshair.scale.set(.75, .75, 1); crosshair.renderOrder = 30; scene.add(crosshair);
    targetMarker = new THREE.Mesh(GEO.ring, new THREE.MeshBasicMaterial({ color: 0xfff27a, transparent: true, opacity: .9, depthWrite: false }));
    targetMarker.scale.setScalar(1.4); targetMarker.visible = false; scene.add(targetMarker);
    aimPositions = new Float32Array(240 * 3);
    const ag = new THREE.BufferGeometry(); ag.setAttribute('position', new THREE.BufferAttribute(aimPositions, 3)); ag.setDrawRange(0, 0);
    aimLine = new THREE.Line(ag, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: .45, gapSize: .3, transparent: true, opacity: .85 }));
    aimLine.frustumCulled = false; scene.add(aimLine);
    addInput();
    resize(); addEventListener('resize', resize);
    requestAnimationFrame(frame);
  }
  function ringTexture(color) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); g.strokeStyle = color; g.lineWidth = 6;
    g.beginPath(); g.arc(32, 32, 22, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(32, 2); g.lineTo(32, 18); g.moveTo(32, 46); g.lineTo(32, 62); g.moveTo(2, 32); g.lineTo(18, 32); g.moveTo(46, 32); g.lineTo(62, 32); g.stroke();
    return new THREE.CanvasTexture(c);
  }
  function applyWorld() {
    const w = worlds[S.world];
    scene.background.setHex(w.sky); scene.fog.color.setHex(w.sky);
    MAT.water.color.setHex(w.water); MAT.water.opacity = w.lava ? .96 : .8;
    MAT.water.emissive.setHex(w.lava ? 0x6a1500 : 0x000000);
    MAT.bed.color.setHex(w.lava ? 0x7a1f08 : new THREE.Color(w.water).multiplyScalar(.55).getHex());
    MAT.trunk.color.setHex(w.trunk); MAT.leaf.color.setHex(w.leaf); MAT.rock.color.setHex(w.rock); MAT.debris.color.setHex(w.dirt);
    water.position.y = S.water;
  }
  function addDecor() {
    for (const d of deco) scene.remove(d);
    deco = [];
    const R = mulberry(S.seed ^ 0x5bd1e995), world = S.world, taken = S.units.concat(S.items);
    for (let i = 0, n = 0; i < 260 && n < 34; i++) {
      const x = (R() - .5) * 56, z = (R() - .5) * 56, y = height(x, z), s = .8 + R() * .6;
      if (y < S.water + .8 || taken.some(p => Math.hypot(p.x - x, p.z - z) < 2.2)) continue;
      const slope = Math.abs(height(x + .5, z) - height(x - .5, z)) + Math.abs(height(x, z + .5) - height(x, z - .5));
      const g = new THREE.Group();
      const pm = ASSET.ready && propDecor(world, n, slope, R, s);
      if (pm) g.add(pm);
      else if (n % 3 === 2 || slope > 1.2) { const m = new THREE.Mesh(GEO.rock, MAT.rock); m.scale.set(s, s * .7, s); m.rotation.y = R() * 6; g.add(m); }
      else if (world === 'desert') {
        const m = new THREE.Mesh(GEO.trunk, MAT.leaf); m.scale.set(1.4, 1.3 * s, 1.4); g.add(m);
        const arm = new THREE.Mesh(GEO.trunk, MAT.leaf); arm.scale.set(.9, .5, .9); arm.position.set(.3, .7, 0); arm.rotation.z = -.8; g.add(arm);
      } else if (world === 'snow') { const m = new THREE.Mesh(GEO.pine, MAT.leaf); m.position.y = 1.4 * s; m.scale.setScalar(s); g.add(m); const t = new THREE.Mesh(GEO.trunk, MAT.trunk); t.scale.y = .5; g.add(t); }
      else if (world === 'volcano') { const c = new THREE.Mesh(GEO.pine, MAT.trunk); c.scale.set(.6 * s, 1.1 * s, .6 * s); c.position.y = .9 * s; c.rotation.z = (R() - .5) * .3; g.add(c); const k = new THREE.Mesh(GEO.pine, MAT.leaf); k.scale.set(.25, .4, .25); k.position.set(.45, .3, 0); g.add(k); }
      else { const t = new THREE.Mesh(GEO.trunk, MAT.trunk); t.scale.y = s; g.add(t); const c = new THREE.Mesh(GEO.crown, MAT.leaf); c.position.y = 1.6 * s; c.scale.setScalar(s); g.add(c); }
      g.position.set(x, y - .05, z); g.userData.r = .9 * s; scene.add(g); deco.push(g); n++;
    }
  }
  // Requisiten aus props.glb (Kenney, CC0), je Karte eingefärbt
  const DECOR = {
    island: [['round', .9], ['tree', .85], ['crooked', .95], ['rock', .7, 0xd9cdb6]],
    desert: [['crooked', 1, 0xd7a46a], ['rocks', 1, 0xf2b783], ['rock', .75, 0xf0b27c], null],
    snow: [['pine', .85, 0xd5ece4], ['pine', .7, 0xd5ece4], ['pinefall', 1, 0xe6f2f7], ['rock', .7, 0xdbe8f2]],
    volcano: [['pinefall', 1, 0x4a3a36], ['rocks', 1, 0x6b5850], ['rock', .75, 0x5a4a44], ['crooked', .9, 0x3a2e2b]]
  };
  function propMat(tint = 0xffffff) {
    if (!MAT.prop.has(tint)) MAT.prop.set(tint, new THREE.MeshLambertMaterial({ vertexColors: true, color: tint }));
    return MAT.prop.get(tint);
  }
  function propMesh(name, tint, size) {
    const src = ASSET.props[name]; if (!src) return null;
    const m = src.clone(true), mat = propMat(tint);
    m.position.set(0, 0, 0); m.rotation.set(0, 0, 0); m.scale.setScalar(size);
    m.traverse(o => { if (o.isMesh) { o.material = mat; o.castShadow = true; } });
    return m;
  }
  function propDecor(world, n, slope, R, s) {
    const list = DECOR[world];
    const pick = slope > 1.2 ? list.find(e => e && /rock/.test(e[0])) : list[n % list.length];
    if (pick && /rock/.test(pick[0]) && slope > 1.2 && R() < .5) return null;
    if (!pick) return null;
    const m = propMesh(pick[0], pick[2], pick[1] * s * (/rock/.test(pick[0]) ? 1.1 : 1.05));
    if (m) m.rotation.y = R() * 6.28;
    return m;
  }
  function nameTag(u) {
    const c = document.createElement('canvas'); c.width = 160; c.height = 72;
    const tex = new THREE.CanvasTexture(c);
    // Konstante Bildschirmgröße, damit Namen und Lebenspunkte auch aus der Ferne lesbar bleiben.
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false }));
    sprite.scale.set(.1, .045, 1); sprite.position.y = 2.25; sprite.renderOrder = 25;
    sprite.userData = { c, tex, hp: null };
    return sprite;
  }
  function drawTag(u, sprite) {
    const d = sprite.userData;
    if (d.hp === u.hp) return;
    d.hp = u.hp;
    const g = d.c.getContext('2d'), col = teamColors[u.team];
    g.clearRect(0, 0, 160, 72);
    g.font = '900 25px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 6; g.strokeStyle = '#0d1b26'; g.strokeText(u.name, 80, 18); g.fillStyle = col; g.fillText(u.name, 80, 18);
    g.fillStyle = '#0d1b26'; g.fillRect(48, 39, 64, 30); g.fillStyle = col; g.fillRect(51, 42, 58, 24);
    g.fillStyle = '#ffffff'; g.font = '900 21px system-ui,sans-serif'; g.fillText(String(Math.max(0, Math.ceil(u.hp))), 80, 55);
    d.tex.needsUpdate = true;
  }
  // ---------- 3D-Modelle ----------
  function loadAssets(onProgress) {
    if (!THREE.GLTFLoader) return Promise.resolve(false);
    const loader = new THREE.GLTFLoader(), names = FIG_TEAM[0].concat(FIG_TEAM[1]);
    let done = 0;
    const total = names.length + 1, step = () => onProgress && onProgress(++done / total);
    const load = url => new Promise((res, rej) => loader.load(url, g => { step(); res(g); }, undefined, rej));
    const jobs = names.map(n => load('models/' + n + '.glb').then(g => { ASSET.fig[n] = prepFigure(g); }));
    jobs.push(load('models/props.glb').then(g => {
      g.scene.updateMatrixWorld(true);
      g.scene.traverse(o => { if (o.geometry) o.geometry.userData.shared = true; const m = /^p:?(tree|pine|round|crooked|rocks?|barrel|chest|pinefall)$/.exec(o.name || ''); if (m) ASSET.props[m[1]] = o; });   // GLTFLoader entfernt den Doppelpunkt aus „p:<name>“
    }));
    const timeout = new Promise(res => setTimeout(() => res('timeout'), 15000));
    return Promise.race([Promise.all(jobs).then(() => true), timeout]).then(ok => { ASSET.ready = ok === true && Object.keys(ASSET.fig).length === names.length; return ASSET.ready; }).catch(() => false);
  }
  const matCache = new Map();
  function lambertOf(m, skinned) {
    const key = m.uuid + (skinned ? 's' : '');
    if (!matCache.has(key)) matCache.set(key, new THREE.MeshLambertMaterial({ color: m.color ? m.color.clone().convertLinearToSRGB() : 0xffffff, skinning: skinned, vertexColors: !!m.vertexColors, side: m.side }));
    return matCache.get(key);
  }
  function prepFigure(g) {
    const root = g.scene;
    root.traverse(o => { if (o.isMesh) { o.material = lambertOf(o.material, !!o.isSkinnedMesh); o.castShadow = true; o.frustumCulled = false; } });
    const box = new THREE.Box3().setFromObject(root), h = box.max.y - box.min.y || 1;
    return { root, clips: Object.fromEntries(g.animations.map(c => [c.name, c])), scale: 1.55 / h, base: -box.min.y };
  }
  // Wie SkeletonUtils.clone: Kopie mit eigenem Skelett, damit jede Figur eigene Bewegungen hat.
  function cloneSkinned(src) {
    const clone = src.clone(true), map = new Map(), pairs = [];
    (function walk(a, b) { map.set(a, b); pairs.push([a, b]); for (let i = 0; i < a.children.length; i++) walk(a.children[i], b.children[i]); })(src, clone);
    for (const [a, b] of pairs) if (b.isSkinnedMesh) { b.skeleton = new THREE.Skeleton(a.skeleton.bones.map(x => map.get(x)), a.skeleton.boneInverses); b.bind(b.skeleton, a.bindMatrix); }
    return clone;
  }
  function figureFor(u) {
    if (!ASSET.ready) return null;
    const list = FIG_TEAM[u.team], idx = S.units.filter(v => v.team === u.team).indexOf(u);
    const f = ASSET.fig[list[(idx < 0 ? 0 : idx) % list.length]];
    if (!f) return null;
    const model = cloneSkinned(f.root);
    model.scale.setScalar(f.scale); model.position.y = f.base * f.scale; model.rotation.y = Math.PI;
    const mixer = new THREE.AnimationMixer(model), actions = {};
    for (const [n, c] of Object.entries(f.clips)) {
      const a = mixer.clipAction(c);
      if (['death', 'jump', 'hit', 'throw', 'yes', 'no'].includes(n)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
      actions[n] = a;
    }
    return { model, mixer, actions, cur: null };
  }
  function playAnim(an, name, fade = .18, speed = 1) {
    const next = an.actions[name] || an.actions.idle; if (!next) return;
    next.timeScale = speed;
    if (an.cur === name) return;
    const prev = an.actions[an.cur];
    next.reset(); next.enabled = true; next.setEffectiveWeight(1); next.play();
    if (prev) prev.crossFadeTo(next, fade, false);
    an.cur = name;
  }
  function makeUnit(u) {
    const g = new THREE.Group(), body = new THREE.Group(), fig = figureFor(u);
    if (fig) body.add(fig.model);
    else {
      for (const [y, z, s] of [[.38, .2, 1], [.72, .05, .98], [1.02, -.04, .95]]) {
        const m = new THREE.Mesh(GEO.body, MAT.skin); m.position.set(0, y, z); m.scale.set(s, .78, s); m.castShadow = true; body.add(m);
      }
      const head = new THREE.Mesh(GEO.head, MAT.skin); head.position.set(0, 1.42, -.1); head.castShadow = true; body.add(head);
      const band = new THREE.Mesh(GEO.band, MAT.team[u.team]); band.position.set(0, 1.62, -.1); band.rotation.x = Math.PI / 2; body.add(band);
      for (const dx of [-.17, .17]) {
        const eye = new THREE.Mesh(GEO.eye, MAT.white); eye.position.set(dx, 1.5, -.46); eye.scale.z = .7; body.add(eye);
        const pupil = new THREE.Mesh(GEO.pupil, MAT.black); pupil.position.set(dx, 1.5, -.56); body.add(pupil);
      }
    }
    const ring = new THREE.Mesh(GEO.ring, MAT.teamRing[u.team]); ring.position.y = .06; ring.scale.setScalar(.78); ring.renderOrder = 2;
    const gun = new THREE.Group(); gun.position.set(.46, fig ? .78 : 1.0, -.22);
    const tube = new THREE.Mesh(GEO.gun, MAT.metal); tube.castShadow = true; gun.add(tube); body.add(gun);
    const grave = new THREE.Group();
    grave.add(new THREE.Mesh(GEO.grave, MAT.stone), new THREE.Mesh(GEO.cross, MAT.stone)); grave.visible = false;
    const tag = nameTag(u);
    g.add(body, ring, grave, tag);
    g.userData = { body, gun, grave, tag, ring, anim: fig, lx: u.x, lz: u.z, deadAt: 0 };
    scene.add(g); return g;
  }
  function syncBodies() {
    for (const b of bodies) { scene.remove(b); if (b.userData.anim) b.userData.anim.mixer.stopAllAction(); }
    bodies = S.units.map(makeUnit);
  }
  function cue(u, name, ms = 900) { u.cue = name; u.cueUntil = performance.now() + ms; }
  function updateBodies(time, dt) {
    S.units.forEach((u, i) => {
      const b = bodies[i]; if (!b) return;
      const d = b.userData, an = d.anim;
      b.visible = !u.drowned;
      if (u.dead && !d.deadAt) d.deadAt = time;
      if (!u.dead) d.deadAt = 0;
      const showBody = !u.dead || (an && time - d.deadAt < 750);
      d.body.visible = showBody; d.grave.visible = u.dead && !u.drowned && !showBody; d.tag.visible = !u.dead;
      b.position.set(u.x, u.y, u.z);
      d.body.rotation.y = -u.face * Math.PI / 180;
      const isActive = i === S.current && active;
      d.ring.visible = !u.dead;
      d.ring.material = isActive ? MAT.activeRing : MAT.teamRing[u.team];
      if (isActive) d.ring.scale.setScalar(.78 + Math.sin(time * .008) * .08); else d.ring.scale.setScalar(.7);
      d.gun.visible = isActive && !u.dead && (S.phase === 'aim') && !u.air;
      if (d.gun.visible) d.gun.rotation.x = S.angle * Math.PI / 180;
      if (!an) { d.body.scale.y = isActive && !u.air ? 1 + Math.sin(time * .006) * .03 : 1; }
      else {
        const moved = Math.hypot(u.x - d.lx, u.z - d.lz) / Math.max(dt, 1e-3); d.lx = u.x; d.lz = u.z;
        d.speed = (d.speed || 0) * .8 + moved * .2;
        let want = 'idle', speed = 1;
        if (u.dead || (!alive(u) && !u.drowned)) want = 'death';
        else if (u.cue && performance.now() < u.cueUntil) want = u.cue;
        else if (celebrate && celebrate.team === u.team) want = 'dance';
        else if (u.air) want = 'jump';
        else if (d.speed > .4) { want = 'walk'; speed = clamp(d.speed / 2.2, .6, 1.6); }
        playAnim(an, want, want === 'hit' ? .08 : .18, speed);
        if (dt > 0 && (b.visible && d.body.visible)) an.mixer.update(dt);
      }
      if (!u.dead) drawTag(u, d.tag);
    });
  }
  function itemMesh(it) {
    const g = new THREE.Group();
    const kenney = ASSET.ready && (it.t === 'barrel' ? propMesh('barrel', 0xff8a74, 2.25) : it.t === 'crate' && it.kind !== 'health' ? propMesh('chest', 0xffffff, 2) : null);
    if (kenney) {
      g.add(kenney);
      if (it.t === 'crate') { const chute = new THREE.Mesh(GEO.chute, MAT.chute); chute.position.y = 2.6; g.add(chute); g.userData.chute = chute; }
    } else if (it.t === 'barrel') {
      const m = new THREE.Mesh(GEO.barrel, MAT.barrel); m.castShadow = true; g.add(m);
      for (const y of [.25, .85]) { const b = new THREE.Mesh(GEO.band2, MAT.barrelBand); b.position.y = y; g.add(b); }
    } else if (it.t === 'mine') {
      g.add(new THREE.Mesh(GEO.mine, MAT.mine));
      const l = new THREE.Mesh(GEO.light, MAT.mineLight); l.position.y = .24; g.add(l); g.userData.light = l;
    } else if (it.t === 'crate') {
      const m = new THREE.Mesh(GEO.crate, it.kind === 'health' ? MAT.health : MAT.crate); m.castShadow = true; g.add(m);
      if (it.kind === 'health') for (const [w, h] of [[.7, .2], [.2, .7]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.02), MAT.cross); c.position.y = .5; g.add(c); }
      else { const c = new THREE.Mesh(new THREE.BoxGeometry(1.02, .18, 1.02), MAT.yellow); c.position.y = .5; g.add(c); }
      const chute = new THREE.Mesh(GEO.chute, MAT.chute); chute.position.y = 2.6; g.add(chute); g.userData.chute = chute;
    } else if (it.t === 'dynamite') {
      g.add(new THREE.Mesh(GEO.dynamite, MAT.dynamite));
      const l = new THREE.Mesh(GEO.light, MAT.yellow); l.position.y = .78; g.add(l); g.userData.light = l;
    }
    scene.add(g); itemMeshes.set(it, g); return g;
  }
  function syncItems() {
    for (const m of itemMeshes.values()) scene.remove(m);
    itemMeshes.clear();
    for (const it of S.items) itemMesh(it);
  }
  function removeItem(it) {
    const i = S.items.indexOf(it); if (i >= 0) S.items.splice(i, 1);
    const m = itemMeshes.get(it); if (m) { scene.remove(m); m.traverse(o => { if (o.geometry && !o.geometry.userData.shared && !Object.values(GEO).includes(o.geometry)) o.geometry.dispose(); }); }
    itemMeshes.delete(it);
  }

  // ---------- Effekte ----------
  function addParticle(p) { if (particles.length > 160) { const old = particles.shift(); scene.remove(old.mesh); old.own && old.mesh.material.dispose(); } particles.push(p); scene.add(p.mesh); }
  function burst(x, y, z, r, color) {
    const fire = new THREE.Mesh(GEO.fire, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, depthWrite: false }));
    fire.position.set(x, y, z); fire.scale.setScalar(.3);
    addParticle({ mesh: fire, own: true, life: .45, max: .45, grow: r * 1.05, fire: true });
    const n = Math.min(14, 5 + r * 2);
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(GEO.debris, MAT.debris); m.position.set(x, y + .2, z);
      addParticle({ mesh: m, vx: rand(-6, 6), vy: rand(3, 10), vz: rand(-6, 6), life: rand(.6, 1.1), max: 1, debris: true });
    }
    for (let i = 0; i < Math.min(7, 2 + r); i++) {
      const m = new THREE.Mesh(GEO.smoke, new THREE.MeshLambertMaterial({ color: S.world === 'snow' ? 0xe7f0f4 : 0x6c6866, transparent: true, opacity: .6, depthWrite: false }));
      m.position.set(x + rand(-.5, .5) * r * .4, y + rand(0, .6), z + rand(-.5, .5) * r * .4); m.scale.setScalar(r * .25);
      addParticle({ mesh: m, own: true, vx: rand(-1, 1), vy: rand(1.2, 2.6), vz: rand(-1, 1), life: rand(1, 1.6), max: 1.6, smoke: true, base: r * .25 });
    }
  }
  function splash(x, z, big = 1) {
    const color = worlds[S.world].lava ? 0xffa040 : 0xe9f8ff;
    for (let i = 0; i < 10 * big; i++) {
      const m = new THREE.Mesh(GEO.debris, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9 }));
      m.position.set(x, S.water + .1, z);
      addParticle({ mesh: m, own: true, vx: rand(-2, 2), vy: rand(4, 8), vz: rand(-2, 2), life: rand(.5, .9), max: .9, debris: true });
    }
    noiseSound(.35, .05, 1400);
  }
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt;
      if (p.fire) { const k = 1 - p.life / p.max; p.mesh.scale.setScalar(.3 + p.grow * Math.sqrt(k)); p.mesh.material.opacity = Math.max(0, p.life / p.max) * .9; }
      else {
        if (p.debris) p.vy -= 16 * dt;
        p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt;
        if (p.debris) p.mesh.rotation.x += dt * 8;
        if (p.smoke) { p.mesh.scale.setScalar(p.base * (1 + (p.max - p.life))); p.mesh.material.opacity = Math.max(0, p.life / p.max) * .6; }
      }
      if (p.life <= 0) { scene.remove(p.mesh); if (p.own) p.mesh.material.dispose(); particles.splice(i, 1); }
    }
  }

  // ---------- Explosionen & Schaden ----------
  function hurt(u, amount) {
    if (!alive(u) || amount <= 0) return 0;
    amount = Math.min(Math.ceil(u.hp), Math.round(amount));
    u.hp = Math.max(0, u.hp - amount);
    damageNumber(u, amount); hudDirty = true; cue(u, 'hit', 650);
    if (u === S.units[S.current]) hurtActive = true;
    return amount;
  }
  function explode(x, y, z, r, dmg, opts = {}) {
    const attacker = S.units[S.current];
    crater(x, y, z, r * (opts.crater ?? .85));
    const w = worlds[S.world];
    burst(x, y, z, r, w.lava ? 0xff6a2b : S.world === 'snow' ? 0xbfefff : 0xffa35c);
    boomSound(r);
    shake = Math.min(.9, .15 + r * .08);
    if (performance.now() - lastFlash > 250 && r > 2) { const f = $('impactFlash'); f.classList.remove('active'); void f.offsetWidth; f.classList.add('active'); lastFlash = performance.now(); }
    if (navigator.vibrate && r > 2 && inputMode === 'touch') try { navigator.vibrate(Math.min(120, 20 + r * 12)); } catch (_) {}
    rumble(Math.min(1, .25 + r * .12), Math.min(1, .4 + r * .1), Math.min(420, 120 + r * 50));
    lastBlast = { x, y, z, at: gameTime };
    let biggest = null, biggestAmount = 0, enemyHit = false;
    for (const u of S.units) {
      if (u.dead) continue;
      const cx = u.x - x, cy = u.y + .8 - y, cz = u.z - z, d = Math.hypot(cx, cy, cz);
      if (d >= r + .6) continue;
      const f = 1 - d / (r + .6);
      const amount = hurt(u, Math.max(1, dmg * f));
      if (amount > biggestAmount) { biggest = u; biggestAmount = amount; }
      if (amount && attacker && u.team !== attacker.team) enemyHit = true;
      actionDamage += amount;
      const len = Math.max(.3, Math.hypot(cx, cz)), push = (1.6 + dmg * .085) * f * (opts.push ?? 1);
      u.vx += cx / len * push; u.vz += cz / len * push; u.vy = Math.max(u.vy, 2 + push * .65);
      u.air = true; u.y += .05;
    }
    if (biggest && biggestAmount >= 5 && alive(biggest)) say(biggest, 'hurt');
    if (enemyHit && attacker && Math.random() < .5) setTimeout(() => say(attacker, 'hit'), 600);
    for (const it of S.items.slice()) {
      const d = Math.hypot(it.x - x, it.y + .4 - y, it.z - z);
      if (d >= r + .7) continue;
      if (it.t === 'barrel' || it.t === 'mine' || it.t === 'dynamite') { if (it.fuse == null || it.fuse > .15) it.fuse = it.t === 'barrel' ? .2 : .12; it.arm = 0; }
      else if (it.t === 'crate') { burst(it.x, it.y + .5, it.z, 1, 0xffd36b); removeItem(it); }
    }
    for (let i = deco.length - 1; i >= 0; i--) {
      const d = deco[i];
      if (Math.hypot(d.position.x - x, d.position.z - z) < r * .8 + d.userData.r) { scene.remove(d); deco.splice(i, 1); }
      else if (Math.hypot(d.position.x - x, d.position.z - z) < r + 3) d.position.y = height(d.position.x, d.position.z) - .05;
    }
    hudDirty = true;
  }

  // ---------- Geschosse ----------
  function projMesh(kind) {
    const g = new THREE.Group();
    if (kind === 'rocket' || kind === 'homing' || kind === 'drill' || kind === 'airbomb') {
      g.add(new THREE.Mesh(GEO.rocket, MAT.proj), new THREE.Mesh(GEO.tip, kind === 'homing' ? MAT.yellow : MAT.projTip));
    } else if (kind === 'banana' || kind === 'bananalet') {
      const m = new THREE.Mesh(GEO.banana, MAT.yellow); if (kind === 'bananalet') m.scale.setScalar(.7); g.add(m);
    } else {
      const m = new THREE.Mesh(GEO.ball, kind === 'holy' ? MAT.yellow : kind === 'cluster' ? MAT.projTip : MAT.proj);
      if (kind === 'bomblet') m.scale.setScalar(.6);
      if (kind === 'holy') m.scale.setScalar(1.3);
      g.add(m);
    }
    scene.add(g); return g;
  }
  function spawnProjectile(kind, x, y, z, vx, vy, vz, extra = {}) {
    const p = { kind, x, y, z, vx, vy, vz, age: 0, rest: false, owner: S.current, trail: 0, ...extra };
    p.mesh = projMesh(kind); p.mesh.position.set(x, y, z);
    projectiles.push(p); return p;
  }
  // Gemeinsamer Physikschritt für echte Geschosse und die Vorausberechnung der KI.
  function stepProjectile(p, dt) {
    const spec = PROJ[p.kind];
    p.age += dt;
    if (spec.fuse && p.age >= spec.fuse) return 'fuse';
    if (p.age > 12) return 'impact';
    if (p.rest) { if (p.y > height(p.x, p.z) + .05) p.rest = false; else return null; }
    if (spec.homing && p.age > .55 && p.tx != null) {
      const sp = Math.hypot(p.vx, p.vy, p.vz), dx = p.tx - p.x, dy = p.ty + .6 - p.y, dz = p.tz - p.z, l = Math.hypot(dx, dy, dz) || 1, k = Math.min(1, dt * 3.2);
      const s = Math.max(sp, 16);
      p.vx += (dx / l * s - p.vx) * k; p.vy += (dy / l * s - p.vy) * k; p.vz += (dz / l * s - p.vz) * k;
    } else {
      if (spec.wind) p.vx += S.wind * WIND * dt;
      p.vy -= G_PROJ * dt;
    }
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.y < S.water) return 'water';
    if (Math.abs(p.x) > HALF + 14 || Math.abs(p.z) > HALF + 14) return 'out';
    const g = height(p.x, p.z);
    if (p.y <= g) {
      if (spec.bounce) {
        const n = terrainNormal(p.x, p.z), vn = p.vx * n.x + p.vy * n.y + p.vz * n.z;
        p.y = g + .03;
        if (vn < 0) { const k = (1 + spec.bounce) * vn; p.vx -= k * n.x; p.vy -= k * n.y; p.vz -= k * n.z; p.vx *= .75; p.vz *= .75; }
        if (Math.hypot(p.vx, p.vy, p.vz) < 1.1) { p.vx = p.vy = p.vz = 0; p.rest = true; }
        return null;
      }
      return 'impact';
    }
    if (spec.impact) {
      for (let i = 0; i < S.units.length; i++) {
        const u = S.units[i];
        if (u.dead || (i === p.owner && p.age < .35)) continue;
        if (Math.hypot(u.x - p.x, u.y + .8 - p.y, u.z - p.z) < .85) return 'impact';
      }
      for (const it of S.items) if (it.t === 'barrel' && Math.hypot(it.x - p.x, it.y + .55 - p.y, it.z - p.z) < .75) return 'impact';
    }
    return null;
  }
  function removeProjectile(p) {
    const i = projectiles.indexOf(p); if (i >= 0) projectiles.splice(i, 1);
    scene.remove(p.mesh);
  }
  function detonate(p) {
    const spec = PROJ[p.kind];
    removeProjectile(p);
    if (spec.holy) {
      // Kurze Kunstpause wie im Original, dann großer Knall.
      const ghost = projMesh('holy'); ghost.position.set(p.x, p.y, p.z);
      for (const [f, d] of [[523, 0], [659, .12], [784, .24], [1046, .36]]) setTimeout(() => sound(f, .5, 'triangle', .03), d * 1000);
      announce('Halleluja!', 1200);
      later(.9, () => { scene.remove(ghost); explode(p.x, Math.max(p.y, height(p.x, p.z)), p.z, spec.r, spec.dmg, { push: 1.2 }); });
      return;
    }
    if (spec.drill) {
      const sp = Math.hypot(p.vx, p.vy, p.vz) || 1, dx = p.vx / sp, dy = Math.min(-.35, p.vy / sp), dz = p.vz / sp;
      for (let i = 1; i <= 5; i++) later(i * .14, () => { crater(p.x + dx * i * .9, p.y + dy * i * .9, p.z + dz * i * .9, 1.5); noiseSound(.12, .04, 300); });
      later(.85, () => explode(p.x + dx * 5, p.y + dy * 5, p.z + dz * 5, spec.r, spec.dmg));
      return;
    }
    explode(p.x, Math.max(p.y, height(p.x, p.z) + .1), p.z, spec.r, spec.dmg);
    if (spec.split) for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2 + rand(-.3, .3), s = spec.split === 'bananalet' ? rand(4, 7) : rand(2.5, 5);
      spawnProjectile(spec.split, p.x, Math.max(p.y, height(p.x, p.z)) + .4, p.z, Math.cos(a) * s, rand(7, 11), Math.sin(a) * s, { owner: -1 });
    }
  }
  function updateProjectiles(dt) {
    for (const p of projectiles.slice()) {
      const r = stepProjectile(p, dt);
      if (r === 'fuse' || r === 'impact') detonate(p);
      else if (r === 'water') { splash(p.x, p.z); removeProjectile(p); }
      else if (r === 'out') removeProjectile(p);
    }
  }
  function drawProjectiles(dt) {
    for (const p of projectiles) {
      p.mesh.position.set(p.x, p.y, p.z);
      const sp = Math.hypot(p.vx, p.vy, p.vz);
      if (sp > .5) p.mesh.quaternion.setFromUnitVectors(UP, TMP.set(p.vx / sp, p.vy / sp, p.vz / sp));
      if (CHARGE.has(p.kind) || p.kind === 'airbomb') {
        p.trail += dt;
        if (p.trail > .07 && sp > 2) {
          p.trail = 0;
          const m = new THREE.Mesh(GEO.smoke, new THREE.MeshLambertMaterial({ color: 0xece4d4, transparent: true, opacity: .55, depthWrite: false }));
          m.position.set(p.x, p.y, p.z); m.scale.setScalar(.25);
          addParticle({ mesh: m, own: true, vx: 0, vy: .4, vz: 0, life: .6, max: .6, smoke: true, base: .25 });
        }
      }
    }
  }
  function later(sec, fn) { const id = matchId; events.push({ at: gameTime + sec, fn: () => { if (id === matchId) fn(); } }); }
  function runEvents() {
    if (!events.length) return;
    const due = events.filter(e => e.at <= gameTime);
    if (!due.length) return;
    events = events.filter(e => e.at > gameTime);
    for (const e of due) e.fn();
  }

  // ---------- Würmer, Schaf, Gegenstände ----------
  function bodyPhysics(b, dt, isUnit) {
    // Freier Fall mit Wandkollision; Rückgabe: Aufprallgeschwindigkeit bei Landung.
    b.vy -= G_UNIT * dt;
    const nx = b.x + b.vx * dt, nz = b.z + b.vz * dt, ny = b.y + b.vy * dt;
    const gNew = height(nx, nz);
    if (gNew > ny + .7 && gNew > b.y + .3) { b.vx *= -.25; b.vz *= -.25; b.y = ny; }
    else { b.x = clamp(nx, -HALF - 6, HALF + 6); b.z = clamp(nz, -HALF - 6, HALF + 6); b.y = ny; }
    const g = height(b.x, b.z);
    if (b.y <= g) {
      const impact = -b.vy;
      b.y = g;
      const n = terrainNormal(b.x, b.z), hs = Math.hypot(b.vx, b.vz);
      // Steilhang: abrutschen, aber nach einigen Versuchen sicher liegen bleiben.
      if (n.y < .62 && isUnit && (b.slides = (b.slides || 0) + 1) < 10) { b.vx = n.x * 2 + b.vx * .4; b.vz = n.z * 2 + b.vz * .4; b.vy = .5; b.y = g + .04; return 0; }
      if (impact > 9 && hs > 2 && (b.slides = (b.slides || 0) + 1) < 10) { b.vy = impact * .25; b.vx *= .45; b.vz *= .45; b.y = g + .02; return impact; }
      b.vx = b.vz = b.vy = 0; b.air = false; b.slides = 0; return impact;
    }
    return 0;
  }
  function updateUnits(dt) {
    for (const u of S.units) {
      if (u.drowned) continue;
      if (!u.air && u.y > height(u.x, u.z) + .08) { u.air = true; u.vy = 0; }
      if (u.air) {
        const impact = bodyPhysics(u, dt, true);
        if (impact > 10 && !u.dead) {
          const dmg = hurt(u, (impact - 10) * 4.5);
          if (dmg) sound(160, .12, 'square', .03);
        }
      } else if (!u.dead) u.y = height(u.x, u.z);
      if (u.y < S.water - .45) drown(u);
    }
  }
  function drown(u) {
    if (u.drowned) return;
    const wasAlive = alive(u);
    u.hp = 0; u.dead = true; u.drowned = true; u.air = false;
    splash(u.x, u.z, 2); hudDirty = true;
    if (wasAlive) { say(u, 'drown'); announce(u.name + ' ist ertrunken!'); }
    if (u === S.units[S.current]) hurtActive = true;
  }
  function walk(u, amount) {
    const yaw = S.yaw * Math.PI / 180, dx = Math.sin(yaw) * amount, dz = -Math.cos(yaw) * amount;
    const nx = u.x + dx, nz = u.z + dz;
    if (Math.abs(nx) > HALF - .5 || Math.abs(nz) > HALF - .5) return;
    const g = height(nx, nz), rise = g - u.y;
    if (rise > Math.abs(amount) * 1.5 + .02) return;
    if (S.items.some(it => it.t === 'barrel' && Math.hypot(it.x - nx, it.z - nz) < .85)) return;
    u.x = nx; u.z = nz;
    if (rise < -.45) { u.air = true; u.vx = dx / Math.max(1e-3, Math.abs(amount)) * 2.4; u.vz = dz / Math.max(1e-3, Math.abs(amount)) * 2.4; u.vy = 0; }
    else u.y = g;
  }
  function jump(back) {
    const u = S.units[S.current];
    if (!canMove() || !u || u.air) return;
    const yaw = S.yaw * Math.PI / 180, h = back ? -1.6 : 3.6;
    u.vx = Math.sin(yaw) * h; u.vz = -Math.cos(yaw) * h; u.vy = back ? 9.6 : 6.8; u.air = true; u.y += .05;
    sound(back ? 520 : 420, .12, 'triangle', .03);
  }
  function updateSheep(dt) {
    const s = sheep; if (!s) return;
    s.age += dt;
    const yaw = s.face * Math.PI / 180, fx = Math.sin(yaw), fz = -Math.cos(yaw);
    if (!s.air) {
      const ahead = height(s.x + fx * .5, s.z + fz * .5);
      if (ahead - s.y > .55 || (s.hop -= dt) < 0) { s.vy = ahead - s.y > .55 ? 7.5 : 4; s.vx = fx * 3.2; s.vz = fz * 3.2; s.air = true; s.hop = rand(.8, 1.6); s.y += .05; if (Math.random() < .5) sound(780, .14, 'triangle', .02); }
      else { s.x += fx * 3.2 * dt; s.z += fz * 3.2 * dt; const g = height(s.x, s.z); if (g < s.y - .4) { s.air = true; s.vx = fx * 3.2; s.vz = fz * 3.2; s.vy = 0; } else s.y = g; }
    } else {
      const ox = s.vx, oz = s.vz;
      bodyPhysics(s, dt, false);
      if (Math.sign(ox) !== Math.sign(s.vx) && Math.abs(ox) > .5) s.face += 180;
      if (Math.sign(oz) !== Math.sign(s.vz) && Math.abs(oz) > .5 && Math.abs(ox) <= .5) s.face += 180;
    }
    s.mesh.position.set(s.x, s.y, s.z); s.mesh.rotation.y = -s.face * Math.PI / 180;
    if (s.y < S.water - .2) { splash(s.x, s.z); scene.remove(s.mesh); sheep = null; announce('Das Schaf kann nicht schwimmen.'); return; }
    if (s.age > 7 || s.boom) { scene.remove(s.mesh); sheep = null; explode(s.x, s.y + .4, s.z, 4.5, 70); }
  }
  function spawnSheep(u) {
    const g = new THREE.Group(), wool = new THREE.Mesh(new THREE.IcosahedronGeometry(.48, 1), MAT.wool);
    wool.position.y = .55; wool.scale.set(1, .85, 1.25); wool.castShadow = true; g.add(wool);
    const head = new THREE.Mesh(GEO.ball, MAT.black); head.position.set(0, .7, -.6); head.scale.set(1, 1, 1.2); g.add(head);
    scene.add(g);
    const yaw = S.yaw * Math.PI / 180;
    sheep = { x: u.x + Math.sin(yaw) * .8, y: u.y, z: u.z - Math.cos(yaw) * .8, face: S.yaw, vx: 0, vy: 0, vz: 0, air: true, age: 0, hop: 1, mesh: g };
  }
  function updateItems(dt) {
    const blink = Math.sin(gameTime * 18) > 0;
    for (const it of S.items.slice()) {
      const g = height(it.x, it.z), m = itemMeshes.get(it);
      if (it.t === 'crate' && it.y > g + .02) it.y = Math.max(g, it.y - dt * 4);
      else if (it.y > g + .03) { it.vy = (it.vy || 0) - G_UNIT * dt; it.y = Math.max(g, it.y + it.vy * dt); if (it.y === g) it.vy = 0; }
      else { it.y = g; it.vy = 0; }
      if (m) {
        m.position.set(it.x, it.y, it.z);
        if (m.userData.chute) m.userData.chute.visible = it.y > g + .05;
        if (m.userData.light) m.userData.light.visible = it.fuse != null ? blink : it.t === 'mine' ? Math.sin(gameTime * 2) > .6 : true;
      }
      if (it.y < S.water - .3) { removeItem(it); continue; }
      if (it.t === 'mine' && it.fuse == null) {
        if (it.arm > 0) it.arm -= dt;
        else if (S.units.some(u => !u.dead && Math.hypot(u.x - it.x, u.z - it.z) < 1.5 && Math.abs(u.y - it.y) < 1.4)) { it.fuse = 1.3; sound(1200, .08, 'square', .03); later(.25, () => sound(1200, .08, 'square', .03)); }
      }
      if (it.fuse != null) {
        it.fuse -= dt;
        if (it.fuse <= 0) {
          removeItem(it);
          if (it.t === 'barrel') explode(it.x, it.y + .5, it.z, 3.4, 40, { push: 1.1 });
          else if (it.t === 'mine') explode(it.x, it.y + .2, it.z, 2.7, 45);
          else if (it.t === 'dynamite') explode(it.x, it.y + .3, it.z, 5, 75);
        }
      }
      if (it.t === 'crate' && it.y <= g + .05) {
        const u = S.units[S.current];
        if (u && alive(u) && (S.phase === 'aim' || S.phase === 'retreat') && Math.hypot(u.x - it.x, u.z - it.z) < 1.4 && Math.abs(u.y - it.y) < 1.6) collect(u, it);
      }
    }
  }
  function collect(u, it) {
    removeItem(it);
    sound(880, .12, 'triangle', .04); later(.1, () => sound(1175, .16, 'triangle', .04));
    if (it.kind === 'health') { u.hp = Math.min(u.hp + 25, u.maxHp + 50); announce(u.name + ': +25 Lebenspunkte'); }
    else { const a = S.ammo[u.team]; if (a[it.kind] >= 0) a[it.kind]++; announce(u.name + ' findet: ' + LABEL[it.kind][1] + ' ' + LABEL[it.kind][2]); }
    say(u, 'crate'); cue(u, 'yes', 1000); hudDirty = true;
  }
  function dropCrate() {
    if (S.items.filter(i => i.t === 'crate').length >= 3 || Math.random() > .45) return;
    const p = findSpot(S.units.filter(u => !u.dead), 3); if (!p) return;
    const pool = ['cluster', 'banana', 'homing', 'airstrike', 'sheep', 'dynamite', 'teleport', 'mine', 'drill', 'bat', 'holy'];
    const it = { t: 'crate', x: p.x, y: p.y + 18, z: p.z, fuse: null, kind: Math.random() < .35 ? 'health' : pool[Math.floor(Math.random() * pool.length)] };
    S.items.push(it); itemMesh(it);
    announce(it.kind === 'health' ? 'Erste-Hilfe-Kiste im Anflug!' : 'Waffenkiste im Anflug!');
  }

  // ---------- Zugablauf ----------
  const activeUnit = () => S && S.units[S.current];
  let autoplay = false;
  function isBotTurn() { return !!(S && S.mode !== 'local' && (S.team === 1 || autoplay)); }
  function canMove() { return active && !paused && S && (S.phase === 'aim' || S.phase === 'retreat') && !isBotTurn() && alive(activeUnit()); }
  function canAct() { return active && !paused && S && S.phase === 'aim' && alive(activeUnit()); }
  function settled() {
    if (projectiles.length || sheep || events.length) return false;
    if (S.units.some(u => !u.drowned && u.air)) return false;
    return !S.items.some(it => it.fuse != null);
  }
  function endTurn(reason) {
    if (S.phase === 'wait' || S.phase === 'over') return;
    charging = false; setCharge(false);
    if (reason === 'timeout') { announce('Zeit abgelaufen!'); say(activeUnit(), 'timeout'); }
    if (actionFired && actionDamage === 0 && alive(activeUnit())) say(activeUnit(), 'miss');
    actionFired = false;
    S.phase = 'wait'; holdUntil = gameTime + .6; waitStart = gameTime; hudDirty = true;
  }
  function forceSettle() {
    // Notbremse, falls etwas nie zur Ruhe kommt: Würmer landen, Zünder laufen sofort ab.
    waitStart = gameTime;
    for (const u of S.units) if (u.air) { u.air = false; u.vx = u.vy = u.vz = 0; u.y = height(u.x, u.z); }
    for (const p of projectiles.slice()) removeProjectile(p);
    if (sheep) sheep.boom = true;
    for (const it of S.items) if (it.fuse != null) it.fuse = 0;
  }
  function startRetreat() { S.phase = 'retreat'; retreatLeft = RETREAT_SECONDS; hudDirty = true; }
  function phaseLogic(dt) {
    const u = activeUnit();
    if ((S.phase === 'aim' || S.phase === 'retreat') && (!alive(u) || (hurtActive && S.phase === 'aim'))) { hurtActive = false; endTurn(); return; }
    if (S.phase === 'aim') {
      if (!charging && !(bot && bot.stage === 'charge')) S.seconds -= dt;
      if (S.seconds <= 0) endTurn('timeout');
    } else if (S.phase === 'retreat') {
      if (!projectiles.length && !sheep) retreatLeft -= dt;
      if (retreatLeft <= 0) endTurn();
    } else if (S.phase === 'wait') {
      if (gameTime - waitStart > 12) forceSettle();
      if (gameTime < holdUntil || !settled()) return;
      const dying = S.units.find(v => !v.dead && v.hp <= 0);
      if (dying) {
        dying.dead = true; hudDirty = true;
        say(dying, 'death'); announce(dying.name + ' ist ausgeschieden!');
        lastBlast = { x: dying.x, y: dying.y, z: dying.z, at: gameTime };
        later(.7, () => explode(dying.x, dying.y + .5, dying.z, 2.2, 20, { push: .6 }));
        holdUntil = gameTime + 1.1;
        return;
      }
      const a0 = S.units.some(v => v.team === 0 && alive(v)), a1 = S.units.some(v => v.team === 1 && alive(v));
      if (!a0 || !a1) return endMatch(a0 ? 0 : a1 ? 1 : -1);
      nextTurn();
    }
  }
  function nextTurn() {
    const team = 1 - S.team;
    const list = S.units.map((u, i) => i).filter(i => S.units[i].team === team);
    const last = S.lastByTeam[team];
    let pick = list.find(i => i > last && alive(S.units[i]));
    if (pick === undefined) pick = list.find(i => alive(S.units[i]));
    if (pick === undefined) return endMatch(1 - team);
    S.team = team; S.current = pick; S.lastByTeam[team] = pick;
    if (team === 0) {
      S.round++;
      if (S.round >= S.suddenDeath) {
        if (S.round === S.suddenDeath) announce('Sudden Death! Das ' + (worlds[S.world].lava ? 'Lava' : 'Wasser') + ' steigt!', 3000);
        S.water = Math.min(6, S.water + .55); water.position.y = S.water; buildTerrain();
      }
    }
    S.wind = clamp(S.wind * .4 + rand(-S.windMax, S.windMax), -S.windMax, S.windMax);
    const u = activeUnit();
    Object.assign(S, { phase: 'aim', seconds: TURN_SECONDS, yaw: u.face, angle: 30, power: 0, weapon: 'rocket', target: null });
    shotsLeft = 0; actionDamage = 0; actionFired = false; hurtActive = false; charging = false; overview = false; $('viewBtn').classList.remove('selected');
    targetMarker.visible = false; cameraAz = u.face;
    if (S.round > 1 || team === 1) dropCrate();
    save(); hudDirty = true;
    turnBanner(S.mode === 'local' ? 'TEAM ' + (team ? 'BLAU' : 'ROT') + ' IST DRAN' : team ? 'COMPUTER IST DRAN' : 'DU BIST DRAN', u.name, team);
    if (!isBotTurn()) rumble(.1, .35, 120);
    say(u, 'turn');
    bot = isBotTurn() ? { stage: 'think', at: gameTime + 1.1 } : null;
  }
  function endMatch(winner) {
    S.phase = 'over'; S.winner = winner; active = false; bot = null; charging = false; setCharge(false);
    $('game').classList.add('over');
    celebrate = winner >= 0 ? { team: winner, unit: S.units.find(u => u.team === winner && alive(u)) } : null;
    const won = winner === 0, campaign = S.mode === 'campaign';
    if (campaign && won) { progress = Math.max(progress, S.level + 1); try { localStorage.setItem(PROGRESS, JSON.stringify({ unlocked: progress })); } catch (_) {} }
    try { localStorage.removeItem(KEY); } catch (_) {}
    $('continueGame').hidden = true;
    const champion = S.units.find(u => u.team === winner && alive(u));
    const victory = quips.victory[Math.floor(Math.random() * quips.victory.length)];
    const hp = t => S.units.filter(u => u.team === t).reduce((n, u) => n + Math.max(0, Math.ceil(u.hp)), 0);
    if (campaign) {
      $('resultTitle').textContent = won ? `Level ${S.level} geschafft!` : winner === -1 ? 'Unentschieden!' : 'Niederlage!';
      $('resultText').textContent = won ? `${champion?.name || 'Dein Trupp'}: „${victory}“ Level ${S.level + 1} wartet mit ${levelConfig(S.level + 1).enemy} gegnerischen Würmern.` : 'Der Computer hat diesmal die Oberhand. Versuch es nochmal!';
      $('nextLevelBtn').hidden = !won;
      $('againBtn').textContent = won ? 'Level wiederholen' : 'Nochmal versuchen';
      $('againBtn').classList.toggle('primary', !won);
    } else {
      $('resultTitle').textContent = winner === -1 ? 'Unentschieden!' : `Team ${winner ? 'Blau' : 'Rot'} gewinnt!`;
      $('resultText').textContent = `Nach ${S.round} Runden. Rot: ${hp(0)} LP · Blau: ${hp(1)} LP.` + (champion ? ` ${champion.name}: „${victory}“` : '');
      $('nextLevelBtn').hidden = true; $('againBtn').textContent = 'Noch ein Gefecht'; $('againBtn').classList.add('primary');
    }
    if (won || S.mode === 'local') { sound(523, .2, 'triangle', .04); setTimeout(() => sound(659, .2, 'triangle', .04), 180); setTimeout(() => sound(784, .35, 'triangle', .04), 360); }
    setTimeout(() => { $('result').hidden = false; }, 900);
  }

  // ---------- Waffen ----------
  const ammoOf = (team, kind) => S.ammo[team][kind];
  const speedOf = power => 8 + power * .27;
  function dirOf(yaw, angle) {
    const y = yaw * Math.PI / 180, a = angle * Math.PI / 180;
    return { x: Math.sin(y) * Math.cos(a), y: Math.sin(a), z: -Math.cos(y) * Math.cos(a) };
  }
  function muzzle(u, d) { return { x: u.x + d.x * .9, y: u.y + 1.1 + d.y * .9, z: u.z + d.z * .9 }; }
  function nearestEnemy(u) {
    return S.units.filter(v => alive(v) && v.team !== u.team).sort((a, b) => Math.hypot(a.x - u.x, a.z - u.z) - Math.hypot(b.x - u.x, b.z - u.z))[0];
  }
  function selectWeapon(kind) {
    if (!S || S.phase !== 'aim' || shotsLeft > 0 || ammoOf(S.team, kind) === 0) return;
    S.weapon = kind; hudDirty = true;
    if (NEEDS_TARGET.has(kind) && !isBotTurn()) {
      if (kind !== 'homing') { overview = true; $('viewBtn').classList.add('selected'); }
      if (inputMode === 'pad') { if (!S.target) defaultTarget(); announce(kind === 'homing' ? 'LT halten + Stick = Ziel · RT = Feuer' : 'Rechter Stick = Ziel bewegen · RT = Feuer', 2600); }
      else announce(kind === 'homing' ? 'Ziel antippen (sonst nächster Gegner)' : 'Ziel auf der Karte antippen', 2600);
    }
  }
  function useWeapon() {
    if (!canAct()) return;
    const u = activeUnit(), kind = S.weapon, team = S.team;
    if (ammoOf(team, kind) === 0) { announce('Keine Munition mehr'); return; }
    if (kind === 'homing' && !S.target) { const e = nearestEnemy(u); if (e) S.target = { x: e.x, y: e.y, z: e.z }; }
    if (NEEDS_TARGET.has(kind) && !S.target) { announce('Erst ein Ziel auf der Karte antippen'); overview = true; $('viewBtn').classList.add('selected'); return; }
    if (kind === 'teleport') {
      const t = S.target, g = height(t.x, t.z);
      if (g < S.water + .3 || Math.abs(t.x) > HALF - 1 || Math.abs(t.z) > HALF - 1) { announce('Dort kann man nicht landen'); return; }
    }
    if (ammoOf(team, kind) > 0) S.ammo[team][kind]--;
    const d = dirOf(S.yaw, S.angle), m = muzzle(u, d);
    actionFired = !['teleport', 'mine', 'dynamite'].includes(kind);
    if (kind !== 'shotgun' || shotsLeft === 0) say(u, kind === 'teleport' ? 'teleport' : 'fire');
    cue(u, 'throw', 650); rumble(.35, .2, 90);
    overview = false; $('viewBtn').classList.remove('selected'); targetMarker.visible = false;
    if (CHARGE.has(kind)) {
      const sp = speedOf(S.power);
      const p = spawnProjectile(kind, m.x, m.y, m.z, d.x * sp, d.y * sp, d.z * sp);
      if (kind === 'homing') Object.assign(p, { tx: S.target.x, ty: S.target.y, tz: S.target.z });
      sound(kind === 'rocket' || kind === 'homing' || kind === 'drill' ? 300 : 520, .2, 'sawtooth', .03); noiseSound(.2, .04, 900);
      startRetreat(); return;
    }
    if (kind === 'airstrike') {
      const t = S.target, yaw = Math.atan2(t.x - u.x, -(t.z - u.z)), fx = Math.sin(yaw), fz = -Math.cos(yaw);
      announce('Luftangriff!'); sound(220, .9, 'sawtooth', .02); strikeFocus = { x: t.x, y: Math.max(t.y, S.water) + 1, z: t.z };
      for (let i = -2; i <= 2; i++) later(.5 + (i + 2) * .12, () => spawnProjectile('airbomb', t.x + fx * (i * 1.7 - 5), 26, t.z + fz * (i * 1.7 - 5), fx * 4.5, -6, fz * 4.5, { owner: -1 }));
      startRetreat(); return;
    }
    if (kind === 'teleport') {
      const t = S.target;
      burst(u.x, u.y + 1, u.z, 1, 0x9eefff);
      u.x = t.x; u.z = t.z; u.y = height(t.x, t.z) + .3; u.air = true; u.vx = u.vz = u.vy = 0;
      burst(u.x, u.y + 1, u.z, 1, 0x9eefff); sound(900, .3, 'sine', .04);
      announce('Teleportiert!'); endTurn(); return;
    }
    if (kind === 'dynamite' || kind === 'mine') {
      const it = { t: kind, x: u.x + d.x * .2, y: u.y + .6, z: u.z + d.z * .2, fuse: kind === 'dynamite' ? 5 : null, arm: 2.2, vy: 0 };
      S.items.push(it); itemMesh(it);
      announce(kind === 'dynamite' ? 'Dynamit! Lauf!' : 'Mine gelegt'); sound(300, .1, 'square', .03);
      startRetreat(); return;
    }
    if (kind === 'sheep') { spawnSheep(u); announce('Mäh! Feuer drücken = Bumm'); sound(700, .3, 'triangle', .03); startRetreat(); return; }
    if (kind === 'bat') {
      sound(240, .15, 'square', .05); noiseSound(.12, .05, 2000);
      const hd = dirOf(S.yaw, 0), push = dirOf(S.yaw, Math.max(S.angle, 25));
      let hit = false;
      for (const v of S.units) {
        if (v === u || !alive(v)) continue;
        const dx = v.x - u.x, dz = v.z - u.z, dist = Math.hypot(dx, dz);
        if (dist < 1.9 && Math.abs(v.y - u.y) < 1.6 && (dx * hd.x + dz * hd.z) / Math.max(.01, dist) > .35) {
          actionDamage += hurt(v, 30); v.vx = push.x * 17; v.vy = push.y * 17 + 2; v.vz = push.z * 17; v.air = true; v.y += .1; hit = true;
          if (alive(v)) say(v, 'hurt');
        }
      }
      announce(hit ? 'Homerun!' : 'Luftschlag… im wörtlichen Sinn.');
      startRetreat(); return;
    }
    if (kind === 'shotgun') {
      shotsLeft = shotsLeft ? shotsLeft - 1 : 1;
      sound(150, .18, 'sawtooth', .06); noiseSound(.15, .07, 2500);
      let x = m.x, y = m.y, z = m.z, hitUnit = null;
      for (let i = 0; i < 160 && !hitUnit; i++) {
        x += d.x * .2; y += d.y * .2; z += d.z * .2;
        if (y <= height(x, z) || y < S.water) break;
        hitUnit = S.units.find(v => v !== u && !v.dead && Math.hypot(v.x - x, v.y + .8 - y, v.z - z) < .75);
        if (S.items.some(it => it.t === 'barrel' && Math.hypot(it.x - x, it.y + .55 - y, it.z - z) < .7)) break;
      }
      if (hitUnit) { actionDamage += hurt(hitUnit, 25); hitUnit.vx += d.x * 5; hitUnit.vz += d.z * 5; hitUnit.vy = 3; hitUnit.air = true; hitUnit.y += .05; burst(x, y, z, .6, 0xffe08a); }
      else explode(x, y, z, 1.2, 12, { push: .5 });
      if (shotsLeft > 0) { announce('Noch ein Schuss!'); hudDirty = true; return; }
      startRetreat(); return;
    }
  }
  function pressFire() {
    if (!active || paused || isBotTurn()) return;
    if (S.phase === 'retreat' && sheep) { sheep.boom = true; return; }
    if (!canAct()) return;
    if (CHARGE.has(S.weapon)) { charging = true; S.power = 0; setCharge(true); }
  }
  function releaseFire() {
    if (!active || paused || isBotTurn()) return;
    if (charging) { charging = false; setCharge(false); useWeapon(); }
    else if (canAct() && !CHARGE.has(S.weapon)) useWeapon();
  }
  function setCharge(on) { $('fireBtn').classList.toggle('charging', on); }

  // ---------- Computergegner ----------
  function simulate(kind, yaw, angle, power, u) {
    const d = dirOf(yaw, angle), m = muzzle(u, d), sp = speedOf(power);
    const p = { kind, x: m.x, y: m.y, z: m.z, vx: d.x * sp, vy: d.y * sp, vz: d.z * sp, age: 0, rest: false, owner: S.current };
    for (let i = 0; i < 260; i++) {
      const r = stepProjectile(p, 1 / 40);
      if (r === 'impact' || r === 'fuse') return p;
      if (r) return null;
    }
    return null;
  }
  function blastScore(x, y, z, r, dmg, u) {
    let score = 0;
    for (const v of S.units) {
      if (!alive(v)) continue;
      const d = Math.hypot(v.x - x, v.y + .8 - y, v.z - z);
      if (d >= r + .6) continue;
      const amount = Math.min(v.hp, dmg * (1 - d / (r + .6))), kill = amount >= v.hp;
      const nearWater = v.y < S.water + 2.5 && S.skill > .6 ? 12 : 0;
      if (v.team !== u.team) score += amount + (kill ? 35 : 0) + nearWater;
      else score -= (amount + (kill ? 50 : 0)) * (v === u ? 2.2 : 1.6);
    }
    for (const it of S.items) if (it.t === 'barrel' && Math.hypot(it.x - x, it.z - z) < r + .7) score += 6;
    return score;
  }
  function* planBot() {
    const u = activeUnit(), team = S.team, enemies = S.units.filter(v => alive(v) && v.team !== team);
    enemies.sort((a, b) => Math.hypot(a.x - u.x, a.z - u.z) - Math.hypot(b.x - u.x, b.z - u.z));
    const have = k => ammoOf(team, k) !== 0, az = v => Math.atan2(v.x - u.x, -(v.z - u.z)) * 180 / Math.PI;
    let best = { score: -Infinity }, miss = { err: Infinity };
    const consider = c => { if (c.score > best.score) best = c; };
    for (const e of enemies) {
      const dist = Math.hypot(e.x - u.x, e.z - u.z);
      if (have('bat') && dist < 1.8 && Math.abs(e.y - u.y) < 1.5) consider({ kind: 'bat', yaw: az(e), angle: 40, score: 30 + (e.hp <= 30 ? 40 : 0) + 25 });
      if (dist < 22 && S.skill > .35) {
        const elev = Math.atan2(e.y - u.y, dist) * 180 / Math.PI, d = dirOf(az(e), elev), m = muzzle(u, d);
        let x = m.x, y = m.y, z = m.z, clear = false;
        for (let i = 0; i < 160; i++) {
          x += d.x * .2; y += d.y * .2; z += d.z * .2;
          if (y <= height(x, z)) break;
          if (S.units.some(v => v !== u && !v.dead && v !== e && Math.hypot(v.x - x, v.y + .8 - y, v.z - z) < .8)) break;
          if (Math.hypot(e.x - x, e.y + .8 - y, e.z - z) < .7) { clear = true; break; }
        }
        if (clear) consider({ kind: 'shotgun', yaw: az(e), angle: elev, score: Math.min(e.hp, 50) * .85 + (e.hp <= 50 ? 30 : 0) });
      }
    }
    const kinds = ['rocket', 'grenade'];
    if (have('cluster') && S.skill > .4) kinds.push('cluster');
    if (have('banana') && S.skill > .5) kinds.push('banana');
    if (have('holy') && S.skill > .55) kinds.push('holy');
    const cost = { rocket: 0, grenade: 2, cluster: 12, banana: 25, holy: 30 };
    for (const kind of kinds) for (const e of enemies.slice(0, 3)) {
      const base = az(e);
      for (const yo of [-4, 0, 4]) for (let angle = 10; angle <= 80; angle += 7) {
        for (let power = 20; power <= 100; power += 5) {
          const end = simulate(kind, base + yo, angle, power, u);
          if (!end) continue;
          const spec = PROJ[kind];
          let sc = blastScore(end.x, end.y, end.z, spec.r, spec.dmg, u);
          if (spec.split) sc *= 1.6;
          sc -= cost[kind];
          if (sc > 0) consider({ kind, yaw: base + yo, angle, power, score: sc });
          if (kind === 'rocket') { const err = Math.hypot(end.x - e.x, end.z - e.z); if (err < miss.err) miss = { err, kind, yaw: base + yo, angle, power }; }
        }
        yield;
      }
    }
    if (have('airstrike')) for (const e of enemies) {
      const sc = blastScore(e.x, e.y + .5, e.z, 4, 45, u) * .75 - 18;
      consider({ kind: 'airstrike', target: { x: e.x, y: e.y, z: e.z }, yaw: az(e), angle: 30, score: sc });
    }
    if (have('homing') && enemies[0]) { const e = enemies[0]; consider({ kind: 'homing', target: { x: e.x, y: e.y, z: e.z }, yaw: az(e), angle: 55, power: 70, score: Math.min(e.hp, 50) * .7 - 14 }); }
    if (best.score <= 0) best = miss.err < Infinity ? miss : { kind: 'rocket', yaw: enemies[0] ? az(enemies[0]) : u.face, angle: 45, power: 60 };
    return best;
  }
  function botUpdate(dt) {
    if (!bot || !isBotTurn() || paused) return;
    const u = activeUnit();
    if (bot.stage === 'think') {
      $('botAction').textContent = u.name + ' überlegt …';
      if (gameTime < bot.at) return;
      bot.gen ||= planBot();
      const until = performance.now() + 5;
      while (performance.now() < until) {
        const r = bot.gen.next();
        if (r.done) {
          const plan = r.value, err = 1 - S.skill;
          plan.yaw += gauss() * err * 14; plan.angle = clamp(plan.angle + gauss() * err * 10, -80, 85);
          if (plan.power != null) plan.power = clamp(plan.power + gauss() * err * 28, 5, 100);
          if (plan.target) { plan.target.x += gauss() * err * 4; plan.target.z += gauss() * err * 4; }
          bot = { stage: 'turn', plan, t: 0, fromYaw: S.yaw, fromAngle: S.angle };
          selectWeapon(plan.kind); S.target = plan.target || null;
          $('botAction').textContent = u.name + ' greift zu: ' + LABEL[plan.kind][2];
          break;
        }
      }
    } else if (bot.stage === 'turn') {
      bot.t += dt / .8;
      const k = smoothstep(0, 1, bot.t), dy = ((bot.plan.yaw - bot.fromYaw + 540) % 360) - 180;
      S.yaw = bot.fromYaw + dy * k; S.angle = bot.fromAngle + (bot.plan.angle - bot.fromAngle) * k; u.face = S.yaw;
      if (S.target) { targetMarker.visible = true; targetMarker.position.set(S.target.x, height(S.target.x, S.target.z) + .1, S.target.z); }
      if (bot.t >= 1) { bot.stage = CHARGE.has(bot.plan.kind) ? 'charge' : 'fire'; S.power = 0; }
    } else if (bot.stage === 'charge') {
      S.power = Math.min(bot.plan.power, S.power + dt * 62);
      if (S.power >= bot.plan.power) bot.stage = 'fire';
    } else if (bot.stage === 'fire') {
      useWeapon();
      if (S.phase === 'aim' && shotsLeft > 0) { bot.stage = 'turn'; bot.t = .5; bot.fromYaw = S.yaw; bot.fromAngle = S.angle; return; }
      bot.stage = 'retreat'; bot.away = Math.random() < .7;
    } else if (bot.stage === 'retreat' && S.phase === 'retreat') {
      if (sheep && sheep.age > 2.5 && enemiesNear(sheep, 2.5)) sheep.boom = true;
      if (bot.away && !u.air && retreatLeft > 1) {
        // Nur zurückweichen, solange dahinter fester Boden ohne Absturz liegt.
        const y = u.face * Math.PI / 180, bx = u.x - Math.sin(y) * 1.2, bz = u.z + Math.cos(y) * 1.2, g = height(bx, bz);
        if (g > S.water + 1.5 && g > u.y - .4 && !S.items.some(it => it.t === 'mine' && Math.hypot(it.x - bx, it.z - bz) < 2)) { S.yaw = u.face; walk(u, -dt * 1.6); } else bot.away = false;
      }
    }
  }
  const enemiesNear = (p, r) => S.units.some(v => alive(v) && v.team !== S.team && Math.hypot(v.x - p.x, v.z - p.z) < r);

  // ---------- HUD ----------
  function updateHud() {
    hudDirty = false;
    const u = activeUnit(); if (!u) return;
    const bot = isBotTurn();
    const total = t => S.units.filter(v => v.team === t).reduce((n, v) => n + Math.max(0, v.hp), 0);
    const full = t => S.units.filter(v => v.team === t).reduce((n, v) => n + v.maxHp, 0);
    $('teamHud').innerHTML = [0, 1].map(t => {
      const label = S.mode === 'local' ? 'TEAM ' + teamNames[t] : t ? 'COMPUTER' : 'DEIN TRUPP';
      return `<div class="team-card ${t ? 'blue' : 'red'}${S.team === t ? ' turn' : ''}"><strong>${label}</strong><span>${S.units.filter(v => v.team === t && alive(v)).length} Würmer · ${Math.ceil(total(t))} LP</span><i style="--hp:${Math.round(clamp(total(t) / full(t), 0, 1) * 100)}%"></i></div>`;
    }).join('');
    $('game').classList.toggle('blue-turn', S.team === 1);
    $('game').classList.toggle('bot-turn', bot && active);
    $('game').classList.toggle('retreat', S.phase === 'retreat');
    $('turnInfo').textContent = (S.mode === 'campaign' ? 'LEVEL ' + S.level + ' · ' : '') + 'RUNDE ' + Math.max(1, S.round) + (S.round >= S.suddenDeath ? ' · SUDDEN DEATH' : '');
    $('worldHud').textContent = worlds[S.world].name;
    $('unitName').textContent = u.name; $('unitHp').textContent = Math.ceil(u.hp) + ' LP';
    const wpct = Math.round(Math.abs(S.wind) / 3.2 * 50);
    $('wind').innerHTML = `<b class="${S.wind < 0 ? 'left' : 'right'}" style="--w:${wpct}%"></b>`;
    const [id, icon, name] = LABEL[S.weapon], ammo = ammoOf(S.team, id);
    $('weaponIcon').textContent = icon; $('weaponName').textContent = name + (ammo < 0 ? '' : ' · ' + ammo);
    $('fireIcon').textContent = S.phase === 'retreat' ? (sheep ? '💥' : '🏃') : icon;
    $('fireLabel').textContent = S.phase === 'retreat' ? (sheep ? 'BUMM' : 'LAUF!') : shotsLeft ? '2. SCHUSS' : 'FEUER';
    $('padWeaponIcon').textContent = icon; $('padWeaponName').textContent = name; $('padWeaponAmmo').textContent = (ammo < 0 ? '∞ Schuss' : ammo + '× übrig') + (NEEDS_TARGET.has(id) ? ' · Ziel mit Stick' : '');
    if (inputMode === 'pad') renderPadLegend();
    const focusedWeapon = document.querySelector('#weaponGrid .nav-focus')?.dataset.weapon;
    $('weaponGrid').innerHTML = WEAPONS.map(([k, ic, nm, hint], i) => {
      const a = ammoOf(S.team, k);
      return `<button data-weapon="${k}" class="${S.weapon === k ? 'chosen' : ''}" ${a === 0 ? 'disabled' : ''}><span>${ic}</span><div>${nm}<small>${a < 0 ? '∞' : a + '×'} · ${hint}</small></div>${i < 10 ? `<kbd>${(i + 1) % 10}</kbd>` : ''}</button>`;
    }).join('');
    if (focusedWeapon) { const fb = $('weaponGrid').querySelector(`[data-weapon="${focusedWeapon}"]`); if (fb) navFocus(fb); }
    const lock = bot || !active;
    for (const id2 of ['weaponBtn', 'skipBtn']) $(id2).disabled = lock || S.phase !== 'aim' || shotsLeft > 0;
    for (const id2 of ['jumpBtn', 'flipBtn']) $(id2).disabled = lock || !(S.phase === 'aim' || S.phase === 'retreat');
    $('fireBtn').disabled = lock || !(S.phase === 'aim' || (S.phase === 'retreat' && sheep));
  }
  function updateTimerText() {
    const v = S.phase === 'retreat' ? Math.ceil(retreatLeft) : S.phase === 'aim' ? Math.ceil(S.seconds) : '…';
    if (v !== timerShown) { timerShown = v; $('timer').textContent = v; $('timer').classList.toggle('urgent', S.phase === 'retreat' || (S.phase === 'aim' && S.seconds <= 10)); }
    $('angleVal').textContent = Math.round(S.angle) + '°';
    $('powerVal').textContent = Math.round(S.power) + '%';
    $('padPower').style.width = (charging ? Math.round(S.power) : 0) + '%';
    document.querySelector('.charge-ring').style.setProperty('--charge', (charging || (bot && bot.stage === 'charge') ? Math.round(S.power) : 0) + '%');
  }
  function updateAim() {
    const u = activeUnit(), show = active && S.phase === 'aim' && alive(u) && !u.air;
    const d = dirOf(S.yaw, S.angle);
    crosshair.visible = show && !['airstrike', 'teleport', 'dynamite', 'mine', 'sheep'].includes(S.weapon);
    if (crosshair.visible) crosshair.position.set(u.x + d.x * 3.4, u.y + 1.1 + d.y * 3.4, u.z + d.z * 3.4);
    arrow.visible = active && alive(u) && S.phase !== 'wait';
    if (arrow.visible) arrow.position.set(u.x, u.y + 3.3 + Math.sin(gameTime * 5) * .2, u.z);
    // Zielhilfe: Locker = ganze Flugbahn, Normal = Anfang der Flugbahn, Knifflig = nur Fadenkreuz.
    let n = 0;
    if (show && !isBotTurn() && CHARGE.has(S.weapon) && S.help !== 'hard') {
      const m = muzzle(u, d), sp = speedOf(charging ? S.power : 60);
      const p = { kind: S.weapon === 'homing' ? 'rocket' : S.weapon, x: m.x, y: m.y, z: m.z, vx: d.x * sp, vy: d.y * sp, vz: d.z * sp, age: 0, rest: false, owner: S.current };
      const steps = S.help === 'easy' ? 200 : 22;
      for (let i = 0; i < steps && n < 240; i++) {
        aimPositions[n * 3] = p.x; aimPositions[n * 3 + 1] = p.y; aimPositions[n * 3 + 2] = p.z; n++;
        let r = null;
        for (let k = 0; k < 2 && !r; k++) r = stepProjectile(p, 1 / 50);
        if (r) break;
      }
    }
    aimLine.geometry.setDrawRange(0, n); aimLine.geometry.attributes.position.needsUpdate = true;
    if (n > 1) aimLine.computeLineDistances();
    aimLine.visible = n > 1;
  }

  // ---------- Kamera ----------
  function cameraUpdate(dt) {
    if (camera.view && camera.view.enabled) camera.clearViewOffset();
    const u = activeUnit();
    let focus, dist = camDistance, az = cameraAz;
    const p = projectiles[0];
    if (S.phase === 'over' && celebrate && celebrate.unit && !p) { const c = celebrate.unit; focus = { x: c.x, y: c.y + 1, z: c.z }; dist = 7.5; cameraAz += dt * 14; az = cameraAz; }
    else if (p && p.kind === 'airbomb' && strikeFocus) { focus = strikeFocus; dist = Math.max(camDistance, 20); }
    else if (p) { focus = { x: p.x, y: Math.max(p.y, height(p.x, p.z) + 2), z: p.z }; dist = Math.max(camDistance, 18); }
    else if (sheep) { focus = { x: sheep.x, y: sheep.y + 1, z: sheep.z }; }
    else if (lastBlast && gameTime - lastBlast.at < 1.4 && S.phase !== 'aim') { focus = lastBlast; dist = Math.max(camDistance, 14); }
    else if (overview) { focus = { x: 0, y: 2, z: 0 }; dist = innerWidth < innerHeight ? 70 : 52; az = overviewAz * 180 / Math.PI; }
    else if (u) { const a = S.yaw * Math.PI / 180, ahead = S.phase === 'aim' ? 2.5 : 0; focus = { x: u.x + Math.sin(a) * ahead, y: u.y + 1.4, z: u.z - Math.cos(a) * ahead }; }
    else focus = { x: 0, y: 2, z: 0 };
    if (!overview && u && S.phase !== 'wait' && S.phase !== 'over') cameraAz += (((S.yaw - cameraAz + 540) % 360) - 180) * Math.min(1, dt * 3);
    if (!cameraFocus) cameraFocus = new THREE.Vector3(focus.x, focus.y, focus.z);
    cameraFocus.lerp(new THREE.Vector3(focus.x, focus.y, focus.z), Math.min(1, dt * (p ? 5 : 3.5)));
    const a = (overview ? az : cameraAz) * Math.PI / 180, elev = overview ? .9 : p ? .5 : .42;
    const tx = cameraFocus.x - Math.sin(a) * Math.cos(elev) * dist, tz = cameraFocus.z + Math.cos(a) * Math.cos(elev) * dist;
    let ty = cameraFocus.y + Math.sin(elev) * dist;
    ty = Math.max(ty, height(tx, tz) + 1.5, S.water + 1);
    camera.position.lerp(new THREE.Vector3(tx, ty, tz), Math.min(1, dt * 6));
    if (shake > 0) { camera.position.x += rand(-shake, shake); camera.position.y += rand(-shake, shake); shake = Math.max(0, shake - dt * 1.6); }
    camera.lookAt(cameraFocus.x, cameraFocus.y + (overview ? 0 : .8), cameraFocus.z);
    if (S.phase === 'over' && celebrate && celebrate.unit) camera.setViewOffset(innerWidth, innerHeight, 0, innerHeight * .22, innerWidth, innerHeight);   // Sieger über dem Ergebnisfenster
    // Bäume und Felsen direkt vor der Kamera ausblenden, damit sie nicht die Sicht verdecken.
    for (const d of deco) d.visible = Math.hypot(d.position.x - camera.position.x, d.position.z - camera.position.z) > 3.5;
  }
  function resize() {
    if (!renderer) return;
    renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    camDistance = innerWidth < innerHeight ? 15 : 12.5;
  }

  // ---------- Schleife ----------
  function update(dt) {
    gameTime += dt;
    runEvents();
    const u = activeUnit();
    if (canMove() && !u.air) {
      const fwd = -stickY - padY + (pressed.has('w') ? 1 : 0) - (pressed.has('s') ? 1 : 0);
      const turn = stickX + padX * Math.abs(padX) + (pressed.has('d') ? 1 : 0) - (pressed.has('a') ? 1 : 0) + ((pressed.has('arrowright') ? 1 : 0) - (pressed.has('arrowleft') ? 1 : 0)) * .45;
      if (Math.abs(turn) > .12) S.yaw += turn * 120 * dt;
      if (Math.abs(fwd) > .2) walk(u, Math.sign(fwd) * Math.min(1, Math.abs(fwd)) * dt * (fwd > 0 ? 2.6 : 1.6));
      u.face = S.yaw;
    }
    if (canAct() && !isBotTurn()) {
      const tilt = (pressed.has('arrowup') ? 1 : 0) - (pressed.has('arrowdown') ? 1 : 0);
      if (tilt) S.angle = clamp(S.angle + tilt * 55 * dt, -80, 85);
    }
    if (charging) { S.power = Math.min(100, S.power + dt * 62); if (S.power >= 100) releaseFire(); }
    acc += dt;
    let steps = 0;
    while (acc >= STEP && steps < 14) { acc -= STEP; steps++; updateProjectiles(STEP); }
    if (steps >= 14) acc = 0;
    drawProjectiles(dt);
    for (let t = dt; t > 0; t -= 1 / 60) { const s = Math.min(t, 1 / 60); updateUnits(s); updateSheep(s); }
    updateItems(dt);
    botUpdate(dt);
    phaseLogic(dt);
  }
  function frame(time) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, last ? (time - last) / 1000 : .016); last = time;
    padPoll(time, dt);
    if (!S) return;
    if ($('menu').classList.contains('active')) { attractFrame(time, dt); return; }
    updatePrompts();
    if (!$('game').classList.contains('active')) return;
    if (paused) { if (pausedFrames++ > 1) return; } else pausedFrames = 0;
    if (active && !paused) { update(dt); musicTick(dt); }
    updateParticles(dt);
    updateBodies(time, paused ? 0 : dt);
    if (hudDirty) updateHud();
    updateTimerText(); updateAim();
    water.position.y = S.water + Math.sin(time * .0012) * .05;
    cameraUpdate(dt); updateSpeeches(time);
    renderer.render(scene, camera);
  }

  // ---------- Eingabe ----------
  function pickGround(cx, cy) {
    const rect = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((cx - rect.left) / rect.width * 2 - 1, -((cy - rect.top) / rect.height * 2 - 1)), camera);
    const o = raycaster.ray.origin, d = raycaster.ray.direction;
    let prev = 0;
    for (let t = .5; t < 220; t += .4) {
      const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
      if (y <= Math.max(height(x, z), S.water)) {
        let a = prev, b = t;
        for (let i = 0; i < 8; i++) { const m = (a + b) / 2; if (o.y + d.y * m <= Math.max(height(o.x + d.x * m, o.z + d.z * m), S.water)) b = m; else a = m; }
        return { x: o.x + d.x * b, z: o.z + d.z * b };
      }
      prev = t;
    }
    return null;
  }
  function tapTarget(cx, cy) {
    if (!canAct() || isBotTurn()) return;
    const u = activeUnit(), rect = renderer.domElement.getBoundingClientRect();
    if (NEEDS_TARGET.has(S.weapon)) {
      const p = pickGround(cx, cy); if (!p) return;
      S.target = { x: p.x, y: height(p.x, p.z), z: p.z };
      targetMarker.visible = true; targetMarker.position.set(p.x, Math.max(S.target.y, S.water) + .1, p.z);
      S.yaw = Math.atan2(p.x - u.x, -(p.z - u.z)) * 180 / Math.PI; u.face = S.yaw;
      announce('Ziel gesetzt · ' + (S.weapon === 'homing' ? 'Feuer halten' : 'Feuer drücken'), 1600); sound(660, .08, 'triangle', .03);
      return;
    }
    let nearest = null, best = Infinity;
    for (const v of S.units) {
      if (!alive(v) || v.team === S.team) continue;
      const p = project(v.x, v.y + 1.2, v.z); if (p.z > 1) continue;
      const d = Math.hypot(rect.left + (p.x + 1) * rect.width / 2 - cx, rect.top + (1 - p.y) * rect.height / 2 - cy);
      if (d < best) { best = d; nearest = v; }
    }
    let target = nearest && best < Math.max(50, Math.min(rect.width, rect.height) * .1) ? nearest : null;
    if (!target) { const p = pickGround(cx, cy); if (p) target = p; }
    if (!target || Math.hypot(target.x - u.x, target.z - u.z) < 1) return;
    S.yaw = Math.atan2(target.x - u.x, -(target.z - u.z)) * 180 / Math.PI; u.face = S.yaw;
    if (overview) { overview = false; $('viewBtn').classList.remove('selected'); }
    if (nearest && target === nearest) announce('Blick auf ' + nearest.name + ' · Ziehen = Winkel', 1500);
  }
  const capture = (el, e) => { try { el.setPointerCapture(e.pointerId); } catch (_) {} };
  function addInput() {
    const el = renderer.domElement, pointers = new Map();
    let drag = null, pinch = 0;
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('pointerdown', e => {
      if (!active || paused) return;
      e.preventDefault(); capture(el, e);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = null; return; }
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
      $('aimHint').classList.add('faded');
    });
    el.addEventListener('pointermove', e => {
      const p = pointers.get(e.pointerId); if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
        camDistance = clamp(camDistance * pinch / Math.max(20, d), 7, 34); pinch = d; return;
      }
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      drag.moved += Math.hypot(dx, dy);
      if (drag.moved < 8) return;
      if (overview) { overviewAz -= dx * .006; return; }
      if (!canAct() || isBotTurn()) return;
      const u = activeUnit();
      S.yaw += dx * .28; u.face = S.yaw;
      S.angle = clamp(S.angle - dy * .3, -80, 85);
    });
    const up = e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = 0;
      if (drag && drag.id === e.pointerId) {
        if (e.type === 'pointerup' && drag.moved < 8) tapTarget(e.clientX, e.clientY);
        drag = null;
      }
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => { e.preventDefault(); camDistance = clamp(camDistance + Math.sign(e.deltaY) * 1.5, 7, 34); }, { passive: false });
    const stick = $('stick'), thumb = $('stickThumb');
    let stickId = null;
    const stickMove = e => {
      if (stickId !== e.pointerId) return;
      const r = stick.getBoundingClientRect(), max = r.width * .31, dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2, l = Math.max(max, Math.hypot(dx, dy));
      stickX = dx / l; stickY = dy / l;
      thumb.style.transform = `translate(${stickX * max}px,${stickY * max}px)`;
    };
    stick.addEventListener('pointerdown', e => { if (!active || paused) return; e.preventDefault(); stickId = e.pointerId; capture(stick, e); stickMove(e); });
    stick.addEventListener('pointermove', stickMove);
    const stopStick = e => { if (stickId === e.pointerId) { stickId = null; stickX = stickY = 0; thumb.style.transform = ''; } };
    stick.addEventListener('pointerup', stopStick); stick.addEventListener('pointercancel', stopStick);
    document.addEventListener('keydown', e => {
      const scope = navScope();
      if (scope) { if (navKey(e, scope)) e.preventDefault(); return; }
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.isTrusted && !e.repeat) setInputMode('kbd');
      const k = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab', 'backspace'].includes(k) && $('game').classList.contains('active')) e.preventDefault();
      if (k === 'escape') { if (!$('weaponPanel').hidden) $('weaponPanel').hidden = true; else togglePause(); return; }
      if (!active || paused) return;
      pressed.add(k);
      if (e.repeat) return;
      if (k === ' ') pressFire();
      if (k === 'enter') jump(false);
      if (k === 'backspace') jump(true);
      if (k === 'v') { overview = !overview; $('viewBtn').classList.toggle('selected', overview); }
      if (k === 'tab' && !isBotTurn()) openWeapons();
      if (/^[0-9]$/.test(k) && !isBotTurn()) { const w = WEAPONS[(+k + 9) % 10]; if (w) selectWeapon(w[0]); }
    });
    document.addEventListener('keyup', e => {
      const k = e.key.toLowerCase(); pressed.delete(k);
      if (k === ' ') releaseFire();
    });
    addEventListener('blur', () => { pressed.clear(); if (charging) releaseFire(); });
    document.addEventListener('pointerdown', e => { if (e.isTrusted) setInputMode(e.pointerType === 'touch' || e.pointerType === 'pen' ? 'touch' : 'mouse'); }, true);
    const fb = $('fireBtn');
    let fireId = null;
    fb.addEventListener('pointerdown', e => { if (!active || paused || isBotTurn()) return; e.preventDefault(); fireId = e.pointerId; capture(fb, e); pressFire(); });
    fb.addEventListener('pointerup', e => { if (fireId !== e.pointerId) return; e.preventDefault(); fireId = null; releaseFire(); });
    fb.addEventListener('pointercancel', e => { if (fireId === e.pointerId) { fireId = null; releaseFire(); } });
  }
  function togglePause(force) {
    if (!active || !S) return;
    paused = force === undefined ? !paused : force;
    if (paused && charging) { charging = false; setCharge(false); }
    if (paused) $('weaponPanel').hidden = true;
    $('pause').hidden = !paused;
    $('pauseSoundBtn').textContent = soundEnabled ? '🔊 Spielsound an' : '🔇 Spielsound aus';
    afterOverlay();
  }

  // ---------- Eingabe: Controller, Fokus-Navigation, Tasten-Hinweise ----------
  const PAD = { prev: [], ready: false, dir: null, dirNext: 0, selectAt: 0, ltHeld: false, ltOverview: false, zoom: 1, idx: -1, legendKey: '' };
  let padX = 0, padY = 0;
  const GLYPH = {
    xbox: { a: 'A', b: 'B', x: 'X', y: 'Y', lb: 'LB', rb: 'RB', lt: 'LT', rt: 'RT', select: '⧉', start: '☰', ls: 'L', rs: 'R', r3: 'R3', l3: 'L3', dpad: '✚' },
    ps: { a: '✕', b: '○', x: '□', y: '△', lb: 'L1', rb: 'R1', lt: 'L2', rt: 'R2', select: '⧉', start: '☰', ls: 'L', rs: 'R', r3: 'R3', l3: 'L3', dpad: '✚' },
    nin: { a: 'B', b: 'A', x: 'Y', y: 'X', lb: 'L', rb: 'R', lt: 'ZL', rt: 'ZR', select: '−', start: '+', ls: 'L', rs: 'R', r3: 'R3', l3: 'L3', dpad: '✚' }
  };
  const g = n => `<kbd class="g${padKind === 'ps' ? ' ps' : ''}" data-g="${n}">${GLYPH[padKind][n] || n}</kbd>`;
  const k = t => `<kbd class="g k">${t}</kbd>`;
  function setInputMode(mode) {
    if (mode === inputMode) return false;
    inputMode = mode;
    document.body.classList.remove('input-touch', 'input-pad', 'input-kbd', 'input-mouse');
    document.body.classList.add('input-' + mode);
    if (mode === 'touch' || mode === 'mouse') for (const el of document.querySelectorAll('.nav-focus')) el.classList.remove('nav-focus');
    else { const sc = navScope(); if (sc) ensureFocus(sc); }
    promptsDirty = true; hudDirty = true;
    return true;
  }
  let promptsDirty = true, promptScope = null;
  function firstPad() {
    const list = navigator.getGamepads ? navigator.getGamepads() : [];
    if (PAD.idx >= 0 && list[PAD.idx] && list[PAD.idx].connected !== false) return list[PAD.idx];
    for (let i = 0; i < list.length; i++) if (list[i] && list[i].connected !== false && list[i].buttons && list[i].buttons.length >= 10) { PAD.idx = i; return list[i]; }
    PAD.idx = -1; return null;
  }
  function rumble(strong, weak, ms) {
    if (inputMode !== 'pad') return;
    const gp = firstPad(), va = gp && gp.vibrationActuator;
    if (va && va.playEffect) try { va.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {}); } catch (_) {}
  }
  const dz = v => Math.abs(v) < .2 ? 0 : (v - Math.sign(v) * .2) / .8;
  function padPoll(time, dt) {
    const gp = firstPad();
    if (!gp) { PAD.prev = []; PAD.ready = false; padX = padY = 0; return; }
    const now = gp.buttons.map(b => !!b && (b.pressed || b.value > .5));
    const ax = gp.axes.map(v => dz(v || 0));
    if (!PAD.ready) { PAD.prev = []; PAD.ready = true; }
    const hit = i => now[i] && !PAD.prev[i], rel = i => !now[i] && PAD.prev[i];
    const dir = now[12] || ax[1] < -.6 ? 'up' : now[13] || ax[1] > .6 ? 'down' : now[14] || ax[0] < -.6 ? 'left' : now[15] || ax[0] > .6 ? 'right' : null;
    const any = now.some((b, i) => b && !PAD.prev[i]) || ax.some(v => Math.abs(v) > .5);
    if (any) {
      const id = (gp.id || '').toLowerCase();
      const kind = /054c|playstation|dualshock|dualsense|sony/.test(id) ? 'ps' : /057e|nintendo|switch|joy-con/.test(id) ? 'nin' : 'xbox';
      if (kind !== padKind) { padKind = kind; promptsDirty = true; PAD.legendKey = ''; }
      // Wechsel zum Controller: erster Druck zeigt nur den Fokusrahmen
      if (setInputMode('pad') && navScope()) { PAD.prev = now; PAD.dir = dir; return; }
    }
    const scope = navScope();
    // Richtung fürs Menü: Steuerkreuz oder linker Stick, mit Wiederholung beim Halten
    if (scope) {
      padX = padY = 0;
      if (charging) releaseFire();
      if (dir !== PAD.dir) { PAD.dir = dir; PAD.dirNext = time + 380; if (dir) navDir(dir); }
      else if (dir && time > PAD.dirNext) { PAD.dirNext = time + 110; navDir(dir); }
      if (hit(0)) navActivate();
      else if (hit(1)) navBack();
      else if (hit(9)) { if (scope.id === 'pause') togglePause(false); else if (scope.id === 'weaponPanel') $('weaponPanel').hidden = true; }
      else if (scope.id === 'weaponPanel' && (hit(2) || hit(3))) $('weaponPanel').hidden = true;
      else if (scope.id === 'help' && (hit(4) || hit(5))) helpTab(hit(4) ? -1 : 1);
      if (rs(ax[3])) scope.querySelector('.dialog.wide, .sheet-card')?.scrollBy(0, ax[3] * dt * 600);
      PAD.prev = now; PAD.selectAt = 0; return;
    }
    PAD.dir = dir;
    const playing = $('game').classList.contains('active') && S && active && !paused;
    if (hit(9) && $('game').classList.contains('active') && active) { togglePause(true); PAD.prev = now; return; }
    if (!playing) { padX = padY = 0; PAD.prev = now; return; }
    const mine = !isBotTurn();
    padX = mine ? ax[0] : 0; padY = mine ? ax[1] : 0;
    if (mine) {
      const targeting = NEEDS_TARGET.has(S.weapon) && S.phase === 'aim' && (now[6] || S.weapon !== 'homing');
      // LT halten: Übersicht zum Zielen
      if (now[6] && NEEDS_TARGET.has(S.weapon) && !PAD.ltHeld) { PAD.ltHeld = true; if (!overview) { overview = true; PAD.ltOverview = true; $('viewBtn').classList.add('selected'); } if (!S.target) defaultTarget(); }
      if (!now[6] && PAD.ltHeld) { PAD.ltHeld = false; if (PAD.ltOverview && S.weapon === 'homing') { overview = false; $('viewBtn').classList.remove('selected'); } PAD.ltOverview = false; }
      const rx = ax[2] || 0, ry = ax[3] || 0;
      if (targeting && S.target) {
        moveTarget((rx + (now[6] ? ax[0] : 0)) * dt * 16, (ry + (now[6] ? ax[1] : 0)) * dt * 16);
        if (now[6]) padX = padY = 0;
      } else if (overview) overviewAz -= rx * dt * 1.8;
      else if (canAct()) {
        const u = activeUnit();
        if (rx) { S.yaw += rx * Math.abs(rx) * 140 * dt; u.face = S.yaw; }
        if (ry) S.angle = clamp(S.angle - ry * Math.abs(ry) * 70 * dt, -80, 85);
      }
      if (canAct()) {
        const u = activeUnit();
        if (now[12] || now[13]) S.angle = clamp(S.angle + (now[12] ? 1 : -1) * 22 * dt, -80, 85);
        if (now[14] || now[15]) { S.yaw += (now[15] ? 1 : -1) * 30 * dt; u.face = S.yaw; }
      }
      if (hit(0)) jump(false);
      if (hit(1)) jump(true);
      if (hit(2) && canAct() && shotsLeft === 0) openWeapons();
      if (hit(3)) { overview = !overview; PAD.ltOverview = false; $('viewBtn').classList.toggle('selected', overview); }
      if (hit(4)) cycleWeapon(-1);
      if (hit(5)) cycleWeapon(1);
      if (hit(7)) pressFire();
      if (rel(7)) releaseFire();
      if (hit(11)) { PAD.zoom = (PAD.zoom + 1) % 3; camDistance = [9, innerWidth < innerHeight ? 15 : 12.5, 20][PAD.zoom]; }
      if (hit(10)) { overview = false; $('viewBtn').classList.remove('selected'); cameraAz = S.yaw; }
      // Select halten: Zug beenden
      if (now[8] && !now[9] && canAct() && shotsLeft === 0) {
        if (!PAD.selectAt) PAD.selectAt = time;
        const p = Math.min(1, (time - PAD.selectAt) / 700);
        const bar = document.querySelector('#padLegend .hold b'); if (bar) bar.style.setProperty('--p', Math.round(p * 100) + '%');
        if (p >= 1) { PAD.selectAt = 0; passTurn(); }
      } else if (PAD.selectAt) { PAD.selectAt = 0; const bar = document.querySelector('#padLegend .hold b'); if (bar) bar.style.setProperty('--p', '0%'); }
    }
    PAD.prev = now;
  }
  const rs = v => Math.abs(v || 0) > .3;
  function defaultTarget() {
    const u = activeUnit(); if (!u) return;
    let t;
    if (S.weapon === 'teleport') { const a = S.yaw * Math.PI / 180; t = { x: u.x + Math.sin(a) * 8, z: u.z - Math.cos(a) * 8 }; }
    else { const e = nearestEnemy(u); t = e ? { x: e.x, z: e.z } : { x: u.x, z: u.z }; }
    setTarget(t.x, t.z);
  }
  function setTarget(x, z) {
    x = clamp(x, -HALF + 1.5, HALF - 1.5); z = clamp(z, -HALF + 1.5, HALF - 1.5);
    S.target = { x, y: height(x, z), z };
    targetMarker.visible = true; targetMarker.position.set(x, Math.max(S.target.y, S.water) + .1, z);
    if (S.weapon !== 'homing') { const u = activeUnit(); S.yaw = Math.atan2(x - u.x, -(z - u.z)) * 180 / Math.PI; u.face = S.yaw; }
  }
  function moveTarget(mx, mz) {
    if (!mx && !mz) return;
    // relativ zur Kamera: Stick nach oben = vom Betrachter weg
    const fx = cameraFocus ? cameraFocus.x - camera.position.x : 0, fz = cameraFocus ? cameraFocus.z - camera.position.z : -1, l = Math.hypot(fx, fz) || 1;
    const f = { x: fx / l, z: fz / l }, r = { x: -f.z, z: f.x };
    setTarget(S.target.x + r.x * mx - f.x * mz, S.target.z + r.z * mx - f.z * mz);
  }
  function cycleWeapon(d) {
    if (!S || S.phase !== 'aim' || shotsLeft > 0 || isBotTurn()) return;
    let i = WEAPONS.findIndex(w => w[0] === S.weapon);
    for (let n = 0; n < WEAPONS.length; n++) {
      i = (i + d + WEAPONS.length) % WEAPONS.length;
      if (ammoOf(S.team, WEAPONS[i][0]) !== 0) { selectWeapon(WEAPONS[i][0]); break; }
    }
    sound(560 + d * 40, .05, 'triangle', .02);
    const el = document.querySelector('.pad-weapon'); el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap');
  }
  function openWeapons() {
    if (!canAct() || isBotTurn() || shotsLeft > 0) return;
    $('weaponPanel').hidden = false;
    if (inputMode === 'pad' || inputMode === 'kbd') { const b = $('weaponGrid').querySelector('.chosen') || $('weaponGrid').querySelector('button:not(:disabled)'); if (b) navFocus(b); }
  }
  function passTurn() {
    if (canAct() && !isBotTurn() && shotsLeft === 0) { announce('Zug beendet'); say(activeUnit(), 'pass'); endTurn(); }
  }
  function turnBanner(head, name, team) {
    const el = $('turnBanner');
    $('turnBannerTeam').textContent = head; $('turnBannerName').textContent = name;
    el.classList.toggle('blue', team === 1); el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }
  function renderPadLegend() {
    const tgt = S && NEEDS_TARGET.has(S.weapon);
    const key = padKind + (tgt ? 't' : '') + (S && S.weapon);
    if (key === PAD.legendKey) return; PAD.legendKey = key;
    const items = [[g('rt'), 'Feuer (halten)'], [g('rs'), tgt && S.weapon !== 'homing' ? 'Ziel bewegen' : 'Zielen'], [g('a'), 'Sprung'], [g('b'), 'Salto'], [g('x'), 'Waffen'], [g('y'), 'Übersicht']];
    if (tgt) items.push([g('lt'), 'Ziel setzen']);
    $('padLegend').innerHTML = items.map(([a, b]) => `<span>${a}${b}</span>`).join('') + `<span class="hold">${g('select')}Zug beenden <i><b></b></i></span><span>${g('start')}Pause</span>`;
  }
  // Fokus-Navigation (Controller, Tastatur, TV-Fernbedienung)
  const OVERLAYS = ['confirm', 'help', 'cloud', 'pause', 'result'];
  function navScope() {
    for (const id of OVERLAYS) if (!$(id).hidden) return $(id);
    if ($('game').classList.contains('active') && !$('weaponPanel').hidden) return $('weaponPanel');
    if ($('menu').classList.contains('active')) return $('menu');
    return null;
  }
  function focusables(scope) {
    return [...scope.querySelectorAll('button, a[href], input, textarea, select, [tabindex="0"]')].filter(e => !e.disabled && !e.closest('[hidden]') && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  }
  function navFocus(el) {
    for (const o of document.querySelectorAll('.nav-focus')) if (o !== el) o.classList.remove('nav-focus');
    el.classList.add('nav-focus');
    try { el.focus({ preventScroll: true }); } catch (_) {}
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    promptsDirty = true;
  }
  function current(scope) {
    const a = document.querySelector('.nav-focus');
    return a && scope.contains(a) && focusables(scope).includes(a) ? a : null;
  }
  function ensureFocus(scope) {
    const cur = current(scope); if (cur) return cur;
    const list = focusables(scope); if (!list.length) return null;
    const pref = list.find(e => e.matches('[data-autofocus]')) || list.find(e => e.matches('.primary')) || list[0];
    navFocus(pref); return pref;
  }
  function navDir(dir) {
    const scope = navScope(); if (!scope) return;
    const cur = current(scope);
    if (!cur) { ensureFocus(scope); return; }
    if ((dir === 'left' || dir === 'right') && cur.classList.contains('cycler')) { cycleOpt(cur, dir === 'left' ? -1 : 1); return; }
    const r0 = cur.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
    const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    let best = null, bestScore = Infinity;
    const list = focusables(scope);
    for (const e of list) {
      if (e === cur) continue;
      const r = e.getBoundingClientRect(), ex = r.left + r.width / 2, ey = r.top + r.height / 2;
      const dx = ex - cx, dy = ey - cy, main = dx * v[0] + dy * v[1];
      if (main <= 4) continue;
      const side = Math.abs(dx * v[1]) + Math.abs(dy * v[0]);
      const score = main + side * 2.2;
      if (score < bestScore) { bestScore = score; best = e; }
    }
    if (!best && (dir === 'up' || dir === 'down')) {   // am Rand: einmal herum
      const sorted = list.slice().sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      best = dir === 'down' ? sorted[0] : sorted[sorted.length - 1];
      if (best === cur) best = null;
    }
    if (best) { navFocus(best); sound(720, .03, 'triangle', .012); }
  }
  function navActivate() {
    const scope = navScope(); if (!scope) return;
    const cur = current(scope) || ensureFocus(scope); if (!cur) return;
    sound(880, .05, 'triangle', .018);
    cur.click();
  }
  function navBack() {
    const scope = navScope(); if (!scope) return;
    if (scope.id === 'pause') { togglePause(false); return; }
    if (scope.id === 'weaponPanel') { $('weaponPanel').hidden = true; return; }
    const b = [...scope.querySelectorAll('[data-back]')].find(e => !e.closest('[hidden]') && e.getClientRects().length);
    if (b) { sound(420, .05, 'triangle', .015); b.click(); }
  }
  function navKey(e, scope) {
    const key = e.key, t = document.activeElement;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
    if (typing && key !== 'Escape') return false;
    const dirs = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (dirs[key]) { if (!setInputMode('kbd')) navDir(dirs[key]); return true; }
    if (key === 'Enter' || key === ' ') { if (!setInputMode('kbd') && !e.repeat) navActivate(); return true; }
    if (key === 'Escape' || key === 'Backspace' || key === 'GoBack' || key === 'BrowserBack') { navBack(); return true; }
    if (scope.id === 'weaponPanel') {
      if (key === 'Tab') { $('weaponPanel').hidden = true; return true; }
      if (/^[0-9]$/.test(key)) { const w = WEAPONS[(+key + 9) % 10]; if (w) { selectWeapon(w[0]); $('weaponPanel').hidden = true; } return true; }
    }
    if (key === 'Tab') { navDir(e.shiftKey ? 'up' : 'down'); return true; }
    return false;
  }
  function updatePrompts() {
    const scope = navScope(), show = !!scope && (inputMode === 'pad' || inputMode === 'kbd');
    document.body.classList.toggle('prompts', show);
    if (!show || (!promptsDirty && promptScope === scope)) return;
    promptsDirty = false; promptScope = scope;
    const pad = inputMode === 'pad', cur = current(scope);
    const parts = [[pad ? g('a') : k('Enter'), 'Auswählen']];
    if (cur && cur.classList.contains('cycler')) parts.unshift([pad ? g('dpad') : k('← →'), 'Ändern']);
    if (scope.id !== 'menu' && scope.id !== 'result') parts.push([pad ? g('b') : k('Esc'), scope.id === 'pause' ? 'Weiter' : 'Zurück']);
    if (scope.id === 'help') parts.push([pad ? g('lb') + g('rb') : '', 'Reiter']);
    $('promptBar').innerHTML = parts.map(([a, b]) => `<span>${a}${b}</span>`).join('');
  }
  // Bestätigung ohne Browser-Dialog (Controller-tauglich)
  let confirmResolve = null;
  function ask(text, yes = 'Ja') {
    return new Promise(res => {
      $('confirmText').textContent = text; $('confirmYes').textContent = yes;
      confirmResolve = res; $('confirm').hidden = false;
      if (inputMode !== 'touch' && inputMode !== 'mouse') navFocus($('confirmNo'));
    });
  }
  function closeConfirm(v) { $('confirm').hidden = true; const r = confirmResolve; confirmResolve = null; if (r) r(v); afterOverlay(); }
  function afterOverlay() { const sc = navScope(); if (sc && (inputMode === 'pad' || inputMode === 'kbd')) ensureFocus(sc); promptsDirty = true; }
  // Steuerungs-Übersicht
  let helpMode = 'pad';
  function helpTab(d) { const order = ['pad', 'kbd', 'touch']; helpMode = order[(order.indexOf(helpMode) + d + 3) % 3]; renderHelp(); }
  function renderHelp() {
    for (const b of document.querySelectorAll('[data-help]')) b.classList.toggle('on', b.dataset.help === helpMode);
    const rows = {
      pad: [[g('ls'), 'Laufen & drehen'], [g('rs'), 'Zielen: Richtung & Winkel'], [g('rt'), 'Feuer – halten für mehr Kraft'], [g('a'), 'Sprung nach vorn'], [g('b'), 'Salto rückwärts'], [g('x'), 'Waffenliste'],
        [g('lb') + g('rb'), 'Waffe wechseln'], [g('y'), 'Übersicht der Karte'], [g('lt'), 'Ziel setzen (Luftangriff, Teleporter, Zielsuchrakete)'], [g('dpad'), 'Feinzielen'], [g('r3'), 'Zoom'], [g('select'), 'Halten: Zug beenden'], [g('start'), 'Pause'], [g('a') + g('b'), 'Im Menü: Bestätigen / Zurück']],
      kbd: [[k('W') + k('S'), 'Laufen'], [k('A') + k('D'), 'Drehen'], [k('↑') + k('↓'), 'Winkel'], [k('Leertaste'), 'Feuer – halten für mehr Kraft'], [k('Enter'), 'Sprung'], [k('⌫'), 'Salto'], [k('Tab'), 'Waffenliste'],
        [k('1') + '–' + k('0'), 'Waffe direkt'], [k('V'), 'Übersicht'], [k('Esc'), 'Pause'], ['🖱️', 'Ziehen = zielen, Klick = Ziel, Rad = Zoom'], [k('↑↓') + k('Enter'), 'Menüs & TV-Fernbedienung']],
      touch: [['🕹️', 'Stick: laufen & drehen'], ['👆', 'Bildschirm ziehen: drehen & Winkel'], ['🎯', 'Gegner/Boden antippen: hindrehen oder Ziel setzen'], ['🔴', 'FEUER halten = Kraft'], ['↗ ⤺', 'Sprung / Salto'], ['»', 'Zug beenden'], ['🤏', 'Zwei Finger: Zoom'], ['👁', 'Übersicht']]
    }[helpMode];
    $('helpBody').innerHTML = rows.map(([a, b]) => `<div><span>${a}</span><span>${b}</span></div>`).join('');
  }
  function openHelp() { helpMode = inputMode === 'pad' ? 'pad' : inputMode === 'touch' ? 'touch' : 'kbd'; renderHelp(); $('help').hidden = false; afterOverlay(); }

  // ---------- Menü & Start ----------
  const WORLD_INFO = { island: ['🌴', 'Inselgruppe & Brücken'], desert: ['🏜️', 'Tafelberge & Fluss'], snow: ['❄️', 'Zwei Burgen mit Mauern'], volcano: ['🌋', 'Ringinsel im Lavasee'] };
  const MODE_NAMES = { campaign: 'Feldzug', cpu: 'Schnelles Gefecht', local: 'Zu zweit' };
  function readSettings() { try { return JSON.parse(localStorage.getItem(SETTINGS) || '{}'); } catch (_) { return {}; } }
  function writeSettings() {
    try { localStorage.setItem(SETTINGS, JSON.stringify({ mode: $('mode').value, difficulty: $('difficulty').value, world: menuWorld, worms: $('worms').value, level: menuLevel })); } catch (_) {}
  }
  function stepSelect(sel, d) { const n = sel.options.length; sel.selectedIndex = (sel.selectedIndex + d + n) % n; }
  function cycleOpt(el, d) {
    const opt = el.dataset.opt;
    if (opt === 'mode') stepSelect($('mode'), d);
    else if (opt === 'difficulty') stepSelect($('difficulty'), d);
    else if (opt === 'worms') stepSelect($('worms'), d);
    else if (opt === 'level') { if (progress <= 1) { announceMenu('Weitere Level schaltest du im Feldzug frei'); return; } menuLevel = (menuLevel - 1 + d + progress) % progress + 1; }
    else if (opt === 'world') { const i = WORLD_ORDER.indexOf(menuWorld); menuWorld = WORLD_ORDER[(i + d + 4) % 4]; }
    else if (opt === 'sound') setSound(!soundEnabled);
    sound(d > 0 ? 620 : 540, .06, 'triangle', .02);
    refreshMenu(); writeSettings();
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }
  function announceMenu(t) { $('infoText').textContent = t; }
  function previewWorld() { return $('mode').value === 'campaign' ? levelConfig(menuLevel).world : menuWorld; }
  function refreshMenu() {
    const mode = $('mode').value, campaign = mode === 'campaign';
    menuLevel = clamp(menuLevel, 1, progress);
    $('levelRow').hidden = !campaign; $('worldRow').hidden = campaign; $('wormsRow').hidden = campaign;
    const c = levelConfig(menuLevel), world = previewWorld(), w = +$('worms').value || 4;
    $('modeVal').textContent = MODE_NAMES[mode];
    $('levelVal').textContent = menuLevel + (menuLevel === progress ? ' · NEU' : ' ✓');
    $('worldVal').textContent = WORLD_INFO[menuWorld][0] + ' ' + worlds[menuWorld].name;
    $('wormsVal').textContent = w;
    $('difficultyVal').textContent = $('difficulty').selectedOptions[0].textContent;
    $('soundVal').textContent = soundEnabled ? 'An' : 'Aus';
    $('startInfo').textContent = campaign ? `Feldzug · Level ${menuLevel}` : `${MODE_NAMES[mode]} · ${worlds[menuWorld].name}`;
    $('infoEyebrow').textContent = campaign ? 'FELDZUG · LEVEL ' + menuLevel : mode === 'local' ? 'ZU ZWEIT AN EINEM GERÄT' : 'SCHNELLES GEFECHT';
    $('infoTitle').textContent = WORLD_INFO[world][0] + ' ' + worlds[world].name;
    $('infoText').textContent = WORLD_INFO[world][1] + (campaign ? ` · ${c.mines} Minen · Wind bis ${c.windMax.toFixed(1)}` : ' · 6 Minen · 5 Ölfässer');
    $('infoRed').textContent = (campaign ? c.player : w) + ' Würmer'; $('infoBlue').textContent = (campaign ? c.enemy : w) + ' Würmer';
    $('infoBlueName').textContent = mode === 'local' ? 'TEAM BLAU' : 'COMPUTER';
    document.querySelector('.squad.red b').textContent = mode === 'local' ? 'TEAM ROT' : 'DEIN TRUPP';
    promptsDirty = true;
    if ($('menu').classList.contains('active')) scheduleAttract();
  }
  // Menü-Hintergrund: die gewählte Karte in 3D, beide Trupps stehen bereit
  let attractTimer = 0;
  function scheduleAttract() { clearTimeout(attractTimer); attractTimer = setTimeout(() => buildAttract(), 220); }
  function buildAttract(force) {
    const world = previewWorld();
    if (!force && (!$('menu').classList.contains('active') || (attract && attract.world === world))) return;
    matchId++; active = false; paused = false; celebrate = null; bot = null;
    for (const p of projectiles.slice()) removeProjectile(p);
    for (const p of particles) { scene.remove(p.mesh); if (p.own) p.mesh.material.dispose(); }
    particles = []; events = []; if (sheep) { scene.remove(sheep.mesh); sheep = null; }
    newState({ mode: 'cpu', level: 0, difficulty: 'normal', world, player: 4, enemy: 4, mines: 2, barrels: 4, skill: .5, suddenDeath: 99, windMax: 1, enemyHp: 100 });
    S.phase = 'menu'; S.current = -1;
    targetMarker.visible = false; crosshair.visible = false; arrow.visible = false; aimLine.visible = false;
    applyWorld(); buildTerrain(); addDecor(); syncBodies(); syncItems();
    attract = { world, t: Math.random() * 40, next: 1 };
  }
  function attractFrame(time, dt) {
    if (!attract) return;
    attract.t += dt; attract.next -= dt;
    if (attract.next < 0 && S.units.length) {
      attract.next = rand(.8, 1.8);
      const u = S.units[Math.floor(Math.random() * S.units.length)];
      cue(u, ['dance', 'yes', 'no', 'throw', 'jump'][Math.floor(Math.random() * 5)], 1600);
    }
    updateParticles(dt); updateBodies(time, dt);
    const a = attract.t * .07, wide = innerWidth > innerHeight;
    camera.position.set(Math.sin(a) * 27, 13.5, Math.cos(a) * 27);
    camera.lookAt(0, wide ? 1 : -3, 0);
    if (wide) { const off = innerWidth * .16; camera.setViewOffset(innerWidth, innerHeight, -off, 0, innerWidth, innerHeight); } else camera.clearViewOffset();
    water.position.y = S.water + Math.sin(time * .0012) * .05;
    for (const d of deco) d.visible = true;
    renderer.render(scene, camera);
    updatePrompts();
  }
  function config(level) {
    const mode = $('mode').value, difficulty = $('difficulty').value, adj = { easy: -.15, normal: 0, hard: .15 }[difficulty] || 0;
    if (mode === 'campaign') {
      const c = levelConfig(level);
      return { ...c, mode, level, difficulty, skill: clamp(c.skill + adj, .1, .97) };
    }
    const w = clamp(+$('worms').value || 4, 2, 8);
    return { mode, level: 0, difficulty, world: menuWorld, player: w, enemy: w, mines: 6, barrels: 5, skill: { easy: .3, normal: .6, hard: .85 }[difficulty] || .6, suddenDeath: 12, windMax: 2.6, enemyHp: 100 };
  }
  function startGame(continued, level = menuLevel) {
    matchId++; clearTimeout(attractTimer);
    for (const p of projectiles.slice()) removeProjectile(p);
    for (const p of particles) { scene.remove(p.mesh); if (p.own) p.mesh.material.dispose(); }
    particles = []; events = []; bot = null; lastBlast = null; cameraFocus = null;
    if (sheep) { scene.remove(sheep.mesh); sheep = null; }
    if (continued) { if (!loadSaved()) return; }
    else newState(config(level));
    sound(660, .18, 'triangle', .032);
    clearSpeeches(); actionDamage = 0; actionFired = false; hurtActive = false; shotsLeft = 0; gameTime = 0; acc = 0;
    active = true; paused = false; charging = false; overview = false; $('viewBtn').classList.remove('selected'); stickX = stickY = 0;
    $('pause').hidden = true; $('result').hidden = true; $('weaponPanel').hidden = true; $('confirm').hidden = true;
    celebrate = null; attract = null; camera.clearViewOffset(); $('game').classList.remove('over'); PAD.ltHeld = false; padX = padY = 0; PAD.legendKey = '';
    applyWorld(); buildTerrain(); addDecor(); syncBodies(); syncItems();
    show('game');
    if (continued) {
      Object.assign(S, { phase: 'aim', seconds: TURN_SECONDS });
      cameraAz = S.yaw; hudDirty = true;
      announce(worlds[S.world].name + ' · weiter geht’s!');
      bot = isBotTurn() ? { stage: 'think', at: 1.2 } : null;
    } else {
      S.phase = 'wait'; holdUntil = .3;
      announce((S.mode === 'campaign' ? 'Level ' + S.level + ' · ' : '') + worlds[S.world].name + ' · ' + S.units.filter(u => u.team === 0).length + ' gegen ' + S.units.filter(u => u.team === 1).length, 2600);
      nextTurn();
    }
  }
  function show(which) {
    for (const el of document.querySelectorAll('.screen')) el.classList.toggle('active', el.id === which);
    if (which === 'menu') { buildAttract(); $('continueGame').hidden = !read(); refreshMenu(); }
    for (const el of document.querySelectorAll('.nav-focus')) el.classList.remove('nav-focus');
    afterOverlay();
  }
  function toMenu() {
    paused = false; active = false; bot = null; charging = false;
    for (const id of ['pause', 'result', 'confirm', 'help']) $(id).hidden = true;
    $('weaponPanel').hidden = true; clearSpeeches();
    show('menu');
  }
  function boot() {
    updateLoad(20, 'Lade Spielregeln');
    try { setSound(localStorage.getItem('easygames.kraterkommando.sound') !== '0'); } catch (_) {}
    try { progress = Math.max(1, +JSON.parse(localStorage.getItem(PROGRESS) || '{}').unlocked || 1); } catch (_) {}
    const st = readSettings();
    $('mode').value = st.mode || (st.opponent === 'local' ? 'local' : 'campaign');
    if (st.difficulty) $('difficulty').value = st.difficulty;
    if (st.worms) $('worms').value = st.worms;
    if (worlds[st.world]) menuWorld = st.world;
    menuLevel = clamp(+st.level || progress, 1, progress);
    for (const el of document.querySelectorAll('.cycler')) el.addEventListener('click', e => {
      const arrows = el.querySelectorAll('.opt-value i');
      cycleOpt(el, e.target === arrows[0] ? -1 : 1);
    });
    $('pauseSoundBtn').onclick = () => { setSound(!soundEnabled); $('pauseSoundBtn').textContent = soundEnabled ? '🔊 Spielsound an' : '🔇 Spielsound aus'; };
    init3D();
    updateLoad(35, 'Lade 3D-Figuren');
    const ready = () => {
      updateLoad(95, 'Baue Welten');
      buildAttract(true);
      updateLoad(100, 'Bereit');
      setTimeout(() => show('menu'), 250);
    };
    loadAssets(f => updateLoad(35 + Math.round(f * 55), 'Lade 3D-Figuren')).then(ready, ready);
    $('newGame').onclick = async () => {
      if (read() && !(await ask('Das gespeicherte Gefecht durch ein neues ersetzen?', 'Neues Gefecht'))) return;
      writeSettings(); startGame(false);
    };
    $('continueGame').onclick = () => startGame(true);
    $('helpBtn').onclick = openHelp; $('pauseHelpBtn').onclick = openHelp;
    $('helpClose').onclick = () => { $('help').hidden = true; afterOverlay(); };
    for (const b of document.querySelectorAll('[data-help]')) b.onclick = () => { helpMode = b.dataset.help; renderHelp(); };
    $('cloudBtn').onclick = () => { $('cloud').hidden = false; afterOverlay(); };
    $('cloudClose').onclick = () => { $('cloud').hidden = true; afterOverlay(); };
    $('confirmYes').onclick = () => closeConfirm(true);
    $('confirmNo').onclick = () => closeConfirm(false);
    $('pauseBtn').onclick = () => togglePause();
    $('viewBtn').onclick = () => { if (!active) return; overview = !overview; $('viewBtn').classList.toggle('selected', overview); };
    $('resumeBtn').onclick = () => togglePause(false);
    $('saveQuitBtn').onclick = toMenu;
    $('restartBtn').onclick = async () => { if (await ask('Dieses Gefecht neu starten?', 'Neu starten')) startGame(false, S.level || menuLevel); };
    $('againBtn').onclick = () => startGame(false, S.level || menuLevel);
    $('nextLevelBtn').onclick = () => { menuLevel = Math.min(progress, S.level + 1); writeSettings(); startGame(false, menuLevel); };
    $('resultMenuBtn').onclick = toMenu;
    $('jumpBtn').onclick = () => jump(false);
    $('flipBtn').onclick = () => jump(true);
    $('skipBtn').onclick = passTurn;
    $('weaponBtn').onclick = openWeapons;
    $('closeWeapon').onclick = () => $('weaponPanel').hidden = true;
    $('weaponPanel').addEventListener('click', e => { if (e.target === $('weaponPanel')) $('weaponPanel').hidden = true; });
    $('weaponGrid').onclick = e => { const b = e.target.closest('[data-weapon]'); if (!b || b.disabled) return; selectWeapon(b.dataset.weapon); $('weaponPanel').hidden = true; };
    new MutationObserver(() => afterOverlay()).observe($('weaponPanel'), { attributes: true, attributeFilter: ['hidden'] });
    new MutationObserver(() => afterOverlay()).observe($('result'), { attributes: true, attributeFilter: ['hidden'] });
    addEventListener('pagehide', () => { if (active && S && S.phase !== 'over') writeSettings(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && active && !paused) togglePause(true); });
    addEventListener('gamepadconnected', () => { PAD.ready = false; });
    $('continueGame').hidden = !read();
    refreshMenu();
    if (/[?&]test\b/.test(location.search)) window.KK = { get S() { return S; }, startGame, useWeapon, selectWeapon, endTurn, explode, height, get phase() { return S && S.phase; }, set yaw(v) { S.yaw = v; }, setTime: v => { S.seconds = v; }, set autoplay(v) { autoplay = v; },
      tick(n, dt = 1 / 30) { for (let i = 0; i < n && active; i++) { update(dt); updateParticles(dt); if (hudDirty) updateHud(); } return S.phase; },
      stats: () => ({ projectiles: projectiles.length, particles: particles.length, events: events.length, scene: scene.children.length, bot: bot && bot.stage }),
      get assets() { return ASSET.ready; }, get input() { return inputMode; }, get focus() { const f = document.querySelector('.nav-focus'); return f && (f.id || f.dataset.opt || f.dataset.weapon || f.textContent.trim().slice(0, 30)); },
      anim: i => bodies[i] && bodies[i].userData.anim && bodies[i].userData.anim.cur, get target() { return S.target; }, get overview() { return overview; } };
  }
  addEventListener('load', () => {
    try { boot(); }
    catch (e) { updateLoad(100, 'Fehler beim Laden'); $('loading').querySelector('p').textContent = e.message || '3D-Grafik konnte nicht gestartet werden.'; }
  });
})();
