# Spielregeln

Alle Regeln stehen in `src/core/city.ts` und sind ohne Grafik testbar (`tests/city.test.ts`). Zeiten in den Katalogen sind Sekunden im Modus „Nostalgisch".

## Karte und Gebiete
- 48 × 48 Felder in 6 × 6 Gebieten zu je 8 × 8 Feldern. Start: die vier mittleren Gebiete (2..3 / 2..3).
- Westküste: Wasser bei x < 4 (Buchten bis x = 4), Strand bei x < 7. Hafen braucht Wasser in der Nähe.
- Neues Gebiet kaufen (muss an ein eigenes grenzen): bei n eigenen Gebieten kostet es `round(800 · 1,32^(n−4) / 10) · 10` Münzen und braucht `25 · (n−3)` Einwohner.

## Bauen
- Gebäude brauchen freien, eigenen, trockenen Boden; Wohnhäuser, Läden, Gemeinschaftsgebäude und Produktion brauchen eine Straße direkt an Vorder- oder Rückseite, sonst zeigt das Gebäude „keine Straße".
- Bauzeit läuft in Echtzeit (auch offline). Größere Gebäude werden erst Baustelle und brauchen Material (Bretter, Ziegel, Stahl, Glas, Holz), das man herstellt oder am Markt kauft.
- Abriss erstattet 50 % der Kosten, Straße kostet 10 Münzen, Entfernen gibt 5 zurück (Rückgängig direkt nach dem Bau erstattet voll).
- Ausbau (bis Stufe 3) kostet `Kosten · 0,75 · Stufe` und bringt je Stufe +20 % Miete bzw. Umsatz.

## Einwohner, Miete, Zufriedenheit
- Einwohner = Summe der fertigen Wohnhäuser. Einwohnergrenze = Summe von Rathaus (60) und weiteren Gemeinschaftsgebäuden. Ein Haus über der Grenze kann gebaut, aber nicht bezogen werden.
- Miete wird nach der Mietzeit einmal fällig und muss abgeholt werden (kein Mehrfach-Kassieren).
- Zufriedenheit 0–100: `50 + 1,5 · Gemeinschaftswert + min(30, 0,5 · Deko) − Gedränge`. Mietfaktor `0,85 + 0,003 · Zufriedenheit` (0,85–1,15).
- Ausstrahlung: Deko, Parks und Bäume im Umkreis erhöhen Miete und Umsatz um 1,5 % je Punkt, höchstens +50 %.

## Bauernhof und Produktion
- Acker: säen (Saatkosten), wachsen lassen, ernten. Ertrag geht ins Lager. Kein zweites Ernten, kein Säen auf belegtem Acker.
- Produktionsgebäude verarbeiten Waren nach Rezept (z. B. Weizen → Mehl → Brot). Gestartet wird nur mit vorhandenen Zutaten und genug Lagerplatz für das Ergebnis.
- Lagergrenze: 50 + Lagergebäude. Volles Lager blockiert Ernte und Produktion mit Hinweis.

## Läden
- Ein Laden nimmt bestimmte Waren an (z. B. Bäckerei: Brot). Beliefern verbraucht Ware aus dem Lager, danach verkauft der Laden über die Verkaufszeit und wirft Umsatz ab. Manche Läden brauchen Mindest-Einwohner.

## Transport
- Bahnhof, Hafen und Flughafen nehmen Lieferaufträge an: Waren abgeben, nach der Lieferzeit gibt es Münzen und Erfahrung.

## Energie, Level, Modi
- Nostalgisch: Energie max. `min(40, 15 + ⌊Level/2⌋)`, +1 alle 180 s. Aktionen kosten 1 Energie (Deko 0). Levelaufstieg füllt Energie und gibt `50 · Level` Münzen.
- Entspannt: keine Energie, alle Zeiten × 0,5. Kreativ: alles kostenlos, Zeiten × 0,1, eigener Speicherplatz, keine Wertung.
- Erfahrung bis zum nächsten Level: `round(30 · Level^1,55) + 20`. Level schalten Gebäude, Pflanzen und Aufträge frei.

## Aufgaben
- 32 Hauptaufgaben bilden die Stadtgeschichte (jede schaltet die nächste frei), 52 Nebenaufgaben öffnen sich nach dem Tutorial (m08). Ziele: Ereignisse zählen (bauen, ernten, kassieren, liefern), Besitz, Einwohner, Level, Gebiete. Belohnung wird genau einmal ausgezahlt.
- Tagesziele (3 je Tag) und ein Wochenziel aus Vorlagen; 18 Erfolge.

## Nachbarn
- Nur mit Google-Anmeldung und nicht im Kreativ-Sandkasten. Tage zählen nach UTC.
- Beim Besuch kann man je Nachbar und Tag an 5 verschiedenen Häusern, Läden, Feldern oder Betrieben helfen (je +10 Münzen, +1 Erfahrung). Deko und Gemeinschaftsgebäude zählen nicht.
- Je Nachbar und Tag ein Geschenk: 2× Bretter, Ziegel, Glas, Stahl oder Holz. Kommt es an und das Lager ist voll, bleibt es in der Post.
- Wer besucht wurde, bekommt beim Annehmen je Hilfe +15 Münzen und +1 Erfahrung.

## Zeit und Schutz
- Die Uhr ist injiziert. Wird die Systemzeit zurückgestellt, merkt sich der Stand die höchste gesehene Zeit (`seen`); Timer laufen dann nicht rückwärts und es entsteht kein Doppel-Ertrag.
- Offline-Fortschritt: Wachstum, Bau und Mietzeit laufen weiter; abgeholt wird beim nächsten Spielen.
