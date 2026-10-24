/* Die große Challenge-Show – Moderator-Stimme auf Deutsch (Web Speech; in den Apps über die Android-Sprachausgabe).
 * Bevorzugt eine Männerstimme, viele Sprüche je Ereignis, keine direkte Wiederholung. Untertitel über onSub. */
(function () {
  'use strict';
  const TTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const PH = {
    hello: ['Herzlich willkommen zur großen Challenge-Show! Nur einer holt die Krone!', 'Guten Abend und willkommen! Heute kämpfen alle um den goldenen Pokal!', 'Applaus für unsere Kandidaten! Die Show beginnt!'],
    ampel: ['Runde eins: der Ampel-Lauf! Bei Grün rennen, bei Rot einfrieren!', 'Ampel-Lauf! Wer sich bei Rot bewegt, fliegt raus!'],
    bruecke: ['Die Wackelbrücke! Nur eine Platte pro Reihe hält. Links oder rechts?', 'Willkommen auf der Wackelbrücke! Merkt euch, wo die anderen hingesprungen sind!'],
    seil: ['Seilziehen! Zieht im Takt, dann seid ihr stärker!', 'Zwei Teams, ein Seil! Tippt genau im grünen Bereich!'],
    keks: ['Keks-Kunst! Fahrt die Form nach, aber vorsichtig, sonst bricht der Keks!', 'Ganz ruhige Hände jetzt! Die Form muss heil bleiben!'],
    stuhl: ['Reise nach Jerusalem! Wenn die Musik stoppt, schnell auf einen Stuhl!', 'Musik an! Und wenn sie aufhört: Stuhl suchen!'],
    finale: ['Das große Finale! Schubst euch von der Plattform! Wer übrig bleibt, gewinnt!', 'Finale! Die Plattform wird kleiner! Haltet euch fest!'],
    green: ['Grünes Licht!', 'Grün! Lauft!', 'Und los!'], red: ['Rotes Licht!', 'Stopp!', 'Rot! Einfrieren!'],
    out: ['Und raus!', 'Oh nein, ausgeschieden!', 'Das war es leider!', 'Puff, Konfetti-Abflug!', 'Schade, aber tapfer gekämpft!', 'Tschüss und danke fürs Mitmachen!'],
    meOut: ['Oh nein! Du bist ausgeschieden! Aber schau weiter zu!', 'Das war knapp! Für dich ist die Show vorbei.'],
    safe: ['Geschafft!', 'Sicher im Ziel!', 'Super gemacht!', 'Weiter geht es!'],
    tileOk: ['Die hält!', 'Glück gehabt!', 'Sicher!'], tileBad: ['Platsch in den Schaum!', 'Die war es nicht!', 'Oh, ab in die Schaumstoffgrube!'],
    tug: ['Ziehen! Ziehen! Ziehen!', 'Gebt alles!', 'Im Takt bleiben!'],
    crack: ['Knacks! Der Keks ist gebrochen!', 'Oh nein, Krümel überall!'],
    stop: ['Musik aus! Hinsetzen!', 'Stühle! Schnell!'], music: ['Musik! Tanzt im Kreis!', 'Und weiter geht die Reise!'],
    roundEnd: ['Die Runde ist vorbei!', 'Was für eine Runde!', 'Applaus für die Überlebenden!'],
    winner: ['Wir haben einen Sieger! Die Krone geht an', 'Unglaublich! Der Champion der Show ist', 'Konfetti für den Gewinner:'],
    youWin: ['Du hast die große Challenge-Show gewonnen! Wahnsinn!', 'Du bist der Champion! Die Krone gehört dir!'],
    hurry: ['Die Zeit läuft ab!', 'Schneller, schneller!', 'Nur noch wenige Sekunden!'],
  };
  let voices = [], on = true, onSub = null, last = 0;
  function load() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if (TTS) { load(); try { speechSynthesis.onvoiceschanged = load; } catch (e) { } }
  const DE = v => /^de(-|_|$)/i.test(v.lang);
  const MALE = /stefan|markus|conrad|killian|florian|jonas|hans|yannick|bernd|klaus|\bmale\b|männ|x-de[bd]\b|smtm\d/i, FEM = /anna|katja|hedda|petra|marlene|vicki|amala|seraphina|helena|female|frau|google deutsch/i;
  function voice() { const de = voices.filter(DE); if (!de.length) return null; return de.find(v => MALE.test(v.name) && /natural|online|neural/i.test(v.name)) || de.find(v => MALE.test(v.name)) || de.find(v => !FEM.test(v.name)) || de[0]; }
  function say(text, prio) {
    if (onSub) onSub(text); if (!on || !TTS) return;
    const now = performance.now(); if (!prio && now - last < 1200 && speechSynthesis.speaking) return; last = now;
    try { if (prio) speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text), v = voice(); u.lang = 'de-DE'; if (v) u.voice = v; const male = v && MALE.test(v.name); u.pitch = male ? .95 : .72; u.rate = 1.06; u.volume = 1; speechSynthesis.speak(u); } catch (e) { }
  }
  const bag = {};
  function pick(k, a) { const used = bag[k] || (bag[k] = []); let pool = a.filter(x => !used.includes(x)); if (!pool.length) { used.length = 0; pool = a; } const x = pool[Math.floor(Math.random() * pool.length)]; used.push(x); if (used.length > Math.max(1, a.length - 2)) used.shift(); return x; }
  window.CSVoice = {
    PH, available: TTS, say, line: k => pick(k, PH[k] || [k]), ann: (k, prio, extra) => say(pick(k, PH[k] || [k]) + (extra ? ' ' + extra : ''), prio),
    stop: () => { if (TTS) try { speechSynthesis.cancel(); } catch (e) { } },
    set on(v) { on = !!v; if (!on) this.stop(); }, get on() { return on; }, set onSub(f) { onSub = f; },
  };
})();
