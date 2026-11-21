/* „Sterling Nights“ – Nachtleben-Reihe im Stil der glamourösen Open-World-Krimis, nur liebevoll statt brutal.
   Rocco Sterling, Besitzer von Bar Komet und Skybar Wolke 7, macht dich zu seiner rechten Hand: VIP-Gäste chauffieren,
   Dachpartys retten, einem Investor die Stirn bieten. Am Ende steht dein eigener großer Club (Club Prisma, Imperium).
   Läuft in Akt II neben der Hochstadt-Saga; alles eigene Figuren und Orte von Pride City. */
import type { SaveData } from '../engine/Save';
import type { Line } from '../ui/ui';
import type { NpcDef, StoryCtx, Goal } from './story';
import type { Mission } from './saga';
import { sagaDone, MISSIONS as SAGA, isNight } from './saga';
import type { GigStep } from './gigs';
import { owns, priceOf, BUSINESSES } from './empire';
import { nightsOf } from './club';

export const NACHT_NPCS: NpcDef[] = [
  { id: 'rocco', name: 'Rocco Sterling', pron: 'er/ihn', color: '#ffcf5a', look: { body: 'Man', rb: 'Business_Male_01', palette: 'rainbow', skin: 1, hair: 0 }, x: 130.5, z: 4.3, yaw: Math.PI },
];
const R = NACHT_NPCS[0];
const L = (text: Line['text'], choices?: Line['choices']): Line => ({ who: R.name, pron: R.pron, color: R.color, text, choices });
const O = (who: string, color: string, text: string): Line => ({ who, color, text });
const S = (x: number, z: number, label: string, icon = '📍'): GigStep => ({ x, z, label, icon });
const SKY: [number, number] = [133, 4.3];

