import { SEASONS, SHOW_INFO, seasonsOf } from './shows.js';

// Redaktionelle Fragen aus geprüften Fakten (de./en.wikipedia): Frage | richtig | drei Ablenker.
const sets = {
'Deutschland sucht den Superstar': `Wer gewann die erste Staffel von DSDS?|Alexander Klaws|Daniel Küblböck|Juliette Schoppmann|Gracia Baur
Wie heißt die Hymne der ersten DSDS-Staffel, gesungen von allen Top-10-Kandidaten?|We Have a Dream|Take Me Tonight|United|Heartbeat
Welcher Sender zeigt DSDS?|RTL|ProSieben|Sat.1|VOX
In welcher DSDS-Staffel saß Dieter Bohlen nicht in der Jury?|Staffel 19 (2022)|Staffel 1 (2003)|Staffel 10 (2013)|Staffel 22 (2026)
Wer ersetzte Dieter Bohlen 2022 als Chef-Juror bei DSDS?|Florian Silbereisen|Thomas Gottschalk|Pietro Lombardi|Bruce Darnell
Welcher frühere DSDS-Sieger moderierte 2020 die 17. Staffel?|Alexander Klaws|Pietro Lombardi|Mark Medlock|Thomas Godoj
Wer wurde 2010 Zweiter bei DSDS und gewann 2026 die 22. Staffel?|Menowin Fröhlich|Mehrzad Marashi|Pietro Lombardi|Daniel Schuhmacher
Wer vertrat Dieter Bohlen 2021 im Halbfinale und Finale von DSDS?|Thomas Gottschalk|Florian Silbereisen|Oliver Geissen|Bruce Darnell
Welche DSDS-Gewinnerin kommt aus der Schweiz?|Beatrice Egli|Aneta Sablik|Marie Wegener|Elli Erl
Welcher DSDS-Sieger stammt aus der Schweiz?|Luca Hänni|Tobias Regner|Davin Herbrüggen|Sem Eisinger
Welche Sängerin wurde 2011 bei DSDS Zweite hinter Pietro Lombardi?|Sarah Engels|Lisa Wohlgemuth|Viviana Grisafi|Fabienne Rothe
Welche Idol-Show war das Vorbild für DSDS?|Pop Idol|The X Factor|Popstars|Star Academy
Wer erfand das Idol-Format, zu dem DSDS gehört?|Simon Fuller|Simon Cowell|John de Mol|Dieter Bohlen
Wie hieß der Kinder-Ableger von DSDS im Jahr 2012?|DSDS Kids|DSDS Junior|Superstar Kids|Mini-DSDS
Wer gewann 2012 DSDS Kids?|Marco Kappel|Gianni Laffontien|Luca Hänni|Daniele Negroni
Wie viele Live-Kandidaten hatte die 21. DSDS-Staffel im Jahr 2024?|vier|zehn|sieben|zwölf
In welchem Jahr gab es keine DSDS-Staffel, bevor die Show 2026 zurückkam?|2025|2023|2021|2019
Wer gewann DSDS in Staffel 22 im Jahr 2026?|Menowin Fröhlich|Constance Dizendorf|Christian Jährig|Sem Eisinger
Mit welchem Song gewann Ramon Roselly 2020 DSDS?|Eine Nacht|Glücksmoment|Königlich|Mein Herz
Welcher DSDS-Sieger stand vorher im Supertalent-Finale?|Christian Jährig|Pietro Lombardi|Prince Damien|Jan-Marten Block`,
'Supertalent & Got Talent': `Wer erfand das Got-Talent-Format?|Simon Cowell|Simon Fuller|John de Mol|Dieter Bohlen
Welche Got-Talent-Ausgabe lief als erste im Fernsehen?|America’s Got Talent|Britain’s Got Talent|Das Supertalent|Holland’s Got Talent
Bei welcher Show wurde der Goldene Buzzer erfunden?|Das Supertalent|Britain’s Got Talent|America’s Got Talent|The Voice of Germany
Wie oft drückte Dieter Bohlen 2012 beim Supertalent den Goldenen Buzzer?|fünfmal|einmal|dreimal|zehnmal
Welches Format kürte Guinness 2014 zum erfolgreichsten Reality-TV-Format?|Got Talent|Idol|The Voice|Big Brother
Mit welchem Instrument gewann Michael Hirte 2008 Das Supertalent?|Mundharmonika|Panflöte|Akkordeon|Saxofon
Wie hieß Michael Hirtes Nummer-1-Album?|Der Mann mit der Mundharmonika|Mundharmonika-Träume|Das Supertalent|Ein Lied für dich
Welche Art von Darbietung gewann Das Supertalent am häufigsten?|Gesang|Hundedressur|Zauberei|Akrobatik
Wer stand 2010 im Supertalent-Finale und gewann 2018 die Show?|Stevie Starr|Leo Rojas|Jay Oh|Marcel Kaupp
Wer wurde 2009 Zweite beim Supertalent und 2020 Dritte?|Vanessa Calcagno|Georgia Balke|Angel Flukes|Alexa Lauenburger
Warum beendete RTL 2025 Das Supertalent vorerst?|Konkurrenz durch soziale Medien|zu teure Preisgelder|Streit in der Jury|fehlende Bewerber
Welcher Sender zeigt Das Supertalent?|RTL|Sat.1|ProSieben|ZDF
Wer gewann 2009 Britain’s Got Talent vor Susan Boyle?|Diversity|Paul Potts|George Sampson|Spelbound
Welche Arie sang Paul Potts im Casting von Britain’s Got Talent?|Nessun Dorma|Time to Say Goodbye|O sole mio|Ave Maria
Welches Lied sang Susan Boyle 2009 im BGT-Casting?|I Dreamed a Dream|My Heart Will Go On|Memory|Somewhere
Wer gewann 2019 als ältester Teilnehmer Britain’s Got Talent?|Colin Thackery|Paul Potts|Jon Courtenay|Tokio Myers
Wer war 2013 der erste ausländische Sieger von America’s Got Talent?|Kenichi Ebina|Shin Lim|Mat Franco|Paul Zerdin
Welche AGT-Siegerin 2025 war schon in der ersten AGT-Staffel 2006 angetreten?|Jessica Sanchez|Bianca Ryan|Darci Lynne|Grace VanderWaal
Was bekommt der Sieger von Britain’s Got Talent neben dem Preisgeld?|Auftritt bei der Royal Variety Performance|einen Plattenvertrag in den USA|eine eigene TV-Show|einen Auftritt beim ESC
Welche Tanzshow lief von 2013 bis 2015 auf ProSieben und Sat.1?|Got to Dance|Let’s Dance|Deutschland tanzt|Dance Dance Dance
Welchen Preis gewann Got to Dance 2013?|Deutscher Fernsehpreis|Grimme-Preis|Bambi|Goldene Kamera`,
'The Voice': `Wer erfand das Voice-Format?|John de Mol und Roel van Velzen|Simon Cowell|Simon Fuller|Dieter Bohlen
In welchem Land startete The Voice 2010?|Niederlande|USA|Deutschland|Großbritannien
Von wem stammt die Idee der drehenden Stühle bei The Voice?|Roel van Velzen|John de Mol|Simon Cowell|Mark Forster
Wer gewann The Voice of Holland 2010 als allererster Voice-Sieger?|Ben Saunders|Ivy Quainoo|Javier Colon|Nick Howard
Wer gewann die erste Staffel von The Voice of Germany?|Ivy Quainoo|Nick Howard|Kim Sanders|Andreas Kümmert
Aus welchem Team kam Ivy Quainoo, die erste Siegerin von The Voice of Germany?|The BossHoss|Nena|Xavier Naidoo|Rea Garvey
Mit welchem Song gewann Jamie-Lee Kriewitz 2015 The Voice of Germany?|Ghost|Satellite|Unbreakable|Blue Heart
Mit wem holte Mark Forster 2022 seinen ersten Sieg als Coach bei The Voice of Germany?|Anny Ogrezeanu|Natia Todua|Samuel Rösch|Jennifer Lynn
Welche zwei Coach-Duos traten 2020 bei The Voice of Germany an?|Samu Haber & Rea Garvey sowie Stefanie Kloß & Yvonne Catterfeld|Bill & Tom Kaulitz sowie Michi Beck & Smudo|Nena & Larissa Kerner sowie The BossHoss|Mark Forster & Nico Santos sowie Sido & Alice Merton
Wer gewann 2011 The Voice (USA) als erster Sieger der US-Version?|Javier Colon|Jermaine Paul|Cassadee Pope|Josh Kaufman
Welcher Coach gewann The Voice (USA) am häufigsten?|Blake Shelton|Adam Levine|Kelly Clarkson|Niall Horan
Welche Supertalent-Zweite gewann 2022 The Voice Kids?|Georgia Balke|Alexa Lauenburger|Angel Flukes|Elena Turcan
Wer gewann The Voice Kids als erste Siegerin?|Michèle Bircher|Danyiom Mesmer|Sofie Thomas|Anisa Celik
Welcher Sender zeigte The Voice of Germany zum Start 2011?|ProSieben|RTL|VOX|Das Erste`,
'Popstars & weitere deutsche Shows': `Welche Band ging 2000 aus der ersten Popstars-Staffel hervor?|No Angels|Bro’Sis|Monrose|Preluders
Welche Popstars-Band gilt als meistverkaufte deutsche Girlgroup aller Zeiten?|No Angels|Monrose|Queensberry|LaVive
Welche zwei Bands traten bei Popstars 2003 im „Duell“ gegeneinander an?|Overground und Preluders|No Angels und Bro’Sis|Monrose und Room2012|Some & Any und LaVive
Welcher Choreograf prägte Popstars als Juror und Coach?|Detlef D! Soost|Bruce Darnell|Dieter Bohlen|Motsi Mabuse
Wer wurde 2006 mit 16 Jahren per Zuschauervoting Mitglied von Monrose?|Mandy Capristo|Senna Guemmour|Bahar Kızıl|Sandy Mölling
Welche späteren Moderatoren waren Mitglieder von Bro’Sis?|Giovanni Zarrella und Ross Antony|Oliver Pocher und Jochen Schropp|Daniel Hartwich und Marco Schreyl|Thore Schölermann und Steven Gätjen
Wonach suchte Popstars 2009 zum ersten Mal?|ein Duo|eine Boyband|eine Girlgroup|einen Solosänger
Wer gewann 2010 Unser Star für Oslo?|Lena Meyer-Landrut|Jennifer Braun|Roman Lob|Ivy Quainoo
Mit welchem Song gewann Lena 2010 den Eurovision Song Contest?|Satellite|Taken by a Stranger|Standing Still|Ghost
Wie viele Punkte holte Lena 2010 beim ESC-Sieg in Oslo?|246|162|302|198
Wer war Jury-Präsident bei Unser Star für Oslo?|Stefan Raab|Dieter Bohlen|Xavier Naidoo|Detlef D! Soost
Welches Lied wurde 2011 bei Unser Song für Deutschland für Lena gewählt?|Taken by a Stranger|Satellite|Standing Still|Touch a New Day
Wer gewann 2012 Unser Star für Baku?|Roman Lob|Ornella De Santis|Lena Meyer-Landrut|Jamie-Lee Kriewitz
Wer schrieb an Roman Lobs ESC-Song „Standing Still“ mit?|Jamie Cullum|Stefan Raab|Max Herre|Ed Sheeran
Wer gewann die erste Staffel von Germany’s Next Topmodel?|Lena Gercke|Barbara Meier|Sara Nuru|Stefanie Giesinger
Seit welcher Staffel werden bei Germany’s Next Topmodel auch Männer gecastet?|Staffel 19 (2024)|Staffel 10 (2015)|Staffel 15 (2020)|Staffel 21 (2026)
Wer gewann 2010 die erste Staffel von X Factor in Deutschland?|Edita Abdieski|David Pfeffer|Mrs. Greenbird|Big Soul
Welchen Beruf hatte David Pfeffer, X-Factor-Sieger 2011?|Polizist|Bäcker|Lehrer|Feuerwehrmann
Wer war Mentor der ersten beiden X-Factor-Sieger in Deutschland?|Till Brönner|Sarah Connor|George Glueck|Das Bo
Wer moderierte Star Search 2003?|Kai Pflaume|Stefan Raab|Oliver Geissen|Marco Schreyl
Welcher spätere Tokio-Hotel-Sänger schied 2003 bei Star Search aus?|Bill Kaulitz|Tom Kaulitz|Mark Forster|Max Giesinger
Wer gewann 2003 Star Search in der Kategorie „Music Act ab 16 Jahre“?|Martin Kesici|Daniel Siegert|Ingo Oschmann|Florence Joy Büttner
Wie hieß die Gewinnerband von Fame Academy 2003?|Become One|Bro’Sis|Overground|Nu Pagadi
Wer siegte bei Starmania 2002/03 vor Christina Stürmer?|Michael Tschuggnall|Verena Pötzl|Nadine Beiler|Oliver Wimmer
Wer nahm als Tom Neuwirth an der dritten Starmania-Staffel teil?|Conchita Wurst|Christina Stürmer|Nadine Beiler|Michael Tschuggnall
Auf welchem Format basierte die Schweizer Show MusicStar?|Starmania|Popstars|DSDS|The Voice
Wer gewann die erste Staffel von MusicStar in der Schweiz?|Carmen Fenk|Salome Clausen|Fabienne Louves|Katharina Michel
In welchem Land lief Starmania?|Österreich|Schweiz|Deutschland|Niederlande`,
'Idol, X Factor & international': `In welchem Land startete das Popstars-Format 1999?|Neuseeland|Australien|Großbritannien|USA
Welche Band brachte die australische Popstars-Staffel 2000 hervor?|Bardot|TrueBliss|Hear’Say|O-Town
Welche Band entstand 2000 bei Making the Band?|O-Town|Bardot|Hear’Say|Little Mix
Wer erfand Pop Idol?|Simon Fuller|Simon Cowell|John de Mol|Jonathan Dowling
Wer gewann 2002 die erste Staffel von Pop Idol?|Will Young|Gareth Gates|Darius Danesh|Michelle McManus
Wer wurde 2002 bei Pop Idol Zweiter hinter Will Young?|Gareth Gates|Darius Danesh|Mark Rhodes|Steve Brookstein
Wer gewann 2003 World Idol?|Kurt Nilsen|Kelly Clarkson|Will Young|Alexander Klaws
Welches Land hatte den ersten internationalen Idol-Ableger?|Südafrika|Deutschland|Niederlande|USA
Wer gewann 2002 die erste Staffel von American Idol?|Kelly Clarkson|Justin Guarini|Ruben Studdard|Carrie Underwood
Wie hieß Kelly Clarksons Siegersingle bei American Idol?|A Moment Like This|Inside Your Heaven|Since U Been Gone|Flying Without Wings
Welche spätere Oscar-Gewinnerin wurde 2004 bei American Idol nur Siebte?|Jennifer Hudson|Fantasia Barrino|Katharine McPhee|Jordin Sparks
Wer wurde 2009 bei American Idol Zweiter hinter Kris Allen?|Adam Lambert|Chris Daughtry|David Archuleta|Clay Aiken
Welche Siegerin von 2005 ist seit 2025 Jurorin bei American Idol?|Carrie Underwood|Kelly Clarkson|Fantasia Barrino|Jordin Sparks
Zu welchem Sender wechselte American Idol 2018?|ABC|NBC|CBS|Fox
Wer erfand The X Factor?|Simon Cowell|Simon Fuller|John de Mol|Louis Walsh
Auf welchem Platz landeten One Direction 2010 bei The X Factor (UK)?|Platz 3|Platz 1|Platz 2|Platz 5
Welche Band gewann 2011 als erste Gruppe The X Factor (UK)?|Little Mix|One Direction|JLS|Rak-Su
Welcher Song verhinderte 2009 die Weihnachts-Nr.-1 des X-Factor-Siegers Joe McElderry?|Killing in the Name|Bohemian Rhapsody|Last Christmas|Hallelujah
Wer verlor 2009 das X-Factor-Finale gegen Joe McElderry und wurde später ein Star?|Olly Murs|Matt Cardle|James Arthur|Shayne Ward
Mit welchem Song gewann Alexandra Burke 2008 The X Factor (UK)?|Hallelujah|A Moment Like This|The Climb|Cannonball
Wer gewann 2001 die erste Staffel von Operación Triunfo in Spanien?|Rosa López|David Bisbal|Jenifer|David Sneddon
Wer gewann 2001 die erste Staffel von Star Academy in Frankreich?|Jenifer|Rosa López|Alizée|Lorie
Wer gewann 2002 die erste Staffel von Fame Academy in Großbritannien?|David Sneddon|Alex Parks|Will Young|Darius Danesh`
};

