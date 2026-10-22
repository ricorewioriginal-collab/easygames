import { EVENTS } from './events.js';
// Symbolrätsel zu ikonischen ESC-Siegertiteln. Die Antwort nennt das Wettbewerbsjahr.
const ROWS = `1965|🪆,🎶,🇱🇺
1966|🎹,🌹,🇦🇹
1969|4️⃣,🏆,🤝
1972|👋,💔,🇱🇺
1974|💧,⚔️,🇸🇪
1976|💋,💌,🇬🇧
1979|🙌,🎶,🇮🇱
1982|🕊️,☮️,🇩🇪
1985|👯,💃,🇳🇴
1988|🎤,🇨🇭,✨
1995|🌙,🎻,🇳🇴
1998|👑,💃,🇮🇱
2004|🪘,💃,🇺🇦
2006|🤘,👹,🇫🇮
2009|🎻,🧚,🇳🇴
2010|🛰️,🎤,🇩🇪
2012|✨,💃,🇸🇪
2014|🔥,🪽,🇦🇹
2016|1️⃣,9️⃣,4️⃣,4️⃣
2019|🕹️,💔,🇳🇱
2021|🎸,🔥,🇮🇹
2022|👩‍👦,🎤,🇺🇦
2023|💉,❤️,🇸🇪
2024|🔐,🌀,🇨🇭
2025|💔,🎭,🇦🇹
2026|🥁,🎉,🇧🇬`;
export const VISUALS = ROWS.split('\n').map((line, index) => {
  const [year, symbols] = line.split('|');
  const event = EVENTS.find(e => e.year === Number(year));
  return { id: `visual:${index}`, work: `ESC ${year}`, event, category: event.category, world: event.world, symbols: symbols.split(',') };
});
export function visualChoices(item, pool = VISUALS) {
  const others = pool.filter(entry => entry.work !== item.work).map(entry => entry.work);
  for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
  const choices=[item.work,...others.slice(0,3)];
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  return choices;
}