export const NACHT: Mission[] = [
  { id: 'samt', title: 'Der Herr im Samtanzug', giver: 'rocco', pay: 150, rep: 3, time: 200, night: true, car: true, hint: 'Rocco Sterling wartet ab 21 Uhr vor der Skybar Wolke 7 in der Hochstadt.',
    intro: (s) => [
      L(`${s.name}. Ich habe dich auf der Bühne im Prisma gesehen. Wer so einen Saal zum Kochen bringt, kann auch eine Nacht führen.`),
      L('Rocco Sterling. Mir gehören die Bar Komet und die Skybar Wolke 7. Sterling Nights, vielleicht hast du davon gehört.'),
      L('Ich suche eine rechte Hand. Jemanden mit Herz und Führerschein. Probe heute Nacht: Diamanda Royale landet im Grand Hotel Aurora.'),
      L('Hol sie ab, fahr eine Ehrenrunde über den Neonplatz, damit die Fotografen ihren Spaß haben, und bring sie zu mir aufs Dach.')],
    steps: [S(135, -9.5, 'Diamanda Royale am Grand Hotel abholen', '💎'), S(135, 30, 'Ehrenrunde über den Neonplatz', '📸'), S(SKY[0], SKY[1], 'Zur Skybar Wolke 7', '🌃')],
    outro: () => [
      O('Diamanda Royale', '#ff6ad5', 'Darling, das war die eleganteste Ankunft seit Monaco. Ich nehme dich überall hin mit.'),
      L('Sie hat gelächelt. Diamanda lächelt nie. Du hast den Job.'),
      L('Morgen Nacht ist Dachparty. Komm vorbei, es gibt immer etwas zu retten.')] },
  { id: 'perle', title: 'Prickelnde Not', giver: 'rocco', pay: 180, rep: 3, time: 230, night: true, car: true, hint: 'Rocco steht ab 21 Uhr vor der Skybar Wolke 7.',
    intro: () => [
      L('Katastrophe in Gold: Der Lieferant hat abgesagt. Dachparty ohne Perlwein ist wie Drag ohne Absätze.'),
      L('Tariq im Späti Lecker hat noch Kisten alkoholfreien Rosé-Sekt. Im Deli 24 liegen die Gläser, und das Diner 66 schuldet mir Eis.'),
      L('Sammel alles ein. Und fahr so, dass nichts klirrt.')],
    steps: [S(-5.6, 42.5, 'Rosé-Sekt im Späti Lecker abholen', '🍾'), S(190.8, 34.2, 'Gläser im Deli 24', '🥂'), S(140, 55.8, 'Eis im Diner 66', '🧊'), S(SKY[0], SKY[1], 'Alles zur Skybar', '🌃')],
    outro: () => [
      L('Hörst du das? Das ist das Geräusch von zweihundert glücklichen Gästen.'),
      L('Ganz ehrlich: Die Hälfte meines Lebens habe ich Probleme gelöst, die keiner sieht. Schön, das mal zu zweit zu tun.')] },
  { id: 'liste', title: 'Die Gästeliste', giver: 'rocco', pay: 200, rep: 4, time: 260, night: true, car: true, hint: 'Rocco wartet ab 21 Uhr vor der Skybar Wolke 7.',
    intro: () => [
      L('Heute kommen die Leute, über die morgen alle reden. Drei stehen ganz oben auf meiner Liste.'),
      L('Prinz Pailletten trinkt in der One Love Bar, die Rapperin MC Lavendel hängt vor dem Prisma ab, und Madame Opal sitzt im Kaleidoskop in der ersten Reihe.'),
      L('Persönliche Einladung, persönliche Abholung. So macht man das bei Sterling Nights.')],
    steps: [S(33.4, 20, 'Prinz Pailletten an der One Love Bar', '👑'), S(5.6, -12.3, 'MC Lavendel am Club Prisma', '🎤'), S(124.3, 43, 'Madame Opal am Kaleidoskop', '🎭'), S(SKY[0], SKY[1], 'Alle aufs Dach der Skybar', '🌃')],
    outro: () => [
      O('MC Lavendel', '#b56bff', 'Ich hab schon drei Zeilen über dich. Reimt sich auf „Nachtmanager*in mit Stil“.'),
      L('Die Klatschspalten werden voll sein. Aber leider nicht nur mit Gutem. Gerd Glanz war heute Abend auch da.')] },
  { id: 'glanz', title: 'Glanz und Gloria', giver: 'rocco', pay: 240, rep: 5, time: 280, car: true, night: true, hint: 'Rocco wartet ab 21 Uhr vor der Skybar Wolke 7.',
    intro: () => [
      L('Gerd Glanz. Dieselbe Firma, die damals euer Regenbogenhaus wollte. Jetzt will er meine Bars, und er hat Beschwerden eingereicht: Lärm, Ärger, alles erfunden.'),
      L('Ich will keinen Streit, ich will die Wahrheit. Frag die echten Nachbarn: die Brownstones, die Hochbahn-Station und die Galerie Farbrausch.'),
      L('Ihre Aussagen bringst du Stadträtin Okafor. Sie kennt dich ja schon.')],
    steps: [S(105, -30, 'Nachbarn an den Brownstones', '🏠'), S(157, 22, 'Bahner an der Hochbahn-Station', '🚆'), S(190.8, 21, 'Galerie Farbrausch', '🖼️'), S(184.3, -15, 'Aussagen zu Ines Okafor', '🏛️')],
    outro: () => [
      O('Ines Okafor', '#3ddc97', 'Siebzehn Aussagen, alle für die Bars. Die Beschwerden von Glanz Immobilien sind vom Tisch.'),
      L('Siebzehn. Ich dachte, die Nachbarn hassen meine Musik. Sie tanzen nur heimlich mit.'),
      L('Morgen feiern wir. Die größte Nacht, die die Hochstadt je hatte. Und danach müssen wir reden.')] },
  { id: 'dach', title: 'Nacht über den Dächern', giver: 'rocco', pay: 300, rep: 6, time: 320, car: true, night: true, hint: 'Rocco wartet ab 21 Uhr vor der Skybar Wolke 7.',
    intro: () => [
      L('Heute holt Sterling Nights die Sterne aufs Dach. Ich will die besten Leute der Stadt an einem Ort.'),
      L('Nova legt auf, Lady Luma moderiert, und Mama Vega bringt das ganze Haus mit. Hol sie ab, in dieser Reihenfolge.'),
      L('Und, Liebes: Nimm einen schönen Wagen. Heute sieht die ganze Stadt zu.')],
    steps: [S(5.6, -12.3, 'DJ Nova am Club Prisma', '🔊'), S(33.4, 20, 'Lady Luma an der One Love Bar', '💗'), S(135, 32, 'Mama Vega am Neonplatz', '🪩'), S(SKY[0], SKY[1], 'Alle aufs Dach', '🌃')],
    outro: (s) => [
      L('Schau dir das an. Feuerwerk über der Hochbahn, Konfetti auf den Taxis, und unten tanzt die Straße mit.'),
      L('Ich mache das seit dreißig Jahren. Und heute Nacht habe ich zum ersten Mal einfach zugeschaut, weil ich wusste: Du hast es im Griff.'),
      L(`Das Prisma steht zum Verkauf, ${s.name}. Der größte Club von Rainbow City. Ich habe mit Dario geredet: Für dich gibt es ihn ${DEAL} % günstiger. Kauf ihn dir.`),
      L('Mach ihn zu deinem. Und lass einen alten Mann ab und zu umsonst rein.')] },
];

