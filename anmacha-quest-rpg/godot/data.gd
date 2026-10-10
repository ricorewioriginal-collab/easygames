class_name Dat
extends RefCounted
# Karten (automatisch erzeugt): # Wand, T Hindernis/Wald, ^ Berg, ~ Wasser/Lava/Leere, . , Boden
const MAPS := {
	"welt": {"name": "Frequenzia", "theme": "town", "rows": ["~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", "~~....................................~~", "~~..,.,.....,.........................~~", "~~.~~~.........TTT.....TTTTTTT........~~", "~~..........,TTTTT......TT..TT........~~", "~~.TTT.....T.TTT^^......TT..TT........~~", "~~.........TTTT^^^..........~~........~~", "~~..~~.....TTTTTTTTTT.....T~~~.....TT.~~", "~~..~~~~~..TTTTTTT^^^TTTTTT~~~TTTTTTT.~~", "~~..~~~~~TTTTT..~~~~~TTT.,T~~~~~~~....~~", "~~.......TTTTT,.~~~~~TTT..~~~~~~~~..,.~~", "~~.,..,..TTTTT...TT..,....~~~.......,.~~", "~~.......TTTTTT..TT,,^^^^^TT~~~~~.....~~", "~~..,,^^^TT....,.TT..^^^^^TT~~~~~.....~~", "~~.~~~TT,............~~~~~TTTTT^^^^^..~~", "~~.,......,....~~~.^^^^^^^^.^^^.....,.~~", "~~........TTT..~~~.^^^^.....^TT.......~~", "~~........TT~~.........TTT............~~", "~~...........TTTTT.....TTT.~~,......,.~~", "~~.TT............~.......TTT~.........~~", "~~.TTTT^^^...,...,.......TT~~...~~~...~~", "~~.TTTT^^^..,,...........TT......,....~~", "~~....................................~~", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"], "enc": [], "rate": 0.06, "lv": 3, "world": true, "portals": [{"x": 20, "y": 21, "to": "hub", "req": "", "label": "Funkhafen", "kind": "town", "ax": 12, "ay": 13}, {"x": 7, "y": 18, "to": "rap", "req": "", "label": "Bass-Keller", "kind": "cave", "ax": 2, "ay": 14}, {"x": 33, "y": 18, "to": "schlager", "req": "boss_rap", "label": "Glitzerwiese", "kind": "cave", "ax": 2, "ay": 14}, {"x": 8, "y": 6, "to": "xmas", "req": "boss_schlager", "label": "Frosthöhle", "kind": "cave", "ax": 2, "ay": 14}, {"x": 32, "y": 6, "to": "rock", "req": "boss_xmas", "label": "Vulkanbühne", "kind": "cave", "ax": 2, "ay": 14}, {"x": 20, "y": 5, "to": "tower", "req": "boss_rock", "label": "Rauschen-Turm", "kind": "tower", "ax": 2, "ay": 14}], "npcs": [], "chests": [], "boss": {}},
	"hub": {"name": "Funkhafen", "theme": "town", "rows": ["~~~~~~~~~~~~~~~~~~~~~~~~~~", "~#....,,..............,.#~", "~#,T.....hhhT.hhh....TT.#~", "~#TT.....HSH..HDH.,..,T.#~", "~#..,.,...p...,p,....,..#~", "~#..hhh...p.TT.p..,hhh..#~", "~#..HDH,,.p....p...MDM,.#~", "~#...p..pppppppppp..p...#~", "~#...pppppppppppppppp...#~", "~#......pppppppppp.,....#~", "~#....T.pppppppppp,T.,..#~", "~#..,,..pppppppppp......#~", "~#TT........p......,..T.#~", "~#.T...T....p,.,..T,,TT,#~", "~.......,...p..,.........~", "~~~~~~~~~~~~~~~~~~~~~~~~~~"], "enc": [], "rate": 0.0, "lv": 1, "portals": [{"x": 12, "y": 14, "to": "welt", "req": "", "label": "Ausgang", "kind": "exit", "ax": 20, "ay": 22}], "npcs": [{"x": 10, "y": 5, "kind": "shop", "name": "Tonia"}, {"x": 15, "y": 9, "kind": "heal", "name": "Brunnen"}, {"x": 12, "y": 9, "kind": "elder", "name": "Alte Antenne"}, {"x": 8, "y": 10, "kind": "kid", "name": "Lotte"}, {"x": 17, "y": 10, "kind": "guard", "name": "Wache Piet"}], "chests": [], "boss": {}},
	"rap": {"name": "Bass-Keller", "theme": "rap", "rows": ["##########################", "#..........,.,..,...#....#", "#..,................#....#", "#..,.....,...,...TT.#....#", "#........TTT.T.~.~.......#", "#,.T.T..T..T.T.~~.~.#....#", "#,....TT...,.TTT...,#.,..#", "#.........,,..T,....######", "#.......TTT......,TTT.TTT#", "#..,.TTT..T...,...T......#", "#...TT~~.......TTTT.T....#", "#..,T~~~~..,TT.~~~TT.....#", "#.....~~~TT.T.~~..,......#", "#......................,.#", "#.....,.............,....#", "##########################"], "enc": ["beatbandit", "reimruepel", "bassgolem", "boombox", "graffiti", "mikspin"], "rate": 0.075, "lv": 3, "portals": [{"x": 1, "y": 14, "to": "welt", "req": "", "label": "Ausgang", "kind": "exit", "ax": 7, "ay": 19}], "npcs": [], "chests": [{"id": "rap_key", "x": 6, "y": 5, "kind": "key", "v": "key_rap", "n": 1}, {"id": "rap_c1", "x": 10, "y": 6, "kind": "item", "v": "trank", "n": 2}, {"id": "rap_c2", "x": 15, "y": 3, "kind": "gold", "v": 70}], "gate": {"x": 20, "y": 4, "key": "key_rap", "flag": "gate_rap"}, "boss": {"x": 23, "y": 2, "id": "mcdroehn", "flag": "boss_rap"}},
	"schlager": {"name": "Glitzerwiese", "theme": "schlager", "rows": ["##########################", "#.,,.,,...,.......,.#....#", "#...T...T..T.,..,,.,#....#", "#..........T........#....#", "#..,,...~~~T...T.........#", "#....,..~~...,.TTT..#.,.,#", "#...TT..T,.....,TT,.#....#", "#.TTT.TT..TT,...TTT,######", "#.,.,..~~TTTT.T.TTT.TTT,.#", "#....,.~~~TTT.T....T.....#", "#.TTTTTT,.,~~~~.TTT....,.#", "#.TTT.,,..,~~~,.TTT..,...#", "#....T..,..T,...,.....,..#", "#....T,....,......,.,.,..#", "#....,,...,..,..,,..,,...#", "##########################"], "enc": ["gecko", "schleim", "aal", "disco", "herz", "zuckerg"], "rate": 0.075, "lv": 8, "portals": [{"x": 1, "y": 14, "to": "welt", "req": "", "label": "Ausgang", "kind": "exit", "ax": 33, "ay": 19}], "npcs": [], "chests": [{"id": "schlager_key", "x": 22, "y": 13, "kind": "key", "v": "key_schlager", "n": 1}, {"id": "schlager_c1", "x": 15, "y": 8, "kind": "item", "v": "trank", "n": 2}, {"id": "schlager_c2", "x": 2, "y": 1, "kind": "gold", "v": 120}], "gate": {"x": 20, "y": 4, "key": "key_schlager", "flag": "gate_schlager"}, "boss": {"x": 23, "y": 2, "id": "koenigin", "flag": "boss_schlager"}},
	"xmas": {"name": "Frosthöhle", "theme": "xmas", "rows": ["##########################", "#...................#....#", "#....TTT......TTT...#....#", "#..T.TTT......T~~~~.#....#", "#.....TTTT...~~~~.,......#", "#...TTTTTTT..~~~....#....#", "#......T....TTTT...T#....#", "#.,,........TTTTT.TT######", "#.TTT..,.....,~~~..TTTT,.#", "#.TTT.....~~~~~~~..T~~~..#", "#..,.TTTT.~~~~......~~...#", "#...TT...............TTT.#", "#....TT...........TTTTTT.#", "#....TT............T.....#", "#...................,....#", "##########################"], "enc": ["geist", "lebkuchen", "schneemann", "eisratte", "eisspin", "zwerg"], "rate": 0.075, "lv": 13, "portals": [{"x": 1, "y": 14, "to": "welt", "req": "", "label": "Ausgang", "kind": "exit", "ax": 8, "ay": 7}], "npcs": [], "chests": [{"id": "xmas_key", "x": 7, "y": 8, "kind": "key", "v": "key_xmas", "n": 1}, {"id": "xmas_c1", "x": 23, "y": 8, "kind": "item", "v": "trank", "n": 2}, {"id": "xmas_c2", "x": 8, "y": 3, "kind": "gold", "v": 170}], "gate": {"x": 20, "y": 4, "key": "key_xmas", "flag": "gate_xmas"}, "boss": {"x": 23, "y": 2, "id": "frostmod", "flag": "boss_xmas"}},
	"rock": {"name": "Vulkanbühne", "theme": "rock", "rows": ["##########################", "#.....,.,...........#....#", "#.T,T......TTTTT..TT#....#", "#.TTT~~~.,.T~~T...T.#....#", "#.T..~~T,...~~...........#", "#.T............T..~.#....#", "#..TTT.TT......T..~~#...,#", "#.TT.T,TTTT...T.....######", "#,TT.T..T~~.~~~TT........#", "#....TT..~~~~~~TT.TT.....#", "#....TT...........TT.....#", "#..T.........,,,..~~~....#", "#....TT......T....~~T.,..#", "#.....T.,................#", "#........,...............#", "##########################"], "enc": ["gargoyle", "mole", "verstaerker", "rifffled", "daemon", "roadie"], "rate": 0.075, "lv": 18, "portals": [{"x": 1, "y": 14, "to": "welt", "req": "", "label": "Ausgang", "kind": "exit", "ax": 32, "ay": 7}], "npcs": [], "chests": [{"id": "rock_key", "x": 18, "y": 8, "kind": "key", "v": "key_rock", "n": 1}, {"id": "rock_c1", "x": 11, "y": 6, "kind": "item", "v": "trank", "n": 2}, {"id": "rock_c2", "x": 20, "y": 13, "kind": "gold", "v": 220}], "gate": {"x": 20, "y": 4, "key": "key_rock", "flag": "gate_rock"}, "boss": {"x": 23, "y": 2, "id": "riff", "flag": "boss_rock"}},
	"tower": {"name": "Rauschen-Turm", "theme": "static", "rows": ["##########################", "#,..................#....#", "#,...TTTTTT......T..#....#", "#...TT....,......T..#....#", "#...TT~....TTT...........#", "#.....~~.........TT.#....#", "#,..,T.T...~~.....T,#....#", "#........T~~~.TT..,.######", "#,...TTTTTT...TT.......T.#", "#....TT~~~..T.,,.T....TT.#", "#...TTT~~~~T....TT,~~~,..#", "#..TTT,..TTT....,.T~..T.T#", "#.......TTT.TT........,..#", "#........................#", "#.....,..,.......,.......#", "##########################"], "enc": ["schemen", "stoersignal", "kreischer", "antspin", "rausritter", "zyklop"], "rate": 0.075, "lv": 23, "portals": [{"x": 1, "y": 14, "to": "welt", "req": "", "label": "Ausgang", "kind": "exit", "ax": 20, "ay": 6}], "npcs": [], "chests": [{"id": "tower_key", "x": 16, "y": 14, "kind": "key", "v": "key_tower", "n": 1}, {"id": "tower_c1", "x": 15, "y": 9, "kind": "item", "v": "trank", "n": 2}, {"id": "tower_c2", "x": 16, "y": 4, "kind": "gold", "v": 270}], "gate": {"x": 20, "y": 4, "key": "key_tower", "flag": "gate_tower"}, "boss": {"x": 23, "y": 2, "id": "rauschen", "flag": "boss_tower"}}
}

# Helden: Basiswerte + Wachstum pro Level (pal: Haare, Haut, Kleidung, Kleidung dunkel, Stiefel, Akzent)
const HEROES := {
	"andrew": {"name": "Andrew", "col": "#3a9bff", "hair": "#5a3a1a", "acc": "#ff4a4a", "hp": 62, "hpg": 16.0, "sp": 10, "spg": 3.0, "atk": 12, "atkg": 3.2, "def": 6, "defg": 2.2, "mag": 4, "magg": 1.0, "spd": 7, "spdg": 0.6, "skills": ["wucht", "rund"], "ip": "ip_andrew", "role": "Held"},
	"marco": {"name": "Marco", "col": "#9a4cff", "hair": "#e8c84a", "acc": "#ff5ad0", "hp": 42, "hpg": 10.0, "sp": 24, "spg": 6.0, "atk": 6, "atkg": 1.6, "def": 4, "defg": 1.4, "mag": 13, "magg": 3.4, "spd": 8, "spdg": 0.7, "skills": ["funke", "welle"], "ip": "ip_marco", "role": "Magier"},
	"teresa": {"name": "Teresa", "col": "#2fc98c", "hair": "#ff5a8a", "acc": "#fff04a", "hp": 50, "hpg": 12.0, "sp": 22, "spg": 5.5, "atk": 8, "atkg": 2.0, "def": 5, "defg": 1.8, "mag": 10, "magg": 3.0, "spd": 6, "spdg": 0.6, "skills": ["heilton", "chor"], "ip": "ip_teresa", "role": "Heilerin"},
	"rico": {"name": "Rico", "col": "#ff9a2a", "hair": "#2a2a3a", "acc": "#35e0ff", "hp": 52, "hpg": 13.0, "sp": 16, "spg": 4.0, "atk": 11, "atkg": 2.8, "def": 5, "defg": 1.8, "mag": 6, "magg": 1.6, "spd": 11, "spdg": 0.9, "skills": ["doppel", "streu"], "ip": "ip_rico", "role": "Schütze"},
	"andy": {"name": "Andy", "col": "#d04a4a", "hair": "#8a8a96", "acc": "#ffd24a", "hp": 80, "hpg": 20.0, "sp": 8, "spg": 2.0, "atk": 10, "atkg": 2.6, "def": 9, "defg": 3.0, "mag": 3, "magg": 0.8, "spd": 4, "spdg": 0.4, "skills": ["schild", "bollwerk"], "ip": "ip_andy", "role": "Wächter"}
}
const JOINS := [["boss_rap", "teresa", "Eine junge Frau mit pinkem Haar wartet am Brunnen. \"Ich bin Teresa, Heilerin vom Funkhafen. Ich habe euren Kampf im Bass-Keller gespürt – nehmt mich mit!\""],
	["boss_schlager", "rico", "Ein Schütze lehnt lässig am Tor. \"Rico. Funk-Scharfschütze. Die Glitzerwiese war meine Heimat – ich helfe euch, den Rest zu befreien.\""],
	["boss_xmas", "andy", "Ein hünenhafter Wächter tritt aus dem Schatten. \"Andy. Ich habe die Frosthöhle bewacht. Ohne Weihnachtsfrieden ist mein Schild nutzlos – ich komme mit!\""]]
# Fertigkeiten: kind phys|mag|heal|guard, all = alle Ziele, hits = Mehrfachtreffer
const SKILLS := {
	"wucht": {"name": "Wuchtschlag", "sp": 4, "kind": "phys", "mult": 1.9, "all": false},
	"rund": {"name": "Rundumschlag", "sp": 8, "kind": "phys", "mult": 1.15, "all": true},
	"funke": {"name": "Funkenblitz", "sp": 4, "kind": "mag", "mult": 2.2, "all": false},
	"welle": {"name": "Störwelle", "sp": 9, "kind": "mag", "mult": 1.35, "all": true},
	"heilton": {"name": "Heilton", "sp": 4, "kind": "heal", "mult": 3.2, "all": false},
	"chor": {"name": "Chorus", "sp": 9, "kind": "heal", "mult": 1.8, "all": true},
	"doppel": {"name": "Doppelschuss", "sp": 5, "kind": "phys", "mult": 1.15, "all": false, "hits": 2},
	"streu": {"name": "Streufeuer", "sp": 8, "kind": "phys", "mult": 1.05, "all": true},
	"schild": {"name": "Schildschlag", "sp": 3, "kind": "phys", "mult": 1.5, "all": false},
	"bollwerk": {"name": "Bollwerk", "sp": 7, "kind": "guard", "mult": 0.0, "all": true}
}
# IP-Spezialattacken: IP füllt sich, wenn ein Held Schaden nimmt
const IPSKILLS := {
	"ip_andrew": {"name": "Funkenhieb", "ip": 40, "kind": "phys", "mult": 3.4, "all": false},
	"ip_marco": {"name": "Supernova", "ip": 60, "kind": "mag", "mult": 2.5, "all": true},
	"ip_teresa": {"name": "Segenssong", "ip": 50, "kind": "heal", "mult": 99.0, "all": true},
	"ip_rico": {"name": "Salvenfeuer", "ip": 50, "kind": "phys", "mult": 2.4, "all": true},
	"ip_andy": {"name": "Titanenschlag", "ip": 40, "kind": "phys", "mult": 4.2, "all": false}
}
const ITEMS := {
	"trank": {"name": "Trank", "price": 20, "desc": "Heilt 70 LP"},
	"aether": {"name": "Ätherchip", "price": 60, "desc": "Gibt 20 SP"},
	"weck": {"name": "Weckruf", "price": 120, "desc": "Belebt einen Helden"}
}
const KEYNAMES := {"key_rap": "Bass-Schlüssel", "key_schlager": "Glitzer-Schlüssel", "key_xmas": "Frost-Schlüssel", "key_rock": "Riff-Schlüssel", "key_tower": "Rausch-Schlüssel"}
# Gegner: lv bestimmt die Werte, *m = Multiplikatoren. 3D-Modell: dir/model (Quaternius Cute Animated Monsters bzw. Animated Monster Pack, CC0), tint = Farbvariante, h = Höhe in Feldern
const ENEMIES := {
	"beatbandit": {"name": "Beat-Panda", "lv": 1, "hpm": 1.0, "atkm": 1.0, "defm": 1.0, "dir": "cute", "model": "Panda", "tint": "", "h": 1.0},
	"reimruepel": {"name": "Reim-Schwein", "lv": 2, "hpm": 1.0, "atkm": 1.1, "defm": 0.9, "dir": "cute", "model": "Pig", "tint": "", "h": 1.0},
	"bassgolem": {"name": "Bass-Yeti", "lv": 3, "hpm": 1.5, "atkm": 1.0, "defm": 1.4, "dir": "cute", "model": "Yeti", "tint": "#6a7ad8", "h": 1.35},
	"boombox": {"name": "Mikro-Kaktus", "lv": 1, "hpm": 1.2, "atkm": 1.1, "defm": 1.0, "dir": "cute", "model": "Cactus", "tint": "", "h": 1.0},
	"graffiti": {"name": "Graffiti-Geist", "lv": 2, "hpm": 0.8, "atkm": 1.2, "defm": 0.8, "dir": "cute", "model": "Ghost", "tint": "#ff9ad8", "h": 1.0},
	"mikspin": {"name": "Bass-Pinguin", "lv": 3, "hpm": 1.0, "atkm": 1.1, "defm": 1.0, "dir": "cute", "model": "Penguin", "tint": "#9a9aff", "h": 1.0},
	"gecko": {"name": "Glitzer-Krabbe", "lv": 7, "hpm": 1.1, "atkm": 1.0, "defm": 1.1, "dir": "cute", "model": "Crab", "tint": "#ff7ac8", "h": 1.0},
	"schleim": {"name": "Schunkel-Schleim", "lv": 8, "hpm": 1.3, "atkm": 0.9, "defm": 1.1, "dir": "monsters4", "model": "Slime", "tint": "#ffe36b", "h": 1.05},
	"aal": {"name": "Akkordeon-Pilz", "lv": 9, "hpm": 1.1, "atkm": 1.2, "defm": 1.0, "dir": "cute", "model": "Mushroom", "tint": "", "h": 1.0},
	"disco": {"name": "Disco-Biene", "lv": 7, "hpm": 0.8, "atkm": 1.2, "defm": 0.8, "dir": "cute", "model": "Bee", "tint": "#ff9ae8", "h": 1.0},
	"herz": {"name": "Herz-Hirsch", "lv": 8, "hpm": 1.3, "atkm": 1.1, "defm": 1.3, "dir": "cute", "model": "Deer", "tint": "#ffb0c0", "h": 1.1},
	"zuckerg": {"name": "Zuckerwatte-Küken", "lv": 9, "hpm": 0.9, "atkm": 1.2, "defm": 0.9, "dir": "cute", "model": "Chicken", "tint": "#ffc0e8", "h": 0.9},
	"geist": {"name": "Glöckchen-Geist", "lv": 12, "hpm": 0.9, "atkm": 1.1, "defm": 0.9, "dir": "cute", "model": "Ghost", "tint": "#bfe8ff", "h": 1.0},
	"lebkuchen": {"name": "Tannen-Wicht", "lv": 13, "hpm": 1.5, "atkm": 1.0, "defm": 1.4, "dir": "cute", "model": "Tree", "tint": "", "h": 1.2},
	"schneemann": {"name": "Schneemann-Yeti", "lv": 14, "hpm": 1.2, "atkm": 1.2, "defm": 1.0, "dir": "cute", "model": "Yeti", "tint": "", "h": 1.3},
	"eisratte": {"name": "Eis-Fledermaus", "lv": 12, "hpm": 1.0, "atkm": 1.2, "defm": 0.9, "dir": "cute", "model": "Bat", "tint": "#a0d8ff", "h": 1.0},
	"eisspin": {"name": "Rentier-Rüpel", "lv": 13, "hpm": 1.0, "atkm": 1.2, "defm": 1.0, "dir": "cute", "model": "Deer", "tint": "#d8c8a0", "h": 1.1},
	"zwerg": {"name": "Zipfel-Dämon", "lv": 14, "hpm": 1.1, "atkm": 1.2, "defm": 1.0, "dir": "cute", "model": "Demon", "tint": "#c03a3a", "h": 1.0},
	"gargoyle": {"name": "Riff-Dämon", "lv": 17, "hpm": 1.1, "atkm": 1.1, "defm": 1.1, "dir": "cute", "model": "GreenDemon", "tint": "", "h": 1.1},
	"mole": {"name": "Moshpit-Zyklop", "lv": 18, "hpm": 1.3, "atkm": 1.1, "defm": 1.1, "dir": "cute", "model": "Cyclops", "tint": "", "h": 1.2},
	"verstaerker": {"name": "Verstärker-Skelett", "lv": 19, "hpm": 1.5, "atkm": 1.2, "defm": 1.3, "dir": "monsters4", "model": "Skeleton", "tint": "", "h": 1.4},
	"rifffled": {"name": "Riff-Fledermaus", "lv": 17, "hpm": 0.8, "atkm": 1.3, "defm": 0.8, "dir": "cute", "model": "Bat", "tint": "#5a4a6a", "h": 1.0},
	"daemon": {"name": "Headbanger-Totenkopf", "lv": 18, "hpm": 1.3, "atkm": 1.3, "defm": 1.0, "dir": "cute", "model": "Skull", "tint": "#ff9a5a", "h": 1.0},
	"roadie": {"name": "Roadie-Kraken", "lv": 19, "hpm": 0.9, "atkm": 1.2, "defm": 0.9, "dir": "cute", "model": "Cthulhu", "tint": "#7a5ad8", "h": 1.2},
	"schemen": {"name": "Statik-Alien", "lv": 22, "hpm": 1.0, "atkm": 1.1, "defm": 1.0, "dir": "cute", "model": "Alien", "tint": "#c0c0d0", "h": 1.0},
	"stoersignal": {"name": "Störsignal-Alien", "lv": 23, "hpm": 1.3, "atkm": 1.1, "defm": 1.1, "dir": "cute", "model": "Alien_Tall", "tint": "#7cff9a", "h": 1.2},
	"kreischer": {"name": "Pegel-Kreischer", "lv": 24, "hpm": 1.5, "atkm": 1.2, "defm": 1.2, "dir": "cute", "model": "Bat", "tint": "#ffffff", "h": 1.1},
	"antspin": {"name": "Antennen-Käfer", "lv": 22, "hpm": 1.0, "atkm": 1.3, "defm": 1.0, "dir": "cute", "model": "Bee", "tint": "#7cff9a", "h": 1.0},
	"rausritter": {"name": "Rausch-Skelett", "lv": 23, "hpm": 1.3, "atkm": 1.2, "defm": 1.3, "dir": "monsters4", "model": "Skeleton", "tint": "#c0c8d8", "h": 1.5},
	"zyklop": {"name": "Pixel-Zyklop", "lv": 24, "hpm": 1.5, "atkm": 1.2, "defm": 1.2, "dir": "cute", "model": "Cyclops", "tint": "#7cffb0", "h": 1.3},
	"mcdroehn": {"name": "MC Dröhn", "lv": 5, "hpm": 4.2, "atkm": 1.15, "defm": 1.2, "boss": true, "spec": ["Bass-Drop", 0.85, true], "dir": "cute", "model": "Demon", "tint": "#ff4a6a", "h": 2.4},
	"koenigin": {"name": "Königin Schunkel", "lv": 10, "hpm": 6.0, "atkm": 1.4, "defm": 1.2, "boss": true, "spec": ["Schlager-Schmalz", 0.85, true], "dir": "cute", "model": "YellowDragon", "tint": "#ff6ac0", "h": 2.6},
	"frostmod": {"name": "Der Frost-Moderator", "lv": 15, "hpm": 6.5, "atkm": 1.55, "defm": 1.2, "boss": true, "spec": ["Eiszeit-Jingle", 0.85, true], "dir": "cute", "model": "Yeti", "tint": "#6ad0ff", "h": 2.8},
	"riff": {"name": "Riff-Titan", "lv": 20, "hpm": 7.0, "atkm": 1.7, "defm": 1.2, "boss": true, "spec": ["Feedback-Sturm", 0.85, true], "dir": "monsters4", "model": "Dragon", "tint": "#ff5030", "h": 3.4},
	"rauschen": {"name": "Das Große Rauschen", "lv": 26, "hpm": 9.0, "atkm": 1.85, "defm": 1.25, "boss": true, "spec": ["Weißes Rauschen", 0.9, true], "dir": "cute", "model": "Cthulhu", "tint": "#e8e8f8", "h": 3.4}
}
# Farben je Kartenthema: Boden1, Boden2, Wand, Hindernis, Akzent, Hindernisart(0 Baum,1 Box,2 Kristall,3 Fels)
const THEMES := {
	"town": ["#3f8f4a", "#3a8644", "#2a5a6a", "#1f6a35", "#ffd24a", 0],
	"rap": ["#2a2438", "#2f2a42", "#14101e", "#0c0a14", "#ff4a6a", 1],
	"schlager": ["#e8a3c8", "#e29abf", "#a04a80", "#ffd24a", "#ff3aa0", 2],
	"xmas": ["#cfe8f6", "#c2dff0", "#4a7a9a", "#2f8a4a", "#ff3a3a", 0],
	"rock": ["#3a2a28", "#42302c", "#1a0f0e", "#6a3a2a", "#ff7a1a", 3],
	"static": ["#2a2e36", "#30343e", "#10121a", "#505868", "#7cff9a", 1]
}
