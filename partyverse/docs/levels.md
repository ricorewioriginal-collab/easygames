# Brett-Layouts

> Diese Datei wird von `tools/gen-levels-doc.mjs` erzeugt (`npx tsx tools/gen-levels-doc.mjs`). Nicht von Hand ändern.

Das Spiel enthält **50 Brett-Layouts** (5 Welten × 10). Sie entstehen beim Import deterministisch aus Bauplänen (`shared/src/levels/builders/`) und Seeds, jedes Layout besteht `validateLayout` und hat eine eigene `layoutSignature`.

Vorschau als SVG-Draufsicht: `npx tsx tools/layout-preview.mjs <layout-id> [out.svg]`.

## Übersicht

Spalten: **Felder** = Anzahl Felder; **Schw.** = Schwierigkeit 1–3; **Runden** = empfohlene Rundenzahl; **P / L / M / C / F** = Portal-Paare / Läden / Mautbrücken (Dornentore) / Chaos-Felder / faltbare Wege (Faltungsphasen).

| Welt | ID | Name | Bauplan | Felder | Schw. | Runden | P | L | M | C | F | Besonderheiten |
| --- | --- | --- | --- | ---: | :---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| PRISMARA | `prismara-01` | Prismen-Archipel | `archipelago` | 26 | 1 | 10 | 1 | 2 | 0 | 0 | – | Kristallinseln, Schwebende Inseln, Portale, Lichtbrücken, Regenbogenwege |
| PRISMARA | `prismara-02` | Regenbogen-Reigen | `ring` | 34 | 1 | 12 | 2 | 3 | 0 | 0 | – | Regenbogenring, Kristallsplitter, Portale, Viele Läden, Abkürzungen, Regenbogenwege, Lichtbrücken |
| PRISMARA | `prismara-03` | Kristall-Blüte | `star-hub` | 40 | 2 | 14 | 2 | 3 | 0 | 1 | – | Nabe mit Blättern, Rundläufe um den Start, Portale, Chaos-Felder, Viele Läden, Lichtbrücken, Regenbogenwege |
| PRISMARA | `prismara-04` | Lichtband | `ribbon` | 28 | 2 | 13 | 2 | 3 | 1 | 0 | – | Möbius-Band, Spurwechsel, Portale, Mautbrücken, Viele Läden, Abkürzungen, Lichtbrücken, Regenbogenwege |
| PRISMARA | `prismara-05` | Zwillingsspiegel | `twin-loops` | 33 | 2 | 14 | 3 | 3 | 1 | 0 | – | Zwei Inseln, Spiegelringe, Portale, Mautbrücken, Viele Läden, Lichtbrücken, Regenbogenwege |
| PRISMARA | `prismara-06` | Schimmerspirale | `spiral` | 30 | 1 | 13 | 2 | 3 | 0 | 0 | – | Kristallgipfel, Hohe Rückbrücke, Portale, Viele Läden, Abkürzungen, Lichtbrücken, Regenbogenwege |
| PRISMARA | `prismara-07` | Prisma-Kreuzung | `cross-bridges` | 42 | 3 | 16 | 3 | 4 | 1 | 1 | – | Kreuzende Brücken, Höhenebenen, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Lichtbrücken, Regenbogenwege |
| PRISMARA | `prismara-08` | Kaleidoskop-Knoten | `trefoil-knot` | 42 | 3 | 17 | 3 | 4 | 2 | 0 | – | Kleeblattknoten, Überkreuzungen, Portale, Mautbrücken, Viele Läden, Abkürzungen, Lichtbrücken, Regenbogenwege |
| PRISMARA | `prismara-09` | Zinnen des Lichts | `comb` | 48 | 2 | 15 | 2 | 4 | 0 | 0 | – | Zinnen-Umwege, Burg aus Licht, Portale, Viele Läden, Abkürzungen, Lichtbrücken, Regenbogenwege |
| PRISMARA | `prismara-10` | Kristallpyramide | `terraces` | 48 | 3 | 18 | 4 | 5 | 2 | 1 | – | Stufenpyramide, Viele Portale, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Abkürzungen, Regenbogenwege, Lichtbrücken |
| NOVA NEXUS | `nova-nexus-01` | Erste Umlaufbahn | `orbits` | 26 | 1 | 10 | 1 | 2 | 0 | 1 | – | Planetensystem, Schwerkraft-Wechsel (Darstellung), Portale, Chaos-Felder, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-02` | Doppelstern-Pfad | `twin-loops` | 30 | 1 | 11 | 1 | 2 | 0 | 2 | – | Zwei Sterne, Schwerkraft-Wechsel (Darstellung), Portale, Chaos-Felder, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-03` | Asteroidengürtel | `ring` | 38 | 2 | 13 | 2 | 3 | 0 | 3 | – | Asteroidenplatten, Schwerkraft-Wechsel (Darstellung), Portale, Chaos-Felder, Viele Läden, Abkürzungen, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-04` | Planetenkette | `chain-loops` | 36 | 2 | 14 | 2 | 3 | 1 | 2 | – | Drei Planeten, Kreuzungsfelder, Schwerkraft-Wechsel (Darstellung), Portale, Mautbrücken, Chaos-Felder, Viele Läden, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-05` | Raumportal-Archipel | `archipelago` | 32 | 3 | 16 | 3 | 4 | 1 | 2 | – | Zentralplattform, Raumstationen, Schwerkraft-Wechsel (Darstellung), Portale, Mautbrücken, Chaos-Felder, Viele Läden, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-06` | Orbitalaufzug | `tower-spiral` | 40 | 2 | 15 | 2 | 4 | 0 | 2 | – | Weltraumlift, Schwerkraft-Wechsel (Darstellung), Portale, Chaos-Felder, Viele Läden, Abkürzungen, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-07` | Kometenbahn | `spiral` | 42 | 3 | 16 | 2 | 3 | 2 | 3 | – | Kometenschweif, Mautbrücken, Schwerkraft-Wechsel (Darstellung), Portale, Chaos-Felder, Viele Läden, Abkürzungen, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-08` | Mondleiter | `ladder` | 24 | 1 | 10 | 1 | 2 | 0 | 1 | – | Mondpfade, Schwerkraft-Wechsel (Darstellung), Portale, Chaos-Felder, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-09` | Gravitationsbrücken | `cross-bridges` | 40 | 2 | 14 | 2 | 4 | 0 | 2 | – | Kreuzende Strahlen, Schwerkraft-Wechsel (Darstellung), Portale, Chaos-Felder, Viele Läden, Strahlenwege, Rotierende Inseln |
| NOVA NEXUS | `nova-nexus-10` | Nexus-Zentrum | `star-hub` | 49 | 3 | 19 | 4 | 6 | 2 | 4 | – | Nexus-Nabe, Sechs Arme, Schwerkraft-Wechsel (Darstellung), Portale, Mautbrücken, Chaos-Felder, Viele Läden, Abkürzungen, Strahlenwege, Rotierende Inseln |
| WURZELWILD | `wurzelwild-01` | Moosweg | `ring` | 28 | 1 | 10 | 0 | 3 | 1 | 0 | – | Moosiger Rundweg, Viele Items, Dornentore, Viele Läden, Rankenbrücken |
| WURZELWILD | `wurzelwild-02` | Pilzkreis-Archipel | `archipelago` | 28 | 1 | 12 | 0 | 3 | 1 | 0 | – | Pilzlichtungen, Viele Läden, Dornentore, Rankenbrücken |
| WURZELWILD | `wurzelwild-03` | Wurzelgeflecht | `lattice` | 30 | 2 | 13 | 0 | 3 | 1 | 0 | 4 (2 Ph.) | Wachsende Wurzeln, Viele Kreuzungen, Dornentore, Viele Läden, Raumfaltung, Rankenbrücken |
| WURZELWILD | `wurzelwild-04` | Der große Stamm | `tower-spiral` | 40 | 2 | 15 | 0 | 4 | 2 | 0 | 3 (2 Ph.) | Baumkrone, Wachsende Äste, Dornentore, Viele Läden, Raumfaltung, Rankenbrücken |
| WURZELWILD | `wurzelwild-05` | Rankenzickzack | `zigzag` | 32 | 2 | 14 | 0 | 4 | 1 | 0 | 3 (2 Ph.) | Serpentinen, Farnwald, Dornentore, Viele Läden, Raumfaltung, Rankenbrücken |
| WURZELWILD | `wurzelwild-06` | Blattkamm | `comb` | 34 | 1 | 13 | 0 | 4 | 1 | 0 | – | Blattzinken, Viele Items, Dornentore, Viele Läden, Rankenbrücken |
| WURZELWILD | `wurzelwild-07` | Dornenspirale | `spiral` | 49 | 3 | 16 | 0 | 4 | 3 | 0 | 4 (2 Ph.) | Herzbaum, Drei Dornentore, Dornentore, Viele Läden, Raumfaltung, Rankenbrücken |
| WURZELWILD | `wurzelwild-08` | Lianenband | `ribbon` | 30 | 3 | 15 | 0 | 4 | 2 | 0 | 5 (3 Ph.) | Möbius-Liane, Dreiphasiges Wachstum, Dornentore, Viele Läden, Dreifach-Faltung, Rankenbrücken |
| WURZELWILD | `wurzelwild-09` | Hexenhain | `braid` | 35 | 2 | 16 | 0 | 4 | 2 | 0 | 3 (2 Ph.) | Wegteilungen, Hexenhain, Dornentore, Viele Läden, Raumfaltung, Rankenbrücken |
| WURZELWILD | `wurzelwild-10` | Urwald-Kleeblatt | `chain-loops` | 51 | 3 | 19 | 0 | 6 | 3 | 0 | 6 (3 Ph.) | Drei Lichtungen, Dreiphasiges Wachstum, Dornentore, Viele Läden, Dreifach-Faltung, Rankenbrücken |
| PARADOX CITY | `paradox-city-01` | Treppenhaus ohne Ende | `terraces` | 32 | 1 | 12 | 1 | 3 | 0 | 0 | 6 (2 Ph.) | Endlose Treppen, Verschobene Brücken, Portale, Viele Läden, Raumfaltung, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-02` | Flurschleife | `ladder` | 26 | 1 | 12 | 1 | 3 | 0 | 0 | 6 (2 Ph.) | Parallele Flure, Raumfaltung, Portale, Viele Läden, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-03` | Möbius-Boulevard | `ribbon` | 30 | 2 | 14 | 2 | 3 | 0 | 1 | 8 (3 Ph.) | Verdrehte Straße, Dreifach-Faltung, Portale, Chaos-Felder, Viele Läden, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-04` | Wendelwahn | `tower-spiral` | 37 | 2 | 14 | 2 | 3 | 0 | 0 | 7 (2 Ph.) | Wendeltreppe, Querfaltungen, Portale, Viele Läden, Raumfaltung, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-05` | Stadtraster Null | `lattice` | 36 | 3 | 16 | 2 | 3 | 1 | 2 | 10 (3 Ph.) | Einbahn-Raster, Dreifach-Faltung, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-06` | Überführungs-Irrsinn | `cross-bridges` | 49 | 2 | 15 | 2 | 4 | 0 | 0 | 8 (2 Ph.) | Gestapelte Brücken, Verschobene Auffahrten, Portale, Viele Läden, Raumfaltung, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-07` | Zickzack-Paradox | `zigzag` | 48 | 3 | 18 | 3 | 5 | 2 | 2 | 12 (3 Ph.) | Gefaltete Serpentine, Zwölf Faltungen, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Dreifach-Faltung, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-08` | Kleeblatt-Knoten | `trefoil-knot` | 44 | 3 | 17 | 3 | 4 | 2 | 1 | 12 (3 Ph.) | Knotenstraße, Etagenwechsel, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Dreifach-Faltung, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-09` | Uhrwerk-Bahnen | `orbits` | 48 | 2 | 16 | 2 | 5 | 0 | 1 | 10 (2 Ph.) | Zahnradplattformen, Zeitversatz, Portale, Chaos-Felder, Viele Läden, Raumfaltung, Treppen, Rotierende Inseln |
| PARADOX CITY | `paradox-city-10` | Das unmögliche Haus | `braid` | 39 | 3 | 19 | 3 | 4 | 2 | 2 | 14 (3 Ph.) | Raumrauten, Verschobene Brücken, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Dreifach-Faltung, Treppen, Rotierende Inseln |
| INFINITY CARNIVAL | `infinity-carnival-01` | Zirkuszelt-Zickzack | `zigzag` | 28 | 1 | 11 | 1 | 3 | 1 | 1 | – | Zeltkehren, Alle Mechaniken, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Schienen |
| INFINITY CARNIVAL | `infinity-carnival-02` | Karussell-Blüte | `star-hub` | 29 | 1 | 12 | 1 | 3 | 0 | 1 | – | Karussellarme, Rundläufe um den Start, Portale, Chaos-Felder, Viele Läden, Schienen, Rotierende Inseln |
| INFINITY CARNIVAL | `infinity-carnival-03` | Doppelrad | `twin-loops` | 30 | 2 | 14 | 2 | 3 | 1 | 2 | 3 (2 Ph.) | Zwei Riesenräder, Gondelwege, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Raumfaltung, Schienen, Strahlenwege, Rotierende Inseln |
| INFINITY CARNIVAL | `infinity-carnival-04` | Jahrmarkt-Kamm | `comb` | 36 | 1 | 14 | 1 | 4 | 0 | 1 | – | Budenreihe, Kurzer Rundkurs, Portale, Chaos-Felder, Viele Läden, Abkürzungen, Schienen |
| INFINITY CARNIVAL | `infinity-carnival-05` | Achterbahn-Leiter | `ladder` | 30 | 2 | 14 | 2 | 3 | 1 | 2 | 2 (2 Ph.) | Wellenbahn, Weichen, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Raumfaltung, Schienen, Strahlenwege, Rotierende Inseln |
| INFINITY CARNIVAL | `infinity-carnival-06` | Spiegelkabinett-Stadt | `lattice` | 30 | 2 | 15 | 2 | 4 | 1 | 2 | 4 (2 Ph.) | Spiegelgassen, Dynamische Pfade, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Raumfaltung, Schienen, Strahlenwege |
| INFINITY CARNIVAL | `infinity-carnival-07` | Feuerwerks-Flechte | `braid` | 44 | 3 | 18 | 3 | 6 | 2 | 3 | 8 (3 Ph.) | Finale-Brett, Feuerwerksbahn, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Dreifach-Faltung, Abkürzungen, Schienen, Strahlenwege, Rotierende Inseln |
| INFINITY CARNIVAL | `infinity-carnival-08` | Kosmischer Knoten | `trefoil-knot` | 52 | 3 | 19 | 4 | 6 | 2 | 3 | 9 (3 Ph.) | Finale-Brett, Dreiebenen-Knoten, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Dreifach-Faltung, Abkürzungen, Schienen, Strahlenwege, Rotierende Inseln |
| INFINITY CARNIVAL | `infinity-carnival-09` | Sternen-Karussell | `orbits` | 54 | 3 | 20 | 4 | 6 | 2 | 3 | 8 (2 Ph.) | Finale-Brett, Drehende Karussells, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Raumfaltung, Schienen, Strahlenwege, Rotierende Inseln |
| INFINITY CARNIVAL | `infinity-carnival-10` | Das große Finale | `chain-loops` | 52 | 3 | 20 | 4 | 7 | 3 | 4 | 12 (3 Ph.) | Finale-Brett, Fünf Kettenringe, Portale, Mautbrücken, Chaos-Felder, Viele Läden, Dreifach-Faltung, Abkürzungen, Schienen, Strahlenwege, Rotierende Inseln |

