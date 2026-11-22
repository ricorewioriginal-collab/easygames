/* Gespräche mit allen erwachsenen Figuren: Plaudern, Flirten (18+), One-Night-Stand mit Filmszene (liebe.ts über
   HomeScene.romance), Hausparty mit geschlossener Tür, Darkroom. Zustimmung beider ist Pflicht, Kondom oder in Absprache
   ohne (mit STI-Risiko, sti.ts). Alles bleibt Andeutung: Wortwitz, Unterwäsche, Kuss, Abblende. */
import type { Game } from './Game';
import type { Actor, Look } from './Actor';
import type { InteriorScene } from './InteriorScene';
import type { Line } from '../ui/ui';
import { toast } from '../ui/ui';
import { sfx, nightSounds, loveNight } from '../engine/Audio';
import { change, hour, minutesUntil } from './life';
import { post, canMeet } from './social';
import { condomLabel } from './toys';
import { pcEvents } from './hooks';
import { CHAT, TEASE, PICKUP, DARK, hash, flirted, flirtTry, nightAnswer, nightReview, starLine, partySummary, type Stranger } from './flirt';
import { exposure, untreated, inTreatment, hivUU } from './sti';
import { DARKROOM, PLACE_THEMES } from './interiors';

export interface TalkOpts { actor?: Actor; room?: InteriorScene; look?: Look; opening?: string; kid?: boolean }

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const night = (title: string, tags: string[]) => { const b = document.createElement('div'); b.className = 'night'; b.innerHTML = `<p>${esc(title)}</p><small>${tags.map(esc).join(' · ')}</small>`; document.body.appendChild(b); return b; };
const evening = (h: number) => h >= 19 || h < 5;

/** Gespräch mit einer fremden Person; end() läuft, wenn das Gespräch vorbei ist */
export function strangerTalk(g: Game, st: Stranger, o: TalkOpts, end?: () => void) {
  const s = g.save.data, adult = s.settings.adult && !o.kid, dark = o.room?.theme.id === 'darkroom';
  const N = (text: string, choices?: Line['choices']): Line => ({ who: st.name, color: st.color, text, choices });
  const h = hash(st.key + s.day);
  let then: (() => void) | null = null;
  const run = (lines: Line[]) => g.dialog.say(lines, () => { const f = then; then = null; if (f) f(); else end?.(); });
  const first = dark ? DARK[h % DARK.length] : adult && h % 3 !== 0 ? TEASE[h % TEASE.length] : o.opening || CHAT[h % CHAT.length];
  const k = 'tk_' + hash(st.key).toString(36);
  if (s.flags[k] !== s.day) { s.flags[k] = s.day; change(s, { social: 6, fun: 2 }); g.city.refreshHud(); }

  const menu = (text: string): Line => {
    const c: NonNullable<Line['choices']> = [];
    c.push({ label: '💬 Plaudern', fn: () => { then = () => run([N(CHAT[(h + Math.floor(Math.random() * 99)) % CHAT.length]), menu('Sonst noch was?')]); } });
    if (adult) c.push({ label: flirted(s, st.key) ? '😏 Weiterflirten' : '😏 Anflirten', fn: () => { then = () => pickup(); } });
    if (adult && flirted(s, st.key)) c.push({ label: dark ? '🖤 Weiter nach hinten?' : '🔥 Kommst du mit zu mir?', sub: 'nur wenn ihr beide wollt', fn: () => { then = () => ask(); } });
    if (o.room?.partyPlace && evening(hour(s)) && !dark) c.push({ label: adult ? '🎉 Hausparty, Tür zu …' : '🎉 Hausparty steigen lassen', sub: s.flags.party === s.day ? 'heute schon gefeiert' : '3 Stunden · alle machen mit', fn: () => { if (s.flags.party === s.day) { toast('Heute wurde schon gefeiert. Morgen wieder! 🎉'); return; } then = () => houseParty(g, st, o.room!, adult, end); } });
    c.push({ label: '👋 Tschüss', fn: () => { then = () => run([N(adult && h % 2 ? 'Bis bald, Hübsche*r. Du weißt ja, wo du mich findest. 😘' : 'Mach\'s gut! Schön, dich getroffen zu haben.')]); } });
    return N(text, c);
  };
  const pickup = () => {
    const i0 = (h + Number(s.flags.ons || 0)) % PICKUP.length, opts = [0, 2, 4].map((d) => (i0 + d) % PICKUP.length);
    run([{ who: 'Du', color: '#ff4fa3', text: 'Was sagst du?', choices: opts.map((i) => ({ label: PICKUP[i][0], fn: () => {
      const ok = flirtTry(s, st.key, i); sfx(ok ? 'giggle' : 'miss'); if (ok) change(s, { fun: 5 });
      then = () => run([N(ok ? PICKUP[i][1] : PICKUP[i][2]), menu(ok ? 'Und jetzt? 😏' : 'Na gut … sonst noch was?')]);
    } })) }]);
  };
  const ask = () => {
    const a = nightAnswer(s, st.key);
    if (!a.yes) { then = () => run([{ who: 'Du', color: '#ff4fa3', text: 'Alles gut, ein Nein ist ein Nein. 💜' }, menu('Danke, dass du das so locker nimmst.')]); run([N(a.text)]); return; }
    if (inTreatment(s).length || untreated(s).length) {
      const why = inTreatment(s).length ? 'Du bist noch in Behandlung.' : 'Du hast Symptome, die du noch nicht hast checken lassen.';
      run([{ who: 'Du', color: '#ff4fa3', text: `${why} Fair ist: erst auskurieren, dann wieder Spaß. Du sagst es ehrlich.` }, N('Danke für die Ehrlichkeit. Melde dich, wenn du wieder fit bist. 💜')]); return;
    }
    run([N(a.text), protect(g, st, dark, (bare) => { then = () => oneNight(g, st, o, bare, end); })]);
  };
  run([N(first), menu(adult ? 'Und, was machen wir zwei Hübschen jetzt?' : 'Was gibt\'s?')]);
}

