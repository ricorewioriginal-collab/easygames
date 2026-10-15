'use strict';
const levels={hunger:'Hunger',joy:'Langeweile',energy:'Müdigkeit',clean:'Sauberkeit'};
function clamp(x,a,b){return Math.min(b,Math.max(a,Number.isFinite(x)?x:a))}
function projected(p,now){
 const hours=clamp((now-(Number(p.updated)||now))/3600000,0,24*14);
 const vals={hunger:clamp(Number(p.hunger)-hours*8,0,100),joy:clamp(Number(p.joy)-hours*4.5,0,100),
 energy:clamp(Number(p.energy)-hours*5.5,0,100),clean:clamp(Number(p.clean)-hours*5,0,100)};
 const low=[vals.hunger,vals.joy,vals.energy,vals.clean].filter(x=>x<20).length;
 return {...vals,health:clamp(Number(p.health??92)+hours*(low?-1.4*low:.3),10,100)};
}
function quiet(now,options){
 const offset=clamp(Number(options?.offsetMinutes??0),-720,840),
 start=clamp(Number(options?.quietStart??22),0,23),
 end=clamp(Number(options?.quietEnd??8),0,23);
 const hour=new Date(now+offset*60000).getUTCHours();
 return start>end?(hour>=start||hour<end):(hour>=start&&hour<end);
}
function selectReminder(entry,now){
 const opts=entry.settings||{},p=projected(entry.pet||{},now);
 if(quiet(now,opts))return null;
 const threshold=clamp(Number(opts.threshold)||35,20,60),
 cooldown=clamp(Number(opts.cooldownHours)||5,2,24)*3600000;
 const candidates=Object.entries(p).filter(([key,value])=>value<=(key==='health'?25:threshold))
 .sort((a,b)=>a[1]-b[1]);
 const names={hunger:['🍓 Hunger','braucht etwas Leckeres!'],joy:['💗 Langeweile','möchte mit dir spielen!'],energy:['🌙 Müde','braucht eine kleine Pause!'],clean:['🫧 Badetag','wünscht sich ein Bad!'],health:['💚 Fürsorge','fühlt sich nicht wohl und braucht Hilfe!']};
 for(const [key]of candidates){
 const last=Number(entry.lastSent?.[key])||0;
 if(now-last<cooldown)continue;
 if((Number(entry.sentToday)||0)>=3&&Math.floor(now/86400000)===Number(entry.sentDay))continue;
 const [title,text]=names[key],petName=String(entry.pet?.name||'Mimori').slice(0,18);
 return {key,title:petName+' · '+title,body:petName+' '+text};
 }
 return null;
}
module.exports={projected,quiet,selectReminder};
