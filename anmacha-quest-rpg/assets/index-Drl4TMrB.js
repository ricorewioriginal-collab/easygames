(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();const lt={welt:{name:"Aetherion",theme:"town",rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~....................................~~","~~..,.,.....,.........................~~","~~.~~~.........TTT.....TTTTTTT........~~","~~..........,TTTTT......TT..TT........~~","~~.TTT.....T.TTT^^......TT..TT........~~","~~.........TTTT^^^..........~~........~~","~~..~~.....TTTTTTTTTT.....T~~~.....TT.~~","~~..~~~~~..TTTTTTT^^^TTTTTT~~~TTTTTTT.~~","~~..~~~~~TTTTT..~~~~~TTT.,T~~~~~~~....~~","~~.......TTTTT,.~~~~~TTT..~~~~~~~~..,.~~","~~.,..,..TTTTT...TT..,....~~~.......,.~~","~~.......TTTTTT..TT,,^^^^^TT~~~~~.....~~","~~..,,^^^TT....,.TT..^^^^^TT~~~~~.....~~","~~.~~~TT,............~~~~~TTTTT^^^^^..~~","~~.,......,....~~~.^^^^^^^^.^^^.....,.~~","~~........TTT..~~~.^^^^.....^TT.......~~","~~........TT~~.........TTT............~~","~~...........TTTTT.....TTT.~~,......,.~~","~~.TT............~.......TTT~.........~~","~~.TTTT^^^...,...,.......TT~~...~~~...~~","~~.TTTT^^^..,,...........TT......,....~~","~~....................................~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"],enc:[],rate:.06,lv:3,world:!0,portals:[{x:20,y:21,to:"hub",req:"",label:"Hafenau",kind:"town",ax:12,ay:13},{x:7,y:18,to:"rap",req:"",label:"Echogruft",kind:"cave",ax:2,ay:14},{x:33,y:18,to:"schlager",req:"boss_rap",label:"Rosenhain",kind:"cave",ax:2,ay:14},{x:8,y:6,to:"xmas",req:"boss_schlager",label:"Frostgrotte",kind:"cave",ax:2,ay:14},{x:32,y:6,to:"rock",req:"boss_xmas",label:"Glutschlund",kind:"cave",ax:2,ay:14},{x:20,y:5,to:"tower",req:"boss_rock",label:"Turm der Stille",kind:"tower",ax:2,ay:14}],npcs:[],chests:[],boss:{}},hub:{name:"Hafenau",theme:"town",rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~","~#....,,..............,.#~","~#,T.....hhhT.hhh....TT.#~","~#TT.....HSH..HDH.,..,T.#~","~#..,.,...p...,p,....,..#~","~#..hhh...p.TT.p..,hhh..#~","~#..HDH,,.p....p...MDM,.#~","~#...p..pppppppppp..p...#~","~#...pppppppppppppppp...#~","~#......pppppppppp.,....#~","~#....T.pppppppppp,T.,..#~","~#..,,..pppppppppp......#~","~#TT........p......,..T.#~","~#.T...T....p,.,..T,,TT,#~","~.......,...p..,.........~","~~~~~~~~~~~~~~~~~~~~~~~~~~"],enc:[],rate:0,lv:1,portals:[{x:12,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:20,ay:22}],npcs:[{x:10,y:5,kind:"shop",name:"Mara"},{x:15,y:9,kind:"heal",name:"Quelle"},{x:12,y:9,kind:"elder",name:"Älteste Ysolde"},{x:8,y:10,kind:"kid",name:"Pip"},{x:17,y:10,kind:"guard",name:"Wache Holm"}],chests:[],boss:{}},rap:{name:"Echogruft",theme:"rap",rows:["##########################","#..........,.,..,...#....#","#..,................#....#","#..,.....,...,...TT.#....#","#........TTT.T.~.~.......#","#,.T.T..T..T.T.~~.~.#....#","#,....TT...,.TTT...,#.,..#","#.........,,..T,....######","#.......TTT......,TTT.TTT#","#..,.TTT..T...,...T......#","#...TT~~.......TTTT.T....#","#..,T~~~~..,TT.~~~TT.....#","#.....~~~TT.T.~~..,......#","#......................,.#","#.....,.............,....#","##########################"],enc:["beatbandit","reimruepel","bassgolem","boombox","graffiti","mikspin"],rate:.075,lv:3,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:7,ay:19}],npcs:[],chests:[{id:"rap_key",x:6,y:5,kind:"key",v:"key_rap",n:1},{id:"rap_c1",x:10,y:6,kind:"item",v:"trank",n:2},{id:"rap_c2",x:15,y:3,kind:"gold",v:70}],gate:{x:20,y:4,key:"key_rap",flag:"gate_rap"},boss:{x:23,y:2,id:"mcdroehn",flag:"boss_rap"}},schlager:{name:"Rosenhain",theme:"schlager",rows:["##########################","#.,,.,,...,.......,.#....#","#...T...T..T.,..,,.,#....#","#..........T........#....#","#..,,...~~~T...T.........#","#....,..~~...,.TTT..#.,.,#","#...TT..T,.....,TT,.#....#","#.TTT.TT..TT,...TTT,######","#.,.,..~~TTTT.T.TTT.TTT,.#","#....,.~~~TTT.T....T.....#","#.TTTTTT,.,~~~~.TTT....,.#","#.TTT.,,..,~~~,.TTT..,...#","#....T..,..T,...,.....,..#","#....T,....,......,.,.,..#","#....,,...,..,..,,..,,...#","##########################"],enc:["gecko","schleim","aal","disco","herz","zuckerg"],rate:.075,lv:8,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:33,ay:19}],npcs:[],chests:[{id:"schlager_key",x:22,y:13,kind:"key",v:"key_schlager",n:1},{id:"schlager_c1",x:15,y:8,kind:"item",v:"trank",n:2},{id:"schlager_c2",x:2,y:1,kind:"gold",v:120}],gate:{x:20,y:4,key:"key_schlager",flag:"gate_schlager"},boss:{x:23,y:2,id:"koenigin",flag:"boss_schlager"}},xmas:{name:"Frostgrotte",theme:"xmas",rows:["##########################","#...................#....#","#....TTT......TTT...#....#","#..T.TTT......T~~~~.#....#","#.....TTTT...~~~~.,......#","#...TTTTTTT..~~~....#....#","#......T....TTTT...T#....#","#.,,........TTTTT.TT######","#.TTT..,.....,~~~..TTTT,.#","#.TTT.....~~~~~~~..T~~~..#","#..,.TTTT.~~~~......~~...#","#...TT...............TTT.#","#....TT...........TTTTTT.#","#....TT............T.....#","#...................,....#","##########################"],enc:["geist","lebkuchen","schneemann","eisratte","eisspin","zwerg"],rate:.075,lv:13,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:8,ay:7}],npcs:[],chests:[{id:"xmas_key",x:7,y:8,kind:"key",v:"key_xmas",n:1},{id:"xmas_c1",x:23,y:8,kind:"item",v:"trank",n:2},{id:"xmas_c2",x:8,y:3,kind:"gold",v:170}],gate:{x:20,y:4,key:"key_xmas",flag:"gate_xmas"},boss:{x:23,y:2,id:"frostmod",flag:"boss_xmas"}},rock:{name:"Glutschlund",theme:"rock",rows:["##########################","#.....,.,...........#....#","#.T,T......TTTTT..TT#....#","#.TTT~~~.,.T~~T...T.#....#","#.T..~~T,...~~...........#","#.T............T..~.#....#","#..TTT.TT......T..~~#...,#","#.TT.T,TTTT...T.....######","#,TT.T..T~~.~~~TT........#","#....TT..~~~~~~TT.TT.....#","#....TT...........TT.....#","#..T.........,,,..~~~....#","#....TT......T....~~T.,..#","#.....T.,................#","#........,...............#","##########################"],enc:["gargoyle","mole","verstaerker","rifffled","daemon","roadie"],rate:.075,lv:18,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:32,ay:7}],npcs:[],chests:[{id:"rock_key",x:18,y:8,kind:"key",v:"key_rock",n:1},{id:"rock_c1",x:11,y:6,kind:"item",v:"trank",n:2},{id:"rock_c2",x:20,y:13,kind:"gold",v:220}],gate:{x:20,y:4,key:"key_rock",flag:"gate_rock"},boss:{x:23,y:2,id:"riff",flag:"boss_rock"}},tower:{name:"Turm der Stille",theme:"static",rows:["##########################","#,..................#....#","#,...TTTTTT......T..#....#","#...TT....,......T..#....#","#...TT~....TTT...........#","#.....~~.........TT.#....#","#,..,T.T...~~.....T,#....#","#........T~~~.TT..,.######","#,...TTTTTT...TT.......T.#","#....TT~~~..T.,,.T....TT.#","#...TTT~~~~T....TT,~~~,..#","#..TTT,..TTT....,.T~..T.T#","#.......TTT.TT........,..#","#........................#","#.....,..,.......,.......#","##########################"],enc:["schemen","stoersignal","kreischer","antspin","rausritter","zyklop"],rate:.075,lv:23,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:20,ay:6}],npcs:[],chests:[{id:"tower_key",x:16,y:14,kind:"key",v:"key_tower",n:1},{id:"tower_c1",x:15,y:9,kind:"item",v:"trank",n:2},{id:"tower_c2",x:16,y:4,kind:"gold",v:270}],gate:{x:20,y:4,key:"key_tower",flag:"gate_tower"},boss:{x:23,y:2,id:"rauschen",flag:"boss_tower"}}},Fi={andrew:{name:"Aren",col:"#3a9bff",hair:"#5a3a1a",acc:"#ff4a4a",hp:62,hpg:16,sp:10,spg:3,atk:12,atkg:3.2,def:6,defg:2.2,mag:4,magg:1,spd:7,spdg:.6,skills:["wucht","rund"],ip:"ip_andrew",role:"Schwertkämpfer"},marco:{name:"Silas",col:"#9a4cff",hair:"#e8c84a",acc:"#ff5ad0",hp:42,hpg:10,sp:24,spg:6,atk:6,atkg:1.6,def:4,defg:1.4,mag:13,magg:3.4,spd:8,spdg:.7,skills:["funke","welle"],ip:"ip_marco",role:"Magier"},teresa:{name:"Lyra",col:"#2fc98c",hair:"#ff5a8a",acc:"#fff04a",hp:50,hpg:12,sp:22,spg:5.5,atk:8,atkg:2,def:5,defg:1.8,mag:10,magg:3,spd:6,spdg:.6,skills:["heilton","chor"],ip:"ip_teresa",role:"Heilerin"},rico:{name:"Fenn",col:"#ff9a2a",hair:"#2a2a3a",acc:"#35e0ff",hp:52,hpg:13,sp:16,spg:4,atk:11,atkg:2.8,def:5,defg:1.8,mag:6,magg:1.6,spd:11,spdg:.9,skills:["doppel","streu"],ip:"ip_rico",role:"Schütze"},andy:{name:"Borin",col:"#d04a4a",hair:"#8a8a96",acc:"#ffd24a",hp:80,hpg:20,sp:8,spg:2,atk:10,atkg:2.6,def:9,defg:3,mag:3,magg:.8,spd:4,spdg:.4,skills:["schild","bollwerk"],ip:"ip_andy",role:"Wächter"}},Ud=[["boss_rap","teresa",'Eine junge Frau mit silbernem Haar wartet an der Quelle. "Ich bin Lyra, Priesterin der Quelle. Ich habe gespürt, wie das Echo der Gruft verstummt ist. Nehmt mich mit, eure Wunden brauchen Licht."'],["boss_schlager","rico",'Ein Bogenschütze lehnt am Tor und spannt die Sehne. "Fenn. Jäger aus dem Rosenhain. Seraphine hat meine Heimat in Dornen gehüllt. Ich schulde euch einen Pfeil, oder hundert."'],["boss_xmas","andy",'Ein hünenhafter Wächter tritt aus dem Schatten, den Schild voller Reif. "Borin. Ich hielt die Frostgrotte, bis Kryos mich vertrieb. Mein Schild gehört jetzt euch."']],Sr={wucht:{name:"Wuchtschlag",sp:4,kind:"phys",mult:1.9,all:!1},rund:{name:"Rundumschlag",sp:8,kind:"phys",mult:1.15,all:!0},funke:{name:"Blitzfunke",sp:4,kind:"mag",mult:2.2,all:!1},welle:{name:"Ätherwelle",sp:9,kind:"mag",mult:1.35,all:!0},heilton:{name:"Heillicht",sp:4,kind:"heal",mult:3.2,all:!1},chor:{name:"Segenskreis",sp:9,kind:"heal",mult:1.8,all:!0},doppel:{name:"Doppelschuss",sp:5,kind:"phys",mult:1.15,all:!1,hits:2},streu:{name:"Streufeuer",sp:8,kind:"phys",mult:1.05,all:!0},schild:{name:"Schildschlag",sp:3,kind:"phys",mult:1.5,all:!1},bollwerk:{name:"Bollwerk",sp:7,kind:"guard",mult:0,all:!0}},Bo={ip_andrew:{name:"Sternenhieb",ip:40,kind:"phys",mult:3.4,all:!1},ip_marco:{name:"Supernova",ip:60,kind:"mag",mult:2.5,all:!0},ip_teresa:{name:"Lebenshymne",ip:50,kind:"heal",mult:99,all:!0},ip_rico:{name:"Salvenfeuer",ip:50,kind:"phys",mult:2.4,all:!0},ip_andy:{name:"Titanenschlag",ip:40,kind:"phys",mult:4.2,all:!1}},At={trank:{name:"Trank",price:20,desc:"Heilt 70 LP"},aether:{name:"Äthertropfen",price:60,desc:"Gibt 20 SP"},weck:{name:"Lebensfeder",price:120,desc:"Belebt einen Helden"}},kd={key_rap:"Echo-Schlüssel",key_schlager:"Rosen-Schlüssel",key_xmas:"Frost-Schlüssel",key_rock:"Glut-Schlüssel",key_tower:"Stille-Schlüssel"},Tu={beatbandit:{name:"Moospanda",lv:1,hpm:1,atkm:1,defm:1,dir:"cute",model:"Panda",tint:"",h:1},reimruepel:{name:"Wildeber",lv:2,hpm:1,atkm:1.1,defm:.9,dir:"cute",model:"Pig",tint:"",h:1},bassgolem:{name:"Höhlenyeti",lv:3,hpm:1.5,atkm:1,defm:1.4,dir:"cute",model:"Yeti",tint:"#6a7ad8",h:1.35},boombox:{name:"Dornkaktus",lv:1,hpm:1.2,atkm:1.1,defm:1,dir:"cute",model:"Cactus",tint:"",h:1},graffiti:{name:"Irrlicht",lv:2,hpm:.8,atkm:1.2,defm:.8,dir:"cute",model:"Ghost",tint:"#ff9ad8",h:1},mikspin:{name:"Grottenpinguin",lv:3,hpm:1,atkm:1.1,defm:1,dir:"cute",model:"Penguin",tint:"#9a9aff",h:1},gecko:{name:"Rosenkrabbe",lv:7,hpm:1.1,atkm:1,defm:1.1,dir:"cute",model:"Crab",tint:"#ff7ac8",h:1},schleim:{name:"Honigschleim",lv:8,hpm:1.3,atkm:.9,defm:1.1,dir:"monsters4",model:"Slime",tint:"#ffe36b",h:1.05},aal:{name:"Sporenpilz",lv:9,hpm:1.1,atkm:1.2,defm:1,dir:"cute",model:"Mushroom",tint:"",h:1},disco:{name:"Dornbiene",lv:7,hpm:.8,atkm:1.2,defm:.8,dir:"cute",model:"Bee",tint:"#ff9ae8",h:1},herz:{name:"Blütenhirsch",lv:8,hpm:1.3,atkm:1.1,defm:1.3,dir:"cute",model:"Deer",tint:"#ffb0c0",h:1.1},zuckerg:{name:"Feenküken",lv:9,hpm:.9,atkm:1.2,defm:.9,dir:"cute",model:"Chicken",tint:"#ffc0e8",h:.9},geist:{name:"Frostgeist",lv:12,hpm:.9,atkm:1.1,defm:.9,dir:"cute",model:"Ghost",tint:"#bfe8ff",h:1},lebkuchen:{name:"Eiswurzler",lv:13,hpm:1.5,atkm:1,defm:1.4,dir:"cute",model:"Tree",tint:"",h:1.2},schneemann:{name:"Schneeyeti",lv:14,hpm:1.2,atkm:1.2,defm:1,dir:"cute",model:"Yeti",tint:"",h:1.3},eisratte:{name:"Eisfledermaus",lv:12,hpm:1,atkm:1.2,defm:.9,dir:"cute",model:"Bat",tint:"#a0d8ff",h:1},eisspin:{name:"Frostrentier",lv:13,hpm:1,atkm:1.2,defm:1,dir:"cute",model:"Deer",tint:"#d8c8a0",h:1.1},zwerg:{name:"Eiskobold",lv:14,hpm:1.1,atkm:1.2,defm:1,dir:"cute",model:"Demon",tint:"#c03a3a",h:1},gargoyle:{name:"Glutdämon",lv:17,hpm:1.1,atkm:1.1,defm:1.1,dir:"cute",model:"GreenDemon",tint:"",h:1.1},mole:{name:"Lavazyklop",lv:18,hpm:1.3,atkm:1.1,defm:1.1,dir:"cute",model:"Cyclops",tint:"",h:1.2},verstaerker:{name:"Aschenkrieger",lv:19,hpm:1.5,atkm:1.2,defm:1.3,dir:"monsters4",model:"Skeleton",tint:"",h:1.4},rifffled:{name:"Rußfledermaus",lv:17,hpm:.8,atkm:1.3,defm:.8,dir:"cute",model:"Bat",tint:"#5a4a6a",h:1},daemon:{name:"Flammenschädel",lv:18,hpm:1.3,atkm:1.3,defm:1,dir:"cute",model:"Skull",tint:"#ff9a5a",h:1},roadie:{name:"Magmakraken",lv:19,hpm:.9,atkm:1.2,defm:.9,dir:"cute",model:"Cthulhu",tint:"#7a5ad8",h:1.2},schemen:{name:"Leerwandler",lv:22,hpm:1,atkm:1.1,defm:1,dir:"cute",model:"Alien",tint:"#c0c0d0",h:1},stoersignal:{name:"Schattenseher",lv:23,hpm:1.3,atkm:1.1,defm:1.1,dir:"cute",model:"Alien_Tall",tint:"#7cff9a",h:1.2},kreischer:{name:"Stillschreier",lv:24,hpm:1.5,atkm:1.2,defm:1.2,dir:"cute",model:"Bat",tint:"#ffffff",h:1.1},antspin:{name:"Nichtsmotte",lv:22,hpm:1,atkm:1.3,defm:1,dir:"cute",model:"Bee",tint:"#7cff9a",h:1},rausritter:{name:"Stilleritter",lv:23,hpm:1.3,atkm:1.2,defm:1.3,dir:"monsters4",model:"Skeleton",tint:"#c0c8d8",h:1.5},zyklop:{name:"Leerenzyklop",lv:24,hpm:1.5,atkm:1.2,defm:1.2,dir:"cute",model:"Cyclops",tint:"#7cffb0",h:1.3},mcdroehn:{name:"Vorgal der Grollende",lv:5,hpm:4.2,atkm:1.15,defm:1.2,boss:!0,spec:["Grollbeben",.85,!0],dir:"cute",model:"Demon",tint:"#ff4a6a",h:2.4},koenigin:{name:"Seraphine, die Dornenkönigin",lv:10,hpm:6,atkm:1.4,defm:1.2,boss:!0,spec:["Dornenregen",.85,!0],dir:"cute",model:"YellowDragon",tint:"#ff6ac0",h:2.6},frostmod:{name:"Kryos, der Eisfürst",lv:15,hpm:6.5,atkm:1.55,defm:1.2,boss:!0,spec:["Eiszeit",.85,!0],dir:"cute",model:"Yeti",tint:"#6ad0ff",h:2.8},riff:{name:"Pyrax, der Glutdrache",lv:20,hpm:7,atkm:1.7,defm:1.2,boss:!0,spec:["Feuersturm",.85,!0],dir:"monsters4",model:"Dragon",tint:"#ff5030",h:3.4},rauschen:{name:"Nihl, die Stille",lv:26,hpm:9,atkm:1.85,defm:1.25,boss:!0,spec:["Totenstille",.9,!0],dir:"cute",model:"Cthulhu",tint:"#e8e8f8",h:3.4}},Fd={town:["#3f8f4a","#3a8644","#2a5a6a","#1f6a35","#ffd24a",0],rap:["#2a2438","#2f2a42","#14101e","#0c0a14","#ff4a6a",1],schlager:["#e8a3c8","#e29abf","#a04a80","#ffd24a","#ff3aa0",2],xmas:["#cfe8f6","#c2dff0","#4a7a9a","#2f8a4a","#ff3a3a",0],rock:["#3a2a28","#42302c","#1a0f0e","#6a3a2a","#ff7a1a",3],static:["#2a2e36","#30343e","#10121a","#505868","#7cff9a",1]};lt.hub.town=!0;lt.lind={name:"Lindmark",theme:"town",town:!0,enc:[],rate:0,lv:1,npcs:[{x:7,y:3,kind:"inn",name:"Wirtin Elsbeth"},{x:17,y:3,kind:"smith",name:"Schmied Torvald"},{x:20,y:7,kind:"trader",name:"Händler Quinn"},{x:5,y:7,kind:"sage",name:"Kapselgelehrte Mirela"},{x:16,y:10,kind:"kid2",name:"Nele"}],chests:[{id:"lind_c1",x:2,y:1,kind:"item",v:"frucht",n:1}],boss:{},portals:[{x:12,y:12,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:36,ay:13}],rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~","~#..T.hhh.......hhh...T.#~","~#....HSH...T...HDH.....#~","~#.....p.........p......#~","~#.....ppppppppppp..,...#~","~#..hhh....ppp.....hhh..#~","~#..HDH....ppp.....HSH..#~","~#...p.....ppp......p...#~","~#...ppppppppppppppppp..#~","~#T........ppp........T.#~","~#..,......ppp....,.....#~","~#TT.......ppp.......TT.#~","~..........ppp...........~","~~~~~~~~~~~~~~~~~~~~~~~~~~"]};lt.welt.portals.push({x:36,y:12,to:"lind",req:"boss_rap",label:"Lindmark",kind:"town",ax:12,ay:11});lt.rap.chests.push({id:"cap_flamm",x:13,y:12,kind:"capsule",v:"flamm"});lt.schlager.chests.push({id:"cap_moos",x:8,y:7,kind:"capsule",v:"moos"});lt.xmas.chests.push({id:"cap_frost",x:5,y:4,kind:"capsule",v:"frost"});lt.rock.chests.push({id:"cap_summ",x:3,y:2,kind:"capsule",v:"summ"});lt.tower.chests.push({id:"cap_drak",x:6,y:6,kind:"capsule",v:"drak"});Object.assign(At,{grosstrank:{name:"Großtrank",price:80,desc:"Heilt 250 LP"},aetherflask:{name:"Ätherflasche",price:180,desc:"Gibt 60 SP"},bombe:{name:"Glutbombe",price:90,desc:"Trifft alle Gegner",use:"enemy"},frucht:{name:"Sphärenfrucht",price:400,desc:"Lässt einen Kapselgeist sich entwickeln",use:"capsule"}});const Cc={hub:["trank","aether","weck"],lind:["trank","grosstrank","aether","aetherflask","weck","bombe","frucht"]},br={trank:25,grosstrank:70,aether:50,aetherflask:140,weck:90,bombe:60},Rn={flamm:{elem:"Feuer",col:"#ff8a3a",hp:40,hpg:11,atk:10,atkg:2.6,mag:9,magg:2.4,spd:9,spdg:.7,forms:[{name:"Flämmchen",model:"Ghost",tint:"#ffa060",h:.9},{name:"Glutgeist",model:"Ghost",tint:"#ff6a2a",h:1.25},{name:"Sonnenphönix",model:"YellowDragon",tint:"#ffb040",h:1.7}],skills:[{name:"Funkenwurf",kind:"mag",mult:1.6,all:!1},{name:"Flammenkreis",kind:"mag",mult:1.2,all:!0},{name:"Sonnensturm",kind:"mag",mult:1.9,all:!0}]},moos:{elem:"Erde",col:"#6ad05a",hp:56,hpg:15,atk:9,atkg:2.2,mag:8,magg:2.2,spd:5,spdg:.4,forms:[{name:"Moosling",model:"Slime",tint:"#7ae06a",h:.8},{name:"Moosgolem",model:"Tree",tint:"#9ad07a",h:1.4},{name:"Waldhüter",model:"Tree",tint:"#5ac05a",h:1.9}],skills:[{name:"Rankenhieb",kind:"phys",mult:1.5,all:!1},{name:"Heilmoos",kind:"heal",mult:2.2,all:!0},{name:"Erdbeben",kind:"phys",mult:1.5,all:!0}]},frost:{elem:"Wasser",col:"#6ac8ff",hp:48,hpg:13,atk:11,atkg:2.8,mag:7,magg:1.8,spd:7,spdg:.6,forms:[{name:"Frostling",model:"Penguin",tint:"#a0dcff",h:.8},{name:"Eisbär",model:"Yeti",tint:"#c0e8ff",h:1.4},{name:"Gletscherkönig",model:"Yeti",tint:"#7ab8ff",h:1.9}],skills:[{name:"Eiskralle",kind:"phys",mult:1.7,all:!1},{name:"Frosthauch",kind:"mag",mult:1.2,all:!0},{name:"Gletscherwall",kind:"guard",mult:0,all:!0}]},summ:{elem:"Wind",col:"#ffe04a",hp:38,hpg:10,atk:12,atkg:3,mag:8,magg:2,spd:13,spdg:1,forms:[{name:"Summfix",model:"Bee",tint:"#ffe070",h:.8},{name:"Sturmhornisse",model:"Bee",tint:"#ffc030",h:1.2},{name:"Himmelsfürst",model:"Bat",tint:"#ffe8a0",h:1.7}],skills:[{name:"Stachelwirbel",kind:"phys",mult:.9,all:!1,hits:2},{name:"Windklinge",kind:"phys",mult:1.15,all:!0},{name:"Orkan",kind:"phys",mult:1.6,all:!0}]},drak:{elem:"Licht",col:"#e0d0ff",hp:60,hpg:16,atk:14,atkg:3.4,mag:13,magg:3.2,spd:10,spdg:.8,forms:[{name:"Drakling",model:"YellowDragon",tint:"#f0e0ff",h:.9},{name:"Sternendrache",model:"Dragon",tint:"#d0c0ff",h:1.6},{name:"Äonenwyrm",model:"Dragon",tint:"#fff0c0",h:2.2}],skills:[{name:"Lichtatem",kind:"mag",mult:1.8,all:!1},{name:"Segenslicht",kind:"heal",mult:2.6,all:!0},{name:"Sternenfall",kind:"mag",mult:2,all:!0}]}},Pc={tool_hammer:{name:"Kristallhammer",desc:"zerschlägt rissige Felsen"},tool_fire:{name:"Glutstab",desc:"entzündet Fackeln und verbrennt Dornenranken"}};Object.assign(lt.rap,{puzzle:{blocks:[[8,13],[13,14]],plates:[[10,13],[15,14]],torches:[]},loot:[{id:"rap_r1",x:17,y:5,kind:"rock",gold:120},{id:"rap_r2",x:21,y:8,kind:"rock",v:"grosstrank",n:2}]});lt.rap.chests.push({id:"rap_tool",x:14,y:11,kind:"tool",v:"tool_hammer"});Object.assign(lt.schlager,{puzzle:{blocks:[[8,14]],plates:[[10,14]],torches:[[7,12],[13,12]]},loot:[{id:"schlager_b1",x:18,y:9,kind:"bramble",gold:200},{id:"schlager_b2",x:13,y:9,kind:"bramble",v:"aetherflask",n:1}]});lt.schlager.chests.push({id:"schlager_tool",x:5,y:11,kind:"tool",v:"tool_fire"});Object.assign(lt.xmas,{puzzle:{blocks:[[8,13],[11,14]],plates:[[10,13],[13,14]],torches:[[16,13]]},loot:[{id:"xmas_r1",x:4,y:10,kind:"rock",v:"frucht",n:1},{id:"xmas_b1",x:13,y:8,kind:"bramble",gold:300}]});Object.assign(lt.rock,{puzzle:{blocks:[[8,13],[11,14]],plates:[[10,13],[13,14]],torches:[[16,13],[22,13]]},loot:[{id:"rock_r1",x:11,y:8,kind:"rock",v:"grosstrank",n:3},{id:"rock_b1",x:4,y:7,kind:"bramble",v:"frucht",n:1}]});Object.assign(lt.tower,{puzzle:{blocks:[[4,13],[9,14]],plates:[[6,13],[11,14]],torches:[[16,13],[22,13]]},loot:[{id:"tower_r1",x:8,y:11,kind:"rock",v:"frucht",n:1},{id:"tower_b1",x:10,y:9,kind:"bramble",v:"weck",n:2},{id:"tower_r2",x:5,y:5,kind:"rock",gold:500}]});const Od=.13,Bd=.38,zd=11/16,Hd=[3,8,13,18,23],zo=[["beatbandit","reimruepel","bassgolem","boombox","graffiti","mikspin"],["gecko","schleim","aal","disco","herz","zuckerg"],["geist","lebkuchen","schneemann","eisratte","eisspin","zwerg"],["gargoyle","mole","verstaerker","rifffled","daemon","roadie"],["schemen","stoersignal","kreischer","antspin","rausritter","zyklop"]],Vd="#T~^hHDSM",Su=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}],Xa=["hub","welt","rap","schlager","xmas","rock","tower","lind"];function Gd(r){let e=r>>>0;const t=r==null?Math.random:()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296};return{randf:t,randi:()=>Math.floor(t()*4294967296),range:(n,i)=>n+(i-n)*t(),shuffle(n){for(let i=n.length-1;i>0;i--){const s=Math.floor(t()*(i+1));[n[i],n[s]]=[n[s],n[i]]}return n}}}const Jt=Math.trunc,Dc=r=>r.x+","+r.y,Vl=(r,e)=>r.x===e.x&&r.y===e.y,Ho=(r,e)=>Math.abs(r.x-e.x)+Math.abs(r.y-e.y);function Wd(){return{party:[],inv:{trank:3,aether:1,weck:0},gold:50,gear:0,flags:{},caps:{own:{},active:null},mapId:"hub",map:lt.hub,mw:26,mh:16,objs:[],reg:[],gp:{x:12,y:11},face:{x:0,y:1},steps:0,grace:8,playTime:0,uidN:0,roamers:[],enemies:[]}}const cn=r=>Fi[r.id],Pt=(r,e)=>Jt(cn(e).hp+cn(e).hpg*(e.lv-1))+r.gear*8,yi=r=>Jt(cn(r).sp+cn(r).spg*(r.lv-1));function Yt(r,e,t){let n=cn(e)[t]+cn(e)[t+"g"]*(e.lv-1);return(t==="atk"||t==="def"||t==="mag")&&(n+=r.gear*3),Jt(n)}const Oi=r=>Jt(14*r+2.2*r*r);function Pn(r){let e=0;for(const t of r.party)e+=t.lv;return e/Math.max(1,r.party.length)}function qa(r,e,t=1){const n={id:e,name:Fi[e].name,lv:t,exp:0,hp:1,sp:1,ip:0};return n.hp=Pt(r,n),n.sp=yi(n),n}const Yn=r=>++r.uidN,wr=r=>120*(r.gear+1)*(r.gear+1);function Xd(r,e){const t=Tu[e],n=t.lv,i=.62+.13*r.party.length,s=Math.min(1,Math.max(.6,.5+.1*Pn(r))),a=Jt((18+14*n)*1.4*t.hpm*i*s),o=!!t.boss;return{id:e,name:t.name,lv:n,hp:a,mhp:a,atk:(6+2.6*n)*t.atkm*s,def:(2+1.5*n)*t.defm,spd:5+.5*n,boss:o,spec:t.spec||[],exp:Jt((4+3*n)*(o?5:1)*(1+(t.hpm-1)*.3)),gold:Jt((3+2*n)*(o?6:1)),turn:0,dead:!1}}const ai=(r,e,t,n=1)=>Math.max(1,Jt((e*1.7-t*.7)*n*r.range(.9,1.1))),Ic=(r,e,t,n=1)=>Math.max(1,Jt((e*1.7-t*.35)*n*r.range(.9,1.1))),Vn=r=>r.party.filter(e=>e.hp>0),oi=r=>r.enemies.filter(e=>e.hp>0),qd=(r,e)=>r.party.some(t=>t.id===e);function Lc(r,e,t){return e==="weck"?t.hp>0?!1:(t.hp=Math.max(1,Jt(Pt(r,t)/2)),!0):t.hp<=0?!1:e==="trank"||e==="grosstrank"?t.hp>=Pt(r,t)?!1:(t.hp=Math.min(Pt(r,t),t.hp+(e==="trank"?70:250)),!0):e==="aether"||e==="aetherflask"?t.sp>=yi(t)?!1:(t.sp=Math.min(yi(t),t.sp+(e==="aether"?20:60)),!0):!1}const Er=r=>At[r]?.use||"hero",fr=r=>Rn[r.id],jd=r=>fr(r).forms[r.form],Ft=r=>jd(r).name,ei=r=>Jt(fr(r).hp+fr(r).hpg*(r.lv-1))*(1+r.form*.25)|0,Nc=r=>Jt((2+1.6*r.lv)*(1+r.form*.15)),Ti=(r,e)=>Jt((fr(r)[e]+fr(r)[e+"g"]*(r.lv-1))*(1+r.form*.15));function Uc(r,e=1){const t={id:r,lv:e,exp:0,form:0,hp:1};return t.hp=ei(t),t}const $d=r=>r.caps&&r.caps.active&&r.caps.own[r.caps.active]||null,da=r=>r.form<2&&r.lv>=(r.form===0?8:16);function kc(r,e){const t=[];for(r.exp+=e;r.exp>=Oi(r.lv)&&r.lv<40;){r.exp-=Oi(r.lv);const n=ei(r);r.lv+=1,r.hp>0&&(r.hp+=ei(r)-n),t.push(r.lv)}return t}function Yd(r){return da(r)?(r.form+=1,r.hp=ei(r),!0):!1}function ja(r){for(const e of r.party)e.hp=Pt(r,e),e.sp=yi(e);for(const e in r.caps.own){const t=r.caps.own[e];t.hp=ei(t)}}const Kd=r=>6+4*Math.round(Pn(r));function Gl(r,e,t){return e<0||t<0||e>=r.mw||t>=r.mh?"#":r.map.rows[t][e]}const Ua=(r,e)=>Vd.includes(Gl(r,e.x,e.y));function xr(r,e){for(const t of r.objs)if(t.x===e.x&&t.y===e.y)return t;return null}function ka(r,e){return r.map.portals.some(t=>t.x===e.x&&t.y===e.y)}function Js(r){let e=0;for(const t of["boss_rap","boss_schlager","boss_xmas","boss_rock"])r.flags[t]&&e++;return e}const Sa=r=>Math.min(4,Math.max(0,Js(r))),Wl=r=>!!r.map.world,Vo=(r,e)=>e.req===""||!!r.flags[e.req];function Zd(r,e,t){let n=9999,i="ow_town";for(const s of r.portals){const a=Math.abs(s.x-e)+Math.abs(s.y-t);if(a<n){n=a;const o=s.to;i="ow_"+(lt[o].town?"town":o==="tower"?"static":o)}}return i}function Ar(r,e,t){return Wl(r)?r.reg[t][e]:r.map.theme}function bu(r,e,t,n){r.mapId=t,r.map=lt[t];const i=r.map;r.mh=i.rows.length,r.mw=i.rows[0].length,r.objs=[];for(const o of i.npcs)r.objs.push({t:"npc",x:o.x,y:o.y,d:o,uid:Yn(r)});for(const o of i.chests)r.flags[o.id]||r.objs.push({t:"chest",x:o.x,y:o.y,d:o,uid:Yn(r)});const s=i.boss;s&&s.id&&!r.flags[s.flag]&&r.objs.push({t:"boss",x:s.x,y:s.y,d:s,uid:Yn(r)}),i.gate&&!r.flags[i.gate.flag]&&r.objs.push({t:"gate",x:i.gate.x,y:i.gate.y,d:i.gate,uid:Yn(r)});const a=i.puzzle;if(a){const o=Jd(r,t);a.blocks.forEach(([l,c],h)=>{const u=o?a.plates[h]:[l,c];r.objs.push({t:"block",x:u[0],y:u[1],uid:Yn(r)})}),a.torches.forEach(([l,c],h)=>r.objs.push({t:"torch",x:l,y:c,d:{i:h},lit:o||!!r.flags[`torch_${t}_${h}`],uid:Yn(r)})),!o&&i.gate&&r.objs.push({t:"seal",x:i.gate.x-1,y:i.gate.y,d:{},uid:Yn(r)})}for(const o of i.loot||[])r.flags[o.id]||r.objs.push({t:o.kind,x:o.x,y:o.y,d:o,uid:Yn(r)});if(r.reg=[],i.world)for(let o=0;o<r.mh;o++){const l=[];for(let c=0;c<r.mw;c++)l.push(Zd(i,c,o));r.reg.push(l)}r.gp={x:n.x,y:n.y},r.ppos={x:n.x,y:n.y},r.moving=!1,r.grace=8,nf(r,e)}const Jd=(r,e)=>!!(r.flags["seal_"+e]||lt[e].boss&&lt[e].boss.flag&&r.flags[lt[e].boss.flag]);function Qd(r,e,t){const n={x:e.x+t.x,y:e.y+t.y};return Ua(r,n)||xr(r,n)||ka(r,n)||Gl(r,n.x,n.y)==="~"||r.roamers.some(i=>Vl(i.g,n))?!1:(e.x=n.x,e.y=n.y,!0)}function ef(r){const e=r.map.puzzle;if(!e)return!1;const t=e.plates.every(([i,s])=>r.objs.some(a=>a.t==="block"&&a.x===i&&a.y===s)),n=r.objs.filter(i=>i.t==="torch").every(i=>i.lit);return t&&n}function tf(r,e,t=n=>Ua(r,n)){const n=new Map([[Dc(e),e]]),i=[e];for(;i.length;){const s=i.shift();for(const a of Su){const o={x:s.x+a.x,y:s.y+a.y},l=Dc(o);!n.has(l)&&!t(o)&&(n.set(l,o),i.push(o))}}return n}function nf(r,e){r.roamers=[];let t=r.map.enc,n=6;if(Wl(r)&&(t=zo[Sa(r)],n=12),!t.length)return;const i=[];for(const s of tf(r,r.gp).values())Ho(s,r.gp)<7||xr(r,s)||ka(r,s)||r.map.gate&&s.x>r.map.gate.x||i.push(s);e.shuffle(i);for(let s=0;s<Math.min(n,i.length);s++){const a=i[s],o={x:a.x,y:a.y};r.roamers.push({uid:Yn(r),id:t[e.randi()%t.length],g:{...a},pos:{...o},from:{...o},to:{...o},t:1,wait:e.randf()*.8,stun:0})}}function sf(r,e,t){if(Ua(r,e)||xr(r,e)||ka(r,e)||r.map.gate&&e.x>r.map.gate.x&&!r.flags[r.map.gate.flag])return!1;for(const n of r.roamers)if(n!==t&&Vl(n.g,e))return!1;return!0}function rf(r,e,t){const n=r.moving?r.gtarget:r.gp,i=t.g,s=Ho(n,i),a=[];for(const l of Su){const c={x:i.x+l.x,y:i.y+l.y};sf(r,c,t)&&a.push(c)}if(!a.length)return;let o=a[e.randi()%a.length];if(s<=6&&e.randf()<.85){let l=9999;for(const c of a){const h=Ho(n,c);h<l&&(l=h,o=c)}}else if(e.randf()<.5)return;t.from={...t.pos},t.to={x:o.x,y:o.y},t.g=o,t.t=0}function af(r,e,t){for(const n of r.roamers)if(n.stun>0&&(n.stun-=t),n.t<1?(n.t=Math.min(1,n.t+t/Bd),n.pos={x:n.from.x+(n.to.x-n.from.x)*n.t,y:n.from.y+(n.to.y-n.from.y)*n.t}):(n.wait-=t,n.wait<=0&&n.stun<=0&&(n.wait=e.range(.2,.6),rf(r,e,n))),n.stun<=0&&!r.moving&&Math.hypot(n.pos.x-r.ppos.x,n.pos.y-r.ppos.y)<zd)return n;return null}function of(r,e){const t=Wl(r)?Hd[Sa(r)]:r.map.lv??Pn(r),n=Math.min(3,Math.max(.6,1+.3*(t-Pn(r))));return Jt(e*n)}function lf(r,e,t){const n=[];for(e.exp+=t;e.exp>=Oi(e.lv)&&e.lv<40;){e.exp-=Oi(e.lv);const i=Pt(r,e);e.lv+=1,e.hp+=Pt(r,e)-i,e.sp=Math.min(yi(e),e.sp+4),n.push(e.lv)}return n}const Fc=r=>r==="hub"?{x:12,y:12}:r==="lind"?{x:12,y:11}:r==="welt"?{x:20,y:22}:{x:2,y:14},Ct={TITLE:0,WORLD:1,BATTLE:2},rr="anmachaQuest_save",cf={mcdroehn:["Vorgal: Tausend Jahre in Ketten ... und die ersten, die mich wecken, sind Kinder mit Holzschwertern?","Vorgal: Die Gruft hallt nur noch von meinem Groll. Gleich auch von euren Schreien!"],koenigin:["Seraphine: Wie hübsch ihr seid. Wie Rosen kurz vor dem Welken.","Seraphine: Bleibt bei mir. Für immer. Meine Dornen halten euch fest!"],frostmod:["Kryos: Ihr bringt Wärme in meine Halle. Wie ungezogen.","Kryos: Alles Leben ist nur Lärm vor der Stille. Ich lasse euch erstarren, damit ihr es versteht."],riff:["Pyrax: *GRRRAAAH* Kleine Funken wagen sich in meinen Schlund?","Pyrax: Ich habe Städte verbrannt, bevor eure Ahnen sprechen konnten. BRENNT!"],rauschen:["Nihl: ... Endlich. Die Letzten, die noch Stimmen haben.","Nihl: Die Vier waren nur meine Hände. Ich bin das Schweigen zwischen den Sternen. Werdet still, Kinder Aetherions."]},hf={mcdroehn:["Vorgal zerfällt zu grauer Asche. Ein Sphärenkristall leuchtet auf und erfüllt die Gruft mit einem klaren Ton.","Auf der Weltkarte öffnet sich der Weg zum Rosenhain. In Hafenau wartet jemand auf euch."],koenigin:["Die Dornen welken, Seraphine löst sich in Blütenblätter auf. Der zweite Kristall erwacht!","Auf der Weltkarte öffnet sich die Frostgrotte. In Hafenau wartet jemand auf euch."],frostmod:["Kryos zerspringt wie Glas. Tauwasser tropft von der Decke. Der dritte Kristall erwacht!","Auf der Weltkarte öffnet sich der Glutschlund. In Hafenau wartet jemand auf euch."],riff:["Pyrax stürzt in die Lava, die Flammen erlöschen. Der vierte Kristall erwacht!","Im Norden erhebt sich der Turm der Stille. Der Weg zu Nihl ist frei."]},uf=[{x:12,y:8,yaw:.6,dist:14,pitch:.55,t:["Vor tausend Jahren sangen vier Sphärenkristalle die Welt Aetherion ins Gleichgewicht."]},{x:12,y:9,yaw:-.4,dist:10,pitch:.42,t:["Vier ihrer Hüter verrieten sie. Man nannte sie die Verfemten und versiegelte sie im Herzen der Welt."]},{x:12,y:10,yaw:.2,dist:7,pitch:.3,t:["Doch nun breitet sich eine Stille aus, die selbst die Vögel verstummen lässt. Die Siegel brechen."]},{x:12,y:12,yaw:0,dist:4.6,pitch:.2,t:["In der Hafenstadt Hafenau erwacht der junge Schwertkämpfer Aren aus einem Traum von Sternen, die erlöschen.","Sein bester Freund Silas, ein Magier mit mehr Mut als Vorsicht, wartet schon vor der Tür.","Älteste Ysolde hat nach euch gerufen. Sie steht in der Mitte der Stadt."]}];class df{constructor(e,t,n={}){this.ui=e,this.view=t,this.rng=n.rng||Gd(),this.store=n.store||null,this.S=Wd(),this.mode=Ct.TITLE,this.busy=!1,this.autoplay=!1,this.autoN=0,this.curHero=-1,this.dirStack=[],this.dpad=null,this.stepflip=0,this.mt=0,this.debug=!!n.debug,this.audio=n.audio||null,this.musicOverride=null,this.battleMusic="battle"}sfx(e){this.audio?.sfx(e)}pickMusic(){if(!this.audio)return;const e=this.S;let t=this.musicOverride;t||(this.mode===Ct.TITLE?t="title":this.mode===Ct.BATTLE?t=this.battleMusic:e.map.world?t="world":e.map.town?t=e.flags.boss_rauschen?"ending":"town":t=e.map.theme==="static"?"tower":e.map.theme),this.audio.music(t)}async cutscene(e,t){if(!(this.autoplay||!this.view)){t&&(this.musicOverride=t),this.ui.letterbox?.(!0);for(const n of e)this.view.cine={x:n.x+.5,z:n.y+.5,h:n.h??.9,yaw:n.yaw,dist:n.dist,pitch:n.pitch},n.wait&&await this.wait(n.wait),await this.say(n.t);this.view.cine=null,this.ui.letterbox?.(!1),t&&(this.musicOverride=null)}}async say(e){this.autoplay||(this.ui.setTouch(!1),await this.ui.say(e),this.ui.setTouch(this.mode===Ct.WORLD&&!this.busy))}async choose(e,t=!1,n=[]){if(this.autoplay){await this.tick();for(let i=0;i<e.length;i++)if(!n[i])return i;return 0}return this.ui.choose(e,t,n,this.mode)}async chooseCross(e){if(this.autoplay){await this.tick(),this.autoN++;let t=[0,1,2,0,3,4,0,2][this.autoN%8];return e[t]&&(t=0),t}return this.ui.chooseCross(e)}async banner(e,t=1.3){this.autoplay||await this.ui.banner(e,t)}async bmsg(e,t=.7){this.autoplay||(this.ui.msg(e),t>0&&await this.wait(t))}tick(){return new Promise(e=>setTimeout(e,0))}wait(e){return this.autoplay?this.tick():new Promise(t=>setTimeout(t,e*1e3))}async fade(e,t=.22){if(this.autoplay){this.ui.fadeNow(e);return}await this.ui.fade(e,t)}setTouch(e){this.ui.setTouch(e)}hasSave(){return!!(this.store&&this.store.has(rr))}saveGame(){if(!this.store)return;const e=this.S,t=e.party.map(n=>({id:n.id,name:n.name,lv:n.lv,exp:n.exp,hp:n.hp,sp:n.sp,ip:n.ip}));this.store.set(rr,JSON.stringify({v:4,party:t,inv:e.inv,gold:e.gold,gear:e.gear,flags:e.flags,caps:e.caps,map:e.mapId,gp:e.gp,t:e.playTime}))}loadGame(){if(!this.store)return!1;let e=null;try{e=JSON.parse(this.store.get(rr))}catch{return!1}if(!e||!Array.isArray(e.party)||!e.party.length||!lt[e.map])return!1;const t=this.S;if(t.party=e.party.filter(i=>Fi[i.id]).map(i=>({id:i.id,name:Fi[i.id].name,lv:i.lv|0||1,exp:i.exp|0,hp:i.hp|0,sp:i.sp|0,ip:0})),!t.party.length)return!1;if(t.inv=Object.assign({trank:0,aether:0,weck:0},e.inv||{}),t.gold=e.gold|0,t.gear=e.gear|0,t.flags=e.flags||{},t.caps={own:{},active:null},e.caps&&e.caps.own)for(const i in e.caps.own){const s=e.caps.own[i];if(!Rn[i]||!s)continue;const a=Uc(i,Math.max(1,s.lv|0));a.exp=s.exp|0,a.form=Math.min(2,Math.max(0,s.form|0)),a.hp=Math.min(ei(a),Math.max(0,s.hp|0)),t.caps.own[i]=a}e.caps&&t.caps.own[e.caps.active]&&(t.caps.active=e.caps.active),t.flags.boss_rap&&!t.flags.tool_hammer&&(t.flags.tool_hammer=!0,t.flags.rap_tool=!0),t.flags.boss_schlager&&!t.flags.tool_fire&&(t.flags.tool_fire=!0,t.flags.schlager_tool=!0),t.playTime=+e.t||0,this.mode=Ct.WORLD;const n=e.gp&&Gl({...t,map:lt[e.map],mw:lt[e.map].rows[0].length,mh:lt[e.map].rows.length},e.gp.x,e.gp.y)!=="#"?e.gp:Fc(e.map);return this.loadMap(e.map,n),!0}loadMap(e,t){bu(this.S,this.rng,e,t),this.moving=!1,this.view.mapChanged?.()}async showTitle(){this.mode=Ct.TITLE,this.busy=!0,this.setTouch(!1),this.ui.msg(""),this.view.setMode?.(Ct.TITLE);const e=this.hasSave();for(;;){const t=e?["Fortsetzen","Neues Spiel"]:["Neues Spiel"],n=await this.choose(t);if(!e&&n===0||e&&n===1){await this.newGame();return}if(this.loadGame()){await this.startWorldAfterLoad();return}}}async newGame(){const e=this.S;e.party=[qa(e,"andrew"),qa(e,"marco")],e.inv={trank:5,aether:2,weck:0},e.gold=100,e.gear=0,e.flags={},e.caps={own:{},active:null},e.playTime=0,await this.fade(1,.25),this.mode=Ct.WORLD,this.loadMap("hub",{x:12,y:12}),await this.view.ready?.(),await this.fade(0),this.busy=!0,await this.cutscene(uf,"intro"),this.view&&(this.view.camYawT=this.view.camYaw=0),this.busy=!1,this.setTouch(!0)}async startWorldAfterLoad(){await this.fade(1,.25),this.mode=Ct.WORLD,await this.view.ready?.(),this.busy=!1,this.setTouch(!0),await this.fade(0)}readDir(){const e=this.dpad||(this.dirStack.length?this.dirStack[this.dirStack.length-1]:null);if(!e)return null;let t={x:e.x,y:e.y};const n=this.view?.camQuad?.()||0;for(let i=0;i<n;i++)t={x:t.y,y:-t.x};return t}pressDir(e,t){this.dirStack=this.dirStack.filter(n=>!Vl(n,e)),t&&this.dirStack.push(e)}clearDirs(){this.dirStack=[],this.dpad=null}idle(){return!this.busy&&!this.ui.isChoosing()&&!this.ui.isTalking()}update(e){const t=this.S;if(this.pickMusic(),this.mode===Ct.WORLD){if(t.playTime+=e,!this.ui.touchVisible()&&this.dpad&&(this.dpad=null),t.moving){for(this.mt+=e/Od;t.moving&&this.mt>=1;){const n=this.mt-1;if(t.moving=!1,t.ppos={...t.gtarget},t.gp={...t.gtarget},this.onStep(),!this.idle())break;const i=this.readDir();i&&(this.tryStep(i),t.moving&&(this.mt=n))}t.moving&&(t.ppos={x:t.mfrom.x+(t.gtarget.x-t.mfrom.x)*this.mt,y:t.mfrom.y+(t.gtarget.y-t.mfrom.y)*this.mt})}else if(this.idle()){const n=this.readDir();n&&this.tryStep(n)}if(this.idle()){const n=af(t,this.rng,e);n&&this.startRoamerFight(n)}}}tryStep(e){const t=this.S;t.face={...e};const n={x:t.gp.x+e.x,y:t.gp.y+e.y};if(Ua(t,n))return;const i=xr(t,n);if(i){this.interact(i);return}t.moving=!0,t.gtarget=n,t.mfrom={...t.gp},this.mt=0,this.stepflip=1-this.stepflip}onStep(){const e=this.S;e.steps++;for(const t of e.map.portals)if(t.x===e.gp.x&&t.y===e.gp.y){this.usePortal(t);return}e.map.rate>0&&(e.grace-=1,e.grace<=0&&this.rng.randf()<e.map.rate*.4&&this.startEncounter())}async usePortal(e){const t=this.S;if(this.busy=!0,this.setTouch(!1),e.req!==""&&!t.flags[e.req]){await this.say([`Der Zugang nach "${e.label}" ist versiegelt. Befreie zuerst das vorherige Reich.`]),t.gp={x:t.gp.x-t.face.x,y:t.gp.y-t.face.y},t.ppos={...t.gp},this.busy=!1,this.setTouch(!0);return}await this.fade(1);const n=e.to;if(this.loadMap(n,{x:e.ax,y:e.ay}),lt[n].town&&this.saveGame(),await this.view.ready?.(),await this.fade(0),n==="hub")for(const i of Ud)t.flags[i[0]]&&!qd(t,i[1])&&(await this.say([i[2],`${Fi[i[1]].name} schließt sich euch an.`]),t.party.push(qa(t,i[1],Math.max(1,Math.trunc(Pn(t))))),this.view.partyChanged?.());this.busy=!0,await this.banner(t.map.world||t.map.town?t.map.name:`${t.map.name}  (Stufe ${t.map.lv})`),this.busy=!1,this.setTouch(!0)}async interact(e){switch(this.busy=!0,this.setTouch(!1),this.clearDirs(),e.t){case"chest":await this.openChest(e);break;case"npc":await this.talkNpc(e.d);break;case"boss":await this.fightBoss(e);break;case"gate":await this.openGate(e);break;case"block":await this.pushBlock(e);break;case"torch":await this.lightTorch(e);break;case"rock":case"bramble":await this.breakLoot(e);break;case"seal":await this.say(["Ein Siegel aus Licht versperrt den Weg zur Halle.",this.sealHint()]);break}this.busy=!1,this.setTouch(this.mode===Ct.WORLD)}sealHint(){const e=this.S.map.puzzle,t=[];return e.plates.length&&t.push(`${e.plates.length} Druckplatte${e.plates.length>1?"n":""} mit Steinblöcken beschweren`),e.torches.length&&t.push(`${e.torches.length} Fackel${e.torches.length>1?"n":""} entzünden`),`Inschrift: „${t.join(" und ")}, dann weicht das Licht.“ (Steckt ein Block fest, verlasse das Reich und komm zurück.)`}async pushBlock(e){const t=this.S;if(!Qd(t,e,t.face)){this.sfx("cancel");return}this.sfx("push"),await this.wait(.12),await this.checkSeal()}async lightTorch(e){const t=this.S;if(e.lit){await this.say(["Die Fackel brennt hell."]);return}if(!t.flags.tool_fire){await this.say(["Eine erloschene Fackel. Mit etwas Feuer ließe sie sich entzünden."]);return}e.lit=!0,t.flags[`torch_${t.mapId}_${e.d.i}`]=!0,this.sfx("magic"),this.view?.fxWorld?.("torch",e),await this.wait(.3),await this.checkSeal()}async breakLoot(e){const t=this.S,n=e.d,i=e.t==="rock",s=i?"tool_hammer":"tool_fire";if(!t.flags[s]){await this.say([i?"Ein rissiger Felsen. Darin glitzert etwas ... mit einem Hammer könnte man ihn zerschlagen.":"Dichte Dornenranken. Dahinter schimmert etwas. Feuer würde sie vertreiben."]);return}t.flags[n.id]=!0,this.removeObj(e),this.sfx(i?"heavy":"magic"),this.view?.fxWorld?.(i?"smash":"burn",e),await this.wait(.35),n.gold?(t.gold+=n.gold,await this.say([`${i?"Der Fels zerbirst":"Die Ranken verglühen"}: ${n.gold} Münzen!`])):(t.inv[n.v]=(t.inv[n.v]||0)+n.n,this.sfx("chest"),await this.say([`${i?"Der Fels zerbirst":"Die Ranken verglühen"}: ${At[n.v].name} x${n.n}!`]))}async checkSeal(){const e=this.S,t=e.objs.find(i=>i.t==="seal");if(!t||!ef(e))return;e.flags["seal_"+e.mapId]=!0;const n=Math.atan2(e.gp.x-t.x,e.gp.y-t.y);!this.autoplay&&this.view&&(this.ui.letterbox?.(!0),this.view.cine={x:t.x+.5,z:t.y+.5,h:.8,yaw:n,dist:5,pitch:.35},await this.wait(1)),this.removeObj(t),this.sfx("door"),this.view?.fxWorld?.("seal",t),await this.say(["Ein heller Klang hallt durch das Reich ... das Lichtsiegel vor der Halle zerbricht!"]),this.view&&(this.view.cine=null),this.ui.letterbox?.(!1)}removeObj(e){const t=this.S.objs.indexOf(e);t>=0&&this.S.objs.splice(t,1)}async openGate(e){const t=e.d,n=this.S;n.flags[t.key]?(n.flags[t.flag]=!0,this.removeObj(e),this.view.fxWorld?.("gate",e),this.sfx("door"),await this.say(["Der Schlüssel passt! Das Tor öffnet sich knarrend."])):await this.say(["Das Tor zur Halle ist verriegelt. Irgendwo in diesem Reich liegt der Schlüssel in einer Truhe."])}async openChest(e){const t=e.d,n=this.S;if(n.flags[t.id]=!0,this.removeObj(e),this.view.fxWorld?.("chest",e),this.sfx("chest"),t.kind==="gold")n.gold+=t.v,await this.say([`Truhe geöffnet: ${t.v} Münzen!`]);else if(t.kind==="tool")n.flags[t.v]=!0,this.sfx("levelup"),await this.say([`Truhe geöffnet: ${Pc[t.v].name}! Er ${Pc[t.v].desc}.`,"Lauf einfach gegen das passende Hindernis, dann wird das Werkzeug von selbst eingesetzt."]);else if(t.kind==="capsule"){const i=Uc(t.v,Math.max(1,Math.trunc(Pn(n))-1));n.caps.own[t.v]=i,n.caps.active||(n.caps.active=t.v),this.sfx("levelup"),await this.say([`In der Truhe pulsiert eine leuchtende Kapsel ... Ein Kapselgeist erwacht: ${Ft(i)} (${Rn[t.v].elem})!`,n.caps.active===t.v?`${Ft(i)} begleitet euch ab jetzt und kämpft von selbst mit. Im Menü unter „Kapselgeist“ kannst du ihn füttern.`:"Im Menü unter „Kapselgeist“ kannst du wählen, wer euch begleitet."])}else t.kind==="key"?(n.flags[t.v]=!0,await this.say([`Truhe geöffnet: ${kd[t.v]} gefunden! Damit lässt sich das Tor zur Halle öffnen.`])):(n.inv[t.v]=(n.inv[t.v]||0)+t.n,await this.say([`Truhe geöffnet: ${At[t.v].name} x${t.n}!`]))}async talkNpc(e){const t=this.S;switch(e.kind){case"elder":{const n=Js(t);t.flags.boss_rauschen?await this.say(["Ysolde: Die Stille ist gebrochen. Hörst du die Möwen? Aetherion singt wieder, Aren."]):n===0?await this.say(["Ysolde: Aren, Silas. Die Siegel der Verfemten sind gebrochen. Vier Reiche sind in ihrer Hand, und ihre Kristalle schweigen.","Verlasst die Stadt nach Süden. Im Westen liegt die Echogruft, dort tobt Vorgal der Grollende.","Jedes Reich verbirgt einen Schlüssel zur Halle seines Herrn. Werdet stärker, und vergesst die Tränke bei Mara nicht!"]):n<4?await this.say([`Ysolde: ${n} von 4 Kristallen singen wieder. Der nächste Weg öffnet sich auf der Weltkarte, sobald der letzte Verfemte gefallen ist.`,"Reihenfolge: Echogruft, Rosenhain, Frostgrotte, Glutschlund."]):await this.say(["Ysolde: Alle vier Kristalle sind erwacht! Im Norden ragt der Turm der Stille auf.","Nihl selbst wartet dort. Geht gut gerüstet, und kommt zurück."]);break}case"shop":await this.shop(Cc.hub,"Mara: Frische Ware aus aller Welt! Was darf's sein?",6);break;case"trader":await this.shop(Cc.lind,"Quinn: Seltene Ware aus allen vier Reichen. Sphärenfrüchte habe ich auch, wenn die Münzen reichen.",0);break;case"smith":await this.smith();break;case"inn":await this.inn(e);break;case"sage":{const n=Object.keys(t.caps.own).length;n?await this.say([`Mirela: ${n} Kapselgeist${n>1?"er":""} an eurer Seite! Füttert sie mit Tränken und Ätherwaren, dann wachsen sie.`,"Mirela: Ab Stufe 8 und Stufe 16 kann eine Sphärenfrucht sie in eine neue Gestalt verwandeln. Quinn verkauft welche, teuer, aber es lohnt sich."]):await this.say(["Mirela: Kapselgeister sind uralte Wesen, gebannt in Sphärenkapseln. In jedem der vier Reiche schläft einer.","Mirela: Wer eine Kapsel öffnet, gewinnt einen treuen Gefährten. Er kämpft selbst, ihr müsst ihm nichts befehlen."]);break}case"kid2":await this.say(["Nele: In der Gruft unter der Stadt soll es einen Turm geben, der nie endet ... sagt mein Opa. Aber mein Opa sagt viel."]);break;case"heal":ja(t),this.view.fxWorld?.("heal"),this.sfx("heal"),await this.say(["Das Wasser der Quelle leuchtet sanft. LP und SP sind wieder voll, der Fortschritt ist gespeichert."]),this.saveGame();break;case"kid":Js(t)>=2?await this.say(["Pip: Die Vögel singen wieder! Mama sagt, das wart ihr!"]):await this.say(["Pip: Wenn ein Held Schaden nimmt, füllt sich seine IP-Leiste. Dann kann er einen Spezialangriff machen, der ist riesig!"]);break;case"guard":await this.say(['Wache Holm: Tipp: Mit "Wache" halbierst du den Schaden. Mit Q/E oder durch Wischen drehst du den Blick, mit dem Mausrad oder zwei Fingern zoomst du.']);break}}async shop(e,t,n){const i=this.S;for(await this.say([t]);;){const s=n?await this.choose(["Kaufen",`Ausrüstung ${wr(i)}M`,"Tschüss",`Münzen: ${i.gold}`],!0,[!1,!1,!1,!0]):await this.choose(["Kaufen","Tschüss",`Münzen: ${i.gold}`],!0,[!1,!1,!0]);if(n&&s===2||!n&&s===1||s===-1)break;if(s===0)for(;;){const a=[],o=[];for(const h of e)a.push(`${At[h].name} ${At[h].price}M (${i.inv[h]||0})`),o.push(i.gold<At[h].price);a.push("Zurück"),o.push(!1);const l=await this.choose(a,!0,o);if(l===-1||l===a.length-1)break;const c=e[l];if(!(i.gold<At[c].price)&&(i.gold-=At[c].price,i.inv[c]=(i.inv[c]||0)+1,this.autoplay))break}else s===1&&await this.buyGear(n,"Mara");if(this.autoplay)break}}async smith(){const e=this.S;for(await this.say(["Torvald: Mara macht ordentliche Arbeit. Aber Klingen aus Sternenstahl, die gibt es nur bei mir."]);!(await this.choose([`Schmieden ${e.gear>=10?"–":wr(e)+"M"}`,"Tschüss",`Münzen: ${e.gold}`],!0,[!1,!1,!0])!==0||(await this.buyGear(10,"Torvald"),this.autoplay)););}async inn(e){const t=this.S,n=Kd(t);await this.say([`${e.name}: Willkommen im „Schlafenden Greif“! Ein warmes Bett kostet ${n} Münzen.`]),!(await this.choose([`Übernachten (${n}M)`,"Nein danke"],!0,[t.gold<n,!1])!==0||t.gold<n)&&(t.gold-=n,await this.fade(1,.6),ja(t),this.saveGame(),this.sfx("heal"),await this.wait(.8),await this.fade(0,.6),await this.say([`${e.name}: Gut geschlafen? LP und SP sind voll, auch eure Kapselgeister sind ausgeruht. Spielstand gespeichert.`]))}async buyGear(e,t){const n=this.S;if(n.gear>=e)await this.say([e>=10?`${t}: Mehr kann kein Schmied der Welt aus Stahl herausholen!`:`${t}: Besser kann ich es nicht. Frag mal Torvald in Lindmark.`]);else if(n.gold<wr(n))await this.say([`${t}: Dafür fehlen dir leider Münzen.`]);else{n.gold-=wr(n),n.gear+=1;for(const i of n.party)i.hp=Math.min(i.hp+8,Pt(n,i));this.sfx("chest"),await this.say([`${t} rüstet euch neu aus: Stufe ${n.gear}. Angriff, Abwehr und Magie steigen!`])}}async fightBoss(e){const t=e.d,n=this.S,i=cf[t.id]||["..."],s=Math.atan2(n.gp.x-e.x,n.gp.y-e.y);await this.cutscene([{x:(e.x+n.gp.x)/2,y:(e.y+n.gp.y)/2,yaw:s+.5,dist:6,pitch:.3,wait:.6,t:i.slice(0,1)},{x:e.x,y:e.y,h:1.5,yaw:s-.25,dist:3.4,pitch:.1,t:i.slice(1)}].filter(o=>o.t.length),"boss");const a=await this.runBattle([t.id],n.map.theme);a==="win"?(n.flags[t.flag]=!0,this.removeObj(e),t.id==="rauschen"?await this.ending():(await this.say(hf[t.id]||["Besiegt!"]),this.saveGame())):a==="lose"&&await this.gameOver()}async ending(){const e=this.S;this.musicOverride="ending",await this.say(["Nihl zerfällt in Sternenstaub. Aus dem Turm steigt ein einzelner, klarer Ton auf, dann ein zweiter, dann tausend.","Die vier Kristalle singen gemeinsam. Über Aetherion geht die Sonne auf, als hätte sie lange gewartet.",`ENDE. Danke fürs Spielen von Aetherion: Chronik der Sphären!  Spielzeit: ${Math.trunc(e.playTime/60)} Min.`]),e.flags.boss_rauschen=!0,this.musicOverride=null,await this.fade(1),this.loadMap("hub",{x:12,y:12}),this.saveGame(),await this.view.ready?.(),await this.fade(0)}async gameOver(){const e=this.S;await this.fade(1),ja(e),e.gold=Math.trunc(e.gold/2),this.loadMap("hub",{x:12,y:12}),await this.view.ready?.(),await this.fade(0),await this.say(["Ihr erwacht in Hafenau an der Quelle. Eure Wunden sind geheilt, doch die Hälfte der Münzen ist verloren."])}async openMenu(){if(this.busy||this.mode!==Ct.WORLD||this.ui.isChoosing()||this.ui.isTalking())return;const e=this.S;for(this.busy=!0,this.setTouch(!1),this.clearDirs();;){const t=[["status","Status"],["items","Items"]];Object.keys(e.caps.own).length&&t.push(["caps","Kapselgeist"]),t.push(["save","Speichern"],["music",`Musik: ${this.audio?.on===!1?"aus":"an"}`],["title","Titel"],["back","Zurück"]);const n=await this.choose(t.map(s=>s[1]),!0),i=n>=0?t[n][0]:"back";if(i==="back")break;if(i==="music"){this.audio&&(this.audio.setOn(!this.audio.on),this.onAudio?.(this.audio.on));continue}if(i==="status")if(this.ui.status)await this.ui.status(this.statusData());else{const s=e.party.map(a=>`${a.name} (${cn(a).role}) Lv ${a.lv}  LP ${a.hp}/${Pt(e,a)}  SP ${a.sp}/${yi(a)}  ANG ${Yt(e,a,"atk")} ABW ${Yt(e,a,"def")} MAG ${Yt(e,a,"mag")}  EXP ${a.exp}/${Oi(a.lv)}`);s.push(`Münzen: ${e.gold}   Ausrüstung: Stufe ${e.gear}   Kristalle: ${Js(e)}/4`),await this.say(s)}else if(i==="items")await this.useItemMenu();else if(i==="caps")await this.capsuleMenu();else if(i==="save")this.saveGame(),await this.say(["Spielstand gespeichert."]);else if(i==="title"){this.saveGame(),this.busy=!1,await this.fade(1),await this.fade(0),this.showTitle();return}if(this.autoplay)break}this.busy=!1,this.setTouch(!0)}statusData(){const e=this.S;return{heroes:e.party.map(t=>({id:t.id,name:t.name,role:cn(t).role,col:cn(t).col,lv:t.lv,hp:t.hp,mhp:Pt(e,t),sp:t.sp,msp:yi(t),atk:Yt(e,t,"atk"),def:Yt(e,t,"def"),mag:Yt(e,t,"mag"),spd:Yt(e,t,"spd"),exp:t.exp,need:Oi(t.lv)})),caps:Object.keys(e.caps.own).map(t=>{const n=e.caps.own[t];return{name:Ft(n),elem:Rn[t].elem,col:Rn[t].col,lv:n.lv,hp:n.hp,mhp:ei(n),exp:n.exp,need:Oi(n.lv),atk:Ti(n,"atk"),mag:Ti(n,"mag"),active:e.caps.active===t}}),gold:e.gold,gear:e.gear,crystals:Js(e),time:e.playTime,inv:{...e.inv}}}async useItemMenu(){const e=this.S;for(;;){const t=[],n=[];for(const o in At)(e.inv[o]||0)>0&&Er(o)==="hero"&&(t.push(o),n.push(`${At[o].name} x${e.inv[o]}`));if(!t.length){await this.say(["Keine Items, die hier wirken."]);return}n.push("Zurück");const i=await this.choose(n,!0);if(i===-1||i===t.length)return;const s=t[i],a=await this.chooseHero();if(a!==-1&&(Lc(e,s,e.party[a])?(e.inv[s]-=1,this.sfx("heal")):await this.say(["Das hätte jetzt keine Wirkung."]),this.autoplay))return}}async capsuleMenu(){const e=this.S;for(;;){const t=Object.keys(e.caps.own),n=t.map(l=>{const c=e.caps.own[l];return`${e.caps.active===l?"★ ":""}${Ft(c)} (${Rn[l].elem}) Lv ${c.lv}  LP ${c.hp}/${ei(c)}`});n.push("Zurück");const i=await this.choose(n,!0);if(i<0||i>=t.length)return;const s=t[i],a=e.caps.own[s],o=await this.choose([e.caps.active===s?"Begleitet euch bereits":"Mitnehmen","Füttern","Zurück"],!0,[e.caps.active===s,!1,!1]);if(o===0?(e.caps.active=s,this.sfx("ok"),await this.say([`${Ft(a)} begleitet euch jetzt.`])):o===1&&await this.feed(a),this.autoplay)return}}async feed(e){const t=this.S,n=Object.keys(At).filter(l=>(t.inv[l]||0)>0&&(br[l]||l==="frucht"));if(!n.length){await this.say(["Nichts zum Füttern im Beutel. Tränke, Ätherwaren und Sphärenfrüchte mögen Kapselgeister am liebsten."]);return}const i=n.map(l=>`${At[l].name} x${t.inv[l]}${l==="frucht"?" (Entwicklung)":` (+${br[l]} EXP)`}`);i.push("Zurück");const s=await this.choose(i,!0);if(s<0||s>=n.length)return;const a=n[s];if(a==="frucht"){if(!da(e)){await this.say([e.form>=2?`${Ft(e)} hat seine höchste Gestalt erreicht.`:`${Ft(e)} ist noch nicht bereit. Ab Stufe ${e.form===0?8:16} kann er sich entwickeln.`]);return}t.inv.frucht-=1;const l=Ft(e);Yd(e),this.sfx("special"),this.view?.fxWorld?.("heal"),await this.say([`${l} verschlingt die Sphärenfrucht ... und beginnt zu leuchten!`,`${l} hat sich zu ${Ft(e)} entwickelt! Neue Fähigkeit: ${Rn[e.id].skills[e.form].name}.`]);return}t.inv[a]-=1;const o=kc(e,br[a]);this.sfx(o.length?"levelup":"heal"),await this.say([`${Ft(e)} frisst genüsslich ${At[a].name}. +${br[a]} EXP${o.length?` – Stufe ${e.lv}!`:"."}`].concat(da(e)&&(t.inv.frucht||0)>0?["Er wirkt unruhig ... eine Sphärenfrucht könnte ihn verwandeln."]:[]))}chooseHero(){const e=this.S;return this.choose(e.party.map(t=>`${t.name}  ${t.hp}/${Pt(e,t)}`),!0)}async startEncounter(){const e=this.S;this.busy=!0,this.setTouch(!1),this.clearDirs(),e.grace=6;let t=e.map.enc,n=e.map.theme;if(e.map.world&&(t=zo[Sa(e)],n=e.reg[e.gp.y][e.gp.x]),!t.length){this.busy=!1,this.setTouch(!0);return}let i=1+(this.rng.randf()<.7?1:0)+(this.rng.randf()<.3?1:0);Pn(e)<3&&(i=Math.min(i,2));const s=[];for(let o=0;o<i;o++)s.push(t[this.rng.randi()%t.length]);await this.bmsg("Gegner greifen an!",.55),await this.runBattle(s,n)==="lose"&&await this.gameOver(),this.busy=!1,this.setTouch(!0)}async startRoamerFight(e){const t=this.S;this.busy=!0,this.setTouch(!1),this.clearDirs();let n=t.map.enc,i=t.map.theme;t.map.world&&(n=zo[Sa(t)],i=t.reg[t.gp.y][t.gp.x]);const s=[e.id];let a=(this.rng.randf()<.5?1:0)+(this.rng.randf()<.2?1:0);Pn(t)<3?a=0:Pn(t)<5&&(a=Math.min(a,1));for(let l=0;l<a;l++)s.push(n[this.rng.randi()%n.length]);await this.bmsg("Ein Monster stellt sich euch in den Weg!",.6);const o=await this.runBattle(s,i);if(o==="win"){const l=t.roamers.indexOf(e);l>=0&&t.roamers.splice(l,1)}else o==="run"?e.stun=3:o==="lose"&&await this.gameOver();t.grace=6,this.busy=!1,this.setTouch(!0)}async runBattle(e,t){const n=this.S;this.sfx("encounter"),await this.fade(1,.18),this.ui.msg(""),this.mode=Ct.BATTLE,this.pickMusic(),n.enemies=e.map(c=>Xd(n,c)),this.battleMusic=e[0]==="rauschen"?"final":n.enemies[0].boss?"boss":"battle";for(const c of n.party)c.ip=0,c.down=c.hp<=0;const i=$d(n);n.bcap=i&&i.hp>0?i:null,await this.view.battleBegin?.(t,n.enemies,n.party,n.bcap),this.setTouch(!1),await this.fade(0,.18);const s=e.length,a=n.enemies[0].boss;await this.bmsg(s===1?`${n.enemies[0].name} erscheint!`:`${s} Gegner!`,.8);let o="",l=0;for(;o==="";){l++;const c=[];let h=0;const u=Vn(n);for(;h<u.length;){const m=u[h];this.curHero=n.party.indexOf(m);let v=await this.pickCommand(m,a);if(v){if(v.type==="run"){if(this.rng.randf()<.65){await this.bmsg("Ihr seid entkommen!",.8),o="run";break}await this.bmsg("Flucht misslungen!",.7),v={type:"guard",h:m}}c.push(v),h++}}if(this.curHero=-1,o!=="")break;const d=[];for(const m of c)d.push({k:"h",who:m.h,c:m,s:Yt(n,m.h,"spd")+this.rng.randf()*3});for(const m of oi(n))d.push({k:"e",who:m,s:m.spd+this.rng.randf()*3});n.bcap&&n.bcap.hp>0&&d.push({k:"c",who:n.bcap,s:Ti(n.bcap,"spd")+this.rng.randf()*3}),d.sort((m,v)=>v.s-m.s);const f=[];for(const m of d){if(!oi(n).length||!Vn(n).length)break;m.k==="h"?m.who.hp>0&&await this.heroAct(m.c,f):m.k==="c"?m.who.hp>0&&await this.capAct(m.who,f):m.who.hp>0&&await this.enemyAct(m.who,f)}oi(n).length?Vn(n).length?this.autoplay&&l>200&&(o="lose"):o="lose":o="win"}o==="win"?await this.victory():o==="lose"&&await this.bmsg("Das Team ist besiegt ...",1.2),this.ui.msg(""),await this.fade(1,.18),this.view.battleEnd?.(),this.mode=Ct.WORLD,n.enemies=[];for(const c of n.party)delete c.down;return n.bcap&&n.bcap.hp<=0&&(n.bcap.hp=1),n.bcap=null,await this.fade(0,.18),o}async pickCommand(e,t){const n=this.S,i=Bo[cn(e).ip];for(;;)switch(await this.chooseCross([!1,!1,e.ip<i.ip,!1,!1,!1])){case 0:{const a=await this.pickEnemy();if(a>=0)return{type:"atk",h:e,t:n.enemies[a]};break}case 1:{const a=cn(e).skills,o=[],l=[];for(const h of a){const u=Sr[h];o.push(`${u.name} ${u.sp}SP`),l.push(e.sp<u.sp)}o.push("Zurück"),l.push(!1);let c=await this.choose(o,!0,l);if(this.autoplay&&c>=0&&c<a.length&&e.sp<Sr[a[c]].sp&&(c=-1),c>=0&&c<a.length){const h=await this.pickSkillTarget(e,Sr[a[c]],a[c],!1);if(h)return h}break}case 2:{if(e.ip<i.ip)break;const a=await this.pickSkillTarget(e,i,cn(e).ip,!0);if(a)return a;break}case 3:{const a=[],o=[];for(const l in At)(n.inv[l]||0)>0&&Er(l)!=="capsule"&&(a.push(l),o.push(`${At[l].name} x${n.inv[l]}`));if(!a.length)await this.bmsg("Keine Items!",.6);else{o.push("Zurück");const l=await this.choose(o,!0);if(l>=0&&l<a.length){if(Er(a[l])==="enemy")return{type:"item",h:e,i:a[l],t:null};const c=await this.chooseHero();if(c>=0)return{type:"item",h:e,i:a[l],t:n.party[c]}}}break}case 4:return{type:"guard",h:e};case 5:if(t)await this.bmsg("Vor diesem Gegner gibt es kein Entkommen!",.9);else return{type:"run",h:e};break}}async pickSkillTarget(e,t,n,i){const s=this.S,a=i?"ipskill":"skill";if(t.kind==="heal"&&!t.all){const l=await this.chooseHero();return l>=0?{type:a,h:e,s:n,t:s.party[l]}:null}if(t.all||t.kind==="guard")return{type:a,h:e,s:n,t:null};const o=await this.pickEnemy();return o>=0?{type:a,h:e,s:n,t:s.enemies[o]}:null}async pickEnemy(){const e=this.S,t=[],n=[];if(e.enemies.forEach((s,a)=>{s.hp>0&&(t.push(a),n.push(s.name))}),t.length===1)return t[0];n.push("Zurück"),this.ui.targetHint?.(t);const i=await this.choose(n,!0);return this.ui.targetHint?.(null),i<0||i>=t.length?-1:t[i]}hitEnemy(e,t,n="slash"){const i=this.S;e.hp=Math.max(0,e.hp-t),this.sfx(n==="magic"?"magic":"hit");const s=i.enemies.indexOf(e);this.view.battleEnemy?.(s,"hurt"),this.view.battleFx?.(n,"enemy",s),this.ui.floatEnemy?.(s,String(t),n==="magic"?"#d8b8ff":"#ffffff")}hurtHero(e,t,n=!1){const i=this.S;e.hp=Math.max(0,e.hp-t),this.sfx(n?"heavy":"hit"),e.ip=Math.min(100,e.ip+(n?22:12));const s=i.party.indexOf(e);this.ui.floatHero?.(s,String(t),"#ff7373"),this.view.battleHero?.(s,"hurt"),this.view.battleFx?.(n?"heavy":"hit","hero",s),this.view.shake?.(n?.32:.22)}async heroAct(e,t){const n=this.S,i=e.h,s=n.party.indexOf(i);switch(e.type){case"guard":t.push(i),this.view.battleHero?.(s,"guard"),this.view.battleFx?.("guard","hero",s),await this.bmsg(`${i.name} geht in Deckung.`,.45);break;case"atk":{let a=e.t;if(a.hp<=0){const o=oi(n);if(!o.length)return;a=o[0]}await this.bmsg(`${i.name} greift ${a.name} an!`,.35),this.view.battleHero?.(s,"attack",n.enemies.indexOf(a)),await this.wait(.28),this.hitEnemy(a,ai(this.rng,Yt(n,i,"atk"),a.def)),await this.wait(.5);break}case"item":{const a=e.t;if(Er(e.i)==="enemy"){if((n.inv[e.i]||0)<=0){await this.bmsg("Ohne Wirkung ...",.5);break}n.inv[e.i]-=1,await this.bmsg(`${i.name} wirft eine ${At[e.i].name}!`,.5),this.view.battleHero?.(s,"attack",-1),this.view.shake?.(.3),await this.wait(.3);for(const o of oi(n))this.hitEnemy(o,Math.trunc((40+9*Pn(n))*this.rng.range(.9,1.1)),"magic");await this.wait(.5)}else if((n.inv[e.i]||0)>0&&Lc(n,e.i,a)){n.inv[e.i]-=1,await this.bmsg(`${i.name} nutzt ${At[e.i].name} auf ${a.name}.`,.8);const o=n.party.indexOf(a);this.ui.floatHero?.(o,"+","#66ff99"),this.view.battleFx?.("heal","hero",o),a.down&&a.hp>0&&(a.down=!1,this.view.battleHero?.(o,"idle"))}else await this.bmsg("Ohne Wirkung ...",.5);break}case"skill":case"ipskill":{const a=e.type==="ipskill",o=a?Bo[e.s]:Sr[e.s];if(a){if(i.ip<o.ip)return;i.ip-=o.ip}else{if(i.sp<o.sp){await this.bmsg("Zu wenig SP!",.5);return}i.sp-=o.sp}if(await this.bmsg(`${i.name}: ${o.name}!`,.5),this.view.battleHero?.(s,o.kind==="phys"?"attack":"cast",e.t&&n.enemies.includes(e.t)?n.enemies.indexOf(e.t):-1),a&&(this.view.battleFx?.("special","hero",s),this.sfx("special")),await this.wait(.3),o.kind==="heal"){let l=o.all?Vn(n):[e.t];if(a){for(const c of n.party)c.hp<=0&&(c.hp=Math.max(1,Math.trunc(Pt(n,c)/2)));l=n.party}for(const c of l){const h=o.mult>50?Pt(n,c)-c.hp:Math.trunc((Yt(n,i,"mag")*o.mult+12)*this.rng.range(.95,1.05));c.hp=Math.min(Pt(n,c),c.hp+h);const u=n.party.indexOf(c);this.sfx("heal"),this.ui.floatHero?.(u,"+"+h,"#66ff99"),this.view.battleFx?.("heal","hero",u),c.down&&c.hp>0&&(c.down=!1,this.view.battleHero?.(u,"idle"))}await this.wait(.5)}else if(o.kind==="guard"){for(const l of Vn(n))t.push(l),this.view.battleFx?.("guard","hero",n.party.indexOf(l));await this.wait(.3)}else{let l=o.all?oi(n):[e.t];!o.all&&l[0].hp<=0&&(l=oi(n).slice(0,1));const c=o.hits||1;for(let h=0;h<c;h++){for(const u of l)u.hp<=0||(o.kind==="phys"?this.hitEnemy(u,ai(this.rng,Yt(n,i,"atk"),u.def,o.mult),a?"bigslash":"slash"):this.hitEnemy(u,Ic(this.rng,Yt(n,i,"mag"),u.def,o.mult),"magic"));await this.wait(.3)}await this.wait(.3)}break}}await this.checkEnemyDeaths()}async capAct(e,t){const n=this.S,i=Rn[e.id],s=oi(n);if(!s.length)return;let a=s[0];for(const u of s)u.hp<a.hp&&(a=u);const o=i.skills.slice(0,e.form+1);let l=this.rng.randf()<.45?o[this.rng.randi()%o.length]:null;const c=Vn(n).some(u=>u.hp<Pt(n,u)*.5);l&&l.kind==="heal"&&!c&&(l=null);const h=Ft(e);if(!l)await this.bmsg(`${h} greift ${a.name} an!`,.35),this.view.battleCap?.("attack",n.enemies.indexOf(a)),await this.wait(.28),this.hitEnemy(a,ai(this.rng,Ti(e,"atk"),a.def)),await this.wait(.45);else{if(await this.bmsg(`${h}: ${l.name}!`,.5),this.view.battleCap?.(l.kind==="phys"?"attack":"cast",l.all?-1:n.enemies.indexOf(a)),this.view.battleFx?.("special","capsule",0),await this.wait(.3),l.kind==="heal"){for(const u of Vn(n)){const d=Math.trunc((Ti(e,"mag")*l.mult+10)*this.rng.range(.95,1.05));u.hp=Math.min(Pt(n,u),u.hp+d);const f=n.party.indexOf(u);this.ui.floatHero?.(f,"+"+d,"#66ff99"),this.view.battleFx?.("heal","hero",f)}this.sfx("heal")}else if(l.kind==="guard")for(const u of Vn(n))t.push(u),this.view.battleFx?.("guard","hero",n.party.indexOf(u));else{const u=l.all?s:[a];for(let d=0;d<(l.hits||1);d++){for(const f of u)f.hp<=0||(l.kind==="phys"?this.hitEnemy(f,ai(this.rng,Ti(e,"atk"),f.def,l.mult),"slash"):this.hitEnemy(f,Ic(this.rng,Ti(e,"mag"),f.def,l.mult),"magic"));await this.wait(.3)}}await this.wait(.3)}await this.checkEnemyDeaths()}async checkEnemyDeaths(){const e=this.S;for(const t of e.enemies)t.hp<=0&&!t.dead&&(t.dead=!0,this.view.battleEnemyDown?.(e.enemies.indexOf(t)),await this.bmsg(`${t.name} zerfällt zu Staub!`,.6))}hurtCap(e,t,n){e.hp=Math.max(0,e.hp-t),this.sfx(n?"heavy":"hit"),this.ui.floatCap?.(String(t),"#ff7373"),this.view.battleCap?.(e.hp>0?"hurt":"death"),this.view.battleFx?.(n?"heavy":"hit","capsule",0)}async enemyAct(e,t){const n=this.S,i=Vn(n);if(!i.length)return;e.turn+=1;const s=e.spec,a=s.length>0&&e.turn%3===0,o=n.enemies.indexOf(e);if(a){this.view.battleEnemy?.(o,"attack"),await this.bmsg(`${e.name}: ${s[0]}!`,.7),this.view.battleFx?.("spec","enemy",o);for(const c of i){let h=ai(this.rng,e.atk,Yt(n,c,"def"),s[1]);t.includes(c)&&(h=Math.max(1,Math.trunc(h/2))),this.hurtHero(c,h,!0)}const l=n.bcap;l&&l.hp>0&&this.hurtCap(l,ai(this.rng,e.atk,Nc(l),s[1]),!0),await this.wait(.5)}else if(n.bcap&&n.bcap.hp>0&&this.rng.randf()<1/(i.length+1)){const l=n.bcap,c=this.rng.randf()<.2;this.view.battleEnemy?.(o,"attack",-2),await this.bmsg(`${e.name} greift ${Ft(l)} an!`,.4),this.hurtCap(l,ai(this.rng,e.atk,Nc(l),c?1.5:1),c),await this.wait(.45),l.hp<=0&&await this.bmsg(`${Ft(l)} ist erschöpft und zieht sich in seine Kapsel zurück.`,.7)}else{const l=this.rng.randf()<.2,c=i[this.rng.randi()%i.length];this.view.battleEnemy?.(o,"attack",n.party.indexOf(c)),await this.bmsg(l?`${e.name} wuchtet auf ${c.name} ein!`:`${e.name} greift ${c.name} an!`,.4);let h=ai(this.rng,e.atk,Yt(n,c,"def"),l?1.5:1);t.includes(c)&&(h=Math.max(1,Math.trunc(h/2))),this.hurtHero(c,h,l),await this.wait(.45)}for(const l of n.party){const c=n.party.indexOf(l);l.hp<=0&&!l.down?(l.down=!0,this.view.battleHero?.(c,"death"),await this.bmsg(`${l.name} geht zu Boden!`,.5)):l.hp>0&&l.down&&(l.down=!1,this.view.battleHero?.(c,"idle"))}}async victory(){const e=this.S;let t=0,n=0;for(const i of e.enemies)t+=i.exp,n+=i.gold;t=of(e,t),e.gold+=n,this.view.battleFx?.("victory"),this.musicOverride="none",this.pickMusic(),this.sfx("victory"),this.view.battleHero?.(-1,"victory"),await this.bmsg(`Sieg!  +${t} EXP  +${n} Münzen`,1),this.rng.randf()<.25&&(e.inv.trank=(e.inv.trank||0)+1,await this.bmsg("Beute: Trank",.7));for(const i of e.party)if(i.down=!1,!(i.hp<=0))for(const s of lf(e,i,t))this.sfx("levelup"),await this.bmsg(`${i.name} erreicht Stufe ${s}!`,.9);for(const i in e.caps.own){const s=e.caps.own[i],a=i===e.caps.active;for(const o of kc(s,a?t:Math.trunc(t/2)))a&&(this.sfx("levelup"),await this.bmsg(`${Ft(s)} erreicht Stufe ${o}!`,.8));a&&da(s)&&s.hinted!==s.form+1&&(s.hinted=s.form+1,await this.bmsg(`${Ft(s)} ist bereit für eine Sphärenfrucht!`,.9))}this.musicOverride=null}debugKey(e){if(!(!this.debug||this.mode!==Ct.WORLD||!this.idle())&&(e==="F9"&&this.startEncounter(),e==="F8")){const t=Xa[(Xa.indexOf(this.S.mapId)+1)%Xa.length];this.loadMap(t,Fc(t))}}}const at=r=>document.getElementById(r),Si=(r,e,t)=>{const n=document.createElement(r);return e&&(n.className=e),t!==void 0&&(n.textContent=t),n},ff={sword:'<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/>',staff:'<path d="M12 22V9"/><circle cx="12" cy="6" r="3"/><path d="M12 1v2M7 3l1.5 1.5M17 3l-1.5 1.5"/>',flame:'<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 6-4 12 0 4.3 3 7 7 7z"/>',bag:'<path d="M6 8h12l1 13H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',run:'<path d="M6 21h7l2-5-4-3 2-5h4M9 8 6 11M15 16l3 5"/><circle cx="15" cy="4" r="2"/>'},pf=r=>`<svg viewBox="0 0 24 24" class="i">${ff[r]}</svg>`,Oc=[["sword","Angriff"],["staff","Fertigkeit"],["flame","Spezial"],["bag","Item"],["shield","Wache"],["run","Flucht"]],Bc={0:[1,2,3,4],1:[-1,0,-1,-1],2:[0,-1,-1,5],3:[-1,-1,-1,0],4:[-1,5,0,-1],5:[4,-1,2,-1]};class mf{constructor(e){this.g=e,this.view=null,this.talking=!1,this.choosingList=null,this.choosingCross=null,this.statusOpen=null,this.touchOn=!1,this.touchDevice=matchMedia("(pointer: coarse)").matches||"ontouchstart"in window,this.cards=[],this.bars=[],this.labels=[],this.targets=null,this.build()}build(){const e=at("cross");this.crossBtns=Oc.map(([c,h],u)=>{const d=Si("button","cb c"+u);return d.innerHTML=pf(c),d.setAttribute("aria-label",h),d.addEventListener("pointerenter",()=>{d.disabled||this.crossFocus(u)}),d.addEventListener("click",()=>{this.choosingCross&&!d.disabled&&this.pickCross(u)}),e.appendChild(d),d}),at("dlg").addEventListener("pointerdown",c=>{this.talking&&(c.preventDefault(),this.advance())}),at("status").addEventListener("pointerdown",()=>this.closeStatus()),at("menuBtn").addEventListener("click",()=>this.g.openMenu());const t=at("joy"),n=at("knob");let i=null,s=0,a=0;const o=c=>{const h=c.clientX-s,u=c.clientY-a,d=Math.hypot(h,u),f=Math.min(d,42);n.style.transform=`translate(${d?h/d*f:0}px, ${d?u/d*f:0}px)`;let m=null;d>=12&&(m=Math.abs(h)>Math.abs(u)?{x:Math.sign(h),y:0}:{x:0,y:Math.sign(u)}),this.g.dpad=m};t.addEventListener("pointerdown",c=>{if(i!==null)return;i=c.pointerId,t.setPointerCapture(i);const h=t.getBoundingClientRect();s=h.left+h.width/2,a=h.top+h.height/2,o(c),c.preventDefault()}),t.addEventListener("pointermove",c=>{c.pointerId===i&&o(c)});const l=c=>{c.pointerId===i&&(i=null,this.g.dpad=null,n.style.transform="")};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),this.joyRelease=()=>{i=null,this.g.dpad=null,n.style.transform=""}}isChoosing(){return!!(this.choosingList||this.choosingCross)}isTalking(){return this.talking||!!this.statusOpen}touchVisible(){return this.touchOn}letterbox(e){document.body.classList.toggle("cine",!!e)}setTouch(e){this.touchOn=e,at("menuBtn").hidden=!e,at("joy").hidden=!(e&&this.touchDevice),e||this.joyRelease()}say(e){return new Promise(t=>{const n=at("dlg"),i=at("dlgText");this.talking=!0,n.hidden=!1;let s=0,a="",o=0,l=0;const c=()=>{a=String(e[s]),o=0,n.classList.remove("more"),clearInterval(l),l=setInterval(()=>{o=Math.min(a.length,o+2),i.textContent=a.slice(0,o),o>=a.length&&(clearInterval(l),n.classList.add("more"))},16)};this.advance=()=>{if(o<a.length){o=a.length,i.textContent=a,clearInterval(l),n.classList.add("more");return}s++,s<e.length?c():(clearInterval(l),this.talking=!1,this.advance=()=>{},n.hidden=!0,i.textContent="",t())},c()})}advance(){}choose(e,t,n,i){return new Promise(s=>{const a=at("menu");a.className="glass menu "+(i===2?"mb":i===0?"mt":"mw"),a.innerHTML="";const o=e.map((h,u)=>{const d=Si("button","mi",String(h));return d.disabled=!!n[u],d.addEventListener("pointerenter",()=>{d.disabled||this.listFocus(u)}),d.addEventListener("click",()=>{d.disabled||l(u)}),a.appendChild(d),d});a.hidden=!1;const l=h=>{this.g.sfx?.(h<0?"cancel":"ok"),this.choosingList=null,a.hidden=!0,a.innerHTML="",this.targetFocus(-1),s(h)};this.choosingList={btns:o,canCancel:t,finish:l,focus:-1};const c=o.findIndex(h=>!h.disabled);this.listFocus(c>=0?c:0)})}listFocus(e){const t=this.choosingList;t&&(t.focus=e,t.btns.forEach((n,i)=>n.classList.toggle("on",i===e)),t.btns[e]?.scrollIntoView?.({block:"nearest"}),this.targetFocus(this.targets&&e<this.targets.length?this.targets[e]:-1))}listMove(e){const t=this.choosingList;if(!t)return;const n=t.btns.length;let i=t.focus;for(let s=0;s<n&&(i=(i+e+n)%n,!!t.btns[i].disabled);s++);i!==t.focus&&this.g.sfx?.("move"),this.listFocus(i)}targetHint(e){this.targets=e}targetFocus(e){this.bars.forEach((t,n)=>t&&t.classList.toggle("tgt",n===e))}chooseCross(e){return new Promise(t=>{this.crossBtns.forEach((n,i)=>{n.disabled=!!e[i]}),at("cross").hidden=!1,this.choosingCross={done:t,focus:0},this.crossFocus(0)})}crossFocus(e){this.choosingCross&&(this.choosingCross.focus=e,this.crossBtns.forEach((t,n)=>t.classList.toggle("on",n===e)),at("crossLbl").textContent=Oc[e][1])}crossMove(e){const t=this.choosingCross;if(!t)return;let n=Bc[t.focus][e];if(n>=0&&this.crossBtns[n].disabled){const i=Bc[n][e];n=i>=0?i:-1}n>=0&&(this.crossFocus(n),this.g.sfx?.("move"))}pickCross(e){const t=this.choosingCross;!t||this.crossBtns[e].disabled||(this.choosingCross=null,at("cross").hidden=!0,this.g.sfx?.("ok"),t.done(e))}status(e){return new Promise(t=>{const n=at("status"),i=Math.floor(e.time/60);n.innerHTML=`<div class="glass sbox"><h3>Status</h3><div class="sgrid">${e.heroes.map(s=>`
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
        <p class="sk">Weiter mit Bestätigen oder Antippen</p></div>`,n.hidden=!1,this.statusOpen=()=>{n.hidden=!0,n.innerHTML="",this.statusOpen=null,t()}})}closeStatus(){this.statusOpen&&this.statusOpen()}msg(e){const t=at("msg");t.textContent=e,t.hidden=!e}banner(e,t){return new Promise(n=>{const i=at("banner");i.textContent=e,i.hidden=!1,i.classList.remove("show"),i.offsetWidth,i.classList.add("show"),setTimeout(()=>{i.hidden=!0,i.classList.remove("show"),n()},t*1e3)})}fade(e,t){const n=at("fade");return n.style.transition=`opacity ${t}s ease`,n.style.opacity=e,new Promise(i=>setTimeout(i,t*1e3+20))}fadeNow(e){const t=at("fade");t.style.transition="none",t.style.opacity=e}float(e,t,n,i,s){const a=Si("div","fl"+(s?" big":""),n);a.style.left=e+"px",a.style.top=t+"px",a.style.color=i,at("floats").appendChild(a),setTimeout(()=>a.remove(),950)}floatEnemy(e,t,n){if(!this.view)return;const i=this.view.battle.enemies[e],s=this.view.screenPos("enemy",e,i?i.h*.85:1.5);s&&this.float(s.x+(Math.random()-.5)*30,s.y,t,n,!0)}floatCap(e,t){if(this.capCard){const n=this.capCard.el.getBoundingClientRect();this.float(n.left+n.width*.5,n.top-4,e,t,!1)}}floatHero(e,t,n){const i=this.cards[e];if(!i)return;const s=i.el.getBoundingClientRect();this.float(s.left+s.width*.5,s.top-4,t,n,!1)}frame(){const e=this.g,t=e.S,n=e.mode===1,i=e.mode===2;if(at("hud").hidden=!n,at("title").hidden=e.mode!==0,n){const s=`${t.map.name}`;this._hudT!==s&&(this._hudT=s,at("hudName").textContent=s),this._hudG!==t.gold&&(this._hudG=t.gold,at("hudGold").textContent=t.gold)}this.frameLabels(n&&t.map.world),this.frameBattle(i)}frameLabels(e){const t=at("labels"),n=this.view;if(!e||!n||!n.labels.length){this.labels.length&&(t.innerHTML="",this.labels=[]);return}(this.labels.length!==n.labels.length||this._labMap!==n.labels)&&(t.innerHTML="",this._labMap=n.labels,this.labels=n.labels.map(i=>{const s=Si("div","lab",i.p.label);return t.appendChild(s),s})),n.labels.forEach((i,s)=>{const a=this.labels[s],o=n.project(i.node.position.clone().setY(i.node.position.y+i.h));a.style.transform=`translate(${o.x}px, ${o.y}px) translate(-50%, -100%)`;const l=Vo(this.g.S,i.p);a.classList.toggle("closed",!l),a.hidden=!o.vis})}frameBattle(e){const t=this.g,n=t.S,i=this.view,s=at("party"),a=at("bars");if(s.hidden=!e,!e){this.cards.length&&(s.innerHTML="",this.cards=[]),this.capCard=null,this.bars.length&&(a.innerHTML="",this.bars=[]);return}this.cards.length!==n.party.length&&(s.innerHTML="",this.capCard=null,this.cards=n.party.map(l=>{const c=Fi[l.id],h=Si("div","card glass");h.style.setProperty("--hc",c.col),h.innerHTML=`<div class="ch"><i class="av">${c.name[0]}</i><b>${c.name}</b><em>Lv <span class="lv"></span></em></div>
          <div class="br hp"><span>LP</span><u><s></s></u><em class="v"></em></div>
          <div class="br sp"><span>SP</span><u><s></s></u><em class="v"></em></div>
          <div class="br ip"><span>IP</span><u><s></s><i class="mk"></i></u></div>`,s.appendChild(h);const u=d=>h.querySelector(d);return{el:h,lv:u(".lv"),hp:u(".hp s"),hpv:u(".hp .v"),sp:u(".sp s"),spv:u(".sp .v"),ip:u(".ip s"),mk:u(".mk"),last:""}})),n.party.forEach((l,c)=>{const h=this.cards[c],u=Pt(n,l),d=yi(l),f=Bo[Fi[l.id].ip].ip,m=[l.hp,u,l.sp,d,l.ip,l.lv,t.curHero===c].join();h.last!==m&&(h.last=m,h.lv.textContent=l.lv,h.hp.style.width=l.hp/u*100+"%",h.hp.classList.toggle("low",l.hp/u<=.3),h.hpv.textContent=l.hp,h.sp.style.width=l.sp/Math.max(1,d)*100+"%",h.spv.textContent=l.sp,h.ip.style.width=l.ip+"%",h.mk.style.left=f+"%",h.el.classList.toggle("ready",l.ip>=f),h.el.classList.toggle("hot",t.curHero===c),h.el.classList.toggle("down",l.hp<=0))});const o=n.bcap;if(o&&(!this.capCard||this.capCard.id!==o.id+o.form)){this.capCard?.el.remove();const l=Si("div","card glass cap");l.style.setProperty("--hc",Rn[o.id].col),l.innerHTML=`<div class="ch"><i class="av">◆</i><b>${Ft(o)}</b><em>Lv <span class="lv"></span></em></div><div class="br hp"><span>LP</span><u><s></s></u><em class="v"></em></div>`,s.appendChild(l),this.capCard={id:o.id+o.form,el:l,lv:l.querySelector(".lv"),hp:l.querySelector(".hp s"),hpv:l.querySelector(".hp .v"),last:""}}else!o&&this.capCard&&(this.capCard.el.remove(),this.capCard=null);if(o){const l=this.capCard,c=ei(o),h=o.hp+","+c+","+o.lv;l.last!==h&&(l.last=h,l.lv.textContent=o.lv,l.hp.style.width=o.hp/c*100+"%",l.hp.classList.toggle("low",o.hp/c<=.3),l.hpv.textContent=o.hp,l.el.classList.toggle("down",o.hp<=0))}i&&(this.bars.length!==n.enemies.length&&(a.innerHTML="",this.bars=n.enemies.map(l=>{const c=Si("div","eb"+(l.boss?" boss":""));return c.innerHTML=`<b>${l.name}</b><u><s></s></u>`,a.appendChild(c),c})),n.enemies.forEach((l,c)=>{const h=this.bars[c],u=i.battle.enemies[c];if(!h)return;if(l.hp<=0||!u){h.hidden=!0;return}const d=i.screenPos("enemy",c,u.h+.35);if(!d){h.hidden=!0;return}h.hidden=!1,h.style.transform=`translate(${d.x}px, ${d.y}px) translate(-50%, -100%)`,h.querySelector("s").style.width=l.hp/l.mhp*100+"%"}))}action(e){if(this.statusOpen)return(e==="ok"||e==="cancel"||e==="menu")&&this.closeStatus(),!0;if(this.talking)return e==="ok"||e==="cancel"?(this.advance(),!0):!1;if(this.choosingList){const t=this.choosingList;return e==="up"||e==="left"?this.listMove(-1):e==="down"||e==="right"?this.listMove(1):e==="ok"?t.btns[t.focus]&&!t.btns[t.focus].disabled&&t.finish(t.focus):e==="cancel"&&t.canCancel&&t.finish(-1),!0}if(this.choosingCross){const t={up:0,down:1,left:2,right:3}[e];return t!==void 0?this.crossMove(t):e==="ok"&&this.pickCross(this.choosingCross.focus),!0}return!1}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Xl="170",gf=0,zc=1,vf=2,wu=1,Eu=2,Kn=3,ni=0,zt=1,xt=2,Dt=0,Bi=1,Ln=2,Hc=3,Vc=4,Au=5,_n=100,_f=101,xf=102,yf=103,Mf=104,Qs=200,Tf=201,Sf=202,bf=203,Go=204,Wo=205,Xo=206,wf=207,qo=208,Ef=209,Af=210,Rf=211,Cf=212,Pf=213,Df=214,jo=0,$o=1,Yo=2,Ss=3,Ko=4,Zo=5,Jo=6,Qo=7,Ru=0,If=1,Lf=2,xi=0,Cu=1,Pu=2,Du=3,ql=4,Nf=5,Iu=6,Lu=7,Gc="attached",Uf="detached",Nu=300,bs=301,ws=302,ba=303,el=304,Fa=306,bn=1e3,Nn=1001,wa=1002,Lt=1003,Uu=1004,er=1005,yt=1006,fa=1007,Tn=1008,Un=1009,ku=1010,Fu=1011,pr=1012,jl=1013,zi=1014,Zt=1015,Bt=1016,$l=1017,Yl=1018,Hi=1020,Ou=35902,Bu=1021,zu=1022,qt=1023,Hu=1024,Vu=1025,_s=1026,Vi=1027,Kl=1028,Zl=1029,Gu=1030,Jl=1031,Ql=1033,pa=33776,ma=33777,ga=33778,va=33779,tl=35840,nl=35841,il=35842,sl=35843,rl=36196,al=37492,ol=37496,ll=37808,cl=37809,hl=37810,ul=37811,dl=37812,fl=37813,pl=37814,ml=37815,gl=37816,vl=37817,_l=37818,xl=37819,yl=37820,Ml=37821,_a=36492,Tl=36494,Sl=36495,Wu=36283,bl=36284,wl=36285,El=36286,Xu=2200,qu=2201,kf=2202,mr=2300,gr=2301,$a=2302,ms=2400,gs=2401,Ea=2402,ec=2500,Ff=2501,Of=0,ju=1,Al=2,Bf=3200,zf=3201,tc=0,Hf=1,gi="",dt="srgb",Ht="srgb-linear",Oa="linear",st="srgb",Yi=7680,Wc=519,Vf=512,Gf=513,Wf=514,$u=515,Xf=516,qf=517,jf=518,$f=519,Rl=35044,Xc="300 es",Qn=2e3,Aa=2001;class Wi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}}const Ut=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let qc=1234567;const ar=Math.PI/180,Es=180/Math.PI;function Sn(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ut[r&255]+Ut[r>>8&255]+Ut[r>>16&255]+Ut[r>>24&255]+"-"+Ut[e&255]+Ut[e>>8&255]+"-"+Ut[e>>16&15|64]+Ut[e>>24&255]+"-"+Ut[t&63|128]+Ut[t>>8&255]+"-"+Ut[t>>16&255]+Ut[t>>24&255]+Ut[n&255]+Ut[n>>8&255]+Ut[n>>16&255]+Ut[n>>24&255]).toLowerCase()}function Mt(r,e,t){return Math.max(e,Math.min(t,r))}function nc(r,e){return(r%e+e)%e}function Yf(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function Kf(r,e,t){return r!==e?(t-r)/(e-r):0}function or(r,e,t){return(1-t)*r+t*e}function Zf(r,e,t,n){return or(r,e,1-Math.exp(-t*n))}function Jf(r,e=1){return e-Math.abs(nc(r,e*2)-e)}function Qf(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function ep(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function tp(r,e){return r+Math.floor(Math.random()*(e-r+1))}function np(r,e){return r+Math.random()*(e-r)}function ip(r){return r*(.5-Math.random())}function sp(r){r!==void 0&&(qc=r);let e=qc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function rp(r){return r*ar}function ap(r){return r*Es}function op(r){return(r&r-1)===0&&r!==0}function lp(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function cp(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function hp(r,e,t,n,i){const s=Math.cos,a=Math.sin,o=s(t/2),l=a(t/2),c=s((e+n)/2),h=a((e+n)/2),u=s((e-n)/2),d=a((e-n)/2),f=s((n-e)/2),m=a((n-e)/2);switch(i){case"XYX":r.set(o*h,l*u,l*d,o*c);break;case"YZY":r.set(l*d,o*h,l*u,o*c);break;case"ZXZ":r.set(l*u,l*d,o*h,o*c);break;case"XZX":r.set(o*h,l*m,l*f,o*c);break;case"YXY":r.set(l*f,o*h,l*m,o*c);break;case"ZYZ":r.set(l*m,l*f,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function xn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function rt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const Cl={DEG2RAD:ar,RAD2DEG:Es,generateUUID:Sn,clamp:Mt,euclideanModulo:nc,mapLinear:Yf,inverseLerp:Kf,lerp:or,damp:Zf,pingpong:Jf,smoothstep:Qf,smootherstep:ep,randInt:tp,randFloat:np,randFloatSpread:ip,seededRandom:sp,degToRad:rp,radToDeg:ap,isPowerOfTwo:op,ceilPowerOfTwo:lp,floorPowerOfTwo:cp,setQuaternionFromProperEuler:hp,normalize:rt,denormalize:xn};class ae{constructor(e=0,t=0){ae.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ve{constructor(e,t,n,i,s,a,o,l,c){Ve.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c)}set(e,t,n,i,s,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],m=n[8],v=i[0],g=i[3],p=i[6],x=i[1],T=i[4],_=i[7],D=i[2],E=i[5],R=i[8];return s[0]=a*v+o*x+l*D,s[3]=a*g+o*T+l*E,s[6]=a*p+o*_+l*R,s[1]=c*v+h*x+u*D,s[4]=c*g+h*T+u*E,s[7]=c*p+h*_+u*R,s[2]=d*v+f*x+m*D,s[5]=d*g+f*T+m*E,s[8]=d*p+f*_+m*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+i*s*c-i*a*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*s,f=c*s-a*l,m=t*u+n*d+i*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/m;return e[0]=u*v,e[1]=(i*c-h*n)*v,e[2]=(o*n-i*a)*v,e[3]=d*v,e[4]=(h*t-i*l)*v,e[5]=(i*s-o*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*s)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ya.makeScale(e,t)),this}rotate(e){return this.premultiply(Ya.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ya.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ya=new Ve;function Yu(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function vr(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function up(){const r=vr("canvas");return r.style.display="block",r}const jc={};function tr(r){r in jc||(jc[r]=!0,console.warn(r))}function dp(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function fp(r){const e=r.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function pp(r){const e=r.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const qe={enabled:!0,workingColorSpace:Ht,spaces:{},convert:function(r,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===st&&(r.r=ti(r.r),r.g=ti(r.g),r.b=ti(r.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(r.applyMatrix3(this.spaces[e].toXYZ),r.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===st&&(r.r=xs(r.r),r.g=xs(r.g),r.b=xs(r.b))),r},fromWorkingColorSpace:function(r,e){return this.convert(r,this.workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===gi?Oa:this.spaces[r].transfer},getLuminanceCoefficients:function(r,e=this.workingColorSpace){return r.fromArray(this.spaces[e].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,e,t){return r.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}};function ti(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function xs(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}const $c=[.64,.33,.3,.6,.15,.06],Yc=[.2126,.7152,.0722],Kc=[.3127,.329],Zc=new Ve().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Jc=new Ve().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);qe.define({[Ht]:{primaries:$c,whitePoint:Kc,transfer:Oa,toXYZ:Zc,fromXYZ:Jc,luminanceCoefficients:Yc,workingColorSpaceConfig:{unpackColorSpace:dt},outputColorSpaceConfig:{drawingBufferColorSpace:dt}},[dt]:{primaries:$c,whitePoint:Kc,transfer:st,toXYZ:Zc,fromXYZ:Jc,luminanceCoefficients:Yc,outputColorSpaceConfig:{drawingBufferColorSpace:dt}}});let Ki;class mp{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ki===void 0&&(Ki=vr("canvas")),Ki.width=e.width,Ki.height=e.height;const n=Ki.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ki}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=vr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=ti(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ti(t[n]/255)*255):t[n]=ti(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let gp=0;class Ku{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:gp++}),this.uuid=Sn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(Ka(i[a].image)):s.push(Ka(i[a]))}else s=Ka(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function Ka(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?mp.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let vp=0;class Tt extends Wi{constructor(e=Tt.DEFAULT_IMAGE,t=Tt.DEFAULT_MAPPING,n=Nn,i=Nn,s=yt,a=Tn,o=qt,l=Un,c=Tt.DEFAULT_ANISOTROPY,h=gi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:vp++}),this.uuid=Sn(),this.name="",this.source=new Ku(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ae(0,0),this.repeat=new ae(1,1),this.center=new ae(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Nu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case bn:e.x=e.x-Math.floor(e.x);break;case Nn:e.x=e.x<0?0:1;break;case wa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case bn:e.y=e.y-Math.floor(e.y);break;case Nn:e.y=e.y<0?0:1;break;case wa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Tt.DEFAULT_IMAGE=null;Tt.DEFAULT_MAPPING=Nu;Tt.DEFAULT_ANISOTROPY=1;class Ze{constructor(e=0,t=0,n=0,i=1){Ze.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],v=l[2],g=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(m+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const T=(c+1)/2,_=(f+1)/2,D=(p+1)/2,E=(h+d)/4,R=(u+v)/4,w=(m+g)/4;return T>_&&T>D?T<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(T),i=E/n,s=R/n):_>D?_<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(_),n=E/i,s=w/i):D<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(D),n=R/s,i=w/s),this.set(n,i,s,t),this}let x=Math.sqrt((g-m)*(g-m)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(g-m)/x,this.y=(u-v)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class _p extends Wi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Ze(0,0,e,t),this.scissorTest=!1,this.viewport=new Ze(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:yt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Tt(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Ku(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Qt extends _p{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Zu extends Tt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Lt,this.minFilter=Lt,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class xp extends Tt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Lt,this.minFilter=Lt,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class jt{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=s[a+0],f=s[a+1],m=s[a+2],v=s[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=m,e[t+3]=v;return}if(u!==v||l!==d||c!==f||h!==m){let g=1-o;const p=l*d+c*f+h*m+u*v,x=p>=0?1:-1,T=1-p*p;if(T>Number.EPSILON){const D=Math.sqrt(T),E=Math.atan2(D,p*x);g=Math.sin(g*E)/D,o=Math.sin(o*E)/D}const _=o*x;if(l=l*g+d*_,c=c*g+f*_,h=h*g+m*_,u=u*g+v*_,g===1-o){const D=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=D,c*=D,h*=D,u*=D}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,s,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=s[a],d=s[a+1],f=s[a+2],m=s[a+3];return e[t]=o*m+h*u+l*f-c*d,e[t+1]=l*m+h*d+c*u-o*f,e[t+2]=c*m+h*f+o*d-l*u,e[t+3]=h*m-o*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(s/2),d=l(n/2),f=l(i/2),m=l(s/2);switch(a){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(a-i)*f}else if(n>o&&n>u){const f=2*Math.sqrt(1+n-o-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(s+c)/f}else if(o>u){const f=2*Math.sqrt(1+o-n-u);this._w=(s-c)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-o);this._w=(a-i)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Mt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-s*l,this._y=i*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const f=1-t;return this._w=f*a+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=s*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class A{constructor(e=0,t=0,n=0){A.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Qc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Qc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-s*i),u=2*(s*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-s*u,this.z=i+l*u+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-s*o,this.y=s*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Za.copy(this).projectOnVector(e),this.sub(Za)}reflect(e){return this.sub(Za.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Za=new A,Qc=new jt;class wn{constructor(e=new A(1/0,1/0,1/0),t=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(pn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(pn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=pn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,pn):pn.fromBufferAttribute(s,a),pn.applyMatrix4(e.matrixWorld),this.expandByPoint(pn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Rr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Rr.copy(n.boundingBox)),Rr.applyMatrix4(e.matrixWorld),this.union(Rr)}const i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,pn),pn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Os),Cr.subVectors(this.max,Os),Zi.subVectors(e.a,Os),Ji.subVectors(e.b,Os),Qi.subVectors(e.c,Os),li.subVectors(Ji,Zi),ci.subVectors(Qi,Ji),bi.subVectors(Zi,Qi);let t=[0,-li.z,li.y,0,-ci.z,ci.y,0,-bi.z,bi.y,li.z,0,-li.x,ci.z,0,-ci.x,bi.z,0,-bi.x,-li.y,li.x,0,-ci.y,ci.x,0,-bi.y,bi.x,0];return!Ja(t,Zi,Ji,Qi,Cr)||(t=[1,0,0,0,1,0,0,0,1],!Ja(t,Zi,Ji,Qi,Cr))?!1:(Pr.crossVectors(li,ci),t=[Pr.x,Pr.y,Pr.z],Ja(t,Zi,Ji,Qi,Cr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,pn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(pn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Gn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Gn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Gn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Gn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Gn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Gn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Gn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Gn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Gn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Gn=[new A,new A,new A,new A,new A,new A,new A,new A],pn=new A,Rr=new wn,Zi=new A,Ji=new A,Qi=new A,li=new A,ci=new A,bi=new A,Os=new A,Cr=new A,Pr=new A,wi=new A;function Ja(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){wi.fromArray(r,s);const o=i.x*Math.abs(wi.x)+i.y*Math.abs(wi.y)+i.z*Math.abs(wi.z),l=e.dot(wi),c=t.dot(wi),h=n.dot(wi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const yp=new wn,Bs=new A,Qa=new A;class Fn{constructor(e=new A,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):yp.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Bs.subVectors(e,this.center);const t=Bs.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Bs,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Qa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Bs.copy(e.center).add(Qa)),this.expandByPoint(Bs.copy(e.center).sub(Qa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Wn=new A,eo=new A,Dr=new A,hi=new A,to=new A,Ir=new A,no=new A;class Ba{constructor(e=new A,t=new A(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Wn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Wn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Wn.copy(this.origin).addScaledVector(this.direction,t),Wn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){eo.copy(e).add(t).multiplyScalar(.5),Dr.copy(t).sub(e).normalize(),hi.copy(this.origin).sub(eo);const s=e.distanceTo(t)*.5,a=-this.direction.dot(Dr),o=hi.dot(this.direction),l=-hi.dot(Dr),c=hi.lengthSq(),h=Math.abs(1-a*a);let u,d,f,m;if(h>0)if(u=a*l-o,d=a*o-l,m=s*h,u>=0)if(d>=-m)if(d<=m){const v=1/h;u*=v,d*=v,f=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=s,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d=-s,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-a*s+o)),d=u>0?-s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(u=Math.max(0,-(a*s+o)),d=u>0?s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c);else d=a>0?-s:s,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(eo).addScaledVector(Dr,d),f}intersectSphere(e,t){Wn.subVectors(e.center,this.origin);const n=Wn.dot(this.direction),i=Wn.dot(Wn)-n*n,s=e.radius*e.radius;if(i>s)return null;const a=Math.sqrt(s-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(s=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(s=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Wn)!==null}intersectTriangle(e,t,n,i,s){to.subVectors(t,e),Ir.subVectors(n,e),no.crossVectors(to,Ir);let a=this.direction.dot(no),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;hi.subVectors(this.origin,e);const l=o*this.direction.dot(Ir.crossVectors(hi,Ir));if(l<0)return null;const c=o*this.direction.dot(to.cross(hi));if(c<0||l+c>a)return null;const h=-o*hi.dot(no);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Pe{constructor(e,t,n,i,s,a,o,l,c,h,u,d,f,m,v,g){Pe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c,h,u,d,f,m,v,g)}set(e,t,n,i,s,a,o,l,c,h,u,d,f,m,v,g){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=s,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=m,p[11]=v,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Pe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/es.setFromMatrixColumn(e,0).length(),s=1/es.setFromMatrixColumn(e,1).length(),a=1/es.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const d=a*h,f=a*u,m=o*h,v=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+m*c,t[5]=d-v*c,t[9]=-o*l,t[2]=v-d*c,t[6]=m+f*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*h,f=l*u,m=c*h,v=c*u;t[0]=d+v*o,t[4]=m*o-f,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-m,t[6]=v+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*h,f=l*u,m=c*h,v=c*u;t[0]=d-v*o,t[4]=-a*u,t[8]=m+f*o,t[1]=f+m*o,t[5]=a*h,t[9]=v-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*h,f=a*u,m=o*h,v=o*u;t[0]=l*h,t[4]=m*c-f,t[8]=d*c+v,t[1]=l*u,t[5]=v*c+d,t[9]=f*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,f=a*c,m=o*l,v=o*c;t[0]=l*h,t[4]=v-d*u,t[8]=m*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=f*u+m,t[10]=d-v*u}else if(e.order==="XZY"){const d=a*l,f=a*c,m=o*l,v=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+v,t[5]=a*h,t[9]=f*u-m,t[2]=m*u-f,t[6]=o*h,t[10]=v*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Mp,e,Tp)}lookAt(e,t,n){const i=this.elements;return tn.subVectors(e,t),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),ui.crossVectors(n,tn),ui.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),ui.crossVectors(n,tn)),ui.normalize(),Lr.crossVectors(tn,ui),i[0]=ui.x,i[4]=Lr.x,i[8]=tn.x,i[1]=ui.y,i[5]=Lr.y,i[9]=tn.y,i[2]=ui.z,i[6]=Lr.z,i[10]=tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],m=n[2],v=n[6],g=n[10],p=n[14],x=n[3],T=n[7],_=n[11],D=n[15],E=i[0],R=i[4],w=i[8],M=i[12],y=i[1],C=i[5],L=i[9],I=i[13],O=i[2],V=i[6],B=i[10],$=i[14],G=i[3],H=i[7],K=i[11],Q=i[15];return s[0]=a*E+o*y+l*O+c*G,s[4]=a*R+o*C+l*V+c*H,s[8]=a*w+o*L+l*B+c*K,s[12]=a*M+o*I+l*$+c*Q,s[1]=h*E+u*y+d*O+f*G,s[5]=h*R+u*C+d*V+f*H,s[9]=h*w+u*L+d*B+f*K,s[13]=h*M+u*I+d*$+f*Q,s[2]=m*E+v*y+g*O+p*G,s[6]=m*R+v*C+g*V+p*H,s[10]=m*w+v*L+g*B+p*K,s[14]=m*M+v*I+g*$+p*Q,s[3]=x*E+T*y+_*O+D*G,s[7]=x*R+T*C+_*V+D*H,s[11]=x*w+T*L+_*B+D*K,s[15]=x*M+T*I+_*$+D*Q,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],m=e[3],v=e[7],g=e[11],p=e[15];return m*(+s*l*u-i*c*u-s*o*d+n*c*d+i*o*f-n*l*f)+v*(+t*l*f-t*c*d+s*a*d-i*a*f+i*c*h-s*l*h)+g*(+t*c*u-t*o*f-s*a*u+n*a*f+s*o*h-n*c*h)+p*(-i*o*h-t*l*u+t*o*d+i*a*u-n*a*d+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],m=e[12],v=e[13],g=e[14],p=e[15],x=u*g*c-v*d*c+v*l*f-o*g*f-u*l*p+o*d*p,T=m*d*c-h*g*c-m*l*f+a*g*f+h*l*p-a*d*p,_=h*v*c-m*u*c+m*o*f-a*v*f-h*o*p+a*u*p,D=m*u*l-h*v*l-m*o*d+a*v*d+h*o*g-a*u*g,E=t*x+n*T+i*_+s*D;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/E;return e[0]=x*R,e[1]=(v*d*s-u*g*s-v*i*f+n*g*f+u*i*p-n*d*p)*R,e[2]=(o*g*s-v*l*s+v*i*c-n*g*c-o*i*p+n*l*p)*R,e[3]=(u*l*s-o*d*s-u*i*c+n*d*c+o*i*f-n*l*f)*R,e[4]=T*R,e[5]=(h*g*s-m*d*s+m*i*f-t*g*f-h*i*p+t*d*p)*R,e[6]=(m*l*s-a*g*s-m*i*c+t*g*c+a*i*p-t*l*p)*R,e[7]=(a*d*s-h*l*s+h*i*c-t*d*c-a*i*f+t*l*f)*R,e[8]=_*R,e[9]=(m*u*s-h*v*s-m*n*f+t*v*f+h*n*p-t*u*p)*R,e[10]=(a*v*s-m*o*s+m*n*c-t*v*c-a*n*p+t*o*p)*R,e[11]=(h*o*s-a*u*s-h*n*c+t*u*c+a*n*f-t*o*f)*R,e[12]=D*R,e[13]=(h*v*i-m*u*i+m*n*d-t*v*d-h*n*g+t*u*g)*R,e[14]=(m*o*i-a*v*i-m*n*l+t*v*l+a*n*g-t*o*g)*R,e[15]=(a*u*i-h*o*i+h*n*l-t*u*l-a*n*d+t*o*d)*R,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,u=o+o,d=s*c,f=s*h,m=s*u,v=a*h,g=a*u,p=o*u,x=l*c,T=l*h,_=l*u,D=n.x,E=n.y,R=n.z;return i[0]=(1-(v+p))*D,i[1]=(f+_)*D,i[2]=(m-T)*D,i[3]=0,i[4]=(f-_)*E,i[5]=(1-(d+p))*E,i[6]=(g+x)*E,i[7]=0,i[8]=(m+T)*R,i[9]=(g-x)*R,i[10]=(1-(d+v))*R,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=es.set(i[0],i[1],i[2]).length();const a=es.set(i[4],i[5],i[6]).length(),o=es.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],mn.copy(this);const c=1/s,h=1/a,u=1/o;return mn.elements[0]*=c,mn.elements[1]*=c,mn.elements[2]*=c,mn.elements[4]*=h,mn.elements[5]*=h,mn.elements[6]*=h,mn.elements[8]*=u,mn.elements[9]*=u,mn.elements[10]*=u,t.setFromRotationMatrix(mn),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=Qn){const l=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),d=(n+i)/(n-i);let f,m;if(o===Qn)f=-(a+s)/(a-s),m=-2*a*s/(a-s);else if(o===Aa)f=-a/(a-s),m=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=Qn){const l=this.elements,c=1/(t-e),h=1/(n-i),u=1/(a-s),d=(t+e)*c,f=(n+i)*h;let m,v;if(o===Qn)m=(a+s)*u,v=-2*u;else if(o===Aa)m=s*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=v,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const es=new A,mn=new Pe,Mp=new A(0,0,0),Tp=new A(1,1,1),ui=new A,Lr=new A,tn=new A,eh=new Pe,th=new jt;class kn{constructor(e=0,t=0,n=0,i=kn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(Mt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Mt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Mt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Mt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Mt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Mt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return eh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(eh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return th.setFromEuler(this),this.setFromQuaternion(th,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}kn.DEFAULT_ORDER="XYZ";class Ju{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Sp=0;const nh=new A,ts=new jt,Xn=new Pe,Nr=new A,zs=new A,bp=new A,wp=new jt,ih=new A(1,0,0),sh=new A(0,1,0),rh=new A(0,0,1),ah={type:"added"},Ep={type:"removed"},ns={type:"childadded",child:null},io={type:"childremoved",child:null};class ct extends Wi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Sp++}),this.uuid=Sn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ct.DEFAULT_UP.clone();const e=new A,t=new kn,n=new jt,i=new A(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Pe},normalMatrix:{value:new Ve}}),this.matrix=new Pe,this.matrixWorld=new Pe,this.matrixAutoUpdate=ct.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ju,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ts.setFromAxisAngle(e,t),this.quaternion.multiply(ts),this}rotateOnWorldAxis(e,t){return ts.setFromAxisAngle(e,t),this.quaternion.premultiply(ts),this}rotateX(e){return this.rotateOnAxis(ih,e)}rotateY(e){return this.rotateOnAxis(sh,e)}rotateZ(e){return this.rotateOnAxis(rh,e)}translateOnAxis(e,t){return nh.copy(e).applyQuaternion(this.quaternion),this.position.add(nh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ih,e)}translateY(e){return this.translateOnAxis(sh,e)}translateZ(e){return this.translateOnAxis(rh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Xn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Nr.copy(e):Nr.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),zs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Xn.lookAt(zs,Nr,this.up):Xn.lookAt(Nr,zs,this.up),this.quaternion.setFromRotationMatrix(Xn),i&&(Xn.extractRotation(i.matrixWorld),ts.setFromRotationMatrix(Xn),this.quaternion.premultiply(ts.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ah),ns.child=e,this.dispatchEvent(ns),ns.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ep),io.child=e,this.dispatchEvent(io),io.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Xn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Xn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Xn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ah),ns.child=e,this.dispatchEvent(ns),ns.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zs,e,bp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zs,wp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),m.length>0&&(n.nodes=m)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}ct.DEFAULT_UP=new A(0,1,0);ct.DEFAULT_MATRIX_AUTO_UPDATE=!0;ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const gn=new A,qn=new A,so=new A,jn=new A,is=new A,ss=new A,oh=new A,ro=new A,ao=new A,oo=new A,lo=new Ze,co=new Ze,ho=new Ze;class hn{constructor(e=new A,t=new A,n=new A){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),gn.subVectors(e,t),i.cross(gn);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){gn.subVectors(i,t),qn.subVectors(n,t),so.subVectors(e,t);const a=gn.dot(gn),o=gn.dot(qn),l=gn.dot(so),c=qn.dot(qn),h=qn.dot(so),u=a*c-o*o;if(u===0)return s.set(0,0,0),null;const d=1/u,f=(c*l-o*h)*d,m=(a*h-o*l)*d;return s.set(1-f-m,m,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,jn)===null?!1:jn.x>=0&&jn.y>=0&&jn.x+jn.y<=1}static getInterpolation(e,t,n,i,s,a,o,l){return this.getBarycoord(e,t,n,i,jn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,jn.x),l.addScaledVector(a,jn.y),l.addScaledVector(o,jn.z),l)}static getInterpolatedAttribute(e,t,n,i,s,a){return lo.setScalar(0),co.setScalar(0),ho.setScalar(0),lo.fromBufferAttribute(e,t),co.fromBufferAttribute(e,n),ho.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(lo,s.x),a.addScaledVector(co,s.y),a.addScaledVector(ho,s.z),a}static isFrontFacing(e,t,n,i){return gn.subVectors(n,t),qn.subVectors(e,t),gn.cross(qn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return gn.subVectors(this.c,this.b),qn.subVectors(this.a,this.b),gn.cross(qn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return hn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return hn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return hn.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return hn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return hn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let a,o;is.subVectors(i,n),ss.subVectors(s,n),ro.subVectors(e,n);const l=is.dot(ro),c=ss.dot(ro);if(l<=0&&c<=0)return t.copy(n);ao.subVectors(e,i);const h=is.dot(ao),u=ss.dot(ao);if(h>=0&&u<=h)return t.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(is,a);oo.subVectors(e,s);const f=is.dot(oo),m=ss.dot(oo);if(m>=0&&f<=m)return t.copy(s);const v=f*c-l*m;if(v<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(n).addScaledVector(ss,o);const g=h*m-f*u;if(g<=0&&u-h>=0&&f-m>=0)return oh.subVectors(s,i),o=(u-h)/(u-h+(f-m)),t.copy(i).addScaledVector(oh,o);const p=1/(g+v+d);return a=v*p,o=d*p,t.copy(n).addScaledVector(is,a).addScaledVector(ss,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Qu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},di={h:0,s:0,l:0},Ur={h:0,s:0,l:0};function uo(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class ue{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,qe.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,qe.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=qe.workingColorSpace){if(e=nc(e,1),t=Mt(t,0,1),n=Mt(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=uo(a,s,e+1/3),this.g=uo(a,s,e),this.b=uo(a,s,e-1/3)}return qe.toWorkingColorSpace(this,i),this}setStyle(e,t=dt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=dt){const n=Qu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ti(e.r),this.g=ti(e.g),this.b=ti(e.b),this}copyLinearToSRGB(e){return this.r=xs(e.r),this.g=xs(e.g),this.b=xs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=dt){return qe.fromWorkingColorSpace(kt.copy(this),e),Math.round(Mt(kt.r*255,0,255))*65536+Math.round(Mt(kt.g*255,0,255))*256+Math.round(Mt(kt.b*255,0,255))}getHexString(e=dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qe.workingColorSpace){qe.fromWorkingColorSpace(kt.copy(this),t);const n=kt.r,i=kt.g,s=kt.b,a=Math.max(n,i,s),o=Math.min(n,i,s);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-s)/u+(i<s?6:0);break;case i:l=(s-n)/u+2;break;case s:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=qe.workingColorSpace){return qe.fromWorkingColorSpace(kt.copy(this),t),e.r=kt.r,e.g=kt.g,e.b=kt.b,e}getStyle(e=dt){qe.fromWorkingColorSpace(kt.copy(this),e);const t=kt.r,n=kt.g,i=kt.b;return e!==dt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(di),this.setHSL(di.h+e,di.s+t,di.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(di),e.getHSL(Ur);const n=or(di.h,Ur.h,t),i=or(di.s,Ur.s,t),s=or(di.l,Ur.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const kt=new ue;ue.NAMES=Qu;let Ap=0;class un extends Wi{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ap++}),this.uuid=Sn(),this.name="",this.blending=Bi,this.side=ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Go,this.blendDst=Wo,this.blendEquation=_n,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ue(0,0,0),this.blendAlpha=0,this.depthFunc=Ss,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Wc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Yi,this.stencilZFail=Yi,this.stencilZPass=Yi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Bi&&(n.blending=this.blending),this.side!==ni&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Go&&(n.blendSrc=this.blendSrc),this.blendDst!==Wo&&(n.blendDst=this.blendDst),this.blendEquation!==_n&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ss&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Wc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Yi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Yi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Yi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class ft extends un{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new kn,this.combine=Ru,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Jn=Rp();function Rp(){const r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(n[l]=0,n[l|256]=32768,i[l]=24,i[l|256]=24):c<-14?(n[l]=1024>>-c-14,n[l|256]=1024>>-c-14|32768,i[l]=-c-1,i[l|256]=-c-1):c<=15?(n[l]=c+15<<10,n[l|256]=c+15<<10|32768,i[l]=13,i[l|256]=13):c<128?(n[l]=31744,n[l|256]=64512,i[l]=24,i[l|256]=24):(n[l]=31744,n[l|256]=64512,i[l]=13,i[l|256]=13)}const s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;!(c&8388608);)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:o}}function Cp(r){Math.abs(r)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),r=Mt(r,-65504,65504),Jn.floatView[0]=r;const e=Jn.uint32View[0],t=e>>23&511;return Jn.baseTable[t]+((e&8388607)>>Jn.shiftTable[t])}function Pp(r){const e=r>>10;return Jn.uint32View[0]=Jn.mantissaTable[Jn.offsetTable[e]+(r&1023)]+Jn.exponentTable[e],Jn.floatView[0]}const kr={toHalfFloat:Cp,fromHalfFloat:Pp},_t=new A,Fr=new ae;class St{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Rl,this.updateRanges=[],this.gpuType=Zt,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Fr.fromBufferAttribute(this,t),Fr.applyMatrix3(e),this.setXY(t,Fr.x,Fr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix3(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix4(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyNormalMatrix(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.transformDirection(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=xn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=rt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=xn(t,this.array)),t}setX(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=xn(t,this.array)),t}setY(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=xn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=xn(t,this.array)),t}setW(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array),i=rt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array),i=rt(i,this.array),s=rt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Rl&&(e.usage=this.usage),e}}class ed extends St{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class td extends St{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class je extends St{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Dp=0;const an=new Pe,fo=new ct,rs=new A,nn=new wn,Hs=new wn,Et=new A;class gt extends Wi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Dp++}),this.uuid=Sn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Yu(e)?td:ed)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ve().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return an.makeRotationFromQuaternion(e),this.applyMatrix4(an),this}rotateX(e){return an.makeRotationX(e),this.applyMatrix4(an),this}rotateY(e){return an.makeRotationY(e),this.applyMatrix4(an),this}rotateZ(e){return an.makeRotationZ(e),this.applyMatrix4(an),this}translate(e,t,n){return an.makeTranslation(e,t,n),this.applyMatrix4(an),this}scale(e,t,n){return an.makeScale(e,t,n),this.applyMatrix4(an),this}lookAt(e){return fo.lookAt(e),fo.updateMatrix(),this.applyMatrix4(fo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(rs).negate(),this.translate(rs.x,rs.y,rs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,s=e.length;i<s;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new je(n,3))}else{for(let n=0,i=t.count;n<i;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new wn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];nn.setFromBufferAttribute(s),this.morphTargetsRelative?(Et.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(Et),Et.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(Et)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Fn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(e){const n=this.boundingSphere.center;if(nn.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];Hs.setFromBufferAttribute(o),this.morphTargetsRelative?(Et.addVectors(nn.min,Hs.min),nn.expandByPoint(Et),Et.addVectors(nn.max,Hs.max),nn.expandByPoint(Et)):(nn.expandByPoint(Hs.min),nn.expandByPoint(Hs.max))}nn.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)Et.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Et));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Et.fromBufferAttribute(o,c),l&&(rs.fromBufferAttribute(e,c),Et.add(rs)),i=Math.max(i,n.distanceToSquared(Et))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new St(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let w=0;w<n.count;w++)o[w]=new A,l[w]=new A;const c=new A,h=new A,u=new A,d=new ae,f=new ae,m=new ae,v=new A,g=new A;function p(w,M,y){c.fromBufferAttribute(n,w),h.fromBufferAttribute(n,M),u.fromBufferAttribute(n,y),d.fromBufferAttribute(s,w),f.fromBufferAttribute(s,M),m.fromBufferAttribute(s,y),h.sub(c),u.sub(c),f.sub(d),m.sub(d);const C=1/(f.x*m.y-m.x*f.y);isFinite(C)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(C),g.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(C),o[w].add(v),o[M].add(v),o[y].add(v),l[w].add(g),l[M].add(g),l[y].add(g))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let w=0,M=x.length;w<M;++w){const y=x[w],C=y.start,L=y.count;for(let I=C,O=C+L;I<O;I+=3)p(e.getX(I+0),e.getX(I+1),e.getX(I+2))}const T=new A,_=new A,D=new A,E=new A;function R(w){D.fromBufferAttribute(i,w),E.copy(D);const M=o[w];T.copy(M),T.sub(D.multiplyScalar(D.dot(M))).normalize(),_.crossVectors(E,M);const C=_.dot(l[w])<0?-1:1;a.setXYZW(w,T.x,T.y,T.z,C)}for(let w=0,M=x.length;w<M;++w){const y=x[w],C=y.start,L=y.count;for(let I=C,O=C+L;I<O;I+=3)R(e.getX(I+0)),R(e.getX(I+1)),R(e.getX(I+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new St(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new A,s=new A,a=new A,o=new A,l=new A,c=new A,h=new A,u=new A;if(e)for(let d=0,f=e.count;d<f;d+=3){const m=e.getX(d+0),v=e.getX(d+1),g=e.getX(d+2);i.fromBufferAttribute(t,m),s.fromBufferAttribute(t,v),a.fromBufferAttribute(t,g),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,g),o.add(h),l.add(h),c.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Et.fromBufferAttribute(e,t),Et.normalize(),e.setXYZ(t,Et.x,Et.y,Et.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h);let f=0,m=0;for(let v=0,g=l.length;v<g;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*h;for(let p=0;p<h;p++)d[m++]=c[f++]}return new St(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new gt,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=e(l,n);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(i[l]=h,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const s=e.morphAttributes;for(const c in s){const h=[],u=s[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const lh=new Pe,Ei=new Ba,Or=new Fn,ch=new A,Br=new A,zr=new A,Hr=new A,po=new A,Vr=new A,hh=new A,Gr=new A;class Oe extends ct{constructor(e=new gt,t=new ft){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(s&&o){Vr.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=o[l],u=s[l];h!==0&&(po.fromBufferAttribute(u,e),a?Vr.addScaledVector(po,h):Vr.addScaledVector(po.sub(t),h))}t.add(Vr)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Or.copy(n.boundingSphere),Or.applyMatrix4(s),Ei.copy(e.ray).recast(e.near),!(Or.containsPoint(Ei.origin)===!1&&(Ei.intersectSphere(Or,ch)===null||Ei.origin.distanceToSquared(ch)>(e.far-e.near)**2))&&(lh.copy(s).invert(),Ei.copy(e.ray).applyMatrix4(lh),!(n.boundingBox!==null&&Ei.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ei)))}_computeIntersections(e,t,n){let i;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,v=d.length;m<v;m++){const g=d[m],p=a[g.materialIndex],x=Math.max(g.start,f.start),T=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let _=x,D=T;_<D;_+=3){const E=o.getX(_),R=o.getX(_+1),w=o.getX(_+2);i=Wr(this,p,e,n,c,h,u,E,R,w),i&&(i.faceIndex=Math.floor(_/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const m=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let g=m,p=v;g<p;g+=3){const x=o.getX(g),T=o.getX(g+1),_=o.getX(g+2);i=Wr(this,a,e,n,c,h,u,x,T,_),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,v=d.length;m<v;m++){const g=d[m],p=a[g.materialIndex],x=Math.max(g.start,f.start),T=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let _=x,D=T;_<D;_+=3){const E=_,R=_+1,w=_+2;i=Wr(this,p,e,n,c,h,u,E,R,w),i&&(i.faceIndex=Math.floor(_/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const m=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let g=m,p=v;g<p;g+=3){const x=g,T=g+1,_=g+2;i=Wr(this,a,e,n,c,h,u,x,T,_),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}}}function Ip(r,e,t,n,i,s,a,o){let l;if(e.side===zt?l=n.intersectTriangle(a,s,i,!0,o):l=n.intersectTriangle(i,s,a,e.side===ni,o),l===null)return null;Gr.copy(o),Gr.applyMatrix4(r.matrixWorld);const c=t.ray.origin.distanceTo(Gr);return c<t.near||c>t.far?null:{distance:c,point:Gr.clone(),object:r}}function Wr(r,e,t,n,i,s,a,o,l,c){r.getVertexPosition(o,Br),r.getVertexPosition(l,zr),r.getVertexPosition(c,Hr);const h=Ip(r,e,t,n,Br,zr,Hr,hh);if(h){const u=new A;hn.getBarycoord(hh,Br,zr,Hr,u),i&&(h.uv=hn.getInterpolatedAttribute(i,o,l,c,u,new ae)),s&&(h.uv1=hn.getInterpolatedAttribute(s,o,l,c,u,new ae)),a&&(h.normal=hn.getInterpolatedAttribute(a,o,l,c,u,new A),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new A,materialIndex:0};hn.getNormal(Br,zr,Hr,d.normal),h.face=d,h.barycoord=u}return h}class Gi extends gt{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};const o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],h=[],u=[];let d=0,f=0;m("z","y","x",-1,-1,n,t,e,a,s,0),m("z","y","x",1,-1,n,t,-e,a,s,1),m("x","z","y",1,1,e,n,t,i,a,2),m("x","z","y",1,-1,e,n,-t,i,a,3),m("x","y","z",1,-1,e,t,n,i,s,4),m("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new je(c,3)),this.setAttribute("normal",new je(h,3)),this.setAttribute("uv",new je(u,2));function m(v,g,p,x,T,_,D,E,R,w,M){const y=_/R,C=D/w,L=_/2,I=D/2,O=E/2,V=R+1,B=w+1;let $=0,G=0;const H=new A;for(let K=0;K<B;K++){const Q=K*C-I;for(let se=0;se<V;se++){const Me=se*y-L;H[v]=Me*x,H[g]=Q*T,H[p]=O,c.push(H.x,H.y,H.z),H[v]=0,H[g]=0,H[p]=E>0?1:-1,h.push(H.x,H.y,H.z),u.push(se/R),u.push(1-K/w),$+=1}}for(let K=0;K<w;K++)for(let Q=0;Q<R;Q++){const se=d+Q+V*K,Me=d+Q+V*(K+1),j=d+(Q+1)+V*(K+1),te=d+(Q+1)+V*K;l.push(se,Me,te),l.push(Me,j,te),G+=6}o.addGroup(f,G,M),f+=G,d+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gi(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function As(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Gt(r){const e={};for(let t=0;t<r.length;t++){const n=As(r[t]);for(const i in n)e[i]=n[i]}return e}function Lp(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function nd(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:qe.workingColorSpace}const yn={clone:As,merge:Gt};var Np=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Up=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class pt extends un{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Np,this.fragmentShader=Up,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=As(e.uniforms),this.uniformsGroups=Lp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class id extends ct{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Pe,this.projectionMatrix=new Pe,this.projectionMatrixInverse=new Pe,this.coordinateSystem=Qn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const fi=new A,uh=new ae,dh=new ae;class Xt extends id{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Es*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ar*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Es*2*Math.atan(Math.tan(ar*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){fi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(fi.x,fi.y).multiplyScalar(-e/fi.z),fi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(fi.x,fi.y).multiplyScalar(-e/fi.z)}getViewSize(e,t){return this.getViewBounds(e,uh,dh),t.subVectors(dh,uh)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ar*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const as=-90,os=1;class kp extends ct{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Xt(as,os,e,t);i.layers=this.layers,this.add(i);const s=new Xt(as,os,e,t);s.layers=this.layers,this.add(s);const a=new Xt(as,os,e,t);a.layers=this.layers,this.add(a);const o=new Xt(as,os,e,t);o.layers=this.layers,this.add(o);const l=new Xt(as,os,e,t);l.layers=this.layers,this.add(l);const c=new Xt(as,os,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===Qn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Aa)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class sd extends Tt{constructor(e,t,n,i,s,a,o,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:bs,super(e,t,n,i,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Fp extends Qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new sd(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:yt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Gi(5,5,5),s=new pt({name:"CubemapFromEquirect",uniforms:As(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:zt,blending:Dt});s.uniforms.tEquirect.value=t;const a=new Oe(i,s),o=t.minFilter;return t.minFilter===Tn&&(t.minFilter=yt),new kp(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}}const mo=new A,Op=new A,Bp=new Ve;class Di{constructor(e=new A(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=mo.subVectors(n,t).cross(Op.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(mo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Bp.getNormalMatrix(e),i=this.coplanarPoint(mo).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ai=new Fn,Xr=new A;class ic{constructor(e=new Di,t=new Di,n=new Di,i=new Di,s=new Di,a=new Di){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Qn){const n=this.planes,i=e.elements,s=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],u=i[6],d=i[7],f=i[8],m=i[9],v=i[10],g=i[11],p=i[12],x=i[13],T=i[14],_=i[15];if(n[0].setComponents(l-s,d-c,g-f,_-p).normalize(),n[1].setComponents(l+s,d+c,g+f,_+p).normalize(),n[2].setComponents(l+a,d+h,g+m,_+x).normalize(),n[3].setComponents(l-a,d-h,g-m,_-x).normalize(),n[4].setComponents(l-o,d-u,g-v,_-T).normalize(),t===Qn)n[5].setComponents(l+o,d+u,g+v,_+T).normalize();else if(t===Aa)n[5].setComponents(o,u,v,T).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ai.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ai.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ai)}intersectsSprite(e){return Ai.center.set(0,0,0),Ai.radius=.7071067811865476,Ai.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ai)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Xr.x=i.normal.x>0?e.max.x:e.min.x,Xr.y=i.normal.y>0?e.max.y:e.min.y,Xr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Xr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function rd(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function zp(r){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,d=r.createBuffer();r.bindBuffer(l,d),r.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=r.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=r.SHORT;else if(c instanceof Uint32Array)f=r.UNSIGNED_INT;else if(c instanceof Int32Array)f=r.INT;else if(c instanceof Int8Array)f=r.BYTE;else if(c instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(r.bindBuffer(c,o),u.length===0)r.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){const m=u[d],v=u[f];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){const v=u[f];r.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(r.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:s,update:a}}class Mn extends gt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=e/o,d=t/l,f=[],m=[],v=[],g=[];for(let p=0;p<h;p++){const x=p*d-a;for(let T=0;T<c;T++){const _=T*u-s;m.push(_,-x,0),v.push(0,0,1),g.push(T/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<o;x++){const T=x+c*p,_=x+c*(p+1),D=x+1+c*(p+1),E=x+1+c*p;f.push(T,_,E),f.push(_,D,E)}this.setIndex(f),this.setAttribute("position",new je(m,3)),this.setAttribute("normal",new je(v,3)),this.setAttribute("uv",new je(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mn(e.width,e.height,e.widthSegments,e.heightSegments)}}var Hp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Vp=`#ifdef USE_ALPHAHASH
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
#endif`,Gp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Wp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Xp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,jp=`#ifdef USE_AOMAP
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
#endif`,$p=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Yp=`#ifdef USE_BATCHING
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
#endif`,Kp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Zp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Jp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Qp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,em=`#ifdef USE_IRIDESCENCE
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
#endif`,tm=`#ifdef USE_BUMPMAP
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
#endif`,nm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,im=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,sm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,rm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,am=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,om=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,lm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,cm=`#if defined( USE_COLOR_ALPHA )
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
#endif`,hm=`#define PI 3.141592653589793
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
} // validated`,um=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,dm=`vec3 transformedNormal = objectNormal;
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
#endif`,fm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,pm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,mm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,gm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,vm="gl_FragColor = linearToOutputTexel( gl_FragColor );",_m=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,xm=`#ifdef USE_ENVMAP
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
#endif`,ym=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Mm=`#ifdef USE_ENVMAP
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
#endif`,Tm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Sm=`#ifdef USE_ENVMAP
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
#endif`,bm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,wm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Em=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Am=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Rm=`#ifdef USE_GRADIENTMAP
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
}`,Cm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Pm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Dm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Im=`uniform bool receiveShadow;
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
#endif`,Lm=`#ifdef USE_ENVMAP
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
#endif`,Nm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Um=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,km=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Fm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Om=`PhysicalMaterial material;
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
#endif`,Bm=`struct PhysicalMaterial {
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
}`,zm=`
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
#endif`,Hm=`#if defined( RE_IndirectDiffuse )
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
#endif`,Vm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Gm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Wm=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xm=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qm=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,jm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,$m=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ym=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Km=`#if defined( USE_POINTS_UV )
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
#endif`,Zm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Qm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,eg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,tg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ng=`#ifdef USE_MORPHTARGETS
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
#endif`,ig=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,rg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,ag=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,og=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,cg=`#ifdef USE_NORMALMAP
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
#endif`,hg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ug=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,dg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,fg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,pg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,mg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,gg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,vg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_g=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,xg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,yg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Mg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Tg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Sg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,bg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,wg=`float getShadowMask() {
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
}`,Eg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ag=`#ifdef USE_SKINNING
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
#endif`,Rg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Cg=`#ifdef USE_SKINNING
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
#endif`,Pg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Dg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ig=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Lg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Ng=`#ifdef USE_TRANSMISSION
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
#endif`,Ug=`#ifdef USE_TRANSMISSION
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
#endif`,kg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Fg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Og=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Bg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const zg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Hg=`uniform sampler2D t2D;
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
}`,Vg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Wg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qg=`#include <common>
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
}`,jg=`#if DEPTH_PACKING == 3200
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
}`,$g=`#define DISTANCE
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
}`,Yg=`#define DISTANCE
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
}`,Kg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Zg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Jg=`uniform float scale;
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
}`,Qg=`uniform vec3 diffuse;
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
}`,e0=`#include <common>
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
}`,t0=`uniform vec3 diffuse;
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
}`,n0=`#define LAMBERT
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
}`,i0=`#define LAMBERT
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
}`,s0=`#define MATCAP
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
}`,r0=`#define MATCAP
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
}`,a0=`#define NORMAL
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
}`,o0=`#define NORMAL
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
}`,l0=`#define PHONG
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
}`,c0=`#define PHONG
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
}`,h0=`#define STANDARD
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
}`,u0=`#define STANDARD
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
}`,d0=`#define TOON
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
}`,f0=`#define TOON
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
}`,p0=`uniform float size;
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
}`,m0=`uniform vec3 diffuse;
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
}`,g0=`#include <common>
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
}`,v0=`uniform vec3 color;
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
}`,_0=`uniform float rotation;
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
}`,x0=`uniform vec3 diffuse;
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
}`,ke={alphahash_fragment:Hp,alphahash_pars_fragment:Vp,alphamap_fragment:Gp,alphamap_pars_fragment:Wp,alphatest_fragment:Xp,alphatest_pars_fragment:qp,aomap_fragment:jp,aomap_pars_fragment:$p,batching_pars_vertex:Yp,batching_vertex:Kp,begin_vertex:Zp,beginnormal_vertex:Jp,bsdfs:Qp,iridescence_fragment:em,bumpmap_pars_fragment:tm,clipping_planes_fragment:nm,clipping_planes_pars_fragment:im,clipping_planes_pars_vertex:sm,clipping_planes_vertex:rm,color_fragment:am,color_pars_fragment:om,color_pars_vertex:lm,color_vertex:cm,common:hm,cube_uv_reflection_fragment:um,defaultnormal_vertex:dm,displacementmap_pars_vertex:fm,displacementmap_vertex:pm,emissivemap_fragment:mm,emissivemap_pars_fragment:gm,colorspace_fragment:vm,colorspace_pars_fragment:_m,envmap_fragment:xm,envmap_common_pars_fragment:ym,envmap_pars_fragment:Mm,envmap_pars_vertex:Tm,envmap_physical_pars_fragment:Lm,envmap_vertex:Sm,fog_vertex:bm,fog_pars_vertex:wm,fog_fragment:Em,fog_pars_fragment:Am,gradientmap_pars_fragment:Rm,lightmap_pars_fragment:Cm,lights_lambert_fragment:Pm,lights_lambert_pars_fragment:Dm,lights_pars_begin:Im,lights_toon_fragment:Nm,lights_toon_pars_fragment:Um,lights_phong_fragment:km,lights_phong_pars_fragment:Fm,lights_physical_fragment:Om,lights_physical_pars_fragment:Bm,lights_fragment_begin:zm,lights_fragment_maps:Hm,lights_fragment_end:Vm,logdepthbuf_fragment:Gm,logdepthbuf_pars_fragment:Wm,logdepthbuf_pars_vertex:Xm,logdepthbuf_vertex:qm,map_fragment:jm,map_pars_fragment:$m,map_particle_fragment:Ym,map_particle_pars_fragment:Km,metalnessmap_fragment:Zm,metalnessmap_pars_fragment:Jm,morphinstance_vertex:Qm,morphcolor_vertex:eg,morphnormal_vertex:tg,morphtarget_pars_vertex:ng,morphtarget_vertex:ig,normal_fragment_begin:sg,normal_fragment_maps:rg,normal_pars_fragment:ag,normal_pars_vertex:og,normal_vertex:lg,normalmap_pars_fragment:cg,clearcoat_normal_fragment_begin:hg,clearcoat_normal_fragment_maps:ug,clearcoat_pars_fragment:dg,iridescence_pars_fragment:fg,opaque_fragment:pg,packing:mg,premultiplied_alpha_fragment:gg,project_vertex:vg,dithering_fragment:_g,dithering_pars_fragment:xg,roughnessmap_fragment:yg,roughnessmap_pars_fragment:Mg,shadowmap_pars_fragment:Tg,shadowmap_pars_vertex:Sg,shadowmap_vertex:bg,shadowmask_pars_fragment:wg,skinbase_vertex:Eg,skinning_pars_vertex:Ag,skinning_vertex:Rg,skinnormal_vertex:Cg,specularmap_fragment:Pg,specularmap_pars_fragment:Dg,tonemapping_fragment:Ig,tonemapping_pars_fragment:Lg,transmission_fragment:Ng,transmission_pars_fragment:Ug,uv_pars_fragment:kg,uv_pars_vertex:Fg,uv_vertex:Og,worldpos_vertex:Bg,background_vert:zg,background_frag:Hg,backgroundCube_vert:Vg,backgroundCube_frag:Gg,cube_vert:Wg,cube_frag:Xg,depth_vert:qg,depth_frag:jg,distanceRGBA_vert:$g,distanceRGBA_frag:Yg,equirect_vert:Kg,equirect_frag:Zg,linedashed_vert:Jg,linedashed_frag:Qg,meshbasic_vert:e0,meshbasic_frag:t0,meshlambert_vert:n0,meshlambert_frag:i0,meshmatcap_vert:s0,meshmatcap_frag:r0,meshnormal_vert:a0,meshnormal_frag:o0,meshphong_vert:l0,meshphong_frag:c0,meshphysical_vert:h0,meshphysical_frag:u0,meshtoon_vert:d0,meshtoon_frag:f0,points_vert:p0,points_frag:m0,shadow_vert:g0,shadow_frag:v0,sprite_vert:_0,sprite_frag:x0},he={common:{diffuse:{value:new ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},envMapRotation:{value:new Ve},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new ae(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new ue(16777215)},opacity:{value:1},center:{value:new ae(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},Dn={basic:{uniforms:Gt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.fog]),vertexShader:ke.meshbasic_vert,fragmentShader:ke.meshbasic_frag},lambert:{uniforms:Gt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new ue(0)}}]),vertexShader:ke.meshlambert_vert,fragmentShader:ke.meshlambert_frag},phong:{uniforms:Gt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new ue(0)},specular:{value:new ue(1118481)},shininess:{value:30}}]),vertexShader:ke.meshphong_vert,fragmentShader:ke.meshphong_frag},standard:{uniforms:Gt([he.common,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.roughnessmap,he.metalnessmap,he.fog,he.lights,{emissive:{value:new ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ke.meshphysical_vert,fragmentShader:ke.meshphysical_frag},toon:{uniforms:Gt([he.common,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.gradientmap,he.fog,he.lights,{emissive:{value:new ue(0)}}]),vertexShader:ke.meshtoon_vert,fragmentShader:ke.meshtoon_frag},matcap:{uniforms:Gt([he.common,he.bumpmap,he.normalmap,he.displacementmap,he.fog,{matcap:{value:null}}]),vertexShader:ke.meshmatcap_vert,fragmentShader:ke.meshmatcap_frag},points:{uniforms:Gt([he.points,he.fog]),vertexShader:ke.points_vert,fragmentShader:ke.points_frag},dashed:{uniforms:Gt([he.common,he.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ke.linedashed_vert,fragmentShader:ke.linedashed_frag},depth:{uniforms:Gt([he.common,he.displacementmap]),vertexShader:ke.depth_vert,fragmentShader:ke.depth_frag},normal:{uniforms:Gt([he.common,he.bumpmap,he.normalmap,he.displacementmap,{opacity:{value:1}}]),vertexShader:ke.meshnormal_vert,fragmentShader:ke.meshnormal_frag},sprite:{uniforms:Gt([he.sprite,he.fog]),vertexShader:ke.sprite_vert,fragmentShader:ke.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ke.background_vert,fragmentShader:ke.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ve}},vertexShader:ke.backgroundCube_vert,fragmentShader:ke.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ke.cube_vert,fragmentShader:ke.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ke.equirect_vert,fragmentShader:ke.equirect_frag},distanceRGBA:{uniforms:Gt([he.common,he.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ke.distanceRGBA_vert,fragmentShader:ke.distanceRGBA_frag},shadow:{uniforms:Gt([he.lights,he.fog,{color:{value:new ue(0)},opacity:{value:1}}]),vertexShader:ke.shadow_vert,fragmentShader:ke.shadow_frag}};Dn.physical={uniforms:Gt([Dn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new ae(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new ae},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new ue(0)},specularColor:{value:new ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new ae},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:ke.meshphysical_vert,fragmentShader:ke.meshphysical_frag};const qr={r:0,b:0,g:0},Ri=new kn,y0=new Pe;function M0(r,e,t,n,i,s,a){const o=new ue(0);let l=s===!0?0:1,c,h,u=null,d=0,f=null;function m(x){let T=x.isScene===!0?x.background:null;return T&&T.isTexture&&(T=(x.backgroundBlurriness>0?t:e).get(T)),T}function v(x){let T=!1;const _=m(x);_===null?p(o,l):_&&_.isColor&&(p(_,1),T=!0);const D=r.xr.getEnvironmentBlendMode();D==="additive"?n.buffers.color.setClear(0,0,0,1,a):D==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||T)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function g(x,T){const _=m(T);_&&(_.isCubeTexture||_.mapping===Fa)?(h===void 0&&(h=new Oe(new Gi(1,1,1),new pt({name:"BackgroundCubeMaterial",uniforms:As(Dn.backgroundCube.uniforms),vertexShader:Dn.backgroundCube.vertexShader,fragmentShader:Dn.backgroundCube.fragmentShader,side:zt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(D,E,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Ri.copy(T.backgroundRotation),Ri.x*=-1,Ri.y*=-1,Ri.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(Ri.y*=-1,Ri.z*=-1),h.material.uniforms.envMap.value=_,h.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(y0.makeRotationFromEuler(Ri)),h.material.toneMapped=qe.getTransfer(_.colorSpace)!==st,(u!==_||d!==_.version||f!==r.toneMapping)&&(h.material.needsUpdate=!0,u=_,d=_.version,f=r.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new Oe(new Mn(2,2),new pt({name:"BackgroundMaterial",uniforms:As(Dn.background.uniforms),vertexShader:Dn.background.vertexShader,fragmentShader:Dn.background.fragmentShader,side:ni,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.toneMapped=qe.getTransfer(_.colorSpace)!==st,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||d!==_.version||f!==r.toneMapping)&&(c.material.needsUpdate=!0,u=_,d=_.version,f=r.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,T){x.getRGB(qr,nd(r)),n.buffers.color.setClear(qr.r,qr.g,qr.b,T,a)}return{getClearColor:function(){return o},setClearColor:function(x,T=1){o.set(x),l=T,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(o,l)},render:v,addToRenderList:g}}function T0(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=d(null);let s=i,a=!1;function o(y,C,L,I,O){let V=!1;const B=u(I,L,C);s!==B&&(s=B,c(s.object)),V=f(y,I,L,O),V&&m(y,I,L,O),O!==null&&e.update(O,r.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,_(y,C,L,I),O!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return r.createVertexArray()}function c(y){return r.bindVertexArray(y)}function h(y){return r.deleteVertexArray(y)}function u(y,C,L){const I=L.wireframe===!0;let O=n[y.id];O===void 0&&(O={},n[y.id]=O);let V=O[C.id];V===void 0&&(V={},O[C.id]=V);let B=V[I];return B===void 0&&(B=d(l()),V[I]=B),B}function d(y){const C=[],L=[],I=[];for(let O=0;O<t;O++)C[O]=0,L[O]=0,I[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:L,attributeDivisors:I,object:y,attributes:{},index:null}}function f(y,C,L,I){const O=s.attributes,V=C.attributes;let B=0;const $=L.getAttributes();for(const G in $)if($[G].location>=0){const K=O[G];let Q=V[G];if(Q===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(Q=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(Q=y.instanceColor)),K===void 0||K.attribute!==Q||Q&&K.data!==Q.data)return!0;B++}return s.attributesNum!==B||s.index!==I}function m(y,C,L,I){const O={},V=C.attributes;let B=0;const $=L.getAttributes();for(const G in $)if($[G].location>=0){let K=V[G];K===void 0&&(G==="instanceMatrix"&&y.instanceMatrix&&(K=y.instanceMatrix),G==="instanceColor"&&y.instanceColor&&(K=y.instanceColor));const Q={};Q.attribute=K,K&&K.data&&(Q.data=K.data),O[G]=Q,B++}s.attributes=O,s.attributesNum=B,s.index=I}function v(){const y=s.newAttributes;for(let C=0,L=y.length;C<L;C++)y[C]=0}function g(y){p(y,0)}function p(y,C){const L=s.newAttributes,I=s.enabledAttributes,O=s.attributeDivisors;L[y]=1,I[y]===0&&(r.enableVertexAttribArray(y),I[y]=1),O[y]!==C&&(r.vertexAttribDivisor(y,C),O[y]=C)}function x(){const y=s.newAttributes,C=s.enabledAttributes;for(let L=0,I=C.length;L<I;L++)C[L]!==y[L]&&(r.disableVertexAttribArray(L),C[L]=0)}function T(y,C,L,I,O,V,B){B===!0?r.vertexAttribIPointer(y,C,L,O,V):r.vertexAttribPointer(y,C,L,I,O,V)}function _(y,C,L,I){v();const O=I.attributes,V=L.getAttributes(),B=C.defaultAttributeValues;for(const $ in V){const G=V[$];if(G.location>=0){let H=O[$];if(H===void 0&&($==="instanceMatrix"&&y.instanceMatrix&&(H=y.instanceMatrix),$==="instanceColor"&&y.instanceColor&&(H=y.instanceColor)),H!==void 0){const K=H.normalized,Q=H.itemSize,se=e.get(H);if(se===void 0)continue;const Me=se.buffer,j=se.type,te=se.bytesPerElement,le=j===r.INT||j===r.UNSIGNED_INT||H.gpuType===jl;if(H.isInterleavedBufferAttribute){const ie=H.data,de=ie.stride,fe=H.offset;if(ie.isInstancedInterleavedBuffer){for(let _e=0;_e<G.locationSize;_e++)p(G.location+_e,ie.meshPerAttribute);y.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let _e=0;_e<G.locationSize;_e++)g(G.location+_e);r.bindBuffer(r.ARRAY_BUFFER,Me);for(let _e=0;_e<G.locationSize;_e++)T(G.location+_e,Q/G.locationSize,j,K,de*te,(fe+Q/G.locationSize*_e)*te,le)}else{if(H.isInstancedBufferAttribute){for(let ie=0;ie<G.locationSize;ie++)p(G.location+ie,H.meshPerAttribute);y.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=H.meshPerAttribute*H.count)}else for(let ie=0;ie<G.locationSize;ie++)g(G.location+ie);r.bindBuffer(r.ARRAY_BUFFER,Me);for(let ie=0;ie<G.locationSize;ie++)T(G.location+ie,Q/G.locationSize,j,K,Q*te,Q/G.locationSize*ie*te,le)}}else if(B!==void 0){const K=B[$];if(K!==void 0)switch(K.length){case 2:r.vertexAttrib2fv(G.location,K);break;case 3:r.vertexAttrib3fv(G.location,K);break;case 4:r.vertexAttrib4fv(G.location,K);break;default:r.vertexAttrib1fv(G.location,K)}}}}x()}function D(){w();for(const y in n){const C=n[y];for(const L in C){const I=C[L];for(const O in I)h(I[O].object),delete I[O];delete C[L]}delete n[y]}}function E(y){if(n[y.id]===void 0)return;const C=n[y.id];for(const L in C){const I=C[L];for(const O in I)h(I[O].object),delete I[O];delete C[L]}delete n[y.id]}function R(y){for(const C in n){const L=n[C];if(L[y.id]===void 0)continue;const I=L[y.id];for(const O in I)h(I[O].object),delete I[O];delete L[y.id]}}function w(){M(),a=!0,s!==i&&(s=i,c(s.object))}function M(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:w,resetDefaultState:M,dispose:D,releaseStatesOfGeometry:E,releaseStatesOfProgram:R,initAttributes:v,enableAttribute:g,disableUnusedAttributes:x}}function S0(r,e,t){let n;function i(c){n=c}function s(c,h){r.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(r.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let m=0;m<u;m++)f+=h[m];t.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let m=0;m<c.length;m++)a(c[m],h[m],d[m]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let m=0;for(let v=0;v<u;v++)m+=h[v]*d[v];t.update(m,n,1)}}this.setMode=i,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function b0(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(R){return!(R!==qt&&n.convert(R)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const w=R===Bt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Un&&n.convert(R)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Zt&&!w)}function l(R){if(R==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),m=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=r.getParameter(r.MAX_TEXTURE_SIZE),g=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),p=r.getParameter(r.MAX_VERTEX_ATTRIBS),x=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),T=r.getParameter(r.MAX_VARYING_VECTORS),_=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),D=m>0,E=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:x,maxVaryings:T,maxFragmentUniforms:_,vertexTextures:D,maxSamples:E}}function w0(r){const e=this;let t=null,n=0,i=!1,s=!1;const a=new Di,o=new Ve,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const m=u.clippingPlanes,v=u.clipIntersection,g=u.clipShadows,p=r.get(u);if(!i||m===null||m.length===0||s&&!g)s?h(null):c();else{const x=s?0:n,T=x*4;let _=p.clippingState||null;l.value=_,_=h(m,d,T,f);for(let D=0;D!==T;++D)_[D]=t[D];p.clippingState=_,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,m){const v=u!==null?u.length:0;let g=null;if(v!==0){if(g=l.value,m!==!0||g===null){const p=f+v*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(g===null||g.length<p)&&(g=new Float32Array(p));for(let T=0,_=f;T!==v;++T,_+=4)a.copy(u[T]).applyMatrix4(x,o),a.normal.toArray(g,_),g[_+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,g}}function E0(r){let e=new WeakMap;function t(a,o){return o===ba?a.mapping=bs:o===el&&(a.mapping=ws),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===ba||o===el)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Fp(l.height);return c.fromEquirectangularTexture(r,a),e.set(a,c),a.addEventListener("dispose",i),t(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class za extends id{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const vs=4,fh=[.125,.215,.35,.446,.526,.582],Ni=20,go=new za,ph=new ue;let vo=null,_o=0,xo=0,yo=!1;const Ii=(1+Math.sqrt(5))/2,ls=1/Ii,mh=[new A(-Ii,ls,0),new A(Ii,ls,0),new A(-ls,0,Ii),new A(ls,0,Ii),new A(0,Ii,-ls),new A(0,Ii,ls),new A(-1,1,-1),new A(1,1,-1),new A(-1,1,1),new A(1,1,1)];class Pl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){vo=this._renderer.getRenderTarget(),_o=this._renderer.getActiveCubeFace(),xo=this._renderer.getActiveMipmapLevel(),yo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=_h(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(vo,_o,xo),this._renderer.xr.enabled=yo,e.scissorTest=!1,jr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===bs||e.mapping===ws?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),vo=this._renderer.getRenderTarget(),_o=this._renderer.getActiveCubeFace(),xo=this._renderer.getActiveMipmapLevel(),yo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:yt,minFilter:yt,generateMipmaps:!1,type:Bt,format:qt,colorSpace:Ht,depthBuffer:!1},i=gh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=gh(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=A0(s)),this._blurMaterial=R0(s,e,t)}return i}_compileMaterial(e){const t=new Oe(this._lodPlanes[0],e);this._renderer.compile(t,go)}_sceneToCubeUV(e,t,n,i){const o=new Xt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(ph),h.toneMapping=xi,h.autoClear=!1;const f=new ft({name:"PMREM.Background",side:zt,depthWrite:!1,depthTest:!1}),m=new Oe(new Gi,f);let v=!1;const g=e.background;g?g.isColor&&(f.color.copy(g),e.background=null,v=!0):(f.color.copy(ph),v=!0);for(let p=0;p<6;p++){const x=p%3;x===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):x===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));const T=this._cubeSize;jr(i,x*T,p>2?T:0,T,T),h.setRenderTarget(i),v&&h.render(m,o),h.render(e,o)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=g}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===bs||e.mapping===ws;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=_h()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=vh());const s=i?this._cubemapMaterial:this._equirectMaterial,a=new Oe(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;jr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,go)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=mh[(i-s-1)%mh.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,i,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Oe(this._lodPlanes[i],c),d=c.uniforms,f=this._sizeLods[n]-1,m=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Ni-1),v=s/m,g=isFinite(s)?1+Math.floor(h*v):Ni;g>Ni&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Ni}`);const p=[];let x=0;for(let R=0;R<Ni;++R){const w=R/v,M=Math.exp(-w*w/2);p.push(M),R===0?x+=M:R<g&&(x+=2*M)}for(let R=0;R<p.length;R++)p[R]=p[R]/x;d.envMap.value=e.texture,d.samples.value=g,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:T}=this;d.dTheta.value=m,d.mipInt.value=T-n;const _=this._sizeLods[i],D=3*_*(i>T-vs?i-T+vs:0),E=4*(this._cubeSize-_);jr(t,D,E,3*_,2*_),l.setRenderTarget(t),l.render(u,go)}}function A0(r){const e=[],t=[],n=[];let i=r;const s=r-vs+1+fh.length;for(let a=0;a<s;a++){const o=Math.pow(2,i);t.push(o);let l=1/o;a>r-vs?l=fh[a-r+vs-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,m=6,v=3,g=2,p=1,x=new Float32Array(v*m*f),T=new Float32Array(g*m*f),_=new Float32Array(p*m*f);for(let E=0;E<f;E++){const R=E%3*2/3-1,w=E>2?0:-1,M=[R,w,0,R+2/3,w,0,R+2/3,w+1,0,R,w,0,R+2/3,w+1,0,R,w+1,0];x.set(M,v*m*E),T.set(d,g*m*E);const y=[E,E,E,E,E,E];_.set(y,p*m*E)}const D=new gt;D.setAttribute("position",new St(x,v)),D.setAttribute("uv",new St(T,g)),D.setAttribute("faceIndex",new St(_,p)),e.push(D),i>vs&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function gh(r,e,t){const n=new Qt(r,e,t);return n.texture.mapping=Fa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function jr(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function R0(r,e,t){const n=new Float32Array(Ni),i=new A(0,1,0);return new pt({name:"SphericalGaussianBlur",defines:{n:Ni,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:sc(),fragmentShader:`

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
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function vh(){return new pt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sc(),fragmentShader:`

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
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function _h(){return new pt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Dt,depthTest:!1,depthWrite:!1})}function sc(){return`

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
	`}function C0(r){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===ba||l===el,h=l===bs||l===ws;if(c||h){let u=e.get(o);const d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new Pl(r)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const f=o.image;return c&&f&&f.height>0||h&&f&&i(f)?(t===null&&(t=new Pl(r)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",s),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function P0(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&tr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function D0(r,e,t,n){const i={},s=new WeakMap;function a(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const m in d.attributes)e.remove(d.attributes[m]);for(const m in d.morphAttributes){const v=d.morphAttributes[m];for(let g=0,p=v.length;g<p;g++)e.remove(v[g])}d.removeEventListener("dispose",a),delete i[d.id];const f=s.get(d);f&&(e.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const m in d)e.update(d[m],r.ARRAY_BUFFER);const f=u.morphAttributes;for(const m in f){const v=f[m];for(let g=0,p=v.length;g<p;g++)e.update(v[g],r.ARRAY_BUFFER)}}function c(u){const d=[],f=u.index,m=u.attributes.position;let v=0;if(f!==null){const x=f.array;v=f.version;for(let T=0,_=x.length;T<_;T+=3){const D=x[T+0],E=x[T+1],R=x[T+2];d.push(D,E,E,R,R,D)}}else if(m!==void 0){const x=m.array;v=m.version;for(let T=0,_=x.length/3-1;T<_;T+=3){const D=T+0,E=T+1,R=T+2;d.push(D,E,E,R,R,D)}}else return;const g=new(Yu(d)?td:ed)(d,1);g.version=v;const p=s.get(u);p&&e.remove(p),s.set(u,g)}function h(u){const d=s.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return s.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function I0(r,e,t){let n;function i(d){n=d}let s,a;function o(d){s=d.type,a=d.bytesPerElement}function l(d,f){r.drawElements(n,f,s,d*a),t.update(f,n,1)}function c(d,f,m){m!==0&&(r.drawElementsInstanced(n,f,s,d*a,m),t.update(f,n,m))}function h(d,f,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,d,0,m);let g=0;for(let p=0;p<m;p++)g+=f[p];t.update(g,n,1)}function u(d,f,m,v){if(m===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<d.length;p++)c(d[p]/a,f[p],v[p]);else{g.multiDrawElementsInstancedWEBGL(n,f,0,s,d,0,v,0,m);let p=0;for(let x=0;x<m;x++)p+=f[x]*v[x];t.update(p,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function L0(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function N0(r,e,t){const n=new WeakMap,i=new Ze;function s(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==u){let y=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",y)};var f=y;d!==void 0&&d.texture.dispose();const m=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],x=o.morphAttributes.normal||[],T=o.morphAttributes.color||[];let _=0;m===!0&&(_=1),v===!0&&(_=2),g===!0&&(_=3);let D=o.attributes.position.count*_,E=1;D>e.maxTextureSize&&(E=Math.ceil(D/e.maxTextureSize),D=e.maxTextureSize);const R=new Float32Array(D*E*4*u),w=new Zu(R,D,E,u);w.type=Zt,w.needsUpdate=!0;const M=_*4;for(let C=0;C<u;C++){const L=p[C],I=x[C],O=T[C],V=D*E*4*C;for(let B=0;B<L.count;B++){const $=B*M;m===!0&&(i.fromBufferAttribute(L,B),R[V+$+0]=i.x,R[V+$+1]=i.y,R[V+$+2]=i.z,R[V+$+3]=0),v===!0&&(i.fromBufferAttribute(I,B),R[V+$+4]=i.x,R[V+$+5]=i.y,R[V+$+6]=i.z,R[V+$+7]=0),g===!0&&(i.fromBufferAttribute(O,B),R[V+$+8]=i.x,R[V+$+9]=i.y,R[V+$+10]=i.z,R[V+$+11]=O.itemSize===4?i.w:1)}}d={count:u,texture:w,size:new ae(D,E)},n.set(o,d),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",a.morphTexture,t);else{let m=0;for(let g=0;g<c.length;g++)m+=c[g];const v=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(r,"morphTargetBaseInfluence",v),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function U0(r,e,t,n){let i=new WeakMap;function s(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(t.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,r.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:a}}class rc extends Tt{constructor(e,t,n,i,s,a,o,l,c,h=_s){if(h!==_s&&h!==Vi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===_s&&(n=zi),n===void 0&&h===Vi&&(n=Hi),super(null,i,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Lt,this.minFilter=l!==void 0?l:Lt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const ad=new Tt,xh=new rc(1,1),od=new Zu,ld=new xp,cd=new sd,yh=[],Mh=[],Th=new Float32Array(16),Sh=new Float32Array(9),bh=new Float32Array(4);function Is(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=yh[i];if(s===void 0&&(s=new Float32Array(i),yh[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function bt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function wt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function Ha(r,e){let t=Mh[e];t===void 0&&(t=new Int32Array(e),Mh[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function k0(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function F0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;r.uniform2fv(this.addr,e),wt(t,e)}}function O0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(bt(t,e))return;r.uniform3fv(this.addr,e),wt(t,e)}}function B0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;r.uniform4fv(this.addr,e),wt(t,e)}}function z0(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),wt(t,e)}else{if(bt(t,n))return;bh.set(n),r.uniformMatrix2fv(this.addr,!1,bh),wt(t,n)}}function H0(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),wt(t,e)}else{if(bt(t,n))return;Sh.set(n),r.uniformMatrix3fv(this.addr,!1,Sh),wt(t,n)}}function V0(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),wt(t,e)}else{if(bt(t,n))return;Th.set(n),r.uniformMatrix4fv(this.addr,!1,Th),wt(t,n)}}function G0(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function W0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;r.uniform2iv(this.addr,e),wt(t,e)}}function X0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;r.uniform3iv(this.addr,e),wt(t,e)}}function q0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;r.uniform4iv(this.addr,e),wt(t,e)}}function j0(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function $0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;r.uniform2uiv(this.addr,e),wt(t,e)}}function Y0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;r.uniform3uiv(this.addr,e),wt(t,e)}}function K0(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;r.uniform4uiv(this.addr,e),wt(t,e)}}function Z0(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(xh.compareFunction=$u,s=xh):s=ad,t.setTexture2D(e||s,i)}function J0(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||ld,i)}function Q0(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||cd,i)}function ev(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||od,i)}function tv(r){switch(r){case 5126:return k0;case 35664:return F0;case 35665:return O0;case 35666:return B0;case 35674:return z0;case 35675:return H0;case 35676:return V0;case 5124:case 35670:return G0;case 35667:case 35671:return W0;case 35668:case 35672:return X0;case 35669:case 35673:return q0;case 5125:return j0;case 36294:return $0;case 36295:return Y0;case 36296:return K0;case 35678:case 36198:case 36298:case 36306:case 35682:return Z0;case 35679:case 36299:case 36307:return J0;case 35680:case 36300:case 36308:case 36293:return Q0;case 36289:case 36303:case 36311:case 36292:return ev}}function nv(r,e){r.uniform1fv(this.addr,e)}function iv(r,e){const t=Is(e,this.size,2);r.uniform2fv(this.addr,t)}function sv(r,e){const t=Is(e,this.size,3);r.uniform3fv(this.addr,t)}function rv(r,e){const t=Is(e,this.size,4);r.uniform4fv(this.addr,t)}function av(r,e){const t=Is(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function ov(r,e){const t=Is(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function lv(r,e){const t=Is(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function cv(r,e){r.uniform1iv(this.addr,e)}function hv(r,e){r.uniform2iv(this.addr,e)}function uv(r,e){r.uniform3iv(this.addr,e)}function dv(r,e){r.uniform4iv(this.addr,e)}function fv(r,e){r.uniform1uiv(this.addr,e)}function pv(r,e){r.uniform2uiv(this.addr,e)}function mv(r,e){r.uniform3uiv(this.addr,e)}function gv(r,e){r.uniform4uiv(this.addr,e)}function vv(r,e,t){const n=this.cache,i=e.length,s=Ha(t,i);bt(n,s)||(r.uniform1iv(this.addr,s),wt(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||ad,s[a])}function _v(r,e,t){const n=this.cache,i=e.length,s=Ha(t,i);bt(n,s)||(r.uniform1iv(this.addr,s),wt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||ld,s[a])}function xv(r,e,t){const n=this.cache,i=e.length,s=Ha(t,i);bt(n,s)||(r.uniform1iv(this.addr,s),wt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||cd,s[a])}function yv(r,e,t){const n=this.cache,i=e.length,s=Ha(t,i);bt(n,s)||(r.uniform1iv(this.addr,s),wt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||od,s[a])}function Mv(r){switch(r){case 5126:return nv;case 35664:return iv;case 35665:return sv;case 35666:return rv;case 35674:return av;case 35675:return ov;case 35676:return lv;case 5124:case 35670:return cv;case 35667:case 35671:return hv;case 35668:case 35672:return uv;case 35669:case 35673:return dv;case 5125:return fv;case 36294:return pv;case 36295:return mv;case 36296:return gv;case 35678:case 36198:case 36298:case 36306:case 35682:return vv;case 35679:case 36299:case 36307:return _v;case 35680:case 36300:case 36308:case 36293:return xv;case 36289:case 36303:case 36311:case 36292:return yv}}class Tv{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=tv(t.type)}}class Sv{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Mv(t.type)}}class bv{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,a=i.length;s!==a;++s){const o=i[s];o.setValue(e,t[o.id],n)}}}const Mo=/(\w+)(\])?(\[|\.)?/g;function wh(r,e){r.seq.push(e),r.map[e.id]=e}function wv(r,e,t){const n=r.name,i=n.length;for(Mo.lastIndex=0;;){const s=Mo.exec(n),a=Mo.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){wh(t,c===void 0?new Tv(o,r,e):new Sv(o,r,e));break}else{let u=t.map[o];u===void 0&&(u=new bv(o),wh(t,u)),t=u}}}class xa{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),a=e.getUniformLocation(t,s.name);wv(s,a,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function Eh(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const Ev=37297;let Av=0;function Rv(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Ah=new Ve;function Cv(r){qe._getMatrix(Ah,qe.workingColorSpace,r);const e=`mat3( ${Ah.elements.map(t=>t.toFixed(4))} )`;switch(qe.getTransfer(r)){case Oa:return[e,"LinearTransferOETF"];case st:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function Rh(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+Rv(r.getShaderSource(e),a)}else return i}function Pv(r,e){const t=Cv(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Dv(r,e){let t;switch(e){case Cu:t="Linear";break;case Pu:t="Reinhard";break;case Du:t="Cineon";break;case ql:t="ACESFilmic";break;case Iu:t="AgX";break;case Lu:t="Neutral";break;case Nf:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const $r=new A;function Iv(){qe.getLuminanceCoefficients($r);const r=$r.x.toFixed(4),e=$r.y.toFixed(4),t=$r.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Lv(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(nr).join(`
`)}function Nv(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Uv(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),a=s.name;let o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function nr(r){return r!==""}function Ch(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ph(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const kv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Dl(r){return r.replace(kv,Ov)}const Fv=new Map;function Ov(r,e){let t=ke[e];if(t===void 0){const n=Fv.get(e);if(n!==void 0)t=ke[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Dl(t)}const Bv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Dh(r){return r.replace(Bv,zv)}function zv(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function Ih(r){let e=`precision ${r.precision} float;
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
#define LOW_PRECISION`),e}function Hv(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===wu?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===Eu?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Kn&&(e="SHADOWMAP_TYPE_VSM"),e}function Vv(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case bs:case ws:e="ENVMAP_TYPE_CUBE";break;case Fa:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Gv(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case ws:e="ENVMAP_MODE_REFRACTION";break}return e}function Wv(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case Ru:e="ENVMAP_BLENDING_MULTIPLY";break;case If:e="ENVMAP_BLENDING_MIX";break;case Lf:e="ENVMAP_BLENDING_ADD";break}return e}function Xv(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function qv(r,e,t,n){const i=r.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Hv(t),c=Vv(t),h=Gv(t),u=Wv(t),d=Xv(t),f=Lv(t),m=Nv(s),v=i.createProgram();let g,p,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(nr).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(nr).join(`
`),p.length>0&&(p+=`
`)):(g=[Ih(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(nr).join(`
`),p=[Ih(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==xi?"#define TONE_MAPPING":"",t.toneMapping!==xi?ke.tonemapping_pars_fragment:"",t.toneMapping!==xi?Dv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ke.colorspace_pars_fragment,Pv("linearToOutputTexel",t.outputColorSpace),Iv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(nr).join(`
`)),a=Dl(a),a=Ch(a,t),a=Ph(a,t),o=Dl(o),o=Ch(o,t),o=Ph(o,t),a=Dh(a),o=Dh(o),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Xc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Xc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const T=x+g+a,_=x+p+o,D=Eh(i,i.VERTEX_SHADER,T),E=Eh(i,i.FRAGMENT_SHADER,_);i.attachShader(v,D),i.attachShader(v,E),t.index0AttributeName!==void 0?i.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function R(C){if(r.debug.checkShaderErrors){const L=i.getProgramInfoLog(v).trim(),I=i.getShaderInfoLog(D).trim(),O=i.getShaderInfoLog(E).trim();let V=!0,B=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(V=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,v,D,E);else{const $=Rh(i,D,"vertex"),G=Rh(i,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+L+`
`+$+`
`+G)}else L!==""?console.warn("THREE.WebGLProgram: Program Info Log:",L):(I===""||O==="")&&(B=!1);B&&(C.diagnostics={runnable:V,programLog:L,vertexShader:{log:I,prefix:g},fragmentShader:{log:O,prefix:p}})}i.deleteShader(D),i.deleteShader(E),w=new xa(i,v),M=Uv(i,v)}let w;this.getUniforms=function(){return w===void 0&&R(this),w};let M;this.getAttributes=function(){return M===void 0&&R(this),M};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=i.getProgramParameter(v,Ev)),y},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Av++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=D,this.fragmentShader=E,this}let jv=0;class $v{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Yv(e),t.set(e,n)),n}}class Yv{constructor(e){this.id=jv++,this.code=e,this.usedTimes=0}}function Kv(r,e,t,n,i,s,a){const o=new Ju,l=new $v,c=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(M){return c.add(M),M===0?"uv":`uv${M}`}function g(M,y,C,L,I){const O=L.fog,V=I.geometry,B=M.isMeshStandardMaterial?L.environment:null,$=(M.isMeshStandardMaterial?t:e).get(M.envMap||B),G=$&&$.mapping===Fa?$.image.height:null,H=m[M.type];M.precision!==null&&(f=i.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));const K=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Q=K!==void 0?K.length:0;let se=0;V.morphAttributes.position!==void 0&&(se=1),V.morphAttributes.normal!==void 0&&(se=2),V.morphAttributes.color!==void 0&&(se=3);let Me,j,te,le;if(H){const it=Dn[H];Me=it.vertexShader,j=it.fragmentShader}else Me=M.vertexShader,j=M.fragmentShader,l.update(M),te=l.getVertexShaderID(M),le=l.getFragmentShaderID(M);const ie=r.getRenderTarget(),de=r.state.buffers.depth.getReversed(),fe=I.isInstancedMesh===!0,_e=I.isBatchedMesh===!0,Je=!!M.map,Be=!!M.matcap,Qe=!!$,U=!!M.aoMap,vt=!!M.lightMap,Fe=!!M.bumpMap,Ne=!!M.normalMap,Ae=!!M.displacementMap,$e=!!M.emissiveMap,Te=!!M.metalnessMap,P=!!M.roughnessMap,S=M.anisotropy>0,z=M.clearcoat>0,Z=M.dispersion>0,ee=M.iridescence>0,Y=M.sheen>0,Se=M.transmission>0,ce=S&&!!M.anisotropyMap,pe=z&&!!M.clearcoatMap,Ge=z&&!!M.clearcoatNormalMap,ne=z&&!!M.clearcoatRoughnessMap,xe=ee&&!!M.iridescenceMap,De=ee&&!!M.iridescenceThicknessMap,Ie=Y&&!!M.sheenColorMap,ye=Y&&!!M.sheenRoughnessMap,Xe=!!M.specularMap,Le=!!M.specularColorMap,Ye=!!M.specularIntensityMap,N=Se&&!!M.transmissionMap,oe=Se&&!!M.thicknessMap,q=!!M.gradientMap,J=!!M.alphaMap,ve=M.alphaTest>0,me=!!M.alphaHash,ze=!!M.extensions;let mt=xi;M.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(mt=r.toneMapping);const Nt={shaderID:H,shaderType:M.type,shaderName:M.name,vertexShader:Me,fragmentShader:j,defines:M.defines,customVertexShaderID:te,customFragmentShaderID:le,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:_e,batchingColor:_e&&I._colorsTexture!==null,instancing:fe,instancingColor:fe&&I.instanceColor!==null,instancingMorph:fe&&I.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ie===null?r.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:Ht,alphaToCoverage:!!M.alphaToCoverage,map:Je,matcap:Be,envMap:Qe,envMapMode:Qe&&$.mapping,envMapCubeUVHeight:G,aoMap:U,lightMap:vt,bumpMap:Fe,normalMap:Ne,displacementMap:d&&Ae,emissiveMap:$e,normalMapObjectSpace:Ne&&M.normalMapType===Hf,normalMapTangentSpace:Ne&&M.normalMapType===tc,metalnessMap:Te,roughnessMap:P,anisotropy:S,anisotropyMap:ce,clearcoat:z,clearcoatMap:pe,clearcoatNormalMap:Ge,clearcoatRoughnessMap:ne,dispersion:Z,iridescence:ee,iridescenceMap:xe,iridescenceThicknessMap:De,sheen:Y,sheenColorMap:Ie,sheenRoughnessMap:ye,specularMap:Xe,specularColorMap:Le,specularIntensityMap:Ye,transmission:Se,transmissionMap:N,thicknessMap:oe,gradientMap:q,opaque:M.transparent===!1&&M.blending===Bi&&M.alphaToCoverage===!1,alphaMap:J,alphaTest:ve,alphaHash:me,combine:M.combine,mapUv:Je&&v(M.map.channel),aoMapUv:U&&v(M.aoMap.channel),lightMapUv:vt&&v(M.lightMap.channel),bumpMapUv:Fe&&v(M.bumpMap.channel),normalMapUv:Ne&&v(M.normalMap.channel),displacementMapUv:Ae&&v(M.displacementMap.channel),emissiveMapUv:$e&&v(M.emissiveMap.channel),metalnessMapUv:Te&&v(M.metalnessMap.channel),roughnessMapUv:P&&v(M.roughnessMap.channel),anisotropyMapUv:ce&&v(M.anisotropyMap.channel),clearcoatMapUv:pe&&v(M.clearcoatMap.channel),clearcoatNormalMapUv:Ge&&v(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ne&&v(M.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&v(M.iridescenceMap.channel),iridescenceThicknessMapUv:De&&v(M.iridescenceThicknessMap.channel),sheenColorMapUv:Ie&&v(M.sheenColorMap.channel),sheenRoughnessMapUv:ye&&v(M.sheenRoughnessMap.channel),specularMapUv:Xe&&v(M.specularMap.channel),specularColorMapUv:Le&&v(M.specularColorMap.channel),specularIntensityMapUv:Ye&&v(M.specularIntensityMap.channel),transmissionMapUv:N&&v(M.transmissionMap.channel),thicknessMapUv:oe&&v(M.thicknessMap.channel),alphaMapUv:J&&v(M.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(Ne||S),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!V.attributes.uv&&(Je||J),fog:!!O,useFog:M.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:de,skinning:I.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:se,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:r.shadowMap.enabled&&C.length>0,shadowMapType:r.shadowMap.type,toneMapping:mt,decodeVideoTexture:Je&&M.map.isVideoTexture===!0&&qe.getTransfer(M.map.colorSpace)===st,decodeVideoTextureEmissive:$e&&M.emissiveMap.isVideoTexture===!0&&qe.getTransfer(M.emissiveMap.colorSpace)===st,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===xt,flipSided:M.side===zt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:ze&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ze&&M.extensions.multiDraw===!0||_e)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Nt.vertexUv1s=c.has(1),Nt.vertexUv2s=c.has(2),Nt.vertexUv3s=c.has(3),c.clear(),Nt}function p(M){const y=[];if(M.shaderID?y.push(M.shaderID):(y.push(M.customVertexShaderID),y.push(M.customFragmentShaderID)),M.defines!==void 0)for(const C in M.defines)y.push(C),y.push(M.defines[C]);return M.isRawShaderMaterial===!1&&(x(y,M),T(y,M),y.push(r.outputColorSpace)),y.push(M.customProgramCacheKey),y.join()}function x(M,y){M.push(y.precision),M.push(y.outputColorSpace),M.push(y.envMapMode),M.push(y.envMapCubeUVHeight),M.push(y.mapUv),M.push(y.alphaMapUv),M.push(y.lightMapUv),M.push(y.aoMapUv),M.push(y.bumpMapUv),M.push(y.normalMapUv),M.push(y.displacementMapUv),M.push(y.emissiveMapUv),M.push(y.metalnessMapUv),M.push(y.roughnessMapUv),M.push(y.anisotropyMapUv),M.push(y.clearcoatMapUv),M.push(y.clearcoatNormalMapUv),M.push(y.clearcoatRoughnessMapUv),M.push(y.iridescenceMapUv),M.push(y.iridescenceThicknessMapUv),M.push(y.sheenColorMapUv),M.push(y.sheenRoughnessMapUv),M.push(y.specularMapUv),M.push(y.specularColorMapUv),M.push(y.specularIntensityMapUv),M.push(y.transmissionMapUv),M.push(y.thicknessMapUv),M.push(y.combine),M.push(y.fogExp2),M.push(y.sizeAttenuation),M.push(y.morphTargetsCount),M.push(y.morphAttributeCount),M.push(y.numDirLights),M.push(y.numPointLights),M.push(y.numSpotLights),M.push(y.numSpotLightMaps),M.push(y.numHemiLights),M.push(y.numRectAreaLights),M.push(y.numDirLightShadows),M.push(y.numPointLightShadows),M.push(y.numSpotLightShadows),M.push(y.numSpotLightShadowsWithMaps),M.push(y.numLightProbes),M.push(y.shadowMapType),M.push(y.toneMapping),M.push(y.numClippingPlanes),M.push(y.numClipIntersection),M.push(y.depthPacking)}function T(M,y){o.disableAll(),y.supportsVertexTextures&&o.enable(0),y.instancing&&o.enable(1),y.instancingColor&&o.enable(2),y.instancingMorph&&o.enable(3),y.matcap&&o.enable(4),y.envMap&&o.enable(5),y.normalMapObjectSpace&&o.enable(6),y.normalMapTangentSpace&&o.enable(7),y.clearcoat&&o.enable(8),y.iridescence&&o.enable(9),y.alphaTest&&o.enable(10),y.vertexColors&&o.enable(11),y.vertexAlphas&&o.enable(12),y.vertexUv1s&&o.enable(13),y.vertexUv2s&&o.enable(14),y.vertexUv3s&&o.enable(15),y.vertexTangents&&o.enable(16),y.anisotropy&&o.enable(17),y.alphaHash&&o.enable(18),y.batching&&o.enable(19),y.dispersion&&o.enable(20),y.batchingColor&&o.enable(21),M.push(o.mask),o.disableAll(),y.fog&&o.enable(0),y.useFog&&o.enable(1),y.flatShading&&o.enable(2),y.logarithmicDepthBuffer&&o.enable(3),y.reverseDepthBuffer&&o.enable(4),y.skinning&&o.enable(5),y.morphTargets&&o.enable(6),y.morphNormals&&o.enable(7),y.morphColors&&o.enable(8),y.premultipliedAlpha&&o.enable(9),y.shadowMapEnabled&&o.enable(10),y.doubleSided&&o.enable(11),y.flipSided&&o.enable(12),y.useDepthPacking&&o.enable(13),y.dithering&&o.enable(14),y.transmission&&o.enable(15),y.sheen&&o.enable(16),y.opaque&&o.enable(17),y.pointsUvs&&o.enable(18),y.decodeVideoTexture&&o.enable(19),y.decodeVideoTextureEmissive&&o.enable(20),y.alphaToCoverage&&o.enable(21),M.push(o.mask)}function _(M){const y=m[M.type];let C;if(y){const L=Dn[y];C=yn.clone(L.uniforms)}else C=M.uniforms;return C}function D(M,y){let C;for(let L=0,I=h.length;L<I;L++){const O=h[L];if(O.cacheKey===y){C=O,++C.usedTimes;break}}return C===void 0&&(C=new qv(r,y,M,s),h.push(C)),C}function E(M){if(--M.usedTimes===0){const y=h.indexOf(M);h[y]=h[h.length-1],h.pop(),M.destroy()}}function R(M){l.remove(M)}function w(){l.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:_,acquireProgram:D,releaseProgram:E,releaseShaderCache:R,programs:h,dispose:w}}function Zv(){let r=new WeakMap;function e(a){return r.has(a)}function t(a){let o=r.get(a);return o===void 0&&(o={},r.set(a,o)),o}function n(a){r.delete(a)}function i(a,o,l){r.get(a)[o]=l}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function Jv(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function Lh(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Nh(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(u,d,f,m,v,g){let p=r[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:f,groupOrder:m,renderOrder:u.renderOrder,z:v,group:g},r[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=f,p.groupOrder=m,p.renderOrder=u.renderOrder,p.z=v,p.group=g),e++,p}function o(u,d,f,m,v,g){const p=a(u,d,f,m,v,g);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function l(u,d,f,m,v,g){const p=a(u,d,f,m,v,g);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function c(u,d){t.length>1&&t.sort(u||Jv),n.length>1&&n.sort(d||Lh),i.length>1&&i.sort(d||Lh)}function h(){for(let u=e,d=r.length;u<d;u++){const f=r[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:o,unshift:l,finish:h,sort:c}}function Qv(){let r=new WeakMap;function e(n,i){const s=r.get(n);let a;return s===void 0?(a=new Nh,r.set(n,[a])):i>=s.length?(a=new Nh,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function e_(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new A,color:new ue};break;case"SpotLight":t={position:new A,direction:new A,color:new ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new A,color:new ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new A,skyColor:new ue,groundColor:new ue};break;case"RectAreaLight":t={color:new ue,position:new A,halfWidth:new A,halfHeight:new A};break}return r[e.id]=t,t}}}function t_(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let n_=0;function i_(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function s_(r){const e=new e_,t=t_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new A);const i=new A,s=new Pe,a=new Pe;function o(c){let h=0,u=0,d=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let f=0,m=0,v=0,g=0,p=0,x=0,T=0,_=0,D=0,E=0,R=0;c.sort(i_);for(let M=0,y=c.length;M<y;M++){const C=c[M],L=C.color,I=C.intensity,O=C.distance,V=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=L.r*I,u+=L.g*I,d+=L.b*I;else if(C.isLightProbe){for(let B=0;B<9;B++)n.probe[B].addScaledVector(C.sh.coefficients[B],I);R++}else if(C.isDirectionalLight){const B=e.get(C);if(B.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const $=C.shadow,G=t.get(C);G.shadowIntensity=$.intensity,G.shadowBias=$.bias,G.shadowNormalBias=$.normalBias,G.shadowRadius=$.radius,G.shadowMapSize=$.mapSize,n.directionalShadow[f]=G,n.directionalShadowMap[f]=V,n.directionalShadowMatrix[f]=C.shadow.matrix,x++}n.directional[f]=B,f++}else if(C.isSpotLight){const B=e.get(C);B.position.setFromMatrixPosition(C.matrixWorld),B.color.copy(L).multiplyScalar(I),B.distance=O,B.coneCos=Math.cos(C.angle),B.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),B.decay=C.decay,n.spot[v]=B;const $=C.shadow;if(C.map&&(n.spotLightMap[D]=C.map,D++,$.updateMatrices(C),C.castShadow&&E++),n.spotLightMatrix[v]=$.matrix,C.castShadow){const G=t.get(C);G.shadowIntensity=$.intensity,G.shadowBias=$.bias,G.shadowNormalBias=$.normalBias,G.shadowRadius=$.radius,G.shadowMapSize=$.mapSize,n.spotShadow[v]=G,n.spotShadowMap[v]=V,_++}v++}else if(C.isRectAreaLight){const B=e.get(C);B.color.copy(L).multiplyScalar(I),B.halfWidth.set(C.width*.5,0,0),B.halfHeight.set(0,C.height*.5,0),n.rectArea[g]=B,g++}else if(C.isPointLight){const B=e.get(C);if(B.color.copy(C.color).multiplyScalar(C.intensity),B.distance=C.distance,B.decay=C.decay,C.castShadow){const $=C.shadow,G=t.get(C);G.shadowIntensity=$.intensity,G.shadowBias=$.bias,G.shadowNormalBias=$.normalBias,G.shadowRadius=$.radius,G.shadowMapSize=$.mapSize,G.shadowCameraNear=$.camera.near,G.shadowCameraFar=$.camera.far,n.pointShadow[m]=G,n.pointShadowMap[m]=V,n.pointShadowMatrix[m]=C.shadow.matrix,T++}n.point[m]=B,m++}else if(C.isHemisphereLight){const B=e.get(C);B.skyColor.copy(C.color).multiplyScalar(I),B.groundColor.copy(C.groundColor).multiplyScalar(I),n.hemi[p]=B,p++}}g>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=he.LTC_FLOAT_1,n.rectAreaLTC2=he.LTC_FLOAT_2):(n.rectAreaLTC1=he.LTC_HALF_1,n.rectAreaLTC2=he.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const w=n.hash;(w.directionalLength!==f||w.pointLength!==m||w.spotLength!==v||w.rectAreaLength!==g||w.hemiLength!==p||w.numDirectionalShadows!==x||w.numPointShadows!==T||w.numSpotShadows!==_||w.numSpotMaps!==D||w.numLightProbes!==R)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=g,n.point.length=m,n.hemi.length=p,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=T,n.pointShadowMap.length=T,n.spotShadow.length=_,n.spotShadowMap.length=_,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=T,n.spotLightMatrix.length=_+D-E,n.spotLightMap.length=D,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=R,w.directionalLength=f,w.pointLength=m,w.spotLength=v,w.rectAreaLength=g,w.hemiLength=p,w.numDirectionalShadows=x,w.numPointShadows=T,w.numSpotShadows=_,w.numSpotMaps=D,w.numLightProbes=R,n.version=n_++)}function l(c,h){let u=0,d=0,f=0,m=0,v=0;const g=h.matrixWorldInverse;for(let p=0,x=c.length;p<x;p++){const T=c[p];if(T.isDirectionalLight){const _=n.directional[u];_.direction.setFromMatrixPosition(T.matrixWorld),i.setFromMatrixPosition(T.target.matrixWorld),_.direction.sub(i),_.direction.transformDirection(g),u++}else if(T.isSpotLight){const _=n.spot[f];_.position.setFromMatrixPosition(T.matrixWorld),_.position.applyMatrix4(g),_.direction.setFromMatrixPosition(T.matrixWorld),i.setFromMatrixPosition(T.target.matrixWorld),_.direction.sub(i),_.direction.transformDirection(g),f++}else if(T.isRectAreaLight){const _=n.rectArea[m];_.position.setFromMatrixPosition(T.matrixWorld),_.position.applyMatrix4(g),a.identity(),s.copy(T.matrixWorld),s.premultiply(g),a.extractRotation(s),_.halfWidth.set(T.width*.5,0,0),_.halfHeight.set(0,T.height*.5,0),_.halfWidth.applyMatrix4(a),_.halfHeight.applyMatrix4(a),m++}else if(T.isPointLight){const _=n.point[d];_.position.setFromMatrixPosition(T.matrixWorld),_.position.applyMatrix4(g),d++}else if(T.isHemisphereLight){const _=n.hemi[v];_.direction.setFromMatrixPosition(T.matrixWorld),_.direction.transformDirection(g),v++}}}return{setup:o,setupView:l,state:n}}function Uh(r){const e=new s_(r),t=[],n=[];function i(h){c.camera=h,t.length=0,n.length=0}function s(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function r_(r){let e=new WeakMap;function t(i,s=0){const a=e.get(i);let o;return a===void 0?(o=new Uh(r),e.set(i,[o])):s>=a.length?(o=new Uh(r),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}class a_ extends un{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Bf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class o_ extends un{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const l_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,c_=`uniform sampler2D shadow_pass;
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
}`;function h_(r,e,t){let n=new ic;const i=new ae,s=new ae,a=new Ze,o=new a_({depthPacking:zf}),l=new o_,c={},h=t.maxTextureSize,u={[ni]:zt,[zt]:ni,[xt]:xt},d=new pt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ae},radius:{value:4}},vertexShader:l_,fragmentShader:c_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const m=new gt;m.setAttribute("position",new St(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Oe(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=wu;let p=this.type;this.render=function(E,R,w){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||E.length===0)return;const M=r.getRenderTarget(),y=r.getActiveCubeFace(),C=r.getActiveMipmapLevel(),L=r.state;L.setBlending(Dt),L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const I=p!==Kn&&this.type===Kn,O=p===Kn&&this.type!==Kn;for(let V=0,B=E.length;V<B;V++){const $=E[V],G=$.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;i.copy(G.mapSize);const H=G.getFrameExtents();if(i.multiply(H),s.copy(G.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/H.x),i.x=s.x*H.x,G.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/H.y),i.y=s.y*H.y,G.mapSize.y=s.y)),G.map===null||I===!0||O===!0){const Q=this.type!==Kn?{minFilter:Lt,magFilter:Lt}:{};G.map!==null&&G.map.dispose(),G.map=new Qt(i.x,i.y,Q),G.map.texture.name=$.name+".shadowMap",G.camera.updateProjectionMatrix()}r.setRenderTarget(G.map),r.clear();const K=G.getViewportCount();for(let Q=0;Q<K;Q++){const se=G.getViewport(Q);a.set(s.x*se.x,s.y*se.y,s.x*se.z,s.y*se.w),L.viewport(a),G.updateMatrices($,Q),n=G.getFrustum(),_(R,w,G.camera,$,this.type)}G.isPointLightShadow!==!0&&this.type===Kn&&x(G,w),G.needsUpdate=!1}p=this.type,g.needsUpdate=!1,r.setRenderTarget(M,y,C)};function x(E,R){const w=e.update(v);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Qt(i.x,i.y)),d.uniforms.shadow_pass.value=E.map.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,r.setRenderTarget(E.mapPass),r.clear(),r.renderBufferDirect(R,null,w,d,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,r.setRenderTarget(E.map),r.clear(),r.renderBufferDirect(R,null,w,f,v,null)}function T(E,R,w,M){let y=null;const C=w.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(C!==void 0)y=C;else if(y=w.isPointLight===!0?l:o,r.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const L=y.uuid,I=R.uuid;let O=c[L];O===void 0&&(O={},c[L]=O);let V=O[I];V===void 0&&(V=y.clone(),O[I]=V,R.addEventListener("dispose",D)),y=V}if(y.visible=R.visible,y.wireframe=R.wireframe,M===Kn?y.side=R.shadowSide!==null?R.shadowSide:R.side:y.side=R.shadowSide!==null?R.shadowSide:u[R.side],y.alphaMap=R.alphaMap,y.alphaTest=R.alphaTest,y.map=R.map,y.clipShadows=R.clipShadows,y.clippingPlanes=R.clippingPlanes,y.clipIntersection=R.clipIntersection,y.displacementMap=R.displacementMap,y.displacementScale=R.displacementScale,y.displacementBias=R.displacementBias,y.wireframeLinewidth=R.wireframeLinewidth,y.linewidth=R.linewidth,w.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const L=r.properties.get(y);L.light=w}return y}function _(E,R,w,M,y){if(E.visible===!1)return;if(E.layers.test(R.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&y===Kn)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,E.matrixWorld);const I=e.update(E),O=E.material;if(Array.isArray(O)){const V=I.groups;for(let B=0,$=V.length;B<$;B++){const G=V[B],H=O[G.materialIndex];if(H&&H.visible){const K=T(E,H,M,y);E.onBeforeShadow(r,E,R,w,I,K,G),r.renderBufferDirect(w,null,I,K,E,G),E.onAfterShadow(r,E,R,w,I,K,G)}}}else if(O.visible){const V=T(E,O,M,y);E.onBeforeShadow(r,E,R,w,I,V,null),r.renderBufferDirect(w,null,I,V,E,null),E.onAfterShadow(r,E,R,w,I,V,null)}}const L=E.children;for(let I=0,O=L.length;I<O;I++)_(L[I],R,w,M,y)}function D(E){E.target.removeEventListener("dispose",D);for(const w in c){const M=c[w],y=E.target.uuid;y in M&&(M[y].dispose(),delete M[y])}}}const u_={[jo]:$o,[Yo]:Jo,[Ko]:Qo,[Ss]:Zo,[$o]:jo,[Jo]:Yo,[Qo]:Ko,[Zo]:Ss};function d_(r,e){function t(){let N=!1;const oe=new Ze;let q=null;const J=new Ze(0,0,0,0);return{setMask:function(ve){q!==ve&&!N&&(r.colorMask(ve,ve,ve,ve),q=ve)},setLocked:function(ve){N=ve},setClear:function(ve,me,ze,mt,Nt){Nt===!0&&(ve*=mt,me*=mt,ze*=mt),oe.set(ve,me,ze,mt),J.equals(oe)===!1&&(r.clearColor(ve,me,ze,mt),J.copy(oe))},reset:function(){N=!1,q=null,J.set(-1,0,0,0)}}}function n(){let N=!1,oe=!1,q=null,J=null,ve=null;return{setReversed:function(me){if(oe!==me){const ze=e.get("EXT_clip_control");oe?ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.ZERO_TO_ONE_EXT):ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.NEGATIVE_ONE_TO_ONE_EXT);const mt=ve;ve=null,this.setClear(mt)}oe=me},getReversed:function(){return oe},setTest:function(me){me?ie(r.DEPTH_TEST):de(r.DEPTH_TEST)},setMask:function(me){q!==me&&!N&&(r.depthMask(me),q=me)},setFunc:function(me){if(oe&&(me=u_[me]),J!==me){switch(me){case jo:r.depthFunc(r.NEVER);break;case $o:r.depthFunc(r.ALWAYS);break;case Yo:r.depthFunc(r.LESS);break;case Ss:r.depthFunc(r.LEQUAL);break;case Ko:r.depthFunc(r.EQUAL);break;case Zo:r.depthFunc(r.GEQUAL);break;case Jo:r.depthFunc(r.GREATER);break;case Qo:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}J=me}},setLocked:function(me){N=me},setClear:function(me){ve!==me&&(oe&&(me=1-me),r.clearDepth(me),ve=me)},reset:function(){N=!1,q=null,J=null,ve=null,oe=!1}}}function i(){let N=!1,oe=null,q=null,J=null,ve=null,me=null,ze=null,mt=null,Nt=null;return{setTest:function(it){N||(it?ie(r.STENCIL_TEST):de(r.STENCIL_TEST))},setMask:function(it){oe!==it&&!N&&(r.stencilMask(it),oe=it)},setFunc:function(it,dn,zn){(q!==it||J!==dn||ve!==zn)&&(r.stencilFunc(it,dn,zn),q=it,J=dn,ve=zn)},setOp:function(it,dn,zn){(me!==it||ze!==dn||mt!==zn)&&(r.stencilOp(it,dn,zn),me=it,ze=dn,mt=zn)},setLocked:function(it){N=it},setClear:function(it){Nt!==it&&(r.clearStencil(it),Nt=it)},reset:function(){N=!1,oe=null,q=null,J=null,ve=null,me=null,ze=null,mt=null,Nt=null}}}const s=new t,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},d=new WeakMap,f=[],m=null,v=!1,g=null,p=null,x=null,T=null,_=null,D=null,E=null,R=new ue(0,0,0),w=0,M=!1,y=null,C=null,L=null,I=null,O=null;const V=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let B=!1,$=0;const G=r.getParameter(r.VERSION);G.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(G)[1]),B=$>=1):G.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),B=$>=2);let H=null,K={};const Q=r.getParameter(r.SCISSOR_BOX),se=r.getParameter(r.VIEWPORT),Me=new Ze().fromArray(Q),j=new Ze().fromArray(se);function te(N,oe,q,J){const ve=new Uint8Array(4),me=r.createTexture();r.bindTexture(N,me),r.texParameteri(N,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(N,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let ze=0;ze<q;ze++)N===r.TEXTURE_3D||N===r.TEXTURE_2D_ARRAY?r.texImage3D(oe,0,r.RGBA,1,1,J,0,r.RGBA,r.UNSIGNED_BYTE,ve):r.texImage2D(oe+ze,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,ve);return me}const le={};le[r.TEXTURE_2D]=te(r.TEXTURE_2D,r.TEXTURE_2D,1),le[r.TEXTURE_CUBE_MAP]=te(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[r.TEXTURE_2D_ARRAY]=te(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),le[r.TEXTURE_3D]=te(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ie(r.DEPTH_TEST),a.setFunc(Ss),Fe(!1),Ne(zc),ie(r.CULL_FACE),U(Dt);function ie(N){h[N]!==!0&&(r.enable(N),h[N]=!0)}function de(N){h[N]!==!1&&(r.disable(N),h[N]=!1)}function fe(N,oe){return u[N]!==oe?(r.bindFramebuffer(N,oe),u[N]=oe,N===r.DRAW_FRAMEBUFFER&&(u[r.FRAMEBUFFER]=oe),N===r.FRAMEBUFFER&&(u[r.DRAW_FRAMEBUFFER]=oe),!0):!1}function _e(N,oe){let q=f,J=!1;if(N){q=d.get(oe),q===void 0&&(q=[],d.set(oe,q));const ve=N.textures;if(q.length!==ve.length||q[0]!==r.COLOR_ATTACHMENT0){for(let me=0,ze=ve.length;me<ze;me++)q[me]=r.COLOR_ATTACHMENT0+me;q.length=ve.length,J=!0}}else q[0]!==r.BACK&&(q[0]=r.BACK,J=!0);J&&r.drawBuffers(q)}function Je(N){return m!==N?(r.useProgram(N),m=N,!0):!1}const Be={[_n]:r.FUNC_ADD,[_f]:r.FUNC_SUBTRACT,[xf]:r.FUNC_REVERSE_SUBTRACT};Be[yf]=r.MIN,Be[Mf]=r.MAX;const Qe={[Qs]:r.ZERO,[Tf]:r.ONE,[Sf]:r.SRC_COLOR,[Go]:r.SRC_ALPHA,[Af]:r.SRC_ALPHA_SATURATE,[qo]:r.DST_COLOR,[Xo]:r.DST_ALPHA,[bf]:r.ONE_MINUS_SRC_COLOR,[Wo]:r.ONE_MINUS_SRC_ALPHA,[Ef]:r.ONE_MINUS_DST_COLOR,[wf]:r.ONE_MINUS_DST_ALPHA,[Rf]:r.CONSTANT_COLOR,[Cf]:r.ONE_MINUS_CONSTANT_COLOR,[Pf]:r.CONSTANT_ALPHA,[Df]:r.ONE_MINUS_CONSTANT_ALPHA};function U(N,oe,q,J,ve,me,ze,mt,Nt,it){if(N===Dt){v===!0&&(de(r.BLEND),v=!1);return}if(v===!1&&(ie(r.BLEND),v=!0),N!==Au){if(N!==g||it!==M){if((p!==_n||_!==_n)&&(r.blendEquation(r.FUNC_ADD),p=_n,_=_n),it)switch(N){case Bi:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Ln:r.blendFunc(r.ONE,r.ONE);break;case Hc:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Vc:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case Bi:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Ln:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case Hc:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Vc:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}x=null,T=null,D=null,E=null,R.set(0,0,0),w=0,g=N,M=it}return}ve=ve||oe,me=me||q,ze=ze||J,(oe!==p||ve!==_)&&(r.blendEquationSeparate(Be[oe],Be[ve]),p=oe,_=ve),(q!==x||J!==T||me!==D||ze!==E)&&(r.blendFuncSeparate(Qe[q],Qe[J],Qe[me],Qe[ze]),x=q,T=J,D=me,E=ze),(mt.equals(R)===!1||Nt!==w)&&(r.blendColor(mt.r,mt.g,mt.b,Nt),R.copy(mt),w=Nt),g=N,M=!1}function vt(N,oe){N.side===xt?de(r.CULL_FACE):ie(r.CULL_FACE);let q=N.side===zt;oe&&(q=!q),Fe(q),N.blending===Bi&&N.transparent===!1?U(Dt):U(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),s.setMask(N.colorWrite);const J=N.stencilWrite;o.setTest(J),J&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),$e(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?ie(r.SAMPLE_ALPHA_TO_COVERAGE):de(r.SAMPLE_ALPHA_TO_COVERAGE)}function Fe(N){y!==N&&(N?r.frontFace(r.CW):r.frontFace(r.CCW),y=N)}function Ne(N){N!==gf?(ie(r.CULL_FACE),N!==C&&(N===zc?r.cullFace(r.BACK):N===vf?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):de(r.CULL_FACE),C=N}function Ae(N){N!==L&&(B&&r.lineWidth(N),L=N)}function $e(N,oe,q){N?(ie(r.POLYGON_OFFSET_FILL),(I!==oe||O!==q)&&(r.polygonOffset(oe,q),I=oe,O=q)):de(r.POLYGON_OFFSET_FILL)}function Te(N){N?ie(r.SCISSOR_TEST):de(r.SCISSOR_TEST)}function P(N){N===void 0&&(N=r.TEXTURE0+V-1),H!==N&&(r.activeTexture(N),H=N)}function S(N,oe,q){q===void 0&&(H===null?q=r.TEXTURE0+V-1:q=H);let J=K[q];J===void 0&&(J={type:void 0,texture:void 0},K[q]=J),(J.type!==N||J.texture!==oe)&&(H!==q&&(r.activeTexture(q),H=q),r.bindTexture(N,oe||le[N]),J.type=N,J.texture=oe)}function z(){const N=K[H];N!==void 0&&N.type!==void 0&&(r.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function Z(){try{r.compressedTexImage2D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ee(){try{r.compressedTexImage3D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Y(){try{r.texSubImage2D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Se(){try{r.texSubImage3D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ce(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function pe(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ge(){try{r.texStorage2D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ne(){try{r.texStorage3D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function xe(){try{r.texImage2D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function De(){try{r.texImage3D.apply(r,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ie(N){Me.equals(N)===!1&&(r.scissor(N.x,N.y,N.z,N.w),Me.copy(N))}function ye(N){j.equals(N)===!1&&(r.viewport(N.x,N.y,N.z,N.w),j.copy(N))}function Xe(N,oe){let q=c.get(oe);q===void 0&&(q=new WeakMap,c.set(oe,q));let J=q.get(N);J===void 0&&(J=r.getUniformBlockIndex(oe,N.name),q.set(N,J))}function Le(N,oe){const J=c.get(oe).get(N);l.get(oe)!==J&&(r.uniformBlockBinding(oe,J,N.__bindingPointIndex),l.set(oe,J))}function Ye(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),a.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),h={},H=null,K={},u={},d=new WeakMap,f=[],m=null,v=!1,g=null,p=null,x=null,T=null,_=null,D=null,E=null,R=new ue(0,0,0),w=0,M=!1,y=null,C=null,L=null,I=null,O=null,Me.set(0,0,r.canvas.width,r.canvas.height),j.set(0,0,r.canvas.width,r.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:ie,disable:de,bindFramebuffer:fe,drawBuffers:_e,useProgram:Je,setBlending:U,setMaterial:vt,setFlipSided:Fe,setCullFace:Ne,setLineWidth:Ae,setPolygonOffset:$e,setScissorTest:Te,activeTexture:P,bindTexture:S,unbindTexture:z,compressedTexImage2D:Z,compressedTexImage3D:ee,texImage2D:xe,texImage3D:De,updateUBOMapping:Xe,uniformBlockBinding:Le,texStorage2D:Ge,texStorage3D:ne,texSubImage2D:Y,texSubImage3D:Se,compressedTexSubImage2D:ce,compressedTexSubImage3D:pe,scissor:Ie,viewport:ye,reset:Ye}}function kh(r,e,t,n){const i=f_(n);switch(t){case Bu:return r*e;case Hu:return r*e;case Vu:return r*e*2;case Kl:return r*e/i.components*i.byteLength;case Zl:return r*e/i.components*i.byteLength;case Gu:return r*e*2/i.components*i.byteLength;case Jl:return r*e*2/i.components*i.byteLength;case zu:return r*e*3/i.components*i.byteLength;case qt:return r*e*4/i.components*i.byteLength;case Ql:return r*e*4/i.components*i.byteLength;case pa:case ma:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case ga:case va:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case nl:case sl:return Math.max(r,16)*Math.max(e,8)/4;case tl:case il:return Math.max(r,8)*Math.max(e,8)/2;case rl:case al:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case ol:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case ll:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case cl:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case hl:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case ul:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case dl:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case fl:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case pl:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case ml:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case gl:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case vl:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case _l:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case xl:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case yl:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case Ml:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case _a:case Tl:case Sl:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Wu:case bl:return Math.ceil(r/4)*Math.ceil(e/4)*8;case wl:case El:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function f_(r){switch(r){case Un:case ku:return{byteLength:1,components:1};case pr:case Fu:case Bt:return{byteLength:2,components:1};case $l:case Yl:return{byteLength:2,components:4};case zi:case jl:case Zt:return{byteLength:4,components:1};case Ou:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}function p_(r,e,t,n,i,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ae,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(P,S){return f?new OffscreenCanvas(P,S):vr("canvas")}function v(P,S,z){let Z=1;const ee=Te(P);if((ee.width>z||ee.height>z)&&(Z=z/Math.max(ee.width,ee.height)),Z<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const Y=Math.floor(Z*ee.width),Se=Math.floor(Z*ee.height);u===void 0&&(u=m(Y,Se));const ce=S?m(Y,Se):u;return ce.width=Y,ce.height=Se,ce.getContext("2d").drawImage(P,0,0,Y,Se),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+Y+"x"+Se+")."),ce}else return"data"in P&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),P;return P}function g(P){return P.generateMipmaps}function p(P){r.generateMipmap(P)}function x(P){return P.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?r.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function T(P,S,z,Z,ee=!1){if(P!==null){if(r[P]!==void 0)return r[P];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let Y=S;if(S===r.RED&&(z===r.FLOAT&&(Y=r.R32F),z===r.HALF_FLOAT&&(Y=r.R16F),z===r.UNSIGNED_BYTE&&(Y=r.R8)),S===r.RED_INTEGER&&(z===r.UNSIGNED_BYTE&&(Y=r.R8UI),z===r.UNSIGNED_SHORT&&(Y=r.R16UI),z===r.UNSIGNED_INT&&(Y=r.R32UI),z===r.BYTE&&(Y=r.R8I),z===r.SHORT&&(Y=r.R16I),z===r.INT&&(Y=r.R32I)),S===r.RG&&(z===r.FLOAT&&(Y=r.RG32F),z===r.HALF_FLOAT&&(Y=r.RG16F),z===r.UNSIGNED_BYTE&&(Y=r.RG8)),S===r.RG_INTEGER&&(z===r.UNSIGNED_BYTE&&(Y=r.RG8UI),z===r.UNSIGNED_SHORT&&(Y=r.RG16UI),z===r.UNSIGNED_INT&&(Y=r.RG32UI),z===r.BYTE&&(Y=r.RG8I),z===r.SHORT&&(Y=r.RG16I),z===r.INT&&(Y=r.RG32I)),S===r.RGB_INTEGER&&(z===r.UNSIGNED_BYTE&&(Y=r.RGB8UI),z===r.UNSIGNED_SHORT&&(Y=r.RGB16UI),z===r.UNSIGNED_INT&&(Y=r.RGB32UI),z===r.BYTE&&(Y=r.RGB8I),z===r.SHORT&&(Y=r.RGB16I),z===r.INT&&(Y=r.RGB32I)),S===r.RGBA_INTEGER&&(z===r.UNSIGNED_BYTE&&(Y=r.RGBA8UI),z===r.UNSIGNED_SHORT&&(Y=r.RGBA16UI),z===r.UNSIGNED_INT&&(Y=r.RGBA32UI),z===r.BYTE&&(Y=r.RGBA8I),z===r.SHORT&&(Y=r.RGBA16I),z===r.INT&&(Y=r.RGBA32I)),S===r.RGB&&z===r.UNSIGNED_INT_5_9_9_9_REV&&(Y=r.RGB9_E5),S===r.RGBA){const Se=ee?Oa:qe.getTransfer(Z);z===r.FLOAT&&(Y=r.RGBA32F),z===r.HALF_FLOAT&&(Y=r.RGBA16F),z===r.UNSIGNED_BYTE&&(Y=Se===st?r.SRGB8_ALPHA8:r.RGBA8),z===r.UNSIGNED_SHORT_4_4_4_4&&(Y=r.RGBA4),z===r.UNSIGNED_SHORT_5_5_5_1&&(Y=r.RGB5_A1)}return(Y===r.R16F||Y===r.R32F||Y===r.RG16F||Y===r.RG32F||Y===r.RGBA16F||Y===r.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function _(P,S){let z;return P?S===null||S===zi||S===Hi?z=r.DEPTH24_STENCIL8:S===Zt?z=r.DEPTH32F_STENCIL8:S===pr&&(z=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===zi||S===Hi?z=r.DEPTH_COMPONENT24:S===Zt?z=r.DEPTH_COMPONENT32F:S===pr&&(z=r.DEPTH_COMPONENT16),z}function D(P,S){return g(P)===!0||P.isFramebufferTexture&&P.minFilter!==Lt&&P.minFilter!==yt?Math.log2(Math.max(S.width,S.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?S.mipmaps.length:1}function E(P){const S=P.target;S.removeEventListener("dispose",E),w(S),S.isVideoTexture&&h.delete(S)}function R(P){const S=P.target;S.removeEventListener("dispose",R),y(S)}function w(P){const S=n.get(P);if(S.__webglInit===void 0)return;const z=P.source,Z=d.get(z);if(Z){const ee=Z[S.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&M(P),Object.keys(Z).length===0&&d.delete(z)}n.remove(P)}function M(P){const S=n.get(P);r.deleteTexture(S.__webglTexture);const z=P.source,Z=d.get(z);delete Z[S.__cacheKey],a.memory.textures--}function y(P){const S=n.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),n.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(S.__webglFramebuffer[Z]))for(let ee=0;ee<S.__webglFramebuffer[Z].length;ee++)r.deleteFramebuffer(S.__webglFramebuffer[Z][ee]);else r.deleteFramebuffer(S.__webglFramebuffer[Z]);S.__webglDepthbuffer&&r.deleteRenderbuffer(S.__webglDepthbuffer[Z])}else{if(Array.isArray(S.__webglFramebuffer))for(let Z=0;Z<S.__webglFramebuffer.length;Z++)r.deleteFramebuffer(S.__webglFramebuffer[Z]);else r.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&r.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&r.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let Z=0;Z<S.__webglColorRenderbuffer.length;Z++)S.__webglColorRenderbuffer[Z]&&r.deleteRenderbuffer(S.__webglColorRenderbuffer[Z]);S.__webglDepthRenderbuffer&&r.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const z=P.textures;for(let Z=0,ee=z.length;Z<ee;Z++){const Y=n.get(z[Z]);Y.__webglTexture&&(r.deleteTexture(Y.__webglTexture),a.memory.textures--),n.remove(z[Z])}n.remove(P)}let C=0;function L(){C=0}function I(){const P=C;return P>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+i.maxTextures),C+=1,P}function O(P){const S=[];return S.push(P.wrapS),S.push(P.wrapT),S.push(P.wrapR||0),S.push(P.magFilter),S.push(P.minFilter),S.push(P.anisotropy),S.push(P.internalFormat),S.push(P.format),S.push(P.type),S.push(P.generateMipmaps),S.push(P.premultiplyAlpha),S.push(P.flipY),S.push(P.unpackAlignment),S.push(P.colorSpace),S.join()}function V(P,S){const z=n.get(P);if(P.isVideoTexture&&Ae(P),P.isRenderTargetTexture===!1&&P.version>0&&z.__version!==P.version){const Z=P.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(z,P,S);return}}t.bindTexture(r.TEXTURE_2D,z.__webglTexture,r.TEXTURE0+S)}function B(P,S){const z=n.get(P);if(P.version>0&&z.__version!==P.version){j(z,P,S);return}t.bindTexture(r.TEXTURE_2D_ARRAY,z.__webglTexture,r.TEXTURE0+S)}function $(P,S){const z=n.get(P);if(P.version>0&&z.__version!==P.version){j(z,P,S);return}t.bindTexture(r.TEXTURE_3D,z.__webglTexture,r.TEXTURE0+S)}function G(P,S){const z=n.get(P);if(P.version>0&&z.__version!==P.version){te(z,P,S);return}t.bindTexture(r.TEXTURE_CUBE_MAP,z.__webglTexture,r.TEXTURE0+S)}const H={[bn]:r.REPEAT,[Nn]:r.CLAMP_TO_EDGE,[wa]:r.MIRRORED_REPEAT},K={[Lt]:r.NEAREST,[Uu]:r.NEAREST_MIPMAP_NEAREST,[er]:r.NEAREST_MIPMAP_LINEAR,[yt]:r.LINEAR,[fa]:r.LINEAR_MIPMAP_NEAREST,[Tn]:r.LINEAR_MIPMAP_LINEAR},Q={[Vf]:r.NEVER,[$f]:r.ALWAYS,[Gf]:r.LESS,[$u]:r.LEQUAL,[Wf]:r.EQUAL,[jf]:r.GEQUAL,[Xf]:r.GREATER,[qf]:r.NOTEQUAL};function se(P,S){if(S.type===Zt&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===yt||S.magFilter===fa||S.magFilter===er||S.magFilter===Tn||S.minFilter===yt||S.minFilter===fa||S.minFilter===er||S.minFilter===Tn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(P,r.TEXTURE_WRAP_S,H[S.wrapS]),r.texParameteri(P,r.TEXTURE_WRAP_T,H[S.wrapT]),(P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY)&&r.texParameteri(P,r.TEXTURE_WRAP_R,H[S.wrapR]),r.texParameteri(P,r.TEXTURE_MAG_FILTER,K[S.magFilter]),r.texParameteri(P,r.TEXTURE_MIN_FILTER,K[S.minFilter]),S.compareFunction&&(r.texParameteri(P,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(P,r.TEXTURE_COMPARE_FUNC,Q[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Lt||S.minFilter!==er&&S.minFilter!==Tn||S.type===Zt&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");r.texParameterf(P,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function Me(P,S){let z=!1;P.__webglInit===void 0&&(P.__webglInit=!0,S.addEventListener("dispose",E));const Z=S.source;let ee=d.get(Z);ee===void 0&&(ee={},d.set(Z,ee));const Y=O(S);if(Y!==P.__cacheKey){ee[Y]===void 0&&(ee[Y]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,z=!0),ee[Y].usedTimes++;const Se=ee[P.__cacheKey];Se!==void 0&&(ee[P.__cacheKey].usedTimes--,Se.usedTimes===0&&M(S)),P.__cacheKey=Y,P.__webglTexture=ee[Y].texture}return z}function j(P,S,z){let Z=r.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(Z=r.TEXTURE_2D_ARRAY),S.isData3DTexture&&(Z=r.TEXTURE_3D);const ee=Me(P,S),Y=S.source;t.bindTexture(Z,P.__webglTexture,r.TEXTURE0+z);const Se=n.get(Y);if(Y.version!==Se.__version||ee===!0){t.activeTexture(r.TEXTURE0+z);const ce=qe.getPrimaries(qe.workingColorSpace),pe=S.colorSpace===gi?null:qe.getPrimaries(S.colorSpace),Ge=S.colorSpace===gi||ce===pe?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ge);let ne=v(S.image,!1,i.maxTextureSize);ne=$e(S,ne);const xe=s.convert(S.format,S.colorSpace),De=s.convert(S.type);let Ie=T(S.internalFormat,xe,De,S.colorSpace,S.isVideoTexture);se(Z,S);let ye;const Xe=S.mipmaps,Le=S.isVideoTexture!==!0,Ye=Se.__version===void 0||ee===!0,N=Y.dataReady,oe=D(S,ne);if(S.isDepthTexture)Ie=_(S.format===Vi,S.type),Ye&&(Le?t.texStorage2D(r.TEXTURE_2D,1,Ie,ne.width,ne.height):t.texImage2D(r.TEXTURE_2D,0,Ie,ne.width,ne.height,0,xe,De,null));else if(S.isDataTexture)if(Xe.length>0){Le&&Ye&&t.texStorage2D(r.TEXTURE_2D,oe,Ie,Xe[0].width,Xe[0].height);for(let q=0,J=Xe.length;q<J;q++)ye=Xe[q],Le?N&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,ye.width,ye.height,xe,De,ye.data):t.texImage2D(r.TEXTURE_2D,q,Ie,ye.width,ye.height,0,xe,De,ye.data);S.generateMipmaps=!1}else Le?(Ye&&t.texStorage2D(r.TEXTURE_2D,oe,Ie,ne.width,ne.height),N&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ne.width,ne.height,xe,De,ne.data)):t.texImage2D(r.TEXTURE_2D,0,Ie,ne.width,ne.height,0,xe,De,ne.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Le&&Ye&&t.texStorage3D(r.TEXTURE_2D_ARRAY,oe,Ie,Xe[0].width,Xe[0].height,ne.depth);for(let q=0,J=Xe.length;q<J;q++)if(ye=Xe[q],S.format!==qt)if(xe!==null)if(Le){if(N)if(S.layerUpdates.size>0){const ve=kh(ye.width,ye.height,S.format,S.type);for(const me of S.layerUpdates){const ze=ye.data.subarray(me*ve/ye.data.BYTES_PER_ELEMENT,(me+1)*ve/ye.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,me,ye.width,ye.height,1,xe,ze)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,0,ye.width,ye.height,ne.depth,xe,ye.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,q,Ie,ye.width,ye.height,ne.depth,0,ye.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Le?N&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,0,ye.width,ye.height,ne.depth,xe,De,ye.data):t.texImage3D(r.TEXTURE_2D_ARRAY,q,Ie,ye.width,ye.height,ne.depth,0,xe,De,ye.data)}else{Le&&Ye&&t.texStorage2D(r.TEXTURE_2D,oe,Ie,Xe[0].width,Xe[0].height);for(let q=0,J=Xe.length;q<J;q++)ye=Xe[q],S.format!==qt?xe!==null?Le?N&&t.compressedTexSubImage2D(r.TEXTURE_2D,q,0,0,ye.width,ye.height,xe,ye.data):t.compressedTexImage2D(r.TEXTURE_2D,q,Ie,ye.width,ye.height,0,ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Le?N&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,ye.width,ye.height,xe,De,ye.data):t.texImage2D(r.TEXTURE_2D,q,Ie,ye.width,ye.height,0,xe,De,ye.data)}else if(S.isDataArrayTexture)if(Le){if(Ye&&t.texStorage3D(r.TEXTURE_2D_ARRAY,oe,Ie,ne.width,ne.height,ne.depth),N)if(S.layerUpdates.size>0){const q=kh(ne.width,ne.height,S.format,S.type);for(const J of S.layerUpdates){const ve=ne.data.subarray(J*q/ne.data.BYTES_PER_ELEMENT,(J+1)*q/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,J,ne.width,ne.height,1,xe,De,ve)}S.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,xe,De,ne.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,Ie,ne.width,ne.height,ne.depth,0,xe,De,ne.data);else if(S.isData3DTexture)Le?(Ye&&t.texStorage3D(r.TEXTURE_3D,oe,Ie,ne.width,ne.height,ne.depth),N&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,xe,De,ne.data)):t.texImage3D(r.TEXTURE_3D,0,Ie,ne.width,ne.height,ne.depth,0,xe,De,ne.data);else if(S.isFramebufferTexture){if(Ye)if(Le)t.texStorage2D(r.TEXTURE_2D,oe,Ie,ne.width,ne.height);else{let q=ne.width,J=ne.height;for(let ve=0;ve<oe;ve++)t.texImage2D(r.TEXTURE_2D,ve,Ie,q,J,0,xe,De,null),q>>=1,J>>=1}}else if(Xe.length>0){if(Le&&Ye){const q=Te(Xe[0]);t.texStorage2D(r.TEXTURE_2D,oe,Ie,q.width,q.height)}for(let q=0,J=Xe.length;q<J;q++)ye=Xe[q],Le?N&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,xe,De,ye):t.texImage2D(r.TEXTURE_2D,q,Ie,xe,De,ye);S.generateMipmaps=!1}else if(Le){if(Ye){const q=Te(ne);t.texStorage2D(r.TEXTURE_2D,oe,Ie,q.width,q.height)}N&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,xe,De,ne)}else t.texImage2D(r.TEXTURE_2D,0,Ie,xe,De,ne);g(S)&&p(Z),Se.__version=Y.version,S.onUpdate&&S.onUpdate(S)}P.__version=S.version}function te(P,S,z){if(S.image.length!==6)return;const Z=Me(P,S),ee=S.source;t.bindTexture(r.TEXTURE_CUBE_MAP,P.__webglTexture,r.TEXTURE0+z);const Y=n.get(ee);if(ee.version!==Y.__version||Z===!0){t.activeTexture(r.TEXTURE0+z);const Se=qe.getPrimaries(qe.workingColorSpace),ce=S.colorSpace===gi?null:qe.getPrimaries(S.colorSpace),pe=S.colorSpace===gi||Se===ce?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,S.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,S.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);const Ge=S.isCompressedTexture||S.image[0].isCompressedTexture,ne=S.image[0]&&S.image[0].isDataTexture,xe=[];for(let J=0;J<6;J++)!Ge&&!ne?xe[J]=v(S.image[J],!0,i.maxCubemapSize):xe[J]=ne?S.image[J].image:S.image[J],xe[J]=$e(S,xe[J]);const De=xe[0],Ie=s.convert(S.format,S.colorSpace),ye=s.convert(S.type),Xe=T(S.internalFormat,Ie,ye,S.colorSpace),Le=S.isVideoTexture!==!0,Ye=Y.__version===void 0||Z===!0,N=ee.dataReady;let oe=D(S,De);se(r.TEXTURE_CUBE_MAP,S);let q;if(Ge){Le&&Ye&&t.texStorage2D(r.TEXTURE_CUBE_MAP,oe,Xe,De.width,De.height);for(let J=0;J<6;J++){q=xe[J].mipmaps;for(let ve=0;ve<q.length;ve++){const me=q[ve];S.format!==qt?Ie!==null?Le?N&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,0,0,me.width,me.height,Ie,me.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,Xe,me.width,me.height,0,me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Le?N&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,0,0,me.width,me.height,Ie,ye,me.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,Xe,me.width,me.height,0,Ie,ye,me.data)}}}else{if(q=S.mipmaps,Le&&Ye){q.length>0&&oe++;const J=Te(xe[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,oe,Xe,J.width,J.height)}for(let J=0;J<6;J++)if(ne){Le?N&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,xe[J].width,xe[J].height,Ie,ye,xe[J].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Xe,xe[J].width,xe[J].height,0,Ie,ye,xe[J].data);for(let ve=0;ve<q.length;ve++){const ze=q[ve].image[J].image;Le?N&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,0,0,ze.width,ze.height,Ie,ye,ze.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,Xe,ze.width,ze.height,0,Ie,ye,ze.data)}}else{Le?N&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Ie,ye,xe[J]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Xe,Ie,ye,xe[J]);for(let ve=0;ve<q.length;ve++){const me=q[ve];Le?N&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,0,0,Ie,ye,me.image[J]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,Xe,Ie,ye,me.image[J])}}}g(S)&&p(r.TEXTURE_CUBE_MAP),Y.__version=ee.version,S.onUpdate&&S.onUpdate(S)}P.__version=S.version}function le(P,S,z,Z,ee,Y){const Se=s.convert(z.format,z.colorSpace),ce=s.convert(z.type),pe=T(z.internalFormat,Se,ce,z.colorSpace),Ge=n.get(S),ne=n.get(z);if(ne.__renderTarget=S,!Ge.__hasExternalTextures){const xe=Math.max(1,S.width>>Y),De=Math.max(1,S.height>>Y);ee===r.TEXTURE_3D||ee===r.TEXTURE_2D_ARRAY?t.texImage3D(ee,Y,pe,xe,De,S.depth,0,Se,ce,null):t.texImage2D(ee,Y,pe,xe,De,0,Se,ce,null)}t.bindFramebuffer(r.FRAMEBUFFER,P),Ne(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Z,ee,ne.__webglTexture,0,Fe(S)):(ee===r.TEXTURE_2D||ee>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,Z,ee,ne.__webglTexture,Y),t.bindFramebuffer(r.FRAMEBUFFER,null)}function ie(P,S,z){if(r.bindRenderbuffer(r.RENDERBUFFER,P),S.depthBuffer){const Z=S.depthTexture,ee=Z&&Z.isDepthTexture?Z.type:null,Y=_(S.stencilBuffer,ee),Se=S.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ce=Fe(S);Ne(S)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ce,Y,S.width,S.height):z?r.renderbufferStorageMultisample(r.RENDERBUFFER,ce,Y,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,Y,S.width,S.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,Se,r.RENDERBUFFER,P)}else{const Z=S.textures;for(let ee=0;ee<Z.length;ee++){const Y=Z[ee],Se=s.convert(Y.format,Y.colorSpace),ce=s.convert(Y.type),pe=T(Y.internalFormat,Se,ce,Y.colorSpace),Ge=Fe(S);z&&Ne(S)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ge,pe,S.width,S.height):Ne(S)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ge,pe,S.width,S.height):r.renderbufferStorage(r.RENDERBUFFER,pe,S.width,S.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function de(P,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,P),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=n.get(S.depthTexture);Z.__renderTarget=S,(!Z.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),V(S.depthTexture,0);const ee=Z.__webglTexture,Y=Fe(S);if(S.depthTexture.format===_s)Ne(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ee,0,Y):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ee,0);else if(S.depthTexture.format===Vi)Ne(S)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ee,0,Y):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function fe(P){const S=n.get(P),z=P.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==P.depthTexture){const Z=P.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),Z){const ee=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,Z.removeEventListener("dispose",ee)};Z.addEventListener("dispose",ee),S.__depthDisposeCallback=ee}S.__boundDepthTexture=Z}if(P.depthTexture&&!S.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");de(S.__webglFramebuffer,P)}else if(z){S.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer[Z]),S.__webglDepthbuffer[Z]===void 0)S.__webglDepthbuffer[Z]=r.createRenderbuffer(),ie(S.__webglDepthbuffer[Z],P,!1);else{const ee=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Y=S.__webglDepthbuffer[Z];r.bindRenderbuffer(r.RENDERBUFFER,Y),r.framebufferRenderbuffer(r.FRAMEBUFFER,ee,r.RENDERBUFFER,Y)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=r.createRenderbuffer(),ie(S.__webglDepthbuffer,P,!1);else{const Z=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ee=S.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ee),r.framebufferRenderbuffer(r.FRAMEBUFFER,Z,r.RENDERBUFFER,ee)}t.bindFramebuffer(r.FRAMEBUFFER,null)}function _e(P,S,z){const Z=n.get(P);S!==void 0&&le(Z.__webglFramebuffer,P,P.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),z!==void 0&&fe(P)}function Je(P){const S=P.texture,z=n.get(P),Z=n.get(S);P.addEventListener("dispose",R);const ee=P.textures,Y=P.isWebGLCubeRenderTarget===!0,Se=ee.length>1;if(Se||(Z.__webglTexture===void 0&&(Z.__webglTexture=r.createTexture()),Z.__version=S.version,a.memory.textures++),Y){z.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(S.mipmaps&&S.mipmaps.length>0){z.__webglFramebuffer[ce]=[];for(let pe=0;pe<S.mipmaps.length;pe++)z.__webglFramebuffer[ce][pe]=r.createFramebuffer()}else z.__webglFramebuffer[ce]=r.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){z.__webglFramebuffer=[];for(let ce=0;ce<S.mipmaps.length;ce++)z.__webglFramebuffer[ce]=r.createFramebuffer()}else z.__webglFramebuffer=r.createFramebuffer();if(Se)for(let ce=0,pe=ee.length;ce<pe;ce++){const Ge=n.get(ee[ce]);Ge.__webglTexture===void 0&&(Ge.__webglTexture=r.createTexture(),a.memory.textures++)}if(P.samples>0&&Ne(P)===!1){z.__webglMultisampledFramebuffer=r.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let ce=0;ce<ee.length;ce++){const pe=ee[ce];z.__webglColorRenderbuffer[ce]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,z.__webglColorRenderbuffer[ce]);const Ge=s.convert(pe.format,pe.colorSpace),ne=s.convert(pe.type),xe=T(pe.internalFormat,Ge,ne,pe.colorSpace,P.isXRRenderTarget===!0),De=Fe(P);r.renderbufferStorageMultisample(r.RENDERBUFFER,De,xe,P.width,P.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ce,r.RENDERBUFFER,z.__webglColorRenderbuffer[ce])}r.bindRenderbuffer(r.RENDERBUFFER,null),P.depthBuffer&&(z.__webglDepthRenderbuffer=r.createRenderbuffer(),ie(z.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(Y){t.bindTexture(r.TEXTURE_CUBE_MAP,Z.__webglTexture),se(r.TEXTURE_CUBE_MAP,S);for(let ce=0;ce<6;ce++)if(S.mipmaps&&S.mipmaps.length>0)for(let pe=0;pe<S.mipmaps.length;pe++)le(z.__webglFramebuffer[ce][pe],P,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ce,pe);else le(z.__webglFramebuffer[ce],P,S,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);g(S)&&p(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Se){for(let ce=0,pe=ee.length;ce<pe;ce++){const Ge=ee[ce],ne=n.get(Ge);t.bindTexture(r.TEXTURE_2D,ne.__webglTexture),se(r.TEXTURE_2D,Ge),le(z.__webglFramebuffer,P,Ge,r.COLOR_ATTACHMENT0+ce,r.TEXTURE_2D,0),g(Ge)&&p(r.TEXTURE_2D)}t.unbindTexture()}else{let ce=r.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(ce=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(ce,Z.__webglTexture),se(ce,S),S.mipmaps&&S.mipmaps.length>0)for(let pe=0;pe<S.mipmaps.length;pe++)le(z.__webglFramebuffer[pe],P,S,r.COLOR_ATTACHMENT0,ce,pe);else le(z.__webglFramebuffer,P,S,r.COLOR_ATTACHMENT0,ce,0);g(S)&&p(ce),t.unbindTexture()}P.depthBuffer&&fe(P)}function Be(P){const S=P.textures;for(let z=0,Z=S.length;z<Z;z++){const ee=S[z];if(g(ee)){const Y=x(P),Se=n.get(ee).__webglTexture;t.bindTexture(Y,Se),p(Y),t.unbindTexture()}}}const Qe=[],U=[];function vt(P){if(P.samples>0){if(Ne(P)===!1){const S=P.textures,z=P.width,Z=P.height;let ee=r.COLOR_BUFFER_BIT;const Y=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Se=n.get(P),ce=S.length>1;if(ce)for(let pe=0;pe<S.length;pe++)t.bindFramebuffer(r.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+pe,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,Se.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+pe,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,Se.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Se.__webglFramebuffer);for(let pe=0;pe<S.length;pe++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(ee|=r.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(ee|=r.STENCIL_BUFFER_BIT)),ce){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,Se.__webglColorRenderbuffer[pe]);const Ge=n.get(S[pe]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Ge,0)}r.blitFramebuffer(0,0,z,Z,0,0,z,Z,ee,r.NEAREST),l===!0&&(Qe.length=0,U.length=0,Qe.push(r.COLOR_ATTACHMENT0+pe),P.depthBuffer&&P.resolveDepthBuffer===!1&&(Qe.push(Y),U.push(Y),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,U)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Qe))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),ce)for(let pe=0;pe<S.length;pe++){t.bindFramebuffer(r.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+pe,r.RENDERBUFFER,Se.__webglColorRenderbuffer[pe]);const Ge=n.get(S[pe]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,Se.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+pe,r.TEXTURE_2D,Ge,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Se.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&l){const S=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[S])}}}function Fe(P){return Math.min(i.maxSamples,P.samples)}function Ne(P){const S=n.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Ae(P){const S=a.render.frame;h.get(P)!==S&&(h.set(P,S),P.update())}function $e(P,S){const z=P.colorSpace,Z=P.format,ee=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||z!==Ht&&z!==gi&&(qe.getTransfer(z)===st?(Z!==qt||ee!==Un)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),S}function Te(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=I,this.resetTextureUnits=L,this.setTexture2D=V,this.setTexture2DArray=B,this.setTexture3D=$,this.setTextureCube=G,this.rebindTextures=_e,this.setupRenderTarget=Je,this.updateRenderTargetMipmap=Be,this.updateMultisampleRenderTarget=vt,this.setupDepthRenderbuffer=fe,this.setupFrameBufferTexture=le,this.useMultisampledRTT=Ne}function m_(r,e){function t(n,i=gi){let s;const a=qe.getTransfer(i);if(n===Un)return r.UNSIGNED_BYTE;if(n===$l)return r.UNSIGNED_SHORT_4_4_4_4;if(n===Yl)return r.UNSIGNED_SHORT_5_5_5_1;if(n===Ou)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===ku)return r.BYTE;if(n===Fu)return r.SHORT;if(n===pr)return r.UNSIGNED_SHORT;if(n===jl)return r.INT;if(n===zi)return r.UNSIGNED_INT;if(n===Zt)return r.FLOAT;if(n===Bt)return r.HALF_FLOAT;if(n===Bu)return r.ALPHA;if(n===zu)return r.RGB;if(n===qt)return r.RGBA;if(n===Hu)return r.LUMINANCE;if(n===Vu)return r.LUMINANCE_ALPHA;if(n===_s)return r.DEPTH_COMPONENT;if(n===Vi)return r.DEPTH_STENCIL;if(n===Kl)return r.RED;if(n===Zl)return r.RED_INTEGER;if(n===Gu)return r.RG;if(n===Jl)return r.RG_INTEGER;if(n===Ql)return r.RGBA_INTEGER;if(n===pa||n===ma||n===ga||n===va)if(a===st)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===pa)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ma)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ga)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===va)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===pa)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ma)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ga)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===va)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===tl||n===nl||n===il||n===sl)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===tl)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===nl)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===il)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===sl)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===rl||n===al||n===ol)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===rl||n===al)return a===st?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===ol)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ll||n===cl||n===hl||n===ul||n===dl||n===fl||n===pl||n===ml||n===gl||n===vl||n===_l||n===xl||n===yl||n===Ml)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===ll)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===cl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===hl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ul)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===dl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===fl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===pl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ml)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===gl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===vl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===_l)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===xl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===yl)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ml)return a===st?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===_a||n===Tl||n===Sl)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===_a)return a===st?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Tl)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Sl)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Wu||n===bl||n===wl||n===El)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===_a)return s.COMPRESSED_RED_RGTC1_EXT;if(n===bl)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===wl)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===El)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Hi?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}class g_ extends Xt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class It extends ct{constructor(){super(),this.isGroup=!0,this.type="Group"}}const v_={type:"move"};class To{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new It,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new It,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new It,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const g=t.getJointPose(v,n),p=this._getHandJoint(c,v);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(v_)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new It;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const __=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,x_=`
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

}`;class y_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new Tt,s=e.properties.get(i);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new pt({vertexShader:__,fragmentShader:x_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Oe(new Mn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class M_ extends Wi{constructor(e,t){super();const n=this;let i=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null;const v=new y_,g=t.getContextAttributes();let p=null,x=null;const T=[],_=[],D=new ae;let E=null;const R=new Xt;R.viewport=new Ze;const w=new Xt;w.viewport=new Ze;const M=[R,w],y=new g_;let C=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let te=T[j];return te===void 0&&(te=new To,T[j]=te),te.getTargetRaySpace()},this.getControllerGrip=function(j){let te=T[j];return te===void 0&&(te=new To,T[j]=te),te.getGripSpace()},this.getHand=function(j){let te=T[j];return te===void 0&&(te=new To,T[j]=te),te.getHandSpace()};function I(j){const te=_.indexOf(j.inputSource);if(te===-1)return;const le=T[te];le!==void 0&&(le.update(j.inputSource,j.frame,c||a),le.dispatchEvent({type:j.type,data:j.inputSource}))}function O(){i.removeEventListener("select",I),i.removeEventListener("selectstart",I),i.removeEventListener("selectend",I),i.removeEventListener("squeeze",I),i.removeEventListener("squeezestart",I),i.removeEventListener("squeezeend",I),i.removeEventListener("end",O),i.removeEventListener("inputsourceschange",V);for(let j=0;j<T.length;j++){const te=_[j];te!==null&&(_[j]=null,T[j].disconnect(te))}C=null,L=null,v.reset(),e.setRenderTarget(p),f=null,d=null,u=null,i=null,x=null,Me.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(D.width,D.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(j){if(i=j,i!==null){if(p=e.getRenderTarget(),i.addEventListener("select",I),i.addEventListener("selectstart",I),i.addEventListener("selectend",I),i.addEventListener("squeeze",I),i.addEventListener("squeezestart",I),i.addEventListener("squeezeend",I),i.addEventListener("end",O),i.addEventListener("inputsourceschange",V),g.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(D),i.renderState.layers===void 0){const te={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(i,t,te),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new Qt(f.framebufferWidth,f.framebufferHeight,{format:qt,type:Un,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let te=null,le=null,ie=null;g.depth&&(ie=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=g.stencil?Vi:_s,le=g.stencil?Hi:zi);const de={colorFormat:t.RGBA8,depthFormat:ie,scaleFactor:s};u=new XRWebGLBinding(i,t),d=u.createProjectionLayer(de),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),x=new Qt(d.textureWidth,d.textureHeight,{format:qt,type:Un,depthTexture:new rc(d.textureWidth,d.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),Me.setContext(i),Me.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function V(j){for(let te=0;te<j.removed.length;te++){const le=j.removed[te],ie=_.indexOf(le);ie>=0&&(_[ie]=null,T[ie].disconnect(le))}for(let te=0;te<j.added.length;te++){const le=j.added[te];let ie=_.indexOf(le);if(ie===-1){for(let fe=0;fe<T.length;fe++)if(fe>=_.length){_.push(le),ie=fe;break}else if(_[fe]===null){_[fe]=le,ie=fe;break}if(ie===-1)break}const de=T[ie];de&&de.connect(le)}}const B=new A,$=new A;function G(j,te,le){B.setFromMatrixPosition(te.matrixWorld),$.setFromMatrixPosition(le.matrixWorld);const ie=B.distanceTo($),de=te.projectionMatrix.elements,fe=le.projectionMatrix.elements,_e=de[14]/(de[10]-1),Je=de[14]/(de[10]+1),Be=(de[9]+1)/de[5],Qe=(de[9]-1)/de[5],U=(de[8]-1)/de[0],vt=(fe[8]+1)/fe[0],Fe=_e*U,Ne=_e*vt,Ae=ie/(-U+vt),$e=Ae*-U;if(te.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX($e),j.translateZ(Ae),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),de[10]===-1)j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{const Te=_e+Ae,P=Je+Ae,S=Fe-$e,z=Ne+(ie-$e),Z=Be*Je/P*Te,ee=Qe*Je/P*Te;j.projectionMatrix.makePerspective(S,z,Z,ee,Te,P),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function H(j,te){te===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(te.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(i===null)return;let te=j.near,le=j.far;v.texture!==null&&(v.depthNear>0&&(te=v.depthNear),v.depthFar>0&&(le=v.depthFar)),y.near=w.near=R.near=te,y.far=w.far=R.far=le,(C!==y.near||L!==y.far)&&(i.updateRenderState({depthNear:y.near,depthFar:y.far}),C=y.near,L=y.far),R.layers.mask=j.layers.mask|2,w.layers.mask=j.layers.mask|4,y.layers.mask=R.layers.mask|w.layers.mask;const ie=j.parent,de=y.cameras;H(y,ie);for(let fe=0;fe<de.length;fe++)H(de[fe],ie);de.length===2?G(y,R,w):y.projectionMatrix.copy(R.projectionMatrix),K(j,y,ie)};function K(j,te,le){le===null?j.matrix.copy(te.matrixWorld):(j.matrix.copy(le.matrixWorld),j.matrix.invert(),j.matrix.multiply(te.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Es*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(j){l=j,d!==null&&(d.fixedFoveation=j),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=j)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(y)};let Q=null;function se(j,te){if(h=te.getViewerPose(c||a),m=te,h!==null){const le=h.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let ie=!1;le.length!==y.cameras.length&&(y.cameras.length=0,ie=!0);for(let fe=0;fe<le.length;fe++){const _e=le[fe];let Je=null;if(f!==null)Je=f.getViewport(_e);else{const Qe=u.getViewSubImage(d,_e);Je=Qe.viewport,fe===0&&(e.setRenderTargetTextures(x,Qe.colorTexture,d.ignoreDepthValues?void 0:Qe.depthStencilTexture),e.setRenderTarget(x))}let Be=M[fe];Be===void 0&&(Be=new Xt,Be.layers.enable(fe),Be.viewport=new Ze,M[fe]=Be),Be.matrix.fromArray(_e.transform.matrix),Be.matrix.decompose(Be.position,Be.quaternion,Be.scale),Be.projectionMatrix.fromArray(_e.projectionMatrix),Be.projectionMatrixInverse.copy(Be.projectionMatrix).invert(),Be.viewport.set(Je.x,Je.y,Je.width,Je.height),fe===0&&(y.matrix.copy(Be.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ie===!0&&y.cameras.push(Be)}const de=i.enabledFeatures;if(de&&de.includes("depth-sensing")){const fe=u.getDepthInformation(le[0]);fe&&fe.isValid&&fe.texture&&v.init(e,fe,i.renderState)}}for(let le=0;le<T.length;le++){const ie=_[le],de=T[le];ie!==null&&de!==void 0&&de.update(ie,te,c||a)}Q&&Q(j,te),te.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:te}),m=null}const Me=new rd;Me.setAnimationLoop(se),this.setAnimationLoop=function(j){Q=j},this.dispose=function(){}}}const Ci=new kn,T_=new Pe;function S_(r,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,nd(r)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function i(g,p,x,T,_){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(g,p):p.isMeshToonMaterial?(s(g,p),u(g,p)):p.isMeshPhongMaterial?(s(g,p),h(g,p)):p.isMeshStandardMaterial?(s(g,p),d(g,p),p.isMeshPhysicalMaterial&&f(g,p,_)):p.isMeshMatcapMaterial?(s(g,p),m(g,p)):p.isMeshDepthMaterial?s(g,p):p.isMeshDistanceMaterial?(s(g,p),v(g,p)):p.isMeshNormalMaterial?s(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,x,T):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===zt&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===zt&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);const x=e.get(p),T=x.envMap,_=x.envMapRotation;T&&(g.envMap.value=T,Ci.copy(_),Ci.x*=-1,Ci.y*=-1,Ci.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Ci.y*=-1,Ci.z*=-1),g.envMapRotation.value.setFromMatrix4(T_.makeRotationFromEuler(Ci)),g.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,x,T){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*x,g.scale.value=T*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,x){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===zt&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=x.texture,g.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function v(g,p){const x=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(x.matrixWorld),g.nearDistance.value=x.shadow.camera.near,g.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function b_(r,e,t,n){let i={},s={},a=[];const o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,T){const _=T.program;n.uniformBlockBinding(x,_)}function c(x,T){let _=i[x.id];_===void 0&&(m(x),_=h(x),i[x.id]=_,x.addEventListener("dispose",g));const D=T.program;n.updateUBOMapping(x,D);const E=e.render.frame;s[x.id]!==E&&(d(x),s[x.id]=E)}function h(x){const T=u();x.__bindingPointIndex=T;const _=r.createBuffer(),D=x.__size,E=x.usage;return r.bindBuffer(r.UNIFORM_BUFFER,_),r.bufferData(r.UNIFORM_BUFFER,D,E),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,T,_),_}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){const T=i[x.id],_=x.uniforms,D=x.__cache;r.bindBuffer(r.UNIFORM_BUFFER,T);for(let E=0,R=_.length;E<R;E++){const w=Array.isArray(_[E])?_[E]:[_[E]];for(let M=0,y=w.length;M<y;M++){const C=w[M];if(f(C,E,M,D)===!0){const L=C.__offset,I=Array.isArray(C.value)?C.value:[C.value];let O=0;for(let V=0;V<I.length;V++){const B=I[V],$=v(B);typeof B=="number"||typeof B=="boolean"?(C.__data[0]=B,r.bufferSubData(r.UNIFORM_BUFFER,L+O,C.__data)):B.isMatrix3?(C.__data[0]=B.elements[0],C.__data[1]=B.elements[1],C.__data[2]=B.elements[2],C.__data[3]=0,C.__data[4]=B.elements[3],C.__data[5]=B.elements[4],C.__data[6]=B.elements[5],C.__data[7]=0,C.__data[8]=B.elements[6],C.__data[9]=B.elements[7],C.__data[10]=B.elements[8],C.__data[11]=0):(B.toArray(C.__data,O),O+=$.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,L,C.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(x,T,_,D){const E=x.value,R=T+"_"+_;if(D[R]===void 0)return typeof E=="number"||typeof E=="boolean"?D[R]=E:D[R]=E.clone(),!0;{const w=D[R];if(typeof E=="number"||typeof E=="boolean"){if(w!==E)return D[R]=E,!0}else if(w.equals(E)===!1)return w.copy(E),!0}return!1}function m(x){const T=x.uniforms;let _=0;const D=16;for(let R=0,w=T.length;R<w;R++){const M=Array.isArray(T[R])?T[R]:[T[R]];for(let y=0,C=M.length;y<C;y++){const L=M[y],I=Array.isArray(L.value)?L.value:[L.value];for(let O=0,V=I.length;O<V;O++){const B=I[O],$=v(B),G=_%D,H=G%$.boundary,K=G+H;_+=H,K!==0&&D-K<$.storage&&(_+=D-K),L.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=_,_+=$.storage}}}const E=_%D;return E>0&&(_+=D-E),x.__size=_,x.__cache={},this}function v(x){const T={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(T.boundary=4,T.storage=4):x.isVector2?(T.boundary=8,T.storage=8):x.isVector3||x.isColor?(T.boundary=16,T.storage=12):x.isVector4?(T.boundary=16,T.storage=16):x.isMatrix3?(T.boundary=48,T.storage=48):x.isMatrix4?(T.boundary=64,T.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),T}function g(x){const T=x.target;T.removeEventListener("dispose",g);const _=a.indexOf(T.__bindingPointIndex);a.splice(_,1),r.deleteBuffer(i[T.id]),delete i[T.id],delete s[T.id]}function p(){for(const x in i)r.deleteBuffer(i[x]);a=[],i={},s={}}return{bind:l,update:c,dispose:p}}class w_{constructor(e={}){const{canvas:t=up(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;const m=new Uint32Array(4),v=new Int32Array(4);let g=null,p=null;const x=[],T=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=dt,this.toneMapping=xi,this.toneMappingExposure=1;const _=this;let D=!1,E=0,R=0,w=null,M=-1,y=null;const C=new Ze,L=new Ze;let I=null;const O=new ue(0);let V=0,B=t.width,$=t.height,G=1,H=null,K=null;const Q=new Ze(0,0,B,$),se=new Ze(0,0,B,$);let Me=!1;const j=new ic;let te=!1,le=!1;const ie=new Pe,de=new Pe,fe=new A,_e=new Ze,Je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Be=!1;function Qe(){return w===null?G:1}let U=n;function vt(b,k){return t.getContext(b,k)}try{const b={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Xl}`),t.addEventListener("webglcontextlost",J,!1),t.addEventListener("webglcontextrestored",ve,!1),t.addEventListener("webglcontextcreationerror",me,!1),U===null){const k="webgl2";if(U=vt(k,b),U===null)throw vt(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Fe,Ne,Ae,$e,Te,P,S,z,Z,ee,Y,Se,ce,pe,Ge,ne,xe,De,Ie,ye,Xe,Le,Ye,N;function oe(){Fe=new P0(U),Fe.init(),Le=new m_(U,Fe),Ne=new b0(U,Fe,e,Le),Ae=new d_(U,Fe),Ne.reverseDepthBuffer&&d&&Ae.buffers.depth.setReversed(!0),$e=new L0(U),Te=new Zv,P=new p_(U,Fe,Ae,Te,Ne,Le,$e),S=new E0(_),z=new C0(_),Z=new zp(U),Ye=new T0(U,Z),ee=new D0(U,Z,$e,Ye),Y=new U0(U,ee,Z,$e),Ie=new N0(U,Ne,P),ne=new w0(Te),Se=new Kv(_,S,z,Fe,Ne,Ye,ne),ce=new S_(_,Te),pe=new Qv,Ge=new r_(Fe),De=new M0(_,S,z,Ae,Y,f,l),xe=new h_(_,Y,Ne),N=new b_(U,$e,Ne,Ae),ye=new S0(U,Fe,$e),Xe=new I0(U,Fe,$e),$e.programs=Se.programs,_.capabilities=Ne,_.extensions=Fe,_.properties=Te,_.renderLists=pe,_.shadowMap=xe,_.state=Ae,_.info=$e}oe();const q=new M_(_,U);this.xr=q,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const b=Fe.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Fe.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(b){b!==void 0&&(G=b,this.setSize(B,$,!1))},this.getSize=function(b){return b.set(B,$)},this.setSize=function(b,k,W=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}B=b,$=k,t.width=Math.floor(b*G),t.height=Math.floor(k*G),W===!0&&(t.style.width=b+"px",t.style.height=k+"px"),this.setViewport(0,0,b,k)},this.getDrawingBufferSize=function(b){return b.set(B*G,$*G).floor()},this.setDrawingBufferSize=function(b,k,W){B=b,$=k,G=W,t.width=Math.floor(b*W),t.height=Math.floor(k*W),this.setViewport(0,0,b,k)},this.getCurrentViewport=function(b){return b.copy(C)},this.getViewport=function(b){return b.copy(Q)},this.setViewport=function(b,k,W,X){b.isVector4?Q.set(b.x,b.y,b.z,b.w):Q.set(b,k,W,X),Ae.viewport(C.copy(Q).multiplyScalar(G).round())},this.getScissor=function(b){return b.copy(se)},this.setScissor=function(b,k,W,X){b.isVector4?se.set(b.x,b.y,b.z,b.w):se.set(b,k,W,X),Ae.scissor(L.copy(se).multiplyScalar(G).round())},this.getScissorTest=function(){return Me},this.setScissorTest=function(b){Ae.setScissorTest(Me=b)},this.setOpaqueSort=function(b){H=b},this.setTransparentSort=function(b){K=b},this.getClearColor=function(b){return b.copy(De.getClearColor())},this.setClearColor=function(){De.setClearColor.apply(De,arguments)},this.getClearAlpha=function(){return De.getClearAlpha()},this.setClearAlpha=function(){De.setClearAlpha.apply(De,arguments)},this.clear=function(b=!0,k=!0,W=!0){let X=0;if(b){let F=!1;if(w!==null){const re=w.texture.format;F=re===Ql||re===Jl||re===Zl}if(F){const re=w.texture.type,ge=re===Un||re===zi||re===pr||re===Hi||re===$l||re===Yl,be=De.getClearColor(),we=De.getClearAlpha(),Ue=be.r,He=be.g,Ee=be.b;ge?(m[0]=Ue,m[1]=He,m[2]=Ee,m[3]=we,U.clearBufferuiv(U.COLOR,0,m)):(v[0]=Ue,v[1]=He,v[2]=Ee,v[3]=we,U.clearBufferiv(U.COLOR,0,v))}else X|=U.COLOR_BUFFER_BIT}k&&(X|=U.DEPTH_BUFFER_BIT),W&&(X|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",J,!1),t.removeEventListener("webglcontextrestored",ve,!1),t.removeEventListener("webglcontextcreationerror",me,!1),pe.dispose(),Ge.dispose(),Te.dispose(),S.dispose(),z.dispose(),Y.dispose(),Ye.dispose(),N.dispose(),Se.dispose(),q.dispose(),q.removeEventListener("sessionstart",Mc),q.removeEventListener("sessionend",Tc),Mi.stop()};function J(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function ve(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const b=$e.autoReset,k=xe.enabled,W=xe.autoUpdate,X=xe.needsUpdate,F=xe.type;oe(),$e.autoReset=b,xe.enabled=k,xe.autoUpdate=W,xe.needsUpdate=X,xe.type=F}function me(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function ze(b){const k=b.target;k.removeEventListener("dispose",ze),mt(k)}function mt(b){Nt(b),Te.remove(b)}function Nt(b){const k=Te.get(b).programs;k!==void 0&&(k.forEach(function(W){Se.releaseProgram(W)}),b.isShaderMaterial&&Se.releaseShaderCache(b))}this.renderBufferDirect=function(b,k,W,X,F,re){k===null&&(k=Je);const ge=F.isMesh&&F.matrixWorld.determinant()<0,be=Id(b,k,W,X,F);Ae.setMaterial(X,ge);let we=W.index,Ue=1;if(X.wireframe===!0){if(we=ee.getWireframeAttribute(W),we===void 0)return;Ue=2}const He=W.drawRange,Ee=W.attributes.position;let Ke=He.start*Ue,ot=(He.start+He.count)*Ue;re!==null&&(Ke=Math.max(Ke,re.start*Ue),ot=Math.min(ot,(re.start+re.count)*Ue)),we!==null?(Ke=Math.max(Ke,0),ot=Math.min(ot,we.count)):Ee!=null&&(Ke=Math.max(Ke,0),ot=Math.min(ot,Ee.count));const ht=ot-Ke;if(ht<0||ht===1/0)return;Ye.setup(F,X,be,W,we);let $t,et=ye;if(we!==null&&($t=Z.get(we),et=Xe,et.setIndex($t)),F.isMesh)X.wireframe===!0?(Ae.setLineWidth(X.wireframeLinewidth*Qe()),et.setMode(U.LINES)):et.setMode(U.TRIANGLES);else if(F.isLine){let Re=X.linewidth;Re===void 0&&(Re=1),Ae.setLineWidth(Re*Qe()),F.isLineSegments?et.setMode(U.LINES):F.isLineLoop?et.setMode(U.LINE_LOOP):et.setMode(U.LINE_STRIP)}else F.isPoints?et.setMode(U.POINTS):F.isSprite&&et.setMode(U.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)et.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Fe.get("WEBGL_multi_draw"))et.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Re=F._multiDrawStarts,Hn=F._multiDrawCounts,tt=F._multiDrawCount,fn=we?Z.get(we).bytesPerElement:1,$i=Te.get(X).currentProgram.getUniforms();for(let en=0;en<tt;en++)$i.setValue(U,"_gl_DrawID",en),et.render(Re[en]/fn,Hn[en])}else if(F.isInstancedMesh)et.renderInstances(Ke,ht,F.count);else if(W.isInstancedBufferGeometry){const Re=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Hn=Math.min(W.instanceCount,Re);et.renderInstances(Ke,ht,Hn)}else et.render(Ke,ht)};function it(b,k,W){b.transparent===!0&&b.side===xt&&b.forceSinglePass===!1?(b.side=zt,b.needsUpdate=!0,Tr(b,k,W),b.side=ni,b.needsUpdate=!0,Tr(b,k,W),b.side=xt):Tr(b,k,W)}this.compile=function(b,k,W=null){W===null&&(W=b),p=Ge.get(W),p.init(k),T.push(p),W.traverseVisible(function(F){F.isLight&&F.layers.test(k.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),b!==W&&b.traverseVisible(function(F){F.isLight&&F.layers.test(k.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),p.setupLights();const X=new Set;return b.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const re=F.material;if(re)if(Array.isArray(re))for(let ge=0;ge<re.length;ge++){const be=re[ge];it(be,W,F),X.add(be)}else it(re,W,F),X.add(re)}),T.pop(),p=null,X},this.compileAsync=function(b,k,W=null){const X=this.compile(b,k,W);return new Promise(F=>{function re(){if(X.forEach(function(ge){Te.get(ge).currentProgram.isReady()&&X.delete(ge)}),X.size===0){F(b);return}setTimeout(re,10)}Fe.get("KHR_parallel_shader_compile")!==null?re():setTimeout(re,10)})};let dn=null;function zn(b){dn&&dn(b)}function Mc(){Mi.stop()}function Tc(){Mi.start()}const Mi=new rd;Mi.setAnimationLoop(zn),typeof self<"u"&&Mi.setContext(self),this.setAnimationLoop=function(b){dn=b,q.setAnimationLoop(b),b===null?Mi.stop():Mi.start()},q.addEventListener("sessionstart",Mc),q.addEventListener("sessionend",Tc),this.render=function(b,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(k),k=q.getCamera()),b.isScene===!0&&b.onBeforeRender(_,b,k,w),p=Ge.get(b,T.length),p.init(k),T.push(p),de.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),j.setFromProjectionMatrix(de),le=this.localClippingEnabled,te=ne.init(this.clippingPlanes,le),g=pe.get(b,x.length),g.init(),x.push(g),q.enabled===!0&&q.isPresenting===!0){const re=_.xr.getDepthSensingMesh();re!==null&&Wa(re,k,-1/0,_.sortObjects)}Wa(b,k,0,_.sortObjects),g.finish(),_.sortObjects===!0&&g.sort(H,K),Be=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,Be&&De.addToRenderList(g,b),this.info.render.frame++,te===!0&&ne.beginShadows();const W=p.state.shadowsArray;xe.render(W,b,k),te===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();const X=g.opaque,F=g.transmissive;if(p.setupLights(),k.isArrayCamera){const re=k.cameras;if(F.length>0)for(let ge=0,be=re.length;ge<be;ge++){const we=re[ge];bc(X,F,b,we)}Be&&De.render(b);for(let ge=0,be=re.length;ge<be;ge++){const we=re[ge];Sc(g,b,we,we.viewport)}}else F.length>0&&bc(X,F,b,k),Be&&De.render(b),Sc(g,b,k);w!==null&&(P.updateMultisampleRenderTarget(w),P.updateRenderTargetMipmap(w)),b.isScene===!0&&b.onAfterRender(_,b,k),Ye.resetDefaultState(),M=-1,y=null,T.pop(),T.length>0?(p=T[T.length-1],te===!0&&ne.setGlobalState(_.clippingPlanes,p.state.camera)):p=null,x.pop(),x.length>0?g=x[x.length-1]:g=null};function Wa(b,k,W,X){if(b.visible===!1)return;if(b.layers.test(k.layers)){if(b.isGroup)W=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(k);else if(b.isLight)p.pushLight(b),b.castShadow&&p.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||j.intersectsSprite(b)){X&&_e.setFromMatrixPosition(b.matrixWorld).applyMatrix4(de);const ge=Y.update(b),be=b.material;be.visible&&g.push(b,ge,be,W,_e.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||j.intersectsObject(b))){const ge=Y.update(b),be=b.material;if(X&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),_e.copy(b.boundingSphere.center)):(ge.boundingSphere===null&&ge.computeBoundingSphere(),_e.copy(ge.boundingSphere.center)),_e.applyMatrix4(b.matrixWorld).applyMatrix4(de)),Array.isArray(be)){const we=ge.groups;for(let Ue=0,He=we.length;Ue<He;Ue++){const Ee=we[Ue],Ke=be[Ee.materialIndex];Ke&&Ke.visible&&g.push(b,ge,Ke,W,_e.z,Ee)}}else be.visible&&g.push(b,ge,be,W,_e.z,null)}}const re=b.children;for(let ge=0,be=re.length;ge<be;ge++)Wa(re[ge],k,W,X)}function Sc(b,k,W,X){const F=b.opaque,re=b.transmissive,ge=b.transparent;p.setupLightsView(W),te===!0&&ne.setGlobalState(_.clippingPlanes,W),X&&Ae.viewport(C.copy(X)),F.length>0&&Mr(F,k,W),re.length>0&&Mr(re,k,W),ge.length>0&&Mr(ge,k,W),Ae.buffers.depth.setTest(!0),Ae.buffers.depth.setMask(!0),Ae.buffers.color.setMask(!0),Ae.setPolygonOffset(!1)}function bc(b,k,W,X){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[X.id]===void 0&&(p.state.transmissionRenderTarget[X.id]=new Qt(1,1,{generateMipmaps:!0,type:Fe.has("EXT_color_buffer_half_float")||Fe.has("EXT_color_buffer_float")?Bt:Un,minFilter:Tn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qe.workingColorSpace}));const re=p.state.transmissionRenderTarget[X.id],ge=X.viewport||C;re.setSize(ge.z,ge.w);const be=_.getRenderTarget();_.setRenderTarget(re),_.getClearColor(O),V=_.getClearAlpha(),V<1&&_.setClearColor(16777215,.5),_.clear(),Be&&De.render(W);const we=_.toneMapping;_.toneMapping=xi;const Ue=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),p.setupLightsView(X),te===!0&&ne.setGlobalState(_.clippingPlanes,X),Mr(b,W,X),P.updateMultisampleRenderTarget(re),P.updateRenderTargetMipmap(re),Fe.has("WEBGL_multisampled_render_to_texture")===!1){let He=!1;for(let Ee=0,Ke=k.length;Ee<Ke;Ee++){const ot=k[Ee],ht=ot.object,$t=ot.geometry,et=ot.material,Re=ot.group;if(et.side===xt&&ht.layers.test(X.layers)){const Hn=et.side;et.side=zt,et.needsUpdate=!0,wc(ht,W,X,$t,et,Re),et.side=Hn,et.needsUpdate=!0,He=!0}}He===!0&&(P.updateMultisampleRenderTarget(re),P.updateRenderTargetMipmap(re))}_.setRenderTarget(be),_.setClearColor(O,V),Ue!==void 0&&(X.viewport=Ue),_.toneMapping=we}function Mr(b,k,W){const X=k.isScene===!0?k.overrideMaterial:null;for(let F=0,re=b.length;F<re;F++){const ge=b[F],be=ge.object,we=ge.geometry,Ue=X===null?ge.material:X,He=ge.group;be.layers.test(W.layers)&&wc(be,k,W,we,Ue,He)}}function wc(b,k,W,X,F,re){b.onBeforeRender(_,k,W,X,F,re),b.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),F.onBeforeRender(_,k,W,X,b,re),F.transparent===!0&&F.side===xt&&F.forceSinglePass===!1?(F.side=zt,F.needsUpdate=!0,_.renderBufferDirect(W,k,X,F,b,re),F.side=ni,F.needsUpdate=!0,_.renderBufferDirect(W,k,X,F,b,re),F.side=xt):_.renderBufferDirect(W,k,X,F,b,re),b.onAfterRender(_,k,W,X,F,re)}function Tr(b,k,W){k.isScene!==!0&&(k=Je);const X=Te.get(b),F=p.state.lights,re=p.state.shadowsArray,ge=F.state.version,be=Se.getParameters(b,F.state,re,k,W),we=Se.getProgramCacheKey(be);let Ue=X.programs;X.environment=b.isMeshStandardMaterial?k.environment:null,X.fog=k.fog,X.envMap=(b.isMeshStandardMaterial?z:S).get(b.envMap||X.environment),X.envMapRotation=X.environment!==null&&b.envMap===null?k.environmentRotation:b.envMapRotation,Ue===void 0&&(b.addEventListener("dispose",ze),Ue=new Map,X.programs=Ue);let He=Ue.get(we);if(He!==void 0){if(X.currentProgram===He&&X.lightsStateVersion===ge)return Ac(b,be),He}else be.uniforms=Se.getUniforms(b),b.onBeforeCompile(be,_),He=Se.acquireProgram(be,we),Ue.set(we,He),X.uniforms=be.uniforms;const Ee=X.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Ee.clippingPlanes=ne.uniform),Ac(b,be),X.needsLights=Nd(b),X.lightsStateVersion=ge,X.needsLights&&(Ee.ambientLightColor.value=F.state.ambient,Ee.lightProbe.value=F.state.probe,Ee.directionalLights.value=F.state.directional,Ee.directionalLightShadows.value=F.state.directionalShadow,Ee.spotLights.value=F.state.spot,Ee.spotLightShadows.value=F.state.spotShadow,Ee.rectAreaLights.value=F.state.rectArea,Ee.ltc_1.value=F.state.rectAreaLTC1,Ee.ltc_2.value=F.state.rectAreaLTC2,Ee.pointLights.value=F.state.point,Ee.pointLightShadows.value=F.state.pointShadow,Ee.hemisphereLights.value=F.state.hemi,Ee.directionalShadowMap.value=F.state.directionalShadowMap,Ee.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ee.spotShadowMap.value=F.state.spotShadowMap,Ee.spotLightMatrix.value=F.state.spotLightMatrix,Ee.spotLightMap.value=F.state.spotLightMap,Ee.pointShadowMap.value=F.state.pointShadowMap,Ee.pointShadowMatrix.value=F.state.pointShadowMatrix),X.currentProgram=He,X.uniformsList=null,He}function Ec(b){if(b.uniformsList===null){const k=b.currentProgram.getUniforms();b.uniformsList=xa.seqWithValue(k.seq,b.uniforms)}return b.uniformsList}function Ac(b,k){const W=Te.get(b);W.outputColorSpace=k.outputColorSpace,W.batching=k.batching,W.batchingColor=k.batchingColor,W.instancing=k.instancing,W.instancingColor=k.instancingColor,W.instancingMorph=k.instancingMorph,W.skinning=k.skinning,W.morphTargets=k.morphTargets,W.morphNormals=k.morphNormals,W.morphColors=k.morphColors,W.morphTargetsCount=k.morphTargetsCount,W.numClippingPlanes=k.numClippingPlanes,W.numIntersection=k.numClipIntersection,W.vertexAlphas=k.vertexAlphas,W.vertexTangents=k.vertexTangents,W.toneMapping=k.toneMapping}function Id(b,k,W,X,F){k.isScene!==!0&&(k=Je),P.resetTextureUnits();const re=k.fog,ge=X.isMeshStandardMaterial?k.environment:null,be=w===null?_.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Ht,we=(X.isMeshStandardMaterial?z:S).get(X.envMap||ge),Ue=X.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,He=!!W.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),Ee=!!W.morphAttributes.position,Ke=!!W.morphAttributes.normal,ot=!!W.morphAttributes.color;let ht=xi;X.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(ht=_.toneMapping);const $t=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,et=$t!==void 0?$t.length:0,Re=Te.get(X),Hn=p.state.lights;if(te===!0&&(le===!0||b!==y)){const rn=b===y&&X.id===M;ne.setState(X,b,rn)}let tt=!1;X.version===Re.__version?(Re.needsLights&&Re.lightsStateVersion!==Hn.state.version||Re.outputColorSpace!==be||F.isBatchedMesh&&Re.batching===!1||!F.isBatchedMesh&&Re.batching===!0||F.isBatchedMesh&&Re.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Re.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Re.instancing===!1||!F.isInstancedMesh&&Re.instancing===!0||F.isSkinnedMesh&&Re.skinning===!1||!F.isSkinnedMesh&&Re.skinning===!0||F.isInstancedMesh&&Re.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Re.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Re.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Re.instancingMorph===!1&&F.morphTexture!==null||Re.envMap!==we||X.fog===!0&&Re.fog!==re||Re.numClippingPlanes!==void 0&&(Re.numClippingPlanes!==ne.numPlanes||Re.numIntersection!==ne.numIntersection)||Re.vertexAlphas!==Ue||Re.vertexTangents!==He||Re.morphTargets!==Ee||Re.morphNormals!==Ke||Re.morphColors!==ot||Re.toneMapping!==ht||Re.morphTargetsCount!==et)&&(tt=!0):(tt=!0,Re.__version=X.version);let fn=Re.currentProgram;tt===!0&&(fn=Tr(X,k,F));let $i=!1,en=!1,ks=!1;const ut=fn.getUniforms(),En=Re.uniforms;if(Ae.useProgram(fn.program)&&($i=!0,en=!0,ks=!0),X.id!==M&&(M=X.id,en=!0),$i||y!==b){Ae.buffers.depth.getReversed()?(ie.copy(b.projectionMatrix),fp(ie),pp(ie),ut.setValue(U,"projectionMatrix",ie)):ut.setValue(U,"projectionMatrix",b.projectionMatrix),ut.setValue(U,"viewMatrix",b.matrixWorldInverse);const si=ut.map.cameraPosition;si!==void 0&&si.setValue(U,fe.setFromMatrixPosition(b.matrixWorld)),Ne.logarithmicDepthBuffer&&ut.setValue(U,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&ut.setValue(U,"isOrthographic",b.isOrthographicCamera===!0),y!==b&&(y=b,en=!0,ks=!0)}if(F.isSkinnedMesh){ut.setOptional(U,F,"bindMatrix"),ut.setOptional(U,F,"bindMatrixInverse");const rn=F.skeleton;rn&&(rn.boneTexture===null&&rn.computeBoneTexture(),ut.setValue(U,"boneTexture",rn.boneTexture,P))}F.isBatchedMesh&&(ut.setOptional(U,F,"batchingTexture"),ut.setValue(U,"batchingTexture",F._matricesTexture,P),ut.setOptional(U,F,"batchingIdTexture"),ut.setValue(U,"batchingIdTexture",F._indirectTexture,P),ut.setOptional(U,F,"batchingColorTexture"),F._colorsTexture!==null&&ut.setValue(U,"batchingColorTexture",F._colorsTexture,P));const Fs=W.morphAttributes;if((Fs.position!==void 0||Fs.normal!==void 0||Fs.color!==void 0)&&Ie.update(F,W,fn),(en||Re.receiveShadow!==F.receiveShadow)&&(Re.receiveShadow=F.receiveShadow,ut.setValue(U,"receiveShadow",F.receiveShadow)),X.isMeshGouraudMaterial&&X.envMap!==null&&(En.envMap.value=we,En.flipEnvMap.value=we.isCubeTexture&&we.isRenderTargetTexture===!1?-1:1),X.isMeshStandardMaterial&&X.envMap===null&&k.environment!==null&&(En.envMapIntensity.value=k.environmentIntensity),en&&(ut.setValue(U,"toneMappingExposure",_.toneMappingExposure),Re.needsLights&&Ld(En,ks),re&&X.fog===!0&&ce.refreshFogUniforms(En,re),ce.refreshMaterialUniforms(En,X,G,$,p.state.transmissionRenderTarget[b.id]),xa.upload(U,Ec(Re),En,P)),X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(xa.upload(U,Ec(Re),En,P),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&ut.setValue(U,"center",F.center),ut.setValue(U,"modelViewMatrix",F.modelViewMatrix),ut.setValue(U,"normalMatrix",F.normalMatrix),ut.setValue(U,"modelMatrix",F.matrixWorld),X.isShaderMaterial||X.isRawShaderMaterial){const rn=X.uniformsGroups;for(let si=0,ri=rn.length;si<ri;si++){const Rc=rn[si];N.update(Rc,fn),N.bind(Rc,fn)}}return fn}function Ld(b,k){b.ambientLightColor.needsUpdate=k,b.lightProbe.needsUpdate=k,b.directionalLights.needsUpdate=k,b.directionalLightShadows.needsUpdate=k,b.pointLights.needsUpdate=k,b.pointLightShadows.needsUpdate=k,b.spotLights.needsUpdate=k,b.spotLightShadows.needsUpdate=k,b.rectAreaLights.needsUpdate=k,b.hemisphereLights.needsUpdate=k}function Nd(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(b,k,W){Te.get(b.texture).__webglTexture=k,Te.get(b.depthTexture).__webglTexture=W;const X=Te.get(b);X.__hasExternalTextures=!0,X.__autoAllocateDepthBuffer=W===void 0,X.__autoAllocateDepthBuffer||Fe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),X.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,k){const W=Te.get(b);W.__webglFramebuffer=k,W.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(b,k=0,W=0){w=b,E=k,R=W;let X=!0,F=null,re=!1,ge=!1;if(b){const we=Te.get(b);if(we.__useDefaultFramebuffer!==void 0)Ae.bindFramebuffer(U.FRAMEBUFFER,null),X=!1;else if(we.__webglFramebuffer===void 0)P.setupRenderTarget(b);else if(we.__hasExternalTextures)P.rebindTextures(b,Te.get(b.texture).__webglTexture,Te.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const Ee=b.depthTexture;if(we.__boundDepthTexture!==Ee){if(Ee!==null&&Te.has(Ee)&&(b.width!==Ee.image.width||b.height!==Ee.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");P.setupDepthRenderbuffer(b)}}const Ue=b.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(ge=!0);const He=Te.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(He[k])?F=He[k][W]:F=He[k],re=!0):b.samples>0&&P.useMultisampledRTT(b)===!1?F=Te.get(b).__webglMultisampledFramebuffer:Array.isArray(He)?F=He[W]:F=He,C.copy(b.viewport),L.copy(b.scissor),I=b.scissorTest}else C.copy(Q).multiplyScalar(G).floor(),L.copy(se).multiplyScalar(G).floor(),I=Me;if(Ae.bindFramebuffer(U.FRAMEBUFFER,F)&&X&&Ae.drawBuffers(b,F),Ae.viewport(C),Ae.scissor(L),Ae.setScissorTest(I),re){const we=Te.get(b.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+k,we.__webglTexture,W)}else if(ge){const we=Te.get(b.texture),Ue=k||0;U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,we.__webglTexture,W||0,Ue)}M=-1},this.readRenderTargetPixels=function(b,k,W,X,F,re,ge){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=Te.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ge!==void 0&&(be=be[ge]),be){Ae.bindFramebuffer(U.FRAMEBUFFER,be);try{const we=b.texture,Ue=we.format,He=we.type;if(!Ne.textureFormatReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ne.textureTypeReadable(He)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=b.width-X&&W>=0&&W<=b.height-F&&U.readPixels(k,W,X,F,Le.convert(Ue),Le.convert(He),re)}finally{const we=w!==null?Te.get(w).__webglFramebuffer:null;Ae.bindFramebuffer(U.FRAMEBUFFER,we)}}},this.readRenderTargetPixelsAsync=async function(b,k,W,X,F,re,ge){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=Te.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ge!==void 0&&(be=be[ge]),be){const we=b.texture,Ue=we.format,He=we.type;if(!Ne.textureFormatReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ne.textureTypeReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=b.width-X&&W>=0&&W<=b.height-F){Ae.bindFramebuffer(U.FRAMEBUFFER,be);const Ee=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Ee),U.bufferData(U.PIXEL_PACK_BUFFER,re.byteLength,U.STREAM_READ),U.readPixels(k,W,X,F,Le.convert(Ue),Le.convert(He),0);const Ke=w!==null?Te.get(w).__webglFramebuffer:null;Ae.bindFramebuffer(U.FRAMEBUFFER,Ke);const ot=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await dp(U,ot,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Ee),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,re),U.deleteBuffer(Ee),U.deleteSync(ot),re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,k=null,W=0){b.isTexture!==!0&&(tr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,b=arguments[1]);const X=Math.pow(2,-W),F=Math.floor(b.image.width*X),re=Math.floor(b.image.height*X),ge=k!==null?k.x:0,be=k!==null?k.y:0;P.setTexture2D(b,0),U.copyTexSubImage2D(U.TEXTURE_2D,W,0,0,ge,be,F,re),Ae.unbindTexture()},this.copyTextureToTexture=function(b,k,W=null,X=null,F=0){b.isTexture!==!0&&(tr("WebGLRenderer: copyTextureToTexture function signature has changed."),X=arguments[0]||null,b=arguments[1],k=arguments[2],F=arguments[3]||0,W=null);let re,ge,be,we,Ue,He,Ee,Ke,ot;const ht=b.isCompressedTexture?b.mipmaps[F]:b.image;W!==null?(re=W.max.x-W.min.x,ge=W.max.y-W.min.y,be=W.isBox3?W.max.z-W.min.z:1,we=W.min.x,Ue=W.min.y,He=W.isBox3?W.min.z:0):(re=ht.width,ge=ht.height,be=ht.depth||1,we=0,Ue=0,He=0),X!==null?(Ee=X.x,Ke=X.y,ot=X.z):(Ee=0,Ke=0,ot=0);const $t=Le.convert(k.format),et=Le.convert(k.type);let Re;k.isData3DTexture?(P.setTexture3D(k,0),Re=U.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(P.setTexture2DArray(k,0),Re=U.TEXTURE_2D_ARRAY):(P.setTexture2D(k,0),Re=U.TEXTURE_2D),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,k.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,k.unpackAlignment);const Hn=U.getParameter(U.UNPACK_ROW_LENGTH),tt=U.getParameter(U.UNPACK_IMAGE_HEIGHT),fn=U.getParameter(U.UNPACK_SKIP_PIXELS),$i=U.getParameter(U.UNPACK_SKIP_ROWS),en=U.getParameter(U.UNPACK_SKIP_IMAGES);U.pixelStorei(U.UNPACK_ROW_LENGTH,ht.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ht.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,we),U.pixelStorei(U.UNPACK_SKIP_ROWS,Ue),U.pixelStorei(U.UNPACK_SKIP_IMAGES,He);const ks=b.isDataArrayTexture||b.isData3DTexture,ut=k.isDataArrayTexture||k.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){const En=Te.get(b),Fs=Te.get(k),rn=Te.get(En.__renderTarget),si=Te.get(Fs.__renderTarget);Ae.bindFramebuffer(U.READ_FRAMEBUFFER,rn.__webglFramebuffer),Ae.bindFramebuffer(U.DRAW_FRAMEBUFFER,si.__webglFramebuffer);for(let ri=0;ri<be;ri++)ks&&U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Te.get(b).__webglTexture,F,He+ri),b.isDepthTexture?(ut&&U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Te.get(k).__webglTexture,F,ot+ri),U.blitFramebuffer(we,Ue,re,ge,Ee,Ke,re,ge,U.DEPTH_BUFFER_BIT,U.NEAREST)):ut?U.copyTexSubImage3D(Re,F,Ee,Ke,ot+ri,we,Ue,re,ge):U.copyTexSubImage2D(Re,F,Ee,Ke,ot+ri,we,Ue,re,ge);Ae.bindFramebuffer(U.READ_FRAMEBUFFER,null),Ae.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else ut?b.isDataTexture||b.isData3DTexture?U.texSubImage3D(Re,F,Ee,Ke,ot,re,ge,be,$t,et,ht.data):k.isCompressedArrayTexture?U.compressedTexSubImage3D(Re,F,Ee,Ke,ot,re,ge,be,$t,ht.data):U.texSubImage3D(Re,F,Ee,Ke,ot,re,ge,be,$t,et,ht):b.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,F,Ee,Ke,re,ge,$t,et,ht.data):b.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,F,Ee,Ke,ht.width,ht.height,$t,ht.data):U.texSubImage2D(U.TEXTURE_2D,F,Ee,Ke,re,ge,$t,et,ht);U.pixelStorei(U.UNPACK_ROW_LENGTH,Hn),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,tt),U.pixelStorei(U.UNPACK_SKIP_PIXELS,fn),U.pixelStorei(U.UNPACK_SKIP_ROWS,$i),U.pixelStorei(U.UNPACK_SKIP_IMAGES,en),F===0&&k.generateMipmaps&&U.generateMipmap(Re),Ae.unbindTexture()},this.copyTextureToTexture3D=function(b,k,W=null,X=null,F=0){return b.isTexture!==!0&&(tr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),W=arguments[0]||null,X=arguments[1]||null,b=arguments[2],k=arguments[3],F=arguments[4]||0),tr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,k,W,X,F)},this.initRenderTarget=function(b){Te.get(b).__webglFramebuffer===void 0&&P.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?P.setTextureCube(b,0):b.isData3DTexture?P.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?P.setTexture2DArray(b,0):P.setTexture2D(b,0),Ae.unbindTexture()},this.resetState=function(){E=0,R=0,w=null,Ae.reset(),Ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Qn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=qe._getUnpackColorSpace()}}class ac{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new ue(e),this.density=t}clone(){return new ac(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Il extends ct{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new kn,this.environmentIntensity=1,this.environmentRotation=new kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class hd{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Rl,this.updateRanges=[],this.version=0,this.uuid=Sn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Sn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Sn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Vt=new A;class _r{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Vt.fromBufferAttribute(this,t),Vt.applyMatrix4(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Vt.fromBufferAttribute(this,t),Vt.applyNormalMatrix(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Vt.fromBufferAttribute(this,t),Vt.transformDirection(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=xn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=rt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=xn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=xn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=xn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=xn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array),i=rt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),n=rt(n,this.array),i=rt(i,this.array),s=rt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new St(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new _r(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class ud extends un{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new ue(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let cs;const Vs=new A,hs=new A,us=new A,ds=new ae,Gs=new ae,dd=new Pe,Yr=new A,Ws=new A,Kr=new A,Fh=new ae,So=new ae,Oh=new ae;class E_ extends ct{constructor(e=new ud){if(super(),this.isSprite=!0,this.type="Sprite",cs===void 0){cs=new gt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new hd(t,5);cs.setIndex([0,1,2,0,2,3]),cs.setAttribute("position",new _r(n,3,0,!1)),cs.setAttribute("uv",new _r(n,2,3,!1))}this.geometry=cs,this.material=e,this.center=new ae(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),hs.setFromMatrixScale(this.matrixWorld),dd.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),us.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&hs.multiplyScalar(-us.z);const n=this.material.rotation;let i,s;n!==0&&(s=Math.cos(n),i=Math.sin(n));const a=this.center;Zr(Yr.set(-.5,-.5,0),us,a,hs,i,s),Zr(Ws.set(.5,-.5,0),us,a,hs,i,s),Zr(Kr.set(.5,.5,0),us,a,hs,i,s),Fh.set(0,0),So.set(1,0),Oh.set(1,1);let o=e.ray.intersectTriangle(Yr,Ws,Kr,!1,Vs);if(o===null&&(Zr(Ws.set(-.5,.5,0),us,a,hs,i,s),So.set(0,1),o=e.ray.intersectTriangle(Yr,Kr,Ws,!1,Vs),o===null))return;const l=e.ray.origin.distanceTo(Vs);l<e.near||l>e.far||t.push({distance:l,point:Vs.clone(),uv:hn.getInterpolation(Vs,Yr,Ws,Kr,Fh,So,Oh,new ae),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Zr(r,e,t,n,i,s){ds.subVectors(r,t).addScalar(.5).multiply(n),i!==void 0?(Gs.x=s*ds.x-i*ds.y,Gs.y=i*ds.x+s*ds.y):Gs.copy(ds),r.copy(e),r.x+=Gs.x,r.y+=Gs.y,r.applyMatrix4(dd)}const Bh=new A,zh=new Ze,Hh=new Ze,A_=new A,Vh=new Pe,Jr=new A,bo=new Fn,Gh=new Pe,wo=new Ba;class R_ extends Oe{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Gc,this.bindMatrix=new Pe,this.bindMatrixInverse=new Pe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new wn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Jr),this.boundingBox.expandByPoint(Jr)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Fn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Jr),this.boundingSphere.expandByPoint(Jr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),bo.copy(this.boundingSphere),bo.applyMatrix4(i),e.ray.intersectsSphere(bo)!==!1&&(Gh.copy(i).invert(),wo.copy(e.ray).applyMatrix4(Gh),!(this.boundingBox!==null&&wo.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,wo)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Ze,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Gc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Uf?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;zh.fromBufferAttribute(i.attributes.skinIndex,e),Hh.fromBufferAttribute(i.attributes.skinWeight,e),Bh.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const a=Hh.getComponent(s);if(a!==0){const o=zh.getComponent(s);Vh.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(A_.copy(Bh).applyMatrix4(Vh),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class fd extends ct{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Xi extends Tt{constructor(e=null,t=1,n=1,i,s,a,o,l,c=Lt,h=Lt,u,d){super(null,a,o,l,c,h,i,s,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Wh=new Pe,C_=new Pe;class oc{constructor(e=[],t=[]){this.uuid=Sn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Pe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Pe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,a=e.length;s<a;s++){const o=e[s]?e[s].matrixWorld:C_;Wh.multiplyMatrices(o,t[s]),Wh.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new oc(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new Xi(t,e,e,qt,Zt);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const s=e.bones[n];let a=t[s];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),a=new fd),this.bones.push(a),this.boneInverses.push(new Pe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Ll extends St{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const fs=new Pe,Xh=new Pe,Qr=[],qh=new wn,P_=new Pe,Xs=new Oe,qs=new Fn;class lr extends Oe{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ll(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,P_)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new wn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,fs),qh.copy(e.boundingBox).applyMatrix4(fs),this.boundingBox.union(qh)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Fn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,fs),qs.copy(e.boundingSphere).applyMatrix4(fs),this.boundingSphere.union(qs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,a=e*s+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(Xs.geometry=this.geometry,Xs.material=this.material,Xs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),qs.copy(this.boundingSphere),qs.applyMatrix4(n),e.ray.intersectsSphere(qs)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,fs),Xh.multiplyMatrices(n,fs),Xs.matrixWorld=Xh,Xs.raycast(e,Qr);for(let a=0,o=Qr.length;a<o;a++){const l=Qr[a];l.instanceId=s,l.object=this,t.push(l)}Qr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Ll(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Xi(new Float32Array(i*this.count),i,this.count,Kl,Zt));const s=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*e;s[l]=o,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class pd extends un{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ra=new A,Ca=new A,jh=new Pe,js=new Ba,ea=new Fn,Eo=new A,$h=new A;class lc extends ct{constructor(e=new gt,t=new pd){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)Ra.fromBufferAttribute(t,i-1),Ca.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Ra.distanceTo(Ca);e.setAttribute("lineDistance",new je(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ea.copy(n.boundingSphere),ea.applyMatrix4(i),ea.radius+=s,e.ray.intersectsSphere(ea)===!1)return;jh.copy(i).invert(),js.copy(e.ray).applyMatrix4(jh);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let v=f,g=m-1;v<g;v+=c){const p=h.getX(v),x=h.getX(v+1),T=ta(this,e,js,l,p,x);T&&t.push(T)}if(this.isLineLoop){const v=h.getX(m-1),g=h.getX(f),p=ta(this,e,js,l,v,g);p&&t.push(p)}}else{const f=Math.max(0,a.start),m=Math.min(d.count,a.start+a.count);for(let v=f,g=m-1;v<g;v+=c){const p=ta(this,e,js,l,v,v+1);p&&t.push(p)}if(this.isLineLoop){const v=ta(this,e,js,l,m-1,f);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function ta(r,e,t,n,i,s){const a=r.geometry.attributes.position;if(Ra.fromBufferAttribute(a,i),Ca.fromBufferAttribute(a,s),t.distanceSqToSegment(Ra,Ca,Eo,$h)>n)return;Eo.applyMatrix4(r.matrixWorld);const l=e.ray.origin.distanceTo(Eo);if(!(l<e.near||l>e.far))return{distance:l,point:$h.clone().applyMatrix4(r.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:r}}const Yh=new A,Kh=new A;class D_ extends lc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)Yh.fromBufferAttribute(t,i),Kh.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Yh.distanceTo(Kh);e.setAttribute("lineDistance",new je(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class I_ extends lc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class cc extends un{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new ue(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Zh=new Pe,Nl=new Ba,na=new Fn,ia=new A;class hc extends ct{constructor(e=new gt,t=new cc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),na.copy(n.boundingSphere),na.applyMatrix4(i),na.radius+=s,e.ray.intersectsSphere(na)===!1)return;Zh.copy(i).invert(),Nl.copy(e.ray).applyMatrix4(Zh);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let m=d,v=f;m<v;m++){const g=c.getX(m);ia.fromBufferAttribute(u,g),Jh(ia,g,l,i,e,t,this)}}else{const d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let m=d,v=f;m<v;m++)ia.fromBufferAttribute(u,m),Jh(ia,m,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Jh(r,e,t,n,i,s,a){const o=Nl.distanceSqToPoint(r);if(o<t){const l=new A;Nl.closestPointToPoint(r,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class uc extends Tt{constructor(e,t,n,i,s,a,o,l,c){super(e,t,n,i,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ii{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(i),t.push(s),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let i=0;const s=n.length;let a;t?a=t:a=e*n[s-1];let o=0,l=s-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(s-1);const h=n[i],d=n[i+1]-h,f=(a-h)/d;return(i+f)/(s-1)}getTangent(e,t){let i=e-1e-4,s=e+1e-4;i<0&&(i=0),s>1&&(s=1);const a=this.getPoint(i),o=this.getPoint(s),l=t||(a.isVector2?new ae:new A);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new A,i=[],s=[],a=[],o=new A,l=new Pe;for(let f=0;f<=e;f++){const m=f/e;i[f]=this.getTangentAt(m,new A)}s[0]=new A,a[0]=new A;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],o),a[0].crossVectors(i[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(i[f-1],i[f]),o.length()>Number.EPSILON){o.normalize();const m=Math.acos(Mt(i[f-1].dot(i[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(o,m))}a[f].crossVectors(i[f],s[f])}if(t===!0){let f=Math.acos(Mt(s[0].dot(s[e]),-1,1));f/=e,i[0].dot(o.crossVectors(s[0],s[e]))>0&&(f=-f);for(let m=1;m<=e;m++)s[m].applyMatrix4(l.makeRotationAxis(i[m],f*m)),a[m].crossVectors(i[m],s[m])}return{tangents:i,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class md extends ii{constructor(e=0,t=0,n=1,i=1,s=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new ae){const n=t,i=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=i;for(;s>i;)s-=i;s<Number.EPSILON&&(a?s=0:s=i),this.aClockwise===!0&&!a&&(s===i?s=-i:s=s-i);const o=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class L_ extends md{constructor(e,t,n,i,s,a){super(e,t,n,n,i,s,a),this.isArcCurve=!0,this.type="ArcCurve"}}function dc(){let r=0,e=0,t=0,n=0;function i(s,a,o,l){r=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){i(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,h,u){let d=(a-s)/c-(o-s)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,f*=h,i(a,o,d,f)},calc:function(s){const a=s*s,o=a*s;return r+e*s+t*a+n*o}}}const sa=new A,Ao=new dc,Ro=new dc,Co=new dc;class gd extends ii{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new A){const n=t,i=this.points,s=i.length,a=(s-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s:l===0&&o===s-1&&(o=s-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%s]:(sa.subVectors(i[0],i[1]).add(i[0]),c=sa);const u=i[o%s],d=i[(o+1)%s];if(this.closed||o+2<s?h=i[(o+2)%s]:(sa.subVectors(i[s-1],i[s-2]).add(i[s-1]),h=sa),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let m=Math.pow(c.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),g=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),m<1e-4&&(m=v),g<1e-4&&(g=v),Ao.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,m,v,g),Ro.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,m,v,g),Co.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,m,v,g)}else this.curveType==="catmullrom"&&(Ao.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Ro.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Co.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Ao.calc(l),Ro.calc(l),Co.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new A().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Qh(r,e,t,n,i){const s=(n-e)*.5,a=(i-t)*.5,o=r*r,l=r*o;return(2*t-2*n+s+a)*l+(-3*t+3*n-2*s-a)*o+s*r+t}function N_(r,e){const t=1-r;return t*t*e}function U_(r,e){return 2*(1-r)*r*e}function k_(r,e){return r*r*e}function cr(r,e,t,n){return N_(r,e)+U_(r,t)+k_(r,n)}function F_(r,e){const t=1-r;return t*t*t*e}function O_(r,e){const t=1-r;return 3*t*t*r*e}function B_(r,e){return 3*(1-r)*r*r*e}function z_(r,e){return r*r*r*e}function hr(r,e,t,n,i){return F_(r,e)+O_(r,t)+B_(r,n)+z_(r,i)}class H_ extends ii{constructor(e=new ae,t=new ae,n=new ae,i=new ae){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new ae){const n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(hr(e,i.x,s.x,a.x,o.x),hr(e,i.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class V_ extends ii{constructor(e=new A,t=new A,n=new A,i=new A){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new A){const n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(hr(e,i.x,s.x,a.x,o.x),hr(e,i.y,s.y,a.y,o.y),hr(e,i.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class G_ extends ii{constructor(e=new ae,t=new ae){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ae){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ae){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class W_ extends ii{constructor(e=new A,t=new A){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new A){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new A){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class X_ extends ii{constructor(e=new ae,t=new ae,n=new ae){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ae){const n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(cr(e,i.x,s.x,a.x),cr(e,i.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class vd extends ii{constructor(e=new A,t=new A,n=new A){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new A){const n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(cr(e,i.x,s.x,a.x),cr(e,i.y,s.y,a.y),cr(e,i.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class q_ extends ii{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ae){const n=t,i=this.points,s=(i.length-1)*e,a=Math.floor(s),o=s-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(Qh(o,l.x,c.x,h.x,u.x),Qh(o,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new ae().fromArray(i))}return this}}var j_=Object.freeze({__proto__:null,ArcCurve:L_,CatmullRomCurve3:gd,CubicBezierCurve:H_,CubicBezierCurve3:V_,EllipseCurve:md,LineCurve:G_,LineCurve3:W_,QuadraticBezierCurve:X_,QuadraticBezierCurve3:vd,SplineCurve:q_});class ys extends gt{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const s=[],a=[],o=[],l=[],c=new A,h=new ae;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){const f=n+u/t*i;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new je(a,3)),this.setAttribute("normal",new je(o,3)),this.setAttribute("uv",new je(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ys(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Ms extends gt{constructor(e=1,t=1,n=1,i=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),s=Math.floor(s);const h=[],u=[],d=[],f=[];let m=0;const v=[],g=n/2;let p=0;x(),a===!1&&(e>0&&T(!0),t>0&&T(!1)),this.setIndex(h),this.setAttribute("position",new je(u,3)),this.setAttribute("normal",new je(d,3)),this.setAttribute("uv",new je(f,2));function x(){const _=new A,D=new A;let E=0;const R=(t-e)/n;for(let w=0;w<=s;w++){const M=[],y=w/s,C=y*(t-e)+e;for(let L=0;L<=i;L++){const I=L/i,O=I*l+o,V=Math.sin(O),B=Math.cos(O);D.x=C*V,D.y=-y*n+g,D.z=C*B,u.push(D.x,D.y,D.z),_.set(V,R,B).normalize(),d.push(_.x,_.y,_.z),f.push(I,1-y),M.push(m++)}v.push(M)}for(let w=0;w<i;w++)for(let M=0;M<s;M++){const y=v[M][w],C=v[M+1][w],L=v[M+1][w+1],I=v[M][w+1];(e>0||M!==0)&&(h.push(y,C,I),E+=3),(t>0||M!==s-1)&&(h.push(C,L,I),E+=3)}c.addGroup(p,E,0),p+=E}function T(_){const D=m,E=new ae,R=new A;let w=0;const M=_===!0?e:t,y=_===!0?1:-1;for(let L=1;L<=i;L++)u.push(0,g*y,0),d.push(0,y,0),f.push(.5,.5),m++;const C=m;for(let L=0;L<=i;L++){const O=L/i*l+o,V=Math.cos(O),B=Math.sin(O);R.x=M*B,R.y=g*y,R.z=M*V,u.push(R.x,R.y,R.z),d.push(0,y,0),E.x=V*.5+.5,E.y=B*.5*y+.5,f.push(E.x,E.y),m++}for(let L=0;L<i;L++){const I=D+L,O=C+L;_===!0?h.push(O,O+1,I):h.push(O+1,O,I),w+=3}c.addGroup(p,w,_===!0?1:2),p+=w}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ms(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Pa extends Ms{constructor(e=1,t=1,n=32,i=1,s=!1,a=0,o=Math.PI*2){super(0,e,t,n,i,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Pa(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class fc extends gt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const s=[],a=[];o(i),c(n),h(),this.setAttribute("position",new je(s,3)),this.setAttribute("normal",new je(s.slice(),3)),this.setAttribute("uv",new je(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(x){const T=new A,_=new A,D=new A;for(let E=0;E<t.length;E+=3)f(t[E+0],T),f(t[E+1],_),f(t[E+2],D),l(T,_,D,x)}function l(x,T,_,D){const E=D+1,R=[];for(let w=0;w<=E;w++){R[w]=[];const M=x.clone().lerp(_,w/E),y=T.clone().lerp(_,w/E),C=E-w;for(let L=0;L<=C;L++)L===0&&w===E?R[w][L]=M:R[w][L]=M.clone().lerp(y,L/C)}for(let w=0;w<E;w++)for(let M=0;M<2*(E-w)-1;M++){const y=Math.floor(M/2);M%2===0?(d(R[w][y+1]),d(R[w+1][y]),d(R[w][y])):(d(R[w][y+1]),d(R[w+1][y+1]),d(R[w+1][y]))}}function c(x){const T=new A;for(let _=0;_<s.length;_+=3)T.x=s[_+0],T.y=s[_+1],T.z=s[_+2],T.normalize().multiplyScalar(x),s[_+0]=T.x,s[_+1]=T.y,s[_+2]=T.z}function h(){const x=new A;for(let T=0;T<s.length;T+=3){x.x=s[T+0],x.y=s[T+1],x.z=s[T+2];const _=g(x)/2/Math.PI+.5,D=p(x)/Math.PI+.5;a.push(_,1-D)}m(),u()}function u(){for(let x=0;x<a.length;x+=6){const T=a[x+0],_=a[x+2],D=a[x+4],E=Math.max(T,_,D),R=Math.min(T,_,D);E>.9&&R<.1&&(T<.2&&(a[x+0]+=1),_<.2&&(a[x+2]+=1),D<.2&&(a[x+4]+=1))}}function d(x){s.push(x.x,x.y,x.z)}function f(x,T){const _=x*3;T.x=e[_+0],T.y=e[_+1],T.z=e[_+2]}function m(){const x=new A,T=new A,_=new A,D=new A,E=new ae,R=new ae,w=new ae;for(let M=0,y=0;M<s.length;M+=9,y+=6){x.set(s[M+0],s[M+1],s[M+2]),T.set(s[M+3],s[M+4],s[M+5]),_.set(s[M+6],s[M+7],s[M+8]),E.set(a[y+0],a[y+1]),R.set(a[y+2],a[y+3]),w.set(a[y+4],a[y+5]),D.copy(x).add(T).add(_).divideScalar(3);const C=g(D);v(E,y+0,x,C),v(R,y+2,T,C),v(w,y+4,_,C)}}function v(x,T,_,D){D<0&&x.x===1&&(a[T]=x.x-1),_.x===0&&_.z===0&&(a[T]=D/2/Math.PI+.5)}function g(x){return Math.atan2(x.z,-x.x)}function p(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new fc(e.vertices,e.indices,e.radius,e.details)}}class pc extends fc{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new pc(e.radius,e.detail)}}class ki extends gt{constructor(e=.5,t=1,n=32,i=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);const o=[],l=[],c=[],h=[];let u=e;const d=(t-e)/i,f=new A,m=new ae;for(let v=0;v<=i;v++){for(let g=0;g<=n;g++){const p=s+g/n*a;f.x=u*Math.cos(p),f.y=u*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/t+1)/2,m.y=(f.y/t+1)/2,h.push(m.x,m.y)}u+=d}for(let v=0;v<i;v++){const g=v*(n+1);for(let p=0;p<n;p++){const x=p+g,T=x,_=x+n+1,D=x+n+2,E=x+1;o.push(T,_,E),o.push(_,D,E)}}this.setIndex(o),this.setAttribute("position",new je(l,3)),this.setAttribute("normal",new je(c,3)),this.setAttribute("uv",new je(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ki(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Ls extends gt{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new A,d=new A,f=[],m=[],v=[],g=[];for(let p=0;p<=n;p++){const x=[],T=p/n;let _=0;p===0&&a===0?_=.5/t:p===n&&l===Math.PI&&(_=-.5/t);for(let D=0;D<=t;D++){const E=D/t;u.x=-e*Math.cos(i+E*s)*Math.sin(a+T*o),u.y=e*Math.cos(a+T*o),u.z=e*Math.sin(i+E*s)*Math.sin(a+T*o),m.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),g.push(E+_,1-T),x.push(c++)}h.push(x)}for(let p=0;p<n;p++)for(let x=0;x<t;x++){const T=h[p][x+1],_=h[p][x],D=h[p+1][x],E=h[p+1][x+1];(p!==0||a>0)&&f.push(T,_,E),(p!==n-1||l<Math.PI)&&f.push(_,D,E)}this.setIndex(f),this.setAttribute("position",new je(m,3)),this.setAttribute("normal",new je(v,3)),this.setAttribute("uv",new je(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ls(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Da extends gt{constructor(e=1,t=.4,n=12,i=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);const a=[],o=[],l=[],c=[],h=new A,u=new A,d=new A;for(let f=0;f<=n;f++)for(let m=0;m<=i;m++){const v=m/i*s,g=f/n*Math.PI*2;u.x=(e+t*Math.cos(g))*Math.cos(v),u.y=(e+t*Math.cos(g))*Math.sin(v),u.z=t*Math.sin(g),o.push(u.x,u.y,u.z),h.x=e*Math.cos(v),h.y=e*Math.sin(v),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(m/i),c.push(f/n)}for(let f=1;f<=n;f++)for(let m=1;m<=i;m++){const v=(i+1)*f+m-1,g=(i+1)*(f-1)+m-1,p=(i+1)*(f-1)+m,x=(i+1)*f+m;a.push(v,g,x),a.push(g,p,x)}this.setIndex(a),this.setAttribute("position",new je(o,3)),this.setAttribute("normal",new je(l,3)),this.setAttribute("uv",new je(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Da(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class mc extends gt{constructor(e=new vd(new A(-1,-1,0),new A(-1,1,0),new A(1,1,0)),t=64,n=1,i=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:s};const a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new A,l=new A,c=new ae;let h=new A;const u=[],d=[],f=[],m=[];v(),this.setIndex(m),this.setAttribute("position",new je(u,3)),this.setAttribute("normal",new je(d,3)),this.setAttribute("uv",new je(f,2));function v(){for(let T=0;T<t;T++)g(T);g(s===!1?t:0),x(),p()}function g(T){h=e.getPointAt(T/t,h);const _=a.normals[T],D=a.binormals[T];for(let E=0;E<=i;E++){const R=E/i*Math.PI*2,w=Math.sin(R),M=-Math.cos(R);l.x=M*_.x+w*D.x,l.y=M*_.y+w*D.y,l.z=M*_.z+w*D.z,l.normalize(),d.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,u.push(o.x,o.y,o.z)}}function p(){for(let T=1;T<=t;T++)for(let _=1;_<=i;_++){const D=(i+1)*(T-1)+(_-1),E=(i+1)*T+(_-1),R=(i+1)*T+_,w=(i+1)*(T-1)+_;m.push(D,E,w),m.push(E,R,w)}}function x(){for(let T=0;T<=t;T++)for(let _=0;_<=i;_++)c.x=T/t,c.y=_/i,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new mc(new j_[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class $_ extends pt{static get type(){return"RawShaderMaterial"}constructor(e){super(e),this.isRawShaderMaterial=!0}}class Rt extends un{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=tc,this.normalScale=new ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class On extends Rt{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ae(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Mt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ue(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ue(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ue(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Y_ extends un{static get type(){return"MeshNormalMaterial"}constructor(e){super(),this.isMeshNormalMaterial=!0,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=tc,this.normalScale=new ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}}function ra(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function K_(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Z_(r){function e(i,s){return r[i]-r[s]}const t=r.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function eu(r,e,t){const n=r.length,i=new r.constructor(n);for(let s=0,a=0;a!==n;++s){const o=t[s]*e;for(let l=0;l!==e;++l)i[a++]=r[o+l]}return i}function _d(r,e,t,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let a=s[n];if(a!==void 0)if(Array.isArray(a))do a=s[n],a!==void 0&&(e.push(s.time),t.push.apply(t,a)),s=r[i++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[n],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=r[i++];while(s!==void 0);else do a=s[n],a!==void 0&&(e.push(s.time),t.push(a)),s=r[i++];while(s!==void 0)}class yr{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],s=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=s)){const o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=t[--n-1],e>=s)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class J_ extends yr{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ms,endingEnd:ms}}intervalChanged_(e,t,n){const i=this.parameterPositions;let s=e-2,a=e+1,o=i[s],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case gs:s=e,o=2*t-n;break;case Ea:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case gs:a=e,l=2*n-t;break;case Ea:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(n-t)/(i-t),v=m*m,g=v*m,p=-d*g+2*d*v-d*m,x=(1+d)*g+(-1.5-2*d)*v+(-.5+d)*m+1,T=(-1-f)*g+(1.5+f)*v+.5*m,_=f*g-f*v;for(let D=0;D!==o;++D)s[D]=p*a[h+D]+x*a[c+D]+T*a[l+D]+_*a[u+D];return s}}class xd extends yr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==o;++d)s[d]=a[c+d]*u+a[l+d]*h;return s}}class Q_ extends yr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Bn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ra(t,this.TimeBufferType),this.values=ra(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ra(e.times,Array),values:ra(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Q_(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new xd(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new J_(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case mr:t=this.InterpolantFactoryMethodDiscrete;break;case gr:t=this.InterpolantFactoryMethodLinear;break;case $a:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return mr;case this.InterpolantFactoryMethodLinear:return gr;case this.InterpolantFactoryMethodSmooth:return $a}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);const o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){const l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&K_(i))for(let o=0,l=i.length;o!==l;++o){const c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===$a,s=e.length-1;let a=1;for(let o=1;o<s;++o){let l=!1;const c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(i)l=!0;else{const u=o*n,d=u-n,f=u+n;for(let m=0;m!==n;++m){const v=t[u+m];if(v!==t[d+m]||v!==t[f+m]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];const u=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Bn.prototype.TimeBufferType=Float32Array;Bn.prototype.ValueBufferType=Float32Array;Bn.prototype.DefaultInterpolation=gr;class Ns extends Bn{constructor(e,t,n){super(e,t,n)}}Ns.prototype.ValueTypeName="bool";Ns.prototype.ValueBufferType=Array;Ns.prototype.DefaultInterpolation=mr;Ns.prototype.InterpolantFactoryMethodLinear=void 0;Ns.prototype.InterpolantFactoryMethodSmooth=void 0;class yd extends Bn{}yd.prototype.ValueTypeName="color";class Rs extends Bn{}Rs.prototype.ValueTypeName="number";class ex extends yr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t);let c=e*o;for(let h=c+o;c!==h;c+=4)jt.slerpFlat(s,0,a,c-o,a,c,l);return s}}class Cs extends Bn{InterpolantFactoryMethodLinear(e){return new ex(this.times,this.values,this.getValueSize(),e)}}Cs.prototype.ValueTypeName="quaternion";Cs.prototype.InterpolantFactoryMethodSmooth=void 0;class Us extends Bn{constructor(e,t,n){super(e,t,n)}}Us.prototype.ValueTypeName="string";Us.prototype.ValueBufferType=Array;Us.prototype.DefaultInterpolation=mr;Us.prototype.InterpolantFactoryMethodLinear=void 0;Us.prototype.InterpolantFactoryMethodSmooth=void 0;class Ps extends Bn{}Ps.prototype.ValueTypeName="vector";class Ul{constructor(e="",t=-1,n=[],i=ec){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Sn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(nx(n[a]).scale(i));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,a=n.length;s!==a;++s)t.push(Bn.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const s=t.length,a=[];for(let o=0;o<s;o++){let l=[],c=[];l.push((o+s-1)%s,o,(o+1)%s),c.push(0,1,0);const h=Z_(l);l=eu(l,1,h),c=eu(c,1,h),!i&&l[0]===0&&(l.push(s),c.push(c[0])),a.push(new Rs(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){const c=e[o],h=c.name.match(s);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(c)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,f,m,v){if(f.length!==0){const g=[],p=[];_d(f,g,p,m),g.length!==0&&v.push(new u(d,g,p))}},i=[],s=e.name||"default",a=e.fps||30,o=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let m;for(m=0;m<d.length;m++)if(d[m].morphTargets)for(let v=0;v<d[m].morphTargets.length;v++)f[d[m].morphTargets[v]]=-1;for(const v in f){const g=[],p=[];for(let x=0;x!==d[m].morphTargets.length;++x){const T=d[m];g.push(T.time),p.push(T.morphTarget===v?1:0)}i.push(new Rs(".morphTargetInfluence["+v+"]",g,p))}l=f.length*a}else{const f=".bones["+t[u].name+"]";n(Ps,f+".position",d,"pos",i),n(Cs,f+".quaternion",d,"rot",i),n(Ps,f+".scale",d,"scl",i)}}return i.length===0?null:new this(s,l,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function tx(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Rs;case"vector":case"vector2":case"vector3":case"vector4":return Ps;case"color":return yd;case"quaternion":return Cs;case"bool":case"boolean":return Ns;case"string":return Us}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function nx(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=tx(r.type);if(r.times===void 0){const t=[],n=[];_d(r.keys,t,n,"value"),r.times=t,r.values=n}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const vi={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class ix{constructor(e,t,n){const i=this;let s=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){o++,s===!1&&i.onStart!==void 0&&i.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){const f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null}}}const sx=new ix;class qi{constructor(e){this.manager=e!==void 0?e:sx,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}qi.DEFAULT_MATERIAL_NAME="__DEFAULT";const $n={};class rx extends Error{constructor(e,t){super(e),this.response=t}}class gc extends qi{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=vi.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if($n[e]!==void 0){$n[e].push({onLoad:t,onProgress:n,onError:i});return}$n[e]=[],$n[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=$n[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,m=f!==0;let v=0;const g=new ReadableStream({start(p){x();function x(){u.read().then(({done:T,value:_})=>{if(T)p.close();else{v+=_.byteLength;const D=new ProgressEvent("progress",{lengthComputable:m,loaded:v,total:f});for(let E=0,R=h.length;E<R;E++){const w=h[E];w.onProgress&&w.onProgress(D)}p.enqueue(_),x()}},T=>{p.error(T)})}}});return new Response(g)}else throw new rx(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(m=>f.decode(m))}}}).then(c=>{vi.add(e,c);const h=$n[e];delete $n[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=$n[e];if(h===void 0)throw this.manager.itemError(e),c;delete $n[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class ax extends qi{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=vi.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a;const o=vr("img");function l(){h(),vi.add(e,this),t&&t(this),s.manager.itemEnd(e)}function c(u){h(),i&&i(u),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}}class ox extends qi{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new Xi,o=new gc(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(s.withCredentials),o.load(e,function(l){let c;try{c=s.parse(l)}catch(h){if(i!==void 0)i(h);else{console.error(h);return}}c.image!==void 0?a.image=c.image:c.data!==void 0&&(a.image.width=c.width,a.image.height=c.height,a.image.data=c.data),a.wrapS=c.wrapS!==void 0?c.wrapS:Nn,a.wrapT=c.wrapT!==void 0?c.wrapT:Nn,a.magFilter=c.magFilter!==void 0?c.magFilter:yt,a.minFilter=c.minFilter!==void 0?c.minFilter:yt,a.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(a.colorSpace=c.colorSpace),c.flipY!==void 0&&(a.flipY=c.flipY),c.format!==void 0&&(a.format=c.format),c.type!==void 0&&(a.type=c.type),c.mipmaps!==void 0&&(a.mipmaps=c.mipmaps,a.minFilter=Tn),c.mipmapCount===1&&(a.minFilter=yt),c.generateMipmaps!==void 0&&(a.generateMipmaps=c.generateMipmaps),a.needsUpdate=!0,t&&t(a,c)},n,i),a}}class lx extends qi{constructor(e){super(e)}load(e,t,n,i){const s=new Tt,a=new ax(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}}class Va extends ct{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ue(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class cx extends Va{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Po=new Pe,tu=new A,nu=new A;class vc{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ae(512,512),this.map=null,this.mapPass=null,this.matrix=new Pe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ic,this._frameExtents=new ae(1,1),this._viewportCount=1,this._viewports=[new Ze(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;tu.setFromMatrixPosition(e.matrixWorld),t.position.copy(tu),nu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(nu),t.updateMatrixWorld(),Po.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Po),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Po)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class hx extends vc{constructor(){super(new Xt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=Es*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class ux extends Va{constructor(e,t,n=0,i=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.distance=n,this.angle=i,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new hx}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const iu=new Pe,$s=new A,Do=new A;class dx extends vc{constructor(){super(new Xt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ae(4,2),this._viewportCount=6,this._viewports=[new Ze(2,1,1,1),new Ze(0,1,1,1),new Ze(3,1,1,1),new Ze(1,1,1,1),new Ze(3,0,1,1),new Ze(1,0,1,1)],this._cubeDirections=[new A(1,0,0),new A(-1,0,0),new A(0,0,1),new A(0,0,-1),new A(0,1,0),new A(0,-1,0)],this._cubeUps=[new A(0,1,0),new A(0,1,0),new A(0,1,0),new A(0,1,0),new A(0,0,1),new A(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),$s.setFromMatrixPosition(e.matrixWorld),n.position.copy($s),Do.copy(n.position),Do.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Do),n.updateMatrixWorld(),i.makeTranslation(-$s.x,-$s.y,-$s.z),iu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(iu)}}class vn extends Va{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new dx}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class fx extends vc{constructor(){super(new za(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class _c extends Va{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.shadow=new fx}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class ur{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class px extends qi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=vi.get(e);if(a!==void 0){if(s.manager.itemStart(e),a.then){a.then(c=>{t&&t(c),s.manager.itemEnd(e)}).catch(c=>{i&&i(c)});return}return setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader;const l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return vi.add(e,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){i&&i(c),vi.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});vi.add(e,l),s.manager.itemStart(e)}}class mx{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=su(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=su();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function su(){return performance.now()}class gx{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,s,a;switch(t){case"quaternion":i=this._slerp,s=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,s=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,s=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=s,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,s=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[s+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,s,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,s=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){const l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-s,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let s=n,a=i;s!==a;++s)t[s]=t[i+s%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,s){if(i>=.5)for(let a=0;a!==s;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){jt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,s){const a=this._workIndex*s;jt.multiplyQuaternionsFlat(e,a,e,t,e,n),jt.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,s){const a=1-i;for(let o=0;o!==s;++o){const l=t+o;e[l]=e[l]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,s){for(let a=0;a!==s;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const xc="\\[\\]\\.:\\/",vx=new RegExp("["+xc+"]","g"),yc="[^"+xc+"]",_x="[^"+xc.replace("\\.","")+"]",xx=/((?:WC+[\/:])*)/.source.replace("WC",yc),yx=/(WCOD+)?/.source.replace("WCOD",_x),Mx=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",yc),Tx=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",yc),Sx=new RegExp("^"+xx+yx+Mx+Tx+"$"),bx=["material","materials","bones","map"];class wx{constructor(e,t,n){const i=n||nt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class nt{constructor(e,t,n){this.path=t,this.parsedPath=n||nt.parseTrackName(t),this.node=nt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new nt.Composite(e,t,n):new nt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(vx,"")}static parseTrackName(e){const t=Sx.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const s=n.nodeName.substring(i+1);bx.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let a=0;a<s.length;a++){const o=s[a];if(o.name===t||o.uuid===t)return o;const l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let s=t.propertyIndex;if(e||(e=nt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const a=e[i];if(a===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}nt.Composite=wx;nt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};nt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};nt.prototype.GetterByBindingType=[nt.prototype._getValue_direct,nt.prototype._getValue_array,nt.prototype._getValue_arrayElement,nt.prototype._getValue_toArray];nt.prototype.SetterByBindingTypeAndVersioning=[[nt.prototype._setValue_direct,nt.prototype._setValue_direct_setNeedsUpdate,nt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_array,nt.prototype._setValue_array_setNeedsUpdate,nt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_arrayElement,nt.prototype._setValue_arrayElement_setNeedsUpdate,nt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_fromArray,nt.prototype._setValue_fromArray_setNeedsUpdate,nt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Ex{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const s=t.tracks,a=s.length,o=new Array(a),l={endingStart:ms,endingEnd:ms};for(let c=0;c!==a;++c){const h=s[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=qu,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){const i=this._clip.duration,s=e._clip.duration,a=s/i,o=i/s;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,s=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const l=o.parameterPositions,c=o.sampleValues;return l[0]=s,l[1]=s+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const s=this._startTime;if(s!==null){const l=(e-s)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case Ff:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case ec:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,s=this._loopCount;const a=n===kf;if(e===0)return s===-1?i:a&&(s&1)===1?t-i:i;if(n===Xu){s===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(s===-1&&(e>=0?(s=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,s+=Math.abs(o);const l=this.repetitions-s;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){const c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=s,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(s&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=gs,i.endingEnd=gs):(e?i.endingStart=this.zeroSlopeAtStart?gs:ms:i.endingStart=Ea,t?i.endingEnd=this.zeroSlopeAtEnd?gs:ms:i.endingEnd=Ea)}_scheduleFading(e,t,n){const i=this._mixer,s=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,l=a.sampleValues;return o[0]=s,l[0]=t,o[1]=s+e,l[1]=n,this}}const Ax=new Float32Array(1);class Rx extends Wi{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,s=i.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==s;++u){const d=i[u],f=d.name;let m=h[f];if(m!==void 0)++m.referenceCount,a[u]=m;else{if(m=a[u],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,l,f));continue}const v=t&&t._propertyBindings[u].binding.parsedPath;m=new gx(nt.create(n,f,v),d.ValueTypeName,d.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,l,f),a[u]=m}o[u].resultBuffer=m.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,s=this._actionsByClip[i];this._bindAction(e,s&&s.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];s.useCount++===0&&(this._lendBinding(s),s.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.useCount===0&&(s.restoreOriginalState(),this._takeBackBinding(s))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,s=this._actionsByClip;let a=s[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,s[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const s=e._clip.uuid,a=this._actionsByClip,o=a[s],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;const u=o.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],l.length===0&&delete a[s],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.referenceCount===0&&this._removeInactiveBinding(s)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,s=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=s.length,s.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,s=n.path,a=this._bindingsByRootAndName,o=a[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[s],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new xd(new Float32Array(2),new Float32Array(2),1,Ax),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,s=t[i];e.__cacheIndex=i,t[i]=e,s.__cacheIndex=n,t[n]=s}clipAction(e,t,n){const i=t||this._root,s=i.uuid;let a=typeof e=="string"?Ul.findByName(i,e):e;const o=a!==null?a.uuid:e,l=this._actionsByClip[o];let c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=ec),l!==void 0){const u=l.actionByRoot[s];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;const h=new Ex(this,a,t,n);return this._bindAction(h,c),this._addInactiveAction(h,o,s),h}existingAction(e,t){const n=t||this._root,i=n.uuid,s=typeof e=="string"?Ul.findByName(n,e):e,a=s?s.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,s=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,s,a);const o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,s=i[n];if(s!==void 0){const a=s.knownActions;for(let o=0,l=a.length;o!==l;++o){const c=a[o];this._deactivateAction(c);const h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}const i=this._bindingsByRootAndName,s=i[t];if(s!==void 0)for(const a in s){const o=s[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Xl}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Xl);const dr={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class ji{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Cx=new za(-1,1,1,-1,0,1);class Px extends gt{constructor(){super(),this.setAttribute("position",new je([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new je([0,2,0,0,2,0],2))}}const Dx=new Px;class Ga{constructor(e){this._mesh=new Oe(Dx,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Cx)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Md extends ji{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof pt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=yn.clone(e.uniforms),this.material=new pt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new Ga(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class ru extends ji{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const i=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),s.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),s.buffers.stencil.setClear(o),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(i.EQUAL,1,4294967295),s.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),s.buffers.stencil.setLocked(!0)}}class Ix extends ji{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Lx{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new ae);this._width=n.width,this._height=n.height,t=new Qt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Bt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Md(dr),this.copyPass.material.blending=Dt,this.clock=new mx}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let i=0,s=this.passes.length;i<s;i++){const a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}ru!==void 0&&(a instanceof ru?n=!0:a instanceof Ix&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new ae);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Nx extends ji{constructor(e,t,n=null,i=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new ue}render(e,t,n){const i=e.autoClear;e.autoClear=!1;let s,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=i}}const Ux={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new ue(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Ds extends ji{constructor(e,t,n,i){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=i,this.resolution=e!==void 0?new ae(e.x,e.y):new ae(256,256),this.clearColor=new ue(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Qt(s,a,{type:Bt}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const d=new Qt(s,a,{type:Bt});d.texture.name="UnrealBloomPass.h"+u,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const f=new Qt(s,a,{type:Bt});f.texture.name="UnrealBloomPass.v"+u,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),s=Math.round(s/2),a=Math.round(a/2)}const o=Ux;this.highPassUniforms=yn.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new pt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];s=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new ae(1/s,1/a),s=Math.round(s/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=dr;this.copyUniforms=yn.clone(h.uniforms),this.blendMaterial=new pt({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:Ln,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new ue,this.oldClearAlpha=1,this.basic=new ft,this.fsQuad=new Ga(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(n,i);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,i),this.renderTargetsVertical[s].setSize(n,i),this.separableBlurMaterials[s].uniforms.invSize.value=new ae(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(e,t,n,i,s){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=Ds.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Ds.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=a}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new pt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new ae(.5,.5)},direction:{value:new ae(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(e){return new pt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}Ds.BlurDirectionX=new ae(1,0);Ds.BlurDirectionY=new ae(0,1);const kx={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class Fx extends ji{constructor(){super();const e=kx;this.uniforms=yn.clone(e.uniforms),this.material=new $_({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new Ga(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},qe.getTransfer(this._outputColorSpace)===st&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Cu?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Pu?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Du?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===ql?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Iu?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Lu&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const aa={defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new ae},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Pe},cameraProjectionMatrixInverse:{value:new Pe},cameraWorldMatrix:{value:new Pe},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new A(-1,-1,-1)},sceneBoxMax:{value:new A(1,1,1)}},vertexShader:`

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
		}`},oa={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
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

		}`},Io={uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
		}`};function Ox(r=5){const e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=Bx(e),n=t.length,i=new Uint8Array(n*4);for(let a=0;a<n;++a){const o=t[a],l=2*Math.PI*o/n,c=new A(Math.cos(l),Math.sin(l),0).normalize();i[a*4]=(c.x*.5+.5)*255,i[a*4+1]=(c.y*.5+.5)*255,i[a*4+2]=127,i[a*4+3]=255}const s=new Xi(i,e,e);return s.wrapS=bn,s.wrapT=bn,s.needsUpdate=!0,s}function Bx(r){const e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=e*e,n=Array(t).fill(0);let i=Math.floor(e/2),s=e-1;for(let a=1;a<=t;){if(i===-1&&s===e?(s=e-2,i=0):(s===e&&(s=0),i<0&&(i=e-1)),n[i*e+s]!==0){s-=2,i++;continue}else n[i*e+s]=a++;s++,i--}return n}const la={defines:{SAMPLES:16,SAMPLE_VECTORS:Td(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new ae},cameraProjectionMatrixInverse:{value:new Pe},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function Td(r,e,t){const n=zx(r,e,t);let i="vec3[SAMPLES](";for(let s=0;s<r;s++){const a=n[s];i+=`vec3(${a.x}, ${a.y}, ${a.z})${s<r-1?",":")"}`}return i}function zx(r,e,t){const n=[];for(let i=0;i<r;i++){const s=2*Math.PI*e*i/r,a=Math.pow(i/(r-1),t);n.push(new A(Math.cos(s),Math.sin(s),a))}return n}class Hx{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(e,t,n){return e[0]*t+e[1]*n}dot3(e,t,n,i){return e[0]*t+e[1]*n+e[2]*i}dot4(e,t,n,i,s){return e[0]*t+e[1]*n+e[2]*i+e[3]*s}noise(e,t){let n,i,s;const a=.5*(Math.sqrt(3)-1),o=(e+t)*a,l=Math.floor(e+o),c=Math.floor(t+o),h=(3-Math.sqrt(3))/6,u=(l+c)*h,d=l-u,f=c-u,m=e-d,v=t-f;let g,p;m>v?(g=1,p=0):(g=0,p=1);const x=m-g+h,T=v-p+h,_=m-1+2*h,D=v-1+2*h,E=l&255,R=c&255,w=this.perm[E+this.perm[R]]%12,M=this.perm[E+g+this.perm[R+p]]%12,y=this.perm[E+1+this.perm[R+1]]%12;let C=.5-m*m-v*v;C<0?n=0:(C*=C,n=C*C*this.dot(this.grad3[w],m,v));let L=.5-x*x-T*T;L<0?i=0:(L*=L,i=L*L*this.dot(this.grad3[M],x,T));let I=.5-_*_-D*D;return I<0?s=0:(I*=I,s=I*I*this.dot(this.grad3[y],_,D)),70*(n+i+s)}noise3d(e,t,n){let i,s,a,o;const c=(e+t+n)*.3333333333333333,h=Math.floor(e+c),u=Math.floor(t+c),d=Math.floor(n+c),f=1/6,m=(h+u+d)*f,v=h-m,g=u-m,p=d-m,x=e-v,T=t-g,_=n-p;let D,E,R,w,M,y;x>=T?T>=_?(D=1,E=0,R=0,w=1,M=1,y=0):x>=_?(D=1,E=0,R=0,w=1,M=0,y=1):(D=0,E=0,R=1,w=1,M=0,y=1):T<_?(D=0,E=0,R=1,w=0,M=1,y=1):x<_?(D=0,E=1,R=0,w=0,M=1,y=1):(D=0,E=1,R=0,w=1,M=1,y=0);const C=x-D+f,L=T-E+f,I=_-R+f,O=x-w+2*f,V=T-M+2*f,B=_-y+2*f,$=x-1+3*f,G=T-1+3*f,H=_-1+3*f,K=h&255,Q=u&255,se=d&255,Me=this.perm[K+this.perm[Q+this.perm[se]]]%12,j=this.perm[K+D+this.perm[Q+E+this.perm[se+R]]]%12,te=this.perm[K+w+this.perm[Q+M+this.perm[se+y]]]%12,le=this.perm[K+1+this.perm[Q+1+this.perm[se+1]]]%12;let ie=.6-x*x-T*T-_*_;ie<0?i=0:(ie*=ie,i=ie*ie*this.dot3(this.grad3[Me],x,T,_));let de=.6-C*C-L*L-I*I;de<0?s=0:(de*=de,s=de*de*this.dot3(this.grad3[j],C,L,I));let fe=.6-O*O-V*V-B*B;fe<0?a=0:(fe*=fe,a=fe*fe*this.dot3(this.grad3[te],O,V,B));let _e=.6-$*$-G*G-H*H;return _e<0?o=0:(_e*=_e,o=_e*_e*this.dot3(this.grad3[le],$,G,H)),32*(i+s+a+o)}noise4d(e,t,n,i){const s=this.grad4,a=this.simplex,o=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20;let h,u,d,f,m;const v=(e+t+n+i)*l,g=Math.floor(e+v),p=Math.floor(t+v),x=Math.floor(n+v),T=Math.floor(i+v),_=(g+p+x+T)*c,D=g-_,E=p-_,R=x-_,w=T-_,M=e-D,y=t-E,C=n-R,L=i-w,I=M>y?32:0,O=M>C?16:0,V=y>C?8:0,B=M>L?4:0,$=y>L?2:0,G=C>L?1:0,H=I+O+V+B+$+G,K=a[H][0]>=3?1:0,Q=a[H][1]>=3?1:0,se=a[H][2]>=3?1:0,Me=a[H][3]>=3?1:0,j=a[H][0]>=2?1:0,te=a[H][1]>=2?1:0,le=a[H][2]>=2?1:0,ie=a[H][3]>=2?1:0,de=a[H][0]>=1?1:0,fe=a[H][1]>=1?1:0,_e=a[H][2]>=1?1:0,Je=a[H][3]>=1?1:0,Be=M-K+c,Qe=y-Q+c,U=C-se+c,vt=L-Me+c,Fe=M-j+2*c,Ne=y-te+2*c,Ae=C-le+2*c,$e=L-ie+2*c,Te=M-de+3*c,P=y-fe+3*c,S=C-_e+3*c,z=L-Je+3*c,Z=M-1+4*c,ee=y-1+4*c,Y=C-1+4*c,Se=L-1+4*c,ce=g&255,pe=p&255,Ge=x&255,ne=T&255,xe=o[ce+o[pe+o[Ge+o[ne]]]]%32,De=o[ce+K+o[pe+Q+o[Ge+se+o[ne+Me]]]]%32,Ie=o[ce+j+o[pe+te+o[Ge+le+o[ne+ie]]]]%32,ye=o[ce+de+o[pe+fe+o[Ge+_e+o[ne+Je]]]]%32,Xe=o[ce+1+o[pe+1+o[Ge+1+o[ne+1]]]]%32;let Le=.6-M*M-y*y-C*C-L*L;Le<0?h=0:(Le*=Le,h=Le*Le*this.dot4(s[xe],M,y,C,L));let Ye=.6-Be*Be-Qe*Qe-U*U-vt*vt;Ye<0?u=0:(Ye*=Ye,u=Ye*Ye*this.dot4(s[De],Be,Qe,U,vt));let N=.6-Fe*Fe-Ne*Ne-Ae*Ae-$e*$e;N<0?d=0:(N*=N,d=N*N*this.dot4(s[Ie],Fe,Ne,Ae,$e));let oe=.6-Te*Te-P*P-S*S-z*z;oe<0?f=0:(oe*=oe,f=oe*oe*this.dot4(s[ye],Te,P,S,z));let q=.6-Z*Z-ee*ee-Y*Y-Se*Se;return q<0?m=0:(q*=q,m=q*q*this.dot4(s[Xe],Z,ee,Y,Se)),27*(h+u+d+f+m)}}class Cn extends ji{constructor(e,t,n,i,s,a,o){super(),this.width=n!==void 0?n:512,this.height=i!==void 0?i:512,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=new Map,this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Ox(),this.pdNoiseTexture=this.generateNoise(),this.gtaoRenderTarget=new Qt(this.width,this.height,{type:Bt}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new pt({defines:Object.assign({},aa.defines),uniforms:yn.clone(aa.uniforms),vertexShader:aa.vertexShader,fragmentShader:aa.fragmentShader,blending:Dt,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Y_,this.normalMaterial.blending=Dt,this.pdMaterial=new pt({defines:Object.assign({},la.defines),uniforms:yn.clone(la.uniforms),vertexShader:la.vertexShader,fragmentShader:la.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new pt({defines:Object.assign({},oa.defines),uniforms:yn.clone(oa.uniforms),vertexShader:oa.vertexShader,fragmentShader:oa.fragmentShader,blending:Dt}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new pt({uniforms:yn.clone(dr.uniforms),vertexShader:dr.vertexShader,fragmentShader:dr.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:qo,blendDst:Qs,blendEquation:_n,blendSrcAlpha:Xo,blendDstAlpha:Qs,blendEquationAlpha:_n}),this.blendMaterial=new pt({uniforms:yn.clone(Io.uniforms),vertexShader:Io.vertexShader,fragmentShader:Io.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Au,blendSrc:qo,blendDst:Qs,blendEquation:_n,blendSrcAlpha:Xo,blendDstAlpha:Qs,blendEquationAlpha:_n}),this.fsQuad=new Ga(null),this.originalClearColor=new ue,this.setGBuffer(s?s.depthTexture:void 0,s?s.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),o!==void 0&&this.updatePdMaterial(o)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new rc,this.depthTexture.format=Vi,this.depthTexture.type=Hi,this.normalRenderTarget=new Qt(this.width,this.height,{minFilter:Lt,magFilter:Lt,type:Bt,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);const n=this.normalTexture?1:0,i=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Td(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,n){switch(this._renderGBuffer&&(this.overrideVisibility(),this.renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this.renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case Cn.OUTPUT.Off:break;case Cn.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Dt,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case Cn.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=Dt,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case Cn.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=Dt,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case Cn.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case Cn.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=Dt,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case Cn.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Dt,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}renderPass(e,t,n,i,s){e.getClearColor(this.originalClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,i!=null&&(e.setClearColor(i),e.setClearAlpha(s||0),e.clear()),this.fsQuad.material=t,this.fsQuad.render(e),e.autoClear=o,e.setClearColor(this.originalClearColor),e.setClearAlpha(a)}renderOverride(e,t,n,i,s){e.getClearColor(this.originalClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,i=t.clearColor||i,s=t.clearAlpha||s,i!=null&&(e.setClearColor(i),e.setClearAlpha(s||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this.originalClearColor),e.setClearAlpha(a)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}overrideVisibility(){const e=this.scene,t=this._visibilityCache;e.traverse(function(n){t.set(n,n.visible),(n.isPoints||n.isLine)&&(n.visible=!1)})}restoreVisibility(){const e=this.scene,t=this._visibilityCache;e.traverse(function(n){const i=t.get(n);n.visible=i}),t.clear()}generateNoise(e=64){const t=new Hx,n=e*e*4,i=new Uint8Array(n);for(let a=0;a<e;a++)for(let o=0;o<e;o++){const l=a,c=o;i[(a*e+o)*4]=(t.noise(l,c)*.5+.5)*255,i[(a*e+o)*4+1]=(t.noise(l+e,c)*.5+.5)*255,i[(a*e+o)*4+2]=(t.noise(l,c+e)*.5+.5)*255,i[(a*e+o)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}const s=new Xi(i,e,e,qt,Un);return s.wrapS=bn,s.wrapT=bn,s.needsUpdate=!0,s}}Cn.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};class Vx extends ox{constructor(e){super(e),this.type=Bt}parse(e){const a=function(w,M){switch(w){case 1:throw new Error("THREE.RGBELoader: Read Error: "+(M||""));case 2:throw new Error("THREE.RGBELoader: Write Error: "+(M||""));case 3:throw new Error("THREE.RGBELoader: Bad File Format: "+(M||""));default:case 4:throw new Error("THREE.RGBELoader: Memory Error: "+(M||""))}},h=`
`,u=function(w,M,y){M=M||1024;let L=w.pos,I=-1,O=0,V="",B=String.fromCharCode.apply(null,new Uint16Array(w.subarray(L,L+128)));for(;0>(I=B.indexOf(h))&&O<M&&L<w.byteLength;)V+=B,O+=B.length,L+=128,B+=String.fromCharCode.apply(null,new Uint16Array(w.subarray(L,L+128)));return-1<I?(w.pos+=O+I+1,V+B.slice(0,I)):!1},d=function(w){const M=/^#\?(\S+)/,y=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,C=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,L=/^\s*FORMAT=(\S+)\s*$/,I=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,O={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0};let V,B;for((w.pos>=w.byteLength||!(V=u(w)))&&a(1,"no header found"),(B=V.match(M))||a(3,"bad initial token"),O.valid|=1,O.programtype=B[1],O.string+=V+`
`;V=u(w),V!==!1;){if(O.string+=V+`
`,V.charAt(0)==="#"){O.comments+=V+`
`;continue}if((B=V.match(y))&&(O.gamma=parseFloat(B[1])),(B=V.match(C))&&(O.exposure=parseFloat(B[1])),(B=V.match(L))&&(O.valid|=2,O.format=B[1]),(B=V.match(I))&&(O.valid|=4,O.height=parseInt(B[1],10),O.width=parseInt(B[2],10)),O.valid&2&&O.valid&4)break}return O.valid&2||a(3,"missing format specifier"),O.valid&4||a(3,"missing image size specifier"),O},f=function(w,M,y){const C=M;if(C<8||C>32767||w[0]!==2||w[1]!==2||w[2]&128)return new Uint8Array(w);C!==(w[2]<<8|w[3])&&a(3,"wrong scanline width");const L=new Uint8Array(4*M*y);L.length||a(4,"unable to allocate buffer space");let I=0,O=0;const V=4*C,B=new Uint8Array(4),$=new Uint8Array(V);let G=y;for(;G>0&&O<w.byteLength;){O+4>w.byteLength&&a(1),B[0]=w[O++],B[1]=w[O++],B[2]=w[O++],B[3]=w[O++],(B[0]!=2||B[1]!=2||(B[2]<<8|B[3])!=C)&&a(3,"bad rgbe scanline format");let H=0,K;for(;H<V&&O<w.byteLength;){K=w[O++];const se=K>128;if(se&&(K-=128),(K===0||H+K>V)&&a(3,"bad scanline data"),se){const Me=w[O++];for(let j=0;j<K;j++)$[H++]=Me}else $.set(w.subarray(O,O+K),H),H+=K,O+=K}const Q=C;for(let se=0;se<Q;se++){let Me=0;L[I]=$[se+Me],Me+=C,L[I+1]=$[se+Me],Me+=C,L[I+2]=$[se+Me],Me+=C,L[I+3]=$[se+Me],I+=4}G--}return L},m=function(w,M,y,C){const L=w[M+3],I=Math.pow(2,L-128)/255;y[C+0]=w[M+0]*I,y[C+1]=w[M+1]*I,y[C+2]=w[M+2]*I,y[C+3]=1},v=function(w,M,y,C){const L=w[M+3],I=Math.pow(2,L-128)/255;y[C+0]=kr.toHalfFloat(Math.min(w[M+0]*I,65504)),y[C+1]=kr.toHalfFloat(Math.min(w[M+1]*I,65504)),y[C+2]=kr.toHalfFloat(Math.min(w[M+2]*I,65504)),y[C+3]=kr.toHalfFloat(1)},g=new Uint8Array(e);g.pos=0;const p=d(g),x=p.width,T=p.height,_=f(g.subarray(g.pos),x,T);let D,E,R;switch(this.type){case Zt:R=_.length/4;const w=new Float32Array(R*4);for(let y=0;y<R;y++)m(_,y*4,w,y*4);D=w,E=Zt;break;case Bt:R=_.length/4;const M=new Uint16Array(R*4);for(let y=0;y<R;y++)v(_,y*4,M,y*4);D=M,E=Bt;break;default:throw new Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:x,height:T,data:D,header:p.string,gamma:p.gamma,exposure:p.exposure,type:E}}setDataType(e){return this.type=e,this}load(e,t,n,i){function s(a,o){switch(a.type){case Zt:case Bt:a.colorSpace=Ht,a.minFilter=yt,a.magFilter=yt,a.generateMipmaps=!1,a.flipY=!0;break}t&&t(a,o)}return super.load(e,s,n,i)}}function au(r,e){if(e===Of)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),r;if(e===Al||e===ju){let t=r.getIndex();if(t===null){const a=[],o=r.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);r.setIndex(a),t=r.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),r}const n=t.count-2,i=[];if(e===Al)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=r.clone();return s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),r}class Gx extends qi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new $x(t)}),this.register(function(t){return new Yx(t)}),this.register(function(t){return new sy(t)}),this.register(function(t){return new ry(t)}),this.register(function(t){return new ay(t)}),this.register(function(t){return new Zx(t)}),this.register(function(t){return new Jx(t)}),this.register(function(t){return new Qx(t)}),this.register(function(t){return new ey(t)}),this.register(function(t){return new jx(t)}),this.register(function(t){return new ty(t)}),this.register(function(t){return new Kx(t)}),this.register(function(t){return new iy(t)}),this.register(function(t){return new ny(t)}),this.register(function(t){return new Xx(t)}),this.register(function(t){return new oy(t)}),this.register(function(t){return new ly(t)})}load(e,t,n,i){const s=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const c=ur.extractUrlBase(e);a=ur.resolveURL(c,this.path)}else a=ur.extractUrlBase(e);this.manager.itemStart(e);const o=function(c){i?i(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new gc(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,a,function(h){t(h),s.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let s;const a={},o={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Sd){try{a[We.KHR_BINARY_GLTF]=new cy(e)}catch(u){i&&i(u);return}s=JSON.parse(a[We.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new Ty(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(s.extensionsUsed)for(let h=0;h<s.extensionsUsed.length;++h){const u=s.extensionsUsed[h],d=s.extensionsRequired||[];switch(u){case We.KHR_MATERIALS_UNLIT:a[u]=new qx;break;case We.KHR_DRACO_MESH_COMPRESSION:a[u]=new hy(s,this.dracoLoader);break;case We.KHR_TEXTURE_TRANSFORM:a[u]=new uy;break;case We.KHR_MESH_QUANTIZATION:a[u]=new dy;break;default:d.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function Wx(){let r={};return{get:function(e){return r[e]},add:function(e,t){r[e]=t},remove:function(e){delete r[e]},removeAll:function(){r={}}}}const We={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Xx{constructor(e){this.parser=e,this.name=We.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const s=t.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e];let c;const h=new ue(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Ht);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new _c(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new vn(h),c.distance=u;break;case"spot":c=new ux(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,Zn(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,s=n.json.nodes[e],o=(s.extensions&&s.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}}class qx{constructor(){this.name=We.KHR_MATERIALS_UNLIT}getMaterialType(){return ft}extendParams(e,t,n){const i=[];e.color=new ue(1,1,1),e.opacity=1;const s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const a=s.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Ht),e.opacity=a[3]}s.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",s.baseColorTexture,dt))}return Promise.all(i)}}class jx{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}}class $x{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ae(o,o)}return Promise.all(s)}}class Yx{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class Kx{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(s)}}class Zx{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[];t.sheenColor=new ue(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Ht)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,dt)),a.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(s)}}class Jx{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(s)}}class Qx{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new ue().setRGB(o[0],o[1],o[2],Ht),Promise.all(s)}}class ey{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class ty{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new ue().setRGB(o[0],o[1],o[2],Ht),a.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,dt)),Promise.all(s)}}class ny{constructor(e){this.parser=e,this.name=We.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(s)}}class iy{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(s)}}class sy{constructor(e){this.parser=e,this.name=We.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const s=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,a)}}class ry{constructor(e){this.parser=e,this.name=We.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,a.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class ay{constructor(e){this.parser=e,this.name=We.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,a.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class oy{constructor(e){this.name=We.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(o){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):a.ready.then(function(){const f=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}}class ly{constructor(e){this.name=We.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==ln.TRIANGLES&&c.mode!==ln.TRIANGLE_STRIP&&c.mode!==ln.TRIANGLE_FAN&&c.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],l={};for(const c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{const h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,f=[];for(const m of u){const v=new Pe,g=new A,p=new jt,x=new A(1,1,1),T=new lr(m.geometry,m.material,d);for(let _=0;_<d;_++)l.TRANSLATION&&g.fromBufferAttribute(l.TRANSLATION,_),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,_),l.SCALE&&x.fromBufferAttribute(l.SCALE,_),T.setMatrixAt(_,v.compose(g,p,x));for(const _ in l)if(_==="_COLOR_0"){const D=l[_];T.instanceColor=new Ll(D.array,D.itemSize,D.normalized)}else _!=="TRANSLATION"&&_!=="ROTATION"&&_!=="SCALE"&&m.geometry.setAttribute(_,l[_]);ct.prototype.copy.call(T,m),this.parser.assignFinalMaterial(T),f.push(T)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}}const Sd="glTF",Ys=12,ou={JSON:1313821514,BIN:5130562};class cy{constructor(e){this.name=We.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Ys),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Sd)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-Ys,s=new DataView(e,Ys);let a=0;for(;a<i;){const o=s.getUint32(a,!0);a+=4;const l=s.getUint32(a,!0);if(a+=4,l===ou.JSON){const c=new Uint8Array(e,Ys+a,o);this.content=n.decode(c)}else if(l===ou.BIN){const c=Ys+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class hy{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=We.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(const h in a){const u=kl[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=kl[h]||h.toLowerCase();if(a[h]!==void 0){const d=n.accessors[e.attributes[h]],f=Ts[d.componentType];c[u]=f.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",s).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(const m in f.attributes){const v=f.attributes[m],g=l[m];g!==void 0&&(v.normalized=g)}u(f)},o,c,Ht,d)})})}}class uy{constructor(){this.name=We.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class dy{constructor(){this.name=We.KHR_MESH_QUANTIZATION}}class bd extends yr{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[s+a];return t}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,m=e*c,v=m-c,g=-2*f+3*d,p=f-d,x=1-g,T=p-d+u;for(let _=0;_!==o;_++){const D=a[v+_+o],E=a[v+_+l]*h,R=a[m+_+o],w=a[m+_]*h;s[_]=x*D+T*E+g*R+p*w}return s}}const fy=new jt;class py extends bd{interpolate_(e,t,n,i){const s=super.interpolate_(e,t,n,i);return fy.fromArray(s).normalize().toArray(s),s}}const ln={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Ts={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},lu={9728:Lt,9729:yt,9984:Uu,9985:fa,9986:er,9987:Tn},cu={33071:Nn,33648:wa,10497:bn},Lo={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},kl={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},pi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},my={CUBICSPLINE:void 0,LINEAR:gr,STEP:mr},No={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function gy(r){return r.DefaultMaterial===void 0&&(r.DefaultMaterial=new Rt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ni})),r.DefaultMaterial}function Pi(r,e,t){for(const n in t.extensions)r[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Zn(r,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(r.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function vy(r,e,t){let n=!1,i=!1,s=!1;for(let c=0,h=e.length;c<h;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(s=!0),n&&i&&s)break}if(!n&&!i&&!s)return Promise.resolve(r);const a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){const u=e[c];if(n){const d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):r.attributes.position;a.push(d)}if(i){const d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):r.attributes.normal;o.push(d)}if(s){const d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):r.attributes.color;l.push(d)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){const h=c[0],u=c[1],d=c[2];return n&&(r.morphAttributes.position=h),i&&(r.morphAttributes.normal=u),s&&(r.morphAttributes.color=d),r.morphTargetsRelative=!0,r})}function _y(r,e){if(r.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)r.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(r.morphTargetInfluences.length===t.length){r.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)r.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function xy(r){let e;const t=r.extensions&&r.extensions[We.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Uo(t.attributes):e=r.indices+":"+Uo(r.attributes)+":"+r.mode,r.targets!==void 0)for(let n=0,i=r.targets.length;n<i;n++)e+=":"+Uo(r.targets[n]);return e}function Uo(r){let e="";const t=Object.keys(r).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+r[t[n]]+";";return e}function Fl(r){switch(r){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function yy(r){return r.search(/\.jpe?g($|\?)/i)>0||r.search(/^data\:image\/jpeg/)===0?"image/jpeg":r.search(/\.webp($|\?)/i)>0||r.search(/^data\:image\/webp/)===0?"image/webp":r.search(/\.ktx2($|\?)/i)>0||r.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const My=new Pe;class Ty{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Wx,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,s=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const l=o.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,s=o.indexOf("Firefox")>-1,a=s?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||s&&a<98?this.textureLoader=new lx(this.options.manager):this.textureLoader=new px(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new gc(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return Pi(s,o,i),Zn(o,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(const l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){const a=t[i].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let i=0,s=e.length;i<s;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),s=(a,o)=>{const l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(const[c,h]of a.children.entries())s(h,o.children[c])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const s=e(t[i]);s&&n.push(s)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[We.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(s,a){n.load(ur.resolveURL(t.uri,i.path),s,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Lo[i.type],o=Ts[i.componentType],l=i.normalized===!0,c=new o(i.count*a);return Promise.resolve(new St(c,a,l))}const s=[];return i.bufferView!==void 0?s.push(this.getDependency("bufferView",i.bufferView)):s.push(null),i.sparse!==void 0&&(s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(s).then(function(a){const o=a[0],l=Lo[i.type],c=Ts[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,m=i.normalized===!0;let v,g;if(f&&f!==u){const p=Math.floor(d/f),x="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let T=t.cache.get(x);T||(v=new c(o,p*f,i.count*f/h),T=new hd(v,f/h),t.cache.add(x,T)),g=new _r(T,l,d%f/h,m)}else o===null?v=new c(i.count*l):v=new c(o,d,i.count*l),g=new St(v,l,m);if(i.sparse!==void 0){const p=Lo.SCALAR,x=Ts[i.sparse.indices.componentType],T=i.sparse.indices.byteOffset||0,_=i.sparse.values.byteOffset||0,D=new x(a[1],T,i.sparse.count*p),E=new c(a[2],_,i.sparse.count*l);o!==null&&(g=new St(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let R=0,w=D.length;R<w;R++){const M=D[R];if(g.setX(M,E[R*l]),l>=2&&g.setY(M,E[R*l+1]),l>=3&&g.setZ(M,E[R*l+2]),l>=4&&g.setW(M,E[R*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=m}return g})}loadTexture(e){const t=this.json,n=this.options,s=t.textures[e].source,a=t.images[s];let o=this.textureLoader;if(a.uri){const l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,s,o)}loadTextureImage(e,t,n){const i=this,s=this.json,a=s.textures[e],o=s.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const d=(s.samplers||{})[a.sampler]||{};return h.magFilter=lu[d.magFilter]||yt,h.minFilter=lu[d.minFilter]||Tn,h.wrapS=cu[d.wrapS]||bn,h.wrapT=cu[d.wrapT]||bn,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Lt&&h.minFilter!==yt,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const a=i.images[e],o=self.URL||self.webkitURL;let l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(u){c=!0;const d=new Blob([u],{type:a.mimeType});return l=o.createObjectURL(d),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(u){return new Promise(function(d,f){let m=d;t.isImageBitmapLoader===!0&&(m=function(v){const g=new Tt(v);g.needsUpdate=!0,d(g)}),t.load(ur.resolveURL(u,s.path),m,void 0,f)})}).then(function(u){return c===!0&&o.revokeObjectURL(l),Zn(u,a),u.userData.mimeType=a.mimeType||yy(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const s=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),s.extensions[We.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[We.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const l=s.associations.get(a);a=s.extensions[We.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),s.associations.set(a,l)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new cc,un.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new pd,un.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(i||s||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),s&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),s&&(l.vertexColors=!0),a&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Rt}loadMaterial(e){const t=this,n=this.json,i=this.extensions,s=n.materials[e];let a;const o={},l=s.extensions||{},c=[];if(l[We.KHR_MATERIALS_UNLIT]){const u=i[We.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,s,t))}else{const u=s.pbrMetallicRoughness||{};if(o.color=new ue(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;o.color.setRGB(d[0],d[1],d[2],Ht),o.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,dt)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,o)})))}s.doubleSided===!0&&(o.side=xt);const h=s.alphaMode||No.OPAQUE;if(h===No.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===No.MASK&&(o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&a!==ft&&(c.push(t.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new ae(1,1),s.normalTexture.scale!==void 0)){const u=s.normalTexture.scale;o.normalScale.set(u,u)}if(s.occlusionTexture!==void 0&&a!==ft&&(c.push(t.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&a!==ft){const u=s.emissiveFactor;o.emissive=new ue().setRGB(u[0],u[1],u[2],Ht)}return s.emissiveTexture!==void 0&&a!==ft&&c.push(t.assignTexture(o,"emissiveMap",s.emissiveTexture,dt)),Promise.all(c).then(function(){const u=new a(o);return s.name&&(u.name=s.name),Zn(u,s),t.associations.set(u,{materials:e}),s.extensions&&Pi(i,u,s),u})}createUniqueName(e){const t=nt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function s(o){return n[We.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return hu(l,o,t)})}const a=[];for(let o=0,l=e.length;o<l;o++){const c=e[o],h=xy(c),u=i[h];if(u)a.push(u.promise);else{let d;c.extensions&&c.extensions[We.KHR_DRACO_MESH_COMPRESSION]?d=s(c):d=hu(new gt,c,t),i[h]={primitive:c,promise:d},a.push(d)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,s=n.meshes[e],a=s.primitives,o=[];for(let l=0,c=a.length;l<c;l++){const h=a[l].material===void 0?gy(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let f=0,m=h.length;f<m;f++){const v=h[f],g=a[f];let p;const x=c[f];if(g.mode===ln.TRIANGLES||g.mode===ln.TRIANGLE_STRIP||g.mode===ln.TRIANGLE_FAN||g.mode===void 0)p=s.isSkinnedMesh===!0?new R_(v,x):new Oe(v,x),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),g.mode===ln.TRIANGLE_STRIP?p.geometry=au(p.geometry,ju):g.mode===ln.TRIANGLE_FAN&&(p.geometry=au(p.geometry,Al));else if(g.mode===ln.LINES)p=new D_(v,x);else if(g.mode===ln.LINE_STRIP)p=new lc(v,x);else if(g.mode===ln.LINE_LOOP)p=new I_(v,x);else if(g.mode===ln.POINTS)p=new hc(v,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(p.geometry.morphAttributes).length>0&&_y(p,s),p.name=t.createUniqueName(s.name||"mesh_"+e),Zn(p,s),g.extensions&&Pi(i,p,g),t.assignFinalMaterial(p),u.push(p)}for(let f=0,m=u.length;f<m;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return s.extensions&&Pi(i,u[0],s),u[0];const d=new It;s.extensions&&Pi(i,d,s),t.associations.set(d,{meshes:e});for(let f=0,m=u.length;f<m;f++)d.add(u[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Xt(Cl.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new za(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Zn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const s=i.pop(),a=i,o=[],l=[];for(let c=0,h=a.length;c<h;c++){const u=a[c];if(u){o.push(u);const d=new Pe;s!==null&&d.fromArray(s.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new oc(o,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){const f=i.channels[u],m=i.samplers[f.sampler],v=f.target,g=v.node,p=i.parameters!==void 0?i.parameters[m.input]:m.input,x=i.parameters!==void 0?i.parameters[m.output]:m.output;v.node!==void 0&&(a.push(this.getDependency("node",g)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",x)),c.push(m),h.push(v))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){const d=u[0],f=u[1],m=u[2],v=u[3],g=u[4],p=[];for(let x=0,T=d.length;x<T;x++){const _=d[x],D=f[x],E=m[x],R=v[x],w=g[x];if(_===void 0)continue;_.updateMatrix&&_.updateMatrix();const M=n._createAnimationTracks(_,D,E,R,w);if(M)for(let y=0;y<M.length;y++)p.push(M[y])}return new Ul(s,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(s){const a=n._getNodeRef(n.meshCache,i.mesh,s);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=i.weights.length;l<c;l++)o.morphTargetInfluences[l]=i.weights[l]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),a=[],o=i.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(a),l]).then(function(c){const h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,My)});for(let f=0,m=u.length;f<m;f++)h.add(u[f]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const s=t.nodes[e],a=s.name?i.createUniqueName(s.name):"",o=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),s.camera!==void 0&&o.push(i.getDependency("camera",s.camera).then(function(c){return i._getNodeRef(i.cameraCache,s.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(s.isBone===!0?h=new fd:c.length>1?h=new It:c.length===1?h=c[0]:h=new ct,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(s.name&&(h.userData.name=s.name,h.name=a),Zn(h,s),s.extensions&&Pi(n,h,s),s.matrix!==void 0){const u=new Pe;u.fromArray(s.matrix),h.applyMatrix4(u)}else s.translation!==void 0&&h.position.fromArray(s.translation),s.rotation!==void 0&&h.quaternion.fromArray(s.rotation),s.scale!==void 0&&h.scale.fromArray(s.scale);return i.associations.has(h)||i.associations.set(h,{}),i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,s=new It;n.name&&(s.name=i.createUniqueName(n.name)),Zn(s,n),n.extensions&&Pi(t,s,n);const a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(i.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++)s.add(l[h]);const c=h=>{const u=new Map;for(const[d,f]of i.associations)(d instanceof un||d instanceof Tt)&&u.set(d,f);return h.traverse(d=>{const f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=c(s),s})}_createAnimationTracks(e,t,n,i,s){const a=[],o=e.name?e.name:e.uuid,l=[];pi[s.path]===pi.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(o);let c;switch(pi[s.path]){case pi.weights:c=Rs;break;case pi.rotation:c=Cs;break;case pi.position:case pi.scale:c=Ps;break;default:switch(n.itemSize){case 1:c=Rs;break;case 2:case 3:default:c=Ps;break}break}const h=i.interpolation!==void 0?my[i.interpolation]:gr,u=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){const m=new c(l[d]+"."+pi[s.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(m),a.push(m)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Fl(t.constructor),i=new Float32Array(t.length);for(let s=0,a=t.length;s<a;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Cs?py:bd;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Sy(r,e,t){const n=e.attributes,i=new wn;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(i.set(new A(l[0],l[1],l[2]),new A(c[0],c[1],c[2])),o.normalized){const h=Fl(Ts[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=e.targets;if(s!==void 0){const o=new A,l=new A;for(let c=0,h=s.length;c<h;c++){const u=s[c];if(u.POSITION!==void 0){const d=t.json.accessors[u.POSITION],f=d.min,m=d.max;if(f!==void 0&&m!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(m[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(m[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(m[2]))),d.normalized){const v=Fl(Ts[d.componentType]);l.multiplyScalar(v)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}r.boundingBox=i;const a=new Fn;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,r.boundingSphere=a}function hu(r,e,t){const n=e.attributes,i=[];function s(a,o){return t.getDependency("accessor",a).then(function(l){r.setAttribute(o,l)})}for(const a in n){const o=kl[a]||a.toLowerCase();o in r.attributes||i.push(s(n[a],o))}if(e.indices!==void 0&&!r.index){const a=t.getDependency("accessor",e.indices).then(function(o){r.setIndex(o)});i.push(a)}return qe.workingColorSpace!==Ht&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${qe.workingColorSpace}" not supported.`),Zn(r,e),Sy(r,e,t),Promise.all(i).then(function(){return e.targets!==void 0?vy(r,e.targets,t):r})}function by(r){const e=new Map,t=new Map,n=r.clone();return wd(r,n,function(i,s){e.set(s,i),t.set(i,s)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const s=i,a=e.get(i),o=a.skeleton.bones;s.skeleton=a.skeleton.clone(),s.bindMatrix.copy(a.bindMatrix),s.skeleton.bones=o.map(function(l){return t.get(l)}),s.bind(s.skeleton,s.bindMatrix)}),n}function wd(r,e,t){t(r,e);for(let n=0;n<r.children.length;n++)wd(r.children[n],e.children[n],t)}const wy=new Gx,ko=new Map,Ey="./models/";let Ol=null,uu=0,du=0;function Ay(r){Ol=r}function Ot(r){if(!ko.has(r)){uu++;const e=wy.loadAsync(Ey+r).then(t=>{t.scene.traverse(i=>{if(i.isMesh){i.castShadow=!0,i.receiveShadow=!0;const s=Array.isArray(i.material)?i.material:[i.material];for(const a of s)a.map&&(a.map.anisotropy=4,a.map.colorSpace=dt),a.roughness!==void 0&&(a.roughness=Math.max(.55,a.roughness),a.metalness=Math.min(a.metalness,.1))}});const n=new wn().setFromObject(t.scene);return t.box=n,t}).finally(()=>{du++,Ol&&Ol(du,uu)});ko.set(r,e)}return ko.get(r)}const Ry={andrew:"Warrior",marco:"Wizard",teresa:"Cleric",rico:"Ranger",andy:"Monk"},Cy={andrew:.46,marco:.46,teresa:.46,rico:.5,andy:.54},Py={shop:["Rogue","#ffd8a0",.44],elder:["Wizard","#f0f0ff",.44],kid:["Rogue","#ffa0c0",.32],guard:["Warrior","#ff9a8a",.46],inn:["Cleric","#ffe0b0",.44],smith:["Monk","#c8a080",.5],trader:["Ranger","#a0d0ff",.44],sage:["Wizard","#c0ffd0",.46],kid2:["Cleric","#ffd0f0",.32]},Dy=r=>`mon_${r.model}.glb`,fu=r=>`hero_${r}.glb`;function ca(r,e,t){const n=by(r.scene);if(t){const c=new ue(t);n.traverse(h=>{if(!h.isMesh)return;const u=d=>{const f=d.clone();return f.color=f.color.clone().multiply(c),f};h.material=Array.isArray(h.material)?h.material.map(u):u(h.material),h.userData.ownMat=!0})}const i=r.box,s=e/Math.max(.01,i.max.y-i.min.y);n.scale.setScalar(s),n.position.y=-i.min.y*s;const a=new It,o=new It;o.add(n),a.add(o);const l=r.animations.length?new Rx(n):null;return{root:a,pivot:o,inst:n,mixer:l,clips:r.animations,state:"",cur:null,h:e}}function ya(r,e){const t=e.toLowerCase();for(const n of r.clips){const i=n.name.toLowerCase();if(i.endsWith("|"+t)||i.endsWith("_"+t)||i===t)return n}for(const n of r.clips)if(n.name.toLowerCase().includes(t))return n;return null}function Ed(r,e,t,n){const i=r.mixer.clipAction(e);return i.reset(),i.setLoop(t?qu:Xu,t?1/0:1),i.clampWhenFinished=!t,i.enabled=!0,i.setEffectiveWeight(1),r.cur&&r.cur!==i&&i.crossFadeFrom(r.cur,n,!1),i.play(),r.cur=i,i}function An(r,e){if(!r.mixer||r.state===e)return;const t=ya(r,e)||ya(r,"idle")||ya(r,"flying");t&&(Ed(r,t,!0,.15),r.state=e)}function on(r,e,t="idle"){if(!r.mixer)return!1;let n=null;for(const i of[].concat(e))if(n=ya(r,i),n)break;return n?(Ed(r,n,!1,.08),r.state="once",r.onFin&&r.mixer.removeEventListener("finished",r.onFin),r.onFin=i=>{i.action===r.cur&&(r.mixer.removeEventListener("finished",r.onFin),r.onFin=null,t&&(r.state="",An(r,t)))},r.mixer.addEventListener("finished",r.onFin),!0):!1}function ir(r,e,t){let n=r*374761393+e*668265263+t*982451653|0;return n=Math.imul(n^n>>>13,1274126177),((n^n>>>16)>>>0)/4294967296}function Iy(r,e,t,n){const i=Math.floor(r),s=Math.floor(e),a=r-i,o=e-s,l=a*a*(3-2*a),c=o*o*(3-2*o),h=v=>(v%t+t)%t,u=ir(h(i),h(s),n),d=ir(h(i+1),h(s),n),f=ir(h(i),h(s+1),n),m=ir(h(i+1),h(s+1),n);return u+(d-u)*l+(f-u)*c+(u-d-f+m)*l*c}function mi(r,e,t,n,i=5){let s=0,a=.5,o=1,l=0;for(let c=0;c<i;c++)s+=Iy(r*o,e*o,t*o,n+c)*a,l+=a,a*=.5,o*=2;return s/l}function ha(r,e,t){const n=new Float32Array(r*r);for(let l=0;l<r;l++)for(let c=0;c<r;c++)n[l*r+c]=e(c/r,l/r);const i=new Uint8Array(r*r*4),s=new Uint8Array(r*r*4),a=(l,c)=>n[(c+r)%r*r+(l+r)%r];for(let l=0;l<r;l++)for(let c=0;c<r;c++){const h=(l*r+c)*4,u=a(c,l),d=t(u,c/r,l/r);i[h]=i[h+1]=i[h+2]=Math.max(0,Math.min(255,d*255)),i[h+3]=255;const f=(a(c+1,l)-a(c-1,l))*r*.012,m=(a(c,l+1)-a(c,l-1))*r*.012,v=Math.hypot(f,m,1);s[h]=(-f/v*.5+.5)*255,s[h+1]=(m/v*.5+.5)*255,s[h+2]=(1/v*.5+.5)*255,s[h+3]=255}const o=(l,c)=>{const h=new Xi(l,r,r,qt);return h.wrapS=h.wrapT=bn,h.magFilter=yt,h.minFilter=Tn,h.generateMipmaps=!0,h.anisotropy=8,c&&(h.colorSpace=dt),h.needsUpdate=!0,h};return{map:o(i,!0),normal:o(s,!1)}}const sn={};function Ma(r){if(sn[r])return sn[r];const e=256;let t;return r==="tile"?t=ha(e,(n,i)=>{const s=n*2%1,a=i*2%1,o=Math.min(s,1-s,a,1-a);return Math.min(1,o/.04)*.6+mi(n*8,i*8,8,3)*.4},(n,i,s)=>.62+n*.38+(ir(Math.floor(i*2),Math.floor(s*2),9)-.5)*.12):r==="crack"?t=ha(e,(n,i)=>{const s=mi(n*6,i*6,6,5),a=Math.abs(mi(n*4,i*4,4,11)-.5);return s*.6+Math.min(1,a*9)*.4},n=>.55+n*.45):r==="snow"?t=ha(e,(n,i)=>mi(n*6,i*6,6,21)*.8+mi(n*24,i*24,24,4)*.2,n=>.9+n*.1):t=ha(e,(n,i)=>mi(n*10,i*10,10,7)*.55+mi(n*40,i*40,40,13)*.45,(n,i,s)=>.7+n*.3+(mi(i*3,s*3,3,2)-.5)*.18),sn[r]=t,t}function Ad(){if(sn.dot)return sn.dot;const r=document.createElement("canvas");r.width=r.height=64;const e=r.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.25,"rgba(255,255,255,0.8)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);const n=new uc(r);return n.colorSpace=dt,sn.dot=n,n}function Ly(){if(sn.slash)return sn.slash;const r=document.createElement("canvas");r.width=256,r.height=128;const e=r.getContext("2d"),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"rgba(255,255,255,0)"),t.addColorStop(.6,"rgba(255,255,255,0.9)"),t.addColorStop(1,"rgba(255,255,255,1)"),e.strokeStyle=t,e.lineCap="round";for(let i=0;i<3;i++)e.lineWidth=10-i*3,e.globalAlpha=1-i*.25,e.beginPath(),e.ellipse(128,128,118-i*4,100-i*10,0,Math.PI*1.08,Math.PI*1.92),e.stroke();const n=new uc(r);return n.colorSpace=dt,sn.slash=n,n}function Fo(){if(sn.blob)return sn.blob;const r=document.createElement("canvas");r.width=r.height=64;const e=r.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);return t.addColorStop(0,"rgba(0,0,0,0.55)"),t.addColorStop(.6,"rgba(0,0,0,0.25)"),t.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=t,e.fillRect(0,0,64,64),sn.blob=new uc(r),sn.blob}function pu(r,e,t,n,i,s=1){const a=new pt({side:zt,depthWrite:!1,fog:!1,uniforms:{top:{value:new ue(r)},hor:{value:new ue(e)},bot:{value:new ue(t)},sunDir:{value:n.clone().normalize()},sunCol:{value:new ue(i)},sunSize:{value:s}},vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }",fragmentShader:`uniform vec3 top, hor, bot, sunCol, sunDir; uniform float sunSize; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float y = d.y;
        vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y,0.0,1.0), 0.55)) : mix(hor, bot, pow(clamp(-y,0.0,1.0), 0.4));
        float s = max(dot(d, sunDir), 0.0);
        c += sunCol * (pow(s, 900.0/sunSize) * 6.0 + pow(s, 12.0) * 0.35 + pow(s, 3.0) * 0.12);
        gl_FragColor = vec4(c, 1.0); }`}),o=new Oe(new Ls(400,32,16),a);return o.frustumCulled=!1,o.renderOrder=-10,o}function Ny(r,e,t,n,i,s,a){return new pt({transparent:!0,depthWrite:!1,fog:!0,uniforms:yn.merge([he.fog,{t:{value:0},col:{value:new ue(e)},depthTex:{value:t},area:{value:n},skyTop:{value:new ue(i)},skyHor:{value:new ue(s)},sunDir:{value:a.clone().normalize()},mode:{value:r==="lava"?1:r==="void"?2:r==="glitter"?3:0}}]),vertexShader:`varying vec3 vW; varying vec2 vUv; 
${ke.fog_pars_vertex}

      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vUv = uv; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition; 
${ke.fog_vertex}
 }`,fragmentShader:`uniform float t; uniform vec3 col, skyTop, skyHor, sunDir; uniform sampler2D depthTex; uniform vec4 area; uniform int mode;
      varying vec3 vW; varying vec2 vUv; 
${ke.fog_pars_fragment}

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
        
${ke.fog_fragment}

      }`})}const Rd={t:{value:0}},Ia={p:{value:new A},on:{value:0}};function Bl(r,e=.06,t=1.5,n=!1){return r.onBeforeCompile=i=>{i.uniforms.windT=Rd.t,n&&(i.uniforms.occP=Ia.p,i.uniforms.occOn=Ia.on,i.vertexShader=`varying vec3 vOccW;
`+i.vertexShader.replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
        {
          vec4 ow = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            ow = instanceMatrix * ow;
          #endif
          vOccW = (modelMatrix * ow).xyz;
        }`),i.fragmentShader=`uniform vec3 occP; uniform float occOn; varying vec3 vOccW;
`+i.fragmentShader.replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
        if (occOn > 0.5) {
          vec3 ab = occP - cameraPosition;
          float t = clamp(dot(vOccW - cameraPosition, ab) / dot(ab, ab), 0.0, 1.0);
          float d = length(vOccW - (cameraPosition + ab * t));
          float r = 0.9 + 0.6 * t;
          float f = smoothstep(r, r * 0.55, d) * (1.0 - smoothstep(0.86, 0.98, t));
          float h = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          if (h < f) discard;
        }`)),i.vertexShader=`uniform float windT;
`+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      {
        vec3 ip = vec3(0.0);
        #ifdef USE_INSTANCING
          ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
        #endif
        float k = clamp(position.y / ${t.toFixed(3)}, 0.0, 1.0); k *= k;
        float ph = ip.x * 0.7 + ip.z * 0.9;
        transformed.x += sin(windT * 1.7 + ph) * ${e.toFixed(3)} * k * ${(1/1).toFixed(1)};
        transformed.z += cos(windT * 1.3 + ph * 1.3) * ${(e*.6).toFixed(3)} * k;
      }`)},r.customProgramCacheKey=()=>"wind"+e+"_"+t+(n?"c":""),r}function Cd(r,e,t,n=new A(26,8,20)){const i=new gt,s=new Float32Array(e*3),a=new Float32Array(e);for(let h=0;h<e;h++)s[h*3]=Math.random()*n.x,s[h*3+1]=Math.random()*n.y,s[h*3+2]=Math.random()*n.z,a[h]=Math.random();i.setAttribute("position",new St(s,3)),i.setAttribute("rnd",new St(a,1));const o={pollen:0,snow:1,ember:2,dust:3,glitter:4,spark:5}[r]??0,l=new pt({transparent:!0,depthWrite:!1,blending:o===1||o===3?Bi:Ln,uniforms:{t:{value:0},center:{value:new A},box:{value:n},col:{value:new ue(t)},tex:{value:Ad()},mode:{value:o},scale:{value:300}},vertexShader:`uniform float t, scale; uniform vec3 center, box; uniform int mode; attribute float rnd; varying float vA; varying float vR;
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
        gl_FragColor = vec4(c * (mode == 1 || mode == 3 ? 1.0 : 2.2), a); }`}),c=new hc(i,l);return c.frustumCulled=!1,c}const ua=r=>new ue(r),Uy=["sword_attack","staff_attack","bow_attack_shoot","dagger_attack","attack","punch"];function ky(r){r.traverse(e=>{if(e.userData.ownGeo&&e.geometry?.dispose(),e.userData.ownMat)for(const t of[].concat(e.material))t&&(t.userData.ownTex&&(t.map?.dispose(),t.normalMap?.dispose()),t.dispose())})}class Fy{constructor(e){this.v=e,this.scene=new Il,this.enemies=[],this.heroes=[],this.t=0,this.token=0,this.pool=[];for(let t=0;t<3;t++){const n=new vn(16777215,0,9,1.6);this.pool.push(n)}this.scene.userData.flashPool=this.pool,this.accent=[new vn(16777215,0,14,1.4),new vn(16777215,0,14,1.4)],this.rim=new _c(16777215,0)}async begin(e,t,n,i){const s=++this.token,a=this.v,o=this.scene,l=a.Q,c=sr(e),h=e.startsWith("ow_")||["town","schlager","xmas"].includes(c),u=h?ps[c].out?c:"town":c,d=zl(e),f=[Promise.all(t.map(H=>a.actorMonster(H.id,H.boss?1.15:2))),Promise.all(n.map(H=>a.actorHero(H.id,!0))),i?a.actorCapsule(i):Promise.resolve(null),Promise.all([...d.map(H=>Ot(H[0])),Ot(h?"forest/rocks-high.glb":"town/rock-large.glb")])],[m,v,g]=await Promise.all(f),p={};for(const H of d)p[H[0]]=await Ot(H[0]);const x=h?"forest/rocks-high.glb":"town/rock-large.glb";if(p[x]=await Ot(x),s!==this.token)return;this.clear();const{v:T}=a.setupSky(o,u,9);a.renderer.toneMappingExposure=T.expo;const _=Li(e),D=Ma(h?c==="xmas"?"snow":"grass":c==="rap"||c==="static"?"tile":"crack"),E=D.map.clone(),R=D.normal.clone();E.repeat.set(14,14),R.repeat.set(14,14),E.needsUpdate=R.needsUpdate=!0;const w=new ys(45,64,0,Math.PI*2);w.rotateX(-Math.PI/2);const M=[],y=w.attributes.position,C=ua(_[0]).lerp(ua(_[1]),.5).multiplyScalar(.92);for(let H=0;H<y.count;H++){const K=Math.hypot(y.getX(H),y.getZ(H)),Q=Math.max(.55,1-K/60);M.push(C.r*Q,C.g*Q,C.b*Q)}w.setAttribute("color",new je(M,3));const L=new Oe(w,new Rt({vertexColors:!0,map:E,normalMap:R,roughness:.92}));L.receiveShadow=!0,L.userData.ownGeo=L.userData.ownMat=!0,L.material.userData.ownTex=!0,o.add(L);const I=By(Oy(e)),O=new Map,V=(H,K)=>{O.has(H)||O.set(H,[]),O.get(H).push(K)},B=(H,K,Q,se,Me=Q)=>new Pe().compose(new A(H,0,K),new jt().setFromAxisAngle(new A(0,1,0),se),new A(Q,Me,Q));for(let H=0;H<30;H++){const K=-Math.PI*(.05+I()*.9),Q=10+I()*10,se=d[Math.floor(I()*d.length)],Me=se[1]*(1+I()*.6);V(se[0],B(Math.cos(K)*Q*1.3,Math.sin(K)*Q-1,Me,I()*6.28))}for(let H=0;H<10;H++){const K=-Math.PI*(.1+I()*.8);V(x,B(Math.cos(K)*24,Math.sin(K)*18-2,5.5,I()*6.28,6.5))}for(const[H,K]of O)a.addInstances(o,p[H],K,H.includes("tree")||H.includes("pine"),!1);h&&l.grass&&this.grass(o,_,l.grass*260),this.rim.color.set(h?"#ffe8d0":T.accent||"#ffffff"),this.rim.intensity=h?.8:1.6,this.rim.position.set(0,4,-10),o.add(this.rim);for(const[H,K]of this.accent.entries())K.color.set(h?"#ffffff":T.accent||"#ffffff"),K.intensity=h?0:22,K.position.set(H?6:-6,3.5,-3.5),o.add(K);for(const H of this.pool)H.intensity=0,H.userData.busy=!1,o.add(H);this.parts=Cd(T.part[0],Math.round(l.parts*.7),T.part[1],new A(24,8,16)),this.parts.material.uniforms.center.value.set(0,0,-2),this.parts.userData.ownGeo=this.parts.userData.ownMat=!0,o.add(this.parts);const $=t.length;this.enemies=m.map((H,K)=>{const Q=(K-($-1)/2)*($>1?3.7:0);return H.root.position.set(Q,0,-3.4),H.base=H.root.position.clone(),a.addBlob(H.root,t[K].boss?3:1.9),H.mats=[],H.root.traverse(se=>{se.isMesh&&se.material.emissive&&H.mats.push(se.material)}),o.add(H.root),H});const G=n.length;this.heroes=v.map((H,K)=>(H.root.position.set((K-(G-1)/2)*1.9,0,.1+Math.abs(K-(G-1)/2)*.25),H.base=H.root.position.clone(),H.pivot.rotation.y=Math.PI,H.id=n[K].id,o.add(H.root),n[K].hp<=0&&(on(H,"death",""),H.mixer?.update(5)),H)),this.cap=g,g&&(g.root.position.set((G-1)/2*1.9+1.7,0,-.5),g.base=g.root.position.clone(),g.pivot.rotation.y=Math.PI,o.add(g.root)),this.t=0,this.camT=0,this.shakeT=0,this.placeCam(0),a.placeSun(o,new A(0,0,-1.5)),a.renderer.compile(o,a.camera)}grass(e,t,n){const i=new Mn(.06,.34,1,3);i.translate(0,.17,0);const s=Bl(new Rt({color:16777215,side:xt,roughness:.85}),.07,.34),a=new lr(i,s,n);a.userData.ownGeo=a.userData.ownMat=!0;const o=new Pe,l=new jt,c=new A,h=new A,u=new ue;for(let d=0;d<n;d++){const f=Math.random()*Math.PI*2,m=2.5+Math.sqrt(Math.random())*15;h.set(Math.cos(f)*m*1.3,0,Math.sin(f)*m-2),l.setFromAxisAngle(new A(0,1,0),Math.random()*6.28),c.set(1,.6+Math.random()*1.1,1),o.compose(h,l,c),a.setMatrixAt(d,o),u.set(t[0]).lerp(ua(t[3]||t[1]),Math.random()*.6).multiplyScalar(.85+Math.random()*.3),a.setColorAt(d,u)}a.receiveShadow=!0,a.frustumCulled=!1,e.add(a)}clear(){const e=this.scene;this.v.fx.clear(e);for(const t of e.children.slice())t===e.userData.sky||t===e.userData.sun||t===e.userData.hemi||t===e.userData.sun?.target||(e.remove(t),ky(t));this.enemies=[],this.heroes=[],this.cap=null}end(){this.token++,this.clear()}placeCam(e){const t=this.v.camera;this.camT+=e,t.position.set(Math.sin(this.camT*.25)*.5,5,9.4),this.shakeT>0&&(this.shakeT-=e,t.position.x+=(Math.random()-.5)*.22,t.position.y+=(Math.random()-.5)*.15),t.lookAt(0,.9,-.9)}lunge(e,t,n,i){e.lunge={t:0,dur:i,dir:t.clone().setY(0).normalize(),dist:n}}hero(e,t,n){if(e===-1&&t==="victory"){for(const a of this.heroes)(a.state!=="once"||a.dead!==!0)&&(a.dead||(a.hop={t:0}));return}const i=this.heroes[e];if(!i)return;const s=n>=0?this.enemies[n]:null;switch(t){case"attack":{on(i,Uy);const a=i.id==="andrew"||i.id==="andy";s&&this.lunge(i,s.base.clone().sub(i.base),a?2.2:.5,.6),i.id==="rico"&&s&&this.bolt(i,s,"#ffd27a",.22);break}case"cast":on(i,["spell1","staff_attack","attack","punch"]),this.v.fx.burst(i.root.position.clone().add(new A(0,1,0)),i.id==="teresa"?"#9affc0":"#c8a0ff",24,1.4,.7,1.5,.12,this.scene),s&&this.bolt(i,s,"#c890ff",.3);break;case"hurt":on(i,"recievehit"),this.lunge(i,new A(0,0,1),.35,.3);break;case"death":i.dead=!0,on(i,"death","");break;case"idle":i.dead=!1,i.state="",An(i,"idle");break;case"guard":on(i,["idle_weapon","idle_attacking","idle"]);break}}capsule(e,t){const n=this.cap;if(!n)return;const i=t>=0?this.enemies[t]:null;e==="attack"||e==="cast"?(on(n,["bite_front","attack","dragon_attack","skeleton_attack","slime_attack","punch"]),this.lunge(n,i?i.base.clone().sub(n.base):new A(0,0,-1),e==="attack"?1.8:.4,.55),e==="cast"&&this.v.fx.burst(n.root.position.clone().add(new A(0,n.h*.6,0)),"#ffd27a",26,1.5,.7,1.5,.12,this.scene),e==="cast"&&i&&this.bolt(n,i,"#ffb070",.25)):e==="hurt"?(on(n,["hitrecieve","hit"]),this.lunge(n,new A(0,0,1),.3,.25)):e==="death"&&(on(n,"death",""),n.dead=!0)}enemy(e,t,n){const i=this.enemies[e];if(i)if(t==="attack"){on(i,["bite_front","attack","dragon_attack","skeleton_attack","slime_attack"]);const s=n===-2?this.cap:n>=0?this.heroes[n]:null;this.lunge(i,s?s.base.clone().sub(i.base):new A(0,0,1),1.4,.55)}else t==="hurt"&&(on(i,["hitrecieve","hit"]),i.flash=.22,this.lunge(i,new A(0,0,-1),.3,.25))}enemyDown(e){const t=this.enemies[e];t&&(on(t,"death","")||(t.noDeathAnim=!0),t.down=1e-4)}bolt(e,t,n,i){const s=new Oe(new Ls(.12,12,8),new ft({color:ua(n).multiplyScalar(4)})),a=e.root.position.clone().add(new A(0,1,-.3)),o=t.root.position.clone().add(new A(0,t.h*.5,0));s.position.copy(a),s.visible=!1,this.v.fx.add(s,this.scene,.28+i,l=>{const c=Math.max(0,(l*(.28+i)-i)/.28);s.visible=c>0,s.position.lerpVectors(a,o,c),s.position.y+=Math.sin(c*Math.PI)*.6})}pos(e,t,n){const i=e==="enemy"?this.enemies[t]:e==="capsule"?this.cap:this.heroes[t];return i?i.root.position.clone().add(new A(0,n??i.h,0)):null}fxAt(e,t,n){const i=this.v.fx,s=this.scene;if(e==="victory"){for(const c of this.heroes)i.burst(c.root.position.clone().add(new A(0,1.8,0)),["#ffd24a","#ff5ad0","#46e6ff","#7cff9a"][Math.floor(Math.random()*4)],30,2.6,1.3,-3,.1,s);return}const a=t==="enemy"?this.enemies[n]:t==="capsule"?this.cap:this.heroes[n];if(!a)return;const o=a.root.position.clone().add(new A(0,a.h*.55,0)),l=a.root.position.clone().add(new A(0,.05,0));switch(e){case"slash":i.slash(o,"#ffffff",1.4+a.h*.3,s),i.burst(o,"#ffe8a0",18,3.2,.45,-4,.09,s);break;case"bigslash":i.slash(o,"#ffc840",2.4+a.h*.3,s),i.ring(l,"#ffb020",.3,3.5,.5,s),i.burst(o,"#ffd24a",40,4.5,.7,-4,.12,s),i.flash(o,"#ffb040",40,.4,s),this.shakeT=.25;break;case"magic":i.burst(o,"#b48aff",46,3.4,.7,.5,.14,s),i.ring(o,"#c8a0ff",.2,2.2,.45,s,!1),i.flash(o,"#9a6aff",30,.45,s);break;case"heal":i.burst(l.clone().add(new A(0,.3,0)),"#7cffb0",30,1.2,1.1,2,.11,s),i.ring(l,"#7cffb0",.2,1.1,.7,s);break;case"guard":i.bubble(o,"#6ac8ff",.95,.8,s);break;case"hit":i.burst(o,"#ff6a5a",14,2.4,.4,-4,.08,s);break;case"heavy":i.burst(o,"#ff4a3a",28,3.4,.5,-4,.11,s),this.shakeT=.3;break;case"spec":i.ring(l,"#ff4a6a",.5,11,.8,s),i.flash(o,"#ff3050",60,.6,s),this.shakeT=.45;break;case"special":i.ring(l,"#ffd24a",.2,1.6,.6,s),i.burst(l.clone().add(new A(0,.4,0)),"#ffd24a",40,1.6,.9,2.5,.12,s),i.flash(o,"#ffc040",30,.6,s);break}}update(e){this.t+=e;const t=[...this.enemies,...this.heroes,...this.cap?[this.cap]:[]];for(const n of t){n.mixer?.update(e);const i=new A;if(n.lunge){const s=n.lunge;s.t+=e;const a=Math.min(1,s.t/s.dur);i.addScaledVector(s.dir,Math.sin(a*Math.PI)*s.dist),a>=1&&(n.lunge=null)}if(n.hop&&(n.hop.t+=e,i.y+=Math.max(0,Math.sin(n.hop.t*9))*.35*Math.max(0,1-n.hop.t/1.4),n.hop.t>1.4&&(n.hop=null)),n.root.position.copy(n.base).add(i),n.flash!==void 0&&n.mats){n.flash=Math.max(0,n.flash-e);const s=n.flash/.22;for(const a of n.mats)a.emissive.setRGB(s,s,s),a.emissiveIntensity=1.5}if(n.down&&(n.down+=e,n.down>.9||n.noDeathAnim)){const s=Math.min(1,(n.down-(n.noDeathAnim?0:.9))/.35);n.root.scale.setScalar(Math.max(.001,1-s)),!n.poof&&s>.1&&(n.poof=!0,this.v.fx.burst(n.root.position.clone().add(new A(0,n.h*.4,0)),"#c8d0ff",36,2.2,.8,.8,.11,this.scene)),s>=1&&(n.root.visible=!1)}}this.parts&&(this.parts.material.uniforms.t.value=this.t,this.parts.material.uniforms.scale.value=this.v.H*.9),this.placeCam(e),this.v.fx.update(e)}}function Oy(r){let e=2166136261;for(let t=0;t<r.length;t++)e^=r.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}function By(r){return()=>{r|=0,r=r+1831565813|0;let e=Math.imul(r^r>>>15,1|r);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}class zy{constructor(e){this.v=e,this.list=[]}add(e,t,n,i){t.add(e),this.list.push({obj:e,scene:t,life:n,t:0,step:i})}burst(e,t,n,i,s,a,o,l){const c=new gt,h=new Float32Array(n*3),u=[];for(let m=0;m<n;m++){h[m*3]=e.x,h[m*3+1]=e.y,h[m*3+2]=e.z;const v=new A(Math.random()-.5,Math.random()*.9+.1,Math.random()-.5).normalize().multiplyScalar(i*(.35+Math.random()*.65));u.push(v)}c.setAttribute("position",new St(h,3));const d=new cc({map:Ad(),color:new ue(t).multiplyScalar(2.5),size:o,transparent:!0,depthWrite:!1,blending:Ln,sizeAttenuation:!0}),f=new hc(c,d);f.frustumCulled=!1,this.add(f,l,s,(m,v)=>{const g=c.attributes.position;for(let p=0;p<n;p++){const x=u[p];x.y+=a*v,x.multiplyScalar(1-v*1.2),g.array[p*3]+=x.x*v,g.array[p*3+1]+=x.y*v,g.array[p*3+2]+=x.z*v}g.needsUpdate=!0,d.opacity=1-m*m})}ring(e,t,n,i,s,a,o=!0){const l=new ft({color:new ue(t).multiplyScalar(2.2),transparent:!0,side:xt,depthWrite:!1,blending:Ln}),c=new Oe(new ki(.85,1,64),l);o&&(c.rotation.x=-Math.PI/2),c.position.copy(e),this.add(c,a,s,h=>{const u=n+(i-n)*(1-(1-h)*(1-h));c.scale.setScalar(u),l.opacity=1-h})}slash(e,t,n,i){const s=new ft({map:Ly(),color:new ue(t).multiplyScalar(2.4),transparent:!0,depthWrite:!1,depthTest:!1,blending:Ln,side:xt}),a=new Oe(new Mn(2*n,1*n),s);a.position.copy(e),a.quaternion.copy(this.v.camera.quaternion),a.rotateZ(-.7+Math.random()*.4),a.renderOrder=20,this.add(a,i,.32,o=>{a.scale.setScalar(.7+o*.6),s.opacity=1-o,a.rotateZ(.02)})}flash(e,t,n,i,s){const a=s.userData.flashPool;if(!a)return;const o=a.find(c=>!c.userData.busy)||a[0];o.userData.busy=!0,o.color.set(t),o.position.copy(e);const l={obj:new ct,scene:s,life:i,t:0,step:c=>{o.intensity=n*(1-c),c>=1&&(o.intensity=0,o.userData.busy=!1)}};s.add(l.obj),this.list.push(l)}bubble(e,t,n,i,s){const a=new ft({color:new ue(t).multiplyScalar(1.4),transparent:!0,opacity:0,depthWrite:!1,blending:Ln,side:xt});a.onBeforeCompile=l=>{l.vertexShader=l.vertexShader.replace("#include <common>",`#include <common>
varying float vF;`).replace("#include <project_vertex>",`#include <project_vertex>
vec3 nn = normalize(normalMatrix * normal); vF = 1.0 - abs(nn.z);`),l.fragmentShader=l.fragmentShader.replace("#include <common>",`#include <common>
varying float vF;`).replace("vec4 diffuseColor = vec4( diffuse, opacity );","vec4 diffuseColor = vec4( diffuse, opacity * (0.15 + pow(vF, 2.0)) );")};const o=new Oe(new Ls(n,24,16),a);o.position.copy(e),this.add(o,s,i,l=>{a.opacity=l<.2?l*5:(1-l)*1.25,o.scale.setScalar(.9+.1*Math.sin(l*20))})}update(e){for(const t of this.list)t.t+=e,t.step(Math.min(1,t.t/t.life),e);this.list=this.list.filter(t=>t.t<t.life?!0:(t.step(1,0),t.scene.remove(t.obj),t.obj.geometry?.dispose(),t.obj.material?.dispose(),t.obj.dispose?.(),!1))}clear(e){this.list=this.list.filter(t=>t.scene!==e?!0:(e.remove(t.obj),t.obj.geometry?.dispose(),t.obj.material?.dispose(),!1))}}const Hy={uniforms:{tDiffuse:{value:null},amt:{value:1}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float amt; varying vec2 vUv;
    void main(){
      vec4 t = texture2D(tDiffuse, vUv); vec3 c = t.rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      vec3 g = mix(vec3(l), c, 1.14);
      g = (g - 0.5) * 1.07 + 0.5;
      g += mix(vec3(-0.012, 0.004, 0.03), vec3(0.03, 0.012, -0.02), smoothstep(0.15, 0.85, l));
      gl_FragColor = vec4(mix(c, clamp(g, 0.0, 1.0), amt), t.a);
    }`},Vy={ow_town:["#4aa24f","#459a4a","#2a5a6a","#2a8a3a","#ffd24a"],ow_rap:["#5a5a86","#54547e","#2a2a44","#4a4a8a","#ff4a6a"],ow_schlager:["#a6d67e","#9ecf76","#a04a80","#58b04a","#ff5aa8"],ow_xmas:["#e6f2fa","#dcecf6","#4a7a9a","#2f8a4a","#ff3a3a"],ow_rock:["#6a4a3a","#634232","#2a1a18","#8a5a2a","#ff7a1a"],ow_static:["#4a505e","#444a58","#202430","#606878","#7cff9a"]},Gy={town:"#2a6ac8",rap:"#1a1030",schlager:"#ff8fc8",xmas:"#26466a",rock:"#ff5a10",static:"#0a0c12"},mu={town:"water",rap:"void",schlager:"glitter",xmas:"water",rock:"lava",static:"void"},ps={town:{out:!0,sky:["#3d7fd6","#bfe2ff","#6c8fae"],sun:[.55,.62,.35],sunC:"#fff0d8",sunI:3,hemi:["#cfe6ff","#5a7a4a",1.1],env:.55,fog:.01,part:["pollen","#fff6b0"],expo:1},schlager:{out:!0,sky:["#d26ac0","#ffd0ea","#c08ab0"],sun:[-.4,.4,.5],sunC:"#ffe0f0",sunI:2.6,hemi:["#ffe0f4","#8a5a7a",1],env:.6,fog:.012,part:["glitter","#ff9ad8"],expo:1},xmas:{out:!0,sky:["#7a9cc8","#e6f0fa","#b8c8da"],sun:[.3,.32,.6],sunC:"#ffe8d0",sunI:2.2,hemi:["#e8f2ff","#8aa0b8",1.2],env:.6,fog:.016,part:["snow","#ffffff"],expo:.95},rap:{out:!1,sky:["#0a0614","#2a1848","#0a0614"],sun:[.4,.8,.3],sunC:"#9a80ff",sunI:1.5,hemi:["#6a4aa8","#1a1024",1],env:.4,fog:.035,part:["dust","#c8a8ff"],accent:"#ff4a6a",expo:1.1},rock:{out:!1,sky:["#120604","#4a1a0c","#120604"],sun:[.3,.8,.4],sunC:"#ffb080",sunI:1.5,hemi:["#a05030","#200a06",1],env:.4,fog:.032,part:["ember","#ff7a2a"],accent:"#ff7a1a",expo:1.1},static:{out:!1,sky:["#05060c","#1c2232","#05060c"],sun:[.3,.8,.4],sunC:"#a0ffc0",sunI:1.4,hemi:["#506080","#0c0e14",1],env:.4,fog:.035,part:["spark","#7cff9a"],accent:"#7cff9a",expo:1.1}},gu={xmas:[["grave/pine.glb",1.5],["grave/pine.glb",1.8],["town/tree-high.glb",1]],rock:[["grave/pine-fall.glb",1.5],["grave/pine-fall-crooked.glb",1.5],["town/tree-crooked.glb",1.1]],rap:[["dungeon/column.glb",1.5],["dungeon/barrel.glb",1.6],["dungeon/rocks.glb",1.2]],static:[["dungeon/column.glb",1.8],["dungeon/rocks.glb",1.4]],schlager:[["town/tree-high-round.glb",1],["town/tree.glb",1.2],["town/tree-high.glb",.9]],town:[["town/tree.glb",1.1],["town/tree-high.glb",1],["forest/tree.glb",1.4],["town/tree-high-round.glb",1]]},zl=r=>gu[r.replace("ow_","")]||gu.town,Ta=["2Story_Mat","1Story_GableRoof_Mat","2Story_Sign_Mat","1Story_Mat","2Story_GableRoof_Mat"],Wy=["town/tree.glb","town/tree-high.glb","town/tree-high-round.glb","town/tree-crooked.glb","town/rock-large.glb","town/road.glb","town/wall-block.glb","town/fountain-round.glb","forest/tree.glb","forest/rocks-high.glb","grave/pine.glb","grave/pine-fall.glb","grave/pine-fall-crooked.glb","grave/crypt.glb","dungeon/wall.glb","dungeon/column.glb","dungeon/barrel.glb","dungeon/rocks.glb","dungeon/chest.glb","dungeon/gate.glb","dungeon/key.glb",...Ta.map(r=>`bld_${r}.glb`),"bld_1Story_Sign_Mat.glb","bld_2Story_Slim_Mat.glb"],vu=[{dpr:1,shadow:0,bloom:!1,samples:0,grass:0,parts:120},{dpr:1.5,shadow:1024,bloom:!0,samples:0,grass:7,parts:260},{dpr:2,shadow:2048,bloom:!0,samples:4,grass:16,parts:420}],_u=-.2,xu=[[.22,4.8],[.36,6.8],[.6,10.5],[.9,15]],Ce=r=>new ue(r),La=r=>r*r*(3-2*r);function Wt(r,e){const t=Math.sin(r*127.1+e*311.7)*43758.5453;return t-Math.floor(t)}function Ks(r,e){const t=Math.floor(r),n=Math.floor(e),i=La(r-t),s=La(e-n),a=Wt(t,n),o=Wt(t+1,n),l=Wt(t,n+1),c=Wt(t+1,n+1);return a+(o-a)*i+(l-a)*s+(a-o-l+c)*i*s}const sr=r=>r.replace("ow_","");function Li(r){return r.startsWith("ow_")?Vy[r]:Fd[r]}class Xy{constructor(e,t,n){this.g=t,this.canvas=e,this.qi=n,this.Q=vu[n],this.mode=-1,this.t=0,this.renderer=new w_({canvas:e,antialias:!1,powerPreference:"high-performance",stencil:!1}),this.renderer.outputColorSpace=dt,this.renderer.toneMapping=ql,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Eu,this.pmrem=new Pl(this.renderer),this.camera=new Xt(38,16/9,.3,500),this.world=new Il,this.fx=new zy(this),this.battle=new Fy(this),this.envCache={},this.built="",this.building=null,this.buildToken=0,this.dyn=new Map,this.camTarget=new A,this.camInit=!1,this.camYaw=0,this.camYawT=0,this.camPitch=.4,this.camD=7,this.camZoom=1,this.camKeys=0,this.cine=null,this.shakeT=0,this.labels=[],this.dying=[],this.fpsT=0,this.fpsN=0,this.lowFor=0,this.setupComposer(),this.resize(),addEventListener("resize",()=>this.resize())}setupComposer(){const e=this.Q;if(this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,e.dpr)),this.renderer.shadowMap.enabled=e.shadow>0,this.composer&&(this.composer.dispose?.(),this.composer=null),this.gtao?.dispose?.(),this.gtao=null,e.bloom){const t=this.renderer.getDrawingBufferSize(new ae),n=new Qt(Math.max(1,t.x),Math.max(1,t.y),{type:Bt,samples:e.samples});this.composer=new Lx(this.renderer,n),this.renderPass=new Nx(this.world,this.camera),this.composer.addPass(this.renderPass),this.gtao=null,this.qi>=2&&(this.gtao=new Cn(this.world,this.camera,t.x,t.y),this.gtao.updateGtaoMaterial({radius:.5,distanceExponent:1.5,thickness:1,scale:1}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao)),this.bloom=new Ds(new ae(t.x,t.y),.45,.55,.88),this.composer.addPass(this.bloom),this.composer.addPass(new Fx),this.composer.addPass(new Md(Hy))}}setQuality(e){if(e!==this.qi){this.qi=e,this.Q=vu[e],this.setupComposer(),this.resize();for(const t of[this.world,this.battle.scene]){const n=t.userData.sun;n&&this.configSun(n,t.userData.shadowSize||14)}this.built=""}}resize(){const e=innerWidth,t=innerHeight;this.renderer.setSize(e,t,!1),this.canvas.style.width=e+"px",this.canvas.style.height=t+"px",this.composer&&(this.composer.setPixelRatio(this.renderer.getPixelRatio()),this.composer.setSize(e,t)),this.aspect=e/Math.max(1,t),this.camera.aspect=this.aspect;const n=38,i=1.5;this.camera.fov=this.aspect>=i?n:Cl.radToDeg(2*Math.atan(Math.tan(Cl.degToRad(n)/2)*i/this.aspect)),this.camera.updateProjectionMatrix(),this.W=e,this.H=t}configSun(e,t){e.castShadow=this.Q.shadow>0,this.Q.shadow&&(e.shadow.mapSize.set(this.Q.shadow,this.Q.shadow),e.shadow.map&&(e.shadow.map.dispose(),e.shadow.map=null));const n=e.shadow.camera;n.left=-t,n.right=t,n.top=t,n.bottom=-t,n.near=1,n.far=80,n.updateProjectionMatrix(),e.shadow.bias=-5e-4,e.shadow.normalBias=.03,e.shadow.radius=4}setupSky(e,t,n){const i=ps[t];for(const c of["sky","sun","hemi"])e.userData[c]&&(e.remove(e.userData[c]),c==="sun"&&e.remove(e.userData.sun.target));const s=new A(...i.sun).normalize(),a=pu(i.sky[0],i.sky[1],i.sky[2],s,i.out?i.sunC:"#000000",1);if(e.add(a),e.userData.sky=a,e.background=null,e.fog=new ac(Ce(i.sky[1]).lerp(Ce(i.sky[2]),i.out?.15:.5),i.fog),i.out&&this.hdrEnv&&(this.envCache[t]=this.hdrEnv),!this.envCache[t]){const c=new Il;c.add(pu(i.sky[0],i.sky[1],i.sky[2],s,i.sunC,3)),this.envCache[t]=this.pmrem.fromScene(c,.02).texture}e.environment=this.envCache[t],e.environmentIntensity=i.env;const o=new _c(Ce(i.sunC),i.sunI);o.userData.dir=s,e.add(o,o.target),this.configSun(o,n),e.userData.sun=o,e.userData.shadowSize=n;const l=new cx(Ce(i.hemi[0]),Ce(i.hemi[1]),i.hemi[2]);return e.add(l),e.userData.hemi=l,e.userData.vis=i,{sunDir:s,v:i}}placeSun(e,t){const n=e.userData.sun;if(n&&(n.target.position.copy(t),n.position.copy(t).addScaledVector(n.userData.dir,30),n.castShadow)){const i=e.userData.shadowSize*2/this.Q.shadow;n.target.position.x=Math.round(n.target.position.x/i)*i,n.target.position.z=Math.round(n.target.position.z/i)*i,n.position.copy(n.target.position).addScaledVector(n.userData.dir,30)}}async loadHdr(){try{const e=await new Vx().loadAsync("./env/spruit_sunrise_1k.hdr");e.mapping=ba,this.hdrEnv=this.pmrem.fromEquirectangular(e).texture,e.dispose();for(const t of["town","schlager","xmas"])delete this.envCache[t]}catch(e){console.warn("HDR",e)}}setMode(e){e!==this.mode&&(this.mode=e,e!==2&&(this.camInit=!1))}mapChanged(){this.built=""}partyChanged(){this.playerLead=""}ready(){return this.built!==this.g.S.mapId+"|"+this.qi&&this.build(),this.building||Promise.resolve()}build(){const e=++this.buildToken,t=this.g.S;return this.built=t.mapId+"|"+this.qi,this.building=this.buildWorld(e).catch(n=>console.error(n)).finally(()=>{e===this.buildToken&&(this.building=null)}),this.building}clearWorld(){const e=this.world;for(const t of e.children.slice())t===e.userData.sky||t===e.userData.sun||t===e.userData.hemi||t===e.userData.sun?.target||(e.remove(t),t.traverse?.(n=>{(n.isInstancedMesh||n.userData.ownGeo)&&n.geometry?.dispose(),n.userData.ownMat&&[].concat(n.material).forEach(i=>{i?.userData.ownTex&&(i.map?.dispose(),i.normalMap?.dispose()),i?.dispose()})}));this.dyn.clear(),this.dying=[],this.player=null,this.playerLead="",this.labels=[]}async buildWorld(e){const t=this.g.S,n=t.map,i=sr(n.world?"town":n.theme),s=new Set(["town/road.glb","town/wall-block.glb","dungeon/wall.glb","forest/rocks-high.glb","town/rock-large.glb","grave/crypt.glb","bld_2Story_Slim_Mat.glb","bld_2Story_GableRoof_Mat.glb"]);for(let p=0;p<t.mh;p++)for(let x=0;x<t.mw;x++)if(n.rows[p][x]==="T")for(const T of zl(Ar(t,x,p)))s.add(T[0]);if(n.town){for(const p of Ta)s.add(`bld_${p}.glb`);s.add("bld_1Story_Sign_Mat.glb"),s.add("town/fountain-round.glb")}const a={};if(await Promise.all([...s].map(async p=>{a[p]=await Ot(p)})),e!==this.buildToken)return;this.clearWorld();const{sunDir:o,v:l}=this.setupSky(this.world,i,this.qi>=2?22:16);this.theme=i,this.renderer.toneMappingExposure=l.expo;const c=n.world||n.town;if(this.terrain=this.buildTerrain(t,c),this.world.add(this.terrain.mesh),this.terrain.hasLiquid||c){const p=c?"town":n.theme,x=this.terrain.area,T=Ny(mu[p],Gy[p],this.terrain.depthTex,new Ze(x.x,x.y,x.w,x.h),l.sky[0],l.sky[1],o);T.userData.liquid=!0;const _=new Oe(new Mn(x.w,x.h),T);if(_.rotation.x=-Math.PI/2,_.position.set(x.x+x.w/2,_u,x.y+x.h/2),_.userData.ownGeo=_.userData.ownMat=!0,_.renderOrder=2,this.world.add(_),this.liquid=T,mu[p]==="lava"){const D=new vn(Ce("#ff6a20"),0,0,2);this.lavaLight=D}}else this.liquid=null;const h=new Map,u=(p,x)=>{h.has(p)||h.set(p,[]),h.get(p).push(x)},d=(p,x,T,_,D,E=_)=>new Pe().compose(new A(p,x,T),new jt().setFromAxisAngle(new A(0,1,0),D),new A(_,E,_)),f=new Map;for(let p=0;p<t.mh;p++)for(let x=0;x<t.mw;x++){const T=n.rows[p][x],_=(x*31+p*17)%7,D=x+.5,E=p+.5,R=this.heightAt(D,E);if(T==="T"){const w=zl(Ar(t,x,p)),M=w[(x*7+p*13)%w.length],y=M[1]*(.9+.04*_);u(M[0],d(D+(Wt(x,p)-.5)*.25,R-.02,E+(Wt(p,x)-.5)*.25,y,_*.9))}else if(T==="^"){const w=_%2===0?"forest/rocks-high.glb":"town/rock-large.glb";u(w,d(D,R+(_%2===0?.25:-.15),E,1.15,_*1.1,1.15*1.1))}else T==="#"?u(c?"town/wall-block.glb":"dungeon/wall.glb",d(D,0,E,1,0,1.15)):T==="p"?u("town/road.glb",d(D,R+.005,E,1,0)):"hHDSM".includes(T)&&f.set(x+","+p,T)}for(const[p,x]of h)this.addInstances(this.world,a[p],x,p.includes("tree")||p.includes("pine"),p.endsWith("road.glb"));let m=0;const v=new Set;for(let p=0;p<t.mh;p++)for(let x=0;x<t.mw;x++){const T=x+","+p;if(f.get(T)!=="h"||v.has(T))continue;let _=0;for(;f.get(x+_+","+p)==="h";)v.add(x+_+","+p),_++;let D=!1;for(let V=0;V<_;V++)f.get(x+V+","+(p+1))==="S"&&(D=!0);const E=D?"1Story_Sign_Mat":Ta[m%Ta.length];m++;const R=a[`bld_${E}.glb`],w=this.brightClone(R,"#ffe6cc"),M=R.box,y=M.getSize(new A),C=_/Math.max(.5,y.x),L=2/Math.max(.5,y.z),I=(C+L)*.5;w.scale.set(C,I,L),w.position.set(-(M.min.x+y.x/2)*C,-M.min.y*I,-(M.min.z+y.z/2)*L);const O=new It;O.add(w),O.rotation.y=Math.PI,O.position.set(x+_/2,0,p+1),this.world.add(O),w.traverse(V=>{V.isMesh&&(V.material=[].concat(V.material).map(B=>{if(/glass|window/i.test(B.name)){const $=B.clone();return $.emissive=Ce("#ffcf7a"),$.emissiveIntensity=.5,$}return B}),V.material.length===1&&(V.material=V.material[0]))})}if(this.buildGrass(t,i,c),n.portals.forEach((p,x)=>{const T=Vo(t,p),_=this.makePortal(p.kind||"exit",T,a);_.position.set(p.x+.5,this.heightAt(p.x+.5,p.y+.5),p.y+.5),this.world.add(_),this.dyn.set("p"+x,{n:_,k:"portal",p,open:T,kind:p.kind||"exit",models:a}),n.world&&this.labels.push({p,node:_,h:p.kind==="tower"?3.4:2.1})}),this.playerLight=null,!l.out){if(this.playerLight=new vn(Ce("#ffd2a0"),9,9,1.6),this.world.add(this.playerLight),n.boss&&n.boss.id){const x=new vn(Ce(l.accent),14,10,1.6);x.position.set(n.boss.x+.5,2.2,n.boss.y+.5),this.world.add(x)}const p=n.portals[0];if(p){const x=new vn(Ce("#5ae0ff"),6,6,1.6);x.position.set(p.x+.5,1.2,p.y+.5),this.world.add(x)}}const g=n.world?["pollen","#fff6b0"]:l.part;this.particles=Cd(g[0],this.Q.parts,g[1]),this.world.add(this.particles),this.plates=[];for(const[p,x]of n.puzzle&&n.puzzle.plates||[]){const T=new Oe(new Ms(.42,.46,.06,32),new Rt({color:Ce("#5a5a66"),roughness:.5,metalness:.6,emissive:Ce(l.accent),emissiveIntensity:.25})),_=new Oe(new ki(.3,.38,40),new ft({color:Ce(l.accent).multiplyScalar(2),transparent:!0,opacity:.5,depthWrite:!1}));_.rotation.x=-Math.PI/2,_.position.y=.04,T.add(_),T.position.set(p+.5,this.heightAt(p+.5,x+.5)+.03,x+.5),T.receiveShadow=!0,T.userData.ownGeo=T.userData.ownMat=_.userData.ownGeo=_.userData.ownMat=!0,this.world.add(T),this.plates.push({x:p,y:x,m:T,r:_,on:0})}this.camInit=!1,this.syncDyn(0)}heightAt(e,t){const n=this.terrain;if(!n)return 0;const i=n.R,s=Math.min(Math.max(e*i,0),n.nx-1.001),a=Math.min(Math.max(t*i,0),n.nz-1.001),o=Math.floor(s),l=Math.floor(a),c=s-o,h=a-l,u=n.H,d=n.nx,f=u[l*d+o],m=u[l*d+o+1],v=u[(l+1)*d+o],g=u[(l+1)*d+o+1];return f+(m-f)*c+(v-f)*h+(f-m-v+g)*c*h}buildTerrain(e,t){const n=e.map,i=e.mw,s=e.mh,a=4,o=(Q,se)=>n.rows[Math.min(s-1,Math.max(0,se))][Math.min(i-1,Math.max(0,Q))],l=(Q,se)=>Ar(e,Math.min(i-1,Math.max(0,Q)),Math.min(s-1,Math.max(0,se))),c=new Float32Array(i*s),h=[];let u=!1;for(let Q=0;Q<s;Q++)for(let se=0;se<i;se++){const Me=o(se,Q),j=l(se,Q),te=Li(j),le=sr(j);let ie=.04,de=Ce(te[0]).lerp(Ce(te[1]),Ks(se*.7,Q*.7));const fe=[[1,0],[-1,0],[0,1],[0,-1]].some(([_e,Je])=>o(se+_e,Q+Je)==="~");Me==="~"?(ie=-.55,u=!0,de=le==="rock"?Ce("#2a1208"):le==="xmas"?Ce("#9ab0c0"):Ce("#b8a678").multiplyScalar(.7)):Me==="^"?(ie=.85+Ks(se*1.3,Q*1.3)*.6,de=Ce(le==="xmas"?"#f4f8ff":le==="schlager"?"#c89aa8":"#7a7066")):Me==="#"?(ie=.06,de=Ce(te[2]).multiplyScalar(.8)):Me==="p"?de=Ce("#a39a8c"):"hHDSM".includes(Me)?de=Ce("#8a8478"):Me==="T"&&de.multiplyScalar(.82),fe&&Me!=="~"&&(le==="town"||le==="schlager")&&de.lerp(Ce("#d8c890"),.45),c[Q*i+se]=ie,h.push(de)}const d=i*a+1,f=s*a+1,m=new Mn(i,s,i*a,s*a);m.rotateX(-Math.PI/2),m.translate(i/2,0,s/2);const v=m.attributes.position,g=new Float32Array(v.count*3),p=new Float32Array(d*f),x=new ue;for(let Q=0;Q<f;Q++)for(let se=0;se<d;se++){const Me=se/a,j=Q/a,te=Me-.5,le=j-.5,ie=Math.floor(te),de=Math.floor(le),fe=La(te-ie),_e=La(le-de),Je=(P,S)=>[Math.min(i-1,Math.max(0,P)),Math.min(s-1,Math.max(0,S))],Be=(P,S)=>{const[z,Z]=Je(P,S);return Z*i+z},Qe=Be(ie,de),U=Be(ie+1,de),vt=Be(ie,de+1),Fe=Be(ie+1,de+1);let Ne=c[Qe]*(1-fe)*(1-_e)+c[U]*fe*(1-_e)+c[vt]*(1-fe)*_e+c[Fe]*fe*_e;x.setRGB(0,0,0),x.r=h[Qe].r*(1-fe)*(1-_e)+h[U].r*fe*(1-_e)+h[vt].r*(1-fe)*_e+h[Fe].r*fe*_e,x.g=h[Qe].g*(1-fe)*(1-_e)+h[U].g*fe*(1-_e)+h[vt].g*(1-fe)*_e+h[Fe].g*fe*_e,x.b=h[Qe].b*(1-fe)*(1-_e)+h[U].b*fe*(1-_e)+h[vt].b*(1-fe)*_e+h[Fe].b*fe*_e;const Ae=Ks(Me*.9,j*.9)-.5;(t||Ne>.3)&&(Ne+=Ae*.08+(Ks(Me*3.1,j*3.1)-.5)*.03),Ne>.5&&(Ne+=(Ks(Me*2.2,j*2.2)-.5)*.35);const $e=1+Ae*.16,Te=Q*d+se;p[Te]=Ne,v.setY(Te,Ne),g[Te*3]=x.r*$e,g[Te*3+1]=x.g*$e,g[Te*3+2]=x.b*$e}m.setAttribute("color",new St(g,3)),m.computeVertexNormals();const T=sr(n.world?"town":n.theme),_=n.world||n.town?"grass":T==="rap"||T==="static"?"tile":T==="rock"?"crack":T==="xmas"?"snow":"grass",D=Ma(_),E=_==="tile"?.5:.35,R=D.map.clone(),w=D.normal.clone();R.repeat.set(i*E,s*E),w.repeat.set(i*E,s*E),R.needsUpdate=w.needsUpdate=!0;const M=new Rt({vertexColors:!0,map:R,normalMap:w,normalScale:new ae(.9,.9),roughness:_==="tile"?.7:.93,metalness:0}),y=new Oe(m,M);y.receiveShadow=!0,y.userData.ownGeo=y.userData.ownMat=!0,M.userData.ownTex=!0;const C=new It;C.add(y);const L=70,I=new Oe(new Mn(i+2*L,s+2*L),new Rt({color:t?Ce("#1a3a5a"):Ce(Li(n.theme)[2]).multiplyScalar(.5),roughness:1}));if(I.rotation.x=-Math.PI/2,I.position.set(i/2,t?-.9:-.7,s/2),I.receiveShadow=!0,I.userData.ownGeo=I.userData.ownMat=!0,C.add(I),!t){const Q=new Oe(new Gi(i+2*L,3,s+2*L),new Rt({color:Ce(Li(n.theme)[2]).multiplyScalar(.35),roughness:1,side:zt}));Q.position.set(i/2,1.4,s/2),Q.scale.set(1,1,1),Q.visible=!1,C.add(Q)}const O=4,V={x:-L,y:-L,w:i+2*L,h:s+2*L},B=V.w*O,$=V.h*O,G=new Uint8Array(B*$*4),H={R:a,nx:d,nz:f,H:p};this.terrain=H;for(let Q=0;Q<$;Q++)for(let se=0;se<B;se++){const Me=V.x+(se+.5)/O,j=V.y+(Q+.5)/O;let te=1;Me>=0&&j>=0&&Me<=i&&j<=s&&(te=Math.min(1,Math.max(0,(_u-this.heightAt(Me,j))/.4)));const le=(($-1-Q)*B+se)*4;G[le]=G[le+1]=G[le+2]=te*255,G[le+3]=255}const K=new Xi(G,B,$,qt);return K.magFilter=K.minFilter=yt,K.needsUpdate=!0,Object.assign(H,{mesh:C,depthTex:K,area:V,hasLiquid:u})}addInstances(e,t,n,i,s){t.scene.updateMatrixWorld(!0),t.scene.traverse(a=>{if(!a.isMesh)return;let o=a.material;i&&(o=Bl([].concat(o)[0].clone(),.05,2,!0)),s&&(o=[].concat(o)[0].clone(),o.color=Ce("#9aa0b0"),o.roughness=.85);const l=new lr(a.geometry,o,n.length),c=a.matrixWorld;n.forEach((h,u)=>l.setMatrixAt(u,new Pe().multiplyMatrices(h,c))),l.instanceMatrix.needsUpdate=!0,l.castShadow=!s,l.receiveShadow=!0,l.computeBoundingSphere(),(i||s)&&(l.userData.ownMat=!0),e.add(l)})}buildGrass(e,t,n){const i=this.Q.grass,s=e.map,a=c=>["town","schlager"].includes(sr(c))||c==="ow_rap"||c==="ow_rock",o=[],l=[];for(let c=0;c<e.mh;c++)for(let h=0;h<e.mw;h++){const u=s.rows[c][h],d=Ar(e,h,c);u===","&&l.push([h,c,d]),i&&(u==="."||u===","||u==="T")&&a(d)&&(n||t==="schlager")&&o.push([h,c,d])}if(o.length){const c=new gt,h=[],u=[],d=[],f=3;for(let w=0;w<=f;w++){const M=w/f,y=.035*(1-M*.85);h.push(-y,M*.32,M*M*.06,y,M*.32,M*M*.06);const C=.45+.55*M;u.push(C,C,C,C,C,C)}for(let w=0;w<f;w++){const M=w*2;d.push(M,M+1,M+2,M+1,M+3,M+2)}c.setAttribute("position",new je(h,3)),c.setAttribute("color",new je(u,3)),c.setIndex(d),c.computeVertexNormals();const m=Bl(new Rt({vertexColors:!0,side:xt,roughness:.8}),.07,.32),v=o.length*i,g=new lr(c,m,v),p=new Pe,x=new jt,T=new A(0,1,0),_=new A,D=new A,E=new ue;let R=0;for(const[w,M,y]of o){const C=Li(y),L=xr(e,{x:w,y:M})||ka(e,{x:w,y:M});for(let I=0;I<i;I++){const O=Wt(w*13+I,M*7),V=Wt(M*11+I,w*5+I);D.set(w+O,0,M+V),D.y=this.heightAt(D.x,D.z)-.01;const B=L?.01:.7+Wt(I,w+M)*.9;_.set(1,B,1),x.setFromAxisAngle(T,Wt(w+I,M)*Math.PI*2),p.compose(D,x,_),g.setMatrixAt(R,p),E.set(C[0]).lerp(Ce(C[3]||C[1]),Wt(I*3,M+w)*.6).multiplyScalar(1.05),g.setColorAt(R,E),R++}}g.instanceMatrix.needsUpdate=!0,g.instanceColor&&(g.instanceColor.needsUpdate=!0),g.receiveShadow=!0,g.castShadow=!1,g.userData.ownGeo=g.userData.ownMat=!0,g.frustumCulled=!1,this.world.add(g)}if(l.length){const c=new pc(.05,0),h=new Rt({roughness:.4,emissive:Ce("#ffffff"),emissiveIntensity:0});h.onBeforeCompile=g=>{g.fragmentShader=g.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
 totalEmissiveRadiance = vColor * `+(n?"0.25":"1.6")+";")},h.vertexColors=!1;const u=5,d=new lr(c,h,l.length*u),f=new Pe,m=new ue;let v=0;for(const[g,p,x]of l){const T=Li(x);for(let _=0;_<u;_++){const D=g+.15+Wt(g+_*3,p)*.7,E=p+.15+Wt(p+_*5,g)*.7,R=n?.8+Wt(_,g)*.6:.8+Wt(_,p)*1.4;f.makeScale(R,n?R:R*2.2,R).setPosition(D,this.heightAt(D,E)+.05*R,E),d.setMatrixAt(v,f),m.set(_%2?T[4]:n?"#ffffff":T[4]),d.setColorAt(v,m),v++}}d.instanceMatrix.needsUpdate=!0,d.instanceColor.needsUpdate=!0,d.userData.ownGeo=d.userData.ownMat=!0,this.world.add(d)}}makePortal(e,t,n){const i=new It,s=Ce("#ff8a8a"),a=(o,l,c=1,h=Math.PI)=>{const u=o.box&&e!=="cave"?this.brightClone(o,"#ffe6cc"):o.scene.clone(),d=o.box,f=d.getSize(new A),m=l/Math.max(.3,f.x);u.scale.set(m,m*c,m),u.position.set(-(d.min.x+f.x/2)*m,-d.min.y*m*c,-(d.min.z+f.z/2)*m),t||u.traverse(g=>{g.isMesh&&(g.material=[].concat(g.material).map(p=>{const x=p.clone();return x.color=x.color.clone().multiply(s),x}).reduce((p,x,T,_)=>_.length===1?x:_))});const v=new It;return v.add(u),v.rotation.y=h,i.add(v),v};if(e==="town")a(n["bld_2Story_GableRoof_Mat.glb"],1.9);else if(e==="cave"){a(n["grave/crypt.glb"],2);const o=new Oe(new ys(.36,24),new ft({color:t?Ce("#7ae8ff").multiplyScalar(2.2):Ce("#ff3030").multiplyScalar(1.6),transparent:!0,opacity:.85}));o.position.set(0,.45,.78),o.userData.ownGeo=o.userData.ownMat=!0,i.add(o)}else if(e==="tower"){a(n["bld_2Story_Slim_Mat.glb"],1.4,1.7);const o=new Oe(new Ls(.16,16,12),new ft({color:Ce(t?"#7cff9a":"#ff4040").multiplyScalar(3)}));o.position.y=3.2,o.userData.ownGeo=o.userData.ownMat=!0,o.userData.pulse=!0,i.add(o)}else{const o=Ce(t?"#46e6ff":"#ff5a5a"),l=new Oe(new Da(.4,.06,12,40),new Rt({color:o,emissive:o,emissiveIntensity:2.2,roughness:.3}));l.position.y=.55,l.userData.spin=1.5;const c=new Oe(new ys(.36,32),new ft({color:o.clone().multiplyScalar(1.4),transparent:!0,opacity:.35,side:xt,depthWrite:!1}));c.position.y=.55,c.userData.spin=-2.5;const h=new Oe(new Ms(.5,.58,.08,32),new Rt({color:Ce("#3a3f52"),roughness:.5,metalness:.3}));h.position.y=.04,h.receiveShadow=!0;for(const u of[l,c,h])u.userData.ownGeo=u.userData.ownMat=!0,i.add(u);i.userData.face=[l,c]}return i}brightClone(e,t){if(!e.bright){e.bright=e.scene.clone();const n=new ue,i=new ue;Ce(t).getRGB(n,dt),e.bright.traverse(s=>{s.isMesh&&(s.material=[].concat(s.material).map(a=>{const o=a.clone();o.color.getRGB(i,dt);const l=c=>Math.min(1,c*1.5+.24*(1-c));return i.setRGB(l(i.r)*n.r,l(i.g)*n.g,l(i.b)*n.b),o.color.setRGB(i.r,i.g,i.b,dt),a.name==="RoofBricks"&&o.color.set("#9c5a46"),o.roughness=.8,o}).reduce((a,o,l,c)=>c.length===1?o:c))})}return e.bright.clone()}async actorHero(e,t=!1){const n=await Ot(fu(Ry[e])),i=ca(n,3*Cy[e]);return this.addBlob(i.root,t?1.1:.9),An(i,"idle"),i}async actorNpc(e){const t=Py[e],n=await Ot(fu(t[0])),i=ca(n,3*t[2],t[1]);return this.addBlob(i.root,.9),An(i,"idle"),i}async actorMonster(e,t){const n=Tu[e],i=await Ot(Dy(n)),s=ca(i,n.h*t,n.tint||"#ffffff");return An(s,"idle"),s}addBlob(e,t){const n=new Oe(new Mn(t,t*.8),new ft({map:Fo(),transparent:!0,depthWrite:!1}));n.rotation.x=-Math.PI/2,n.position.y=.025,n.renderOrder=1,n.userData.ownGeo=n.userData.ownMat=!0,e.add(n)}face(e,t,n,i,s=1){if(!t&&!n)return;let o=Math.atan2(t,n)-e.pivot.rotation.y;o=Math.atan2(Math.sin(o),Math.cos(o)),e.pivot.rotation.y+=o*Math.min(1,i*14*s)}syncDyn(e){const t=this.g.S,n=new Set;for(const o of t.objs){const l="o"+o.uid;n.add(l),this.dyn.has(l)||this.makeObj(l,o);const c=this.dyn.get(l);if(o.t==="block"){const h=o.x+.5,u=o.y+.5,d=e>0?Math.min(1,e*10):1;c.n.position.x+=(h-c.n.position.x)*d,c.n.position.z+=(u-c.n.position.z)*d,c.n.position.y=this.heightAt(c.n.position.x,c.n.position.z)}else o.t==="torch"&&c.lit!==!!o.lit&&this.setTorch(c,!!o.lit)}for(const o of t.roamers){const l="r"+o.uid;if(n.add(l),!this.dyn.has(l)){const m={n:new It,k:"roamer",a:null,r:o};this.world.add(m.n),this.dyn.set(l,m),this.actorMonster(o.id,.62).then(v=>{this.dyn.get(l)===m&&(this.addBlob(v.root,.9),An(v,"walk"),m.a=v,m.n.add(v.root))})}const c=this.dyn.get(l),h=o.pos.x+.5,u=o.pos.y+.5,d=h-c.n.position.x,f=u-c.n.position.z;if(c.n.position.set(h,this.heightAt(h,u),u),c.a){Math.abs(d)+Math.abs(f)>5e-4&&e>0?(this.face(c.a,d,f,e),An(c.a,"walk")):An(c.a,"idle");const m=o.stun>0;c.stun!==m&&(c.stun=m,this.setOpacity(c.a.root,m?.45:1))}}for(const[o,l]of this.dyn){if(l.k==="portal"){const c=Vo(t,l.p);if(c!==l.open){const h=this.makePortal(l.kind,c,l.models);h.position.copy(l.n.position),this.world.remove(l.n),this.world.add(h);for(const u of this.labels)u.node===l.n&&(u.node=h);l.n=h,l.open=c}continue}n.has(o)||(this.dyn.delete(o),l.k==="obj"&&["chest","gate","rock","bramble","seal"].includes(l.o.t)?this.dying.push({...l,life:["rock","bramble","seal"].includes(l.o.t)?1.2:0,burst:l.o.t!=="chest"&&l.o.t!=="gate"}):this.world.remove(l.n))}const i=t.party[0]?t.party[0].id:"andrew";if(this.playerLead!==i){this.playerLead=i,this.player&&this.world.remove(this.player.root);const o={root:new It,a:null};this.player=o,this.world.add(o.root),this.actorHero(i).then(l=>{this.player===o&&(o.a=l,o.root.add(l.root),l.pivot.rotation.y=Math.atan2(t.face.x,t.face.y))})}const s=t.ppos.x+.5,a=t.ppos.y+.5;this.player.root.position.set(s,this.heightAt(s,a),a),this.player.a&&(this.face(this.player.a,t.face.x,t.face.y,e),An(this.player.a,t.moving?"walk":"idle"))}setOpacity(e,t){e.traverse(n=>{if(!(!n.isMesh||n.material.map===Fo()))for(const i of[].concat(n.material))i.transparent=t<1,i.opacity=t,i.depthWrite=t>=1})}makeObj(e,t){const n=t.d,i={n:new It,k:"obj",o:t,a:null};i.n.position.set(t.x+.5,this.heightAt(t.x+.5,t.y+.5),t.y+.5),this.world.add(i.n),this.dyn.set(e,i);const s=()=>this.dyn.get(e)===i;if(t.t==="npc")n.kind==="heal"?Ot("town/fountain-round.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.setScalar(.5),i.n.add(o);const l=new Oe(new ys(.4,32),new Rt({color:Ce("#4ab8ff"),emissive:Ce("#2a90ff"),emissiveIntensity:1.4,roughness:.1,transparent:!0,opacity:.85}));l.rotation.x=-Math.PI/2,l.position.y=.12,l.userData.ownGeo=l.userData.ownMat=!0,i.n.add(l);const c=new vn(Ce("#6ac8ff"),3,3.5,1.6);c.position.y=.7,i.n.add(c),i.fountain=!0}):this.actorNpc(n.kind).then(a=>{s()&&(i.a=a,i.n.add(a.root))});else if(t.t==="chest")Ot("dungeon/chest.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.setScalar(1.7),o.rotation.y=Math.PI,i.n.add(o),i.lid=o.getObjectByName("lid"),this.addBlob(i.n,1),n.kind==="key"&&Ot("dungeon/key.glb").then(l=>{if(!s())return;const c=l.scene.clone();c.scale.setScalar(1.4),c.position.y=1.2,c.traverse(h=>{h.isMesh&&(h.material=h.material.clone(),h.material.emissive=Ce("#ffb020"),h.material.emissiveIntensity=.8)}),i.n.add(c),i.spin=c})});else if(t.t==="gate")Ot("dungeon/gate.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.set(1.35,1.6,1.35),o.rotation.y=Math.PI/2,i.n.add(o),i.door=o.getObjectByName("door")});else if(t.t==="boss")this.actorMonster(n.id,1).then(a=>{if(!s())return;i.a=a,i.n.add(a.root),this.addBlob(a.root,2.4);const o=new Oe(new ki(.9,1.15,48),new ft({color:Ce("#ff3040").multiplyScalar(2.5),transparent:!0,opacity:.6,side:xt,depthWrite:!1}));o.rotation.x=-Math.PI/2,o.position.y=.04,o.userData.ownGeo=o.userData.ownMat=!0,i.n.add(o),i.ring=o});else if(t.t==="block"){const a=Li(this.theme||"rap"),o=new Oe(new Gi(.86,.86,.86,2,2,2),new Rt({color:Ce(a[2]).lerp(Ce("#8a8478"),.6),roughness:.85,metalness:.05,map:Ma("tile").map,normalMap:Ma("tile").normal}));o.position.y=.43,o.castShadow=o.receiveShadow=!0;const l=new Oe(new ki(.14,.2,6),new ft({color:Ce(ps[this.theme||"rap"].accent).multiplyScalar(2.2),transparent:!0,opacity:.9,side:xt}));l.position.y=.865,l.rotation.x=-Math.PI/2,o.userData.ownGeo=o.userData.ownMat=l.userData.ownGeo=l.userData.ownMat=!0,i.n.add(o,l),this.addBlob(i.n,1)}else if(t.t==="torch"){Ot("dungeon/column.glb").then(l=>{if(!s())return;const c=l.scene.clone(),h=new wn().setFromObject(c).getSize(new A);c.scale.set(.45/Math.max(.01,h.x),1.25/Math.max(.01,h.y),.45/Math.max(.01,h.z)),c.traverse(u=>{u.isMesh&&(u.castShadow=!0)}),i.n.add(c)});const a=new Oe(new Ms(.26,.14,.18,16),new Rt({color:Ce("#3a2a1a"),metalness:.7,roughness:.4}));a.position.y=1.32;const o=new Oe(new Pa(.16,.5,12),new ft({color:Ce("#ffb040").multiplyScalar(3),transparent:!0,opacity:.9,depthWrite:!1}));o.position.y=1.62,a.userData.ownGeo=a.userData.ownMat=o.userData.ownGeo=o.userData.ownMat=!0,i.n.add(a,o),i.flame=o,this.setTorch(i,!!t.lit)}else if(t.t==="rock")Ot("town/rock-large.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.setScalar(.55),o.rotation.y=(t.x*7+t.y*3)%6,o.traverse(l=>{l.isMesh&&(l.castShadow=!0,l.material=l.material.clone(),l.material.color.multiplyScalar(.8),l.material.emissive=Ce("#ffd27a"),l.material.emissiveIntensity=.06)}),i.n.add(o)}),i.glint=this.makeGlint("#ffe9a0"),i.glint.position.y=.7,i.n.add(i.glint),this.addBlob(i.n,1.1);else if(t.t==="bramble"){const a=new It,o=new Rt({color:Ce("#2e3a1c"),roughness:.8}),l=new Rt({color:Ce("#6a2a3a"),roughness:.5});for(let c=0;c<7;c++){const h=c*.9+t.x,u=[];for(let f=0;f<=6;f++)u.push(new A(Math.cos(h+f*.8)*(.15+f*.05),.05+f*.15,Math.sin(h+f*.8)*(.15+f*.05)));const d=new Oe(new mc(new gd(u),24,.035,5),o);d.castShadow=!0,a.add(d);for(let f=1;f<6;f++){const m=new Oe(new Pa(.025,.12,4),l);m.position.copy(u[f]),m.lookAt(u[f].clone().multiplyScalar(2)),m.rotateX(Math.PI/2),a.add(m)}}a.traverse(c=>{c.isMesh&&(c.userData.ownGeo=!0)}),a.children[0].userData.ownMat=a.children[1].userData.ownMat=!0,i.n.add(a),i.glint=this.makeGlint("#ff9ad0"),i.glint.position.y=.5,i.n.add(i.glint),this.addBlob(i.n,1)}else if(t.t==="seal"){const a=Ce(ps[this.theme||"rap"].accent),o=new Oe(new Mn(.98,1.9),new ft({color:a.clone().multiplyScalar(1.6),transparent:!0,opacity:.35,side:xt,depthWrite:!1,blending:Ln}));o.position.y=.95,o.rotation.y=Math.PI/2;const l=new Oe(new Da(.42,.03,8,48),new ft({color:a.clone().multiplyScalar(3)}));l.position.y=.95,l.rotation.y=Math.PI/2;const c=new Oe(new ki(.18,.24,6),new ft({color:a.clone().multiplyScalar(3),side:xt}));c.position.y=.95,c.rotation.y=Math.PI/2;for(const u of[o,l,c])u.userData.ownGeo=u.userData.ownMat=!0;const h=new vn(a,4,4,1.6);h.position.y=1,i.n.add(o,l,c,h),i.seal={wall:o,ring:l,inner:c}}}makeGlint(e){const t=new E_(new ud({map:Fo(),color:Ce(e).multiplyScalar(3),transparent:!0,depthWrite:!1,blending:Ln}));return t.scale.setScalar(.18),t.userData.ownMat=!0,t}setTorch(e,t){e.lit=t,e.flame&&(e.flame.visible=t),t&&!e.light&&(e.light=new vn(Ce("#ffa040"),7,6,1.6),e.light.position.y=1.8,e.n.add(e.light))}shake(e){this.g.mode===2?this.battle.shakeT=Math.max(this.battle.shakeT||0,e):this.shakeT=Math.max(this.shakeT,e)}screenPos(e,t,n){const i=this.battle.pos(e,t,n);return i?this.project(i):null}battleBegin(e,t,n,i){return this.battle.begin(e,t,n,i)}battleCap(e,t){this.battle.capsule(e,t)}async actorCapsule(e){const t=Rn[e.id].forms[e.form],n=await Ot(`mon_${t.model}.glb`),i=ca(n,t.h,t.tint);return this.addBlob(i.root,t.h),An(i,"idle"),i}battleEnd(){this.battle.end(),this.renderer.toneMappingExposure=ps[this.theme||"town"].expo}battleHero(e,t,n){this.battle.hero(e,t,n)}battleEnemy(e,t,n){this.battle.enemy(e,t,n)}battleEnemyDown(e){this.battle.enemyDown(e)}battleFx(e,t,n){this.battle.fxAt(e,t,n)}fxWorld(e,t){if(t&&["torch","smash","burn","seal"].includes(e)){const n=new A(t.x+.5,e==="torch"?1.6:.6,t.y+.5);e==="torch"&&this.fx.burst(n,"#ffb040",50,1.6,.9,1.5,.1,this.world),e==="smash"&&(this.fx.burst(n,"#b8a890",70,3,1,-6,.12,this.world),this.fx.burst(n,"#ffe27a",24,2,1.2,-1,.07,this.world),this.shake(.25)),e==="burn"&&(this.fx.burst(n,"#ff6a20",80,2.2,1.1,2,.11,this.world),this.fx.burst(n,"#3a2a20",30,1.2,1.6,.8,.14,this.world)),e==="seal"&&(n.y=1,this.fx.burst(n,ps[this.theme||"rap"].accent,140,4,1.6,-1,.12,this.world),this.fx.burst(n,"#ffffff",50,2.5,1,0,.08,this.world),this.shake(.3));return}if(e==="heal"){const n=this.g.S.objs.find(i=>i.t==="npc"&&i.d.kind==="heal");n&&this.fx.burst(new A(n.x+.5,.6,n.y+.5),"#7ad8ff",60,2.2,1.4,-1.5,.12,this.world),this.player&&this.fx.burst(this.player.root.position.clone().add(new A(0,.8,0)),"#8affb0",40,1.2,1.2,-1.2,.1,this.world)}}frame(e){this.t+=e,Rd.t.value=this.t;const t=this.g,n=t.mode;if(this.setMode(n),n===2){this.battle.update(e),this.render(this.battle.scene);return}const i=t.S;if(this.built!==i.mapId+"|"+this.qi&&this.build(),this.terrain&&!this.building){this.syncDyn(e);for(const s of this.dyn.values()){if(s.a?.mixer?.update(e),s.spin&&(s.spin.rotation.y+=e*2,s.spin.position.y=1.2+Math.sin(this.t*2.5)*.08),s.ring&&(s.ring.material.opacity=.4+Math.sin(this.t*4)*.2),s.flame&&s.lit&&(s.flame.scale.set(1+Math.sin(this.t*17)*.1,1+Math.sin(this.t*11+1)*.18,1),s.light&&(s.light.intensity=6+Math.sin(this.t*13)*1.2)),s.glint){const a=(Math.sin(this.t*2.2+s.o.x)+1)/2;s.glint.material.opacity=a*a,s.glint.scale.setScalar(.1+a*.22)}if(s.seal&&(s.seal.ring.rotation.x+=e*1.2,s.seal.inner.rotation.x-=e*2,s.seal.wall.material.opacity=.28+Math.sin(this.t*3)*.1),s.k==="portal"&&s.n.traverse(a=>{a.userData.spin&&(a.rotation.z+=e*a.userData.spin),a.userData.pulse&&a.scale.setScalar(1+Math.sin(this.t*5)*.2)}),s.k==="obj"&&s.o.t==="npc"&&s.a&&this.player){const a=this.player.root.position,o=s.n.position,l=Math.hypot(a.x-o.x,a.z-o.z);this.face(s.a,l<2.6?a.x-o.x:0,l<2.6?a.z-o.z:1,e,.4)}if(s.k==="portal"&&s.n.userData.face)for(const a of s.n.userData.face)a.lookAt(this.camera.position.x,a.getWorldPosition(new A).y,this.camera.position.z),a.rotateZ(this.t*(a.userData.spin||1))}for(const s of this.plates||[]){const a=i.objs.some(o=>o.t==="block"&&o.x===s.x&&o.y===s.y)?1:0;s.on+=(a-s.on)*Math.min(1,e*6),s.m.material.emissiveIntensity=.25+s.on*2.2,s.r.material.opacity=.35+s.on*.6+Math.sin(this.t*3)*.1*(1-s.on)}for(const s of this.dying)s.life+=e,s.lid&&(s.lid.rotation.x=-Math.min(1,s.life*3)*1.9),s.door&&(s.door.position.y=-Math.min(1,s.life*1.2)*.8),s.spin&&(s.spin.position.y=1.2+s.life*1.5,s.spin.rotation.y+=e*8),!s.burst&&s.life>.15&&(s.burst=!0,this.fx.burst(s.n.position.clone().add(new A(0,.6,0)),s.o.t==="gate"?"#ffd27a":"#ffe27a",40,2,1,-2,.09,this.world)),s.life>1.4&&s.n.scale.setScalar(Math.max(.001,1-(s.life-1.4)*3));this.dying=this.dying.filter(s=>s.life>1.8?(this.world.remove(s.n),!1):!0),this.player?.a?.mixer?.update(e),this.liquid&&(this.liquid.uniforms.t.value=this.t),this.updateCamera(e,n===0),Ia.on.value=n===0||!this.player?0:1,this.player&&Ia.p.value.copy(this.player.root.position).add(new A(0,.9,0)),this.playerLight&&this.player&&this.playerLight.position.copy(this.player.root.position).add(new A(0,1.6,.4)),this.particles&&(this.particles.material.uniforms.t.value=this.t,this.particles.material.uniforms.center.value.copy(this.camTarget),this.particles.material.uniforms.scale.value=this.H*.9)}this.fx.update(e),this.render(this.world)}updateCamera(e,t){const n=this.g.S,i=this.camera;if(t){const D=this.t*.08,E=new A(n.mw/2,.5,n.mh/2+.5);this.camTarget.copy(E),i.position.set(E.x+Math.sin(D)*12,7.5,E.z+Math.cos(D)*12),i.lookAt(E),this.placeSun(this.world,E);return}const s=n.ppos,a=this.cine,o=a?new A(a.x,a.h??.9,a.z):new A(s.x+.5,this.heightAt(s.x+.5,s.y+.5)+.9,s.y+.5);this.camKeys&&(this.camYawT+=this.camKeys*e*2.2);let c=(a&&a.yaw!==void 0?a.yaw:this.camYawT)-this.camYaw;c=Math.atan2(Math.sin(c),Math.cos(c));const h=Math.min(1,e*(a?2.2:8));this.camYaw+=c*h;const u=xu[this.camZoom],d=a?a.pitch??.32:u[0],f=a?a.dist??6:u[1],m=(D,E)=>{const R=Math.sin(this.camYaw)*Math.cos(D),w=Math.cos(this.camYaw)*Math.cos(D),M=Math.sin(D);for(let y=.6;y<E;y+=.25)if(o.y+M*y<this.obstacleAt(o.x+R*y,o.z+w*y)+.25)return y;return 0};let v=d,g=f;if(!a){for(let E=d;E<=1.25&&(v=E,!!m(E,f));E+=.08);const D=m(v,f);D&&(g=Math.max(1.6,D-.35))}this.camPitch+=(v-this.camPitch)*Math.min(1,e*5);const p=Math.sin(this.camYaw)*Math.cos(this.camPitch),x=Math.cos(this.camYaw)*Math.cos(this.camPitch),T=Math.sin(this.camPitch);this.camInit?(this.camTarget.lerp(o,Math.min(1,e*(a?2.5:9))),this.camD+=(g-this.camD)*Math.min(1,e*(g<this.camD?14:3))):(this.camTarget.copy(o),this.camD=g,this.camInit=!0),i.position.set(this.camTarget.x+p*this.camD,this.camTarget.y+T*this.camD,this.camTarget.z+x*this.camD);const _=this.heightAt(i.position.x,i.position.z)+.35;i.position.y<_&&(i.position.y=_),this.shakeT>0&&(this.shakeT-=e,i.position.x+=(Math.random()-.5)*.15,i.position.y+=(Math.random()-.5)*.1),i.lookAt(this.camTarget.x,this.camTarget.y+.25,this.camTarget.z),this._sunC=(this._sunC||new A).set(this.camTarget.x-p*5,0,this.camTarget.z-x*5),this.placeSun(this.world,this._sunC)}obstacleAt(e,t){const n=this.g.S,i=Math.floor(e),s=Math.floor(t);if(i<0||s<0||i>=n.mw||s>=n.mh)return n.map.world||n.map.town?-1:2.1;const a=n.map.rows[s][i],o=this.heightAt(e,t);return a==="#"?2.1:"hHDSM".includes(a)?3.2:a==="T"?o+2.8:o}camQuad(){return(Math.round(this.camYaw/(Math.PI/2))%4+4)%4}rotateCam(e){this.camYawT+=e}zoomCam(e){this.camZoom=Math.max(0,Math.min(xu.length-1,this.camZoom+e)),this.onCam?.()}render(e){this.composer?(this.renderPass.scene=e,this.renderPass.camera=this.camera,this.gtao&&(this.gtao.scene=e,this.gtao.camera=this.camera),this.composer.render()):this.renderer.render(e,this.camera)}project(e){const t=e.clone().project(this.camera);return{x:(t.x*.5+.5)*this.W,y:(-t.y*.5+.5)*this.H,vis:t.z<1&&t.z>-1}}watchFps(e,t){if(!t&&(this.fpsT+=e,this.fpsN++,this.fpsT>=2)){const n=this.fpsN/this.fpsT;this.fpsT=0,this.fpsN=0,this.lowFor=n<40?this.lowFor+1:0,this.lowFor>=2&&this.qi>0&&(this.lowFor=0,this.setQuality(this.qi-1),this.onQuality?.(this.qi))}}}function qy(r){try{const e=new DataView(r.buffer,r.byteOffset,r.byteLength);let t=4;const n=()=>{const o=e.getUint32(t,!0);return t+=4,o},i=()=>{const o=e.getInt32(t,!0);return t+=4,o},s=(o=0)=>{if(o>16)throw new Error("tief");const l=n(),c=l&255,h=l>>16&1;switch(c){case 0:return null;case 1:return n()!==0;case 2:{if(h){const u=Number(e.getBigInt64(t,!0));return t+=8,u}return i()}case 3:{if(h){const d=e.getFloat64(t,!0);return t+=8,d}const u=e.getFloat32(t,!0);return t+=4,u}case 4:case 21:{const u=n(),d=new TextDecoder().decode(new Uint8Array(r.buffer,r.byteOffset+t,u));return t+=u+(4-u%4)%4,d}case 5:{const u=e.getFloat32(t,!0),d=e.getFloat32(t+4,!0);return t+=8,{x:u,y:d}}case 6:{const u=i(),d=i();return{x:u,y:d}}case 27:{const u=n()&2147483647,d={};for(let f=0;f<u;f++){const m=s(o+1);d[String(m)]=s(o+1)}return d}case 28:{const u=n()&2147483647,d=[];for(let f=0;f<u;f++)d.push(s(o+1));return d}default:throw new Error("Typ "+c)}},a=s();return!a||!Array.isArray(a.party)||!a.map?null:{v:2,party:a.party,inv:a.inv||{},gold:a.gold|0,gear:a.gear|0,flags:a.flags||{},map:a.map,gp:a.gp,t:+a.t||0}}catch{return null}}function jy(){return new Promise(r=>{if(typeof indexedDB>"u")return r(null);let e;try{e=indexedDB.open("/userfs")}catch{return r(null)}e.onupgradeneeded=()=>{try{e.transaction.abort()}catch{}r(null)},e.onerror=()=>r(null),e.onsuccess=()=>{const t=e.result;if(!t.objectStoreNames.contains("FILE_DATA"))return t.close(),r(null);let n=null;const i=t.transaction("FILE_DATA","readonly").objectStore("FILE_DATA").openCursor();i.onsuccess=()=>{const s=i.result;if(!s)return t.close(),r(n);typeof s.key=="string"&&/anmacha_quest2\.save$/.test(s.key)&&s.value&&s.value.contents&&(n=qy(new Uint8Array(s.value.contents))),s.continue()},i.onerror=()=>{t.close(),r(n)}}})}const Kt=r=>440*Math.pow(2,(r-69)/12),$y={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],hmin:[0,2,3,5,7,8,11],lyd:[0,2,4,6,7,9,11]},Yy={title:{bpm:76,root:50,sc:"min",prog:[0,5,2,6,0,3,4,4],lead:"horn",pad:"str",arp:"harp",drums:"epic",choir:!0,seed:11,dens:.55},intro:{bpm:64,root:48,sc:"min",prog:[0,5,3,4],lead:"flute",pad:"str",arp:"harp",drums:"",choir:!0,seed:3,dens:.4},town:{bpm:96,root:55,sc:"maj",prog:[0,3,4,0,5,3,1,4],lead:"flute",pad:"str",arp:"harp",drums:"light",seed:21,dens:.7},world:{bpm:112,root:53,sc:"maj",prog:[0,4,5,3,0,4,3,4],lead:"horn",pad:"str",arp:"pluck",drums:"march",seed:7,dens:.75},rap:{bpm:84,root:45,sc:"dor",prog:[0,0,6,6,5,5,4,4],lead:"bell",pad:"pad",arp:"pluck",drums:"deep",seed:31,dens:.45},schlager:{bpm:100,root:57,sc:"lyd",prog:[0,1,0,4,5,1,4,4],lead:"flute",pad:"str",arp:"harp",drums:"light",seed:41,dens:.6},xmas:{bpm:72,root:52,sc:"min",prog:[0,5,3,4,0,5,6,4],lead:"bell",pad:"pad",arp:"harp",drums:"",choir:!0,seed:51,dens:.45},rock:{bpm:132,root:45,sc:"hmin",prog:[0,0,5,4,0,0,5,4],lead:"horn",pad:"str",arp:"ostinato",drums:"drive",seed:61,dens:.6},tower:{bpm:70,root:47,sc:"hmin",prog:[0,1,0,4,5,1,4,4],lead:"choirlead",pad:"pad",arp:"bell",drums:"deep",choir:!0,seed:71,dens:.4},battle:{bpm:150,root:50,sc:"min",prog:[0,6,5,4,0,6,3,4],lead:"horn",pad:"str",arp:"ostinato",drums:"drive",seed:81,dens:.8},boss:{bpm:140,root:46,sc:"hmin",prog:[0,0,5,5,3,3,4,4],lead:"horn",pad:"str",arp:"ostinato",drums:"epic",choir:!0,seed:91,dens:.75},final:{bpm:148,root:47,sc:"hmin",prog:[0,1,5,4,0,1,3,4],lead:"horn",pad:"str",arp:"ostinato",drums:"epic",choir:!0,seed:97,dens:.85},ending:{bpm:80,root:53,sc:"maj",prog:[0,4,5,3,0,4,3,4],lead:"flute",pad:"str",arp:"harp",drums:"light",choir:!0,seed:101,dens:.6}};function Ky(r){let e=r>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function Zy(r){const e=Ky(r.seed),t=[[0,4,6,8,12],[0,3,4,8,10,12],[0,6,8,14],[0,2,4,8,12,14],[0,8,12],[0,4,8,10]],n=l=>{const c=[];for(let h=0;h<2;h++){const u=t[Math.floor(e()*t.length)];let d=h===0?[0,2,4][Math.floor(e()*3)]:[1,2,3][Math.floor(e()*3)];u.forEach((f,m)=>{const v=(u[m+1]??16)-f;e()>r.dens+.3&&m>0||(c.push({st:h*16+f,deg:d+l,len:v}),d+=[-1,1,1,2,-2,0][Math.floor(e()*6)])})}return c},i=n(0),s=n(2),a=[],o=(l,c,h)=>l.forEach(u=>a.push({st:c*16+u.st,deg:u.deg+h,len:u.len}));return o(i,0,0),o(i,2,1),o(s,4,0),o(i,6,-1),a}class Jy{constructor(){this.ctx=null,this.on=!0,this.cur=null,this.want=null,this.vol=.8}unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}const e=window.AudioContext||window.webkitAudioContext;if(!e)return;const t=this.ctx=new e;this.master=t.createGain(),this.master.gain.value=this.on?this.vol:0;const n=t.createDynamicsCompressor();n.threshold.value=-16,n.ratio.value=3,this.master.connect(n).connect(t.destination),this.mus=t.createGain(),this.mus.gain.value=.55,this.mus.connect(this.master),this.sfxG=t.createGain(),this.sfxG.gain.value=.7,this.sfxG.connect(this.master);const i=t.sampleRate*2.6,s=t.createBuffer(2,i,t.sampleRate);for(let o=0;o<2;o++){const l=s.getChannelData(o);for(let c=0;c<i;c++)l[c]=(Math.random()*2-1)*Math.pow(1-c/i,3.2)}this.rev=t.createConvolver(),this.rev.buffer=s,this.revG=t.createGain(),this.revG.gain.value=.32,this.rev.connect(this.revG).connect(this.master),this.noise=t.createBuffer(1,t.sampleRate,t.sampleRate);const a=this.noise.getChannelData(0);for(let o=0;o<a.length;o++)a[o]=Math.random()*2-1;if(this.timer=setInterval(()=>this.pump(),25),this.want){const o=this.want;this.want=null,this.music(o)}}setOn(e){this.on=e,this.master&&this.master.gain.setTargetAtTime(e?this.vol:0,this.ctx.currentTime,.1)}music(e){if(this.want===e&&(this.cur?.key===e||!this.ctx)||(this.want=e,!this.ctx))return;const t=this.ctx.currentTime;if(this.cur){const s=this.cur;s.out.gain.setTargetAtTime(0,t,.35),s.stop=!0,setTimeout(()=>s.out.disconnect(),2500)}this.cur=null;const n=Yy[e];if(!n)return;const i=this.ctx.createGain();i.gain.value=0,i.gain.setTargetAtTime(1,t+.15,.4),i.connect(this.mus),this.cur={key:e,tr:n,out:i,step:0,next:t+.2,mel:Zy(n),sec:60/n.bpm/4}}pump(){const e=this.cur,t=this.ctx;if(!(!e||e.stop||t.state!=="running"))for(;e.next<t.currentTime+.12;)this.stepAt(e,e.step,e.next),e.step++,e.next+=e.sec}chord(e,t){const n=$y[e.sc],i=e.prog[t%e.prog.length],s=a=>{const o=Math.floor(a/7);return e.root+n[(a%7+7)%7]+12*o};return{d:i,notes:[s(i),s(i+2),s(i+4)],pc:s}}stepAt(e,t,n){const i=e.tr,s=t%16,a=Math.floor(t/16),o=i.prog.length,l=this.chord(i,a),c=e.sec,h=e.out;if(s===0){for(const m of l.notes)this.voice(i.pad,Kt(m),n,c*16,.07,h);this.voice("bass",Kt(l.notes[0]-12),n,c*8,.22,h),i.choir&&a%2===0&&this.voice("choir",Kt(l.notes[2]),n,c*30,.05,h)}s===8&&this.voice("bass",Kt(l.notes[a%2?1:0]-12),n,c*7,.16,h);const u=i.arp;if(u==="harp"&&s%2===0){const m=[0,1,2,1,2,0,1,2][s/2%8];this.voice("harp",Kt(l.notes[m]+12),n,c*3,.07,h)}if(u==="pluck"&&[0,3,6,8,11,14].includes(s)&&this.voice("pluck",Kt(l.notes[s%3]+12),n,c*2,.07,h),u==="bell"&&s%4===2&&this.voice("bell",Kt(l.notes[(s/4|0)%3]+24),n,c*6,.035,h),u==="ostinato"){const m=[0,0,1,0,2,0,1,0][s%8];this.voice("ost",Kt(l.notes[m]),n,c*.9,.06,h)}const d=Math.floor(a/8);if(d%3!==2){const m=a%8*16+s;for(const v of e.mel)if(v.st===m){const g=this.chord(i,Math.floor(v.st/16)),p=g.pc(v.deg+g.d)+12;this.voice(i.lead,Kt(p),n,c*Math.max(1,v.len)*.95,.12,h),d%3===1&&i.lead!=="flute"&&this.voice("flute",Kt(p+12),n,c*Math.max(1,v.len)*.9,.04,h)}}const f=i.drums;f==="epic"?((s===0||s===10)&&this.drum("timp",n,.5,Kt(l.notes[0]-24)),s===8&&this.drum("snare",n,.18),a%o===o-1&&s>=12&&this.drum("timp",n,.3,Kt(l.notes[0]-24))):f==="drive"?(s%4===0&&this.drum("kick",n,.5),(s===4||s===12)&&this.drum("snare",n,.28),s%2===0&&this.drum("hat",n,.06),s===0&&a%4===0&&this.drum("crash",n,.12)):f==="march"?((s===0||s===8)&&this.drum("kick",n,.35),(s===4||s===12||s===14)&&this.drum("snare",n,.14),s%2===0&&this.drum("hat",n,.035)):f==="light"?(s===0&&this.drum("kick",n,.22),s%4===2&&this.drum("hat",n,.04),s===12&&this.drum("snare",n,.06)):f==="deep"&&(s===0&&this.drum("timp",n,.3,Kt(l.notes[0]-24)),s===6&&a%2&&this.drum("kick",n,.2))}env(e,t,n,i,s,a=.25){e.gain.setValueAtTime(1e-4,t),e.gain.linearRampToValueAtTime(s,t+n),e.gain.setValueAtTime(s,t+Math.max(n,i)),e.gain.exponentialRampToValueAtTime(1e-4,t+Math.max(n,i)+a)}osc(e,t,n,i,s,a=0){const o=this.ctx.createOscillator();return o.type=e,o.frequency.value=t,o.detune.value=a,o.connect(s),o.start(n),o.stop(i+.4),o}voice(e,t,n,i,s,a){const o=this.ctx,l=o.createGain(),c=n+i,h=o.createGain();h.gain.value=e==="bass"||e==="ost"?.1:.5,l.connect(a),l.connect(h),h.connect(this.rev);const u=o.createBiquadFilter();switch(u.type="lowpass",u.connect(l),e){case"str":case"pad":{u.frequency.value=e==="str"?2400:1100,u.Q.value=.4;for(const d of[-8,0,7])this.osc("sawtooth",t,n,c+.6,u,d);this.env(l,n,e==="str"?.35:.6,i,s,.7);break}case"choir":{const d=o.createBiquadFilter();d.type="bandpass",d.frequency.value=900,d.Q.value=1.5,d.connect(l);for(const f of[-12,0,11])this.osc("sawtooth",t,n,c+1,d,f);this.env(l,n,1.2,i,s*1.4,1.2),u.disconnect();break}case"horn":{u.frequency.setValueAtTime(500,n),u.frequency.linearRampToValueAtTime(2600,n+.08),u.frequency.exponentialRampToValueAtTime(1300,n+.4);const d=this.osc("sawtooth",t,n,c,u);this.osc("square",t/2,n,c,u).detune.value=4;const f=o.createOscillator(),m=o.createGain();f.frequency.value=5.2,m.gain.setValueAtTime(0,n),m.gain.linearRampToValueAtTime(t*.006,n+.4),f.connect(m).connect(d.frequency),f.start(n),f.stop(c+.1),this.env(l,n,.05,i,s*.8,.18);break}case"flute":case"choirlead":{u.frequency.value=e==="flute"?3200:1400;const d=this.osc(e==="flute"?"triangle":"sawtooth",t,n,c,u),f=o.createOscillator(),m=o.createGain();f.frequency.value=5.5,m.gain.setValueAtTime(0,n),m.gain.linearRampToValueAtTime(t*.008,n+.3),f.connect(m).connect(d.frequency),f.start(n),f.stop(c+.1),this.env(l,n,.06,i,s*(e==="flute"?1.3:.7),.2);break}case"harp":case"pluck":{u.frequency.setValueAtTime(e==="harp"?4e3:2400,n),u.frequency.exponentialRampToValueAtTime(600,n+.5),this.osc(e==="harp"?"triangle":"sawtooth",t,n,n+1.2,u),l.gain.setValueAtTime(s,n),l.gain.exponentialRampToValueAtTime(1e-4,n+(e==="harp"?1.1:.4));break}case"bell":{u.frequency.value=6e3,this.osc("sine",t,n,n+2.5,u);const d=o.createGain();d.gain.value=.35,d.connect(u),this.osc("sine",t*2.76,n,n+1.2,d),l.gain.setValueAtTime(s*2,n),l.gain.exponentialRampToValueAtTime(1e-4,n+2.4);break}case"ost":{u.frequency.setValueAtTime(1800,n),u.frequency.exponentialRampToValueAtTime(400,n+.12),this.osc("sawtooth",t,n,c,u),l.gain.setValueAtTime(s,n),l.gain.exponentialRampToValueAtTime(1e-4,c+.05);break}case"bass":{u.frequency.value=420,this.osc("sawtooth",t,n,c,u),this.osc("sine",t/2,n,c,u),this.env(l,n,.02,i,s,.15);break}}}drum(e,t,n,i){const s=this.ctx,a=s.createGain(),o=this.cur?this.cur.out:this.sfxG;if(a.connect(o),e==="kick"||e==="timp"){const u=s.createOscillator();u.type="sine";const d=e==="kick"?120:i*2,f=e==="kick"?42:i;if(u.frequency.setValueAtTime(d,t),u.frequency.exponentialRampToValueAtTime(f,t+(e==="kick"?.12:.2)),u.connect(a),u.start(t),u.stop(t+1.2),a.gain.setValueAtTime(n,t),a.gain.exponentialRampToValueAtTime(1e-4,t+(e==="kick"?.35:1.1)),e==="timp"){const m=s.createGain();m.gain.value=.4,a.connect(m),m.connect(this.rev)}return}const l=s.createBufferSource();l.buffer=this.noise;const c=s.createBiquadFilter();c.type=e==="hat"||e==="crash"?"highpass":"bandpass",c.frequency.value=e==="hat"?7e3:e==="crash"?4e3:1800,l.connect(c).connect(a);const h=e==="hat"?.05:e==="crash"?1.4:.18;if(a.gain.setValueAtTime(n,t),a.gain.exponentialRampToValueAtTime(1e-4,t+h),l.start(t),l.stop(t+h+.05),e==="snare"){const u=s.createGain();u.gain.value=.3,a.connect(u),u.connect(this.rev)}}sfx(e){if(!this.ctx||this.ctx.state!=="running")return;const t=this.ctx,n=t.currentTime+.01,i=this.sfxG,s=(l,c,h,u,d)=>{const f=t.createGain();f.connect(i);const m=t.createOscillator();m.type=l,m.frequency.setValueAtTime(c,n),m.frequency.exponentialRampToValueAtTime(h,n+u),m.connect(f),m.start(n),m.stop(n+u+.05),f.gain.setValueAtTime(d,n),f.gain.exponentialRampToValueAtTime(1e-4,n+u)},a=(l,c,h,u="bandpass")=>{const d=t.createGain();d.connect(i);const f=t.createBufferSource();f.buffer=this.noise;const m=t.createBiquadFilter();m.type=u,m.frequency.value=l,f.connect(m).connect(d),f.start(n),f.stop(n+c+.05),d.gain.setValueAtTime(h,n),d.gain.exponentialRampToValueAtTime(1e-4,n+c)},o=(l,c,h="triangle",u=.15)=>l.forEach((d,f)=>{const m=t.createGain();m.connect(i);const v=t.createGain();v.gain.value=.5,m.connect(v),v.connect(this.rev);const g=t.createOscillator();g.type=h,g.frequency.value=Kt(d),g.connect(m);const p=n+f*c;g.start(p),g.stop(p+.6),m.gain.setValueAtTime(u,p),m.gain.exponentialRampToValueAtTime(1e-4,p+.55)});switch(e){case"move":s("triangle",880,990,.05,.05);break;case"ok":s("triangle",990,1480,.08,.08);break;case"cancel":s("triangle",660,440,.09,.07);break;case"hit":a(1200,.12,.35),s("square",220,80,.1,.08);break;case"slash":a(3e3,.16,.3,"highpass");break;case"heavy":a(600,.3,.5),s("sine",160,40,.3,.3);break;case"magic":o([84,88,91,96],.04,"sine",.08),a(5e3,.4,.06,"highpass");break;case"heal":o([72,76,79,84,88],.06,"sine",.09);break;case"chest":o([67,72,76,79,84],.07,"triangle",.12);break;case"door":s("sawtooth",90,60,.5,.12),a(300,.5,.15);break;case"step":a(500,.04,.03,"lowpass");break;case"push":a(220,.25,.25,"lowpass"),s("sine",90,60,.2,.15);break;case"encounter":o([62,65,69,74,77,81],.035,"sawtooth",.06);break;case"victory":o([67,67,67,72,79,76,79,84],.11,"square",.07);break;case"levelup":o([72,76,79,84,79,84,88],.07,"triangle",.12);break;case"special":o([60,67,72,79,84,91],.05,"sawtooth",.07),a(800,.6,.2);break}}}const In=r=>document.getElementById(r),Na=new URLSearchParams(location.search),_i={get(r){try{return localStorage.getItem(r)}catch{return null}},set(r,e){try{localStorage.setItem(r,e)}catch{}},has(r){try{return localStorage.getItem(r)!==null}catch{return!1}}};function Pd(r){console.error(r);const e=In("lerr");e.style.display="block",e.textContent="Fehler beim Start: "+(r&&r.message?r.message:String(r)),In("ltxt").textContent="Das Spiel konnte nicht starten.",In("load").classList.remove("out")}addEventListener("error",r=>{Dd||Pd(r.error||r.message)});let Dd=!1;const Hl="anmachaQuest_cfg";let Ui={};try{Ui=JSON.parse(_i.get(Hl))||{}}catch{}const Qy=matchMedia("(pointer: coarse)").matches;let eM=Na.has("q")?Math.max(0,Math.min(2,+Na.get("q")|0)):Ui.q??(Qy?1:2);const tM=Na.has("q");async function nM(){const r=In("cv"),e=document.createElement("canvas");if(!(e.getContext("webgl2")||e.getContext("webgl")))throw new Error("Dein Browser unterstützt kein WebGL.");await iM();const t=new Jy;t.on=Ui.music!==!1;const n=()=>t.unlock();addEventListener("pointerdown",n,!0),addEventListener("keydown",n,!0);const i=new df(null,null,{store:_i,debug:Na.has("debug"),audio:t});i.onAudio=d=>{Ui.music=d,_i.set(Hl,JSON.stringify(Ui))};const s=new mf(i),a=new Xy(r,i,eM);i.ui=s,i.view=a,s.view=a,a.onQuality=d=>{Ui.q=d,_i.set(Hl,JSON.stringify(Ui))},window.__quest=i;const o=[...Wy,"hero_Warrior.glb","hero_Wizard.glb","hero_Rogue.glb"];let l=0;Ay(()=>{});const c=a.loadHdr();await Promise.all(o.map(d=>Ot(d).then(()=>{l++;const f=Math.round(l/o.length*100);In("lfill").style.width=f+"%",In("ltxt").textContent=`Lade Spielwelt … ${f} %`}))),await c,bu(i.S,i.rng,"hub",{x:12,y:12}),i.mode=Ct.TITLE,await a.ready(),a.frame(.016),Dd=!0,In("load").classList.add("out"),setTimeout(()=>In("load").remove(),600),setTimeout(()=>In("rot")?.remove(),9e3),sM(i,s);let h=performance.now();const u=d=>{const f=Math.min(.05,(d-h)/1e3);h=d,i.update(f),a.frame(f),s.frame(),a.watchFps(f,tM||document.hidden),requestAnimationFrame(u)};requestAnimationFrame(u),i.showTitle()}const yu="anmachaQuest_legacy",Oo=r=>{let e=2166136261;for(let t=0;t<r.length;t++)e^=r.charCodeAt(t),e=Math.imul(e,16777619);return(e>>>0).toString(36)+":"+r.length};async function iM(){const r=await jy();if(!r)return;const e=JSON.stringify(r),t={src:Oo(e),save:Oo(e)};let n=null;try{n=JSON.parse(_i.get(yu))}catch{}const i=_i.get(rr);n&&n.src===t.src||i!==null&&(!n||Oo(i)!==n.save)||(_i.set(rr,e),_i.set(yu,JSON.stringify(t)))}const Mu={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",Space:"ok",Enter:"ok",NumpadEnter:"ok",KeyZ:"ok",Escape:"cancel",KeyX:"cancel",Backspace:"cancel",KeyM:"menu",Tab:"menu"},Zs={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};function sM(r,e){addEventListener("keydown",t=>{if(t.code==="F8"||t.code==="F9"){r.debugKey(t.code);return}const n=Mu[t.code]||(t.key==="Enter"?"ok":t.key==="Escape"?"cancel":null);n&&(t.preventDefault(),Zs[n]&&!t.repeat&&r.pressDir(Zs[n],!0),!(t.repeat&&!Zs[n])&&(e.action(n)||(n==="menu"||t.code==="Escape")&&r.mode===Ct.WORLD&&r.openMenu()))}),addEventListener("keyup",t=>{const n=Mu[t.code];n&&Zs[n]&&r.pressDir(Zs[n],!1)}),addEventListener("blur",()=>r.clearDirs()),document.addEventListener("visibilitychange",()=>{document.hidden&&r.clearDirs()}),document.addEventListener("contextmenu",t=>t.preventDefault()),rM(r),document.addEventListener("gesturestart",t=>t.preventDefault())}function rM(r){const e=()=>r.view,t=new Set,n=()=>{e().camKeys=(t.has("KeyE")?1:0)-(t.has("KeyQ")?1:0)};addEventListener("keydown",c=>{c.code==="KeyQ"||c.code==="KeyE"?(t.add(c.code),n()):!c.repeat&&(c.code==="KeyR"||c.code==="PageUp")?e().zoomCam(-1):!c.repeat&&(c.code==="KeyF"||c.code==="PageDown")&&e().zoomCam(1)}),addEventListener("keyup",c=>{t.delete(c.code)&&n()}),addEventListener("blur",()=>{t.clear(),n()});const i=In("cv"),s=new Map;let a=0;i.addEventListener("pointerdown",c=>{s.set(c.pointerId,{x:c.clientX,y:c.clientY});try{i.setPointerCapture(c.pointerId)}catch{}if(s.size===2){const[h,u]=[...s.values()];a=Math.hypot(h.x-u.x,h.y-u.y)}}),i.addEventListener("pointermove",c=>{const h=s.get(c.pointerId);if(h){if(s.size===1)e().rotateCam(-(c.clientX-h.x)*.008);else if(s.size===2){h.x=c.clientX,h.y=c.clientY;const[u,d]=[...s.values()],f=Math.hypot(u.x-d.x,u.y-d.y);a&&Math.abs(f-a)>60&&(e().zoomCam(f>a?-1:1),a=f);return}h.x=c.clientX,h.y=c.clientY}});const o=c=>{s.delete(c.pointerId),s.size<2&&(a=0)};i.addEventListener("pointerup",o),i.addEventListener("pointercancel",o);let l=0;i.addEventListener("wheel",c=>{c.preventDefault();const h=performance.now();h-l<180||(l=h,e().zoomCam(c.deltaY>0?1:-1))},{passive:!1})}nM().catch(Pd);
