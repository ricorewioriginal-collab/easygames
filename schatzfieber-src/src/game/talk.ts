/** Gespräche (Geschenke, Wünsche, Verabredungen, Romanze oder Freundschaft), Szenen mit Kamera und Überblendung, Enden */
import * as THREE from 'three';
import type { App } from '../app';
import type { NpcActor } from '../world/world';
import type { NpcDef } from '../core/types';
import { npc, NPCS } from '../core/npcs';
import { item, ITEMS } from '../core/data';
import { poi } from '../world/island';
import * as S from '../core/state';
import type { Choice } from '../ui/ui';
import { esc } from '../ui/ui';

const fill = (app: App, t: string) => t.replace(/\{name\}/g, app.save.player.name);
const hearts = (lvl: number) => '♥'.repeat(lvl) + '♡'.repeat(5 - lvl);

function greeting(app: App, n: NpcDef, first: boolean): string {
  const r = app.save.rel[n.id];
  if (first) return `${n.greet[0]} Ich bin ${n.name}, ${n.job}.`;
  if (r.lvl >= 4 && S.romantic(app.save, n)) return n.greet[2];
  if (r.lvl >= 1) return n.greet[1];
  return n.greet[0];
}

const GIFT_TEXT: Record<S.GiftReaction, string[]> = {
  love: ['Oh! Das liebe ich! Woher wusstest du das? 😍', 'Wow… genau das habe ich mir gewünscht!', 'Du kennst mich echt gut. Danke!'],
  like: ['Wie lieb von dir, danke!', 'Oh, schön! Das kann ich gut gebrauchen.', 'Danke, das freut mich.'],
  neutral: ['Danke… nett von dir.', 'Oh. Danke.', 'Hm, interessant. Danke!'],
  dislike: ['Ähm… das ist nicht so meins. Aber danke.', 'Oh. Na ja. Gut gemeint.', 'Hm… das behalte ich lieber nicht.'],
  already: ['Du hast mir heute schon etwas geschenkt. 😊 Morgen wieder?', 'Heute nicht mehr – aber danke!'],
};
const pickOne = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Geschenk auswählen (Fenster) */
function chooseGift(app: App): Promise<string | null> {
  const inv = Object.entries(app.save.inv).filter(([id, n]) => n > 0 && ['gift', 'find', 'artifact'].includes(item(id).kind));
  return new Promise((res) => {
    if (!inv.length) {
      app.ui.toast('🎁 Du hast nichts zum Verschenken. Geschenke gibt’s im Kramladen, Fundstücke beim Graben und Tauchen.');
      return res(null);
    }
    app.ui.open(
      `<h2>🎁 Was möchtest du schenken?</h2><div class="grid">${inv.map(([id, n]) => `<button class="card" data-a="g" data-id="${id}"><span class="ic">${item(id).icon}</span> ${esc(item(id).name)} <small>×${n}</small></button>`).join('')}</div><p class="row"><button class="btn" data-a="x" data-back>Abbrechen</button></p>`,
      () => {
        app.ui.close();
        res(null);
      },
    );
    app.ui.bind({
      g: (el) => {
        app.ui.close();
        res(el.dataset.id!);
      },
      x: () => {
        app.ui.close();
        res(null);
      },
    });
  });
}

function needLabel(app: App, n: NpcDef): string {
  const st = S.nextStep(app.save, n)!;
  const need = st.need;
  if (need.t === 'item') return `${item(need.id).icon} ${item(need.id).name}${need.n && need.n > 1 ? ` ×${need.n}` : ''} (du hast ${app.save.inv[need.id] || 0})`;
  if (need.t === 'flag') return need.label;
  if (need.t === 'museum') return `Museum: ${app.save.museum.length}/${need.n} Fundstücke`;
  if (need.t === 'date') return `${poi(need.poi).name}, ${need.from}–${need.to} Uhr`;
  return '';
}

