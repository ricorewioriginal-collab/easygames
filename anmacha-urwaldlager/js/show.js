/* Urwaldlager – Staffel-Ablauf: Einzug, Zuschauerwahl, Prüfung, Camp, Abendessen, Auszug, Finale, Krönung, Buschtrommel */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, UI = UL.UI, A = UL.A, D = UL.D, esc = UL.esc;
  const Show = UL.Show = { S: null, abort: false };
  const VER = 3;

  // ---------- Hilfen ----------
  const alive = () => Show.S.campers.filter(c => !c.out);
  const me = () => Show.S.campers.find(c => c.id === 'me');
  const byId = id => Show.S.campers.find(c => c.id === id);
  const firstName = c => c.name.split(' ')[0];
  Show.alive = alive; Show.me = me; Show.byId = byId; Show.first = firstName;
  // Beliebtheit (simuliert, transparent): Sympathie 45 %, Unterhaltung 30 %, Leistung 25 %
  const pop = c => 0.45 * c.sym + 0.3 * c.ent + 0.25 * c.perf;
  Show.pop = pop;
  Show.log = (txt, icon = '📝') => { const S = Show.S; if (!S) return; S.log.unshift({ d: S.day, txt, icon }); if (S.log.length > 60) S.log.length = 60; };
  Show.change = (c, d) => {
    if (!c) return;
    for (const k of ['sym', 'ent', 'perf']) if (d[k]) c[k] = UL.clamp(c[k] + d[k], 0, 100);
  };
  Show.rel = (a, b, v) => { if (!a || !b || a === b) return; a.rel[b.id] = UL.clamp((a.rel[b.id] ?? 50) + v, 0, 100); b.rel[a.id] = UL.clamp((b.rel[a.id] ?? 50) + v * 0.7, 0, 100); };
  Show.form = c => c.form === 'w' ? D.TITLE.w : c.form === 'n' ? D.TITLE.n : D.TITLE.m;
  const exitDays = S => { const n = S.campers.length - 3; const out = []; for (let i = 0; i < n; i++) out.push(S.days - 1 - i); return out; };

  // ---------- Speichern / Laden ----------
  Show.save = () => { const S = Show.S; if (!S || S.over) return; try { UL.store.set('save', S.snap || S); } catch (e) { } };
  Show.snapshot = () => { const S = Show.S; S.snap = null; S.snap = JSON.parse(JSON.stringify(S)); Show.save(); };
  Show.peek = () => { const s = UL.store.get('save'); return s && s.v === VER && !s.over ? { day: s.day, days: s.days, theme: s.theme, name: s.campers.find(c => c.id === 'me').name } : null; };
  Show.continue = () => { const s = UL.store.get('save'); if (!s || s.v !== VER) return UL.Menus.title(); Show.S = s; Show.abort = false; Show.day(); };

  // ---------- Neue Staffel ----------
  Show.newSeason = ({ theme, len, diff, me: m }) => {
    const L = D.LENGTHS[len] || D.LENGTHS.normal;
    const npcs = UL.rng.shuffle(D.CAST).slice(0, L.campers - 1);
    const mk = (c, isMe) => ({
      id: isMe ? 'me' : c.id, name: c.name, job: c.job, form: c.form || 'n', look: c.look, t: c.t || { nett: 0.5, drama: 0.5, mut: 0.6, fleiss: 0.5, humor: 0.5 },
      quote: c.quote || '', sym: isMe ? 52 : 40 + (c.t.nett * 22) + UL.rand(-6, 6), ent: isMe ? 50 : 35 + (c.t.drama + c.t.humor) * 14 + UL.rand(-6, 6), perf: 50,
      trials: 0, starsWon: 0, out: false, outDay: 0, rel: {}, mood: 0.6
    });
    const meC = mk({ name: m.name || 'Du', job: m.job, form: m.form, look: m.look }, true);
    Show.S = {
      v: VER, theme, len, diff, days: L.days, day: 1, campers: [meC, ...npcs.map(c => mk(c))], log: [], used: {}, lastPick: '', pickedMe: 0, food: -1,
      lux: [], over: false, seed: Date.now() & 0xffff
    };
    // Geschichte der Staffel: ein Rivale (viel Drama) und ein Kumpel (sehr nett)
    const ns = Show.S.campers.slice(1);
    const rival = ns.slice().sort((a, b) => b.t.drama - a.t.drama)[0], buddy = ns.filter(c => c !== rival).sort((a, b) => b.t.nett - a.t.nett)[0];
    Show.S.rival = rival.id; Show.S.buddy = buddy.id;
    Show.rel(meC, rival, -15); Show.rel(meC, buddy, 15);
    Show.abort = false;
    Show.log(`Die Staffel beginnt: ${L.campers} Promis ziehen ins ${theme === 'studio' ? 'Studio-Camp' : 'Urwaldlager'}.`, '🌴');
    Show.snapshot();
    Show.day();
  };

  // ---------- Ein Tag ----------
  Show.day = async () => {
    const S = Show.S; Show.abort = false;
    S.snap = null; Show.snapshot();
    UI.closeAll(); UL.Tags.clear(); UI.cmd([]); UI.hud('');
    try {
      if (S.day >= S.days) { await Show.finale(); return; }
      if (S.day === 1) await Show.arrival(); else await Show.morning();
      if (Show.abort) return;
      await Show.trialPhase();
      if (Show.abort) return;
      await UL.Camp.run({ theme: S.theme, tod: 'day' });
      if (Show.abort) return;
      await Show.evening();
      if (Show.abort) return;
      if (exitDays(S).includes(S.day)) { const gone = await Show.exitNight(); if (Show.abort) return; if (gone === 'me') { await Show.endScreen(false); return; } }
      Show.simulateNight();
      S.day++;
      Show.day();
    } catch (e) { console.error(e); UI.alert('Hoppla', 'Da ist etwas schiefgelaufen. Der Spielstand vom Morgen ist gespeichert.').then(() => UL.Menus.title()); }
  };

  async function hostSet(tod, extra) {
    await UI.fade(true, 0.3);
    const st = new UL.HostSet(Show.S.theme, { tod, extra });
    R.set(st); UI.hud(''); UI.cmd([]); UI.hint({});
    UL.Audio.music(tod === 'night' ? 'night' : 'show'); UL.Audio.atmo(Show.S.theme === 'studio' ? 'studio' : tod === 'night' ? 'night' : 'jungle');
    await UI.fade(false, 0.4);
    return st;
  }
  Show.hostSet = hostSet;

  // Tag 1: Einzug
  Show.arrival = async () => {
    const S = Show.S, st = await hostSet('day');
    await UI.banner(D.SHOW.title, S.theme === 'studio' ? 'Die Promi-Show im Studio' : D.SHOW.sub, 2400);
    await st.mod(S.theme === 'studio' ? 'welcomeStudio' : 'welcome', { k: S.campers.length }, true);
    const cards = S.campers.map(c => `<div class="cast"><b>${esc(c.name)}</b><small>${esc(c.job || '')}${c.id === 'me' ? ' · <em>Du</em>' : ''}</small></div>`).join('');
    await UI.choose('Die Camper', `<div class="castgrid">${cards}</div>`, [{ label: 'Ab ins Lager!', icon: '🌴', value: 1 }], { wide: true });
    const rv = byId(S.rival), bd = byId(S.buddy);
    if (rv) await st.line('lotte', `Ein Auge solltet ihr auf ${rv.name} haben – ${firstName(rv)} sagt, was sie denkt. Und zwar über jeden. Besonders über ${firstName(me())}.`.replace(' sie ', rv.form === 'm' ? ' er ' : ' sie '));
    if (bd) await st.line('mats', `Und ${bd.name} hat schon angekündigt, sich um alle zu kümmern. Vielleicht findet ${firstName(me())} hier eine echte Freundschaft.`);
    await st.line('mats', 'Und weil wir gemein sind, geht es gleich mit der ersten Prüfung los.');
    S.forceMe = true;
  };

  // Morgen: Zuschauer wählen
  Show.morning = async () => {
    const S = Show.S, st = await hostSet('day');
    await UI.banner(`Tag ${S.day}`, `${alive().length} Camper im Lager`, 1600);
    await st.mod('morning', { d: S.day });
    // Was bisher geschah
    const y = S.log.filter(l => l.d === S.day - 1 && !/^Abendessen/.test(l.txt)).slice(0, 2).map(l => l.txt.replace(/\.$/, ''));
    if (y.length) await st.line('lotte', `Was gestern im Lager los war: ${y.join('. Und: ')}.`);
    const rv = byId(S.rival);
    if (rv && !rv.out && (me().rel[rv.id] ?? 50) < 35 && Math.random() < 0.5) await st.line('mats', `Die Zuschauer fragen sich: Wann knallt es endlich zwischen ${firstName(me())} und ${firstName(rv)}?`);
    await morningClips(st);
  };
  // Was gestern im Buschtelefon gesagt wurde – Mit-Camper (oft über dich) und dein eigener Satz
  async function morningClips(st) {
    const S = Show.S, m = me(), npcs = alive().filter(c => c.id !== 'me');
    if (!npcs.length || !UL.Phone) return;
    const rv = byId(S.rival), pickL = [];
    const who = UL.rng.shuffle(npcs).slice(0, 2);
    if (rv && !rv.out && !who.includes(rv) && Math.random() < 0.6) who[0] = rv;
    for (const c of who.slice(0, npcs.length > 3 ? 2 : 1)) {
      const r = c.rel.me ?? 50, aboutMe = Math.random() < 0.7, other = UL.pick(npcs.filter(o => o !== c)) || m;
      const kind = !aboutMe ? 'other' : r < 42 ? 'bad' : r > 62 ? 'good' : 'mid';
      const text = UL.pick(D.PHONE_NPC[kind]).replace(/\{m\}/g, firstName(m)).replace(/\{x\}/g, firstName(other));
      pickL.push({ c, text });
      if (kind === 'bad') { Show.change(m, { ent: 1 }); Show.change(c, { ent: 2 }); Show.log(`${firstName(c)} lästert im ${D.SHOW.phone} über ${firstName(m)}.`, '📞'); }
      else if (kind === 'good') Show.change(m, { sym: 1 });
    }
    const mine = (S.phoneSaid || []).find(p => p.d === S.day - 1);
    if (mine) pickL.push({ c: m, text: mine.txt });
    await st.line('lotte', UL.pick(['Und das lief gestern im ' + D.SHOW.phone + ' …', 'Ein Blick ins ' + D.SHOW.phone + ':', 'Was die Camper heimlich erzählen …']));
    await UL.Phone.clips({ theme: S.theme, list: pickL });
  }

  // Wer muss in die Prüfung?
  function pick() {
    const S = Show.S, list = alive();
    if (S.forceMe) { S.forceMe = false; return me(); }
    const m = me(), others = list.filter(c => c.id !== 'me');
    // Auffällige (Drama, Unterhaltung) und Unbeliebte werden öfter gewählt – der Spieler oft, aber nicht immer
    let pMe = 0.6 + (m.ent - 50) / 200 + (50 - m.sym) / 300 + (S.lastPick !== 'me' ? 0.22 : -0.12);
    pMe = UL.clamp(pMe, 0.4, 0.9);
    if (!others.length || UL.rng.chance(pMe)) return m;
    const w = others.map(c => Math.max(1, c.ent * 0.8 + (100 - c.sym) * 0.4 + UL.rand(0, 30) - (S.lastPick === c.id ? 25 : 0)));
    let r = UL.rand(0, w.reduce((a, b) => a + b, 0));
    for (let i = 0; i < others.length; i++) { r -= w[i]; if (r <= 0) return others[i]; }
    return others[0];
  }
  function nextTrial() {
    const S = Show.S;
    const ids = D.TRIALS.map(t => t.id).filter(id => id !== S.lastTrial);
    ids.sort((a, b) => (S.used[a] || 0) - (S.used[b] || 0) + UL.rand(-0.4, 0.4));
    return ids[0];
  }
  Show.trialPhase = async () => {
    const S = Show.S, st = R.stage, c = pick(), id = nextTrial(), def = D.TRIAL[id];
    S.used[id] = (S.used[id] || 0) + 1; S.lastTrial = id;
    const again = S.lastPick === c.id; S.lastPick = c.id;
    UL.Audio.sfx('drum');
    if (st.mod) await st.mod(again ? 'pickAgain' : 'pick', { n: c.id === 'me' ? c.name : c.name });
    c.trials++;
    if (c.id === 'me') {
      const r = await UL.Trials.run(id, { theme: S.theme, diff: S.diff, name: c.name, look: c.look, form: c.form, seed: S.seed + S.day * 31 });
      if (Show.abort) return;
      applyTrial(c, r, def);
    } else {
      const sim = simTrial(c, def);
      const how = UL.bot ? 'sim' : await UI.choose(def.icon + ' ' + def.name, `<p><b>${esc(c.name)}</b> muss in die Prüfung „${def.name}“. Willst du zusehen, wie ${firstName(c)} sich schlägt?</p>`, [
        { label: 'Zuschauen', icon: '📺', sub: 'Live dabei – überspringen geht jederzeit.', value: 'watch' }, { label: 'Nur Ergebnis', icon: '⏩', value: 'sim' }], { cls: 'clear' });
      if (how === 'watch') {
        const skill = UL.clamp(c.t.mut * 0.6 + c.t.fleiss * 0.3 + UL.rand(-0.1, 0.2) - (D.DIFF[S.diff].k - 1) * 0.2, 0.1, 0.95);
        const tm = def.time || 60;
        const r = await UL.Trials.run(id, { theme: S.theme, diff: S.diff, name: firstName(c), look: c.look, form: c.form, seed: S.seed + S.day * 31, ai: { skill, quitAt: sim.quit ? UL.rand(tm * 0.2, tm * 0.6) : 0 } });
        if (Show.abort) return;
        if (r.skip) { r.stars = Math.max(r.stars, sim.stars); r.quit = sim.quit && !r.stars; if (r.quit) r.stars = 0; }
        applyTrial(c, r, def);
        if (r.skip) await UI.choose(def.icon + ' ' + def.name, `<p><b>${esc(c.name)}</b> war in der Prüfung.</p><div class="stars">${'⭐'.repeat(r.stars)}<span class="off">${'⭐'.repeat(r.max - r.stars)}</span></div><p>${r.quit ? 'Abgebrochen.' : r.stars + ' Portionen fürs Camp.'}</p>`, [{ label: 'Ab ins Camp', icon: '🔥', value: 1 }]);
        return;
      }
      const r = sim;
      applyTrial(c, r, def);
      await st.line(UL.pick(['lotte', 'mats']), r.quit ? `${firstName(c)} hat bei „${def.name}“ den Satz gesagt: „${D.SHOW.exit}“ – keine Sterne.` : `${firstName(c)} holt bei „${def.name}“ ${r.stars} von ${r.max} Sternen.`);
      await UI.choose(def.icon + ' ' + def.name, `<p><b>${esc(c.name)}</b> war in der Prüfung.</p><div class="stars">${'⭐'.repeat(r.stars)}<span class="off">${'⭐'.repeat(r.max - r.stars)}</span></div><p>${r.quit ? 'Abgebrochen.' : r.stars + ' Portionen fürs Camp.'}</p>`, [{ label: 'Ab ins Camp', icon: '🔥', value: 1 }]);
    }
  };
  function simTrial(c, def) {
    const k = D.DIFF[Show.S.diff].k;
    const quit = UL.rng.chance(Math.max(0, 0.18 - c.t.mut * 0.2) * k);
    const q = UL.clamp(c.t.mut * 0.55 + c.t.fleiss * 0.2 + UL.rand(-0.15, 0.35) - (k - 1) * 0.25, 0, 1);
    return { stars: quit ? 0 : Math.round(def.stars * q), max: def.stars, quit };
  }
  function applyTrial(c, r, def) {
    const S = Show.S, q = r.max ? r.stars / r.max : 0;
    S.food = r.stars; S.foodMax = r.max; S.foodBy = c.id;
    c.starsWon += r.stars;
    c.perf = UL.clamp(c.perf * 0.6 + q * 100 * 0.4 + (r.quit ? -6 : 0), 0, 100);
    Show.change(c, { ent: r.quit ? 6 : 3 + q * 4, sym: r.quit ? -5 : q * 5 });
    Show.log(r.quit ? `${firstName(c)} bricht „${def.name}“ ab.` : `${firstName(c)}: ${r.stars}/${r.max} Sterne bei „${def.name}“.`, def.icon);
    alive().forEach(o => { if (o !== c) Show.rel(o, c, r.quit ? -3 : q * 4); });
  }

  // Abend: Essen am Lagerfeuer
  Show.evening = async () => {
    const S = Show.S, n = Math.max(0, S.food), max = S.foodMax || 1, q = n / max;
    const key = n === 0 ? 'none' : q < 0.6 ? 'few' : 'full';
    alive().forEach(c => { c.mood = UL.clamp(c.mood * 0.5 + q * 0.5, 0, 1); });
    const by = byId(S.foodBy);
    await UL.Camp.evening({ theme: S.theme, stars: n, max, text: D.MEALS[key], by: by ? firstName(by) : '' });
    Show.log(`Abendessen: ${n} Portionen. ${key === 'none' ? 'Reis und Bohnen.' : key === 'full' ? 'Festmahl!' : ''}`, '🍲');
  };

  // Nacht: wer muss gehen?
  Show.exitNight = async () => {
    const S = Show.S, list = alive();
    const scored = list.map(c => ({ c, p: pop(c) + UL.rand(-4, 4) })).sort((a, b) => b.p - a.p);
    const out = scored[scored.length - 1].c, last2 = scored[scored.length - 2].c;
    const res = await UL.Camp.exit({ theme: S.theme, safe: scored.slice(0, -2).map(x => x.c), last2, out });
    out.out = true; out.outDay = S.day;
    if (out.id === S.rival) Show.log(`Der große Rivale ${firstName(out)} ist raus!`, '🎭');
    Show.log(`${out.name} muss das Lager verlassen.`, '🚪');
    alive().forEach(c => { c.sym = UL.clamp(c.sym + ((out.rel[c.id] ?? 50) - 50) * 0.02, 0, 100); });
    return out.id;
  };

  // Nachts verändern sich die Camper ein wenig
  const NIGHT = [
    ['{a} und {b} geraten nachts wegen des Feuers aneinander.', -8, 3], ['{a} und {b} reden bis spät am Lagerfeuer.', 8, 1],
    ['{a} weint vor Heimweh, {b} tröstet.', 6, 2], ['{a} schnarcht so laut, dass {b} ins Freie umzieht.', -4, 3],
    ['{a} versteckt Kekse – {b} erwischt es dabei.', -6, 4], ['{a} und {b} schmieden heimlich Pläne fürs Finale.', 7, 2]];
  Show.simulateNight = () => {
    const S = Show.S, npcs = alive().filter(c => c.id !== 'me');
    if (npcs.length >= 2 && Math.random() < 0.7) {
      const [a, b] = UL.rng.shuffle(npcs), [txt, rel, ent] = UL.pick(NIGHT);
      Show.rel(a, b, rel); Show.change(a, { ent }); Show.change(b, { ent: ent / 2 });
      Show.log(txt.replace('{a}', firstName(a)).replace('{b}', firstName(b)), rel < 0 ? '💥' : '🌙');
    }
    const rv = byId(S.rival), m = me();
    if (rv && !rv.out && (rv.rel.me ?? 50) < 40 && Math.random() < 0.5) { Show.log(`${firstName(rv)} lästert hinter dem Rücken von ${firstName(m)}.`, '🐍'); Show.change(m, { sym: 1, ent: 1 }); }
    alive().forEach(c => {
      if (c.id === 'me') { c.ent = UL.clamp(c.ent - 2, 0, 100); return; }   // wer nichts macht, wird langweilig
      Show.change(c, { sym: (c.t.nett - 0.5) * 4 + UL.rand(-2, 2), ent: (c.t.drama + c.t.humor - 1) * 3 + UL.rand(-2, 2) - 1 });
    });
  };

  // ---------- Finale ----------
  Show.finale = async () => {
    const S = Show.S;
    let fin = alive().slice().sort((a, b) => pop(b) - pop(a));
    if (fin.length > 3) { fin.slice(3).forEach(c => { c.out = true; c.outDay = S.day; }); fin = fin.slice(0, 3); }
    if (!fin.includes(me())) { await Show.endScreen(false); return; }
    let st = await hostSet('day');
    await UI.banner('DAS FINALE', `Tag ${S.day} · ${fin.map(firstName).join(', ')}`, 2400);
    await st.mod('finalIntro', {}, true);
    { const m = me(), rv = byId(S.rival); await st.line('lotte', `${m.name}: ${m.trials} Prüfungen, ${m.starsWon} Sterne${rv ? (rv.out ? `, und ${firstName(rv)} ist schon lange raus` : `, und ausgerechnet ${firstName(rv)} steht mit im Finale`) : ''}. Was für eine Reise!`); }
    for (const f of D.FINAL) {
      const def = D.TRIAL[f.id];
      await st.line('lotte', `${f.course}: „${def.name}“!`);
      const r = await UL.Trials.run(f.id, { theme: S.theme, diff: S.diff, short: true, course: f.course, name: me().name, look: me().look, form: me().form, seed: S.seed + 999 + f.id.length });
      if (Show.abort) return;
      me().trials++; applyTrial(me(), r, def);
      fin.filter(c => c.id !== 'me').forEach(c => { const sr = simTrial(c, { stars: r.max, name: def.name }); applyTrial(c, sr, def); });
      st = await hostSet('day');
    }
    // Krönung
    const rank = fin.map(c => ({ c, p: pop(c) + UL.rand(-3, 3) })).sort((a, b) => b.p - a.p).map(x => x.c);
    st = await hostSet('night', s => {
      rank.forEach((c, i) => { const f = UL.makeFig(c.look); f.root.position.set((i - 1) * 1.6, s.theme === 'studio' ? 0 : 0.3, 0.6); f.root.rotation.y = 0; s.scene.add(f.root); s.figs.push(f); c._fig = f; });
    });
    st.cine.cut(new T.Vector3(0, 2.2, 6.5), new T.Vector3(0, 1.2, 0));
    await st.line('mats', 'Die Zuschauer haben abgestimmt. Hier ist das Ergebnis.');
    UL.Audio.sfx('tense'); await UI.banner('Platz 3', rank[2].name, 1800); await st.mod('third', { n: rank[2].name });
    UL.Audio.sfx('tense'); await UI.banner('Platz 2', rank[1].name, 1800); await st.mod('second', { n: rank[1].name });
    const w = rank[0];
    await st.line('mats', D.MOD.winner[0][1]);
    UL.Audio.sfx('drum'); await UL.sleep(UL.bot ? 0.1 : 1.2);
    // Krone aufsetzen
    const crowned = UL.makeFig(Object.assign({}, w.look, { hat: 'krone', hatColor: 0xffc000 }));
    crowned.root.position.copy(w._fig.root.position); st.scene.remove(w._fig.root); st.scene.add(crowned.root); st.figs.push(crowned); crowned.play('cheer');
    UL.Audio.sfx('fanfare'); UL.Audio.sfx('cheer');
    if (st.env && st.env.cheer !== undefined) st.env.cheer = 3;
    st.cine.move(crowned.root.position.clone().add(new T.Vector3(0, 1.6, 3)), crowned.root.position.clone().add(new T.Vector3(0, 1.2, 0)), 1.2);
    await UI.banner('👑 ' + Show.form(w), w.name, 2600);
    await st.line('lotte', UI.fmt(D.MOD.winner[1][1], { n: w.name }));
    S.place = rank.indexOf(me()) + 1;
    await Show.endScreen(w.id === 'me');
  };

  // ---------- Ende ----------
  Show.endScreen = async (won) => {
    const S = Show.S, m = me();
    const place = won ? 1 : S.place || (alive().length + 1);
    S.over = true; UL.store.set('save', null);
    const hof = UL.store.get('hof') || []; hof.unshift({ name: m.name, place, theme: S.theme, len: S.len, date: Date.now() }); UL.store.set('hof', hof.slice(0, 20));
    if (!won && m.out) { const st = await hostSet('night'); await st.line('lotte', `${m.name}, dein Abenteuer im Urwaldlager endet heute. Du warst großartig!`); }
    const html = `<div class="stars">${won ? '👑' : '🏅'}</div>
      <p><b>${esc(m.name)}</b> – ${won ? Show.form(m) + '!' : 'Platz ' + place + ' von ' + S.campers.length}</p>
      <div class="statrow"><span>⭐ ${m.starsWon} Sterne erspielt</span><span>🎯 ${m.trials} Prüfungen</span><span>❤️ Sympathie ${Math.round(m.sym)}</span><span>😂 Unterhaltung ${Math.round(m.ent)}</span></div>`;
    UL.Audio.music(won ? 'show' : 'night');
    await UI.choose(won ? 'Du hast gewonnen!' : 'Staffel vorbei', html, [{ label: 'Zum Titel', icon: '🏠', value: 1 }], { wide: true });
    Show.S = null;
    UL.Menus.title();
  };

  // ---------- Buschtrommel: Stimmung, Camper, Tagebuch ----------
  Show.drum = () => {
    const S = Show.S; if (!S) return;
    UL.paused = true;
    const list = S.campers.slice().sort((a, b) => (a.out - b.out) || pop(b) - pop(a));
    const bar = (v, c) => `<span class="bar"><i style="width:${Math.round(v)}%;background:${c}"></i></span>`;
    const rows = list.map((c, i) => `<div class="drum-row ${c.out ? 'out' : ''} ${c.id === 'me' ? 'me' : ''}"><b>${c.out ? '🚪' : i + 1 + '.'} ${esc(c.name)}</b>
      <small>${c.out ? 'raus an Tag ' + c.outDay : esc(c.job || '')}</small>
      <div class="drum-bars">❤️${bar(c.sym, '#ff5a7a')}😂${bar(c.ent, '#ffd23a')}⭐${bar(c.perf, '#5ad1ff')}</div></div>`).join('');
    const log = S.log.slice(0, 14).map(l => `<li>${l.icon} <small>Tag ${l.d}</small> ${esc(l.txt)}</li>`).join('');
    const p = UI.open(`<div class="box wide"><h2>🥁 Buschtrommel · Tag ${S.day}/${S.days}</h2>
      <p class="txt"><small>Simulierte Zuschauerstimmung: 45 % Sympathie, 30 % Unterhaltung, 25 % Prüfungsleistung.</small></p>
      <div class="drum">${rows}</div><h3>Tagebuch</h3><ul class="log">${log}</ul>
      <div class="row"><button class="btn" data-ok><b>Zurück</b></button></div></div>`, { onBack: () => go(), startCloses: true });
    const go = () => { UI.close(p); UL.paused = false; };
    p.el.querySelector('[data-ok]').onclick = go;
  };
})();
