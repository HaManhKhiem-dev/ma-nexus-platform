export const DEAL_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'published',
  'in_negotiation',
  'closed',
] as const;

export type DealStatus = typeof DEAL_STATUSES[number];

export function isKycVerified(profile: any) {
  return profile?.kycStatus === 'verified';
}

export function hasRole(profile: any, roles: string[]) {
  return Boolean(profile?.role && roles.includes(profile.role));
}

export function canCreateDeal(profile: any) {
  // Only sellers and admins with verified KYC can create deals
  if (hasRole(profile, ['admin'])) return true;
  return isKycVerified(profile) && hasRole(profile, ['seller']);
}

export function canViewPrivateDeal(profile: any, ndaStatus?: string | null, isSellerOwner = false, dealStatus = 'published') {
  if (hasRole(profile, ['admin'])) return true;
  if (hasRole(profile, ['seller']) && isSellerOwner) return true;
  
  if (hasRole(profile, ['buyer', 'advisor'])) {
    if (!isKycVerified(profile)) return false;
    if (ndaStatus !== 'signed') return false;
    if (dealStatus !== 'published' && dealStatus !== 'in_negotiation') return false;
    return true;
  }
  return false;
}

export function canRequestNda(profile: any, dealStatus = 'published') {
  if (hasRole(profile, ['admin'])) return true;
  if (dealStatus !== 'published') return false;
  return isKycVerified(profile) && hasRole(profile, ['buyer', 'advisor']);
}

export function canAccessDataRoom(profile: any, ndaStatus?: string | null, isSellerOwner = false, dealStatus = 'published') {
  // Data room access has the same rules as private deal view
  return canViewPrivateDeal(profile, ndaStatus, isSellerOwner, dealStatus);
}

export function canNegotiate(profile: any, ndaStatus?: string | null, isSellerOwner = false, dealStatus = 'published') {
  if (hasRole(profile, ['admin'])) return false; // Admins read-only
  if (hasRole(profile, ['seller']) && isSellerOwner) return true;
  
  if (hasRole(profile, ['buyer'])) {
    if (!isKycVerified(profile)) return false;
    if (ndaStatus !== 'signed') return false;
    if (dealStatus !== 'published' && dealStatus !== 'in_negotiation') return false;
    return true;
  }
  return false;
}

export function canAdminModerate(profile: any) {
  return hasRole(profile, ['admin']);
}

export function normalizeDealStatus(status?: string) {
  const normalized = String(status || 'draft').toLowerCase().replace(/\s+/g, '_');
  return DEAL_STATUSES.includes(normalized as DealStatus) ? normalized as DealStatus : 'draft';
}

export function statusLabel(status?: string) {
  return normalizeDealStatus(status)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Validate that a deal has all required information for NDA creation
 * This prevents silent failures when creating NDAs with incomplete deal data
 */
export function isValidDealForNda(deal: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!deal) {
    errors.push('Deal object is missing');
    return { valid: false, errors };
  }

  if (!deal.id || typeof deal.id !== 'string') {
    errors.push('Deal ID is missing or invalid');
  }

  if (!deal.sellerUid || typeof deal.sellerUid !== 'string' || deal.sellerUid.trim().length === 0) {
    errors.push('Deal seller information is missing');
  }

  if (!deal.title || typeof deal.title !== 'string' || deal.title.trim().length === 0) {
    errors.push('Deal title is missing');
  }

  if (deal.status && !DEAL_STATUSES.includes(deal.status as DealStatus)) {
    errors.push(`Deal status "${deal.status}" is invalid`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if user can request an NDA for a specific deal
 * Validates both user permission and deal validity
 */
export function canRequestNdaForDeal(profile: any, deal: any, dealStatus = 'published'): { canRequest: boolean; reason?: string } {
  // First check user permissions
  if (!canRequestNda(profile, dealStatus)) {
    return { canRequest: false, reason: 'KYC verified buyer/advisor account is required' };
  }

  // Then check deal validity
  const dealValidation = isValidDealForNda(deal);
  if (!dealValidation.valid) {
    return { canRequest: false, reason: dealValidation.errors[0] || 'Deal information is incomplete' };
  }

  return { canRequest: true };
}
