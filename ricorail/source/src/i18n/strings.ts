// Texte des Hauptmenüs. Deutsch ist vollständig; Englisch ist vorbereitet (Menü und Einstellungen), der Rest folgt.
export type Lang = 'de' | 'en';
const DE = {
  continue: '▶ Weiterfahren', continueSub: 'Letzte Fahrt neu starten',
  free: '🚆 Freies Fahren', freeSub: 'Strecke, Zug, Wetter und Uhrzeit wählen',
  career: '🎓 Karriere', careerSub: 'Ränge, Prüfungen und Fahrerlaubnisse',
  timetable: '🕒 Fahrplanfahrt', timetableSub: 'Eine Linie nach Fahrplan fahren',
  freight: '📦 Güterverkehr & Rangieren', freightSub: 'Beladen, kuppeln, zustellen',
  box: '🚦 Stellwerk', boxSub: 'Fahrstraßen stellen, Züge lenken',
  tycoon: '🏢 Bahngesellschaft', tycoonSub: 'Fahrzeuge kaufen, Linien betreiben',
  world: '🌍 Freie Eisenbahnwelt', worldSub: 'Zuschauen, Kameras, Zeitraffer',
  editor: '✏️ Strecken-Editor', editorSub: 'Eigene Strecken bauen und testen',
  scenarios: '📋 Alle Szenarien', scenariosSub: '64 Aufgaben in 6 Kategorien',
  online: '🌐 Online', onlineSub: 'in Entwicklung – noch nicht verfügbar',
  settings: '⚙ Einstellungen', manual: '📖 Handbuch', credits: 'ℹ Mitwirkende & Lizenzen', back: '← Zurück zu Easygames',
  profile: 'Profil',
};
const EN: Partial<typeof DE> = {
  continue: '▶ Continue', continueSub: 'Restart last run',
  free: '🚆 Free drive', freeSub: 'Choose route, train, weather and time',
  career: '🎓 Career', careerSub: 'Ranks, exams and licences',
  timetable: '🕒 Timetable run', timetableSub: 'Drive a line to the timetable',
  freight: '📦 Freight & shunting', freightSub: 'Load, couple, deliver',
  box: '🚦 Signal box', boxSub: 'Set routes, guide trains',
  tycoon: '🏢 Railway company', tycoonSub: 'Buy trains, run lines',
  world: '🌍 Open railway world', worldSub: 'Watch, cameras, time warp',
  editor: '✏️ Route editor', editorSub: 'Build and test your own routes',
  scenarios: '📋 All scenarios', scenariosSub: '64 tasks in 6 categories',
  online: '🌐 Online', onlineSub: 'in development – not available yet',
  settings: '⚙ Settings', manual: '📖 Manual', credits: 'ℹ Credits & licences', back: '← Back to Easygames',
  profile: 'Profile',
};
let lang: Lang = 'de';
export function setLang(l: Lang) { lang = l; }
export function t(k: keyof typeof DE): string { return (lang === 'en' ? EN[k] : undefined) ?? DE[k]; }
