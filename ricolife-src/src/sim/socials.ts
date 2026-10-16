// Soziale Interaktionen: über 35 Handlungen mit Bedingungen, Annahme-Chance und Folgen für Beziehung, Stimmung und Erinnerungen.
import type { AgeStage } from '../data/types';
import { traitById } from '../data/traits';
import { clamp } from '../core/util';
import { def, type Ctx } from './interact';
import { nextActionUid, type Game } from './game';
import type { Rel, Sim } from './types';
import type { AnimId } from './types';

export type SocialCat = 'friendly' | 'funny' | 'romantic' | 'mean' | 'deep' | 'family';

export interface SocialDef {
  id: string;
  label: string;
  icon: string;
  cat: SocialCat;
  dur: number;
  anim: AnimId;
  tAnim?: AnimId;
  /** Grundchance 0..1 */
  base: number;
  req?: (g: Game, a: Sim, b: Sim, r: Rel) => true | string | false;
  ok: { f?: number; r?: number; t?: number; ma?: string; mb?: string; social?: number; fun?: number; text?: string; bubble?: string };
  no?: { f?: number; r?: number; t?: number; ma?: string; mb?: string; text?: string; bubble?: string };
  after?: (g: Game, a: Sim, b: Sim, ok: boolean) => void;
  /** Autonomie-Gewicht (0 = nie autonom) */
  auto: number;
  charisma?: number;
}

const grown = (s: Sim): boolean => s.age === 'youngadult' || s.age === 'adult' || s.age === 'senior';
const kid = (s: Sim): boolean => s.age === 'child' || s.age === 'toddler' || s.age === 'baby';
const small = (s: Sim): boolean => s.age === 'toddler' || s.age === 'baby';

/** Romantik nur zwischen Erwachsenen bzw. zwischen Jugendlichen – nie in der Familie */
export function romanceAllowed(g: Game, a: Sim, b: Sim): true | string | false {
  if (a.id === b.id) return false;
  if (g.isFamily(a, b)) return false;
  const bothGrown = grown(a) && grown(b);
  const bothTeen = a.age === 'teen' && b.age === 'teen';
  if (!bothGrown && !bothTeen) return false;
  const pa = g.partnerOf(a),
    pb = g.partnerOf(b);
  if (pa && pa.id !== b.id) return `${a.first} ist bereits vergeben`;
  if (pb && pb.id !== a.id) return `${b.first} ist vergeben`;
  return true;
}

