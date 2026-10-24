/* Brainrot Parkour – Brainrot-Sprachausgabe: italienische Stimme (Web Speech; in der RicoReWi-App über die Android-Sprachausgabe).
 * Standard: tiefe, dramatische Männerstimme (wie die typischen Brainrot-Ansagen) – umschaltbar auf Frauen- oder Figurenstimme.
 * Viele eigene Quatsch-Sprüche für Ereignisse, dazu zufällige Brainrot-Rufe beim Spielen. Untertitel über onSub. */
(function () {
  'use strict';
  const TTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const PH = {
    start: ['Pronti, partenza, brainrot!', 'Tre, due, uno… spaghettata!', 'Via via via, che follia!', 'Accendete i cervellini, si parte!', 'Brainrotto, brainrottone, comincia la missione!', 'Mamma mia, che partenza, pura incoerenza!'],
    check: ['Checkpointino raggiuntino!', 'Bravissimo, bravissimo!', 'Mamma mia, che salto!', 'Fantastico, fantasticone!', 'Salvato nel pentolone!', 'Bandierina, bandierona, la memoria funziona!', 'Ecco qua, ecco là, il checkpoint resterà!', 'Salvataggio croccantissimo!'],
    die: ['Mamma mia!', 'Ahia ahia ahia!', 'Splash nella salsa!', 'Ops, che figuraccia!', 'Nooo, il mio cervellino!', 'Ritenta, campioncino!', 'Caduto come un raviolo!', 'Plof! Dritto nel minestrone!', 'Che disastro, che pasticcio, sei finito nel sugo riccio!', 'Spaghettificato!', 'Ma perché? Ma perché?'],
    goal: ['Campionissimo! Brainrot totale!', 'Vittoria! Spaghetti per tutti!', 'Sei il re del parkour assurdo!', 'Leggendario, leggendarissimo!', 'Il traguardo è tuo, cervello d’oro!', 'Bombastico, fantastico, brainrot galattico!'],
    coin: ['Monetina!', 'Soldino!', 'Che ricchezza!', 'Cling cling!', 'Moneta croccante!', 'Ricco ricchissimo!'],
    lava: ['Il pavimento è salsa!', 'Non toccare il pavimento!', 'Corri corri, piastrellina!', 'Le mattonelle crollano, scappa!'],
    tower: ['Su, su, sempre più su!', 'La salsa sale, scappa!', 'Torre infinita, salto della vita!', 'Il sugo ti insegue, salta!'],
    win: ['Primo posto, bellissimo!', 'Medaglia d’oro, pizza d’oro!', 'Numero uno, come nessuno!', 'Vittoria assurda, festa del brainrot!'],
    lose: ['Quasi quasi!', 'La prossima volta, amico!', 'Peccatissimo, ma sei forte lo stesso!', 'Non mollare, cervellone!'],
    quiz: ['Chi lo dice?', 'Ascolta bene!', 'Indovina, indovinello!'],
    right: ['Giusto giustissimo!', 'Esatto, bravissimo!', 'Sì sì sì!', 'Cervello acceso!', 'Che orecchio fino!'],
    wrong: ['Sbagliato, sbagliatino!', 'No no no!', 'Peccato!', 'Ma che dici?', 'Cervello in pappa!'],
    // zufällige Brainrot-Rufe zwischendurch
    shout: ['Brainrot brainrot, cervello nel forno!', 'Pazzesco, pazzeschissimo!', 'Zigo zago, chi salta è un mago!', 'Bombastico!', 'Spaghetti in orbita, mamma mia!', 'Piripì, piripò, saltare sì, cadere no!', 'Che assurdità, che felicità!', 'Zuppa, zuppa, cervello in tazza!', 'Ding dong, il parkour è bon!', 'Ciao ciao gravità!', 'Salto quantico al pomodoro!', 'Ehi ehi, che brainrot oggi!', 'Polpettone volante, salto gigante!', 'Patatina, patatona, la fortuna è buona!', 'Mozzarella spaziale, salto fenomenale!'],
    idle: ['Ehi! Ci sei? Il parkour aspetta!', 'Muoviti, muoviti, cervellino!', 'Che fai, dormi nel risotto?', 'Il tempo corre, tu no!'],
  };
  let voices = [], on = true, onSub = null, last = 0, mode = 'm';
  function load() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if (TTS) { load(); try { speechSynthesis.onvoiceschanged = load; } catch (e) { } }
  const IT = v => /^it(-|_|$)/i.test(v.lang);
  const MALE = /luca|diego|cosimo|giorgio|paolo|roberto|marco|andrea|riccardo|benigno|giuseppe|\bmale\b|uomo|maschi|x-it[cd]\b|smtm\d/i  // Android: Google „x-itc/x-itd“, Samsung „SMTm…“ = Männerstimmen, FEM = /alice|federica|elsa|isabella|paola|carla|chiara|female|donna|google italiano/i;
  function voice() {
    const it = voices.filter(IT); if (!it.length) return null;
    if (mode === 'w') return it.find(v => FEM.test(v.name)) || it[0];
    return it.find(v => MALE.test(v.name) && /natural|online|neural/i.test(v.name)) || it.find(v => MALE.test(v.name)) || it.find(v => !FEM.test(v.name)) || it[0];
  }
  // Tonhöhe: Männerstimme tief und dramatisch (bei weiblicher Systemstimme noch tiefer gedreht)
  function tune(pitch) { const v = voice(), male = v && MALE.test(v.name); if (mode === 'm') return { p: Math.max(.3, (male ? .82 : .5) + ((pitch || 1) - 1) * .22), r: .93 }; if (mode === 'w') return { p: 1.05 + ((pitch || 1) - 1) * .3, r: 1.05 }; return { p: pitch || 1, r: 1.02 }; }
  function say(text, pitch, rate, prio) {
    if (onSub) onSub(text);
    if (!on || !TTS) return;
    const now = performance.now(); if (!prio && now - last < 900 && speechSynthesis.speaking) return; last = now;
    try { if (prio) speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text), t = tune(pitch); u.lang = 'it-IT'; const v = voice(); if (v) u.voice = v; u.pitch = Math.max(.1, Math.min(2, t.p)); u.rate = (rate || 1) * t.r; u.volume = 1; speechSynthesis.speak(u); } catch (e) { }
  }
  const bag = {}; // Sprüche nicht direkt wiederholen
  function pick(k, a) { const used = bag[k] || (bag[k] = []); let pool = a.filter(x => !used.includes(x)); if (!pool.length) { used.length = 0; pool = a; } const x = pool[Math.floor(Math.random() * pool.length)]; used.push(x); if (used.length > Math.max(1, a.length - 2)) used.shift(); return x; }
  window.BRVoice = {
    PH, available: TTS, say, ann: (k, prio) => say(pick(k, PH[k] || [k]), 1, 1.02, prio),
    char: (c, prio) => say(pick('c' + c.id, c.say), c.pitch, 1, prio),
    stop: () => { if (TTS) try { speechSynthesis.cancel(); } catch (e) { } },
    set on(v) { on = !!v; if (!on) this.stop(); }, get on() { return on; },
    set mode(v) { mode = v === 'w' || v === 'f' ? v : 'm'; }, get mode() { return mode; },
    set onSub(f) { onSub = f; }, hasItalian: () => !!voice(),
  };
})();