## Welten

### PRISMARA

Schwebende Kristallinseln, Lichtbrücken und Regenbogenwege; viele Portale.

- **1. Prismen-Archipel** (`prismara-01`, archipelago, 26 Felder, Schwierigkeit 1): Vier kleine Kristallinseln schweben im Kreis und sind durch kurze Lichtbrücken verbunden. Ein einzelnes Portal-Paar spannt eine Abkürzung quer über das Archipel.
- **2. Regenbogen-Reigen** (`prismara-02`, ring, 34 Felder, Schwierigkeit 1): Ein großer Regenbogenring um sieben Kristallsplitter, mit drei Lichtpfaden als Umwegen durch das Innere. Einfache Routenwahl, dafür gleich zwei Portal-Paare.
- **3. Kristall-Blüte** (`prismara-03`, star-hub, 40 Felder, Schwierigkeit 2): Aus einer zentralen Prismen-Nabe wachsen fünf Kristallblätter, jedes eine Schleife aus Licht und Regenbogen. Wer das Blatt wechselt, kommt immer wieder an der Mitte vorbei.
- **4. Lichtband** (`prismara-04`, ribbon, 28 Felder, Schwierigkeit 2): Ein verdrehtes Doppelband aus Kristall, das sich wie eine Möbiusschleife windet. Mit Spurwechseln und Regenbogen-Abkürzungen wechselt man zwischen Innen- und Außenspur.
- **5. Zwillingsspiegel** (`prismara-05`, twin-loops, 33 Felder, Schwierigkeit 2): Zwei spiegelbildliche Kristallringe auf verschiedener Höhe, verbunden durch eine kurze und eine längere Lichtbrücke. Drei Portal-Paare springen zwischen den Spiegelwelten.
- **6. Schimmerspirale** (`prismara-06`, spiral, 30 Felder, Schwierigkeit 1): Ein Lichtweg windet sich nach innen auf den Kristallgipfel; zurück zum Anfang führt eine hohe Regenbogenbrücke über alle Windungen. Zwei Abkürzungen sparen Schritte.
- **7. Prisma-Kreuzung** (`prismara-07`, cross-bridges, 42 Felder, Schwierigkeit 3): Ein Kristallring, über dem sich drei Regenbogenbrücken in verschiedenen Höhen mitten im Raum kreuzen. Drei Portal-Paare und eine Mautbrücke machen die Wahl der Route schwierig.
- **8. Kaleidoskop-Knoten** (`prismara-08`, trefoil-knot, 42 Felder, Schwierigkeit 3): Ein einziger Lichtweg, zum Kleeblattknoten verschlungen, dessen Stränge sich auf drei Ebenen überkreuzen. Rampen, Regenbogen-Abkürzungen und drei Portal-Paare brechen die Schleife auf.
- **9. Zinnen des Lichts** (`prismara-09`, comb, 48 Felder, Schwierigkeit 2): Eine Kristallburg aus Hinreihe und Rückreihe mit Zinnen-Umwegen nach oben und unten. Jede Zinne ist eine Lichtbrücken-Schleife; zwei Portal-Paare verbinden ferne Zinnen.
- **10. Kristallpyramide** (`prismara-10`, terraces, 48 Felder, Schwierigkeit 3): Eine Stufenpyramide aus drei Lichtterrassen, durch Treppen aus Licht verbunden. Vier Portal-Paare sind das Finale: Wer sie klug nutzt, überholt jeden Gegner.

