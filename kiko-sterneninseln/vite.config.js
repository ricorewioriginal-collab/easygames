import {defineConfig} from 'vite';
import {cpSync} from 'node:fs';

export default defineConfig({
 base:'./',
 plugins:[{name:'copy-local-three',closeBundle(){cpSync('vendor','dist/vendor',{recursive:true})}}]
});
