/* Erweiterungen nach der Spezifikation (zotik-Repo): Bestiarium, Chronik mit Enthüllungen, Erfolge, Camp (Heilen, Kochen, Schmiede, Weltenradio),
   Schwierigkeitsgrade, Cheats, Block, Elementreaktionen und Timeline-Leiste. Zustand liegt in S (bst, ach, cnt, mat, sharp, dif, chx, rad). */

export const LVCAP = 100;
const MATS = { fell: ['🧶', 'Fell'], staub: ['✨', 'Rissstaub'], kern: ['💠', 'Kernsplitter'] };
const DIFFS = [
  ['Abenteurer', 'Gegner treffen schwächer.', .6, 1],
  ['Held', 'Das gedachte Spielgefühl.', 1, 1],
  ['Veteran', 'Gegner treffen härter, Belohnung +15 %.', 1.35, 1.15],
  ['Albtraum', 'Harte Treffer, Belohnung +30 %.', 1.8, 1.3],
  ['Legende', 'Kaum Fehler erlaubt, Belohnung +60 %.', 2.5, 1.6]
];
const RADIO = [
  ['Mondfunk', 'Sanfte Glocken über dunklen Akkorden.', [220, 261.63, 329.63, 392, 440, 523.25, 659.25, 783.99], 1900],
  ['Rissbeat', 'Dichter, helle Moll-Pentatonik.', [196, 233.08, 261.63, 311.13, 392, 466.16, 523.25, 622.25], 1100],
  ['Sternenglanz', 'Weite, langsame Töne.', [246.94, 293.66, 370, 440, 493.88, 587.33, 740, 880], 3000],
  ['Stille', 'Nur der Grundklang.', null, 0]
];
const REACT = { 'fire+nature': ['Aschebrand', 1, 0xff7a3a], 'light+nature': ['Sonnenblüte', .8, 0xffe27a], 'fire+light': ['Sternenglut', .9, 0xffd0a0] };
const CHEATS = [
  ['gold', '💎 Splitter +1000'], ['items', '🧪 Tränke und Äther auffüllen'], ['lvl', '⭐ Stufe +1'], ['heal', '❤️ Leben und Mana füllen'],
  ['god', '🛡️ Unverwundbar (an/aus)', 1], ['big', '🗿 Großer Kopf (an/aus)', 1], ['turbo', '💨 Turbo-Tempo (an/aus)', 1], ['prof', '🧠 Professor-Modus: 3× Schaden (an/aus)', 1]
];
const CHAP = [
  [1, 'Der Riss war kein Zufall', 'Die Kanten des Risses in Lunaris sind zu glatt. Etwas oder jemand hat sie gezogen. Zotik hört darin ein Muster.'],
  [2, 'Erinnerungen, die nie geschahen', 'Der Wald in Elaris erinnert sich an Dinge, die nie passiert sind. Erinnerungen werden über den Weltenkern gespeichert und wieder abgespielt.'],
  [3, 'Alte Stollen unter Valdoria', 'Harlans Karten zeigen Forschungsstollen unter der Stadt. Hier wurde einst am Weltenkern gearbeitet.'],
  [4, 'Der Sand als Archiv', 'Kharos hütete ein Bruchstück des Kerns. Der Sand von Solmera hat sich jede Stunde seit dem Großen Bruch gemerkt.'],
  [5, 'Lyras Familienname', 'Im Weltenarchiv von Aqualis steht ein Name, den Lyra kennt: der ihrer Familie. Ihre Eltern waren an der Weltenkernforschung beteiligt.'],
  [6, 'Frosthain vergisst nichts', 'Im ewigen Winter ist jede Spur eingefroren, auch die der Forscher, die den Kern teilen wollten.'],
  [7, 'Was Professorium vergessen wollte', 'Professor Professorium hat nach dem Großen Bruch Teile seiner eigenen Erinnerung gelöscht. Er war an der Stabilisierung des Kerns beteiligt.'],
  [8, 'Getrennte Weltversionen', 'Noctaris zeigt eine Welt, in der der Bruch nie geschah. Die Weltenrisse verbinden getrennte Versionen derselben Orte.'],
  [9, 'Die Welt über der Welt', 'Astralis ist eine zweite Fassung der Welt. Zotik kann beide Seiten wahrnehmen: die Welt, wie sie ist, und wie sie war.'],
  [10, 'Der Kern wurde bewusst geteilt', 'Veyra gesteht: Die Forscher teilten den Weltenkern absichtlich, um eine größere Katastrophe zu verhindern. Die Familien von Zotik und Lyra waren dabei.']
];

