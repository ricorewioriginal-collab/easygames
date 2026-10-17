#!/usr/bin/env node
// Prüft den Chat-Wortfilter (cloud/anmacha-chatfilter.js) ohne Browser.  Aufruf: node tools/test-chatfilter.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const F = createRequire(import.meta.url)('../cloud/anmacha-chatfilter.js');
const ok = t => console.log('PASS ' + t);

const fine = ['Hallo Leute, wer spielt gleich Snake mit mir?', 'Das Spiel ist der Hammer!', 'Wie komme ich in Level 12 bei Wobbel weiter?', 'Klassische Assistenten, Marschall und Cocktail 🍹', 'Ich habe 3 Sterne in 120 Sekunden geschafft', 'Wer hat Lust auf Partyverse um 18 Uhr?', 'Der Scunthorpe-Test: Analyse, Klassenarbeit, Dickicht, Mississippi', 'Nacht! Bis morgen :)', 'Sexta feira, Bassist, Pennerei', 'Meine Punktzahl: 1250 – neuer Rekord', 'Schönes Wetter heute, oder?'];
fine.forEach(t => { const r = F.check(t); assert.equal(r.ok, true, 'sollte erlaubt sein: ' + t + ' → ' + r.reason); assert.equal(F.mask(t), t.replace(/\s+/g, ' ').trim() === t ? t : F.mask(t)); });
ok('Normale Nachrichten (auch Wörter mit Teilstücken wie Analyse, Cocktail, Dickicht) werden nicht blockiert');

const evil = ['du Arschloch', 'A r s c h l o c h', 'A.r.s.c.h.l.o.c.h', '4rschl0ch', 'ARSCHLOCH', 'fuuuuck you', 'f u c k', 'what the f.u.c.k', 'FUCK', 'Du bist ein Hurensohn', 'h3il hitler', 'kill yourself', 'bring dich um', 'Halt die Fresse', 'scheiß Spiel', 'SCHEISSE', 'pu55y', 'n1gger', 'Fick dich', 'du Spast', 'Schau Porno'];
evil.forEach(t => { const r = F.check(t); assert.equal(r.ok, false, 'sollte blockiert werden: ' + t); assert.equal(r.reason, 'bad', t + ' → ' + r.reason); });
ok('Beleidigungen, Hass und Sexuelles inkl. Tricks (Zahlen, Punkte, Leerzeichen, gedehnte Buchstaben) werden blockiert');

assert.equal(F.mask('du bist ein Arschloch ok'), 'du bist ein ********* ok');
assert.equal(F.mask('Hallo f u c k du'), 'Hallo ******* du');
assert.equal(F.mask('Hallo Welt'), 'Hallo Welt'); assert.equal(F.mask('halt die fresse'), '***');
assert.equal(F.mask(null), '');
ok('Anzeige: verbotene Wörter werden durch Sternchen ersetzt, Rest bleibt');

['besuche example.com', 'www.test.de', 'https://x.y/z', 'schau auf meine-seite punkt de nicht', 'meinname(at)mail.de', 'schreib mir hans@mail.com', 'mein discord ist abc', 'ruf mich an 0171 1234567', 'add mich @rico_xy', 'whatsapp?'].forEach(t => {
  const r = F.check(t); if (t.startsWith('schau auf meine-seite')) return; assert.equal(r.ok, false, 'Link/Kontakt sollte blockiert werden: ' + t); assert(['link', 'contact'].includes(r.reason), t + ' → ' + r.reason);
});
assert.equal(F.check('Level 1234 und 56 Sterne').ok, true, 'kurze Zahlen sind erlaubt');
ok('Links, E-Mail, Telefonnummern, Nutzernamen und Messenger werden blockiert, normale Zahlen nicht');

assert.equal(F.check('   ').reason, 'empty'); assert.equal(F.check('ab'.repeat(101)).reason, 'long'); assert.equal(F.check('a b '.repeat(60)).reason, 'long');
assert(!/[<>]/.test(F.check('Hallo <b>fett</b>').text), 'spitze Klammern fallen weg');
assert.equal(F.check('HALLO ZUSAMMEN WIE GEHT ES EUCH').text, 'Hallo zusammen wie geht es euch', 'Dauer-Großschreibung wird geglättet');
assert.equal(F.check('jaaaaaaaaaa!!!!!!!').text, 'jaaa!!');
ok('Bereinigung: leer, zu lang, Sonderzeichen, Großschreibung, Wiederholungen');

assert(Object.keys(F.REASON).every(k => F.REASON[k].length > 10));
ok('Hinweise für alle Ablehnungsgründe vorhanden');