export const SOCIALS: SocialDef[] = [
  // ---------- freundlich ----------
  { id: 'introduce', label: 'Vorstellen', icon: '👋', cat: 'friendly', dur: 6, anim: 'wave', tAnim: 'wave', base: 0.98, req: (_g, _a, _b, r) => (!r.met ? true : false), ok: { f: 6, social: 12, text: 'haben sich kennengelernt' }, auto: 3 },
  { id: 'chat', label: 'Plaudern', icon: '💬', cat: 'friendly', dur: 15, anim: 'talk', tAnim: 'listen', base: 0.9, req: (_g, _a, _b, r) => (r.met ? true : false), ok: { f: 4, social: 18, ma: 'goodchat', mb: 'goodchat' }, no: { f: -2, text: 'Das Gespräch war zäh' }, auto: 10 },
  { id: 'askAboutDay', label: 'Nach dem Tag fragen', icon: '🌤️', cat: 'friendly', dur: 12, anim: 'listen', tAnim: 'talk', base: 0.9, req: (_g, _a, _b, r) => (r.met ? true : false), ok: { f: 4, t: 2, social: 14 }, auto: 6 },
  { id: 'compliment', label: 'Kompliment machen', icon: '🌟', cat: 'friendly', dur: 6, anim: 'talk', tAnim: 'cheer', base: 0.85, req: (_g, _a, _b, r) => (r.met ? true : false), ok: { f: 5, social: 8, mb: 'proud' }, no: { f: -1, ma: 'embarrassing' }, auto: 4, charisma: 0.04 },
  { id: 'shareInterest', label: 'Über Hobbys reden', icon: '🎯', cat: 'friendly', dur: 15, anim: 'talk', tAnim: 'listen', base: 0.8, req: (_g, _a, _b, r) => (r.met ? true : false), ok: { f: 6, social: 16, fun: 6 }, no: { f: -1 }, auto: 5 },
  { id: 'tellStory', label: 'Geschichte erzählen', icon: '📚', cat: 'friendly', dur: 18, anim: 'talk', tAnim: 'laugh', base: 0.75, req: (_g, _a, _b, r) => (r.f >= 10 ? true : r.met ? 'Erst besser kennenlernen' : false), ok: { f: 6, social: 16, fun: 10, mb: 'laughed' }, no: { f: -2, mb: 'bored' }, auto: 4, charisma: 0.05 },
  { id: 'highFive', label: 'Abklatschen', icon: '✋', cat: 'friendly', dur: 3, anim: 'highfive', tAnim: 'highfive', base: 0.9, req: (_g, a, b, r) => (r.f >= 15 && !small(a) && !small(b) ? true : false), ok: { f: 4, fun: 6 }, no: { f: -2, ma: 'embarrassing' }, auto: 3 },
  { id: 'hug', label: 'Umarmen', icon: '🤗', cat: 'friendly', dur: 5, anim: 'hug', tAnim: 'hug', base: 0.8, req: (_g, _a, _b, r) => (r.f >= 30 ? true : r.met ? 'Dafür kennt ihr euch noch nicht gut genug' : false), ok: { f: 6, t: 3, social: 12, ma: 'hugged', mb: 'hugged' }, no: { f: -4, ma: 'rejected' }, auto: 4 },
  { id: 'comfort', label: 'Trösten', icon: '🫂', cat: 'friendly', dur: 15, anim: 'hug', tAnim: 'cry', base: 0.85, req: (_g, _a, b, r) => (r.met && (b.emo === 'sad' || b.emo === 'tense' || b.emo === 'embarrassed') ? true : r.met ? 'Braucht gerade keinen Trost' : false), ok: { f: 8, t: 6, social: 16, mb: 'comforted' }, no: { f: -1 }, auto: 8 },
  { id: 'encourage', label: 'Mut machen', icon: '💪', cat: 'friendly', dur: 8, anim: 'cheer', tAnim: 'listen', base: 0.85, req: (_g, _a, _b, r) => (r.f >= 10 ? true : false), ok: { f: 5, t: 3, mb: 'proud', social: 8 }, auto: 3, charisma: 0.04 },
  { id: 'thank', label: 'Danke sagen', icon: '🙏', cat: 'friendly', dur: 4, anim: 'talk', tAnim: 'cheer', base: 0.95, req: (_g, _a, _b, r) => (r.met ? true : false), ok: { f: 3, t: 2, mb: 'grateful' }, auto: 2 },
  { id: 'gossip', label: 'Tratschen', icon: '🤫', cat: 'friendly', dur: 12, anim: 'talk', tAnim: 'laugh', base: 0.7, req: (_g, a, b, r) => (r.f >= 20 && !kid(a) && !kid(b) ? true : false), ok: { f: 6, social: 14, fun: 8 }, no: { f: -5, t: -5, text: 'fand Tratschen daneben' }, auto: 3 },
  { id: 'danceTogether', label: 'Zusammen tanzen', icon: '💃', cat: 'friendly', dur: 20, anim: 'dance', tAnim: 'dance', base: 0.75, req: (_g, a, b, r) => (r.f >= 15 && !small(a) && !small(b) ? true : false), ok: { f: 6, social: 14, fun: 18, ma: 'partyfun', mb: 'partyfun' }, no: { f: -3, ma: 'rejected' }, auto: 2 },
  { id: 'playTogether', label: 'Gemeinsam spielen', icon: '🎲', cat: 'friendly', dur: 25, anim: 'play', tAnim: 'play', base: 0.9, req: (_g, a, b) => (kid(a) || kid(b) || a.age === 'teen' ? (a.age !== 'baby' && b.age !== 'baby' ? true : false) : false), ok: { f: 7, social: 16, fun: 20, ma: 'laughed', mb: 'laughed' }, auto: 7 },
  // ---------- lustig ----------
  { id: 'joke', label: 'Witz erzählen', icon: '😂', cat: 'funny', dur: 8, anim: 'laugh', tAnim: 'laugh', base: 0.7, req: (_g, a, b, r) => (r.met && !small(a) && !small(b) ? true : false), ok: { f: 6, social: 10, fun: 12, ma: 'laughed', mb: 'laughed' }, no: { f: -3, mb: 'annoyed', text: 'fand den Witz flach' }, auto: 6, charisma: 0.03 },
  { id: 'prank', label: 'Streich spielen', icon: '🃏', cat: 'funny', dur: 8, anim: 'laugh', tAnim: 'embarrassed', base: 0.45, req: (_g, a, b, r) => (r.f >= 25 && !small(a) && !small(b) ? true : r.met ? 'Nur unter Freunden' : false), ok: { f: 8, fun: 20, ma: 'laughed', mb: 'laughed' }, no: { f: -10, t: -6, mb: 'annoyed', text: 'war wegen eines Streichs sauer' }, auto: 1 },
  { id: 'funnyFace', label: 'Grimassen schneiden', icon: '🤪', cat: 'funny', dur: 5, anim: 'laugh', tAnim: 'laugh', base: 0.85, req: (_g, _a, b) => (kid(b) || b.age === 'teen' ? true : false), ok: { f: 5, fun: 14, mb: 'laughed' }, no: { f: -1 }, auto: 4 },
  { id: 'tickle', label: 'Kitzeln', icon: '🫶', cat: 'family', dur: 6, anim: 'play', tAnim: 'laugh', base: 0.95, req: (g, a, b) => (small(b) && b.age !== 'baby' && (grown(a) || a.age === 'teen') && (g.isFamily(a, b) || a.hh === b.hh) ? true : false), ok: { f: 6, fun: 18, social: 14, mb: 'laughed' }, auto: 6 },
  // ---------- tiefgründig ----------
  { id: 'deepTalk', label: 'Tiefgründiges Gespräch', icon: '🌌', cat: 'deep', dur: 25, anim: 'talk', tAnim: 'listen', base: 0.75, req: (_g, a, b, r) => (r.f >= 20 && !kid(a) && !kid(b) ? true : r.met ? 'Erst etwas vertrauter werden' : false), ok: { f: 8, t: 8, social: 22 }, no: { f: -2 }, auto: 4, charisma: 0.03 },
  { id: 'philosophize', label: 'Über das Leben philosophieren', icon: '🤔', cat: 'deep', dur: 25, anim: 'think', tAnim: 'think', base: 0.65, req: (_g, a, b, r) => (r.f >= 25 && grown(a) && !kid(b) ? true : false), ok: { f: 7, t: 6, social: 18, ma: 'inspiredwalk' }, no: { f: -2, mb: 'bored' }, auto: 2 },
  { id: 'askAdvice', label: 'Um Rat fragen', icon: '🧭', cat: 'deep', dur: 15, anim: 'listen', tAnim: 'talk', base: 0.85, req: (_g, _a, _b, r) => (r.f >= 20 ? true : false), ok: { f: 5, t: 8, social: 12, ma: 'grateful' }, auto: 2 },
  { id: 'shareSecret', label: 'Geheimnis anvertrauen', icon: '🔐', cat: 'deep', dur: 12, anim: 'talk', tAnim: 'listen', base: 0.7, req: (_g, a, b, r) => (r.f >= 45 && !kid(a) && !kid(b) ? true : r.met ? 'Nur engen Freunden' : false), ok: { f: 8, t: 15, social: 14 }, no: { f: -3, t: -6, text: 'ging mit einem Geheimnis zu locker um' }, auto: 1 },
  { id: 'apologize', label: 'Entschuldigen', icon: '🕊️', cat: 'deep', dur: 10, anim: 'talk', tAnim: 'listen', base: 0.7, req: (_g, _a, _b, r) => (r.f < 10 || r.h[0]?.includes('Streit') ? true : r.met ? 'Kein Grund dafür' : false), ok: { f: 15, t: 8, ma: 'reconciled', mb: 'reconciled', text: 'haben sich versöhnt' }, no: { f: -2, ma: 'rejected' }, auto: 3, charisma: 0.05 },
  // ---------- gemein (bewusst gewählt) ----------
  { id: 'debate', label: 'Diskutieren', icon: '🗯️', cat: 'mean', dur: 15, anim: 'talk', tAnim: 'talk', base: 0.6, req: (_g, a, b, r) => (r.met && !kid(a) && !kid(b) ? true : false), ok: { f: 3, t: 3, social: 8, text: 'hatten eine spannende Diskussion' }, no: { f: -6, ma: 'annoyed', mb: 'annoyed' }, auto: 2, charisma: 0.04 },
  { id: 'complain', label: 'Sich beschweren', icon: '😤', cat: 'mean', dur: 10, anim: 'angry', tAnim: 'listen', base: 0.6, req: (_g, _a, _b, r) => (r.met ? true : false), ok: { f: 1, social: 6 }, no: { f: -5, mb: 'annoyed' }, auto: 1 },
  { id: 'brag', label: 'Angeben', icon: '😎', cat: 'mean', dur: 8, anim: 'cheer', tAnim: 'listen', base: 0.4, req: (_g, _a, _b, r) => (r.met ? true : false), ok: { f: 2, ma: 'proud' }, no: { f: -6, mb: 'annoyed', text: 'fand die Angeberei nervig' }, auto: 1 },
  { id: 'insult', label: 'Beleidigen', icon: '👎', cat: 'mean', dur: 6, anim: 'angry', tAnim: 'cry', base: 1, req: (_g, a, b, r) => (r.met && !small(a) && !small(b) ? true : false), ok: { f: -15, t: -10, mb: 'insulted', text: 'wurde beleidigt' }, auto: 0 },
  { id: 'argue', label: 'Streit anfangen', icon: '⚡', cat: 'mean', dur: 12, anim: 'angry', tAnim: 'angry', base: 1, req: (_g, a, b, r) => (r.met && !kid(a) && !kid(b) ? true : false), ok: { f: -20, t: -12, ma: 'argument', mb: 'argument', text: 'hatten einen heftigen Streit' }, auto: 0.3 },
  // ---------- romantisch ----------
  { id: 'flirt', label: 'Flirten', icon: '😉', cat: 'romantic', dur: 8, anim: 'flirt', tAnim: 'embarrassed', base: 0.6, req: (g, a, b, r) => { const ok = romanceAllowed(g, a, b); return ok !== true ? ok : r.f >= 10 ? true : r.met ? 'Erst etwas besser kennenlernen' : false; }, ok: { f: 3, r: 8, ma: 'flirty', mb: 'flirty', bubble: '💗' }, no: { f: -4, r: -3, ma: 'rejected', text: 'wies einen Flirtversuch ab' }, auto: 2, charisma: 0.04 },
  { id: 'romanticCompliment', label: 'Charmantes Kompliment', icon: '🌹', cat: 'romantic', dur: 6, anim: 'flirt', tAnim: 'embarrassed', base: 0.6, req: (g, a, b, r) => { const ok = romanceAllowed(g, a, b); return ok !== true ? ok : r.r >= 10 ? true : r.met ? 'Erst flirten' : false; }, ok: { r: 8, f: 3, mb: 'flirty', bubble: '💗' }, no: { r: -4, ma: 'embarrassing' }, auto: 1.5, charisma: 0.05 },
  { id: 'holdHands', label: 'Händchen halten', icon: '🤝', cat: 'romantic', dur: 10, anim: 'cuddle', tAnim: 'cuddle', base: 0.7, req: (g, a, b, r) => { const ok = romanceAllowed(g, a, b); return ok !== true ? ok : r.r >= 25 ? true : r.met ? 'Noch zu früh' : false; }, ok: { r: 8, f: 4, social: 10, ma: 'flirty', mb: 'flirty', bubble: '💞' }, no: { r: -5, ma: 'rejected' }, auto: 1.5 },
  { id: 'kiss', label: 'Küssen', icon: '💋', cat: 'romantic', dur: 6, anim: 'kiss', tAnim: 'kiss', base: 0.7, req: (g, a, b, r) => { const ok = romanceAllowed(g, a, b); if (ok !== true) return ok; if (!(grown(a) && grown(b))) return false; return r.r >= 40 ? true : r.met ? 'Noch zu früh' : false; }, ok: { r: 12, f: 4, social: 12, bubble: '💖' }, no: { r: -8, f: -3, ma: 'rejected', text: 'wollte (noch) nicht geküsst werden' }, auto: 1, after: (g, a, b, ok) => { if (ok && !a.flags[`kiss:${b.id}`]) { a.flags[`kiss:${b.id}`] = 1; b.flags[`kiss:${a.id}`] = 1; g.addMood(a, 'firstkiss'); g.addMood(b, 'firstkiss'); g.memory(a, `Erster Kuss mit ${b.first}`, '💋', true); g.memory(b, `Erster Kuss mit ${a.first}`, '💋', true); } } },
  { id: 'askOut', label: 'Verabredung vorschlagen', icon: '🌙', cat: 'romantic', dur: 8, anim: 'flirt', tAnim: 'listen', base: 0.65, req: (g, a, b, r) => { const ok = romanceAllowed(g, a, b); return ok !== true ? ok : r.r >= 20 ? true : r.met ? 'Noch nicht genug Funken' : false; }, ok: { r: 10, f: 5, ma: 'inlove', mb: 'flirty', bubble: '💘', text: 'haben ein Date' }, no: { r: -6, ma: 'rejected' }, auto: 0.5, after: (g, a, b, ok) => { if (ok) { const r = g.rel(a.id, b.id); r.dates = (r.dates ?? 0) + 1; a.flags.dates = (a.flags.dates ?? 0) + 1; b.flags.dates = (b.flags.dates ?? 0) + 1; } } },
  { id: 'proposePartner', label: 'Beziehung vorschlagen', icon: '💑', cat: 'romantic', dur: 10, anim: 'flirt', tAnim: 'cheer', base: 0.7, req: (g, a, b, r) => { const ok = romanceAllowed(g, a, b); if (ok !== true) return ok; if (r.k && r.k !== 'ex') return false; return r.r >= 50 && r.f >= 30 ? true : r.met ? 'Braucht mehr Romantik und Freundschaft' : false; }, ok: { r: 10, f: 6, ma: 'inlove', mb: 'inlove', bubble: '💞', text: 'sind jetzt ein Paar' }, no: { r: -10, f: -5, ma: 'rejected' }, auto: 0, after: (g, a, b, ok) => { if (ok) { g.rel(a.id, b.id).k = 'partner'; g.memory(a, `Mit ${b.first} zusammengekommen`, '💑', true); g.memory(b, `Mit ${a.first} zusammengekommen`, '💑', true); g.bus.emit('life', { sim: a.id, kind: 'partner', other: b.id }); } } },
  { id: 'propose', label: 'Heiratsantrag machen', icon: '💍', cat: 'romantic', dur: 12, anim: 'flirt', tAnim: 'cry', base: 0.75, req: (_g, a, b, r) => (r.k === 'partner' && grown(a) && grown(b) ? (r.r >= 70 ? true : 'Die Beziehung braucht mehr Romantik') : false), ok: { r: 15, f: 8, ma: 'engaged', mb: 'engaged', bubble: '💍', text: 'haben sich verlobt' }, no: { r: -15, f: -8, ma: 'rejected', mb: 'worried' }, auto: 0, after: (g, a, b, ok) => { if (ok) { g.rel(a.id, b.id).k = 'engaged'; if (a.inv.ring) g.giveItem(a, 'ring', -1); g.memory(a, `Verlobung mit ${b.first}`, '💍', true); g.memory(b, `Verlobung mit ${a.first}`, '💍', true); g.bus.emit('life', { sim: a.id, kind: 'engaged', other: b.id }); } } },
  { id: 'marry', label: 'Heiraten (kleine Zeremonie)', icon: '💒', cat: 'romantic', dur: 30, anim: 'kiss', tAnim: 'kiss', base: 0.95, req: (_g, _a, _b, r) => (r.k === 'engaged' ? true : false), ok: { r: 15, f: 10, ma: 'wedding', mb: 'wedding', bubble: '💒', text: 'haben geheiratet' }, no: { r: -5, mb: 'worried' }, auto: 0, after: (g, a, b, ok) => { if (ok) { g.rel(a.id, b.id).k = 'married'; g.memory(a, `Hochzeit mit ${b.first}`, '💒', true); g.memory(b, `Hochzeit mit ${a.first}`, '💒', true); g.bus.emit('life', { sim: a.id, kind: 'wedding', other: b.id }); g.notify(`${a.first} und ${b.first} haben geheiratet! 🎉`, '💒', a.id, 'good'); } } },
  { id: 'moveIn', label: 'Zusammenziehen', icon: '🏠', cat: 'romantic', dur: 10, anim: 'talk', tAnim: 'cheer', base: 0.85, req: (g, a, b, r) => (r.k && r.k !== 'ex' && a.hh && b.hh !== a.hh && !b.guest ? (b.hh ? 'Wohnt in einem anderen Haushalt' : (g.hhs.get(a.hh)?.members.length ?? 8) >= 8 ? 'Haushalt ist voll (8)' : true) : false), ok: { f: 5, ma: 'movedin', mb: 'movedin', text: 'sind zusammengezogen' }, no: { f: -4, ma: 'rejected' }, auto: 0, after: (g, a, b, ok) => { if (ok) joinHousehold(g, b, a.hh!); } },
  { id: 'breakUp', label: 'Trennen', icon: '💔', cat: 'romantic', dur: 10, anim: 'talk', tAnim: 'cry', base: 1, req: (_g, _a, _b, r) => (r.k && r.k !== 'ex' ? true : false), ok: { f: -30, r: -60, ma: 'breakup', mb: 'breakup', text: 'haben sich getrennt' }, auto: 0, after: (g, a, b) => { g.rel(a.id, b.id).k = 'ex'; g.bus.emit('life', { sim: a.id, kind: 'breakup', other: b.id }); g.memory(a, `Trennung von ${b.first}`, '💔', true); g.memory(b, `Trennung von ${a.first}`, '💔', true); } },
  { id: 'cuddle', label: 'Kuscheln', icon: '🥰', cat: 'romantic', dur: 15, anim: 'cuddle', tAnim: 'cuddle', base: 0.85, req: (_g, _a, _b, r) => (r.k && r.k !== 'ex' ? true : false), ok: { r: 6, f: 3, social: 16, ma: 'hugged', mb: 'hugged', bubble: '💕' }, no: { r: -2 }, auto: 2 },
  // ---------- Familie ----------
  { id: 'readStory', label: 'Vorlesen', icon: '📖', cat: 'family', dur: 25, anim: 'read', tAnim: 'listen', base: 0.95, req: (_g, a, b) => ((b.age === 'child' || b.age === 'toddler') && (grown(a) || a.age === 'teen') ? true : false), ok: { f: 8, social: 16, fun: 12, mb: 'calm' }, auto: 4, after: (g, _a, b) => g.addSkill(b, 'writing', 15) },
  { id: 'teachTalk', label: 'Sprechen üben', icon: '🗨️', cat: 'family', dur: 20, anim: 'talk', tAnim: 'play', base: 0.95, req: (_g, a, b) => (b.age === 'toddler' && (grown(a) || a.age === 'teen') ? true : false), ok: { f: 6, social: 14 }, auto: 4, after: (g, _a, b) => g.addSkill(b, 'charisma', 25) },
  { id: 'praise', label: 'Loben', icon: '🏅', cat: 'family', dur: 5, anim: 'cheer', tAnim: 'cheer', base: 0.95, req: (_g, a, b) => (kid(b) || b.age === 'teen' ? (grown(a) ? true : false) : false), ok: { f: 5, mb: 'proud' }, auto: 2 },
  { id: 'helpHomework', label: 'Bei Hausaufgaben helfen', icon: '📐', cat: 'family', dur: 25, anim: 'talk', tAnim: 'read', base: 0.9, req: (g, a, b) => ((b.age === 'child' || b.age === 'teen') && grown(a) && b.school && b.school.hw < 1 ? (g.skillLv(a, 'logic') >= 3 ? true : 'Logik Stufe 3 nötig') : false), ok: { f: 6, t: 4 }, auto: 1, after: (_g, _a, b) => { if (b.school) b.school.hw = 1; } },
  { id: 'giveGift', label: 'Geschenk überreichen', icon: '🎁', cat: 'friendly', dur: 6, anim: 'talk', tAnim: 'cheer', base: 0.95, req: (_g, a, _b, r) => (!r.met ? false : Object.keys(a.inv).some((k) => ['flowers', 'chocolate', 'book', 'plush', 'wine', 'watch', 'cake', 'toy', 'painting', 'photo'].includes(k)) ? true : 'Kein Geschenk im Inventar'), ok: { f: 10, t: 4, mb: 'giftreceived', bubble: '🎁' }, auto: 0, after: (g, a, b) => giveGiftItem(g, a, b) },
];

