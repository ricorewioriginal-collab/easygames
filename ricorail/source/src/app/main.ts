// RicoRail Simulator 3D – App-Hülle: Start, Profile, Hauptmenü, Auswahlbildschirme, Laden, Ergebnis, Einstellungen.
import { CSS, h, btn, clear, toast, dialog, hhmm } from '../ui/dom';
import { SaveStore, type Settings, type Profile } from '../save/store';
import { AudioEngine } from '../audio/audio';
import { ROUTES, ROUTE, routeNet } from '../data/routes';
import { SCENARIOS, SCENARIO, CATS, RANKS, EXAM_FOR_RANK } from '../data/scenarios';
import { LINES, nextDeparture } from '../data/services';
import { Session, type PlayerSpec, type Scenario, type Result } from '../modes/session';
import { Network } from '../railway/network';
import type { NetworkDef } from '../railway/schema';
import type { Weather, WeatherKind, Assist } from '../operations/world';
import { FORM, FORMATIONS } from '../trains/stock';
import { Game } from './game';
import { TrackEditor } from '../editor/editor';
import { t, setLang } from '../i18n/strings';
import * as Ty from '../modes/tycoon';

type Mode = 'drive' | 'box' | 'world';
interface RunCfg {
  title: string; routeId: string; def?: NetworkDef; time: number; weather: Weather; assist: Assist; traffic: number;
  player: PlayerSpec; scenario?: Scenario; mode: Mode; allowFreeCam: boolean; autoDispatch?: boolean;
  /** Rückkehr nach der Fahrt */
  back: () => void;
}

const VERSION = '1.0.0';
const WEATHER: Record<WeatherKind, string> = { clear: 'Sonnig', cloudy: 'Bewölkt', rain: 'Regen', storm: 'Gewitter', snow: 'Schnee', fog: 'Nebel' };
const SEASON: Record<Weather['season'], string> = { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', winter: 'Winter' };
const ASSIST: Record<Assist, string> = { easy: 'Leicht (Bremsassistent hält vor Halt)', standard: 'Normal (Geschwindigkeitsüberwachung)', expert: 'Experte (zusätzlich PZB-Spielmodell)' };

let store: SaveStore;
let audio: AudioEngine;
let ui: HTMLElement;
let canvas: HTMLCanvasElement;
let game: Game | null = null;
const nets = new Map<string, Network>();
const netOf = (id: string) => { let n = nets.get(id); if (!n) { n = new Network(routeNet(id)); nets.set(id, n); } return n; };

const P = (): Profile => store.active;
const S = (): Settings => store.active.settings;

// ------------------------------------------------------------------ Start
async function boot() {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  canvas = document.getElementById('scene') as HTMLCanvasElement ?? document.body.appendChild(h('canvas', { id: 'scene' }));
  ui = document.getElementById('ui') ?? document.body.appendChild(h('div', { id: 'ui' }));
  const load = h('div', { class: 'loading' }, h('div', { class: 'logo', style: 'font-size:1.6em' }, 'RicoRail ', h('b', null, 'Simulator 3D')), h('div', { class: 'muted' }, 'Lade …'));
  document.body.appendChild(load);
  if (!hasWebGL()) { load.remove(); showFatal('Dieses Gerät oder dieser Browser unterstützt kein WebGL. RicoRail braucht 3D-Grafik (WebGL).'); return; }
  store = await SaveStore.open();
  audio = new AudioEngine();
  applySettings();
  const unlock = () => { void audio.unlock().then(() => audio.setVolumes(S().volume)); };
  addEventListener('pointerdown', unlock, { once: true }); addEventListener('keydown', unlock, { once: true });
  load.remove();
  if (store.notice) toast(store.notice, 'warn', 6000);
  if (store.lastError) toast(store.lastError, 'warn', 6000);
  menu();
}

function hasWebGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }

function showFatal(msg: string) {
  screen(h('h1', { class: 'logo' }, 'RicoRail ', h('b', null, 'Simulator 3D')), h('p', null, msg), btn(t('back'), backToEasygames, 'btn primary'));
}

function applySettings() {
  const s = S();
  setLang(s.lang);
  document.documentElement.style.setProperty('--fs', String(s.textScale));
  document.body.classList.toggle('cb', s.colorblind);
  document.documentElement.lang = s.lang;
  if (audio.ready) audio.setVolumes(s.volume);
}

function save() { store.autosave(); }

function backToEasygames() {
  if (window.parent !== window) { try { window.parent.postMessage({ type: 'easygames:close' }, '*'); return; } catch { /* weiter */ } }
  location.href = '../';
}

/** Vollbild-Menüseite */
function screen(...kids: (HTMLElement | string | null | false)[]) {
  clear(ui);
  canvas.style.visibility = 'hidden';
  const el = h('div', { class: 'screen' }, h('div', { class: 'wrap' }, ...kids));
  ui.appendChild(el);
  return el;
}
const header = (title: string, back: () => void = menu) => h('div', { class: 'row', style: 'margin-bottom:10px' }, btn('←', back, 'btn small', { 'aria-label': 'Zurück' }), h('h2', { style: 'margin:0' }, title));
const field = (label: string, el: HTMLElement) => h('label', { class: 'f' }, label, el);
function select<T extends string>(opts: [T, string][], val: T, on: (v: T) => void) {
  const s = h('select', null, ...opts.map(([v, l]) => h('option', { value: v, selected: v === val }, l)));
  s.addEventListener('change', () => on(s.value as T));
  return s;
}
const ROUTE_TAG = (id: string) => { const r = ROUTE.get(id)!; return h('span', { class: `tag ${r.world === 'real' ? 'real' : 'fant'}` }, r.world === 'real' ? 'nachgebildet' : 'Fantasie'); };

// ------------------------------------------------------------------ Hauptmenü
/** Große Kachel mit Symbol, Titel und Unterzeile */
const tile = (icon: string, label: string, sub: string, on: () => void, cls = '') =>
  btn([h('span', { class: 'ti' }, icon), h('span', null, h('b', null, label), h('small', null, sub))] as unknown as HTMLElement, on, `btn tile ${cls}`);
/** Text ohne führendes Symbol („🚆 Freies Fahren“ → „Freies Fahren“) */
const bare = (s: string) => s.replace(/^[^\p{L}]+/u, '');

