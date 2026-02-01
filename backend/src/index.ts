import express from "express";
import cors from 'cors';
import { error } from "node:console";

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

    res.json({
        stdout:"",
        tests:[],
        aiFeedback:"Not implemented yet"
    });
});

app.listen(3001,()=>{
    console.log("Backend running on http://localhost:3001");
});