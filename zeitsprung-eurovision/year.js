// Vier eindeutige Jahreszahlen rund um das gesuchte Jahr. Je älter das Ereignis,
// desto größer der Abstand, damit antike Jahre nicht nur um ein Jahr auseinanderliegen.
export function yearStep(year) {
  return year < 0 ? 25 : year < 1500 ? 10 : year < 1800 ? 5 : 1;
}
export function yearChoices(year, random = Math.random) {
  const answer = Number(year), step = yearStep(answer);
  const offsets = [-6, -4, -3, -2, -1, 1, 2, 3, 4, 6];
  for (let i = offsets.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
  }
  // Ein Jahr 0 gibt es nicht; solche Kandidaten werden übersprungen.
  // Keine Jahre aus der Zukunft: ESC-Ausgaben reichen bis heute.
  const latest = Math.max(answer, new Date().getFullYear());
  const wrong = offsets.map(offset => answer + offset * step).filter(value => value !== 0 && value <= latest).slice(0, 3);
  const choices = [answer, ...wrong];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

