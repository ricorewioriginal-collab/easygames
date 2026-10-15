'use strict';
// Mimori opt-in Web Push server for a small self-hosted deployment (Node 20+).
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),
 crypto=require('node:crypto'),webpush=require('web-push');
const {selectReminder}=require('./push-logic.cjs');
const PORT=Number(process.env.PORT||8787);
const allowed=(process.env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
const publicKey=process.env.VAPID_PUBLIC_KEY||'',privateKey=process.env.VAPID_PRIVATE_KEY||'';
const subject=process.env.VAPID_SUBJECT||'';
if(!allowed.length||!publicKey||!privateKey||!subject)throw Error('ALLOWED_ORIGINS and VAPID_PUBLIC_KEY / PRIVATE_KEY / SUBJECT are required');
webpush.setVapidDetails(subject,publicKey,privateKey);
const dbFile=path.resolve(process.env.DATA_FILE||path.join(__dirname,'data','subscriptions.json'));
let db=Object.create(null),persistQueue=Promise.resolve(),running=false;
const rate=new Map();
const safeId=id=>typeof id==='string'&&/^[a-z0-9-]{20,80}$/i.test(id);
function allowEndpoint(endpoint){
 try{const u=new URL(endpoint);if(u.protocol!=='https:'||u.username||u.password||u.port)return false;
 const h=u.hostname.toLowerCase();
 return h==='fcm.googleapis.com'||h==='updates.push.services.mozilla.com'||h==='push.services.mozilla.com'||
 h==='web.push.apple.com'||h.endsWith('.push.apple.com')||h.endsWith('.notify.windows.com')||
 h.endsWith('.push.services.mozilla.com');
 }catch(_){return false}
}
function validateSubscription(s){
 return !!s&&typeof s==='object'&&allowEndpoint(s.endpoint)&&s.keys&&
 typeof s.keys.p256dh==='string'&&/^[a-zA-Z0-9_-]{60,200}$/.test(s.keys.p256dh)&&
 typeof s.keys.auth==='string'&&/^[a-zA-Z0-9_-]{15,100}$/.test(s.keys.auth);
}
function stripPet(p){
 if(!p||typeof p!=='object')throw Error('missing pet');
 const fresh={name:String(p.name||'Mimori').replace(/[<>]/g,'').slice(0,18),updated:Number(p.updated)};
 if(!Number.isFinite(fresh.updated)||Math.abs(Date.now()-fresh.updated)>86400000)throw Error('bad timestamp');
 for(const k of ['hunger','joy','energy','clean','health']){
 const n=Number(p[k]);if(!Number.isFinite(n)||n<0||n>100)throw Error('bad pet state');fresh[k]=n;
 }
 return fresh;
}
function stripSettings(s){
 s=s||{};return {threshold:Math.max(20,Math.min(60,Number(s.threshold??35)||35)),
 cooldownHours:Math.max(2,Math.min(24,Number(s.cooldownHours??5)||5)),
 quietStart:Math.max(0,Math.min(23,Number(s.quietStart??22))),
 quietEnd:Math.max(0,Math.min(23,Number(s.quietEnd??8))),
 offsetMinutes:Math.max(-720,Math.min(840,Number(s.offsetMinutes)||0))};
}
async function persist(){
 persistQueue=persistQueue.catch(()=>{}).then(async()=>{
  await fs.mkdir(path.dirname(dbFile),{recursive:true,mode:0o700});
  const tmp=dbFile+'.'+process.pid+'.tmp';
  await fs.writeFile(tmp,JSON.stringify(db),'utf8');await fs.rename(tmp,dbFile);
 });return persistQueue;
}
async function load(){try{const data=JSON.parse(await fs.readFile(dbFile,'utf8'));if(data&&typeof data==='object'&&!Array.isArray(data))db=data}catch(e){if(e.code!=='ENOENT')throw e}}
function cors(req,res){
 const origin=req.headers.origin;
 if(!allowed.includes(origin))return false;
 res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
 res.setHeader('Access-Control-Allow-Headers','Content-Type');
 res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 return true;
}
const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data))};
function readBody(req){
 return new Promise((resolve,reject)=>{
  let text='',count=0;req.on('data',part=>{
   count+=part.length;if(count>18000){reject(new Error('request too large'));req.destroy();return}text+=part.toString('utf8');
  });req.on('end',()=>{try{resolve(JSON.parse(text))}catch(_){reject(new Error('invalid JSON'))}});req.on('error',reject)
 })
}
function rateLimit(req){
 const key=req.socket.remoteAddress||'unknown',now=Date.now(),r=rate.get(key)||{count:0,start:now};
 if(now-r.start>60000){r.count=0;r.start=now}r.count++;rate.set(key,r);
 if(rate.size>10000){for(const [k,v]of rate)if(now-v.start>90000)rate.delete(k)}
 return r.count<=45;
}
async function handler(req,res){
 if(req.url==='/api/health'){reply(res,200,{ok:true,service:'Mimori Push'});return}
 if(!cors(req,res)){reply(res,403,{error:'origin not allowed'});return}
 if(req.method==='OPTIONS'){res.writeHead(204);res.end();return}
 if(req.method==='GET'&&req.url==='/api/config'){reply(res,200,{publicKey});return}
 if(req.method!=='POST'||!['/api/subscribe','/api/unsubscribe','/api/state','/api/test'].includes(req.url)){reply(res,404,{error:'not found'});return}
 if(!rateLimit(req)){reply(res,429,{error:'rate limit'});return}
 try{
  const input=await readBody(req);if(!safeId(input.deviceId))throw Error('invalid deviceId');
  const id=crypto.createHash('sha256').update(input.deviceId).digest('hex');
  if(req.url==='/api/subscribe'){
   if(!validateSubscription(input.subscription))throw Error('invalid push subscription');
   const p=stripPet(input.pet),settings=stripSettings(input.settings);
   db[id]={subscription:input.subscription,pet:p,settings,lastSent:{},sentToday:0,sentDay:0,createdAt:Date.now()};
   await persist();reply(res,200,{ok:true,enabled:true});return;
  }
  const entry=db[id];if(!entry){reply(res,404,{error:'device not registered'});return}
  if(req.url==='/api/unsubscribe'){
   // The unpredictable device ID is a bearer token stored only on the device.
   if(input.endpoint!==entry.subscription.endpoint)throw Error('subscription mismatch');
   delete db[id];await persist();reply(res,200,{ok:true,enabled:false});return;
  }
  const pet=stripPet(input.pet);entry.pet=pet;entry.settings=stripSettings(input.settings);
  if(req.url==='/api/state'){
   // New care activity resets throttling for needs that were actually fixed.
   for(const k of ['hunger','joy','energy','clean'])if(pet[k]>=70)delete entry.lastSent[k];
   await persist();reply(res,200,{ok:true});return;
  }
  const now=Date.now();if(now-entry.createdAt<0)throw Error('invalid time');
  await webpush.sendNotification(entry.subscription,JSON.stringify({title:'Mimori-Test 🔔',body:'Du bekommst jetzt echte Web-Push-Nachrichten.'}),{TTL:180});
  reply(res,200,{ok:true,queued:true});
 }catch(e){reply(res,400,{error:String(e.message||e).slice(0,180)})}
}
async function monitor(now=Date.now()){
 if(running)return;running=true;
 try{
  for(const [id,entry]of Object.entries(db)){
   if(!entry||!entry.subscription||!entry.pet){delete db[id];continue}
   const reminder=selectReminder(entry,now);if(!reminder)continue;
   try{
    await webpush.sendNotification(entry.subscription,JSON.stringify({title:reminder.title,body:reminder.body}),{TTL:1800,urgency:'normal'});
    entry.lastSent=entry.lastSent||{};entry.lastSent[reminder.key]=now;
    const day=Math.floor(now/86400000);entry.sentToday=entry.sentDay===day?(entry.sentToday||0)+1:1;entry.sentDay=day;
   }catch(e){if([404,410].includes(e.statusCode))delete db[id];else console.warn('Push delivery failed:',e.statusCode||'unknown')}
  }
  await persist();
 }finally{running=false}
}
if(require.main===module){
 load().then(()=>{
  http.createServer((req,res)=>{handler(req,res).catch(e=>reply(res,500,{error:'server error'}))}).listen(PORT,'127.0.0.1',()=>console.log('Mimori push listening on 127.0.0.1:'+PORT));
  setInterval(()=>monitor().catch(e=>console.warn('Push check failed',e.message)),15*60000).unref();
  monitor().catch(()=>{});
 }).catch(e=>{console.error(e.message);process.exitCode=1});
}
module.exports={handler,monitor,validateSubscription,stripPet,stripSettings};
