// Spieleliste für die Oberflächen-Tests – genauso aufgebaut wie Store.cs sie aus dem GitHub-Stand liest
// (sync/catalog.json + sync/manifest.json: Kennung, Ordner, kurzer Titel, Vorschaubild aus thumbs/, easygames-Adresse, Modi).
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC = 'https://ricorewioriginal-collab.github.io/easygames/';
const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'sync', 'manifest.json'), 'utf8'));
const files = new Map(man.files.map(f => [f.p, f.s]));
function games() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'sync', 'catalog.json'), 'utf8')).games.map(g => {
    const folder = g.path.replace(/\/$/, ''), thumb = 'thumbs/' + folder + '.webp', cut = g.title.indexOf(' – ');
    const modes = Object.keys(g.modes || {}).filter(k => g.modes[k] === true); if (g.multiplayer && !modes.includes('multi')) modes.push('multi');
    let size = 0; for (const [p, s] of files) if (p.startsWith(folder + '/')) size += s;
    return { id: g.id, folder, title: g.title, short: cut > 2 ? g.title.slice(0, cut) : g.title, desc: g.desc || '', meta: ((g.icon || '') + ' easygames').trim(),
      cover: files.has(thumb) ? thumb : g.img, genre: '', url: PUBLIC + folder + '/', kind: 'bundled', modes, size };
  });
}
module.exports = { ROOT, games };
