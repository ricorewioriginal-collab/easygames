import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {SaveManager,KEY,defaults} from '../src/save.js';
const source=readFileSync(new URL('../vendor/anmacha-cloud.js',import.meta.url),'utf8');

function harness({signedIn=false,remote={},fail=false}={}){
 class Storage{
  constructor(){this.items=new Map}
  getItem(k){return this.items.get(String(k))??null}
  setItem(k,v){this.items.set(String(k),String(v))}
  removeItem(k){this.items.delete(String(k))}
  key(i){return Array.from(this.items.keys())[i]??null}
  get length(){return this.items.size}
 }
 const local=new Storage,session=new Storage,requests=[],tasks=new Map;let next=0,reloads=0;
 local.setItem('easygames.lumo.v1','keep-other-game');
 if(signedIn){local.setItem('anmacha-cloud-on','1');local.setItem('anmacha-cloud-rt','test-only-refresh-token')}
 const fetch=async(url,options={})=>{
  requests.push({url,options});if(fail)throw Error('Offline');
  let data={};
  if(url.includes('securetoken.googleapis.com'))data={id_token:'test-only-id-token',expires_in:3600,user_id:'test-user'};
  else if(url.includes('accounts:lookup'))data={users:[{displayName:'Test Player'}]};
  else if(url.includes('action=saves_get'))data={status:'ok',d:JSON.stringify(remote),ver:'v1',t:1};
  else if(url.includes('action=saves_put'))data={status:'ok',ver:'v2'};
  return {ok:true,status:200,json:async()=>data};
 };
 const document={currentScript:{dataset:{game:'kiko-sterneninseln',prefix:KEY,ui:'off'}},body:{},visibilityState:'visible',addEventListener(){},querySelectorAll:()=>[]};
 const window={localStorage:local,Promise,fetch,addEventListener(){}};
 const context={window,document,Storage,fetch,sessionStorage:session,location:{hostname:'appassets.local',reload(){reloads++}},navigator:{userAgent:'RicoReWiApp/test'},setTimeout(fn){const id=++next;tasks.set(id,fn);return id},clearTimeout(id){tasks.delete(id)},console};
 vm.runInNewContext(source,context);
 return {local,requests,tasks,api:window.AnMaChaCloud,get reloads(){return reloads},async idle(){for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve))}}
}
test('cloud remains optional: signed-out local saves never load Firebase or make requests',async()=>{
 const h=harness();h.local.setItem(KEY,JSON.stringify(defaults));await h.api.sync();await h.idle();assert.equal(h.requests.length,0);assert.ok(h.local.getItem(KEY));assert.equal(h.local.getItem('easygames.lumo.v1'),'keep-other-game')
});
test('existing cloud module restores and uploads a separate Kiko save for a signed-in test user',async()=>{
 const restored=structuredClone(defaults);restored.unlocked=5;restored.stars[0]=3;
 const h=harness({signedIn:true,remote:{[KEY]:{v:JSON.stringify(restored),t:100}}});await h.idle();
 assert.equal(JSON.parse(h.local.getItem(KEY)).unlocked,5);assert.equal(h.reloads,1);
 const next=structuredClone(restored);next.unlocked=6;h.local.setItem(KEY,JSON.stringify(next));await h.api.sync();await h.idle();
 const save=h.requests.findLast(r=>r.options.method==='POST'&&r.url.includes('action=saves_put')&&JSON.parse(r.options.body).game==='kiko-sterneninseln');
 assert.ok(save,'Kiko save was not uploaded');assert.equal(JSON.parse(save.options.body).pre,'v1');assert.ok(!h.requests.some(r=>r.url.includes('firestore')),'no Firestore access');const payload=JSON.parse(JSON.parse(save.options.body).d);
 assert.deepEqual(Object.keys(payload),[KEY]);assert.equal(JSON.parse(payload[KEY].v).unlocked,6);
 assert.equal(h.local.getItem('easygames.lumo.v1'),'keep-other-game');
});
test('cloud outage preserves local progress and permits continuing offline',async()=>{
 const h=harness({signedIn:true,fail:true});h.local.setItem(KEY,JSON.stringify({...defaults,unlocked:3}));await h.idle();await h.api.sync();assert.equal(JSON.parse(h.local.getItem(KEY)).unlocked,3);assert.equal(h.reloads,0)
});
test('SaveManager adopts a restored cloud save without writing stale progress back',()=>{
 const values=new Map;globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};const s=new SaveManager;s.finish(0,1,500);assert.equal(s.refresh(),false);
 const remote=structuredClone(defaults);remote.unlocked=7;remote.stars[0]=3;remote.settings.language='en';values.set(KEY,JSON.stringify(remote));assert.equal(s.refresh(),true);assert.equal(s.data.unlocked,7);assert.equal(s.data.stars[0],3);assert.equal(s.data.settings.language,'en');assert.equal(s.refresh(),false);s.finish(6,2,650);assert.equal(JSON.parse(values.get(KEY)).unlocked,8);
 values.set(KEY,'{damaged cloud save');assert.equal(s.refresh(),true);assert.equal(s.data.unlocked,1)
});
test('HTML connects only Kiko storage and provides a persistent in-menu mount',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/data-game="kiko-sterneninseln"/);assert.match(html,/data-prefix="kiko-sterneninseln-v1"/);assert.match(html,/data-mount="#cloudMount"/);assert.match(html,/id="cloudAccount"/);assert.match(html,/vendor\/anmacha-cloud\.js/)
});