function menu() {
  const p = P();
  const rank = RANKS[p.career.rank]?.name ?? '';
  const last = p.resume as RunStub | null;
  const quick = quickPick();
  screen(
    h('div', { class: 'hero' },
      h('div', { class: 'row' }, h('h1', { class: 'logo' }, 'RicoRail ', h('b', null, 'Simulator 3D')), h('span', { class: 'spacer' }),
        btn(`👤 ${p.name}`, profiles, 'btn small', { title: t('profile') })),
      h('p', { class: 'sub' }, 'Deine Eisenbahn. Deine Strecken. Deine Welt.'),
      h('p', { class: 'small muted' }, `${rank} · ${p.career.xp} Erfahrung`)),
    h('div', { class: 'menu2' },
      quick ? btn([h('span', { class: 'ti' }, '▶'), h('span', null, h('b', null, 'Jetzt fahren'), h('small', null, `Sofort los: ${quick.title}`))] as unknown as HTMLElement, () => quickStart(quick), 'btn tile primary big') : null,
      last ? tile('⟲', bare(t('continue')), last.title, () => resume(last), 'big') : null,
      h('div', { class: 'tiles' },
        tile('🚆', 'Fahren', 'Frei, nach Fahrplan, Güter', driveMenu),
        tile('🎓', bare(t('career')), t('careerSub'), career),
        tile('📋', 'Aufgaben', t('scenariosSub'), () => scenarioList(null, t('scenarios'))),
        tile('🚦', bare(t('box')), t('boxSub'), boxMenu),
        tile('🏢', bare(t('tycoon')), t('tycoonSub'), tycoon),
        tile('🌍', 'Zuschauen', 'Züge beobachten, Kameras, Zeitraffer', worldMenu),
        tile('✏️', 'Editor', t('editorSub'), editor),
        tile('🌐', 'Online', 'in Entwicklung', () => toast('Online-Modus ist in Entwicklung und noch nicht verfügbar.'), 'dis')),
      h('div', { class: 'row foot' }, btn(t('settings'), () => settingsScreen(menu), 'btn small'), btn(t('manual'), manual, 'btn small'), btn(t('credits'), credits, 'btn small'), btn(t('back'), backToEasygames, 'btn small ghost'))),
    h('p', { class: 'notice' }, `Version ${VERSION} · Simulation, kein offizielles Produkt der Deutschen Bahn. Reale Strecken sind vereinfacht nachgebildet. Sicherungssysteme sind Spielmodelle, nicht zertifiziert und nicht sicherheitsrelevant. Kostenlos, keine In-App-Käufe.`),
  );
}

/** Untermenü „Fahren“ */
function driveMenu() {
  screen(header('Fahren'),
    h('div', { class: 'tiles' },
      tile('🚆', bare(t('free')), t('freeSub'), freeDrive),
      tile('🕒', bare(t('timetable')), t('timetableSub'), timetableRun),
      tile('📦', bare(t('freight')), t('freightSub'), () => scenarioList(['freight', 'shunt'], t('freight')))));
}

/** Schnellstart: erste Nahverkehrslinie der ersten Strecke, nächste Abfahrt ab 8 Uhr */
function quickPick(): { route: string; line: string; dep: number; title: string } | null {
  try {
    const route = ROUTES[0].id;
    const lines = (LINES[route] ?? []).filter((l) => l.kind !== 'GZ');
    const L = lines.find((l) => ['RB', 'RE', 'S'].includes(l.kind)) ?? lines[0];
    if (!L) return null;
    const dep = nextDeparture(netOf(route), L, false, 8 * 3600).stops[0].dep ?? 8 * 3600;
    return { route, line: L.id, dep, title: `${L.name} ab ${hhmm(dep)}` };
  } catch { return null; }
}
function quickStart(q: { route: string; line: string; dep: number; title: string }) {
  const player: PlayerSpec = { kind: 'service', line: q.line, back: false, dep: q.dep };
  const weather: Weather = { kind: 'clear', season: 'summer', wind: 3 };
  const start = Math.max(0, q.dep - 45); // kurz vor der Abfahrt: Fahrstraße wird gleich gestellt
  void run({ title: q.title, routeId: q.route, time: start, weather, assist: 'easy', traffic: 1, player, mode: 'drive', allowFreeCam: false, back: menu, scenario: serviceScenario(q.route, q.title) },
    { title: q.title, kind: 'service', routeId: q.route, time: start, weather, assist: 'easy', traffic: 1, player });
}

// „Weiterfahren“: gespeicherte Startdaten der letzten Fahrt
interface RunStub { title: string; kind: 'scenario' | 'free' | 'service' | 'world' | 'box'; id?: string; routeId: string; time: number; weather: Weather; assist: Assist; traffic: number; player: PlayerSpec; boxArea?: string[] }
function resume(r: RunStub) {
  if (r.kind === 'scenario' && r.id && SCENARIO.has(r.id)) { startScenario(SCENARIO.get(r.id)!, menu); return; }
  if (!ROUTE.has(r.routeId)) { toast('Letzte Fahrt nicht mehr verfügbar.', 'warn'); return; }
  const mode: Mode = r.kind === 'world' ? 'world' : r.kind === 'box' ? 'box' : 'drive';
  const sc = r.kind === 'box' ? freeBoxScenario(r.routeId, r.boxArea ?? []) : undefined;
  void run({ title: r.title, routeId: r.routeId, time: r.time, weather: r.weather, assist: r.assist, traffic: r.traffic, player: r.player, scenario: sc, mode, allowFreeCam: mode !== 'drive', back: menu }, r);
}

// ------------------------------------------------------------------ Profile
function profiles() {
  const list = store.profiles();
  screen(header('Profile'),
    h('p', { class: 'muted' }, 'Drei Spielstände. Fortschritt wird automatisch gespeichert.' + (store.persistent ? '' : ' Achtung: kein dauerhafter Speicher verfügbar.')),
    h('div', { class: 'grid' }, ...([0, 1, 2] as const).map((i) => {
      const pr = list[i];
      return h('div', { class: `card${store.activeId === i ? ' sel' : ''}` },
        h('h3', null, pr ? pr.name : `Leer (Platz ${i + 1})`),
        pr ? h('p', { class: 'small muted' }, `${RANKS[pr.career.rank]?.name} · ${pr.career.xp} XP · ${Object.values(pr.scenarios).filter((x) => x.done).length} Szenarien`) : null,
        h('div', { class: 'row' },
          btn(store.activeId === i ? 'Aktiv' : 'Wählen', () => { store.select(i); applySettings(); save(); profiles(); }, 'btn small'),
          pr ? btn('Umbenennen', async () => { const n = prompt('Neuer Name', pr.name); if (n) { store.rename(i, n.slice(0, 24)); save(); profiles(); } }, 'btn small') : null,
          pr ? btn('Zurücksetzen', async () => { if (await dialog('Profil zurücksetzen', `„${pr.name}“ wirklich löschen? Das kann nicht rückgängig gemacht werden.`, ['Löschen', 'Abbrechen']) === 0) { store.reset(i); applySettings(); save(); profiles(); } }, 'btn small') : null));
    })),
    h('h3', null, 'Sichern'),
    h('div', { class: 'row' },
      btn('Spielstand exportieren (JSON)', () => download(`ricorail-spielstand-${new Date().toISOString().slice(0, 10)}.json`, store.exportJSON())),
      btn('Spielstand importieren', () => pickFile((txt) => { const r = store.importJSON(txt); toast(r.msg, r.ok ? 'info' : 'error'); if (r.ok) { applySettings(); profiles(); } }))));
}

