/* Stadtgeflüster: Leute auf der Straße bleiben stehen und unterhalten sich. Kurze Wortwechsel (abwechselnd A und B),
   passend zu Tageszeit, Wetter und zu dem, was du gerade in der Stadt anstellst (virale Clips, Fahndung, Parade). */
export interface ChatCtx { night: boolean; rain: boolean; viral: string; wanted: boolean; parade: boolean }

const ALWAYS: string[][] = [
  ['Gehst du heute Abend ins Prisma?', 'Nur wenn du mitkommst. Allein tanz ich nicht.', 'Deal. Ich hol dich um zehn ab.'],
  ['Hast du den neuen Späti-Kaffee probiert?', 'Mit Hafermilch und Glitzer? Zu viel Glitzer.', 'Es gibt kein zu viel Glitzer.'],
  ['Meine Ex hat mir gerade ein Herz geschickt.', 'Nein. Einfach nein.', 'Ich weiß. Aber es war ein lila Herz …'],
  ['Ich hab ein Date mit der Person aus der Dating-App!', 'Die mit dem Hund auf jedem Foto?', 'Der Hund kommt mit. Das ist quasi ein Doppeldate.'],
  ['Die Mieten in der Hochstadt sind irre.', 'Deshalb wohn ich ja bei meiner Wahlfamilie.', 'Habt ihr noch ein Sofa frei?'],
  ['Wer hat eigentlich die Regenbogen-Zebrastreifen bezahlt?', 'Die Stadt. Nach drei Jahren Protest.', 'Hat sich gelohnt.'],
  ['Kommst du am Samstag zum CSD?', 'Ich fahr sogar auf einem Wagen mit!', 'Dann steh ich ganz vorne und kreische.'],
  ['Ich glaub, ich bin verliebt.', 'In wen denn diesmal?', 'In die Barkeeperin aus der One Love Bar. Schon wieder.'],
];
const NIGHT: string[][] = [
  ['Noch einen Absacker in der Bar Komet?', 'Einen. Höchstens zwei.', 'Das sagst du jedes Mal.'],
  ['Die Lichter am Hafen sind nachts so schön.', 'Romantisch. Fast wie im Film.', 'Fehlt nur noch jemand zum Küssen.'],
];
const RAIN: string[][] = [
  ['Natürlich regnet es, wenn ich meine Wildlederschuhe anhab.', 'Rainbow City testet deinen Style.', 'Und ich hab bestanden.'],
  ['Schnell, unter die Markise!', 'Zu spät, meine Frisur ist hin.', 'Nasse Haare sind auch ein Look.'],
];
const VIRAL = (t: string): string[][] => [
  [`Hast du das Video gesehen? „${t}“`, 'Das war doch hier um die Ecke!', 'Ich hab den Fahrer gesehen. Total sympathisch.'],
  ['Mein ganzer Feed ist voll mit diesem Clip.', `„${t}“? Den hab ich dreimal geteilt.`, 'Rainbow City wird noch berühmt.'],
];
const WANTED: string[][] = [
  ['Hörst du die Sirenen?', 'Irgendwer hat wieder Ärger mit der Polizei.', 'Hoffentlich niemand, den wir kennen.'],
];
const PARADE: string[][] = [
  ['Heute ist Parade! Wo ist dein Glitzer?', 'Überall. Wirklich überall.', 'Perfekt. Genau so muss das.'],
];

/** Wortwechsel aussuchen: Aktuelles (Clip, Fahndung, Parade) hat Vorrang, sonst Tageszeit/Wetter/Alltag */
export function pickChat(c: ChatCtx, r = Math.random()): string[] {
  const pool: string[][] = [];
  if (c.viral) pool.push(...VIRAL(c.viral), ...VIRAL(c.viral));
  if (c.wanted) pool.push(...WANTED, ...WANTED);
  if (c.parade) pool.push(...PARADE);
  if (c.rain) pool.push(...RAIN);
  if (c.night) pool.push(...NIGHT);
  pool.push(...ALWAYS);
  return pool[Math.floor(r * pool.length) % pool.length];
}
