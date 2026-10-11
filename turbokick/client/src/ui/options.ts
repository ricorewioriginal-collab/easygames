import type { App, RouteParams, ScreenView } from '../app/app';
import type { ColorMode, QualityChoice } from '../app/save';
import { t } from '../i18n';
import { btn, h, select, slider, toast, toggle } from './dom';

/** Optionen: Ton, Grafik, Kamera, Barrierefreiheit, Verbindungshilfe, Daten */
export function create(app: App, params?: RouteParams): ScreenView {
  const s = app.store;
  const d = s.data.settings;
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]): void =>
    s.update((x) => {
      x.settings[k] = v;
    });
  const file = h('input', { type: 'file', style: 'display:none' });
  (file as HTMLInputElement).accept = 'application/json,.json';
  file.addEventListener('change', () => {
    const f = (file as HTMLInputElement).files?.[0];
    if (!f) return;
    void f.text().then((txt) => {
      const ok = s.importJson(txt);
      toast(ok ? t('opt.imported') : t('opt.importFailed'), ok ? 'good' : 'error');
    });
  });
  const confirmReset = h('div');
  const el = h(
    'div',
    { class: 'screen' },
    h(
      'div',
      { class: 'panel' },
      h(
        'div',
        { class: 'head' },
        h('h2', null, t('menu.options')),
        btn('← ' + t('back'), () => void app.go(params?.back ?? 'menu'), 'ghost back'),
      ),
      h('h3', null, t('opt.sound')),
      slider(t('opt.master'), d.master, 0, 1, 0.05, (v) => set('master', v)),
      slider(t('opt.music'), d.music, 0, 1, 0.05, (v) => set('music', v)),
      slider(t('opt.sfx'), d.sfx, 0, 1, 0.05, (v) => set('sfx', v)),
      toggle(t('opt.mute'), d.muted, (v) => set('muted', v)),
      btn(t('opt.test'), () => app.audio.sfx('goal'), 'ghost'),
      h('h3', null, t('opt.graphics')),
      select<QualityChoice>(
        t('opt.quality'),
        d.quality,
        [
          ['auto', t('opt.auto')],
          ['low', t('opt.low')],
          ['medium', t('opt.medium')],
          ['high', t('opt.high')],
        ],
        (v) => set('quality', v),
      ),
      h('h3', null, t('opt.camera')),
      slider(
        t('opt.fov'),
        d.fov,
        70,
        120,
        1,
        (v) => set('fov', v),
        (v) => `${Math.round(v)}°`,
      ),
      slider(
        t('opt.camDist'),
        d.camDistance,
        0.7,
        1.4,
        0.05,
        (v) => set('camDistance', v),
        (v) => `${Math.round(v * 100)} %`,
      ),
      toggle(t('opt.ballCam'), d.ballCam, (v) => set('ballCam', v), t('opt.ballCamHint')),
      toggle(t('opt.shake'), d.cameraShake, (v) => set('cameraShake', v)),
      h('h3', null, t('opt.access')),
      toggle(t('opt.calm'), d.reducedMotion, (v) => set('reducedMotion', v)),
      toggle(t('opt.contrast'), d.highContrast, (v) => set('highContrast', v)),
      toggle(t('opt.bigText'), d.largeText, (v) => set('largeText', v)),
      select<ColorMode>(
        t('opt.colors'),
        d.colorMode,
        [
          ['standard', t('opt.cm.standard')],
          ['protanopia', t('opt.cm.protanopia')],
          ['deuteranopia', t('opt.cm.deuteranopia')],
          ['tritanopia', t('opt.cm.tritanopia')],
        ],
        (v) => set('colorMode', v),
      ),
      toggle(t('opt.touchAssist'), d.touchAssist, (v) => set('touchAssist', v), t('opt.touchAssistHint')),
      select<'auto' | 'on' | 'off'>(
        t('opt.touch'),
        d.touchControls,
        [
          ['auto', t('opt.auto')],
          ['on', t('opt.on')],
          ['off', t('opt.off')],
        ],
        (v) => set('touchControls', v),
      ),
      h('h3', null, t('opt.online')),
      toggle(t('p2p.stun'), d.useStun, (v) => set('useStun', v), t('p2p.stunHint')),
      h('h3', null, t('opt.data')),
      h(
        'div',
        { class: 'chips' },
        btn(
          t('opt.export'),
          () => {
            const url = URL.createObjectURL(new Blob([s.exportJson()], { type: 'application/json' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'turbokick-spielstand.json';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
          },
          'ghost',
        ),
        btn(t('opt.import'), () => (file as HTMLInputElement).click(), 'ghost'),
        btn(
          t('opt.reset'),
          () => {
            confirmReset.textContent = '';
            confirmReset.append(
              h('p', { class: 'err' }, t('opt.resetAsk')),
              btn(
                t('opt.resetYes'),
                () => {
                  s.reset();
                  void app.go('options', params);
                },
                'fire',
              ),
            );
          },
          'ghost',
        ),
      ),
      confirmReset,
      file,
    ),
  );
  return { el };
}
