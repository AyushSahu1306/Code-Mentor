const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function detectIntent(message: string): Promise<"tutor" | "practice"> {
  const prompt = `
    Classify user intent.

    If user wants explanation or learning: tutor
    If user wants code checked, run, validated: practice

    Reply ONLY with: tutor or practice.

    Message:
    ${message}
    `;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const result = await res.json();
  const text = result.choices[0].message.content.trim().toLowerCase();

  return text === "practice" ? "practice" : "tutor";
}
