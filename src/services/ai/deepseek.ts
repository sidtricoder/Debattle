// import OpenAI from "openai";
//
// // WARNING: Using API keys in the browser exposes them to users. Only do this if you understand the risks.
// const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY as string;
// if (!apiKey) {
//   throw new Error("VITE_DEEPSEEK_API_KEY is missing. Please set it in your .env file.");
// }
// const openai = new OpenAI({
//   baseURL: 'https://api.deepseek.com',
//   apiKey,
//   dangerouslyAllowBrowser: true, // Required for browser use, exposes your API key
// });
//
// export async function judgeWithDeepseek(prompt: string) {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "system", content: prompt }],
//     model: "deepseek-chat",
//   });
//   return completion.choices[0].message.content;
// }

// --- GROQ SDK for Llama-70b and Gemma2-9b ---
import Groq from "groq-sdk";

// WARNING: Using API keys in the browser exposes them to users. Only do this if you understand the risks.
const groqApiKey = import.meta.env.VITE_GROQ_API_KEY as string;
if (!groqApiKey) {
  throw new Error("VITE_GROQ_API_KEY is missing. Please set it in your .env file.");
}
const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });

// Supported models: 'llama-3.3-70b-versatile', 'gemma-2b-it'
export async function judgeWithGroq(prompt: string, model: 'llama-3.3-70b-versatile' | 'gemma-2b-it') {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model,
  });
  return completion.choices[0]?.message?.content || "";
} 