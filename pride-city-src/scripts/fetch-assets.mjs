/* Lädt die KayKit-Modelle (CC0) nach public/assets, falls sie fehlen. Sie liegen nicht doppelt im Repo: Der fertige Build in ../pride-city enthält sie. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
const R = 'https://raw.githubusercontent.com/KayKit-Game-Assets/';
const CH = R + 'KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf/';
const CI = R + 'KayKit-City-Builder-Bits-1.0/main/addons/kaykit_city_builder_bits/Assets/gltf/';
const CITY = ['base', 'bench', 'box_A', 'box_B', 'building_A', 'building_B', 'building_C', 'building_D', 'building_E', 'building_F', 'building_G', 'building_H', 'bush',
  'car_hatchback', 'car_police', 'car_sedan', 'car_stationwagon', 'car_taxi', 'dumpster', 'firehydrant', 'road_corner', 'road_corner_curved', 'road_junction', 'road_straight',
  'road_straight_crossing', 'road_tsplit', 'streetlight', 'trafficlight_A', 'trafficlight_B', 'trafficlight_C', 'trash_A', 'trash_B', 'watertower'];
const jobs = [
  ...['Knight', 'Barbarian', 'Mage', 'Rogue', 'Rogue_Hooded'].map((c) => [CH + c + '.glb', 'chars/' + c + '.glb']),
  ...CITY.flatMap((n) => [[CI + n + '.gltf', 'city/' + n + '.gltf'], [CI + n + '.bin', 'city/' + n + '.bin']]),
  [CI + 'citybits_texture.png', 'city/citybits_texture.png'],
];
const base = new URL('../public/assets/', import.meta.url);
for (const d of ['chars', 'city']) mkdirSync(new URL(d, base), { recursive: true });
let n = 0;
for (const [url, out] of jobs) {
  const f = new URL(out, base);
  if (existsSync(f)) continue;
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ' → ' + r.status);
  writeFileSync(f, Buffer.from(await r.arrayBuffer())); n++;
}
console.log(n ? `${n} Dateien geladen` : 'Assets vollständig');
