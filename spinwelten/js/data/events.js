/* Spinwelten 3D – 12 Events, Truhen, Tages-/Wochenziele.
 * Event-Kalender (ohne Server deterministisch aus dem Datum): ab 2026-01-01 UTC wechselt alle 3 Tage das Event,
 * Reihenfolge wie in EVENTS. Jedes Event hat echte Punktequellen (pts: Aktion -> Punkte) und Belohnungsschwellen.
 * Kein Fake-Countdown: angezeigt wird die echte Restzeit bis zum Wechsel. */
(function (SW) {
  'use strict';
  const T = (de, en) => ({ de, en });
  SW.EVENTS = [
    { id: 'bau_festival', icon: '🏗️', name: T('Bau-Festival', 'Building Festival'), desc: T('Jeder Ausbauschritt bringt Festpunkte.', 'Every upgrade step earns festival points.'), pts: { build: 12, portal: 1 } },
    { id: 'sternenregen', icon: '🌠', name: T('Sternenregen', 'Star Shower'), desc: T('Sternenkristalle auf der Maschine zählen doppelt.', 'Star crystals on the machine count double.'), pts: { sym_star: 6, portal: 1 } },
    { id: 'kristalljagd', icon: '💎', name: T('Kristalljagd', 'Crystal Hunt'), desc: T('Gewinne Minispiele und finde Kristalle.', 'Win minigames and find crystals.'), pts: { mg_win: 40, sym_star: 3, portal: 1 } },
    { id: 'kompass_woche', icon: '🧭', name: T('Schatzkompass-Tage', 'Compass Days'), desc: T('Schatzexpeditionen bringen viele Punkte.', 'Treasure expeditions earn lots of points.'), pts: { raid: 50, sym_compass: 4, portal: 1 } },
    { id: 'portalmarathon', icon: '🌀', name: T('Portalmarathon', 'Portal Marathon'), desc: T('Portalfunken zählen dreifach.', 'Portal sparks count triple.'), pts: { portal: 3 } },
    { id: 'kartenfest', icon: '🃏', name: T('Kartenfest', 'Card Festival'), desc: T('Jede neue Karte und jede Truhe zählt.', 'Every new card and chest counts.'), pts: { new_card: 25, chest: 15, portal: 1 } },
    { id: 'freundeshilfe', icon: '🤝', name: T('Freundeshilfe', 'Friendly Help'), desc: T('Tauschen, Online-Runden und Reparaturen bringen Punkte.', 'Trades, online rounds and repairs earn points.'), pts: { trade: 40, online: 60, repair: 20, portal: 1 } },
    { id: 'begleiter_rallye', icon: '🐾', name: T('Begleiter-Rallye', 'Companion Rally'), desc: T('Trainiere und pflege deine Begleiter.', 'Train and care for your companions.'), pts: { train: 35, care: 15, portal: 1 } },
    { id: 'sturmmeisterschaft', icon: '⚡', name: T('Sturmmeisterschaft', 'Storm Championship'), desc: T('Sturmangriffe und abgewehrte Stürme zählen.', 'Storm attacks and blocked storms count.'), pts: { attack: 45, block: 30, portal: 1 } },
    { id: 'insel_rennen', icon: '🏁', name: T('Insel-Rennen', 'Island Race'), desc: T('Bauen und Inseln abschließen bringt Rennpunkte.', 'Building and finishing islands earns race points.'), pts: { build: 8, island: 200, portal: 1 } },
    { id: 'reliktfest', icon: '❖', name: T('Reliktfest', 'Relic Festival'), desc: T('Jedes gefundene Relikt zählt.', 'Every relic found counts.'), pts: { relic: 2, sym_relic: 4, portal: 1 } },
    { id: 'team_expedition', icon: '🛰️', name: T('Team-Expedition', 'Team Expedition'), desc: T('Expeditionen und Online-Teamrunden zählen.', 'Expeditions and online team rounds count.'), pts: { raid: 35, online: 70, mg_win: 20, portal: 1 } }
  ];
  SW.EVENT_EPOCH = Date.UTC(2026, 0, 1);
  SW.EVENT_DAYS = 3;
  // Belohnungsschwellen (gleich für alle Events, Münzen = Basis-Vielfache)
  SW.EVENT_TIERS = [
    { at: 60,   reward: { spins: 10 } },
    { at: 180,  reward: { coins: 30, relics: 10 } },
    { at: 400,  reward: { chest: 'silber' } },
    { at: 750,  reward: { spins: 40 } },
    { at: 1200, reward: { chest: 'gold', coins: 80 } },
    { at: 2000, reward: { chest: 'stern', spins: 60 } }
  ];
  // Truhen: Kartenanzahl, Seltenheits-Wahrscheinlichkeiten in Prozent [gewöhnlich, selten, episch, mythisch], Preis in Relikten
  SW.CHESTS = {
    holz:   { cards: 2,  odds: [80, 17, 3, 0],   price: 25,  col: '#b07a45', name: T('Holztruhe', 'Wooden Chest') },
    silber: { cards: 4,  odds: [64, 26, 8, 2],   price: 70,  col: '#c9d6e3', name: T('Silbertruhe', 'Silver Chest') },
    gold:   { cards: 6,  odds: [45, 33, 17, 5],  price: 160, col: '#f2c14e', name: T('Goldtruhe', 'Gold Chest') },
    stern:  { cards: 10, odds: [25, 35, 28, 12], price: 420, col: '#7fe8ff', name: T('Sternentruhe', 'Star Chest') }
  };
  SW.RARITY = [
    { id: 0, col: '#9fb4c8', name: T('Gewöhnlich', 'Common'), dupRelics: 2 },
    { id: 1, col: '#3fd8e8', name: T('Selten', 'Rare'), dupRelics: 5 },
    { id: 2, col: '#c58bff', name: T('Episch', 'Epic'), dupRelics: 12 },
    { id: 3, col: '#ffc94a', name: T('Mythisch', 'Mythic'), dupRelics: 30 }
  ];
  // Tagesziele: drei werden je Tag aus dem Datum gewählt; Wochenziele analog je Kalenderwoche
  SW.DAILY_GOALS = [
    { stat: 'spins', n: 30, name: T('Drehe 30-mal', 'Spin 30 times') },
    { stat: 'builds', n: 3, name: T('Baue 3 Stufen aus', 'Upgrade 3 stages') },
    { stat: 'mg_wins', n: 1, name: T('Gewinne ein Minispiel', 'Win a minigame') },
    { stat: 'raids', n: 1, name: T('Mache eine Schatzexpedition', 'Go on a treasure expedition') },
    { stat: 'attacks', n: 1, name: T('Starte einen Sturmangriff', 'Launch a storm attack') },
    { stat: 'chests', n: 1, name: T('Öffne eine Truhe', 'Open a chest') },
    { stat: 'trains', n: 1, name: T('Trainiere einen Begleiter', 'Train a companion') },
    { stat: 'event_points', n: 60, name: T('Sammle 60 Eventpunkte', 'Earn 60 event points') },
    { stat: 'visits', n: 1, name: T('Besuche eine Insel im Atlas', 'Visit an island in the atlas') }
  ];
  SW.WEEKLY_GOALS = [
    { stat: 'spins', n: 300, name: T('Drehe 300-mal', 'Spin 300 times') },
    { stat: 'builds', n: 25, name: T('Baue 25 Stufen aus', 'Upgrade 25 stages') },
    { stat: 'mg_wins', n: 6, name: T('Gewinne 6 Minispiele', 'Win 6 minigames') },
    { stat: 'raids', n: 8, name: T('Mache 8 Schatzexpeditionen', 'Go on 8 expeditions') },
    { stat: 'attacks', n: 8, name: T('Starte 8 Sturmangriffe', 'Launch 8 storm attacks') },
    { stat: 'cards', n: 15, name: T('Finde 15 neue Karten', 'Find 15 new cards') },
    { stat: 'event_points', n: 600, name: T('Sammle 600 Eventpunkte', 'Earn 600 event points') }
  ];
  // Relikt-Laden (nur Spielwährung Relikte, kein Echtgeld)
  SW.SHOP = [
    { id: 'chest_holz', kind: 'chest', arg: 'holz', price: 25 },
    { id: 'chest_silber', kind: 'chest', arg: 'silber', price: 70 },
    { id: 'chest_gold', kind: 'chest', arg: 'gold', price: 160 },
    { id: 'chest_stern', kind: 'chest', arg: 'stern', price: 420 },
    { id: 'snack', kind: 'snack', arg: 3, price: 15, name: T('3 Funkelsnacks (Begleiter-Training)', '3 Sparkle Snacks (companion training)') },
    { id: 'shield', kind: 'shield', arg: 1, price: 40, daily: 1, name: T('Schutzorb (1× pro Tag)', 'Shield orb (once a day)') }
  ];
})(globalThis.SW = globalThis.SW || {});
