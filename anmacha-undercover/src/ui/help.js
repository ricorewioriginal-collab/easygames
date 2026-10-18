/* AnMaCha UNDERCOVER 3D – Spielanleitung.
   AMU.Help.open(modeId?, { keys }?) → Fenster mit Reitern für die 6 Modi + „Online spielen“ + „Solo mit Bots“
   AMU.Help.tip(key) → kurzer Ersttipp (Modus-ID oder Rolle: traitor, crew, detective, hunter, runner, impostor, knower, …), sonst ''.
   Tastennamen kommen aus der aktuellen Belegung (AMU.Input), Controller-Belegung aus AMU.Input.PAD_GAME. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  const PAD_NAMES = { 0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 8: 'Zurück/Ansicht', 9: 'Start', 10: 'L3', 11: 'R3', 12: 'Steuerkreuz ↑', 13: 'Steuerkreuz ↓', 14: 'Steuerkreuz ←', 15: 'Steuerkreuz →' };
  const PAD_FALLBACK = { 0: 'use', 1: 'report', 2: 'kill', 3: 'ability', 4: 'vent', 5: 'sab', 6: 'zoomOut', 7: 'zoomIn', 8: 'map', 9: 'menu', 11: 'sprint', 12: 'quick' };

  // Je Modus: Ziel, Rollen, Ablauf, Sieg, Aktionen [Aktion, was sie hier tut]
  const MODES = {
    jagd: {
      goal: 'Die Crew hält im Funkhaus die Sendung am Laufen und erledigt Aufgaben an den Stationen. 1–3 Verräter knipsen heimlich Leute aus, sabotieren Systeme und schleichen durch Geheimgänge.',
      roles: [['🎧', 'Crew', 'Erledigt eigene Aufgaben (kleine Minispiele), meldet Ausgeknipste und stimmt klug ab.'],
        ['🎭', 'Verräter', 'Täuscht Aufgaben nur vor, knipst mit Abklingzeit aus, löst Sabotagen aus (Stromausfall, Funkstille, Türen, Sendeausfall) und nutzt Geheimgänge. Verräter kennen sich gegenseitig.']],
      flow: ['Findest du eine ausgeknipste Person, melde sie. Am Notrufpult kannst du auch selbst eine Besprechung einberufen (begrenzte Notrufe pro Person, gesperrt während eines Sendeausfalls).',
        'In der Besprechung wird erst diskutiert (Chat oder Schnellnachrichten), dann abgestimmt. Bei Gleichstand – oder wenn genauso viele überspringen – fliegt niemand raus.',
        'Ein Sendeausfall muss vor Ablauf des Countdowns an zwei Stationen kurz nacheinander repariert werden.'],
      win: ['Crew: alle Verräter rausgewählt oder der Aufgabenbalken ist voll.', 'Verräter: so viele Verräter wie übrige Personen (Gleichstand) oder ein Sendeausfall wird nicht rechtzeitig behoben.'],
      acts: [['use', 'Aufgabe, Aufzug, Kamerapult, Notrufpult'], ['report', 'Ausgeknipste Person melden'], ['kill', 'Ausknipsen (nur Verräter)'], ['vent', 'Geheimgang (nur Verräter)'], ['sab', 'Sabotage-Menü (nur Verräter)'], ['map', 'Karte'], ['tasks', 'Aufgabenliste']]
    },
    wort: {
      goal: 'Alle kennen das geheime Wort – außer dem Imposter. Gebt reihum Hinweise und findet heraus, wer nur blufft.',
      roles: [['💡', 'Wissende', 'Sehen Wort und Kategorie. Gebt Hinweise, die Mitwissende überzeugen, dem Imposter aber nicht zu viel verraten.'],
        ['🤫', 'Imposter', 'Variante „Kategorie“: kennt nur die Kategorie und weiß, dass er Imposter ist. Variante „Ähnliches Wort“: bekommt ein ähnliches Wort und erfährt seine Rolle erst bei Enttarnung oder am Ende. Ab 9 Personen kann es 2 Imposter geben.']],
      flow: ['Reihum gibt jede Person einen Hinweis – höchstens drei Wörter, nicht das Wort selbst und nichts zu Ähnliches. Je nach Einstellung frei getippt oder per Hinweiskarte, meist zwei Runden lang.',
        'Danach wird diskutiert und abgestimmt. Wird niemand eindeutig gewählt, gibt es einmalig eine Zusatzrunde.',
        'Wird der Imposter rausgewählt, darf er das Wort raten. Liegt er richtig, gewinnt er trotzdem.'],
      win: ['Wissende: alle Imposter rausgewählt und das Wort nicht erraten.', 'Imposter: ein Wissender wird rausgewählt, niemand wird gewählt (auch nach der Zusatzrunde) oder das Wort wird erraten.'],
      acts: [['chat', 'Hinweis oder Nachricht abschicken'], ['quick', 'Schnellnachricht'], ['menu', 'Menü']],
      noMove: true
    },
    detektiv: {
      goal: 'Ein Kriminalfall im Funkhaus – jedes Mal einer von 12 Fällen mit eigener Besonderheit. Ermittler sammeln Spuren, der Täter versucht, sie zu verwischen.',
      roles: [['🔍', 'Ermittler', 'Untersucht Spuren an Fundorten (ab 9 Personen gibt es zwei). Jede Spur landet in der Fallakte – Schlüsse ziehst du selbst.'],
        ['🎧', 'Crew', 'Hält Augen offen, liefert Alibis und stimmt ab.'],
        ['🎭', 'Täter (Verräter)', 'Meist einer, im Fall „Doppelte Frequenz“ zwei. Kann einige Spuren manipulieren.']],
      flow: ['Spurenarten: Fußspuren (Schuhgröße), Stofffasern (Farbfamilie), Haare, Geräusche, Türlogbücher, Kameraaufnahmen, Zeitpunkt, Zeugenaussagen, Stationslogbücher und Bewegungsmelder. Jeder Fall nutzt eine Auswahl davon.',
        'Zeugen können sich irren, manipulierte Spuren führen in die Irre. Vergleicht Spuren mit Aussehen und Alibis.',
        'Es gibt ein Zeitlimit bis zum Sendeschluss. Aufgaben helfen beim Tarnen, bringen hier aber keinen Sieg.'],
      win: ['Crew: alle Täter rausgewählt.', 'Täter: Gleichstand oder bis zum Sendeschluss unentdeckt.'],
      acts: [['use', 'Spur untersuchen (Ermittler) · Aufgabe'], ['report', 'Ausgeknipste Person melden'], ['kill', 'Ausknipsen (nur Täter)'], ['vent', 'Geheimgang (nur Täter)'], ['sab', 'Sabotage (nur Täter)']]
    },
    chaos: {
      goal: 'Rettet die Sendung bis zum Sendeschluss! Stromausfall, Funkstille, zerstörte Mischpulte und defekte Sendetürme – repariert im Team.',
      roles: [['🎧', 'Crew', 'Repariert Störungen (echte Minispiele), erledigt Aufgaben und hält die Sendequalität hoch.'],
        ['🎭', 'Verräter', 'Knipsen hier niemanden aus, sondern sabotieren und täuschen Arbeit vor.']],
      flow: ['Jede offene Störung senkt die Sendequalität, ohne Störung erholt sie sich langsam. In drei Eskalationsstufen kommen Umgebungsstörungen immer häufiger.',
        'Manche Reparaturen müssen an zwei Orten fast gleichzeitig gelingen – sprecht euch ab.',
        'Teamaufträge (z. B. „Behebt 4 Störungen“) bringen +15 % Sendequalität. Besprechungen gibt es per Notrufpult.'],
      win: ['Crew: die Sendung läuft bis zum Sendeschluss oder alle Verräter sind rausgewählt.', 'Verräter: die Sendequalität fällt auf 0, ein Sendeausfall wird nicht behoben oder sie sind in der Überzahl.'],
      acts: [['use', 'Reparieren, Aufgabe, Notrufpult'], ['sab', 'Sabotage (nur Verräter)'], ['vent', 'Geheimgang (nur Verräter)'], ['map', 'Karte mit Störungen']]
    },
    jagen: {
      goal: '1–2 Jäger, die alle kennen, gegen die Flüchtenden. Funkbaken aktivieren, Ausgänge öffnen, entkommen!',
      roles: [['🏃', 'Flüchtende', 'Aktiviere Funkbaken (12 s dranbleiben), versteck dich (bis 15 s), sprinte (kostet Ausdauer und macht Lärm) und befreie Gefangene am Käfig.'],
        ['🔦', 'Jäger', 'Startet nach 10 s Pause. Fängt per Berührung, durchsucht Verstecke, sprintet kurz und sendet alle 45 s einen Ortungsimpuls, der nicht versteckte Flüchtende kurz zeigt (sie werden vorgewarnt).']],
      flow: ['Sind genug Funkbaken an (3–5, je nach Anzahl), öffnen sich nach 15 s die Ausgänge – die Jäger werden gewarnt.',
        'Gefangene landen im Käfig. Um den Käfig gibt es eine Schutzzone. Wer dreimal gefangen wurde, ist raus.',
        'Laufen macht Geräusche, die Jäger in der Nähe hören – Sprinten verrät die Richtung noch deutlicher.'],
      win: ['Flüchtende: mindestens die Hälfte entkommt.', 'Jäger: zu viele gefangen oder die Zeit läuft ab.'],
      acts: [['use', 'Funkbake, Verstecken, Befreien · Jäger: Versteck durchsuchen'], ['kill', 'Fangen (Jäger)'], ['ability', 'Ortungsimpuls (Jäger)'], ['sprint', 'Sprinten'], ['map', 'Karte']]
    },
    rollen: {
      goal: 'Verräter-Jagd mit Sonderrollen. Pro Partie kommen einige Rollen aus der Liste ins Spiel (Standard: bis zu 4) – niemand weiß, welche.',
      roles: null,   // aus AMU.ROLES
      flow: ['Ablauf wie bei der Verräter-Jagd: Aufgaben, Melden, Besprechung, Abstimmung.',
        'Fähigkeiten haben eine Abklingzeit. Gestaltwandler und Störsender gehören zu den Verrätern.'],
      win: ['Wie Verräter-Jagd.', 'Der Trickser gewinnt allein, wenn er rausgewählt wird.'],
      acts: [['use', 'Aufgabe, Notrufpult, Paket (Kurier)'], ['report', 'Melden'], ['ability', 'Fähigkeit der Rolle'], ['kill', 'Ausknipsen (Verräter)'], ['vent', 'Geheimgang (Verräter)'], ['sab', 'Sabotage (Verräter)']]
    }
  };
  const ROLLEN = ['detective', 'tech', 'guard', 'courier', 'trickster', 'shifter', 'tracker', 'jammer'];
  const MODE_N = { jagd: ['🎭', 'Verräter-Jagd'], wort: ['🤫', 'Imposter: Das geheime Wort'], detektiv: ['🔍', 'Detektiv & Alibi'], chaos: ['⚡', 'Sabotage-Chaos'], jagen: ['🔦', 'Verstecken & Jagen'], rollen: ['🃏', 'Rollen-Chaos'] };
  const TABS = Object.keys(MODE_N).concat(['online', 'solo']);

  const TIPS = {
    jagd: 'Erledige deine Aufgaben und merke dir, wer wo war – Verräter tun nur so, als würden sie arbeiten.',
    wort: 'Gib einen Hinweis, den Mitwissende verstehen – aber nicht so deutlich, dass der Imposter das Wort errät.',
    detektiv: 'Untersuche Spuren und vergleiche sie mit Aussehen und Alibis – Zeugen können sich irren.',
    chaos: 'Behebe Störungen schnell und im Team – die Sendequalität darf nicht auf 0 fallen.',
    jagen: 'Flüchtende aktivieren Funkbaken und entkommen, Jäger fangen sie vorher ein.',
    rollen: 'Jede Rolle hat eine Besonderheit – lies deine Rollenkarte genau.',
    crew: 'Erledige deine Aufgaben, melde Ausgeknipste und stimme nur ab, wenn du einen Grund hast.',
    traitor: 'Wirke beschäftigt, knipse nur ohne Zeugen aus und nutze Sabotagen, um die Crew zu trennen.',
    detective: 'Geh zu Fundorten und untersuche Spuren mit „Benutzen“ – ziehe deine eigenen Schlüsse.',
    tech: 'Du reparierst Sabotagen leichter und bist gegen Störsender immun.',
    guard: 'Schütze mit deiner Fähigkeit eine Person in der Nähe – ein Angriff prallt 25 s lang ab.',
    courier: 'Hol an einer Paketstation ein Info-Paket und bring es zum Notrufpult: ein Funkspruch entlastet jemanden.',
    trickster: 'Du gewinnst allein, wenn du rausgewählt wirst – wirke verdächtig, aber nicht zu sehr.',
    shifter: 'Nimm mit deiner Fähigkeit 15 s lang das Aussehen einer anderen Person an.',
    tracker: 'Du siehst frische Fußspuren mit dem Symbol der Person – auch die eines Gestaltwandlers.',
    jammer: 'Stör mit deiner Fähigkeit die Aufgaben und Karten aller in der Nähe – Techniker sind immun.',
    hunter: 'Warte die Startpause ab, nutze den Ortungsimpuls und durchsuche Verstecke.',
    runner: 'Aktiviere Funkbaken, versteck dich vor den Jägern und entkomme, sobald die Ausgänge offen sind.',
    impostor: 'Hör gut zu, was die anderen sagen, und gib einen Hinweis, der passt, ohne das Wort zu kennen.',
    knower: 'Gib einen Hinweis, der zum Wort passt, aber den Imposter nicht auf die Lösung bringt.',
    online: 'Erstelle einen Raum und teile Link, Code oder QR-Code – alle spielen auf ihrem eigenen Gerät.',
    solo: 'Spiele gegen Bots und probiere Rollen aus – Solo-Partien sind Übung, keine Rangliste.'
  };
  function tip(key) { return Object.prototype.hasOwnProperty.call(TIPS, key) ? TIPS[key] : ''; }

  // ---------- Darstellung ----------
  const CSS = '.uic-tabs-wrap{position:sticky;top:-16px;z-index:1;margin:0 -16px;padding:6px 16px;background:#11204a;border-bottom:1px solid #29d3ff22}' +
    '.uic-help-tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:thin}.uic-help-tabs .ui-segb{white-space:nowrap;flex:0 0 auto}' +
    '@media (min-width:700px){.uic-help-tabs{flex-wrap:wrap;overflow:visible}}' +
    '.uic-help h3{margin:12px 0 4px;font-size:16px;color:var(--or)}.uic-help p,.uic-help li{margin:3px 0}.uic-help ul{margin:0;padding-left:20px}' +
    '.uic-role{display:flex;gap:8px;align-items:flex-start;margin:4px 0}.uic-role>i{font-style:normal;font-size:20px;flex:0 0 26px;text-align:center}' +
    '.uic-ctl{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}.uic-ctl>div{background:#0b1630;border:1px solid #29d3ff22;border-radius:10px;padding:8px 10px}' +
    '.uic-ctl b{display:block;color:var(--cy);margin-bottom:2px}.uic-ctl kbd{font:inherit;font-size:13px;background:#1b2f63;border:1px solid #29d3ff55;border-radius:6px;padding:0 5px;white-space:nowrap}';
  function css() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('amu-uic-css');
    if (!el) { el = document.createElement('style'); el.id = 'amu-uic-css'; (document.head || document.documentElement).appendChild(el); }
    if (!el.dataset.help) { el.dataset.help = '1'; el.textContent += CSS; }
  }
  const esc = s => AMU.UI ? AMU.UI.esc(s) : String(s);
  function curKeys(opt) {
    const I = AMU.Input, def = I && I.DEFAULT_KEYS ? I.DEFAULT_KEYS : {};
    let k = opt && opt.keys;
    if (!k && AMU.Save) { const s = AMU.Save.settings(); if (s.keys) k = s.keys; }
    return Object.assign({}, def, k || {});
  }
  function kn(code) { return AMU.Input && AMU.Input.keyName ? AMU.Input.keyName(code) : String(code).replace(/^Key/, ''); }
  // Aktionsnamen der Eingabe können wechseln: Ausknipsen liegt je nach Version auf 'kill' oder 'special'
  const ALT = { kill: 'special', special: 'kill' };
  const pick = (has, a) => has(a) || !ALT[a] ? a : ALT[a];
  function keysOf(K, a) {
    a = pick(x => !!K[x], a); const l = (K[a] || []).slice(0, 2).map(c => '<kbd>' + esc(kn(c)) + '</kbd>'); return l.length ? l.join(' / ') : '–'; }
  function padOf(a) {
    const P = (AMU.Input && AMU.Input.PAD_GAME) || PAD_FALLBACK;
    a = pick(x => Object.keys(P).some(i => P[i] === x), a);
    const b = Object.keys(P).filter(i => P[i] === a).map(i => PAD_NAMES[i] || ('Taste ' + i));
    return b.length ? b.map(x => '<kbd>' + esc(x) + '</kbd>').join(' / ') : '';
  }
  function controls(m, opt) {
    const K = curKeys(opt);
    const dirs = ['up', 'left', 'down', 'right'], k1 = dirs.map(d => (K[d] || [])[0]).filter(Boolean), k2 = dirs.map(d => (K[d] || [])[1]).filter(Boolean);
    const arrows = k2.length === 4 && k2.every(c => /^Arrow/.test(c));
    const move = m.noMove ? '' : '<li><kbd>' + esc(k1.map(kn).join(' ')) + '</kbd>' + (k2.length ? ' oder <kbd>' + (arrows ? 'Pfeiltasten' : esc(k2.map(kn).join(' '))) + '</kbd>' : '') + ' – laufen</li>';
    const pc = '<ul>' + move + m.acts.filter(x => K[pick(y => !!K[y], x[0])]).map(x => '<li>' + keysOf(K, x[0]) + ' – ' + esc(x[1]) + '</li>').join('') +
      (m.noMove ? '<li>Maus oder Pfeiltasten + Eingabe – Hinweiskarte oder Stimme wählen</li>' : '<li>' + keysOf(K, 'chat') + ' – Chat in der Besprechung</li>') + '</ul>';
    const touch = m.noMove
      ? '<ul><li>Hinweis eintippen oder eine Hinweiskarte antippen</li><li>Zum Abstimmen die Person antippen</li></ul>'
      : '<ul><li>Linke Bildschirmhälfte: schwebender Stick zum Laufen</li><li>Rechts: runde Aktionsknöpfe – der große Knopf ist „Benutzen“, die anderen erscheinen, wenn sie gerade möglich sind</li></ul>';
    const pad = m.noMove
      ? '<ul><li>Stick oder Steuerkreuz – Auswahl bewegen</li><li><kbd>A</kbd> – bestätigen, <kbd>B</kbd> – zurück</li></ul>'
      : '<ul><li>Linker Stick – laufen</li>' + m.acts.map(x => { const p = padOf(x[0]); return p ? '<li>' + p + ' – ' + esc(x[1]) + '</li>' : ''; }).join('') + '<li>' + (padOf('menu') || '<kbd>Start</kbd>') + ' – Menü</li><li>In Menüs: Stick/Steuerkreuz bewegt, <kbd>A</kbd> bestätigt, <kbd>B</kbd> zurück</li></ul>';
    return '<h3>Steuerung</h3><div class="uic-ctl"><div><b>⌨️ PC</b>' + pc + '</div><div><b>📱 Touch</b>' + touch + '</div><div><b>🎮 Controller</b>' + pad + '</div></div>';
  }
  function roleRows(m) {
    let rows = m.roles;
    if (!rows) {
      const R = AMU.ROLES || {};
      rows = [['🎧', 'Crew', 'Normale Crew ohne Sonderfähigkeit.'], ['🎭', 'Verräter', 'Wie in der Verräter-Jagd.']]
        .concat(ROLLEN.filter(id => R[id]).map(id => [R[id].icon, R[id].n + (R[id].team === 'traitor' ? ' (Verräter)' : R[id].team === 'neutral' ? ' (neutral)' : ''), R[id].desc]));
    }
    return rows.map(r => '<div class="uic-role"><i aria-hidden="true">' + r[0] + '</i><div><b>' + esc(r[1]) + '</b> – ' + esc(r[2]) + '</div></div>').join('');
  }
  function modeHtml(id, opt) {
    const m = MODES[id], md = AMU.MODES && AMU.MODES.find(x => x.id === id);
    const range = md ? '<p class="ui-muted ui-small">' + md.min + '–' + md.max + ' Personen</p>' : '';
    return '<h2 class="ui-h2">' + MODE_N[id][0] + ' ' + esc(MODE_N[id][1]) + '</h2>' + range + '<p>' + esc(m.goal) + '</p>' +
      '<h3>Rollen</h3>' + roleRows(m) +
      '<h3>Ablauf</h3><ul>' + m.flow.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
      '<h3>Sieg</h3><ul>' + m.win.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' + controls(m, opt);
  }
  function onlineHtml() {
    return '<h2 class="ui-h2">🌐 Online spielen</h2><ul>' +
      ['Der Gastgeber erstellt einen Raum und legt Modus, Karte und Regeln fest.',
        'Mitspieler treten per Link, Raumcode oder QR-Code von überall bei – im Browser, auf dem Handy oder in der App. Der Link führt immer über die easygames-Homepage.',
        'Alle spielen auf ihrem eigenen Gerät. Deine geheime Rolle, dein Wort und deine Hinweise siehst nur du auf deinem Gerät.',
        'Freie Plätze können mit Bots aufgefüllt werden. Bricht eine Verbindung ab, kann ein Bot vorübergehend übernehmen (wenn der Gastgeber das erlaubt); beim Wiederverbinden geht es weiter.',
        'Der Gastgeber führt die Partie – bleib als Gastgeber bitte bis zum Ende online.'].map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>';
  }
  function soloHtml() {
    return '<h2 class="ui-h2">🤖 Solo mit Bots</h2><ul>' +
      ['Spiele jeden Modus allein gegen Bots in drei Stufen: Leicht, Mittel und Schwer.',
        'Bots erledigen Aufgaben, diskutieren mit Schnellnachrichten, verdächtigen und lügen – je nach Rolle.',
        'Du kannst dir eine Wunschrolle aussuchen, um sie in Ruhe auszuprobieren.',
        'Solo-Partien sind Übung: Sie zählen für Statistik und Erfolge, aber nie als Rangliste.'].map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>';
  }
  function tabHtml(t, opt) { return t === 'online' ? onlineHtml() : t === 'solo' ? soloHtml() : modeHtml(t, opt); }

  function open(modeId, opt) {
    css(); opt = opt || {};
    let cur = TABS.includes(modeId) ? modeId : 'jagd';
    const tabs = () => '<div class="uic-help-tabs" role="tablist">' + TABS.map(t => {
      const lab = t === 'online' ? '🌐 Online spielen' : t === 'solo' ? '🤖 Solo mit Bots' : MODE_N[t][0] + ' ' + MODE_N[t][1];
      return '<button class="ui-segb' + (t === cur ? ' on' : '') + '" role="tab" aria-selected="' + (t === cur) + '" data-a="tab" data-v="' + t + '">' + esc(lab) + '</button>';
    }).join('') + '</div>';
    const m = AMU.UI.modal('<h1 class="ui-h1" style="margin-right:44px">❓ So wird gespielt</h1><div class="uic-tabs-wrap">' + tabs() + '</div><div class="uic-help" role="tabpanel">' + tabHtml(cur, opt) + '</div>' +
      '<div class="ui-row end" style="margin-top:12px"><button class="ui-btn ui-pri" data-a="ok">Verstanden</button></div>', {
      cls: 'wide', onClose: opt.onClose,
      on(a, v, b, e, md) {
        if (a === 'ok') return md.close();
        if (a === 'tab' && TABS.includes(v) && v !== cur) {
          cur = v;
          md.el.querySelector('.uic-tabs-wrap').innerHTML = tabs();
          md.el.querySelector('.uic-help').innerHTML = tabHtml(cur, opt);
          const on = md.el.querySelector('.uic-help-tabs .on');
          if (on) { try { on.focus({ preventScroll: true }); on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) { /* alt */ } }
        }
      }
    });
    const on = m.el.querySelector('.uic-help-tabs .on'); if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) { /* alt */ } }
    return m;
  }

  AMU.Help = { open, tip, TIPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.Help;
})(typeof window !== 'undefined' ? window : globalThis);
