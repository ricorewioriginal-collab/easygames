/* Pride FM 88,8 – der queere Talksender der Stadt (Plakat in der Hochstadt), im Handy unter „📻 Pride FM“:
   ab Kapitel 2 die eigene Sendung „Rainbow Talk“ (drei Anrufe am Tag, Antworten wählen) und „Wissen um halb“ mit echter
   queerer Geschichte, die nicht schon in Story, Wissen-App oder Clubnächten steht. Im Autoradio laufen nur die 13
   eigenen Sender und eine eigene Stream-Adresse (Radio.ts). Ereignis für die Story: radioSendung (hooks.ts). */
import type { Game } from './Game';
import type { SaveData } from '../engine/Save';
import type { Item, Line } from '../ui/ui';
import { sfx } from '../engine/Audio';
import { change } from './life';
import { pcEvents } from './hooks';

const KIKI = '🎙️ Kiki Kaleido';

/** Echte Geschichte für „Wissen um halb“ (Fakten, die es sonst im Spiel noch nicht gibt) */
export const FM_WISSEN: Array<{ key: string; year: string; title: string; text: string }> = [
  { key: 'film', year: '1919', title: 'Anders als die Andern', text: '1919 kommt „Anders als die Andern“ in die Kinos, einer der ersten Filme der Welt, der einen schwulen Mann mit Mitgefühl zeigt. Conrad Veidt spielt die Hauptrolle, Magnus Hirschfeld wirkt mit.' },
  { key: 'elbe', year: '1930 und 1931', title: 'Lili Elbe', text: 'Die Malerin Lili Elbe lässt sich 1930 und 1931 in Berlin und Dresden operieren, als eine der ersten trans Frauen überhaupt. Ihre Geschichte erzählt später der Film „The Danish Girl“.' },
  { key: 'howard', year: '28. Juni 1970', title: 'Die Mutter der Pride', text: 'Ein Jahr nach Stonewall organisiert die bisexuelle Aktivistin Brenda Howard in New York den ersten Christopher Street Liberation Day March. Sie gilt als „Mutter der Pride“.' },
  { key: 'muenster', year: '29. April 1972', title: 'Die erste Demo', text: 'In Münster gehen etwa 30 Menschen auf die Straße, die erste offene Demonstration von Schwulen und Lesben in der Bundesrepublik.' },
  { key: 'aidshilfe', year: '1983', title: 'Deutsche Aidshilfe', text: '1983 gründet sich in Berlin die Deutsche Aidshilfe. Selbsthilfe aus der Szene: Aufklärung, Beratung und Solidarität, als viele andere wegschauten.' },
  { key: 'engel', year: '1994', title: 'Der Frankfurter Engel', text: 'In Frankfurt am Main wird 1994 der „Frankfurter Engel“ enthüllt, das erste Mahnmal in Deutschland für die verfolgten Homosexuellen.' },
  { key: 'nl', year: '1. April 2001', title: 'Die erste Ehe für alle', text: 'Die Niederlande öffnen als erstes Land der Welt die Ehe für gleichgeschlechtliche Paare. Kurz nach Mitternacht heiraten in Amsterdam vier Paare.' },
  { key: 'denkmal', year: '27. Mai 2008', title: 'Das Denkmal im Tiergarten', text: 'In Berlin wird das Denkmal für die im Nationalsozialismus verfolgten Homosexuellen eröffnet. Durch ein Fenster im Betonblock sieht man einen Film mit küssenden Paaren.' },
];

