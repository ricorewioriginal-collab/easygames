/*! AnMaCha Spiel-Erfolge – die EIGENEN Erfolge einzelner Spiele, rein lesend aus deren Spielständen (localStorage), damit die Erfolge-Seite (erfolge.html)
 * sie neben den spielübergreifenden Erfolgen listet und zählt. An den Spielen ändert sich nichts.
 * Zwei Wege:
 *  1) Registry REG (unten): je Spiel Schlüssel, Lesefunktion (Rohstring → {erfolgsId: Zeit in ms | 1}) und die Liste der Erfolge (Symbol, Name, Beschreibung).
 *     Neue Spiele mit eigenem Erfolgssystem hier eintragen (cloud-ID wie in sync/catalog.json). Getestet in tools/test-gameach.mjs.
 *  2) Standard für NEUE Spiele ohne Eintrag: das Spiel schreibt localStorage 'anmacha-gameach.<cloud-id>' = JSON
 *     { "t": "Spielname", "d": [ { "id": "...", "icon": "🏅", "title": "...", "desc": "..." } ], "u": { "<id>": <Zeit in ms> } }
 *     (d = alle Erfolge, u = freigeschaltete). Die Seite listet sie automatisch. Details: cloud/README.md.
 * Erfolge, die ein Spiel aus dem Spielstand berechnet (Gay Life, Taschi), haben keine Zeit: Wert 1. */