const WORLD_OF = Object.fromEntries(Object.keys(sets).map(world => [world, world]));
const question = (id, category, prompt, answer, wrong) => ({ id, category, world: WORLD_OF[category] || category, prompt, answer, options: [answer, ...wrong] });

// Feste, reproduzierbare Auswahl von Ablenkern (gleiche Fragen bei jedem Start).
function seedOf(text) { let h = 2166136261; for (const c of text) h = Math.imul(h ^ c.codePointAt(0), 16777619) >>> 0; return h; }
function pick(pool, seed, count, answer) {
  // Keine Ablenker, die die Antwort enthalten oder in ihr stecken (z. B. „Fab Fox“ und „Fab Fox (Fabian Blochberger)“).
  const rest = [...new Set(pool)].filter(item => item && !item.includes(answer) && !answer.includes(item));
  const out = []; let x = seed;
  while (out.length < count && rest.length) { x = (Math.imul(x, 1103515245) + 12345) >>> 0; out.push(rest.splice(x % rest.length, 1)[0]); }
  return out;
}
const generated = [];
function add(id, season, prompt, answer, pool) {
  const wrong = pick(pool, seedOf(id), 3, answer);
  if (answer && wrong.length === 3) generated.push(question(id, SHOW_INFO[season.show].world, prompt, answer, wrong));
}
const label = season => `${SHOW_INFO[season.show].name} in Staffel ${season.n} (${season.year})`;
const isPair = name => name.includes(' & ');
const ACT_KINDS = [['hund', /hund|dog/i], ['tanz', /tanz|tänz|dance/i], ['zauber', /zauber|illusion|magie/i], ['comedy', /comed|bauchred/i], ['gesang', /säng|sing|oper|gesang|chor|band/i], ['instrument', /pian|flöt|harmonika|gitarr/i], ['akrobatik', /akrobat|turn|handstand|schatten/i]];
const actText = act => act.replace(/\s*\(.*?\)/g, '').replace(/, \d+ Jahre$/, '');
const actKind = act => (ACT_KINDS.find(([, test]) => test.test(act)) || [act])[0];