export function socialById(id: string): SocialDef | undefined {
  return SOCIALS.find((s) => s.id === id);
}

function giveGiftItem(g: Game, a: Sim, b: Sim): void {
  const order = ['ring', 'watch', 'painting', 'flowers', 'wine', 'cake', 'chocolate', 'plush', 'book', 'toy', 'photo'];
  const it = order.find((k) => k !== 'ring' && (a.inv[k] ?? 0) > 0);
  if (!it) return;
  g.giveItem(a, it, -1);
  g.giveItem(b, it, 1);
  const val = { watch: 12, painting: 10, flowers: 8, wine: 6, cake: 6, chocolate: 5, plush: 5, book: 5, toy: 4, photo: 4 }[it] ?? 3;
  const r = g.rel(a.id, b.id);
  r.f = clamp(r.f + val, -100, 100);
  if (it === 'flowers' || it === 'chocolate') r.r = clamp(r.r + 4, 0, 100);
}

export function joinHousehold(g: Game, s: Sim, hhId: string): void {
  const h = g.hhs.get(hhId);
  if (!h) return;
  if (s.hh) {
    const old = g.hhs.get(s.hh);
    if (old) old.members = old.members.filter((m) => m !== s.id);
  }
  s.hh = hhId;
  s.npc = false;
  if (h.lot) s.home = h.lot;
  if (!h.members.includes(s.id)) h.members.push(s.id);
  s.visit = undefined;
  g.memory(s, `Eingezogen bei ${h.name}`, '🏠', true);
  g.notify(`${s.first} zieht bei ${h.name} ein!`, '🏠', s.id, 'good');
}

