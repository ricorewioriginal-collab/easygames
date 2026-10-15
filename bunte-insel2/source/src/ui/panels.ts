/* Kleinere Fenster der Welt: Hinweis-Tafeln, Kompass, Kino, Lagerfeuer-Geschichten, Garten, Piratentruhe, Reise nach Atlantis. */
import type { Game } from '../game.ts';
import { btn, h, modal } from './dom.ts';

const STORIES = [
  ['Der Leuchtturm, der singen wollte', 'Es war einmal ein Leuchtturm, der jeden Abend den Schiffen zuleuchtete. Aber eigentlich wollte er singen. Eines Nachts summte er ganz leise – und die Wellen summten mit. Seitdem rauscht das Meer immer ein bisschen wie ein Lied.'],
  ['Blitz und der verlorene Knochen', 'Blitz hatte seinen Lieblingsknochen versteckt – und vergessen, wo. Er schnüffelte im Garten, am Teich und sogar im Rathaus. Am Ende lag der Knochen … in seinem eigenen Körbchen. Manchmal ist das Gesuchte ganz nah.'],
  ['Pappnase fliegt davon', 'An einem windigen Tag riss sich Pappnase los und flog über die ganze Insel. Sie sah die Drachen, das Märchenschloss und die Stadt von oben. Dann wurde ihr langweilig – ohne Freunde ist der schönste Ausblick nur halb so schön. Also schwebte sie zurück.'],
  ['Das Wölkchen, das niemand sah', 'Hoch oben wohnte ein kleines Wölkchen. Es winkte jeden Tag, aber alle schauten nur nach unten auf ihre Wege. „Schaut doch mal hoch!“, rief es. Und weißt du was? Eines Tages tat es jemand. – Lasse sagt, diese Geschichte sei wahr.']
];

