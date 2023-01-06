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

        build.onLoad({filter: /(^index\.js$)/}, async () => {
          return {
            loader:'jsx',
            contents:inputCode
          }
        })

      build.onLoad({filter: /.*/}, async (args:any) => {
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
        if(cachedResult) {
          return cachedResult;
        }
      })

        build.onLoad({filter: /.css$/}, async (args: any) => {
          const { data, request } = await axios(args.path);
          const escapedData  = data.replace(/\n/g, '').replace(/"/g,'\\"' ).replace(/'/g, "\\'");
          const contents = `
            const style = document.createElement('style');
            style.innerText = '${escapedData}';
            document.head.appendChild(style);
          `;
          const result:esbuild.OnLoadResult = {
            loader:'jsx',
            contents,
            resolveDir: new URL('./', request.responseURL).pathname
          }
          await fileCache.setItem(args.path, result);
          return result;
        })
        build.onLoad({ filter: /.*/ }, async (args: any) => {
            console.log("onLoad", args);
             
              const { data, request } = await axios(args.path);
              const result:esbuild.OnLoadResult = {
                loader:'jsx',
                contents:data,
                resolveDir: new URL('./', request.responseURL).pathname
              }
              await fileCache.setItem(args.path, result);
              return result;
          });
        }
    }
}


export {unpkgLoadPlugin}