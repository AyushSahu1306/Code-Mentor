const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type ExplainParams = {
    userCode : string;
    stdout : string;
    stderr : string;
    passed : boolean;
};

export async function explainResult({
    userCode,stdout,stderr,passed
}:ExplainParams):Promise<string> {
    const prompt = `
    You are a strict but helpful programming tutor.

    Student code:
    ${userCode}

    Execution stdout:
    ${stdout}

    Execution stderr:
    ${stderr}

    Tests passed: ${passed}

    Rules:
    - If failed: explain what went wrong and how to fix it.
    - If passed: briefly confirm and optionally suggest improvement.
    - Do NOT rewrite full solution unless necessary.
    - Focus on reasoning and mistakes.
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
                {
                    role:"user",
                    content:prompt,
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