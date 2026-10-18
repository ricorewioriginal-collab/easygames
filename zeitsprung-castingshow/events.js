import { SEASONS, SHOW_INFO } from './shows.js';

// Zeitstrahl-Momente: jeder Staffelsieg aus shows.js plus besondere Momente der Castingshow-Geschichte.
// Moment | Jahr | kurze Einordnung (verrät das Jahr nicht) | Themenwelt
const MOMENTS = `Start von Popstars in Neuseeland|1999|Produzent Jonathan Dowling formt die Girlgroup TrueBliss|Popstars & weitere deutsche Shows
Making the Band startet in den USA|2000|ABC begleitet die Gründung der Band O-Town|Idol, X Factor & international
Start von Pop Idol in Großbritannien|2001|ITV, Erfinder Simon Fuller|Idol, X Factor & international
Start von Operación Triunfo in Spanien|2001|erste Siegerin: Rosa López vor David Bisbal|Idol, X Factor & international
Start von Star Academy in Frankreich|2001|TF1, erste Siegerin: Jenifer|Idol, X Factor & international
Start von DSDS bei RTL|2002|deutscher Ableger des Idol-Formats|Deutschland sucht den Superstar
Start von American Idol|2002|Fox, erste Moderatoren Ryan Seacrest und Brian Dunkleman|Idol, X Factor & international
Idols in Südafrika: erster internationaler Idol-Ableger|2002|Start am 10. März|Idol, X Factor & international
Sieg bei Fame Academy (RTL II): Become One|2003|alle sechs Finalisten kommen in die Band|Popstars & weitere deutsche Shows
Sieg bei World Idol: Kurt Nilsen|2003|Idol-Sieger aus aller Welt treten gegeneinander an|Idol, X Factor & international
Daniel Küblböck wird Dritter bei DSDS|2003|Kultkandidat der ersten Staffel|Deutschland sucht den Superstar
William Hung singt „She Bangs“ im American-Idol-Casting|2004|legendäres Casting, Song von Ricky Martin|Idol, X Factor & international
Jennifer Hudson scheidet bei American Idol als Siebte aus|2004|später Oscar- und EGOT-Gewinnerin|Idol, X Factor & international
Start von The X Factor in Großbritannien|2004|ITV, Erfinder Simon Cowell|Idol, X Factor & international
Start von America’s Got Talent|2006|NBC, erste Ausgabe des Got-Talent-Formats|Supertalent & Got Talent
Start von Britain’s Got Talent|2007|ITV, Jury u. a. Simon Cowell|Supertalent & Got Talent
Start von Das Supertalent bei RTL|2007|die erste Staffel hat nur drei Folgen|Supertalent & Got Talent
Susan Boyle singt im BGT-Casting „I Dreamed a Dream“|2009|das Video geht um die Welt|Supertalent & Got Talent
Adam Lambert wird Zweiter bei American Idol|2009|Sieger wird Kris Allen|Idol, X Factor & international
„Killing in the Name“ verhindert die X-Factor-Weihnachts-Nr.-1|2009|Facebook-Kampagne gegen den Siegersong von Joe McElderry|Idol, X Factor & international
Sieg bei Unser Star für Oslo: Lena Meyer-Landrut|2010|Platz 2: Jennifer Braun · Jury-Präsident Stefan Raab|Popstars & weitere deutsche Shows
Lena gewinnt den Eurovision Song Contest in Oslo|2010|„Satellite“ holt 246 Punkte|Popstars & weitere deutsche Shows
Start von The Voice of Holland|2010|RTL 4, Erfinder John de Mol und Roel van Velzen|The Voice
One Direction formieren sich bei The X Factor (UK)|2010|fünf Solo-Kandidaten werden zur Boyband, am Ende Platz 3|Idol, X Factor & international
Start von The Voice of Germany|2011|ProSieben und Sat.1, erste Coaches u. a. Nena und Xavier Naidoo|The Voice
Sieg bei Unser Song für Deutschland: „Taken by a Stranger“|2011|gesucht wurde nur das Lied für Lena|Popstars & weitere deutsche Shows
Sieg bei Unser Star für Baku: Roman Lob|2012|Song „Standing Still“, mitgeschrieben von Jamie Cullum|Popstars & weitere deutsche Shows
Sieg bei DSDS Kids: Marco Kappel|2012|einzige Staffel des Kinder-Ablegers, Jury mit Dieter Bohlen|Deutschland sucht den Superstar
Erster Goldener Buzzer beim Supertalent|2012|später von BGT und AGT übernommen|Supertalent & Got Talent
Guinness kürt Got Talent zum erfolgreichsten Reality-TV-Format|2014|Ableger in über 60 Ländern|Supertalent & Got Talent
Matthias Nebel singt „Bed of Roses“ in den Blind Auditions|2018|The Voice of Germany|The Voice
Alicia-Awa bekommt im DSDS-Casting die Goldene CD|2019|später in den Top 10 ihrer Staffel|Deutschland sucht den Superstar
Georgia Balke singt „Creep“ beim Supertalent|2019|die Achtjährige wird Zweite und gewinnt später The Voice Kids|Supertalent & Got Talent
DSDS-Allstars singen „We Have a Dream“|2020|die Hymne der ersten Staffel mit Dieter Bohlen am Flügel|Deutschland sucht den Superstar
Nicole Frolov singt „Never Enough“ im DSDS-Casting|2020|Song aus „The Greatest Showman“|Deutschland sucht den Superstar
Loren Allred bekommt bei BGT den Goldenen Buzzer|2022|die Originalstimme von „Never Enough“|Supertalent & Got Talent
Coaches eröffnen The Voice of Germany mit „As It Was“|2024|Staffel-Opening mit allen Coaches|The Voice
Tanzcrew Unreal bekommt bei AGT den Goldenen Buzzer|2025|Tanzcrew aus Indien|Supertalent & Got Talent
RTL beendet Das Supertalent vorerst|2025|Grund: Konkurrenz durch soziale Medien|Supertalent & Got Talent
Bewerbungsstart für DSDS-Staffel 23|2026|RTL sucht wieder Kandidaten, Jury mit Dieter Bohlen|Deutschland sucht den Superstar`;

