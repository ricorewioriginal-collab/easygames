/* Werwolf-Nacht – Texte: Namen der Dorfbewohner, Erzähler-Sätze und Aussagen der Computer-Spieler. {t} = Ziel, {n} = Name, {r} = Rolle. */
(function (root) {
  'use strict';
  const NAMES = ['Bäcker Bruno', 'Müllerin Mia', 'Schmied Kalle', 'Hirtin Greta', 'Pfarrer Paul', 'Wirtin Rosi', 'Förster Hubert', 'Näherin Lotte', 'Fischer Olaf', 'Bürgermeister Egon', 'Kräuterfrau Ilse', 'Schuster Sepp', 'Magd Frieda', 'Nachtwächter Jost', 'Lehrerin Agathe', 'Imker Theo', 'Gärtnerin Paula', 'Kutscher Fritz', 'Bauer Anton', 'Weberin Hanna', 'Zimmermann Kurt', 'Händlerin Clara', 'Barde Lio', 'Wäscherin Erna', 'Jäger Rudi', 'Töpferin Nele', 'Fährmann Ole', 'Apothekerin Vera'];
  const NARR = {
    night1: ['Es wird Nacht über dem Dorf. Alle schließen die Augen.', 'Der Vollmond steigt über die Dächer. Das Dorf schläft ein.', 'Die Kirchturmuhr schlägt Mitternacht. Alle Augen zu!'],
    wake: { guard: 'Der Leibwächter erwacht und wählt, wen er heute Nacht beschützt.', wolf: 'Die Werwölfe erwachen und suchen sich ein Opfer.', seer: 'Die Seherin erwacht und blickt in eine Seele.', witch: 'Die Hexe erwacht und prüft ihre Tränke.' },
    sleep: { guard: 'Der Leibwächter schläft wieder ein.', wolf: 'Die Werwölfe schleichen zurück in ihre Betten.', seer: 'Die Seherin schließt die Augen.', witch: 'Die Hexe schläft wieder ein.' },
    dawn: ['Der Hahn kräht. Das Dorf erwacht.', 'Die Sonne geht auf. Alle öffnen die Augen.', 'Ein neuer Morgen bricht an.'],
    noDeath: ['Wie durch ein Wunder ist heute Nacht niemand gestorben!', 'Alle sind noch da – diese Nacht ging gut aus.'],
    death: ['Heute Nacht wurde {n} gefunden. {n} war {r}.', 'Ein Schrei in der Nacht: {n} ist tot. {n} war {r}.'],
    poison: ['Und auch {n} wacht nicht mehr auf – vergiftet. {n} war {r}.'],
    day: ['Diskutiert! Wer von euch ist ein Werwolf?', 'Jetzt wird beraten. Wem traut ihr nicht?'],
    vote: ['Die Zeit ist um. Stimmt ab, wer das Dorf verlassen muss!', 'Die Trommel ruft zur Abstimmung!'],
    lynch: ['Das Dorf hat entschieden: {n} wird verbannt. {n} war {r}.', 'Mit großer Mehrheit muss {n} gehen. {n} war {r}.'],
    tie: ['Gleichstand! Heute wird niemand verbannt.', 'Das Dorf ist sich nicht einig – niemand muss gehen.'],
    hunter: '{n} war der Jäger und reißt mit dem letzten Schuss {t} mit sich. {t} war {r}.',
    winVillage: 'Der letzte Werwolf ist besiegt! Das Dorf hat gewonnen!',
    winWolf: 'Die Werwölfe haben das Dorf überrannt. Die Werwölfe gewinnen!'
  };
  const TALK = {
    accuse: ['Ich traue {t} nicht über den Weg.', '{t} war gestern auffällig still …', 'Wo war {t} letzte Nacht? Sehr verdächtig!', 'Ich habe ein mieses Gefühl bei {t}.', 'Ich wette, {t} hat Fell unter dem Hemd!', '{t} hat vorhin so komisch gegrinst.'],
    doubt: ['Hm, {t} kommt mir komisch vor.', 'Ich bin mir nicht sicher, aber {t} …', 'Behaltet {t} im Auge.', '{t} redet mir ein bisschen zu viel.'],
    calm: ['Ich bin nur ein einfacher Dorfbewohner, glaubt mir!', 'Lasst uns nicht vorschnell urteilen.', 'Ich habe die ganze Nacht geschlafen, ehrlich.', 'Wir müssen zusammenhalten!', 'Ich hab nichts gesehen und nichts gehört.'],
    claimWolf: ['Ich bin die Seherin! Ich habe in {t} hineingeblickt – ein Werwolf!', 'Hört mir zu: Ich bin die Seherin. {t} ist ein Werwolf!'],
    claimGood: ['Ich bin die Seherin – {t} ist unschuldig.', 'Als Seherin sage ich euch: {t} ist kein Werwolf.'],
    agree: ['Stimmt, {t} ist mir auch verdächtig!', 'Ganz meine Meinung – {t}!', 'Ja, {t} hat sich komisch benommen.'],
    disagree: ['Ach was, {t} doch nicht!', 'Ich glaube nicht, dass es {t} war.', 'Lasst {t} in Ruhe!'],
    back: ['Und warum zeigst ausgerechnet du auf andere?', 'Wer so laut beschuldigt, hat selbst etwas zu verbergen!']
  };
  const WW_DATA = { NAMES, NARR, TALK };
  if (typeof module !== 'undefined' && module.exports) module.exports = WW_DATA;
  root.WW_DATA = WW_DATA;
})(typeof window !== 'undefined' ? window : globalThis);
