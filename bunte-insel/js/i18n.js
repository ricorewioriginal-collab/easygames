'use strict';
/* Bunte Insel localization layer. Does not alter game data, save keys or game logic.
   Original DOM strings remain the source of truth. Unknown phrases remain German. */
(function(){
  const KEY='bunteInsel_language';
  const en={
    'Bunte Insel':'Colorful Island','Bunte Insel – Das Spiel':'Colorful Island – The Game',
    'Spielen':'Play','Spiel starten':'Start game','Neues Spiel':'New game','Weiter spielen':'Continue',
    'Weiter':'Continue','Zurück':'Back','Schließen':'Close','Abbrechen':'Cancel',
    'OK':'OK','Ja':'Yes','Nein':'No','Fertig':'Done','Start':'Start','Los geht’s!':"Let's go!",
    'Einstellungen':'Settings','Einstellungen öffnen':'Open settings',
    'Pause und Hilfe':'Pause and help','Pause':'Pause','Hilfe':'Help',
    'Spiel neu laden':'Reload game','Spiel speichern':'Save game','Jetzt speichern':'Save now',
    'Vorlesen':'Read aloud','Musik':'Music','Geräusche':'Sound effects','Ton':'Sound',
    'Aufgaben und Hinweise':'Quests and tips','Handbuch und Lösungen':'Guidebook and solutions',
    'Code eingeben':'Enter code','Fehler melden':'Report a bug',
    'Touch-Steuerung':'Touch controls','Stick':'Joystick','Tag und Nacht':'Day and night',
    'Ego-Kamera':'First-person camera','Wohin?':'Where to?','Bauen':'Build',
    'Story-Modus':'Story mode','Spielmodus wechseln':'Change game mode','Freies Spiel':'Free play',
    'Taschis: an':'Taschis: on','Taschis: aus':'Taschis: off',
    'Taschis':'Taschis','Mitspieler':'Players','Inselreise – nächstes Ziel':'Island Journey – Next goal',
    'Auftrag annehmen':'Accept mission','Auftrag ablehnen':'Decline mission',
    'Aufgaben-Kachel ein-/ausklappen':'Expand/collapse mission panel',
    'Schlag':'Punch','Tritt':'Kick','Spezial':'Special','Block':'Block',
    'Heiltrank':'Health potion','Energietrank':'Energy potion','Kampf verlassen':'Leave battle',
    'Handbuch':'Guidebook','Rucksack':'Backpack','Inventar':'Inventory',
    'Karte':'Map','Minikarte':'Mini-map','Weltkarte':'World map',
    'Tag':'Day','Nacht':'Night','Wetter':'Weather','Sprache':'Language',
    'Deutsch':'German','Englisch':'English',


    'Rucksack':'Backpack','Tasche':'Bag','Spaß':'Fun','Mehr':'More',
    'Essen':'Food','Kleidung':'Clothing','Spielzeug':'Toys','Zimmer':'Room',
    'Tiere':'Animals','Hilfe':'Help','Helm':'Helmet','Partyhut':'Party hat',
    'Zauberhut':'Wizard hat','Krone':'Crown','Umhang':'Cape','Kopfhörer':'Headphones',
    'Zylinder':'Top hat','Wikingerhelm':'Viking helmet','Blumenkranz':'Flower crown',
    'Weihnachtsmütze':'Santa hat','Ninja-Stirnband':'Ninja headband',
    'Schal':'Scarf','Fliege':'Bow tie','Medaille':'Medal','Feenflügel':'Fairy wings',
    'Hasenohren':'Bunny ears','Bärenohren':'Bear ears','Katzenohren':'Cat ears',
    'Piratenhut':'Pirate hat','Kochmütze':"Chef's hat",'Cowboyhut':'Cowboy hat',
    'Sonnenbrille':'Sunglasses','Augenklappe':'Eye patch',
    'Armbanduhr':'Wristwatch','Fuchs-Look':'Fox look',
    'Angeln':'Fishing','Springen':'Jump','Sternenstaul':'Stardust',
    'Felder mähen':'Mow fields','Hof-Aufgabe':'Farm quest','Hof-Aufgaben':'Farm quests',
    'Ankommen':'Arrival','Unterwegs':'On the Move','Zuhause':'At Home','Im Ort':'In Town',
    'Mutprobe':'Test of Courage','Spaß-Tag':'Fun Day','Parkdirektor':'Park Director',
    'Willkommen auf der Bunten Insel! Ich bin Bürgermeisterin Rosi. Schau dich um: Sag Hallo, pack deinen Rucksack aus und lass dir den Weg zeigen.':'Welcome to Colorful Island! I am Mayor Rosi. Take a look around: say hello, open your backpack, and find your way.',
    'Auf der Insel gibt es viele Fahrzeuge. Steig ein, hilf den Leuten mit einem Auftrag – und fahr einmal mit dem Zug!':'There are lots of vehicles on the island. Hop in, help someone with a mission, and take a trip on the train!',
    'Bauer Heinz braucht Hilfe! Streichle die Tiere, mäh ein Feld und koch etwas Leckeres in der Hofküche.':'Farmer Heinz needs your help! Pet the animals, mow a field, and cook something tasty in the farmhouse kitchen.',
    'Jetzt wird es spannend! Hau einen Baum, such einen Schatz und schaff den Himmels-Parcours hoch über der Insel.':'The adventure starts now! Chop a tree, hunt for treasure, and complete the sky obstacle course above the island.',
    'Zeig, wie mutig du bist: Gewinne einen Kampf in der Arena, segle aufs Meer und flieg mit dem Hubschrauber.':'Show how brave you are: win an arena battle, sail out to sea, and fly in a helicopter.',
    'Du hast so viel geschafft – jetzt wird gefeiert! Fahr Karussell im Freizeitpark, schau einen Film und spring ins Freibad.':"You've accomplished so much – time to celebrate! Ride a theme park attraction, watch a movie, and take a dip in the pool.",
    'Der Freizeitpark gehört jetzt dir! Geh ins Park-Büro am Eingang, bau Wege, Fahrgeschäfte und Buden – und mach deinen Park richtig beliebt.':'The theme park is yours now! Visit the park office near the entrance, build paths, rides and stalls, and make your park a hit.',
    'Hau einen Baum (geh nah ran und tippe 🪓)':'Chop a tree (get close and tap 🪓)',
    'Finde einen Schatz (🎉 → Spiele → Schatzsuche)':'Find a treasure (🎉 → Games → Treasure Hunt)',
    'Schaffe den Himmels-Parcours':'Complete the sky obstacle course',
    'Gewinne einen Kampf in der Arena':'Win a battle in the arena',
    'Segle mit dem Boot':'Go sailing',
    'Flieg mit dem Hubschrauber':'Fly a helicopter',
    'Fahr eine Attraktion im Freizeitpark':'Ride an attraction at the theme park',
    'Schau einen Film im Kino':'Watch a movie at the cinema',
    'Spring ins Freibad':'Jump into the swimming pool',
    'Baue etwas im Freizeitpark (Park-Büro am Eingang)':'Build something in the theme park (park office at the entrance)',
    'Schließe eine Park-Mission ab':'Complete a park mission',
    'Erreiche 3 Sterne Parkbewertung':'Reach a three-star park rating',
    'Hof-Aufgabe':'Farm quest','Kapitel':'Chapter','Willkommen':'Welcome',
    'Speichern':'Save','Laden':'Load','Neustart':'Restart',
    'Weiter ▶':'Continue ▶','▶ Weiter':'▶ Continue',
    'Hauptmenü':'Main menu','Zum Hauptmenü':'Back to main menu',
    'Zum Spiel':'Back to game','Zurück zum Spiel':'Back to game',
    'Erkunden':'Explore','Abenteuer':'Adventure','Die Inselreise':'The Island Journey',
    'Meine Aufgaben':'My quests','Aufgaben':'Quests','Nächstes Ziel':'Next goal',
    'Mission':'Mission','Ziel':'Goal','Erledigt!':'Completed!',
    'Annehmen':'Accept','Ablehnen':'Decline','Belohnung':'Reward',
    'Kaufen':'Buy','Verkaufen':'Sell','Shop':'Shop','Laden':'Load',
    'Wohnung':'Home','Haus':'House','Garten':'Garden','Bau-Menü':'Build menu',
    'Auto':'Car','Fahrzeuge':'Vehicles','Zug':'Train','Hubschrauber':'Helicopter',
    'Polizei':'Police','Feuerwehr':'Fire department','Krankenwagen':'Ambulance',
    'Schule':'School','Bauernhof':'Farm','Strand':'Beach','Spielplatz':'Playground',
    'Küche':'Kitchen','Kochen':'Cooking','Schlafen':'Sleep',
    'Fragen':'Questions','Antworten':'Answer','Hallo!':'Hello!',
    'Verstanden':'Got it','Bestätigen':'Confirm','Beenden':'Quit',
    'Lautstärke':'Volume','Steuerung':'Controls','Grafik':'Graphics',
    'Schnell':'Fast','Langsam':'Slow','Ein':'On','Aus':'Off',
    'Weiter geht’s!':"Let's keep going!",'Viel Spaß!':'Have fun!',
    'Alle Spiele':'All games','Zur Spieleübersicht':'Back to games',
    'Sprich mit jemandem (tippe auf eine Person)':'Talk to someone (tap a person)',
    'Öffne deinen Rucksack (🎒 oben links)':'Open your backpack (🎒 top left)',
    'Lass dir den Weg zeigen (🧭 oben links)':'Show the way (🧭 top left)',
    'Steig in ein Fahrzeug':'Get into a vehicle',
    'Erledige einen Auftrag (im Fahrzeug „Ja“ sagen)':'Complete a mission (say "Yes" in the vehicle)',
    'Fahr mit dem Zug':'Ride the train',
    'Richte dein Zimmer ein':'Decorate your room',
    'Ernte etwas im Garten':'Harvest something in the garden',
    'Schlaf in deinem Bett':'Sleep in your bed',
    'Streichle ein Tier auf dem Hof':'Pet an animal on the farm',
    'Mäh ein Feld mit dem Traktor':'Mow a field with the tractor',
    'Koche etwas in der Hofküche':'Cook something in the farm kitchen',
    'Kaufe etwas in einem Laden':'Buy something at a shop',
    'Spiel in der Schießbude':'Play at the shooting gallery',
    'Mach ein Foto (📷 oben links)':'Take a photo (📷 top left)',
    'Du hast eine eigene Wohnung und einen Garten! Mach es dir gemütlich, ernte etwas und ruh dich aus.':'You have your own home and garden! Make yourself comfortable, harvest your crops and get some rest.',
    'Im Ort ist immer was los. Geh einkaufen, probier die Schießbude und mach ein schönes Foto.':'There is always something happening in town. Go shopping, try the shooting gallery and take a nice photo.',
    'Auf dem Bauernhof':'At the Farm'
  };
  // Only translate exact, known UI phrases; never alter arbitrary game data, player names or save contents.
  // Reviewed English dialogue/story translations from the current game source.
  Object.assign(en,{"Frische Brötchen! Magst du eins? 🥖":"Fresh bread rolls! Would you like one? 🥖","Mein Geheimrezept: viel Liebe und ein bisschen Zucker.":"My secret recipe: lots of love and a little sugar.","Im Hofladen gibt es Erdbeeren – daraus wird die beste Marmelade!":"The farm shop has strawberries – they make the best jam!","Gestern habe ich einen Fisch mit Hut gefangen. Ehrlich! 🎣":"Yesterday I caught a fish wearing a hat. Really! 🎣","Vom Pier aus fährt das Segelboot. Ahoi!":"The sailboat leaves from the pier. Ahoy!","Fische schlafen mit offenen Augen. Ob sie dabei träumen?":"Fish sleep with their eyes open. I wonder if they dream?","Pflanzen mögen es, wenn man mit ihnen spricht. 🌻":"Plants like it when you talk to them. 🌻","Gieß deine Beete – nach dem Regen wachsen sie besonders schnell!":"Water your garden beds – they grow especially quickly after rain!","Ich kenne jede Straße auf der Insel. Frag mich ruhig!":"I know every street on the island. Just ask me!","Mein Fahrrad hat sogar eine Klingel. Kling-ling!":"My bicycle even has a bell. Ring-ring!","Früher gab es hier nur eine einzige Straße. 👴":"There used to be only one street here. 👴","Weißt du, wie man ein Lagerfeuer-Märchen erzählt? Setz dich zum Camp!":"Do you know how to tell a campfire story? Come sit at the camp!","Ein guter Spaziergang macht den Kopf frei.":"A nice walk clears your mind.","Ich stricke gerade einen Schal – für den Winter, falls es schneit.":"I'm knitting a scarf for winter, in case it snows.","Der Zug fährt einmal rund um die Insel. Tut tuuut!":"The train goes all the way around the island. Choo-choo!","Wusstest du? Ein Hubschrauber fliegt mit einem Drehflügel. 🚁":"Did you know? A helicopter flies using a spinning rotor. 🚁","Zähl mal die Sterne, die du heute gefunden hast!":"Count the stars you've found today!","Neugierig sein ist das Beste, was man machen kann.":"Being curious is one of the best things you can do.","Spiel nie mit Streichhölzern – nur mit dem Spielzeug-Feuer im Camp!":"Never play with matches – only with the pretend campfire!","Die Feuerwehr hat einen Wasserschlauch, der hat richtig Power!":"The fire department has a really powerful water hose!","Wo geht es zum Freibad? Ach, drück einfach auf 🧭! 🗺️":"How do I get to the swimming pool? Just tap 🧭! 🗺️","Diese Insel ist so bunt, ich will gar nicht mehr nach Hause.":"This island is so colorful, I never want to go home.","Mit dem Fahrrad kommt man überall hin – und es ist ganz leise. 🚲":"You can go anywhere by bike, and it's so quiet. 🚲","Ich male die Insel in 100 Farben. 🎨":"I'm painting the island in a hundred colors. 🎨","Mal doch ein Bild für dein Zimmer – es hängt dann an der Wand!":"Paint a picture for your room – it'll hang on the wall!","Blau ist meine Lieblingsfarbe. Und Regenbogen!":"Blue is my favorite color. And rainbows!","La la la … kennst du die Melodie? 🎵":"La la la … do you know the tune? 🎵","Mit dem Klavier kannst du sogar mit Freunden zusammen spielen.":"You can even play the piano with your friends.","Musik macht gute Laune, hört man schon von Weitem.":"Music makes everyone happy – you can hear it from far away.","Mein Hof ist bei Bauer Heinz gleich nebenan. 🚜":"My farm is right next to Farmer Heinz's. 🚜","Kühe geben Milch – sag ihnen schön Danke!":"Cows give us milk – be sure to thank them!","Wenn das Feld gemäht ist, wächst es wieder nach.":"Once a field is mowed, it grows back.","Beim Rennen musst du den Joystick ganz nach außen schieben.":"Push the joystick all the way out when racing.","Am Beckenrand nicht rennen, sonst pfeift Herr Fischer!":"No running beside the pool, or Mr. Fischer will blow his whistle!","Heute koche ich Kürbissuppe! 🥣":"I'm making pumpkin soup today! 🥣","Wer in der Hofküche kocht, wird ein Hobbykoch.":"If you cook in the farm kitchen, you'll become a home chef.","Eier, Milch und Erdbeeren geben einen leckeren Kuchen.":"Eggs, milk and strawberries make a delicious cake.","Ahoi! Auf dem Meer gibt es viel zu entdecken. ⚓":"Ahoy! There's so much to discover at sea. ⚓","Das Piratenschiff am Strand hat sogar Kanonen!":"The pirate ship on the beach even has cannons!","Wer die Schatztruhe findet, wird reich. Vielleicht.":"Whoever finds the treasure chest will be rich. Maybe.","ich laufe jeden Morgen eine Runde um die Insel! 🏃":"I run a lap around the island every morning! 🏃","Fit bleiben macht richtig Spaß!":"Staying fit is so much fun!","Trink genug Wasser, das ist wichtig!":"Drink enough water – it's important!","Wer rastet, der rostet – hihi.":"Keep moving or you'll get rusty – hehe.","Hast du schon einen Igel gesehen? Die sind scheu!":"Have you seen a hedgehog yet? They're shy!","Frische Luft ist die beste Medizin.":"Fresh air is the best medicine.","bei mir wächst alles! 🌻":"Everything grows in my garden! 🌻","Magst du Tomaten oder lieber Erdbeeren?":"Do you prefer tomatoes or strawberries?","ich habe gleich einen wichtigen Termin! 💼":"I have an important appointment soon! 💼","Die Stadt schläft nie – hier ist immer was los.":"The town never sleeps – there's always something happening.","Hast du schon die Läden angeschaut?":"Have you visited the shops yet?","Kaffee gibt es beim Bäcker, ganz frisch.":"The bakery serves fresh coffee.","ich mache lauter Fotos von der Stadt! 📸":"I'm taking lots of photos of the town! 📸","Wo geht es zum Hafen?":"How do I get to the harbor?","Bei euch ist es wunderschön!":"Your home is beautiful!","ich spiele für alle, die zuhören! 🎵":"I play for everyone who listens! 🎵","Musik macht die Stadt bunt.":"Music makes the town colorful.","Magst du tanzen?":"Do you like dancing?","Zuckerwatte ist das Beste!":"Cotton candy is the best!","Willst du einen Zaubertrick sehen? Simsalabim!":"Want to see a magic trick? Abracadabra!","Lachen ist gesund, probier es mal!":"Laughter is good for you – give it a try!","Ich bin das Maskottchen vom Freizeitpark!":"I'm the theme park mascot!","Brumm brumm, viel Spaß hier!":"Roar roar, have lots of fun here!","bei uns darf jeder so sein, wie er ist! 🌈":"Everyone here can be themselves! 🌈","Liebe ist Liebe – und alle gehören dazu.":"Love is love – and everyone belongs.","Wir feiern heute bunt und laut!":"We're celebrating with color and music today!","Du bist toll, so wie du bist!":"You're wonderful just as you are!","der Dampfer pfeift schon wieder! 🚢":"The steamboat is whistling again! 🚢","Hier ist alles schwarz-weiß wie in einem alten Film.":"Everything here is black and white, just like an old movie.","Hast du die Kisten am Kran gesehen?":"Have you seen the crates by the crane?","Kisten stapeln ist harte Arbeit! 📦":"Stacking crates is hard work! 📦","Pass auf beim Kran!":"Be careful around the crane!","Feierabend ist, wenn die Pfeife tönt.":"The working day ends when the whistle blows.","Ich male heute den Brunnen. Das Wasser glitzert wie ein Stern!":"I'm painting the fountain today. The water sparkles like a star!","Manchmal darfst du die Farbe einfach laufen lassen.":"Sometimes you just have to let the paint flow.","Mein nächstes Bild zeigt alle Freunde der Insel.":"My next painting will show all the island's friends.","Hör mal! Der Brunnen gibt den Takt für mein Lied vor.":"Listen! The fountain keeps the beat for my song.","Jede Ecke der Insel klingt ein bisschen anders.":"Every corner of the island sounds a little different.","Vielleicht spielen wir später zusammen ein Konzert?":"Maybe we can play a concert together later?","Hier habe ich früher mit meinen Freunden gespielt.":"I used to play here with my friends.","Ein nettes Hallo macht einen grauen Tag bunt.":"A friendly hello can brighten a gloomy day.","Von dieser Bank aus sieht man fast die ganze Insel.":"You can see almost the entire island from this bench.","Ich sammle Ideen für ein riesiges Abenteuer!":"I'm collecting ideas for a huge adventure!","Der Brunnen ist unser geheimer Treffpunkt.":"The fountain is our secret meeting place.","Wollen wir später den Spielplatz erkunden?":"Shall we explore the playground later?","In unserem Haus wohnt immer jemand, der mitspielt.":"There's always someone to play with in our building.","Ich übe gerade das Rückwärtslaufen. Gar nicht leicht!":"I'm practicing walking backward. It's not easy!","Die Nachbarn winken, wenn ich zur Schule gehe.":"The neighbors wave when I go to school.","Ich gieße die Blumen vor unserem Wohnblock.":"I'm watering the flowers outside our apartment building.","Wenn du Hilfe brauchst, frag ruhig bei uns nach.":"If you need help, just ask us.","Am Abend treffen wir uns hier zum Plaudern.":"We meet here to chat in the evenings.","Mein Teddy heißt Wolke. Er kennt jeden Weg nach Hause!":"My teddy is called Cloud. He knows every way home!","Wir spielen heute Verstecken zwischen den Häusern.":"We're playing hide-and-seek between the houses today.","Ich bringe den Nachbarn frische Brötchen.":"I'm bringing fresh rolls to the neighbors.","Die Haustüren sind bunt, damit man sich leicht zurechtfindet.":"The front doors are colorful so it's easy to find your way.","Bei der Schaukel zählen wir bis zehn.":"We count to ten at the swing.","Komm, wir spielen Fangen!":"Come on, let's play tag!","Mein Rekord auf dem Trampolin ist sieben Sprünge.":"My trampoline record is seven jumps.","Ich bin der Kapitän vom Sandkasten-Schiff!":"I'm the captain of the sandbox ship!","Die Wippe macht am meisten Spaß zu zweit.":"The seesaw is most fun with two people.","Ich habe eine bunte Schatzkarte gemalt.":"I painted a colorful treasure map.","Vielleicht versteckt sich ein Stern beim Spielplatz.":"Maybe there's a star hidden near the playground.","Ich passe auf, dass alle sicher spielen können.":"I make sure everyone can play safely.","Eine kleine Pause auf der Bank tut immer gut.":"A little break on the bench is always nice.","Die Kinder haben heute ein neues Spiel erfunden.":"The kids invented a new game today.","Heute haben wir die Felder und die Tiere versorgt.":"Today we took care of the fields and the animals.","Unsere Kühe mögen Besuch, wenn du ganz ruhig bist.":"Our cows like visitors who stay calm.","Die Äpfel im Hofladen sind frisch gepflückt.":"The apples in the farm shop were freshly picked.","Der Traktor wartet schon auf die nächste Runde.":"The tractor is ready for another round.","Nach der Arbeit gibt es Saft im Hofladen.":"After work, there's juice at the farm shop.","Ich zeige den Kindern, wo das Gemüse wächst.":"I show the children where vegetables grow.","Mein Lieblingsplatz ist neben der Scheune.":"My favorite place is beside the barn.","Morgen möchte ich beim Ernten helfen.":"Tomorrow I'd like to help with the harvest.","Alle Sternblöcke leuchten – die Insel wird wieder bunter!":"All the star blocks are glowing – the island is becoming brighter!","Flitzefuchs Ferdi fordert dich zum Kart-Rennen heraus! Und im Automaten am Platz wartet das Hüpf-Abenteuer bis zur Burg.":"Speedy Fox Ferdi challenges you to a kart race! And the arcade machine in the square leads to a jumping adventure at the castle.","Fahr ein Kart-Rennen und schaffe das Hüpf-Abenteuer":"Win a kart race and complete the jumping adventure","Schnell und geschickt – du bist bereit für die Burg!":"Fast and agile – you're ready for the castle!","Jetzt die Mutprobe: Brocko ist gar nicht böse, nur grummelig. Drück seine drei Kitzel-Knöpfe und weich den rollenden Kieseln aus!":"Now for your test of courage: Brocko isn't evil, just grumpy. Press his three tickle buttons and dodge the rolling pebbles!","Kitzle Felsenkönig Brocko in seiner Burg durch":"Tickle Rock King Brocko in his castle","Brocko lacht und gibt den Sonnenstern zurück!":"Brocko laughs and gives back the sun star!","Die Sonne strahlt wieder über dem Hüpfland – Pia, Pelle, Ferdi und sogar Brocko feiern dich als Hüpf-Held!":"The sun shines over Jump Land again – Pia, Pelle, Ferdi and even Brocko celebrate you as the jumping hero!","Ein Kapselmonster an deiner Seite und ein scharfes Schwert – gut gerüstet!":"A capsule monster by your side and a sharp sword – you're well equipped!","Tief unter dem Dorf liegt die Uralte Höhle. Dort erzählen die Steine von Titan Kron.":"Deep beneath the village lies the Ancient Cave. Its stones tell tales of Titan Kron.","Steige in die Uralte Höhle hinab":"Descend into the Ancient Cave","Du hast die Höhle erforscht und weißt nun, wo Titan Kron haust.":"You've explored the cave and now know where Titan Kron lives.","Titan Kron wartet im Verbotenen Wald! Nimm dein Kapselmonster mit und besiege ihn.":"Titan Kron awaits in the Forbidden Forest! Bring your capsule monster and defeat him.","Titan Kron ist besiegt – die Insel ist gerettet!":"Titan Kron has been defeated – the island is saved!","Die Uralten verneigen sich: Du bist der Held der Rätsel-Insel!":"The Ancients bow before you: you're the hero of Puzzle Island!","Das Licht der Schlüssel":"The Light of the Keys","Das Schlüsselreich versinkt im Schatten! Dunkelwichtel löschen die Laternen. Nur der Lichtschlüssel kann sie wieder entzünden.":"The Key Kingdom is sinking into darkness! Shadow sprites are putting out the lanterns. Only the Light Key can relight them.","Zünde 12 Laternen mit dem Lichtschlüssel an":"Light 12 lanterns with the Light Key","Die Laternen leuchten – die Dunkelwichtel weichen zurück!":"The lanterns glow – the shadow sprites retreat!","Die Ringstraße und der Himmel gehören dem Licht. Sammle die Sterne und flieg mit dem Schlüsselschwert-Mobil.":"The ring road and the skies belong to the light. Collect the stars and fly the Keyblade Mobile.","Sammle alle Sterne der Ringstraße und flieg mit dem Schlüsselschwert-Mobil":"Collect every star along the ring road and fly the Keyblade Mobile","Die ganze Insel strahlt wieder!":"The whole island shines again!","Fünf Schlüssellöcher hüten das Tor der Herzen. Öffne sie alle!":"Five keyholes guard the Gate of Hearts. Open them all!","Öffne das Tor der Herzen im Schlüsselreich":"Open the Gate of Hearts in the Key Kingdom","Das Tor der Herzen steht offen – Feuerwerk!":"The Gate of Hearts is open – fireworks!","Doch im Verbotenen Wald lauert noch der Dunkelriese. Nur der Schlüsselträger kann ihn besiegen.":"But the Dark Giant still lurks in the Forbidden Forest. Only the key bearer can defeat him.","Der Dunkelriese ist besiegt!":"The Dark Giant is defeated!","Flink gefangen, fleißig geübt – die Spur ist heiß!":"Quick catches and lots of practice – you're hot on the trail!","Der winzige Plankto steckt dahinter – mit einem Riesen-Roboter! Hol dir das Rezept zurück!":"Tiny Plankto is behind it all – with a giant robot! Get the recipe back!","Planktos Roboter ist Geschichte – das Rezept ist zurück!":"Plankto's robot is history – the recipe is back!","Die Krabbe feiert dich: Held der Bucht!":"The crab cheers for you: Hero of the Bay!","Funken sprühen – die ersten Seiten leuchten!":"Sparks fly – the first pages begin to glow!","Weiter geht’s: Rutsch vom Frostgipfel und lauf beim Umzug mit.":"Next: slide down Frost Peak and join the parade.","Rutsch vom Frostgipfel und lauf beim Märchen-Umzug mit":"Slide down Frost Peak and join the fairy-tale parade","Die letzten Seiten stecken im Stempelheft und in der Schloss-Show.":"The final pages are hidden in the stamp booklet and the castle show.","Fülle das Stempelheft und starte die Schloss-Show":"Fill the stamp booklet and start the castle show","Alle Seiten sind zurück!":"All the pages are back!","Das Märchenbuch strahlt – und du stehst jetzt darin!":"The fairy-tale book is shining – and now you're in it!","Dein Park wächst!":"Your park is growing!","Jetzt der große Schritt: 3 Sterne Parkbewertung und alle Missionen!":"Now for the big step: earn a three-star park rating and complete every mission!","Der Traumpark ist perfekt!":"The dream park is perfect!","Bruno jubelt: Du bist Parkdirektor!":"Bruno cheers: You're the park director!","Jede Welt öffnet sich, wenn du ihre 3 Aufgaben (Sticker) geschafft hast. Gesperrte Welten erkennst du an der Glaswand mit Schloss.":"Each world opens once you've completed its three sticker quests. Locked worlds have a glass wall with a padlock.","Steig in ein Fahrzeug – die Leute auf der Insel fragen dich, ob du einen Auftrag annehmen willst. Dann „Ja“ sagen!":"Get into a vehicle – islanders may ask you to accept a mission. Say \"Yes\" to accept!","💡 Dein Tagesgeschenk wartet beim nächsten Start auf dich.":"💡 Your daily gift is waiting the next time you start.","📦 Aufträge mit Fahrzeugen":"📦 Vehicle missions","Bericht an der Einsatz-Tafel (Fellretter-Bucht)":"Report to the mission board (Rescue Bay)","💡 Bauer Heinz auf dem Bauernhof hat neue Aufgaben für dich.":"💡 Farmer Heinz has new quests for you at the farm.","💡 Mit 🧭 „Wohin?“ kommst du schnell überall hin, und mit „👣 Weg“ zeigt dir die Insel den Weg.":"💡 Use 🧭 \"Where to?\" to reach any destination, and \"👣 Path\" to show the route.","🎉 Gerade ist nichts offen – schau bei der Einsatz-Tafel in der Fellretter-Bucht oder bei Bauer Heinz auf dem Hof vorbei!":"🎉 Nothing to do right now – check the mission board in Rescue Bay or visit Farmer Heinz at the farm!","schön, dich zu sehen!":"nice to see you!","Fange 3 Käfer":"Catch 3 beetles"});
  const originalText=new WeakMap(),originalAttrs=new WeakMap();
  const attrs=['aria-label','title','placeholder'];
  const skipped=new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','CODE','PRE','OPTION']);
  let lang='de',busy=false;
  try{lang=localStorage.getItem(KEY)||((navigator.language||'de').toLowerCase().startsWith('de')?'de':'en')}catch(_){}
  if(!['de','en'].includes(lang))lang='de';
  function translate(s){if(lang==='de')return s;const match=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);if(!match)return s;const t=match[2];if(en[t]!==undefined)return match[1]+en[t]+match[3];if(cache[t])return match[1]+cache[t]+match[3];enqueue(t);if(/^Kapitel \d+\/\d+ · /.test(t))return match[1]+t.replace(/^Kapitel /,'Chapter ').replace(/ · ([^(]+) /,(_,n)=>' · '+(en[n]||n)+' ')+match[3];const counter=t.match(/^(.*?)\s+(\d+\/\d+)$/);if(counter&&en[counter[1]])return match[1]+en[counter[1]]+' '+counter[2]+match[3];const emojiCounter=t.match(/^(\S+\s+)(.*?)\s+(\d+\/\d+)$/);if(emojiCounter&&en[emojiCounter[2]])return match[1]+emojiCounter[1]+en[emojiCounter[2]]+' '+emojiCounter[3]+match[3];return s}

  // Live translation: browser's built-in Translator API first, optional configured
  // server endpoint second. Never hardcode credentials or send gameplay/save data.
  const CACHE_KEY='bunteInsel_translation_cache_v1';
  const cache=(()=>{try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch(_){return {}}})();
  let translatorPromise=null,endpoint='',queue=[],queued=new Set(),working=false,lastFailure=0;
  try{endpoint=String(window.BUNTE_INSEL_TRANSLATE_ENDPOINT||'')}catch(_){}
  function eligible(t){
    return lang==='en'&&t.length>=5&&t.length<=340&&/[a-zäöüß]{2}/i.test(t)
      &&(/[äöüß]/i.test(t)||/\b(der|die|das|und|mit|du|ein|eine|dein|deine|jetzt|hier|nicht|auf|zum|zur|für|ist|sind|hast|kannst|wird|wurde|weiter|bitte|kapitel|aufgabe)\b/i.test(t))
      &&!/[{<>}]/.test(t);
  }
  async function engine(){
    if(!navigator.onLine)return null;
    if(!translatorPromise)translatorPromise=(async()=>{
      try{
        const api=window.Translator;
        if(!api||typeof api.create!=='function')return null;
        if(typeof api.availability==='function'){
          const status=await api.availability({sourceLanguage:'de',targetLanguage:'en'});
          if(status==='unavailable')return null;
        }
        return await api.create({sourceLanguage:'de',targetLanguage:'en'});
      }catch(_){return null}
    })();
    return translatorPromise;
  }
  async function fetchTranslation(t){
    const e=await engine();
    if(e){try{return await e.translate(t)}catch(_){}}
    if(!endpoint)return null;
    // Endpoint must be provided by the site owner; no public API keys in the game.
    try{
      const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),6000);
      try{
        const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({text:t,source:'de',target:'en'}),signal:ctl.signal});
        if(!r.ok)return null;
        const data=await r.json();return typeof data.translation==='string'?data.translation:null;
      }finally{clearTimeout(timer)}
    }catch(_){return null}
  }
  function saveCache(){
    try{
      const keys=Object.keys(cache);
      if(keys.length>500)for(const k of keys.slice(0,keys.length-500))delete cache[k];
      localStorage.setItem(CACHE_KEY,JSON.stringify(cache))
    }catch(_){}
  }
  function enqueue(t){
    if(!eligible(t)||en[t]!==undefined||cache[t]||queued.has(t)||Date.now()-lastFailure<30000)return;
    if(queue.length>100)return;
    queue.push(t);queued.add(t);if(!working)void processQueue();
  }
  async function processQueue(){
    working=true;
    while(queue.length){
      if(lang!=='en'){queue.length=0;queued.clear();break}
      const t=queue.shift();queued.delete(t);
      const result=await fetchTranslation(t);
      if(typeof result==='string'&&result.trim()&&result.length<1100&&result.trim()!==t){
        cache[t]=result.trim();saveCache();
        if(lang==='en')walk(document.body);
      }else if(!window.Translator&&!endpoint){
        lastFailure=Date.now();queue.length=0;queued.clear();break;
      }else{
        lastFailure=Date.now();
      }
    }
    working=false;
  }
  function textNode(n){
    if(!n.parentElement||skipped.has(n.parentElement.tagName)||n.parentElement.closest('[data-bi-i18n-skip]'))return;
    let base=originalText.get(n);
    if(base===undefined){base=n.nodeValue;originalText.set(n,base)}
    const desired=translate(base);
    if(n.nodeValue!==desired)n.nodeValue=desired;
  }
  function element(el){
    if(el.matches&&el.matches('[data-bi-i18n-skip]'))return;
    let bases=originalAttrs.get(el);if(!bases){bases={};originalAttrs.set(el,bases)}
    for(const a of attrs){if(el.hasAttribute&&el.hasAttribute(a)){
      if(!(a in bases))bases[a]=el.getAttribute(a);
      const v=translate(bases[a]);if(el.getAttribute(a)!==v)el.setAttribute(a,v);
    }}
  }
  function walk(root){
    if(!root)return;busy=true;
    try{
      if(root.nodeType===3){textNode(root);return}
      if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
      if(root.nodeType===1)element(root);
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
      let n;while((n=walker.nextNode())){if(n.nodeType===3)textNode(n);else element(n)}
    }finally{busy=false}
  }
  let scheduled=false;
  const observer=new MutationObserver(changes=>{
    if(scheduled)return;scheduled=true;
    // Re-render only changed branches, and retain their original German strings.
    queueMicrotask(()=>{
      scheduled=false;
      for(const m of changes){
        if(m.type==='characterData'){
          const node=m.target,prior=originalText.get(node);
          if(prior!==undefined&&node.nodeValue!==translate(prior)&&node.nodeValue!==prior)originalText.set(node,node.nodeValue);
          walk(node);
        }else if(m.type==='childList'){
          for(const n of m.addedNodes)walk(n);
        }else if(m.type==='attributes'){
          const el=m.target,bases=originalAttrs.get(el),a=m.attributeName;
          if(bases&&a in bases&&el.getAttribute(a)!==translate(bases[a]))bases[a]=el.getAttribute(a);
          element(el);
        }
      }
    });
  });
  function setLanguage(value){
    if(!['de','en'].includes(value))return;
    lang=value;document.documentElement.lang=value;
    try{localStorage.setItem(KEY,value)}catch(_){}
    walk(document.body);
    document.querySelectorAll('[data-bi-lang]').forEach(btn=>{btn.setAttribute('aria-pressed',String(btn.dataset.biLang===value));btn.classList.toggle('active',btn.dataset.biLang===value)});
    document.dispatchEvent(new CustomEvent('bunteinsel:languagechange',{detail:{language:value}}));
  }
  function setup(){
    const css=document.createElement('style');
    css.textContent='#biLanguage{position:fixed;top:max(12px,env(safe-area-inset-top));left:max(10px,env(safe-area-inset-left));z-index:89999;display:flex;gap:3px;background:#101c31dc;border:1px solid #ffffff5c;border-radius:16px;padding:4px;box-shadow:0 3px 20px #0005}#biLanguage button{border:0;border-radius:11px;padding:7px 10px;background:transparent;color:#eaf3ff;font:700 12px system-ui;cursor:pointer}#biLanguage button.active{background:#267ed2;color:white}#biLanguage button:focus-visible{outline:2px solid #fff}';
    css.textContent+='body:has(#hud:not([hidden])) #biLanguage{display:none}#biLangSettings{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:6px 0;padding:5px;border-radius:10px;background:#162641}#biLangSettings strong{margin-right:5px;font:700 13px system-ui;color:#fff}#biLangSettings button{font:700 12px system-ui;padding:6px 9px;border:1px solid #789bd0;border-radius:8px;background:#23385d;color:white}#biLangSettings button.active{background:#2284cf;border-color:#a2d8ff}';
    document.head.appendChild(css);
    const wrap=document.createElement('div');wrap.id='biLanguage';wrap.dataset.biI18nSkip='1';wrap.setAttribute('aria-label','Language / Sprache');
    wrap.innerHTML='<button data-bi-lang="de" type="button" aria-label="Deutsch">🇩🇪 DE</button><button data-bi-lang="en" type="button" aria-label="English">🇬🇧 EN</button>';
    wrap.addEventListener('click',e=>{const b=e.target.closest('[data-bi-lang]');if(b)setLanguage(b.dataset.biLang)});
    document.body.appendChild(wrap);
    const settings=document.getElementById('toolPanel');
    if(settings){const row=document.createElement('div');row.id='biLangSettings';row.dataset.biI18nSkip='1';row.innerHTML='<strong>🌐 Sprache / Language</strong><button type="button" data-bi-lang="de">🇩🇪 DE</button><button type="button" data-bi-lang="en">🇬🇧 EN</button>';row.addEventListener('click',e=>{const b=e.target.closest('[data-bi-lang]');if(b)setLanguage(b.dataset.biLang)});settings.appendChild(row)}
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
    setLanguage(lang);
  }
  window.BunteInselI18n={get language(){return lang},setLanguage,t:key=>translate(key),dictionary:en,get liveTranslationAvailable(){return !!(window.Translator||endpoint)},get configuredEndpoint(){return !!endpoint}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();