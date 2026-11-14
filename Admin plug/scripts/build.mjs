import {build} from 'esbuild';import fs from 'node:fs';
fs.mkdirSync('assets',{recursive:true});await build({entryPoints:['src/main.mjs'],bundle:true,minify:true,format:'esm',target:['safari15','chrome100'],outfile:'assets/admin.js',legalComments:'eof'});fs.copyFileSync('src/style.css','assets/admin.css');console.log('Built static GitHub Pages dashboard. No production data bundled.');
