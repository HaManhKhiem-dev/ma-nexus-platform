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