/** Annahme-Wahrscheinlichkeit einer sozialen Handlung */
export function acceptChance(g: Game, sd: SocialDef, a: Sim, b: Sim): number {
  const r = g.rel(a.id, b.id);
  let p = sd.base;
  if (sd.cat !== 'mean') p += r.f / 300 + r.t / 600;
  if (sd.cat === 'romantic') p += r.r / 250 - 0.05;
  p += (sd.charisma ?? 0.02) * g.skillLv(a, 'charisma');
  const moodB = g.mood(b);
  p += moodB / 500;
  for (const t of a.traits) p *= traitById(t).socialMod?.[sd.cat as 'friendly'] ?? 1;
  for (const t of b.traits) {
    const m = traitById(t).socialMod?.[sd.cat as 'friendly'];
    if (m) p *= 0.5 + m / 2;
  }
  if (b.needs.energy < 15 || b.needs.bladder < 15) p -= 0.25;
  if (b.emo === 'angry' && sd.cat !== 'deep') p -= 0.2;
  if (a.needs.hygiene < 20) p -= 0.15;
  if (sd.cat === 'funny' && g.hasTrait(b, 'funny')) p += 0.1;
  if (sd.cat === 'funny' && g.hasTrait(b, 'grumpy')) p -= 0.15;
  return clamp(p, 0.03, 0.98);
}

