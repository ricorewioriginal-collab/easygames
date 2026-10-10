/* Urwaldlager – Spielablauf: Camp, Hörervoting, Prüfungen, Rauswahl, Finale */
(function () {
  'use strict';
  const D = JD, A = Avatar, Snd = USnd, $ = id => document.getElementById(id), view = $('view'), hud = $('hud');
  const rnd = (a, b) => a + Math.random() * (b - a), ri = (a, b) => Math.floor(rnd(a, b + 1)), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), pick = a => a[ri(0, a.length - 1)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const nm = c => c.short || (c.name.startsWith('Dr.') ? c.name.split(' ')[1] : c.name.split(' ')[0]);
  const store = { get() { try { return JSON.parse(localStorage.getItem('ul_best')) || {}; } catch (e) { return {}; } }, set(v) { try { localStorage.setItem('ul_best', JSON.stringify(v)); } catch (e) { } } };
  const HOSTAV = [{ skin: '#f0c9a8', hair: '#ff8a3d', hs: 'long', top: '#ff5fa2', acc: ['ring'] }, { skin: '#d9a47a', hair: '#1b1b1b', hs: 'short', top: '#37d6a0', acc: ['glasses', 'beard'] }];
  let G = null, RUN = null, SU = { name: '', skin: 1, hair: 1, hs: 0, top: 1, type: 0, len: 'normal' }, tmr = [];

  const later = (fn, ms) => { const t = setTimeout(fn, ms); tmr.push(t); return t; };
  function clearTimers() { tmr.forEach(clearTimeout); tmr = []; }
  function stopRun() { if (RUN) { RUN.stop(); RUN = null; } }
  function show(html, cls) { clearTimers(); view.className = cls || ''; view.innerHTML = html; view.scrollTop = 0; renderHud(); }
  const av = (c, mood, extra) => `<div class="avw ${c.id === 'you' ? 'you' : ''} ${extra || ''}">${A.svg(c, mood)}</div>`;
  const host = (txt, i, mood) => { i = i == null ? ri(0, 1) : i; return `<div class="host"><div class="avw">${A.svg(HOSTAV[i], mood || 'happy')}</div><div class="bubble"><small class="h">${D.HOSTS[i].n}</small><br>${txt}</div></div>`; };
  const alive = () => G.cast.filter(c => !c.out), others = () => alive().filter(c => c.id !== 'you');
  const sym = (c, d) => { c.sym = clamp(c.sym + d, 3, 98); };
  const fmtN = n => n.toLocaleString('de-DE');
  const chipsHtml = out => out.length ? `<div class="chips">${out.map(([l, v]) => `<span class="dl ${v > 0 ? 'up' : 'dn'}">${l} ${v > 0 ? '+' : ''}${v}</span>`).join('')}</div>` : '';
  const animateBars = () => requestAnimationFrame(() => requestAnimationFrame(() => view.querySelectorAll('.bar i[data-w]').forEach(i => { i.style.width = i.dataset.w + '%'; })));
  const percents = list => { const t = list.reduce((a, b) => a + b, 0) || 1, p = list.map(v => Math.floor(v / t * 100)); let rest = 100 - p.reduce((a, b) => a + b, 0); const ord = list.map((v, i) => i).sort((a, b) => list[b] - list[a]); for (let k = 0; rest > 0; k++, rest--) p[ord[k % ord.length]]++; return p; };

  // ---------- Kopfzeile ----------
  function renderHud() {
    if (!G) { hud.hidden = true; return; } hud.hidden = false; const y = G.you;
    hud.innerHTML = `<div class="chip">📅 Tag ${G.day}<small>/ ${G.days}</small></div><div class="chip">👥 ${alive().length}<small>im Camp</small></div><div class="chip" title="Vorrat – Sterne füllen ihn auf">🍚<div class="mini"><i style="width:${G.food}%;background:#ffcf4a"></i></div></div><div class="chip" title="Energie">⚡<div class="mini"><i style="width:${G.energy}%;background:#37d6e8"></i></div></div><div class="chip" title="Beliebtheit bei den Hörern">❤️ ${Math.round(y.sym)}%</div><div style="flex:1"></div><button class="chip" data-h="snd">${Snd.isOn() ? '🔊' : '🔇'}</button><button class="chip" data-h="menu">☰</button>`;
  }
  hud.addEventListener('click', e => { const b = e.target.closest('[data-h]'); if (!b) return; Snd.unlock(); if (b.dataset.h === 'snd') { Snd.toggle(); renderHud(); } else if (confirm('Zurück zum Titel? Der Spielstand dieser Runde geht verloren.')) { stopRun(); title(); } });

  // ---------- Titel / Regeln / Üben ----------
  function title() {
    stopRun(); G = null; const b = store.get();
    show(`<div class="fade"><div class="logo">URWALD<span>LAGER</span></div><div class="tagline">Die große Wildnis-Show · präsentiert von AnMaCha</div>
    <div class="card cen"><p>Zwölf Promis, ein Camp mitten im Dschungel, <b>Reis und Bohnen</b> – und ihr Hörer entscheidet, <b>wer zur Prüfung muss</b>. Bestehe Ekel-, Mut- und Kopf-Prüfungen, verdiene Sterne für das Abendessen und werde <b>Urwald-Champion</b>!</p>
    <div class="row c" style="margin-top:12px"><button class="btn go big" data-a="new">▶ Neues Abenteuer</button><button class="btn gold" data-a="practice">🎯 Prüfungen üben</button><button class="btn" data-a="how">❓ Spielregeln</button></div>
    <p class="h" style="margin-top:12px">${b.plays ? `Bisher: ${b.plays} Runde${b.plays > 1 ? 'n' : ''} · ${b.wins || 0}× Urwald-Champion · beste Platzierung: ${b.best}. · ${fmtN(b.stars || 0)} Sterne` : 'Ein Spiel für Browser und Handy – kein Download, alles gezeichnet und im Browser erzeugt.'}</p>
    <div class="row c"><a class="btn" href="../" style="text-decoration:none">← Alle Spiele</a><button class="btn" data-a="snd">${Snd.isOn() ? '🔊 Ton an' : '🔇 Ton aus'}</button></div></div></div>`, 'center');
  }
  function how() {
    show(`<div class="card fade"><h2>❓ So funktioniert's</h2><p><b>Das Camp:</b> Jeden Tag erlebst du zwei Ereignisse im Lager und wählst eine Freizeit-Aktion. Entscheidungen verändern deine <b>Beliebtheit bei den Hörern</b> ❤️, deine <b>Energie</b> ⚡ und den <b>Vorrat</b> 🍚. Wer gut mit anderen auskommt, bekommt Verbündete – wer Streit sät, bekommt Rivalen.</p>
    <p><b>Hörer-Voting:</b> Die Hörer wählen, wer zur Prüfung muss. Beliebte Camper trifft es öfter – die Hörer wollen sie leiden sehen! Du kannst dich auch <b>freiwillig melden</b>.</p>
    <p><b>Prüfungen:</b> Fünf Minispiele – <i>Krabbelkiste</i> (Ekel), <i>Wackelbrücke</i> (Mut), <i>Schleimbecken</i> (Mut), <i>Tierstimmen-Echo</i> (Kopf), <i>Delikatessen-Dinner</i> (Ekel). Jeder Stern ist eine Mahlzeit fürs Camp und macht dich beliebter. Niedrige Energie macht die Prüfungen schwerer.</p>
    <p><b>Rauswahl:</b> Nach jeder Prüfung (ab Tag 2) wählen die Hörer, wer das Camp verlassen muss – meist die unbeliebteste Person. Die letzten Drei erreichen das <b>Finale</b>: drei Kurz-Prüfungen und das große Hörervotum.</p>
    <p class="h">Steuerung: Maus/Touch. Brücke: ←/→ oder A/D (oder linke/rechte Bildschirmhälfte). Schleim: halten zum Tauchen, Zeiger zum Schwimmen. Echo: Pads antippen oder 1–4. Dinner: Tippen/Leertaste.</p>
    <div class="row c"><button class="btn go" data-a="title">Verstanden</button></div></div>`);
  }
  function practice() {
    show(`<div class="card fade"><h2>🎯 Prüfungen üben</h2><p class="h">Spiele jede Prüfung einzeln – ohne Einfluss auf ein Spiel.</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${D.TRIALS.map(t => `<div class="card tc" data-a="ptrial" data-id="${t.id}"><span class="kind ${t.kind}" style="align-self:flex-start">${t.kind.toUpperCase()}</span><b>${t.e} ${t.name}</b><small>${t.how}</small></div>`).join('')}</div><div class="row c" style="margin-top:12px"><button class="btn" data-a="title">← Zurück</button></div></div>`);
  }

  // ---------- Neues Spiel ----------
  const look = () => ({ id: 'you', skin: D.SKINS[SU.skin], hair: D.HAIRS[SU.hair], hs: D.HSTYLES[SU.hs][0], top: D.TOPS[SU.top], acc: [] });
  function setup() {
    const sw = (arr, k) => arr.map((c, i) => `<div class="sw ${SU[k] === i ? 'on' : ''}" style="background:${c}" data-a="sw" data-k="${k}" data-i="${i}"></div>`).join('');
    show(`<div class="card fade"><h2>🌴 Wer wagt sich in den Dschungel?</h2>
    <div class="row" style="align-items:flex-start;flex-wrap:nowrap"><div style="width:110px;flex:none"><div class="avw you" id="pv">${A.svg(look(), 'happy')}</div></div><div style="flex:1;min-width:0"><input class="fld" id="nm" maxlength="14" placeholder="Dein Name" value="${esc(SU.name)}" autocomplete="off"><h3>Haut</h3><div class="row">${sw(D.SKINS, 'skin')}</div></div></div>
    <h3 style="margin-top:8px">Haare</h3><div class="row">${sw(D.HAIRS, 'hair')}</div><div class="seg" style="margin-top:6px">${D.HSTYLES.map((h, i) => `<button class="btn ${SU.hs === i ? 'on' : ''}" data-a="sw" data-k="hs" data-i="${i}">${h[1]}</button>`).join('')}</div>
    <h3 style="margin-top:8px">Oberteil</h3><div class="row">${sw(D.TOPS, 'top')}</div>
    <h3 style="margin-top:12px">Dein Typ</h3><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${D.TYPES.map((t, i) => `<div class="card tc ${SU.type === i ? 'on' : ''}" data-a="sw" data-k="type" data-i="${i}"><b>${t.e} ${t.name}</b><small>${t.desc}</small></div>`).join('')}</div>
    <h3 style="margin-top:12px">Länge</h3><div class="seg">${[['kurz', 'Kurz · 8 Camper · 7 Tage'], ['normal', 'Normal · 10 Camper · 9 Tage'], ['lang', 'Lang · 12 Camper · 11 Tage']].map(l => `<button class="btn ${SU.len === l[0] ? 'on' : ''}" data-a="sw" data-k="len" data-i="${l[0]}">${l[1]}</button>`).join('')}</div>
    <div class="row c" style="margin-top:14px"><button class="btn" data-a="title">← Zurück</button><button class="btn go big" data-a="start">Ab in den Dschungel!</button></div></div>`);
    $('nm').addEventListener('input', e => { SU.name = e.target.value; });
  }
  function newGame() {
    const n = { kurz: 8, normal: 10, lang: 12 }[SU.len], t = D.TYPES[SU.type], nameClean = (SU.name || '').replace(/[<>&"]/g, '').trim().slice(0, 14) || 'Abenteurer';
    const bias = { diva: -2, clown: 2, kumpel: 2, tough: 0, sensibel: 1, stratege: 0 };
    const pool = shuffle(D.CAST.slice()).slice(0, n - 1).map(c => Object.assign({}, c, { sym: clamp(50 + rnd(-10, 10) + (bias[c.trait] || 0), 25, 75), bond: 0, out: false, stars: 0, trials: 0, last: 0 }));
    const you = Object.assign(look(), { name: nameClean, short: nameClean, job: t.name, age: 30, mut: t.mut, ekel: t.ekel, kopf: t.kopf, trait: 'you', sym: t.sym, bond: 0, out: false, stars: 0, trials: 0, last: 0 });
    G = { n, days: n - 1, day: 1, cast: [you].concat(pool), you, food: 60, energy: 80, usedEv: [], lastTrial: null, stars: 0, trials: 0, volunteer: false, outOrder: [], today: null, bestSym: you.sym, final: null, over: false };
    Snd.ambience();
    show(`<div class="fade">${host(`Willkommen im <b>Urwaldlager</b>! Heute ziehen ${n} Camper ein – ${D.QUIPS.intro[0]}`, 0)}<div class="card" style="margin-top:10px"><h3>Eure Camper</h3><div class="grid">${G.cast.map(c => `<div class="card cc">${av(c, 'happy')}<b>${esc(c.name)}</b><small>${esc(c.job)}${c.id === 'you' ? ' (du)' : ', ' + c.age}</small></div>`).join('')}</div><p class="h">Du spielst <b>${esc(nameClean)}</b>. Überlebe ${G.days} Tage, werde beliebt – und bleib bis zum Finale!</p><div class="row c"><button class="btn go big" data-a="day">Lager betreten ▶</button></div></div></div>`);
  }

  // ---------- Tagesablauf ----------
  function startDay() {
    G.energy = clamp(G.energy + 8, 0, 100); if (G.day > 1) G.food = clamp(G.food - 14, 0, 100); G.volunteer = false; const msgs = [];
    if (G.day > 1) others().forEach(c => { const bias = { diva: -.5, clown: .5, kumpel: .4 }[c.trait] || 0; sym(c, (50 - c.sym) * .06 + rnd(-3, 3) + bias); });
    if (G.food <= 0) { sym(G.you, -2); G.energy = clamp(G.energy - 10, 0, 100); msgs.push('🍚 Der Vorrat ist leer – das Camp hungert! (−2 Beliebtheit, −10 Energie)'); } else if (G.food < 25) msgs.push('🍚 Der Vorrat wird knapp – Sterne aus den Prüfungen füllen ihn wieder auf.');
    others().forEach(c => { if (msgs.length > 3) return; if (c.bond >= 70) { sym(G.you, 2); msgs.push(`🤝 ${nm(c)} setzt sich im Interview für dich ein (+2 Beliebtheit).`); } else if (c.bond <= -35) { sym(G.you, -2); msgs.push(`😒 ${nm(c)} lästert im Tagebuch über dich (−2 Beliebtheit).`); } });
    let pool = D.EVENTS.map((e, i) => i).filter(i => !G.usedEv.includes(i)); if (pool.length < 2) { G.usedEv = []; pool = D.EVENTS.map((e, i) => i); }
    const evs = shuffle(pool).slice(0, 2); G.usedEv.push(...evs);
    G.today = { evs, i: 0, msgs, picks: evs.map(() => { const o = shuffle(others()); return { A: o[0], B: o[1] || o[0] }; }) }; G.bestSym = Math.max(G.bestSym, G.you.sym);
    morning();
  }
  function castGrid(sel) {
    return `<div class="grid">${G.cast.map(c => { const tag = c.id === 'you' ? '' : c.bond >= 70 ? '<span class="tag ally">Verbündet</span>' : c.bond <= -35 ? '<span class="tag riv">Rivale</span>' : ''; return `<div class="card cc ${c.out ? 'out' : ''} ${sel === c.id ? 'sel' : ''}">${tag}${av(c, c.out ? 'sad' : 'n')}<b>${esc(nm(c))}</b><div class="bar"><i style="width:${Math.round(c.sym)}%"></i></div><small>${c.out ? 'ausgeschieden' : Math.round(c.sym) + '% beliebt'}</small></div>`; }).join('')}</div>`;
  }
  function morning() {
    const fin = G.day === G.days, t = G.today;
    show(`<div class="fade">${host(fin ? 'Heute ist <b>Finaltag</b>! Nur noch drei Camper stehen im Dschungel – wer wird Urwald-Champion?' : pick(D.QUIPS.intro), null, 'happy')}<div class="card" style="margin-top:10px"><h2>☀️ Tag ${G.day} von ${G.days}</h2>${castGrid()}${t.msgs.length ? `<div style="margin-top:8px">${t.msgs.map(m => `<p>${m}</p>`).join('')}</div>` : ''}<div class="row c" style="margin-top:10px"><button class="btn go" data-a="event">Was passiert heute im Lager? ▶</button></div></div></div>`);
  }
  function event() {
    const t = G.today, e = D.EVENTS[t.evs[t.i]], p = t.picks[t.i], tx = s => esc(s).replace(/\{A\}/g, `<b>${esc(nm(p.A))}</b>`).replace(/\{B\}/g, `<b>${esc(nm(p.B))}</b>`);
    show(`<div class="card fade"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:76px;flex:none">${av(p.A, 'n')}</div><div><h3>Lagerleben (${t.i + 1}/2)</h3><p class="big">${tx(e.t)}</p></div></div><div class="grid" style="grid-template-columns:1fr;margin-top:8px">${e.ch.map((c, i) => `<button class="btn" data-a="choice" data-i="${i}" style="text-align:left">${tx(c.l)}</button>`).join('')}</div></div>`);
  }
  function choose(i) {
    const t = G.today, e = D.EVENTS[t.evs[t.i]], p = t.picks[t.i], ch = e.ch[i], tx = s => esc(s).replace(/\{A\}/g, `<b>${esc(nm(p.A))}</b>`).replace(/\{B\}/g, `<b>${esc(nm(p.B))}</b>`);
    const out = []; if (ch.sym) { sym(G.you, ch.sym); out.push(['Beliebtheit', ch.sym]); } if (ch.en) { G.energy = clamp(G.energy + ch.en, 0, 100); out.push(['Energie', ch.en]); } if (ch.food) { G.food = clamp(G.food + ch.food, 0, 100); out.push(['Vorrat', ch.food]); }
    if (ch.bond) for (const k in ch.bond) { const c = k === 'A' ? p.A : p.B; c.bond = clamp(c.bond + ch.bond[k], -100, 100); out.push(['Bindung ' + nm(c), ch.bond[k]]); }
    G.bestSym = Math.max(G.bestSym, G.you.sym); t.i++; (ch.sym > 0 ? Snd.star : ch.sym < 0 ? Snd.bad : Snd.click)();
    show(`<div class="card fade"><p class="big"><b>${tx(ch.l)}</b></p><p>${tx(ch.r)}</p>${chipsHtml(out)}<div class="row c" style="margin-top:12px"><button class="btn go" data-a="${t.i < 2 ? 'event' : 'action'}">Weiter ▶</button></div></div>`);
  }
  function action() {
    show(`<div class="card fade"><h2>🌙 Freizeit am Nachmittag</h2><p class="h">Was machst du, bevor die Hörer abstimmen? (Energie: ${G.energy}%)</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${D.ACTIONS.filter(a => !(a.volunteer && G.day === G.days)).map(a => `<div class="card tc" data-a="act" data-id="${a.id}"><b>${a.e} ${a.l}</b><small>${a.d}</small></div>`).join('')}</div></div>`);
  }
  function doAction(id) {
    const a = D.ACTIONS.find(x => x.id === id), out = []; if (a.sym) { sym(G.you, a.sym); out.push(['Beliebtheit', a.sym]); } if (a.en) { G.energy = clamp(G.energy + a.en, 0, 100); out.push(['Energie', a.en]); } if (a.food) { G.food = clamp(G.food + a.food, 0, 100); out.push(['Vorrat', a.food]); } if (a.volunteer) G.volunteer = true; G.bestSym = Math.max(G.bestSym, G.you.sym);
    Snd.click(); show(`<div class="card fade"><p class="big">${a.e} <b>${a.l}</b></p>${a.volunteer ? '<p>Du hebst die Hand – die Hörer lieben mutige Camper! Heute bist du <b>garantiert</b> dran.</p>' : ''}${chipsHtml(out)}<div class="row c" style="margin-top:12px"><button class="btn go" data-a="${G.day === G.days ? 'finale' : 'vote'}">${G.day === G.days ? 'Zum großen Finale ▶' : 'Zum Hörer-Voting ▶'}</button></div></div>`);
  }

  // ---------- Hörer-Voting: wer geht zur Prüfung? ----------
  function vote() {
    const you = G.you, gap = G.day - you.last - 1;
    const list = alive().map(c => { let w = 28 + .55 * c.sym + rnd(0, 22) + Math.min(18, (G.day - c.last - 1) * 5); if (c.id === 'you') { if (G.volunteer) w *= 4; else if (gap >= 2) w *= 2.2; } return { c, w: Math.pow(w, 1.7) }; });
    const pc = percents(list.map(x => x.w)); list.forEach((x, i) => { x.p = pc[i]; }); list.sort((a, b) => b.p - a.p || b.w - a.w);
    const who = list[0].c, defs = D.TRIALS.filter(t => t.id !== G.lastTrial), def = pick(defs); G.pending = { who, def }; const calls = ri(180000, 2400000);
    show(`<div class="fade">${host('Hörer, ihr habt abgestimmt! Wer muss heute zur <b>Prüfung</b>?', null, 'happy')}<div class="card" style="margin-top:10px"><h2>📞 Hörer-Voting</h2><p class="h">Anrufe: <b id="calls">0</b> · die Hörer wollen ihre Lieblinge leiden sehen…</p>${list.map((x, i) => `<div class="vrow ${i === 0 ? 'win' : ''}">${av(x.c, 'n')}<div><b>${esc(nm(x.c))}${x.c.id === 'you' ? ' (du)' : ''}</b><div class="bar"><i data-w="${x.p}"></i></div></div><div class="p">${x.p}%</div></div>`).join('')}<div class="row c" style="margin-top:10px"><button class="btn gold big" data-a="intro">${who.id === 'you' ? 'Du bist dran! ▶' : esc(nm(who)) + ' muss zur Prüfung ▶'}</button></div></div></div>`);
    animateBars(); Snd.drum(); const t0 = performance.now(), el = $('calls'); (function tick() { if (!el.isConnected) return; const k = Math.min(1, (performance.now() - t0) / 1100); el.textContent = fmtN(Math.round(calls * k)); if (k < 1) requestAnimationFrame(tick); })();
  }

  // ---------- Prüfung ----------
  function handicap(who, def) { const stat = G.you[def.stat]; return clamp((100 - G.energy) / 100 * .45 + (50 - stat) / 300 + G.day / G.days * .07, 0, .6); }
  function trialIntro() {
    const p = G.pending, w = p.who, def = p.def, you = w.id === 'you', hd = handicap(w, def);
    show(`<div class="card fade cen"><span class="kind ${def.kind}">${def.kind.toUpperCase()}-PRÜFUNG</span><h2 style="margin-top:8px">${def.e} ${def.name}</h2><div style="width:92px;margin:6px auto">${av(w, 'scared')}</div><p class="big"><b>${you ? 'Du musst ran, ' + esc(nm(w)) + '!' : esc(w.name) + ' muss zur Prüfung!'}</b></p><p>${def.how}</p><p class="h">Bis zu <b>6 Sterne</b> = 6 Mahlzeiten fürs Camp.${you ? ` Energie ${G.energy}% – ${hd > .3 ? 'Du bist erschöpft, die Prüfung wird schwerer!' : hd > .15 ? 'etwas müde.' : 'Du bist fit!'}` : ''}</p><div class="row c"><button class="btn go big" data-a="${you ? 'play' : 'watch'}">${you ? 'Los geht’s! ▶' : 'Zuschauen ▶'}</button></div></div>`, 'center');
  }
  function playTrial(def, max, short, who, cb, abortable) {
    show(`<div id="trialwrap"><canvas id="tc"></canvas></div><div class="row c" style="margin-top:6px"><button class="btn" data-a="abort" style="min-height:36px;padding:6px 14px;font-size:13px">${abortable ? '✖ Abbrechen' : 'Aufgeben (Sterne behalten)'}</button></div>`, 'trial');
    Snd.ambience(); RUN = Trials.run(def.id, $('tc'), { max, short, handi: G ? handicap(who, def) : .1, skin: who.skin, hair: who.hair, top: who.top }, res => { RUN = null; cb(res); });
  }
  function doPlay() { const p = G.pending; playTrial(p.def, 6, false, p.who, res => trialResult(p.who, p.def, res.stars, 6)); }
  function doWatch() { const p = G.pending, w = p.who, base = clamp(w[p.def.stat] / 100 * .78 + .08 + rnd(-.22, .22), 0, 1); trialResult(w, p.def, Math.round(base * 6), 6); }
  function trialResult(who, def, stars, max, final) {
    const you = who.id === 'you', fr = stars / max, d = Math.round((fr - .45) * 30) - (stars === 0 ? 4 : 0), food = stars * 9; sym(who, d); G.food = clamp(G.food + food, 0, 100); who.stars += stars; who.trials++; who.last = G.day; G.lastTrial = def.id; if (you) { G.stars += stars; G.trials++; G.bestSym = Math.max(G.bestSym, who.sym); }
    const q = fr >= .67 ? 'great' : fr >= .34 ? 'ok' : 'bad', mood = fr >= .67 ? 'happy' : fr >= .34 ? 'n' : 'gag';
    show(`<div class="card fade cen"><span class="kind ${def.kind}">${def.name}</span><div style="width:110px;margin:10px auto">${av(who, mood)}</div><h2>${you ? 'Du holst' : esc(nm(who)) + ' holt'} ${stars} von ${max} Sternen!</h2><div class="stars" id="st">${Array.from({ length: max }, () => '<i>⭐</i>').join('')}</div>${host(pick(D.QUIPS[q]), null, fr >= .67 ? 'happy' : 'n')}${chipsHtml([['Vorrat', food], [nm(who) + ' Beliebtheit', d]].filter(x => x[1] !== 0))}<div class="row c" style="margin-top:12px"><button class="btn go big" data-a="after">Weiter ▶</button></div></div>`, 'center');
    const els = view.querySelectorAll('#st i'); for (let i = 0; i < stars; i++) later(() => { els[i] && els[i].classList.add('on'); Snd.star(); }, 350 + i * 260); if (!stars) later(Snd.lose, 400); else if (fr >= .67) later(Snd.win, 400 + stars * 260);
  }
  function afterTrial() { if (G.day >= 2 && G.day <= G.days - 1) elimination(); else nextDay(); }
  function nextDay() { G.day++; startDay(); }

  // ---------- Rauswahl ----------
  function elimination() {
    const list = alive().map(c => ({ c, w: Math.pow(Math.max(5, 100 - c.sym + rnd(0, 12)), 1.8) })), pc = percents(list.map(x => x.w)); list.forEach((x, i) => { x.p = pc[i]; }); list.sort((a, b) => b.p - a.p || b.w - a.w);
    G.leaving = list[0].c; G.second = list[1].c; const near = list[0].c.id === 'you' || list[1].c.id === 'you';
    show(`<div class="fade">${host(`Und jetzt die Entscheidung des Tages: <b>Wer muss das Camp verlassen?</b>${near ? ' Und es wird <b>eng</b> für jemanden, den wir alle kennen…' : ''}`, null, 'n')}<div class="card" style="margin-top:10px"><h2>🚪 Wer muss gehen?</h2><p class="h">Das Hörervotum – oben die Camper, die am ehesten rausfliegen.</p>${list.map(x => `<div class="vrow">${av(x.c, 'n')}<div><b>${esc(nm(x.c))}${x.c.id === 'you' ? ' (du)' : ''}</b><div class="bar r"><i data-w="${x.p}"></i></div></div><div class="p">${x.p}%</div></div>`).join('')}<div class="row c" style="margin-top:10px"><button class="btn red big" data-a="reveal">Das Ergebnis… ▶</button></div></div></div>`);
    animateBars(); Snd.drum(); later(Snd.drum, 500);
  }
  function reveal() {
    const c = G.leaving; c.out = true; c.outDay = G.day; G.outOrder.push(c); const you = c.id === 'you'; Snd[you ? 'lose' : 'reveal']();
    show(`<div class="card fade cen"><h2>${you ? 'Das war’s für dich…' : esc(nm(c)) + ' verlässt das Camp'}</h2><div style="width:130px;margin:8px auto">${av(c, 'sad')}</div><p class="big"><b>${esc(c.name)}</b>${you ? '' : ' · ' + esc(c.job)}</p><p>${you ? 'Die Hörer haben entschieden: Du musst den Dschungel verlassen. Du bist auf Platz <b>' + (G.n - G.outOrder.length + 1) + '</b> gelandet.' : `Knapp dahinter: <b>${esc(nm(G.second))}</b>. ${c.stars ? esc(nm(c)) + ' hat im Camp ' + c.stars + ' Sterne geholt.' : ''}`}</p><div class="row c" style="margin-top:12px"><button class="btn go big" data-a="${you ? 'youOut' : 'next'}">${you ? 'Weiter ▶' : 'Nächster Tag ▶'}</button></div></div>`, 'center');
  }
  function simulateRest() { // wenn du raus bist: Rest des Spiels im Schnelldurchlauf
    let guard = 0; while (alive().length > 3 && guard++ < 20) { alive().forEach(c => sym(c, (50 - c.sym) * .06 + rnd(-4, 4))); const list = alive().map(c => ({ c, w: Math.max(5, 100 - c.sym + rnd(0, 12)) })).sort((a, b) => b.w - a.w); list[0].c.out = true; G.outOrder.push(list[0].c); }
  }
  function youOut() { simulateRest(); const fin = alive().map(c => ({ c, s: c.sym * .55 + rnd(0, 45) * .45 + c.stars * .2 })).sort((a, b) => b.s - a.s); endScreen(fin.map(x => x.c), true); }

  // ---------- Finale ----------
  function finale() {
    const fin = alive(); G.final = { parts: shuffle(D.TRIALS.slice()).slice(0, 3), i: 0, stars: {} }; fin.forEach(c => { G.final.stars[c.id] = 0; });
    show(`<div class="fade">${host('Es ist soweit: das <b>große Finale</b>! Drei Prüfungen, drei Finalisten – und ihr Hörer entscheidet am Ende über den <b>Urwald-Champion</b>!', null, 'happy')}<div class="card" style="margin-top:10px"><h2>🏆 ${D.FINAL.name}</h2><div class="row c" style="gap:18px">${fin.map(c => `<div class="cen" style="width:96px">${av(c, 'happy')}<b style="font-size:13px">${esc(nm(c))}</b></div>`).join('')}</div><p class="cen">${D.FINAL.how}</p><p class="h cen">Teile: ${G.final.parts.map(p => p.e + ' ' + p.name).join(' · ')}</p><div class="row c"><button class="btn gold big" data-a="fpart">Los geht’s! ▶</button></div></div></div>`);
    Snd.fan();
  }
  function finalPart() {
    const F = G.final, def = F.parts[F.i]; G.pending = { who: G.you, def, final: true };
    show(`<div class="card fade cen"><span class="kind ${def.kind}">FINALE · TEIL ${F.i + 1} VON 3</span><h2 style="margin-top:8px">${def.e} ${def.name}</h2><p>${def.how}</p><p class="h">Kurz-Version – bis zu 4 Sterne.</p><div class="row c"><button class="btn go big" data-a="fplay">Los! ▶</button></div></div>`, 'center');
  }
  function finalPlay() { const def = G.pending.def; playTrial(def, 4, true, G.you, res => finalPartDone(res.stars)); }
  function finalPartDone(stars) {
    const F = G.final, def = F.parts[F.i], res = []; alive().forEach(c => { const s = c.id === 'you' ? stars : Math.round(clamp(c[def.stat] / 100 * .75 + .1 + rnd(-.22, .22), 0, 1) * 4); F.stars[c.id] += s; res.push([c, s]); });
    G.stars += stars; G.you.stars += stars; G.trials++; F.i++; const last = F.i >= 3;
    show(`<div class="card fade cen"><span class="kind ${def.kind}">${def.name}</span><h2>Ergebnis Teil ${F.i} von 3</h2>${res.map(([c, s]) => `<div class="vrow">${av(c, s >= 3 ? 'happy' : s ? 'n' : 'gag')}<div><b>${esc(nm(c))}${c.id === 'you' ? ' (du)' : ''}</b><div class="stars" style="font-size:20px;margin:2px 0;justify-content:flex-start">${Array.from({ length: 4 }, (_, i) => `<i class="${i < s ? 'on' : ''}">⭐</i>`).join('')}</div></div><div class="p">${s}</div></div>`).join('')}<div class="row c" style="margin-top:12px"><button class="btn go big" data-a="${last ? 'fvote' : 'fpart'}">${last ? 'Zum Hörervotum ▶' : 'Nächster Teil ▶'}</button></div></div>`, 'center');
    Snd.star();
  }
  function finalVote() {
    const F = G.final, list = alive().map(c => ({ c, s: c.sym * .55 + (F.stars[c.id] / 12) * 100 * .45 + rnd(0, 6) })).sort((a, b) => b.s - a.s), pc = percents(list.map(x => Math.pow(x.s, 2.4))); list.forEach((x, i) => { x.p = pc[i]; });
    G.finalOrder = list.map(x => x.c);
    show(`<div class="fade">${host('Die Leitungen glühen – das <b>Hörervotum</b> ist beendet! Wer ist Urwald-Champion?', null, 'happy')}<div class="card" style="margin-top:10px"><h2>🏆 Das Finalergebnis</h2>${list.map(x => `<div class="vrow">${av(x.c, 'n')}<div><b>${esc(nm(x.c))}${x.c.id === 'you' ? ' (du)' : ''}</b><div class="bar"><i data-w="${x.p}"></i></div></div><div class="p">${x.p}%</div></div>`).join('')}<div class="row c" style="margin-top:10px"><button class="btn gold big" data-a="end">Und der Sieger ist… ▶</button></div></div></div>`);
    animateBars(); Snd.drum(); later(Snd.drum, 600); later(Snd.drum, 1200);
  }

  // ---------- Ende ----------
  function endScreen(order, youOutEarly) {
    const win = order[0], place = {}; order.forEach((c, i) => { place[c.id] = i + 1; }); G.outOrder.filter(c => !place[c.id]).reverse().forEach((c, i) => { place[c.id] = order.length + i + 1; });
    const my = place.you, champ = my === 1, b = store.get(); b.plays = (b.plays || 0) + 1; b.wins = (b.wins || 0) + (champ ? 1 : 0); b.best = Math.min(b.best || 99, my); b.stars = (b.stars || 0) + G.stars; store.set(b);
    const rows = G.cast.slice().sort((a, b2) => place[a.id] - place[b2.id]);
    show(`<div class="card fade cen">${champ ? '<div class="crown">👑</div>' : ''}<h2>${champ ? 'DU BIST URWALD-CHAMPION!' : youOutEarly && my > 3 ? 'Du hast den Dschungel verlassen' : 'Platz ' + my + ' – starke Leistung!'}</h2><div style="width:130px;margin:8px auto">${av(win, 'happy')}</div><p class="big"><b>${win.id === 'you' ? 'Du hast gewonnen!' : esc(win.name) + ' ist Urwald-Champion!'}</b></p><p class="h">Deine Platzierung: <b>${my}.</b> von ${G.n} · ${G.stars} Sterne geholt · ${G.trials} Prüfung${G.trials === 1 ? '' : 'en'} · höchste Beliebtheit ${Math.round(G.bestSym)}%</p>
    <div style="text-align:left;max-width:520px;margin:10px auto">${rows.map(c => `<div class="vrow" style="grid-template-columns:30px 40px 1fr"><b>${place[c.id]}.</b>${av(c, place[c.id] === 1 ? 'happy' : 'n')}<b>${esc(c.name)}${c.id === 'you' ? ' (du)' : ''}</b></div>`).join('')}</div>
    <div class="row c" style="margin-top:12px"><button class="btn go big" data-a="new">Nochmal! ▶</button><button class="btn" data-a="title">Titel</button></div></div>`, 'center');
    champ ? Snd.fan() : Snd.lose(); G.over = true; renderHud();
  }
  function finalEnd() { endScreen(G.finalOrder); }

  // ---------- Übungs-Prüfung ----------
  function practiceTrial(id) {
    const def = D.TRIALS.find(t => t.id === id); const who = look(); who.name = 'Du';
    playTrial(def, 6, false, who, res => { Snd[res.stars >= 4 ? 'win' : 'lose'](); show(`<div class="card fade cen"><span class="kind ${def.kind}">${def.name}</span><h2>${res.stars} von 6 Sternen</h2><div class="stars">${Array.from({ length: 6 }, (_, i) => `<i class="${i < res.stars ? 'on' : ''}">⭐</i>`).join('')}</div><div class="row c"><button class="btn go" data-a="ptrial" data-id="${id}">Nochmal</button><button class="btn" data-a="practice">Andere Prüfung</button></div></div>`, 'center'); }, true);
  }

  // ---------- Klick-Verteiler ----------
  const H = {
    title, how, practice, setup, snd() { Snd.toggle(); title(); },
    new() { setup(); }, start() { newGame(); }, day() { startDay(); }, next: nextDay, event, action, vote, intro: trialIntro, play: doPlay, watch: doWatch, after: afterTrial, reveal, youOut, finale, fpart: finalPart, fplay: finalPlay, fvote: finalVote, end: finalEnd,
    sw(d) { const k = d.k, v = k === 'len' ? d.i : +d.i; SU[k] = v; setup(); },
    choice(d) { choose(+d.i); }, act(d) { doAction(d.id); }, ptrial(d) { practiceTrial(d.id); },
    abort() { if (RUN) { const r = RUN; const s = r.g.shown; r.stop(); RUN = null; if (r.cb) r.cb(s); } }
  };
  view.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a; if (!H[a]) return; Snd.unlock(); if (a !== 'abort') Snd.click(); if (G && !G.over) Snd.ambience(); H[a](b.dataset, b); });
  // Aufgeben: Prüfung beenden und aktuelle Sterne übernehmen
  const oldRun = Trials.run; Trials.run = function (id, cv, opt, done) { let fin = false; const wrap = r => { if (fin) return; fin = true; done(r); }; const h = oldRun(id, cv, opt, wrap); h.cb = s => wrap({ stars: Math.min(s, opt.max || 6), max: opt.max || 6 }); return h; };
  window.__ul = { G: () => G, run: () => RUN, H, store };
  title();
})();
