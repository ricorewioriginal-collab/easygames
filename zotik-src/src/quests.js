/* Nebenquest-Ketten: je Welt zwei kleine Geschichten in mehreren Schritten (Lunaris: eine). Auftraggeber sind die Leute in den Stadtgebäuden (town.js).
   Schritte: find (Gegenstand in der Welt aufheben) · kill (Gegner besiegen) · elite (benannter Zwischengegner) · talk (jemanden in der Stadt aufsuchen) · give (Material abgeben).
   Zustand: S.nq[id] = { s: aktiver Schritt (1…; 0 = nicht angenommen), n: Zähler, d: 1 = belohnt }. Alles läuft über Ansprechen und Auswahl – gleich auf jedem Gerät. */
const WHO = { church: 'die Priesterin', smith: 'die Schmiedin', magic: 'die Magierin', potions: 'den Krämer', tavern: 'den Wirt' };
const AT = { church: 'in der Kirche', smith: 'in der Schmiede', magic: 'im Magieladen', potions: 'bei Tränke & Extras', tavern: 'im Wirtshaus' };
const GIVE = { herbs: ['🌿', 'Kräuter'], fell: ['🧶', 'Fell'], staub: ['✨', 'Rissstaub'], kern: ['💠', 'Kernsplitter'], potions: ['🧪', 'Heiltränke'] };
/* {A}/{B} = die beiden Gegnerarten der Welt, {W} = Name der Welt */
export const CHAINS = {
  1: [{ id: 'l1', n: 'Die verstummte Glocke', giver: 'church', offer: 'Seit der Riss am Himmel steht, schweigt unsere Glocke. Der Klöppel ist beim Sturm aus dem Turm gefallen und den Hang hinab in den Wald gerollt. Ohne ihn weiß im Dorf niemand mehr, wann der Tag endet.',
    steps: [{ t: 'find', item: 'Glockenklöppel', em: '🔔', found: 'Schwer, kalt und voller Moos. Aber er summt leise, wenn man ihn hält.' },
      { t: 'talk', to: 'smith', lines: ['Der Klöppel der Kirchenglocke? Der hat einen Riss, so klingt er nie wieder. Gib her – drei Schläge, ein Bad im Öl, fertig.', 'So. Der hält länger als wir beide. Bring ihn zurück, bevor es dunkel wird.'] }],
    thanks: 'Hörst du? Sie klingt wieder über das ganze Tal. Jetzt finden auch die Verirrten heim. Nimm das Glockenband, es hing seit hundert Jahren am Seil.', trk: 'Glockenband' }],
  2: [{ id: 'e1', n: 'Das Lied der Wurzeln', giver: 'church', offer: 'Unsere Orgel ist aus Erinnerungsholz gebaut. Sie spielt nur, was der Wald ihr vorsingt – und seit Tagen spielt sie falsch. Die Stimmgabel meiner Vorgängerin liegt irgendwo draußen zwischen den Wurzeln.',
    steps: [{ t: 'find', item: 'Stimmgabel aus Erinnerungsholz', em: '🎼', found: 'Sie vibriert schon, bevor du sie anschlägst. Der Wald singt mit.' },
      { t: 'kill', k: 'a', need: 5, why: 'Die {A} knabbern an den Orgelpfeifen, die im Wald zum Trocknen hängen.' },
      { t: 'talk', to: 'magic', lines: ['Eine Stimmgabel, die sich erinnert? Halt sie an mein Ohr … ah. Sie ist auf den Tag vor dem Bruch gestimmt. Ich lasse sie, wie sie ist. Manche Lieder muss man nicht reparieren.'] }],
    thanks: 'Die Orgel spielt wieder das alte Lied. Die Ältesten haben geweint, als sie es hörten. Dieses Notenblatt gehört dir.', trk: 'Notenblatt der Wurzeln' },
  { id: 'e2', n: 'Pilztee für alle', giver: 'tavern', offer: 'Mein Pilztee ist berühmt bis Valdoria, aber die {A} haben mir das ganze Beet zertrampelt. Ich brauche frische Hüte – und Kräuter, sonst schmeckt er nach Schuh.',
    steps: [{ t: 'kill', k: 'a', need: 6, why: 'Jeder besiegte {A} lässt einen Pilzhut für den Tee zurück.' }, { t: 'give', what: 'herbs', need: 3 }],
    thanks: 'Riechst du das? So muss Pilztee duften. Die erste Kanne geht aufs Haus – und das hier auch.' }],
  3: [{ id: 'v1', n: 'Die verschwundene Lieferung', giver: 'potions', offer: 'Meine Kiste mit Tränken ist auf dem Weg durch die Kanäle verschwunden. Die Gilde sagt: Pech. Ich sage: Jemand hat nachgeholfen. Sieh nach, was davon übrig ist.',
    steps: [{ t: 'find', item: 'Aufgebrochene Kiste', em: '📦', found: 'Leer. Aber im Holz stecken Scherenspuren, so groß wie deine Pfote.' },
      { t: 'elite', k: 'b', name: 'Kistenknacker', why: 'Eine riesige {B} hortet die Fläschchen in den Kanälen.' }],
    thanks: 'Du hast alle Fläschchen zurück? Sogar das mit dem grünen Korken! Dann ist das hier dein Anteil, und der Krabbe gönne ich den Schreck.' },
  { id: 'v2', n: 'Nachtschicht', giver: 'church', offer: 'Valdoria schläft nie, sagt man. Aber der alte Laternenwärter schläft seit drei Nächten gar nicht mehr und zündet Lichter an, die es nicht gibt. Sein Dienstbuch ist ihm in die Kanäle gefallen. Vielleicht findet er mit ihm zur Ruhe.',
    steps: [{ t: 'find', item: 'Dienstbuch des Laternenwärters', em: '📔', found: 'Jede Nacht ein Eintrag, vierzig Jahre lang. Der letzte: „Heute brennt eine Laterne zu viel.“' },
      { t: 'talk', to: 'tavern', lines: ['Der Laternenwärter? Sitzt jeden Abend hier und zählt die Lichter im Fenster. Lass das Buch da, ich lese ihm daraus vor. Bei Seite drei schläft er ein, wetten?'] },
      { t: 'kill', k: 'a', need: 6, why: 'Die {A} löschen nachts die Laternen an den Kanälen.' }],
    thanks: 'Er hat geschlafen. Eine ganze Nacht. Und heute Morgen hat er nur die Laternen gezählt, die wirklich da sind. Nimm seinen alten Docht, er wollte, dass du ihn bekommst.', trk: 'Docht des Laternenwärters' }],
  4: [{ id: 's1', n: 'Wasser für die Oase', giver: 'tavern', offer: 'Der Brunnen im Hof gibt nur noch Sand. Früher lag draußen im Dünenmeer ein Quellstein, der das Wasser gerufen hat. Wenn den noch jemand findet, dann einer mit so einer Nase.',
    steps: [{ t: 'find', item: 'Quellstein', em: '💧', found: 'Kühl und feucht, mitten im heißen Sand. Er tropft, ohne leer zu werden.' },
      { t: 'elite', k: 'b', name: 'Dünenkönig', why: 'Ein gewaltiger {B} hat sich auf der alten Quelle eingegraben.' }],
    thanks: 'Hör dir das an – es plätschert! Die Kinder stehen schon mit den Krügen Schlange. Das hier ist für dich, und Wasser gibt es bei mir ab heute umsonst.' },
  { id: 's2', n: 'Die Sonnenuhr', giver: 'church', offer: 'Unsere Sonnenuhr zeigt seit dem Bruch eine Stunde, die es nicht gibt. Der Zeiger ist verbogen, und der Sand hat den Sockel gefressen. Ich brauche ruhige Dünen und jemanden, der den Zeiger richtet.',
    steps: [{ t: 'kill', k: 'a', need: 6, why: 'Die {A} wühlen den Sand um die Sonnenuhr auf.' }, { t: 'give', what: 'staub', need: 3 },
      { t: 'talk', to: 'smith', lines: ['Einen Sonnenzeiger richten? Mit Rissstaub im Feuer geht das. Schau: Er wirft den Schatten jetzt gerade. Sag der Priesterin, sie soll ihn nie wieder mit dem Besen anstoßen.'] }],
    thanks: 'Mittag. Zum ersten Mal seit dem Bruch ist bei uns wieder Mittag, wenn die Sonne am höchsten steht. Nimm diese Sanduhr, sie läuft in beide Richtungen.', trk: 'Sanduhr von Solmera' }],
  5: [{ id: 'a1', n: 'Die Perle der Taucherin', giver: 'magic', offer: 'Meine Lehrerin ist vor Jahren in die Korallenhöhlen getaucht und nie zurückgekehrt. Ihre Perle soll noch dort liegen – sie leuchtet, wenn jemand ihren Namen sagt. Sie hieß Maris.',
    steps: [{ t: 'find', item: 'Perle der Maris', em: '🫧', found: '„Maris“, flüsterst du. Die Perle glimmt auf wie ein kleines Kuppelfenster.' },
      { t: 'talk', to: 'church', lines: ['Die Perle der Maris … Wir legen sie in die Schale am Altar. Dort brennt für jede Taucherin ein Licht, die das Meer behalten hat.', 'Sag deiner Magierin: Ihre Lehrerin ist angekommen.'] }],
    thanks: 'Sie liegt jetzt am Altar? Dann war ihr letzter Tauchgang nicht umsonst. Ich habe ihr Notizbuch aufgehoben, all die Jahre. Es soll bei jemandem sein, der zuhört.', trk: 'Notizbuch der Taucherin' },
  { id: 'a2', n: 'Dichte Fugen', giver: 'smith', offer: 'Die Kuppel über der Stadt hält dem Meer stand, weil ich jede Woche die Fugen prüfe. Aber die {B} zwicken das Dichtharz heraus. Schaff sie mir vom Glas, und bring Fell mit – daraus mache ich neue Dichtungen.',
    steps: [{ t: 'kill', k: 'b', need: 6, why: 'Die {B} zwicken das Dichtharz aus den Fugen der Kuppel.' }, { t: 'give', what: 'fell', need: 3 }],
    thanks: 'Kein Tropfen mehr. Du hast heute eine ganze Stadt trocken gehalten, Fuchs. Das ist dein Lohn.' }],
  6: [{ id: 'f1', n: 'Das Feuer von Hjalm', giver: 'tavern', offer: 'Das Herdfeuer im Wirtshaus brennt seit sieben Wintern ohne Pause. Gestern ist es ausgegangen. Im Eiswald steht eine Glutschale aus der Zeit vor dem Frost. Wenn die noch warm ist, ist Hjalm gerettet.',
    steps: [{ t: 'find', item: 'Alte Glutschale', em: '🔥', found: 'Unter dem Eis glimmt ein einziger roter Punkt. Er wird heller, als du pustest.' },
      { t: 'elite', k: 'b', name: 'Raureif', why: 'Ein uralter {B} folgt der Wärme und will sie löschen.' }],
    thanks: 'Es brennt! Setz dich ans Feuer, du hast es dir verdient. Und nimm das hier mit auf den Weg.' },
  { id: 'f2', n: 'Was der Winter behält', giver: 'church', offer: 'Im Eis vor dem Dorf steckt ein Brief. Man sieht ihn bei klarem Wetter. Er ist an jemanden hier adressiert, aber niemand traut sich, ihn herauszuschlagen. Tust du es?',
    steps: [{ t: 'find', item: 'Eingefrorener Brief', em: '✉️', found: 'Die Tinte ist klar wie am ersten Tag: „An den, der das Feuer hütet.“' },
      { t: 'talk', to: 'tavern', lines: ['Für mich? Das ist die Schrift meines Vaters … Er schreibt, er sei nur kurz Holz holen. Das war der Winter, in dem der Frost kam.', 'Danke, Zotik. Jetzt weiß ich, dass er an uns gedacht hat. Sag der Priesterin, sie soll die Glocke für ihn läuten.'] },
      { t: 'kill', k: 'a', need: 6, why: 'Die {A} haben die Wege zum Friedhof am Waldrand zugeweht.' }],
    thanks: 'Wir haben die Glocke geläutet, und das ganze Dorf ist gekommen. Dieser Eiskristall lag bei dem Brief. Er schmilzt nicht.', trk: 'Ewiger Eiskristall' }],
  7: [{ id: 'i1', n: 'Der kalte Amboss', giver: 'smith', offer: 'Mein Meisterhammer ist in einen Lavaspalt gefallen, als die Erde bebte. Ohne ihn schmiede ich nur Löffel. Er liegt irgendwo in den Aschefeldern – und er ist heiß genug, dass ihn sich etwas geschnappt haben könnte.',
    steps: [{ t: 'elite', k: 'b', name: 'Glutpanzer', why: 'Ein riesiger {B} schleppt etwas Glühendes durch die Aschefelder.' },
      { t: 'find', item: 'Meisterhammer', em: '🔨', found: 'Der Stiel ist angekohlt, der Kopf glüht noch. Er liegt gut in der Pfote.' }],
    thanks: 'Mein Hammer! Fühl mal, er ist noch warm. Dafür schmiede ich dir die nächsten Stufen mit doppelter Sorgfalt. Und das hier lag bei meinem Großvater im Schrank.', trk: 'Funkenstein des Meisters' },
  { id: 'i2', n: 'Kühle Köpfe', giver: 'potions', offer: 'In Kaldera will jeder einen Kühltrank, und mir gehen die Zutaten aus. Ich brauche Rissstaub – der macht den Trank kalt – und Ruhe vor den {A}, die in meinen Kessel springen.',
    steps: [{ t: 'kill', k: 'a', need: 7, why: 'Die {A} springen in die Kessel und verderben den Kühltrank.' }, { t: 'give', what: 'staub', need: 4 }],
    thanks: 'Der Trank dampft blau, so soll er sein! Heute schwitzt in Kaldera niemand mehr. Dein Lohn, wie versprochen.' }],
  8: [{ id: 'n1', n: 'Der Name auf der Tür', giver: 'church', offer: 'In Nocturna vergessen die Menschen ihre Namen. Deshalb schreiben wir sie an die Türen. Von einer Tür ist das Schild verschwunden, und die Frau dahinter weiß nicht mehr, wer sie ist. Es liegt irgendwo in den Gassen.',
    steps: [{ t: 'find', item: 'Türschild „Ilva“', em: '🚪', found: 'Messing, abgegriffen. Auf der Rückseite steht in Kinderschrift: „Mama“.' },
      { t: 'elite', k: 'b', name: 'Namenloser', why: 'Ein {B} sammelt in den Gassen Namen, die ihm nicht gehören.' },
      { t: 'talk', to: 'tavern', lines: ['Ilva? Die sitzt jeden Abend dort am Fenster und fragt mich, wie sie heißt. Gib her, ich bringe es ihr an den Tisch.', 'Sie liest es. Sie liest es noch einmal. Jetzt lächelt sie – und bestellt Tee, wie früher. Das Schild nagle ich ihr morgen so fest, dass es der Bruch selbst nicht abbekommt.'] }],
    thanks: 'Ilva grüßt wieder jeden beim Namen. Du hast ihr mehr zurückgegeben als ein Schild. Nimm diesen Schlüssel – er passt zu keiner Tür mehr, aber er erinnert sich an alle.', trk: 'Schlüssel von Nocturna' },
  { id: 'n2', n: 'Tinte, die bleibt', giver: 'magic', offer: 'Alles, was ich aufschreibe, ist am nächsten Morgen fort. Ich brauche Tinte, die sich nicht vergessen lässt: Kernsplitter, fein zerrieben. Und halte mir die {A} vom Fenster fern, sie fressen die Buchstaben.',
    steps: [{ t: 'kill', k: 'a', need: 7, why: 'Die {A} fressen die Buchstaben von den Seiten.' }, { t: 'give', what: 'kern', need: 1 }],
    thanks: 'Sieh nur: Der Satz von gestern steht noch da. „Ein Fuchs hat mir geholfen.“ Das bleibt jetzt. Dein Lohn.' }],
  9: [{ id: 'r1', n: 'Der gefallene Stern', giver: 'church', offer: 'Vorige Nacht ist ein Stern aus dem Bild des Wanderers gefallen. Seitdem fehlt dem Himmel ein Schritt, und die Lotsen finden den Hafen nicht. Er muss auf einer der Schwebeinseln liegen.',
    steps: [{ t: 'find', item: 'Sternensplitter', em: '⭐', found: 'Er ist nicht heiß. Er ist nur sehr, sehr weit weg, obwohl du ihn in der Pfote hältst.' },
      { t: 'talk', to: 'magic', lines: ['Ein Stern aus dem Wanderer! Den hängt man nicht einfach zurück. Ich binde ihn an einen Drachen und lasse ihn steigen. Wenn er angekommen ist, siehst du es.', 'Da – siehst du? Der Wanderer geht wieder.'] }],
    thanks: 'Die Lotsen haben heute Nacht alle Schiffe heimgebracht. Dieser Kompass zeigt nicht nach Norden. Er zeigt auf den Stern, den du zurückgebracht hast.', trk: 'Sternenkompass' },
  { id: 'r2', n: 'Flaute im Wolkenhafen', giver: 'tavern', offer: 'Kein Wind, keine Schiffe, keine Gäste. Die {B} haben sich in den Segeln eingenistet und fressen den Wind, bevor er ankommt. Und meine Hängematten brauchen neues Fell.',
    steps: [{ t: 'elite', k: 'b', name: 'Windfresser', why: 'Eine riesige {B} sitzt im Großsegel und schluckt jede Böe.' }, { t: 'give', what: 'fell', need: 4 }],
    thanks: 'Spürst du das? Wind! Die Segel knattern, und mein Haus ist voll. Hier, bevor ich es an Gäste ausgebe.' }],
  10: [{ id: 'y1', n: 'Echo ohne Stimme', giver: 'church', offer: 'In Elyndra hallt alles wider, was je gesagt wurde. Ein Echo irrt seit dem Bruch umher und findet seine Stimme nicht. Es ist ein Kinderlachen. Fang es ein, bevor die {B} es zerreißen.',
    steps: [{ t: 'elite', k: 'b', name: 'Stimmenräuber', why: 'Ein {B} trägt ein fremdes Lachen in der Brust.' },
      { t: 'find', item: 'Gefangenes Lachen', em: '🫙', found: 'Es kitzelt in den Pfoten. Du musst selbst kurz lachen.' },
      { t: 'talk', to: 'tavern', lines: ['Das … das ist meine Tochter. So hat sie gelacht, bevor der Kern zerbrach. Stell es auf den Tresen. Ich mache jeden Abend das Glas auf, nur für einen Augenblick.'] }],
    thanks: 'Im Wirtshaus wird wieder gelacht, und keiner weiß, wer angefangen hat. Diese Stimmgabel aus Kristall klingt nach allen Welten zugleich.', trk: 'Kristallstimmgabel' },
  { id: 'y2', n: 'Der letzte Schliff', giver: 'smith', offer: 'Ich will eine Klinge schmieden, die kein Echo wirft. Dafür brauche ich Kernsplitter aus dem Herzen dieser Welt und Kristallgrate, auf denen keine {A} mehr herumkratzen.',
    steps: [{ t: 'kill', k: 'a', need: 8, why: 'Die {A} zerkratzen die Kristallgrate, an denen die Klinge gehärtet wird.' }, { t: 'give', what: 'kern', need: 2 }],
    thanks: 'Schlag sie an. Hörst du? Nichts. Vollkommene Stille. Die Klinge behalte ich fürs Schaufenster – aber das hier ist für dich.' }]
};

