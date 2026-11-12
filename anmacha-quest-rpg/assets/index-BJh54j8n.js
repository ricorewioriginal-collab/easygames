(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();const Ft={welt:{name:"Aetherion",theme:"town",rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~....................................~~","~~..,.,.....,.........................~~","~~.~~~.........TTT.....TTTTTTT........~~","~~..........,TTTTT......TT..TT........~~","~~.TTT.....T.TTT^^......TT..TT........~~","~~.........TTTT^^^..........~~........~~","~~..~~.....TTTTTTTTTT.....T~~~.....TT.~~","~~..~~~~~..TTTTTTT^^^TTTTTT~~~TTTTTTT.~~","~~..~~~~~TTTTT..~~~~~TTT.,T~~~~~~~....~~","~~.......TTTTT,.~~~~~TTT..~~~~~~~~..,.~~","~~.,..,..TTTTT...TT..,....~~~.......,.~~","~~.......TTTTTT..TT,,^^^^^TT~~~~~.....~~","~~..,,^^^TT....,.TT..^^^^^TT~~~~~.....~~","~~.~~~TT,............~~~~~TTTTT^^^^^..~~","~~.,......,....~~~.^^^^^^^^.^^^.....,.~~","~~........TTT..~~~.^^^^.....^TT.......~~","~~........TT~~.........TTT............~~","~~...........TTTTT.....TTT.~~,......,.~~","~~.TT............~.......TTT~.........~~","~~.TTTT^^^...,...,.......TT~~...~~~...~~","~~.TTTT^^^..,,...........TT......,....~~","~~....................................~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"],enc:[],rate:.06,lv:3,world:!0,portals:[{x:20,y:21,to:"hub",req:"",label:"Hafenau",kind:"town",ax:12,ay:13},{x:7,y:18,to:"rap",req:"",label:"Echogruft",kind:"cave",ax:2,ay:14},{x:33,y:18,to:"schlager",req:"boss_rap",label:"Rosenhain",kind:"cave",ax:2,ay:14},{x:8,y:6,to:"xmas",req:"boss_schlager",label:"Frostgrotte",kind:"cave",ax:2,ay:14},{x:32,y:6,to:"rock",req:"boss_xmas",label:"Glutschlund",kind:"cave",ax:2,ay:14},{x:20,y:5,to:"tower",req:"boss_rock",label:"Turm der Stille",kind:"tower",ax:2,ay:14}],npcs:[],chests:[],boss:{}},hub:{name:"Hafenau",theme:"town",rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~","~#....,,..............,.#~","~#,T.....hhhT.hhh....TT.#~","~#TT.....HSH..HDH.,..,T.#~","~#..,.,...p...,p,....,..#~","~#..hhh...p.TT.p..,hhh..#~","~#..HDH,,.p....p...MDM,.#~","~#...p..pppppppppp..p...#~","~#...pppppppppppppppp...#~","~#......pppppppppp.,....#~","~#....T.pppppppppp,T.,..#~","~#..,,..pppppppppp......#~","~#TT........p......,..T.#~","~#.T...T....p,.,..T,,TT,#~","~.......,...p..,.........~","~~~~~~~~~~~~~~~~~~~~~~~~~~"],enc:[],rate:0,lv:1,portals:[{x:12,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:20,ay:22}],npcs:[{x:10,y:5,kind:"shop",name:"Mara"},{x:15,y:9,kind:"heal",name:"Quelle"},{x:12,y:9,kind:"elder",name:"Älteste Ysolde"},{x:8,y:10,kind:"kid",name:"Pip"},{x:17,y:10,kind:"guard",name:"Wache Holm"}],chests:[],boss:{}},rap:{name:"Echogruft",theme:"rap",rows:["##########################","#..........,.,..,...#....#","#..,................#....#","#..,.....,...,...TT.#....#","#........TTT.T.~.~.......#","#,.T.T..T..T.T.~~.~.#....#","#,....TT...,.TTT...,#.,..#","#.........,,..T,....######","#.......TTT......,TTT.TTT#","#..,.TTT..T...,...T......#","#...TT~~.......TTTT.T....#","#..,T~~~~..,TT.~~~TT.....#","#.....~~~TT.T.~~..,......#","#......................,.#","#.....,.............,....#","##########################"],enc:["beatbandit","reimruepel","bassgolem","boombox","graffiti","mikspin"],rate:.075,lv:3,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:7,ay:19}],npcs:[],chests:[{id:"rap_key",x:6,y:5,kind:"key",v:"key_rap",n:1},{id:"rap_c1",x:10,y:6,kind:"item",v:"trank",n:2},{id:"rap_c2",x:15,y:3,kind:"gold",v:70}],gate:{x:20,y:4,key:"key_rap",flag:"gate_rap"},boss:{x:23,y:2,id:"mcdroehn",flag:"boss_rap"}},schlager:{name:"Rosenhain",theme:"schlager",rows:["##########################","#.,,.,,...,.......,.#....#","#...T...T..T.,..,,.,#....#","#..........T........#....#","#..,,...~~~T...T.........#","#....,..~~...,.TTT..#.,.,#","#...TT..T,.....,TT,.#....#","#.TTT.TT..TT,...TTT,######","#.,.,..~~TTTT.T.TTT.TTT,.#","#....,.~~~TTT.T....T.....#","#.TTTTTT,.,~~~~.TTT....,.#","#.TTT.,,..,~~~,.TTT..,...#","#....T..,..T,...,.....,..#","#....T,....,......,.,.,..#","#....,,...,..,..,,..,,...#","##########################"],enc:["gecko","schleim","aal","disco","herz","zuckerg"],rate:.075,lv:8,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:33,ay:19}],npcs:[],chests:[{id:"schlager_key",x:22,y:13,kind:"key",v:"key_schlager",n:1},{id:"schlager_c1",x:15,y:8,kind:"item",v:"trank",n:2},{id:"schlager_c2",x:2,y:1,kind:"gold",v:120}],gate:{x:20,y:4,key:"key_schlager",flag:"gate_schlager"},boss:{x:23,y:2,id:"koenigin",flag:"boss_schlager"}},xmas:{name:"Frostgrotte",theme:"xmas",rows:["##########################","#...................#....#","#....TTT......TTT...#....#","#..T.TTT......T~~~~.#....#","#.....TTTT...~~~~.,......#","#...TTTTTTT..~~~....#....#","#......T....TTTT...T#....#","#.,,........TTTTT.TT######","#.TTT..,.....,~~~..TTTT,.#","#.TTT.....~~~~~~~..T~~~..#","#..,.TTTT.~~~~......~~...#","#...TT...............TTT.#","#....TT...........TTTTTT.#","#....TT............T.....#","#...................,....#","##########################"],enc:["geist","lebkuchen","schneemann","eisratte","eisspin","zwerg"],rate:.075,lv:13,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:8,ay:7}],npcs:[],chests:[{id:"xmas_key",x:7,y:8,kind:"key",v:"key_xmas",n:1},{id:"xmas_c1",x:23,y:8,kind:"item",v:"trank",n:2},{id:"xmas_c2",x:8,y:3,kind:"gold",v:170}],gate:{x:20,y:4,key:"key_xmas",flag:"gate_xmas"},boss:{x:23,y:2,id:"frostmod",flag:"boss_xmas"}},rock:{name:"Glutschlund",theme:"rock",rows:["##########################","#.....,.,...........#....#","#.T,T......TTTTT..TT#....#","#.TTT~~~.,.T~~T...T.#....#","#.T..~~T,...~~...........#","#.T............T..~.#....#","#..TTT.TT......T..~~#...,#","#.TT.T,TTTT...T.....######","#,TT.T..T~~.~~~TT........#","#....TT..~~~~~~TT.TT.....#","#....TT...........TT.....#","#..T.........,,,..~~~....#","#....TT......T....~~T.,..#","#.....T.,................#","#........,...............#","##########################"],enc:["gargoyle","mole","verstaerker","rifffled","daemon","roadie"],rate:.075,lv:18,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:32,ay:7}],npcs:[],chests:[{id:"rock_key",x:18,y:8,kind:"key",v:"key_rock",n:1},{id:"rock_c1",x:11,y:6,kind:"item",v:"trank",n:2},{id:"rock_c2",x:20,y:13,kind:"gold",v:220}],gate:{x:20,y:4,key:"key_rock",flag:"gate_rock"},boss:{x:23,y:2,id:"riff",flag:"boss_rock"}},tower:{name:"Turm der Stille",theme:"static",rows:["##########################","#,..................#....#","#,...TTTTTT......T..#....#","#...TT....,......T..#....#","#...TT~....TTT...........#","#.....~~.........TT.#....#","#,..,T.T...~~.....T,#....#","#........T~~~.TT..,.######","#,...TTTTTT...TT.......T.#","#....TT~~~..T.,,.T....TT.#","#...TTT~~~~T....TT,~~~,..#","#..TTT,..TTT....,.T~..T.T#","#.......TTT.TT........,..#","#........................#","#.....,..,.......,.......#","##########################"],enc:["schemen","stoersignal","kreischer","antspin","rausritter","zyklop"],rate:.075,lv:23,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:20,ay:6}],npcs:[],chests:[{id:"tower_key",x:16,y:14,kind:"key",v:"key_tower",n:1},{id:"tower_c1",x:15,y:9,kind:"item",v:"trank",n:2},{id:"tower_c2",x:16,y:4,kind:"gold",v:270}],gate:{x:20,y:4,key:"key_tower",flag:"gate_tower"},boss:{x:23,y:2,id:"rauschen",flag:"boss_tower"}}},Li={andrew:{name:"Aren",col:"#3a9bff",hair:"#5a3a1a",acc:"#ff4a4a",hp:62,hpg:16,sp:10,spg:3,atk:12,atkg:3.2,def:6,defg:2.2,mag:4,magg:1,spd:7,spdg:.6,skills:["wucht","rund"],ip:"ip_andrew",role:"Schwertkämpfer"},marco:{name:"Silas",col:"#9a4cff",hair:"#e8c84a",acc:"#ff5ad0",hp:42,hpg:10,sp:24,spg:6,atk:6,atkg:1.6,def:4,defg:1.4,mag:13,magg:3.4,spd:8,spdg:.7,skills:["funke","welle"],ip:"ip_marco",role:"Magier"},teresa:{name:"Lyra",col:"#2fc98c",hair:"#ff5a8a",acc:"#fff04a",hp:50,hpg:12,sp:22,spg:5.5,atk:8,atkg:2,def:5,defg:1.8,mag:10,magg:3,spd:6,spdg:.6,skills:["heilton","chor"],ip:"ip_teresa",role:"Heilerin"},rico:{name:"Fenn",col:"#ff9a2a",hair:"#2a2a3a",acc:"#35e0ff",hp:52,hpg:13,sp:16,spg:4,atk:11,atkg:2.8,def:5,defg:1.8,mag:6,magg:1.6,spd:11,spdg:.9,skills:["doppel","streu"],ip:"ip_rico",role:"Schütze"},andy:{name:"Borin",col:"#d04a4a",hair:"#8a8a96",acc:"#ffd24a",hp:80,hpg:20,sp:8,spg:2,atk:10,atkg:2.6,def:9,defg:3,mag:3,magg:.8,spd:4,spdg:.4,skills:["schild","bollwerk"],ip:"ip_andy",role:"Wächter"}},id=[["boss_rap","teresa",'Eine junge Frau mit silbernem Haar wartet an der Quelle. "Ich bin Lyra, Priesterin der Quelle. Ich habe gespürt, wie das Echo der Gruft verstummt ist. Nehmt mich mit, eure Wunden brauchen Licht."'],["boss_schlager","rico",'Ein Bogenschütze lehnt am Tor und spannt die Sehne. "Fenn. Jäger aus dem Rosenhain. Seraphine hat meine Heimat in Dornen gehüllt. Ich schulde euch einen Pfeil, oder hundert."'],["boss_xmas","andy",'Ein hünenhafter Wächter tritt aus dem Schatten, den Schild voller Reif. "Borin. Ich hielt die Frostgrotte, bis Kryos mich vertrieb. Mein Schild gehört jetzt euch."']],lr={wucht:{name:"Wuchtschlag",sp:4,kind:"phys",mult:1.9,all:!1},rund:{name:"Rundumschlag",sp:8,kind:"phys",mult:1.15,all:!0},funke:{name:"Blitzfunke",sp:4,kind:"mag",mult:2.2,all:!1},welle:{name:"Ätherwelle",sp:9,kind:"mag",mult:1.35,all:!0},heilton:{name:"Heillicht",sp:4,kind:"heal",mult:3.2,all:!1},chor:{name:"Segenskreis",sp:9,kind:"heal",mult:1.8,all:!0},doppel:{name:"Doppelschuss",sp:5,kind:"phys",mult:1.15,all:!1,hits:2},streu:{name:"Streufeuer",sp:8,kind:"phys",mult:1.05,all:!0},schild:{name:"Schildschlag",sp:3,kind:"phys",mult:1.5,all:!1},bollwerk:{name:"Bollwerk",sp:7,kind:"guard",mult:0,all:!0}},ho={ip_andrew:{name:"Sternenhieb",ip:40,kind:"phys",mult:3.4,all:!1},ip_marco:{name:"Supernova",ip:60,kind:"mag",mult:2.5,all:!0},ip_teresa:{name:"Lebenshymne",ip:50,kind:"heal",mult:99,all:!0},ip_rico:{name:"Salvenfeuer",ip:50,kind:"phys",mult:2.4,all:!0},ip_andy:{name:"Titanenschlag",ip:40,kind:"phys",mult:4.2,all:!1}},St={trank:{name:"Trank",price:20,desc:"Heilt 70 LP"},aether:{name:"Äthertropfen",price:60,desc:"Gibt 20 SP"},weck:{name:"Lebensfeder",price:120,desc:"Belebt einen Helden"}},sd={key_rap:"Echo-Schlüssel",key_schlager:"Rosen-Schlüssel",key_xmas:"Frost-Schlüssel",key_rock:"Glut-Schlüssel",key_tower:"Stille-Schlüssel"},jh={beatbandit:{name:"Moospanda",lv:1,hpm:1,atkm:1,defm:1,dir:"cute",model:"Panda",tint:"",h:1},reimruepel:{name:"Wildeber",lv:2,hpm:1,atkm:1.1,defm:.9,dir:"cute",model:"Pig",tint:"",h:1},bassgolem:{name:"Höhlenyeti",lv:3,hpm:1.5,atkm:1,defm:1.4,dir:"cute",model:"Yeti",tint:"#6a7ad8",h:1.35},boombox:{name:"Dornkaktus",lv:1,hpm:1.2,atkm:1.1,defm:1,dir:"cute",model:"Cactus",tint:"",h:1},graffiti:{name:"Irrlicht",lv:2,hpm:.8,atkm:1.2,defm:.8,dir:"cute",model:"Ghost",tint:"#ff9ad8",h:1},mikspin:{name:"Grottenpinguin",lv:3,hpm:1,atkm:1.1,defm:1,dir:"cute",model:"Penguin",tint:"#9a9aff",h:1},gecko:{name:"Rosenkrabbe",lv:7,hpm:1.1,atkm:1,defm:1.1,dir:"cute",model:"Crab",tint:"#ff7ac8",h:1},schleim:{name:"Honigschleim",lv:8,hpm:1.3,atkm:.9,defm:1.1,dir:"monsters4",model:"Slime",tint:"#ffe36b",h:1.05},aal:{name:"Sporenpilz",lv:9,hpm:1.1,atkm:1.2,defm:1,dir:"cute",model:"Mushroom",tint:"",h:1},disco:{name:"Dornbiene",lv:7,hpm:.8,atkm:1.2,defm:.8,dir:"cute",model:"Bee",tint:"#ff9ae8",h:1},herz:{name:"Blütenhirsch",lv:8,hpm:1.3,atkm:1.1,defm:1.3,dir:"cute",model:"Deer",tint:"#ffb0c0",h:1.1},zuckerg:{name:"Feenküken",lv:9,hpm:.9,atkm:1.2,defm:.9,dir:"cute",model:"Chicken",tint:"#ffc0e8",h:.9},geist:{name:"Frostgeist",lv:12,hpm:.9,atkm:1.1,defm:.9,dir:"cute",model:"Ghost",tint:"#bfe8ff",h:1},lebkuchen:{name:"Eiswurzler",lv:13,hpm:1.5,atkm:1,defm:1.4,dir:"cute",model:"Tree",tint:"",h:1.2},schneemann:{name:"Schneeyeti",lv:14,hpm:1.2,atkm:1.2,defm:1,dir:"cute",model:"Yeti",tint:"",h:1.3},eisratte:{name:"Eisfledermaus",lv:12,hpm:1,atkm:1.2,defm:.9,dir:"cute",model:"Bat",tint:"#a0d8ff",h:1},eisspin:{name:"Frostrentier",lv:13,hpm:1,atkm:1.2,defm:1,dir:"cute",model:"Deer",tint:"#d8c8a0",h:1.1},zwerg:{name:"Eiskobold",lv:14,hpm:1.1,atkm:1.2,defm:1,dir:"cute",model:"Demon",tint:"#c03a3a",h:1},gargoyle:{name:"Glutdämon",lv:17,hpm:1.1,atkm:1.1,defm:1.1,dir:"cute",model:"GreenDemon",tint:"",h:1.1},mole:{name:"Lavazyklop",lv:18,hpm:1.3,atkm:1.1,defm:1.1,dir:"cute",model:"Cyclops",tint:"",h:1.2},verstaerker:{name:"Aschenkrieger",lv:19,hpm:1.5,atkm:1.2,defm:1.3,dir:"monsters4",model:"Skeleton",tint:"",h:1.4},rifffled:{name:"Rußfledermaus",lv:17,hpm:.8,atkm:1.3,defm:.8,dir:"cute",model:"Bat",tint:"#5a4a6a",h:1},daemon:{name:"Flammenschädel",lv:18,hpm:1.3,atkm:1.3,defm:1,dir:"cute",model:"Skull",tint:"#ff9a5a",h:1},roadie:{name:"Magmakraken",lv:19,hpm:.9,atkm:1.2,defm:.9,dir:"cute",model:"Cthulhu",tint:"#7a5ad8",h:1.2},schemen:{name:"Leerwandler",lv:22,hpm:1,atkm:1.1,defm:1,dir:"cute",model:"Alien",tint:"#c0c0d0",h:1},stoersignal:{name:"Schattenseher",lv:23,hpm:1.3,atkm:1.1,defm:1.1,dir:"cute",model:"Alien_Tall",tint:"#7cff9a",h:1.2},kreischer:{name:"Stillschreier",lv:24,hpm:1.5,atkm:1.2,defm:1.2,dir:"cute",model:"Bat",tint:"#ffffff",h:1.1},antspin:{name:"Nichtsmotte",lv:22,hpm:1,atkm:1.3,defm:1,dir:"cute",model:"Bee",tint:"#7cff9a",h:1},rausritter:{name:"Stilleritter",lv:23,hpm:1.3,atkm:1.2,defm:1.3,dir:"monsters4",model:"Skeleton",tint:"#c0c8d8",h:1.5},zyklop:{name:"Leerenzyklop",lv:24,hpm:1.5,atkm:1.2,defm:1.2,dir:"cute",model:"Cyclops",tint:"#7cffb0",h:1.3},mcdroehn:{name:"Vorgal der Grollende",lv:5,hpm:4.2,atkm:1.15,defm:1.2,boss:!0,spec:["Grollbeben",.85,!0],dir:"cute",model:"Demon",tint:"#ff4a6a",h:2.4},koenigin:{name:"Seraphine, die Dornenkönigin",lv:10,hpm:6,atkm:1.4,defm:1.2,boss:!0,spec:["Dornenregen",.85,!0],dir:"cute",model:"YellowDragon",tint:"#ff6ac0",h:2.6},frostmod:{name:"Kryos, der Eisfürst",lv:15,hpm:6.5,atkm:1.55,defm:1.2,boss:!0,spec:["Eiszeit",.85,!0],dir:"cute",model:"Yeti",tint:"#6ad0ff",h:2.8},riff:{name:"Pyrax, der Glutdrache",lv:20,hpm:7,atkm:1.7,defm:1.2,boss:!0,spec:["Feuersturm",.85,!0],dir:"monsters4",model:"Dragon",tint:"#ff5030",h:3.4},rauschen:{name:"Nihl, die Stille",lv:26,hpm:9,atkm:1.85,defm:1.25,boss:!0,spec:["Totenstille",.9,!0],dir:"cute",model:"Cthulhu",tint:"#e8e8f8",h:3.4}},rd={town:["#3f8f4a","#3a8644","#2a5a6a","#1f6a35","#ffd24a",0],rap:["#2a2438","#2f2a42","#14101e","#0c0a14","#ff4a6a",1],schlager:["#e8a3c8","#e29abf","#a04a80","#ffd24a","#ff3aa0",2],xmas:["#cfe8f6","#c2dff0","#4a7a9a","#2f8a4a","#ff3a3a",0],rock:["#3a2a28","#42302c","#1a0f0e","#6a3a2a","#ff7a1a",3],static:["#2a2e36","#30343e","#10121a","#505868","#7cff9a",1]};Ft.hub.town=!0;Ft.lind={name:"Lindmark",theme:"town",town:!0,enc:[],rate:0,lv:1,npcs:[{x:7,y:3,kind:"inn",name:"Wirtin Elsbeth"},{x:17,y:3,kind:"smith",name:"Schmied Torvald"},{x:20,y:7,kind:"trader",name:"Händler Quinn"},{x:5,y:7,kind:"sage",name:"Kapselgelehrte Mirela"},{x:16,y:10,kind:"kid2",name:"Nele"}],chests:[{id:"lind_c1",x:2,y:1,kind:"item",v:"frucht",n:1}],boss:{},portals:[{x:12,y:12,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:36,ay:13}],rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~","~#..T.hhh.......hhh...T.#~","~#....HSH...T...HDH.....#~","~#.....p.........p......#~","~#.....ppppppppppp..,...#~","~#..hhh....ppp.....hhh..#~","~#..HDH....ppp.....HSH..#~","~#...p.....ppp......p...#~","~#...ppppppppppppppppp..#~","~#T........ppp........T.#~","~#..,......ppp....,.....#~","~#TT.......ppp.......TT.#~","~..........ppp...........~","~~~~~~~~~~~~~~~~~~~~~~~~~~"]};Ft.welt.portals.push({x:36,y:12,to:"lind",req:"boss_rap",label:"Lindmark",kind:"town",ax:12,ay:11});Ft.rap.chests.push({id:"cap_flamm",x:13,y:12,kind:"capsule",v:"flamm"});Ft.schlager.chests.push({id:"cap_moos",x:8,y:7,kind:"capsule",v:"moos"});Ft.xmas.chests.push({id:"cap_frost",x:5,y:4,kind:"capsule",v:"frost"});Ft.rock.chests.push({id:"cap_summ",x:3,y:2,kind:"capsule",v:"summ"});Ft.tower.chests.push({id:"cap_drak",x:6,y:6,kind:"capsule",v:"drak"});Object.assign(St,{grosstrank:{name:"Großtrank",price:80,desc:"Heilt 250 LP"},aetherflask:{name:"Ätherflasche",price:180,desc:"Gibt 60 SP"},bombe:{name:"Glutbombe",price:90,desc:"Trifft alle Gegner",use:"enemy"},frucht:{name:"Sphärenfrucht",price:400,desc:"Lässt einen Kapselgeist sich entwickeln",use:"capsule"}});const ic={hub:["trank","aether","weck"],lind:["trank","grosstrank","aether","aetherflask","weck","bombe","frucht"]},cr={trank:25,grosstrank:70,aether:50,aetherflask:140,weck:90,bombe:60},wn={flamm:{elem:"Feuer",col:"#ff8a3a",hp:40,hpg:11,atk:10,atkg:2.6,mag:9,magg:2.4,spd:9,spdg:.7,forms:[{name:"Flämmchen",model:"Ghost",tint:"#ffa060",h:.9},{name:"Glutgeist",model:"Ghost",tint:"#ff6a2a",h:1.25},{name:"Sonnenphönix",model:"YellowDragon",tint:"#ffb040",h:1.7}],skills:[{name:"Funkenwurf",kind:"mag",mult:1.6,all:!1},{name:"Flammenkreis",kind:"mag",mult:1.2,all:!0},{name:"Sonnensturm",kind:"mag",mult:1.9,all:!0}]},moos:{elem:"Erde",col:"#6ad05a",hp:56,hpg:15,atk:9,atkg:2.2,mag:8,magg:2.2,spd:5,spdg:.4,forms:[{name:"Moosling",model:"Slime",tint:"#7ae06a",h:.8},{name:"Moosgolem",model:"Tree",tint:"#9ad07a",h:1.4},{name:"Waldhüter",model:"Tree",tint:"#5ac05a",h:1.9}],skills:[{name:"Rankenhieb",kind:"phys",mult:1.5,all:!1},{name:"Heilmoos",kind:"heal",mult:2.2,all:!0},{name:"Erdbeben",kind:"phys",mult:1.5,all:!0}]},frost:{elem:"Wasser",col:"#6ac8ff",hp:48,hpg:13,atk:11,atkg:2.8,mag:7,magg:1.8,spd:7,spdg:.6,forms:[{name:"Frostling",model:"Penguin",tint:"#a0dcff",h:.8},{name:"Eisbär",model:"Yeti",tint:"#c0e8ff",h:1.4},{name:"Gletscherkönig",model:"Yeti",tint:"#7ab8ff",h:1.9}],skills:[{name:"Eiskralle",kind:"phys",mult:1.7,all:!1},{name:"Frosthauch",kind:"mag",mult:1.2,all:!0},{name:"Gletscherwall",kind:"guard",mult:0,all:!0}]},summ:{elem:"Wind",col:"#ffe04a",hp:38,hpg:10,atk:12,atkg:3,mag:8,magg:2,spd:13,spdg:1,forms:[{name:"Summfix",model:"Bee",tint:"#ffe070",h:.8},{name:"Sturmhornisse",model:"Bee",tint:"#ffc030",h:1.2},{name:"Himmelsfürst",model:"Bat",tint:"#ffe8a0",h:1.7}],skills:[{name:"Stachelwirbel",kind:"phys",mult:.9,all:!1,hits:2},{name:"Windklinge",kind:"phys",mult:1.15,all:!0},{name:"Orkan",kind:"phys",mult:1.6,all:!0}]},drak:{elem:"Licht",col:"#e0d0ff",hp:60,hpg:16,atk:14,atkg:3.4,mag:13,magg:3.2,spd:10,spdg:.8,forms:[{name:"Drakling",model:"YellowDragon",tint:"#f0e0ff",h:.9},{name:"Sternendrache",model:"Dragon",tint:"#d0c0ff",h:1.6},{name:"Äonenwyrm",model:"Dragon",tint:"#fff0c0",h:2.2}],skills:[{name:"Lichtatem",kind:"mag",mult:1.8,all:!1},{name:"Segenslicht",kind:"heal",mult:2.6,all:!0},{name:"Sternenfall",kind:"mag",mult:2,all:!0}]}},ad=.13,od=.38,ld=11/16,cd=[3,8,13,18,23],uo=[["beatbandit","reimruepel","bassgolem","boombox","graffiti","mikspin"],["gecko","schleim","aal","disco","herz","zuckerg"],["geist","lebkuchen","schneemann","eisratte","eisspin","zwerg"],["gargoyle","mole","verstaerker","rifffled","daemon","roadie"],["schemen","stoersignal","kreischer","antspin","rausritter","zyklop"]],hd="#T~^hHDSM",Yh=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}],Ta=["hub","welt","rap","schlager","xmas","rock","tower","lind"];function ud(r){let e=r>>>0;const t=r==null?Math.random:()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296};return{randf:t,randi:()=>Math.floor(t()*4294967296),range:(n,i)=>n+(i-n)*t(),shuffle(n){for(let i=n.length-1;i>0;i--){const s=Math.floor(t()*(i+1));[n[i],n[s]]=[n[s],n[i]]}return n}}}const Zt=Math.trunc,sc=r=>r.x+","+r.y,$h=(r,e)=>r.x===e.x&&r.y===e.y,fo=(r,e)=>Math.abs(r.x-e.x)+Math.abs(r.y-e.y);function dd(){return{party:[],inv:{trank:3,aether:1,weck:0},gold:50,gear:0,flags:{},caps:{own:{},active:null},mapId:"hub",map:Ft.hub,mw:26,mh:16,objs:[],reg:[],gp:{x:12,y:11},face:{x:0,y:1},steps:0,grace:8,playTime:0,uidN:0,roamers:[],enemies:[]}}const cn=r=>Li[r.id],wt=(r,e)=>Zt(cn(e).hp+cn(e).hpg*(e.lv-1))+r.gear*8,vi=r=>Zt(cn(r).sp+cn(r).spg*(r.lv-1));function jt(r,e,t){let n=cn(e)[t]+cn(e)[t+"g"]*(e.lv-1);return(t==="atk"||t==="def"||t==="mag")&&(n+=r.gear*3),Zt(n)}const Ui=r=>Zt(14*r+2.2*r*r);function An(r){let e=0;for(const t of r.party)e+=t.lv;return e/Math.max(1,r.party.length)}function Sa(r,e,t=1){const n={id:e,name:Li[e].name,lv:t,exp:0,hp:1,sp:1,ip:0};return n.hp=wt(r,n),n.sp=vi(n),n}const zs=r=>++r.uidN,hr=r=>120*(r.gear+1)*(r.gear+1);function fd(r,e){const t=jh[e],n=t.lv,i=.62+.13*r.party.length,s=Math.min(1,Math.max(.6,.5+.1*An(r))),a=Zt((18+14*n)*1.4*t.hpm*i*s),o=!!t.boss;return{id:e,name:t.name,lv:n,hp:a,mhp:a,atk:(6+2.6*n)*t.atkm*s,def:(2+1.5*n)*t.defm,spd:5+.5*n,boss:o,spec:t.spec||[],exp:Zt((4+3*n)*(o?5:1)*(1+(t.hpm-1)*.3)),gold:Zt((3+2*n)*(o?6:1)),turn:0,dead:!1}}const ii=(r,e,t,n=1)=>Math.max(1,Zt((e*1.7-t*.7)*n*r.range(.9,1.1))),rc=(r,e,t,n=1)=>Math.max(1,Zt((e*1.7-t*.35)*n*r.range(.9,1.1))),zn=r=>r.party.filter(e=>e.hp>0),si=r=>r.enemies.filter(e=>e.hp>0),pd=(r,e)=>r.party.some(t=>t.id===e);function ac(r,e,t){return e==="weck"?t.hp>0?!1:(t.hp=Math.max(1,Zt(wt(r,t)/2)),!0):t.hp<=0?!1:e==="trank"||e==="grosstrank"?t.hp>=wt(r,t)?!1:(t.hp=Math.min(wt(r,t),t.hp+(e==="trank"?70:250)),!0):e==="aether"||e==="aetherflask"?t.sp>=vi(t)?!1:(t.sp=Math.min(vi(t),t.sp+(e==="aether"?20:60)),!0):!1}const ur=r=>St[r]?.use||"hero",er=r=>wn[r.id],md=r=>er(r).forms[r.form],Ut=r=>md(r).name,Qn=r=>Zt(er(r).hp+er(r).hpg*(r.lv-1))*(1+r.form*.25)|0,oc=r=>Zt((2+1.6*r.lv)*(1+r.form*.15)),yi=(r,e)=>Zt((er(r)[e]+er(r)[e+"g"]*(r.lv-1))*(1+r.form*.15));function lc(r,e=1){const t={id:r,lv:e,exp:0,form:0,hp:1};return t.hp=Qn(t),t}const gd=r=>r.caps&&r.caps.active&&r.caps.own[r.caps.active]||null,jr=r=>r.form<2&&r.lv>=(r.form===0?8:16);function cc(r,e){const t=[];for(r.exp+=e;r.exp>=Ui(r.lv)&&r.lv<40;){r.exp-=Ui(r.lv);const n=Qn(r);r.lv+=1,r.hp>0&&(r.hp+=Qn(r)-n),t.push(r.lv)}return t}function _d(r){return jr(r)?(r.form+=1,r.hp=Qn(r),!0):!1}function ba(r){for(const e of r.party)e.hp=wt(r,e),e.sp=vi(e);for(const e in r.caps.own){const t=r.caps.own[e];t.hp=Qn(t)}}const vd=r=>6+4*Math.round(An(r));function Kh(r,e,t){return e<0||t<0||e>=r.mw||t>=r.mh?"#":r.map.rows[t][e]}const ml=(r,e)=>hd.includes(Kh(r,e.x,e.y));function da(r,e){for(const t of r.objs)if(t.x===e.x&&t.y===e.y)return t;return null}function gl(r,e){return r.map.portals.some(t=>t.x===e.x&&t.y===e.y)}function Hs(r){let e=0;for(const t of["boss_rap","boss_schlager","boss_xmas","boss_rock"])r.flags[t]&&e++;return e}const ia=r=>Math.min(4,Math.max(0,Hs(r))),_l=r=>!!r.map.world,po=(r,e)=>e.req===""||!!r.flags[e.req];function xd(r,e,t){let n=9999,i="ow_town";for(const s of r.portals){const a=Math.abs(s.x-e)+Math.abs(s.y-t);if(a<n){n=a;const o=s.to;i="ow_"+(Ft[o].town?"town":o==="tower"?"static":o)}}return i}function dr(r,e,t){return _l(r)?r.reg[t][e]:r.map.theme}function Zh(r,e,t,n){r.mapId=t,r.map=Ft[t];const i=r.map;r.mh=i.rows.length,r.mw=i.rows[0].length,r.objs=[];for(const a of i.npcs)r.objs.push({t:"npc",x:a.x,y:a.y,d:a,uid:zs(r)});for(const a of i.chests)r.flags[a.id]||r.objs.push({t:"chest",x:a.x,y:a.y,d:a,uid:zs(r)});const s=i.boss;if(s&&s.id&&!r.flags[s.flag]&&r.objs.push({t:"boss",x:s.x,y:s.y,d:s,uid:zs(r)}),i.gate&&!r.flags[i.gate.flag]&&r.objs.push({t:"gate",x:i.gate.x,y:i.gate.y,d:i.gate,uid:zs(r)}),r.reg=[],i.world)for(let a=0;a<r.mh;a++){const o=[];for(let l=0;l<r.mw;l++)o.push(xd(i,l,a));r.reg.push(o)}r.gp={x:n.x,y:n.y},r.ppos={x:n.x,y:n.y},r.moving=!1,r.grace=8,Md(r,e)}function yd(r,e,t=n=>ml(r,n)){const n=new Map([[sc(e),e]]),i=[e];for(;i.length;){const s=i.shift();for(const a of Yh){const o={x:s.x+a.x,y:s.y+a.y},l=sc(o);!n.has(l)&&!t(o)&&(n.set(l,o),i.push(o))}}return n}function Md(r,e){r.roamers=[];let t=r.map.enc,n=6;if(_l(r)&&(t=uo[ia(r)],n=12),!t.length)return;const i=[];for(const s of yd(r,r.gp).values())fo(s,r.gp)<7||da(r,s)||gl(r,s)||r.map.gate&&s.x>r.map.gate.x||i.push(s);e.shuffle(i);for(let s=0;s<Math.min(n,i.length);s++){const a=i[s],o={x:a.x,y:a.y};r.roamers.push({uid:zs(r),id:t[e.randi()%t.length],g:{...a},pos:{...o},from:{...o},to:{...o},t:1,wait:e.randf()*.8,stun:0})}}function Td(r,e,t){if(ml(r,e)||da(r,e)||gl(r,e)||r.map.gate&&e.x>r.map.gate.x&&!r.flags[r.map.gate.flag])return!1;for(const n of r.roamers)if(n!==t&&$h(n.g,e))return!1;return!0}function Sd(r,e,t){const n=r.moving?r.gtarget:r.gp,i=t.g,s=fo(n,i),a=[];for(const l of Yh){const c={x:i.x+l.x,y:i.y+l.y};Td(r,c,t)&&a.push(c)}if(!a.length)return;let o=a[e.randi()%a.length];if(s<=6&&e.randf()<.85){let l=9999;for(const c of a){const h=fo(n,c);h<l&&(l=h,o=c)}}else if(e.randf()<.5)return;t.from={...t.pos},t.to={x:o.x,y:o.y},t.g=o,t.t=0}function bd(r,e,t){for(const n of r.roamers)if(n.stun>0&&(n.stun-=t),n.t<1?(n.t=Math.min(1,n.t+t/od),n.pos={x:n.from.x+(n.to.x-n.from.x)*n.t,y:n.from.y+(n.to.y-n.from.y)*n.t}):(n.wait-=t,n.wait<=0&&n.stun<=0&&(n.wait=e.range(.2,.6),Sd(r,e,n))),n.stun<=0&&!r.moving&&Math.hypot(n.pos.x-r.ppos.x,n.pos.y-r.ppos.y)<ld)return n;return null}function wd(r,e){const t=_l(r)?cd[ia(r)]:r.map.lv??An(r),n=Math.min(3,Math.max(.6,1+.3*(t-An(r))));return Zt(e*n)}function Ed(r,e,t){const n=[];for(e.exp+=t;e.exp>=Ui(e.lv)&&e.lv<40;){e.exp-=Ui(e.lv);const i=wt(r,e);e.lv+=1,e.hp+=wt(r,e)-i,e.sp=Math.min(vi(e),e.sp+4),n.push(e.lv)}return n}const hc=r=>r==="hub"?{x:12,y:12}:r==="lind"?{x:12,y:11}:r==="welt"?{x:20,y:22}:{x:2,y:14},bt={TITLE:0,WORLD:1,BATTLE:2},Ys="anmachaQuest_save",Ad={mcdroehn:["Vorgal: Tausend Jahre in Ketten ... und die ersten, die mich wecken, sind Kinder mit Holzschwertern?","Vorgal: Die Gruft hallt nur noch von meinem Groll. Gleich auch von euren Schreien!"],koenigin:["Seraphine: Wie hübsch ihr seid. Wie Rosen kurz vor dem Welken.","Seraphine: Bleibt bei mir. Für immer. Meine Dornen halten euch fest!"],frostmod:["Kryos: Ihr bringt Wärme in meine Halle. Wie ungezogen.","Kryos: Alles Leben ist nur Lärm vor der Stille. Ich lasse euch erstarren, damit ihr es versteht."],riff:["Pyrax: *GRRRAAAH* Kleine Funken wagen sich in meinen Schlund?","Pyrax: Ich habe Städte verbrannt, bevor eure Ahnen sprechen konnten. BRENNT!"],rauschen:["Nihl: ... Endlich. Die Letzten, die noch Stimmen haben.","Nihl: Die Vier waren nur meine Hände. Ich bin das Schweigen zwischen den Sternen. Werdet still, Kinder Aetherions."]},Rd={mcdroehn:["Vorgal zerfällt zu grauer Asche. Ein Sphärenkristall leuchtet auf und erfüllt die Gruft mit einem klaren Ton.","Auf der Weltkarte öffnet sich der Weg zum Rosenhain. In Hafenau wartet jemand auf euch."],koenigin:["Die Dornen welken, Seraphine löst sich in Blütenblätter auf. Der zweite Kristall erwacht!","Auf der Weltkarte öffnet sich die Frostgrotte. In Hafenau wartet jemand auf euch."],frostmod:["Kryos zerspringt wie Glas. Tauwasser tropft von der Decke. Der dritte Kristall erwacht!","Auf der Weltkarte öffnet sich der Glutschlund. In Hafenau wartet jemand auf euch."],riff:["Pyrax stürzt in die Lava, die Flammen erlöschen. Der vierte Kristall erwacht!","Im Norden erhebt sich der Turm der Stille. Der Weg zu Nihl ist frei."]},Cd=[{x:12,y:8,yaw:.6,dist:14,pitch:.55,t:["Vor tausend Jahren sangen vier Sphärenkristalle die Welt Aetherion ins Gleichgewicht."]},{x:12,y:9,yaw:-.4,dist:10,pitch:.42,t:["Vier ihrer Hüter verrieten sie. Man nannte sie die Verfemten und versiegelte sie im Herzen der Welt."]},{x:12,y:10,yaw:.2,dist:7,pitch:.3,t:["Doch nun breitet sich eine Stille aus, die selbst die Vögel verstummen lässt. Die Siegel brechen."]},{x:12,y:12,yaw:0,dist:4.6,pitch:.2,t:["In der Hafenstadt Hafenau erwacht der junge Schwertkämpfer Aren aus einem Traum von Sternen, die erlöschen.","Sein bester Freund Silas, ein Magier mit mehr Mut als Vorsicht, wartet schon vor der Tür.","Älteste Ysolde hat nach euch gerufen. Sie steht in der Mitte der Stadt."]}];class Pd{constructor(e,t,n={}){this.ui=e,this.view=t,this.rng=n.rng||ud(),this.store=n.store||null,this.S=dd(),this.mode=bt.TITLE,this.busy=!1,this.autoplay=!1,this.autoN=0,this.curHero=-1,this.dirStack=[],this.dpad=null,this.stepflip=0,this.mt=0,this.debug=!!n.debug,this.audio=n.audio||null,this.musicOverride=null,this.battleMusic="battle"}sfx(e){this.audio?.sfx(e)}pickMusic(){if(!this.audio)return;const e=this.S;let t=this.musicOverride;t||(this.mode===bt.TITLE?t="title":this.mode===bt.BATTLE?t=this.battleMusic:e.map.world?t="world":e.map.town?t=e.flags.boss_rauschen?"ending":"town":t=e.map.theme==="static"?"tower":e.map.theme),this.audio.music(t)}async cutscene(e,t){if(!(this.autoplay||!this.view)){t&&(this.musicOverride=t),this.ui.letterbox?.(!0);for(const n of e)this.view.cine={x:n.x+.5,z:n.y+.5,h:n.h??.9,yaw:n.yaw,dist:n.dist,pitch:n.pitch},n.wait&&await this.wait(n.wait),await this.say(n.t);this.view.cine=null,this.ui.letterbox?.(!1),t&&(this.musicOverride=null)}}async say(e){this.autoplay||(this.ui.setTouch(!1),await this.ui.say(e),this.ui.setTouch(this.mode===bt.WORLD&&!this.busy))}async choose(e,t=!1,n=[]){if(this.autoplay){await this.tick();for(let i=0;i<e.length;i++)if(!n[i])return i;return 0}return this.ui.choose(e,t,n,this.mode)}async chooseCross(e){if(this.autoplay){await this.tick(),this.autoN++;let t=[0,1,2,0,3,4,0,2][this.autoN%8];return e[t]&&(t=0),t}return this.ui.chooseCross(e)}async banner(e,t=1.3){this.autoplay||await this.ui.banner(e,t)}async bmsg(e,t=.7){this.autoplay||(this.ui.msg(e),t>0&&await this.wait(t))}tick(){return new Promise(e=>setTimeout(e,0))}wait(e){return this.autoplay?this.tick():new Promise(t=>setTimeout(t,e*1e3))}async fade(e,t=.22){if(this.autoplay){this.ui.fadeNow(e);return}await this.ui.fade(e,t)}setTouch(e){this.ui.setTouch(e)}hasSave(){return!!(this.store&&this.store.has(Ys))}saveGame(){if(!this.store)return;const e=this.S,t=e.party.map(n=>({id:n.id,name:n.name,lv:n.lv,exp:n.exp,hp:n.hp,sp:n.sp,ip:n.ip}));this.store.set(Ys,JSON.stringify({v:4,party:t,inv:e.inv,gold:e.gold,gear:e.gear,flags:e.flags,caps:e.caps,map:e.mapId,gp:e.gp,t:e.playTime}))}loadGame(){if(!this.store)return!1;let e=null;try{e=JSON.parse(this.store.get(Ys))}catch{return!1}if(!e||!Array.isArray(e.party)||!e.party.length||!Ft[e.map])return!1;const t=this.S;if(t.party=e.party.filter(i=>Li[i.id]).map(i=>({id:i.id,name:Li[i.id].name,lv:i.lv|0||1,exp:i.exp|0,hp:i.hp|0,sp:i.sp|0,ip:0})),!t.party.length)return!1;if(t.inv=Object.assign({trank:0,aether:0,weck:0},e.inv||{}),t.gold=e.gold|0,t.gear=e.gear|0,t.flags=e.flags||{},t.caps={own:{},active:null},e.caps&&e.caps.own)for(const i in e.caps.own){const s=e.caps.own[i];if(!wn[i]||!s)continue;const a=lc(i,Math.max(1,s.lv|0));a.exp=s.exp|0,a.form=Math.min(2,Math.max(0,s.form|0)),a.hp=Math.min(Qn(a),Math.max(0,s.hp|0)),t.caps.own[i]=a}e.caps&&t.caps.own[e.caps.active]&&(t.caps.active=e.caps.active),t.playTime=+e.t||0,this.mode=bt.WORLD;const n=e.gp&&Kh({...t,map:Ft[e.map],mw:Ft[e.map].rows[0].length,mh:Ft[e.map].rows.length},e.gp.x,e.gp.y)!=="#"?e.gp:hc(e.map);return this.loadMap(e.map,n),!0}loadMap(e,t){Zh(this.S,this.rng,e,t),this.moving=!1,this.view.mapChanged?.()}async showTitle(){this.mode=bt.TITLE,this.busy=!0,this.setTouch(!1),this.ui.msg(""),this.view.setMode?.(bt.TITLE);const e=this.hasSave();for(;;){const t=e?["Fortsetzen","Neues Spiel"]:["Neues Spiel"],n=await this.choose(t);if(!e&&n===0||e&&n===1){await this.newGame();return}if(this.loadGame()){await this.startWorldAfterLoad();return}}}async newGame(){const e=this.S;e.party=[Sa(e,"andrew"),Sa(e,"marco")],e.inv={trank:5,aether:2,weck:0},e.gold=100,e.gear=0,e.flags={},e.caps={own:{},active:null},e.playTime=0,await this.fade(1,.25),this.mode=bt.WORLD,this.loadMap("hub",{x:12,y:12}),await this.view.ready?.(),await this.fade(0),this.busy=!0,await this.cutscene(Cd,"intro"),this.view&&(this.view.camYawT=this.view.camYaw=0),this.busy=!1,this.setTouch(!0)}async startWorldAfterLoad(){await this.fade(1,.25),this.mode=bt.WORLD,await this.view.ready?.(),this.busy=!1,this.setTouch(!0),await this.fade(0)}readDir(){const e=this.dpad||(this.dirStack.length?this.dirStack[this.dirStack.length-1]:null);if(!e)return null;let t={x:e.x,y:e.y};const n=this.view?.camQuad?.()||0;for(let i=0;i<n;i++)t={x:t.y,y:-t.x};return t}pressDir(e,t){this.dirStack=this.dirStack.filter(n=>!$h(n,e)),t&&this.dirStack.push(e)}clearDirs(){this.dirStack=[],this.dpad=null}idle(){return!this.busy&&!this.ui.isChoosing()&&!this.ui.isTalking()}update(e){const t=this.S;if(this.pickMusic(),this.mode===bt.WORLD){if(t.playTime+=e,!this.ui.touchVisible()&&this.dpad&&(this.dpad=null),t.moving){for(this.mt+=e/ad;t.moving&&this.mt>=1;){const n=this.mt-1;if(t.moving=!1,t.ppos={...t.gtarget},t.gp={...t.gtarget},this.onStep(),!this.idle())break;const i=this.readDir();i&&(this.tryStep(i),t.moving&&(this.mt=n))}t.moving&&(t.ppos={x:t.mfrom.x+(t.gtarget.x-t.mfrom.x)*this.mt,y:t.mfrom.y+(t.gtarget.y-t.mfrom.y)*this.mt})}else if(this.idle()){const n=this.readDir();n&&this.tryStep(n)}if(this.idle()){const n=bd(t,this.rng,e);n&&this.startRoamerFight(n)}}}tryStep(e){const t=this.S;t.face={...e};const n={x:t.gp.x+e.x,y:t.gp.y+e.y};if(ml(t,n))return;const i=da(t,n);if(i){this.interact(i);return}t.moving=!0,t.gtarget=n,t.mfrom={...t.gp},this.mt=0,this.stepflip=1-this.stepflip}onStep(){const e=this.S;e.steps++;for(const t of e.map.portals)if(t.x===e.gp.x&&t.y===e.gp.y){this.usePortal(t);return}e.map.rate>0&&(e.grace-=1,e.grace<=0&&this.rng.randf()<e.map.rate*.4&&this.startEncounter())}async usePortal(e){const t=this.S;if(this.busy=!0,this.setTouch(!1),e.req!==""&&!t.flags[e.req]){await this.say([`Der Zugang nach "${e.label}" ist versiegelt. Befreie zuerst das vorherige Reich.`]),t.gp={x:t.gp.x-t.face.x,y:t.gp.y-t.face.y},t.ppos={...t.gp},this.busy=!1,this.setTouch(!0);return}await this.fade(1);const n=e.to;if(this.loadMap(n,{x:e.ax,y:e.ay}),Ft[n].town&&this.saveGame(),await this.view.ready?.(),await this.fade(0),n==="hub")for(const i of id)t.flags[i[0]]&&!pd(t,i[1])&&(await this.say([i[2],`${Li[i[1]].name} schließt sich euch an.`]),t.party.push(Sa(t,i[1],Math.max(1,Math.trunc(An(t))))),this.view.partyChanged?.());this.busy=!0,await this.banner(t.map.world||t.map.town?t.map.name:`${t.map.name}  (Stufe ${t.map.lv})`),this.busy=!1,this.setTouch(!0)}async interact(e){switch(this.busy=!0,this.setTouch(!1),this.clearDirs(),e.t){case"chest":await this.openChest(e);break;case"npc":await this.talkNpc(e.d);break;case"boss":await this.fightBoss(e);break;case"gate":await this.openGate(e);break}this.busy=!1,this.setTouch(this.mode===bt.WORLD)}removeObj(e){const t=this.S.objs.indexOf(e);t>=0&&this.S.objs.splice(t,1)}async openGate(e){const t=e.d,n=this.S;n.flags[t.key]?(n.flags[t.flag]=!0,this.removeObj(e),this.view.fxWorld?.("gate",e),this.sfx("door"),await this.say(["Der Schlüssel passt! Das Tor öffnet sich knarrend."])):await this.say(["Das Tor zur Halle ist verriegelt. Irgendwo in diesem Reich liegt der Schlüssel in einer Truhe."])}async openChest(e){const t=e.d,n=this.S;if(n.flags[t.id]=!0,this.removeObj(e),this.view.fxWorld?.("chest",e),this.sfx("chest"),t.kind==="gold")n.gold+=t.v,await this.say([`Truhe geöffnet: ${t.v} Münzen!`]);else if(t.kind==="capsule"){const i=lc(t.v,Math.max(1,Math.trunc(An(n))-1));n.caps.own[t.v]=i,n.caps.active||(n.caps.active=t.v),this.sfx("levelup"),await this.say([`In der Truhe pulsiert eine leuchtende Kapsel ... Ein Kapselgeist erwacht: ${Ut(i)} (${wn[t.v].elem})!`,n.caps.active===t.v?`${Ut(i)} begleitet euch ab jetzt und kämpft von selbst mit. Im Menü unter „Kapselgeist“ kannst du ihn füttern.`:"Im Menü unter „Kapselgeist“ kannst du wählen, wer euch begleitet."])}else t.kind==="key"?(n.flags[t.v]=!0,await this.say([`Truhe geöffnet: ${sd[t.v]} gefunden! Damit lässt sich das Tor zur Halle öffnen.`])):(n.inv[t.v]=(n.inv[t.v]||0)+t.n,await this.say([`Truhe geöffnet: ${St[t.v].name} x${t.n}!`]))}async talkNpc(e){const t=this.S;switch(e.kind){case"elder":{const n=Hs(t);t.flags.boss_rauschen?await this.say(["Ysolde: Die Stille ist gebrochen. Hörst du die Möwen? Aetherion singt wieder, Aren."]):n===0?await this.say(["Ysolde: Aren, Silas. Die Siegel der Verfemten sind gebrochen. Vier Reiche sind in ihrer Hand, und ihre Kristalle schweigen.","Verlasst die Stadt nach Süden. Im Westen liegt die Echogruft, dort tobt Vorgal der Grollende.","Jedes Reich verbirgt einen Schlüssel zur Halle seines Herrn. Werdet stärker, und vergesst die Tränke bei Mara nicht!"]):n<4?await this.say([`Ysolde: ${n} von 4 Kristallen singen wieder. Der nächste Weg öffnet sich auf der Weltkarte, sobald der letzte Verfemte gefallen ist.`,"Reihenfolge: Echogruft, Rosenhain, Frostgrotte, Glutschlund."]):await this.say(["Ysolde: Alle vier Kristalle sind erwacht! Im Norden ragt der Turm der Stille auf.","Nihl selbst wartet dort. Geht gut gerüstet, und kommt zurück."]);break}case"shop":await this.shop(ic.hub,"Mara: Frische Ware aus aller Welt! Was darf's sein?",6);break;case"trader":await this.shop(ic.lind,"Quinn: Seltene Ware aus allen vier Reichen. Sphärenfrüchte habe ich auch, wenn die Münzen reichen.",0);break;case"smith":await this.smith();break;case"inn":await this.inn(e);break;case"sage":{const n=Object.keys(t.caps.own).length;n?await this.say([`Mirela: ${n} Kapselgeist${n>1?"er":""} an eurer Seite! Füttert sie mit Tränken und Ätherwaren, dann wachsen sie.`,"Mirela: Ab Stufe 8 und Stufe 16 kann eine Sphärenfrucht sie in eine neue Gestalt verwandeln. Quinn verkauft welche, teuer, aber es lohnt sich."]):await this.say(["Mirela: Kapselgeister sind uralte Wesen, gebannt in Sphärenkapseln. In jedem der vier Reiche schläft einer.","Mirela: Wer eine Kapsel öffnet, gewinnt einen treuen Gefährten. Er kämpft selbst, ihr müsst ihm nichts befehlen."]);break}case"kid2":await this.say(["Nele: In der Gruft unter der Stadt soll es einen Turm geben, der nie endet ... sagt mein Opa. Aber mein Opa sagt viel."]);break;case"heal":ba(t),this.view.fxWorld?.("heal"),this.sfx("heal"),await this.say(["Das Wasser der Quelle leuchtet sanft. LP und SP sind wieder voll, der Fortschritt ist gespeichert."]),this.saveGame();break;case"kid":Hs(t)>=2?await this.say(["Pip: Die Vögel singen wieder! Mama sagt, das wart ihr!"]):await this.say(["Pip: Wenn ein Held Schaden nimmt, füllt sich seine IP-Leiste. Dann kann er einen Spezialangriff machen, der ist riesig!"]);break;case"guard":await this.say(['Wache Holm: Tipp: Mit "Wache" halbierst du den Schaden. Mit Q/E oder durch Wischen drehst du den Blick, mit dem Mausrad oder zwei Fingern zoomst du.']);break}}async shop(e,t,n){const i=this.S;for(await this.say([t]);;){const s=n?await this.choose(["Kaufen",`Ausrüstung ${hr(i)}M`,"Tschüss",`Münzen: ${i.gold}`],!0,[!1,!1,!1,!0]):await this.choose(["Kaufen","Tschüss",`Münzen: ${i.gold}`],!0,[!1,!1,!0]);if(n&&s===2||!n&&s===1||s===-1)break;if(s===0)for(;;){const a=[],o=[];for(const h of e)a.push(`${St[h].name} ${St[h].price}M (${i.inv[h]||0})`),o.push(i.gold<St[h].price);a.push("Zurück"),o.push(!1);const l=await this.choose(a,!0,o);if(l===-1||l===a.length-1)break;const c=e[l];if(!(i.gold<St[c].price)&&(i.gold-=St[c].price,i.inv[c]=(i.inv[c]||0)+1,this.autoplay))break}else s===1&&await this.buyGear(n,"Mara");if(this.autoplay)break}}async smith(){const e=this.S;for(await this.say(["Torvald: Mara macht ordentliche Arbeit. Aber Klingen aus Sternenstahl, die gibt es nur bei mir."]);!(await this.choose([`Schmieden ${e.gear>=10?"–":hr(e)+"M"}`,"Tschüss",`Münzen: ${e.gold}`],!0,[!1,!1,!0])!==0||(await this.buyGear(10,"Torvald"),this.autoplay)););}async inn(e){const t=this.S,n=vd(t);await this.say([`${e.name}: Willkommen im „Schlafenden Greif“! Ein warmes Bett kostet ${n} Münzen.`]),!(await this.choose([`Übernachten (${n}M)`,"Nein danke"],!0,[t.gold<n,!1])!==0||t.gold<n)&&(t.gold-=n,await this.fade(1,.6),ba(t),this.saveGame(),this.sfx("heal"),await this.wait(.8),await this.fade(0,.6),await this.say([`${e.name}: Gut geschlafen? LP und SP sind voll, auch eure Kapselgeister sind ausgeruht. Spielstand gespeichert.`]))}async buyGear(e,t){const n=this.S;if(n.gear>=e)await this.say([e>=10?`${t}: Mehr kann kein Schmied der Welt aus Stahl herausholen!`:`${t}: Besser kann ich es nicht. Frag mal Torvald in Lindmark.`]);else if(n.gold<hr(n))await this.say([`${t}: Dafür fehlen dir leider Münzen.`]);else{n.gold-=hr(n),n.gear+=1;for(const i of n.party)i.hp=Math.min(i.hp+8,wt(n,i));this.sfx("chest"),await this.say([`${t} rüstet euch neu aus: Stufe ${n.gear}. Angriff, Abwehr und Magie steigen!`])}}async fightBoss(e){const t=e.d,n=this.S,i=Ad[t.id]||["..."],s=Math.atan2(n.gp.x-e.x,n.gp.y-e.y);await this.cutscene([{x:(e.x+n.gp.x)/2,y:(e.y+n.gp.y)/2,yaw:s+.5,dist:6,pitch:.3,wait:.6,t:i.slice(0,1)},{x:e.x,y:e.y,h:1.5,yaw:s-.25,dist:3.4,pitch:.1,t:i.slice(1)}].filter(o=>o.t.length),"boss");const a=await this.runBattle([t.id],n.map.theme);a==="win"?(n.flags[t.flag]=!0,this.removeObj(e),t.id==="rauschen"?await this.ending():(await this.say(Rd[t.id]||["Besiegt!"]),this.saveGame())):a==="lose"&&await this.gameOver()}async ending(){const e=this.S;this.musicOverride="ending",await this.say(["Nihl zerfällt in Sternenstaub. Aus dem Turm steigt ein einzelner, klarer Ton auf, dann ein zweiter, dann tausend.","Die vier Kristalle singen gemeinsam. Über Aetherion geht die Sonne auf, als hätte sie lange gewartet.",`ENDE. Danke fürs Spielen von Aetherion: Chronik der Sphären!  Spielzeit: ${Math.trunc(e.playTime/60)} Min.`]),e.flags.boss_rauschen=!0,this.musicOverride=null,await this.fade(1),this.loadMap("hub",{x:12,y:12}),this.saveGame(),await this.view.ready?.(),await this.fade(0)}async gameOver(){const e=this.S;await this.fade(1),ba(e),e.gold=Math.trunc(e.gold/2),this.loadMap("hub",{x:12,y:12}),await this.view.ready?.(),await this.fade(0),await this.say(["Ihr erwacht in Hafenau an der Quelle. Eure Wunden sind geheilt, doch die Hälfte der Münzen ist verloren."])}async openMenu(){if(this.busy||this.mode!==bt.WORLD||this.ui.isChoosing()||this.ui.isTalking())return;const e=this.S;for(this.busy=!0,this.setTouch(!1),this.clearDirs();;){const t=[["status","Status"],["items","Items"]];Object.keys(e.caps.own).length&&t.push(["caps","Kapselgeist"]),t.push(["save","Speichern"],["music",`Musik: ${this.audio?.on===!1?"aus":"an"}`],["title","Titel"],["back","Zurück"]);const n=await this.choose(t.map(s=>s[1]),!0),i=n>=0?t[n][0]:"back";if(i==="back")break;if(i==="music"){this.audio&&(this.audio.setOn(!this.audio.on),this.onAudio?.(this.audio.on));continue}if(i==="status")if(this.ui.status)await this.ui.status(this.statusData());else{const s=e.party.map(a=>`${a.name} (${cn(a).role}) Lv ${a.lv}  LP ${a.hp}/${wt(e,a)}  SP ${a.sp}/${vi(a)}  ANG ${jt(e,a,"atk")} ABW ${jt(e,a,"def")} MAG ${jt(e,a,"mag")}  EXP ${a.exp}/${Ui(a.lv)}`);s.push(`Münzen: ${e.gold}   Ausrüstung: Stufe ${e.gear}   Kristalle: ${Hs(e)}/4`),await this.say(s)}else if(i==="items")await this.useItemMenu();else if(i==="caps")await this.capsuleMenu();else if(i==="save")this.saveGame(),await this.say(["Spielstand gespeichert."]);else if(i==="title"){this.saveGame(),this.busy=!1,await this.fade(1),await this.fade(0),this.showTitle();return}if(this.autoplay)break}this.busy=!1,this.setTouch(!0)}statusData(){const e=this.S;return{heroes:e.party.map(t=>({id:t.id,name:t.name,role:cn(t).role,col:cn(t).col,lv:t.lv,hp:t.hp,mhp:wt(e,t),sp:t.sp,msp:vi(t),atk:jt(e,t,"atk"),def:jt(e,t,"def"),mag:jt(e,t,"mag"),spd:jt(e,t,"spd"),exp:t.exp,need:Ui(t.lv)})),caps:Object.keys(e.caps.own).map(t=>{const n=e.caps.own[t];return{name:Ut(n),elem:wn[t].elem,col:wn[t].col,lv:n.lv,hp:n.hp,mhp:Qn(n),exp:n.exp,need:Ui(n.lv),atk:yi(n,"atk"),mag:yi(n,"mag"),active:e.caps.active===t}}),gold:e.gold,gear:e.gear,crystals:Hs(e),time:e.playTime,inv:{...e.inv}}}async useItemMenu(){const e=this.S;for(;;){const t=[],n=[];for(const o in St)(e.inv[o]||0)>0&&ur(o)==="hero"&&(t.push(o),n.push(`${St[o].name} x${e.inv[o]}`));if(!t.length){await this.say(["Keine Items, die hier wirken."]);return}n.push("Zurück");const i=await this.choose(n,!0);if(i===-1||i===t.length)return;const s=t[i],a=await this.chooseHero();if(a!==-1&&(ac(e,s,e.party[a])?(e.inv[s]-=1,this.sfx("heal")):await this.say(["Das hätte jetzt keine Wirkung."]),this.autoplay))return}}async capsuleMenu(){const e=this.S;for(;;){const t=Object.keys(e.caps.own),n=t.map(l=>{const c=e.caps.own[l];return`${e.caps.active===l?"★ ":""}${Ut(c)} (${wn[l].elem}) Lv ${c.lv}  LP ${c.hp}/${Qn(c)}`});n.push("Zurück");const i=await this.choose(n,!0);if(i<0||i>=t.length)return;const s=t[i],a=e.caps.own[s],o=await this.choose([e.caps.active===s?"Begleitet euch bereits":"Mitnehmen","Füttern","Zurück"],!0,[e.caps.active===s,!1,!1]);if(o===0?(e.caps.active=s,this.sfx("ok"),await this.say([`${Ut(a)} begleitet euch jetzt.`])):o===1&&await this.feed(a),this.autoplay)return}}async feed(e){const t=this.S,n=Object.keys(St).filter(l=>(t.inv[l]||0)>0&&(cr[l]||l==="frucht"));if(!n.length){await this.say(["Nichts zum Füttern im Beutel. Tränke, Ätherwaren und Sphärenfrüchte mögen Kapselgeister am liebsten."]);return}const i=n.map(l=>`${St[l].name} x${t.inv[l]}${l==="frucht"?" (Entwicklung)":` (+${cr[l]} EXP)`}`);i.push("Zurück");const s=await this.choose(i,!0);if(s<0||s>=n.length)return;const a=n[s];if(a==="frucht"){if(!jr(e)){await this.say([e.form>=2?`${Ut(e)} hat seine höchste Gestalt erreicht.`:`${Ut(e)} ist noch nicht bereit. Ab Stufe ${e.form===0?8:16} kann er sich entwickeln.`]);return}t.inv.frucht-=1;const l=Ut(e);_d(e),this.sfx("special"),this.view?.fxWorld?.("heal"),await this.say([`${l} verschlingt die Sphärenfrucht ... und beginnt zu leuchten!`,`${l} hat sich zu ${Ut(e)} entwickelt! Neue Fähigkeit: ${wn[e.id].skills[e.form].name}.`]);return}t.inv[a]-=1;const o=cc(e,cr[a]);this.sfx(o.length?"levelup":"heal"),await this.say([`${Ut(e)} frisst genüsslich ${St[a].name}. +${cr[a]} EXP${o.length?` – Stufe ${e.lv}!`:"."}`].concat(jr(e)&&(t.inv.frucht||0)>0?["Er wirkt unruhig ... eine Sphärenfrucht könnte ihn verwandeln."]:[]))}chooseHero(){const e=this.S;return this.choose(e.party.map(t=>`${t.name}  ${t.hp}/${wt(e,t)}`),!0)}async startEncounter(){const e=this.S;this.busy=!0,this.setTouch(!1),this.clearDirs(),e.grace=6;let t=e.map.enc,n=e.map.theme;if(e.map.world&&(t=uo[ia(e)],n=e.reg[e.gp.y][e.gp.x]),!t.length){this.busy=!1,this.setTouch(!0);return}let i=1+(this.rng.randf()<.7?1:0)+(this.rng.randf()<.3?1:0);An(e)<3&&(i=Math.min(i,2));const s=[];for(let o=0;o<i;o++)s.push(t[this.rng.randi()%t.length]);await this.bmsg("Gegner greifen an!",.55),await this.runBattle(s,n)==="lose"&&await this.gameOver(),this.busy=!1,this.setTouch(!0)}async startRoamerFight(e){const t=this.S;this.busy=!0,this.setTouch(!1),this.clearDirs();let n=t.map.enc,i=t.map.theme;t.map.world&&(n=uo[ia(t)],i=t.reg[t.gp.y][t.gp.x]);const s=[e.id];let a=(this.rng.randf()<.5?1:0)+(this.rng.randf()<.2?1:0);An(t)<3?a=0:An(t)<5&&(a=Math.min(a,1));for(let l=0;l<a;l++)s.push(n[this.rng.randi()%n.length]);await this.bmsg("Ein Monster stellt sich euch in den Weg!",.6);const o=await this.runBattle(s,i);if(o==="win"){const l=t.roamers.indexOf(e);l>=0&&t.roamers.splice(l,1)}else o==="run"?e.stun=3:o==="lose"&&await this.gameOver();t.grace=6,this.busy=!1,this.setTouch(!0)}async runBattle(e,t){const n=this.S;this.sfx("encounter"),await this.fade(1,.18),this.ui.msg(""),this.mode=bt.BATTLE,this.pickMusic(),n.enemies=e.map(c=>fd(n,c)),this.battleMusic=e[0]==="rauschen"?"final":n.enemies[0].boss?"boss":"battle";for(const c of n.party)c.ip=0,c.down=c.hp<=0;const i=gd(n);n.bcap=i&&i.hp>0?i:null,await this.view.battleBegin?.(t,n.enemies,n.party,n.bcap),this.setTouch(!1),await this.fade(0,.18);const s=e.length,a=n.enemies[0].boss;await this.bmsg(s===1?`${n.enemies[0].name} erscheint!`:`${s} Gegner!`,.8);let o="",l=0;for(;o==="";){l++;const c=[];let h=0;const u=zn(n);for(;h<u.length;){const m=u[h];this.curHero=n.party.indexOf(m);let _=await this.pickCommand(m,a);if(_){if(_.type==="run"){if(this.rng.randf()<.65){await this.bmsg("Ihr seid entkommen!",.8),o="run";break}await this.bmsg("Flucht misslungen!",.7),_={type:"guard",h:m}}c.push(_),h++}}if(this.curHero=-1,o!=="")break;const d=[];for(const m of c)d.push({k:"h",who:m.h,c:m,s:jt(n,m.h,"spd")+this.rng.randf()*3});for(const m of si(n))d.push({k:"e",who:m,s:m.spd+this.rng.randf()*3});n.bcap&&n.bcap.hp>0&&d.push({k:"c",who:n.bcap,s:yi(n.bcap,"spd")+this.rng.randf()*3}),d.sort((m,_)=>_.s-m.s);const f=[];for(const m of d){if(!si(n).length||!zn(n).length)break;m.k==="h"?m.who.hp>0&&await this.heroAct(m.c,f):m.k==="c"?m.who.hp>0&&await this.capAct(m.who,f):m.who.hp>0&&await this.enemyAct(m.who,f)}si(n).length?zn(n).length?this.autoplay&&l>200&&(o="lose"):o="lose":o="win"}o==="win"?await this.victory():o==="lose"&&await this.bmsg("Das Team ist besiegt ...",1.2),this.ui.msg(""),await this.fade(1,.18),this.view.battleEnd?.(),this.mode=bt.WORLD,n.enemies=[];for(const c of n.party)delete c.down;return n.bcap&&n.bcap.hp<=0&&(n.bcap.hp=1),n.bcap=null,await this.fade(0,.18),o}async pickCommand(e,t){const n=this.S,i=ho[cn(e).ip];for(;;)switch(await this.chooseCross([!1,!1,e.ip<i.ip,!1,!1,!1])){case 0:{const a=await this.pickEnemy();if(a>=0)return{type:"atk",h:e,t:n.enemies[a]};break}case 1:{const a=cn(e).skills,o=[],l=[];for(const h of a){const u=lr[h];o.push(`${u.name} ${u.sp}SP`),l.push(e.sp<u.sp)}o.push("Zurück"),l.push(!1);let c=await this.choose(o,!0,l);if(this.autoplay&&c>=0&&c<a.length&&e.sp<lr[a[c]].sp&&(c=-1),c>=0&&c<a.length){const h=await this.pickSkillTarget(e,lr[a[c]],a[c],!1);if(h)return h}break}case 2:{if(e.ip<i.ip)break;const a=await this.pickSkillTarget(e,i,cn(e).ip,!0);if(a)return a;break}case 3:{const a=[],o=[];for(const l in St)(n.inv[l]||0)>0&&ur(l)!=="capsule"&&(a.push(l),o.push(`${St[l].name} x${n.inv[l]}`));if(!a.length)await this.bmsg("Keine Items!",.6);else{o.push("Zurück");const l=await this.choose(o,!0);if(l>=0&&l<a.length){if(ur(a[l])==="enemy")return{type:"item",h:e,i:a[l],t:null};const c=await this.chooseHero();if(c>=0)return{type:"item",h:e,i:a[l],t:n.party[c]}}}break}case 4:return{type:"guard",h:e};case 5:if(t)await this.bmsg("Vor diesem Gegner gibt es kein Entkommen!",.9);else return{type:"run",h:e};break}}async pickSkillTarget(e,t,n,i){const s=this.S,a=i?"ipskill":"skill";if(t.kind==="heal"&&!t.all){const l=await this.chooseHero();return l>=0?{type:a,h:e,s:n,t:s.party[l]}:null}if(t.all||t.kind==="guard")return{type:a,h:e,s:n,t:null};const o=await this.pickEnemy();return o>=0?{type:a,h:e,s:n,t:s.enemies[o]}:null}async pickEnemy(){const e=this.S,t=[],n=[];if(e.enemies.forEach((s,a)=>{s.hp>0&&(t.push(a),n.push(s.name))}),t.length===1)return t[0];n.push("Zurück"),this.ui.targetHint?.(t);const i=await this.choose(n,!0);return this.ui.targetHint?.(null),i<0||i>=t.length?-1:t[i]}hitEnemy(e,t,n="slash"){const i=this.S;e.hp=Math.max(0,e.hp-t),this.sfx(n==="magic"?"magic":"hit");const s=i.enemies.indexOf(e);this.view.battleEnemy?.(s,"hurt"),this.view.battleFx?.(n,"enemy",s),this.ui.floatEnemy?.(s,String(t),n==="magic"?"#d8b8ff":"#ffffff")}hurtHero(e,t,n=!1){const i=this.S;e.hp=Math.max(0,e.hp-t),this.sfx(n?"heavy":"hit"),e.ip=Math.min(100,e.ip+(n?22:12));const s=i.party.indexOf(e);this.ui.floatHero?.(s,String(t),"#ff7373"),this.view.battleHero?.(s,"hurt"),this.view.battleFx?.(n?"heavy":"hit","hero",s),this.view.shake?.(n?.32:.22)}async heroAct(e,t){const n=this.S,i=e.h,s=n.party.indexOf(i);switch(e.type){case"guard":t.push(i),this.view.battleHero?.(s,"guard"),this.view.battleFx?.("guard","hero",s),await this.bmsg(`${i.name} geht in Deckung.`,.45);break;case"atk":{let a=e.t;if(a.hp<=0){const o=si(n);if(!o.length)return;a=o[0]}await this.bmsg(`${i.name} greift ${a.name} an!`,.35),this.view.battleHero?.(s,"attack",n.enemies.indexOf(a)),await this.wait(.28),this.hitEnemy(a,ii(this.rng,jt(n,i,"atk"),a.def)),await this.wait(.5);break}case"item":{const a=e.t;if(ur(e.i)==="enemy"){if((n.inv[e.i]||0)<=0){await this.bmsg("Ohne Wirkung ...",.5);break}n.inv[e.i]-=1,await this.bmsg(`${i.name} wirft eine ${St[e.i].name}!`,.5),this.view.battleHero?.(s,"attack",-1),this.view.shake?.(.3),await this.wait(.3);for(const o of si(n))this.hitEnemy(o,Math.trunc((40+9*An(n))*this.rng.range(.9,1.1)),"magic");await this.wait(.5)}else if((n.inv[e.i]||0)>0&&ac(n,e.i,a)){n.inv[e.i]-=1,await this.bmsg(`${i.name} nutzt ${St[e.i].name} auf ${a.name}.`,.8);const o=n.party.indexOf(a);this.ui.floatHero?.(o,"+","#66ff99"),this.view.battleFx?.("heal","hero",o),a.down&&a.hp>0&&(a.down=!1,this.view.battleHero?.(o,"idle"))}else await this.bmsg("Ohne Wirkung ...",.5);break}case"skill":case"ipskill":{const a=e.type==="ipskill",o=a?ho[e.s]:lr[e.s];if(a){if(i.ip<o.ip)return;i.ip-=o.ip}else{if(i.sp<o.sp){await this.bmsg("Zu wenig SP!",.5);return}i.sp-=o.sp}if(await this.bmsg(`${i.name}: ${o.name}!`,.5),this.view.battleHero?.(s,o.kind==="phys"?"attack":"cast",e.t&&n.enemies.includes(e.t)?n.enemies.indexOf(e.t):-1),a&&(this.view.battleFx?.("special","hero",s),this.sfx("special")),await this.wait(.3),o.kind==="heal"){let l=o.all?zn(n):[e.t];if(a){for(const c of n.party)c.hp<=0&&(c.hp=Math.max(1,Math.trunc(wt(n,c)/2)));l=n.party}for(const c of l){const h=o.mult>50?wt(n,c)-c.hp:Math.trunc((jt(n,i,"mag")*o.mult+12)*this.rng.range(.95,1.05));c.hp=Math.min(wt(n,c),c.hp+h);const u=n.party.indexOf(c);this.sfx("heal"),this.ui.floatHero?.(u,"+"+h,"#66ff99"),this.view.battleFx?.("heal","hero",u),c.down&&c.hp>0&&(c.down=!1,this.view.battleHero?.(u,"idle"))}await this.wait(.5)}else if(o.kind==="guard"){for(const l of zn(n))t.push(l),this.view.battleFx?.("guard","hero",n.party.indexOf(l));await this.wait(.3)}else{let l=o.all?si(n):[e.t];!o.all&&l[0].hp<=0&&(l=si(n).slice(0,1));const c=o.hits||1;for(let h=0;h<c;h++){for(const u of l)u.hp<=0||(o.kind==="phys"?this.hitEnemy(u,ii(this.rng,jt(n,i,"atk"),u.def,o.mult),a?"bigslash":"slash"):this.hitEnemy(u,rc(this.rng,jt(n,i,"mag"),u.def,o.mult),"magic"));await this.wait(.3)}await this.wait(.3)}break}}await this.checkEnemyDeaths()}async capAct(e,t){const n=this.S,i=wn[e.id],s=si(n);if(!s.length)return;let a=s[0];for(const u of s)u.hp<a.hp&&(a=u);const o=i.skills.slice(0,e.form+1);let l=this.rng.randf()<.45?o[this.rng.randi()%o.length]:null;const c=zn(n).some(u=>u.hp<wt(n,u)*.5);l&&l.kind==="heal"&&!c&&(l=null);const h=Ut(e);if(!l)await this.bmsg(`${h} greift ${a.name} an!`,.35),this.view.battleCap?.("attack",n.enemies.indexOf(a)),await this.wait(.28),this.hitEnemy(a,ii(this.rng,yi(e,"atk"),a.def)),await this.wait(.45);else{if(await this.bmsg(`${h}: ${l.name}!`,.5),this.view.battleCap?.(l.kind==="phys"?"attack":"cast",l.all?-1:n.enemies.indexOf(a)),this.view.battleFx?.("special","capsule",0),await this.wait(.3),l.kind==="heal"){for(const u of zn(n)){const d=Math.trunc((yi(e,"mag")*l.mult+10)*this.rng.range(.95,1.05));u.hp=Math.min(wt(n,u),u.hp+d);const f=n.party.indexOf(u);this.ui.floatHero?.(f,"+"+d,"#66ff99"),this.view.battleFx?.("heal","hero",f)}this.sfx("heal")}else if(l.kind==="guard")for(const u of zn(n))t.push(u),this.view.battleFx?.("guard","hero",n.party.indexOf(u));else{const u=l.all?s:[a];for(let d=0;d<(l.hits||1);d++){for(const f of u)f.hp<=0||(l.kind==="phys"?this.hitEnemy(f,ii(this.rng,yi(e,"atk"),f.def,l.mult),"slash"):this.hitEnemy(f,rc(this.rng,yi(e,"mag"),f.def,l.mult),"magic"));await this.wait(.3)}}await this.wait(.3)}await this.checkEnemyDeaths()}async checkEnemyDeaths(){const e=this.S;for(const t of e.enemies)t.hp<=0&&!t.dead&&(t.dead=!0,this.view.battleEnemyDown?.(e.enemies.indexOf(t)),await this.bmsg(`${t.name} zerfällt zu Staub!`,.6))}hurtCap(e,t,n){e.hp=Math.max(0,e.hp-t),this.sfx(n?"heavy":"hit"),this.ui.floatCap?.(String(t),"#ff7373"),this.view.battleCap?.(e.hp>0?"hurt":"death"),this.view.battleFx?.(n?"heavy":"hit","capsule",0)}async enemyAct(e,t){const n=this.S,i=zn(n);if(!i.length)return;e.turn+=1;const s=e.spec,a=s.length>0&&e.turn%3===0,o=n.enemies.indexOf(e);if(a){this.view.battleEnemy?.(o,"attack"),await this.bmsg(`${e.name}: ${s[0]}!`,.7),this.view.battleFx?.("spec","enemy",o);for(const c of i){let h=ii(this.rng,e.atk,jt(n,c,"def"),s[1]);t.includes(c)&&(h=Math.max(1,Math.trunc(h/2))),this.hurtHero(c,h,!0)}const l=n.bcap;l&&l.hp>0&&this.hurtCap(l,ii(this.rng,e.atk,oc(l),s[1]),!0),await this.wait(.5)}else if(n.bcap&&n.bcap.hp>0&&this.rng.randf()<1/(i.length+1)){const l=n.bcap,c=this.rng.randf()<.2;this.view.battleEnemy?.(o,"attack",-2),await this.bmsg(`${e.name} greift ${Ut(l)} an!`,.4),this.hurtCap(l,ii(this.rng,e.atk,oc(l),c?1.5:1),c),await this.wait(.45),l.hp<=0&&await this.bmsg(`${Ut(l)} ist erschöpft und zieht sich in seine Kapsel zurück.`,.7)}else{const l=this.rng.randf()<.2,c=i[this.rng.randi()%i.length];this.view.battleEnemy?.(o,"attack",n.party.indexOf(c)),await this.bmsg(l?`${e.name} wuchtet auf ${c.name} ein!`:`${e.name} greift ${c.name} an!`,.4);let h=ii(this.rng,e.atk,jt(n,c,"def"),l?1.5:1);t.includes(c)&&(h=Math.max(1,Math.trunc(h/2))),this.hurtHero(c,h,l),await this.wait(.45)}for(const l of n.party){const c=n.party.indexOf(l);l.hp<=0&&!l.down?(l.down=!0,this.view.battleHero?.(c,"death"),await this.bmsg(`${l.name} geht zu Boden!`,.5)):l.hp>0&&l.down&&(l.down=!1,this.view.battleHero?.(c,"idle"))}}async victory(){const e=this.S;let t=0,n=0;for(const i of e.enemies)t+=i.exp,n+=i.gold;t=wd(e,t),e.gold+=n,this.view.battleFx?.("victory"),this.musicOverride="none",this.pickMusic(),this.sfx("victory"),this.view.battleHero?.(-1,"victory"),await this.bmsg(`Sieg!  +${t} EXP  +${n} Münzen`,1),this.rng.randf()<.25&&(e.inv.trank=(e.inv.trank||0)+1,await this.bmsg("Beute: Trank",.7));for(const i of e.party)if(i.down=!1,!(i.hp<=0))for(const s of Ed(e,i,t))this.sfx("levelup"),await this.bmsg(`${i.name} erreicht Stufe ${s}!`,.9);for(const i in e.caps.own){const s=e.caps.own[i],a=i===e.caps.active;for(const o of cc(s,a?t:Math.trunc(t/2)))a&&(this.sfx("levelup"),await this.bmsg(`${Ut(s)} erreicht Stufe ${o}!`,.8));a&&jr(s)&&s.hinted!==s.form+1&&(s.hinted=s.form+1,await this.bmsg(`${Ut(s)} ist bereit für eine Sphärenfrucht!`,.9))}this.musicOverride=null}debugKey(e){if(!(!this.debug||this.mode!==bt.WORLD||!this.idle())&&(e==="F9"&&this.startEncounter(),e==="F8")){const t=Ta[(Ta.indexOf(this.S.mapId)+1)%Ta.length];this.loadMap(t,hc(t))}}}const at=r=>document.getElementById(r),Mi=(r,e,t)=>{const n=document.createElement(r);return e&&(n.className=e),t!==void 0&&(n.textContent=t),n},Dd={sword:'<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/>',staff:'<path d="M12 22V9"/><circle cx="12" cy="6" r="3"/><path d="M12 1v2M7 3l1.5 1.5M17 3l-1.5 1.5"/>',flame:'<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 6-4 12 0 4.3 3 7 7 7z"/>',bag:'<path d="M6 8h12l1 13H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',run:'<path d="M6 21h7l2-5-4-3 2-5h4M9 8 6 11M15 16l3 5"/><circle cx="15" cy="4" r="2"/>'},Id=r=>`<svg viewBox="0 0 24 24" class="i">${Dd[r]}</svg>`,uc=[["sword","Angriff"],["staff","Fertigkeit"],["flame","Spezial"],["bag","Item"],["shield","Wache"],["run","Flucht"]],dc={0:[1,2,3,4],1:[-1,0,-1,-1],2:[0,-1,-1,5],3:[-1,-1,-1,0],4:[-1,5,0,-1],5:[4,-1,2,-1]};class Ld{constructor(e){this.g=e,this.view=null,this.talking=!1,this.choosingList=null,this.choosingCross=null,this.statusOpen=null,this.touchOn=!1,this.touchDevice=matchMedia("(pointer: coarse)").matches||"ontouchstart"in window,this.cards=[],this.bars=[],this.labels=[],this.targets=null,this.build()}build(){const e=at("cross");this.crossBtns=uc.map(([c,h],u)=>{const d=Mi("button","cb c"+u);return d.innerHTML=Id(c),d.setAttribute("aria-label",h),d.addEventListener("pointerenter",()=>{d.disabled||this.crossFocus(u)}),d.addEventListener("click",()=>{this.choosingCross&&!d.disabled&&this.pickCross(u)}),e.appendChild(d),d}),at("dlg").addEventListener("pointerdown",c=>{this.talking&&(c.preventDefault(),this.advance())}),at("status").addEventListener("pointerdown",()=>this.closeStatus()),at("menuBtn").addEventListener("click",()=>this.g.openMenu());const t=at("joy"),n=at("knob");let i=null,s=0,a=0;const o=c=>{const h=c.clientX-s,u=c.clientY-a,d=Math.hypot(h,u),f=Math.min(d,42);n.style.transform=`translate(${d?h/d*f:0}px, ${d?u/d*f:0}px)`;let m=null;d>=12&&(m=Math.abs(h)>Math.abs(u)?{x:Math.sign(h),y:0}:{x:0,y:Math.sign(u)}),this.g.dpad=m};t.addEventListener("pointerdown",c=>{if(i!==null)return;i=c.pointerId,t.setPointerCapture(i);const h=t.getBoundingClientRect();s=h.left+h.width/2,a=h.top+h.height/2,o(c),c.preventDefault()}),t.addEventListener("pointermove",c=>{c.pointerId===i&&o(c)});const l=c=>{c.pointerId===i&&(i=null,this.g.dpad=null,n.style.transform="")};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),this.joyRelease=()=>{i=null,this.g.dpad=null,n.style.transform=""}}isChoosing(){return!!(this.choosingList||this.choosingCross)}isTalking(){return this.talking||!!this.statusOpen}touchVisible(){return this.touchOn}letterbox(e){document.body.classList.toggle("cine",!!e)}setTouch(e){this.touchOn=e,at("menuBtn").hidden=!e,at("joy").hidden=!(e&&this.touchDevice),e||this.joyRelease()}say(e){return new Promise(t=>{const n=at("dlg"),i=at("dlgText");this.talking=!0,n.hidden=!1;let s=0,a="",o=0,l=0;const c=()=>{a=String(e[s]),o=0,n.classList.remove("more"),clearInterval(l),l=setInterval(()=>{o=Math.min(a.length,o+2),i.textContent=a.slice(0,o),o>=a.length&&(clearInterval(l),n.classList.add("more"))},16)};this.advance=()=>{if(o<a.length){o=a.length,i.textContent=a,clearInterval(l),n.classList.add("more");return}s++,s<e.length?c():(clearInterval(l),this.talking=!1,this.advance=()=>{},n.hidden=!0,i.textContent="",t())},c()})}advance(){}choose(e,t,n,i){return new Promise(s=>{const a=at("menu");a.className="glass menu "+(i===2?"mb":i===0?"mt":"mw"),a.innerHTML="";const o=e.map((h,u)=>{const d=Mi("button","mi",String(h));return d.disabled=!!n[u],d.addEventListener("pointerenter",()=>{d.disabled||this.listFocus(u)}),d.addEventListener("click",()=>{d.disabled||l(u)}),a.appendChild(d),d});a.hidden=!1;const l=h=>{this.g.sfx?.(h<0?"cancel":"ok"),this.choosingList=null,a.hidden=!0,a.innerHTML="",this.targetFocus(-1),s(h)};this.choosingList={btns:o,canCancel:t,finish:l,focus:-1};const c=o.findIndex(h=>!h.disabled);this.listFocus(c>=0?c:0)})}listFocus(e){const t=this.choosingList;t&&(t.focus=e,t.btns.forEach((n,i)=>n.classList.toggle("on",i===e)),t.btns[e]?.scrollIntoView?.({block:"nearest"}),this.targetFocus(this.targets&&e<this.targets.length?this.targets[e]:-1))}listMove(e){const t=this.choosingList;if(!t)return;const n=t.btns.length;let i=t.focus;for(let s=0;s<n&&(i=(i+e+n)%n,!!t.btns[i].disabled);s++);i!==t.focus&&this.g.sfx?.("move"),this.listFocus(i)}targetHint(e){this.targets=e}targetFocus(e){this.bars.forEach((t,n)=>t&&t.classList.toggle("tgt",n===e))}chooseCross(e){return new Promise(t=>{this.crossBtns.forEach((n,i)=>{n.disabled=!!e[i]}),at("cross").hidden=!1,this.choosingCross={done:t,focus:0},this.crossFocus(0)})}crossFocus(e){this.choosingCross&&(this.choosingCross.focus=e,this.crossBtns.forEach((t,n)=>t.classList.toggle("on",n===e)),at("crossLbl").textContent=uc[e][1])}crossMove(e){const t=this.choosingCross;if(!t)return;let n=dc[t.focus][e];if(n>=0&&this.crossBtns[n].disabled){const i=dc[n][e];n=i>=0?i:-1}n>=0&&(this.crossFocus(n),this.g.sfx?.("move"))}pickCross(e){const t=this.choosingCross;!t||this.crossBtns[e].disabled||(this.choosingCross=null,at("cross").hidden=!0,this.g.sfx?.("ok"),t.done(e))}status(e){return new Promise(t=>{const n=at("status"),i=Math.floor(e.time/60);n.innerHTML=`<div class="glass sbox"><h3>Status</h3><div class="sgrid">${e.heroes.map(s=>`
        <div class="sh" style="--hc:${s.col}"><b>${s.name}</b><i>${s.role} · Stufe ${s.lv}</i>
        <div class="sb"><span>LP</span><u><s style="width:${s.hp/s.mhp*100}%"></s></u><em>${s.hp}/${s.mhp}</em></div>
        <div class="sb sp"><span>SP</span><u><s style="width:${s.sp/Math.max(1,s.msp)*100}%"></s></u><em>${s.sp}/${s.msp}</em></div>
        <div class="sb xp"><span>EXP</span><u><s style="width:${Math.min(100,s.exp/s.need*100)}%"></s></u><em>${s.exp}/${s.need}</em></div>
        <div class="st"><span>ANG <b>${s.atk}</b></span><span>ABW <b>${s.def}</b></span><span>MAG <b>${s.mag}</b></span><span>TEM <b>${s.spd}</b></span></div></div>`).join("")}</div>${(e.caps||[]).length?`<h3 style="margin-top:14px">Kapselgeister</h3><div class="sgrid">${e.caps.map(s=>`
        <div class="sh" style="--hc:${s.col}"><b>${s.active?"★ ":""}${s.name}</b><i>${s.elem} · Stufe ${s.lv}${s.active?" · begleitet euch":""}</i>
        <div class="sb"><span>LP</span><u><s style="width:${s.hp/s.mhp*100}%"></s></u><em>${s.hp}/${s.mhp}</em></div>
        <div class="sb xp"><span>EXP</span><u><s style="width:${Math.min(100,s.exp/s.need*100)}%"></s></u><em>${s.exp}/${s.need}</em></div>
        <div class="st"><span>ANG <b>${s.atk}</b></span><span>MAG <b>${s.mag}</b></span></div></div>`).join("")}</div>`:""}
        <p class="sf">Münzen <b>${e.gold}</b> · Ausrüstung <b>Stufe ${e.gear}</b> · Kristalle <b>${e.crystals}/4</b> · Spielzeit <b>${i} Min.</b></p>
        <p class="sk">Weiter mit Bestätigen oder Antippen</p></div>`,n.hidden=!1,this.statusOpen=()=>{n.hidden=!0,n.innerHTML="",this.statusOpen=null,t()}})}closeStatus(){this.statusOpen&&this.statusOpen()}msg(e){const t=at("msg");t.textContent=e,t.hidden=!e}banner(e,t){return new Promise(n=>{const i=at("banner");i.textContent=e,i.hidden=!1,i.classList.remove("show"),i.offsetWidth,i.classList.add("show"),setTimeout(()=>{i.hidden=!0,i.classList.remove("show"),n()},t*1e3)})}fade(e,t){const n=at("fade");return n.style.transition=`opacity ${t}s ease`,n.style.opacity=e,new Promise(i=>setTimeout(i,t*1e3+20))}fadeNow(e){const t=at("fade");t.style.transition="none",t.style.opacity=e}float(e,t,n,i,s){const a=Mi("div","fl"+(s?" big":""),n);a.style.left=e+"px",a.style.top=t+"px",a.style.color=i,at("floats").appendChild(a),setTimeout(()=>a.remove(),950)}floatEnemy(e,t,n){if(!this.view)return;const i=this.view.battle.enemies[e],s=this.view.screenPos("enemy",e,i?i.h*.85:1.5);s&&this.float(s.x+(Math.random()-.5)*30,s.y,t,n,!0)}floatCap(e,t){if(this.capCard){const n=this.capCard.el.getBoundingClientRect();this.float(n.left+n.width*.5,n.top-4,e,t,!1)}}floatHero(e,t,n){const i=this.cards[e];if(!i)return;const s=i.el.getBoundingClientRect();this.float(s.left+s.width*.5,s.top-4,t,n,!1)}frame(){const e=this.g,t=e.S,n=e.mode===1,i=e.mode===2;if(at("hud").hidden=!n,at("title").hidden=e.mode!==0,n){const s=`${t.map.name}`;this._hudT!==s&&(this._hudT=s,at("hudName").textContent=s),this._hudG!==t.gold&&(this._hudG=t.gold,at("hudGold").textContent=t.gold)}this.frameLabels(n&&t.map.world),this.frameBattle(i)}frameLabels(e){const t=at("labels"),n=this.view;if(!e||!n||!n.labels.length){this.labels.length&&(t.innerHTML="",this.labels=[]);return}(this.labels.length!==n.labels.length||this._labMap!==n.labels)&&(t.innerHTML="",this._labMap=n.labels,this.labels=n.labels.map(i=>{const s=Mi("div","lab",i.p.label);return t.appendChild(s),s})),n.labels.forEach((i,s)=>{const a=this.labels[s],o=n.project(i.node.position.clone().setY(i.node.position.y+i.h));a.style.transform=`translate(${o.x}px, ${o.y}px) translate(-50%, -100%)`;const l=po(this.g.S,i.p);a.classList.toggle("closed",!l),a.hidden=!o.vis})}frameBattle(e){const t=this.g,n=t.S,i=this.view,s=at("party"),a=at("bars");if(s.hidden=!e,!e){this.cards.length&&(s.innerHTML="",this.cards=[]),this.capCard=null,this.bars.length&&(a.innerHTML="",this.bars=[]);return}this.cards.length!==n.party.length&&(s.innerHTML="",this.capCard=null,this.cards=n.party.map(l=>{const c=Li[l.id],h=Mi("div","card glass");h.style.setProperty("--hc",c.col),h.innerHTML=`<div class="ch"><i class="av">${c.name[0]}</i><b>${c.name}</b><em>Lv <span class="lv"></span></em></div>
          <div class="br hp"><span>LP</span><u><s></s></u><em class="v"></em></div>
          <div class="br sp"><span>SP</span><u><s></s></u><em class="v"></em></div>
          <div class="br ip"><span>IP</span><u><s></s><i class="mk"></i></u></div>`,s.appendChild(h);const u=d=>h.querySelector(d);return{el:h,lv:u(".lv"),hp:u(".hp s"),hpv:u(".hp .v"),sp:u(".sp s"),spv:u(".sp .v"),ip:u(".ip s"),mk:u(".mk"),last:""}})),n.party.forEach((l,c)=>{const h=this.cards[c],u=wt(n,l),d=vi(l),f=ho[Li[l.id].ip].ip,m=[l.hp,u,l.sp,d,l.ip,l.lv,t.curHero===c].join();h.last!==m&&(h.last=m,h.lv.textContent=l.lv,h.hp.style.width=l.hp/u*100+"%",h.hp.classList.toggle("low",l.hp/u<=.3),h.hpv.textContent=l.hp,h.sp.style.width=l.sp/Math.max(1,d)*100+"%",h.spv.textContent=l.sp,h.ip.style.width=l.ip+"%",h.mk.style.left=f+"%",h.el.classList.toggle("ready",l.ip>=f),h.el.classList.toggle("hot",t.curHero===c),h.el.classList.toggle("down",l.hp<=0))});const o=n.bcap;if(o&&(!this.capCard||this.capCard.id!==o.id+o.form)){this.capCard?.el.remove();const l=Mi("div","card glass cap");l.style.setProperty("--hc",wn[o.id].col),l.innerHTML=`<div class="ch"><i class="av">◆</i><b>${Ut(o)}</b><em>Lv <span class="lv"></span></em></div><div class="br hp"><span>LP</span><u><s></s></u><em class="v"></em></div>`,s.appendChild(l),this.capCard={id:o.id+o.form,el:l,lv:l.querySelector(".lv"),hp:l.querySelector(".hp s"),hpv:l.querySelector(".hp .v"),last:""}}else!o&&this.capCard&&(this.capCard.el.remove(),this.capCard=null);if(o){const l=this.capCard,c=Qn(o),h=o.hp+","+c+","+o.lv;l.last!==h&&(l.last=h,l.lv.textContent=o.lv,l.hp.style.width=o.hp/c*100+"%",l.hp.classList.toggle("low",o.hp/c<=.3),l.hpv.textContent=o.hp,l.el.classList.toggle("down",o.hp<=0))}i&&(this.bars.length!==n.enemies.length&&(a.innerHTML="",this.bars=n.enemies.map(l=>{const c=Mi("div","eb"+(l.boss?" boss":""));return c.innerHTML=`<b>${l.name}</b><u><s></s></u>`,a.appendChild(c),c})),n.enemies.forEach((l,c)=>{const h=this.bars[c],u=i.battle.enemies[c];if(!h)return;if(l.hp<=0||!u){h.hidden=!0;return}const d=i.screenPos("enemy",c,u.h+.35);if(!d){h.hidden=!0;return}h.hidden=!1,h.style.transform=`translate(${d.x}px, ${d.y}px) translate(-50%, -100%)`,h.querySelector("s").style.width=l.hp/l.mhp*100+"%"}))}action(e){if(this.statusOpen)return(e==="ok"||e==="cancel"||e==="menu")&&this.closeStatus(),!0;if(this.talking)return e==="ok"||e==="cancel"?(this.advance(),!0):!1;if(this.choosingList){const t=this.choosingList;return e==="up"||e==="left"?this.listMove(-1):e==="down"||e==="right"?this.listMove(1):e==="ok"?t.btns[t.focus]&&!t.btns[t.focus].disabled&&t.finish(t.focus):e==="cancel"&&t.canCancel&&t.finish(-1),!0}if(this.choosingCross){const t={up:0,down:1,left:2,right:3}[e];return t!==void 0?this.crossMove(t):e==="ok"&&this.pickCross(this.choosingCross.focus),!0}return!1}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const vl="170",Ud=0,fc=1,Nd=2,Qh=1,Jh=2,jn=3,ei=0,Ot=1,Rt=2,Et=0,Ni=1,pi=2,pc=3,mc=4,eu=5,mn=100,Fd=101,kd=102,Od=103,Bd=104,Vs=200,zd=201,Hd=202,Vd=203,mo=204,go=205,_o=206,Gd=207,vo=208,Wd=209,Xd=210,qd=211,jd=212,Yd=213,$d=214,xo=0,yo=1,Mo=2,fs=3,To=4,So=5,bo=6,wo=7,tu=0,Kd=1,Zd=2,_i=0,nu=1,iu=2,su=3,xl=4,Qd=5,ru=6,au=7,gc="attached",Jd="detached",ou=300,ps=301,ms=302,sa=303,Eo=304,fa=306,Tn=1e3,Pn=1001,ra=1002,Pt=1003,lu=1004,Gs=1005,gt=1006,Yr=1007,xn=1008,In=1009,cu=1010,hu=1011,tr=1012,yl=1013,Fi=1014,Kt=1015,kt=1016,Ml=1017,Tl=1018,ki=1020,uu=35902,du=1021,fu=1022,Wt=1023,pu=1024,mu=1025,cs=1026,Oi=1027,Sl=1028,bl=1029,gu=1030,wl=1031,El=1033,$r=33776,Kr=33777,Zr=33778,Qr=33779,Ao=35840,Ro=35841,Co=35842,Po=35843,Do=36196,Io=37492,Lo=37496,Uo=37808,No=37809,Fo=37810,ko=37811,Oo=37812,Bo=37813,zo=37814,Ho=37815,Vo=37816,Go=37817,Wo=37818,Xo=37819,qo=37820,jo=37821,Jr=36492,Yo=36494,$o=36495,_u=36283,Ko=36284,Zo=36285,Qo=36286,vu=2200,xu=2201,ef=2202,nr=2300,ir=2301,wa=2302,as=2400,os=2401,aa=2402,Al=2500,tf=2501,nf=0,yu=1,Jo=2,sf=3200,rf=3201,Rl=0,af=1,fi="",ht="srgb",Bt="srgb-linear",pa="linear",st="srgb",Wi=7680,_c=519,of=512,lf=513,cf=514,Mu=515,hf=516,uf=517,df=518,ff=519,el=35044,vc="300 es",Zn=2e3,oa=2001;class Bi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}}const It=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let xc=1234567;const $s=Math.PI/180,gs=180/Math.PI;function yn(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(It[r&255]+It[r>>8&255]+It[r>>16&255]+It[r>>24&255]+"-"+It[e&255]+It[e>>8&255]+"-"+It[e>>16&15|64]+It[e>>24&255]+"-"+It[t&63|128]+It[t>>8&255]+"-"+It[t>>16&255]+It[t>>24&255]+It[n&255]+It[n>>8&255]+It[n>>16&255]+It[n>>24&255]).toLowerCase()}function At(r,e,t){return Math.max(e,Math.min(t,r))}function Cl(r,e){return(r%e+e)%e}function pf(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function mf(r,e,t){return r!==e?(t-r)/(e-r):0}function Ks(r,e,t){return(1-t)*r+t*e}function gf(r,e,t,n){return Ks(r,e,1-Math.exp(-t*n))}function _f(r,e=1){return e-Math.abs(Cl(r,e*2)-e)}function vf(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function xf(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function yf(r,e){return r+Math.floor(Math.random()*(e-r+1))}function Mf(r,e){return r+Math.random()*(e-r)}function Tf(r){return r*(.5-Math.random())}function Sf(r){r!==void 0&&(xc=r);let e=xc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function bf(r){return r*$s}function wf(r){return r*gs}function Ef(r){return(r&r-1)===0&&r!==0}function Af(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function Rf(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function Cf(r,e,t,n,i){const s=Math.cos,a=Math.sin,o=s(t/2),l=a(t/2),c=s((e+n)/2),h=a((e+n)/2),u=s((e-n)/2),d=a((e-n)/2),f=s((n-e)/2),m=a((n-e)/2);switch(i){case"XYX":r.set(o*h,l*u,l*d,o*c);break;case"YZY":r.set(l*d,o*h,l*u,o*c);break;case"ZXZ":r.set(l*u,l*d,o*h,o*c);break;case"XZX":r.set(o*h,l*m,l*f,o*c);break;case"YXY":r.set(l*f,o*h,l*m,o*c);break;case"ZYZ":r.set(l*m,l*f,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function gn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function rt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const tl={DEG2RAD:$s,RAD2DEG:gs,generateUUID:yn,clamp:At,euclideanModulo:Cl,mapLinear:pf,inverseLerp:mf,lerp:Ks,damp:gf,pingpong:_f,smoothstep:vf,smootherstep:xf,randInt:yf,randFloat:Mf,randFloatSpread:Tf,seededRandom:Sf,degToRad:bf,radToDeg:wf,isPowerOfTwo:Ef,ceilPowerOfTwo:Af,floorPowerOfTwo:Rf,setQuaternionFromProperEuler:Cf,normalize:rt,denormalize:gn};class Re{constructor(e=0,t=0){Re.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(At(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class He{constructor(e,t,n,i,s,a,o,l,c){He.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c)}set(e,t,n,i,s,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],m=n[8],_=i[0],g=i[3],p=i[6],x=i[1],T=i[4],v=i[7],D=i[2],E=i[5],A=i[8];return s[0]=a*_+o*x+l*D,s[3]=a*g+o*T+l*E,s[6]=a*p+o*v+l*A,s[1]=c*_+h*x+u*D,s[4]=c*g+h*T+u*E,s[7]=c*p+h*v+u*A,s[2]=d*_+f*x+m*D,s[5]=d*g+f*T+m*E,s[8]=d*p+f*v+m*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+i*s*c-i*a*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*s,f=c*s-a*l,m=t*u+n*d+i*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/m;return e[0]=u*_,e[1]=(i*c-h*n)*_,e[2]=(o*n-i*a)*_,e[3]=d*_,e[4]=(h*t-i*l)*_,e[5]=(i*s-o*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ea.makeScale(e,t)),this}rotate(e){return this.premultiply(Ea.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ea.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ea=new He;function Tu(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function sr(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Pf(){const r=sr("canvas");return r.style.display="block",r}const yc={};function Ws(r){r in yc||(yc[r]=!0,console.warn(r))}function Df(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function If(r){const e=r.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Lf(r){const e=r.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Xe={enabled:!0,workingColorSpace:Bt,spaces:{},convert:function(r,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===st&&(r.r=Jn(r.r),r.g=Jn(r.g),r.b=Jn(r.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(r.applyMatrix3(this.spaces[e].toXYZ),r.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===st&&(r.r=hs(r.r),r.g=hs(r.g),r.b=hs(r.b))),r},fromWorkingColorSpace:function(r,e){return this.convert(r,this.workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===fi?pa:this.spaces[r].transfer},getLuminanceCoefficients:function(r,e=this.workingColorSpace){return r.fromArray(this.spaces[e].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,e,t){return r.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}};function Jn(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function hs(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}const Mc=[.64,.33,.3,.6,.15,.06],Tc=[.2126,.7152,.0722],Sc=[.3127,.329],bc=new He().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),wc=new He().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Xe.define({[Bt]:{primaries:Mc,whitePoint:Sc,transfer:pa,toXYZ:bc,fromXYZ:wc,luminanceCoefficients:Tc,workingColorSpaceConfig:{unpackColorSpace:ht},outputColorSpaceConfig:{drawingBufferColorSpace:ht}},[ht]:{primaries:Mc,whitePoint:Sc,transfer:st,toXYZ:bc,fromXYZ:wc,luminanceCoefficients:Tc,outputColorSpaceConfig:{drawingBufferColorSpace:ht}}});let Xi;class Uf{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Xi===void 0&&(Xi=sr("canvas")),Xi.width=e.width,Xi.height=e.height;const n=Xi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Xi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=sr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=Jn(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Jn(t[n]/255)*255):t[n]=Jn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Nf=0;class Su{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Nf++}),this.uuid=yn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(Aa(i[a].image)):s.push(Aa(i[a]))}else s=Aa(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function Aa(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?Uf.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Ff=0;class vt extends Bi{constructor(e=vt.DEFAULT_IMAGE,t=vt.DEFAULT_MAPPING,n=Pn,i=Pn,s=gt,a=xn,o=Wt,l=In,c=vt.DEFAULT_ANISOTROPY,h=fi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ff++}),this.uuid=yn(),this.name="",this.source=new Su(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Re(0,0),this.repeat=new Re(1,1),this.center=new Re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new He,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ou)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Tn:e.x=e.x-Math.floor(e.x);break;case Pn:e.x=e.x<0?0:1;break;case ra:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Tn:e.y=e.y-Math.floor(e.y);break;case Pn:e.y=e.y<0?0:1;break;case ra:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}vt.DEFAULT_IMAGE=null;vt.DEFAULT_MAPPING=ou;vt.DEFAULT_ANISOTROPY=1;class Ke{constructor(e=0,t=0,n=0,i=1){Ke.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const T=(c+1)/2,v=(f+1)/2,D=(p+1)/2,E=(h+d)/4,A=(u+_)/4,w=(m+g)/4;return T>v&&T>D?T<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(T),i=E/n,s=A/n):v>D?v<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(v),n=E/i,s=w/i):D<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(D),n=A/s,i=w/s),this.set(n,i,s,t),this}let x=Math.sqrt((g-m)*(g-m)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(g-m)/x,this.y=(u-_)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class kf extends Bi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Ke(0,0,e,t),this.scissorTest=!1,this.viewport=new Ke(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:gt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new vt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Su(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Qt extends kf{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class bu extends vt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Pt,this.minFilter=Pt,this.wrapR=Pn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Of extends vt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Pt,this.minFilter=Pt,this.wrapR=Pn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Xt{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=s[a+0],f=s[a+1],m=s[a+2],_=s[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=m,e[t+3]=_;return}if(u!==_||l!==d||c!==f||h!==m){let g=1-o;const p=l*d+c*f+h*m+u*_,x=p>=0?1:-1,T=1-p*p;if(T>Number.EPSILON){const D=Math.sqrt(T),E=Math.atan2(D,p*x);g=Math.sin(g*E)/D,o=Math.sin(o*E)/D}const v=o*x;if(l=l*g+d*v,c=c*g+f*v,h=h*g+m*v,u=u*g+_*v,g===1-o){const D=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=D,c*=D,h*=D,u*=D}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,s,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=s[a],d=s[a+1],f=s[a+2],m=s[a+3];return e[t]=o*m+h*u+l*f-c*d,e[t+1]=l*m+h*d+c*u-o*f,e[t+2]=c*m+h*f+o*d-l*u,e[t+3]=h*m-o*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(s/2),d=l(n/2),f=l(i/2),m=l(s/2);switch(a){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(a-i)*f}else if(n>o&&n>u){const f=2*Math.sqrt(1+n-o-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(s+c)/f}else if(o>u){const f=2*Math.sqrt(1+o-n-u);this._w=(s-c)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-o);this._w=(a-i)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(At(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-s*l,this._y=i*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=s*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(e=0,t=0,n=0){P.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ec.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ec.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-s*i),u=2*(s*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-s*u,this.z=i+l*u+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-s*o,this.y=s*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ra.copy(this).projectOnVector(e),this.sub(Ra)}reflect(e){return this.sub(Ra.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(At(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Ra=new P,Ec=new Xt;class Un{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(dn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(dn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=dn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,dn):dn.fromBufferAttribute(s,a),dn.applyMatrix4(e.matrixWorld),this.expandByPoint(dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),fr.copy(n.boundingBox)),fr.applyMatrix4(e.matrixWorld),this.union(fr)}const i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,dn),dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Cs),pr.subVectors(this.max,Cs),qi.subVectors(e.a,Cs),ji.subVectors(e.b,Cs),Yi.subVectors(e.c,Cs),ri.subVectors(ji,qi),ai.subVectors(Yi,ji),Ti.subVectors(qi,Yi);let t=[0,-ri.z,ri.y,0,-ai.z,ai.y,0,-Ti.z,Ti.y,ri.z,0,-ri.x,ai.z,0,-ai.x,Ti.z,0,-Ti.x,-ri.y,ri.x,0,-ai.y,ai.x,0,-Ti.y,Ti.x,0];return!Ca(t,qi,ji,Yi,pr)||(t=[1,0,0,0,1,0,0,0,1],!Ca(t,qi,ji,Yi,pr))?!1:(mr.crossVectors(ri,ai),t=[mr.x,mr.y,mr.z],Ca(t,qi,ji,Yi,pr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Hn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Hn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Hn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Hn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Hn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Hn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Hn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Hn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Hn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Hn=[new P,new P,new P,new P,new P,new P,new P,new P],dn=new P,fr=new Un,qi=new P,ji=new P,Yi=new P,ri=new P,ai=new P,Ti=new P,Cs=new P,pr=new P,mr=new P,Si=new P;function Ca(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){Si.fromArray(r,s);const o=i.x*Math.abs(Si.x)+i.y*Math.abs(Si.y)+i.z*Math.abs(Si.z),l=e.dot(Si),c=t.dot(Si),h=n.dot(Si);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Bf=new Un,Ps=new P,Pa=new P;class Nn{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Bf.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ps.subVectors(e,this.center);const t=Ps.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Ps,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Pa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ps.copy(e.center).add(Pa)),this.expandByPoint(Ps.copy(e.center).sub(Pa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Vn=new P,Da=new P,gr=new P,oi=new P,Ia=new P,_r=new P,La=new P;class ma{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Vn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Vn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Vn.copy(this.origin).addScaledVector(this.direction,t),Vn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Da.copy(e).add(t).multiplyScalar(.5),gr.copy(t).sub(e).normalize(),oi.copy(this.origin).sub(Da);const s=e.distanceTo(t)*.5,a=-this.direction.dot(gr),o=oi.dot(this.direction),l=-oi.dot(gr),c=oi.lengthSq(),h=Math.abs(1-a*a);let u,d,f,m;if(h>0)if(u=a*l-o,d=a*o-l,m=s*h,u>=0)if(d>=-m)if(d<=m){const _=1/h;u*=_,d*=_,f=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=s,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d=-s,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-a*s+o)),d=u>0?-s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(u=Math.max(0,-(a*s+o)),d=u>0?s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c);else d=a>0?-s:s,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Da).addScaledVector(gr,d),f}intersectSphere(e,t){Vn.subVectors(e.center,this.origin);const n=Vn.dot(this.direction),i=Vn.dot(Vn)-n*n,s=e.radius*e.radius;if(i>s)return null;const a=Math.sqrt(s-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(s=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(s=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Vn)!==null}intersectTriangle(e,t,n,i,s){Ia.subVectors(t,e),_r.subVectors(n,e),La.crossVectors(Ia,_r);let a=this.direction.dot(La),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;oi.subVectors(this.origin,e);const l=o*this.direction.dot(_r.crossVectors(oi,_r));if(l<0)return null;const c=o*this.direction.dot(Ia.cross(oi));if(c<0||l+c>a)return null;const h=-o*oi.dot(La);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ce{constructor(e,t,n,i,s,a,o,l,c,h,u,d,f,m,_,g){Ce.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c,h,u,d,f,m,_,g)}set(e,t,n,i,s,a,o,l,c,h,u,d,f,m,_,g){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=s,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ce().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/$i.setFromMatrixColumn(e,0).length(),s=1/$i.setFromMatrixColumn(e,1).length(),a=1/$i.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const d=a*h,f=a*u,m=o*h,_=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+m*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=m+f*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*h,f=l*u,m=c*h,_=c*u;t[0]=d+_*o,t[4]=m*o-f,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-m,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*h,f=l*u,m=c*h,_=c*u;t[0]=d-_*o,t[4]=-a*u,t[8]=m+f*o,t[1]=f+m*o,t[5]=a*h,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*h,f=a*u,m=o*h,_=o*u;t[0]=l*h,t[4]=m*c-f,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=f*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,f=a*c,m=o*l,_=o*c;t[0]=l*h,t[4]=_-d*u,t[8]=m*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=f*u+m,t[10]=d-_*u}else if(e.order==="XZY"){const d=a*l,f=a*c,m=o*l,_=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=a*h,t[9]=f*u-m,t[2]=m*u-f,t[6]=o*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(zf,e,Hf)}lookAt(e,t,n){const i=this.elements;return en.subVectors(e,t),en.lengthSq()===0&&(en.z=1),en.normalize(),li.crossVectors(n,en),li.lengthSq()===0&&(Math.abs(n.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),li.crossVectors(n,en)),li.normalize(),vr.crossVectors(en,li),i[0]=li.x,i[4]=vr.x,i[8]=en.x,i[1]=li.y,i[5]=vr.y,i[9]=en.y,i[2]=li.z,i[6]=vr.z,i[10]=en.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],m=n[2],_=n[6],g=n[10],p=n[14],x=n[3],T=n[7],v=n[11],D=n[15],E=i[0],A=i[4],w=i[8],M=i[12],y=i[1],R=i[5],L=i[9],I=i[13],O=i[2],V=i[6],B=i[10],Y=i[14],G=i[3],H=i[7],K=i[11],J=i[15];return s[0]=a*E+o*y+l*O+c*G,s[4]=a*A+o*R+l*V+c*H,s[8]=a*w+o*L+l*B+c*K,s[12]=a*M+o*I+l*Y+c*J,s[1]=h*E+u*y+d*O+f*G,s[5]=h*A+u*R+d*V+f*H,s[9]=h*w+u*L+d*B+f*K,s[13]=h*M+u*I+d*Y+f*J,s[2]=m*E+_*y+g*O+p*G,s[6]=m*A+_*R+g*V+p*H,s[10]=m*w+_*L+g*B+p*K,s[14]=m*M+_*I+g*Y+p*J,s[3]=x*E+T*y+v*O+D*G,s[7]=x*A+T*R+v*V+D*H,s[11]=x*w+T*L+v*B+D*K,s[15]=x*M+T*I+v*Y+D*J,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],m=e[3],_=e[7],g=e[11],p=e[15];return m*(+s*l*u-i*c*u-s*o*d+n*c*d+i*o*f-n*l*f)+_*(+t*l*f-t*c*d+s*a*d-i*a*f+i*c*h-s*l*h)+g*(+t*c*u-t*o*f-s*a*u+n*a*f+s*o*h-n*c*h)+p*(-i*o*h-t*l*u+t*o*d+i*a*u-n*a*d+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],m=e[12],_=e[13],g=e[14],p=e[15],x=u*g*c-_*d*c+_*l*f-o*g*f-u*l*p+o*d*p,T=m*d*c-h*g*c-m*l*f+a*g*f+h*l*p-a*d*p,v=h*_*c-m*u*c+m*o*f-a*_*f-h*o*p+a*u*p,D=m*u*l-h*_*l-m*o*d+a*_*d+h*o*g-a*u*g,E=t*x+n*T+i*v+s*D;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/E;return e[0]=x*A,e[1]=(_*d*s-u*g*s-_*i*f+n*g*f+u*i*p-n*d*p)*A,e[2]=(o*g*s-_*l*s+_*i*c-n*g*c-o*i*p+n*l*p)*A,e[3]=(u*l*s-o*d*s-u*i*c+n*d*c+o*i*f-n*l*f)*A,e[4]=T*A,e[5]=(h*g*s-m*d*s+m*i*f-t*g*f-h*i*p+t*d*p)*A,e[6]=(m*l*s-a*g*s-m*i*c+t*g*c+a*i*p-t*l*p)*A,e[7]=(a*d*s-h*l*s+h*i*c-t*d*c-a*i*f+t*l*f)*A,e[8]=v*A,e[9]=(m*u*s-h*_*s-m*n*f+t*_*f+h*n*p-t*u*p)*A,e[10]=(a*_*s-m*o*s+m*n*c-t*_*c-a*n*p+t*o*p)*A,e[11]=(h*o*s-a*u*s-h*n*c+t*u*c+a*n*f-t*o*f)*A,e[12]=D*A,e[13]=(h*_*i-m*u*i+m*n*d-t*_*d-h*n*g+t*u*g)*A,e[14]=(m*o*i-a*_*i-m*n*l+t*_*l+a*n*g-t*o*g)*A,e[15]=(a*u*i-h*o*i+h*n*l-t*u*l-a*n*d+t*o*d)*A,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,u=o+o,d=s*c,f=s*h,m=s*u,_=a*h,g=a*u,p=o*u,x=l*c,T=l*h,v=l*u,D=n.x,E=n.y,A=n.z;return i[0]=(1-(_+p))*D,i[1]=(f+v)*D,i[2]=(m-T)*D,i[3]=0,i[4]=(f-v)*E,i[5]=(1-(d+p))*E,i[6]=(g+x)*E,i[7]=0,i[8]=(m+T)*A,i[9]=(g-x)*A,i[10]=(1-(d+_))*A,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=$i.set(i[0],i[1],i[2]).length();const a=$i.set(i[4],i[5],i[6]).length(),o=$i.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],fn.copy(this);const c=1/s,h=1/a,u=1/o;return fn.elements[0]*=c,fn.elements[1]*=c,fn.elements[2]*=c,fn.elements[4]*=h,fn.elements[5]*=h,fn.elements[6]*=h,fn.elements[8]*=u,fn.elements[9]*=u,fn.elements[10]*=u,t.setFromRotationMatrix(fn),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=Zn){const l=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),d=(n+i)/(n-i);let f,m;if(o===Zn)f=-(a+s)/(a-s),m=-2*a*s/(a-s);else if(o===oa)f=-a/(a-s),m=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=Zn){const l=this.elements,c=1/(t-e),h=1/(n-i),u=1/(a-s),d=(t+e)*c,f=(n+i)*h;let m,_;if(o===Zn)m=(a+s)*u,_=-2*u;else if(o===oa)m=s*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const $i=new P,fn=new Ce,zf=new P(0,0,0),Hf=new P(1,1,1),li=new P,vr=new P,en=new P,Ac=new Ce,Rc=new Xt;class Ln{constructor(e=0,t=0,n=0,i=Ln.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(At(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-At(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(At(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-At(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(At(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-At(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ac.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ac,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Rc.setFromEuler(this),this.setFromQuaternion(Rc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ln.DEFAULT_ORDER="XYZ";class wu{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Vf=0;const Cc=new P,Ki=new Xt,Gn=new Ce,xr=new P,Ds=new P,Gf=new P,Wf=new Xt,Pc=new P(1,0,0),Dc=new P(0,1,0),Ic=new P(0,0,1),Lc={type:"added"},Xf={type:"removed"},Zi={type:"childadded",child:null},Ua={type:"childremoved",child:null};class ut extends Bi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Vf++}),this.uuid=yn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ut.DEFAULT_UP.clone();const e=new P,t=new Ln,n=new Xt,i=new P(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ce},normalMatrix:{value:new He}}),this.matrix=new Ce,this.matrixWorld=new Ce,this.matrixAutoUpdate=ut.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ki.setFromAxisAngle(e,t),this.quaternion.multiply(Ki),this}rotateOnWorldAxis(e,t){return Ki.setFromAxisAngle(e,t),this.quaternion.premultiply(Ki),this}rotateX(e){return this.rotateOnAxis(Pc,e)}rotateY(e){return this.rotateOnAxis(Dc,e)}rotateZ(e){return this.rotateOnAxis(Ic,e)}translateOnAxis(e,t){return Cc.copy(e).applyQuaternion(this.quaternion),this.position.add(Cc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Pc,e)}translateY(e){return this.translateOnAxis(Dc,e)}translateZ(e){return this.translateOnAxis(Ic,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Gn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?xr.copy(e):xr.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Ds.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Gn.lookAt(Ds,xr,this.up):Gn.lookAt(xr,Ds,this.up),this.quaternion.setFromRotationMatrix(Gn),i&&(Gn.extractRotation(i.matrixWorld),Ki.setFromRotationMatrix(Gn),this.quaternion.premultiply(Ki.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Lc),Zi.child=e,this.dispatchEvent(Zi),Zi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Xf),Ua.child=e,this.dispatchEvent(Ua),Ua.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Gn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Gn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Gn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Lc),Zi.child=e,this.dispatchEvent(Zi),Zi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ds,e,Gf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ds,Wf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),m.length>0&&(n.nodes=m)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}ut.DEFAULT_UP=new P(0,1,0);ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const pn=new P,Wn=new P,Na=new P,Xn=new P,Qi=new P,Ji=new P,Uc=new P,Fa=new P,ka=new P,Oa=new P,Ba=new Ke,za=new Ke,Ha=new Ke;class _n{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),pn.subVectors(e,t),i.cross(pn);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){pn.subVectors(i,t),Wn.subVectors(n,t),Na.subVectors(e,t);const a=pn.dot(pn),o=pn.dot(Wn),l=pn.dot(Na),c=Wn.dot(Wn),h=Wn.dot(Na),u=a*c-o*o;if(u===0)return s.set(0,0,0),null;const d=1/u,f=(c*l-o*h)*d,m=(a*h-o*l)*d;return s.set(1-f-m,m,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Xn)===null?!1:Xn.x>=0&&Xn.y>=0&&Xn.x+Xn.y<=1}static getInterpolation(e,t,n,i,s,a,o,l){return this.getBarycoord(e,t,n,i,Xn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Xn.x),l.addScaledVector(a,Xn.y),l.addScaledVector(o,Xn.z),l)}static getInterpolatedAttribute(e,t,n,i,s,a){return Ba.setScalar(0),za.setScalar(0),Ha.setScalar(0),Ba.fromBufferAttribute(e,t),za.fromBufferAttribute(e,n),Ha.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(Ba,s.x),a.addScaledVector(za,s.y),a.addScaledVector(Ha,s.z),a}static isFrontFacing(e,t,n,i){return pn.subVectors(n,t),Wn.subVectors(e,t),pn.cross(Wn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return pn.subVectors(this.c,this.b),Wn.subVectors(this.a,this.b),pn.cross(Wn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return _n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return _n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return _n.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return _n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return _n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let a,o;Qi.subVectors(i,n),Ji.subVectors(s,n),Fa.subVectors(e,n);const l=Qi.dot(Fa),c=Ji.dot(Fa);if(l<=0&&c<=0)return t.copy(n);ka.subVectors(e,i);const h=Qi.dot(ka),u=Ji.dot(ka);if(h>=0&&u<=h)return t.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Qi,a);Oa.subVectors(e,s);const f=Qi.dot(Oa),m=Ji.dot(Oa);if(m>=0&&f<=m)return t.copy(s);const _=f*c-l*m;if(_<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(n).addScaledVector(Ji,o);const g=h*m-f*u;if(g<=0&&u-h>=0&&f-m>=0)return Uc.subVectors(s,i),o=(u-h)/(u-h+(f-m)),t.copy(i).addScaledVector(Uc,o);const p=1/(g+_+d);return a=_*p,o=d*p,t.copy(n).addScaledVector(Qi,a).addScaledVector(Ji,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Eu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ci={h:0,s:0,l:0},yr={h:0,s:0,l:0};function Va(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class ue{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ht){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Xe.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=Xe.workingColorSpace){if(e=Cl(e,1),t=At(t,0,1),n=At(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=Va(a,s,e+1/3),this.g=Va(a,s,e),this.b=Va(a,s,e-1/3)}return Xe.toWorkingColorSpace(this,i),this}setStyle(e,t=ht){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ht){const n=Eu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Jn(e.r),this.g=Jn(e.g),this.b=Jn(e.b),this}copyLinearToSRGB(e){return this.r=hs(e.r),this.g=hs(e.g),this.b=hs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ht){return Xe.fromWorkingColorSpace(Lt.copy(this),e),Math.round(At(Lt.r*255,0,255))*65536+Math.round(At(Lt.g*255,0,255))*256+Math.round(At(Lt.b*255,0,255))}getHexString(e=ht){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.fromWorkingColorSpace(Lt.copy(this),t);const n=Lt.r,i=Lt.g,s=Lt.b,a=Math.max(n,i,s),o=Math.min(n,i,s);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-s)/u+(i<s?6:0);break;case i:l=(s-n)/u+2;break;case s:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Xe.workingColorSpace){return Xe.fromWorkingColorSpace(Lt.copy(this),t),e.r=Lt.r,e.g=Lt.g,e.b=Lt.b,e}getStyle(e=ht){Xe.fromWorkingColorSpace(Lt.copy(this),e);const t=Lt.r,n=Lt.g,i=Lt.b;return e!==ht?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(ci),this.setHSL(ci.h+e,ci.s+t,ci.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ci),e.getHSL(yr);const n=Ks(ci.h,yr.h,t),i=Ks(ci.s,yr.s,t),s=Ks(ci.l,yr.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Lt=new ue;ue.NAMES=Eu;let qf=0;class Mn extends Bi{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=yn(),this.name="",this.blending=Ni,this.side=ei,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=mo,this.blendDst=go,this.blendEquation=mn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ue(0,0,0),this.blendAlpha=0,this.depthFunc=fs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_c,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Wi,this.stencilZFail=Wi,this.stencilZPass=Wi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ni&&(n.blending=this.blending),this.side!==ei&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==mo&&(n.blendSrc=this.blendSrc),this.blendDst!==go&&(n.blendDst=this.blendDst),this.blendEquation!==mn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==fs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==_c&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Wi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Wi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Wi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Ct extends Mn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ln,this.combine=tu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const $n=jf();function jf(){const r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(n[l]=0,n[l|256]=32768,i[l]=24,i[l|256]=24):c<-14?(n[l]=1024>>-c-14,n[l|256]=1024>>-c-14|32768,i[l]=-c-1,i[l|256]=-c-1):c<=15?(n[l]=c+15<<10,n[l|256]=c+15<<10|32768,i[l]=13,i[l|256]=13):c<128?(n[l]=31744,n[l|256]=64512,i[l]=24,i[l|256]=24):(n[l]=31744,n[l|256]=64512,i[l]=13,i[l|256]=13)}const s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;!(c&8388608);)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:o}}function Yf(r){Math.abs(r)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),r=At(r,-65504,65504),$n.floatView[0]=r;const e=$n.uint32View[0],t=e>>23&511;return $n.baseTable[t]+((e&8388607)>>$n.shiftTable[t])}function $f(r){const e=r>>10;return $n.uint32View[0]=$n.mantissaTable[$n.offsetTable[e]+(r&1023)]+$n.exponentTable[e],$n.floatView[0]}const Mr={toHalfFloat:Yf,fromHalfFloat:$f},mt=new P,Tr=new Re;class xt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=el,this.updateRanges=[],this.gpuType=Kt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Tr.fromBufferAttribute(this,t),Tr.applyMatrix3(e),this.setXY(t,Tr.x,Tr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)mt.fromBufferAttribute(this,t),mt.applyMatrix3(e),this.setXYZ(t,mt.x,mt.y,mt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)mt.fromBufferAttribute(this,t),mt.applyMatrix4(e),this.setXYZ(t,mt.x,mt.y,mt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)mt.fromBufferAttribute(this,t),mt.applyNormalMatrix(e),this.setXYZ(t,mt.x,mt.y,mt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)mt.fromBufferAttribute(this,t),mt.transformDirection(e),this.setXYZ(t,mt.x,mt.y,mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=gn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=rt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=gn(t,this.array)),t}setX(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=gn(t,this.array)),t}setY(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=gn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=gn(t,this.array)),t}setW(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array),i=rt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array),i=rt(i,this.array),s=rt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==el&&(e.usage=this.usage),e}}class Au extends xt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Ru extends xt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ze extends xt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Kf=0;const an=new Ce,Ga=new ut,es=new P,tn=new Un,Is=new Un,Tt=new P;class _t extends Bi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Kf++}),this.uuid=yn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Tu(e)?Ru:Au)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new He().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return an.makeRotationFromQuaternion(e),this.applyMatrix4(an),this}rotateX(e){return an.makeRotationX(e),this.applyMatrix4(an),this}rotateY(e){return an.makeRotationY(e),this.applyMatrix4(an),this}rotateZ(e){return an.makeRotationZ(e),this.applyMatrix4(an),this}translate(e,t,n){return an.makeTranslation(e,t,n),this.applyMatrix4(an),this}scale(e,t,n){return an.makeScale(e,t,n),this.applyMatrix4(an),this}lookAt(e){return Ga.lookAt(e),Ga.updateMatrix(),this.applyMatrix4(Ga.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(es).negate(),this.translate(es.x,es.y,es.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,s=e.length;i<s;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ze(n,3))}else{for(let n=0,i=t.count;n<i;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Un);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];tn.setFromBufferAttribute(s),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,tn.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,tn.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint(tn.min),this.boundingBox.expandByPoint(tn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Nn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const n=this.boundingSphere.center;if(tn.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];Is.setFromBufferAttribute(o),this.morphTargetsRelative?(Tt.addVectors(tn.min,Is.min),tn.expandByPoint(Tt),Tt.addVectors(tn.max,Is.max),tn.expandByPoint(Tt)):(tn.expandByPoint(Is.min),tn.expandByPoint(Is.max))}tn.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)Tt.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Tt));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Tt.fromBufferAttribute(o,c),l&&(es.fromBufferAttribute(e,c),Tt.add(es)),i=Math.max(i,n.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new xt(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let w=0;w<n.count;w++)o[w]=new P,l[w]=new P;const c=new P,h=new P,u=new P,d=new Re,f=new Re,m=new Re,_=new P,g=new P;function p(w,M,y){c.fromBufferAttribute(n,w),h.fromBufferAttribute(n,M),u.fromBufferAttribute(n,y),d.fromBufferAttribute(s,w),f.fromBufferAttribute(s,M),m.fromBufferAttribute(s,y),h.sub(c),u.sub(c),f.sub(d),m.sub(d);const R=1/(f.x*m.y-m.x*f.y);isFinite(R)&&(_.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(R),g.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(R),o[w].add(_),o[M].add(_),o[y].add(_),l[w].add(g),l[M].add(g),l[y].add(g))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let w=0,M=x.length;w<M;++w){const y=x[w],R=y.start,L=y.count;for(let I=R,O=R+L;I<O;I+=3)p(e.getX(I+0),e.getX(I+1),e.getX(I+2))}const T=new P,v=new P,D=new P,E=new P;function A(w){D.fromBufferAttribute(i,w),E.copy(D);const M=o[w];T.copy(M),T.sub(D.multiplyScalar(D.dot(M))).normalize(),v.crossVectors(E,M);const R=v.dot(l[w])<0?-1:1;a.setXYZW(w,T.x,T.y,T.z,R)}for(let w=0,M=x.length;w<M;++w){const y=x[w],R=y.start,L=y.count;for(let I=R,O=R+L;I<O;I+=3)A(e.getX(I+0)),A(e.getX(I+1)),A(e.getX(I+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new xt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new P,s=new P,a=new P,o=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let d=0,f=e.count;d<f;d+=3){const m=e.getX(d+0),_=e.getX(d+1),g=e.getX(d+2);i.fromBufferAttribute(t,m),s.fromBufferAttribute(t,_),a.fromBufferAttribute(t,g),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,g),o.add(h),l.add(h),c.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Tt.fromBufferAttribute(e,t),Tt.normalize(),e.setXYZ(t,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h);let f=0,m=0;for(let _=0,g=l.length;_<g;_++){o.isInterleavedBufferAttribute?f=l[_]*o.data.stride+o.offset:f=l[_]*h;for(let p=0;p<h;p++)d[m++]=c[f++]}return new xt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new _t,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=e(l,n);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(i[l]=h,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const s=e.morphAttributes;for(const c in s){const h=[],u=s[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Nc=new Ce,bi=new ma,Sr=new Nn,Fc=new P,br=new P,wr=new P,Er=new P,Wa=new P,Ar=new P,kc=new P,Rr=new P;class $e extends ut{constructor(e=new _t,t=new Ct){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(s&&o){Ar.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=o[l],u=s[l];h!==0&&(Wa.fromBufferAttribute(u,e),a?Ar.addScaledVector(Wa,h):Ar.addScaledVector(Wa.sub(t),h))}t.add(Ar)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Sr.copy(n.boundingSphere),Sr.applyMatrix4(s),bi.copy(e.ray).recast(e.near),!(Sr.containsPoint(bi.origin)===!1&&(bi.intersectSphere(Sr,Fc)===null||bi.origin.distanceToSquared(Fc)>(e.far-e.near)**2))&&(Nc.copy(s).invert(),bi.copy(e.ray).applyMatrix4(Nc),!(n.boundingBox!==null&&bi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,bi)))}_computeIntersections(e,t,n){let i;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,_=d.length;m<_;m++){const g=d[m],p=a[g.materialIndex],x=Math.max(g.start,f.start),T=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let v=x,D=T;v<D;v+=3){const E=o.getX(v),A=o.getX(v+1),w=o.getX(v+2);i=Cr(this,p,e,n,c,h,u,E,A,w),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const m=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let g=m,p=_;g<p;g+=3){const x=o.getX(g),T=o.getX(g+1),v=o.getX(g+2);i=Cr(this,a,e,n,c,h,u,x,T,v),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,_=d.length;m<_;m++){const g=d[m],p=a[g.materialIndex],x=Math.max(g.start,f.start),T=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let v=x,D=T;v<D;v+=3){const E=v,A=v+1,w=v+2;i=Cr(this,p,e,n,c,h,u,E,A,w),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const m=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let g=m,p=_;g<p;g+=3){const x=g,T=g+1,v=g+2;i=Cr(this,a,e,n,c,h,u,x,T,v),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}}}function Zf(r,e,t,n,i,s,a,o){let l;if(e.side===Ot?l=n.intersectTriangle(a,s,i,!0,o):l=n.intersectTriangle(i,s,a,e.side===ei,o),l===null)return null;Rr.copy(o),Rr.applyMatrix4(r.matrixWorld);const c=t.ray.origin.distanceTo(Rr);return c<t.near||c>t.far?null:{distance:c,point:Rr.clone(),object:r}}function Cr(r,e,t,n,i,s,a,o,l,c){r.getVertexPosition(o,br),r.getVertexPosition(l,wr),r.getVertexPosition(c,Er);const h=Zf(r,e,t,n,br,wr,Er,kc);if(h){const u=new P;_n.getBarycoord(kc,br,wr,Er,u),i&&(h.uv=_n.getInterpolatedAttribute(i,o,l,c,u,new Re)),s&&(h.uv1=_n.getInterpolatedAttribute(s,o,l,c,u,new Re)),a&&(h.normal=_n.getInterpolatedAttribute(a,o,l,c,u,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new P,materialIndex:0};_n.getNormal(br,wr,Er,d.normal),h.face=d,h.barycoord=u}return h}class Ts extends _t{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};const o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],h=[],u=[];let d=0,f=0;m("z","y","x",-1,-1,n,t,e,a,s,0),m("z","y","x",1,-1,n,t,-e,a,s,1),m("x","z","y",1,1,e,n,t,i,a,2),m("x","z","y",1,-1,e,n,-t,i,a,3),m("x","y","z",1,-1,e,t,n,i,s,4),m("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new Ze(c,3)),this.setAttribute("normal",new Ze(h,3)),this.setAttribute("uv",new Ze(u,2));function m(_,g,p,x,T,v,D,E,A,w,M){const y=v/A,R=D/w,L=v/2,I=D/2,O=E/2,V=A+1,B=w+1;let Y=0,G=0;const H=new P;for(let K=0;K<B;K++){const J=K*R-I;for(let se=0;se<V;se++){const ye=se*y-L;H[_]=ye*x,H[g]=J*T,H[p]=O,c.push(H.x,H.y,H.z),H[_]=0,H[g]=0,H[p]=E>0?1:-1,h.push(H.x,H.y,H.z),u.push(se/A),u.push(1-K/w),Y+=1}}for(let K=0;K<w;K++)for(let J=0;J<A;J++){const se=d+J+V*K,ye=d+J+V*(K+1),j=d+(J+1)+V*(K+1),te=d+(J+1)+V*K;l.push(se,ye,te),l.push(ye,j,te),G+=6}o.addGroup(f,G,M),f+=G,d+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ts(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function _s(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Ht(r){const e={};for(let t=0;t<r.length;t++){const n=_s(r[t]);for(const i in n)e[i]=n[i]}return e}function Qf(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function Cu(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const vn={clone:_s,merge:Ht};var Jf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ep=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class dt extends Mn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Jf,this.fragmentShader=ep,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=_s(e.uniforms),this.uniformsGroups=Qf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Pu extends ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ce,this.projectionMatrix=new Ce,this.projectionMatrixInverse=new Ce,this.coordinateSystem=Zn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const hi=new P,Oc=new Re,Bc=new Re;class Gt extends Pu{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=gs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan($s*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return gs*2*Math.atan(Math.tan($s*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){hi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(hi.x,hi.y).multiplyScalar(-e/hi.z),hi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(hi.x,hi.y).multiplyScalar(-e/hi.z)}getViewSize(e,t){return this.getViewBounds(e,Oc,Bc),t.subVectors(Bc,Oc)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan($s*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ts=-90,ns=1;class tp extends ut{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Gt(ts,ns,e,t);i.layers=this.layers,this.add(i);const s=new Gt(ts,ns,e,t);s.layers=this.layers,this.add(s);const a=new Gt(ts,ns,e,t);a.layers=this.layers,this.add(a);const o=new Gt(ts,ns,e,t);o.layers=this.layers,this.add(o);const l=new Gt(ts,ns,e,t);l.layers=this.layers,this.add(l);const c=new Gt(ts,ns,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===Zn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===oa)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Du extends vt{constructor(e,t,n,i,s,a,o,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:ps,super(e,t,n,i,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class np extends Qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Du(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:gt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Ts(5,5,5),s=new dt({name:"CubemapFromEquirect",uniforms:_s(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ot,blending:Et});s.uniforms.tEquirect.value=t;const a=new $e(i,s),o=t.minFilter;return t.minFilter===xn&&(t.minFilter=gt),new tp(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}}const Xa=new P,ip=new P,sp=new He;class Ci{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Xa.subVectors(n,t).cross(ip.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Xa),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||sp.getNormalMatrix(e),i=this.coplanarPoint(Xa).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const wi=new Nn,Pr=new P;class Pl{constructor(e=new Ci,t=new Ci,n=new Ci,i=new Ci,s=new Ci,a=new Ci){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Zn){const n=this.planes,i=e.elements,s=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],u=i[6],d=i[7],f=i[8],m=i[9],_=i[10],g=i[11],p=i[12],x=i[13],T=i[14],v=i[15];if(n[0].setComponents(l-s,d-c,g-f,v-p).normalize(),n[1].setComponents(l+s,d+c,g+f,v+p).normalize(),n[2].setComponents(l+a,d+h,g+m,v+x).normalize(),n[3].setComponents(l-a,d-h,g-m,v-x).normalize(),n[4].setComponents(l-o,d-u,g-_,v-T).normalize(),t===Zn)n[5].setComponents(l+o,d+u,g+_,v+T).normalize();else if(t===oa)n[5].setComponents(o,u,_,T).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),wi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),wi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(wi)}intersectsSprite(e){return wi.center.set(0,0,0),wi.radius=.7071067811865476,wi.applyMatrix4(e.matrixWorld),this.intersectsSphere(wi)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Pr.x=i.normal.x>0?e.max.x:e.min.x,Pr.y=i.normal.y>0?e.max.y:e.min.y,Pr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Pr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Iu(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function rp(r){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,d=r.createBuffer();r.bindBuffer(l,d),r.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=r.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=r.SHORT;else if(c instanceof Uint32Array)f=r.UNSIGNED_INT;else if(c instanceof Int32Array)f=r.INT;else if(c instanceof Int8Array)f=r.BYTE;else if(c instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(r.bindBuffer(c,o),u.length===0)r.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){const m=u[d],_=u[f];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){const _=u[f];r.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(r.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:s,update:a}}class Dn extends _t{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=e/o,d=t/l,f=[],m=[],_=[],g=[];for(let p=0;p<h;p++){const x=p*d-a;for(let T=0;T<c;T++){const v=T*u-s;m.push(v,-x,0),_.push(0,0,1),g.push(T/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<o;x++){const T=x+c*p,v=x+c*(p+1),D=x+1+c*(p+1),E=x+1+c*p;f.push(T,v,E),f.push(v,D,E)}this.setIndex(f),this.setAttribute("position",new Ze(m,3)),this.setAttribute("normal",new Ze(_,3)),this.setAttribute("uv",new Ze(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Dn(e.width,e.height,e.widthSegments,e.heightSegments)}}var ap=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,op=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,lp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,up=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,dp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,fp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,pp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,mp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,gp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,_p=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,vp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,xp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,yp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Mp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Tp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Sp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,bp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,wp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Ep=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ap=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Rp=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Cp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Pp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Dp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Ip=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Lp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Up=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Np=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Fp="gl_FragColor = linearToOutputTexel( gl_FragColor );",kp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Op=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Bp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,zp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Hp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Vp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Gp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Wp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Xp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,qp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,jp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Yp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,$p=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Kp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Zp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Qp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Jp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,em=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,tm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,nm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,im=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,sm=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,rm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,am=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,om=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,cm=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hm=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,um=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,dm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,fm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,pm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,mm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,_m=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,vm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,xm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ym=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Mm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Tm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,bm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,wm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Em=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Am=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Rm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Cm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Pm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Dm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Im=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Lm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Um=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Nm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Fm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,km=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Om=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Bm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,zm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Hm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Vm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Gm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Wm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Xm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,qm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,jm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ym=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,$m=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Km=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Zm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Qm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Jm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,eg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,tg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ng=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ig=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,sg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const rg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ag=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,og=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,lg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,hg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ug=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,dg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,fg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,pg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,mg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,gg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_g=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,vg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,xg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,yg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Mg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,bg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Eg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Ag=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Pg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ig=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Lg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Ug=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ng=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Fg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,kg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Og=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ne={alphahash_fragment:ap,alphahash_pars_fragment:op,alphamap_fragment:lp,alphamap_pars_fragment:cp,alphatest_fragment:hp,alphatest_pars_fragment:up,aomap_fragment:dp,aomap_pars_fragment:fp,batching_pars_vertex:pp,batching_vertex:mp,begin_vertex:gp,beginnormal_vertex:_p,bsdfs:vp,iridescence_fragment:xp,bumpmap_pars_fragment:yp,clipping_planes_fragment:Mp,clipping_planes_pars_fragment:Tp,clipping_planes_pars_vertex:Sp,clipping_planes_vertex:bp,color_fragment:wp,color_pars_fragment:Ep,color_pars_vertex:Ap,color_vertex:Rp,common:Cp,cube_uv_reflection_fragment:Pp,defaultnormal_vertex:Dp,displacementmap_pars_vertex:Ip,displacementmap_vertex:Lp,emissivemap_fragment:Up,emissivemap_pars_fragment:Np,colorspace_fragment:Fp,colorspace_pars_fragment:kp,envmap_fragment:Op,envmap_common_pars_fragment:Bp,envmap_pars_fragment:zp,envmap_pars_vertex:Hp,envmap_physical_pars_fragment:Qp,envmap_vertex:Vp,fog_vertex:Gp,fog_pars_vertex:Wp,fog_fragment:Xp,fog_pars_fragment:qp,gradientmap_pars_fragment:jp,lightmap_pars_fragment:Yp,lights_lambert_fragment:$p,lights_lambert_pars_fragment:Kp,lights_pars_begin:Zp,lights_toon_fragment:Jp,lights_toon_pars_fragment:em,lights_phong_fragment:tm,lights_phong_pars_fragment:nm,lights_physical_fragment:im,lights_physical_pars_fragment:sm,lights_fragment_begin:rm,lights_fragment_maps:am,lights_fragment_end:om,logdepthbuf_fragment:lm,logdepthbuf_pars_fragment:cm,logdepthbuf_pars_vertex:hm,logdepthbuf_vertex:um,map_fragment:dm,map_pars_fragment:fm,map_particle_fragment:pm,map_particle_pars_fragment:mm,metalnessmap_fragment:gm,metalnessmap_pars_fragment:_m,morphinstance_vertex:vm,morphcolor_vertex:xm,morphnormal_vertex:ym,morphtarget_pars_vertex:Mm,morphtarget_vertex:Tm,normal_fragment_begin:Sm,normal_fragment_maps:bm,normal_pars_fragment:wm,normal_pars_vertex:Em,normal_vertex:Am,normalmap_pars_fragment:Rm,clearcoat_normal_fragment_begin:Cm,clearcoat_normal_fragment_maps:Pm,clearcoat_pars_fragment:Dm,iridescence_pars_fragment:Im,opaque_fragment:Lm,packing:Um,premultiplied_alpha_fragment:Nm,project_vertex:Fm,dithering_fragment:km,dithering_pars_fragment:Om,roughnessmap_fragment:Bm,roughnessmap_pars_fragment:zm,shadowmap_pars_fragment:Hm,shadowmap_pars_vertex:Vm,shadowmap_vertex:Gm,shadowmask_pars_fragment:Wm,skinbase_vertex:Xm,skinning_pars_vertex:qm,skinning_vertex:jm,skinnormal_vertex:Ym,specularmap_fragment:$m,specularmap_pars_fragment:Km,tonemapping_fragment:Zm,tonemapping_pars_fragment:Qm,transmission_fragment:Jm,transmission_pars_fragment:eg,uv_pars_fragment:tg,uv_pars_vertex:ng,uv_vertex:ig,worldpos_vertex:sg,background_vert:rg,background_frag:ag,backgroundCube_vert:og,backgroundCube_frag:lg,cube_vert:cg,cube_frag:hg,depth_vert:ug,depth_frag:dg,distanceRGBA_vert:fg,distanceRGBA_frag:pg,equirect_vert:mg,equirect_frag:gg,linedashed_vert:_g,linedashed_frag:vg,meshbasic_vert:xg,meshbasic_frag:yg,meshlambert_vert:Mg,meshlambert_frag:Tg,meshmatcap_vert:Sg,meshmatcap_frag:bg,meshnormal_vert:wg,meshnormal_frag:Eg,meshphong_vert:Ag,meshphong_frag:Rg,meshphysical_vert:Cg,meshphysical_frag:Pg,meshtoon_vert:Dg,meshtoon_frag:Ig,points_vert:Lg,points_frag:Ug,shadow_vert:Ng,shadow_frag:Fg,sprite_vert:kg,sprite_frag:Og},ce={common:{diffuse:{value:new ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new He}},envmap:{envMap:{value:null},envMapRotation:{value:new He},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new He}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new He}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new He},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new He},normalScale:{value:new Re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new He},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new He}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new He}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new He}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0},uvTransform:{value:new He}},sprite:{diffuse:{value:new ue(16777215)},opacity:{value:1},center:{value:new Re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}}},Rn={basic:{uniforms:Ht([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.fog]),vertexShader:Ne.meshbasic_vert,fragmentShader:Ne.meshbasic_frag},lambert:{uniforms:Ht([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new ue(0)}}]),vertexShader:Ne.meshlambert_vert,fragmentShader:Ne.meshlambert_frag},phong:{uniforms:Ht([ce.common,ce.specularmap,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,ce.lights,{emissive:{value:new ue(0)},specular:{value:new ue(1118481)},shininess:{value:30}}]),vertexShader:Ne.meshphong_vert,fragmentShader:Ne.meshphong_frag},standard:{uniforms:Ht([ce.common,ce.envmap,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.roughnessmap,ce.metalnessmap,ce.fog,ce.lights,{emissive:{value:new ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ne.meshphysical_vert,fragmentShader:Ne.meshphysical_frag},toon:{uniforms:Ht([ce.common,ce.aomap,ce.lightmap,ce.emissivemap,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.gradientmap,ce.fog,ce.lights,{emissive:{value:new ue(0)}}]),vertexShader:Ne.meshtoon_vert,fragmentShader:Ne.meshtoon_frag},matcap:{uniforms:Ht([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,ce.fog,{matcap:{value:null}}]),vertexShader:Ne.meshmatcap_vert,fragmentShader:Ne.meshmatcap_frag},points:{uniforms:Ht([ce.points,ce.fog]),vertexShader:Ne.points_vert,fragmentShader:Ne.points_frag},dashed:{uniforms:Ht([ce.common,ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ne.linedashed_vert,fragmentShader:Ne.linedashed_frag},depth:{uniforms:Ht([ce.common,ce.displacementmap]),vertexShader:Ne.depth_vert,fragmentShader:Ne.depth_frag},normal:{uniforms:Ht([ce.common,ce.bumpmap,ce.normalmap,ce.displacementmap,{opacity:{value:1}}]),vertexShader:Ne.meshnormal_vert,fragmentShader:Ne.meshnormal_frag},sprite:{uniforms:Ht([ce.sprite,ce.fog]),vertexShader:Ne.sprite_vert,fragmentShader:Ne.sprite_frag},background:{uniforms:{uvTransform:{value:new He},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ne.background_vert,fragmentShader:Ne.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new He}},vertexShader:Ne.backgroundCube_vert,fragmentShader:Ne.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ne.cube_vert,fragmentShader:Ne.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ne.equirect_vert,fragmentShader:Ne.equirect_frag},distanceRGBA:{uniforms:Ht([ce.common,ce.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ne.distanceRGBA_vert,fragmentShader:Ne.distanceRGBA_frag},shadow:{uniforms:Ht([ce.lights,ce.fog,{color:{value:new ue(0)},opacity:{value:1}}]),vertexShader:Ne.shadow_vert,fragmentShader:Ne.shadow_frag}};Rn.physical={uniforms:Ht([Rn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new He},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new He},clearcoatNormalScale:{value:new Re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new He},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new He},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new He},sheen:{value:0},sheenColor:{value:new ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new He},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new He},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new He},transmissionSamplerSize:{value:new Re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new He},attenuationDistance:{value:0},attenuationColor:{value:new ue(0)},specularColor:{value:new ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new He},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new He},anisotropyVector:{value:new Re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new He}}]),vertexShader:Ne.meshphysical_vert,fragmentShader:Ne.meshphysical_frag};const Dr={r:0,b:0,g:0},Ei=new Ln,Bg=new Ce;function zg(r,e,t,n,i,s,a){const o=new ue(0);let l=s===!0?0:1,c,h,u=null,d=0,f=null;function m(x){let T=x.isScene===!0?x.background:null;return T&&T.isTexture&&(T=(x.backgroundBlurriness>0?t:e).get(T)),T}function _(x){let T=!1;const v=m(x);v===null?p(o,l):v&&v.isColor&&(p(v,1),T=!0);const D=r.xr.getEnvironmentBlendMode();D==="additive"?n.buffers.color.setClear(0,0,0,1,a):D==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||T)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function g(x,T){const v=m(T);v&&(v.isCubeTexture||v.mapping===fa)?(h===void 0&&(h=new $e(new Ts(1,1,1),new dt({name:"BackgroundCubeMaterial",uniforms:_s(Rn.backgroundCube.uniforms),vertexShader:Rn.backgroundCube.vertexShader,fragmentShader:Rn.backgroundCube.fragmentShader,side:Ot,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(D,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Ei.copy(T.backgroundRotation),Ei.x*=-1,Ei.y*=-1,Ei.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Ei.y*=-1,Ei.z*=-1),h.material.uniforms.envMap.value=v,h.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Bg.makeRotationFromEuler(Ei)),h.material.toneMapped=Xe.getTransfer(v.colorSpace)!==st,(u!==v||d!==v.version||f!==r.toneMapping)&&(h.material.needsUpdate=!0,u=v,d=v.version,f=r.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new $e(new Dn(2,2),new dt({name:"BackgroundMaterial",uniforms:_s(Rn.background.uniforms),vertexShader:Rn.background.vertexShader,fragmentShader:Rn.background.fragmentShader,side:ei,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.toneMapped=Xe.getTransfer(v.colorSpace)!==st,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||d!==v.version||f!==r.toneMapping)&&(c.material.needsUpdate=!0,u=v,d=v.version,f=r.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,T){x.getRGB(Dr,Cu(r)),n.buffers.color.setClear(Dr.r,Dr.g,Dr.b,T,a)}return{getClearColor:function(){return o},setClearColor:function(x,T=1){o.set(x),l=T,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(o,l)},render:_,addToRenderList:g}}function Hg(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=d(null);let s=i,a=!1;function o(y,R,L,I,O){let V=!1;const B=u(I,L,R);s!==B&&(s=B,c(s.object)),V=f(y,I,L,O),V&&m(y,I,L,O),O!==null&&e.update(O,r.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,v(y,R,L,I),O!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return r.createVertexArray()}function c(y){return r.bindVertexArray(y)}function h(y){return r.deleteVertexArray(y)}function u(y,R,L){const I=L.wireframe===!0;let O=n[y.id];O===void 0&&(O={},n[y.id]=O);let V=O[R.id];V===void 0&&(V={},O[R.id]=V);let B=V[I];return B===void 0&&(B=d(l()),V[I]=B),B}function d(y){const R=[],L=[],I=[];for(let O=0;O<t;O++)R[O]=0,L[O]=0,I[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:L,attributeDivisors:I,object:y,attributes:{},index:null}}function f(y,R,L,I){const O=s.attributes,V=R.attributes;let B=0;const Y=L.getAttributes();for(const G in Y)if(Y[G].location>=0){const K=O[G];let J=V[G];if(J===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(J=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(J=y.instanceColor)),K===void 0||K.attribute!==J||J&&K.data!==J.data)return!0;B++}return s.attributesNum!==B||s.index!==I}function m(y,R,L,I){const O={},V=R.attributes;let B=0;const Y=L.getAttributes();for(const G in Y)if(Y[G].location>=0){let K=V[G];K===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(K=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(K=y.instanceColor));const J={};J.attribute=K,K&&K.data&&(J.data=K.data),O[G]=J,B++}s.attributes=O,s.attributesNum=B,s.index=I}function _(){const y=s.newAttributes;for(let R=0,L=y.length;R<L;R++)y[R]=0}function g(y){p(y,0)}function p(y,R){const L=s.newAttributes,I=s.enabledAttributes,O=s.attributeDivisors;L[y]=1,I[y]===0&&(r.enableVertexAttribArray(y),I[y]=1),O[y]!==R&&(r.vertexAttribDivisor(y,R),O[y]=R)}function x(){const y=s.newAttributes,R=s.enabledAttributes;for(let L=0,I=R.length;L<I;L++)R[L]!==y[L]&&(r.disableVertexAttribArray(L),R[L]=0)}function T(y,R,L,I,O,V,B){B===!0?r.vertexAttribIPointer(y,R,L,O,V):r.vertexAttribPointer(y,R,L,I,O,V)}function v(y,R,L,I){_();const O=I.attributes,V=L.getAttributes(),B=R.defaultAttributeValues;for(const Y in V){const G=V[Y];if(G.location>=0){let H=O[Y];if(H===void 0&&(Y==="instanceMatrix"&&y.instanceMatrix&&(H=y.instanceMatrix),Y==="instanceColor"&&y.instanceColor&&(H=y.instanceColor)),H!==void 0){const K=H.normalized,J=H.itemSize,se=e.get(H);if(se===void 0)continue;const ye=se.buffer,j=se.type,te=se.bytesPerElement,oe=j===r.INT||j===r.UNSIGNED_INT||H.gpuType===yl;if(H.isInterleavedBufferAttribute){const ie=H.data,he=ie.stride,de=H.offset;if(ie.isInstancedInterleavedBuffer){for(let _e=0;_e<G.locationSize;_e++)p(G.location+_e,ie.meshPerAttribute);y.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let _e=0;_e<G.locationSize;_e++)g(G.location+_e);r.bindBuffer(r.ARRAY_BUFFER,ye);for(let _e=0;_e<G.locationSize;_e++)T(G.location+_e,J/G.locationSize,j,K,he*te,(de+J/G.locationSize*_e)*te,oe)}else{if(H.isInstancedBufferAttribute){for(let ie=0;ie<G.locationSize;ie++)p(G.location+ie,H.meshPerAttribute);y.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=H.meshPerAttribute*H.count)}else for(let ie=0;ie<G.locationSize;ie++)g(G.location+ie);r.bindBuffer(r.ARRAY_BUFFER,ye);for(let ie=0;ie<G.locationSize;ie++)T(G.location+ie,J/G.locationSize,j,K,J*te,J/G.locationSize*ie*te,oe)}}else if(B!==void 0){const K=B[Y];if(K!==void 0)switch(K.length){case 2:r.vertexAttrib2fv(G.location,K);break;case 3:r.vertexAttrib3fv(G.location,K);break;case 4:r.vertexAttrib4fv(G.location,K);break;default:r.vertexAttrib1fv(G.location,K)}}}}x()}function D(){w();for(const y in n){const R=n[y];for(const L in R){const I=R[L];for(const O in I)h(I[O].object),delete I[O];delete R[L]}delete n[y]}}function E(y){if(n[y.id]===void 0)return;const R=n[y.id];for(const L in R){const I=R[L];for(const O in I)h(I[O].object),delete I[O];delete R[L]}delete n[y.id]}function A(y){for(const R in n){const L=n[R];if(L[y.id]===void 0)continue;const I=L[y.id];for(const O in I)h(I[O].object),delete I[O];delete L[y.id]}}function w(){M(),a=!0,s!==i&&(s=i,c(s.object))}function M(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:w,resetDefaultState:M,dispose:D,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:g,disableUnusedAttributes:x}}function Vg(r,e,t){let n;function i(c){n=c}function s(c,h){r.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(r.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let m=0;m<u;m++)f+=h[m];t.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let m=0;m<c.length;m++)a(c[m],h[m],d[m]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let m=0;for(let _=0;_<u;_++)m+=h[_]*d[_];t.update(m,n,1)}}this.setMode=i,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Gg(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(A){return!(A!==Wt&&n.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const w=A===kt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==In&&n.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Kt&&!w)}function l(A){if(A==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),m=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=r.getParameter(r.MAX_TEXTURE_SIZE),g=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),p=r.getParameter(r.MAX_VERTEX_ATTRIBS),x=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),T=r.getParameter(r.MAX_VARYING_VECTORS),v=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),D=m>0,E=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:x,maxVaryings:T,maxFragmentUniforms:v,vertexTextures:D,maxSamples:E}}function Wg(r){const e=this;let t=null,n=0,i=!1,s=!1;const a=new Ci,o=new He,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const m=u.clippingPlanes,_=u.clipIntersection,g=u.clipShadows,p=r.get(u);if(!i||m===null||m.length===0||s&&!g)s?h(null):c();else{const x=s?0:n,T=x*4;let v=p.clippingState||null;l.value=v,v=h(m,d,T,f);for(let D=0;D!==T;++D)v[D]=t[D];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,m){const _=u!==null?u.length:0;let g=null;if(_!==0){if(g=l.value,m!==!0||g===null){const p=f+_*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(g===null||g.length<p)&&(g=new Float32Array(p));for(let T=0,v=f;T!==_;++T,v+=4)a.copy(u[T]).applyMatrix4(x,o),a.normal.toArray(g,v),g[v+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,g}}function Xg(r){let e=new WeakMap;function t(a,o){return o===sa?a.mapping=ps:o===Eo&&(a.mapping=ms),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===sa||o===Eo)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new np(l.height);return c.fromEquirectangularTexture(r,a),e.set(a,c),a.addEventListener("dispose",i),t(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class ga extends Pu{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const ls=4,zc=[.125,.215,.35,.446,.526,.582],Di=20,qa=new ga,Hc=new ue;let ja=null,Ya=0,$a=0,Ka=!1;const Pi=(1+Math.sqrt(5))/2,is=1/Pi,Vc=[new P(-Pi,is,0),new P(Pi,is,0),new P(-is,0,Pi),new P(is,0,Pi),new P(0,Pi,-is),new P(0,Pi,is),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)];class nl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){ja=this._renderer.getRenderTarget(),Ya=this._renderer.getActiveCubeFace(),$a=this._renderer.getActiveMipmapLevel(),Ka=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Xc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Wc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ja,Ya,$a),this._renderer.xr.enabled=Ka,e.scissorTest=!1,Ir(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ps||e.mapping===ms?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ja=this._renderer.getRenderTarget(),Ya=this._renderer.getActiveCubeFace(),$a=this._renderer.getActiveMipmapLevel(),Ka=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:gt,minFilter:gt,generateMipmaps:!1,type:kt,format:Wt,colorSpace:Bt,depthBuffer:!1},i=Gc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Gc(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=qg(s)),this._blurMaterial=jg(s,e,t)}return i}_compileMaterial(e){const t=new $e(this._lodPlanes[0],e);this._renderer.compile(t,qa)}_sceneToCubeUV(e,t,n,i){const o=new Gt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(Hc),h.toneMapping=_i,h.autoClear=!1;const f=new Ct({name:"PMREM.Background",side:Ot,depthWrite:!1,depthTest:!1}),m=new $e(new Ts,f);let _=!1;const g=e.background;g?g.isColor&&(f.color.copy(g),e.background=null,_=!0):(f.color.copy(Hc),_=!0);for(let p=0;p<6;p++){const x=p%3;x===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):x===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));const T=this._cubeSize;Ir(i,x*T,p>2?T:0,T,T),h.setRenderTarget(i),_&&h.render(m,o),h.render(e,o)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=g}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===ps||e.mapping===ms;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Xc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Wc());const s=i?this._cubemapMaterial:this._equirectMaterial,a=new $e(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;Ir(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,qa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Vc[(i-s-1)%Vc.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,i,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new $e(this._lodPlanes[i],c),d=c.uniforms,f=this._sizeLods[n]-1,m=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Di-1),_=s/m,g=isFinite(s)?1+Math.floor(h*_):Di;g>Di&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Di}`);const p=[];let x=0;for(let A=0;A<Di;++A){const w=A/_,M=Math.exp(-w*w/2);p.push(M),A===0?x+=M:A<g&&(x+=2*M)}for(let A=0;A<p.length;A++)p[A]=p[A]/x;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:T}=this;d.dTheta.value=m,d.mipInt.value=T-n;const v=this._sizeLods[i],D=3*v*(i>T-ls?i-T+ls:0),E=4*(this._cubeSize-v);Ir(t,D,E,3*v,2*v),l.setRenderTarget(t),l.render(u,qa)}}function qg(r){const e=[],t=[],n=[];let i=r;const s=r-ls+1+zc.length;for(let a=0;a<s;a++){const o=Math.pow(2,i);t.push(o);let l=1/o;a>r-ls?l=zc[a-r+ls-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,m=6,_=3,g=2,p=1,x=new Float32Array(_*m*f),T=new Float32Array(g*m*f),v=new Float32Array(p*m*f);for(let E=0;E<f;E++){const A=E%3*2/3-1,w=E>2?0:-1,M=[A,w,0,A+2/3,w,0,A+2/3,w+1,0,A,w,0,A+2/3,w+1,0,A,w+1,0];x.set(M,_*m*E),T.set(d,g*m*E);const y=[E,E,E,E,E,E];v.set(y,p*m*E)}const D=new _t;D.setAttribute("position",new xt(x,_)),D.setAttribute("uv",new xt(T,g)),D.setAttribute("faceIndex",new xt(v,p)),e.push(D),i>ls&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Gc(r,e,t){const n=new Qt(r,e,t);return n.texture.mapping=fa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ir(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function jg(r,e,t){const n=new Float32Array(Di),i=new P(0,1,0);return new dt({name:"SphericalGaussianBlur",defines:{n:Di,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Et,depthTest:!1,depthWrite:!1})}function Wc(){return new dt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Et,depthTest:!1,depthWrite:!1})}function Xc(){return new dt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Et,depthTest:!1,depthWrite:!1})}function Dl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Yg(r){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===sa||l===Eo,h=l===ps||l===ms;if(c||h){let u=e.get(o);const d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new nl(r)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const f=o.image;return c&&f&&f.height>0||h&&f&&i(f)?(t===null&&(t=new nl(r)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",s),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function $g(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Ws("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Kg(r,e,t,n){const i={},s=new WeakMap;function a(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const m in d.attributes)e.remove(d.attributes[m]);for(const m in d.morphAttributes){const _=d.morphAttributes[m];for(let g=0,p=_.length;g<p;g++)e.remove(_[g])}d.removeEventListener("dispose",a),delete i[d.id];const f=s.get(d);f&&(e.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const m in d)e.update(d[m],r.ARRAY_BUFFER);const f=u.morphAttributes;for(const m in f){const _=f[m];for(let g=0,p=_.length;g<p;g++)e.update(_[g],r.ARRAY_BUFFER)}}function c(u){const d=[],f=u.index,m=u.attributes.position;let _=0;if(f!==null){const x=f.array;_=f.version;for(let T=0,v=x.length;T<v;T+=3){const D=x[T+0],E=x[T+1],A=x[T+2];d.push(D,E,E,A,A,D)}}else if(m!==void 0){const x=m.array;_=m.version;for(let T=0,v=x.length/3-1;T<v;T+=3){const D=T+0,E=T+1,A=T+2;d.push(D,E,E,A,A,D)}}else return;const g=new(Tu(d)?Ru:Au)(d,1);g.version=_;const p=s.get(u);p&&e.remove(p),s.set(u,g)}function h(u){const d=s.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return s.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function Zg(r,e,t){let n;function i(d){n=d}let s,a;function o(d){s=d.type,a=d.bytesPerElement}function l(d,f){r.drawElements(n,f,s,d*a),t.update(f,n,1)}function c(d,f,m){m!==0&&(r.drawElementsInstanced(n,f,s,d*a,m),t.update(f,n,m))}function h(d,f,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,d,0,m);let g=0;for(let p=0;p<m;p++)g+=f[p];t.update(g,n,1)}function u(d,f,m,_){if(m===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<d.length;p++)c(d[p]/a,f[p],_[p]);else{g.multiDrawElementsInstancedWEBGL(n,f,0,s,d,0,_,0,m);let p=0;for(let x=0;x<m;x++)p+=f[x]*_[x];t.update(p,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Qg(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Jg(r,e,t){const n=new WeakMap,i=new Ke;function s(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==u){let y=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",y)};var f=y;d!==void 0&&d.texture.dispose();const m=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],x=o.morphAttributes.normal||[],T=o.morphAttributes.color||[];let v=0;m===!0&&(v=1),_===!0&&(v=2),g===!0&&(v=3);let D=o.attributes.position.count*v,E=1;D>e.maxTextureSize&&(E=Math.ceil(D/e.maxTextureSize),D=e.maxTextureSize);const A=new Float32Array(D*E*4*u),w=new bu(A,D,E,u);w.type=Kt,w.needsUpdate=!0;const M=v*4;for(let R=0;R<u;R++){const L=p[R],I=x[R],O=T[R],V=D*E*4*R;for(let B=0;B<L.count;B++){const Y=B*M;m===!0&&(i.fromBufferAttribute(L,B),A[V+Y+0]=i.x,A[V+Y+1]=i.y,A[V+Y+2]=i.z,A[V+Y+3]=0),_===!0&&(i.fromBufferAttribute(I,B),A[V+Y+4]=i.x,A[V+Y+5]=i.y,A[V+Y+6]=i.z,A[V+Y+7]=0),g===!0&&(i.fromBufferAttribute(O,B),A[V+Y+8]=i.x,A[V+Y+9]=i.y,A[V+Y+10]=i.z,A[V+Y+11]=O.itemSize===4?i.w:1)}}d={count:u,texture:w,size:new Re(D,E)},n.set(o,d),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",a.morphTexture,t);else{let m=0;for(let g=0;g<c.length;g++)m+=c[g];const _=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(r,"morphTargetBaseInfluence",_),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function e0(r,e,t,n){let i=new WeakMap;function s(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(t.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,r.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:a}}class Il extends vt{constructor(e,t,n,i,s,a,o,l,c,h=cs){if(h!==cs&&h!==Oi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===cs&&(n=Fi),n===void 0&&h===Oi&&(n=ki),super(null,i,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Pt,this.minFilter=l!==void 0?l:Pt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Lu=new vt,qc=new Il(1,1),Uu=new bu,Nu=new Of,Fu=new Du,jc=[],Yc=[],$c=new Float32Array(16),Kc=new Float32Array(9),Zc=new Float32Array(4);function Ss(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=jc[i];if(s===void 0&&(s=new Float32Array(i),jc[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function yt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Mt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function _a(r,e){let t=Yc[e];t===void 0&&(t=new Int32Array(e),Yc[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function t0(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function n0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;r.uniform2fv(this.addr,e),Mt(t,e)}}function i0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yt(t,e))return;r.uniform3fv(this.addr,e),Mt(t,e)}}function s0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;r.uniform4fv(this.addr,e),Mt(t,e)}}function r0(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;Zc.set(n),r.uniformMatrix2fv(this.addr,!1,Zc),Mt(t,n)}}function a0(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;Kc.set(n),r.uniformMatrix3fv(this.addr,!1,Kc),Mt(t,n)}}function o0(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Mt(t,e)}else{if(yt(t,n))return;$c.set(n),r.uniformMatrix4fv(this.addr,!1,$c),Mt(t,n)}}function l0(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function c0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;r.uniform2iv(this.addr,e),Mt(t,e)}}function h0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;r.uniform3iv(this.addr,e),Mt(t,e)}}function u0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;r.uniform4iv(this.addr,e),Mt(t,e)}}function d0(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function f0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;r.uniform2uiv(this.addr,e),Mt(t,e)}}function p0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;r.uniform3uiv(this.addr,e),Mt(t,e)}}function m0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;r.uniform4uiv(this.addr,e),Mt(t,e)}}function g0(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(qc.compareFunction=Mu,s=qc):s=Lu,t.setTexture2D(e||s,i)}function _0(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Nu,i)}function v0(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Fu,i)}function x0(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Uu,i)}function y0(r){switch(r){case 5126:return t0;case 35664:return n0;case 35665:return i0;case 35666:return s0;case 35674:return r0;case 35675:return a0;case 35676:return o0;case 5124:case 35670:return l0;case 35667:case 35671:return c0;case 35668:case 35672:return h0;case 35669:case 35673:return u0;case 5125:return d0;case 36294:return f0;case 36295:return p0;case 36296:return m0;case 35678:case 36198:case 36298:case 36306:case 35682:return g0;case 35679:case 36299:case 36307:return _0;case 35680:case 36300:case 36308:case 36293:return v0;case 36289:case 36303:case 36311:case 36292:return x0}}function M0(r,e){r.uniform1fv(this.addr,e)}function T0(r,e){const t=Ss(e,this.size,2);r.uniform2fv(this.addr,t)}function S0(r,e){const t=Ss(e,this.size,3);r.uniform3fv(this.addr,t)}function b0(r,e){const t=Ss(e,this.size,4);r.uniform4fv(this.addr,t)}function w0(r,e){const t=Ss(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function E0(r,e){const t=Ss(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function A0(r,e){const t=Ss(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function R0(r,e){r.uniform1iv(this.addr,e)}function C0(r,e){r.uniform2iv(this.addr,e)}function P0(r,e){r.uniform3iv(this.addr,e)}function D0(r,e){r.uniform4iv(this.addr,e)}function I0(r,e){r.uniform1uiv(this.addr,e)}function L0(r,e){r.uniform2uiv(this.addr,e)}function U0(r,e){r.uniform3uiv(this.addr,e)}function N0(r,e){r.uniform4uiv(this.addr,e)}function F0(r,e,t){const n=this.cache,i=e.length,s=_a(t,i);yt(n,s)||(r.uniform1iv(this.addr,s),Mt(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||Lu,s[a])}function k0(r,e,t){const n=this.cache,i=e.length,s=_a(t,i);yt(n,s)||(r.uniform1iv(this.addr,s),Mt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Nu,s[a])}function O0(r,e,t){const n=this.cache,i=e.length,s=_a(t,i);yt(n,s)||(r.uniform1iv(this.addr,s),Mt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Fu,s[a])}function B0(r,e,t){const n=this.cache,i=e.length,s=_a(t,i);yt(n,s)||(r.uniform1iv(this.addr,s),Mt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Uu,s[a])}function z0(r){switch(r){case 5126:return M0;case 35664:return T0;case 35665:return S0;case 35666:return b0;case 35674:return w0;case 35675:return E0;case 35676:return A0;case 5124:case 35670:return R0;case 35667:case 35671:return C0;case 35668:case 35672:return P0;case 35669:case 35673:return D0;case 5125:return I0;case 36294:return L0;case 36295:return U0;case 36296:return N0;case 35678:case 36198:case 36298:case 36306:case 35682:return F0;case 35679:case 36299:case 36307:return k0;case 35680:case 36300:case 36308:case 36293:return O0;case 36289:case 36303:case 36311:case 36292:return B0}}class H0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=y0(t.type)}}class V0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=z0(t.type)}}class G0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,a=i.length;s!==a;++s){const o=i[s];o.setValue(e,t[o.id],n)}}}const Za=/(\w+)(\])?(\[|\.)?/g;function Qc(r,e){r.seq.push(e),r.map[e.id]=e}function W0(r,e,t){const n=r.name,i=n.length;for(Za.lastIndex=0;;){const s=Za.exec(n),a=Za.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){Qc(t,c===void 0?new H0(o,r,e):new V0(o,r,e));break}else{let u=t.map[o];u===void 0&&(u=new G0(o),Qc(t,u)),t=u}}}class ea{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),a=e.getUniformLocation(t,s.name);W0(s,a,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function Jc(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const X0=37297;let q0=0;function j0(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const eh=new He;function Y0(r){Xe._getMatrix(eh,Xe.workingColorSpace,r);const e=`mat3( ${eh.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(r)){case pa:return[e,"LinearTransferOETF"];case st:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function th(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+j0(r.getShaderSource(e),a)}else return i}function $0(r,e){const t=Y0(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function K0(r,e){let t;switch(e){case nu:t="Linear";break;case iu:t="Reinhard";break;case su:t="Cineon";break;case xl:t="ACESFilmic";break;case ru:t="AgX";break;case au:t="Neutral";break;case Qd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Lr=new P;function Z0(){Xe.getLuminanceCoefficients(Lr);const r=Lr.x.toFixed(4),e=Lr.y.toFixed(4),t=Lr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Q0(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Xs).join(`
`)}function J0(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function e_(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),a=s.name;let o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function Xs(r){return r!==""}function nh(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ih(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const t_=/^[ \t]*#include +<([\w\d./]+)>/gm;function il(r){return r.replace(t_,i_)}const n_=new Map;function i_(r,e){let t=Ne[e];if(t===void 0){const n=n_.get(e);if(n!==void 0)t=Ne[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return il(t)}const s_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function sh(r){return r.replace(s_,r_)}function r_(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function rh(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function a_(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===Qh?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===Jh?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===jn&&(e="SHADOWMAP_TYPE_VSM"),e}function o_(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case ps:case ms:e="ENVMAP_TYPE_CUBE";break;case fa:e="ENVMAP_TYPE_CUBE_UV";break}return e}function l_(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case ms:e="ENVMAP_MODE_REFRACTION";break}return e}function c_(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case tu:e="ENVMAP_BLENDING_MULTIPLY";break;case Kd:e="ENVMAP_BLENDING_MIX";break;case Zd:e="ENVMAP_BLENDING_ADD";break}return e}function h_(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function u_(r,e,t,n){const i=r.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=a_(t),c=o_(t),h=l_(t),u=c_(t),d=h_(t),f=Q0(t),m=J0(s),_=i.createProgram();let g,p,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Xs).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Xs).join(`
`),p.length>0&&(p+=`
`)):(g=[rh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Xs).join(`
`),p=[rh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==_i?"#define TONE_MAPPING":"",t.toneMapping!==_i?Ne.tonemapping_pars_fragment:"",t.toneMapping!==_i?K0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ne.colorspace_pars_fragment,$0("linearToOutputTexel",t.outputColorSpace),Z0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Xs).join(`
`)),a=il(a),a=nh(a,t),a=ih(a,t),o=il(o),o=nh(o,t),o=ih(o,t),a=sh(a),o=sh(o),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===vc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===vc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const T=x+g+a,v=x+p+o,D=Jc(i,i.VERTEX_SHADER,T),E=Jc(i,i.FRAGMENT_SHADER,v);i.attachShader(_,D),i.attachShader(_,E),t.index0AttributeName!==void 0?i.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function A(R){if(r.debug.checkShaderErrors){const L=i.getProgramInfoLog(_).trim(),I=i.getShaderInfoLog(D).trim(),O=i.getShaderInfoLog(E).trim();let V=!0,B=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(V=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,_,D,E);else{const Y=th(i,D,"vertex"),G=th(i,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+L+`
`+Y+`
`+G)}else L!==""?console.warn("THREE.WebGLProgram: Program Info Log:",L):(I===""||O==="")&&(B=!1);B&&(R.diagnostics={runnable:V,programLog:L,vertexShader:{log:I,prefix:g},fragmentShader:{log:O,prefix:p}})}i.deleteShader(D),i.deleteShader(E),w=new ea(i,_),M=e_(i,_)}let w;this.getUniforms=function(){return w===void 0&&A(this),w};let M;this.getAttributes=function(){return M===void 0&&A(this),M};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=i.getProgramParameter(_,X0)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=q0++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=D,this.fragmentShader=E,this}let d_=0;class f_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new p_(e),t.set(e,n)),n}}class p_{constructor(e){this.id=d_++,this.code=e,this.usedTimes=0}}function m_(r,e,t,n,i,s,a){const o=new wu,l=new f_,c=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(M){return c.add(M),M===0?"uv":`uv${M}`}function g(M,y,R,L,I){const O=L.fog,V=I.geometry,B=M.isMeshStandardMaterial?L.environment:null,Y=(M.isMeshStandardMaterial?t:e).get(M.envMap||B),G=Y&&Y.mapping===fa?Y.image.height:null,H=m[M.type];M.precision!==null&&(f=i.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));const K=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,J=K!==void 0?K.length:0;let se=0;V.morphAttributes.position!==void 0&&(se=1),V.morphAttributes.normal!==void 0&&(se=2),V.morphAttributes.color!==void 0&&(se=3);let ye,j,te,oe;if(H){const it=Rn[H];ye=it.vertexShader,j=it.fragmentShader}else ye=M.vertexShader,j=M.fragmentShader,l.update(M),te=l.getVertexShaderID(M),oe=l.getFragmentShaderID(M);const ie=r.getRenderTarget(),he=r.state.buffers.depth.getReversed(),de=I.isInstancedMesh===!0,_e=I.isBatchedMesh===!0,Qe=!!M.map,ke=!!M.matcap,Je=!!Y,N=!!M.aoMap,pt=!!M.lightMap,Fe=!!M.bumpMap,Le=!!M.normalMap,Ee=!!M.displacementMap,qe=!!M.emissiveMap,Me=!!M.metalnessMap,C=!!M.roughnessMap,S=M.anisotropy>0,z=M.clearcoat>0,Z=M.dispersion>0,ee=M.iridescence>0,$=M.sheen>0,Te=M.transmission>0,le=S&&!!M.anisotropyMap,fe=z&&!!M.clearcoatMap,Ve=z&&!!M.clearcoatNormalMap,ne=z&&!!M.clearcoatRoughnessMap,ve=ee&&!!M.iridescenceMap,Pe=ee&&!!M.iridescenceThicknessMap,De=$&&!!M.sheenColorMap,xe=$&&!!M.sheenRoughnessMap,We=!!M.specularMap,Ie=!!M.specularColorMap,je=!!M.specularIntensityMap,U=Te&&!!M.transmissionMap,ae=Te&&!!M.thicknessMap,q=!!M.gradientMap,Q=!!M.alphaMap,ge=M.alphaTest>0,pe=!!M.alphaHash,Be=!!M.extensions;let ft=_i;M.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(ft=r.toneMapping);const Dt={shaderID:H,shaderType:M.type,shaderName:M.name,vertexShader:ye,fragmentShader:j,defines:M.defines,customVertexShaderID:te,customFragmentShaderID:oe,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:_e,batchingColor:_e&&I._colorsTexture!==null,instancing:de,instancingColor:de&&I.instanceColor!==null,instancingMorph:de&&I.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ie===null?r.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:Bt,alphaToCoverage:!!M.alphaToCoverage,map:Qe,matcap:ke,envMap:Je,envMapMode:Je&&Y.mapping,envMapCubeUVHeight:G,aoMap:N,lightMap:pt,bumpMap:Fe,normalMap:Le,displacementMap:d&&Ee,emissiveMap:qe,normalMapObjectSpace:Le&&M.normalMapType===af,normalMapTangentSpace:Le&&M.normalMapType===Rl,metalnessMap:Me,roughnessMap:C,anisotropy:S,anisotropyMap:le,clearcoat:z,clearcoatMap:fe,clearcoatNormalMap:Ve,clearcoatRoughnessMap:ne,dispersion:Z,iridescence:ee,iridescenceMap:ve,iridescenceThicknessMap:Pe,sheen:$,sheenColorMap:De,sheenRoughnessMap:xe,specularMap:We,specularColorMap:Ie,specularIntensityMap:je,transmission:Te,transmissionMap:U,thicknessMap:ae,gradientMap:q,opaque:M.transparent===!1&&M.blending===Ni&&M.alphaToCoverage===!1,alphaMap:Q,alphaTest:ge,alphaHash:pe,combine:M.combine,mapUv:Qe&&_(M.map.channel),aoMapUv:N&&_(M.aoMap.channel),lightMapUv:pt&&_(M.lightMap.channel),bumpMapUv:Fe&&_(M.bumpMap.channel),normalMapUv:Le&&_(M.normalMap.channel),displacementMapUv:Ee&&_(M.displacementMap.channel),emissiveMapUv:qe&&_(M.emissiveMap.channel),metalnessMapUv:Me&&_(M.metalnessMap.channel),roughnessMapUv:C&&_(M.roughnessMap.channel),anisotropyMapUv:le&&_(M.anisotropyMap.channel),clearcoatMapUv:fe&&_(M.clearcoatMap.channel),clearcoatNormalMapUv:Ve&&_(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ne&&_(M.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&_(M.iridescenceMap.channel),iridescenceThicknessMapUv:Pe&&_(M.iridescenceThicknessMap.channel),sheenColorMapUv:De&&_(M.sheenColorMap.channel),sheenRoughnessMapUv:xe&&_(M.sheenRoughnessMap.channel),specularMapUv:We&&_(M.specularMap.channel),specularColorMapUv:Ie&&_(M.specularColorMap.channel),specularIntensityMapUv:je&&_(M.specularIntensityMap.channel),transmissionMapUv:U&&_(M.transmissionMap.channel),thicknessMapUv:ae&&_(M.thicknessMap.channel),alphaMapUv:Q&&_(M.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(Le||S),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!V.attributes.uv&&(Qe||Q),fog:!!O,useFog:M.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:he,skinning:I.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:J,morphTextureStride:se,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:r.shadowMap.enabled&&R.length>0,shadowMapType:r.shadowMap.type,toneMapping:ft,decodeVideoTexture:Qe&&M.map.isVideoTexture===!0&&Xe.getTransfer(M.map.colorSpace)===st,decodeVideoTextureEmissive:qe&&M.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(M.emissiveMap.colorSpace)===st,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Rt,flipSided:M.side===Ot,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Be&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Be&&M.extensions.multiDraw===!0||_e)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Dt.vertexUv1s=c.has(1),Dt.vertexUv2s=c.has(2),Dt.vertexUv3s=c.has(3),c.clear(),Dt}function p(M){const y=[];if(M.shaderID?y.push(M.shaderID):(y.push(M.customVertexShaderID),y.push(M.customFragmentShaderID)),M.defines!==void 0)for(const R in M.defines)y.push(R),y.push(M.defines[R]);return M.isRawShaderMaterial===!1&&(x(y,M),T(y,M),y.push(r.outputColorSpace)),y.push(M.customProgramCacheKey),y.join()}function x(M,y){M.push(y.precision),M.push(y.outputColorSpace),M.push(y.envMapMode),M.push(y.envMapCubeUVHeight),M.push(y.mapUv),M.push(y.alphaMapUv),M.push(y.lightMapUv),M.push(y.aoMapUv),M.push(y.bumpMapUv),M.push(y.normalMapUv),M.push(y.displacementMapUv),M.push(y.emissiveMapUv),M.push(y.metalnessMapUv),M.push(y.roughnessMapUv),M.push(y.anisotropyMapUv),M.push(y.clearcoatMapUv),M.push(y.clearcoatNormalMapUv),M.push(y.clearcoatRoughnessMapUv),M.push(y.iridescenceMapUv),M.push(y.iridescenceThicknessMapUv),M.push(y.sheenColorMapUv),M.push(y.sheenRoughnessMapUv),M.push(y.specularMapUv),M.push(y.specularColorMapUv),M.push(y.specularIntensityMapUv),M.push(y.transmissionMapUv),M.push(y.thicknessMapUv),M.push(y.combine),M.push(y.fogExp2),M.push(y.sizeAttenuation),M.push(y.morphTargetsCount),M.push(y.morphAttributeCount),M.push(y.numDirLights),M.push(y.numPointLights),M.push(y.numSpotLights),M.push(y.numSpotLightMaps),M.push(y.numHemiLights),M.push(y.numRectAreaLights),M.push(y.numDirLightShadows),M.push(y.numPointLightShadows),M.push(y.numSpotLightShadows),M.push(y.numSpotLightShadowsWithMaps),M.push(y.numLightProbes),M.push(y.shadowMapType),M.push(y.toneMapping),M.push(y.numClippingPlanes),M.push(y.numClipIntersection),M.push(y.depthPacking)}function T(M,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),M.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reverseDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),M.push(o.mask)}function v(M){const y=m[M.type];let R;if(y){const L=Rn[y];R=vn.clone(L.uniforms)}else R=M.uniforms;return R}function D(M,y){let R;for(let L=0,I=h.length;L<I;L++){const O=h[L];if(O.cacheKey===y){R=O,++R.usedTimes;break}}return R===void 0&&(R=new u_(r,y,M,s),h.push(R)),R}function E(M){if(--M.usedTimes===0){const y=h.indexOf(M);h[y]=h[h.length-1],h.pop(),M.destroy()}}function A(M){l.remove(M)}function w(){l.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:v,acquireProgram:D,releaseProgram:E,releaseShaderCache:A,programs:h,dispose:w}}function g_(){let r=new WeakMap;function e(a){return r.has(a)}function t(a){let o=r.get(a);return o===void 0&&(o={},r.set(a,o)),o}function n(a){r.delete(a)}function i(a,o,l){r.get(a)[o]=l}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function __(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function ah(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function oh(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(u,d,f,m,_,g){let p=r[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:f,groupOrder:m,renderOrder:u.renderOrder,z:_,group:g},r[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=f,p.groupOrder=m,p.renderOrder=u.renderOrder,p.z=_,p.group=g),e++,p}function o(u,d,f,m,_,g){const p=a(u,d,f,m,_,g);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function l(u,d,f,m,_,g){const p=a(u,d,f,m,_,g);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function c(u,d){t.length>1&&t.sort(u||__),n.length>1&&n.sort(d||ah),i.length>1&&i.sort(d||ah)}function h(){for(let u=e,d=r.length;u<d;u++){const f=r[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:o,unshift:l,finish:h,sort:c}}function v_(){let r=new WeakMap;function e(n,i){const s=r.get(n);let a;return s===void 0?(a=new oh,r.set(n,[a])):i>=s.length?(a=new oh,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function x_(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new ue};break;case"SpotLight":t={position:new P,direction:new P,color:new ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new ue,groundColor:new ue};break;case"RectAreaLight":t={color:new ue,position:new P,halfWidth:new P,halfHeight:new P};break}return r[e.id]=t,t}}}function y_(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let M_=0;function T_(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function S_(r){const e=new x_,t=y_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new P);const i=new P,s=new Ce,a=new Ce;function o(c){let h=0,u=0,d=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let f=0,m=0,_=0,g=0,p=0,x=0,T=0,v=0,D=0,E=0,A=0;c.sort(T_);for(let M=0,y=c.length;M<y;M++){const R=c[M],L=R.color,I=R.intensity,O=R.distance,V=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)h+=L.r*I,u+=L.g*I,d+=L.b*I;else if(R.isLightProbe){for(let B=0;B<9;B++)n.probe[B].addScaledVector(R.sh.coefficients[B],I);A++}else if(R.isDirectionalLight){const B=e.get(R);if(B.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const Y=R.shadow,G=t.get(R);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=V,n.directionalShadowMatrix[f]=R.shadow.matrix,x++}n.directional[f]=B,f++}else if(R.isSpotLight){const B=e.get(R);B.position.setFromMatrixPosition(R.matrixWorld),B.color.copy(L).multiplyScalar(I),B.distance=O,B.coneCos=Math.cos(R.angle),B.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),B.decay=R.decay,n.spot[_]=B;const Y=R.shadow;if(R.map&&(n.spotLightMap[D]=R.map,D++,Y.updateMatrices(R),R.castShadow&&E++),n.spotLightMatrix[_]=Y.matrix,R.castShadow){const G=t.get(R);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,n.spotShadow[_]=G,n.spotShadowMap[_]=V,v++}_++}else if(R.isRectAreaLight){const B=e.get(R);B.color.copy(L).multiplyScalar(I),B.halfWidth.set(R.width*.5,0,0),B.halfHeight.set(0,R.height*.5,0),n.rectArea[g]=B,g++}else if(R.isPointLight){const B=e.get(R);if(B.color.copy(R.color).multiplyScalar(R.intensity),B.distance=R.distance,B.decay=R.decay,R.castShadow){const Y=R.shadow,G=t.get(R);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,G.shadowCameraNear=Y.camera.near,G.shadowCameraFar=Y.camera.far,n.pointShadow[m]=G,n.pointShadowMap[m]=V,n.pointShadowMatrix[m]=R.shadow.matrix,T++}n.point[m]=B,m++}else if(R.isHemisphereLight){const B=e.get(R);B.skyColor.copy(R.color).multiplyScalar(I),B.groundColor.copy(R.groundColor).multiplyScalar(I),n.hemi[p]=B,p++}}g>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ce.LTC_FLOAT_1,n.rectAreaLTC2=ce.LTC_FLOAT_2):(n.rectAreaLTC1=ce.LTC_HALF_1,n.rectAreaLTC2=ce.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const w=n.hash;(w.directionalLength!==f||w.pointLength!==m||w.spotLength!==_||w.rectAreaLength!==g||w.hemiLength!==p||w.numDirectionalShadows!==x||w.numPointShadows!==T||w.numSpotShadows!==v||w.numSpotMaps!==D||w.numLightProbes!==A)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=g,n.point.length=m,n.hemi.length=p,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=T,n.pointShadowMap.length=T,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=T,n.spotLightMatrix.length=v+D-E,n.spotLightMap.length=D,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=A,w.directionalLength=f,w.pointLength=m,w.spotLength=_,w.rectAreaLength=g,w.hemiLength=p,w.numDirectionalShadows=x,w.numPointShadows=T,w.numSpotShadows=v,w.numSpotMaps=D,w.numLightProbes=A,n.version=M_++)}function l(c,h){let u=0,d=0,f=0,m=0,_=0;const g=h.matrixWorldInverse;for(let p=0,x=c.length;p<x;p++){const T=c[p];if(T.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(T.matrixWorld),i.setFromMatrixPosition(T.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(g),u++}else if(T.isSpotLight){const v=n.spot[f];v.position.setFromMatrixPosition(T.matrixWorld),v.position.applyMatrix4(g),v.direction.setFromMatrixPosition(T.matrixWorld),i.setFromMatrixPosition(T.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(g),f++}else if(T.isRectAreaLight){const v=n.rectArea[m];v.position.setFromMatrixPosition(T.matrixWorld),v.position.applyMatrix4(g),a.identity(),s.copy(T.matrixWorld),s.premultiply(g),a.extractRotation(s),v.halfWidth.set(T.width*.5,0,0),v.halfHeight.set(0,T.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),m++}else if(T.isPointLight){const v=n.point[d];v.position.setFromMatrixPosition(T.matrixWorld),v.position.applyMatrix4(g),d++}else if(T.isHemisphereLight){const v=n.hemi[_];v.direction.setFromMatrixPosition(T.matrixWorld),v.direction.transformDirection(g),_++}}}return{setup:o,setupView:l,state:n}}function lh(r){const e=new S_(r),t=[],n=[];function i(h){c.camera=h,t.length=0,n.length=0}function s(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function b_(r){let e=new WeakMap;function t(i,s=0){const a=e.get(i);let o;return a===void 0?(o=new lh(r),e.set(i,[o])):s>=a.length?(o=new lh(r),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}class w_ extends Mn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=sf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class E_ extends Mn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const A_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,R_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function C_(r,e,t){let n=new Pl;const i=new Re,s=new Re,a=new Ke,o=new w_({depthPacking:rf}),l=new E_,c={},h=t.maxTextureSize,u={[ei]:Ot,[Ot]:ei,[Rt]:Rt},d=new dt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Re},radius:{value:4}},vertexShader:A_,fragmentShader:R_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const m=new _t;m.setAttribute("position",new xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new $e(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Qh;let p=this.type;this.render=function(E,A,w){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||E.length===0)return;const M=r.getRenderTarget(),y=r.getActiveCubeFace(),R=r.getActiveMipmapLevel(),L=r.state;L.setBlending(Et),L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const I=p!==jn&&this.type===jn,O=p===jn&&this.type!==jn;for(let V=0,B=E.length;V<B;V++){const Y=E[V],G=Y.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;i.copy(G.mapSize);const H=G.getFrameExtents();if(i.multiply(H),s.copy(G.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/H.x),i.x=s.x*H.x,G.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/H.y),i.y=s.y*H.y,G.mapSize.y=s.y)),G.map===null||I===!0||O===!0){const J=this.type!==jn?{minFilter:Pt,magFilter:Pt}:{};G.map!==null&&G.map.dispose(),G.map=new Qt(i.x,i.y,J),G.map.texture.name=Y.name+".shadowMap",G.camera.updateProjectionMatrix()}r.setRenderTarget(G.map),r.clear();const K=G.getViewportCount();for(let J=0;J<K;J++){const se=G.getViewport(J);a.set(s.x*se.x,s.y*se.y,s.x*se.z,s.y*se.w),L.viewport(a),G.updateMatrices(Y,J),n=G.getFrustum(),v(A,w,G.camera,Y,this.type)}G.isPointLightShadow!==!0&&this.type===jn&&x(G,w),G.needsUpdate=!1}p=this.type,g.needsUpdate=!1,r.setRenderTarget(M,y,R)};function x(E,A){const w=e.update(_);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Qt(i.x,i.y)),d.uniforms.shadow_pass.value=E.map.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,r.setRenderTarget(E.mapPass),r.clear(),r.renderBufferDirect(A,null,w,d,_,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,r.setRenderTarget(E.map),r.clear(),r.renderBufferDirect(A,null,w,f,_,null)}function T(E,A,w,M){let y=null;const R=w.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(R!==void 0)y=R;else if(y=w.isPointLight===!0?l:o,r.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const L=y.uuid,I=A.uuid;let O=c[L];O===void 0&&(O={},c[L]=O);let V=O[I];V===void 0&&(V=y.clone(),O[I]=V,A.addEventListener("dispose",D)),y=V}if(y.visible=A.visible,y.wireframe=A.wireframe,M===jn?y.side=A.shadowSide!==null?A.shadowSide:A.side:y.side=A.shadowSide!==null?A.shadowSide:u[A.side],y.alphaMap=A.alphaMap,y.alphaTest=A.alphaTest,y.map=A.map,y.clipShadows=A.clipShadows,y.clippingPlanes=A.clippingPlanes,y.clipIntersection=A.clipIntersection,y.displacementMap=A.displacementMap,y.displacementScale=A.displacementScale,y.displacementBias=A.displacementBias,y.wireframeLinewidth=A.wireframeLinewidth,y.linewidth=A.linewidth,w.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const L=r.properties.get(y);L.light=w}return y}function v(E,A,w,M,y){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&y===jn)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,E.matrixWorld);const I=e.update(E),O=E.material;if(Array.isArray(O)){const V=I.groups;for(let B=0,Y=V.length;B<Y;B++){const G=V[B],H=O[G.materialIndex];if(H&&H.visible){const K=T(E,H,M,y);E.onBeforeShadow(r,E,A,w,I,K,G),r.renderBufferDirect(w,null,I,K,E,G),E.onAfterShadow(r,E,A,w,I,K,G)}}}else if(O.visible){const V=T(E,O,M,y);E.onBeforeShadow(r,E,A,w,I,V,null),r.renderBufferDirect(w,null,I,V,E,null),E.onAfterShadow(r,E,A,w,I,V,null)}}const L=E.children;for(let I=0,O=L.length;I<O;I++)v(L[I],A,w,M,y)}function D(E){E.target.removeEventListener("dispose",D);for(const w in c){const M=c[w],y=E.target.uuid;y in M&&(M[y].dispose(),delete M[y])}}}const P_={[xo]:yo,[Mo]:bo,[To]:wo,[fs]:So,[yo]:xo,[bo]:Mo,[wo]:To,[So]:fs};function D_(r,e){function t(){let U=!1;const ae=new Ke;let q=null;const Q=new Ke(0,0,0,0);return{setMask:function(ge){q!==ge&&!U&&(r.colorMask(ge,ge,ge,ge),q=ge)},setLocked:function(ge){U=ge},setClear:function(ge,pe,Be,ft,Dt){Dt===!0&&(ge*=ft,pe*=ft,Be*=ft),ae.set(ge,pe,Be,ft),Q.equals(ae)===!1&&(r.clearColor(ge,pe,Be,ft),Q.copy(ae))},reset:function(){U=!1,q=null,Q.set(-1,0,0,0)}}}function n(){let U=!1,ae=!1,q=null,Q=null,ge=null;return{setReversed:function(pe){if(ae!==pe){const Be=e.get("EXT_clip_control");ae?Be.clipControlEXT(Be.LOWER_LEFT_EXT,Be.ZERO_TO_ONE_EXT):Be.clipControlEXT(Be.LOWER_LEFT_EXT,Be.NEGATIVE_ONE_TO_ONE_EXT);const ft=ge;ge=null,this.setClear(ft)}ae=pe},getReversed:function(){return ae},setTest:function(pe){pe?ie(r.DEPTH_TEST):he(r.DEPTH_TEST)},setMask:function(pe){q!==pe&&!U&&(r.depthMask(pe),q=pe)},setFunc:function(pe){if(ae&&(pe=P_[pe]),Q!==pe){switch(pe){case xo:r.depthFunc(r.NEVER);break;case yo:r.depthFunc(r.ALWAYS);break;case Mo:r.depthFunc(r.LESS);break;case fs:r.depthFunc(r.LEQUAL);break;case To:r.depthFunc(r.EQUAL);break;case So:r.depthFunc(r.GEQUAL);break;case bo:r.depthFunc(r.GREATER);break;case wo:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}Q=pe}},setLocked:function(pe){U=pe},setClear:function(pe){ge!==pe&&(ae&&(pe=1-pe),r.clearDepth(pe),ge=pe)},reset:function(){U=!1,q=null,Q=null,ge=null,ae=!1}}}function i(){let U=!1,ae=null,q=null,Q=null,ge=null,pe=null,Be=null,ft=null,Dt=null;return{setTest:function(it){U||(it?ie(r.STENCIL_TEST):he(r.STENCIL_TEST))},setMask:function(it){ae!==it&&!U&&(r.stencilMask(it),ae=it)},setFunc:function(it,hn,On){(q!==it||Q!==hn||ge!==On)&&(r.stencilFunc(it,hn,On),q=it,Q=hn,ge=On)},setOp:function(it,hn,On){(pe!==it||Be!==hn||ft!==On)&&(r.stencilOp(it,hn,On),pe=it,Be=hn,ft=On)},setLocked:function(it){U=it},setClear:function(it){Dt!==it&&(r.clearStencil(it),Dt=it)},reset:function(){U=!1,ae=null,q=null,Q=null,ge=null,pe=null,Be=null,ft=null,Dt=null}}}const s=new t,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},d=new WeakMap,f=[],m=null,_=!1,g=null,p=null,x=null,T=null,v=null,D=null,E=null,A=new ue(0,0,0),w=0,M=!1,y=null,R=null,L=null,I=null,O=null;const V=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let B=!1,Y=0;const G=r.getParameter(r.VERSION);G.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(G)[1]),B=Y>=1):G.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),B=Y>=2);let H=null,K={};const J=r.getParameter(r.SCISSOR_BOX),se=r.getParameter(r.VIEWPORT),ye=new Ke().fromArray(J),j=new Ke().fromArray(se);function te(U,ae,q,Q){const ge=new Uint8Array(4),pe=r.createTexture();r.bindTexture(U,pe),r.texParameteri(U,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(U,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Be=0;Be<q;Be++)U===r.TEXTURE_3D||U===r.TEXTURE_2D_ARRAY?r.texImage3D(ae,0,r.RGBA,1,1,Q,0,r.RGBA,r.UNSIGNED_BYTE,ge):r.texImage2D(ae+Be,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,ge);return pe}const oe={};oe[r.TEXTURE_2D]=te(r.TEXTURE_2D,r.TEXTURE_2D,1),oe[r.TEXTURE_CUBE_MAP]=te(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[r.TEXTURE_2D_ARRAY]=te(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),oe[r.TEXTURE_3D]=te(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ie(r.DEPTH_TEST),a.setFunc(fs),Fe(!1),Le(fc),ie(r.CULL_FACE),N(Et);function ie(U){h[U]!==!0&&(r.enable(U),h[U]=!0)}function he(U){h[U]!==!1&&(r.disable(U),h[U]=!1)}function de(U,ae){return u[U]!==ae?(r.bindFramebuffer(U,ae),u[U]=ae,U===r.DRAW_FRAMEBUFFER&&(u[r.FRAMEBUFFER]=ae),U===r.FRAMEBUFFER&&(u[r.DRAW_FRAMEBUFFER]=ae),!0):!1}function _e(U,ae){let q=f,Q=!1;if(U){q=d.get(ae),q===void 0&&(q=[],d.set(ae,q));const ge=U.textures;if(q.length!==ge.length||q[0]!==r.COLOR_ATTACHMENT0){for(let pe=0,Be=ge.length;pe<Be;pe++)q[pe]=r.COLOR_ATTACHMENT0+pe;q.length=ge.length,Q=!0}}else q[0]!==r.BACK&&(q[0]=r.BACK,Q=!0);Q&&r.drawBuffers(q)}function Qe(U){return m!==U?(r.useProgram(U),m=U,!0):!1}const ke={[mn]:r.FUNC_ADD,[Fd]:r.FUNC_SUBTRACT,[kd]:r.FUNC_REVERSE_SUBTRACT};ke[Od]=r.MIN,ke[Bd]=r.MAX;const Je={[Vs]:r.ZERO,[zd]:r.ONE,[Hd]:r.SRC_COLOR,[mo]:r.SRC_ALPHA,[Xd]:r.SRC_ALPHA_SATURATE,[vo]:r.DST_COLOR,[_o]:r.DST_ALPHA,[Vd]:r.ONE_MINUS_SRC_COLOR,[go]:r.ONE_MINUS_SRC_ALPHA,[Wd]:r.ONE_MINUS_DST_COLOR,[Gd]:r.ONE_MINUS_DST_ALPHA,[qd]:r.CONSTANT_COLOR,[jd]:r.ONE_MINUS_CONSTANT_COLOR,[Yd]:r.CONSTANT_ALPHA,[$d]:r.ONE_MINUS_CONSTANT_ALPHA};function N(U,ae,q,Q,ge,pe,Be,ft,Dt,it){if(U===Et){_===!0&&(he(r.BLEND),_=!1);return}if(_===!1&&(ie(r.BLEND),_=!0),U!==eu){if(U!==g||it!==M){if((p!==mn||v!==mn)&&(r.blendEquation(r.FUNC_ADD),p=mn,v=mn),it)switch(U){case Ni:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case pi:r.blendFunc(r.ONE,r.ONE);break;case pc:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case mc:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case Ni:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case pi:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case pc:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case mc:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}x=null,T=null,D=null,E=null,A.set(0,0,0),w=0,g=U,M=it}return}ge=ge||ae,pe=pe||q,Be=Be||Q,(ae!==p||ge!==v)&&(r.blendEquationSeparate(ke[ae],ke[ge]),p=ae,v=ge),(q!==x||Q!==T||pe!==D||Be!==E)&&(r.blendFuncSeparate(Je[q],Je[Q],Je[pe],Je[Be]),x=q,T=Q,D=pe,E=Be),(ft.equals(A)===!1||Dt!==w)&&(r.blendColor(ft.r,ft.g,ft.b,Dt),A.copy(ft),w=Dt),g=U,M=!1}function pt(U,ae){U.side===Rt?he(r.CULL_FACE):ie(r.CULL_FACE);let q=U.side===Ot;ae&&(q=!q),Fe(q),U.blending===Ni&&U.transparent===!1?N(Et):N(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),s.setMask(U.colorWrite);const Q=U.stencilWrite;o.setTest(Q),Q&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),qe(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ie(r.SAMPLE_ALPHA_TO_COVERAGE):he(r.SAMPLE_ALPHA_TO_COVERAGE)}function Fe(U){y!==U&&(U?r.frontFace(r.CW):r.frontFace(r.CCW),y=U)}function Le(U){U!==Ud?(ie(r.CULL_FACE),U!==R&&(U===fc?r.cullFace(r.BACK):U===Nd?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):he(r.CULL_FACE),R=U}function Ee(U){U!==L&&(B&&r.lineWidth(U),L=U)}function qe(U,ae,q){U?(ie(r.POLYGON_OFFSET_FILL),(I!==ae||O!==q)&&(r.polygonOffset(ae,q),I=ae,O=q)):he(r.POLYGON_OFFSET_FILL)}function Me(U){U?ie(r.SCISSOR_TEST):he(r.SCISSOR_TEST)}function C(U){U===void 0&&(U=r.TEXTURE0+V-1),H!==U&&(r.activeTexture(U),H=U)}function S(U,ae,q){q===void 0&&(H===null?q=r.TEXTURE0+V-1:q=H);let Q=K[q];Q===void 0&&(Q={type:void 0,texture:void 0},K[q]=Q),(Q.type!==U||Q.texture!==ae)&&(H!==q&&(r.activeTexture(q),H=q),r.bindTexture(U,ae||oe[U]),Q.type=U,Q.texture=ae)}function z(){const U=K[H];U!==void 0&&U.type!==void 0&&(r.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function Z(){try{r.compressedTexImage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ee(){try{r.compressedTexImage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function $(){try{r.texSubImage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Te(){try{r.texSubImage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function le(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function fe(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ve(){try{r.texStorage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ne(){try{r.texStorage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ve(){try{r.texImage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Pe(){try{r.texImage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function De(U){ye.equals(U)===!1&&(r.scissor(U.x,U.y,U.z,U.w),ye.copy(U))}function xe(U){j.equals(U)===!1&&(r.viewport(U.x,U.y,U.z,U.w),j.copy(U))}function We(U,ae){let q=c.get(ae);q===void 0&&(q=new WeakMap,c.set(ae,q));let Q=q.get(U);Q===void 0&&(Q=r.getUniformBlockIndex(ae,U.name),q.set(U,Q))}function Ie(U,ae){const Q=c.get(ae).get(U);l.get(ae)!==Q&&(r.uniformBlockBinding(ae,Q,U.__bindingPointIndex),l.set(ae,Q))}function je(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),a.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),h={},H=null,K={},u={},d=new WeakMap,f=[],m=null,_=!1,g=null,p=null,x=null,T=null,v=null,D=null,E=null,A=new ue(0,0,0),w=0,M=!1,y=null,R=null,L=null,I=null,O=null,ye.set(0,0,r.canvas.width,r.canvas.height),j.set(0,0,r.canvas.width,r.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:ie,disable:he,bindFramebuffer:de,drawBuffers:_e,useProgram:Qe,setBlending:N,setMaterial:pt,setFlipSided:Fe,setCullFace:Le,setLineWidth:Ee,setPolygonOffset:qe,setScissorTest:Me,activeTexture:C,bindTexture:S,unbindTexture:z,compressedTexImage2D:Z,compressedTexImage3D:ee,texImage2D:ve,texImage3D:Pe,updateUBOMapping:We,uniformBlockBinding:Ie,texStorage2D:Ve,texStorage3D:ne,texSubImage2D:$,texSubImage3D:Te,compressedTexSubImage2D:le,compressedTexSubImage3D:fe,scissor:De,viewport:xe,reset:je}}function ch(r,e,t,n){const i=I_(n);switch(t){case du:return r*e;case pu:return r*e;case mu:return r*e*2;case Sl:return r*e/i.components*i.byteLength;case bl:return r*e/i.components*i.byteLength;case gu:return r*e*2/i.components*i.byteLength;case wl:return r*e*2/i.components*i.byteLength;case fu:return r*e*3/i.components*i.byteLength;case Wt:return r*e*4/i.components*i.byteLength;case El:return r*e*4/i.components*i.byteLength;case $r:case Kr:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Zr:case Qr:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Ro:case Po:return Math.max(r,16)*Math.max(e,8)/4;case Ao:case Co:return Math.max(r,8)*Math.max(e,8)/2;case Do:case Io:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Lo:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Uo:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case No:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Fo:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case ko:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Bo:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case zo:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case Ho:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Vo:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Go:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Wo:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Xo:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case qo:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case jo:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Jr:case Yo:case $o:return Math.ceil(r/4)*Math.ceil(e/4)*16;case _u:case Ko:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Zo:case Qo:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function I_(r){switch(r){case In:case cu:return{byteLength:1,components:1};case tr:case hu:case kt:return{byteLength:2,components:1};case Ml:case Tl:return{byteLength:2,components:4};case Fi:case yl:case Kt:return{byteLength:4,components:1};case uu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}function L_(r,e,t,n,i,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Re,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(C,S){return f?new OffscreenCanvas(C,S):sr("canvas")}function _(C,S,z){let Z=1;const ee=Me(C);if((ee.width>z||ee.height>z)&&(Z=z/Math.max(ee.width,ee.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const $=Math.floor(Z*ee.width),Te=Math.floor(Z*ee.height);u===void 0&&(u=m($,Te));const le=S?m($,Te):u;return le.width=$,le.height=Te,le.getContext("2d").drawImage(C,0,0,$,Te),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+$+"x"+Te+")."),le}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),C;return C}function g(C){return C.generateMipmaps}function p(C){r.generateMipmap(C)}function x(C){return C.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?r.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function T(C,S,z,Z,ee=!1){if(C!==null){if(r[C]!==void 0)return r[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let $=S;if(S===r.RED&&(z===r.FLOAT&&($=r.R32F),z===r.HALF_FLOAT&&($=r.R16F),z===r.UNSIGNED_BYTE&&($=r.R8)),S===r.RED_INTEGER&&(z===r.UNSIGNED_BYTE&&($=r.R8UI),z===r.UNSIGNED_SHORT&&($=r.R16UI),z===r.UNSIGNED_INT&&($=r.R32UI),z===r.BYTE&&($=r.R8I),z===r.SHORT&&($=r.R16I),z===r.INT&&($=r.R32I)),S===r.RG&&(z===r.FLOAT&&($=r.RG32F),z===r.HALF_FLOAT&&($=r.RG16F),z===r.UNSIGNED_BYTE&&($=r.RG8)),S===r.RG_INTEGER&&(z===r.UNSIGNED_BYTE&&($=r.RG8UI),z===r.UNSIGNED_SHORT&&($=r.RG16UI),z===r.UNSIGNED_INT&&($=r.RG32UI),z===r.BYTE&&($=r.RG8I),z===r.SHORT&&($=r.RG16I),z===r.INT&&($=r.RG32I)),S===r.RGB_INTEGER&&(z===r.UNSIGNED_BYTE&&($=r.RGB8UI),z===r.UNSIGNED_SHORT&&($=r.RGB16UI),z===r.UNSIGNED_INT&&($=r.RGB32UI),z===r.BYTE&&($=r.RGB8I),z===r.SHORT&&($=r.RGB16I),z===r.INT&&($=r.RGB32I)),S===r.RGBA_INTEGER&&(z===r.UNSIGNED_BYTE&&($=r.RGBA8UI),z===r.UNSIGNED_SHORT&&($=r.RGBA16UI),z===r.UNSIGNED_INT&&($=r.RGBA32UI),z===r.BYTE&&($=r.RGBA8I),z===r.SHORT&&($=r.RGBA16I),z===r.INT&&($=r.RGBA32I)),S===r.RGB&&z===r.UNSIGNED_INT_5_9_9_9_REV&&($=r.RGB9_E5),S===r.RGBA){const Te=ee?pa:Xe.getTransfer(Z);z===r.FLOAT&&($=r.RGBA32F),z===r.HALF_FLOAT&&($=r.RGBA16F),z===r.UNSIGNED_BYTE&&($=Te===st?r.SRGB8_ALPHA8:r.RGBA8),z===r.UNSIGNED_SHORT_4_4_4_4&&($=r.RGBA4),z===r.UNSIGNED_SHORT_5_5_5_1&&($=r.RGB5_A1)}return($===r.R16F||$===r.R32F||$===r.RG16F||$===r.RG32F||$===r.RGBA16F||$===r.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function v(C,S){let z;return C?S===null||S===Fi||S===ki?z=r.DEPTH24_STENCIL8:S===Kt?z=r.DEPTH32F_STENCIL8:S===tr&&(z=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Fi||S===ki?z=r.DEPTH_COMPONENT24:S===Kt?z=r.DEPTH_COMPONENT32F:S===tr&&(z=r.DEPTH_COMPONENT16),z}function D(C,S){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==Pt&&C.minFilter!==gt?Math.log2(Math.max(S.width,S.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?S.mipmaps.length:1}function E(C){const S=C.target;S.removeEventListener("dispose",E),w(S),S.isVideoTexture&&h.delete(S)}function A(C){const S=C.target;S.removeEventListener("dispose",A),y(S)}function w(C){const S=n.get(C);if(S.__webglInit===void 0)return;const z=C.source,Z=d.get(z);if(Z){const ee=Z[S.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&M(C),Object.keys(Z).length===0&&d.delete(z)}n.remove(C)}function M(C){const S=n.get(C);r.deleteTexture(S.__webglTexture);const z=C.source,Z=d.get(z);delete Z[S.__cacheKey],a.memory.textures--}function y(C){const S=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(S.__webglFramebuffer[Z]))for(let ee=0;ee<S.__webglFramebuffer[Z].length;ee++)r.deleteFramebuffer(S.__webglFramebuffer[Z][ee]);else r.deleteFramebuffer(S.__webglFramebuffer[Z]);S.__webglDepthbuffer&&r.deleteRenderbuffer(S.__webglDepthbuffer[Z])}else{if(Array.isArray(S.__webglFramebuffer))for(let Z=0;Z<S.__webglFramebuffer.length;Z++)r.deleteFramebuffer(S.__webglFramebuffer[Z]);else r.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&r.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&r.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let Z=0;Z<S.__webglColorRenderbuffer.length;Z++)S.__webglColorRenderbuffer[Z]&&r.deleteRenderbuffer(S.__webglColorRenderbuffer[Z]);S.__webglDepthRenderbuffer&&r.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const z=C.textures;for(let Z=0,ee=z.length;Z<ee;Z++){const $=n.get(z[Z]);$.__webglTexture&&(r.deleteTexture($.__webglTexture),a.memory.textures--),n.remove(z[Z])}n.remove(C)}let R=0;function L(){R=0}function I(){const C=R;return C>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+i.maxTextures),R+=1,C}function O(C){const S=[];return S.push(C.wrapS),S.push(C.wrapT),S.push(C.wrapR||0),S.push(C.magFilter),S.push(C.minFilter),S.push(C.anisotropy),S.push(C.internalFormat),S.push(C.format),S.push(C.type),S.push(C.generateMipmaps),S.push(C.premultiplyAlpha),S.push(C.flipY),S.push(C.unpackAlignment),S.push(C.colorSpace),S.join()}function V(C,S){const z=n.get(C);if(C.isVideoTexture&&Ee(C),C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){const Z=C.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(z,C,S);return}}t.bindTexture(r.TEXTURE_2D,z.__webglTexture,r.TEXTURE0+S)}function B(C,S){const z=n.get(C);if(C.version>0&&z.__version!==C.version){j(z,C,S);return}t.bindTexture(r.TEXTURE_2D_ARRAY,z.__webglTexture,r.TEXTURE0+S)}function Y(C,S){const z=n.get(C);if(C.version>0&&z.__version!==C.version){j(z,C,S);return}t.bindTexture(r.TEXTURE_3D,z.__webglTexture,r.TEXTURE0+S)}function G(C,S){const z=n.get(C);if(C.version>0&&z.__version!==C.version){te(z,C,S);return}t.bindTexture(r.TEXTURE_CUBE_MAP,z.__webglTexture,r.TEXTURE0+S)}const H={[Tn]:r.REPEAT,[Pn]:r.CLAMP_TO_EDGE,[ra]:r.MIRRORED_REPEAT},K={[Pt]:r.NEAREST,[lu]:r.NEAREST_MIPMAP_NEAREST,[Gs]:r.NEAREST_MIPMAP_LINEAR,[gt]:r.LINEAR,[Yr]:r.LINEAR_MIPMAP_NEAREST,[xn]:r.LINEAR_MIPMAP_LINEAR},J={[of]:r.NEVER,[ff]:r.ALWAYS,[lf]:r.LESS,[Mu]:r.LEQUAL,[cf]:r.EQUAL,[df]:r.GEQUAL,[hf]:r.GREATER,[uf]:r.NOTEQUAL};function se(C,S){if(S.type===Kt&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===gt||S.magFilter===Yr||S.magFilter===Gs||S.magFilter===xn||S.minFilter===gt||S.minFilter===Yr||S.minFilter===Gs||S.minFilter===xn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(C,r.TEXTURE_WRAP_S,H[S.wrapS]),r.texParameteri(C,r.TEXTURE_WRAP_T,H[S.wrapT]),(C===r.TEXTURE_3D||C===r.TEXTURE_2D_ARRAY)&&r.texParameteri(C,r.TEXTURE_WRAP_R,H[S.wrapR]),r.texParameteri(C,r.TEXTURE_MAG_FILTER,K[S.magFilter]),r.texParameteri(C,r.TEXTURE_MIN_FILTER,K[S.minFilter]),S.compareFunction&&(r.texParameteri(C,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(C,r.TEXTURE_COMPARE_FUNC,J[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Pt||S.minFilter!==Gs&&S.minFilter!==xn||S.type===Kt&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");r.texParameterf(C,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function ye(C,S){let z=!1;C.__webglInit===void 0&&(C.__webglInit=!0,S.addEventListener("dispose",E));const Z=S.source;let ee=d.get(Z);ee===void 0&&(ee={},d.set(Z,ee));const $=O(S);if($!==C.__cacheKey){ee[$]===void 0&&(ee[$]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,z=!0),ee[$].usedTimes++;const Te=ee[C.__cacheKey];Te!==void 0&&(ee[C.__cacheKey].usedTimes--,Te.usedTimes===0&&M(S)),C.__cacheKey=$,C.__webglTexture=ee[$].texture}return z}function j(C,S,z){let Z=r.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(Z=r.TEXTURE_2D_ARRAY),S.isData3DTexture&&(Z=r.TEXTURE_3D);const ee=ye(C,S),$=S.source;t.bindTexture(Z,C.__webglTexture,r.TEXTURE0+z);const Te=n.get($);if($.version!==Te.__version||ee===!0){t.activeTexture(r.TEXTURE0+z);const le=Xe.getPrimaries(Xe.workingColorSpace),fe=S.colorSpace===fi?null:Xe.getPrimaries(S.colorSpace),Ve=S.colorSpace===fi||le===fe?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ve);let ne=_(S.image,!1,i.maxTextureSize);ne=qe(S,ne);const ve=s.convert(S.format,S.colorSpace),Pe=s.convert(S.type);let De=T(S.internalFormat,ve,Pe,S.colorSpace,S.isVideoTexture);se(Z,S);let xe;const We=S.mipmaps,Ie=S.isVideoTexture!==!0,je=Te.__version===void 0||ee===!0,U=$.dataReady,ae=D(S,ne);if(S.isDepthTexture)De=v(S.format===Oi,S.type),je&&(Ie?t.texStorage2D(r.TEXTURE_2D,1,De,ne.width,ne.height):t.texImage2D(r.TEXTURE_2D,0,De,ne.width,ne.height,0,ve,Pe,null));else if(S.isDataTexture)if(We.length>0){Ie&&je&&t.texStorage2D(r.TEXTURE_2D,ae,De,We[0].width,We[0].height);for(let q=0,Q=We.length;q<Q;q++)xe=We[q],Ie?U&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,xe.width,xe.height,ve,Pe,xe.data):t.texImage2D(r.TEXTURE_2D,q,De,xe.width,xe.height,0,ve,Pe,xe.data);S.generateMipmaps=!1}else Ie?(je&&t.texStorage2D(r.TEXTURE_2D,ae,De,ne.width,ne.height),U&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ne.width,ne.height,ve,Pe,ne.data)):t.texImage2D(r.TEXTURE_2D,0,De,ne.width,ne.height,0,ve,Pe,ne.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Ie&&je&&t.texStorage3D(r.TEXTURE_2D_ARRAY,ae,De,We[0].width,We[0].height,ne.depth);for(let q=0,Q=We.length;q<Q;q++)if(xe=We[q],S.format!==Wt)if(ve!==null)if(Ie){if(U)if(S.layerUpdates.size>0){const ge=ch(xe.width,xe.height,S.format,S.type);for(const pe of S.layerUpdates){const Be=xe.data.subarray(pe*ge/xe.data.BYTES_PER_ELEMENT,(pe+1)*ge/xe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,pe,xe.width,xe.height,1,ve,Be)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,0,xe.width,xe.height,ne.depth,ve,xe.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,q,De,xe.width,xe.height,ne.depth,0,xe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ie?U&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,0,xe.width,xe.height,ne.depth,ve,Pe,xe.data):t.texImage3D(r.TEXTURE_2D_ARRAY,q,De,xe.width,xe.height,ne.depth,0,ve,Pe,xe.data)}else{Ie&&je&&t.texStorage2D(r.TEXTURE_2D,ae,De,We[0].width,We[0].height);for(let q=0,Q=We.length;q<Q;q++)xe=We[q],S.format!==Wt?ve!==null?Ie?U&&t.compressedTexSubImage2D(r.TEXTURE_2D,q,0,0,xe.width,xe.height,ve,xe.data):t.compressedTexImage2D(r.TEXTURE_2D,q,De,xe.width,xe.height,0,xe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ie?U&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,xe.width,xe.height,ve,Pe,xe.data):t.texImage2D(r.TEXTURE_2D,q,De,xe.width,xe.height,0,ve,Pe,xe.data)}else if(S.isDataArrayTexture)if(Ie){if(je&&t.texStorage3D(r.TEXTURE_2D_ARRAY,ae,De,ne.width,ne.height,ne.depth),U)if(S.layerUpdates.size>0){const q=ch(ne.width,ne.height,S.format,S.type);for(const Q of S.layerUpdates){const ge=ne.data.subarray(Q*q/ne.data.BYTES_PER_ELEMENT,(Q+1)*q/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,Q,ne.width,ne.height,1,ve,Pe,ge)}S.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,ve,Pe,ne.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,De,ne.width,ne.height,ne.depth,0,ve,Pe,ne.data);else if(S.isData3DTexture)Ie?(je&&t.texStorage3D(r.TEXTURE_3D,ae,De,ne.width,ne.height,ne.depth),U&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,ve,Pe,ne.data)):t.texImage3D(r.TEXTURE_3D,0,De,ne.width,ne.height,ne.depth,0,ve,Pe,ne.data);else if(S.isFramebufferTexture){if(je)if(Ie)t.texStorage2D(r.TEXTURE_2D,ae,De,ne.width,ne.height);else{let q=ne.width,Q=ne.height;for(let ge=0;ge<ae;ge++)t.texImage2D(r.TEXTURE_2D,ge,De,q,Q,0,ve,Pe,null),q>>=1,Q>>=1}}else if(We.length>0){if(Ie&&je){const q=Me(We[0]);t.texStorage2D(r.TEXTURE_2D,ae,De,q.width,q.height)}for(let q=0,Q=We.length;q<Q;q++)xe=We[q],Ie?U&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,ve,Pe,xe):t.texImage2D(r.TEXTURE_2D,q,De,ve,Pe,xe);S.generateMipmaps=!1}else if(Ie){if(je){const q=Me(ne);t.texStorage2D(r.TEXTURE_2D,ae,De,q.width,q.height)}U&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ve,Pe,ne)}else t.texImage2D(r.TEXTURE_2D,0,De,ve,Pe,ne);g(S)&&p(Z),Te.__version=$.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function te(C,S,z){if(S.image.length!==6)return;const Z=ye(C,S),ee=S.source;t.bindTexture(r.TEXTURE_CUBE_MAP,C.__webglTexture,r.TEXTURE0+z);const $=n.get(ee);if(ee.version!==$.__version||Z===!0){t.activeTexture(r.TEXTURE0+z);const Te=Xe.getPrimaries(Xe.workingColorSpace),le=S.colorSpace===fi?null:Xe.getPrimaries(S.colorSpace),fe=S.colorSpace===fi||Te===le?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,fe);const Ve=S.isCompressedTexture||S.image[0].isCompressedTexture,ne=S.image[0]&&S.image[0].isDataTexture,ve=[];for(let Q=0;Q<6;Q++)!Ve&&!ne?ve[Q]=_(S.image[Q],!0,i.maxCubemapSize):ve[Q]=ne?S.image[Q].image:S.image[Q],ve[Q]=qe(S,ve[Q]);const Pe=ve[0],De=s.convert(S.format,S.colorSpace),xe=s.convert(S.type),We=T(S.internalFormat,De,xe,S.colorSpace),Ie=S.isVideoTexture!==!0,je=$.__version===void 0||Z===!0,U=ee.dataReady;let ae=D(S,Pe);se(r.TEXTURE_CUBE_MAP,S);let q;if(Ve){Ie&&je&&t.texStorage2D(r.TEXTURE_CUBE_MAP,ae,We,Pe.width,Pe.height);for(let Q=0;Q<6;Q++){q=ve[Q].mipmaps;for(let ge=0;ge<q.length;ge++){const pe=q[ge];S.format!==Wt?De!==null?Ie?U&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ge,0,0,pe.width,pe.height,De,pe.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ge,We,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ie?U&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ge,0,0,pe.width,pe.height,De,xe,pe.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ge,We,pe.width,pe.height,0,De,xe,pe.data)}}}else{if(q=S.mipmaps,Ie&&je){q.length>0&&ae++;const Q=Me(ve[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,ae,We,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(ne){Ie?U&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,ve[Q].width,ve[Q].height,De,xe,ve[Q].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,We,ve[Q].width,ve[Q].height,0,De,xe,ve[Q].data);for(let ge=0;ge<q.length;ge++){const Be=q[ge].image[Q].image;Ie?U&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ge+1,0,0,Be.width,Be.height,De,xe,Be.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ge+1,We,Be.width,Be.height,0,De,xe,Be.data)}}else{Ie?U&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,De,xe,ve[Q]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,We,De,xe,ve[Q]);for(let ge=0;ge<q.length;ge++){const pe=q[ge];Ie?U&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ge+1,0,0,De,xe,pe.image[Q]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ge+1,We,De,xe,pe.image[Q])}}}g(S)&&p(r.TEXTURE_CUBE_MAP),$.__version=ee.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function oe(C,S,z,Z,ee,$){const Te=s.convert(z.format,z.colorSpace),le=s.convert(z.type),fe=T(z.internalFormat,Te,le,z.colorSpace),Ve=n.get(S),ne=n.get(z);if(ne.__renderTarget=S,!Ve.__hasExternalTextures){const ve=Math.max(1,S.width>>$),Pe=Math.max(1,S.height>>$);ee===r.TEXTURE_3D||ee===r.TEXTURE_2D_ARRAY?t.texImage3D(ee,$,fe,ve,Pe,S.depth,0,Te,le,null):t.texImage2D(ee,$,fe,ve,Pe,0,Te,le,null)}t.bindFramebuffer(r.FRAMEBUFFER,C),Le(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Z,ee,ne.__webglTexture,0,Fe(S)):(ee===r.TEXTURE_2D||ee>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,Z,ee,ne.__webglTexture,$),t.bindFramebuffer(r.FRAMEBUFFER,null)}function ie(C,S,z){if(r.bindRenderbuffer(r.RENDERBUFFER,C),S.depthBuffer){const Z=S.depthTexture,ee=Z&&Z.isDepthTexture?Z.type:null,$=v(S.stencilBuffer,ee),Te=S.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,le=Fe(S);Le(S)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,le,$,S.width,S.height):z?r.renderbufferStorageMultisample(r.RENDERBUFFER,le,$,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,$,S.width,S.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,Te,r.RENDERBUFFER,C)}else{const Z=S.textures;for(let ee=0;ee<Z.length;ee++){const $=Z[ee],Te=s.convert($.format,$.colorSpace),le=s.convert($.type),fe=T($.internalFormat,Te,le,$.colorSpace),Ve=Fe(S);z&&Le(S)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ve,fe,S.width,S.height):Le(S)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ve,fe,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,fe,S.width,S.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function he(C,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,C),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=n.get(S.depthTexture);Z.__renderTarget=S,(!Z.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),V(S.depthTexture,0);const ee=Z.__webglTexture,$=Fe(S);if(S.depthTexture.format===cs)Le(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ee,0,$):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ee,0);else if(S.depthTexture.format===Oi)Le(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ee,0,$):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function de(C){const S=n.get(C),z=C.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==C.depthTexture){const Z=C.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),Z){const ee=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,Z.removeEventListener("dispose",ee)};Z.addEventListener("dispose",ee),S.__depthDisposeCallback=ee}S.__boundDepthTexture=Z}if(C.depthTexture&&!S.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");he(S.__webglFramebuffer,C)}else if(z){S.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer[Z]),S.__webglDepthbuffer[Z]===void 0)S.__webglDepthbuffer[Z]=r.createRenderbuffer(),ie(S.__webglDepthbuffer[Z],C,!1);else{const ee=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,$=S.__webglDepthbuffer[Z];r.bindRenderbuffer(r.RENDERBUFFER,$),r.framebufferRenderbuffer(r.FRAMEBUFFER,ee,r.RENDERBUFFER,$)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=r.createRenderbuffer(),ie(S.__webglDepthbuffer,C,!1);else{const Z=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ee=S.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ee),r.framebufferRenderbuffer(r.FRAMEBUFFER,Z,r.RENDERBUFFER,ee)}t.bindFramebuffer(r.FRAMEBUFFER,null)}function _e(C,S,z){const Z=n.get(C);S!==void 0&&oe(Z.__webglFramebuffer,C,C.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),z!==void 0&&de(C)}function Qe(C){const S=C.texture,z=n.get(C),Z=n.get(S);C.addEventListener("dispose",A);const ee=C.textures,$=C.isWebGLCubeRenderTarget===!0,Te=ee.length>1;if(Te||(Z.__webglTexture===void 0&&(Z.__webglTexture=r.createTexture()),Z.__version=S.version,a.memory.textures++),$){z.__webglFramebuffer=[];for(let le=0;le<6;le++)if(S.mipmaps&&S.mipmaps.length>0){z.__webglFramebuffer[le]=[];for(let fe=0;fe<S.mipmaps.length;fe++)z.__webglFramebuffer[le][fe]=r.createFramebuffer()}else z.__webglFramebuffer[le]=r.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){z.__webglFramebuffer=[];for(let le=0;le<S.mipmaps.length;le++)z.__webglFramebuffer[le]=r.createFramebuffer()}else z.__webglFramebuffer=r.createFramebuffer();if(Te)for(let le=0,fe=ee.length;le<fe;le++){const Ve=n.get(ee[le]);Ve.__webglTexture===void 0&&(Ve.__webglTexture=r.createTexture(),a.memory.textures++)}if(C.samples>0&&Le(C)===!1){z.__webglMultisampledFramebuffer=r.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let le=0;le<ee.length;le++){const fe=ee[le];z.__webglColorRenderbuffer[le]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,z.__webglColorRenderbuffer[le]);const Ve=s.convert(fe.format,fe.colorSpace),ne=s.convert(fe.type),ve=T(fe.internalFormat,Ve,ne,fe.colorSpace,C.isXRRenderTarget===!0),Pe=Fe(C);r.renderbufferStorageMultisample(r.RENDERBUFFER,Pe,ve,C.width,C.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+le,r.RENDERBUFFER,z.__webglColorRenderbuffer[le])}r.bindRenderbuffer(r.RENDERBUFFER,null),C.depthBuffer&&(z.__webglDepthRenderbuffer=r.createRenderbuffer(),ie(z.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if($){t.bindTexture(r.TEXTURE_CUBE_MAP,Z.__webglTexture),se(r.TEXTURE_CUBE_MAP,S);for(let le=0;le<6;le++)if(S.mipmaps&&S.mipmaps.length>0)for(let fe=0;fe<S.mipmaps.length;fe++)oe(z.__webglFramebuffer[le][fe],C,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+le,fe);else oe(z.__webglFramebuffer[le],C,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);g(S)&&p(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Te){for(let le=0,fe=ee.length;le<fe;le++){const Ve=ee[le],ne=n.get(Ve);t.bindTexture(r.TEXTURE_2D,ne.__webglTexture),se(r.TEXTURE_2D,Ve),oe(z.__webglFramebuffer,C,Ve,r.COLOR_ATTACHMENT0+le,r.TEXTURE_2D,0),g(Ve)&&p(r.TEXTURE_2D)}t.unbindTexture()}else{let le=r.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(le=C.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(le,Z.__webglTexture),se(le,S),S.mipmaps&&S.mipmaps.length>0)for(let fe=0;fe<S.mipmaps.length;fe++)oe(z.__webglFramebuffer[fe],C,S,r.COLOR_ATTACHMENT0,le,fe);else oe(z.__webglFramebuffer,C,S,r.COLOR_ATTACHMENT0,le,0);g(S)&&p(le),t.unbindTexture()}C.depthBuffer&&de(C)}function ke(C){const S=C.textures;for(let z=0,Z=S.length;z<Z;z++){const ee=S[z];if(g(ee)){const $=x(C),Te=n.get(ee).__webglTexture;t.bindTexture($,Te),p($),t.unbindTexture()}}}const Je=[],N=[];function pt(C){if(C.samples>0){if(Le(C)===!1){const S=C.textures,z=C.width,Z=C.height;let ee=r.COLOR_BUFFER_BIT;const $=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Te=n.get(C),le=S.length>1;if(le)for(let fe=0;fe<S.length;fe++)t.bindFramebuffer(r.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+fe,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,Te.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+fe,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,Te.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Te.__webglFramebuffer);for(let fe=0;fe<S.length;fe++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ee|=r.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ee|=r.STENCIL_BUFFER_BIT)),le){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,Te.__webglColorRenderbuffer[fe]);const Ve=n.get(S[fe]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Ve,0)}r.blitFramebuffer(0,0,z,Z,0,0,z,Z,ee,r.NEAREST),l===!0&&(Je.length=0,N.length=0,Je.push(r.COLOR_ATTACHMENT0+fe),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Je.push($),N.push($),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,N)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Je))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),le)for(let fe=0;fe<S.length;fe++){t.bindFramebuffer(r.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+fe,r.RENDERBUFFER,Te.__webglColorRenderbuffer[fe]);const Ve=n.get(S[fe]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,Te.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+fe,r.TEXTURE_2D,Ve,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Te.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const S=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[S])}}}function Fe(C){return Math.min(i.maxSamples,C.samples)}function Le(C){const S=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Ee(C){const S=a.render.frame;h.get(C)!==S&&(h.set(C,S),C.update())}function qe(C,S){const z=C.colorSpace,Z=C.format,ee=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||z!==Bt&&z!==fi&&(Xe.getTransfer(z)===st?(Z!==Wt||ee!==In)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),S}function Me(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=I,this.resetTextureUnits=L,this.setTexture2D=V,this.setTexture2DArray=B,this.setTexture3D=Y,this.setTextureCube=G,this.rebindTextures=_e,this.setupRenderTarget=Qe,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=pt,this.setupDepthRenderbuffer=de,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=Le}function U_(r,e){function t(n,i=fi){let s;const a=Xe.getTransfer(i);if(n===In)return r.UNSIGNED_BYTE;if(n===Ml)return r.UNSIGNED_SHORT_4_4_4_4;if(n===Tl)return r.UNSIGNED_SHORT_5_5_5_1;if(n===uu)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===cu)return r.BYTE;if(n===hu)return r.SHORT;if(n===tr)return r.UNSIGNED_SHORT;if(n===yl)return r.INT;if(n===Fi)return r.UNSIGNED_INT;if(n===Kt)return r.FLOAT;if(n===kt)return r.HALF_FLOAT;if(n===du)return r.ALPHA;if(n===fu)return r.RGB;if(n===Wt)return r.RGBA;if(n===pu)return r.LUMINANCE;if(n===mu)return r.LUMINANCE_ALPHA;if(n===cs)return r.DEPTH_COMPONENT;if(n===Oi)return r.DEPTH_STENCIL;if(n===Sl)return r.RED;if(n===bl)return r.RED_INTEGER;if(n===gu)return r.RG;if(n===wl)return r.RG_INTEGER;if(n===El)return r.RGBA_INTEGER;if(n===$r||n===Kr||n===Zr||n===Qr)if(a===st)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===$r)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Kr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Zr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Qr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===$r)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Kr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Zr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Qr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ao||n===Ro||n===Co||n===Po)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Ao)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ro)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Co)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Po)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Do||n===Io||n===Lo)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Do||n===Io)return a===st?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Lo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Uo||n===No||n===Fo||n===ko||n===Oo||n===Bo||n===zo||n===Ho||n===Vo||n===Go||n===Wo||n===Xo||n===qo||n===jo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Uo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===No)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Fo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ko)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Oo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Bo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===zo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ho)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Vo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Go)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Wo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Xo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===qo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===jo)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Jr||n===Yo||n===$o)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Jr)return a===st?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Yo)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===$o)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===_u||n===Ko||n===Zo||n===Qo)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Jr)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Ko)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Zo)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Qo)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ki?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}class N_ extends Gt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Nt extends ut{constructor(){super(),this.isGroup=!0,this.type="Group"}}const F_={type:"move"};class Qa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const _ of e.hand.values()){const g=t.getJointPose(_,n),p=this._getHandJoint(c,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(F_)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Nt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const k_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,O_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class B_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new vt,s=e.properties.get(i);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new dt({vertexShader:k_,fragmentShader:O_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new $e(new Dn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class z_ extends Bi{constructor(e,t){super();const n=this;let i=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null;const _=new B_,g=t.getContextAttributes();let p=null,x=null;const T=[],v=[],D=new Re;let E=null;const A=new Gt;A.viewport=new Ke;const w=new Gt;w.viewport=new Ke;const M=[A,w],y=new N_;let R=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let te=T[j];return te===void 0&&(te=new Qa,T[j]=te),te.getTargetRaySpace()},this.getControllerGrip=function(j){let te=T[j];return te===void 0&&(te=new Qa,T[j]=te),te.getGripSpace()},this.getHand=function(j){let te=T[j];return te===void 0&&(te=new Qa,T[j]=te),te.getHandSpace()};function I(j){const te=v.indexOf(j.inputSource);if(te===-1)return;const oe=T[te];oe!==void 0&&(oe.update(j.inputSource,j.frame,c||a),oe.dispatchEvent({type:j.type,data:j.inputSource}))}function O(){i.removeEventListener("select",I),i.removeEventListener("selectstart",I),i.removeEventListener("selectend",I),i.removeEventListener("squeeze",I),i.removeEventListener("squeezestart",I),i.removeEventListener("squeezeend",I),i.removeEventListener("end",O),i.removeEventListener("inputsourceschange",V);for(let j=0;j<T.length;j++){const te=v[j];te!==null&&(v[j]=null,T[j].disconnect(te))}R=null,L=null,_.reset(),e.setRenderTarget(p),f=null,d=null,u=null,i=null,x=null,ye.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(D.width,D.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(j){if(i=j,i!==null){if(p=e.getRenderTarget(),i.addEventListener("select",I),i.addEventListener("selectstart",I),i.addEventListener("selectend",I),i.addEventListener("squeeze",I),i.addEventListener("squeezestart",I),i.addEventListener("squeezeend",I),i.addEventListener("end",O),i.addEventListener("inputsourceschange",V),g.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(D),i.renderState.layers===void 0){const te={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(i,t,te),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new Qt(f.framebufferWidth,f.framebufferHeight,{format:Wt,type:In,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let te=null,oe=null,ie=null;g.depth&&(ie=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=g.stencil?Oi:cs,oe=g.stencil?ki:Fi);const he={colorFormat:t.RGBA8,depthFormat:ie,scaleFactor:s};u=new XRWebGLBinding(i,t),d=u.createProjectionLayer(he),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),x=new Qt(d.textureWidth,d.textureHeight,{format:Wt,type:In,depthTexture:new Il(d.textureWidth,d.textureHeight,oe,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),ye.setContext(i),ye.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function V(j){for(let te=0;te<j.removed.length;te++){const oe=j.removed[te],ie=v.indexOf(oe);ie>=0&&(v[ie]=null,T[ie].disconnect(oe))}for(let te=0;te<j.added.length;te++){const oe=j.added[te];let ie=v.indexOf(oe);if(ie===-1){for(let de=0;de<T.length;de++)if(de>=v.length){v.push(oe),ie=de;break}else if(v[de]===null){v[de]=oe,ie=de;break}if(ie===-1)break}const he=T[ie];he&&he.connect(oe)}}const B=new P,Y=new P;function G(j,te,oe){B.setFromMatrixPosition(te.matrixWorld),Y.setFromMatrixPosition(oe.matrixWorld);const ie=B.distanceTo(Y),he=te.projectionMatrix.elements,de=oe.projectionMatrix.elements,_e=he[14]/(he[10]-1),Qe=he[14]/(he[10]+1),ke=(he[9]+1)/he[5],Je=(he[9]-1)/he[5],N=(he[8]-1)/he[0],pt=(de[8]+1)/de[0],Fe=_e*N,Le=_e*pt,Ee=ie/(-N+pt),qe=Ee*-N;if(te.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(qe),j.translateZ(Ee),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),he[10]===-1)j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{const Me=_e+Ee,C=Qe+Ee,S=Fe-qe,z=Le+(ie-qe),Z=ke*Qe/C*Me,ee=Je*Qe/C*Me;j.projectionMatrix.makePerspective(S,z,Z,ee,Me,C),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function H(j,te){te===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(te.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(i===null)return;let te=j.near,oe=j.far;_.texture!==null&&(_.depthNear>0&&(te=_.depthNear),_.depthFar>0&&(oe=_.depthFar)),y.near=w.near=A.near=te,y.far=w.far=A.far=oe,(R!==y.near||L!==y.far)&&(i.updateRenderState({depthNear:y.near,depthFar:y.far}),R=y.near,L=y.far),A.layers.mask=j.layers.mask|2,w.layers.mask=j.layers.mask|4,y.layers.mask=A.layers.mask|w.layers.mask;const ie=j.parent,he=y.cameras;H(y,ie);for(let de=0;de<he.length;de++)H(he[de],ie);he.length===2?G(y,A,w):y.projectionMatrix.copy(A.projectionMatrix),K(j,y,ie)};function K(j,te,oe){oe===null?j.matrix.copy(te.matrixWorld):(j.matrix.copy(oe.matrixWorld),j.matrix.invert(),j.matrix.multiply(te.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=gs*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(j){l=j,d!==null&&(d.fixedFoveation=j),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=j)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(y)};let J=null;function se(j,te){if(h=te.getViewerPose(c||a),m=te,h!==null){const oe=h.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let ie=!1;oe.length!==y.cameras.length&&(y.cameras.length=0,ie=!0);for(let de=0;de<oe.length;de++){const _e=oe[de];let Qe=null;if(f!==null)Qe=f.getViewport(_e);else{const Je=u.getViewSubImage(d,_e);Qe=Je.viewport,de===0&&(e.setRenderTargetTextures(x,Je.colorTexture,d.ignoreDepthValues?void 0:Je.depthStencilTexture),e.setRenderTarget(x))}let ke=M[de];ke===void 0&&(ke=new Gt,ke.layers.enable(de),ke.viewport=new Ke,M[de]=ke),ke.matrix.fromArray(_e.transform.matrix),ke.matrix.decompose(ke.position,ke.quaternion,ke.scale),ke.projectionMatrix.fromArray(_e.projectionMatrix),ke.projectionMatrixInverse.copy(ke.projectionMatrix).invert(),ke.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),de===0&&(y.matrix.copy(ke.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ie===!0&&y.cameras.push(ke)}const he=i.enabledFeatures;if(he&&he.includes("depth-sensing")){const de=u.getDepthInformation(oe[0]);de&&de.isValid&&de.texture&&_.init(e,de,i.renderState)}}for(let oe=0;oe<T.length;oe++){const ie=v[oe],he=T[oe];ie!==null&&he!==void 0&&he.update(ie,te,c||a)}J&&J(j,te),te.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:te}),m=null}const ye=new Iu;ye.setAnimationLoop(se),this.setAnimationLoop=function(j){J=j},this.dispose=function(){}}}const Ai=new Ln,H_=new Ce;function V_(r,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,Cu(r)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function i(g,p,x,T,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(g,p):p.isMeshToonMaterial?(s(g,p),u(g,p)):p.isMeshPhongMaterial?(s(g,p),h(g,p)):p.isMeshStandardMaterial?(s(g,p),d(g,p),p.isMeshPhysicalMaterial&&f(g,p,v)):p.isMeshMatcapMaterial?(s(g,p),m(g,p)):p.isMeshDepthMaterial?s(g,p):p.isMeshDistanceMaterial?(s(g,p),_(g,p)):p.isMeshNormalMaterial?s(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,x,T):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Ot&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Ot&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);const x=e.get(p),T=x.envMap,v=x.envMapRotation;T&&(g.envMap.value=T,Ai.copy(v),Ai.x*=-1,Ai.y*=-1,Ai.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Ai.y*=-1,Ai.z*=-1),g.envMapRotation.value.setFromMatrix4(H_.makeRotationFromEuler(Ai)),g.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,x,T){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*x,g.scale.value=T*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,x){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ot&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=x.texture,g.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){const x=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(x.matrixWorld),g.nearDistance.value=x.shadow.camera.near,g.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function G_(r,e,t,n){let i={},s={},a=[];const o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,T){const v=T.program;n.uniformBlockBinding(x,v)}function c(x,T){let v=i[x.id];v===void 0&&(m(x),v=h(x),i[x.id]=v,x.addEventListener("dispose",g));const D=T.program;n.updateUBOMapping(x,D);const E=e.render.frame;s[x.id]!==E&&(d(x),s[x.id]=E)}function h(x){const T=u();x.__bindingPointIndex=T;const v=r.createBuffer(),D=x.__size,E=x.usage;return r.bindBuffer(r.UNIFORM_BUFFER,v),r.bufferData(r.UNIFORM_BUFFER,D,E),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,T,v),v}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){const T=i[x.id],v=x.uniforms,D=x.__cache;r.bindBuffer(r.UNIFORM_BUFFER,T);for(let E=0,A=v.length;E<A;E++){const w=Array.isArray(v[E])?v[E]:[v[E]];for(let M=0,y=w.length;M<y;M++){const R=w[M];if(f(R,E,M,D)===!0){const L=R.__offset,I=Array.isArray(R.value)?R.value:[R.value];let O=0;for(let V=0;V<I.length;V++){const B=I[V],Y=_(B);typeof B=="number"||typeof B=="boolean"?(R.__data[0]=B,r.bufferSubData(r.UNIFORM_BUFFER,L+O,R.__data)):B.isMatrix3?(R.__data[0]=B.elements[0],R.__data[1]=B.elements[1],R.__data[2]=B.elements[2],R.__data[3]=0,R.__data[4]=B.elements[3],R.__data[5]=B.elements[4],R.__data[6]=B.elements[5],R.__data[7]=0,R.__data[8]=B.elements[6],R.__data[9]=B.elements[7],R.__data[10]=B.elements[8],R.__data[11]=0):(B.toArray(R.__data,O),O+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,L,R.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(x,T,v,D){const E=x.value,A=T+"_"+v;if(D[A]===void 0)return typeof E=="number"||typeof E=="boolean"?D[A]=E:D[A]=E.clone(),!0;{const w=D[A];if(typeof E=="number"||typeof E=="boolean"){if(w!==E)return D[A]=E,!0}else if(w.equals(E)===!1)return w.copy(E),!0}return!1}function m(x){const T=x.uniforms;let v=0;const D=16;for(let A=0,w=T.length;A<w;A++){const M=Array.isArray(T[A])?T[A]:[T[A]];for(let y=0,R=M.length;y<R;y++){const L=M[y],I=Array.isArray(L.value)?L.value:[L.value];for(let O=0,V=I.length;O<V;O++){const B=I[O],Y=_(B),G=v%D,H=G%Y.boundary,K=G+H;v+=H,K!==0&&D-K<Y.storage&&(v+=D-K),L.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=v,v+=Y.storage}}}const E=v%D;return E>0&&(v+=D-E),x.__size=v,x.__cache={},this}function _(x){const T={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(T.boundary=4,T.storage=4):x.isVector2?(T.boundary=8,T.storage=8):x.isVector3||x.isColor?(T.boundary=16,T.storage=12):x.isVector4?(T.boundary=16,T.storage=16):x.isMatrix3?(T.boundary=48,T.storage=48):x.isMatrix4?(T.boundary=64,T.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),T}function g(x){const T=x.target;T.removeEventListener("dispose",g);const v=a.indexOf(T.__bindingPointIndex);a.splice(v,1),r.deleteBuffer(i[T.id]),delete i[T.id],delete s[T.id]}function p(){for(const x in i)r.deleteBuffer(i[x]);a=[],i={},s={}}return{bind:l,update:c,dispose:p}}class W_{constructor(e={}){const{canvas:t=Pf(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const m=new Uint32Array(4),_=new Int32Array(4);let g=null,p=null;const x=[],T=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=ht,this.toneMapping=_i,this.toneMappingExposure=1;const v=this;let D=!1,E=0,A=0,w=null,M=-1,y=null;const R=new Ke,L=new Ke;let I=null;const O=new ue(0);let V=0,B=t.width,Y=t.height,G=1,H=null,K=null;const J=new Ke(0,0,B,Y),se=new Ke(0,0,B,Y);let ye=!1;const j=new Pl;let te=!1,oe=!1;const ie=new Ce,he=new Ce,de=new P,_e=new Ke,Qe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ke=!1;function Je(){return w===null?G:1}let N=n;function pt(b,F){return t.getContext(b,F)}try{const b={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${vl}`),t.addEventListener("webglcontextlost",Q,!1),t.addEventListener("webglcontextrestored",ge,!1),t.addEventListener("webglcontextcreationerror",pe,!1),N===null){const F="webgl2";if(N=pt(F,b),N===null)throw pt(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Fe,Le,Ee,qe,Me,C,S,z,Z,ee,$,Te,le,fe,Ve,ne,ve,Pe,De,xe,We,Ie,je,U;function ae(){Fe=new $g(N),Fe.init(),Ie=new U_(N,Fe),Le=new Gg(N,Fe,e,Ie),Ee=new D_(N,Fe),Le.reverseDepthBuffer&&d&&Ee.buffers.depth.setReversed(!0),qe=new Qg(N),Me=new g_,C=new L_(N,Fe,Ee,Me,Le,Ie,qe),S=new Xg(v),z=new Yg(v),Z=new rp(N),je=new Hg(N,Z),ee=new Kg(N,Z,qe,je),$=new e0(N,ee,Z,qe),De=new Jg(N,Le,C),ne=new Wg(Me),Te=new m_(v,S,z,Fe,Le,je,ne),le=new V_(v,Me),fe=new v_,Ve=new b_(Fe),Pe=new zg(v,S,z,Ee,$,f,l),ve=new C_(v,$,Le),U=new G_(N,qe,Le,Ee),xe=new Vg(N,Fe,qe),We=new Zg(N,Fe,qe),qe.programs=Te.programs,v.capabilities=Le,v.extensions=Fe,v.properties=Me,v.renderLists=fe,v.shadowMap=ve,v.state=Ee,v.info=qe}ae();const q=new z_(v,N);this.xr=q,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const b=Fe.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Fe.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(b){b!==void 0&&(G=b,this.setSize(B,Y,!1))},this.getSize=function(b){return b.set(B,Y)},this.setSize=function(b,F,W=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}B=b,Y=F,t.width=Math.floor(b*G),t.height=Math.floor(F*G),W===!0&&(t.style.width=b+"px",t.style.height=F+"px"),this.setViewport(0,0,b,F)},this.getDrawingBufferSize=function(b){return b.set(B*G,Y*G).floor()},this.setDrawingBufferSize=function(b,F,W){B=b,Y=F,G=W,t.width=Math.floor(b*W),t.height=Math.floor(F*W),this.setViewport(0,0,b,F)},this.getCurrentViewport=function(b){return b.copy(R)},this.getViewport=function(b){return b.copy(J)},this.setViewport=function(b,F,W,X){b.isVector4?J.set(b.x,b.y,b.z,b.w):J.set(b,F,W,X),Ee.viewport(R.copy(J).multiplyScalar(G).round())},this.getScissor=function(b){return b.copy(se)},this.setScissor=function(b,F,W,X){b.isVector4?se.set(b.x,b.y,b.z,b.w):se.set(b,F,W,X),Ee.scissor(L.copy(se).multiplyScalar(G).round())},this.getScissorTest=function(){return ye},this.setScissorTest=function(b){Ee.setScissorTest(ye=b)},this.setOpaqueSort=function(b){H=b},this.setTransparentSort=function(b){K=b},this.getClearColor=function(b){return b.copy(Pe.getClearColor())},this.setClearColor=function(){Pe.setClearColor.apply(Pe,arguments)},this.getClearAlpha=function(){return Pe.getClearAlpha()},this.setClearAlpha=function(){Pe.setClearAlpha.apply(Pe,arguments)},this.clear=function(b=!0,F=!0,W=!0){let X=0;if(b){let k=!1;if(w!==null){const re=w.texture.format;k=re===El||re===wl||re===bl}if(k){const re=w.texture.type,me=re===In||re===Fi||re===tr||re===ki||re===Ml||re===Tl,Se=Pe.getClearColor(),be=Pe.getClearAlpha(),Ue=Se.r,ze=Se.g,we=Se.b;me?(m[0]=Ue,m[1]=ze,m[2]=we,m[3]=be,N.clearBufferuiv(N.COLOR,0,m)):(_[0]=Ue,_[1]=ze,_[2]=we,_[3]=be,N.clearBufferiv(N.COLOR,0,_))}else X|=N.COLOR_BUFFER_BIT}F&&(X|=N.DEPTH_BUFFER_BIT),W&&(X|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Q,!1),t.removeEventListener("webglcontextrestored",ge,!1),t.removeEventListener("webglcontextcreationerror",pe,!1),fe.dispose(),Ve.dispose(),Me.dispose(),S.dispose(),z.dispose(),$.dispose(),je.dispose(),U.dispose(),Te.dispose(),q.dispose(),q.removeEventListener("sessionstart",$l),q.removeEventListener("sessionend",Kl),xi.stop()};function Q(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function ge(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const b=qe.autoReset,F=ve.enabled,W=ve.autoUpdate,X=ve.needsUpdate,k=ve.type;ae(),qe.autoReset=b,ve.enabled=F,ve.autoUpdate=W,ve.needsUpdate=X,ve.type=k}function pe(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Be(b){const F=b.target;F.removeEventListener("dispose",Be),ft(F)}function ft(b){Dt(b),Me.remove(b)}function Dt(b){const F=Me.get(b).programs;F!==void 0&&(F.forEach(function(W){Te.releaseProgram(W)}),b.isShaderMaterial&&Te.releaseShaderCache(b))}this.renderBufferDirect=function(b,F,W,X,k,re){F===null&&(F=Qe);const me=k.isMesh&&k.matrixWorld.determinant()<0,Se=ed(b,F,W,X,k);Ee.setMaterial(X,me);let be=W.index,Ue=1;if(X.wireframe===!0){if(be=ee.getWireframeAttribute(W),be===void 0)return;Ue=2}const ze=W.drawRange,we=W.attributes.position;let Ye=ze.start*Ue,ot=(ze.start+ze.count)*Ue;re!==null&&(Ye=Math.max(Ye,re.start*Ue),ot=Math.min(ot,(re.start+re.count)*Ue)),be!==null?(Ye=Math.max(Ye,0),ot=Math.min(ot,be.count)):we!=null&&(Ye=Math.max(Ye,0),ot=Math.min(ot,we.count));const lt=ot-Ye;if(lt<0||lt===1/0)return;je.setup(k,X,Se,W,be);let qt,et=xe;if(be!==null&&(qt=Z.get(be),et=We,et.setIndex(qt)),k.isMesh)X.wireframe===!0?(Ee.setLineWidth(X.wireframeLinewidth*Je()),et.setMode(N.LINES)):et.setMode(N.TRIANGLES);else if(k.isLine){let Ae=X.linewidth;Ae===void 0&&(Ae=1),Ee.setLineWidth(Ae*Je()),k.isLineSegments?et.setMode(N.LINES):k.isLineLoop?et.setMode(N.LINE_LOOP):et.setMode(N.LINE_STRIP)}else k.isPoints?et.setMode(N.POINTS):k.isSprite&&et.setMode(N.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)et.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(Fe.get("WEBGL_multi_draw"))et.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const Ae=k._multiDrawStarts,Bn=k._multiDrawCounts,tt=k._multiDrawCount,un=be?Z.get(be).bytesPerElement:1,Gi=Me.get(X).currentProgram.getUniforms();for(let Jt=0;Jt<tt;Jt++)Gi.setValue(N,"_gl_DrawID",Jt),et.render(Ae[Jt]/un,Bn[Jt])}else if(k.isInstancedMesh)et.renderInstances(Ye,lt,k.count);else if(W.isInstancedBufferGeometry){const Ae=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Bn=Math.min(W.instanceCount,Ae);et.renderInstances(Ye,lt,Bn)}else et.render(Ye,lt)};function it(b,F,W){b.transparent===!0&&b.side===Rt&&b.forceSinglePass===!1?(b.side=Ot,b.needsUpdate=!0,or(b,F,W),b.side=ei,b.needsUpdate=!0,or(b,F,W),b.side=Rt):or(b,F,W)}this.compile=function(b,F,W=null){W===null&&(W=b),p=Ve.get(W),p.init(F),T.push(p),W.traverseVisible(function(k){k.isLight&&k.layers.test(F.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),b!==W&&b.traverseVisible(function(k){k.isLight&&k.layers.test(F.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),p.setupLights();const X=new Set;return b.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const re=k.material;if(re)if(Array.isArray(re))for(let me=0;me<re.length;me++){const Se=re[me];it(Se,W,k),X.add(Se)}else it(re,W,k),X.add(re)}),T.pop(),p=null,X},this.compileAsync=function(b,F,W=null){const X=this.compile(b,F,W);return new Promise(k=>{function re(){if(X.forEach(function(me){Me.get(me).currentProgram.isReady()&&X.delete(me)}),X.size===0){k(b);return}setTimeout(re,10)}Fe.get("KHR_parallel_shader_compile")!==null?re():setTimeout(re,10)})};let hn=null;function On(b){hn&&hn(b)}function $l(){xi.stop()}function Kl(){xi.start()}const xi=new Iu;xi.setAnimationLoop(On),typeof self<"u"&&xi.setContext(self),this.setAnimationLoop=function(b){hn=b,q.setAnimationLoop(b),b===null?xi.stop():xi.start()},q.addEventListener("sessionstart",$l),q.addEventListener("sessionend",Kl),this.render=function(b,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(F),F=q.getCamera()),b.isScene===!0&&b.onBeforeRender(v,b,F,w),p=Ve.get(b,T.length),p.init(F),T.push(p),he.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),j.setFromProjectionMatrix(he),oe=this.localClippingEnabled,te=ne.init(this.clippingPlanes,oe),g=fe.get(b,x.length),g.init(),x.push(g),q.enabled===!0&&q.isPresenting===!0){const re=v.xr.getDepthSensingMesh();re!==null&&Ma(re,F,-1/0,v.sortObjects)}Ma(b,F,0,v.sortObjects),g.finish(),v.sortObjects===!0&&g.sort(H,K),ke=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,ke&&Pe.addToRenderList(g,b),this.info.render.frame++,te===!0&&ne.beginShadows();const W=p.state.shadowsArray;ve.render(W,b,F),te===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();const X=g.opaque,k=g.transmissive;if(p.setupLights(),F.isArrayCamera){const re=F.cameras;if(k.length>0)for(let me=0,Se=re.length;me<Se;me++){const be=re[me];Ql(X,k,b,be)}ke&&Pe.render(b);for(let me=0,Se=re.length;me<Se;me++){const be=re[me];Zl(g,b,be,be.viewport)}}else k.length>0&&Ql(X,k,b,F),ke&&Pe.render(b),Zl(g,b,F);w!==null&&(C.updateMultisampleRenderTarget(w),C.updateRenderTargetMipmap(w)),b.isScene===!0&&b.onAfterRender(v,b,F),je.resetDefaultState(),M=-1,y=null,T.pop(),T.length>0?(p=T[T.length-1],te===!0&&ne.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,x.pop(),x.length>0?g=x[x.length-1]:g=null};function Ma(b,F,W,X){if(b.visible===!1)return;if(b.layers.test(F.layers)){if(b.isGroup)W=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(F);else if(b.isLight)p.pushLight(b),b.castShadow&&p.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||j.intersectsSprite(b)){X&&_e.setFromMatrixPosition(b.matrixWorld).applyMatrix4(he);const me=$.update(b),Se=b.material;Se.visible&&g.push(b,me,Se,W,_e.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||j.intersectsObject(b))){const me=$.update(b),Se=b.material;if(X&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),_e.copy(b.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),_e.copy(me.boundingSphere.center)),_e.applyMatrix4(b.matrixWorld).applyMatrix4(he)),Array.isArray(Se)){const be=me.groups;for(let Ue=0,ze=be.length;Ue<ze;Ue++){const we=be[Ue],Ye=Se[we.materialIndex];Ye&&Ye.visible&&g.push(b,me,Ye,W,_e.z,we)}}else Se.visible&&g.push(b,me,Se,W,_e.z,null)}}const re=b.children;for(let me=0,Se=re.length;me<Se;me++)Ma(re[me],F,W,X)}function Zl(b,F,W,X){const k=b.opaque,re=b.transmissive,me=b.transparent;p.setupLightsView(W),te===!0&&ne.setGlobalState(v.clippingPlanes,W),X&&Ee.viewport(R.copy(X)),k.length>0&&ar(k,F,W),re.length>0&&ar(re,F,W),me.length>0&&ar(me,F,W),Ee.buffers.depth.setTest(!0),Ee.buffers.depth.setMask(!0),Ee.buffers.color.setMask(!0),Ee.setPolygonOffset(!1)}function Ql(b,F,W,X){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[X.id]===void 0&&(p.state.transmissionRenderTarget[X.id]=new Qt(1,1,{generateMipmaps:!0,type:Fe.has("EXT_color_buffer_half_float")||Fe.has("EXT_color_buffer_float")?kt:In,minFilter:xn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace}));const re=p.state.transmissionRenderTarget[X.id],me=X.viewport||R;re.setSize(me.z,me.w);const Se=v.getRenderTarget();v.setRenderTarget(re),v.getClearColor(O),V=v.getClearAlpha(),V<1&&v.setClearColor(16777215,.5),v.clear(),ke&&Pe.render(W);const be=v.toneMapping;v.toneMapping=_i;const Ue=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),p.setupLightsView(X),te===!0&&ne.setGlobalState(v.clippingPlanes,X),ar(b,W,X),C.updateMultisampleRenderTarget(re),C.updateRenderTargetMipmap(re),Fe.has("WEBGL_multisampled_render_to_texture")===!1){let ze=!1;for(let we=0,Ye=F.length;we<Ye;we++){const ot=F[we],lt=ot.object,qt=ot.geometry,et=ot.material,Ae=ot.group;if(et.side===Rt&&lt.layers.test(X.layers)){const Bn=et.side;et.side=Ot,et.needsUpdate=!0,Jl(lt,W,X,qt,et,Ae),et.side=Bn,et.needsUpdate=!0,ze=!0}}ze===!0&&(C.updateMultisampleRenderTarget(re),C.updateRenderTargetMipmap(re))}v.setRenderTarget(Se),v.setClearColor(O,V),Ue!==void 0&&(X.viewport=Ue),v.toneMapping=be}function ar(b,F,W){const X=F.isScene===!0?F.overrideMaterial:null;for(let k=0,re=b.length;k<re;k++){const me=b[k],Se=me.object,be=me.geometry,Ue=X===null?me.material:X,ze=me.group;Se.layers.test(W.layers)&&Jl(Se,F,W,be,Ue,ze)}}function Jl(b,F,W,X,k,re){b.onBeforeRender(v,F,W,X,k,re),b.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),k.onBeforeRender(v,F,W,X,b,re),k.transparent===!0&&k.side===Rt&&k.forceSinglePass===!1?(k.side=Ot,k.needsUpdate=!0,v.renderBufferDirect(W,F,X,k,b,re),k.side=ei,k.needsUpdate=!0,v.renderBufferDirect(W,F,X,k,b,re),k.side=Rt):v.renderBufferDirect(W,F,X,k,b,re),b.onAfterRender(v,F,W,X,k,re)}function or(b,F,W){F.isScene!==!0&&(F=Qe);const X=Me.get(b),k=p.state.lights,re=p.state.shadowsArray,me=k.state.version,Se=Te.getParameters(b,k.state,re,F,W),be=Te.getProgramCacheKey(Se);let Ue=X.programs;X.environment=b.isMeshStandardMaterial?F.environment:null,X.fog=F.fog,X.envMap=(b.isMeshStandardMaterial?z:S).get(b.envMap||X.environment),X.envMapRotation=X.environment!==null&&b.envMap===null?F.environmentRotation:b.envMapRotation,Ue===void 0&&(b.addEventListener("dispose",Be),Ue=new Map,X.programs=Ue);let ze=Ue.get(be);if(ze!==void 0){if(X.currentProgram===ze&&X.lightsStateVersion===me)return tc(b,Se),ze}else Se.uniforms=Te.getUniforms(b),b.onBeforeCompile(Se,v),ze=Te.acquireProgram(Se,be),Ue.set(be,ze),X.uniforms=Se.uniforms;const we=X.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(we.clippingPlanes=ne.uniform),tc(b,Se),X.needsLights=nd(b),X.lightsStateVersion=me,X.needsLights&&(we.ambientLightColor.value=k.state.ambient,we.lightProbe.value=k.state.probe,we.directionalLights.value=k.state.directional,we.directionalLightShadows.value=k.state.directionalShadow,we.spotLights.value=k.state.spot,we.spotLightShadows.value=k.state.spotShadow,we.rectAreaLights.value=k.state.rectArea,we.ltc_1.value=k.state.rectAreaLTC1,we.ltc_2.value=k.state.rectAreaLTC2,we.pointLights.value=k.state.point,we.pointLightShadows.value=k.state.pointShadow,we.hemisphereLights.value=k.state.hemi,we.directionalShadowMap.value=k.state.directionalShadowMap,we.directionalShadowMatrix.value=k.state.directionalShadowMatrix,we.spotShadowMap.value=k.state.spotShadowMap,we.spotLightMatrix.value=k.state.spotLightMatrix,we.spotLightMap.value=k.state.spotLightMap,we.pointShadowMap.value=k.state.pointShadowMap,we.pointShadowMatrix.value=k.state.pointShadowMatrix),X.currentProgram=ze,X.uniformsList=null,ze}function ec(b){if(b.uniformsList===null){const F=b.currentProgram.getUniforms();b.uniformsList=ea.seqWithValue(F.seq,b.uniforms)}return b.uniformsList}function tc(b,F){const W=Me.get(b);W.outputColorSpace=F.outputColorSpace,W.batching=F.batching,W.batchingColor=F.batchingColor,W.instancing=F.instancing,W.instancingColor=F.instancingColor,W.instancingMorph=F.instancingMorph,W.skinning=F.skinning,W.morphTargets=F.morphTargets,W.morphNormals=F.morphNormals,W.morphColors=F.morphColors,W.morphTargetsCount=F.morphTargetsCount,W.numClippingPlanes=F.numClippingPlanes,W.numIntersection=F.numClipIntersection,W.vertexAlphas=F.vertexAlphas,W.vertexTangents=F.vertexTangents,W.toneMapping=F.toneMapping}function ed(b,F,W,X,k){F.isScene!==!0&&(F=Qe),C.resetTextureUnits();const re=F.fog,me=X.isMeshStandardMaterial?F.environment:null,Se=w===null?v.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Bt,be=(X.isMeshStandardMaterial?z:S).get(X.envMap||me),Ue=X.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,ze=!!W.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),we=!!W.morphAttributes.position,Ye=!!W.morphAttributes.normal,ot=!!W.morphAttributes.color;let lt=_i;X.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(lt=v.toneMapping);const qt=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,et=qt!==void 0?qt.length:0,Ae=Me.get(X),Bn=p.state.lights;if(te===!0&&(oe===!0||b!==y)){const rn=b===y&&X.id===M;ne.setState(X,b,rn)}let tt=!1;X.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==Bn.state.version||Ae.outputColorSpace!==Se||k.isBatchedMesh&&Ae.batching===!1||!k.isBatchedMesh&&Ae.batching===!0||k.isBatchedMesh&&Ae.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&Ae.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&Ae.instancing===!1||!k.isInstancedMesh&&Ae.instancing===!0||k.isSkinnedMesh&&Ae.skinning===!1||!k.isSkinnedMesh&&Ae.skinning===!0||k.isInstancedMesh&&Ae.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Ae.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Ae.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Ae.instancingMorph===!1&&k.morphTexture!==null||Ae.envMap!==be||X.fog===!0&&Ae.fog!==re||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==ne.numPlanes||Ae.numIntersection!==ne.numIntersection)||Ae.vertexAlphas!==Ue||Ae.vertexTangents!==ze||Ae.morphTargets!==we||Ae.morphNormals!==Ye||Ae.morphColors!==ot||Ae.toneMapping!==lt||Ae.morphTargetsCount!==et)&&(tt=!0):(tt=!0,Ae.__version=X.version);let un=Ae.currentProgram;tt===!0&&(un=or(X,F,k));let Gi=!1,Jt=!1,As=!1;const ct=un.getUniforms(),Sn=Ae.uniforms;if(Ee.useProgram(un.program)&&(Gi=!0,Jt=!0,As=!0),X.id!==M&&(M=X.id,Jt=!0),Gi||y!==b){Ee.buffers.depth.getReversed()?(ie.copy(b.projectionMatrix),If(ie),Lf(ie),ct.setValue(N,"projectionMatrix",ie)):ct.setValue(N,"projectionMatrix",b.projectionMatrix),ct.setValue(N,"viewMatrix",b.matrixWorldInverse);const ti=ct.map.cameraPosition;ti!==void 0&&ti.setValue(N,de.setFromMatrixPosition(b.matrixWorld)),Le.logarithmicDepthBuffer&&ct.setValue(N,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&ct.setValue(N,"isOrthographic",b.isOrthographicCamera===!0),y!==b&&(y=b,Jt=!0,As=!0)}if(k.isSkinnedMesh){ct.setOptional(N,k,"bindMatrix"),ct.setOptional(N,k,"bindMatrixInverse");const rn=k.skeleton;rn&&(rn.boneTexture===null&&rn.computeBoneTexture(),ct.setValue(N,"boneTexture",rn.boneTexture,C))}k.isBatchedMesh&&(ct.setOptional(N,k,"batchingTexture"),ct.setValue(N,"batchingTexture",k._matricesTexture,C),ct.setOptional(N,k,"batchingIdTexture"),ct.setValue(N,"batchingIdTexture",k._indirectTexture,C),ct.setOptional(N,k,"batchingColorTexture"),k._colorsTexture!==null&&ct.setValue(N,"batchingColorTexture",k._colorsTexture,C));const Rs=W.morphAttributes;if((Rs.position!==void 0||Rs.normal!==void 0||Rs.color!==void 0)&&De.update(k,W,un),(Jt||Ae.receiveShadow!==k.receiveShadow)&&(Ae.receiveShadow=k.receiveShadow,ct.setValue(N,"receiveShadow",k.receiveShadow)),X.isMeshGouraudMaterial&&X.envMap!==null&&(Sn.envMap.value=be,Sn.flipEnvMap.value=be.isCubeTexture&&be.isRenderTargetTexture===!1?-1:1),X.isMeshStandardMaterial&&X.envMap===null&&F.environment!==null&&(Sn.envMapIntensity.value=F.environmentIntensity),Jt&&(ct.setValue(N,"toneMappingExposure",v.toneMappingExposure),Ae.needsLights&&td(Sn,As),re&&X.fog===!0&&le.refreshFogUniforms(Sn,re),le.refreshMaterialUniforms(Sn,X,G,Y,p.state.transmissionRenderTarget[b.id]),ea.upload(N,ec(Ae),Sn,C)),X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(ea.upload(N,ec(Ae),Sn,C),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&ct.setValue(N,"center",k.center),ct.setValue(N,"modelViewMatrix",k.modelViewMatrix),ct.setValue(N,"normalMatrix",k.normalMatrix),ct.setValue(N,"modelMatrix",k.matrixWorld),X.isShaderMaterial||X.isRawShaderMaterial){const rn=X.uniformsGroups;for(let ti=0,ni=rn.length;ti<ni;ti++){const nc=rn[ti];U.update(nc,un),U.bind(nc,un)}}return un}function td(b,F){b.ambientLightColor.needsUpdate=F,b.lightProbe.needsUpdate=F,b.directionalLights.needsUpdate=F,b.directionalLightShadows.needsUpdate=F,b.pointLights.needsUpdate=F,b.pointLightShadows.needsUpdate=F,b.spotLights.needsUpdate=F,b.spotLightShadows.needsUpdate=F,b.rectAreaLights.needsUpdate=F,b.hemisphereLights.needsUpdate=F}function nd(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(b,F,W){Me.get(b.texture).__webglTexture=F,Me.get(b.depthTexture).__webglTexture=W;const X=Me.get(b);X.__hasExternalTextures=!0,X.__autoAllocateDepthBuffer=W===void 0,X.__autoAllocateDepthBuffer||Fe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),X.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,F){const W=Me.get(b);W.__webglFramebuffer=F,W.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(b,F=0,W=0){w=b,E=F,A=W;let X=!0,k=null,re=!1,me=!1;if(b){const be=Me.get(b);if(be.__useDefaultFramebuffer!==void 0)Ee.bindFramebuffer(N.FRAMEBUFFER,null),X=!1;else if(be.__webglFramebuffer===void 0)C.setupRenderTarget(b);else if(be.__hasExternalTextures)C.rebindTextures(b,Me.get(b.texture).__webglTexture,Me.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const we=b.depthTexture;if(be.__boundDepthTexture!==we){if(we!==null&&Me.has(we)&&(b.width!==we.image.width||b.height!==we.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(b)}}const Ue=b.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(me=!0);const ze=Me.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(ze[F])?k=ze[F][W]:k=ze[F],re=!0):b.samples>0&&C.useMultisampledRTT(b)===!1?k=Me.get(b).__webglMultisampledFramebuffer:Array.isArray(ze)?k=ze[W]:k=ze,R.copy(b.viewport),L.copy(b.scissor),I=b.scissorTest}else R.copy(J).multiplyScalar(G).floor(),L.copy(se).multiplyScalar(G).floor(),I=ye;if(Ee.bindFramebuffer(N.FRAMEBUFFER,k)&&X&&Ee.drawBuffers(b,k),Ee.viewport(R),Ee.scissor(L),Ee.setScissorTest(I),re){const be=Me.get(b.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+F,be.__webglTexture,W)}else if(me){const be=Me.get(b.texture),Ue=F||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,be.__webglTexture,W||0,Ue)}M=-1},this.readRenderTargetPixels=function(b,F,W,X,k,re,me){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=Me.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&me!==void 0&&(Se=Se[me]),Se){Ee.bindFramebuffer(N.FRAMEBUFFER,Se);try{const be=b.texture,Ue=be.format,ze=be.type;if(!Le.textureFormatReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Le.textureTypeReadable(ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=b.width-X&&W>=0&&W<=b.height-k&&N.readPixels(F,W,X,k,Ie.convert(Ue),Ie.convert(ze),re)}finally{const be=w!==null?Me.get(w).__webglFramebuffer:null;Ee.bindFramebuffer(N.FRAMEBUFFER,be)}}},this.readRenderTargetPixelsAsync=async function(b,F,W,X,k,re,me){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=Me.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&me!==void 0&&(Se=Se[me]),Se){const be=b.texture,Ue=be.format,ze=be.type;if(!Le.textureFormatReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Le.textureTypeReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(F>=0&&F<=b.width-X&&W>=0&&W<=b.height-k){Ee.bindFramebuffer(N.FRAMEBUFFER,Se);const we=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,we),N.bufferData(N.PIXEL_PACK_BUFFER,re.byteLength,N.STREAM_READ),N.readPixels(F,W,X,k,Ie.convert(Ue),Ie.convert(ze),0);const Ye=w!==null?Me.get(w).__webglFramebuffer:null;Ee.bindFramebuffer(N.FRAMEBUFFER,Ye);const ot=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Df(N,ot,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,we),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,re),N.deleteBuffer(we),N.deleteSync(ot),re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,F=null,W=0){b.isTexture!==!0&&(Ws("WebGLRenderer: copyFramebufferToTexture function signature has changed."),F=arguments[0]||null,b=arguments[1]);const X=Math.pow(2,-W),k=Math.floor(b.image.width*X),re=Math.floor(b.image.height*X),me=F!==null?F.x:0,Se=F!==null?F.y:0;C.setTexture2D(b,0),N.copyTexSubImage2D(N.TEXTURE_2D,W,0,0,me,Se,k,re),Ee.unbindTexture()},this.copyTextureToTexture=function(b,F,W=null,X=null,k=0){b.isTexture!==!0&&(Ws("WebGLRenderer: copyTextureToTexture function signature has changed."),X=arguments[0]||null,b=arguments[1],F=arguments[2],k=arguments[3]||0,W=null);let re,me,Se,be,Ue,ze,we,Ye,ot;const lt=b.isCompressedTexture?b.mipmaps[k]:b.image;W!==null?(re=W.max.x-W.min.x,me=W.max.y-W.min.y,Se=W.isBox3?W.max.z-W.min.z:1,be=W.min.x,Ue=W.min.y,ze=W.isBox3?W.min.z:0):(re=lt.width,me=lt.height,Se=lt.depth||1,be=0,Ue=0,ze=0),X!==null?(we=X.x,Ye=X.y,ot=X.z):(we=0,Ye=0,ot=0);const qt=Ie.convert(F.format),et=Ie.convert(F.type);let Ae;F.isData3DTexture?(C.setTexture3D(F,0),Ae=N.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(C.setTexture2DArray(F,0),Ae=N.TEXTURE_2D_ARRAY):(C.setTexture2D(F,0),Ae=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,F.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,F.unpackAlignment);const Bn=N.getParameter(N.UNPACK_ROW_LENGTH),tt=N.getParameter(N.UNPACK_IMAGE_HEIGHT),un=N.getParameter(N.UNPACK_SKIP_PIXELS),Gi=N.getParameter(N.UNPACK_SKIP_ROWS),Jt=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,lt.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,lt.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,be),N.pixelStorei(N.UNPACK_SKIP_ROWS,Ue),N.pixelStorei(N.UNPACK_SKIP_IMAGES,ze);const As=b.isDataArrayTexture||b.isData3DTexture,ct=F.isDataArrayTexture||F.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){const Sn=Me.get(b),Rs=Me.get(F),rn=Me.get(Sn.__renderTarget),ti=Me.get(Rs.__renderTarget);Ee.bindFramebuffer(N.READ_FRAMEBUFFER,rn.__webglFramebuffer),Ee.bindFramebuffer(N.DRAW_FRAMEBUFFER,ti.__webglFramebuffer);for(let ni=0;ni<Se;ni++)As&&N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Me.get(b).__webglTexture,k,ze+ni),b.isDepthTexture?(ct&&N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Me.get(F).__webglTexture,k,ot+ni),N.blitFramebuffer(be,Ue,re,me,we,Ye,re,me,N.DEPTH_BUFFER_BIT,N.NEAREST)):ct?N.copyTexSubImage3D(Ae,k,we,Ye,ot+ni,be,Ue,re,me):N.copyTexSubImage2D(Ae,k,we,Ye,ot+ni,be,Ue,re,me);Ee.bindFramebuffer(N.READ_FRAMEBUFFER,null),Ee.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else ct?b.isDataTexture||b.isData3DTexture?N.texSubImage3D(Ae,k,we,Ye,ot,re,me,Se,qt,et,lt.data):F.isCompressedArrayTexture?N.compressedTexSubImage3D(Ae,k,we,Ye,ot,re,me,Se,qt,lt.data):N.texSubImage3D(Ae,k,we,Ye,ot,re,me,Se,qt,et,lt):b.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,k,we,Ye,re,me,qt,et,lt.data):b.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,k,we,Ye,lt.width,lt.height,qt,lt.data):N.texSubImage2D(N.TEXTURE_2D,k,we,Ye,re,me,qt,et,lt);N.pixelStorei(N.UNPACK_ROW_LENGTH,Bn),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,tt),N.pixelStorei(N.UNPACK_SKIP_PIXELS,un),N.pixelStorei(N.UNPACK_SKIP_ROWS,Gi),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Jt),k===0&&F.generateMipmaps&&N.generateMipmap(Ae),Ee.unbindTexture()},this.copyTextureToTexture3D=function(b,F,W=null,X=null,k=0){return b.isTexture!==!0&&(Ws("WebGLRenderer: copyTextureToTexture3D function signature has changed."),W=arguments[0]||null,X=arguments[1]||null,b=arguments[2],F=arguments[3],k=arguments[4]||0),Ws('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,F,W,X,k)},this.initRenderTarget=function(b){Me.get(b).__webglFramebuffer===void 0&&C.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?C.setTextureCube(b,0):b.isData3DTexture?C.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?C.setTexture2DArray(b,0):C.setTexture2D(b,0),Ee.unbindTexture()},this.resetState=function(){E=0,A=0,w=null,Ee.reset(),je.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Zn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}class Ll{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new ue(e),this.density=t}clone(){return new Ll(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class sl extends ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ln,this.environmentIntensity=1,this.environmentRotation=new Ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class X_{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=el,this.updateRanges=[],this.version=0,this.uuid=yn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=yn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=yn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const zt=new P;class Ul{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyMatrix4(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyNormalMatrix(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.transformDirection(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=gn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=rt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=gn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=gn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=gn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=gn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array),i=rt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array),i=rt(i,this.array),s=rt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new xt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Ul(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const hh=new P,uh=new Ke,dh=new Ke,q_=new P,fh=new Ce,Ur=new P,Ja=new Nn,ph=new Ce,eo=new ma;class j_ extends $e{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=gc,this.bindMatrix=new Ce,this.bindMatrixInverse=new Ce,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Un),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ur),this.boundingBox.expandByPoint(Ur)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Nn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ur),this.boundingSphere.expandByPoint(Ur)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ja.copy(this.boundingSphere),Ja.applyMatrix4(i),e.ray.intersectsSphere(Ja)!==!1&&(ph.copy(i).invert(),eo.copy(e.ray).applyMatrix4(ph),!(this.boundingBox!==null&&eo.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,eo)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Ke,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===gc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Jd?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;uh.fromBufferAttribute(i.attributes.skinIndex,e),dh.fromBufferAttribute(i.attributes.skinWeight,e),hh.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const a=dh.getComponent(s);if(a!==0){const o=uh.getComponent(s);fh.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(q_.copy(hh).applyMatrix4(fh),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class ku extends ut{constructor(){super(),this.isBone=!0,this.type="Bone"}}class zi extends vt{constructor(e=null,t=1,n=1,i,s,a,o,l,c=Pt,h=Pt,u,d){super(null,a,o,l,c,h,i,s,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const mh=new Ce,Y_=new Ce;class Nl{constructor(e=[],t=[]){this.uuid=yn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ce)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ce;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,a=e.length;s<a;s++){const o=e[s]?e[s].matrixWorld:Y_;mh.multiplyMatrices(o,t[s]),mh.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Nl(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new zi(t,e,e,Wt,Kt);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const s=e.bones[n];let a=t[s];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),a=new ku),this.bones.push(a),this.boneInverses.push(new Ce().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class rl extends xt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const ss=new Ce,gh=new Ce,Nr=[],_h=new Un,$_=new Ce,Ls=new $e,Us=new Nn;class Zs extends $e{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new rl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,$_)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Un),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ss),_h.copy(e.boundingBox).applyMatrix4(ss),this.boundingBox.union(_h)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Nn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ss),Us.copy(e.boundingSphere).applyMatrix4(ss),this.boundingSphere.union(Us)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,a=e*s+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(Ls.geometry=this.geometry,Ls.material=this.material,Ls.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Us.copy(this.boundingSphere),Us.applyMatrix4(n),e.ray.intersectsSphere(Us)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,ss),gh.multiplyMatrices(n,ss),Ls.matrixWorld=gh,Ls.raycast(e,Nr);for(let a=0,o=Nr.length;a<o;a++){const l=Nr[a];l.instanceId=s,l.object=this,t.push(l)}Nr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new rl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new zi(new Float32Array(i*this.count),i,this.count,Sl,Kt));const s=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*e;s[l]=o,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Ou extends Mn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const la=new P,ca=new P,vh=new Ce,Ns=new ma,Fr=new Nn,to=new P,xh=new P;class Fl extends ut{constructor(e=new _t,t=new Ou){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)la.fromBufferAttribute(t,i-1),ca.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=la.distanceTo(ca);e.setAttribute("lineDistance",new Ze(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fr.copy(n.boundingSphere),Fr.applyMatrix4(i),Fr.radius+=s,e.ray.intersectsSphere(Fr)===!1)return;vh.copy(i).invert(),Ns.copy(e.ray).applyMatrix4(vh);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let _=f,g=m-1;_<g;_+=c){const p=h.getX(_),x=h.getX(_+1),T=kr(this,e,Ns,l,p,x);T&&t.push(T)}if(this.isLineLoop){const _=h.getX(m-1),g=h.getX(f),p=kr(this,e,Ns,l,_,g);p&&t.push(p)}}else{const f=Math.max(0,a.start),m=Math.min(d.count,a.start+a.count);for(let _=f,g=m-1;_<g;_+=c){const p=kr(this,e,Ns,l,_,_+1);p&&t.push(p)}if(this.isLineLoop){const _=kr(this,e,Ns,l,m-1,f);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function kr(r,e,t,n,i,s){const a=r.geometry.attributes.position;if(la.fromBufferAttribute(a,i),ca.fromBufferAttribute(a,s),t.distanceSqToSegment(la,ca,to,xh)>n)return;to.applyMatrix4(r.matrixWorld);const l=e.ray.origin.distanceTo(to);if(!(l<e.near||l>e.far))return{distance:l,point:xh.clone().applyMatrix4(r.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:r}}const yh=new P,Mh=new P;class K_ extends Fl{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)yh.fromBufferAttribute(t,i),Mh.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+yh.distanceTo(Mh);e.setAttribute("lineDistance",new Ze(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Z_ extends Fl{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class kl extends Mn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new ue(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Th=new Ce,al=new ma,Or=new Nn,Br=new P;class Ol extends ut{constructor(e=new _t,t=new kl){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Or.copy(n.boundingSphere),Or.applyMatrix4(i),Or.radius+=s,e.ray.intersectsSphere(Or)===!1)return;Th.copy(i).invert(),al.copy(e.ray).applyMatrix4(Th);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let m=d,_=f;m<_;m++){const g=c.getX(m);Br.fromBufferAttribute(u,g),Sh(Br,g,l,i,e,t,this)}}else{const d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let m=d,_=f;m<_;m++)Br.fromBufferAttribute(u,m),Sh(Br,m,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Sh(r,e,t,n,i,s,a){const o=al.distanceSqToPoint(r);if(o<t){const l=new P;al.closestPointToPoint(r,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class Bl extends vt{constructor(e,t,n,i,s,a,o,l,c){super(e,t,n,i,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class us extends _t{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const s=[],a=[],o=[],l=[],c=new P,h=new Re;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){const f=n+u/t*i;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new Ze(a,3)),this.setAttribute("normal",new Ze(o,3)),this.setAttribute("uv",new Ze(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new us(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class zl extends _t{constructor(e=1,t=1,n=1,i=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),s=Math.floor(s);const h=[],u=[],d=[],f=[];let m=0;const _=[],g=n/2;let p=0;x(),a===!1&&(e>0&&T(!0),t>0&&T(!1)),this.setIndex(h),this.setAttribute("position",new Ze(u,3)),this.setAttribute("normal",new Ze(d,3)),this.setAttribute("uv",new Ze(f,2));function x(){const v=new P,D=new P;let E=0;const A=(t-e)/n;for(let w=0;w<=s;w++){const M=[],y=w/s,R=y*(t-e)+e;for(let L=0;L<=i;L++){const I=L/i,O=I*l+o,V=Math.sin(O),B=Math.cos(O);D.x=R*V,D.y=-y*n+g,D.z=R*B,u.push(D.x,D.y,D.z),v.set(V,A,B).normalize(),d.push(v.x,v.y,v.z),f.push(I,1-y),M.push(m++)}_.push(M)}for(let w=0;w<i;w++)for(let M=0;M<s;M++){const y=_[M][w],R=_[M+1][w],L=_[M+1][w+1],I=_[M][w+1];(e>0||M!==0)&&(h.push(y,R,I),E+=3),(t>0||M!==s-1)&&(h.push(R,L,I),E+=3)}c.addGroup(p,E,0),p+=E}function T(v){const D=m,E=new Re,A=new P;let w=0;const M=v===!0?e:t,y=v===!0?1:-1;for(let L=1;L<=i;L++)u.push(0,g*y,0),d.push(0,y,0),f.push(.5,.5),m++;const R=m;for(let L=0;L<=i;L++){const O=L/i*l+o,V=Math.cos(O),B=Math.sin(O);A.x=M*B,A.y=g*y,A.z=M*V,u.push(A.x,A.y,A.z),d.push(0,y,0),E.x=V*.5+.5,E.y=B*.5*y+.5,f.push(E.x,E.y),m++}for(let L=0;L<i;L++){const I=D+L,O=R+L;v===!0?h.push(O,O+1,I):h.push(O+1,O,I),w+=3}c.addGroup(p,w,v===!0?1:2),p+=w}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zl(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Hl extends _t{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const s=[],a=[];o(i),c(n),h(),this.setAttribute("position",new Ze(s,3)),this.setAttribute("normal",new Ze(s.slice(),3)),this.setAttribute("uv",new Ze(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(x){const T=new P,v=new P,D=new P;for(let E=0;E<t.length;E+=3)f(t[E+0],T),f(t[E+1],v),f(t[E+2],D),l(T,v,D,x)}function l(x,T,v,D){const E=D+1,A=[];for(let w=0;w<=E;w++){A[w]=[];const M=x.clone().lerp(v,w/E),y=T.clone().lerp(v,w/E),R=E-w;for(let L=0;L<=R;L++)L===0&&w===E?A[w][L]=M:A[w][L]=M.clone().lerp(y,L/R)}for(let w=0;w<E;w++)for(let M=0;M<2*(E-w)-1;M++){const y=Math.floor(M/2);M%2===0?(d(A[w][y+1]),d(A[w+1][y]),d(A[w][y])):(d(A[w][y+1]),d(A[w+1][y+1]),d(A[w+1][y]))}}function c(x){const T=new P;for(let v=0;v<s.length;v+=3)T.x=s[v+0],T.y=s[v+1],T.z=s[v+2],T.normalize().multiplyScalar(x),s[v+0]=T.x,s[v+1]=T.y,s[v+2]=T.z}function h(){const x=new P;for(let T=0;T<s.length;T+=3){x.x=s[T+0],x.y=s[T+1],x.z=s[T+2];const v=g(x)/2/Math.PI+.5,D=p(x)/Math.PI+.5;a.push(v,1-D)}m(),u()}function u(){for(let x=0;x<a.length;x+=6){const T=a[x+0],v=a[x+2],D=a[x+4],E=Math.max(T,v,D),A=Math.min(T,v,D);E>.9&&A<.1&&(T<.2&&(a[x+0]+=1),v<.2&&(a[x+2]+=1),D<.2&&(a[x+4]+=1))}}function d(x){s.push(x.x,x.y,x.z)}function f(x,T){const v=x*3;T.x=e[v+0],T.y=e[v+1],T.z=e[v+2]}function m(){const x=new P,T=new P,v=new P,D=new P,E=new Re,A=new Re,w=new Re;for(let M=0,y=0;M<s.length;M+=9,y+=6){x.set(s[M+0],s[M+1],s[M+2]),T.set(s[M+3],s[M+4],s[M+5]),v.set(s[M+6],s[M+7],s[M+8]),E.set(a[y+0],a[y+1]),A.set(a[y+2],a[y+3]),w.set(a[y+4],a[y+5]),D.copy(x).add(T).add(v).divideScalar(3);const R=g(D);_(E,y+0,x,R),_(A,y+2,T,R),_(w,y+4,v,R)}}function _(x,T,v,D){D<0&&x.x===1&&(a[T]=x.x-1),v.x===0&&v.z===0&&(a[T]=D/2/Math.PI+.5)}function g(x){return Math.atan2(x.z,-x.x)}function p(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Hl(e.vertices,e.indices,e.radius,e.details)}}class Vl extends Hl{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Vl(e.radius,e.detail)}}class va extends _t{constructor(e=.5,t=1,n=32,i=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);const o=[],l=[],c=[],h=[];let u=e;const d=(t-e)/i,f=new P,m=new Re;for(let _=0;_<=i;_++){for(let g=0;g<=n;g++){const p=s+g/n*a;f.x=u*Math.cos(p),f.y=u*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/t+1)/2,m.y=(f.y/t+1)/2,h.push(m.x,m.y)}u+=d}for(let _=0;_<i;_++){const g=_*(n+1);for(let p=0;p<n;p++){const x=p+g,T=x,v=x+n+1,D=x+n+2,E=x+1;o.push(T,v,E),o.push(v,D,E)}}this.setIndex(o),this.setAttribute("position",new Ze(l,3)),this.setAttribute("normal",new Ze(c,3)),this.setAttribute("uv",new Ze(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new va(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class bs extends _t{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new P,d=new P,f=[],m=[],_=[],g=[];for(let p=0;p<=n;p++){const x=[],T=p/n;let v=0;p===0&&a===0?v=.5/t:p===n&&l===Math.PI&&(v=-.5/t);for(let D=0;D<=t;D++){const E=D/t;u.x=-e*Math.cos(i+E*s)*Math.sin(a+T*o),u.y=e*Math.cos(a+T*o),u.z=e*Math.sin(i+E*s)*Math.sin(a+T*o),m.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),g.push(E+v,1-T),x.push(c++)}h.push(x)}for(let p=0;p<n;p++)for(let x=0;x<t;x++){const T=h[p][x+1],v=h[p][x],D=h[p+1][x],E=h[p+1][x+1];(p!==0||a>0)&&f.push(T,v,E),(p!==n-1||l<Math.PI)&&f.push(v,D,E)}this.setIndex(f),this.setAttribute("position",new Ze(m,3)),this.setAttribute("normal",new Ze(_,3)),this.setAttribute("uv",new Ze(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bs(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Gl extends _t{constructor(e=1,t=.4,n=12,i=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);const a=[],o=[],l=[],c=[],h=new P,u=new P,d=new P;for(let f=0;f<=n;f++)for(let m=0;m<=i;m++){const _=m/i*s,g=f/n*Math.PI*2;u.x=(e+t*Math.cos(g))*Math.cos(_),u.y=(e+t*Math.cos(g))*Math.sin(_),u.z=t*Math.sin(g),o.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(m/i),c.push(f/n)}for(let f=1;f<=n;f++)for(let m=1;m<=i;m++){const _=(i+1)*f+m-1,g=(i+1)*(f-1)+m-1,p=(i+1)*(f-1)+m,x=(i+1)*f+m;a.push(_,g,x),a.push(g,p,x)}this.setIndex(a),this.setAttribute("position",new Ze(o,3)),this.setAttribute("normal",new Ze(l,3)),this.setAttribute("uv",new Ze(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gl(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Q_ extends dt{static get type(){return"RawShaderMaterial"}constructor(e){super(e),this.isRawShaderMaterial=!0}}class nn extends Mn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Rl,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ln,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Fn extends nn{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Re(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return At(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ue(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ue(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ue(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class J_ extends Mn{static get type(){return"MeshNormalMaterial"}constructor(e){super(),this.isMeshNormalMaterial=!0,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Rl,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}}function zr(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function ev(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function tv(r){function e(i,s){return r[i]-r[s]}const t=r.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function bh(r,e,t){const n=r.length,i=new r.constructor(n);for(let s=0,a=0;a!==n;++s){const o=t[s]*e;for(let l=0;l!==e;++l)i[a++]=r[o+l]}return i}function Bu(r,e,t,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let a=s[n];if(a!==void 0)if(Array.isArray(a))do a=s[n],a!==void 0&&(e.push(s.time),t.push.apply(t,a)),s=r[i++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[n],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=r[i++];while(s!==void 0);else do a=s[n],a!==void 0&&(e.push(s.time),t.push(a)),s=r[i++];while(s!==void 0)}class rr{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],s=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=s)){const o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=t[--n-1],e>=s)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class nv extends rr{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:as,endingEnd:as}}intervalChanged_(e,t,n){const i=this.parameterPositions;let s=e-2,a=e+1,o=i[s],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case os:s=e,o=2*t-n;break;case aa:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case os:a=e,l=2*n-t;break;case aa:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(n-t)/(i-t),_=m*m,g=_*m,p=-d*g+2*d*_-d*m,x=(1+d)*g+(-1.5-2*d)*_+(-.5+d)*m+1,T=(-1-f)*g+(1.5+f)*_+.5*m,v=f*g-f*_;for(let D=0;D!==o;++D)s[D]=p*a[h+D]+x*a[c+D]+T*a[l+D]+v*a[u+D];return s}}class zu extends rr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==o;++d)s[d]=a[c+d]*u+a[l+d]*h;return s}}class iv extends rr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class kn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=zr(t,this.TimeBufferType),this.values=zr(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:zr(e.times,Array),values:zr(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new iv(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new zu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new nv(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case nr:t=this.InterpolantFactoryMethodDiscrete;break;case ir:t=this.InterpolantFactoryMethodLinear;break;case wa:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return nr;case this.InterpolantFactoryMethodLinear:return ir;case this.InterpolantFactoryMethodSmooth:return wa}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);const o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){const l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&ev(i))for(let o=0,l=i.length;o!==l;++o){const c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===wa,s=e.length-1;let a=1;for(let o=1;o<s;++o){let l=!1;const c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(i)l=!0;else{const u=o*n,d=u-n,f=u+n;for(let m=0;m!==n;++m){const _=t[u+m];if(_!==t[d+m]||_!==t[f+m]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];const u=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}kn.prototype.TimeBufferType=Float32Array;kn.prototype.ValueBufferType=Float32Array;kn.prototype.DefaultInterpolation=ir;class ws extends kn{constructor(e,t,n){super(e,t,n)}}ws.prototype.ValueTypeName="bool";ws.prototype.ValueBufferType=Array;ws.prototype.DefaultInterpolation=nr;ws.prototype.InterpolantFactoryMethodLinear=void 0;ws.prototype.InterpolantFactoryMethodSmooth=void 0;class Hu extends kn{}Hu.prototype.ValueTypeName="color";class vs extends kn{}vs.prototype.ValueTypeName="number";class sv extends rr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t);let c=e*o;for(let h=c+o;c!==h;c+=4)Xt.slerpFlat(s,0,a,c-o,a,c,l);return s}}class xs extends kn{InterpolantFactoryMethodLinear(e){return new sv(this.times,this.values,this.getValueSize(),e)}}xs.prototype.ValueTypeName="quaternion";xs.prototype.InterpolantFactoryMethodSmooth=void 0;class Es extends kn{constructor(e,t,n){super(e,t,n)}}Es.prototype.ValueTypeName="string";Es.prototype.ValueBufferType=Array;Es.prototype.DefaultInterpolation=nr;Es.prototype.InterpolantFactoryMethodLinear=void 0;Es.prototype.InterpolantFactoryMethodSmooth=void 0;class ys extends kn{}ys.prototype.ValueTypeName="vector";class ol{constructor(e="",t=-1,n=[],i=Al){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=yn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(av(n[a]).scale(i));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,a=n.length;s!==a;++s)t.push(kn.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const s=t.length,a=[];for(let o=0;o<s;o++){let l=[],c=[];l.push((o+s-1)%s,o,(o+1)%s),c.push(0,1,0);const h=tv(l);l=bh(l,1,h),c=bh(c,1,h),!i&&l[0]===0&&(l.push(s),c.push(c[0])),a.push(new vs(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){const c=e[o],h=c.name.match(s);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(c)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,f,m,_){if(f.length!==0){const g=[],p=[];Bu(f,g,p,m),g.length!==0&&_.push(new u(d,g,p))}},i=[],s=e.name||"default",a=e.fps||30,o=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let m;for(m=0;m<d.length;m++)if(d[m].morphTargets)for(let _=0;_<d[m].morphTargets.length;_++)f[d[m].morphTargets[_]]=-1;for(const _ in f){const g=[],p=[];for(let x=0;x!==d[m].morphTargets.length;++x){const T=d[m];g.push(T.time),p.push(T.morphTarget===_?1:0)}i.push(new vs(".morphTargetInfluence["+_+"]",g,p))}l=f.length*a}else{const f=".bones["+t[u].name+"]";n(ys,f+".position",d,"pos",i),n(xs,f+".quaternion",d,"rot",i),n(ys,f+".scale",d,"scl",i)}}return i.length===0?null:new this(s,l,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function rv(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return vs;case"vector":case"vector2":case"vector3":case"vector4":return ys;case"color":return Hu;case"quaternion":return xs;case"bool":case"boolean":return ws;case"string":return Es}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function av(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=rv(r.type);if(r.times===void 0){const t=[],n=[];Bu(r.keys,t,n,"value"),r.times=t,r.values=n}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const mi={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class ov{constructor(e,t,n){const i=this;let s=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){o++,s===!1&&i.onStart!==void 0&&i.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){const f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null}}}const lv=new ov;class Hi{constructor(e){this.manager=e!==void 0?e:lv,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Hi.DEFAULT_MATERIAL_NAME="__DEFAULT";const qn={};class cv extends Error{constructor(e,t){super(e),this.response=t}}class Wl extends Hi{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=mi.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(qn[e]!==void 0){qn[e].push({onLoad:t,onProgress:n,onError:i});return}qn[e]=[],qn[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=qn[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,m=f!==0;let _=0;const g=new ReadableStream({start(p){x();function x(){u.read().then(({done:T,value:v})=>{if(T)p.close();else{_+=v.byteLength;const D=new ProgressEvent("progress",{lengthComputable:m,loaded:_,total:f});for(let E=0,A=h.length;E<A;E++){const w=h[E];w.onProgress&&w.onProgress(D)}p.enqueue(v),x()}},T=>{p.error(T)})}}});return new Response(g)}else throw new cv(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(m=>f.decode(m))}}}).then(c=>{mi.add(e,c);const h=qn[e];delete qn[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=qn[e];if(h===void 0)throw this.manager.itemError(e),c;delete qn[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class hv extends Hi{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=mi.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a;const o=sr("img");function l(){h(),mi.add(e,this),t&&t(this),s.manager.itemEnd(e)}function c(u){h(),i&&i(u),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}}class uv extends Hi{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new zi,o=new Wl(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(s.withCredentials),o.load(e,function(l){let c;try{c=s.parse(l)}catch(h){if(i!==void 0)i(h);else{console.error(h);return}}c.image!==void 0?a.image=c.image:c.data!==void 0&&(a.image.width=c.width,a.image.height=c.height,a.image.data=c.data),a.wrapS=c.wrapS!==void 0?c.wrapS:Pn,a.wrapT=c.wrapT!==void 0?c.wrapT:Pn,a.magFilter=c.magFilter!==void 0?c.magFilter:gt,a.minFilter=c.minFilter!==void 0?c.minFilter:gt,a.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(a.colorSpace=c.colorSpace),c.flipY!==void 0&&(a.flipY=c.flipY),c.format!==void 0&&(a.format=c.format),c.type!==void 0&&(a.type=c.type),c.mipmaps!==void 0&&(a.mipmaps=c.mipmaps,a.minFilter=xn),c.mipmapCount===1&&(a.minFilter=gt),c.generateMipmaps!==void 0&&(a.generateMipmaps=c.generateMipmaps),a.needsUpdate=!0,t&&t(a,c)},n,i),a}}class dv extends Hi{constructor(e){super(e)}load(e,t,n,i){const s=new vt,a=new hv(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}}class xa extends ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ue(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class fv extends xa{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const no=new Ce,wh=new P,Eh=new P;class Xl{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Re(512,512),this.map=null,this.mapPass=null,this.matrix=new Ce,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Pl,this._frameExtents=new Re(1,1),this._viewportCount=1,this._viewports=[new Ke(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;wh.setFromMatrixPosition(e.matrixWorld),t.position.copy(wh),Eh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Eh),t.updateMatrixWorld(),no.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(no),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(no)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class pv extends Xl{constructor(){super(new Gt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=gs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class mv extends xa{constructor(e,t,n=0,i=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.target=new ut,this.distance=n,this.angle=i,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new pv}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Ah=new Ce,Fs=new P,io=new P;class gv extends Xl{constructor(){super(new Gt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Re(4,2),this._viewportCount=6,this._viewports=[new Ke(2,1,1,1),new Ke(0,1,1,1),new Ke(3,1,1,1),new Ke(1,1,1,1),new Ke(3,0,1,1),new Ke(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Fs.setFromMatrixPosition(e.matrixWorld),n.position.copy(Fs),io.copy(n.position),io.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(io),n.updateMatrixWorld(),i.makeTranslation(-Fs.x,-Fs.y,-Fs.z),Ah.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ah)}}class Kn extends xa{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new gv}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class _v extends Xl{constructor(){super(new ga(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class ql extends xa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.target=new ut,this.shadow=new _v}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Qs{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class vv extends Hi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=mi.get(e);if(a!==void 0){if(s.manager.itemStart(e),a.then){a.then(c=>{t&&t(c),s.manager.itemEnd(e)}).catch(c=>{i&&i(c)});return}return setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader;const l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return mi.add(e,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){i&&i(c),mi.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});mi.add(e,l),s.manager.itemStart(e)}}class xv{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Rh(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Rh();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Rh(){return performance.now()}class yv{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,s,a;switch(t){case"quaternion":i=this._slerp,s=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,s=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,s=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=s,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,s=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[s+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,s,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,s=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){const l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-s,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let s=n,a=i;s!==a;++s)t[s]=t[i+s%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,s){if(i>=.5)for(let a=0;a!==s;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){Xt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,s){const a=this._workIndex*s;Xt.multiplyQuaternionsFlat(e,a,e,t,e,n),Xt.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,s){const a=1-i;for(let o=0;o!==s;++o){const l=t+o;e[l]=e[l]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,s){for(let a=0;a!==s;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const jl="\\[\\]\\.:\\/",Mv=new RegExp("["+jl+"]","g"),Yl="[^"+jl+"]",Tv="[^"+jl.replace("\\.","")+"]",Sv=/((?:WC+[\/:])*)/.source.replace("WC",Yl),bv=/(WCOD+)?/.source.replace("WCOD",Tv),wv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Yl),Ev=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Yl),Av=new RegExp("^"+Sv+bv+wv+Ev+"$"),Rv=["material","materials","bones","map"];class Cv{constructor(e,t,n){const i=n||nt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class nt{constructor(e,t,n){this.path=t,this.parsedPath=n||nt.parseTrackName(t),this.node=nt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new nt.Composite(e,t,n):new nt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Mv,"")}static parseTrackName(e){const t=Av.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const s=n.nodeName.substring(i+1);Rv.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let a=0;a<s.length;a++){const o=s[a];if(o.name===t||o.uuid===t)return o;const l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let s=t.propertyIndex;if(e||(e=nt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const a=e[i];if(a===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}nt.Composite=Cv;nt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};nt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};nt.prototype.GetterByBindingType=[nt.prototype._getValue_direct,nt.prototype._getValue_array,nt.prototype._getValue_arrayElement,nt.prototype._getValue_toArray];nt.prototype.SetterByBindingTypeAndVersioning=[[nt.prototype._setValue_direct,nt.prototype._setValue_direct_setNeedsUpdate,nt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_array,nt.prototype._setValue_array_setNeedsUpdate,nt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_arrayElement,nt.prototype._setValue_arrayElement_setNeedsUpdate,nt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_fromArray,nt.prototype._setValue_fromArray_setNeedsUpdate,nt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Pv{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const s=t.tracks,a=s.length,o=new Array(a),l={endingStart:as,endingEnd:as};for(let c=0;c!==a;++c){const h=s[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=xu,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){const i=this._clip.duration,s=e._clip.duration,a=s/i,o=i/s;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,s=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const l=o.parameterPositions,c=o.sampleValues;return l[0]=s,l[1]=s+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const s=this._startTime;if(s!==null){const l=(e-s)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case tf:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case Al:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,s=this._loopCount;const a=n===ef;if(e===0)return s===-1?i:a&&(s&1)===1?t-i:i;if(n===vu){s===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(s===-1&&(e>=0?(s=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,s+=Math.abs(o);const l=this.repetitions-s;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){const c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=s,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(s&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=os,i.endingEnd=os):(e?i.endingStart=this.zeroSlopeAtStart?os:as:i.endingStart=aa,t?i.endingEnd=this.zeroSlopeAtEnd?os:as:i.endingEnd=aa)}_scheduleFading(e,t,n){const i=this._mixer,s=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,l=a.sampleValues;return o[0]=s,l[0]=t,o[1]=s+e,l[1]=n,this}}const Dv=new Float32Array(1);class Iv extends Bi{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,s=i.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==s;++u){const d=i[u],f=d.name;let m=h[f];if(m!==void 0)++m.referenceCount,a[u]=m;else{if(m=a[u],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,l,f));continue}const _=t&&t._propertyBindings[u].binding.parsedPath;m=new yv(nt.create(n,f,_),d.ValueTypeName,d.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,l,f),a[u]=m}o[u].resultBuffer=m.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,s=this._actionsByClip[i];this._bindAction(e,s&&s.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];s.useCount++===0&&(this._lendBinding(s),s.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.useCount===0&&(s.restoreOriginalState(),this._takeBackBinding(s))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,s=this._actionsByClip;let a=s[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,s[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const s=e._clip.uuid,a=this._actionsByClip,o=a[s],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;const u=o.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],l.length===0&&delete a[s],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.referenceCount===0&&this._removeInactiveBinding(s)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,s=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=s.length,s.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,s=n.path,a=this._bindingsByRootAndName,o=a[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[s],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new zu(new Float32Array(2),new Float32Array(2),1,Dv),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,s=t[i];e.__cacheIndex=i,t[i]=e,s.__cacheIndex=n,t[n]=s}clipAction(e,t,n){const i=t||this._root,s=i.uuid;let a=typeof e=="string"?ol.findByName(i,e):e;const o=a!==null?a.uuid:e,l=this._actionsByClip[o];let c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=Al),l!==void 0){const u=l.actionByRoot[s];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;const h=new Pv(this,a,t,n);return this._bindAction(h,c),this._addInactiveAction(h,o,s),h}existingAction(e,t){const n=t||this._root,i=n.uuid,s=typeof e=="string"?ol.findByName(n,e):e,a=s?s.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,s=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,s,a);const o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,s=i[n];if(s!==void 0){const a=s.knownActions;for(let o=0,l=a.length;o!==l;++o){const c=a[o];this._deactivateAction(c);const h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}const i=this._bindingsByRootAndName,s=i[t];if(s!==void 0)for(const a in s){const o=s[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:vl}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=vl);const Js={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Vi{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Lv=new ga(-1,1,1,-1,0,1);class Uv extends _t{constructor(){super(),this.setAttribute("position",new Ze([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ze([0,2,0,0,2,0],2))}}const Nv=new Uv;class ya{constructor(e){this._mesh=new $e(Nv,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Lv)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Vu extends Vi{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof dt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=vn.clone(e.uniforms),this.material=new dt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new ya(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Ch extends Vi{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const i=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),s.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),s.buffers.stencil.setClear(o),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(i.EQUAL,1,4294967295),s.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),s.buffers.stencil.setLocked(!0)}}class Fv extends Vi{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class kv{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new Re);this._width=n.width,this._height=n.height,t=new Qt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:kt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Vu(Js),this.copyPass.material.blending=Et,this.clock=new xv}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let i=0,s=this.passes.length;i<s;i++){const a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}Ch!==void 0&&(a instanceof Ch?n=!0:a instanceof Fv&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Re);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Ov extends Vi{constructor(e,t,n=null,i=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new ue}render(e,t,n){const i=e.autoClear;e.autoClear=!1;let s,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=i}}const Bv={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new ue(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Ms extends Vi{constructor(e,t,n,i){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=i,this.resolution=e!==void 0?new Re(e.x,e.y):new Re(256,256),this.clearColor=new ue(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Qt(s,a,{type:kt}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const d=new Qt(s,a,{type:kt});d.texture.name="UnrealBloomPass.h"+u,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const f=new Qt(s,a,{type:kt});f.texture.name="UnrealBloomPass.v"+u,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),s=Math.round(s/2),a=Math.round(a/2)}const o=Bv;this.highPassUniforms=vn.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new dt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];s=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new Re(1/s,1/a),s=Math.round(s/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=Js;this.copyUniforms=vn.clone(h.uniforms),this.blendMaterial=new dt({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:pi,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new ue,this.oldClearAlpha=1,this.basic=new Ct,this.fsQuad=new ya(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(n,i);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,i),this.renderTargetsVertical[s].setSize(n,i),this.separableBlurMaterials[s].uniforms.invSize.value=new Re(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(e,t,n,i,s){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=Ms.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Ms.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=a}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new dt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Re(.5,.5)},direction:{value:new Re(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new dt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Ms.BlurDirectionX=new Re(1,0);Ms.BlurDirectionY=new Re(0,1);const zv={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Hv extends Vi{constructor(){super();const e=zv;this.uniforms=vn.clone(e.uniforms),this.material=new Q_({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new ya(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Xe.getTransfer(this._outputColorSpace)===st&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===nu?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===iu?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===su?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===xl?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ru?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===au&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const Hr={defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new Re},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Ce},cameraProjectionMatrixInverse:{value:new Ce},cameraWorldMatrix:{value:new Ce},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new P(-1,-1,-1)},sceneBoxMax:{value:new P(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;		
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif
		
		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {  
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {   
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}
		
		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif
			
			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {
				
				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w); 
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));
				
				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));
				
				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);	

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}		

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);		
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Vr={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},so={uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function Vv(r=5){const e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=Gv(e),n=t.length,i=new Uint8Array(n*4);for(let a=0;a<n;++a){const o=t[a],l=2*Math.PI*o/n,c=new P(Math.cos(l),Math.sin(l),0).normalize();i[a*4]=(c.x*.5+.5)*255,i[a*4+1]=(c.y*.5+.5)*255,i[a*4+2]=127,i[a*4+3]=255}const s=new zi(i,e,e);return s.wrapS=Tn,s.wrapT=Tn,s.needsUpdate=!0,s}function Gv(r){const e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=e*e,n=Array(t).fill(0);let i=Math.floor(e/2),s=e-1;for(let a=1;a<=t;){if(i===-1&&s===e?(s=e-2,i=0):(s===e&&(s=0),i<0&&(i=e-1)),n[i*e+s]!==0){s-=2,i++;continue}else n[i*e+s]=a++;s++,i--}return n}const Gr={defines:{SAMPLES:16,SAMPLE_VECTORS:Gu(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new Re},cameraProjectionMatrixInverse:{value:new Ce},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;
		
		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}
		
		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1    
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1    
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);
			
			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;
		
			denoised += w * neighborColor;
			totalWeight += w;
		}
		
		void main() {
			float depth = getDepth(vUv.xy);	
			vec3 viewNormal = getViewNormal(vUv);	
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);
		
			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}
		
			if (totalWeight > 0.) { 
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Gu(r,e,t){const n=Wv(r,e,t);let i="vec3[SAMPLES](";for(let s=0;s<r;s++){const a=n[s];i+=`vec3(${a.x}, ${a.y}, ${a.z})${s<r-1?",":")"}`}return i}function Wv(r,e,t){const n=[];for(let i=0;i<r;i++){const s=2*Math.PI*e*i/r,a=Math.pow(i/(r-1),t);n.push(new P(Math.cos(s),Math.sin(s),a))}return n}class Xv{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(e,t,n){return e[0]*t+e[1]*n}dot3(e,t,n,i){return e[0]*t+e[1]*n+e[2]*i}dot4(e,t,n,i,s){return e[0]*t+e[1]*n+e[2]*i+e[3]*s}noise(e,t){let n,i,s;const a=.5*(Math.sqrt(3)-1),o=(e+t)*a,l=Math.floor(e+o),c=Math.floor(t+o),h=(3-Math.sqrt(3))/6,u=(l+c)*h,d=l-u,f=c-u,m=e-d,_=t-f;let g,p;m>_?(g=1,p=0):(g=0,p=1);const x=m-g+h,T=_-p+h,v=m-1+2*h,D=_-1+2*h,E=l&255,A=c&255,w=this.perm[E+this.perm[A]]%12,M=this.perm[E+g+this.perm[A+p]]%12,y=this.perm[E+1+this.perm[A+1]]%12;let R=.5-m*m-_*_;R<0?n=0:(R*=R,n=R*R*this.dot(this.grad3[w],m,_));let L=.5-x*x-T*T;L<0?i=0:(L*=L,i=L*L*this.dot(this.grad3[M],x,T));let I=.5-v*v-D*D;return I<0?s=0:(I*=I,s=I*I*this.dot(this.grad3[y],v,D)),70*(n+i+s)}noise3d(e,t,n){let i,s,a,o;const c=(e+t+n)*.3333333333333333,h=Math.floor(e+c),u=Math.floor(t+c),d=Math.floor(n+c),f=1/6,m=(h+u+d)*f,_=h-m,g=u-m,p=d-m,x=e-_,T=t-g,v=n-p;let D,E,A,w,M,y;x>=T?T>=v?(D=1,E=0,A=0,w=1,M=1,y=0):x>=v?(D=1,E=0,A=0,w=1,M=0,y=1):(D=0,E=0,A=1,w=1,M=0,y=1):T<v?(D=0,E=0,A=1,w=0,M=1,y=1):x<v?(D=0,E=1,A=0,w=0,M=1,y=1):(D=0,E=1,A=0,w=1,M=1,y=0);const R=x-D+f,L=T-E+f,I=v-A+f,O=x-w+2*f,V=T-M+2*f,B=v-y+2*f,Y=x-1+3*f,G=T-1+3*f,H=v-1+3*f,K=h&255,J=u&255,se=d&255,ye=this.perm[K+this.perm[J+this.perm[se]]]%12,j=this.perm[K+D+this.perm[J+E+this.perm[se+A]]]%12,te=this.perm[K+w+this.perm[J+M+this.perm[se+y]]]%12,oe=this.perm[K+1+this.perm[J+1+this.perm[se+1]]]%12;let ie=.6-x*x-T*T-v*v;ie<0?i=0:(ie*=ie,i=ie*ie*this.dot3(this.grad3[ye],x,T,v));let he=.6-R*R-L*L-I*I;he<0?s=0:(he*=he,s=he*he*this.dot3(this.grad3[j],R,L,I));let de=.6-O*O-V*V-B*B;de<0?a=0:(de*=de,a=de*de*this.dot3(this.grad3[te],O,V,B));let _e=.6-Y*Y-G*G-H*H;return _e<0?o=0:(_e*=_e,o=_e*_e*this.dot3(this.grad3[oe],Y,G,H)),32*(i+s+a+o)}noise4d(e,t,n,i){const s=this.grad4,a=this.simplex,o=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20;let h,u,d,f,m;const _=(e+t+n+i)*l,g=Math.floor(e+_),p=Math.floor(t+_),x=Math.floor(n+_),T=Math.floor(i+_),v=(g+p+x+T)*c,D=g-v,E=p-v,A=x-v,w=T-v,M=e-D,y=t-E,R=n-A,L=i-w,I=M>y?32:0,O=M>R?16:0,V=y>R?8:0,B=M>L?4:0,Y=y>L?2:0,G=R>L?1:0,H=I+O+V+B+Y+G,K=a[H][0]>=3?1:0,J=a[H][1]>=3?1:0,se=a[H][2]>=3?1:0,ye=a[H][3]>=3?1:0,j=a[H][0]>=2?1:0,te=a[H][1]>=2?1:0,oe=a[H][2]>=2?1:0,ie=a[H][3]>=2?1:0,he=a[H][0]>=1?1:0,de=a[H][1]>=1?1:0,_e=a[H][2]>=1?1:0,Qe=a[H][3]>=1?1:0,ke=M-K+c,Je=y-J+c,N=R-se+c,pt=L-ye+c,Fe=M-j+2*c,Le=y-te+2*c,Ee=R-oe+2*c,qe=L-ie+2*c,Me=M-he+3*c,C=y-de+3*c,S=R-_e+3*c,z=L-Qe+3*c,Z=M-1+4*c,ee=y-1+4*c,$=R-1+4*c,Te=L-1+4*c,le=g&255,fe=p&255,Ve=x&255,ne=T&255,ve=o[le+o[fe+o[Ve+o[ne]]]]%32,Pe=o[le+K+o[fe+J+o[Ve+se+o[ne+ye]]]]%32,De=o[le+j+o[fe+te+o[Ve+oe+o[ne+ie]]]]%32,xe=o[le+he+o[fe+de+o[Ve+_e+o[ne+Qe]]]]%32,We=o[le+1+o[fe+1+o[Ve+1+o[ne+1]]]]%32;let Ie=.6-M*M-y*y-R*R-L*L;Ie<0?h=0:(Ie*=Ie,h=Ie*Ie*this.dot4(s[ve],M,y,R,L));let je=.6-ke*ke-Je*Je-N*N-pt*pt;je<0?u=0:(je*=je,u=je*je*this.dot4(s[Pe],ke,Je,N,pt));let U=.6-Fe*Fe-Le*Le-Ee*Ee-qe*qe;U<0?d=0:(U*=U,d=U*U*this.dot4(s[De],Fe,Le,Ee,qe));let ae=.6-Me*Me-C*C-S*S-z*z;ae<0?f=0:(ae*=ae,f=ae*ae*this.dot4(s[xe],Me,C,S,z));let q=.6-Z*Z-ee*ee-$*$-Te*Te;return q<0?m=0:(q*=q,m=q*q*this.dot4(s[We],Z,ee,$,Te)),27*(h+u+d+f+m)}}class En extends Vi{constructor(e,t,n,i,s,a,o){super(),this.width=n!==void 0?n:512,this.height=i!==void 0?i:512,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=new Map,this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Vv(),this.pdNoiseTexture=this.generateNoise(),this.gtaoRenderTarget=new Qt(this.width,this.height,{type:kt}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new dt({defines:Object.assign({},Hr.defines),uniforms:vn.clone(Hr.uniforms),vertexShader:Hr.vertexShader,fragmentShader:Hr.fragmentShader,blending:Et,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new J_,this.normalMaterial.blending=Et,this.pdMaterial=new dt({defines:Object.assign({},Gr.defines),uniforms:vn.clone(Gr.uniforms),vertexShader:Gr.vertexShader,fragmentShader:Gr.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new dt({defines:Object.assign({},Vr.defines),uniforms:vn.clone(Vr.uniforms),vertexShader:Vr.vertexShader,fragmentShader:Vr.fragmentShader,blending:Et}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new dt({uniforms:vn.clone(Js.uniforms),vertexShader:Js.vertexShader,fragmentShader:Js.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:vo,blendDst:Vs,blendEquation:mn,blendSrcAlpha:_o,blendDstAlpha:Vs,blendEquationAlpha:mn}),this.blendMaterial=new dt({uniforms:vn.clone(so.uniforms),vertexShader:so.vertexShader,fragmentShader:so.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:eu,blendSrc:vo,blendDst:Vs,blendEquation:mn,blendSrcAlpha:_o,blendDstAlpha:Vs,blendEquationAlpha:mn}),this.fsQuad=new ya(null),this.originalClearColor=new ue,this.setGBuffer(s?s.depthTexture:void 0,s?s.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),o!==void 0&&this.updatePdMaterial(o)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new Il,this.depthTexture.format=Oi,this.depthTexture.type=ki,this.normalRenderTarget=new Qt(this.width,this.height,{minFilter:Pt,magFilter:Pt,type:kt,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);const n=this.normalTexture?1:0,i=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Gu(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,n){switch(this._renderGBuffer&&(this.overrideVisibility(),this.renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this.renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case En.OUTPUT.Off:break;case En.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Et,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case En.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=Et,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case En.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=Et,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case En.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case En.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=Et,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case En.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Et,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}renderPass(e,t,n,i,s){e.getClearColor(this.originalClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,i!=null&&(e.setClearColor(i),e.setClearAlpha(s||0),e.clear()),this.fsQuad.material=t,this.fsQuad.render(e),e.autoClear=o,e.setClearColor(this.originalClearColor),e.setClearAlpha(a)}renderOverride(e,t,n,i,s){e.getClearColor(this.originalClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,i=t.clearColor||i,s=t.clearAlpha||s,i!=null&&(e.setClearColor(i),e.setClearAlpha(s||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this.originalClearColor),e.setClearAlpha(a)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}overrideVisibility(){const e=this.scene,t=this._visibilityCache;e.traverse(function(n){t.set(n,n.visible),(n.isPoints||n.isLine)&&(n.visible=!1)})}restoreVisibility(){const e=this.scene,t=this._visibilityCache;e.traverse(function(n){const i=t.get(n);n.visible=i}),t.clear()}generateNoise(e=64){const t=new Xv,n=e*e*4,i=new Uint8Array(n);for(let a=0;a<e;a++)for(let o=0;o<e;o++){const l=a,c=o;i[(a*e+o)*4]=(t.noise(l,c)*.5+.5)*255,i[(a*e+o)*4+1]=(t.noise(l+e,c)*.5+.5)*255,i[(a*e+o)*4+2]=(t.noise(l,c+e)*.5+.5)*255,i[(a*e+o)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}const s=new zi(i,e,e,Wt,In);return s.wrapS=Tn,s.wrapT=Tn,s.needsUpdate=!0,s}}En.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};class qv extends uv{constructor(e){super(e),this.type=kt}parse(e){const a=function(w,M){switch(w){case 1:throw new Error("THREE.RGBELoader: Read Error: "+(M||""));case 2:throw new Error("THREE.RGBELoader: Write Error: "+(M||""));case 3:throw new Error("THREE.RGBELoader: Bad File Format: "+(M||""));default:case 4:throw new Error("THREE.RGBELoader: Memory Error: "+(M||""))}},h=`
`,u=function(w,M,y){M=M||1024;let L=w.pos,I=-1,O=0,V="",B=String.fromCharCode.apply(null,new Uint16Array(w.subarray(L,L+128)));for(;0>(I=B.indexOf(h))&&O<M&&L<w.byteLength;)V+=B,O+=B.length,L+=128,B+=String.fromCharCode.apply(null,new Uint16Array(w.subarray(L,L+128)));return-1<I?(w.pos+=O+I+1,V+B.slice(0,I)):!1},d=function(w){const M=/^#\?(\S+)/,y=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,R=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,L=/^\s*FORMAT=(\S+)\s*$/,I=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,O={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0};let V,B;for((w.pos>=w.byteLength||!(V=u(w)))&&a(1,"no header found"),(B=V.match(M))||a(3,"bad initial token"),O.valid|=1,O.programtype=B[1],O.string+=V+`
`;V=u(w),V!==!1;){if(O.string+=V+`
`,V.charAt(0)==="#"){O.comments+=V+`
`;continue}if((B=V.match(y))&&(O.gamma=parseFloat(B[1])),(B=V.match(R))&&(O.exposure=parseFloat(B[1])),(B=V.match(L))&&(O.valid|=2,O.format=B[1]),(B=V.match(I))&&(O.valid|=4,O.height=parseInt(B[1],10),O.width=parseInt(B[2],10)),O.valid&2&&O.valid&4)break}return O.valid&2||a(3,"missing format specifier"),O.valid&4||a(3,"missing image size specifier"),O},f=function(w,M,y){const R=M;if(R<8||R>32767||w[0]!==2||w[1]!==2||w[2]&128)return new Uint8Array(w);R!==(w[2]<<8|w[3])&&a(3,"wrong scanline width");const L=new Uint8Array(4*M*y);L.length||a(4,"unable to allocate buffer space");let I=0,O=0;const V=4*R,B=new Uint8Array(4),Y=new Uint8Array(V);let G=y;for(;G>0&&O<w.byteLength;){O+4>w.byteLength&&a(1),B[0]=w[O++],B[1]=w[O++],B[2]=w[O++],B[3]=w[O++],(B[0]!=2||B[1]!=2||(B[2]<<8|B[3])!=R)&&a(3,"bad rgbe scanline format");let H=0,K;for(;H<V&&O<w.byteLength;){K=w[O++];const se=K>128;if(se&&(K-=128),(K===0||H+K>V)&&a(3,"bad scanline data"),se){const ye=w[O++];for(let j=0;j<K;j++)Y[H++]=ye}else Y.set(w.subarray(O,O+K),H),H+=K,O+=K}const J=R;for(let se=0;se<J;se++){let ye=0;L[I]=Y[se+ye],ye+=R,L[I+1]=Y[se+ye],ye+=R,L[I+2]=Y[se+ye],ye+=R,L[I+3]=Y[se+ye],I+=4}G--}return L},m=function(w,M,y,R){const L=w[M+3],I=Math.pow(2,L-128)/255;y[R+0]=w[M+0]*I,y[R+1]=w[M+1]*I,y[R+2]=w[M+2]*I,y[R+3]=1},_=function(w,M,y,R){const L=w[M+3],I=Math.pow(2,L-128)/255;y[R+0]=Mr.toHalfFloat(Math.min(w[M+0]*I,65504)),y[R+1]=Mr.toHalfFloat(Math.min(w[M+1]*I,65504)),y[R+2]=Mr.toHalfFloat(Math.min(w[M+2]*I,65504)),y[R+3]=Mr.toHalfFloat(1)},g=new Uint8Array(e);g.pos=0;const p=d(g),x=p.width,T=p.height,v=f(g.subarray(g.pos),x,T);let D,E,A;switch(this.type){case Kt:A=v.length/4;const w=new Float32Array(A*4);for(let y=0;y<A;y++)m(v,y*4,w,y*4);D=w,E=Kt;break;case kt:A=v.length/4;const M=new Uint16Array(A*4);for(let y=0;y<A;y++)_(v,y*4,M,y*4);D=M,E=kt;break;default:throw new Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:x,height:T,data:D,header:p.string,gamma:p.gamma,exposure:p.exposure,type:E}}setDataType(e){return this.type=e,this}load(e,t,n,i){function s(a,o){switch(a.type){case Kt:case kt:a.colorSpace=Bt,a.minFilter=gt,a.magFilter=gt,a.generateMipmaps=!1,a.flipY=!0;break}t&&t(a,o)}return super.load(e,s,n,i)}}function Ph(r,e){if(e===nf)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),r;if(e===Jo||e===yu){let t=r.getIndex();if(t===null){const a=[],o=r.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);r.setIndex(a),t=r.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),r}const n=t.count-2,i=[];if(e===Jo)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=r.clone();return s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),r}class jv extends Hi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Qv(t)}),this.register(function(t){return new Jv(t)}),this.register(function(t){return new lx(t)}),this.register(function(t){return new cx(t)}),this.register(function(t){return new hx(t)}),this.register(function(t){return new tx(t)}),this.register(function(t){return new nx(t)}),this.register(function(t){return new ix(t)}),this.register(function(t){return new sx(t)}),this.register(function(t){return new Zv(t)}),this.register(function(t){return new rx(t)}),this.register(function(t){return new ex(t)}),this.register(function(t){return new ox(t)}),this.register(function(t){return new ax(t)}),this.register(function(t){return new $v(t)}),this.register(function(t){return new ux(t)}),this.register(function(t){return new dx(t)})}load(e,t,n,i){const s=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const c=Qs.extractUrlBase(e);a=Qs.resolveURL(c,this.path)}else a=Qs.extractUrlBase(e);this.manager.itemStart(e);const o=function(c){i?i(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new Wl(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,a,function(h){t(h),s.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let s;const a={},o={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Wu){try{a[Ge.KHR_BINARY_GLTF]=new fx(e)}catch(u){i&&i(u);return}s=JSON.parse(a[Ge.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new Ex(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(s.extensionsUsed)for(let h=0;h<s.extensionsUsed.length;++h){const u=s.extensionsUsed[h],d=s.extensionsRequired||[];switch(u){case Ge.KHR_MATERIALS_UNLIT:a[u]=new Kv;break;case Ge.KHR_DRACO_MESH_COMPRESSION:a[u]=new px(s,this.dracoLoader);break;case Ge.KHR_TEXTURE_TRANSFORM:a[u]=new mx;break;case Ge.KHR_MESH_QUANTIZATION:a[u]=new gx;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function Yv(){let r={};return{get:function(e){return r[e]},add:function(e,t){r[e]=t},remove:function(e){delete r[e]},removeAll:function(){r={}}}}const Ge={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class $v{constructor(e){this.parser=e,this.name=Ge.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const s=t.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e];let c;const h=new ue(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Bt);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new ql(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Kn(h),c.distance=u;break;case"spot":c=new mv(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,Yn(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,s=n.json.nodes[e],o=(s.extensions&&s.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}}class Kv{constructor(){this.name=Ge.KHR_MATERIALS_UNLIT}getMaterialType(){return Ct}extendParams(e,t,n){const i=[];e.color=new ue(1,1,1),e.opacity=1;const s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const a=s.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Bt),e.opacity=a[3]}s.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",s.baseColorTexture,ht))}return Promise.all(i)}}class Zv{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}}class Qv{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Re(o,o)}return Promise.all(s)}}class Jv{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class ex{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(s)}}class tx{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[];t.sheenColor=new ue(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Bt)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,ht)),a.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(s)}}class nx{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(s)}}class ix{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new ue().setRGB(o[0],o[1],o[2],Bt),Promise.all(s)}}class sx{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class rx{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new ue().setRGB(o[0],o[1],o[2],Bt),a.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,ht)),Promise.all(s)}}class ax{constructor(e){this.parser=e,this.name=Ge.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(s)}}class ox{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Fn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(s)}}class lx{constructor(e){this.parser=e,this.name=Ge.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const s=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,a)}}class cx{constructor(e){this.parser=e,this.name=Ge.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,a.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class hx{constructor(e){this.parser=e,this.name=Ge.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,a.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class ux{constructor(e){this.name=Ge.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(o){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):a.ready.then(function(){const f=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}}class dx{constructor(e){this.name=Ge.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==ln.TRIANGLES&&c.mode!==ln.TRIANGLE_STRIP&&c.mode!==ln.TRIANGLE_FAN&&c.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],l={};for(const c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{const h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,f=[];for(const m of u){const _=new Ce,g=new P,p=new Xt,x=new P(1,1,1),T=new Zs(m.geometry,m.material,d);for(let v=0;v<d;v++)l.TRANSLATION&&g.fromBufferAttribute(l.TRANSLATION,v),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,v),l.SCALE&&x.fromBufferAttribute(l.SCALE,v),T.setMatrixAt(v,_.compose(g,p,x));for(const v in l)if(v==="_COLOR_0"){const D=l[v];T.instanceColor=new rl(D.array,D.itemSize,D.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&m.geometry.setAttribute(v,l[v]);ut.prototype.copy.call(T,m),this.parser.assignFinalMaterial(T),f.push(T)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}}const Wu="glTF",ks=12,Dh={JSON:1313821514,BIN:5130562};class fx{constructor(e){this.name=Ge.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,ks),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Wu)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-ks,s=new DataView(e,ks);let a=0;for(;a<i;){const o=s.getUint32(a,!0);a+=4;const l=s.getUint32(a,!0);if(a+=4,l===Dh.JSON){const c=new Uint8Array(e,ks+a,o);this.content=n.decode(c)}else if(l===Dh.BIN){const c=ks+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class px{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Ge.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(const h in a){const u=ll[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=ll[h]||h.toLowerCase();if(a[h]!==void 0){const d=n.accessors[e.attributes[h]],f=ds[d.componentType];c[u]=f.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",s).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(const m in f.attributes){const _=f.attributes[m],g=l[m];g!==void 0&&(_.normalized=g)}u(f)},o,c,Bt,d)})})}}class mx{constructor(){this.name=Ge.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class gx{constructor(){this.name=Ge.KHR_MESH_QUANTIZATION}}class Xu extends rr{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[s+a];return t}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,m=e*c,_=m-c,g=-2*f+3*d,p=f-d,x=1-g,T=p-d+u;for(let v=0;v!==o;v++){const D=a[_+v+o],E=a[_+v+l]*h,A=a[m+v+o],w=a[m+v]*h;s[v]=x*D+T*E+g*A+p*w}return s}}const _x=new Xt;class vx extends Xu{interpolate_(e,t,n,i){const s=super.interpolate_(e,t,n,i);return _x.fromArray(s).normalize().toArray(s),s}}const ln={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},ds={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Ih={9728:Pt,9729:gt,9984:lu,9985:Yr,9986:Gs,9987:xn},Lh={33071:Pn,33648:ra,10497:Tn},ro={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},ll={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ui={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},xx={CUBICSPLINE:void 0,LINEAR:ir,STEP:nr},ao={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function yx(r){return r.DefaultMaterial===void 0&&(r.DefaultMaterial=new nn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ei})),r.DefaultMaterial}function Ri(r,e,t){for(const n in t.extensions)r[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Yn(r,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(r.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Mx(r,e,t){let n=!1,i=!1,s=!1;for(let c=0,h=e.length;c<h;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(s=!0),n&&i&&s)break}if(!n&&!i&&!s)return Promise.resolve(r);const a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){const u=e[c];if(n){const d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):r.attributes.position;a.push(d)}if(i){const d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):r.attributes.normal;o.push(d)}if(s){const d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):r.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){const h=c[0],u=c[1],d=c[2];return n&&(r.morphAttributes.position=h),i&&(r.morphAttributes.normal=u),s&&(r.morphAttributes.color=d),r.morphTargetsRelative=!0,r})}function Tx(r,e){if(r.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)r.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(r.morphTargetInfluences.length===t.length){r.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)r.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Sx(r){let e;const t=r.extensions&&r.extensions[Ge.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+oo(t.attributes):e=r.indices+":"+oo(r.attributes)+":"+r.mode,r.targets!==void 0)for(let n=0,i=r.targets.length;n<i;n++)e+=":"+oo(r.targets[n]);return e}function oo(r){let e="";const t=Object.keys(r).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+r[t[n]]+";";return e}function cl(r){switch(r){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function bx(r){return r.search(/\.jpe?g($|\?)/i)>0||r.search(/^data\:image\/jpeg/)===0?"image/jpeg":r.search(/\.webp($|\?)/i)>0||r.search(/^data\:image\/webp/)===0?"image/webp":r.search(/\.ktx2($|\?)/i)>0||r.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const wx=new Ce;class Ex{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Yv,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,s=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const l=o.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,s=o.indexOf("Firefox")>-1,a=s?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||s&&a<98?this.textureLoader=new dv(this.options.manager):this.textureLoader=new vv(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Wl(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return Ri(s,o,i),Yn(o,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(const l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){const a=t[i].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let i=0,s=e.length;i<s;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),s=(a,o)=>{const l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(const[c,h]of a.children.entries())s(h,o.children[c])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const s=e(t[i]);s&&n.push(s)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Ge.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(s,a){n.load(Qs.resolveURL(t.uri,i.path),s,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=ro[i.type],o=ds[i.componentType],l=i.normalized===!0,c=new o(i.count*a);return Promise.resolve(new xt(c,a,l))}const s=[];return i.bufferView!==void 0?s.push(this.getDependency("bufferView",i.bufferView)):s.push(null),i.sparse!==void 0&&(s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(s).then(function(a){const o=a[0],l=ro[i.type],c=ds[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,m=i.normalized===!0;let _,g;if(f&&f!==u){const p=Math.floor(d/f),x="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let T=t.cache.get(x);T||(_=new c(o,p*f,i.count*f/h),T=new X_(_,f/h),t.cache.add(x,T)),g=new Ul(T,l,d%f/h,m)}else o===null?_=new c(i.count*l):_=new c(o,d,i.count*l),g=new xt(_,l,m);if(i.sparse!==void 0){const p=ro.SCALAR,x=ds[i.sparse.indices.componentType],T=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,D=new x(a[1],T,i.sparse.count*p),E=new c(a[2],v,i.sparse.count*l);o!==null&&(g=new xt(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let A=0,w=D.length;A<w;A++){const M=D[A];if(g.setX(M,E[A*l]),l>=2&&g.setY(M,E[A*l+1]),l>=3&&g.setZ(M,E[A*l+2]),l>=4&&g.setW(M,E[A*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=m}return g})}loadTexture(e){const t=this.json,n=this.options,s=t.textures[e].source,a=t.images[s];let o=this.textureLoader;if(a.uri){const l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,s,o)}loadTextureImage(e,t,n){const i=this,s=this.json,a=s.textures[e],o=s.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const d=(s.samplers||{})[a.sampler]||{};return h.magFilter=Ih[d.magFilter]||gt,h.minFilter=Ih[d.minFilter]||xn,h.wrapS=Lh[d.wrapS]||Tn,h.wrapT=Lh[d.wrapT]||Tn,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Pt&&h.minFilter!==gt,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const a=i.images[e],o=self.URL||self.webkitURL;let l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(u){c=!0;const d=new Blob([u],{type:a.mimeType});return l=o.createObjectURL(d),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(u){return new Promise(function(d,f){let m=d;t.isImageBitmapLoader===!0&&(m=function(_){const g=new vt(_);g.needsUpdate=!0,d(g)}),t.load(Qs.resolveURL(u,s.path),m,void 0,f)})}).then(function(u){return c===!0&&o.revokeObjectURL(l),Yn(u,a),u.userData.mimeType=a.mimeType||bx(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const s=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),s.extensions[Ge.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[Ge.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const l=s.associations.get(a);a=s.extensions[Ge.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),s.associations.set(a,l)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new kl,Mn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new Ou,Mn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(i||s||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),s&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),s&&(l.vertexColors=!0),a&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return nn}loadMaterial(e){const t=this,n=this.json,i=this.extensions,s=n.materials[e];let a;const o={},l=s.extensions||{},c=[];if(l[Ge.KHR_MATERIALS_UNLIT]){const u=i[Ge.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,s,t))}else{const u=s.pbrMetallicRoughness||{};if(o.color=new ue(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],Bt),o.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,ht)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}s.doubleSided===!0&&(o.side=Rt);const h=s.alphaMode||ao.OPAQUE;if(h===ao.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===ao.MASK&&(o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&a!==Ct&&(c.push(t.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new Re(1,1),s.normalTexture.scale!==void 0)){const u=s.normalTexture.scale;o.normalScale.set(u,u)}if(s.occlusionTexture!==void 0&&a!==Ct&&(c.push(t.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&a!==Ct){const u=s.emissiveFactor;o.emissive=new ue().setRGB(u[0],u[1],u[2],Bt)}return s.emissiveTexture!==void 0&&a!==Ct&&c.push(t.assignTexture(o,"emissiveMap",s.emissiveTexture,ht)),Promise.all(c).then(function(){const u=new a(o);return s.name&&(u.name=s.name),Yn(u,s),t.associations.set(u,{materials:e}),s.extensions&&Ri(i,u,s),u})}createUniqueName(e){const t=nt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function s(o){return n[Ge.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return Uh(l,o,t)})}const a=[];for(let o=0,l=e.length;o<l;o++){const c=e[o],h=Sx(c),u=i[h];if(u)a.push(u.promise);else{let d;c.extensions&&c.extensions[Ge.KHR_DRACO_MESH_COMPRESSION]?d=s(c):d=Uh(new _t,c,t),i[h]={primitive:c,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,s=n.meshes[e],a=s.primitives,o=[];for(let l=0,c=a.length;l<c;l++){const h=a[l].material===void 0?yx(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let f=0,m=h.length;f<m;f++){const _=h[f],g=a[f];let p;const x=c[f];if(g.mode===ln.TRIANGLES||g.mode===ln.TRIANGLE_STRIP||g.mode===ln.TRIANGLE_FAN||g.mode===void 0)p=s.isSkinnedMesh===!0?new j_(_,x):new $e(_,x),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),g.mode===ln.TRIANGLE_STRIP?p.geometry=Ph(p.geometry,yu):g.mode===ln.TRIANGLE_FAN&&(p.geometry=Ph(p.geometry,Jo));else if(g.mode===ln.LINES)p=new K_(_,x);else if(g.mode===ln.LINE_STRIP)p=new Fl(_,x);else if(g.mode===ln.LINE_LOOP)p=new Z_(_,x);else if(g.mode===ln.POINTS)p=new Ol(_,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(p.geometry.morphAttributes).length>0&&Tx(p,s),p.name=t.createUniqueName(s.name||"mesh_"+e),Yn(p,s),g.extensions&&Ri(i,p,g),t.assignFinalMaterial(p),u.push(p)}for(let f=0,m=u.length;f<m;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return s.extensions&&Ri(i,u[0],s),u[0];const d=new Nt;s.extensions&&Ri(i,d,s),t.associations.set(d,{meshes:e});for(let f=0,m=u.length;f<m;f++)d.add(u[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Gt(tl.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new ga(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Yn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const s=i.pop(),a=i,o=[],l=[];for(let c=0,h=a.length;c<h;c++){const u=a[c];if(u){o.push(u);const d=new Ce;s!==null&&d.fromArray(s.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Nl(o,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){const f=i.channels[u],m=i.samplers[f.sampler],_=f.target,g=_.node,p=i.parameters!==void 0?i.parameters[m.input]:m.input,x=i.parameters!==void 0?i.parameters[m.output]:m.output;_.node!==void 0&&(a.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",x)),c.push(m),h.push(_))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){const d=u[0],f=u[1],m=u[2],_=u[3],g=u[4],p=[];for(let x=0,T=d.length;x<T;x++){const v=d[x],D=f[x],E=m[x],A=_[x],w=g[x];if(v===void 0)continue;v.updateMatrix&&v.updateMatrix();const M=n._createAnimationTracks(v,D,E,A,w);if(M)for(let y=0;y<M.length;y++)p.push(M[y])}return new ol(s,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(s){const a=n._getNodeRef(n.meshCache,i.mesh,s);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=i.weights.length;l<c;l++)o.morphTargetInfluences[l]=i.weights[l]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),a=[],o=i.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(a),l]).then(function(c){const h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,wx)});for(let f=0,m=u.length;f<m;f++)h.add(u[f]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const s=t.nodes[e],a=s.name?i.createUniqueName(s.name):"",o=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),s.camera!==void 0&&o.push(i.getDependency("camera",s.camera).then(function(c){return i._getNodeRef(i.cameraCache,s.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(s.isBone===!0?h=new ku:c.length>1?h=new Nt:c.length===1?h=c[0]:h=new ut,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(s.name&&(h.userData.name=s.name,h.name=a),Yn(h,s),s.extensions&&Ri(n,h,s),s.matrix!==void 0){const u=new Ce;u.fromArray(s.matrix),h.applyMatrix4(u)}else s.translation!==void 0&&h.position.fromArray(s.translation),s.rotation!==void 0&&h.quaternion.fromArray(s.rotation),s.scale!==void 0&&h.scale.fromArray(s.scale);return i.associations.has(h)||i.associations.set(h,{}),i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,s=new Nt;n.name&&(s.name=i.createUniqueName(n.name)),Yn(s,n),n.extensions&&Ri(t,s,n);const a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(i.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++)s.add(l[h]);const c=h=>{const u=new Map;for(const[d,f]of i.associations)(d instanceof Mn||d instanceof vt)&&u.set(d,f);return h.traverse(d=>{const f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=c(s),s})}_createAnimationTracks(e,t,n,i,s){const a=[],o=e.name?e.name:e.uuid,l=[];ui[s.path]===ui.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(o);let c;switch(ui[s.path]){case ui.weights:c=vs;break;case ui.rotation:c=xs;break;case ui.position:case ui.scale:c=ys;break;default:switch(n.itemSize){case 1:c=vs;break;case 2:case 3:default:c=ys;break}break}const h=i.interpolation!==void 0?xx[i.interpolation]:ir,u=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){const m=new c(l[d]+"."+ui[s.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(m),a.push(m)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=cl(t.constructor),i=new Float32Array(t.length);for(let s=0,a=t.length;s<a;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof xs?vx:Xu;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Ax(r,e,t){const n=e.attributes,i=new Un;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(i.set(new P(l[0],l[1],l[2]),new P(c[0],c[1],c[2])),o.normalized){const h=cl(ds[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=e.targets;if(s!==void 0){const o=new P,l=new P;for(let c=0,h=s.length;c<h;c++){const u=s[c];if(u.POSITION!==void 0){const d=t.json.accessors[u.POSITION],f=d.min,m=d.max;if(f!==void 0&&m!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(m[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(m[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(m[2]))),d.normalized){const _=cl(ds[d.componentType]);l.multiplyScalar(_)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}r.boundingBox=i;const a=new Nn;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,r.boundingSphere=a}function Uh(r,e,t){const n=e.attributes,i=[];function s(a,o){return t.getDependency("accessor",a).then(function(l){r.setAttribute(o,l)})}for(const a in n){const o=ll[a]||a.toLowerCase();o in r.attributes||i.push(s(n[a],o))}if(e.indices!==void 0&&!r.index){const a=t.getDependency("accessor",e.indices).then(function(o){r.setIndex(o)});i.push(a)}return Xe.workingColorSpace!==Bt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Xe.workingColorSpace}" not supported.`),Yn(r,e),Ax(r,e,t),Promise.all(i).then(function(){return e.targets!==void 0?Mx(r,e.targets,t):r})}function Rx(r){const e=new Map,t=new Map,n=r.clone();return qu(r,n,function(i,s){e.set(s,i),t.set(i,s)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const s=i,a=e.get(i),o=a.skeleton.bones;s.skeleton=a.skeleton.clone(),s.bindMatrix.copy(a.bindMatrix),s.skeleton.bones=o.map(function(l){return t.get(l)}),s.bind(s.skeleton,s.bindMatrix)}),n}function qu(r,e,t){t(r,e);for(let n=0;n<r.children.length;n++)qu(r.children[n],e.children[n],t)}const Cx=new jv,lo=new Map,Px="./models/";let hl=null,Nh=0,Fh=0;function Dx(r){hl=r}function $t(r){if(!lo.has(r)){Nh++;const e=Cx.loadAsync(Px+r).then(t=>{t.scene.traverse(i=>{if(i.isMesh){i.castShadow=!0,i.receiveShadow=!0;const s=Array.isArray(i.material)?i.material:[i.material];for(const a of s)a.map&&(a.map.anisotropy=4,a.map.colorSpace=ht),a.roughness!==void 0&&(a.roughness=Math.max(.55,a.roughness),a.metalness=Math.min(a.metalness,.1))}});const n=new Un().setFromObject(t.scene);return t.box=n,t}).finally(()=>{Fh++,hl&&hl(Fh,Nh)});lo.set(r,e)}return lo.get(r)}const Ix={andrew:"Warrior",marco:"Wizard",teresa:"Cleric",rico:"Ranger",andy:"Monk"},Lx={andrew:.46,marco:.46,teresa:.46,rico:.5,andy:.54},Ux={shop:["Rogue","#ffd8a0",.44],elder:["Wizard","#f0f0ff",.44],kid:["Rogue","#ffa0c0",.32],guard:["Warrior","#ff9a8a",.46],inn:["Cleric","#ffe0b0",.44],smith:["Monk","#c8a080",.5],trader:["Ranger","#a0d0ff",.44],sage:["Wizard","#c0ffd0",.46],kid2:["Cleric","#ffd0f0",.32]},Nx=r=>`mon_${r.model}.glb`,kh=r=>`hero_${r}.glb`;function Wr(r,e,t){const n=Rx(r.scene);if(t){const c=new ue(t);n.traverse(h=>{if(!h.isMesh)return;const u=d=>{const f=d.clone();return f.color=f.color.clone().multiply(c),f};h.material=Array.isArray(h.material)?h.material.map(u):u(h.material),h.userData.ownMat=!0})}const i=r.box,s=e/Math.max(.01,i.max.y-i.min.y);n.scale.setScalar(s),n.position.y=-i.min.y*s;const a=new Nt,o=new Nt;o.add(n),a.add(o);const l=r.animations.length?new Iv(n):null;return{root:a,pivot:o,inst:n,mixer:l,clips:r.animations,state:"",cur:null,h:e}}function ta(r,e){const t=e.toLowerCase();for(const n of r.clips){const i=n.name.toLowerCase();if(i.endsWith("|"+t)||i.endsWith("_"+t)||i===t)return n}for(const n of r.clips)if(n.name.toLowerCase().includes(t))return n;return null}function ju(r,e,t,n){const i=r.mixer.clipAction(e);return i.reset(),i.setLoop(t?xu:vu,t?1/0:1),i.clampWhenFinished=!t,i.enabled=!0,i.setEffectiveWeight(1),r.cur&&r.cur!==i&&i.crossFadeFrom(r.cur,n,!1),i.play(),r.cur=i,i}function bn(r,e){if(!r.mixer||r.state===e)return;const t=ta(r,e)||ta(r,"idle")||ta(r,"flying");t&&(ju(r,t,!0,.15),r.state=e)}function on(r,e,t="idle"){if(!r.mixer)return!1;let n=null;for(const i of[].concat(e))if(n=ta(r,i),n)break;return n?(ju(r,n,!1,.08),r.state="once",r.onFin&&r.mixer.removeEventListener("finished",r.onFin),r.onFin=i=>{i.action===r.cur&&(r.mixer.removeEventListener("finished",r.onFin),r.onFin=null,t&&(r.state="",bn(r,t)))},r.mixer.addEventListener("finished",r.onFin),!0):!1}function qs(r,e,t){let n=r*374761393+e*668265263+t*982451653|0;return n=Math.imul(n^n>>>13,1274126177),((n^n>>>16)>>>0)/4294967296}function Fx(r,e,t,n){const i=Math.floor(r),s=Math.floor(e),a=r-i,o=e-s,l=a*a*(3-2*a),c=o*o*(3-2*o),h=_=>(_%t+t)%t,u=qs(h(i),h(s),n),d=qs(h(i+1),h(s),n),f=qs(h(i),h(s+1),n),m=qs(h(i+1),h(s+1),n);return u+(d-u)*l+(f-u)*c+(u-d-f+m)*l*c}function di(r,e,t,n,i=5){let s=0,a=.5,o=1,l=0;for(let c=0;c<i;c++)s+=Fx(r*o,e*o,t*o,n+c)*a,l+=a,a*=.5,o*=2;return s/l}function Xr(r,e,t){const n=new Float32Array(r*r);for(let l=0;l<r;l++)for(let c=0;c<r;c++)n[l*r+c]=e(c/r,l/r);const i=new Uint8Array(r*r*4),s=new Uint8Array(r*r*4),a=(l,c)=>n[(c+r)%r*r+(l+r)%r];for(let l=0;l<r;l++)for(let c=0;c<r;c++){const h=(l*r+c)*4,u=a(c,l),d=t(u,c/r,l/r);i[h]=i[h+1]=i[h+2]=Math.max(0,Math.min(255,d*255)),i[h+3]=255;const f=(a(c+1,l)-a(c-1,l))*r*.012,m=(a(c,l+1)-a(c,l-1))*r*.012,_=Math.hypot(f,m,1);s[h]=(-f/_*.5+.5)*255,s[h+1]=(m/_*.5+.5)*255,s[h+2]=(1/_*.5+.5)*255,s[h+3]=255}const o=(l,c)=>{const h=new zi(l,r,r,Wt);return h.wrapS=h.wrapT=Tn,h.magFilter=gt,h.minFilter=xn,h.generateMipmaps=!0,h.anisotropy=8,c&&(h.colorSpace=ht),h.needsUpdate=!0,h};return{map:o(i,!0),normal:o(s,!1)}}const sn={};function Yu(r){if(sn[r])return sn[r];const e=256;let t;return r==="tile"?t=Xr(e,(n,i)=>{const s=n*2%1,a=i*2%1,o=Math.min(s,1-s,a,1-a);return Math.min(1,o/.04)*.6+di(n*8,i*8,8,3)*.4},(n,i,s)=>.62+n*.38+(qs(Math.floor(i*2),Math.floor(s*2),9)-.5)*.12):r==="crack"?t=Xr(e,(n,i)=>{const s=di(n*6,i*6,6,5),a=Math.abs(di(n*4,i*4,4,11)-.5);return s*.6+Math.min(1,a*9)*.4},n=>.55+n*.45):r==="snow"?t=Xr(e,(n,i)=>di(n*6,i*6,6,21)*.8+di(n*24,i*24,24,4)*.2,n=>.9+n*.1):t=Xr(e,(n,i)=>di(n*10,i*10,10,7)*.55+di(n*40,i*40,40,13)*.45,(n,i,s)=>.7+n*.3+(di(i*3,s*3,3,2)-.5)*.18),sn[r]=t,t}function $u(){if(sn.dot)return sn.dot;const r=document.createElement("canvas");r.width=r.height=64;const e=r.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.25,"rgba(255,255,255,0.8)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);const n=new Bl(r);return n.colorSpace=ht,sn.dot=n,n}function kx(){if(sn.slash)return sn.slash;const r=document.createElement("canvas");r.width=256,r.height=128;const e=r.getContext("2d"),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"rgba(255,255,255,0)"),t.addColorStop(.6,"rgba(255,255,255,0.9)"),t.addColorStop(1,"rgba(255,255,255,1)"),e.strokeStyle=t,e.lineCap="round";for(let i=0;i<3;i++)e.lineWidth=10-i*3,e.globalAlpha=1-i*.25,e.beginPath(),e.ellipse(128,128,118-i*4,100-i*10,0,Math.PI*1.08,Math.PI*1.92),e.stroke();const n=new Bl(r);return n.colorSpace=ht,sn.slash=n,n}function Oh(){if(sn.blob)return sn.blob;const r=document.createElement("canvas");r.width=r.height=64;const e=r.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);return t.addColorStop(0,"rgba(0,0,0,0.55)"),t.addColorStop(.6,"rgba(0,0,0,0.25)"),t.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=t,e.fillRect(0,0,64,64),sn.blob=new Bl(r),sn.blob}function Bh(r,e,t,n,i,s=1){const a=new dt({side:Ot,depthWrite:!1,fog:!1,uniforms:{top:{value:new ue(r)},hor:{value:new ue(e)},bot:{value:new ue(t)},sunDir:{value:n.clone().normalize()},sunCol:{value:new ue(i)},sunSize:{value:s}},vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }",fragmentShader:`uniform vec3 top, hor, bot, sunCol, sunDir; uniform float sunSize; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float y = d.y;
        vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y,0.0,1.0), 0.55)) : mix(hor, bot, pow(clamp(-y,0.0,1.0), 0.4));
        float s = max(dot(d, sunDir), 0.0);
        c += sunCol * (pow(s, 900.0/sunSize) * 6.0 + pow(s, 12.0) * 0.35 + pow(s, 3.0) * 0.12);
        gl_FragColor = vec4(c, 1.0); }`}),o=new $e(new bs(400,32,16),a);return o.frustumCulled=!1,o.renderOrder=-10,o}function Ox(r,e,t,n,i,s,a){return new dt({transparent:!0,depthWrite:!1,fog:!0,uniforms:vn.merge([ce.fog,{t:{value:0},col:{value:new ue(e)},depthTex:{value:t},area:{value:n},skyTop:{value:new ue(i)},skyHor:{value:new ue(s)},sunDir:{value:a.clone().normalize()},mode:{value:r==="lava"?1:r==="void"?2:r==="glitter"?3:0}}]),vertexShader:`varying vec3 vW; varying vec2 vUv; 
${Ne.fog_pars_vertex}

      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vUv = uv; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition; 
${Ne.fog_vertex}
 }`,fragmentShader:`uniform float t; uniform vec3 col, skyTop, skyHor, sunDir; uniform sampler2D depthTex; uniform vec4 area; uniform int mode;
      varying vec3 vW; varying vec2 vUv; 
${Ne.fog_pars_fragment}

      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      float fb(vec2 p){ return n(p)*0.5 + n(p*2.03+3.1)*0.25 + n(p*4.01+7.7)*0.125; }
      void main(){
        vec2 p = vW.xz;
        vec2 duv = (p - area.xy) / area.zw;
        float depth = texture2D(depthTex, duv).r;
        float e = 0.06;
        float hx = fb(p*1.3 + vec2(t*0.35, t*0.2)) + fb(p*2.7 - vec2(t*0.25, -t*0.31))*0.5;
        float hx1 = fb((p+vec2(e,0.0))*1.3 + vec2(t*0.35, t*0.2)) + fb((p+vec2(e,0.0))*2.7 - vec2(t*0.25, -t*0.31))*0.5;
        float hz1 = fb((p+vec2(0.0,e))*1.3 + vec2(t*0.35, t*0.2)) + fb((p+vec2(0.0,e))*2.7 - vec2(t*0.25, -t*0.31))*0.5;
        vec3 N = normalize(vec3((hx - hx1) * 1.6, 1.0, (hx - hz1) * 1.6));
        vec3 V = normalize(cameraPosition - vW);
        float fres = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        vec3 R = reflect(-V, N);
        vec3 sky = mix(skyHor, skyTop, clamp(R.y, 0.0, 1.0));
        float spec = pow(max(dot(R, sunDir), 0.0), 220.0) * 5.0;
        vec3 c; float a;
        if (mode == 1) {
          float f = fb(p*0.9 + vec2(t*0.12, t*0.07)) ;
          float crack = smoothstep(0.42, 0.5, fb(p*1.7 - vec2(t*0.05, t*0.09)));
          c = mix(col * 0.22, col * 1.1 + vec3(0.25,0.08,0.0), f) + vec3(1.1,0.5,0.08) * crack * 0.7;
          c *= 1.0 + 0.25 * sin(t * 1.3 + p.x * 0.7);
          a = 1.0;
        } else if (mode == 2) {
          float g = pow(n(p*6.0 + t*0.5), 18.0);
          c = col * 0.6 + mix(skyHor, skyTop, 0.5) * fres * 0.4 + vec3(0.5,1.0,0.6) * g * 2.0;
          a = 0.96;
        } else {
          vec3 deep = col * 0.55, shallow = col * 1.25 + vec3(0.05,0.12,0.12);
          c = mix(shallow, deep, smoothstep(0.0, 0.7, depth));
          c = mix(c, sky, fres * 0.85) + vec3(spec);
          float foam = smoothstep(0.12, 0.0, depth) * (0.55 + 0.45 * n(p*7.0 + t));
          c = mix(c, vec3(1.0), foam * 0.75);
          if (mode == 3) c += vec3(1.0,0.85,0.95) * pow(n(p*9.0 + vec2(t*0.8, -t*0.6)), 22.0) * 3.0;
          a = mix(0.55, 0.92, smoothstep(0.0, 0.5, depth));
          a = max(a, foam);
        }
        gl_FragColor = vec4(c, a);
        
${Ne.fog_fragment}

      }`})}const Ku={t:{value:0}};function ul(r,e=.06,t=1.5){return r.onBeforeCompile=n=>{n.uniforms.windT=Ku.t,n.vertexShader=`uniform float windT;
`+n.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      {
        vec3 ip = vec3(0.0);
        #ifdef USE_INSTANCING
          ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        #endif
        float k = clamp(position.y / ${t.toFixed(3)}, 0.0, 1.0); k *= k;
        float ph = ip.x * 0.7 + ip.z * 0.9;
        transformed.x += sin(windT * 1.7 + ph) * ${e.toFixed(3)} * k * ${(1/1).toFixed(1)};
        transformed.z += cos(windT * 1.3 + ph * 1.3) * ${(e*.6).toFixed(3)} * k;
      }`)},r.customProgramCacheKey=()=>"wind"+e+"_"+t,r}function Zu(r,e,t,n=new P(26,8,20)){const i=new _t,s=new Float32Array(e*3),a=new Float32Array(e);for(let h=0;h<e;h++)s[h*3]=Math.random()*n.x,s[h*3+1]=Math.random()*n.y,s[h*3+2]=Math.random()*n.z,a[h]=Math.random();i.setAttribute("position",new xt(s,3)),i.setAttribute("rnd",new xt(a,1));const o={pollen:0,snow:1,ember:2,dust:3,glitter:4,spark:5}[r]??0,l=new dt({transparent:!0,depthWrite:!1,blending:o===1||o===3?Ni:pi,uniforms:{t:{value:0},center:{value:new P},box:{value:n},col:{value:new ue(t)},tex:{value:$u()},mode:{value:o},scale:{value:300}},vertexShader:`uniform float t, scale; uniform vec3 center, box; uniform int mode; attribute float rnd; varying float vA; varying float vR;
      void main(){
        vec3 p = position;
        if (mode == 1) { p.y -= t * (0.6 + rnd * 0.5); p.x += sin(t * 0.8 + rnd * 20.0) * 0.4; }
        else if (mode == 2) { p.y += t * (0.5 + rnd * 0.8); p.x += sin(t * 1.5 + rnd * 30.0) * 0.3; }
        else { p += vec3(sin(t * 0.3 + rnd * 40.0), sin(t * 0.5 + rnd * 17.0) * 0.5, cos(t * 0.27 + rnd * 23.0)) * 0.8; }
        vec3 base = center - box * vec3(0.5, 0.15, 0.5);
        p = base + mod(p - base, box);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float s = mode == 1 ? 0.09 : (mode == 3 ? 0.05 : 0.07);
        gl_PointSize = s * (0.6 + rnd) * scale / -mv.z;
        gl_Position = projectionMatrix * mv;
        float tw = 0.5 + 0.5 * sin(t * (2.0 + rnd * 3.0) + rnd * 50.0);
        vA = mode == 4 || mode == 5 ? pow(tw, 6.0) : (mode == 0 ? 0.35 + 0.65 * tw : 1.0);
        float edge = min(min(p.x - base.x, base.x + box.x - p.x), min(p.z - base.z, base.z + box.z - p.z));
        vA *= clamp(edge / 2.0, 0.0, 1.0);
        vR = rnd;
      }`,fragmentShader:`uniform sampler2D tex; uniform vec3 col; uniform int mode; varying float vA; varying float vR;
      void main(){ vec4 d = texture2D(tex, gl_PointCoord); vec3 c = col;
        if (mode == 2) c = mix(col, vec3(1.0, 0.85, 0.3), vR);
        if (mode == 4) c = mix(col, vec3(1.0, 0.9, 0.5), step(0.5, vR));
        float a = d.a * vA * (mode == 3 ? 0.35 : (mode == 1 ? 0.9 : 1.0));
        gl_FragColor = vec4(c * (mode == 1 || mode == 3 ? 1.0 : 2.2), a); }`}),c=new Ol(i,l);return c.frustumCulled=!1,c}const qr=r=>new ue(r),Bx=["sword_attack","staff_attack","bow_attack_shoot","dagger_attack","attack","punch"];function zx(r){r.traverse(e=>{if(e.userData.ownGeo&&e.geometry?.dispose(),e.userData.ownMat)for(const t of[].concat(e.material))t&&(t.userData.ownTex&&(t.map?.dispose(),t.normalMap?.dispose()),t.dispose())})}class Hx{constructor(e){this.v=e,this.scene=new sl,this.enemies=[],this.heroes=[],this.t=0,this.token=0,this.pool=[];for(let t=0;t<3;t++){const n=new Kn(16777215,0,9,1.6);this.pool.push(n)}this.scene.userData.flashPool=this.pool,this.accent=[new Kn(16777215,0,14,1.4),new Kn(16777215,0,14,1.4)],this.rim=new ql(16777215,0)}async begin(e,t,n,i){const s=++this.token,a=this.v,o=this.scene,l=a.Q,c=js(e),h=e.startsWith("ow_")||["town","schlager","xmas"].includes(c),u=h?dl[c].out?c:"town":c,d=fl(e),f=[Promise.all(t.map(H=>a.actorMonster(H.id,H.boss?1.15:2))),Promise.all(n.map(H=>a.actorHero(H.id,!0))),i?a.actorCapsule(i):Promise.resolve(null),Promise.all([...d.map(H=>$t(H[0])),$t(h?"forest/rocks-high.glb":"town/rock-large.glb")])],[m,_,g]=await Promise.all(f),p={};for(const H of d)p[H[0]]=await $t(H[0]);const x=h?"forest/rocks-high.glb":"town/rock-large.glb";if(p[x]=await $t(x),s!==this.token)return;this.clear();const{v:T}=a.setupSky(o,u,9);a.renderer.toneMappingExposure=T.expo;const v=rs(e),D=Yu(h?c==="xmas"?"snow":"grass":c==="rap"||c==="static"?"tile":"crack"),E=D.map.clone(),A=D.normal.clone();E.repeat.set(14,14),A.repeat.set(14,14),E.needsUpdate=A.needsUpdate=!0;const w=new us(45,64,0,Math.PI*2);w.rotateX(-Math.PI/2);const M=[],y=w.attributes.position,R=qr(v[0]).lerp(qr(v[1]),.5).multiplyScalar(.92);for(let H=0;H<y.count;H++){const K=Math.hypot(y.getX(H),y.getZ(H)),J=Math.max(.55,1-K/60);M.push(R.r*J,R.g*J,R.b*J)}w.setAttribute("color",new Ze(M,3));const L=new $e(w,new nn({vertexColors:!0,map:E,normalMap:A,roughness:.92}));L.receiveShadow=!0,L.userData.ownGeo=L.userData.ownMat=!0,L.material.userData.ownTex=!0,o.add(L);const I=Gx(Vx(e)),O=new Map,V=(H,K)=>{O.has(H)||O.set(H,[]),O.get(H).push(K)},B=(H,K,J,se,ye=J)=>new Ce().compose(new P(H,0,K),new Xt().setFromAxisAngle(new P(0,1,0),se),new P(J,ye,J));for(let H=0;H<30;H++){const K=-Math.PI*(.05+I()*.9),J=10+I()*10,se=d[Math.floor(I()*d.length)],ye=se[1]*(1+I()*.6);V(se[0],B(Math.cos(K)*J*1.3,Math.sin(K)*J-1,ye,I()*6.28))}for(let H=0;H<10;H++){const K=-Math.PI*(.1+I()*.8);V(x,B(Math.cos(K)*24,Math.sin(K)*18-2,5.5,I()*6.28,6.5))}for(const[H,K]of O)a.addInstances(o,p[H],K,H.includes("tree")||H.includes("pine"),!1);h&&l.grass&&this.grass(o,v,l.grass*260),this.rim.color.set(h?"#ffe8d0":T.accent||"#ffffff"),this.rim.intensity=h?.8:1.6,this.rim.position.set(0,4,-10),o.add(this.rim);for(const[H,K]of this.accent.entries())K.color.set(h?"#ffffff":T.accent||"#ffffff"),K.intensity=h?0:22,K.position.set(H?6:-6,3.5,-3.5),o.add(K);for(const H of this.pool)H.intensity=0,H.userData.busy=!1,o.add(H);this.parts=Zu(T.part[0],Math.round(l.parts*.7),T.part[1],new P(24,8,16)),this.parts.material.uniforms.center.value.set(0,0,-2),this.parts.userData.ownGeo=this.parts.userData.ownMat=!0,o.add(this.parts);const Y=t.length;this.enemies=m.map((H,K)=>{const J=(K-(Y-1)/2)*(Y>1?3.7:0);return H.root.position.set(J,0,-3.4),H.base=H.root.position.clone(),a.addBlob(H.root,t[K].boss?3:1.9),H.mats=[],H.root.traverse(se=>{se.isMesh&&se.material.emissive&&H.mats.push(se.material)}),o.add(H.root),H});const G=n.length;this.heroes=_.map((H,K)=>(H.root.position.set((K-(G-1)/2)*1.9,0,.1+Math.abs(K-(G-1)/2)*.25),H.base=H.root.position.clone(),H.pivot.rotation.y=Math.PI,H.id=n[K].id,o.add(H.root),n[K].hp<=0&&(on(H,"death",""),H.mixer?.update(5)),H)),this.cap=g,g&&(g.root.position.set((G-1)/2*1.9+1.7,0,-.5),g.base=g.root.position.clone(),g.pivot.rotation.y=Math.PI,o.add(g.root)),this.t=0,this.camT=0,this.shakeT=0,this.placeCam(0),a.placeSun(o,new P(0,0,-1.5)),a.renderer.compile(o,a.camera)}grass(e,t,n){const i=new Dn(.06,.34,1,3);i.translate(0,.17,0);const s=ul(new nn({color:16777215,side:Rt,roughness:.85}),.07,.34),a=new Zs(i,s,n);a.userData.ownGeo=a.userData.ownMat=!0;const o=new Ce,l=new Xt,c=new P,h=new P,u=new ue;for(let d=0;d<n;d++){const f=Math.random()*Math.PI*2,m=2.5+Math.sqrt(Math.random())*15;h.set(Math.cos(f)*m*1.3,0,Math.sin(f)*m-2),l.setFromAxisAngle(new P(0,1,0),Math.random()*6.28),c.set(1,.6+Math.random()*1.1,1),o.compose(h,l,c),a.setMatrixAt(d,o),u.set(t[0]).lerp(qr(t[3]||t[1]),Math.random()*.6).multiplyScalar(.85+Math.random()*.3),a.setColorAt(d,u)}a.receiveShadow=!0,a.frustumCulled=!1,e.add(a)}clear(){const e=this.scene;this.v.fx.clear(e);for(const t of e.children.slice())t===e.userData.sky||t===e.userData.sun||t===e.userData.hemi||t===e.userData.sun?.target||(e.remove(t),zx(t));this.enemies=[],this.heroes=[],this.cap=null}end(){this.token++,this.clear()}placeCam(e){const t=this.v.camera;this.camT+=e,t.position.set(Math.sin(this.camT*.25)*.5,5,9.4),this.shakeT>0&&(this.shakeT-=e,t.position.x+=(Math.random()-.5)*.22,t.position.y+=(Math.random()-.5)*.15),t.lookAt(0,.9,-.9)}lunge(e,t,n,i){e.lunge={t:0,dur:i,dir:t.clone().setY(0).normalize(),dist:n}}hero(e,t,n){if(e===-1&&t==="victory"){for(const a of this.heroes)(a.state!=="once"||a.dead!==!0)&&(a.dead||(a.hop={t:0}));return}const i=this.heroes[e];if(!i)return;const s=n>=0?this.enemies[n]:null;switch(t){case"attack":{on(i,Bx);const a=i.id==="andrew"||i.id==="andy";s&&this.lunge(i,s.base.clone().sub(i.base),a?2.2:.5,.6),i.id==="rico"&&s&&this.bolt(i,s,"#ffd27a",.22);break}case"cast":on(i,["spell1","staff_attack","attack","punch"]),this.v.fx.burst(i.root.position.clone().add(new P(0,1,0)),i.id==="teresa"?"#9affc0":"#c8a0ff",24,1.4,.7,1.5,.12,this.scene),s&&this.bolt(i,s,"#c890ff",.3);break;case"hurt":on(i,"recievehit"),this.lunge(i,new P(0,0,1),.35,.3);break;case"death":i.dead=!0,on(i,"death","");break;case"idle":i.dead=!1,i.state="",bn(i,"idle");break;case"guard":on(i,["idle_weapon","idle_attacking","idle"]);break}}capsule(e,t){const n=this.cap;if(!n)return;const i=t>=0?this.enemies[t]:null;e==="attack"||e==="cast"?(on(n,["bite_front","attack","dragon_attack","skeleton_attack","slime_attack","punch"]),this.lunge(n,i?i.base.clone().sub(n.base):new P(0,0,-1),e==="attack"?1.8:.4,.55),e==="cast"&&this.v.fx.burst(n.root.position.clone().add(new P(0,n.h*.6,0)),"#ffd27a",26,1.5,.7,1.5,.12,this.scene),e==="cast"&&i&&this.bolt(n,i,"#ffb070",.25)):e==="hurt"?(on(n,["hitrecieve","hit"]),this.lunge(n,new P(0,0,1),.3,.25)):e==="death"&&(on(n,"death",""),n.dead=!0)}enemy(e,t,n){const i=this.enemies[e];if(i)if(t==="attack"){on(i,["bite_front","attack","dragon_attack","skeleton_attack","slime_attack"]);const s=n===-2?this.cap:n>=0?this.heroes[n]:null;this.lunge(i,s?s.base.clone().sub(i.base):new P(0,0,1),1.4,.55)}else t==="hurt"&&(on(i,["hitrecieve","hit"]),i.flash=.22,this.lunge(i,new P(0,0,-1),.3,.25))}enemyDown(e){const t=this.enemies[e];t&&(on(t,"death","")||(t.noDeathAnim=!0),t.down=1e-4)}bolt(e,t,n,i){const s=new $e(new bs(.12,12,8),new Ct({color:qr(n).multiplyScalar(4)})),a=e.root.position.clone().add(new P(0,1,-.3)),o=t.root.position.clone().add(new P(0,t.h*.5,0));s.position.copy(a),s.visible=!1,this.v.fx.add(s,this.scene,.28+i,l=>{const c=Math.max(0,(l*(.28+i)-i)/.28);s.visible=c>0,s.position.lerpVectors(a,o,c),s.position.y+=Math.sin(c*Math.PI)*.6})}pos(e,t,n){const i=e==="enemy"?this.enemies[t]:e==="capsule"?this.cap:this.heroes[t];return i?i.root.position.clone().add(new P(0,n??i.h,0)):null}fxAt(e,t,n){const i=this.v.fx,s=this.scene;if(e==="victory"){for(const c of this.heroes)i.burst(c.root.position.clone().add(new P(0,1.8,0)),["#ffd24a","#ff5ad0","#46e6ff","#7cff9a"][Math.floor(Math.random()*4)],30,2.6,1.3,-3,.1,s);return}const a=t==="enemy"?this.enemies[n]:t==="capsule"?this.cap:this.heroes[n];if(!a)return;const o=a.root.position.clone().add(new P(0,a.h*.55,0)),l=a.root.position.clone().add(new P(0,.05,0));switch(e){case"slash":i.slash(o,"#ffffff",1.4+a.h*.3,s),i.burst(o,"#ffe8a0",18,3.2,.45,-4,.09,s);break;case"bigslash":i.slash(o,"#ffc840",2.4+a.h*.3,s),i.ring(l,"#ffb020",.3,3.5,.5,s),i.burst(o,"#ffd24a",40,4.5,.7,-4,.12,s),i.flash(o,"#ffb040",40,.4,s),this.shakeT=.25;break;case"magic":i.burst(o,"#b48aff",46,3.4,.7,.5,.14,s),i.ring(o,"#c8a0ff",.2,2.2,.45,s,!1),i.flash(o,"#9a6aff",30,.45,s);break;case"heal":i.burst(l.clone().add(new P(0,.3,0)),"#7cffb0",30,1.2,1.1,2,.11,s),i.ring(l,"#7cffb0",.2,1.1,.7,s);break;case"guard":i.bubble(o,"#6ac8ff",.95,.8,s);break;case"hit":i.burst(o,"#ff6a5a",14,2.4,.4,-4,.08,s);break;case"heavy":i.burst(o,"#ff4a3a",28,3.4,.5,-4,.11,s),this.shakeT=.3;break;case"spec":i.ring(l,"#ff4a6a",.5,11,.8,s),i.flash(o,"#ff3050",60,.6,s),this.shakeT=.45;break;case"special":i.ring(l,"#ffd24a",.2,1.6,.6,s),i.burst(l.clone().add(new P(0,.4,0)),"#ffd24a",40,1.6,.9,2.5,.12,s),i.flash(o,"#ffc040",30,.6,s);break}}update(e){this.t+=e;const t=[...this.enemies,...this.heroes,...this.cap?[this.cap]:[]];for(const n of t){n.mixer?.update(e);const i=new P;if(n.lunge){const s=n.lunge;s.t+=e;const a=Math.min(1,s.t/s.dur);i.addScaledVector(s.dir,Math.sin(a*Math.PI)*s.dist),a>=1&&(n.lunge=null)}if(n.hop&&(n.hop.t+=e,i.y+=Math.max(0,Math.sin(n.hop.t*9))*.35*Math.max(0,1-n.hop.t/1.4),n.hop.t>1.4&&(n.hop=null)),n.root.position.copy(n.base).add(i),n.flash!==void 0&&n.mats){n.flash=Math.max(0,n.flash-e);const s=n.flash/.22;for(const a of n.mats)a.emissive.setRGB(s,s,s),a.emissiveIntensity=1.5}if(n.down&&(n.down+=e,n.down>.9||n.noDeathAnim)){const s=Math.min(1,(n.down-(n.noDeathAnim?0:.9))/.35);n.root.scale.setScalar(Math.max(.001,1-s)),!n.poof&&s>.1&&(n.poof=!0,this.v.fx.burst(n.root.position.clone().add(new P(0,n.h*.4,0)),"#c8d0ff",36,2.2,.8,.8,.11,this.scene)),s>=1&&(n.root.visible=!1)}}this.parts&&(this.parts.material.uniforms.t.value=this.t,this.parts.material.uniforms.scale.value=this.v.H*.9),this.placeCam(e),this.v.fx.update(e)}}function Vx(r){let e=2166136261;for(let t=0;t<r.length;t++)e^=r.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}function Gx(r){return()=>{r|=0,r=r+1831565813|0;let e=Math.imul(r^r>>>15,1|r);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}class Wx{constructor(e){this.v=e,this.list=[]}add(e,t,n,i){t.add(e),this.list.push({obj:e,scene:t,life:n,t:0,step:i})}burst(e,t,n,i,s,a,o,l){const c=new _t,h=new Float32Array(n*3),u=[];for(let m=0;m<n;m++){h[m*3]=e.x,h[m*3+1]=e.y,h[m*3+2]=e.z;const _=new P(Math.random()-.5,Math.random()*.9+.1,Math.random()-.5).normalize().multiplyScalar(i*(.35+Math.random()*.65));u.push(_)}c.setAttribute("position",new xt(h,3));const d=new kl({map:$u(),color:new ue(t).multiplyScalar(2.5),size:o,transparent:!0,depthWrite:!1,blending:pi,sizeAttenuation:!0}),f=new Ol(c,d);f.frustumCulled=!1,this.add(f,l,s,(m,_)=>{const g=c.attributes.position;for(let p=0;p<n;p++){const x=u[p];x.y+=a*_,x.multiplyScalar(1-_*1.2),g.array[p*3]+=x.x*_,g.array[p*3+1]+=x.y*_,g.array[p*3+2]+=x.z*_}g.needsUpdate=!0,d.opacity=1-m*m})}ring(e,t,n,i,s,a,o=!0){const l=new Ct({color:new ue(t).multiplyScalar(2.2),transparent:!0,side:Rt,depthWrite:!1,blending:pi}),c=new $e(new va(.85,1,64),l);o&&(c.rotation.x=-Math.PI/2),c.position.copy(e),this.add(c,a,s,h=>{const u=n+(i-n)*(1-(1-h)*(1-h));c.scale.setScalar(u),l.opacity=1-h})}slash(e,t,n,i){const s=new Ct({map:kx(),color:new ue(t).multiplyScalar(2.4),transparent:!0,depthWrite:!1,depthTest:!1,blending:pi,side:Rt}),a=new $e(new Dn(2*n,1*n),s);a.position.copy(e),a.quaternion.copy(this.v.camera.quaternion),a.rotateZ(-.7+Math.random()*.4),a.renderOrder=20,this.add(a,i,.32,o=>{a.scale.setScalar(.7+o*.6),s.opacity=1-o,a.rotateZ(.02)})}flash(e,t,n,i,s){const a=s.userData.flashPool;if(!a)return;const o=a.find(c=>!c.userData.busy)||a[0];o.userData.busy=!0,o.color.set(t),o.position.copy(e);const l={obj:new ut,scene:s,life:i,t:0,step:c=>{o.intensity=n*(1-c),c>=1&&(o.intensity=0,o.userData.busy=!1)}};s.add(l.obj),this.list.push(l)}bubble(e,t,n,i,s){const a=new Ct({color:new ue(t).multiplyScalar(1.4),transparent:!0,opacity:0,depthWrite:!1,blending:pi,side:Rt});a.onBeforeCompile=l=>{l.vertexShader=l.vertexShader.replace("#include <common>",`#include <common>
varying float vF;`).replace("#include <project_vertex>",`#include <project_vertex>
vec3 nn = normalize(normalMatrix * normal); vF = 1.0 - abs(nn.z);`),l.fragmentShader=l.fragmentShader.replace("#include <common>",`#include <common>
varying float vF;`).replace("vec4 diffuseColor = vec4( diffuse, opacity );","vec4 diffuseColor = vec4( diffuse, opacity * (0.15 + pow(vF, 2.0)) );")};const o=new $e(new bs(n,24,16),a);o.position.copy(e),this.add(o,s,i,l=>{a.opacity=l<.2?l*5:(1-l)*1.25,o.scale.setScalar(.9+.1*Math.sin(l*20))})}update(e){for(const t of this.list)t.t+=e,t.step(Math.min(1,t.t/t.life),e);this.list=this.list.filter(t=>t.t<t.life?!0:(t.step(1,0),t.scene.remove(t.obj),t.obj.geometry?.dispose(),t.obj.material?.dispose(),t.obj.dispose?.(),!1))}clear(e){this.list=this.list.filter(t=>t.scene!==e?!0:(e.remove(t.obj),t.obj.geometry?.dispose(),t.obj.material?.dispose(),!1))}}const Xx={uniforms:{tDiffuse:{value:null},amt:{value:1}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float amt; varying vec2 vUv;
    void main(){
      vec4 t = texture2D(tDiffuse, vUv); vec3 c = t.rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      vec3 g = mix(vec3(l), c, 1.14);
      g = (g - 0.5) * 1.07 + 0.5;
      g += mix(vec3(-0.012, 0.004, 0.03), vec3(0.03, 0.012, -0.02), smoothstep(0.15, 0.85, l));
      gl_FragColor = vec4(mix(c, clamp(g, 0.0, 1.0), amt), t.a);
    }`},qx={ow_town:["#4aa24f","#459a4a","#2a5a6a","#2a8a3a","#ffd24a"],ow_rap:["#5a5a86","#54547e","#2a2a44","#4a4a8a","#ff4a6a"],ow_schlager:["#a6d67e","#9ecf76","#a04a80","#58b04a","#ff5aa8"],ow_xmas:["#e6f2fa","#dcecf6","#4a7a9a","#2f8a4a","#ff3a3a"],ow_rock:["#6a4a3a","#634232","#2a1a18","#8a5a2a","#ff7a1a"],ow_static:["#4a505e","#444a58","#202430","#606878","#7cff9a"]},jx={town:"#2a6ac8",rap:"#1a1030",schlager:"#ff8fc8",xmas:"#26466a",rock:"#ff5a10",static:"#0a0c12"},zh={town:"water",rap:"void",schlager:"glitter",xmas:"water",rock:"lava",static:"void"},dl={town:{out:!0,sky:["#3d7fd6","#bfe2ff","#6c8fae"],sun:[.55,.62,.35],sunC:"#fff0d8",sunI:3,hemi:["#cfe6ff","#5a7a4a",1.1],env:.55,fog:.01,part:["pollen","#fff6b0"],expo:1},schlager:{out:!0,sky:["#d26ac0","#ffd0ea","#c08ab0"],sun:[-.4,.4,.5],sunC:"#ffe0f0",sunI:2.6,hemi:["#ffe0f4","#8a5a7a",1],env:.6,fog:.012,part:["glitter","#ff9ad8"],expo:1},xmas:{out:!0,sky:["#7a9cc8","#e6f0fa","#b8c8da"],sun:[.3,.32,.6],sunC:"#ffe8d0",sunI:2.2,hemi:["#e8f2ff","#8aa0b8",1.2],env:.6,fog:.016,part:["snow","#ffffff"],expo:.95},rap:{out:!1,sky:["#0a0614","#2a1848","#0a0614"],sun:[.4,.8,.3],sunC:"#9a80ff",sunI:1.5,hemi:["#6a4aa8","#1a1024",1],env:.4,fog:.035,part:["dust","#c8a8ff"],accent:"#ff4a6a",expo:1.1},rock:{out:!1,sky:["#120604","#4a1a0c","#120604"],sun:[.3,.8,.4],sunC:"#ffb080",sunI:1.5,hemi:["#a05030","#200a06",1],env:.4,fog:.032,part:["ember","#ff7a2a"],accent:"#ff7a1a",expo:1.1},static:{out:!1,sky:["#05060c","#1c2232","#05060c"],sun:[.3,.8,.4],sunC:"#a0ffc0",sunI:1.4,hemi:["#506080","#0c0e14",1],env:.4,fog:.035,part:["spark","#7cff9a"],accent:"#7cff9a",expo:1.1}},Hh={xmas:[["grave/pine.glb",1.5],["grave/pine.glb",1.8],["town/tree-high.glb",1]],rock:[["grave/pine-fall.glb",1.5],["grave/pine-fall-crooked.glb",1.5],["town/tree-crooked.glb",1.1]],rap:[["dungeon/column.glb",1.5],["dungeon/barrel.glb",1.6],["dungeon/rocks.glb",1.2]],static:[["dungeon/column.glb",1.8],["dungeon/rocks.glb",1.4]],schlager:[["town/tree-high-round.glb",1],["town/tree.glb",1.2],["town/tree-high.glb",.9]],town:[["town/tree.glb",1.1],["town/tree-high.glb",1],["forest/tree.glb",1.4],["town/tree-high-round.glb",1]]},fl=r=>Hh[r.replace("ow_","")]||Hh.town,na=["2Story_Mat","1Story_GableRoof_Mat","2Story_Sign_Mat","1Story_Mat","2Story_GableRoof_Mat"],Yx=["town/tree.glb","town/tree-high.glb","town/tree-high-round.glb","town/tree-crooked.glb","town/rock-large.glb","town/road.glb","town/wall-block.glb","town/fountain-round.glb","forest/tree.glb","forest/rocks-high.glb","grave/pine.glb","grave/pine-fall.glb","grave/pine-fall-crooked.glb","grave/crypt.glb","dungeon/wall.glb","dungeon/column.glb","dungeon/barrel.glb","dungeon/rocks.glb","dungeon/chest.glb","dungeon/gate.glb","dungeon/key.glb",...na.map(r=>`bld_${r}.glb`),"bld_1Story_Sign_Mat.glb","bld_2Story_Slim_Mat.glb"],Vh=[{dpr:1,shadow:0,bloom:!1,samples:0,grass:0,parts:120},{dpr:1.5,shadow:1024,bloom:!0,samples:0,grass:7,parts:260},{dpr:2,shadow:2048,bloom:!0,samples:4,grass:16,parts:420}],Gh=-.2,Wh=[[.22,4.8],[.36,6.8],[.6,10.5],[.9,15]],Oe=r=>new ue(r),ha=r=>r*r*(3-2*r);function Vt(r,e){const t=Math.sin(r*127.1+e*311.7)*43758.5453;return t-Math.floor(t)}function Os(r,e){const t=Math.floor(r),n=Math.floor(e),i=ha(r-t),s=ha(e-n),a=Vt(t,n),o=Vt(t+1,n),l=Vt(t,n+1),c=Vt(t+1,n+1);return a+(o-a)*i+(l-a)*s+(a-o-l+c)*i*s}const js=r=>r.replace("ow_","");function rs(r){return r.startsWith("ow_")?qx[r]:rd[r]}class $x{constructor(e,t,n){this.g=t,this.canvas=e,this.qi=n,this.Q=Vh[n],this.mode=-1,this.t=0,this.renderer=new W_({canvas:e,antialias:!1,powerPreference:"high-performance",stencil:!1}),this.renderer.outputColorSpace=ht,this.renderer.toneMapping=xl,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Jh,this.pmrem=new nl(this.renderer),this.camera=new Gt(38,16/9,.3,500),this.world=new sl,this.fx=new Wx(this),this.battle=new Hx(this),this.envCache={},this.built="",this.building=null,this.buildToken=0,this.dyn=new Map,this.camTarget=new P,this.camInit=!1,this.camYaw=0,this.camYawT=0,this.camPitch=.4,this.camD=7,this.camZoom=1,this.camKeys=0,this.cine=null,this.shakeT=0,this.labels=[],this.dying=[],this.fpsT=0,this.fpsN=0,this.lowFor=0,this.setupComposer(),this.resize(),addEventListener("resize",()=>this.resize())}setupComposer(){const e=this.Q;if(this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,e.dpr)),this.renderer.shadowMap.enabled=e.shadow>0,this.composer&&(this.composer.dispose?.(),this.composer=null),this.gtao?.dispose?.(),this.gtao=null,e.bloom){const t=this.renderer.getDrawingBufferSize(new Re),n=new Qt(Math.max(1,t.x),Math.max(1,t.y),{type:kt,samples:e.samples});this.composer=new kv(this.renderer,n),this.renderPass=new Ov(this.world,this.camera),this.composer.addPass(this.renderPass),this.gtao=null,this.qi>=2&&(this.gtao=new En(this.world,this.camera,t.x,t.y),this.gtao.updateGtaoMaterial({radius:.5,distanceExponent:1.5,thickness:1,scale:1}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao)),this.bloom=new Ms(new Re(t.x,t.y),.45,.55,.88),this.composer.addPass(this.bloom),this.composer.addPass(new Hv),this.composer.addPass(new Vu(Xx))}}setQuality(e){if(e!==this.qi){this.qi=e,this.Q=Vh[e],this.setupComposer(),this.resize();for(const t of[this.world,this.battle.scene]){const n=t.userData.sun;n&&this.configSun(n,t.userData.shadowSize||14)}this.built=""}}resize(){const e=innerWidth,t=innerHeight;this.renderer.setSize(e,t,!1),this.canvas.style.width=e+"px",this.canvas.style.height=t+"px",this.composer&&(this.composer.setPixelRatio(this.renderer.getPixelRatio()),this.composer.setSize(e,t)),this.aspect=e/Math.max(1,t),this.camera.aspect=this.aspect;const n=38,i=1.5;this.camera.fov=this.aspect>=i?n:tl.radToDeg(2*Math.atan(Math.tan(tl.degToRad(n)/2)*i/this.aspect)),this.camera.updateProjectionMatrix(),this.W=e,this.H=t}configSun(e,t){e.castShadow=this.Q.shadow>0,this.Q.shadow&&(e.shadow.mapSize.set(this.Q.shadow,this.Q.shadow),e.shadow.map&&(e.shadow.map.dispose(),e.shadow.map=null));const n=e.shadow.camera;n.left=-t,n.right=t,n.top=t,n.bottom=-t,n.near=1,n.far=80,n.updateProjectionMatrix(),e.shadow.bias=-5e-4,e.shadow.normalBias=.03,e.shadow.radius=4}setupSky(e,t,n){const i=dl[t];for(const c of["sky","sun","hemi"])e.userData[c]&&(e.remove(e.userData[c]),c==="sun"&&e.remove(e.userData.sun.target));const s=new P(...i.sun).normalize(),a=Bh(i.sky[0],i.sky[1],i.sky[2],s,i.out?i.sunC:"#000000",1);if(e.add(a),e.userData.sky=a,e.background=null,e.fog=new Ll(Oe(i.sky[1]).lerp(Oe(i.sky[2]),i.out?.15:.5),i.fog),i.out&&this.hdrEnv&&(this.envCache[t]=this.hdrEnv),!this.envCache[t]){const c=new sl;c.add(Bh(i.sky[0],i.sky[1],i.sky[2],s,i.sunC,3)),this.envCache[t]=this.pmrem.fromScene(c,.02).texture}e.environment=this.envCache[t],e.environmentIntensity=i.env;const o=new ql(Oe(i.sunC),i.sunI);o.userData.dir=s,e.add(o,o.target),this.configSun(o,n),e.userData.sun=o,e.userData.shadowSize=n;const l=new fv(Oe(i.hemi[0]),Oe(i.hemi[1]),i.hemi[2]);return e.add(l),e.userData.hemi=l,e.userData.vis=i,{sunDir:s,v:i}}placeSun(e,t){const n=e.userData.sun;if(n&&(n.target.position.copy(t),n.position.copy(t).addScaledVector(n.userData.dir,30),n.castShadow)){const i=e.userData.shadowSize*2/this.Q.shadow;n.target.position.x=Math.round(n.target.position.x/i)*i,n.target.position.z=Math.round(n.target.position.z/i)*i,n.position.copy(n.target.position).addScaledVector(n.userData.dir,30)}}async loadHdr(){try{const e=await new qv().loadAsync("./env/spruit_sunrise_1k.hdr");e.mapping=sa,this.hdrEnv=this.pmrem.fromEquirectangular(e).texture,e.dispose();for(const t of["town","schlager","xmas"])delete this.envCache[t]}catch(e){console.warn("HDR",e)}}setMode(e){e!==this.mode&&(this.mode=e,e!==2&&(this.camInit=!1))}mapChanged(){this.built=""}partyChanged(){this.playerLead=""}ready(){return this.built!==this.g.S.mapId+"|"+this.qi&&this.build(),this.building||Promise.resolve()}build(){const e=++this.buildToken,t=this.g.S;return this.built=t.mapId+"|"+this.qi,this.building=this.buildWorld(e).catch(n=>console.error(n)).finally(()=>{e===this.buildToken&&(this.building=null)}),this.building}clearWorld(){const e=this.world;for(const t of e.children.slice())t===e.userData.sky||t===e.userData.sun||t===e.userData.hemi||t===e.userData.sun?.target||(e.remove(t),t.traverse?.(n=>{(n.isInstancedMesh||n.userData.ownGeo)&&n.geometry?.dispose(),n.userData.ownMat&&[].concat(n.material).forEach(i=>{i?.userData.ownTex&&(i.map?.dispose(),i.normalMap?.dispose()),i?.dispose()})}));this.dyn.clear(),this.dying=[],this.player=null,this.playerLead="",this.labels=[]}async buildWorld(e){const t=this.g.S,n=t.map,i=js(n.world?"town":n.theme),s=new Set(["town/road.glb","town/wall-block.glb","dungeon/wall.glb","forest/rocks-high.glb","town/rock-large.glb","grave/crypt.glb","bld_2Story_Slim_Mat.glb","bld_2Story_GableRoof_Mat.glb"]);for(let p=0;p<t.mh;p++)for(let x=0;x<t.mw;x++)if(n.rows[p][x]==="T")for(const T of fl(dr(t,x,p)))s.add(T[0]);if(n.town){for(const p of na)s.add(`bld_${p}.glb`);s.add("bld_1Story_Sign_Mat.glb"),s.add("town/fountain-round.glb")}const a={};if(await Promise.all([...s].map(async p=>{a[p]=await $t(p)})),e!==this.buildToken)return;this.clearWorld();const{sunDir:o,v:l}=this.setupSky(this.world,i,this.qi>=2?22:16);this.theme=i,this.renderer.toneMappingExposure=l.expo;const c=n.world||n.town;if(this.terrain=this.buildTerrain(t,c),this.world.add(this.terrain.mesh),this.terrain.hasLiquid||c){const p=c?"town":n.theme,x=this.terrain.area,T=Ox(zh[p],jx[p],this.terrain.depthTex,new Ke(x.x,x.y,x.w,x.h),l.sky[0],l.sky[1],o);T.userData.liquid=!0;const v=new $e(new Dn(x.w,x.h),T);if(v.rotation.x=-Math.PI/2,v.position.set(x.x+x.w/2,Gh,x.y+x.h/2),v.userData.ownGeo=v.userData.ownMat=!0,v.renderOrder=2,this.world.add(v),this.liquid=T,zh[p]==="lava"){const D=new Kn(Oe("#ff6a20"),0,0,2);this.lavaLight=D}}else this.liquid=null;const h=new Map,u=(p,x)=>{h.has(p)||h.set(p,[]),h.get(p).push(x)},d=(p,x,T,v,D,E=v)=>new Ce().compose(new P(p,x,T),new Xt().setFromAxisAngle(new P(0,1,0),D),new P(v,E,v)),f=new Map;for(let p=0;p<t.mh;p++)for(let x=0;x<t.mw;x++){const T=n.rows[p][x],v=(x*31+p*17)%7,D=x+.5,E=p+.5,A=this.heightAt(D,E);if(T==="T"){const w=fl(dr(t,x,p)),M=w[(x*7+p*13)%w.length],y=M[1]*(.9+.04*v);u(M[0],d(D+(Vt(x,p)-.5)*.25,A-.02,E+(Vt(p,x)-.5)*.25,y,v*.9))}else if(T==="^"){const w=v%2===0?"forest/rocks-high.glb":"town/rock-large.glb";u(w,d(D,A+(v%2===0?.25:-.15),E,1.15,v*1.1,1.15*1.1))}else T==="#"?u(c?"town/wall-block.glb":"dungeon/wall.glb",d(D,0,E,1,0,1.15)):T==="p"?u("town/road.glb",d(D,A+.005,E,1,0)):"hHDSM".includes(T)&&f.set(x+","+p,T)}for(const[p,x]of h)this.addInstances(this.world,a[p],x,p.includes("tree")||p.includes("pine"),p.endsWith("road.glb"));let m=0;const _=new Set;for(let p=0;p<t.mh;p++)for(let x=0;x<t.mw;x++){const T=x+","+p;if(f.get(T)!=="h"||_.has(T))continue;let v=0;for(;f.get(x+v+","+p)==="h";)_.add(x+v+","+p),v++;let D=!1;for(let V=0;V<v;V++)f.get(x+V+","+(p+1))==="S"&&(D=!0);const E=D?"1Story_Sign_Mat":na[m%na.length];m++;const A=a[`bld_${E}.glb`],w=this.brightClone(A,"#ffe6cc"),M=A.box,y=M.getSize(new P),R=v/Math.max(.5,y.x),L=2/Math.max(.5,y.z),I=(R+L)*.5;w.scale.set(R,I,L),w.position.set(-(M.min.x+y.x/2)*R,-M.min.y*I,-(M.min.z+y.z/2)*L);const O=new Nt;O.add(w),O.rotation.y=Math.PI,O.position.set(x+v/2,0,p+1),this.world.add(O),w.traverse(V=>{V.isMesh&&(V.material=[].concat(V.material).map(B=>{if(/glass|window/i.test(B.name)){const Y=B.clone();return Y.emissive=Oe("#ffcf7a"),Y.emissiveIntensity=.5,Y}return B}),V.material.length===1&&(V.material=V.material[0]))})}if(this.buildGrass(t,i,c),n.portals.forEach((p,x)=>{const T=po(t,p),v=this.makePortal(p.kind||"exit",T,a);v.position.set(p.x+.5,this.heightAt(p.x+.5,p.y+.5),p.y+.5),this.world.add(v),this.dyn.set("p"+x,{n:v,k:"portal",p,open:T,kind:p.kind||"exit",models:a}),n.world&&this.labels.push({p,node:v,h:p.kind==="tower"?3.4:2.1})}),this.playerLight=null,!l.out){if(this.playerLight=new Kn(Oe("#ffd2a0"),9,9,1.6),this.world.add(this.playerLight),n.boss&&n.boss.id){const x=new Kn(Oe(l.accent),14,10,1.6);x.position.set(n.boss.x+.5,2.2,n.boss.y+.5),this.world.add(x)}const p=n.portals[0];if(p){const x=new Kn(Oe("#5ae0ff"),6,6,1.6);x.position.set(p.x+.5,1.2,p.y+.5),this.world.add(x)}}const g=n.world?["pollen","#fff6b0"]:l.part;this.particles=Zu(g[0],this.Q.parts,g[1]),this.world.add(this.particles),this.camInit=!1,this.syncDyn(0)}heightAt(e,t){const n=this.terrain;if(!n)return 0;const i=n.R,s=Math.min(Math.max(e*i,0),n.nx-1.001),a=Math.min(Math.max(t*i,0),n.nz-1.001),o=Math.floor(s),l=Math.floor(a),c=s-o,h=a-l,u=n.H,d=n.nx,f=u[l*d+o],m=u[l*d+o+1],_=u[(l+1)*d+o],g=u[(l+1)*d+o+1];return f+(m-f)*c+(_-f)*h+(f-m-_+g)*c*h}buildTerrain(e,t){const n=e.map,i=e.mw,s=e.mh,a=4,o=(J,se)=>n.rows[Math.min(s-1,Math.max(0,se))][Math.min(i-1,Math.max(0,J))],l=(J,se)=>dr(e,Math.min(i-1,Math.max(0,J)),Math.min(s-1,Math.max(0,se))),c=new Float32Array(i*s),h=[];let u=!1;for(let J=0;J<s;J++)for(let se=0;se<i;se++){const ye=o(se,J),j=l(se,J),te=rs(j),oe=js(j);let ie=.04,he=Oe(te[0]).lerp(Oe(te[1]),Os(se*.7,J*.7));const de=[[1,0],[-1,0],[0,1],[0,-1]].some(([_e,Qe])=>o(se+_e,J+Qe)==="~");ye==="~"?(ie=-.55,u=!0,he=oe==="rock"?Oe("#2a1208"):oe==="xmas"?Oe("#9ab0c0"):Oe("#b8a678").multiplyScalar(.7)):ye==="^"?(ie=.85+Os(se*1.3,J*1.3)*.6,he=Oe(oe==="xmas"?"#f4f8ff":oe==="schlager"?"#c89aa8":"#7a7066")):ye==="#"?(ie=.06,he=Oe(te[2]).multiplyScalar(.8)):ye==="p"?he=Oe("#a39a8c"):"hHDSM".includes(ye)?he=Oe("#8a8478"):ye==="T"&&he.multiplyScalar(.82),de&&ye!=="~"&&(oe==="town"||oe==="schlager")&&he.lerp(Oe("#d8c890"),.45),c[J*i+se]=ie,h.push(he)}const d=i*a+1,f=s*a+1,m=new Dn(i,s,i*a,s*a);m.rotateX(-Math.PI/2),m.translate(i/2,0,s/2);const _=m.attributes.position,g=new Float32Array(_.count*3),p=new Float32Array(d*f),x=new ue;for(let J=0;J<f;J++)for(let se=0;se<d;se++){const ye=se/a,j=J/a,te=ye-.5,oe=j-.5,ie=Math.floor(te),he=Math.floor(oe),de=ha(te-ie),_e=ha(oe-he),Qe=(C,S)=>[Math.min(i-1,Math.max(0,C)),Math.min(s-1,Math.max(0,S))],ke=(C,S)=>{const[z,Z]=Qe(C,S);return Z*i+z},Je=ke(ie,he),N=ke(ie+1,he),pt=ke(ie,he+1),Fe=ke(ie+1,he+1);let Le=c[Je]*(1-de)*(1-_e)+c[N]*de*(1-_e)+c[pt]*(1-de)*_e+c[Fe]*de*_e;x.setRGB(0,0,0),x.r=h[Je].r*(1-de)*(1-_e)+h[N].r*de*(1-_e)+h[pt].r*(1-de)*_e+h[Fe].r*de*_e,x.g=h[Je].g*(1-de)*(1-_e)+h[N].g*de*(1-_e)+h[pt].g*(1-de)*_e+h[Fe].g*de*_e,x.b=h[Je].b*(1-de)*(1-_e)+h[N].b*de*(1-_e)+h[pt].b*(1-de)*_e+h[Fe].b*de*_e;const Ee=Os(ye*.9,j*.9)-.5;(t||Le>.3)&&(Le+=Ee*.08+(Os(ye*3.1,j*3.1)-.5)*.03),Le>.5&&(Le+=(Os(ye*2.2,j*2.2)-.5)*.35);const qe=1+Ee*.16,Me=J*d+se;p[Me]=Le,_.setY(Me,Le),g[Me*3]=x.r*qe,g[Me*3+1]=x.g*qe,g[Me*3+2]=x.b*qe}m.setAttribute("color",new xt(g,3)),m.computeVertexNormals();const T=js(n.world?"town":n.theme),v=n.world||n.town?"grass":T==="rap"||T==="static"?"tile":T==="rock"?"crack":T==="xmas"?"snow":"grass",D=Yu(v),E=v==="tile"?.5:.35,A=D.map.clone(),w=D.normal.clone();A.repeat.set(i*E,s*E),w.repeat.set(i*E,s*E),A.needsUpdate=w.needsUpdate=!0;const M=new nn({vertexColors:!0,map:A,normalMap:w,normalScale:new Re(.9,.9),roughness:v==="tile"?.7:.93,metalness:0}),y=new $e(m,M);y.receiveShadow=!0,y.userData.ownGeo=y.userData.ownMat=!0,M.userData.ownTex=!0;const R=new Nt;R.add(y);const L=70,I=new $e(new Dn(i+2*L,s+2*L),new nn({color:t?Oe("#1a3a5a"):Oe(rs(n.theme)[2]).multiplyScalar(.5),roughness:1}));if(I.rotation.x=-Math.PI/2,I.position.set(i/2,t?-.9:-.7,s/2),I.receiveShadow=!0,I.userData.ownGeo=I.userData.ownMat=!0,R.add(I),!t){const J=new $e(new Ts(i+2*L,3,s+2*L),new nn({color:Oe(rs(n.theme)[2]).multiplyScalar(.35),roughness:1,side:Ot}));J.position.set(i/2,1.4,s/2),J.scale.set(1,1,1),J.visible=!1,R.add(J)}const O=4,V={x:-L,y:-L,w:i+2*L,h:s+2*L},B=V.w*O,Y=V.h*O,G=new Uint8Array(B*Y*4),H={R:a,nx:d,nz:f,H:p};this.terrain=H;for(let J=0;J<Y;J++)for(let se=0;se<B;se++){const ye=V.x+(se+.5)/O,j=V.y+(J+.5)/O;let te=1;ye>=0&&j>=0&&ye<=i&&j<=s&&(te=Math.min(1,Math.max(0,(Gh-this.heightAt(ye,j))/.4)));const oe=((Y-1-J)*B+se)*4;G[oe]=G[oe+1]=G[oe+2]=te*255,G[oe+3]=255}const K=new zi(G,B,Y,Wt);return K.magFilter=K.minFilter=gt,K.needsUpdate=!0,Object.assign(H,{mesh:R,depthTex:K,area:V,hasLiquid:u})}addInstances(e,t,n,i,s){t.scene.updateMatrixWorld(!0),t.scene.traverse(a=>{if(!a.isMesh)return;let o=a.material;i&&(o=ul([].concat(o)[0].clone(),.05,2)),s&&(o=[].concat(o)[0].clone(),o.color=Oe("#9aa0b0"),o.roughness=.85);const l=new Zs(a.geometry,o,n.length),c=a.matrixWorld;n.forEach((h,u)=>l.setMatrixAt(u,new Ce().multiplyMatrices(h,c))),l.instanceMatrix.needsUpdate=!0,l.castShadow=!s,l.receiveShadow=!0,l.computeBoundingSphere(),(i||s)&&(l.userData.ownMat=!0),e.add(l)})}buildGrass(e,t,n){const i=this.Q.grass,s=e.map,a=c=>["town","schlager"].includes(js(c))||c==="ow_rap"||c==="ow_rock",o=[],l=[];for(let c=0;c<e.mh;c++)for(let h=0;h<e.mw;h++){const u=s.rows[c][h],d=dr(e,h,c);u===","&&l.push([h,c,d]),i&&(u==="."||u===","||u==="T")&&a(d)&&(n||t==="schlager")&&o.push([h,c,d])}if(o.length){const c=new _t,h=[],u=[],d=[],f=3;for(let w=0;w<=f;w++){const M=w/f,y=.035*(1-M*.85);h.push(-y,M*.32,M*M*.06,y,M*.32,M*M*.06);const R=.45+.55*M;u.push(R,R,R,R,R,R)}for(let w=0;w<f;w++){const M=w*2;d.push(M,M+1,M+2,M+1,M+3,M+2)}c.setAttribute("position",new Ze(h,3)),c.setAttribute("color",new Ze(u,3)),c.setIndex(d),c.computeVertexNormals();const m=ul(new nn({vertexColors:!0,side:Rt,roughness:.8}),.07,.32),_=o.length*i,g=new Zs(c,m,_),p=new Ce,x=new Xt,T=new P(0,1,0),v=new P,D=new P,E=new ue;let A=0;for(const[w,M,y]of o){const R=rs(y),L=da(e,{x:w,y:M})||gl(e,{x:w,y:M});for(let I=0;I<i;I++){const O=Vt(w*13+I,M*7),V=Vt(M*11+I,w*5+I);D.set(w+O,0,M+V),D.y=this.heightAt(D.x,D.z)-.01;const B=L?.01:.7+Vt(I,w+M)*.9;v.set(1,B,1),x.setFromAxisAngle(T,Vt(w+I,M)*Math.PI*2),p.compose(D,x,v),g.setMatrixAt(A,p),E.set(R[0]).lerp(Oe(R[3]||R[1]),Vt(I*3,M+w)*.6).multiplyScalar(1.05),g.setColorAt(A,E),A++}}g.instanceMatrix.needsUpdate=!0,g.instanceColor&&(g.instanceColor.needsUpdate=!0),g.receiveShadow=!0,g.castShadow=!1,g.userData.ownGeo=g.userData.ownMat=!0,g.frustumCulled=!1,this.world.add(g)}if(l.length){const c=new Vl(.05,0),h=new nn({roughness:.4,emissive:Oe("#ffffff"),emissiveIntensity:0});h.onBeforeCompile=g=>{g.fragmentShader=g.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
 totalEmissiveRadiance = vColor * `+(n?"0.25":"1.6")+";")},h.vertexColors=!1;const u=5,d=new Zs(c,h,l.length*u),f=new Ce,m=new ue;let _=0;for(const[g,p,x]of l){const T=rs(x);for(let v=0;v<u;v++){const D=g+.15+Vt(g+v*3,p)*.7,E=p+.15+Vt(p+v*5,g)*.7,A=n?.8+Vt(v,g)*.6:.8+Vt(v,p)*1.4;f.makeScale(A,n?A:A*2.2,A).setPosition(D,this.heightAt(D,E)+.05*A,E),d.setMatrixAt(_,f),m.set(v%2?T[4]:n?"#ffffff":T[4]),d.setColorAt(_,m),_++}}d.instanceMatrix.needsUpdate=!0,d.instanceColor.needsUpdate=!0,d.userData.ownGeo=d.userData.ownMat=!0,this.world.add(d)}}makePortal(e,t,n){const i=new Nt,s=Oe("#ff8a8a"),a=(o,l,c=1,h=Math.PI)=>{const u=o.box&&e!=="cave"?this.brightClone(o,"#ffe6cc"):o.scene.clone(),d=o.box,f=d.getSize(new P),m=l/Math.max(.3,f.x);u.scale.set(m,m*c,m),u.position.set(-(d.min.x+f.x/2)*m,-d.min.y*m*c,-(d.min.z+f.z/2)*m),t||u.traverse(g=>{g.isMesh&&(g.material=[].concat(g.material).map(p=>{const x=p.clone();return x.color=x.color.clone().multiply(s),x}).reduce((p,x,T,v)=>v.length===1?x:v))});const _=new Nt;return _.add(u),_.rotation.y=h,i.add(_),_};if(e==="town")a(n["bld_2Story_GableRoof_Mat.glb"],1.9);else if(e==="cave"){a(n["grave/crypt.glb"],2);const o=new $e(new us(.36,24),new Ct({color:t?Oe("#7ae8ff").multiplyScalar(2.2):Oe("#ff3030").multiplyScalar(1.6),transparent:!0,opacity:.85}));o.position.set(0,.45,.78),o.userData.ownGeo=o.userData.ownMat=!0,i.add(o)}else if(e==="tower"){a(n["bld_2Story_Slim_Mat.glb"],1.4,1.7);const o=new $e(new bs(.16,16,12),new Ct({color:Oe(t?"#7cff9a":"#ff4040").multiplyScalar(3)}));o.position.y=3.2,o.userData.ownGeo=o.userData.ownMat=!0,o.userData.pulse=!0,i.add(o)}else{const o=Oe(t?"#46e6ff":"#ff5a5a"),l=new $e(new Gl(.4,.06,12,40),new nn({color:o,emissive:o,emissiveIntensity:2.2,roughness:.3}));l.position.y=.55,l.userData.spin=1.5;const c=new $e(new us(.36,32),new Ct({color:o.clone().multiplyScalar(1.4),transparent:!0,opacity:.35,side:Rt,depthWrite:!1}));c.position.y=.55,c.userData.spin=-2.5;const h=new $e(new zl(.5,.58,.08,32),new nn({color:Oe("#3a3f52"),roughness:.5,metalness:.3}));h.position.y=.04,h.receiveShadow=!0;for(const u of[l,c,h])u.userData.ownGeo=u.userData.ownMat=!0,i.add(u);i.userData.face=[l,c]}return i}brightClone(e,t){if(!e.bright){e.bright=e.scene.clone();const n=new ue,i=new ue;Oe(t).getRGB(n,ht),e.bright.traverse(s=>{s.isMesh&&(s.material=[].concat(s.material).map(a=>{const o=a.clone();o.color.getRGB(i,ht);const l=c=>Math.min(1,c*1.5+.24*(1-c));return i.setRGB(l(i.r)*n.r,l(i.g)*n.g,l(i.b)*n.b),o.color.setRGB(i.r,i.g,i.b,ht),a.name==="RoofBricks"&&o.color.set("#9c5a46"),o.roughness=.8,o}).reduce((a,o,l,c)=>c.length===1?o:c))})}return e.bright.clone()}async actorHero(e,t=!1){const n=await $t(kh(Ix[e])),i=Wr(n,3*Lx[e]);return this.addBlob(i.root,t?1.1:.9),bn(i,"idle"),i}async actorNpc(e){const t=Ux[e],n=await $t(kh(t[0])),i=Wr(n,3*t[2],t[1]);return this.addBlob(i.root,.9),bn(i,"idle"),i}async actorMonster(e,t){const n=jh[e],i=await $t(Nx(n)),s=Wr(i,n.h*t,n.tint||"#ffffff");return bn(s,"idle"),s}addBlob(e,t){const n=new $e(new Dn(t,t*.8),new Ct({map:Oh(),transparent:!0,depthWrite:!1}));n.rotation.x=-Math.PI/2,n.position.y=.025,n.renderOrder=1,n.userData.ownGeo=n.userData.ownMat=!0,e.add(n)}face(e,t,n,i,s=1){if(!t&&!n)return;let o=Math.atan2(t,n)-e.pivot.rotation.y;o=Math.atan2(Math.sin(o),Math.cos(o)),e.pivot.rotation.y+=o*Math.min(1,i*14*s)}syncDyn(e){const t=this.g.S,n=new Set;for(const o of t.objs){const l="o"+o.uid;n.add(l),this.dyn.has(l)||this.makeObj(l,o)}for(const o of t.roamers){const l="r"+o.uid;if(n.add(l),!this.dyn.has(l)){const m={n:new Nt,k:"roamer",a:null,r:o};this.world.add(m.n),this.dyn.set(l,m),this.actorMonster(o.id,.62).then(_=>{this.dyn.get(l)===m&&(this.addBlob(_.root,.9),bn(_,"walk"),m.a=_,m.n.add(_.root))})}const c=this.dyn.get(l),h=o.pos.x+.5,u=o.pos.y+.5,d=h-c.n.position.x,f=u-c.n.position.z;if(c.n.position.set(h,this.heightAt(h,u),u),c.a){Math.abs(d)+Math.abs(f)>5e-4&&e>0?(this.face(c.a,d,f,e),bn(c.a,"walk")):bn(c.a,"idle");const m=o.stun>0;c.stun!==m&&(c.stun=m,this.setOpacity(c.a.root,m?.45:1))}}for(const[o,l]of this.dyn){if(l.k==="portal"){const c=po(t,l.p);if(c!==l.open){const h=this.makePortal(l.kind,c,l.models);h.position.copy(l.n.position),this.world.remove(l.n),this.world.add(h);for(const u of this.labels)u.node===l.n&&(u.node=h);l.n=h,l.open=c}continue}n.has(o)||(this.dyn.delete(o),l.k==="obj"&&(l.o.t==="chest"||l.o.t==="gate")?this.dying.push({...l,life:0}):this.world.remove(l.n))}const i=t.party[0]?t.party[0].id:"andrew";if(this.playerLead!==i){this.playerLead=i,this.player&&this.world.remove(this.player.root);const o={root:new Nt,a:null};this.player=o,this.world.add(o.root),this.actorHero(i).then(l=>{this.player===o&&(o.a=l,o.root.add(l.root),l.pivot.rotation.y=Math.atan2(t.face.x,t.face.y))})}const s=t.ppos.x+.5,a=t.ppos.y+.5;this.player.root.position.set(s,this.heightAt(s,a),a),this.player.a&&(this.face(this.player.a,t.face.x,t.face.y,e),bn(this.player.a,t.moving?"walk":"idle"))}setOpacity(e,t){e.traverse(n=>{if(!(!n.isMesh||n.material.map===Oh()))for(const i of[].concat(n.material))i.transparent=t<1,i.opacity=t,i.depthWrite=t>=1})}makeObj(e,t){const n=t.d,i={n:new Nt,k:"obj",o:t,a:null};i.n.position.set(t.x+.5,this.heightAt(t.x+.5,t.y+.5),t.y+.5),this.world.add(i.n),this.dyn.set(e,i);const s=()=>this.dyn.get(e)===i;t.t==="npc"?n.kind==="heal"?$t("town/fountain-round.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.setScalar(.5),i.n.add(o);const l=new $e(new us(.4,32),new nn({color:Oe("#4ab8ff"),emissive:Oe("#2a90ff"),emissiveIntensity:1.4,roughness:.1,transparent:!0,opacity:.85}));l.rotation.x=-Math.PI/2,l.position.y=.12,l.userData.ownGeo=l.userData.ownMat=!0,i.n.add(l);const c=new Kn(Oe("#6ac8ff"),3,3.5,1.6);c.position.y=.7,i.n.add(c),i.fountain=!0}):this.actorNpc(n.kind).then(a=>{s()&&(i.a=a,i.n.add(a.root))}):t.t==="chest"?$t("dungeon/chest.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.setScalar(1.7),o.rotation.y=Math.PI,i.n.add(o),i.lid=o.getObjectByName("lid"),this.addBlob(i.n,1),n.kind==="key"&&$t("dungeon/key.glb").then(l=>{if(!s())return;const c=l.scene.clone();c.scale.setScalar(1.4),c.position.y=1.2,c.traverse(h=>{h.isMesh&&(h.material=h.material.clone(),h.material.emissive=Oe("#ffb020"),h.material.emissiveIntensity=.8)}),i.n.add(c),i.spin=c})}):t.t==="gate"?$t("dungeon/gate.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.set(1.35,1.6,1.35),o.rotation.y=Math.PI/2,i.n.add(o),i.door=o.getObjectByName("door")}):t.t==="boss"&&this.actorMonster(n.id,1).then(a=>{if(!s())return;i.a=a,i.n.add(a.root),this.addBlob(a.root,2.4);const o=new $e(new va(.9,1.15,48),new Ct({color:Oe("#ff3040").multiplyScalar(2.5),transparent:!0,opacity:.6,side:Rt,depthWrite:!1}));o.rotation.x=-Math.PI/2,o.position.y=.04,o.userData.ownGeo=o.userData.ownMat=!0,i.n.add(o),i.ring=o})}shake(e){this.g.mode===2?this.battle.shakeT=Math.max(this.battle.shakeT||0,e):this.shakeT=Math.max(this.shakeT,e)}screenPos(e,t,n){const i=this.battle.pos(e,t,n);return i?this.project(i):null}battleBegin(e,t,n,i){return this.battle.begin(e,t,n,i)}battleCap(e,t){this.battle.capsule(e,t)}async actorCapsule(e){const t=wn[e.id].forms[e.form],n=await $t(`mon_${t.model}.glb`),i=Wr(n,t.h,t.tint);return this.addBlob(i.root,t.h),bn(i,"idle"),i}battleEnd(){this.battle.end(),this.renderer.toneMappingExposure=dl[this.theme||"town"].expo}battleHero(e,t,n){this.battle.hero(e,t,n)}battleEnemy(e,t,n){this.battle.enemy(e,t,n)}battleEnemyDown(e){this.battle.enemyDown(e)}battleFx(e,t,n){this.battle.fxAt(e,t,n)}fxWorld(e,t){if(e==="heal"){const n=this.g.S.objs.find(i=>i.t==="npc"&&i.d.kind==="heal");n&&this.fx.burst(new P(n.x+.5,.6,n.y+.5),"#7ad8ff",60,2.2,1.4,-1.5,.12,this.world),this.player&&this.fx.burst(this.player.root.position.clone().add(new P(0,.8,0)),"#8affb0",40,1.2,1.2,-1.2,.1,this.world)}}frame(e){this.t+=e,Ku.t.value=this.t;const t=this.g,n=t.mode;if(this.setMode(n),n===2){this.battle.update(e),this.render(this.battle.scene);return}const i=t.S;if(this.built!==i.mapId+"|"+this.qi&&this.build(),this.terrain&&!this.building){this.syncDyn(e);for(const s of this.dyn.values()){if(s.a?.mixer?.update(e),s.spin&&(s.spin.rotation.y+=e*2,s.spin.position.y=1.2+Math.sin(this.t*2.5)*.08),s.ring&&(s.ring.material.opacity=.4+Math.sin(this.t*4)*.2),s.k==="portal"&&s.n.traverse(a=>{a.userData.spin&&(a.rotation.z+=e*a.userData.spin),a.userData.pulse&&a.scale.setScalar(1+Math.sin(this.t*5)*.2)}),s.k==="obj"&&s.o.t==="npc"&&s.a&&this.player){const a=this.player.root.position,o=s.n.position,l=Math.hypot(a.x-o.x,a.z-o.z);this.face(s.a,l<2.6?a.x-o.x:0,l<2.6?a.z-o.z:1,e,.4)}if(s.k==="portal"&&s.n.userData.face)for(const a of s.n.userData.face)a.lookAt(this.camera.position.x,a.getWorldPosition(new P).y,this.camera.position.z),a.rotateZ(this.t*(a.userData.spin||1))}for(const s of this.dying)s.life+=e,s.lid&&(s.lid.rotation.x=-Math.min(1,s.life*3)*1.9),s.door&&(s.door.position.y=-Math.min(1,s.life*1.2)*.8),s.spin&&(s.spin.position.y=1.2+s.life*1.5,s.spin.rotation.y+=e*8),!s.burst&&s.life>.15&&(s.burst=!0,this.fx.burst(s.n.position.clone().add(new P(0,.6,0)),s.o.t==="gate"?"#ffd27a":"#ffe27a",40,2,1,-2,.09,this.world)),s.life>1.4&&s.n.scale.setScalar(Math.max(.001,1-(s.life-1.4)*3));this.dying=this.dying.filter(s=>s.life>1.8?(this.world.remove(s.n),!1):!0),this.player?.a?.mixer?.update(e),this.liquid&&(this.liquid.uniforms.t.value=this.t),this.updateCamera(e,n===0),this.playerLight&&this.player&&this.playerLight.position.copy(this.player.root.position).add(new P(0,1.6,.4)),this.particles&&(this.particles.material.uniforms.t.value=this.t,this.particles.material.uniforms.center.value.copy(this.camTarget),this.particles.material.uniforms.scale.value=this.H*.9)}this.fx.update(e),this.render(this.world)}updateCamera(e,t){const n=this.g.S,i=this.camera;if(t){const D=this.t*.08,E=new P(n.mw/2,.5,n.mh/2+.5);this.camTarget.copy(E),i.position.set(E.x+Math.sin(D)*12,7.5,E.z+Math.cos(D)*12),i.lookAt(E),this.placeSun(this.world,E);return}const s=n.ppos,a=this.cine,o=a?new P(a.x,a.h??.9,a.z):new P(s.x+.5,this.heightAt(s.x+.5,s.y+.5)+.9,s.y+.5);this.camKeys&&(this.camYawT+=this.camKeys*e*2.2);let c=(a&&a.yaw!==void 0?a.yaw:this.camYawT)-this.camYaw;c=Math.atan2(Math.sin(c),Math.cos(c));const h=Math.min(1,e*(a?2.2:8));this.camYaw+=c*h;const u=Wh[this.camZoom],d=a?a.pitch??.32:u[0],f=a?a.dist??6:u[1],m=(D,E)=>{const A=Math.sin(this.camYaw)*Math.cos(D),w=Math.cos(this.camYaw)*Math.cos(D),M=Math.sin(D);for(let y=.6;y<E;y+=.25)if(o.y+M*y<this.obstacleAt(o.x+A*y,o.z+w*y)+.25)return y;return 0};let _=d,g=f;if(!a){for(let E=d;E<=1.25&&(_=E,!!m(E,f));E+=.08);const D=m(_,f);D&&(g=Math.max(1.6,D-.35))}this.camPitch+=(_-this.camPitch)*Math.min(1,e*5);const p=Math.sin(this.camYaw)*Math.cos(this.camPitch),x=Math.cos(this.camYaw)*Math.cos(this.camPitch),T=Math.sin(this.camPitch);this.camInit?(this.camTarget.lerp(o,Math.min(1,e*(a?2.5:9))),this.camD+=(g-this.camD)*Math.min(1,e*(g<this.camD?14:3))):(this.camTarget.copy(o),this.camD=g,this.camInit=!0),i.position.set(this.camTarget.x+p*this.camD,this.camTarget.y+T*this.camD,this.camTarget.z+x*this.camD);const v=this.heightAt(i.position.x,i.position.z)+.35;i.position.y<v&&(i.position.y=v),this.shakeT>0&&(this.shakeT-=e,i.position.x+=(Math.random()-.5)*.15,i.position.y+=(Math.random()-.5)*.1),i.lookAt(this.camTarget.x,this.camTarget.y+.25,this.camTarget.z),this._sunC=(this._sunC||new P).set(this.camTarget.x-p*5,0,this.camTarget.z-x*5),this.placeSun(this.world,this._sunC)}obstacleAt(e,t){const n=this.g.S,i=Math.floor(e),s=Math.floor(t);if(i<0||s<0||i>=n.mw||s>=n.mh)return n.map.world||n.map.town?-1:1.3;const a=n.map.rows[s][i],o=this.heightAt(e,t);return a==="#"?1.3:"hHDSM".includes(a)?3.2:a==="T"?o+1.6:o}camQuad(){return(Math.round(this.camYaw/(Math.PI/2))%4+4)%4}rotateCam(e){this.camYawT+=e}zoomCam(e){this.camZoom=Math.max(0,Math.min(Wh.length-1,this.camZoom+e)),this.onCam?.()}render(e){this.composer?(this.renderPass.scene=e,this.renderPass.camera=this.camera,this.gtao&&(this.gtao.scene=e,this.gtao.camera=this.camera),this.composer.render()):this.renderer.render(e,this.camera)}project(e){const t=e.clone().project(this.camera);return{x:(t.x*.5+.5)*this.W,y:(-t.y*.5+.5)*this.H,vis:t.z<1&&t.z>-1}}watchFps(e,t){if(!t&&(this.fpsT+=e,this.fpsN++,this.fpsT>=2)){const n=this.fpsN/this.fpsT;this.fpsT=0,this.fpsN=0,this.lowFor=n<40?this.lowFor+1:0,this.lowFor>=2&&this.qi>0&&(this.lowFor=0,this.setQuality(this.qi-1),this.onQuality?.(this.qi))}}}function Kx(r){try{const e=new DataView(r.buffer,r.byteOffset,r.byteLength);let t=4;const n=()=>{const o=e.getUint32(t,!0);return t+=4,o},i=()=>{const o=e.getInt32(t,!0);return t+=4,o},s=(o=0)=>{if(o>16)throw new Error("tief");const l=n(),c=l&255,h=l>>16&1;switch(c){case 0:return null;case 1:return n()!==0;case 2:{if(h){const u=Number(e.getBigInt64(t,!0));return t+=8,u}return i()}case 3:{if(h){const d=e.getFloat64(t,!0);return t+=8,d}const u=e.getFloat32(t,!0);return t+=4,u}case 4:case 21:{const u=n(),d=new TextDecoder().decode(new Uint8Array(r.buffer,r.byteOffset+t,u));return t+=u+(4-u%4)%4,d}case 5:{const u=e.getFloat32(t,!0),d=e.getFloat32(t+4,!0);return t+=8,{x:u,y:d}}case 6:{const u=i(),d=i();return{x:u,y:d}}case 27:{const u=n()&2147483647,d={};for(let f=0;f<u;f++){const m=s(o+1);d[String(m)]=s(o+1)}return d}case 28:{const u=n()&2147483647,d=[];for(let f=0;f<u;f++)d.push(s(o+1));return d}default:throw new Error("Typ "+c)}},a=s();return!a||!Array.isArray(a.party)||!a.map?null:{v:2,party:a.party,inv:a.inv||{},gold:a.gold|0,gear:a.gear|0,flags:a.flags||{},map:a.map,gp:a.gp,t:+a.t||0}}catch{return null}}function Zx(){return new Promise(r=>{if(typeof indexedDB>"u")return r(null);let e;try{e=indexedDB.open("/userfs")}catch{return r(null)}e.onupgradeneeded=()=>{try{e.transaction.abort()}catch{}r(null)},e.onerror=()=>r(null),e.onsuccess=()=>{const t=e.result;if(!t.objectStoreNames.contains("FILE_DATA"))return t.close(),r(null);let n=null;const i=t.transaction("FILE_DATA","readonly").objectStore("FILE_DATA").openCursor();i.onsuccess=()=>{const s=i.result;if(!s)return t.close(),r(n);typeof s.key=="string"&&/anmacha_quest2\.save$/.test(s.key)&&s.value&&s.value.contents&&(n=Kx(new Uint8Array(s.value.contents))),s.continue()},i.onerror=()=>{t.close(),r(n)}}})}const Yt=r=>440*Math.pow(2,(r-69)/12),Qx={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],hmin:[0,2,3,5,7,8,11],lyd:[0,2,4,6,7,9,11]},Jx={title:{bpm:76,root:50,sc:"min",prog:[0,5,2,6,0,3,4,4],lead:"horn",pad:"str",arp:"harp",drums:"epic",choir:!0,seed:11,dens:.55},intro:{bpm:64,root:48,sc:"min",prog:[0,5,3,4],lead:"flute",pad:"str",arp:"harp",drums:"",choir:!0,seed:3,dens:.4},town:{bpm:96,root:55,sc:"maj",prog:[0,3,4,0,5,3,1,4],lead:"flute",pad:"str",arp:"harp",drums:"light",seed:21,dens:.7},world:{bpm:112,root:53,sc:"maj",prog:[0,4,5,3,0,4,3,4],lead:"horn",pad:"str",arp:"pluck",drums:"march",seed:7,dens:.75},rap:{bpm:84,root:45,sc:"dor",prog:[0,0,6,6,5,5,4,4],lead:"bell",pad:"pad",arp:"pluck",drums:"deep",seed:31,dens:.45},schlager:{bpm:100,root:57,sc:"lyd",prog:[0,1,0,4,5,1,4,4],lead:"flute",pad:"str",arp:"harp",drums:"light",seed:41,dens:.6},xmas:{bpm:72,root:52,sc:"min",prog:[0,5,3,4,0,5,6,4],lead:"bell",pad:"pad",arp:"harp",drums:"",choir:!0,seed:51,dens:.45},rock:{bpm:132,root:45,sc:"hmin",prog:[0,0,5,4,0,0,5,4],lead:"horn",pad:"str",arp:"ostinato",drums:"drive",seed:61,dens:.6},tower:{bpm:70,root:47,sc:"hmin",prog:[0,1,0,4,5,1,4,4],lead:"choirlead",pad:"pad",arp:"bell",drums:"deep",choir:!0,seed:71,dens:.4},battle:{bpm:150,root:50,sc:"min",prog:[0,6,5,4,0,6,3,4],lead:"horn",pad:"str",arp:"ostinato",drums:"drive",seed:81,dens:.8},boss:{bpm:140,root:46,sc:"hmin",prog:[0,0,5,5,3,3,4,4],lead:"horn",pad:"str",arp:"ostinato",drums:"epic",choir:!0,seed:91,dens:.75},final:{bpm:148,root:47,sc:"hmin",prog:[0,1,5,4,0,1,3,4],lead:"horn",pad:"str",arp:"ostinato",drums:"epic",choir:!0,seed:97,dens:.85},ending:{bpm:80,root:53,sc:"maj",prog:[0,4,5,3,0,4,3,4],lead:"flute",pad:"str",arp:"harp",drums:"light",choir:!0,seed:101,dens:.6}};function ey(r){let e=r>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function ty(r){const e=ey(r.seed),t=[[0,4,6,8,12],[0,3,4,8,10,12],[0,6,8,14],[0,2,4,8,12,14],[0,8,12],[0,4,8,10]],n=l=>{const c=[];for(let h=0;h<2;h++){const u=t[Math.floor(e()*t.length)];let d=h===0?[0,2,4][Math.floor(e()*3)]:[1,2,3][Math.floor(e()*3)];u.forEach((f,m)=>{const _=(u[m+1]??16)-f;e()>r.dens+.3&&m>0||(c.push({st:h*16+f,deg:d+l,len:_}),d+=[-1,1,1,2,-2,0][Math.floor(e()*6)])})}return c},i=n(0),s=n(2),a=[],o=(l,c,h)=>l.forEach(u=>a.push({st:c*16+u.st,deg:u.deg+h,len:u.len}));return o(i,0,0),o(i,2,1),o(s,4,0),o(i,6,-1),a}class ny{constructor(){this.ctx=null,this.on=!0,this.cur=null,this.want=null,this.vol=.8}unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}const e=window.AudioContext||window.webkitAudioContext;if(!e)return;const t=this.ctx=new e;this.master=t.createGain(),this.master.gain.value=this.on?this.vol:0;const n=t.createDynamicsCompressor();n.threshold.value=-16,n.ratio.value=3,this.master.connect(n).connect(t.destination),this.mus=t.createGain(),this.mus.gain.value=.55,this.mus.connect(this.master),this.sfxG=t.createGain(),this.sfxG.gain.value=.7,this.sfxG.connect(this.master);const i=t.sampleRate*2.6,s=t.createBuffer(2,i,t.sampleRate);for(let o=0;o<2;o++){const l=s.getChannelData(o);for(let c=0;c<i;c++)l[c]=(Math.random()*2-1)*Math.pow(1-c/i,3.2)}this.rev=t.createConvolver(),this.rev.buffer=s,this.revG=t.createGain(),this.revG.gain.value=.32,this.rev.connect(this.revG).connect(this.master),this.noise=t.createBuffer(1,t.sampleRate,t.sampleRate);const a=this.noise.getChannelData(0);for(let o=0;o<a.length;o++)a[o]=Math.random()*2-1;if(this.timer=setInterval(()=>this.pump(),25),this.want){const o=this.want;this.want=null,this.music(o)}}setOn(e){this.on=e,this.master&&this.master.gain.setTargetAtTime(e?this.vol:0,this.ctx.currentTime,.1)}music(e){if(this.want===e&&(this.cur?.key===e||!this.ctx)||(this.want=e,!this.ctx))return;const t=this.ctx.currentTime;if(this.cur){const s=this.cur;s.out.gain.setTargetAtTime(0,t,.35),s.stop=!0,setTimeout(()=>s.out.disconnect(),2500)}this.cur=null;const n=Jx[e];if(!n)return;const i=this.ctx.createGain();i.gain.value=0,i.gain.setTargetAtTime(1,t+.15,.4),i.connect(this.mus),this.cur={key:e,tr:n,out:i,step:0,next:t+.2,mel:ty(n),sec:60/n.bpm/4}}pump(){const e=this.cur,t=this.ctx;if(!(!e||e.stop||t.state!=="running"))for(;e.next<t.currentTime+.12;)this.stepAt(e,e.step,e.next),e.step++,e.next+=e.sec}chord(e,t){const n=Qx[e.sc],i=e.prog[t%e.prog.length],s=a=>{const o=Math.floor(a/7);return e.root+n[(a%7+7)%7]+12*o};return{d:i,notes:[s(i),s(i+2),s(i+4)],pc:s}}stepAt(e,t,n){const i=e.tr,s=t%16,a=Math.floor(t/16),o=i.prog.length,l=this.chord(i,a),c=e.sec,h=e.out;if(s===0){for(const m of l.notes)this.voice(i.pad,Yt(m),n,c*16,.07,h);this.voice("bass",Yt(l.notes[0]-12),n,c*8,.22,h),i.choir&&a%2===0&&this.voice("choir",Yt(l.notes[2]),n,c*30,.05,h)}s===8&&this.voice("bass",Yt(l.notes[a%2?1:0]-12),n,c*7,.16,h);const u=i.arp;if(u==="harp"&&s%2===0){const m=[0,1,2,1,2,0,1,2][s/2%8];this.voice("harp",Yt(l.notes[m]+12),n,c*3,.07,h)}if(u==="pluck"&&[0,3,6,8,11,14].includes(s)&&this.voice("pluck",Yt(l.notes[s%3]+12),n,c*2,.07,h),u==="bell"&&s%4===2&&this.voice("bell",Yt(l.notes[(s/4|0)%3]+24),n,c*6,.035,h),u==="ostinato"){const m=[0,0,1,0,2,0,1,0][s%8];this.voice("ost",Yt(l.notes[m]),n,c*.9,.06,h)}const d=Math.floor(a/8);if(d%3!==2){const m=a%8*16+s;for(const _ of e.mel)if(_.st===m){const g=this.chord(i,Math.floor(_.st/16)),p=g.pc(_.deg+g.d)+12;this.voice(i.lead,Yt(p),n,c*Math.max(1,_.len)*.95,.12,h),d%3===1&&i.lead!=="flute"&&this.voice("flute",Yt(p+12),n,c*Math.max(1,_.len)*.9,.04,h)}}const f=i.drums;f==="epic"?((s===0||s===10)&&this.drum("timp",n,.5,Yt(l.notes[0]-24)),s===8&&this.drum("snare",n,.18),a%o===o-1&&s>=12&&this.drum("timp",n,.3,Yt(l.notes[0]-24))):f==="drive"?(s%4===0&&this.drum("kick",n,.5),(s===4||s===12)&&this.drum("snare",n,.28),s%2===0&&this.drum("hat",n,.06),s===0&&a%4===0&&this.drum("crash",n,.12)):f==="march"?((s===0||s===8)&&this.drum("kick",n,.35),(s===4||s===12||s===14)&&this.drum("snare",n,.14),s%2===0&&this.drum("hat",n,.035)):f==="light"?(s===0&&this.drum("kick",n,.22),s%4===2&&this.drum("hat",n,.04),s===12&&this.drum("snare",n,.06)):f==="deep"&&(s===0&&this.drum("timp",n,.3,Yt(l.notes[0]-24)),s===6&&a%2&&this.drum("kick",n,.2))}env(e,t,n,i,s,a=.25){e.gain.setValueAtTime(1e-4,t),e.gain.linearRampToValueAtTime(s,t+n),e.gain.setValueAtTime(s,t+Math.max(n,i)),e.gain.exponentialRampToValueAtTime(1e-4,t+Math.max(n,i)+a)}osc(e,t,n,i,s,a=0){const o=this.ctx.createOscillator();return o.type=e,o.frequency.value=t,o.detune.value=a,o.connect(s),o.start(n),o.stop(i+.4),o}voice(e,t,n,i,s,a){const o=this.ctx,l=o.createGain(),c=n+i,h=o.createGain();h.gain.value=e==="bass"||e==="ost"?.1:.5,l.connect(a),l.connect(h),h.connect(this.rev);const u=o.createBiquadFilter();switch(u.type="lowpass",u.connect(l),e){case"str":case"pad":{u.frequency.value=e==="str"?2400:1100,u.Q.value=.4;for(const d of[-8,0,7])this.osc("sawtooth",t,n,c+.6,u,d);this.env(l,n,e==="str"?.35:.6,i,s,.7);break}case"choir":{const d=o.createBiquadFilter();d.type="bandpass",d.frequency.value=900,d.Q.value=1.5,d.connect(l);for(const f of[-12,0,11])this.osc("sawtooth",t,n,c+1,d,f);this.env(l,n,1.2,i,s*1.4,1.2),u.disconnect();break}case"horn":{u.frequency.setValueAtTime(500,n),u.frequency.linearRampToValueAtTime(2600,n+.08),u.frequency.exponentialRampToValueAtTime(1300,n+.4);const d=this.osc("sawtooth",t,n,c,u);this.osc("square",t/2,n,c,u).detune.value=4;const f=o.createOscillator(),m=o.createGain();f.frequency.value=5.2,m.gain.setValueAtTime(0,n),m.gain.linearRampToValueAtTime(t*.006,n+.4),f.connect(m).connect(d.frequency),f.start(n),f.stop(c+.1),this.env(l,n,.05,i,s*.8,.18);break}case"flute":case"choirlead":{u.frequency.value=e==="flute"?3200:1400;const d=this.osc(e==="flute"?"triangle":"sawtooth",t,n,c,u),f=o.createOscillator(),m=o.createGain();f.frequency.value=5.5,m.gain.setValueAtTime(0,n),m.gain.linearRampToValueAtTime(t*.008,n+.3),f.connect(m).connect(d.frequency),f.start(n),f.stop(c+.1),this.env(l,n,.06,i,s*(e==="flute"?1.3:.7),.2);break}case"harp":case"pluck":{u.frequency.setValueAtTime(e==="harp"?4e3:2400,n),u.frequency.exponentialRampToValueAtTime(600,n+.5),this.osc(e==="harp"?"triangle":"sawtooth",t,n,n+1.2,u),l.gain.setValueAtTime(s,n),l.gain.exponentialRampToValueAtTime(1e-4,n+(e==="harp"?1.1:.4));break}case"bell":{u.frequency.value=6e3,this.osc("sine",t,n,n+2.5,u);const d=o.createGain();d.gain.value=.35,d.connect(u),this.osc("sine",t*2.76,n,n+1.2,d),l.gain.setValueAtTime(s*2,n),l.gain.exponentialRampToValueAtTime(1e-4,n+2.4);break}case"ost":{u.frequency.setValueAtTime(1800,n),u.frequency.exponentialRampToValueAtTime(400,n+.12),this.osc("sawtooth",t,n,c,u),l.gain.setValueAtTime(s,n),l.gain.exponentialRampToValueAtTime(1e-4,c+.05);break}case"bass":{u.frequency.value=420,this.osc("sawtooth",t,n,c,u),this.osc("sine",t/2,n,c,u),this.env(l,n,.02,i,s,.15);break}}}drum(e,t,n,i){const s=this.ctx,a=s.createGain(),o=this.cur?this.cur.out:this.sfxG;if(a.connect(o),e==="kick"||e==="timp"){const u=s.createOscillator();u.type="sine";const d=e==="kick"?120:i*2,f=e==="kick"?42:i;if(u.frequency.setValueAtTime(d,t),u.frequency.exponentialRampToValueAtTime(f,t+(e==="kick"?.12:.2)),u.connect(a),u.start(t),u.stop(t+1.2),a.gain.setValueAtTime(n,t),a.gain.exponentialRampToValueAtTime(1e-4,t+(e==="kick"?.35:1.1)),e==="timp"){const m=s.createGain();m.gain.value=.4,a.connect(m),m.connect(this.rev)}return}const l=s.createBufferSource();l.buffer=this.noise;const c=s.createBiquadFilter();c.type=e==="hat"||e==="crash"?"highpass":"bandpass",c.frequency.value=e==="hat"?7e3:e==="crash"?4e3:1800,l.connect(c).connect(a);const h=e==="hat"?.05:e==="crash"?1.4:.18;if(a.gain.setValueAtTime(n,t),a.gain.exponentialRampToValueAtTime(1e-4,t+h),l.start(t),l.stop(t+h+.05),e==="snare"){const u=s.createGain();u.gain.value=.3,a.connect(u),u.connect(this.rev)}}sfx(e){if(!this.ctx||this.ctx.state!=="running")return;const t=this.ctx,n=t.currentTime+.01,i=this.sfxG,s=(l,c,h,u,d)=>{const f=t.createGain();f.connect(i);const m=t.createOscillator();m.type=l,m.frequency.setValueAtTime(c,n),m.frequency.exponentialRampToValueAtTime(h,n+u),m.connect(f),m.start(n),m.stop(n+u+.05),f.gain.setValueAtTime(d,n),f.gain.exponentialRampToValueAtTime(1e-4,n+u)},a=(l,c,h,u="bandpass")=>{const d=t.createGain();d.connect(i);const f=t.createBufferSource();f.buffer=this.noise;const m=t.createBiquadFilter();m.type=u,m.frequency.value=l,f.connect(m).connect(d),f.start(n),f.stop(n+c+.05),d.gain.setValueAtTime(h,n),d.gain.exponentialRampToValueAtTime(1e-4,n+c)},o=(l,c,h="triangle",u=.15)=>l.forEach((d,f)=>{const m=t.createGain();m.connect(i);const _=t.createGain();_.gain.value=.5,m.connect(_),_.connect(this.rev);const g=t.createOscillator();g.type=h,g.frequency.value=Yt(d),g.connect(m);const p=n+f*c;g.start(p),g.stop(p+.6),m.gain.setValueAtTime(u,p),m.gain.exponentialRampToValueAtTime(1e-4,p+.55)});switch(e){case"move":s("triangle",880,990,.05,.05);break;case"ok":s("triangle",990,1480,.08,.08);break;case"cancel":s("triangle",660,440,.09,.07);break;case"hit":a(1200,.12,.35),s("square",220,80,.1,.08);break;case"slash":a(3e3,.16,.3,"highpass");break;case"heavy":a(600,.3,.5),s("sine",160,40,.3,.3);break;case"magic":o([84,88,91,96],.04,"sine",.08),a(5e3,.4,.06,"highpass");break;case"heal":o([72,76,79,84,88],.06,"sine",.09);break;case"chest":o([67,72,76,79,84],.07,"triangle",.12);break;case"door":s("sawtooth",90,60,.5,.12),a(300,.5,.15);break;case"step":a(500,.04,.03,"lowpass");break;case"encounter":o([62,65,69,74,77,81],.035,"sawtooth",.06);break;case"victory":o([67,67,67,72,79,76,79,84],.11,"square",.07);break;case"levelup":o([72,76,79,84,79,84,88],.07,"triangle",.12);break;case"special":o([60,67,72,79,84,91],.05,"sawtooth",.07),a(800,.6,.2);break}}}const Cn=r=>document.getElementById(r),ua=new URLSearchParams(location.search),gi={get(r){try{return localStorage.getItem(r)}catch{return null}},set(r,e){try{localStorage.setItem(r,e)}catch{}},has(r){try{return localStorage.getItem(r)!==null}catch{return!1}}};function Qu(r){console.error(r);const e=Cn("lerr");e.style.display="block",e.textContent="Fehler beim Start: "+(r&&r.message?r.message:String(r)),Cn("ltxt").textContent="Das Spiel konnte nicht starten.",Cn("load").classList.remove("out")}addEventListener("error",r=>{Ju||Qu(r.error||r.message)});let Ju=!1;const pl="anmachaQuest_cfg";let Ii={};try{Ii=JSON.parse(gi.get(pl))||{}}catch{}const iy=matchMedia("(pointer: coarse)").matches;let sy=ua.has("q")?Math.max(0,Math.min(2,+ua.get("q")|0)):Ii.q??(iy?1:2);const ry=ua.has("q");async function ay(){const r=Cn("cv"),e=document.createElement("canvas");if(!(e.getContext("webgl2")||e.getContext("webgl")))throw new Error("Dein Browser unterstützt kein WebGL.");await oy();const t=new ny;t.on=Ii.music!==!1;const n=()=>t.unlock();addEventListener("pointerdown",n,!0),addEventListener("keydown",n,!0);const i=new Pd(null,null,{store:gi,debug:ua.has("debug"),audio:t});i.onAudio=d=>{Ii.music=d,gi.set(pl,JSON.stringify(Ii))};const s=new Ld(i),a=new $x(r,i,sy);i.ui=s,i.view=a,s.view=a,a.onQuality=d=>{Ii.q=d,gi.set(pl,JSON.stringify(Ii))},window.__quest=i;const o=[...Yx,"hero_Warrior.glb","hero_Wizard.glb","hero_Rogue.glb"];let l=0;Dx(()=>{});const c=a.loadHdr();await Promise.all(o.map(d=>$t(d).then(()=>{l++;const f=Math.round(l/o.length*100);Cn("lfill").style.width=f+"%",Cn("ltxt").textContent=`Lade Spielwelt … ${f} %`}))),await c,Zh(i.S,i.rng,"hub",{x:12,y:12}),i.mode=bt.TITLE,await a.ready(),a.frame(.016),Ju=!0,Cn("load").classList.add("out"),setTimeout(()=>Cn("load").remove(),600),setTimeout(()=>Cn("rot")?.remove(),9e3),ly(i,s);let h=performance.now();const u=d=>{const f=Math.min(.05,(d-h)/1e3);h=d,i.update(f),a.frame(f),s.frame(),a.watchFps(f,ry||document.hidden),requestAnimationFrame(u)};requestAnimationFrame(u),i.showTitle()}const Xh="anmachaQuest_legacy",co=r=>{let e=2166136261;for(let t=0;t<r.length;t++)e^=r.charCodeAt(t),e=Math.imul(e,16777619);return(e>>>0).toString(36)+":"+r.length};async function oy(){const r=await Zx();if(!r)return;const e=JSON.stringify(r),t={src:co(e),save:co(e)};let n=null;try{n=JSON.parse(gi.get(Xh))}catch{}const i=gi.get(Ys);n&&n.src===t.src||i!==null&&(!n||co(i)!==n.save)||(gi.set(Ys,e),gi.set(Xh,JSON.stringify(t)))}const qh={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",Space:"ok",Enter:"ok",NumpadEnter:"ok",KeyZ:"ok",Escape:"cancel",KeyX:"cancel",Backspace:"cancel",KeyM:"menu",Tab:"menu"},Bs={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};function ly(r,e){addEventListener("keydown",t=>{if(t.code==="F8"||t.code==="F9"){r.debugKey(t.code);return}const n=qh[t.code]||(t.key==="Enter"?"ok":t.key==="Escape"?"cancel":null);n&&(t.preventDefault(),Bs[n]&&!t.repeat&&r.pressDir(Bs[n],!0),!(t.repeat&&!Bs[n])&&(e.action(n)||(n==="menu"||t.code==="Escape")&&r.mode===bt.WORLD&&r.openMenu()))}),addEventListener("keyup",t=>{const n=qh[t.code];n&&Bs[n]&&r.pressDir(Bs[n],!1)}),addEventListener("blur",()=>r.clearDirs()),document.addEventListener("visibilitychange",()=>{document.hidden&&r.clearDirs()}),document.addEventListener("contextmenu",t=>t.preventDefault()),cy(r),document.addEventListener("gesturestart",t=>t.preventDefault())}function cy(r){const e=()=>r.view,t=new Set,n=()=>{e().camKeys=(t.has("KeyE")?1:0)-(t.has("KeyQ")?1:0)};addEventListener("keydown",c=>{c.code==="KeyQ"||c.code==="KeyE"?(t.add(c.code),n()):!c.repeat&&(c.code==="KeyR"||c.code==="PageUp")?e().zoomCam(-1):!c.repeat&&(c.code==="KeyF"||c.code==="PageDown")&&e().zoomCam(1)}),addEventListener("keyup",c=>{t.delete(c.code)&&n()}),addEventListener("blur",()=>{t.clear(),n()});const i=Cn("cv"),s=new Map;let a=0;i.addEventListener("pointerdown",c=>{s.set(c.pointerId,{x:c.clientX,y:c.clientY});try{i.setPointerCapture(c.pointerId)}catch{}if(s.size===2){const[h,u]=[...s.values()];a=Math.hypot(h.x-u.x,h.y-u.y)}}),i.addEventListener("pointermove",c=>{const h=s.get(c.pointerId);if(h){if(s.size===1)e().rotateCam(-(c.clientX-h.x)*.008);else if(s.size===2){h.x=c.clientX,h.y=c.clientY;const[u,d]=[...s.values()],f=Math.hypot(u.x-d.x,u.y-d.y);a&&Math.abs(f-a)>60&&(e().zoomCam(f>a?-1:1),a=f);return}h.x=c.clientX,h.y=c.clientY}});const o=c=>{s.delete(c.pointerId),s.size<2&&(a=0)};i.addEventListener("pointerup",o),i.addEventListener("pointercancel",o);let l=0;i.addEventListener("wheel",c=>{c.preventDefault();const h=performance.now();h-l<180||(l=h,e().zoomCam(c.deltaY>0?1:-1))},{passive:!1})}ay().catch(Qu);
