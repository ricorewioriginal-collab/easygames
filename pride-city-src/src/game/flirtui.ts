/* Gespräche mit allen erwachsenen Figuren: Plaudern, Flirten (18+), One-Night-Stand mit Filmszene (liebe.ts über
   HomeScene.romance), Hausparty mit geschlossener Tür, Darkroom. Zustimmung beider ist Pflicht, Kondom oder in Absprache
   ohne (mit STI-Risiko, sti.ts). Alles bleibt Andeutung: Wortwitz, Unterwäsche, Kuss, Abblende. */
import type { Game } from './Game';
import type { Actor, Look } from './Actor';
import type { InteriorScene } from './InteriorScene';
import type { Line } from '../ui/ui';
import { toast } from '../ui/ui';
import { sfx, nightSounds } from '../engine/Audio';
import { change, hour, minutesUntil } from './life';
import { post, canMeet } from './social';
import { condomLabel } from './toys';
import { pcEvents } from './hooks';
import { CHAT, TEASE, PICKUP, DARK, hash, flirted, flirtTry, nightAnswer, nightReview, starLine, partySummary, type Stranger } from './flirt';
import { exposure, untreated, inTreatment, hivUU, partnerStatus } from './sti';
import { SZENE, szeneLine, type SzeneTyp } from './szene';
import { GUEST_POOL, stranger } from './flirt';
import type { GroupGuest } from './gruppe';
import { DARKROOM, PLACE_THEMES } from './interiors';
import { NIGHT_S, pairVoices, VIBES, type Vibe } from './liebe';
import { berufOf, meinBeruf } from './beruf';
import { tapeAsk, tapeAfter } from './dreh';
import { keepCondom } from './fanshop';
import { memOf, remember, greet, nextPart, heardPart, finish } from './leben';

export interface TalkOpts { actor?: Actor; room?: InteriorScene; look?: Look; opening?: string; kid?: boolean; /** Art der Straßenfigur (Street.ts), z. B. für den Beruf */ kind?: string; /** Szene-Art (szene.ts): Pup, Leder, Bear … */ szene?: string; /** Gedächtnis und eigene Geschichte (leben.ts) */ life?: { wanted: number; rain: boolean } }

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const night = (title: string, tags: string[]) => { const b = document.createElement('div'); b.className = 'night'; b.innerHTML = `<p>${esc(title)}</p><small>${tags.map(esc).join(' · ')}</small>`; document.body.appendChild(b); return b; };
const evening = (h: number) => h >= 19 || h < 5;

