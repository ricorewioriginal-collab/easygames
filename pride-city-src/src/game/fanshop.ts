/* Fanshop & Cam (nur mit „Inhalte ab 18“): Getragenes an Fans verkaufen (Socken, Unterwäsche, auch „nach einer
   wilden Nacht“, benutzte Kondome für Sammler*innen) und Cam-Shows vor dem Laptop zu Hause mit Live-Chat und Trinkgeld.
   Selbstbestimmte Sexarbeit unter Erwachsenen. Alles nur als Text und Andeutung: Spuren werden beschrieben, nie gezeigt,
   vor der Kamera geht es höchstens bis zur Unterwäsche, der Rest ist Abblende. */
import type { SaveData } from '../engine/Save';
import type { Game } from './Game';
import type { Line } from '../ui/ui';
import { Vector3 } from '../engine/bjs';
import { toast } from '../ui/ui';
import { sfx, music, moan, breath, now } from '../engine/Audio';
import { change } from './life';
import { post } from './social';
import { pcEvents } from './hooks';
import type { Anim } from './Actor';

const n = (s: SaveData, k: string) => Number(s.flags[k]) || 0;
export const fans = (s: SaveData) => n(s, 'drehFans');
/** War heute etwas los (Nacht, Gruppe, Solo)? Dann sind die Sachen „mit Spuren“ und mehr wert */
const wild = (s: SaveData) => s.flags.wild === s.day || s.flags.soloDay === s.day;

export interface FanItem { id: string; icon: string; name: string; sub: string; price: number; can: boolean; why?: string }
/** Was heute verkauft werden kann (Preis steigt mit den Fans) */
export function fanItems(s: SaveData): FanItem[] {
  const f = fans(s), bonus = Math.min(60, Math.floor(f / 100)), w = wild(s), sold = (k: string) => s.flags['fs_' + k] === s.day;
  const c = n(s, 'usedC');
  return [
    { id: 'socken', icon: '🧦', name: 'Getragene Socken', sub: 'einen Tag lang, mit Duftnote', price: 12 + Math.round(bonus / 3), can: !sold('socken'), why: 'heute schon verkauft' },
    { id: 'unterhose', icon: '🩲', name: w ? 'Unterhose nach der Nacht' : 'Getragene Unterhose', sub: w ? 'mit eindeutigen Spuren der letzten Nacht, vakuumverpackt' : 'den ganzen Tag getragen', price: (w ? 55 : 28) + bonus, can: !sold('unterhose'), why: 'heute schon verkauft' },
    { id: 'shirt', icon: '👕', name: 'Durchgeschwitztes Shirt', sub: 'nach dem Tanzen oder dem Fitnessstudio', price: 18 + Math.round(bonus / 2), can: !sold('shirt') && s.needs.hygiene < 60, why: sold('shirt') ? 'heute schon verkauft' : 'erst mal ins Schwitzen kommen (Tanzen, Sport)' },
    { id: 'kondom', icon: '🎈', name: 'Benutztes Kondom', sub: c ? `für Sammler*innen, verknotet und diskret verpackt · ${c} übrig` : 'erst nach einer Nacht mit Kondom', price: 20 + Math.round(bonus / 2), can: c > 0, why: 'keins da – nach einer Nacht mit Kondom aufheben' },
  ];
}
/** Verkaufen: Geld, Fans, Paket geht raus */
export function sellFan(s: SaveData, id: string) {
  const it = fanItems(s).find((x) => x.id === id); if (!it || !it.can) return null;
  if (id === 'kondom') s.flags.usedC = Math.max(0, n(s, 'usedC') - 1); else s.flags['fs_' + id] = s.day;
  const add = 5 + Math.floor(Math.random() * 15);
  s.money += it.price; s.flags.drehFans = fans(s) + add; s.flags.fanSold = n(s, 'fanSold') + 1;
  return { it, add };
}
/** Kondom aufheben statt wegwerfen (nach einer Nacht mit Kondom, höchstens 5) */
export function keepCondom(s: SaveData, k = 1) { s.flags.usedC = Math.min(5, n(s, 'usedC') + k); }

/* ---------- Cam-Show ---------- */
const CHAT = ['hiii 😍', 'endlich live!!', 'dreh dich mal 🙈', 'wer ist noch wach?', 'das Licht ist so schön', '🔥🔥🔥', 'grüße aus Köln!', 'du bist mein Lieblingsstream', 'mehr!!', 'Daddy approves 🥃', 'wuff 🐶', 'hab grad 5 € geschickt 💸', 'ich schmelze', 'zeig das Tattoo!'];
interface CamAct { label: string; anim: Anim; outfit?: 'shirtless' | 'underwear'; tip: [number, number]; text: string; adult?: boolean }
const ACTS: CamAct[][] = [
  [{ label: '👋 Winken und plaudern', anim: 'wave', tip: [5, 15], text: 'Du erzählst vom Tag. Der Chat lacht mit.' }, { label: '💃 Zur Musik tanzen', anim: 'dance2', tip: [10, 25], text: 'Hüften, Haare, Hingabe. Die Herzen fliegen.' }],
  [{ label: '👕 Langsam das Shirt aus', anim: 'dance1', outfit: 'shirtless', tip: [20, 45], text: 'Stück für Stück. Der Chat zählt laut mit.' }, { label: '🎲 Glücksrad drehen lassen', anim: 'laugh', tip: [12, 40], text: 'Das Rad landet auf „Sexy Wackeln“. Natürlich.' }],
  [{ label: '🩲 Bis auf die Unterwäsche', anim: 'dance3', outfit: 'underwear', tip: [35, 80], text: 'Jetzt nur noch Stoff und Selbstbewusstsein. Die Zuschauerzahl springt.' }, { label: '💬 Einen Wunsch erfüllen', anim: 'cheer', tip: [25, 60], text: 'Jemand wünscht sich deinen „besten Schlafzimmerblick“. Geliefert.' }],
  [{ label: '🔥 Privatshow (Kamera dimmt)', anim: 'idle', tip: [60, 140], text: 'Licht runter, Musik rauf. Was jetzt passiert, sieht nur, wer bezahlt hat – und selbst die sehen nur Schatten.' }, { label: '😘 Kusshand und Schluss', anim: 'wave', tip: [10, 30], text: 'Du verabschiedest dich charmant. Morgen gleiche Zeit?' }],
];
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