export async function talk(app: App, a: NpcActor) {
  const s = app.save,
    n = a.def,
    r = s.rel[n.id],
    col = n.color,
    pic = app.portraits[n.id];
  const first = !r.met;
  app.beginTalk(a);
  const gained = S.talkDaily(s, n);
  if (gained && !first) app.ui.toast(`<span class="hearts">♥</span> ${n.name} freut sich, dich zu sehen`);
  let text = fill(app, greeting(app, n, first));
  let talkIdx = Math.floor(Math.random() * n.talk.length);
  for (;;) {
    const st = S.nextStep(s, n);
    const unlocked = S.stepUnlocked(s, n);
    const opts: { c: Choice; run: () => Promise<string | null | 'end'> }[] = [];
    if (st && unlocked) {
      if (st.need.t === 'date') {
        if (S.dateNow(s, n)) opts.push({ c: { label: S.romantic(s, n) ? '🌙 Unser Date beginnen' : '🌙 Unseren Abend beginnen', cls: 'love' }, run: () => doStep(app, a) });
        else if (r.dateDay >= s.day) opts.push({ c: { label: '📅 Wann treffen wir uns?' }, run: async () => `${r.dateDay === s.day ? 'Heute' : 'Morgen'} zwischen ${st.need.t === 'date' ? st.need.from : 0} und ${st.need.t === 'date' ? st.need.to : 0} Uhr – ${poi(st.need.t === 'date' ? st.need.poi : 'plaza').name}. Ich freu mich!` });
        else
          opts.push({
            c: { label: `📅 ${st.goal}`, cls: 'love' },
            run: async () => {
              const d = S.arrangeDate(s, n)!;
              app.saveGame();
              return fill(app, st.ask) + ` (${d.day === s.day ? 'Heute' : 'Morgen'}, ${d.from}–${d.to} Uhr, ${poi(d.poi).name})`;
            },
          });
      } else if (S.needMet(s, st.need)) opts.push({ c: { label: `✨ ${st.goal}`, cls: 'love' }, run: () => doStep(app, a) });
      else opts.push({ c: { label: '❓ Was wünschst du dir?' }, run: async () => fill(app, st.ask) + `\n➜ ${needLabel(app, n)}` });
    } else if (st) opts.push({ c: { label: '❓ Was wünschst du dir?' }, run: async () => `Lass uns erst ein bisschen mehr Zeit miteinander verbringen. (Zuneigung ${r.pts}/${S.THRESH[r.lvl]} – reden und Geschenke helfen)` });
    opts.push({ c: { label: '💬 Plaudern' }, run: async () => fill(app, n.talk[talkIdx++ % n.talk.length]) });
    opts.push({
      c: { label: '🎁 Geschenk geben' },
      run: async () => {
        const id = await chooseGift(app);
        if (!id) return 'Hm? Hast du etwas für mich?';
        const re = S.giveGift(s, n, id);
        if (re === 'love' || re === 'like') app.sound.play('heart');
        if (re !== 'already') app.ui.toast(`${item(id).icon} ${re === 'love' ? '♥♥♥' : re === 'like' ? '♥♥' : re === 'neutral' ? '♥' : '💔'} ${n.name}`);
        return pickOne(GIFT_TEXT[re]);
      },
    });
    if (S.compatible(n, s.player) && r.lvl >= 2 && r.romance === false)
      opts.push({
        c: { label: '💕 Mehr als Freundschaft?', cls: 'love' },
        run: async () => {
          S.setRomance(s, n, true);
          app.sound.play('heart');
          return `Oh… ehrlich gesagt habe ich auch schon daran gedacht. Ja. Sehr gern, ${s.player.name}.`;
        },
      });
    if (S.romantic(s, n))
      opts.push({
        c: { label: '🤝 Lieber Freunde bleiben' },
        run: async () => {
          const i = await app.ui.say(s.player.name, '#ffc85a', app.portraits.player, 'Ich glaube, ich möchte lieber, dass wir Freunde sind.', [{ label: 'Ja, so meine ich das' }, { label: 'Nein, vergiss es' }]);
          if (i === 1) return 'Alles gut. 😊';
          S.setRomance(s, n, false);
          return 'Danke, dass du ehrlich bist. Das ist okay – Freundschaft ist auch ein Schatz.';
        },
      });
    opts.push({ c: { label: '👋 Tschüss' }, run: async () => 'end' });
    const header = `${n.name} <span class="hearts">${hearts(r.lvl)}</span>`;
    void header;
    const i = await app.ui.say(`${n.name}  ${hearts(r.lvl)}`, col, pic, text, opts.map((o) => o.c));
    const res = await opts[i].run();
    if (res === 'end' || res === null) break;
    text = res;
  }
  app.endTalk(a);
}