/** Gespräch mit einer fremden Person; end() läuft, wenn das Gespräch vorbei ist */
export function strangerTalk(g: Game, st: Stranger, o: TalkOpts, end?: () => void) {
  const s = g.save.data, adult = s.settings.adult && !o.kid, dark = o.room?.theme.id === 'darkroom';
  const ty: SzeneTyp | null = o.szene && SZENE[o.szene] && (adult || !SZENE[o.szene].adult) ? SZENE[o.szene] : null;
  // jede Figur hat einen Beruf (beruf.ts): steht neben dem Namen
  const job = berufOf(st.key, st.rb, adult, o.kind), mine = meinBeruf(s);
  const N = (text: string, choices?: Line['choices']): Line => ({ who: ty ? `${st.name} · ${ty.icon} ${ty.name}` : st.name.includes(job.name.slice(0, 5)) ? st.name : `${st.name} · ${job.icon} ${job.name}`, color: ty?.color || st.color, text, choices });
  const h = hash(st.key + s.day);
  let then: (() => void) | null = null;
  const run = (lines: Line[]) => g.dialog.say(lines, () => { const f = then; then = null; if (f) f(); else end?.(); });
  // Straßenleute erinnern sich an dich (leben.ts): Begrüßung nach Gedächtnis, Tageszeit, Wetter und Fahndung
  const mem0 = o.life ? memOf(s, st.key) : null;
  const first = mem0 && (mem0.met > 0 || mem0.near > 0 || o.life!.wanted >= 2 || !ty) ? greet(mem0, { hour: hour(s), rain: o.life!.rain, wanted: o.life!.wanted, name: s.name }, h)
    : ty ? szeneLine(ty, adult, h) : dark ? DARK[h % DARK.length] : adult && h % 3 !== 0 ? TEASE[h % TEASE.length] : o.opening || CHAT[h % CHAT.length];
  if (o.life) remember(s, st.key, 'talk');
  const k = 'tk_' + hash(st.key).toString(36);
  if (s.flags[k] !== s.day) { s.flags[k] = s.day; change(s, { social: 6, fun: 2 }); g.city.refreshHud(); }

  const menu = (text: string): Line => {
    const c: NonNullable<Line['choices']> = [];
    c.push({ label: '💬 Plaudern', fn: () => { then = () => run([N(CHAT[(h + Math.floor(Math.random() * 99)) % CHAT.length]), menu('Sonst noch was?')]); } });
    if (ty) c.push({ label: ty.act.label, fn: () => { sfx(ty.id === 'pup' ? 'squeak' : 'giggle'); change(s, { fun: ty.act.fun || 0, social: ty.act.social || 0 }); ty.anim[0] && o.actor?.play(ty.anim[0]); then = () => run([...ty.act.lines.map((x) => N(x)), menu('Und sonst?')]); } });
    // eigene Geschichte: ein Teil pro Tag, am Ende entscheidest du mit
    const part = o.life ? nextPart(s, st.key) : null, done = o.life ? memOf(s, st.key).done : undefined;
    if (part) c.push({ label: part.i === 0 ? '💭 Wie geht\'s dir so?' : `${part.story.icon} ${part.story.title} (${part.i + 1}/4)`, sub: part.i === 0 ? 'Jede Person hat ihre eigene Geschichte' : 'Wie geht es weiter?', fn: () => {
      heardPart(s, st.key); change(s, { social: 4 });
      if (part.i < 3) { then = () => run([N(part.text), menu(part.i === 2 ? 'Morgen weiß ich mehr. Sonst noch was?' : 'Erzähl ich dir ein andermal weiter. Sonst noch was?')]); return; }
      then = () => run([N(part.text), { who: 'Du', color: '#ff4fa3', text: 'Ich an deiner Stelle …', choices: part.story.end.map((e) => ({ label: e.label, fn: () => {
        finish(s, st.key, e); change(s, { social: e.social || 0, fun: e.fun || 0 }); sfx('win');
        post(s, st.name, `${part.story.icon} ${part.story.title}: ${e.reply}`);
        g.hud.banner(`${part.story.icon} Geschichte erlebt: ${part.story.title}`, [e.money ? `+${e.money} €` : '', e.rep ? `Ruf +${e.rep}` : '', `${st.name} vergisst dir das nie`].filter(Boolean).join(' · '), 'good', 4200);
        then = () => run([N(e.reply), menu('Danke für alles. Sonst noch was?')]);
      } })) }]);
    } });
    else if (done) c.push({ label: '💜 Wie ist es ausgegangen?', fn: () => { then = () => run([N(`Weißt du noch, du hast gesagt: „${done.replace(/^\S+\s/, '')}“. Das war genau richtig. Danke dir!`), menu('Sonst noch was?')]); } });
    c.push({ label: '💼 Was machst du beruflich?', fn: () => { then = () => run([N(job.talk), { who: 'Du', color: '#ff4fa3', text: mine ? `Ich bin ${mine.name}. ${mine.icon}` : 'Ich suche gerade. Die Jobbörse im Handy hat ein paar Angebote.' }, menu(mine && mine.id === 'dreh' && adult && Number(s.flags.drehN) > 0 ? 'Moment … dich kenn ich doch aus einem Film! 😳 Sonst noch was?' : 'Spannend! Sonst noch was?')]); } });
    if (adult) c.push({ label: flirted(s, st.key) ? '😏 Weiterflirten' : '😏 Anflirten', fn: () => { then = () => pickup(); } });
    if (adult && flirted(s, st.key)) c.push({ label: dark ? '🖤 Weiter nach hinten?' : '🔥 Kommst du mit zu mir?', sub: 'nur wenn ihr beide wollt', fn: () => { then = () => ask(); } });
    if (adult && flirted(s, st.key) && !o.room) c.push({ label: '🌳 Gleich hier draußen?', sub: 'aufregend · Risiko, erwischt zu werden', fn: () => { then = () => outdoor(); } });
    if (o.room?.partyPlace && evening(hour(s)) && !dark) c.push({ label: adult ? '🎉 Hausparty, Tür zu …' : '🎉 Hausparty steigen lassen', sub: s.flags.party === s.day ? 'heute schon gefeiert' : '3 Stunden · alle machen mit', fn: () => { if (s.flags.party === s.day) { toast('Heute wurde schon gefeiert. Morgen wieder! 🎉'); return; } then = () => houseParty(g, st, o.room!, adult, end); } });
    c.push({ label: '👋 Tschüss', fn: () => { then = () => run([N(adult && h % 2 ? 'Bis bald, Hübsche*r. Du weißt ja, wo du mich findest. 😘' : 'Mach\'s gut! Schön, dich getroffen zu haben.')]); } });
    return N(text, c);
  };
  const pickup = () => {
    const i0 = (h + Number(s.flags.ons || 0)) % PICKUP.length, opts = [0, 2, 4].map((d) => (i0 + d) % PICKUP.length);
    run([{ who: 'Du', color: '#ff4fa3', text: 'Was sagst du?', choices: opts.map((i) => ({ label: PICKUP[i][0], fn: () => {
      const ok = flirtTry(s, st.key, i, ty?.flirt || 0); sfx(ok ? 'giggle' : 'miss'); if (ok) change(s, { fun: 5 });
      then = () => run([N(ok ? PICKUP[i][1] : PICKUP[i][2]), menu(ok ? 'Und jetzt? 😏' : 'Na gut … sonst noch was?')]);
    } })) }]);
  };
  const ask = () => {
    const a = nightAnswer(s, st.key, ty ? Math.round(ty.flirt / 2) : 0);
    if (!a.yes) { then = () => run([{ who: 'Du', color: '#ff4fa3', text: 'Alles gut, ein Nein ist ein Nein. 💜' }, menu('Danke, dass du das so locker nimmst.')]); run([N(a.text)]); return; }
    if (inTreatment(s).length || untreated(s).length) {
      const why = inTreatment(s).length ? 'Du bist noch in Behandlung.' : 'Du hast Symptome, die du noch nicht hast checken lassen.';
      run([{ who: 'Du', color: '#ff4fa3', text: `${why} Fair ist: erst auskurieren, dann wieder Spaß. Du sagst es ehrlich.` }, N('Danke für die Ehrlichkeit. Melde dich, wenn du wieder fit bist. 💜')]); return;
    }
    run([N(a.text), protect(g, st, dark, (bare) => { then = () => oneNight(g, st, o, bare, end); }, ty?.mul)]);
  };
  const outdoor = () => {
    const a = nightAnswer(s, st.key, ty ? Math.round(ty.flirt / 2) : 0);
    if (!a.yes) { then = () => run([{ who: 'Du', color: '#ff4fa3', text: 'Alles gut, ein Nein ist ein Nein. 💜' }, menu('Lieber woanders. Sonst noch was?')]); run([N(a.text)]); return; }
    if (inTreatment(s).length || untreated(s).length) { run([N('Erst auskurieren, dann Abenteuer. Melde dich! 💜')]); return; }
    run([N('Hier? Jetzt? … Okay. Aber wir suchen uns eine Ecke, wo uns niemand sieht.'), protect(g, st, false, (bare) => { then = () => outdoorNight(g, st, o, bare, end); }, ty?.mul)]);
  };
  run([N(first), menu(adult ? 'Und, was machen wir zwei Hübschen jetzt?' : 'Was gibt\'s?')]);
}

