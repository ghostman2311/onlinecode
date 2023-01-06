import React from "react";
import * as esbuild from "esbuild-wasm";
import "./App.css";
import { unpkgPathPlugin } from "./plugins/path-plugin";
import { unpkgLoadPlugin } from "./plugins/load-plugin";

function App() {
  const [input, setInput] = React.useState("");
  const [code, setCode] = React.useState("");

  const ref = React.useRef<any>();

  React.useEffect(() => {
    startService();
  }, []);

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
    });
  };
  const submitCode = async () => {
    if (!ref.current) return;
    // const result = await ref.current.transform(input, {
    //   loader: "jsx",
    //   target: "es2015",
    // });

    const result = await ref.current.build({
      entryPoints: ["index.js"],
      write: false,
      bundle: true,
      plugins: [unpkgPathPlugin(), unpkgLoadPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });

    console.log(result);
    setCode(result.outputFiles[0].text);
  };
  return (
    <div className="App">
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={submitCode}>Submit</button>
      <pre>{code}</pre>
    </div>
  );
}

export default App;