for (const show of Object.keys(SHOW_INFO)) {
  const seasons = seasonsOf(show), info = SHOW_INFO[show];
  const worldSeasons = SEASONS.filter(s => SHOW_INFO[s.show].world === info.world);
  for (const s of seasons) {
    const others = seasons.filter(o => o !== s), id = `${show}:${s.n}`;
    // Sieger
    if (!(show === 'gntm' && isPair(s.winner))) {
      let pool = others.map(o => o.winner).filter(w => !(show === 'gntm' && isPair(w)));
      if (pool.length < 3) pool = worldSeasons.filter(o => o !== s).map(o => o.winner);
      const prompt = show === 'ss' ? `Wer gewann ${s.year} bei Star Search die Kategorie „${s.act}“?` : `Wer gewann ${label(s)}?`;
      add(`win:${id}`, s, prompt, s.winner, pool);
    }
    // Platz 2
    if (s.runnerUp) {
      const pool = s.list.length >= 4 && info.list !== 'coaches' && info.list !== 'band' ? s.list : [s.winner, ...others.map(o => o.runnerUp)];
      const prompt = show === 'ss' ? `Wer wurde ${s.year} bei Star Search in der Kategorie „${s.act}“ Zweiter?` : `Wer belegte bei ${label(s)} Platz 2?`;
      add(`p2:${id}`, s, prompt, s.runnerUp, pool);
    }
    // Siegersong
    if (s.song && !s.song.title.includes(String(s.year))) {
      let pool = others.filter(o => o.song).map(o => o.song.title);
      if (pool.length < 3) pool = worldSeasons.filter(o => o !== s && o.song).map(o => o.song.title);
      add(`single:${id}`, s, `Wie hieß ${info.songQ} von ${s.winner} (${info.name}, ${s.year})?`, s.song.title, pool);
    }
    // Jury und Moderation
    const juror = s.jury.filter(name => name !== 'Dieter Bohlen')[seedOf(id) % Math.max(1, s.jury.filter(name => name !== 'Dieter Bohlen').length)];
    if (juror) add(`jury:${id}`, s, `Wer saß bei ${label(s)} in der Jury?`, juror, others.flatMap(o => o.jury).filter(name => !s.jury.includes(name)));
    if (s.hosts.length) add(`host:${id}`, s, `Wer moderierte ${label(s)}?`, s.hosts[0], others.flatMap(o => o.hosts).filter(name => !s.hosts.includes(name)));
    // Siegercoach bzw. Mentor
    if (s.coach) {
      const pool = info.list === 'coaches' ? s.list : others.map(o => o.coach);
      add(`coach:${id}`, s, `Wer war bei ${label(s)} ${show === 'xf' || show === 'xfuk' ? 'Mentor des Siegers' : 'der siegreiche Coach'}?`, s.coach, pool.filter(name => name !== s.coach));
    }
    // Darbietung der Talentshow-Sieger
    if (s.act && show !== 'ss') {
      // Ablenker nur aus anderen Sparten, damit z. B. „Sänger“ und „Popsänger“ nie zusammen auftauchen.
      const kind = actKind(s.act), seen = new Set([kind]), pool = [];
      for (const act of [...new Set(worldSeasons.filter(o => o.act && o.show !== 'ss').map(o => actText(o.act)))].sort((a, b) => seedOf(id + a) - seedOf(id + b))) {
        if (!seen.has(actKind(act))) { seen.add(actKind(act)); pool.push(act); }
      }
      add(`act:${id}`, s, `Womit gewann ${s.winner} ${info.name} (${s.year})?`, actText(s.act), pool);
    }
  }
}

