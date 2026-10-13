// Sixteen regions. Leader, champion and professor names are those of version 1.
// Each region is its own loadable map (see engine/map-builder.js).
// Dialogue lines depend on progress: pre (before the badge), post (badge won),
// done (regional champion defeated).

const R = (o) => o;

export const REGIONS = [
  R({
    id: 0, name: 'Moostal', town: 'Sonnenhain', types: ['pflanze', 'normal'], biome: 'valley',
    palette: { grass: 0x6fb35a, grass2: 0x9ccc65, dirt: 0xc9a66b, rock: 0x8d8f7a, sky: [0x7fc4ec, 0xe7f6ff], fog: 0xcfeaf2, water: 0x4aa6c9, roof: 0xd8664e, wall: 0xf3e3c3, trim: 0x8a5a3c, accent: 0xf5cd77 },
    weather: ['clear', 'clear', 'rain'], ambience: 'birds', music: 'moss',
    landmark: { kind: 'mill', name: 'Alte Wassermühle' },
    professor: { name: 'Ulme', title: 'Professor Ulme', focus: 'Bindung zwischen Menschen und Taschis' },
    gym: { leader: 'Fels-Fiete', ace: 'felsling', level: 8, mechanic: 'plates', theme: 'Moosgarten-Arena',
      intro: 'Na, ein frischer Trainer! Meine Arena ist ein Steingarten – schieb die Moosfindlinge auf die Platten, dann reden wir.',
      defeat: 'Fest wie ein Fels und doch flink – du hast dir das Moos-Siegel verdient!' },
    champion: { name: 'Meisterin Lin', ace: 'bluetling', intro: 'Ich hüte dieses Tal seit Jahren. Zeig mir, dass deine Bindung zu deinen Taschis echt ist.', defeat: 'Das Moostal ist stolz auf dich. Der Weg zur Korallküste steht dir offen.' },
    puzzle: { kind: 'runes', name: 'Mühlstein-Runen', hint: 'Die Wandbilder an der Mühle zeigen, welches Zeichen jeder Stein tragen muss.' },
    villageQuest: 'Moosbach',
    npcs: [
      { role: 'handwerker', name: 'Müller Henrik', lines: { pre: ['Die Mühle läuft wieder, seit Samenlinge die Wurzeln aus dem Mühlrad geholt haben.', 'Die Runen am Mühlstein gehören zum Siegelrätsel. Schau dir die Wandbilder genau an.'], post: ['Fiete hat dir das Siegel gegeben? Dann mahle ich dir heute extra feines Mehl!'], done: ['Die Korallküste liegt jenseits des Nordtors. Grüß mir das Meer!'] } },
      { role: 'kind', name: 'Pia', lines: { pre: ['Ich hab ein Fellino gesehen! Es hatte sooo lange Ohren!', 'Im hohen Gras raschelt es immer, wenn man ganz leise ist.'], post: ['Zeig mal dein Siegel! Wow, es glitzert grün!'], done: ['Wenn ich groß bin, werde ich auch Champion. Versprochen!'] } },
      { role: 'familie', name: 'Familie Linde', lines: { pre: ['Wir picknicken jeden Sonntag am Mühlteich. Die Quappis springen dann aus dem Wasser.'], post: ['Unser Sohn erzählt nur noch von deinem Arenakampf.'], done: ['Pass auf dich auf, da draußen. Und komm uns besuchen!'] } },
      { role: 'reisender', name: 'Wanderin Oda', lines: { pre: ['Ich komme von der Korallküste. Das Nordtor öffnet sich erst für Trainer, die Champion Lin besiegt haben.'], post: ['Lin wartet im Pavillon am Hügel östlich der Stadt.'], done: ['Vielleicht sehen wir uns an der Küste wieder.'] } },
      { role: 'trainer', name: 'Trainer Kolja', lines: { pre: ['Hast du schon einmal einen Typenvorteil genutzt? Pflanze schlägt Wasser, Feuer schlägt Pflanze.'], post: ['Felsling ist hart, aber Wasser und Pflanze wirken gut gegen Gestein.'], done: ['Ich trainiere hier weiter, bis ich dich einhole!'] } },
      { role: 'haendler', name: 'Händlerin Grete', lines: { pre: ['Im Laden gibt es Taschibälle und Tränke. Je mehr Siegel du hast, desto mehr führen wir.'], post: ['Mit zwei Siegeln bekommst du Kraftpulver.'], done: ['Sternsplitter kaufe ich dir gern teuer ab.'] } },
      { role: 'forscher', name: 'Assistent Jo', lines: { pre: ['Ich helfe Professor Ulme bei der Bindungsforschung. Taschis, die man gut behandelt, kämpfen mutiger.'], post: ['Der Professor will dir bald neue Aufträge geben.'], done: ['Der Taschidex wächst! Der Professor ist begeistert.'] } }
    ],
    quests: [
      { id: 'q0_mira', title: 'Waldwege bewahren', giver: 'Waldhüterin Mira', kind: 'catchType', type: 'pflanze', count: 2, legacyKey: 'Moosbach', desc: 'Zeige Waldhüterin Mira zwei verschiedene Pflanzen-Taschis.', reward: { items: { taschiball: 8, trank: 4 } } },
      { id: 'q0_lost', title: 'Der verlorene Mühlenschlüssel', giver: 'Müller Henrik', kind: 'find', target: 'lostItem', desc: 'Henrik hat den Schlüssel zum Mühlenkeller am Bach verloren. Suche glitzernde Stellen am Ufer.', reward: { coins: 150, items: { supertrank: 1 } } }
    ]
  }),
  R({
    id: 1, name: 'Korallküste', town: 'Perlenhafen', types: ['wasser', 'flug'], biome: 'coast',
    palette: { grass: 0x8cc66a, grass2: 0xb8d97c, dirt: 0xe8d29a, rock: 0xb3a58c, sky: [0x5cc2f2, 0xd8f4ff], fog: 0xd2eef6, water: 0x2f9fd0, roof: 0x3d8bc1, wall: 0xfbf2e2, trim: 0x2f5f86, accent: 0xff8f7a },
    weather: ['clear', 'clear', 'wind'], ambience: 'sea', music: 'coast',
    landmark: { kind: 'lighthouse', name: 'Leuchtturm Perlenlicht' },
    professor: { name: 'Marea', title: 'Professorin Marea', focus: 'Meeresströmungen und Küstenvögel' },
    gym: { leader: 'Perla', ace: 'quappi', level: 11, mechanic: 'order', theme: 'Muschel-Arena',
      intro: 'Die Muscheln singen in einer Reihenfolge. Wer zuhört, findet den Weg zu mir.', defeat: 'Du hast den Takt der Wellen verstanden. Das Wellen-Siegel gehört dir!' },
    champion: { name: 'Kapitän Marek', ace: 'quappi', intro: 'Auf See zählt Ruhe. Mal sehen, ob du bei hohem Seegang den Kurs hältst!', defeat: 'Ahoi, Champion! Der Pfad zum Funkenfeld ist frei.' },
    puzzle: { kind: 'switches', name: 'Gezeitenschleusen', hint: 'Jeder Hebel bewegt auch die benachbarten Schleusen. Alle Laternen müssen leuchten.' },
    villageQuest: 'Korallendorf', legend: 'tiefenlied',
    npcs: [
      { role: 'handwerker', name: 'Netzflickerin Ylva', lines: { pre: ['Die Möwen-Taschis stibitzen meine Garnrollen. Frechdachse!', 'Am Leuchtturm sieht man bei klarem Wetter bis zum Funkenfeld.'], post: ['Perla trainiert jeden Morgen im Hafenbecken.'], done: ['Tiefenlied, der Wächter der Strömung, soll in der Grotte unter dem Leuchtturm schlafen.'] } },
      { role: 'kind', name: 'Malte', lines: { pre: ['Ich sammle Muscheln. Die mit den Punkten sind am schönsten!'], post: ['Hast du die singenden Muscheln in der Arena gehört?'], done: ['Wenn ich groß bin, fahre ich mit Kapitän Marek zur See!'] } },
      { role: 'haendler', name: 'Fischhändler Bo', lines: { pre: ['Frischer Fang! Leider nur für Menschen – Taschis mögen lieber Beeren.'], post: ['Für Siegelträger gibt es Supertränke im Laden.'], done: ['Champion, für dich gibt’s Rabatt aufs Lächeln.'] } },
      { role: 'reisender', name: 'Seglerin Inka', lines: { pre: ['Hinter dem Hafen beginnt die Strandroute. Achte auf Flatterlinge in den Dünen.'], post: ['Der Pfad zum Funkenfeld liegt im Norden, über die Felsbrücke.'], done: ['Der Wind dreht. Gute Reise!'] } },
      { role: 'trainer', name: 'Schwimmer Tobi', lines: { pre: ['Wasser-Taschis sind gegen Feuer stark. Aber Elektro trifft sie hart!'], post: ['Revanche? Irgendwann!'], done: ['Respekt, Champion.'] } },
      { role: 'familie', name: 'Oma Hedda', lines: { pre: ['Mein Enkel spielt am Strand. Wenn du ihn siehst, sag ihm, es gibt Fischbrötchen.'], post: ['Du bist der Trainer, über den alle reden!'], done: ['Komm wieder, wenn die Kirschen blühen.'] } },
      { role: 'forscher', name: 'Biologe Erik', lines: { pre: ['Wir zählen die Vogelschwärme an der Küste. Fang ruhig einige – der Bestand ist gesund.'], post: ['Professorin Marea hat eine neue Theorie über Strömungen.'], done: ['Die Daten aus deinem Taschidex sind Gold wert.'] } }
    ],
    quests: [
      { id: 'q1_nele', title: 'Geschichten des Meeres', giver: 'Fischerin Nele', kind: 'catchType', type: 'wasser', count: 2, legacyKey: 'Korallendorf', desc: 'Fange zwei verschiedene Wasser-Taschis für Fischerin Nele.', reward: { items: { taschiball: 8, trank: 4 } } },
      { id: 'q1_flag', title: 'Die Signalflagge', giver: 'Netzflickerin Ylva', kind: 'find', target: 'lostItem', desc: 'Ein Sturm hat die Signalflagge des Leuchtturms weggeweht. Sie muss irgendwo am Strand liegen.', reward: { coins: 200, items: { superball: 3 } } }
    ]
  }),
  R({
    id: 2, name: 'Funkenfeld', town: 'Voltheim', types: ['elektro', 'normal'], biome: 'plains',
    palette: { grass: 0xa8c35a, grass2: 0xd4d36b, dirt: 0xc8a978, rock: 0x9c9585, sky: [0x86b7e8, 0xf5f1d8], fog: 0xe7ead2, water: 0x4b9bc4, roof: 0x4b5b8f, wall: 0xf1e7cf, trim: 0xe8b830, accent: 0xffe14d },
    weather: ['clear', 'storm', 'clear'], ambience: 'wind', music: 'spark',
    landmark: { kind: 'windmills', name: 'Windradfeld' },
    professor: { name: 'Volt', title: 'Professor Volt', focus: 'Energie und Elektro-Taschis' },
    gym: { leader: 'Käpt’n Volt', ace: 'blitzi', level: 14, mechanic: 'switches', theme: 'Generator-Arena',
      intro: 'Strom fließt nur durch geschlossene Kreise! Bring alle Generatoren zum Laufen, dann kämpfen wir.', defeat: 'Ha! Volle Ladung – das Funken-Siegel ist deins!' },
    champion: { name: 'Donnerfürstin Edda', ace: 'blitzor', intro: 'Ich bin die Ruhe vor dem Sturm. Und dann der Sturm.', defeat: 'Du leuchtest heller als jeder Blitz. Weiter zum Blütenhain!' },
    puzzle: { kind: 'plates', name: 'Transformator-Platten', hint: 'Schiebe die Spulen auf die Kontaktplatten. Jede Platte braucht genau eine Spule.' },
    guild: 0,
    npcs: [
      { role: 'handwerker', name: 'Elektrikerin Sanne', lines: { pre: ['Seit Wochen verschwinden Knister aus dem Windradfeld. Irgendjemand fängt sie mit Netzen!'], post: ['Nach deinem Sieg gegen die Gilde laufen die Windräder wieder ruhig.'], done: ['Das Funkenfeld schuldet dir einen Gefallen.'] } },
      { role: 'kind', name: 'Lotte', lines: { pre: ['Ich hab einen Ballon gesehen! Violett und orange! Mit einer Katze drin!'], post: ['Waren das Diebe? Echt?'], done: ['Du bist mein Held!'] } },
      { role: 'haendler', name: 'Kioskbesitzer Ralf', lines: { pre: ['Batterien? Nee. Aber Kraftpulver! Gibt’s im Laden ab zwei Siegeln.'], post: ['Ein Siegelträger! Erzähl mal, wie war der Kampf?'], done: ['Hier kommen nur selten Champions vorbei.'] } },
      { role: 'reisender', name: 'Fotograf Milo', lines: { pre: ['Bei Gewitter leuchtet das ganze Feld. Unglaubliche Fotos!'], post: ['Der Weg zum Blütenhain führt durch den Hohlweg im Norden.'], done: ['Darf ich ein Foto von dir und deinem Team machen?'] } },
      { role: 'trainer', name: 'Trainerin Mel', lines: { pre: ['Elektro-Attacken lähmen manchmal. Ein Heilkraut hilft dagegen.'], post: ['Gegen Erde-Taschis ist Elektro wirkungslos – merk dir das!'], done: ['Nächstes Mal gewinne ich!'] } },
      { role: 'familie', name: 'Familie Ohm', lines: { pre: ['Unser Haus wird vom Windrad versorgt. Ganz ohne Rauch!'], post: ['Komm doch auf eine Limonade rein.'], done: ['Wir haben dein Bild im Kiosk aufgehängt!'] } },
      { role: 'forscher', name: 'Ingenieur Paul', lines: { pre: ['Die Fanggeräte der Gilde stören unsere Messungen. Sie nutzen gestohlene Elektro-Energie.'], post: ['Ich untersuche das Netz, das du sichergestellt hast. Höchst merkwürdige Technik.'], done: ['Die Gilde forscht an etwas Größerem. Sei wachsam.'] } }
    ],
    quests: [
      { id: 'q2_sparks', title: 'Leuchtende Felder', giver: 'Elektrikerin Sanne', kind: 'catchType', type: 'elektro', count: 2, desc: 'Fange zwei Elektro-Taschis, damit Sanne ihr Verhalten studieren kann.', reward: { coins: 220, items: { heilkraut: 3 } } },
      { id: 'q2_cable', title: 'Das verlorene Kabel', giver: 'Ingenieur Paul', kind: 'find', target: 'lostItem', desc: 'Eine Kabeltrommel ist vom Wagen gefallen. Sie liegt irgendwo auf den Feldwegen.', reward: { coins: 180, items: { angriffsplus: 2 } } }
    ]
  }),
  R({
    id: 3, name: 'Blütenhain', town: 'Blütenruh', types: ['pflanze', 'geist'], biome: 'grove',
    palette: { grass: 0x7fbf6d, grass2: 0xb5df8a, dirt: 0xd9b98a, rock: 0x9b8f86, sky: [0xa3c9f0, 0xfde8ef], fog: 0xf6e3ea, water: 0x6bb3d1, roof: 0xc4567a, wall: 0xfff1e6, trim: 0x6b3a3a, accent: 0xff9ec2 },
    weather: ['clear', 'petals', 'clear'], ambience: 'birds', music: 'blossom',
    landmark: { kind: 'shrine', name: 'Schrein der Stillen Blüte' },
    professor: { name: 'Liora', title: 'Professorin Liora', focus: 'Geist-Taschis und alte Legenden' },
    gym: { leader: 'Blüte', ace: 'samenling', level: 17, mechanic: 'order', theme: 'Blütenpavillon',
      intro: 'Blumen öffnen sich in ihrer eigenen Reihenfolge. Folge dem Duft – oder dem Licht.', defeat: 'Wie schön du gekämpft hast. Nimm das Blüten-Siegel.' },
    champion: { name: 'Hüterin Flora', ace: 'samenling', intro: 'Der Hain ist still, aber nicht schwach.', defeat: 'Die Blüten fallen für dich. Der Käferwald wartet.' },
    puzzle: { kind: 'order', name: 'Laternenpfad', hint: 'Die steinernen Laternen am Schrein zeigen Punkte. Betritt die Platten von wenigen zu vielen Punkten.' },
    npcs: [
      { role: 'handwerker', name: 'Gärtner Hiro', lines: { pre: ['Die Kirschbäume blühen hier das ganze Jahr. Man sagt, Geist-Taschis halten sie wach.'], post: ['Blüte pflegt die Arena selbst. Jede Pflanze hat einen Namen.'], done: ['Nimm eine Blüte mit auf die Reise.'] } },
      { role: 'kind', name: 'Suki', lines: { pre: ['Nachts tanzen Lichter zwischen den Bäumen. Das sind Geisterchen!'], post: ['Hattest du Angst in der Arena? Ich hätte gezittert.'], done: ['Geisterchen haben dich lieb, glaub ich.'] } },
      { role: 'haendler', name: 'Teehändlerin Mei', lines: { pre: ['Blütentee beruhigt die Nerven vor Arenakämpfen.'], post: ['Ab drei Siegeln gibt es Belebungskraut im Laden.'], done: ['Für Champions immer eine Tasse gratis.'] } },
      { role: 'reisender', name: 'Pilger Anselm', lines: { pre: ['Ich besuche jeden Schrein der sechzehn Regionen. Dieser hier ist der friedlichste.'], post: ['Der Laternenpfad ist ein altes Gebet. Die Punkte sagen, wie man ihn geht.'], done: ['Mögen dich die sechzehn Lichter leiten.'] } },
      { role: 'trainer', name: 'Trainer Ren', lines: { pre: ['Normal-Attacken treffen Geist-Taschis nicht. Lerne das, bevor du gegen Blüte antrittst!'], post: ['Du hast es also geschafft. Nicht schlecht.'], done: ['Ich gehe jetzt in den Käferwald trainieren.'] } },
      { role: 'familie', name: 'Familie Sakura', lines: { pre: ['Wir verkaufen Blütenkränze am Schrein.'], post: ['Unsere Tochter will auch Trainerin werden!'], done: ['Bring uns einmal ein Taschi aus dem Himmelreich mit!'] } },
      { role: 'forscher', name: 'Archivarin Noemi', lines: { pre: ['In den Schriftrollen steht, dass vier uralte Wächter über die Lichter wachen.'], post: ['Professorin Liora sucht Hinweise auf den Mondhüter.'], done: ['Die Legenden scheinen wahr zu sein.'] } }
    ],
    quests: [
      { id: 'q3_ghost', title: 'Lichter im Hain', giver: 'Suki', kind: 'catchType', type: 'geist', count: 1, desc: 'Fange ein Geist-Taschi und zeige es Suki.', reward: { coins: 150, items: { belebungskraut: 1 } } },
      { id: 'q3_scroll', title: 'Die verlorene Schriftrolle', giver: 'Archivarin Noemi', kind: 'find', target: 'lostItem', desc: 'Eine Schriftrolle wurde unter den Kirschbäumen verloren.', reward: { coins: 200, items: { aetherperle: 1 } } }
    ]
  }),
  R({
    id: 4, name: 'Käferwald', town: 'Waldsaum', types: ['pflanze', 'flug'], biome: 'forest',
    palette: { grass: 0x4e9a4f, grass2: 0x76b05a, dirt: 0x8f6f4c, rock: 0x6f7366, sky: [0x7fb7d6, 0xd6efe0], fog: 0xa9cfb8, water: 0x3f8f8a, roof: 0x7a5a3a, wall: 0xd9c49a, trim: 0x4a3524, accent: 0xb6e05a },
    weather: ['clear', 'rain', 'fog'], ambience: 'forest', music: 'forest',
    landmark: { kind: 'mushrooms', name: 'Riesenpilzlichtung' },
    professor: { name: 'Bork', title: 'Professor Bork', focus: 'Insekten und Waldökologie' },
    gym: { leader: 'Forscher Nilo', ace: 'kaeferli', level: 19, mechanic: 'maze', theme: 'Heckenlabyrinth',
      intro: 'Im Wald verliert man sich leicht. Achte auf die Blätter, die anders schimmern.', defeat: 'Du hast den verborgenen Pfad gefunden – das Wald-Siegel ist verdient.' },
    champion: { name: 'Waldmeister Rian', ace: 'kaeferli', intro: 'Der Wald prüft jeden. Heute prüfe ich dich.', defeat: 'Die Bäume flüstern deinen Namen. Weiter zur Sturmklippe!' },
    puzzle: { kind: 'maze', name: 'Wurzelpfad', hint: 'Zwischen den Wurzeln glimmen manche Blätter. Folge ihnen.' },
    cave: 'Flüsterhöhle', guild: 1,
    npcs: [
      { role: 'handwerker', name: 'Holzschnitzer Ole', lines: { pre: ['Ich schnitze nur Holz von umgestürzten Bäumen. Der Wald gibt, was er entbehren kann.'], post: ['In der Flüsterhöhle sollen Kristalle wachsen.'], done: ['Hier, ein geschnitztes Käferli. Für deine Sammlung.'] } },
      { role: 'kind', name: 'Finja', lines: { pre: ['Im Wald hab ich Käfige gesehen! Mit Taschis drin!', 'Die Männer in Violett haben gesagt, ich soll verschwinden.'], post: ['Hast du die Taschis befreit? Wirklich?'], done: ['Die befreiten Käferlis wohnen jetzt in unserem Garten.'] } },
      { role: 'haendler', name: 'Kräuterfrau Wilma', lines: { pre: ['Heilkräuter aus dem Wald helfen gegen Gift und Schlaf.'], post: ['Für dich habe ich immer frische Kräuter.'], done: ['Der Wald ist wieder ruhig. Danke.'] } },
      { role: 'reisender', name: 'Pilzsammler Gustav', lines: { pre: ['Die Riesenpilze leuchten nachts. Dort tummeln sich seltene Taschis.'], post: ['Nördlich des Waldes beginnt der Aufstieg zur Sturmklippe.'], done: ['Ich hab einen Pilz so groß wie ein Schirm gefunden!'] } },
      { role: 'trainer', name: 'Käfersammler Timo', lines: { pre: ['Flug-Taschis sind gut gegen Pflanzen. Hier im Wald brauchst du Feuer oder Flug!'], post: ['Nilos Labyrinth hat mich drei Tage festgehalten …'], done: ['Du bist schneller als jeder Käfer.'] } },
      { role: 'familie', name: 'Förstersfamilie Eich', lines: { pre: ['Wir wohnen hier seit Generationen. Die Gilde ist das Erste, was uns wirklich Angst macht.'], post: ['Danke, dass du uns hilfst.'], done: ['Komm jederzeit zum Abendessen vorbei.'] } },
      { role: 'forscher', name: 'Assistentin Lu', lines: { pre: ['Professor Bork zählt Insekten. Ich zähle Professor Borks Kaffeetassen.'], post: ['Bork sagt, du sollst Flug-Taschis registrieren.'], done: ['Der Waldbericht wird dank dir vollständig.'] } }
    ],
    quests: [
      { id: 'q4_wings', title: 'Flügel im Blätterdach', giver: 'Professor Bork', kind: 'catchType', type: 'flug', count: 2, desc: 'Registriere zwei Flug-Taschis für Professor Borks Waldbericht.', reward: { coins: 240, items: { superball: 4 } } },
      { id: 'q4_carving', title: 'Ole verliert ein Messer', giver: 'Holzschnitzer Ole', kind: 'find', target: 'lostItem', desc: 'Oles Lieblingsmesser liegt irgendwo bei den Riesenpilzen.', reward: { coins: 200, items: { heilkraut: 3 } } }
    ]
  }),
  R({
    id: 5, name: 'Sturmklippe', town: 'Windwacht', types: ['flug', 'elektro'], biome: 'cliffs',
    palette: { grass: 0x8dbb6c, grass2: 0xb7cf86, dirt: 0xb9a88a, rock: 0x7f8a93, sky: [0x6f9fd4, 0xdce8f2], fog: 0xc6d6e2, water: 0x3478a8, roof: 0x5c7da0, wall: 0xe6e4dc, trim: 0x3d4a5c, accent: 0x9fd7ff },
    weather: ['wind', 'storm', 'clear'], ambience: 'wind', music: 'storm',
    landmark: { kind: 'windtower', name: 'Windwacht-Turm' },
    professor: { name: 'Aeris', title: 'Professorin Aeris', focus: 'Thermik und Flugbahnen' },
    gym: { leader: 'Jette vom Team Funke', ace: 'knister', level: 21, mechanic: 'switches', theme: 'Windkanal-Arena',
      intro: 'Die Ventilatoren müssen alle im Gleichtakt laufen. Schaffst du das?', defeat: 'Du fliegst wirklich hoch! Hier ist das Sturm-Siegel.' },
    champion: { name: 'Sturmmeister Taro', ace: 'flatterling', intro: 'Der Wind entscheidet, wer fliegt. Heute entscheide ich.', defeat: 'Hoch hinaus, Champion. Im Süden glüht schon das Glutland.' },
    puzzle: { kind: 'crystals', name: 'Spiegel der Windwacht', hint: 'Drehe die Spiegel, bis das Sonnenlicht den Turm erreicht.' },
    villageQuest: 'Winddorf',
    npcs: [
      { role: 'handwerker', name: 'Seilerin Kaja', lines: { pre: ['Ich spanne die Seile für die Hängebrücken. Stabil wie Felsen!'], post: ['Jette hat das Team Funke gegründet, eine Gruppe junger Elektro-Trainer.'], done: ['Die Brücken halten dich jederzeit.'] } },
      { role: 'kind', name: 'Benno', lines: { pre: ['Mein Drachen fliegt höher als jeder Flatterling!'], post: ['Lässt du mich mal dein Siegel halten?'], done: ['Ich will auch so stark werden!'] } },
      { role: 'haendler', name: 'Krämer Wendel', lines: { pre: ['Bei Sturm verkaufe ich mehr Tränke. Seltsam, nicht?'], post: ['Supertränke sind jetzt vorrätig.'], done: ['Für dich lege ich etwas zurück.'] } },
      { role: 'reisender', name: 'Pilotin Liv', lines: { pre: ['Ich möchte zwei Flug-Taschis sehen, die über den Hügeln leben.'], post: ['Der Aufwind an der Klippe trägt Flatterlinge bis zu den Wolken.'], done: ['Ich fliege dir voraus – bis Himmelskrone!'] } },
      { role: 'trainer', name: 'Gleitflieger Arno', lines: { pre: ['Elektro-Attacken treffen Flug-Taschis besonders hart.'], post: ['Jette ist schnell – aber du warst schneller.'], done: ['Gute Thermik, Champion!'] } },
      { role: 'familie', name: 'Leuchtwärter Brandt', lines: { pre: ['Bei Gewitter muss ich die Turmlampe festhalten. Ehrlich!'], post: ['Der Turm leuchtet heller, seit du das Rätsel gelöst hast.'], done: ['Komm uns besuchen, wenn der Sturm ruht.'] } },
      { role: 'forscher', name: 'Meteorologe Kurt', lines: { pre: ['Mein Barometer spielt verrückt, wenn Gewitter-Taschis vorbeiziehen.'], post: ['Professorin Aeris plant ein Experiment mit Flug-Taschis.'], done: ['Hervorragende Daten, wirklich.'] } }
    ],
    quests: [
      { id: 'q5_liv', title: 'Über den Hügeln', giver: 'Pilotin Liv', kind: 'catchType', type: 'flug', count: 2, legacyKey: 'Winddorf', desc: 'Zeige Pilotin Liv zwei verschiedene Flug-Taschis.', reward: { items: { taschiball: 8, trank: 4 } } },
      { id: 'q5_kite', title: 'Bennos Drachen', giver: 'Benno', kind: 'find', target: 'lostItem', desc: 'Bennos Drachen hat sich losgerissen und hängt irgendwo an der Klippe.', reward: { coins: 220, items: { supertrank: 2 } } }
    ]
  }),
  R({
    id: 6, name: 'Glutland', town: 'Essenfeld', types: ['feuer', 'gestein'], biome: 'volcanic',
    palette: { grass: 0x9a8a5a, grass2: 0xb89a62, dirt: 0x7a5a48, rock: 0x4f4646, sky: [0xd08a5c, 0xf6d6b0], fog: 0xd6a888, water: 0xff6a2a, roof: 0x5a3a32, wall: 0xc9a483, trim: 0x2e2222, accent: 0xff7a2f },
    weather: ['embers', 'clear', 'embers'], ambience: 'lava', music: 'ember',
    landmark: { kind: 'volcano', name: 'Glutkegel' },
    professor: { name: 'Ignis', title: 'Professor Ignis', focus: 'Vulkanismus und Feuer-Taschis' },
    gym: { leader: 'Kapitän Rumo', ace: 'glutzahn', level: 24, mechanic: 'plates', theme: 'Schmiede-Arena',
      intro: 'Schiebe die Basaltblöcke auf die Dampföffnungen, sonst röstet dich die Hitze!', defeat: 'Hart geschmiedet! Das Glut-Siegel gehört dir.' },
    champion: { name: 'Glutkönigin Sina', ace: 'glutdrach', intro: 'Im Glutland überlebt nur, wer glüht.', defeat: 'Dein Feuer brennt heller. Die Sternenau erwartet dich.' },
    puzzle: { kind: 'runes', name: 'Schmiedesiegel', hint: 'Die Ambosse in der Werkstatt zeigen die Zeichen der drei Säulen.' },
    villageQuest: 'Sternental', cave: 'Bernsteingrotte', guild: 2,
    npcs: [
      { role: 'handwerker', name: 'Schmiedin Sira', lines: { pre: ['Unser Schmiedefeuer lebt von Mut. Zeige mir zwei verschiedene Feuer-Taschis.'], post: ['Rumo war früher Kapitän. Jetzt schmiedet er nur noch Siege.'], done: ['Ich schmiede dir ein Abzeichen für deinen Rucksack.'] } },
      { role: 'kind', name: 'Tarek', lines: { pre: ['Die Gilde hat ein Tor in den Berg gebaut. Da drin brummt es ganz laut!'], post: ['Ist die Gilde jetzt weg? Mama sagt, sie forschen an Kristallen.'], done: ['Du bist mutiger als ein Glutdrach!'] } },
      { role: 'haendler', name: 'Händler Kasim', lines: { pre: ['Hitzeschutzcreme? Leider aus. Aber Tränke habe ich!'], post: ['Ätherperlen gibt es ab sechs Siegeln.'], done: ['Bester Kunde des Jahres!'] } },
      { role: 'reisender', name: 'Geologin Tilda', lines: { pre: ['Die Bernsteingrotte im Westen ist voller eingeschlossener Funken.'], post: ['Die Forschungsstation der Gilde liegt am Fuß des Glutkegels.'], done: ['Die Gesteinsproben sind wieder sicher.'] } },
      { role: 'trainer', name: 'Feuerspucker Marco', lines: { pre: ['Wasser und Erde löschen Feuer. Rumo weiß das und hat vorgesorgt.'], post: ['Kein Rauch ohne Feuer – und kein Sieg ohne dich.'], done: ['Revanche bei Sonnenaufgang!'] } },
      { role: 'familie', name: 'Familie Asch', lines: { pre: ['Seit die Gilde da ist, bebt der Boden öfter.'], post: ['Endlich wieder Ruhe im Tal.'], done: ['Hier, eine heiße Suppe für den Weg.'] } },
      { role: 'forscher', name: 'Assistent Fenno', lines: { pre: ['Professor Ignis sagt, die Gilde zapft die Hitze des Vulkans an.'], post: ['Der Gildenschlüssel öffnet die Station – vielleicht findest du ihn bei ihren Leuten.'], done: ['Die Station ist versiegelt. Gute Arbeit!'] } }
    ],
    quests: [
      { id: 'q6_sira', title: 'Mut des Schmiedefeuers', giver: 'Schmiedin Sira', kind: 'catchType', type: 'feuer', count: 2, legacyKey: 'Sternental', desc: 'Zeige Schmiedin Sira zwei verschiedene Feuer-Taschis.', reward: { items: { taschiball: 8, trank: 4 } } },
      { id: 'q6_hammer', title: 'Der Hammer des Meisters', giver: 'Händler Kasim', kind: 'find', target: 'lostItem', desc: 'Ein alter Schmiedehammer wurde in den Lavafeldern zurückgelassen.', reward: { coins: 300, items: { sternsplitter: 1 } } }
    ]
  }),
  R({
    id: 7, name: 'Sternenau', town: 'Lichtenau', types: ['geist', 'normal'], biome: 'meadow-night',
    palette: { grass: 0x6c9a7c, grass2: 0x9cbf8f, dirt: 0xc2ab8a, rock: 0x868aa0, sky: [0x3a4c8f, 0xc7b8e8], fog: 0xb3abd6, water: 0x5a7fd0, roof: 0x47407a, wall: 0xece6f5, trim: 0xd7b25a, accent: 0xfff0a0 },
    weather: ['stars', 'clear', 'stars'], ambience: 'night', music: 'stars',
    landmark: { kind: 'observatory', name: 'Sternwarte Lichtenau' },
    professor: { name: 'Nova', title: 'Professorin Nova', focus: 'Sternbilder und die 16 Lichter' },
    gym: { leader: 'Meisterin Aurelia', ace: 'blitzor', level: 27, mechanic: 'crystals', theme: 'Planetarium-Arena',
      intro: 'Lenke das Sternenlicht durch die Spiegel zum Tor. Dann zeig mir dein Licht.', defeat: 'Deine Reise hat gerade erst begonnen – und doch strahlst du schon. Das Stern-Siegel ist deins.' },
    champion: { name: 'Sternenhüter Aven', ace: 'funkli', intro: 'Die Sterne haben mir deinen Besuch angekündigt.', defeat: 'Ein neuer Stern ist aufgegangen. Das Nebelmoor liegt im Süden.' },
    puzzle: { kind: 'switches', name: 'Sternbild-Steine', hint: 'Ein Sternbild ist vollständig, wenn alle Steine leuchten. Jeder Stein beeinflusst seine Nachbarn.' },
    npcs: [
      { role: 'handwerker', name: 'Linsenschleifer Benedikt', lines: { pre: ['Ich schleife Linsen für die Sternwarte. Eine Linse braucht drei Monate.'], post: ['Aurelia ist die beste Trainerin, die ich kenne. Sie kehrt angeblich als Großmeisterin zurück.'], done: ['Siehst du den neuen Stern? Ich hab ihn nach dir benannt.'] } },
      { role: 'kind', name: 'Nele', lines: { pre: ['Ich kann alle Sternbilder! Das da ist der Große Taschi!'], post: ['Du hast Aurelia besiegt? Die ist doch unbesiegbar!'], done: ['Kannst du mir Sternbilder zeigen?'] } },
      { role: 'haendler', name: 'Nachtmarkt-Händlerin Ida', lines: { pre: ['Der Nachtmarkt öffnet, wenn die Sterne aufgehen.'], post: ['Sternsplitter? Ich kaufe!'], done: ['Leuchtende Grüße, Champion.'] } },
      { role: 'reisender', name: 'Astronom Pavel', lines: { pre: ['Sechzehn Sterne bilden einen Kreis um den Himmelspol. Man nennt sie die Lichter.'], post: ['Einer der Sterne flackert. Die Gilde soll damit zu tun haben.'], done: ['Die Lichter sind stabil, solange du sie schützt.'] } },
      { role: 'trainer', name: 'Trainerin Selin', lines: { pre: ['Geist-Taschis sind nachts besonders aktiv.'], post: ['Spiegel sind tückisch, oder?'], done: ['Gut gemacht, Sternenkind.'] } },
      { role: 'familie', name: 'Familie Mondwald', lines: { pre: ['Bei uns schlafen die Kinder unter dem offenen Dach.'], post: ['Unsere Kleine hat ein Bild von dir gemalt.'], done: ['Bleib zum Sternschnuppenfest!'] } },
      { role: 'forscher', name: 'Professorin Novas Teleskop-Assistent Edo', lines: { pre: ['Die Professorin glaubt, die Lichter sind mit den uralten Wächtern verbunden.'], post: ['Du sollst ihr berichten, was die Gilde vorhat.'], done: ['Alle Daten deuten auf den Sternengipfel.'] } }
    ],
    quests: [
      { id: 'q7_stars', title: 'Nachtlichter', giver: 'Professorin Nova', kind: 'dexCount', count: 30, desc: 'Registriere 30 gefangene Arten im Taschidex.', reward: { coins: 400, items: { sternball: 2 } } },
      { id: 'q7_lens', title: 'Die Linse', giver: 'Linsenschleifer Benedikt', kind: 'find', target: 'lostItem', desc: 'Eine frisch geschliffene Linse ist aus dem Korb gefallen.', reward: { coins: 250, items: { aetherperle: 2 } } }
    ]
  }),
  R({
    id: 8, name: 'Nebelmoor', town: 'Nebelsteg', types: ['geist', 'wasser'], biome: 'swamp',
    palette: { grass: 0x5f8a62, grass2: 0x86a678, dirt: 0x6e5d48, rock: 0x6c6f6a, sky: [0x7d8fa0, 0xc9d3d6], fog: 0xb8c4c2, water: 0x47706a, roof: 0x4e5a52, wall: 0xb8b29a, trim: 0x3a3a32, accent: 0x9be0c8 },
    weather: ['fog', 'rain', 'fog'], ambience: 'swamp', music: 'mist',
    landmark: { kind: 'boardwalk', name: 'Stelzensteg' },
    professor: { name: 'Nebel', title: 'Professor Nebel', focus: 'Sumpfökologie und Irrlichter' },
    gym: { leader: 'Kira vom Nebelpass', ace: 'geisterchen', level: 30, mechanic: 'maze', theme: 'Nebelarena',
      intro: 'Im Nebel siehst du nur, was du sehen willst. Folge dem Leuchten.', defeat: 'Du hast durch den Nebel geblickt. Das Nebel-Siegel gehört dir.' },
    champion: { name: 'Nebelkönig Nox', ace: 'geisterchen', intro: 'Niemand findet mich im Nebel. Du schon. Interessant.', defeat: 'Der Nebel lichtet sich. Weiter ins Frosttal.' },
    puzzle: { kind: 'plates', name: 'Stelzenwippen', hint: 'Die Wippen senken sich, wenn auf jeder Platte ein Schilfballen liegt.' },
    villageQuest: 'Nebelau', guild: 3,
    npcs: [
      { role: 'handwerker', name: 'Stegbauer Arvid', lines: { pre: ['Die Stege tragen dich, aber geh nicht ins Moor. Es ist tiefer, als es aussieht.'], post: ['Kira hat ihre Arena im Nebel gebaut. Typisch.'], done: ['Neue Stege für den Champion!'] } },
      { role: 'kind', name: 'Mila', lines: { pre: ['Ich hab mit einem Irrlicht gesprochen! Es hat geblinkt.'], post: ['Ist der Mann in Violett noch traurig?'], done: ['Die Irrlichter mögen dich.'] } },
      { role: 'haendler', name: 'Laternenverkäufer Jasper', lines: { pre: ['Ohne Laterne kein Weg durchs Moor.'], post: ['Für Siegelträger: Laternenöl zum halben Preis.'], done: ['Leuchte weiter!'] } },
      { role: 'reisender', name: 'Forscherin Noa', lines: { pre: ['Hier schweben sanfte Geister herum. Bringe zwei verschiedene Geist-Taschis mit.'], post: ['Die Irrlichter zeigen versteckte Wege.'], done: ['Das Moor ist voller Wunder.'] } },
      { role: 'trainer', name: 'Moorläufer Gero', lines: { pre: ['Geist-Taschis sind gegen Geist anfällig. Klingt komisch, stimmt aber.'], post: ['Kira ist schwer zu finden. Du hast sie gefunden.'], done: ['Respekt aus dem Moor.'] } },
      { role: 'familie', name: 'Familie Rohr', lines: { pre: ['Unser Haus steht auf Stelzen, damit es nicht versinkt.'], post: ['Ein Gildenmitglied saß neulich weinend am Steg. Seltsam.'], done: ['Komm zum Fischessen vorbei.'] } },
      { role: 'forscher', name: 'Professor Nebels Assistentin Hella', lines: { pre: ['Der Professor misst die Nebeldichte. Hilft er dir, hilfst du ihm.'], post: ['Brix von der Gilde hat Notizen verloren. Der Professor hat sie gefunden.'], done: ['Die Gilde will die Lichter anzapfen – steht in Brix’ Notizen.'] } }
    ],
    quests: [
      { id: 'q8_noa', title: 'Sanfte Geister', giver: 'Forscherin Noa', kind: 'catchType', type: 'geist', count: 2, legacyKey: 'Nebelau', desc: 'Bringe Forscherin Noa zwei verschiedene Geist-Taschis.', reward: { items: { taschiball: 8, trank: 4 } } },
      { id: 'q8_lantern', title: 'Die Mondlaterne', giver: 'Laternenverkäufer Jasper', kind: 'find', target: 'lostItem', desc: 'Jaspers wertvollste Laterne trieb im Moor davon.', reward: { coins: 300, keyItem: 'mondlaterne' } }
    ]
  }),
  R({
    id: 9, name: 'Frosttal', town: 'Reifenstein', types: ['eis', 'gestein'], biome: 'snow',
    palette: { grass: 0xe6eef2, grass2: 0xcfe0e6, dirt: 0xb5bfc4, rock: 0x7c8a96, sky: [0x8fb8dc, 0xf0f6fa], fog: 0xe1ecf2, water: 0x8fd0e6, roof: 0x3f5f80, wall: 0xf4f1ea, trim: 0x6a4a3a, accent: 0xbfe9ff },
    weather: ['snow', 'snow', 'clear'], ambience: 'wind', music: 'frost',
    landmark: { kind: 'frozenlake', name: 'Spiegelsee' },
    professor: { name: 'Fjella', title: 'Professorin Fjella', focus: 'Eis-Taschis und Gletscher' },
    gym: { leader: 'Rokko vom Gletscher', ace: 'panzerlon', level: 32, mechanic: 'ice', theme: 'Gletscher-Arena',
      intro: 'Eisblöcke rutschen, bis sie anstoßen. Denk zwei Züge voraus!', defeat: 'Eiskalt gespielt! Das Frost-Siegel gehört dir.' },
    champion: { name: 'Frostmeisterin Elin', ace: 'panzerlon', intro: 'Kälte macht klar im Kopf. Bist du bereit?', defeat: 'Du hast das Eis gebrochen. Das Wipfelreich ist frei.' },
    puzzle: { kind: 'ice', name: 'Rutschende Eisblöcke', hint: 'Eisblöcke gleiten, bis sie gegen etwas stoßen. Bring sie auf die Frostplatten.' },
    npcs: [
      { role: 'handwerker', name: 'Eisschnitzerin Runa', lines: { pre: ['Meine Figuren schmelzen nie – Eis-Taschis kühlen sie.'], post: ['Rokko liebt seine Eisblöcke mehr als seine Taschis. Fast.'], done: ['Eine Eisfigur von dir steht jetzt am Platz!'] } },
      { role: 'kind', name: 'Kalle', lines: { pre: ['Wir rutschen auf dem Spiegelsee! Komm mit!'], post: ['Hast du Rokkos Eisrutschen geschafft?'], done: ['Schneeballschlacht?'] } },
      { role: 'haendler', name: 'Pelzhändler Gunnar', lines: { pre: ['Warme Handschuhe für Trainer! Und Tränke, natürlich.'], post: ['Vitaltränke gibt’s ab zehn Siegeln.'], done: ['Für dich nur das Beste.'] } },
      { role: 'reisender', name: 'Bergsteigerin Frida', lines: { pre: ['Der Eiskristall, den manche Polar-Taschis zur Entwicklung brauchen, liegt in Truhen am See.'], post: ['Im Norden geht es durch den Pass ins Wipfelreich.'], done: ['Wir sehen uns auf dem nächsten Gipfel!'] } },
      { role: 'trainer', name: 'Skifahrer Lasse', lines: { pre: ['Feuer und Gestein schlagen Eis. Denk dran!'], post: ['Du hast Rokko geschlagen? Respekt!'], done: ['Abfahrt, Champion!'] } },
      { role: 'familie', name: 'Familie Frost', lines: { pre: ['Im Winter heizen wir mit Glut-Taschis aus dem Süden.'], post: ['Heißer Kakao für den Sieger?'], done: ['Du gehörst jetzt zum Tal.'] } },
      { role: 'forscher', name: 'Glaziologe Mats', lines: { pre: ['Der Gletscher wandert jedes Jahr zehn Meter. Spannend!'], post: ['Professorin Fjella sucht Eis-Taschis.'], done: ['Mein Bericht erwähnt dich lobend.'] } }
    ],
    quests: [
      { id: 'q9_ice', title: 'Kristallklar', giver: 'Professorin Fjella', kind: 'catchType', type: 'eis', count: 2, desc: 'Fange zwei Eis-Taschis für Professorin Fjellas Studie.', reward: { coins: 350, items: { eiskristall: 1, vitaltrank: 1 } } },
      { id: 'q9_glove', title: 'Kalles Handschuh', giver: 'Kalle', kind: 'find', target: 'lostItem', desc: 'Kalle hat seinen Handschuh irgendwo am Spiegelsee verloren.', reward: { coins: 250, items: { heilkraut: 4 } } }
    ]
  }),
  R({
    id: 10, name: 'Wipfelreich', town: 'Kronendorf', types: ['pflanze', 'flug'], biome: 'canopy',
    palette: { grass: 0x5aa154, grass2: 0x8cc463, dirt: 0x9a7650, rock: 0x7a7a68, sky: [0x8cc6e8, 0xe6f6dc], fog: 0xbfe0c4, water: 0x4c9f9a, roof: 0x5b8a3a, wall: 0xc9a56e, trim: 0x5a3a22, accent: 0xd6f07a },
    weather: ['clear', 'leaves', 'rain'], ambience: 'forest', music: 'canopy',
    landmark: { kind: 'bigtree', name: 'Weltenbaum' },
    professor: { name: 'Linde', title: 'Professorin Linde', focus: 'Baumkronen und Symbiose' },
    gym: { leader: 'Taro vom Waldturm', ace: 'bluetling', level: 34, mechanic: 'switches', theme: 'Baumkronen-Arena',
      intro: 'Die Seilwinden müssen alle oben sein, damit die Brücke zu mir hält.', defeat: 'Du schwebst über den Wipfeln. Das Wipfel-Siegel gehört dir.' },
    champion: { name: 'Wipfelmeister Fynn', ace: 'bluetling', intro: 'Hier oben ist die Luft dünn – und mein Team stark.', defeat: 'Wurzeln und Flügel – du hast beides. Weiter zur Donnersteppe.' },
    puzzle: { kind: 'crystals', name: 'Sonnenstrahlen der Krone', hint: 'Drehe die Blattspiegel, bis das Licht die Knospe trifft.' },
    guild: 4,
    npcs: [
      { role: 'handwerker', name: 'Brückenbauer Joris', lines: { pre: ['Alle Brücken hier sind aus lebenden Ästen geflochten.'], post: ['Taro hat den Waldturm selbst gebaut.'], done: ['Eine neue Brücke trägt jetzt deinen Namen.'] } },
      { role: 'kind', name: 'Ella', lines: { pre: ['Der Ballon! Der violette Ballon ist am Weltenbaum hängen geblieben!'], post: ['Hast du die Gilde verjagt?'], done: ['Du bist sogar höher als der Weltenbaum!'] } },
      { role: 'haendler', name: 'Saftverkäuferin Tamsin', lines: { pre: ['Frischer Apfelsaft aus den Kronen! Er heilt sogar ein bisschen.'], post: ['Für dich eine Extraflasche.'], done: ['Grüne Grüße!'] } },
      { role: 'reisender', name: 'Vogelkundlerin Ines', lines: { pre: ['Die größten Flug-Taschis nisten ganz oben im Weltenbaum.'], post: ['Selma von der Gilde hat hier nach Nestern gesucht. Gemein!'], done: ['Die Nester sind sicher.'] } },
      { role: 'trainer', name: 'Kletterer Bruno', lines: { pre: ['Mit dem Kletterhaken kommst du an markierte Felswände.'], post: ['Taro hat mich mal in drei Zügen besiegt.'], done: ['Klettern wir zusammen?'] } },
      { role: 'familie', name: 'Familie Ast', lines: { pre: ['Wir wohnen in einem Baumhaus mit drei Etagen.'], post: ['Komm hoch, es gibt Kuchen!'], done: ['Du bist hier immer willkommen.'] } },
      { role: 'forscher', name: 'Professor Lindes Gehilfe Bastian', lines: { pre: ['Die Professorin erforscht, wie Pflanzen- und Flug-Taschis zusammenleben.'], post: ['Sie möchte dir den Kletterhaken geben.'], done: ['Die Symbiose-Studie ist fertig – dank dir.'] } }
    ],
    quests: [
      { id: 'q10_nest', title: 'Nester im Weltenbaum', giver: 'Vogelkundlerin Ines', kind: 'catchType', type: 'pflanze', count: 3, desc: 'Fange drei Pflanzen-Taschis, um Ines bei ihrer Zählung zu helfen.', reward: { coins: 350, keyItem: 'kletterhaken' } },
      { id: 'q10_hat', title: 'Ellas Hut', giver: 'Ella', kind: 'find', target: 'lostItem', desc: 'Ellas Sonnenhut ist vom Baumhaus gefallen.', reward: { coins: 300, items: { superball: 5 } } }
    ]
  }),
  R({
    id: 11, name: 'Donnersteppe', town: 'Grollhagen', types: ['elektro', 'feuer'], biome: 'savanna',
    palette: { grass: 0xc2b25a, grass2: 0xd9c878, dirt: 0xc49a62, rock: 0x8f7a66, sky: [0x7b8fc4, 0xf3dcb4], fog: 0xe4d0b0, water: 0x5a90b0, roof: 0xa8452f, wall: 0xe8d2a8, trim: 0x4a3524, accent: 0xffd24a },
    weather: ['clear', 'storm', 'storm'], ambience: 'wind', music: 'thunder',
    landmark: { kind: 'stormtowers', name: 'Blitzableiter-Kreis' },
    professor: { name: 'Tessa', title: 'Professorin Tessa', focus: 'Gewitter und Steppenwanderungen' },
    gym: { leader: 'Mira vom Sturmfeld', ace: 'knister', level: 36, mechanic: 'crystals', theme: 'Blitzleiter-Arena',
      intro: 'Leite den Blitz über die Kupferstäbe in die Glocke. Dann läutet unser Kampf.', defeat: 'Das hat eingeschlagen! Das Donner-Siegel gehört dir.' },
    champion: { name: 'Donnerkönigin Ira', ace: 'knister', intro: 'Mein Donner hallt über die ganze Steppe.', defeat: 'Ein Echo deines Sieges wird lange nachhallen. Der Kristallberg wartet.' },
    puzzle: { kind: 'order', name: 'Trommeln der Steppe', hint: 'Die Totempfähle tragen Kerben. Schlage die Trommeln von wenigen zu vielen Kerben.' },
    legend: 'sturmkron',
    npcs: [
      { role: 'handwerker', name: 'Kupferschmied Amon', lines: { pre: ['Meine Blitzableiter schützen die ganze Stadt.'], post: ['Mira hat meine Kupferstäbe für ihre Arena gekauft.'], done: ['Sturmkron soll bei Gewitter über der Steppe kreisen.'] } },
      { role: 'kind', name: 'Zaid', lines: { pre: ['Wenn es donnert, verstecke ich mich nicht mehr. Ich zähle!'], post: ['Eins, zwei, drei … BUMM! Toller Kampf!'], done: ['Ich will Sturmkron sehen!'] } },
      { role: 'haendler', name: 'Karawanenhändlerin Leyla', lines: { pre: ['Meine Karawane bringt Waren aus allen Regionen.'], post: ['Für Siegelträger: Vitaltränke!'], done: ['Möge der Wind dir Rückenwind geben.'] } },
      { role: 'reisender', name: 'Nomade Tariq', lines: { pre: ['Die Herden ziehen, wenn die Gewitter kommen.'], post: ['Der Kristallberg liegt hinter den roten Felsen.'], done: ['Die Steppe ehrt dich.'] } },
      { role: 'trainer', name: 'Steppenreiterin Kima', lines: { pre: ['Erde schlägt Elektro und Feuer. Merk dir das hier draußen.'], post: ['Mira ist zäh. Du bist zäher.'], done: ['Auf ein Rennen?'] } },
      { role: 'familie', name: 'Familie Grollmann', lines: { pre: ['Unser Dach ist aus Kupfer. Es singt bei Gewitter.'], post: ['Wir haben deinen Sieg im Radio gehört!'], done: ['Bleib zum Steppenfest!'] } },
      { role: 'forscher', name: 'Wetterforscherin Zara', lines: { pre: ['Professorin Tessa zählt Blitzeinschläge.'], post: ['Die Gilde sammelt Blitzenergie in großen Batterien.'], done: ['Ohne Batterien ist die Gilde machtlos.'] } }
    ],
    quests: [
      { id: 'q11_fire', title: 'Funken und Flammen', giver: 'Professorin Tessa', kind: 'catchType', type: 'feuer', count: 3, desc: 'Registriere drei Feuer-Taschis für Professorin Tessa.', reward: { coins: 400, items: { sternball: 2 } } },
      { id: 'q11_bell', title: 'Die Steppenglocke', giver: 'Kupferschmied Amon', kind: 'find', target: 'lostItem', desc: 'Eine kleine Kupferglocke ist aus einer Karawane gefallen.', reward: { coins: 350, items: { vitaltrank: 1 } } }
    ]
  }),
  R({
    id: 12, name: 'Kristallberg', town: 'Glimmerstadt', types: ['gestein', 'geist'], biome: 'crystal',
    palette: { grass: 0x7e9a8c, grass2: 0xa3b7a6, dirt: 0x9a8f86, rock: 0x6d6a80, sky: [0x8a8fd0, 0xe8e2f6], fog: 0xcfd0e6, water: 0x6aa8d8, roof: 0x5a4f8a, wall: 0xdcd6ea, trim: 0x3b3550, accent: 0x9ef0ff },
    weather: ['clear', 'sparkle', 'clear'], ambience: 'cave', music: 'crystal',
    landmark: { kind: 'crystalspires', name: 'Kristallspitzen' },
    professor: { name: 'Granit', title: 'Professor Granit', focus: 'Mineralien und Kristall-Taschis' },
    gym: { leader: 'Nona der Kristallhöhle', ace: 'felsling', level: 38, mechanic: 'crystals', theme: 'Kristallgrotten-Arena',
      intro: 'Kristalle brechen das Licht. Brich du meine Verteidigung!', defeat: 'Du hast den Kern getroffen. Das Kristall-Siegel gehört dir.' },
    champion: { name: 'Kristallhüter Kai', ace: 'felsling', intro: 'Jeder Kristall wächst langsam. Mein Team auch – und es ist gewachsen.', defeat: 'Hart wie Diamant. Die Mondbucht liegt hinter dem Pass.' },
    puzzle: { kind: 'plates', name: 'Erzloren', hint: 'Schiebe die Erzloren auf die Gleisplatten, um die Mine zu öffnen.' },
    villageQuest: 'Kristallhain', cave: 'Kristallgrotte', guild: 5,
    npcs: [
      { role: 'handwerker', name: 'Bergführer Bruno', lines: { pre: ['Die Kristalle summen. Finde und fange zwei verschiedene Fels-Taschis.'], post: ['Nona kennt jeden Kristall beim Namen.'], done: ['Der Berg vertraut dir.'] } },
      { role: 'kind', name: 'Greta', lines: { pre: ['Ich hab eine Frau in Violett gesehen. Sie sprach von einer Maschine, die die Lichter einfängt!'], post: ['Die Frau war ganz wütend, als du kamst!'], done: ['Du hast die Lichter gerettet, oder?'] } },
      { role: 'haendler', name: 'Edelsteinhändler Rubin', lines: { pre: ['Kristallsplitter kann man nicht kaufen. Man findet sie in den Grotten.'], post: ['Sternsplitter kaufe ich zum Bestpreis.'], done: ['Funkelnde Grüße!'] } },
      { role: 'reisender', name: 'Bergsteiger Henk', lines: { pre: ['Die Kristallgrotte ist voller Wunder – und Taschis.'], post: ['Hinter dem Pass glitzert die Mondbucht.'], done: ['Gipfelglück!'] } },
      { role: 'trainer', name: 'Bergmann Kurt', lines: { pre: ['Wasser und Pflanze knacken Gestein.'], post: ['Nona hat mich zehnmal besiegt.'], done: ['Glück auf, Champion!'] } },
      { role: 'familie', name: 'Familie Quarz', lines: { pre: ['Unser Haus ist aus Kristallglas gebaut. Morgens ist es wunderschön.'], post: ['Möchtest du einen Tee aus Bergkräutern?'], done: ['Bleib, solange du möchtest.'] } },
      { role: 'forscher', name: 'Professor Granits Assistentin Opal', lines: { pre: ['Professor Granit misst die Schwingungen der Kristalle. Sie werden schwächer.'], post: ['Kommandantin Varga will die Lichter in Kristallen speichern!'], done: ['Die Schwingungen sind wieder normal.'] } }
    ],
    quests: [
      { id: 'q12_bruno', title: 'Summende Kristalle', giver: 'Bergführer Bruno', kind: 'catchType', type: 'gestein', count: 2, legacyKey: 'Kristallhain', desc: 'Fange zwei verschiedene Gestein-Taschis für Bergführer Bruno.', reward: { items: { taschiball: 8, trank: 4 } } },
      { id: 'q12_lamp', title: 'Die Grubenlampe', giver: 'Bergmann Kurt', kind: 'find', target: 'lostItem', desc: 'Kurts Grubenlampe liegt irgendwo zwischen den Kristallspitzen.', reward: { coins: 400, items: { kristallsplitter: 1 } } }
    ]
  }),
  R({
    id: 13, name: 'Mondbucht', town: 'Silberbucht', types: ['geist', 'wasser'], biome: 'bay-night',
    palette: { grass: 0x5f8f8a, grass2: 0x8ab3a6, dirt: 0xd6caa8, rock: 0x6c7488, sky: [0x26305f, 0x9aa6d8], fog: 0x8c94bf, water: 0x2f5c9a, roof: 0x3c4a7a, wall: 0xe6e8f0, trim: 0xc9cfe0, accent: 0xe0e6ff },
    weather: ['stars', 'clear', 'rain'], ambience: 'sea', music: 'moon',
    landmark: { kind: 'moonarch', name: 'Mondbogen' },
    professor: { name: 'Luna', title: 'Professorin Luna', focus: 'Gezeiten und Mondphasen' },
    gym: { leader: 'Lio der Mondbucht', ace: 'funkli', level: 40, mechanic: 'order', theme: 'Gezeiten-Arena',
      intro: 'Die Mondphasen wechseln in fester Folge. Tritt auf die Platten in der richtigen Reihenfolge.', defeat: 'Du folgst dem Mond wie die Flut. Das Mond-Siegel gehört dir.' },
    champion: { name: 'Mondmeisterin Nova', ace: 'geisterchen', intro: 'Bei Mondlicht kämpfe ich am besten. Leider für dich.', defeat: 'Der Mond verneigt sich. Weiter zur Sonnenhöhe.' },
    puzzle: { kind: 'runes', name: 'Mondphasen-Säulen', hint: 'Die Muscheln am Strand zeigen die Phase, die jede Säule tragen muss.' },
    cave: 'Mondhöhle', legend: 'mondhueter',
    npcs: [
      { role: 'handwerker', name: 'Bootsbauer Emil', lines: { pre: ['Bei Vollmond ist die Flut am höchsten. Dann baue ich nicht.'], post: ['Lio fährt jeden Abend mit dem Boot hinaus.'], done: ['Das neue Boot heißt nach dir.'] } },
      { role: 'kind', name: 'Ronja', lines: { pre: ['Der Mondbogen leuchtet nachts! Mama sagt, da wohnt ein Wächter.'], post: ['Hast du ihn gesehen? Den Wächter?'], done: ['Ich glaub, der Mondhüter mag dich.'] } },
      { role: 'haendler', name: 'Perlenhändlerin Marisol', lines: { pre: ['Silberperlen aus der Bucht! Leider nicht zum Fangen geeignet.'], post: ['Sternsplitter nehme ich gern.'], done: ['Möge dich das Mondlicht begleiten.'] } },
      { role: 'reisender', name: 'Poet Lucian', lines: { pre: ['Der Mond schreibt Gedichte auf das Wasser.'], post: ['Dein Sieg war wie ein Vers.'], done: ['Ein Lied für dich, Champion.'] } },
      { role: 'trainer', name: 'Taucherin Ayla', lines: { pre: ['Elektro und Pflanze schlagen Wasser. Geist gegen Geist ist riskant.'], post: ['Lio hat dich unterschätzt.'], done: ['Tauchen wir einmal zusammen?'] } },
      { role: 'familie', name: 'Familie Silberstrand', lines: { pre: ['Wir sammeln nachts Muscheln, wenn die Ebbe kommt.'], post: ['Unsere Muscheln zeigen Mondphasen – das hilft beim Rätsel!'], done: ['Du bist hier zu Hause.'] } },
      { role: 'forscher', name: 'Professorin Lunas Gehilfe Theo', lines: { pre: ['Die Professorin glaubt, die Gezeiten hängen mit den Lichtern zusammen.'], post: ['Brix von der Gilde wurde hier gesehen. Er wirkte verzweifelt.'], done: ['Die Gezeiten sind wieder im Gleichgewicht.'] } }
    ],
    quests: [
      { id: 'q13_moon', title: 'Silberne Gezeiten', giver: 'Professorin Luna', kind: 'catchType', type: 'wasser', count: 4, desc: 'Registriere vier Wasser-Taschis für Professorin Lunas Gezeitenatlas.', reward: { coins: 450, items: { vitaltrank: 2 } } },
      { id: 'q13_pearl', title: 'Die verlorene Perle', giver: 'Perlenhändlerin Marisol', kind: 'find', target: 'lostItem', desc: 'Marisols schönste Perle liegt irgendwo am Strand der Bucht.', reward: { coins: 500, items: { sternsplitter: 1 } } }
    ]
  }),
  R({
    id: 14, name: 'Sonnenhöhe', town: 'Sonnfeste', types: ['feuer', 'flug'], biome: 'mesa',
    palette: { grass: 0xc8b26a, grass2: 0xdcc684, dirt: 0xd49a5c, rock: 0xb46a42, sky: [0x5aa6e8, 0xffe8b8], fog: 0xf2d8b0, water: 0x4a9ad0, roof: 0xd85a2a, wall: 0xf4dcb0, trim: 0x7a3a1e, accent: 0xffb83a },
    weather: ['clear', 'clear', 'embers'], ambience: 'wind', music: 'sun',
    landmark: { kind: 'suntemple', name: 'Sonnentempel' },
    professor: { name: 'Solan', title: 'Professor Solan', focus: 'Sonnenenergie und Feuervögel' },
    gym: { leader: 'Sora vom Sonnenplateau', ace: 'glutdrach', level: 42, mechanic: 'plates', theme: 'Sonnenuhr-Arena',
      intro: 'Schiebe die Sonnensteine auf die Zeiger der Uhr. Dann ist es Zeit für unseren Kampf.', defeat: 'Du strahlst heller als die Mittagssonne. Das Sonnen-Siegel gehört dir.' },
    champion: { name: 'Sonnenmeister Sol', ace: 'glutzahn', intro: 'Die Sonne geht für jeden auf. Aber nicht jeder hält ihr stand.', defeat: 'Die letzte Region ruft: Himmelskrone!' },
    puzzle: { kind: 'crystals', name: 'Sonnenstrahl des Tempels', hint: 'Lenke das Sonnenlicht durch die Bronzespiegel in das Tempelauge.' },
    legend: 'auraflamme', guild: 6,
    npcs: [
      { role: 'handwerker', name: 'Töpferin Ines', lines: { pre: ['Ich brenne meine Krüge in der Sonne. Kein Ofen nötig!'], post: ['Sora zeichnet die Sonnenbahn jeden Tag nach.'], done: ['Ein Krug für dich, mit Sonnenmuster.'] } },
      { role: 'kind', name: 'Juri', lines: { pre: ['Auraflamme soll über dem Tempel kreisen, wenn ein wahrer Champion kommt!'], post: ['Bist du der wahre Champion?'], done: ['Ich hab es gewusst!'] } },
      { role: 'haendler', name: 'Marktfrau Sabah', lines: { pre: ['Sonnenhut, Wasser, Tränke – alles für die Hochebene!'], post: ['Der letzte Laden vor Himmelskrone – deck dich ein!'], done: ['Strahlende Grüße, Champion.'] } },
      { role: 'reisender', name: 'Brix (ehem. Schattengilde)', lines: { pre: ['Ich … ich war bei der Gilde. Ich habe die Fanggeräte gebaut. Es tut mir leid.'], post: ['Varga will am Sternengipfel alle Lichter in eine Maschine leiten. Ich gebe dir meine Zugangskarte.'], done: ['Ich arbeite jetzt für Professor Solan. Ich mache es wieder gut.'] } },
      { role: 'trainer', name: 'Falknerin Dina', lines: { pre: ['Gestein und Wasser löschen Feuer-Flug-Taschis.'], post: ['Sora hat mich mit einem Glutdrach besiegt.'], done: ['Flieg hoch, Champion!'] } },
      { role: 'familie', name: 'Familie Sonnberg', lines: { pre: ['Unsere Terrassen trocknen die besten Früchte der Region.'], post: ['Probier mal unsere Aprikosen!'], done: ['Komm zur Erntezeit wieder.'] } },
      { role: 'forscher', name: 'Professor Solans Assistentin Nia', lines: { pre: ['Der Professor misst die Sonnenstrahlung am Tempel.'], post: ['Brix hilft uns jetzt. Er weiß alles über die Gilde.'], done: ['Der Tempel strahlt wieder.'] } }
    ],
    quests: [
      { id: 'q14_flight', title: 'Feuervögel', giver: 'Professor Solan', kind: 'catchType', type: 'flug', count: 4, desc: 'Registriere vier Flug-Taschis für Professor Solans Sonnenstudie.', reward: { coins: 500, items: { sternball: 3 } } },
      { id: 'q14_jug', title: 'Der Sonnenkrug', giver: 'Töpferin Ines', kind: 'find', target: 'lostItem', desc: 'Ein Krug wurde zum Trocknen auf den Terrassen vergessen.', reward: { coins: 450, items: { aetherperle: 2 } } }
    ]
  }),
  R({
    id: 15, name: 'Himmelskrone', town: 'Wolkenhort', types: ['flug', 'feuer'], biome: 'sky',
    palette: { grass: 0x8fcf8a, grass2: 0xbfe6a8, dirt: 0xe0cfa8, rock: 0xbfb6c8, sky: [0x4f8fe0, 0xffe9d6], fog: 0xf2e6f0, water: 0x8fc8f0, roof: 0x3c5fa8, wall: 0xffffff, trim: 0xd8b04a, accent: 0xffd27a },
    weather: ['clear', 'clouds', 'clear'], ambience: 'wind', music: 'sky',
    landmark: { kind: 'skybridge', name: 'Wolkenbrücken' },
    professor: { name: 'Astra', title: 'Professorin Astra', focus: 'Die Sternenliga und die Geschichte der Lichter' },
    gym: { leader: 'Großmeisterin Aurelia', ace: 'blitzor', level: 45, mechanic: 'crystals', theme: 'Himmelsspiegel-Arena',
      intro: 'Wir sehen uns wieder. Diesmal als Großmeisterin. Lenke das Licht aller sechzehn Lichter zu mir!', defeat: 'Du bist bereit. Das sechzehnte Siegel – und der Weg zur Sternenliga – gehören dir.' },
    champion: { name: 'Himmelsmeisterin Auri', ace: 'blitzor', intro: 'Über den Wolken gibt es keine Ausreden.', defeat: 'Die Krone des Himmels ist dein. Der Sternengipfel öffnet sich.' },
    puzzle: { kind: 'switches', name: 'Wolkenlaternen', hint: 'Jede Laterne entzündet auch ihre Nachbarn. Bring alle zum Leuchten.' },
    npcs: [
      { role: 'handwerker', name: 'Wolkenweberin Alva', lines: { pre: ['Ich webe Segel aus Wolkenfäden. Sie tragen Inseln.'], post: ['Aurelia ist zurückgekehrt – als Großmeisterin!'], done: ['Ein Wolkensegel für den Champion.'] } },
      { role: 'kind', name: 'Kian', lines: { pre: ['Von hier oben sieht man die ganze Welt!'], post: ['Du hast alle sechzehn Siegel? Echt jetzt?'], done: ['Sternenmeister! Sternenmeister!'] } },
      { role: 'haendler', name: 'Himmelshändler Orion', lines: { pre: ['Die besten Waren der Welt – auf der höchsten Insel.'], post: ['Deck dich für die Sternenliga ein.'], done: ['Der Sternenmeister kauft bei mir!'] } },
      { role: 'reisender', name: 'Pilotin Liv', lines: { pre: ['Ich hab’s dir doch gesagt: Wir sehen uns in Himmelskrone!'], post: ['Der Sternengipfel liegt hinter den Wolkenbrücken.'], done: ['Was für eine Reise!'] } },
      { role: 'trainer', name: 'Himmelsritter Cassian', lines: { pre: ['Wer die Sternenliga betreten will, braucht alle sechzehn Siegel.'], post: ['Die Meisterprüfungen sind hart. Bereite dein Team gut vor.'], done: ['Ein würdiger Sternenmeister.'] } },
      { role: 'familie', name: 'Familie Zirrus', lines: { pre: ['Unser Haus schwebt. Wirklich!'], post: ['Komm zum Wolkenfest!'], done: ['Wir sind stolz auf dich.'] } },
      { role: 'forscher', name: 'Professorin Astras Archivar Sirius', lines: { pre: ['Die Sternenliga wurde vor 500 Jahren gegründet, um die Lichter zu schützen.'], post: ['Varga wurde am Sternengipfel gesehen. Beeil dich!'], done: ['Ein neues Kapitel in der Chronik – deins.'] } }
    ],
    quests: [
      { id: 'q15_dex', title: 'Chronik der Taschis', giver: 'Professorin Astra', kind: 'dexCount', count: 80, desc: 'Registriere 80 gefangene Arten im Taschidex.', reward: { coins: 1000, items: { sternball: 5 } } },
      { id: 'q15_compass', title: 'Der Wolkenkompass', giver: 'Wolkenweberin Alva', kind: 'find', target: 'lostItem', desc: 'Alvas Kompass ist auf einer der Wolkeninseln liegen geblieben.', reward: { coins: 600, items: { vitaltrank: 2 } } }
    ]
  })
];

