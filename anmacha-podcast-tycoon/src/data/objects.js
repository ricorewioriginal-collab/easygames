/* 72 platzierbare Einrichtungs- und Technikobjekte in 12 Gruppen.
   w/d = Grundfläche in Rasterfeldern (1 Feld = 1 m), cost = Kaufpreis (Studio-Credits), upkeep = Unterhalt je Spieltag.
   s = Werte, die in die Simulation eingehen (siehe README „Regeln“):
     audio  Aufnahmequalität (Aufnahmeraum)      tech   Technikqualität (Aufnahme/Regie)   absorb Raumakustik (Aufnahme)
     visual Bildqualität (TV-Bühne, Teaser)      comfort Wohlfühlwert (Lounge, Büros)     research Recherche (Redaktion)
     energy Energie-Erholung (Küche/Lounge)      social Reichweite (Social-Büro)          music Musikqualität (Musikraum)
     reliab Zuverlässigkeit (weniger Pannen)     seats Sitzplätze                          shop Merch-Umsatz   storage Lager
   use = wofür Figuren das Objekt benutzen (sit, work, record, coffee, repair, rest, shop, perform, edit).
   m = Modellteile [Form, x, y, z, a, b, c, Farbe, Optionen]: b=Quader (Mitte, Maße), c=Zylinder (Mitte, rOben, Höhe, rUnten),
   s=Kugel (Mitte, Radius), o=Kegel (Mitte, Radius, Höhe); Optionen { rx, ry, rz, glow }. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {}; const D = PT.DATA = PT.DATA || {};
  D.objectCats = {
    mikro: { name: 'Mikrofone', icon: '🎙️' }, kopfhoerer: { name: 'Kopfhörer', icon: '🎧' }, interface: { name: 'Audiointerfaces', icon: '🔌' },
    mixer: { name: 'Mischpulte', icon: '🎚️' }, kamera: { name: 'Kameras', icon: '🎥' }, licht: { name: 'Licht', icon: '💡' },
    absorber: { name: 'Schallabsorber', icon: '🧱' }, akustikdeko: { name: 'Akustikdeko', icon: '🖼️' }, moebel: { name: 'Möbel', icon: '🛋️' },
    pflanze: { name: 'Pflanzen', icon: '🪴' }, bildschirm: { name: 'Bildschirme', icon: '🖥️' }, requisite: { name: 'Requisiten', icon: '🎭' }
  };
  const O = (id, cat, name, w, d, cost, upkeep, s, use, unlock, m, h) => ({ id, cat, name, w, d, h: h || 1, cost, upkeep, s, use: use || null, unlock: unlock || 1, m });
  const MIC_STAND = (c) => [['c', 0, 0.02, 0, 0.18, 0.04, 0.2, '#2b2f3a'], ['c', 0, 0.6, 0, 0.025, 1.2, 0.025, '#3a3f4d']];
  D.objects = [
    // Mikrofone
    O('mic_alt', 'mikro', 'Altes Tischmikrofon', 1, 1, 60, 1, { audio: 2, reliab: -2 }, 'record', 1, [['c', 0, 0.76, 0, 0.12, 0.04, 0.14, '#5a4a3a'], ['c', 0, 0.9, 0, 0.02, 0.26, 0.02, '#777'], ['c', 0, 1.08, 0, 0.06, 0.16, 0.06, '#9a9a9a']]),
    O('mic_dyn', 'mikro', 'Dynamisches Sprechermikro', 1, 1, 220, 1, { audio: 5, reliab: 1 }, 'record', 1, [...MIC_STAND(), ['c', 0, 1.25, 0, 0.06, 0.22, 0.05, '#1d1f26'], ['s', 0, 1.37, 0, 0.065, 0, 0, '#3b3f4a']]),
    O('mic_kond', 'mikro', 'Großmembran-Kondensator', 1, 1, 480, 2, { audio: 8, tech: 1 }, 'record', 1, [...MIC_STAND(), ['c', 0, 1.28, 0, 0.07, 0.26, 0.07, '#c9b27a'], ['c', 0, 1.28, 0, 0.11, 0.02, 0.11, '#333', { rx: 1.57 }]]),
    O('mic_arm', 'mikro', 'Schwenkarm mit Broadcastmikro', 1, 1, 650, 2, { audio: 9, tech: 1, reliab: 1 }, 'record', 2, [['b', 0, 0.75, 0, 0.3, 0.06, 0.3, '#2b2f3a'], ['c', 0, 1.0, 0, 0.02, 0.5, 0.02, '#ff4d6d'], ['b', 0.2, 1.25, 0, 0.45, 0.03, 0.03, '#ff4d6d', { rz: -0.3 }], ['c', 0.42, 1.18, 0, 0.06, 0.24, 0.06, '#1d1f26']]),
    O('mic_funk', 'mikro', 'Funkmikrofon-Set', 1, 1, 520, 2, { audio: 6, tech: 2, visual: 1 }, 'record', 3, [['b', 0, 0.4, 0, 0.5, 0.8, 0.4, '#3a3f4d'], ['c', -0.12, 0.95, 0, 0.04, 0.3, 0.03, '#ddd'], ['c', 0.12, 0.95, 0, 0.04, 0.3, 0.03, '#ddd'], ['b', 0, 0.82, 0.21, 0.3, 0.06, 0.01, '#4be08a', { glow: true }]]),
    O('mic_shotgun', 'mikro', 'Richtrohr-Mikrofon', 1, 1, 400, 2, { audio: 5, visual: 2 }, 'record', 3, [...MIC_STAND(), ['c', 0, 1.25, 0, 0.03, 0.55, 0.03, '#222', { rx: 1.57 }], ['b', 0, 1.25, -0.2, 0.12, 0.1, 0.18, '#444']]),
    // Kopfhörer
    O('hp_billig', 'kopfhoerer', 'Einfacher Kopfhörer', 1, 1, 40, 0, { audio: 1, comfort: -1 }, null, 1, [['b', 0, 0.76, 0, 0.3, 0.04, 0.3, '#6b4f3a'], ['b', 0, 0.86, 0, 0.18, 0.04, 0.08, '#222'], ['s', -0.09, 0.82, 0, 0.05, 0, 0, '#333'], ['s', 0.09, 0.82, 0, 0.05, 0, 0, '#333']]),
    O('hp_studio', 'kopfhoerer', 'Geschlossener Studiokopfhörer', 1, 1, 160, 0, { audio: 3, tech: 1 }, null, 1, [['b', 0, 0.76, 0, 0.3, 0.04, 0.3, '#6b4f3a'], ['c', 0, 0.95, 0, 0.12, 0.03, 0.12, '#222', { rx: 1.57 }], ['s', -0.12, 0.85, 0, 0.07, 0, 0, '#1d1f26'], ['s', 0.12, 0.85, 0, 0.07, 0, 0, '#1d1f26']]),
    O('hp_offen', 'kopfhoerer', 'Offener Referenzkopfhörer', 1, 1, 260, 0, { audio: 2, tech: 2, comfort: 1 }, 'edit', 2, [['b', 0, 0.76, 0, 0.3, 0.04, 0.3, '#6b4f3a'], ['c', 0, 0.95, 0, 0.12, 0.03, 0.12, '#c9b27a', { rx: 1.57 }], ['s', -0.12, 0.85, 0, 0.075, 0, 0, '#999'], ['s', 0.12, 0.85, 0, 0.075, 0, 0, '#999']]),
    O('hp_verst', 'kopfhoerer', 'Kopfhörerverstärker (4-fach)', 1, 1, 180, 1, { audio: 2, tech: 2, seats: 0 }, null, 2, [['b', 0, 0.8, 0, 0.45, 0.1, 0.3, '#2b2f3a'], ['b', 0, 0.86, 0.15, 0.4, 0.02, 0.01, '#6ef0ff', { glow: true }]]),
    O('hp_haken', 'kopfhoerer', 'Kopfhörer-Wandhaken', 1, 1, 25, 0, { reliab: 1, comfort: 1 }, null, 1, [['b', 0, 1.4, -0.45, 0.2, 0.3, 0.05, '#777'], ['c', 0, 1.3, -0.38, 0.12, 0.03, 0.12, '#222', { rx: 1.57 }]]),
    O('hp_inear', 'kopfhoerer', 'In-Ear-Monitoring', 1, 1, 340, 1, { audio: 2, visual: 1, tech: 1 }, null, 4, [['b', 0, 0.76, 0, 0.3, 0.04, 0.3, '#6b4f3a'], ['b', 0, 0.82, 0, 0.18, 0.08, 0.12, '#1d1f26'], ['s', 0, 0.9, 0, 0.03, 0, 0, '#c58bff']]),
    // Audiointerfaces
    O('if_2', 'interface', 'Interface 2 Kanäle', 1, 1, 180, 1, { tech: 3, audio: 1 }, null, 1, [['b', 0, 0.8, 0, 0.36, 0.08, 0.22, '#c0392b'], ['c', -0.08, 0.86, 0.06, 0.03, 0.03, 0.03, '#222'], ['c', 0.08, 0.86, 0.06, 0.03, 0.03, 0.03, '#222']]),
    O('if_4', 'interface', 'Interface 4 Kanäle', 1, 1, 340, 1, { tech: 5, audio: 2 }, null, 2, [['b', 0, 0.8, 0, 0.48, 0.09, 0.26, '#2b2f3a'], ['b', 0, 0.85, 0.13, 0.4, 0.02, 0.01, '#4be08a', { glow: true }]]),
    O('if_8', 'interface', 'Rack-Interface 8 Kanäle', 1, 1, 720, 2, { tech: 8, audio: 3, reliab: 1 }, null, 3, [['b', 0, 0.55, 0, 0.6, 1.1, 0.5, '#1d1f26'], ['b', 0, 0.8, 0.26, 0.5, 0.05, 0.01, '#6ef0ff', { glow: true }], ['b', 0, 0.6, 0.26, 0.5, 0.05, 0.01, '#4be08a', { glow: true }]]),
    O('if_recorder', 'interface', 'Mobiler Rekorder', 1, 1, 260, 1, { tech: 3, audio: 2, reliab: 1 }, null, 4, [['b', 0, 0.8, 0, 0.16, 0.06, 0.26, '#333'], ['b', 0, 0.84, 0.02, 0.1, 0.01, 0.1, '#6ef0ff', { glow: true }]]),
    O('if_patch', 'interface', 'Steckfeld (Patchbay)', 1, 1, 150, 1, { tech: 2, reliab: 3 }, 'repair', 2, [['b', 0, 0.6, 0, 0.6, 0.3, 0.3, '#2b2f3a'], ['b', 0, 0.62, 0.16, 0.5, 0.06, 0.01, '#ffb02e']]),
    O('if_dsp', 'interface', 'Sprachprozessor', 1, 1, 560, 2, { tech: 4, audio: 4 }, null, 3, [['b', 0, 0.8, 0, 0.48, 0.1, 0.3, '#3a3f4d'], ['c', -0.15, 0.87, 0.12, 0.035, 0.04, 0.035, '#ffb02e'], ['c', 0, 0.87, 0.12, 0.035, 0.04, 0.035, '#ffb02e'], ['c', 0.15, 0.87, 0.12, 0.035, 0.04, 0.035, '#ffb02e']]),
    // Mischpulte
    O('mx_mini', 'mixer', 'Mini-Mischpult', 1, 1, 160, 1, { tech: 2, audio: 1 }, 'edit', 1, [['b', 0, 0.8, 0, 0.45, 0.07, 0.35, '#3a3f4d'], ['b', -0.1, 0.85, 0, 0.03, 0.03, 0.2, '#ffb02e'], ['b', 0.1, 0.85, 0, 0.03, 0.03, 0.2, '#ffb02e']]),
    O('mx_podcast', 'mixer', 'Podcast-Mischpult mit Jingletasten', 1, 1, 420, 2, { tech: 4, audio: 2, music: 1 }, 'edit', 1, [['b', 0, 0.8, 0, 0.7, 0.08, 0.45, '#1d1f26'], ['b', -0.2, 0.86, 0.12, 0.08, 0.03, 0.08, '#ff4d6d', { glow: true }], ['b', 0, 0.86, 0.12, 0.08, 0.03, 0.08, '#4be08a', { glow: true }], ['b', 0.2, 0.86, 0.12, 0.08, 0.03, 0.08, '#6ef0ff', { glow: true }]]),
    O('mx_analog', 'mixer', 'Analoges 16-Kanal-Pult', 2, 1, 980, 3, { tech: 6, audio: 3, music: 2 }, 'edit', 3, [['b', 0, 0.45, 0, 1.6, 0.9, 0.7, '#5a4a3a'], ['b', 0, 0.95, 0, 1.5, 0.1, 0.62, '#2b2f3a', { rx: -0.15 }], ['b', 0, 1.02, 0.1, 1.4, 0.04, 0.05, '#ffb02e']]),
    O('mx_digital', 'mixer', 'Digitales Broadcastpult', 2, 1, 1600, 4, { tech: 9, audio: 4, reliab: 2 }, 'edit', 4, [['b', 0, 0.45, 0, 1.7, 0.9, 0.7, '#1d1f26'], ['b', 0, 0.95, 0, 1.6, 0.1, 0.62, '#3a3f4d', { rx: -0.15 }], ['b', 0, 1.15, -0.25, 0.6, 0.35, 0.03, '#6ef0ff', { glow: true }]]),
    O('mx_dj', 'mixer', 'DJ-Pult', 2, 1, 760, 2, { music: 6, tech: 2, visual: 1 }, 'perform', 3, [['b', 0, 0.45, 0, 1.6, 0.9, 0.6, '#222'], ['c', -0.5, 0.95, 0, 0.22, 0.03, 0.22, '#444'], ['c', 0.5, 0.95, 0, 0.22, 0.03, 0.22, '#444'], ['b', 0, 0.95, 0, 0.3, 0.05, 0.3, '#c58bff', { glow: true }]]),
    O('mx_rack', 'mixer', 'Effektrack', 1, 1, 520, 2, { tech: 3, music: 3, reliab: 1 }, null, 3, [['b', 0, 0.6, 0, 0.6, 1.2, 0.55, '#2b2f3a'], ['b', 0, 0.9, 0.28, 0.5, 0.04, 0.01, '#ff4d6d', { glow: true }], ['b', 0, 0.5, 0.28, 0.5, 0.04, 0.01, '#ffb02e', { glow: true }]]),
    // Kameras
    O('cam_web', 'kamera', 'Webcam auf Stativ', 1, 1, 120, 1, { visual: 2 }, null, 2, [['c', 0, 0.7, 0, 0.02, 1.4, 0.02, '#333'], ['b', 0, 1.42, 0, 0.14, 0.08, 0.08, '#222'], ['c', 0, 1.42, 0.05, 0.03, 0.02, 0.03, '#6ef0ff', { rx: 1.57, glow: true }]]),
    O('cam_hd', 'kamera', 'HD-Studiokamera', 1, 1, 640, 2, { visual: 5, tech: 1 }, 'work', 3, [['c', 0, 0.6, 0, 0.03, 1.2, 0.03, '#333'], ['o', 0, 0.12, 0, 0.3, 0.2, 0, '#333'], ['b', 0, 1.35, 0, 0.25, 0.25, 0.45, '#1d1f26'], ['c', 0, 1.35, 0.28, 0.08, 0.12, 0.08, '#111', { rx: 1.57 }]]),
    O('cam_schwenk', 'kamera', 'Schwenkkopf-Kamera (PTZ)', 1, 1, 980, 3, { visual: 7, tech: 2 }, null, 3, [['b', 0, 2.3, -0.4, 0.2, 0.1, 0.2, '#777'], ['s', 0, 2.15, -0.35, 0.14, 0, 0, '#ddd'], ['c', 0, 2.15, -0.2, 0.05, 0.1, 0.05, '#111', { rx: 1.57 }]], 2.4),
    O('cam_kran', 'kamera', 'Kamerakran', 2, 2, 2200, 5, { visual: 10, tech: 1 }, 'work', 5, [['c', 0, 0.8, 0, 0.08, 1.6, 0.12, '#333'], ['b', 0.4, 1.7, 0, 1.6, 0.08, 0.08, '#ffb02e', { rz: 0.25 }], ['b', 1.1, 1.85, 0, 0.3, 0.25, 0.4, '#1d1f26']], 2),
    O('cam_action', 'kamera', 'Action-Kamera', 1, 1, 220, 1, { visual: 2, reliab: 1 }, null, 4, [['b', 0, 0.78, 0, 0.12, 0.08, 0.06, '#222'], ['c', 0, 0.78, 0.04, 0.025, 0.02, 0.025, '#6ef0ff', { rx: 1.57 }]]),
    O('cam_teleprompter', 'kamera', 'Teleprompter', 1, 1, 540, 2, { visual: 3, research: 2 }, null, 3, [['c', 0, 0.6, 0, 0.03, 1.2, 0.03, '#333'], ['b', 0, 1.35, 0, 0.5, 0.35, 0.05, '#111', { rx: -0.6 }], ['b', 0, 1.36, 0.02, 0.44, 0.28, 0.01, '#6ef0ff', { rx: -0.6, glow: true }]]),
    // Licht
    O('li_steh', 'licht', 'Stehlampe', 1, 1, 70, 1, { comfort: 2, visual: 1 }, null, 1, [['c', 0, 0.75, 0, 0.02, 1.5, 0.02, '#333'], ['o', 0, 1.55, 0, 0.22, 0.3, 0, '#ffd36b', { glow: true }]]),
    O('li_softbox', 'licht', 'Softbox', 1, 1, 240, 1, { visual: 3 }, null, 2, [['c', 0, 0.8, 0, 0.02, 1.6, 0.02, '#333'], ['b', 0, 1.65, 0, 0.6, 0.6, 0.15, '#fff8e8', { glow: true }]]),
    O('li_ring', 'licht', 'Ringlicht', 1, 1, 150, 1, { visual: 2, social: 1 }, null, 2, [['c', 0, 0.75, 0, 0.02, 1.5, 0.02, '#333'], ['c', 0, 1.6, 0, 0.25, 0.04, 0.25, '#fff', { rx: 1.57, glow: true }]]),
    O('li_spot', 'licht', 'Bühnenscheinwerfer', 1, 1, 420, 2, { visual: 4 }, null, 3, [['c', 0, 0.7, 0, 0.03, 1.4, 0.03, '#222'], ['c', 0, 1.5, 0, 0.16, 0.4, 0.2, '#111', { rx: 1.0 }], ['c', 0, 1.62, 0.15, 0.14, 0.02, 0.14, '#fff2b0', { rx: 1.0, glow: true }]]),
    O('li_neon', 'licht', 'Neon-Schriftzug „ON AIR“', 1, 1, 260, 1, { visual: 2, comfort: 2, social: 1 }, null, 1, [['b', 0, 1.8, -0.45, 0.9, 0.3, 0.05, '#331a1a'], ['b', 0, 1.8, -0.42, 0.8, 0.2, 0.02, '#ff4d6d', { glow: true }]], 2),
    O('li_led', 'licht', 'LED-Lichtleiste', 1, 1, 120, 1, { visual: 1, comfort: 1 }, null, 1, [['b', 0, 0.05, 0, 0.9, 0.04, 0.1, '#c58bff', { glow: true }]]),
    // Schallabsorber
    O('ab_schaum', 'absorber', 'Schaumstoffplatten', 1, 1, 80, 0, { absorb: 3 }, null, 1, [['b', 0, 1.4, -0.46, 0.9, 0.9, 0.06, '#3a3f4d'], ['b', -0.22, 1.4, -0.42, 0.4, 0.4, 0.03, '#4a4f5d'], ['b', 0.22, 1.4, -0.42, 0.4, 0.4, 0.03, '#4a4f5d']], 2),
    O('ab_paneel', 'absorber', 'Stoffbespanntes Akustikpaneel', 1, 1, 160, 0, { absorb: 5, comfort: 1 }, null, 1, [['b', 0, 1.4, -0.46, 0.9, 1.1, 0.08, '#6b4f7a']], 2),
    O('ab_bass', 'absorber', 'Eck-Bassfalle', 1, 1, 220, 0, { absorb: 6 }, null, 2, [['b', 0, 0.9, 0, 0.6, 1.8, 0.6, '#2b2f3a', { ry: 0.785 }]], 2),
    O('ab_wand', 'absorber', 'Mobile Akustikwand', 1, 1, 260, 0, { absorb: 5, visual: 1 }, null, 2, [['b', 0, 0.9, 0, 0.95, 1.7, 0.12, '#3d5a6b'], ['b', -0.4, 0.05, 0, 0.1, 0.1, 0.5, '#222'], ['b', 0.4, 0.05, 0, 0.1, 0.1, 0.5, '#222']], 2),
    O('ab_decke', 'absorber', 'Deckensegel', 1, 1, 300, 0, { absorb: 7 }, null, 3, [['b', 0, 2.55, 0, 0.95, 0.06, 0.95, '#f2efe6']], 2.6),
    O('ab_vorhang', 'absorber', 'Schwerer Bühnenvorhang', 1, 1, 200, 0, { absorb: 4, visual: 2 }, null, 2, [['b', 0, 1.3, -0.44, 0.95, 2.6, 0.08, '#8a1f2b']], 2.7),
    // Akustikdeko
    O('ad_holz', 'akustikdeko', 'Holz-Diffusor', 1, 1, 240, 0, { absorb: 3, comfort: 2, visual: 1 }, null, 2, [['b', 0, 1.4, -0.46, 0.9, 0.9, 0.06, '#8a6a4a'], ['b', -0.25, 1.4, -0.4, 0.1, 0.9, 0.1, '#a8845a'], ['b', 0, 1.4, -0.4, 0.1, 0.9, 0.16, '#a8845a'], ['b', 0.25, 1.4, -0.4, 0.1, 0.9, 0.08, '#a8845a']], 2),
    O('ad_moos', 'akustikdeko', 'Mooswand', 1, 1, 280, 0, { absorb: 3, comfort: 3 }, null, 2, [['b', 0, 1.4, -0.46, 0.9, 1.2, 0.06, '#3e6b3a'], ['s', -0.2, 1.5, -0.42, 0.12, 0, 0, '#4f8a49'], ['s', 0.2, 1.3, -0.42, 0.14, 0, 0, '#4f8a49']], 2),
    O('ad_bild', 'akustikdeko', 'Akustikbild „Wellen“', 1, 1, 180, 0, { absorb: 2, comfort: 2, visual: 1 }, null, 1, [['b', 0, 1.5, -0.46, 0.8, 0.6, 0.06, '#2a6a8a'], ['b', 0, 1.5, -0.43, 0.6, 0.08, 0.01, '#6ef0ff']], 2),
    O('ad_teppich', 'akustikdeko', 'Dicker Teppich', 2, 2, 150, 0, { absorb: 3, comfort: 2 }, null, 1, [['b', 0, 0.015, 0, 1.9, 0.03, 1.9, '#9a4a3a'], ['b', 0, 0.02, 0, 1.4, 0.03, 1.4, '#c46a4a']]),
    O('ad_regal', 'akustikdeko', 'Plattenregal als Diffusor', 1, 1, 200, 0, { absorb: 2, music: 1, comfort: 1 }, null, 1, [['b', 0, 0.9, -0.3, 0.95, 1.8, 0.35, '#6b4f3a'], ['b', 0, 0.6, -0.15, 0.85, 0.3, 0.02, '#c58bff'], ['b', 0, 1.2, -0.15, 0.85, 0.3, 0.02, '#ffb02e']], 2),
    O('ad_kissen', 'akustikdeko', 'Sitzkissen-Berg', 1, 1, 90, 0, { absorb: 1, comfort: 3, seats: 1 }, 'sit', 1, [['s', -0.15, 0.15, 0, 0.2, 0, 0, '#ff7ad9'], ['s', 0.15, 0.15, 0.1, 0.2, 0, 0, '#ffb02e'], ['s', 0, 0.35, -0.05, 0.18, 0, 0, '#6ef0ff']]),
    // Möbel
    O('mo_tisch', 'moebel', 'Podcast-Tisch', 2, 1, 180, 0, { seats: 0, comfort: 1, tech: 1 }, 'work', 1, [['b', 0, 0.72, 0, 1.9, 0.06, 0.9, '#8a6a4a'], ['b', -0.85, 0.36, 0, 0.08, 0.72, 0.8, '#5a4a3a'], ['b', 0.85, 0.36, 0, 0.08, 0.72, 0.8, '#5a4a3a']]),
    O('mo_stuhl', 'moebel', 'Holzstuhl', 1, 1, 45, 0, { seats: 1 }, 'sit', 1, [['b', 0, 0.45, 0, 0.45, 0.06, 0.45, '#8a6a4a'], ['b', 0, 0.8, -0.2, 0.45, 0.6, 0.05, '#8a6a4a'], ['b', 0, 0.22, 0, 0.4, 0.44, 0.4, '#5a4a3a']]),
    O('mo_buero', 'moebel', 'Ergonomischer Bürostuhl', 1, 1, 210, 0, { seats: 1, comfort: 2, research: 1 }, 'sit', 1, [['c', 0, 0.25, 0, 0.04, 0.5, 0.04, '#333'], ['b', 0, 0.5, 0, 0.5, 0.08, 0.5, '#1d1f26'], ['b', 0, 0.85, -0.22, 0.48, 0.6, 0.06, '#1d1f26'], ['c', 0, 0.03, 0, 0.3, 0.04, 0.3, '#333']]),
    O('mo_sofa', 'moebel', 'Gäste-Sofa', 2, 1, 380, 0, { seats: 2, comfort: 5 }, 'sit', 1, [['b', 0, 0.25, 0, 1.9, 0.4, 0.85, '#3d5a8a'], ['b', 0, 0.65, -0.35, 1.9, 0.5, 0.2, '#3d5a8a'], ['b', -0.9, 0.45, 0, 0.15, 0.4, 0.85, '#34507a'], ['b', 0.9, 0.45, 0, 0.15, 0.4, 0.85, '#34507a']]),
    O('mo_schreib', 'moebel', 'Schreibtisch', 2, 1, 160, 0, { research: 2 }, 'work', 1, [['b', 0, 0.74, 0, 1.8, 0.05, 0.8, '#d8d2c4'], ['b', -0.8, 0.37, 0, 0.06, 0.74, 0.7, '#777'], ['b', 0.8, 0.37, 0, 0.06, 0.74, 0.7, '#777']]),
    O('mo_regal', 'moebel', 'Bücherregal', 1, 1, 120, 0, { research: 2, storage: 2 }, null, 1, [['b', 0, 1.0, -0.3, 0.95, 2.0, 0.35, '#8a6a4a'], ['b', -0.2, 0.7, -0.15, 0.4, 0.3, 0.05, '#c0392b'], ['b', 0.2, 1.3, -0.15, 0.4, 0.3, 0.05, '#2a6a8a']], 2.1),
    O('mo_kaffee', 'moebel', 'Kaffeemaschine', 1, 1, 260, 1, { energy: 6, comfort: 1 }, 'coffee', 1, [['b', 0, 0.45, 0, 0.9, 0.9, 0.6, '#d8d2c4'], ['b', 0, 1.1, 0, 0.35, 0.4, 0.3, '#2b2f3a'], ['c', 0, 0.98, 0.12, 0.04, 0.08, 0.04, '#fff']]),
    O('mo_kuehl', 'moebel', 'Kühlschrank', 1, 1, 300, 1, { energy: 3, comfort: 2 }, 'coffee', 1, [['b', 0, 0.9, 0, 0.8, 1.8, 0.7, '#e8e8e8'], ['b', 0.32, 1.1, 0.36, 0.04, 0.4, 0.02, '#999']], 1.9),
    O('mo_werkbank', 'moebel', 'Technik-Werkbank', 2, 1, 420, 1, { reliab: 4, tech: 2 }, 'repair', 1, [['b', 0, 0.85, 0, 1.9, 0.08, 0.8, '#6b5a3a'], ['b', 0, 0.42, 0, 1.8, 0.84, 0.7, '#3a3f4d'], ['b', -0.5, 0.95, 0, 0.3, 0.12, 0.2, '#ffb02e'], ['c', 0.5, 0.95, 0, 0.06, 0.15, 0.06, '#c0392b']]),
    O('mo_tresen', 'moebel', 'Empfangstresen', 2, 1, 520, 1, { comfort: 2, shop: 2, social: 1 }, 'work', 2, [['b', 0, 0.55, 0, 1.9, 1.1, 0.7, '#3a3f4d'], ['b', 0, 1.12, 0, 2.0, 0.05, 0.8, '#ffb02e']]),
    O('mo_hocker', 'moebel', 'Barhocker', 1, 1, 70, 0, { seats: 1, comfort: 1 }, 'sit', 2, [['c', 0, 0.4, 0, 0.04, 0.8, 0.04, '#777'], ['c', 0, 0.8, 0, 0.2, 0.06, 0.2, '#c0392b'], ['c', 0, 0.02, 0, 0.22, 0.04, 0.22, '#777']]),
    // Pflanzen
    O('pf_monstera', 'pflanze', 'Monstera', 1, 1, 60, 0, { comfort: 2, absorb: 1 }, null, 1, [['c', 0, 0.2, 0, 0.2, 0.4, 0.16, '#c46a4a'], ['s', 0, 0.75, 0, 0.38, 0, 0, '#2f7a3a'], ['s', 0.15, 1.05, 0.05, 0.22, 0, 0, '#3e8a49']]),
    O('pf_kaktus', 'pflanze', 'Kaktus „Stachel-Uwe“', 1, 1, 30, 0, { comfort: 1, reliab: 1 }, null, 1, [['c', 0, 0.12, 0, 0.14, 0.24, 0.12, '#c46a4a'], ['c', 0, 0.5, 0, 0.08, 0.55, 0.09, '#4f8a49'], ['c', 0.12, 0.55, 0, 0.04, 0.2, 0.04, '#4f8a49', { rz: -0.8 }]]),
    O('pf_palme', 'pflanze', 'Zimmerpalme', 1, 1, 90, 0, { comfort: 3 }, null, 1, [['c', 0, 0.2, 0, 0.2, 0.4, 0.16, '#d8d2c4'], ['c', 0, 0.9, 0, 0.04, 1.1, 0.05, '#7a5a3a'], ['o', 0, 1.55, 0, 0.5, 0.3, 0, '#3e8a49']], 1.8),
    O('pf_haenge', 'pflanze', 'Hängepflanze', 1, 1, 45, 0, { comfort: 2 }, null, 1, [['c', 0, 2.2, 0, 0.16, 0.2, 0.12, '#d8d2c4'], ['s', 0, 2.0, 0, 0.25, 0, 0, '#3e8a49']], 2.4),
    O('pf_kraeuter', 'pflanze', 'Kräuterkasten', 1, 1, 50, 0, { comfort: 1, energy: 1 }, null, 1, [['b', 0, 0.75, -0.3, 0.8, 0.15, 0.25, '#8a6a4a'], ['s', -0.2, 0.9, -0.3, 0.12, 0, 0, '#4f8a49'], ['s', 0.2, 0.9, -0.3, 0.12, 0, 0, '#5fa04f']]),
    O('pf_bonsai', 'pflanze', 'Bonsai', 1, 1, 140, 0, { comfort: 2, research: 1 }, null, 2, [['b', 0, 0.78, 0, 0.3, 0.06, 0.2, '#2b2f3a'], ['c', 0, 0.88, 0, 0.02, 0.14, 0.03, '#7a5a3a'], ['s', 0, 0.98, 0, 0.12, 0, 0, '#2f7a3a']]),
    // Bildschirme
    O('bs_laptop', 'bildschirm', 'Laptop', 1, 1, 450, 1, { tech: 2, research: 2 }, 'edit', 1, [['b', 0, 0.76, 0.05, 0.38, 0.02, 0.26, '#999'], ['b', 0, 0.9, -0.08, 0.38, 0.26, 0.02, '#333', { rx: -0.2 }], ['b', 0, 0.9, -0.07, 0.34, 0.22, 0.01, '#6ef0ff', { rx: -0.2, glow: true }]]),
    O('bs_monitor', 'bildschirm', 'Schnittmonitor 27"', 1, 1, 380, 1, { tech: 3, research: 1 }, 'edit', 1, [['b', 0, 0.78, 0, 0.25, 0.04, 0.2, '#333'], ['b', 0, 1.05, 0, 0.62, 0.38, 0.03, '#222'], ['b', 0, 1.05, 0.02, 0.58, 0.34, 0.01, '#3a6aa8', { glow: true }]]),
    O('bs_wand', 'bildschirm', 'Großbild-Wand', 2, 1, 1200, 3, { visual: 5, social: 2 }, null, 3, [['b', 0, 1.5, -0.42, 1.9, 1.1, 0.08, '#111'], ['b', 0, 1.5, -0.37, 1.8, 1.0, 0.01, '#ff7ad9', { glow: true }]], 2.2),
    O('bs_social', 'bildschirm', 'Social-Media-Station', 1, 1, 520, 1, { social: 5, research: 1 }, 'work', 2, [['b', -0.18, 1.05, 0, 0.32, 0.22, 0.03, '#222'], ['b', 0.18, 1.05, 0, 0.32, 0.22, 0.03, '#222'], ['b', -0.18, 1.05, 0.02, 0.28, 0.18, 0.01, '#4be08a', { glow: true }], ['b', 0.18, 1.05, 0.02, 0.28, 0.18, 0.01, '#ffb02e', { glow: true }]]),
    O('bs_server', 'bildschirm', 'Serverschrank', 1, 1, 900, 3, { tech: 4, reliab: 3, social: 1 }, 'repair', 3, [['b', 0, 1.0, 0, 0.7, 2.0, 0.8, '#1d1f26'], ['b', 0, 1.6, 0.41, 0.6, 0.05, 0.01, '#4be08a', { glow: true }], ['b', 0, 1.2, 0.41, 0.6, 0.05, 0.01, '#4be08a', { glow: true }], ['b', 0, 0.8, 0.41, 0.6, 0.05, 0.01, '#6ef0ff', { glow: true }]], 2.1),
    O('bs_retro', 'bildschirm', 'Röhrenfernseher (Retro)', 1, 1, 140, 0, { visual: 1, comfort: 2 }, null, 1, [['b', 0, 0.3, 0, 0.7, 0.6, 0.6, '#6b4f3a'], ['b', 0, 0.8, 0, 0.6, 0.5, 0.5, '#3a3a3a'], ['b', 0, 0.8, 0.26, 0.48, 0.38, 0.01, '#9ab0c0', { glow: true }]]),
    // Requisiten
    O('rq_buzzer', 'requisite', 'Quiz-Buzzerpult', 1, 1, 340, 1, { visual: 2, comfort: 1 }, 'perform', 2, [['b', 0, 0.5, 0, 0.8, 1.0, 0.5, '#2a3a8a'], ['c', 0, 1.05, 0, 0.12, 0.08, 0.14, '#ff4d6d', { glow: true }]]),
    O('rq_synth', 'requisite', 'Synthesizer', 2, 1, 690, 1, { music: 6, tech: 1 }, 'perform', 2, [['b', 0, 0.4, 0, 1.4, 0.8, 0.5, '#333'], ['b', 0, 0.85, 0, 1.4, 0.1, 0.45, '#1d1f26'], ['b', 0, 0.91, 0.08, 1.2, 0.02, 0.2, '#f2efe6']]),
    O('rq_gitarre', 'requisite', 'Akustikgitarre am Ständer', 1, 1, 260, 0, { music: 3, comfort: 1 }, 'perform', 1, [['s', 0, 0.45, 0, 0.22, 0, 0, '#a8845a'], ['b', 0, 0.95, 0, 0.06, 0.8, 0.04, '#5a4a3a'], ['b', 0, 0.2, 0.1, 0.3, 0.05, 0.3, '#333']]),
    O('rq_merch', 'requisite', 'Merch-Ständer', 1, 1, 380, 1, { shop: 5, social: 1 }, 'shop', 2, [['c', 0, 0.8, 0, 0.03, 1.6, 0.03, '#777'], ['b', 0, 1.3, 0, 0.6, 0.6, 0.05, '#ffb02e'], ['b', 0, 0.8, 0, 0.5, 0.5, 0.05, '#ff7ad9']], 1.8),
    O('rq_onair', 'requisite', 'Rotlicht „Aufnahme läuft“', 1, 1, 90, 0, { reliab: 1, visual: 1 }, null, 1, [['b', 0, 2.1, -0.45, 0.4, 0.2, 0.06, '#222'], ['b', 0, 2.1, -0.41, 0.34, 0.14, 0.02, '#ff4d6d', { glow: true }]], 2.3),
    O('rq_pokal', 'requisite', 'Pokalvitrine', 1, 1, 450, 0, { comfort: 2, social: 2, visual: 1 }, null, 4, [['b', 0, 0.9, -0.2, 0.9, 1.8, 0.5, '#9ab0c0'], ['c', 0, 1.2, -0.2, 0.08, 0.25, 0.04, '#ffd36b'], ['c', 0, 0.6, -0.2, 0.08, 0.25, 0.04, '#ffd36b']], 2),
    O('rq_kisten', 'requisite', 'Equipment-Kisten', 1, 1, 110, 0, { storage: 4, reliab: 1 }, null, 1, [['b', 0, 0.3, 0, 0.8, 0.6, 0.6, '#3a3f4d'], ['b', 0, 0.75, 0, 0.6, 0.3, 0.5, '#2b2f3a'], ['b', 0, 0.6, 0.31, 0.6, 0.05, 0.01, '#ffb02e']]),
    O('rq_buehne', 'requisite', 'Bühnenpodest', 2, 2, 600, 1, { visual: 4, seats: 0 }, 'perform', 3, [['b', 0, 0.15, 0, 1.95, 0.3, 1.95, '#2b2f3a'], ['b', 0, 0.31, 0.95, 1.9, 0.02, 0.04, '#ffb02e', { glow: true }]])
  ];
  // Ebenen: top = steht auf einer Ablage (Tisch, Schreibtisch, Tresen, Werkbank), surface = ist eine Ablage,
  // wall = hängt an einer Wand (Rückseite muss an einer Wand liegen, blockiert keine Wege), ceil = hängt an der Decke (blockiert nichts)
  const LAYER = {
    top: ['mic_alt', 'mic_arm', 'hp_billig', 'hp_studio', 'hp_offen', 'hp_verst', 'hp_inear', 'if_2', 'if_4', 'if_recorder', 'if_dsp', 'mx_mini', 'mx_podcast', 'cam_action', 'bs_laptop', 'bs_monitor', 'bs_social', 'pf_bonsai'],
    surface: ['mo_tisch', 'mo_schreib', 'mo_tresen', 'mo_werkbank'],
    wall: ['hp_haken', 'ab_schaum', 'ab_paneel', 'ad_holz', 'ad_moos', 'ad_bild', 'li_neon', 'rq_onair', 'pf_kraeuter'],
    ceil: ['ab_decke', 'pf_haenge', 'cam_schwenk']
  };
  D.objects.forEach(o => { o.layer = 'floor'; });
  Object.keys(LAYER).forEach(l => LAYER[l].forEach(id => { const o = D.objects.find(x => x.id === id); if (!o) throw new Error('Objekt ' + id + ' fehlt'); if (l === 'surface') o.surface = true; else o.layer = l; }));
  D.objectById = {}; D.objects.forEach(o => { D.objectById[o.id] = o; });

  // Bau-Elemente für Wände/Böden/Türen/Fenster (Raster-Kanten bzw. -Felder)
  D.buildParts = {
    wall: { name: 'Wand', icon: '🧱', cost: 40, refund: 0.5 },
    door: { name: 'Tür', icon: '🚪', cost: 70, refund: 0.5 },
    window: { name: 'Fenster', icon: '🪟', cost: 90, refund: 0.5 },
    floors: [
      { id: 'holz', name: 'Holzdielen', cost: 12, color: '#a8845a', absorb: 0, comfort: 0.2 },
      { id: 'teppich', name: 'Teppichboden', cost: 16, color: '#6b4f7a', absorb: 0.3, comfort: 0.3 },
      { id: 'fliesen', name: 'Fliesen', cost: 14, color: '#d8d2c4', absorb: -0.1, comfort: 0.1 },
      { id: 'beton', name: 'Sichtbeton', cost: 8, color: '#8a8f99', absorb: -0.2, comfort: 0 },
      { id: 'parkett', name: 'Eichenparkett', cost: 22, color: '#c49a5a', absorb: 0, comfort: 0.4 }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
