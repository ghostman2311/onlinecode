import * as esbuild from "esbuild-wasm";
import axios from 'axios'
import localforage from "localforage"

const fileCache = localforage.createInstance({
  name: "fileCache"
})

export const unpkgPathPlugin = () => {

  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log("onResole", args);
         if(args.path === 'index.js'){
          return { path: args.path, namespace: "a" };
         } 
         else if(args.path.includes('./') || args.path.includes('../')){
          return{
            namespace: 'a',
            path: new URL(args.path, 'https://unpkg.com' + args.resolveDir +  '/').href
          }
         }

         return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`
         }
        
      });

    
    },
  };
};
