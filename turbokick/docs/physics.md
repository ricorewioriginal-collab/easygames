# Physik und Regeln (TURBOKICK)

Alles in `shared/src/sim/` (reiner Code ohne DOM, läuft im Browser und in Node-Tests). Einheiten Meter/Sekunde, Achsen: y oben, x quer, z längs (Tore bei z = ±50). Feste Rate 60 Hz, **deterministisch** (gleicher Startwert + gleiche Eingaben = gleicher Zustand; kein `Math.random`, keine Trigonometrie im Simulationspfad).

| Bereich     | Wert                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arena       | 80 × 100 m, 20 m hoch, abgerundete Übergänge (Radius 6 m), Tore 16 m breit, 6,4 m hoch, 8 m tief                                                        |
| Schwerkraft | 6,5 m/s²                                                                                                                                                |
| Auto        | Höchsttempo 14 m/s, mit Nitro 23 m/s, Supersonic ab 22 m/s, Sprung ≈ 2,5 m (gehalten), Doppelsprung, Ausweichmanöver (Flip) 1,5 s Fenster               |
| Nitro       | 100 Einheiten, Verbrauch 33/s, Start mit 33; 6 große Kanister (+100, 10 s) und 28 kleine Felder (+12, 4 s)                                              |
| Ball        | Radius 0,92 m, Rückprall 0,6, max. 60 m/s                                                                                                               |
| Spiel       | Anstoß mit 3-s-Countdown, 4 s Torfeier, Spielzeit 1–10 min, Verlängerung bei Gleichstand (nächstes Tor gewinnt), Zerstörung bei Supersonic-Rammen (3 s) |

Die Werte stehen in `CAR_TUNING` und `BALL_TUNING` (`shared/src/sim/`) und sind per Test abgesichert. Das Fahrgefühl wurde nur numerisch abgestimmt (Headless-Tests), nicht von Hand gespielt.

Arena-Kollision: Das Innere ist eine Signed-Distance-Funktion (abgerundeter Quader + zwei Torräume); Ball und Auto kollidieren gegen Abstand und Normale. Auto: vier Radsonden, Bodenkontakt ab 3 Rädern, Haftkraft für Wandfahren.

Netzwerk: `encodeSnapshot`/`decodeSnapshot` (569 Byte bei 6 Autos, Prüfsumme, wirft nie), `Sim.loadState` und `cloneState` für die Vorhersage der Gäste.