export function applySocial(g: Game, sd: SocialDef, a: Sim, b: Sim): boolean {
  const r = g.rel(a.id, b.id);
  const wasMet = r.met;
  r.met = true;
  r.last = g.clock.min;
  const ok = g.rng.chance(acceptChance(g, sd, a, b));
  const e = ok ? sd.ok : (sd.no ?? { f: -1 });
  const before = r.f;
  r.f = clamp(r.f + (e.f ?? 0), -100, 100);
  r.r = clamp(r.r + (e.r ?? 0), 0, 100);
  r.t = clamp(r.t + (e.t ?? 0), 0, 100);
  if (ok) {
    const soc = sd.ok.social ?? 0;
    g.addNeed(a, 'social', soc);
    g.addNeed(b, 'social', soc);
    if (sd.ok.fun) {
      g.addNeed(a, 'fun', sd.ok.fun);
      g.addNeed(b, 'fun', sd.ok.fun);
    }
  }
  if (e.ma) g.addMood(a, e.ma, { src: b.first });
  if (e.mb) g.addMood(b, e.mb, { src: a.first });
  g.bubble(a, ok ? (sd.ok.bubble ?? sd.icon) : (sd.no?.bubble ?? '😕'));
  g.bubble(b, ok ? (sd.ok.bubble ?? (sd.cat === 'mean' ? '💢' : '🙂')) : '🙄');
  const text = e.text ?? (ok ? `${sd.label}` : `${sd.label} – kam nicht gut an`);
  g.relHistory(a.id, b.id, `${a.first} → ${b.first}: ${text}`);
  if (ok && sd.cat === 'mean' && sd.ok.text) {
    g.memory(a, `${text} (${b.first})`, sd.icon);
    g.memory(b, `${text} (${a.first})`, sd.icon);
  }
  if (!wasMet) {
    g.bus.emit('meet', { sim: a.id, target: b.id });
    if (g.isControllable(a) || g.isControllable(b)) g.memory(g.isControllable(a) ? a : b, `${g.isControllable(a) ? b.first : a.first} kennengelernt`, '👋');
  }
  if (before < 40 && r.f >= 40) {
    g.addMood(a, 'newfriend', { src: b.first });
    g.addMood(b, 'newfriend', { src: a.first });
    g.memory(a, `Freundschaft mit ${b.first}`, '🤝', true);
    g.memory(b, `Freundschaft mit ${a.first}`, '🤝');
    if (g.isControllable(a) || g.isControllable(b)) g.notify(`${a.first} und ${b.first} sind jetzt befreundet!`, '🤝', a.id, 'good');
  }
  if (g.isControllable(a)) g.addSkill(a, 'charisma', sd.cat === 'mean' ? 2 : 6);
  sd.after?.(g, a, b, ok);
  g.bus.emit('social', { sim: a.id, target: b.id, id: sd.id, ok });
  return ok;
}