/** Schritt abschließen inkl. Entscheidungen (Flirt/Freundschaft, Exklusivität) und Szene */
async function doStep(app: App, a: NpcActor): Promise<string | 'end'> {
  const s = app.save,
    n = a.def,
    r = s.rel[n.id],
    pic = app.portraits[n.id];
  const compat = S.compatible(n, s.player);
  if (r.lvl === 1 && r.romance === null) {
    if (compat) {
      const i = await app.ui.say(s.player.name, '#ffc85a', app.portraits.player, `Wie möchtest du mit ${n.name} umgehen?`, [{ label: '😘 Flirten', sub: 'Romanze beginnen', cls: 'love' }, { label: '🙂 Freundschaftlich', sub: 'Gute Freunde werden' }]);
      S.setRomance(s, n, i === 0);
    } else S.setRomance(s, n, false);
  }
  if (r.lvl === 4 && S.romantic(s, n)) {
    const i = await app.ui.say(n.name, n.color, pic, 'Bevor wir… Wie stellst du dir das mit uns vor?', [{ label: '💍 Nur wir zwei' }, { label: '🌈 Offen – wir lassen uns Freiheit', sub: 'Offene Beziehung' }]);
    r.open = i === 1;
    await app.ui.say(n.name, n.color, pic, r.open ? 'Ehrlich und frei. Das mag ich. Abgemacht.' : 'Nur wir zwei. Das klingt wunderschön.');
  }
  const res = S.completeStep(s, n);
  if (!res) return 'Hm, irgendetwas fehlt noch.';
  app.sound.play('heart');
  if (res.reward?.item) app.ui.toast(`🎁 Erhalten: ${item(res.reward.item).icon} ${item(res.reward.item).name}`);
  if (res.reward?.money) app.ui.toast(`💰 +${res.reward.money} €`);
  await app.ui.say(`${n.name}  ${hearts(r.lvl)}`, n.color, pic, fill(app, res.text));
  if (res.scene) {
    await playScene(app, res.scene, false);
    return 'end';
  }
  app.saveGame();
  return `${hearts(r.lvl)} – ${n.name} mag dich jetzt noch mehr.`;
}

