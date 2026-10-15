// Eigene Symbolrätsel: keine Poster, Standbilder oder fremden Bilddateien nötig.
const rows = `Disney-Klassiker|Die Eiskönigin – Völlig unverfroren|❄️,👑,⛄
Disney-Klassiker|Der König der Löwen|🦁,👑,🌅
Disney-Klassiker|Aladdin|🪔,🧞,🕌
Disney-Klassiker|Arielle, die Meerjungfrau|🧜‍♀️,🐚,🌊
Disney-Klassiker|Mulan|⚔️,🐉,🏯
Disney-Klassiker|Rapunzel – Neu verföhnt|👸,💇‍♀️,🏰
Disney-Klassiker|Encanto|🏠,✨,🦋
Pixar|Toy Story|🤠,🚀,🧸
Pixar|Findet Nemo|🐠,🌊,🔎
Pixar|Cars|🏎️,🏁,🚗
Pixar|Ratatouille|🐀,👨‍🍳,🍲
Pixar|Oben|🎈,🏠,☁️
Pixar|WALL·E|🤖,🌱,🚀
Marvel|Iron Man|🦾,❤️,🛡️
Marvel|Black Panther|🐈‍⬛,👑,💜
Marvel|Doctor Strange|🌀,🧙,⏱️
Marvel|Guardians of the Galaxy|🚀,🎧,🌌
DC & Superhelden|Batman|🦇,🌃,🦸
DC & Superhelden|Wonder Woman|👑,🛡️,⚔️
Kinderkino|Shrek|🟢,👹,🏰
Kinderkino|Kung Fu Panda|🐼,🥋,🍜
Kinderkino|Drachenzähmen leicht gemacht|🐉,🪓,🛫
Kinderkino|Ich – Einfach unverbesserlich|🍌,💛,🦹
Kinderkino|Der Super Mario Bros. Film|🍄,👨,⭐
Fantasy & Abenteuer|Harry Potter und der Stein der Weisen|🪄,🦉,⚡
Fantasy & Abenteuer|Der Herr der Ringe: Die Gefährten|💍,🧙,⛰️
Fantasy & Abenteuer|Fluch der Karibik|🏴‍☠️,🛳️,🧭
Science-Fiction & Action|Krieg der Sterne|⭐,🚀,⚔️
Science-Fiction & Action|Jurassic Park|🦖,🌴,🚙
Science-Fiction & Action|Zurück in die Zukunft|🚗,⚡,🕰️
Science-Fiction & Action|E.T. – Der Außerirdische|👽,🚲,🌕
Filmklassiker|Der weiße Hai|🦈,🌊,🚤
Filmklassiker|Ghostbusters – Die Geisterjäger|👻,🚫,🚨
Filmklassiker|Kevin – Allein zu Haus|🏠,👦,🎄
Moderne Kinohits|Barbie|💖,👠,🚘
Moderne Kinohits|Oppenheimer|⚛️,💥,🎩
Moderne Kinohits|Top Gun: Maverick|🛩️,🕶️,🏍️
Kinderserien|SpongeBob Schwammkopf|🧽,🍍,🌊
Kinderserien|PAW Patrol|🐾,🐶,🚓
Serien & Figuren|Stranger Things|🚲,🔦,🕳️
Serien & Figuren|Game of Thrones|🐉,👑,🗡️
Serien & Figuren|The Mandalorian|👶,🚀,🪖`;

export const VISUALS = rows.split('\n').map((line, index) => {
  const [category, work, symbols] = line.split('|');
  return { id: `visual:${index}`, category, work, symbols: symbols.split(',') };
});

export function visualChoices(item, pool = VISUALS) {
  const others = [...new Set(pool.map(entry => entry.work).filter(work => work !== item.work))];
  if (others.length < 3) return [];
  return [item.work, ...others.sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
}
