import express from "express";
import cors from 'cors';
import { error } from "node:console";
import { runUserCode } from "./runner";
import { stderr } from "node:process";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health",(_req,res)=>{
    res.json({ok:true});
});

app.post("/api/run",async(req,res)=>{
    const {code} = req.body;
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

        res.json({
            passed,
            stdout:result.stdout,
            stderr:result.stderr
        });
    } catch (error) {
        res.status(500).json({ error: "Execution failed" });   
    }
});

app.listen(3001,()=>{
    console.log("Backend running on http://localhost:3001");
});