/** Szene spielen: id = <npc>_<date|hang|kiss|hug|night|best> */
export async function playScene(app: App, id: string, replay: boolean) {
  const [nid, kind] = id.split('_');
  const n = npc(nid),
    a = app.actor(nid),
    s = app.save;
  const love = ['date', 'kiss', 'night'].includes(kind);
  const prev = { mode: app.mode, talking: app.talking, pos: app.player.pos.clone(), yaw: app.player.yaw, npcPos: a.body.root.position.clone(), npcRot: a.body.root.rotation.y, time: s.time };
  app.mode = 'scene';
  app.talking = nid;
  app.ui.endDialog();
  app.ui.close();
  app.ui.cinema(true);
  app.sound.setTheme(love ? 'love' : 'island');
  const pname = s.player.name;
  const lines = (love ? (kind === 'date' ? n.date : kind === 'kiss' ? n.kiss : n.night) : kind === 'hang' ? [`Ihr verbringt den Abend zusammen, lacht viel und erzählt euch Geschichten von früher.`, `„Schön, dass du auf die Insel gekommen bist, {name}.“`, `Die Zeit vergeht wie im Flug.`] : kind === 'hug' ? [`${n.name} umarmt dich herzlich.`, `„Danke. Wirklich – du bist ein Schatz.“`] : [`Von heute an seid ihr beste Freunde.`, `${n.name} grinst: „Auf uns – und auf alles, was die Insel noch bereithält!“`]).map((l) => l.replace(/\{name\}/g, pname));
  // Aufstellung: beide einander zugewandt
  const P = app.player.pos.clone();
  const dist = kind === 'kiss' || kind === 'hug' ? 0.62 : 1.0;
  const yaw = app.player.yaw;
  const np = P.clone().add(new THREE.Vector3(Math.sin(yaw) * dist, 0, Math.cos(yaw) * dist));
  np.y = Math.max(app.world.height(np.x, np.z), app.world.floor(np.x, np.z, P.y + 0.5), P.y - 0.3);
  a.body.root.position.copy(np);
  a.body.root.rotation.y = yaw + Math.PI;
  a.body.root.visible = true;
  const center = P.clone().lerp(np, 0.5);
  let ang = yaw + Math.PI / 2;
  const h = Math.min(app.playerBody.height, n.look.height) * 0.9;
  const tick = setInterval(() => {
    ang += 0.004;
    app.orbit(center, kind === 'kiss' ? 1.5 : 2.8, h, ang);
  }, 16);
  app.orbit(center, kind === 'kiss' ? 1.5 : 2.8, h, ang);
  if (kind === 'night') {
    await app.ui.fade(true, lines[0]);
    for (const l of lines.slice(1)) {
      await new Promise((r) => setTimeout(r, 2600));
      await app.ui.fade(true, l);
    }
    await new Promise((r) => setTimeout(r, 2800));
  } else {
    app.playerBody.mode = 'idle';
    a.body.mode = 'talk';
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i],
        speech = l.startsWith('„');
      if (i === lines.length - 1 && (kind === 'kiss' || kind === 'hug')) {
        // Annäherung
        a.body.mode = kind;
        app.playerBody.mode = kind;
        const close = P.clone().add(new THREE.Vector3(Math.sin(yaw) * (kind === 'kiss' ? 0.36 : 0.42), 0, Math.cos(yaw) * (kind === 'kiss' ? 0.36 : 0.42)));
        a.body.root.position.set(close.x, np.y, close.z);
        a.body.lookPitch = 0;
        app.playerBody.lookPitch = 0;
      }
      if (i === lines.length - 1 && kind === 'date' && love) {
        a.body.mode = 'hug';
        app.playerBody.mode = 'hug';
        a.body.root.position.lerp(P, 0.35);
      }
      await app.ui.say(speech ? n.name : '', n.color, speech ? app.portraits[nid] : null, l);
    }
    app.ui.endDialog();
    if (kind === 'kiss') {
      await new Promise((r) => setTimeout(r, 1800));
      await app.ui.fade(true);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  clearInterval(tick);
  app.playerBody.mode = 'idle';
  a.body.mode = 'idle';
  a.body.lookPitch = 0;
  if (!replay && kind === 'night') {
    // gemeinsame Nacht: nächster Morgen am Strandhaus
    S.sleep(s, 8 * 60);
    app.world.newDay(s);
    const H = poi('house');
    app.player.place(H.x + 1, H.z + 2, app.world, 0);
    a.present = false;
    app.ui.toast(`☀️ Ein neuer Morgen. ${n.name} hat dir einen Zettel hinterlassen: „Bis später ♥“`);
  } else if (replay) {
    app.player.pos.copy(prev.pos);
    app.player.yaw = prev.yaw;
    app.player.sync();
    a.body.root.position.copy(prev.npcPos);
    a.body.root.rotation.y = prev.npcRot;
    s.time = prev.time;
  } else if (kind === 'date' || kind === 'hang') s.time = Math.min(S.DAY_END - 60, s.time + 90);
  app.cam.shot = null;
  app.cam.snap(app.player.pos);
  app.ui.cinema(false);
  if (kind === 'night' || kind === 'kiss') await app.ui.fade(false);
  app.talking = null;
  app.mode = replay ? prev.mode : 'play';
  if (replay && prev.mode !== 'play') app.mode = prev.mode;
  if (!replay) app.saveGame();
}

