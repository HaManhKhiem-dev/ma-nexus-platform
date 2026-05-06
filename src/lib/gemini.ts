import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

function cleanAiText(value: any) {
  return String(value || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/\*\*/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .trim();
}

function safeParseJsonObject(value: string) {
  const cleaned = cleanAiText(value);

  try {
    return JSON.parse(cleaned || '{}');
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return {};

    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}

export function getGenAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn('VITE_GEMINI_API_KEY is missing. AI features will be disabled.');
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }

  return genAI;
}

export async function getDealSummary(dealData: any, language: 'en' | 'vi' = 'en') {
  try {
    const ai = getGenAI();

    if (!ai) {
      return null;
    }

    const outputLanguage = language === 'vi' ? 'Vietnamese' : 'English';

    const prompt = `
You are an M&A analyst.

Write a concise strategic summary for this private market deal.

Rules:
- Write in ${outputLanguage}.
- Use plain text only.
- Do not use markdown.
- Do not use bold markers like **.
- Do not use headings with markdown symbols.
- Do not make an investment decision.
- Focus on business snapshot, financial highlights, strategic rationale, and key review points.
- Keep it concise and professional.

Deal data:
${JSON.stringify(dealData)}
`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return cleanAiText(result.text || '');
  } catch (error) {
    console.error('Gemini summary error:', error);
    return null;
  }
}

export async function matchDealToInvestors(dealData: any, investorProfiles: any[]) {
  try {
    const ai = getGenAI();
    if (!ai) return [];

    const prompt = `Match this deal to the best 3 investors:
Deal: ${JSON.stringify(dealData)}
Investors: ${JSON.stringify(investorProfiles)}.
Return as JSON array of objects with investorUid, matchScore, and reasoning.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(result.text || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gemini AI Match Error:', error);
    return [];
  }
}

export async function explainDealForInvestor(
  dealData: any,
  investorPreference: any,
  investorAnalysis: any,
  language: 'en' | 'vi' = 'en'
) {
  try {
    const ai = getGenAI();

    if (!ai) {
      return {
        summary:
          language === 'vi'
            ? 'Không thể tạo nhận xét AI vì thiếu Gemini API key.'
            : 'AI commentary unavailable because the Gemini API key is missing.',
        highlights: [],
        risks: [],
        dueDiligenceQuestions: [],
        nextAction:
          language === 'vi'
            ? 'Hãy xem hồ sơ thương vụ và yêu cầu quyền truy cập Data Room trước khi ra quyết định đầu tư.'
            : 'Review the deal profile and request data room access before making any investment decision.',
      };
    }

    const outputLanguage = language === 'vi' ? 'Vietnamese' : 'English';

    const prompt = `
You are an M&A investment assistant.

Write a concise investor memo for this private market deal.

Rules:
- Write in ${outputLanguage}.
- Do not make an investment decision for the user.
- Do not say "you should invest".
- Focus on fit, risks, and due diligence.
- Use professional but clear language.
- Use plain text only inside all JSON string values.
- Do not use markdown.
- Do not use bold markers like **.
- Do not use bullet symbols.
- Base your reasoning only on the provided data.
- Return valid JSON only.

Return this JSON shape:
{
  "summary": "short paragraph explaining the fit",
  "highlights": ["max 3 investment highlights"],
  "risks": ["max 3 key risks"],
  "dueDiligenceQuestions": ["max 4 diligence questions"],
  "nextAction": "one suggested next step"
}

Deal data:
${JSON.stringify(dealData)}

Investor preference:
${JSON.stringify(investorPreference)}

Rule-based analysis:
${JSON.stringify(investorAnalysis)}
`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = safeParseJsonObject(result.text || '{}');

    return {
      summary: cleanAiText(parsed.summary),
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.map(cleanAiText).filter(Boolean)
        : [],
      risks: Array.isArray(parsed.risks)
        ? parsed.risks.map(cleanAiText).filter(Boolean)
        : [],
      dueDiligenceQuestions: Array.isArray(parsed.dueDiligenceQuestions)
        ? parsed.dueDiligenceQuestions.map(cleanAiText).filter(Boolean)
        : [],
      nextAction: cleanAiText(parsed.nextAction),
    };
  } catch (error: any) {
  console.error('Gemini investor memo error:', error);

  const isQuotaError =
    error?.status === 429 ||
    String(error?.message || '').includes('429') ||
    String(error?.message || '').includes('RESOURCE_EXHAUSTED') ||
    String(error?.message || '').includes('Quota exceeded');

  if (isQuotaError) {
    return {
      summary:
        language === 'vi'
          ? 'Đã vượt giới hạn sử dụng Gemini hiện tại. Vui lòng thử lại sau hoặc nâng hạn mức API trong Google AI Studio.'
          : 'The current Gemini quota has been exceeded. Please try again later or upgrade the API quota in Google AI Studio.',
      highlights: [],
      risks: [],
      dueDiligenceQuestions: [],
      nextAction:
        language === 'vi'
          ? 'Tiếp tục dùng phần chấm điểm theo quy tắc và thử tạo lại nhận xét AI sau khi quota được reset.'
          : 'Use the rule-based score for now and retry AI commentary after the quota resets.',
    };
  }

  return {
    summary:
      language === 'vi'
        ? 'Nhận xét AI tạm thời không khả dụng. Hãy dựa vào điểm phù hợp, lý do khớp và các chỉ báo rủi ro phía trên.'
        : 'AI commentary is temporarily unavailable. Please rely on the rule-based fit score, matching reasons, and risk indicators.',
    highlights: [],
    risks: [],
    dueDiligenceQuestions: [],
    nextAction:
      language === 'vi'
        ? 'Rà soát tài chính, tài liệu pháp lý, mức độ tập trung khách hàng và giả định định giá trước khi tiếp tục.'
        : 'Review financials, legal documents, customer concentration, and valuation assumptions before proceeding.',
  };
}
}