import { h } from '../dom';
import type { App, RouteParams, ScreenView } from '../../app/app';
import { ITEMS, EVENTS } from '@shared/core/items';
import { ALTAR_COST, GATE_TOLL, MAX_ITEMS, MAX_PLAYERS, MIN_PLAYERS, START_COINS } from '@shared/core/types';
import { NODE_KINDS, type NodeKind } from '@shared/levels/types';
import { MINIGAMES } from '@shared/minigames/registry';
import type { MiniGameCategory } from '@shared/minigames/types';
import { header } from './common';

const NODE_INFO: Record<NodeKind, { icon: string; name: string; text: string }> = {
  start: { icon: '🏁', name: 'Startfeld', text: 'Hier beginnen alle. Das Feld hat keinen Effekt.' },
  glimmer: { icon: '✨', name: 'Glimmer-Feld', text: 'Du bekommst 3 Glimmer.' },
  thorn: { icon: '🌵', name: 'Dornenfeld', text: 'Du verlierst 3 Glimmer (höchstens so viele, wie du hast). Der Phasenmantel schützt dich.' },
  event: { icon: '❓', name: 'Ereignisfeld', text: 'Ein zufälliges Ereignis trifft dich (siehe „Ereignisse“).' },
  item: { icon: '🎁', name: 'Gegenstandsfeld', text: 'Du bekommst einen zufälligen Gegenstand geschenkt.' },
  shop: { icon: '🛒', name: 'Laden', text: 'Hier musst du anhalten. Der Laden bietet drei zufällige Gegenstände zum Kauf an.' },
  portal: { icon: '🌀', name: 'Portal', text: 'Teleportiert dich zum Partner-Portal des Bretts.' },
  gate: { icon: '🌉', name: 'Mautbrücke', text: `Zum Überqueren zahlst du ${GATE_TOLL} Glimmer oder gibst ein Schlüsselfragment ab. Hast du beides nicht, bleibst du davor stehen.` },
  chaos: { icon: '🎭', name: 'Chaos-Feld', text: 'Du tauschst den Platz mit einem zufälligen Mitspieler. Der Phasenmantel und das Schutzschild verhindern das.' },
};

const CATEGORY: Record<MiniGameCategory, string> = {
  reaction: 'Reaktion', race: 'Rennen', platform: 'Hüpfen & Geschick', collect: 'Sammeln', memory: 'Gedächtnis', rhythm: 'Rhythmus', survival: 'Überleben', physics: 'Physik', aim: 'Zielen', puzzle: 'Rätsel',
};

const ul = (items: string[]): HTMLElement => h('ul', null, ...items.map((i) => h('li', null, i)));
const p = (text: string): HTMLElement => h('p', null, text);

type Tab = { id: string; label: string; build: () => HTMLElement[] };