### NOVA NEXUS

Kosmische Plattformen und Planetensysteme (rotierende Inseln), Raumportale, Strahlenwege, Chaos-Felder; die Schwerkraft-Wechsel sind reine Darstellung.

- **1. Erste Umlaufbahn** (`nova-nexus-01`, orbits, 26 Felder, Schwierigkeit 1): Zwei Umlaufbahnen kreisen gegenläufig umeinander und sind durch Strahlenbrücken verbunden. Ein ruhiger Einstieg in die kosmische Welt mit einem einzigen Raumportal.
- **2. Doppelstern-Pfad** (`nova-nexus-02`, twin-loops, 30 Felder, Schwierigkeit 1): Zwei Sterne, zwei Rundkurse: Zwei lange Strahlenbrücken führen hin und zurück. Auf jedem Stern lauern Chaos-Felder, die die Plätze vertauschen.
- **3. Asteroidengürtel** (`nova-nexus-03`, ring, 38 Felder, Schwierigkeit 2): Ein Ring aus treibenden Asteroidenplatten mit vier Strahlen-Umwegen durch das Innere. Drei Chaos-Felder wirbeln die Rangfolge durcheinander.
- **4. Planetenkette** (`nova-nexus-04`, chain-loops, 36 Felder, Schwierigkeit 2): Drei Planetenbahnen berühren sich wie Kettenglieder an zwei Kreuzungsfeldern. Jede Bahn liegt auf anderer Höhe, die mittlere kreist gegenläufig.
- **5. Raumportal-Archipel** (`nova-nexus-05`, archipelago, 32 Felder, Schwierigkeit 3): Fünf Raumstationen im Kreis um eine Zentralplattform, verbunden durch Strahlenbrücken und vier Stege zur Mitte. Drei Portal-Paare machen die Lage unberechenbar.
- **6. Orbitalaufzug** (`nova-nexus-06`, tower-spiral, 40 Felder, Schwierigkeit 2): Eine Wendeltreppe schraubt sich zur Raumstation empor, außen gleitet ein Strahlenpfad wieder hinab. Oben ändert sich die Schwerkraft, am Fuß lauert ein Chaos-Feld.
- **7. Kometenbahn** (`nova-nexus-07`, spiral, 42 Felder, Schwierigkeit 3): Ein Komet zieht seinen Weg als Spirale nach innen zum Kern; die hohe Rückbrücke bringt alle wieder an den Rand. Chaos-Felder und Mautbrücken sorgen für Spannung.
- **8. Mondleiter** (`nova-nexus-08`, ladder, 24 Felder, Schwierigkeit 1): Zwei lange Mondpfade mit Strahlen-Sprossen dazwischen: oben hin, unten zurück. Übersichtlich und kurz, ideal für schnelle Runden.
- **9. Gravitationsbrücken** (`nova-nexus-09`, cross-bridges, 40 Felder, Schwierigkeit 2): Ein Plattformring, über dessen Zentrum sich zwei Strahlenbrücken auf verschiedenen Höhen kreuzen. Die Schwerkraft kippt auf den Brücken – zum Glück nur zur Optik.
- **10. Nexus-Zentrum** (`nova-nexus-10`, star-hub, 49 Felder, Schwierigkeit 3): Sechs Strahlenschleifen strahlen von der Nexus-Nabe aus, jede auf eigener Höhe. Wer am Start vorbeikommt, wählt neu – mit Portalen und Chaos-Feldern als Finale.

