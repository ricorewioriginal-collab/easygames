import type { MiniGameViewFactory } from './viewTypes';
import { createView as v0 } from './views/blitzfunke';
import { createView as v1 } from './views/wolkenhuepfer';
import { createView as v2 } from './views/kristallsammler';
import { createView as v3 } from './views/echomuster';
import { createView as v4 } from './views/takttreffer';
import { createView as v5 } from './views/ausweichorbit';
import { createView as v6 } from './views/balancierbrett';
import { createView as v7 } from './views/zielschuss';
import { createView as v8 } from './views/hindernisdash';
import { createView as v9 } from './views/stapelturm';
import { createView as v10 } from './views/farbwechsel';
import { createView as v11 } from './views/muenzregen';
import { createView as v12 } from './views/seilsprung';
import { createView as v13 } from './views/faltlabyrinth';
import { createView as v14 } from './views/schleuderflug';
import { createView as v15 } from './views/eisrutsche';
import { createView as v16 } from './views/pendelpunkt';
import { createView as v17 } from './views/tippkraft';
import { createView as v18 } from './views/raketenflug';
import { createView as v19 } from './views/gravifaenger';
import { createView as v20 } from './views/spuernase';
import { createView as v21 } from './views/bruecke';

const VIEWS: Record<string, MiniGameViewFactory> = {
  'blitzfunke': v0,
  'wolkenhuepfer': v1,
  'kristallsammler': v2,
  'echomuster': v3,
  'takttreffer': v4,
  'ausweichorbit': v5,
  'balancierbrett': v6,
  'zielschuss': v7,
  'hindernisdash': v8,
  'stapelturm': v9,
  'farbwechsel': v10,
  'muenzregen': v11,
  'seilsprung': v12,
  'faltlabyrinth': v13,
  'schleuderflug': v14,
  'eisrutsche': v15,
  'pendelpunkt': v16,
  'tippkraft': v17,
  'raketenflug': v18,
  'gravifaenger': v19,
  'spuernase': v20,
  'bruecke': v21,
};
export function getViewFactory(id: string): MiniGameViewFactory {
  const f = VIEWS[id];
  if (!f) throw new Error('Keine Ansicht für Minispiel ' + id);
  return f;
}
