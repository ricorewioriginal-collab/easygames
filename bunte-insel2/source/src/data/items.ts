/* Gegenstände: Name, Symbol, Kategorie, Erklärung („Was ist das?“ / „Wofür?“), Wert. */
export type ItemCat = 'essen' | 'werkzeug' | 'quest' | 'sammeln' | 'geschenk' | 'karte' | 'material';
export interface ItemDef { id: string; name: string; icon: string; cat: ItemCat; what: string; use: string; price?: number; heal?: number; gift?: boolean; sell?: number }

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(([
  // Essen & Tränke (heilen im Verbotenen Wald)
  { id: 'apfel', name: 'Apfel', icon: '🍎', cat: 'essen', what: 'Ein knackiger Apfel vom Baum.', use: 'Essen: heilt 1 Herz im Wald. Pferde und Taschis lieben ihn.', price: 2, heal: 1, gift: true, sell: 1 },
  { id: 'karotte', name: 'Karotte', icon: '🥕', cat: 'essen', what: 'Frisch aus dem Garten.', use: 'Futter für Hasen und Datenhain-Begleiter, heilt 1 Herz.', price: 2, heal: 1, gift: true, sell: 1 },
  { id: 'kuchen', name: 'Erdbeerkuchen', icon: '🍰', cat: 'essen', what: 'Aus der Bäckerei der Stadtinsel.', use: 'Heilt 3 Herzen. Ein tolles Geschenk!', price: 8, heal: 3, gift: true, sell: 3 },
  { id: 'eis', name: 'Eis', icon: '🍦', cat: 'essen', what: 'Kühles Eis aus der Eisdiele.', use: 'Heilt 2 Herzen. Macht gute Laune.', price: 4, heal: 2, gift: true, sell: 2 },
  { id: 'burger', name: 'Krabbenburger', icon: '🍔', cat: 'essen', what: 'Spezialität der Knusper-Krabbe.', use: 'Heilt alle Herzen im Wald.', price: 10, heal: 10, gift: true, sell: 4 },
  { id: 'heiltrank', name: 'Heiltrank', icon: '🧪', cat: 'essen', what: 'Aus der Apotheke der Stadtinsel.', use: 'Heilt 4 Herzen im Verbotenen Wald.', price: 12, heal: 4, sell: 4 },
  { id: 'honig', name: 'Honigtopf', icon: '🍯', cat: 'essen', what: 'Süßer Honig aus dem Honigwald.', use: 'Bären mögen ihn. Heilt 2 Herzen.', price: 5, heal: 2, gift: true, sell: 2 },
  { id: 'fisch', name: 'Fisch', icon: '🐟', cat: 'essen', what: 'Selbst geangelt.', use: 'Katzen und Möwen freuen sich. Heilt 1 Herz.', heal: 1, gift: true, sell: 2 },
  { id: 'datenkeks', name: 'Datenkeks', icon: '🍪', cat: 'essen', what: 'Leuchtender Keks aus dem Datenhain.', use: 'Futter für digitale Begleiter.', price: 3, gift: true, sell: 1 },
  { id: 'taschileckerli', name: 'Taschi-Leckerli', icon: '🍬', cat: 'essen', what: 'Süßes für Taschis.', use: 'Damit gewinnst du das Vertrauen wilder Taschis.', price: 3, sell: 1 },
  // Werkzeuge & Fähigkeits-Gegenstände
  { id: 'angel', name: 'Angel', icon: '🎣', cat: 'werkzeug', what: 'Eine einfache Angelrute.', use: 'Am Wasser auswerfen: Fische für das Sammelbuch.', price: 15 },
  { id: 'kescher', name: 'Kescher', icon: '🥅', cat: 'werkzeug', what: 'Ein Netz für Käfer und Quallen.', use: 'Käfer im Gras fangen, Quallen in der Schwammi-Bucht.', price: 12 },
  { id: 'schaufel', name: 'Schaufel', icon: '⛏️', cat: 'werkzeug', what: 'Zum Buddeln.', use: 'An glitzernden Stellen am Strand graben.', price: 12 },
  { id: 'kamera', name: 'Fotoapparat', icon: '📷', cat: 'werkzeug', what: 'Für Erinnerungsfotos.', use: 'Fotos für das Erinnerungsalbum der Regenbogenwelt.' },
  { id: 'knallbeere', name: 'Knallbeere', icon: '💥', cat: 'werkzeug', what: 'Platzt mit einem Knall und Konfetti.', use: 'Sprengt rissige Wände auf der Rätsel-Insel.', price: 6 },
  { id: 'enterhaken', name: 'Enterhaken', icon: '🪝', cat: 'werkzeug', what: 'Ein Haken an einem Seil.', use: 'Zieht dich an goldene Haken-Ringe.' },
  { id: 'gieskanne', name: 'Gießkanne', icon: '🚿', cat: 'werkzeug', what: 'Für Blumen und Beete.', use: 'Gießen lässt Pflanzen schneller wachsen.' },
  // Quest-Gegenstände
  { id: 'splitter', name: 'Kompass-Splitter', icon: '💎', cat: 'quest', what: 'Ein Stück des Regenbogen-Kompasses.', use: 'Bring alle Splitter zum Leuchtturm.' },
  { id: 'zahnrad', name: 'Goldenes Zahnrad', icon: '⚙️', cat: 'quest', what: 'Treibt die Fahrgeschäfte an.', use: 'Bring es zu Parkdirektorin Pia.' },
  { id: 'farbeimer', name: 'Farbeimer', icon: '🪣', cat: 'quest', what: 'Voller leuchtender Farbe.', use: 'Bringt Farbe zurück in den Dampfer-Hafen.' },
  { id: 'note', name: 'Verlorene Note', icon: '🎵', cat: 'quest', what: 'Eine Note aus dem Dampfer-Orchester.', use: 'Bring sie Kapellmeister Klaus.' },
  { id: 'welpe', name: 'Welpen-Halsband', icon: '🐶', cat: 'quest', what: 'Gehört einem Welpen der Fellretter.', use: 'Bring es zur Bellwarte.' },
  { id: 'flossteil', name: 'Floß-Teil', icon: '🪵', cat: 'quest', what: 'Treibgut vom Strand.', use: 'Sechs Teile ergeben ein Floß.' },
  { id: 'wunschfrucht', name: 'Wunschfrucht', icon: '🍑', cat: 'quest', what: 'Wächst nur auf der Wunsch-Insel.', use: 'Ein Wunsch für jemanden, der ihn braucht.' },
  { id: 'lichtschluessel', name: 'Lichtschlüssel', icon: '🗝️', cat: 'quest', what: 'Schließt ein Schlüsselloch im Schlüsselreich auf.', use: 'Steck ihn ins passende Schlüsselloch.' },
  { id: 'erinnerungsfoto', name: 'Erinnerungsfoto', icon: '🖼️', cat: 'quest', what: 'Ein Foto voller schöner Momente.', use: 'Gib es der Familie, die es vergessen hat.' },
  { id: 'mondsplitter', name: 'Mondsplitter', icon: '💠', cat: 'sammeln', what: 'Leuchtende Splitter aus Lunaris.', use: '10 Splitter tauscht Händler Rurik gegen Sterne.', sell: 1 },
  { id: 'funkelstein', name: 'Funkelstein', icon: '💎', cat: 'sammeln', what: 'Glitzert in den Drachenhöhen.', use: 'Drachen sammeln sie. Tausch bei Höhlenforscherin Flora.', sell: 1 },
  { id: 'orichalcum', name: 'Orichalcum', icon: '🔶', cat: 'sammeln', what: 'Seltenes Metall aus Atlantis.', use: 'Wird im Hologramm-Archiv gebraucht.', sell: 2 },
  { id: 'qualle', name: 'Quallen-Gelee', icon: '🪼', cat: 'sammeln', what: 'Glibberig und leuchtend.', use: 'Tadeus braucht es für seine Klarinette.', sell: 2 },
  { id: 'block', name: 'Bauklotz', icon: '🧱', cat: 'material', what: 'Bunter Klotz aus dem Bauland.', use: 'Zum Bauen an Bauplätzen.', price: 1 },
  { id: 'kristall', name: 'Kristall-Splitter', icon: '🔷', cat: 'material', what: 'Lässt sich beim Schmied verwenden.', use: 'Schwert verbessern (wirkt nur im Wald).', sell: 3 },
  { id: 'blume', name: 'Blumenstrauß', icon: '💐', cat: 'geschenk', what: 'Bunte Blumen aus dem Blumenladen.', use: 'Schenke ihn jemandem – Freundschaft wächst!', price: 6, gift: true },
  { id: 'brief', name: 'Brief', icon: '✉️', cat: 'quest', what: 'Ein versiegelter Brief.', use: 'Bring ihn zum Empfänger.' },
  { id: 'paket', name: 'Paket', icon: '📦', cat: 'quest', what: 'Ein Paket für jemanden.', use: 'Liefern!' },
  { id: 'feder', name: 'Bunte Feder', icon: '🪶', cat: 'geschenk', what: 'Von einem Vogel aus dem Märchenland.', use: 'Hübsches Geschenk.', gift: true, sell: 1 },
  { id: 'muschel', name: 'Muschel', icon: '🐚', cat: 'sammeln', what: 'Vom Strand.', use: 'Fürs Sammelbuch. Hübsches Geschenk.', gift: true, sell: 1 },
  { id: 'taschiball', name: 'Taschiball', icon: '🔴', cat: 'werkzeug', what: 'Ein gemütliches Zuhause für ein Taschi.', use: 'Nur Taschis, die dir vertrauen, ziehen ein.', price: 5 }
] as ItemDef[]).map(i => [i.id, i]));