### WURZELWILD

Naturwelt mit Rankenbrücken, wachsenden Wegen (Faltung), Dornentoren (gates) und vielen Läden und Item-Feldern.

- **1. Moosweg** (`wurzelwild-01`, ring, 28 Felder, Schwierigkeit 1): Ein gemütlicher Rundweg über moosige Wurzeln mit zwei Ranken-Umwegen durch das Unterholz. Ein erstes Dornentor lehrt die Maut des Waldes.
- **2. Pilzkreis-Archipel** (`wurzelwild-02`, archipelago, 28 Felder, Schwierigkeit 1): Fünf Lichtungen mit Pilzringen, durch Rankenbrücken im Kreis verbunden. Läden und Fundstücke liegen dicht beieinander, ein Dornentor bewacht die Waldmitte.
- **3. Wurzelgeflecht** (`wurzelwild-03`, lattice, 30 Felder, Schwierigkeit 2): Ein dichtes Geflecht aus Einbahn-Wurzeln mit vielen Kreuzungen auf einem kleinen Hügel. Vier Wurzelbrücken wachsen und schrumpfen im Takt der Runden.
- **4. Der große Stamm** (`wurzelwild-04`, tower-spiral, 40 Felder, Schwierigkeit 2): Eine Rankentreppe windet sich um einen riesigen Stamm bis in die Krone; außen rankt ein Abstieg zurück. Drei wachsende Äste öffnen zeitweise Abkürzungen.
- **5. Rankenzickzack** (`wurzelwild-05`, zigzag, 32 Felder, Schwierigkeit 2): Der Pfad schlängelt sich in Serpentinen durch den Farnwald; ein Randweg führt zurück. Querranken wachsen nur in manchen Runden und öffnen Abkürzungen.
- **6. Blattkamm** (`wurzelwild-06`, comb, 34 Felder, Schwierigkeit 1): Ein Blattkamm mit Zinken nach oben und unten: Jeder Zinken ist ein Ranken-Umweg mit Fundstücken. Kurz, übersichtlich und läden-reich.
- **7. Dornenspirale** (`wurzelwild-07`, spiral, 49 Felder, Schwierigkeit 3): Eine Dornenranke windet sich nach innen zum Herzbaum, gesichert durch drei Dornentore. Wachsende Ranken zeigen sich nur zeitweise als Abkürzung.
- **8. Lianenband** (`wurzelwild-08`, ribbon, 30 Felder, Schwierigkeit 3): Ein verdrehtes Lianenband mit zwei Spuren; die Ranken wachsen in drei Phasen und öffnen wechselnde Querwege. Dornentore sperren die Innenspur.
- **9. Hexenhain** (`wurzelwild-09`, braid, 35 Felder, Schwierigkeit 2): Im Hexenhain teilt sich der Weg immer wieder in zwei Pfade: ein sicherer und ein dorniger. Ein Rückweg im Bogen schließt den Hain; Ranken wachsen als Querverbindung.
- **10. Urwald-Kleeblatt** (`wurzelwild-10`, chain-loops, 51 Felder, Schwierigkeit 3): Drei große Lichtungen berühren sich im Urwald wie ein Kleeblatt. Hier wächst der Wald in drei Phasen und öffnet ständig neue Pfade; drei Dornentore verlangen Maut.

