"use client";

import { Editor } from "@monaco-editor/react";
import { useState } from "react";
import { v4 as uuid } from "uuid";

export default function Home(){
  const [code,setCode] = useState(`function sum(arr){\n return 0;\n}`);
  const [output,setOutput] = useState("");
  const [ai,setAi] = useState("");
  const [message,setMessage] = useState("");
  const [sessionId] = useState(()=>crypto.randomUUID()); 

  async function sendMessage() {
  const res = await fetch("http://localhost:3001/api/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      message,
      code
    }),
  });

  const data = await res.json();

  setOutput(data.stderr || data.stdout || "");
  setAi(data.explanation || data.response || "");
}


  return (
    <main className="p-4 grid grid-cols-2 gap-4 h-screen">

      <div className="flex flex-col">
        <Editor
          height="60vh"
          language="javascript"
          value={code}
          onChange={(v)=>setCode(v || "")}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white p-2 mt-2"
        >
          Send
        </button>


        <pre className="bg-black text-green-400 p-2 mt-2 h-40 overflow-auto">
          {output}
        </pre>
      </div>

      <div className="flex flex-col">
        <textarea
          placeholder="Ask AI"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 h-24"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white p-2 mt-2"
        >
          Send
        </button>


        <div className="border p-2 mt-2 flex-1 overflow-auto whitespace-pre-wrap">
          {ai}
        </div>
      </div>

    </main>
  )
}