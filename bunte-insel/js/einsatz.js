'use strict';
/* Bunte Insel – Fellretter-Einsätze: werden NUR an der Einsatz-Tafel in der Fellretter-Bucht angenommen, führen dann aber in andere Welten
   (Freizeitpark, Stadt, Regenbogenwelt, Freibad, Camp, Spielplatz …) und enden mit dem Bericht an der Tafel.
   Ablauf: Tafel (E/Knopf) → Einsatz annehmen → Leuchtsäule + Pfeil zeigen das Ziel → am Ziel „Helfen“ → nächstes Ziel → zurück zur Tafel → Belohnung.
   Sparsam: eine einzige Leuchtsäule, ein Tafel-Bild, ein kleiner Hinweis oben; alles Weitere passiert nur während eines Einsatzes. */
BI.EINSATZ = [
  { id: 'teddy', pup: 'Pia', icon: '🧸', title: 'Der verlorene Teddy', quote: 'Oh nein, ein Teddy ist vom Riesenrad gefallen und ein Mädchen weint! Los, wir helfen!',
    steps: [{ at: 'karussell', icon: '🧸', text: 'Im Freizeitpark den Teddy aufsammeln', done: 'Gefunden! Der Teddy ist ganz weich und nur etwas staubig.' }, { at: 'staedte', icon: '🎁', text: 'In der Stadt dem Mädchen den Teddy geben', done: 'Das Mädchen strahlt: „Mein Bärchen! Danke, Fellretter!“' }] },
  { id: 'lautsprecher', pup: 'Brumm', icon: '🔧', title: 'Die stumme Bühne', quote: 'Die Lautsprecher der Regenbogen-Bühne brummen nicht mehr. Ich brauche Werkzeug und deine Hilfe!',
    steps: [{ at: 'spielzeug', icon: '🧰', text: 'Beim Spielzeugladen den Werkzeugkasten holen', done: 'Werkzeugkasten gepackt – Schraubenzieher, Zange und ein Hammer!' }, { at: 'buehne', icon: '🔌', text: 'An der Regenbogen-Bühne den Lautsprecher reparieren', done: 'Klick! Der Lautsprecher dröhnt wieder – die Menge jubelt! 🎶' }] },
  { id: 'katze', pup: 'Sprudel', icon: '🐱', title: 'Katze auf dem Dach', quote: 'In der Stadt sitzt eine Katze auf dem Dach und traut sich nicht herunter. Das ist ein Fall für die Leiter!',
    steps: [{ at: 'staedte2', icon: '🪜', text: 'In der Stadt die Leiter anstellen', done: 'Die Leiter steht! Die Katze springt vorsichtig auf deinen Arm.' }, { at: 'tierpark', icon: '🐾', text: 'Im Tierpark die Katze absetzen', done: 'Miau! Die Katze schnurrt und sucht sich ein Sonnenplätzchen.' }] },
  { id: 'westen', pup: 'Welle', icon: '🦺', title: 'Westen fürs Freibad', quote: 'Im Freibad fehlen Schwimmwesten für die Kleinen. Im Camp liegen noch welche – hol sie bitte!',
    steps: [{ at: 'camp', icon: '🦺', text: 'Im Camp die Schwimmwesten einsammeln', done: 'Fünf bunte Schwimmwesten sind eingesammelt!' }, { at: 'bad', icon: '🏊', text: 'Am Freibad die Westen verteilen', done: 'Alle Kinder haben eine Weste – jetzt ist Planschen sicher!' }] },
  { id: 'eis', pup: 'Rodel', icon: '🧊', title: 'Eis für die Parade', quote: 'Bei der Pride-Parade in der Regenbogenwelt wird es heiß. Im Freizeitpark gibt es kaltes Eis – schnell hin!',
    steps: [{ at: 'eisbude', icon: '🧊', text: 'An der Eisbude im Freizeitpark Eis abholen', done: 'Die Kühlbox ist randvoll mit Eis in allen Regenbogenfarben!' }, { at: 'plaza', icon: '🍦', text: 'Auf der Regenbogen-Plaza das Eis verteilen', done: 'Alle in der Parade freuen sich über eine kühle Erfrischung!' }] },
  { id: 'pflaster', pup: 'Bella', icon: '🩹', title: 'Pflaster-Alarm', quote: 'Ein Kind hat sich auf dem Spielplatz das Knie aufgeschürft. Ich brauche Pflaster – aus dem Krankenhaus!',
    steps: [{ at: 'hospital', icon: '🩹', text: 'Im Krankenhaus Pflaster holen', done: 'Pflaster mit Sternchen – die sind die besten!' }, { at: 'spielplatz', icon: '🧒', text: 'Auf dem Spielplatz das Pflaster aufkleben', done: 'Das Kind lächelt wieder. „Tut schon gar nicht mehr weh!“' }] },
  { id: 'wanderer', pup: 'Blitz', icon: '🔦', title: 'Wanderer verlaufen', quote: 'Wuff! Meine Nase sagt: Im Verbotenen Wald hat sich jemand verlaufen. Wir müssen ihn finden!',
    steps: [{ at: 'wald', icon: '🔦', text: 'Am Verbotenen Wald den Wanderer finden', done: 'Gefunden! Der Wanderer ist müde, aber ganz unverletzt.' }, { at: 'camp', icon: '⛺', text: 'Den Wanderer zum Camp bringen', done: 'Am Lagerfeuer gibt es warmen Kakao. Alles gut!' }] },
  { id: 'schluessel', pup: 'Pia', icon: '🔑', title: 'Der Schlüssel-Flug', quote: 'Von oben habe ich einen Schlüssel blitzen sehen – vor dem Kino! Der gehört bestimmt jemandem in der Stadt.',
    steps: [{ at: 'kino', icon: '🔑', text: 'Vor dem Kino den Schlüssel finden', done: 'Da liegt er, ein goldener Schlüssel mit Herz-Anhänger!' }, { at: 'staedte3', icon: '🏛️', text: 'Am Stadttor den Schlüssel abgeben', done: 'Der Stadtwächter ist erleichtert: „Mein Schlüssel! Wie wunderbar!“' }] }
,
  { id: 'leuchtturm', pup: 'Welle', icon: '💡', title: 'Das flackernde Licht', quote: 'Das Licht am Leuchtturm flackert, und draußen ist es neblig. Ein Schiff könnte sich verirren!',
    steps: [{ at: 'leuchtturm', icon: '💡', text: 'Am Leuchtturm die Glühbirne wechseln', done: 'Es werde Licht! Der Strahl leuchtet wieder weit über das Meer.' }, { at: 'steg', icon: '⛵', text: 'Am Steg das Boot festbinden', done: 'Das Boot liegt sicher am Steg. Gut gemacht!' }] },
  { id: 'gleise', pup: 'Brumm', icon: '🪵', title: 'Baumstamm auf den Gleisen', quote: 'Ein Baumstamm liegt auf den Zuggleisen! Der Zug darf dort nicht lang fahren, bevor wir ihn wegräumen.',
    steps: [{ at: 'bahnhof', icon: '🪵', text: 'Am Bahnhof den Baumstamm von den Gleisen räumen', done: 'Mit vereinten Kräften ist der Stamm weg. Die Gleise sind frei!' }, { at: 'staedte', icon: '📣', text: 'In der Stadt Bescheid geben: Zug fährt wieder', done: 'Die Durchsage läuft: „Der Zug fährt wieder!“ Alle sind erleichtert.' }] },
  { id: 'kabel', pup: 'Sprudel', icon: '🧯', title: 'Heißes Kabel', quote: 'Bei der Parade ist ein Kabel heiß gelaufen und qualmt. Schnell kühlen und danach den Park prüfen!',
    steps: [{ at: 'plaza', icon: '🧯', text: 'Auf der Regenbogen-Plaza das heiße Kabel kühlen', done: 'Psssch! Das Kabel ist kühl, niemand ist verletzt.' }, { at: 'parkeingang', icon: '🎡', text: 'Am Freizeitpark die Sicherungen prüfen', done: 'Alle Sicherungen sind in Ordnung. Das Riesenrad dreht weiter!' }] },
  { id: 'hund', pup: 'Blitz', icon: '🐕', title: 'Ausgerissener Hund', quote: 'Wuff! Ein kleiner Hund ist von zu Hause ausgerissen. Meine Nase hat schon eine Spur!',
    steps: [{ at: 'bauernhof', icon: '🐕', text: 'Auf dem Bauernhof der Pfotenspur folgen', done: 'Da ist er! Ein kleiner Hund, der sich im Heu versteckt hat.' }, { at: 'plaza', icon: '🏳️‍🌈', text: 'Auf der Regenbogen-Plaza den Hund abgeben', done: 'Mama Mara und Mama Lena freuen sich riesig: „Unser Hündchen!“' }] }
];

