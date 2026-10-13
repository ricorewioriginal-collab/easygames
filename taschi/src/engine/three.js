// Three.js r128 is loaded as a classic script from ../bunte-insel/vendor
// (the same local copy the rest of easygames uses).
export const THREE = globalThis.THREE;
if (!THREE) throw new Error('Three.js konnte nicht geladen werden.');
