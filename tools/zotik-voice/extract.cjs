// Sammelt alle Dialogzeilen ['Name','Text'] aus zotik-src/src -> JSON.  Aufruf: node extract.cjs ../../zotik-src/src lines.json
const fs=require('fs'),path=require('path');
const dir=process.argv[2];const out={};
const re=/\[\s*(?:'((?:[^'\\\n]|\\.)+)'|"((?:[^"\\\n]|\\.)+)")\s*,\s*(?:'((?:[^'\\\n]|\\.)+)'|"((?:[^"\\\n]|\\.)+)"|`((?:[^`\\$]|\\.)+)`)\s*[\],]/g;
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.js'))){
 const s=fs.readFileSync(path.join(dir,f),'utf8');let m;
 while((m=re.exec(s))){
  const who=m[1]??m[2],tx=m[3]??m[4]??m[5];
  if(!/^[A-ZÄÖÜ?][\wäöüÄÖÜß ?.\-]{0,24}$/.test(who)||tx.length<12||!/[ ]/.test(tx))continue;
  let w,t;try{w=new Function('return "'+who.replace(/"/g,'\\"')+'"')();t=tx.replace(/\\'/g,"'").replace(/\\"/g,'"').replace(/\\n/g,' ').replace(/\\\\/g,'\\')}catch(e){continue}
  (out[w]=out[w]||new Set()).add(t)}
}
const r={};let n=0,c=0;for(const k in out){r[k]=[...out[k]];n+=r[k].length;c+=r[k].reduce((a,b)=>a+b.length,0)}
const vs=fs.readFileSync(path.join(dir,'main.js'),'utf8').match(/^const VOX=(\{.*\});$/m);
const vox=vs?new Function('return '+vs[1])():{};
fs.writeFileSync(process.argv[3],JSON.stringify({lines:r,vox}));
console.log(n,c);console.log(Object.entries(r).map(([k,v])=>k+':'+v.length+'/'+v.reduce((a,b)=>a+b.length,0)).sort((a,b)=>parseInt(b.split(':')[1])-parseInt(a.split(':')[1])).slice(0,60).join('  '));
