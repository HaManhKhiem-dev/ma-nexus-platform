import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getDealSummary(dealData: any) {
  const prompt = `Summarize this M&A deal for a quick investor snapshot: ${JSON.stringify(dealData)}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
        systemInstruction: "You are an expert M&A analyst. Provide a professional, concise summary."
    }
  });
  return response.text;
}

export async function matchDealToInvestors(dealData: any, investorProfiles: any[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Match this deal to the best 3 investors: \nDeal: ${JSON.stringify(dealData)}\nInvestors: ${JSON.stringify(investorProfiles)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            investorUid: { type: Type.STRING },
            matchScore: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
}
