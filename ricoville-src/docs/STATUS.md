# Funktionsstand (0.1.0)

✅ fertig und getestet · 🟡 vorhanden, nur teilweise getestet · ⛔ noch nicht gebaut

| Bereich | Stand | Hinweis |
|---|---|---|
| 3D-Iso-Welt, Kamera, Zoom, Drehen | ✅ | Desktop + Handy (Chromium-Emulation) |
| Straßen malen, Rückgängig | ✅ | E2E |
| Bauen, Versetzen, Drehen, Abreißen | ✅ | Unit; Bauen auch E2E |
| Wohnhäuser, Einwohner, Einwohnergrenze, Miete | ✅ | Unit + E2E |
| Felder (14 Pflanzen) | ✅ | Unit + E2E |
| Produktion (12 Gebäude, 15 Rezepte), Lager, Markt | ✅ | Unit |
| Läden beliefern und kassieren (18) | ✅ | Unit |
| Baustellen mit Material | ✅ | Unit |
| Bahn, Schiff, Flugzeug (Aufträge + Animation) | 🟡 | Regeln Unit-getestet, Animation nur angesehen |
| Gemeinschaftsgebäude (19), Zufriedenheit, Ausstrahlung | ✅ | Unit |
| Deko (56) | ✅ | Katalog-Test |
| Level, Freischaltungen, Energie | ✅ | Unit |
| Gebiete erweitern | ✅ | Unit |
| 84 Aufgaben, Tages-/Wochenziele, 18 Erfolge | 🟡 | Ablauf getestet, nicht jede Aufgabe einzeln durchgespielt |
| Modi Nostalgisch / Entspannt / Kreativ | ✅ | Unit + E2E |
| Speichern lokal, Sicherung, Migration, zwei Tabs | ✅ | Unit + E2E (Neuladen) |
| Google-Speicher (easygames-Cloud-Skript) | 🟡 | Einbindung getestet, echte Anmeldung nicht |
| PWA, offline, Update-Hinweis | 🟡 | Dateien gebaut; Installation/Update nicht automatisch getestet |
| Musik, Klänge, Umgebung | 🟡 | erzeugt, nicht automatisch geprüft |
| Nachbarn, Besuche, Helfen, Geschenke, Post | 🟡 | Regeln im Firestore-Emulator getestet, Spiel per E2E mit nachgebildetem Firestore; gegen echtes Firebase nicht getestet, Regeln müssen in der Konsole veröffentlicht werden |
| Rangliste (Höchstes Level, Meiste Einwohner) | 🟡 | über easygames-Ranglisten (`cloud/anmacha-board.js`, Ansicht `ranglisten.html` eingebettet), nur Hauptstadt; Bestwerte und Ansicht per E2E, Einreichen per `tools/test-board.mjs` mit Fake-Firestore; echt nicht getestet |
| Server-seitige Prüfung | ⛔ | nur Firestore-Regeln (Spark), siehe SECURITY.md |

## Bekannte Schwächen
- Rückgängig einer Straße nimmt Aufgaben-Fortschritt („Straßen bauen") nicht zurück.
- Autos springen an Kurven leicht zwischen den Fahrspuren.
- Alle Wohnhäuser im Baumenü haben dasselbe Symbol; das 3D-Modell unterscheidet sich.
- Getestet nur in Chromium. Safari/iOS und Firefox sind nicht geprüft.
