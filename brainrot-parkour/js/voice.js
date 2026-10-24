/* Brainrot Parkour – Brainrot-Sprachausgabe: italienische Stimme (Web Speech; in der RicoReWi-App über die Android-Sprachausgabe),
 * Tonhöhe je Figur, Sprüche des Ansagers zu Ereignissen und Untertitel-Rückruf. */
(function () {
  'use strict';
  const TTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const PH = {
    start: ['Pronti, partenza, brainrot!', 'Tre, due, uno… spaghettata!', 'Via via via, che follia!'],
    check: ['Checkpointino raggiuntino!', 'Bravissimo, bravissimo!', 'Mamma mia, che salto!', 'Fantastico, fantasticone!', 'Salvato nel pentolone!'],
    die: ['Mamma mia!', 'Ahia ahia ahia!', 'Splash nella salsa!', 'Ops, che figuraccia!', 'Nooo, il mio cervellino!', 'Ritenta, campioncino!'],
    goal: ['Campionissimo! Brainrot totale!', 'Vittoria! Spaghetti per tutti!', 'Sei il re del parkour assurdo!'],
    coin: ['Monetina!', 'Soldino!', 'Che ricchezza!'],
    lava: ['Il pavimento è salsa!', 'Non toccare il pavimento!'],
    tower: ['Su, su, sempre più su!', 'La salsa sale, scappa!'],
    win: ['Primo posto, bellissimo!', 'Medaglia d’oro, pizza d’oro!'],
    lose: ['Quasi quasi!', 'La prossima volta, amico!'],
    quiz: ['Chi lo dice?', 'Ascolta bene!'],
    right: ['Giusto giustissimo!', 'Esatto, bravissimo!', 'Sì sì sì!'],
    wrong: ['Sbagliato, sbagliatino!', 'No no no!', 'Peccato!'],
  };
  let voices = [], on = true, onSub = null, last = 0;
  function load() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if (TTS) { load(); try { speechSynthesis.onvoiceschanged = load; } catch (e) { } }
  const itVoice = () => voices.find(v => /^it(-|_|$)/i.test(v.lang) && /google|natural|online|alice|federica|luca/i.test(v.name)) || voices.find(v => /^it(-|_|$)/i.test(v.lang)) || null;
  function say(text, pitch, rate, prio) {
    if (onSub) onSub(text);
    if (!on || !TTS) return;
    const now = performance.now(); if (!prio && now - last < 900 && speechSynthesis.speaking) return; last = now;
    try { if (prio) speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'it-IT'; const v = itVoice(); if (v) u.voice = v; u.pitch = Math.max(.1, Math.min(2, pitch || 1)); u.rate = rate || 1.05; u.volume = 1; speechSynthesis.speak(u); } catch (e) { }
  }
  const pick = a => a[Math.floor(Math.random() * a.length)];
  window.BRVoice = {
    PH, available: TTS, say, ann: (k, prio) => say(pick(PH[k] || [k]), 1.05, 1.08, prio),
    char: (c, prio) => say(pick(c.say), c.pitch, 1.02, prio),
    stop: () => { if (TTS) try { speechSynthesis.cancel(); } catch (e) { } },
    set on(v) { on = !!v; if (!on) this.stop(); }, get on() { return on; },
    set onSub(f) { onSub = f; }, hasItalian: () => !!itVoice(),
  };
})();
