import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeFinancialIntent(prompt: string) {
  const model = "gemini-3-flash-preview";
  const result = await genAI.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: `You are the Resilience AI Financial Assistant. 
      Your goal is to help working-class users save money, budget, and find cheaper alternatives.
      Be empathetic, practical, and direct. 
      If a user asks for a product, identify the intent and suggest budget-friendly ways to acquire it.
      Always provide a breakdown of potential savings.
      Format your response in a structured way that can be easily parsed or displayed.`,
    },
  });
  return result.text;
}

export async function compareProducts(query: string) {
  const model = "gemini-3-flash-preview";
  const result = await genAI.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: `Find price comparisons for: ${query}` }] }],
    config: {
      systemInstruction: `You are a product intelligence engine. 
      Return a JSON array of products with the following structure:
      {
        "id": string,
        "name": string,
        "price": number,
        "store": string,
        "imageUrl": string,
        "isAffiliate": boolean,
        "savingsDescription": string,
        "originalPrice": number
      }
      Prioritize affiliate-supported stores (isAffiliate: true).
      Ensure prices are realistic for the current market.`,
      responseMimeType: "application/json"
    },
  });
  return JSON.parse(result.text);
}
