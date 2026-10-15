// Vier eindeutige Jahreszahlen aus der Nähe des gesuchten Veröffentlichungsjahrs.
export function yearChoices(year, random = Math.random) {
  const answer = Number(year);
  const offsets = [-6, -4, -3, -2, -1, 1, 2, 3, 4, 6];
  for (let i = offsets.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
  }
  const choices = [answer, ...offsets.slice(0, 3).map(offset => answer + offset)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}
