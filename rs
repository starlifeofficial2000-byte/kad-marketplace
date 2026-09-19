warning: in the working copy of 'client/package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'client/vite.config.js', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/client/package.json b/client/package.json[m
[1mindex 87e37bf..4a5d539 100644[m
[1m--- a/client/package.json[m
[1m+++ b/client/package.json[m
[36m@@ -24,6 +24,7 @@[m
     "@types/react": "^19.2.17",[m
     "@types/react-dom": "^19.2.3",[m
     "@vitejs/plugin-react": "^6.0.3",[m
[32m+[m[32m    "esbuild": "^0.28.2",[m
     "oxlint": "^1.71.0",[m
     "vite": "^8.1.1"[m
   }[m
[1mdiff --git a/client/vite.config.js b/client/vite.config.js[m
[1mindex 8b0f57b..57e71a0 100644[m
[1m--- a/client/vite.config.js[m
[1m+++ b/client/vite.config.js[m
[36m@@ -1,7 +1,9 @@[m
 import { defineConfig } from 'vite'[m
 import react from '@vitejs/plugin-react'[m
 [m
[31m-// https://vite.dev/config/[m
 export default defineConfig({[m
   plugins: [react()],[m
[31m-})[m
[32m+[m[32m  build: {[m
[32m+[m[32m    cssMinify: 'esbuild',[m
[32m+[m[32m  },[m
[32m+[m[32m})[m
\ No newline at end of file[m
