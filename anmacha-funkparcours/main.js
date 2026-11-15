/* Titanparcours – Spielablauf: Einzelläufe nacheinander (Show mit 3 Parcours oder Training), Zeiten werden verglichen. */
import { Sim, COURSES, DT, PH, fmtTime, rank, pointsFor, standings, makeCourse } from './engine.js';
import { SFX, Audio_ } from './audio.js';
import { initPair, JOIN, loadScript } from './pair.js';
import { CHARS, validChar, charName, charGame, charGroups } from './chars.js';
import { createUI } from './menu.js';
import { stick, hold } from './stick.js';
import { makeCommentator } from './commentary.js';
import { makeHost } from './host.js';
const $ = id => document.getElementById(id), esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const THREE_URL = '../vendor/three-r128.min.js';   // lokal: lädt schnell und läuft auch offline
const COLORS = [0xff6fb0, 0x00b8d9, 0xffd24a, 0x8b5cf6], CSS = ['#ff6fb0', '#00b8d9', '#ffd24a', '#8b5cf6'], LOGO = [5, 1, 8, 12], MAXT = 150, ABORT = { abort: 1 };
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
window.addEventListener('error', e => { $('errTxt').textContent = String(e.message || e); $('err').hidden = false; });
window.addEventListener('unhandledrejection', e => { if (e.reason === ABORT) return; $('errTxt').textContent = String((e.reason && e.reason.message) || e.reason); $('err').hidden = false; });