### PARADOX CITY

Unmögliche Architektur: Treppen, Raumfaltungen mit vielen faltbaren Kanten (2–3 Phasen), Schleifenwege und drehende Plattformen.

- **1. Treppenhaus ohne Ende** (`paradox-city-01`, terraces, 32 Felder, Schwierigkeit 1): Zwei ineinander geschachtelte Treppenterrassen: Wer hinaufsteigt, landet scheinbar wieder unten. Sechs faltbare Brücken verschieben sich mit jeder Runde.
- **2. Flurschleife** (`paradox-city-02`, ladder, 26 Felder, Schwierigkeit 1): Zwei parallele Flure laufen gegeneinander und werden von Querstiegen verbunden. Sechs Raumfaltungen schalten zusätzliche Durchgänge im Wechsel frei.
- **3. Möbius-Boulevard** (`paradox-city-03`, ribbon, 30 Felder, Schwierigkeit 2): Ein Boulevard, der sich beim Entlanggehen auf die Rückseite dreht. Acht Faltungen in drei Phasen lassen Nebenstraßen auftauchen und verschwinden.
- **4. Wendelwahn** (`paradox-city-04`, tower-spiral, 37 Felder, Schwierigkeit 2): Ein Wendeltreppenturm, dessen Abstieg am Fuß wieder in den Aufstieg mündet. Sieben Faltungen kürzen quer durch das Treppenhaus ab – aber nur in einer Phase.
- **5. Stadtraster Null** (`paradox-city-05`, lattice, 36 Felder, Schwierigkeit 3): Ein Einbahnstraßen-Raster auf einem Hügel, mit zehn Faltungen in drei Phasen. Die Stadt faltet sich um die Spieler herum – kaum ein Weg bleibt, wie er war.
- **6. Überführungs-Irrsinn** (`paradox-city-06`, cross-bridges, 49 Felder, Schwierigkeit 2): Ein Ring mit drei Überführungen, die sich in der Mitte stapeln, ohne sich zu berühren. Acht Faltungen verschieben die Auffahrten von Runde zu Runde.
- **7. Zickzack-Paradox** (`paradox-city-07`, zigzag, 48 Felder, Schwierigkeit 3): Eine riesige Treppen-Serpentine, die sich selbst durchkreuzt. Zwölf Faltungen in drei Phasen machen aus jedem Flur potentiell eine Abkürzung.
- **8. Kleeblatt-Knoten** (`paradox-city-08`, trefoil-knot, 44 Felder, Schwierigkeit 3): Ein Treppenweg zum Kleeblattknoten verschlungen: Die Stränge kreuzen sich auf drei Etagen. Zwölf Faltungen in drei Phasen verbinden die Etagen nur zeitweise.
- **9. Uhrwerk-Bahnen** (`paradox-city-09`, orbits, 48 Felder, Schwierigkeit 2): Drei ineinandergreifende Zahnrad-Plattformen, die gegenläufig rotieren. Zehn Faltungen springen zwischen den Rädern, als würde das Uhrwerk die Zeit verschieben.
- **10. Das unmögliche Haus** (`paradox-city-10`, braid, 39 Felder, Schwierigkeit 3): Ein Haus aus Rauten-Fluren mit zwei Wegen pro Raum und einem Rückweg unter dem Fundament. Vierzehn Faltungen, teils verschoben, machen das Haus zum Rätsel.

