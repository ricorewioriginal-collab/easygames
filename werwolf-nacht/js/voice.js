/* Werwolf-Nacht – Erzählerstimme über die Sprachausgabe des Geräts.
 * Im Browser: eine feste deutsche Männerstimme (einmal gewählt, dann beibehalten; ohne Männerstimme tiefere Tonlage).
 * In der RicoReWi-App (Android): die Android-Stimme des Geräts – die App leitet speechSynthesis an Android weiter. */
(function () {
  'use strict';
  const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
  const APP = !!(window.RRWNative && window.RRWNative.ttsSpeak) || !!window.__rrwTtsOn;
  const MALE = /\b(stefan|conrad|killian|florian|kasper|markus|yannick|viktor|martin|reed|grandpa|rocko|eddy|ralf|jonas|bernd|klaus|hans|male|männlich|mann)\b/i;
  const FEMALE = /female|weiblich|\bfrau\b|anna|petra|helena|hedda|katja|amala|seraphina|marlene|vicki|sandy|shelley|flo\b|grandma|louisa|elke|ingrid|gisela|tanja|ilse|katharina|maja|sabine|leni|hanna/i;
  let voice = null, male = false, ready = null, chain = Promise.resolve(), on = true;
  function pick() {
    if (!synth || APP) return;
    const german = synth.getVoices().filter(v => /^de([-_]|$)/i.test(v.lang));
    if (!german.length || (voice && german.includes(voice))) return;
    const men = german.filter(v => MALE.test(v.name) && !FEMALE.test(v.name));
    const best = l => l.find(v => /natural|neural|online|premium|enhanced/i.test(v.name)) || l.find(v => v.localService) || l[0];
    male = men.length > 0;
    voice = male ? best(men) : (best(german.filter(v => !FEMALE.test(v.name))) || best(german));
  }
  function whenReady() {
    if (!synth || APP) return Promise.resolve();
    pick(); if (voice) return Promise.resolve();
    ready = ready || new Promise(res => { const done = () => { pick(); res(); }; if (synth.addEventListener) synth.addEventListener('voiceschanged', done, { once: true }); setTimeout(done, 1200); });
    return ready;
  }
  if (synth && synth.addEventListener) synth.addEventListener('voiceschanged', pick);
  // Handys geben die Sprachausgabe erst nach einem Tipp frei: einmal stumm sprechen
  function unlock() {
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach(t => removeEventListener(t, unlock, true));
    if (!synth) return; pick();
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'de-DE'; synth.speak(u); } catch (e) { }
  }
  if (synth) ['pointerdown', 'touchend', 'click', 'keydown'].forEach(t => addEventListener(t, unlock, { capture: true, passive: true }));
  const clean = t => String(t || '').replace(/[„“”"«»]/g, '').replace(/[🐺🔮🧪🛡️🏹🧑‍🌾🌙☀️⚖️💀🔥]/gu, '').replace(/\s+/g, ' ').trim();
  function stop() { try { if (synth) synth.cancel(); } catch (e) { } chain = Promise.resolve(); }
  // queue: anhängen statt unterbrechen; Rückgabe: Promise, das nach dem Sprechen (oder Zeitlimit) erfüllt ist
  function speak(text, queue) {
    const msg = clean(text);
    if (!synth || !msg || !on) return Promise.resolve();
    const busy = !queue && (synth.speaking || synth.pending);
    if (!queue) stop();
    const p = chain.then(whenReady).then(() => new Promise(r => busy ? setTimeout(r, 120) : r())).then(() => new Promise(done => {
      const u = new SpeechSynthesisUtterance(msg); u.lang = 'de-DE'; u.rate = APP ? 1 : .98; u.pitch = APP ? 1 : male ? .9 : .78;
      if (voice) u.voice = voice;
      const lim = setTimeout(done, 1500 + msg.length * 90); u.onend = u.onerror = () => { clearTimeout(lim); done(); };
      try { if (synth.paused) synth.resume(); synth.speak(u); } catch (e) { clearTimeout(lim); done(); }
    }));
    chain = p; return p;
  }
  window.WWVoice = { speak, stop, get app() { return APP; }, set on(v) { on = !!v; if (!on) stop(); }, get on() { return on; } };
})();
