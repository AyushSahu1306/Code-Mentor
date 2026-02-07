const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type ChatMessage = {
    role:"user"|"assistant";
    content:string;
}


type ExplainParams = {
    messages:ChatMessage[];
    code:string;
    stdout : string;
    stderr : string;
    passed : boolean;
};

export async function explainResult({
    messages,code,stdout,stderr,passed
}:ExplainParams):Promise<string> {

   const finalUserMessage = `
        Current editor code:

        ${code || "(empty)"}

        Execution stdout:
        ${stdout || "(none)"}

        Execution stderr:
        ${stderr || "(none)"}

        Tests passed: ${passed}

        Explain clearly:
        - If failed: what went wrong and how to fix it.
        - If passed: confirm briefly and suggest improvement.
        `;

    const response = await fetch(OPENROUTER_URL,{
        method:"POST",
        headers:{
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },

        body:JSON.stringify({
            model: "openai/gpt-oss-120b:free",

            messages:[
                {
                    role:"system",
                    content:"You are an experienced software engineering tutor.",
                },
                ...messages,
                {
                    role:"user",
                    content:finalUserMessage,
                },
            ],
        }),
    });
    
    if(!response.ok){
        throw new Error("Openrouter request failed");
    }

    const result = await response.json();

    return result.choices[0].message.content;
}