/** Absprache vorher: mit Kondom oder – nur wenn beide das wollen – ohne */
function protect(g: Game, st: Stranger, dark: boolean, go: (bare: boolean) => void, mul = 1): Line {
  const s = g.save.data, has = (s.inv.condom || 0) > 0, prep = s.health.prep, uu = hivUU(s);
  // ehrlich vorher: Wann war der letzte Test? (steuert das Risiko ohne Kondom, sti.ts)
  const ps = partnerStatus(st.key, s.day, dark ? mul * 1.3 : mul);
  return { who: st.name, color: st.color, text: `Kurz abgesprochen: ${dark ? 'hier hinten' : 'bei dir'} mit Gummi${prep ? ' – oder du bist auf PrEP?' : '?'} Ich bin übrigens ${ps.label}.`, choices: [
    { label: has ? `🎈 Mit Kondom (${condomLabel(s)})` : '🎈 Mit Kondom – hab aber keins', sub: has ? `du hast ${s.inv.condom}` : 'Späti, Checkpoint, Automat im Darkroom', fn: () => {
      if (!has) { setTimeout(() => g.dialog.say([{ who: st.name, color: st.color, text: dark ? 'Der Automat hängt gleich an der Wand. Ich warte. 😏' : 'Dann holen wir beim Späti welche. Oder nächstes Mal. 😉' }]), 50); return; }
      go(false);
    } },
    { label: '⚠️ Ohne Kondom – in Absprache', sub: `${prep ? 'PrEP schützt vor HIV, ' : uu ? 'du bist unter der Nachweisgrenze (U=U), ' : ps.hiv ? 'kein HIV-Schutz, ' : ''}${ps.f < .5 ? 'kleines' : ps.f < 1 ? 'geringes' : 'etwas'} Risiko für Chlamydien, Tripper, Syphilis`, fn: () => go(true) },
    { label: 'Doch lieber nicht', fn: () => setTimeout(() => g.dialog.say([{ who: st.name, color: st.color, text: 'Total okay. Kein Druck. 💜' }]), 50) },
  ] };
}

