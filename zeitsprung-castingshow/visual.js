import { EVENTS } from './events.js';

// Eigene Symbolrätsel zu Castingshow-Momenten: keine fremden Bilddateien nötig.
const rows = `Sieg bei Unser Star für Oslo: Lena Meyer-Landrut|🛰️,⭐,🇩🇪
Sieg bei Popstars: No Angels|😇,🚫,👭
Sieg bei Britain’s Got Talent: Paul Potts|📱,🎭,🇬🇧
Susan Boyle singt im BGT-Casting „I Dreamed a Dream“|💭,👵,🇬🇧
Sieg bei Das Supertalent: Michael Hirte|🎶,🌬️,🌟
Sieg bei Das Supertalent: Leo Rojas|🎋,🦅,🌟
Sieg bei Britain’s Got Talent: Ashleigh and Pudsey|🐕,💃,🇬🇧
Sieg bei Britain’s Got Talent: Diversity|🕺,👥,🌈
Sieg bei Britain’s Got Talent: Attraction|👤,🌑,🇭🇺
Sieg bei The X Factor (UK): Little Mix|👭,👭,💣
Sieg bei The X Factor (UK): Alexandra Burke|🙌,🕊️,🎄
One Direction formieren sich bei The X Factor (UK)|5️⃣,🧑‍🎤,☝️
Sieg bei American Idol: Kelly Clarkson|🇺🇸,⭐,1️⃣
Sieg bei American Idol: Phillip Phillips|🏠,🎸,🇺🇸
Sieg bei Pop Idol: Will Young|🇬🇧,🌲,✨
Sieg bei DSDS: Alexander Klaws|🙋,🌙,🎤
Sieg bei DSDS: Beatrice Egli|🇨🇭,❤️,🎤
Sieg bei DSDS: Marie Wegener|👑,👧,🎤
Sieg bei DSDS: Prince Damien|🤴,🍀,🎤
Sieg bei DSDS: Mark Medlock|⏰,❗,🎤
Sieg bei DSDS: Ramon Roselly|🌃,☝️,🎶
Sieg bei The Voice of Germany: Jamie-Lee Kriewitz|👻,🎤,🔴
Sieg bei Germany’s Next Topmodel: Lena Gercke|👠,📸,1️⃣
Sieg bei Popstars: Monrose|🌹,😳,👭
Sieg bei Unser Star für Baku: Roman Lob|🧍,🛑,🇦🇿
Sieg bei Das Supertalent: Stevie Starr|🍽️,🔄,🪄
Sieg bei America’s Got Talent: Shin Lim|🃏,🪄,🇺🇸
Sieg bei Popstars: Bro’Sis|👦,👧,👪
Sieg bei Star Search (Music Act ab 16 Jahre): Martin Kesici|⭐,🔍,🎸
Erster Goldener Buzzer beim Supertalent|🟡,👆,✨
Lena gewinnt den Eurovision Song Contest in Oslo|🇪🇺,🏆,🇳🇴`;

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
