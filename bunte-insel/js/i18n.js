'use strict';
/* Bunte Insel localization layer. Does not alter game data, save keys or game logic.
   Original DOM strings remain the source of truth. Unknown phrases remain German. */
(function(){
  const KEY='bunteInsel_language';
  const en={
    'Bunte Insel':'Colorful Island','Bunte Insel – Das Spiel':'Colorful Island – The Game',
    'Spielen':'Play','Spiel starten':'Start game','Neues Spiel':'New game','Weiter spielen':'Continue',
    'Weiter':'Continue','Zurück':'Back','Schließen':'Close','Abbrechen':'Cancel',
    'OK':'OK','Ja':'Yes','Nein':'No','Fertig':'Done','Start':'Start','Los geht’s!':"Let's go!",
    'Einstellungen':'Settings','Einstellungen öffnen':'Open settings',
    'Pause und Hilfe':'Pause and help','Pause':'Pause','Hilfe':'Help',
    'Spiel neu laden':'Reload game','Spiel speichern':'Save game','Jetzt speichern':'Save now',
    'Vorlesen':'Read aloud','Musik':'Music','Geräusche':'Sound effects','Ton':'Sound',
    'Aufgaben und Hinweise':'Quests and tips','Handbuch und Lösungen':'Guidebook and solutions',
    'Code eingeben':'Enter code','Fehler melden':'Report a bug',
    'Touch-Steuerung':'Touch controls','Stick':'Joystick','Tag und Nacht':'Day and night',
    'Ego-Kamera':'First-person camera','Wohin?':'Where to?','Bauen':'Build',
    'Story-Modus':'Story mode','Spielmodus wechseln':'Change game mode','Freies Spiel':'Free play',
    'Taschis: an':'Taschis: on','Taschis: aus':'Taschis: off',
    'Taschis':'Taschis','Mitspieler':'Players','Inselreise – nächstes Ziel':'Island Journey – Next goal',
    'Auftrag annehmen':'Accept mission','Auftrag ablehnen':'Decline mission',
    'Aufgaben-Kachel ein-/ausklappen':'Expand/collapse mission panel',
    'Schlag':'Punch','Tritt':'Kick','Spezial':'Special','Block':'Block',
    'Heiltrank':'Health potion','Energietrank':'Energy potion','Kampf verlassen':'Leave battle',
    'Handbuch':'Guidebook','Rucksack':'Backpack','Inventar':'Inventory',
    'Karte':'Map','Minikarte':'Mini-map','Weltkarte':'World map',
    'Tag':'Day','Nacht':'Night','Wetter':'Weather','Sprache':'Language',
    'Deutsch':'German','Englisch':'English',
    'Speichern':'Save','Laden':'Load','Neustart':'Restart',
    'Weiter ▶':'Continue ▶','▶ Weiter':'▶ Continue',
    'Hauptmenü':'Main menu','Zum Hauptmenü':'Back to main menu',
    'Zum Spiel':'Back to game','Zurück zum Spiel':'Back to game',
    'Erkunden':'Explore','Abenteuer':'Adventure','Die Inselreise':'The Island Journey',
    'Meine Aufgaben':'My quests','Aufgaben':'Quests','Nächstes Ziel':'Next goal',
    'Mission':'Mission','Ziel':'Goal','Erledigt!':'Completed!',
    'Annehmen':'Accept','Ablehnen':'Decline','Belohnung':'Reward',
    'Kaufen':'Buy','Verkaufen':'Sell','Shop':'Shop','Laden':'Load',
    'Wohnung':'Home','Haus':'House','Garten':'Garden','Bau-Menü':'Build menu',
    'Auto':'Car','Fahrzeuge':'Vehicles','Zug':'Train','Hubschrauber':'Helicopter',
    'Polizei':'Police','Feuerwehr':'Fire department','Krankenwagen':'Ambulance',
    'Schule':'School','Bauernhof':'Farm','Strand':'Beach','Spielplatz':'Playground',
    'Küche':'Kitchen','Kochen':'Cooking','Schlafen':'Sleep',
    'Fragen':'Questions','Antworten':'Answer','Hallo!':'Hello!',
    'Verstanden':'Got it','Bestätigen':'Confirm','Beenden':'Quit',
    'Lautstärke':'Volume','Steuerung':'Controls','Grafik':'Graphics',
    'Schnell':'Fast','Langsam':'Slow','Ein':'On','Aus':'Off',
    'Weiter geht’s!':"Let's keep going!",'Viel Spaß!':'Have fun!',
    'Alle Spiele':'All games','Zur Spieleübersicht':'Back to games',
    'Sprich mit jemandem (tippe auf eine Person)':'Talk to someone (tap a person)',
    'Öffne deinen Rucksack (🎒 oben links)':'Open your backpack (🎒 top left)',
    'Lass dir den Weg zeigen (🧭 oben links)':'Show the way (🧭 top left)',
    'Steig in ein Fahrzeug':'Get into a vehicle',
    'Erledige einen Auftrag (im Fahrzeug „Ja“ sagen)':'Complete a mission (say "Yes" in the vehicle)',
    'Fahr mit dem Zug':'Ride the train',
    'Richte dein Zimmer ein':'Decorate your room',
    'Ernte etwas im Garten':'Harvest something in the garden',
    'Schlaf in deinem Bett':'Sleep in your bed',
    'Streichle ein Tier auf dem Hof':'Pet an animal on the farm',
    'Mäh ein Feld mit dem Traktor':'Mow a field with the tractor',
    'Koche etwas in der Hofküche':'Cook something in the farm kitchen',
    'Kaufe etwas in einem Laden':'Buy something at a shop',
    'Spiel in der Schießbude':'Play at the shooting gallery',
    'Mach ein Foto (📷 oben links)':'Take a photo (📷 top left)',
    'Du hast eine eigene Wohnung und einen Garten! Mach es dir gemütlich, ernte etwas und ruh dich aus.':'You have your own home and garden! Make yourself comfortable, harvest your crops and get some rest.',
    'Im Ort ist immer was los. Geh einkaufen, probier die Schießbude und mach ein schönes Foto.':'There is always something happening in town. Go shopping, try the shooting gallery and take a nice photo.',
    'Auf dem Bauernhof':'At the Farm'
  };
  // Only translate exact, known UI phrases; never alter arbitrary game data, player names or save contents.
  const originalText=new WeakMap(),originalAttrs=new WeakMap();
  const attrs=['aria-label','title','placeholder'];
  const skipped=new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','CODE','PRE','OPTION']);
  let lang='de',busy=false;
  try{lang=localStorage.getItem(KEY)||((navigator.language||'de').toLowerCase().startsWith('de')?'de':'en')}catch(_){}
  if(!['de','en'].includes(lang))lang='de';
  function translate(s){if(lang==='de')return s;const match=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);return match&&en[match[2]]!==undefined?match[1]+en[match[2]]+match[3]:s}
  function textNode(n){
    if(!n.parentElement||skipped.has(n.parentElement.tagName)||n.parentElement.closest('[data-bi-i18n-skip]'))return;
    let base=originalText.get(n);
    if(base===undefined){base=n.nodeValue;originalText.set(n,base)}
    const desired=translate(base);
    if(n.nodeValue!==desired)n.nodeValue=desired;
  }
  function element(el){
    if(el.matches&&el.matches('[data-bi-i18n-skip]'))return;
    let bases=originalAttrs.get(el);if(!bases){bases={};originalAttrs.set(el,bases)}
    for(const a of attrs){if(el.hasAttribute&&el.hasAttribute(a)){
      if(!(a in bases))bases[a]=el.getAttribute(a);
      const v=translate(bases[a]);if(el.getAttribute(a)!==v)el.setAttribute(a,v);
    }}
  }
  function walk(root){
    if(!root)return;busy=true;
    try{
      if(root.nodeType===3){textNode(root);return}
      if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
      if(root.nodeType===1)element(root);
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
      let n;while((n=walker.nextNode())){if(n.nodeType===3)textNode(n);else element(n)}
    }finally{busy=false}
  }
  let scheduled=false;
  const observer=new MutationObserver(changes=>{
    if(scheduled)return;scheduled=true;
    // Re-render only changed branches, and retain their original German strings.
    queueMicrotask(()=>{
      scheduled=false;
      for(const m of changes){
        if(m.type==='characterData'){
          const node=m.target,prior=originalText.get(node);
          if(prior!==undefined&&node.nodeValue!==translate(prior))originalText.set(node,node.nodeValue);
          walk(node);
        }else if(m.type==='childList'){
          for(const n of m.addedNodes)walk(n);
        }else if(m.type==='attributes'){
          const el=m.target,bases=originalAttrs.get(el),a=m.attributeName;
          if(bases&&a in bases&&el.getAttribute(a)!==translate(bases[a]))bases[a]=el.getAttribute(a);
          element(el);
        }
      }
    });
  });
  function setLanguage(value){
    if(!['de','en'].includes(value))return;
    lang=value;document.documentElement.lang=value;
    try{localStorage.setItem(KEY,value)}catch(_){}
    walk(document.body);
    document.querySelectorAll('[data-bi-lang]').forEach(btn=>{btn.setAttribute('aria-pressed',String(btn.dataset.biLang===value));btn.classList.toggle('active',btn.dataset.biLang===value)});
    document.dispatchEvent(new CustomEvent('bunteinsel:languagechange',{detail:{language:value}}));
  }
  function setup(){
    const css=document.createElement('style');
    css.textContent='#biLanguage{position:fixed;top:max(12px,env(safe-area-inset-top));left:max(10px,env(safe-area-inset-left));z-index:89999;display:flex;gap:3px;background:#101c31dc;border:1px solid #ffffff5c;border-radius:16px;padding:4px;box-shadow:0 3px 20px #0005}#biLanguage button{border:0;border-radius:11px;padding:7px 10px;background:transparent;color:#eaf3ff;font:700 12px system-ui;cursor:pointer}#biLanguage button.active{background:#267ed2;color:white}#biLanguage button:focus-visible{outline:2px solid #fff}';
    css.textContent+='body:has(#hud:not([hidden])) #biLanguage{display:none}#biLangSettings{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:6px 0;padding:5px;border-radius:10px;background:#162641}#biLangSettings strong{margin-right:5px;font:700 13px system-ui;color:#fff}#biLangSettings button{font:700 12px system-ui;padding:6px 9px;border:1px solid #789bd0;border-radius:8px;background:#23385d;color:white}#biLangSettings button.active{background:#2284cf;border-color:#a2d8ff}';
    document.head.appendChild(css);
    const wrap=document.createElement('div');wrap.id='biLanguage';wrap.dataset.biI18nSkip='1';wrap.setAttribute('aria-label','Language / Sprache');
    wrap.innerHTML='<button data-bi-lang="de" type="button" aria-label="Deutsch">🇩🇪 DE</button><button data-bi-lang="en" type="button" aria-label="English">🇬🇧 EN</button>';
    wrap.addEventListener('click',e=>{const b=e.target.closest('[data-bi-lang]');if(b)setLanguage(b.dataset.biLang)});
    document.body.appendChild(wrap);
    const settings=document.getElementById('toolPanel');
    if(settings){const row=document.createElement('div');row.id='biLangSettings';row.dataset.biI18nSkip='1';row.innerHTML='<strong>🌐 Sprache / Language</strong><button type="button" data-bi-lang="de">🇩🇪 DE</button><button type="button" data-bi-lang="en">🇬🇧 EN</button>';row.addEventListener('click',e=>{const b=e.target.closest('[data-bi-lang]');if(b)setLanguage(b.dataset.biLang)});settings.appendChild(row)}
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
    setLanguage(lang);
  }
  window.BunteInselI18n={get language(){return lang},setLanguage,t:key=>translate(key),dictionary:en};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();