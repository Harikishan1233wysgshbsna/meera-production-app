import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({root:'web',build:{outDir:'../dist',emptyOutDir:true,rollupOptions:{input:{main:resolve('web/index.html'),rc5:resolve('web/rc5.html')}}}});
