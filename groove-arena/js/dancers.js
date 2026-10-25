/* Groove Arena – Tänzerinnen und Tänzer: realistische 3D-Menschen aus ../figuren/ (EasyFiguren, CC0-Körper mit Kleidung, Frisuren, Hüten)
 * plus Rico (aus EASYCLASH) und Zotik (Fuchs-Kostüm mit Ohren, Schnauze und Schwanz). Eigene Figuren baut der Charakter-Editor.
 * look = Steckbrief für EasyFiguren.make + name, glow (Leucht-Umriss/Bühnenfarbe), extra ('fox'), bg (Bühnen-Verlauf). */
(function () {
  'use strict';
  const P = (id, name, look, glow, bg, styles) => ({ id, name, look, glow, bg, styles: styles || [] });
  const PRESETS = [
    P('rico', 'Rico', { body: 'm', skin: '#f2c6a4', top: '#8645e0', topStyle: 'tee', bottom: '#2c3554', bottomStyle: 'pants', shoes: '#ffffff', hair: { style: 'spiky', color: '#4b2e1a' }, beard: '#5e3b22' }, '#c77dff', ['#1a0838', '#8645e0'], ['pop', 'party']),
    P('zotik', 'Zotik', { body: 'm', skin: '#e8731c', top: '#e8731c', topStyle: 'long', bottom: '#5a3a28', bottomStyle: 'pants', shoes: '#3a2418', hair: { style: 'buzz', color: '#e8731c' }, extra: 'fox', scarf: '#4be3c8' }, '#4be3c8', ['#081a2a', '#4be3c8'], ['kids']),
    P('mila', 'Mila', { body: 'w', skin: '#f1c7a5', top: '#3ad8ff', topStyle: 'tank', bottom: '#2a2a6a', bottomStyle: 'pants', shoes: '#ffffff', hair: { style: 'pony', color: '#ff5aa8' } }, '#ff3aa8', ['#2a0a5a', '#ff3aa8'], ['pop']),
    P('kenzo', 'Kenzo', { body: 'm', skin: '#8a5a3a', top: '#ffd23a', topStyle: 'tee', bottom: '#3a3a3a', bottomStyle: 'pants', shoes: '#ff3a3a', hair: { style: 'buzz', color: '#111111' }, hat: { type: 'cap', color: '#ff3a3a' } }, '#ffd23a', ['#101030', '#ffb020'], ['hiphop']),
    P('luz', 'Luz', { body: 'w', skin: '#d8a070', top: '#ff3a4a', topStyle: 'tank', bottom: '#1a0a1a', bottomStyle: 'pants', shoes: '#ffd23a', hair: { style: 'long', color: '#2a1208' } }, '#ff6a3a', ['#3a0a1a', '#ff6a3a'], ['latin']),
    P('yuna', 'Yuna', { body: 'w', skin: '#f3d2b8', top: '#ffffff', topStyle: 'tee', bottom: '#ff7ad0', bottomStyle: 'shorts', shoes: '#ffffff', hair: { style: 'bun', color: '#c8a8ff' } }, '#b06aff', ['#1a0a3a', '#b06aff'], ['kpop']),
    P('dex', 'Dex', { body: 'm', skin: '#c88a5a', top: '#ffe040', topStyle: 'long', bottom: '#ff3aa8', bottomStyle: 'pants', shoes: '#ffffff', hair: { style: 'curly', color: '#2a1a0a' }, hat: { type: 'sunglasses' } }, '#3ad8ff', ['#1a0838', '#3ad8ff'], ['disco']),
    P('kiki', 'Kiki', { body: 'w', skin: '#f4d0b0', top: '#3ae07a', topStyle: 'tee', bottom: '#3a8aff', bottomStyle: 'shorts', shoes: '#ffd23a', hair: { style: 'bob', color: '#ff8a3a' } }, '#3ae07a', ['#0a2a4a', '#3ae07a'], ['kids']),
    P('max', 'Max', { body: 'm', skin: '#e0a880', top: '#ff3a6a', topStyle: 'tank', bottom: '#1a1a2a', bottomStyle: 'shorts', shoes: '#3ad8ff', hair: { style: 'short', color: '#3a2010' }, hat: { type: 'band', color: '#ffffff' } }, '#ff3a6a', ['#1a0a1a', '#ff3a6a'], ['fitness']),
    P('dolly', 'Dolly', { body: 'w', skin: '#f0c8a8', top: '#3a8aff', topStyle: 'long', bottom: '#5a3a1a', bottomStyle: 'pants', shoes: '#8a4a1a', hair: { style: 'long', color: '#ffd86a' }, hat: { type: 'band', color: '#c87a3a' } }, '#ffb020', ['#2a1608', '#ffb020'], ['line']),
    P('toni', 'Toni', { body: 'm', skin: '#e8b890', top: '#b06aff', topStyle: 'tee', bottom: '#2a2a3a', bottomStyle: 'pants', shoes: '#ffffff', hair: { style: 'fringe', color: '#4a2a1a' }, hat: { type: 'sunglasses' } }, '#ffd23a', ['#1a0a3a', '#ffd23a'], ['party']),
    P('sepp', 'Sepp', { body: 'm', skin: '#f0c0a0', top: '#ffffff', topStyle: 'tee', bottom: '#3a5a2a', bottomStyle: 'shorts', shoes: '#3a2a1a', hair: { style: 'short', color: '#c88a3a' }, beard: '#c88a3a', hat: { type: 'beanie', color: '#3a5a2a' } }, '#3ae07a', ['#0a2a1a', '#3ae07a'], ['schlager']),
    P('nova', 'Nova', { body: 'w', skin: '#a86b4c', top: '#c77dff', topStyle: 'tank', bottom: '#111122', bottomStyle: 'pants', shoes: '#f72585', hair: { style: 'mohawk', color: '#f72585' } }, '#f72585', ['#1a0628', '#f72585']),
    P('bruno', 'Bruno', { body: 'm', skin: '#e0a47a', top: '#ffb703', topStyle: 'tank', bottom: '#6a4c93', bottomStyle: 'shorts', shoes: '#ffffff', hair: { style: 'bowl', color: '#3b2a1a' }, beard: '#3b2a1a', bulk: 1.18 }, '#ffb703', ['#1a1030', '#ffb703']),
    P('frieda', 'Frieda', { body: 'w', skin: '#f7d7c4', top: '#9bf6ff', topStyle: 'long', bottom: '#4361ee', bottomStyle: 'pants', shoes: '#ffffff', hair: { style: 'pony', color: '#e8eef7' } }, '#9bf6ff', ['#0a1838', '#9bf6ff']),
    P('ole', 'Ole', { body: 'm', skin: '#8d5a3b', top: '#06d6a0', topStyle: 'tee', bottom: '#073b4c', bottomStyle: 'pants', shoes: '#ffffff', hair: { style: 'mohawk', color: '#111111' } }, '#06d6a0', ['#04202a', '#06d6a0']),
  ];
  const BY_STYLE = { pop: 'mila', hiphop: 'kenzo', latin: 'luz', kpop: 'yuna', disco: 'dex', kids: 'kiki', fitness: 'max', line: 'dolly', party: 'toni', schlager: 'sepp' };
  // Auswahl für den Editor
  const SKINS = ['#fbe0cf', '#f3d2b8', '#f2c6a4', '#e8b890', '#d8a070', '#c88a5a', '#a86b4c', '#8a5a3a', '#6a4028', '#4a2c1c'];
  const COLORS = ['#ffffff', '#111122', '#ff3aa8', '#ff3a4a', '#ff8a3a', '#ffd23a', '#3ae07a', '#06d6a0', '#3ad8ff', '#3a8aff', '#4361ee', '#8645e0', '#b06aff', '#c88a3a', '#5a3a28', '#2a2a3a'];
  const HAIRC = ['#111111', '#2a1a0a', '#4b2e1a', '#7a4a24', '#c88a3a', '#ffd86a', '#e8eef7', '#ff5aa8', '#c8a8ff', '#3ad8ff', '#e8731c', '#3ae07a'];
  const HAIRS = [['short', 'Kurz'], ['buzz', 'Raspel'], ['fringe', 'Pony'], ['bowl', 'Topf'], ['spiky', 'Stachel'], ['curly', 'Locken'], ['bob', 'Bob'], ['long', 'Lang'], ['pony', 'Zopf'], ['bun', 'Dutt'], ['mohawk', 'Irokese'], ['bald', 'Glatze']];
  const HATS = [['', 'Keine'], ['cap', 'Kappe'], ['beanie', 'Mütze'], ['band', 'Stirnband'], ['tophat', 'Zylinder'], ['crown', 'Krone'], ['sunglasses', 'Sonnenbrille']];
  window.GADancers = { PRESETS, BY_STYLE, SKINS, COLORS, HAIRC, HAIRS, HATS, byId: id => PRESETS.find(p => p.id === id) };
})();