export const itemName = (id: string): string => ITEMS[id]?.name ?? id;
export const itemIcon = (id: string): string => ITEMS[id]?.icon ?? '❔';

export interface AbilityDef { id: string; name: string; icon: string; desc: string }
export const ABILITIES: Record<string, AbilityDef> = {
  doppelsprung: { id: 'doppelsprung', name: 'Doppelsprung', icon: '🦘', desc: 'In der Luft noch einmal springen.' },
  gleiten: { id: 'gleiten', name: 'Drachenflügel', icon: '🪽', desc: 'In der Luft Springen gedrückt halten: gleiten.' },
  lichtzauber: { id: 'lichtzauber', name: 'Lichtzauber', icon: '✨', desc: 'Zündet Laternen und zeigt verborgene Lichtwege.' },
  kisprung: { id: 'kisprung', name: 'Ki-Sprung', icon: '🌀', desc: 'Ducken gedrückt halten und loslassen: riesiger Sprung.' },
  spuernase: { id: 'spuernase', name: 'Blitz’ Spürnase', icon: '🐾', desc: 'Blitz zeigt Duftspuren zu Verlorenem.' },
  feenstaub: { id: 'feenstaub', name: 'Feenstaub', icon: '🧚', desc: 'Kurz schweben (im Märchenland nachfüllbar).' },
  taucherblase: { id: 'taucherblase', name: 'Taucherblase', icon: '🫧', desc: 'Länger und schneller schwimmen.' },
  enterhaken: { id: 'enterhaken', name: 'Enterhaken', icon: '🪝', desc: 'An goldene Haken-Ringe ziehen.' },
  lichtwelle: { id: 'lichtwelle', name: 'Lichtwelle', icon: '🌟', desc: 'Kampf im Wald: Welle aus Licht, die Monster zurückschiebt.' }
};

export const SWORDS = [
  { id: 'holz', name: 'Holzschwert', icon: '🗡️', dmg: 1 },
  { id: 'eisen', name: 'Eisenschwert', icon: '⚔️', dmg: 1.25 },
  { id: 'silber', name: 'Silberschwert', icon: '🔪', dmg: 1.5 },
  { id: 'runen', name: 'Runenschwert', icon: '🔮', dmg: 1.8 },
  { id: 'licht', name: 'Lichtschwert', icon: '🌟', dmg: 2.2 }
];