export const nachtDone = (s: SaveData) => Math.min(NACHT.length, Number(s.flags.nacht) || 0);
export const nachtOpen = (s: SaveData) => s.chapter >= 3;
export const nachtNext = (s: SaveData) => (nachtOpen(s) ? NACHT[nachtDone(s)] || null : null);
/** Krönung der Reihe: dein erster großer Club (Imperium, andockbar an das Club-Management) */
export const CLUB = 'prisma';
/** Roccos Starthilfe: Story-Rabatt auf das Prisma (s.flags.deal_prisma, siehe hooks.ts) */
export const DEAL = 40;
/** erste eigene Clubnacht im Prisma gespielt (club.ts) */
const partied = (s: SaveData) => nightsOf(s, CLUB) > 0;
export const nachtOver = (s: SaveData) => nachtDone(s) >= NACHT.length && owns(s, CLUB) && partied(s);
/** Akt II wechselt zwischen Hochstadt und Nachtleben: wer weniger weit ist, ist dran */
export const nachtFirst = (s: SaveData) => !nachtOver(s) && (sagaDone(s) >= SAGA.length || nachtDone(s) / NACHT.length < sagaDone(s) / SAGA.length);

const clubPrice = (s: SaveData) => priceOf(s, BUSINESSES.find((b) => b.id === CLUB)!);

export function nachtGoal(s: SaveData): Goal | null {
  const m = nachtNext(s);
  if (m) return { title: `Sterling Nights ${nachtDone(s) + 1}/${NACHT.length}: ${m.title}`, sub: m.hint, npc: 'rocco' };
  if (nachtOpen(s) && !owns(s, CLUB)) return { title: s.money >= clubPrice(s) ? 'Kauf deinen ersten großen Club: das Prisma' : `Spare für das Club Prisma (${s.money}/${clubPrice(s)} €)`, sub: `Bei Dario im Prisma oder im Handy unter Imperium${s.flags['deal_' + CLUB] ? ` · ${DEAL} % Rabatt von Rocco` : ''}.`, poi: 'club' };
  if (nachtOpen(s) && nachtDone(s) >= NACHT.length && !partied(s)) return { title: 'Deine erste Clubnacht im Prisma', sub: 'Im Club am Klemmbrett starten: DJ, Preise, Tür. Freund*innen kannst du online dazu einladen (🌐).', poi: 'club' };
  return null;
}
export const nachtMarks = (s: SaveData): Array<[string, string]> => (nachtNext(s) ? [['rocco', '🥂']] : []);

const SMALL = ['Eine gute Nacht erkennt man daran, dass morgens alle lächeln. Auch die Nachbarn.', 'Samt, Neon und ein offenes Ohr. Mehr braucht ein Club nicht.', 'Ich habe nie jemanden rausgeworfen, der freundlich war. Und nie jemanden reingelassen, der es nicht war.'];

