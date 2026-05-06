export type RiskTolerance = 'low' | 'medium' | 'high';

export type ControlPreference = 'minority' | 'majority' | 'full';

export type InvestorPreference = {
  preferredIndustries?: string[];
  preferredGeographies?: string[];
  minTicket?: number;
  maxTicket?: number;
  preferredDealTypes?: string[];
  riskTolerance?: RiskTolerance;
  controlPreference?: ControlPreference;
  minGrowthRate?: number;
  preferredEbitdaPositive?: boolean;
};

export type InvestorDealScore = {
  score: number;
  reasons: string[];
  risks: string[];
};

export type RecommendationLanguage = 'en' | 'vi';

function normalizeText(value?: string) {
  return String(value || '').trim().toLowerCase();
}

function includesText(list: string[] | undefined, value?: string) {
  if (!list || list.length === 0) return false;

  const normalizedValue = normalizeText(value);

  return list.some((item) => {
    const normalizedItem = normalizeText(item);

    return (
      normalizedItem === normalizedValue ||
      normalizedValue.includes(normalizedItem) ||
      normalizedItem.includes(normalizedValue)
    );
  });
}

function localizeDealType(type?: string, language: RecommendationLanguage = 'en') {
  const value = normalizeText(type);

  const viMap: Record<string, string> = {
    fundraising: 'gọi vốn',
    sell_equity: 'bán cổ phần',
    sell_100: 'bán 100%',
  };

  const enMap: Record<string, string> = {
    fundraising: 'fundraising',
    sell_equity: 'equity sale',
    sell_100: '100% sale',
  };

  return language === 'vi'
    ? viMap[value] || type || ''
    : enMap[value] || type || '';
}

function localizeControlPreference(
  control?: ControlPreference,
  language: RecommendationLanguage = 'en'
) {
  if (language === 'vi') {
    if (control === 'minority') return 'thiểu số';
    if (control === 'majority') return 'đa số';
    if (control === 'full') return 'toàn quyền';
    return 'chưa xác định';
  }

  if (control === 'minority') return 'minority';
  if (control === 'majority') return 'majority';
  if (control === 'full') return 'full control';

  return 'not specified';
}

function analysisText(language: RecommendationLanguage) {
  return {
    missingDeal:
      language === 'vi'
        ? 'Thiếu dữ liệu thương vụ.'
        : 'Deal data is missing.',

    matchedIndustry: (industry: string) =>
      language === 'vi'
        ? `Phù hợp ngành ưu tiên: ${industry}`
        : `Matches preferred industry: ${industry}`,

    outsideIndustry: (industry: string) =>
      language === 'vi'
        ? `Ngành nằm ngoài trọng tâm ưu tiên: ${industry}`
        : `Industry is outside preferred focus: ${industry}`,

    matchedGeography: (location: string) =>
      language === 'vi'
        ? `Phù hợp khu vực ưu tiên: ${location}`
        : `Matches preferred geography: ${location}`,

    reviewGeography: (location: string) =>
      language === 'vi'
        ? `Khu vực cần được rà soát thêm: ${location}`
        : `Geography may require further review: ${location}`,

    ticketFit:
      language === 'vi'
        ? 'Quy mô thương vụ nằm trong vùng vốn mục tiêu.'
        : 'Deal size is within the target investment range.',

    ticketMismatch:
      language === 'vi'
        ? 'Quy mô thương vụ nằm ngoài vùng vốn ưu tiên.'
        : 'Deal size is outside the preferred ticket range.',

    matchedDealType: (type: string) =>
      language === 'vi'
        ? `Phù hợp loại thương vụ: ${localizeDealType(type, language)}`
        : `Matches preferred deal type: ${localizeDealType(type, language)}`,

    dealTypeMismatch: (type: string) =>
      language === 'vi'
        ? `Loại thương vụ có thể chưa phù hợp: ${localizeDealType(type, language)}`
        : `Deal type may not match preference: ${localizeDealType(type, language)}`,

    controlFit: (control?: ControlPreference) =>
      language === 'vi'
        ? `Cấu trúc kiểm soát phù hợp với khẩu vị: ${localizeControlPreference(control, language)}`
        : `Control structure fits preference: ${localizeControlPreference(control, language)}`,

    growthFit: (growthRate: number) =>
      language === 'vi'
        ? `Tăng trưởng đạt ngưỡng mục tiêu: ${growthRate}%`
        : `Growth rate meets target: ${growthRate}%`,

    growthMismatch:
      language === 'vi'
        ? 'Tốc độ tăng trưởng thấp hơn ngưỡng ưu tiên.'
        : 'Growth rate is below the preferred threshold.',

    ebitdaPositive:
      language === 'vi'
        ? 'EBITDA đang dương.'
        : 'EBITDA is positive.',

    ebitdaNotPositive:
      language === 'vi'
        ? 'EBITDA chưa thể hiện rõ là dương.'
        : 'EBITDA is not clearly positive.',

    riskFit:
      language === 'vi'
        ? 'Mức rủi ro nằm trong ngưỡng chấp nhận của nhà đầu tư.'
        : 'Risk level is within investor tolerance.',

    riskReview:
      language === 'vi'
        ? 'Mức rủi ro cần được thẩm định sâu hơn.'
        : 'Risk level may require deeper due diligence.',
  };
}

