/* Royal Radio Match 3D – Figuren (eigene SVG-Zeichnungen), Tutorial-Texte und Kurzhilfe. */
(function (root) {
  'use strict';
  var RRM = root.RRM || (root.RRM = {});

  // RAY: kleiner Retro-Radio-Roboter. MIRA MIX: DJ mit Kopfhörern. Beide komplett selbst gezeichnet.
  var RAY = '<svg viewBox="0 0 120 140" class="char" aria-label="RAY"><line x1="60" y1="8" x2="74" y2="30" stroke="#d6dde6" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="8" r="6" fill="#ff4a4a"/>' +
    '<rect x="14" y="28" width="92" height="74" rx="18" fill="#ffb347" stroke="#7a4a14" stroke-width="4"/><rect x="24" y="38" width="72" height="30" rx="10" fill="#fff6e0"/>' +
    '<circle cx="45" cy="53" r="8" fill="#1d2433"/><circle cx="75" cy="53" r="8" fill="#1d2433"/><circle cx="48" cy="50" r="3" fill="#fff"/><circle cx="78" cy="50" r="3" fill="#fff"/>' +
    '<path d="M48 62q12 8 24 0" stroke="#1d2433" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="38" cy="84" r="11" fill="#7a4a14"/><circle cx="38" cy="84" r="6" fill="#ffd36b"/>' +
    '<rect x="58" y="78" width="38" height="5" rx="2" fill="#7a4a14"/><rect x="58" y="88" width="30" height="5" rx="2" fill="#7a4a14"/>' +
    '<rect x="30" y="102" width="14" height="22" rx="5" fill="#5b6470"/><rect x="76" y="102" width="14" height="22" rx="5" fill="#5b6470"/><rect x="24" y="120" width="26" height="10" rx="5" fill="#3a4250"/><rect x="70" y="120" width="26" height="10" rx="5" fill="#3a4250"/></svg>';
  var MIRA = '<svg viewBox="0 0 120 140" class="char" aria-label="Mira Mix"><path d="M22 70q-6-50 38-54q44 4 38 54q-4 18-10 26h-56q-6-8-10-26z" fill="#6b2fbf"/>' +
    '<circle cx="60" cy="62" r="30" fill="#ffd2b0"/><path d="M30 56q4-28 30-28q28 0 30 28q-14-12-30-12q-18 0-30 12z" fill="#8a3ffc"/>' +
    '<circle cx="49" cy="64" r="4.5" fill="#1d2433"/><circle cx="71" cy="64" r="4.5" fill="#1d2433"/><circle cx="50.5" cy="62.5" r="1.6" fill="#fff"/><circle cx="72.5" cy="62.5" r="1.6" fill="#fff"/>' +
    '<path d="M51 76q9 7 18 0" stroke="#b5485a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="42" cy="74" r="4" fill="#ff9ab0" opacity=".6"/><circle cx="78" cy="74" r="4" fill="#ff9ab0" opacity=".6"/>' +
    '<path d="M26 62q0-36 34-36t34 36" stroke="#22d6c8" stroke-width="6" fill="none"/><rect x="18" y="56" width="16" height="24" rx="7" fill="#22d6c8" stroke="#0e6d66" stroke-width="3"/><rect x="86" y="56" width="16" height="24" rx="7" fill="#22d6c8" stroke="#0e6d66" stroke-width="3"/>' +
    '<path d="M34 96h52l10 36h-72z" fill="#ff3fae"/><path d="M50 96l10 14 10-14" fill="#fff"/><circle cx="60" cy="118" r="5" fill="#ffd36b"/></svg>';

  // Tutorials: 1–3 kurze Schritte je neuer Mechanik (Schlüssel = level.tut)
  var TUT = {
    swap: ['Tausche zwei benachbarte Bauteile – tippe oder wische.', 'Drei gleiche in einer Reihe oder Spalte verschwinden.', 'Erfülle die Ziele oben, bevor die Züge ausgehen!'],
    rocket: ['Vier in einer Reihe ergeben eine Wellenrakete.', 'Löse sie aus, und sie räumt eine komplette Reihe oder Spalte.'],
    crate: ['Transportkisten gehen kaputt, wenn du direkt daneben matchst.', 'Spezialteile treffen Kisten auch aus der Ferne.'],
    drone: ['Ein 2×2-Quadrat baut eine Funkdrohne.', 'Sie fliegt selbstständig zu einem wichtigen Ziel.'],
    bomb: ['L- oder T-Form? Daraus wird eine Bassbombe.', 'Sie trifft alles rundherum.'],
    orb: ['Fünf in einer Linie ergeben eine Frequenzkugel.', 'Tausche sie mit einem Bauteil: alle Teile dieser Sorte verschwinden.'],
    noise: ['Rauschfelder liegen unter den Bauteilen.', 'Löse Bauteile auf dem Feld auf, um es zu entstören.'],
    crate2: ['Manche Kisten haben mehrere Lagen.', 'Jeder Treffer entfernt eine Lage.'],
    specials: ['Hier zählt jedes gebaute Spezialteil.', 'Raketen, Bomben, Drohnen und Kugeln – bau so viele wie möglich!'],
    remix: ['Sechs in einer Reihe oder ein großes Kreuz: der Remix-Orb!', 'Er räumt eine breite Reihe und Spalte gleichzeitig.', 'Tipp: Tausche zwei Spezialteile miteinander für starke Kombos.'],
    dusty: ['Verstaubte Platten brauchen mehrere Treffer.', 'Matche daneben oder nutze Spezialteile.'],
    glass: ['Glasvitrinen brechen nach Treffern.', 'Darin liegt ein Plattenpaket.'],
    parcel: ['Plattenpakete müssen ganz nach unten.', 'Die grünen Pfeile zeigen den Ausgang.'],
    combo: ['Kettenreaktionen zählen als Combo.', 'Je mehr nachrutscht und matcht, desto höher die Combo.'],
    moss: ['Frequenzmoos wächst, wenn du in einem Zug keins entfernst.', 'Bleib dran und räume es zügig weg!'],
    score: ['Diesmal zählen nur Punkte.', 'Spezialteile und Kombos bringen am meisten.'],
    cable: ['Kabelsalat hält ein Bauteil fest.', 'Es kann trotzdem mitmatchen – dabei reißt eine Kabellage.'],
    switch: ['Ketten-Schalter löst du nur in der Reihenfolge 1, 2, 3 …', 'Sind alle aktiv, öffnen sich die Sendesperren.'],
    amp: ['Röhrenverstärker laden sich mit Treffern auf.', 'Voll geladen zünden sie eine Bassexplosion.'],
    generator: ['Generatoren laden nur mit Matches ihrer Farbe daneben.', 'Spezialteile laden sie ebenfalls.'],
    barrier: ['Sendesperren sind unzerstörbar.', 'Sie verschwinden erst, wenn alle Schalter oder Generatoren aktiv sind.'],
    holes: ['Funklöcher sind keine Felder.', 'Bauteile fallen einfach darüber hinweg.'],
    portal: ['Lila Ringe sind Signal-Portale.', 'Was unten hineinfällt, kommt oben am Ausgang heraus.'],
    antenna: ['Repariere Empfangsantennen mit Treffern.', 'Fertig repariert senden sie einen Strahl durch ihre Reihe.'],
    cassette: ['Oben sitzt ein Kassettenspender.', 'Bring jede Kassette ganz nach unten zum Ausgang.'],
    shield: ['Schutzschilde brechen nur durch Matches ihrer Farbe daneben.', 'Oder durch Spezialteile.'],
    jammer: ['Der Störsender verteilt alle paar Züge Rauschen.', 'Die Zahl zeigt, wann er wieder sendet. Zerstöre ihn schnell!'],
    ice: ['Frequenzeis friert ein Bauteil ein.', 'Matches direkt daneben oder Spezialteile tauen es auf.'],
    rolling: ['Rollende Platten wandern nach jedem Zug ein Feld weiter.', 'Erwische sie mit Treffern, bevor sie im Weg sind.']
  };

  var COMBOS = [
    ['Rakete + Rakete', 'Kreuz: Reihe und Spalte'],
    ['Rakete + Bassbombe', 'drei Reihen und drei Spalten'],
    ['Bassbombe + Bassbombe', 'riesige 7×7-Explosion'],
    ['Drohne + Rakete', 'Drohne fliegt hin und zündet dort eine Rakete'],
    ['Drohne + Bassbombe', 'Drohne trägt die Bombe zum Ziel'],
    ['Drohne + Drohne', 'drei Drohnen gleichzeitig'],
    ['Kugel + Rakete', 'alle Teile einer Farbe werden zu Raketen'],
    ['Kugel + Bassbombe', 'alle Teile einer Farbe werden zu Bomben'],
    ['Kugel + Drohne', 'alle Teile einer Farbe werden zu Drohnen'],
    ['Kugel + Kugel', 'das ganze Brett wird geräumt'],
    ['Remix-Orb + Rakete/Bombe/Drohne', 'Mega-Explosion mit breitem Kreuz'],
    ['Remix-Orb + Kugel oder Remix-Orb', 'das ganze Brett wird geräumt']
  ];

  RRM.Texts = { RAY: RAY, MIRA: MIRA, TUT: TUT, COMBOS: COMBOS };
})(typeof window !== 'undefined' ? window : globalThis);
