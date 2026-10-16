# Überarbeitung: Orte mit spielbaren Aufgaben

Stand: 16. Oktober 2026. Arbeitsfassung zur Prüfung; keine abgeschlossene inhaltliche Gleichwertigkeit zu Teil 1.

Die Weltgeschichten bleiben bestehen. Jede Insel erhält zusätzlich eine Tätigkeit in der 3D-Welt, die zum Ort gehört. Die bisherigen kleinen Minispiele bleiben als weitere Angebote erhalten.

| Ort | Neue Tätigkeit |
|---|---|
| Sonnenhafen | Drei Beete säen, gießen und ernten; Gemüse in der Hofküche verarbeiten |
| Stadtinsel | In Bertas Backstube Apfelkuchen zubereiten; Cafétisch als sichtbares Ergebnis |
| Fellretter-Bucht | Pfotensteine auf dem Welpen-Trainingsplatz balancieren |
| Drachenhöhen | Kristallstufen mit echten Sprüngen erklimmen |
| Dampfer-Hafen | Hafenruf hören und auf vier Instrumenten im Hafen nachspielen |
| Regenbogenwelt | Gemeinschaftsgarten mit Blumen als Freundschaftsgeschenke |
| Freizeitpark | Mit der Figur in Riesenrad, Karussell und Achterbahn fahren; Fruchteis selbst zubereiten |
| Fußball-Arena | Den Ball auf dem bestehenden Rasen schießen; Tore an den echten Toren zählen |
| Märchenland | Blüten für die Märchenbienen ziehen und Honig gewinnen |
| Schlüsselreich | Glockengarten mit Hörfolge und sichtbaren Lichtern |
| Wunsch-Insel | Treibholzpfad mit Balancieraufgabe |
| Schwammi-Bucht | Gemüseburger selbst zubereiten |
| Atlantis | Klangarchiv mit vier Archivkristallen |
| Funkwelle | Erkennungssignal im offenen Musikstudio nachspielen; frei musizieren |
| Lunaris | Apfel-Honig-Kuchen in der Backstube Wanderhand |
| Taschi-Land | Leckerli selbst ziehen und für Taschi-Freundschaften verwenden |
| Hüpfland | Pilzpfad mit echten Sprüngen |
| Bauland | Eigene Bauwerke aus bis zu 256 farbigen Klötzen bauen, betreten, abtragen und speichern |
| Rätsel-Insel | Steinpfad der Uralten balancieren |
| Prisma-Insel | Datenfutter im Pixel-Gewächshaus erzeugen |

19 zusätzliche Bewohner erklären die Tätigkeiten. Die Orte werden als Kartenpunkte eingetragen; ihre kleinen Nebenaufgaben sind unabhängig von der Hauptgeschichte. Einmalige Aufgabenbelohnungen lassen sich nicht durch Wiederholen vervielfachen. Die Tätigkeiten selbst bleiben wiederholbar.

## Spielbarkeit

- Neue Spielstände beginnen wenige Schritte von Rosi entfernt. Der erste Hinweis ist eine Sprechblase und blockiert die Bewegung nicht.
- Fehlende Ortsverweise in den ursprünglichen Quests sind ergänzt. Bereits aufgesammelte oder erledigte Interaktionen werden nicht als nächstes Ziel bevorzugt.
- Während eines offenen Fensters läuft die Figur nicht weiter.
- Niedrige und mittlere Grafikprofile fallen nicht mehr unter die CSS-Auflösung; die Leistungswirkung auf echten Handys muss geprüft werden.
- Lasse nimmt die tatsächlich vorgesehenen Splitterzahlen entgegen. Alte Splitter bleiben dadurch nicht im Rucksack, um spätere Sammelziele vorzeitig zu erfüllen. Der letzte Prisma-Splitter muss vor dem Finale eingesammelt werden.
- Vorhandene gespeicherte Positionen bleiben erhalten. Bauwerke und Beete nutzen das bestehende versionierte Speicherformat.

## Prüfung

`node --experimental-transform-types tests/worlds.test.mjs` prüft alle 20 Weltaufbauten, freie und stabile Standorte, sämtliche ursprünglichen Quest-Zielorte, die Zuordnung einzelner Splitter, verbrauchte Fundstellen, Beete nach einem Inselwechsel, echte Tore, Baukollisionen und erhaltene Spielstände. Dieser Test nutzt echte Three.js-Geometrie und Physik; er bewertet keine Grafik.

`npm run typecheck && npm run build:offline && npm run deploy` baut die auslieferbare Fassung. `node e2e/renewal.mjs` prüft sie mit Chromium, einschließlich Küche, Bauen, Mitfahrt, Speichern und Touch-Viewport. Bilder landen in `/tmp/bi2-review`.

Die GitHub-Prüfung baut und testet den Arbeitsbranch. Nach erfolgreicher Prüfung synchronisiert sie die erzeugten Spieldateien auf diesem Branch. Sie veröffentlicht keine GitHub-Pages-Version.

## Weiterhin zu prüfen

Diese Fassung ergänzt wiederholbare Tätigkeiten und repariert grundlegende Abläufe. Sie ersetzt noch keinen vollständigen Vergleich jeder Einzelmechanik aus Teil 1: insbesondere Park-Tycoon, Wohnungsumbau, der Umfang der Taschis und die Märchenfiguren sind weiterhin nicht gleichwertig. Ein kompletter Story-Durchlauf bis Flick sowie Spieltests auf echten Handys bleiben erforderlich.
