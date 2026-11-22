/* Menüs für Glitzergram, Mogul-Ranking, Immobilien und Körper (Training, Tattoo-Studio, Piercing, Barbier).
   Alles im selben Konsolen-Menü wie der Rest: Handy, Maus, Touch und Controller bedienen es gleich. */
import type { Game } from './Game';
import type { Item } from '../ui/ui';
import { esc, toast } from '../ui/ui';
import { sfx } from '../engine/Audio';
import { change } from './life';
import { BRIEFS, briefOpen, activeBrief, takeBrief, followers, photos, fmtNum } from './gram';
import { ranking, myRank, worth, mogulTitle, KINDS, rankUp } from './mogul';
import { BUSINESSES, owns, buy, priceOf } from './empire';
import { daily as bizDaily, issueOf } from './manage';
import { TRAININGS, train, muskel, musName, TATTOOS, PIERCINGS, BEARDS, BEARD_COLORS, LASER, tattoos, piercings, beardOf, setTattoo, setPiercing, setBeard, SESSIONS, type Train } from './figur';

type Frame = (title: string, body: string) => string;

/* ---------- Glitzergram ---------- */
export function gramMenu(g: Game, frame: Frame, home: () => void) {
  const s = g.save.data, b = activeBrief(s), list = photos().slice(0, 9);
  const close = () => { g.closeMenu(); g.touch.show(true); };
  const grid = list.length ? `<div class="gramGrid">${list.map((p) => `<figure><img src="${p.img}" alt=""><figcaption>❤️ ${fmtNum(p.likes)} · ${esc(p.spot)}${p.cap ? `<br><i>${esc(p.cap)}</i>` : ''}${p.comments[0] ? `<br><small>@${esc(p.comments[0][0])}: ${esc(p.comments[0][1])}</small>` : ''}</figcaption></figure>`).join('')}</div>` : '<p><small>Noch keine Fotos. Starte den Fotomodus und zeig Rainbow City, wie du sie siehst.</small></p>';
  g.openMenu(frame('📸 Glitzergram', `<div class="pbody"><p><b>@${esc((s.name || 'du').toLowerCase().replace(/\s+/g, '.'))}</b> · ${fmtNum(followers(s))} Follower · ${Number(s.flags.gramPosts) || 0} Beiträge · Rekord ❤️ ${fmtNum(Number(s.flags.gramLikes) || 0)}</p>${b ? `<p>🤝 Aktiver Auftrag: <b>${b.icon} ${esc(b.brand)}</b><br><small>${esc(b.text)}</small></p>` : ''}${grid}</div>`), [
    { icon: '📷', label: 'Fotomodus starten', sub: g.city.driving ? 'Erst aussteigen' : 'Drohne oder Selfie, Filter, Posen · Zeit läuft weiter', disabled: g.where !== 'city' || g.city.driving, fn: () => { close(); g.city.photos.start(); } },
    { icon: '🤝', label: 'Kooperationen', sub: `${BRIEFS.filter((x) => briefOpen(s, x)).length} Angebote · ${BRIEFS.filter((x) => s.flags['brief_' + x.id]).length}/${BRIEFS.length} erledigt`, fn: () => briefMenu(g, frame, () => gramMenu(g, frame, home)) },
    { icon: '💡', label: 'Tipps für mehr Likes', sub: 'Licht, Orte, Leute, Filter', fn: () => { close(); g.dialog.say([
      { who: '📸 Zoe Funkel', color: '#ff6ad5', text: 'Goldene Stunde! Kurz nach Sonnenaufgang und vor Sonnenuntergang wirkt alles teurer. Nachts gewinnen Neon-Orte wie das Prisma oder die Wolke 7.' },
      { who: '📸 Zoe Funkel', color: '#ff6ad5', text: 'Leute im Bild bringen Likes, die Parade am Samstag am meisten. Ein Regenbogen nach dem Regen ist Gold wert. Und dreimal derselbe Ort hintereinander langweilt.' },
      { who: '📸 Zoe Funkel', color: '#ff6ad5', text: 'Selfies mögen die Leute lieber als Landschaft. Und ja: Training, Tattoos und ein mutiges Outfit fallen auf. Aber am meisten fällt auf, wer sich wohlfühlt.' }]); } },
    { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
}
function briefMenu(g: Game, frame: Frame, back: () => void) {
  const s = g.save.data, b = activeBrief(s);
  g.openMenu(frame('🤝 Kooperationen', `<div class="pbody"><p>Marken aus Rainbow City zahlen für Fotos, die ihre Bedingungen erfüllen. Immer nur ein Auftrag gleichzeitig. Erfüllt ist er, sobald du ein passendes Foto postest.</p></div>`), [
    ...BRIEFS.map((x) => {
      const done = !!s.flags['brief_' + x.id], open = briefOpen(s, x), cur = b?.id === x.id;
      return { icon: done ? '✅' : x.icon, label: `${x.brand}${cur ? ' · läuft' : ''}`, sub: done ? 'erledigt' : !open ? `ab ${fmtNum(x.need)} Followern` : `${x.pay} € · +${x.fol} Follower · ${x.text}`, disabled: done || !open,
        fn: () => { const why = takeBrief(s, x.id); if (why) { sfx('miss'); toast(why); return; } sfx('win'); toast(`🤝 ${x.who}: „Ich freu mich auf dein Foto!“`); g.save.write(); briefMenu(g, frame, back); } } as Item;
    }),
    { icon: '←', label: 'Zurück', fn: back }], back, 'phone');
}

/* ---------- Imperium und Mogul-Ranking ---------- */
export function empireMenu(g: Game, frame: Frame, home: () => void, kind = '') {
  const s = g.save.data, back = kind ? () => empireMenu(g, frame, home) : home;
  if (!kind) {
    const up = rankUp(s); if (up) g.save.write();
    g.openMenu(frame('🏙️ Imperium', `<div class="pbody"><p>Läden, Bars, Clubs, Kultur und Hotels: Jedes Geschäft zahlt jeden Morgen aus und bringt Ruf. Hotels sind am Wochenende voll, zur Parade ausgebucht.</p><p>💼 <b>${BUSINESSES.filter((b) => owns(s, b.id)).length}</b> von ${BUSINESSES.length} Geschäften · Einnahmen <b>${BUSINESSES.filter((b) => owns(s, b.id)).reduce((n, b) => n + bizDaily(s, b).net, 0)} €</b> am Tag<br>👑 Vermögen ${fmtNum(worth(s))} € · Platz ${myRank(s)} · ${mogulTitle(s)}</p></div>`), [
      { icon: '🏆', label: 'Mogul-Ranking', sub: `Platz ${myRank(s)} von ${ranking(s).length} · Wer besitzt Rainbow City?`, fn: () => mogulMenu(g, frame, () => empireMenu(g, frame, home)) },
      ...KINDS.map((k) => { const all = BUSINESSES.filter(k.of), mine = all.filter((b) => owns(s, b.id)); return { icon: k.icon, label: k.name, sub: `${mine.length}/${all.length} gehören dir${mine.length ? ` · +${mine.reduce((n, b) => n + bizDaily(s, b).net, 0)} € am Tag` : ''}`, fn: () => empireMenu(g, frame, home, k.id) } as Item; }),
      { icon: '←', label: 'Zurück', fn: home }], home, 'phone');
    return;
  }
  const k = KINDS.find((x) => x.id === kind)!, list = BUSINESSES.filter(k.of);
  g.openMenu(frame(`${k.icon} ${k.name}`, `<div class="pbody">${list.map((b) => `<p>${b.icon} <b>${b.name}</b>${b.area ? ` <small>· ${b.area}</small>` : ''}${owns(s, b.id) ? ' · <b style="color:#3ee69a">gehört dir</b>' : ''}<br><small>${b.pitch}</small></p>`).join('')}</div>`), [
    ...list.map((b) => {
      const mine = owns(s, b.id), lock = !mine ? b.lock?.(s) : null, price = priceOf(s, b);
      return { icon: b.icon, label: mine ? `${b.name} ✓` : b.gift ? b.name : `${b.name} kaufen`, disabled: !mine && (!!b.gift || !!lock),
        sub: mine ? `${issueOf(s, b.id) ? '⚠️ Problem · ' : ''}+${bizDaily(s, b).net} € am Tag · führen: Personal, Ausbau, Events` : b.gift || lock || `${price} €${price < b.price ? ` (statt ${b.price} €)` : ''} · +${b.daily} €/Tag${b.kind === 'hotel' ? ' (Wochenende mehr)' : ''} · ab ${b.need} Ruf`,
        fn: () => {
          if (mine) { g.phone('biz_' + b.id); return; }
          const why = buy(s, b); if (why) { sfx('miss'); toast(why); return; }
          sfx('win'); g.hud.banner(`${b.icon} ${b.name} gehört jetzt dir!`, `+${b.daily} € jeden Tag · +${b.rep} Ruf`, 'good', 4000);
          const up = rankUp(s); if (up) setTimeout(() => g.hud.banner(`🏆 Platz ${up} im Mogul-Ranking`, up === 1 ? 'Du bist die Nummer eins von Rainbow City!' : 'Du steigst auf.', 'good', 4200), 4300);
          g.save.write(); g.city.refreshHud(); empireMenu(g, frame, home, kind);
        } } as Item;
    }),
    { icon: '←', label: 'Zurück', fn: back }], back, 'phone');
}
export function mogulMenu(g: Game, frame: Frame, back: () => void) {
  const s = g.save.data, r = ranking(s);
  g.openMenu(frame('🏆 Mogul-Ranking', `<div class="pbody"><p>Der Rainbow-Kurier zählt jede Woche nach: Geld, Häuser, Geschäfte und was drinsteckt.</p>${r.map((x, i) => `<p${x.me ? ' style="color:#ffd23b"' : ''}>${i + 1}. ${x.icon} <b>${esc(x.name)}</b> · ${fmtNum(x.worth)} €<br><small>${esc(x.who)}${x.out ? ' · aus dem Rennen' : ''}</small></p>`).join('')}</div>`),
    [{ icon: '←', label: 'Zurück', fn: back }], back, 'phone');
}

/* ---------- Muckibude ---------- */
export function gymItems(g: Game, close: () => void): Item[] {
  const s = g.save.data, m = muskel(s), left = Math.max(0, SESSIONS - (s.flags.musToday === s.day ? Number(s.flags.musN) || 0 : 0));
  const run = (kind: Train) => () => {
    const t = TRAININGS[kind];
    if (s.needs.energy < 20) { toast('Zu erschöpft fürs Training. Schlaf dich aus oder trink was.'); sfx('miss'); return; }
    if (s.money < t.cost) { toast('Nicht genug Geld.'); sfx('miss'); return; }
    s.money -= t.cost; close();
    g.fade(() => {
      g.pass(t.min); change(s, t.d);
      const gain = train(s, kind);
      g.save.write(); g.city.refreshHud(); void g.city.rebuildPlayer(); if (g.where === 'inside') void g.inside?.syncPlayer();
      if (gain) g.hud.banner(`💪 Muskeln +${gain}`, `${muskel(s)}/100 · ${musName(muskel(s))}`, 'good', 3600); else toast('Gut geschwitzt! Für heute wachsen keine Muskeln mehr, der Körper braucht Pause.');
    });
  };
  return [
    { icon: TRAININGS.kraft.icon, label: TRAININGS.kraft.name, sub: `${TRAININGS.kraft.cost} € · 1 Stunde · Muskeln ${m}/100 · heute noch ${left}× wirksam`, fn: run('kraft') },
    { icon: TRAININGS.coach.icon, label: TRAININGS.coach.name, sub: `${TRAININGS.coach.cost} € · 90 Minuten · doppelt so viel Muskeln`, fn: run('coach') },
  ];
}

/* ---------- Tattoo-Studio, Piercing, Barbier (Boutique) ---------- */
export function bodyItems(g: Game, back: () => void): Item[] {
  return [
    { icon: '🖋️', label: 'Tattoo-Studio „Tinte & Stolz“', sub: `Ink-Ines sticht · ${tattoos(g.save.data).length} Tattoos`, fn: () => tattooMenu(g, back) },
    { icon: '💍', label: 'Piercing', sub: `${piercings(g.save.data).length} Piercings · steril, mit Pflegetipps`, fn: () => pierceMenu(g, back) },
    { icon: '💈', label: 'Barbier-Stuhl', sub: beardOf(g.save.data) ? BEARDS.find((b) => b.id === beardOf(g.save.data).split(':')[0])?.name || 'Bart' : 'Glatt rasiert', fn: () => barberMenu(g, back) },
  ];
}
const panel = (t: string, d: string) => `<div class="col"><div class="panel"><h3>${t}</h3><p>${d}</p><div class="slot"></div></div></div>`;
function after(g: Game, why: string | null, ok: string, again: () => void) {
  if (why) { sfx('miss'); toast(why); return; }
  sfx('win'); toast(ok); g.save.write(); g.city.refreshHud(); void g.city.rebuildPlayer(); if (g.where === 'inside') void g.inside?.syncPlayer(); again();
}
function tattooMenu(g: Game, back: () => void) {
  const s = g.save.data, have = tattoos(s), again = () => tattooMenu(g, back);
  g.openMenu(panel('🖋️ Tinte & Stolz', 'Ink-Ines: „Jedes Motiv steche ich nur, wenn du es wirklich willst. Zu sehen sind Tattoos, wenn du Haut zeigst: oberkörperfrei, Badesachen oder Harness.“'), [
    ...TATTOOS.map((t) => { const on = have.includes(t.id); return { icon: on ? '✅' : t.icon, label: `${t.name} · ${t.where}`, sub: on ? `weglasern: ${LASER} €` : `${t.price} € · ${t.text}`, fn: () => after(g, setTattoo(s, t.id, !on), on ? 'Weggelasert. Brennt kurz, dann ist es weg.' : `${t.icon} Gestochen! Ines klebt Folie drauf. Drei Tage eincremen.`, again) } as Item; }),
    { icon: '←', label: 'Zurück', fn: back }], back, '');
}
function pierceMenu(g: Game, back: () => void) {
  const s = g.save.data, have = piercings(s), again = () => pierceMenu(g, back);
  g.openMenu(panel('💍 Piercing', 'Steril, mit Einwegnadel und Titanschmuck. Rausnehmen kostet nichts.'), [
    ...PIERCINGS.map((p) => { const on = have.includes(p.id); return { icon: on ? '✅' : p.icon, label: p.name, sub: on ? 'rausnehmen (kostenlos)' : `${p.price} €`, fn: () => after(g, setPiercing(s, p.id, !on), on ? 'Rausgenommen.' : `${p.icon} Sitzt! Zwei Wochen nicht dran drehen.`, again) } as Item; }),
    { icon: '←', label: 'Zurück', fn: back }], back, '');
}
function barberMenu(g: Game, back: () => void, color = '') {
  const s = g.save.data, cur = beardOf(s).split(':'), col = color || cur[1] || 'dunkel', again = () => barberMenu(g, back, col);
  const ci = BEARD_COLORS.findIndex((c) => c.id === col);
  g.openMenu(panel('💈 Barbier-Stuhl', 'Heißes Tuch, scharfes Messer, ruhige Hand. Bärte stehen allen, die einen wollen.'), [
    { icon: '🎨', label: 'Farbe', value: () => BEARD_COLORS[Math.max(0, ci)].name, left: () => barberMenu(g, back, BEARD_COLORS[(ci - 1 + BEARD_COLORS.length) % BEARD_COLORS.length].id), right: () => barberMenu(g, back, BEARD_COLORS[(ci + 1) % BEARD_COLORS.length].id) },
    ...BEARDS.map((b) => ({ icon: (cur[0] || '') === b.id ? '✅' : b.icon, label: b.name, sub: `${b.price} €`, fn: () => after(g, setBeard(s, b.id, col), b.id ? `${b.icon} Frisch gestutzt!` : '🪒 Glatt wie ein Babypopo.', again) } as Item)),
    { icon: '←', label: 'Zurück', fn: back }], back, '');
}
export const muskelLine = (g: Game) => { const m = muskel(g.save.data); return `💪 Muskeln ${m}/100 (${musName(m)}) · 🖋️ ${tattoos(g.save.data).length} Tattoos · 💍 ${piercings(g.save.data).length} Piercings`; };
/** Stelle im Laden: Studio (Boutique) oder Hantelbank (Muckibude) */
export function bodyMenu(g: Game, what: 'studio' | 'gym') {
  const close = () => { g.closeMenu(); g.touch.show(true); }, again = () => bodyMenu(g, what);
  g.touch.show(false);
  if (what === 'gym') g.openMenu(panel('💪 Hantelbank', `Coach Mehmet: „Rücken gerade, Krone richten! Muskeln wachsen beim Training und in der Pause danach. Zwei Einheiten am Tag zählen.“<br>${muskelLine(g)}`), [...gymItems(g, close), { icon: '←', label: 'Zurück', fn: close }], close, '');
  else g.openMenu(panel('🖋️ Tinte & Stolz', `Ink-Ines, Piercerin Dilek und Barbier Yusuf teilen sich die Ecke hinten in der Boutique.<br>${muskelLine(g)}`), [...bodyItems(g, again), { icon: '←', label: 'Zurück', fn: close }], close, '');
}
