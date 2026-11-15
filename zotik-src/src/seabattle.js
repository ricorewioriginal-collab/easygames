/* Rundenkampf der Weltkarte, zu Fuß und auf See, inszeniert wie ein modernes Konsolen-RPG (eigene Umsetzung im Zotik-Stil):
   Die Gruppe steht vorn, bis zu drei Gegner der Region gegenüber. Kamera mit Einstellungen je Aktion, Ausfallschritte,
   Zauber mit Effekten, Schwächen und Bruch, IP-Künste, Sieg mit Fanfare, eigene Kampfmusik.
   Befehle über das Kommandomenü der Dialoge (Handy, PC, TV, Controller gleich); „Auto“ kämpft bis zum Ende selbst. */
import { BEI, bOn, bLock } from './beistand.js';
export function createSeaBattle(C) {
  const { scene, camera, say, sfx, toast, banner, dnum, emit } = C;
  const EL = { fire: ['🔥', 0xff7a3a, 'Feuer'], ice: ['❄️', 0x9ae0ff, 'Eis'], storm: ['⚡', 0xfff27a, 'Blitz'], light: ['✨', 0xffe8a0, 'Licht'], nature: ['🌿', 0x7aff8a, 'Natur'] };
  const ELS = Object.keys(EL), rnd = (a, b) => a + Math.random() * (b - a), wait = ms => new Promise(r => setTimeout(r, ms));
  const reg = k => k === 13 ? 1 : k === 14 ? 2 : Math.max(1, Math.min(11, k || 1));

  /* ---------- Gegner je Region ---------- */
  const WEAKW = { 1: 'fire', 2: 'fire', 3: 'nature', 4: 'ice', 5: 'storm', 6: 'fire', 7: 'ice', 8: 'light', 9: 'storm', 10: 'light', 11: 'light' };
  function landPool(k0) {
    const k = reg(k0), P = [], ch = C.CHP[k] || {}, w = WEAKW[k], alt = ELS[(k * 3 + 1) % 5];
    const add = (n, mk, o) => P.push(Object.assign({ n, mk, weak: w, sc: o && o.hov ? 1.8 : 2 }, o));
    for (const [sl, hov] of [['A', 1], ['B', 0]]) { const d = ch[sl]; if (d) add(d[0], () => C.makeCreature(k, sl, d[3]) || C.makeKind(hov ? 'geist' : 'thornwolf', d[3]), { hov, col: d[3], weak: hov ? alt : w }); }
    for (const i of [0, 1]) { const q = C.makeExtra(k, i); if (q) add(q.name, q.make, { hov: !i, col: q.col, weak: i ? w : alt }); }
    for (const key of k >= 7 ? ['skw', 'skm', 'skr'] : k >= 3 ? ['skn', 'skw'] : ['skn']) { const d = C.ED[key]; if (d) add(d.name, d.make, { kk: 1, sc: 1.25, weak: 'light', hov: !!d.ranged, col: d.col }); }
    return P;
  }
  const SEA = [[['qualle', 'Glimmqualle', 0x8ad8ff, 'storm'], ['krabbe', 'Riffpanzer', 0xd86a3a, 'storm', { def: .6 }], ['schlange', 'Tiefenschlange', 0x2a8a8a, 'ice']],
    [['qualle', 'Frostqualle', 0xbfe8ff, 'fire'], ['krabbe', 'Eispanzer', 0x9ad0e8, 'fire', { def: .6 }], ['eisvogel', 'Sturmmöwe', 0xe8f4ff, 'storm', { fly: 1 }]],
    [['qualle', 'Glutqualle', 0xff8a4a, 'ice'], ['schlange', 'Lavaaal', 0xd84a2a, 'ice'], ['geist', 'Nebelgeist', 0x9aa0b0, 'light']],
    [['qualle', 'Sternqualle', 0xffe0ff, 'nature'], ['schlange', 'Kristallschlange', 0xc8a0ff, 'fire'], ['vogel', 'Wolkenreiter', 0xfff0c0, 'storm', { fly: 1 }]]];
  const SEABOSS = [['schlange', 'Mahlstromschlange', 0x5a2a9a, 'storm'], ['kristalldrache', 'Tiefseedrache', 0x3a6aff, 'fire', { fly: 1 }]];
  const seaDef = ([kind, n, col, weak, o]) => Object.assign({ n, col, weak, kind, hov: kind === 'qualle' || kind === 'geist', mk: () => C.makeKind(kind, col), sc: 2.1 }, o || {});
  function seaPool(k0) { const k = reg(k0), t = k <= 3 ? 0 : k <= 6 ? 1 : k <= 8 ? 2 : 3; return [...SEA[t], ...(t ? [SEA[0][k % 3]] : [])].map(seaDef); }
  const pool = (mode, k) => mode === 'sea' ? seaPool(k) : landPool(k);
  const pick = a => a[Math.random() * a.length | 0];

  /* ---------- Bühne, Anzeige, Musik ---------- */
  const st = document.createElement('style'); st.textContent = `#rbh{position:fixed;inset:0;pointer-events:none;z-index:5;font:600 13px system-ui,sans-serif;color:#eaf2ff}
#rbh .rb-p,#rbh .rb-f{position:absolute;top:max(10px,env(safe-area-inset-top));display:flex;flex-direction:column;gap:6px;width:min(240px,44vw)}
#rbh .rb-p{left:max(10px,env(safe-area-inset-left))}#rbh .rb-f{right:max(10px,env(safe-area-inset-right))}
.rb-c{background:linear-gradient(90deg,rgba(12,16,38,.86),rgba(12,16,38,.45));border:1px solid rgba(150,190,255,.22);border-left:3px solid var(--c,#8ad0ff);border-radius:10px;padding:5px 9px;transition:transform .25s,box-shadow .25s,opacity .3s}
.rb-f .rb-c{border-left:1px solid rgba(150,190,255,.22);border-right:3px solid var(--c,#ff7a7a);background:linear-gradient(270deg,rgba(38,12,22,.86),rgba(38,12,22,.45))}
.rb-c.on{transform:translateX(8px);box-shadow:0 0 0 1px var(--c),0 0 18px rgba(120,200,255,.35)}.rb-f .rb-c.on{transform:translateX(-8px)}
.rb-c.ko{opacity:.4;filter:grayscale(1)}.rb-c b{display:flex;justify-content:space-between;gap:6px;font-size:13px}.rb-c b small{font-weight:500;opacity:.8}
.rb-bar{height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:3px}.rb-bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#2ad07a,#9affc8);transition:width .35s}
.rb-bar.mp i{background:linear-gradient(90deg,#3a7aff,#8ac8ff)}.rb-bar.ip{height:4px}.rb-bar.ip i{background:linear-gradient(90deg,#ff9a20,#ffe88a)}.rb-bar.ip.full i{animation:rbip .6s infinite alternate}
.rb-f .rb-bar i{background:linear-gradient(90deg,#ff4a5a,#ffa07a)}.rb-brk{letter-spacing:2px;color:#ffd27a}.rb-brk.x{color:#ff7aff}
@keyframes rbip{to{filter:brightness(1.6)}}#rbh .rb-w{position:absolute;inset:0;opacity:0;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(160,210,255,.4) 40%,transparent 75%)}
#rbh .rb-w.on{animation:rbsw .7s ease-out}@keyframes rbsw{0%{opacity:0;transform:scale(.2) rotate(0)}30%{opacity:1}100%{opacity:0;transform:scale(2.2) rotate(40deg)}}
#rbh .rb-r{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%) scale(.8);opacity:0;transition:all .35s;text-align:center;background:rgba(10,14,34,.82);border:1px solid rgba(255,220,140,.45);border-radius:16px;padding:14px 26px;box-shadow:0 0 40px rgba(255,200,90,.25)}
#rbh .rb-r.on{opacity:1;transform:translate(-50%,-50%) scale(1)}#rbh .rb-r h2{margin:0 0 4px;font-size:30px;letter-spacing:.12em;color:#ffe08a;text-shadow:0 0 18px rgba(255,200,80,.8)}`;
  document.head.appendChild(st);
  const H = document.createElement('div'); H.id = 'rbh'; H.hidden = true; H.innerHTML = '<div class="rb-w"></div><div class="rb-p"></div><div class="rb-f"></div><div class="rb-r"></div>'; document.body.appendChild(H);
  const q = s => H.querySelector(s), pct = (a, b) => Math.max(0, Math.min(100, a / b * 100)).toFixed(1) + '%', hx = c => '#' + (c >>> 0).toString(16).padStart(6, '0');
  function hud() {
    if (!B) return; const S = C.S();
    q('.rb-p').innerHTML = B.party.map(m => { const fc = C.face ? C.face(m.id) : ''; return `<div class="rb-c${m === B.cur ? ' on' : ''}${m.hp <= 0 ? ' ko' : ''}" style="--c:${hx(m.col)}"><div class="rb-pt" style="${fc ? 'background-image:url(' + fc + ')' : ''}">${fc ? '' : faceOf(m)}</div><div class="rb-ci"><b>${m.n} <small>Lv ${C.clv ? C.clv(m.id) : ''}</small></b><div class="rr2"><span>LP</span><div class="rb-bar"><i style="width:${pct(m.hp, m.max)}"></i></div><em>${Math.max(0, Math.ceil(m.hp))}</em></div>${m.id === 'zotik' ? `<div class="rr2"><span>MP</span><div class="rb-bar mp"><i style="width:${pct(S.mp, C.maxMp())}"></i></div><em>${Math.floor(S.mp)}</em></div>` : ''}<div class="rr2"><span>ZT</span><div class="rb-bar atb"><i style="width:${pct(m.ct || 0, 100)}"></i></div><em></em></div><div class="rb-bar ip${m.ip >= 40 ? ' full' : ''}"><i style="width:${pct(m.ip, 100)}"></i></div></div></div>`; }).join('');
    q('.rb-f').innerHTML = B.foes.map(f => `<div class="rb-c${f === B.curF ? ' on' : ''}${f.dead ? ' ko' : ''}" style="--c:${hx(f.d.col || 0xff7a7a)}"><b>${f.name}<small>${EL[f.d.weak][0]} ${f.broken ? '<span class="rb-brk x">BRUCH</span>' : `<span class="rb-brk">${'◆'.repeat(Math.max(0, f.brk))}</span>`}</small></b><div class="rb-bar"><i style="width:${pct(f.hp, f.max)}"></i></div></div>`).join('');
  }
  const flashScr = () => { const w = q('.rb-w'); w.classList.remove('on'); void w.offsetWidth; w.classList.add('on'); };
  /* Kampfmusik: treibender Bass mit Arpeggio (Moll), Boss schneller und dunkler */
  let mus = null;
  function music(boss) {
    stopMusic(); if (!C.tone) return; const bpm = boss ? 168 : 150, st8 = 60 / bpm / 2, BASS = boss ? [55, 55, 82.4, 55, 58.3, 58.3, 87.3, 58.3, 49, 49, 73.4, 49, 51.9, 51.9, 77.8, 51.9] : [55, 55, 82.4, 55, 49, 49, 73.4, 49, 43.7, 43.7, 65.4, 43.7, 41.2, 41.2, 61.7, 41.2];
    const ARP = [[440, 523, 659, 523], [392, 494, 587, 494], [349, 440, 523, 440], [330, 415, 494, 415]]; let i = 0;
    mus = setInterval(() => { if (!B) return stopMusic(); const bar = (i >> 2) % 4; C.tone(BASS[i % 16], st8 * .9, 'sawtooth', .05, null); if (i % 2 === 0) C.tone(ARP[bar][(i >> 1) % 4] * (boss ? .5 : 1), st8 * 1.6, 'triangle', .035, null);
      if (i % 8 === 4 && C.noise) C.noise(.06, .06, 1800); i++; }, st8 * 1000);
  }
  function stopMusic() { if (mus) clearInterval(mus); mus = null; }
  function fanfare() { if (!C.tone) return; [[523, 0], [523, .12], [523, .24], [659, .36], [784, .6], [659, .78], [1047, .96]].forEach(([f, d]) => { C.tone(f, .3, 'square', .07, null, d); C.tone(f / 2, .3, 'triangle', .06, null, d); }); }

  /* ---------- ATB: Zeitleiste (WAIT → COM → ACT), Zugreihenfolge, Zielinfo, Ergebnis ---------- */
  const st2 = document.createElement('style'); st2.textContent = `#rbh .rb-ord{position:absolute;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);display:flex;gap:5px;align-items:center;padding:4px 10px;background:rgba(10,14,34,.72);border:1px solid rgba(150,190,255,.25);border-radius:30px}
#rbh .rb-ord b{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;font-size:14px;background:#14204a;border:2px solid var(--c,#8ad0ff);transition:all .3s}#rbh .rb-ord b.f{background:#3a1424;border-radius:6px;font-size:13px}
#rbh .rb-ord b.n{width:38px;height:38px;font-size:20px;box-shadow:0 0 14px var(--c)}
#rbh .rb-tl{position:absolute;left:50%;top:calc(max(10px,env(safe-area-inset-top)) + 52px);transform:translateX(-50%);width:min(520px,52vw);height:52px}
#rbh .rb-tr{position:absolute;left:0;right:0;top:20px;height:12px;border-radius:6px;background:linear-gradient(90deg,#14204a 0,#1f3a80 60%,#2a6aff 78%,#e23a3a 100%);border:1px solid rgba(190,220,255,.5)}
#rbh .rb-tr span{position:absolute;top:-17px;font:700 11px system-ui;letter-spacing:.1em;text-shadow:0 0 6px #000}#rbh .rb-tr .w{left:1%;color:#9ab8ff}#rbh .rb-tr .c{left:56%;color:#7ac8ff}#rbh .rb-tr .a{right:1%;color:#ff8a8a}
#rbh .rb-mf,#rbh .rb-mp{position:absolute;left:0;right:0}#rbh .rb-mf{top:0}#rbh .rb-mp{top:30px}
#rbh .rb-mk{position:absolute;width:22px;height:22px;margin-left:-11px;display:grid;place-items:center;border-radius:50%;font:700 12px system-ui;font-style:normal;background:#14204a;border:2px solid #8ad0ff;transition:left .55s cubic-bezier(.3,.8,.3,1),opacity .3s,transform .2s}
#rbh .rb-mk.f{background:#3a1424;border-color:#ff7a7a;border-radius:5px}#rbh .rb-mk.dead{opacity:0;pointer-events:none}#rbh .rb-mk.now{transform:scale(1.35);z-index:2;box-shadow:0 0 12px #fff}
#rbh .rb-ti{position:absolute;left:50%;top:calc(max(10px,env(safe-area-inset-top)) + 112px);transform:translateX(-50%);min-width:200px;padding:6px 12px;background:linear-gradient(90deg,rgba(14,22,60,.9),rgba(14,22,60,.6));border:1px solid rgba(255,140,140,.5);border-radius:8px;font-size:12px}
#rbh .rb-ti small{letter-spacing:.14em;color:#ff9a9a}#rbh .rb-ti b{display:block;font-size:14px}#rbh .rb-ti span{opacity:.85}
.rb-bar.atb{height:4px}.rb-bar.atb i{background:linear-gradient(90deg,#4a8aff,#e8f4ff)}
#rbh .rb-r.res{top:50%;width:min(720px,94vw);padding:12px 16px;pointer-events:auto;text-align:left;background:linear-gradient(180deg,rgba(24,28,92,.94),rgba(12,14,44,.96));border:2px solid #e8c96a;border-radius:10px;box-shadow:0 0 0 2px #5a3a10,0 0 40px rgba(0,0,0,.6)}
.rb-r .rs{margin-bottom:8px;padding:8px 12px;border:1px solid rgba(232,201,106,.5);border-radius:6px;background:rgba(8,10,40,.5)}.rb-r h3{margin:0 0 4px;font:italic 800 22px Georgia,serif;color:#fff;text-shadow:0 0 8px #6aa0ff}
.rb-r .rr{display:flex;justify-content:space-between;max-width:340px;font-size:15px}.rb-r .rr em{color:#ffd24a;font-style:normal;font-weight:800}
.rb-r .rc{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}.rb-r .rm{text-align:center;border-top:3px solid var(--c);padding-top:4px}
.rb-r .pt{font-size:34px;height:54px;display:grid;place-items:center;background:rgba(255,255,255,.08);border-radius:6px}.rb-r .nm{font-weight:800;margin:3px 0}.rb-r .lv b{color:#ffd24a;font-size:20px}
.rb-r .up{color:#7aff9a;font-weight:800;letter-spacing:.1em;animation:rbip .5s infinite alternate}.rb-r .ln{display:flex;justify-content:space-between;font-size:12px;opacity:.95}.rb-r small{opacity:.7}
@media (max-width:700px){#rbh .rb-tl{top:calc(max(10px,env(safe-area-inset-top)) + 124px);width:92vw}#rbh .rb-ti{top:calc(max(10px,env(safe-area-inset-top)) + 188px)}#rbh .rb-ord{top:calc(max(10px,env(safe-area-inset-top)) + 80px)}}`;
  st2.textContent += `
body.rbat #dlg{left:auto;right:max(14px,env(safe-area-inset-right));bottom:auto;top:calc(max(10px,env(safe-area-inset-top)) + 128px);transform:none;width:min(330px,46vw);padding:0;gap:0;grid-template-columns:56px 1fr;grid-template-areas:"port name" "opts opts" "txt txt";border-radius:6px;background:linear-gradient(180deg,rgba(14,44,92,.94),rgba(6,18,46,.94));border:1px solid rgba(120,200,255,.55);box-shadow:0 8px 30px rgba(0,0,0,.5);cursor:default}
body.rbat #dlg>div:nth-child(2){display:contents}body.rbat #dPort{grid-area:port;width:56px;height:56px;border-radius:6px 0 0 0;border:0;border-right:1px solid rgba(120,200,255,.4)}
body.rbat #dName{grid-area:name;align-self:center;padding:0 14px;font-size:20px;margin:0;background:linear-gradient(90deg,rgba(90,170,255,.35),transparent);height:100%;display:flex;align-items:center}
body.rbat #dText{grid-area:txt;font-size:13px;line-height:1.35;min-height:46px;padding:8px 12px;color:#cfe4ff;border-top:1px solid rgba(120,200,255,.35);background:rgba(4,10,30,.6)}
body.rbat #dOpts{grid-area:opts;flex-direction:column;flex-wrap:nowrap;gap:0;max-height:52vh;overflow-y:auto}
body.rbat #dOpts button{border-radius:0;border:0;border-top:1px solid rgba(120,200,255,.18);background:rgba(20,56,110,.5);text-align:left;padding:9px 14px 9px 26px;font-size:15px;position:relative;width:100%}
body.rbat #dOpts button.sel{background:linear-gradient(90deg,#2a9ad8,#173e86);color:#fff}body.rbat #dOpts button.sel::before{content:'◆';position:absolute;left:8px;color:#fff;font-size:11px;top:50%;transform:translateY(-50%)}
body.rbat #dNext,body.rbat #dSkip{display:none}
#rbh .rb-p{top:auto;bottom:max(10px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);flex-direction:row;width:auto;max-width:96vw;gap:8px}#rbh .rb-f{left:max(10px,env(safe-area-inset-left));right:auto}
#rbh .rb-p .rb-c{width:min(214px,29vw);display:flex;gap:8px;align-items:center;padding:6px 8px;border-left-width:1px;border-bottom:3px solid var(--c);background:linear-gradient(180deg,rgba(14,22,56,.9),rgba(8,12,34,.92));transition:transform .25s,box-shadow .25s}
#rbh .rb-p .rb-c.on{transform:translateY(-12px);box-shadow:0 0 0 1px var(--c),0 6px 22px rgba(80,170,255,.45)}
.rb-pt{flex:0 0 46px;height:46px;border-radius:8px;border:2px solid var(--c);background:#16224e center/cover no-repeat;display:grid;place-items:center;font-size:24px}
.rb-ci{flex:1;min-width:0}.rb-ci b{display:flex;justify-content:space-between;font-size:13px}.rb-ci .rr2{display:flex;align-items:center;gap:5px;font-size:10px;opacity:.95}.rb-ci .rr2 span{width:14px;color:#9ab8ff}.rb-ci .rr2 .rb-bar{flex:1}.rb-ci .rr2 em{font-style:normal;width:34px;text-align:right}
@media (max-height:520px){body.rbat #dlg{top:auto;bottom:86px;max-height:62vh}body.rbat #dOpts{max-height:36vh}}`;
  document.head.appendChild(st2);
  H.insertAdjacentHTML('beforeend', '<div class="rb-ord"></div><div class="rb-tl"><div class="rb-tr"><span class="w">WAIT</span><span class="c">COM</span><span class="a">ACT</span></div><div class="rb-mf"></div><div class="rb-mp"></div></div><div class="rb-ti" hidden></div>');
  const faceOf = m => m.id === 'zotik' ? '🦊' : ((C.PARTY && C.PARTY[m.id]) || {}).em || '⭐';
  const posCt = ct => (Math.max(0, Math.min(100, ct)) * .92 + 4).toFixed(1) + '%';
  const COST = { atk: 0, spell: -8, art: -25, team: -35, attr: -35, summon: -15, focus: -10, pot: 8, guard: 28, flee: 0 };
  const PN = { M: 'Manuell', A: 'Angriff', S: 'Schutz', H: 'Heilung' };
  const DES = [[/Teamangriff/, 'Gemeinsamer Angriff aller Gefährten. Braucht die volle Teamleiste.'], [/Angriff/, 'Greift mit der Waffe an. Treffer verzögern die Zeitleiste des Gegners.'], [/Magie/, 'Zauber nutzen Schwächen: wiederholte Treffer brechen den Gegner und unterbrechen seinen Zug.'],
    [/Zielfeuer/, 'Bis zu drei Ziele markieren und mit einer Salve belegen.'], [/Nebelfenn/, 'Ruft einen Verbündeten, der drei Runden mitkämpft und die Gruppe heilt.'], [/Sternenbund/, 'Große Gruppen-Attraktion. Verbraucht IP der ganzen Gruppe.'], [/Taktik/, 'Rolle der Gefährten wählen: sie handeln dann selbstständig, Zotik behält die Befehle.'],
    [/Trank/, 'Heilt das Gruppenmitglied mit den wenigsten LP.'], [/Abwehr/, 'Halbiert den Schaden bis zum nächsten Zug und lädt die Zeitleiste schneller.'], [/Auto/, 'Der Kampf läuft selbstständig bis zum Ende.'], [/Flucht|Davonsegeln/, 'Versucht zu entkommen. Bei Bossen nicht möglich.'], [/IP|Rissblitz|Heilwelle|Mondlicht|Kühlnebel|Provokation|Pfeilhagel|Schattenklinge|Runensiegel|Teslafeld|Sternsturz|Volltreffer/, 'Fähigkeit: braucht volle IP, die durch Treffer und Abwehr entstehen.']];
  function pickNext() { const L = [...up(), ...live()]; let b = null, bt = 1e9; for (const a of L) { const t = Math.max(0, (100 - a.ct) / a.sp); if (t < bt - .001 || (Math.abs(t - bt) <= .001 && a.party)) { bt = t; b = a; } } return { a: b, t: bt, L }; }
  function simulate(n) { const L = [...up(), ...live()].map(a => ({ a, ct: a.ct, sp: a.sp })), out = [];
    for (let i = 0; i < n && L.length; i++) { let b = null, bt = 1e9; for (const o of L) { const t = Math.max(0, (100 - o.ct) / o.sp); if (t < bt - .001 || (Math.abs(t - bt) <= .001 && o.a.party)) { bt = t; b = o; } } for (const o of L) o.ct += o.sp * bt; out.push(b.a); b.ct = 0; } return out; }
  function atbUI() {
    if (!B) return; const mk = (box, list, cls) => { for (const a of list) { if (!a.el) { a.el = document.createElement('i'); a.el.className = 'rb-mk ' + cls; a.el.textContent = a.ico; box.appendChild(a.el); } a.el.style.left = posCt(a.ct); a.el.classList.toggle('dead', !!a.dead || a.hp <= 0); a.el.classList.toggle('now', a === B.cur || a === B.curF); } };
    mk(q('.rb-mf'), B.foes, 'f'); mk(q('.rb-mp'), B.party, 'p');
    q('.rb-ord').innerHTML = simulate(8).map((a, i) => `<b class="${a.party ? 'p' : 'f'}${i === 0 ? ' n' : ''}" style="--c:${hx(a.party ? a.col || 0x8ad0ff : a.d.col || 0xff7a7a)}">${a.ico}</b>`).join('');
  }
  function showTI(f) { const t = q('.rb-ti'); B && (B.tgt = f); if (!f) { t.hidden = true; return; } B.curF = f; hud(); t.hidden = false; t.innerHTML = `<small>ZIELINFO</small><b>Lv. ${f.lv} · ${f.name}</b><div class="rb-bar"><i style="width:${pct(f.hp, f.max)}"></i></div><span>${Math.max(0, Math.ceil(f.hp))}/${f.max} LP · Schwäche ${EL[f.d.weak][0]} ${EL[f.d.weak][2]}${f.broken ? ' · BRUCH' : ''}</span>`; }

  /* ---------- Figuren auf der Bühne ---------- */
  let B = null, coolT = 0;   /* coolT: Zeitpunkt (ms), bis zu dem nach einem Kampf kein neuer beginnt */
  const actor = (root, base, face, o) => Object.assign({ root, base, face, lg: null, hop: 0, atk: -1, flash: 0, mv: 0 }, o);
  const top = a => ({ x: a.root.position.x, y: a.root.position.y + (a.h || 1.6), z: a.root.position.z });
  const at = (u, v) => ({ x: B.ox + B.fx * u + B.sx * v, z: B.oz + B.fz * u + B.sz * v });
  const gy = (x, z) => B.sea ? C.wl : Math.max(C.wl, C.hgt(x, z));
  function lunge(a, tx, tz, dist, d, hold) { const dx = tx - a.base.x, dz = tz - a.base.z, L = Math.hypot(dx, dz) || 1, k = Math.max(0, Math.min(dist, L - 1.6)); a.lg = { t: 0, d, hold, dx: dx / L * k, dz: dz / L * k }; }
  const shot = (p, l, d) => { B.shot = { p, l, t: 0, d: d || 1 }; };
  const P3 = (o, u, v, h) => ({ x: o.x + B.fx * u + B.sx * v, y: o.y + h, z: o.z + B.fz * u + B.sz * v });
  function shotOver(a, f) { const s = (a.v || 0) >= 0 ? 1 : -1, b = a.base, t = f ? f.base : at(8, 0); shot(P3(b, -4.2, s * 2.6, 2.9), { x: b.x + (t.x - b.x) * .6, y: b.y + 1.1, z: b.z + (t.z - b.z) * .6 }, 1.1); }
  function shotSide(f, a) { const m = { x: (f.base.x + a.base.x) / 2, y: (f.base.y + a.base.y) / 2, z: (f.base.z + a.base.z) / 2 }, s = (f.v || 0) >= 0 ? 1 : -1; shot(P3(m, -.5, s * 8, 3.4), { x: m.x, y: m.y + 1.1, z: m.z }, 1.1); }
  function shotFace(a) { const b = a.base; shot(P3(b, 3.4, (a.v >= 0 ? 1 : -1) * 1.2, 1.7), { x: b.x, y: b.y + 1.2, z: b.z }, 1); }
  const partyA = m => B.sea ? B.ship : m.act;
  const center = L => { const c = { x: 0, y: 0, z: 0 }; for (const f of L) { c.x += f.base.x; c.y += f.base.y; c.z += f.base.z; } const n = L.length || 1; return { x: c.x / n, y: c.y / n, z: c.z / n }; };

  function mkFoe(d, i, cnt, k, boss) {
    const P = d.mk(), v = (i - (cnt - 1) / 2) * (B.sea ? 4.4 : 3.6), u = (B.sea ? 10 : 8) + (cnt === 3 && i === 1 ? .9 : 0), p = at(u, v), sc = d.sc * (boss ? 1.55 : 1);
    P.root.scale.setScalar(sc); const y = gy(p.x, p.z) + (d.hov ? (B.sea ? .6 : .9) : 0) + (d.fly ? 1.6 : 0); P.root.position.set(p.x, y - (B.sea ? 2.5 : 0), p.z); scene.add(P.root);
    const lv = C.WLV[reg(k)] + (Math.random() * 3 | 0) + (boss ? 3 : 0), hp = Math.round(C.eHp(lv) * 1.25 * (boss ? 3.4 : 1));
    return actor(P.root, { x: p.x, y, z: p.z }, 0, { d, P, kk: P.kk || null, v, h: 1.4 * sc, sc, hp, max: hp, atk: C.eDm(lv) * 1.3 * (boss ? 1.35 : 1), lv, boss, brk: boss ? 4 : 2, brk0: boss ? 4 : 2, broken: 0, dead: 0, rise: B.sea ? 1 : 0,
      name: (boss ? '★ ' : '') + d.n + (cnt > 1 ? ' ' + 'ABC'[i] : '') });
  }

  /* ---------- Kampfbeginn ---------- */
  function start(k, ref, mode) {
    if (B || performance.now() < coolT) return; mode = mode === 'land' ? 'land' : 'sea'; const S = C.S(), pl = C.pl, sea = mode === 'sea';
    let fc = pl.face; if (ref && ref.x !== undefined) fc = Math.atan2(ref.x - pl.x, ref.z - pl.z);
    if (sea) for (let t = 0; t < 12; t++) { const a = fc + t * .52; if (C.water(pl.x + Math.sin(a) * 10, pl.z + Math.cos(a) * 10)) { fc = a; break; } }
    pl.face = fc; const fx = Math.sin(fc), fz = Math.cos(fc);
    B = { k, ref, mode, sea, ox: pl.x, oz: pl.z, fx, fz, sx: fz, sz: -fx, foes: [], party: [], turn: 0, guard: {}, taunt: null, auto: 0, shk: 0, shot: null, t: 0, vic: 0 };
    const P0 = pool(mode, k), rare = Math.random() < (sea ? .1 : .06), cnt = rare ? 1 : 1 + (Math.random() * (k <= 2 ? 2 : 3) | 0);
    const first = ref && ref.def ? ref.def : pick(P0);
    for (let i = 0; i < cnt; i++) B.foes.push(mkFoe(rare && sea ? seaDef(pick(SEABOSS)) : i === 0 ? first : pick(P0), i, cnt, k, rare));
    B.boss = rare;
    /* Gruppe: Zotik vorn, Gefährten daneben und dahinter (auf See alle an Bord der Nautilux) */
    const lead = S.lead ? C.CMP().find(a => a.id === S.lead) : null, SL = [[0, 0], [-1.3, -2.6], [-1.3, 2.6], [-2.8, 0]];
    const mkAct = (root, i) => { const s = SL[i], p = at(s[0], s[1]), y = gy(p.x, p.z); root.visible = true; return actor(root, { x: p.x, y, z: p.z }, fc, { v: s[1], h: 1.5 }); };
    if (sea) { const g = C.naut().g; B.ship = actor(g, { x: g.position.x, y: g.position.y, z: g.position.z }, g.rotation.y, { v: 0, h: 1.6, ship: 1 }); }
    const z0 = { id: 'zotik', n: 'Zotik', col: 0x8ad0ff, ip: 20, mag: 1, melee: 1, get hp() { return S.hp; }, set hp(v) { S.hp = v; }, get max() { return C.maxHp(); }, atk: () => C.atkV() };
    if (!sea) { z0.act = mkAct(lead ? lead.P.root : C.fox.root, 0); z0.act.fox = !lead; z0.act.P = lead ? lead.P : null; z0.act.kk = lead && lead.P.kk || null; }
    B.party.push(z0);
    C.CMP().filter(a => !a.ko && !a.guest && a.id !== S.lead).slice(0, 3).forEach((a, i) => { const p = C.PARTY[a.id], m = { id: a.id, n: p.n, col: p.col, ip: 20, a, melee: !!p.melee, get hp() { return a.hp; }, set hp(v) { a.hp = v; }, get max() { return C.cmax(a.id); }, atk: () => C.cAtk(a.id) * 1.4, crit: () => C.cg(a.id, 'crit'), def: () => C.cg(a.id, 'def') };
      if (!sea) { m.act = mkAct(a.P.root, i + 1); m.act.P = a.P; m.act.kk = a.P.kk || null; } B.party.push(m); });
    C.setOn(true); document.body.classList.add('rbat'); if (ref && ref.hide) ref.hide(); if (ref && ref.P && ref.P.root) ref.P.root.visible = false; C.$('hud').hidden = true; H.hidden = false; q('.rb-r').classList.remove('on'); flashScr(); sfx('roar'); music(rare); hud();
    banner(rare ? '⚠️ ' + B.foes[0].d.n : sea ? '🌊 Seekampf' : '⚔️ Kampf', rare ? 'Eine gewaltige Bestie!' : B.foes.map(f => f.d.n).join(' · '));
    const c = center(B.foes), o = { x: B.ox, y: gy(B.ox, B.oz), z: B.oz }; camera.position.set(o.x + B.sx * 9 + B.fx * 3, o.y + 2.2, o.z + B.sz * 9 + B.fz * 3);
    shot({ x: c.x + B.sx * 5 - B.fx * 4, y: c.y + 2.4, z: c.z + B.sz * 5 - B.fz * 4 }, { x: c.x, y: c.y + 1.2, z: c.z }, 1.4);
    for (const f of B.foes) if (C.MFX) C.MFX().circle(f.base.x, gy(f.base.x, f.base.z), f.base.z, f.d.col || 0xff6a6a, 2.2 * f.sc, 1.2);
    B.party.forEach((m, i) => { m.party = 1; m.ico = faceOf(m); m.sp = m.id === 'zotik' ? 11 : 9.4 + (i % 3) * .7; m.ct = rnd(35, 75); });
    B.foes.forEach(f => { f.ico = (f.name.replace('★ ', '')[0] || '?'); f.sp = Math.min(13, 6.5 + f.lv * .12 + (f.d.hov ? 1.5 : 0) + (f.boss ? 2 : 0)); f.ct = rnd(10, 55); });
    q('.rb-mf').innerHTML = q('.rb-mp').innerHTML = ''; showTI(null); atbUI(); { const f0 = pickNext().a; if (f0.party) setTimeout(() => B && toast('⚡ Initiative! Die Gruppe ist zuerst dran'), 900); }
    setTimeout(() => B && loop(), 1700);
  }
  const live = () => B.foes.filter(f => !f.dead), up = () => B.party.filter(m => m.hp > 0);

  /* ---------- Befehle ---------- */
  const SPELLS = [{ id: 'fire', t: '🔥 Feuer', mp: 6, k: 1.35 }, { id: 'ice', t: '❄️ Eis', mp: 6, k: 1.35 }, { id: 'storm', t: '⚡ Blitz (alle)', mp: 12, k: .95, all: 1 }, { id: 'light', t: '✨ Licht', mp: 9, k: 1.6 }, { id: 'heal', t: '💚 Heilung (Gruppe)', mp: 10, heal: 1 }];
  const ART = { zotik: ['🌠 Rissblitz', 'all', 'light'], lyra: ['💚 Heilwelle', 'heal'], mira: ['🌙 Mondlicht', 'heal'], mirael: ['💧 Kühlnebel', 'heal'], rovan: ['📣 Provokation', 'taunt'], toren: ['🔥 Glutschlag', 'big', 'fire'],
    nia: ['🏹 Pfeilhagel', 'all', 'storm'], kael: ['🗡️ Schattenklinge', 'multi'], eryn: ['📜 Runensiegel', 'all', 'light'], prof: ['⚡ Teslafeld', 'all', 'storm'], aera: ['🌟 Sternsturz', 'big', 'light'] };
  const art = id => ART[id] || ['🎯 Volltreffer', 'big'];
  const tagF = f => EL[f.d.weak][0] + ' ' + f.name + ' · ' + Math.max(0, Math.ceil(f.hp)) + '/' + f.max;
  function ask(m) {
    return new Promise(res => {
      const S = C.S(), L = live(), again = () => ask(m).then(res), o = [];
      const tgt = fn => L.length === 1 ? fn(L[0]) : say([[m.n, 'Welches Ziel?']], null, [...L.map(f => ({ t: tagF(f), fn: () => fn(f), h: () => showTI(f) })), { t: '↩ Zurück', fn: again }]);
      o.push({ t: '⚔️ Angriff', fn: () => tgt(f => res({ k: 'atk', f })) });
      if (m.mag) o.push({ t: '✨ Magie', fn: () => say([['Zotik', 'Welcher Zauber? (MP ' + Math.floor(S.mp) + ')']], null, [...SPELLS.map(sp => ({ t: sp.t + ' · ' + sp.mp + ' MP', d: sp.heal ? 'Heilt die ganze Gruppe.' : (sp.all ? 'Trifft alle Gegner. ' : '') + (EL[sp.id] ? 'Wirkt stark gegen Gegner mit Schwäche ' + EL[sp.id][0] + ' ' + EL[sp.id][2] + '.' : ''), fn: () => S.mp < sp.mp ? (toast('Nicht genug MP'), again()) : sp.all || sp.heal ? res({ k: 'spell', sp }) : tgt(f => res({ k: 'spell', sp, f })) })), { t: '↩ Zurück', fn: again }]) });
      const [an] = art(m.id); o.push({ t: an + (m.ip >= 40 ? ' ⭐' : ' · IP ' + m.ip + '/40'), fn: () => m.ip >= 40 ? res({ k: 'art' }) : (toast('IP füllen sich durch Treffer und Abwehr'), again()) });
      const sw = up().filter(p => p !== m && p.ct >= 50); if (sw.length) o.splice(1, 0, { t: '🔁 Wechsel · ' + sw.map(p => p.n).join(', '), d: 'Ein anderer Gefährte in der COM-Zone übernimmt den Zug.', fn: () => sw.length === 1 ? res({ k: 'swap', to: sw[0] }) : say([[m.n, 'Wer übernimmt?']], null, [...sw.map(p => ({ t: p.n + ' · Lv ' + (C.clv ? C.clv(p.id) : ''), fn: () => res({ k: 'swap', to: p }) })), { t: '↩ Zurück', fn: again }]) });
      const co = up().length > 1, ob = (k, ok, why, fn) => o.push({ t: BEI[k].em + ' ' + BEI[k].n + (ok ? why : ' · ' + bLock(k)), fn: ok ? fn : () => (toast('Wird mit dem Kernsplitter ' + BEI[k].rb + ' der Geschichte freigeschaltet'), again()) });
      if (S.party && S.party.length) o.push({ t: '🤝 Teamangriff · ' + Math.floor(S.tg || 0) + '%', fn: () => (S.tg || 0) >= 100 ? res({ k: 'team' }) : (toast('🤝 Teamleiste füllt sich durch Treffer'), again()) });
      ob('focus', bOn(S, 'focus'), ' · ' + BEI.focus.mp + ' MP', () => S.mp < BEI.focus.mp ? (toast('Zu wenig MP'), again()) : pickFocus(m, L, again, res));
      if (up().length) ob('summon', bOn(S, 'summon'), B.sum ? ' · schon da' : ' · ' + BEI.summon.mp + ' MP', () => B.sum || S.mp < BEI.summon.mp ? (toast(B.sum ? 'Der Nebelfenn ist schon da' : 'Zu wenig MP'), again()) : res({ k: 'summon' }));
      if (co) ob('attr', bOn(S, 'attr'), ' · IP ' + up().reduce((a, p) => a + Math.floor(p.ip), 0) + '/' + 40 * Math.min(3, up().length), () => up().reduce((a, p) => a + p.ip, 0) >= 40 * Math.min(3, up().length) ? res({ k: 'attr' }) : (toast('Alle brauchen genug IP'), again()));
      if (m === B.party[0] && co) ob('tact', bOn(S, 'tact'), ' · ' + PN[B.para || 'M'], () => say([[m.n, 'Taktik der Gefährten?']], null, [...Object.entries(PN).map(([k, n]) => ({ t: (B.para || 'M') === k ? '▶ ' + n : n, fn: () => { B.para = k; toast('🎭 Taktik: ' + n); again(); } })), { t: '↩ Zurück', fn: again }]));
      if (S.potions > 0) o.push({ t: '🧪 Trank (' + S.potions + ')', fn: () => res({ k: 'pot' }) });
      o.push({ t: '🛡️ Abwehr', fn: () => res({ k: 'guard' }) }, { t: '⏩ Auto', fn: () => { B.auto = 1; toast('⏩ Auto-Kampf bis zum Ende'); res(autoCmd(m)); } });
      if (!B.boss) o.push({ t: B.sea ? '🏃 Davonsegeln' : '🏃 Flucht', fn: () => res({ k: 'flee' }) });
      o.forEach(x => { if (!x.d) { const r = DES.find(z => z[0].test(x.t)); if (r) x.d = r[1]; } }); showTI(null);
      /* Hauptliste: Angriff, Magie ▸, Fähigkeiten ▸, Wechsel, Taktik, Items, Abwehr, Auto, Flucht */
      if (C.cycleCombat) o.push({ t: '⚙️ Kampfsystem wechseln', d: 'Schnellaktion: stellt das Kampfsystem um (Auto, Echtzeit, Rundenbasiert). Gilt ab dem nächsten Kampf.', fn: () => { C.cycleCombat(); again(); } });
      const by = re => o.find(x => re.test(x.t)), main = ['^⚔️', '✨ Magie', null, '🔁', 'Taktik', '🧪', '🛡️', '⏩', '🏃', '⚙️ Kampfsystem'].map(r => r === null ? 'F' : by(new RegExp(r))).filter(Boolean);
      const abil = o.filter(x => !main.includes(x));
      if (abil.length) { const e = { t: '🌠 Fähigkeiten ▸', d: 'Kunst, Teamangriff, Zielfeuer, Beschwörung und Attraktion.', fn: () => say([[m.n, 'Fähigkeiten']], null, [...abil, { t: '↩ Zurück', fn: again }]) }; main.splice(main.indexOf('F'), 1, e); } else main.splice(main.indexOf('F'), 1);
      const mg = main.find(x => /Magie/.test(x.t)); if (mg) mg.t = '✨ Magie ▸';
      say([[m.n, m.n + ' ist am Zug.']], null, main);
    });
  }
  function pickFocus(m, L, again, res, got) {
    got = got || []; const rest = L.filter(f => !got.includes(f));
    if (!rest.length || got.length >= 3) return res({ k: 'focus', fs: got });
    say([[m.n, 'Zielfeuer: ' + (got.length ? got.length + ' markiert' : 'Wen anvisieren?') + ' (bis 3)']], null, [...rest.map(f => ({ t: '🎯 ' + tagF(f), fn: () => pickFocus(m, L, again, res, got.concat(f)) })), ...(got.length ? [{ t: '🔥 Feuer frei!', fn: () => res({ k: 'focus', fs: got }) }] : []), { t: '↩ Zurück', fn: again }]);
  }
  function autoCmd(m) {
    const S = C.S(), L = live(), low = up().filter(p => p.hp < p.max * .4), [, ty] = art(m.id);
    if (m.ip >= 40 && (ty !== 'heal' || low.length) && (ty !== 'taunt' || low.length)) return { k: 'art' };
    if (low.length && m.mag && S.mp >= 10) return { k: 'spell', sp: SPELLS[4] };
    if (m.hp < m.max * .25 && S.potions > 0) return { k: 'pot' };
    if (m.mag && S.mp >= 6 + 12) { const w = L.find(f => f.d.weak === 'fire' || f.d.weak === 'ice'); if (w) return { k: 'spell', sp: SPELLS.find(s => s.id === w.d.weak), f: w }; if (L.length > 1 && S.mp >= 30) return { k: 'spell', sp: SPELLS[2] }; }
    return { k: 'atk', f: L.slice().sort((a, b) => a.hp - b.hp)[0] };
  }

  /* ---------- Ablauf einer Runde ---------- */
  function paraCmd(m) {
    const S = C.S(), low = up().filter(p => p.hp < p.max * .5), [, ty] = art(m.id), P = B.para;
    if (P === 'H') { if (m.ip >= 40 && ty === 'heal' && low.length) return { k: 'art' }; if (low.length && S.potions > 0 && m.hp < m.max * .5) return { k: 'pot' }; return { k: 'guard' }; }
    if (P === 'S') { if (m.ip >= 40 && (ty === 'taunt' || (ty === 'heal' && low.length))) return { k: 'art' }; return { k: 'guard' }; }
    return autoCmd(m);
  }
  async function sumStrike() {
    const f = live().sort((x, y) => x.hp - y.hp)[0], z = B.party[0]; if (!f || !B.sumM) return; B.sum--; B.curF = f; shotSide(f, partyA(z)); await wait(350); if (!B) return;
    C.MFX().bolt(B.sumM.position.x, B.sumM.position.y, B.sumM.position.z, f.base.x, f.base.y + f.h * .5, f.base.z, 0xbfe8ff, .3); hit(f, z.atk() * .7, null, 'storm', false); await wait(450); if (!B) return;
    B.curF = null; if (!B.sum && B.sumM) { scene.remove(B.sumM); B.sumM = null; }
  }
  /* Zeitleiste: wer zuerst 100 erreicht, ist dran; Treffer schieben die Leiste des Gegners zurück (verzögern) oder setzen sie bei Bruch weit zurück (unterbrechen) */
  async function loop() {
    while (B && !B.over) {
      if (!live().length) return win(); if (!up().length) return lose();
      const { a: b, t: bt, L } = pickNext(); for (const a of L) a.ct = Math.min(100, a.ct + a.sp * bt); b.ct = 100; atbUI(); await wait(Math.min(650, 120 + bt * 80)); if (!B || B.over) return;
      if (b.party) {
        let m = b; B.cur = m; B.guard[m.id] = 0; if (B.taunt === m) B.taunt = null; hud(); atbUI();
        const a = partyA(m); if (a) { const bs = a.base; B.shot = null; B.idle = { x: bs.x, y: bs.y, z: bs.z }; }
        let c = B.auto ? autoCmd(m) : (B.para && B.para !== 'M' && m !== B.party[0]) ? paraCmd(m) : await ask(m); if (!B) return;
        while (c && c.k === 'swap') { m = c.to; B.cur = m; B.guard[m.id] = 0; hud(); atbUI(); { const a2 = partyA(m); if (a2) { const bs = a2.base; B.shot = null; B.idle = { x: bs.x, y: bs.y, z: bs.z }; } } c = await ask(m); if (!B) return; }
        showTI(null);
        if (c.k === 'flee') { if (await flee()) return; m.ct = 0; B.cur = null; continue; }
        await doCmd(m, c); if (!B) return; m.ct = COST[c.k] || 0; B.cur = null; B.idle = null; if (B.sum > 0 && live().length) await sumStrike(); if (!B) return; hud(); atbUI(); await wait(260);
      } else {
        if (b.dead) continue; B.curF = b; atbUI(); await foeAct(b); if (!B) return; b.ct = 0; B.turn++; atbUI(); await wait(240);
      }
    }
  }
  async function doCmd(m, c) {
    const S = C.S(), a = partyA(m), FX = C.FXH(), MF = C.MFX();
    if (c.k === 'atk') { const f = c.f && !c.f.dead ? c.f : live()[0]; if (!f) return; B.curF = f; hud(); shotOver(a, f); await wait(380);
      const crit = Math.random() < .12 + (m.crit ? m.crit() : 0), dmg = m.atk() * (crit ? 1.7 : 1);
      if (B.sea) { lunge(a, f.base.x, f.base.z, 2.2, .55); sfx('slash'); await wait(220); MF.bolt(a.base.x, a.base.y + 1.2, a.base.z, f.base.x, f.base.y + f.h * .5, f.base.z, m.col || 0x8ad0ff, .25); await wait(160); }
      else if (m.melee) { lunge(a, f.base.x, f.base.z, 99, .85, 1); a.atk = 0; sfx('dodge'); await wait(300); sfx(crit ? 'crit' : 'slash'); if (a.kk) C.KK.once(a.kk, 'Throw'); }
      else { if (a.kk) C.KK.once(a.kk, 'Throw'); lunge(a, f.base.x, f.base.z, .7, .4); await wait(200); MF.flare(a.base.x, a.base.y + 1.3, a.base.z, m.col || 0xffffff, 1.4, .3); MF.bolt(a.base.x, a.base.y + 1.3, a.base.z, f.base.x, f.base.y + f.h * .5, f.base.z, m.col || 0xffffff, .22); await wait(180); }
      hit(f, dmg, m, null, crit); if (crit) dnum(top(f).x, top(f).y + .5, top(f).z, 'KRITISCH!', 'w'); await wait(520); B.curF = null; return; }
    if (c.k === 'spell') { const sp = c.sp; S.mp = Math.max(0, S.mp - sp.mp); shotFace(a); if (a.kk) C.KK.once(a.kk, 'Interact'); sfx('skill1');
      const col = sp.heal ? 0x7dffb2 : EL[sp.id][1]; MF.circle(a.base.x, a.base.y, a.base.z, col, 2.2, 1); MF.swirl(a.base.x, a.base.y, a.base.z, col, 1.2, 2.4, .9); hud(); await wait(750);
      if (sp.heal) { shot(P3(a.base, 4.5, 3, 2.6), { x: a.base.x, y: a.base.y + 1, z: a.base.z }, 1); for (const p of up()) { const h = Math.round(p.max * .35); p.hp = Math.min(p.max, p.hp + h); const pa = partyA(p); MF.heal(pa.base.x, pa.base.y, pa.base.z); dnum(pa.base.x, pa.base.y + 2.2, pa.base.z, '+' + h, 'h'); } sfx('heal'); hud(); await wait(700); return; }
      const T0 = sp.all ? live() : [c.f && !c.f.dead ? c.f : live()[0]].filter(Boolean), cc = center(T0); shot(P3(a.base, -4, 3.5, 3.4), { x: cc.x, y: cc.y + 1, z: cc.z }, 1.2); await wait(300);
      for (const f of T0) { const p = top(f);
        if (sp.id === 'fire') { MF.flare(p.x, p.y - .3, p.z, 0xff7a3a, 3.4, .5); MF.ring(f.base.x, f.base.y + .2, f.base.z, 0xff9a40, 2.2, .6, 1.5); emit(p.x, p.y - .4, p.z, 0xff8a3a, 24, 5, .7, .4, 2); }
        else if (sp.id === 'ice') { MF.burstShards(p.x, p.y - .3, p.z, 0xbfefff, 1.2); MF.ring(f.base.x, f.base.y + .1, f.base.z, 0x9ae0ff, 2, .6, 0); }
        else if (sp.id === 'storm') MF.bolt(p.x + rnd(-1, 1), p.y + 9, p.z, p.x, p.y - .3, p.z, 0xfff27a, .35);
        else { FX.pillar(f.base.x, f.base.y, f.base.z, 0xfff2c0, 1.1, 7, .9); MF.flare(p.x, p.y, p.z, 0xffffff, 3, .4); }
        sfx(sp.id === 'storm' ? 'crit' : 'skill2'); hit(f, m.atk() * sp.k, m, sp.id, true); await wait(sp.all ? 160 : 0); }
      await wait(650); return; }
    if (c.k === 'art') { const [an, ty, el] = art(m.id); m.ip -= 40; flashScr(); banner(an, m.n); sfx('skill2'); shotFace(a); MF.circle(a.base.x, a.base.y, a.base.z, 0xffe27a, 3, 1.2); MF.swirl(a.base.x, a.base.y, a.base.z, 0xffe27a, 1.5, 3, 1); if (a.kk) C.KK.once(a.kk, 'Interact'); hud(); await wait(900);
      if (ty === 'heal') { for (const p of up()) { const h = Math.round(p.max * .45), pa = partyA(p); p.hp = Math.min(p.max, p.hp + h); MF.heal(pa.base.x, pa.base.y, pa.base.z); dnum(pa.base.x, pa.base.y + 2.2, pa.base.z, '+' + h, 'h'); } for (const p of B.party) if (p.hp <= 0 && p.a) { p.hp = Math.round(p.max * .3); p.a.ko = false; if (p.a.P.kk) C.KK.ko(p.a.P.kk, false); } sfx('heal'); }
      else if (ty === 'taunt') { B.taunt = m; B.guard[m.id] = 1; MF.ring(a.base.x, a.base.y + .2, a.base.z, 0xffb040, 3, .8, 1); toast('📣 Die Gegner greifen ' + m.n + ' an'); }
      else if (ty === 'all') { const L = live(), cc = center(L); shot(P3(cc, -9, 4, 6), { x: cc.x, y: cc.y + 1, z: cc.z }, 1.6); await wait(250);
        await Promise.all(L.map((f, i) => new Promise(r => setTimeout(() => { const p = top(f); MF.starfall(p.x, f.base.y, p.z, EL[el][1], .7, () => { if (B && !f.dead) { hit(f, m.atk() * 1.25, null, el, true); B.shk = .4; C.hitStop(.06); } r(); }); }, i * 180)))); }
      else { const f = live().sort((x, y) => x.hp - y.hp)[0]; if (f) { shotSide(f, a); if (!B.sea && m.melee) { lunge(a, f.base.x, f.base.z, 99, 1, 1); await wait(380); } const p = top(f);
        for (let i = 0; i < (ty === 'multi' ? 3 : 1); i++) { MF.flare(p.x, p.y - .3, p.z, el ? EL[el][1] : 0xffffff, 3.6, .45); FX.pillar(f.base.x, f.base.y, f.base.z, el ? EL[el][1] : 0xc8d8ff, 1.2, 6, .7); if (!f.dead) hit(f, m.atk() * (ty === 'multi' ? 1.1 : 2.4), null, el, true); C.hitStop(.08); B.shk = .45; await wait(260); } } }
      await wait(800); return; }
    if (c.k === 'pot') { S.potions--; const p = up().sort((x, y) => x.hp / x.max - y.hp / y.max)[0], pa = partyA(p), h = Math.round(p.max * .5); if (a.kk) C.KK.once(a.kk, 'Use_Item'); p.hp = Math.min(p.max, p.hp + h); sfx('heal'); MF.heal(pa.base.x, pa.base.y, pa.base.z); dnum(pa.base.x, pa.base.y + 2.2, pa.base.z, '+' + h, 'h'); hud(); await wait(700); return; }
    if (c.k === 'focus') { S.mp = Math.max(0, S.mp - BEI.focus.mp); const T0 = (c.fs || []).filter(f => !f.dead); if (!T0.length) return; banner('🎯 Zielfeuer', T0.length + ' Ziele'); sfx('skill1'); shotOver(a, T0[0]); hud(); await wait(500);
      for (const f of T0) { MF.circle(f.base.x, f.base.y, f.base.z, 0xff6a6a, 1.4, .8); await wait(160); }
      for (let r = 0; r < 2; r++) for (const f of T0) { if (f.dead) continue; MF.bolt(a.base.x, a.base.y + 1.3, a.base.z, f.base.x, f.base.y + f.h * .5, f.base.z, 0xffd070, .2); sfx('slash'); hit(f, m.atk() * .85, m, null, false); await wait(150); }
      await wait(500); return; }
    if (c.k === 'team') { S.tg = 0; B.curF = null; const L = live(); banner('🤝 Teamangriff', 'Gefährten & Zotik'); flashScr(); sfx('skill2'); const cc = center(L); shot(P3(cc, -9, 4, 6), { x: cc.x, y: cc.y + 1, z: cc.z }, 1.6); await wait(300);
      for (const p of up()) { const pa = partyA(p); if (pa) MF.swirl(pa.base.x, pa.base.y, pa.base.z, p.col || 0xffffff, 1.2, 2, .8); }
      for (const f of L) { if (f.dead) continue; const p = top(f); MF.starfall(p.x, f.base.y, p.z, 0xffe8a0, .7, () => { if (B && !f.dead) hit(f, m.atk() * 1.7, m, 'light', true); }); await wait(180); }
      for (const p of up()) { const h = Math.round(p.max * .15); p.hp = Math.min(p.max, p.hp + h); } hud(); await wait(1100); return; }
    if (c.k === 'summon') { S.mp = Math.max(0, S.mp - BEI.summon.mp); B.sum = 3; flashScr(); banner('🌫️ ' + BEI.summon.n, 'Ein Verbündeter erscheint'); sfx('skill2'); shotFace(a);
      const g = new C.T.Mesh(new C.T.SphereGeometry(.7, 14, 10), new C.T.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: .75 })); const p0 = at(-1, 5); g.position.set(p0.x, gy(p0.x, p0.z) + 1.4, p0.z); scene.add(g); B.sumM = g;
      MF.circle(p0.x, gy(p0.x, p0.z), p0.z, 0xbfe8ff, 2.4, 1.2); await wait(900);
      for (const p of up()) { const h = Math.round(p.max * .25), pa = partyA(p); p.hp = Math.min(p.max, p.hp + h); if (pa) { MF.heal(pa.base.x, pa.base.y, pa.base.z); dnum(pa.base.x, pa.base.y + 2.1, pa.base.z, '+' + h, 'h'); } } hud();
      for (const f of live()) { hit(f, m.atk() * 1.0, m, 'storm', true); await wait(140); } await wait(500); return; }
    if (c.k === 'attr') { for (const p of up().slice(0, 3)) p.ip -= 40; banner('💥 ' + BEI.attr.n, 'Große Attraktion'); flashScr(); sfx('crit'); const L = live(), cc = center(L); shot(P3(cc, -9, 4, 6), { x: cc.x, y: cc.y + 1, z: cc.z }, 2); await wait(400);
      for (let i = 0; i < 3; i++) { for (const f of live()) { const p = top(f); MF.flare(p.x, p.y, p.z, 0xffe27a, 3.4, .4); FX.pillar(f.base.x, f.base.y, f.base.z, 0xfff2c0, 1.4, 8, .8); hit(f, m.atk() * 1.4, m, ELS[i % 5], true); } await wait(480); }
      await wait(500); return; }
    if (c.k === 'guard') { B.guard[m.id] = 1; m.ip = Math.min(100, m.ip + 10); MF.ring(a.base.x, a.base.y + .2, a.base.z, 0x8ad0ff, 1.6, .7, 1.2); toast('🛡️ ' + m.n + ' wehrt ab'); hud(); await wait(450); }
  }
  function hit(f, dmg, m, el, big) {
    if (!B || f.dead) return; let k = 1, tag = '';
    if (el && f.d.weak === el) { k = 1.8; tag = 'weak'; if (!f.broken && f.brk > 0 && --f.brk === 0) { f.broken = 2; tag = 'break'; } }
    if (f.broken) k *= 1.5;
    dmg = Math.max(1, Math.round(dmg * k * (f.d.def || 1) * rnd(.92, 1.08))); f.hp -= dmg; f.flash = .3;
    const p = top(f), ax = f.base.x + B.fx * 3, az = f.base.z + B.fz * 3; lunge(f, ax, az, .7, .3);
    dnum(p.x, p.y, p.z, dmg, big || tag ? 'c' : ''); if (tag === 'weak') dnum(p.x, p.y + .6, p.z, EL[el][0] + ' SCHWÄCHE', 'w');
    if (tag === 'break') { dnum(p.x, p.y + 1, p.z, 'BRUCH!', 'b'); sfx('crit'); C.hitStop(.14); flashScr(); }
    C.FXH().impact(p.x, p.y - .5, p.z, el ? EL[el][1] : 0xfff0c0, big || !!tag); emit(p.x, p.y - .5, p.z, el ? EL[el][1] : 0xffffff, 10, 3, .4, .3, 0);
    if (f.kk) C.KK.once(f.kk, 'Hit_A'); sfx('hit'); B.shk = Math.max(B.shk, big ? .3 : .16);
    { const near = f.ct >= 60; f.ct = tag === 'break' ? -35 : Math.max(-25, f.ct - (tag === 'weak' ? 30 : near ? 22 : 10)); if (near || tag) dnum(p.x, p.y + 1.3, p.z, tag === 'break' ? 'UNTERBROCHEN!' : '⏳ verzögert', tag === 'break' ? 'b' : 'x'); atbUI(); }
    if (m) { m.ip = Math.min(100, m.ip + (tag ? 14 : 8)); if (C.gAdd) C.gAdd('tg', tag ? 9 : 5); }
    if (f.hp <= 0) { f.dead = 1; f.dt = 0; sfx('kill'); C.FXH().soul(p.x, p.y - .4, p.z, f.d.col || 0xc8f4ff); C.MFX().burstShards(p.x, p.y - .4, p.z, f.d.col || 0xc8f4ff, 1); if (f.kk) C.KK.ko(f.kk, true); }
    hud();
  }
  async function foeAct(f) {
    if (f.broken) { f.broken--; if (!f.broken) f.brk = f.brk0; const p = top(f); dnum(p.x, p.y, p.z, '💫 benommen', 'x'); hud(); await wait(600); return; }
    const T0 = up(); if (!T0.length) return; const m = B.taunt && B.taunt.hp > 0 ? B.taunt : T0[Math.random() * T0.length | 0], a = partyA(m), MF = C.MFX();
    B.curF = f; hud(); const aoe = f.boss && ((f.acts = (f.acts || 0) + 1) % 3 === 0); shotSide(f, a); f.charge = .6; sfx('roar'); await wait(520); if (!B) return;
    if (aoe) { banner(f.d.n, B.sea ? 'Mahlstrom!' : 'Beben!'); const c = center(B.party.map(partyA).filter(Boolean)); MF.ring(c.x, c.y + .2, c.z, f.d.col || 0xa06aff, 6, .9, 0); MF.circle(c.x, c.y, c.z, f.d.col || 0xa06aff, 5, 1); await wait(400); for (const p of up()) hurt(p, f.atk * .7); }
    else if (f.d.hov) { const p = top(f), col = EL[ELS[(ELS.indexOf(f.d.weak) + 2) % 5]][1]; MF.flare(p.x, p.y - .4, p.z, col, 2, .4); await wait(250); MF.bolt(p.x, p.y - .4, p.z, a.base.x, a.base.y + 1.1, a.base.z, col, .3); await wait(200); hurt(m, f.atk); }
    else { lunge(f, a.base.x, a.base.z, 99, .9, 1); if (f.kk) C.KK.once(f.kk, 'Throw'); await wait(360); hurt(m, f.atk); }
    await wait(560); B && (B.curF = null);
  }
  function hurt(m, raw) {
    if (!B || m.hp <= 0) return; const g = B.guard[m.id], a = partyA(m), d = Math.round(raw * (g ? .45 : 1) * (1 - (m.def ? m.def() : 0)) * rnd(.85, 1.15)); m.hp = Math.max(0, m.hp - d); m.ip = Math.min(100, m.ip + 12);
    sfx('hurt'); dnum(a.base.x, a.base.y + 2.1, a.base.z, (B.sea ? m.n + ' ' : '') + '−' + d, 'p'); C.FXH().impact(a.base.x, a.base.y + 1, a.base.z, 0xff6a5a, false); B.shk = Math.max(B.shk, .28);
    if (g) C.MFX().ring(a.base.x, a.base.y + .8, a.base.z, 0x8ad0ff, 1.4, .4, 0); if (a.kk) C.KK.once(a.kk, 'Hit_A'); if (!a.ship) lunge(a, a.base.x - B.fx * 3, a.base.z - B.fz * 3, .5, .3);
    if (m.hp <= 0) { toast('💫 ' + m.n + ' ist K.O.'); if (m.a) { m.a.ko = true; m.a.kot = 0; } if (a.kk) C.KK.ko(a.kk, true); a.down = 1; }
    hud();
  }

  /* ---------- Ende ---------- */
  async function win() {
    if (!B || B.over) return; B.over = 1; B.cur = B.curF = null; stopMusic(); fanfare(); const S = C.S();
    const xp = B.foes.reduce((s, f) => s + Math.round((6 + 4 * f.lv) * (f.boss ? 4 : 1.3)), 0), sh = B.foes.reduce((s, f) => s + Math.round(2 + f.lv * .5) * (f.boss ? 4 : 1), 0); S.shards += sh;
    const potion = Math.random() < .25 ? (S.potions = (S.potions || 0) + 1, 1) : 0, gear = Math.random() < (B.boss ? 1 : .15) ? C.cgDrop(reg(B.k) + (B.boss ? 2 : 0)) : '';
    for (const m of up()) { const a = partyA(m); if (a) { a.hop = 1.8; if (a.kk) C.KK.once(a.kk, 'Interact'); } }
    B.vic = 1; showTI(null); hud(); const snap = () => B.party.map(m => Object.assign({ m }, C.cinfo ? C.cinfo(m.id) : { lv: 0, xp: 0, need: 1 })), b0 = snap(); C.gainXp(xp); const b1 = snap(), r = q('.rb-r');
    r.className = 'rb-r res'; r.innerHTML = `<div class="rs"><h3>Beute</h3><div class="rr"><span>Erfahrung</span><b>${xp} <em>EP</em></b></div><div class="rr"><span>Splitter</span><b>${sh} <em>💎</em></b></div>${potion ? '<div class="rr"><span>Fund</span><b>🧪 Trank</b></div>' : ''}${gear ? '<div class="rr"><span>Ausrüstung</span><b>🎁 ' + gear + '</b></div>' : ''}</div>
      <div class="rs"><h3>Danach</h3><div class="rc">${b1.map((x, i) => `<div class="rm" style="--c:${hx(x.m.col || 0x8ad0ff)}"><div class="pt">${faceOf(x.m)}</div><div class="nm">${x.m.n}</div><div class="lv">Stufe <b>${x.lv}</b></div>${x.lv > b0[i].lv ? '<div class="up">STUFE AUF!</div>' : ''}<div class="ln"><span>EP</span><b>${x.xp}</b></div><div class="ln"><span>Nächste Stufe</span><b>${Math.max(0, x.need - x.xp)}</b></div></div>`).join('')}</div></div><small>Tippen oder Taste zum Fortfahren</small>`;
    r.classList.add('on'); await new Promise(res => { let d = 0; const done = () => { if (d) return; d = 1; removeEventListener('keydown', done); r.removeEventListener('pointerdown', done); res(); }; setTimeout(done, 8000); setTimeout(() => { addEventListener('keydown', done); r.addEventListener('pointerdown', done); }, 900); });
    const fin = B && B.ref; end(); if (fin) fin.gone = 1;
  }
  async function flee() {
    if (Math.random() < .75) { toast(B.sea ? '🚤 Entkommen!' : '🏃 Entkommen!'); for (const m of up()) { const a = partyA(m); if (a && !a.ship) lunge(a, a.base.x - B.fx * 9, a.base.z - B.fz * 9, 5, .9); } sfx('dodge'); await wait(650); if (B && B.ref && B.ref.x !== undefined) { B.ref.x -= B.fx * -6; B.ref.z -= B.fz * -6; } end(); return true; }
    toast('Der Weg ist abgeschnitten!'); await wait(600); return false;
  }
  function lose() { if (!B || B.over) return; B.over = 1; stopMusic(); banner(B.sea ? 'Die Nautilux treibt ab' : 'Die Gruppe zieht sich zurück', 'Zurück in Sicherheit'); const S = C.S(); S.hp = Math.round(C.maxHp() * .3); for (const m of B.party) if (m.a) { m.a.ko = false; m.a.hp = Math.round(m.max * .3); if (m.a.P.kk) C.KK.ko(m.a.P.kk, false); } end(); C.lose(); }
  function end() {
    if (!B) return; document.body.classList.remove('rbat'); if (B.ref && !B.ref.gone) { if (B.ref.show) B.ref.show(); if (B.ref.P && B.ref.P.root) B.ref.P.root.visible = true; } stopMusic(); if (B.sumM) scene.remove(B.sumM); if (B.tl) scene.remove(B.tl); q('.rb-mf').innerHTML = q('.rb-mp').innerHTML = ''; q('.rb-ti').hidden = true; q('.rb-r').className = 'rb-r'; for (const f of B.foes) scene.remove(f.root);
    for (const m of B.party) { const a = m.act; if (!a) continue; a.root.position.set(a.base.x, a.base.y, a.base.z); a.root.rotation.set(0, a.face, 0); if (m.a) { m.a.x = a.base.x; m.a.z = a.base.z; m.a.face = a.face; } if (a.kk && !(m.a && m.a.ko)) C.KK.ko(a.kk, false); }
    if (B.ship) B.ship.root.position.set(B.ship.base.x, B.ship.base.y, B.ship.base.z);
    const S = C.S(); if (S.hp < 1) S.hp = 1; B = null; coolT = performance.now() + 3500; H.hidden = true; q('.rb-r').classList.remove('on'); C.$('hud').hidden = false; C.setOn(false);
  }

  /* ---------- Bild für Bild: Kamera, Ausfallschritte, Figuren ---------- */
  function pose(a, dt) {
    let ox = 0, oz = 0, mv = 0;
    if (a.lg) { a.lg.t += dt; const k = Math.min(1, a.lg.t / a.lg.d); let e;
      if (a.lg.hold) { e = k < .32 ? k / .32 : k < .62 ? 1 : 1 - (k - .62) / .38; e = e * e * (3 - 2 * e); mv = k < .32 || k > .62 ? 1 : 0; } else e = Math.sin(k * Math.PI);
      ox = a.lg.dx * e; oz = a.lg.dz * e; if (k >= 1) a.lg = null; }
    let hy = 0; if (a.hop > 0) { a.hop -= dt; hy = Math.abs(Math.sin(a.hop * 6)) * .7; }
    a.root.position.set(a.base.x + ox, a.base.y + hy, a.base.z + oz); return mv;
  }
  function update(dt) {
    if (!B) return; B.t += dt; const t = B.t;
    /* Kamera: Einstellung je Aktion, sonst ruhige Totale hinter der Gruppe (Sieg: Fahrt um die Gruppe) */
    const o = { x: B.ox, y: gy(B.ox, B.oz), z: B.oz }; let p, l;
    if (B.vic) { const a = t * .5; p = P3(o, 4.8 + Math.cos(a) * .8, Math.sin(a) * 4, 1.9); l = { x: o.x, y: o.y + 1.1, z: o.z }; }
    else if (B.shot) { B.shot.t += dt; p = B.shot.p; l = B.shot.l; if (B.shot.t > B.shot.d + .4) B.shot = null; }
    else { const fc = center(live().length ? live() : B.foes), s = Math.sin(t * .25) * .8; p = P3(o, B.sea ? -8 : -7.6, 3.4 + s, B.sea ? 5.6 : 5.8); l = { x: (o.x + fc.x) / 2, y: o.y - (B.sea ? .6 : 1.4), z: (o.z + fc.z) / 2 }; }
    const k = 1 - Math.exp(-(B.shot ? 5.5 : 3) * dt); camera.position.x += (p.x - camera.position.x) * k; camera.position.y += (p.y - camera.position.y) * k; camera.position.z += (p.z - camera.position.z) * k;
    B.cl = B.cl || { x: l.x, y: l.y, z: l.z }; B.cl.x += (l.x - B.cl.x) * k; B.cl.y += (l.y - B.cl.y) * k; B.cl.z += (l.z - B.cl.z) * k;
    if (B.shk > 0) { B.shk -= dt; camera.position.x += rnd(-.18, .18); camera.position.y += rnd(-.12, .12); }
    camera.lookAt(B.cl.x, B.cl.y, B.cl.z);
    if (B.tgt && B.cur && !B.vic) { const a = partyA(B.cur), f = B.tgt; if (!B.tl) { const g = new C.T.BufferGeometry(); g.setFromPoints([new C.T.Vector3(), new C.T.Vector3()]); B.tl = new C.T.Line(g, new C.T.LineBasicMaterial({ color: 0xff5a5a, transparent: true, opacity: .9 })); B.tl.frustumCulled = false; scene.add(B.tl); }
      const ps = B.tl.geometry.attributes.position; ps.setXYZ(0, a.root.position.x, a.root.position.y + 1.5, a.root.position.z); ps.setXYZ(1, f.root.position.x, f.root.position.y + f.h * .5, f.root.position.z); ps.needsUpdate = true; B.tl.visible = true; } else if (B.tl) B.tl.visible = false;
    /* Gruppe */
    const fc = center(live().length ? live() : B.foes);
    if (B.ship) { pose(B.ship, dt); B.ship.root.rotation.y = Math.atan2(fc.x - B.ship.base.x, fc.z - B.ship.base.z); B.ship.root.position.y += Math.sin(t * 1.6) * .08; }
    for (const m of B.party) { const a = m.act; if (!a) continue; const mv = pose(a, dt);
      if (m.hp <= 0) { if (a.fox) { a.root.rotation.set(0, a.face, 1.4); a.root.position.y = a.base.y + .2; } continue; }
      a.face = Math.atan2(fc.x - a.root.position.x, fc.z - a.root.position.z); a.root.rotation.set(0, a.face, 0);
      if (a.atk >= 0) { a.atk += dt / .45; if (a.atk > 1) a.atk = -1; }
      if (a.fox) C.foxAnim(mv, a.atk); else if (a.kk) C.KK.walk(a.kk, mv); else if (a.P) C.animHuman(a.P, t, mv); }
    /* Gegner */
    for (const f of B.foes) { const r = f.root;
      if (f.dead) { f.dt += dt; r.position.y -= dt * (f.kk ? .3 : 1.6); r.scale.setScalar(f.sc * Math.max(.01, 1 - f.dt * .8)); if (f.dt > 1.3) r.visible = false; continue; }
      if (f.rise) { f.rise = Math.max(0, f.rise - dt * 1.2); }
      const mv = pose(f, dt), bob = f.d.hov || f.d.fly ? Math.sin(t * 2 + f.v) * .2 : B.sea ? Math.sin(t * 1.8 + f.v) * .15 : 0;
      r.position.y += bob - f.rise * 2.5; r.rotation.y = Math.atan2(B.ox - f.base.x, B.oz - f.base.z); r.rotation.z = B.sea ? Math.sin(t * 1.3 + f.v) * .06 : 0;
      if (f.charge > 0) f.charge -= dt; const pulse = (f.flash > 0 ? (f.flash -= dt, .12) : 0) + (f.charge > 0 ? Math.sin(f.charge * 20) * .06 : 0); r.scale.setScalar(f.sc * (1 + pulse));
      if (f.kk) C.KK.walk(f.kk, mv); else if (f.P.legs) { const s = Math.sin(t * (mv ? 14 : 3)) * (mv ? .7 : .08); f.P.legs.forEach((g, i) => { if (g) g.rotation.x = (i === 0 || i === 3 ? s : -s); }); if (f.P.tail) f.P.tail.rotation.y = Math.sin(t * 4) * .4; }
      if (f.P.sh) f.P.sh.forEach((m, i) => { const a = t * 1.6 + i * 6.283 / f.P.sh.length; m.position.set(Math.cos(a) * .75, Math.sin(t * 2 + i) * .15, Math.sin(a) * .75); }); }
  }
  return { start, update, pool, get on() { return !!B; }, get cool() { return performance.now() < coolT; } };
}
