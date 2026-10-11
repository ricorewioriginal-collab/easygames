/* AERU – Hauptgeschichte, Quests, Figuren und Dialoge.
   Reine Daten. Die Quest-Engine (quests.js) wertet sie aus; game.js stellt Welt und Ereignisse.
   Bedingungen: 'done:ID' (Quest abgeschlossen), 'step:ID:N' (Quest mindestens bei Schritt N oder fertig),
   'flag:NAME', 'core:N' (Leuchtkern N erhalten). Ein vorangestelltes '!' verneint. */
'use strict';
window.AERU_STORY = {
// Figuren. slot = fester Platz auf ihrer Insel (keeper/side/helper aus content.js), appear = Sonderauftritte.
npcs: {
  aeru:  {name:'Aeru', role:'JUNGER WINDDRACHE', portrait:'✧'},
  mira:  {name:'Mira', role:'HÜTERIN DER WINDWIESEN', level:0, slot:'keeper', kind:'dragon', color:'#f1bb87'},
  pip:   {name:'Pip', role:'POSTBOTE OHNE FLÜGEL', level:0, slot:'side', kind:'owl', color:'#c49a78'},
  edda:  {name:'Edda', role:'WINDVERMESSERIN', level:0, slot:'helper', kind:'wizard', color:'#749d99'},
  oru:   {name:'Oru', role:'GÄRTNER DER ERINNERUNGEN', level:1, slot:'keeper', kind:'dragon', color:'#c89bdf'},
  nim:   {name:'Nim', role:'SAMENARCHIVARIN', level:1, slot:'side', kind:'owl', color:'#aabd85'},
  fenn:  {name:'Fenn', role:'HÜTER DES BERNSTEINS', level:1, slot:'helper', kind:'wizard', color:'#8d9f6b'},
  sela:  {name:'Sela', role:'KARTOGRAFIN DER STERNE', level:2, slot:'keeper', kind:'dragon', color:'#a8d8eb'},
  tavi:  {name:'Tavi', role:'LEHRLING DER STERNE', level:2, slot:'side', kind:'owl', color:'#a1a9d0'},
  ivo:   {name:'Ivo', role:'LETZTER WACHTPOSTEN', level:2, slot:'helper', kind:'wizard', color:'#7c86a8'},
  luma:  {name:'Luma', role:'LOTSIN DER WOLKENRIFFE', level:3, slot:'keeper', kind:'dragon', color:'#83d4ba'},
  kito:  {name:'Kito', role:'FLASCHENPOSTFISCHER', level:3, slot:'side', kind:'owl', color:'#c49a78'},
  tessa: {name:'Tessa', role:'AUFWINDBAUERIN', level:3, slot:'helper', kind:'wizard', color:'#d39a6a',
          appear:[{level:3, x:-37, z:-4, y:2, when:'!step:c4_reefs:3'}]},
  yara:  {name:'Yara', role:'STIMMERIN DER KRISTALLE', level:4, slot:'keeper', kind:'dragon', color:'#bba0e1'},
  boro:  {name:'Boro', role:'ECHOARCHIVAR', level:4, slot:'side', kind:'owl', color:'#aabd85'},
  elin:  {name:'Elin', role:'TURMWÄCHTERIN', level:4, slot:'helper', kind:'wizard', color:'#8f86b8'},
  neri:  {name:'Neri', role:'ARCHITEKTIN DES MORGENS', level:5, slot:'keeper', kind:'dragon', color:'#efc78c'},
  vela:  {name:'Vela', role:'HAFENCHRONISTIN', level:5, slot:'side', kind:'owl', color:'#a1a9d0'},
  juno:  {name:'Juno', role:'WINDSEGELMACHER', level:5, slot:'helper', kind:'wizard', color:'#c58f7a'},
  // Vesper wechselt im Lauf der Geschichte Ort und Rolle.
  vesper:{name:'Vesper', role:'DER SAMMLER', kind:'dragon', color:'#6a5f9e', portrait:'☾',
          roles:[['done:c3_storm','STERNENWÄCHTER OHNE STERN'],['done:c6_finale','STERNENWÄCHTER']],
          appear:[
            {level:3, x:38, z:4, y:1, when:'done:c3_storm', unless:'step:c4_reefs:5'},
            {level:3, x:3, z:14, y:0, when:'step:c4_reefs:5', unless:'done:c4_reefs'},
            {level:4, x:4, z:15, y:0, when:'done:c4_reefs', unless:'done:c5_truth'},
            {level:5, x:5, z:12, y:0, when:'done:c6_finale'},
            {level:2, x:3, z:14, y:0, when:'done:c6_finale'}
          ]},
  stille:{name:'Die Stille', role:'EINGESPERRTER WIND', portrait:'◌'}
},

chapters: [
  {level:0, title:'Der Himmel verstummt', summary:'Der Wind über den Windwiesen wird schwächer. Mira weckt Aeru, die Windlaternen erwachen wieder, und auf der Ostinsel liegt eine Feder mit dem Siegel der Sternenwarte.'},
  {level:1, title:'Die Stimmen der Vergangenheit', summary:'Oru zeigt Aeru im Bernstein, was in der Langen Nacht geschah: Ein junger Sternenwächter namens Vesper stand vor dem verschlossenen Hafentor.'},
  {level:2, title:'Das gebrochene Sternentor', summary:'In der Sternenwarte stellt Aeru Vesper. Nach dem Kampf gibt Vesper das gesammelte Licht zurück und warnt vor der Stille.'},
  {level:3, title:'Die verlorenen Windwege', summary:'In den Wolkenriffen knüpft Aeru die zerrissenen Windwege neu, rettet Tessa und bringt Vesper dazu, sich Luma zu stellen.'},
  {level:4, title:'Das Echo der Wahrheit', summary:'Die Kristalle der Klamm geben das Echo der Langen Nacht frei. Die Stille ist eingesperrter Wind – und sie holt sich Vesper.'},
  {level:5, title:'Der letzte Morgen', summary:'In den Morgenruinen öffnet Aeru den alten Himmelshafen und befreit Vesper und den eingesperrten Wind.'}
],

// Upgrades durch Himmelssplitter (optional, insgesamt gezählt, nie doppelt vergeben – sie werden aus der Anzahl berechnet).
upgrades: [
  {gems:24, id:'stamina', text:'Weite Schwingen · Flügelkraft +25'},
  {gems:48, id:'heart1', text:'Splitterherz · ein zusätzliches Herz'},
  {gems:72, id:'range', text:'Weiter Wind · Windstoß reicht weiter'},
  {gems:96, id:'heart2', text:'Zweites Splitterherz · noch ein Herz'},
  {gems:120, id:'speed', text:'Sturmschwingen · schnellerer Flug'},
  {gems:144, id:'glow', text:'Sternenglanz · alle Himmelssplitter gefunden'}
],

// Story-Objekte. Sie erscheinen nur, solange ein aktiver Questschritt sie verlangt.
items: [
  {id:'feather', level:0, x:35, z:4, y:1, label:'Dunkle Feder', color:'#7a6bc0'},
  {id:'amber_grove', level:1, x:30, z:-22, y:3, label:'Bernstein: Der Ruf', color:'#ffb347'},
  {id:'amber_islet', level:1, x:-38, z:-3, y:2, label:'Bernstein: Das Tor', color:'#ffb347'},
  {id:'amber_spring', level:1, x:20, z:12, y:0, label:'Bernstein: Die Nacht', color:'#ffb347'}
],

quests: [
// ───────── Kapitel 1 · Windwiesen ─────────
{id:'c1_wake', chapter:0, level:0, kind:'main', title:'Der Himmel verstummt',
 why:'Der Wind über den Windwiesen wird schwächer. Mira weiß mehr.',
 steps:[
  {text:'Wach auf', goal:{type:'arrive', level:0}, dialog:'c1_intro'},
  {text:'Sprich mit Mira', hint:'Laufen: WASD / Stick · R oder REDEN', goal:{type:'talk', npc:'mira'}, dialog:'c1_mira_wake'},
  {text:'Wecke die drei Windlaternen', hint:'Windstoß: F oder WIND in Laternenrichtung · die dritte steht oben auf der Treppe',
   goal:{type:'lantern', count:3, retro:true}, where:'lanterns'},
  {text:'Erzähl Mira von den Laternen', goal:{type:'talk', npc:'mira'}, dialog:'c1_mira_lit'}
 ]},
{id:'c1_trace', chapter:0, level:0, kind:'main', when:'done:c1_wake', title:'Die Spur im Wind',
 why:'Edda hat gemessen, wohin der Wind verschwindet.',
 steps:[
  {text:'Sprich mit Edda an der Treppe', goal:{type:'talk', npc:'edda'}, dialog:'c1_edda'},
  {text:'Vertreibe drei Nebelkäfer', hint:'Sie zeigen ihren Angriff durch Zittern an. Ausweichen: Umschalt / AUSWEICHEN',
   goal:{type:'enemy', count:3, kind:'kaefer'}, where:'enemies'},
  {text:'Flieg zur Ostinsel und finde die Spur', hint:'Türkiser Aufwind am Ostrand · G / FLUG zum Abheben',
   goal:{type:'item', ids:['feather']}, where:'items', after:'c1_feather_found'},
  {text:'Bring Mira die Feder', goal:{type:'talk', npc:'mira'}, dialog:'c1_mira_feather'}
 ], reward:{core:0}},
{id:'c1_pip', chapter:0, level:0, kind:'side', giver:'pip', when:'step:c1_wake:1', title:'Post mit Höhenangst',
 why:'Pips Briefe sind auf den beiden Außeninseln gelandet.',
 steps:[
  {text:'Sprich mit Pip', goal:{type:'talk', npc:'pip'}, dialog:'c1_pip_ask'},
  {text:'Hol die Splitter-Briefe von beiden Außeninseln', hint:'Bereits gefundene Briefe zählen.', goal:{type:'gem', ids:[21,23], retro:true}, where:'gems'},
  {text:'Bring Pip die Briefe', goal:{type:'talk', npc:'pip'}, dialog:'c1_pip_thanks'}
 ], reward:{heal:true}},

// ───────── Kapitel 2 · Bernsteinhain ─────────
{id:'c2_voices', chapter:1, level:1, kind:'main', when:'done:c1_trace', title:'Die Stimmen der Vergangenheit',
 why:'Mira schickt Aeru zu Oru, der die Erinnerungen der Inseln hütet.',
 steps:[
  {text:'Reise durch das Sternentor in den Bernsteinhain', hint:'Das goldene Tor oben auf der Treppe · R / REDEN', goal:{type:'arrive', level:1}, where:'portal', dialog:'c2_arrive'},
  {text:'Sprich mit Oru', goal:{type:'talk', npc:'oru'}, dialog:'c2_oru'},
  {text:'Finde die drei Bernsteintropfen', hint:'Einer liegt hinter verborgenen Stufen im Nordosten, einer auf der Westinsel, einer an der Quelle im Osten.',
   goal:{type:'item', ids:['amber_grove','amber_islet','amber_spring']}, where:'items'},
  {text:'Bring Oru die Erinnerungen', goal:{type:'talk', npc:'oru'}, dialog:'c2_memory'}
 ]},
{id:'c2_song', chapter:1, level:1, kind:'main', when:'done:c2_voices', title:'Das Lied der Laternen',
 why:'Die Laternen des Hains erwachen nur in der Reihenfolge der Erinnerung.',
 steps:[
  {text:'Wecke die Laternen: Morgen, Abend, Nacht', hint:'Morgen im Osten · Abend im Westen · Nacht oben auf der Treppe. Falsche Reihenfolge lässt sie erlöschen.',
   goal:{type:'lantern', count:3, order:[1,0,2]}, where:'lanterns'},
  {text:'Sprich mit Oru', goal:{type:'talk', npc:'oru'}, dialog:'c2_end'}
 ], reward:{core:1}},
{id:'c2_nim', chapter:1, level:1, kind:'side', giver:'nim', when:'step:c2_voices:1', title:'Sternensamen',
 why:'Nim braucht Samen von den Außeninseln.',
 steps:[
  {text:'Sprich mit Nim', goal:{type:'talk', npc:'nim'}, dialog:'c2_nim_ask'},
  {text:'Hol die Splitter von beiden Außeninseln', hint:'Bereits gefundene zählen.', goal:{type:'gem', ids:[21,23], retro:true}, where:'gems'},
  {text:'Bring Nim die Samen', goal:{type:'talk', npc:'nim'}, dialog:'c2_nim_thanks'}
 ], reward:{heal:true}},

// ───────── Kapitel 3 · Sternenwarte ─────────
{id:'c3_gate', chapter:2, level:2, kind:'main', when:'done:c2_song', title:'Das gebrochene Sternentor',
 why:'Oru hat Aeru zu Sela geschickt. Sie kannte Vesper.',
 steps:[
  {text:'Reise durch das Sternentor zur Sternenwarte', goal:{type:'arrive', level:2}, where:'portal', dialog:'c3_arrive'},
  {text:'Sprich mit Sela', goal:{type:'talk', npc:'sela'}, dialog:'c3_sela'},
  {text:'Sprich mit Ivo am Treppenfuß', goal:{type:'talk', npc:'ivo'}, dialog:'c3_ivo'},
  {text:'Vertreibe vier Sturmfunken', hint:'Funken laden sichtbar auf und schießen dann. Seitlich ausweichen, dann zuschlagen.', goal:{type:'enemy', count:4, kind:'funke'}, where:'enemies'},
  {text:'Wecke die drei Windlaternen', hint:'Ohne Laternenlicht frisst Vespers Rüstung jeden Wind.', goal:{type:'lantern', count:3, retro:true}, where:'lanterns'},
  {text:'Sag Sela, dass die Laternen leuchten', goal:{type:'talk', npc:'sela'}, dialog:'c3_ready'}
 ]},
{id:'c3_storm', chapter:2, level:2, kind:'main', when:'done:c3_gate', title:'Vespers Sturm',
 why:'Vesper hält das Licht der Warte in seiner Sturmrüstung fest.',
 steps:[
  {text:'Stell dich Vesper oben am Tor', hint:'Über die Sturmwellen springen. Nach jeder Welle ist sein Schild kurz offen.', goal:{type:'boss', id:'vesper'}, where:'arena', after:'c3_vesper_falls'},
  {text:'Sprich mit Sela', goal:{type:'talk', npc:'sela'}, dialog:'c3_end'}
 ], reward:{core:2}},
{id:'c3_tavi', chapter:2, level:2, kind:'side', giver:'tavi', when:'step:c3_gate:1', title:'Die alte Sternkarte',
 why:'Tavi sucht die Teile einer Sternkarte.',
 steps:[
  {text:'Sprich mit Tavi', goal:{type:'talk', npc:'tavi'}, dialog:'c3_tavi_ask'},
  {text:'Hol die Kartenteile von beiden Außeninseln', hint:'Bereits gefundene zählen.', goal:{type:'gem', ids:[21,23], retro:true}, where:'gems'},
  {text:'Bring Tavi die Karte', goal:{type:'talk', npc:'tavi'}, dialog:'c3_tavi_thanks'}
 ], reward:{heal:true}},

// ───────── Kapitel 4 · Wolkenriffe ─────────
{id:'c4_reefs', chapter:3, level:3, kind:'main', when:'done:c3_storm', title:'Die verlorenen Windwege',
 why:'Vesper ist zu den Wolkenriffen geflohen. Dort sind die Windwege zerrissen.',
 steps:[
  {text:'Reise durch das Sternentor zu den Wolkenriffen', goal:{type:'arrive', level:3}, where:'portal', dialog:'c4_arrive'},
  {text:'Sprich mit Luma', goal:{type:'talk', npc:'luma'}, dialog:'c4_luma'},
  {text:'Rette Tessa auf dem Westriff', hint:'Aufwinde füllen die Flügelkraft. Halte SPRUNG im Flug zum Steigen.', goal:{type:'talk', npc:'tessa'}, dialog:'c4_tessa'},
  {text:'Knüpfe die drei Windwege: flieg durch die Himmelsringe', hint:'Im Flug: SPRUNG halten steigt, Umschalt / AUSWEICHEN sinkt.', goal:{type:'ring', count:3, retro:true}, where:'rings'},
  {text:'Such Vesper auf dem Ostriff', goal:{type:'talk', npc:'vesper'}, dialog:'c4_vesper'},
  {text:'Kehr zu Luma zurück', goal:{type:'talk', npc:'luma'}, dialog:'c4_luma_wait'},
  {text:'Hör zu, was Vesper Luma sagt', goal:{type:'talk', npc:'vesper'}, dialog:'c4_end'}
 ], reward:{core:3}},
{id:'c4_kito', chapter:3, level:3, kind:'side', giver:'kito', when:'step:c4_reefs:1', title:'Flaschenpost',
 why:'Zwei Briefe sind auf den Außenriffen gestrandet.',
 steps:[
  {text:'Sprich mit Kito', goal:{type:'talk', npc:'kito'}, dialog:'c4_kito_ask'},
  {text:'Hol die Flaschenpost von beiden Außenriffen', hint:'Bereits gefundene zählen.', goal:{type:'gem', ids:[21,23], retro:true}, where:'gems'},
  {text:'Bring Kito die Briefe', goal:{type:'talk', npc:'kito'}, dialog:'c4_kito_thanks'}
 ], reward:{heal:true}},

// ───────── Kapitel 5 · Kristallklamm ─────────
{id:'c5_truth', chapter:4, level:4, kind:'main', when:'done:c4_reefs', title:'Das Echo der Wahrheit',
 why:'Vesper sagt, die Kristalle erinnern sich an die Lange Nacht.',
 steps:[
  {text:'Reise durch das Sternentor in die Kristallklamm', goal:{type:'arrive', level:4}, where:'portal', dialog:'c5_arrive'},
  {text:'Sprich mit Yara', goal:{type:'talk', npc:'yara'}, dialog:'c5_yara'},
  {text:'Wecke die Laternen auf den Kristalltürmen', hint:'Die Aufwinde unter den Türmen tragen dich hinauf.', goal:{type:'lantern', count:3, retro:true}, where:'lanterns'},
  {text:'Sprich mit Elin an der Treppe', goal:{type:'talk', npc:'elin'}, dialog:'c5_elin'},
  {text:'Vertreibe drei Stille-Schatten', hint:'Schatten weichen aus. Erst nach ihrem Sprung sind sie verwundbar.', goal:{type:'enemy', count:3, kind:'schatten'}, where:'enemies'},
  {text:'Stimme die drei Himmelsringe', goal:{type:'ring', count:3, retro:true}, where:'rings'},
  {text:'Lausch dem Echo mit Yara', goal:{type:'talk', npc:'yara'}, dialog:'c5_echo'}
 ], reward:{core:4}},
{id:'c5_boro', chapter:4, level:4, kind:'side', giver:'boro', when:'step:c5_truth:1', title:'Geräusche im Stein',
 why:'Boro sammelt alte Klänge.',
 steps:[
  {text:'Sprich mit Boro', goal:{type:'talk', npc:'boro'}, dialog:'c5_boro_ask'},
  {text:'Hol die Klangsplitter von beiden Außeninseln', hint:'Bereits gefundene zählen.', goal:{type:'gem', ids:[21,23], retro:true}, where:'gems'},
  {text:'Bring Boro die Klänge', goal:{type:'talk', npc:'boro'}, dialog:'c5_boro_thanks'}
 ], reward:{heal:true}},

// ───────── Kapitel 6 · Morgenruinen ─────────
{id:'c6_harbor', chapter:5, level:5, kind:'main', when:'done:c5_truth', title:'Der letzte Morgen',
 why:'Die Stille hat Vesper in die Morgenruinen gezogen.',
 steps:[
  {text:'Reise durch das Sternentor in die Morgenruinen', goal:{type:'arrive', level:5}, where:'portal', dialog:'c6_arrive'},
  {text:'Sprich mit Neri', goal:{type:'talk', npc:'neri'}, dialog:'c6_neri'},
  {text:'Sprich mit Juno über die Leuchtfeuer', goal:{type:'talk', npc:'juno'}, dialog:'c6_juno'},
  {text:'Entzünde die Leuchtfeuer auf den Kaimauern', hint:'Die Stufen links und rechts führen hinauf.', goal:{type:'lantern', count:3, retro:true}, where:'lanterns'},
  {text:'Öffne die Hafenwindwege: flieg durch die Ringe', goal:{type:'ring', count:3, retro:true}, where:'rings'},
  {text:'Sprich mit Neri', goal:{type:'talk', npc:'neri'}, dialog:'c6_ready'}
 ]},
{id:'c6_finale', chapter:5, level:5, kind:'main', when:'done:c6_harbor', title:'Die Stille',
 why:'Die Stille sitzt auf dem alten Hafentor und hält Vesper fest.',
 steps:[
  {text:'Stell dich der Stille am Hafentor', hint:'Phase 1: Wellen überspringen · Phase 2: Anker in den Aufwinden zerstören · Phase 3: Vesper hilft dir', goal:{type:'boss', id:'stille'}, where:'arena', after:'c6_freed'},
  {text:'Sprich mit Neri und Vesper', goal:{type:'talk', npc:'neri'}, dialog:'c6_end'}
 ], reward:{core:5, ending:true}},
{id:'c6_vela', chapter:5, level:5, kind:'side', giver:'vela', when:'step:c6_harbor:1', title:'Die Hafensiegel',
 why:'Vela fehlen die alten Hafensiegel.',
 steps:[
  {text:'Sprich mit Vela', goal:{type:'talk', npc:'vela'}, dialog:'c6_vela_ask'},
  {text:'Hol die Siegel von beiden Außeninseln', hint:'Bereits gefundene zählen.', goal:{type:'gem', ids:[21,23], retro:true}, where:'gems'},
  {text:'Bring Vela die Siegel', goal:{type:'talk', npc:'vela'}, dialog:'c6_vela_thanks'}
 ], reward:{heal:true}}
],

dialogs: {
// Kapitel 1
c1_intro:[['aeru','… Still. Kein Rascheln im Gras. So ruhig war es hier noch nie.'],['mira','Aeru! Du bist wach. Komm zu mir herüber, ich muss dir etwas zeigen.']],
c1_mira_wake:[['mira','Hörst du das? Nichts. Seit drei Nächten wird der Wind schwächer, und heute Morgen war die Schale des Morgenkerns leer.'],
 ['aeru','Leer? Der Kern leuchtet doch seit … immer.'],
 ['mira','Ohne ihn verlieren die Sterneninseln ihre Aufwinde. Sieh zum Horizont: Die Ostinsel ist schon ein Stück weiter weggetrieben.'],
 ['mira','Die drei Windlaternen sind die Wurzeln des Kerns. Wenn sie wieder brennen, kann ich aus ihrem Licht neue Kraft weben. Weck sie mit deinem Windstoß.'],
 ['aeru','Laternen wecken. Das kann ich. Wahrscheinlich.']],
c1_mira_lit:[['mira','Alle drei brennen! Spürst du den Hauch auf den Schuppen? Das war dein Wind.'],
 ['mira','Aber das Licht zieht davon, statt hier zu bleiben. Etwas ruft es fort.'],
 ['mira','Edda misst den Wind unten an der Treppe. Wenn jemand weiß, wohin er verschwindet, dann sie.']],
c1_edda:[['edda','Ah, der Drache mit den schiefen Landungen. Gut. Ich brauche jemanden mit Flügeln.'],
 ['edda','Meine Windfahne zeigt seit Tagen nach Osten. Gestern Nacht ist dort etwas Großes gelandet. Und dann war der Wind weg.'],
 ['aeru','Etwas Großes? Auf der kleinen Ostinsel?'],
 ['edda','Bevor du hinfliegst: Die Nebelkäfer kriechen aus den Wiesen, seit der Wind schwach ist. Vertreib ein paar, sonst kommt hier niemand mehr zur Treppe.'],
 ['edda','Danach nimmst du den türkisen Aufwind am Ostrand. Mit G oder FLUG hebst du ab. Im Aufwind füllt sich deine Flügelkraft wieder.']],
c1_feather_found:[['aeru','Eine Feder. Dunkelviolett … und auf dem Kiel ein kleines Sternzeichen, eingebrannt wie ein Siegel.'],
 ['aeru','Das bringe ich Mira.']],
c1_mira_feather:[['mira','Zeig her … Das Siegel der Sternenwarte. Solche Federn trugen nur die Sternenwächter.'],
 ['aeru','Ich dachte, es gibt keine Sternenwächter mehr.'],
 ['mira','Nicht seit der Langen Nacht. Damals verschwand ein junger Lehrling. Man erzählte sich, sein Name sei Vesper gewesen.'],
 ['mira','Wenn ein Wächter unser Licht genommen hat, muss es einen Grund geben. Die Lange Nacht – davon weiß Oru mehr als jeder andere. Er hütet die Erinnerungen im Bernsteinhain.'],
 ['mira','Ich webe aus dem Laternenlicht einen neuen Morgenkern. Er ist klein, aber er reicht, um das Sternentor zu öffnen.'],
 ['aeru','Dann fliege ich zu Oru. Und finde heraus, wer dieser Vesper ist.']],
c1_pip_ask:[['pip','Oh nein, oh nein. Meine Briefe! Der letzte Windstoß hat sie bis auf die Außeninseln geweht.'],
 ['aeru','Kannst du nicht einfach … hinüberfliegen?'],
 ['pip','Ich bin ein Postvogel mit Höhenangst. Eine ziemlich unpraktische Kombination. Die Briefe liegen bei den Splittern auf der Ost- und der Westinsel.']],
c1_pip_thanks:[['pip','Beide Briefe! Eine Nachricht aus dem Osten und eine aus dem Westen. Du hast meine kleine Welt größer gemacht.'],['aeru','Manchmal liegt das Beste ein kleines Stück neben dem Weg.']],

// Kapitel 2
c2_arrive:[['aeru','Der Bernsteinhain. Die Blätter summen, als würden sie sich etwas zuflüstern.'],['aeru','Mira sagte, Oru hütet hier die Erinnerungen der Inseln. Er muss der alte Drache unter den Bäumen sein.']],
c2_oru:[['oru','Ein Windkind aus den Wiesen … mit einer Feder der Sternenwarte. Mira schickt dich wegen der Langen Nacht.'],
 ['aeru','Sie sagt, damals sei ein Lehrling verschwunden. Vesper.'],
 ['oru','Die Bäume vergessen nichts. Was sie sehen, tropft als Harz herab und wird zu Bernstein.'],
 ['oru','In jener Nacht fielen drei Tropfen. Seitdem liegen sie verstreut, wo die alten Wege waren: hinter den verborgenen Stufen im Nordosten, auf der Westinsel und an der Quelle im Osten.'],
 ['oru','Bring sie mir. Dann hören wir gemeinsam, was der Hain gesehen hat.']],
c2_memory:[['oru','Drei Tropfen. Halt sie ins Licht, Aeru. Hör hin.'],
 ['oru','Der erste: Sturm. Schwarze Wolken über allen Inseln. Ein junger Wächter fliegt mit einer Laterne gegen den Wind.'],
 ['oru','Der zweite: das große Hafentor des Morgenhafens. Er klopft. Er ruft, er bringe Licht für alle. Das Tor bleibt zu.'],
 ['oru','Der dritte: Der Junge kauert die ganze Nacht vor dem Tor. Seine Laterne geht aus. Am Morgen ist er fort.'],
 ['aeru','Das war Vesper. Sie haben ihn draußen gelassen.'],
 ['oru','Angst denkt selten an andere. Wer einmal so allein im Dunkeln war, hält danach jedes Licht fest, das er findet.'],
 ['oru','Doch unser Licht ist nicht verloren. Die Laternen des Hains singen ein altes Lied: zuerst der Morgen im Osten, dann der Abend im Westen, zuletzt die Nacht oben auf der Treppe. Weck sie in dieser Reihenfolge.']],
c2_end:[['oru','Hörst du das? Der Hain singt wieder. Ich lege das Lied in einen neuen Dämmerkern.'],
 ['oru','Geh zur Sternenwarte. Sela, die Kartografin, war in der Langen Nacht Vespers Gefährtin unter den Lehrlingen. Sie trägt diese Nacht bis heute mit sich.'],
 ['aeru','Dann muss ich mit ihr reden. Und mit ihm.'],
 ['oru','Sei freundlich zu beiden, Windkind. Freundlichkeit ist auch eine Art Wind.']],
c2_nim_ask:[['nim','Ein Besucher! Bist du schwindelfrei? Auf den beiden Außeninseln wachsen Sternensamen, genau neben den Splittern.'],['nim','Bring sie mir, dann pflanze ich sie hier ein. Im Frühling blüht dann der ganze Himmel.']],
c2_nim_thanks:[['nim','Zwei seltene Samen von beiden Außeninseln! Ich gebe ihnen die besten Plätze im Archiv – und einen davon nenne ich Aeru.'],['aeru','Eine Blume mit meinem Namen. Hoffentlich landet sie besser als ich.']],

// Kapitel 3
c3_arrive:[['aeru','Die Sternenwarte. Aber wo sind die Sterne? Der Himmel ist leer.'],
 ['vesper','Geh zurück, kleiner Drache. Hier oben ist nur Platz für Licht, das niemand mehr fortnehmen kann.'],
 ['aeru','Vesper! Warte!'],
 ['aeru','… Er ist hinter dem Tor verschwunden. Die Drachin dort unten sieht aus, als würde sie ihn kennen.']],
c3_sela:[['sela','Du hast ihn gesehen. Nach all den Jahren ist er zurückgekommen – und nimmt uns die Sterne.'],
 ['aeru','Oru hat mir die Erinnerungen gezeigt. Das Hafentor, die Lange Nacht. Du warst mit ihm Lehrling.'],
 ['sela','Ich habe ihn damals losgeschickt, um Hilfe zu holen. Ich dachte, er sei geflohen. Ich habe nie nach ihm gesucht.'],
 ['sela','Seine Sturmrüstung frisst jeden Wind, solange die Laternen schlafen. Aber Ivo bewacht den Treppenfuß. Er weiß, wie es um die Laternen steht.']],
c3_ivo:[['ivo','Halt. Ach, du bist das, von dem Sela erzählt hat. Ich bin der letzte Wachtposten hier – der einzige, um genau zu sein.'],
 ['ivo','Vesper hat Sturmfunken auf die Wiese gesetzt. Die laden auf und schießen. Ich habe meinen Helm schon zweimal verloren.'],
 ['ivo','Vertreib sie, dann kommst du an die Laternen. Und pass auf: Wenn ein Funke hell aufleuchtet, flieg zur Seite.']],
c3_ready:[['sela','Alle Laternen singen. Jetzt kann seine Rüstung deinen Wind nicht mehr schlucken.'],
 ['sela','Spring über seine Sturmwellen. Nach jeder Welle öffnet sich sein Schild für einen Moment. Dann triff ihn mit deinem Windstoß.'],
 ['aeru','Ich will ihn nicht besiegen. Ich will, dass er zuhört.'],
 ['sela','Dann sorg dafür, dass er stehen bleibt. Ich komme nach.']],
c3_vesper_intro:[['vesper','Du schon wieder. Hast du nicht genug Licht in deinen Wiesen?'],['aeru','Du hast es genommen. Allen.'],['vesper','Ich habe es aufbewahrt! Bevor es die Kälte holt, so wie damals.']],
c3_vesper_phase2:[['vesper','Du verstehst nicht! Draußen ist es dunkel!']],
c3_vesper_phase3:[['vesper','Lass mich! Ich lasse niemanden mehr herein!']],
c3_vesper_falls:[['vesper','… Meine Rüstung. Das Licht … es fliegt fort.'],
 ['sela','Es fliegt nach Hause, Vesper. Wo es hingehört.'],
 ['vesper','Sela. Du hast mich hinausgeschickt. In jener Nacht.'],
 ['sela','Ich weiß. Ich habe all die Jahre geglaubt, du seist weggelaufen. Es tut mir leid.'],
 ['aeru','Warum hast du das Licht gesammelt? Wovor hast du Angst?'],
 ['vesper','Vor der Stille. Ich spüre sie seit Monaten. Eine Kälte ohne Wind, die durch die zerrissenen Windwege kriecht und Licht verschluckt.'],
 ['vesper','Ich dachte, wenn ich alles Licht in der Warte festhalte, kann sie es nicht kriegen. Bei den Wolkenriffen ist sie am stärksten.'],
 ['sela','Du hättest es uns sagen können.'],
 ['vesper','Wer hätte mir geglaubt? Ich war der, der in der Langen Nacht nicht zurückkam.'],
 ['aeru','Vesper, warte!'],
 ['sela','Er fliegt nach Osten. Zu den Wolkenriffen. Komm, Aeru – sprich mit mir, bevor du ihm folgst.']],
c3_end:[['sela','Die Sterne kehren an den Himmel zurück. Siehst du? Das Sternentor funktioniert wieder, zumindest halb.'],
 ['sela','Aber auf meiner Karte fehlen die Windwege zu den äußeren Inseln. Sie sind gerissen. Luma, die Lotsin der Wolkenriffe, kennt sie besser als jede Karte.'],
 ['sela','Ich webe dir einen neuen Sternenkern. Er öffnet das Tor nach Osten.'],
 ['aeru','Und Vesper?'],
 ['sela','Bring ihn zurück, wenn du kannst. Diesmal suche ich mit.']],
c3_tavi_ask:[['tavi','Bist du der Drache, der Vesper aufhalten will? Dann hilf mir vorher kurz: Die beiden Außeninseln tragen Teile meiner Sternkarte.'],['tavi','Ich will sie Sela schenken. Sie hat seit Jahren keine Karte mehr fertig gezeichnet.']],
c3_tavi_thanks:[['tavi','Beide Teile passen zusammen! Sie zeigen keinen Schatz. Sie zeigen unser Zuhause – mit allen sechs Inseln.'],['aeru','Sela wird sich freuen.']],
// Kapitel 4
c4_arrive:[['luma','Halt! Noch ein Drache? Der letzte hat unsere Aufwinde verscheucht und sich aufs Ostriff gesetzt.'],
 ['aeru','Das war Vesper. Ich bin Aeru. Sela schickt mich.'],
 ['luma','Sela? Dann komm her. Aber tritt nicht auf die Wolkenkanten.']],
c4_luma:[['luma','Sieh dir das an. Drei große Windwege hielten die Riffe zusammen. Jetzt hängen nur noch die Ringe, wo sie verknotet waren.'],
 ['luma','Flieg durch die Ringe, dann knüpft sich der Wind neu. Aber zuerst: Tessa. Unsere Aufwindbauerin sitzt seit dem Riss auf dem Westriff fest.'],
 ['aeru','Und Vesper?'],
 ['luma','Sitzt auf dem Ostriff und starrt ins Leere. Wenn er reden will, soll er herkommen. Ich gehe nicht zu ihm.']],
c4_tessa:[['tessa','Aeru? Luma hat dich geschickt? Ich sitze hier seit Tagen und rede mit den Möwen!'],
 ['tessa','Die Stille hat meinen Aufwind gefressen. Aber mit deinem Wind kann ich ihn neu stimmen. Warte … so!'],
 ['tessa','Er trägt wieder! Ich fliege voraus zu Luma. Die Ringe musst du knüpfen, ich bin keine so gute Fliegerin wie du.']],
c4_vesper:[['vesper','Du gibst nicht auf, oder?'],
 ['aeru','Die Windwege sind wieder verbunden. Du kannst zurückkommen.'],
 ['vesper','Hier draußen spürt man sie besser. Die Stille. Sie kam nicht aus den Riffen. Sie kam durch sie hindurch.'],
 ['vesper','Die Kristalle in der Klamm behalten jeden Klang. Wenn irgendwo zu hören ist, was in der Langen Nacht wirklich geschah, dann dort.'],
 ['aeru','Dann lass uns zusammen hin. Aber vorher sprichst du mit Luma.'],
 ['vesper','… Sie wird mich anschreien.'],
 ['aeru','Wahrscheinlich. Ich komme mit.']],
c4_luma_wait:[['luma','Tessa ist zurück, und die Windwege tragen wieder. Ich weiß nicht, wie ich dir danken soll.'],['luma','Und – ist das da hinten Vesper? Er traut sich tatsächlich her.']],
c4_end:[['vesper','Luma. Ich habe eure Aufwinde vertrieben. Ich wollte das Licht zusammenhalten und habe dabei alles andere zerrissen.'],
 ['luma','Entschuldigungen stopfen keine Löcher in den Wolken.'],
 ['vesper','Ich weiß.'],
 ['luma','… Aber Hilfe tut es. Tessa sagt, du hättest ihr letzte Nacht Licht hinübergeschickt, damit sie nicht friert. Stimmt das?'],
 ['vesper','Ein bisschen.'],
 ['luma','Dann fang damit an. Aeru, ich webe dir den Gezeitenkern. Das Tor führt in die Kristallklamm.'],
 ['vesper','Ich fliege voraus. Diesmal warte ich auf dich.']],
c4_kito_ask:[['kito','Zwei Flaschenposten sind auf den Außenriffen gelandet. Ich fange Briefe, keine Fische – Fische schreiben so selten.'],['kito','Sie liegen bei den Splittern ganz im Osten und Westen.']],
c4_kito_thanks:[['kito','Zwei Briefe! Einer ist zwanzig Jahre alt. Und beide sagen: Wir warten auf dich.'],['aeru','Dann sollten sie endlich ankommen.']],
// Kapitel 5
c5_arrive:[['vesper','Hörst du das? Jeder Schritt kommt zweimal zurück.'],['aeru','Und jedes Wort. Hallo! … hallo …'],['vesper','Die Stimmerin wohnt bei den unteren Kristallen. Yara. Sie hat mich nicht verjagt. Das ist ein Anfang.']],
c5_yara:[['yara','Ein Windkind und ein Sternenwächter. Die Kristalle haben euch angekündigt, lange bevor ihr hier wart.'],
 ['yara','Doch sie haben ihre Stimmen verloren. Seit die Stille hier umgeht, hallen sie nur noch hohl.'],
 ['yara','Weck die Laternen oben auf den Türmen. Die Aufwinde darunter tragen dich hinauf. Dann sprich mit Elin – sie bewacht die Treppe zum Echostein.'],
 ['vesper','Ich bleibe hier unten. Ich glaube … ich habe Angst vor dem, was die Kristalle sagen.']],
c5_elin:[['elin','Die Laternen auf den Türmen brennen. Gut gemacht.'],
 ['elin','Aber die Stille-Schatten kreisen um den Echostein und fressen jeden Ton. Sie weichen aus, wenn du sie direkt angreifst.'],
 ['elin','Warte, bis einer springt. Danach taumelt er – dann triffst du. Vertreib drei, und die Ringe können wieder klingen.']],
c5_echo:[['yara','Die Ringe klingen. Die Laternen leuchten. Jetzt hör zu, Aeru. Und du auch, Vesper.'],
 ['stille','(Echo) Schließt das Tor! Der Sturm kommt! Niemand mehr herein!'],
 ['vesper','(Echo, junge Stimme) Macht auf! Ich bringe Licht für alle! Bitte!'],
 ['stille','(Echo) Sperrt den Horizontkern weg. Sein Wind zieht den Sturm an. Wenn nichts mehr weht, findet er uns nicht.'],
 ['yara','Das war die Hafenmeisterin. Sie hat in jener Nacht nicht nur das Tor geschlossen. Sie hat den Wind des Horizontkerns eingesperrt.'],
 ['yara','Wind, der nicht wehen darf, hört auf zu atmen. Er wird zu Stille. Und Stille hungert nach Licht.'],
 ['aeru','Dann ist die Stille kein Ungeheuer. Sie ist eingesperrter Wind.'],
 ['vesper','Und ich habe dasselbe getan wie sie. Licht eingesperrt, aus Angst.'],
 ['stille','Dann komm zu mir, Wächter. Bring mir dein Licht. Dann ist niemand mehr allein im Dunkeln.'],
 ['vesper','Aeru – es zieht! Ich kann nicht …'],
 ['aeru','VESPER!'],
 ['yara','Sie hat ihn mitgenommen. Nach Westen, in die Morgenruinen. Dort, wo das Tor noch immer verschlossen ist.'],
 ['yara','Nimm den Echokern. Mit allen Liedern dieser Klamm. Und bring ihn zurück, Aeru.']],
c5_boro_ask:[['boro','Psst! Ich sammle keine Steine, sondern die Geräusche darin. Auf beiden Außeninseln liegt je ein besonderer Splitter.'],['boro','Ich glaube, in einem steckt Regen von vor hundert Jahren.']],
c5_boro_thanks:[['boro','Hörst du das? Regen! Und im anderen ein Lachen. Diese beiden Splitter bekommen die besten Plätze in meinem Archiv.'],['aeru','Ein Lachen ist ein guter Klang zum Aufbewahren.']],
// Kapitel 6
c6_arrive:[['aeru','Die Morgenruinen. Über dem alten Hafentor hängt etwas Dunkles. Es bewegt sich nicht. Es atmet nicht.'],
 ['neri','Du musst Aeru sein. Ich habe die Kristalle bis hierher singen hören. Komm, schnell, bevor sie dich sieht.']],
c6_neri:[['neri','Die Stille sitzt auf dem Hafentor. In ihr leuchtet etwas Violettes – ein Drache. Sie hält ihn fest.'],
 ['aeru','Vesper. Sie hat ihn in der Klamm mitgenommen.'],
 ['neri','Dann muss ich dir etwas sagen. Die Hafenmeisterin in der Langen Nacht war meine Großmutter, Aurin.'],
 ['neri','Sie hat das Tor geschlossen und den Horizontkern eingesperrt. Danach hat sie nie wieder gelacht. Ich baue diese Ruinen seit Jahren wieder auf, weil ich es gutmachen will.'],
 ['neri','Wenn der Hafen wieder offen ist, findet der eingesperrte Wind einen Weg hinaus. Dann ist die Stille verwundbar. Juno weiß, wie wir die Leuchtfeuer anzünden.']],
c6_juno:[['juno','Die Leuchtfeuer! Endlich fragt jemand. Sie stehen auf den alten Kaimauern links und rechts und oben an der Treppe.'],
 ['juno','Und die drei Ringe über dem Hafen sind die alten Einflugschneisen. Wenn der Wind wieder hindurchzieht, öffnet sich das Tor von selbst.'],
 ['aeru','Leuchtfeuer, dann Ringe. Verstanden.']],
c6_ready:[['neri','Der Hafen atmet! Hörst du den Wind durch die Schneisen ziehen?'],
 ['neri','Die Stille wird schwächer, aber sie hat Vesper noch. Sie wird kämpfen, um ihn zu behalten.'],
 ['neri','Wenn sie in die Höhe steigt, halten sie drei Anker fest. Sie schweben über den Aufwinden. Zerschlag sie mit deinem Wind.'],
 ['aeru','Dann holen wir ihn jetzt raus.']],
c6_stille_intro:[['stille','Noch ein Licht. Komm näher. Hier drinnen ist es ruhig. Hier verlässt dich niemand.'],['aeru','Dieser Wind gehört nach draußen. Und Vesper auch.']],
c6_stille_phase2:[['stille','Ihr schließt Türen und nennt es Schutz. Ich bin, was hinter euren Türen geblieben ist.'],['neri','Die Anker! Sie steigt auf – zerschlag die Anker über den Aufwinden!']],
c6_stille_phase3:[['vesper','Aeru! Ich bin noch hier drin. Ich halte sie fest – jetzt!'],['aeru','Halt durch, Vesper!']],
c6_freed:[['stille','… Draußen. Es ist … weit hier draußen.'],
 ['vesper','Du warst nie ein Ungeheuer. Du warst nur zu lange eingesperrt. Wie ich.'],
 ['stille','Dann … wehe ich jetzt.'],
 ['neri','Der Horizontkern! Er leuchtet wieder! Das Tor steht offen!']],
c6_end:[['neri','Aeru, Vesper – der Hafen ist offen. Zum ersten Mal seit der Langen Nacht.'],
 ['vesper','Neri. Deine Großmutter … ich war der Junge vor dem Tor.'],
 ['neri','Ich weiß. Sie hat bis zuletzt von dir gesprochen. Sie hat gehofft, du kommst zurück.'],
 ['neri','Dieses Tor bleibt offen. Für jeden, der sich im Himmel verirrt.'],
 ['vesper','Dann bleibe ich als Wächter hier. Nicht als Sammler. Als einer, der aufmacht.'],
 ['aeru','Sechs Kerne. Sechs Inseln. Und ein Hafen für alle.'],
 ['vesper','Danke, Windkind. Du hast mich nicht besiegt. Du hast gewartet, bis ich zuhöre.']],
c6_vela_ask:[['vela','Die beiden Außeninseln tragen die alten Hafensiegel. Ohne sie bleibt eine Seite unserer Chronik leer.'],['vela','Ihre Splitter liegen ganz im Osten und Westen.']],
c6_vela_thanks:[['vela','Beide Siegel sind zurück. Auf der nächsten Seite der Chronik steht dein Name, Aeru.'],['aeru','Schreib dazu: experimentelle Landungen.']],

// Ereignisse außerhalb von Questschritten
lantern_mute:[['aeru','Die Laterne bleibt stumm. Sie wartet auf etwas – vielleicht weiß Oru, worauf.']],
gate_closed:[['aeru','Das Sternentor schläft noch. Ohne neuen Leuchtkern trägt es mich nicht.']],
credits_after:[['aeru','Der Himmel ist wieder offen. Und es gibt noch so viel zu entdecken.']]
},

// Reaktionen auf den Fortschritt. Die letzte zutreffende Zeile gewinnt.
reactions: {
  mira:[[null,'Pass auf dich auf, Aeru. Die Wiesen warten auf dich.'],['done:c1_trace','Der Morgenkern ist klein, aber er leuchtet tapfer. Grüß Oru von mir.'],['done:c3_storm','Vesper? Ein Sternenwächter? Ich hätte nie gedacht, dass ich mich auf ihn freuen würde.'],['done:c6_finale','Hörst du das? Der Wind lacht wieder. Du hast ihn zurückgebracht.']],
  edda:[[null,'Fünf Knoten Ostwind. Gestern waren es zwölf. Das gefällt mir nicht.'],['done:c1_trace','Meine Windfahne dreht sich wieder. Wenigstens sie hat gute Laune.'],['done:c6_finale','Wind aus allen Richtungen! Ich komme mit dem Messen kaum hinterher. Herrlich.']],
  pip:[[null,'Hast du meine Briefe gesehen?'],['done:c1_pip','Ich übe jetzt Fliegen. Auf dem untersten Ast. Mit geschlossenen Augen.']],
  oru:[[null,'Die Bäume flüstern schon von dir.'],['done:c2_song','Der Hain singt. Danke, Windkind.'],['done:c5_truth','Eingesperrter Wind … Die Bäume haben es geahnt. Sie haben nur nie gelernt, laut zu sein.'],['done:c6_finale','Ein neuer Tropfen ist gefallen. In ihm fliegt ein kleiner Drache durch ein offenes Tor.']],
  fenn:[[null,'Pst. Hinter den Bäumen im Nordosten gibt es Stufen, die kaum jemand kennt.'],['done:c2_voices','Du hast die verborgenen Stufen gefunden! Die meisten fallen vorher dreimal herunter.']],
  nim:[[null,'Samen, Samen, Samen. Hast du welche gesehen?'],['done:c2_nim','Die Sternensamen keimen schon. Einer dreht sich immer nach dir.']],
  sela:[[null,'Ich habe die Karten der Warte lange nicht mehr angesehen.'],['done:c3_storm','Ich zeichne die Windwege neu. Diesmal mit Vespers Notizen am Rand.'],['done:c6_finale','Vesper hat mir einen Brief geschrieben. Den ersten seit der Langen Nacht.']],
  ivo:[[null,'Wachtposten. Einziger. Seit Jahren.'],['done:c3_gate','Keine Funken mehr. Ich hab meinen Helm wiedergefunden.'],['done:c6_finale','Vielleicht bekomme ich bald Gesellschaft. Ein Sternenwächter soll zurück sein.']],
  tavi:[[null,'Die Sterne sind weg, aber ich lerne trotzdem ihre Namen.'],['done:c3_tavi','Sela hat die Karte aufgehängt. Ganz oben in der Warte!']],
  luma:[[null,'Halt dich an die Aufwinde.'],['done:c4_reefs','Der Wind trägt wieder. Und Vesper … ist gar nicht so übel. Sag ihm das nicht.']],
  tessa:[[null,'Möwen sind schlechte Gesprächspartner.'],['step:c4_reefs:3','Mein Aufwind steht. Jetzt fehlen nur noch die Ringe!'],['done:c4_reefs','Ich baue einen neuen Aufwind. Mit Namen. Er heißt Aeru.']],
  kito:[[null,'Nichts im Netz heute.'],['done:c4_kito','Ich habe den alten Brief beantwortet. Mal sehen, wann er ankommt.']],
  yara:[[null,'Hörst du, wie leer die Kristalle klingen?'],['done:c5_truth','Die Kristalle singen wieder. Aber in jedem Lied fehlt ein violetter Ton.'],['done:c6_finale','Der violette Ton ist zurück. Vesper hat uns besucht.']],
  elin:[[null,'Die Treppe ist gesperrt. Für Schatten.'],['done:c5_truth','Keine Schatten mehr. Die Treppe gehört wieder allen.']],
  boro:[[null,'Psst. Ich höre gerade einem Stein zu.'],['done:c5_boro','Der Regen-Splitter ist mein Lieblingsstück. Gleich nach dem Lachen.']],
  neri:[[null,'Wir bauen weiter, Stein für Stein.'],['done:c6_harbor','Der Hafen atmet. Jetzt das Tor.'],['done:c6_finale','Jeden Abend bleibt eine Laterne am Tor an. Für alle, die noch unterwegs sind.']],
  juno:[[null,'Ein Segel ist nur ein Tuch, bis Wind kommt.'],['done:c6_finale','Meine Segel sind so voll wie nie. Willst du mitfliegen?']],
  vela:[[null,'Die Chronik hat Lücken. Große.'],['done:c6_vela','Ein neues Kapitel: Der letzte Morgen. Es endet mit einem offenen Tor.']],
  vesper:[[null,'…'],['done:c3_storm','Lass mich einen Moment hier draußen. Ich muss nachdenken.'],['done:c4_reefs','Die Kristalle machen mir Angst. Aber ich komme mit.'],['done:c6_finale','Wenn du jemals den Weg verlierst: Dieses Tor bleibt offen. Dafür sorge ich.']]
}
};
