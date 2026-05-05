# Audit Report: Seller Cannot See NDA Requests

## Issue Summary
Sellers are not seeing NDA requests that buyers have submitted, causing missing visibility into pending NDAs that need approval.

## Root Causes Identified

### 1. **Missing sellerUid Validation in NDA Creation**
**Location**: [src/pages/DealDetail.tsx](src/pages/DealDetail.tsx#L99-L103)

When a buyer requests an NDA, the code attempts to create an NDA document without validating that `deal.sellerUid` exists:

```typescript
await setDoc(doc(db, 'ndas', `${user.uid}_${id}`), {
  dealId: id,
  buyerUid: user.uid,
  ...
  sellerUid: deal.sellerUid,  // ❌ No validation - could be undefined
  status: 'requested',
  ...
});
```

**Problem**: If `deal.sellerUid` is undefined or missing:
- The Firestore validation rule `isValidNda()` requires `sellerUid is string`
- NDA creation silently fails
- Firestore doesn't throw error to user
- Seller never sees the NDA request

### 2. **Sample Deals Have Hardcoded sellerUid**
**Location**: [src/lib/mockData.ts](src/lib/mockData.ts)

All sample deals have:
```javascript
sellerUid: 'sample-seller'
```

**Problem**: When buyers request NDAs on sample deals:
- NDA is created with sellerUid = 'sample-seller'
- Real sellers (with different UIDs) can't see these NDAs
- Creates confusion and missing NDA records

### 3. **No Error Feedback to User**
**Location**: [src/pages/DealDetail.tsx](src/pages/DealDetail.tsx#L116-L120)

The try-catch block catches errors but doesn't properly validate prerequisites:

```typescript
try {
  // NDA creation happens here
} catch (err) {
  console.error('Failed to sign NDA:', err);
  alert('Failed to sign NDA. Please try again.');  // ❌ Generic error message
}
```

**Problem**: Users don't know if failure is due to:
- Missing seller information
- Network error
- Firestore validation failure

## Impact
- Sellers miss critical NDA requests and can't approve/reject them
- Buyers don't get feedback if their NDA request fails
- Data integrity issues with incomplete NDA records

## Solution
Implement comprehensive validation and error handling:

1. **Validate sellerUid before NDA creation**
2. **Provide clear error feedback to users**
3. **Log validation failures for audit purposes**
4. **Handle sample deals appropriately**

## Files to Fix
- [src/pages/DealDetail.tsx](src/pages/DealDetail.tsx) - NDA creation function
- [src/lib/compliance.ts](src/lib/compliance.ts) - Add validation helpers
- [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) - Handle edge cases in NDA display

## Severity
**HIGH** - Core functionality (NDA management) is partially broken, affecting deal workflow