/* ---------- Eigene Sendung „Rainbow Talk“ ---------- */
interface Caller { who: string; q: string; a: Array<[string, number, string]> }
export const SHOW_CALLS: Caller[] = [
  { who: 'Jonas, 16', q: 'Ich glaube, ich bin schwul, aber ich trau mich nicht, es meinen Eltern zu sagen. Was soll ich machen?', a: [
    ['Du bestimmst das Tempo. Such dir zuerst eine Person, der du vertraust, und hol dir Rückhalt, zum Beispiel bei einer queeren Jugendgruppe.', 2, 'Danke … das mit der Jugendgruppe probiere ich.'],
    ['Sag es einfach heute beim Abendessen, dann ist es raus.', 1, 'Hm. Ich weiß nicht, ob ich so mutig bin.'],
    ['Warte lieber, bis du ausgezogen bist.', 0, 'Das sind noch Jahre …'] ] },
  { who: 'Aylin aus der Hochstadt', q: 'Mein Chef macht ständig Witze über meine Freundin. Muss ich mir das gefallen lassen?', a: [
    ['Nein. Schreib die Vorfälle auf und hol dir Unterstützung, zum Beispiel beim Betriebsrat oder einer Beratungsstelle. Diskriminierung ist verboten.', 2, 'Gut zu wissen. Ich fange heute an aufzuschreiben.'],
    ['Lach einfach mit, dann hört er auf.', 0, 'Ehrlich? Das fühlt sich falsch an.'],
    ['Sprich ihn unter vier Augen darauf an.', 1, 'Vielleicht. Aber wenn das nichts bringt?'] ] },
  { who: 'Dieter, 71', q: 'Mein Mann ist letztes Jahr gestorben. Ich fühle mich so allein in der großen Stadt.', a: [
    ['Das tut mir sehr leid. Im Regenbogenhaus gibt es einen Seniorentreff. Komm vorbei, da wartet ein Kaffee auf dich.', 2, 'Das … das mache ich. Danke, dass du zuhörst.'],
    ['Melde dich doch bei einer Dating-App an.', 0, 'So weit bin ich noch lange nicht.'],
    ['Ruf einfach öfter hier an, wir sind da.', 1, 'Das ist lieb. Ich höre euch jeden Abend.'] ] },
  { who: 'Nele aus dem Westviertel', q: 'Ich bin bi und meine lesbischen Freundinnen sagen, ich soll mich mal entscheiden. Das nervt!', a: [
    ['Bi ist keine Phase und keine halbe Entscheidung. Du musst dich nicht rechtfertigen, wen du liebst.', 2, 'Genau das wollte ich hören. Danke!'],
    ['Die meinen das sicher nicht so.', 1, 'Kann sein. Weh tut es trotzdem.'],
    ['Entscheide dich halt, dann ist Ruhe.', 0, 'Wow. Das war jetzt nicht hilfreich.'] ] },
  { who: 'Ben, 24', q: 'Ich will mich auf HIV testen lassen, hab aber Angst vor dem Ergebnis.', a: [
    ['Mut ist gut! Im Checkpoint testen sie anonym. Und falls positiv: Mit Behandlung lebt man heute gut und gibt das Virus nicht weiter.', 2, 'Okay. Ich geh morgen hin.'],
    ['Wenn du dich gut fühlst, brauchst du keinen Test.', 0, 'Wirklich? Ich dachte …'],
    ['Nimm jemanden mit, das hilft gegen die Angst.', 1, 'Gute Idee, ich frag meinen Mitbewohner.'] ] },
  { who: 'Mara aus dem Hafen', q: 'Mein Kind sagt, es ist nichtbinär. Ich will alles richtig machen, aber ich bin unsicher.', a: [
    ['Hör zu, frag nach dem Namen und den Pronomen und sag deinem Kind, dass du es liebst. Fehler passieren, wichtig ist, dass du dranbleibst.', 2, 'Das klingt machbar. Danke dir.'],
    ['Das ist bestimmt nur eine Phase.', 0, 'Das hat mein Kind auch schon befürchtet, dass ich das sage.'],
    ['Lies dich ein, es gibt gute Infos von Elterngruppen.', 1, 'Mach ich. Ich will es verstehen.'] ] },
];
export const showOpen = (s: SaveData) => s.chapter >= 2;
/** Drei Anrufe für heute (fest je Tag, damit es nicht beliebig wirkt) */
export const showCalls = (s: SaveData) => [0, 1, 2].map((i) => SHOW_CALLS[(s.day + i * 2) % SHOW_CALLS.length]);
/** Quote: Punkte 0–6 → Hörer*innen, Geld und Ruf */
export function showResult(pts: number) { return { listeners: 800 + pts * 650, money: 40 + pts * 25, rep: pts >= 5 ? 3 : pts >= 3 ? 2 : 1 }; }