if (JOIN) {
  document.body.classList.add('ctrl'); (await import('./controller.js')).startController();
} else {
  const touch = matchMedia('(pointer:coarse)').matches; if (touch) document.body.classList.add('touch');
  const ui = createUI({ SFX, Audio_, touch, onMenu: id => onMenu(id), panel: id => panel(id), onPause: () => pause(true) }), frame = () => new Promise(r => requestAnimationFrame(() => r()));
  // ------------------------------------------------------------ Laden mit echtem Fortschritt: 3D-Bibliothek → Studio → Logos
  ui.boot.progress(6, 'Lade 3D-Grafik …');
  const fontsP = document.fonts ? Promise.all(['italic 800 40px "Titan Display"', '600 20px "Titan Cond"', '500 16px "Titan Text"'].map(f => document.fonts.load(f))).catch(() => {}) : Promise.resolve();
  try { await loadScript(THREE_URL); } catch (e) { $('errTxt').textContent = 'Die 3D-Bibliothek konnte nicht geladen werden (Internet?).'; $('err').hidden = false; throw e; }
  // Figuren: Lader + gemeinsame easygames-Figuren + Figuren-Liste aller Spiele (fehlt etwas, läuft das Spiel trotzdem)
  await Promise.all(['../vendor/three-r128-gltfloader.js', '../figuren/figuren.js', '../easyclash/js/roster.js'].map(u => loadScript(u).catch(e => console.warn(e))));
  ui.boot.progress(38, 'Baue das Studio …'); await Promise.race([fontsP, new Promise(r => setTimeout(r, 4000))]); await frame();
  const { Arena } = await import('./scene.js');
  let booting = true; const texDone = new Promise(res => { const M = window.THREE.DefaultLoadingManager; M.onProgress = (u, n, total) => { if (booting) ui.boot.progress(60 + 38 * n / total, `Lade Läufer und Logos (${n}/${total}) …`); }; M.onLoad = () => res(); setTimeout(res, 8000); });
  const arena = new Arena($('cv'), Array.from({ length: 16 }, (_, i) => `logos/${String(i + 1).padStart(2, '0')}.png`));
  addEventListener('resize', () => arena.resize());
  ui.boot.progress(60, 'Lade Senderlogos …');
  { const im = new Image(); im.onload = () => { $('brandImg').src = im.src; $('brandImg').hidden = false; $('brandText').hidden = true; document.querySelector('.cm-tag').hidden = true; }; im.onerror = () => {}; im.src = 'logo.png'; }

  const S = { mode: 'show', n: 2, names: store.get('fpNames', []).slice(0, 4), chars: store.get('fpChars', [0, 1, 3, 2]).slice(0, 4), tc: 0 };
  for (let i = 0; i < 4; i++) { if (!S.names[i]) S.names[i] = 'Läufer ' + (i + 1); if (!validChar(S.chars[i])) S.chars[i] = i; }
  let G = null, token = 0, pending = null, curCourse = null, snd = store.get('fpSnd', true), keys = 0, touchM = 0, stickM = 0, paused = false; const phoneM = [0, 0, 0, 0];
  Audio_.setOn(snd);
  const FAST = () => window.__fpFast || 1, sleep = ms => new Promise(r => setTimeout(r, ms / FAST()));
  const bests = () => store.get('fpBest3', {});
  const show = id => { for (const s of ['menu', 'setup', 'game']) $(s).hidden = s !== id; if (id === 'menu') ui.menu.refresh(); };
  const setSnd = () => { const b = $('bSound'); b.querySelector('.ic').textContent = snd ? '🔊' : '🔇'; b.querySelector('.lb').textContent = snd ? 'Ton: an' : 'Ton: aus'; $('bSnd').textContent = snd ? '🔊' : '🔇'; $('aSnd').querySelector('.ai').textContent = snd ? '🔊' : '🔇'; $('bPSnd').textContent = snd ? '🔊 Ton: an' : '🔇 Ton: aus'; };
  const toggleSnd = () => { snd = !snd; Audio_.setOn(snd); store.set('fpSnd', snd); setSnd(); SFX.click(); };
  setSnd();

  // ------------------------------------------------------------ Karten (Dialoge) mit Warte-Funktion
  function ask(html, ids) { $('cardBox').innerHTML = html; $('card').hidden = false; const fb = $('cardBox').querySelector('button'); if (fb) fb.focus({ preventScroll: true }); return new Promise(res => { pending = { res, ids }; }); }
  function fire(id) { if (pending && pending.ids.includes(id)) { const p = pending; pending = null; $('card').hidden = true; p.res(id); } }
  $('cardBox').addEventListener('click', e => { const b = e.target.closest('button[id]'); if (b) { SFX.click(); fire(b.id); } });
  const commentator=makeCommentator();
  // Moderatoren-Szene nach geschaffter Steilwand: RicoReWi und Yukoo am Pult
  const host = makeHost($('game'));
  const hostScene = (r, ci) => window.__fpNoHost ? Promise.resolve() : host.play({ final: ci === COURSES.length - 1, fast: FAST(), say: (k, o) => { const d = commentator.say(k, o); return [d, commentator.idx(k)]; } });
  // Live-Regie: verfolgt den Läufer und moderiert genau dort, wo er gerade ist (Hindernis, Griff, Treffer, Zeit, Bestzeit).
  let D=null;
  const nameKey=(n,pre)=>{const m=/^Läufer ([1-4])$/.exec(String(n||'').trim());return m?pre+m[1]:pre+'x';};
  function director(sim){
    if(!G||G.phase!=='run'||!sim||!G.course||!D)return;
    const c=G.course,secs=c.secs||[],t=sim.t;
    let section=-1;for(let i=0;i<secs.length;i++)if(sim.x>=secs[i].x-1.5)section=i;
    if(section>D.sec){
      const name=secs[section].n,prev=D.sec;D.sec=section;
      if(prev>=0&&!D.hitSince)commentator.say('clear',{chance:0.6});
      D.hitSince=false;
      commentator.say('sec_'+name,{priority:name==='Steilwand'});
      if(section>=2&&section%2===0){ // Tempo-Vergleich mit dem Geist (Bestzeit) bzw. Lob für hohes Tempo
        const g=G.ghost,k=g?Math.min(g.length-2,Math.floor(t/DT/3)*2):-1;
        if(g&&k>=0){const d=sim.x-g[k];if(d>2.5)commentator.say('ahead',{cooldown:20});else if(d<-4)commentator.say('behind',{cooldown:20});}
        else if(!g&&!D.fast&&t>5&&sim.x/t>4.0){D.fast=true;commentator.say('fast');}
      }
    }
    if(!D.half&&c.length&&sim.x>c.length*0.5){D.half=true;commentator.say('half',{ifIdle:true});}
    const holding=!!(sim.hang||sim.rope||sim.ladder);
    if(holding&&!D.hold)commentator.say('grab',{ifIdle:true,chance:0.5,cooldown:7});D.hold=holding;
    if(sim.slide&&!D.slide&&/Rutschtunnel|Pendelbalken/.test(secs[D.sec]?secs[D.sec].n:''))commentator.say('slide',{ifIdle:true,chance:0.6,cooldown:10});D.slide=sim.slide;
    if((sim.bounces||0)>D.bounce){D.bounce=sim.bounces;commentator.say('bounce',{ifIdle:true,cooldown:8});}
    if(sim.sprint&&!D.sprint){D.sprint=true;commentator.say('wall_sprint',{ifIdle:true,chance:0.9});}
    const wm=sim.wall?sim.wall.m:'';if(wm!==D.wm){if(wm==='hang')commentator.say('wall_grab',{priority:true});else if(wm==='pull')commentator.say('wall_pull',{ifIdle:true});D.wm=wm;}
    if(sim.wall&&!D.wall&&sim.wallTries===0&&!D.sprint)commentator.say('wall_run',{ifIdle:true,chance:0.8});D.wall=!!sim.wall;
    const still=sim.onGround&&!holding&&Math.abs(sim.vx)<0.3&&t>3;D.still=still?D.still+DT:0;
    if(D.still>3.5){D.still=-6;commentator.say('idle',{ifIdle:true,cooldown:12});}
    for(const [T,k] of [[MAXT-60,'t60'],[MAXT-30,'t30'],[MAXT-10,'t10']])if(t>=T&&!D[k]){D[k]=true;commentator.say(k,{priority:k==='t10'});}
  }
  function abort() { pause(false); commentator.stop();D=null;token++; const p = pending; pending = null; $('card').hidden = true; $('big').hidden = true; G = null; padOn(false); arena.setGhost(null); if (p) p.res('abort'); push(); }
  const rows = (runs, pl, upto) => { const ord = rank(runs.map(r => r || { finished: false, dist: -1 })); return ord.filter(i => runs[i]).map((i, k) => { const r = runs[i]; return `<div class="tr ${r.finished ? '' : 'dnf'}" style="--pc:${CSS[i]}"><em>${k + 1}.</em><b>${esc(pl[i].name)}</b><span>${r.finished ? fmtTime(r.time) : r.why}</span>${upto != null ? `<em>+${r.pts || 0}</em>` : ''}</div>`; }).join(''); };

  // ------------------------------------------------------------ Eingabe
  const KEYMAP = { ArrowLeft: 1, KeyA: 1, ArrowRight: 2, KeyD: 2, Space: 4, ArrowUp: 4, KeyW: 4, ArrowDown: 8, KeyS: 8, ShiftLeft: 8, ShiftRight: 8, ControlLeft: 8, KeyC: 8, KeyE: 16, KeyF: 16, KeyX: 16, KeyK: 16, Numpad0: 16 };   // 1 links, 2 rechts, 4 Sprung, 8 Ducken/Rutschen, 16 Greifen
  const BACKMAP = { ArrowUp: 2, KeyW: 2, ArrowDown: 1, KeyS: 1 }, keyBit = c => (view === 'back' && BACKMAP[c]) || KEYMAP[c];   // von hinten: hoch = vorwärts, runter = zurück
  addEventListener('keydown', e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; const b = keyBit(e.code); if (b) { keys |= b; if (G && G.phase !== 'ready') e.preventDefault(); } if ((e.code === 'Space' || e.code === 'Enter') && pending && pending.ids.includes('bReady')) { e.preventDefault(); fire('bReady'); } });
  addEventListener('keyup', e => { const b = keyBit(e.code) | KEYMAP[e.code]; if (b) keys &= ~b; });
  addEventListener('blur', () => { keys = 0; touchM = 0; });
  // Touch: Stick links (Bits 1/2, nach unten 8), rechts Springen (Bit 4) und Ducken (Bit 8), dazu Pause und Ton
  const stk = stick($('stick'), m => { stickM = m; }), jumpUp = hold(document.querySelector('#pad [data-k="j"]'), () => { touchM |= 4; }, () => { touchM &= ~4; }), duckUp = hold(document.querySelector('#pad [data-k="d"]'), () => { touchM |= 8; }, () => { touchM &= ~8; }), grabBtn = document.querySelector('#pad [data-k="g"]'), grabUp = hold(grabBtn, () => { touchM |= 16; }, () => { touchM &= ~16; });
  const padOn = v => { $('pad').hidden = !v; $('game').classList.toggle('pl', v); if (!v) { stk.reset(); jumpUp(); duckUp(); grabUp(); grabBtn.classList.remove('ready'); touchM = stickM = 0; } };
  let padM = 0; const readInput = () => { const m = keys | touchM | stickM | padM | (G ? phoneM[G.cur] : 0); return { l: m & 1, r: m & 2, j: m & 4, d: m & 8, g: m & 16 }; };

  // ------------------------------------------------------------ Pausemenü (Esc, ☰, Start am Gamepad): hält den Lauf an
  function pause(on) {
    if (on && (!G || paused || G.over)) return; if (!on && !paused) return;
    paused = on; $('pause').hidden = !on; keys = touchM = stickM = 0;
    if (on) { commentator.stop(); $('pzInfo').textContent = G.course.name + (G.mode === 'train' ? ' · Training' : ' · ' + G.players[G.cur].name); $('bRestart').hidden = G.mode !== 'train'; voiceUI(); SFX.click(); $('bResume').focus({ preventScroll: true }); }
  }
  document.querySelectorAll('.pz-it').forEach(b => b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') b.focus({ preventScroll: true }); }));
  $('bResume').onclick = () => { SFX.click(); pause(false); };
  $('bRestart').onclick = () => { SFX.click(); pause(false); start('train'); };
  $('bPSnd').onclick = () => toggleSnd();
  // Ansicht: seitlich (klassisch) oder von hinten (wie ein Kandidat auf der Strecke); gleiche Steuerung und Physik
  let view = store.get('fpView', 'side'); const viewUI = () => { $('bPView').textContent = view === 'back' ? '🎥 Ansicht: von hinten' : '🎥 Ansicht: seitlich'; $('sgView').querySelectorAll('button').forEach(b => b.classList.toggle('on', (+b.dataset.v === 1) === (view === 'back'))); };
  const setView = v => { view = v; store.set('fpView', v); arena.setView(v); viewUI(); document.documentElement.classList.toggle('fp-back', v === 'back'); keys = 0; };
  $('bPView').onclick = () => { SFX.click(); setView(view === 'back' ? 'side' : 'back'); };
  $('bPVoice').onclick = () => { SFX.click(); commentator.setOn(!commentator.on); voiceUI(); };
  $('bQuit').onclick = () => { SFX.click(); abort(); show('menu'); ui.menu.show('show'); };

  // ------------------------------------------------------------ Handy-Kopplung
  const hasPhone = i => pair.has(i);
  const pair = initPair({
    names: () => S.names.slice(0, G ? G.players.length : S.n),
    freeSlot: () => { const n = G ? G.players.length : S.mode === 'train' ? 1 : S.n; for (let i = 0; i < n; i++) if (!pair.has(i)) return i; return -1; },
    onJoin: (slot, name) => { S.names[slot] = name; if (G && G.players[slot]) G.players[slot].name = name; store.set('fpNames', S.names); fillNames(); if (G) updateTop(); },
    onMessage: (slot, m) => { if (m.t === 'in') phoneM[slot] = (m.v | 0) & 31; else if (m.t === 'ready' && G && G.cur === slot) fire('bReady'); },
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
    $('setInfo').textContent = tr ? 'Übe einen Parcours. Deine Bestzeit wird gespeichert und als Geist mitgeschickt.' : 'Vorrunde, Halbfinale, Finale – jede Show mit neu gemischten Hindernissen. Nur wer ins Ziel kommt, ist in der nächsten Runde. Sieger ist, wer am Ende die meisten Punkte hat.';
    const b = bests(); $('sgCourse').innerHTML = COURSES.map((c, i) => `<button data-v="${i}" class="${i === S.tc ? 'on' : ''}">${esc(c.name)}${b[i] ? `<br><small>${fmtTime(b[i].t)}</small>` : ''}</button>`).join('');
    $('sgPl').querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.v === S.n)); fillNames(); show('setup'); loadScene(S.tc);
  }
  const seg = (id, fn) => $(id).addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; SFX.click(); $(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); fn(+b.dataset.v); });
  seg('sgPl', v => { S.n = v; fillNames(); push(); }); seg('sgView', v => setView(v ? 'back' : 'side')); seg('sgCourse', v => { S.tc = v; loadScene(v); });
  function loadScene(ci) { const c = typeof ci === 'number' ? COURSES[ci] : ci; if (curCourse !== c) { curCourse = c; arena.setCourse(c); } }
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
  /** rotes Alarmlicht über dem ganzen Bild (Sturz ins Wasser) */
  const redFlash = () => { const r = $('redfx'); r.classList.remove('on'); void r.offsetWidth; r.classList.add('on'); };
  const big = (txt, cls, ms) => { const b = $('big'); b.className = cls || ''; b.textContent = txt; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; if (ms) setTimeout(() => { if (b.textContent === txt) b.hidden = true; }, ms / FAST()); };

  async function turn(tok, ci, pi, runs, leader, crs) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; };
    const course = crs || COURSES[ci]; commentator.stop(); D=null; G.course = course; G.cur = pi; G.phase = 'ready'; G.say = ''; phoneM[pi] = 0; updateTop(); show('game'); padOn(false); $('clock').textContent = fmtTime(0);
    loadScene(course); look(pi); G.sim = null; let ghost = null; if (G.mode === 'train') { const b = bests()[ci]; ghost = b ? b.g : null; } else if (leader && leader.g) ghost = leader.g; G.ghost = ghost; arena.setGhost(ghost);
    push();
    const ph = hasPhone(pi);
    await A(ask(`<div class="card"><h2 style="color:${CSS[pi]}">${esc(G.players[pi].name)}</h2><div class="sub">${esc(course.name)}${G.mode === 'train' ? ' · Training' : ` · Lauf ${pi + 1} von ${G.players.length}`}</div>${runs.some(Boolean) ? `<div class="tbl">${rows(runs, G.players)}</div>` : ''}${ghost ? '<div class="hint">👻 Der Geist zeigt die Bestzeit.</div>' : ''}<div class="hint ${ph ? 'ph' : ''}">${ph ? '📱 Tippe am Handy auf „Bereit"' : 'Bereit? Leertaste oder Button'}</div><button class="btn green" id="bReady">Bereit!</button></div>`, ['bReady']));
    // Die Vorstellung vor dem visuellen Countdown sprechen, nicht die Zahlen verzögert nachholen.
    let talk=commentator.say(nameKey(G.players[pi].name,'name_'),{priority:true});
    if(pi===0)talk+=commentator.say('intro_'+ci)+0.12;
    await A(sleep(Math.max(1950,talk*1000+250)));
    G.phase = 'count'; push(); keys = touchM = 0;
    for (const n of [3, 2, 1]) { big(String(n), '', 700); SFX.count(); await A(sleep(800)); }
    big('LOS!', '', 800); SFX.go(); commentator.say('go',{priority:true}); arena.fire(1); G.phase = 'run'; push();
    const sim = new Sim(course); G.sim = sim; D={sec:-1,half:false,hold:false,slide:false,bounce:0,wall:false,still:0,hitSince:false,sprint:false,wm:""}; padOn(true); const rec = []; let acc = 0, n = 0, prevG = true, wt = 0, hits = 0, grabs = 0, reach = '';
    const res = await A(new Promise(done => {
      G.tick = dt => {
        acc += dt;
        while (acc >= DT && !sim.dead && !sim.finished) {
          acc -= DT; const o = window.__fpInput; sim.step(o ? o(sim) : readInput()); director(sim); if (n++ % 3 === 0) rec.push(Math.round(sim.x * 100) / 100, Math.round(sim.y * 100) / 100);
          if (prevG && !sim.onGround && sim.vy > 0) SFX.jump(); else if (!prevG && sim.onGround) { SFX.land(); ui.rumble(0.15, 0.35, 70); } prevG = sim.onGround;
          if (sim.hits !== hits) { hits = sim.hits; ui.rumble(0.8, 1, 220); SFX.hit(); arena.impact(sim.x, sim.y + 1.1); if (D) D.hitSince = true; commentator.say('hit', { cooldown: 4 }); }
          if (sim.grabs !== grabs) { grabs = sim.grabs; SFX.grab(); ui.rumble(0.3, 0.6, 90); arena.grab(sim.x, sim.y + PH); }
          if (sim.t >= MAXT && !sim.finished) sim.dead = 'time';
          if (sim.wallTries !== wt) { wt = sim.wallTries; ui.rumble(0.5, 0.6, 160); if (wt < 3) { big(`Versuch ${wt + 1} von 3 · mehr Anlauf!`, 'sm', 1300); commentator.say(Math.random() < 0.5 ? 'wall_slow' : wt === 1 ? 'wall_try2' : 'wall_try3', { priority: true }); } }
        }
        const rc = sim.reachable(); if (rc !== reach) { reach = rc; grabBtn.classList.toggle('ready', !!rc); }
        G.alpha = acc / DT; $('clock').textContent = fmtTime(sim.t);
        if (sim.dead || sim.finished) { G.tick = null; done({ finished: sim.finished, time: sim.t, dist: sim.dist, dead: sim.dead }); }
      };
    }));
    G.phase = 'done'; G.alpha = 1; padOn(false); phoneM[pi] = 0;
    if (res.finished) { const ob = bests()[ci]; commentator.say(!ob || res.time < ob.t ? 'fin_best' : 'fin', { priority: true }); res.why = ''; SFX.top(); ui.rumble(0.4, 0.8, 300); arena.confetti(sim.x, sim.y); SFX.clap(1.4); big('ZIEL! ' + fmtTime(res.time), 'sm', 1600); }
    else { const d = res.dead; commentator.say(d === 'time' ? 'time' : d === 'wall' ? 'wallfail' : 'water', { priority: true }); res.why = d === 'time' ? 'Zeit ab' : d === 'wall' ? `Wand · ${Math.round(res.dist)} m` : `Baden · ${Math.round(res.dist)} m`; if (d === 'water') { arena.splash(sim.x); arena.alarm(); SFX.splash(); SFX.fail(); redFlash(); ui.rumble(1, 1, 420); } else { SFX.buzz(); if (d === 'wall') SFX.sad(); } big(d === 'time' ? 'ZEIT ABGELAUFEN' : d === 'wall' ? 'WAND NICHT GESCHAFFT' : 'PLATSCH!', 'bad sm', 1500); }
    res.g = rec; G.say = res.finished ? fmtTime(res.time) : res.why; push();
    await A(sleep(1700)); return res;
  }

  const bestUpdate = (ci, res, name) => { if (!res.finished) return false; const b = bests(); if (!b[ci] || res.time < b[ci].t) { b[ci] = { t: Math.round(res.time * 100) / 100, n: name, g: res.g }; store.set('fpBest3', b); return true; } return false; };

  async function coroutine(tok, mode) {
    const A = async p => { const v = await p; if (tok !== token) throw ABORT; return v; };
    const np = mode === 'train' ? 1 : S.n; G = { mode, players: Array.from({ length: np }, (_, i) => ({ name: S.names[i], pts: 0, secs: 0 })), cur: 0, phase: 'ready', course: COURSES[0], over: false }; show('game');
    if (mode === 'train') {
      for (;;) {
        const ci = S.tc, runs = [null], r = await turn(tok, ci, 0, runs, null); runs[0] = r; const nb = bestUpdate(ci, r, G.players[0].name), b = bests()[ci]; if (nb) await A(hostScene(r, ci));
        const pick = await A(ask(`<div class="card"><h2>${esc(COURSES[ci].name)}</h2>${r.finished ? `<div class="bigt">${fmtTime(r.time)}</div>` : `<div class="bigt bad">${esc(r.why)}</div>`}<div class="sub">${nb ? '🏅 Neue Bestzeit!' : b ? 'Bestzeit: ' + fmtTime(b.t) : 'Noch keine Bestzeit – ab ins Ziel!'}</div><div class="row"><button class="btn green" id="bAgain">▶ Nochmal</button><button class="btn ghost" id="bToMenu">Menü</button></div></div>`, ['bAgain', 'bToMenu']));
        if (pick === 'bToMenu') { abort(); show('menu'); return; }
      }
    }
    // Jede Show wird neu gemischt (alle Läufer einer Runde bekommen denselben Parcours). Weiter kommt nur, wer im Ziel ist.
    const seed0 = window.__fpSeed || (Math.random() * 1e9) >>> 0; var alive = G.players.map(() => true); G.seed = seed0;
    for (let ci = 0; ci < COURSES.length; ci++) {
      const course = makeCourse(ci, seed0 + ci * 7919, window.__fpOnly || null), runs = new Array(np).fill(null); let leader = null;
      for (let pi = 0; pi < np; pi++) { if (!alive[pi]) continue; const r = await turn(tok, ci, pi, runs, leader, course); runs[pi] = r; if (r.finished && (!leader || r.time < leader.t)) leader = { t: r.time, g: r.g }; if (r.finished) await A(hostScene(r, ci, pi)); }
      const idx = runs.map((r, i) => (r ? i : -1)).filter(i => i >= 0), ord = rank(idx.map(i => runs[i])).map(k => idx[k]);
      ord.forEach((i, k) => { runs[i].pts = runs[i].finished ? pointsFor(k, idx.length) : 0; G.players[i].pts += runs[i].pts; G.players[i].secs += runs[i].finished ? runs[i].time : MAXT + 30; });
      idx.forEach(i => { if (!runs[i].finished) alive[i] = false; });
      const left = alive.filter(Boolean).length, last = ci === COURSES.length - 1;
      G.phase = 'board'; commentator.say(left || last ? 'board' : 'out_all', { priority: true }); G.say = 'Wertung ' + course.name; push();
      if (!left && !last) {   // alle ausgeschieden: Show vorbei, Runde neu versuchen oder Menü
        G.over = true; G.say = 'Ausgeschieden'; push(); SFX.buzz();
        const pick = await A(ask(`<div class="card"><h2>${np > 1 ? 'Alle ausgeschieden' : 'Ausgeschieden!'}</h2><div class="sub">${esc(course.name)} nicht geschafft – nur wer ins Ziel kommt, ist in der nächsten Runde.</div><div class="tbl">${rows(runs, G.players, 1)}</div><div class="row"><button class="btn green" id="bAgain">▶ Neue Show</button><button class="btn ghost" id="bToMenu">Menü</button></div></div>`, ['bAgain', 'bToMenu']));
        if (pick === 'bAgain') start('show'); else { abort(); show('menu'); } return;
      }
      const outNow = idx.filter(i => !runs[i].finished).map(i => G.players[i].name);
      await A(ask(`<div class="card"><h2>Wertung · ${esc(course.name)}</h2><div class="tbl">${rows(runs, G.players, 1)}</div>${outNow.length ? `<div class="sub bad">Ausgeschieden: ${outNow.map(esc).join(', ')}</div>` : ''}${np > 1 ? `<div class="sub">Gesamt: ${standings(G.players).map(i => esc(G.players[i].name) + ' ' + G.players[i].pts).join(' · ')}</div>` : ''}<button class="btn green" id="bNext">${last ? 'Endstand ▶' : 'Weiter: ' + esc(COURSES[ci + 1].name) + ' ▶'}</button></div>`, ['bNext']));
    }
    const ord = standings(G.players), w = G.players[ord[0]]; const champ = alive[ord[0]]; commentator.say(np > 1 ? nameKey(w.name, 'win_') : champ ? 'win_solo' : 'out_final', { priority: true }); G.over = true; G.say = np > 1 ? w.name + ' gewinnt!' : champ ? 'Geschafft!' : 'Finale verpasst'; push(); SFX.fanfare(); arena.confetti(arena.cx, 2); look(ord[0]);
    const pick = await A(ask(`<div class="card"><h2>${np > 1 ? '🏆 ' + esc(w.name) + ' gewinnt!' : champ ? '🏆 Titan! Show geschafft!' : 'Finale knapp verpasst'}</h2><div class="tbl">${ord.map((i, k) => `<div class="tr" style="--pc:${CSS[i]}"><em>${k + 1}.</em><b>${esc(G.players[i].name)}</b><span>${G.players[i].pts} Pkt</span><em>${G.players[i].secs.toFixed(1)} s</em></div>`).join('')}</div><div class="prize"><img src="logos/16.png" alt="RicoReWi Radioportal" width="56" height="56"><div><b>Hauptgewinn: Ruhm &amp; Ehre</b><small>gestiftet vom RicoReWi Radioportal 😉</small></div></div><div class="row"><button class="btn green" id="bAgain">Nochmal</button><button class="btn ghost" id="bToMenu">Menü</button></div></div>`, ['bAgain', 'bToMenu']));
    if (pick === 'bAgain') start('show'); else { abort(); show('menu'); }
  }
  function start(mode) { abort(); const tok = token; coroutine(tok, mode).catch(e => { if (e !== ABORT) throw e; }); }

  // ------------------------------------------------------------ Hauptschleife
  let last = performance.now();
  function loop(now) {
    const raw = Math.min(0.05, (now - last) / 1000), dt = raw * FAST(); last = now;
    padM = ui.gamepad(raw, !!G && !paused && !pending && (G.phase === 'run' || G.phase === 'count'));
    arena.attract = !G && !$('menu').hidden && curCourse ? curCourse.length * (0.5 - 0.5 * Math.cos(arena.time * 0.045)) : null;
    if (G && G.tick && !paused) G.tick(dt);
    const sim = G && G.sim, run = sim && (G.phase === 'run' || G.phase === 'done' || G.phase === 'board');
    arena.frame(run ? sim : null, paused ? 0 : dt, run && G.ghost ? ghostAt(G.ghost, sim.t) : G && G.ghost ? ghostAt(G.ghost, 0) : null, 2, G && G.alpha != null ? G.alpha : 1);
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
    if (id === 'show') return `<h3>Show starten</h3><p>Die große Hindernis-Show: Vorrunde, Halbfinale und Finale – jedes Mal mit neu gemischten Hindernissen. Nur wer ins Ziel kommt, ist eine Runde weiter; am Ende gewinnt, wer die meisten Punkte hat.</p><div class="cm-stats"><div><b>1–4</b><small>Läufer</small></div><div><b>3</b><small>Parcours</small></div><div><b>${charGroups().reduce((a, g) => a + g.list.length, 0)}</b><small>Figuren</small></div></div>${go('show', 'Show einrichten')}`;
    if (id === 'train') return `<h3>Training</h3><p>Ein Parcours, so oft du willst. Deine Bestzeit wird gespeichert und läuft als Geist mit.</p><div class="cm-stats">${COURSES.map((c, i) => `<div><b>${b[i] ? fmtTime(b[i].t) : '–'}</b><small>${esc(c.name)}</small></div>`).join('')}</div><p class="h">${done ? `${done} von ${COURSES.length} Parcours geschafft.` : 'Noch keine Bestzeit – ab ins Ziel!'}</p>${go('train', 'Training wählen')}`;
    if (id === 'pair') return `<h3>Online & Handys</h3><p>QR-Code scannen oder Code eingeben, auch übers Internet: Jedes Handy wird das Steuer-Pad eines Läufers (bis zu 4) und meldet „Bereit".</p><p class="h">Ohne Handy spielt ihr abwechselnd an diesem Gerät.</p>${go('pair', 'Koppeln')}`;
    if (id === 'rules') return `<h3>So wird gespielt</h3><div class="cm-keys2">${touch ? '<span>🕹️ Stick</span><span>laufen</span><span>⤒ Springen</span><span>springen (länger halten = höher)</span><span>✊ Greifen</span><span>in der Luft festhalten</span>' : '<span><kbd>←</kbd><kbd>→</kbd> <kbd>A</kbd><kbd>D</kbd></span><span>laufen</span><span><kbd>Leertaste</kbd> <kbd>W</kbd></span><span>springen (länger halten = höher)</span><span><kbd>↓</kbd> <kbd>S</kbd> <kbd>Shift</kbd></span><span>ducken, mit Anlauf rutschen</span><span><kbd>E</kbd> <kbd>F</kbd> <kbd>X</kbd></span><span>greifen (Seil, Ringe, Stangen, Leisten)</span><span><kbd>Esc</kbd></span><span>Pause</span>'}<span>🎮 <kbd class="gp">L</kbd></span><span>laufen, nach unten ducken</span><span><kbd class="gp a">A</kbd> <kbd class="gp b">B</kbd> <kbd class="gp x">X</kbd></span><span>springen · ducken · greifen</span><span><kbd class="gp">☰</kbd></span><span>Start = Pause</span></div><p class="h">An Stangen, Seil, Ringen und Griffleisten musst du selbst zupacken: im Sprung in Griffweite die Greifen-Taste drücken. Verpasst = Wasser! Wer ins Wasser fällt, ist raus – dann zählt die Strecke.</p>${go('rules', 'Alle Regeln')}`;
    if (id === 'sound') return `<h3>Ton</h3><p>Musik und Effekte sind gerade <b>${snd ? 'an' : 'aus'}</b>.</p>${go('sound', snd ? 'Ton aus' : 'Ton an')}`;
    return `<h3>Alle Spiele</h3><p>Zurück zur Spielesammlung.</p>${go('home', 'Zur Sammlung')}`;
  }
  loadScene(0); arena.setView(view); viewUI(); document.documentElement.classList.toggle('fp-back', view === 'back'); show('menu');
  $('bPairSetup').onclick = () => { SFX.click(); pair.open(); };
  $('bSetBack').onclick = () => { SFX.click(); show('menu'); };
  $('bStart').onclick = () => { Audio_.unlock(); SFX.click(); start(S.mode); };
  $('bGMenu').onclick = () => pause(true);
  $('rulesOk').onclick = () => { $('rules').hidden = true; if (!$('menu').hidden) ui.menu.refresh(); };
  const voiceButton=document.createElement('button');voiceButton.type='button';voiceButton.id='fpVoice';voiceButton.className='ib';voiceButton.setAttribute('aria-label','Live-Kommentator umschalten');
  const top=$('bSnd').parentElement;top.insertBefore(voiceButton,$('bSnd'));
  function voiceUI(){$('bPVoice').textContent=commentator.on?'🎙️ Kommentator: an':'🔕 Kommentator: aus';$('bPVoice').disabled=!commentator.supported;voiceButton.textContent=commentator.on?'🎙️':'🔕';voiceButton.title=commentator.on?'Kommentator ausschalten':'Kommentator einschalten';voiceButton.setAttribute('aria-pressed',String(commentator.on));}
  voiceButton.onclick=()=>{commentator.setOn(!commentator.on);voiceUI();if(commentator.on)commentator.say('voice_on',{priority:true})};
  voiceButton.disabled=!commentator.supported;voiceUI();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)commentator.stop()});
  $('bSnd').onclick = toggleSnd; $('aSnd').onclick = toggleSnd; $('aMenu').onclick = () => pause(true);
  addEventListener('keydown', e => { if ((e.code === 'Escape' || e.code === 'KeyP') && !$('game').hidden && !pending && !paused) { e.preventDefault(); pause(true); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.phase === 'run') pause(true); });
  window.__fp = { get G() { return G; }, S, arena, COURSES, ui, vo: commentator, host, makeCourse, start, loadScene }; requestAnimationFrame(loop);
  await texDone; booting = false; ui.boot.ready(() => { show('menu'); ui.menu.show('show'); });
}