/** One-Night-Stand: Filmszene in deiner Wohnung (liebe.ts), Abblende, frecher Kommentar am Morgen */
function oneNight(g: Game, st: Stranger, o: TalkOpts, bare: boolean, end?: () => void) {
  const s = g.save.data, dark = o.room?.theme.id === 'darkroom';
  const lube = (s.inv.lube || 0) > 0;
  if (!bare && canMeet(s) === 'condom') return;
  const tags = ['Zustimmung ✔︎', bare ? 'Ohne Kondom (abgesprochen)' : `${condomLabel(s)} ✔︎`, lube ? 'Gleitgel ✔︎' : '', s.health.prep ? 'PrEP ✔︎' : ''].filter(Boolean);
  const after = (stay: boolean, tape = false) => {
    if (!bare) { s.inv.condom = Math.max(0, (s.inv.condom || 0) - 1); keepCondom(s); }
    s.flags.lastNight = s.day;
    if (lube) s.inv.lube--;
    const ty = o.szene ? SZENE[o.szene] : null, mul = (ty?.mul || 1) * (dark ? 1.3 : 1);
    const r = nightReview(s, st.key), x = exposure(s, bare, { partners: [{ status: partnerStatus(st.key, s.day, mul), mul }] });
    s.rep += r.rep; change(s, { fun: r.fun, social: 20, hygiene: -25, energy: stay ? 100 : -15 });
    post(s, 'Du', dark ? 'Darkroom. Mehr sag ich nicht. 🖤' : `Nacht mit ${st.name}. ${starLine(r.stars)}`);
    pcEvents.emit('oneNight', { name: st.name, stars: r.stars, bare, dark: !!dark });
    g.save.write(); g.city.refreshHud();
    const lines: Line[] = [{ who: st.name, color: st.color, text: r.text }];
    if (bare) lines.push({ who: 'Du', color: '#ff4fa3', text: x.hiv || !s.health.prep ? 'Ohne Gummi und ohne PrEP … Wenn du unsicher bist: PEP gibt es bis 72 Stunden danach, und ein Test im Checkpoint schadet nie.' : 'PrEP schützt vor HIV, aber nicht vor allem anderen. In ein paar Tagen mal testen lassen.' });
    g.dialog.say(lines, () => { g.hud.banner(`${starLine(r.stars)} Nacht mit ${st.name}`, `Spaß +${r.fun}${r.rep ? ` · Ruf +${r.rep}` : ''}${s.flags.ons ? ` · Nummer ${s.flags.ons}` : ''}`, 'good', 4200); if (tape) tapeAfter(g, st.name, st.color, st.key, () => end?.()); else end?.(); });
  };
  if (dark) {
    // Darkroom: keine Filmszene, nur Nebel, Herzschlag und Abblende
    const b = night('🖤 Hinten im Darkroom …', tags); nightSounds(4.5, pairVoices(s, st.pron));
    setTimeout(() => { g.pass(40); b.remove(); after(false); }, 4500);
    return;
  }
  let vibe: Vibe = 'zart';
  const look: Look = { ...(o.look || { body: st.rb || 'Male_Adult_01', rb: st.rb, palette: 'rainbow', skin: 0 }), outfit: 'clothed', style: undefined };   // ohne Szene-Shirt, sonst malt es über die Unterwäsche
  // vorher fragen: mit dem Handy filmen? (Sextape nur, wenn beide Ja sagen, dreh.ts)
  const go = (tape: boolean) => g.enterHome(() => {
    void g.home!.romance(look, st.name, () => {
      const b = night(`${tape ? '📹' : '💜'} ${st.name} und du …`, tape ? [...tags, 'Kamera läuft ✔︎'] : tags); nightSounds(NIGHT_S, pairVoices(s, st.pron));
      setTimeout(() => {
        g.pass(minutesUntil(s, 8), true); s.flags.wild = s.day;
        const h = g.home!; h.showMess(); void h.morning(look);
        setTimeout(() => { b.remove(); after(true, tape); }, 900);
      }, NIGHT_S * 1000);
    }, tape ? { mode: 'tape', title: `📹 ${st.name} und du`, vibe } : { vibe });
  });
  // vorher absprechen, wie es laufen soll (liebe.ts VIBES): ändert Lage im Bett, Kamera und Stimmen
  const all = Object.keys(VIBES) as Vibe[], pref: Vibe | undefined = ({ pup: 'wild', slut: 'wild', bear: 'loeffel', daddy: 'oben', domina: 'oben', kinky: 'oben', twink: 'wild', trans: 'zart' } as Record<string, Vibe>)[o.szene || ''];
  const offer = [...new Set([pref || all[hash(st.key) % 4], all[(hash(st.key) + 1) % 4], all[(hash(st.key) + 2) % 4]])].slice(0, 3);
  g.dialog.say([{ who: st.name, color: st.color, text: `Worauf hast du Lust? Ich hätte da ein paar Ideen … ${VIBES[offer[0]].icon}`, choices: offer.map((v) => ({ label: `${VIBES[v].icon} ${VIBES[v].label}`, sub: VIBES[v].sub, fn: () => { vibe = v; tags.push(`${VIBES[v].icon} ${VIBES[v].label}`); setTimeout(() => g.dialog.say([{ who: st.name, color: st.color, text: VIBES[v].ask }, tapeAsk(g, st.name, st.color, st.key, go)]), 50); } })) }]);
}