export function createExtra(C) {
  const { $, toast, banner, sfx, dnum, emit, fxRing } = C;
  const S = () => C.S();
  const ach = () => (S().ach || (S().ach = {}));
  const cnt = () => (S().cnt || (S().cnt = { brk: 0, pd: 0, rx: 0, cmb: 0, sharp: 0, rad: 0 }));
  const chx = () => (S().chx || (S().chx = {}));
  const dif = () => DIFFS[Math.min(DIFFS.length - 1, Math.max(0, S().dif ?? 1))];
  let blockHeld = false, tlT = 0, achT = 0, lastCh = 0;
  const kills = () => Object.values(S().bst || {}).reduce((a, b) => a + (b.n || 0), 0);
  const ACH = [
    ['k25', '🗡️ Jäger', 'Besiege 25 Gegner', () => kills() >= 25], ['k150', '⚔️ Schlächter', 'Besiege 150 Gegner', () => kills() >= 150], ['k600', '👑 Legende der Risse', 'Besiege 600 Gegner', () => kills() >= 600],
    ['l10', '⭐ Stufe 10', 'Erreiche Stufe 10', () => S().lvl >= 10], ['l30', '🌟 Stufe 30', 'Erreiche Stufe 30', () => S().lvl >= 30], ['l60', '✨ Stufe 60', 'Erreiche Stufe 60', () => S().lvl >= 60],
    ['brk', '⚡ Bruchmeister', 'Brich 20 Gegner', () => cnt().brk >= 20], ['pd', '💨 Reaktionskünstler', '15 perfekte Ausweicher', () => cnt().pd >= 15], ['cmb', '🔥 Kombo ×20', 'Erreiche eine Kombo von 20', () => cnt().cmb >= 20],
    ['rx', '🌪️ Elementarmagier', '10 Elementreaktionen auslösen', () => cnt().rx >= 10], ['sharp', '🔨 Schmied', 'Schärfe die Klinge fünfmal', () => (S().sharp || 0) >= 5],
    ['bst', '📖 Bestiarium', '10 Gegnerarten entdecken', () => Object.keys(S().bst || {}).length >= 10], ['rad', '📻 Funker', 'Wechsle den Sender im Weltenradio', () => cnt().rad >= 1],
    ['c5', '🌍 Weltenreisender', 'Schließe 5 Kapitel ab', () => CHAP.filter(c => C.chDone(c[0])).length >= 5],
    ['c10', '🌌 Weltenretter', 'Schließe alle 10 Kapitel ab', () => CHAP.every(c => C.chDone(c[0]))], ['end', '🎬 Schicksalswahl', 'Wähle ein Ende', () => !!S().ending]
  ];
  function unlock() {
    if (S().chx && S().chk) return;
    for (const a of ACH) if (!ach()[a[0]] && a[3]()) { ach()[a[0]] = 1; banner('Erfolg: ' + a[1], a[2]); sfx('level'); }
    for (const c of CHAP) if (c[0] > lastCh && C.chDone(c[0])) { lastCh = c[0]; if (!(S().rev || (S().rev = {}))[c[0]]) { S().rev[c[0]] = 1; toast('📖 Chronik: ' + c[1]); } }
  }
  const tl = document.createElement('div'); tl.id = 'tl'; tl.hidden = true; $('hud').appendChild(tl);
  function timeline(dt) {
    tlT -= dt; if (tlT > 0) return; tlT = .25;
    const l = [];
    for (const e of C.E) if (!e.dead && !e.dummy && e.awake !== false && e.st !== 'idle' && Math.hypot(e.x - C.pl.x, e.z - C.pl.z) < 26) l.push([e.st === 'wind' ? 0 : Math.max(0, e.cd), e]);
    l.sort((a, b) => a[0] - b[0]);
    if (!l.length || C.menuOpen()) { tl.hidden = true; return; }
    tl.hidden = false;
    tl.innerHTML = l.slice(0, 4).map(([t, e], i) => `<i class="${t <= .01 ? 'now' : ''}" style="--c:#${(e.d.col || 0xff6a7a).toString(16).padStart(6, '0')}"><b>${e.boss ? '👑' : e.d.ranged ? '✦' : '▲'}</b><small>${t <= .01 ? '!' : t.toFixed(1)}</small></i>`).join('');
  }
  return {
    LVCAP,
    kill(e) {
      const b = S().bst || (S().bst = {}), n = e.d.name || e.k, r = b[n] || (b[n] = { n: 0, hp: e.max, dmg: e.d.dmg, w: C.weakOf(e), boss: !!e.boss });
      r.n++; if (r.n === 1) toast('📖 Bestiarium: ' + n);
      const m = S().mat || (S().mat = {}), g = (k, c) => { if (Math.random() < c) m[k] = (m[k] || 0) + 1 };
      g('fell', e.boss ? 1 : .35); g('staub', e.boss ? 1 : .22); g('kern', e.boss ? 1 : .05); if (e.boss) m.kern = (m.kern || 0) + 1;
    },
    rew: () => dif()[3],
    god: () => !!chx().god,
    spd: () => (chx().turbo ? 1.5 : 1) * (blockHeld ? .55 : 1),
    atk: () => (1 + .04 * (S().sharp || 0)) * (chx().prof ? 3 : 1),
    setBlock(on) { blockHeld = on; },
    blocking: () => blockHeld && S().mp >= 2,
    dmgIn(d) {
      d *= dif()[2];
      if (blockHeld && S().mp >= 2) { S().mp = Math.max(0, S().mp - 2); d *= .3; dnum(C.pl.x, C.pl.y + 2.8, C.pl.z, 'Block', 'b'); sfx('ui'); }
      return Math.max(1, Math.round(d));
    },
    count(k, v) { const c = cnt(); if (k === 'cmb') c.cmb = Math.max(c.cmb, v); else c[k] = (c[k] || 0) + 1; },
    reaction(e, el, dmg) {
      if (!el || e.dead) return;
      const now = performance.now() / 1000, rift = C.formOn();
      let key = null;
      if (e.xel && e.xel[0] !== el && now - e.xel[1] < 3) key = [e.xel[0], el].sort().join('+');
      e.xel = [el, now];
      let r = REACT[key];
      if (!r && rift) r = ['Rissreaktion', 1.1, 0xb070ff];
      if (!r) return;
      e.xel = null; this.count('rx');
      dnum(e.x, e.m.root.position.y + 2.6 * e.d.sc, e.z, r[0] + '!', 'b'); sfx('skill2'); fxRing(e.x, e.z, r[2], 5, .6);
      emit(e.x, e.m.root.position.y + 1, e.z, r[2], 30, 6, .8, .8, 1, 2);
      for (const o of C.E) if (o !== e && !o.dead && !o.dummy && Math.hypot(o.x - e.x, o.z - e.z) < 5) C.hurtE(o, dmg * r[1], 0, 0, false);
      C.hurtE(e, dmg * r[1] * .6, 0, 0, false);
    },
    tick(dt) {
      timeline(dt);
      achT -= dt; if (achT <= 0) { achT = 2; unlock(); }
      const h = C.fox().head; if (h) h.scale.setScalar(chx().big ? 1.9 : 1);
    },
    note: () => { const r = RADIO[S().rad || 0]; return r; },
    radioScale: () => RADIO[S().rad || 0],
    safe: () => !C.E.some(e => !e.dead && !e.dummy && e.st !== 'idle' && Math.hypot(e.x - C.pl.x, e.z - C.pl.z) < 22),
    chronHTML() {
      const B = S().bst || {}, names = Object.keys(B);
      let h = '<h3>📖 Enthüllungen</h3>';
      const got = CHAP.filter(c => C.chDone(c[0]));
      h += got.length ? got.map(c => `<div class="row"><span><b>${c[1]}</b><br><small style="color:var(--dim)">${c[2]}</small></span></div>`).join('') : '<p style="color:var(--dim);font-size:13px">Schließe Kapitel ab, um die Wahrheit über den Großen Bruch zu erfahren.</p>';
      const pm = S().party || [];
      h += '<h3>🤝 Weggefährten</h3>' + (pm.length ? pm.map(n => `<div class="row"><span>${n}</span><span>reist mit dir</span></div>`).join('') : '<p style="color:var(--dim);font-size:13px">Noch reist niemand mit dir. Wichtige Begegnungen werden hier als Erinnerungen festgehalten.</p>');
      h += `<h3>🐾 Bestiarium (${names.length})</h3>`;
      h += names.length ? names.sort().map(n => { const r = B[n], w = r.w && C.EL[r.w] ? C.EL[r.w][0] + ' ' + C.EL[r.w][1] : '–'; return `<div class="row"><span>${r.boss ? '👑 ' : ''}${n}<br><small style="color:var(--dim)">Leben ${r.hp} · Schaden ${r.dmg} · Schwäche ${w}</small></span><span>×${r.n}</span></div>`; }).join('') : '<p style="color:var(--dim);font-size:13px">Besiege Gegner, um sie ins Bestiarium einzutragen.</p>';
      const a = ach(), nA = ACH.filter(x => a[x[0]]).length;
      h += `<h3>🏆 Erfolge (${nA}/${ACH.length})${S().chk ? ' · Cheats benutzt' : ''}</h3>` + ACH.map(x => `<div class="row"><span>${a[x[0]] ? '✅' : '▫️'} ${x[1]}<br><small style="color:var(--dim)">${x[2]}</small></span></div>`).join('');
      return h;
    },
    campHTML() {
      const s = S(), m = s.mat || {}, ok = this.safe();
      let h = '<h3>⛺ Weltenanker-Camp</h3><p style="color:var(--dim);font-size:13px">' + (ok ? 'Hier ist es ruhig. Du kannst rasten, kochen, schmieden und das Radio hören.' : 'Gegner in der Nähe. Entferne dich, bevor du das Camp nutzt.') + '</p>';
      h += `<div class="row"><span>🛏️ Rasten</span><span><button class="cpb" data-x="rest" ${ok ? '' : 'disabled'}>Leben und Mana füllen</button></span></div>`;
      h += `<div class="row"><span>🍲 Kräutersuppe (2 Kräuter)</span><span><button class="cpb" data-x="cook" ${ok && s.herbs >= 2 ? '' : 'disabled'}>Kochen +50 % Leben</button></span></div>`;
      h += '<h3>🔨 Schmiede</h3><div class="row"><span>Materialien</span><span>' + Object.keys(MATS).map(k => MATS[k][0] + ' ' + (m[k] || 0)).join(' · ') + '</span></div>';
      const sh = s.sharp || 0, cost = 60 * (sh + 1);
      h += `<div class="row"><span>⚔️ Klinge schärfen (${sh}/10, +4 % Angriff)<br><small style="color:var(--dim)">${cost} Splitter, ${2 + sh} Rissstaub</small></span><span><button class="cpb" data-x="sharp" ${ok && sh < 10 && s.shards >= cost && (m.staub || 0) >= 2 + sh ? '' : 'disabled'}>Schärfen</button></span></div>`;
      h += `<div class="row"><span>🧪 Heiltrank<br><small style="color:var(--dim)">3 Kräuter, 1 Fell</small></span><span><button class="cpb" data-x="potion" ${ok && s.herbs >= 3 && (m.fell || 0) >= 1 ? '' : 'disabled'}>Brauen</button></span></div>`;
      h += `<div class="row"><span>🔷 Äther<br><small style="color:var(--dim)">1 Kernsplitter, 2 Rissstaub</small></span><span><button class="cpb" data-x="ether" ${ok && (m.kern || 0) >= 1 && (m.staub || 0) >= 2 ? '' : 'disabled'}>Mischen</button></span></div>`;
      h += '<h3>📻 Weltenradio</h3>' + RADIO.map((r, i) => `<div class="row"><span>${(s.rad || 0) === i ? '▶️' : '▫️'} ${r[0]}<br><small style="color:var(--dim)">${r[1]}</small></span><span><button class="cpb" data-x="radio${i}">Hören</button></span></div>`).join('');
      const d = dif();
      h += `<h3>🎚️ Schwierigkeit: ${d[0]}</h3><p style="color:var(--dim);font-size:13px">${d[1]}</p><div class="row"><span>${DIFFS.map((x, i) => `<button class="cpb" data-x="dif${i}">${(s.dif ?? 1) === i ? '● ' : ''}${x[0]}</button>`).join(' ')}</span></div>`;
      h += `<h3>🧪 Cheats${s.chk ? ' (benutzt, keine neuen Erfolge)' : ''}</h3><p style="color:var(--dim);font-size:13px">Nur zum Ausprobieren. Sobald du einen Cheat benutzt, werden keine neuen Erfolge mehr vergeben.</p>`;
      h += CHEATS.map(c => `<div class="row"><span>${c[1]}</span><span><button class="cpb" data-x="ch_${c[0]}">${c[2] ? (chx()[c[0]] ? 'aus' : 'an') : 'Los'}</button></span></div>`).join('');
      return h;
    },
    bind(c, rerender) {
      c.querySelectorAll('[data-x]').forEach(b => b.onclick = () => {
        const k = b.dataset.x, s = S(), m = s.mat || (s.mat = {});
        if (k === 'rest') { s.hp = C.maxHp(); s.mp = C.maxMp(); toast('🛏️ Ausgeruht'); sfx('heal'); }
        else if (k === 'cook' && s.herbs >= 2) { s.herbs -= 2; s.hp = Math.min(C.maxHp(), s.hp + C.maxHp() * .5); toast('🍲 Kräutersuppe: +50 % Leben'); sfx('heal'); }
        else if (k === 'sharp') { const sh = s.sharp || 0, cost = 60 * (sh + 1); if (s.shards >= cost && (m.staub || 0) >= 2 + sh && sh < 10) { s.shards -= cost; m.staub -= 2 + sh; s.sharp = sh + 1; cnt().sharp++; toast('🔨 Klinge geschärft: Stufe ' + s.sharp); sfx('level'); } }
        else if (k === 'potion' && s.herbs >= 3 && (m.fell || 0) >= 1) { s.herbs -= 3; m.fell--; s.potions++; toast('🧪 Heiltrank gebraut'); sfx('pick'); }
        else if (k === 'ether' && (m.kern || 0) >= 1 && (m.staub || 0) >= 2) { m.kern--; m.staub -= 2; s.items.ether = (s.items.ether || 0) + 1; toast('🔷 Äther gemischt'); sfx('pick'); }
        else if (k.startsWith('radio')) { s.rad = +k.slice(5); cnt().rad++; C.radioChanged(); toast('📻 ' + RADIO[s.rad][0]); sfx('ui'); }
        else if (k.startsWith('dif')) { s.dif = +k.slice(3); toast('🎚️ ' + DIFFS[s.dif][0]); sfx('ui'); }
        else if (k.startsWith('ch_')) {
          const n = k.slice(3), o = chx(); s.chk = 1;
          if (n === 'gold') s.shards += 1000; else if (n === 'items') { s.potions = Math.max(s.potions, 9); s.items.ether = Math.max(s.items.ether || 0, 5); }
          else if (n === 'lvl') { if (s.lvl < LVCAP) { s.lvl++; s.xp = 0; s.hp = C.maxHp(); s.mp = C.maxMp(); } }
          else if (n === 'heal') { s.hp = C.maxHp(); s.mp = C.maxMp(); }
          else o[n] = !o[n];
          sfx('ui');
        }
        C.saveGame(true); rerender();
      });
    }
  };
}
