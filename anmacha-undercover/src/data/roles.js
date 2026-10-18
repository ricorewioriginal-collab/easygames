/* AnMaCha UNDERCOVER 3D – Rollen, Spielmodi, Presets und Standardregeln (reine Daten). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  // team: crew | traitor | neutral | hunter | runner. abil: aktive Fähigkeit (Prüfung in core/roles.js)
  const ROLES = {
    crew: { n: 'Crew', en: 'Crew', team: 'crew', icon: '🎧', desc: 'Erledige Aufgaben, finde die Verräter und stimme klug ab.' },
    traitor: { n: 'Verräter', en: 'Traitor', team: 'traitor', icon: '🎭', desc: 'Knipse heimlich Leute aus, sabotiere Systeme und nutze Geheimgänge. Bleib unentdeckt!' },
    detective: { n: 'Ermittler', en: 'Detective', team: 'crew', icon: '🔍', abil: 'scan', cd: 35, uses: 3, desc: 'Untersuche Spuren und prüfe Personen in der Nähe. Ziehe Schlüsse – niemand verrät dir die Lösung.' },
    tech: { n: 'Techniker', en: 'Technician', team: 'crew', icon: '🔧', desc: 'Repariert Sabotagen schneller (leichtere Reparatur, hält Doppelreparaturen länger) und ist gegen Störsender immun.' },
    guard: { n: 'Beschützer', en: 'Guardian', team: 'crew', icon: '🛡️', abil: 'shield', cd: 40, dur: 25, desc: 'Schütze eine Person in der Nähe für 25 s. Ein Angriff prallt ab und alle Beteiligten merken es.' },
    courier: { n: 'Kurier', en: 'Courier', team: 'crew', icon: '📦', abil: 'courier', cd: 70, desc: 'Hole ein Info-Paket an einer Paketstation ab und bringe es zum Notrufpult: Ein Funkspruch entlastet eine Person garantiert.' },
    trickster: { n: 'Trickser', en: 'Trickster', team: 'neutral', icon: '🃏', desc: 'Du gehörst zu niemandem. Du gewinnst allein, wenn du rausgewählt wirst – wirke verdächtig, aber nicht zu sehr.' },
    shifter: { n: 'Gestaltwandler', en: 'Shapeshifter', team: 'traitor', icon: '🦎', abil: 'shift', cd: 40, dur: 15, desc: 'Verräter: Nimm 15 s lang das Aussehen einer anderen Person an. Spurenleser sehen deine echten Spuren.' },
    tracker: { n: 'Spurenleser', en: 'Tracker', team: 'crew', icon: '👣', desc: 'Du siehst frische Fußspuren (mit Symbol der Person) – auch die echten Spuren eines Gestaltwandlers.' },
    jammer: { n: 'Störsender', en: 'Jammer', team: 'traitor', icon: '📡', abil: 'jam', cd: 45, dur: 12, desc: 'Verräter: Störe für 12 s Aufgaben und Karte aller Personen in deiner Nähe (Techniker sind immun).' },
    hunter: { n: 'Jäger', en: 'Hunter', team: 'hunter', icon: '🔦', desc: 'Fange alle Flüchtenden, bevor genug von ihnen entkommen. Ortungsimpuls, Sprint und Verstecke durchsuchen.' },
    runner: { n: 'Flüchtende', en: 'Runner', team: 'runner', icon: '🏃', desc: 'Aktiviere die Funkbaken, öffne die Ausgänge und entkomme. Befreie gefangene Teammitglieder.' }
  };
  const ROLE_CHAOS = ['detective', 'tech', 'guard', 'courier', 'trickster', 'shifter', 'tracker', 'jammer'];

  const MODES = [
    { id: 'jagd', n: 'Verräter-Jagd', en: 'Traitor Hunt', icon: '🎭', min: 4, max: 12, def: 8, flags: { tasks: 1, kills: 1, meetings: 1, sab: 1, vents: 1 },
      tag: 'Klassisch', desc: 'Crew erledigt Aufgaben im Funkhaus, 1–3 Verräter knipsen heimlich aus und sabotieren. Melden, diskutieren, abstimmen.',
      win: 'Crew: alle Verräter rausgewählt oder Aufgabenbalken voll. Verräter: Gleichstand mit der Crew oder unbehobener Sendeausfall.' },
    { id: 'wort', n: 'Imposter: Das geheime Wort', en: 'Imposter: The Secret Word', icon: '🤫', min: 3, max: 12, def: 6, flags: { word: 1 },
      tag: 'Wortspiel', desc: 'Alle kennen das geheime Wort – außer dem Imposter. Reihum ein Hinweis, dann wird abgestimmt. Erwischt? Der Imposter darf raten!',
      win: 'Wissende: Imposter rausgewählt und Wort falsch geraten. Imposter: bleibt unentdeckt oder errät das Wort.' },
    { id: 'detektiv', n: 'Detektiv & Alibi', en: 'Detective & Alibi', icon: '🔍', min: 4, max: 12, def: 8, flags: { tasks: 1, kills: 1, meetings: 1, sab: 1, vents: 1, evidence: 1, timer: 1 },
      tag: 'Ermitteln', desc: 'Ermittler untersuchen Fußspuren, Türlogbücher, Kameras und Zeugen. Verräter manipulieren Spuren. Zieht die richtigen Schlüsse!',
      win: 'Crew: alle Verräter rausgewählt. Verräter: Gleichstand oder bis zum Sendeschluss unentdeckt.' },
    { id: 'chaos', n: 'Sabotage-Chaos', en: 'Sabotage Chaos', icon: '⚡', min: 4, max: 12, def: 8, flags: { tasks: 1, meetings: 1, sab: 1, vents: 1, timer: 1, chaos: 1 },
      tag: 'Zeitdruck', desc: 'Stromausfall, Funkstille, zerstörte Mischpulte, defekte Sendetürme. Repariert im Team – oft an zwei Orten gleichzeitig.',
      win: 'Crew: Sendung bis Sendeschluss gerettet oder Verräter rausgewählt. Verräter: Sendequalität auf 0 oder Sendeausfall.' },
    { id: 'jagen', n: 'Verstecken & Jagen', en: 'Hide & Hunt', icon: '🔦', min: 3, max: 12, def: 6, flags: { hunt: 1, timer: 1 },
      tag: 'Flucht', desc: '1–2 bekannte Jäger. Alle anderen schleichen, verstecken sich, aktivieren Funkbaken und fliehen durch die Ausgänge.',
      win: 'Flüchtende: mindestens die Hälfte entkommt. Jäger: sonst.' },
    { id: 'rollen', n: 'Rollen-Chaos', en: 'Role Chaos', icon: '🃏', min: 5, max: 12, def: 9, flags: { tasks: 1, kills: 1, meetings: 1, sab: 1, vents: 1, roles: 1 },
      tag: 'Sonderrollen', desc: 'Verräter-Jagd mit Ermittler, Techniker, Beschützer, Kurier, Trickser, Gestaltwandler, Spurenleser und Störsender.',
      win: 'Wie Verräter-Jagd; der Trickser gewinnt allein, wenn er rausgewählt wird.' }
  ];

  const DEFAULTS = {
    mode: 'jagd', map: 'funkhaus', players: 8, diff: 1, traitors: 2, discuss: 45, vote: 30, tasks: 5, speed: 1, killCd: 30, critWin: true,
    buttonUses: 1, timeLimit: 480, hunters: 2, huntTime: 300, chaosTime: 360, wordRounds: 2, wordVariant: 'kategorie', wordCats: 'alle',
    clueTime: 30, impostors: 1, guessTries: 1, clueMode: 'beide', roleList: ROLE_CHAOS.slice(), roleLimit: 4, botTakeover: true, wordDiff: 0
  };
  const PRESETS = {
    gemuetlich: { n: 'Gemütlich', desc: 'Leicht, 6 Teilnehmer, längere Diskussion', s: { diff: 0, players: 6, discuss: 75, vote: 40, tasks: 4, speed: 0.9, killCd: 35, traitors: 1, clueTime: 45, wordRounds: 2 } },
    standard: { n: 'Standard', desc: 'Mittel, 8 Teilnehmer, ausgewogene Timer', s: { diff: 1, players: 8, discuss: 45, vote: 30, tasks: 5, speed: 1, killCd: 30, clueTime: 30, wordRounds: 2 } },
    profi: { n: 'Profi', desc: 'Schwer, 10–12 Teilnehmer, schneller', s: { diff: 2, players: 11, discuss: 35, vote: 20, tasks: 6, speed: 1.15, killCd: 20, traitors: 2, clueTime: 20, wordRounds: 2 } },
    party: { n: 'Party', desc: 'Kurze chaotische Runden', s: { diff: 1, players: 10, discuss: 25, vote: 15, tasks: 3, speed: 1.25, killCd: 15, traitors: 2, clueTime: 20, wordRounds: 1, chaosTime: 240, huntTime: 210 } },
    eigen: { n: 'Benutzerdefiniert', desc: 'Alle Regeln selbst festlegen', s: {} }
  };

  /** Regeln säubern (Online: Host prüft Einstellungen, die Clients vorschlagen). */
  function cleanSettings(s, base) {
    const d = Object.assign({}, DEFAULTS, base || {});
    const o = Object.assign({}, d);
    const num = (k, a, b) => { const v = +((s || {})[k]); if (isFinite(v)) o[k] = Math.max(a, Math.min(b, v)); };
    s = s || {};
    if (MODES.some(m => m.id === s.mode)) o.mode = s.mode;
    if (AMU.MAPS && AMU.MAPS.some(m => m.id === s.map)) o.map = s.map;
    const mode = MODES.find(m => m.id === o.mode);
    num('players', mode.min, mode.max); o.players = Math.round(o.players);
    num('diff', 0, 2); o.diff = Math.round(o.diff); num('traitors', 1, 3); o.traitors = Math.round(o.traitors);
    num('discuss', 10, 180); num('vote', 10, 120); num('tasks', 2, 8); o.tasks = Math.round(o.tasks); num('speed', 0.7, 1.5);
    num('killCd', 10, 60); num('buttonUses', 0, 3); o.buttonUses = Math.round(o.buttonUses); num('timeLimit', 180, 900); num('hunters', 1, 2); o.hunters = Math.round(o.hunters);
    num('huntTime', 120, 600); num('chaosTime', 180, 600); num('wordRounds', 1, 3); o.wordRounds = Math.round(o.wordRounds); num('clueTime', 10, 90);
    num('impostors', 1, 2); o.impostors = Math.round(o.impostors); num('guessTries', 1, 3); o.guessTries = Math.round(o.guessTries); num('roleLimit', 1, 8); o.roleLimit = Math.round(o.roleLimit);
    num('wordDiff', 0, 3); o.wordDiff = Math.round(o.wordDiff);
    if (typeof s.critWin === 'boolean') o.critWin = s.critWin;
    if (typeof s.botTakeover === 'boolean') o.botTakeover = s.botTakeover;
    if (['kategorie', 'alternativ'].includes(s.wordVariant)) o.wordVariant = s.wordVariant;
    if (['frei', 'karten', 'beide'].includes(s.clueMode)) o.clueMode = s.clueMode;
    if (s.wordCats === 'alle' || (Array.isArray(s.wordCats) && s.wordCats.length && s.wordCats.every(c => typeof c === 'string' && c.length < 20))) o.wordCats = Array.isArray(s.wordCats) ? s.wordCats.slice(0, 20) : 'alle';
    if (Array.isArray(s.roleList)) { const l = s.roleList.filter(r => ROLE_CHAOS.includes(r)); o.roleList = l.length ? l : ROLE_CHAOS.slice(); }
    // Verräter höchstens ein Drittel (abgerundet, mindestens 1)
    o.traitors = Math.max(1, Math.min(o.traitors, Math.floor(o.players / 3) || 1));
    if (o.players < 9) o.impostors = 1;
    o.hunters = Math.min(o.hunters, Math.max(1, Math.floor(o.players / 4)));
    return o;
  }

  AMU.ROLES = ROLES; AMU.ROLE_CHAOS = ROLE_CHAOS; AMU.MODES = MODES; AMU.DEFAULTS = DEFAULTS; AMU.PRESETS = PRESETS; AMU.cleanSettings = cleanSettings;
  AMU.modeById = id => MODES.find(m => m.id === id) || MODES[0];
  if (typeof module !== 'undefined' && module.exports) module.exports = { ROLES, MODES, DEFAULTS, PRESETS, cleanSettings };
})(typeof window !== 'undefined' ? window : globalThis);
