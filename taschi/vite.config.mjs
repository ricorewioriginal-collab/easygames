import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdirSync, copyFileSync } from 'node:fs';

// Serve the monorepo root so ../bunte-insel/vendor is accessible in development.
// Export to dist/taschi, accompanied by the exact local Three.js runtime used on GitHub Pages.
const here=dirname(fileURLToPath(import.meta.url));
const repository=resolve(here,'..');
export default defineConfig({
 root:repository,
 base:'./',
 server:{host:'0.0.0.0',open:'/taschi/'},
 build:{
  outDir:resolve(here,'dist'),
  emptyOutDir:true,
  rollupOptions:{input:resolve(here,'index.html')}
 },
 plugins:[{
  name:'taschi-copy-local-three',
  closeBundle(){
   const dest=resolve(here,'dist/bunte-insel/vendor');
   mkdirSync(dest,{recursive:true});
   copyFileSync(join(repository,'bunte-insel/vendor/three.min.js'),join(dest,'three.min.js'));
  }
 }]
});
