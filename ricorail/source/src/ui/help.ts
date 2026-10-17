// Hilfe im Spiel: Tasten, Touch, Führerstandshinweise, Signale.
import type { CabLayout } from '../trains/stock';
import { CAB_LAYOUTS } from '../trains/stock';
import { KEYS, ACTION_LABELS } from '../input/input';
import { h } from './dom';

const CAB_TIPS: Record<CabLayout, string> = {
  hst: 'Kombinierter Fahr-/Bremshebel (Mitte = 0). Elektrische Bremse wird beim Bremsen zuerst genutzt. Türen über die Bahnsteigseite freigeben.',
  dosto: 'Fahrschalter und Führerbremsventil getrennt. Wendezug: am Zugende über den Steuerwagen weiterfahren (F im Stillstand).',
  sbahn: 'Starke Beschleunigung, kurze Halte. Türen rechtzeitig freigeben und schließen, sonst steigt die Verspätung.',
  dmu: 'Dieseltriebwagen: Motor mit U starten. Leistung stufenlos, Bremsen über den Hebel.',
  eloco: 'Ellok: Stromabnehmer (P) heben, Hauptschalter (U) ein. Schwere Züge vorsichtig anfahren, bei Schleudern sanden (G).',
  dloco: 'Diesellok: Motor (U) starten, Fahrstufen 0–8. Bei langen Güterzügen früh bremsen – die Luftbremse wirkt verzögert.',
  steam: 'Dampflok: Regler (W/S), Steuerung (, und .), Feuern (B), Injektor (⇧I) für Wasser. Wasserstand und Kesseldruck im Blick halten.',
  shunter: 'Rangierlok: Rangierfahrt (A) begrenzt auf 25 km/h. Kuppeln (K), Entkuppeln (J), Beladen (N).',
  neon: 'Fantasie-Schnellzug: Kombihebel, sehr starke Bremse. Auch hier gelten Signale und Geschwindigkeiten.',
  rack: 'Zahnradbahn: auf Zahnstangenabschnitten nur langsam. Bergab die Zahnradbremse nutzen.',
  tram: 'Straßenbahn: Pedale für Sifa, Sand und Klingel. Fahren auf Sicht.',
};

export function helpContent(layout: CabLayout | null, mode: 'drive' | 'box' | 'world'): HTMLElement {
  const rows = KEYS.filter((k) => k.label && ACTION_LABELS[k.act]).map((k) => h('tr', null, h('td', null, h('span', { class: 'kbd' }, k.label)), h('td', null, ACTION_LABELS[k.act]!)));
  return h('div', null,
    layout ? h('p', null, h('b', null, CAB_LAYOUTS[layout] ?? layout), h('br'), CAB_TIPS[layout]) : null,
    mode === 'box' ? h('p', null, 'Stellwerk: Startsignal antippen, dann Zielsignal – die Fahrstraße wird eingestellt, wenn alle Weichen frei sind. Eingestellte Fahrstraße am Startsignal antippen = zurücknehmen. Weiche antippen = umstellen.') : null,
    mode === 'world' ? h('p', null, 'Freie Welt: Züge fahren nach Fahrplan. Kamera wechseln (C), Zeitraffer (Tab), Karte (M). Freie Kamera mit W/A/S/D, Q/E für hoch/runter.') : null,
    h('p', null, h('b', null, 'Touch: '), 'Hebel rechts unten ziehen: oben fahren, unten bremsen. Mit einem Finger umsehen, mit zwei Fingern zoomen, Doppeltippen setzt den Blick zurück. Bedienelemente im Führerstand lassen sich antippen.'),
    h('p', null, h('b', null, 'Gamepad: '), 'Rechter Trigger fahren, linker Trigger bremsen, A Türen, B Schnellbremsung, X Horn, Y Kamera, LB Wachsam, RB Richtungswender, Start Pause.'),
    h('p', null, h('b', null, 'Signale (vereinfacht): '), 'Rot = Halt, Gelb = Halt erwarten / Langsamfahrt, Grün = Fahrt. Ersatzsignal (Z) nur bei gestörtem Signal und nach Freigabe; danach höchstens 40 km/h.'),
    h('table', { class: 't' }, rows),
    h('p', { class: 'notice' }, 'Simulation, kein offizielles Produkt der Deutschen Bahn. PZB, Sifa und Stellwerk sind vereinfachte Spielmodelle, nicht zertifiziert und nicht sicherheitsrelevant.'));
}