### INFINITY CARNIVAL

Kosmische Vergnügungswelt mit Schienen und dynamischen Pfaden, alle Mechaniken gemischt; 07–10 sind die Finale-Bretter.

- **1. Zirkuszelt-Zickzack** (`infinity-carnival-01`, zigzag, 28 Felder, Schwierigkeit 1): Der Weg schlängelt sich in Kehren durch das Zirkuszelt, mit einem Schienenrückweg am Rand. Zwei Querschienen sparen Schritte – ein freundlicher Einstieg ins Karneval.
- **2. Karussell-Blüte** (`infinity-carnival-02`, star-hub, 29 Felder, Schwierigkeit 1): Vier Schienenschleifen drehen sich wie Karussellarme um die Mitte. Wer am Start vorbeifährt, darf die Bahn wechseln; die Blätter liegen auf wechselnder Höhe.
- **3. Doppelrad** (`infinity-carnival-03`, twin-loops, 30 Felder, Schwierigkeit 2): Zwei Riesenräder auf verschiedener Höhe, durch zwei Schienenbrücken verbunden. Drei Faltungen lassen zusätzliche Gondelwege kommen und gehen.
- **4. Jahrmarkt-Kamm** (`infinity-carnival-04`, comb, 36 Felder, Schwierigkeit 1): Eine Budenreihe mit Zinken: Jede Bude ist ein kleiner Schienen-Umweg mit Items. Zwei Abkürzungen und ein Portal-Paar erlauben Sprünge über die Reihen.
- **5. Achterbahn-Leiter** (`infinity-carnival-05`, ladder, 30 Felder, Schwierigkeit 2): Eine lange Achterbahn: Auf der Oberspur hin, auf der Unterspur zurück, mit drei Schienen-Sprossen als Weichen. Die Gleise heben und senken sich wellenförmig.
- **6. Spiegelkabinett-Stadt** (`infinity-carnival-06`, lattice, 30 Felder, Schwierigkeit 2): Ein Raster aus Schienen-Einbahnstraßen, das sich im Spiegelkabinett vervielfacht. Vier Faltungen lassen Seitengassen im Wechsel auftauchen.
- **7. Feuerwerks-Flechte** (`infinity-carnival-07`, braid, 44 Felder, Schwierigkeit 3): FINALE: Vier große Rauten-Weichen reihen sich zur Feuerwerksbahn, darunter schlingt sich der Rückweg. Faltung in drei Phasen, Portale, Mautbrücken und Chaos – alles auf einmal.
- **8. Kosmischer Knoten** (`infinity-carnival-08`, trefoil-knot, 52 Felder, Schwierigkeit 3): FINALE: Eine Schienenbahn, die sich zum kosmischen Knoten verschlingt und sich selbst auf drei Ebenen überkreuzt. Faltung, Portale und viele Weichen sorgen für Chaos.
- **9. Sternen-Karussell** (`infinity-carnival-09`, orbits, 54 Felder, Schwierigkeit 3): FINALE: Drei drehende Karussellbahnen, ineinander geschachtelt und durch Schienen-Weichen verbunden. Dazu Faltung, Portale, Mautbrücken und Chaos-Felder.
- **10. Das große Finale** (`infinity-carnival-10`, chain-loops, 52 Felder, Schwierigkeit 3): FINALE: Fünf Schienenringe hängen wie Kettenglieder aneinander, jeder auf eigener Höhe. Dreifache Faltung, Portale, Mautbrücken, Chaos-Felder und Läden – das größte Brett des Karnevals.

