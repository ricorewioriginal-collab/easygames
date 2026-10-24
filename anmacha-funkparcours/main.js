/* Funkparcours – Spielablauf: Einzelläufe nacheinander (Show mit 3 Parcours oder Training), Zeiten werden verglichen. */
import { Sim, COURSES, DT, fmtTime, rank, pointsFor, standings } from './engine.js';
import { SFX, Audio_ } from './audio.js';
import { initPair, JOIN, loadScript } from './pair.js';
import { CHARS, validChar, charName, charGame, charGroups } from './chars.js';
import { createUI } from './menu.js';
import { stick, hold } from './stick.js';
import { makeCommentator } from './commentary.js';
const $ = id => document.getElementById(id), esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const COLORS = [0xff6fb0, 0x00b8d9, 0xffd24a, 0x8b5cf6], CSS = ['#ff6fb0', '#00b8d9', '#ffd24a', '#8b5cf6'], LOGO = [5, 1, 8, 12], MAXT = 90, ABORT = { abort: 1 };
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
window.addEventListener('error', e => { $('errTxt').textContent = String(e.message || e); $('err').hidden = false; });
window.addEventListener('unhandledrejection', e => { if (e.reason === ABORT) return; $('errTxt').textContent = String((e.reason && e.reason.message) || e.reason); $('err').hidden = false; });