export function createQuests(C) {
  const S = () => C.S(), st = c => { const q = S().nq || (S().nq = {}); return q[c.id] || (q[c.id] = { s: 0, n: 0 }); };
  const fill = (t, n) => { const P = C.CHP()[n] || {}; return t.replace(/\{A\}/g, n === 1 ? 'Riftling' : (P.A || ['Gegner'])[0]).replace(/\{B\}/g, n === 1 ? 'Dornenwolf' : (P.B || ['Gegner'])[0]).replace(/\{W\}/g, n === 1 ? 'Lunaris' : P.name || ''); };
  const kind = (p, n) => n === 1 ? (p.k === 'a' ? 'rift' : 'wolf') : p.k + n;
  const all = () => Object.entries(CHAINS).flatMap(([n, L]) => L.map((c, i) => ({ c, n: +n, i })));
  const step = c => c.steps[st(c).s - 1];
  const obj = (c, n) => { const s = st(c), p = step(c); if (!s.s) return ''; if (!p) return `Kehre zu ${c.giver === 'church' ? 'der Priesterin' : c.giver === 'tavern' ? 'dem Wirt' : c.giver === 'potions' ? 'dem Krämer' : c.giver === 'smith' ? 'der Schmiedin' : 'der Magierin'} ${AT[c.giver]} zurück`;
    return p.t === 'find' ? `Finde: ${p.item} (leuchtet abseits des Weges)` : p.t === 'kill' ? `Besiege ${p.need} ${fill(p.k === 'a' ? '{A}' : '{B}', n)} (${Math.min(s.n, p.need)}/${p.need})` : p.t === 'elite' ? `Besiege den Zwischengegner „${p.name}“ (abseits des Weges)` : p.t === 'talk' ? `Sprich mit ${p.to === 'church' ? 'der Priesterin' : p.to === 'tavern' ? 'dem Wirt' : p.to === 'potions' ? 'dem Krämer' : p.to === 'smith' ? 'der Schmiedin' : 'der Magierin'} ${AT[p.to]}` : `Bring ${p.need} ${GIVE[p.what][1]} zu ${WHO[c.giver]} ${AT[c.giver]}`; };
  const have = w => w === 'herbs' ? S().herbs : w === 'potions' ? S().potions : (S().mat || {})[w] || 0;
  const take = (w, k) => { if (w === 'herbs') S().herbs -= k; else if (w === 'potions') S().potions -= k; else S().mat[w] -= k; };
  const LIVE = new Map();   // in der aktuellen Welt aufgestellte Fundstücke und Zwischengegner
  function advance(c, n) { const s = st(c); s.s++; s.n = 0; C.sfx('quest'); C.toast('📜 ' + c.n + ': ' + obj(c, n)); arm(c, n); C.refresh(); C.saveGame(true); }
  /* Fundstück oder Zwischengegner des aktiven Schritts in die Welt stellen */
  function arm(c, n) { const p = step(c), key = c.id + ':' + st(c).s; if (!p || C.world() !== n || LIVE.has(key) || (p.t !== 'find' && p.t !== 'elite')) return;
    const i = CHAINS[n].indexOf(c), q = C.spot(i * 3 + st(c).s); if (!q) return; LIVE.set(key, 1);
    if (p.t === 'find') { const m = C.marker(q[0], q[1], p.em); m.userData.on = () => step(c) === p && !st(c).d; C.INT().push({ x: q[0], z: q[1], name: p.item, pr: 'Aufheben', rad: 2.6, vis: () => step(c) === p && !st(c).d, talk() { if (step(c) !== p) return; C.sfx('pick'); C.say([['Zotik', p.found]], () => advance(c, n)); } }); }
    else { const e = C.spawnEnemy(kind(p, n), q[0], q[1]); e.max = Math.round(e.max * 3.2); e.hp = e.max; e.dmg = Math.round((e.dmg || e.d.dmg) * 1.35); e.xp = Math.round((e.xp || e.d.xp) * 3); e.nq = c.id; e.summoned = true; e.d = Object.assign({}, e.d, { name: p.name, sc: e.d.sc * 1.45 }); e.m.root.scale.setScalar(e.d.sc); } }
  function enter(n) { for (const k of [...LIVE.keys()]) if (!(CHAINS[1] || []).some(c => k.startsWith(c.id + ':'))) LIVE.delete(k);   /* Lunaris bleibt beim Weltwechsel bestehen, alle anderen Welten werden neu gebaut */
    for (const c of CHAINS[n] || []) if (st(c).s && !st(c).d) arm(c, n); }
  function kill(e) { const n = C.world(); for (const c of CHAINS[n] || []) { const s = st(c), p = step(c); if (!p || s.d) continue;
      if (p.t === 'elite' && e.nq === c.id) { C.banner('Zwischengegner besiegt', p.name); advance(c, n); }
      else if (p.t === 'kill' && e.k === kind(p, n) && !e.nq) { s.n++; if (s.n >= p.need) advance(c, n); else C.toast(`⚔ ${c.n}: ${s.n}/${p.need}`); } } }
  function reward(c, n) { const s = S(), sh = 60 * n + 60, xp = 40 * n + 60, t = ['💎 +' + sh]; s.shards += sh; st(c).d = 1;
    if (c.trk) { s.trk.push(c.trk); t.push('🎁 ' + c.trk + ' (+1,5 Angriff)'); } else { s.items.phoenix = (s.items.phoenix || 0) + 1; s.mat = s.mat || {}; s.mat.kern = (s.mat.kern || 0) + 1; s.mat.staub = (s.mat.staub || 0) + 3; t.push('🔥 Phönix-Trank · 💠 1 · ✨ 3'); }
    C.gainXp(xp); C.sfx('level'); C.banner('Auftrag erfüllt', c.n); C.toast(t.join(' · ')); C.refresh(); C.saveGame(true); }
  /* Gespräch mit einer Person in einem Stadtgebäude: erst die Quest, sonst (oder auf Wunsch) ihr Laden/Dienst */
  function talk(k, nm, n, base) { const L = CHAINS[n] || [], other = { t: 'Etwas anderes', fn: base };
    for (const c of L) { const s = st(c), p = step(c); if (s.d || !s.s) continue;
      if (!p && c.giver === k) return C.say([[nm, fill(c.thanks, n)]], () => reward(c, n));
      if (p && p.t === 'talk' && p.to === k) return C.say(p.lines.map(t => [nm, fill(t, n)]), () => advance(c, n));
      if (p && p.t === 'give' && c.giver === k) { const g = GIVE[p.what], ok = have(p.what) >= p.need;
        return C.say([[nm, ok ? `Du hast ${p.need} ${g[1]} dabei? Genau das brauche ich!` : `Mir fehlen noch ${p.need} ${g[1]} ${g[0]}. Du hast ${have(p.what)}.`]], null, ok ? [{ t: `${g[0]} ${p.need} ${g[1]} übergeben`, fn() { if (have(p.what) < p.need) return; take(p.what, p.need); advance(c, n); } }, other] : [other, { t: 'Ich suche weiter', fn() { } }]); } }
    for (const c of L) { const s = st(c); if (s.s || s.d || c.giver !== k) continue;
      return C.say([[nm, fill(c.offer, n)]], null, [{ t: '📜 Auftrag annehmen', fn() { C.toast('📜 Neuer Auftrag: ' + c.n); advance(c, n); } }, other, { t: 'Später', fn() { } }]); }
    for (const c of L) { const s = st(c), p = step(c); if (!s.s || s.d || c.giver !== k || !p) continue;
      return C.say([[nm, (p.why ? fill(p.why, n) + ' ' : '') + obj(c, n) + '.']], null, [other, { t: 'Bin dran', fn() { } }]); }
    base(); }
  const mark = (k, n) => (CHAINS[n] || []).some(c => { const s = st(c), p = step(c); return !s.d && ((!s.s && c.giver === k) || (s.s && !p && c.giver === k) || (p && p.t === 'talk' && p.to === k) || (p && p.t === 'give' && c.giver === k && have(p.what) >= p.need)); });
  function html() { const A = all().filter(q => st(q.c).s); if (!A.length) return ''; let h = '<h3>Nebenaufträge in den Städten</h3>';
    for (const { c, n } of A) { const s = st(c); h += `<div class="row"><span>${s.d ? '✅' : step(c) ? '▫️' : '👉'} ${c.n} <small style="color:var(--dim)">· ${fill('{W}', n)}</small><br><small style="color:var(--dim)">${s.d ? 'Erledigt' : obj(c, n)}</small></span></div>`; } return h; }
  const hud = n => (CHAINS[n] || []).filter(c => st(c).s && !st(c).d).slice(0, 2).map(c => '📜 ' + obj(c, n)).join('\n');
  return { talk, mark, kill, enter, html, hud, st, step, obj, advance, all, CHAINS };
}
