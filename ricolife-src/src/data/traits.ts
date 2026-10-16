import type { AspirationId, EmotionId, NeedId, SkillId, TraitId } from './types';

export interface TraitDef {
  id: TraitId;
  name: string;
  icon: string;
  desc: string;
  /** Faktor auf den Bedürfnisverfall (1 = normal) */
  decay?: Partial<Record<NeedId, number>>;
  /** Faktor auf den Fortschritt dieser Fähigkeiten */
  skills?: Partial<Record<SkillId, number>>;
  /** Vorliebe für Interaktionen (Interaktions-ID → Faktor auf die Autonomie-Bewertung, < 1 = meidet) */
  likes?: Record<string, number>;
  /** Faktor auf Annahme-Chancen sozialer Interaktionen der Kategorien */
  socialMod?: Partial<Record<'friendly' | 'funny' | 'romantic' | 'mean' | 'deep', number>>;
  /** häufigere Grundstimmung */
  emo?: EmotionId;
  /** schließt sich gegenseitig aus */
  conflicts?: TraitId[];
}

export const TRAITS: TraitDef[] = [
  { id: 'social', name: 'Gesellig', icon: '🗣️', desc: 'Blüht unter Menschen auf, wird allein schnell einsam.', decay: { social: 1.5 }, likes: { chat: 1.6, dance: 1.3, joke: 1.3 }, socialMod: { friendly: 1.2 }, conflicts: ['loner'] },
  { id: 'loner', name: 'Einzelgänger', icon: '🌙', desc: 'Braucht wenig Gesellschaft und genießt die Ruhe.', decay: { social: 0.5 }, likes: { read: 1.4, chat: 0.6, dance: 0.6 }, socialMod: { friendly: 0.85 }, conflicts: ['social'] },
  { id: 'creative', name: 'Kreativ', icon: '🎨', desc: 'Lernt Malen, Musik und Schreiben schneller und wird oft inspiriert.', skills: { painting: 1.3, music: 1.3, writing: 1.3, photography: 1.2 }, likes: { paint: 1.5, playGuitar: 1.3, playPiano: 1.3, writeBook: 1.3 }, emo: 'inspired' },
  { id: 'ambitious', name: 'Ehrgeizig', icon: '📈', desc: 'Will im Beruf hoch hinaus – Beförderungen beflügeln, Rückschläge schmerzen.', likes: { mirrorPractice: 1.3, program: 1.2 }, emo: 'focused', conflicts: ['lazy'] },
  { id: 'neat', name: 'Ordentlich', icon: '🧽', desc: 'Räumt freiwillig auf und hasst schmutziges Geschirr.', likes: { washDishes: 2, clean: 2, shower: 1.2 }, decay: { hygiene: 0.9 }, conflicts: ['messy'] },
  { id: 'messy', name: 'Chaotisch', icon: '🧦', desc: 'Lässt Dinge gern liegen – Unordnung stört kaum.', likes: { washDishes: 0.4, clean: 0.4 }, conflicts: ['neat'] },
  { id: 'animallover', name: 'Tierlieb', icon: '🐾', desc: 'Liebt Haustiere über alles.', likes: { petPlay: 2, petFeed: 1.5, petPet: 2, petWalk: 1.6 } },
  { id: 'active', name: 'Sportlich', icon: '🏃', desc: 'Braucht Bewegung, trainiert gern und schneller.', skills: { fitness: 1.4 }, likes: { workout: 1.8, yoga: 1.3, swim: 1.5, petWalk: 1.2 }, decay: { energy: 0.9, fun: 1.1 }, conflicts: ['lazy'] },
  { id: 'lazy', name: 'Bequem', icon: '🛋️', desc: 'Liebt Sofa und Bett, meidet Anstrengung.', likes: { watchTV: 1.6, nap: 1.8, workout: 0.4, relax: 1.5 }, decay: { energy: 1.15 }, conflicts: ['active', 'ambitious'] },
  { id: 'romantic', name: 'Romantisch', icon: '💘', desc: 'Sucht Liebe und kann besonders charmant flirten.', socialMod: { romantic: 1.35 }, likes: { flirt: 1.5 }, emo: 'love' },
  { id: 'shy', name: 'Schüchtern', icon: '🙈', desc: 'Braucht Zeit, um aufzutauen – Fremde sind anstrengend.', socialMod: { friendly: 0.85, romantic: 0.85 }, decay: { social: 0.8 }, emo: 'embarrassed' },
  { id: 'funny', name: 'Humorvoll', icon: '😄', desc: 'Witze kommen besser an, lacht gern.', socialMod: { funny: 1.4 }, likes: { joke: 1.8, watchTV: 1.2 }, emo: 'playful' },
  { id: 'foodie', name: 'Feinschmecker', icon: '🍳', desc: 'Kocht leidenschaftlich und genießt gutes Essen.', skills: { cooking: 1.4 }, likes: { cook: 1.8, orderFood: 1.5 }, decay: { hunger: 1.1 } },
  { id: 'bookworm', name: 'Bücherwurm', icon: '📚', desc: 'Liest viel und lernt durch Bücher schneller.', skills: { writing: 1.2, logic: 1.15 }, likes: { read: 2, writeBook: 1.3 } },
  { id: 'cheerful', name: 'Fröhlich', icon: '🌞', desc: 'Meist gut gelaunt, schlechte Stimmung hält nicht lange.', emo: 'happy', conflicts: ['grumpy'] },
  { id: 'grumpy', name: 'Grummelig', icon: '🌧️', desc: 'Schnell genervt, aber mit weichem Kern.', socialMod: { friendly: 0.8, mean: 1.3 }, emo: 'angry', conflicts: ['cheerful'] },
  { id: 'genius', name: 'Genie', icon: '🧠', desc: 'Lernt Logik und Programmieren schneller, liebt Schach.', skills: { logic: 1.4, programming: 1.3 }, likes: { chess: 1.8, stargaze: 1.5 }, emo: 'focused' },
  { id: 'musical', name: 'Musikalisch', icon: '🎵', desc: 'Musik ist Lebenselixier – lernt Instrumente schneller.', skills: { music: 1.5 }, likes: { playGuitar: 1.8, playPiano: 1.8, listenMusic: 1.6, dance: 1.3 } },
  { id: 'outdoorsy', name: 'Naturfreund', icon: '🌳', desc: 'Gern draußen: Garten, Angeln, Parks.', skills: { gardening: 1.3, fishing: 1.3 }, likes: { garden: 1.8, fish: 1.8, grill: 1.4, sitBench: 1.3 } },
  { id: 'familyoriented', name: 'Familienmensch', icon: '🏡', desc: 'Familie geht vor; Zeit mit Kindern macht glücklich.', likes: { readStory: 1.8, playTogether: 1.6 } },
  { id: 'hothead', name: 'Hitzkopf', icon: '🔥', desc: 'Wird schnell wütend und streitet leichter.', socialMod: { mean: 1.4, friendly: 0.9 }, likes: { punch: 1.6 }, emo: 'angry' },
  { id: 'kind', name: 'Herzensgut', icon: '💛', desc: 'Hilfsbereit, tröstet gern, freundliche Gesten kommen gut an.', socialMod: { friendly: 1.25, mean: 0.5 }, likes: { comfort: 1.8 } },
  { id: 'geek', name: 'Technikfan', icon: '🎮', desc: 'Liebt Computer und Spiele, programmiert schneller.', skills: { programming: 1.3, handiness: 1.1 }, likes: { playGames: 2, program: 1.5, tinker: 1.4 } },
  { id: 'perfectionist', name: 'Perfektionist', icon: '✨', desc: 'Braucht länger, aber Ergebnisse werden besser.', skills: { painting: 1.1, cooking: 1.1, writing: 1.1 }, emo: 'focused' },
];