/** Absprache vorher: mit Kondom oder – nur wenn beide das wollen – ohne */
function protect(g: Game, st: Stranger, dark: boolean, go: (bare: boolean) => void): Line {
  const s = g.save.data, has = (s.inv.condom || 0) > 0, prep = s.health.prep, uu = hivUU(s);
  return { who: st.name, color: st.color, text: `Kurz abgesprochen: ${dark ? 'hier hinten' : 'bei dir'} mit Gummi${prep ? ' – oder du bist auf PrEP?' : '?'}`, choices: [
    { label: has ? `🎈 Mit Kondom (${condomLabel(s)})` : '🎈 Mit Kondom – hab aber keins', sub: has ? `du hast ${s.inv.condom}` : 'Späti, Checkpoint, Automat im Darkroom', fn: () => {
      if (!has) { setTimeout(() => g.dialog.say([{ who: st.name, color: st.color, text: dark ? 'Der Automat hängt gleich an der Wand. Ich warte. 😏' : 'Dann holen wir beim Späti welche. Oder nächstes Mal. 😉' }]), 50); return; }
      go(false);
    } },
    { label: '⚠️ Ohne Kondom – in Absprache', sub: `${prep ? 'PrEP schützt vor HIV, ' : uu ? 'du bist unter der Nachweisgrenze (U=U), ' : 'kein HIV-Schutz, '}Risiko für Chlamydien, Tripper, Syphilis`, fn: () => go(true) },
    { label: 'Doch lieber nicht', fn: () => setTimeout(() => g.dialog.say([{ who: st.name, color: st.color, text: 'Total okay. Kein Druck. 💜' }]), 50) },
  ] };
}

/** One-Night-Stand: Filmszene in deiner Wohnung (liebe.ts), Abblende, frecher Kommentar am Morgen */
function oneNight(g: Game, st: Stranger, o: TalkOpts, bare: boolean, end?: () => void) {
  const s = g.save.data, dark = o.room?.theme.id === 'darkroom';
  const lube = (s.inv.lube || 0) > 0;
  if (!bare && canMeet(s) === 'condom') return;
  const tags = ['Zustimmung ✔︎', bare ? 'Ohne Kondom (abgesprochen)' : `${condomLabel(s)} ✔︎`, lube ? 'Gleitgel ✔︎' : '', s.health.prep ? 'PrEP ✔︎' : ''].filter(Boolean);
  const after = (stay: boolean) => {
    if (!bare) s.inv.condom = Math.max(0, (s.inv.condom || 0) - 1);
    s.flags.lastNight = s.day;
    if (lube) s.inv.lube--;
    const r = nightReview(s, st.key), x = exposure(s, bare);
    s.rep += r.rep; change(s, { fun: r.fun, social: 20, hygiene: -25, energy: stay ? 100 : -15 });
    post(s, 'Du', dark ? 'Darkroom. Mehr sag ich nicht. 🖤' : `Nacht mit ${st.name}. ${starLine(r.stars)}`);
    pcEvents.emit('oneNight', { name: st.name, stars: r.stars, bare, dark: !!dark });
    g.save.write(); g.city.refreshHud();
    const lines: Line[] = [{ who: st.name, color: st.color, text: r.text }];
    if (bare) lines.push({ who: 'Du', color: '#ff4fa3', text: x.hiv || !s.health.prep ? 'Ohne Gummi und ohne PrEP … Wenn du unsicher bist: PEP gibt es bis 72 Stunden danach, und ein Test im Checkpoint schadet nie.' : 'PrEP schützt vor HIV, aber nicht vor allem anderen. In ein paar Tagen mal testen lassen.' });
    g.dialog.say(lines, () => { g.hud.banner(`${starLine(r.stars)} Nacht mit ${st.name}`, `Spaß +${r.fun}${r.rep ? ` · Ruf +${r.rep}` : ''}${s.flags.ons ? ` · Nummer ${s.flags.ons}` : ''}`, 'good', 4200); end?.(); });
  };
  if (dark) {
    // Darkroom: keine Filmszene, nur Nebel, Herzschlag und Abblende
    const b = night('🖤 Hinten im Darkroom …', tags); nightSounds();
    setTimeout(() => { g.pass(40); b.remove(); after(false); }, 2800);
    return;
  }
  const look: Look = { ...(o.look || { body: st.rb || 'Male_Adult_01', rb: st.rb, palette: 'rainbow', skin: 0 }), outfit: 'clothed', style: undefined };   // ohne Szene-Shirt, sonst malt es über die Unterwäsche
  g.enterHome(() => {
    void g.home!.romance(look, st.name, () => {
      const b = night(`💜 ${st.name} und du …`, tags); const wait = loveNight();
      setTimeout(() => {
        g.pass(minutesUntil(s, 8), true); s.flags.wild = s.day;
        const h = g.home!; h.showMess(); void h.morning(look);
        setTimeout(() => { b.remove(); after(true); }, 900);
      }, wait);
    });
  });
}

