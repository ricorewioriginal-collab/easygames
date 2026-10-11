import { btn, h, select, slider, toast, toggle } from '../dom';
import type { App, RouteParams, ScreenView } from '../../app/app';
import { normalizeServerUrl, type ColorMode, type QualityChoice, type Settings } from '../../app/save';
import { locales } from '../../i18n';
import { header, section } from './common';

const LANG_NAMES: Record<string, string> = { de: 'Deutsch', en: 'English', fr: 'Français', es: 'Español' };

export function create(app: App, params?: RouteParams): ScreenView {
  const store = app.store;
  const set = <K extends keyof Settings>(key: K, value: Settings[K]): void => store.update((d) => void (d.settings[key] = value));
  const s = store.data.settings;

  // Hörprobe (nicht zu oft hintereinander)
  let lastPreview = 0;
  const preview = (): void => {
    const now = Date.now();
    if (now - lastPreview < 250) return;
    lastPreview = now;
    app.audio.sfx('coin');
  };

  const audioSec = section(
    'Lautstärke',
    slider('Gesamt', s.master, 0, 1, 0.05, (v) => { set('master', v); preview(); }),
    slider('Musik', s.music, 0, 1, 0.05, (v) => set('music', v)),
    slider('Effekte', s.sfx, 0, 1, 0.05, (v) => { set('sfx', v); preview(); }),
    toggle('Stumm', s.muted, (v) => set('muted', v)),
    h('div', { class: 'btnrow' }, btn('🔊 Hörprobe', () => app.audio.sfx('coin'), 'ghost')),
  );

  const gfxSec = section(
    'Grafik',
    select<QualityChoice>('Grafikqualität', s.quality, [['auto', 'Automatisch'], ['low', 'Niedrig'], ['medium', 'Mittel'], ['high', 'Hoch']], (v) => set('quality', v)),
    h('p', { class: 'hint' }, 'Bei „Automatisch“ wählt das Spiel passend zu deinem Gerät und senkt die Qualität, wenn es ruckelt.'),
  );

  const a11ySec = section(
    'Barrierefreiheit',
    toggle('Weniger Bewegung', s.reducedMotion, (v) => set('reducedMotion', v), 'Schaltet Animationen in der Oberfläche ab.'),
    toggle('Hoher Kontrast', s.highContrast, (v) => set('highContrast', v)),
    toggle('Große Schrift', s.largeText, (v) => set('largeText', v)),
    toggle('Kamera-Wackeln', s.cameraShake, (v) => set('cameraShake', v), 'Ausschalten, wenn dir Wackeln unangenehm ist.'),
    select<ColorMode>('Farbmodus', s.colorMode, [['standard', 'Standard'], ['protanopia', 'Protanopie (Rot-Schwäche)'], ['deuteranopia', 'Deuteranopie (Grün-Schwäche)'], ['tritanopia', 'Tritanopie (Blau-Schwäche)']], (v) => set('colorMode', v)),
    h('p', { class: 'hint' }, 'Jeder Spieler hat zusätzlich ein eigenes Symbol (▲ ● ■ ◆), damit Farben nie die einzige Unterscheidung sind.'),
  );

  const touchSec = section(
    'Touch-Steuerung',
    select<Settings['touchControls']>('Bildschirm-Steuerung', s.touchControls, [['auto', 'Automatisch'], ['on', 'Immer an'], ['off', 'Aus']], (v) => set('touchControls', v)),
  );

  // Online-Server
  const urlInput = h('input', { class: 'field', type: 'text', value: s.serverUrl, placeholder: 'wss://dein-server.example', 'aria-label': 'Online-Server-Adresse', maxlength: 200 });
  const urlMsg = h('div', { class: 'err', 'aria-live': 'polite' });
  const saveUrl = (): void => {
    const norm = normalizeServerUrl(urlInput.value);
    urlMsg.className = 'err';
    if (norm === null) {
      urlMsg.textContent = 'Ungültige Adresse. Erlaubt sind nur ws:// oder wss:// ohne Benutzername und Passwort.';
      return;
    }
    set('serverUrl', norm);
    urlInput.value = norm;
    urlMsg.className = 'ok';
    urlMsg.textContent = norm ? 'Gespeichert.' : 'Online-Modus ist ausgeschaltet (keine Adresse).';
  };
  const serverSec = section(
    'Online-Server',
    h('div', { class: 'inline' }, urlInput, btn('Speichern', saveUrl, 'good')),
    urlMsg,
    h('p', { class: 'hint' }, 'GitHub Pages kann nur die Webseite ausliefern, aber keinen Spielserver betreiben. Für Online-Partien brauchst du einen eigenen PARTYVERSE-Server (z. B. auf deinem Rechner oder bei einem Hoster). Wie du ihn startest, steht in docs/server.md. Ohne Adresse bleibt der Online-Modus aus; lokale Partien funktionieren immer.'),
  );

  const langs = locales();
  const langSec = section('Sprache', select<string>('Sprache', langs.includes(s.language) ? s.language : 'de', langs.map((c) => [c, LANG_NAMES[c] ?? c] as [string, string]), (v) => set('language', v)));

  // Daten
  const dataMsg = h('div', { class: 'err', 'aria-live': 'polite' });
  const say = (text: string, ok: boolean): void => {
    dataMsg.className = ok ? 'ok' : 'err';
    dataMsg.textContent = text;
  };
  const exportData = (): void => {
    try {
      const blob = new Blob([store.exportJson()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'partyverse-spielstand.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      say('Spielstand exportiert.', true);
    } catch {
      say('Der Export ist fehlgeschlagen.', false);
    }
  };
  const file = h('input', { type: 'file', style: 'display:none', 'aria-label': 'Spielstand-Datei wählen' });
  file.setAttribute('accept', '.json,application/json');
  file.addEventListener('change', () => {
    const f = file.files?.[0];
    file.value = '';
    if (!f) return;
    if (f.size > 1_000_000) return say('Die Datei ist zu groß für einen Spielstand.', false);
    f.text().then(
      (txt) => {
        if (store.importJson(txt)) {
          say('Spielstand importiert.', true);
          toast('Spielstand importiert.', 'good');
          void app.go('options', params);
        } else say('Das ist keine gültige Spielstand-Datei.', false);
      },
      () => say('Die Datei konnte nicht gelesen werden.', false),
    );
  });
  const resetBox = h('div', { class: 'btnrow' });
  const showReset = (): void => {
    resetBox.replaceChildren(
      h('span', { class: 'err' }, 'Wirklich alles löschen? Das kann nicht rückgängig gemacht werden.'),
      btn('Ja, alles zurücksetzen', () => {
        store.reset();
        toast('Alles zurückgesetzt.', 'good');
        void app.go('options', params);
      }, 'hot'),
      btn('Abbrechen', resetIdle, 'ghost'),
    );
  };
  function resetIdle(): void {
    resetBox.replaceChildren(btn('Alles zurücksetzen …', showReset, 'ghost'));
  }
  resetIdle();
  const dataSec = section(
    'Daten',
    h('p', { class: 'hint' }, 'Alles liegt nur in deinem Browser (keine Konten, keine Cloud). Mit einer Sicherung kannst du deinen Spielstand auf ein anderes Gerät mitnehmen.'),
    h('div', { class: 'btnrow' }, btn('⬇ Spielstand exportieren', exportData, 'ghost'), btn('⬆ Spielstand importieren', () => file.click(), 'ghost'), file),
    dataMsg,
    resetBox,
  );

  const el = h('div', { class: 'screen sc' }, h('div', { class: 'panel' }, header(app, params, 'Optionen'), audioSec, gfxSec, a11ySec, touchSec, serverSec, langSec, dataSec));
  return { el };
}
