import { EDITIONS } from './events.js';

// Alle Ausgaben liefern eigene Stadt-, Sieger-, Song- und Künstlerfragen.
const played = EDITIONS.filter(e => !e.cancelled);
const unique = values => [...new Set(values)];
function choices(answer, field, year) {
  const decade = Math.floor(year / 10);
  const near = played.filter(e => e.year !== year && Math.floor(e.year / 10) === decade).map(e => e[field]);
  const more = played.filter(e => e.year !== year).map(e => e[field]);
  return [answer, ...unique([...near, ...more]).filter(value => value && value !== answer).slice(0, 3)];
}
const generated = played.flatMap(e => {
  const world = `${Math.floor(e.year / 10) * 10}er`;
  const rows = [
    [`Wo fand der ESC ${e.year} statt?`, e.city, 'city'],
    [`Welcher Beitrag gewann ${e.year}?`, e.song, 'song'],
    [`Wer sang den ESC-Siegersong ${e.year}?`, e.artist, 'artist']
  ];
  if (e.year !== 1969) rows.push([`Welches Land gewann den ESC ${e.year}?`, e.winner, 'winner']);
  return rows.map(([prompt, answer, field]) => ({ id: `k:${e.year}:${field}`, world, category: world, prompt, answer, options: choices(answer, field, e.year) }));
});
const specialRows = `1950er|In welcher Schweizer Stadt begann der ESC 1956?|Lugano|Basel|Zürich|Genf
1960er|Was war am ESC 1969 ungewöhnlich?|Vier Länder teilten sich den Sieg|Es gab kein Publikum|Es traten nur vier Länder an|Der Wettbewerb wurde abgesagt
1960er|Wie hieß Udo Jürgens' Siegertitel von 1966?|Merci, Chérie|Griechischer Wein|Warum nur, warum?|Ein bißchen Frieden
1970er|Welche Band gewann 1974 mit Waterloo?|ABBA|Bucks Fizz|Brotherhood of Man|Teach-In
1970er|Mit welchem Lied gewann Vicky Leandros 1972?|Après toi|L'amour est bleu|Waterloo|Hallelujah
1980er|Welcher deutsche Beitrag gewann 1982?|Ein bißchen Frieden|Satellite|Merci, Chérie|The Voice
1980er|Welcher Sänger gewann 1980 und 1987?|Johnny Logan|Alexander Rybak|Toto Cutugno|Lordi
1980er|Für welches Land trat Céline Dion 1988 an?|Schweiz|Frankreich|Kanada|Belgien
1990er|Welches Land gewann 1992, 1993 und 1994 hintereinander?|Irland|Schweden|Norwegen|Vereinigtes Königreich
1990er|Welche Sängerin gewann 1998 mit Diva?|Dana International|Carola|Charlotte Nilsson|Niamh Kavanagh
2000er|Welche Band brachte 2006 Hard Rock Hallelujah zum Sieg?|Lordi|Måneskin|ABBA|Bobbysocks!
2000er|Welches Land gewann 2004 mit Ruslanas Wild Dances?|Ukraine|Türkei|Griechenland|Finnland
2000er|Welcher Sieger spielte 2009 Geige zu Fairytale?|Alexander Rybak|Johnny Logan|Salvador Sobral|Dima Bilan
2010er|Mit welchem Lied gewann Lena 2010?|Satellite|Taken by a Stranger|Euphoria|Heroes
2010er|Welches Land holte 2017 seinen ersten ESC-Sieg?|Portugal|Bulgarien|Aserbaidschan|Serbien
2010er|Wer gewann 2012 mit Euphoria?|Loreen|Carola|Netta|Nemo
2010er|Wie heißt der Siegersong von Conchita Wurst?|Rise Like a Phoenix|Heroes|Tattoo|Arcade
2020er|Was geschah mit dem für Rotterdam geplanten ESC 2020?|Er wurde wegen der Pandemie abgesagt|Italien gewann ohne Finale|Er fand in Amsterdam statt|Vier Länder teilten den Sieg
2020er|Welches Land gewann 2022, obwohl Liverpool 2023 Gastgeber war?|Ukraine|Italien|Vereinigtes Königreich|Schweden
2020er|Welche Künstlerin gewann zum zweiten Mal 2023?|Loreen|Céline Dion|DARA|Netta
2020er|Welches Land gewann erstmals 2026?|Bulgarien|Österreich|Schweiz|Portugal
2020er|Wie heißt DARAs Siegersong von 2026?|Bangaranga|Wasted Love|The Code|Tattoo`;
const special = specialRows.split('\n').map((line, index) => {
  const [world, prompt, answer, ...wrong] = line.split('|');
  return { id: `special:${index}`, world, category: world, prompt, answer, options: [answer, ...wrong] };
});
export const KNOWLEDGE = [...generated, ...special];
