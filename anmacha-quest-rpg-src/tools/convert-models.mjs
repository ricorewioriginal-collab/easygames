// Wandelt die FBX-Modelle (Quaternius, CC0) einmalig in kompakte GLB-Dateien um: node tools/convert-models.mjs
// Nötig nur, wenn sich die Quellmodelle ändern. Ergebnis: ../anmacha-quest-rpg/models/*.glb (wird eingecheckt).
// Die FBX-Quellen liegen nicht mehr im Repo (frühere Godot-Fassung, git-Historie: anmacha-quest-rpg/godot/assets).
// Zum Ausführen diesen Ordner wiederherstellen und als tools/godot-assets verlinken.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const srv = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const A = '/tools/godot-assets';
const HERO_ANIMS = ['idle', 'walk', 'run', 'sword_attack', 'staff_attack', 'bow_attack_shoot', 'dagger_attack', 'attack', 'spell1', 'punch', 'recievehit', 'death', 'idle_weapon'];
const MON_ANIMS = ['idle', 'walk', 'flying', 'running', 'bite_front', 'attack', 'hitrecieve', 'hit', 'death'];
const jobs = [];
for (const h of ['Warrior', 'Wizard', 'Cleric', 'Ranger', 'Monk', 'Rogue']) jobs.push([`${A}/heroes/FBX/${h}.fbx`, `${A}/heroes/Textures/${h}_Texture.png`, HERO_ANIMS, `hero_${h}`]);
for (const f of fs.readdirSync(root + 'tools/godot-assets/cute/FBX').filter(f => f.endsWith('.fbx'))) { const b = f.slice(0, -4); jobs.push([`${A}/cute/FBX/${f}`, `${A}/cute/Textures/${b}_Texture.png`, MON_ANIMS, `mon_${b}`]); }
for (const b of ['Dragon', 'Skeleton', 'Slime']) jobs.push([`${A}/monsters4/${b}.fbx`, '', MON_ANIMS, `mon_${b}`]);
for (const b of ['2Story_Mat', '1Story_GableRoof_Mat', '2Story_Sign_Mat', '1Story_Mat', '2Story_GableRoof_Mat', '1Story_Sign_Mat', '2Story_Slim_Mat']) jobs.push([`${A}/buildings/${b}.fbx`, '', null, `bld_${b}`]);
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
await page.goto('http://127.0.0.1:8765/tools/convert.html');
await page.waitForFunction(() => window.ready);
const only = process.argv[2];
for (const [url, tex, keep, name] of jobs) {
  if (only === 'inspect') { console.log(name, JSON.stringify(await page.evaluate(u => window.inspect(u), url))); continue; }
  const r = await page.evaluate(([u, t, k]) => window.convert(u, t, k), [url, tex, keep]);
  const buf = Buffer.from(r.b64, 'base64');
  fs.writeFileSync(`${root}../anmacha-quest-rpg/models/${name}.glb`, buf);
  console.log(name, (buf.length / 1024).toFixed(0) + ' KB', r.anims.join(','));
}
await browser.close();
srv.kill();
