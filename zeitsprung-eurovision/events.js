// Vollständige Reihe der ESC-Jahre von 1956 bis 2026; 2020 ist ein Sonderfall.
const ROWS = `1956|Lugano|Schweiz|Schweiz|Lys Assia|Refrain
1957|Frankfurt am Main|Deutschland|Niederlande|Corry Brokken|Net als toen
1958|Hilversum|Niederlande|Frankreich|André Claveau|Dors, mon amour
1959|Cannes|Frankreich|Niederlande|Teddy Scholten|Een beetje
1960|London|Vereinigtes Königreich|Frankreich|Jacqueline Boyer|Tom Pillibi
1961|Cannes|Frankreich|Luxemburg|Jean-Claude Pascal|Nous les amoureux
1962|Luxemburg|Luxemburg|Frankreich|Isabelle Aubret|Un premier amour
1963|London|Vereinigtes Königreich|Dänemark|Grethe und Jørgen Ingmann|Dansevise
1964|Kopenhagen|Dänemark|Italien|Gigliola Cinquetti|Non ho l'età
1965|Neapel|Italien|Luxemburg|France Gall|Poupée de cire, poupée de son
1966|Luxemburg|Luxemburg|Österreich|Udo Jürgens|Merci, Chérie
1967|Wien|Österreich|Vereinigtes Königreich|Sandie Shaw|Puppet on a String
1968|London|Vereinigtes Königreich|Spanien|Massiel|La La La
1969|Madrid|Spanien|Spanien, Vereinigtes Königreich, Niederlande und Frankreich|Salomé; Lulu; Lenny Kuhr; Frida Boccara|Vivo cantando; Boom Bang-a-Bang; De troubadour; Un jour, un enfant
1970|Amsterdam|Niederlande|Irland|Dana|All Kinds of Everything
1971|Dublin|Irland|Monaco|Séverine|Un banc, un arbre, une rue
1972|Edinburgh|Vereinigtes Königreich|Luxemburg|Vicky Leandros|Après toi
1973|Luxemburg|Luxemburg|Luxemburg|Anne-Marie David|Tu te reconnaîtras
1974|Brighton|Vereinigtes Königreich|Schweden|ABBA|Waterloo
1975|Stockholm|Schweden|Niederlande|Teach-In|Ding-a-dong
1976|Den Haag|Niederlande|Vereinigtes Königreich|Brotherhood of Man|Save Your Kisses for Me
1977|London|Vereinigtes Königreich|Frankreich|Marie Myriam|L'Oiseau et l'Enfant
1978|Paris|Frankreich|Israel|Izhar Cohen & The Alphabeta|A-Ba-Ni-Bi
1979|Jerusalem|Israel|Israel|Milk and Honey|Hallelujah
1980|Den Haag|Niederlande|Irland|Johnny Logan|What's Another Year
1981|Dublin|Irland|Vereinigtes Königreich|Bucks Fizz|Making Your Mind Up
1982|Harrogate|Vereinigtes Königreich|Deutschland|Nicole|Ein bißchen Frieden
1983|München|Deutschland|Luxemburg|Corinne Hermès|Si la vie est cadeau
1984|Luxemburg|Luxemburg|Schweden|Herreys|Diggi-Loo Diggi-Ley
1985|Göteborg|Schweden|Norwegen|Bobbysocks!|La det swinge
1986|Bergen|Norwegen|Belgien|Sandra Kim|J'aime la vie
1987|Brüssel|Belgien|Irland|Johnny Logan|Hold Me Now
1988|Dublin|Irland|Schweiz|Céline Dion|Ne partez pas sans moi
1989|Lausanne|Schweiz|Jugoslawien|Riva|Rock Me
1990|Zagreb|Jugoslawien|Italien|Toto Cutugno|Insieme: 1992
1991|Rom|Italien|Schweden|Carola|Fångad av en stormvind
1992|Malmö|Schweden|Irland|Linda Martin|Why Me?
1993|Millstreet|Irland|Irland|Niamh Kavanagh|In Your Eyes
1994|Dublin|Irland|Irland|Paul Harrington & Charlie McGettigan|Rock 'n' Roll Kids
1995|Dublin|Irland|Norwegen|Secret Garden|Nocturne
1996|Oslo|Norwegen|Irland|Eimear Quinn|The Voice
1997|Dublin|Irland|Vereinigtes Königreich|Katrina and the Waves|Love Shine a Light
1998|Birmingham|Vereinigtes Königreich|Israel|Dana International|Diva
1999|Jerusalem|Israel|Schweden|Charlotte Nilsson|Take Me to Your Heaven
2000|Stockholm|Schweden|Dänemark|Olsen Brothers|Fly on the Wings of Love
2001|Kopenhagen|Dänemark|Estland|Tanel Padar, Dave Benton & 2XL|Everybody
2002|Tallinn|Estland|Lettland|Marie N|I Wanna
2003|Riga|Lettland|Türkei|Sertab Erener|Everyway That I Can
2004|Istanbul|Türkei|Ukraine|Ruslana|Wild Dances
2005|Kyjiw|Ukraine|Griechenland|Helena Paparizou|My Number One
2006|Athen|Griechenland|Finnland|Lordi|Hard Rock Hallelujah
2007|Helsinki|Finnland|Serbien|Marija Šerifović|Molitva
2008|Belgrad|Serbien|Russland|Dima Bilan|Believe
2009|Moskau|Russland|Norwegen|Alexander Rybak|Fairytale
2010|Oslo|Norwegen|Deutschland|Lena|Satellite
2011|Düsseldorf|Deutschland|Aserbaidschan|Ell & Nikki|Running Scared
2012|Baku|Aserbaidschan|Schweden|Loreen|Euphoria
2013|Malmö|Schweden|Dänemark|Emmelie de Forest|Only Teardrops
2014|Kopenhagen|Dänemark|Österreich|Conchita Wurst|Rise Like a Phoenix
2015|Wien|Österreich|Schweden|Måns Zelmerlöw|Heroes
2016|Stockholm|Schweden|Ukraine|Jamala|1944
2017|Kyjiw|Ukraine|Portugal|Salvador Sobral|Amar pelos dois
2018|Lissabon|Portugal|Israel|Netta|Toy
2019|Tel Aviv|Israel|Niederlande|Duncan Laurence|Arcade
2020|Rotterdam|Niederlande|||
2021|Rotterdam|Niederlande|Italien|Måneskin|Zitti e buoni
2022|Turin|Italien|Ukraine|Kalush Orchestra|Stefania
2023|Liverpool|Vereinigtes Königreich|Schweden|Loreen|Tattoo
2024|Malmö|Schweden|Schweiz|Nemo|The Code
2025|Basel|Schweiz|Österreich|JJ|Wasted Love
2026|Wien|Österreich|Bulgarien|DARA|Bangaranga`;
export const EDITIONS = ROWS.split('\n').map(line => {
  const [year, city, host, winner, artist, song] = line.split('|');
  const cancelled = year === '2020', y = Number(year);
  return { edition: cancelled ? null : y - 1955 - (y > 2020 ? 1 : 0), year: y, city, host, winner, artist, song, cancelled };
});
export const EVENTS = EDITIONS.map(item => ({
  ...item, id: `esc:${item.year}`, title: item.cancelled ? 'ESC-Ausgabe wegen Pandemie abgesagt' : item.year === 1969 ? 'Vier Länder teilen sich in Madrid den Sieg' : `${item.artist} gewinnt in ${item.city}`,
  info: item.cancelled ? 'Die geplante Ausgabe fiel wegen der COVID-19-Pandemie aus; es gab keinen Sieger.' : `${item.winner} gewinnt: ${item.artist} – „${item.song}“`,
  category: `${Math.floor(item.year / 10) * 10}er`, world: `${Math.floor(item.year / 10) * 10}er`
}));
export const WORLDS = Object.fromEntries([...new Set(EVENTS.map(event => event.world))].map(world => [world, [world]]));
export const worldOf = category => category;
export const formatYear = year => String(year);