export const GYM_ORDER = REGIONS.map(r => r.gym.leader);

// Star League (unchanged names/aces/levels from v1)
export const STAR_LEAGUE = [
  { name: 'Hüterin des Waldes', ace: 'bluetling', level: 46, types: ['pflanze', 'erde'], intro: 'Der Wald ist geduldig. Ich auch.' },
  { name: 'Hüter des Meeres', ace: 'panzerlon', level: 49, types: ['wasser', 'eis'], intro: 'Das Meer gibt nichts zurück. Ich auch nicht.' },
  { name: 'Hüterin der Berge', ace: 'felsling', level: 52, types: ['gestein', 'erde'], intro: 'Berge weichen nicht.' },
  { name: 'Hüter des Sturms', ace: 'blitzor', level: 55, types: ['elektro', 'flug'], intro: 'Spürst du die Spannung?' },
  { name: 'Sternenmeisterin Lyra', ace: 'glutdrach', level: 58, types: ['feuer', 'geist', 'normal'], intro: 'Sechzehn Lichter haben dich hierher geführt. Lass uns sehen, ob sie richtig gewählt haben.' }
];

// Route trainers from v1 (IDs 0–7 kept for save compatibility).
export const LEGACY_TRAINERS = [
  { id: 0, name: 'Jule', species: 'flatterling', level: 7, region: 0 },
  { id: 1, name: 'Finn', species: 'quappi', level: 9, region: 0 },
  { id: 2, name: 'Lea', species: 'kaeferli', level: 12, region: 1 },
  { id: 3, name: 'Ben', species: 'felsling', level: 15, region: 2 },
  { id: 4, name: 'Tina', species: 'knister', level: 19, region: 3 },
  { id: 5, name: 'Oskar', species: 'funkli', level: 23, region: 4 },
  { id: 6, name: 'Jara', species: 'geisterchen', level: 27, region: 5 },
  { id: 7, name: 'Nils', species: 'schlummi', level: 32, region: 6 }
];

export const LEGACY_CAVES = ['Flüsterhöhle', 'Bernsteingrotte', 'Kristallgrotte', 'Mondhöhle'];