## Baupläne (Topologie-Bauer)

| Bauplan | Beschreibung | Einsatz |
| --- | --- | --- |
| `ring` | Rundkurs mit Umgehungen im Inneren | 3× (prismara-02, nova-nexus-03, wurzelwild-01) |
| `twin-loops` | zwei Rundkurse, durch zwei Brücken verbunden | 3× (prismara-05, nova-nexus-02, infinity-carnival-03) |
| `star-hub` | Nabe (Start) mit Schleifen-Blütenblättern | 3× (prismara-03, nova-nexus-10, infinity-carnival-02) |
| `spiral` | Spirale nach innen, hohe Rückbrücke nach außen | 3× (prismara-06, nova-nexus-07, wurzelwild-07) |
| `ladder` | Hin- und Rückspur mit Sprossen | 3× (nova-nexus-08, paradox-city-02, infinity-carnival-05) |
| `tower-spiral` | Wendeltreppe hinauf, Abstiegsschraube außen | 3× (nova-nexus-06, wurzelwild-04, paradox-city-04) |
| `cross-bridges` | Ring mit Überführungen quer über die Mitte (Kreuzungen auf verschiedenen Höhen) | 3× (prismara-07, nova-nexus-09, paradox-city-06) |
| `ribbon` | zweispuriges Band mit Spurwechseln, optional Möbius-verdreht | 3× (prismara-04, wurzelwild-08, paradox-city-03) |
| `archipelago` | Inselrunden, durch Brücken im Kreis verbunden, optional Zentralinsel | 3× (prismara-01, nova-nexus-05, wurzelwild-02) |
| `comb` | Hin- und Rückreihe mit Π-förmigen Zinken-Umwegen | 3× (prismara-09, wurzelwild-06, infinity-carnival-04) |
| `zigzag` | Serpentine durch Reihen, Randpfad zurück, Querverbindungen | 3× (wurzelwild-05, paradox-city-07, infinity-carnival-01) |
| `lattice` | Stadtraster mit Einbahnstraßen und Randring | 3× (wurzelwild-03, paradox-city-05, infinity-carnival-06) |
| `orbits` | konzentrische Bahnen mit wechselnder Laufrichtung | 3× (nova-nexus-01, paradox-city-09, infinity-carnival-09) |
| `braid` | Kette aus Rauten (Routenwahl), Rückweg im Bogen | 3× (wurzelwild-09, paradox-city-10, infinity-carnival-07) |
| `chain-loops` | Rundkurse, die sich in Kreuzungsfeldern berühren (Kette oder Kleeblatt) | 3× (nova-nexus-04, wurzelwild-10, infinity-carnival-10) |
| `trefoil-knot` | Kleeblattknoten, Stränge kreuzen sich auf verschiedenen Höhen | 3× (prismara-08, paradox-city-08, infinity-carnival-08) |
| `terraces` | quadratische Terrassen (Stufenpyramide) mit Treppen | 2× (prismara-10, paradox-city-01) |

