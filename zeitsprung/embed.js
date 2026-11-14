/*! ZEITSPRUNG – Einbindung der Ausgaben in das gemeinsame 3D-Studio (zeitsprung/).
 * Wird von jeder Ausgabe (zeitsprung-wissen, -movie, …) direkt nach style.css geladen und tut nur etwas,
 * wenn die Seite mit ?zs=1 im ZEITSPRUNG-Studio läuft. Die Spiellogik der Ausgabe bleibt unverändert:
 *  - neues Design (embed.css), altes r128-Studio aus (das neue 3D-Studio liegt hinter dem transparenten iframe)
 *  - Vito spricht über die einheitliche Studio-Stimme (zeitsprung/voice.js) statt über die Systemstimme
 *  - gamepad.js nur zum Vereinheitlichen der Pads, die Steuerung übernimmt das Studio (zeitsprung/input.js)
 */
(function () {
  'use strict';
  var embedded = /[?&]zs=1\b/.test(location.search) && window.parent && window.parent !== window;
  if (!embedded) return;
  var root = document.documentElement, host = null;
  try { host = window.parent.ZEITSPRUNG || null; } catch (e) { host = null; }
  root.classList.add('zs-embed');
  var link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = '../zeitsprung/embed.css';
  document.head.appendChild(link);

  // Altes Studio (three r128) gar nicht erst starten: game.js prüft window.THREE.
  try { Object.defineProperty(window, 'THREE', { configurable: true, get: function () { return undefined; }, set: function () {} }); } catch (e) {}
  // gamepad.js nur als Pad-Normalisierung; Navigation und Knöpfe steuert das Studio.
  window.EASYGAMES_PAD_NORMAL_ONLY = 1;

  // Sprachausgabe an die Studio-Stimme weiterreichen. vito.js bleibt unverändert: speak() hängt an, cancel() bricht ab.
  var synth = window.speechSynthesis;
  function voice() { try { return window.parent.ZSVoice || null; } catch (e) { return null; } }
  if (synth) {
    var patch = function (name, fn) { try { Object.defineProperty(synth, name, { configurable: true, writable: true, value: fn }); } catch (e) { try { synth[name] = fn; } catch (_) {} } };
    var getter = function (name, fn) { try { Object.defineProperty(synth, name, { configurable: true, get: fn }); } catch (e) {} };
    patch('speak', function (utterance) {
      var v = voice(), text = utterance && String(utterance.text || '').trim();
      if (!v || !text) return;
      v.say(text, { source: 'vito' });
    });
    patch('cancel', function () { var v = voice(); if (v) v.stop(); });
    patch('pause', function () {});
    patch('resume', function () {});
    getter('speaking', function () { var v = voice(); return !!(v && v.speaking()); });
    getter('pending', function () { var v = voice(); return !!(v && v.pending()); });
    getter('paused', function () { return false; });
  }
  window.ZSEmbed = { host: host, edition: (location.pathname.match(/zeitsprung-([a-z]+)/) || [])[1] || '' };
  document.addEventListener('DOMContentLoaded', function () {
    try { window.parent.postMessage({ zs: 'dom', edition: window.ZSEmbed.edition }, location.origin === 'null' ? '*' : location.origin); } catch (e) {}
  });
})();