function download(name: string, text: string) {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: name });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function pickFile(on: (txt: string) => void) {
  const i = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
  i.addEventListener('change', () => { const f = i.files?.[0]; if (f) void f.text().then(on); i.remove(); });
  document.body.appendChild(i); i.click();
}

// ------------------------------------------------------------------ Freies Fahren
function freeDrive() {
  let route = ROUTES[0].id, form = '', st = '', dest = '', time = 8 * 3600, kind: WeatherKind = 'clear', season: Weather['season'] = 'summer', traffic = 1, assist: Assist = S().assist, cold = false;
  const body = h('div');
  const draw = () => {
    const r = ROUTE.get(route)!; const net = netOf(route);
    const stations = net.def.stations.filter((s) => s.platforms.length && s.kind !== 'depot');
    const forms = r.trains.filter((f) => FORM.has(f));
    if (!forms.includes(form)) form = forms[0];
    if (!stations.some((s) => s.id === st)) st = stations[0]?.id ?? '';
    if (dest && !stations.some((s) => s.id === dest)) dest = '';
    clear(body);
    body.append(
      routeCards(route, (id) => { route = id; draw(); }),
      h('div', { class: 'grid', style: 'margin-top:12px' },
        h('div', null,
          field('Zug', select(forms.map((f) => [f, FORM.get(f)!.name] as [string, string]), form, (v) => { form = v; draw(); })),
          h('p', { class: 'small muted' }, FORM.get(form)?.desc ?? ''),
          field('Start', select(stations.map((s) => [s.id, `${s.name}${s.kind === 'yard' ? ' (Rangierbahnhof)' : s.kind === 'freight' ? ' (Güter)' : ''}`] as [string, string]), st, (v) => { st = v; })),
          field('Ziel (optional, Fahrstraßen werden gestellt)', select([['', '— kein Ziel, frei fahren —'] as [string, string], ...stations.map((s) => [s.id, s.name] as [string, string])], dest, (v) => { dest = v; })),
          h('label', { class: 'row small' }, checkbox(cold, (v) => { cold = v; }), 'Aufrüsten: Fahrzeug startet abgeschaltet')),
        h('div', null, ...envFields(() => ({ time, kind, season, traffic, assist }), (e) => { ({ time, kind, season, traffic, assist } = e); }))),
      h('div', { class: 'row end', style: 'margin-top:12px' }, btn('▶ Losfahren', () => {
        const player: PlayerSpec = { kind: 'free', form, at: { st, plat: 0 }, dest: dest ? { st: dest } : undefined, cold };
        const title = `Freie Fahrt: ${FORM.get(form)!.name}, ${r.name}`;
        void run({ title, routeId: route, time, weather: { kind, season, wind: kind === 'storm' ? 18 : 3 }, assist, traffic, player, mode: 'drive', allowFreeCam: false, back: freeDrive },
          { title, kind: 'free', routeId: route, time, weather: { kind, season, wind: 3 }, assist, traffic, player });
      }, 'btn primary')));
  };
  screen(header(t('free')), body);
  draw();
}

function checkbox(v: boolean, on: (v: boolean) => void) { const c = h('input', { type: 'checkbox', checked: v }); c.addEventListener('change', () => on(c.checked)); return c; }

interface Env { time: number; kind: WeatherKind; season: Weather['season']; traffic: number; assist: Assist }
function envFields(get: () => Env, set: (e: Env) => void) {
  const e = get();
  const upd = (p: Partial<Env>) => { Object.assign(e, p); set(e); };
  const timeIn = h('input', { type: 'time', value: hhmm(e.time), step: '60' });
  timeIn.addEventListener('change', () => { const [a, b] = timeIn.value.split(':').map(Number); if (!isNaN(a)) upd({ time: a * 3600 + (b || 0) * 60 }); });
  return [
    field('Uhrzeit', timeIn),
    field('Wetter', select(Object.entries(WEATHER) as [WeatherKind, string][], e.kind, (v) => upd({ kind: v }))),
    field('Jahreszeit', select(Object.entries(SEASON) as [Weather['season'], string][], e.season, (v) => upd({ season: v }))),
    field('Verkehr', select([['0', 'Kein Verkehr'], ['0.5', 'Wenig'], ['1', 'Normal'], ['1.5', 'Viel']], String(e.traffic) as '0' | '0.5' | '1' | '1.5', (v) => upd({ traffic: Number(v) }))),
    field('Schwierigkeit', select(Object.entries(ASSIST) as [Assist, string][], e.assist, (v) => upd({ assist: v }))),
  ];
}

function routeCards(sel: string, on: (id: string) => void, filter?: (id: string) => boolean) {
  return h('div', { class: 'grid' }, ...ROUTES.filter((r) => !filter || filter(r.id)).map((r) => h('div', {
    class: `card${r.id === sel ? ' sel' : ''}`, role: 'button', tabindex: '0', onclick: () => on(r.id), onkeydown: (e: KeyboardEvent) => { if (e.key === 'Enter') on(r.id); },
  }, h('h3', { style: `color:${r.color}` }, r.name, ROUTE_TAG(r.id)), h('div', { class: 'small muted' }, r.region, ' · ', r.elec, ` · bis ${r.vmax} km/h`), h('p', { class: 'small' }, r.desc))));
}