(function (root) {
  'use strict';
  var LS = null;
  try { LS = root.localStorage; } catch (e) {}

  var REG = {
    // Spielstand ist JSON-String in wobbelSave1; Erfolge unter Feld "ach": {id: Date.now()}. Belohnung (Muscheln) wird hier nicht gelistet. Welt-Erfolge w0..w5 (6 Welten, dynamisch aus WORLDS).
    "wobbel": {
      title: "Wobbel", keys: ["wobbelSave1"],
      read: function (raw) { try{var d=JSON.parse(raw);var a=d&&typeof d==='object'?d.ach:null;var o={};if(a&&typeof a==='object')for(var k in a){var v=a[k];if(v)o[k]=(typeof v==='number'&&v>1)?v:1;}return o;}catch(e){return {};} },
      defs: [
      {id:"first",icon:"👣",title:"Erste Schritte",desc:"Löse dein erstes Level."},
      {id:"ten",icon:"🔟",title:"Warmgelaufen",desc:"Löse 10 Level."},
      {id:"thirty",icon:"🏃",title:"Dauerläufer",desc:"Löse 30 Level."},
      {id:"all",icon:"🏆",title:"Wobbel-Meister",desc:"Löse alle Level."},
      {id:"stars",icon:"⭐",title:"Sternesammler",desc:"Sammle 30 Sterne."},
      {id:"stars2",icon:"🌟",title:"Sternenhimmel",desc:"Sammle 100 Sterne."},
      {id:"perfect",icon:"💎",title:"Perfektionist",desc:"Hole 3 Sterne in 10 Leveln."},
      {id:"clean",icon:"🧠",title:"Ohne Wenn und Aber",desc:"Löse 5 Level (ab 10 Zügen) ganz ohne Rückgängig."},
      {id:"w0",icon:"🌳",title:"Wiesenhain gemeistert",desc:"Löse alle Level der Welt „Wiesenhain\"."},
      {id:"w1",icon:"🏖️",title:"Sandstrand gemeistert",desc:"Löse alle Level der Welt „Sandstrand\"."},
      {id:"w2",icon:"🎨",title:"Farbfabrik gemeistert",desc:"Löse alle Level der Welt „Farbfabrik\"."},
      {id:"w3",icon:"❄️",title:"Eishöhle gemeistert",desc:"Löse alle Level der Welt „Eishöhle\"."},
      {id:"w4",icon:"🏰",title:"Zauberschloss gemeistert",desc:"Löse alle Level der Welt „Zauberschloss\"."},
      {id:"w5",icon:"🏛️",title:"Alte Ruinen gemeistert",desc:"Löse alle Level der Welt „Alte Ruinen\"."},
      {id:"bonus1",icon:"🎮",title:"Spielkind",desc:"Spiele jedes Bonusspiel einmal."},
      {id:"bonus2",icon:"🕹",title:"Bonus-Fan",desc:"Spiele 20 Bonusrunden."},
      {id:"shop",icon:"🛍",title:"Modebewusst",desc:"Kaufe 3 Dinge im Laden."},
      {id:"shop2",icon:"👑",title:"Königlich",desc:"Kaufe 8 Dinge im Laden."},
      {id:"builder",icon:"🛠",title:"Baumeister",desc:"Speichere ein eigenes Level im Editor."},
      {id:"builder2",icon:"🧩",title:"Rätselbauer",desc:"Löse ein selbst gebautes Level."},
      {id:"streak3",icon:"🔥",title:"Dranbleiber",desc:"Löse 3 Tage in Folge das Tageslevel."},
      {id:"streak7",icon:"☀️",title:"Wochensieger",desc:"Löse 7 Tage in Folge das Tageslevel."},
      {id:"fast",icon:"⚡",title:"Blitzschnell",desc:"Löse ein Level (ab 10 Zügen) in unter 15 Sekunden."},
      {id:"community",icon:"🌍",title:"Weltenbummler",desc:"Löse ein Community-Level."}
      ]
    },
    // Spielstand = Sim.save(S) als JSON-String; Erfolge in Feld "ach": {id:true} (kein Zeitstempel, daher Wert 1). Zusätzlich je Erfolg Geldbelohnung im Spiel (nicht gelistet). Titel im Spiel: Panel-Überschrift "Markthalle 24 – AnMaCha".
    "markthalle": {
      title: "AnMaCha Markthalle 24", keys: ["amh_save_v1"],
      read: function (raw) { try{var d=JSON.parse(raw);var a=d&&typeof d==='object'?d.ach:null;var o={};if(a&&typeof a==='object'&&!Array.isArray(a))for(var k in a){if(a[k])o[k]=1;}return o;}catch(e){return {};} },
      defs: [
      {id:"tag1",icon:"🌅",title:"Erster Feierabend",desc:"Schließe deinen ersten Tag ab."},
      {id:"stufe5",icon:"⭐",title:"Aufsteiger",desc:"Erreiche Stufe 5."},
      {id:"stufe10",icon:"🏅",title:"Marktleiter",desc:"Erreiche Stufe 10."},
      {id:"umsatz500",icon:"💶",title:"Guter Tag",desc:"Mache an einem Tag 500 € Umsatz."},
      {id:"umsatz2000",icon:"💰",title:"Rekordtag",desc:"Mache an einem Tag 2.000 € Umsatz."},
      {id:"team3",icon:"👥",title:"Kleines Team",desc:"Beschäftige 3 Mitarbeiter."},
      {id:"ruf4",icon:"😍",title:"Beliebter Laden",desc:"Erreiche 4 Sterne Ruf."},
      {id:"rezept10",icon:"🍝",title:"Hobbykoch-Dealer",desc:"Erfülle 10 Rezept-Einkäufe."},
      {id:"dieb5",icon:"🚔",title:"Scharfe Augen",desc:"Erwische 5 Ladendiebe."},
      {id:"anbau2",icon:"🏗️",title:"Platz da!",desc:"Baue den Laden zweimal aus."},
      {id:"radio",icon:"📻",title:"Auf Sendung",desc:"Kaufe das Radiostudio."},
      {id:"stamm25",icon:"❤️",title:"Familienbetrieb",desc:"Gewinne 25 Stammkunden."},
      {id:"buzz",icon:"🔥",title:"Gesprächsthema",desc:"Erreiche einen Online-Hype von +20 %."},
      {id:"kunden1000",icon:"🧑‍🤝‍🧑",title:"Tausendsassa",desc:"Bediene insgesamt 1.000 Kunden."},
      {id:"jugend5",icon:"🪪",title:"Jugendschützer",desc:"Lehne 5 Verkäufe an Minderjährige ab."},
      {id:"recycling",icon:"♻️",title:"Recycling-Profi",desc:"Entsorge 50 leere Kartons im Container."},
      {id:"reich",icon:"💎",title:"Kleiner Millionär",desc:"Habe 10.000 € auf dem Konto."},
      {id:"pre10",icon:"📋",title:"Lieferprofi",desc:"Liefere 10 Vorbestellungen aus."}
      ]
    },
    // Profil als JSON-String in "ricopoly.v1.profile"; Erfolge in Feld "achievements": {id: Date.now()}. Texte aus i18n DE (ach.<id>, ach.<id>.d); icon aus profile.js ACH. Erfolge schalten nur Figuren frei.
    "ricopoly": {
      title: "RicoPoly 3D", keys: ["ricopoly.v1.profile"],
      read: function (raw) { try{var d=JSON.parse(raw);var a=d&&typeof d==='object'?d.achievements:null;var o={};if(a&&typeof a==='object'&&!Array.isArray(a))for(var k in a){var v=a[k];if(v)o[k]=(typeof v==='number'&&v>1)?v:1;}return o;}catch(e){return {};} },
      defs: [
      {id:"first_game",icon:"🎲",title:"Erste Partie",desc:"Spiele eine Partie zu Ende. Schaltet den Drachen frei."},
      {id:"first_win",icon:"🏆",title:"Erster Sieg",desc:"Gewinne eine Partie. Schaltet den Androiden frei."},
      {id:"ten_wins",icon:"👑",title:"Imperator",desc:"Gewinne 10 Partien."},
      {id:"first_group",icon:"🧩",title:"Komplett!",desc:"Besitze eine ganze Farbgruppe. Schaltet den Ritter frei."},
      {id:"trade_ok",icon:"🤝",title:"Händler",desc:"Schließe einen Handel ab. Schaltet die Katze frei."},
      {id:"big_auction",icon:"🔨",title:"Hammerpreis",desc:"Ersteigere etwas für mindestens 300 RC."},
      {id:"rich",icon:"💰",title:"Millionär im Kleinen",desc:"Erreiche 5.000 RC Vermögen."},
      {id:"low_start_win",icon:"🪙",title:"Aus wenig viel",desc:"Gewinne mit höchstens 800 RC Startgeld."},
      {id:"streak3",icon:"🔥",title:"Serie",desc:"Gewinne 3 Partien hintereinander."},
      {id:"beat_hard",icon:"🧠",title:"Meisterhirn",desc:"Besiege einen schweren Computergegner."},
      {id:"tutorial_done",icon:"🎓",title:"Gelernt ist gelernt",desc:"Schließe das Tutorial ab."},
      {id:"all_worlds",icon:"🌍",title:"Weltenbummler",desc:"Spiele in allen drei Welten."},
      {id:"online_game",icon:"🌐",title:"Vernetzt",desc:"Spiele eine Online-Partie zu Ende."},
      {id:"hotel",icon:"🏨",title:"Hotelier",desc:"Baue dein erstes Hotel."}
      ]
    },
    // Echtes Erfolgssystem (Panel Aufgaben > Erfolge, 18 Meilensteine aus Lebenszeit-Statistik). Speicherformat: JSON {sum:Prüfsumme,city:"<JSON-String des Stadtstands>"}, Erfolge in city.achievements = Array von IDs (ohne Zeit, daher Wert 1). Die Beschreibungen zei
    "ricoville": {
      title: "RicoVille", keys: ["ricoville.save.main"],
      read: function (raw) { try{if(typeof raw!=='string'||!raw)return {};var w=JSON.parse(raw);var c=w&&w.city;var s=typeof c==='string'?JSON.parse(c):(w&&typeof w==='object'?w:null);var a=s&&s.achievements;if(!Array.isArray(a))return {};var r={};a.forEach(function(k){if(typeof k==='string')r[k]=1;});return r;}catch(e){return {};} },
      defs: [
      {id:"a_rent10",icon:"🏠",title:"Hausverwaltung",desc:"Kassiere insgesamt 10-mal Miete."},
      {id:"a_rent100",icon:"👑",title:"Mietkönig",desc:"Kassiere insgesamt 100-mal Miete."},
      {id:"a_rent1000",icon:"🏙️",title:"Immobilienlegende",desc:"Kassiere insgesamt 1000-mal Miete."},
      {id:"a_harv50",icon:"🌾",title:"Erntehelfer",desc:"Ernte insgesamt 50 Feldfrüchte."},
      {id:"a_harv500",icon:"🚜",title:"Großbauer",desc:"Ernte insgesamt 500 Feldfrüchte."},
      {id:"a_harv5000",icon:"🏆",title:"Kornkammer",desc:"Ernte insgesamt 5000 Feldfrüchte."},
      {id:"a_shop25",icon:"🛍️",title:"Kaufmann",desc:"Kassiere insgesamt 25-mal in deinen Geschäften."},
      {id:"a_shop250",icon:"💰",title:"Handelsfürst",desc:"Kassiere insgesamt 250-mal in deinen Geschäften."},
      {id:"a_prod50",icon:"🏭",title:"Fabrikant",desc:"Stelle insgesamt 50 Waren her."},
      {id:"a_prod500",icon:"⚙️",title:"Industriekapitän",desc:"Stelle insgesamt 500 Waren her."},
      {id:"a_order10",icon:"🚂",title:"Logistiker",desc:"Schließe insgesamt 10 Lieferaufträge ab."},
      {id:"a_order100",icon:"✈️",title:"Weltspediteur",desc:"Schließe insgesamt 100 Lieferaufträge ab."},
      {id:"a_road100",icon:"🛣️",title:"Straßenbauer",desc:"Lege insgesamt 100 Straßenstücke an."},
      {id:"a_deco50",icon:"🌷",title:"Stadtgärtner",desc:"Setze insgesamt 50 Dekorationen."},
      {id:"a_deco300",icon:"🎨",title:"Gestaltungsgenie",desc:"Setze insgesamt 300 Dekorationen."},
      {id:"a_expand5",icon:"🗺️",title:"Landvermesser",desc:"Erschließe insgesamt 5 Gebiete."},
      {id:"a_up10",icon:"🔧",title:"Modernisierer",desc:"Baue Gebäude insgesamt 10-mal aus."},
      {id:"a_coins",icon:"💎",title:"Erste Million",desc:"Verdiene insgesamt 1.000.000 Münzen."}
      ]
    },
    // JSON-Objekt {achievements:{id:Zeitstempel ms}, stats, ...}; im Spiel 🏆 bei freigeschaltet, 🔒 sonst (kein eigenes Icon je Erfolg, daher 🏆). Einige Erfolge schalten Kosmetik frei (Hut/Spur/Würfel). Backup-Schlüssel partyverse.save.backup wird ignoriert.
    "partyverse": {
      title: "Partyverse", keys: ["partyverse.save"],
      read: function (raw) { try{if(typeof raw!=='string'||!raw)return {};var d=JSON.parse(raw);var a=d&&d.achievements;if(!a||typeof a!=='object'||Array.isArray(a))return {};var r={};Object.keys(a).forEach(function(k){var v=a[k];if(typeof v==='number'&&isFinite(v))r[k]=v;});return r;}catch(e){return {};} },
      defs: [
      {id:"erstes-spiel",icon:"🏆",title:"Erster Schritt",desc:"Beende deine erste Partie."},
      {id:"stammgast",icon:"🏆",title:"Stammgast",desc:"Beende 10 Partien."},
      {id:"veteran",icon:"🏆",title:"Veteran",desc:"Beende 50 Partien."},
      {id:"erster-sieg",icon:"🏆",title:"Erster Triumph",desc:"Gewinne eine Partie."},
      {id:"serienmeister",icon:"🏆",title:"Serienmeister",desc:"Gewinne 10 Partien."},
      {id:"unbesiegbar",icon:"🏆",title:"Unbesiegbar",desc:"Gewinne 25 Partien."},
      {id:"minispieler",icon:"🏆",title:"Minispieler",desc:"Spiele 10 Minispiele."},
      {id:"minispiel-profi",icon:"🏆",title:"Minispiel-Profi",desc:"Gewinne 25 Minispiele."},
      {id:"minispiel-legende",icon:"🏆",title:"Minispiel-Legende",desc:"Spiele 100 Minispiele."},
      {id:"glimmersammler",icon:"🏆",title:"Glimmersammler",desc:"Sammle insgesamt 100 Glimmer."},
      {id:"glimmerhort",icon:"🏆",title:"Glimmerhort",desc:"Sammle insgesamt 1000 Glimmer."},
      {id:"wanderer",icon:"🏆",title:"Wanderer",desc:"Laufe insgesamt 500 Felder."},
      {id:"weltenbummler",icon:"🏆",title:"Weltenbummler",desc:"Laufe insgesamt 5000 Felder."},
      {id:"online-debuet",icon:"🏆",title:"Online-Debüt",desc:"Beende eine Online-Partie."},
      {id:"weltenreisende",icon:"🏆",title:"Weltenreisende",desc:"Spiele auf allen 5 Welten."},
      {id:"ausdauer",icon:"🏆",title:"Ausdauer",desc:"Spiele insgesamt eine Stunde."},
      {id:"allein-gegen-alle",icon:"🏆",title:"Allein gegen alle",desc:"Gewinne eine Partie mit vier Spielern."},
      {id:"minispiel-serie",icon:"🏆",title:"Minispiel-Dominator",desc:"Gewinne in einer Partie mindestens 3 Minispiele."},
      {id:"lange-reise",icon:"🏆",title:"Lange Reise",desc:"Beende eine Partie mit mindestens 15 Runden."},
      {id:"splittersammler",icon:"🏆",title:"Splittersammler",desc:"Habe am Ende einer Partie mindestens 3 Siegpunkt-Splitter."}
      ]
    },
    // Schlüssel easygames.funkblasen.v1, JSON-Pfad ach.<id> = Freischalt-Zeitstempel (Date.now(), ms). Je Erfolg +25 Münzen im Spiel; 30 Erfolge (13 Statistik, 10 Welten, 7 sonstige). Spiel selbst zeigt den Fortschritt (z. B. 3/10) aus stats – für die Zentralseite n
    "funkblasen": {
      title: "Funkblasen – Bubble Shooter", keys: ["easygames.funkblasen.v1"],
      read: function (raw) { try{var o=JSON.parse(raw);if(!o||typeof o!=='object'||!o.ach||typeof o.ach!=='object'||Array.isArray(o.ach))return {};var r={};for(var k in o.ach){var v=o.ach[k];if(typeof v==='number'&&isFinite(v)&&v>0)r[k]=v;else if(v===true)r[k]=1;}return r;}catch(e){return {};} },
      defs: [
      {id:"dreier",icon:"🫧",title:"Erster Dreier",desc:"Lass deine ersten drei Blasen platzen."},
      {id:"regen",icon:"🌧️",title:"Blasenregen",desc:"Lass mit einem Schuss 10 Blasen fallen."},
      {id:"combo",icon:"🔥",title:"Combo-Funk",desc:"Schaffe eine 5er-Combo (5 Treffer in Folge)."},
      {id:"bande",icon:"↩️",title:"Bandenprofi",desc:"Triff 5-mal mit einem Bandenschuss."},
      {id:"bande2",icon:"🎱",title:"Doppelbande",desc:"Triff nach zwei Wandabprallern."},
      {id:"bombe",icon:"💣",title:"Bombenstimmung",desc:"Setze 10 Bomben ein (geschossen oder im Feld)."},
      {id:"bogen",icon:"🌈",title:"Regenbogenjäger",desc:"Schieße 5 Regenbogenblasen."},
      {id:"blitz",icon:"⚡",title:"Blitzableiter",desc:"Löse 5 Blitze aus."},
      {id:"eis",icon:"🧊",title:"Eisbrecher",desc:"Taue 25 Eisblasen auf."},
      {id:"kristall",icon:"💎",title:"Kristallretter",desc:"Rette 30 Kristalle."},
      {id:"sterne",icon:"🌟",title:"Sternenfänger",desc:"Sammle 10 Sternenblasen ein."},
      {id:"kette",icon:"⛓️",title:"Kettenreaktion",desc:"Löse 3 Kettenblasen-Gruppen aus."},
      {id:"perfekt",icon:"🎯",title:"Perfektionist",desc:"Gewinne ein Level mit mindestens der Hälfte der Schüsse übrig."},
      {id:"welt1",icon:"🏁",title:"Funkis Garten",desc:"Schließe alle 15 Level von Welt 1 ab."},
      {id:"welt2",icon:"🏁",title:"Neon-Funkstadt",desc:"Schließe alle 15 Level von Welt 2 ab."},
      {id:"welt3",icon:"🏁",title:"Wolkenstudio",desc:"Schließe alle 15 Level von Welt 3 ab."},
      {id:"welt4",icon:"🏁",title:"Kristallhöhlen",desc:"Schließe alle 15 Level von Welt 4 ab."},
      {id:"welt5",icon:"🏁",title:"Unterwasser-Frequenz",desc:"Schließe alle 15 Level von Welt 5 ab."},
      {id:"welt6",icon:"🏁",title:"Zauberwald",desc:"Schließe alle 15 Level von Welt 6 ab."},
      {id:"welt7",icon:"🏁",title:"Sternensender",desc:"Schließe alle 15 Level von Welt 7 ab."},
      {id:"welt8",icon:"🏁",title:"Regenbogen-Tempel",desc:"Schließe alle 15 Level von Welt 8 ab."},
      {id:"welt9",icon:"🏁",title:"Gewitterkanal",desc:"Schließe alle 15 Level von Welt 9 ab."},
      {id:"welt10",icon:"🏁",title:"Großer Radioturm",desc:"Schließe alle 15 Level von Welt 10 ab."},
      {id:"drei30",icon:"⭐",title:"Sternensammler",desc:"Hole in 30 Leveln drei Sterne."},
      {id:"stern300",icon:"✨",title:"Sternenhimmel",desc:"Sammle insgesamt 300 Sterne."},
      {id:"endlos5k",icon:"♾️",title:"Dauerfunk",desc:"Erreiche im Endlosmodus 5.000 Punkte."},
      {id:"endlos10",icon:"🧱",title:"Standhaft",desc:"Überstehe im Endlosmodus 10 neue Reihen in einer Runde."},
      {id:"tag1",icon:"📅",title:"Tagesfunker",desc:"Schaffe eine Tagesaufgabe."},
      {id:"tag5",icon:"📻",title:"Stammhörer",desc:"Schaffe 5 Tagesaufgaben."},
      {id:"shop",icon:"🎨",title:"Stilbewusst",desc:"Kaufe dein erstes Design in der Sammlung."}
      ]
    },
    // Im Spiel (gay-life/js/core.js, Array ACH, im Hub als Chips '🏅/🔒 Name') gibt es nur Namen; die Beschreibungen hier sind aus den Bedingungen abgeleitet. Erfolge werden NICHT einzeln gespeichert, sondern bei jeder Anzeige aus dem Spielstand berechnet (Bestwerte
    "gay-life": {
      title: "Gay Life!", keys: ["anmachaGayLife"],
      read: function (raw) { var r={};try{if(!raw)return r;var S=JSON.parse(raw);if(!S||typeof S!=='object')return r;var n=function(v){v=+v;return isFinite(v)?v:0};var b=function(k){return n(S[k]&&S[k].best)};var t=1;
var dk=S.dates&&typeof S.dates==='object'?Object.keys(S.dates):[];
if(dk.length>=1)r.erstes_date=t;
if(dk.filter(function(k){return S.dates[k]&&n(S.dates[k].best)>=7}).length>=3)r.casanova=t;
var ct=n(S.club&&S.club.total);if(ct>=1000)r.club_besitzer=t;if(ct>=100000)r.club_tycoon=t;
var rb=S.rave&&S.rave.best;if(rb&&typeof rb==='object'){for(var s in rb){if(n(rb[s])>=8000){r.rave_koenigin=t;break}}}
if(b('style')>=36)r.stilikone=t;if(b('quiz')>=140)r.wissens_diva=t;if(b('dance')>=10)r.tanzbaer=t;if(b('pool')>=400)r.sprungbrett_star=t;if(b('kara')>=2500)r.superstar=t;if(b('sauna')>=450)r.saunameister=t;if(b('dark')>=550)r.nachtschwaermer=t;if(b('cast')>=800)r.nachwuchsstar=t;if(b('gym')>=12)r.muskelprotz=t;if(b('match')>=2500)r.match_meisterin=t;if(b('run')>=600)r.paradenlaeufer=t;
return r}catch(e){return {}} },
      defs: [
      {id:"erstes_date",icon:"🏅",title:"Erstes Date",desc:"Mindestens ein Date gespielt (dates hat einen Eintrag)."},
      {id:"casanova",icon:"🏅",title:"Casanova",desc:"Bei 3 verschiedenen Dates mindestens 7 Herzen (dates[id].best >= 7)."},
      {id:"club_besitzer",icon:"🏅",title:"Club-Besitzer",desc:"Im Club insgesamt 1.000 verdient (club.total >= 1000)."},
      {id:"club_tycoon",icon:"🏅",title:"Club-Tycoon",desc:"Im Club insgesamt 100.000 verdient (club.total >= 100000)."},
      {id:"rave_koenigin",icon:"🏅",title:"Rave-Königin",desc:"In einem Song mindestens 8.000 Punkte im Rave (rave.best[song] >= 8000)."},
      {id:"stilikone",icon:"🏅",title:"Stilikone",desc:"Outfit-Check mit mindestens 36 Punkten (style.best >= 36)."},
      {id:"wissens_diva",icon:"🏅",title:"Wissens-Diva",desc:"Quiz-Bestwert mindestens 140 (quiz.best >= 140)."},
      {id:"tanzbaer",icon:"🏅",title:"Tanzbär",desc:"Tanz-Bestwert mindestens 10 Runden (dance.best >= 10)."},
      {id:"sprungbrett_star",icon:"🏅",title:"Sprungbrett-Star",desc:"Pool-Bestwert mindestens 400 (pool.best >= 400)."},
      {id:"superstar",icon:"🏅",title:"Superstar",desc:"Karaoke-Bestwert mindestens 2.500 (kara.best >= 2500)."},
      {id:"saunameister",icon:"🏅",title:"Saunameister",desc:"Sauna-Bestwert mindestens 450 (sauna.best >= 450)."},
      {id:"nachtschwaermer",icon:"🏅",title:"Nachtschwärmer",desc:"Dunkelraum-Bestwert mindestens 550 (dark.best >= 550)."},
      {id:"nachwuchsstar",icon:"🏅",title:"Nachwuchsstar",desc:"Casting-Bestwert mindestens 800 (cast.best >= 800)."},
      {id:"muskelprotz",icon:"🏅",title:"Muskelprotz",desc:"Fitness-Bestwert mindestens 12 Wiederholungen (gym.best >= 12)."},
      {id:"match_meisterin",icon:"🏅",title:"Match-Meisterin",desc:"Match-Bestwert mindestens 2.500 (match.best >= 2500)."},
      {id:"paradenlaeufer",icon:"🏅",title:"Paradenläufer",desc:"Lauf-Bestwert mindestens 600 (run.best >= 600)."}
      ]
    },
    // Kein klassisches Erfolgssystem; abgeleitet aus Spielstand (Anzeige im Spiel: Licht-Siegel-Koffer, Championübersicht, Trainerkarte). Spielstand-Slot 1 (Schlüssel ...v2.slot1; Slots 2 und 3 heißen ...v2.slot2/slot3 und werden von read zusätzlich über localStorag
    "taschi": {
      title: "TASCHI – Die 16 Lichter", keys: ["easygames.taschi.eight-lights.v1.v2.slot1"],
      read: function (raw) { try{var res={};var keys=[null,'easygames.taschi.eight-lights.v1.v2.slot2','easygames.taschi.eight-lights.v1.v2.slot3'];for(var s=0;s<keys.length;s++){var txt=s===0?raw:null;if(s>0){try{txt=localStorage.getItem(keys[s]);}catch(e){txt=null;}}if(typeof txt!=='string')continue;try{var o=JSON.parse(txt);if(!o||typeof o!=='object')continue;var b=Math.floor(Number(o.badges));if(isFinite(b)){for(var i=0;i<16&&i<b;i++)res['siegel'+i]=1;}var c=o.champions;if(c&&typeof c==='object'&&!Array.isArray(c)){for(var j=0;j<16;j++){if(c[j]||c[String(j)])res['champ'+j]=1;}}}catch(e2){}}return res;}catch(e){return {};} },
      defs: [
      {id:"siegel0",icon:"🌱",title:"Licht-Siegel: Moostal",desc:"Besiege Fels-Fiete (Moosgarten-Arena) in Moostal und gewinne das Licht-Siegel 1/16."},
      {id:"siegel1",icon:"💧",title:"Licht-Siegel: Korallküste",desc:"Besiege Perla (Muschel-Arena) in Korallküste und gewinne das Licht-Siegel 2/16."},
      {id:"siegel2",icon:"⚡",title:"Licht-Siegel: Funkenfeld",desc:"Besiege Käpt’n Volt (Generator-Arena) in Funkenfeld und gewinne das Licht-Siegel 3/16."},
      {id:"siegel3",icon:"🌱",title:"Licht-Siegel: Blütenhain",desc:"Besiege Blüte (Blütenpavillon) in Blütenhain und gewinne das Licht-Siegel 4/16."},
      {id:"siegel4",icon:"🌱",title:"Licht-Siegel: Käferwald",desc:"Besiege Forscher Nilo (Heckenlabyrinth) in Käferwald und gewinne das Licht-Siegel 5/16."},
      {id:"siegel5",icon:"🪽",title:"Licht-Siegel: Sturmklippe",desc:"Besiege Jette vom Team Funke (Windkanal-Arena) in Sturmklippe und gewinne das Licht-Siegel 6/16."},
      {id:"siegel6",icon:"🔥",title:"Licht-Siegel: Glutland",desc:"Besiege Kapitän Rumo (Schmiede-Arena) in Glutland und gewinne das Licht-Siegel 7/16."},
      {id:"siegel7",icon:"👻",title:"Licht-Siegel: Sternenau",desc:"Besiege Meisterin Aurelia (Planetarium-Arena) in Sternenau und gewinne das Licht-Siegel 8/16."},
      {id:"siegel8",icon:"👻",title:"Licht-Siegel: Nebelmoor",desc:"Besiege Kira vom Nebelpass (Nebelarena) in Nebelmoor und gewinne das Licht-Siegel 9/16."},
      {id:"siegel9",icon:"❄️",title:"Licht-Siegel: Frosttal",desc:"Besiege Rokko vom Gletscher (Gletscher-Arena) in Frosttal und gewinne das Licht-Siegel 10/16."},
      {id:"siegel10",icon:"🌱",title:"Licht-Siegel: Wipfelreich",desc:"Besiege Taro vom Waldturm (Baumkronen-Arena) in Wipfelreich und gewinne das Licht-Siegel 11/16."},
      {id:"siegel11",icon:"⚡",title:"Licht-Siegel: Donnersteppe",desc:"Besiege Mira vom Sturmfeld (Blitzleiter-Arena) in Donnersteppe und gewinne das Licht-Siegel 12/16."},
      {id:"siegel12",icon:"🪨",title:"Licht-Siegel: Kristallberg",desc:"Besiege Nona der Kristallhöhle (Kristallgrotten-Arena) in Kristallberg und gewinne das Licht-Siegel 13/16."},
      {id:"siegel13",icon:"👻",title:"Licht-Siegel: Mondbucht",desc:"Besiege Lio der Mondbucht (Gezeiten-Arena) in Mondbucht und gewinne das Licht-Siegel 14/16."},
      {id:"siegel14",icon:"🔥",title:"Licht-Siegel: Sonnenhöhe",desc:"Besiege Sora vom Sonnenplateau (Sonnenuhr-Arena) in Sonnenhöhe und gewinne das Licht-Siegel 15/16."},
      {id:"siegel15",icon:"🪽",title:"Licht-Siegel: Himmelskrone",desc:"Besiege Großmeisterin Aurelia (Himmelsspiegel-Arena) in Himmelskrone und gewinne das Licht-Siegel 16/16."},
      {id:"champ0",icon:"♛",title:"Champion: Meisterin Lin",desc:"Besiege Meisterin Lin im Champion-Pavillon von Moostal."},
      {id:"champ1",icon:"♛",title:"Champion: Kapitän Marek",desc:"Besiege Kapitän Marek im Champion-Pavillon von Korallküste."},
      {id:"champ2",icon:"♛",title:"Champion: Donnerfürstin Edda",desc:"Besiege Donnerfürstin Edda im Champion-Pavillon von Funkenfeld."},
      {id:"champ3",icon:"♛",title:"Champion: Hüterin Flora",desc:"Besiege Hüterin Flora im Champion-Pavillon von Blütenhain."},
      {id:"champ4",icon:"♛",title:"Champion: Waldmeister Rian",desc:"Besiege Waldmeister Rian im Champion-Pavillon von Käferwald."},
      {id:"champ5",icon:"♛",title:"Champion: Sturmmeister Taro",desc:"Besiege Sturmmeister Taro im Champion-Pavillon von Sturmklippe."},
      {id:"champ6",icon:"♛",title:"Champion: Glutkönigin Sina",desc:"Besiege Glutkönigin Sina im Champion-Pavillon von Glutland."},
      {id:"champ7",icon:"♛",title:"Champion: Sternenhüter Aven",desc:"Besiege Sternenhüter Aven im Champion-Pavillon von Sternenau."},
      {id:"champ8",icon:"♛",title:"Champion: Nebelkönig Nox",desc:"Besiege Nebelkönig Nox im Champion-Pavillon von Nebelmoor."},
      {id:"champ9",icon:"♛",title:"Champion: Frostmeisterin Elin",desc:"Besiege Frostmeisterin Elin im Champion-Pavillon von Frosttal."},
      {id:"champ10",icon:"♛",title:"Champion: Wipfelmeister Fynn",desc:"Besiege Wipfelmeister Fynn im Champion-Pavillon von Wipfelreich."},
      {id:"champ11",icon:"♛",title:"Champion: Donnerkönigin Ira",desc:"Besiege Donnerkönigin Ira im Champion-Pavillon von Donnersteppe."},
      {id:"champ12",icon:"♛",title:"Champion: Kristallhüter Kai",desc:"Besiege Kristallhüter Kai im Champion-Pavillon von Kristallberg."},
      {id:"champ13",icon:"♛",title:"Champion: Mondmeisterin Nova",desc:"Besiege Mondmeisterin Nova im Champion-Pavillon von Mondbucht."},
      {id:"champ14",icon:"♛",title:"Champion: Sonnenmeister Sol",desc:"Besiege Sonnenmeister Sol im Champion-Pavillon von Sonnenhöhe."},
      {id:"champ15",icon:"♛",title:"Champion: Himmelsmeisterin Auri",desc:"Besiege Himmelsmeisterin Auri im Champion-Pavillon von Himmelskrone."}
      ]
    },
    // Erfolge heißen im Spiel "Sticker" (Sammelalbum). Spielstand = JSON-String in "bunteInsel.save" (Spielstand 1); Spielstand 2/3 liegen in "bunteInsel.s2.save" bzw. "bunteInsel.s3.save" (BI.store.key). Freigeschaltete Sticker: Array-Feld "stk" mit ids (kein Zeits
    "bunte-insel": {
      title: "Bunte Insel", keys: ["bunteInsel.save","bunteInsel.s2.save","bunteInsel.s3.save"],
      read: function (raw) { try{var d=JSON.parse(raw);var s=d&&typeof d==='object'?d.stk:null;var o={};if(Array.isArray(s))for(var i=0;i<s.length;i++){if(typeof s[i]==='string')o[s[i]]=1;}return o;}catch(e){return {};} },
      defs: [
      {id:"ride",icon:"🚗",title:"Erste Fahrt",desc:"Steig in ein Fahrzeug"},
      {id:"play",icon:"🎠",title:"Spielplatz-Profi",desc:"Schaukle, rutsche oder wippe"},
      {id:"obby",icon:"🏁",title:"Parcours-Meister",desc:"Schaffe den Himmels-Parcours"},
      {id:"emote",icon:"🎭",title:"Ausdruckskünstler",desc:"Zeig ein Emote oder sag etwas"},
      {id:"gadget",icon:"🚀",title:"Gadget-Fan",desc:"Kauf ein Gadget"},
      {id:"rollator",icon:"🦽",title:"Rollator-Rowdy",desc:"Gib mit dem Rollator Vollgas"},
      {id:"studio",icon:"🧑‍🎨",title:"Figuren-Künstler",desc:"Gestalte eine eigene Figur"},
      {id:"cinema",icon:"🍿",title:"Kino-Fan",desc:"Schau einen Film im Kino"},
      {id:"hero",icon:"🏆",title:"Inselheld",desc:"Schaffe die ganze Inselreise"},
      {id:"park",icon:"🎡",title:"Freizeitpark-Fan",desc:"Fahr eine Attraktion im Freizeitpark"},
      {id:"pack",icon:"🎒",title:"Rucksack-Profi",desc:"Öffne deinen Rucksack"},
      {id:"gift",icon:"🎁",title:"Geschenke-Fee",desc:"Verschenke oder tausche etwas"},
      {id:"eat",icon:"😋",title:"Feinschmecker",desc:"Iss etwas aus dem Rucksack"},
      {id:"pet",icon:"🥚",title:"Tierfreund",desc:"Schlüpfe ein Haustier aus einem Ei"},
      {id:"factory",icon:"🍭",title:"Bonbon-Boss",desc:"Kauf eine Maschine in der Fabrik"},
      {id:"parcours",icon:"🧗",title:"Parcours-Baumeister",desc:"Schaffe deinen selbst gebauten Parcours"},
      {id:"heli",icon:"🚁",title:"Hubschrauber-Pilot",desc:"Flieg mit dem Hubschrauber"},
      {id:"train",icon:"🚂",title:"Lokführer",desc:"Fahr den Zug"},
      {id:"boat",icon:"⛵",title:"Kapitän",desc:"Segle mit dem Boot"},
      {id:"shoot",icon:"🎯",title:"Zielschütze",desc:"Spiel in der Schießbude"},
      {id:"tybuild",icon:"🔨",title:"Parkbauer",desc:"Baue etwas im Freizeitpark"},
      {id:"cupwin",icon:"🏆",title:"Pokalsieger",desc:"Gewinne das Fußball-Turnier"},
      {id:"schatz",icon:"🗺️",title:"Schatzjäger",desc:"Finde den großen Schatz"},
      {id:"tymis",icon:"📋",title:"Park-Manager",desc:"Schließe eine Park-Mission ab"},
      {id:"tystar",icon:"🌟",title:"Sterne-Park",desc:"Erreiche 3 Sterne Parkbewertung"},
      {id:"tydir",icon:"👑",title:"Parkdirektor",desc:"Schaffe alle Park-Missionen"},
      {id:"tree",icon:"🌳",title:"Baumhauer",desc:"Hau einen Baum"},
      {id:"build",icon:"🏠",title:"Baumeister",desc:"Bau ein Teil"},
      {id:"sleep",icon:"😴",title:"Gut geschlafen",desc:"Schlaf in deinem Bett"},
      {id:"photo",icon:"📸",title:"Fotograf",desc:"Mach ein Foto"},
      {id:"music",icon:"🎹",title:"Musikant",desc:"Spiel auf dem Klavier"},
      {id:"paint",icon:"🎨",title:"Maler",desc:"Mal ein Bild"},
      {id:"quiz",icon:"🧠",title:"Schlaukopf",desc:"Spiel ein Lernspiel"},
      {id:"petfeed",icon:"🐾",title:"Haustierfreund",desc:"Füttere dein Haustier"},
      {id:"treasure",icon:"🗺️",title:"Schatzsucher",desc:"Finde einen Schatz"},
      {id:"friend",icon:"👥",title:"Freunde",desc:"Spiel mit einem Freund"},
      {id:"mini",icon:"🎮",title:"Spielprofi",desc:"Spiel ein Mini-Spiel"},
      {id:"bubble",icon:"🫧",title:"Seifenblasen",desc:"Puste Seifenblasen"},
      {id:"dance",icon:"🕺",title:"Tänzer",desc:"Tanz mit dem Dorf"},
      {id:"garden",icon:"🌻",title:"Gärtner",desc:"Ernte etwas im Garten"},
      {id:"farm",icon:"🚜",title:"Landwirt",desc:"Mäh ein Feld"},
      {id:"farmer",icon:"👨‍🌾",title:"Hofmeister",desc:"Schaff alle Aufgaben vom Bauern"},
      {id:"animal",icon:"🐄",title:"Tierfreund",desc:"Streichle ein Tier auf dem Hof"},
      {id:"guide",icon:"🧭",title:"Entdecker",desc:"Lass dir den Weg zeigen"},
      {id:"cook",icon:"🍳",title:"Hobbykoch",desc:"Koche etwas in der Hofküche"},
      {id:"ptask",icon:"🎯",title:"Fotoreporter",desc:"Löse 5 Foto-Aufgaben"},
      {id:"streak",icon:"📅",title:"Stammgast",desc:"Komm 3 Tage hintereinander"},
      {id:"room",icon:"🛋️",title:"Einrichter",desc:"Richte dein Zimmer ein"},
      {id:"story",icon:"📖",title:"Märchenonkel",desc:"Hör am Lagerfeuer eine Geschichte"},
      {id:"party",icon:"🎂",title:"Partykind",desc:"Feiere mit Freunden eine Party"},
      {id:"chat",icon:"💬",title:"Plaudertasche",desc:"Sprich mit 5 Leuten auf der Insel"},
      {id:"fight",icon:"🥊",title:"Kämpfer",desc:"Gewinne einen Kampf in der Arena"},
      {id:"forest",icon:"🌲",title:"Waldläufer",desc:"Besiege 10 Waldmonster"},
      {id:"boss",icon:"👑",title:"Waldheld",desc:"Besiege den Waldgeist auf der Wald-Insel"},
      {id:"tv",icon:"📺",title:"Fernsehgucker",desc:"Schau Fernsehen in einem Haus"},
      {id:"reader",icon:"📚",title:"Leseratte",desc:"Lass dir 3 Märchen vorlesen"},
      {id:"shopper",icon:"🛒",title:"Einkäufer",desc:"Kaufe etwas in einem Laden"},
      {id:"bouquet",icon:"💐",title:"Schenker",desc:"Verschenke einen Blumenstrauß"},
      {id:"visit",icon:"🏠",title:"Besucher",desc:"Besuche die Wohnung eines Freundes"},
      {id:"zoo",icon:"📖",title:"Tierforscher",desc:"Entdecke alle Tiere"},
      {id:"angler",icon:"🎣",title:"Angler",desc:"Fang deinen ersten Fisch"},
      {id:"schluesselreich",icon:"🗝️",title:"Schlüsselreisender",desc:"Besuche das Schlüsselreich"},
      {id:"schatten",icon:"🌑",title:"Schattenfreund",desc:"Begrüße den Schattenwächter oder besiege einen Dunkelwichtel auf der Wald-Insel"},
      {id:"schatten10",icon:"⚔️",title:"Schattenbezwinger",desc:"Besiege 10 Dunkelwichtel auf der Wald-Insel"},
      {id:"schluesseltraeger",icon:"👑",title:"Schlüsselträger",desc:"Besiege den Dunkelriesen auf der Wald-Insel"},
      {id:"karussell",icon:"🎠",title:"Karussell-Kind",desc:"Fahr mit dem Märchen-Karussell"},
      {id:"schwan",icon:"🦢",title:"Schwanenkapitän",desc:"Fahr mit dem Schwanenboot durch die Lagune"},
      {id:"eisrutsche",icon:"🛷",title:"Eisrutscher",desc:"Rutsch vom Frostgipfel hinunter"},
      {id:"schlossshow",icon:"🎆",title:"Showstar",desc:"Starte die Schloss-Show"},
      {id:"umzug",icon:"🎭",title:"Umzugsläufer",desc:"Lauf beim Märchen-Umzug mit"},
      {id:"stempel",icon:"🔖",title:"Stempelsammler",desc:"Fülle das Stempelheft im Märchenland"},
      {id:"mausohren",icon:"🐭",title:"Mausohren-Star",desc:"Setz die Mausohren auf"},
      {id:"tintenboss",icon:"🖋️",title:"Klecks-Bezwinger",desc:"Besiege den großen Klecks auf der Wald-Insel"},
      {id:"trickfilm",icon:"🎞️",title:"Trickfilm-Held",desc:"Besiege 10 Trickfilm-Monster (Tinte, Käfer-Roboter …) auf der Wald-Insel"},
      {id:"raetsel",icon:"🗿",title:"Rätsel-Reisender",desc:"Besuche die Rätsel-Insel der Uralten"},
      {id:"turm_s",icon:"🏆",title:"Turm-Bezwinger",desc:"Schaffe alle Rätsel im Prüfungsturm"},
      {id:"kapsel",icon:"🥚",title:"Kapsel-Freund",desc:"Wähle am Kapsel-Schrein ein Ei"},
      {id:"kapsel5",icon:"✨",title:"Kapsel-Meister",desc:"Entwickle dein Kapselmonster bis Stufe 5"},
      {id:"schmied",icon:"⚒️",title:"Schwertschmied",desc:"Schmiede ein Silberschwert"},
      {id:"hoehle",icon:"🕳️",title:"Höhlenforscher",desc:"Betritt die Uralte Höhle"},
      {id:"forscher5",icon:"🚪",title:"Türöffner",desc:"Betritt 5 Gebäude"},
      {id:"geschichte_raetsel",icon:"🗿",title:"Held der Uralten",desc:"Schaffe die Geschichte der Rätsel-Insel (Die Prüfung der Uralten)"},
      {id:"geschichte_schluessel",icon:"🗝️",title:"Schlüsselheld",desc:"Schaffe die Geschichte des Schlüsselreichs (Das Licht der Schlüssel)"},
      {id:"geschichte_schwamm",icon:"🧽",title:"Rezept-Retter",desc:"Schaffe die Geschichte der Schwammi-Bucht (Das Geheimrezept)"},
      {id:"geschichte_maerchen",icon:"📖",title:"Märchenretter",desc:"Schaffe die Geschichte des Märchenlands (Das verlorene Märchenbuch)"},
      {id:"geschichte_park",icon:"🎡",title:"Traumpark-Chef",desc:"Schaffe die Geschichte des Freizeitparks (Der Traumpark)"},
      {id:"geschichte_bauland",icon:"🧱",title:"Block-Baumeister",desc:"Schaffe die Geschichte vom Bauland (Die Stadt aus Blöcken)"},
      {id:"geschichte_city",icon:"🏙️",title:"Ehren-Stadtkind",desc:"Schaffe die Geschichte der Stadtinsel (Die Lichter der Großstadt)"},
      {id:"geschichte_pups",icon:"🐶",title:"Fellretter-Held",desc:"Schaffe die Geschichte der Fellretter-Bucht (Die große Fellretter-Parade)"},
      {id:"geschichte_rainbow",icon:"🌈",title:"Regenbogen-Freund",desc:"Schaffe die Geschichte der Regenbogeninsel (Jeder gehört dazu)"},
      {id:"geschichte_dampf",icon:"🚢",title:"Ehren-Matrose",desc:"Schaffe die Geschichte vom Dampfer-Hafen (Das Orchester der Farben)"},
      {id:"geschichte_drachen",icon:"🐉",title:"Drachenfreund",desc:"Schaffe die Geschichte der Drachenhöhen (Zündels Himmelsflug)"},
      {id:"geschichte_fussball",icon:"⚽",title:"Arena-Meisterin",desc:"Schaffe die Geschichte der Fußball-Arena (Der goldene Pokal)"},
      {id:"geschichte_zotik",icon:"🦊",title:"Held von Lunaris",desc:"Schaffe die Geschichte von Zotik & Lunaris (Der Ruf des Kristalls)"},
      {id:"geschichte_radio",icon:"📻",title:"Funkmeister",desc:"Schaffe die Geschichte der Funkwelle (Die dreizehn Sender)"},
      {id:"geschichte_atlantis",icon:"🔱",title:"Hüter von Atlantis",desc:"Schaffe die Geschichte von Atlantis (Das Herz von Atlantis)"},
      {id:"wunsch_insel",icon:"🌠",title:"Wunschreisender",desc:"Besuche die Wunsch-Insel hinter dem Schlüsselreich"},
      {id:"wunsch_hoehle",icon:"🕳️",title:"Zeichendeuter",desc:"Öffne das Tor in der geheimen Schlucht"},
      {id:"wunsch_floss",icon:"🛶",title:"Floßkapitän",desc:"Mach die Probefahrt mit dem selbstgebauten Floß"},
      {id:"wunsch_truhen",icon:"📦",title:"Truhenjäger",desc:"Finde alle 3 versteckten Truhen der Wunsch-Insel"},
      {id:"wunsch_dunkel",icon:"🌑",title:"Dunkelheits-Trotzer",desc:"Überstehe den Einbruch der Dunkelheit"},
      {id:"wunsch_arena",icon:"🏟️",title:"Schattenbezwinger",desc:"Besiege Umbra in der Schattenarena"},
      {id:"geschichte_taschi",icon:"🔴",title:"Taschi-Held",desc:"Schaffe die Geschichte von Taschi-Land (Der Weg zum Meister)"},
      {id:"huepf_insel",icon:"🍄",title:"Hüpfland-Gast",desc:"Besuche das Hüpfland im Westen"},
      {id:"huepf_dino",icon:"🦕",title:"Dino-Reiter",desc:"Reite auf Dino Tupfi"},
      {id:"huepf_roehre",icon:"🟢",title:"Röhren-Reisender",desc:"Reise durch eine Röhre im Hüpfland"},
      {id:"huepf_bloecke",icon:"⭐",title:"Blockstoßer",desc:"Stoß alle Sternblöcke im Hüpfland von unten an"},
      {id:"huepf_kart",icon:"🏁",title:"Kart-Flitzer",desc:"Fahr ein Kart-Rennen im Hüpfland"},
      {id:"huepf_pokal",icon:"🏆",title:"Kart-Champion",desc:"Gewinne ein Kart-Rennen im Hüpfland"},
      {id:"huepf_level",icon:"🦖",title:"Hüpf-Profi",desc:"Schaffe das Hüpf-Abenteuer am Automaten"},
      {id:"huepf_brocko",icon:"🪨",title:"Brocko-Kitzler",desc:"Kitzle Felsenkönig Brocko in seiner Burg durch"},
      {id:"geschichte_huepf",icon:"🌞",title:"Hüpf-Held",desc:"Schaffe die Geschichte des Hüpflands (Der Sonnenstern)"},
      {id:"taschi_dex25",icon:"📘",title:"Taschi-Sammler",desc:"Fang 25 verschiedene Taschis"},
      {id:"taschi_dex50",icon:"📚",title:"Taschi-Profi",desc:"Fang 50 verschiedene Taschis"},
      {id:"taschi_weltforscher",icon:"🌍",title:"Weltforscher",desc:"Fang in jeder Welt 2 Taschis"},
      {id:"taschi_fang",icon:"🎯",title:"Taschi-Fänger",desc:"Fang dein erstes wildes Taschi"},
      {id:"taschi_meister",icon:"👑",title:"Taschi-Meister",desc:"Hol alle 8 Orden in Taschi-Land"},
      {id:"forscher20",icon:"🏘️",title:"Dorfentdecker",desc:"Betritt 20 Gebäude"},
      {id:"forscher40",icon:"🗺️",title:"Weltenbummler",desc:"Betritt 40 Gebäude"},
      {id:"truhen10",icon:"🎁",title:"Truhenfinder",desc:"Öffne 10 Schatztruhen in Gebäuden"},
      {id:"titan",icon:"🗿",title:"Titanen-Bezwinger",desc:"Besiege Titan Kron auf der Wald-Insel"},
      {id:"schwammi",icon:"🧽",title:"Bucht-Besucher",desc:"Besuche die Schwammi-Bucht"},
      {id:"stammgast",icon:"🦀",title:"Stammgast",desc:"Iss drei verschiedene Gerichte in der Knusper-Krabbe"},
      {id:"karate_s",icon:"🥋",title:"Karate-Kind",desc:"Übe zehnmal Karate bei Sunny"},
      {id:"qualler",icon:"🪼",title:"Quallenfischer",desc:"Fang 15 Quallen im Quallenfeld"},
      {id:"plankton",icon:"🧪",title:"Plankto-Bezwinger",desc:"Besiege Planktos Riesen-Roboter auf der Wald-Insel"},
      {id:"herzentor",icon:"🌟",title:"Lichtwanderer",desc:"Öffne das Tor der Herzen im Schlüsselreich"},
      {id:"laternen",icon:"🔦",title:"Laternenanzünder",desc:"Zünde 12 Laternen im Schlüsselreich an"},
      {id:"rundfahrt",icon:"🚗",title:"Rundfahrer",desc:"Sammle alle Sterne auf der Ringstraße im Schlüsselreich"},
      {id:"mobil_s",icon:"🛹",title:"Schlüsselflieger",desc:"Flieg auf dem Schlüsselschwert-Mobil"},
      {id:"herz",icon:"❤️",title:"Herzensfreund",desc:"Schenke einem Freund ein Herz im Zimmer"},
      {id:"gastgeber",icon:"🏠",title:"Gastgeber",desc:"Bekomme 5 Herzen für dein Zimmer"},
      {id:"ereignis",icon:"🎪",title:"Festgast",desc:"Fang etwas am Festtag"},
      {id:"kaefer",icon:"🥅",title:"Käferfreund",desc:"Fang einen Käfer mit dem Kescher"},
      {id:"graeber",icon:"⛏️",title:"Schatzgräber",desc:"Grab etwas am Strand aus"},
      {id:"sammel",icon:"📖",title:"Buchleser",desc:"Öffne das Sammelbuch"},
      {id:"sammler",icon:"🏆",title:"Sammelmeister",desc:"Vervollständige ein Kapitel im Sammelbuch"},
      {id:"swim",icon:"🏊",title:"Schwimmer",desc:"Spring ins Freibad"},
      {id:"seepferd",icon:"🐴",title:"Seepferdchen",desc:"Schwimm im Meer am Badestrand"},
      {id:"huepf",icon:"🏰",title:"Hüpfburg-Held",desc:"Hüpf auf der Hüpfburg oder dem Luftkissen"},
      {id:"wasserpark",icon:"🌊",title:"Wasserpark-Profi",desc:"Rutsch von der Riesenrutsche ins Meer"},
      {id:"slide",icon:"🛝",title:"Rutschmeister",desc:"Rutsch die Wasserrutsche"},
      {id:"prisma_ki",icon:"🥋",title:"Ki-Prüfung",desc:"Löse die Lichtfolge im Ki-Garten"},
      {id:"prisma_runen",icon:"🃏",title:"Runenmeister",desc:"Löse das Zeichenrätsel in der Runen-Arena"},
      {id:"prisma_daten",icon:"💠",title:"Datenhüter",desc:"Repariere die Signalfolge im Datenhain"},
      {id:"prisma_drache",icon:"🐉",title:"Lichtdrachen-Ruf",desc:"Sammle alle 7 Sternkugeln und rufe am Altar den Lichtdrachen"},
      {id:"prisma_welle",icon:"🌀",title:"Ki-Welle",desc:"Triff im Turnier-Ring alle drei Kristalle mit der Ki-Welle"},
      {id:"prisma_duell",icon:"🎴",title:"Duell-Sieger",desc:"Gewinne ein Runen-Duell gegen Kaia im Stadion"},
      {id:"prisma_karten",icon:"🃏",title:"Kartensammler",desc:"Sammle alle 12 Runenkarten am Kartenautomaten"},
      {id:"prisma_partner",icon:"💠",title:"Digi-Partner",desc:"Lass dein Partner-Ei mit Datenwürfeln bis zur 3. Stufe wachsen"},
      {id:"geschichte_prisma",icon:"🌀",title:"Prisma-Chronik",desc:"Schließe die Geschichte des Prisma-Archipels ab"}
      ]
    }
  };

  function isObj(o) { return o && typeof o === 'object' && !Array.isArray(o); }
  function get(k) { try { return LS.getItem(k); } catch (e) { return null; } }
  function cleanDefs(list) {
    var out = [], seen = {};
    (Array.isArray(list) ? list : []).forEach(function (d) {
      if (!isObj(d) || typeof d.id !== 'string' || !d.id || seen[d.id] || typeof d.title !== 'string') return;
      seen[d.id] = 1; out.push({ id: d.id.slice(0, 60), icon: typeof d.icon === 'string' ? d.icon.slice(0, 8) : '🏅', title: d.title.slice(0, 80), desc: typeof d.desc === 'string' ? d.desc.slice(0, 200) : '' });
    });
    return out.slice(0, 500);
  }
  // Ergebnis eines Spiels: { title, defs, unlocked: {id: Zeit|1}, total, done } – nur Erfolge aus defs zählen
  function result(title, defs, got) {
    var unlocked = {}, done = 0;
    defs.forEach(function (d) { if (got[d.id]) { unlocked[d.id] = Number(got[d.id]) > 1 ? Number(got[d.id]) : 1; done++; } });
    return { title: title, defs: defs, unlocked: unlocked, total: defs.length, done: done };
  }
  function collectOne(game) {
    var e = REG[game], res = null;
    if (e) {
      var got = {};
      e.keys.forEach(function (k) {
        var raw = get(k); if (raw == null) return;
        try { var r = e.read(raw) || {}; Object.keys(r).forEach(function (id) { if (r[id] && (!got[id] || Number(r[id]) > 1)) got[id] = r[id]; }); } catch (x) {}
      });
      res = result(e.title, e.defs, got);
    }
    var g = get('anmacha-gameach.' + game);   // Standard für neue Spiele (ergänzt/ersetzt die Registry nicht, wird bei fehlendem Eintrag genutzt)
    if (g && !res) {
      try {
        var o = JSON.parse(g), defs = cleanDefs(o && o.d);
        if (defs.length) res = result(typeof o.t === 'string' && o.t ? o.t.slice(0, 60) : game, defs, isObj(o.u) ? o.u : {});
      } catch (x) {}
    }
    return res;
  }
  // Alle Spiele mit Erfolgssystem, die auf diesem Gerät/Ursprung Daten haben oder in der Registry stehen: { cloud-id: Ergebnis }
  function collect() {
    var out = {}, ids = Object.keys(REG);
    try { for (var i = 0, k; i < LS.length; i++) { k = LS.key(i); if (k && k.indexOf('anmacha-gameach.') === 0) ids.push(k.slice(16)); } } catch (e) {}
    ids.forEach(function (id) { if (!out[id]) { var r = collectOne(id); if (r) out[id] = r; } });
    return out;
  }
  // Nur die Definitionen (für die Anzeige, auch wenn auf diesem Gerät nichts freigeschaltet ist)
  function definitions() {
    var out = {};
    Object.keys(REG).forEach(function (id) { out[id] = { title: REG[id].title, defs: REG[id].defs }; });
    return out;
  }

  var api = { REG: REG, collectOne: collectOne, collect: collect, definitions: definitions, cleanDefs: cleanDefs };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AnMaChaGameAch = api;
})(typeof window !== 'undefined' ? window : this);