/** Handy-App Pride FM: eigene Sendung und „Wissen um halb“ */
export function fmMenu(g: Game, frame: (t: string, b: string) => string, back: () => void) {
  const s = g.save.data, done = s.flags.radioShowDay === s.day;
  const items: Item[] = [
    { icon: '🎙️', label: 'Deine Sendung „Rainbow Talk“', sub: !showOpen(s) ? 'ab Kapitel 2' : done ? 'heute schon gesendet' : 'drei Anrufe, du gibst die Antworten · Geld, Ruf, Hörer*innen', disabled: !showOpen(s) || done, big: showOpen(s) && !done, fn: () => runShow(g) },
    { icon: '📚', label: 'Wissen um halb', sub: 'alle Geschichten aus der Sendung', fn: () => g.openMenu(frame('Wissen um halb', `<div class="pbody">${FM_WISSEN.map((w) => `<p><b>${w.year} · ${w.title}</b><br><small>${w.text}</small></p>`).join('')}</div>`), [{ icon: '←', label: 'Zurück', fn: () => fmMenu(g, frame, back) }], () => fmMenu(g, frame, back), 'phone') },
    { icon: '←', label: 'Zurück', fn: back },
  ];
  g.openMenu(frame('Pride FM 88,8', `<div class="pbody"><p>🎙️ Der queere Talksender der Stadt. Moderiere deine eigene Sendung, Rainbow City ruft an. Mx. Robin erzählt dazu „Wissen um halb“.</p>${s.flags.radioShows ? `<p><small>Deine Sendungen: ${s.flags.radioShows} · Rekord ${Number(s.flags.radioBest) || 0} Hörer*innen</small></p>` : ''}</div>`), items, back, 'phone');
}

function runShow(g: Game) {
  const s = g.save.data, calls = showCalls(s); let pts = 0, i = 0;
  g.closeMenu(); g.touch.show(true);
  const C = (who: string, text: Line['text']): Line => ({ who: `📞 ${who}`, color: '#5ce1ff', text });
  const ME = (text: string) => ({ who: `🎙️ ${s.name}`, color: '#ff3fb0', text });
  const next = () => {
    if (i >= calls.length) { finish(); return; }
    const c = calls[i++]; let reply = '';
    g.dialog.say([C(c.who, c.q), { ...ME('Was antwortest du?'), choices: [...c.a.slice((s.day + i) % 3), ...c.a.slice(0, (s.day + i) % 3)].map(([t, p, r]) => ({ label: t, fn: () => { pts += p; reply = r; } })) }, C(c.who, () => reply)], next);
  };
  const finish = () => {
    const r = showResult(pts);
    s.money += r.money; s.rep += r.rep; change(s, { social: 14, fun: 8, energy: -6 });
    s.flags.radioShowDay = s.day; s.flags.radioShow = true; s.flags.radioShows = (Number(s.flags.radioShows) || 0) + 1; s.flags.radioBest = Math.max(Number(s.flags.radioBest) || 0, r.listeners);
    g.save.write(); g.city.refreshHud(); sfx(pts >= 4 ? 'win' : 'coin');
    g.hud.banner('📻 Sendung vorbei!', `${r.listeners.toLocaleString('de-DE')} Hörer*innen · +${r.money} € · +${r.rep} Ruf`, 'good', 4800);
    pcEvents.emit('radioSendung', { points: pts, listeners: r.listeners, money: r.money });
    g.dialog.say([{ who: KIKI, color: '#5ce1ff', text: pts >= 5 ? 'Die Leitungen glühen! So viele Anrufe hatten wir seit der Ehe für alle nicht mehr. Morgen wieder?' : pts >= 3 ? 'Schöne Sendung. Die Leute mögen deine Stimme.' : 'Fürs erste Mal ganz okay. Hör zu, sei ehrlich, dann wird das.' }]);
  };
  g.dialog.say([{ who: KIKI, color: '#5ce1ff', text: `Rotlicht an, ${s.name}! Du bist live auf Pride FM. Die Leitungen sind offen, die Stadt hört zu.` }], next);
}