// ------------------------------------------------------------------ Fahrplanfahrt
function timetableRun() {
  let route = ROUTES[0].id, line = '', back = false, dep = 0, kind: WeatherKind = 'clear', season: Weather['season'] = 'summer', time = 8 * 3600, traffic = 1, assist: Assist = S().assist;
  const body = h('div');
  const draw = () => {
    const net = netOf(route);
    const lines = (LINES[route] ?? []).filter((l) => l.kind !== 'GZ');
    if (!lines.some((l) => l.id === line)) line = lines[0]?.id ?? '';
    const L = lines.find((l) => l.id === line)!;
    if (L.oneWay) back = false;
    const deps: number[] = [];
    let tt = time;
    for (let i = 0; i < 5 && L; i++) { const svc = nextDeparture(net, L, back, tt); const d = svc.stops[0].dep ?? tt; deps.push(d); tt = d + 60; }
    if (!deps.includes(dep)) dep = deps[0];
    const name = (id: string) => net.def.stations.find((s) => s.id === id)?.name ?? id;
    const stops = back ? [...L.stops].reverse() : L.stops;
    clear(body);
    body.append(routeCards(route, (id) => { route = id; draw(); }),
      h('div', { class: 'grid', style: 'margin-top:12px' },
        h('div', null,
          field('Linie', select(lines.map((l) => [l.id, `${l.kind} · ${l.name}`] as [string, string]), line, (v) => { line = v; draw(); })),
          L.oneWay ? null : field('Richtung', select([['0', `nach ${name(L.stops[L.stops.length - 1])}`], ['1', `nach ${name(L.stops[0])}`]], back ? '1' : '0', (v) => { back = v === '1'; draw(); })),
          h('p', { class: 'small muted' }, `${stops.length} Halte: ${stops.map(name).join(' – ')} · Zug: ${FORM.get(L.form)?.name ?? L.form}`),
          field('Abfahrt', select(deps.map((d) => [String(d), hhmm(d)] as [string, string]), String(dep), (v) => { dep = Number(v); }))),
        h('div', null, ...envFields(() => ({ time, kind, season, traffic, assist }), (e) => { const ch = e.time !== time; ({ time, kind, season, traffic, assist } = e); if (ch) draw(); }))),
      h('div', { class: 'row end', style: 'margin-top:12px' }, btn('▶ Dienst antreten', () => {
        const player: PlayerSpec = { kind: 'service', line, back, dep };
        const title = `${L.name} ab ${hhmm(dep)}`;
        const weather = { kind, season, wind: kind === 'storm' ? 18 : 3 };
        const start = Math.max(0, dep - 300);
        void run({ title, routeId: route, time: start, weather, assist, traffic, player, mode: 'drive', allowFreeCam: false, back: timetableRun, scenario: serviceScenario(route, title) },
          { title, kind: 'service', routeId: route, time: start, weather, assist, traffic, player });
      }, 'btn primary')));
  };
  screen(header(t('timetable')), body);
  draw();
}

/** Fahrplanfahrt mit Wertung (Pünktlichkeit, Signale) */
function serviceScenario(route: string, title: string): Scenario {
  return { id: `svc-${route}`, cat: 'pax', title, route, desc: '', time: 0, weather: { kind: 'clear', season: 'summer', wind: 0 }, difficulty: 1, traffic: 1, player: { kind: 'none' }, goals: [{ t: 'timetable', maxLate: 300 }, { t: 'nospad' }, { t: 'doors' }], xp: 40 };
}

// ------------------------------------------------------------------ Szenarien & Karriere
function scenarioList(cats: Scenario['cat'][] | null, title: string, back: () => void = menu) {
  const p = P();
  const groups = (Object.keys(CATS) as Scenario['cat'][]).filter((c) => !cats || cats.includes(c));
  const self = () => scenarioList(cats, title, back);
  screen(header(title, back), ...groups.map((c) => h('div', null, h('h3', null, CATS[c]),
    h('div', { class: 'grid' }, ...SCENARIOS.filter((s) => s.cat === c).map((s) => scenarioCard(s, p, self))))));
}

