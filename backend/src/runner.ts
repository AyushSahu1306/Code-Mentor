import { spawn } from "child_process";
import crypto from "crypto";
import { writeFile } from "fs/promises";
import path from "path";

export async function runUserCode(code:string):Promise<{
    stdout:string;
    stderr:string
}>{
    const fileId = crypto.randomUUID();
    const filePath = path.join("/tmp",`${fileId}.js`);

    await writeFile(filePath,code);

    return new Promise((resolve) => {
        const child = spawn("node",[filePath]);

        let stdout = "";
        let stderr = "";

        child.stdout.on("data",(data)=>{
            stdout += data.toString();
        })

        child.stderr.on("data", (data) => {
        stderr += data.toString();
        });

        const timeout = setTimeout(()=>{
            child.kill("SIGKILL");
            resolve({stdout,stderr:stderr+"\nProcess killed: timeout"});
        },2000);

        child.on("close",()=>{
            clearTimeout(timeout);
            resolve({stdout,stderr});
        })
    })
}