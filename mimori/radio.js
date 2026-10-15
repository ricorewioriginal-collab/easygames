/* Mimori's real living-room radio: all slugs verified against ricorewi-radio/Hörerbot/stations.json. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MimoriRadio=api})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const stations=[
 ['Sternenfunk','RicoReWi Radio','ricorewi'],
 ['Zeitzauber FM','YourTime FM','yourtime-fm'],
 ['Drachenrap','Rapradio 24','rapradio24'],
 ['Schlagerwiese','Schlagerpop 24','schlagerpop24'],
 ['Glitzercharts','Chartradio 24','chartradio24'],
 ['Mondschein-Club','Clubradio 24','clubradio24'],
 ['Anmacher-Wolke','AnMaCha 24','anmacha24'],
 ['Flohs Märchenfunk','Radiofloh','radiofloh'],
 ['Felsenklang','Rockradio 24','rockradio24'],
 ['Winterstern FM','Christmasradio 24','christmasradio24'],
 ['Zeitreise-Kult','Kultradio 24','kultradio24'],
 ['Pixelhelden FM','Zocker FM','zockerfm'],
 ['Zauberfrequenz','Special Radio','special-radio']
].map(([fantasy,name,slug])=>({fantasy,name,slug,url:'https://stream.laut.fm/'+slug}));
let player=null,playing='',button=null,nowEl=null,live=false;
function mount(container){
 if(!container)return;
 container.replaceChildren();
 const heading=document.createElement('p');heading.className='radioSource';
 heading.textContent='📻 Live-Radio im Mimori-Wohnzimmer · Quelle: laut.fm';container.appendChild(heading);
 const status=document.createElement('p');status.id='radioNow';status.textContent='Sender auswählen, um das Radio einzuschalten.';container.appendChild(status);nowEl=status;
 const stopBtn=document.createElement('button');stopBtn.id='radioStop';stopBtn.textContent='⏹ Radio ausschalten';stopBtn.addEventListener('click',stop);container.appendChild(stopBtn);
 const list=document.createElement('div');list.className='radioStations';container.appendChild(list);
 for(const [i,s] of stations.entries()){
  const b=document.createElement('button');b.className='radioStation';b.dataset.station=s.slug;
  const badge=document.createElement('b');badge.textContent=String(i+1).padStart(2,'0');
  const words=document.createElement('span');
  const alias=document.createElement('strong');alias.textContent=s.fantasy;
  const original=document.createElement('small');original.textContent=s.name+' · laut.fm';
  words.append(alias,original);b.append(badge,words);
  b.addEventListener('click',()=>play(s.slug));list.appendChild(b);
 }
 button=container;
 update();
}
function update(){
 if(!button)return;
 button.querySelectorAll('[data-station]').forEach(b=>b.classList.toggle('active',live&&b.dataset.station===playing));
 if(nowEl&&live){const st=stations.find(x=>x.slug===playing);nowEl.textContent=st?'▶ '+st.fantasy+' – '+st.name+' (laut.fm)':'Radio läuft'}
}
async function play(slug){
 const station=stations.find(s=>s.slug===slug);if(!station)return false;
 if(!player){const AudioCtor=(typeof Audio!=='undefined'?Audio:null);if(!AudioCtor){
  if(nowEl)nowEl.textContent='Dieser Browser unterstützt kein Live-Audio.';return false}
  player=new AudioCtor();player.preload='none';player.volume=.65;
  player.addEventListener('error',()=>{live=false;update();if(nowEl)nowEl.textContent='Stream derzeit nicht verfügbar. Bitte einen anderen Sender wählen.'});
 }
 player.pause();
 player.src=station.url;playing=slug;live=false;
 if(nowEl)nowEl.textContent='Verbinde zu '+station.name+' …';
 try{await player.play();live=true;update();return true}
 catch(_){live=false;if(nowEl)nowEl.textContent='Autoplay oder Stream nicht verfügbar. Tippe erneut oder wähle einen anderen Sender.';return false}
}
function stop(){
 if(player){player.pause();player.removeAttribute('src');player.load?.()}
 live=false;playing='';if(nowEl)nowEl.textContent='Radio ausgeschaltet.';update();
}
return {stations,mount,play,stop,getStatus:()=>({playing,live})};
});