## Aufbau und Regeln

- Jeder Bauer (`builders/*.ts`) liefert nur Felderpositionen, Kanten und Inseln. Danach ergänzt `compose.ts` (`makeLayout`) in dieser Reihenfolge: dauerhafte **Abkürzungen** (`extras.ts`), **faltbare Wege** (4D-Faltung, `folds`), Inseln/Spin, dann die **Feldarten** (`kinds.ts`).
- Abkürzungen und Faltungen werden mit dem `Rng` (feste Seeds) gewählt: gerichtet nach vorn über mindestens einige Schritte, ohne Kreuzung in der Draufsicht (außer mit Höhenunterschied ≥ 2,6) und ohne fremde Felder zu streifen.
- Feldverteilung: Start auf dem Hauptweg; Läden mindestens 3 Schritte vom Start und 4 Schritte voneinander (über dauerhafte Wege gemessen); Portal-Paare weit voneinander entfernt (Weg und Luftlinie); Mautbrücken bevorzugt auf Engstellen und Brücken; Glimmer ≥ 36 %, Dornen ≤ 25 %; Dornen/Items/Ereignisse nicht benachbart.
- Altar-Orte (5–8 je Layout) werden per Farthest-Point-Sampling über Glimmer/Ereignis/Item/Chaos-Felder gestreut, nie am Start, an Portalen oder Mautbrücken.
- Der Kern (Kanten ohne `folds`) macht jedes Layout stark zusammenhängend; faltbare Kanten sind nur Abkürzungen oder verschobene Brücken (gleiches Startfeld, andere Phase).