/** Gespräch mit Rocco – true, wenn die Nachtleben-Reihe es übernommen hat */
export function nachtTalk(c: StoryCtx, id: string): boolean {
  if (id !== 'rocco') return false;
  const s = c.s, m = nachtNext(s);
  if (!nachtOpen(s)) { c.say([L('Komm wieder, wenn die Szene deinen Namen kennt. Das dauert bei dir sicher nicht lange.')]); return true; }
  if (!m || s.flags.nachtRun || s.flags.sagaRun) {
    c.say([L(s.flags.nachtRun ? 'Du bist schon unterwegs. Folg der Lichtsäule, die Nacht wartet nicht.' : s.flags.sagaRun ? 'Erst die Hochstadt, dann die Nacht. Ich laufe nicht weg.' : !owns(s, CLUB) ? 'Das Prisma wartet auf dich. Handy, Imperium, und dann feiern wir.' : SMALL[s.day % SMALL.length])]);
    return true;
  }
  if (m.night && !isNight(c.hour())) {
    c.say([L('Bei Tageslicht bin ich nur ein Mann im Anzug. Komm nach 21 Uhr wieder.', [
      { label: 'Bis 21 Uhr warten', fn: () => c.skipToHour(21) }, { label: 'Ich komme später', fn: () => {} }])]);
    return true;
  }
  const start = () => {
    s.flags.nachtRun = m.id;
    c.mission({ id: 'nacht_' + m.id, who: R.name, color: R.color, title: `🥂 ${m.title}`, call: '', steps: m.steps, time: m.time, pay: m.pay, rep: m.rep, car: m.car, done: 'Was für eine Nacht!',
      after: () => {
        delete s.flags.nachtRun; s.flags.nacht = nachtDone(s) + 1;
        const last = nachtDone(s) >= NACHT.length;
        if (last && !owns(s, CLUB)) s.flags['deal_' + CLUB] = DEAL;
        c.say(m.outro(s), () => {
          if (last) c.card('Sterling Nights', 'Dein erster großer Club', owns(s, CLUB) ? 'Das Prisma gehört dir schon. Rocco ist stolz wie nie.' : `Rocco hat dir ${DEAL} % Rabatt auf das Club Prisma besorgt. Kauf es bei Dario im Club oder im Handy unter Imperium.`);
          else c.toast(`🥂 Nächste Nacht: ${NACHT[nachtDone(s)].title}`);
        });
      },
      failed: () => { delete s.flags.nachtRun; c.toast(`${R.name}: „Kein Drama. Komm zurück, wir probieren es noch einmal.“`); } });
  };
  const lines = m.intro(s);
  lines.push(L(m.car ? 'Bereit? Mit einem schicken Wagen bist du schneller.' : 'Bereit?', [{ label: `Los geht’s (${m.pay} €)`, fn: start }, { label: 'Noch nicht', fn: () => {} }]));
  c.say(lines);
  return true;
}

/** Club gekauft (pcEvents clubGekauft): Krönung der Reihe mit Anruf und Karte */
export function nachtBought(c: StoryCtx, id: string) {
  const s = c.s;
  if (id !== CLUB || s.flags.nachtClub || nachtDone(s) < NACHT.length) return;
  s.flags.nachtClub = true; delete s.flags['deal_' + CLUB];
  c.phone([
    { who: `📞 ${R.name}`, color: R.color, text: 'Ich habe es gerade gehört. Das Prisma gehört dir! Dario hat geweint, ich übrigens auch, ein bisschen.' },
    { who: `📞 ${R.name}`, color: R.color, text: 'Ab heute bist du nicht mehr meine rechte Hand. Du bist die Konkurrenz. Die schönste, die ich je hatte.' },
  ], () => { c.reward(0, 5, 'Club-Mogul*in'); c.card('Sterling Nights', 'Club-Mogul*in', 'Das Prisma gehört dir. Starte im Club am Klemmbrett deine erste Clubnacht. Freund*innen kannst du online dazu einladen.'); });
}

/** Erste Clubnacht im Prisma (pcEvents clubNacht): Rocco war heimlich da */
export function nachtParty(c: StoryCtx, e: { id: string; guests: number; revenue: number }) {
  const s = c.s;
  if (e.id !== CLUB || s.flags.nachtParty || nachtDone(s) < NACHT.length) return;
  s.flags.nachtParty = true;
  c.phone([
    { who: `📞 ${R.name}`, color: R.color, text: `Ich stand ganz hinten an der Bar, mit Sonnenbrille. ${e.guests} Gäste, ${e.revenue} € Umsatz und niemand wollte nach Hause.` },
    { who: `📞 ${R.name}`, color: R.color, text: 'Das ist keine Clubnacht mehr, das ist eine Legende. Sterling Nights verbeugt sich.' },
  ], () => c.card('Sterling Nights', 'Die Nacht gehört dir', 'Deine erste Clubnacht im Prisma ist Stadtgespräch. Rocco ist stolz, und die Inseln haben davon gehört.'));
}
