import { spawn } from "child_process";
import crypto from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { unlink } from "fs/promises";

export async function runUserCode(userCode:string,testCode:string):Promise<{
    stdout:string;
    stderr:string
}>{
    const fileId = crypto.randomUUID();
    const filePath = path.join("/tmp",`${fileId}.js`);

    const fullProgram = `
    ${userCode} 

    ${testCode}
    `;

    await writeFile(filePath,fullProgram);

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

        const timeout = setTimeout(async ()=>{
            child.kill("SIGKILL");
            await unlink(filePath);
            resolve({stdout,stderr:stderr+"\nProcess killed: timeout"});
        },2000);

        child.on("close",async()=>{
            clearTimeout(timeout);
            await unlink(filePath);
            resolve({stdout,stderr});
        })
    })
}