function scenarioCard(s: Scenario, p: Profile, back: () => void) {
  const rec = p.scenarios[s.id];
  const locked = (s.rank ?? 0) > p.career.rank;
  return h('div', { class: `card${locked ? ' locked' : ''}`, role: 'button', tabindex: '0', onclick: () => (locked ? toast(`Ab Rang „${RANKS[s.rank ?? 0].name}“ – sammle Erfahrung in der Karriere.`, 'warn') : scenarioDetail(s, back)) },
    h('h3', null, `${s.exam ? '🎓 ' : ''}${s.title}`),
    h('div', { class: 'small muted' }, ROUTE.get(s.route)?.name.split(' – ').slice(0, 2).join(' – '), ROUTE_TAG(s.route), ' · ', '●'.repeat(s.difficulty) + '○'.repeat(3 - s.difficulty)),
    h('div', { class: 'stars', style: 'font-size:1em' }, rec ? '★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars) : locked ? '🔒' : ''));
}

function scenarioDetail(s: Scenario, back: () => void) {
  const rec = P().scenarios[s.id];
  const goals = s.goals.map((g) => goalLabel(g));
  screen(header(s.title, back),
    h('div', { class: 'panel' },
      h('p', null, s.desc),
      h('p', { class: 'small muted' }, `${ROUTE.get(s.route)?.name} · ${hhmm(s.time)} Uhr · ${WEATHER[s.weather.kind]}, ${SEASON[s.weather.season]}`),
      h('h3', null, 'Ziele'), h('ul', null, ...goals.map((g) => h('li', null, g))),
      s.faults?.length ? h('p', { class: 'small muted' }, 'Es können Störungen auftreten.') : null,
      rec ? h('p', null, `Bestes Ergebnis: ${rec.best} Punkte `, h('span', { class: 'stars' }, '★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars))) : null,
      h('div', { class: 'row end' }, btn('▶ Starten', () => startScenario(s, back), 'btn primary'))));
}

function goalLabel(g: Scenario['goals'][number]): string {
  switch (g.t) {
    case 'timetable': return `Fahrplan einhalten (höchstens ${Math.round(g.maxLate / 60)} min Verspätung)`;
    case 'reach': return 'Ziel erreichen';
    case 'deliver': return `${g.n} Wagen zustellen`;
    case 'load': return `${g.n} Wagen beladen`;
    case 'couple': return `Zug auf ${g.n} Fahrzeuge kuppeln`;
    case 'park': return `${g.n} Wagen abstellen`;
    case 'box': return `${g.trains} Züge durchs Stellwerk leiten (höchstens ${Math.round(g.maxLate / 60)} min Verspätung)`;
    case 'nospad': return 'Kein Halt zeigendes Signal überfahren';
    case 'nooverspeed': return 'Geschwindigkeit einhalten';
    case 'comfort': return `Fahrkomfort mindestens ${g.min} %`;
    case 'energy': return `höchstens ${g.maxKWh} kWh Energie`;
    case 'timeLimit': return `Zeitlimit ${Math.round(g.s / 60)} min`;
    case 'precise': return `Zielgenau halten (± ${g.maxDist} m)`;
    case 'doors': return 'An jedem Halt die Türen freigeben';
  }
}

function startScenario(s: Scenario, back: () => void) {
  const mode: Mode = s.player.kind === 'box' ? 'box' : s.player.kind === 'none' ? 'world' : 'drive';
  void run({ title: s.title, routeId: s.route, time: s.time, weather: s.weather, assist: s.assist ?? S().assist, traffic: s.traffic, player: s.player, scenario: s, mode, allowFreeCam: mode !== 'drive', autoDispatch: s.player.kind === 'box' ? undefined : undefined, back },
    { title: s.title, kind: 'scenario', id: s.id, routeId: s.route, time: s.time, weather: s.weather, assist: s.assist ?? S().assist, traffic: s.traffic, player: s.player });
}

function career() {
  const p = P(), c = p.career;
  const next = RANKS[c.rank + 1];
  const exam = EXAM_FOR_RANK[c.rank + 1];
  const examSc = exam ? SCENARIO.get(exam) : undefined;
  const examDone = !exam || c.exams.includes(exam);
  const prev = RANKS[c.rank].xp;
  const f = next ? Math.min(1, (c.xp - prev) / (next.xp - prev)) : 1;
  const avail = SCENARIOS.filter((s) => (s.rank ?? 0) <= c.rank && !s.exam && !p.scenarios[s.id]?.done).slice(0, 6);
  screen(header(t('career')),
    h('div', { class: 'panel', style: 'max-width:none' },
      h('h3', null, RANKS[c.rank].name), h('div', { class: 'bar' }, h('i', { style: `width:${Math.round(f * 100)}%` })),
      h('p', { class: 'small muted' }, next ? `${c.xp} / ${next.xp} Erfahrung bis „${next.name}“${exam ? ` · Prüfung: ${examDone ? 'bestanden ✔' : examSc?.title ?? exam}` : ''}` : `${c.xp} Erfahrung – höchster Rang erreicht`),
      c.exams.length ? h('p', { class: 'small' }, 'Bestandene Prüfungen: ', c.exams.map((e) => SCENARIO.get(e)?.title ?? e).join(', ')) : null,
      examSc && !examDone && c.xp >= (next?.xp ?? Infinity) * 0.6 ? h('div', { class: 'row' }, btn(`🎓 Prüfung starten: ${examSc.title}`, () => scenarioDetail(examSc, career), 'btn primary')) : examSc && !examDone ? h('p', { class: 'small muted' }, 'Die Prüfung wird freigeschaltet, sobald du 60 % der nötigen Erfahrung hast.') : null),
    h('h3', null, 'Empfohlene Aufträge'), h('div', { class: 'grid' }, ...avail.map((s) => scenarioCard(s, p, career))),
    h('div', { class: 'row', style: 'margin-top:12px' }, btn('Alle Szenarien', () => scenarioList(null, t('scenarios'), career))),
    h('p', { class: 'notice' }, 'Ränge, Prüfungen und Fahrerlaubnisse sind Spielelemente und keine echte Qualifikation.'));
}

// ------------------------------------------------------------------ Stellwerk & freie Welt
function freeBoxScenario(route: string, area: string[]): Scenario {
  return { id: `box-${route}`, cat: 'box', title: 'Freies Stellwerk', route, desc: '', time: 0, weather: { kind: 'clear', season: 'summer', wind: 0 }, difficulty: 1, traffic: 1, player: { kind: 'box' }, goals: [], boxArea: area };
}

function boxMenu() {
  let route = 'f1', st = '', time = 7 * 3600, kind: WeatherKind = 'clear', season: Weather['season'] = 'summer', traffic = 1, assist: Assist = S().assist;
  const body = h('div');
  const draw = () => {
    const net = netOf(route);
    const stations = net.def.stations.filter((s) => s.platforms.length >= 2);
    if (!stations.some((s) => s.id === st)) st = stations[0]?.id ?? '';
    clear(body);
    body.append(
      h('h3', null, 'Stellwerks-Szenarien'), h('div', { class: 'grid' }, ...SCENARIOS.filter((s) => s.cat === 'box').map((s) => scenarioCard(s, P(), boxMenu))),
      h('h3', null, 'Freies Stellwerk'), routeCards(route, (id) => { route = id; draw(); }),
      h('div', { class: 'grid', style: 'margin-top:12px' },
        h('div', null, field('Bahnhof', select(stations.map((s) => [s.id, s.name] as [string, string]), st, (v) => { st = v; })),
          h('p', { class: 'small muted' }, 'Die Hauptsignale rund um diesen Bahnhof stellst du selbst; der übrige Bereich läuft automatisch.')),
        h('div', null, ...envFields(() => ({ time, kind, season, traffic, assist }), (e) => { ({ time, kind, season, traffic, assist } = e); }))),
      h('div', { class: 'row end', style: 'margin-top:12px' }, btn('▶ Dienst im Stellwerk', () => {
        const title = `Stellwerk ${net.def.stations.find((s) => s.id === st)?.name}`;
        const weather = { kind, season, wind: 3 };
        void run({ title, routeId: route, time, weather, assist, traffic, player: { kind: 'box' }, scenario: freeBoxScenario(route, [st]), mode: 'box', allowFreeCam: true, back: boxMenu },
          { title, kind: 'box', routeId: route, time, weather, assist, traffic, player: { kind: 'box' }, boxArea: [st] });
      }, 'btn primary')));
  };
  screen(header(t('box')), body);
  draw();
}

function worldMenu(preset?: string) {
  let route = preset ?? 'f1', time = 9 * 3600, kind: WeatherKind = 'clear', season: Weather['season'] = 'summer', traffic = 1.5, assist: Assist = S().assist;
  const body = h('div');
  const draw = () => {
    clear(body);
    body.append(routeCards(route, (id) => { route = id; draw(); }),
      h('div', { class: 'grid', style: 'margin-top:12px' }, h('div', null, ...envFields(() => ({ time, kind, season, traffic, assist }), (e) => { ({ time, kind, season, traffic, assist } = e); })),
        h('p', { class: 'small muted' }, 'Alle Züge fahren nach Fahrplan. Kameras: C oder 1–7, freie Kamera mit W/A/S/D. Zeitraffer mit Tab.')),
      h('div', { class: 'row end', style: 'margin-top:12px' }, btn('▶ Welt betreten', () => {
        const title = `Eisenbahnwelt: ${ROUTE.get(route)!.name}`;
        const weather = { kind, season, wind: kind === 'storm' ? 18 : 3 };
        void run({ title, routeId: route, time, weather, assist, traffic, player: { kind: 'none' }, mode: 'world', allowFreeCam: true, back: () => worldMenu(route) },
          { title, kind: 'world', routeId: route, time, weather, assist, traffic, player: { kind: 'none' } });
      }, 'btn primary')));
  };
  screen(header(t('world')), body);
  draw();
}

// ------------------------------------------------------------------ Bahngesellschaft
function tycoon() {
  const p = P();
  let c = Ty.loadCompany(p.company);
  if (!c) { c = Ty.newCompany(`${p.name}-Bahn`); p.company = c; save(); }
  const co = c;
  const info = (key: string) => { const [r] = key.split(':'); const l = Ty.findLine(key)!; return Ty.lineInfo(netOf(r), l); };
  const commit = (msg?: string) => { p.company = co; save(); if (msg) toast(msg, 'warn'); tycoon(); };
  const days = (n: number) => { let rev = 0, cost = 0; const notes: string[] = []; for (let i = 0; i < n; i++) { const l = Ty.simulateDay(co, info); rev += l.revenue; cost += l.cost; if (l.note) notes.push(l.note); } p.company = co; save(); toast(`${n} Tag(e): Einnahmen ${Ty.money(rev)}, Kosten ${Ty.money(cost)}${notes.length ? ' · ' + notes[notes.length - 1] : ''}`, rev >= cost ? 'info' : 'warn', 6000); tycoon(); };
  const lineOpts = (form: string): [string, string][] => [['', '— im Depot —'], ...co.routes.flatMap((r) => (LINES[r] ?? []).filter((l) => !Ty.canServe(FORM.get(form)!, r, l)).map((l) => [`${r}:${l.id}`, `${ROUTE.get(r)!.name.split(' – ')[0]}: ${l.name}`] as [string, string]))];
  const last = co.log[co.log.length - 1];
  screen(header(t('tycoon')),
    h('div', { class: 'panel', style: 'max-width:none' },
      h('div', { class: 'row' }, h('b', null, co.name), h('span', { class: 'spacer' }), h('span', null, `Tag ${co.day}`), h('span', null, `Kasse ${Ty.money(co.money)}`), h('span', null, `Ruf ${Math.round(co.rep)} %`)),
      last ? h('p', { class: 'small muted' }, `Letzter Tag: Einnahmen ${Ty.money(last.revenue)}, Kosten ${Ty.money(last.cost)}, ${last.pax.toLocaleString('de-DE')} Fahrgäste, ${last.tons.toLocaleString('de-DE')} t Güter`) : h('p', { class: 'small muted' }, 'Kaufe einen Zug, weise ihm eine Linie zu und simuliere dann Betriebstage.'),
      h('div', { class: 'row' }, btn('▶ 1 Tag', () => days(1), 'btn primary'), btn('▶▶ 7 Tage', () => days(7)), co.money < 0 ? h('span', { class: 'tag', style: 'background:#5a1a1a;color:#ffb3b3' }, 'Konto im Minus!') : null)),
    h('h3', null, `Fuhrpark (${co.trains.length})`),
    co.trains.length ? h('table', { class: 't' }, ...co.trains.map((tr) => h('tr', null,
      h('td', null, tr.id), h('td', null, FORM.get(tr.form)!.name), h('td', { class: 'small muted' }, `${Math.round(tr.km).toLocaleString('de-DE')} km · ${tr.age} Tage`),
      h('td', null, select(lineOpts(tr.form), tr.line ?? '', (v) => commit(Ty.assign(co, tr.id, v || null) || undefined))),
      h('td', null, btn('Verkaufen', () => { const v = Ty.sellTrain(co, tr.id); toast(`Verkauft für ${Ty.money(v)}`); commit(); }, 'btn small'))))) : h('p', { class: 'muted' }, 'Noch keine Fahrzeuge.'),
    h('h3', null, 'Fahrzeuge kaufen'),
    h('div', { class: 'grid' }, ...FORMATIONS.map((f) => h('div', { class: 'card' }, h('b', null, f.name), h('div', { class: 'small muted' }, `${Ty.money(Ty.formPrice(f))} · ${Ty.formSeats(f) ? `${Ty.formSeats(f)} Plätze` : Ty.formPayload(f) ? `${Ty.formPayload(f)} t Nutzlast` : 'Lok'}`),
      h('div', { class: 'row', style: 'margin-top:6px' }, btn('Kaufen', () => commit(Ty.buyTrain(co, f.id) || undefined), 'btn small'))))),
    h('h3', null, 'Strecken'),
    h('div', { class: 'grid' }, ...ROUTES.map((r) => h('div', { class: 'card' }, h('b', null, r.name), ROUTE_TAG(r.id),
      h('div', { class: 'row', style: 'margin-top:6px' }, co.routes.includes(r.id)
        ? [h('span', { class: 'small' }, '✔ Nutzungsrecht'), btn('In 3D ansehen', () => worldMenu(r.id), 'btn small')] as unknown as HTMLElement
        : btn(`Nutzungsrecht ${Ty.money(Ty.ROUTE_PRICE[r.id])}`, () => commit(Ty.buyRoute(co, r.id) || undefined), 'btn small'))))),
    h('div', { class: 'row', style: 'margin-top:14px' }, btn('Firma neu gründen', async () => { if (await dialog('Neu gründen', 'Alle Fahrzeuge, Strecken und das Geld gehen verloren.', ['Neu gründen', 'Abbrechen']) === 0) { p.company = Ty.newCompany(`${p.name}-Bahn`); save(); tycoon(); } }, 'btn small')),
    h('p', { class: 'notice' }, 'Wirtschaftssimulation als Spielmodell mit fiktiver Währung (RicoTaler). Keine echten Preise, keine Käufe mit Echtgeld.'));
}

// ------------------------------------------------------------------ Editor
let editorInst: TrackEditor | null = null;
function editor(def?: NetworkDef) {
  clear(ui); canvas.style.visibility = 'hidden';
  const host = h('div', { class: 'screen', style: 'padding:0' }); ui.appendChild(host);
  editorInst?.dispose();
  editorInst = new TrackEditor(host, {
    store,
    onClose: () => { editorInst?.dispose(); editorInst = null; menu(); },
    onTestDrive: (d) => {
      const copy: NetworkDef = JSON.parse(JSON.stringify(d));
      editorInst?.dispose(); editorInst = null;
      const st = copy.stations.find((s) => s.platforms.length);
      const player: PlayerSpec = st ? { kind: 'free', form: copy.world === 'fantasy' ? 'dmu1' : 'dmu1', at: { st: st.id, plat: 0 } } : { kind: 'none' };
      void run({ title: `Testfahrt: ${copy.name}`, routeId: copy.id, def: copy, time: 10 * 3600, weather: { kind: 'clear', season: 'summer', wind: 2 }, assist: 'easy', traffic: 0, player, mode: st ? 'drive' : 'world', allowFreeCam: true, back: () => editor(copy) });
    },
  });
  editorInst.open(def);
}

// ------------------------------------------------------------------ Einstellungen
function settingsScreen(back: () => void, inGame = false) {
  const s = S();
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { s[k] = v; applySettings(); save(); };
  const vol = (k: keyof Settings['volume'], label: string) => {
    const r = h('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(s.volume[k]) });
    r.addEventListener('input', () => { s.volume[k] = Number(r.value); if (audio.ready) audio.setVolumes(s.volume); });
    r.addEventListener('change', () => save());
    return field(label, r);
  };
  const scale = h('input', { type: 'range', min: '0.85', max: '1.4', step: '0.05', value: String(s.textScale) });
  scale.addEventListener('change', () => set('textScale', Number(scale.value)));
  const chk = (k: 'invertLook' | 'announcements' | 'subtitles' | 'colorblind' | 'reducedMotion', label: string) => h('label', { class: 'row small', style: 'margin:6px 0' }, checkbox(s[k], (v) => set(k, v)), label);
  const el = (inGame ? overlayScreen : screen)(header(t('settings'), back),
    h('div', { class: 'grid' },
      h('div', null, h('h3', null, 'Grafik'),
        field('Qualität', select([['auto', 'Automatisch'], ['low', 'Niedrig (schwache Handys)'], ['mid', 'Mittel'], ['high', 'Hoch']], s.quality, (v) => set('quality', v))),
        field('Bildrate begrenzen', select([['60', '60 FPS'], ['30', '30 FPS (Akku sparen)'], ['0', 'Unbegrenzt']], String(s.fpsCap) as '60' | '30' | '0', (v) => set('fpsCap', Number(v) as Settings['fpsCap']))),
        h('p', { class: 'small muted' }, inGame ? 'Qualitätsänderungen gelten ab der nächsten Fahrt.' : '')),
      h('div', null, h('h3', null, 'Ton'), vol('master', 'Gesamt'), vol('train', 'Zug'), vol('env', 'Umgebung'), vol('ui', 'Bedienung'), vol('voice', 'Ansagen'), chk('announcements', 'Haltestellenansagen')),
      h('div', null, h('h3', null, 'Steuerung'),
        field('Bedienung', select([['simple', 'Einfach (nur Hebel, Rest automatisch)'], ['real', 'Realistisch (Wender, Türen, PZB selbst)']], s.controls, (v) => set('controls', v))),
        field('Schwierigkeit (neue Fahrten)', select(Object.entries(ASSIST) as [Assist, string][], s.assist, (v) => set('assist', v))),
        field('Touch-Hebel', select([['right', 'Rechts'], ['left', 'Links']], s.touchLayout, (v) => set('touchLayout', v))),
        field('Anzeige', select([['full', 'Vollständig'], ['minimal', 'Reduziert']], s.hud, (v) => set('hud', v))),
        chk('invertLook', 'Umsehen vertikal umkehren')),
      h('div', null, h('h3', null, 'Barrierefreiheit & Sprache'),
        field('Textgröße', scale), chk('subtitles', 'Untertitel für Ansagen'), chk('colorblind', 'Farbenblind-Modus (Fahrt-Signal blau)'), chk('reducedMotion', 'Weniger Bewegung'),
        field('Sprache', select([['de', 'Deutsch'], ['en', 'English (teilweise)']], s.lang, (v) => { set('lang', v); if (!inGame) settingsScreen(back); })))));
  return el;
}

function overlayScreen(...kids: (HTMLElement | string | null | false)[]) {
  const el = h('div', { class: 'screen clear', style: 'z-index:60' }, h('div', { class: 'wrap' }, ...kids));
  ui.appendChild(el);
  return el;
}

// ------------------------------------------------------------------ Handbuch & Lizenzen
function manual() {
  const sec = (title: string, ...p: string[]) => h('div', { class: 'panel', style: 'max-width:none;margin-bottom:10px' }, h('h3', null, title), ...p.map((x) => h('p', null, x)));
  screen(header(t('manual')),
    sec('Erste Fahrt', 'Wähle „Freies Fahren“ oder eine Fahrplanfahrt. Richtungswender nach vorn (R), Bremse lösen (Q), dann Fahrhebel nach vorn (W). Bremsen mit S (Hebel zurück) oder E (Führerbremsventil). Auf dem Handy ziehst du den Hebel am Bildschirmrand.',
      'Halte an jedem Bahnsteig, gib die Türen auf der Bahnsteigseite frei (T) und schließe sie vor der Abfahrt (⇧T). Die Uhr und dein Fahrplan stehen oben rechts.'),
    sec('Signale und Zugsicherung', 'Rot heißt Halt, Gelb kündigt Halt oder eine Langsamfahrt an, Grün heißt Fahrt. Die PZB-Nachbildung verlangt am Vorsignal eine Wachsam-Bestätigung (V); sonst bremst der Zug zwangsweise. Die Sifa will regelmäßig bestätigt werden.',
      'Bei einer Signalstörung kannst du im Stillstand vor dem Signal das Ersatzsignal anfordern (Z). Danach gilt bis zum nächsten Signal höchstens 40 km/h.',
      'Alle Sicherungssysteme sind vereinfachte Spielmodelle, nicht zertifiziert und nicht sicherheitsrelevant.'),
    sec('Güterverkehr und Rangieren', 'An Ladestellen beladen (N) oder entladen (⇧N), wenn der Zug steht. Kuppeln: langsam an den Wagen heranfahren (K vorher aktiviert die Kupplung). Entkuppeln (J) fragt, hinter welchem Fahrzeug getrennt wird. Rangierfahrt (A) begrenzt auf 25 km/h.'),
    sec('Stellwerk', 'Tippe ein Startsignal und dann ein Zielsignal an. Die Fahrstraße wird nur eingestellt, wenn alle Weichen und Gleise frei sind. Antippen des Startsignals nimmt sie zurück. Halte die Verspätungen klein.'),
    sec('Bahngesellschaft', 'Kaufe Züge, weise sie Linien zu und simuliere Betriebstage. Einnahmen hängen von Linienlänge, Halten, Kapazität und Ruf ab; Kosten von Energie, Trassen und Wartung.'),
    sec('Strecken-Editor', 'Gleise zeichnen, Weichen, Signale und Bahnhöfe setzen, prüfen lassen, speichern (auf dem Gerät), als JSON exportieren und direkt probefahren.'),
    sec('Spielstände', 'Drei Profile, automatische Speicherung mit Prüfung beim Schreiben. Über „Profil“ kannst du Spielstände als Datei sichern und wieder einlesen.'));
}

function credits() {
  screen(header(t('credits')),
    h('div', { class: 'panel', style: 'max-width:none' },
      h('p', null, h('b', null, 'RicoRail Simulator 3D'), ` ${VERSION} – ein Easygames-Spiel.`),
      h('p', null, 'Alle Fahrzeuge, Führerstände, Landschaften, Geräusche und Ansagen sind eigene, prozedural erzeugte Inhalte. Es wurden keine Modelle, Logos, Ansagen, Geräusche oder Karten kommerzieller Simulatoren oder Bahnunternehmen übernommen.'),
      h('p', null, 'Die realen Strecken sind vereinfacht nachgebildet: Bahnhofsnamen und ungefähre Lage sind öffentlich bekannte geografische Fakten; Gleispläne, Signale, Höhen und Fahrpläne sind frei gestaltet.'),
      h('p', null, 'Verwendete Software: three.js (MIT-Lizenz, © three.js authors). Gebaut mit TypeScript und esbuild.'),
      h('p', { class: 'notice' }, 'Simulation, kein offizielles Produkt der Deutschen Bahn oder anderer Eisenbahnunternehmen. Fahrzeugnamen sind Fantasienamen.')));
}

// ------------------------------------------------------------------ Fahrt starten
async function run(cfg: RunCfg, stub?: RunStub) {
  if (stub) { P().resume = stub; save(); }
  clear(ui); canvas.style.visibility = 'visible';
  const bar = h('i');
  const label = h('div', { class: 'muted' }, 'Strecke wird aufgebaut …');
  const load = h('div', { class: 'loading', role: 'progressbar', 'aria-label': 'Ladefortschritt' }, h('div', { class: 'logo', style: 'font-size:1.3em' }, cfg.title), h('div', { class: 'bar' }, bar), label,
    h('div', { class: 'small muted', style: 'max-width:80vw;text-align:center' }, tip()));
  ui.appendChild(load);
  const prog = (f: number, txt?: string) => { bar.style.width = `${Math.round(f * 100)}%`; if (txt) label.textContent = txt; };
  const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  try {
    await frame();
    const def = cfg.def ?? routeNet(cfg.routeId);
    prog(0.05, 'Fahrplan und Verkehr …');
    await frame();
    const s = new Session({ def, routeId: cfg.routeId, time: cfg.time, weather: cfg.weather, assist: cfg.assist, traffic: cfg.traffic, player: cfg.player, scenario: cfg.scenario, autoDispatch: cfg.autoDispatch });
    await s.prerun(cfg.traffic > 0 ? 900 : 5, (f) => prog(0.05 + 0.5 * f));
    if (cfg.player.kind === 'service' || cfg.player.kind === 'free') {
      const p = s.spawnPlayer();
      if (!p) throw new Error('Der Zug konnte nicht aufgegleist werden (Gleis belegt oder Start ungültig). Bitte anderen Start oder andere Uhrzeit wählen.');
    }
    prog(0.6, 'Landschaft wird erzeugt …');
    await frame();
    const g = new Game(canvas, ui, s, {
      settings: S(), audio,
      exit: (res, again) => finish(cfg, s, res, again),
      openSettings: (onClose) => settingsScreen(() => { document.querySelectorAll('.screen.clear').forEach((e) => e.remove()); onClose(); }, true),
    }, { title: cfg.title, mode: cfg.mode, allowFreeCam: cfg.allowFreeCam });
    game = g;
    if (location.search.includes('debug')) (window as unknown as { rrGame?: Game }).rrGame = g; // nur für Tests
    for (let i = 0; i < 60; i++) { const pr = g.warmup(3); prog(0.6 + 0.4 * pr); await frame(); if (pr >= 0.999) break; }
    load.remove();
    g.start();
    if (cfg.mode === 'drive' && !matchMedia('(pointer: coarse)').matches) toast('F1 = Hilfe & Tasten · Esc = Pause', 'info', 5000);
  } catch (e) {
    console.error(e);
    load.remove(); game?.dispose(); game = null;
    await dialog('Fahrt konnte nicht gestartet werden', String((e as Error)?.message ?? e), ['Zurück']);
    cfg.back();
  }
}

function tip() {
  const tips = ['Tipp: Im Gefälle früh bremsen – lange Güterzüge reagieren verzögert.', 'Tipp: Bei nasser Schiene sanft anfahren und sanden (G).', 'Tipp: Doppeltippen setzt den Blick im Führerstand zurück.', 'Tipp: Mit M öffnest du den Gleisplan.', 'Tipp: Tab schaltet den Zeitraffer um.', 'Tipp: F8 zeigt eine Wiederholung der letzten Minute.'];
  return tips[Math.floor(Math.random() * tips.length)];
}

function finish(cfg: RunCfg, s: Session, res: Result | null, again?: boolean) {
  game = null;
  const p = P();
  // Statistik
  if (s.player) { p.stats.km += Math.abs(s.player.odo) / 1000; p.stats.trains++; }
  p.stats.hours += Math.max(0, s.world.time - cfg.time) / 3600;
  if (res && cfg.scenario && SCENARIO.has(cfg.scenario.id)) {
    const sc = cfg.scenario;
    const rec = p.scenarios[sc.id];
    const first = res.ok && !rec?.done;
    p.scenarios[sc.id] = { best: Math.max(rec?.best ?? 0, res.ok ? res.score : 0), stars: Math.max(rec?.stars ?? 0, res.ok ? res.stars : 0), done: !!rec?.done || res.ok, time: Date.now() };
    const xp = res.ok ? (first ? res.xp : Math.round(res.xp * 0.2)) : 0;
    p.career.xp += xp;
    if (res.ok && sc.exam && !p.career.exams.includes(sc.id)) { p.career.exams.push(sc.id); toast(`Prüfung bestanden: ${sc.title}`, 'info', 6000); }
    // Rangaufstieg: Erfahrung + Prüfung
    while (RANKS[p.career.rank + 1] && p.career.xp >= RANKS[p.career.rank + 1].xp && (!EXAM_FOR_RANK[p.career.rank + 1] || p.career.exams.includes(EXAM_FOR_RANK[p.career.rank + 1]))) {
      p.career.rank++; p.career.licences.push(RANKS[p.career.rank].name);
      toast(`Neuer Rang: ${RANKS[p.career.rank].name}!`, 'info', 7000);
    }
  } else if (res?.ok && cfg.scenario) p.career.xp += Math.round(res.xp * 0.5);
  save();
  if (again) { void run(cfg); return; }
  clear(ui);
  cfg.back();
}

void boot();