function getRiskPoint(riskTolerance?: RiskTolerance, riskScore?: number) {
  const score = Number(riskScore ?? 50);

  if (riskTolerance === 'low') {
    return score <= 30 ? 10 : 0;
  }

  if (riskTolerance === 'medium') {
    return score <= 50 ? 10 : 3;
  }

  if (riskTolerance === 'high') {
    return score <= 70 ? 10 : 5;
  }

  return 5;
}

function getControlFitPoint(controlPreference?: ControlPreference, dealType?: string) {
  const type = normalizeText(dealType);

  if (!controlPreference) return 0;

  if (controlPreference === 'minority') {
    return type === 'fundraising' || type === 'sell_equity' ? 10 : 0;
  }

  if (controlPreference === 'majority') {
    return type === 'sell_equity' || type === 'sell_100' ? 10 : 0;
  }

  if (controlPreference === 'full') {
    return type === 'sell_100' ? 10 : 0;
  }

  return 0;
}

export function scoreDealForInvestor(
  deal: any,
  investorPreference?: InvestorPreference,
  language: RecommendationLanguage = 'en'
): InvestorDealScore {
  const text = analysisText(language);

  if (!deal) {
    return {
      score: 0,
      reasons: [],
      risks: [text.missingDeal],
    };
  }

  const pref = investorPreference || {};

  let score = 0;
  const reasons: string[] = [];
  const risks: string[] = [];

  const valuation = Number(deal.valuation || 0);
  const ebitda = Number(deal.ebitda || 0);
  const growthRate = Number(deal.growthRate || 0);
  const riskScore = Number(deal.riskScore ?? 50);

  if (includesText(pref.preferredIndustries, deal.industry)) {
    score += 25;
    reasons.push(text.matchedIndustry(deal.industry));
  } else if (deal.industry) {
    risks.push(text.outsideIndustry(deal.industry));
  }

  if (includesText(pref.preferredGeographies, deal.location)) {
    score += 15;
    reasons.push(text.matchedGeography(deal.location));
  } else if (deal.location) {
    risks.push(text.reviewGeography(deal.location));
  }

  if (
    valuation > 0 &&
    (pref.minTicket == null || valuation >= pref.minTicket) &&
    (pref.maxTicket == null || valuation <= pref.maxTicket)
  ) {
    score += 20;
    reasons.push(text.ticketFit);
  } else if (valuation > 0) {
    risks.push(text.ticketMismatch);
  }

  if (includesText(pref.preferredDealTypes, deal.type)) {
    score += 10;
    reasons.push(text.matchedDealType(deal.type));
  } else if (deal.type) {
    risks.push(text.dealTypeMismatch(deal.type));
  }

  const controlPoint = getControlFitPoint(pref.controlPreference, deal.type);

  if (controlPoint > 0 && pref.controlPreference) {
    score += controlPoint;
    reasons.push(text.controlFit(pref.controlPreference));
  }

  if ((pref.minGrowthRate ?? 0) <= growthRate) {
    score += 10;
    reasons.push(text.growthFit(growthRate));
  } else {
    risks.push(text.growthMismatch);
  }

  if (pref.preferredEbitdaPositive && ebitda > 0) {
    score += 10;
    reasons.push(text.ebitdaPositive);
  } else if (pref.preferredEbitdaPositive) {
    risks.push(text.ebitdaNotPositive);
  }

  const riskPoint = getRiskPoint(pref.riskTolerance, riskScore);
  score += riskPoint;

  if (riskPoint >= 10) {
    reasons.push(text.riskFit);
  } else {
    risks.push(text.riskReview);
  }

  return {
    score: Math.min(Math.round(score), 100),
    reasons,
    risks,
  };
}

export function getInvestorFitLabel(score: number, language: RecommendationLanguage = 'en') {
  if (language === 'vi') {
    if (score >= 85) return 'Rất phù hợp';
    if (score >= 70) return 'Phù hợp cao';
    if (score >= 55) return 'Phù hợp trung bình';
    return 'Phù hợp thấp';
  }

  if (score >= 85) return 'Strong Fit';
  if (score >= 70) return 'Good Fit';
  if (score >= 55) return 'Moderate Fit';

  return 'Low Fit';
}