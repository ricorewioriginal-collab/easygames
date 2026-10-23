/* Funkmaler – Begriffe zum Malen. Alternativen mit „|“ (zählen auch als richtig). */
(function (root) {
  'use strict';
  const L = s => s.trim().split(/\s*,\s*/);
  const WORDS = {
    leicht: L(`Haus, Baum, Sonne, Mond, Stern, Auto, Ball, Katze, Hund, Fisch, Vogel, Blume, Apfel, Banane, Birne, Tisch, Stuhl, Bett, Tür, Fenster,
      Schiff|Boot, Zug, Flugzeug, Fahrrad|Rad, Brille, Hut, Schuh, Hose, Kleid, Socke, Uhr, Herz, Schlüssel, Buch, Stift, Schere, Löffel, Gabel, Messer, Tasse,
      Glas, Flasche, Kuchen, Eis, Pizza, Brot, Käse, Ei, Wolke, Regen, Schnee, Blitz, Regenbogen, Berg, Meer, Insel, Schneemann, Kerze, Geschenk, Ballon|Luftballon,
      Maus, Schwein, Kuh, Pferd, Schaf, Ente, Frosch, Schlange, Schnecke, Biene, Spinne, Schmetterling, Elefant, Giraffe, Löwe, Hase, Igel, Bär, Pinguin, Wal,
      Telefon|Handy, Fernseher, Lampe, Radio, Gitarre, Trommel, Krone, Drache, Gespenst|Geist, Rakete, Roboter, Pilz, Kirsche, Erdbeere, Karotte|Möhre, Tomate, Zitrone, Ananas, Traube, Melone,
      Hand, Fuß, Auge, Nase, Mund, Ohr, Zahn, Haar, Bart, Regenschirm|Schirm, Zelt, Leiter, Hammer, Säge, Brücke, Turm, Burg, Kirche, Ampel,
      Stern, Pfeil, Würfel, Drachen, Schaukel, Rutsche, Teddy|Teddybär, Puppe, Krokodil, Affe`),
    mittel: L(`Leuchtturm, Vulkan, Wüste, Kaktus, Palme, Wasserfall, Höhle, Iglu, Pyramide, Windmühle, Riesenrad, Achterbahn, Zirkus, Zauberer, Pirat, Ritter, Prinzessin, Hexe, Vampir, Clown,
      Astronaut, Feuerwehr, Polizist, Arzt|Ärztin, Koch|Köchin, Bäcker, Maler, Gärtner, Taucher, Detektiv, Mikrofon, Kopfhörer, Lautsprecher, Plattenspieler, Klavier, Geige, Trompete, Saxofon, Schlagzeug, Notenschlüssel,
      Kamera, Computer|Laptop, Tastatur, Drucker, Taschenrechner, Batterie, Glühbirne, Steckdose, Fernbedienung, Spielkonsole|Konsole, Waschmaschine, Kühlschrank, Toaster, Staubsauger, Bügeleisen, Badewanne, Dusche, Zahnbürste, Spiegel, Kissen,
      Rucksack, Koffer, Geldbeutel|Portemonnaie, Kreditkarte, Briefkasten, Briefmarke, Zeitung, Kalender, Landkarte|Karte, Kompass, Fernglas, Lupe, Mikroskop, Magnet, Anker, Fallschirm, Hubschrauber, U-Boot, Traktor, Bagger,
      Krankenwagen, Feuerwehrauto, Polizeiauto, Motorrad, Roller, Skateboard, Schlittschuh, Ski, Surfbrett, Tennisschläger, Fußballtor|Tor, Pokal, Medaille, Zielscheibe, Bowling, Angel, Lagerfeuer, Grill, Picknick, Hängematte,
      Schatzkiste|Schatz, Flaschenpost, Sanduhr, Wecker, Kuckucksuhr, Ritterrüstung|Rüstung, Schwert, Schild, Pfeil und Bogen|Bogen, Kanone, Einhorn, Meerjungfrau, Dinosaurier|Dino, Ufo, Alien, Mumie, Werwolf, Zombie, Elfe, Zwerg,
      Hamburger|Burger, Pommes, Hotdog, Popcorn, Brezel, Spaghetti|Nudeln, Suppe, Salat, Sushi, Donut, Muffin, Keks, Schokolade, Bonbon, Lutscher, Zuckerwatte, Torte, Waffel, Spiegelei, Toast,
      Oktopus|Krake, Qualle, Seestern, Hai, Delfin, Schildkröte, Papagei, Flamingo, Eule, Fledermaus, Eichhörnchen, Känguru, Koala, Zebra, Nashorn, Nilpferd, Kamel, Lama, Faultier, Ameise`),
    schwer: L(`Radiosender, Moderator|Moderatorin, Hitparade, Ohrwurm, Karaoke, Konzert, Festival, Tanzfläche, Discokugel, Dirigent, Orchester, Chor, Schallplatte, Kassette, Funkturm, Antenne, Satellit, Nachrichten, Wetterbericht, Werbung,
      Zeitreise, Sonnenfinsternis, Polarlicht|Nordlicht, Erdbeben, Tornado, Lawine, Überschwemmung, Gewitter, Sternschnuppe, Milchstraße, Schwarzes Loch, Raumstation, Mondlandung, Komet, Saturn, Marsmensch, Teleskop, Weltall, Gravitation, Mikrowelle,
      Fotosynthese, Evolution, Magnetismus, Elektrizität, Spiegelbild, Schatten, Echo, Langeweile, Freundschaft, Eifersucht, Liebe, Angst, Mut, Traum, Albtraum, Geburtstag, Hochzeit, Urlaub, Heimweh, Feierabend,
      Stau, Baustelle, Kreisverkehr, Tankstelle, Parkhaus, Flughafen, Bahnhof, Rolltreppe, Aufzug|Fahrstuhl, Wolkenkratzer, Freiheitsstatue, Eiffelturm, Brandenburger Tor, Schiefer Turm, Chinesische Mauer, Kolosseum, Big Ben, Stonehenge, Mount Everest, Niagarafälle,
      Selfie, Hashtag, Livestream, Videochat, Passwort, Computervirus|Virus, Ladekabel, WLAN, Drohne, Smartwatch, Virtuelle Realität|VR-Brille, Roboterstaubsauger, Navi|Navigationsgerät, Kassenbon, Geldautomat, Börse, Steuererklärung, Bürokratie, Kaffeepause, Homeoffice,
      Schneeballschlacht, Kissenschlacht, Seifenblase, Kopfstand, Purzelbaum, Seiltänzer, Jongleur, Bauchredner, Pantomime, Marathon, Elfmeter, Weltmeister, Schiedsrichter, Fallrückzieher, Torwart, Siegerehrung, Fotofinish, Bungeejumping, Fallschirmsprung, Sauna,
      Gartenzwerg, Vogelscheuche, Hufeisen, Glückskeks, Kleeblatt, Wunschbrunnen, Zauberstab, Glaskugel, Flaschengeist, Fliegender Teppich, Spukschloss, Labyrinth, Domino, Schachmatt, Puzzle, Zauberwürfel, Sudoku, Kreuzworträtsel, Schnitzeljagd, Versteckspiel`)
  };
  const FM_WORDS = { WORDS, levels: Object.keys(WORDS) };
  if (typeof module !== 'undefined' && module.exports) module.exports = FM_WORDS;
  root.FM_WORDS = FM_WORDS;
})(typeof self !== 'undefined' ? self : this);
