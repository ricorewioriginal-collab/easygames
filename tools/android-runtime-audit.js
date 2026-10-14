#!/usr/bin/env node
// Browser smoke test of the actual library/iframe flow with the native app's local origin and no internet.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'), base = 'https://appassets.androidplatform.net/easygames/';
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'sync/manifest.json')));
const packed = new Map(manifest.files.map(f => [f.p, f]));
const source = fs.readFileSync(path.join(root, 'android/core/src/main/kotlin/de/ricorewi/easygames/core/NativeHtml.kt'), 'utf8');
const guard = source.match(/private val guard = """([\s\S]*?)"""/)[1];
const bootstrap = source.match(/fun bootstrap\(startUrl: String\): String = """([\s\S]*?)"""/)[1].replace('$startUrl', base + 'index.html');
const mime = p => ({ html:'text/html', js:'text/javascript', mjs:'text/javascript', json:'application/json', css:'text/css', wasm:'application/wasm', svg:'image/svg+xml', png:'image/png', jpg:'image/jpeg', woff2:'font/woff2' })[p.split('.').pop()] || 'application/octet-stream';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  try {
    const ctx = await browser.newContext({ serviceWorkers:'block', viewport:{width:900,height:600} });
    await ctx.addInitScript(() => {
      window.appState = {app:true,state:'idle',pending:false,appVersion:'test'}; window.reloadCount = 0;
      window.EasyGamesApp = {getInfo:()=>JSON.stringify(window.appState),reload:()=>window.reloadCount++,syncNow:()=>{},openSettings:()=>{}};
    });
    await ctx.route('**/*', async route => {
      const url = route.request().url();
      if (url === base + '__prepare__.html') return route.fulfill({contentType:'text/html',body:bootstrap});
      let p;
      if (url.startsWith(base)) { p = decodeURIComponent(new URL(url).pathname.slice('/easygames/'.length)); if (!p || p.endsWith('/')) p += 'index.html'; }
      else p = manifest.vendor[url] || manifest.vendor[url.split('?')[0]];
      if (!p || !packed.has(p)) {
        if (url.startsWith(base)) return route.fulfill({status:404,body:''});
        return route.abort('internetdisconnected');
      }
      let body = fs.readFileSync(path.join(root,p));
      if (p.endsWith('.html')) body = Buffer.from(body.toString().replace(/<head(?:\s[^>]*)?>/i,m=>m+guard));
      return route.fulfill({contentType:mime(p),headers:{'access-control-allow-origin':'*','cache-control':'no-store'},body});
    });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base + 'index.html');
    assert(await page.locator('.tile').count() > 20, 'Game catalog must render');
    for (const id of process.argv.slice(2).length ? process.argv.slice(2) : ['anmacha-kart','partyverse','bunte-insel2','bunte-insel','anmacha-quest-rpg']) {
      const before = errors.length;
      await page.evaluate(id => openGame(GAMES.findIndex(g=>g.id===id)), id);
      await page.waitForTimeout(id === 'anmacha-quest-rpg' ? 12000 : 4000);
      const game = page.frames().find(f=>f !== page.mainFrame() && f.url().startsWith(base));
      assert(game, id + ': must play inside the app iframe');
      assert(await game.locator('canvas').count() > 0, id + ': missing game canvas');
      assert.equal(errors.length,before,id + ': ' + errors.slice(before).join('; '));
      await page.evaluate(()=>closeGame());
      console.log('PASS offline in-app launch: ' + id);
    }
    await page.evaluate(()=>openGame(GAMES.findIndex(g=>g.id==='anmacha-kart')));
    await page.evaluate(()=>{appState.pending=true;appState.state='ready';dispatchEvent(new Event('easygames:app-state'));});
    assert.equal(await page.evaluate(()=>reloadCount),0,'Update must not interrupt a game');
    await page.evaluate(()=>closeGame());
    assert.equal(await page.evaluate(()=>reloadCount),1,'Closing a game must apply pending catalog automatically');
    console.log('PASS deferred automatic update');
    await page.evaluate(async()=>{localStorage.setItem('save-check','kept');await (await caches.open('old-game')).put('old.js',new Response('old'));});
    await page.goto(base+'__prepare__.html');
    await page.waitForURL(base+'index.html');
    assert.equal(await page.evaluate(()=>localStorage.getItem('save-check')),'kept');
    assert.deepEqual(await page.evaluate(()=>caches.keys()),[]);
    console.log('PASS native bootstrap clears obsolete web caches and preserves saves');
    await ctx.close();
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
