/* AnMaCha – Der Podcast: Senderhäuser mit Club-Feeling.
   Jeder der 13 AnMaCha-Sender hat ein eigenes Haus: eigene Raumgröße, Wände, Boden, Licht und Deko passend zu Genre und Beschreibung.
   Drinnen: Fans des Senders tanzen, chatten und haben Wünsche (Autogramm, Selfie, Tanz, Songwunsch), ein Vibe-Meter füllt sich
   beim Tanzen und Interagieren (Party-Level je Sender), Andrew ↔ Marco wechseln, Emotes, und ein eigenes 3D-Minispiel je Sender:
   „Beat“ (3D-Notenbahn auf dem Boden, Klavierlicht-Song) oder „Fang“ (Dinge des Senders fangen, Störungen ausweichen).
   Ein Bedienkonzept: laufen mit Stick/WASD, Ⓐ/Leertaste tanzen, Ⓧ/E benutzen, Ⓨ/Q wechseln, 1–3 Emotes, Ⓑ/Esc raus. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, I = AMC.Input, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const SD = AMC.Sender = {};
  let T, K = null;   // K = Werkzeuge aus home.js (Laufen, Oberfläche, Bedürfnisse)

  // ------------------------------------------------------------------ Die 13 Häuser
  // props: [art, x, z, drehung]; game: kind 'beat' | 'catch'
  const S = {
    anmacha24: { room: 'Podcastnacht-Lounge', w: 14, d: 10, wall: '#141a34', wallTex: 'stars', floor: ['carpet', '#2a2240', '#33295a'], light: 'night',
      props: [['logoBig', 0, -4.8], ['sofa', -4.6, -1, 1.2], ['sofa', 4.6, -1, -1.2], ['moon', -5.2, -4.8], ['lamp', -6.2, -3.8], ['lamp', 6.2, -3.8], ['desk', 0, -3.2]],
      game: { kind: 'catch', name: 'Podcastnacht-Hotline', good: 'phone', bad: 'static', goodTxt: 'Anrufe durchstellen', badTxt: 'Rauschen' },
      fans: ['#ff8a1e', '#1d1d24'], lines: ['Ich hör euch jede Nacht beim Einschlafen!', 'Podcastnacht ist mein Lieblingsformat ❤️', 'Musik, die mich anmacht! 🔥', 'Grüße an alle Nachteulen!'],
      talk: ['Hier läuft nachts die AnMaCha & Friends Podcastnacht. Unser Wohnzimmer!', 'Musik, die mich anmacht! Der Slogan ist von uns. Glaube ich.'] },
    ricorewi: { room: 'Ricos Tool-Labor', w: 12, d: 10, wall: '#2a2d3a', wallTex: 'tiles', floor: ['concrete', '#3a3d48', '#34363f'], light: 'cool', rico: true,
      props: [['screens', 0, -4.8], ['desk', -3.2, -3.2], ['ring', -5, -3.6], ['pc', 3.6, -3.4], ['phones', 4.6, 0]],
      game: { kind: 'catch', name: 'Ricos Like-Regen', good: 'like', bad: 'bug', goodTxt: 'Likes fangen', badTxt: 'Bugs' },
      fans: ['#5b2d8c', '#ffd45a'], lines: ['Rico, wann kommt das neue Tool?', 'Ich hab euch alle abonniert! Doppelt!', 'Story-Post incoming 📱', 'Familie! RicoReWi Radio!'],
      talk: ['Rico hat hier 14 Bildschirme. Für EIN Tool.', 'Familiensender! Rico nennt das „Content-Ökosystem“.'] },
    'yourtime-fm': { room: 'Reise-Lounge', w: 13, d: 10, wall: '#bfe6f5', wallTex: 'sky', floor: ['sand', '#e8d29a', '#dcc286'], light: 'sun',
      props: [['map', 0, -4.8], ['palm', -5.4, -3.4], ['palm', 5.4, -3.4], ['camper', 3.4, -3.2], ['suitcase', -3, -3.4], ['globe', -5.2, 0.4], ['deck', 5, 0.6, -0.6]],
      game: { kind: 'catch', name: 'Koffer packen', good: 'souvenir', bad: 'cloud', goodTxt: 'Souvenirs einpacken', badTxt: 'Regenwolken' },
      fans: ['#2fd3a0', '#ffffff'], hat: '#ffd23f', lines: ['Nächster Halt: Abenteuer! 🧭', 'Fahrt ihr mit Gisela nach Italien?', 'Feelgood pur hier!', 'Ich nehm euch mit in den Urlaub – im Ohr!'],
      talk: ['YourTime-FM: Reisen, Freizeit, Feelgood. Gisela wäre hier Stammgast.', 'Nächstes Abenteuer? Ich sag nur: Roadtrip!'] },
    chartradio24: { room: 'Chart-Show-Bühne', w: 14, d: 10, wall: '#2a1424', wallTex: 'glitter', floor: ['stage', '#141018', '#ffd23f'], light: 'stage',
      props: [['podium', 0, -3.6], ['board', 5.2, -4.6], ['trophy', -5, -3.6], ['spot', -4, -1], ['spot', 4, -1]],
      game: { kind: 'beat', name: 'Hit-Parade', hard: false },
      fans: ['#ff4f6d', '#ffffff'], lines: ['Wer ist diese Woche auf Platz 1?! 🏆', 'Ich vote jeden Tag!', 'Die Hits laufen hier rauf und runter!', 'Charts, Charts, Charts!'],
      talk: ['Die aktuellen Hits! Wer ist diese Woche auf Platz 1?', 'Ich wollte mal in die Charts. Mit Kabelsalat-Geräuschen.'] },
    clubradio24: { room: 'Club', w: 16, d: 12, wall: '#0c0818', wallTex: 'neon', floor: ['led', '#120a20', '#a46cff'], light: 'club',
      props: [['djbooth', 0, -4.6], ['disco', 0, -0.5], ['speaker', -6.6, -4.8], ['speaker', 6.6, -4.8], ['bar', -6.8, 1, Math.PI / 2]],
      game: { kind: 'beat', name: 'DJ-Set', hard: false },
      fans: ['#a46cff', '#3dd6ff', '#ff3da8'], lines: ['Bass! Mehr Bass! 🔊', 'Erlebe den Beat! 🪩', 'Die ganze Nacht durchtanzen!', 'DJ, noch einen!', 'Clubradio24 auf voll 🔥'],
      talk: ['Dance und House! Erlebe den Beat!', 'Andrew tanzt hier immer. Marco zählt die Kabel.'] },
    'special-radio': { room: 'Gala-Studio', w: 14, d: 10, wall: '#3a0c14', wallTex: 'curtain', floor: ['parquet', '#5a3a24', '#6b4a30'], light: 'stage',
      props: [['carpet', 0, -1], ['stage', 0, -3.8], ['stars', 0, -4.6], ['standMic', 0, -3.6], ['spot', -4.5, -2], ['spot', 4.5, -2]],
      game: { kind: 'catch', name: 'Sternschnuppen-Special', good: 'star', bad: 'static', goodTxt: 'Sterne fangen', badTxt: 'Rauschen' },
      fans: ['#5fb8ff', '#1d1d24'], hat: '#1d1d24', lines: ['Heute ein ganz besonderes Special ✨', 'Ich hab mich extra schick gemacht!', 'Roter Teppich für AnMaCha!', 'Specials sind die besten Folgen!'],
      talk: ['Specials, Specials, Specials. Heute: Ein Special über Specials.', 'Hier laufen die besonderen Sendungen. So wie wir.'] },
    kultradio24: { room: 'Retro-Zimmer 80er/90er', w: 13, d: 10, wall: '#1a0c2a', wallTex: 'grid80', floor: ['checker', '#ff9fd0', '#1a1a1a'], light: 'neon',
      props: [['tapes', -3.5, -4.6], ['arcade', 4, -4.2], ['arcade', 5.4, -4.2], ['boombox', 0, -4], ['neon1996', 0, -4.85]],
      game: { kind: 'beat', name: 'Kassetten-Kult', hard: false },
      fans: ['#ff9fd0', '#3dd6ff', '#ffd23f'], lines: ['Kassette mit Bleistift zurückspulen! 📼', '90er-Party forever!', 'Wer kennt noch Gameboys?', 'Die Kult-Hits sind die besten!'],
      talk: ['Kult-Hits der 80er und 90er! Kassetten zurückspulen mit dem Bleistift!', '1996er Party-Vibes. Leckmuschel inklusive.'] },
    rockradio24: { room: 'Rock-Bühne', w: 15, d: 11, wall: '#2a1a16', wallTex: 'brick', floor: ['stage', '#1a1412', '#e0503a'], light: 'rock',
      props: [['stage', 0, -4], ['drums', 0, -4.4], ['amp', -4.5, -4.4], ['amp', 4.5, -4.4], ['guitar', -2.6, -4.6], ['guitar', 2.6, -4.6]],
      game: { kind: 'beat', name: 'Gitarren-Solo', hard: true },
      fans: ['#1d1d24', '#e0503a'], lines: ['Rock’n’Roll! 🤘', 'Lauter! LAUTER!', 'Gitarren und Gas!', 'Headbangen bis die Mütze fliegt!'],
      talk: ['Gitarren und Gas! Hier wurde der Rauschkönig besiegt.', 'Lautstärke 11. Mindestens.'] },
    zockerfm: { room: 'Gaming-Arena', w: 14, d: 10, wall: '#0a1410', wallTex: 'circuit', floor: ['grid', '#0c1a12', '#6cff8a'], light: 'neonGreen',
      props: [['bigscreen', 0, -4.8], ['pc', -4.4, -3.4], ['pc', -1.6, -3.4], ['pc', 1.6, -3.4], ['pc', 4.4, -3.4], ['arcade', -6, 0.5, Math.PI / 2]],
      game: { kind: 'catch', name: 'Power-Up-Jagd', good: 'coin', bad: 'lag', goodTxt: 'Power-Ups sammeln', badTxt: 'Lag-Blöcke' },
      fans: ['#6cff8a', '#1d1d24'], hat: '#6cff8a', lines: ['GG! 🎮', 'Ein Level noch!', 'Wer zockt mit?', 'Musik zum Zocken ist die beste!'],
      talk: ['Musik zum Zocken! Rico hat hier den Highscore. Angeblich.', 'Ein Level noch. Dann nehmen wir auf.'] },
    rapradio24: { room: 'Hinterhof-Studio', w: 13, d: 10, wall: '#5a4a40', wallTex: 'graffiti', floor: ['concrete', '#4a4a4e', '#444448'], light: 'street',
      props: [['turntable', 0, -4], ['boombox', -4, -4], ['hoop', 5.6, -4.6], ['crates', -5.4, -1], ['standMic', 2, -3.6]],
      game: { kind: 'beat', name: 'Freestyle-Battle', hard: true },
      fans: ['#ffcf3a', '#1d1d24'], hat: '#1d1d24', lines: ['Mic check! 🎤', 'Der Beat ist krass!', 'Flow wie ein Wasserfall!', 'Rap, R&B und Groove!'],
      talk: ['Rap, R&B und Groove. Marco hat einen Reim versucht. Wir reden nicht drüber.', 'Mikro check, eins zwei! Andrew, nicht so laut!'] },
    schlagerpop24: { room: 'Schlager-Party', w: 14, d: 10, wall: '#4a1a34', wallTex: 'hearts', floor: ['parquet', '#7a4a3a', '#8a5a44'], light: 'party',
      props: [['glitter', 0, -4.85], ['stage', 0, -4], ['hearts', 0, -4.5], ['disco', 0, -0.5], ['bar', 6.4, -1, -Math.PI / 2]],
      game: { kind: 'beat', name: 'Mitsing-Hit', hard: false },
      fans: ['#ff6fb0', '#ffffff'], lines: ['Alle zusammen! 💖', 'Hände hoch und mitsingen!', 'Schlager ist Gefühl!', 'Noch eine Runde Discofox?'],
      talk: ['Schlager und Gefühl! Hier wird jeder zum Mitsänger.', 'Hier wird geschunkelt, bis die Kabel glühen.'] },
    christmasradio24: { room: 'Weihnachtshütte', w: 12, d: 9, wall: '#6b4a30', wallTex: 'wood', floor: ['wood', '#7a5434', '#6a4628'], light: 'warm',
      props: [['fireplace', 0, -4.3], ['tree', -4.4, -3.2], ['gifts', -3.4, -2], ['snowwin', 3.6, -4.35], ['sofa', 4.2, -1.2, -1.4]],
      game: { kind: 'catch', name: 'Geschenke-Regen', good: 'gift', bad: 'coal', goodTxt: 'Geschenke fangen', badTxt: 'Kohle' },
      fans: ['#d8342c', '#2f7a3a', '#ffffff'], hat: '#d8342c', lines: ['Frohe Weihnachten – auch im August! 🎄', 'Ich hab schon alle Geschenke! Na gut, keins.', 'Glühwein für alle!', 'Last Christmas läuft hier 24/7'],
      talk: ['Weihnachtsmusik – das ganze Jahr! Auch im August.', 'Ich kauf die Geschenke an Heiligabend. Hier gibt es sie das ganze Jahr.'] },
    radiofloh: { room: 'Kinderradio-Spielzimmer', w: 12, d: 9, wall: '#fff1d8', wallTex: 'dots', floor: ['kids', '#ffd8a0', '#a0e0ff'], light: 'sun',
      props: [['fox', -4.3, -3.2], ['blocks', 4.2, -3.4], ['ballpit', 3.6, 0], ['desk', 0, -3.2]],
      game: { kind: 'catch', name: 'Floh-Fang', good: 'ball', bad: 'puddle', goodTxt: 'Bälle fangen', badTxt: 'Matschbälle' },
      fans: ['#ffa94d', '#a0e0ff', '#ff6fb0'], lines: ['Der Fuchs ist der Chef! 🦊', 'Darf ich mal ans Mikro?', 'RadioFloh ist das Beste!', 'Noch ein Lied! Noch ein Lied!'],
      talk: ['Das Kinderradio! Der Fuchs hier ist der Chef.', 'RadioFloh – hier sind wir ausnahmsweise die Erwachsenen.'] }
  };
  SD.HOUSES = S;
  SD.RUB = { anmacha24: 'feel', ricorewi: 'tech', 'yourtime-fm': 'feel', chartradio24: 'musik', clubradio24: 'musik', 'special-radio': 'tv', kultradio24: 'musik', rockradio24: 'musik', zockerfm: 'tech', rapradio24: 'musik', schlagerpop24: 'musik', christmasradio24: 'feel', radiofloh: 'tv' };

  // ------------------------------------------------------------------ Texturen
  const hex = c => new T.Color(c).getHex();
  function wallTexture(kind, base, accent) {
    return W.canvasTex(256, 128, (c, w, h) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      const r = (a, b) => a + Math.random() * (b - a);
      if (kind === 'stars') { for (let i = 0; i < 90; i++) { c.fillStyle = 'rgba(255,255,240,' + r(0.3, 1) + ')'; c.fillRect(r(0, w), r(0, h), 2, 2); } }
      else if (kind === 'tiles') { c.strokeStyle = 'rgba(255,255,255,.12)'; for (let x = 0; x < w; x += 32) for (let y = 0; y < h; y += 32) c.strokeRect(x, y, 32, 32); }
      else if (kind === 'sky') { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7cc8f0'); g.addColorStop(1, '#dff4ff'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.9)'; for (let i = 0; i < 6; i++) { const x = r(0, w), y = r(10, 60); c.beginPath(); c.arc(x, y, 12, 0, 7); c.arc(x + 14, y - 4, 15, 0, 7); c.arc(x + 30, y, 11, 0, 7); c.fill(); } }
      else if (kind === 'glitter') { for (let i = 0; i < 400; i++) { c.fillStyle = Math.random() < 0.5 ? '#ffd23f' : '#ff6fb0'; c.globalAlpha = r(0.2, 0.9); c.fillRect(r(0, w), r(0, h), 2, 2); } c.globalAlpha = 1; }
      else if (kind === 'neon') { c.lineWidth = 3; ['#a46cff', '#3dd6ff', '#ff3da8'].forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.moveTo(0, 30 + i * 30); for (let x = 0; x <= w; x += 32) c.lineTo(x, 30 + i * 30 + (x / 32 % 2 ? 12 : -12)); c.stroke(); }); }
      else if (kind === 'curtain') { for (let x = 0; x < w; x += 16) { const g = c.createLinearGradient(x, 0, x + 16, 0); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(0.5, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(x, 0, 16, h); } c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w, 6); }
      else if (kind === 'grid80') { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a0c2a'); g.addColorStop(1, '#ff3da8'); c.fillStyle = g; c.fillRect(0, h * 0.55, w, h); c.strokeStyle = '#3dd6ff'; c.lineWidth = 1.5; for (let x = -w; x < w * 2; x += 24) { c.beginPath(); c.moveTo(w / 2, h * 0.55); c.lineTo(x, h); c.stroke(); } for (let y = h * 0.6; y < h; y += 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(w / 2, h * 0.5, 26, Math.PI, 0); c.fill(); }
      else if (kind === 'brick' || kind === 'graffiti') { c.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 0; y < h; y += 16) { c.fillRect(0, y, w, 2); for (let x = (y / 16 % 2) * 16; x < w; x += 32) c.fillRect(x, y, 2, 16); } if (kind === 'graffiti') { c.font = '900 40px Fredoka, sans-serif'; c.lineWidth = 5; [['FLOW', 20, 60, '#ffcf3a'], ['RAP24', 130, 100, '#ff3da8'], ['🎤', 200, 50, '#fff']].forEach(([t, x, y, col]) => { c.strokeStyle = '#111'; c.strokeText(t, x, y); c.fillStyle = col; c.fillText(t, x, y); }); } }
      else if (kind === 'circuit') { c.strokeStyle = '#6cff8a'; c.globalAlpha = 0.5; c.lineWidth = 2; for (let i = 0; i < 14; i++) { let x = r(0, w), y = r(0, h); c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) x += r(-40, 40); else y += r(-30, 30); c.lineTo(x, y); } c.stroke(); c.fillStyle = '#6cff8a'; c.fillRect(x - 3, y - 3, 6, 6); } c.globalAlpha = 1; }
      else if (kind === 'hearts') { c.font = '24px sans-serif'; for (let i = 0; i < 26; i++) { c.globalAlpha = r(0.3, 0.8); c.fillText(Math.random() < 0.5 ? '💖' : '✨', r(0, w), r(20, h)); } c.globalAlpha = 1; }
      else if (kind === 'wood') { for (let y = 0; y < h; y += 14) { c.fillStyle = y / 14 % 2 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.05)'; c.fillRect(0, y, w, 14); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(0, y, w, 1); } }
      else if (kind === 'dots') { ['#ff6fb0', '#a0e0ff', '#ffd23f', '#6cff8a'].forEach(col => { c.fillStyle = col; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(r(0, w), r(0, h), r(5, 11), 0, 7); c.fill(); } }); }
      if (accent) { c.fillStyle = accent; c.fillRect(0, h - 5, w, 5); }
    }, [3, 1]);
  }
  function floorTexture(f) {
    const [kind, a, b] = f;
    return W.canvasTex(256, 256, (c, w, h) => {
      c.fillStyle = a; c.fillRect(0, 0, w, h);
      if (kind === 'checker' || kind === 'kids') { const cols = kind === 'kids' ? ['#ffd8a0', '#a0e0ff', '#ff9fd0', '#bfffbf'] : [a, b]; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = cols[(x + y * (kind === 'kids' ? 3 : 1)) % cols.length]; c.fillRect(x * 32, y * 32, 32, 32); } }
      else if (kind === 'carpet' || kind === 'concrete' || kind === 'sand') { for (let i = 0; i < 3000; i++) { c.fillStyle = Math.random() < 0.5 ? b : 'rgba(0,0,0,.1)'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }
      else if (kind === 'parquet' || kind === 'wood') { for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 40; x < w + 80; x += 80) { c.fillStyle = Math.random() < 0.5 ? a : b; c.fillRect(x, y, 78, 30); } }
      else if (kind === 'stage') { c.fillStyle = 'rgba(255,255,255,.05)'; for (let y = 0; y < h; y += 32) c.fillRect(0, y, w, 1); c.fillStyle = b; c.fillRect(0, h - 6, w, 6); }
      else if (kind === 'grid' || kind === 'led') { c.strokeStyle = b; c.globalAlpha = 0.5; c.lineWidth = 2; for (let x = 0; x <= w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); c.beginPath(); c.moveTo(0, x); c.lineTo(w, x); c.stroke(); } c.globalAlpha = 1; }
    }, [3, 3]);
  }

  // ------------------------------------------------------------------ Deko-Bausteine
  function prop(kind, g, x, z, ry, st, R) {
    const p = new T.Group(); p.position.set(x, 0, z); p.rotation.y = ry || 0; g.add(p);
    const col = hex(st.color), Mt = (c, o) => W.mat(c, o || { r: 0.6 }), B = (w, h, d, c, px, py, pz, o) => W.box(w, h, d, Mt(c, o), px, py, pz, p, false);
    const ball = (r, c, px, py, pz, o) => { const m = new T.Mesh(new T.SphereGeometry(r, 16, 12), Mt(c, o)); m.position.set(px, py, pz); p.add(m); return m; };
    const plane = (tex, w, h, py, pz) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true })); m.position.set(0, py, pz || 0); p.add(m); return m; };
    const glow = c => ({ e: c, ei: 1.2 });
    switch (kind) {
      case 'logoBig': { const t = new T.TextureLoader().load(AMC.UI.podLogo); t.encoding = T.sRGBEncoding; B(3.4, 3.4, 0.1, 0x111111, 0, 2.2, -0.05); plane(t, 3.2, 3.2, 2.2, 0.02); break; }
      case 'sofa': B(2.6, 0.45, 1, 0x3a2f58, 0, 0.32, 0); B(2.6, 0.7, 0.25, 0x3a2f58, 0, 0.75, -0.45); B(0.25, 0.6, 1, 0x3a2f58, -1.3, 0.5, 0); B(0.25, 0.6, 1, 0x3a2f58, 1.3, 0.5, 0); B(0.5, 0.3, 0.2, col, -0.6, 0.7, -0.25); break;
      case 'moon': { const m = ball(0.7, 0xfff4c8, 0, 2.6, 0, { e: 0xfff1b0, ei: 1 }); m.scale.z = 0.25; break; }
      case 'lamp': W.cyl(0.05, 0.05, 1.8, Mt(0x222222), 0, 0.9, 0, p, 8); W.cyl(0.35, 0.22, 0.4, Mt(0xffe0a0, { e: 0xffb050, ei: 1.1 }), 0, 1.9, 0, p, 14); break;
      case 'desk': B(3, 0.85, 1.1, 0x2a2c36, 0, 0.43, 0); B(3.1, 0.06, 1.2, col, 0, 0.88, 0, glow(col)); [-0.8, 0.8].forEach(o => { W.cyl(0.025, 0.025, 0.45, Mt(0x222222), o, 1.13, 0.2, p, 6); ball(0.1, 0x9aa0ad, o, 1.4, 0.2, { m: 0.8, r: 0.3 }); }); B(0.3, 0.2, 0.3, 0xff2a2a, 0, 1.0, -0.3, glow(0xff2a2a)); break;
      case 'screens': for (let i = 0; i < 12; i++) { const c = [0x3dd6ff, 0xa46cff, 0xffd45a, 0x6cff8a][i % 4]; B(1.3, 0.75, 0.06, 0x111111, -2.8 + (i % 5) * 1.4, 1.3 + Math.floor(i / 5) * 0.9, 0); B(1.2, 0.66, 0.02, c, -2.8 + (i % 5) * 1.4, 1.3 + Math.floor(i / 5) * 0.9, 0.04, glow(c)); } break;
      case 'ring': { const r = new T.Mesh(new T.TorusGeometry(0.45, 0.05, 8, 24), Mt(0xffffff, { e: 0xffffff, ei: 1.5 })); r.position.y = 1.7; p.add(r); W.cyl(0.03, 0.03, 1.5, Mt(0x333333), 0, 0.75, 0, p, 6); break; }
      case 'pc': B(1.5, 0.06, 0.8, 0x2a2a2e, 0, 0.78, 0); B(0.9, 0.5, 0.04, 0x111111, 0, 1.15, -0.25); B(0.84, 0.44, 0.02, col, 0, 1.15, -0.22, glow(col)); B(0.3, 0.6, 0.6, 0x16171c, 0.6, 0.3, 0); B(0.04, 0.5, 0.5, col, 0.76, 0.3, 0, glow(col)); B(0.6, 0.9, 0.6, 0x1d1d24, 0, 0.45, 0.8); break;
      case 'phones': B(1.4, 0.9, 0.6, 0x8a6a48, 0, 0.45, 0); for (let i = 0; i < 4; i++) B(0.14, 0.26, 0.02, 0x111111, -0.45 + i * 0.3, 1.05, 0); break;
      case 'map': { const t = W.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#4fb8e8'; c.fillRect(0, 0, w, h); c.fillStyle = '#7bd36a'; [[40, 40, 40, 30], [110, 30, 50, 40], [170, 60, 40, 30], [70, 90, 30, 20], [200, 25, 30, 20]].forEach(([x, y, a, b]) => { c.beginPath(); c.ellipse(x, y, a, b, 0.3, 0, 7); c.fill(); }); c.strokeStyle = '#ff3a3a'; c.setLineDash([6, 5]); c.lineWidth = 3; c.beginPath(); c.moveTo(40, 40); c.quadraticCurveTo(120, 0, 180, 60); c.stroke(); }); B(5.2, 2.7, 0.08, 0x8a6a48, 0, 2, -0.04); plane(t, 5, 2.5, 2, 0.02); break; }
      case 'palm': W.cyl(0.14, 0.2, 2.6, Mt(0x8a6a48), 0, 1.3, 0, p, 8); for (let i = 0; i < 6; i++) { const l = B(1.6, 0.05, 0.4, 0x3f9f4a, Math.cos(i) * 0.6, 2.6, Math.sin(i) * 0.6); l.rotation.y = -i; l.rotation.z = -0.35; } break;
      case 'camper': if (AMC.StudioEdit && AMC.StudioEdit.camper) { const c = AMC.StudioEdit.camper(0.45); c.position.set(0, 1.0, 0); c.rotation.y = 0.4; p.add(c); B(1.6, 0.05, 1, 0x5a4030, 0, 0.96, 0); B(0.1, 0.95, 0.1, 0x5a4030, 0, 0.47, 0); } break;
      case 'suitcase': B(0.8, 0.6, 0.3, 0xd8342c, 0, 0.3, 0); B(0.3, 0.06, 0.06, 0x111111, 0, 0.66, 0); B(0.6, 0.45, 0.3, 0x2fd3a0, 0.7, 0.23, 0.1); break;
      case 'globe': { W.cyl(0.05, 0.25, 0.9, Mt(0x8a6a48), 0, 0.45, 0, p, 10); const b = ball(0.42, 0x3a8be0, 0, 1.3, 0, { r: 0.5 }); b.userData.spin = 0.6; break; }
      case 'deck': B(0.8, 0.1, 1.8, 0xff8a1e, 0, 0.4, 0); B(0.8, 0.9, 0.1, 0xff8a1e, 0, 0.8, -0.9).rotation.x = -0.5; break;
      case 'podium': [[0, 1.2, 0xffd23f, '1'], [-1.6, 0.8, 0xc0c0c8, '2'], [1.6, 0.5, 0xc8803a, '3']].forEach(([px, h, c, n]) => { B(1.5, h, 1.2, c, px, h / 2, 0, { m: 0.5, r: 0.3 }); const t = W.textTex([n], { w: 64, h: 64, size: 48, bg: '#111', accent: '#fff' }); const m = new T.Mesh(new T.PlaneGeometry(0.5, 0.5), new T.MeshBasicMaterial({ map: t })); m.position.set(px, h / 2, 0.61); p.add(m); }); break;
      case 'board': { B(2.6, 3, 0.08, 0x16171c, 0, 2, 0); ['1 AnMaCha24', '2 Clubradio', '3 Rockradio', '4 Kultradio', '5 Schlager'].forEach((l, i) => { const t = W.textTex([l], { w: 256, h: 48, size: 28, bg: '#22111d', accent: st.color }); const m = new T.Mesh(new T.PlaneGeometry(2.3, 0.42), new T.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(0, 3.1 - i * 0.5, 0.05); p.add(m); }); break; }
      case 'trophy': B(0.6, 1, 0.6, 0x3a3d4a, 0, 0.5, 0); W.cyl(0.22, 0.1, 0.45, Mt(0xffc23a, { m: 0.8, r: 0.25 }), 0, 1.25, 0, p, 12); break;
      case 'spot': { W.cyl(0.25, 0.15, 0.5, Mt(0x111111), 0, 3.3, 0, p, 10); const c = new T.Mesh(new T.CylinderGeometry(0.1, 1.1, 3.2, 18, 1, true), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false })); c.position.y = 1.6; p.add(c); break; }
      case 'djbooth': B(5, 0.5, 2.2, 0x1a1428, 0, 0.25, 0); B(3, 1.1, 0.9, 0x111111, 0, 1.05, 0.2); B(3.02, 0.08, 0.92, col, 0, 1.62, 0.2, glow(col)); [-0.8, 0.8].forEach(o => { const t = W.cyl(0.32, 0.32, 0.05, Mt(0x222222), o, 1.68, 0.2, p, 18); t.userData.spin = 6; }); B(5, 0.1, 0.1, col, 0, 0.5, 1.1, glow(col)); break;
      case 'disco': { const b = ball(0.55, 0xdddddd, 0, 3.4, 0, { m: 1, r: 0.12, e: col, ei: 0.25 }); b.userData.spin = 1.2; W.cyl(0.02, 0.02, 0.6, Mt(0x888888), 0, 3.95, 0, p, 6); break; }
      case 'speaker': B(1.2, 2.4, 0.9, 0x111111, 0, 1.2, 0); [0.6, 1.5].forEach(y => W.cyl(0.32, 0.32, 0.05, Mt(0x333333), 0, y, 0.46, p, 18).rotation.x = Math.PI / 2); break;
      case 'bar': B(4, 1.1, 0.8, 0x2a1a3a, 0, 0.55, 0); B(4.1, 0.08, 0.9, col, 0, 1.12, 0, glow(col)); for (let i = 0; i < 6; i++) W.cyl(0.06, 0.06, 0.3, Mt([0x3dd6ff, 0xffd23f, 0xff3da8][i % 3], { e: 0x222222 }), -1.5 + i * 0.6, 1.3, 0, p, 8); break;
      case 'carpet': B(2.2, 0.03, 7, 0xb01a24, 0, 0.18, 0); break;
      case 'stage': B(R.w * 0.6, 0.5, 2.6, 0x1a1414, 0, 0.25, 0); B(R.w * 0.6, 0.06, 0.1, col, 0, 0.5, 1.3, glow(col)); break;
      case 'stars': for (let i = 0; i < 9; i++) { const s = ball(0.14, 0xffd23f, (i - 4) * 0.7, 3 + Math.sin(i * 2) * 0.4, 0, { e: 0xffd23f, ei: 1.5 }); s.userData.spin = 2; } break;
      case 'standMic': W.cyl(0.25, 0.25, 0.04, Mt(0x222222), 0, 0.52, 0, p, 12); W.cyl(0.02, 0.02, 1.2, Mt(0x333333), 0, 1.1, 0, p, 6); ball(0.09, 0x9aa0ad, 0, 1.75, 0, { m: 0.8, r: 0.3 }); break;
      case 'tapes': B(3, 2.4, 0.12, 0x2a2a2a, 0, 1.8, 0); for (let i = 0; i < 24; i++) B(0.42, 0.26, 0.06, [0xff9fd0, 0x3dd6ff, 0xffd23f, 0x6cff8a][i % 4], -1.2 + (i % 6) * 0.48, 0.9 + Math.floor(i / 6) * 0.5, 0.08); break;
      case 'arcade': B(0.9, 1.8, 0.8, 0x2a1a4a, 0, 0.9, 0); B(0.7, 0.5, 0.04, col, 0, 1.4, 0.41, glow(col)); B(0.92, 0.25, 0.82, col, 0, 1.9, 0, { e: col, ei: 0.6 }); B(0.8, 0.08, 0.3, 0x111111, 0, 1.0, 0.5); break;
      case 'boombox': B(1.4, 0.7, 0.4, 0x2a2a2e, 0, 0.35, 0); [-0.4, 0.4].forEach(o => W.cyl(0.22, 0.22, 0.05, Mt(0x555555), o, 0.38, 0.21, p, 16).rotation.x = Math.PI / 2); B(1.2, 0.06, 0.06, 0xc0c0c0, 0, 0.8, 0); break;
      case 'neon1996': { const t = W.textTex(['1996'], { w: 256, h: 96, size: 64, bg: 'rgba(0,0,0,0)', fg: '#ff3da8', accent: '#3dd6ff' }); plane(t, 2.4, 0.9, 3, 0.02); break; }
      case 'drums': [[0, 0, 0.5], [-0.7, 0.35, 0.32], [0.7, 0.35, 0.32]].forEach(([px, pz, r]) => W.cyl(r, r, 0.45, Mt(0xe0503a, { r: 0.3, m: 0.3 }), px, 0.75, pz, p, 16)); W.cyl(0.3, 0.3, 0.03, Mt(0xffd23f, { m: 0.9, r: 0.2 }), 1.0, 1.5, -0.1, p, 16); break;
      case 'amp': B(1.4, 2.2, 0.8, 0x111111, 0, 1.1, 0); B(1.2, 1.9, 0.02, 0x333333, 0, 1.1, 0.41); B(1.42, 0.2, 0.82, 0xc8a070, 0, 2.3, 0); break;
      case 'guitar': { const b = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.1, 16), Mt(col)); b.rotation.x = Math.PI / 2; b.position.y = 0.8; p.add(b); B(0.08, 1, 0.05, 0x5a4030, 0, 1.4, 0); break; }
      case 'bigscreen': { B(6, 3, 0.1, 0x111111, 0, 2.2, 0); const t = W.textTex(['ZOCKER-FM', 'Highscore: Rico'], { w: 512, h: 256, size: 70, bg: '#0a1a10', fg: '#6cff8a', accent: '#ffffff' }); plane(t, 5.7, 2.8, 2.2, 0.06); break; }
      case 'turntable': B(2.4, 1, 1, 0x111111, 0, 0.5, 0); [-0.6, 0.6].forEach(o => { const t = W.cyl(0.35, 0.35, 0.05, Mt(0x222222), o, 1.03, 0, p, 18); t.userData.spin = 5; }); B(2.42, 0.06, 1.02, col, 0, 1.0, 0, glow(col)); break;
      case 'hoop': W.cyl(0.06, 0.06, 3, Mt(0x555555), 0, 1.5, 0, p, 8); B(1.2, 0.8, 0.05, 0xffffff, 0, 3, 0.1); { const r = new T.Mesh(new T.TorusGeometry(0.25, 0.03, 6, 16), Mt(0xff5a1a)); r.rotation.x = Math.PI / 2; r.position.set(0, 2.7, 0.4); p.add(r); } break;
      case 'crates': [[0, 0], [0.7, 0], [0.35, 0.6]].forEach(([px, py]) => B(0.65, 0.6, 0.65, 0x7a5a3a, px, 0.3 + py, 0)); break;
      case 'glitter': for (let i = 0; i < 40; i++) B(0.08, 3.4, 0.02, [0xff6fb0, 0xffd23f, 0xffffff][i % 3], -4 + i * 0.2, 2, 0, { m: 0.9, r: 0.2, e: 0x442233, ei: 1 }); break;
      case 'hearts': for (let i = 0; i < 7; i++) { const h = ball(0.25, i % 2 ? 0xff6fb0 : 0xff3a6a, (i - 3) * 0.9, 2.6 + Math.sin(i) * 0.3, 0, { e: 0xff3a6a, ei: 0.6 }); h.scale.set(1, 0.85, 0.5); } break;
      case 'fireplace': B(3, 2.2, 0.8, 0x8a8a8a, 0, 1.1, 0); B(1.6, 1, 0.1, 0x111111, 0, 0.6, 0.38); { const f = ball(0.35, 0xff7a20, 0, 0.45, 0.3, { e: 0xff5a10, ei: 1.6 }); f.scale.y = 1.4; R.fire = f; } B(3.4, 0.15, 1, 0x6b4a30, 0, 2.25, 0); break;
      case 'tree': W.cyl(0.12, 0.15, 0.6, Mt(0x6b4a30), 0, 0.3, 0, p); [[1.2, 1.2], [0.9, 2.0], [0.55, 2.7]].forEach(([r, y]) => W.cyl(0, r, 1.0, Mt(0x2f7a3a), 0, y, 0, p, 10)); ball(0.16, 0xffd23f, 0, 3.3, 0, { e: 0xffd23f, ei: 1.5 }); for (let i = 0; i < 10; i++) ball(0.08, [0xff3a3a, 0xffd23f, 0x3dd6ff][i % 3], Math.cos(i) * 0.8, 1.2 + (i % 4) * 0.4, Math.sin(i) * 0.8, { e: 0xffffff, ei: 0.4 }); break;
      case 'gifts': [[0, 0, 0xff3a3a], [0.6, 0.2, 0x3dd6ff], [-0.5, 0.3, 0xffd23f], [0.2, -0.5, 0xa46bff]].forEach(([px, pz, c], i) => { const h = 0.3 + (i % 2) * 0.2; B(0.45, h, 0.45, c, px, h / 2, pz); B(0.08, h + 0.02, 0.47, 0xffffff, px, h / 2, pz); }); break;
      case 'snowwin': { const t = W.canvasTex(128, 96, (c, w, h) => { c.fillStyle = '#20304a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; for (let i = 0; i < 80; i++) c.fillRect(Math.random() * w, Math.random() * h, 2, 2); c.fillRect(0, h - 14, w, 14); }); B(2.2, 1.6, 0.06, 0x6b4a30, 0, 2, -0.03); plane(t, 2, 1.4, 2, 0.01); break; }
      case 'fox': ball(0.9, 0xffa94d, 0, 0.9, 0); ball(0.6, 0xffa94d, 0, 2.1, 0); [-0.35, 0.35].forEach(o => W.cyl(0, 0.2, 0.5, Mt(0xffa94d), o, 2.75, 0, p, 6)); ball(0.2, 0xffffff, 0, 2.0, 0.5); ball(0.07, 0x111111, 0, 2.05, 0.68); break;
      case 'blocks': [[0, 0, 0xff3a3a], [0.6, 0, 0x3dd6ff], [0.3, 0.55, 0xffd23f], [-0.6, 0.1, 0x6cff8a], [-0.3, 0.6, 0xa46cff]].forEach(([px, py, c]) => B(0.5, 0.5, 0.5, c, px, 0.25 + py, 0)); break;
      case 'ballpit': { B(2.4, 0.5, 2.4, 0x3dd6ff, 0, 0.25, 0); const cs = [0xff3a3a, 0xffd23f, 0x6cff8a, 0xa46cff, 0xffffff]; for (let i = 0; i < 26; i++) ball(0.16, cs[i % 5], (Math.random() - 0.5) * 2, 0.55, (Math.random() - 0.5) * 2); break; }
    }
    return p;
  }
  const SOLID = { sofa: 1.2, desk: 1.3, pc: 0.9, phones: 0.8, palm: 0.4, camper: 0.9, suitcase: 0.6, globe: 0.4, deck: 0.6, podium: 2.2, trophy: 0.4, djbooth: 2.6, speaker: 0.8, bar: 2, stage: 2, tapes: 0, arcade: 0.6, boombox: 0.7, drums: 1, amp: 0.8, turntable: 1.2, hoop: 0.3, crates: 0.7, fireplace: 1.5, tree: 1.1, gifts: 0.7, fox: 1, blocks: 0.8, ballpit: 1.3, standMic: 0.3, lamp: 0.3 };

  // ------------------------------------------------------------------ Raum bauen
  function build(st, cfg) {
    const sc = new T.Scene(), g = new T.Group(); sc.add(g);
    const R = { w: cfg.w, d: cfg.d }, col = hex(st.color), hw = cfg.w / 2, hd = cfg.d / 2;
    const L = cfg.light, dark = /night|club|neon|rock|stage|party|neonGreen|street/.test(L);
    sc.background = new T.Color(0x07080d);
    sc.add(new T.HemisphereLight(dark ? 0x8a80b0 : 0xfff1e0, 0x2a2030, dark ? 0.55 : 1.0));
    const sun = new T.DirectionalLight(L === 'warm' ? 0xffc890 : 0xffffff, dark ? 0.45 : 1.0); sun.position.set(3, 9, 7); sc.add(sun);
    R.lights = [];
    const pl = (c, x, z, i) => { const l = new T.PointLight(c, i, 14); l.position.set(x, 3.2, z); sc.add(l); R.lights.push(l); return l; };
    if (L === 'club' || L === 'party') { pl(0xa46cff, -4, -1, 1.4); pl(0x3dd6ff, 4, -1, 1.4); pl(0xff3da8, 0, 2, 1.0); }
    else if (L === 'rock') { pl(0xff3a2a, -3, -2, 1.6); pl(0xffffff, 3, -2, 1.0); }
    else if (L === 'neon' || L === 'neonGreen') { pl(L === 'neon' ? 0xff3da8 : 0x6cff8a, -3, -2, 1.4); pl(0x3dd6ff, 3, -2, 1.2); }
    else if (L === 'warm') { pl(0xff8a3a, 0, -3, 1.6); }
    else if (L === 'night') { pl(0xffb060, -5, -3, 1.0); pl(0xffb060, 5, -3, 1.0); pl(0x6070ff, 0, 0, 0.6); }
    else if (L === 'stage') { pl(0xffe0a0, 0, -2.5, 1.6); pl(col, 0, 2, 0.7); }
    else if (L === 'street') { pl(0xffb060, 3, -2, 1.3); }
    else pl(col, 0, -1, 0.8);
    // Boden (LED-Tanzfläche im Club)
    const fl = new T.Mesh(new T.PlaneGeometry(cfg.w, cfg.d), new T.MeshStandardMaterial({ map: floorTexture(cfg.floor), roughness: cfg.floor[0] === 'stage' ? 0.35 : 0.8 })); fl.rotation.x = -Math.PI / 2; g.add(fl);
    R.tiles = [];
    if (cfg.floor[0] === 'led') { for (let x = -3; x < 3; x++) for (let z = -2; z < 2; z++) { const m = new T.Mesh(new T.PlaneGeometry(1.4, 1.4), new T.MeshBasicMaterial({ color: 0x220044 })); m.rotation.x = -Math.PI / 2; m.position.set(x * 1.5 + 0.75, 0.01, z * 1.5 + 1.2); g.add(m); R.tiles.push(m); } }
    // Wände (drei Seiten, vorne offen für die Kamera)
    const wt = wallTexture(cfg.wallTex, cfg.wall, st.color), wm = new T.MeshStandardMaterial({ map: wt, roughness: 0.85 });
    const wtS = wt.clone(); wtS.needsUpdate = true; wtS.repeat.set(2.2, 1);
    const wmS = new T.MeshStandardMaterial({ map: wtS, roughness: 0.85 });
    W.box(cfg.w, 3.8, 0.2, wm, 0, 1.9, -hd - 0.1, g, false); W.box(0.2, 3.8, cfg.d, wmS, -hw - 0.1, 1.9, 0, g, false); W.box(0.2, 3.8, cfg.d, wmS, hw + 0.1, 1.9, 0, g, false);
    const acc = W.mat(col, { e: col, ei: 0.7 });
    W.box(cfg.w, 0.12, 0.24, acc, 0, 3.75, -hd, g, false); W.box(0.24, 0.12, cfg.d, acc, -hw, 3.75, 0, g, false); W.box(0.24, 0.12, cfg.d, acc, hw, 3.75, 0, g, false);
    // Senderschild mit Beschreibung
    const sign = W.textTex([st.icon + ' ' + st.name, cfg.room + ' · ' + st.desc.split(' – ')[0].slice(0, 40)], { w: 768, h: 160, size: 60, accent: st.color });
    const sm = new T.Mesh(new T.PlaneGeometry(5.2, 1.08), new T.MeshBasicMaterial({ map: sign, toneMapped: false })); sm.position.set(cfg.wallTex === 'stars' || cfg.props.some(p => /logoBig|screens|map|bigscreen|board|glitter|tapes/.test(p[0]) && Math.abs(p[1]) < 1) ? hw - 3.2 : 0, 3.1, -hd + 0.02);
    if (cfg.props.some(p => /logoBig|screens|map|bigscreen|glitter/.test(p[0]) && Math.abs(p[1]) < 1)) sm.position.set(0, 3.55, -hd + 0.02), sm.scale.set(0.8, 0.8, 1);
    g.add(sm);
    // echtes Senderlogo groß an der Seitenwand und klein neben dem Schild
    const lgW = W.logoPlane(st.slug, 2.2); lgW.position.set(-hw + 0.03, 2.2, -hd + 2.0); lgW.rotation.y = Math.PI / 2; g.add(lgW);
    const lgS = W.logoPlane(st.slug, 1.0); lgS.position.set(sm.position.x - 3.2 * sm.scale.x, sm.position.y, -hd + 0.03); g.add(lgS);
    // Lichtkegel im Club / bei der Party
    R.beams = [];
    if (L === 'club' || L === 'party' || L === 'rock') {
      const cols = L === 'rock' ? [0xff3a2a, 0xffffff] : [0xa46cff, 0x3dd6ff, 0xff3da8, 0xffd23f];
      for (let i = 0; i < 4; i++) { const pv = new T.Group(); pv.position.set(-4.5 + i * 3, 3.7, -1.5); const c = new T.Mesh(new T.CylinderGeometry(0.05, 1.3, 6, 18, 1, true), new T.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true, opacity: 0.14, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); c.position.y = -3; pv.add(c); g.add(pv); R.beams.push(pv); }
    }
    R.props = cfg.props.map(([k, x, z, ry]) => ({ k, x, z, m: prop(k, g, x, z, ry, st, R) }));
    g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
    return Object.assign(R, { sc, g });
  }

  // ------------------------------------------------------------------ Öffnen
  SD.open = function (slug, host, kit, onClose) {
    T = root.THREE; K = kit;
    const st = D.STATIONS.find(x => x.slug === slug) || D.STATIONS[0], cfg = S[st.slug] || S.anmacha24;
    const B = build(st, cfg), hw = cfg.w / 2, hd = cfg.d / 2;
    const R = K.begin({ kind: 'sender', slug: st.slug, st, cfg, sc: B.sc, g: B.g, B, onClose, busy: 0, t: 0, who: host || 'andrew', vibe: 25, dancing: false, party: 0, fans: [], figs: [], bubT: 2, wishT: 3 });
    const put = (id, x, z, ry, anim) => { const f = W.hosts[id]; if (!f) return null; if (f.root.parent) f.root.parent.remove(f.root); B.g.add(f.root); f.root.visible = true; f.root.position.set(x, 0, z); f.root.rotation.set(0, ry, 0); if (f.talk) f.talk(false); f.play(anim || 'idle', { fade: 0.2 }); return f; };
    R.other = R.who === 'andrew' ? 'marco' : 'andrew';
    R.mate = { id: R.other, x: hw - 2.6, z: -0.6 };
    put(R.who, hw - 2.5, hd - 1.6, Math.PI); put(R.other, R.mate.x, R.mate.z, -0.9, 'yes');
    R.figs = [W.hosts[R.other]].filter(Boolean);
    if (cfg.rico && W.hosts.rico) { put('rico', -1.2, -2.2, 0.3); R.figs.push(W.hosts.rico); }
    const solids = () => B.props.filter(p => SOLID[p.k]).map(p => ({ x: p.x, z: p.z, r: SOLID[p.k] })).concat([{ x: R.mate.x, z: R.mate.z, r: 0.4 }]).concat(R.fans.map(f => ({ x: f.x, z: f.z, r: 0.35 })));
    const gp = cfg.game.kind === 'beat' ? { x: 0, z: 0.6 } : { x: 0, z: 1.5 };
    R.gameSpot = gp;
    const spots = () => {
      const list = [];
      R.fans.forEach(f => { if (f.wish) list.push({ x: f.x, z: f.z, r: 1.5, label: WISH[f.wish].label + ' · ' + f.name, run: () => doWish(R, f) }); });
      list.push({ x: gp.x, z: gp.z, r: 1.4, label: '🎮 3D-Spiel: ' + cfg.game.name + (Save.data.senderBest && Save.data.senderBest[st.slug] ? ' · Rekord ' + U.fmt(Save.data.senderBest[st.slug]) : ''), run: () => startGame(R) });
      list.push({ x: hw - 1.6, z: hd - 0.6, r: 1.4, label: '🎧 ' + st.name + ' live hören', run: () => { AMC.Media.playStation(st.slug); K.say('📻 ' + st.name + ' läuft – ' + st.desc); bumpVibe(R, 4); } });
      list.push({ x: R.mate.x, z: R.mate.z, r: 1.6, label: '💬 Mit ' + D.HOSTS[R.other].name + ' quatschen', run: () => { K.say(D.HOSTS[R.other].name + ': „' + U.pick(cfg.talk) + '“', 4600); const f = W.hosts[R.other]; if (f) { f.play('yes', { restart: true }); setTimeout(() => f.play('idle', { fade: 0.3 }), 1500); } } });
      list.push({ x: -hw + 0.9, z: R.doorZ, r: 1.5, label: '🚪 Raus in die Stadt', run: () => AMC.Home.close() });
      return list;
    };
    // Ausgang: sichtbare Tür links vorne mit leuchtender Fußmatte; reinlaufen oder Ⓧ führt raus
    R.doorZ = hd - 1.6; door(B.g, -hw, R.doorZ, st.color);
    R.w = K.walker({ x: hw - 2.5, z: hd - 1.6, fig: W.hosts[R.who], bounds: { x0: -hw + 0.6, x1: hw - 0.6, z0: -hd + 0.8, z1: hd - 0.4 }, solids, spots, camOff: [0, 6.4 + cfg.d * 0.05, 6.6 + cfg.d * 0.12], anim: v => R.dancing && v < 0.3 ? 'dance' : null });
    // Oberfläche: Bedürfnisse, Vibe, Emotes
    const ui = K.hud(st.icon + ' ' + st.name, '');
    const top = ui.querySelector('.hm-top');
    top.insertAdjacentHTML('beforeend', '<small class="hm-desc">' + U.esc(cfg.room + ' · ' + st.desc) + '</small><div class="hm-vibe"><span>🔥 Vibe</span><i><em id="sdVibe"></em></i><b id="sdLv"></b></div>');
    ui.insertAdjacentHTML('beforeend', '<div class="hm-emo" id="sdEmo"><button type="button" data-e="dance" data-pad="✚↑" data-kb="Leer">💃<small>Tanzen</small></button><button type="button" data-e="yes" data-pad="✚←" data-kb="1">👋<small>Winken</small></button><button type="button" data-e="arms" data-pad="✚→" data-kb="2">🙌<small>Jubeln</small></button><button type="button" data-e="roll" data-pad="✚↓" data-kb="3">🤸<small>Rolle</small></button><button type="button" data-e="swap" data-pad="Y" data-kb="Q">⇄<small>' + U.esc(D.HOSTS[R.other].name) + '</small></button></div><div class="hm-feed" id="sdFeed"></div><div class="hm-lanes" id="sdLanes" hidden></div>');
    ui.querySelector('#sdEmo').addEventListener('click', e => { const b = e.target.closest('[data-e]'); if (b) emote(R, b.dataset.e); });
    K.drawNeeds(); drawVibe(R); if (AMC.UI.touchCtx) AMC.UI.touchCtx('sender');
    W.particles.attach(B.sc);
    AMC.Audio.sfx('door');
    // Beim Betreten läuft automatisch der Sender des Hauses (alles, was vorher lief, wird dabei beendet)
    const M = AMC.Media; if (M && !(M.kind === 'radio' && M.slug === st.slug && M.active())) M.playStation(st.slug);
    // Sender-Tour
    const v = Save.data.senders = Save.data.senders || {};
    if (!v[st.slug]) { v[st.slug] = 1; Save.earn(40); const n = Object.keys(v).length; if (n >= D.STATIONS.length) { Save.earn(500); setTimeout(() => AMC.UI.toast('🏆 Sender-Tour komplett! Alle ' + n + ' Senderhäuser besucht: +500 🎟️'), 1200); } else setTimeout(() => AMC.UI.toast('📻 Neues Senderhaus! +40 🎟️ · Sender-Tour ' + n + '/' + D.STATIONS.length), 900); Save.save(); }
    setTimeout(() => K.say(D.HOSTS[R.other].name + ': „' + cfg.talk[0] + '“ · ' + AMC.glyph('a') + ' tanzen, ' + AMC.glyph('y') + ' wechseln', 5200), 400);
    spawnFans(R);
    R.tick = dt => tick(R, dt);
    R.dispose = () => { I.dpadEmotes = false; R.fans.forEach(f => { if (f.fig) f.fig.dispose(); if (f.bub) f.bub.remove(); }); if (R.game) endGame(R, true); if (R.stopSong) R.stopSong(); };
    return R;
  };

  // ------------------------------------------------------------------ Fans
  const WISH = {
    autograph: { icon: '✍️', label: '✍️ Autogramm geben', vibe: 10, fan: 8, anim: 'push' },
    selfie: { icon: '🤳', label: '🤳 Selfie machen', vibe: 12, fan: 10, anim: 'yes' },
    dance: { icon: '💃', label: '💃 Zusammen tanzen', vibe: 18, fan: 12, anim: 'dance' },
    song: { icon: '🎵', label: '🎵 Songwunsch spielen', vibe: 16, fan: 12, anim: 'dance' },
    talk: { icon: '💬', label: '💬 Plaudern', vibe: 8, fan: 6, anim: 'yes' }
  };
  async function spawnFans(R) {
    const cfg = R.cfg, n = [3, 5, 6][W.quality] || 4, hw = cfg.w / 2;
    const spots = [[-2.5, 1.2], [2.2, 1.6], [-0.8, 2.6], [1, -0.6], [-3.6, 2.8], [3.4, 2.8]];
    for (let i = 0; i < n; i++) {
      if (!W.makeFan) break;
      const fig = await W.makeFan(R.slug.length * 997 + i * 131, { top: cfg.fans[i % cfg.fans.length], hat: cfg.hat ? { type: 'cap', color: cfg.hat } : undefined }).catch(() => null);
      if (!K.alive(R)) { if (fig) fig.dispose(); return; }
      if (!fig) continue;
      const [x, z] = spots[i % spots.length], f = { fig, x: U.clamp(x, -hw + 1, hw - 1), z, hx: x, hz: z, name: D.FAN_NAMES[(i * 3 + R.slug.length) % D.FAN_NAMES.length], wish: null, danceT: 0, t: Math.random() * 5 };
      fig.root.position.set(f.x, 0, f.z); fig.root.rotation.y = Math.random() * 6; R.g.add(fig.root); fig.play('idle', { fade: 0 });
      f.bub = U.el('div', 'hm-bub'); f.bub.hidden = true; U.$('homeUi') && U.$('homeUi').appendChild(f.bub);
      f.icon = new T.Sprite(new T.SpriteMaterial({ map: W.textTex(['💬'], { w: 128, h: 128, size: 80, bg: '#14161f', accent: R.st.color }), depthTest: false })); f.icon.scale.set(0.5, 0.5, 1); f.icon.position.y = 2.25; f.icon.visible = false; fig.root.add(f.icon);
      R.fans.push(f);
    }
  }
  function setWish(R, f, w) {
    f.wish = w; f.icon.visible = !!w;
    if (w) { f.icon.material.map = W.textTex([WISH[w].icon], { w: 128, h: 128, size: 80, bg: '#14161f', accent: R.st.color }); f.icon.material.needsUpdate = true; }
  }
  function doWish(R, f) {
    const w = WISH[f.wish]; if (!w) return;
    const me = W.hosts[R.who], H = D.HOSTS[R.who];
    f.fig.root.rotation.y = Math.atan2(R.w.x - f.x, R.w.z - f.z);
    if (me) { me.root.rotation.y = Math.atan2(f.x - R.w.x, f.z - R.w.z); me.play(w.anim, { restart: true, fade: 0.1 }); R.w.anim = w.anim; R.w.busy = f.wish === 'dance' || f.wish === 'song' ? 3 : 1.4; }
    f.fig.play(w.anim === 'push' ? 'yes' : w.anim, { restart: true, fade: 0.1 }); f.danceT = f.wish === 'dance' || f.wish === 'song' ? 4 : 1.5;
    const lines = { autograph: 'Danke, ' + H.name + '! Das kommt an die Wand!', selfie: 'Selfie mit ' + H.name + '! Geht sofort in die Story!', dance: 'Wuhuu! ' + H.name + ' kann ja richtig tanzen!', song: 'Mein Lieblingslied! Auf ' + R.st.name + '!', talk: U.pick(R.cfg.lines) };
    bubble(R, f, lines[f.wish]); feed(R, f.name, lines[f.wish]);
    if (f.wish === 'selfie') { const fl = U.el('div', 'hm-selfie'); document.body.appendChild(fl); setTimeout(() => fl.remove(), 600); AMC.Audio.sfx('star'); }
    else if (f.wish === 'song') { const s = U.pick(AMC.Data.WISHES.concat(AMC.Home.ownedSongs())); AMC.Audio.song(s.id).catch(() => null).then(song => { if (song && K.alive(R)) { if (R.stopSong) R.stopSong(); R.stopSong = AMC.Audio.playSong(song, { from: song.mel[0][0], sec: 7, vel: 0.6 }); } }); K.say('🎵 „' + s.t + '“ für ' + f.name + ' – live auf ' + R.st.name + '!', 3600); }
    else AMC.Audio.sfx('ok');
    W.particles.burst(f.x, 2, f.z, hex(R.st.color), 18, { speed: 3 });
    Save.earn(w.fan); bumpVibe(R, w.vibe); setWish(R, f, null);
    const n = K.needs(R.who); n.fun = Math.min(100, n.fun + 4); Save.save(); K.drawNeeds();
  }
  function bubble(R, f, text) { if (!f.bub) return; f.bub.textContent = text; f.bub.hidden = false; f.bubT = 3.2; f.bub.classList.remove('pop'); void f.bub.offsetWidth; f.bub.classList.add('pop'); }
  function feed(R, who, text) {
    const box = U.$('sdFeed'); if (!box) return;
    const row = U.el('div', 'hm-fl'); row.innerHTML = '<b style="color:' + R.st.color + '">' + U.esc(who) + ':</b> ' + U.esc(text); box.appendChild(row);
    while (box.children.length > 4) box.firstChild.remove();
  }

  // ------------------------------------------------------------------ Vibe, Emotes, Wechsel
  function bumpVibe(R, n) {
    R.vibe = Math.min(100, R.vibe + n); drawVibe(R);
    if (R.vibe >= 100 && !(R.party > 0)) {
      const lv = Save.data.senderLv = Save.data.senderLv || {}, cur = Math.min(5, (lv[R.slug] || 0) + 1); lv[R.slug] = cur;
      const fan = Save.earn(50 * cur); R.party = 9; R.vibe = 55; Save.save();
      AMC.Audio.sfx('applause'); AMC.Audio.sfx('cheer');
      for (let i = 0; i < 4; i++) setTimeout(() => K.alive(R) && W.particles.burst(U.rand(-3, 3), 3, U.rand(-2, 2), [0xffd23f, 0xff3da8, 0x3dd6ff][i % 3], 40, { speed: 6 }), i * 250);
      K.say('🎉 PARTY-LEVEL ' + cur + ' bei ' + R.st.name + '! Alle tanzen! +' + fan + ' 🎟️', 4200);
      R.fans.forEach(f => { f.danceT = 9; bubble(R, f, U.pick(['🎉🎉🎉', 'PARTYYY!', 'Bester Abend!', U.pick(R.cfg.lines)])); });
      drawVibe(R);
    }
  }
  function drawVibe(R) {
    const e = U.$('sdVibe'), l = U.$('sdLv'); if (e) e.style.width = Math.round(R.vibe) + '%';
    if (l) l.textContent = '⭐'.repeat((Save.data.senderLv || {})[R.slug] || 0) || 'Lv 0';
  }
  function emote(R, e) {
    if (R.game) return;
    const me = W.hosts[R.who];
    if (e === 'swap') return swap(R);
    if (e === 'dance') { R.dancing = !R.dancing; AMC.Audio.sfx(R.dancing ? 'combo' : 'ui'); if (!R.dancing && me) { me.play('idle', { fade: 0.2 }); R.w.anim = 'idle'; } return; }
    if (!me) return;
    R.dancing = false; me.play(e, { restart: true, fade: 0.1, once: e === 'roll' }); R.w.anim = e; R.w.busy = e === 'roll' ? 1.1 : 1.6; AMC.Audio.sfx(e === 'arms' ? 'cheer' : 'ui');
    R.fans.forEach(f => { if (Math.hypot(f.x - R.w.x, f.z - R.w.z) < 4.5) { f.fig.play(e === 'roll' ? 'arms' : e, { restart: true, fade: 0.1 }); f.danceT = 1.4; } });
    bumpVibe(R, 3);
  }
  function swap(R) {
    const a = W.hosts[R.who], b = W.hosts[R.other]; if (!a || !b) return;
    const ax = R.w.x, az = R.w.z;
    R.w.x = R.mate.x; R.w.z = R.mate.z; R.mate.x = ax; R.mate.z = az;
    a.root.position.set(ax, 0, az); a.play('idle', { fade: 0.2 });
    const t = R.who; R.who = R.other; R.other = t; R.w.fig = b; R.w.anim = '';
    R.figs = R.figs.filter(f => f !== b).concat([a]);
    const sb = document.querySelector('#sdEmo [data-e=swap] small'); if (sb) sb.textContent = D.HOSTS[R.other].name;
    R.dancing = false; AMC.Audio.sfx('swap'); K.drawNeeds(); K.retitle(R.st.icon + ' ' + R.st.name);
    K.say('Jetzt spielst du ' + D.HOSTS[R.who].name + '.', 1800);
  }

  // ------------------------------------------------------------------ Schleife im Senderhaus
  function door(g, x, z, color) {
    const d = new T.Group(); d.position.set(x + 0.12, 0, z); g.add(d);
    const fr = W.mat(0x2a2230), glow = W.mat(hex(color), { e: hex(color), ei: 0.9 });
    W.box(0.14, 2.5, 0.16, fr, 0, 1.25, -0.72, d, false); W.box(0.14, 2.5, 0.16, fr, 0, 1.25, 0.72, d, false); W.box(0.14, 0.16, 1.6, fr, 0, 2.5, 0, d, false);
    W.box(0.06, 2.34, 1.3, W.mat(0x0c0e16, { e: 0x3a4a70, ei: 0.35 }), 0.02, 1.17, 0, d, false);
    W.box(0.05, 0.08, 1.4, glow, 0.1, 2.38, 0, d, false);
    const t = W.textTex(['🚪 AUSGANG'], { w: 256, h: 64, size: 34, bg: '#0c3a1c', accent: '#3ddc84' });
    const sg = new T.Mesh(new T.PlaneGeometry(1.2, 0.3), new T.MeshBasicMaterial({ map: t, toneMapped: false })); sg.position.set(0.12, 2.82, 0); sg.rotation.y = Math.PI / 2; d.add(sg);
    const mat = new T.Mesh(new T.PlaneGeometry(1.1, 1.5), new T.MeshBasicMaterial({ color: 0x3ddc84, transparent: true, opacity: 0.35, toneMapped: false })); mat.rotation.x = -Math.PI / 2; mat.position.set(0.65, 0.015, 0); d.add(mat);
    d.userData.mat = mat; return d;
  }
  function tick(R, dt) {
    const me = W.hosts[R.who];
    // Tür: wer in die Tür läuft, geht raus
    if (R.w.x < -R.cfg.w / 2 + 0.75 && Math.abs(R.w.z - R.doorZ) < 0.8 && I.move.x < -0.4) { R.outT = (R.outT || 0) + dt; if (R.outT > 0.25) { AMC.Home.close(); return true; } } else R.outT = 0;
    I.dpadEmotes = !R.game;
    if (R.game) { R.game.update(dt); animFans(R, dt, true); return true; }
    if (I.hit('swap')) swap(R);
    if (I.hit('jump')) emote(R, 'dance');
    if (I.device === 'pad') { if (I.hit('k1')) emote(R, 'dance'); if (I.hit('k2')) emote(R, 'yes'); if (I.hit('k3')) emote(R, 'arms'); if (I.hit('k4')) emote(R, 'roll'); }
    else { if (I.hit('k1')) emote(R, 'yes'); if (I.hit('k2')) emote(R, 'arms'); if (I.hit('k3')) emote(R, 'roll'); }
    // Vibe: tanzen in der Nähe der Fans füllt, sonst sinkt er langsam
    const near = R.fans.filter(f => Math.hypot(f.x - R.w.x, f.z - R.w.z) < 4.5).length;
    if (R.dancing) { R.vibe = Math.min(100, R.vibe + dt * (1.5 + near * 1.2)); if (R.vibe >= 100) bumpVibe(R, 0); }
    else R.vibe = Math.max(0, R.vibe - dt * 0.6);
    if (R.party > 0) R.party -= dt;
    R.vibeT = (R.vibeT || 0) - dt; if (R.vibeT <= 0) { R.vibeT = 0.3; drawVibe(R); }
    // Fans: Wünsche und Chat
    R.wishT -= dt; if (R.wishT <= 0) { R.wishT = 4 + Math.random() * 4; const free = R.fans.filter(f => !f.wish); if (free.length && R.fans.filter(f => f.wish).length < 2) setWish(R, U.pick(free), U.pick(Object.keys(WISH))); }
    R.bubT -= dt; if (R.bubT <= 0 && R.fans.length) { R.bubT = 3 + Math.random() * 3; const f = U.pick(R.fans), l = U.pick(R.cfg.lines); bubble(R, f, l); feed(R, f.name, l); }
    animFans(R, dt, false);
    // Partner tanzt mit, wenn du tanzt
    const mf = W.hosts[R.other]; if (mf) { const want = R.dancing || R.party > 0 ? 'dance' : 'idle'; if (mf.curName !== want && !(R.mateT > 0)) mf.play(want, { fade: 0.3 }); }
    if (R.mateT > 0) R.mateT -= dt;
    animRoom(R, dt);
    return false;
  }
  function animFans(R, dt, game) {
    const cam = W.camera, wv = new T.Vector3(), cw = W.renderer.domElement.clientWidth, ch = W.renderer.domElement.clientHeight;
    R.fans.forEach(f => {
      f.t += dt; if (f.danceT > 0) f.danceT -= dt;
      if ((R.dancing || R.party > 0) && !game && !f.wish) { // Fans kommen zum Mittanzen rüber
        if (f.ang === undefined) f.ang = Math.random() * Math.PI * 2;
        const tx = U.clamp(R.w.x + Math.cos(f.ang) * 2, -R.cfg.w / 2 + 0.8, R.cfg.w / 2 - 0.8), tz = U.clamp(R.w.z + Math.sin(f.ang) * 2, -R.cfg.d / 2 + 1, R.cfg.d / 2 - 0.5), dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz);
        if (d > 0.4 && Math.hypot(R.w.x - f.x, R.w.z - f.z) < 10) { f.x += dx / d * Math.min(d, dt * 2.2); f.z += dz / d * Math.min(d, dt * 2.2); f.fig.root.rotation.y = Math.atan2(dx, dz); if (f.fig.curName !== 'jog') f.fig.play('jog', { fade: 0.2 }); f.fig.root.position.set(f.x, 0, f.z); f.fig.update(dt); return; }
        f.fig.root.rotation.y += U.angDiff(f.fig.root.rotation.y, Math.atan2(R.w.x - f.x, R.w.z - f.z)) * Math.min(1, dt * 4);
      }
      const dancing = game || R.party > 0 || f.danceT > 0 || (R.dancing && Math.hypot(f.x - R.w.x, f.z - R.w.z) < 5) || R.vibe > 70;
      if (!dancing && !f.wish) { // langsam umherschlendern
        const tx = f.hx + Math.sin(f.t * 0.3) * 0.8, tz = f.hz + Math.cos(f.t * 0.23) * 0.6, dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz);
        if (d > 0.05) { f.x += dx / d * Math.min(d, dt * 0.8); f.z += dz / d * Math.min(d, dt * 0.8); f.fig.root.rotation.y = Math.atan2(dx, dz); }
        const a = d > 0.1 ? 'walk' : 'idle'; if (f.fig.curName !== a && !(f.danceT > 0)) f.fig.play(a, { fade: 0.3 });
      } else if (f.wish && !dancing) { f.fig.root.rotation.y += U.angDiff(f.fig.root.rotation.y, Math.atan2(R.w.x - f.x, R.w.z - f.z)) * Math.min(1, dt * 4); if (f.fig.curName !== 'idle' && !(f.danceT > 0)) f.fig.play('idle', { fade: 0.3 }); }
      else if (f.fig.curName !== 'dance' && !(f.danceT > 0 && f.fig.curName !== 'idle' && f.fig.curName !== 'walk')) f.fig.play('dance', { fade: 0.3, speed: 0.9 + (f.t % 1) * 0.3 });
      f.fig.root.position.set(f.x, 0, f.z); f.fig.update(dt);
      if (f.icon.visible) f.icon.position.y = 2.25 + Math.sin(f.t * 3) * 0.08;
      if (f.bub && !f.bub.hidden) {
        f.bubT -= dt; if (f.bubT <= 0) { f.bub.hidden = true; return; }
        wv.set(f.x, 2.35, f.z).project(cam); f.bub.style.transform = 'translate(-50%,-100%) translate(' + Math.round((wv.x + 1) / 2 * cw) + 'px,' + Math.round((1 - wv.y) / 2 * ch) + 'px)'; f.bub.style.opacity = wv.z < 1 ? 1 : 0;
      }
    });
  }
  function animRoom(R, dt) {
    const t = R.t, B = R.B;
    B.tiles.forEach((m, i) => { const h = ((i * 0.13 + t * 0.35 + (i % 6) * 0.07) % 1); m.material.color.setHSL(h, 0.9, 0.18 + (R.dancing || R.party > 0 || R.game ? 0.25 : 0.1) * (0.5 + 0.5 * Math.sin(t * 6 + i))); });
    B.beams.forEach((b, i) => { b.rotation.z = Math.sin(t * (0.7 + i * 0.2) + i) * 0.6; b.rotation.x = Math.cos(t * 0.5 + i) * 0.35; });
    if (R.cfg.light === 'rock' && B.lights[0]) B.lights[0].intensity = 1.2 + Math.max(0, Math.sin(t * 9)) * 1.2;
    if (B.fire) B.fire.scale.y = 1.3 + Math.sin(t * 13) * 0.15;
  }

  // ------------------------------------------------------------------ 3D-Minispiele im Haus
  function startGame(R) {
    if (R.game) return;
    R.dancing = false;
    const g = R.cfg.game, me = W.hosts[R.who];
    R.w.x = R.gameSpot.x; R.w.z = R.gameSpot.z;
    if (me) { me.root.position.set(R.w.x, 0, R.w.z); me.root.rotation.y = Math.PI; }
    AMC.UI.showTouch(false); U.$('hmUse').hidden = true; const emo = U.$('sdEmo'); if (emo) emo.hidden = true;
    const hudEl = U.el('div', 'sd-game glass'); hudEl.id = 'sdGame'; U.$('homeUi').appendChild(hudEl);
    R.fans.forEach(f => { setWish(R, f, null); if (Math.abs(f.x) < 2.6 && f.z > -R.cfg.d / 2 + 1.5) { f.x = (f.x < 0 ? -1 : 1) * U.rand(2.8, Math.max(3, R.cfg.w / 2 - 1)); f.hx = f.x; } });
    // Deko, die zwischen Kamera und Spielfeld hängt, kurz ausblenden
    R.hidden = R.B.props.filter(p => p.m && Math.abs(p.x) < 2.4 && p.z > -R.cfg.d / 2 + 1.2 && /disco|spot|lamp|ring|stars|tree|ballpit|blocks|fox|globe|deck|podium|carpet/.test(p.k)); R.hidden.forEach(p => { p.m.visible = false; });
    (g.kind === 'beat' ? beatGame : catchGame)(R, g, hudEl);
  }
  function endGame(R, silent, score, q) {
    const G = R.game; if (!G) return; R.game = null;
    if (G.stop) G.stop();
    G.objs.forEach(o => R.g.remove(o)); const h = U.$('sdGame'); if (h) h.remove(); const ln = U.$('sdLanes'); if (ln) { ln.hidden = true; ln.innerHTML = ''; }
    const emo = U.$('sdEmo'); if (emo) emo.hidden = false; AMC.UI.showTouch(true); (R.hidden || []).forEach(p => { p.m.visible = true; }); R.hidden = null;
    if (silent) return;
    const best = Save.data.senderBest = Save.data.senderBest || {}, rec = score > (best[R.slug] || 0); if (rec) best[R.slug] = score;
    const fan = Save.earn(15 + Math.round(q * 85)), n = K.needs(R.who);
    n.fun = Math.min(100, n.fun + 12); n.energy = Math.max(0, n.energy - 6);
    if (q >= 0.6 && (n.ideas || []).length < 3) n.ideas.push(R.st.name + ': ' + R.cfg.game.name);
    Save.save(); K.drawNeeds();
    K.say((q >= 0.8 ? '🔥 Die ' + R.st.name + '-Fans rasten aus!' : q >= 0.5 ? '👍 Starke Runde!' : '😅 Naja … die Technik war schuld.') + ' ' + U.fmt(score) + ' Punkte' + (rec ? ' · 🏆 Rekord!' : '') + ' · +' + fan + ' 🎟️' + (q >= 0.6 ? ' · 💡 Show-Idee!' : ''), 5200);
    AMC.Audio.sfx(q >= 0.5 ? 'applause' : 'miss');
    bumpVibe(R, Math.round(q * 40));
    const me = W.hosts[R.who]; if (me) { me.play(q >= 0.5 ? 'arms' : 'idle', { restart: true }); R.w.anim = ''; R.w.busy = 1.4; }
  }
  // Beat: 3D-Notenbahn auf dem Boden, Noten fliegen auf deine Figur zu, ◀ ▼ ▲ ▶ im Takt
  function beatGame(R, g, hudEl) {
    const DIRS = ['left', 'down', 'up', 'right'], COLS = [0xff4fa0, 0x3dd6ff, 0x6cff8a, 0xffd23f], ARR = ['◀', '▼', '▲', '▶'];
    const hitZ = R.gameSpot.z - 1.2, farZ = -R.cfg.d / 2 + 0.8, laneX = i => (i - 1.5) * 0.9, objs = [];
    const G = R.game = { objs, notes: [], t: -1.6, score: 0, combo: 0, best: 0, hits: 0, total: 0, done: false };
    for (let i = 0; i < 4; i++) { const lane = new T.Mesh(new T.PlaneGeometry(0.8, hitZ - farZ + 0.6), new T.MeshBasicMaterial({ color: COLS[i], transparent: true, opacity: 0.16, depthWrite: false })); lane.rotation.x = -Math.PI / 2; lane.position.set(laneX(i), 0.02, (hitZ + farZ) / 2); R.g.add(lane); objs.push(lane); const pad = new T.Mesh(new T.RingGeometry(0.26, 0.36, 24), new T.MeshBasicMaterial({ color: COLS[i], side: T.DoubleSide })); pad.rotation.x = -Math.PI / 2; pad.position.set(laneX(i), 0.04, hitZ); R.g.add(pad); objs.push(pad); G['pad' + i] = pad; }
    const gemGeo = new T.OctahedronGeometry(0.24, 0), speed = g.hard ? 6.2 : 5, travel = (hitZ - farZ) / speed;
    const lanesEl = U.$('sdLanes'); lanesEl.hidden = false; lanesEl.innerHTML = DIRS.map((d, i) => '<button type="button" data-l="' + i + '" style="--c:#' + COLS[i].toString(16).padStart(6, '0') + '">' + ARR[i] + '</button>').join('');
    lanesEl.querySelectorAll('[data-l]').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); hit(+b.dataset.l); }));
    const wish = U.pick(AMC.Data.WISHES.concat(AMC.Home.ownedSongs()));
    hudEl.innerHTML = '<b>🎮 ' + U.esc(g.name) + '</b> <span>„' + U.esc(wish.t) + '“</span> <em id="sdScore">0</em><small>' + (I.device === 'touch' ? 'Tippe die Felder im Takt' : I.device === 'pad' ? 'Steuerkreuz im Takt' : '← ↓ ↑ → oder WASD im Takt') + ' · ' + AMC.glyph('b') + ' Abbruch</small>';
    AMC.Audio.song(wish.id).catch(() => null).then(song => {
      if (R.game !== G) return;
      const n = g.hard ? 34 : 26;
      if (song && song.mel && song.mel.length) {
        const slow = Math.max(1, 0.11 / (song.step / 1000) * (g.hard ? 0.85 : 1.05)), stepS = song.step / 1000 * slow, mel = song.mel.slice().sort((a, b) => a[0] - b[0]), gap = (g.hard ? 0.28 : 0.4) / stepS;
        let prev = -1e9; const s0 = mel[0][0];
        for (const [s, m] of mel) { if (G.notes.length >= n) break; if (s - prev < gap) continue; prev = s; G.notes.push({ t: (s - s0) * stepS + 1.2, m }); }
        const ps = G.notes.map(x => x.m).sort((a, b) => a - b), cut = [0.25, 0.5, 0.75].map(k => ps[Math.min(ps.length - 1, Math.floor(ps.length * k))]);
        G.notes.forEach(x => { x.l = x.m <= cut[0] ? 0 : x.m <= cut[1] ? 1 : x.m <= cut[2] ? 2 : 3; });
        G.stop = AMC.Audio.playSong(song, { from: s0 - 1.2 / stepS + travel / stepS * 0, sec: G.notes[G.notes.length - 1].t + 2, slow, mel: false, vel: 0.45 });
        G.song = true;
      } else { for (let i = 0; i < n; i++) G.notes.push({ t: 1.2 + i * 0.55, m: 60 + (i * 5) % 12, l: (i * 7 + (i >> 2)) % 4 }); }
      G.total = G.notes.length;
      G.notes.forEach(x => { x.mesh = new T.Mesh(gemGeo, W.mat(COLS[x.l], { e: COLS[x.l], ei: 0.9 })); x.mesh.visible = false; R.g.add(x.mesh); objs.push(x.mesh); });
      G.ready = true; G.t = -travel;
    });
    function hit(l) {
      if (!G.ready || G.done) return;
      let bestN = null, bd = 1e9; for (const x of G.notes) { if (x.done || x.l !== l) continue; const d = Math.abs(x.t - G.t); if (d < bd) { bd = d; bestN = x; } }
      const pad = G['pad' + l]; pad.scale.setScalar(1.35); setTimeout(() => pad.scale.setScalar(1), 90);
      if (bestN && bd < 0.26) {
        bestN.done = true; bestN.mesh.visible = false; G.hits++; G.combo++; G.best = Math.max(G.best, G.combo);
        const perfect = bd < 0.1; G.score += (perfect ? 100 : 60) * (1 + Math.min(4, Math.floor(G.combo / 8)));
        AMC.Audio.piano(bestN.m, 0, 0.35, 0.75); W.particles.burst(laneX(l), 0.6, hitZ, COLS[l], perfect ? 18 : 10, { speed: 3 });
        const me = W.hosts[R.who]; if (me && G.combo % 4 === 0) me.play(U.pick(['dance', 'arms', 'yes']), { restart: true, fade: 0.1 });
        if (G.combo % 10 === 0) { AMC.Audio.sfx('cheer'); K.say('🔥 ' + G.combo + 'er Combo!', 1400); }
      } else { G.combo = 0; AMC.Audio.sfx('miss'); }
    }
    G.update = dt => {
      if (I.hit('back')) { endGame(R, true); K.say('Abgebrochen.', 1500); return; }
      if (!G.ready) return;
      G.t += dt;
      DIRS.forEach((d, i) => { if (I.hit(d)) hit(i); });
      ['x', 'a', 'y', 'b'].forEach(() => {});
      let left = 0;
      for (const x of G.notes) {
        if (x.done) continue; left++;
        const dt0 = x.t - G.t;
        if (dt0 < -0.26) { x.done = true; x.mesh.visible = false; G.combo = 0; continue; }
        x.mesh.visible = dt0 < travel; x.mesh.position.set(laneX(x.l), 0.45 + Math.max(0, dt0) * 0.08, hitZ - dt0 * speed); x.mesh.rotation.y += dt * 4;
      }
      const sEl = U.$('sdScore'); if (sEl) sEl.textContent = U.fmt(G.score) + (G.combo > 2 ? ' · x' + G.combo : '');
      const me = W.hosts[R.who]; if (me) { me.root.position.set(laneX(3) + 1.3, 0, hitZ + 0.2); me.root.rotation.y = -0.5; if (me.curName === 'idle' || me.curName === 'walk') me.play('dance', { fade: 0.2 }); me.update(dt); }
      const cam = W.camera, nar = Math.max(0, 1 - cam.aspect); cam.position.set(0.3, 4.4 + nar * 2.5, hitZ + 3.9 + nar * 3.5); cam.lookAt(0.3, 0, hitZ - 3.4);
      animRoom(R, dt);
      if (!left && !G.done) { G.done = true; const q = G.total ? G.hits / G.total : 0; setTimeout(() => R.game === G && endGame(R, false, G.score, q), 900); }
    };
  }
  // Fang: Dinge des Senders fallen von der Decke – fangen, Störungen ausweichen
  const ITEM = {
    phone: c => { const g = new T.Group(); W.box(0.32, 0.55, 0.08, W.mat(0x111111), 0, 0, 0, g, false); W.box(0.27, 0.42, 0.02, W.mat(c, { e: c, ei: 1 }), 0, 0.03, 0.05, g, false); return g; },
    like: () => { const g = new T.Group(); const h = new T.Mesh(new T.SphereGeometry(0.22, 12, 10), W.mat(0xff3a6a, { e: 0xff3a6a, ei: 0.7 })); h.scale.set(1.2, 1, 0.5); g.add(h); return g; },
    souvenir: () => { const g = new T.Group(); W.box(0.5, 0.36, 0.2, W.mat(U.pick([0xd8342c, 0x2fd3a0, 0xffd23f])), 0, 0, 0, g, false); W.box(0.2, 0.06, 0.06, W.mat(0x111111), 0, 0.22, 0, g, false); return g; },
    star: () => { const g = new T.Group(); const m = new T.Mesh(new T.OctahedronGeometry(0.28, 0), W.mat(0xffd23f, { e: 0xffd23f, ei: 1.3 })); m.scale.y = 1.4; g.add(m); return g; },
    coin: () => { const g = new T.Group(); const m = W.cyl(0.25, 0.25, 0.06, W.mat(0x6cff8a, { e: 0x3aff6a, ei: 1 }), 0, 0, 0, g, 18); m.rotation.x = Math.PI / 2; return g; },
    gift: () => { const g = new T.Group(); const c = U.pick([0xff3a3a, 0x3dd6ff, 0xffd23f, 0xa46cff]); W.box(0.42, 0.42, 0.42, W.mat(c), 0, 0, 0, g, false); W.box(0.08, 0.44, 0.44, W.mat(0xffffff), 0, 0, 0, g, false); return g; },
    ball: () => { const g = new T.Group(); g.add(new T.Mesh(new T.SphereGeometry(0.24, 14, 10), W.mat(U.pick([0xff3a3a, 0xffd23f, 0x6cff8a, 0x3dd6ff])))); return g; },
    static: () => { const g = new T.Group(); for (let i = 0; i < 5; i++) { const s = new T.Mesh(new T.SphereGeometry(0.15, 6, 5), W.mat(0x8a8a9a, { e: 0x444455, ei: 1 })); s.position.set((Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.3, 0); g.add(s); } return g; },
    bug: () => { const g = new T.Group(); const b = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), W.mat(0xd8342c, { e: 0x801010, ei: 1 })); b.scale.set(1.3, 0.8, 1); g.add(b); return g; },
    cloud: () => { const g = new T.Group(); [[-0.2, 0], [0.15, 0.05], [0, 0.15]].forEach(([x, y]) => { const s = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), W.mat(0x6a7280)); s.position.set(x, y, 0); g.add(s); }); return g; },
    lag: () => { const g = new T.Group(); W.box(0.45, 0.45, 0.45, W.mat(0xd8342c, { e: 0x601010, ei: 1 }), 0, 0, 0, g, false); return g; },
    coal: () => { const g = new T.Group(); const m = new T.Mesh(new T.DodecahedronGeometry(0.24, 0), W.mat(0x1a1a1a, { r: 0.9 })); g.add(m); return g; },
    puddle: () => { const g = new T.Group(); g.add(new T.Mesh(new T.SphereGeometry(0.24, 12, 10), W.mat(0x6b4a30, { r: 0.4 }))); return g; }
  };
  function catchGame(R, g, hudEl) {
    const objs = [], lineZ = R.gameSpot.z, half = Math.min(R.cfg.w / 2 - 1.2, 4.6), col = hex(R.st.color);
    const G = R.game = { objs, t: 0, dur: 40, score: 0, combo: 0, lives: 3, items: [], spawnT: 0.4, x: 0, caught: 0, total: 0, ready: true };
    const rail = W.box(half * 2 + 1, 0.04, 0.5, W.mat(col, { e: col, ei: 0.5, t: 0.5 }), 0, 0.02, lineZ, R.g, false); objs.push(rail);
    hudEl.innerHTML = '<b>🎮 ' + U.esc(g.name) + '</b> <span>' + U.esc(g.goodTxt) + ' · ' + U.esc(g.badTxt) + ' ausweichen</span><em id="sdScore">0</em><small>' + (I.device === 'touch' ? '◀ ▶ halten' : I.device === 'pad' ? 'Stick links/rechts' : '← → oder A D') + ' · ' + AMC.glyph('b') + ' Abbruch</small>';
    const me = W.hosts[R.who]; if (me) { me.root.rotation.y = Math.PI; }
    G.hold = 0; const lanesEl = U.$('sdLanes'); lanesEl.hidden = false; lanesEl.innerHTML = '<button type="button" data-d="-1" style="--c:' + R.st.color + '">◀</button><button type="button" data-d="1" style="--c:' + R.st.color + '">▶</button>';
    lanesEl.querySelectorAll('[data-d]').forEach(b => { const d = +b.dataset.d; b.addEventListener('pointerdown', e => { e.preventDefault(); G.hold = d; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { if (G.hold === d) G.hold = 0; })); });
    G.update = dt => {
      if (I.hit('back')) { endGame(R, true); K.say('Abgebrochen.', 1500); return; }
      G.t += dt; const k = Math.min(1, G.t / G.dur);
      // Bewegen
      const mx = I.move.x || G.hold, sp = 6.5; G.x = U.clamp(G.x + mx * sp * dt, -half, half);
      if (me) { me.root.position.set(G.x, 0, lineZ); const a = Math.abs(mx) > 0.15 ? 'jog' : 'idle'; if (me.curName !== a && !(G.pose > 0)) me.play(a, { fade: 0.15 }); me.root.rotation.y = Math.abs(mx) > 0.15 ? (mx > 0 ? Math.PI / 2 : -Math.PI / 2) : Math.PI; me.update(dt); }
      if (G.pose > 0) G.pose -= dt;
      // Nachschub
      G.spawnT -= dt;
      if (G.spawnT <= 0 && G.t < G.dur) {
        G.spawnT = 0.85 - k * 0.45; const bad = Math.random() < 0.22 + k * 0.15, kind = bad ? g.bad : g.good;
        const m = ITEM[kind](col); m.position.set(U.rand(-half, half), 4.2, lineZ); R.g.add(m); objs.push(m);
        G.items.push({ m, bad, vy: -(2.2 + k * 2.6 + Math.random()) }); if (!bad) G.total++;
      }
      G.items = G.items.filter(it => {
        it.m.position.y += it.vy * dt; it.m.rotation.y += dt * 3; it.m.rotation.z += dt;
        const p = it.m.position;
        if (p.y < 1.9 && p.y > 0.4 && Math.abs(p.x - G.x) < 0.75) {
          R.g.remove(it.m);
          if (it.bad) { G.lives--; G.combo = 0; AMC.Audio.sfx('hit'); W.particles.burst(p.x, p.y, p.z, 0x888888, 14, { speed: 3 }); if (me) { me.play('down', { restart: true, once: true, fade: 0.05 }); G.pose = 0.8; } K.say('💥 ' + U.pick(['Autsch!', 'Das war ' + g.badTxt + '!', 'Rauschen im Kopf …']) + ' ' + '❤️'.repeat(Math.max(0, G.lives)), 1600); }
          else { G.caught++; G.combo++; G.score += 50 * (1 + Math.min(4, Math.floor(G.combo / 5))); AMC.Audio.sfx('collect'); W.particles.burst(p.x, p.y, p.z, col, 12, { speed: 3 }); if (me && G.combo % 5 === 0) { me.play('arms', { restart: true, fade: 0.05 }); G.pose = 0.6; } }
          return false;
        }
        if (p.y < 0.1) { R.g.remove(it.m); if (!it.bad) G.combo = 0; return false; }
        return true;
      });
      const sEl = U.$('sdScore'); if (sEl) sEl.textContent = U.fmt(G.score) + ' · ' + '❤️'.repeat(Math.max(0, G.lives)) + ' · ⏱ ' + Math.max(0, Math.ceil(G.dur - G.t));
      const cam = W.camera, nar = Math.max(0, 1 - cam.aspect); cam.position.set(G.x * (0.4 + nar * 0.4), 3.1 + nar * 1.5, lineZ + 6.2 + nar * 5); cam.lookAt(G.x * 0.3, 1.8, lineZ - 1.5);
      animRoom(R, dt);
      if (!G.done && (G.lives <= 0 || (G.t >= G.dur && !G.items.length))) { G.done = true; const q = Math.min(1, G.total ? G.caught / G.total : 0) * (G.lives > 0 ? 1 : 0.7); setTimeout(() => R.game === G && endGame(R, false, G.score, q), 700); }
    };
  }
  SD._startGame = R => startGame(R);
})(typeof window !== 'undefined' ? window : globalThis);