export function installPanels(g: Game, deps: { bossAltar: () => void }): void {
  g.panels.note = arg => {
    const m = modal({ title: 'Hinweis', icon: '📜' });
    m.body.append(h('p', { style: 'font-size:1.2rem;line-height:1.5;background:#fff6dc;padding:14px;border-radius:14px' }, String(arg)));
    if (g.settings.tts && 'speechSynthesis' in window) { try { const u = new SpeechSynthesisUtterance(String(arg)); u.lang = 'de-DE'; speechSynthesis.speak(u); } catch { /* egal */ } }
  };
  g.panels.kompass = () => {
    g.events.emit('interact', { id: 'kompass', kind: 'story' });
    const s = g.save, ch = s.mode === 'story' ? Math.min(9, s.story.chapter) : 9;
    const m = modal({ title: 'Der Regenbogen-Kompass', icon: '🧭' });
    const colors = ['#e8453c', '#ff8a1f', '#ffd23f', '#4cd07d', '#2fb9a8', '#3fa9ff', '#5b4bd6', '#b36bff', '#ff5fb0'];
    const wrap = h('div', { style: 'display:grid;place-items:center' });
    const svg = '<svg viewBox="0 0 200 200" width="220" height="220">' + colors.map((c, i) => { const a0 = (i / 9) * Math.PI * 2, a1 = ((i + 1) / 9) * Math.PI * 2; const on = i < ch; const p = (a: number, r: number) => (100 + Math.cos(a) * r).toFixed(1) + ',' + (100 + Math.sin(a) * r).toFixed(1); return '<path d="M100,100 L' + p(a0, 90) + ' A90,90 0 0,1 ' + p(a1, 90) + ' Z" fill="' + (on ? c : '#c8c8d0') + '" stroke="#fff" stroke-width="3" opacity="' + (on ? 1 : 0.5) + '"/>'; }).join('') + '<circle cx="100" cy="100" r="22" fill="#fff6dc" stroke="#2a1f4a" stroke-width="3"/><text x="100" y="108" text-anchor="middle" font-size="22">🧭</text></svg>';
    wrap.innerHTML = svg;
    m.body.append(wrap, h('p', { style: 'text-align:center' }, s.mode === 'story' ? (ch >= 9 ? 'Der Kompass strahlt in allen Farben! Alle Brücken leuchten.' : ch === 0 ? 'Der Kompass ist zerbrochen. Zwölf Splitter fehlen, und überall klebt graue Wolkenwatte …' : (ch) + ' von 9 Farben leuchten wieder.') : 'In der Freien Welt leuchtet der Kompass in allen Farben – alle Wege sind offen.'));
  };
  g.panels.cinema = () => {
    const m = modal({ title: 'Kino Sonnenhafen', icon: '🎬' });
    const films = [['🐕', 'Blitz rettet den Tag', 'Ein Polizeihund, ein verlorener Ballon und eine sehr wilde Verfolgungsjagd durch die Stadt.'], ['🐉', 'Zündel lernt fliegen', 'Ein kleiner Drache, der Höhenangst hat – und mutige Freunde.'], ['🎈', 'Willi am Steuer', 'Ein Stummfilm aus dem Dampfer-Hafen – ganz in Schwarz-Weiß!']];
    m.body.append(h('div', { class: 'grid' }, films.map(([i, t, d]) => h('div', { class: 'card' }, h('div', { style: 'font-size:2.4rem' }, i), h('b', null, t), h('p', { class: 'muted' }, d), btn('▶ Ansehen', () => { m.close(); play(i, t, d); }, 'green small')))));
    const play = (icon: string, title: string, desc: string) => {
      const v = modal({ title, icon: '🎞️' });
      const scr = h('div', { style: 'background:#111;border-radius:16px;height:260px;display:grid;place-items:center;color:#fff;font-size:5rem;overflow:hidden;position:relative' }, icon);
      v.body.append(scr, h('p', null, desc));
      let k = 0; const frames = [icon, '✨', icon, '🎉', icon];
      const iv = setInterval(() => { if (!document.body.contains(scr)) { clearInterval(iv); return; } scr.firstChild!.textContent = frames[k++ % frames.length]; }, 700);
      if (!g.save.flags['film_' + title]) { g.save.flags['film_' + title] = 1; g.addStars(2, 'Kinobesuch'); }
      g.events.emit('interact', { id: 'kino', kind: 'kino' });
    };
  };
  g.panels.campfire = () => {
    const i = g.save.stats.campfire ?? 0;
    const [t, story] = STORIES[i % STORIES.length];
    g.save.stats.campfire = i + 1;
    const m = modal({ title: t, icon: '🔥' });
    m.body.append(h('p', { style: 'font-size:1.15rem;line-height:1.5' }, story));
    g.avatar.play('think', 2);
    g.events.emit('interact', { id: 'lagerfeuer', kind: 'camp' });
    if (i < STORIES.length) g.addXp(5);
    if (g.settings.tts && 'speechSynthesis' in window) { try { const u = new SpeechSynthesisUtterance(story); u.lang = 'de-DE'; speechSynthesis.speak(u); } catch { /* egal */ } }
  };
  g.panels.garden = () => {
    const s = g.save, day = s.clock.day, last = s.stats.garden_day ?? -1;
    if (last === day) { g.toast('Die Beete müssen erst nachwachsen. Morgen gibt es wieder etwas!', '🌱', 3000); return; }
    s.stats.garden_day = day;
    g.give('karotte', 2); g.give('apfel', 1);
    g.avatar.play('dig', 1.2);
    g.events.emit('interact', { id: 'garten', kind: 'garden' });
  };
  g.panels.piratentruhe = () => {
    const s = g.save, day = s.clock.day;
    if ((s.stats.pirat_day ?? -1) === day) { g.toast('Die Truhe ist leer. Piet füllt sie morgen wieder auf!', '🏴‍☠️'); return; }
    s.stats.pirat_day = day; g.addStars(3, 'Piratenschatz'); g.sfx('open');
    g.events.emit('interact', { id: 'piratentruhe', kind: 'chest' });
  };
  g.panels.travel = arg => {
    const w = g.worlds.byId(String(arg));
    if (!w) return;
    const story = g.system<{ id: string; locked(id: string): boolean; lockReason(id: string): string } & import('../game.ts').GameSystem>('story');
    if (story?.locked(w.id)) { g.toast('🔒 ' + story.lockReason(w.id), undefined, 3500); return; }
    const fade = document.querySelector('.fade') ?? h('div', { class: 'fade' }); if (!fade.parentElement) document.body.append(fade);
    (fade as HTMLElement).style.background = '#0b3550'; fade.classList.add('on'); g.sfx('whoosh');
    setTimeout(() => { g.teleport(w.spawn.x, w.spawn.z, w.spawn.yaw); setTimeout(() => { fade.classList.remove('on'); (fade as HTMLElement).style.background = ''; }, 200); }, 450);
  };
  g.panels.bossAltar = () => deps.bossAltar();
  /** Welt neu aufbauen (z. B. wenn die Farbe in den Dampfer-Hafen zurückkehrt). */
  g.panels.reloadWorld = arg => { const id = String(arg); if (!g.worlds.loaded.has(id)) return; g.worlds.unload(id); g.worlds.load(id); };
}