/** Hausparty: Musik und Licht, mit 18+ geht danach eine Tür zu. Abblende, witzige Zusammenfassung */
function houseParty(g: Game, st: Stranger, room: InteriorScene, adult: boolean, end?: () => void) {
  const s = g.save.data;
  s.flags.party = s.day; room.houseParty(true); sfx('cheer');
  toast(adult ? '🎶 Licht runter, Musik rauf …' : '🎶 Musik an, alle tanzen!');
  setTimeout(() => {
    sfx('door');
    const b = night(adult ? '🚪 Die Tür geht zu …' : '🎉 Die Party läuft …', adult ? ['Alle volljährig ✔︎', 'Alle wollen ✔︎', 'Kondomschale voll ✔︎', 'Nein heißt Nein ✔︎'] : ['Gute Musik ✔︎', 'Snacks ✔︎', 'Nachbarn eingeladen ✔︎']);
    if (adult) nightSounds();
    setTimeout(() => {
      g.pass(180); room.houseParty(false); b.remove();
      change(s, { social: 40, fun: 30, energy: -30, hygiene: adult ? -30 : -10 }); s.rep += adult ? 2 : 1;
      pcEvents.emit('hausparty', { host: st.name, adult });
      post(s, st.name, adult ? 'Gestern bei mir: legendär. Wer vermisst eine Unterhose? 🙈' : 'Danke an alle für gestern! Der Flamingo bleibt bei mir. 🦩');
      g.save.write(); g.city.refreshHud();
      g.dialog.say([{ who: st.name, color: st.color, text: partySummary(s, st.key, adult) }], () => { g.hud.banner(adult ? '🔥 Legendäre Nacht' : '🎉 Party des Jahres', `Kontakte +40 · Spaß +30 · Ruf +${adult ? 2 : 1}`, 'good', 4200); end?.(); });
    }, 2800);
  }, 3200);
}

/** Darkroom betreten: vorher Safer-Sex-Hinweis */
export function enterDarkroom(g: Game, from: InteriorScene) {
  const s = g.save.data;
  if (!s.settings.adult) { toast('Nur mit „Inhalte ab 18“ (Optionen).'); sfx('miss'); return; }
  const C = (text: string, choices?: Line['choices']): Line => ({ who: 'Awareness-Team', color: '#3ee69a', text, choices });
  g.dialog.say([
    C('Kurz bevor du reingehst: Hinter dem Vorhang ist es dunkel, rot und neblig. Nur Erwachsene, nur mit Zustimmung.'),
    C(`Safer Sex: Kondome gibt es am Automaten drinnen (du hast ${s.inv.condom || 0}). PrEP schützt vor HIV, Kondome auch vor vielen anderen STI. Ein „Nein“ oder ein Kopfschütteln heißt Nein.`),
    C('Wenn dir etwas komisch vorkommt: Wir stehen hier an der Tür. Viel Spaß! 🖤', [
      { label: '🖤 Durch den Vorhang', fn: () => { g.darkFrom = { theme: from.theme, place: from.placeId }; g.enterInterior(DARKROOM, g.insideBack, 'darkroom'); } },
      { label: 'Lieber nicht', fn: () => {} }]),
  ]);
}
/** Zurück aus dem Darkroom in den Club */
export function leaveDarkroom(g: Game) {
  const f = g.darkFrom; g.darkFrom = null;
  const th = f ? PLACE_THEMES[f.theme.id] || f.theme : null;
  if (th) { g.enterInterior(th, g.insideBack, f!.place); return true; }
  return false;
}
/** Kondomautomat im Darkroom */
export function darkVend(g: Game) {
  const s = g.save.data;
  if (s.money < 1) { toast('Nicht genug Geld.'); sfx('miss'); return; }
  s.money -= 1; s.inv.condom = (s.inv.condom || 0) + 1; sfx('coin'); toast(`Klack – ein Kondom. 🎈 Du hast ${s.inv.condom}.`); g.save.write(); g.city.refreshHud();
}