// Top 10 (DSDS-Liveshows), Supertalent-Finalisten und Popstars-Bands.
for (const show of ['dsds', 'st', 'pop']) {
  const seasons = seasonsOf(show);
  const where = show === 'dsds' ? 'in den Liveshows' : show === 'st' ? 'im Finale' : '';
  for (const s of seasons) {
    if (show === 'pop' && s.list.some(name => !name.includes(' '))) continue; // nur vollständige Namen
    const others = seasons.filter(o => o !== s);
    const clash = name => others.some(o => o.list.some(other => other.includes(name) || name.includes(other)));
    const members = s.list.filter(name => !clash(name));
    const pool = others.flatMap(o => o.list).filter(name => (show !== 'pop' || name.includes(' ')) && !s.list.some(own => own.includes(name) || name.includes(own)));
    if (members.length) {
      const chosen = show === 'pop' ? members[0] : members[2 + seedOf(s.id) % Math.max(1, members.length - 2)] || members[0];
      const prompt = show === 'pop' ? `Wer gehörte zur Popstars-Band ${s.winner} (${s.year})?` : `Wer stand bei ${label(s)} ${where}?`;
      add(`top:${s.id}`, s, prompt, chosen, pool);
    }
    if (show === 'pop') continue;
    // Umgekehrt: In welcher Staffel stand jemand in den Liveshows bzw. im Finale?
    for (const name of members) {
      const answer = `Staffel ${s.n} (${s.year})`;
      add(`top:${s.id}:${name}`, s, `In welcher ${show === 'dsds' ? 'DSDS' : 'Supertalent'}-Staffel stand ${name} ${where}?`, answer, others.map(o => `Staffel ${o.n} (${o.year})`));
    }
  }
}

const editorial = Object.entries(sets).flatMap(([category, block]) => block.trim().split('\n').map((line, index) => {
  const [prompt, answer, ...wrong] = line.split('|');
  return question(`k:${category}:${index}`, category, prompt, answer, wrong);
}));

export const KNOWLEDGE = [...editorial, ...generated];
