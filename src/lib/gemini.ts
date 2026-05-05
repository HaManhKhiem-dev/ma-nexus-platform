import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "undefined") {
    console.warn("GEMINI_API_KEY is missing. AI features will be disabled. Create a .env file locally with your key.");
    return null;
  }
  
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function getDealSummary(dealData: any) {
  try {
    const ai = getGenAI();
    if (!ai) return "AI Summary unavailable: Missing API Key";
    
    const prompt = `Summarize this M&A deal for a quick investor snapshot: ${JSON.stringify(dealData)}`;
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return result.text || "Summary unavailable at this time.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Summary unavailable at this time.";
  }
}

export async function matchDealToInvestors(dealData: any, investorProfiles: any[]) {
  try {
    const ai = getGenAI();
    if (!ai) return [];
    
    const prompt = `Match this deal to the best 3 investors: \nDeal: ${JSON.stringify(dealData)}\nInvestors: ${JSON.stringify(investorProfiles)}. 
    Return as JSON array of objects with investorUid, matchScore, and reasoning.`;
    
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(result.text || "[]");
  } catch (error) {
    console.error("Gemini AI Match Error:", error);
    return [];
  }
}
