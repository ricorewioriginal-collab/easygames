import { EDITIONS } from './events.js';
const $ = id => document.getElementById(id);
const grid = $('grid'), search = $('search'), decade = $('decade');
const winners = EDITIONS.filter(e => !e.cancelled);
const citySlugs = { 'Frankfurt am Main':'frankfurt', 'Den Haag':'the-hague', 'Göteborg':'gothenburg', 'München':'munich', 'Wien':'vienna', 'Kyjiw':'kyiv', 'Lissabon':'lisbon', 'Rom':'rome', 'Athen':'athens', 'Belgrad':'belgrade', 'Moskau':'moscow', 'Kopenhagen':'copenhagen', 'Neapel':'naples', 'Brüssel':'brussels', 'Luxemburg':'luxembourg' };
const officialUrl = item => `https://www.eurovision.com/eurovision-song-contest/${citySlugs[item.city] || item.city.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${item.year}/`;
$('contests').textContent = winners.length;
$('years').textContent = EDITIONS.length;
$('songs').textContent = winners.length + 3; // 1969: vier statt einem Siegersong
for (const year of [...new Set(EDITIONS.map(e => Math.floor(e.year / 10) * 10))].reverse()) {
  const option = document.createElement('option'); option.value = year; option.textContent = `${year}er`; decade.append(option);
}
function card(item) {
  const article = document.createElement('article'); article.className = 'edition' + (item.cancelled ? ' cancelled' : '');
  const head = document.createElement('div'); head.className = 'edition-head';
  const year = document.createElement('strong'); year.textContent = item.year;
  const number = document.createElement('span'); number.textContent = item.cancelled ? 'ABGESAGT' : `${item.edition}. AUSGABE`;
  head.append(year, number);
  const host = document.createElement('p'); host.className = 'host'; host.textContent = `${item.city} · ${item.host}`;
  article.append(head, host);
  if (item.cancelled) {
    const message = document.createElement('p'); message.className = 'canceled-note'; message.textContent = 'Kein Wettbewerb und kein Sieger. Die für Rotterdam geplante Ausgabe fiel wegen der COVID-19-Pandemie aus.'; article.append(message);
  } else if (item.year === 1969) {
    const title = document.createElement('div'); title.className = 'label'; title.textContent = 'VIER SIEGER'; article.append(title);
    const list = document.createElement('ul'); list.className = 'tie';
    const countries = ['Spanien','Vereinigtes Königreich','Niederlande','Frankreich'];
    item.artist.split('; ').forEach((artist, i) => { const li=document.createElement('li'); li.textContent=`${countries[i]} · ${artist} — „${item.song.split('; ')[i]}“`; list.append(li); }); article.append(list);
  } else {
    const label = document.createElement('div'); label.className = 'label'; label.textContent = 'SIEG'; article.append(label);
    const country = document.createElement('h3'); country.textContent = item.winner;
    const artist = document.createElement('p'); artist.className = 'artist'; artist.textContent = item.artist;
    const song = document.createElement('p'); song.className = 'song'; song.textContent = `„${item.song}“`;
    article.append(country, artist, song);
  }
  const links = document.createElement('div'); links.className='card-links';
  if (!item.cancelled) {
    const link = document.createElement('a'); link.className='song-link'; link.href=`https://www.deezer.com/search/${encodeURIComponent(item.artist.split('; ')[0] + ' ' + item.song.split('; ')[0])}`; link.target='_blank'; link.rel='noopener noreferrer'; link.textContent='♫ Song suchen ↗'; links.append(link);
  }
  const official = document.createElement('a'); official.className='song-link'; official.href=officialUrl(item); official.target='_blank'; official.rel='noopener noreferrer'; official.textContent='Offizielle Ausgabe ↗'; links.append(official); article.append(links);
  return article;
}
function render() {
  const query = search.value.trim().toLocaleLowerCase('de');
  const filtered = [...EDITIONS].reverse().filter(item => (decade.value === 'all' || Math.floor(item.year / 10) * 10 === Number(decade.value)) && (!query || [item.year,item.city,item.host,item.winner,item.artist,item.song,item.cancelled?'abgesagt':''].join(' ').toLocaleLowerCase('de').includes(query)));
  grid.replaceChildren(...filtered.map(card)); $('count').textContent = `${filtered.length} von ${EDITIONS.length} Jahren`; $('empty').hidden = filtered.length > 0;
}
search.addEventListener('input', render); decade.addEventListener('change', render); render();
