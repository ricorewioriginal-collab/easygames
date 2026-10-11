import { Engine } from '../render/engine';
import { QUALITY_PRESETS } from '../render/quality';
import { MiniStage } from '../minigames/stage';
import { MiniInput } from '../input/controls';
import { getMiniGame, MINIGAME_IDS } from '@shared/minigames/registry';

/** Minispiel-Labor: ?lab=<id>[&bot=0.8][&touch=1][&seed=5] – zum Entwickeln und für automatische Bildschirmfotos. */
export function startLab(id: string, params: URLSearchParams): void {
  const host = document.getElementById('app') as HTMLElement;
  host.innerHTML = '';
  host.className = 'lab';
  const engine = new Engine(host, QUALITY_PRESETS.medium);
  const game = getMiniGame(id);
  const seed = Number(params.get('seed') ?? 5);
  const botParam = params.get('bot');
  const hud = document.createElement('div');
  hud.className = 'lab-hud';
  host.appendChild(hud);
  const input = botParam === null ? new MiniInput(host, game, params.get('touch') === '1') : null;
  const stage = new MiniStage(game, seed, { playerIndex: 0, players: 4 }, { quality: engine.quality, sfx: () => undefined, input, botSkill: Number(botParam ?? 0.8), botSeed: seed });
  engine.setScreen(stage);
  engine.start();
  const lab: any = (window as any).__lab = { game, stage, state: stage.state, done: false, score: 0, errors: [] as string[] };
  window.addEventListener('error', (e) => lab.errors.push(String(e.message)));
  stage.onFinish = (r) => {
    lab.done = true;
    lab.score = r.score;
    hud.innerHTML = `<b>${game.name}</b><br>Ergebnis: ${Math.round(r.score)}`;
  };
  let count = 3;
  hud.textContent = `${game.name} – ${count}`;
  const iv = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(iv);
      stage.start();
      const tickHud = () => {
        if (!lab.done) {
          const h = game.hud(stage.state);
          hud.innerHTML = `<b>${game.name}</b> · ${h.left} · ${h.right}${h.hint ? ' · ' + h.hint : ''}`;
          requestAnimationFrame(tickHud);
        }
      };
      tickHud();
    } else hud.textContent = `${game.name} – ${count}`;
  }, 500);
  void MINIGAME_IDS;
}
