# ZEITSPRUNG CASTINGSHOW

Eigenständige 3D-Quizshow für easygames rund um Castingshows, nach dem Zeitstrahl-Prinzip (wie Hitster). Viertes Spiel der Zeitsprung-Reihe nach ZEITSPRUNG RADIO, MOVIE und WISSEN, mit gleichem Ablauf. Läuft auf Smartphone, PC und TV; Vito moderiert mit fester Männerstimme. Solo oder mit bis zu vier Menschen.

## Spiel

- **Zeitstrahlrunden:** 265 Show-Momente: jeder Staffelsieg von DSDS, Das Supertalent, The Voice of Germany, The Voice Kids, The Voice (USA), Popstars, X Factor, Star Search, Germany’s Next Topmodel, Britain’s/America’s Got Talent, Got to Dance, Pop Idol, American Idol und The X Factor (UK) sowie Formatstarts und Kultmomente (Susan Boyle, One Direction, Lena in Oslo, Goldener Buzzer …). Das Jahr wird aus A–D gewählt oder als Profi direkt in den eigenen Zeitstrahl gelegt.
- **Videos:** 31 YouTube-Videos (Castings, Auftritte, Siegersongs, Trailer), meist von offiziellen Kanälen, eingebettet über youtube-nocookie.com erst auf Knopfdruck.
- **Songs:** 44 Sieger- und Finalsongs über den Deezer-Player, in der Zeitstrahlrunde zum Moment oder in Songrunden („Aus welcher Castingshow stammt dieser Siegersong?“).
- **Quizrunden:** 1247 Fragen: 106 redaktionelle Fragen und aus den Staffeldaten erzeugte Fragen zu Siegern, Platz 2, Top 10 bzw. Finalisten, Siegersongs, Jury, Moderation, Coaches und Darbietungen. Dazu „Was war zuerst?“-Runden.
- **Bildrunden:** 31 Symbolrätsel.
- **Themenwelten:** Große Mischung, Deutschland sucht den Superstar, Supertalent & Got Talent, The Voice, Popstars & weitere deutsche Shows sowie Idol, X Factor & international.
- **Wertung:** Jede richtige Antwort gibt einen Punkt, acht Punkte gewinnen.

## TV und Handys

Wie bei den anderen Zeitsprung-Spielen: Im TV-Modus erscheinen WR-Code, PIN und QR-Code; bis zu vier Handys steuern ihre Spielerplätze per PeerJS/WebRTC.

## Daten und Technik

- `shows.js` Staffeltabellen (Sieger, Platz 2, Siegersong, Top 10/Finalisten/Coaches/Band, Jury, Moderation, Coach, Darbietung), geprüft mit de./en.wikipedia, Stand Oktober 2026
- `events.js` Zeitstrahl-Momente (Staffelsiege plus besondere Momente) und Themenwelten
- `knowledge.js` redaktionelle Fragen und erzeugte Fragen (Ablenker fest und reproduzierbar gewählt)
- `media.js` YouTube-Videos und Songs, `music.js` Deezer-Suche, `visual.js` Bildrätsel
- `game.js` Spielablauf und 3D-Studio (Three.js, halbe Bildrate), `pair.js` Handy-Kopplung, `vito.js` Moderation
- Spielstand lokal unter `zc-save-v1`, Synchronisierung über `../cloud/anmacha-cloud.js`
- Prüfung der Daten: `node tools/test-zeitsprung-castingshow.mjs`

Videos, Musik und Multiplayer brauchen Internet; Quiz-, Bild- und Zeitstrahlrunden funktionieren auch offline. Es werden keine Video- oder Musikdateien im Repo gespeichert.
