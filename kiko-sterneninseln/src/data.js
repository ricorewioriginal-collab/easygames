export const worlds=[
 {name:'Sonnenwiesen',sky:0x65c4e8,fog:0x9fddde,ground:0x42a66b,trim:0x3a7553,accent:0xffd56e},
 {name:'Glitzerwald',sky:0x203758,fog:0x314f67,ground:0x43866d,trim:0x344f54,accent:0xb5ffce},
 {name:'Frosthöhen',sky:0x7299c1,fog:0xb6cadb,ground:0xaacfd8,trim:0x587da4,accent:0xb1edff},
 {name:'Sternenhimmel',sky:0x101631,fog:0x202b4d,ground:0x6b70a5,trim:0x3b406c,accent:0xffce80}
];
// Each path is a sequence of traversable rectangles (x, z, width, depth, top y).
const make=(name,world,path,puzzle='none',enemies=[],notes='')=>({name,world,path,puzzle,enemies,notes,
 crystals:[[0,1.4,1.5],[1,-1,0],[2,0,0],[3,-1,0],[4,0,0]],stars:[[0,-2.2],[2,2.2],[4,2.2]],
 start:[path[0][0],path[0][4]],portal:[path.at(-1)[0],path.at(-1)[1]+1.2]});
export const levels=[
 make('Das erste Sternenlicht',0,[[0,0,8,7,0],[0,6,7,5,0],[1,12,7,5,.4],[0,18,7,5,.5],[0,24,9,8,.5]],'none',[],'Joystick nach oben oder W: vorwärts. Sammle fünf Kristalle und springe über die Lücken.'),
 make('Die vergessene Brücke',0,[[0,0,8,7,0],[0,6,7,4,0],[1,12,6,4,0],[1,18,7,4,.4],[0,24,9,8,.4]],'bridge',[['hopper',1]],'Aktiviere den Schalter, um die Brücke zu öffnen.'),
 make('Der tanzende Wald',1,[[0,0,8,7,0],[1,6,5,4,.4],[-1,12,5,4,.9],[1,18,5,4,1.2],[0,24,9,8,1.2]],'none',[['flyer',2]],'Die großen Pilze tragen Kiko sicher.'),
 make('Das Rätsel der Lichtsteine',1,[[0,0,8,7,0],[0,6,7,5,0],[1,12,7,5,.4],[-1,18,7,5,.4],[0,24,9,8,.4]],'sequence',[['hopper',2]],'Berühre Lichtsteine in der Reihenfolge 1 → 2 → 3.'),
 make('Der eisige Aufstieg',2,[[0,0,8,7,0],[1,6,7,5,.4],[2,12,7,5,.8],[1,18,7,5,1.2],[0,24,9,8,1.2]],'none',[['flyer',2],['hopper',3]],'Auf Eis rutscht Kiko länger. Der Leuchtstein ist ein Checkpoint.'),
 make('Die Kristallhöhle',2,[[0,0,8,7,0],[0,6,7,5,0],[-1,12,7,5,.4],[0,18,7,5,.8],[0,24,9,8,.8]],'key',[['flyer',3]],'Finde den Schlüssel und öffne das Tor.'),
 make('Die zerbrochene Himmelsstraße',3,[[0,0,8,7,0],[2,6,6,4,.3],[0,12,6,4,.6],[-2,18,6,4,.9],[0,24,9,8,.9]],'dual',[['hopper',1],['flyer',3]],'Zwei Schalter laden das Himmelstor. Ein Seitenweg verbirgt einen Bonusstern.'),
 make('Das Herz der Sterne',3,[[0,0,8,7,0],[0,6,7,5,0],[1,12,7,5,.3],[0,18,8,6,.6],[0,25,12,11,.6]],'boss',[['flyer',2]],'Sammle alle Kristalle und triff das Herz dreimal, wenn es blau leuchtet.')
];
export function validateLevels(){return levels.every(l=>l.path.length===5&&l.crystals.length===5&&l.stars.length===3&&l.path.every((p,i)=>i===0||Math.hypot(p[0]-l.path[i-1][0],p[1]-l.path[i-1][1])<8));}