const TABS: Tab[] = [
  {
    id: 'ziel',
    label: 'Ziel',
    build: () => [
      h('h3', null, 'Sammle Siegpunkt-Splitter'),
      p(`Alle starten mit ${START_COINS} Glimmer. Auf dem Brett steht der Chrono-Altar. Wer ihn erreicht und mindestens ${ALTAR_COST} Glimmer hat, kann dafür einen Zeitsplitter kaufen. Jeder Splitter ist ein Siegpunkt.`),
      p('Nach dem Kauf springt der Altar an einen neuen Ort. Er hält dich auch im Vorbeilaufen an, sobald du ihn betrittst und genug Glimmer hast.'),
      h('h3', null, 'Das Finale'),
      p('Nach der letzten Runde gibt es drei Bonus-Splitter. Bei Gleichstand bekommen alle Gleichauf-Liegenden den Splitter:'),
      ul(['Die meisten gewonnenen Minispiele', 'Die meisten Glimmer', 'Die meisten erlebten Ereignisse']),
      p('Wer danach die meisten Splitter hat, gewinnt. Bei Gleichstand entscheiden die Glimmer, dann die gewonnenen Minispiele.'),
      p(`Es spielen ${MIN_PLAYERS} bis ${MAX_PLAYERS} Spieler, Bots können fehlende Plätze füllen.`),
    ],
  },
  {
    id: 'zug',
    label: 'Zugablauf',
    build: () => [
      h('h3', null, 'Eine Runde'),
      ul([
        'Zu Beginn wird die Zugreihenfolge ausgewürfelt.',
        'Wer dran ist, kann vor dem Würfeln einen Gegenstand einsetzen.',
        'Dann würfelst du (1 bis 6) und läufst so viele Felder weit. An Abzweigungen wählst du den Weg.',
        'Das Feld, auf dem du stehen bleibst, wirkt (siehe „Felder“).',
        'Haben alle gezogen, spielen alle ein Minispiel um Glimmer. Dann beginnt die nächste Runde.',
      ]),
      h('h3', null, 'Gedränge auf dem Brett'),
      ul([
        'Überholen: Wer an einem Gegner vorbeizieht, schnappt sich 1 Glimmer von ihm.',
        'Rempler: Wer auf dem Feld eines Gegners landet, schnappt sich 2 Glimmer.',
        `Du kannst höchstens ${MAX_ITEMS} Gegenstände tragen. Ist dein Beutel voll, gibt es für einen weiteren Fund stattdessen 4 Glimmer.`,
      ]),
      h('h3', null, 'Minispiel-Belohnungen'),
      ul(['Zu zweit: 8 und 3 Glimmer', 'Zu dritt: 10, 5 und 2 Glimmer', 'Zu viert: 10, 6, 3 und 1 Glimmer', 'Teamrunde (nur zu viert, manchmal): Siegerteam 8, bei Gleichstand 5, Verlierer 2 Glimmer pro Spieler']),
    ],
  },
  {
    id: 'felder',
    label: 'Felder',
    build: () => [h('div', { class: 'list' }, ...NODE_KINDS.map((k) => h('div', { class: 'card' }, h('h4', null, `${NODE_INFO[k].icon} ${NODE_INFO[k].name}`), p(NODE_INFO[k].text))))],
  },
  {
    id: 'items',
    label: 'Gegenstände',
    build: () => [
      p(`Du kannst bis zu ${MAX_ITEMS} Gegenstände tragen. Im Laden kosten sie Glimmer; „Aktiv“ heißt, du setzt sie selbst vor dem Würfeln ein.`),
      h('div', { class: 'cols' }, ...Object.values(ITEMS).map((it) => h('div', { class: 'card' }, h('h4', null, `${it.icon} ${it.name}`), p(it.description), h('p', null, h('span', { class: 'badge' }, `${it.cost} Glimmer`), ' ', h('span', { class: 'badge' }, it.active ? 'Aktiv' : 'Automatisch'), it.needsTarget ? h('span', { class: 'badge' }, 'Ziel nötig') : null)))),
    ],
  },
  {
    id: 'events',
    label: 'Ereignisse',
    build: () => [p('Auf Ereignisfeldern passiert etwas Zufälliges:'), h('div', { class: 'list' }, ...Object.values(EVENTS).map((e) => h('div', { class: 'card' }, h('h4', null, `${e.icon} ${e.name}`, ' ', h('span', { class: 'badge' }, e.good ? 'Glück' : 'Pech')), p(e.text))))],
  },
  {
    id: 'faltung',
    label: '4D-Faltung',
    build: () => [
      p('Auf vielen Brettern sind manche Wege nur in bestimmten Runden begehbar. Das Brett „faltet“ sich: Jede Runde gehört zu einer Faltungsphase, und nur Wege, die zu dieser Phase gehören, kannst du betreten.'),
      ul(['Die Phase wechselt mit jeder neuen Runde und beginnt nach der letzten Phase wieder von vorn.', 'Das Ereignis „Raumfaltung“ schiebt die Phase sofort weiter.', 'Plane voraus: Ein Weg, der jetzt offen ist, kann nächste Runde fehlen.']),
    ],
  },
  {
    id: 'minigames',
    label: 'Minispiele',
    build: () => [
      p(`${MINIGAMES.length} Minispiele mit zufälliger Auswahl. Alle spielen gleichzeitig dasselbe Spiel; der Beste bekommt die meisten Glimmer.`),
      h('div', { class: 'cols' }, ...MINIGAMES.map((g) => h('div', { class: 'card' }, h('h4', null, g.name), p(g.tagline), h('p', null, h('span', { class: 'badge' }, CATEGORY[g.category] ?? g.category)), p('Tastatur/Maus: ' + g.controls.desktop), p('Touch: ' + g.controls.touch)))),
    ],
  },
  {
    id: 'steuerung',
    label: 'Steuerung',
    build: () => [
      h('h3', null, 'Maus und Tastatur'),
      ul(['Schaltflächen und Felder per Mausklick wählen.', 'Minispiele: Pfeiltasten oder WASD zum Bewegen, Leertaste oder Enter für Aktion A, Umschalt oder X für Aktion B.', 'Spiele mit Zeigersteuerung nutzen die Maus.']),
      h('h3', null, 'Touch'),
      ul(['Tippe auf Schaltflächen und Felder.', 'Minispiele zeigen links einen Stick und rechts die Aktionsknöpfe A und B, wo sie gebraucht werden.', 'In den Optionen kannst du die Touch-Steuerung erzwingen oder abschalten.']),
      h('h3', null, 'Gemeinsam an einem Gerät'),
      p('Im Hotseat-Modus reichen sich die Spieler das Gerät weiter. Bei Minispielen bestätigt jeder, dass er bereit ist.'),
    ],
  },
  {
    id: 'tipps',
    label: 'Tipps',
    build: () => [
      ul([
        `Spare auf den Altar: ${ALTAR_COST} Glimmer sind schnell weg, wenn du zu viel im Laden ausgibst.`,
        'Dornenfelder und Chaos-Felder kannst du mit dem Phasenmantel oder Schutzschild umgehen.',
        'Ein Schlüsselfragment spart die Maut und ist der billigste Weg über Mautbrücken.',
        'Der Altar wandert. Prüfe vor dem Würfeln, welcher Weg am nächsten dran ist, und beachte die Faltungsphase.',
        'Auch wer hinten liegt, kann am Ende Bonus-Splitter holen: für Minispiele, Glimmer oder Ereignisse.',
        'Das Ereignis „Sternschnuppe“ hilft dem Letzten, „Umverteilung“ dem Ärmsten. Aufgeben lohnt sich nie.',
      ]),
    ],
  },
];

export function create(app: App, params?: RouteParams): ScreenView {
  const body = h('div', { role: 'tabpanel' });
  const tabs = h('div', { class: 'tabs', role: 'tablist' });
  const chips: HTMLElement[] = [];
  const select = (i: number): void => {
    chips.forEach((c, j) => {
      c.classList.toggle('on', i === j);
      c.setAttribute('aria-pressed', String(i === j));
    });
    body.replaceChildren(...(TABS[i] as Tab).build());
  };
  TABS.forEach((t, i) => {
    const c = h('button', { type: 'button', class: 'chip', onclick: () => select(i) }, t.label);
    c.setAttribute('role', 'tab');
    chips.push(c);
    tabs.appendChild(c);
  });
  select(0);
  const el = h('div', { class: 'screen sc' }, h('div', { class: 'panel wide' }, header(app, params, 'Spielanleitung'), tabs, body));
  return { el };
}
