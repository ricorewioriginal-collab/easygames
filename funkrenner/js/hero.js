/* Funkrenner – echte KayKit-Figuren (Adventurers, CC0 von Kay Lousberg): laden, Zubehör wählen, Animationen abspielen. */
(function (root) {
  'use strict';
  const HEROES = [
    { id: 'knight', file: 'Knight', name: 'Ritter', icon: '🛡️', perk: 'Startet mit Schild', short: 'Schild', keep: ['1H_Sword', 'Badge_Shield'], stats: { shield: 1 } },
    { id: 'barbarian', file: 'Barbarian', name: 'Barbar', icon: '🪓', perk: 'Magnet zieht Münzen aus weiterer Entfernung', short: 'Magnet+', keep: ['1H_Axe', 'Barbarian_Round_Shield'], stats: { magnet: 1.5 } },
    { id: 'mage', file: 'Mage', name: 'Magier', icon: '🔮', perk: 'Power-ups halten 40 % länger', short: 'Power+', keep: ['1H_Wand', 'Spellbook'], stats: { power: 1.4 } },
    { id: 'rogue', file: 'Rogue', name: 'Schurkin', icon: '🗡️', perk: 'Springt höher, rutscht länger', short: 'Flink', keep: ['Knife', 'Knife_Offhand'], stats: { jump: 1.1, slide: 1.25 } },
    { id: 'rogue_hooded', file: 'Rogue_Hooded', name: 'Schatten', icon: '🥷', perk: '+10 % Münzwert und ein Herz mehr', short: 'Herz+', keep: ['Knife', 'Knife_Offhand'], stats: { coin: 1.1, life: 1 } }
  ];
  const ALWAYS = /(Body|Head|Arm|Leg|Cape|Hat|Helmet)/;
  const CLIPS = { idle: 'Idle', run: 'Running_A', jump: 'Jump_Full_Short', jumpUp: 'Jump_Start', air: 'Jump_Idle', land: 'Jump_Land', hit: 'Hit_A', hit2: 'Hit_B', die: 'Death_A', cheer: 'Cheer', cast: 'Spellcast_Shoot', throw: 'Throw', left: 'Dodge_Left', right: 'Dodge_Right', roll: 'Dodge_Forward', walk: 'Walking_A', lie: 'Lie_Idle' };

  function load(THREE, base, id) {
    const def = HEROES.find(h => h.id === id) || HEROES[0];
    return new Promise((ok, fail) => {
      new THREE.GLTFLoader().load(base + 'models/heroes/' + def.file + '.glb', g => {
        const model = g.scene, root = new THREE.Group();
        model.traverse(o => {
          if (o.isMesh || o.isSkinnedMesh) {
            const keep = ALWAYS.test(o.name) || def.keep.includes(o.name);
            o.visible = keep; o.frustumCulled = false; o.castShadow = false;
            if (o.material) { o.material.roughness = Math.max(.55, o.material.roughness || 1); o.material.metalness = 0; }
          }
        });
        root.add(model);
        const box = new THREE.Box3().setFromObject(model), h = (box.max.y - box.min.y) || 2, k = 2.15 / h;
        model.scale.setScalar(k); model.position.y -= box.min.y * k;
        const mixer = new THREE.AnimationMixer(model), acts = {};
        g.animations.forEach(a => { acts[a.name] = mixer.clipAction(a); });
        const H = { def, root, model, mixer, acts, cur: null, once: null, scale: k };
        H.play = (key, o) => {
          o = o || {}; const nm = CLIPS[key] || key, a = acts[nm]; if (!a) return null;
          if (H.cur === a && !o.restart) return a;
          a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.setEffectiveTimeScale(o.speed || 1);
          if (o.once) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = !!o.hold; } else a.setLoop(THREE.LoopRepeat, Infinity);
          if (H.cur) H.cur.crossFadeTo(a, o.fade == null ? 0.12 : o.fade, false);
          a.play(); H.cur = a; return a;
        };
        H.update = dt => mixer.update(dt);
        H.dispose = () => { mixer.stopAllAction(); root.parent && root.parent.remove(root); };
        ok(H);
      }, undefined, e => fail(e));
    });
  }
  root.FRHero = { HEROES, load, CLIPS };
})(window);
