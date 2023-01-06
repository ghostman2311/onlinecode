import * as esbuild from 'esbuild-wasm'
import axios from 'axios'
import localforage from 'localforage'


const fileCache = localforage.createInstance({
    name: 'filecache'
})

const unpkgLoadPlugin =(inputCode:string) => {
    return {
        name:'unpkg-load-plugin',
        setup: (build: esbuild.PluginBuild) => {
        build.onLoad({ filter: /.*/ }, async (args: any) => {
            console.log("onLoad", args);
    
            if (args.path === "index.js") {
              return {
                loader: "jsx",
                contents:inputCode,
              }; 
            } 
              const cachedResult = await fileCache.getItem(args.path);
            //   if(cachedResult) {
            //     return cachedResult;
            //   }
              const { data, request } = await axios(args.path);
              const fileType  = args.path.match(/.css$/) ? 'css' : 'jsx';
              const contents = fileType === 'css' ? `
                const style = document.createElement('style');
                style.innerText = 'body {background-color:"red"}';
                document.head.appendChild(style);
              ` : data
              const result = {
                loader:'jsx',
                contents,
                resolveDir: new URL('./', request.responseURL).pathname
              }
              await fileCache.setItem(args.path, result);
              return result;
          });
        }
    }
}


export {unpkgLoadPlugin}