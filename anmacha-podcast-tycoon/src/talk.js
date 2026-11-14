/* AnMaCha – Der Podcast: Jede Figur in Stadt und Welten lässt sich ansprechen.
   Gespräch mit Auswahl wie im Rollenspiel: Interview fürs Thema, Lieblingssender, Fan-Aktionen (Freundebuch), Tipps, Tratsch.
   Jede Person hat Name, Beruf passend zum Ort, Lieblingssender und ein Herzensthema. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, D = AMC.Data, Save = AMC.Save;
  const TK = AMC.Talk = {};

  // Berufe und Sätze je Gegend
  const ZONES = {
    hafen: { jobs: ['Hafenarbeiter|Hafenarbeiterin', 'Kranführer|Kranführerin', 'Kameramann bei Kanal 9|Kamerafrau bei Kanal 9', 'Drucker|Druckerin', 'Leuchtturm-Funker|Leuchtturm-Funkerin', 'Matrose auf Landgang|Matrosin auf Landgang'], rub: ['serious', 'tech', 'tv'],
      hi: ['Moin! Hier riecht’s nach Diesel und Druckerschwärze.', 'Die Schiffe bringen Kisten – und manchmal Ideen für Podcasts.', 'Kanal 9 sendet gleich die Nachrichten. Ihr seid bestimmt wieder drin!'] },
    insel: { jobs: ['Festivalgast', 'Bühnentechniker|Bühnentechnikerin', 'Merch-Verkäufer|Merch-Verkäuferin', 'Riesenrad-Chef|Riesenrad-Chefin', 'Tänzer|Tänzerin', 'Security mit weichem Herz'], rub: ['musik', 'feel'],
      hi: ['Was für ein Line-up heute! Spielt ihr auch?', 'Ich hab seit drei Tagen nicht geschlafen. Bester Urlaub ever!', 'Die Hauptbühne bebt – habt ihr den Bass gespürt?'] },
    berg: { jobs: ['Wanderer|Wanderin', 'Funkamateur|Funkamateurin', 'Museumsführer|Museumsführerin', 'Sendetechniker|Sendetechnikerin', 'Bergbauer mit Radio|Bergbäuerin mit Radio', 'Höhlenforscher|Höhlenforscherin'], rub: ['serious', 'tech', 'feel'],
      hi: ['Von hier oben empfange ich sogar Sender aus Dänemark!', 'Der Funkturm ist älter als mein Opa. Und lauter.', 'Frische Luft, gutes Signal – mehr brauch ich nicht.'] },
    rico: { jobs: ['Content-Creator|Content-Creatorin', 'Tool-Tester|Tool-Testerin', 'Casting-Teilnehmer|Casting-Teilnehmerin', 'Bücherwurm', 'Streamer|Streamerin', 'Werkstatt-Bastler|Werkstatt-Bastlerin'], rub: ['tech', 'musik', 'tv'],
      hi: ['Rico hat schon wieder ein neues Tool gebaut. Das dritte heute!', 'Ich übe für „Show me your Voice“. Hörst du zu?', 'Im Radioportal laufen 13 Sender gleichzeitig. Ich hab alle abonniert.'] },
    wellen: { jobs: ['Messebesucher|Messebesucherin', 'Plattensammler|Plattensammlerin', 'Camper|Camperin', 'Radio-Funkloch-Hörer (heimlich)|Radio-Funkloch-Hörerin (heimlich)', 'Raststätten-Koch|Raststätten-Köchin', 'Lokalreporter|Lokalreporterin'], rub: ['musik', 'serious', 'feel'],
      hi: ['Willkommen in Wellenburg! Hier ist alles ein bisschen lauter.', 'Auf der Radio-Messe gibt’s Mikros, die kosten mehr als mein Auto.', 'Hab Gisela vorhin gesehen. Die ist ja legendär!'] },
    city: { jobs: ['Student|Studentin', 'Barista', 'Paketbote|Paketbotin', 'Rentner mit Kofferradio|Rentnerin mit Kofferradio', 'Fahrradkurier|Fahrradkurierin', 'Verkäufer|Verkäuferin', 'Busfahrer|Busfahrerin', 'Hobby-DJ'], rub: ['serious', 'tech', 'musik', 'tv', 'feel'],
      hi: ['Ihr seid doch die vom Podcast! Ich hör euch jeden Morgen.', 'Na, wieder unterwegs für neue Themen?', 'In der Medienstadt passiert immer was. Heute schon gelacht?'] }
  };
  const TOPIC = {
    serious: ['Warum kostet Brot in jedem Laden was anderes?', 'Mein Vermieter will eine Fahrrad-Steuer im Hausflur. Ist das erlaubt?', 'Wie erklärt man Oma den Klimawandel, ohne dass sie das Radio ausmacht?'],
    tech: ['Mein Smart-TV hat sich selbst geupdatet und spricht jetzt Französisch.', 'Welches Mikro für Anfänger? Ich will auch podcasten!', 'Mein Staubsauger-Roboter hat Angst vor der Katze.'],
    musik: ['Ihr müsst unbedingt mehr 90er spielen!', 'Ich hab ein Lied geschrieben. Über Gisela.', 'Welcher Song macht euch sofort gute Laune?'],
    tv: ['Habt ihr die neue Serie gesehen? Das Ende! Ich bin fertig.', 'Warum gibt’s keine Kochshow mit Podcastern?', 'Mein Lieblingsfilm läuft heute auf Kanal 9!'],
    feel: ['Ich hab heute meinen ersten Halbmarathon geschafft!', 'Mein Hund hat beim Radiohören mitgeheult. Zu süß.', 'Erzählt mal was Schönes – ich hatte einen langen Tag.']
  };
  const TIPS = [
    'Im Gesamtmenü unter „Story-Akte“ steht, was als Nächstes passiert.',
    'Mit Gisela über die Autobahn nach Wellenburg – das gibt eine Roadtrip-Folge mit mehr Hörern!',
    'Goldene Kassetten liegen überall versteckt, auch auf Dächern.',
    'Jedes haltende Auto kannst du dir leihen. Fahr einfach mal Taxi!',
    'Abends ab 18 Uhr ist Prime-Time – dann ab ins Funkhaus zur Aufnahme.',
    'In den Senderhäusern tanzen die Fans mit. Je mehr Vibe, desto mehr Fan-Punkte.',
    'Studiogäste aus den Welten bringen extra Hörer, wenn ihr Thema passt.',
    'In der AnMaCha-App kannst du jeden Tag eine Umfrage starten.',
    'Ausgeschlafen und satt sind Marco und Andrew bei der Aufnahme viel besser.',
    'RicoReWi wohnt im Westen hinter der Neonbrücke. Er hat immer was zu tun.'
  ];
  const GOSSIP = [
    'Ralf Rauschmann von Radio Funkloch soll heimlich euren Podcast hören.',
    'Angeblich hat Marco Gisela zum Geburtstag ein neues Lenkrad geschenkt.',
    'Andrew hat im Musikshop drei Stunden Klavier gespielt. Keiner wollte, dass er aufhört.',
    'RicoReWi hat 47 Browser-Tabs offen. Mindestens.',
    'Auf der Festival-Insel soll bald ein ganz großes Finale steigen.',
    'Die goldenen Kassetten hat angeblich ein alter Radio-DJ versteckt.'
  ];

  function zoneOf(x, z) {
    const n = AMC.Worlds ? AMC.Worlds.name(x, z) || '' : '';
    return /Hafen/.test(n) ? 'hafen' : /Insel/.test(n) ? 'insel' : /Berg/.test(n) ? 'berg' : /RicoReWi/.test(n) ? 'rico' : /Wellenburg/.test(n) ? 'wellen' : 'city';
  }
  // Identität einer Figur (stabil je Startpunkt)
  function who(p) {
    if (p.who) return p.who;
    const seed = Math.abs(Math.round((p.hx || p.x) * 7 + (p.hz || p.z) * 13 + (p.seed || 0))), Z = ZONES[zoneOf(p.hx || p.x, p.hz || p.z)];
    // Geschlecht wie das Aussehen (W.makeFan würfelt mit demselben Startwert)
    const fem = p.seed != null ? U.seeded(p.seed * 977 + 13)() < 0.5 : seed % 2 === 0;
    const names = fem ? ['Sabine', 'Lea', 'Gül', 'Mira', 'Anja', 'Heike', 'Nina', 'Yasmin', 'Tanja', 'Bärbel', 'Fatma', 'Jule', 'Nele', 'Rosa', 'Uschi', 'Wiebke', 'Zoe', 'Deniz']
      : ['Timo', 'Kevin', 'Jonas', 'Paul', 'Luca', 'Ole', 'Sven', 'Rolf', 'Emil', 'Igor', 'Malte', 'Piet', 'Tarek', 'Vince', 'Deniz', 'Jan', 'Mehmet', 'Bernd'];
    const job = Z.jobs[seed % Z.jobs.length].split('|');
    p.who = { name: names[seed % names.length], job: job[fem && job[1] ? 1 : 0], zone: Z, rub: Z.rub[seed % Z.rub.length], st: D.STATIONS[seed % D.STATIONS.length], seed };
    p.name = p.who.name;
    return p.who;
  }
  const today = () => { const c = AMC.Career && AMC.Career.state(); const t = c ? c.today : (TK._t = TK._t || {}); t.talk = t.talk || {}; return t; };

  /** Gesprächsangebot für Figuren in der Nähe (nach Orten und Story-Figuren geprüft) */
  TK.target = function (p, ctx) {
    const FX = AMC.WorldFX; if (!FX || !FX.nearPerson) return null;
    const n = FX.nearPerson(p.x, p.z, 2.3); if (!n) return null;
    const w = who(n);
    return { label: '💬 ' + w.name + ' ansprechen · ' + w.job, run: () => TK.open(n, ctx) };
  };

  TK.open = function (n, ctx) {
    const S = ctx.S, w = who(n), t = today(), key = k => w.name + w.seed + ':' + k, H = S.pl.H || D.HOSTS.andrew;
    face(n, S); n.wait = 999; n.talking = true;
    if (AMC.WorldFX.anim) AMC.WorldFX.anim(n, 'yes');
    const friend = AMC.Social ? AMC.Social.level(w.name) : { i: 0, icon: '🙂', name: 'Fremd' };
    const greet = friend.i >= 2 ? (AMC.Social.greet(w.name, H.id) || U.pick(w.zone.hi)) : U.pick(w.zone.hi);
    const R = D.RUBRICS[w.rub];
    const OPT = [
      ['interview', '🎙️', 'Kurzes Interview für die Folge', '+2 ' + R.icon + ' ' + R.name + '-Funken', () => {
        S.got[w.rub] = (S.got[w.rub] || 0) + 2; S.talks = (S.talks || 0) + 1; ctx.drawRub && ctx.drawRub();
        if (AMC.Social) AMC.Social.add(w.name, 5); AMC.Audio.sfx('perfect');
        return [w.name, '„' + U.pick(TOPIC[w.rub]) + '“', '+2 ' + R.icon + ' Funken · +5 ❤️'];
      }],
      ['radio', '📻', 'Was hörst du so?', 'Lieblingssender', () => {
        if (AMC.Social) AMC.Social.add(w.name, 2);
        return [w.name, '„' + w.st.name + '! ' + w.st.desc + ' Kennt ihr das Senderhaus in der Stadt?“', '+2 ❤️', w.st.slug];
      }],
      ['tip', '💡', 'Hast du einen Tipp für uns?', 'Insiderwissen', () => [w.name, '„' + TIPS[(w.seed + (t.tipN = (t.tipN || 0) + 1)) % TIPS.length] + '“', '']],
      ['gossip', '🗞️', 'Was gibt’s Neues in der Stadt?', 'Tratsch', () => { Save.earn(2); return [w.name, '„' + GOSSIP[(w.seed + 3) % GOSSIP.length] + '“', '+2 🎟️']; }],
      ['social', '🤳', 'Fan-Aktionen (Selfie, Autogramm …)', friend.icon + ' ' + friend.name, null]
    ];
    const rows = () => OPT.map((o, i) => { const used = o[4] && t.talk[key(o[0])]; return '<button type="button" class="st-item" data-nav data-o="' + i + '"' + (used ? ' aria-disabled="true"' : '') + '><span class="st-ic">' + o[1] + '</span><span><b>' + o[2] + '</b><small>' + (used ? 'Heute schon gefragt' : o[3]) + '</small></span></button>'; }).join('');
    const s = AMC.UI.open('<div class="panel glass talk"><header><h2>💬 ' + U.esc(w.name) + ' <small>' + U.esc(w.job) + '</small></h2><button class="btn small" data-nav id="tkB">' + AMC.glyph('b') + ' Tschüss</button></header>' +
      '<p class="talk-say" id="tkSay"><b>' + U.esc(w.name) + ':</b> „' + U.esc(greet) + '“</p><p class="hint" id="tkRes"></p><div class="st-list" id="tkL">' + rows() + '</div></div>', { back: () => close() });
    const close = () => { AMC.UI.close(s); n.talking = false; n.wait = 1.5; };
    s.el.querySelector('#tkB').onclick = close;
    s.el.querySelector('#tkL').addEventListener('click', e => {
      const b = e.target.closest('[data-o]'); if (!b || b.getAttribute('aria-disabled')) return;
      const o = OPT[+b.dataset.o];
      if (!o[4]) { close(); if (AMC.Social) setTimeout(() => AMC.Social.open(n, S), 120); return; }
      t.talk[key(o[0])] = 1; AMC.Audio.sfx('ok');
      const r = o[4](); if (AMC.WorldFX.anim) AMC.WorldFX.anim(n, U.pick(['yes', 'arms']));
      s.el.querySelector('#tkSay').innerHTML = (r[3] ? '<img class="talk-logo" alt="" src="' + AMC.UI.senderLogo(r[3]) + '">' : '') + '<b>' + U.esc(r[0]) + ':</b> ' + U.esc(r[1]);
      s.el.querySelector('#tkRes').textContent = r[2] || '';
      s.el.querySelector('#tkL').innerHTML = rows(); AMC.UI.focus(s.el.querySelector('#tkL [data-nav]:not([aria-disabled])') || s.el.querySelector('#tkB'));
      if (AMC.Career && o[0] === 'interview') AMC.Career.mark('dance');
    });
    return s;
  };
  function face(n, S) { if (n.fig) { n.yaw = Math.atan2(S.pl.x - n.x, S.pl.z - n.z); n.fig.root.rotation.y = n.yaw; } }
  TK.who = who;
})(typeof window !== 'undefined' ? window : globalThis);
