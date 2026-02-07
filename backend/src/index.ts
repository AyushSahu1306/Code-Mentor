import 'dotenv/config'
import express from "express";
import cors from 'cors';
import { runUserCode } from "./runner";
import { explainResult } from "./ai";
import { detectIntent } from './intent';
import { getSession } from './session';

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health",(_req,res)=>{
    res.json({ok:true});
});

app.post("/api/message",async(req,res)=>{
    const {sessionId,message,code} = req.body;

    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const session = getSession(sessionId);

    if(!message) return res.status(400).json({error:"message required"});

    session.messages.push({
        role:"user",
        content:message
    });

    session.lastCode = code || "";

    const intent = await detectIntent(message);

    if(intent == "practice"){
        if(!code){
            return res.status(400).json({error:"code is  required"});
        }

        const tests = `
    function assertEqual(a,b,msg){
    if(a!==b) throw new Error(msg + ": expected " + b + " got " + a);
    }

    assertEqual(sum([1,2,3]),6,"basic");
    assertEqual(sum([]),0,"empty");
    assertEqual(sum([-1,5]),4,"negative");

    console.log("ALL_TESTS_PASSED");
    `;

        try {
            const result = await runUserCode(code,tests);

            const passed = result.stdout.includes("ALL_TESTS_PASSED");

            const explanation = await explainResult({
                messages:session.messages,
                code,
                stdout:result.stdout,
                stderr:result.stderr,
                passed
            })

            session.messages.push({
                role: "assistant",
                content: explanation,
            });

            res.json({
                passed,
                stdout:result.stdout,
                stderr:result.stderr,
                explanation
            });
        } catch (error:any) {
            res.status(500).json({ error: error.message});   
        }
    }

    else {

       try {
         if (!message) return res.status(400).json({ error: "message required" });
 
         const explanation = await explainResult({
             messages:session.messages,
             code:session.lastCode || "",
             stdout: "",
             stderr: "",
             passed: true, 
         });
         session.messages.push({
             role:"assistant",
             content:explanation,
         })
         res.json({ response: explanation });
       } catch (error:any) {
            return res.status(500).json({ error: error.message });
       }
    }
})


app.listen(3001,()=>{
    console.log("Backend running on http://localhost:3001");
});