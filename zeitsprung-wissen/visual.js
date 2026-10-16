import { EVENTS } from './events.js';

// Eigene Symbolrätsel zu Ereignissen: keine fremden Bilddateien nötig.
const rows = `Fall der Berliner Mauer|🧱,🔨,🎉
Mondlandung von Apollo 11|🚀,🌕,👨‍🚀
Untergang der Titanic|🚢,🧊,🌊
Ermordung Julius Caesars|🏛️,🗡️,👑
Luther veröffentlicht 95 Thesen|⛪,📜,🔨
Kolumbus erreicht Amerika|⛵,🌎,🧭
Vesuvausbruch verschüttet Pompeji|🌋,🏛️,🌫️
Sturm auf die Bastille|🏰,⚔️,🥖
Erster Motorflug der Brüder Wright|✈️,👬,🏖️
Wunder von Bern: Deutschland wird Fußball-Weltmeister|⚽,🏆,🌧️
Einführung des Euro-Bargelds|💶,🏧,🎆
Erstbesteigung des Mount Everest|🏔️,🧗,🚩
Klonschaf Dolly wird geboren|🐑,🧬,👯
Apple stellt das erste iPhone vor|📱,🍎,👆
Die erste Website geht online|🌐,💻,🔗
Erste Olympische Spiele der Neuzeit|🏅,🏛️,🏃
Untergang der Spanischen Armada|⛵,⛈️,⚔️
Reaktorkatastrophe von Tschernobyl|☢️,🏭,🌫️
Woodstock-Festival|🎸,🌼,☮️
Erste Herztransplantation|❤️,🏥,🔄
Entdeckung des Grabs von Tutanchamun|⚱️,🔦,🏜️
Röntgen entdeckt die Röntgenstrahlen|🦴,📸,✨
Darwin veröffentlicht „Über die Entstehung der Arten“|🐢,🐦,📖
Bell patentiert das Telefon|☎️,📜,🔔
Benz baut den Patent-Motorwagen|🚗,⚙️,📜
Fleming entdeckt das Penicillin|🧫,💊,🔬
Juri Gagarin fliegt als erster Mensch ins All|🚀,🌍,🔴
Roald Amundsen erreicht den Südpol|🐕,❄️,🧭
Magna Carta|📜,👑,⚖️
Gründung der Vereinten Nationen|🌐,🕊️,🤝
Geburt des ersten Retortenbabys|👶,🧪,🏥
Start des James-Webb-Weltraumteleskops|🔭,🌌,🚀
Erstes Foto eines Schwarzen Lochs|⚫,📸,🌌
Willy Brandts Kniefall in Warschau|🧎,🕯️,🤝
Start von Sputnik 1|🛰️,📡,🌍
Eröffnung des Eiffelturms|🗼,🎡,🌍
Boston Tea Party|☕,📦,🌊
Diebstahl der Mona Lisa|🖼️,🕵️,🚪`;

const eventByTitle = new Map(EVENTS.map(event => [event.title, event]));
export const VISUALS = rows.split('\n').map((line, index) => {
  const [work, symbols] = line.split('|');
  const event = eventByTitle.get(work);
  return { id: `visual:${index}`, work, event, category: event?.category, world: event?.world, symbols: symbols.split(',') };
});

export function visualChoices(item, pool = VISUALS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  if (others.length < 3) return [];
  return [item.work, ...others.sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
}