/** Draußen an einem besonderen Ort: Abblende mit Ortszeile, Risiko, erwischt zu werden (Passant*innen oder Streife) */
const SPOTS = ['hinter den hohen Hecken im Park', 'im Auto mit beschlagenen Scheiben', 'unter dem Steg am Strand', 'auf einer Dachterrasse mit Blick auf die Skyline', 'in der Umkleide vom Freibad', 'im Lustwäldchen zwischen den Farnen', 'auf dem Glitzer-Boot am Kai'];
function outdoorNight(g: Game, st: Stranger, o: TalkOpts, bare: boolean, end?: () => void) {
  const s = g.save.data, h = hour(s), day = h >= 7 && h < 20, where = SPOTS[hash(st.key + s.day) % SPOTS.length];
  if (!bare) s.inv.condom = Math.max(0, (s.inv.condom || 0) - 1);
  const b = night(`🌳 ${st.name} und du, ${where} …`, ['Zustimmung ✔︎', bare ? 'Ohne Kondom (abgesprochen)' : `${condomLabel(s)} ✔︎`, day ? '☀️ am helllichten Tag' : '🌙 im Dunkeln']);
  nightSounds(4.5, pairVoices(s, st.pron));
  setTimeout(() => {
    g.pass(30); b.remove();
    const ty = o.szene ? SZENE[o.szene] : null, mul = ty?.mul || 1;
    const r = nightReview(s, st.key); exposure(s, bare, { partners: [{ status: partnerStatus(st.key, s.day, mul), mul }] });
    const roll = hash(st.key + ':caught:' + s.day + ':' + s.time) % 100, caught = roll < (day ? 35 : 18), cop = caught && roll % 3 === 0;
    if (!bare) keepCondom(s);
    s.rep += r.rep; change(s, { fun: r.fun + 8, social: 15, hygiene: -20, energy: -15 });
    s.flags.outdoorN = (Number(s.flags.outdoorN) || 0) + 1;
    const lines: Line[] = [{ who: st.name, color: st.color, text: r.text }];
    if (cop) { const fine = 100; s.money = Math.max(0, s.money - fine); lines.push({ who: '🚓 Streife', color: '#5b86d6', text: `Taschenlampe, Räuspern. „Sie wissen schon, dass man Sie von der Straße aus sieht? Belästigung der Allgemeinheit, ${fine} € Bußgeld. Und jetzt bitte anziehen.“` }); sfx('siren'); }
    else if (caught) { s.rep += 1; lines.push({ who: '👀 Passant*in', color: '#8fa3c8', text: roll % 2 ? 'Ein Jogger bleibt stehen, grinst, hebt den Daumen und läuft weiter. Ihr lacht euch kaputt.' : 'Ein Hund bellt, Schritte kommen näher – ihr rennt kichernd und halb angezogen davon.' }); sfx('giggle'); }
    else lines.push({ who: 'Du', color: '#ff4fa3', text: 'Niemand hat was gemerkt. Glaubst du zumindest. 😏' });
    post(s, 'Du', `${where[0].toUpperCase() + where.slice(1)}. Mehr sag ich nicht. 🌳`);
    pcEvents.emit('oneNight', { name: st.name, stars: r.stars, bare, dark: false });
    g.save.write(); g.city.refreshHud();
    g.dialog.say(lines, () => { g.hud.banner(`${starLine(r.stars)} Draußen mit ${st.name}`, `Spaß +${r.fun + 8}${cop ? ' · Bußgeld −100 €' : ''}`, cop ? 'bad' : 'good', 4200); end?.(); });
  }, 4500);
}

