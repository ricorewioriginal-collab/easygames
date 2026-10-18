/* Spinwelten 3D – Erfolge (gestaffelt nach Zählern der Engine) */
(function (SW) {
  'use strict';
  SW.ACHIEVEMENTS = [
    // Spins
    { id: 'a_spin10', icon: '🎰', name: { de: 'Erster Schwung', en: 'First Swing' }, desc: { de: 'Drehe 10-mal die Runenmaschine.', en: 'Spin the Rune Machine 10 times.' }, stat: 'spins', n: 10 },
    { id: 'a_spin100', icon: '🌀', name: { de: 'Runendreher', en: 'Rune Spinner' }, desc: { de: 'Drehe 100-mal die Runenmaschine.', en: 'Spin the Rune Machine 100 times.' }, stat: 'spins', n: 100 },
    { id: 'a_spin1000', icon: '💫', name: { de: 'Wirbelwind', en: 'Whirlwind' }, desc: { de: 'Drehe 1.000-mal die Runenmaschine.', en: 'Spin the Rune Machine 1,000 times.' }, stat: 'spins', n: 1000 },
    { id: 'a_spin10000', icon: '🌪️', name: { de: 'Herr der Walzen', en: 'Master of the Reels' }, desc: { de: 'Drehe 10.000-mal die Runenmaschine.', en: 'Spin the Rune Machine 10,000 times.' }, stat: 'spins', n: 10000 },
    // Münzen
    { id: 'a_coins1e4', icon: '🪙', name: { de: 'Klingende Taschen', en: 'Jingling Pockets' }, desc: { de: 'Verdiene insgesamt 10.000 Münzen.', en: 'Earn 10,000 coins in total.' }, stat: 'coins_earned', n: 10000 },
    { id: 'a_coins1e6', icon: '💰', name: { de: 'Münzmeister', en: 'Coin Champion' }, desc: { de: 'Verdiene insgesamt 1 Million Münzen.', en: 'Earn 1 million coins in total.' }, stat: 'coins_earned', n: 1000000 },
    { id: 'a_coins1e9', icon: '🏦', name: { de: 'Schatzkammer des Himmels', en: 'Sky Treasury' }, desc: { de: 'Verdiene insgesamt 1 Milliarde Münzen.', en: 'Earn 1 billion coins in total.' }, stat: 'coins_earned', n: 1000000000 },
    { id: 'a_coins1e12', icon: '👑', name: { de: 'Sternengold', en: 'Star Gold' }, desc: { de: 'Verdiene insgesamt 1 Billion Münzen.', en: 'Earn 1 trillion coins in total.' }, stat: 'coins_earned', n: 1000000000000 },
    // Bauen
    { id: 'a_build1', icon: '🔨', name: { de: 'Erster Stein', en: 'First Stone' }, desc: { de: 'Schließe deinen ersten Ausbauschritt ab.', en: 'Complete your first upgrade.' }, stat: 'builds', n: 1 },
    { id: 'a_build50', icon: '🏗️', name: { de: 'Baumeisterin', en: 'Master Builder' }, desc: { de: 'Schließe 50 Ausbauschritte ab.', en: 'Complete 50 upgrades.' }, stat: 'builds', n: 50 },
    { id: 'a_build500', icon: '🏰', name: { de: 'Architekt der Wolken', en: 'Architect of the Clouds' }, desc: { de: 'Schließe 500 Ausbauschritte ab.', en: 'Complete 500 upgrades.' }, stat: 'builds', n: 500 },
    // Inseln
    { id: 'a_island1', icon: '🏝️', name: { de: 'Die erste Insel', en: 'The First Island' }, desc: { de: 'Stelle eine Insel vollständig wieder her.', en: 'Fully restore one island.' }, stat: 'islands', n: 1 },
    { id: 'a_island5', icon: '🌅', name: { de: 'Erwacht', en: 'Awakened' }, desc: { de: 'Stelle 5 Inseln wieder her.', en: 'Restore 5 islands.' }, stat: 'islands', n: 5 },
    { id: 'a_island10', icon: '⚙️', name: { de: 'Maschinenflüsterer', en: 'Machine Whisperer' }, desc: { de: 'Stelle 10 Inseln wieder her.', en: 'Restore 10 islands.' }, stat: 'islands', n: 10 },
    { id: 'a_island20', icon: '📜', name: { de: 'Sagenhaft', en: 'Legendary' }, desc: { de: 'Stelle 20 Inseln wieder her.', en: 'Restore 20 islands.' }, stat: 'islands', n: 20 },
    { id: 'a_island30', icon: '🌟', name: { de: 'Hüter des Sternenherzens', en: 'Keeper of the Star Heart' }, desc: { de: 'Stelle alle 30 Inseln wieder her.', en: 'Restore all 30 islands.' }, stat: 'islands', n: 30 },
    // Sturmstreiche
    { id: 'a_attack1', icon: '⚡', name: { de: 'Kleiner Wirbel', en: 'Little Gust' }, desc: { de: 'Spiele deinen ersten Sturmstreich.', en: 'Play your first storm prank.' }, stat: 'attacks', n: 1 },
    { id: 'a_attack25', icon: '🌩️', name: { de: 'Sturmkobold', en: 'Storm Sprite' }, desc: { de: 'Spiele 25 freundliche Sturmstreiche.', en: 'Play 25 friendly storm pranks.' }, stat: 'attacks', n: 25 },
    { id: 'a_attack250', icon: '🌊', name: { de: 'Wettermacher', en: 'Weather Maker' }, desc: { de: 'Spiele 250 freundliche Sturmstreiche.', en: 'Play 250 friendly storm pranks.' }, stat: 'attacks', n: 250 },
    // Expeditionen
    { id: 'a_raid1', icon: '🧭', name: { de: 'Schatzsucher', en: 'Treasure Seeker' }, desc: { de: 'Starte deine erste Schatzexpedition.', en: 'Launch your first treasure expedition.' }, stat: 'raids', n: 1 },
    { id: 'a_raid25', icon: '🗺️', name: { de: 'Kartenleser', en: 'Map Reader' }, desc: { de: 'Starte 25 Schatzexpeditionen.', en: 'Launch 25 treasure expeditions.' }, stat: 'raids', n: 25 },
    { id: 'a_raid250', icon: '💎', name: { de: 'Legendärer Entdecker', en: 'Legendary Explorer' }, desc: { de: 'Starte 250 Schatzexpeditionen.', en: 'Launch 250 treasure expeditions.' }, stat: 'raids', n: 250 },
    // Abwehr & Reparatur
    { id: 'a_block1', icon: '🛡️', name: { de: 'Schutzschild', en: 'Safe and Sound' }, desc: { de: 'Wehre einen Sturmstreich mit einem Schutzorb ab.', en: 'Block a storm prank with a shield orb.' }, stat: 'blocks', n: 1 },
    { id: 'a_block50', icon: '🔮', name: { de: 'Unerschütterlich', en: 'Unshakable' }, desc: { de: 'Wehre 50 Sturmstreiche ab.', en: 'Block 50 storm pranks.' }, stat: 'blocks', n: 50 },
    { id: 'a_repair1', icon: '🔧', name: { de: 'Flickschuster', en: 'Patch-Up Pal' }, desc: { de: 'Repariere dein erstes Bauwerk.', en: 'Repair your first building.' }, stat: 'repairs', n: 1 },
    { id: 'a_repair50', icon: '🧰', name: { de: 'Meistermechaniker', en: 'Master Mechanic' }, desc: { de: 'Repariere 50 Bauwerke.', en: 'Repair 50 buildings.' }, stat: 'repairs', n: 50 },
    // Karten & Alben & Truhen
    { id: 'a_cards10', icon: '🃏', name: { de: 'Sammelfieber', en: 'Collector\'s Fever' }, desc: { de: 'Sammle 10 verschiedene Karten.', en: 'Collect 10 different cards.' }, stat: 'cards', n: 10 },
    { id: 'a_cards100', icon: '📇', name: { de: 'Kartenkenner', en: 'Card Connoisseur' }, desc: { de: 'Sammle 100 verschiedene Karten.', en: 'Collect 100 different cards.' }, stat: 'cards', n: 100 },
    { id: 'a_cards240', icon: '🎴', name: { de: 'Alle Geschichten', en: 'Every Story' }, desc: { de: 'Sammle alle 240 Karten.', en: 'Collect all 240 cards.' }, stat: 'cards', n: 240 },
    { id: 'a_album1', icon: '📘', name: { de: 'Erstes Album', en: 'First Album' }, desc: { de: 'Vervollständige ein Album.', en: 'Complete one album.' }, stat: 'albums', n: 1 },
    { id: 'a_album10', icon: '📚', name: { de: 'Bibliothekar', en: 'Librarian' }, desc: { de: 'Vervollständige 10 Alben.', en: 'Complete 10 albums.' }, stat: 'albums', n: 10 },
    { id: 'a_album30', icon: '🏛️', name: { de: 'Archiv des Himmels', en: 'Archive of the Sky' }, desc: { de: 'Vervollständige alle 30 Alben.', en: 'Complete all 30 albums.' }, stat: 'albums', n: 30 },
    { id: 'a_chest10', icon: '🎁', name: { de: 'Truhenöffner', en: 'Chest Opener' }, desc: { de: 'Öffne 10 Truhen.', en: 'Open 10 chests.' }, stat: 'chests', n: 10 },
    { id: 'a_chest100', icon: '🧳', name: { de: 'Truhenkönig', en: 'Chest Royalty' }, desc: { de: 'Öffne 100 Truhen.', en: 'Open 100 chests.' }, stat: 'chests', n: 100 },
    // Minispiele
    { id: 'a_mg1', icon: '🎲', name: { de: 'Spielkind', en: 'Playful Spirit' }, desc: { de: 'Spiele dein erstes Minispiel.', en: 'Play your first minigame.' }, stat: 'minigames', n: 1 },
    { id: 'a_mg50', icon: '🕹️', name: { de: 'Inselspieler', en: 'Island Gamer' }, desc: { de: 'Spiele 50 Minispiele.', en: 'Play 50 minigames.' }, stat: 'minigames', n: 50 },
    { id: 'a_mgwin10', icon: '🏅', name: { de: 'Geschickte Pfoten', en: 'Nimble Paws' }, desc: { de: 'Gewinne 10 Minispiele.', en: 'Win 10 minigames.' }, stat: 'mg_wins', n: 10 },
    { id: 'a_mgwin100', icon: '🏆', name: { de: 'Champion der Inseln', en: 'Island Champion' }, desc: { de: 'Gewinne 100 Minispiele.', en: 'Win 100 minigames.' }, stat: 'mg_wins', n: 100 },
    // Begleiter
    { id: 'a_comp1', icon: '🐾', name: { de: 'Nie mehr allein', en: 'Never Alone' }, desc: { de: 'Schalte einen Begleiter frei.', en: 'Unlock a companion.' }, stat: 'companions', n: 1 },
    { id: 'a_comp4', icon: '🦊', name: { de: 'Bunte Truppe', en: 'Merry Band' }, desc: { de: 'Schalte 4 Begleiter frei.', en: 'Unlock 4 companions.' }, stat: 'companions', n: 4 },
    { id: 'a_train10', icon: '🥕', name: { de: 'Trainerin', en: 'Trainer' }, desc: { de: 'Trainiere deine Begleiter 10-mal.', en: 'Train your companions 10 times.' }, stat: 'trains', n: 10 },
    { id: 'a_train100', icon: '💪', name: { de: 'Meistertrainer', en: 'Master Trainer' }, desc: { de: 'Trainiere deine Begleiter 100-mal.', en: 'Train your companions 100 times.' }, stat: 'trains', n: 100 },
    // Aufgaben & Events & Tausch
    { id: 'a_quest10', icon: '📋', name: { de: 'Hilfsbereit', en: 'Helpful' }, desc: { de: 'Erfülle 10 Story-Aufgaben.', en: 'Complete 10 story quests.' }, stat: 'quests', n: 10 },
    { id: 'a_quest60', icon: '📖', name: { de: 'Held der Geschichte', en: 'Hero of the Tale' }, desc: { de: 'Erfülle alle 60 Story-Aufgaben.', en: 'Complete all 60 story quests.' }, stat: 'quests', n: 60 },
    { id: 'a_event1000', icon: '🎉', name: { de: 'Festgast', en: 'Festival Guest' }, desc: { de: 'Sammle 1.000 Eventpunkte.', en: 'Collect 1,000 event points.' }, stat: 'event_points', n: 1000 },
    { id: 'a_event25000', icon: '🎆', name: { de: 'Seele des Festes', en: 'Life of the Party' }, desc: { de: 'Sammle 25.000 Eventpunkte.', en: 'Collect 25,000 event points.' }, stat: 'event_points', n: 25000 },
    { id: 'a_trade1', icon: '🤝', name: { de: 'Faire Hand', en: 'Fair Hand' }, desc: { de: 'Tausche zum ersten Mal Karten.', en: 'Trade cards for the first time.' }, stat: 'trades', n: 1 },
    { id: 'a_trade25', icon: '🔁', name: { de: 'Marktplatzstar', en: 'Market Star' }, desc: { de: 'Tausche 25-mal Karten.', en: 'Trade cards 25 times.' }, stat: 'trades', n: 25 },
    // Glück
    { id: 'a_bigwin1', icon: '✨', name: { de: 'Großer Fang', en: 'Big Catch' }, desc: { de: 'Lande deinen ersten Großgewinn.', en: 'Land your first big win.' }, stat: 'bigwins', n: 1 },
    { id: 'a_bigwin50', icon: '🌈', name: { de: 'Glückspilz', en: 'Lucky Duck' }, desc: { de: 'Lande 50 Großgewinne.', en: 'Land 50 big wins.' }, stat: 'bigwins', n: 50 },
    { id: 'a_jackpot1', icon: '🎇', name: { de: 'Wunder geschehen', en: 'Wonders Happen' }, desc: { de: 'Hol dir einen Wunder-Jackpot.', en: 'Hit a Wonder Jackpot.' }, stat: 'jackpots', n: 1 },
    { id: 'a_jackpot10', icon: '🌠', name: { de: 'Sternenregen', en: 'Starfall' }, desc: { de: 'Hol dir 10 Wunder-Jackpots.', en: 'Hit 10 Wonder Jackpots.' }, stat: 'jackpots', n: 10 },
    { id: 'a_mult5', icon: '✖️', name: { de: 'Mutig', en: 'Bold' }, desc: { de: 'Spiele mit Multiplikator ×5.', en: 'Play with a ×5 multiplier.' }, stat: 'max_mult', n: 5 },
    { id: 'a_mult50', icon: '🚀', name: { de: 'Volle Kraft', en: 'Full Power' }, desc: { de: 'Spiele mit Multiplikator ×50.', en: 'Play with a ×50 multiplier.' }, stat: 'max_mult', n: 50 },
    // Online
    { id: 'a_online1', icon: '🌐', name: { de: 'Weltverbunden', en: 'Connected' }, desc: { de: 'Spiele eine Online-Runde.', en: 'Play an online round.' }, stat: 'online_games', n: 1 },
    { id: 'a_online25', icon: '📡', name: { de: 'Himmelsfunker', en: 'Sky Broadcaster' }, desc: { de: 'Spiele 25 Online-Runden.', en: 'Play 25 online rounds.' }, stat: 'online_games', n: 25 },
    { id: 'a_onlinewin1', icon: '🥇', name: { de: 'Erster Online-Sieg', en: 'First Online Win' }, desc: { de: 'Gewinne eine Online-Runde.', en: 'Win an online round.' }, stat: 'online_wins', n: 1 },
    { id: 'a_onlinewin10', icon: '🏵️', name: { de: 'Weltenmeister', en: 'World Champion' }, desc: { de: 'Gewinne 10 Online-Runden.', en: 'Win 10 online rounds.' }, stat: 'online_wins', n: 10 },
    // Treue, Revanche, Besuche
    { id: 'a_days3', icon: '📅', name: { de: 'Stammgast', en: 'Regular' }, desc: { de: 'Spiele an 3 verschiedenen Tagen.', en: 'Play on 3 different days.' }, stat: 'days', n: 3 },
    { id: 'a_days30', icon: '🗓️', name: { de: 'Treue Seele', en: 'Faithful Friend' }, desc: { de: 'Spiele an 30 verschiedenen Tagen.', en: 'Play on 30 different days.' }, stat: 'days', n: 30 },
    { id: 'a_revenge1', icon: '😄', name: { de: 'Mit Augenzwinkern', en: 'With a Wink' }, desc: { de: 'Schlage einmal freundlich zurück.', en: 'Strike back once, all in good fun.' }, stat: 'revenges', n: 1 },
    { id: 'a_revenge25', icon: '😎', name: { de: 'Letztes Lachen', en: 'Last Laugh' }, desc: { de: 'Schlage 25-mal zurück.', en: 'Strike back 25 times.' }, stat: 'revenges', n: 25 },
    { id: 'a_visit5', icon: '🔭', name: { de: 'Neugierig', en: 'Curious' }, desc: { de: 'Besuche 5 fremde Inseln im Atlas.', en: 'Visit 5 islands in the Atlas.' }, stat: 'visits', n: 5 },
    { id: 'a_visit50', icon: '🎒', name: { de: 'Weltreisender', en: 'Globetrotter' }, desc: { de: 'Besuche 50 fremde Inseln im Atlas.', en: 'Visit 50 islands in the Atlas.' }, stat: 'visits', n: 50 },
    // Neues Spiel+
    { id: 'a_ngplus1', icon: '♾️', name: { de: 'Neue Wirbel', en: 'New Swirls' }, desc: { de: 'Beginne ein Neues Spiel+.', en: 'Start a New Game+.' }, stat: 'ngplus', n: 1 },
    { id: 'a_ngplus3', icon: '🌌', name: { de: 'Ewiger Weltenhüter', en: 'Eternal World Keeper' }, desc: { de: 'Beginne dreimal ein Neues Spiel+.', en: 'Start New Game+ three times.' }, stat: 'ngplus', n: 3 }
  ];
})(globalThis.SW = globalThis.SW || {});
