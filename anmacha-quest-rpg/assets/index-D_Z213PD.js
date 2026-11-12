(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();const je={welt:{name:"Aetherion",theme:"town",rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~....................................~~","~~..,.,.....,.........................~~","~~.~~~.........TTT.....TTTTTTT........~~","~~..........,TTTTT......TT..TT........~~","~~.TTT.....T.TTT^^......TT..TT........~~","~~.........TTTT^^^..........~~........~~","~~..~~.....TTTTTTTTTT.....T~~~.....TT.~~","~~..~~~~~..TTTTTTT^^^TTTTTT~~~TTTTTTT.~~","~~..~~~~~TTTTT..~~~~~TTT.,T~~~~~~~....~~","~~.......TTTTT,.~~~~~TTT..~~~~~~~~..,.~~","~~.,..,..TTTTT...TT..,....~~~.......,.~~","~~.......TTTTTT..TT,,^^^^^TT~~~~~.....~~","~~..,,^^^TT....,.TT..^^^^^TT~~~~~.....~~","~~.~~~TT,............~~~~~TTTTT^^^^^..~~","~~.,......,....~~~.^^^^^^^^.^^^.....,.~~","~~........TTT..~~~.^^^^.....^TT.......~~","~~........TT~~.........TTT............~~","~~...........TTTTT.....TTT.~~,......,.~~","~~.TT............~.......TTT~.........~~","~~.TTTT^^^...,...,.......TT~~...~~~...~~","~~.TTTT^^^..,,...........TT......,....~~","~~....................................~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~","~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"],enc:[],rate:.06,lv:3,world:!0,portals:[{x:20,y:21,to:"hub",req:"",label:"Hafenau",kind:"town",ax:12,ay:13},{x:7,y:18,to:"rap",req:"",label:"Echogruft",kind:"cave",ax:2,ay:14},{x:33,y:18,to:"schlager",req:"boss_rap",label:"Rosenhain",kind:"cave",ax:2,ay:14},{x:8,y:6,to:"xmas",req:"boss_schlager",label:"Frostgrotte",kind:"cave",ax:2,ay:14},{x:32,y:6,to:"rock",req:"boss_xmas",label:"Glutschlund",kind:"cave",ax:2,ay:14},{x:20,y:5,to:"tower",req:"boss_rock",label:"Turm der Stille",kind:"tower",ax:2,ay:14}],npcs:[],chests:[],boss:{}},hub:{name:"Hafenau",theme:"town",rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~","~#....,,..............,.#~","~#,T.....hhhT.hhh....TT.#~","~#TT.....HSH..HDH.,..,T.#~","~#..,.,...p...,p,....,..#~","~#..hhh...p.TT.p..,hhh..#~","~#..HDH,,.p....p...MDM,.#~","~#...p..pppppppppp..p...#~","~#...pppppppppppppppp...#~","~#......pppppppppp.,....#~","~#....T.pppppppppp,T.,..#~","~#..,,..pppppppppp......#~","~#TT........p......,..T.#~","~#.T...T....p,.,..T,,TT,#~","~.......,...p..,.........~","~~~~~~~~~~~~~~~~~~~~~~~~~~"],enc:[],rate:0,lv:1,portals:[{x:12,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:20,ay:22}],npcs:[{x:10,y:5,kind:"shop",name:"Mara"},{x:15,y:9,kind:"heal",name:"Quelle"},{x:12,y:9,kind:"elder",name:"Älteste Ysolde"},{x:8,y:10,kind:"kid",name:"Pip"},{x:17,y:10,kind:"guard",name:"Wache Holm"}],chests:[],boss:{}},rap:{name:"Echogruft",theme:"rap",rows:["##########################","#..........,.,..,...#....#","#..,................#....#","#..,.....,...,...TT.#....#","#........TTT.T.~.~.......#","#,.T.T..T..T.T.~~.~.#....#","#,....TT...,.TTT...,#.,..#","#.........,,..T,....######","#.......TTT......,TTT.TTT#","#..,.TTT..T...,...T......#","#...TT~~.......TTTT.T....#","#..,T~~~~..,TT.~~~TT.....#","#.....~~~TT.T.~~..,......#","#......................,.#","#.....,.............,....#","##########################"],enc:["beatbandit","reimruepel","bassgolem","boombox","graffiti","mikspin"],rate:.075,lv:3,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:7,ay:19}],npcs:[],chests:[{id:"rap_key",x:6,y:5,kind:"key",v:"key_rap",n:1},{id:"rap_c1",x:10,y:6,kind:"item",v:"trank",n:2},{id:"rap_c2",x:15,y:3,kind:"gold",v:70}],gate:{x:20,y:4,key:"key_rap",flag:"gate_rap"},boss:{x:23,y:2,id:"mcdroehn",flag:"boss_rap"}},schlager:{name:"Rosenhain",theme:"schlager",rows:["##########################","#.,,.,,...,.......,.#....#","#...T...T..T.,..,,.,#....#","#..........T........#....#","#..,,...~~~T...T.........#","#....,..~~...,.TTT..#.,.,#","#...TT..T,.....,TT,.#....#","#.TTT.TT..TT,...TTT,######","#.,.,..~~TTTT.T.TTT.TTT,.#","#....,.~~~TTT.T....T.....#","#.TTTTTT,.,~~~~.TTT....,.#","#.TTT.,,..,~~~,.TTT..,...#","#....T..,..T,...,.....,..#","#....T,....,......,.,.,..#","#....,,...,..,..,,..,,...#","##########################"],enc:["gecko","schleim","aal","disco","herz","zuckerg"],rate:.075,lv:8,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:33,ay:19}],npcs:[],chests:[{id:"schlager_key",x:22,y:13,kind:"key",v:"key_schlager",n:1},{id:"schlager_c1",x:15,y:8,kind:"item",v:"trank",n:2},{id:"schlager_c2",x:2,y:1,kind:"gold",v:120}],gate:{x:20,y:4,key:"key_schlager",flag:"gate_schlager"},boss:{x:23,y:2,id:"koenigin",flag:"boss_schlager"}},xmas:{name:"Frostgrotte",theme:"xmas",rows:["##########################","#...................#....#","#....TTT......TTT...#....#","#..T.TTT......T~~~~.#....#","#.....TTTT...~~~~.,......#","#...TTTTTTT..~~~....#....#","#......T....TTTT...T#....#","#.,,........TTTTT.TT######","#.TTT..,.....,~~~..TTTT,.#","#.TTT.....~~~~~~~..T~~~..#","#..,.TTTT.~~~~......~~...#","#...TT...............TTT.#","#....TT...........TTTTTT.#","#....TT............T.....#","#...................,....#","##########################"],enc:["geist","lebkuchen","schneemann","eisratte","eisspin","zwerg"],rate:.075,lv:13,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:8,ay:7}],npcs:[],chests:[{id:"xmas_key",x:7,y:8,kind:"key",v:"key_xmas",n:1},{id:"xmas_c1",x:23,y:8,kind:"item",v:"trank",n:2},{id:"xmas_c2",x:8,y:3,kind:"gold",v:170}],gate:{x:20,y:4,key:"key_xmas",flag:"gate_xmas"},boss:{x:23,y:2,id:"frostmod",flag:"boss_xmas"}},rock:{name:"Glutschlund",theme:"rock",rows:["##########################","#.....,.,...........#....#","#.T,T......TTTTT..TT#....#","#.TTT~~~.,.T~~T...T.#....#","#.T..~~T,...~~...........#","#.T............T..~.#....#","#..TTT.TT......T..~~#...,#","#.TT.T,TTTT...T.....######","#,TT.T..T~~.~~~TT........#","#....TT..~~~~~~TT.TT.....#","#....TT...........TT.....#","#..T.........,,,..~~~....#","#....TT......T....~~T.,..#","#.....T.,................#","#........,...............#","##########################"],enc:["gargoyle","mole","verstaerker","rifffled","daemon","roadie"],rate:.075,lv:18,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:32,ay:7}],npcs:[],chests:[{id:"rock_key",x:18,y:8,kind:"key",v:"key_rock",n:1},{id:"rock_c1",x:11,y:6,kind:"item",v:"trank",n:2},{id:"rock_c2",x:20,y:13,kind:"gold",v:220}],gate:{x:20,y:4,key:"key_rock",flag:"gate_rock"},boss:{x:23,y:2,id:"riff",flag:"boss_rock"}},tower:{name:"Turm der Stille",theme:"static",rows:["##########################","#,..................#....#","#,...TTTTTT......T..#....#","#...TT....,......T..#....#","#...TT~....TTT...........#","#.....~~.........TT.#....#","#,..,T.T...~~.....T,#....#","#........T~~~.TT..,.######","#,...TTTTTT...TT.......T.#","#....TT~~~..T.,,.T....TT.#","#...TTT~~~~T....TT,~~~,..#","#..TTT,..TTT....,.T~..T.T#","#.......TTT.TT........,..#","#........................#","#.....,..,.......,.......#","##########################"],enc:["schemen","stoersignal","kreischer","antspin","rausritter","zyklop"],rate:.075,lv:23,portals:[{x:1,y:14,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:20,ay:6}],npcs:[],chests:[{id:"tower_key",x:16,y:14,kind:"key",v:"key_tower",n:1},{id:"tower_c1",x:15,y:9,kind:"item",v:"trank",n:2},{id:"tower_c2",x:16,y:4,kind:"gold",v:270}],gate:{x:20,y:4,key:"key_tower",flag:"gate_tower"},boss:{x:23,y:2,id:"rauschen",flag:"boss_tower"}}},Jt={andrew:{name:"Aren",col:"#3a9bff",hair:"#5a3a1a",acc:"#ff4a4a",hp:62,hpg:16,sp:10,spg:3,atk:12,atkg:3.2,def:6,defg:2.2,mag:4,magg:1,spd:7,spdg:.6,skills:["wucht","rund"],ip:"ip_andrew",role:"Schwertkämpfer"},marco:{name:"Silas",col:"#9a4cff",hair:"#e8c84a",acc:"#ff5ad0",hp:42,hpg:10,sp:24,spg:6,atk:6,atkg:1.6,def:4,defg:1.4,mag:13,magg:3.4,spd:8,spdg:.7,skills:["funke","welle"],ip:"ip_marco",role:"Magier"},teresa:{name:"Lyra",col:"#2fc98c",hair:"#ff5a8a",acc:"#fff04a",hp:50,hpg:12,sp:22,spg:5.5,atk:8,atkg:2,def:5,defg:1.8,mag:10,magg:3,spd:6,spdg:.6,skills:["heilton","chor"],ip:"ip_teresa",role:"Heilerin"},rico:{name:"Fenn",col:"#ff9a2a",hair:"#2a2a3a",acc:"#35e0ff",hp:52,hpg:13,sp:16,spg:4,atk:11,atkg:2.8,def:5,defg:1.8,mag:6,magg:1.6,spd:11,spdg:.9,skills:["doppel","streu"],ip:"ip_rico",role:"Schütze"},andy:{name:"Borin",col:"#d04a4a",hair:"#8a8a96",acc:"#ffd24a",hp:80,hpg:20,sp:8,spg:2,atk:10,atkg:2.6,def:9,defg:3,mag:3,magg:.8,spd:4,spdg:.4,skills:["schild","bollwerk"],ip:"ip_andy",role:"Wächter"}},dd=[["boss_rap","teresa",'Eine junge Frau mit silbernem Haar wartet an der Quelle. "Ich bin Lyra, Priesterin der Quelle. Ich habe gespürt, wie das Echo der Gruft verstummt ist. Nehmt mich mit, eure Wunden brauchen Licht."'],["boss_schlager","rico",'Ein Bogenschütze lehnt am Tor und spannt die Sehne. "Fenn. Jäger aus dem Rosenhain. Seraphine hat meine Heimat in Dornen gehüllt. Ich schulde euch einen Pfeil, oder hundert."'],["boss_xmas","andy",'Ein hünenhafter Wächter tritt aus dem Schatten, den Schild voller Reif. "Borin. Ich hielt die Frostgrotte, bis Kryos mich vertrieb. Mein Schild gehört jetzt euch."']],Fr={wucht:{name:"Wuchtschlag",sp:4,kind:"phys",mult:1.9,all:!1},rund:{name:"Rundumschlag",sp:8,kind:"phys",mult:1.15,all:!0},funke:{name:"Blitzfunke",sp:4,kind:"mag",mult:2.2,all:!1},welle:{name:"Ätherwelle",sp:9,kind:"mag",mult:1.35,all:!0},heilton:{name:"Heillicht",sp:4,kind:"heal",mult:3.2,all:!1},chor:{name:"Segenskreis",sp:9,kind:"heal",mult:1.8,all:!0},doppel:{name:"Doppelschuss",sp:5,kind:"phys",mult:1.15,all:!1,hits:2},streu:{name:"Streufeuer",sp:8,kind:"phys",mult:1.05,all:!0},schild:{name:"Schildschlag",sp:3,kind:"phys",mult:1.5,all:!1},bollwerk:{name:"Bollwerk",sp:7,kind:"guard",mult:0,all:!0}},za={ip_andrew:{name:"Sternenhieb",ip:40,kind:"phys",mult:3.4,all:!1},ip_marco:{name:"Supernova",ip:60,kind:"mag",mult:2.5,all:!0},ip_teresa:{name:"Lebenshymne",ip:50,kind:"heal",mult:99,all:!0},ip_rico:{name:"Salvenfeuer",ip:50,kind:"phys",mult:2.4,all:!0},ip_andy:{name:"Titanenschlag",ip:40,kind:"phys",mult:4.2,all:!1}},pt={trank:{name:"Trank",price:20,desc:"Heilt 70 LP"},aether:{name:"Äthertropfen",price:60,desc:"Gibt 20 SP"},weck:{name:"Lebensfeder",price:120,desc:"Belebt einen Helden"}},pd={key_rap:"Echo-Schlüssel",key_schlager:"Rosen-Schlüssel",key_xmas:"Frost-Schlüssel",key_rock:"Glut-Schlüssel",key_tower:"Stille-Schlüssel"},vn={beatbandit:{name:"Moospanda",lv:1,hpm:1,atkm:1,defm:1,dir:"cute",model:"Panda",tint:"",h:1},reimruepel:{name:"Wildeber",lv:2,hpm:1,atkm:1.1,defm:.9,dir:"cute",model:"Pig",tint:"",h:1},bassgolem:{name:"Höhlenyeti",lv:3,hpm:1.5,atkm:1,defm:1.4,dir:"cute",model:"Yeti",tint:"#6a7ad8",h:1.35},boombox:{name:"Dornkaktus",lv:1,hpm:1.2,atkm:1.1,defm:1,dir:"cute",model:"Cactus",tint:"",h:1},graffiti:{name:"Irrlicht",lv:2,hpm:.8,atkm:1.2,defm:.8,dir:"cute",model:"Ghost",tint:"#ff9ad8",h:1},mikspin:{name:"Grottenpinguin",lv:3,hpm:1,atkm:1.1,defm:1,dir:"cute",model:"Penguin",tint:"#9a9aff",h:1},gecko:{name:"Rosenkrabbe",lv:7,hpm:1.1,atkm:1,defm:1.1,dir:"cute",model:"Crab",tint:"#ff7ac8",h:1},schleim:{name:"Honigschleim",lv:8,hpm:1.3,atkm:.9,defm:1.1,dir:"monsters4",model:"Slime",tint:"#ffe36b",h:1.05},aal:{name:"Sporenpilz",lv:9,hpm:1.1,atkm:1.2,defm:1,dir:"cute",model:"Mushroom",tint:"",h:1},disco:{name:"Dornbiene",lv:7,hpm:.8,atkm:1.2,defm:.8,dir:"cute",model:"Bee",tint:"#ff9ae8",h:1},herz:{name:"Blütenhirsch",lv:8,hpm:1.3,atkm:1.1,defm:1.3,dir:"cute",model:"Deer",tint:"#ffb0c0",h:1.1},zuckerg:{name:"Feenküken",lv:9,hpm:.9,atkm:1.2,defm:.9,dir:"cute",model:"Chicken",tint:"#ffc0e8",h:.9},geist:{name:"Frostgeist",lv:12,hpm:.9,atkm:1.1,defm:.9,dir:"cute",model:"Ghost",tint:"#bfe8ff",h:1},lebkuchen:{name:"Eiswurzler",lv:13,hpm:1.5,atkm:1,defm:1.4,dir:"cute",model:"Tree",tint:"",h:1.2},schneemann:{name:"Schneeyeti",lv:14,hpm:1.2,atkm:1.2,defm:1,dir:"cute",model:"Yeti",tint:"",h:1.3},eisratte:{name:"Eisfledermaus",lv:12,hpm:1,atkm:1.2,defm:.9,dir:"cute",model:"Bat",tint:"#a0d8ff",h:1},eisspin:{name:"Frostrentier",lv:13,hpm:1,atkm:1.2,defm:1,dir:"cute",model:"Deer",tint:"#d8c8a0",h:1.1},zwerg:{name:"Eiskobold",lv:14,hpm:1.1,atkm:1.2,defm:1,dir:"cute",model:"Demon",tint:"#c03a3a",h:1},gargoyle:{name:"Glutdämon",lv:17,hpm:1.1,atkm:1.1,defm:1.1,dir:"cute",model:"GreenDemon",tint:"",h:1.1},mole:{name:"Lavazyklop",lv:18,hpm:1.3,atkm:1.1,defm:1.1,dir:"cute",model:"Cyclops",tint:"",h:1.2},verstaerker:{name:"Aschenkrieger",lv:19,hpm:1.5,atkm:1.2,defm:1.3,dir:"monsters4",model:"Skeleton",tint:"",h:1.4},rifffled:{name:"Rußfledermaus",lv:17,hpm:.8,atkm:1.3,defm:.8,dir:"cute",model:"Bat",tint:"#5a4a6a",h:1},daemon:{name:"Flammenschädel",lv:18,hpm:1.3,atkm:1.3,defm:1,dir:"cute",model:"Skull",tint:"#ff9a5a",h:1},roadie:{name:"Magmakraken",lv:19,hpm:.9,atkm:1.2,defm:.9,dir:"cute",model:"Cthulhu",tint:"#7a5ad8",h:1.2},schemen:{name:"Leerwandler",lv:22,hpm:1,atkm:1.1,defm:1,dir:"cute",model:"Alien",tint:"#c0c0d0",h:1},stoersignal:{name:"Schattenseher",lv:23,hpm:1.3,atkm:1.1,defm:1.1,dir:"cute",model:"Alien_Tall",tint:"#7cff9a",h:1.2},kreischer:{name:"Stillschreier",lv:24,hpm:1.5,atkm:1.2,defm:1.2,dir:"cute",model:"Bat",tint:"#ffffff",h:1.1},antspin:{name:"Nichtsmotte",lv:22,hpm:1,atkm:1.3,defm:1,dir:"cute",model:"Bee",tint:"#7cff9a",h:1},rausritter:{name:"Stilleritter",lv:23,hpm:1.3,atkm:1.2,defm:1.3,dir:"monsters4",model:"Skeleton",tint:"#c0c8d8",h:1.5},zyklop:{name:"Leerenzyklop",lv:24,hpm:1.5,atkm:1.2,defm:1.2,dir:"cute",model:"Cyclops",tint:"#7cffb0",h:1.3},mcdroehn:{name:"Vorgal der Grollende",lv:5,hpm:4.2,atkm:1.15,defm:1.2,boss:!0,spec:["Grollbeben",.85,!0],dir:"cute",model:"Demon",tint:"#ff4a6a",h:2.4},koenigin:{name:"Seraphine, die Dornenkönigin",lv:10,hpm:6,atkm:1.4,defm:1.2,boss:!0,spec:["Dornenregen",.85,!0],dir:"cute",model:"YellowDragon",tint:"#ff6ac0",h:2.6},frostmod:{name:"Kryos, der Eisfürst",lv:15,hpm:6.5,atkm:1.55,defm:1.2,boss:!0,spec:["Eiszeit",.85,!0],dir:"cute",model:"Yeti",tint:"#6ad0ff",h:2.8},riff:{name:"Pyrax, der Glutdrache",lv:20,hpm:7,atkm:1.7,defm:1.2,boss:!0,spec:["Feuersturm",.85,!0],dir:"monsters4",model:"Dragon",tint:"#ff5030",h:3.4},rauschen:{name:"Nihl, die Stille",lv:26,hpm:9,atkm:1.85,defm:1.25,boss:!0,spec:["Totenstille",.9,!0],dir:"cute",model:"Cthulhu",tint:"#e8e8f8",h:3.4}},md={town:["#3f8f4a","#3a8644","#2a5a6a","#1f6a35","#ffd24a",0],rap:["#2a2438","#2f2a42","#14101e","#0c0a14","#ff4a6a",1],schlager:["#e8a3c8","#e29abf","#a04a80","#ffd24a","#ff3aa0",2],xmas:["#cfe8f6","#c2dff0","#4a7a9a","#2f8a4a","#ff3a3a",0],rock:["#3a2a28","#42302c","#1a0f0e","#6a3a2a","#ff7a1a",3],static:["#2a2e36","#30343e","#10121a","#505868","#7cff9a",1]};je.hub.town=!0;je.lind={name:"Lindmark",theme:"town",town:!0,enc:[],rate:0,lv:1,npcs:[{x:7,y:3,kind:"inn",name:"Wirtin Elsbeth"},{x:17,y:3,kind:"smith",name:"Schmied Torvald"},{x:20,y:7,kind:"trader",name:"Händler Quinn"},{x:5,y:7,kind:"sage",name:"Kapselgelehrte Mirela"},{x:16,y:10,kind:"kid2",name:"Nele"}],chests:[{id:"lind_c1",x:2,y:1,kind:"item",v:"frucht",n:1}],boss:{},portals:[{x:12,y:12,to:"welt",req:"",label:"Ausgang",kind:"exit",ax:36,ay:13}],rows:["~~~~~~~~~~~~~~~~~~~~~~~~~~","~#..T.hhh.......hhh...T.#~","~#....HSH...T...HDH.....#~","~#.....p.........p......#~","~#.....ppppppppppp..,...#~","~#..hhh....ppp.....hhh..#~","~#..HDH....ppp.....HSH..#~","~#...p.....ppp......p...#~","~#...ppppppppppppppppp..#~","~#T........ppp........T.#~","~#..,......ppp....,.....#~","~#TT.......ppp.......TT.#~","~..........ppp...........~","~~~~~~~~~~~~~~~~~~~~~~~~~~"]};je.welt.portals.push({x:36,y:12,to:"lind",req:"boss_rap",label:"Lindmark",kind:"town",ax:12,ay:11});je.rap.chests.push({id:"cap_flamm",x:13,y:12,kind:"capsule",v:"flamm"});je.schlager.chests.push({id:"cap_moos",x:8,y:7,kind:"capsule",v:"moos"});je.xmas.chests.push({id:"cap_frost",x:5,y:4,kind:"capsule",v:"frost"});je.rock.chests.push({id:"cap_summ",x:3,y:2,kind:"capsule",v:"summ"});je.tower.chests.push({id:"cap_drak",x:6,y:6,kind:"capsule",v:"drak"});Object.assign(pt,{grosstrank:{name:"Großtrank",price:80,desc:"Heilt 250 LP"},aetherflask:{name:"Ätherflasche",price:180,desc:"Gibt 60 SP"},bombe:{name:"Glutbombe",price:90,desc:"Trifft alle Gegner",use:"enemy"},frucht:{name:"Sphärenfrucht",price:400,desc:"Lässt einen Kapselgeist sich entwickeln",use:"capsule"}});const Xc={hub:["trank","aether","weck"],lind:["trank","grosstrank","aether","aetherflask","weck","bombe","frucht"]},ur={trank:25,grosstrank:70,aether:50,aetherflask:140,weck:90,bombe:60},fn={flamm:{elem:"Feuer",col:"#ff8a3a",hp:40,hpg:11,atk:10,atkg:2.6,mag:9,magg:2.4,spd:9,spdg:.7,forms:[{name:"Flämmchen",model:"Ghost",tint:"#ffa060",h:.9},{name:"Glutgeist",model:"Ghost",tint:"#ff6a2a",h:1.25},{name:"Sonnenphönix",model:"YellowDragon",tint:"#ffb040",h:1.7}],skills:[{name:"Funkenwurf",kind:"mag",mult:1.6,all:!1},{name:"Flammenkreis",kind:"mag",mult:1.2,all:!0},{name:"Sonnensturm",kind:"mag",mult:1.9,all:!0}]},moos:{elem:"Erde",col:"#6ad05a",hp:56,hpg:15,atk:9,atkg:2.2,mag:8,magg:2.2,spd:5,spdg:.4,forms:[{name:"Moosling",model:"Slime",tint:"#7ae06a",h:.8},{name:"Moosgolem",model:"Tree",tint:"#9ad07a",h:1.4},{name:"Waldhüter",model:"Tree",tint:"#5ac05a",h:1.9}],skills:[{name:"Rankenhieb",kind:"phys",mult:1.5,all:!1},{name:"Heilmoos",kind:"heal",mult:2.2,all:!0},{name:"Erdbeben",kind:"phys",mult:1.5,all:!0}]},frost:{elem:"Wasser",col:"#6ac8ff",hp:48,hpg:13,atk:11,atkg:2.8,mag:7,magg:1.8,spd:7,spdg:.6,forms:[{name:"Frostling",model:"Penguin",tint:"#a0dcff",h:.8},{name:"Eisbär",model:"Yeti",tint:"#c0e8ff",h:1.4},{name:"Gletscherkönig",model:"Yeti",tint:"#7ab8ff",h:1.9}],skills:[{name:"Eiskralle",kind:"phys",mult:1.7,all:!1},{name:"Frosthauch",kind:"mag",mult:1.2,all:!0},{name:"Gletscherwall",kind:"guard",mult:0,all:!0}]},summ:{elem:"Wind",col:"#ffe04a",hp:38,hpg:10,atk:12,atkg:3,mag:8,magg:2,spd:13,spdg:1,forms:[{name:"Summfix",model:"Bee",tint:"#ffe070",h:.8},{name:"Sturmhornisse",model:"Bee",tint:"#ffc030",h:1.2},{name:"Himmelsfürst",model:"Bat",tint:"#ffe8a0",h:1.7}],skills:[{name:"Stachelwirbel",kind:"phys",mult:.9,all:!1,hits:2},{name:"Windklinge",kind:"phys",mult:1.15,all:!0},{name:"Orkan",kind:"phys",mult:1.6,all:!0}]},drak:{elem:"Licht",col:"#e0d0ff",hp:60,hpg:16,atk:14,atkg:3.4,mag:13,magg:3.2,spd:10,spdg:.8,forms:[{name:"Drakling",model:"YellowDragon",tint:"#f0e0ff",h:.9},{name:"Sternendrache",model:"Dragon",tint:"#d0c0ff",h:1.6},{name:"Äonenwyrm",model:"Dragon",tint:"#fff0c0",h:2.2}],skills:[{name:"Lichtatem",kind:"mag",mult:1.8,all:!1},{name:"Segenslicht",kind:"heal",mult:2.6,all:!0},{name:"Sternenfall",kind:"mag",mult:2,all:!0}]}},qc={tool_hammer:{name:"Kristallhammer",desc:"zerschlägt rissige Felsen"},tool_fire:{name:"Glutstab",desc:"entzündet Fackeln und verbrennt Dornenranken"}};Object.assign(je.rap,{puzzle:{blocks:[[8,13],[13,14]],plates:[[10,13],[15,14]],torches:[]},loot:[{id:"rap_r1",x:17,y:5,kind:"rock",gold:120},{id:"rap_r2",x:21,y:8,kind:"rock",v:"grosstrank",n:2}]});je.rap.chests.push({id:"rap_tool",x:14,y:11,kind:"tool",v:"tool_hammer"});Object.assign(je.schlager,{puzzle:{blocks:[[8,14]],plates:[[10,14]],torches:[[7,12],[13,12]]},loot:[{id:"schlager_b1",x:18,y:9,kind:"bramble",gold:200},{id:"schlager_b2",x:13,y:9,kind:"bramble",v:"aetherflask",n:1}]});je.schlager.chests.push({id:"schlager_tool",x:5,y:11,kind:"tool",v:"tool_fire"});Object.assign(je.xmas,{puzzle:{blocks:[[8,13],[11,14]],plates:[[10,13],[13,14]],torches:[[16,13]]},loot:[{id:"xmas_r1",x:4,y:10,kind:"rock",v:"frucht",n:1},{id:"xmas_b1",x:13,y:8,kind:"bramble",gold:300}]});Object.assign(je.rock,{puzzle:{blocks:[[8,13],[11,14]],plates:[[10,13],[13,14]],torches:[[16,13],[22,13]]},loot:[{id:"rock_r1",x:11,y:8,kind:"rock",v:"grosstrank",n:3},{id:"rock_b1",x:4,y:7,kind:"bramble",v:"frucht",n:1}]});Object.assign(je.tower,{puzzle:{blocks:[[4,13],[9,14]],plates:[[6,13],[11,14]],torches:[[16,13],[22,13]]},loot:[{id:"tower_r1",x:8,y:11,kind:"rock",v:"frucht",n:1},{id:"tower_b1",x:10,y:9,kind:"bramble",v:"weck",n:2},{id:"tower_r2",x:5,y:5,kind:"rock",gold:500}]});Object.assign(pt,{fisch1:{name:"Silberling",price:0,sell:15,desc:"Fisch: heilt 120 LP"},fisch2:{name:"Goldforelle",price:0,sell:60,desc:"Fisch: heilt alle LP"},fisch3:{name:"Sternenkoi",price:0,sell:300,desc:"Leckerbissen für Kapselgeister",use:"capsule"}});Object.assign(ur,{fisch1:40,fisch2:110,fisch3:450});const Or=[{id:"fisch1",p:.62,speed:.9,zone:.26},{id:"fisch2",p:.3,speed:1.35,zone:.18},{id:"fisch3",p:.08,speed:1.9,zone:.11}],Ra=[{s:"★",name:"Stern",pay:20,col:"#ffd84a"},{s:"♛",name:"Krone",pay:10,col:"#ff9ad0"},{s:"◆",name:"Kristall",pay:6,col:"#7ad8ff"},{s:"☾",name:"Mond",pay:4,col:"#c8b8ff"},{s:"♪",name:"Note",pay:3,col:"#8affb0"}],Br=10,di=[{v:"grosstrank",chips:8},{v:"aetherflask",chips:12},{v:"weck",chips:15},{v:"frucht",chips:40}];je.hub.npcs.push({x:5,y:14,kind:"angler",name:"Anglerin Wenke"});je.lind.npcs.push({x:4,y:12,kind:"angler",name:"Fischer Arno"},{x:8,y:10,kind:"casino",name:"Croupière Lys"},{x:20,y:10,kind:"arena",name:"Chronistin Vela"});je.hub.portals.push({x:2,y:1,to:"tiefe",req:"boss_schlager",label:"Tiefe der Echos",kind:"cave",ax:2,ay:14,deep:"start"});const ju=30,$u={5:"mcdroehn",10:"koenigin",15:"frostmod",20:"riff",25:"rauschen",30:"rauschen"},zr=["mcdroehn","koenigin","frostmod","riff","rauschen"];Object.assign(vn.beatbandit,{name:"Gruftknecht",model:"kk:Skeleton_Minion",h:1.1,tint:"#e8e0d0"});Object.assign(vn.reimruepel,{name:"Knochenschleicher",model:"kk:Skeleton_Rogue",h:1.1,tint:"#d8d0c8"});Object.assign(vn.mikspin,{name:"Gruftmagier",model:"kk:Skeleton_Mage",h:1.15,tint:"#c8c0ff"});Object.assign(vn.verstaerker,{model:"kk:Skeleton_Warrior",h:1.4,tint:"#ffb08a"});Object.assign(vn.rausritter,{model:"kk:Skeleton_Warrior",h:1.5,tint:"#c0c8e8"});vn.knurrmops={name:"Knurrmops",lv:14,hpm:2,atkm:1.25,defm:1.3,dir:"cute",model:"bestiary:Puglin",tint:"",h:1.15,elite:!0};vn.glutwicht={name:"Glutwicht",lv:20,hpm:1.9,atkm:1.4,defm:1.2,dir:"cute",model:"bestiary:Imp",tint:"",h:1.4,elite:!0};vn.aschenfuerst={name:"Aschenfürst Vargh",lv:30,hpm:10,atkm:1.9,defm:1.3,boss:!0,spec:["Aschenregen",.95,!0],dir:"cute",model:"bestiary:Imp",tint:"#ff9a7a",h:3.2};$u[30]="aschenfuerst";const Ri=3,An=2,Yu=["rap","schlager","xmas","rock","tower"],jc=(r,e)=>{let t=Math.imul(r*374761393+e*668265263,1274126177);return t^=t>>>13,(t>>>0)%1e3/1e3};function sl(r,e,t=!1,n=null){const i=r.rows,s=i.length,a=i[0].length,o=(d,m)=>i[m]&&i[m][d]||(t?"~":"#"),l=d=>(!d||d.x==null||(d.x*=e,d.y*=e),d),c=new Set((r.portals||[]).map(d=>d.x+","+d.y)),h=[],u=[];for(let d=0;d<s*e;d++){let m="",v="";for(let p=0;p<a*e;p++){const g=Math.floor(p/e),_=Math.floor(d/e),y=o(g,_);m+=y;let x=y;if(t&&!c.has(g+","+_)){const P=p%e/(e-1),R=d%e/(e-1),A=P>.5?1:P<.5?-1:0,C=R>.5?1:R<.5?-1:0,M=A?o(g+A,_):y,w=C?o(g,_+C):y;A&&C&&M===w&&M!==y&&jc(p,d)<.75?x=M:y==="."&&jc(p+7,d+3)<.05&&(x=",")}v+=x}h.push(m),u.push(v)}if((r.portals||[]).forEach(l),(r.chests||[]).forEach(l),(r.npcs||[]).forEach(l),(r.loot||[]).forEach(l),l(r.boss),r.puzzle)for(const d of["blocks","plates","torches"])r.puzzle[d]=r.puzzle[d].map(([m,v])=>[m*e,v*e]);let f=h;if(t){const d="#T~^",m=n||{x:0,y:0},v=(_,y,x)=>_[x]&&_[x][y]&&!d.includes(_[x][y]),p=new Set([m.x+","+m.y]),g=[[m.x,m.y]];for(;g.length;){const[_,y]=g.pop();for(const[x,P]of[[1,0],[-1,0],[0,1],[0,-1]]){const R=_+x+","+(y+P);!p.has(R)&&v(u,_+x,y+P)&&(p.add(R),g.push([_+x,y+P]))}}(r.portals||[]).every(_=>p.has(_.x+","+_.y))&&(f=u)}if(r.gate){l(r.gate);const d=r.gate,m=o(d.x/e-1,d.y/e)!=="#";f=f.map((v,p)=>v.split("").map((g,_)=>_>=d.x&&_<d.x+e&&p>=d.y&&p<d.y+e&&(m?p!==d.y:_!==d.x)?"#":g).join(""))}return r.rows=f,r.rate=(r.rate||0)/e,r}(function(){const e=(t,n)=>{for(const i of Object.values(je))for(const s of i.portals||[])s.to===t&&(s.ax*=n,s.ay*=n)};e("welt",Ri);for(const t of Yu)e(t,An),sl(je[t],An);je.hub.portals.filter(t=>t.to==="tiefe").forEach(t=>{t.ax*=An,t.ay*=An}),sl(je.welt,Ri,!0,{x:20*Ri,y:22*Ri})})();const gd=5.4,vd=2.3,_d=.3,xd=.12,yd=.38,Md=11/16,wd=[3,8,13,18,23],rl=[["beatbandit","reimruepel","bassgolem","boombox","graffiti","mikspin"],["gecko","schleim","aal","disco","herz","zuckerg"],["geist","lebkuchen","schneemann","eisratte","eisspin","zwerg"],["gargoyle","mole","verstaerker","rifffled","daemon","roadie"],["schemen","stoersignal","kreischer","antspin","rausritter","zyklop"]],Ku="#T~^hHDSM",Zu=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}],co=["hub","welt","rap","schlager","xmas","rock","tower","lind"];function Ju(r){let e=r>>>0;const t=r==null?Math.random:()=>{e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296};return{randf:t,randi:()=>Math.floor(t()*4294967296),range:(n,i)=>n+(i-n)*t(),shuffle(n){for(let i=n.length-1;i>0;i--){const s=Math.floor(t()*(i+1));[n[i],n[s]]=[n[s],n[i]]}return n}}}const tn=Math.trunc,Ti=r=>r.x+","+r.y,$i=(r,e)=>r.x===e.x&&r.y===e.y,al=(r,e)=>Math.abs(r.x-e.x)+Math.abs(r.y-e.y);function bd(){return{party:[],inv:{trank:3,aether:1,weck:0},gold:50,gear:0,flags:{},caps:{own:{},active:null},chips:0,deep:0,deepSeed:1,deepBest:0,mapId:"hub",map:je.hub,mw:26,mh:16,objs:[],reg:[],gp:{x:12,y:11},face:{x:0,y:1},steps:0,grace:8,playTime:0,uidN:0,roamers:[],enemies:[]}}const pn=r=>Jt[r.id],xt=(r,e)=>tn(pn(e).hp+pn(e).hpg*(e.lv-1))+r.gear*8,On=r=>tn(pn(r).sp+pn(r).spg*(r.lv-1));function Xt(r,e,t){let n=pn(e)[t]+pn(e)[t+"g"]*(e.lv-1);return(t==="atk"||t==="def"||t==="mag")&&(n+=r.gear*3),tn(n)}const Yi=r=>tn(14*r+2.2*r*r);function Nn(r){let e=0;for(const t of r.party)e+=t.lv;return e/Math.max(1,r.party.length)}function ho(r,e,t=1){const n={id:e,name:Jt[e].name,lv:t,exp:0,hp:1,sp:1,ip:0};return n.hp=xt(r,n),n.sp=On(n),n}const ni=r=>++r.uidN,Hr=r=>120*(r.gear+1)*(r.gear+1);function Sd(r,e){const t=vn[e],n=t.lv+(r.map&&r.map.lvBonus||0),i=.62+.13*r.party.length,s=Math.min(1,Math.max(.6,.5+.1*Nn(r))),a=tn((18+14*n)*1.4*t.hpm*i*s),o=!!t.boss;return{id:e,name:t.name,lv:n,hp:a,mhp:a,atk:(6+2.6*n)*t.atkm*s,def:(2+1.5*n)*t.defm,spd:5+.5*n,boss:o,spec:t.spec||[],exp:tn((4+3*n)*(o?5:1)*(1+(t.hpm-1)*.3)),gold:tn((3+2*n)*(o?6:1)),turn:0,dead:!1}}const pi=(r,e,t,n=1)=>Math.max(1,tn((e*1.7-t*.7)*n*r.range(.9,1.1))),$c=(r,e,t,n=1)=>Math.max(1,tn((e*1.7-t*.35)*n*r.range(.9,1.1))),jn=r=>r.party.filter(e=>e.hp>0),$n=r=>r.enemies.filter(e=>e.hp>0),Td=(r,e)=>r.party.some(t=>t.id===e);function Yc(r,e,t){return e==="weck"?t.hp>0?!1:(t.hp=Math.max(1,tn(xt(r,t)/2)),!0):t.hp<=0?!1:e==="trank"||e==="grosstrank"?t.hp>=xt(r,t)?!1:(t.hp=Math.min(xt(r,t),t.hp+(e==="trank"?70:250)),!0):e==="aether"||e==="aetherflask"?t.sp>=On(t)?!1:(t.sp=Math.min(On(t),t.sp+(e==="aether"?20:60)),!0):e==="fisch1"||e==="fisch2"?t.hp>=xt(r,t)?!1:(t.hp=e==="fisch1"?Math.min(xt(r,t),t.hp+120):xt(r,t),!0):!1}const Ed=(r,e)=>Math.abs(r-.5)<=e/2;function Ad(r,e,t=0){let n=r.randf()*(1-t*.1);for(const i of e){if(n<i.p)return i;n-=i.p}return e[0]}function Rd(r,e){const[t,n,i]=r;return t===n&&n===i?Ra[t].pay*e:t===n||n===i?e:0}const Cd=["rap","schlager","xmas","rock","static"],Pd=[["beatbandit","reimruepel","bassgolem","boombox","graffiti","mikspin"],["gecko","schleim","aal","disco","herz","zuckerg"],["geist","lebkuchen","schneemann","eisratte","eisspin","zwerg","knurrmops"],["gargoyle","mole","verstaerker","rifffled","daemon","roadie","knurrmops","glutwicht"],["schemen","stoersignal","kreischer","antspin","rausritter","zyklop","glutwicht"]],Kc=["trank","trank","aether","grosstrank","aetherflask","weck","bombe"];function Qu(r,e){const t=Ju(e*7919+r*104729>>>0),n=26,i=16,s={x:2,y:14},a=Array.from({length:i},()=>Array(n).fill("#"));let o=0;const l=(S,I)=>{S>0&&I>0&&S<n-1&&I<i-1&&a[I][S]==="#"&&(a[I][S]=".",o++)};l(1,14),l(2,14),l(3,14),l(2,13);const c=150+Math.min(60,r*2);let h={...s},u=0;for(;o<c&&u<2e4;){u++;const S=[[1,0],[-1,0],[0,1],[0,-1],[1,0],[0,-1]][Math.floor(t.randf()*6)];h={x:Math.min(n-2,Math.max(1,h.x+S[0])),y:Math.min(i-2,Math.max(1,h.y+S[1]))},l(h.x,h.y),t.randf()<.3&&l(h.x+1,h.y),t.randf()<.3&&l(h.x,h.y+1),t.randf()<.02&&(h={...s})}const f=()=>{const S=[];for(let I=1;I<i-1;I++)for(let L=1;L<n-1;L++)a[I][L]!=="#"&&a[I][L]!=="T"&&S.push({x:L,y:I});return S},d=()=>{const S=new Map([[Ti(s),0]]),I=new Map,L=[s];for(;L.length;){const O=L.shift();for(const[G,B]of[[1,0],[-1,0],[0,1],[0,-1]]){const $={x:O.x+G,y:O.y+B},V=Ti($);S.has(V)||a[$.y][$.x]==="#"||a[$.y][$.x]==="T"||(S.set(V,S.get(Ti(O))+1),I.set(V,O),L.push($))}}return{dist:S,par:I}};for(const S of t.shuffle(f()))Math.abs(S.x-s.x)+Math.abs(S.y-s.y)<3||t.randf()>.12||(a[S.y][S.x]="T",d().dist.size!==f().length&&(a[S.y][S.x]="."));for(const S of f())t.randf()<.07&&(a[S.y][S.x]=",");const{dist:m,par:v}=d();let p=s,g=-1;for(const S of f()){const I=m.get(Ti(S));I>g&&(g=I,p=S)}const _=$u[r],y=r>=ju,x=[{x:1,y:14,to:"hub",req:"",label:"Ausgang",kind:"exit",ax:2,ay:2},{x:p.x,y:p.y,to:y?"hub":"tiefe",req:_?"deep_boss":"",label:y?"Aufstieg":"Treppe",kind:y?"exit":"cave",ax:2,ay:y?2:14,deep:y?"done":"down",lock:"Ein Echo bewacht die Treppe. Besiege es zuerst."}];let P={};if(_){const S=v.get(Ti(p))||s;P={x:S.x,y:S.y,id:_,flag:"deep_boss",deep:!0}}const R=t.shuffle(f().filter(S=>m.get(Ti(S))>6&&!$i(S,p)&&!(P.id&&$i(S,P)))),A=[],C=2+(r%3===0?1:0);for(let S=0;S<C&&S<R.length;S++){const I=R[S];if(t.randf()<.4)A.push({id:"deep_c"+S,x:I.x,y:I.y,kind:"gold",v:40+r*30});else{const L=r>=12&&t.randf()<.12?"frucht":Kc[Math.min(Kc.length-1,Math.floor(t.randf()*(3+r/6)))];A.push({id:"deep_c"+S,x:I.x,y:I.y,kind:"item",v:L,n:L==="frucht"?1:1+(r>15?1:0)})}}const M=Math.min(4,Math.floor((r-1)/6)),w={name:`Tiefe der Echos – Ebene ${r}`,theme:Cd[Math.floor((r-1)/6)%5],rows:a.map(S=>S.join("")),enc:Pd[M],rate:.07,lv:Math.round(1+r*.85),lvBonus:Math.round((r-1)%6*.6+Math.max(0,r-24)),deep:r,seed:e,portals:x,npcs:[],chests:A,boss:P};return sl(w,An),y||(x[1].ax=s.x*An,x[1].ay=s.y*An),w}je.tiefe=Qu(1,1);function Dd(r){for(const e of Object.keys(r.flags))(e.startsWith("deep_c")||e==="deep_boss")&&delete r.flags[e]}const Vr=r=>pt[r]?.use||"hero",Ar=r=>fn[r.id],Id=r=>Ar(r).forms[r.form],Nt=r=>Id(r).name,oi=r=>tn(Ar(r).hp+Ar(r).hpg*(r.lv-1))*(1+r.form*.25)|0,Zc=r=>tn((2+1.6*r.lv)*(1+r.form*.15)),mi=(r,e)=>tn((Ar(r)[e]+Ar(r)[e+"g"]*(r.lv-1))*(1+r.form*.15));function Jc(r,e=1){const t={id:r,lv:e,exp:0,form:0,hp:1};return t.hp=oi(t),t}const Ld=r=>r.caps&&r.caps.active&&r.caps.own[r.caps.active]||null,Ca=r=>r.form<2&&r.lv>=(r.form===0?8:16);function Qc(r,e){const t=[];for(r.exp+=e;r.exp>=Yi(r.lv)&&r.lv<40;){r.exp-=Yi(r.lv);const n=oi(r);r.lv+=1,r.hp>0&&(r.hp+=oi(r)-n),t.push(r.lv)}return t}function kd(r){return Ca(r)?(r.form+=1,r.hp=oi(r),!0):!1}function as(r){for(const e of r.party)e.hp=xt(r,e),e.sp=On(e);for(const e in r.caps.own){const t=r.caps.own[e];t.hp=oi(t)}}const Nd=r=>6+4*Math.round(Nn(r));function ac(r,e,t){return e<0||t<0||e>=r.mw||t>=r.mh?"#":r.map.rows[t][e]}const Rr=(r,e)=>Ku.includes(ac(r,e.x,e.y));function Ci(r,e){for(const t of r.objs)if(t.x===e.x&&t.y===e.y)return t;return null}function Ja(r,e){return r.map.portals.some(t=>t.x===e.x&&t.y===e.y)}function fr(r){let e=0;for(const t of["boss_rap","boss_schlager","boss_xmas","boss_rock"])r.flags[t]&&e++;return e}const Ha=r=>Math.min(4,Math.max(0,fr(r))),oc=r=>!!r.map.world,ol=(r,e)=>e.req===""||!!r.flags[e.req];function Ud(r,e,t){let n=9999,i="ow_town";for(const s of r.portals){const a=Math.abs(s.x-e)+Math.abs(s.y-t);if(a<n){n=a;const o=s.to;i="ow_"+(je[o].town?"town":o==="tower"?"static":o)}}return i}function Gr(r,e,t){return oc(r)?r.reg[t][e]:r.map.theme}function ef(r,e,t,n){r.mapId=t,r.map=je[t];const i=r.map;r.mh=i.rows.length,r.mw=i.rows[0].length,r.objs=[];for(const o of i.npcs)r.objs.push({t:"npc",x:o.x,y:o.y,d:o,uid:ni(r)});for(const o of i.chests)r.flags[o.id]||r.objs.push({t:"chest",x:o.x,y:o.y,d:o,uid:ni(r)});const s=i.boss;s&&s.id&&!r.flags[s.flag]&&r.objs.push({t:"boss",x:s.x,y:s.y,d:s,uid:ni(r)}),i.gate&&!r.flags[i.gate.flag]&&r.objs.push({t:"gate",x:i.gate.x,y:i.gate.y,d:i.gate,uid:ni(r)});const a=i.puzzle;if(a){const o=Fd(r,t);a.blocks.forEach(([l,c],h)=>{const u=o?a.plates[h]:[l,c];r.objs.push({t:"block",x:u[0],y:u[1],uid:ni(r)})}),a.torches.forEach(([l,c],h)=>r.objs.push({t:"torch",x:l,y:c,d:{i:h},lit:o||!!r.flags[`torch_${t}_${h}`],uid:ni(r)})),!o&&i.gate&&r.objs.push({t:"seal",x:i.gate.x-1,y:i.gate.y,d:{},uid:ni(r)})}for(const o of i.loot||[])r.flags[o.id]||r.objs.push({t:o.kind,x:o.x,y:o.y,d:o,uid:ni(r)});if(r.reg=[],i.world)for(let o=0;o<r.mh;o++){const l=[];for(let c=0;c<r.mw;c++)l.push(Ud(i,c,o));r.reg.push(l)}r.gp={x:n.x,y:n.y},r.ppos={x:n.x,y:n.y},r.moving=!1,r.grace=8,Hd(r,e)}const Fd=(r,e)=>!!(r.flags["seal_"+e]||je[e].boss&&je[e].boss.flag&&r.flags[je[e].boss.flag]);function Od(r,e,t){const n={x:e.x+t.x,y:e.y+t.y};return Rr(r,n)||Ci(r,n)||Ja(r,n)||ac(r,n.x,n.y)==="~"||r.roamers.some(i=>$i(i.g,n))?!1:(e.x=n.x,e.y=n.y,!0)}function Bd(r){const e=r.map.puzzle;if(!e)return!1;const t=e.plates.every(([i,s])=>r.objs.some(a=>a.t==="block"&&a.x===i&&a.y===s)),n=r.objs.filter(i=>i.t==="torch").every(i=>i.lit);return t&&n}function zd(r,e,t=n=>Rr(r,n)){const n=new Map([[Ti(e),e]]),i=[e];for(;i.length;){const s=i.shift();for(const a of Zu){const o={x:s.x+a.x,y:s.y+a.y},l=Ti(o);!n.has(l)&&!t(o)&&(n.set(l,o),i.push(o))}}return n}function Hd(r,e){r.roamers=[];let t=r.map.enc,n=12;if(oc(r)&&(t=rl[Ha(r)],n=45),!t.length)return;const i=[];for(const s of zd(r,r.gp).values())al(s,r.gp)<7||Ci(r,s)||Ja(r,s)||r.map.gate&&s.x>r.map.gate.x||i.push(s);e.shuffle(i);for(let s=0;s<Math.min(n,i.length);s++){const a=i[s],o={x:a.x,y:a.y};r.roamers.push({uid:ni(r),id:t[e.randi()%t.length],g:{...a},pos:{...o},from:{...o},to:{...o},t:1,wait:e.randf()*.8,stun:0})}}function Vd(r,e,t){if(Rr(r,e)||Ci(r,e)||Ja(r,e)||r.map.gate&&e.x>r.map.gate.x&&!r.flags[r.map.gate.flag])return!1;for(const n of r.roamers)if(n!==t&&$i(n.g,e))return!1;return!0}function Gd(r,e,t){const n=r.gp,i=t.g,s=al(n,i),a=[];for(const l of Zu){const c={x:i.x+l.x,y:i.y+l.y};Vd(r,c,t)&&a.push(c)}if(!a.length)return;let o=a[e.randi()%a.length];if(s<=6&&e.randf()<.85){let l=9999;for(const c of a){const h=al(n,c);h<l&&(l=h,o=c)}}else if(e.randf()<.5)return;t.from={...t.pos},t.to={x:o.x,y:o.y},t.g=o,t.t=0}function Wd(r,e,t){for(const n of r.roamers)if(n.stun>0&&(n.stun-=t),n.t<1?(n.t=Math.min(1,n.t+t/yd),n.pos={x:n.from.x+(n.to.x-n.from.x)*n.t,y:n.from.y+(n.to.y-n.from.y)*n.t}):(n.wait-=t,n.wait<=0&&n.stun<=0&&(n.wait=e.range(.2,.6),Gd(r,e,n))),n.stun<=0&&Math.hypot(n.pos.x-r.ppos.x,n.pos.y-r.ppos.y)<Md)return n;return null}function Xd(r,e){const t=oc(r)?wd[Ha(r)]:r.map.lv??Nn(r),n=Math.min(3,Math.max(.6,1+.3*(t-Nn(r))));return tn(e*n)}function qd(r,e,t){const n=[];for(e.exp+=t;e.exp>=Yi(e.lv)&&e.lv<40;){e.exp-=Yi(e.lv);const i=xt(r,e);e.lv+=1,e.hp+=xt(r,e)-i,e.sp=Math.min(On(e),e.sp+4),n.push(e.lv)}return n}const eh=r=>r==="hub"?{x:12,y:12}:r==="lind"?{x:12,y:11}:r==="welt"?{x:20*Ri,y:22*Ri}:{x:2*An,y:14*An},Dt={TITLE:0,WORLD:1,BATTLE:2},xr="anmachaQuest_save",jd={mcdroehn:["Vorgal: Tausend Jahre in Ketten ... und die ersten, die mich wecken, sind Kinder mit Holzschwertern?","Vorgal: Die Gruft hallt nur noch von meinem Groll. Gleich auch von euren Schreien!"],koenigin:["Seraphine: Wie hübsch ihr seid. Wie Rosen kurz vor dem Welken.","Seraphine: Bleibt bei mir. Für immer. Meine Dornen halten euch fest!"],frostmod:["Kryos: Ihr bringt Wärme in meine Halle. Wie ungezogen.","Kryos: Alles Leben ist nur Lärm vor der Stille. Ich lasse euch erstarren, damit ihr es versteht."],riff:["Pyrax: *GRRRAAAH* Kleine Funken wagen sich in meinen Schlund?","Pyrax: Ich habe Städte verbrannt, bevor eure Ahnen sprechen konnten. BRENNT!"],rauschen:["Nihl: ... Endlich. Die Letzten, die noch Stimmen haben.","Nihl: Die Vier waren nur meine Hände. Ich bin das Schweigen zwischen den Sternen. Werdet still, Kinder Aetherions."]},$d={mcdroehn:["Vorgal zerfällt zu grauer Asche. Ein Sphärenkristall leuchtet auf und erfüllt die Gruft mit einem klaren Ton.","Auf der Weltkarte öffnet sich der Weg zum Rosenhain. In Hafenau wartet jemand auf euch."],koenigin:["Die Dornen welken, Seraphine löst sich in Blütenblätter auf. Der zweite Kristall erwacht!","Auf der Weltkarte öffnet sich die Frostgrotte. In Hafenau wartet jemand auf euch."],frostmod:["Kryos zerspringt wie Glas. Tauwasser tropft von der Decke. Der dritte Kristall erwacht!","Auf der Weltkarte öffnet sich der Glutschlund. In Hafenau wartet jemand auf euch."],riff:["Pyrax stürzt in die Lava, die Flammen erlöschen. Der vierte Kristall erwacht!","Im Norden erhebt sich der Turm der Stille. Der Weg zu Nihl ist frei."]},Yd={mcdroehn:"#ff6a8a",koenigin:"#ff9ad8",frostmod:"#9ad8ff",riff:"#ffb070"},Kd={mcdroehn:["Silas: Der Kristall ... er singt! Hörst du das, Aren?","Aren: Ysolde hatte recht. Die Verfemten sind zurück, und außer uns weiß es noch niemand."],koenigin:["Lyra: Ihre Dornen waren voller Trauer. Vielleicht wollte sie nur nicht vergessen werden.","Aren: Zwei Kristalle sind wach. Noch zwei, dann hält das Gleichgewicht wieder."],frostmod:["Silas: Mir ist immer noch kalt bis in die Knochen.","Fenn: Dann lauf schneller, Magier. Im Glutschlund wirst du dir die Kälte zurückwünschen."],riff:["Borin: Ha! Von diesem Kampf wird man in Lindmark noch lange singen.","Lyra: Seht nach Norden ... der Turm. Dort wartet Nihl, die Stille selbst."]},Zd=[{x:12,y:8,yaw:.6,dist:14,pitch:.55,fx:{k:"crystals",h:5.5,r:2.6},t:["Vor tausend Jahren sangen vier Sphärenkristalle die Welt Aetherion ins Gleichgewicht."]},{x:12,y:9,yaw:-.4,dist:10,pitch:.42,t:["Vier ihrer Hüter verrieten sie. Man nannte sie die Verfemten und versiegelte sie im Herzen der Welt."]},{x:12,y:10,yaw:.2,dist:7,pitch:.3,t:["Doch nun breitet sich eine Stille aus, die selbst die Vögel verstummen lässt. Die Siegel brechen."]},{x:12,y:12,yaw:0,dist:4.6,pitch:.2,t:["In der Hafenstadt Hafenau erwacht der junge Schwertkämpfer Aren aus einem Traum von Sternen, die erlöschen.","Sein bester Freund Silas, ein Magier mit mehr Mut als Vorsicht, wartet schon vor der Tür.","Älteste Ysolde hat nach euch gerufen. Sie steht in der Mitte der Stadt."]}];class Jd{constructor(e,t,n={}){this.ui=e,this.view=t,this.rng=n.rng||Ju(),this.store=n.store||null,this.S=bd(),this.mode=Dt.TITLE,this.busy=!1,this.autoplay=!1,this.autoN=0,this.curHero=-1,this.dirStack=[],this.dpad=null,this.stepflip=0,this.mt=0,this.debug=!!n.debug,this.audio=n.audio||null,this.musicOverride=null,this.battleMusic="battle"}sfx(e){this.audio?.sfx(e)}pickMusic(){if(!this.audio)return;const e=this.S;let t=this.musicOverride;t||(this.mode===Dt.TITLE?t="title":this.mode===Dt.BATTLE?t=this.battleMusic:e.map.world?t="world":e.map.town?t=e.flags.boss_rauschen?"ending":"town":t=e.map.theme==="static"?"tower":e.map.theme),this.audio.music(t)}async cutscene(e,t){if(!(this.autoplay||!this.view)){t&&(this.musicOverride=t),this.ui.letterbox?.(!0);for(const n of e)this.view.cine={x:n.x+.5,z:n.y+.5,h:n.h??.9,yaw:n.yaw,dist:n.dist,pitch:n.pitch},n.fx&&(n.fx.clear&&this.view.clearSceneFx?.(),this.view.sceneFx?.(n.fx.k,n.fx.x??n.x,n.fx.y??n.y,n.fx),n.fx.sfx&&this.sfx(n.fx.sfx)),n.wait&&await this.wait(n.wait),n.t&&n.t.length&&await this.say(n.t);this.view.clearSceneFx?.(),this.view.cine=null,this.ui.letterbox?.(!1),t&&(this.musicOverride=null)}}async say(e){this.autoplay||(this.ui.setTouch(!1),await this.ui.say(e),this.ui.setTouch(this.mode===Dt.WORLD&&!this.busy))}async choose(e,t=!1,n=[]){if(this.autoplay){await this.tick();for(let i=0;i<e.length;i++)if(!n[i])return i;return 0}return this.ui.choose(e,t,n,this.mode)}async chooseCross(e){if(this.autoplay){await this.tick(),this.autoN++;let t=[0,1,2,0,3,4,0,2][this.autoN%8];return e[t]&&(t=0),t}return this.ui.chooseCross(e)}async banner(e,t=1.3){this.autoplay||await this.ui.banner(e,t)}async bmsg(e,t=.7){this.autoplay||(this.ui.msg(e),t>0&&await this.wait(t))}async callout(e,t="#ffd24a",n=.55){this.autoplay||(this.ui.callout?.(e,t),n>0&&await this.wait(n))}showOrder(e){this.ui.turnOrder?.(e.map(t=>t.k==="e"?{n:t.who.name,c:"#ff5a6a",e:!0,boss:!!t.who.boss}:t.k==="c"?{n:Nt(t.who),c:fn[t.who.id].col}:{n:t.who.name,c:Jt[t.who.id].col}))}tick(){return new Promise(e=>setTimeout(e,0))}wait(e){return this.autoplay?this.tick():new Promise(t=>setTimeout(t,e*1e3))}async fade(e,t=.22){if(this.autoplay){this.ui.fadeNow(e);return}await this.ui.fade(e,t)}setTouch(e){this.ui.setTouch(e)}hasSave(){return!!(this.store&&this.store.has(xr))}saveGame(){if(!this.store)return;const e=this.S,t=e.party.map(n=>({id:n.id,name:n.name,lv:n.lv,exp:n.exp,hp:n.hp,sp:n.sp,ip:n.ip}));this.store.set(xr,JSON.stringify({v:6,party:t,inv:e.inv,gold:e.gold,gear:e.gear,flags:e.flags,caps:e.caps,chips:e.chips,deepBest:e.deepBest,map:e.mapId==="tiefe"?"hub":e.mapId,gp:e.mapId==="tiefe"?{x:2,y:2}:e.gp,t:e.playTime}))}loadGame(){if(!this.store)return!1;let e=null;try{e=JSON.parse(this.store.get(xr))}catch{return!1}e&&e.map==="tiefe"&&(e.map="hub",e.gp={x:2,y:2});const t=e?e.v|0:0;if(e&&e.gp&&e.map==="welt"&&t<6){const s=t<5?Ri:Ri/2;e.gp={x:Math.round(e.gp.x*s),y:Math.round(e.gp.y*s)}}if(e&&e.gp&&Yu.includes(e.map)&&t<6&&(e.gp={x:e.gp.x*An,y:e.gp.y*An}),!e||!Array.isArray(e.party)||!e.party.length||!je[e.map])return!1;const n=this.S;if(n.party=e.party.filter(s=>Jt[s.id]).map(s=>({id:s.id,name:Jt[s.id].name,lv:s.lv|0||1,exp:s.exp|0,hp:s.hp|0,sp:s.sp|0,ip:0})),!n.party.length)return!1;if(n.inv=Object.assign({trank:0,aether:0,weck:0},e.inv||{}),n.gold=e.gold|0,n.gear=e.gear|0,n.flags=e.flags||{},n.caps={own:{},active:null},e.caps&&e.caps.own)for(const s in e.caps.own){const a=e.caps.own[s];if(!fn[s]||!a)continue;const o=Jc(s,Math.max(1,a.lv|0));o.exp=a.exp|0,o.form=Math.min(2,Math.max(0,a.form|0)),o.hp=Math.min(oi(o),Math.max(0,a.hp|0)),n.caps.own[s]=o}e.caps&&n.caps.own[e.caps.active]&&(n.caps.active=e.caps.active),n.flags.boss_rap&&!n.flags.tool_hammer&&(n.flags.tool_hammer=!0,n.flags.rap_tool=!0),n.flags.boss_schlager&&!n.flags.tool_fire&&(n.flags.tool_fire=!0,n.flags.schlager_tool=!0),n.chips=Math.max(0,e.chips|0),n.deepBest=Math.max(0,e.deepBest|0),n.playTime=+e.t||0,this.mode=Dt.WORLD;const i=e.gp&&ac({...n,map:je[e.map],mw:je[e.map].rows[0].length,mh:je[e.map].rows.length},e.gp.x,e.gp.y)!=="#"&&!Ku.includes(je[e.map].rows[e.gp.y]?.[e.gp.x]??"#")?e.gp:eh(e.map);return this.loadMap(e.map,i),!0}loadMap(e,t){ef(this.S,this.rng,e,t),this.moving=!1,this.view.mapChanged?.()}async showTitle(){this.mode=Dt.TITLE,this.busy=!0,this.setTouch(!1),this.ui.msg(""),this.view.setMode?.(Dt.TITLE);const e=this.hasSave();for(;;){const t=e?["Fortsetzen","Neues Spiel"]:["Neues Spiel"],n=await this.choose(t);if(!e&&n===0||e&&n===1){await this.newGame();return}if(this.loadGame()){await this.startWorldAfterLoad();return}}}async newGame(){const e=this.S;e.party=[ho(e,"andrew"),ho(e,"marco")],e.inv={trank:5,aether:2,weck:0},e.gold=100,e.gear=0,e.flags={},e.caps={own:{},active:null},e.playTime=0,await this.fade(1,.25),this.mode=Dt.WORLD,this.loadMap("hub",{x:12,y:12}),await this.view.ready?.(),await this.fade(0),this.busy=!0,await this.cutscene(Zd,"intro"),this.view&&(this.view.camYawT=this.view.camYaw=0),this.busy=!1,this.setTouch(!0)}async startWorldAfterLoad(){await this.fade(1,.25),this.mode=Dt.WORLD,await this.view.ready?.(),this.busy=!1,this.setTouch(!0),await this.fade(0)}readMove(){let e=null;if(this.stick?this.stickLock||(e=this.stick):this.stickLock=!1,!e&&this.dpad&&(e=this.dpad),!e&&this.dirStack.length){let c=0,h=0;for(const f of this.dirStack)c+=f.x,h+=f.y;if(!Math.hypot(c,h)){const f=this.dirStack[this.dirStack.length-1];c=f.x,h=f.y}e={x:c,y:h,m:this.walkKey?.5:1}}if(!e)return null;const t=Math.hypot(e.x,e.y);if(!t)return null;const n=e.m??Math.min(1,t),i=e.x/t,s=e.y/t,a=this.view?.camYaw||0,o=Math.cos(a),l=Math.sin(a);return{x:i*o+s*l,y:-i*l+s*o,m:n}}pressDir(e,t){this.dirStack=this.dirStack.filter(n=>!$i(n,e)),t&&this.dirStack.push(e)}clearDirs(){this.dirStack=[],this.dpad=null,this.stickLock=!0}idle(){return!this.busy&&!this.ui.isChoosing()&&!this.ui.isTalking()}update(e){const t=this.S;if(this.pickMusic(),this.mode===Dt.WORLD&&(t.playTime+=e,!this.ui.touchVisible()&&this.dpad&&(this.dpad=null),this.idle()?this.walk(e):t.moving=!1,this.idle())){const n=Wd(t,this.rng,e);n&&this.startRoamerFight(n)}}solidAt(e,t){return Rr(this.S,{x:e,y:t})||!!Ci(this.S,{x:e,y:t})}slide(e,t){const n=this.S,i=_d,s=n.ppos.x+.5+e,a=n.ppos.y+.5+t,o=Math.floor(s-i),l=Math.floor(s+i-1e-6),c=Math.floor(a-i),h=Math.floor(a+i-1e-6);for(let u=c;u<=h;u++)for(let f=o;f<=l;f++){if(!this.solidAt(f,u))continue;const d=n.ppos.x+.5,m=n.ppos.y+.5;if(!(f+1>d-i&&f<d+i&&u+1>m-i&&u<m+i))return e>0?n.ppos.x=f-i-.5-1e-4:e<0&&(n.ppos.x=f+1+i-.5+1e-4),t>0?n.ppos.y=u-i-.5-1e-4:t<0&&(n.ppos.y=u+1+i-.5+1e-4),{x:f,y:u}}return n.ppos.x+=e,n.ppos.y+=t,null}walk(e){const t=this.S,n=this.readMove();if(!n||n.m<.15){t.moving=!1,t.running=!1,this.bumpT=0;return}t.running=n.m>.6,t.moving=!0,t.fdir={x:n.x,y:n.y},t.face=Math.abs(n.x)>=Math.abs(n.y)?{x:Math.sign(n.x),y:0}:{x:0,y:Math.sign(n.y)};const i=(t.running?gd:vd)*Math.min(e,.1),s=Math.max(1,Math.ceil(i/.15));let a=null;for(let c=0;c<s;c++){const h=n.x?this.slide(n.x*i/s,0):null,u=n.y?this.slide(0,n.y*i/s):null;h&&Math.abs(n.x)>=Math.abs(n.y)&&this.assist("y",Math.sign(n.x),i/s),u&&Math.abs(n.y)>Math.abs(n.x)&&this.assist("x",Math.sign(n.y),i/s),a=a||(Math.abs(n.x)>=Math.abs(n.y)?h||u:u||h)}const o={x:Math.round(t.ppos.x),y:Math.round(t.ppos.y)};if(!$i(o,t.gp)&&(this.prevGp={...t.gp},t.gp=o,this.stepflip=1-this.stepflip,this.onStep(),!this.idle()))return;const l=a&&Ci(t,a);l&&$i(a,{x:t.gp.x+t.face.x,y:t.gp.y+t.face.y})?(this.bumpT=(this.bumpT||0)+e,this.bumpT>=xd&&(this.bumpT=0,t.moving=!1,this.interact(l))):this.bumpT=0}assist(e,t,n){const i=this.S,s={x:i.ppos.x+.5,y:i.ppos.y+.5},a=Math.floor(s[e]),o=s[e]-a,l=[a,o<.5?a-1:a+1];for(const c of l){const h=e==="y"?{x:Math.floor(s.x)+t,y:c}:{x:c,y:Math.floor(s.y)+t},u=e==="y"?{x:Math.floor(s.x),y:c}:{x:c,y:Math.floor(s.y)};if(this.solidAt(h.x,h.y)||this.solidAt(u.x,u.y))continue;const f=c+.5-s[e];if(Math.abs(f)>.75)continue;const d=Math.sign(f)*Math.min(Math.abs(f),n);e==="y"?this.slide(0,d):this.slide(d,0);return}}actionFront(){const e=this.S;if(this.mode!==Dt.WORLD||!this.idle())return!1;const t={x:e.ppos.x+.5,y:e.ppos.y+.5},n=e.fdir||e.face,i=[{x:Math.floor(t.x+n.x*.75),y:Math.floor(t.y+n.y*.75)},{x:e.gp.x+e.face.x,y:e.gp.y+e.face.y}];for(const s of i){const a=Ci(e,s);if(a){const o={x:s.x-e.gp.x,y:s.y-e.gp.y};return Math.abs(o.x)+Math.abs(o.y)===1&&(e.face=o),this.interact(a),!0}}return!1}tryStep(e){const t=this.S;t.face={...e};const n={x:t.gp.x+e.x,y:t.gp.y+e.y};if(Rr(t,n))return;const i=Ci(t,n);if(i){this.interact(i);return}this.prevGp={...t.gp},t.gp=n,t.ppos={...n},this.onStep()}onStep(){const e=this.S;e.steps++;for(const t of e.map.portals)if(t.x===e.gp.x&&t.y===e.gp.y){this.usePortal(t);return}e.map.rate>0&&(e.grace-=1,e.grace<=0&&this.rng.randf()<e.map.rate*.4&&this.startEncounter())}async usePortal(e){const t=this.S;if(this.busy=!0,this.setTouch(!1),e.req!==""&&!t.flags[e.req]){await this.say([e.lock||(e.to==="tiefe"?"Ein kalter Hauch steigt aus dem Schacht. Erst wenn der Rosenhain befreit ist, wagt ihr den Abstieg.":`Der Zugang nach "${e.label}" ist versiegelt. Befreie zuerst das vorherige Reich.`)]);const i={x:t.gp.x-t.face.x,y:t.gp.y-t.face.y};t.gp=this.solidAt(i.x,i.y)&&this.prevGp?{...this.prevGp}:i,t.ppos={...t.gp},this.busy=!1,this.setTouch(!0);return}await this.fade(1);const n=e.to;if(e.deep&&this.deepStep(e),this.loadMap(n,{x:e.ax,y:e.ay}),je[n].town&&this.saveGame(),await this.view.ready?.(),await this.fade(0),n==="hub"){for(const i of dd)if(t.flags[i[0]]&&!Td(t,i[1])){const s={x:15,y:10};this.autoplay||!this.view?await this.say([i[2],`${Jt[i[1]].name} schließt sich euch an.`]):await this.cutscene([{x:s.x,y:s.y,h:1,yaw:.5,dist:4.2,pitch:.2,wait:.8,fx:{k:"actor",id:i[1],yaw:.6},t:[i[2]]},{x:s.x,y:s.y,h:.9,yaw:-.4,dist:3.4,pitch:.12,fx:{k:"crystal",col:Jt[i[1]].col,sfx:"levelup"},t:[`${Jt[i[1]].name} schließt sich euch an!`]}]),t.party.push(ho(t,i[1],Math.max(1,Math.trunc(Nn(t))))),this.view.partyChanged?.()}}e.deep==="done"&&await this.deepDone(),this.busy=!0,await this.banner(t.map.world||t.map.town?t.map.name:`${t.map.name}  (Stufe ${t.map.lv})`),this.busy=!1,this.setTouch(!0)}async interact(e){switch(this.busy=!0,this.setTouch(!1),this.clearDirs(),e.t){case"chest":await this.openChest(e);break;case"npc":await this.talkNpc(e.d);break;case"boss":await this.fightBoss(e);break;case"gate":await this.openGate(e);break;case"block":await this.pushBlock(e);break;case"torch":await this.lightTorch(e);break;case"rock":case"bramble":await this.breakLoot(e);break;case"seal":await this.say(["Ein Siegel aus Licht versperrt den Weg zur Halle.",this.sealHint()]);break}this.busy=!1,this.setTouch(this.mode===Dt.WORLD)}sealHint(){const e=this.S.map.puzzle,t=[];return e.plates.length&&t.push(`${e.plates.length} Druckplatte${e.plates.length>1?"n":""} mit Steinblöcken beschweren`),e.torches.length&&t.push(`${e.torches.length} Fackel${e.torches.length>1?"n":""} entzünden`),`Inschrift: „${t.join(" und ")}, dann weicht das Licht.“ (Steckt ein Block fest, verlasse das Reich und komm zurück.)`}async pushBlock(e){const t=this.S;if(!Od(t,e,t.face)){this.sfx("cancel");return}this.sfx("push"),await this.wait(.12),await this.checkSeal()}async lightTorch(e){const t=this.S;if(e.lit){await this.say(["Die Fackel brennt hell."]);return}if(!t.flags.tool_fire){await this.say(["Eine erloschene Fackel. Mit etwas Feuer ließe sie sich entzünden."]);return}e.lit=!0,t.flags[`torch_${t.mapId}_${e.d.i}`]=!0,this.sfx("magic"),this.view?.fxWorld?.("torch",e),await this.wait(.3),await this.checkSeal()}async breakLoot(e){const t=this.S,n=e.d,i=e.t==="rock",s=i?"tool_hammer":"tool_fire";if(!t.flags[s]){await this.say([i?"Ein rissiger Felsen. Darin glitzert etwas ... mit einem Hammer könnte man ihn zerschlagen.":"Dichte Dornenranken. Dahinter schimmert etwas. Feuer würde sie vertreiben."]);return}t.flags[n.id]=!0,this.removeObj(e),this.sfx(i?"heavy":"magic"),this.view?.fxWorld?.(i?"smash":"burn",e),await this.wait(.35),n.gold?(t.gold+=n.gold,await this.say([`${i?"Der Fels zerbirst":"Die Ranken verglühen"}: ${n.gold} Münzen!`])):(t.inv[n.v]=(t.inv[n.v]||0)+n.n,this.sfx("chest"),await this.say([`${i?"Der Fels zerbirst":"Die Ranken verglühen"}: ${pt[n.v].name} x${n.n}!`]))}async checkSeal(){const e=this.S,t=e.objs.find(i=>i.t==="seal");if(!t||!Bd(e))return;e.flags["seal_"+e.mapId]=!0;const n=Math.atan2(e.gp.x-t.x,e.gp.y-t.y);!this.autoplay&&this.view&&(this.ui.letterbox?.(!0),this.view.cine={x:t.x+.5,z:t.y+.5,h:.8,yaw:n,dist:5,pitch:.35},await this.wait(1)),this.removeObj(t),this.sfx("door"),this.view?.fxWorld?.("seal",t),await this.say(["Ein heller Klang hallt durch das Reich ... das Lichtsiegel vor der Halle zerbricht!"]),this.view&&(this.view.cine=null),this.ui.letterbox?.(!1)}removeObj(e){const t=this.S.objs.indexOf(e);t>=0&&this.S.objs.splice(t,1)}async openGate(e){const t=e.d,n=this.S;n.flags[t.key]?(n.flags[t.flag]=!0,this.removeObj(e),this.view.fxWorld?.("gate",e),this.sfx("door"),await this.say(["Der Schlüssel passt! Das Tor öffnet sich knarrend."])):await this.say(["Das Tor zur Halle ist verriegelt. Irgendwo in diesem Reich liegt der Schlüssel in einer Truhe."])}async openChest(e){const t=e.d,n=this.S;if(n.flags[t.id]=!0,this.removeObj(e),this.view.fxWorld?.("chest",e),this.sfx("chest"),t.kind==="gold")n.gold+=t.v,await this.say([`Truhe geöffnet: ${t.v} Münzen!`]);else if(t.kind==="tool")n.flags[t.v]=!0,this.sfx("levelup"),await this.say([`Truhe geöffnet: ${qc[t.v].name}! Er ${qc[t.v].desc}.`,"Lauf einfach gegen das passende Hindernis, dann wird das Werkzeug von selbst eingesetzt."]);else if(t.kind==="capsule"){const i=Jc(t.v,Math.max(1,Math.trunc(Nn(n))-1));n.caps.own[t.v]=i,n.caps.active||(n.caps.active=t.v),this.sfx("levelup"),await this.say([`In der Truhe pulsiert eine leuchtende Kapsel ... Ein Kapselgeist erwacht: ${Nt(i)} (${fn[t.v].elem})!`,n.caps.active===t.v?`${Nt(i)} begleitet euch ab jetzt und kämpft von selbst mit. Im Menü unter „Kapselgeist“ kannst du ihn füttern.`:"Im Menü unter „Kapselgeist“ kannst du wählen, wer euch begleitet."])}else t.kind==="key"?(n.flags[t.v]=!0,await this.say([`Truhe geöffnet: ${pd[t.v]} gefunden! Damit lässt sich das Tor zur Halle öffnen.`])):(n.inv[t.v]=(n.inv[t.v]||0)+t.n,await this.say([`Truhe geöffnet: ${pt[t.v].name} x${t.n}!`]))}async talkNpc(e){const t=this.S;switch(e.kind){case"elder":{const n=fr(t);t.flags.boss_rauschen?await this.say(["Ysolde: Die Stille ist gebrochen. Hörst du die Möwen? Aetherion singt wieder, Aren."]):n===0?await this.say(["Ysolde: Aren, Silas. Die Siegel der Verfemten sind gebrochen. Vier Reiche sind in ihrer Hand, und ihre Kristalle schweigen.","Verlasst die Stadt nach Süden. Im Westen liegt die Echogruft, dort tobt Vorgal der Grollende.","Jedes Reich verbirgt einen Schlüssel zur Halle seines Herrn. Werdet stärker, und vergesst die Tränke bei Mara nicht!"]):n<4?await this.say([`Ysolde: ${n} von 4 Kristallen singen wieder. Der nächste Weg öffnet sich auf der Weltkarte, sobald der letzte Verfemte gefallen ist.`,"Reihenfolge: Echogruft, Rosenhain, Frostgrotte, Glutschlund."]):await this.say(["Ysolde: Alle vier Kristalle sind erwacht! Im Norden ragt der Turm der Stille auf.","Nihl selbst wartet dort. Geht gut gerüstet, und kommt zurück."]);break}case"shop":await this.shop(Xc.hub,"Mara: Frische Ware aus aller Welt! Was darf's sein?",6);break;case"trader":await this.shop(Xc.lind,"Quinn: Seltene Ware aus allen vier Reichen. Sphärenfrüchte habe ich auch, wenn die Münzen reichen.",0);break;case"smith":await this.smith();break;case"inn":await this.inn(e);break;case"sage":{const n=Object.keys(t.caps.own).length;n?await this.say([`Mirela: ${n} Kapselgeist${n>1?"er":""} an eurer Seite! Füttert sie mit Tränken und Ätherwaren, dann wachsen sie.`,"Mirela: Ab Stufe 8 und Stufe 16 kann eine Sphärenfrucht sie in eine neue Gestalt verwandeln. Quinn verkauft welche, teuer, aber es lohnt sich."]):await this.say(["Mirela: Kapselgeister sind uralte Wesen, gebannt in Sphärenkapseln. In jedem der vier Reiche schläft einer.","Mirela: Wer eine Kapsel öffnet, gewinnt einen treuen Gefährten. Er kämpft selbst, ihr müsst ihm nichts befehlen."]);break}case"angler":await this.fishing(e);break;case"casino":await this.casino(e);break;case"arena":await this.arena(e);break;case"kid2":await this.say(["Nele: In der Gruft unter der Stadt soll es einen Turm geben, der nie endet ... sagt mein Opa. Aber mein Opa sagt viel."]);break;case"heal":as(t),this.view.fxWorld?.("heal"),this.sfx("heal"),await this.say(["Das Wasser der Quelle leuchtet sanft. LP und SP sind wieder voll, der Fortschritt ist gespeichert."]),this.saveGame();break;case"kid":fr(t)>=2?await this.say(["Pip: Die Vögel singen wieder! Mama sagt, das wart ihr!"]):await this.say(["Pip: Wenn ein Held Schaden nimmt, füllt sich seine IP-Leiste. Dann kann er einen Spezialangriff machen, der ist riesig!"]);break;case"guard":await this.say(['Wache Holm: Tipp: Mit "Wache" halbierst du den Schaden. Mit Q/E oder durch Wischen drehst du den Blick, mit dem Mausrad oder zwei Fingern zoomst du.']);break}}async shop(e,t,n){const i=this.S;for(await this.say([t]);;){const s=n?await this.choose(["Kaufen",`Ausrüstung ${Hr(i)}M`,"Tschüss",`Münzen: ${i.gold}`],!0,[!1,!1,!1,!0]):await this.choose(["Kaufen","Tschüss",`Münzen: ${i.gold}`],!0,[!1,!1,!0]);if(n&&s===2||!n&&s===1||s===-1)break;if(s===0)for(;;){const a=[],o=[];for(const h of e)a.push(`${pt[h].name} ${pt[h].price}M (${i.inv[h]||0})`),o.push(i.gold<pt[h].price);a.push("Zurück"),o.push(!1);const l=await this.choose(a,!0,o);if(l===-1||l===a.length-1)break;const c=e[l];if(!(i.gold<pt[c].price)&&(i.gold-=pt[c].price,i.inv[c]=(i.inv[c]||0)+1,this.autoplay))break}else s===1&&await this.buyGear(n,"Mara");if(this.autoplay)break}}async smith(){const e=this.S;for(await this.say(["Torvald: Mara macht ordentliche Arbeit. Aber Klingen aus Sternenstahl, die gibt es nur bei mir."]);!(await this.choose([`Schmieden ${e.gear>=10?"–":Hr(e)+"M"}`,"Tschüss",`Münzen: ${e.gold}`],!0,[!1,!1,!0])!==0||(await this.buyGear(10,"Torvald"),this.autoplay)););}async inn(e){const t=this.S,n=Nd(t);await this.say([`${e.name}: Willkommen im „Schlafenden Greif“! Ein warmes Bett kostet ${n} Münzen.`]),!(await this.choose([`Übernachten (${n}M)`,"Nein danke"],!0,[t.gold<n,!1])!==0||t.gold<n)&&(t.gold-=n,await this.fade(1,.6),as(t),this.saveGame(),this.sfx("heal"),await this.wait(.8),await this.fade(0,.6),await this.say([`${e.name}: Gut geschlafen? LP und SP sind voll, auch eure Kapselgeister sind ausgeruht. Spielstand gespeichert.`]))}async buyGear(e,t){const n=this.S;if(n.gear>=e)await this.say([e>=10?`${t}: Mehr kann kein Schmied der Welt aus Stahl herausholen!`:`${t}: Besser kann ich es nicht. Frag mal Torvald in Lindmark.`]);else if(n.gold<Hr(n))await this.say([`${t}: Dafür fehlen dir leider Münzen.`]);else{n.gold-=Hr(n),n.gear+=1;for(const i of n.party)i.hp=Math.min(i.hp+8,xt(n,i));this.sfx("chest"),await this.say([`${t} rüstet euch neu aus: Stufe ${n.gear}. Angriff, Abwehr und Magie steigen!`])}}async fightBoss(e){const t=e.d,n=this.S;if(t.deep)return this.fightDeepBoss(e);const i=jd[t.id]||["..."],s=Math.atan2(n.gp.x-e.x,n.gp.y-e.y);await this.cutscene([{x:(e.x+n.gp.x)/2,y:(e.y+n.gp.y)/2,yaw:s+.5,dist:6,pitch:.3,wait:.6,t:i.slice(0,1)},{x:e.x,y:e.y,h:1.5,yaw:s-.25,dist:3.4,pitch:.1,t:i.slice(1)}].filter(o=>o.t.length),"boss");const a=await this.runBattle([t.id],n.map.theme);if(a==="win")if(n.flags[t.flag]=!0,this.removeObj(e),t.id==="rauschen")await this.ending();else{const o=$d[t.id]||["Besiegt!"];this.autoplay||!this.view?await this.say(o):await this.cutscene([{x:e.x,y:e.y,h:1.3,yaw:s+.3,dist:4.2,pitch:.18,wait:1.4,fx:{k:"crystal",col:Yd[t.id],sfx:"levelup"},t:o.slice(0,1)},{x:e.x,y:e.y,h:1,yaw:s-.9,dist:5.6,pitch:.32,t:(Kd[t.id]||[]).filter(l=>n.party.some(c=>l.startsWith(c.name+":")))},{x:e.x,y:e.y,h:1.6,yaw:s+1.6,dist:7.5,pitch:.5,t:o.slice(1)}]),this.saveGame()}else a==="lose"&&await this.gameOver()}async timing(e){return this.autoplay?(await this.tick(),this.rng.randf()):(this.setTouch(!1),this.ui.timing(e))}async fishing(e){const t=this.S;for(await this.say([`${e.name}: Die Fische beißen heute! Wirf die Angel aus und zieh, wenn die Nadel im hellen Feld steht.`]);;){const n=Or.reduce((o,l)=>o+(t.inv[l.id]||0),0),i=await this.choose(["Angeln",`Fische verkaufen (${n})`,"Tschüss"],!0,[!1,!n,!1]);if(i!==0&&i!==1)break;if(i===1){await this.sellFish(e);continue}this.sfx("ok"),this.autoplay||await this.say(["Du wirfst die Angel aus ... Das Wasser liegt still."]),await this.wait(.6+this.rng.randf()*1.6);const s=Ad(this.rng,Or);this.sfx("encounter");const a=await this.timing({title:"Biss!",hint:"Jetzt ziehen!",speed:s.speed,zone:s.zone});if(a>=0&&Ed(a,s.zone)?(t.inv[s.id]=(t.inv[s.id]||0)+1,t.flags["fish_"+s.id]=!0,this.sfx("chest"),await this.say([`Gefangen: ${pt[s.id].name}! (${pt[s.id].desc})`]),Or.every(o=>t.flags["fish_"+o.id])&&!t.flags.fish_prize&&(t.flags.fish_prize=!0,t.inv.frucht=(t.inv.frucht||0)+1,t.gold+=500,this.sfx("levelup"),await this.say([`${e.name}: Alle drei Fischarten! Du bist ein echter Angelmeister. Nimm diese Sphärenfrucht und 500 Münzen!`]))):(this.sfx("cancel"),await this.say(["Die Schnur zuckt ... und der Fisch ist weg."])),this.autoplay)break}}async sellFish(e){const t=this.S;let n=0;for(const i of Or){const s=t.inv[i.id]||0;n+=s*pt[i.id].sell,t.inv[i.id]=0}t.gold+=n,this.sfx("chest"),await this.say([`${e.name}: Frischer Fang! Das macht ${n} Münzen.`])}async reels(e){return this.autoplay?(await this.tick(),[0,1,2].map(()=>this.rng.randi()%Ra.length)):(this.setTouch(!1),this.ui.reels(Ra,e))}async casino(e){const t=this.S;for(await this.say([`${e.name}: Willkommen in der Spielhalle! Ein Jeton kostet ${Br} Münzen. Drei gleiche Zeichen auf dem Sphärenrad gewinnen.`]);;){const n=await this.choose([`Jetons kaufen (10 für ${Br*10}M)`,"Sphärenrad (1 Jeton)","Sphärenrad (5 Jetons)","Preise eintauschen","Tschüss",`Jetons: ${t.chips}  Münzen: ${t.gold}`],!0,[t.gold<Br*10,t.chips<1,t.chips<5,!1,!1,!0]);if(n<0||n===4)break;if(n===0)t.gold-=Br*10,t.chips+=10,this.sfx("chest");else if(n===1||n===2){const i=n===1?1:5;t.chips-=i;const s=await this.reels(i),a=Rd(s,i);t.chips+=a,this.sfx(a>i?"levelup":a?"ok":"cancel"),await this.say([`${s.map(o=>Ra[o].s).join(" ")}  –  ${a>i?`Gewinn: ${a} Jetons!`:a?"Einsatz zurück.":"Leider nichts."}`])}else if(n===3){const i=di.map(a=>`${pt[a.v].name} – ${a.chips} Jetons`).concat(["Zurück"]),s=await this.choose(i,!0,di.map(a=>t.chips<a.chips).concat([!1]));s>=0&&s<di.length&&t.chips>=di[s].chips&&(t.chips-=di[s].chips,t.inv[di[s].v]=(t.inv[di[s].v]||0)+1,this.sfx("chest"),await this.say([`${pt[di[s].v].name} eingetauscht!`]))}if(this.autoplay)break}}deepStep(e){const t=this.S;e.deep==="start"?(t.deep=1,t.deepSeed=this.rng.randi()%1e5+1):e.deep==="down"&&(t.deep+=1),e.to==="tiefe"&&(Dd(t),je.tiefe=Qu(t.deep,t.deepSeed),t.deepBest=Math.max(t.deepBest,t.deep))}async fightDeepBoss(e){const t=e.d,n=this.S;await this.cutscene([{x:e.x,y:e.y,h:1.5,yaw:Math.atan2(n.gp.x-e.x,n.gp.y-e.y),dist:3.6,pitch:.15,t:[n.deep>=ju?"Aus der tiefsten Stille formt sich ein Echo von Nihl ... stärker als je zuvor.":`Ein Echo von ${vn[t.id].name} versperrt die Treppe!`]}],"boss");const i=await this.runBattle([t.id],n.map.theme);i==="win"?(n.flags.deep_boss=!0,this.removeObj(e),await this.say(["Das Echo verhallt. Die Treppe ist frei."])):i==="lose"&&await this.gameOver()}async deepDone(){const e=this.S,t=!e.flags.deep_done;e.flags.deep_done=!0,t&&(e.gold+=5e3,e.inv.frucht=(e.inv.frucht||0)+2,e.inv.weck=(e.inv.weck||0)+3),this.sfx("victory"),await this.say(t?["Ihr steigt aus der tiefsten Ebene ans Licht. Die Echos schweigen.","Belohnung: 5000 Münzen, 2 Sphärenfrüchte und 3 Lebensfedern!"]:["Ihr steigt erneut aus der Tiefe auf. Die Echos verneigen sich."]),this.saveGame()}async arena(e){const t=this.S;if(!t.flags.boss_rauschen){await this.say([`${e.name}: Ich schreibe die Chronik eurer Kämpfe. Wenn Nihl gefallen ist, kann ich die Erinnerung an jeden Verfemten heraufbeschwören.`]);return}if(await this.say([`${e.name}: Die Arena der Erinnerung. Fünf Verfemte nacheinander, zwischen den Kämpfen nur ein kurzer Atemzug. Bereit?`]),await this.choose(["Herausforderung annehmen","Später"],!0)!==0)return;as(t);for(let s=0;s<zr.length;s++){await this.say([`Runde ${s+1} von ${zr.length}: ${vn[zr[s]].name}!`]);const a=await this.runBattle([zr[s]],["rap","schlager","xmas","rock","static"][s]);if(a!=="win"){as(t),await this.say([a==="lose"?`${e.name}: Die Erinnerung war stärker. Ruht euch aus und versucht es erneut.`:`${e.name}: Ihr zieht euch zurück. Die Arena wartet.`]);return}for(const o of t.party)o.hp=Math.min(xt(t,o),Math.max(1,o.hp)+Math.trunc(xt(t,o)/4)),o.sp=Math.min(On(o),o.sp+Math.trunc(On(o)/4))}const i=!t.flags.rush_done;t.flags.rush_done=!0,i&&(t.gold+=3e3,t.inv.frucht=(t.inv.frucht||0)+1,t.inv.aetherflask=(t.inv.aetherflask||0)+3),as(t),this.sfx("victory"),await this.say([`${e.name}: Unglaublich! Alle fünf Verfemten in einem Zug. Euer Name steht nun in goldenen Lettern in der Chronik.`].concat(i?["Belohnung: 3000 Münzen, eine Sphärenfrucht und 3 Ätherflaschen!"]:[])),this.saveGame()}async ending(){const e=this.S;this.musicOverride="ending";const t=e.map.boss||{x:e.gp.x,y:e.gp.y},n=["Nihl zerfällt in Sternenstaub. Aus dem Turm steigt ein einzelner, klarer Ton auf, dann ein zweiter, dann tausend.","Die vier Kristalle singen gemeinsam. Über Aetherion geht die Sonne auf, als hätte sie lange gewartet."],i=["Aren: Es ist vorbei. Hört ihr? Die Welt klingt wieder.","Silas: Ich hab doch gesagt, wir schaffen das. Na gut ... ich hab es gehofft.","Lyra: Die Stille hat uns gelehrt, wie wertvoll jeder Ton ist.","Fenn: Und jetzt? Ich hätte Lust auf einen Fisch in Lindmark.","Borin: Und auf ein Fest, das drei Tage dauert!"].filter(s=>e.party.some(a=>s.startsWith(a.name+":")));this.autoplay||!this.view?await this.say(n):await this.cutscene([{x:t.x,y:t.y,h:1.6,yaw:.4,dist:6,pitch:.25,wait:1.2,fx:{k:"crystals",h:2.6,r:2,burst:!0,sfx:"levelup"},t:n.slice(0,1)},{x:t.x,y:t.y,h:2.2,yaw:-.8,dist:9,pitch:.55,t:n.slice(1)},{x:t.x,y:t.y,h:1,yaw:2.6,dist:4.5,pitch:.15,t:i}],"ending"),await this.say([`ENDE. Danke fürs Spielen von Aetherion: Chronik der Sphären!  Spielzeit: ${Math.trunc(e.playTime/60)} Min.`]),e.flags.boss_rauschen=!0,this.musicOverride=null,await this.fade(1),this.loadMap("hub",{x:12,y:12}),this.saveGame(),await this.view.ready?.(),await this.fade(0)}async gameOver(){const e=this.S;await this.fade(1),as(e),e.gold=Math.trunc(e.gold/2),this.loadMap("hub",{x:12,y:12}),await this.view.ready?.(),await this.fade(0),await this.say(["Ihr erwacht in Hafenau an der Quelle. Eure Wunden sind geheilt, doch die Hälfte der Münzen ist verloren."])}async openMenu(){if(this.busy||this.mode!==Dt.WORLD||this.ui.isChoosing()||this.ui.isTalking())return;const e=this.S;for(this.busy=!0,this.setTouch(!1),this.clearDirs();;){const t=[["status","Status"],["items","Items"]];Object.keys(e.caps.own).length&&t.push(["caps","Kapselgeist"]),t.push(["save","Speichern"],["music",`Musik: ${this.audio?.on===!1?"aus":"an"}`],["title","Titel"],["back","Zurück"]);const n=await this.choose(t.map(s=>s[1]),!0),i=n>=0?t[n][0]:"back";if(i==="back")break;if(i==="music"){this.audio&&(this.audio.setOn(!this.audio.on),this.onAudio?.(this.audio.on));continue}if(i==="status")if(this.ui.status)await this.ui.status(this.statusData());else{const s=e.party.map(a=>`${a.name} (${pn(a).role}) Lv ${a.lv}  LP ${a.hp}/${xt(e,a)}  SP ${a.sp}/${On(a)}  ANG ${Xt(e,a,"atk")} ABW ${Xt(e,a,"def")} MAG ${Xt(e,a,"mag")}  EXP ${a.exp}/${Yi(a.lv)}`);s.push(`Münzen: ${e.gold}   Ausrüstung: Stufe ${e.gear}   Kristalle: ${fr(e)}/4`),await this.say(s)}else if(i==="items")await this.useItemMenu();else if(i==="caps")await this.capsuleMenu();else if(i==="save")this.saveGame(),await this.say(["Spielstand gespeichert."]);else if(i==="title"){this.saveGame(),this.busy=!1,await this.fade(1),await this.fade(0),this.showTitle();return}if(this.autoplay)break}this.busy=!1,this.setTouch(!0)}statusData(){const e=this.S;return{heroes:e.party.map(t=>({id:t.id,name:t.name,role:pn(t).role,col:pn(t).col,lv:t.lv,hp:t.hp,mhp:xt(e,t),sp:t.sp,msp:On(t),atk:Xt(e,t,"atk"),def:Xt(e,t,"def"),mag:Xt(e,t,"mag"),spd:Xt(e,t,"spd"),exp:t.exp,need:Yi(t.lv)})),caps:Object.keys(e.caps.own).map(t=>{const n=e.caps.own[t];return{name:Nt(n),elem:fn[t].elem,col:fn[t].col,lv:n.lv,hp:n.hp,mhp:oi(n),exp:n.exp,need:Yi(n.lv),atk:mi(n,"atk"),mag:mi(n,"mag"),active:e.caps.active===t}}),gold:e.gold,gear:e.gear,crystals:fr(e),time:e.playTime,inv:{...e.inv}}}async useItemMenu(){const e=this.S;for(;;){const t=[],n=[];for(const o in pt)(e.inv[o]||0)>0&&Vr(o)==="hero"&&(t.push(o),n.push(`${pt[o].name} x${e.inv[o]}`));if(!t.length){await this.say(["Keine Items, die hier wirken."]);return}n.push("Zurück");const i=await this.choose(n,!0);if(i===-1||i===t.length)return;const s=t[i],a=await this.chooseHero();if(a!==-1&&(Yc(e,s,e.party[a])?(e.inv[s]-=1,this.sfx("heal")):await this.say(["Das hätte jetzt keine Wirkung."]),this.autoplay))return}}async capsuleMenu(){const e=this.S;for(;;){const t=Object.keys(e.caps.own),n=t.map(l=>{const c=e.caps.own[l];return`${e.caps.active===l?"★ ":""}${Nt(c)} (${fn[l].elem}) Lv ${c.lv}  LP ${c.hp}/${oi(c)}`});n.push("Zurück");const i=await this.choose(n,!0);if(i<0||i>=t.length)return;const s=t[i],a=e.caps.own[s],o=await this.choose([e.caps.active===s?"Begleitet euch bereits":"Mitnehmen","Füttern","Zurück"],!0,[e.caps.active===s,!1,!1]);if(o===0?(e.caps.active=s,this.sfx("ok"),await this.say([`${Nt(a)} begleitet euch jetzt.`])):o===1&&await this.feed(a),this.autoplay)return}}async feed(e){const t=this.S,n=Object.keys(pt).filter(l=>(t.inv[l]||0)>0&&(ur[l]||l==="frucht"));if(!n.length){await this.say(["Nichts zum Füttern im Beutel. Tränke, Ätherwaren und Sphärenfrüchte mögen Kapselgeister am liebsten."]);return}const i=n.map(l=>`${pt[l].name} x${t.inv[l]}${l==="frucht"?" (Entwicklung)":` (+${ur[l]} EXP)`}`);i.push("Zurück");const s=await this.choose(i,!0);if(s<0||s>=n.length)return;const a=n[s];if(a==="frucht"){if(!Ca(e)){await this.say([e.form>=2?`${Nt(e)} hat seine höchste Gestalt erreicht.`:`${Nt(e)} ist noch nicht bereit. Ab Stufe ${e.form===0?8:16} kann er sich entwickeln.`]);return}t.inv.frucht-=1;const l=Nt(e);kd(e),this.sfx("special"),this.view?.fxWorld?.("heal"),await this.say([`${l} verschlingt die Sphärenfrucht ... und beginnt zu leuchten!`,`${l} hat sich zu ${Nt(e)} entwickelt! Neue Fähigkeit: ${fn[e.id].skills[e.form].name}.`]);return}t.inv[a]-=1;const o=Qc(e,ur[a]);this.sfx(o.length?"levelup":"heal"),await this.say([`${Nt(e)} frisst genüsslich ${pt[a].name}. +${ur[a]} EXP${o.length?` – Stufe ${e.lv}!`:"."}`].concat(Ca(e)&&(t.inv.frucht||0)>0?["Er wirkt unruhig ... eine Sphärenfrucht könnte ihn verwandeln."]:[]))}chooseHero(){const e=this.S;return this.choose(e.party.map(t=>`${t.name}  ${t.hp}/${xt(e,t)}`),!0)}async startEncounter(){const e=this.S;this.busy=!0,this.setTouch(!1),this.clearDirs(),e.grace=6;let t=e.map.enc,n=e.map.theme;if(e.map.world&&(t=rl[Ha(e)],n=e.reg[e.gp.y][e.gp.x]),!t.length){this.busy=!1,this.setTouch(!0);return}let i=1+(this.rng.randf()<.7?1:0)+(this.rng.randf()<.3?1:0);Nn(e)<3&&(i=Math.min(i,2));const s=[];for(let o=0;o<i;o++)s.push(t[this.rng.randi()%t.length]);await this.bmsg("Gegner greifen an!",.55),await this.runBattle(s,n)==="lose"&&await this.gameOver(),this.busy=!1,this.setTouch(!0)}async startRoamerFight(e){const t=this.S;this.busy=!0,this.setTouch(!1),this.clearDirs();let n=t.map.enc,i=t.map.theme;t.map.world&&(n=rl[Ha(t)],i=t.reg[t.gp.y][t.gp.x]);const s=[e.id];let a=(this.rng.randf()<.5?1:0)+(this.rng.randf()<.2?1:0);Nn(t)<3?a=0:Nn(t)<5&&(a=Math.min(a,1));for(let l=0;l<a;l++)s.push(n[this.rng.randi()%n.length]);await this.bmsg("Ein Monster stellt sich euch in den Weg!",.6);const o=await this.runBattle(s,i);if(o==="win"){const l=t.roamers.indexOf(e);l>=0&&t.roamers.splice(l,1)}else o==="run"?e.stun=3:o==="lose"&&await this.gameOver();t.grace=6,this.busy=!1,this.setTouch(!0)}async runBattle(e,t){const n=this.S;this.sfx("encounter"),await this.fade(1,.18),this.ui.msg(""),this.mode=Dt.BATTLE,this.pickMusic(),n.enemies=e.map(c=>Sd(n,c)),this.battleMusic=e[0]==="rauschen"?"final":n.enemies[0].boss?"boss":"battle";for(const c of n.party)c.ip=0,c.down=c.hp<=0;const i=Ld(n);n.bcap=i&&i.hp>0?i:null,await this.view.battleBegin?.(t,n.enemies,n.party,n.bcap),this.setTouch(!1),await this.fade(0,.18);const s=e.length,a=n.enemies[0].boss;await this.bmsg(s===1?`${n.enemies[0].name} erscheint!`:`${s} Gegner!`,.8);let o="",l=0;for(;o==="";){l++;const c=[];let h=0;const u=jn(n),f=u.map(v=>({k:"h",who:v,s:Xt(n,v,"spd")}));for(const v of $n(n))f.push({k:"e",who:v,s:v.spd});for(n.bcap&&n.bcap.hp>0&&f.push({k:"c",who:n.bcap,s:mi(n.bcap,"spd")}),this.showOrder(f.sort((v,p)=>p.s-v.s));h<u.length;){const v=u[h];this.curHero=n.party.indexOf(v);let p=await this.pickCommand(v,a);if(p){if(p.type==="run"){if(this.rng.randf()<.65){await this.bmsg("Ihr seid entkommen!",.8),o="run";break}await this.bmsg("Flucht misslungen!",.7),p={type:"guard",h:v}}c.push(p),h++}}if(this.curHero=-1,o!=="")break;const d=[];for(const v of c)d.push({k:"h",who:v.h,c:v,s:Xt(n,v.h,"spd")+this.rng.randf()*3});for(const v of $n(n))d.push({k:"e",who:v,s:v.spd+this.rng.randf()*3});n.bcap&&n.bcap.hp>0&&d.push({k:"c",who:n.bcap,s:mi(n.bcap,"spd")+this.rng.randf()*3}),d.sort((v,p)=>p.s-v.s),this.showOrder(d);const m=[];for(const[v,p]of d.entries()){if(!$n(n).length||!jn(n).length)break;this.ui.turnActive?.(v),p.k==="h"?p.who.hp>0&&await this.heroAct(p.c,m):p.k==="c"?p.who.hp>0&&await this.capAct(p.who,m):p.who.hp>0&&await this.enemyAct(p.who,m)}$n(n).length?jn(n).length?this.autoplay&&l>200&&(o="lose"):o="lose":o="win"}this.ui.turnOrder?.(null),o==="win"?await this.victory():o==="lose"&&await this.bmsg("Das Team ist besiegt ...",1.2),this.ui.msg(""),await this.fade(1,.18),this.view.battleEnd?.(),this.mode=Dt.WORLD,n.enemies=[];for(const c of n.party)delete c.down;return n.bcap&&n.bcap.hp<=0&&(n.bcap.hp=1),n.bcap=null,await this.fade(0,.18),o}async pickCommand(e,t){const n=this.S,i=za[pn(e).ip];for(;;)switch(await this.chooseCross([!1,!1,e.ip<i.ip,!1,!1,!1])){case 0:{const a=await this.pickEnemy();if(a>=0)return{type:"atk",h:e,t:n.enemies[a]};break}case 1:{const a=pn(e).skills,o=[],l=[];for(const h of a){const u=Fr[h];o.push(`${u.name} ${u.sp}SP`),l.push(e.sp<u.sp)}o.push("Zurück"),l.push(!1);let c=await this.choose(o,!0,l);if(this.autoplay&&c>=0&&c<a.length&&e.sp<Fr[a[c]].sp&&(c=-1),c>=0&&c<a.length){const h=await this.pickSkillTarget(e,Fr[a[c]],a[c],!1);if(h)return h}break}case 2:{if(e.ip<i.ip)break;const a=await this.pickSkillTarget(e,i,pn(e).ip,!0);if(a)return a;break}case 3:{const a=[],o=[];for(const l in pt)(n.inv[l]||0)>0&&Vr(l)!=="capsule"&&(a.push(l),o.push(`${pt[l].name} x${n.inv[l]}`));if(!a.length)await this.bmsg("Keine Items!",.6);else{o.push("Zurück");const l=await this.choose(o,!0);if(l>=0&&l<a.length){if(Vr(a[l])==="enemy")return{type:"item",h:e,i:a[l],t:null};const c=await this.chooseHero();if(c>=0)return{type:"item",h:e,i:a[l],t:n.party[c]}}}break}case 4:return{type:"guard",h:e};case 5:if(t)await this.bmsg("Vor diesem Gegner gibt es kein Entkommen!",.9);else return{type:"run",h:e};break}}async pickSkillTarget(e,t,n,i){const s=this.S,a=i?"ipskill":"skill";if(t.kind==="heal"&&!t.all){const l=await this.chooseHero();return l>=0?{type:a,h:e,s:n,t:s.party[l]}:null}if(t.all||t.kind==="guard")return{type:a,h:e,s:n,t:null};const o=await this.pickEnemy();return o>=0?{type:a,h:e,s:n,t:s.enemies[o]}:null}async pickEnemy(){const e=this.S,t=[],n=[];if(e.enemies.forEach((s,a)=>{s.hp>0&&(t.push(a),n.push(s.name))}),t.length===1)return t[0];n.push("Zurück"),this.ui.targetHint?.(t);const i=await this.choose(n,!0);return this.ui.targetHint?.(null),i<0||i>=t.length?-1:t[i]}hitEnemy(e,t,n="slash"){const i=this.S;e.hp=Math.max(0,e.hp-t),this.sfx(n==="magic"?"magic":"hit");const s=i.enemies.indexOf(e);this.view.battleEnemy?.(s,"hurt"),this.view.battleFx?.(n,"enemy",s),this.ui.floatEnemy?.(s,String(t),n==="magic"?"#d8b8ff":"#ffffff")}hurtHero(e,t,n=!1){const i=this.S;e.hp=Math.max(0,e.hp-t),this.sfx(n?"heavy":"hit"),e.ip=Math.min(100,e.ip+(n?22:12));const s=i.party.indexOf(e);this.ui.floatHero?.(s,String(t),"#ff7373"),this.view.battleHero?.(s,"hurt"),this.view.battleFx?.(n?"heavy":"hit","hero",s),this.view.shake?.(n?.32:.22)}async heroAct(e,t){const n=this.S,i=e.h,s=n.party.indexOf(i);switch(e.type){case"guard":t.push(i),this.view.battleHero?.(s,"guard"),this.view.battleFx?.("guard","hero",s),await this.bmsg(`${i.name} geht in Deckung.`,.45);break;case"atk":{let a=e.t;if(a.hp<=0){const o=$n(n);if(!o.length)return;a=o[0]}await this.bmsg(`${i.name} greift ${a.name} an!`,.35),this.view.battleHero?.(s,"attack",n.enemies.indexOf(a)),await this.wait(.28),this.hitEnemy(a,pi(this.rng,Xt(n,i,"atk"),a.def)),await this.wait(.5);break}case"item":{const a=e.t;if(Vr(e.i)==="enemy"){if((n.inv[e.i]||0)<=0){await this.bmsg("Ohne Wirkung ...",.5);break}n.inv[e.i]-=1,await this.bmsg(`${i.name} wirft eine ${pt[e.i].name}!`,.5),this.view.battleHero?.(s,"attack",-1),this.view.shake?.(.3),await this.wait(.3);for(const o of $n(n))this.hitEnemy(o,Math.trunc((40+9*Nn(n))*this.rng.range(.9,1.1)),"magic");await this.wait(.5)}else if((n.inv[e.i]||0)>0&&Yc(n,e.i,a)){n.inv[e.i]-=1,await this.bmsg(`${i.name} nutzt ${pt[e.i].name} auf ${a.name}.`,.8);const o=n.party.indexOf(a);this.ui.floatHero?.(o,"+","#66ff99"),this.view.battleFx?.("heal","hero",o),a.down&&a.hp>0&&(a.down=!1,this.view.battleHero?.(o,"idle"))}else await this.bmsg("Ohne Wirkung ...",.5);break}case"skill":case"ipskill":{const a=e.type==="ipskill",o=a?za[e.s]:Fr[e.s];if(a){if(i.ip<o.ip)return;i.ip-=o.ip}else{if(i.sp<o.sp){await this.bmsg("Zu wenig SP!",.5);return}i.sp-=o.sp}await this.callout(o.name,a?"#ffd24a":Jt[i.id].col,.45);const l=e.t&&n.enemies.includes(e.t)?n.enemies.indexOf(e.t):-1;if(this.view.battleHero?.(s,o.kind==="phys"?"attack":"cast",l),this.view.battleSkill?.(s,e.s,e.t&&n.party.includes(e.t)?[n.party.indexOf(e.t)]:l>=0?[l]:null),a&&(this.view.battleFx?.("special","hero",s),this.sfx("special")),await this.wait(.3),o.kind==="heal"){let c=o.all?jn(n):[e.t];if(a){for(const h of n.party)h.hp<=0&&(h.hp=Math.max(1,Math.trunc(xt(n,h)/2)));c=n.party}for(const h of c){const u=o.mult>50?xt(n,h)-h.hp:Math.trunc((Xt(n,i,"mag")*o.mult+12)*this.rng.range(.95,1.05));h.hp=Math.min(xt(n,h),h.hp+u);const f=n.party.indexOf(h);this.sfx("heal"),this.ui.floatHero?.(f,"+"+u,"#66ff99"),this.view.battleFx?.("heal","hero",f),h.down&&h.hp>0&&(h.down=!1,this.view.battleHero?.(f,"idle"))}await this.wait(.5)}else if(o.kind==="guard"){for(const c of jn(n))t.push(c),this.view.battleFx?.("guard","hero",n.party.indexOf(c));await this.wait(.3)}else{let c=o.all?$n(n):[e.t];!o.all&&c[0].hp<=0&&(c=$n(n).slice(0,1));const h=o.hits||1;for(let u=0;u<h;u++){for(const f of c)f.hp<=0||(o.kind==="phys"?this.hitEnemy(f,pi(this.rng,Xt(n,i,"atk"),f.def,o.mult),a?"bigslash":"slash"):this.hitEnemy(f,$c(this.rng,Xt(n,i,"mag"),f.def,o.mult),"magic"));await this.wait(.3)}await this.wait(.3)}break}}await this.checkEnemyDeaths()}async capAct(e,t){const n=this.S,i=fn[e.id],s=$n(n);if(!s.length)return;let a=s[0];for(const u of s)u.hp<a.hp&&(a=u);const o=i.skills.slice(0,e.form+1);let l=this.rng.randf()<.45?o[this.rng.randi()%o.length]:null;const c=jn(n).some(u=>u.hp<xt(n,u)*.5);l&&l.kind==="heal"&&!c&&(l=null);const h=Nt(e);if(!l)await this.bmsg(`${h} greift ${a.name} an!`,.35),this.view.battleCap?.("attack",n.enemies.indexOf(a)),await this.wait(.28),this.hitEnemy(a,pi(this.rng,mi(e,"atk"),a.def)),await this.wait(.45);else{if(await this.callout(l.name,fn[e.id].col,.5),this.view.battleCap?.(l.kind==="phys"?"attack":"cast",l.all?-1:n.enemies.indexOf(a)),this.view.battleFx?.("special","capsule",0),await this.wait(.3),l.kind==="heal"){for(const u of jn(n)){const f=Math.trunc((mi(e,"mag")*l.mult+10)*this.rng.range(.95,1.05));u.hp=Math.min(xt(n,u),u.hp+f);const d=n.party.indexOf(u);this.ui.floatHero?.(d,"+"+f,"#66ff99"),this.view.battleFx?.("heal","hero",d)}this.sfx("heal")}else if(l.kind==="guard")for(const u of jn(n))t.push(u),this.view.battleFx?.("guard","hero",n.party.indexOf(u));else{const u=l.all?s:[a];for(let f=0;f<(l.hits||1);f++){for(const d of u)d.hp<=0||(l.kind==="phys"?this.hitEnemy(d,pi(this.rng,mi(e,"atk"),d.def,l.mult),"slash"):this.hitEnemy(d,$c(this.rng,mi(e,"mag"),d.def,l.mult),"magic"));await this.wait(.3)}}await this.wait(.3)}await this.checkEnemyDeaths()}async checkEnemyDeaths(){const e=this.S;for(const t of e.enemies)t.hp<=0&&!t.dead&&(t.dead=!0,this.view.battleEnemyDown?.(e.enemies.indexOf(t)),await this.bmsg(`${t.name} zerfällt zu Staub!`,.6))}hurtCap(e,t,n){e.hp=Math.max(0,e.hp-t),this.sfx(n?"heavy":"hit"),this.ui.floatCap?.(String(t),"#ff7373"),this.view.battleCap?.(e.hp>0?"hurt":"death"),this.view.battleFx?.(n?"heavy":"hit","capsule",0)}async enemyAct(e,t){const n=this.S,i=jn(n);if(!i.length)return;e.turn+=1;const s=e.spec,a=s.length>0&&e.turn%3===0,o=n.enemies.indexOf(e);if(a){this.view.battleEnemy?.(o,"attack"),await this.callout(s[0],"#ff4a5a",.7),this.view.battleFx?.("spec","enemy",o);for(const c of i){let h=pi(this.rng,e.atk,Xt(n,c,"def"),s[1]);t.includes(c)&&(h=Math.max(1,Math.trunc(h/2))),this.hurtHero(c,h,!0)}const l=n.bcap;l&&l.hp>0&&this.hurtCap(l,pi(this.rng,e.atk,Zc(l),s[1]),!0),await this.wait(.5)}else if(n.bcap&&n.bcap.hp>0&&this.rng.randf()<1/(i.length+1)){const l=n.bcap,c=this.rng.randf()<.2;this.view.battleEnemy?.(o,"attack",-2),await this.bmsg(`${e.name} greift ${Nt(l)} an!`,.4),this.hurtCap(l,pi(this.rng,e.atk,Zc(l),c?1.5:1),c),await this.wait(.45),l.hp<=0&&await this.bmsg(`${Nt(l)} ist erschöpft und zieht sich in seine Kapsel zurück.`,.7)}else{const l=this.rng.randf()<.2,c=i[this.rng.randi()%i.length];this.view.battleEnemy?.(o,"attack",n.party.indexOf(c)),await this.bmsg(l?`${e.name} wuchtet auf ${c.name} ein!`:`${e.name} greift ${c.name} an!`,.4);let h=pi(this.rng,e.atk,Xt(n,c,"def"),l?1.5:1);t.includes(c)&&(h=Math.max(1,Math.trunc(h/2))),this.hurtHero(c,h,l),await this.wait(.45)}for(const l of n.party){const c=n.party.indexOf(l);l.hp<=0&&!l.down?(l.down=!0,this.view.battleHero?.(c,"death"),await this.bmsg(`${l.name} geht zu Boden!`,.5)):l.hp>0&&l.down&&(l.down=!1,this.view.battleHero?.(c,"idle"))}}async victory(){const e=this.S;let t=0,n=0;for(const i of e.enemies)t+=i.exp,n+=i.gold;t=Xd(e,t),e.gold+=n,this.view.battleFx?.("victory"),this.musicOverride="none",this.pickMusic(),this.sfx("victory"),this.view.battleHero?.(-1,"victory"),await this.bmsg(`Sieg!  +${t} EXP  +${n} Münzen`,1),this.rng.randf()<.25&&(e.inv.trank=(e.inv.trank||0)+1,await this.bmsg("Beute: Trank",.7));for(const i of e.party)if(i.down=!1,!(i.hp<=0))for(const s of qd(e,i,t))this.sfx("levelup"),await this.bmsg(`${i.name} erreicht Stufe ${s}!`,.9);for(const i in e.caps.own){const s=e.caps.own[i],a=i===e.caps.active;for(const o of Qc(s,a?t:Math.trunc(t/2)))a&&(this.sfx("levelup"),await this.bmsg(`${Nt(s)} erreicht Stufe ${o}!`,.8));a&&Ca(s)&&s.hinted!==s.form+1&&(s.hinted=s.form+1,await this.bmsg(`${Nt(s)} ist bereit für eine Sphärenfrucht!`,.9))}this.musicOverride=null}debugKey(e){if(!(!this.debug||this.mode!==Dt.WORLD||!this.idle())&&(e==="F9"&&this.startEncounter(),e==="F8")){const t=co[(co.indexOf(this.S.mapId)+1)%co.length];this.loadMap(t,eh(t))}}}const $e=r=>document.getElementById(r),kt=(r,e,t)=>{const n=document.createElement(r);return e&&(n.className=e),t!==void 0&&(n.textContent=t),n},Qd={sword:'<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/>',staff:'<path d="M12 22V9"/><circle cx="12" cy="6" r="3"/><path d="M12 1v2M7 3l1.5 1.5M17 3l-1.5 1.5"/>',flame:'<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 6-4 12 0 4.3 3 7 7 7z"/>',bag:'<path d="M6 8h12l1 13H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',run:'<path d="M6 21h7l2-5-4-3 2-5h4M9 8 6 11M15 16l3 5"/><circle cx="15" cy="4" r="2"/>'},ep=r=>`<svg viewBox="0 0 24 24" class="i">${Qd[r]}</svg>`,tp=[["sword","Angriff"],["staff","Fertigkeit"],["flame","Spezial"],["bag","Item"],["shield","Wache"],["run","Flucht"]];class np{constructor(e){this.g=e,this.view=null,this.talking=!1,this.choosingList=null,this.choosingCross=null,this.statusOpen=null,this.touchOn=!1,this.touchDevice=matchMedia("(pointer: coarse)").matches||"ontouchstart"in window,this.cards=[],this.bars=[],this.labels=[],this.targets=null,this.build()}build(){const e=$e("cross");this.crossBtns=tp.map(([c,h],u)=>{const f=kt("button","cb c"+u);return f.innerHTML=ep(c)+`<span>${h}</span><em></em>`,f.setAttribute("aria-label",h),f.addEventListener("pointerenter",()=>{f.disabled||this.crossFocus(u)}),f.addEventListener("click",()=>{this.choosingCross&&!f.disabled&&this.pickCross(u)}),e.appendChild(f),f}),$e("dlg").addEventListener("pointerdown",c=>{this.talking&&(c.preventDefault(),this.advance())}),$e("status").addEventListener("pointerdown",()=>this.closeStatus()),$e("menuBtn").addEventListener("click",()=>this.g.openMenu()),$e("actBtn").addEventListener("pointerdown",c=>{c.preventDefault(),this.action("ok")||this.g.actionFront()});const t=$e("joy"),n=$e("knob");let i=null,s=0,a=0;const o=c=>{const h=c.clientX-s,u=c.clientY-a,f=Math.hypot(h,u),d=Math.min(f,42);n.style.transform=`translate(${f?h/f*d:0}px, ${f?u/f*d:0}px)`,this.g.dpad=f>=10?{x:h/f,y:u/f,m:Math.min(1,(f-10)/30)}:null};t.addEventListener("pointerdown",c=>{if(i!==null)return;i=c.pointerId,t.setPointerCapture(i);const h=t.getBoundingClientRect();s=h.left+h.width/2,a=h.top+h.height/2,o(c),c.preventDefault()}),t.addEventListener("pointermove",c=>{c.pointerId===i&&o(c)});const l=c=>{c.pointerId===i&&(i=null,this.g.dpad=null,n.style.transform="")};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),this.joyRelease=()=>{i=null,this.g.dpad=null,n.style.transform=""}}isChoosing(){return!!(this.choosingList||this.choosingCross||this.mini)}isTalking(){return this.talking||!!this.statusOpen}touchVisible(){return this.touchOn}letterbox(e){document.body.classList.toggle("cine",!!e)}setTouch(e){this.touchOn=e,$e("menuBtn").hidden=!e,$e("joy").hidden=!(e&&this.touchDevice),$e("actBtn").hidden=!(e&&this.touchDevice),e||this.joyRelease()}say(e){return new Promise(t=>{const n=$e("dlg"),i=$e("dlgText");this.talking=!0,n.hidden=!1;let s=0,a="",o=0,l=0;const c=$e("dlgName"),h=()=>{a=String(e[s]);const u=/^([A-ZÄÖÜ][^:.!?]{0,34}): (.+)$/s.exec(a);if(u&&c){a=u[2],c.textContent=u[1];const f=Object.values(Jt).find(d=>u[1]===d.name||u[1].endsWith(" "+d.name));c.style.setProperty("--nc",f?f.col:"#5a4a9a"),c.hidden=!1}else c&&(c.hidden=!0);o=0,n.classList.remove("more"),clearInterval(l),l=setInterval(()=>{o=Math.min(a.length,o+2),i.textContent=a.slice(0,o),o>=a.length&&(clearInterval(l),n.classList.add("more"))},16)};this.advance=()=>{if(o<a.length){o=a.length,i.textContent=a,clearInterval(l),n.classList.add("more");return}s++,s<e.length?h():(clearInterval(l),this.talking=!1,this.advance=()=>{},n.hidden=!0,i.textContent="",t())},h()})}advance(){}timing({title:e,hint:t,speed:n=1,zone:i=.2}){return new Promise(s=>{const a=$e("mini");a.innerHTML="",a.append(kt("h3","",e));const o=kt("div","bar"),l=kt("div","zone"),c=kt("div","needle");l.style.left=50-i*50+"%",l.style.width=i*100+"%",o.append(l,c),a.append(o,kt("div","hint",(t?t+" ":"")+(this.touchDevice?"Tippen!":"Enter / A drücken!"))),a.hidden=!1;let h=Math.random()*2,u=performance.now(),f=0,d=0;const m=p=>{h+=(p-u)/1e3*n,u=p,f=.5-.5*Math.cos(h*2.4),c.style.left=f*100+"%",d=requestAnimationFrame(m)};d=requestAnimationFrame(m);const v=p=>{cancelAnimationFrame(d),this.mini=null,a.hidden=!0,a.onpointerdown=null,s(p)};this.mini={ok:()=>v(f),cancel:()=>v(-1)},a.onpointerdown=p=>{p.preventDefault(),this.mini?.ok()}})}reels(e,t){return new Promise(n=>{const i=$e("mini");i.innerHTML="",i.append(kt("h3","",`Sphärenrad · Einsatz ${t}`));const s=kt("div","reels"),a=[0,1,2].map(()=>{const d=kt("div","reel");return s.append(d),{el:d,i:Math.floor(Math.random()*e.length),stop:!1}});i.append(s,kt("div","hint",this.touchDevice?"Tippen hält eine Walze an":"Enter / A hält eine Walze an")),i.hidden=!1;let o=0,l=0,c=performance.now();const h=d=>{d.el.textContent=e[d.i].s,d.el.style.color=e[d.i].col},u=d=>{l+=d-c,c=d,l>70&&(l=0,a.forEach((m,v)=>{m.stop||(m.i=(m.i+1+(v===1?1:0))%e.length,h(m))})),o=requestAnimationFrame(u)};a.forEach(h),o=requestAnimationFrame(u);const f=()=>{const d=a.find(m=>!m.stop);d&&(d.stop=!0,d.el.classList.add("stop"),h(d),this.g.sfx?.("ok"),a.every(m=>m.stop)&&(cancelAnimationFrame(o),this.mini=null,i.onpointerdown=null,setTimeout(()=>{i.hidden=!0,n(a.map(m=>m.i))},650)))};this.mini={ok:f,cancel:f},i.onpointerdown=d=>{d.preventDefault(),this.mini?.ok()}})}choose(e,t,n,i){return new Promise(s=>{const a=$e("menu");a.className="glass menu "+(i===2?"mb":i===0?"mt":"mw"),a.innerHTML="";const o=e.map((h,u)=>{const f=kt("button","mi",String(h));return f.disabled=!!n[u],f.addEventListener("pointerenter",()=>{f.disabled||this.listFocus(u)}),f.addEventListener("click",()=>{f.disabled||l(u)}),a.appendChild(f),f});a.hidden=!1;const l=h=>{this.g.sfx?.(h<0?"cancel":"ok"),this.choosingList=null,a.hidden=!0,a.innerHTML="",this.targetFocus(-1),s(h)};this.choosingList={btns:o,canCancel:t,finish:l,focus:-1};const c=o.findIndex(h=>!h.disabled);this.listFocus(c>=0?c:0)})}listFocus(e){const t=this.choosingList;t&&(t.focus=e,t.btns.forEach((n,i)=>n.classList.toggle("on",i===e)),t.btns[e]?.scrollIntoView?.({block:"nearest"}),this.targetFocus(this.targets&&e<this.targets.length?this.targets[e]:-1))}listMove(e){const t=this.choosingList;if(!t)return;const n=t.btns.length;let i=t.focus;for(let s=0;s<n&&(i=(i+e+n)%n,!!t.btns[i].disabled);s++);i!==t.focus&&this.g.sfx?.("move"),this.listFocus(i)}targetHint(e){this.targets=e}targetFocus(e){this.bars.forEach((t,n)=>t&&t.classList.toggle("tgt",n===e))}chooseCross(e){return new Promise(t=>{this.crossBtns.forEach((a,o)=>{a.disabled=!!e[o]});const n=this.g.S,i=n.party[this.g.curHero],s=$e("cross");if(i){const a=Jt[i.id],o=za[a.ip];s.style.setProperty("--hc",a.col),$e("crossLbl").innerHTML=`${a.name}<small>Lv ${i.lv}</small>`,this.crossBtns[1].querySelector("em").textContent=`${i.sp} SP`,this.crossBtns[2].querySelector("em").textContent=`${Math.min(i.ip,o.ip)}/${o.ip}`,this.crossBtns[2].classList.toggle("ready",i.ip>=o.ip),this.crossBtns[3].querySelector("em").textContent=""}$e("cross").hidden=!1,this.choosingCross={done:t,focus:0},this.crossFocus(0)})}crossFocus(e){this.choosingCross&&(this.choosingCross.focus=e,this.crossBtns.forEach((t,n)=>t.classList.toggle("on",n===e)))}crossMove(e){const t=this.choosingCross;if(!t)return;const n=e===0||e===2?-1:1,i=this.crossBtns.length;let s=t.focus;for(let a=0;a<i&&(s=(s+n+i)%i,!!this.crossBtns[s].disabled);a++);s!==t.focus&&(this.crossFocus(s),this.g.sfx?.("move"))}turnOrder(e){const t=$e("turns");if(t){if(!e){t.hidden=!0,t.innerHTML="",this.turnEls=[];return}t.innerHTML="<b>ZUG</b>",this.turnEls=e.map(n=>{const i=kt("div","tk"+(n.e?" e":"")+(n.boss?" boss":""));return i.style.setProperty("--c",n.c),i.title=n.n,i.innerHTML=`<i>${n.n[0]}</i>`,t.appendChild(i),i}),t.hidden=!1}}turnActive(e){(this.turnEls||[]).forEach((t,n)=>{t.classList.toggle("on",n===e),t.classList.toggle("done",n<e)})}callout(e,t){const n=$e("callout");n&&(n.textContent=e,n.style.setProperty("--cc",t||"#ffd24a"),n.hidden=!1,n.classList.remove("show"),n.offsetWidth,n.classList.add("show"),clearTimeout(this._coT),this._coT=setTimeout(()=>{n.hidden=!0},1200))}pickCross(e){const t=this.choosingCross;!t||this.crossBtns[e].disabled||(this.choosingCross=null,$e("cross").hidden=!0,this.g.sfx?.("ok"),t.done(e))}status(e){return new Promise(t=>{const n=$e("status"),i=Math.floor(e.time/60);n.innerHTML=`<div class="glass sbox"><h3>Status</h3><div class="sgrid">${e.heroes.map(s=>`
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
        <p class="sk">Weiter mit Bestätigen oder Antippen</p></div>`,n.hidden=!1,this.statusOpen=()=>{n.hidden=!0,n.innerHTML="",this.statusOpen=null,t()}})}closeStatus(){this.statusOpen&&this.statusOpen()}msg(e){const t=$e("msg");t.textContent=e,t.hidden=!e}banner(e,t){return new Promise(n=>{const i=$e("banner");i.textContent=e,i.hidden=!1,i.classList.remove("show"),i.offsetWidth,i.classList.add("show"),setTimeout(()=>{i.hidden=!0,i.classList.remove("show"),n()},t*1e3)})}fade(e,t){const n=$e("fade");return n.style.transition=`opacity ${t}s ease`,n.style.opacity=e,new Promise(i=>setTimeout(i,t*1e3+20))}fadeNow(e){const t=$e("fade");t.style.transition="none",t.style.opacity=e}float(e,t,n,i,s){const a=kt("div","fl"+(s?" big":""),n);a.style.left=e+"px",a.style.top=t+"px",a.style.color=i,$e("floats").appendChild(a),setTimeout(()=>a.remove(),950)}floatEnemy(e,t,n){if(!this.view)return;const i=this.view.battle.enemies[e],s=this.view.screenPos("enemy",e,i?i.h*.85:1.5);s&&this.float(s.x+(Math.random()-.5)*30,s.y,t,n,!0)}floatCap(e,t){if(this.capCard){const n=this.capCard.el.getBoundingClientRect();this.float(n.left+n.width*.5,n.top-4,e,t,!1)}}floatHero(e,t,n){const i=this.cards[e];if(!i)return;const s=i.el.getBoundingClientRect();this.float(s.left+s.width*.5,s.top-4,t,n,!1)}frame(){const e=this.g,t=e.S,n=e.mode===1,i=e.mode===2;if($e("hud").hidden=!n,$e("title").hidden=e.mode!==0,n){const s=`${t.map.name}`;this._hudT!==s&&(this._hudT=s,$e("hudName").textContent=s),this._hudG!==t.gold&&(this._hudG=t.gold,$e("hudGold").textContent=t.gold)}this.frameLabels(n&&t.map.world),this.frameBattle(i)}frameLabels(e){const t=$e("labels"),n=this.view;if(!e||!n||!n.labels.length){this.labels.length&&(t.innerHTML="",this.labels=[]);return}(this.labels.length!==n.labels.length||this._labMap!==n.labels)&&(t.innerHTML="",this._labMap=n.labels,this.labels=n.labels.map(i=>{const s=kt("div","lab",i.p.label);return t.appendChild(s),s})),n.labels.forEach((i,s)=>{const a=this.labels[s],o=n.project(i.node.position.clone().setY(i.node.position.y+i.h));a.style.transform=`translate(${o.x}px, ${o.y}px) translate(-50%, -100%)`;const l=ol(this.g.S,i.p);a.classList.toggle("closed",!l),a.hidden=!o.vis})}frameBattle(e){const t=this.g,n=t.S,i=this.view,s=$e("party"),a=$e("bars");if(s.hidden=!e,!e){this.cards.length&&(s.innerHTML="",this.cards=[]),this.capCard=null,this.bars.length&&(a.innerHTML="",this.bars=[]);return}this.cards.length!==n.party.length&&(s.innerHTML="",this.capCard=null,this.cards=n.party.map(l=>{const c=Jt[l.id],h=kt("div","card glass");h.style.setProperty("--hc",c.col),h.innerHTML=`<div class="ch"><i class="av">${c.name[0]}</i><b>${c.name}</b><em>Lv <span class="lv"></span></em></div>
          <div class="br hp"><span>LP</span><u><s></s></u><em class="v"></em></div>
          <div class="br sp"><span>SP</span><u><s></s></u><em class="v"></em></div>
          <div class="br ip"><span>IP</span><u><s></s><i class="mk"></i></u></div>`,s.appendChild(h);const u=f=>h.querySelector(f);return{el:h,lv:u(".lv"),hp:u(".hp s"),hpv:u(".hp .v"),sp:u(".sp s"),spv:u(".sp .v"),ip:u(".ip s"),mk:u(".mk"),last:""}})),n.party.forEach((l,c)=>{const h=this.cards[c],u=xt(n,l),f=On(l),d=za[Jt[l.id].ip].ip,m=[l.hp,u,l.sp,f,l.ip,l.lv,t.curHero===c].join();h.last!==m&&(h.last=m,h.lv.textContent=l.lv,h.hp.style.width=l.hp/u*100+"%",h.hp.classList.toggle("low",l.hp/u<=.3),h.hpv.textContent=l.hp,h.sp.style.width=l.sp/Math.max(1,f)*100+"%",h.spv.textContent=l.sp,h.ip.style.width=l.ip+"%",h.mk.style.left=d+"%",h.el.classList.toggle("ready",l.ip>=d),h.el.classList.toggle("hot",t.curHero===c),h.el.classList.toggle("down",l.hp<=0))});const o=n.bcap;if(o&&(!this.capCard||this.capCard.id!==o.id+o.form)){this.capCard?.el.remove();const l=kt("div","card glass cap");l.style.setProperty("--hc",fn[o.id].col),l.innerHTML=`<div class="ch"><i class="av">◆</i><b>${Nt(o)}</b><em>Lv <span class="lv"></span></em></div><div class="br hp"><span>LP</span><u><s></s></u><em class="v"></em></div>`,s.appendChild(l),this.capCard={id:o.id+o.form,el:l,lv:l.querySelector(".lv"),hp:l.querySelector(".hp s"),hpv:l.querySelector(".hp .v"),last:""}}else!o&&this.capCard&&(this.capCard.el.remove(),this.capCard=null);if(o){const l=this.capCard,c=oi(o),h=o.hp+","+c+","+o.lv;l.last!==h&&(l.last=h,l.lv.textContent=o.lv,l.hp.style.width=o.hp/c*100+"%",l.hp.classList.toggle("low",o.hp/c<=.3),l.hpv.textContent=o.hp,l.el.classList.toggle("down",o.hp<=0))}i&&(this.bars.length!==n.enemies.length&&(a.innerHTML="",this.bars=n.enemies.map(l=>{const c=kt("div","eb"+(l.boss?" boss":""));return c.innerHTML=`<b>${l.name}</b><u><s></s></u>`,a.appendChild(c),c})),n.enemies.forEach((l,c)=>{const h=this.bars[c],u=i.battle.enemies[c];if(!h)return;if(l.hp<=0||!u){h.hidden=!0;return}const f=i.screenPos("enemy",c,u.h+.35);if(!f){h.hidden=!0;return}h.hidden=!1,h.style.transform=`translate(${f.x}px, ${f.y}px) translate(-50%, -100%)`,h.querySelector("s").style.width=l.hp/l.mhp*100+"%"}))}action(e){if(this.mini)return e==="ok"?this.mini.ok():e==="cancel"&&this.mini.cancel(),!0;if(this.statusOpen)return(e==="ok"||e==="cancel"||e==="menu")&&this.closeStatus(),!0;if(this.talking)return e==="ok"||e==="cancel"?(this.advance(),!0):!1;if(this.choosingList){const t=this.choosingList;return e==="up"||e==="left"?this.listMove(-1):e==="down"||e==="right"?this.listMove(1):e==="ok"?t.btns[t.focus]&&!t.btns[t.focus].disabled&&t.finish(t.focus):e==="cancel"&&t.canCancel&&t.finish(-1),!0}if(this.choosingCross){const t={up:0,down:1,left:2,right:3}[e];return t!==void 0?this.crossMove(t):e==="ok"&&this.pickCross(this.choosingCross.focus),!0}return!1}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const lc="170",ip=0,th=1,sp=2,tf=1,nf=2,ii=3,ci=0,Gt=1,mt=2,Ft=0,Ki=1,Qt=2,nh=3,ih=4,sf=5,bn=100,rp=101,ap=102,op=103,lp=104,dr=200,cp=201,hp=202,up=203,ll=204,cl=205,hl=206,fp=207,ul=208,dp=209,pp=210,mp=211,gp=212,vp=213,_p=214,fl=0,dl=1,pl=2,Us=3,ml=4,gl=5,vl=6,_l=7,rf=0,xp=1,yp=2,Ii=0,af=1,of=2,lf=3,cc=4,Mp=5,cf=6,hf=7,sh="attached",wp="detached",uf=300,Fs=301,Os=302,Va=303,xl=304,Qa=306,Pn=1e3,Bn=1001,Ga=1002,Ot=1003,ff=1004,pr=1005,Tt=1006,Pa=1007,Rn=1008,zn=1009,df=1010,pf=1011,Cr=1012,hc=1013,Ji=1014,en=1015,Vt=1016,uc=1017,fc=1018,Qi=1020,mf=35902,gf=1021,vf=1022,Yt=1023,_f=1024,xf=1025,Is=1026,es=1027,dc=1028,pc=1029,yf=1030,mc=1031,gc=1033,Da=33776,Ia=33777,La=33778,ka=33779,yl=35840,Ml=35841,wl=35842,bl=35843,Sl=36196,Tl=37492,El=37496,Al=37808,Rl=37809,Cl=37810,Pl=37811,Dl=37812,Il=37813,Ll=37814,kl=37815,Nl=37816,Ul=37817,Fl=37818,Ol=37819,Bl=37820,zl=37821,Na=36492,Hl=36494,Vl=36495,Mf=36283,Gl=36284,Wl=36285,Xl=36286,wf=2200,bf=2201,bp=2202,Pr=2300,Dr=2301,uo=2302,Cs=2400,Ps=2401,Wa=2402,vc=2500,Sp=2501,Tp=0,Sf=1,ql=2,Ep=3200,Ap=3201,_c=0,Rp=1,Ei="",ut="srgb",Wt="srgb-linear",eo="linear",at="srgb",os=7680,rh=519,Cp=512,Pp=513,Dp=514,Tf=515,Ip=516,Lp=517,kp=518,Np=519,jl=35044,ah="300 es",ai=2e3,Xa=2001;class ts{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}}const zt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let oh=1234567;const yr=Math.PI/180,Bs=180/Math.PI;function Cn(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(zt[r&255]+zt[r>>8&255]+zt[r>>16&255]+zt[r>>24&255]+"-"+zt[e&255]+zt[e>>8&255]+"-"+zt[e>>16&15|64]+zt[e>>24&255]+"-"+zt[t&63|128]+zt[t>>8&255]+"-"+zt[t>>16&255]+zt[t>>24&255]+zt[n&255]+zt[n>>8&255]+zt[n>>16&255]+zt[n>>24&255]).toLowerCase()}function Et(r,e,t){return Math.max(e,Math.min(t,r))}function xc(r,e){return(r%e+e)%e}function Up(r,e,t,n,i){return n+(r-e)*(i-n)/(t-e)}function Fp(r,e,t){return r!==e?(t-r)/(e-r):0}function Mr(r,e,t){return(1-t)*r+t*e}function Op(r,e,t,n){return Mr(r,e,1-Math.exp(-t*n))}function Bp(r,e=1){return e-Math.abs(xc(r,e*2)-e)}function zp(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function Hp(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function Vp(r,e){return r+Math.floor(Math.random()*(e-r+1))}function Gp(r,e){return r+Math.random()*(e-r)}function Wp(r){return r*(.5-Math.random())}function Xp(r){r!==void 0&&(oh=r);let e=oh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function qp(r){return r*yr}function jp(r){return r*Bs}function $p(r){return(r&r-1)===0&&r!==0}function Yp(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function Kp(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function Zp(r,e,t,n,i){const s=Math.cos,a=Math.sin,o=s(t/2),l=a(t/2),c=s((e+n)/2),h=a((e+n)/2),u=s((e-n)/2),f=a((e-n)/2),d=s((n-e)/2),m=a((n-e)/2);switch(i){case"XYX":r.set(o*h,l*u,l*f,o*c);break;case"YZY":r.set(l*f,o*h,l*u,o*c);break;case"ZXZ":r.set(l*u,l*f,o*h,o*c);break;case"XZX":r.set(o*h,l*m,l*d,o*c);break;case"YXY":r.set(l*d,o*h,l*m,o*c);break;case"ZYZ":r.set(l*m,l*d,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Sn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function ot(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const qa={DEG2RAD:yr,RAD2DEG:Bs,generateUUID:Cn,clamp:Et,euclideanModulo:xc,mapLinear:Up,inverseLerp:Fp,lerp:Mr,damp:Op,pingpong:Bp,smoothstep:zp,smootherstep:Hp,randInt:Vp,randFloat:Gp,randFloatSpread:Wp,seededRandom:Xp,degToRad:qp,radToDeg:jp,isPowerOfTwo:$p,ceilPowerOfTwo:Yp,floorPowerOfTwo:Kp,setQuaternionFromProperEuler:Zp,normalize:ot,denormalize:Sn};class ae{constructor(e=0,t=0){ae.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ve{constructor(e,t,n,i,s,a,o,l,c){Ve.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c)}set(e,t,n,i,s,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],m=n[8],v=i[0],p=i[3],g=i[6],_=i[1],y=i[4],x=i[7],P=i[2],R=i[5],A=i[8];return s[0]=a*v+o*_+l*P,s[3]=a*p+o*y+l*R,s[6]=a*g+o*x+l*A,s[1]=c*v+h*_+u*P,s[4]=c*p+h*y+u*R,s[7]=c*g+h*x+u*A,s[2]=f*v+d*_+m*P,s[5]=f*p+d*y+m*R,s[8]=f*g+d*x+m*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*s*h+n*o*l+i*s*c-i*a*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,f=o*l-h*s,d=c*s-a*l,m=t*u+n*f+i*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/m;return e[0]=u*v,e[1]=(i*c-h*n)*v,e[2]=(o*n-i*a)*v,e[3]=f*v,e[4]=(h*t-i*l)*v,e[5]=(i*s-o*t)*v,e[6]=d*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*s)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(fo.makeScale(e,t)),this}rotate(e){return this.premultiply(fo.makeRotation(-e)),this}translate(e,t){return this.premultiply(fo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const fo=new Ve;function Ef(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function Ir(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Jp(){const r=Ir("canvas");return r.style.display="block",r}const lh={};function mr(r){r in lh||(lh[r]=!0,console.warn(r))}function Qp(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function em(r){const e=r.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function tm(r){const e=r.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const qe={enabled:!0,workingColorSpace:Wt,spaces:{},convert:function(r,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===at&&(r.r=li(r.r),r.g=li(r.g),r.b=li(r.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(r.applyMatrix3(this.spaces[e].toXYZ),r.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===at&&(r.r=Ls(r.r),r.g=Ls(r.g),r.b=Ls(r.b))),r},fromWorkingColorSpace:function(r,e){return this.convert(r,this.workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Ei?eo:this.spaces[r].transfer},getLuminanceCoefficients:function(r,e=this.workingColorSpace){return r.fromArray(this.spaces[e].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,e,t){return r.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}};function li(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Ls(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}const ch=[.64,.33,.3,.6,.15,.06],hh=[.2126,.7152,.0722],uh=[.3127,.329],fh=new Ve().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),dh=new Ve().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);qe.define({[Wt]:{primaries:ch,whitePoint:uh,transfer:eo,toXYZ:fh,fromXYZ:dh,luminanceCoefficients:hh,workingColorSpaceConfig:{unpackColorSpace:ut},outputColorSpaceConfig:{drawingBufferColorSpace:ut}},[ut]:{primaries:ch,whitePoint:uh,transfer:at,toXYZ:fh,fromXYZ:dh,luminanceCoefficients:hh,outputColorSpaceConfig:{drawingBufferColorSpace:ut}}});let ls;class nm{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ls===void 0&&(ls=Ir("canvas")),ls.width=e.width,ls.height=e.height;const n=ls.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=ls}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ir("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=li(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(li(t[n]/255)*255):t[n]=li(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let im=0;class Af{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:im++}),this.uuid=Cn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(po(i[a].image)):s.push(po(i[a]))}else s=po(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function po(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?nm.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let sm=0;class At extends ts{constructor(e=At.DEFAULT_IMAGE,t=At.DEFAULT_MAPPING,n=Bn,i=Bn,s=Tt,a=Rn,o=Yt,l=zn,c=At.DEFAULT_ANISOTROPY,h=Ei){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:sm++}),this.uuid=Cn(),this.name="",this.source=new Af(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ae(0,0),this.repeat=new ae(1,1),this.center=new ae(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==uf)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Pn:e.x=e.x-Math.floor(e.x);break;case Bn:e.x=e.x<0?0:1;break;case Ga:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Pn:e.y=e.y-Math.floor(e.y);break;case Bn:e.y=e.y<0?0:1;break;case Ga:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}At.DEFAULT_IMAGE=null;At.DEFAULT_MAPPING=uf;At.DEFAULT_ANISOTROPY=1;class Qe{constructor(e=0,t=0,n=0,i=1){Qe.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],m=l[9],v=l[2],p=l[6],g=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(m-p)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(m+p)<.1&&Math.abs(c+d+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,x=(d+1)/2,P=(g+1)/2,R=(h+f)/4,A=(u+v)/4,C=(m+p)/4;return y>x&&y>P?y<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(y),i=R/n,s=A/n):x>P?x<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(x),n=R/i,s=C/i):P<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(P),n=A/s,i=C/s),this.set(n,i,s,t),this}let _=Math.sqrt((p-m)*(p-m)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(_)<.001&&(_=1),this.x=(p-m)/_,this.y=(u-v)/_,this.z=(f-h)/_,this.w=Math.acos((c+d+g-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class rm extends ts{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Qe(0,0,e,t),this.scissorTest=!1,this.viewport=new Qe(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new At(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Af(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class nn extends rm{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Rf extends At{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class am extends At{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Lt{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const f=s[a+0],d=s[a+1],m=s[a+2],v=s[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=f,e[t+1]=d,e[t+2]=m,e[t+3]=v;return}if(u!==v||l!==f||c!==d||h!==m){let p=1-o;const g=l*f+c*d+h*m+u*v,_=g>=0?1:-1,y=1-g*g;if(y>Number.EPSILON){const P=Math.sqrt(y),R=Math.atan2(P,g*_);p=Math.sin(p*R)/P,o=Math.sin(o*R)/P}const x=o*_;if(l=l*p+f*x,c=c*p+d*x,h=h*p+m*x,u=u*p+v*x,p===1-o){const P=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=P,c*=P,h*=P,u*=P}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,s,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=s[a],f=s[a+1],d=s[a+2],m=s[a+3];return e[t]=o*m+h*u+l*d-c*f,e[t+1]=l*m+h*f+c*u-o*d,e[t+2]=c*m+h*d+o*f-l*u,e[t+3]=h*m-o*u-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(s/2),f=l(n/2),d=l(i/2),m=l(s/2);switch(a){case"XYZ":this._x=f*h*u+c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u-f*d*m;break;case"YXZ":this._x=f*h*u+c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u+f*d*m;break;case"ZXY":this._x=f*h*u-c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u-f*d*m;break;case"ZYX":this._x=f*h*u-c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u+f*d*m;break;case"YZX":this._x=f*h*u+c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u-f*d*m;break;case"XZY":this._x=f*h*u-c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u+f*d*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+o+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(s-c)*d,this._z=(a-i)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(i+a)/d,this._z=(s+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(s-c)/d,this._x=(i+a)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(a-i)/d,this._x=(s+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Et(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-s*l,this._y=i*h+a*l+s*o-n*c,this._z=s*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,s=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-t;return this._w=d*a+t*this._w,this._x=d*n+t*this._x,this._y=d*i+t*this._y,this._z=d*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=i*u+this._y*f,this._z=s*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class T{constructor(e=0,t=0,n=0){T.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ph.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ph.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-s*i),u=2*(s*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-s*u,this.z=i+l*u+s*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-s*o,this.y=s*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return mo.copy(this).projectOnVector(e),this.sub(mo)}reflect(e){return this.sub(mo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const mo=new T,ph=new Lt;class Dn{constructor(e=new T(1/0,1/0,1/0),t=new T(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(yn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(yn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=yn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,yn):yn.fromBufferAttribute(s,a),yn.applyMatrix4(e.matrixWorld),this.expandByPoint(yn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Wr.copy(n.boundingBox)),Wr.applyMatrix4(e.matrixWorld),this.union(Wr)}const i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,yn),yn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Zs),Xr.subVectors(this.max,Zs),cs.subVectors(e.a,Zs),hs.subVectors(e.b,Zs),us.subVectors(e.c,Zs),gi.subVectors(hs,cs),vi.subVectors(us,hs),Ui.subVectors(cs,us);let t=[0,-gi.z,gi.y,0,-vi.z,vi.y,0,-Ui.z,Ui.y,gi.z,0,-gi.x,vi.z,0,-vi.x,Ui.z,0,-Ui.x,-gi.y,gi.x,0,-vi.y,vi.x,0,-Ui.y,Ui.x,0];return!go(t,cs,hs,us,Xr)||(t=[1,0,0,0,1,0,0,0,1],!go(t,cs,hs,us,Xr))?!1:(qr.crossVectors(gi,vi),t=[qr.x,qr.y,qr.z],go(t,cs,hs,us,Xr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,yn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(yn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Yn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Yn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Yn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Yn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Yn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Yn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Yn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Yn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Yn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Yn=[new T,new T,new T,new T,new T,new T,new T,new T],yn=new T,Wr=new Dn,cs=new T,hs=new T,us=new T,gi=new T,vi=new T,Ui=new T,Zs=new T,Xr=new T,qr=new T,Fi=new T;function go(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){Fi.fromArray(r,s);const o=i.x*Math.abs(Fi.x)+i.y*Math.abs(Fi.y)+i.z*Math.abs(Fi.z),l=e.dot(Fi),c=t.dot(Fi),h=n.dot(Fi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const om=new Dn,Js=new T,vo=new T;class Vn{constructor(e=new T,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):om.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Js.subVectors(e,this.center);const t=Js.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Js,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(vo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Js.copy(e.center).add(vo)),this.expandByPoint(Js.copy(e.center).sub(vo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Kn=new T,_o=new T,jr=new T,_i=new T,xo=new T,$r=new T,yo=new T;class to{constructor(e=new T,t=new T(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Kn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Kn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Kn.copy(this.origin).addScaledVector(this.direction,t),Kn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){_o.copy(e).add(t).multiplyScalar(.5),jr.copy(t).sub(e).normalize(),_i.copy(this.origin).sub(_o);const s=e.distanceTo(t)*.5,a=-this.direction.dot(jr),o=_i.dot(this.direction),l=-_i.dot(jr),c=_i.lengthSq(),h=Math.abs(1-a*a);let u,f,d,m;if(h>0)if(u=a*l-o,f=a*o-l,m=s*h,u>=0)if(f>=-m)if(f<=m){const v=1/h;u*=v,f*=v,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-m?(u=Math.max(0,-(-a*s+o)),f=u>0?-s:Math.min(Math.max(-s,-l),s),d=-u*u+f*(f+2*l)+c):f<=m?(u=0,f=Math.min(Math.max(-s,-l),s),d=f*(f+2*l)+c):(u=Math.max(0,-(a*s+o)),f=u>0?s:Math.min(Math.max(-s,-l),s),d=-u*u+f*(f+2*l)+c);else f=a>0?-s:s,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(_o).addScaledVector(jr,f),d}intersectSphere(e,t){Kn.subVectors(e.center,this.origin);const n=Kn.dot(this.direction),i=Kn.dot(Kn)-n*n,s=e.radius*e.radius;if(i>s)return null;const a=Math.sqrt(s-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,i=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,i=(e.min.x-f.x)*c),h>=0?(s=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(s=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Kn)!==null}intersectTriangle(e,t,n,i,s){xo.subVectors(t,e),$r.subVectors(n,e),yo.crossVectors(xo,$r);let a=this.direction.dot(yo),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;_i.subVectors(this.origin,e);const l=o*this.direction.dot($r.crossVectors(_i,$r));if(l<0)return null;const c=o*this.direction.dot(xo.cross(_i));if(c<0||l+c>a)return null;const h=-o*_i.dot(yo);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Pe{constructor(e,t,n,i,s,a,o,l,c,h,u,f,d,m,v,p){Pe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c,h,u,f,d,m,v,p)}set(e,t,n,i,s,a,o,l,c,h,u,f,d,m,v,p){const g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=i,g[1]=s,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=u,g[14]=f,g[3]=d,g[7]=m,g[11]=v,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Pe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/fs.setFromMatrixColumn(e,0).length(),s=1/fs.setFromMatrixColumn(e,1).length(),a=1/fs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const f=a*h,d=a*u,m=o*h,v=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=d+m*c,t[5]=f-v*c,t[9]=-o*l,t[2]=v-f*c,t[6]=m+d*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*h,d=l*u,m=c*h,v=c*u;t[0]=f+v*o,t[4]=m*o-d,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=d*o-m,t[6]=v+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*h,d=l*u,m=c*h,v=c*u;t[0]=f-v*o,t[4]=-a*u,t[8]=m+d*o,t[1]=d+m*o,t[5]=a*h,t[9]=v-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*h,d=a*u,m=o*h,v=o*u;t[0]=l*h,t[4]=m*c-d,t[8]=f*c+v,t[1]=l*u,t[5]=v*c+f,t[9]=d*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,d=a*c,m=o*l,v=o*c;t[0]=l*h,t[4]=v-f*u,t[8]=m*u+d,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=d*u+m,t[10]=f-v*u}else if(e.order==="XZY"){const f=a*l,d=a*c,m=o*l,v=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+v,t[5]=a*h,t[9]=d*u-m,t[2]=m*u-d,t[6]=o*h,t[10]=v*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(lm,e,cm)}lookAt(e,t,n){const i=this.elements;return rn.subVectors(e,t),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),xi.crossVectors(n,rn),xi.lengthSq()===0&&(Math.abs(n.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),xi.crossVectors(n,rn)),xi.normalize(),Yr.crossVectors(rn,xi),i[0]=xi.x,i[4]=Yr.x,i[8]=rn.x,i[1]=xi.y,i[5]=Yr.y,i[9]=rn.y,i[2]=xi.z,i[6]=Yr.z,i[10]=rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],m=n[2],v=n[6],p=n[10],g=n[14],_=n[3],y=n[7],x=n[11],P=n[15],R=i[0],A=i[4],C=i[8],M=i[12],w=i[1],S=i[5],I=i[9],L=i[13],O=i[2],G=i[6],B=i[10],$=i[14],V=i[3],H=i[7],K=i[11],Q=i[15];return s[0]=a*R+o*w+l*O+c*V,s[4]=a*A+o*S+l*G+c*H,s[8]=a*C+o*I+l*B+c*K,s[12]=a*M+o*L+l*$+c*Q,s[1]=h*R+u*w+f*O+d*V,s[5]=h*A+u*S+f*G+d*H,s[9]=h*C+u*I+f*B+d*K,s[13]=h*M+u*L+f*$+d*Q,s[2]=m*R+v*w+p*O+g*V,s[6]=m*A+v*S+p*G+g*H,s[10]=m*C+v*I+p*B+g*K,s[14]=m*M+v*L+p*$+g*Q,s[3]=_*R+y*w+x*O+P*V,s[7]=_*A+y*S+x*G+P*H,s[11]=_*C+y*I+x*B+P*K,s[15]=_*M+y*L+x*$+P*Q,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],d=e[14],m=e[3],v=e[7],p=e[11],g=e[15];return m*(+s*l*u-i*c*u-s*o*f+n*c*f+i*o*d-n*l*d)+v*(+t*l*d-t*c*f+s*a*f-i*a*d+i*c*h-s*l*h)+p*(+t*c*u-t*o*d-s*a*u+n*a*d+s*o*h-n*c*h)+g*(-i*o*h-t*l*u+t*o*f+i*a*u-n*a*f+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],d=e[11],m=e[12],v=e[13],p=e[14],g=e[15],_=u*p*c-v*f*c+v*l*d-o*p*d-u*l*g+o*f*g,y=m*f*c-h*p*c-m*l*d+a*p*d+h*l*g-a*f*g,x=h*v*c-m*u*c+m*o*d-a*v*d-h*o*g+a*u*g,P=m*u*l-h*v*l-m*o*f+a*v*f+h*o*p-a*u*p,R=t*_+n*y+i*x+s*P;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/R;return e[0]=_*A,e[1]=(v*f*s-u*p*s-v*i*d+n*p*d+u*i*g-n*f*g)*A,e[2]=(o*p*s-v*l*s+v*i*c-n*p*c-o*i*g+n*l*g)*A,e[3]=(u*l*s-o*f*s-u*i*c+n*f*c+o*i*d-n*l*d)*A,e[4]=y*A,e[5]=(h*p*s-m*f*s+m*i*d-t*p*d-h*i*g+t*f*g)*A,e[6]=(m*l*s-a*p*s-m*i*c+t*p*c+a*i*g-t*l*g)*A,e[7]=(a*f*s-h*l*s+h*i*c-t*f*c-a*i*d+t*l*d)*A,e[8]=x*A,e[9]=(m*u*s-h*v*s-m*n*d+t*v*d+h*n*g-t*u*g)*A,e[10]=(a*v*s-m*o*s+m*n*c-t*v*c-a*n*g+t*o*g)*A,e[11]=(h*o*s-a*u*s-h*n*c+t*u*c+a*n*d-t*o*d)*A,e[12]=P*A,e[13]=(h*v*i-m*u*i+m*n*f-t*v*f-h*n*p+t*u*p)*A,e[14]=(m*o*i-a*v*i-m*n*l+t*v*l+a*n*p-t*o*p)*A,e[15]=(a*u*i-h*o*i+h*n*l-t*u*l-a*n*f+t*o*f)*A,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,h=s*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,h=a+a,u=o+o,f=s*c,d=s*h,m=s*u,v=a*h,p=a*u,g=o*u,_=l*c,y=l*h,x=l*u,P=n.x,R=n.y,A=n.z;return i[0]=(1-(v+g))*P,i[1]=(d+x)*P,i[2]=(m-y)*P,i[3]=0,i[4]=(d-x)*R,i[5]=(1-(f+g))*R,i[6]=(p+_)*R,i[7]=0,i[8]=(m+y)*A,i[9]=(p-_)*A,i[10]=(1-(f+v))*A,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let s=fs.set(i[0],i[1],i[2]).length();const a=fs.set(i[4],i[5],i[6]).length(),o=fs.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),e.x=i[12],e.y=i[13],e.z=i[14],Mn.copy(this);const c=1/s,h=1/a,u=1/o;return Mn.elements[0]*=c,Mn.elements[1]*=c,Mn.elements[2]*=c,Mn.elements[4]*=h,Mn.elements[5]*=h,Mn.elements[6]*=h,Mn.elements[8]*=u,Mn.elements[9]*=u,Mn.elements[10]*=u,t.setFromRotationMatrix(Mn),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,i,s,a,o=ai){const l=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),f=(n+i)/(n-i);let d,m;if(o===ai)d=-(a+s)/(a-s),m=-2*a*s/(a-s);else if(o===Xa)d=-a/(a-s),m=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=ai){const l=this.elements,c=1/(t-e),h=1/(n-i),u=1/(a-s),f=(t+e)*c,d=(n+i)*h;let m,v;if(o===ai)m=(a+s)*u,v=-2*u;else if(o===Xa)m=s*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=v,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const fs=new T,Mn=new Pe,lm=new T(0,0,0),cm=new T(1,1,1),xi=new T,Yr=new T,rn=new T,mh=new Pe,gh=new Lt;class Hn{constructor(e=0,t=0,n=0,i=Hn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],f=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(Et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Et(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Et(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Et(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Et(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Et(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return mh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(mh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return gh.setFromEuler(this),this.setFromQuaternion(gh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Hn.DEFAULT_ORDER="XYZ";class Cf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let hm=0;const vh=new T,ds=new Lt,Zn=new Pe,Kr=new T,Qs=new T,um=new T,fm=new Lt,_h=new T(1,0,0),xh=new T(0,1,0),yh=new T(0,0,1),Mh={type:"added"},dm={type:"removed"},ps={type:"childadded",child:null},Mo={type:"childremoved",child:null};class ct extends ts{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:hm++}),this.uuid=Cn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ct.DEFAULT_UP.clone();const e=new T,t=new Hn,n=new Lt,i=new T(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Pe},normalMatrix:{value:new Ve}}),this.matrix=new Pe,this.matrixWorld=new Pe,this.matrixAutoUpdate=ct.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Cf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ds.setFromAxisAngle(e,t),this.quaternion.multiply(ds),this}rotateOnWorldAxis(e,t){return ds.setFromAxisAngle(e,t),this.quaternion.premultiply(ds),this}rotateX(e){return this.rotateOnAxis(_h,e)}rotateY(e){return this.rotateOnAxis(xh,e)}rotateZ(e){return this.rotateOnAxis(yh,e)}translateOnAxis(e,t){return vh.copy(e).applyQuaternion(this.quaternion),this.position.add(vh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(_h,e)}translateY(e){return this.translateOnAxis(xh,e)}translateZ(e){return this.translateOnAxis(yh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Zn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Kr.copy(e):Kr.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Qs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zn.lookAt(Qs,Kr,this.up):Zn.lookAt(Kr,Qs,this.up),this.quaternion.setFromRotationMatrix(Zn),i&&(Zn.extractRotation(i.matrixWorld),ds.setFromRotationMatrix(Zn),this.quaternion.premultiply(ds.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Mh),ps.child=e,this.dispatchEvent(ps),ps.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(dm),Mo.child=e,this.dispatchEvent(Mo),Mo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Zn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Zn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Zn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Mh),ps.child=e,this.dispatchEvent(ps),ps.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qs,e,um),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qs,fm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),f=a(e.skeletons),d=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),m.length>0&&(n.nodes=m)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}ct.DEFAULT_UP=new T(0,1,0);ct.DEFAULT_MATRIX_AUTO_UPDATE=!0;ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const wn=new T,Jn=new T,wo=new T,Qn=new T,ms=new T,gs=new T,wh=new T,bo=new T,So=new T,To=new T,Eo=new Qe,Ao=new Qe,Ro=new Qe;class mn{constructor(e=new T,t=new T,n=new T){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),wn.subVectors(e,t),i.cross(wn);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){wn.subVectors(i,t),Jn.subVectors(n,t),wo.subVectors(e,t);const a=wn.dot(wn),o=wn.dot(Jn),l=wn.dot(wo),c=Jn.dot(Jn),h=Jn.dot(wo),u=a*c-o*o;if(u===0)return s.set(0,0,0),null;const f=1/u,d=(c*l-o*h)*f,m=(a*h-o*l)*f;return s.set(1-d-m,m,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Qn)===null?!1:Qn.x>=0&&Qn.y>=0&&Qn.x+Qn.y<=1}static getInterpolation(e,t,n,i,s,a,o,l){return this.getBarycoord(e,t,n,i,Qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Qn.x),l.addScaledVector(a,Qn.y),l.addScaledVector(o,Qn.z),l)}static getInterpolatedAttribute(e,t,n,i,s,a){return Eo.setScalar(0),Ao.setScalar(0),Ro.setScalar(0),Eo.fromBufferAttribute(e,t),Ao.fromBufferAttribute(e,n),Ro.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(Eo,s.x),a.addScaledVector(Ao,s.y),a.addScaledVector(Ro,s.z),a}static isFrontFacing(e,t,n,i){return wn.subVectors(n,t),Jn.subVectors(e,t),wn.cross(Jn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return wn.subVectors(this.c,this.b),Jn.subVectors(this.a,this.b),wn.cross(Jn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return mn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return mn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return mn.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return mn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return mn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let a,o;ms.subVectors(i,n),gs.subVectors(s,n),bo.subVectors(e,n);const l=ms.dot(bo),c=gs.dot(bo);if(l<=0&&c<=0)return t.copy(n);So.subVectors(e,i);const h=ms.dot(So),u=gs.dot(So);if(h>=0&&u<=h)return t.copy(i);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(ms,a);To.subVectors(e,s);const d=ms.dot(To),m=gs.dot(To);if(m>=0&&d<=m)return t.copy(s);const v=d*c-l*m;if(v<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(n).addScaledVector(gs,o);const p=h*m-d*u;if(p<=0&&u-h>=0&&d-m>=0)return wh.subVectors(s,i),o=(u-h)/(u-h+(d-m)),t.copy(i).addScaledVector(wh,o);const g=1/(p+v+f);return a=v*g,o=f*g,t.copy(n).addScaledVector(ms,a).addScaledVector(gs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Pf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},yi={h:0,s:0,l:0},Zr={h:0,s:0,l:0};function Co(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class ue{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ut){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,qe.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,qe.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=qe.workingColorSpace){if(e=xc(e,1),t=Et(t,0,1),n=Et(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=Co(a,s,e+1/3),this.g=Co(a,s,e),this.b=Co(a,s,e-1/3)}return qe.toWorkingColorSpace(this,i),this}setStyle(e,t=ut){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ut){const n=Pf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=li(e.r),this.g=li(e.g),this.b=li(e.b),this}copyLinearToSRGB(e){return this.r=Ls(e.r),this.g=Ls(e.g),this.b=Ls(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ut){return qe.fromWorkingColorSpace(Ht.copy(this),e),Math.round(Et(Ht.r*255,0,255))*65536+Math.round(Et(Ht.g*255,0,255))*256+Math.round(Et(Ht.b*255,0,255))}getHexString(e=ut){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qe.workingColorSpace){qe.fromWorkingColorSpace(Ht.copy(this),t);const n=Ht.r,i=Ht.g,s=Ht.b,a=Math.max(n,i,s),o=Math.min(n,i,s);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-s)/u+(i<s?6:0);break;case i:l=(s-n)/u+2;break;case s:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=qe.workingColorSpace){return qe.fromWorkingColorSpace(Ht.copy(this),t),e.r=Ht.r,e.g=Ht.g,e.b=Ht.b,e}getStyle(e=ut){qe.fromWorkingColorSpace(Ht.copy(this),e);const t=Ht.r,n=Ht.g,i=Ht.b;return e!==ut?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(yi),this.setHSL(yi.h+e,yi.s+t,yi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(yi),e.getHSL(Zr);const n=Mr(yi.h,Zr.h,t),i=Mr(yi.s,Zr.s,t),s=Mr(yi.l,Zr.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ht=new ue;ue.NAMES=Pf;let pm=0;class gn extends ts{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:pm++}),this.uuid=Cn(),this.name="",this.blending=Ki,this.side=ci,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ll,this.blendDst=cl,this.blendEquation=bn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ue(0,0,0),this.blendAlpha=0,this.depthFunc=Us,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=rh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=os,this.stencilZFail=os,this.stencilZPass=os,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ki&&(n.blending=this.blending),this.side!==ci&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ll&&(n.blendSrc=this.blendSrc),this.blendDst!==cl&&(n.blendDst=this.blendDst),this.blendEquation!==bn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Us&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==rh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==os&&(n.stencilFail=this.stencilFail),this.stencilZFail!==os&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==os&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class lt extends gn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.combine=rf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ri=mm();function mm(){const r=new ArrayBuffer(4),e=new Float32Array(r),t=new Uint32Array(r),n=new Uint32Array(512),i=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(n[l]=0,n[l|256]=32768,i[l]=24,i[l|256]=24):c<-14?(n[l]=1024>>-c-14,n[l|256]=1024>>-c-14|32768,i[l]=-c-1,i[l|256]=-c-1):c<=15?(n[l]=c+15<<10,n[l|256]=c+15<<10|32768,i[l]=13,i[l|256]=13):c<128?(n[l]=31744,n[l|256]=64512,i[l]=24,i[l|256]=24):(n[l]=31744,n[l|256]=64512,i[l]=13,i[l|256]=13)}const s=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;!(c&8388608);)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)a[l]=l<<23;a[31]=1199570944,a[32]=2147483648;for(let l=33;l<63;++l)a[l]=2147483648+(l-32<<23);a[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(o[l]=1024);return{floatView:e,uint32View:t,baseTable:n,shiftTable:i,mantissaTable:s,exponentTable:a,offsetTable:o}}function gm(r){Math.abs(r)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),r=Et(r,-65504,65504),ri.floatView[0]=r;const e=ri.uint32View[0],t=e>>23&511;return ri.baseTable[t]+((e&8388607)>>ri.shiftTable[t])}function vm(r){const e=r>>10;return ri.uint32View[0]=ri.mantissaTable[ri.offsetTable[e]+(r&1023)]+ri.exponentTable[e],ri.floatView[0]}const Jr={toHalfFloat:gm,fromHalfFloat:vm},bt=new T,Qr=new ae;class wt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=jl,this.updateRanges=[],this.gpuType=en,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Qr.fromBufferAttribute(this,t),Qr.applyMatrix3(e),this.setXY(t,Qr.x,Qr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix3(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix4(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyNormalMatrix(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.transformDirection(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ot(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Sn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Sn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Sn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Sn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array),i=ot(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array),i=ot(i,this.array),s=ot(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==jl&&(e.usage=this.usage),e}}class Df extends wt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class If extends wt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ye extends wt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let _m=0;const un=new Pe,Po=new ct,vs=new T,an=new Dn,er=new Dn,Pt=new T;class vt extends ts{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_m++}),this.uuid=Cn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ef(e)?If:Df)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ve().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return un.makeRotationFromQuaternion(e),this.applyMatrix4(un),this}rotateX(e){return un.makeRotationX(e),this.applyMatrix4(un),this}rotateY(e){return un.makeRotationY(e),this.applyMatrix4(un),this}rotateZ(e){return un.makeRotationZ(e),this.applyMatrix4(un),this}translate(e,t,n){return un.makeTranslation(e,t,n),this.applyMatrix4(un),this}scale(e,t,n){return un.makeScale(e,t,n),this.applyMatrix4(un),this}lookAt(e){return Po.lookAt(e),Po.updateMatrix(),this.applyMatrix4(Po.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vs).negate(),this.translate(vs.x,vs.y,vs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,s=e.length;i<s;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ye(n,3))}else{for(let n=0,i=t.count;n<i;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Dn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];an.setFromBufferAttribute(s),this.morphTargetsRelative?(Pt.addVectors(this.boundingBox.min,an.min),this.boundingBox.expandByPoint(Pt),Pt.addVectors(this.boundingBox.max,an.max),this.boundingBox.expandByPoint(Pt)):(this.boundingBox.expandByPoint(an.min),this.boundingBox.expandByPoint(an.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new T,1/0);return}if(e){const n=this.boundingSphere.center;if(an.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];er.setFromBufferAttribute(o),this.morphTargetsRelative?(Pt.addVectors(an.min,er.min),an.expandByPoint(Pt),Pt.addVectors(an.max,er.max),an.expandByPoint(Pt)):(an.expandByPoint(er.min),an.expandByPoint(er.max))}an.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)Pt.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(Pt));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Pt.fromBufferAttribute(o,c),l&&(vs.fromBufferAttribute(e,c),Pt.add(vs)),i=Math.max(i,n.distanceToSquared(Pt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new wt(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let C=0;C<n.count;C++)o[C]=new T,l[C]=new T;const c=new T,h=new T,u=new T,f=new ae,d=new ae,m=new ae,v=new T,p=new T;function g(C,M,w){c.fromBufferAttribute(n,C),h.fromBufferAttribute(n,M),u.fromBufferAttribute(n,w),f.fromBufferAttribute(s,C),d.fromBufferAttribute(s,M),m.fromBufferAttribute(s,w),h.sub(c),u.sub(c),d.sub(f),m.sub(f);const S=1/(d.x*m.y-m.x*d.y);isFinite(S)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(u,-d.y).multiplyScalar(S),p.copy(u).multiplyScalar(d.x).addScaledVector(h,-m.x).multiplyScalar(S),o[C].add(v),o[M].add(v),o[w].add(v),l[C].add(p),l[M].add(p),l[w].add(p))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let C=0,M=_.length;C<M;++C){const w=_[C],S=w.start,I=w.count;for(let L=S,O=S+I;L<O;L+=3)g(e.getX(L+0),e.getX(L+1),e.getX(L+2))}const y=new T,x=new T,P=new T,R=new T;function A(C){P.fromBufferAttribute(i,C),R.copy(P);const M=o[C];y.copy(M),y.sub(P.multiplyScalar(P.dot(M))).normalize(),x.crossVectors(R,M);const S=x.dot(l[C])<0?-1:1;a.setXYZW(C,y.x,y.y,y.z,S)}for(let C=0,M=_.length;C<M;++C){const w=_[C],S=w.start,I=w.count;for(let L=S,O=S+I;L<O;L+=3)A(e.getX(L+0)),A(e.getX(L+1)),A(e.getX(L+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new wt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const i=new T,s=new T,a=new T,o=new T,l=new T,c=new T,h=new T,u=new T;if(e)for(let f=0,d=e.count;f<d;f+=3){const m=e.getX(f+0),v=e.getX(f+1),p=e.getX(f+2);i.fromBufferAttribute(t,m),s.fromBufferAttribute(t,v),a.fromBufferAttribute(t,p),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),o.add(h),l.add(h),c.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)i.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,s),u.subVectors(i,s),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Pt.fromBufferAttribute(e,t),Pt.normalize(),e.setXYZ(t,Pt.x,Pt.y,Pt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let d=0,m=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*h;for(let g=0;g<h;g++)f[m++]=c[d++]}return new wt(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new vt,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=e(l,n);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],d=e(f,n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const d=c[u];h.push(d.toJSON(e.data))}h.length>0&&(i[l]=h,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const s=e.morphAttributes;for(const c in s){const h=[],u=s[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const bh=new Pe,Oi=new to,ea=new Vn,Sh=new T,ta=new T,na=new T,ia=new T,Do=new T,sa=new T,Th=new T,ra=new T;class Ie extends ct{constructor(e=new vt,t=new lt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(s&&o){sa.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=o[l],u=s[l];h!==0&&(Do.fromBufferAttribute(u,e),a?sa.addScaledVector(Do,h):sa.addScaledVector(Do.sub(t),h))}t.add(sa)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ea.copy(n.boundingSphere),ea.applyMatrix4(s),Oi.copy(e.ray).recast(e.near),!(ea.containsPoint(Oi.origin)===!1&&(Oi.intersectSphere(ea,Sh)===null||Oi.origin.distanceToSquared(Sh)>(e.far-e.near)**2))&&(bh.copy(s).invert(),Oi.copy(e.ray).applyMatrix4(bh),!(n.boundingBox!==null&&Oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Oi)))}_computeIntersections(e,t,n){let i;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,f=s.groups,d=s.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,v=f.length;m<v;m++){const p=f[m],g=a[p.materialIndex],_=Math.max(p.start,d.start),y=Math.min(o.count,Math.min(p.start+p.count,d.start+d.count));for(let x=_,P=y;x<P;x+=3){const R=o.getX(x),A=o.getX(x+1),C=o.getX(x+2);i=aa(this,g,e,n,c,h,u,R,A,C),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{const m=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let p=m,g=v;p<g;p+=3){const _=o.getX(p),y=o.getX(p+1),x=o.getX(p+2);i=aa(this,a,e,n,c,h,u,_,y,x),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,v=f.length;m<v;m++){const p=f[m],g=a[p.materialIndex],_=Math.max(p.start,d.start),y=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let x=_,P=y;x<P;x+=3){const R=x,A=x+1,C=x+2;i=aa(this,g,e,n,c,h,u,R,A,C),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{const m=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let p=m,g=v;p<g;p+=3){const _=p,y=p+1,x=p+2;i=aa(this,a,e,n,c,h,u,_,y,x),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}}}function xm(r,e,t,n,i,s,a,o){let l;if(e.side===Gt?l=n.intersectTriangle(a,s,i,!0,o):l=n.intersectTriangle(i,s,a,e.side===ci,o),l===null)return null;ra.copy(o),ra.applyMatrix4(r.matrixWorld);const c=t.ray.origin.distanceTo(ra);return c<t.near||c>t.far?null:{distance:c,point:ra.clone(),object:r}}function aa(r,e,t,n,i,s,a,o,l,c){r.getVertexPosition(o,ta),r.getVertexPosition(l,na),r.getVertexPosition(c,ia);const h=xm(r,e,t,n,ta,na,ia,Th);if(h){const u=new T;mn.getBarycoord(Th,ta,na,ia,u),i&&(h.uv=mn.getInterpolatedAttribute(i,o,l,c,u,new ae)),s&&(h.uv1=mn.getInterpolatedAttribute(s,o,l,c,u,new ae)),a&&(h.normal=mn.getInterpolatedAttribute(a,o,l,c,u,new T),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new T,materialIndex:0};mn.getNormal(ta,na,ia,f.normal),h.face=f,h.barycoord=u}return h}class Li extends vt{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};const o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,d=0;m("z","y","x",-1,-1,n,t,e,a,s,0),m("z","y","x",1,-1,n,t,-e,a,s,1),m("x","z","y",1,1,e,n,t,i,a,2),m("x","z","y",1,-1,e,n,-t,i,a,3),m("x","y","z",1,-1,e,t,n,i,s,4),m("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new Ye(c,3)),this.setAttribute("normal",new Ye(h,3)),this.setAttribute("uv",new Ye(u,2));function m(v,p,g,_,y,x,P,R,A,C,M){const w=x/A,S=P/C,I=x/2,L=P/2,O=R/2,G=A+1,B=C+1;let $=0,V=0;const H=new T;for(let K=0;K<B;K++){const Q=K*S-L;for(let se=0;se<G;se++){const we=se*w-I;H[v]=we*_,H[p]=Q*y,H[g]=O,c.push(H.x,H.y,H.z),H[v]=0,H[p]=0,H[g]=R>0?1:-1,h.push(H.x,H.y,H.z),u.push(se/A),u.push(1-K/C),$+=1}}for(let K=0;K<C;K++)for(let Q=0;Q<A;Q++){const se=f+Q+G*K,we=f+Q+G*(K+1),j=f+(Q+1)+G*(K+1),te=f+(Q+1)+G*K;l.push(se,we,te),l.push(we,j,te),V+=6}o.addGroup(d,V,M),d+=V,f+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Li(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function zs(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function jt(r){const e={};for(let t=0;t<r.length;t++){const n=zs(r[t]);for(const i in n)e[i]=n[i]}return e}function ym(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function Lf(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:qe.workingColorSpace}const Tn={clone:zs,merge:jt};var Mm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,wm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class gt extends gn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mm,this.fragmentShader=wm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=zs(e.uniforms),this.uniformsGroups=ym(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class kf extends ct{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Pe,this.projectionMatrix=new Pe,this.projectionMatrixInverse=new Pe,this.coordinateSystem=ai}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Mi=new T,Eh=new ae,Ah=new ae;class $t extends kf{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Bs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(yr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Bs*2*Math.atan(Math.tan(yr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z),Mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z)}getViewSize(e,t){return this.getViewBounds(e,Eh,Ah),t.subVectors(Ah,Eh)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(yr*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const _s=-90,xs=1;class bm extends ct{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new $t(_s,xs,e,t);i.layers=this.layers,this.add(i);const s=new $t(_s,xs,e,t);s.layers=this.layers,this.add(s);const a=new $t(_s,xs,e,t);a.layers=this.layers,this.add(a);const o=new $t(_s,xs,e,t);o.layers=this.layers,this.add(o);const l=new $t(_s,xs,e,t);l.layers=this.layers,this.add(l);const c=new $t(_s,xs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===ai)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Xa)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,f,d),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Nf extends At{constructor(e,t,n,i,s,a,o,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Fs,super(e,t,n,i,s,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Sm extends nn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Nf(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Tt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Li(5,5,5),s=new gt({name:"CubemapFromEquirect",uniforms:zs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Gt,blending:Ft});s.uniforms.tEquirect.value=t;const a=new Ie(i,s),o=t.minFilter;return t.minFilter===Rn&&(t.minFilter=Tt),new bm(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,i){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}}const Io=new T,Tm=new T,Em=new Ve;class Gi{constructor(e=new T(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Io.subVectors(n,t).cross(Tm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Io),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Em.getNormalMatrix(e),i=this.coplanarPoint(Io).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Bi=new Vn,oa=new T;class yc{constructor(e=new Gi,t=new Gi,n=new Gi,i=new Gi,s=new Gi,a=new Gi){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ai){const n=this.planes,i=e.elements,s=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],u=i[6],f=i[7],d=i[8],m=i[9],v=i[10],p=i[11],g=i[12],_=i[13],y=i[14],x=i[15];if(n[0].setComponents(l-s,f-c,p-d,x-g).normalize(),n[1].setComponents(l+s,f+c,p+d,x+g).normalize(),n[2].setComponents(l+a,f+h,p+m,x+_).normalize(),n[3].setComponents(l-a,f-h,p-m,x-_).normalize(),n[4].setComponents(l-o,f-u,p-v,x-y).normalize(),t===ai)n[5].setComponents(l+o,f+u,p+v,x+y).normalize();else if(t===Xa)n[5].setComponents(o,u,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Bi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bi)}intersectsSprite(e){return Bi.center.set(0,0,0),Bi.radius=.7071067811865476,Bi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bi)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(oa.x=i.normal.x>0?e.max.x:e.min.x,oa.y=i.normal.y>0?e.max.y:e.min.y,oa.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(oa)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Uf(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function Am(r){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=r.createBuffer();r.bindBuffer(l,f),r.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=r.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=r.HALF_FLOAT:d=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=r.SHORT;else if(c instanceof Uint32Array)d=r.UNSIGNED_INT;else if(c instanceof Int32Array)d=r.INT;else if(c instanceof Int8Array)d=r.BYTE;else if(c instanceof Uint8Array)d=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(r.bindBuffer(c,o),u.length===0)r.bufferSubData(c,0,h);else{u.sort((d,m)=>d.start-m.start);let f=0;for(let d=1;d<u.length;d++){const m=u[f],v=u[d];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++f,u[f]=v)}u.length=f+1;for(let d=0,m=u.length;d<m;d++){const v=u[d];r.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(r.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:s,update:a}}class En extends vt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=e/o,f=t/l,d=[],m=[],v=[],p=[];for(let g=0;g<h;g++){const _=g*f-a;for(let y=0;y<c;y++){const x=y*u-s;m.push(x,-_,0),v.push(0,0,1),p.push(y/o),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let _=0;_<o;_++){const y=_+c*g,x=_+c*(g+1),P=_+1+c*(g+1),R=_+1+c*g;d.push(y,x,R),d.push(x,P,R)}this.setIndex(d),this.setAttribute("position",new Ye(m,3)),this.setAttribute("normal",new Ye(v,3)),this.setAttribute("uv",new Ye(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new En(e.width,e.height,e.widthSegments,e.heightSegments)}}var Rm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Cm=`#ifdef USE_ALPHAHASH
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
#endif`,Pm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Dm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Im=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Lm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,km=`#ifdef USE_AOMAP
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
#endif`,Nm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Um=`#ifdef USE_BATCHING
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
#endif`,Fm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Om=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Bm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,zm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Hm=`#ifdef USE_IRIDESCENCE
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
#endif`,Vm=`#ifdef USE_BUMPMAP
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
#endif`,Gm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Wm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Xm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,qm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,$m=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ym=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Km=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Zm=`#define PI 3.141592653589793
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
} // validated`,Jm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Qm=`vec3 transformedNormal = objectNormal;
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
#endif`,e0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,t0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,n0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,i0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,s0="gl_FragColor = linearToOutputTexel( gl_FragColor );",r0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,a0=`#ifdef USE_ENVMAP
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
#endif`,o0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,l0=`#ifdef USE_ENVMAP
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
#endif`,c0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,h0=`#ifdef USE_ENVMAP
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
#endif`,u0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,f0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,d0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,p0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,m0=`#ifdef USE_GRADIENTMAP
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
}`,g0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,v0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,_0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,x0=`uniform bool receiveShadow;
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
#endif`,y0=`#ifdef USE_ENVMAP
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
#endif`,M0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,w0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,b0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,S0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,T0=`PhysicalMaterial material;
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
#endif`,E0=`struct PhysicalMaterial {
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
}`,A0=`
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
#endif`,R0=`#if defined( RE_IndirectDiffuse )
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
#endif`,C0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,P0=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,D0=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,I0=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,L0=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,k0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,N0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,U0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,F0=`#if defined( USE_POINTS_UV )
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
#endif`,O0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,B0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,z0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,H0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,V0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,G0=`#ifdef USE_MORPHTARGETS
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
#endif`,W0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,X0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,q0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,j0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,$0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Y0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,K0=`#ifdef USE_NORMALMAP
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
#endif`,Z0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,J0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Q0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,eg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,tg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ng=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,ig=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,sg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,rg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ag=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,og=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,lg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,cg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,hg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ug=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,fg=`float getShadowMask() {
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
}`,dg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,pg=`#ifdef USE_SKINNING
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
#endif`,mg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,gg=`#ifdef USE_SKINNING
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
#endif`,vg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,_g=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,xg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,yg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Mg=`#ifdef USE_TRANSMISSION
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
#endif`,wg=`#ifdef USE_TRANSMISSION
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
#endif`,bg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Sg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Tg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Eg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Ag=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Rg=`uniform sampler2D t2D;
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
}`,Cg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Pg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Dg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ig=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lg=`#include <common>
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
}`,kg=`#if DEPTH_PACKING == 3200
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
}`,Ng=`#define DISTANCE
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
}`,Ug=`#define DISTANCE
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
}`,Fg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Og=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bg=`uniform float scale;
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
}`,zg=`uniform vec3 diffuse;
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
}`,Hg=`#include <common>
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
}`,Vg=`uniform vec3 diffuse;
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
}`,Gg=`#define LAMBERT
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
}`,Wg=`#define LAMBERT
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
}`,Xg=`#define MATCAP
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
}`,qg=`#define MATCAP
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
}`,jg=`#define NORMAL
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
}`,$g=`#define NORMAL
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
}`,Yg=`#define PHONG
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
}`,Kg=`#define PHONG
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
}`,Zg=`#define STANDARD
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
}`,Jg=`#define STANDARD
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
}`,Qg=`#define TOON
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
}`,ev=`#define TOON
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
}`,tv=`uniform float size;
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
}`,nv=`uniform vec3 diffuse;
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
}`,iv=`#include <common>
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
}`,sv=`uniform vec3 color;
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
}`,rv=`uniform float rotation;
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
}`,av=`uniform vec3 diffuse;
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
}`,Fe={alphahash_fragment:Rm,alphahash_pars_fragment:Cm,alphamap_fragment:Pm,alphamap_pars_fragment:Dm,alphatest_fragment:Im,alphatest_pars_fragment:Lm,aomap_fragment:km,aomap_pars_fragment:Nm,batching_pars_vertex:Um,batching_vertex:Fm,begin_vertex:Om,beginnormal_vertex:Bm,bsdfs:zm,iridescence_fragment:Hm,bumpmap_pars_fragment:Vm,clipping_planes_fragment:Gm,clipping_planes_pars_fragment:Wm,clipping_planes_pars_vertex:Xm,clipping_planes_vertex:qm,color_fragment:jm,color_pars_fragment:$m,color_pars_vertex:Ym,color_vertex:Km,common:Zm,cube_uv_reflection_fragment:Jm,defaultnormal_vertex:Qm,displacementmap_pars_vertex:e0,displacementmap_vertex:t0,emissivemap_fragment:n0,emissivemap_pars_fragment:i0,colorspace_fragment:s0,colorspace_pars_fragment:r0,envmap_fragment:a0,envmap_common_pars_fragment:o0,envmap_pars_fragment:l0,envmap_pars_vertex:c0,envmap_physical_pars_fragment:y0,envmap_vertex:h0,fog_vertex:u0,fog_pars_vertex:f0,fog_fragment:d0,fog_pars_fragment:p0,gradientmap_pars_fragment:m0,lightmap_pars_fragment:g0,lights_lambert_fragment:v0,lights_lambert_pars_fragment:_0,lights_pars_begin:x0,lights_toon_fragment:M0,lights_toon_pars_fragment:w0,lights_phong_fragment:b0,lights_phong_pars_fragment:S0,lights_physical_fragment:T0,lights_physical_pars_fragment:E0,lights_fragment_begin:A0,lights_fragment_maps:R0,lights_fragment_end:C0,logdepthbuf_fragment:P0,logdepthbuf_pars_fragment:D0,logdepthbuf_pars_vertex:I0,logdepthbuf_vertex:L0,map_fragment:k0,map_pars_fragment:N0,map_particle_fragment:U0,map_particle_pars_fragment:F0,metalnessmap_fragment:O0,metalnessmap_pars_fragment:B0,morphinstance_vertex:z0,morphcolor_vertex:H0,morphnormal_vertex:V0,morphtarget_pars_vertex:G0,morphtarget_vertex:W0,normal_fragment_begin:X0,normal_fragment_maps:q0,normal_pars_fragment:j0,normal_pars_vertex:$0,normal_vertex:Y0,normalmap_pars_fragment:K0,clearcoat_normal_fragment_begin:Z0,clearcoat_normal_fragment_maps:J0,clearcoat_pars_fragment:Q0,iridescence_pars_fragment:eg,opaque_fragment:tg,packing:ng,premultiplied_alpha_fragment:ig,project_vertex:sg,dithering_fragment:rg,dithering_pars_fragment:ag,roughnessmap_fragment:og,roughnessmap_pars_fragment:lg,shadowmap_pars_fragment:cg,shadowmap_pars_vertex:hg,shadowmap_vertex:ug,shadowmask_pars_fragment:fg,skinbase_vertex:dg,skinning_pars_vertex:pg,skinning_vertex:mg,skinnormal_vertex:gg,specularmap_fragment:vg,specularmap_pars_fragment:_g,tonemapping_fragment:xg,tonemapping_pars_fragment:yg,transmission_fragment:Mg,transmission_pars_fragment:wg,uv_pars_fragment:bg,uv_pars_vertex:Sg,uv_vertex:Tg,worldpos_vertex:Eg,background_vert:Ag,background_frag:Rg,backgroundCube_vert:Cg,backgroundCube_frag:Pg,cube_vert:Dg,cube_frag:Ig,depth_vert:Lg,depth_frag:kg,distanceRGBA_vert:Ng,distanceRGBA_frag:Ug,equirect_vert:Fg,equirect_frag:Og,linedashed_vert:Bg,linedashed_frag:zg,meshbasic_vert:Hg,meshbasic_frag:Vg,meshlambert_vert:Gg,meshlambert_frag:Wg,meshmatcap_vert:Xg,meshmatcap_frag:qg,meshnormal_vert:jg,meshnormal_frag:$g,meshphong_vert:Yg,meshphong_frag:Kg,meshphysical_vert:Zg,meshphysical_frag:Jg,meshtoon_vert:Qg,meshtoon_frag:ev,points_vert:tv,points_frag:nv,shadow_vert:iv,shadow_frag:sv,sprite_vert:rv,sprite_frag:av},he={common:{diffuse:{value:new ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},envMapRotation:{value:new Ve},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new ae(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new ue(16777215)},opacity:{value:1},center:{value:new ae(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},Un={basic:{uniforms:jt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.fog]),vertexShader:Fe.meshbasic_vert,fragmentShader:Fe.meshbasic_frag},lambert:{uniforms:jt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new ue(0)}}]),vertexShader:Fe.meshlambert_vert,fragmentShader:Fe.meshlambert_frag},phong:{uniforms:jt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new ue(0)},specular:{value:new ue(1118481)},shininess:{value:30}}]),vertexShader:Fe.meshphong_vert,fragmentShader:Fe.meshphong_frag},standard:{uniforms:jt([he.common,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.roughnessmap,he.metalnessmap,he.fog,he.lights,{emissive:{value:new ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag},toon:{uniforms:jt([he.common,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.gradientmap,he.fog,he.lights,{emissive:{value:new ue(0)}}]),vertexShader:Fe.meshtoon_vert,fragmentShader:Fe.meshtoon_frag},matcap:{uniforms:jt([he.common,he.bumpmap,he.normalmap,he.displacementmap,he.fog,{matcap:{value:null}}]),vertexShader:Fe.meshmatcap_vert,fragmentShader:Fe.meshmatcap_frag},points:{uniforms:jt([he.points,he.fog]),vertexShader:Fe.points_vert,fragmentShader:Fe.points_frag},dashed:{uniforms:jt([he.common,he.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Fe.linedashed_vert,fragmentShader:Fe.linedashed_frag},depth:{uniforms:jt([he.common,he.displacementmap]),vertexShader:Fe.depth_vert,fragmentShader:Fe.depth_frag},normal:{uniforms:jt([he.common,he.bumpmap,he.normalmap,he.displacementmap,{opacity:{value:1}}]),vertexShader:Fe.meshnormal_vert,fragmentShader:Fe.meshnormal_frag},sprite:{uniforms:jt([he.sprite,he.fog]),vertexShader:Fe.sprite_vert,fragmentShader:Fe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Fe.background_vert,fragmentShader:Fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ve}},vertexShader:Fe.backgroundCube_vert,fragmentShader:Fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Fe.cube_vert,fragmentShader:Fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Fe.equirect_vert,fragmentShader:Fe.equirect_frag},distanceRGBA:{uniforms:jt([he.common,he.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Fe.distanceRGBA_vert,fragmentShader:Fe.distanceRGBA_frag},shadow:{uniforms:jt([he.lights,he.fog,{color:{value:new ue(0)},opacity:{value:1}}]),vertexShader:Fe.shadow_vert,fragmentShader:Fe.shadow_frag}};Un.physical={uniforms:jt([Un.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new ae(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new ae},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new ue(0)},specularColor:{value:new ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new ae},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag};const la={r:0,b:0,g:0},zi=new Hn,ov=new Pe;function lv(r,e,t,n,i,s,a){const o=new ue(0);let l=s===!0?0:1,c,h,u=null,f=0,d=null;function m(_){let y=_.isScene===!0?_.background:null;return y&&y.isTexture&&(y=(_.backgroundBlurriness>0?t:e).get(y)),y}function v(_){let y=!1;const x=m(_);x===null?g(o,l):x&&x.isColor&&(g(x,1),y=!0);const P=r.xr.getEnvironmentBlendMode();P==="additive"?n.buffers.color.setClear(0,0,0,1,a):P==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(r.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function p(_,y){const x=m(y);x&&(x.isCubeTexture||x.mapping===Qa)?(h===void 0&&(h=new Ie(new Li(1,1,1),new gt({name:"BackgroundCubeMaterial",uniforms:zs(Un.backgroundCube.uniforms),vertexShader:Un.backgroundCube.vertexShader,fragmentShader:Un.backgroundCube.fragmentShader,side:Gt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(P,R,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),zi.copy(y.backgroundRotation),zi.x*=-1,zi.y*=-1,zi.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(zi.y*=-1,zi.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(ov.makeRotationFromEuler(zi)),h.material.toneMapped=qe.getTransfer(x.colorSpace)!==at,(u!==x||f!==x.version||d!==r.toneMapping)&&(h.material.needsUpdate=!0,u=x,f=x.version,d=r.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new Ie(new En(2,2),new gt({name:"BackgroundMaterial",uniforms:zs(Un.background.uniforms),vertexShader:Un.background.vertexShader,fragmentShader:Un.background.fragmentShader,side:ci,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=qe.getTransfer(x.colorSpace)!==at,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||f!==x.version||d!==r.toneMapping)&&(c.material.needsUpdate=!0,u=x,f=x.version,d=r.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function g(_,y){_.getRGB(la,Lf(r)),n.buffers.color.setClear(la.r,la.g,la.b,y,a)}return{getClearColor:function(){return o},setClearColor:function(_,y=1){o.set(_),l=y,g(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,g(o,l)},render:v,addToRenderList:p}}function cv(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=f(null);let s=i,a=!1;function o(w,S,I,L,O){let G=!1;const B=u(L,I,S);s!==B&&(s=B,c(s.object)),G=d(w,L,I,O),G&&m(w,L,I,O),O!==null&&e.update(O,r.ELEMENT_ARRAY_BUFFER),(G||a)&&(a=!1,x(w,S,I,L),O!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return r.createVertexArray()}function c(w){return r.bindVertexArray(w)}function h(w){return r.deleteVertexArray(w)}function u(w,S,I){const L=I.wireframe===!0;let O=n[w.id];O===void 0&&(O={},n[w.id]=O);let G=O[S.id];G===void 0&&(G={},O[S.id]=G);let B=G[L];return B===void 0&&(B=f(l()),G[L]=B),B}function f(w){const S=[],I=[],L=[];for(let O=0;O<t;O++)S[O]=0,I[O]=0,L[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:S,enabledAttributes:I,attributeDivisors:L,object:w,attributes:{},index:null}}function d(w,S,I,L){const O=s.attributes,G=S.attributes;let B=0;const $=I.getAttributes();for(const V in $)if($[V].location>=0){const K=O[V];let Q=G[V];if(Q===void 0&&(V==="instanceMatrix"&&w.instanceMatrix&&(Q=w.instanceMatrix),V==="instanceColor"&&w.instanceColor&&(Q=w.instanceColor)),K===void 0||K.attribute!==Q||Q&&K.data!==Q.data)return!0;B++}return s.attributesNum!==B||s.index!==L}function m(w,S,I,L){const O={},G=S.attributes;let B=0;const $=I.getAttributes();for(const V in $)if($[V].location>=0){let K=G[V];K===void 0&&(V==="instanceMatrix"&&w.instanceMatrix&&(K=w.instanceMatrix),V==="instanceColor"&&w.instanceColor&&(K=w.instanceColor));const Q={};Q.attribute=K,K&&K.data&&(Q.data=K.data),O[V]=Q,B++}s.attributes=O,s.attributesNum=B,s.index=L}function v(){const w=s.newAttributes;for(let S=0,I=w.length;S<I;S++)w[S]=0}function p(w){g(w,0)}function g(w,S){const I=s.newAttributes,L=s.enabledAttributes,O=s.attributeDivisors;I[w]=1,L[w]===0&&(r.enableVertexAttribArray(w),L[w]=1),O[w]!==S&&(r.vertexAttribDivisor(w,S),O[w]=S)}function _(){const w=s.newAttributes,S=s.enabledAttributes;for(let I=0,L=S.length;I<L;I++)S[I]!==w[I]&&(r.disableVertexAttribArray(I),S[I]=0)}function y(w,S,I,L,O,G,B){B===!0?r.vertexAttribIPointer(w,S,I,O,G):r.vertexAttribPointer(w,S,I,L,O,G)}function x(w,S,I,L){v();const O=L.attributes,G=I.getAttributes(),B=S.defaultAttributeValues;for(const $ in G){const V=G[$];if(V.location>=0){let H=O[$];if(H===void 0&&($==="instanceMatrix"&&w.instanceMatrix&&(H=w.instanceMatrix),$==="instanceColor"&&w.instanceColor&&(H=w.instanceColor)),H!==void 0){const K=H.normalized,Q=H.itemSize,se=e.get(H);if(se===void 0)continue;const we=se.buffer,j=se.type,te=se.bytesPerElement,le=j===r.INT||j===r.UNSIGNED_INT||H.gpuType===hc;if(H.isInterleavedBufferAttribute){const ie=H.data,fe=ie.stride,de=H.offset;if(ie.isInstancedInterleavedBuffer){for(let _e=0;_e<V.locationSize;_e++)g(V.location+_e,ie.meshPerAttribute);w.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let _e=0;_e<V.locationSize;_e++)p(V.location+_e);r.bindBuffer(r.ARRAY_BUFFER,we);for(let _e=0;_e<V.locationSize;_e++)y(V.location+_e,Q/V.locationSize,j,K,fe*te,(de+Q/V.locationSize*_e)*te,le)}else{if(H.isInstancedBufferAttribute){for(let ie=0;ie<V.locationSize;ie++)g(V.location+ie,H.meshPerAttribute);w.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=H.meshPerAttribute*H.count)}else for(let ie=0;ie<V.locationSize;ie++)p(V.location+ie);r.bindBuffer(r.ARRAY_BUFFER,we);for(let ie=0;ie<V.locationSize;ie++)y(V.location+ie,Q/V.locationSize,j,K,Q*te,Q/V.locationSize*ie*te,le)}}else if(B!==void 0){const K=B[$];if(K!==void 0)switch(K.length){case 2:r.vertexAttrib2fv(V.location,K);break;case 3:r.vertexAttrib3fv(V.location,K);break;case 4:r.vertexAttrib4fv(V.location,K);break;default:r.vertexAttrib1fv(V.location,K)}}}}_()}function P(){C();for(const w in n){const S=n[w];for(const I in S){const L=S[I];for(const O in L)h(L[O].object),delete L[O];delete S[I]}delete n[w]}}function R(w){if(n[w.id]===void 0)return;const S=n[w.id];for(const I in S){const L=S[I];for(const O in L)h(L[O].object),delete L[O];delete S[I]}delete n[w.id]}function A(w){for(const S in n){const I=n[S];if(I[w.id]===void 0)continue;const L=I[w.id];for(const O in L)h(L[O].object),delete L[O];delete I[w.id]}}function C(){M(),a=!0,s!==i&&(s=i,c(s.object))}function M(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:C,resetDefaultState:M,dispose:P,releaseStatesOfGeometry:R,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:p,disableUnusedAttributes:_}}function hv(r,e,t){let n;function i(c){n=c}function s(c,h){r.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(r.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let m=0;m<u;m++)d+=h[m];t.update(d,n,1)}function l(c,h,u,f){if(u===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let m=0;m<c.length;m++)a(c[m],h[m],f[m]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let m=0;for(let v=0;v<u;v++)m+=h[v]*f[v];t.update(m,n,1)}}this.setMode=i,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function uv(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(A){return!(A!==Yt&&n.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const C=A===Vt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==zn&&n.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==en&&!C)}function l(A){if(A==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),d=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),m=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=r.getParameter(r.MAX_TEXTURE_SIZE),p=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),g=r.getParameter(r.MAX_VERTEX_ATTRIBS),_=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),y=r.getParameter(r.MAX_VARYING_VECTORS),x=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),P=m>0,R=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:_,maxVaryings:y,maxFragmentUniforms:x,vertexTextures:P,maxSamples:R}}function fv(r){const e=this;let t=null,n=0,i=!1,s=!1;const a=new Gi,o=new Ve,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||i;return i=f,n=u.length,d},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,d){const m=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,g=r.get(u);if(!i||m===null||m.length===0||s&&!p)s?h(null):c();else{const _=s?0:n,y=_*4;let x=g.clippingState||null;l.value=x,x=h(m,f,y,d);for(let P=0;P!==y;++P)x[P]=t[P];g.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,d,m){const v=u!==null?u.length:0;let p=null;if(v!==0){if(p=l.value,m!==!0||p===null){const g=d+v*4,_=f.matrixWorldInverse;o.getNormalMatrix(_),(p===null||p.length<g)&&(p=new Float32Array(g));for(let y=0,x=d;y!==v;++y,x+=4)a.copy(u[y]).applyMatrix4(_,o),a.normal.toArray(p,x),p[x+3]=a.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,p}}function dv(r){let e=new WeakMap;function t(a,o){return o===Va?a.mapping=Fs:o===xl&&(a.mapping=Os),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Va||o===xl)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Sm(l.height);return c.fromEquirectangularTexture(r,a),e.set(a,c),a.addEventListener("dispose",i),t(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class no extends kf{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Ds=4,Rh=[.125,.215,.35,.446,.526,.582],Xi=20,Lo=new no,Ch=new ue;let ko=null,No=0,Uo=0,Fo=!1;const Wi=(1+Math.sqrt(5))/2,ys=1/Wi,Ph=[new T(-Wi,ys,0),new T(Wi,ys,0),new T(-ys,0,Wi),new T(ys,0,Wi),new T(0,Wi,-ys),new T(0,Wi,ys),new T(-1,1,-1),new T(1,1,-1),new T(-1,1,1),new T(1,1,1)];class $l{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){ko=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Uo=this._renderer.getActiveMipmapLevel(),Fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,i,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Lh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ih(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ko,No,Uo),this._renderer.xr.enabled=Fo,e.scissorTest=!1,ca(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Fs||e.mapping===Os?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ko=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Uo=this._renderer.getActiveMipmapLevel(),Fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:Vt,format:Yt,colorSpace:Wt,depthBuffer:!1},i=Dh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Dh(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=pv(s)),this._blurMaterial=mv(s,e,t)}return i}_compileMaterial(e){const t=new Ie(this._lodPlanes[0],e);this._renderer.compile(t,Lo)}_sceneToCubeUV(e,t,n,i){const o=new $t(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(Ch),h.toneMapping=Ii,h.autoClear=!1;const d=new lt({name:"PMREM.Background",side:Gt,depthWrite:!1,depthTest:!1}),m=new Ie(new Li,d);let v=!1;const p=e.background;p?p.isColor&&(d.color.copy(p),e.background=null,v=!0):(d.color.copy(Ch),v=!0);for(let g=0;g<6;g++){const _=g%3;_===0?(o.up.set(0,l[g],0),o.lookAt(c[g],0,0)):_===1?(o.up.set(0,0,l[g]),o.lookAt(0,c[g],0)):(o.up.set(0,l[g],0),o.lookAt(0,0,c[g]));const y=this._cubeSize;ca(i,_*y,g>2?y:0,y,y),h.setRenderTarget(i),v&&h.render(m,o),h.render(e,o)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=u,e.background=p}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Fs||e.mapping===Os;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Lh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ih());const s=i?this._cubemapMaterial:this._equirectMaterial,a=new Ie(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;ca(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Lo)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Ph[(i-s-1)%Ph.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,i,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Ie(this._lodPlanes[i],c),f=c.uniforms,d=this._sizeLods[n]-1,m=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*Xi-1),v=s/m,p=isFinite(s)?1+Math.floor(h*v):Xi;p>Xi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Xi}`);const g=[];let _=0;for(let A=0;A<Xi;++A){const C=A/v,M=Math.exp(-C*C/2);g.push(M),A===0?_+=M:A<p&&(_+=2*M)}for(let A=0;A<g.length;A++)g[A]=g[A]/_;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=g,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:y}=this;f.dTheta.value=m,f.mipInt.value=y-n;const x=this._sizeLods[i],P=3*x*(i>y-Ds?i-y+Ds:0),R=4*(this._cubeSize-x);ca(t,P,R,3*x,2*x),l.setRenderTarget(t),l.render(u,Lo)}}function pv(r){const e=[],t=[],n=[];let i=r;const s=r-Ds+1+Rh.length;for(let a=0;a<s;a++){const o=Math.pow(2,i);t.push(o);let l=1/o;a>r-Ds?l=Rh[a-r+Ds-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,m=6,v=3,p=2,g=1,_=new Float32Array(v*m*d),y=new Float32Array(p*m*d),x=new Float32Array(g*m*d);for(let R=0;R<d;R++){const A=R%3*2/3-1,C=R>2?0:-1,M=[A,C,0,A+2/3,C,0,A+2/3,C+1,0,A,C,0,A+2/3,C+1,0,A,C+1,0];_.set(M,v*m*R),y.set(f,p*m*R);const w=[R,R,R,R,R,R];x.set(w,g*m*R)}const P=new vt;P.setAttribute("position",new wt(_,v)),P.setAttribute("uv",new wt(y,p)),P.setAttribute("faceIndex",new wt(x,g)),e.push(P),i>Ds&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Dh(r,e,t){const n=new nn(r,e,t);return n.texture.mapping=Qa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ca(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function mv(r,e,t){const n=new Float32Array(Xi),i=new T(0,1,0);return new gt({name:"SphericalGaussianBlur",defines:{n:Xi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Mc(),fragmentShader:`

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
		`,blending:Ft,depthTest:!1,depthWrite:!1})}function Ih(){return new gt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Mc(),fragmentShader:`

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
		`,blending:Ft,depthTest:!1,depthWrite:!1})}function Lh(){return new gt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ft,depthTest:!1,depthWrite:!1})}function Mc(){return`

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
	`}function gv(r){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Va||l===xl,h=l===Fs||l===Os;if(c||h){let u=e.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new $l(r)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&i(d)?(t===null&&(t=new $l(r)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",s),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function vv(r){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&mr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function _v(r,e,t,n){const i={},s=new WeakMap;function a(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const m in f.attributes)e.remove(f.attributes[m]);for(const m in f.morphAttributes){const v=f.morphAttributes[m];for(let p=0,g=v.length;p<g;p++)e.remove(v[p])}f.removeEventListener("dispose",a),delete i[f.id];const d=s.get(f);d&&(e.remove(d),s.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,t.memory.geometries++),f}function l(u){const f=u.attributes;for(const m in f)e.update(f[m],r.ARRAY_BUFFER);const d=u.morphAttributes;for(const m in d){const v=d[m];for(let p=0,g=v.length;p<g;p++)e.update(v[p],r.ARRAY_BUFFER)}}function c(u){const f=[],d=u.index,m=u.attributes.position;let v=0;if(d!==null){const _=d.array;v=d.version;for(let y=0,x=_.length;y<x;y+=3){const P=_[y+0],R=_[y+1],A=_[y+2];f.push(P,R,R,A,A,P)}}else if(m!==void 0){const _=m.array;v=m.version;for(let y=0,x=_.length/3-1;y<x;y+=3){const P=y+0,R=y+1,A=y+2;f.push(P,R,R,A,A,P)}}else return;const p=new(Ef(f)?If:Df)(f,1);p.version=v;const g=s.get(u);g&&e.remove(g),s.set(u,p)}function h(u){const f=s.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return s.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function xv(r,e,t){let n;function i(f){n=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,d){r.drawElements(n,d,s,f*a),t.update(d,n,1)}function c(f,d,m){m!==0&&(r.drawElementsInstanced(n,d,s,f*a,m),t.update(d,n,m))}function h(f,d,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,s,f,0,m);let p=0;for(let g=0;g<m;g++)p+=d[g];t.update(p,n,1)}function u(f,d,m,v){if(m===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<f.length;g++)c(f[g]/a,d[g],v[g]);else{p.multiDrawElementsInstancedWEBGL(n,d,0,s,f,0,v,0,m);let g=0;for(let _=0;_<m;_++)g+=d[_]*v[_];t.update(g,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function yv(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Mv(r,e,t){const n=new WeakMap,i=new Qe;function s(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let w=function(){C.dispose(),n.delete(o),o.removeEventListener("dispose",w)};var d=w;f!==void 0&&f.texture.dispose();const m=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,p=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],_=o.morphAttributes.normal||[],y=o.morphAttributes.color||[];let x=0;m===!0&&(x=1),v===!0&&(x=2),p===!0&&(x=3);let P=o.attributes.position.count*x,R=1;P>e.maxTextureSize&&(R=Math.ceil(P/e.maxTextureSize),P=e.maxTextureSize);const A=new Float32Array(P*R*4*u),C=new Rf(A,P,R,u);C.type=en,C.needsUpdate=!0;const M=x*4;for(let S=0;S<u;S++){const I=g[S],L=_[S],O=y[S],G=P*R*4*S;for(let B=0;B<I.count;B++){const $=B*M;m===!0&&(i.fromBufferAttribute(I,B),A[G+$+0]=i.x,A[G+$+1]=i.y,A[G+$+2]=i.z,A[G+$+3]=0),v===!0&&(i.fromBufferAttribute(L,B),A[G+$+4]=i.x,A[G+$+5]=i.y,A[G+$+6]=i.z,A[G+$+7]=0),p===!0&&(i.fromBufferAttribute(O,B),A[G+$+8]=i.x,A[G+$+9]=i.y,A[G+$+10]=i.z,A[G+$+11]=O.itemSize===4?i.w:1)}}f={count:u,texture:C,size:new ae(P,R)},n.set(o,f),o.addEventListener("dispose",w)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",a.morphTexture,t);else{let m=0;for(let p=0;p<c.length;p++)m+=c[p];const v=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(r,"morphTargetBaseInfluence",v),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(r,"morphTargetsTextureSize",f.size)}return{update:s}}function wv(r,e,t,n){let i=new WeakMap;function s(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(t.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,r.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;i.get(f)!==c&&(f.update(),i.set(f,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:a}}class wc extends At{constructor(e,t,n,i,s,a,o,l,c,h=Is){if(h!==Is&&h!==es)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Is&&(n=Ji),n===void 0&&h===es&&(n=Qi),super(null,i,s,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Ot,this.minFilter=l!==void 0?l:Ot,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Ff=new At,kh=new wc(1,1),Of=new Rf,Bf=new am,zf=new Nf,Nh=[],Uh=[],Fh=new Float32Array(16),Oh=new Float32Array(9),Bh=new Float32Array(4);function qs(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=Nh[i];if(s===void 0&&(s=new Float32Array(i),Nh[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function Rt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Ct(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function io(r,e){let t=Uh[e];t===void 0&&(t=new Int32Array(e),Uh[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function bv(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function Sv(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;r.uniform2fv(this.addr,e),Ct(t,e)}}function Tv(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Rt(t,e))return;r.uniform3fv(this.addr,e),Ct(t,e)}}function Ev(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;r.uniform4fv(this.addr,e),Ct(t,e)}}function Av(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Ct(t,e)}else{if(Rt(t,n))return;Bh.set(n),r.uniformMatrix2fv(this.addr,!1,Bh),Ct(t,n)}}function Rv(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Ct(t,e)}else{if(Rt(t,n))return;Oh.set(n),r.uniformMatrix3fv(this.addr,!1,Oh),Ct(t,n)}}function Cv(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Ct(t,e)}else{if(Rt(t,n))return;Fh.set(n),r.uniformMatrix4fv(this.addr,!1,Fh),Ct(t,n)}}function Pv(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function Dv(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;r.uniform2iv(this.addr,e),Ct(t,e)}}function Iv(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Rt(t,e))return;r.uniform3iv(this.addr,e),Ct(t,e)}}function Lv(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;r.uniform4iv(this.addr,e),Ct(t,e)}}function kv(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function Nv(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;r.uniform2uiv(this.addr,e),Ct(t,e)}}function Uv(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Rt(t,e))return;r.uniform3uiv(this.addr,e),Ct(t,e)}}function Fv(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;r.uniform4uiv(this.addr,e),Ct(t,e)}}function Ov(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(kh.compareFunction=Tf,s=kh):s=Ff,t.setTexture2D(e||s,i)}function Bv(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Bf,i)}function zv(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||zf,i)}function Hv(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Of,i)}function Vv(r){switch(r){case 5126:return bv;case 35664:return Sv;case 35665:return Tv;case 35666:return Ev;case 35674:return Av;case 35675:return Rv;case 35676:return Cv;case 5124:case 35670:return Pv;case 35667:case 35671:return Dv;case 35668:case 35672:return Iv;case 35669:case 35673:return Lv;case 5125:return kv;case 36294:return Nv;case 36295:return Uv;case 36296:return Fv;case 35678:case 36198:case 36298:case 36306:case 35682:return Ov;case 35679:case 36299:case 36307:return Bv;case 35680:case 36300:case 36308:case 36293:return zv;case 36289:case 36303:case 36311:case 36292:return Hv}}function Gv(r,e){r.uniform1fv(this.addr,e)}function Wv(r,e){const t=qs(e,this.size,2);r.uniform2fv(this.addr,t)}function Xv(r,e){const t=qs(e,this.size,3);r.uniform3fv(this.addr,t)}function qv(r,e){const t=qs(e,this.size,4);r.uniform4fv(this.addr,t)}function jv(r,e){const t=qs(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function $v(r,e){const t=qs(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function Yv(r,e){const t=qs(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function Kv(r,e){r.uniform1iv(this.addr,e)}function Zv(r,e){r.uniform2iv(this.addr,e)}function Jv(r,e){r.uniform3iv(this.addr,e)}function Qv(r,e){r.uniform4iv(this.addr,e)}function e_(r,e){r.uniform1uiv(this.addr,e)}function t_(r,e){r.uniform2uiv(this.addr,e)}function n_(r,e){r.uniform3uiv(this.addr,e)}function i_(r,e){r.uniform4uiv(this.addr,e)}function s_(r,e,t){const n=this.cache,i=e.length,s=io(t,i);Rt(n,s)||(r.uniform1iv(this.addr,s),Ct(n,s));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||Ff,s[a])}function r_(r,e,t){const n=this.cache,i=e.length,s=io(t,i);Rt(n,s)||(r.uniform1iv(this.addr,s),Ct(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||Bf,s[a])}function a_(r,e,t){const n=this.cache,i=e.length,s=io(t,i);Rt(n,s)||(r.uniform1iv(this.addr,s),Ct(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||zf,s[a])}function o_(r,e,t){const n=this.cache,i=e.length,s=io(t,i);Rt(n,s)||(r.uniform1iv(this.addr,s),Ct(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Of,s[a])}function l_(r){switch(r){case 5126:return Gv;case 35664:return Wv;case 35665:return Xv;case 35666:return qv;case 35674:return jv;case 35675:return $v;case 35676:return Yv;case 5124:case 35670:return Kv;case 35667:case 35671:return Zv;case 35668:case 35672:return Jv;case 35669:case 35673:return Qv;case 5125:return e_;case 36294:return t_;case 36295:return n_;case 36296:return i_;case 35678:case 36198:case 36298:case 36306:case 35682:return s_;case 35679:case 36299:case 36307:return r_;case 35680:case 36300:case 36308:case 36293:return a_;case 36289:case 36303:case 36311:case 36292:return o_}}class c_{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Vv(t.type)}}class h_{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=l_(t.type)}}class u_{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,a=i.length;s!==a;++s){const o=i[s];o.setValue(e,t[o.id],n)}}}const Oo=/(\w+)(\])?(\[|\.)?/g;function zh(r,e){r.seq.push(e),r.map[e.id]=e}function f_(r,e,t){const n=r.name,i=n.length;for(Oo.lastIndex=0;;){const s=Oo.exec(n),a=Oo.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){zh(t,c===void 0?new c_(o,r,e):new h_(o,r,e));break}else{let u=t.map[o];u===void 0&&(u=new u_(o),zh(t,u)),t=u}}}class Ua{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=e.getActiveUniform(t,i),a=e.getUniformLocation(t,s.name);f_(s,a,this)}}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function Hh(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const d_=37297;let p_=0;function m_(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Vh=new Ve;function g_(r){qe._getMatrix(Vh,qe.workingColorSpace,r);const e=`mat3( ${Vh.elements.map(t=>t.toFixed(4))} )`;switch(qe.getTransfer(r)){case eo:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function Gh(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),i=r.getShaderInfoLog(e).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const a=parseInt(s[1]);return t.toUpperCase()+`

`+i+`

`+m_(r.getShaderSource(e),a)}else return i}function v_(r,e){const t=g_(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function __(r,e){let t;switch(e){case af:t="Linear";break;case of:t="Reinhard";break;case lf:t="Cineon";break;case cc:t="ACESFilmic";break;case cf:t="AgX";break;case hf:t="Neutral";break;case Mp:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ha=new T;function x_(){qe.getLuminanceCoefficients(ha);const r=ha.x.toFixed(4),e=ha.y.toFixed(4),t=ha.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function y_(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(gr).join(`
`)}function M_(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function w_(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),a=s.name;let o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function gr(r){return r!==""}function Wh(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Xh(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const b_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Yl(r){return r.replace(b_,T_)}const S_=new Map;function T_(r,e){let t=Fe[e];if(t===void 0){const n=S_.get(e);if(n!==void 0)t=Fe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Yl(t)}const E_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function qh(r){return r.replace(E_,A_)}function A_(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function jh(r){let e=`precision ${r.precision} float;
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
#define LOW_PRECISION`),e}function R_(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===tf?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===nf?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===ii&&(e="SHADOWMAP_TYPE_VSM"),e}function C_(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case Fs:case Os:e="ENVMAP_TYPE_CUBE";break;case Qa:e="ENVMAP_TYPE_CUBE_UV";break}return e}function P_(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Os:e="ENVMAP_MODE_REFRACTION";break}return e}function D_(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case rf:e="ENVMAP_BLENDING_MULTIPLY";break;case xp:e="ENVMAP_BLENDING_MIX";break;case yp:e="ENVMAP_BLENDING_ADD";break}return e}function I_(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function L_(r,e,t,n){const i=r.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=R_(t),c=C_(t),h=P_(t),u=D_(t),f=I_(t),d=y_(t),m=M_(s),v=i.createProgram();let p,g,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(gr).join(`
`),p.length>0&&(p+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(gr).join(`
`),g.length>0&&(g+=`
`)):(p=[jh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(gr).join(`
`),g=[jh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ii?"#define TONE_MAPPING":"",t.toneMapping!==Ii?Fe.tonemapping_pars_fragment:"",t.toneMapping!==Ii?__("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Fe.colorspace_pars_fragment,v_("linearToOutputTexel",t.outputColorSpace),x_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(gr).join(`
`)),a=Yl(a),a=Wh(a,t),a=Xh(a,t),o=Yl(o),o=Wh(o,t),o=Xh(o,t),a=qh(a),o=qh(o),t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,p=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",t.glslVersion===ah?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ah?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const y=_+p+a,x=_+g+o,P=Hh(i,i.VERTEX_SHADER,y),R=Hh(i,i.FRAGMENT_SHADER,x);i.attachShader(v,P),i.attachShader(v,R),t.index0AttributeName!==void 0?i.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function A(S){if(r.debug.checkShaderErrors){const I=i.getProgramInfoLog(v).trim(),L=i.getShaderInfoLog(P).trim(),O=i.getShaderInfoLog(R).trim();let G=!0,B=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(G=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,v,P,R);else{const $=Gh(i,P,"vertex"),V=Gh(i,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+S.name+`
Material Type: `+S.type+`

Program Info Log: `+I+`
`+$+`
`+V)}else I!==""?console.warn("THREE.WebGLProgram: Program Info Log:",I):(L===""||O==="")&&(B=!1);B&&(S.diagnostics={runnable:G,programLog:I,vertexShader:{log:L,prefix:p},fragmentShader:{log:O,prefix:g}})}i.deleteShader(P),i.deleteShader(R),C=new Ua(i,v),M=w_(i,v)}let C;this.getUniforms=function(){return C===void 0&&A(this),C};let M;this.getAttributes=function(){return M===void 0&&A(this),M};let w=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=i.getProgramParameter(v,d_)),w},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=p_++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=P,this.fragmentShader=R,this}let k_=0;class N_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new U_(e),t.set(e,n)),n}}class U_{constructor(e){this.id=k_++,this.code=e,this.usedTimes=0}}function F_(r,e,t,n,i,s,a){const o=new Cf,l=new N_,c=new Set,h=[],u=i.logarithmicDepthBuffer,f=i.vertexTextures;let d=i.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(M){return c.add(M),M===0?"uv":`uv${M}`}function p(M,w,S,I,L){const O=I.fog,G=L.geometry,B=M.isMeshStandardMaterial?I.environment:null,$=(M.isMeshStandardMaterial?t:e).get(M.envMap||B),V=$&&$.mapping===Qa?$.image.height:null,H=m[M.type];M.precision!==null&&(d=i.getMaxPrecision(M.precision),d!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",d,"instead."));const K=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,Q=K!==void 0?K.length:0;let se=0;G.morphAttributes.position!==void 0&&(se=1),G.morphAttributes.normal!==void 0&&(se=2),G.morphAttributes.color!==void 0&&(se=3);let we,j,te,le;if(H){const rt=Un[H];we=rt.vertexShader,j=rt.fragmentShader}else we=M.vertexShader,j=M.fragmentShader,l.update(M),te=l.getVertexShaderID(M),le=l.getFragmentShaderID(M);const ie=r.getRenderTarget(),fe=r.state.buffers.depth.getReversed(),de=L.isInstancedMesh===!0,_e=L.isBatchedMesh===!0,et=!!M.map,Be=!!M.matcap,tt=!!$,N=!!M.aoMap,yt=!!M.lightMap,Oe=!!M.bumpMap,Ne=!!M.normalMap,Re=!!M.displacementMap,Ke=!!M.emissiveMap,be=!!M.metalnessMap,D=!!M.roughnessMap,b=M.anisotropy>0,z=M.clearcoat>0,Z=M.dispersion>0,ee=M.iridescence>0,Y=M.sheen>0,Se=M.transmission>0,ce=b&&!!M.anisotropyMap,pe=z&&!!M.clearcoatMap,Ge=z&&!!M.clearcoatNormalMap,ne=z&&!!M.clearcoatRoughnessMap,xe=ee&&!!M.iridescenceMap,De=ee&&!!M.iridescenceThicknessMap,Le=Y&&!!M.sheenColorMap,ye=Y&&!!M.sheenRoughnessMap,Xe=!!M.specularMap,ke=!!M.specularColorMap,Ze=!!M.specularIntensityMap,k=Se&&!!M.transmissionMap,oe=Se&&!!M.thicknessMap,q=!!M.gradientMap,J=!!M.alphaMap,ve=M.alphaTest>0,me=!!M.alphaHash,ze=!!M.extensions;let _t=Ii;M.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(_t=r.toneMapping);const Bt={shaderID:H,shaderType:M.type,shaderName:M.name,vertexShader:we,fragmentShader:j,defines:M.defines,customVertexShaderID:te,customFragmentShaderID:le,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:d,batching:_e,batchingColor:_e&&L._colorsTexture!==null,instancing:de,instancingColor:de&&L.instanceColor!==null,instancingMorph:de&&L.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ie===null?r.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:Wt,alphaToCoverage:!!M.alphaToCoverage,map:et,matcap:Be,envMap:tt,envMapMode:tt&&$.mapping,envMapCubeUVHeight:V,aoMap:N,lightMap:yt,bumpMap:Oe,normalMap:Ne,displacementMap:f&&Re,emissiveMap:Ke,normalMapObjectSpace:Ne&&M.normalMapType===Rp,normalMapTangentSpace:Ne&&M.normalMapType===_c,metalnessMap:be,roughnessMap:D,anisotropy:b,anisotropyMap:ce,clearcoat:z,clearcoatMap:pe,clearcoatNormalMap:Ge,clearcoatRoughnessMap:ne,dispersion:Z,iridescence:ee,iridescenceMap:xe,iridescenceThicknessMap:De,sheen:Y,sheenColorMap:Le,sheenRoughnessMap:ye,specularMap:Xe,specularColorMap:ke,specularIntensityMap:Ze,transmission:Se,transmissionMap:k,thicknessMap:oe,gradientMap:q,opaque:M.transparent===!1&&M.blending===Ki&&M.alphaToCoverage===!1,alphaMap:J,alphaTest:ve,alphaHash:me,combine:M.combine,mapUv:et&&v(M.map.channel),aoMapUv:N&&v(M.aoMap.channel),lightMapUv:yt&&v(M.lightMap.channel),bumpMapUv:Oe&&v(M.bumpMap.channel),normalMapUv:Ne&&v(M.normalMap.channel),displacementMapUv:Re&&v(M.displacementMap.channel),emissiveMapUv:Ke&&v(M.emissiveMap.channel),metalnessMapUv:be&&v(M.metalnessMap.channel),roughnessMapUv:D&&v(M.roughnessMap.channel),anisotropyMapUv:ce&&v(M.anisotropyMap.channel),clearcoatMapUv:pe&&v(M.clearcoatMap.channel),clearcoatNormalMapUv:Ge&&v(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ne&&v(M.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&v(M.iridescenceMap.channel),iridescenceThicknessMapUv:De&&v(M.iridescenceThicknessMap.channel),sheenColorMapUv:Le&&v(M.sheenColorMap.channel),sheenRoughnessMapUv:ye&&v(M.sheenRoughnessMap.channel),specularMapUv:Xe&&v(M.specularMap.channel),specularColorMapUv:ke&&v(M.specularColorMap.channel),specularIntensityMapUv:Ze&&v(M.specularIntensityMap.channel),transmissionMapUv:k&&v(M.transmissionMap.channel),thicknessMapUv:oe&&v(M.thicknessMap.channel),alphaMapUv:J&&v(M.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(Ne||b),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!G.attributes.uv&&(et||J),fog:!!O,useFog:M.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:fe,skinning:L.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:se,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:M.dithering,shadowMapEnabled:r.shadowMap.enabled&&S.length>0,shadowMapType:r.shadowMap.type,toneMapping:_t,decodeVideoTexture:et&&M.map.isVideoTexture===!0&&qe.getTransfer(M.map.colorSpace)===at,decodeVideoTextureEmissive:Ke&&M.emissiveMap.isVideoTexture===!0&&qe.getTransfer(M.emissiveMap.colorSpace)===at,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===mt,flipSided:M.side===Gt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:ze&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ze&&M.extensions.multiDraw===!0||_e)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Bt.vertexUv1s=c.has(1),Bt.vertexUv2s=c.has(2),Bt.vertexUv3s=c.has(3),c.clear(),Bt}function g(M){const w=[];if(M.shaderID?w.push(M.shaderID):(w.push(M.customVertexShaderID),w.push(M.customFragmentShaderID)),M.defines!==void 0)for(const S in M.defines)w.push(S),w.push(M.defines[S]);return M.isRawShaderMaterial===!1&&(_(w,M),y(w,M),w.push(r.outputColorSpace)),w.push(M.customProgramCacheKey),w.join()}function _(M,w){M.push(w.precision),M.push(w.outputColorSpace),M.push(w.envMapMode),M.push(w.envMapCubeUVHeight),M.push(w.mapUv),M.push(w.alphaMapUv),M.push(w.lightMapUv),M.push(w.aoMapUv),M.push(w.bumpMapUv),M.push(w.normalMapUv),M.push(w.displacementMapUv),M.push(w.emissiveMapUv),M.push(w.metalnessMapUv),M.push(w.roughnessMapUv),M.push(w.anisotropyMapUv),M.push(w.clearcoatMapUv),M.push(w.clearcoatNormalMapUv),M.push(w.clearcoatRoughnessMapUv),M.push(w.iridescenceMapUv),M.push(w.iridescenceThicknessMapUv),M.push(w.sheenColorMapUv),M.push(w.sheenRoughnessMapUv),M.push(w.specularMapUv),M.push(w.specularColorMapUv),M.push(w.specularIntensityMapUv),M.push(w.transmissionMapUv),M.push(w.thicknessMapUv),M.push(w.combine),M.push(w.fogExp2),M.push(w.sizeAttenuation),M.push(w.morphTargetsCount),M.push(w.morphAttributeCount),M.push(w.numDirLights),M.push(w.numPointLights),M.push(w.numSpotLights),M.push(w.numSpotLightMaps),M.push(w.numHemiLights),M.push(w.numRectAreaLights),M.push(w.numDirLightShadows),M.push(w.numPointLightShadows),M.push(w.numSpotLightShadows),M.push(w.numSpotLightShadowsWithMaps),M.push(w.numLightProbes),M.push(w.shadowMapType),M.push(w.toneMapping),M.push(w.numClippingPlanes),M.push(w.numClipIntersection),M.push(w.depthPacking)}function y(M,w){o.disableAll(),w.supportsVertexTextures&&o.enable(0),w.instancing&&o.enable(1),w.instancingColor&&o.enable(2),w.instancingMorph&&o.enable(3),w.matcap&&o.enable(4),w.envMap&&o.enable(5),w.normalMapObjectSpace&&o.enable(6),w.normalMapTangentSpace&&o.enable(7),w.clearcoat&&o.enable(8),w.iridescence&&o.enable(9),w.alphaTest&&o.enable(10),w.vertexColors&&o.enable(11),w.vertexAlphas&&o.enable(12),w.vertexUv1s&&o.enable(13),w.vertexUv2s&&o.enable(14),w.vertexUv3s&&o.enable(15),w.vertexTangents&&o.enable(16),w.anisotropy&&o.enable(17),w.alphaHash&&o.enable(18),w.batching&&o.enable(19),w.dispersion&&o.enable(20),w.batchingColor&&o.enable(21),M.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reverseDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),M.push(o.mask)}function x(M){const w=m[M.type];let S;if(w){const I=Un[w];S=Tn.clone(I.uniforms)}else S=M.uniforms;return S}function P(M,w){let S;for(let I=0,L=h.length;I<L;I++){const O=h[I];if(O.cacheKey===w){S=O,++S.usedTimes;break}}return S===void 0&&(S=new L_(r,w,M,s),h.push(S)),S}function R(M){if(--M.usedTimes===0){const w=h.indexOf(M);h[w]=h[h.length-1],h.pop(),M.destroy()}}function A(M){l.remove(M)}function C(){l.dispose()}return{getParameters:p,getProgramCacheKey:g,getUniforms:x,acquireProgram:P,releaseProgram:R,releaseShaderCache:A,programs:h,dispose:C}}function O_(){let r=new WeakMap;function e(a){return r.has(a)}function t(a){let o=r.get(a);return o===void 0&&(o={},r.set(a,o)),o}function n(a){r.delete(a)}function i(a,o,l){r.get(a)[o]=l}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function B_(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function $h(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Yh(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(u,f,d,m,v,p){let g=r[e];return g===void 0?(g={id:u.id,object:u,geometry:f,material:d,groupOrder:m,renderOrder:u.renderOrder,z:v,group:p},r[e]=g):(g.id=u.id,g.object=u,g.geometry=f,g.material=d,g.groupOrder=m,g.renderOrder=u.renderOrder,g.z=v,g.group=p),e++,g}function o(u,f,d,m,v,p){const g=a(u,f,d,m,v,p);d.transmission>0?n.push(g):d.transparent===!0?i.push(g):t.push(g)}function l(u,f,d,m,v,p){const g=a(u,f,d,m,v,p);d.transmission>0?n.unshift(g):d.transparent===!0?i.unshift(g):t.unshift(g)}function c(u,f){t.length>1&&t.sort(u||B_),n.length>1&&n.sort(f||$h),i.length>1&&i.sort(f||$h)}function h(){for(let u=e,f=r.length;u<f;u++){const d=r[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:o,unshift:l,finish:h,sort:c}}function z_(){let r=new WeakMap;function e(n,i){const s=r.get(n);let a;return s===void 0?(a=new Yh,r.set(n,[a])):i>=s.length?(a=new Yh,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function H_(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new T,color:new ue};break;case"SpotLight":t={position:new T,direction:new T,color:new ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new T,color:new ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new T,skyColor:new ue,groundColor:new ue};break;case"RectAreaLight":t={color:new ue,position:new T,halfWidth:new T,halfHeight:new T};break}return r[e.id]=t,t}}}function V_(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let G_=0;function W_(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function X_(r){const e=new H_,t=V_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new T);const i=new T,s=new Pe,a=new Pe;function o(c){let h=0,u=0,f=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let d=0,m=0,v=0,p=0,g=0,_=0,y=0,x=0,P=0,R=0,A=0;c.sort(W_);for(let M=0,w=c.length;M<w;M++){const S=c[M],I=S.color,L=S.intensity,O=S.distance,G=S.shadow&&S.shadow.map?S.shadow.map.texture:null;if(S.isAmbientLight)h+=I.r*L,u+=I.g*L,f+=I.b*L;else if(S.isLightProbe){for(let B=0;B<9;B++)n.probe[B].addScaledVector(S.sh.coefficients[B],L);A++}else if(S.isDirectionalLight){const B=e.get(S);if(B.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){const $=S.shadow,V=t.get(S);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,n.directionalShadow[d]=V,n.directionalShadowMap[d]=G,n.directionalShadowMatrix[d]=S.shadow.matrix,_++}n.directional[d]=B,d++}else if(S.isSpotLight){const B=e.get(S);B.position.setFromMatrixPosition(S.matrixWorld),B.color.copy(I).multiplyScalar(L),B.distance=O,B.coneCos=Math.cos(S.angle),B.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),B.decay=S.decay,n.spot[v]=B;const $=S.shadow;if(S.map&&(n.spotLightMap[P]=S.map,P++,$.updateMatrices(S),S.castShadow&&R++),n.spotLightMatrix[v]=$.matrix,S.castShadow){const V=t.get(S);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,n.spotShadow[v]=V,n.spotShadowMap[v]=G,x++}v++}else if(S.isRectAreaLight){const B=e.get(S);B.color.copy(I).multiplyScalar(L),B.halfWidth.set(S.width*.5,0,0),B.halfHeight.set(0,S.height*.5,0),n.rectArea[p]=B,p++}else if(S.isPointLight){const B=e.get(S);if(B.color.copy(S.color).multiplyScalar(S.intensity),B.distance=S.distance,B.decay=S.decay,S.castShadow){const $=S.shadow,V=t.get(S);V.shadowIntensity=$.intensity,V.shadowBias=$.bias,V.shadowNormalBias=$.normalBias,V.shadowRadius=$.radius,V.shadowMapSize=$.mapSize,V.shadowCameraNear=$.camera.near,V.shadowCameraFar=$.camera.far,n.pointShadow[m]=V,n.pointShadowMap[m]=G,n.pointShadowMatrix[m]=S.shadow.matrix,y++}n.point[m]=B,m++}else if(S.isHemisphereLight){const B=e.get(S);B.skyColor.copy(S.color).multiplyScalar(L),B.groundColor.copy(S.groundColor).multiplyScalar(L),n.hemi[g]=B,g++}}p>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=he.LTC_FLOAT_1,n.rectAreaLTC2=he.LTC_FLOAT_2):(n.rectAreaLTC1=he.LTC_HALF_1,n.rectAreaLTC2=he.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const C=n.hash;(C.directionalLength!==d||C.pointLength!==m||C.spotLength!==v||C.rectAreaLength!==p||C.hemiLength!==g||C.numDirectionalShadows!==_||C.numPointShadows!==y||C.numSpotShadows!==x||C.numSpotMaps!==P||C.numLightProbes!==A)&&(n.directional.length=d,n.spot.length=v,n.rectArea.length=p,n.point.length=m,n.hemi.length=g,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=x+P-R,n.spotLightMap.length=P,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=A,C.directionalLength=d,C.pointLength=m,C.spotLength=v,C.rectAreaLength=p,C.hemiLength=g,C.numDirectionalShadows=_,C.numPointShadows=y,C.numSpotShadows=x,C.numSpotMaps=P,C.numLightProbes=A,n.version=G_++)}function l(c,h){let u=0,f=0,d=0,m=0,v=0;const p=h.matrixWorldInverse;for(let g=0,_=c.length;g<_;g++){const y=c[g];if(y.isDirectionalLight){const x=n.directional[u];x.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(p),u++}else if(y.isSpotLight){const x=n.spot[d];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(p),x.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(p),d++}else if(y.isRectAreaLight){const x=n.rectArea[m];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(p),a.identity(),s.copy(y.matrixWorld),s.premultiply(p),a.extractRotation(s),x.halfWidth.set(y.width*.5,0,0),x.halfHeight.set(0,y.height*.5,0),x.halfWidth.applyMatrix4(a),x.halfHeight.applyMatrix4(a),m++}else if(y.isPointLight){const x=n.point[f];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(p),f++}else if(y.isHemisphereLight){const x=n.hemi[v];x.direction.setFromMatrixPosition(y.matrixWorld),x.direction.transformDirection(p),v++}}}return{setup:o,setupView:l,state:n}}function Kh(r){const e=new X_(r),t=[],n=[];function i(h){c.camera=h,t.length=0,n.length=0}function s(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function q_(r){let e=new WeakMap;function t(i,s=0){const a=e.get(i);let o;return a===void 0?(o=new Kh(r),e.set(i,[o])):s>=a.length?(o=new Kh(r),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}class j_ extends gn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Ep,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class $_ extends gn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Y_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,K_=`uniform sampler2D shadow_pass;
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
}`;function Z_(r,e,t){let n=new yc;const i=new ae,s=new ae,a=new Qe,o=new j_({depthPacking:Ap}),l=new $_,c={},h=t.maxTextureSize,u={[ci]:Gt,[Gt]:ci,[mt]:mt},f=new gt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ae},radius:{value:4}},vertexShader:Y_,fragmentShader:K_}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const m=new vt;m.setAttribute("position",new wt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Ie(m,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=tf;let g=this.type;this.render=function(R,A,C){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||R.length===0)return;const M=r.getRenderTarget(),w=r.getActiveCubeFace(),S=r.getActiveMipmapLevel(),I=r.state;I.setBlending(Ft),I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);const L=g!==ii&&this.type===ii,O=g===ii&&this.type!==ii;for(let G=0,B=R.length;G<B;G++){const $=R[G],V=$.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;i.copy(V.mapSize);const H=V.getFrameExtents();if(i.multiply(H),s.copy(V.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/H.x),i.x=s.x*H.x,V.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/H.y),i.y=s.y*H.y,V.mapSize.y=s.y)),V.map===null||L===!0||O===!0){const Q=this.type!==ii?{minFilter:Ot,magFilter:Ot}:{};V.map!==null&&V.map.dispose(),V.map=new nn(i.x,i.y,Q),V.map.texture.name=$.name+".shadowMap",V.camera.updateProjectionMatrix()}r.setRenderTarget(V.map),r.clear();const K=V.getViewportCount();for(let Q=0;Q<K;Q++){const se=V.getViewport(Q);a.set(s.x*se.x,s.y*se.y,s.x*se.z,s.y*se.w),I.viewport(a),V.updateMatrices($,Q),n=V.getFrustum(),x(A,C,V.camera,$,this.type)}V.isPointLightShadow!==!0&&this.type===ii&&_(V,C),V.needsUpdate=!1}g=this.type,p.needsUpdate=!1,r.setRenderTarget(M,w,S)};function _(R,A){const C=e.update(v);f.defines.VSM_SAMPLES!==R.blurSamples&&(f.defines.VSM_SAMPLES=R.blurSamples,d.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new nn(i.x,i.y)),f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,r.setRenderTarget(R.mapPass),r.clear(),r.renderBufferDirect(A,null,C,f,v,null),d.uniforms.shadow_pass.value=R.mapPass.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,r.setRenderTarget(R.map),r.clear(),r.renderBufferDirect(A,null,C,d,v,null)}function y(R,A,C,M){let w=null;const S=C.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(S!==void 0)w=S;else if(w=C.isPointLight===!0?l:o,r.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const I=w.uuid,L=A.uuid;let O=c[I];O===void 0&&(O={},c[I]=O);let G=O[L];G===void 0&&(G=w.clone(),O[L]=G,A.addEventListener("dispose",P)),w=G}if(w.visible=A.visible,w.wireframe=A.wireframe,M===ii?w.side=A.shadowSide!==null?A.shadowSide:A.side:w.side=A.shadowSide!==null?A.shadowSide:u[A.side],w.alphaMap=A.alphaMap,w.alphaTest=A.alphaTest,w.map=A.map,w.clipShadows=A.clipShadows,w.clippingPlanes=A.clippingPlanes,w.clipIntersection=A.clipIntersection,w.displacementMap=A.displacementMap,w.displacementScale=A.displacementScale,w.displacementBias=A.displacementBias,w.wireframeLinewidth=A.wireframeLinewidth,w.linewidth=A.linewidth,C.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const I=r.properties.get(w);I.light=C}return w}function x(R,A,C,M,w){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&w===ii)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,R.matrixWorld);const L=e.update(R),O=R.material;if(Array.isArray(O)){const G=L.groups;for(let B=0,$=G.length;B<$;B++){const V=G[B],H=O[V.materialIndex];if(H&&H.visible){const K=y(R,H,M,w);R.onBeforeShadow(r,R,A,C,L,K,V),r.renderBufferDirect(C,null,L,K,R,V),R.onAfterShadow(r,R,A,C,L,K,V)}}}else if(O.visible){const G=y(R,O,M,w);R.onBeforeShadow(r,R,A,C,L,G,null),r.renderBufferDirect(C,null,L,G,R,null),R.onAfterShadow(r,R,A,C,L,G,null)}}const I=R.children;for(let L=0,O=I.length;L<O;L++)x(I[L],A,C,M,w)}function P(R){R.target.removeEventListener("dispose",P);for(const C in c){const M=c[C],w=R.target.uuid;w in M&&(M[w].dispose(),delete M[w])}}}const J_={[fl]:dl,[pl]:vl,[ml]:_l,[Us]:gl,[dl]:fl,[vl]:pl,[_l]:ml,[gl]:Us};function Q_(r,e){function t(){let k=!1;const oe=new Qe;let q=null;const J=new Qe(0,0,0,0);return{setMask:function(ve){q!==ve&&!k&&(r.colorMask(ve,ve,ve,ve),q=ve)},setLocked:function(ve){k=ve},setClear:function(ve,me,ze,_t,Bt){Bt===!0&&(ve*=_t,me*=_t,ze*=_t),oe.set(ve,me,ze,_t),J.equals(oe)===!1&&(r.clearColor(ve,me,ze,_t),J.copy(oe))},reset:function(){k=!1,q=null,J.set(-1,0,0,0)}}}function n(){let k=!1,oe=!1,q=null,J=null,ve=null;return{setReversed:function(me){if(oe!==me){const ze=e.get("EXT_clip_control");oe?ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.ZERO_TO_ONE_EXT):ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.NEGATIVE_ONE_TO_ONE_EXT);const _t=ve;ve=null,this.setClear(_t)}oe=me},getReversed:function(){return oe},setTest:function(me){me?ie(r.DEPTH_TEST):fe(r.DEPTH_TEST)},setMask:function(me){q!==me&&!k&&(r.depthMask(me),q=me)},setFunc:function(me){if(oe&&(me=J_[me]),J!==me){switch(me){case fl:r.depthFunc(r.NEVER);break;case dl:r.depthFunc(r.ALWAYS);break;case pl:r.depthFunc(r.LESS);break;case Us:r.depthFunc(r.LEQUAL);break;case ml:r.depthFunc(r.EQUAL);break;case gl:r.depthFunc(r.GEQUAL);break;case vl:r.depthFunc(r.GREATER);break;case _l:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}J=me}},setLocked:function(me){k=me},setClear:function(me){ve!==me&&(oe&&(me=1-me),r.clearDepth(me),ve=me)},reset:function(){k=!1,q=null,J=null,ve=null,oe=!1}}}function i(){let k=!1,oe=null,q=null,J=null,ve=null,me=null,ze=null,_t=null,Bt=null;return{setTest:function(rt){k||(rt?ie(r.STENCIL_TEST):fe(r.STENCIL_TEST))},setMask:function(rt){oe!==rt&&!k&&(r.stencilMask(rt),oe=rt)},setFunc:function(rt,_n,Xn){(q!==rt||J!==_n||ve!==Xn)&&(r.stencilFunc(rt,_n,Xn),q=rt,J=_n,ve=Xn)},setOp:function(rt,_n,Xn){(me!==rt||ze!==_n||_t!==Xn)&&(r.stencilOp(rt,_n,Xn),me=rt,ze=_n,_t=Xn)},setLocked:function(rt){k=rt},setClear:function(rt){Bt!==rt&&(r.clearStencil(rt),Bt=rt)},reset:function(){k=!1,oe=null,q=null,J=null,ve=null,me=null,ze=null,_t=null,Bt=null}}}const s=new t,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,d=[],m=null,v=!1,p=null,g=null,_=null,y=null,x=null,P=null,R=null,A=new ue(0,0,0),C=0,M=!1,w=null,S=null,I=null,L=null,O=null;const G=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let B=!1,$=0;const V=r.getParameter(r.VERSION);V.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(V)[1]),B=$>=1):V.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),B=$>=2);let H=null,K={};const Q=r.getParameter(r.SCISSOR_BOX),se=r.getParameter(r.VIEWPORT),we=new Qe().fromArray(Q),j=new Qe().fromArray(se);function te(k,oe,q,J){const ve=new Uint8Array(4),me=r.createTexture();r.bindTexture(k,me),r.texParameteri(k,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(k,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let ze=0;ze<q;ze++)k===r.TEXTURE_3D||k===r.TEXTURE_2D_ARRAY?r.texImage3D(oe,0,r.RGBA,1,1,J,0,r.RGBA,r.UNSIGNED_BYTE,ve):r.texImage2D(oe+ze,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,ve);return me}const le={};le[r.TEXTURE_2D]=te(r.TEXTURE_2D,r.TEXTURE_2D,1),le[r.TEXTURE_CUBE_MAP]=te(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[r.TEXTURE_2D_ARRAY]=te(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),le[r.TEXTURE_3D]=te(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ie(r.DEPTH_TEST),a.setFunc(Us),Oe(!1),Ne(th),ie(r.CULL_FACE),N(Ft);function ie(k){h[k]!==!0&&(r.enable(k),h[k]=!0)}function fe(k){h[k]!==!1&&(r.disable(k),h[k]=!1)}function de(k,oe){return u[k]!==oe?(r.bindFramebuffer(k,oe),u[k]=oe,k===r.DRAW_FRAMEBUFFER&&(u[r.FRAMEBUFFER]=oe),k===r.FRAMEBUFFER&&(u[r.DRAW_FRAMEBUFFER]=oe),!0):!1}function _e(k,oe){let q=d,J=!1;if(k){q=f.get(oe),q===void 0&&(q=[],f.set(oe,q));const ve=k.textures;if(q.length!==ve.length||q[0]!==r.COLOR_ATTACHMENT0){for(let me=0,ze=ve.length;me<ze;me++)q[me]=r.COLOR_ATTACHMENT0+me;q.length=ve.length,J=!0}}else q[0]!==r.BACK&&(q[0]=r.BACK,J=!0);J&&r.drawBuffers(q)}function et(k){return m!==k?(r.useProgram(k),m=k,!0):!1}const Be={[bn]:r.FUNC_ADD,[rp]:r.FUNC_SUBTRACT,[ap]:r.FUNC_REVERSE_SUBTRACT};Be[op]=r.MIN,Be[lp]=r.MAX;const tt={[dr]:r.ZERO,[cp]:r.ONE,[hp]:r.SRC_COLOR,[ll]:r.SRC_ALPHA,[pp]:r.SRC_ALPHA_SATURATE,[ul]:r.DST_COLOR,[hl]:r.DST_ALPHA,[up]:r.ONE_MINUS_SRC_COLOR,[cl]:r.ONE_MINUS_SRC_ALPHA,[dp]:r.ONE_MINUS_DST_COLOR,[fp]:r.ONE_MINUS_DST_ALPHA,[mp]:r.CONSTANT_COLOR,[gp]:r.ONE_MINUS_CONSTANT_COLOR,[vp]:r.CONSTANT_ALPHA,[_p]:r.ONE_MINUS_CONSTANT_ALPHA};function N(k,oe,q,J,ve,me,ze,_t,Bt,rt){if(k===Ft){v===!0&&(fe(r.BLEND),v=!1);return}if(v===!1&&(ie(r.BLEND),v=!0),k!==sf){if(k!==p||rt!==M){if((g!==bn||x!==bn)&&(r.blendEquation(r.FUNC_ADD),g=bn,x=bn),rt)switch(k){case Ki:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Qt:r.blendFunc(r.ONE,r.ONE);break;case nh:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case ih:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}else switch(k){case Ki:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Qt:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case nh:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case ih:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}_=null,y=null,P=null,R=null,A.set(0,0,0),C=0,p=k,M=rt}return}ve=ve||oe,me=me||q,ze=ze||J,(oe!==g||ve!==x)&&(r.blendEquationSeparate(Be[oe],Be[ve]),g=oe,x=ve),(q!==_||J!==y||me!==P||ze!==R)&&(r.blendFuncSeparate(tt[q],tt[J],tt[me],tt[ze]),_=q,y=J,P=me,R=ze),(_t.equals(A)===!1||Bt!==C)&&(r.blendColor(_t.r,_t.g,_t.b,Bt),A.copy(_t),C=Bt),p=k,M=!1}function yt(k,oe){k.side===mt?fe(r.CULL_FACE):ie(r.CULL_FACE);let q=k.side===Gt;oe&&(q=!q),Oe(q),k.blending===Ki&&k.transparent===!1?N(Ft):N(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),a.setFunc(k.depthFunc),a.setTest(k.depthTest),a.setMask(k.depthWrite),s.setMask(k.colorWrite);const J=k.stencilWrite;o.setTest(J),J&&(o.setMask(k.stencilWriteMask),o.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),o.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),Ke(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?ie(r.SAMPLE_ALPHA_TO_COVERAGE):fe(r.SAMPLE_ALPHA_TO_COVERAGE)}function Oe(k){w!==k&&(k?r.frontFace(r.CW):r.frontFace(r.CCW),w=k)}function Ne(k){k!==ip?(ie(r.CULL_FACE),k!==S&&(k===th?r.cullFace(r.BACK):k===sp?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):fe(r.CULL_FACE),S=k}function Re(k){k!==I&&(B&&r.lineWidth(k),I=k)}function Ke(k,oe,q){k?(ie(r.POLYGON_OFFSET_FILL),(L!==oe||O!==q)&&(r.polygonOffset(oe,q),L=oe,O=q)):fe(r.POLYGON_OFFSET_FILL)}function be(k){k?ie(r.SCISSOR_TEST):fe(r.SCISSOR_TEST)}function D(k){k===void 0&&(k=r.TEXTURE0+G-1),H!==k&&(r.activeTexture(k),H=k)}function b(k,oe,q){q===void 0&&(H===null?q=r.TEXTURE0+G-1:q=H);let J=K[q];J===void 0&&(J={type:void 0,texture:void 0},K[q]=J),(J.type!==k||J.texture!==oe)&&(H!==q&&(r.activeTexture(q),H=q),r.bindTexture(k,oe||le[k]),J.type=k,J.texture=oe)}function z(){const k=K[H];k!==void 0&&k.type!==void 0&&(r.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function Z(){try{r.compressedTexImage2D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ee(){try{r.compressedTexImage3D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Y(){try{r.texSubImage2D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Se(){try{r.texSubImage3D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ce(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function pe(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Ge(){try{r.texStorage2D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ne(){try{r.texStorage3D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function xe(){try{r.texImage2D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function De(){try{r.texImage3D.apply(r,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Le(k){we.equals(k)===!1&&(r.scissor(k.x,k.y,k.z,k.w),we.copy(k))}function ye(k){j.equals(k)===!1&&(r.viewport(k.x,k.y,k.z,k.w),j.copy(k))}function Xe(k,oe){let q=c.get(oe);q===void 0&&(q=new WeakMap,c.set(oe,q));let J=q.get(k);J===void 0&&(J=r.getUniformBlockIndex(oe,k.name),q.set(k,J))}function ke(k,oe){const J=c.get(oe).get(k);l.get(oe)!==J&&(r.uniformBlockBinding(oe,J,k.__bindingPointIndex),l.set(oe,J))}function Ze(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),a.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),h={},H=null,K={},u={},f=new WeakMap,d=[],m=null,v=!1,p=null,g=null,_=null,y=null,x=null,P=null,R=null,A=new ue(0,0,0),C=0,M=!1,w=null,S=null,I=null,L=null,O=null,we.set(0,0,r.canvas.width,r.canvas.height),j.set(0,0,r.canvas.width,r.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:ie,disable:fe,bindFramebuffer:de,drawBuffers:_e,useProgram:et,setBlending:N,setMaterial:yt,setFlipSided:Oe,setCullFace:Ne,setLineWidth:Re,setPolygonOffset:Ke,setScissorTest:be,activeTexture:D,bindTexture:b,unbindTexture:z,compressedTexImage2D:Z,compressedTexImage3D:ee,texImage2D:xe,texImage3D:De,updateUBOMapping:Xe,uniformBlockBinding:ke,texStorage2D:Ge,texStorage3D:ne,texSubImage2D:Y,texSubImage3D:Se,compressedTexSubImage2D:ce,compressedTexSubImage3D:pe,scissor:Le,viewport:ye,reset:Ze}}function Zh(r,e,t,n){const i=ex(n);switch(t){case gf:return r*e;case _f:return r*e;case xf:return r*e*2;case dc:return r*e/i.components*i.byteLength;case pc:return r*e/i.components*i.byteLength;case yf:return r*e*2/i.components*i.byteLength;case mc:return r*e*2/i.components*i.byteLength;case vf:return r*e*3/i.components*i.byteLength;case Yt:return r*e*4/i.components*i.byteLength;case gc:return r*e*4/i.components*i.byteLength;case Da:case Ia:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case La:case ka:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Ml:case bl:return Math.max(r,16)*Math.max(e,8)/4;case yl:case wl:return Math.max(r,8)*Math.max(e,8)/2;case Sl:case Tl:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case El:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Al:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Rl:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Cl:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case Pl:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case Dl:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Il:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Ll:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case kl:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Nl:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Ul:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Fl:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Ol:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case Bl:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case zl:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Na:case Hl:case Vl:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Mf:case Gl:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Wl:case Xl:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ex(r){switch(r){case zn:case df:return{byteLength:1,components:1};case Cr:case pf:case Vt:return{byteLength:2,components:1};case uc:case fc:return{byteLength:2,components:4};case Ji:case hc:case en:return{byteLength:4,components:1};case mf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}function tx(r,e,t,n,i,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ae,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(D,b){return d?new OffscreenCanvas(D,b):Ir("canvas")}function v(D,b,z){let Z=1;const ee=be(D);if((ee.width>z||ee.height>z)&&(Z=z/Math.max(ee.width,ee.height)),Z<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const Y=Math.floor(Z*ee.width),Se=Math.floor(Z*ee.height);u===void 0&&(u=m(Y,Se));const ce=b?m(Y,Se):u;return ce.width=Y,ce.height=Se,ce.getContext("2d").drawImage(D,0,0,Y,Se),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+Y+"x"+Se+")."),ce}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),D;return D}function p(D){return D.generateMipmaps}function g(D){r.generateMipmap(D)}function _(D){return D.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?r.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function y(D,b,z,Z,ee=!1){if(D!==null){if(r[D]!==void 0)return r[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let Y=b;if(b===r.RED&&(z===r.FLOAT&&(Y=r.R32F),z===r.HALF_FLOAT&&(Y=r.R16F),z===r.UNSIGNED_BYTE&&(Y=r.R8)),b===r.RED_INTEGER&&(z===r.UNSIGNED_BYTE&&(Y=r.R8UI),z===r.UNSIGNED_SHORT&&(Y=r.R16UI),z===r.UNSIGNED_INT&&(Y=r.R32UI),z===r.BYTE&&(Y=r.R8I),z===r.SHORT&&(Y=r.R16I),z===r.INT&&(Y=r.R32I)),b===r.RG&&(z===r.FLOAT&&(Y=r.RG32F),z===r.HALF_FLOAT&&(Y=r.RG16F),z===r.UNSIGNED_BYTE&&(Y=r.RG8)),b===r.RG_INTEGER&&(z===r.UNSIGNED_BYTE&&(Y=r.RG8UI),z===r.UNSIGNED_SHORT&&(Y=r.RG16UI),z===r.UNSIGNED_INT&&(Y=r.RG32UI),z===r.BYTE&&(Y=r.RG8I),z===r.SHORT&&(Y=r.RG16I),z===r.INT&&(Y=r.RG32I)),b===r.RGB_INTEGER&&(z===r.UNSIGNED_BYTE&&(Y=r.RGB8UI),z===r.UNSIGNED_SHORT&&(Y=r.RGB16UI),z===r.UNSIGNED_INT&&(Y=r.RGB32UI),z===r.BYTE&&(Y=r.RGB8I),z===r.SHORT&&(Y=r.RGB16I),z===r.INT&&(Y=r.RGB32I)),b===r.RGBA_INTEGER&&(z===r.UNSIGNED_BYTE&&(Y=r.RGBA8UI),z===r.UNSIGNED_SHORT&&(Y=r.RGBA16UI),z===r.UNSIGNED_INT&&(Y=r.RGBA32UI),z===r.BYTE&&(Y=r.RGBA8I),z===r.SHORT&&(Y=r.RGBA16I),z===r.INT&&(Y=r.RGBA32I)),b===r.RGB&&z===r.UNSIGNED_INT_5_9_9_9_REV&&(Y=r.RGB9_E5),b===r.RGBA){const Se=ee?eo:qe.getTransfer(Z);z===r.FLOAT&&(Y=r.RGBA32F),z===r.HALF_FLOAT&&(Y=r.RGBA16F),z===r.UNSIGNED_BYTE&&(Y=Se===at?r.SRGB8_ALPHA8:r.RGBA8),z===r.UNSIGNED_SHORT_4_4_4_4&&(Y=r.RGBA4),z===r.UNSIGNED_SHORT_5_5_5_1&&(Y=r.RGB5_A1)}return(Y===r.R16F||Y===r.R32F||Y===r.RG16F||Y===r.RG32F||Y===r.RGBA16F||Y===r.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function x(D,b){let z;return D?b===null||b===Ji||b===Qi?z=r.DEPTH24_STENCIL8:b===en?z=r.DEPTH32F_STENCIL8:b===Cr&&(z=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Ji||b===Qi?z=r.DEPTH_COMPONENT24:b===en?z=r.DEPTH_COMPONENT32F:b===Cr&&(z=r.DEPTH_COMPONENT16),z}function P(D,b){return p(D)===!0||D.isFramebufferTexture&&D.minFilter!==Ot&&D.minFilter!==Tt?Math.log2(Math.max(b.width,b.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?b.mipmaps.length:1}function R(D){const b=D.target;b.removeEventListener("dispose",R),C(b),b.isVideoTexture&&h.delete(b)}function A(D){const b=D.target;b.removeEventListener("dispose",A),w(b)}function C(D){const b=n.get(D);if(b.__webglInit===void 0)return;const z=D.source,Z=f.get(z);if(Z){const ee=Z[b.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&M(D),Object.keys(Z).length===0&&f.delete(z)}n.remove(D)}function M(D){const b=n.get(D);r.deleteTexture(b.__webglTexture);const z=D.source,Z=f.get(z);delete Z[b.__cacheKey],a.memory.textures--}function w(D){const b=n.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),n.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(b.__webglFramebuffer[Z]))for(let ee=0;ee<b.__webglFramebuffer[Z].length;ee++)r.deleteFramebuffer(b.__webglFramebuffer[Z][ee]);else r.deleteFramebuffer(b.__webglFramebuffer[Z]);b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer[Z])}else{if(Array.isArray(b.__webglFramebuffer))for(let Z=0;Z<b.__webglFramebuffer.length;Z++)r.deleteFramebuffer(b.__webglFramebuffer[Z]);else r.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&r.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let Z=0;Z<b.__webglColorRenderbuffer.length;Z++)b.__webglColorRenderbuffer[Z]&&r.deleteRenderbuffer(b.__webglColorRenderbuffer[Z]);b.__webglDepthRenderbuffer&&r.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const z=D.textures;for(let Z=0,ee=z.length;Z<ee;Z++){const Y=n.get(z[Z]);Y.__webglTexture&&(r.deleteTexture(Y.__webglTexture),a.memory.textures--),n.remove(z[Z])}n.remove(D)}let S=0;function I(){S=0}function L(){const D=S;return D>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+i.maxTextures),S+=1,D}function O(D){const b=[];return b.push(D.wrapS),b.push(D.wrapT),b.push(D.wrapR||0),b.push(D.magFilter),b.push(D.minFilter),b.push(D.anisotropy),b.push(D.internalFormat),b.push(D.format),b.push(D.type),b.push(D.generateMipmaps),b.push(D.premultiplyAlpha),b.push(D.flipY),b.push(D.unpackAlignment),b.push(D.colorSpace),b.join()}function G(D,b){const z=n.get(D);if(D.isVideoTexture&&Re(D),D.isRenderTargetTexture===!1&&D.version>0&&z.__version!==D.version){const Z=D.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(z,D,b);return}}t.bindTexture(r.TEXTURE_2D,z.__webglTexture,r.TEXTURE0+b)}function B(D,b){const z=n.get(D);if(D.version>0&&z.__version!==D.version){j(z,D,b);return}t.bindTexture(r.TEXTURE_2D_ARRAY,z.__webglTexture,r.TEXTURE0+b)}function $(D,b){const z=n.get(D);if(D.version>0&&z.__version!==D.version){j(z,D,b);return}t.bindTexture(r.TEXTURE_3D,z.__webglTexture,r.TEXTURE0+b)}function V(D,b){const z=n.get(D);if(D.version>0&&z.__version!==D.version){te(z,D,b);return}t.bindTexture(r.TEXTURE_CUBE_MAP,z.__webglTexture,r.TEXTURE0+b)}const H={[Pn]:r.REPEAT,[Bn]:r.CLAMP_TO_EDGE,[Ga]:r.MIRRORED_REPEAT},K={[Ot]:r.NEAREST,[ff]:r.NEAREST_MIPMAP_NEAREST,[pr]:r.NEAREST_MIPMAP_LINEAR,[Tt]:r.LINEAR,[Pa]:r.LINEAR_MIPMAP_NEAREST,[Rn]:r.LINEAR_MIPMAP_LINEAR},Q={[Cp]:r.NEVER,[Np]:r.ALWAYS,[Pp]:r.LESS,[Tf]:r.LEQUAL,[Dp]:r.EQUAL,[kp]:r.GEQUAL,[Ip]:r.GREATER,[Lp]:r.NOTEQUAL};function se(D,b){if(b.type===en&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===Tt||b.magFilter===Pa||b.magFilter===pr||b.magFilter===Rn||b.minFilter===Tt||b.minFilter===Pa||b.minFilter===pr||b.minFilter===Rn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(D,r.TEXTURE_WRAP_S,H[b.wrapS]),r.texParameteri(D,r.TEXTURE_WRAP_T,H[b.wrapT]),(D===r.TEXTURE_3D||D===r.TEXTURE_2D_ARRAY)&&r.texParameteri(D,r.TEXTURE_WRAP_R,H[b.wrapR]),r.texParameteri(D,r.TEXTURE_MAG_FILTER,K[b.magFilter]),r.texParameteri(D,r.TEXTURE_MIN_FILTER,K[b.minFilter]),b.compareFunction&&(r.texParameteri(D,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(D,r.TEXTURE_COMPARE_FUNC,Q[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Ot||b.minFilter!==pr&&b.minFilter!==Rn||b.type===en&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");r.texParameterf(D,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,i.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function we(D,b){let z=!1;D.__webglInit===void 0&&(D.__webglInit=!0,b.addEventListener("dispose",R));const Z=b.source;let ee=f.get(Z);ee===void 0&&(ee={},f.set(Z,ee));const Y=O(b);if(Y!==D.__cacheKey){ee[Y]===void 0&&(ee[Y]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,z=!0),ee[Y].usedTimes++;const Se=ee[D.__cacheKey];Se!==void 0&&(ee[D.__cacheKey].usedTimes--,Se.usedTimes===0&&M(b)),D.__cacheKey=Y,D.__webglTexture=ee[Y].texture}return z}function j(D,b,z){let Z=r.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(Z=r.TEXTURE_2D_ARRAY),b.isData3DTexture&&(Z=r.TEXTURE_3D);const ee=we(D,b),Y=b.source;t.bindTexture(Z,D.__webglTexture,r.TEXTURE0+z);const Se=n.get(Y);if(Y.version!==Se.__version||ee===!0){t.activeTexture(r.TEXTURE0+z);const ce=qe.getPrimaries(qe.workingColorSpace),pe=b.colorSpace===Ei?null:qe.getPrimaries(b.colorSpace),Ge=b.colorSpace===Ei||ce===pe?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ge);let ne=v(b.image,!1,i.maxTextureSize);ne=Ke(b,ne);const xe=s.convert(b.format,b.colorSpace),De=s.convert(b.type);let Le=y(b.internalFormat,xe,De,b.colorSpace,b.isVideoTexture);se(Z,b);let ye;const Xe=b.mipmaps,ke=b.isVideoTexture!==!0,Ze=Se.__version===void 0||ee===!0,k=Y.dataReady,oe=P(b,ne);if(b.isDepthTexture)Le=x(b.format===es,b.type),Ze&&(ke?t.texStorage2D(r.TEXTURE_2D,1,Le,ne.width,ne.height):t.texImage2D(r.TEXTURE_2D,0,Le,ne.width,ne.height,0,xe,De,null));else if(b.isDataTexture)if(Xe.length>0){ke&&Ze&&t.texStorage2D(r.TEXTURE_2D,oe,Le,Xe[0].width,Xe[0].height);for(let q=0,J=Xe.length;q<J;q++)ye=Xe[q],ke?k&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,ye.width,ye.height,xe,De,ye.data):t.texImage2D(r.TEXTURE_2D,q,Le,ye.width,ye.height,0,xe,De,ye.data);b.generateMipmaps=!1}else ke?(Ze&&t.texStorage2D(r.TEXTURE_2D,oe,Le,ne.width,ne.height),k&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ne.width,ne.height,xe,De,ne.data)):t.texImage2D(r.TEXTURE_2D,0,Le,ne.width,ne.height,0,xe,De,ne.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){ke&&Ze&&t.texStorage3D(r.TEXTURE_2D_ARRAY,oe,Le,Xe[0].width,Xe[0].height,ne.depth);for(let q=0,J=Xe.length;q<J;q++)if(ye=Xe[q],b.format!==Yt)if(xe!==null)if(ke){if(k)if(b.layerUpdates.size>0){const ve=Zh(ye.width,ye.height,b.format,b.type);for(const me of b.layerUpdates){const ze=ye.data.subarray(me*ve/ye.data.BYTES_PER_ELEMENT,(me+1)*ve/ye.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,me,ye.width,ye.height,1,xe,ze)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,0,ye.width,ye.height,ne.depth,xe,ye.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,q,Le,ye.width,ye.height,ne.depth,0,ye.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ke?k&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,q,0,0,0,ye.width,ye.height,ne.depth,xe,De,ye.data):t.texImage3D(r.TEXTURE_2D_ARRAY,q,Le,ye.width,ye.height,ne.depth,0,xe,De,ye.data)}else{ke&&Ze&&t.texStorage2D(r.TEXTURE_2D,oe,Le,Xe[0].width,Xe[0].height);for(let q=0,J=Xe.length;q<J;q++)ye=Xe[q],b.format!==Yt?xe!==null?ke?k&&t.compressedTexSubImage2D(r.TEXTURE_2D,q,0,0,ye.width,ye.height,xe,ye.data):t.compressedTexImage2D(r.TEXTURE_2D,q,Le,ye.width,ye.height,0,ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ke?k&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,ye.width,ye.height,xe,De,ye.data):t.texImage2D(r.TEXTURE_2D,q,Le,ye.width,ye.height,0,xe,De,ye.data)}else if(b.isDataArrayTexture)if(ke){if(Ze&&t.texStorage3D(r.TEXTURE_2D_ARRAY,oe,Le,ne.width,ne.height,ne.depth),k)if(b.layerUpdates.size>0){const q=Zh(ne.width,ne.height,b.format,b.type);for(const J of b.layerUpdates){const ve=ne.data.subarray(J*q/ne.data.BYTES_PER_ELEMENT,(J+1)*q/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,J,ne.width,ne.height,1,xe,De,ve)}b.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,xe,De,ne.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,Le,ne.width,ne.height,ne.depth,0,xe,De,ne.data);else if(b.isData3DTexture)ke?(Ze&&t.texStorage3D(r.TEXTURE_3D,oe,Le,ne.width,ne.height,ne.depth),k&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,xe,De,ne.data)):t.texImage3D(r.TEXTURE_3D,0,Le,ne.width,ne.height,ne.depth,0,xe,De,ne.data);else if(b.isFramebufferTexture){if(Ze)if(ke)t.texStorage2D(r.TEXTURE_2D,oe,Le,ne.width,ne.height);else{let q=ne.width,J=ne.height;for(let ve=0;ve<oe;ve++)t.texImage2D(r.TEXTURE_2D,ve,Le,q,J,0,xe,De,null),q>>=1,J>>=1}}else if(Xe.length>0){if(ke&&Ze){const q=be(Xe[0]);t.texStorage2D(r.TEXTURE_2D,oe,Le,q.width,q.height)}for(let q=0,J=Xe.length;q<J;q++)ye=Xe[q],ke?k&&t.texSubImage2D(r.TEXTURE_2D,q,0,0,xe,De,ye):t.texImage2D(r.TEXTURE_2D,q,Le,xe,De,ye);b.generateMipmaps=!1}else if(ke){if(Ze){const q=be(ne);t.texStorage2D(r.TEXTURE_2D,oe,Le,q.width,q.height)}k&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,xe,De,ne)}else t.texImage2D(r.TEXTURE_2D,0,Le,xe,De,ne);p(b)&&g(Z),Se.__version=Y.version,b.onUpdate&&b.onUpdate(b)}D.__version=b.version}function te(D,b,z){if(b.image.length!==6)return;const Z=we(D,b),ee=b.source;t.bindTexture(r.TEXTURE_CUBE_MAP,D.__webglTexture,r.TEXTURE0+z);const Y=n.get(ee);if(ee.version!==Y.__version||Z===!0){t.activeTexture(r.TEXTURE0+z);const Se=qe.getPrimaries(qe.workingColorSpace),ce=b.colorSpace===Ei?null:qe.getPrimaries(b.colorSpace),pe=b.colorSpace===Ei||Se===ce?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);const Ge=b.isCompressedTexture||b.image[0].isCompressedTexture,ne=b.image[0]&&b.image[0].isDataTexture,xe=[];for(let J=0;J<6;J++)!Ge&&!ne?xe[J]=v(b.image[J],!0,i.maxCubemapSize):xe[J]=ne?b.image[J].image:b.image[J],xe[J]=Ke(b,xe[J]);const De=xe[0],Le=s.convert(b.format,b.colorSpace),ye=s.convert(b.type),Xe=y(b.internalFormat,Le,ye,b.colorSpace),ke=b.isVideoTexture!==!0,Ze=Y.__version===void 0||Z===!0,k=ee.dataReady;let oe=P(b,De);se(r.TEXTURE_CUBE_MAP,b);let q;if(Ge){ke&&Ze&&t.texStorage2D(r.TEXTURE_CUBE_MAP,oe,Xe,De.width,De.height);for(let J=0;J<6;J++){q=xe[J].mipmaps;for(let ve=0;ve<q.length;ve++){const me=q[ve];b.format!==Yt?Le!==null?ke?k&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,0,0,me.width,me.height,Le,me.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,Xe,me.width,me.height,0,me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ke?k&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,0,0,me.width,me.height,Le,ye,me.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve,Xe,me.width,me.height,0,Le,ye,me.data)}}}else{if(q=b.mipmaps,ke&&Ze){q.length>0&&oe++;const J=be(xe[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,oe,Xe,J.width,J.height)}for(let J=0;J<6;J++)if(ne){ke?k&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,xe[J].width,xe[J].height,Le,ye,xe[J].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Xe,xe[J].width,xe[J].height,0,Le,ye,xe[J].data);for(let ve=0;ve<q.length;ve++){const ze=q[ve].image[J].image;ke?k&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,0,0,ze.width,ze.height,Le,ye,ze.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,Xe,ze.width,ze.height,0,Le,ye,ze.data)}}else{ke?k&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Le,ye,xe[J]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Xe,Le,ye,xe[J]);for(let ve=0;ve<q.length;ve++){const me=q[ve];ke?k&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,0,0,Le,ye,me.image[J]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+J,ve+1,Xe,Le,ye,me.image[J])}}}p(b)&&g(r.TEXTURE_CUBE_MAP),Y.__version=ee.version,b.onUpdate&&b.onUpdate(b)}D.__version=b.version}function le(D,b,z,Z,ee,Y){const Se=s.convert(z.format,z.colorSpace),ce=s.convert(z.type),pe=y(z.internalFormat,Se,ce,z.colorSpace),Ge=n.get(b),ne=n.get(z);if(ne.__renderTarget=b,!Ge.__hasExternalTextures){const xe=Math.max(1,b.width>>Y),De=Math.max(1,b.height>>Y);ee===r.TEXTURE_3D||ee===r.TEXTURE_2D_ARRAY?t.texImage3D(ee,Y,pe,xe,De,b.depth,0,Se,ce,null):t.texImage2D(ee,Y,pe,xe,De,0,Se,ce,null)}t.bindFramebuffer(r.FRAMEBUFFER,D),Ne(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Z,ee,ne.__webglTexture,0,Oe(b)):(ee===r.TEXTURE_2D||ee>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,Z,ee,ne.__webglTexture,Y),t.bindFramebuffer(r.FRAMEBUFFER,null)}function ie(D,b,z){if(r.bindRenderbuffer(r.RENDERBUFFER,D),b.depthBuffer){const Z=b.depthTexture,ee=Z&&Z.isDepthTexture?Z.type:null,Y=x(b.stencilBuffer,ee),Se=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ce=Oe(b);Ne(b)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ce,Y,b.width,b.height):z?r.renderbufferStorageMultisample(r.RENDERBUFFER,ce,Y,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,Y,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,Se,r.RENDERBUFFER,D)}else{const Z=b.textures;for(let ee=0;ee<Z.length;ee++){const Y=Z[ee],Se=s.convert(Y.format,Y.colorSpace),ce=s.convert(Y.type),pe=y(Y.internalFormat,Se,ce,Y.colorSpace),Ge=Oe(b);z&&Ne(b)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ge,pe,b.width,b.height):Ne(b)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ge,pe,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,pe,b.width,b.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function fe(D,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,D),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=n.get(b.depthTexture);Z.__renderTarget=b,(!Z.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),G(b.depthTexture,0);const ee=Z.__webglTexture,Y=Oe(b);if(b.depthTexture.format===Is)Ne(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ee,0,Y):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ee,0);else if(b.depthTexture.format===es)Ne(b)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ee,0,Y):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function de(D){const b=n.get(D),z=D.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==D.depthTexture){const Z=D.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),Z){const ee=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,Z.removeEventListener("dispose",ee)};Z.addEventListener("dispose",ee),b.__depthDisposeCallback=ee}b.__boundDepthTexture=Z}if(D.depthTexture&&!b.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");fe(b.__webglFramebuffer,D)}else if(z){b.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[Z]),b.__webglDepthbuffer[Z]===void 0)b.__webglDepthbuffer[Z]=r.createRenderbuffer(),ie(b.__webglDepthbuffer[Z],D,!1);else{const ee=D.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Y=b.__webglDepthbuffer[Z];r.bindRenderbuffer(r.RENDERBUFFER,Y),r.framebufferRenderbuffer(r.FRAMEBUFFER,ee,r.RENDERBUFFER,Y)}}else if(t.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=r.createRenderbuffer(),ie(b.__webglDepthbuffer,D,!1);else{const Z=D.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ee=b.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ee),r.framebufferRenderbuffer(r.FRAMEBUFFER,Z,r.RENDERBUFFER,ee)}t.bindFramebuffer(r.FRAMEBUFFER,null)}function _e(D,b,z){const Z=n.get(D);b!==void 0&&le(Z.__webglFramebuffer,D,D.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),z!==void 0&&de(D)}function et(D){const b=D.texture,z=n.get(D),Z=n.get(b);D.addEventListener("dispose",A);const ee=D.textures,Y=D.isWebGLCubeRenderTarget===!0,Se=ee.length>1;if(Se||(Z.__webglTexture===void 0&&(Z.__webglTexture=r.createTexture()),Z.__version=b.version,a.memory.textures++),Y){z.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(b.mipmaps&&b.mipmaps.length>0){z.__webglFramebuffer[ce]=[];for(let pe=0;pe<b.mipmaps.length;pe++)z.__webglFramebuffer[ce][pe]=r.createFramebuffer()}else z.__webglFramebuffer[ce]=r.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){z.__webglFramebuffer=[];for(let ce=0;ce<b.mipmaps.length;ce++)z.__webglFramebuffer[ce]=r.createFramebuffer()}else z.__webglFramebuffer=r.createFramebuffer();if(Se)for(let ce=0,pe=ee.length;ce<pe;ce++){const Ge=n.get(ee[ce]);Ge.__webglTexture===void 0&&(Ge.__webglTexture=r.createTexture(),a.memory.textures++)}if(D.samples>0&&Ne(D)===!1){z.__webglMultisampledFramebuffer=r.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let ce=0;ce<ee.length;ce++){const pe=ee[ce];z.__webglColorRenderbuffer[ce]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,z.__webglColorRenderbuffer[ce]);const Ge=s.convert(pe.format,pe.colorSpace),ne=s.convert(pe.type),xe=y(pe.internalFormat,Ge,ne,pe.colorSpace,D.isXRRenderTarget===!0),De=Oe(D);r.renderbufferStorageMultisample(r.RENDERBUFFER,De,xe,D.width,D.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ce,r.RENDERBUFFER,z.__webglColorRenderbuffer[ce])}r.bindRenderbuffer(r.RENDERBUFFER,null),D.depthBuffer&&(z.__webglDepthRenderbuffer=r.createRenderbuffer(),ie(z.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(Y){t.bindTexture(r.TEXTURE_CUBE_MAP,Z.__webglTexture),se(r.TEXTURE_CUBE_MAP,b);for(let ce=0;ce<6;ce++)if(b.mipmaps&&b.mipmaps.length>0)for(let pe=0;pe<b.mipmaps.length;pe++)le(z.__webglFramebuffer[ce][pe],D,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ce,pe);else le(z.__webglFramebuffer[ce],D,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);p(b)&&g(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Se){for(let ce=0,pe=ee.length;ce<pe;ce++){const Ge=ee[ce],ne=n.get(Ge);t.bindTexture(r.TEXTURE_2D,ne.__webglTexture),se(r.TEXTURE_2D,Ge),le(z.__webglFramebuffer,D,Ge,r.COLOR_ATTACHMENT0+ce,r.TEXTURE_2D,0),p(Ge)&&g(r.TEXTURE_2D)}t.unbindTexture()}else{let ce=r.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ce=D.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(ce,Z.__webglTexture),se(ce,b),b.mipmaps&&b.mipmaps.length>0)for(let pe=0;pe<b.mipmaps.length;pe++)le(z.__webglFramebuffer[pe],D,b,r.COLOR_ATTACHMENT0,ce,pe);else le(z.__webglFramebuffer,D,b,r.COLOR_ATTACHMENT0,ce,0);p(b)&&g(ce),t.unbindTexture()}D.depthBuffer&&de(D)}function Be(D){const b=D.textures;for(let z=0,Z=b.length;z<Z;z++){const ee=b[z];if(p(ee)){const Y=_(D),Se=n.get(ee).__webglTexture;t.bindTexture(Y,Se),g(Y),t.unbindTexture()}}}const tt=[],N=[];function yt(D){if(D.samples>0){if(Ne(D)===!1){const b=D.textures,z=D.width,Z=D.height;let ee=r.COLOR_BUFFER_BIT;const Y=D.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Se=n.get(D),ce=b.length>1;if(ce)for(let pe=0;pe<b.length;pe++)t.bindFramebuffer(r.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+pe,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,Se.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+pe,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,Se.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Se.__webglFramebuffer);for(let pe=0;pe<b.length;pe++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(ee|=r.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(ee|=r.STENCIL_BUFFER_BIT)),ce){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,Se.__webglColorRenderbuffer[pe]);const Ge=n.get(b[pe]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Ge,0)}r.blitFramebuffer(0,0,z,Z,0,0,z,Z,ee,r.NEAREST),l===!0&&(tt.length=0,N.length=0,tt.push(r.COLOR_ATTACHMENT0+pe),D.depthBuffer&&D.resolveDepthBuffer===!1&&(tt.push(Y),N.push(Y),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,N)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,tt))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),ce)for(let pe=0;pe<b.length;pe++){t.bindFramebuffer(r.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+pe,r.RENDERBUFFER,Se.__webglColorRenderbuffer[pe]);const Ge=n.get(b[pe]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,Se.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+pe,r.TEXTURE_2D,Ge,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,Se.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&l){const b=D.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[b])}}}function Oe(D){return Math.min(i.maxSamples,D.samples)}function Ne(D){const b=n.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Re(D){const b=a.render.frame;h.get(D)!==b&&(h.set(D,b),D.update())}function Ke(D,b){const z=D.colorSpace,Z=D.format,ee=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||z!==Wt&&z!==Ei&&(qe.getTransfer(z)===at?(Z!==Yt||ee!==zn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),b}function be(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(c.width=D.naturalWidth||D.width,c.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(c.width=D.displayWidth,c.height=D.displayHeight):(c.width=D.width,c.height=D.height),c}this.allocateTextureUnit=L,this.resetTextureUnits=I,this.setTexture2D=G,this.setTexture2DArray=B,this.setTexture3D=$,this.setTextureCube=V,this.rebindTextures=_e,this.setupRenderTarget=et,this.updateRenderTargetMipmap=Be,this.updateMultisampleRenderTarget=yt,this.setupDepthRenderbuffer=de,this.setupFrameBufferTexture=le,this.useMultisampledRTT=Ne}function nx(r,e){function t(n,i=Ei){let s;const a=qe.getTransfer(i);if(n===zn)return r.UNSIGNED_BYTE;if(n===uc)return r.UNSIGNED_SHORT_4_4_4_4;if(n===fc)return r.UNSIGNED_SHORT_5_5_5_1;if(n===mf)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===df)return r.BYTE;if(n===pf)return r.SHORT;if(n===Cr)return r.UNSIGNED_SHORT;if(n===hc)return r.INT;if(n===Ji)return r.UNSIGNED_INT;if(n===en)return r.FLOAT;if(n===Vt)return r.HALF_FLOAT;if(n===gf)return r.ALPHA;if(n===vf)return r.RGB;if(n===Yt)return r.RGBA;if(n===_f)return r.LUMINANCE;if(n===xf)return r.LUMINANCE_ALPHA;if(n===Is)return r.DEPTH_COMPONENT;if(n===es)return r.DEPTH_STENCIL;if(n===dc)return r.RED;if(n===pc)return r.RED_INTEGER;if(n===yf)return r.RG;if(n===mc)return r.RG_INTEGER;if(n===gc)return r.RGBA_INTEGER;if(n===Da||n===Ia||n===La||n===ka)if(a===at)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Da)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ia)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===La)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ka)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Da)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ia)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===La)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ka)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===yl||n===Ml||n===wl||n===bl)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===yl)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ml)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===wl)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===bl)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Sl||n===Tl||n===El)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Sl||n===Tl)return a===at?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===El)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Al||n===Rl||n===Cl||n===Pl||n===Dl||n===Il||n===Ll||n===kl||n===Nl||n===Ul||n===Fl||n===Ol||n===Bl||n===zl)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Al)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Rl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Cl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Pl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Dl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Il)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ll)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===kl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Nl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ul)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Fl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ol)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Bl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===zl)return a===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Na||n===Hl||n===Vl)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Na)return a===at?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Hl)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Vl)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Mf||n===Gl||n===Wl||n===Xl)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Na)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Gl)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Wl)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Xl)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Qi?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}class ix extends $t{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class It extends ct{constructor(){super(),this.isGroup=!0,this.type="Group"}}const sx={type:"move"};class Bo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new It,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new It,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new It,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const p=t.getJointPose(v,n),g=this._getHandJoint(c,v);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,m=.005;c.inputState.pinching&&f>d+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(sx)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new It;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const rx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ax=`
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

}`;class ox{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new At,s=e.properties.get(i);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new gt({vertexShader:rx,fragmentShader:ax,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ie(new En(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class lx extends ts{constructor(e,t){super();const n=this;let i=null,s=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,m=null;const v=new ox,p=t.getContextAttributes();let g=null,_=null;const y=[],x=[],P=new ae;let R=null;const A=new $t;A.viewport=new Qe;const C=new $t;C.viewport=new Qe;const M=[A,C],w=new ix;let S=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let te=y[j];return te===void 0&&(te=new Bo,y[j]=te),te.getTargetRaySpace()},this.getControllerGrip=function(j){let te=y[j];return te===void 0&&(te=new Bo,y[j]=te),te.getGripSpace()},this.getHand=function(j){let te=y[j];return te===void 0&&(te=new Bo,y[j]=te),te.getHandSpace()};function L(j){const te=x.indexOf(j.inputSource);if(te===-1)return;const le=y[te];le!==void 0&&(le.update(j.inputSource,j.frame,c||a),le.dispatchEvent({type:j.type,data:j.inputSource}))}function O(){i.removeEventListener("select",L),i.removeEventListener("selectstart",L),i.removeEventListener("selectend",L),i.removeEventListener("squeeze",L),i.removeEventListener("squeezestart",L),i.removeEventListener("squeezeend",L),i.removeEventListener("end",O),i.removeEventListener("inputsourceschange",G);for(let j=0;j<y.length;j++){const te=x[j];te!==null&&(x[j]=null,y[j].disconnect(te))}S=null,I=null,v.reset(),e.setRenderTarget(g),d=null,f=null,u=null,i=null,_=null,we.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(j){if(i=j,i!==null){if(g=e.getRenderTarget(),i.addEventListener("select",L),i.addEventListener("selectstart",L),i.addEventListener("selectend",L),i.addEventListener("squeeze",L),i.addEventListener("squeezestart",L),i.addEventListener("squeezeend",L),i.addEventListener("end",O),i.addEventListener("inputsourceschange",G),p.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(P),i.renderState.layers===void 0){const te={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,t,te),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),_=new nn(d.framebufferWidth,d.framebufferHeight,{format:Yt,type:zn,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil})}else{let te=null,le=null,ie=null;p.depth&&(ie=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=p.stencil?es:Is,le=p.stencil?Qi:Ji);const fe={colorFormat:t.RGBA8,depthFormat:ie,scaleFactor:s};u=new XRWebGLBinding(i,t),f=u.createProjectionLayer(fe),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),_=new nn(f.textureWidth,f.textureHeight,{format:Yt,type:zn,depthTexture:new wc(f.textureWidth,f.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),we.setContext(i),we.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function G(j){for(let te=0;te<j.removed.length;te++){const le=j.removed[te],ie=x.indexOf(le);ie>=0&&(x[ie]=null,y[ie].disconnect(le))}for(let te=0;te<j.added.length;te++){const le=j.added[te];let ie=x.indexOf(le);if(ie===-1){for(let de=0;de<y.length;de++)if(de>=x.length){x.push(le),ie=de;break}else if(x[de]===null){x[de]=le,ie=de;break}if(ie===-1)break}const fe=y[ie];fe&&fe.connect(le)}}const B=new T,$=new T;function V(j,te,le){B.setFromMatrixPosition(te.matrixWorld),$.setFromMatrixPosition(le.matrixWorld);const ie=B.distanceTo($),fe=te.projectionMatrix.elements,de=le.projectionMatrix.elements,_e=fe[14]/(fe[10]-1),et=fe[14]/(fe[10]+1),Be=(fe[9]+1)/fe[5],tt=(fe[9]-1)/fe[5],N=(fe[8]-1)/fe[0],yt=(de[8]+1)/de[0],Oe=_e*N,Ne=_e*yt,Re=ie/(-N+yt),Ke=Re*-N;if(te.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(Ke),j.translateZ(Re),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),fe[10]===-1)j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{const be=_e+Re,D=et+Re,b=Oe-Ke,z=Ne+(ie-Ke),Z=Be*et/D*be,ee=tt*et/D*be;j.projectionMatrix.makePerspective(b,z,Z,ee,be,D),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function H(j,te){te===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(te.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(i===null)return;let te=j.near,le=j.far;v.texture!==null&&(v.depthNear>0&&(te=v.depthNear),v.depthFar>0&&(le=v.depthFar)),w.near=C.near=A.near=te,w.far=C.far=A.far=le,(S!==w.near||I!==w.far)&&(i.updateRenderState({depthNear:w.near,depthFar:w.far}),S=w.near,I=w.far),A.layers.mask=j.layers.mask|2,C.layers.mask=j.layers.mask|4,w.layers.mask=A.layers.mask|C.layers.mask;const ie=j.parent,fe=w.cameras;H(w,ie);for(let de=0;de<fe.length;de++)H(fe[de],ie);fe.length===2?V(w,A,C):w.projectionMatrix.copy(A.projectionMatrix),K(j,w,ie)};function K(j,te,le){le===null?j.matrix.copy(te.matrixWorld):(j.matrix.copy(le.matrixWorld),j.matrix.invert(),j.matrix.multiply(te.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(te.projectionMatrix),j.projectionMatrixInverse.copy(te.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Bs*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return w},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(j){l=j,f!==null&&(f.fixedFoveation=j),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=j)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(w)};let Q=null;function se(j,te){if(h=te.getViewerPose(c||a),m=te,h!==null){const le=h.views;d!==null&&(e.setRenderTargetFramebuffer(_,d.framebuffer),e.setRenderTarget(_));let ie=!1;le.length!==w.cameras.length&&(w.cameras.length=0,ie=!0);for(let de=0;de<le.length;de++){const _e=le[de];let et=null;if(d!==null)et=d.getViewport(_e);else{const tt=u.getViewSubImage(f,_e);et=tt.viewport,de===0&&(e.setRenderTargetTextures(_,tt.colorTexture,f.ignoreDepthValues?void 0:tt.depthStencilTexture),e.setRenderTarget(_))}let Be=M[de];Be===void 0&&(Be=new $t,Be.layers.enable(de),Be.viewport=new Qe,M[de]=Be),Be.matrix.fromArray(_e.transform.matrix),Be.matrix.decompose(Be.position,Be.quaternion,Be.scale),Be.projectionMatrix.fromArray(_e.projectionMatrix),Be.projectionMatrixInverse.copy(Be.projectionMatrix).invert(),Be.viewport.set(et.x,et.y,et.width,et.height),de===0&&(w.matrix.copy(Be.matrix),w.matrix.decompose(w.position,w.quaternion,w.scale)),ie===!0&&w.cameras.push(Be)}const fe=i.enabledFeatures;if(fe&&fe.includes("depth-sensing")){const de=u.getDepthInformation(le[0]);de&&de.isValid&&de.texture&&v.init(e,de,i.renderState)}}for(let le=0;le<y.length;le++){const ie=x[le],fe=y[le];ie!==null&&fe!==void 0&&fe.update(ie,te,c||a)}Q&&Q(j,te),te.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:te}),m=null}const we=new Uf;we.setAnimationLoop(se),this.setAnimationLoop=function(j){Q=j},this.dispose=function(){}}}const Hi=new Hn,cx=new Pe;function hx(r,e){function t(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function n(p,g){g.color.getRGB(p.fogColor.value,Lf(r)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function i(p,g,_,y,x){g.isMeshBasicMaterial||g.isMeshLambertMaterial?s(p,g):g.isMeshToonMaterial?(s(p,g),u(p,g)):g.isMeshPhongMaterial?(s(p,g),h(p,g)):g.isMeshStandardMaterial?(s(p,g),f(p,g),g.isMeshPhysicalMaterial&&d(p,g,x)):g.isMeshMatcapMaterial?(s(p,g),m(p,g)):g.isMeshDepthMaterial?s(p,g):g.isMeshDistanceMaterial?(s(p,g),v(p,g)):g.isMeshNormalMaterial?s(p,g):g.isLineBasicMaterial?(a(p,g),g.isLineDashedMaterial&&o(p,g)):g.isPointsMaterial?l(p,g,_,y):g.isSpriteMaterial?c(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function s(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,t(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===Gt&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,t(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===Gt&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,t(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,t(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);const _=e.get(g),y=_.envMap,x=_.envMapRotation;y&&(p.envMap.value=y,Hi.copy(x),Hi.x*=-1,Hi.y*=-1,Hi.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Hi.y*=-1,Hi.z*=-1),p.envMapRotation.value.setFromMatrix4(cx.makeRotationFromEuler(Hi)),p.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap&&(p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,p.lightMapTransform)),g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,p.aoMapTransform))}function a(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform))}function o(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,_,y){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*_,p.scale.value=y*.5,g.map&&(p.map.value=g.map,t(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function c(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function h(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function u(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function f(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,p.roughnessMapTransform)),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function d(p,g,_){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Gt&&p.clearcoatNormalScale.value.negate())),g.dispersion>0&&(p.dispersion.value=g.dispersion),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=_.texture,p.transmissionSamplerSize.value.set(_.width,_.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,p.specularIntensityMapTransform))}function m(p,g){g.matcap&&(p.matcap.value=g.matcap)}function v(p,g){const _=e.get(g).light;p.referencePosition.value.setFromMatrixPosition(_.matrixWorld),p.nearDistance.value=_.shadow.camera.near,p.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function ux(r,e,t,n){let i={},s={},a=[];const o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,y){const x=y.program;n.uniformBlockBinding(_,x)}function c(_,y){let x=i[_.id];x===void 0&&(m(_),x=h(_),i[_.id]=x,_.addEventListener("dispose",p));const P=y.program;n.updateUBOMapping(_,P);const R=e.render.frame;s[_.id]!==R&&(f(_),s[_.id]=R)}function h(_){const y=u();_.__bindingPointIndex=y;const x=r.createBuffer(),P=_.__size,R=_.usage;return r.bindBuffer(r.UNIFORM_BUFFER,x),r.bufferData(r.UNIFORM_BUFFER,P,R),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,y,x),x}function u(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){const y=i[_.id],x=_.uniforms,P=_.__cache;r.bindBuffer(r.UNIFORM_BUFFER,y);for(let R=0,A=x.length;R<A;R++){const C=Array.isArray(x[R])?x[R]:[x[R]];for(let M=0,w=C.length;M<w;M++){const S=C[M];if(d(S,R,M,P)===!0){const I=S.__offset,L=Array.isArray(S.value)?S.value:[S.value];let O=0;for(let G=0;G<L.length;G++){const B=L[G],$=v(B);typeof B=="number"||typeof B=="boolean"?(S.__data[0]=B,r.bufferSubData(r.UNIFORM_BUFFER,I+O,S.__data)):B.isMatrix3?(S.__data[0]=B.elements[0],S.__data[1]=B.elements[1],S.__data[2]=B.elements[2],S.__data[3]=0,S.__data[4]=B.elements[3],S.__data[5]=B.elements[4],S.__data[6]=B.elements[5],S.__data[7]=0,S.__data[8]=B.elements[6],S.__data[9]=B.elements[7],S.__data[10]=B.elements[8],S.__data[11]=0):(B.toArray(S.__data,O),O+=$.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,I,S.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function d(_,y,x,P){const R=_.value,A=y+"_"+x;if(P[A]===void 0)return typeof R=="number"||typeof R=="boolean"?P[A]=R:P[A]=R.clone(),!0;{const C=P[A];if(typeof R=="number"||typeof R=="boolean"){if(C!==R)return P[A]=R,!0}else if(C.equals(R)===!1)return C.copy(R),!0}return!1}function m(_){const y=_.uniforms;let x=0;const P=16;for(let A=0,C=y.length;A<C;A++){const M=Array.isArray(y[A])?y[A]:[y[A]];for(let w=0,S=M.length;w<S;w++){const I=M[w],L=Array.isArray(I.value)?I.value:[I.value];for(let O=0,G=L.length;O<G;O++){const B=L[O],$=v(B),V=x%P,H=V%$.boundary,K=V+H;x+=H,K!==0&&P-K<$.storage&&(x+=P-K),I.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=x,x+=$.storage}}}const R=x%P;return R>0&&(x+=P-R),_.__size=x,_.__cache={},this}function v(_){const y={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(y.boundary=4,y.storage=4):_.isVector2?(y.boundary=8,y.storage=8):_.isVector3||_.isColor?(y.boundary=16,y.storage=12):_.isVector4?(y.boundary=16,y.storage=16):_.isMatrix3?(y.boundary=48,y.storage=48):_.isMatrix4?(y.boundary=64,y.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),y}function p(_){const y=_.target;y.removeEventListener("dispose",p);const x=a.indexOf(y.__bindingPointIndex);a.splice(x,1),r.deleteBuffer(i[y.id]),delete i[y.id],delete s[y.id]}function g(){for(const _ in i)r.deleteBuffer(i[_]);a=[],i={},s={}}return{bind:l,update:c,dispose:g}}class fx{constructor(e={}){const{canvas:t=Jp(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const m=new Uint32Array(4),v=new Int32Array(4);let p=null,g=null;const _=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=ut,this.toneMapping=Ii,this.toneMappingExposure=1;const x=this;let P=!1,R=0,A=0,C=null,M=-1,w=null;const S=new Qe,I=new Qe;let L=null;const O=new ue(0);let G=0,B=t.width,$=t.height,V=1,H=null,K=null;const Q=new Qe(0,0,B,$),se=new Qe(0,0,B,$);let we=!1;const j=new yc;let te=!1,le=!1;const ie=new Pe,fe=new Pe,de=new T,_e=new Qe,et={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Be=!1;function tt(){return C===null?V:1}let N=n;function yt(E,U){return t.getContext(E,U)}try{const E={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${lc}`),t.addEventListener("webglcontextlost",J,!1),t.addEventListener("webglcontextrestored",ve,!1),t.addEventListener("webglcontextcreationerror",me,!1),N===null){const U="webgl2";if(N=yt(U,E),N===null)throw yt(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Oe,Ne,Re,Ke,be,D,b,z,Z,ee,Y,Se,ce,pe,Ge,ne,xe,De,Le,ye,Xe,ke,Ze,k;function oe(){Oe=new vv(N),Oe.init(),ke=new nx(N,Oe),Ne=new uv(N,Oe,e,ke),Re=new Q_(N,Oe),Ne.reverseDepthBuffer&&f&&Re.buffers.depth.setReversed(!0),Ke=new yv(N),be=new O_,D=new tx(N,Oe,Re,be,Ne,ke,Ke),b=new dv(x),z=new gv(x),Z=new Am(N),Ze=new cv(N,Z),ee=new _v(N,Z,Ke,Ze),Y=new wv(N,ee,Z,Ke),Le=new Mv(N,Ne,D),ne=new fv(be),Se=new F_(x,b,z,Oe,Ne,Ze,ne),ce=new hx(x,be),pe=new z_,Ge=new q_(Oe),De=new lv(x,b,z,Re,Y,d,l),xe=new Z_(x,Y,Ne),k=new ux(N,Ke,Ne,Re),ye=new hv(N,Oe,Ke),Xe=new xv(N,Oe,Ke),Ke.programs=Se.programs,x.capabilities=Ne,x.extensions=Oe,x.properties=be,x.renderLists=pe,x.shadowMap=xe,x.state=Re,x.info=Ke}oe();const q=new lx(x,N);this.xr=q,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const E=Oe.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Oe.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(E){E!==void 0&&(V=E,this.setSize(B,$,!1))},this.getSize=function(E){return E.set(B,$)},this.setSize=function(E,U,W=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}B=E,$=U,t.width=Math.floor(E*V),t.height=Math.floor(U*V),W===!0&&(t.style.width=E+"px",t.style.height=U+"px"),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(B*V,$*V).floor()},this.setDrawingBufferSize=function(E,U,W){B=E,$=U,V=W,t.width=Math.floor(E*W),t.height=Math.floor(U*W),this.setViewport(0,0,E,U)},this.getCurrentViewport=function(E){return E.copy(S)},this.getViewport=function(E){return E.copy(Q)},this.setViewport=function(E,U,W,X){E.isVector4?Q.set(E.x,E.y,E.z,E.w):Q.set(E,U,W,X),Re.viewport(S.copy(Q).multiplyScalar(V).round())},this.getScissor=function(E){return E.copy(se)},this.setScissor=function(E,U,W,X){E.isVector4?se.set(E.x,E.y,E.z,E.w):se.set(E,U,W,X),Re.scissor(I.copy(se).multiplyScalar(V).round())},this.getScissorTest=function(){return we},this.setScissorTest=function(E){Re.setScissorTest(we=E)},this.setOpaqueSort=function(E){H=E},this.setTransparentSort=function(E){K=E},this.getClearColor=function(E){return E.copy(De.getClearColor())},this.setClearColor=function(){De.setClearColor.apply(De,arguments)},this.getClearAlpha=function(){return De.getClearAlpha()},this.setClearAlpha=function(){De.setClearAlpha.apply(De,arguments)},this.clear=function(E=!0,U=!0,W=!0){let X=0;if(E){let F=!1;if(C!==null){const re=C.texture.format;F=re===gc||re===mc||re===pc}if(F){const re=C.texture.type,ge=re===zn||re===Ji||re===Cr||re===Qi||re===uc||re===fc,Te=De.getClearColor(),Ee=De.getClearAlpha(),Ue=Te.r,He=Te.g,Ae=Te.b;ge?(m[0]=Ue,m[1]=He,m[2]=Ae,m[3]=Ee,N.clearBufferuiv(N.COLOR,0,m)):(v[0]=Ue,v[1]=He,v[2]=Ae,v[3]=Ee,N.clearBufferiv(N.COLOR,0,v))}else X|=N.COLOR_BUFFER_BIT}U&&(X|=N.DEPTH_BUFFER_BIT),W&&(X|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",J,!1),t.removeEventListener("webglcontextrestored",ve,!1),t.removeEventListener("webglcontextcreationerror",me,!1),pe.dispose(),Ge.dispose(),be.dispose(),b.dispose(),z.dispose(),Y.dispose(),Ze.dispose(),k.dispose(),Se.dispose(),q.dispose(),q.removeEventListener("sessionstart",Fc),q.removeEventListener("sessionend",Oc),Ni.stop()};function J(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),P=!0}function ve(){console.log("THREE.WebGLRenderer: Context Restored."),P=!1;const E=Ke.autoReset,U=xe.enabled,W=xe.autoUpdate,X=xe.needsUpdate,F=xe.type;oe(),Ke.autoReset=E,xe.enabled=U,xe.autoUpdate=W,xe.needsUpdate=X,xe.type=F}function me(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function ze(E){const U=E.target;U.removeEventListener("dispose",ze),_t(U)}function _t(E){Bt(E),be.remove(E)}function Bt(E){const U=be.get(E).programs;U!==void 0&&(U.forEach(function(W){Se.releaseProgram(W)}),E.isShaderMaterial&&Se.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,W,X,F,re){U===null&&(U=et);const ge=F.isMesh&&F.matrixWorld.determinant()<0,Te=hd(E,U,W,X,F);Re.setMaterial(X,ge);let Ee=W.index,Ue=1;if(X.wireframe===!0){if(Ee=ee.getWireframeAttribute(W),Ee===void 0)return;Ue=2}const He=W.drawRange,Ae=W.attributes.position;let Je=He.start*Ue,ht=(He.start+He.count)*Ue;re!==null&&(Je=Math.max(Je,re.start*Ue),ht=Math.min(ht,(re.start+re.count)*Ue)),Ee!==null?(Je=Math.max(Je,0),ht=Math.min(ht,Ee.count)):Ae!=null&&(Je=Math.max(Je,0),ht=Math.min(ht,Ae.count));const ft=ht-Je;if(ft<0||ft===1/0)return;Ze.setup(F,X,Te,W,Ee);let Kt,nt=ye;if(Ee!==null&&(Kt=Z.get(Ee),nt=Xe,nt.setIndex(Kt)),F.isMesh)X.wireframe===!0?(Re.setLineWidth(X.wireframeLinewidth*tt()),nt.setMode(N.LINES)):nt.setMode(N.TRIANGLES);else if(F.isLine){let Ce=X.linewidth;Ce===void 0&&(Ce=1),Re.setLineWidth(Ce*tt()),F.isLineSegments?nt.setMode(N.LINES):F.isLineLoop?nt.setMode(N.LINE_LOOP):nt.setMode(N.LINE_STRIP)}else F.isPoints?nt.setMode(N.POINTS):F.isSprite&&nt.setMode(N.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)nt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Oe.get("WEBGL_multi_draw"))nt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Ce=F._multiDrawStarts,qn=F._multiDrawCounts,it=F._multiDrawCount,xn=Ee?Z.get(Ee).bytesPerElement:1,rs=be.get(X).currentProgram.getUniforms();for(let sn=0;sn<it;sn++)rs.setValue(N,"_gl_DrawID",sn),nt.render(Ce[sn]/xn,qn[sn])}else if(F.isInstancedMesh)nt.renderInstances(Je,ft,F.count);else if(W.isInstancedBufferGeometry){const Ce=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,qn=Math.min(W.instanceCount,Ce);nt.renderInstances(Je,ft,qn)}else nt.render(Je,ft)};function rt(E,U,W){E.transparent===!0&&E.side===mt&&E.forceSinglePass===!1?(E.side=Gt,E.needsUpdate=!0,Ur(E,U,W),E.side=ci,E.needsUpdate=!0,Ur(E,U,W),E.side=mt):Ur(E,U,W)}this.compile=function(E,U,W=null){W===null&&(W=E),g=Ge.get(W),g.init(U),y.push(g),W.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(g.pushLight(F),F.castShadow&&g.pushShadow(F))}),E!==W&&E.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(g.pushLight(F),F.castShadow&&g.pushShadow(F))}),g.setupLights();const X=new Set;return E.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const re=F.material;if(re)if(Array.isArray(re))for(let ge=0;ge<re.length;ge++){const Te=re[ge];rt(Te,W,F),X.add(Te)}else rt(re,W,F),X.add(re)}),y.pop(),g=null,X},this.compileAsync=function(E,U,W=null){const X=this.compile(E,U,W);return new Promise(F=>{function re(){if(X.forEach(function(ge){be.get(ge).currentProgram.isReady()&&X.delete(ge)}),X.size===0){F(E);return}setTimeout(re,10)}Oe.get("KHR_parallel_shader_compile")!==null?re():setTimeout(re,10)})};let _n=null;function Xn(E){_n&&_n(E)}function Fc(){Ni.stop()}function Oc(){Ni.start()}const Ni=new Uf;Ni.setAnimationLoop(Xn),typeof self<"u"&&Ni.setContext(self),this.setAnimationLoop=function(E){_n=E,q.setAnimationLoop(E),E===null?Ni.stop():Ni.start()},q.addEventListener("sessionstart",Fc),q.addEventListener("sessionend",Oc),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(U),U=q.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,U,C),g=Ge.get(E,y.length),g.init(U),y.push(g),fe.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),j.setFromProjectionMatrix(fe),le=this.localClippingEnabled,te=ne.init(this.clippingPlanes,le),p=pe.get(E,_.length),p.init(),_.push(p),q.enabled===!0&&q.isPresenting===!0){const re=x.xr.getDepthSensingMesh();re!==null&&lo(re,U,-1/0,x.sortObjects)}lo(E,U,0,x.sortObjects),p.finish(),x.sortObjects===!0&&p.sort(H,K),Be=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,Be&&De.addToRenderList(p,E),this.info.render.frame++,te===!0&&ne.beginShadows();const W=g.state.shadowsArray;xe.render(W,E,U),te===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();const X=p.opaque,F=p.transmissive;if(g.setupLights(),U.isArrayCamera){const re=U.cameras;if(F.length>0)for(let ge=0,Te=re.length;ge<Te;ge++){const Ee=re[ge];zc(X,F,E,Ee)}Be&&De.render(E);for(let ge=0,Te=re.length;ge<Te;ge++){const Ee=re[ge];Bc(p,E,Ee,Ee.viewport)}}else F.length>0&&zc(X,F,E,U),Be&&De.render(E),Bc(p,E,U);C!==null&&(D.updateMultisampleRenderTarget(C),D.updateRenderTargetMipmap(C)),E.isScene===!0&&E.onAfterRender(x,E,U),Ze.resetDefaultState(),M=-1,w=null,y.pop(),y.length>0?(g=y[y.length-1],te===!0&&ne.setGlobalState(x.clippingPlanes,g.state.camera)):g=null,_.pop(),_.length>0?p=_[_.length-1]:p=null};function lo(E,U,W,X){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)W=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLight)g.pushLight(E),E.castShadow&&g.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||j.intersectsSprite(E)){X&&_e.setFromMatrixPosition(E.matrixWorld).applyMatrix4(fe);const ge=Y.update(E),Te=E.material;Te.visible&&p.push(E,ge,Te,W,_e.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||j.intersectsObject(E))){const ge=Y.update(E),Te=E.material;if(X&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),_e.copy(E.boundingSphere.center)):(ge.boundingSphere===null&&ge.computeBoundingSphere(),_e.copy(ge.boundingSphere.center)),_e.applyMatrix4(E.matrixWorld).applyMatrix4(fe)),Array.isArray(Te)){const Ee=ge.groups;for(let Ue=0,He=Ee.length;Ue<He;Ue++){const Ae=Ee[Ue],Je=Te[Ae.materialIndex];Je&&Je.visible&&p.push(E,ge,Je,W,_e.z,Ae)}}else Te.visible&&p.push(E,ge,Te,W,_e.z,null)}}const re=E.children;for(let ge=0,Te=re.length;ge<Te;ge++)lo(re[ge],U,W,X)}function Bc(E,U,W,X){const F=E.opaque,re=E.transmissive,ge=E.transparent;g.setupLightsView(W),te===!0&&ne.setGlobalState(x.clippingPlanes,W),X&&Re.viewport(S.copy(X)),F.length>0&&Nr(F,U,W),re.length>0&&Nr(re,U,W),ge.length>0&&Nr(ge,U,W),Re.buffers.depth.setTest(!0),Re.buffers.depth.setMask(!0),Re.buffers.color.setMask(!0),Re.setPolygonOffset(!1)}function zc(E,U,W,X){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[X.id]===void 0&&(g.state.transmissionRenderTarget[X.id]=new nn(1,1,{generateMipmaps:!0,type:Oe.has("EXT_color_buffer_half_float")||Oe.has("EXT_color_buffer_float")?Vt:zn,minFilter:Rn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qe.workingColorSpace}));const re=g.state.transmissionRenderTarget[X.id],ge=X.viewport||S;re.setSize(ge.z,ge.w);const Te=x.getRenderTarget();x.setRenderTarget(re),x.getClearColor(O),G=x.getClearAlpha(),G<1&&x.setClearColor(16777215,.5),x.clear(),Be&&De.render(W);const Ee=x.toneMapping;x.toneMapping=Ii;const Ue=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),g.setupLightsView(X),te===!0&&ne.setGlobalState(x.clippingPlanes,X),Nr(E,W,X),D.updateMultisampleRenderTarget(re),D.updateRenderTargetMipmap(re),Oe.has("WEBGL_multisampled_render_to_texture")===!1){let He=!1;for(let Ae=0,Je=U.length;Ae<Je;Ae++){const ht=U[Ae],ft=ht.object,Kt=ht.geometry,nt=ht.material,Ce=ht.group;if(nt.side===mt&&ft.layers.test(X.layers)){const qn=nt.side;nt.side=Gt,nt.needsUpdate=!0,Hc(ft,W,X,Kt,nt,Ce),nt.side=qn,nt.needsUpdate=!0,He=!0}}He===!0&&(D.updateMultisampleRenderTarget(re),D.updateRenderTargetMipmap(re))}x.setRenderTarget(Te),x.setClearColor(O,G),Ue!==void 0&&(X.viewport=Ue),x.toneMapping=Ee}function Nr(E,U,W){const X=U.isScene===!0?U.overrideMaterial:null;for(let F=0,re=E.length;F<re;F++){const ge=E[F],Te=ge.object,Ee=ge.geometry,Ue=X===null?ge.material:X,He=ge.group;Te.layers.test(W.layers)&&Hc(Te,U,W,Ee,Ue,He)}}function Hc(E,U,W,X,F,re){E.onBeforeRender(x,U,W,X,F,re),E.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),F.onBeforeRender(x,U,W,X,E,re),F.transparent===!0&&F.side===mt&&F.forceSinglePass===!1?(F.side=Gt,F.needsUpdate=!0,x.renderBufferDirect(W,U,X,F,E,re),F.side=ci,F.needsUpdate=!0,x.renderBufferDirect(W,U,X,F,E,re),F.side=mt):x.renderBufferDirect(W,U,X,F,E,re),E.onAfterRender(x,U,W,X,F,re)}function Ur(E,U,W){U.isScene!==!0&&(U=et);const X=be.get(E),F=g.state.lights,re=g.state.shadowsArray,ge=F.state.version,Te=Se.getParameters(E,F.state,re,U,W),Ee=Se.getProgramCacheKey(Te);let Ue=X.programs;X.environment=E.isMeshStandardMaterial?U.environment:null,X.fog=U.fog,X.envMap=(E.isMeshStandardMaterial?z:b).get(E.envMap||X.environment),X.envMapRotation=X.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,Ue===void 0&&(E.addEventListener("dispose",ze),Ue=new Map,X.programs=Ue);let He=Ue.get(Ee);if(He!==void 0){if(X.currentProgram===He&&X.lightsStateVersion===ge)return Gc(E,Te),He}else Te.uniforms=Se.getUniforms(E),E.onBeforeCompile(Te,x),He=Se.acquireProgram(Te,Ee),Ue.set(Ee,He),X.uniforms=Te.uniforms;const Ae=X.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ae.clippingPlanes=ne.uniform),Gc(E,Te),X.needsLights=fd(E),X.lightsStateVersion=ge,X.needsLights&&(Ae.ambientLightColor.value=F.state.ambient,Ae.lightProbe.value=F.state.probe,Ae.directionalLights.value=F.state.directional,Ae.directionalLightShadows.value=F.state.directionalShadow,Ae.spotLights.value=F.state.spot,Ae.spotLightShadows.value=F.state.spotShadow,Ae.rectAreaLights.value=F.state.rectArea,Ae.ltc_1.value=F.state.rectAreaLTC1,Ae.ltc_2.value=F.state.rectAreaLTC2,Ae.pointLights.value=F.state.point,Ae.pointLightShadows.value=F.state.pointShadow,Ae.hemisphereLights.value=F.state.hemi,Ae.directionalShadowMap.value=F.state.directionalShadowMap,Ae.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ae.spotShadowMap.value=F.state.spotShadowMap,Ae.spotLightMatrix.value=F.state.spotLightMatrix,Ae.spotLightMap.value=F.state.spotLightMap,Ae.pointShadowMap.value=F.state.pointShadowMap,Ae.pointShadowMatrix.value=F.state.pointShadowMatrix),X.currentProgram=He,X.uniformsList=null,He}function Vc(E){if(E.uniformsList===null){const U=E.currentProgram.getUniforms();E.uniformsList=Ua.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function Gc(E,U){const W=be.get(E);W.outputColorSpace=U.outputColorSpace,W.batching=U.batching,W.batchingColor=U.batchingColor,W.instancing=U.instancing,W.instancingColor=U.instancingColor,W.instancingMorph=U.instancingMorph,W.skinning=U.skinning,W.morphTargets=U.morphTargets,W.morphNormals=U.morphNormals,W.morphColors=U.morphColors,W.morphTargetsCount=U.morphTargetsCount,W.numClippingPlanes=U.numClippingPlanes,W.numIntersection=U.numClipIntersection,W.vertexAlphas=U.vertexAlphas,W.vertexTangents=U.vertexTangents,W.toneMapping=U.toneMapping}function hd(E,U,W,X,F){U.isScene!==!0&&(U=et),D.resetTextureUnits();const re=U.fog,ge=X.isMeshStandardMaterial?U.environment:null,Te=C===null?x.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Wt,Ee=(X.isMeshStandardMaterial?z:b).get(X.envMap||ge),Ue=X.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,He=!!W.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),Ae=!!W.morphAttributes.position,Je=!!W.morphAttributes.normal,ht=!!W.morphAttributes.color;let ft=Ii;X.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(ft=x.toneMapping);const Kt=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,nt=Kt!==void 0?Kt.length:0,Ce=be.get(X),qn=g.state.lights;if(te===!0&&(le===!0||E!==w)){const hn=E===w&&X.id===M;ne.setState(X,E,hn)}let it=!1;X.version===Ce.__version?(Ce.needsLights&&Ce.lightsStateVersion!==qn.state.version||Ce.outputColorSpace!==Te||F.isBatchedMesh&&Ce.batching===!1||!F.isBatchedMesh&&Ce.batching===!0||F.isBatchedMesh&&Ce.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Ce.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Ce.instancing===!1||!F.isInstancedMesh&&Ce.instancing===!0||F.isSkinnedMesh&&Ce.skinning===!1||!F.isSkinnedMesh&&Ce.skinning===!0||F.isInstancedMesh&&Ce.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Ce.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Ce.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Ce.instancingMorph===!1&&F.morphTexture!==null||Ce.envMap!==Ee||X.fog===!0&&Ce.fog!==re||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==ne.numPlanes||Ce.numIntersection!==ne.numIntersection)||Ce.vertexAlphas!==Ue||Ce.vertexTangents!==He||Ce.morphTargets!==Ae||Ce.morphNormals!==Je||Ce.morphColors!==ht||Ce.toneMapping!==ft||Ce.morphTargetsCount!==nt)&&(it=!0):(it=!0,Ce.__version=X.version);let xn=Ce.currentProgram;it===!0&&(xn=Ur(X,U,F));let rs=!1,sn=!1,Ys=!1;const dt=xn.getUniforms(),In=Ce.uniforms;if(Re.useProgram(xn.program)&&(rs=!0,sn=!0,Ys=!0),X.id!==M&&(M=X.id,sn=!0),rs||w!==E){Re.buffers.depth.getReversed()?(ie.copy(E.projectionMatrix),em(ie),tm(ie),dt.setValue(N,"projectionMatrix",ie)):dt.setValue(N,"projectionMatrix",E.projectionMatrix),dt.setValue(N,"viewMatrix",E.matrixWorldInverse);const ui=dt.map.cameraPosition;ui!==void 0&&ui.setValue(N,de.setFromMatrixPosition(E.matrixWorld)),Ne.logarithmicDepthBuffer&&dt.setValue(N,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&dt.setValue(N,"isOrthographic",E.isOrthographicCamera===!0),w!==E&&(w=E,sn=!0,Ys=!0)}if(F.isSkinnedMesh){dt.setOptional(N,F,"bindMatrix"),dt.setOptional(N,F,"bindMatrixInverse");const hn=F.skeleton;hn&&(hn.boneTexture===null&&hn.computeBoneTexture(),dt.setValue(N,"boneTexture",hn.boneTexture,D))}F.isBatchedMesh&&(dt.setOptional(N,F,"batchingTexture"),dt.setValue(N,"batchingTexture",F._matricesTexture,D),dt.setOptional(N,F,"batchingIdTexture"),dt.setValue(N,"batchingIdTexture",F._indirectTexture,D),dt.setOptional(N,F,"batchingColorTexture"),F._colorsTexture!==null&&dt.setValue(N,"batchingColorTexture",F._colorsTexture,D));const Ks=W.morphAttributes;if((Ks.position!==void 0||Ks.normal!==void 0||Ks.color!==void 0)&&Le.update(F,W,xn),(sn||Ce.receiveShadow!==F.receiveShadow)&&(Ce.receiveShadow=F.receiveShadow,dt.setValue(N,"receiveShadow",F.receiveShadow)),X.isMeshGouraudMaterial&&X.envMap!==null&&(In.envMap.value=Ee,In.flipEnvMap.value=Ee.isCubeTexture&&Ee.isRenderTargetTexture===!1?-1:1),X.isMeshStandardMaterial&&X.envMap===null&&U.environment!==null&&(In.envMapIntensity.value=U.environmentIntensity),sn&&(dt.setValue(N,"toneMappingExposure",x.toneMappingExposure),Ce.needsLights&&ud(In,Ys),re&&X.fog===!0&&ce.refreshFogUniforms(In,re),ce.refreshMaterialUniforms(In,X,V,$,g.state.transmissionRenderTarget[E.id]),Ua.upload(N,Vc(Ce),In,D)),X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(Ua.upload(N,Vc(Ce),In,D),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&dt.setValue(N,"center",F.center),dt.setValue(N,"modelViewMatrix",F.modelViewMatrix),dt.setValue(N,"normalMatrix",F.normalMatrix),dt.setValue(N,"modelMatrix",F.matrixWorld),X.isShaderMaterial||X.isRawShaderMaterial){const hn=X.uniformsGroups;for(let ui=0,fi=hn.length;ui<fi;ui++){const Wc=hn[ui];k.update(Wc,xn),k.bind(Wc,xn)}}return xn}function ud(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function fd(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(E,U,W){be.get(E.texture).__webglTexture=U,be.get(E.depthTexture).__webglTexture=W;const X=be.get(E);X.__hasExternalTextures=!0,X.__autoAllocateDepthBuffer=W===void 0,X.__autoAllocateDepthBuffer||Oe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),X.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,U){const W=be.get(E);W.__webglFramebuffer=U,W.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,W=0){C=E,R=U,A=W;let X=!0,F=null,re=!1,ge=!1;if(E){const Ee=be.get(E);if(Ee.__useDefaultFramebuffer!==void 0)Re.bindFramebuffer(N.FRAMEBUFFER,null),X=!1;else if(Ee.__webglFramebuffer===void 0)D.setupRenderTarget(E);else if(Ee.__hasExternalTextures)D.rebindTextures(E,be.get(E.texture).__webglTexture,be.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Ae=E.depthTexture;if(Ee.__boundDepthTexture!==Ae){if(Ae!==null&&be.has(Ae)&&(E.width!==Ae.image.width||E.height!==Ae.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");D.setupDepthRenderbuffer(E)}}const Ue=E.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(ge=!0);const He=be.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(He[U])?F=He[U][W]:F=He[U],re=!0):E.samples>0&&D.useMultisampledRTT(E)===!1?F=be.get(E).__webglMultisampledFramebuffer:Array.isArray(He)?F=He[W]:F=He,S.copy(E.viewport),I.copy(E.scissor),L=E.scissorTest}else S.copy(Q).multiplyScalar(V).floor(),I.copy(se).multiplyScalar(V).floor(),L=we;if(Re.bindFramebuffer(N.FRAMEBUFFER,F)&&X&&Re.drawBuffers(E,F),Re.viewport(S),Re.scissor(I),Re.setScissorTest(L),re){const Ee=be.get(E.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+U,Ee.__webglTexture,W)}else if(ge){const Ee=be.get(E.texture),Ue=U||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ee.__webglTexture,W||0,Ue)}M=-1},this.readRenderTargetPixels=function(E,U,W,X,F,re,ge){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=be.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ge!==void 0&&(Te=Te[ge]),Te){Re.bindFramebuffer(N.FRAMEBUFFER,Te);try{const Ee=E.texture,Ue=Ee.format,He=Ee.type;if(!Ne.textureFormatReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ne.textureTypeReadable(He)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-X&&W>=0&&W<=E.height-F&&N.readPixels(U,W,X,F,ke.convert(Ue),ke.convert(He),re)}finally{const Ee=C!==null?be.get(C).__webglFramebuffer:null;Re.bindFramebuffer(N.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(E,U,W,X,F,re,ge){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=be.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ge!==void 0&&(Te=Te[ge]),Te){const Ee=E.texture,Ue=Ee.format,He=Ee.type;if(!Ne.textureFormatReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ne.textureTypeReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=E.width-X&&W>=0&&W<=E.height-F){Re.bindFramebuffer(N.FRAMEBUFFER,Te);const Ae=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Ae),N.bufferData(N.PIXEL_PACK_BUFFER,re.byteLength,N.STREAM_READ),N.readPixels(U,W,X,F,ke.convert(Ue),ke.convert(He),0);const Je=C!==null?be.get(C).__webglFramebuffer:null;Re.bindFramebuffer(N.FRAMEBUFFER,Je);const ht=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Qp(N,ht,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Ae),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,re),N.deleteBuffer(Ae),N.deleteSync(ht),re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,U=null,W=0){E.isTexture!==!0&&(mr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,E=arguments[1]);const X=Math.pow(2,-W),F=Math.floor(E.image.width*X),re=Math.floor(E.image.height*X),ge=U!==null?U.x:0,Te=U!==null?U.y:0;D.setTexture2D(E,0),N.copyTexSubImage2D(N.TEXTURE_2D,W,0,0,ge,Te,F,re),Re.unbindTexture()},this.copyTextureToTexture=function(E,U,W=null,X=null,F=0){E.isTexture!==!0&&(mr("WebGLRenderer: copyTextureToTexture function signature has changed."),X=arguments[0]||null,E=arguments[1],U=arguments[2],F=arguments[3]||0,W=null);let re,ge,Te,Ee,Ue,He,Ae,Je,ht;const ft=E.isCompressedTexture?E.mipmaps[F]:E.image;W!==null?(re=W.max.x-W.min.x,ge=W.max.y-W.min.y,Te=W.isBox3?W.max.z-W.min.z:1,Ee=W.min.x,Ue=W.min.y,He=W.isBox3?W.min.z:0):(re=ft.width,ge=ft.height,Te=ft.depth||1,Ee=0,Ue=0,He=0),X!==null?(Ae=X.x,Je=X.y,ht=X.z):(Ae=0,Je=0,ht=0);const Kt=ke.convert(U.format),nt=ke.convert(U.type);let Ce;U.isData3DTexture?(D.setTexture3D(U,0),Ce=N.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(D.setTexture2DArray(U,0),Ce=N.TEXTURE_2D_ARRAY):(D.setTexture2D(U,0),Ce=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,U.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,U.unpackAlignment);const qn=N.getParameter(N.UNPACK_ROW_LENGTH),it=N.getParameter(N.UNPACK_IMAGE_HEIGHT),xn=N.getParameter(N.UNPACK_SKIP_PIXELS),rs=N.getParameter(N.UNPACK_SKIP_ROWS),sn=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,ft.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ft.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Ee),N.pixelStorei(N.UNPACK_SKIP_ROWS,Ue),N.pixelStorei(N.UNPACK_SKIP_IMAGES,He);const Ys=E.isDataArrayTexture||E.isData3DTexture,dt=U.isDataArrayTexture||U.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){const In=be.get(E),Ks=be.get(U),hn=be.get(In.__renderTarget),ui=be.get(Ks.__renderTarget);Re.bindFramebuffer(N.READ_FRAMEBUFFER,hn.__webglFramebuffer),Re.bindFramebuffer(N.DRAW_FRAMEBUFFER,ui.__webglFramebuffer);for(let fi=0;fi<Te;fi++)Ys&&N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,be.get(E).__webglTexture,F,He+fi),E.isDepthTexture?(dt&&N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,be.get(U).__webglTexture,F,ht+fi),N.blitFramebuffer(Ee,Ue,re,ge,Ae,Je,re,ge,N.DEPTH_BUFFER_BIT,N.NEAREST)):dt?N.copyTexSubImage3D(Ce,F,Ae,Je,ht+fi,Ee,Ue,re,ge):N.copyTexSubImage2D(Ce,F,Ae,Je,ht+fi,Ee,Ue,re,ge);Re.bindFramebuffer(N.READ_FRAMEBUFFER,null),Re.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else dt?E.isDataTexture||E.isData3DTexture?N.texSubImage3D(Ce,F,Ae,Je,ht,re,ge,Te,Kt,nt,ft.data):U.isCompressedArrayTexture?N.compressedTexSubImage3D(Ce,F,Ae,Je,ht,re,ge,Te,Kt,ft.data):N.texSubImage3D(Ce,F,Ae,Je,ht,re,ge,Te,Kt,nt,ft):E.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,F,Ae,Je,re,ge,Kt,nt,ft.data):E.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,F,Ae,Je,ft.width,ft.height,Kt,ft.data):N.texSubImage2D(N.TEXTURE_2D,F,Ae,Je,re,ge,Kt,nt,ft);N.pixelStorei(N.UNPACK_ROW_LENGTH,qn),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,it),N.pixelStorei(N.UNPACK_SKIP_PIXELS,xn),N.pixelStorei(N.UNPACK_SKIP_ROWS,rs),N.pixelStorei(N.UNPACK_SKIP_IMAGES,sn),F===0&&U.generateMipmaps&&N.generateMipmap(Ce),Re.unbindTexture()},this.copyTextureToTexture3D=function(E,U,W=null,X=null,F=0){return E.isTexture!==!0&&(mr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),W=arguments[0]||null,X=arguments[1]||null,E=arguments[2],U=arguments[3],F=arguments[4]||0),mr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,U,W,X,F)},this.initRenderTarget=function(E){be.get(E).__webglFramebuffer===void 0&&D.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?D.setTextureCube(E,0):E.isData3DTexture?D.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?D.setTexture2DArray(E,0):D.setTexture2D(E,0),Re.unbindTexture()},this.resetState=function(){R=0,A=0,C=null,Re.reset(),Ze.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ai}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=qe._getUnpackColorSpace()}}class bc{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new ue(e),this.density=t}clone(){return new bc(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Kl extends ct{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Hn,this.environmentIntensity=1,this.environmentRotation=new Hn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Hf{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=jl,this.updateRanges=[],this.version=0,this.uuid=Cn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Cn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Cn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const qt=new T;class Lr{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix4(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyNormalMatrix(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.transformDirection(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ot(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Sn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Sn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Sn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Sn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array),i=ot(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),n=ot(n,this.array),i=ot(i,this.array),s=ot(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new wt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Lr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Vf extends gn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new ue(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Ms;const tr=new T,ws=new T,bs=new T,Ss=new ae,nr=new ae,Gf=new Pe,ua=new T,ir=new T,fa=new T,Jh=new ae,zo=new ae,Qh=new ae;class dx extends ct{constructor(e=new Vf){if(super(),this.isSprite=!0,this.type="Sprite",Ms===void 0){Ms=new vt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Hf(t,5);Ms.setIndex([0,1,2,0,2,3]),Ms.setAttribute("position",new Lr(n,3,0,!1)),Ms.setAttribute("uv",new Lr(n,2,3,!1))}this.geometry=Ms,this.material=e,this.center=new ae(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ws.setFromMatrixScale(this.matrixWorld),Gf.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),bs.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ws.multiplyScalar(-bs.z);const n=this.material.rotation;let i,s;n!==0&&(s=Math.cos(n),i=Math.sin(n));const a=this.center;da(ua.set(-.5,-.5,0),bs,a,ws,i,s),da(ir.set(.5,-.5,0),bs,a,ws,i,s),da(fa.set(.5,.5,0),bs,a,ws,i,s),Jh.set(0,0),zo.set(1,0),Qh.set(1,1);let o=e.ray.intersectTriangle(ua,ir,fa,!1,tr);if(o===null&&(da(ir.set(-.5,.5,0),bs,a,ws,i,s),zo.set(0,1),o=e.ray.intersectTriangle(ua,fa,ir,!1,tr),o===null))return;const l=e.ray.origin.distanceTo(tr);l<e.near||l>e.far||t.push({distance:l,point:tr.clone(),uv:mn.getInterpolation(tr,ua,ir,fa,Jh,zo,Qh,new ae),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function da(r,e,t,n,i,s){Ss.subVectors(r,t).addScalar(.5).multiply(n),i!==void 0?(nr.x=s*Ss.x-i*Ss.y,nr.y=i*Ss.x+s*Ss.y):nr.copy(Ss),r.copy(e),r.x+=nr.x,r.y+=nr.y,r.applyMatrix4(Gf)}const eu=new T,tu=new Qe,nu=new Qe,px=new T,iu=new Pe,pa=new T,Ho=new Vn,su=new Pe,Vo=new to;class mx extends Ie{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=sh,this.bindMatrix=new Pe,this.bindMatrixInverse=new Pe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Dn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,pa),this.boundingBox.expandByPoint(pa)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Vn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,pa),this.boundingSphere.expandByPoint(pa)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ho.copy(this.boundingSphere),Ho.applyMatrix4(i),e.ray.intersectsSphere(Ho)!==!1&&(su.copy(i).invert(),Vo.copy(e.ray).applyMatrix4(su),!(this.boundingBox!==null&&Vo.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Vo)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Qe,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===sh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===wp?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;tu.fromBufferAttribute(i.attributes.skinIndex,e),nu.fromBufferAttribute(i.attributes.skinWeight,e),eu.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const a=nu.getComponent(s);if(a!==0){const o=tu.getComponent(s);iu.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(px.copy(eu).applyMatrix4(iu),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Wf extends ct{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ns extends At{constructor(e=null,t=1,n=1,i,s,a,o,l,c=Ot,h=Ot,u,f){super(null,a,o,l,c,h,i,s,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const ru=new Pe,gx=new Pe;class Sc{constructor(e=[],t=[]){this.uuid=Cn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Pe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Pe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,a=e.length;s<a;s++){const o=e[s]?e[s].matrixWorld:gx;ru.multiplyMatrices(o,t[s]),ru.toArray(n,s*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Sc(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ns(t,e,e,Yt,en);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const s=e.bones[n];let a=t[s];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),a=new Wf),this.bones.push(a),this.boneInverses.push(new Pe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Zl extends wt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ts=new Pe,au=new Pe,ma=[],ou=new Dn,vx=new Pe,sr=new Ie,rr=new Vn;class qi extends Ie{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Zl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,vx)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Dn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ts),ou.copy(e.boundingBox).applyMatrix4(Ts),this.boundingBox.union(ou)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ts),rr.copy(e.boundingSphere).applyMatrix4(Ts),this.boundingSphere.union(rr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,a=e*s+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(sr.geometry=this.geometry,sr.material=this.material,sr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),rr.copy(this.boundingSphere),rr.applyMatrix4(n),e.ray.intersectsSphere(rr)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,Ts),au.multiplyMatrices(n,Ts),sr.matrixWorld=au,sr.raycast(e,ma);for(let a=0,o=ma.length;a<o;a++){const l=ma[a];l.instanceId=s,l.object=this,t.push(l)}ma.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Zl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ns(new Float32Array(i*this.count),i,this.count,dc,en));const s=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*e;s[l]=o,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Xf extends gn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ja=new T,$a=new T,lu=new Pe,ar=new to,ga=new Vn,Go=new T,cu=new T;class Tc extends ct{constructor(e=new vt,t=new Xf){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)ja.fromBufferAttribute(t,i-1),$a.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=ja.distanceTo($a);e.setAttribute("lineDistance",new Ye(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ga.copy(n.boundingSphere),ga.applyMatrix4(i),ga.radius+=s,e.ray.intersectsSphere(ga)===!1)return;lu.copy(i).invert(),ar.copy(e.ray).applyMatrix4(lu);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const d=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let v=d,p=m-1;v<p;v+=c){const g=h.getX(v),_=h.getX(v+1),y=va(this,e,ar,l,g,_);y&&t.push(y)}if(this.isLineLoop){const v=h.getX(m-1),p=h.getX(d),g=va(this,e,ar,l,v,p);g&&t.push(g)}}else{const d=Math.max(0,a.start),m=Math.min(f.count,a.start+a.count);for(let v=d,p=m-1;v<p;v+=c){const g=va(this,e,ar,l,v,v+1);g&&t.push(g)}if(this.isLineLoop){const v=va(this,e,ar,l,m-1,d);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function va(r,e,t,n,i,s){const a=r.geometry.attributes.position;if(ja.fromBufferAttribute(a,i),$a.fromBufferAttribute(a,s),t.distanceSqToSegment(ja,$a,Go,cu)>n)return;Go.applyMatrix4(r.matrixWorld);const l=e.ray.origin.distanceTo(Go);if(!(l<e.near||l>e.far))return{distance:l,point:cu.clone().applyMatrix4(r.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:r}}const hu=new T,uu=new T;class _x extends Tc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)hu.fromBufferAttribute(t,i),uu.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+hu.distanceTo(uu);e.setAttribute("lineDistance",new Ye(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class xx extends Tc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Ec extends gn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new ue(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const fu=new Pe,Jl=new to,_a=new Vn,xa=new T;class Ac extends ct{constructor(e=new vt,t=new Ec){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_a.copy(n.boundingSphere),_a.applyMatrix4(i),_a.radius+=s,e.ray.intersectsSphere(_a)===!1)return;fu.copy(i).invert(),Jl.copy(e.ray).applyMatrix4(fu);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let m=f,v=d;m<v;m++){const p=c.getX(m);xa.fromBufferAttribute(u,p),du(xa,p,l,i,e,t,this)}}else{const f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let m=f,v=d;m<v;m++)xa.fromBufferAttribute(u,m),du(xa,m,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function du(r,e,t,n,i,s,a){const o=Jl.distanceSqToPoint(r);if(o<t){const l=new T;Jl.closestPointToPoint(r,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class so extends At{constructor(e,t,n,i,s,a,o,l,c){super(e,t,n,i,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class hi{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),s=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),s+=n.distanceTo(i),t.push(s),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let i=0;const s=n.length;let a;t?a=t:a=e*n[s-1];let o=0,l=s-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(s-1);const h=n[i],f=n[i+1]-h,d=(a-h)/f;return(i+d)/(s-1)}getTangent(e,t){let i=e-1e-4,s=e+1e-4;i<0&&(i=0),s>1&&(s=1);const a=this.getPoint(i),o=this.getPoint(s),l=t||(a.isVector2?new ae:new T);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new T,i=[],s=[],a=[],o=new T,l=new Pe;for(let d=0;d<=e;d++){const m=d/e;i[d]=this.getTangentAt(m,new T)}s[0]=new T,a[0]=new T;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),f=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],o),a[0].crossVectors(i[0],s[0]);for(let d=1;d<=e;d++){if(s[d]=s[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(i[d-1],i[d]),o.length()>Number.EPSILON){o.normalize();const m=Math.acos(Et(i[d-1].dot(i[d]),-1,1));s[d].applyMatrix4(l.makeRotationAxis(o,m))}a[d].crossVectors(i[d],s[d])}if(t===!0){let d=Math.acos(Et(s[0].dot(s[e]),-1,1));d/=e,i[0].dot(o.crossVectors(s[0],s[e]))>0&&(d=-d);for(let m=1;m<=e;m++)s[m].applyMatrix4(l.makeRotationAxis(i[m],d*m)),a[m].crossVectors(i[m],s[m])}return{tangents:i,normals:s,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class qf extends hi{constructor(e=0,t=0,n=1,i=1,s=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new ae){const n=t,i=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const a=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=i;for(;s>i;)s-=i;s<Number.EPSILON&&(a?s=0:s=i),this.aClockwise===!0&&!a&&(s===i?s=-i:s=s-i);const o=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*h-d*u+this.aX,c=f*u+d*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class yx extends qf{constructor(e,t,n,i,s,a){super(e,t,n,n,i,s,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Rc(){let r=0,e=0,t=0,n=0;function i(s,a,o,l){r=s,e=o,t=-3*s+3*a-2*o-l,n=2*s-2*a+o+l}return{initCatmullRom:function(s,a,o,l,c){i(a,o,c*(o-s),c*(l-a))},initNonuniformCatmullRom:function(s,a,o,l,c,h,u){let f=(a-s)/c-(o-s)/(c+h)+(o-a)/h,d=(o-a)/h-(l-a)/(h+u)+(l-o)/u;f*=h,d*=h,i(a,o,f,d)},calc:function(s){const a=s*s,o=a*s;return r+e*s+t*a+n*o}}}const ya=new T,Wo=new Rc,Xo=new Rc,qo=new Rc;class jf extends hi{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new T){const n=t,i=this.points,s=i.length,a=(s-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s:l===0&&o===s-1&&(o=s-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%s]:(ya.subVectors(i[0],i[1]).add(i[0]),c=ya);const u=i[o%s],f=i[(o+1)%s];if(this.closed||o+2<s?h=i[(o+2)%s]:(ya.subVectors(i[s-1],i[s-2]).add(i[s-1]),h=ya),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let m=Math.pow(c.distanceToSquared(u),d),v=Math.pow(u.distanceToSquared(f),d),p=Math.pow(f.distanceToSquared(h),d);v<1e-4&&(v=1),m<1e-4&&(m=v),p<1e-4&&(p=v),Wo.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,m,v,p),Xo.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,m,v,p),qo.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,m,v,p)}else this.curveType==="catmullrom"&&(Wo.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),Xo.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),qo.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(Wo.calc(l),Xo.calc(l),qo.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new T().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function pu(r,e,t,n,i){const s=(n-e)*.5,a=(i-t)*.5,o=r*r,l=r*o;return(2*t-2*n+s+a)*l+(-3*t+3*n-2*s-a)*o+s*r+t}function Mx(r,e){const t=1-r;return t*t*e}function wx(r,e){return 2*(1-r)*r*e}function bx(r,e){return r*r*e}function wr(r,e,t,n){return Mx(r,e)+wx(r,t)+bx(r,n)}function Sx(r,e){const t=1-r;return t*t*t*e}function Tx(r,e){const t=1-r;return 3*t*t*r*e}function Ex(r,e){return 3*(1-r)*r*r*e}function Ax(r,e){return r*r*r*e}function br(r,e,t,n,i){return Sx(r,e)+Tx(r,t)+Ex(r,n)+Ax(r,i)}class Rx extends hi{constructor(e=new ae,t=new ae,n=new ae,i=new ae){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new ae){const n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(br(e,i.x,s.x,a.x,o.x),br(e,i.y,s.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Cx extends hi{constructor(e=new T,t=new T,n=new T,i=new T){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new T){const n=t,i=this.v0,s=this.v1,a=this.v2,o=this.v3;return n.set(br(e,i.x,s.x,a.x,o.x),br(e,i.y,s.y,a.y,o.y),br(e,i.z,s.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Px extends hi{constructor(e=new ae,t=new ae){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ae){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ae){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Dx extends hi{constructor(e=new T,t=new T){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new T){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new T){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Ix extends hi{constructor(e=new ae,t=new ae,n=new ae){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ae){const n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(wr(e,i.x,s.x,a.x),wr(e,i.y,s.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class $f extends hi{constructor(e=new T,t=new T,n=new T){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new T){const n=t,i=this.v0,s=this.v1,a=this.v2;return n.set(wr(e,i.x,s.x,a.x),wr(e,i.y,s.y,a.y),wr(e,i.z,s.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Lx extends hi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ae){const n=t,i=this.points,s=(i.length-1)*e,a=Math.floor(s),o=s-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(pu(o,l.x,c.x,h.x,u.x),pu(o,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new ae().fromArray(i))}return this}}var kx=Object.freeze({__proto__:null,ArcCurve:yx,CatmullRomCurve3:jf,CubicBezierCurve:Rx,CubicBezierCurve3:Cx,EllipseCurve:qf,LineCurve:Px,LineCurve3:Dx,QuadraticBezierCurve:Ix,QuadraticBezierCurve3:$f,SplineCurve:Lx});class ks extends vt{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const s=[],a=[],o=[],l=[],c=new T,h=new ae;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,f=3;u<=t;u++,f+=3){const d=n+u/t*i;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[f]/e+1)/2,h.y=(a[f+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new Ye(a,3)),this.setAttribute("normal",new Ye(o,3)),this.setAttribute("uv",new Ye(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ks(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Zi extends vt{constructor(e=1,t=1,n=1,i=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),s=Math.floor(s);const h=[],u=[],f=[],d=[];let m=0;const v=[],p=n/2;let g=0;_(),a===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new Ye(u,3)),this.setAttribute("normal",new Ye(f,3)),this.setAttribute("uv",new Ye(d,2));function _(){const x=new T,P=new T;let R=0;const A=(t-e)/n;for(let C=0;C<=s;C++){const M=[],w=C/s,S=w*(t-e)+e;for(let I=0;I<=i;I++){const L=I/i,O=L*l+o,G=Math.sin(O),B=Math.cos(O);P.x=S*G,P.y=-w*n+p,P.z=S*B,u.push(P.x,P.y,P.z),x.set(G,A,B).normalize(),f.push(x.x,x.y,x.z),d.push(L,1-w),M.push(m++)}v.push(M)}for(let C=0;C<i;C++)for(let M=0;M<s;M++){const w=v[M][C],S=v[M+1][C],I=v[M+1][C+1],L=v[M][C+1];(e>0||M!==0)&&(h.push(w,S,L),R+=3),(t>0||M!==s-1)&&(h.push(S,I,L),R+=3)}c.addGroup(g,R,0),g+=R}function y(x){const P=m,R=new ae,A=new T;let C=0;const M=x===!0?e:t,w=x===!0?1:-1;for(let I=1;I<=i;I++)u.push(0,p*w,0),f.push(0,w,0),d.push(.5,.5),m++;const S=m;for(let I=0;I<=i;I++){const O=I/i*l+o,G=Math.cos(O),B=Math.sin(O);A.x=M*B,A.y=p*w,A.z=M*G,u.push(A.x,A.y,A.z),f.push(0,w,0),R.x=G*.5+.5,R.y=B*.5*w+.5,d.push(R.x,R.y),m++}for(let I=0;I<i;I++){const L=P+I,O=S+I;x===!0?h.push(O,O+1,L):h.push(O+1,O,L),C+=3}c.addGroup(g,C,x===!0?1:2),g+=C}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zi(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Sr extends Zi{constructor(e=1,t=1,n=32,i=1,s=!1,a=0,o=Math.PI*2){super(0,e,t,n,i,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Sr(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ro extends vt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const s=[],a=[];o(i),c(n),h(),this.setAttribute("position",new Ye(s,3)),this.setAttribute("normal",new Ye(s.slice(),3)),this.setAttribute("uv",new Ye(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(_){const y=new T,x=new T,P=new T;for(let R=0;R<t.length;R+=3)d(t[R+0],y),d(t[R+1],x),d(t[R+2],P),l(y,x,P,_)}function l(_,y,x,P){const R=P+1,A=[];for(let C=0;C<=R;C++){A[C]=[];const M=_.clone().lerp(x,C/R),w=y.clone().lerp(x,C/R),S=R-C;for(let I=0;I<=S;I++)I===0&&C===R?A[C][I]=M:A[C][I]=M.clone().lerp(w,I/S)}for(let C=0;C<R;C++)for(let M=0;M<2*(R-C)-1;M++){const w=Math.floor(M/2);M%2===0?(f(A[C][w+1]),f(A[C+1][w]),f(A[C][w])):(f(A[C][w+1]),f(A[C+1][w+1]),f(A[C+1][w]))}}function c(_){const y=new T;for(let x=0;x<s.length;x+=3)y.x=s[x+0],y.y=s[x+1],y.z=s[x+2],y.normalize().multiplyScalar(_),s[x+0]=y.x,s[x+1]=y.y,s[x+2]=y.z}function h(){const _=new T;for(let y=0;y<s.length;y+=3){_.x=s[y+0],_.y=s[y+1],_.z=s[y+2];const x=p(_)/2/Math.PI+.5,P=g(_)/Math.PI+.5;a.push(x,1-P)}m(),u()}function u(){for(let _=0;_<a.length;_+=6){const y=a[_+0],x=a[_+2],P=a[_+4],R=Math.max(y,x,P),A=Math.min(y,x,P);R>.9&&A<.1&&(y<.2&&(a[_+0]+=1),x<.2&&(a[_+2]+=1),P<.2&&(a[_+4]+=1))}}function f(_){s.push(_.x,_.y,_.z)}function d(_,y){const x=_*3;y.x=e[x+0],y.y=e[x+1],y.z=e[x+2]}function m(){const _=new T,y=new T,x=new T,P=new T,R=new ae,A=new ae,C=new ae;for(let M=0,w=0;M<s.length;M+=9,w+=6){_.set(s[M+0],s[M+1],s[M+2]),y.set(s[M+3],s[M+4],s[M+5]),x.set(s[M+6],s[M+7],s[M+8]),R.set(a[w+0],a[w+1]),A.set(a[w+2],a[w+3]),C.set(a[w+4],a[w+5]),P.copy(_).add(y).add(x).divideScalar(3);const S=p(P);v(R,w+0,_,S),v(A,w+2,y,S),v(C,w+4,x,S)}}function v(_,y,x,P){P<0&&_.x===1&&(a[y]=_.x-1),x.x===0&&x.z===0&&(a[y]=P/2/Math.PI+.5)}function p(_){return Math.atan2(_.z,-_.x)}function g(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ro(e.vertices,e.indices,e.radius,e.details)}}class Cc extends ro{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Cc(e.radius,e.detail)}}class Pc extends ro{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Pc(e.radius,e.detail)}}class Ai extends vt{constructor(e=.5,t=1,n=32,i=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);const o=[],l=[],c=[],h=[];let u=e;const f=(t-e)/i,d=new T,m=new ae;for(let v=0;v<=i;v++){for(let p=0;p<=n;p++){const g=s+p/n*a;d.x=u*Math.cos(g),d.y=u*Math.sin(g),l.push(d.x,d.y,d.z),c.push(0,0,1),m.x=(d.x/t+1)/2,m.y=(d.y/t+1)/2,h.push(m.x,m.y)}u+=f}for(let v=0;v<i;v++){const p=v*(n+1);for(let g=0;g<n;g++){const _=g+p,y=_,x=_+n+1,P=_+n+2,R=_+1;o.push(y,x,R),o.push(x,P,R)}}this.setIndex(o),this.setAttribute("position",new Ye(l,3)),this.setAttribute("normal",new Ye(c,3)),this.setAttribute("uv",new Ye(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ai(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ki extends vt{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new T,f=new T,d=[],m=[],v=[],p=[];for(let g=0;g<=n;g++){const _=[],y=g/n;let x=0;g===0&&a===0?x=.5/t:g===n&&l===Math.PI&&(x=-.5/t);for(let P=0;P<=t;P++){const R=P/t;u.x=-e*Math.cos(i+R*s)*Math.sin(a+y*o),u.y=e*Math.cos(a+y*o),u.z=e*Math.sin(i+R*s)*Math.sin(a+y*o),m.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),p.push(R+x,1-y),_.push(c++)}h.push(_)}for(let g=0;g<n;g++)for(let _=0;_<t;_++){const y=h[g][_+1],x=h[g][_],P=h[g+1][_],R=h[g+1][_+1];(g!==0||a>0)&&d.push(y,x,R),(g!==n-1||l<Math.PI)&&d.push(x,P,R)}this.setIndex(d),this.setAttribute("position",new Ye(m,3)),this.setAttribute("normal",new Ye(v,3)),this.setAttribute("uv",new Ye(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ki(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Ya extends vt{constructor(e=1,t=.4,n=12,i=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);const a=[],o=[],l=[],c=[],h=new T,u=new T,f=new T;for(let d=0;d<=n;d++)for(let m=0;m<=i;m++){const v=m/i*s,p=d/n*Math.PI*2;u.x=(e+t*Math.cos(p))*Math.cos(v),u.y=(e+t*Math.cos(p))*Math.sin(v),u.z=t*Math.sin(p),o.push(u.x,u.y,u.z),h.x=e*Math.cos(v),h.y=e*Math.sin(v),f.subVectors(u,h).normalize(),l.push(f.x,f.y,f.z),c.push(m/i),c.push(d/n)}for(let d=1;d<=n;d++)for(let m=1;m<=i;m++){const v=(i+1)*d+m-1,p=(i+1)*(d-1)+m-1,g=(i+1)*(d-1)+m,_=(i+1)*d+m;a.push(v,p,_),a.push(p,g,_)}this.setIndex(a),this.setAttribute("position",new Ye(o,3)),this.setAttribute("normal",new Ye(l,3)),this.setAttribute("uv",new Ye(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ya(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Dc extends vt{constructor(e=new $f(new T(-1,-1,0),new T(-1,1,0),new T(1,1,0)),t=64,n=1,i=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:s};const a=e.computeFrenetFrames(t,s);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new T,l=new T,c=new ae;let h=new T;const u=[],f=[],d=[],m=[];v(),this.setIndex(m),this.setAttribute("position",new Ye(u,3)),this.setAttribute("normal",new Ye(f,3)),this.setAttribute("uv",new Ye(d,2));function v(){for(let y=0;y<t;y++)p(y);p(s===!1?t:0),_(),g()}function p(y){h=e.getPointAt(y/t,h);const x=a.normals[y],P=a.binormals[y];for(let R=0;R<=i;R++){const A=R/i*Math.PI*2,C=Math.sin(A),M=-Math.cos(A);l.x=M*x.x+C*P.x,l.y=M*x.y+C*P.y,l.z=M*x.z+C*P.z,l.normalize(),f.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,u.push(o.x,o.y,o.z)}}function g(){for(let y=1;y<=t;y++)for(let x=1;x<=i;x++){const P=(i+1)*(y-1)+(x-1),R=(i+1)*y+(x-1),A=(i+1)*y+x,C=(i+1)*(y-1)+x;m.push(P,R,C),m.push(R,A,C)}}function _(){for(let y=0;y<=t;y++)for(let x=0;x<=i;x++)c.x=y/t,c.y=x/i,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Dc(new kx[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class Nx extends gt{static get type(){return"RawShaderMaterial"}constructor(e){super(e),this.isRawShaderMaterial=!0}}class St extends gn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=_c,this.normalScale=new ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Gn extends St{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ae(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Et(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ue(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ue(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ue(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Ux extends gn{static get type(){return"MeshNormalMaterial"}constructor(e){super(),this.isMeshNormalMaterial=!0,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=_c,this.normalScale=new ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}}function Ma(r,e,t){return!r||!t&&r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function Fx(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Ox(r){function e(i,s){return r[i]-r[s]}const t=r.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function mu(r,e,t){const n=r.length,i=new r.constructor(n);for(let s=0,a=0;a!==n;++s){const o=t[s]*e;for(let l=0;l!==e;++l)i[a++]=r[o+l]}return i}function Yf(r,e,t,n){let i=1,s=r[0];for(;s!==void 0&&s[n]===void 0;)s=r[i++];if(s===void 0)return;let a=s[n];if(a!==void 0)if(Array.isArray(a))do a=s[n],a!==void 0&&(e.push(s.time),t.push.apply(t,a)),s=r[i++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[n],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=r[i++];while(s!==void 0);else do a=s[n],a!==void 0&&(e.push(s.time),t.push(a)),s=r[i++];while(s!==void 0)}class kr{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],s=t[n-1];e:{t:{let a;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break t}a=t.length;break n}if(!(e>=s)){const o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=t[--n-1],e>=s)break t}a=n,n=0;break n}break e}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let a=0;a!==i;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class Bx extends kr{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Cs,endingEnd:Cs}}intervalChanged_(e,t,n){const i=this.parameterPositions;let s=e-2,a=e+1,o=i[s],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ps:s=e,o=2*t-n;break;case Wa:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ps:a=e,l=2*n-t;break;case Wa:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,d=this._weightNext,m=(n-t)/(i-t),v=m*m,p=v*m,g=-f*p+2*f*v-f*m,_=(1+f)*p+(-1.5-2*f)*v+(-.5+f)*m+1,y=(-1-d)*p+(1.5+d)*v+.5*m,x=d*p-d*v;for(let P=0;P!==o;++P)s[P]=g*a[h+P]+_*a[c+P]+y*a[l+P]+x*a[u+P];return s}}class Kf extends kr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),u=1-h;for(let f=0;f!==o;++f)s[f]=a[c+f]*u+a[l+f]*h;return s}}class zx extends kr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Wn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ma(t,this.TimeBufferType),this.values=Ma(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ma(e.times,Array),values:Ma(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new zx(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Kf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Bx(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Pr:t=this.InterpolantFactoryMethodDiscrete;break;case Dr:t=this.InterpolantFactoryMethodLinear;break;case uo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Pr;case this.InterpolantFactoryMethodLinear:return Dr;case this.InterpolantFactoryMethodSmooth:return uo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let s=0,a=i-1;for(;s!==i&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==i){s>=a&&(a=Math.max(a,1),s=a-1);const o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){const l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&Fx(i))for(let o=0,l=i.length;o!==l;++o){const c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===uo,s=e.length-1;let a=1;for(let o=1;o<s;++o){let l=!1;const c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(i)l=!0;else{const u=o*n,f=u-n,d=u+n;for(let m=0;m!==n;++m){const v=t[u+m];if(v!==t[f+m]||v!==t[d+m]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];const u=o*n,f=a*n;for(let d=0;d!==n;++d)t[f+d]=t[u+d]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Wn.prototype.TimeBufferType=Float32Array;Wn.prototype.ValueBufferType=Float32Array;Wn.prototype.DefaultInterpolation=Dr;class js extends Wn{constructor(e,t,n){super(e,t,n)}}js.prototype.ValueTypeName="bool";js.prototype.ValueBufferType=Array;js.prototype.DefaultInterpolation=Pr;js.prototype.InterpolantFactoryMethodLinear=void 0;js.prototype.InterpolantFactoryMethodSmooth=void 0;class Zf extends Wn{}Zf.prototype.ValueTypeName="color";class Hs extends Wn{}Hs.prototype.ValueTypeName="number";class Hx extends kr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t);let c=e*o;for(let h=c+o;c!==h;c+=4)Lt.slerpFlat(s,0,a,c-o,a,c,l);return s}}class Vs extends Wn{InterpolantFactoryMethodLinear(e){return new Hx(this.times,this.values,this.getValueSize(),e)}}Vs.prototype.ValueTypeName="quaternion";Vs.prototype.InterpolantFactoryMethodSmooth=void 0;class $s extends Wn{constructor(e,t,n){super(e,t,n)}}$s.prototype.ValueTypeName="string";$s.prototype.ValueBufferType=Array;$s.prototype.DefaultInterpolation=Pr;$s.prototype.InterpolantFactoryMethodLinear=void 0;$s.prototype.InterpolantFactoryMethodSmooth=void 0;class Gs extends Wn{}Gs.prototype.ValueTypeName="vector";class Ql{constructor(e="",t=-1,n=[],i=vc){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Cn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(Gx(n[a]).scale(i));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,a=n.length;s!==a;++s)t.push(Wn.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const s=t.length,a=[];for(let o=0;o<s;o++){let l=[],c=[];l.push((o+s-1)%s,o,(o+1)%s),c.push(0,1,0);const h=Ox(l);l=mu(l,1,h),c=mu(c,1,h),!i&&l[0]===0&&(l.push(s),c.push(c[0])),a.push(new Hs(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){const c=e[o],h=c.name.match(s);if(h&&h.length>1){const u=h[1];let f=i[u];f||(i[u]=f=[]),f.push(c)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,f,d,m,v){if(d.length!==0){const p=[],g=[];Yf(d,p,g,m),p.length!==0&&v.push(new u(f,p,g))}},i=[],s=e.name||"default",a=e.fps||30,o=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const f=c[u].keys;if(!(!f||f.length===0))if(f[0].morphTargets){const d={};let m;for(m=0;m<f.length;m++)if(f[m].morphTargets)for(let v=0;v<f[m].morphTargets.length;v++)d[f[m].morphTargets[v]]=-1;for(const v in d){const p=[],g=[];for(let _=0;_!==f[m].morphTargets.length;++_){const y=f[m];p.push(y.time),g.push(y.morphTarget===v?1:0)}i.push(new Hs(".morphTargetInfluence["+v+"]",p,g))}l=d.length*a}else{const d=".bones["+t[u].name+"]";n(Gs,d+".position",f,"pos",i),n(Vs,d+".quaternion",f,"rot",i),n(Gs,d+".scale",f,"scl",i)}}return i.length===0?null:new this(s,l,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function Vx(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Hs;case"vector":case"vector2":case"vector3":case"vector4":return Gs;case"color":return Zf;case"quaternion":return Vs;case"bool":case"boolean":return js;case"string":return $s}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function Gx(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Vx(r.type);if(r.times===void 0){const t=[],n=[];Yf(r.keys,t,n,"value"),r.times=t,r.values=n}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const Pi={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(this.files[r]=e)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class Wx{constructor(e,t,n){const i=this;let s=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){o++,s===!1&&i.onStart!==void 0&&i.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){const d=c[u],m=c[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return m}return null}}}const Xx=new Wx;class is{constructor(e){this.manager=e!==void 0?e:Xx,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}is.DEFAULT_MATERIAL_NAME="__DEFAULT";const ei={};class qx extends Error{constructor(e,t){super(e),this.response=t}}class Ic extends is{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=Pi.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(ei[e]!==void 0){ei[e].push({onLoad:t,onProgress:n,onError:i});return}ei[e]=[],ei[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=ei[e],u=c.body.getReader(),f=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),d=f?parseInt(f):0,m=d!==0;let v=0;const p=new ReadableStream({start(g){_();function _(){u.read().then(({done:y,value:x})=>{if(y)g.close();else{v+=x.byteLength;const P=new ProgressEvent("progress",{lengthComputable:m,loaded:v,total:d});for(let R=0,A=h.length;R<A;R++){const C=h[R];C.onProgress&&C.onProgress(P)}g.enqueue(x),_()}},y=>{g.error(y)})}}});return new Response(p)}else throw new qx(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),f=u&&u[1]?u[1].toLowerCase():void 0,d=new TextDecoder(f);return c.arrayBuffer().then(m=>d.decode(m))}}}).then(c=>{Pi.add(e,c);const h=ei[e];delete ei[e];for(let u=0,f=h.length;u<f;u++){const d=h[u];d.onLoad&&d.onLoad(c)}}).catch(c=>{const h=ei[e];if(h===void 0)throw this.manager.itemError(e),c;delete ei[e];for(let u=0,f=h.length;u<f;u++){const d=h[u];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class jx extends is{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=Pi.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a;const o=Ir("img");function l(){h(),Pi.add(e,this),t&&t(this),s.manager.itemEnd(e)}function c(u){h(),i&&i(u),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}}class $x extends is{constructor(e){super(e)}load(e,t,n,i){const s=this,a=new ns,o=new Ic(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(s.withCredentials),o.load(e,function(l){let c;try{c=s.parse(l)}catch(h){if(i!==void 0)i(h);else{console.error(h);return}}c.image!==void 0?a.image=c.image:c.data!==void 0&&(a.image.width=c.width,a.image.height=c.height,a.image.data=c.data),a.wrapS=c.wrapS!==void 0?c.wrapS:Bn,a.wrapT=c.wrapT!==void 0?c.wrapT:Bn,a.magFilter=c.magFilter!==void 0?c.magFilter:Tt,a.minFilter=c.minFilter!==void 0?c.minFilter:Tt,a.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(a.colorSpace=c.colorSpace),c.flipY!==void 0&&(a.flipY=c.flipY),c.format!==void 0&&(a.format=c.format),c.type!==void 0&&(a.type=c.type),c.mipmaps!==void 0&&(a.mipmaps=c.mipmaps,a.minFilter=Rn),c.mipmapCount===1&&(a.minFilter=Tt),c.generateMipmaps!==void 0&&(a.generateMipmaps=c.generateMipmaps),a.needsUpdate=!0,t&&t(a,c)},n,i),a}}class Yx extends is{constructor(e){super(e)}load(e,t,n,i){const s=new At,a=new jx(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,i),s}}class ao extends ct{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ue(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Kx extends ao{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const jo=new Pe,gu=new T,vu=new T;class Lc{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ae(512,512),this.map=null,this.mapPass=null,this.matrix=new Pe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new yc,this._frameExtents=new ae(1,1),this._viewportCount=1,this._viewports=[new Qe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;gu.setFromMatrixPosition(e.matrixWorld),t.position.copy(gu),vu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vu),t.updateMatrixWorld(),jo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(jo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(jo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Zx extends Lc{constructor(){super(new $t(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=Bs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(n!==t.fov||i!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Jx extends ao{constructor(e,t,n=0,i=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.distance=n,this.angle=i,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new Zx}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const _u=new Pe,or=new T,$o=new T;class Qx extends Lc{constructor(){super(new $t(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ae(4,2),this._viewportCount=6,this._viewports=[new Qe(2,1,1,1),new Qe(0,1,1,1),new Qe(3,1,1,1),new Qe(1,1,1,1),new Qe(3,0,1,1),new Qe(1,0,1,1)],this._cubeDirections=[new T(1,0,0),new T(-1,0,0),new T(0,0,1),new T(0,0,-1),new T(0,1,0),new T(0,-1,0)],this._cubeUps=[new T(0,1,0),new T(0,1,0),new T(0,1,0),new T(0,1,0),new T(0,0,1),new T(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),or.setFromMatrixPosition(e.matrixWorld),n.position.copy(or),$o.copy(n.position),$o.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt($o),n.updateMatrixWorld(),i.makeTranslation(-or.x,-or.y,-or.z),_u.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(_u)}}class ln extends ao{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Qx}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class ey extends Lc{constructor(){super(new no(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class kc extends ao{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.shadow=new ey}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Tr{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class ty extends is{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=Pi.get(e);if(a!==void 0){if(s.manager.itemStart(e),a.then){a.then(c=>{t&&t(c),s.manager.itemEnd(e)}).catch(c=>{i&&i(c)});return}return setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader;const l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return Pi.add(e,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){i&&i(c),Pi.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});Pi.add(e,l),s.manager.itemStart(e)}}class ny{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=xu(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=xu();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function xu(){return performance.now()}class iy{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,s,a;switch(t){case"quaternion":i=this._slerp,s=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,s=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,s=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=s,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,s=e*i+i;let a=this.cumulativeWeight;if(a===0){for(let o=0;o!==i;++o)n[s+o]=n[o];a=t}else{a+=t;const o=t/a;this._mixBufferRegion(n,s,0,o,i)}this.cumulativeWeight=a}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,s=this.cumulativeWeight,a=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){const l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-s,t)}a>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){o.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let s=n,a=i;s!==a;++s)t[s]=t[i+s%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,s){if(i>=.5)for(let a=0;a!==s;++a)e[t+a]=e[n+a]}_slerp(e,t,n,i){Lt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,s){const a=this._workIndex*s;Lt.multiplyQuaternionsFlat(e,a,e,t,e,n),Lt.slerpFlat(e,t,e,t,e,a,i)}_lerp(e,t,n,i,s){const a=1-i;for(let o=0;o!==s;++o){const l=t+o;e[l]=e[l]*a+e[n+o]*i}}_lerpAdditive(e,t,n,i,s){for(let a=0;a!==s;++a){const o=t+a;e[o]=e[o]+e[n+a]*i}}}const Nc="\\[\\]\\.:\\/",sy=new RegExp("["+Nc+"]","g"),Uc="[^"+Nc+"]",ry="[^"+Nc.replace("\\.","")+"]",ay=/((?:WC+[\/:])*)/.source.replace("WC",Uc),oy=/(WCOD+)?/.source.replace("WCOD",ry),ly=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Uc),cy=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Uc),hy=new RegExp("^"+ay+oy+ly+cy+"$"),uy=["material","materials","bones","map"];class fy{constructor(e,t,n){const i=n||st.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class st{constructor(e,t,n){this.path=t,this.parsedPath=n||st.parseTrackName(t),this.node=st.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new st.Composite(e,t,n):new st(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(sy,"")}static parseTrackName(e){const t=hy.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const s=n.nodeName.substring(i+1);uy.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let a=0;a<s.length;a++){const o=s[a];if(o.name===t||o.uuid===t)return o;const l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let s=t.propertyIndex;if(e||(e=st.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const a=e[i];if(a===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}st.Composite=fy;st.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};st.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};st.prototype.GetterByBindingType=[st.prototype._getValue_direct,st.prototype._getValue_array,st.prototype._getValue_arrayElement,st.prototype._getValue_toArray];st.prototype.SetterByBindingTypeAndVersioning=[[st.prototype._setValue_direct,st.prototype._setValue_direct_setNeedsUpdate,st.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[st.prototype._setValue_array,st.prototype._setValue_array_setNeedsUpdate,st.prototype._setValue_array_setMatrixWorldNeedsUpdate],[st.prototype._setValue_arrayElement,st.prototype._setValue_arrayElement_setNeedsUpdate,st.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[st.prototype._setValue_fromArray,st.prototype._setValue_fromArray_setNeedsUpdate,st.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class dy{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const s=t.tracks,a=s.length,o=new Array(a),l={endingStart:Cs,endingEnd:Cs};for(let c=0;c!==a;++c){const h=s[c].createInterpolant(null);o[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=o,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=bf,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){const i=this._clip.duration,s=e._clip.duration,a=s/i,o=i/s;e.warp(1,a,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,s=i.time,a=this.timeScale;let o=this._timeScaleInterpolant;o===null&&(o=i._lendControlInterpolant(),this._timeScaleInterpolant=o);const l=o.parameterPositions,c=o.sampleValues;return l[0]=s,l[1]=s+n,c[0]=e/a,c[1]=t/a,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const s=this._startTime;if(s!==null){const l=(e-s)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);const a=this._updateTime(t),o=this._updateWeight(e);if(o>0){const l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case Sp:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulateAdditive(o);break;case vc:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(a),c[h].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,s=this._loopCount;const a=n===bp;if(e===0)return s===-1?i:a&&(s&1)===1?t-i:i;if(n===wf){s===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(s===-1&&(e>=0?(s=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),i>=t||i<0){const o=Math.floor(i/t);i-=t*o,s+=Math.abs(o);const l=this.repetitions-s;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){const c=e<0;this._setEndings(c,!c,a)}else this._setEndings(!1,!1,a);this._loopCount=s,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(a&&(s&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=Ps,i.endingEnd=Ps):(e?i.endingStart=this.zeroSlopeAtStart?Ps:Cs:i.endingStart=Wa,t?i.endingEnd=this.zeroSlopeAtEnd?Ps:Cs:i.endingEnd=Wa)}_scheduleFading(e,t,n){const i=this._mixer,s=i.time;let a=this._weightInterpolant;a===null&&(a=i._lendControlInterpolant(),this._weightInterpolant=a);const o=a.parameterPositions,l=a.sampleValues;return o[0]=s,l[0]=t,o[1]=s+e,l[1]=n,this}}const py=new Float32Array(1);class my extends ts{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,s=i.length,a=e._propertyBindings,o=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==s;++u){const f=i[u],d=f.name;let m=h[d];if(m!==void 0)++m.referenceCount,a[u]=m;else{if(m=a[u],m!==void 0){m._cacheIndex===null&&(++m.referenceCount,this._addInactiveBinding(m,l,d));continue}const v=t&&t._propertyBindings[u].binding.parsedPath;m=new iy(st.create(n,d,v),f.ValueTypeName,f.getValueSize()),++m.referenceCount,this._addInactiveBinding(m,l,d),a[u]=m}o[u].resultBuffer=m.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,s=this._actionsByClip[i];this._bindAction(e,s&&s.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];s.useCount++===0&&(this._lendBinding(s),s.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.useCount===0&&(s.restoreOriginalState(),this._takeBackBinding(s))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,s=this._actionsByClip;let a=s[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,s[t]=a;else{const o=a.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),a.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const s=e._clip.uuid,a=this._actionsByClip,o=a[s],l=o.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;const u=o.actionByRoot,f=(e._localRoot||this._root).uuid;delete u[f],l.length===0&&delete a[s],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const s=t[n];--s.referenceCount===0&&this._removeInactiveBinding(s)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,s=this._bindings;let a=i[t];a===void 0&&(a={},i[t]=a),a[n]=e,e._cacheIndex=s.length,s.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,s=n.path,a=this._bindingsByRootAndName,o=a[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete o[s],Object.keys(o).length===0&&delete a[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new Kf(new Float32Array(2),new Float32Array(2),1,py),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,s=t[i];e.__cacheIndex=i,t[i]=e,s.__cacheIndex=n,t[n]=s}clipAction(e,t,n){const i=t||this._root,s=i.uuid;let a=typeof e=="string"?Ql.findByName(i,e):e;const o=a!==null?a.uuid:e,l=this._actionsByClip[o];let c=null;if(n===void 0&&(a!==null?n=a.blendMode:n=vc),l!==void 0){const u=l.actionByRoot[s];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],a===null&&(a=c._clip)}if(a===null)return null;const h=new dy(this,a,t,n);return this._bindAction(h,c),this._addInactiveAction(h,o,s),h}existingAction(e,t){const n=t||this._root,i=n.uuid,s=typeof e=="string"?Ql.findByName(n,e):e,a=s?s.uuid:e,o=this._actionsByClip[a];return o!==void 0&&o.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,s=Math.sign(e),a=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,s,a);const o=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)o[c].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,s=i[n];if(s!==void 0){const a=s.knownActions;for(let o=0,l=a.length;o!==l;++o){const c=a[o];this._deactivateAction(c);const h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const a in n){const o=n[a].actionByRoot,l=o[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}const i=this._bindingsByRootAndName,s=i[t];if(s!==void 0)for(const a in s){const o=s[a];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:lc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=lc);const Er={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class ss{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const gy=new no(-1,1,1,-1,0,1);class vy extends vt{constructor(){super(),this.setAttribute("position",new Ye([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ye([0,2,0,0,2,0],2))}}const _y=new vy;class oo{constructor(e){this._mesh=new Ie(_y,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,gy)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Jf extends ss{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof gt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Tn.clone(e.uniforms),this.material=new gt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new oo(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class yu extends ss{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const i=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),s.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),s.buffers.stencil.setClear(o),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(i.EQUAL,1,4294967295),s.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),s.buffers.stencil.setLocked(!0)}}class xy extends ss{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class yy{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new ae);this._width=n.width,this._height=n.height,t=new nn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Vt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Jf(Er),this.copyPass.material.blending=Ft,this.clock=new ny}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let i=0,s=this.passes.length;i<s;i++){const a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}yu!==void 0&&(a instanceof yu?n=!0:a instanceof xy&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new ae);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class My extends ss{constructor(e,t,n=null,i=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new ue}render(e,t,n){const i=e.autoClear;e.autoClear=!1;let s,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=i}}const wy={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new ue(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Ws extends ss{constructor(e,t,n,i){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=i,this.resolution=e!==void 0?new ae(e.x,e.y):new ae(256,256),this.clearColor=new ue(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new nn(s,a,{type:Vt}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const f=new nn(s,a,{type:Vt});f.texture.name="UnrealBloomPass.h"+u,f.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(f);const d=new nn(s,a,{type:Vt});d.texture.name="UnrealBloomPass.v"+u,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),s=Math.round(s/2),a=Math.round(a/2)}const o=wy;this.highPassUniforms=Tn.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new gt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];s=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new ae(1/s,1/a),s=Math.round(s/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=Er;this.copyUniforms=Tn.clone(h.uniforms),this.blendMaterial=new gt({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:Qt,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new ue,this.oldClearAlpha=1,this.basic=new lt,this.fsQuad=new oo(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(n,i);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,i),this.renderTargetsVertical[s].setSize(n,i),this.separableBlurMaterials[s].uniforms.invSize.value=new ae(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(e,t,n,i,s){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=Ws.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Ws.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=a}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new gt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new ae(.5,.5)},direction:{value:new ae(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(e){return new gt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}Ws.BlurDirectionX=new ae(1,0);Ws.BlurDirectionY=new ae(0,1);const by={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};class Sy extends ss{constructor(){super();const e=by;this.uniforms=Tn.clone(e.uniforms),this.material=new Nx({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new oo(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},qe.getTransfer(this._outputColorSpace)===at&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===af?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===of?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===lf?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===cc?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===cf?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===hf&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const wa={defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new ae},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new Pe},cameraProjectionMatrixInverse:{value:new Pe},cameraWorldMatrix:{value:new Pe},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new T(-1,-1,-1)},sceneBoxMax:{value:new T(1,1,1)}},vertexShader:`

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
		}`},ba={defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
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

		}`},Yo={uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
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
		}`};function Ty(r=5){const e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=Ey(e),n=t.length,i=new Uint8Array(n*4);for(let a=0;a<n;++a){const o=t[a],l=2*Math.PI*o/n,c=new T(Math.cos(l),Math.sin(l),0).normalize();i[a*4]=(c.x*.5+.5)*255,i[a*4+1]=(c.y*.5+.5)*255,i[a*4+2]=127,i[a*4+3]=255}const s=new ns(i,e,e);return s.wrapS=Pn,s.wrapT=Pn,s.needsUpdate=!0,s}function Ey(r){const e=Math.floor(r)%2===0?Math.floor(r)+1:Math.floor(r),t=e*e,n=Array(t).fill(0);let i=Math.floor(e/2),s=e-1;for(let a=1;a<=t;){if(i===-1&&s===e?(s=e-2,i=0):(s===e&&(s=0),i<0&&(i=e-1)),n[i*e+s]!==0){s-=2,i++;continue}else n[i*e+s]=a++;s++,i--}return n}const Sa={defines:{SAMPLES:16,SAMPLE_VECTORS:Qf(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new ae},cameraProjectionMatrixInverse:{value:new Pe},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

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
		}`};function Qf(r,e,t){const n=Ay(r,e,t);let i="vec3[SAMPLES](";for(let s=0;s<r;s++){const a=n[s];i+=`vec3(${a.x}, ${a.y}, ${a.z})${s<r-1?",":")"}`}return i}function Ay(r,e,t){const n=[];for(let i=0;i<r;i++){const s=2*Math.PI*e*i/r,a=Math.pow(i/(r-1),t);n.push(new T(Math.cos(s),Math.sin(s),a))}return n}class Ry{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}dot(e,t,n){return e[0]*t+e[1]*n}dot3(e,t,n,i){return e[0]*t+e[1]*n+e[2]*i}dot4(e,t,n,i,s){return e[0]*t+e[1]*n+e[2]*i+e[3]*s}noise(e,t){let n,i,s;const a=.5*(Math.sqrt(3)-1),o=(e+t)*a,l=Math.floor(e+o),c=Math.floor(t+o),h=(3-Math.sqrt(3))/6,u=(l+c)*h,f=l-u,d=c-u,m=e-f,v=t-d;let p,g;m>v?(p=1,g=0):(p=0,g=1);const _=m-p+h,y=v-g+h,x=m-1+2*h,P=v-1+2*h,R=l&255,A=c&255,C=this.perm[R+this.perm[A]]%12,M=this.perm[R+p+this.perm[A+g]]%12,w=this.perm[R+1+this.perm[A+1]]%12;let S=.5-m*m-v*v;S<0?n=0:(S*=S,n=S*S*this.dot(this.grad3[C],m,v));let I=.5-_*_-y*y;I<0?i=0:(I*=I,i=I*I*this.dot(this.grad3[M],_,y));let L=.5-x*x-P*P;return L<0?s=0:(L*=L,s=L*L*this.dot(this.grad3[w],x,P)),70*(n+i+s)}noise3d(e,t,n){let i,s,a,o;const c=(e+t+n)*.3333333333333333,h=Math.floor(e+c),u=Math.floor(t+c),f=Math.floor(n+c),d=1/6,m=(h+u+f)*d,v=h-m,p=u-m,g=f-m,_=e-v,y=t-p,x=n-g;let P,R,A,C,M,w;_>=y?y>=x?(P=1,R=0,A=0,C=1,M=1,w=0):_>=x?(P=1,R=0,A=0,C=1,M=0,w=1):(P=0,R=0,A=1,C=1,M=0,w=1):y<x?(P=0,R=0,A=1,C=0,M=1,w=1):_<x?(P=0,R=1,A=0,C=0,M=1,w=1):(P=0,R=1,A=0,C=1,M=1,w=0);const S=_-P+d,I=y-R+d,L=x-A+d,O=_-C+2*d,G=y-M+2*d,B=x-w+2*d,$=_-1+3*d,V=y-1+3*d,H=x-1+3*d,K=h&255,Q=u&255,se=f&255,we=this.perm[K+this.perm[Q+this.perm[se]]]%12,j=this.perm[K+P+this.perm[Q+R+this.perm[se+A]]]%12,te=this.perm[K+C+this.perm[Q+M+this.perm[se+w]]]%12,le=this.perm[K+1+this.perm[Q+1+this.perm[se+1]]]%12;let ie=.6-_*_-y*y-x*x;ie<0?i=0:(ie*=ie,i=ie*ie*this.dot3(this.grad3[we],_,y,x));let fe=.6-S*S-I*I-L*L;fe<0?s=0:(fe*=fe,s=fe*fe*this.dot3(this.grad3[j],S,I,L));let de=.6-O*O-G*G-B*B;de<0?a=0:(de*=de,a=de*de*this.dot3(this.grad3[te],O,G,B));let _e=.6-$*$-V*V-H*H;return _e<0?o=0:(_e*=_e,o=_e*_e*this.dot3(this.grad3[le],$,V,H)),32*(i+s+a+o)}noise4d(e,t,n,i){const s=this.grad4,a=this.simplex,o=this.perm,l=(Math.sqrt(5)-1)/4,c=(5-Math.sqrt(5))/20;let h,u,f,d,m;const v=(e+t+n+i)*l,p=Math.floor(e+v),g=Math.floor(t+v),_=Math.floor(n+v),y=Math.floor(i+v),x=(p+g+_+y)*c,P=p-x,R=g-x,A=_-x,C=y-x,M=e-P,w=t-R,S=n-A,I=i-C,L=M>w?32:0,O=M>S?16:0,G=w>S?8:0,B=M>I?4:0,$=w>I?2:0,V=S>I?1:0,H=L+O+G+B+$+V,K=a[H][0]>=3?1:0,Q=a[H][1]>=3?1:0,se=a[H][2]>=3?1:0,we=a[H][3]>=3?1:0,j=a[H][0]>=2?1:0,te=a[H][1]>=2?1:0,le=a[H][2]>=2?1:0,ie=a[H][3]>=2?1:0,fe=a[H][0]>=1?1:0,de=a[H][1]>=1?1:0,_e=a[H][2]>=1?1:0,et=a[H][3]>=1?1:0,Be=M-K+c,tt=w-Q+c,N=S-se+c,yt=I-we+c,Oe=M-j+2*c,Ne=w-te+2*c,Re=S-le+2*c,Ke=I-ie+2*c,be=M-fe+3*c,D=w-de+3*c,b=S-_e+3*c,z=I-et+3*c,Z=M-1+4*c,ee=w-1+4*c,Y=S-1+4*c,Se=I-1+4*c,ce=p&255,pe=g&255,Ge=_&255,ne=y&255,xe=o[ce+o[pe+o[Ge+o[ne]]]]%32,De=o[ce+K+o[pe+Q+o[Ge+se+o[ne+we]]]]%32,Le=o[ce+j+o[pe+te+o[Ge+le+o[ne+ie]]]]%32,ye=o[ce+fe+o[pe+de+o[Ge+_e+o[ne+et]]]]%32,Xe=o[ce+1+o[pe+1+o[Ge+1+o[ne+1]]]]%32;let ke=.6-M*M-w*w-S*S-I*I;ke<0?h=0:(ke*=ke,h=ke*ke*this.dot4(s[xe],M,w,S,I));let Ze=.6-Be*Be-tt*tt-N*N-yt*yt;Ze<0?u=0:(Ze*=Ze,u=Ze*Ze*this.dot4(s[De],Be,tt,N,yt));let k=.6-Oe*Oe-Ne*Ne-Re*Re-Ke*Ke;k<0?f=0:(k*=k,f=k*k*this.dot4(s[Le],Oe,Ne,Re,Ke));let oe=.6-be*be-D*D-b*b-z*z;oe<0?d=0:(oe*=oe,d=oe*oe*this.dot4(s[ye],be,D,b,z));let q=.6-Z*Z-ee*ee-Y*Y-Se*Se;return q<0?m=0:(q*=q,m=q*q*this.dot4(s[Xe],Z,ee,Y,Se)),27*(h+u+f+d+m)}}class kn extends ss{constructor(e,t,n,i,s,a,o){super(),this.width=n!==void 0?n:512,this.height=i!==void 0?i:512,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=new Map,this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=Ty(),this.pdNoiseTexture=this.generateNoise(),this.gtaoRenderTarget=new nn(this.width,this.height,{type:Vt}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new gt({defines:Object.assign({},wa.defines),uniforms:Tn.clone(wa.uniforms),vertexShader:wa.vertexShader,fragmentShader:wa.fragmentShader,blending:Ft,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new Ux,this.normalMaterial.blending=Ft,this.pdMaterial=new gt({defines:Object.assign({},Sa.defines),uniforms:Tn.clone(Sa.uniforms),vertexShader:Sa.vertexShader,fragmentShader:Sa.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new gt({defines:Object.assign({},ba.defines),uniforms:Tn.clone(ba.uniforms),vertexShader:ba.vertexShader,fragmentShader:ba.fragmentShader,blending:Ft}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new gt({uniforms:Tn.clone(Er.uniforms),vertexShader:Er.vertexShader,fragmentShader:Er.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:ul,blendDst:dr,blendEquation:bn,blendSrcAlpha:hl,blendDstAlpha:dr,blendEquationAlpha:bn}),this.blendMaterial=new gt({uniforms:Tn.clone(Yo.uniforms),vertexShader:Yo.vertexShader,fragmentShader:Yo.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:sf,blendSrc:ul,blendDst:dr,blendEquation:bn,blendSrcAlpha:hl,blendDstAlpha:dr,blendEquationAlpha:bn}),this.fsQuad=new oo(null),this.originalClearColor=new ue,this.setGBuffer(s?s.depthTexture:void 0,s?s.normalTexture:void 0),a!==void 0&&this.updateGtaoMaterial(a),o!==void 0&&this.updatePdMaterial(o)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this.fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){e!==void 0?(this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1):(this.depthTexture=new wc,this.depthTexture.format=es,this.depthTexture.type=Qi,this.normalRenderTarget=new nn(this.width,this.height,{minFilter:Ot,magFilter:Ot,type:Vt,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);const n=this.normalTexture?1:0,i=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){e?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(e){e.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=e.radius),e.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent),e.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=e.thickness),e.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),e.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=e.scale),e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0),e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(e){let t=!1;e.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi),e.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=e.depthPhi),e.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=e.normalPhi),e.radius!==void 0&&e.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=e.radius),e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=e.radiusExponent,t=!0),e.rings!==void 0&&e.rings!==this.pdRings&&(this.pdRings=e.rings,t=!0),e.samples!==void 0&&e.samples!==this.pdSamples&&(this.pdSamples=e.samples,t=!0),t&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Qf(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(e,t,n){switch(this._renderGBuffer&&(this.overrideVisibility(),this.renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this.restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this.renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case kn.OUTPUT.Off:break;case kn.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Ft,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case kn.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=Ft,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case kn.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=Ft,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case kn.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case kn.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=Ft,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case kn.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Ft,this.renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}renderPass(e,t,n,i,s){e.getClearColor(this.originalClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,i!=null&&(e.setClearColor(i),e.setClearAlpha(s||0),e.clear()),this.fsQuad.material=t,this.fsQuad.render(e),e.autoClear=o,e.setClearColor(this.originalClearColor),e.setClearAlpha(a)}renderOverride(e,t,n,i,s){e.getClearColor(this.originalClearColor);const a=e.getClearAlpha(),o=e.autoClear;e.setRenderTarget(n),e.autoClear=!1,i=t.clearColor||i,s=t.clearAlpha||s,i!=null&&(e.setClearColor(i),e.setClearAlpha(s||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this.originalClearColor),e.setClearAlpha(a)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}overrideVisibility(){const e=this.scene,t=this._visibilityCache;e.traverse(function(n){t.set(n,n.visible),(n.isPoints||n.isLine)&&(n.visible=!1)})}restoreVisibility(){const e=this.scene,t=this._visibilityCache;e.traverse(function(n){const i=t.get(n);n.visible=i}),t.clear()}generateNoise(e=64){const t=new Ry,n=e*e*4,i=new Uint8Array(n);for(let a=0;a<e;a++)for(let o=0;o<e;o++){const l=a,c=o;i[(a*e+o)*4]=(t.noise(l,c)*.5+.5)*255,i[(a*e+o)*4+1]=(t.noise(l+e,c)*.5+.5)*255,i[(a*e+o)*4+2]=(t.noise(l,c+e)*.5+.5)*255,i[(a*e+o)*4+3]=(t.noise(l+e,c+e)*.5+.5)*255}const s=new ns(i,e,e,Yt,zn);return s.wrapS=Pn,s.wrapT=Pn,s.needsUpdate=!0,s}}kn.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};class Cy extends $x{constructor(e){super(e),this.type=Vt}parse(e){const a=function(C,M){switch(C){case 1:throw new Error("THREE.RGBELoader: Read Error: "+(M||""));case 2:throw new Error("THREE.RGBELoader: Write Error: "+(M||""));case 3:throw new Error("THREE.RGBELoader: Bad File Format: "+(M||""));default:case 4:throw new Error("THREE.RGBELoader: Memory Error: "+(M||""))}},h=`
`,u=function(C,M,w){M=M||1024;let I=C.pos,L=-1,O=0,G="",B=String.fromCharCode.apply(null,new Uint16Array(C.subarray(I,I+128)));for(;0>(L=B.indexOf(h))&&O<M&&I<C.byteLength;)G+=B,O+=B.length,I+=128,B+=String.fromCharCode.apply(null,new Uint16Array(C.subarray(I,I+128)));return-1<L?(C.pos+=O+L+1,G+B.slice(0,L)):!1},f=function(C){const M=/^#\?(\S+)/,w=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,S=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,I=/^\s*FORMAT=(\S+)\s*$/,L=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,O={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0};let G,B;for((C.pos>=C.byteLength||!(G=u(C)))&&a(1,"no header found"),(B=G.match(M))||a(3,"bad initial token"),O.valid|=1,O.programtype=B[1],O.string+=G+`
`;G=u(C),G!==!1;){if(O.string+=G+`
`,G.charAt(0)==="#"){O.comments+=G+`
`;continue}if((B=G.match(w))&&(O.gamma=parseFloat(B[1])),(B=G.match(S))&&(O.exposure=parseFloat(B[1])),(B=G.match(I))&&(O.valid|=2,O.format=B[1]),(B=G.match(L))&&(O.valid|=4,O.height=parseInt(B[1],10),O.width=parseInt(B[2],10)),O.valid&2&&O.valid&4)break}return O.valid&2||a(3,"missing format specifier"),O.valid&4||a(3,"missing image size specifier"),O},d=function(C,M,w){const S=M;if(S<8||S>32767||C[0]!==2||C[1]!==2||C[2]&128)return new Uint8Array(C);S!==(C[2]<<8|C[3])&&a(3,"wrong scanline width");const I=new Uint8Array(4*M*w);I.length||a(4,"unable to allocate buffer space");let L=0,O=0;const G=4*S,B=new Uint8Array(4),$=new Uint8Array(G);let V=w;for(;V>0&&O<C.byteLength;){O+4>C.byteLength&&a(1),B[0]=C[O++],B[1]=C[O++],B[2]=C[O++],B[3]=C[O++],(B[0]!=2||B[1]!=2||(B[2]<<8|B[3])!=S)&&a(3,"bad rgbe scanline format");let H=0,K;for(;H<G&&O<C.byteLength;){K=C[O++];const se=K>128;if(se&&(K-=128),(K===0||H+K>G)&&a(3,"bad scanline data"),se){const we=C[O++];for(let j=0;j<K;j++)$[H++]=we}else $.set(C.subarray(O,O+K),H),H+=K,O+=K}const Q=S;for(let se=0;se<Q;se++){let we=0;I[L]=$[se+we],we+=S,I[L+1]=$[se+we],we+=S,I[L+2]=$[se+we],we+=S,I[L+3]=$[se+we],L+=4}V--}return I},m=function(C,M,w,S){const I=C[M+3],L=Math.pow(2,I-128)/255;w[S+0]=C[M+0]*L,w[S+1]=C[M+1]*L,w[S+2]=C[M+2]*L,w[S+3]=1},v=function(C,M,w,S){const I=C[M+3],L=Math.pow(2,I-128)/255;w[S+0]=Jr.toHalfFloat(Math.min(C[M+0]*L,65504)),w[S+1]=Jr.toHalfFloat(Math.min(C[M+1]*L,65504)),w[S+2]=Jr.toHalfFloat(Math.min(C[M+2]*L,65504)),w[S+3]=Jr.toHalfFloat(1)},p=new Uint8Array(e);p.pos=0;const g=f(p),_=g.width,y=g.height,x=d(p.subarray(p.pos),_,y);let P,R,A;switch(this.type){case en:A=x.length/4;const C=new Float32Array(A*4);for(let w=0;w<A;w++)m(x,w*4,C,w*4);P=C,R=en;break;case Vt:A=x.length/4;const M=new Uint16Array(A*4);for(let w=0;w<A;w++)v(x,w*4,M,w*4);P=M,R=Vt;break;default:throw new Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:_,height:y,data:P,header:g.string,gamma:g.gamma,exposure:g.exposure,type:R}}setDataType(e){return this.type=e,this}load(e,t,n,i){function s(a,o){switch(a.type){case en:case Vt:a.colorSpace=Wt,a.minFilter=Tt,a.magFilter=Tt,a.generateMipmaps=!1,a.flipY=!0;break}t&&t(a,o)}return super.load(e,s,n,i)}}function Mu(r,e){if(e===Tp)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),r;if(e===ql||e===Sf){let t=r.getIndex();if(t===null){const a=[],o=r.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);r.setIndex(a),t=r.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),r}const n=t.count-2,i=[];if(e===ql)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=r.clone();return s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),r}class Py extends is{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Ny(t)}),this.register(function(t){return new Uy(t)}),this.register(function(t){return new Xy(t)}),this.register(function(t){return new qy(t)}),this.register(function(t){return new jy(t)}),this.register(function(t){return new Oy(t)}),this.register(function(t){return new By(t)}),this.register(function(t){return new zy(t)}),this.register(function(t){return new Hy(t)}),this.register(function(t){return new ky(t)}),this.register(function(t){return new Vy(t)}),this.register(function(t){return new Fy(t)}),this.register(function(t){return new Wy(t)}),this.register(function(t){return new Gy(t)}),this.register(function(t){return new Iy(t)}),this.register(function(t){return new $y(t)}),this.register(function(t){return new Yy(t)})}load(e,t,n,i){const s=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const c=Tr.extractUrlBase(e);a=Tr.resolveURL(c,this.path)}else a=Tr.extractUrlBase(e);this.manager.itemStart(e);const o=function(c){i?i(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new Ic(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,a,function(h){t(h),s.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let s;const a={},o={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===ed){try{a[We.KHR_BINARY_GLTF]=new Ky(e)}catch(u){i&&i(u);return}s=JSON.parse(a[We.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new cM(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(s.extensionsUsed)for(let h=0;h<s.extensionsUsed.length;++h){const u=s.extensionsUsed[h],f=s.extensionsRequired||[];switch(u){case We.KHR_MATERIALS_UNLIT:a[u]=new Ly;break;case We.KHR_DRACO_MESH_COMPRESSION:a[u]=new Zy(s,this.dracoLoader);break;case We.KHR_TEXTURE_TRANSFORM:a[u]=new Jy;break;case We.KHR_MESH_QUANTIZATION:a[u]=new Qy;break;default:f.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function Dy(){let r={};return{get:function(e){return r[e]},add:function(e,t){r[e]=t},remove:function(e){delete r[e]},removeAll:function(){r={}}}}const We={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Iy{constructor(e){this.parser=e,this.name=We.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const s=t.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e];let c;const h=new ue(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Wt);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new kc(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new ln(h),c.distance=u;break;case"spot":c=new Jx(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,si(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,s=n.json.nodes[e],o=(s.extensions&&s.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}}class Ly{constructor(){this.name=We.KHR_MATERIALS_UNLIT}getMaterialType(){return lt}extendParams(e,t,n){const i=[];e.color=new ue(1,1,1),e.opacity=1;const s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const a=s.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Wt),e.opacity=a[3]}s.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",s.baseColorTexture,ut))}return Promise.all(i)}}class ky{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}}class Ny{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ae(o,o)}return Promise.all(s)}}class Uy{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class Fy{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(s)}}class Oy{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[];t.sheenColor=new ue(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Wt)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,ut)),a.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(s)}}class By{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(s)}}class zy{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new ue().setRGB(o[0],o[1],o[2],Wt),Promise.all(s)}}class Hy{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class Vy{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new ue().setRGB(o[0],o[1],o[2],Wt),a.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,ut)),Promise.all(s)}}class Gy{constructor(e){this.parser=e,this.name=We.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(s)}}class Wy{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Gn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const s=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(s)}}class Xy{constructor(e){this.parser=e,this.name=We.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const s=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,a)}}class qy{constructor(e){this.parser=e,this.name=We.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,a.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class jy{constructor(e){this.parser=e,this.name=We.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;const a=s.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,a.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class $y{constructor(e){this.name=We.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(o){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,f=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,f,i.mode,i.filter).then(function(d){return d.buffer}):a.ready.then(function(){const d=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(d),h,u,f,i.mode,i.filter),d})})}else return null}}class Yy{constructor(e){this.name=We.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==dn.TRIANGLES&&c.mode!==dn.TRIANGLE_STRIP&&c.mode!==dn.TRIANGLE_FAN&&c.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],l={};for(const c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{const h=c.pop(),u=h.isGroup?h.children:[h],f=c[0].count,d=[];for(const m of u){const v=new Pe,p=new T,g=new Lt,_=new T(1,1,1),y=new qi(m.geometry,m.material,f);for(let x=0;x<f;x++)l.TRANSLATION&&p.fromBufferAttribute(l.TRANSLATION,x),l.ROTATION&&g.fromBufferAttribute(l.ROTATION,x),l.SCALE&&_.fromBufferAttribute(l.SCALE,x),y.setMatrixAt(x,v.compose(p,g,_));for(const x in l)if(x==="_COLOR_0"){const P=l[x];y.instanceColor=new Zl(P.array,P.itemSize,P.normalized)}else x!=="TRANSLATION"&&x!=="ROTATION"&&x!=="SCALE"&&m.geometry.setAttribute(x,l[x]);ct.prototype.copy.call(y,m),this.parser.assignFinalMaterial(y),d.push(y)}return h.isGroup?(h.clear(),h.add(...d),h):d[0]}))}}const ed="glTF",lr=12,wu={JSON:1313821514,BIN:5130562};class Ky{constructor(e){this.name=We.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,lr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==ed)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-lr,s=new DataView(e,lr);let a=0;for(;a<i;){const o=s.getUint32(a,!0);a+=4;const l=s.getUint32(a,!0);if(a+=4,l===wu.JSON){const c=new Uint8Array(e,lr+a,o);this.content=n.decode(c)}else if(l===wu.BIN){const c=lr+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class Zy{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=We.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(const h in a){const u=ec[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=ec[h]||h.toLowerCase();if(a[h]!==void 0){const f=n.accessors[e.attributes[h]],d=Ns[f.componentType];c[u]=d.name,l[u]=f.normalized===!0}}return t.getDependency("bufferView",s).then(function(h){return new Promise(function(u,f){i.decodeDracoFile(h,function(d){for(const m in d.attributes){const v=d.attributes[m],p=l[m];p!==void 0&&(v.normalized=p)}u(d)},o,c,Wt,f)})})}}class Jy{constructor(){this.name=We.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class Qy{constructor(){this.name=We.KHR_MESH_QUANTIZATION}}class td extends kr{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[s+a];return t}interpolate_(e,t,n,i){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=i-t,u=(n-t)/h,f=u*u,d=f*u,m=e*c,v=m-c,p=-2*d+3*f,g=d-f,_=1-p,y=g-f+u;for(let x=0;x!==o;x++){const P=a[v+x+o],R=a[v+x+l]*h,A=a[m+x+o],C=a[m+x]*h;s[x]=_*P+y*R+p*A+g*C}return s}}const eM=new Lt;class tM extends td{interpolate_(e,t,n,i){const s=super.interpolate_(e,t,n,i);return eM.fromArray(s).normalize().toArray(s),s}}const dn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Ns={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},bu={9728:Ot,9729:Tt,9984:ff,9985:Pa,9986:pr,9987:Rn},Su={33071:Bn,33648:Ga,10497:Pn},Ko={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},ec={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},wi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},nM={CUBICSPLINE:void 0,LINEAR:Dr,STEP:Pr},Zo={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function iM(r){return r.DefaultMaterial===void 0&&(r.DefaultMaterial=new St({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ci})),r.DefaultMaterial}function Vi(r,e,t){for(const n in t.extensions)r[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function si(r,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(r.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function sM(r,e,t){let n=!1,i=!1,s=!1;for(let c=0,h=e.length;c<h;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(s=!0),n&&i&&s)break}if(!n&&!i&&!s)return Promise.resolve(r);const a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){const u=e[c];if(n){const f=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):r.attributes.position;a.push(f)}if(i){const f=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):r.attributes.normal;o.push(f)}if(s){const f=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):r.attributes.color;l.push(f)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){const h=c[0],u=c[1],f=c[2];return n&&(r.morphAttributes.position=h),i&&(r.morphAttributes.normal=u),s&&(r.morphAttributes.color=f),r.morphTargetsRelative=!0,r})}function rM(r,e){if(r.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)r.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(r.morphTargetInfluences.length===t.length){r.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)r.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function aM(r){let e;const t=r.extensions&&r.extensions[We.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Jo(t.attributes):e=r.indices+":"+Jo(r.attributes)+":"+r.mode,r.targets!==void 0)for(let n=0,i=r.targets.length;n<i;n++)e+=":"+Jo(r.targets[n]);return e}function Jo(r){let e="";const t=Object.keys(r).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+r[t[n]]+";";return e}function tc(r){switch(r){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function oM(r){return r.search(/\.jpe?g($|\?)/i)>0||r.search(/^data\:image\/jpeg/)===0?"image/jpeg":r.search(/\.webp($|\?)/i)>0||r.search(/^data\:image\/webp/)===0?"image/webp":r.search(/\.ktx2($|\?)/i)>0||r.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const lM=new Pe;class cM{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Dy,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,s=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const l=o.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,s=o.indexOf("Firefox")>-1,a=s?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||s&&a<98?this.textureLoader=new Yx(this.options.manager):this.textureLoader=new ty(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ic(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return Vi(s,o,i),si(o,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(const l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){const a=t[i].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let i=0,s=e.length;i<s;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),s=(a,o)=>{const l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(const[c,h]of a.children.entries())s(h,o.children[c])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const s=e(t[i]);s&&n.push(s)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[We.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(s,a){n.load(Tr.resolveURL(t.uri,i.path),s,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Ko[i.type],o=Ns[i.componentType],l=i.normalized===!0,c=new o(i.count*a);return Promise.resolve(new wt(c,a,l))}const s=[];return i.bufferView!==void 0?s.push(this.getDependency("bufferView",i.bufferView)):s.push(null),i.sparse!==void 0&&(s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(s).then(function(a){const o=a[0],l=Ko[i.type],c=Ns[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,f=i.byteOffset||0,d=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,m=i.normalized===!0;let v,p;if(d&&d!==u){const g=Math.floor(f/d),_="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+g+":"+i.count;let y=t.cache.get(_);y||(v=new c(o,g*d,i.count*d/h),y=new Hf(v,d/h),t.cache.add(_,y)),p=new Lr(y,l,f%d/h,m)}else o===null?v=new c(i.count*l):v=new c(o,f,i.count*l),p=new wt(v,l,m);if(i.sparse!==void 0){const g=Ko.SCALAR,_=Ns[i.sparse.indices.componentType],y=i.sparse.indices.byteOffset||0,x=i.sparse.values.byteOffset||0,P=new _(a[1],y,i.sparse.count*g),R=new c(a[2],x,i.sparse.count*l);o!==null&&(p=new wt(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let A=0,C=P.length;A<C;A++){const M=P[A];if(p.setX(M,R[A*l]),l>=2&&p.setY(M,R[A*l+1]),l>=3&&p.setZ(M,R[A*l+2]),l>=4&&p.setW(M,R[A*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}p.normalized=m}return p})}loadTexture(e){const t=this.json,n=this.options,s=t.textures[e].source,a=t.images[s];let o=this.textureLoader;if(a.uri){const l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,s,o)}loadTextureImage(e,t,n){const i=this,s=this.json,a=s.textures[e],o=s.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const f=(s.samplers||{})[a.sampler]||{};return h.magFilter=bu[f.magFilter]||Tt,h.minFilter=bu[f.minFilter]||Rn,h.wrapS=Su[f.wrapS]||Pn,h.wrapT=Su[f.wrapT]||Pn,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Ot&&h.minFilter!==Tt,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const a=i.images[e],o=self.URL||self.webkitURL;let l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(u){c=!0;const f=new Blob([u],{type:a.mimeType});return l=o.createObjectURL(f),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(u){return new Promise(function(f,d){let m=f;t.isImageBitmapLoader===!0&&(m=function(v){const p=new At(v);p.needsUpdate=!0,f(p)}),t.load(Tr.resolveURL(u,s.path),m,void 0,d)})}).then(function(u){return c===!0&&o.revokeObjectURL(l),si(u,a),u.userData.mimeType=a.mimeType||oM(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const s=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),s.extensions[We.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[We.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const l=s.associations.get(a);a=s.extensions[We.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),s.associations.set(a,l)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new Ec,gn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new Xf,gn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(i||s||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),s&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),s&&(l.vertexColors=!0),a&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return St}loadMaterial(e){const t=this,n=this.json,i=this.extensions,s=n.materials[e];let a;const o={},l=s.extensions||{},c=[];if(l[We.KHR_MATERIALS_UNLIT]){const u=i[We.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,s,t))}else{const u=s.pbrMetallicRoughness||{};if(o.color=new ue(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const f=u.baseColorFactor;o.color.setRGB(f[0],f[1],f[2],Wt),o.opacity=f[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,ut)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,o)})))}s.doubleSided===!0&&(o.side=mt);const h=s.alphaMode||Zo.OPAQUE;if(h===Zo.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===Zo.MASK&&(o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&a!==lt&&(c.push(t.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new ae(1,1),s.normalTexture.scale!==void 0)){const u=s.normalTexture.scale;o.normalScale.set(u,u)}if(s.occlusionTexture!==void 0&&a!==lt&&(c.push(t.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&a!==lt){const u=s.emissiveFactor;o.emissive=new ue().setRGB(u[0],u[1],u[2],Wt)}return s.emissiveTexture!==void 0&&a!==lt&&c.push(t.assignTexture(o,"emissiveMap",s.emissiveTexture,ut)),Promise.all(c).then(function(){const u=new a(o);return s.name&&(u.name=s.name),si(u,s),t.associations.set(u,{materials:e}),s.extensions&&Vi(i,u,s),u})}createUniqueName(e){const t=st.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function s(o){return n[We.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return Tu(l,o,t)})}const a=[];for(let o=0,l=e.length;o<l;o++){const c=e[o],h=aM(c),u=i[h];if(u)a.push(u.promise);else{let f;c.extensions&&c.extensions[We.KHR_DRACO_MESH_COMPRESSION]?f=s(c):f=Tu(new vt,c,t),i[h]={primitive:c,promise:f},a.push(f)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,s=n.meshes[e],a=s.primitives,o=[];for(let l=0,c=a.length;l<c;l++){const h=a[l].material===void 0?iM(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let d=0,m=h.length;d<m;d++){const v=h[d],p=a[d];let g;const _=c[d];if(p.mode===dn.TRIANGLES||p.mode===dn.TRIANGLE_STRIP||p.mode===dn.TRIANGLE_FAN||p.mode===void 0)g=s.isSkinnedMesh===!0?new mx(v,_):new Ie(v,_),g.isSkinnedMesh===!0&&g.normalizeSkinWeights(),p.mode===dn.TRIANGLE_STRIP?g.geometry=Mu(g.geometry,Sf):p.mode===dn.TRIANGLE_FAN&&(g.geometry=Mu(g.geometry,ql));else if(p.mode===dn.LINES)g=new _x(v,_);else if(p.mode===dn.LINE_STRIP)g=new Tc(v,_);else if(p.mode===dn.LINE_LOOP)g=new xx(v,_);else if(p.mode===dn.POINTS)g=new Ac(v,_);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+p.mode);Object.keys(g.geometry.morphAttributes).length>0&&rM(g,s),g.name=t.createUniqueName(s.name||"mesh_"+e),si(g,s),p.extensions&&Vi(i,g,p),t.assignFinalMaterial(g),u.push(g)}for(let d=0,m=u.length;d<m;d++)t.associations.set(u[d],{meshes:e,primitives:d});if(u.length===1)return s.extensions&&Vi(i,u[0],s),u[0];const f=new It;s.extensions&&Vi(i,f,s),t.associations.set(f,{meshes:e});for(let d=0,m=u.length;d<m;d++)f.add(u[d]);return f})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new $t(qa.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new no(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),si(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const s=i.pop(),a=i,o=[],l=[];for(let c=0,h=a.length;c<h;c++){const u=a[c];if(u){o.push(u);const f=new Pe;s!==null&&f.fromArray(s.array,c*16),l.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Sc(o,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,f=i.channels.length;u<f;u++){const d=i.channels[u],m=i.samplers[d.sampler],v=d.target,p=v.node,g=i.parameters!==void 0?i.parameters[m.input]:m.input,_=i.parameters!==void 0?i.parameters[m.output]:m.output;v.node!==void 0&&(a.push(this.getDependency("node",p)),o.push(this.getDependency("accessor",g)),l.push(this.getDependency("accessor",_)),c.push(m),h.push(v))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){const f=u[0],d=u[1],m=u[2],v=u[3],p=u[4],g=[];for(let _=0,y=f.length;_<y;_++){const x=f[_],P=d[_],R=m[_],A=v[_],C=p[_];if(x===void 0)continue;x.updateMatrix&&x.updateMatrix();const M=n._createAnimationTracks(x,P,R,A,C);if(M)for(let w=0;w<M.length;w++)g.push(M[w])}return new Ql(s,void 0,g)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(s){const a=n._getNodeRef(n.meshCache,i.mesh,s);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=i.weights.length;l<c;l++)o.morphTargetInfluences[l]=i.weights[l]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),a=[],o=i.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(a),l]).then(function(c){const h=c[0],u=c[1],f=c[2];f!==null&&h.traverse(function(d){d.isSkinnedMesh&&d.bind(f,lM)});for(let d=0,m=u.length;d<m;d++)h.add(u[d]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const s=t.nodes[e],a=s.name?i.createUniqueName(s.name):"",o=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),s.camera!==void 0&&o.push(i.getDependency("camera",s.camera).then(function(c){return i._getNodeRef(i.cameraCache,s.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(s.isBone===!0?h=new Wf:c.length>1?h=new It:c.length===1?h=c[0]:h=new ct,h!==c[0])for(let u=0,f=c.length;u<f;u++)h.add(c[u]);if(s.name&&(h.userData.name=s.name,h.name=a),si(h,s),s.extensions&&Vi(n,h,s),s.matrix!==void 0){const u=new Pe;u.fromArray(s.matrix),h.applyMatrix4(u)}else s.translation!==void 0&&h.position.fromArray(s.translation),s.rotation!==void 0&&h.quaternion.fromArray(s.rotation),s.scale!==void 0&&h.scale.fromArray(s.scale);return i.associations.has(h)||i.associations.set(h,{}),i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,s=new It;n.name&&(s.name=i.createUniqueName(n.name)),si(s,n),n.extensions&&Vi(t,s,n);const a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(i.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++)s.add(l[h]);const c=h=>{const u=new Map;for(const[f,d]of i.associations)(f instanceof gn||f instanceof At)&&u.set(f,d);return h.traverse(f=>{const d=i.associations.get(f);d!=null&&u.set(f,d)}),u};return i.associations=c(s),s})}_createAnimationTracks(e,t,n,i,s){const a=[],o=e.name?e.name:e.uuid,l=[];wi[s.path]===wi.weights?e.traverse(function(f){f.morphTargetInfluences&&l.push(f.name?f.name:f.uuid)}):l.push(o);let c;switch(wi[s.path]){case wi.weights:c=Hs;break;case wi.rotation:c=Vs;break;case wi.position:case wi.scale:c=Gs;break;default:switch(n.itemSize){case 1:c=Hs;break;case 2:case 3:default:c=Gs;break}break}const h=i.interpolation!==void 0?nM[i.interpolation]:Dr,u=this._getArrayFromAccessor(n);for(let f=0,d=l.length;f<d;f++){const m=new c(l[f]+"."+wi[s.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(m),a.push(m)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=tc(t.constructor),i=new Float32Array(t.length);for(let s=0,a=t.length;s<a;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Vs?tM:td;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function hM(r,e,t){const n=e.attributes,i=new Dn;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(i.set(new T(l[0],l[1],l[2]),new T(c[0],c[1],c[2])),o.normalized){const h=tc(Ns[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=e.targets;if(s!==void 0){const o=new T,l=new T;for(let c=0,h=s.length;c<h;c++){const u=s[c];if(u.POSITION!==void 0){const f=t.json.accessors[u.POSITION],d=f.min,m=f.max;if(d!==void 0&&m!==void 0){if(l.setX(Math.max(Math.abs(d[0]),Math.abs(m[0]))),l.setY(Math.max(Math.abs(d[1]),Math.abs(m[1]))),l.setZ(Math.max(Math.abs(d[2]),Math.abs(m[2]))),f.normalized){const v=tc(Ns[f.componentType]);l.multiplyScalar(v)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}r.boundingBox=i;const a=new Vn;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,r.boundingSphere=a}function Tu(r,e,t){const n=e.attributes,i=[];function s(a,o){return t.getDependency("accessor",a).then(function(l){r.setAttribute(o,l)})}for(const a in n){const o=ec[a]||a.toLowerCase();o in r.attributes||i.push(s(n[a],o))}if(e.indices!==void 0&&!r.index){const a=t.getDependency("accessor",e.indices).then(function(o){r.setIndex(o)});i.push(a)}return qe.workingColorSpace!==Wt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${qe.workingColorSpace}" not supported.`),si(r,e),hM(r,e,t),Promise.all(i).then(function(){return e.targets!==void 0?sM(r,e.targets,t):r})}function uM(r){const e=new Map,t=new Map,n=r.clone();return nd(r,n,function(i,s){e.set(s,i),t.set(i,s)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const s=i,a=e.get(i),o=a.skeleton.bones;s.skeleton=a.skeleton.clone(),s.bindMatrix.copy(a.bindMatrix),s.skeleton.bones=o.map(function(l){return t.get(l)}),s.bind(s.skeleton,s.bindMatrix)}),n}function nd(r,e,t){t(r,e);for(let n=0;n<r.children.length;n++)nd(r.children[n],e.children[n],t)}const fM=new Py,Qo=new Map,dM="./models/";let nc=null,Eu=0,Au=0;function pM(r){nc=r}function Mt(r){if(!Qo.has(r)){Eu++;const e=fM.loadAsync(dM+r).then(t=>{t.scene.traverse(i=>{if(i.isMesh){i.castShadow=!0,i.receiveShadow=!0;const s=Array.isArray(i.material)?i.material:[i.material];for(const a of s)a.map&&(a.map.anisotropy=4,a.map.colorSpace=ut),a.roughness!==void 0&&(a.roughness=Math.max(.55,a.roughness),a.metalness=Math.min(a.metalness,.1))}});const n=new Dn().setFromObject(t.scene);return t.box=n,r.startsWith("kk/")&&!r.startsWith("kk/Rig_")&&!r.endsWith(".gltf")?mM().then(i=>(t.animations=i,t)):t}).finally(()=>{Au++,nc&&nc(Au,Eu)});Qo.set(r,e)}return Qo.get(r)}const Ru={Idle_A:"idle",Walking_A:"walk",Running_A:"run",Hit_A:"hit",Hit_B:"recievehit",Death_A:"death",Throw:"attack",Use_Item:"spell1",Idle_B:"idle_weapon",Interact:"interact"};let el=null;function mM(){return el||(el=Promise.all([Mt("kk/Rig_Medium_General.glb"),Mt("kk/Rig_Medium_MovementBasic.glb")]).then(r=>{const e=[];for(const t of r)for(const n of t.animations)if(Ru[n.name]){const i=n.clone();i.name=Ru[n.name],e.push(i)}return e})),el}const gM={andrew:"kk:Knight",marco:"kk:Mage",teresa:"kk:Rogue",rico:"kk:Ranger",andy:"kk:Barbarian"},vM={andrew:.46,marco:.46,teresa:.46,rico:.5,andy:.54},_M={shop:["kk:Rogue_Hooded","#ffd8a0",.44],elder:["kk:Mage","#b8c8ff",.44],kid:["kk:Rogue","#ffc0d0",.32],guard:["kk:Knight","#d8c0b0",.46],inn:["kk:Rogue","#ffe8c0",.44],smith:["kk:Barbarian","#d0a080",.5],trader:["kk:Ranger","#b0d8ff",.44],sage:["kk:Mage","#c0ffd0",.46],kid2:["kk:Rogue_Hooded","#ffd0f0",.32],angler:["kk:Ranger","#c0f0ff",.44],casino:["kk:Rogue_Hooded","#ffa0d8",.44],arena:["kk:Mage","#ffe08a",.46]},Cu={andrew:["sword_A","sword_B","sword_C","sword_D","sword_E"],marco:["staff_A","staff_B"],teresa:["wand_A","staff_A"],rico:["bow_A_withString","bow_B_withString"],andy:["hammer_A","hammer_B","hammer_C"]},Pu={rico:"handslotl"},Du={andrew:"kk/shield_badge_color.gltf",andy:"kk/shield_round_barbarian.gltf"},xM=r=>r.model.startsWith("kk:")?`kk/${r.model.slice(3)}.glb`:r.model.startsWith("bestiary:")?`bestiary/${r.model.slice(9)}.glb`:`mon_${r.model}.glb`,Iu=r=>r.startsWith("kk:")?`kk/${r.slice(3)}.glb`:`hero_${r}.glb`,Lu={"kk:Skeleton_Warrior":"kk/Skeleton_Blade.gltf","kk:Skeleton_Minion":"kk/Skeleton_Axe.gltf","kk:Skeleton_Rogue":"kk/Skeleton_Blade.gltf","kk:Skeleton_Mage":"kk/Skeleton_Staff.gltf"};function Ta(r,e,t){const n=uM(r.scene);if(t){const c=new ue(t);n.traverse(h=>{if(!h.isMesh)return;const u=f=>{const d=f.clone();return d.color=d.color.clone().multiply(c),d};h.material=Array.isArray(h.material)?h.material.map(u):u(h.material),h.userData.ownMat=!0})}const i=r.box,s=e/Math.max(.01,i.max.y-i.min.y);n.scale.setScalar(s),n.position.y=-i.min.y*s;const a=new It,o=new It;o.add(n),a.add(o);const l={root:a,pivot:o,inst:n,mixer:null,clips:r.animations,state:"",cur:null,h:e};return l.mixer=r.animations.length?new my(n):MM(l),l}function yM(r,e=68){r.updateMatrixWorld(!0);for(const t of["l","r"]){const n=r.getObjectByName("upperarm_"+t),i=r.getObjectByName("lowerarm_"+t);if(!n||!i||!n.parent)continue;const s=new T().setFromMatrixPosition(n.matrixWorld),a=new T().setFromMatrixPosition(i.matrixWorld);r.worldToLocal(s),r.worldToLocal(a);const o=qa.degToRad(e)*(a.x>s.x?-1:1),l=new Lt().setFromAxisAngle(new T(0,0,1),o),c=r.getWorldQuaternion(new Lt),h=n.parent.getWorldQuaternion(new Lt),u=c.clone().multiply(l).multiply(c.clone().invert());n.quaternion.premultiply(h.clone().invert().multiply(u).multiply(h)),n.updateMatrixWorld(!0)}}function MM(r){yM(r.inst);const e=r.inst.position.y;let t=Math.random()*6;return{update(n){if(t+=n,r.dead){r.inst.rotation.x=Math.max(-1.45,r.inst.rotation.x-n*3),r.inst.position.y=e-Math.min(1,-r.inst.rotation.x)*r.h*.1;return}const i=r.state==="walk"||r.state==="run";r.inst.position.y=e+Math.abs(Math.sin(t*(i?9:2.4)))*r.h*(i?.06:.025),r.inst.rotation.z=Math.sin(t*(i?4.5:1.2))*(i?.08:.035),r.inst.rotation.x=Math.sin(t*1.7)*.03},clipAction(){return null},stopAllAction(){}}}function Fa(r,e){const t=e.toLowerCase();for(const n of r.clips){const i=n.name.toLowerCase();if(i.endsWith("|"+t)||i.endsWith("_"+t)||i===t)return n}for(const n of r.clips)if(n.name.toLowerCase().includes(t))return n;return null}function id(r,e,t,n){const i=r.mixer.clipAction(e);return i.reset(),i.setLoop(t?bf:wf,t?1/0:1),i.clampWhenFinished=!t,i.enabled=!0,i.setEffectiveWeight(1),r.cur&&r.cur!==i&&i.crossFadeFrom(r.cur,n,!1),i.play(),r.cur=i,i}function Ln(r,e){if(!r.mixer||r.state===e)return;const t=Fa(r,e)||Fa(r,"idle")||Fa(r,"flying");if(!t){r.clips.length||(r.state=e);return}id(r,t,!0,.15),r.state=e}function on(r,e,t="idle"){if(!r.mixer)return!1;let n=null;for(const i of[].concat(e))if(n=Fa(r,i),n)break;return n?(id(r,n,!1,.08),r.state="once",r.onFin&&r.mixer.removeEventListener("finished",r.onFin),r.onFin=i=>{i.action===r.cur&&(r.mixer.removeEventListener("finished",r.onFin),r.onFin=null,t&&(r.state="",Ln(r,t)))},r.mixer.addEventListener("finished",r.onFin),!0):!1}function vr(r,e,t){let n=r*374761393+e*668265263+t*982451653|0;return n=Math.imul(n^n>>>13,1274126177),((n^n>>>16)>>>0)/4294967296}function wM(r,e,t,n){const i=Math.floor(r),s=Math.floor(e),a=r-i,o=e-s,l=a*a*(3-2*a),c=o*o*(3-2*o),h=v=>(v%t+t)%t,u=vr(h(i),h(s),n),f=vr(h(i+1),h(s),n),d=vr(h(i),h(s+1),n),m=vr(h(i+1),h(s+1),n);return u+(f-u)*l+(d-u)*c+(u-f-d+m)*l*c}function bi(r,e,t,n,i=5){let s=0,a=.5,o=1,l=0;for(let c=0;c<i;c++)s+=wM(r*o,e*o,t*o,n+c)*a,l+=a,a*=.5,o*=2;return s/l}function Ea(r,e,t){const n=new Float32Array(r*r);for(let l=0;l<r;l++)for(let c=0;c<r;c++)n[l*r+c]=e(c/r,l/r);const i=new Uint8Array(r*r*4),s=new Uint8Array(r*r*4),a=(l,c)=>n[(c+r)%r*r+(l+r)%r];for(let l=0;l<r;l++)for(let c=0;c<r;c++){const h=(l*r+c)*4,u=a(c,l),f=t(u,c/r,l/r);i[h]=i[h+1]=i[h+2]=Math.max(0,Math.min(255,f*255)),i[h+3]=255;const d=(a(c+1,l)-a(c-1,l))*r*.012,m=(a(c,l+1)-a(c,l-1))*r*.012,v=Math.hypot(d,m,1);s[h]=(-d/v*.5+.5)*255,s[h+1]=(m/v*.5+.5)*255,s[h+2]=(1/v*.5+.5)*255,s[h+3]=255}const o=(l,c)=>{const h=new ns(l,r,r,Yt);return h.wrapS=h.wrapT=Pn,h.magFilter=Tt,h.minFilter=Rn,h.generateMipmaps=!0,h.anisotropy=8,c&&(h.colorSpace=ut),h.needsUpdate=!0,h};return{map:o(i,!0),normal:o(s,!1)}}const cn={};function Oa(r){if(cn[r])return cn[r];const e=256;let t;return r==="tile"?t=Ea(e,(n,i)=>{const s=n*2%1,a=i*2%1,o=Math.min(s,1-s,a,1-a);return Math.min(1,o/.04)*.6+bi(n*8,i*8,8,3)*.4},(n,i,s)=>.62+n*.38+(vr(Math.floor(i*2),Math.floor(s*2),9)-.5)*.12):r==="crack"?t=Ea(e,(n,i)=>{const s=bi(n*6,i*6,6,5),a=Math.abs(bi(n*4,i*4,4,11)-.5);return s*.6+Math.min(1,a*9)*.4},n=>.55+n*.45):r==="snow"?t=Ea(e,(n,i)=>bi(n*6,i*6,6,21)*.8+bi(n*24,i*24,24,4)*.2,n=>.9+n*.1):t=Ea(e,(n,i)=>bi(n*10,i*10,10,7)*.55+bi(n*40,i*40,40,13)*.45,(n,i,s)=>.7+n*.3+(bi(i*3,s*3,3,2)-.5)*.18),cn[r]=t,t}function sd(){if(cn.dot)return cn.dot;const r=document.createElement("canvas");r.width=r.height=64;const e=r.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.25,"rgba(255,255,255,0.8)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);const n=new so(r);return n.colorSpace=ut,cn.dot=n,n}function bM(){if(cn.slash)return cn.slash;const r=document.createElement("canvas");r.width=256,r.height=128;const e=r.getContext("2d"),t=e.createLinearGradient(0,0,256,0);t.addColorStop(0,"rgba(255,255,255,0)"),t.addColorStop(.6,"rgba(255,255,255,0.9)"),t.addColorStop(1,"rgba(255,255,255,1)"),e.strokeStyle=t,e.lineCap="round";for(let i=0;i<3;i++)e.lineWidth=10-i*3,e.globalAlpha=1-i*.25,e.beginPath(),e.ellipse(128,128,118-i*4,100-i*10,0,Math.PI*1.08,Math.PI*1.92),e.stroke();const n=new so(r);return n.colorSpace=ut,cn.slash=n,n}function tl(){if(cn.blob)return cn.blob;const r=document.createElement("canvas");r.width=r.height=64;const e=r.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);return t.addColorStop(0,"rgba(0,0,0,0.55)"),t.addColorStop(.6,"rgba(0,0,0,0.25)"),t.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=t,e.fillRect(0,0,64,64),cn.blob=new so(r),cn.blob}function ku(r,e,t,n,i,s=1){const a=new gt({side:Gt,depthWrite:!1,fog:!1,uniforms:{top:{value:new ue(r)},hor:{value:new ue(e)},bot:{value:new ue(t)},sunDir:{value:n.clone().normalize()},sunCol:{value:new ue(i)},sunSize:{value:s}},vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }",fragmentShader:`uniform vec3 top, hor, bot, sunCol, sunDir; uniform float sunSize; varying vec3 vDir;
      void main(){ vec3 d = normalize(vDir); float y = d.y;
        vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y,0.0,1.0), 0.55)) : mix(hor, bot, pow(clamp(-y,0.0,1.0), 0.4));
        float s = max(dot(d, sunDir), 0.0);
        c += sunCol * (pow(s, 900.0/sunSize) * 6.0 + pow(s, 12.0) * 0.35 + pow(s, 3.0) * 0.12);
        gl_FragColor = vec4(c, 1.0); }`}),o=new Ie(new ki(400,32,16),a);return o.frustumCulled=!1,o.renderOrder=-10,o}function SM(r,e,t,n,i,s,a){return new gt({transparent:!0,depthWrite:!1,fog:!0,uniforms:Tn.merge([he.fog,{t:{value:0},col:{value:new ue(e)},depthTex:{value:t},area:{value:n},skyTop:{value:new ue(i)},skyHor:{value:new ue(s)},sunDir:{value:a.clone().normalize()},mode:{value:r==="lava"?1:r==="void"?2:r==="glitter"?3:0}}]),vertexShader:`varying vec3 vW; varying vec2 vUv; 
${Fe.fog_pars_vertex}

      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vUv = uv; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition; 
${Fe.fog_vertex}
 }`,fragmentShader:`uniform float t; uniform vec3 col, skyTop, skyHor, sunDir; uniform sampler2D depthTex; uniform vec4 area; uniform int mode;
      varying vec3 vW; varying vec2 vUv; 
${Fe.fog_pars_fragment}

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
        
${Fe.fog_fragment}

      }`})}const rd={t:{value:0}},Xs={p:{value:new T},on:{value:0}};function ic(r,e=.06,t=1.5,n=!1){return r.onBeforeCompile=i=>{i.uniforms.windT=rd.t,n&&(i.uniforms.occP=Xs.p,i.uniforms.occOn=Xs.on,i.vertexShader=`varying vec3 vOccW;
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
      }`)},r.customProgramCacheKey=()=>"wind"+e+"_"+t+(n?"c":""),r}function ad(r,e,t,n=new T(26,8,20)){const i=new vt,s=new Float32Array(e*3),a=new Float32Array(e);for(let h=0;h<e;h++)s[h*3]=Math.random()*n.x,s[h*3+1]=Math.random()*n.y,s[h*3+2]=Math.random()*n.z,a[h]=Math.random();i.setAttribute("position",new wt(s,3)),i.setAttribute("rnd",new wt(a,1));const o={pollen:0,snow:1,ember:2,dust:3,glitter:4,spark:5}[r]??0,l=new gt({transparent:!0,depthWrite:!1,blending:o===1||o===3?Ki:Qt,uniforms:{t:{value:0},center:{value:new T},box:{value:n},col:{value:new ue(t)},tex:{value:sd()},mode:{value:o},scale:{value:300}},vertexShader:`uniform float t, scale; uniform vec3 center, box; uniform int mode; attribute float rnd; varying float vA; varying float vR;
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
        gl_FragColor = vec4(c * (mode == 1 || mode == 3 ? 1.0 : 2.2), a); }`}),c=new Ac(i,l);return c.frustumCulled=!1,c}function nl(r){return r.onBeforeCompile=e=>{e.uniforms.occP=Xs.p,e.uniforms.occOn=Xs.on,e.vertexShader=`varying vec3 vOccW;
`+e.vertexShader.replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
      {
        vec4 ow = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          ow = instanceMatrix * ow;
        #endif
        vOccW = (modelMatrix * ow).xyz;
      }`),e.fragmentShader=`uniform vec3 occP; uniform float occOn; varying vec3 vOccW;
`+e.fragmentShader.replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
      if (occOn > 0.5) {
        vec2 dir = normalize(occP.xz - cameraPosition.xz);
        float dp = dot(occP.xz - cameraPosition.xz, dir);
        float df = dot(vOccW.xz - cameraPosition.xz, dir);
        float f = smoothstep(-0.25, -0.5, df - dp) * smoothstep(0.1, 0.35, vOccW.y);
        float h = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        if (h < f) discard;
      }`)},r.customProgramCacheKey=()=>"cutaway",r}const Aa=r=>new ue(r),Es={wucht:"heavyslash",rund:"sweep",funke:"lightning",welle:"wave",heilton:"heal",chor:"healall",doppel:"arrows2",streu:"arrows",schild:"shieldbash",bollwerk:"dome",ip_andrew:"starfall",ip_marco:"supernova",ip_teresa:"hymn",ip_rico:"volley",ip_andy:"quake"},TM=["sword_attack","staff_attack","bow_attack_shoot","dagger_attack","attack","punch"];function EM(r){r.traverse(e=>{if(e.userData.ownGeo&&e.geometry?.dispose(),e.userData.ownMat)for(const t of[].concat(e.material))t&&(t.userData.ownTex&&(t.map?.dispose(),t.normalMap?.dispose()),t.dispose())})}class AM{constructor(e){this.v=e,this.scene=new Kl,this.enemies=[],this.heroes=[],this.t=0,this.token=0,this.pool=[];for(let t=0;t<3;t++){const n=new ln(16777215,0,9,1.6);this.pool.push(n)}this.scene.userData.flashPool=this.pool,this.accent=[new ln(16777215,0,14,1.4),new ln(16777215,0,14,1.4)],this.rim=new kc(16777215,0)}async begin(e,t,n,i){const s=++this.token,a=this.v,o=this.scene,l=a.Q,c=_r(e),h=e.startsWith("ow_")||["town","schlager","xmas"].includes(c),u=h?Rs[c].out?c:"town":c,f=sc(e),d=[Promise.all(t.map(H=>a.actorMonster(H.id,H.boss?1.15:2))),Promise.all(n.map(H=>a.actorHero(H.id,!0))),i?a.actorCapsule(i):Promise.resolve(null),Promise.all([...f.map(H=>Mt(H[0])),Mt(h?"forest/rocks-high.glb":"town/rock-large.glb")])],[m,v,p]=await Promise.all(d),g={};for(const H of f)g[H[0]]=await Mt(H[0]);const _=h?"forest/rocks-high.glb":"town/rock-large.glb";if(g[_]=await Mt(_),s!==this.token)return;this.clear();const{v:y}=a.setupSky(o,u,9);a.renderer.toneMappingExposure=y.expo;const x=Si(e),P=Oa(h?c==="xmas"?"snow":"grass":c==="rap"||c==="static"?"tile":"crack"),R=P.map.clone(),A=P.normal.clone();R.repeat.set(14,14),A.repeat.set(14,14),R.needsUpdate=A.needsUpdate=!0;const C=new ks(45,64,0,Math.PI*2);C.rotateX(-Math.PI/2);const M=[],w=C.attributes.position,S=Aa(x[0]).lerp(Aa(x[1]),.5).multiplyScalar(.92);for(let H=0;H<w.count;H++){const K=Math.hypot(w.getX(H),w.getZ(H)),Q=Math.max(.55,1-K/60);M.push(S.r*Q,S.g*Q,S.b*Q)}C.setAttribute("color",new Ye(M,3));const I=new Ie(C,new St({vertexColors:!0,map:R,normalMap:A,roughness:.92}));I.receiveShadow=!0,I.userData.ownGeo=I.userData.ownMat=!0,I.material.userData.ownTex=!0,o.add(I);const L=CM(RM(e)),O=new Map,G=(H,K)=>{O.has(H)||O.set(H,[]),O.get(H).push(K)},B=(H,K,Q,se,we=Q)=>new Pe().compose(new T(H,0,K),new Lt().setFromAxisAngle(new T(0,1,0),se),new T(Q,we,Q));for(let H=0;H<30;H++){const K=-Math.PI*(.05+L()*.9),Q=10+L()*10,se=f[Math.floor(L()*f.length)],we=se[1]*(1+L()*.6);G(se[0],B(Math.cos(K)*Q*1.3,Math.sin(K)*Q-1,we,L()*6.28))}for(let H=0;H<10;H++){const K=-Math.PI*(.1+L()*.8);G(_,B(Math.cos(K)*24,Math.sin(K)*18-2,5.5,L()*6.28,6.5))}for(const[H,K]of O)a.addInstances(o,g[H],K,H.includes("tree")||H.includes("pine"),!1);h&&l.grass&&this.grass(o,x,l.grass*260),this.rim.color.set(h?"#ffe8d0":y.accent||"#ffffff"),this.rim.intensity=h?.8:1.6,this.rim.position.set(0,4,-10),o.add(this.rim);for(const[H,K]of this.accent.entries())K.color.set(h?"#ffffff":y.accent||"#ffffff"),K.intensity=h?0:22,K.position.set(H?6:-6,3.5,-3.5),o.add(K);for(const H of this.pool)H.intensity=0,H.userData.busy=!1,o.add(H);this.parts=ad(y.part[0],Math.round(l.parts*.7),y.part[1],new T(24,8,16)),this.parts.material.uniforms.center.value.set(0,0,-2),this.parts.userData.ownGeo=this.parts.userData.ownMat=!0,o.add(this.parts);const $=t.length;this.enemies=m.map((H,K)=>{const Q=(K-($-1)/2)*($>1?3.7:0);return H.root.position.set(Q,0,-3.4),H.base=H.root.position.clone(),a.addBlob(H.root,t[K].boss?3:1.9),H.mats=[],H.root.traverse(se=>{se.isMesh&&se.material.emissive&&H.mats.push(se.material)}),o.add(H.root),H});const V=n.length;this.heroes=v.map((H,K)=>(H.root.position.set((K-(V-1)/2)*1.9,0,.1+Math.abs(K-(V-1)/2)*.25),H.base=H.root.position.clone(),H.pivot.rotation.y=Math.PI,H.id=n[K].id,o.add(H.root),n[K].hp<=0&&(on(H,"death",""),H.mixer?.update(5)),H)),this.cap=p,p&&(p.root.position.set((V-1)/2*1.9+1.7,0,-.5),p.base=p.root.position.clone(),p.pivot.rotation.y=Math.PI,o.add(p.root)),this.t=0,this.camT=0,this.shakeT=0,this.hitStop=0,this.camP=null,this.shotQ=null,this.shotIntro(),this.placeCam(0),a.placeSun(o,new T(0,0,-1.5)),a.renderer.compile(o,a.camera)}grass(e,t,n){const i=new En(.06,.34,1,3);i.translate(0,.17,0);const s=ic(new St({color:16777215,side:mt,roughness:.85}),.07,.34),a=new qi(i,s,n);a.userData.ownGeo=a.userData.ownMat=!0;const o=new Pe,l=new Lt,c=new T,h=new T,u=new ue;for(let f=0;f<n;f++){const d=Math.random()*Math.PI*2,m=2.5+Math.sqrt(Math.random())*15;h.set(Math.cos(d)*m*1.3,0,Math.sin(d)*m-2),l.setFromAxisAngle(new T(0,1,0),Math.random()*6.28),c.set(1,.6+Math.random()*1.1,1),o.compose(h,l,c),a.setMatrixAt(f,o),u.set(t[0]).lerp(Aa(t[3]||t[1]),Math.random()*.6).multiplyScalar(.85+Math.random()*.3),a.setColorAt(f,u)}a.receiveShadow=!0,a.frustumCulled=!1,e.add(a)}clear(){const e=this.scene;this.v.fx.clear(e);for(const t of e.children.slice())t===e.userData.sky||t===e.userData.sun||t===e.userData.hemi||t===e.userData.sun?.target||(e.remove(t),EM(t));this.enemies=[],this.heroes=[],this.cap=null}end(){this.token++,this.clear()}placeCam(e){const t=this.v.camera;this.camT+=e;let n=new T(Math.sin(this.camT*.25)*.5,5,9.4),i=new T(0,.9,-.9);const s=this.shotQ;if(s){s.t+=e;const o=Math.min(1,s.t/s.dur),l=o*o*(3-2*o);n=s.p0.clone().lerp(s.p1,l),i=s.l0.clone().lerp(s.l1,l),s.t>=s.dur+(s.hold??.35)&&(this.shotQ=null)}(!this.camP||e===0)&&(this.camP=n.clone(),this.camL=i.clone());const a=Math.min(1,e*(s?s.snap??7:3.2));this.camP.lerp(n,a),this.camL.lerp(i,a),t.position.copy(this.camP),this.shakeT>0&&(this.shakeT-=e,t.position.x+=(Math.random()-.5)*.22,t.position.y+=(Math.random()-.5)*.15),t.lookAt(this.camL)}shot(e,t,n=e,i=t,s=.8,a=.35,o){this.shotQ={p0:e,l0:t,p1:n,l1:i,dur:s,hold:a,snap:o,t:0}}shotOver(e,t){if(!e)return;const n=e.base,i=t?t.base:new T(0,0,-3.4),s=n.x>=0?1:-1,a=n.clone().lerp(i,.6).setY(1);this.shot(n.clone().add(new T(s*2.4,1.8,3.4)),a,n.clone().add(new T(s*1.5,1.5,2.6)),a,.9,.3)}shotFace(e,t){if(!e)return;const n=e.base,i=n.clone().add(new T(1.6,1.3,-2.8)),s=n.clone().add(new T(-.8,1.2,-2.4));this.shot(i,n.clone().setY(e.h*.7),s,n.clone().setY(e.h*.75),t??.8,.2)}shotEnemy(e,t){if(!e)return;const n=e.base,s=(t?t.base:new T(0,0,0)).clone().lerp(n,.35).setY(.9);this.shot(n.clone().add(new T(-1.8,2.6+e.h*.4,-4.2)),s,n.clone().add(new T(-1.2,2.2+e.h*.3,-3.2)),s,.9,.25)}shotIntro(){this.shot(new T(-7,1.6,-.5),new T(0,1.2,-3.4),new T(3.5,2.6,4.5),new T(0,1,-2.6),1.6,.1,9)}shotVictory(){this.shot(new T(-3.5,1.4,-4.2),new T(0,1,0),new T(3.2,1.6,-4),new T(0,1.1,0),3.2,.6,6)}lunge(e,t,n,i){e.lunge={t:0,dur:i,dir:t.clone().setY(0).normalize(),dist:n}}hero(e,t,n){if(e===-1&&t==="victory"){for(const a of this.heroes)(a.state!=="once"||a.dead!==!0)&&(a.dead||(a.hop={t:0}));this.shotVictory();return}const i=this.heroes[e];if(!i)return;const s=n>=0?this.enemies[n]:null;switch(t){case"attack":{on(i,TM),this.shotOver(i,s);const a=i.id==="andrew"||i.id==="andy";s&&this.lunge(i,s.base.clone().sub(i.base),a?2.2:.5,.6),i.id==="rico"&&s&&this.bolt(i,s,"#ffd27a",.22);break}case"cast":on(i,["spell1","staff_attack","attack","punch"]),this.shotFace(i),this.v.fx.ring(i.root.position.clone().add(new T(0,.05,0)),i.id==="teresa"?"#9affc0":"#c8a0ff",.3,1.4,.7,this.scene),this.v.fx.burst(i.root.position.clone().add(new T(0,1,0)),i.id==="teresa"?"#9affc0":"#c8a0ff",24,1.4,.7,1.5,.12,this.scene),s&&this.bolt(i,s,"#c890ff",.3);break;case"hurt":on(i,"recievehit"),this.lunge(i,new T(0,0,1),.35,.3);break;case"death":i.dead=!0,on(i,"death","");break;case"idle":i.dead=!1,i.state="",Ln(i,"idle");break;case"guard":on(i,["idle_weapon","idle_attacking","idle"]);break}}capsule(e,t){const n=this.cap;if(!n)return;const i=t>=0?this.enemies[t]:null;e==="attack"||e==="cast"?(on(n,["bite_front","attack","dragon_attack","skeleton_attack","slime_attack","punch"]),this.lunge(n,i?i.base.clone().sub(n.base):new T(0,0,-1),e==="attack"?1.8:.4,.55),e==="cast"&&this.v.fx.burst(n.root.position.clone().add(new T(0,n.h*.6,0)),"#ffd27a",26,1.5,.7,1.5,.12,this.scene),e==="cast"&&i&&this.bolt(n,i,"#ffb070",.25)):e==="hurt"?(on(n,["hitrecieve","hit"]),this.lunge(n,new T(0,0,1),.3,.25)):e==="death"&&(on(n,"death",""),n.dead=!0)}enemy(e,t,n){const i=this.enemies[e];if(i)if(t==="attack"){on(i,["bite_front","attack","dragon_attack","skeleton_attack","slime_attack"]);const s=n===-2?this.cap:n>=0?this.heroes[n]:null;this.shotEnemy(i,s),this.lunge(i,s?s.base.clone().sub(i.base):new T(0,0,1),1.4,.55)}else t==="hurt"&&(on(i,["hitrecieve","hit"]),i.flash=.22,this.lunge(i,new T(0,0,-1),.3,.25))}enemyDown(e){const t=this.enemies[e];if(!t)return;on(t,"death","")||(t.noDeathAnim=!0),t.down=1e-4;const n=t.root.position.clone().add(new T(0,t.h*.5,0));if(t.h>2.2){const i=this.v.fx,s=this.scene;this.shot(t.base.clone().add(new T(2.5,2,5)),n,t.base.clone().add(new T(-2,1.6,4)),n,2,.6);for(let a=0;a<6;a++)i.later(.15+a*.22,()=>{const o=n.clone().add(new T((Math.random()-.5)*t.h*.6,(Math.random()-.3)*t.h*.5,.3));i.burst(o,["#ffd24a","#ffffff","#ff7a5a"][a%3],40,3.5,.7,-2,.13,s),i.flash(o,"#ffc070",40,.3,s),this.shakeT=.25},s);i.later(1.5,()=>{i.pillar(t.base.clone(),"#fff2c0",1.2,14,1.4,s),i.ring(t.base.clone().setY(.05),"#ffe8a0",.5,9,1.1,s),this.v.flashScreen?.("#fff4d0",.8),this.hitStop=.25},s)}else this.v.fx.ring(t.base.clone().setY(.05),"#c8d0ff",.2,2.2,.5,this.scene)}skill(e,t,n){const i=this.v.fx,s=this.scene,a=this.heroes[e];if(!a)return;const o=(d,m,v)=>new T(d,m,v),l=(n&&n.length?n.map(d=>this.enemies[d]):this.enemies.filter(d=>d&&!d.down)).filter(Boolean),c=d=>d.root.position.clone().add(o(0,d.h*.55,0)),h=d=>d.base.clone().setY(.06),u=a.root.position.clone().add(o(0,1.1,-.3)),f=this.enemies.length?this.enemies.reduce((d,m)=>d.add(m.base),o(0,0,0)).multiplyScalar(1/this.enemies.length):o(0,0,-3.4);switch(Es[t]||"hit"){case"heavyslash":for(const d of l)i.later(.25,()=>{i.slash(c(d),"#ffd27a",2.2+d.h*.3,s),i.ring(h(d),"#ffb040",.3,2.8,.45,s),this.hitStop=.12,this.v.flashScreen?.("#ffe0a0",.25)},s);break;case"sweep":i.later(.2,()=>{i.ring(f.clone().setY(.6),"#ffe0a0",.5,6.5,.45,s);for(const d of l)i.slash(c(d),"#ffffff",1.8,s)},s);break;case"lightning":this.shot(o(-5.5,3,4),f.clone().setY(1.6),o(-4.5,2.4,3.2),f.clone().setY(1.2),.7,.4);for(const d of l)i.later(.3,()=>{i.lightning(c(d),"#a8d8ff",s),i.burst(c(d),"#cfe8ff",30,4,.5,-3,.1,s),this.v.flashScreen?.("#d8ecff",.35),this.shakeT=.2},s);break;case"wave":i.later(.25,()=>{i.ring(a.base.clone().setY(.08),"#b48aff",.4,9,.9,s),i.ring(a.base.clone().setY(.6),"#e0c8ff",.4,8,.8,s,!0);for(const d of l)i.later(.35,()=>{i.pillar(h(d),"#b48aff",.7,3.5,.7,s),i.burst(c(d),"#d8b8ff",36,3,.7,.5,.12,s)},s)},s);break;case"heal":case"healall":case"hymn":{const d=Es[t]==="heal"?[this.heroes[n&&n[0]>=0?n[0]:e]]:this.heroes;Es[t]==="hymn"&&(this.shot(o(0,4.5,6.5),o(0,.5,0),o(0,3.2,5),o(0,1,0),1.4,.4),i.ring(o(0,.06,.2),"#fff2a0",.5,6,1.2,s),this.v.flashScreen?.("#fff8d8",.5));for(const m of d.filter(Boolean))i.later(.2,()=>{i.pillar(m.base.clone(),"#9affc0",.55,6,1.2,s),i.burst(m.base.clone().setY(.3),"#c8ffd8",30,1,1.4,2.5,.09,s)},s);break}case"arrows":case"arrows2":case"volley":{const d=Es[t]==="volley"?10:Es[t]==="arrows"?6:2;Es[t]==="volley"&&this.shot(o(5.2,2.2,4.8),f.clone().setY(1.4),o(4.4,1.8,3.9),f.clone().setY(1.2),1.2,.4);for(let m=0;m<d;m++){const v=l[m%l.length];if(!v)break;i.later(.15+m*.08,()=>i.shot(u.clone(),c(v).add(o((Math.random()-.5)*.6,(Math.random()-.5)*.4,0)),"#ffd27a",.28,s,.4+Math.random()*.5,()=>i.burst(c(v),"#ffe8a0",10,2.4,.3,-4,.07,s)),s)}break}case"shieldbash":for(const d of l)i.later(.25,()=>{i.ring(c(d),"#8ad0ff",.2,2.2,.4,s,!1),i.flash(c(d),"#8ad0ff",30,.3,s),this.shakeT=.2},s);break;case"dome":i.bubble(o(0,.4,.3),"#6ac8ff",3.4,1.4,s),i.ring(o(0,.06,.3),"#8ad8ff",.5,4,.9,s);break;case"starfall":this.shot(o(-5,1.2,4.6),f.clone().setY(3.5),o(-4,1.6,3.8),f.clone().setY(1.2),1.3,.5);for(const d of l)for(let m=0;m<5;m++)i.later(.2+m*.12,()=>{const v=c(d).add(o((Math.random()-.5)*.8,0,(Math.random()-.5)*.4));i.shot(v.clone().add(o(2+Math.random(),8,-2)),v,"#ffe8a0",.3,s,0,()=>{i.burst(v,"#ffd24a",24,3.5,.6,-3,.12,s),i.flash(v,"#ffd070",35,.25,s),this.shakeT=.2})},s);i.later(1,()=>{this.hitStop=.18,this.v.flashScreen?.("#fff0c0",.6)},s);break;case"supernova":this.shot(o(0,2,6.5),f.clone().setY(1.5),o(0,3.5,8.5),f.clone().setY(1),1.6,.4),i.orb(f.clone().setY(1.6),"#c8a0ff",.2,1.2,.6,s),i.later(.55,()=>{i.orb(f.clone().setY(1.6),"#e8c8ff",.6,4.6,.9,s),i.ring(f.clone().setY(.08),"#c890ff",.5,12,1,s),i.burst(f.clone().setY(1.6),"#e8d0ff",90,7,1,0,.14,s),this.v.flashScreen?.("#f0e0ff",.4),this.shakeT=.5,this.hitStop=.2},s);break;case"quake":this.shot(o(-6.2,1.2,4.8),f.clone().setY(1),o(-5.2,1.4,4),f.clone().setY(.8),1,.4),i.later(.35,()=>{i.ring(a.base.clone().setY(.06),"#ffb070",.5,12,.9,s);for(const d of l)i.burst(h(d).setY(.3),"#b89070",50,4.5,1,-9,.14,s),i.pillar(h(d),"#ff9a50",.9,3,.6,s);this.shakeT=.6,this.hitStop=.15,this.v.flashScreen?.("#ffd0a0",.4)},s);break}}bolt(e,t,n,i){const s=new Ie(new ki(.12,12,8),new lt({color:Aa(n).multiplyScalar(4)})),a=e.root.position.clone().add(new T(0,1,-.3)),o=t.root.position.clone().add(new T(0,t.h*.5,0));s.position.copy(a),s.visible=!1,this.v.fx.add(s,this.scene,.28+i,l=>{const c=Math.max(0,(l*(.28+i)-i)/.28);s.visible=c>0,s.position.lerpVectors(a,o,c),s.position.y+=Math.sin(c*Math.PI)*.6})}pos(e,t,n){const i=e==="enemy"?this.enemies[t]:e==="capsule"?this.cap:this.heroes[t];return i?i.root.position.clone().add(new T(0,n??i.h,0)):null}fxAt(e,t,n){const i=this.v.fx,s=this.scene;if(e==="victory"){for(const c of this.heroes)i.burst(c.root.position.clone().add(new T(0,1.8,0)),["#ffd24a","#ff5ad0","#46e6ff","#7cff9a"][Math.floor(Math.random()*4)],30,2.6,1.3,-3,.1,s);return}const a=t==="enemy"?this.enemies[n]:t==="capsule"?this.cap:this.heroes[n];if(!a)return;const o=a.root.position.clone().add(new T(0,a.h*.55,0)),l=a.root.position.clone().add(new T(0,.05,0));switch(e){case"slash":i.slash(o,"#ffffff",1.4+a.h*.3,s),i.burst(o,"#ffe8a0",18,3.2,.45,-4,.09,s);break;case"bigslash":this.hitStop=.12,i.slash(o,"#ffc840",2.4+a.h*.3,s),i.ring(l,"#ffb020",.3,3.5,.5,s),i.burst(o,"#ffd24a",40,4.5,.7,-4,.12,s),i.flash(o,"#ffb040",40,.4,s),this.shakeT=.25;break;case"magic":i.burst(o,"#b48aff",46,3.4,.7,.5,.14,s),i.ring(o,"#c8a0ff",.2,2.2,.45,s,!1),i.flash(o,"#9a6aff",30,.45,s);break;case"heal":i.burst(l.clone().add(new T(0,.3,0)),"#7cffb0",30,1.2,1.1,2,.11,s),i.ring(l,"#7cffb0",.2,1.1,.7,s);break;case"guard":i.bubble(o,"#6ac8ff",.95,.8,s);break;case"hit":i.burst(o,"#ff6a5a",14,2.4,.4,-4,.08,s);break;case"heavy":this.hitStop=.1,i.burst(o,"#ff4a3a",28,3.4,.5,-4,.11,s),this.shakeT=.3;break;case"spec":i.pillar(l,"#ff3050",1.4,9,1,s),this.v.flashScreen?.("#ff6070",.4),i.ring(l,"#ff4a6a",.5,11,.8,s),i.flash(o,"#ff3050",60,.6,s),this.shakeT=.45;break;case"special":this.shotFace(a,1),i.pillar(l,"#ffd24a",.75,5,1,s,.3),i.burst(l.clone().add(new T(0,.2,0)),"#ffe8a0",50,1.2,1.2,3.5,.1,s),this.v.flashScreen?.("#ffe8a0",.35),i.ring(l,"#ffd24a",.2,1.6,.6,s),i.burst(l.clone().add(new T(0,.4,0)),"#ffd24a",40,1.6,.9,2.5,.12,s),i.flash(o,"#ffc040",30,.6,s);break}}update(e){this.t+=e;const t=e;this.hitStop>0&&(this.hitStop-=e,e*=.08);const n=[...this.enemies,...this.heroes,...this.cap?[this.cap]:[]];for(const i of n){i.mixer?.update(e);const s=new T;if(i.lunge){const a=i.lunge;a.t+=e;const o=Math.min(1,a.t/a.dur);s.addScaledVector(a.dir,Math.sin(o*Math.PI)*a.dist),o>=1&&(i.lunge=null)}if(i.hop&&(i.hop.t+=e,s.y+=Math.max(0,Math.sin(i.hop.t*9))*.35*Math.max(0,1-i.hop.t/1.4),i.hop.t>1.4&&(i.hop=null)),i.root.position.copy(i.base).add(s),i.flash!==void 0&&i.mats){i.flash=Math.max(0,i.flash-e);const a=i.flash/.22;for(const o of i.mats)o.emissive.setRGB(a,a,a),o.emissiveIntensity=1.5}if(i.down&&(i.down+=e,i.down>.9||i.noDeathAnim)){const a=Math.min(1,(i.down-(i.noDeathAnim?0:.9))/.35);i.root.scale.setScalar(Math.max(.001,1-a)),!i.poof&&a>.1&&(i.poof=!0,this.v.fx.burst(i.root.position.clone().add(new T(0,i.h*.4,0)),"#c8d0ff",36,2.2,.8,.8,.11,this.scene)),a>=1&&(i.root.visible=!1)}}this.parts&&(this.parts.material.uniforms.t.value=this.t,this.parts.material.uniforms.scale.value=this.v.H*.9),this.placeCam(t),this.v.fx.update(e)}}function RM(r){let e=2166136261;for(let t=0;t<r.length;t++)e^=r.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}function CM(r){return()=>{r|=0,r=r+1831565813|0;let e=Math.imul(r^r>>>15,1|r);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}let Nu=null,Uu=null;function od(r,e,t){const n=typeof document<"u"?document.createElement("canvas"):null;if(!n)return null;n.width=r,n.height=e,t(n.getContext("2d"),r,e);const i=new so(n);return i.colorSpace=ut,i}function PM(){return Nu||(Nu=od(8,64,(r,e,t)=>{const n=r.createLinearGradient(0,0,0,t);n.addColorStop(0,"rgba(255,255,255,0)"),n.addColorStop(.5,"rgba(255,255,255,1)"),n.addColorStop(1,"rgba(255,255,255,0)"),r.fillStyle=n,r.fillRect(0,0,e,t)}))}function DM(){return Uu||(Uu=od(64,64,(r,e,t)=>{const n=r.createLinearGradient(0,0,0,t);n.addColorStop(0,"rgba(255,255,255,0)"),n.addColorStop(.6,"rgba(255,255,255,.55)"),n.addColorStop(1,"rgba(255,255,255,1)"),r.fillStyle=n,r.fillRect(0,0,e,t);for(let i=0;i<9;i++)r.fillStyle="rgba(255,255,255,.35)",r.fillRect(Math.random()*e,0,2,t)}))}class IM{constructor(e){this.v=e,this.list=[]}add(e,t,n,i){t.add(e),this.list.push({obj:e,scene:t,life:n,t:0,step:i})}burst(e,t,n,i,s,a,o,l){const c=new vt,h=new Float32Array(n*3),u=[];for(let m=0;m<n;m++){h[m*3]=e.x,h[m*3+1]=e.y,h[m*3+2]=e.z;const v=new T(Math.random()-.5,Math.random()*.9+.1,Math.random()-.5).normalize().multiplyScalar(i*(.35+Math.random()*.65));u.push(v)}c.setAttribute("position",new wt(h,3));const f=new Ec({map:sd(),color:new ue(t).multiplyScalar(2.5),size:o,transparent:!0,depthWrite:!1,blending:Qt,sizeAttenuation:!0}),d=new Ac(c,f);d.frustumCulled=!1,this.add(d,l,s,(m,v)=>{const p=c.attributes.position;for(let g=0;g<n;g++){const _=u[g];_.y+=a*v,_.multiplyScalar(1-v*1.2),p.array[g*3]+=_.x*v,p.array[g*3+1]+=_.y*v,p.array[g*3+2]+=_.z*v}p.needsUpdate=!0,f.opacity=1-m*m})}ring(e,t,n,i,s,a,o=!0){const l=new lt({color:new ue(t).multiplyScalar(2.2),transparent:!0,side:mt,depthWrite:!1,blending:Qt}),c=new Ie(new Ai(.85,1,64),l);o&&(c.rotation.x=-Math.PI/2),c.position.copy(e),this.add(c,a,s,h=>{const u=n+(i-n)*(1-(1-h)*(1-h));c.scale.setScalar(u),l.opacity=1-h})}slash(e,t,n,i){const s=new lt({map:bM(),color:new ue(t).multiplyScalar(2.4),transparent:!0,depthWrite:!1,depthTest:!1,blending:Qt,side:mt}),a=new Ie(new En(2*n,1*n),s);a.position.copy(e),a.quaternion.copy(this.v.camera.quaternion),a.rotateZ(-.7+Math.random()*.4),a.renderOrder=20,this.add(a,i,.32,o=>{a.scale.setScalar(.7+o*.6),s.opacity=1-o,a.rotateZ(.02)})}flash(e,t,n,i,s){const a=s.userData.flashPool;if(!a)return;const o=a.find(c=>!c.userData.busy)||a[0];o.userData.busy=!0,o.color.set(t),o.position.copy(e);const l={obj:new ct,scene:s,life:i,t:0,step:c=>{o.intensity=n*(1-c),c>=1&&(o.intensity=0,o.userData.busy=!1)}};s.add(l.obj),this.list.push(l)}bubble(e,t,n,i,s){const a=new lt({color:new ue(t).multiplyScalar(1.4),transparent:!0,opacity:0,depthWrite:!1,blending:Qt,side:mt});a.onBeforeCompile=l=>{l.vertexShader=l.vertexShader.replace("#include <common>",`#include <common>
varying float vF;`).replace("#include <project_vertex>",`#include <project_vertex>
vec3 nn = normalize(normalMatrix * normal); vF = 1.0 - abs(nn.z);`),l.fragmentShader=l.fragmentShader.replace("#include <common>",`#include <common>
varying float vF;`).replace("vec4 diffuseColor = vec4( diffuse, opacity );","vec4 diffuseColor = vec4( diffuse, opacity * (0.15 + pow(vF, 2.0)) );")};const o=new Ie(new ki(n,24,16),a);o.position.copy(e),this.add(o,s,i,l=>{a.opacity=l<.2?l*5:(1-l)*1.25,o.scale.setScalar(.9+.1*Math.sin(l*20))})}later(e,t,n){const i=new ct;let s=!1;this.add(i,n,e,a=>{a>=1&&!s&&(s=!0,t())})}ribbon(e,t,n,i,s,a=0){const o=this.v.camera.position,l=e.length,c=new Float32Array(l*2*3),h=new Float32Array(l*2*2),u=[];for(let p=0;p<l;p++){const g=e[p],_=e[Math.min(l-1,p+1)],y=e[Math.max(0,p-1)],x=_.clone().sub(y).normalize(),P=o.clone().sub(g).normalize(),R=x.clone().cross(P).normalize().multiplyScalar(t*(1-.6*p/l)*.5);if(c.set([g.x+R.x,g.y+R.y,g.z+R.z,g.x-R.x,g.y-R.y,g.z-R.z],p*6),h.set([p/(l-1),0,p/(l-1),1],p*4),p<l-1){const A=p*2;u.push(A,A+1,A+2,A+1,A+3,A+2)}}const f=new vt;f.setAttribute("position",new wt(c,3)),f.setAttribute("uv",new wt(h,2)),f.setIndex(u);const d=new lt({map:PM(),color:new ue(n).multiplyScalar(3),transparent:!0,depthWrite:!1,blending:Qt,side:mt}),m=new Ie(f,d);m.frustumCulled=!1,m.renderOrder=15;const v=u.length;return this.add(m,s,i,p=>{a&&f.setDrawRange(0,Math.max(6,Math.floor(Math.min(1,p/a)*v/6)*6)),d.opacity=p<.6?1:(1-p)/.4}),m}lightning(e,t,n,i=7){for(let s=0;s<2;s++){const a=[],o=e.clone().add(new T((Math.random()-.5)*2,i,(Math.random()-.5)*1.5));for(let l=0;l<=12;l++){const c=o.clone().lerp(e,l/12);l&&l<12&&c.add(new T((Math.random()-.5)*.7,0,(Math.random()-.5)*.7)),a.push(c)}this.ribbon(a,s?.18:.42,s?"#ffffff":t,.35,n)}this.flash(e,t,60,.35,n)}pillar(e,t,n,i,s,a,o=1){const l=new lt({map:DM(),color:new ue(t).multiplyScalar(2.5),transparent:!0,depthWrite:!1,blending:Qt,side:mt}),c=new Ie(new Zi(n,n*1.15,i,32,1,!0),l);c.position.copy(e).add(new T(0,i/2,0)),c.renderOrder=12,this.add(c,a,s,h=>{const u=h<.15?h/.15:1;c.scale.set(.3+.7*u+h*.3,u,.3+.7*u+h*.3),c.position.y=e.y+i*u/2,l.opacity=o*(h<.7?1:(1-h)/.3),c.rotation.y+=.04})}orb(e,t,n,i,s,a){const o=new lt({color:new ue(t).multiplyScalar(1.6),transparent:!0,depthWrite:!1,blending:Qt});o.onBeforeCompile=c=>{c.vertexShader=c.vertexShader.replace("#include <common>",`#include <common>
varying float vF;`).replace("#include <project_vertex>",`#include <project_vertex>
vec3 nn = normalize(normalMatrix * normal); vF = abs(nn.z);`),c.fragmentShader=c.fragmentShader.replace("#include <common>",`#include <common>
varying float vF;`).replace("vec4 diffuseColor = vec4( diffuse, opacity );","vec4 diffuseColor = vec4( diffuse, opacity * (0.25 + 0.75 * pow(vF, 1.5)) );")};const l=new Ie(new ki(1,32,20),o);l.position.copy(e),this.add(l,a,s,c=>{l.scale.setScalar(n+(i-n)*(1-(1-c)**3)),o.opacity=c<.5?1:(1-c)*2})}shot(e,t,n,i,s,a=.6,o){const l=new Ie(new ki(.1,10,8),new lt({color:new ue(n).multiplyScalar(4)}));l.position.copy(e);const c=[];let h=!1;this.add(l,s,i,u=>{l.position.lerpVectors(e,t,u),l.position.y+=Math.sin(u*Math.PI)*a,c.push(l.position.clone()),c.length>2&&c.length%2===0&&this.ribbon(c.slice(-3),.12,n,.18,s),u>=1&&!h&&(h=!0,o&&o())})}update(e){for(const t of this.list)t.t+=e,t.step(Math.min(1,t.t/t.life),e);this.list=this.list.filter(t=>t.t<t.life?!0:(t.step(1,0),t.scene.remove(t.obj),t.obj.geometry?.dispose(),t.obj.material?.dispose(),t.obj.dispose?.(),!1))}clear(e){this.list=this.list.filter(t=>t.scene!==e?!0:(e.remove(t.obj),t.obj.geometry?.dispose(),t.obj.material?.dispose(),!1))}}const LM={uniforms:{tDiffuse:{value:null},amt:{value:1}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float amt; varying vec2 vUv;
    void main(){
      vec4 t = texture2D(tDiffuse, vUv); vec3 c = t.rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      vec3 g = mix(vec3(l), c, 1.14);
      g = (g - 0.5) * 1.07 + 0.5;
      g += mix(vec3(-0.012, 0.004, 0.03), vec3(0.03, 0.012, -0.02), smoothstep(0.15, 0.85, l));
      gl_FragColor = vec4(mix(c, clamp(g, 0.0, 1.0), amt), t.a);
    }`},kM={ow_town:["#4aa24f","#459a4a","#2a5a6a","#2a8a3a","#ffd24a"],ow_rap:["#5a5a86","#54547e","#2a2a44","#4a4a8a","#ff4a6a"],ow_schlager:["#a6d67e","#9ecf76","#a04a80","#58b04a","#ff5aa8"],ow_xmas:["#e6f2fa","#dcecf6","#4a7a9a","#2f8a4a","#ff3a3a"],ow_rock:["#6a4a3a","#634232","#2a1a18","#8a5a2a","#ff7a1a"],ow_static:["#4a505e","#444a58","#202430","#606878","#7cff9a"]},NM={town:"#2a6ac8",rap:"#1a1030",schlager:"#ff8fc8",xmas:"#26466a",rock:"#ff5a10",static:"#0a0c12"},Fu={town:"water",rap:"void",schlager:"glitter",xmas:"water",rock:"lava",static:"void"},Rs={town:{out:!0,sky:["#3d7fd6","#bfe2ff","#6c8fae"],sun:[.55,.62,.35],sunC:"#fff0d8",sunI:3,hemi:["#cfe6ff","#5a7a4a",1.1],env:.55,fog:.01,part:["pollen","#fff6b0"],expo:1},schlager:{out:!0,sky:["#d26ac0","#ffd0ea","#c08ab0"],sun:[-.4,.4,.5],sunC:"#ffe0f0",sunI:2.6,hemi:["#ffe0f4","#8a5a7a",1],env:.6,fog:.012,part:["glitter","#ff9ad8"],expo:1},xmas:{out:!0,sky:["#7a9cc8","#e6f0fa","#b8c8da"],sun:[.3,.32,.6],sunC:"#ffe8d0",sunI:2.2,hemi:["#e8f2ff","#8aa0b8",1.2],env:.6,fog:.016,part:["snow","#ffffff"],expo:.95},rap:{out:!1,sky:["#0a0614","#2a1848","#0a0614"],sun:[.4,.8,.3],sunC:"#9a80ff",sunI:1.5,hemi:["#6a4aa8","#1a1024",1],env:.4,fog:.035,part:["dust","#c8a8ff"],accent:"#ff4a6a",expo:1.1},rock:{out:!1,sky:["#120604","#4a1a0c","#120604"],sun:[.3,.8,.4],sunC:"#ffb080",sunI:1.5,hemi:["#a05030","#200a06",1],env:.4,fog:.032,part:["ember","#ff7a2a"],accent:"#ff7a1a",expo:1.1},static:{out:!1,sky:["#05060c","#1c2232","#05060c"],sun:[.3,.8,.4],sunC:"#a0ffc0",sunI:1.4,hemi:["#506080","#0c0e14",1],env:.4,fog:.035,part:["spark","#7cff9a"],accent:"#7cff9a",expo:1.1}},Ou={xmas:[["grave/pine.glb",1.5],["grave/pine.glb",1.8],["town/tree-high.glb",1]],rock:[["grave/pine-fall.glb",1.5],["grave/pine-fall-crooked.glb",1.5],["town/tree-crooked.glb",1.1]],rap:[["kkd/pillar.gltf",.45],["kkd/barrel_large.gltf",.4],["kkd/crates_stacked.gltf",.42],["kkd/keg.gltf",.4]],static:[["kkd/pillar_decorated.gltf",.42],["kkd/pillar.gltf",.47],["kkd/box_stacked.gltf",.26]],schlager:[["town/tree-high-round.glb",1],["town/tree.glb",1.2],["town/tree-high.glb",.9]],town:[["town/tree.glb",1.1],["town/tree-high.glb",1],["forest/tree.glb",1.4],["town/tree-high-round.glb",1]]},UM={rap:[["grave/pine.glb",1.5],["town/tree-crooked.glb",1.1],["grave/pine-fall-crooked.glb",1.4]],static:[["grave/pine-fall-crooked.glb",1.4],["grave/pine.glb",1.6],["forest/rocks-high.glb",.7]]},sc=r=>r.startsWith("ow_")&&UM[r.slice(3)]||Ou[r.replace("ow_","")]||Ou.town,As=.25,Bu=["rap","static"],zu={rap:"#ffffff",static:"#c4ccf0",xmas:"#dceeff",rock:"#ffb49a",schlager:"#ffd6e6"},Hu={rap:"banner_patternA_red",static:"banner_patternB_blue",xmas:"banner_patternC_white",rock:"banner_triple_red",schlager:"banner_patternA_white"},Ba=["2Story_Mat","1Story_GableRoof_Mat","2Story_Sign_Mat","1Story_Mat","2Story_GableRoof_Mat"],FM=["town/tree.glb","town/tree-high.glb","town/tree-high-round.glb","town/tree-crooked.glb","town/rock-large.glb","town/road.glb","town/wall-block.glb","town/fountain-round.glb","forest/tree.glb","forest/rocks-high.glb","grave/pine.glb","grave/pine-fall.glb","grave/pine-fall-crooked.glb","grave/crypt.glb","dungeon/wall.glb","dungeon/column.glb","dungeon/barrel.glb","dungeon/rocks.glb","kkd/chest.gltf","kkd/chest_gold.gltf","dungeon/gate.glb","dungeon/key.glb",...Ba.map(r=>`bld_${r}.glb`),"bld_1Story_Sign_Mat.glb","bld_2Story_Slim_Mat.glb"],Vu=[{dpr:1,shadow:0,bloom:!1,samples:0,grass:0,parts:120},{dpr:1.5,shadow:1024,bloom:!0,samples:0,grass:7,parts:260},{dpr:2,shadow:2048,bloom:!0,samples:4,grass:16,parts:420}],Gu=-.2,Wu=[[.2,3.8],[.34,5.8],[.56,9.5],[.9,15]],ti=.72,Me=r=>new ue(r),Ka=r=>r*r*(3-2*r);function Ut(r,e){const t=Math.sin(r*127.1+e*311.7)*43758.5453;return t-Math.floor(t)}function cr(r,e){const t=Math.floor(r),n=Math.floor(e),i=Ka(r-t),s=Ka(e-n),a=Ut(t,n),o=Ut(t+1,n),l=Ut(t,n+1),c=Ut(t+1,n+1);return a+(o-a)*i+(l-a)*s+(a-o-l+c)*i*s}const _r=r=>r.replace("ow_","");function Si(r){return r.startsWith("ow_")?kM[r]:md[r]}class OM{constructor(e,t,n){this.g=t,this.canvas=e,this.qi=n,this.Q=Vu[n],this.mode=-1,this.t=0,this.renderer=new fx({canvas:e,antialias:!1,powerPreference:"high-performance",stencil:!1}),this.renderer.outputColorSpace=ut,this.renderer.toneMapping=cc,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=nf,this.pmrem=new $l(this.renderer),this.camera=new $t(38,16/9,.3,500),this.world=new Kl,this.fx=new IM(this),this.battle=new AM(this),this.envCache={},this.built="",this.building=null,this.buildToken=0,this.dyn=new Map,this.camTarget=new T,this.camInit=!1,this.camYaw=0,this.camYawT=0,this.camPitch=.4,this.camD=7,this.camZoom=1,this.camKeys=0,this.cine=null,this.shakeT=0,this.labels=[],this.dying=[],this.fpsT=0,this.fpsN=0,this.lowFor=0,this.setupComposer(),this.resize(),addEventListener("resize",()=>this.resize())}setupComposer(){const e=this.Q;if(this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,e.dpr)),this.renderer.shadowMap.enabled=e.shadow>0,this.composer&&(this.composer.dispose?.(),this.composer=null),this.gtao?.dispose?.(),this.gtao=null,e.bloom){const t=this.renderer.getDrawingBufferSize(new ae),n=new nn(Math.max(1,t.x),Math.max(1,t.y),{type:Vt,samples:e.samples});this.composer=new yy(this.renderer,n),this.renderPass=new My(this.world,this.camera),this.composer.addPass(this.renderPass),this.gtao=null,this.qi>=2&&(this.gtao=new kn(this.world,this.camera,t.x,t.y),this.gtao.updateGtaoMaterial({radius:.5,distanceExponent:1.5,thickness:1,scale:1}),this.gtao.blendIntensity=.85,this.composer.addPass(this.gtao)),this.bloom=new Ws(new ae(t.x,t.y),.45,.55,.88),this.composer.addPass(this.bloom),this.composer.addPass(new Sy),this.composer.addPass(new Jf(LM))}}setQuality(e){if(e!==this.qi){this.qi=e,this.Q=Vu[e],this.setupComposer(),this.resize();for(const t of[this.world,this.battle.scene]){const n=t.userData.sun;n&&this.configSun(n,t.userData.shadowSize||14)}this.built=""}}resize(){const e=innerWidth,t=innerHeight;this.renderer.setSize(e,t,!1),this.canvas.style.width=e+"px",this.canvas.style.height=t+"px",this.composer&&(this.composer.setPixelRatio(this.renderer.getPixelRatio()),this.composer.setSize(e,t)),this.aspect=e/Math.max(1,t),this.camera.aspect=this.aspect;const n=38,i=1.5;this.camera.fov=this.aspect>=i?n:qa.radToDeg(2*Math.atan(Math.tan(qa.degToRad(n)/2)*i/this.aspect)),this.camera.updateProjectionMatrix(),this.W=e,this.H=t}configSun(e,t){e.castShadow=this.Q.shadow>0,this.Q.shadow&&(e.shadow.mapSize.set(this.Q.shadow,this.Q.shadow),e.shadow.map&&(e.shadow.map.dispose(),e.shadow.map=null));const n=e.shadow.camera;n.left=-t,n.right=t,n.top=t,n.bottom=-t,n.near=1,n.far=80,n.updateProjectionMatrix(),e.shadow.bias=-5e-4,e.shadow.normalBias=.03,e.shadow.radius=4}setupSky(e,t,n){const i=Rs[t];for(const c of["sky","sun","hemi"])e.userData[c]&&(e.remove(e.userData[c]),c==="sun"&&e.remove(e.userData.sun.target));const s=new T(...i.sun).normalize(),a=ku(i.sky[0],i.sky[1],i.sky[2],s,i.out?i.sunC:"#000000",1);if(e.add(a),e.userData.sky=a,e.background=null,e.fog=new bc(Me(i.sky[1]).lerp(Me(i.sky[2]),i.out?.15:.5),i.fog),i.out&&this.hdrEnv&&(this.envCache[t]=this.hdrEnv),!this.envCache[t]){const c=new Kl;c.add(ku(i.sky[0],i.sky[1],i.sky[2],s,i.sunC,3)),this.envCache[t]=this.pmrem.fromScene(c,.02).texture}e.environment=this.envCache[t],e.environmentIntensity=i.env;const o=new kc(Me(i.sunC),i.sunI);o.userData.dir=s,e.add(o,o.target),this.configSun(o,n),e.userData.sun=o,e.userData.shadowSize=n;const l=new Kx(Me(i.hemi[0]),Me(i.hemi[1]),i.hemi[2]);return e.add(l),e.userData.hemi=l,e.userData.vis=i,{sunDir:s,v:i}}placeSun(e,t){const n=e.userData.sun;if(n&&(n.target.position.copy(t),n.position.copy(t).addScaledVector(n.userData.dir,30),n.castShadow)){const i=e.userData.shadowSize*2/this.Q.shadow;n.target.position.x=Math.round(n.target.position.x/i)*i,n.target.position.z=Math.round(n.target.position.z/i)*i,n.position.copy(n.target.position).addScaledVector(n.userData.dir,30)}}async loadHdr(){try{const e=await new Cy().loadAsync("./env/spruit_sunrise_1k.hdr");e.mapping=Va,this.hdrEnv=this.pmrem.fromEquirectangular(e).texture,e.dispose();for(const t of["town","schlager","xmas"])delete this.envCache[t]}catch(e){console.warn("HDR",e)}}setMode(e){e!==this.mode&&(this.mode=e,e!==2&&(this.camInit=!1))}mapChanged(){this.built=""}partyChanged(){this.playerLead=""}ready(){return this.built!==this.mapKey()&&this.build(),this.building||Promise.resolve()}build(){const e=++this.buildToken;return this.g.S,this.built=this.mapKey(),this.building=this.buildWorld(e).catch(t=>console.error(t)).finally(()=>{e===this.buildToken&&(this.building=null)}),this.building}clearWorld(){const e=this.world;this.sceneObjs=[];for(const t of e.children.slice())t===e.userData.sky||t===e.userData.sun||t===e.userData.hemi||t===e.userData.sun?.target||(e.remove(t),t.traverse?.(n=>{(n.isInstancedMesh||n.userData.ownGeo)&&n.geometry?.dispose(),n.userData.ownMat&&[].concat(n.material).forEach(i=>{i?.userData.ownTex&&(i.map?.dispose(),i.normalMap?.dispose()),i?.dispose()})}));this.dyn.clear(),this.dying=[],this.player=null,this.playerLead="",this.labels=[]}async buildWorld(e){const t=this.g.S,n=t.map,i=_r(n.world?"town":n.theme),s=new Set(["town/road.glb","town/wall-block.glb","dungeon/wall.glb","forest/rocks-high.glb","town/rock-large.glb","grave/crypt.glb","bld_2Story_Slim_Mat.glb","bld_2Story_GableRoof_Mat.glb"]);for(let _=0;_<t.mh;_++)for(let y=0;y<t.mw;y++)if(n.rows[_][y]==="T")for(const x of sc(Gr(t,y,_)))s.add(x[0]);if(!(n.world||n.town))for(const _ of["wall","wall_cracked","floor_tile_large","floor_tile_large_rocks","floor_tile_big_grate","torch_mounted",Hu[n.theme]||"banner_patternA_red","candle_triple"])s.add(`kkd/${_}.gltf`);if(n.town){for(const _ of Ba)s.add(`bld_${_}.glb`);s.add("bld_1Story_Sign_Mat.glb"),s.add("town/fountain-round.glb")}const a={};if(await Promise.all([...s].map(async _=>{a[_]=await Mt(_)})),e!==this.buildToken)return;this.clearWorld();const{sunDir:o,v:l}=this.setupSky(this.world,i,this.qi>=2?22:16);this.theme=i,this.renderer.toneMappingExposure=l.expo;const c=n.world||n.town;if(this.terrain=this.buildTerrain(t,c),this.world.add(this.terrain.mesh),this.terrain.hasLiquid||c){const _=c?"town":n.theme,y=this.terrain.area,x=SM(Fu[_],NM[_],this.terrain.depthTex,new Qe(y.x,y.y,y.w,y.h),l.sky[0],l.sky[1],o);x.userData.liquid=!0;const P=new Ie(new En(y.w,y.h),x);if(P.rotation.x=-Math.PI/2,P.position.set(y.x+y.w/2,Gu,y.y+y.h/2),P.userData.ownGeo=P.userData.ownMat=!0,P.renderOrder=2,this.world.add(P),this.liquid=x,Fu[_]==="lava"){const R=new ln(Me("#ff6a20"),0,0,2);this.lavaLight=R}}else this.liquid=null;const h=new Map,u=(_,y)=>{h.has(_)||h.set(_,[]),h.get(_).push(y)},f=(_,y,x,P,R,A=P)=>new Pe().compose(new T(_,y,x),new Lt().setFromAxisAngle(new T(0,1,0),R),new T(P,A,P)),d=new Map;for(let _=0;_<t.mh;_++)for(let y=0;y<t.mw;y++){const x=n.rows[_][y],P=(y*31+_*17)%7,R=y+.5,A=_+.5,C=this.heightAt(R,A);if(x==="T"){const M=sc(Gr(t,y,_)),w=M[(y*7+_*13)%M.length],S=w[1]*(.9+.04*P);u(w[0],f(R+(Ut(y,_)-.5)*.25,C-.02,A+(Ut(_,y)-.5)*.25,S,P*.9))}else if(x==="^"){const M=P%2===0?"forest/rocks-high.glb":"town/rock-large.glb";u(M,f(R,C+(P%2===0?.25:-.15),A,1.15,P*1.1,1.15*1.1))}else x==="#"?c&&u("town/wall-block.glb",f(R,0,A,1,0,1.15)):x==="p"?u("town/road.glb",f(R,C+.005,A,1,0)):"hHDSM".includes(x)&&d.set(y+","+_,x)}c||this.buildDungeon(t,u,f);const m=!c&&zu[n.theme]!=="#ffffff"?Me(zu[n.theme]||"#ffffff"):null;for(const[_,y]of h)this.addInstances(this.world,a[_],y,_.includes("tree")||_.includes("pine"),_.endsWith("road.glb"),_.startsWith("kkd/")?m:null,_.startsWith("kkd/")&&!_.includes("floor"));let v=0;const p=new Set;for(let _=0;_<t.mh;_++)for(let y=0;y<t.mw;y++){const x=y+","+_;if(d.get(x)!=="h"||p.has(x))continue;let P=0;for(;d.get(y+P+","+_)==="h";)p.add(y+P+","+_),P++;let R=!1;for(let B=0;B<P;B++)d.get(y+B+","+(_+1))==="S"&&(R=!0);const A=R?"1Story_Sign_Mat":Ba[v%Ba.length];v++;const C=a[`bld_${A}.glb`],M=this.brightClone(C,"#ffe6cc"),w=C.box,S=w.getSize(new T),I=P/Math.max(.5,S.x),L=2/Math.max(.5,S.z),O=(I+L)*.5;M.scale.set(I,O,L),M.position.set(-(w.min.x+S.x/2)*I,-w.min.y*O,-(w.min.z+S.z/2)*L);const G=new It;G.add(M),G.rotation.y=Math.PI,G.position.set(y+P/2,0,_+1),this.world.add(G),M.traverse(B=>{B.isMesh&&(B.material=[].concat(B.material).map($=>{if(/glass|window/i.test($.name)){const V=$.clone();return V.emissive=Me("#ffcf7a"),V.emissiveIntensity=.5,V}return $}),B.material.length===1&&(B.material=B.material[0]))})}if(this.buildGrass(t,i,c),n.portals.forEach((_,y)=>{const x=ol(t,_),P=this.makePortal(_.kind||"exit",x,a);P.position.set(_.x+.5,this.heightAt(_.x+.5,_.y+.5),_.y+.5),this.world.add(P),this.dyn.set("p"+y,{n:P,k:"portal",p:_,open:x,kind:_.kind||"exit",models:a}),n.world&&this.labels.push({p:_,node:P,h:_.kind==="tower"?3.4:2.1})}),this.playerLight=null,!l.out){if(this.playerLight=new ln(Me("#ffd2a0"),9,9,1.6),this.world.add(this.playerLight),n.boss&&n.boss.id){const y=new ln(Me(l.accent),14,10,1.6);y.position.set(n.boss.x+.5,2.2,n.boss.y+.5),this.world.add(y)}const _=n.portals[0];if(_){const y=new ln(Me("#5ae0ff"),6,6,1.6);y.position.set(_.x+.5,1.2,_.y+.5),this.world.add(y)}}const g=n.world?["pollen","#fff6b0"]:l.part;this.particles=ad(g[0],this.Q.parts,g[1]),this.world.add(this.particles),this.plates=[];for(const[_,y]of n.puzzle&&n.puzzle.plates||[]){const x=new Ie(new Zi(.42,.46,.06,32),new St({color:Me("#5a5a66"),roughness:.5,metalness:.6,emissive:Me(l.accent),emissiveIntensity:.25})),P=new Ie(new Ai(.3,.38,40),new lt({color:Me(l.accent).multiplyScalar(2),transparent:!0,opacity:.5,depthWrite:!1}));P.rotation.x=-Math.PI/2,P.position.y=.04,x.add(P),x.position.set(_+.5,this.heightAt(_+.5,y+.5)+.03,y+.5),x.receiveShadow=!0,x.userData.ownGeo=x.userData.ownMat=P.userData.ownGeo=P.userData.ownMat=!0,this.world.add(x),this.plates.push({x:_,y,m:x,r:P,on:0})}this.camInit=!1,this.syncDyn(0)}mapKey(){const e=this.g.S;return e.mapId+"|"+this.qi+(e.map&&e.map.deep?"|"+e.map.deep+":"+e.map.seed:"")}heightAt(e,t){const n=this.terrain;if(!n)return 0;const i=n.R,s=Math.min(Math.max(e*i,0),n.nx-1.001),a=Math.min(Math.max(t*i,0),n.nz-1.001),o=Math.floor(s),l=Math.floor(a),c=s-o,h=a-l,u=n.H,f=n.nx,d=u[l*f+o],m=u[l*f+o+1],v=u[(l+1)*f+o],p=u[(l+1)*f+o+1];return d+(m-d)*c+(v-d)*h+(d-m-v+p)*c*h}buildTerrain(e,t){const n=e.map,i=e.mw,s=e.mh,a=4,o=(Q,se)=>n.rows[Math.min(s-1,Math.max(0,se))][Math.min(i-1,Math.max(0,Q))],l=(Q,se)=>Gr(e,Math.min(i-1,Math.max(0,Q)),Math.min(s-1,Math.max(0,se))),c=new Float32Array(i*s),h=[];let u=!1;for(let Q=0;Q<s;Q++)for(let se=0;se<i;se++){const we=o(se,Q),j=l(se,Q),te=Si(j),le=_r(j);let ie=.04,fe=Me(te[0]).lerp(Me(te[1]),cr(se*.7,Q*.7));const de=[[1,0],[-1,0],[0,1],[0,-1]].some(([_e,et])=>o(se+_e,Q+et)==="~");we==="~"?(ie=-.55,u=!0,fe=le==="rock"?Me("#2a1208"):le==="xmas"?Me("#9ab0c0"):Me("#b8a678").multiplyScalar(.7)):we==="^"?(ie=.85+cr(se*1.3,Q*1.3)*.6,fe=Me(le==="xmas"?"#f4f8ff":le==="schlager"?"#c89aa8":"#7a7066")):we==="#"?(ie=.06,fe=Me(te[2]).multiplyScalar(.8)):we==="p"?fe=Me("#a39a8c"):"hHDSM".includes(we)?fe=Me("#8a8478"):we==="T"&&fe.multiplyScalar(.82),de&&we!=="~"&&(le==="town"||le==="schlager")&&fe.lerp(Me("#d8c890"),.45),c[Q*i+se]=ie,h.push(fe)}const f=i*a+1,d=s*a+1,m=new En(i,s,i*a,s*a);m.rotateX(-Math.PI/2),m.translate(i/2,0,s/2);const v=m.attributes.position,p=new Float32Array(v.count*3),g=new Float32Array(f*d),_=new ue;for(let Q=0;Q<d;Q++)for(let se=0;se<f;se++){const we=se/a,j=Q/a,te=we-.5,le=j-.5,ie=Math.floor(te),fe=Math.floor(le),de=Ka(te-ie),_e=Ka(le-fe),et=(D,b)=>[Math.min(i-1,Math.max(0,D)),Math.min(s-1,Math.max(0,b))],Be=(D,b)=>{const[z,Z]=et(D,b);return Z*i+z},tt=Be(ie,fe),N=Be(ie+1,fe),yt=Be(ie,fe+1),Oe=Be(ie+1,fe+1);let Ne=c[tt]*(1-de)*(1-_e)+c[N]*de*(1-_e)+c[yt]*(1-de)*_e+c[Oe]*de*_e;_.setRGB(0,0,0),_.r=h[tt].r*(1-de)*(1-_e)+h[N].r*de*(1-_e)+h[yt].r*(1-de)*_e+h[Oe].r*de*_e,_.g=h[tt].g*(1-de)*(1-_e)+h[N].g*de*(1-_e)+h[yt].g*(1-de)*_e+h[Oe].g*de*_e,_.b=h[tt].b*(1-de)*(1-_e)+h[N].b*de*(1-_e)+h[yt].b*(1-de)*_e+h[Oe].b*de*_e;const Re=cr(we*.9,j*.9)-.5;(t||Ne>.3)&&(Ne+=Re*.08+(cr(we*3.1,j*3.1)-.5)*.03),Ne>.5&&(Ne+=(cr(we*2.2,j*2.2)-.5)*.35);const Ke=1+Re*.16,be=Q*f+se;g[be]=Ne,v.setY(be,Ne),p[be*3]=_.r*Ke,p[be*3+1]=_.g*Ke,p[be*3+2]=_.b*Ke}m.setAttribute("color",new wt(p,3)),m.computeVertexNormals();const y=_r(n.world?"town":n.theme),x=n.world||n.town?"grass":y==="rap"||y==="static"?"tile":y==="rock"?"crack":y==="xmas"?"snow":"grass",P=Oa(x),R=x==="tile"?.5:.35,A=P.map.clone(),C=P.normal.clone();A.repeat.set(i*R,s*R),C.repeat.set(i*R,s*R),A.needsUpdate=C.needsUpdate=!0;const M=new St({vertexColors:!0,map:A,normalMap:C,normalScale:new ae(.9,.9),roughness:x==="tile"?.7:.93,metalness:0}),w=new Ie(m,M);w.receiveShadow=!0,w.userData.ownGeo=w.userData.ownMat=!0,M.userData.ownTex=!0;const S=new It;S.add(w);const I=70,L=new Ie(new En(i+2*I,s+2*I),new St({color:t?Me("#1a3a5a"):Me(Si(n.theme)[2]).multiplyScalar(.5),roughness:1}));if(L.rotation.x=-Math.PI/2,L.position.set(i/2,t?-.9:-.7,s/2),L.receiveShadow=!0,L.userData.ownGeo=L.userData.ownMat=!0,S.add(L),!t){const Q=new Ie(new Li(i+2*I,3,s+2*I),new St({color:Me(Si(n.theme)[2]).multiplyScalar(.35),roughness:1,side:Gt}));Q.position.set(i/2,1.4,s/2),Q.scale.set(1,1,1),Q.visible=!1,S.add(Q)}const O=4,G={x:-I,y:-I,w:i+2*I,h:s+2*I},B=G.w*O,$=G.h*O,V=new Uint8Array(B*$*4),H={R:a,nx:f,nz:d,H:g};this.terrain=H;for(let Q=0;Q<$;Q++)for(let se=0;se<B;se++){const we=G.x+(se+.5)/O,j=G.y+(Q+.5)/O;let te=1;we>=0&&j>=0&&we<=i&&j<=s&&(te=Math.min(1,Math.max(0,(Gu-this.heightAt(we,j))/.4)));const le=(($-1-Q)*B+se)*4;V[le]=V[le+1]=V[le+2]=te*255,V[le+3]=255}const K=new ns(V,B,$,Yt);return K.magFilter=K.minFilter=Tt,K.needsUpdate=!0,Object.assign(H,{mesh:S,depthTex:K,area:G,hasLiquid:u})}buildDungeon(e,t,n){const i=e.map,s=i.theme,a=(u,f)=>o(u,f)==="#",o=(u,f)=>u<0||f<0||u>=e.mw||f>=e.mh?"#":i.rows[f][u],l=[],c=[];let h=0;for(let u=0;u<e.mh;u++)for(let f=0;f<e.mw;f++){const d=f+.5,m=u+.5,v=Ut(f*3+1,u*5+2);if(!a(f,u)){if(Bu.includes(s)&&o(f,u)!=="~"){const p=v<.08?"floor_tile_large_rocks":v>.97?"floor_tile_big_grate":"floor_tile_large";t(`kkd/${p}.gltf`,n(d,this.heightAt(d,m)-.012,m,As,Math.floor(v*4)*Math.PI/2))}continue}l.push([d,m]);for(const[p,g]of[[1,0],[-1,0],[0,1],[0,-1]]){if(a(f+p,u+g))continue;const _=Math.atan2(p,g),y=d+p*.375,x=m+g*.375,P=Ut(f*7+p*3,u*11+g*5);t(P<.2?"kkd/wall_cracked.gltf":"kkd/wall.gltf",n(y,0,x,As,_)),t("kkd/wall.gltf",n(y,1,x,As,_));const R=d+p*.5,A=m+g*.5;++h%7===0?(t("kkd/torch_mounted.gltf",n(R,1.05,A,As*1.5,_)),c.push([R+p*.2,A+g*.2])):h%11===0?t(`kkd/${Hu[s]||"banner_patternA_red"}.gltf`,n(R-p*.08,.15,A-g*.08,As*1.3,_)):h%17===0&&Bu.includes(s)&&t("kkd/candle_triple.gltf",n(R+p*.15,this.heightAt(R,A),A+g*.15,As*1.4,_))}}if(l.length){const u=new qi(new Li(1,.06,1),nl(new St({color:Me(Si(s)[2]).multiplyScalar(.55),roughness:.9})),l.length);l.forEach(([f,d],m)=>u.setMatrixAt(m,new Pe().makeTranslation(f,2,d))),u.userData.ownGeo=u.userData.ownMat=!0,u.receiveShadow=!0,this.world.add(u)}if(c.length){const u=new qi(new Sr(.06,.2,8),nl(new lt({color:Me("#ffb040").multiplyScalar(3),transparent:!0,opacity:.9,depthWrite:!1})),c.length);c.forEach(([d,m],v)=>u.setMatrixAt(v,new Pe().makeTranslation(d,1.42,m))),u.userData.ownGeo=u.userData.ownMat=!0,this.world.add(u);const f=Math.max(1,Math.ceil(c.length/(this.qi>=2?8:4)));for(let d=0;d<c.length;d+=f){const m=new ln(Me("#ffb060"),5,5,1.8);m.position.set(c[d][0],1.5,c[d][1]),this.world.add(m)}}}addInstances(e,t,n,i,s,a,o){t.scene.updateMatrixWorld(!0),t.scene.traverse(l=>{if(!l.isMesh)return;let c=l.material;(a||o)&&(c=[].concat(c)[0].clone(),a&&(c.color=c.color.clone().multiply(a)),o&&nl(c)),i&&(c=ic([].concat(c)[0].clone(),.05,2,!0)),s&&(c=[].concat(c)[0].clone(),c.color=Me("#9aa0b0"),c.roughness=.85);const h=new qi(l.geometry,c,n.length),u=l.matrixWorld;n.forEach((f,d)=>h.setMatrixAt(d,new Pe().multiplyMatrices(f,u))),h.instanceMatrix.needsUpdate=!0,h.castShadow=!s,h.receiveShadow=!0,h.computeBoundingSphere(),(i||s||a||o)&&(h.userData.ownMat=!0),e.add(h)})}buildGrass(e,t,n){const i=this.Q.grass,s=e.map,a=c=>["town","schlager"].includes(_r(c))||c==="ow_rap"||c==="ow_rock",o=[],l=[];for(let c=0;c<e.mh;c++)for(let h=0;h<e.mw;h++){const u=s.rows[c][h],f=Gr(e,h,c);u===","&&l.push([h,c,f]),i&&(u==="."||u===","||u==="T")&&a(f)&&(n||t==="schlager")&&o.push([h,c,f])}if(o.length){const c=new vt,h=[],u=[],f=[],d=3;for(let C=0;C<=d;C++){const M=C/d,w=.035*(1-M*.85);h.push(-w,M*.32,M*M*.06,w,M*.32,M*M*.06);const S=.45+.55*M;u.push(S,S,S,S,S,S)}for(let C=0;C<d;C++){const M=C*2;f.push(M,M+1,M+2,M+1,M+3,M+2)}c.setAttribute("position",new Ye(h,3)),c.setAttribute("color",new Ye(u,3)),c.setIndex(f),c.computeVertexNormals();const m=ic(new St({vertexColors:!0,side:mt,roughness:.8}),.07,.32),v=o.length*i,p=new qi(c,m,v),g=new Pe,_=new Lt,y=new T(0,1,0),x=new T,P=new T,R=new ue;let A=0;for(const[C,M,w]of o){const S=Si(w),I=Ci(e,{x:C,y:M})||Ja(e,{x:C,y:M});for(let L=0;L<i;L++){const O=Ut(C*13+L,M*7),G=Ut(M*11+L,C*5+L);P.set(C+O,0,M+G),P.y=this.heightAt(P.x,P.z)-.01;const B=I?.01:(.7+Ut(L,C+M)*.9)*ti;x.set(.85,B,.85),_.setFromAxisAngle(y,Ut(C+L,M)*Math.PI*2),g.compose(P,_,x),p.setMatrixAt(A,g),R.set(S[0]).lerp(Me(S[3]||S[1]),Ut(L*3,M+C)*.6).multiplyScalar(1.05),p.setColorAt(A,R),A++}}p.instanceMatrix.needsUpdate=!0,p.instanceColor&&(p.instanceColor.needsUpdate=!0),p.receiveShadow=!0,p.castShadow=!1,p.userData.ownGeo=p.userData.ownMat=!0,p.frustumCulled=!1,this.world.add(p)}if(l.length){const c=new Cc(.05,0),h=new St({roughness:.4,emissive:Me("#ffffff"),emissiveIntensity:0});h.onBeforeCompile=p=>{p.fragmentShader=p.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
 totalEmissiveRadiance = vColor * `+(n?"0.25":"1.6")+";")},h.vertexColors=!1;const u=5,f=new qi(c,h,l.length*u),d=new Pe,m=new ue;let v=0;for(const[p,g,_]of l){const y=Si(_);for(let x=0;x<u;x++){const P=p+.15+Ut(p+x*3,g)*.7,R=g+.15+Ut(g+x*5,p)*.7,A=n?.8+Ut(x,p)*.6:.8+Ut(x,g)*1.4;d.makeScale(A,n?A:A*2.2,A).setPosition(P,this.heightAt(P,R)+.05*A,R),f.setMatrixAt(v,d),m.set(x%2?y[4]:n?"#ffffff":y[4]),f.setColorAt(v,m),v++}}f.instanceMatrix.needsUpdate=!0,f.instanceColor.needsUpdate=!0,f.userData.ownGeo=f.userData.ownMat=!0,this.world.add(f)}}makePortal(e,t,n){const i=new It,s=Me("#ff8a8a"),a=(o,l,c=1,h=Math.PI)=>{const u=o.box&&e!=="cave"?this.brightClone(o,"#ffe6cc"):o.scene.clone(),f=o.box,d=f.getSize(new T),m=l/Math.max(.3,d.x);u.scale.set(m,m*c,m),u.position.set(-(f.min.x+d.x/2)*m,-f.min.y*m*c,-(f.min.z+d.z/2)*m),t||u.traverse(p=>{p.isMesh&&(p.material=[].concat(p.material).map(g=>{const _=g.clone();return _.color=_.color.clone().multiply(s),_}).reduce((g,_,y,x)=>x.length===1?_:x))});const v=new It;return v.add(u),v.rotation.y=h,i.add(v),v};if(e==="town")a(n["bld_2Story_GableRoof_Mat.glb"],1.9);else if(e==="cave"){a(n["grave/crypt.glb"],2);const o=new Ie(new ks(.36,24),new lt({color:t?Me("#7ae8ff").multiplyScalar(2.2):Me("#ff3030").multiplyScalar(1.6),transparent:!0,opacity:.85}));o.position.set(0,.45,.78),o.userData.ownGeo=o.userData.ownMat=!0,i.add(o)}else if(e==="tower"){a(n["bld_2Story_Slim_Mat.glb"],1.4,1.7);const o=new Ie(new ki(.16,16,12),new lt({color:Me(t?"#7cff9a":"#ff4040").multiplyScalar(3)}));o.position.y=3.2,o.userData.ownGeo=o.userData.ownMat=!0,o.userData.pulse=!0,i.add(o)}else{const o=Me(t?"#46e6ff":"#ff5a5a"),l=new Ie(new Ya(.4,.06,12,40),new St({color:o,emissive:o,emissiveIntensity:2.2,roughness:.3}));l.position.y=.55,l.userData.spin=1.5;const c=new Ie(new ks(.36,32),new lt({color:o.clone().multiplyScalar(1.4),transparent:!0,opacity:.35,side:mt,depthWrite:!1}));c.position.y=.55,c.userData.spin=-2.5;const h=new Ie(new Zi(.5,.58,.08,32),new St({color:Me("#3a3f52"),roughness:.5,metalness:.3}));h.position.y=.04,h.receiveShadow=!0;for(const u of[l,c,h])u.userData.ownGeo=u.userData.ownMat=!0,i.add(u);i.userData.face=[l,c]}return i}brightClone(e,t){if(!e.bright){e.bright=e.scene.clone();const n=new ue,i=new ue;Me(t).getRGB(n,ut),e.bright.traverse(s=>{s.isMesh&&(s.material=[].concat(s.material).map(a=>{const o=a.clone();o.color.getRGB(i,ut);const l=c=>Math.min(1,c*1.5+.24*(1-c));return i.setRGB(l(i.r)*n.r,l(i.g)*n.g,l(i.b)*n.b),o.color.setRGB(i.r,i.g,i.b,ut),a.name==="RoofBricks"&&o.color.set("#9c5a46"),o.roughness=.8,o}).reduce((a,o,l,c)=>c.length===1?o:c))})}return e.bright.clone()}async actorHero(e,t=!1){const n=await Mt(Iu(gM[e])),i=Ta(n,3*vM[e]*(t?1:ti));return this.addBlob(i.root,t?1.1:.9*ti),Ln(i,"idle"),await this.attachWeapon(i,e).catch(()=>{}),i}weaponTier(e){const t=Cu[e];return t?Math.min(t.length-1,Math.floor((this.g.S.gear||0)*t.length/11)):0}async attachWeapon(e,t){const n=Cu[t];if(!n)return;const[i,s]=await Promise.all([Mt(`weapons/${n[this.weaponTier(t)]}.gltf`),Du[t]?Mt(Du[t]):null]);e.weapon=this.holdIn(e,Pu[t]||"handslotr",i),s&&this.holdIn(e,(Pu[t]||"handslotr")==="handslotr"?"handslotl":"handslotr",s)}holdIn(e,t,n){const i=e.root.getObjectByName(t);if(!i)return null;const s=n.scene.clone();return s.traverse(a=>{a.isMesh&&(a.castShadow=!0,a.material=a.material.clone(),a.material.metalness=.3,a.material.roughness=.5,a.userData.ownMat=!0)}),i.add(s),s}async actorNpc(e){const t=_M[e],n=await Mt(Iu(t[0])),i=Ta(n,3*t[2]*ti,t[1]);return this.addBlob(i.root,.9*ti),Ln(i,"idle"),i}async actorMonster(e,t){const n=vn[e],i=await Mt(xM(n)),s=Ta(i,n.h*t,n.tint||"#ffffff");return Ln(s,"idle"),Lu[n.model]&&this.holdIn(s,"handslotr",await Mt(Lu[n.model])),s}addBlob(e,t){const n=new Ie(new En(t,t*.8),new lt({map:tl(),transparent:!0,depthWrite:!1}));n.rotation.x=-Math.PI/2,n.position.y=.025,n.renderOrder=1,n.userData.ownGeo=n.userData.ownMat=!0,e.add(n)}face(e,t,n,i,s=1){if(!t&&!n)return;let o=Math.atan2(t,n)-e.pivot.rotation.y;o=Math.atan2(Math.sin(o),Math.cos(o)),e.pivot.rotation.y+=o*Math.min(1,i*14*s)}syncDyn(e){const t=this.g.S,n=new Set;for(const l of t.objs){const c="o"+l.uid;n.add(c),this.dyn.has(c)||this.makeObj(c,l);const h=this.dyn.get(c);if(l.t==="block"){const u=l.x+.5,f=l.y+.5,d=e>0?Math.min(1,e*10):1;h.n.position.x+=(u-h.n.position.x)*d,h.n.position.z+=(f-h.n.position.z)*d,h.n.position.y=this.heightAt(h.n.position.x,h.n.position.z)}else l.t==="torch"&&h.lit!==!!l.lit&&this.setTorch(h,!!l.lit)}for(const l of t.roamers){const c="r"+l.uid;if(n.add(c),!this.dyn.has(c)){const v={n:new It,k:"roamer",a:null,r:l};this.world.add(v.n),this.dyn.set(c,v),this.actorMonster(l.id,.62*ti).then(p=>{this.dyn.get(c)===v&&(this.addBlob(p.root,.9*ti),Ln(p,"walk"),v.a=p,v.n.add(p.root))})}const h=this.dyn.get(c),u=l.pos.x+.5,f=l.pos.y+.5,d=u-h.n.position.x,m=f-h.n.position.z;if(h.n.position.set(u,this.heightAt(u,f),f),h.a){Math.abs(d)+Math.abs(m)>5e-4&&e>0?(this.face(h.a,d,m,e),Ln(h.a,"walk")):Ln(h.a,"idle");const v=l.stun>0;h.stun!==v&&(h.stun=v,this.setOpacity(h.a.root,v?.45:1))}}for(const[l,c]of this.dyn){if(c.k==="portal"){const h=ol(t,c.p);if(h!==c.open){const u=this.makePortal(c.kind,h,c.models);u.position.copy(c.n.position),this.world.remove(c.n),this.world.add(u);for(const f of this.labels)f.node===c.n&&(f.node=u);c.n=u,c.open=h}continue}n.has(l)||(this.dyn.delete(l),c.k==="obj"&&["chest","gate","rock","bramble","seal"].includes(c.o.t)?this.dying.push({...c,life:["rock","bramble","seal"].includes(c.o.t)?1.2:0,burst:c.o.t!=="chest"&&c.o.t!=="gate"}):this.world.remove(c.n))}const i=t.party[0]?t.party[0].id:"andrew",s=i+"|"+this.weaponTier(i);if(this.playerLead!==s){this.playerLead=s,this.player&&this.world.remove(this.player.root);const l={root:new It,a:null};this.player=l,this.world.add(l.root),this.actorHero(i).then(c=>{this.player===l&&(l.a=c,l.root.add(c.root),c.pivot.rotation.y=Math.atan2(t.face.x,t.face.y))})}const a=t.ppos.x+.5,o=t.ppos.y+.5;if(this.player.root.position.set(a,this.heightAt(a,o),o),this.player.a){const l=t.fdir||t.face;this.face(this.player.a,l.x,l.y,e,.8),Ln(this.player.a,t.moving?t.running?"run":"walk":"idle")}}setOpacity(e,t){e.traverse(n=>{if(!(!n.isMesh||n.material.map===tl()))for(const i of[].concat(n.material))i.transparent=t<1,i.opacity=t,i.depthWrite=t>=1})}makeObj(e,t){const n=t.d,i={n:new It,k:"obj",o:t,a:null};i.n.position.set(t.x+.5,this.heightAt(t.x+.5,t.y+.5),t.y+.5),this.world.add(i.n),this.dyn.set(e,i);const s=()=>this.dyn.get(e)===i;if(t.t==="npc")n.kind==="heal"?Mt("town/fountain-round.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.setScalar(.5),i.n.add(o);const l=new Ie(new ks(.4,32),new St({color:Me("#4ab8ff"),emissive:Me("#2a90ff"),emissiveIntensity:1.4,roughness:.1,transparent:!0,opacity:.85}));l.rotation.x=-Math.PI/2,l.position.y=.12,l.userData.ownGeo=l.userData.ownMat=!0,i.n.add(l);const c=new ln(Me("#6ac8ff"),3,3.5,1.6);c.position.y=.7,i.n.add(c),i.fountain=!0}):this.actorNpc(n.kind).then(a=>{s()&&(i.a=a,i.n.add(a.root))});else if(t.t==="chest"){const a=n.kind==="key"||n.kind==="tool"||n.kind==="capsule";Mt(a?"kkd/chest_gold.gltf":"kkd/chest.gltf").then(o=>{if(!s())return;const l=o.scene.clone();l.scale.setScalar(.42),i.n.add(l),i.lid=l.getObjectByName(a?"chest_gold_lid":"chest_lid"),this.addBlob(i.n,1),n.kind==="key"&&Mt("dungeon/key.glb").then(c=>{if(!s())return;const h=c.scene.clone();h.scale.setScalar(1.4),h.position.y=.85,h.traverse(u=>{u.isMesh&&(u.material=u.material.clone(),u.material.emissive=Me("#ffb020"),u.material.emissiveIntensity=.8)}),i.n.add(h),i.spin=h})})}else if(t.t==="gate")Mt("dungeon/gate.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.set(1.35,1.6,1.35),o.rotation.y=Math.PI/2,i.n.add(o),i.door=o.getObjectByName("door")});else if(t.t==="boss")this.actorMonster(n.id,1).then(a=>{if(!s())return;i.a=a,i.n.add(a.root),this.addBlob(a.root,2.4);const o=new Ie(new Ai(.9,1.15,48),new lt({color:Me("#ff3040").multiplyScalar(2.5),transparent:!0,opacity:.6,side:mt,depthWrite:!1}));o.rotation.x=-Math.PI/2,o.position.y=.04,o.userData.ownGeo=o.userData.ownMat=!0,i.n.add(o),i.ring=o});else if(t.t==="block"){const a=Si(this.theme||"rap"),o=new Ie(new Li(.86,.86,.86,2,2,2),new St({color:Me(a[2]).lerp(Me("#8a8478"),.6),roughness:.85,metalness:.05,map:Oa("tile").map,normalMap:Oa("tile").normal}));o.position.y=.43,o.castShadow=o.receiveShadow=!0;const l=new Ie(new Ai(.14,.2,6),new lt({color:Me(Rs[this.theme||"rap"].accent).multiplyScalar(2.2),transparent:!0,opacity:.9,side:mt}));l.position.y=.865,l.rotation.x=-Math.PI/2,o.userData.ownGeo=o.userData.ownMat=l.userData.ownGeo=l.userData.ownMat=!0,i.n.add(o,l),this.addBlob(i.n,1)}else if(t.t==="torch"){Mt("dungeon/column.glb").then(l=>{if(!s())return;const c=l.scene.clone(),h=new Dn().setFromObject(c).getSize(new T);c.scale.set(.45/Math.max(.01,h.x),1.25/Math.max(.01,h.y),.45/Math.max(.01,h.z)),c.traverse(u=>{u.isMesh&&(u.castShadow=!0)}),i.n.add(c)});const a=new Ie(new Zi(.26,.14,.18,16),new St({color:Me("#3a2a1a"),metalness:.7,roughness:.4}));a.position.y=1.32;const o=new Ie(new Sr(.16,.5,12),new lt({color:Me("#ffb040").multiplyScalar(3),transparent:!0,opacity:.9,depthWrite:!1}));o.position.y=1.62,a.userData.ownGeo=a.userData.ownMat=o.userData.ownGeo=o.userData.ownMat=!0,i.n.add(a,o),i.flame=o,this.setTorch(i,!!t.lit)}else if(t.t==="rock")Mt("town/rock-large.glb").then(a=>{if(!s())return;const o=a.scene.clone();o.scale.setScalar(.55),o.rotation.y=(t.x*7+t.y*3)%6,o.traverse(l=>{l.isMesh&&(l.castShadow=!0,l.material=l.material.clone(),l.material.color.multiplyScalar(.8),l.material.emissive=Me("#ffd27a"),l.material.emissiveIntensity=.06)}),i.n.add(o)}),i.glint=this.makeGlint("#ffe9a0"),i.glint.position.y=.7,i.n.add(i.glint),this.addBlob(i.n,1.1);else if(t.t==="bramble"){const a=new It,o=new St({color:Me("#2e3a1c"),roughness:.8}),l=new St({color:Me("#6a2a3a"),roughness:.5});for(let c=0;c<7;c++){const h=c*.9+t.x,u=[];for(let d=0;d<=6;d++)u.push(new T(Math.cos(h+d*.8)*(.15+d*.05),.05+d*.15,Math.sin(h+d*.8)*(.15+d*.05)));const f=new Ie(new Dc(new jf(u),24,.035,5),o);f.castShadow=!0,a.add(f);for(let d=1;d<6;d++){const m=new Ie(new Sr(.025,.12,4),l);m.position.copy(u[d]),m.lookAt(u[d].clone().multiplyScalar(2)),m.rotateX(Math.PI/2),a.add(m)}}a.traverse(c=>{c.isMesh&&(c.userData.ownGeo=!0)}),a.children[0].userData.ownMat=a.children[1].userData.ownMat=!0,i.n.add(a),i.glint=this.makeGlint("#ff9ad0"),i.glint.position.y=.5,i.n.add(i.glint),this.addBlob(i.n,1)}else if(t.t==="seal"){const a=Me(Rs[this.theme||"rap"].accent),o=new Ie(new En(.98,1.9),new lt({color:a.clone().multiplyScalar(1.6),transparent:!0,opacity:.35,side:mt,depthWrite:!1,blending:Qt}));o.position.y=.95,o.rotation.y=Math.PI/2;const l=new Ie(new Ya(.42,.03,8,48),new lt({color:a.clone().multiplyScalar(3)}));l.position.y=.95,l.rotation.y=Math.PI/2;const c=new Ie(new Ai(.18,.24,6),new lt({color:a.clone().multiplyScalar(3),side:mt}));c.position.y=.95,c.rotation.y=Math.PI/2;for(const u of[o,l,c])u.userData.ownGeo=u.userData.ownMat=!0;const h=new ln(a,4,4,1.6);h.position.y=1,i.n.add(o,l,c,h),i.seal={wall:o,ring:l,inner:c}}}makeGlint(e){const t=new dx(new Vf({map:tl(),color:Me(e).multiplyScalar(3),transparent:!0,depthWrite:!1,blending:Qt}));return t.scale.setScalar(.18),t.userData.ownMat=!0,t}setTorch(e,t){e.lit=t,e.flame&&(e.flame.visible=t),t&&!e.light&&(e.light=new ln(Me("#ffa040"),7,6,1.6),e.light.position.y=1.8,e.n.add(e.light))}shake(e){this.g.mode===2?this.battle.shakeT=Math.max(this.battle.shakeT||0,e):this.shakeT=Math.max(this.shakeT,e)}screenPos(e,t,n){const i=this.battle.pos(e,t,n);return i?this.project(i):null}battleBegin(e,t,n,i){return this.battle.begin(e,t,n,i)}battleCap(e,t){this.battle.capsule(e,t)}async actorCapsule(e){const t=fn[e.id].forms[e.form],n=await Mt(`mon_${t.model}.glb`),i=Ta(n,t.h,t.tint);return this.addBlob(i.root,t.h),Ln(i,"idle"),i}battleEnd(){this.battle.end(),this.renderer.toneMappingExposure=Rs[this.theme||"town"].expo}battleHero(e,t,n){this.battle.hero(e,t,n)}battleEnemy(e,t,n){this.battle.enemy(e,t,n)}battleEnemyDown(e){this.battle.enemyDown(e)}battleFx(e,t,n){this.battle.fxAt(e,t,n)}battleSkill(e,t,n){this.battle.skill(e,t,n)}async sceneFx(e,t,n,i={}){this.sceneObjs=this.sceneObjs||[];const s=this.fx,a=this.world,o=t+.5,l=n+.5,c=this.heightAt(o,l),h=(u,f,d,m,v=.5)=>{const p=new It,g=new Ie(new Pc(v,0),new St({color:Me(m),emissive:Me(m),emissiveIntensity:1.6,metalness:.2,roughness:.15,transparent:!0,opacity:.92}));g.scale.y=1.7;const _=new Ie(new Ai(v*1.4,v*1.6,48),new lt({color:Me(m).multiplyScalar(2),transparent:!0,opacity:.6,side:mt,depthWrite:!1,blending:Qt})),y=new ln(Me(m),8,7,1.6);p.add(g,_,y),p.position.set(u,f,d),g.userData.ownGeo=g.userData.ownMat=_.userData.ownGeo=_.userData.ownMat=!0;let x=Math.random()*6;return p.userData.tick=P=>{x+=P,g.rotation.y+=P*1.4,p.position.y=f+Math.sin(x*1.6)*.12,_.lookAt(this.camera.position),_.scale.setScalar(1+Math.sin(x*3)*.08)},a.add(p),this.sceneObjs.push(p),p};if(e==="crystal"){const u=i.col||"#9ad8ff";h(o,c+1.4,l,u,.32),s.pillar(new T(o,c,l),u,.7,9,3,a,.6),s.ring(new T(o,c+.05,l),u,.3,4,1.4,a),s.burst(new T(o,c+1.4,l),u,80,3.5,1.6,.5,.11,a),this.flashScreen(u,.45)}else if(e==="crystals")["#ff6a8a","#ff9ad8","#9ad8ff","#ffb070"].forEach((f,d)=>{const m=d/4*Math.PI*2;h(o+Math.cos(m)*(i.r||2.2),c+(i.h||3.2),l+Math.sin(m)*(i.r||2.2),f,.3)}),i.burst&&(s.pillar(new T(o,c,l),"#fff4d0",1.2,14,3.5,a,.7),s.ring(new T(o,c+.05,l),"#fff0c0",.5,10,2,a),this.flashScreen("#fff6e0",.6));else if(e==="actor"){const u=await this.actorHero(i.id);u.root.position.set(o,c,l),u.pivot.rotation.y=i.yaw??0,on(u,["interact","idle_weapon"],"idle"),s.burst(new T(o,c+.6,l),Jt[i.id]?.col||"#ffffff",40,1.4,1.2,1.5,.09,a),u.root.userData.tick=f=>u.mixer?.update(f),a.add(u.root),this.sceneObjs.push(u.root)}}clearSceneFx(){for(const e of this.sceneObjs||[])this.world.remove(e),e.traverse(t=>{t.userData?.ownGeo&&t.geometry?.dispose(),t.userData?.ownMat&&t.material?.dispose()});this.sceneObjs=[]}flashScreen(e,t=.5){const n=typeof document<"u"&&document.getElementById("flash");n&&(n.style.transition="none",n.style.background=e,n.style.opacity=t,n.offsetWidth,n.style.transition="opacity .45s ease-out",n.style.opacity=0)}fxWorld(e,t){if(t&&["torch","smash","burn","seal"].includes(e)){const n=new T(t.x+.5,e==="torch"?1.6:.6,t.y+.5);e==="torch"&&this.fx.burst(n,"#ffb040",50,1.6,.9,1.5,.1,this.world),e==="smash"&&(this.fx.burst(n,"#b8a890",70,3,1,-6,.12,this.world),this.fx.burst(n,"#ffe27a",24,2,1.2,-1,.07,this.world),this.shake(.25)),e==="burn"&&(this.fx.burst(n,"#ff6a20",80,2.2,1.1,2,.11,this.world),this.fx.burst(n,"#3a2a20",30,1.2,1.6,.8,.14,this.world)),e==="seal"&&(n.y=1,this.fx.burst(n,Rs[this.theme||"rap"].accent,140,4,1.6,-1,.12,this.world),this.fx.burst(n,"#ffffff",50,2.5,1,0,.08,this.world),this.shake(.3));return}if(e==="heal"){const n=this.g.S.objs.find(i=>i.t==="npc"&&i.d.kind==="heal");n&&this.fx.burst(new T(n.x+.5,.6,n.y+.5),"#7ad8ff",60,2.2,1.4,-1.5,.12,this.world),this.player&&this.fx.burst(this.player.root.position.clone().add(new T(0,.8,0)),"#8affb0",40,1.2,1.2,-1.2,.1,this.world)}}frame(e){this.t+=e,rd.t.value=this.t;const t=this.g,n=t.mode;if(this.setMode(n),n===2){this.battle.update(e),this.render(this.battle.scene);return}const i=t.S;if(this.built!==this.mapKey()&&this.build(),this.terrain&&!this.building){this.syncDyn(e);for(const s of this.dyn.values()){if(s.a?.mixer?.update(e),s.spin&&(s.spin.rotation.y+=e*2,s.spin.position.y=1.2+Math.sin(this.t*2.5)*.08),s.ring&&(s.ring.material.opacity=.4+Math.sin(this.t*4)*.2),s.flame&&s.lit&&(s.flame.scale.set(1+Math.sin(this.t*17)*.1,1+Math.sin(this.t*11+1)*.18,1),s.light&&(s.light.intensity=6+Math.sin(this.t*13)*1.2)),s.glint){const a=(Math.sin(this.t*2.2+s.o.x)+1)/2;s.glint.material.opacity=a*a,s.glint.scale.setScalar(.1+a*.22)}if(s.seal&&(s.seal.ring.rotation.x+=e*1.2,s.seal.inner.rotation.x-=e*2,s.seal.wall.material.opacity=.28+Math.sin(this.t*3)*.1),s.k==="portal"&&s.n.traverse(a=>{a.userData.spin&&(a.rotation.z+=e*a.userData.spin),a.userData.pulse&&a.scale.setScalar(1+Math.sin(this.t*5)*.2)}),s.k==="obj"&&s.o.t==="npc"&&s.a&&this.player){const a=this.player.root.position,o=s.n.position,l=Math.hypot(a.x-o.x,a.z-o.z);this.face(s.a,l<2.6?a.x-o.x:0,l<2.6?a.z-o.z:1,e,.4)}if(s.k==="portal"&&s.n.userData.face)for(const a of s.n.userData.face)a.lookAt(this.camera.position.x,a.getWorldPosition(new T).y,this.camera.position.z),a.rotateZ(this.t*(a.userData.spin||1))}for(const s of this.plates||[]){const a=i.objs.some(o=>o.t==="block"&&o.x===s.x&&o.y===s.y)?1:0;s.on+=(a-s.on)*Math.min(1,e*6),s.m.material.emissiveIntensity=.25+s.on*2.2,s.r.material.opacity=.35+s.on*.6+Math.sin(this.t*3)*.1*(1-s.on)}for(const s of this.dying)s.life+=e,s.lid&&(s.lid.rotation.x=-Math.min(1,s.life*3)*1.9),s.door&&(s.door.position.y=-Math.min(1,s.life*1.2)*.8),s.spin&&(s.spin.position.y=1.2+s.life*1.5,s.spin.rotation.y+=e*8),!s.burst&&s.life>.15&&(s.burst=!0,this.fx.burst(s.n.position.clone().add(new T(0,.6,0)),s.o.t==="gate"?"#ffd27a":"#ffe27a",40,2,1,-2,.09,this.world)),s.life>1.4&&s.n.scale.setScalar(Math.max(.001,1-(s.life-1.4)*3));if(this.dying=this.dying.filter(s=>s.life>1.8?(this.world.remove(s.n),!1):!0),this.player?.a?.mixer?.update(e),this.sceneObjs)for(const s of this.sceneObjs)s.userData.tick?.(e);this.liquid&&(this.liquid.uniforms.t.value=this.t),this.updateCamera(e,n===0),Xs.on.value=n===0||!this.player?0:1,this.player&&Xs.p.value.copy(this.player.root.position).add(new T(0,.9*ti,0)),this.playerLight&&this.player&&this.playerLight.position.copy(this.player.root.position).add(new T(0,1.6,.4)),this.particles&&(this.particles.material.uniforms.t.value=this.t,this.particles.material.uniforms.center.value.copy(this.camTarget),this.particles.material.uniforms.scale.value=this.H*.9)}this.fx.update(e),this.render(this.world)}updateCamera(e,t){const n=this.g.S,i=this.camera;if(t){const R=this.t*.08,A=new T(n.mw/2,.5,n.mh/2+.5);this.camTarget.copy(A),i.position.set(A.x+Math.sin(R)*12,7.5,A.z+Math.cos(R)*12),i.lookAt(A),this.placeSun(this.world,A);return}const s=n.ppos,a=this.cine,o=a?new T(a.x,a.h??.9,a.z):new T(s.x+.5,this.heightAt(s.x+.5,s.y+.5)+.9*ti,s.y+.5);this.camKeys&&(this.camYawT+=this.camKeys*e*2.2);let c=(a&&a.yaw!==void 0?a.yaw:this.camYawT)-this.camYaw;c=Math.atan2(Math.sin(c),Math.cos(c));const h=Math.min(1,e*(a?2.2:8));this.camYaw+=c*h;const u=Wu[this.camZoom],f=!(this.g.S.map.world||this.g.S.map.town),d=a?a.pitch??.32:f?Math.max(u[0],.66):u[0],m=a?a.dist??6:u[1],v=(R,A)=>{const C=Math.sin(this.camYaw)*Math.cos(R),M=Math.cos(this.camYaw)*Math.cos(R),w=Math.sin(R);for(let S=.6;S<A;S+=.25)if(o.y+w*S<this.obstacleAt(o.x+C*S,o.z+M*S)+.25)return S;return 0};let p=d,g=m;if(!a){for(let A=d;A<=1.25&&(p=A,!!v(A,m));A+=.08);const R=v(p,m);R&&(g=Math.max(1.6,R-.35))}this.camPitch+=(p-this.camPitch)*Math.min(1,e*5);const _=Math.sin(this.camYaw)*Math.cos(this.camPitch),y=Math.cos(this.camYaw)*Math.cos(this.camPitch),x=Math.sin(this.camPitch);this.camInit?(this.camTarget.lerp(o,Math.min(1,e*(a?2.5:9))),this.camD+=(g-this.camD)*Math.min(1,e*(g<this.camD?14:3))):(this.camTarget.copy(o),this.camD=g,this.camInit=!0),i.position.set(this.camTarget.x+_*this.camD,this.camTarget.y+x*this.camD,this.camTarget.z+y*this.camD);const P=this.heightAt(i.position.x,i.position.z)+.35;i.position.y<P&&(i.position.y=P),this.shakeT>0&&(this.shakeT-=e,i.position.x+=(Math.random()-.5)*.15,i.position.y+=(Math.random()-.5)*.1),i.lookAt(this.camTarget.x,this.camTarget.y+.25,this.camTarget.z),this._sunC=(this._sunC||new T).set(this.camTarget.x-_*5,0,this.camTarget.z-y*5),this.placeSun(this.world,this._sunC)}obstacleAt(e,t){const n=this.g.S,i=Math.floor(e),s=Math.floor(t);if(i<0||s<0||i>=n.mw||s>=n.mh)return n.map.world||n.map.town?-1:0;const a=n.map.rows[s][i],o=this.heightAt(e,t);return a==="#"?n.map.world||n.map.town?2.1:o:"hHDSM".includes(a)?3.2:a==="T"?o+2.8:o}camQuad(){return(Math.round(this.camYaw/(Math.PI/2))%4+4)%4}rotateCam(e){this.camYawT+=e}zoomCam(e){this.camZoom=Math.max(0,Math.min(Wu.length-1,this.camZoom+e)),this.onCam?.()}render(e){this.composer?(this.renderPass.scene=e,this.renderPass.camera=this.camera,this.gtao&&(this.gtao.scene=e,this.gtao.camera=this.camera),this.composer.render()):this.renderer.render(e,this.camera)}project(e){const t=e.clone().project(this.camera);return{x:(t.x*.5+.5)*this.W,y:(-t.y*.5+.5)*this.H,vis:t.z<1&&t.z>-1}}watchFps(e,t){if(!t&&(this.fpsT+=e,this.fpsN++,this.fpsT>=2)){const n=this.fpsN/this.fpsT;this.fpsT=0,this.fpsN=0,this.lowFor=n<40?this.lowFor+1:0,this.lowFor>=2&&this.qi>0&&(this.lowFor=0,this.setQuality(this.qi-1),this.onQuality?.(this.qi))}}}function BM(r){try{const e=new DataView(r.buffer,r.byteOffset,r.byteLength);let t=4;const n=()=>{const o=e.getUint32(t,!0);return t+=4,o},i=()=>{const o=e.getInt32(t,!0);return t+=4,o},s=(o=0)=>{if(o>16)throw new Error("tief");const l=n(),c=l&255,h=l>>16&1;switch(c){case 0:return null;case 1:return n()!==0;case 2:{if(h){const u=Number(e.getBigInt64(t,!0));return t+=8,u}return i()}case 3:{if(h){const f=e.getFloat64(t,!0);return t+=8,f}const u=e.getFloat32(t,!0);return t+=4,u}case 4:case 21:{const u=n(),f=new TextDecoder().decode(new Uint8Array(r.buffer,r.byteOffset+t,u));return t+=u+(4-u%4)%4,f}case 5:{const u=e.getFloat32(t,!0),f=e.getFloat32(t+4,!0);return t+=8,{x:u,y:f}}case 6:{const u=i(),f=i();return{x:u,y:f}}case 27:{const u=n()&2147483647,f={};for(let d=0;d<u;d++){const m=s(o+1);f[String(m)]=s(o+1)}return f}case 28:{const u=n()&2147483647,f=[];for(let d=0;d<u;d++)f.push(s(o+1));return f}default:throw new Error("Typ "+c)}},a=s();return!a||!Array.isArray(a.party)||!a.map?null:{v:2,party:a.party,inv:a.inv||{},gold:a.gold|0,gear:a.gear|0,flags:a.flags||{},map:a.map,gp:a.gp,t:+a.t||0}}catch{return null}}function zM(){return new Promise(r=>{if(typeof indexedDB>"u")return r(null);let e;try{e=indexedDB.open("/userfs")}catch{return r(null)}e.onupgradeneeded=()=>{try{e.transaction.abort()}catch{}r(null)},e.onerror=()=>r(null),e.onsuccess=()=>{const t=e.result;if(!t.objectStoreNames.contains("FILE_DATA"))return t.close(),r(null);let n=null;const i=t.transaction("FILE_DATA","readonly").objectStore("FILE_DATA").openCursor();i.onsuccess=()=>{const s=i.result;if(!s)return t.close(),r(n);typeof s.key=="string"&&/anmacha_quest2\.save$/.test(s.key)&&s.value&&s.value.contents&&(n=BM(new Uint8Array(s.value.contents))),s.continue()},i.onerror=()=>{t.close(),r(n)}}})}const Zt=r=>440*Math.pow(2,(r-69)/12),HM={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],hmin:[0,2,3,5,7,8,11],lyd:[0,2,4,6,7,9,11]},VM={title:{bpm:76,root:50,sc:"min",prog:[0,5,2,6,0,3,4,4],lead:"horn",pad:"str",arp:"harp",drums:"epic",choir:!0,seed:11,dens:.55},intro:{bpm:64,root:48,sc:"min",prog:[0,5,3,4],lead:"flute",pad:"str",arp:"harp",drums:"",choir:!0,seed:3,dens:.4},town:{bpm:96,root:55,sc:"maj",prog:[0,3,4,0,5,3,1,4],lead:"flute",pad:"str",arp:"harp",drums:"light",seed:21,dens:.7},world:{bpm:112,root:53,sc:"maj",prog:[0,4,5,3,0,4,3,4],lead:"horn",pad:"str",arp:"pluck",drums:"march",seed:7,dens:.75},rap:{bpm:84,root:45,sc:"dor",prog:[0,0,6,6,5,5,4,4],lead:"bell",pad:"pad",arp:"pluck",drums:"deep",seed:31,dens:.45},schlager:{bpm:100,root:57,sc:"lyd",prog:[0,1,0,4,5,1,4,4],lead:"flute",pad:"str",arp:"harp",drums:"light",seed:41,dens:.6},xmas:{bpm:72,root:52,sc:"min",prog:[0,5,3,4,0,5,6,4],lead:"bell",pad:"pad",arp:"harp",drums:"",choir:!0,seed:51,dens:.45},rock:{bpm:132,root:45,sc:"hmin",prog:[0,0,5,4,0,0,5,4],lead:"horn",pad:"str",arp:"ostinato",drums:"drive",seed:61,dens:.6},tower:{bpm:70,root:47,sc:"hmin",prog:[0,1,0,4,5,1,4,4],lead:"choirlead",pad:"pad",arp:"bell",drums:"deep",choir:!0,seed:71,dens:.4},battle:{bpm:150,root:50,sc:"min",prog:[0,6,5,4,0,6,3,4],lead:"horn",pad:"str",arp:"ostinato",drums:"drive",seed:81,dens:.8},boss:{bpm:140,root:46,sc:"hmin",prog:[0,0,5,5,3,3,4,4],lead:"horn",pad:"str",arp:"ostinato",drums:"epic",choir:!0,seed:91,dens:.75},final:{bpm:148,root:47,sc:"hmin",prog:[0,1,5,4,0,1,3,4],lead:"horn",pad:"str",arp:"ostinato",drums:"epic",choir:!0,seed:97,dens:.85},ending:{bpm:80,root:53,sc:"maj",prog:[0,4,5,3,0,4,3,4],lead:"flute",pad:"str",arp:"harp",drums:"light",choir:!0,seed:101,dens:.6}};function GM(r){let e=r>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function WM(r){const e=GM(r.seed),t=[[0,4,6,8,12],[0,3,4,8,10,12],[0,6,8,14],[0,2,4,8,12,14],[0,8,12],[0,4,8,10]],n=l=>{const c=[];for(let h=0;h<2;h++){const u=t[Math.floor(e()*t.length)];let f=h===0?[0,2,4][Math.floor(e()*3)]:[1,2,3][Math.floor(e()*3)];u.forEach((d,m)=>{const v=(u[m+1]??16)-d;e()>r.dens+.3&&m>0||(c.push({st:h*16+d,deg:f+l,len:v}),f+=[-1,1,1,2,-2,0][Math.floor(e()*6)])})}return c},i=n(0),s=n(2),a=[],o=(l,c,h)=>l.forEach(u=>a.push({st:c*16+u.st,deg:u.deg+h,len:u.len}));return o(i,0,0),o(i,2,1),o(s,4,0),o(i,6,-1),a}class XM{constructor(){this.ctx=null,this.on=!0,this.cur=null,this.want=null,this.vol=.8}unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}const e=window.AudioContext||window.webkitAudioContext;if(!e)return;const t=this.ctx=new e;this.master=t.createGain(),this.master.gain.value=this.on?this.vol:0;const n=t.createDynamicsCompressor();n.threshold.value=-16,n.ratio.value=3,this.master.connect(n).connect(t.destination),this.mus=t.createGain(),this.mus.gain.value=.55,this.mus.connect(this.master),this.sfxG=t.createGain(),this.sfxG.gain.value=.7,this.sfxG.connect(this.master);const i=t.sampleRate*2.6,s=t.createBuffer(2,i,t.sampleRate);for(let o=0;o<2;o++){const l=s.getChannelData(o);for(let c=0;c<i;c++)l[c]=(Math.random()*2-1)*Math.pow(1-c/i,3.2)}this.rev=t.createConvolver(),this.rev.buffer=s,this.revG=t.createGain(),this.revG.gain.value=.32,this.rev.connect(this.revG).connect(this.master),this.noise=t.createBuffer(1,t.sampleRate,t.sampleRate);const a=this.noise.getChannelData(0);for(let o=0;o<a.length;o++)a[o]=Math.random()*2-1;if(this.timer=setInterval(()=>this.pump(),25),this.want){const o=this.want;this.want=null,this.music(o)}}setOn(e){this.on=e,this.master&&this.master.gain.setTargetAtTime(e?this.vol:0,this.ctx.currentTime,.1)}music(e){if(this.want===e&&(this.cur?.key===e||!this.ctx)||(this.want=e,!this.ctx))return;const t=this.ctx.currentTime;if(this.cur){const s=this.cur;s.out.gain.setTargetAtTime(0,t,.35),s.stop=!0,setTimeout(()=>s.out.disconnect(),2500)}this.cur=null;const n=VM[e];if(!n)return;const i=this.ctx.createGain();i.gain.value=0,i.gain.setTargetAtTime(1,t+.15,.4),i.connect(this.mus),this.cur={key:e,tr:n,out:i,step:0,next:t+.2,mel:WM(n),sec:60/n.bpm/4}}pump(){const e=this.cur,t=this.ctx;if(!(!e||e.stop||t.state!=="running"))for(;e.next<t.currentTime+.12;)this.stepAt(e,e.step,e.next),e.step++,e.next+=e.sec}chord(e,t){const n=HM[e.sc],i=e.prog[t%e.prog.length],s=a=>{const o=Math.floor(a/7);return e.root+n[(a%7+7)%7]+12*o};return{d:i,notes:[s(i),s(i+2),s(i+4)],pc:s}}stepAt(e,t,n){const i=e.tr,s=t%16,a=Math.floor(t/16),o=i.prog.length,l=this.chord(i,a),c=e.sec,h=e.out;if(s===0){for(const m of l.notes)this.voice(i.pad,Zt(m),n,c*16,.07,h);this.voice("bass",Zt(l.notes[0]-12),n,c*8,.22,h),i.choir&&a%2===0&&this.voice("choir",Zt(l.notes[2]),n,c*30,.05,h)}s===8&&this.voice("bass",Zt(l.notes[a%2?1:0]-12),n,c*7,.16,h);const u=i.arp;if(u==="harp"&&s%2===0){const m=[0,1,2,1,2,0,1,2][s/2%8];this.voice("harp",Zt(l.notes[m]+12),n,c*3,.07,h)}if(u==="pluck"&&[0,3,6,8,11,14].includes(s)&&this.voice("pluck",Zt(l.notes[s%3]+12),n,c*2,.07,h),u==="bell"&&s%4===2&&this.voice("bell",Zt(l.notes[(s/4|0)%3]+24),n,c*6,.035,h),u==="ostinato"){const m=[0,0,1,0,2,0,1,0][s%8];this.voice("ost",Zt(l.notes[m]),n,c*.9,.06,h)}const f=Math.floor(a/8);if(f%3!==2){const m=a%8*16+s;for(const v of e.mel)if(v.st===m){const p=this.chord(i,Math.floor(v.st/16)),g=p.pc(v.deg+p.d)+12;this.voice(i.lead,Zt(g),n,c*Math.max(1,v.len)*.95,.12,h),f%3===1&&i.lead!=="flute"&&this.voice("flute",Zt(g+12),n,c*Math.max(1,v.len)*.9,.04,h)}}const d=i.drums;d==="epic"?((s===0||s===10)&&this.drum("timp",n,.5,Zt(l.notes[0]-24)),s===8&&this.drum("snare",n,.18),a%o===o-1&&s>=12&&this.drum("timp",n,.3,Zt(l.notes[0]-24))):d==="drive"?(s%4===0&&this.drum("kick",n,.5),(s===4||s===12)&&this.drum("snare",n,.28),s%2===0&&this.drum("hat",n,.06),s===0&&a%4===0&&this.drum("crash",n,.12)):d==="march"?((s===0||s===8)&&this.drum("kick",n,.35),(s===4||s===12||s===14)&&this.drum("snare",n,.14),s%2===0&&this.drum("hat",n,.035)):d==="light"?(s===0&&this.drum("kick",n,.22),s%4===2&&this.drum("hat",n,.04),s===12&&this.drum("snare",n,.06)):d==="deep"&&(s===0&&this.drum("timp",n,.3,Zt(l.notes[0]-24)),s===6&&a%2&&this.drum("kick",n,.2))}env(e,t,n,i,s,a=.25){e.gain.setValueAtTime(1e-4,t),e.gain.linearRampToValueAtTime(s,t+n),e.gain.setValueAtTime(s,t+Math.max(n,i)),e.gain.exponentialRampToValueAtTime(1e-4,t+Math.max(n,i)+a)}osc(e,t,n,i,s,a=0){const o=this.ctx.createOscillator();return o.type=e,o.frequency.value=t,o.detune.value=a,o.connect(s),o.start(n),o.stop(i+.4),o}voice(e,t,n,i,s,a){const o=this.ctx,l=o.createGain(),c=n+i,h=o.createGain();h.gain.value=e==="bass"||e==="ost"?.1:.5,l.connect(a),l.connect(h),h.connect(this.rev);const u=o.createBiquadFilter();switch(u.type="lowpass",u.connect(l),e){case"str":case"pad":{u.frequency.value=e==="str"?2400:1100,u.Q.value=.4;for(const f of[-8,0,7])this.osc("sawtooth",t,n,c+.6,u,f);this.env(l,n,e==="str"?.35:.6,i,s,.7);break}case"choir":{const f=o.createBiquadFilter();f.type="bandpass",f.frequency.value=900,f.Q.value=1.5,f.connect(l);for(const d of[-12,0,11])this.osc("sawtooth",t,n,c+1,f,d);this.env(l,n,1.2,i,s*1.4,1.2),u.disconnect();break}case"horn":{u.frequency.setValueAtTime(500,n),u.frequency.linearRampToValueAtTime(2600,n+.08),u.frequency.exponentialRampToValueAtTime(1300,n+.4);const f=this.osc("sawtooth",t,n,c,u);this.osc("square",t/2,n,c,u).detune.value=4;const d=o.createOscillator(),m=o.createGain();d.frequency.value=5.2,m.gain.setValueAtTime(0,n),m.gain.linearRampToValueAtTime(t*.006,n+.4),d.connect(m).connect(f.frequency),d.start(n),d.stop(c+.1),this.env(l,n,.05,i,s*.8,.18);break}case"flute":case"choirlead":{u.frequency.value=e==="flute"?3200:1400;const f=this.osc(e==="flute"?"triangle":"sawtooth",t,n,c,u),d=o.createOscillator(),m=o.createGain();d.frequency.value=5.5,m.gain.setValueAtTime(0,n),m.gain.linearRampToValueAtTime(t*.008,n+.3),d.connect(m).connect(f.frequency),d.start(n),d.stop(c+.1),this.env(l,n,.06,i,s*(e==="flute"?1.3:.7),.2);break}case"harp":case"pluck":{u.frequency.setValueAtTime(e==="harp"?4e3:2400,n),u.frequency.exponentialRampToValueAtTime(600,n+.5),this.osc(e==="harp"?"triangle":"sawtooth",t,n,n+1.2,u),l.gain.setValueAtTime(s,n),l.gain.exponentialRampToValueAtTime(1e-4,n+(e==="harp"?1.1:.4));break}case"bell":{u.frequency.value=6e3,this.osc("sine",t,n,n+2.5,u);const f=o.createGain();f.gain.value=.35,f.connect(u),this.osc("sine",t*2.76,n,n+1.2,f),l.gain.setValueAtTime(s*2,n),l.gain.exponentialRampToValueAtTime(1e-4,n+2.4);break}case"ost":{u.frequency.setValueAtTime(1800,n),u.frequency.exponentialRampToValueAtTime(400,n+.12),this.osc("sawtooth",t,n,c,u),l.gain.setValueAtTime(s,n),l.gain.exponentialRampToValueAtTime(1e-4,c+.05);break}case"bass":{u.frequency.value=420,this.osc("sawtooth",t,n,c,u),this.osc("sine",t/2,n,c,u),this.env(l,n,.02,i,s,.15);break}}}drum(e,t,n,i){const s=this.ctx,a=s.createGain(),o=this.cur?this.cur.out:this.sfxG;if(a.connect(o),e==="kick"||e==="timp"){const u=s.createOscillator();u.type="sine";const f=e==="kick"?120:i*2,d=e==="kick"?42:i;if(u.frequency.setValueAtTime(f,t),u.frequency.exponentialRampToValueAtTime(d,t+(e==="kick"?.12:.2)),u.connect(a),u.start(t),u.stop(t+1.2),a.gain.setValueAtTime(n,t),a.gain.exponentialRampToValueAtTime(1e-4,t+(e==="kick"?.35:1.1)),e==="timp"){const m=s.createGain();m.gain.value=.4,a.connect(m),m.connect(this.rev)}return}const l=s.createBufferSource();l.buffer=this.noise;const c=s.createBiquadFilter();c.type=e==="hat"||e==="crash"?"highpass":"bandpass",c.frequency.value=e==="hat"?7e3:e==="crash"?4e3:1800,l.connect(c).connect(a);const h=e==="hat"?.05:e==="crash"?1.4:.18;if(a.gain.setValueAtTime(n,t),a.gain.exponentialRampToValueAtTime(1e-4,t+h),l.start(t),l.stop(t+h+.05),e==="snare"){const u=s.createGain();u.gain.value=.3,a.connect(u),u.connect(this.rev)}}sfx(e){if(!this.ctx||this.ctx.state!=="running")return;const t=this.ctx,n=t.currentTime+.01,i=this.sfxG,s=(l,c,h,u,f)=>{const d=t.createGain();d.connect(i);const m=t.createOscillator();m.type=l,m.frequency.setValueAtTime(c,n),m.frequency.exponentialRampToValueAtTime(h,n+u),m.connect(d),m.start(n),m.stop(n+u+.05),d.gain.setValueAtTime(f,n),d.gain.exponentialRampToValueAtTime(1e-4,n+u)},a=(l,c,h,u="bandpass")=>{const f=t.createGain();f.connect(i);const d=t.createBufferSource();d.buffer=this.noise;const m=t.createBiquadFilter();m.type=u,m.frequency.value=l,d.connect(m).connect(f),d.start(n),d.stop(n+c+.05),f.gain.setValueAtTime(h,n),f.gain.exponentialRampToValueAtTime(1e-4,n+c)},o=(l,c,h="triangle",u=.15)=>l.forEach((f,d)=>{const m=t.createGain();m.connect(i);const v=t.createGain();v.gain.value=.5,m.connect(v),v.connect(this.rev);const p=t.createOscillator();p.type=h,p.frequency.value=Zt(f),p.connect(m);const g=n+d*c;p.start(g),p.stop(g+.6),m.gain.setValueAtTime(u,g),m.gain.exponentialRampToValueAtTime(1e-4,g+.55)});switch(e){case"move":s("triangle",880,990,.05,.05);break;case"ok":s("triangle",990,1480,.08,.08);break;case"cancel":s("triangle",660,440,.09,.07);break;case"hit":a(1200,.12,.35),s("square",220,80,.1,.08);break;case"slash":a(3e3,.16,.3,"highpass");break;case"heavy":a(600,.3,.5),s("sine",160,40,.3,.3);break;case"magic":o([84,88,91,96],.04,"sine",.08),a(5e3,.4,.06,"highpass");break;case"heal":o([72,76,79,84,88],.06,"sine",.09);break;case"chest":o([67,72,76,79,84],.07,"triangle",.12);break;case"door":s("sawtooth",90,60,.5,.12),a(300,.5,.15);break;case"step":a(500,.04,.03,"lowpass");break;case"push":a(220,.25,.25,"lowpass"),s("sine",90,60,.2,.15);break;case"encounter":o([62,65,69,74,77,81],.035,"sawtooth",.06);break;case"victory":o([67,67,67,72,79,76,79,84],.11,"square",.07);break;case"levelup":o([72,76,79,84,79,84,88],.07,"triangle",.12);break;case"special":o([60,67,72,79,84,91],.05,"sawtooth",.07),a(800,.6,.2);break}}}const Fn=r=>document.getElementById(r),Za=new URLSearchParams(location.search),Di={get(r){try{return localStorage.getItem(r)}catch{return null}},set(r,e){try{localStorage.setItem(r,e)}catch{}},has(r){try{return localStorage.getItem(r)!==null}catch{return!1}}};function ld(r){console.error(r);const e=Fn("lerr");e.style.display="block",e.textContent="Fehler beim Start: "+(r&&r.message?r.message:String(r)),Fn("ltxt").textContent="Das Spiel konnte nicht starten.",Fn("load").classList.remove("out")}addEventListener("error",r=>{cd||ld(r.error||r.message)});let cd=!1;const rc="anmachaQuest_cfg";let ji={};try{ji=JSON.parse(Di.get(rc))||{}}catch{}const qM=matchMedia("(pointer: coarse)").matches;let jM=Za.has("q")?Math.max(0,Math.min(2,+Za.get("q")|0)):ji.q??(qM?1:2);const $M=Za.has("q");async function YM(){const r=Fn("cv"),e=document.createElement("canvas");if(!(e.getContext("webgl2")||e.getContext("webgl")))throw new Error("Dein Browser unterstützt kein WebGL.");await ZM();const t=new XM;t.on=ji.music!==!1;const n=()=>t.unlock();addEventListener("pointerdown",n,!0),addEventListener("keydown",n,!0);const i=new Jd(null,null,{store:Di,debug:Za.has("debug"),audio:t});i.onAudio=f=>{ji.music=f,Di.set(rc,JSON.stringify(ji))};const s=new np(i),a=new OM(r,i,jM);i.ui=s,i.view=a,s.view=a,a.onQuality=f=>{ji.q=f,Di.set(rc,JSON.stringify(ji))},window.__quest=i;const o=[...FM,"kk/Knight.glb","kk/Mage.glb","kk/Rogue_Hooded.glb"];let l=0;pM(()=>{});const c=a.loadHdr();await Promise.all(o.map(f=>Mt(f).then(()=>{l++;const d=Math.round(l/o.length*100);Fn("lfill").style.width=d+"%",Fn("ltxt").textContent=`Lade Spielwelt … ${d} %`}))),await c,ef(i.S,i.rng,"hub",{x:12,y:12}),i.mode=Dt.TITLE,await a.ready(),a.frame(.016),cd=!0,Fn("load").classList.add("out"),setTimeout(()=>Fn("load").remove(),600),setTimeout(()=>Fn("rot")?.remove(),9e3),JM(i,s);let h=performance.now();const u=f=>{const d=Math.min(.05,(f-h)/1e3);h=f,i.stick=KM(),i.update(d),a.frame(d),s.frame(),a.watchFps(d,$M||document.hidden),requestAnimationFrame(u)};requestAnimationFrame(u),i.showTitle()}function KM(){let r=[];try{r=navigator.getGamepads?navigator.getGamepads():[]}catch{}for(const e of r){if(!e||!e.connected||!e.axes||e.axes.length<2)continue;const t=e.axes[0]||0,n=e.axes[1]||0,i=Math.hypot(t,n);if(i>.22)return{x:t,y:n,m:Math.min(1,(i-.22)/.7)}}return null}const Xu="anmachaQuest_legacy",il=r=>{let e=2166136261;for(let t=0;t<r.length;t++)e^=r.charCodeAt(t),e=Math.imul(e,16777619);return(e>>>0).toString(36)+":"+r.length};async function ZM(){const r=await zM();if(!r)return;const e=JSON.stringify(r),t={src:il(e),save:il(e)};let n=null;try{n=JSON.parse(Di.get(Xu))}catch{}const i=Di.get(xr);n&&n.src===t.src||i!==null&&(!n||il(i)!==n.save)||(Di.set(xr,e),Di.set(Xu,JSON.stringify(t)))}const qu={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",Space:"ok",Enter:"ok",NumpadEnter:"ok",KeyZ:"ok",Escape:"cancel",KeyX:"cancel",Backspace:"cancel",KeyM:"menu",Tab:"menu"},hr={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};function JM(r,e){addEventListener("keydown",n=>{if(n.code==="F8"||n.code==="F9"){r.debugKey(n.code);return}const i=qu[n.code]||(n.key==="Enter"?"ok":n.key==="Escape"?"cancel":null);i&&(n.preventDefault(),hr[i]&&!n.repeat&&r.pressDir(hr[i],!0),!(n.repeat&&!hr[i])&&(e.action(i)||i==="ok"&&!n.repeat&&r.actionFront()||(i==="menu"||n.code==="Escape")&&r.mode===Dt.WORLD&&r.openMenu()))});const t=n=>{(n.code==="ShiftLeft"||n.code==="ShiftRight")&&(r.walkKey=n.type==="keydown")};addEventListener("keydown",t),addEventListener("keyup",t),addEventListener("keyup",n=>{const i=qu[n.code];i&&hr[i]&&r.pressDir(hr[i],!1)}),addEventListener("blur",()=>{r.clearDirs(),r.walkKey=!1}),document.addEventListener("visibilitychange",()=>{document.hidden&&r.clearDirs()}),document.addEventListener("contextmenu",n=>n.preventDefault()),QM(r),document.addEventListener("gesturestart",n=>n.preventDefault())}function QM(r){const e=()=>r.view,t=new Set,n=()=>{e().camKeys=(t.has("KeyE")?1:0)-(t.has("KeyQ")?1:0)};addEventListener("keydown",c=>{c.code==="KeyQ"||c.code==="KeyE"?(t.add(c.code),n()):!c.repeat&&(c.code==="KeyR"||c.code==="PageUp")?e().zoomCam(-1):!c.repeat&&(c.code==="KeyF"||c.code==="PageDown")&&e().zoomCam(1)}),addEventListener("keyup",c=>{t.delete(c.code)&&n()}),addEventListener("blur",()=>{t.clear(),n()});const i=Fn("cv"),s=new Map;let a=0;i.addEventListener("pointerdown",c=>{s.set(c.pointerId,{x:c.clientX,y:c.clientY});try{i.setPointerCapture(c.pointerId)}catch{}if(s.size===2){const[h,u]=[...s.values()];a=Math.hypot(h.x-u.x,h.y-u.y)}}),i.addEventListener("pointermove",c=>{const h=s.get(c.pointerId);if(h){if(s.size===1)e().rotateCam(-(c.clientX-h.x)*.008);else if(s.size===2){h.x=c.clientX,h.y=c.clientY;const[u,f]=[...s.values()],d=Math.hypot(u.x-f.x,u.y-f.y);a&&Math.abs(d-a)>60&&(e().zoomCam(d>a?-1:1),a=d);return}h.x=c.clientX,h.y=c.clientY}});const o=c=>{s.delete(c.pointerId),s.size<2&&(a=0)};i.addEventListener("pointerup",o),i.addEventListener("pointercancel",o);let l=0;i.addEventListener("wheel",c=>{c.preventDefault();const h=performance.now();h-l<180||(l=h,e().zoomCam(c.deltaY>0?1:-1))},{passive:!1})}YM().catch(ld);
