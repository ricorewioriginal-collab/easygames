import { EVENTS } from './events.js';
const ROWS = `Disneys Große Pause|Disneys Große Pause startet|🏫,⏰,⚽
SpongeBob Schwammkopf|SpongeBob Schwammkopf startet|🧽,🍍,🌊
Kim Possible|Kim Possible startet|📟,🥋,🦸
Phineas und Ferb|Phineas und Ferb startet|🛠️,🏖️,🦆
Die Pfefferkörner|Die Pfefferkörner starten|🔎,🌶️,🚢
Schloss Einstein|Schloss Einstein startet|🏰,📚,👧
Bernd das Brot|Bernd das Brot taucht bei KiKA auf|🍞,😒,📺
H2O – Plötzlich Meerjungfrau|H2O – Plötzlich Meerjungfrau startet|🧜‍♀️,🌊,🌙
Mia and me|Mia and me startet|📖,🦄,🪄
Der kleine Drache Kokosnuss|Der kleine Drache Kokosnuss startet als Serie|🐉,🥥,🏝️
Pokémon|Pokémon startet|⚡,🔴,🐭
Digimon Adventure|Digimon Adventure startet|💻,🦖,🌐
Die Rugrats|Die Rugrats starten|👶,🍼,🧸
Hey Arnold!|Hey Arnold! startet|🏈,🧢,🏙️
Avatar – Der Herr der Elemente|Avatar – Der Herr der Elemente startet|💨,🔥,🌊
Ben 10|Ben 10 startet|⌚,👽,🔟
Hannah Montana|Hannah Montana startet|🎤,🎭,⭐
iCarly|iCarly startet|📹,💻,👧
Gravity Falls|Gravity Falls startet|🗝️,🌲,📖
PAW Patrol|PAW Patrol startet|🐾,🚨,🚒
Miraculous|Miraculous startet|🐞,🐈,🗼
Bluey|Bluey startet|🐕,👨‍👩‍👧‍👧,💙
Die Powerpuff Girls|Die Powerpuff Girls starten|👧,💥,🏙️
Der Zauberschulbus|Der Zauberschulbus startet|🚌,🪄,🔬
DuckTales|DuckTales kehrt als Neuauflage zurück|🦆,💰,🗺️
Adventure Time|Adventure Time startet|🗡️,🐕,🗺️
The Owl House|The Owl House startet|🦉,🪄,🏠
Gabby's Dollhouse|Gabby's Dollhouse startet|🐱,🏠,✨
Cosmo und Wanda|Cosmo und Wanda startet|🪄,👦,🧚
Dora|Dora startet|🎒,🗺️,🐒`;
const eventByTitle = new Map(EVENTS.map(event => [event.title, event]));
export const VISUALS = ROWS.split('\n').map((line,index) => {
  const [work,eventTitle,symbols] = line.split('|');
  const event = eventByTitle.get(eventTitle);
  return { id: `visual:${index}`, work, event, category: event?.category, world: event?.world, symbols: symbols.split(',') };
}).filter(item => item.event);
export function visualChoices(item, pool = VISUALS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
  const choices=[item.work,...others.slice(0,3)];
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  return choices;
}

