import React from "react";
import * as esbuild from "esbuild-wasm";
import "./App.css";

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
      wasmURL: "/esbuild.wasm",
    });
  };
  const submitCode = async () => {
    if (!ref.current) return;
    const result = await ref.current.transform(input, {
      loader: "jsx",
      target: "es2015",
    });
    setCode(result.js);
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