/** Hausparty: Musik und Licht, mit 18+ geht danach eine Tür zu. Abblende, witzige Zusammenfassung */
function houseParty(g: Game, st: Stranger, room: InteriorScene, adult: boolean, end?: () => void) {
  const s = g.save.data;
  s.flags.party = s.day; room.houseParty(true); sfx('cheer');
  toast(adult ? '🎶 Licht runter, Musik rauf …' : '🎶 Musik an, alle tanzen!');
  // 18+: mittendrin als Filmszene (gruppe.ts) oder wie bisher nur hinter der Tür
  if (adult && !untreated(s).length && !inTreatment(s).length) {
    setTimeout(() => g.dialog.say([{ who: st.name, color: st.color, text: 'Ein paar von uns ziehen gleich weiter zu dir. Kommst du mit, oder bleibt die Tür heute zu? 😏', choices: [
      { label: '🔥 Afterparty zu viert bei dir', sub: 'Filmszene · alle wollen', fn: () => setTimeout(() => g.dialog.say([groupProtect(g, st, (bare) => groupNight(g, st, room, bare, end))]), 50) },
      { label: '🚪 Tür zu, Abblende', fn: () => doorNight() },
    ] }]), 1800);
  } else setTimeout(() => doorNight(), 3200);
  const doorNight = () => {
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
  };
}