export const WORLDS = Object.fromEntries([...new Set(Object.values(SHOW_INFO).map(show => show.world))].map(world => [world, [world]]));
export const worldOf = category => category;

export const winTitle = season => season.show === 'ss' ? `Sieg bei Star Search (${season.act}): ${season.winner}` : `Sieg bei ${SHOW_INFO[season.show].name}: ${season.winner}`;
function winInfo(season) {
  const info = SHOW_INFO[season.show], parts = [];
  if (season.show === 'ss') parts.push('Sat.1-Talentshow');
  else if (season.act) parts.push(season.act);
  if (season.coach) parts.push(`${season.show === 'xf' || season.show === 'xfuk' ? 'Mentor' : 'Coach'}: ${season.coach}`);
  if (season.runnerUp) parts.push(`Platz 2: ${season.runnerUp}`);
  if (season.song && !season.song.title.includes(String(season.year))) parts.push(`${info.song || 'Song'} „${season.song.title}“`);
  return parts.join(' · ') || info.name;
}

const fromSeasons = SEASONS.map(season => ({ id: `win:${season.id}`, category: SHOW_INFO[season.show].world, world: SHOW_INFO[season.show].world, title: winTitle(season), year: season.year, info: winInfo(season), season }));
const extra = MOMENTS.split('\n').map((line, index) => {
  const [title, year, info, world] = line.split('|');
  return { id: `moment:${index}`, category: world, world, title, year: Number(year), info };
});
export const EVENTS = [...fromSeasons, ...extra];

export const formatYear = year => year < 0 ? `${-year} v. Chr.` : String(year);
