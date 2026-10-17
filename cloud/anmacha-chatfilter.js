/*! AnMaCha Chat-Filter – Wortfilter für den easygames-Chat (chat.html). Reine Logik ohne DOM (Test: node tools/test-chatfilter.mjs).
 *  check(text)  → { ok, reason, text }: vor dem Senden. Blockt Beleidigungen/Hass/Sexuelles, Links, Kontaktdaten (E-Mail, Telefon, Handles),
 *                 glättet Großschreibung und Wiederholungen (text = bereinigte Fassung).
 *  mask(text)   → Text, in dem verbotene Wörter durch Sternchen ersetzt sind: beim Anzeigen (schützt auch vor Nachrichten, die den Filter umgehen).
 *  Erkennt Schreibtricks: Groß/Klein, Umlaute, Zahlen-/Sonderzeichen-Ersatz (4=a, 0=o, @=a …), gedehnte Buchstaben (fuuuck), Leerzeichen/Punkte
 *  zwischen einzelnen Buchstaben (f u c k). Wortlisten stehen unten: "stamm" trifft Wortanfänge, "wort=" nur das ganze Wort. */
(function (root) {
  'use strict';
  var STEMS = [
    // Deutsch: Beleidigungen, Vulgäres
    'arschloch', 'arschgeige', 'arschficker', 'wichser', 'wichsen', 'hurensohn', 'hurensoehne', 'hure=', 'huren=', 'nutte', 'nutten=', 'fotze', 'fotzen=', 'schlampe', 'schlampen=',
    'scheiss', 'scheisse', 'beschissen', 'fick', 'ficken', 'ficker', 'gefickt', 'verpiss', 'pisser=', 'missgeburt', 'spast', 'spasti', 'mongo=', 'mongos=', 'bastard', 'drecksau', 'dreckssau',
    'schwuchtel', 'penner=', 'votze', 'vollidiot', 'wixer', 'wixxer', 'kackbratze', 'dummficker', 'halt die fresse', 'fresse halten', 'maul halten', 'halts maul',
    // Deutsch: Hass, Gewalt
    'neger', 'negerin', 'kanake', 'kanacke', 'zigeuner', 'untermensch', 'judensau', 'heil hitler', 'sieg heil', 'hitler', 'nazi', 'nazis=', 'hakenkreuz', 'ausländer raus', 'auslaender raus',
    'bring dich um', 'erschiess dich', 'erschiess dich', 'stirb', 'ich töte dich', 'ich toete dich', 'ich bring dich um', 'ich find dich', 'kys=', 'selbstmord',
    // Deutsch: Sexuelles
    'porno', 'pornos=', 'porn=', 'sex=', 'sexy=', 'titten', 'blowjob', 'blasen=', 'nackt', 'nacktbilder', 'nudes=', 'nude=', 'orgasmus', 'schwanzlutscher', 'fickdich', 'ficken',
    // Englisch
    'fuck', 'fucker', 'fucking', 'fucked', 'motherfucker', 'shit', 'shitty', 'bullshit', 'bitch', 'bitches=', 'cunt', 'asshole', 'dickhead', 'dick=', 'dicks=', 'cock=', 'cocks=', 'pussy', 'whore', 'slut', 'slutty',
    'nigger', 'nigga', 'niggas=', 'faggot', 'fag=', 'fags=', 'retard', 'retarded', 'rape', 'raped=', 'rapist', 'kill yourself', 'kill urself', 'kms=', 'suicide', 'cum=', 'porn', 'nazi', 'sexting', 'horny=', 'dildo'
  ];
  var TLD = 'de|com|net|org|io|gg|ly|tk|xyz|info|eu|me|tv|cc|co|ru|app|dev|shop|online|site|link|club|top|biz|at|ch|us|uk|fr|it|es|nl|pl|to|in|ws|gl|tt|be|ink|click';
  var URL_RE = new RegExp('(https?:|www\\.|ftp:|://)|\\b[a-z0-9-]{2,}\\s?(\\.|\\(dot\\)|\\[dot\\]|\\s+dot\\s+)\\s?(' + TLD + ')\\b', 'i');
  var MAIL_RE = /[\w.+-]+\s?(@|\(at\)|\[at\]|\s+at\s+)\s?[\w-]+\s?(\.|\(dot\)|\s+dot\s+)\s?[a-z]{2,}/i;
  var HANDLE_RE = /(^|\s)@[a-z0-9_.]{3,}/i;
  var APP_RE = /\b(whats\s?app|telegram|discord|snap\s?chat|snapchat|insta(gram)?|tik\s?tok|signal|skype|kik)\b/i;
  var SUBS = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '€': 'e' };

  function fold(s) {
    s = String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
    try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
    return s;
  }
  // Wort für den Vergleich: Ersatzzeichen zurückübersetzen, nur Buchstaben, Wiederholungen (fuuuck) auf höchstens 2 kürzen
  function norm(w) {
    var s = fold(w).replace(/[0134578@$€]/g, function (c) { return SUBS[c]; }).replace(/[^a-z]/g, '');
    return s.replace(/(.)\1{2,}/g, '$1$1');
  }
  function single(s) { return s.replace(/(.)\1+/g, '$1'); }   // zusätzlich Doppelbuchstaben einfach (fuck/fuk)
  function prep(list) {
    var stems = [], exact = {}, phrases = [];
    list.forEach(function (w) {
      var ex = w.slice(-1) === '=', raw = ex ? w.slice(0, -1) : w;
      if (raw.indexOf(' ') >= 0) { phrases.push(norm(raw.replace(/ /g, '_').replace(/_/g, ' ').split(' ').join(''))); return; }
      var n = norm(raw); if (!n) return;
      if (ex) exact[n] = 1; else stems.push(n);
    });
    return { stems: stems, exact: exact, phrases: phrases, stemsS: stems.map(single), exactS: Object.keys(exact).map(single) };
  }
  var L = prep(STEMS);
  function bad(n) {
    if (!n || n.length < 2) return false;
    if (L.exact[n]) return true;
    var s = single(n), i;
    if (L.exactS.indexOf(s) >= 0) return true;
    for (i = 0; i < L.stems.length; i++) { if (n.indexOf(L.stems[i]) === 0 || s.indexOf(L.stemsS[i]) === 0) return true; }
    return false;
  }
  // Wörter mit Position im Originaltext; Folgen einzelner Buchstaben ("f u c k", "f.u.c.k") werden zu einem Wort zusammengezogen
  function words(text) {
    var re = /[\p{L}\p{N}@$€]+/gu, m, out = [];
    while ((m = re.exec(text))) out.push({ w: m[0], a: m.index, b: m.index + m[0].length });
    var res = [], i = 0, j;
    while (i < out.length) {
      if (out[i].w.length === 1 && /[\p{L}\p{N}]/u.test(out[i].w)) {
        j = i; var gap = true;
        while (j + 1 < out.length && out[j + 1].w.length === 1 && /^[\s.\-_*,]{1,3}$/.test(text.slice(out[j].b, out[j + 1].a))) j++;
        if (j - i >= 2) { res.push({ w: out.slice(i, j + 1).map(function (x) { return x.w; }).join(''), a: out[i].a, b: out[j].b }); i = j + 1; continue; }
      }
      res.push(out[i]); i++;
    }
    return res;
  }
  function hits(text) {
    var ws = words(text), found = [], i;
    ws.forEach(function (x) { if (bad(norm(x.w))) found.push(x); });
    // Wortgruppen ("halt die fresse", "heil hitler", "kill yourself"): alle Wörter zusammen, ohne Trenner
    var all = norm(ws.map(function (x) { return x.w; }).join(' ').replace(/\s+/g, ''));
    for (i = 0; i < L.phrases.length; i++) if (L.phrases[i] && all.indexOf(L.phrases[i]) >= 0 && !found.length) found.push({ a: 0, b: text.length, phrase: true });
    return found;
  }
  function mask(text) {
    text = String(text == null ? '' : text);
    var f = hits(text);
    if (!f.length) return text;
    if (f.some(function (x) { return x.phrase; })) return '***';
    f.sort(function (a, b) { return b.a - a.a; }).forEach(function (x) { text = text.slice(0, x.a) + new Array(x.b - x.a + 1).join('*') + text.slice(x.b); });
    return text;
  }
  function tidy(text) {
    text = String(text == null ? '' : text).replace(/[\u0000-\u001f\u007f<>​-‏‪-‮⁦-⁩﻿]/g, ' ').replace(/\s+/g, ' ').trim();
    text = text.replace(/(.)\1{3,}/g, '$1$1$1').replace(/([!?.])\1{2,}/g, '$1$1');
    var letters = text.replace(/[^\p{L}]/gu, '');
    if (letters.length >= 8 && letters.replace(/[^\p{Lu}]/gu, '').length / letters.length > 0.7) text = text.toLowerCase().replace(/(^|[.!?]\s+)(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); });
    return text;
  }
  // Prüfung vor dem Senden. Gründe: empty, long, bad (Wortfilter), link, contact
  function check(text, max) {
    var t = tidy(text), lim = max || 200;
    if (!t) return { ok: false, reason: 'empty', text: '' };
    if (t.length > lim) return { ok: false, reason: 'long', text: t };
    var plain = fold(t).replace(/[0134578@$€]/g, function (c) { return SUBS[c]; });
    if (hits(t).length) return { ok: false, reason: 'bad', text: t };
    if (URL_RE.test(t) || URL_RE.test(plain)) return { ok: false, reason: 'link', text: t };
    if (MAIL_RE.test(t) || HANDLE_RE.test(t) || APP_RE.test(t) || /(\d[\s.\-/()]*){7,}/.test(t)) return { ok: false, reason: 'contact', text: t };
    return { ok: true, reason: '', text: t };
  }
  var REASON = {
    empty: 'Bitte schreibe etwas.',
    long: 'Die Nachricht ist zu lang (höchstens 200 Zeichen).',
    bad: 'Bitte bleib freundlich – diese Wörter sind im Chat nicht erlaubt.',
    link: 'Links und Internetadressen sind im Chat nicht erlaubt.',
    contact: 'Aus Sicherheitsgründen keine Telefonnummern, E-Mail-Adressen oder Nutzernamen anderer Dienste teilen.'
  };
  var api = { check: check, mask: mask, tidy: tidy, REASON: REASON };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AnMaChaChatFilter = api;
})(typeof window !== 'undefined' ? window : this);