if (JOIN) {
  document.body.classList.add('ctrl'); (await import('./controller.js')).startController();
} else {
  const touch = matchMedia('(pointer:coarse)').matches; if (touch) document.body.classList.add('touch');
  const ui = createUI({ SFX, Audio_, touch, onMenu: id => onMenu(id), panel: id => panel(id) }), frame = () => new Promise(r => requestAnimationFrame(() => r()));
  // ------------------------------------------------------------ Laden mit echtem Fortschritt: 3D-Bibliothek → Studio → Logos
  ui.boot.progress(6, 'Lade 3D-Grafik …');
  try { await loadScript(THREE_URL); } catch (e) { $('errTxt').textContent = 'Die 3D-Bibliothek konnte nicht geladen werden (Internet?).'; $('err').hidden = false; throw e; }
  // Figuren: Lader + gemeinsame easygames-Figuren + Figuren-Liste aller Spiele (fehlt etwas, läuft das Spiel trotzdem)
  await Promise.all(['../vendor/three-r128-gltfloader.js', '../figuren/figuren.js', '../easyclash/js/roster.js'].map(u => loadScript(u).catch(e => console.warn(e))));
  ui.boot.progress(38, 'Baue das Studio …'); await frame();
  const { Arena } = await import('./scene.js');
  let booting = true; const texDone = new Promise(res => { const M = window.THREE.DefaultLoadingManager; M.onProgress = (u, n, total) => { if (booting) ui.boot.progress(60 + 38 * n / total, `Lade Läufer und Logos (${n}/${total}) …`); }; M.onLoad = () => res(); setTimeout(res, 8000); });
  const arena = new Arena($('cv'), Array.from({ length: 16 }, (_, i) => `logos/${String(i + 1).padStart(2, '0')}.png`));
  addEventListener('resize', () => arena.resize());
  ui.boot.progress(60, 'Lade Senderlogos …');
  { const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; document.querySelector('.cm-tag').hidden = true; }; im.onerror = () => {}; im.src = 'logo.png'; }

  const S = { mode: 'show', n: 2, names: store.get('fpNames', []).slice(0, 4), chars: store.get('fpChars', [0, 1, 3, 2]).slice(0, 4), tc: 0 };
  for (let i = 0; i < 4; i++) { if (!S.names[i]) S.names[i] = 'Läufer ' + (i + 1); if (!validChar(S.chars[i])) S.chars[i] = i; }
  let G = null, token = 0, pending = null, curCourse = -1, snd = store.get('fpSnd', true), keys = 0, touchM = 0; const phoneM = [0, 0, 0, 0];
  Audio_.setOn(snd);
  const FAST = () => window.__fpFast || 1, sleep = ms => new Promise(r => setTimeout(r, ms / FAST()));
  const bests = () => store.get('fpBest1', {});
  const show = id => { for (const s of ['menu', 'setup', 'game']) $(s).hidden = s !== id; if (id === 'menu') ui.menu.refresh(); };
  const setSnd = () => { const b = $('bSound'); b.querySelector('.ic').textContent = snd ? '🔊' : '🔇'; b.querySelector('.lb').textContent = snd ? 'Ton: an' : 'Ton: aus'; $('bSnd').textContent = snd ? '🔊' : '🔇'; $('aSnd').querySelector('.ai').textContent = snd ? '🔊' : '🔇'; };
  const toggleSnd = () => { snd = !snd; Audio_.setOn(snd); store.set('fpSnd', snd); setSnd(); SFX.click(); };
  setSnd();

  // ------------------------------------------------------------ Karten (Dialoge) mit Warte-Funktion
  function ask(html, ids) { $('cardBox').innerHTML = html; $('card').hidden = false; const fb = $('cardBox').querySelector('button'); if (fb) fb.focus({ preventScroll: true }); return new Promise(res => { pending = { res, ids }; }); }
  function fire(id) { if (pending && pending.ids.includes(id)) { const p = pending; pending = null; $('card').hidden = true; p.res(id); } }
  $('cardBox').addEventListener('click', e => { const b = e.target.closest('button[id]'); if (b) { SFX.click(); fire(b.id); } });
  const commentator=makeCommentator();
  let lastSection=-1;
  function announceSection(sim){
    if(!G||G.phase!=='run'||!sim||!G.course)return;
    const sections=G.course.secs||[];
    let section=-1;
    for(let i=0;i<sections.length;i++)if(sim.x>=sections[i].x-1.5)section=i;
    if(section===lastSection||section<0)return;
    lastSection=section;
    const name=sections[section].n;
    const tips={Stufensprung:'Stufensprünge! Gut abspringen, bloß nicht ins Wasser!',Fahrstuhl:'Der Fahrstuhl! Jetzt muss das Timing stimmen!',Schiebebrücke:'Die Brücke bewegt sich! Der Sprung muss sitzen!','Bruchplatten':'Bruchplatten! Schnell weiter, bevor sie fallen!','Abrissbirnen':'Vorsicht, die Abrissbirnen schwingen!',Hangelstangen:'Jetzt an die Hangelstangen! Nicht loslassen!',Steilwand:'Die Schlusswand! Anlauf nehmen und hoch da!'};
    commentator.speak(tips[name]||('Jetzt folgt: '+name+'.'));
  }
  function abort() { commentator.stop();lastSection=-1;token++; const p = pending; pending = null; $('card').hidden = true; $('big').hidden = true; G = null; padOn(false); arena.setGhost(null); if (p) p.res('abort'); push(); }
  const rows = (runs, pl, upto) => { const ord = rank(runs.map(r => r || { finished: false, dist: -1 })); return ord.filter(i => runs[i]).map((i, k) => { const r = runs[i]; return `<div class="tr ${r.finished ? '' : 'dnf'}" style="--pc:${CSS[i]}"><em>${k + 1}.</em><b>${esc(pl[i].name)}</b><span>${r.finished ? fmtTime(r.time) : r.why}</span>${upto != null ? `<em>+${r.pts || 0}</em>` : ''}</div>`; }).join(''); };

  // ------------------------------------------------------------ Eingabe
  const KEYMAP = { ArrowLeft: 1, KeyA: 1, ArrowRight: 2, KeyD: 2, Space: 4, ArrowUp: 4, KeyW: 4, ArrowDown: 8, KeyS: 8, ShiftLeft: 8, ShiftRight: 8 };   // 1 links, 2 rechts, 4 Sprung, 8 Greifen
  addEventListener('keydown', e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; const b = KEYMAP[e.code]; if (b) { keys |= b; if (G && G.phase !== 'ready') e.preventDefault(); } if ((e.code === 'Space' || e.code === 'Enter') && pending && pending.ids.includes('bReady')) { e.preventDefault(); fire('bReady'); } });
  addEventListener('keyup', e => { const b = KEYMAP[e.code]; if (b) keys &= ~b; });
  addEventListener('blur', () => { keys = 0; touchM = 0; });
  // Touch: Stick links (Bits 1/2), Springen rechts (Bit 4), dazu Menü und Ton
  const stk = stick($('stick'), m => { touchM = (touchM & ~3) | m; }), jumpUp = hold(document.querySelector('#pad [data-k="j"]'), () => { touchM |= 4; }, () => { touchM &= ~4; });
  const padOn = v => { $('pad').hidden = !v; $('game').classList.toggle('pl', v); if (!v) { stk.reset(); jumpUp(); touchM = 0; } };
  let padM = 0; const readInput = () => { const m = keys | touchM | padM | (G ? phoneM[G.cur] : 0); return { l: m & 1, r: m & 2, j: m & 4, g: m & 8 }; };

  // ------------------------------------------------------------ Handy-Kopplung
  const hasPhone = i => pair.has(i);
  const pair = initPair({
    names: () => S.names.slice(0, G ? G.players.length : S.n),
    freeSlot: () => { const n = G ? G.players.length : S.mode === 'train' ? 1 : S.n; for (let i = 0; i < n; i++) if (!pair.has(i)) return i; return -1; },
    onJoin: (slot, name) => { S.names[slot] = name; if (G && G.players[slot]) G.players[slot].name = name; store.set('fpNames', S.names); fillNames(); if (G) updateTop(); },
    onMessage: (slot, m) => { if (m.t === 'in') phoneM[slot] = (m.v | 0) & 15; else if (m.t === 'ready' && G && G.cur === slot) fire('bReady'); },
    onChange: () => { for (let i = 0; i < 4; i++) if (!pair.has(i)) phoneM[i] = 0; push(); },
    snapshot: () => snapshot()
  });
  const push = () => pair.push();
  function snapshot() {
    if (!G) return { view: 'menu' };
    if (G.over) return { view: 'end', players: G.players.map((p, i) => ({ n: p.name, p: p.pts, c: i })), order: standings(G.players), say: G.say };
    return { view: 'game', cur: G.cur, phase: G.phase, cname: G.course.name, players: G.players.map((p, i) => ({ n: p.name, p: p.pts, c: i })), say: G.say || '' };
  }

  // ------------------------------------------------------------ Menü / Einrichtung
  function fillNames() {
    const n = S.mode === 'train' ? 1 : S.n; $('names').innerHTML = Array.from({ length: n }, (_, i) => `<div class="nm" style="--pc:${CSS[i]}"><input data-i="${i}" maxlength="14" value="${esc(S.names[i])}" aria-label="Name Läufer ${i + 1}" autocomplete="off"><button class="chb" data-c="${i}" aria-label="Figur wählen">🧍 ${esc(charName(S.chars[i]))} ▸</button></div>`).join('');
    $('names').querySelectorAll('.chb').forEach(b => b.onclick = () => { SFX.click(); pickChar(+b.dataset.c); });
    $('names').querySelectorAll('input').forEach(inp => inp.oninput = () => { S.names[+inp.dataset.i] = inp.value.trim().slice(0, 14) || 'Läufer ' + (+inp.dataset.i + 1); store.set('fpNames', S.names); });
  }
  function setupView(mode) {
    S.mode = mode; const tr = mode === 'train'; $('setTitle').textContent = tr ? 'Training' : 'Neue Show'; $('fldPl').hidden = tr; $('fldCourse').hidden = !tr;
    $('setInfo').textContent = tr ? 'Übe einen Parcours. Deine Bestzeit wird gespeichert und als Geist mitgeschickt.' : 'Drei Parcours, jeder Läufer allein auf der Strecke. Die Zeiten werden verglichen – Sieger ist, wer am Ende die meisten Punkte hat.';
    const b = bests(); $('sgCourse').innerHTML = COURSES.map((c, i) => `<button data-v="${i}" class="${i === S.tc ? 'on' : ''}">${esc(c.name)}${b[i] ? `<br><small>${fmtTime(b[i].t)}</small>` : ''}</button>`).join('');
    $('sgPl').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.v === S.n)); fillNames(); show('setup'); loadScene(S.tc);
  }
  const seg = (id, fn) => $(id).addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; SFX.click(); $(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); fn(+b.dataset.v); });
  seg('sgPl', v => { S.n = v; fillNames(); push(); }); seg('sgCourse', v => { S.tc = v; loadScene(v); });
  function loadScene(ci) { if (curCourse !== ci) { curCourse = ci; arena.setCourse(COURSES[ci]); } }
  function look(i) { return arena.setLook(COLORS[i], LOGO[i], S.chars[i]); }
  // Figur wählen: eigene Läufer und alle Figuren aus anderen easygames (nach Spiel gruppiert); Vorschau läuft im Studio mit
  function pickChar(i) {
    const cur = S.chars[i];
    $('pickTitle').textContent = 'Figur für ' + S.names[i]; $('pickBox').style.setProperty('--pc', CSS[i]);
    $('pickList').innerHTML = charGroups().map(g => `<h3>${esc(g.n)}</h3><div class="pk-g">${g.list.map(c => `<button class="pk${c.k === cur ? ' on' : ''}" data-k="${esc(c.k)}" style="--cc:${esc(c.c)}"><i></i>${esc(c.n)}</button>`).join('')}</div>`).join('');
    $('pick').hidden = false; look(i);
    const on = $('pickList').querySelector('.pk.on') || $('pickList').querySelector('.pk'); if (on) { on.focus({ preventScroll: true }); on.scrollIntoView({ block: 'center' }); }
    $('pickList').onclick = e => { const b = e.target.closest('.pk'); if (!b) return; SFX.click(); const k = /^\d+$/.test(b.dataset.k) ? +b.dataset.k : b.dataset.k; S.chars[i] = k; store.set('fpChars', S.chars); $('pickList').querySelectorAll('.pk').forEach(x => x.classList.toggle('on', x === b)); look(i); $('pickWho').textContent = charGame(k) ? 'aus ' + charGame(k) : ''; };
    $('pickWho').textContent = charGame(cur) ? 'aus ' + charGame(cur) : '';
  }
  $('bPickOk').onclick = () => { SFX.click(); $('pick').hidden = true; fillNames(); };

  // ------------------------------------------------------------ Lauf
  const ghostAt = (g, t) => { if (!g || g.length < 4) return null; const f = t * 20, i = Math.min(Math.floor(f), g.length / 2 - 2); if (i < 0) return [g[0], g[1]]; const u = Math.min(1, f - i); return [g[2 * i] + (g[2 * i + 2] - g[2 * i]) * u, g[2 * i + 1] + (g[2 * i + 3] - g[2 * i + 1]) * u]; };
  const updateTop = () => { const p = G.players[G.cur]; $('rCourse').textContent = G.course.name + (G.mode === 'train' ? ' · Training' : ` · Lauf ${G.cur + 1}/${G.players.length}`); $('rName').textContent = p.name; $('rName').style.setProperty('--pc', CSS[G.cur]); };
  const big = (txt, cls, ms) => { const b = $('big'); b.className = cls || ''; b.textContent = txt; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; if (ms) setTimeout(() => { if (b.textContent === txt) b.hidden = true; }, ms / FAST()); };

  async function turn(tok, ci, pi, runs, leader) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; };
    const course = COURSES[ci]; commentator.stop(); lastSection=-1; G.course = course; G.cur = pi; G.phase = 'ready'; G.say = ''; phoneM[pi] = 0; updateTop(); show('game'); padOn(false); $('clock').textContent = fmtTime(0);
    loadScene(ci); look(pi); G.sim = null; let ghost = null; if (G.mode === 'train') { const b = bests()[ci]; ghost = b ? b.g : null; } else if (leader && leader.g) ghost = leader.g; G.ghost = ghost; arena.setGhost(ghost);
    push();
    const ph = hasPhone(pi);
    await A(ask(`<div class="card"><h2 style="color:${CSS[pi]}">${esc(G.players[pi].name)}</h2><div class="sub">${esc(course.name)}${G.mode === 'train' ? ' · Training' : ` · Lauf ${pi + 1} von ${G.players.length}`}</div>${runs.some(Boolean) ? `<div class="tbl">${rows(runs, G.players)}</div>` : ''}${ghost ? '<div class="hint">👻 Der Geist zeigt die Bestzeit.</div>' : ''}<div class="hint ${ph ? 'ph' : ''}">${ph ? '📱 Tippe am Handy auf „Bereit"' : 'Bereit? Leertaste oder Button'}</div><button class="btn green" id="bReady">Bereit!</button></div>`, ['bReady']));
    // Die Vorstellung vor dem visuellen Countdown sprechen, nicht die Zahlen verzögert nachholen.
    commentator.speak(G.players[pi].name+' ist am Start. '+course.name+'. Auf die Plätze!',true);
    await A(sleep(1950));
    commentator.stop();
    G.phase = 'count'; push(); keys = touchM = 0;
    for (const n of [3, 2, 1]) { big(String(n), '', 700); SFX.count(); await A(sleep(800)); }
    big('LOS!', '', 800); SFX.go(); arena.fire(1); G.phase = 'run'; push();
    const sim = new Sim(course); G.sim = sim; padOn(true); const rec = []; let acc = 0, n = 0, prevG = true;
    const res = await A(new Promise(done => {
      G.tick = dt => {
        acc += dt;
        while (acc >= DT && !sim.dead && !sim.finished) {
          acc -= DT; const o = window.__fpInput; sim.step(o ? o(sim) : readInput()); announceSection(sim); if (n++ % 3 === 0) rec.push(Math.round(sim.x * 100) / 100, Math.round(sim.y * 100) / 100);
          if (prevG && !sim.onGround && sim.vy > 0) SFX.jump(); else if (!prevG && sim.onGround) SFX.land(); prevG = sim.onGround;
          if (sim.t >= MAXT && !sim.finished) sim.dead = 'time';
        }
        $('clock').textContent = fmtTime(sim.t);
        if (sim.dead || sim.finished) { G.tick = null; done({ finished: sim.finished, time: sim.t, dist: sim.dist, dead: sim.dead }); }
      };
    }));
    G.phase = 'done'; padOn(false); phoneM[pi] = 0;
    if (res.finished) { commentator.speak('Im Ziel! '+G.players[pi].name+' mit '+res.time.toFixed(1).replace('.',',')+' Sekunden! Stark!',true); res.why = ''; SFX.top(); arena.confetti(sim.x, sim.y); SFX.clap(1.4); big('ZIEL! ' + fmtTime(res.time), 'sm', 1600); }
    else { commentator.speak(res.dead==='time'?'Die Zeit ist abgelaufen. Das war ein spannender Lauf!':'Oh nein! Ein Sturz ins Wasser. Der Lauf ist vorbei.',true); res.why = res.dead === 'time' ? 'Zeit ab' : `Baden · ${Math.round(res.dist)} m`; if (res.dead === 'time') SFX.buzz(); else { arena.splash(sim.x); SFX.splash(); SFX.sad(); } big(res.dead === 'time' ? 'ZEIT ABGELAUFEN' : 'PLATSCH!', 'bad sm', 1500); }
    res.g = rec; G.say = res.finished ? fmtTime(res.time) : res.why; push();
    await A(sleep(1700)); return res;
  }

  const bestUpdate = (ci, res, name) => { if (!res.finished) return false; const b = bests(); if (!b[ci] || res.time < b[ci].t) { b[ci] = { t: Math.round(res.time * 100) / 100, n: name, g: res.g }; store.set('fpBest1', b); return true; } return false; };

  async function coroutine(tok, mode) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; };
    const np = mode === 'train' ? 1 : S.n; G = { mode, players: Array.from({ length: np }, (_, i) => ({ name: S.names[i], pts: 0, secs: 0 })), cur: 0, phase: 'ready', course: COURSES[0], over: false }; show('game');
    if (mode === 'train') {
      for (;;) {
        const ci = S.tc, runs = [null], r = await turn(tok, ci, 0, runs, null); runs[0] = r; const nb = bestUpdate(ci, r, G.players[0].name), b = bests()[ci];
        const pick = await A(ask(`<div class="card"><h2>${esc(COURSES[ci].name)}</h2>${r.finished ? `<div class="bigt">${fmtTime(r.time)}</div>` : `<div class="bigt bad">${esc(r.why)}</div>`}<div class="sub">${nb ? '🏅 Neue Bestzeit!' : b ? 'Bestzeit: ' + fmtTime(b.t) : 'Noch keine Bestzeit – ab ins Ziel!'}</div><div class="row"><button class="btn green" id="bAgain">▶ Nochmal</button><button class="btn ghost" id="bToMenu">Menü</button></div></div>`, ['bAgain', 'bToMenu']));
        if (pick === 'bToMenu') { abort(); show('menu'); return; }
      }
    }
    for (let ci = 0; ci < COURSES.length; ci++) {
      const runs = new Array(np).fill(null); let leader = null;
      for (let pi = 0; pi < np; pi++) { const r = await turn(tok, ci, pi, runs, leader); runs[pi] = r; bestUpdate(ci, r, G.players[pi].name); if (r.finished && (!leader || r.time < leader.t)) leader = { t: r.time, g: r.g }; }
      const ord = rank(runs); ord.forEach((i, k) => { runs[i].pts = pointsFor(k, np); G.players[i].pts += runs[i].pts; G.players[i].secs += runs[i].finished ? runs[i].time : 120; });
      G.phase = 'board'; commentator.speak('Das ist die Wertung für '+COURSES[ci].name+'.',true); G.say = 'Wertung ' + COURSES[ci].name; push();
      const last = ci === COURSES.length - 1;
      await A(ask(`<div class="card"><h2>Wertung · ${esc(COURSES[ci].name)}</h2><div class="tbl">${rows(runs, G.players, 1)}</div>${np > 1 ? `<div class="sub">Gesamt: ${standings(G.players).map(i => esc(G.players[i].name) + ' ' + G.players[i].pts).join(' · ')}</div>` : ''}<button class="btn green" id="bNext">${last ? 'Endstand ▶' : 'Weiter: ' + esc(COURSES[ci + 1].name) + ' ▶'}</button></div>`, ['bNext']));
    }
    const ord = standings(G.players), w = G.players[ord[0]]; commentator.speak(np>1?'Die Entscheidung ist gefallen! '+w.name+' gewinnt die Funkparcours Show!':'Geschafft! Du hast die Funkparcours Show gemeistert!',true); G.over = true; G.say = np > 1 ? w.name + ' gewinnt!' : 'Geschafft!'; push(); SFX.fanfare(); arena.confetti(arena.cx, 2); look(ord[0]);
    const pick = await A(ask(`<div class="card"><h2>${np > 1 ? '🏆 ' + esc(w.name) + ' gewinnt!' : 'Show geschafft!'}</h2><div class="tbl">${ord.map((i, k) => `<div class="tr" style="--pc:${CSS[i]}"><em>${k + 1}.</em><b>${esc(G.players[i].name)}</b><span>${G.players[i].pts} Pkt</span><em>${G.players[i].secs.toFixed(1)} s</em></div>`).join('')}</div><div class="prize"><img src="logos/16.png" alt="RicoReWi Radioportal" width="56" height="56"><div><b>Hauptgewinn: Ruhm &amp; Ehre</b><small>gestiftet vom RicoReWi Radioportal 😉</small></div></div><div class="row"><button class="btn green" id="bAgain">Nochmal</button><button class="btn ghost" id="bToMenu">Menü</button></div></div>`, ['bAgain', 'bToMenu']));
    if (pick === 'bAgain') start('show'); else { abort(); show('menu'); }
  }
  function start(mode) { abort(); const tok = token; coroutine(tok, mode).catch(e => { if (e !== ABORT) throw e; }); }

  // ------------------------------------------------------------ Hauptschleife
  let last = performance.now();
  function loop(now) {
    const raw = Math.min(0.05, (now - last) / 1000), dt = raw * FAST(); last = now;
    padM = ui.gamepad(raw, !!G && (G.phase === 'run' || G.phase === 'count'));
    arena.attract = !G && !$('menu').hidden && curCourse >= 0 ? COURSES[curCourse].length * (0.5 - 0.5 * Math.cos(arena.time * 0.045)) : null;
    if (G && G.tick) G.tick(dt);
    const sim = G && G.sim, run = sim && (G.phase === 'run' || G.phase === 'done' || G.phase === 'board');
    arena.frame(run ? sim : null, dt, run && G.ghost ? ghostAt(G.ghost, sim.t) : G && G.ghost ? ghostAt(G.ghost, 0) : null, 2);
    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------ Verdrahtung
  // ------------------------------------------------------------ Hauptmenü: Aktionen und Info-Feld
  function onMenu(id) {
    if (id === 'show' || id === 'train') { Audio_.unlock(); setupView(id); $('bStart').focus({ preventScroll: true }); }
    else if (id === 'pair') pair.open();
    else if (id === 'rules') { $('rules').hidden = false; $('rulesOk').focus({ preventScroll: true }); }
    else if (id === 'sound') { toggleSnd(); ui.menu.refresh(); }
    else if (id === 'home') location.href = '../';
  }
  const go = (id, l) => `<button class="btn green cm-go" data-go="${id}">${l} ▶</button>`;
  function panel(id) {
    const b = bests(), done = COURSES.filter((c, i) => b[i]).length;
    if (id === 'show') return `<h3>Show starten</h3><p>Die große Hindernis-Show: Vorrunde, Halbfinale und Finale. Jeder Läufer geht allein auf den Parcours, die Zeiten werden verglichen – am Ende gewinnt, wer die meisten Punkte hat.</p><div class="cm-stats"><div><b>1–4</b><small>Läufer</small></div><div><b>3</b><small>Parcours</small></div><div><b>${charGroups().reduce((a, g) => a + g.list.length, 0)}</b><small>Figuren</small></div></div>${go('show', 'Show einrichten')}`;
    if (id === 'train') return `<h3>Training</h3><p>Ein Parcours, so oft du willst. Deine Bestzeit wird gespeichert und läuft als Geist mit.</p><div class="cm-stats">${COURSES.map((c, i) => `<div><b>${b[i] ? fmtTime(b[i].t) : '–'}</b><small>${esc(c.name)}</small></div>`).join('')}</div><p class="h">${done ? `${done} von ${COURSES.length} Parcours geschafft.` : 'Noch keine Bestzeit – ab ins Ziel!'}</p>${go('train', 'Training wählen')}`;
    if (id === 'pair') return `<h3>Online & Handys</h3><p>QR-Code scannen oder Code eingeben, auch übers Internet: Jedes Handy wird das Steuer-Pad eines Läufers (bis zu 4) und meldet „Bereit".</p><p class="h">Ohne Handy spielt ihr abwechselnd an diesem Gerät.</p>${go('pair', 'Koppeln')}`;
    if (id === 'rules') return `<h3>So wird gespielt</h3><div class="cm-keys2">${touch ? '<span>🕹️ Stick</span><span>laufen</span><span>⤒ Springen</span><span>springen (länger halten = höher)</span>' : '<span><kbd>←</kbd><kbd>→</kbd> <kbd>A</kbd><kbd>D</kbd></span><span>laufen</span><span><kbd>Leertaste</kbd> <kbd>W</kbd></span><span>springen (länger halten = höher)</span>'}<span>🎮</span><span>Steuerkreuz/Stick laufen, A springen</span></div><p class="h">An den Hangelstangen greift dein Läufer von selbst. Wer ins Wasser fällt, ist raus – dann zählt die Strecke.</p>${go('rules', 'Alle Regeln')}`;
    if (id === 'sound') return `<h3>Ton</h3><p>Musik und Effekte sind gerade <b>${snd ? 'an' : 'aus'}</b>.</p>${go('sound', snd ? 'Ton aus' : 'Ton an')}`;
    return `<h3>Alle Spiele</h3><p>Zurück zur AnMaCha-Spielesammlung.</p>${go('home', 'Zur Sammlung')}`;
  }
  loadScene(0); show('menu');
  $('bPairSetup').onclick = () => { SFX.click(); pair.open(); };
  $('bSetBack').onclick = () => { SFX.click(); show('menu'); };
  $('bStart').onclick = () => { Audio_.unlock(); SFX.click(); start(S.mode); };
  $('bGMenu').onclick = () => { if (confirm('Show wirklich beenden?')) { abort(); show('menu'); } };
  $('rulesOk').onclick = () => { $('rules').hidden = true; if (!$('menu').hidden) ui.menu.refresh(); };
  const voiceButton=document.createElement('button');voiceButton.type='button';voiceButton.id='fpVoice';voiceButton.className='ib';voiceButton.setAttribute('aria-label','Live-Kommentator umschalten');
  const top=$('bSnd').parentElement;top.insertBefore(voiceButton,$('bSnd'));
  function voiceUI(){voiceButton.textContent=commentator.on?'🎙️':'🔕';voiceButton.title=commentator.on?'Kommentator ausschalten':'Kommentator einschalten';voiceButton.setAttribute('aria-pressed',String(commentator.on));}
  voiceButton.onclick=()=>{commentator.setOn(!commentator.on);voiceUI();if(commentator.on)commentator.speak('Die Live-Moderation ist eingeschaltet.')};
  voiceButton.disabled=!commentator.supported;voiceUI();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)commentator.stop()});
  $('bSnd').onclick = toggleSnd; $('aSnd').onclick = toggleSnd; $('aMenu').onclick = () => $('bGMenu').click();
  addEventListener('keydown', e => { if (e.code === 'Escape' && !$('game').hidden && !pending) $('bGMenu').click(); });
  window.__fp = { get G() { return G; }, S, arena, COURSES, ui }; requestAnimationFrame(loop);
  await texDone; booting = false; ui.boot.ready(() => { show('menu'); ui.menu.show('show'); });
}
