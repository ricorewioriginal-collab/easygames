/* Produktions-Assistent: Thema → Recherche → Gast & Team → Technikcheck → Aufnahme → Schnitt → Titel & Cover → Veröffentlichen → Bericht.
   Jeder Schritt ruft genau eine Funktion der Simulation auf (PT.Sim.prod*); die Oberfläche rechnet nichts selbst. */
(function (root) {
  'use strict';
  const PT = root.PT, UI = PT.UI, S = PT.Sim, D = PT.DATA, esc = PT.esc;
  const P = UI.Prod = {};
  let pnl = null, draft = null;
  const G = () => PT.G;

  // ── Cover zeichnen (auch fürs Archiv) ─────────────────────
  UI.drawCover = function (cv, o) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, c = D.covers.find(x => x.id === o.cover) || D.covers[0];
    const grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, c.colors[0]); grd.addColorStop(1, '#05060f'); g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const acc = o.accent || c.colors[1];
    if (c.id === 'neon') { g.strokeStyle = acc; g.lineWidth = w * 0.02; for (let i = 0; i < 4; i++) { g.globalAlpha = 0.25 + i * 0.15; g.strokeRect(w * (0.08 + i * 0.04), h * (0.08 + i * 0.04), w * (0.84 - i * 0.08), h * (0.84 - i * 0.08)); } g.globalAlpha = 1; }
    else if (c.id === 'retro') { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? acc : '#ff4d6d'; g.globalAlpha = 0.5; g.fillRect(0, h * (0.55 + i * 0.05), w, h * 0.025); } g.globalAlpha = 1; g.fillStyle = acc; g.beginPath(); g.arc(w / 2, h * 0.55, w * 0.25, Math.PI, 0); g.fill(); }
    else if (c.id === 'foto') { g.fillStyle = '#1b2142'; g.fillRect(w * 0.1, h * 0.45, w * 0.8, h * 0.2); [0.32, 0.68].forEach(x => { g.fillStyle = '#16171c'; g.beginPath(); g.arc(w * x, h * 0.36, w * 0.09, 0, 7); g.fill(); g.fillRect(w * (x - 0.1), h * 0.44, w * 0.2, h * 0.16); g.fillStyle = acc; g.fillRect(w * (x - 0.012), h * 0.3, w * 0.024, h * 0.14); }); }
    else { g.fillStyle = acc; g.globalAlpha = 0.18; g.beginPath(); g.arc(w * 0.8, h * 0.25, w * 0.35, 0, 7); g.fill(); g.globalAlpha = 1; }
    // AnMaCha-Play-Dreieck
    g.fillStyle = '#ff8a1e'; g.beginPath(); g.moveTo(w * 0.07, h * 0.07); g.lineTo(w * 0.17, h * 0.12); g.lineTo(w * 0.07, h * 0.17); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(h * 0.07) + 'px system-ui,sans-serif'; g.textBaseline = 'middle'; g.fillText('AnMaCha', w * 0.2, h * 0.12);
    g.font = Math.round(h * 0.22) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(o.icon || '🎙️', w / 2, h * 0.42);
    // Titel umbrechen
    g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(h * 0.075) + 'px system-ui,sans-serif';
    const words = String(o.title || '').split(/\s+/), lines = []; let line = '';
    words.forEach(wd => { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > w * 0.86 && line) { lines.push(line); line = wd; } else line = t; }); if (line) lines.push(line);
    lines.slice(0, 3).forEach((l, i) => g.fillText(l, w / 2, h * (0.72 + i * 0.09)));
    g.textAlign = 'left';
  };

  // ── Rahmen ────────────────────────────────────────────────
  const STEP_NAMES = ['Thema', 'Recherche', 'Gast & Team', 'Technik', 'Aufnahme', 'Schnitt', 'Cover', 'Senden', 'Bericht'];
  function frame(body) {
    const i = S.STAGES.indexOf(G().st.prod ? G().st.prod.stage : 'plan');
    return '<ol class="pt-steps">' + STEP_NAMES.map((n, k) => '<li class="' + (k < i ? 'done' : k === i ? 'cur' : '') + '">' + n + '</li>').join('') + '</ol>' + body;
  }
  P.open = function () {
    const g = G(), st = g.st;
    if (!st.prod) { const r = S.prodStart(st); if (!r.ok) { UI.toast(r.err, 'bad', 5000); return; } draft = null; }
    if (pnl) pnl.close();
    pnl = UI.panel('Neue Folge produzieren', '', { wide: true, icon: '🎙️', cls: 'pt-prod', onClose: () => { pnl = null; g.hud && g.hud(); } });
    UI.bind(pnl.root, ACT);
    render();
  };
  P.isOpen = () => !!pnl;
  function render() {
    if (!pnl) return; const st = G().st; if (!st.prod) { pnl.close(); return; }
    draft = draft || defaultDraft(st);
    const f = VIEWS[st.prod.stage]; pnl.set(frame(f.html(st))); pnl.footer(f.foot(st)); if (f.after) f.after(st);
    G().hud && G().hud();
  }
  P.render = render;
  function fail(r) { if (r && !r.ok) { UI.toast(r.err || 'Das geht gerade nicht.', 'bad', 4500); PT.Audio && PT.Audio.fx('bad'); return true; } return false; }
  function runMG(id, title, ctx, then) {
    pnl.root.parentNode.style.display = 'none';
    G().runMG(id, { title, ctx, onDone: res => { if (pnl) pnl.root.parentNode.style.display = ''; then(res); } });
  }
  function eventCard(st, then) {
    const ev = D.events.find(e => e.id === st.prod.event); if (!ev) { then(); return; }
    UI.choose('⚡ ' + ev.title, ev.text, ev.choices.map(c => ({ label: c.label, desc: c.mg ? 'Minispiel: ' + (PT.MG.get(c.mg) ? PT.MG.get(c.mg).name : c.mg) : fxText(c.effect) })), { noClose: true }).then(i => {
      const c = ev.choices[Math.max(0, i)];
      if (c.mg) runMG(c.mg, ev.title, { event: true }, res => { const r = S.eventChoose(st, ev.id, Math.max(0, i), res || { won: false }); UI.toast(res && res.won ? 'Gelöst: ' + fxText(r.fx) : 'Nicht ganz: ' + fxText(r.fx), res && res.won ? 'good' : 'bad', 4500); then(); });
      else { const r = S.eventChoose(st, ev.id, Math.max(0, i)); UI.toast(fxText(r.fx), 'info', 4000); then(); }
    });
  }
  function fxText(fx) {
    if (!fx) return '';
    const N = { money: v => (v > 0 ? '+' : '') + PT.money(v), fans: v => (v > 0 ? '+' : '') + v + ' Fans', rep: v => 'Ruf ' + (v > 0 ? '+' : '') + v, quality: v => 'Qualität ' + (v > 0 ? '+' : '') + v, reach: v => 'Reichweite ' + (v > 0 ? '+' : '') + Math.round(v * 100) + ' %', reliab: v => 'Zuverlässigkeit ' + (v > 0 ? '+' : '') + v, energy: v => 'Energie ' + (v > 0 ? '+' : '') + v, mood: v => 'Team-Stimmung ' + (v > 0 ? '+' : '') + v, condition: v => 'Gebäude ' + (v > 0 ? '+' : '') + v };
    return Object.keys(fx).filter(k => N[k] && fx[k]).map(k => N[k](fx[k])).join(', ') || 'Keine Auswirkung';
  }
  P.fxText = fxText;

  // ── Schritt 1: Planung ───────────────────────────────────
  function defaultDraft(st) {
    const t = S.topicsFor(st).slice().sort((a, b) => S.trend(st, b).value - S.trend(st, a).value)[0];
    return { topic: t.id, format: st.money < 150 ? 'kurz' : 'normal', segments: [t.rubric, t.rubric === 'wenig' ? 'feelgood' : 'wenig'], guest: null, slot: 'abend', video: false, lead: D.rubrics.find(r => r.id === t.rubric).host === 'andrew' ? 'andrew' : 'marco', tab: 'all' };
  }
  const trendIcon = v => v >= 1.25 ? '🔥' : v >= 1.05 ? '↗' : v <= 0.8 ? '↘' : '→';
  const dots = n => '●'.repeat(n) + '<span class="dim">' + '●'.repeat(5 - n) + '</span>';
  const VIEWS = {};
  VIEWS.plan = {
    html(st) {
      draft = draft || defaultDraft(st);
      const d = draft, topics = S.topicsFor(st).filter(t => d.tab === 'all' || t.rubric === d.tab);
      const f = S.formatById(d.format), tvOk = S.hasRoom(st, 'tvbuehne');
      return '<div class="pt-cols"><div><h3>Thema</h3><div class="pt-tabs">' + [['all', 'Alle']].concat(D.rubrics.map(r => [r.id, r.icon + ' ' + r.short])).map(([id, n]) => '<button data-act="tab" data-id="' + id + '" class="' + (d.tab === id ? 'sel' : '') + '">' + esc(n) + '</button>').join('') + '</div>' +
        '<div class="pt-topics">' + topics.map(t => { const tr = S.trend(st, t), r = D.rubrics.find(x => x.id === t.rubric); return '<button data-act="topic" data-id="' + t.id + '" class="pt-topic ' + (d.topic === t.id ? 'sel' : '') + '"><span>' + r.icon + '</span><b>' + esc(t.title) + '</b><small>' + trendIcon(tr.value) + ' Trend ' + Math.round(tr.value * 100) + ' %' + (tr.uses ? ' · schon ' + tr.uses + '×' : '') + ' · Recherche ' + dots(t.research) + ' · Technik ' + dots(t.tech) + '</small></button>'; }).join('') + '</div></div>' +
        '<div><h3>Format</h3><div class="pt-seg">' + D.formats.map(x => '<button data-act="format" data-id="' + x.id + '" class="' + (d.format === x.id ? 'sel' : '') + '">' + esc(x.name) + '<small>' + PT.money(x.cost) + (x.id === 'kurz' ? ' (geht auch ohne Geld)' : '') + '</small></button>').join('') + '</div>' +
        '<h3>Rubriken-Blöcke <small>(' + f.segments[0] + '–' + f.segments[1] + ', Reihenfolge = Ablauf)</small></h3><div class="pt-chips">' + D.rubrics.map(r => { const i = d.segments.indexOf(r.id); return '<button data-act="seg" data-id="' + r.id + '" class="' + (i >= 0 ? 'sel' : '') + '">' + (i >= 0 ? (i + 1) + '. ' : '') + r.icon + ' ' + esc(r.short) + '</button>'; }).join('') + '</div>' +
        '<h3>Gast</h3><select data-ch="guest"><option value="">Ohne Gast</option>' + D.guests.map(g => { const a = S.guestAvailable(st, g); return '<option value="' + g.id + '"' + (a.ok ? '' : ' disabled') + (d.guest === g.id ? ' selected' : '') + '>' + esc(g.name) + ' (' + D.guestArchetypes[g.arche] + ', ' + (a.ok ? PT.money(S.guestFee(st, g)) : a.why) + ')' + '</option>'; }).join('') + '</select>' +
        (d.guest ? (() => { const g = D.guests.find(x => x.id === d.guest), t = D.topics.find(x => x.id === d.topic); return '<p class="pt-hint">' + (g.fit.includes(t.rubric) ? '✓ passt gut zum Thema' : '• passt eher zu ' + g.fit.map(x => D.rubrics.find(r => r.id === x).short).join(', ')) + ' · Bekanntheit ' + g.fame + '/8</p>'; })() : '') +
        '<h3>Moderation</h3><div class="pt-seg">' + [['marco', 'Marco'], ['andrew', 'Andrew'], ['both', 'Beide']].map(([id, n]) => { const t = D.topics.find(x => x.id === d.topic); const sk = id === 'both' ? (st.hostSkill.marco[t.rubric] + st.hostSkill.andrew[t.rubric]) / 2 : st.hostSkill[id][t.rubric]; return '<button data-act="lead" data-id="' + id + '" class="' + (d.lead === id ? 'sel' : '') + '">' + n + '<small>Können ' + PT.round(sk, 1) + '</small></button>'; }).join('') + '</div>' +
        '<h3>Veröffentlichung</h3><div class="pt-seg">' + D.slots.map(x => '<button data-act="slot" data-id="' + x.id + '" class="' + (d.slot === x.id ? 'sel' : '') + '">' + esc(x.name) + '</button>').join('') + '</div>' +
        '<label class="pt-check' + (tvOk ? '' : ' off') + '"><input type="checkbox" data-ch="video"' + (d.video && tvOk ? ' checked' : '') + (tvOk ? '' : ' disabled') + '> 🎥 Videofolge' + (tvOk ? ' (mehr Reichweite)' : ' (braucht eine TV-Bühne)') + '</label>' +
        '<p class="pt-hint">Kontostand ' + UI.money(st.money) + ' · Energie Marco ' + Math.round(st.hosts.marco.energy) + ' / Andrew ' + Math.round(st.hosts.andrew.energy) + '</p></div></div>';
    },
    foot: () => '<button data-act="cancel">Abbrechen</button><button data-act="plan" data-primary class="pri">Weiter: Recherche ▶</button>',
    after() {
      const s = pnl.root.querySelector('[data-ch="guest"]'); if (s) s.onchange = () => { draft.guest = s.value || null; render(); };
      const v = pnl.root.querySelector('[data-ch="video"]'); if (v) v.onchange = () => { draft.video = v.checked; };
      const sel = pnl.root.querySelector('.pt-topic.sel'); if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
  };
  // ── Schritt 2: Recherche ─────────────────────────────────
  VIEWS.research = {
    html(st) {
      const t = D.topics.find(x => x.id === st.prod.plan.topic);
      return '<p>Thema: <b>' + esc(t.title) + '</b> · Recherche-Bedarf ' + dots(t.research) + '</p><p class="pt-hint">Redaktion im Studio: ' + (S.hasRoom(st, 'redaktion') ? '✓ (' + S.roomValue(st, 'redaktion') + ' Punkte)' : 'keine') + ' · Redaktions-Team: ' + PT.round(S.staffEff(st, 'redaktion'), 1) + '</p>' +
        '<div class="pt-list">' + [['Schnell', '30 min, kaum Energie'], ['Gründlich', '1 Stunde, etwas Energie'], ['Tief', '2 Stunden, viel Energie – beste Fakten']].map((o, i) => '<button class="pt-opt" data-act="research" data-d="' + i + '"' + (i === 1 ? ' data-primary' : '') + '><b>' + o[0] + '</b><small>' + o[1] + '</small></button>').join('') + '</div>' +
        '<label class="pt-check"><input type="checkbox" data-ch="mg" checked> Faktencheck spielen (Gute-Nachrichten-Recherche) – bringt Bonuspunkte</label>';
    },
    foot: () => '<button data-act="cancel">Abbrechen</button>'
  };
  // ── Schritt 3: Gast & Team ───────────────────────────────
  VIEWS.team = {
    html(st) {
      const p = st.prod.plan, g = p.guest && D.guests.find(x => x.id === p.guest);
      const team = st.staff.filter(s => !s.training);
      return (g ? '<div class="pt-guest">' + UI.avatar(g.id, 64) + '<div><b>' + esc(g.name) + '</b><br><small>' + D.guestArchetypes[g.arche] + ' · Gage ' + PT.money(S.guestFee(st, g)) + '</small><p>„' + esc(g.line) + '“</p></div></div><label class="pt-check"><input type="checkbox" data-ch="mg" checked> Vorgespräch führen (Interview-Rapport) – gute Stimmung beim Gast</label>' : '<p>Diese Folge macht ihr zu zweit. Mehr Platz für Marco und Andrew!</p>') +
        '<h3>Team bei der Aufnahme</h3>' + (team.length ? '<ul class="pt-mini">' + team.map(s => '<li>' + D.roles[s.role].icon + ' ' + esc(s.name) + ' <small>Stufe ' + s.skill + (s.station ? '' : ' · ohne Arbeitsplatz') + '</small></li>').join('') + '</ul>' : '<p class="pt-hint">Noch kein Team – im Team-Menü kann man Leute einstellen.</p>');
    },
    foot: st => '<button data-act="cancel">Abbrechen</button>' + (st.prod.plan.guest ? '<button data-act="dropguest">Ohne Gast weiter</button>' : '') + '<button data-act="team" data-primary class="pri">Weiter: Technik ▶</button>'
  };
  // ── Schritt 4: Technik ───────────────────────────────────
  VIEWS.tech = {
    html(st) {
      const T = S.prodTech(st).tech;
      return '<p>Zuverlässigkeit der Technik: <b>' + Math.round(st.reliab) + ' %</b> ' + UI.bar(st.reliab) + '</p><p class="pt-hint">Pannenrisiko für diese Aufnahme: ' + Math.round(T.chance * 100) + ' %</p>' +
        (T.fault ? '<div class="pt-alert">⚠️ Beim Check fällt auf: <b>' + esc(T.part) + '</b> macht Probleme!</div><div class="pt-list"><button class="pt-opt" data-act="tech" data-how="minigame" data-primary><b>🔍 Störung selbst suchen</b><small>Minispiel Störungssuche – gewonnen = keine Abzüge und Technik +6</small></button><button class="pt-opt" data-act="tech" data-how="pay"><b>🔧 Reparatur-Service rufen</b><small>' + PT.money(120) + ', sicher</small></button><button class="pt-opt" data-act="tech" data-how="ignore"><b>🤞 Einfach aufnehmen</b><small>−7 Technikqualität, aber Chaos-Punkte für die Story</small></button></div>' : '<div class="pt-ok">✓ Alles läuft. Mikrofone an, Kopfhörer auf!</div>');
    },
    foot: st => '<button data-act="cancel">Abbrechen</button>' + (st.prod.tech && !st.prod.tech.fault ? '<button data-act="tech" data-how="ok" data-primary class="pri">Weiter: Aufnahme ▶</button>' : '')
  };
  // ── Schritt 5: Aufnahme ──────────────────────────────────
  VIEWS.record = {
    html(st) {
      draft.beats = draft.beats || [];
      const beats = S.recordBeats(st), i = draft.beats.length;
      if (i < beats.length) {
        const b = beats[i];
        return '<div class="pt-onair">🔴 ON AIR</div><p class="pt-hint">Gesprächsmoment ' + (i + 1) + ' von ' + beats.length + '</p><h3>' + esc(b.q) + '</h3><div class="pt-list">' + b.o.map((o, k) => '<button class="pt-opt" data-act="beat" data-i="' + k + '"' + (k === 0 ? ' data-primary' : '') + '><b>' + esc(o.t) + '</b></button>').join('') + '</div>';
      }
      const auto = S.staffEff(st, 'technik') > 0;
      return '<div class="pt-onair">🔴 ON AIR</div><p>Die Gesprächsmomente stehen. Jetzt den Pegel sauber halten!</p><div class="pt-list"><button class="pt-opt" data-act="record" data-how="mg" data-primary><b>🎚️ Selbst pegeln</b><small>Minispiel Mikrofon-Pegel – bestimmt die Aufnahmequalität</small></button><button class="pt-opt" data-act="record" data-how="auto"><b>🤖 Automatisch</b><small>' + (auto ? 'Tontechnik übernimmt (solide)' : 'Ohne Tontechnik nur mittelmäßig') + '</small></button></div>';
    },
    foot: () => '<button data-act="cancel">Abbrechen</button>',
    after(st) { if (st.prod.event && !draft.evShown) { draft.evShown = true; eventCard(st, render); } }
  };
  // ── Schritt 6: Schnitt ───────────────────────────────────
  VIEWS.edit = {
    html(st) {
      const cut = S.staffEff(st, 'schnitt');
      return '<p>Aufnahme im Kasten (' + st.prod.recordScore + ' Punkte). Jetzt kommt der Schnitt.</p><div class="pt-list">' +
        '<button class="pt-opt" data-act="edit" data-how="editor" data-primary><b>✂️ Selbst schneiden</b><small>Mehrspur-Editor: Versprecher raus, Pausen schließen, Rauschen weg, Intro/Outro, Blenden</small></button>' +
        '<button class="pt-opt" data-act="edit" data-how="auto"><b>' + (cut > 0 ? '👩‍💻 Schnitt-Team machen lassen' : '⏩ Schnell-Schnitt') + '</b><small>' + (cut > 0 ? 'Solide, je nach Können' : 'Ohne Schnitt-Team: schwach') + '</small></button></div>' +
        (S.hasRoom(st, 'regie') ? '<p class="pt-hint">✓ Regie-Raum: +2 auf die Schnittqualität</p>' : '');
    },
    foot: () => '<button data-act="cancel">Abbrechen</button>'
  };
  // ── Schritt 7: Titel & Cover ─────────────────────────────
  VIEWS.package = {
    html(st) {
      const sug = S.titleSuggestions(st); draft.title = draft.title || sug[0]; draft.cover = draft.cover || 'klassik'; draft.teaser = draft.teaser || 'none';
      const cam = S.studio(st).cats.kamera > 0;
      return '<div class="pt-cols"><div><h3>Titel</h3><input data-ch="title" maxlength="80" value="' + esc(draft.title) + '"><div class="pt-chips">' + sug.map((s, i) => '<button data-act="sug" data-i="' + i + '">' + esc(s) + '</button>').join('') + '</div>' +
        '<h3>Cover</h3><div class="pt-covers">' + D.covers.map(c => '<button data-act="cover" data-id="' + c.id + '" class="' + (draft.cover === c.id ? 'sel' : '') + '"><canvas width="120" height="120" data-cov="' + c.id + '"></canvas><small>' + esc(c.name) + ' · ' + (c.cost ? PT.money(c.cost) : 'gratis') + '</small></button>').join('') + '</div>' +
        '<h3>Teaser</h3><div class="pt-list">' + D.teasers.map(t => { const off = (t.needCat && !cam) || (t.needChapter && st.mode === 'career' && (st.chapter || 1) < t.needChapter); return '<button class="pt-opt ' + (draft.teaser === t.id ? 'sel' : '') + '" data-act="teaser" data-id="' + t.id + '"' + (off ? ' disabled' : '') + '><b>' + esc(t.name) + '</b><small>' + (t.cost ? PT.money(t.cost) : 'gratis') + (t.reach ? ' · Reichweite +' + Math.round(t.reach * 100) + ' %' : '') + '</small></button>'; }).join('') + '</div></div>' +
        '<div><h3>Vorschau</h3><canvas class="pt-cover-big" width="320" height="320" data-cov="big"></canvas></div></div>';
    },
    foot: () => '<button data-act="cancel">Abbrechen</button><button data-act="package" data-primary class="pri">Weiter: Veröffentlichen ▶</button>',
    after(st) {
      const icon = D.rubrics.find(r => r.id === D.topics.find(t => t.id === st.prod.plan.topic).rubric).icon;
      pnl.root.querySelectorAll('canvas[data-cov]').forEach(cv => UI.drawCover(cv, { cover: cv.dataset.cov === 'big' ? draft.cover : cv.dataset.cov, title: cv.dataset.cov === 'big' ? draft.title : '', icon }));
      const inp = pnl.root.querySelector('[data-ch="title"]'); inp.oninput = () => { draft.title = inp.value; const big = pnl.root.querySelector('canvas[data-cov="big"]'); UI.drawCover(big, { cover: draft.cover, title: draft.title, icon }); };
    }
  };
  // ── Schritt 8: Veröffentlichen ───────────────────────────
  VIEWS.publish = {
    html(st) {
      const q = S.qualityParts(st), slot = D.slots.find(s => s.id === st.prod.plan.slot);
      return '<p>Fertig zum Senden: <b>' + esc(st.prod.pack.title) + '</b></p><p>Voraussichtliche Qualität: <b>' + q.total + ' %</b> ' + UI.bar(q.total) + '</p><p class="pt-hint">Termin: ' + esc(slot.name) + ' · Kosten bisher ' + PT.money(st.prod.costs) + '</p>';
    },
    foot: () => '<button data-act="cancel">Abbrechen</button><button data-act="publish" data-primary class="pri">📡 Jetzt veröffentlichen</button>',
    after(st) { if (st.prod.event && !draft.evPub) { draft.evPub = true; eventCard(st, render); } }
  };
  // ── Schritt 9: Bericht ───────────────────────────────────
  const PART_NAMES = { plan: ['Planung', 15], research: ['Recherche', 15], tech: ['Technik', 20], record: ['Aufnahme', 20], edit: ['Schnitt', 20], hosts: ['Form der Hosts', 10] };
  VIEWS.report = {
    html(st) {
      const R = st.prod.report, e = R.ep;
      return '<div class="pt-report"><div class="pt-rep-head"><canvas width="160" height="160" data-cov="rep"></canvas><div><h3>' + esc(e.title) + '</h3><p class="pt-stars">' + UI.stars(e.stars) + '</p><p>Qualität <b>' + e.q + ' %</b></p><p>🎧 <b>' + PT.fmt(R.listeners) + '</b> Hörer am ersten Tag (Nachhören folgt)</p></div></div>' +
        '<h3>So kam die Qualität zustande</h3><ul class="pt-parts">' + Object.keys(PART_NAMES).map(k => '<li><span>' + PART_NAMES[k][0] + '</span>' + UI.bar(R.q[k], PART_NAMES[k][1]) + '<b>' + R.q[k] + '/' + PART_NAMES[k][1] + '</b></li>').join('') + (R.q.events ? '<li><span>Ereignisse</span><b>' + (R.q.events > 0 ? '+' : '') + R.q.events + '</b></li>' : '') + '</ul>' +
        '<ul class="pt-mini"><li>💶 Einnahmen: <b>' + PT.money(R.revenue) + '</b>' + (R.merch ? ' + Merch ' + PT.money(R.merch) : '') + '</li><li>💛 Fans: <b>' + (R.fansGain >= 0 ? '+' : '') + R.fansGain + '</b> (jetzt ' + PT.fmt(st.fans) + ')</li><li>⭐ Ruf: <b>' + (R.repDelta >= 0 ? '+' : '') + R.repDelta + '</b></li><li>📈 Trend ' + Math.round(R.trend.value * 100) + ' % · Reichweite +' + Math.round(R.reach * 100) + ' %' + (R.weekend ? ' · Wochenende' : '') + '</li>' + (R.sponsorNote ? '<li>🤝 ' + esc(R.sponsorNote) + '</li>' : '') + '</ul>' +
        '<h3>Hörerstimmen</h3><ul class="pt-comments">' + e.comments.map(c => '<li>💬 ' + esc(c) + '</li>').join('') + '</ul>' + tips(st, R) + '</div>';
    },
    foot: () => '<button data-act="finish" data-primary class="pri">Fertig</button>',
    after(st) { const cv = pnl.root.querySelector('canvas[data-cov="rep"]'); const e = st.prod.report.ep; UI.drawCover(cv, { cover: e.cover, title: e.title, icon: e.icon, accent: e.accent }); PT.Audio && PT.Audio.fx(e.q >= 60 ? 'win' : 'pop'); }
  };
  function tips(st, R) {
    const t = [], q = R.q, topic = D.topics.find(x => x.id === R.ep.topic);
    if (q.tech < 12) t.push('Technik: bessere Mikrofone, Absorber und Interfaces im Aufnahmeraum heben den Klang (das Thema verlangt Technik ' + topic.tech + '/5).');
    if (q.research < 10) t.push('Recherche: eine Redaktion mit Schreibtisch und Redaktions-Team bringt mehr Punkte.');
    if (q.edit < 12) t.push('Schnitt: im Mehrspur-Editor selbst schneiden oder Mira ins Team holen.');
    if (q.hosts < 7) t.push('Marco und Andrew sind müde – eine Kaffeeküche und eine Nacht Schlaf helfen.');
    if (q.plan < 9) t.push('Planung: Hauptthema als Block einplanen, Blöcke nicht doppeln, Gast passend zum Thema wählen.');
    return t.length ? '<h3>Tipps</h3><ul class="pt-tips">' + t.map(x => '<li>💡 ' + esc(x) + '</li>').join('') + '</ul>' : '';
  }

  // ── Aktionen ─────────────────────────────────────────────
  const ACT = {
    tab: b => { draft.tab = b.dataset.id; render(); },
    topic: b => { draft.topic = b.dataset.id; const t = D.topics.find(x => x.id === draft.topic); if (!draft.segments.includes(t.rubric)) draft.segments = [t.rubric].concat(draft.segments.filter(x => x !== t.rubric)).slice(0, S.formatById(draft.format).segments[1]); render(); },
    format: b => { draft.format = b.dataset.id; const f = S.formatById(draft.format); draft.segments = draft.segments.slice(0, f.segments[1]); render(); },
    seg: b => { const id = b.dataset.id, i = draft.segments.indexOf(id); if (i >= 0) draft.segments.splice(i, 1); else if (draft.segments.length < S.formatById(draft.format).segments[1]) draft.segments.push(id); else UI.toast('Mehr Blöcke passen nicht in dieses Format.', 'info'); render(); },
    lead: b => { draft.lead = b.dataset.id; render(); },
    slot: b => { draft.slot = b.dataset.id; render(); },
    cancel: () => { UI.confirm('Produktion abbrechen?', 'Bereits bezahlte Kosten bleiben gebucht.', 'Abbrechen', 'Weiter produzieren').then(y => { if (y) { S.prodCancel(G().st); draft = null; pnl && pnl.close(); } }); },
    plan: () => { const st = G().st; if (fail(S.prodPlan(st, draft))) return; G().afterAction(); render(); },
    research: b => {
      const st = G().st, depth = +b.dataset.d, mg = pnl.root.querySelector('[data-ch="mg"]').checked;
      const go = score => { if (fail(S.prodResearch(st, depth, score))) return; G().afterAction(); render(); };
      if (mg) runMG('F03', 'Recherche zur Folge', { prod: 'research' }, res => go(res ? res.score : 0)); else go(0);
    },
    dropguest: () => { S.prodDropGuest(G().st); render(); },
    team: () => {
      const st = G().st, mgBox = pnl.root.querySelector('[data-ch="mg"]');
      const go = score => { const r = S.prodTeam(st, score); if (r.ok) { G().afterAction(); render(); return; } UI.confirm('Gage zu hoch', r.err, 'Ohne Gast weiter', 'Zurück').then(y => { if (y) { S.prodDropGuest(st); S.prodTeam(st, 0); render(); } }); };
      if (st.prod.plan.guest && mgBox && mgBox.checked) runMG('F02', 'Vorgespräch mit dem Gast', { prod: 'team' }, res => go(res ? res.score : 50)); else go(0);
    },
    tech: b => {
      const st = G().st, how = b.dataset.how;
      if (how === 'minigame') runMG('P04', 'Störung vor der Aufnahme', { prod: 'tech' }, res => { S.prodTechResolve(st, 'minigame', !!(res && res.won)); UI.toast(res && res.won ? 'Störung gefunden – alles sauber!' : 'Notlösung: klingt etwas schlechter.', res && res.won ? 'good' : 'bad'); render(); });
      else { if (fail(S.prodTechResolve(st, how === 'ok' ? null : how))) return; render(); }
    },
    beat: b => { draft.beats.push(+b.dataset.i); PT.Audio && PT.Audio.fx('pop'); render(); },
    record: b => {
      const st = G().st;
      const go = res => { if (fail(S.prodRecord(st, res))) return; G().afterAction(); render(); };
      if (b.dataset.how === 'mg') runMG('P01', 'Aufnahme: ' + D.topics.find(t => t.id === st.prod.plan.topic).title, { prod: 'record' }, res => go({ score: res ? res.score : 30, choices: draft.beats }));
      else go({ auto: true, choices: draft.beats });
    },
    edit: b => {
      const st = G().st;
      if (b.dataset.how === 'auto' || !PT.Editor) { if (!PT.Editor && b.dataset.how !== 'auto') UI.toast('Editor nicht geladen – automatischer Schnitt.', 'info'); fail(S.prodEdit(st, { auto: true })); G().afterAction(); render(); return; }
      const host = UI.el('<div class="pt-editor-host"></div>'); document.body.appendChild(host); pnl.root.parentNode.style.display = 'none';
      const p = st.prod.plan;
      PT.Editor.open(host, { seed: PT.hash(st.seed + ':' + st.episodes.length), difficulty: st.diff, format: p.format, segments: p.segments, guest: !!p.guest, hosts: ['Marco', 'Andrew'] }, res => {
        host.remove(); if (pnl) pnl.root.parentNode.style.display = '';
        if (!res) return; // abgebrochen: Schritt bleibt offen
        fail(S.prodEdit(st, { score: res.score, detail: res.detail })); G().afterAction(); render();
      });
    },
    sug: b => { draft.title = S.titleSuggestions(G().st)[+b.dataset.i]; render(); },
    cover: b => { draft.cover = b.dataset.id; render(); },
    teaser: b => { draft.teaser = b.dataset.id; render(); },
    package: () => { const st = G().st; if (fail(S.prodPackage(st, { title: draft.title, cover: draft.cover, teaser: draft.teaser }))) return; render(); },
    publish: () => { const st = G().st; const r = S.prodPublish(st); if (fail(r)) return; G().afterAction(); render(); },
    finish: () => { const st = G().st; S.prodFinish(st); draft = null; pnl.close(); G().afterAction(true); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