export const traitById = (id: TraitId): TraitDef => TRAITS.find((t) => t.id === id) ?? TRAITS[0]!;

export interface AspirationDef { id: AspirationId; name: string; icon: string; desc: string; goals: { label: string; kind: string; id?: string; n: number }[] }

/** Lebensziele mit drei Meilensteinen (geprüft von gameplay/aspiration) */
export const ASPIRATIONS: AspirationDef[] = [
  { id: 'family', name: 'Großfamilie', icon: '👨‍👩‍👧', desc: 'Eine liebevolle Familie gründen und Kinder großziehen.', goals: [{ label: 'Eine feste Beziehung führen', kind: 'partner', n: 1 }, { label: 'Ein Kind bekommen oder adoptieren', kind: 'children', n: 1 }, { label: 'Drei Kinder großziehen', kind: 'children', n: 3 }] },
  { id: 'career', name: 'Karrierestern', icon: '⭐', desc: 'Im Beruf ganz nach oben kommen.', goals: [{ label: 'Beruf Stufe 2 erreichen', kind: 'careerLevel', n: 2 }, { label: 'Beruf Stufe 4 erreichen', kind: 'careerLevel', n: 4 }, { label: 'Höchste Stufe erreichen', kind: 'careerLevel', n: 5 }] },
  { id: 'wealth', name: 'Wohlstand', icon: '💰', desc: 'Ein dickes Polster an RicoTalern ansparen.', goals: [{ label: '15.000 RicoTaler besitzen', kind: 'money', n: 15000 }, { label: '50.000 RicoTaler besitzen', kind: 'money', n: 50000 }, { label: '150.000 RicoTaler besitzen', kind: 'money', n: 150000 }] },
  { id: 'creative', name: 'Kreativgenie', icon: '🎨', desc: 'Meisterwerke in Kunst, Musik oder Literatur schaffen.', goals: [{ label: 'Eine kreative Fähigkeit auf Stufe 4', kind: 'creativeSkill', n: 4 }, { label: 'Ein Werk verkaufen', kind: 'soldArt', n: 1 }, { label: 'Kreative Fähigkeit auf Stufe 8', kind: 'creativeSkill', n: 8 }] },
  { id: 'romance', name: 'Große Liebe', icon: '💞', desc: 'Die Liebe des Lebens finden und heiraten.', goals: [{ label: 'Ein erstes Date', kind: 'dates', n: 1 }, { label: 'Verlobung', kind: 'engaged', n: 1 }, { label: 'Hochzeit feiern', kind: 'married', n: 1 }] },
  { id: 'knowledge', name: 'Wissensdurst', icon: '🔭', desc: 'So viel lernen wie möglich.', goals: [{ label: 'Drei Fähigkeiten auf Stufe 3', kind: 'skillsAt3', n: 3 }, { label: 'Logik auf Stufe 6', kind: 'skill', id: 'logic', n: 6 }, { label: 'Sechs Fähigkeiten auf Stufe 5', kind: 'skillsAt5', n: 6 }] },
  { id: 'friends', name: 'Beliebt', icon: '🤝', desc: 'Freundschaften in ganz Lindenhafen schließen.', goals: [{ label: 'Drei Freundschaften', kind: 'friends', n: 3 }, { label: 'Zehn Bekannte', kind: 'meet', n: 10 }, { label: 'Acht Freundschaften', kind: 'friends', n: 8 }] },
  { id: 'fitness', name: 'Topform', icon: '💪', desc: 'Körperlich fit werden und bleiben.', goals: [{ label: 'Fitness Stufe 3', kind: 'skill', id: 'fitness', n: 3 }, { label: 'Fitness Stufe 6', kind: 'skill', id: 'fitness', n: 6 }, { label: 'Fitness Stufe 10', kind: 'skill', id: 'fitness', n: 10 }] },
  { id: 'home', name: 'Traumhaus', icon: '🏠', desc: 'Das perfekte Zuhause bauen und einrichten.', goals: [{ label: 'Hauswert 30.000', kind: 'homeValue', n: 30000 }, { label: 'Hauswert 70.000', kind: 'homeValue', n: 70000 }, { label: 'Hauswert 150.000', kind: 'homeValue', n: 150000 }] },
  { id: 'nature', name: 'Naturverbunden', icon: '🌻', desc: 'Garten, Angeln und das Leben draußen genießen.', goals: [{ label: 'Gartenarbeit Stufe 3', kind: 'skill', id: 'gardening', n: 3 }, { label: 'Angeln Stufe 5', kind: 'skill', id: 'fishing', n: 5 }, { label: 'Gartenarbeit Stufe 8', kind: 'skill', id: 'gardening', n: 8 }] },
];

