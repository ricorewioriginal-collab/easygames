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


    'Rucksack':'Backpack','Tasche':'Bag','Spaß':'Fun','Mehr':'More',
    'Essen':'Food','Kleidung':'Clothing','Spielzeug':'Toys','Zimmer':'Room',
    'Tiere':'Animals','Hilfe':'Help','Helm':'Helmet','Partyhut':'Party hat',
    'Zauberhut':'Wizard hat','Krone':'Crown','Umhang':'Cape','Kopfhörer':'Headphones',
    'Zylinder':'Top hat','Wikingerhelm':'Viking helmet','Blumenkranz':'Flower crown',
    'Weihnachtsmütze':'Santa hat','Ninja-Stirnband':'Ninja headband',
    'Schal':'Scarf','Fliege':'Bow tie','Medaille':'Medal','Feenflügel':'Fairy wings',
    'Hasenohren':'Bunny ears','Bärenohren':'Bear ears','Katzenohren':'Cat ears',
    'Piratenhut':'Pirate hat','Kochmütze':"Chef's hat",'Cowboyhut':'Cowboy hat',
    'Sonnenbrille':'Sunglasses','Augenklappe':'Eye patch',
    'Armbanduhr':'Wristwatch','Fuchs-Look':'Fox look',
    'Angeln':'Fishing','Springen':'Jump','Sternenstaul':'Stardust',
    'Felder mähen':'Mow fields','Hof-Aufgabe':'Farm quest','Hof-Aufgaben':'Farm quests',
    'Ankommen':'Arrival','Unterwegs':'On the Move','Zuhause':'At Home','Im Ort':'In Town',
    'Mutprobe':'Test of Courage','Spaß-Tag':'Fun Day','Parkdirektor':'Park Director',
    'Willkommen auf der Bunten Insel! Ich bin Bürgermeisterin Rosi. Schau dich um: Sag Hallo, pack deinen Rucksack aus und lass dir den Weg zeigen.':'Welcome to Colorful Island! I am Mayor Rosi. Take a look around: say hello, open your backpack, and find your way.',
    'Auf der Insel gibt es viele Fahrzeuge. Steig ein, hilf den Leuten mit einem Auftrag – und fahr einmal mit dem Zug!':'There are lots of vehicles on the island. Hop in, help someone with a mission, and take a trip on the train!',
    'Bauer Heinz braucht Hilfe! Streichle die Tiere, mäh ein Feld und koch etwas Leckeres in der Hofküche.':'Farmer Heinz needs your help! Pet the animals, mow a field, and cook something tasty in the farmhouse kitchen.',
    'Jetzt wird es spannend! Hau einen Baum, such einen Schatz und schaff den Himmels-Parcours hoch über der Insel.':'The adventure starts now! Chop a tree, hunt for treasure, and complete the sky obstacle course above the island.',
    'Zeig, wie mutig du bist: Gewinne einen Kampf in der Arena, segle aufs Meer und flieg mit dem Hubschrauber.':'Show how brave you are: win an arena battle, sail out to sea, and fly in a helicopter.',
    'Du hast so viel geschafft – jetzt wird gefeiert! Fahr Karussell im Freizeitpark, schau einen Film und spring ins Freibad.':"You've accomplished so much – time to celebrate! Ride a theme park attraction, watch a movie, and take a dip in the pool.",
    'Der Freizeitpark gehört jetzt dir! Geh ins Park-Büro am Eingang, bau Wege, Fahrgeschäfte und Buden – und mach deinen Park richtig beliebt.':'The theme park is yours now! Visit the park office near the entrance, build paths, rides and stalls, and make your park a hit.',
    'Hau einen Baum (geh nah ran und tippe 🪓)':'Chop a tree (get close and tap 🪓)',
    'Finde einen Schatz (🎉 → Spiele → Schatzsuche)':'Find a treasure (🎉 → Games → Treasure Hunt)',
    'Schaffe den Himmels-Parcours':'Complete the sky obstacle course',
    'Gewinne einen Kampf in der Arena':'Win a battle in the arena',
    'Segle mit dem Boot':'Go sailing',
    'Flieg mit dem Hubschrauber':'Fly a helicopter',
    'Fahr eine Attraktion im Freizeitpark':'Ride an attraction at the theme park',
    'Schau einen Film im Kino':'Watch a movie at the cinema',
    'Spring ins Freibad':'Jump into the swimming pool',
    'Baue etwas im Freizeitpark (Park-Büro am Eingang)':'Build something in the theme park (park office at the entrance)',
    'Schließe eine Park-Mission ab':'Complete a park mission',
    'Erreiche 3 Sterne Parkbewertung':'Reach a three-star park rating',
    'Hof-Aufgabe':'Farm quest','Kapitel':'Chapter','Willkommen':'Welcome',
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
  function translate(s){if(lang==='de')return s;const match=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);if(!match)return s;const t=match[2];if(en[t]!==undefined)return match[1]+en[t]+match[3];if(cache[t])return match[1]+cache[t]+match[3];enqueue(t);if(/^Kapitel \d+\/\d+ · /.test(t))return match[1]+t.replace(/^Kapitel /,'Chapter ').replace(/ · ([^(]+) /,(_,n)=>' · '+(en[n]||n)+' ')+match[3];const counter=t.match(/^(.*?)\s+(\d+\/\d+)$/);if(counter&&en[counter[1]])return match[1]+en[counter[1]]+' '+counter[2]+match[3];const emojiCounter=t.match(/^(\S+\s+)(.*?)\s+(\d+\/\d+)$/);if(emojiCounter&&en[emojiCounter[2]])return match[1]+emojiCounter[1]+en[emojiCounter[2]]+' '+emojiCounter[3]+match[3];return s}

  // Live translation: browser's built-in Translator API first, optional configured
  // server endpoint second. Never hardcode credentials or send gameplay/save data.
  const CACHE_KEY='bunteInsel_translation_cache_v1';
  const cache=(()=>{try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch(_){return {}}})();
  let translatorPromise=null,endpoint='',queue=[],queued=new Set(),working=false,lastFailure=0;
  try{endpoint=String(window.BUNTE_INSEL_TRANSLATE_ENDPOINT||'')}catch(_){}
  function eligible(t){
    return lang==='en'&&t.length>=5&&t.length<=340&&/[a-zäöüß]{2}/i.test(t)
      &&(/[äöüß]/i.test(t)||/\b(der|die|das|und|mit|du|ein|eine|dein|deine|jetzt|hier|nicht|auf|zum|zur|für|ist|sind|hast|kannst|wird|wurde|weiter|bitte|kapitel|aufgabe)\b/i.test(t))
      &&!/[{<>}]/.test(t);
  }
  async function engine(){
    if(!navigator.onLine)return null;
    if(!translatorPromise)translatorPromise=(async()=>{
      try{
        const api=window.Translator;
        if(!api||typeof api.create!=='function')return null;
        if(typeof api.availability==='function'){
          const status=await api.availability({sourceLanguage:'de',targetLanguage:'en'});
          if(status==='unavailable')return null;
        }
        return await api.create({sourceLanguage:'de',targetLanguage:'en'});
      }catch(_){return null}
    })();
    return translatorPromise;
  }
  async function fetchTranslation(t){
    const e=await engine();
    if(e){try{return await e.translate(t)}catch(_){}}
    if(!endpoint)return null;
    // Endpoint must be provided by the site owner; no public API keys in the game.
    try{
      const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),6000);
      try{
        const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({text:t,source:'de',target:'en'}),signal:ctl.signal});
        if(!r.ok)return null;
        const data=await r.json();return typeof data.translation==='string'?data.translation:null;
      }finally{clearTimeout(timer)}
    }catch(_){return null}
  }
  function saveCache(){
    try{
      const keys=Object.keys(cache);
      if(keys.length>500)for(const k of keys.slice(0,keys.length-500))delete cache[k];
      localStorage.setItem(CACHE_KEY,JSON.stringify(cache))
    }catch(_){}
  }
  function enqueue(t){
    if(!eligible(t)||en[t]!==undefined||cache[t]||queued.has(t)||Date.now()-lastFailure<30000)return;
    if(queue.length>100)return;
    queue.push(t);queued.add(t);if(!working)void processQueue();
  }
  async function processQueue(){
    working=true;
    while(queue.length){
      if(lang!=='en'){queue.length=0;queued.clear();break}
      const t=queue.shift();queued.delete(t);
      const result=await fetchTranslation(t);
      if(typeof result==='string'&&result.trim()&&result.length<1100&&result.trim()!==t){
        cache[t]=result.trim();saveCache();
        if(lang==='en')walk(document.body);
      }else if(!window.Translator&&!endpoint){
        lastFailure=Date.now();queue.length=0;queued.clear();break;
      }else{
        lastFailure=Date.now();
      }
    }
    working=false;
  }
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
          if(prior!==undefined&&node.nodeValue!==translate(prior)&&node.nodeValue!==prior)originalText.set(node,node.nodeValue);
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
  window.BunteInselI18n={get language(){return lang},setLanguage,t:key=>translate(key),dictionary:en,get liveTranslationAvailable(){return !!(window.Translator||endpoint)},get configuredEndpoint(){return !!endpoint}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();