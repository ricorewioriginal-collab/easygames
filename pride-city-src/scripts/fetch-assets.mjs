/* Lädt die KayKit-Modelle (CC0) für Stadt und Wohnung nach public/assets, falls sie fehlen. Die Menschen (Microsoft Rocketbox, MIT) liegen in public/assets/rb im Repo (scripts/rocketbox.mjs).
   Bei .gltf werden die verknüpften .bin- und Textur-Dateien mitgeladen. */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
const R = 'https://raw.githubusercontent.com/KayKit-Game-Assets/';
const SRC = {
  city: [R + 'KayKit-City-Builder-Bits-1.0/main/addons/kaykit_city_builder_bits/Assets/gltf/', ['base', 'bench', 'box_A', 'box_B', 'building_A', 'building_B', 'building_C', 'building_D', 'building_E', 'building_F', 'building_G', 'building_H', 'bush',
    'car_hatchback', 'car_police', 'car_sedan', 'car_stationwagon', 'car_taxi', 'dumpster', 'firehydrant', 'road_corner', 'road_corner_curved', 'road_junction', 'road_straight',
    'road_straight_crossing', 'road_tsplit', 'streetlight', 'trafficlight_A', 'trafficlight_B', 'trafficlight_C', 'trash_A', 'trash_B', 'watertower'], '.gltf'],
  home: [R + 'KayKit-Furniture-Bits-1.0/main/addons/kaykit_furniture_bits/Assets/gltf/', ['armchair_pillows', 'bed_double_A', 'book_set', 'cabinet_medium_decorated', 'cabinet_small', 'cactus_medium_A', 'cactus_small_A',
    'chair_A', 'couch_pillows', 'lamp_standing', 'lamp_table', 'pictureframe_large_A', 'rug_rectangle_stripes_A', 'rug_oval_A', 'shelf_A_big', 'table_low', 'table_medium',
    'shelf_B_large_decorated', 'pictureframe_large_B', 'pictureframe_medium', 'cactus_medium_B', 'chair_B', 'chair_stool', 'cabinet_small_decorated', 'rug_rectangle_A'], '.gltf'],
  kitchen: [R + 'KayKit-Restaurant-Bits-1.0/main/addons/kaykit_restaurant_bits/Assets/gltf/', ['kitchencounter_straight_A', 'kitchencounter_sink', 'stove_single', 'fridge_A', 'pot_A', 'plate', 'table_round_A_small_decorated', 'table_round_A_decorated'], '.gltf'],
};
const base = new URL('../public/assets/', import.meta.url);
let n = 0;
async function get(url, file) {
  if (existsSync(file)) return;
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ' → ' + r.status);
  writeFileSync(file, Buffer.from(await r.arrayBuffer())); n++;
}
for (const [dir, [url, names, ext]] of Object.entries(SRC)) {
  mkdirSync(new URL(dir + '/', base), { recursive: true });
  for (const nm of names) {
    const f = new URL(dir + '/' + nm + ext, base);
    await get(url + nm + ext, f);
    if (ext !== '.gltf') continue;
    const g = JSON.parse(readFileSync(f, 'utf8'));
    for (const x of [...(g.buffers || []), ...(g.images || [])]) if (x.uri && !x.uri.startsWith('data:')) await get(url + x.uri, new URL(dir + '/' + x.uri, base));
  }
}
console.log(n ? `${n} Dateien geladen` : 'Assets vollständig');