/** Gäste für die Gruppenszene: Gastgeber*in plus zwei weitere aus dem Raum (sonst feste Fremde) */
function groupCast(st: Stranger, room: InteriorScene): Array<GroupGuest & { st: Stranger; typ?: string }> {
  const others = room.guests.filter((q) => q.g.st.key !== st.key).slice(0, 2).map((q) => ({ look: { body: q.g.rb, rb: q.g.rb, palette: 'rainbow', skin: 0, outfit: 'clothed' as const, gear: q.g.typ ? SZENE[q.g.typ].gear : undefined }, name: q.g.st.name, st: q.g.st, typ: q.g.typ }));
  const host = room.guests.find((q) => q.g.st.key === st.key);
  const first = { look: { body: st.rb || host?.g.rb || 'Male_Adult_01', rb: st.rb || host?.g.rb, palette: 'rainbow', skin: 0, outfit: 'clothed' as const }, name: st.name, st, typ: host?.g.typ };
  const out = [first, ...others];
  for (let i = 0; out.length < 3; i++) { const rb = GUEST_POOL[(hash(st.key) + i * 7) % GUEST_POOL.length]; if (out.some((x) => x.look.rb === rb)) continue; const x = stranger(st.key + ':gast' + i, rb); out.push({ look: { body: rb, rb, palette: 'rainbow', skin: 0, outfit: 'clothed' }, name: x.name, st: x, typ: undefined }); }
  return out;
}
/** Absprache in der Gruppe: Kondome aus der Schale oder – wenn alle wollen – ohne */
function groupProtect(g: Game, st: Stranger, go: (bare: boolean) => void): Line {
  const s = g.save.data;
  return { who: st.name, color: st.color, text: `Regeln für alle: Jede*r darf jederzeit Stopp sagen. Kondome liegen in der Schale. Oder machen wir es ohne? ${s.health.prep ? 'Du bist ja auf PrEP.' : 'Zwei von uns sind auf PrEP.'}`, choices: [
    { label: '🎈 Mit Kondomen aus der Schale', sub: 'kein STI-Risiko', fn: () => setTimeout(() => go(false), 50) },
    { label: '⚠️ Ohne – alle sind einverstanden', sub: 'kleines Risiko je Person, Test danach', fn: () => setTimeout(() => go(true), 50) },
    { label: 'Doch lieber die Tür zu', fn: () => setTimeout(() => g.dialog.say([{ who: st.name, color: st.color, text: 'Kein Ding. Wir sehen uns am Buffet. 💜' }]), 50) },
  ] };
}
/** Afterparty zu viert: Filmszene in deiner Wohnung, Abblende, Morgen mit Zusammenfassung */
function groupNight(g: Game, st: Stranger, room: InteriorScene, bare: boolean, end?: () => void) {
  const s = g.save.data, cast = groupCast(st, room), names = cast.map((c) => c.name);
  room.houseParty(false);
  const tags = ['Alle volljährig ✔︎', 'Alle wollen ✔︎', bare ? 'Ohne Kondom (alle abgesprochen)' : 'Kondomschale ✔︎', 'Stopp heißt Stopp ✔︎'];
  g.enterHome(() => {
    void g.home!.group(cast, () => {
      const b = night(`🔥 ${names.join(', ')} und du …`, tags); nightSounds(NIGHT_S, pairVoices(s, 'they'));
      setTimeout(() => {
        g.pass(minutesUntil(s, 9), true); s.flags.wild = s.day; s.flags.orgy = (Number(s.flags.orgy) || 0) + 1; if (!bare) keepCondom(s, 3);
        const x = exposure(s, bare, { partners: cast.map((c) => { const m = (c.typ ? SZENE[c.typ].mul : 1); return { status: partnerStatus(c.st.key, s.day, m), mul: m }; }) });
        change(s, { social: 40, fun: 40, energy: 60, hygiene: -35 }); s.rep += 3;
        g.home!.showMess(); b.remove();
        pcEvents.emit('hausparty', { host: st.name, adult: true, group: true, bare, caught: x.caught.length });
        post(s, st.name, 'Gestern: Afterparty zu viert. Wer vermisst eine Socke? Und warum hängt ein Harness am Kronleuchter? 🙈');
        g.save.write(); g.city.refreshHud();
        const lines: Line[] = [{ who: st.name, color: st.color, text: partySummary(s, st.key, true) }];
        if (bare) lines.push({ who: 'Du', color: '#ff4fa3', text: s.health.prep ? 'PrEP schützt vor HIV. Gegen den Rest hilft ein Test in ein, zwei Wochen im Checkpoint.' : 'Ohne PrEP: Wenn du unsicher bist, gibt es PEP bis 72 Stunden danach im Checkpoint. Und in ein, zwei Wochen ein Test.' });
        g.dialog.say(lines, () => { g.hud.banner('🔥🔥 Legendäre Afterparty', 'Kontakte +40 · Spaß +40 · Ruf +3', 'good', 4200); end?.(); });
      }, NIGHT_S * 1000);
    });
  });
}

