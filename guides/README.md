# Spielanleitungen: Handbuch, Ratgeber, Lösungsbuch

Je Spiel eine Datei `guides/<spiel-id>.json`. Sie wird erst geladen, wenn jemand die Anleitung öffnet
(easygames-Seite, `anleitung.html?game=<id>`, Knopf „📖 Anleitung“ in Bibliothek, Hub und `easygames.js`).
Kurzfassung (Anleitung, Steuerung, Tipps) bleibt in `guides.js`.

```json
{
  "id": "spiel-id",
  "handbuch":  [ { "t": "Überschrift", "p": ["Absatz", "…"], "list": ["Punkt", "…"], "steps": ["Schritt 1", "…"] } ],
  "ratgeber":  [ … gleiche Abschnitte … ],
  "loesung":   [ … gleiche Abschnitte … ],
  "faq":       [ { "q": "Frage?", "a": "Antwort." } ]
}
```

- Abschnitt: `t` (Pflicht) und mindestens eins von `p` (Absätze), `list` (Aufzählung), `steps` (nummerierte Schritte).
- Nur reiner Text (kein HTML, kein Markdown), Deutsch, Du-Form, nur Inhalte, die das Spiel wirklich hat.
- **Handbuch** = vollständige Spielanleitung (Ziel, Start & Menü, Regeln/Ablauf, Modi, Bedienung, Wertung, Fortschritt & Speichern, Mehrspieler/Online).
- **Ratgeber** = Tipps und Strategien (Einsteiger, Fortgeschrittene, Profis, häufige Fehler).
- **Lösungsbuch** = Komplettlösung: Level/Kapitel/Rätsel, Freischaltungen, Erfolge, Geheimnisse – oder bei Spielen ohne feste Lösung die beste Strategie je Phase/Modus.
- Prüfen: `node tools/check-guides.js [spiel-id …]`
