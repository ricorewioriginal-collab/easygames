/* Gemeinsame Bausteine für Build (vite.config.mjs) und Prüfung (check-bundle.mjs) – ohne Abhängigkeiten.
   Die Reihenfolge der Spieldateien steht EINMAL in bunte-insel/index.html (window.BI_FILES). */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const GAME = join(ROOT, 'bunte-insel');
export const INDEX = join(GAME, 'index.html');
export const OUT = join(GAME, 'js', 'bunte-insel.min.js');

/** Liste der Spieldateien (ohne ?v=…) aus index.html */
export function biFiles(html = readFileSync(INDEX, 'utf8')) {
  const m = html.match(/window\.BI_FILES=\[([^\]]*)\]/);
  if (!m) throw new Error('window.BI_FILES nicht in bunte-insel/index.html gefunden');
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1].split('?')[0]);
}

/** Alle Quellen hintereinander (jede Datei ist ein eigenes klassisches Skript mit 'use strict' oben) */
export function concatSources(files = biFiles()) {
  return files.map(f => '/* ' + f + ' */\n' + readFileSync(join(GAME, f), 'utf8').replace(/^﻿/, '')).join('\n;\n');
}

export const hashOf = s => createHash('sha256').update(s).digest('hex');
export const HEADER = h => '/*! Bunte Insel – gebündelt mit Vite aus bunte-insel/js (nicht von Hand ändern: cd bunte-insel-src && npm run build) sha256:' + h + ' */\n';
export const BUNDLE_RE = /bunte-insel\.min\.js\?v='\+V\+'/;
export const VERSION_RE = /,V='([^']*)'/;