export const SKILLS: Record<SkillId, { name: string; icon: string; unlocks: Record<number, string> }> = {
  cooking: { name: 'Kochen', icon: '🍳', unlocks: { 1: 'Nudeln und Pfannkuchen', 3: 'Linsen-Curry', 5: 'Lasagne, Essen gelingt fast immer', 7: 'Festtagsbraten' } },
  fitness: { name: 'Fitness', icon: '💪', unlocks: { 3: 'Weniger Energieverbrauch', 6: 'Schwimmen ohne Ermüdung', 8: 'Muskulöser Körper' } },
  painting: { name: 'Malerei', icon: '🎨', unlocks: { 2: 'Bilder verkaufen', 5: 'Wertvolle Gemälde', 8: 'Meisterwerke' } },
  music: { name: 'Musik', icon: '🎸', unlocks: { 3: 'Für Trinkgeld spielen', 6: 'Eigene Songs', 9: 'Konzert in der Bar' } },
  charisma: { name: 'Charisma', icon: '😎', unlocks: { 2: 'Überzeugen', 4: 'Motivationsrede', 6: 'Mitreißende Geschichte' } },
  handiness: { name: 'Handwerk', icon: '🔧', unlocks: { 1: 'Reparieren', 4: 'Reparaturen ohne Rückfall', 6: 'Basteln von Deko' } },
  gardening: { name: 'Gartenarbeit', icon: '🌱', unlocks: { 2: 'Kürbisse', 5: 'Doppelte Ernte', 8: 'Prämiertes Gemüse' } },
  writing: { name: 'Schreiben', icon: '✍️', unlocks: { 3: 'Manuskripte verkaufen', 6: 'Bestseller möglich' } },
  programming: { name: 'Programmieren', icon: '💻', unlocks: { 2: 'Freiberufliche Aufträge', 5: 'Eigene App', 8: 'Große Aufträge' } },
  fishing: { name: 'Angeln', icon: '🎣', unlocks: { 3: 'Zander', 6: 'Hafenhecht' } },
  photography: { name: 'Fotografie', icon: '📷', unlocks: { 2: 'Fotos verkaufen', 5: 'Porträts' } },
  logic: { name: 'Logik', icon: '♟️', unlocks: { 3: 'Hausaufgaben-Hilfe', 6: 'Schachmeister' } },
};

/** Benötigte XP für eine Stufe (kumuliert) */
export const SKILL_XP = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
export const skillLevel = (xp: number): number => {
  let l = 0;
  for (let i = 1; i < SKILL_XP.length; i++) if (xp >= SKILL_XP[i]!) l = i;
  return l;
};