/** Abspann: Schatz und Liebe */
export async function runEnding(app: App) {
  const s = app.save;
  app.mode = 'scene';
  app.ui.cinema(true);
  app.sound.setTheme('love');
  const narr = (t: string, ch: Choice[] = []) => app.ui.say('', '', null, t, ch);
  await narr('Die Nachricht verbreitet sich wie ein Lauffeuer: Das Herz der Insel ist gefunden! Am Abend versammelt sich die ganze Insel am Hafen.');
  const t = await narr('Was geschieht mit Ysoldes Schatz?', [{ label: '🏛️ Ans Inselmuseum geben', sub: 'Lea und Elias jubeln, die Insel bekommt eine Zukunft' }, { label: '💰 Behalten', sub: 'Ein Vermögen für dich' }]);
  if (t === 0) {
    s.money += 2500;
    s.flags.treasureMuseum = 1;
    s.rel.lea.pts += 20;
    s.rel.elias.pts += 20;
    await narr('Das Museum wird zur Attraktion der ganzen Karibik. Als Dank bekommst du einen Finderlohn von 2.500 € – und deinen Namen auf einer goldenen Tafel.');
  } else {
    s.money += 6000;
    await narr('Du verkaufst einen Teil des Goldes an einen Sammler auf dem Festland – 6.000 €. Das Herz-Amulett aber behältst du. Manche Dinge verkauft man nicht.');
  }
  const o = S.endingOptions(s);
  const ch: Choice[] = o.couples.map((id) => ({ label: `💞 Mit ${npc(id).name}`, cls: 'love' }));
  if (o.open) ch.push({ label: '🌈 Offene Liebe', sub: o.couples.map((id) => npc(id).name).join(', '), cls: 'love' });
  ch.push({ label: '🧭 Frei und allein', sub: 'Das nächste Abenteuer wartet' });
  const who = await narr(o.couples.length ? 'Die Sonne versinkt im Meer. Mit wem möchtest du diesen Moment teilen?' : 'Die Sonne versinkt im Meer. Wem gehört dein Herz?', ch);
  let ending = 'single';
  let text = `Du sitzt am Steg, die Füße im warmen Wasser. Die Insel hat dir ein Zuhause geschenkt, Freund:innen fürs Leben – und die Gewissheit, dass das nächste Abenteuer schon wartet. Vielleicht hinter dem Horizont. Vielleicht direkt hier.`;
  if (who < o.couples.length) {
    const n = npc(o.couples[who]);
    ending = 'couple:' + n.id;
    text = `${n.name} nimmt deine Hand. „Weißt du, was der wahre Schatz dieser Insel ist?“ – „Sag jetzt nicht ‚die Freundschaft‘.“ – „Nein. Du.“ Ihr küsst euch, während über dem Vulkan die ersten Sterne aufgehen. Ein Jahr später steht auf dem Strandhaus ein neues Schild: zwei Namen, ein Herz.`;
  } else if (o.open && who === o.couples.length) {
    ending = 'open';
    text = `${o.couples.map((id) => npc(id).name).join(' und ')} warten am Lagerfeuer auf dich – lachend, ehrlich, frei. Eure Liebe folgt keinen Regeln außer einer: Jede:r sagt, was er oder sie fühlt. Auf Isla Corazón ist Platz für viele Herzen.`;
  }
  s.ending = ending;
  if (!s.gallery.includes('ending_' + ending.split(':')[0])) s.gallery.push('ending_' + ending.split(':')[0]);
  await app.ui.fade(true, text);
  await new Promise((r) => setTimeout(r, 6500));
  const st = s.stats;
  await app.ui.fade(true, `ENDE – ${s.player.name}, Legende von Isla Corazón\n\nTage: ${s.day} · Ausgegraben: ${st.dug} · Getaucht: ${st.dived} · Museum: ${s.museum.length}/12 · Szenen: ${s.gallery.length}`);
  await new Promise((r) => setTimeout(r, 5000));
  await app.ui.fade(false);
  app.ui.cinema(false);
  app.mode = 'play';
  app.saveGame();
  app.ui.toast('🏝️ Du kannst weiterspielen: Romanzen, Museum und Strandhaus warten.', 5000);
}

/** Galerie-Einträge */
export function galleryEntries(app: App) {
  const out: { id: string; label: string; npc?: string; unlocked: boolean }[] = [];
  const names: Record<string, string> = { date: 'Date', hang: 'Gemeinsamer Abend', kiss: 'Erster Kuss', hug: 'Umarmung', night: 'Gemeinsame Nacht', best: 'Beste Freunde' };
  for (const n of NPCS)
    for (const k of ['date', 'kiss', 'night', 'hang', 'hug', 'best']) {
      const id = n.id + '_' + k;
      if (['date', 'kiss', 'night'].includes(k) && !S.compatible(n, app.save?.player || { gender: 'd', pref: 'all', name: '', look: n.look })) continue;
      out.push({ id, label: `${n.name}: ${names[k]}`, npc: n.id, unlocked: !!app.save?.gallery.includes(id) });
    }
  return out;
}
export const ITEM_COUNT = ITEMS.length;