BI.createEinsatz = function (G) {
  const { scene, W, A, fx, P, say, save, persist, cam } = G, K = {}, MS = BI.EINSATZ, SP = W.spots, COLS = [[1, .82, .2], [.35, .7, 1], [1, .6, .2], [1, 1, 1]];
  /* Zielorte (in den anderen Welten); fit() schiebt sie auf begehbaren Boden */
  const PARK = BI.PARK, RB = BI.RAINBOW, CIT = BI.CINEMA;
  const WHERE = {
    karussell: [252, 38, 'Freizeitpark'], eisbude: [274, 17, 'Freizeitpark'], staedte: [0, -262, 'Stadt'], staedte2: [0, -248, 'Stadt'], staedte3: [0, -238, 'Stadt'],
    spielzeug: [SP.shop.x, SP.shop.z + 8, 'Spielzeugladen'], buehne: [RB.x - 27, RB.z + 10, 'Regenbogenwelt'], plaza: [RB.x + 16, RB.z + 6, 'Regenbogenwelt'], tierpark: [SP.tierpark.x, SP.tierpark.z, 'Tierpark'],
    camp: [SP.camp.x, SP.camp.z + 5, 'Camp'], leuchtturm: [SP.lighthouse.x, SP.lighthouse.z + 5, 'Leuchtturm'], steg: [4.5, 168, 'Steg'], bahnhof: [SP.station.x, SP.station.z + 6, 'Bahnhof'], parkeingang: [PARK.bridge.x1 + 6, PARK.z, 'Freizeitpark'], bauernhof: [SP.farm.customer.x, SP.farm.customer.z, 'Bauernhof'], bad: [SP.pool.gate.x, SP.pool.gate.z - 4, 'Freibad'], hospital: [SP.hospital.x, SP.hospital.z, 'Krankenhaus'], spielplatz: [SP.park.x, SP.park.z - 4, 'Spielplatz'],
    wald: [SP.forest.gate.x, SP.forest.gate.z, 'Verbotener Wald'], kino: [CIT.door.x, CIT.door.z + 1.5, 'Kino']
  };
  const _o = {}, fit = (x, z) => { const q = W.resolve(x, z, .6, _o); return { x: q.x, z: q.z }; };
  const cache = {}, spot = k => cache[k] || (cache[k] = fit(WHERE[k][0], WHERE[k][1]));
  const board = () => SP.pupsBoard;
  const E = () => save.einsatz || (save.einsatz = { done: [], cur: null });
  const byId = id => MS.find(m => m.id === id);
  const cur = () => { const e = E(); return e.cur ? byId(e.cur.id) : null; };
  /* Ziel des Moments: aktueller Schritt, sonst die Tafel (Bericht) */
  const target = () => { const m = cur(); if (!m) return null; const s = E().cur.step; if (s >= m.steps.length) { const b = board(); return { x: b.x, z: b.z, icon: '🚨', text: 'Zur Einsatz-Tafel in der Fellretter-Bucht: Bericht abgeben', world: 'Fellretter-Bucht' }; } const st = m.steps[s], q = spot(st.at); return { x: q.x, z: q.z, icon: st.icon, text: st.text, world: WHERE[st.at][2] }; };
  /* ===== Einsatz-Tafel (Bild an der Tafel in der Bucht) ===== */
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 410; const cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv);
  let boardSig = '';
  const paint = () => { const e = E(), sig = e.done.join() + '|' + (e.cur ? e.cur.id + e.cur.step : ''); if (sig === boardSig) return; boardSig = sig;
    const g = cx.createLinearGradient(0, 0, 0, 410); g.addColorStop(0, '#1d4fa8'); g.addColorStop(1, '#14305f'); cx.fillStyle = g; cx.fillRect(0, 0, 512, 410); cx.fillStyle = '#ffd23f'; cx.fillRect(0, 0, 512, 54);
    cx.textBaseline = 'middle'; cx.textAlign = 'center'; cx.fillStyle = '#14305f'; cx.font = 'bold 34px Fredoka, system-ui, sans-serif'; cx.fillText('🚨 EINSATZ-TAFEL · ' + e.done.length + '/' + MS.length, 256, 29);
    MS.forEach((m, i) => { const y = 80 + i * 27, done = e.done.includes(m.id), act = e.cur && e.cur.id === m.id; cx.textAlign = 'left'; cx.fillStyle = act ? '#ffd23f' : done ? '#8fe6a8' : '#fff'; cx.font = (act ? 'bold ' : '') + '21px Fredoka, system-ui, sans-serif'; cx.fillText((done ? '✅ ' : act ? '▶ ' : m.icon + ' ') + m.title, 24, y); cx.textAlign = 'right'; cx.fillStyle = '#b9cdf5'; cx.font = '17px Fredoka, system-ui, sans-serif'; cx.fillText(m.pup, 490, y); });
    tex.needsUpdate = true; };
  { const b = board(); if (b) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.64), new THREE.MeshBasicMaterial({ map: tex })); pl.position.set(b.x, 3.9, b.z + 2.7); pl.rotation.y = Math.PI; scene.add(pl); paint(); } }
  /* ===== Leuchtsäule am Ziel ===== */
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 70, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .34, depthWrite: false, fog: false, side: THREE.DoubleSide }));
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.0, 3.0, 32), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .55, depthWrite: false, fog: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2;
  beam.visible = ring.visible = false; beam.position.y = 35; ring.position.y = .15; scene.add(beam, ring);
  /* ===== Hinweis oben: Einsatz, Ziel, Entfernung, Pfeil ===== */
  const host = document.getElementById('mission'), chip = document.createElement('div'); chip.className = 'chip'; chip.hidden = true;
  BI.injectHudCss(); chip.classList.add('eChip');
  chip.innerHTML = '<span style="font-size:22px">🚨</span><span style="flex:1"></span><span class="eArr" style="font-size:22px;display:inline-block">⬆️</span><b class="eDist"></b>';
  if (host && host.parentNode) host.parentNode.appendChild(chip); else document.body.appendChild(chip);
  const eTxt = chip.children[1], eArr = chip.querySelector('.eArr'), eDist = chip.querySelector('.eDist'); let hudT = 0, lastTxt = '';
  /* ===== Interaktion ===== */
  K.near = function () {
    if (P.veh || P.y > 1.5) return null; const t = target(), m = cur();
    if (t && m && E().cur.step < m.steps.length && Math.hypot(P.x - t.x, P.z - t.z) < 3.8) return { k: 'ehilfe' };
    const b = board(); if (b && Math.hypot(P.x - b.x, P.z - b.z) < 3.4) return { k: 'ebrett' };
    return null;
  };
  const next = () => MS.find(m => !E().done.includes(m.id)) || MS[(E().done.length) % MS.length];
  const reward = m => { const e = E(), first = !e.done.includes(m.id), n = first ? 5 : 2; if (first) e.done.push(m.id); e.cur = null; let msg = '🏅 Einsatz geschafft: ' + m.title + '! +' + n + ' ⭐';
    G.addStars(n); if (first && e.done.length === MS.length) { G.addStars(30); e.medal = true; msg = '🥇 ALLE Einsätze geschafft! Du bekommst die Goldene Fellretter-Medaille! +35 ⭐'; }
    A.fanfare && A.fanfare(); const b = board(); fx.burst(b.x, 2.4, b.z, 30, COLS, 4, 1.5, 28, 3); say(msg, 5200); persist(); paint(); refresh(); };
  K.act = function (n) {
    if (!n) return; const e = E(), m = cur();
    if (n.k === 'ehilfe' && m) { const st = m.steps[e.cur.step]; e.cur.step++; A.star && A.star(); fx.burst(P.x, 1.6, P.z, 22, COLS, 4, 1.2, 26, 3); const fin = e.cur.step >= m.steps.length; say(st.icon + ' ' + st.done + (fin ? ' – Auf zur Einsatz-Tafel in der Fellretter-Bucht!' : ''), 5200); persist(); paint(); refresh(); return; }
    if (n.k !== 'ebrett') return;
    if (m && e.cur.step >= m.steps.length) { reward(m); return; }
    if (m) { const t = target(); say('🚨 ' + m.pup + ': „' + t.icon + ' ' + t.text + ' (' + t.world + ').“ Folge der gelben Leuchtsäule!', 5200); return; }
    const nm = next(); e.cur = { id: nm.id, step: 0 }; persist(); paint(); refresh(); A.fanfare && A.fanfare(); fx.burst(P.x, 1.6, P.z, 22, COLS, 4, 1.2, 26, 3);
    say('🚨 Einsatz angenommen! ' + nm.pup + ': „' + nm.quote + '“', 7000);
  };
  /* Anzeige aktualisieren (Säule, Hinweis) */
  function refresh() { const t = target(); beam.visible = ring.visible = !!t; if (t) { beam.position.set(t.x, 35, t.z); ring.position.set(t.x, .15, t.z); } chip.hidden = !t || !G.playing(); lastTxt = ''; }
  K.refresh = refresh;
  K.update = function (dt, t) {
    const tg = target(); if (!tg) { if (!chip.hidden) chip.hidden = true; if (beam.visible) beam.visible = ring.visible = false; return; } if (!beam.visible) refresh();
    ring.scale.setScalar(1 + .12 * Math.sin(t * 4)); beam.material.opacity = .26 + .1 * Math.sin(t * 3);
    hudT -= dt; if (hudT > 0) return; hudT = .25; const play = G.playing(); if (chip.hidden === play) chip.hidden = !play; if (!play) return;
    const dx = tg.x - P.x, dz = tg.z - P.z, d = Math.hypot(dx, dz), fw = [-Math.sin(cam.yaw), -Math.cos(cam.yaw)], rt = [Math.cos(cam.yaw), -Math.sin(cam.yaw)], rel = Math.atan2(dx * rt[0] + dz * rt[1], dx * fw[0] + dz * fw[1]);
    const m = cur(), txt = (m ? m.title + ': ' : '') + tg.icon + ' ' + tg.text; if (txt !== lastTxt) { lastTxt = txt; eTxt.textContent = txt; }
    eArr.style.transform = 'rotate(' + (rel * 180 / Math.PI).toFixed(0) + 'deg)'; eDist.textContent = d < 1000 ? Math.round(d) + ' m' : '';
  };
  if (E().cur && !byId(E().cur.id)) { E().cur = null; persist(); }
  K.missions = MS; K.state = E; K.target = target;
  return K;
};