/** Cam-Show vor dem Laptop (nur zu Hause, einmal am Tag): vier Runden mit Chat und Trinkgeld */
export function camShow(g: Game) {
  const s = g.save.data, h = g.home;
  if (!s.settings.adult) { toast('Nur mit „Inhalte ab 18“ (Optionen).'); return; }
  if (!h || !s.inside) { toast('💻 Cam-Shows gibt es nur zu Hause vor dem Laptop. Geh in deine Wohnung.'); sfx('miss'); return; }
  if (s.flags.camDay === s.day) { toast('Heute warst du schon live. Morgen wieder! 📷'); return; }
  s.flags.camDay = s.day;
  h.cineStart();
  const me = h.player, myOutfit = me.look.outfit || 'clothed';
  me.root.rotationQuaternion = null; me.root.position.set(.9, 0, 2.05); me.root.rotation.set(0, Math.PI, 0); me.play('wave', .3);   // vor dem Sofa, Laptop auf dem Couchtisch
  const camPos = new Vector3(.9, 1.4, .3), look = new Vector3(.9, 1.2, 2.05);
  const box = document.createElement('div'); box.className = 'cine tape cam';
  box.innerHTML = '<i></i><i></i><p>📷 Live auf deinem Fan-Kanal</p><b class="rec">● LIVE <span>0</span> 👀</b><ul class="camchat"></ul><em class="camtip">💸 0 €</em>';
  document.body.appendChild(box);
  const chat = box.querySelector('.camchat') as HTMLElement, viewEl = box.querySelector('.rec span') as HTMLElement, tipEl = box.querySelector('.camtip') as HTMLElement;
  let view = 20 + Math.floor(fans(s) / 30), tips = 0, T = 0, nextChat = .5;
  const say = (t: string) => { const li = document.createElement('li'); li.textContent = t; chat.appendChild(li); while (chat.children.length > 6) chat.firstElementChild!.remove(); };
  music('club');
  h.cine = (dt) => {
    T += dt; me.update(dt);
    h.camera.position.copyFrom(camPos); h.camera.position.x += Math.sin(T * .7) * .03; h.camera.setTarget(look);
    nextChat -= dt; if (nextChat < 0) { nextChat = .8 + Math.random() * 1.6; say(`@fan${rnd(10, 999)}: ${CHAT[rnd(0, CHAT.length - 1)]}`); view += rnd(-2, 6); viewEl.textContent = String(Math.max(3, view)); }
  };
  const end = () => {
    h.cine = null; box.remove(); me.setLook({ outfit: myOutfit }); me.play('idle');
    const add = Math.round(tips / 3) + rnd(10, 40);
    s.money += tips; s.flags.drehFans = fans(s) + add; s.flags.camN = n(s, 'camN') + 1;
    change(s, { fun: 15, social: 15, energy: -15 }); g.pass(60);
    post(s, 'Du', '📷 Danke für den Stream gestern! Ihr seid die Besten. 💜');
    pcEvents.emit('camShow', { tips, fans: add });
    g.save.write(); g.city.refreshHud(); music('home');
    h.cineEnd(() => g.hud.banner('📷 Stream beendet', `Trinkgeld +${tips} € · Fans +${add}`, 'good', 4200))();
  };
  const round = (i: number) => {
    if (i >= ACTS.length) { end(); return; }
    const L: Line = { who: '💻 Cam-Show', color: '#ff4fa3', text: `Runde ${i + 1}/4 · ${Math.max(3, view)} schauen zu. Was machst du?`, choices: ACTS[i].map((a) => ({ label: a.label, sub: `${a.tip[0]}–${a.tip[1]} € Trinkgeld`, fn: () => {
      me.play(a.anim, .4, a.anim === 'idle' ? .6 : 1); if (a.outfit) me.setLook({ outfit: a.outfit });
      const tip = rnd(a.tip[0], a.tip[1]) + Math.floor(fans(s) / 200); tips += tip; view += rnd(5, 25); tipEl.textContent = `💸 ${tips} €`; sfx('coin');
      say(`💸 @fan${rnd(10, 999)} schickt ${tip} €`);
      if (a.label.startsWith('🔥')) { const b = document.createElement('div'); b.className = 'cineBlack'; document.body.appendChild(b); breath(now() + .05, 1, .06); moan(now() + 1.2, me.avatar.g === 'f' ? 215 : 120, .8, .06, 'a'); setTimeout(() => b.remove(), 2600); }
      setTimeout(() => g.dialog.say([{ who: '💻 Cam-Show', color: '#ff4fa3', text: a.text }], () => round(i + 1)), a.label.startsWith('🔥') ? 2700 : 600);
    } })) };
    g.dialog.say([L]);
  };
  setTimeout(() => round(0), 900);
}