/** Verfügbarkeit für das Menü */
export function socialAvail(g: Game, sd: SocialDef, a: Sim, b: Sim): true | string | false {
  if (a.id === b.id) return false;
  if (b.age === 'baby') return false;
  if (a.age === 'baby' || a.age === 'toddler') return false;
  const r = g.peekRel(a.id, b.id) ?? { f: 0, r: 0, t: 30, met: false, h: [], last: 0 };
  if (sd.req) return sd.req(g, a, b, r);
  return true;
}

// Eine generische Interaktion je sozialer Handlung registrieren
const SOCIAL_AGES: AgeStage[] = ['child', 'teen', 'youngadult', 'adult', 'senior'];
for (const sd of SOCIALS) {
  def({
    id: `soc:${sd.id}`,
    label: sd.label,
    icon: sd.icon,
    on: 'sim',
    ages: SOCIAL_AGES,
    social: true,
    group: sd.cat === 'friendly' ? 'Freundlich' : sd.cat === 'funny' ? 'Lustig' : sd.cat === 'romantic' ? 'Romantisch' : sd.cat === 'mean' ? 'Gemein' : sd.cat === 'deep' ? 'Tiefgründig' : 'Familie',
    goal: sd.id,
    avail: (c) => (c.t ? socialAvail(c.g, sd, c.s, c.t) : false),
    dur: sd.dur,
    anim: sd.anim,
    start: (c: Ctx) => {
      const t = c.t!;
      if (t.away || t.trip) return `${t.first} ist nicht da`;
      const cur = t.queue[0];
      if (cur && (cur.def === 'sleep' || cur.def.startsWith('work') || cur.def === 'toilet' || cur.def === 'shower')) return `${t.first} ist beschäftigt`;
      if (t.rt.socialWith && t.rt.socialWith !== c.s.id) return `${t.first} unterhält sich gerade`;
      // Gegenüber reagiert (unterbricht autonome Handlungen)
      if (cur && !cur.user && cur.phase !== 'done' && !cur.def.startsWith('soc')) {
        cur.phase = 'done';
        cur.data = { ...(cur.data ?? {}), cancelled: 1 };
      }
      t.queue.unshift({ uid: nextActionUid(), def: 'socReact', target: c.s.id, phase: 'queued', t: 0, dur: sd.dur, user: false, data: { anim: sd.tAnim ?? 'listen' } });
      t.rt.socialWith = c.s.id;
      c.s.rt.socialWith = t.id;
    },
    tick: (c) => {
      // abwechselnd reden und zuhören
      if (sd.anim === 'talk' && Math.floor(c.a.t / 3) % 2 === 1) c.s.rt.anim = 'listen';
    },
    done: (c) => {
      applySocial(c.g, sd, c.s, c.t!);
    },
    end: (c) => {
      const t = c.t;
      if (t) {
        const r = t.queue.find((q) => q.def === 'socReact' && q.target === c.s.id);
        if (r) r.phase = 'done';
        t.rt.socialWith = null;
      }
      c.s.rt.socialWith = null;
    },
  });
}

def({
  id: 'socReact', label: 'Unterhalten', icon: '💬', on: 'sim', hidden: true, auto: false,
  route: () => null,
  dur: 60,
  anim: (c) => (String(c.a.data?.anim ?? 'listen') as AnimId),
  tick: (c, dt) => {
    if (c.t) {
      const dx = c.t.x - c.s.x,
        dz = c.t.z - c.s.z;
      c.s.rot = Math.atan2(dx, dz);
      if (Math.floor(c.a.t / 3) % 2 === 0 && c.a.data?.anim === 'listen') c.s.rt.anim = 'talk';
    }
    if (!c.t || !c.t.queue.some((q) => q.def.startsWith('soc:') && q.target === c.s.id)) {
      if (c.a.t > 1.5) c.a.phase = 'done';
    }
    void dt;
  },
});