/** Zeit für dich (Solo, 18+) im eigenen Bett; mit Aufnahme gehört das Video dir: behalten, löschen oder auf deine Fanseite */
export function soloNight(g: Game, tape: boolean) {
  const s = g.save.data, h = g.home; if (!h || !s.settings.adult) return;
  void h.solo(tape, () => {
    const b = night(tape ? '📹 Nur du …' : '🫦 Zeit für dich …', ['Entspannung ✔︎', tape ? 'Kamera läuft ✔︎' : 'Tür zu ✔︎']);
    nightSounds(3.5, [pairVoices(s, 'er')[0], pairVoices(s, 'er')[0]]);
    setTimeout(() => {
      b.remove(); g.pass(30); s.flags.solo = (Number(s.flags.solo) || 0) + 1; s.flags.soloDay = s.day;
      change(s, { fun: 22, energy: -5, hygiene: -10 });
      g.save.write(); g.city.refreshHud();
      if (!tape) { toast('Entspannt. 😌 Spaß +22'); return; }
      s.flags.tapes = (Number(s.flags.tapes) || 0) + 1;
      g.dialog.say([{ who: 'Du', color: '#ff4fa3', text: 'Das Video ist nur von dir. Was machst du damit?', choices: [
        { label: '🔒 Behalten', fn: () => toast('Im Handy-Ordner „Privat“ gespeichert. 🔒') },
        { label: '🌐 Auf deine Fanseite', sub: 'deine Entscheidung', fn: () => { const fans = Number(s.flags.drehFans) || 0, pay = 25 + Math.floor(Math.random() * 60) + Math.min(200, Math.floor(fans / 40)), add = 40 + Math.floor(Math.random() * 120); s.money += pay; s.flags.drehFans = fans + add; post(s, 'Du', '📹 Neues Solo-Video online. Nur ich, nur echt.'); sfx('coin'); toast(`📹 Hochgeladen: +${pay} € · +${add} Fans`); g.save.write(); g.city.refreshHud(); } },
        { label: '🗑️ Löschen', fn: () => toast('Gelöscht. Die Erinnerung bleibt. 😏') },
      ] }]);
    }, 3500);
  });
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
