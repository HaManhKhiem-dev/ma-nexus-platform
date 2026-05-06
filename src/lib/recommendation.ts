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

function normalizeText(value?: string) {
  return String(value || '').trim().toLowerCase();
}

function includesText(list: string[] | undefined, value?: string) {
  if (!list || list.length === 0) return false;

  const normalizedValue = normalizeText(value);
  return list.some((item) => normalizeText(item) === normalizedValue);
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
  investorPreference?: InvestorPreference
): InvestorDealScore {
  if (!deal) {
    return {
      score: 0,
      reasons: [],
      risks: ['Deal data is missing.'],
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
    reasons.push(`Matches preferred industry: ${deal.industry}`);
  } else if (deal.industry) {
    risks.push(`Industry is outside preferred focus: ${deal.industry}`);
  }

  if (includesText(pref.preferredGeographies, deal.location)) {
    score += 15;
    reasons.push(`Matches preferred geography: ${deal.location}`);
  } else if (deal.location) {
    risks.push(`Geography may require further review: ${deal.location}`);
  }

  if (
    valuation > 0 &&
    (pref.minTicket == null || valuation >= pref.minTicket) &&
    (pref.maxTicket == null || valuation <= pref.maxTicket)
  ) {
    score += 20;
    reasons.push('Deal size is within the target investment range.');
  } else if (valuation > 0) {
    risks.push('Deal size is outside the preferred ticket range.');
  }

  if (includesText(pref.preferredDealTypes, deal.type)) {
    score += 10;
    reasons.push(`Matches preferred deal type: ${deal.type}`);
  } else if (deal.type) {
    risks.push(`Deal type may not match preference: ${deal.type}`);
  }

  const controlPoint = getControlFitPoint(pref.controlPreference, deal.type);
  if (controlPoint > 0) {
    score += controlPoint;
    reasons.push(`Control structure fits preference: ${pref.controlPreference}`);
  }

  if ((pref.minGrowthRate ?? 0) <= growthRate) {
    score += 10;
    reasons.push(`Growth rate meets target: ${growthRate}%`);
  } else {
    risks.push('Growth rate is below the preferred threshold.');
  }

  if (pref.preferredEbitdaPositive && ebitda > 0) {
    score += 10;
    reasons.push('EBITDA is positive.');
  } else if (pref.preferredEbitdaPositive) {
    risks.push('EBITDA is not clearly positive.');
  }

  const riskPoint = getRiskPoint(pref.riskTolerance, riskScore);
  score += riskPoint;

  if (riskPoint >= 10) {
    reasons.push('Risk level is within investor tolerance.');
  } else {
    risks.push('Risk level may require deeper due diligence.');
  }

  return {
    score: Math.min(Math.round(score), 100),
    reasons,
    risks,
  };
}
