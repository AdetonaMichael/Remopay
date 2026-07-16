# USD Wallet Summary Endpoint — Frontend Implementation Plan

## Overview

Align the frontend types, service, hook, and wallet page with the actual API response shape of `GET /api/v1/usd/wallet/summary`. The existing code has **incorrect assumptions** about the data format — it treats amounts as cents when the new endpoint returns dollars directly.

---

## Root Cause: Data Format Mismatch

| Field | Old Assumption (wrong) | Actual (correct) |
|-------|----------------------|-------------------|
| `data.balance` | `number` in cents (÷ 100 needed) | `number` in dollars directly (no division) |
| `txn.amount` | `number` in cents | `string` decimal already in dollars e.g. `"0.71"` |
| `txn.type` | `'refund'` | `'card_refund'` (different string) |
| `txn.metadata` | not mapped | nullable object with `rate`, `ngn_amount`, `quote_reference` |
| `txn.reference` | not mapped | string like `"3264dcde..._USD"` |

---

## Step 1 — Update Types (`src/types/usd-wallet.types.ts`)

### 1a. Fix `UsdTransactionType`
Add `card_refund` type — the API uses this instead of `refund`.

**Current:** `'credit' \| 'debit' \| 'conversion_in' \| 'conversion_out' \| 'card_funding' \| 'refund'`

**Change:** Replace `'refund'` → `'card_refund'`. Keep `'refund'` as a deprecated alias for backward compatibility in display helpers.

### 1b. Redesign `UsdTransaction` to match API shape

```typescript
export interface UsdTransaction {
  id: number;
  type: UsdTransactionType;
  amount: string;           // decimal string, e.g. "0.71" — must parseFloat()
  balance_before: string;   // decimal string
  balance_after: string;    // decimal string
  reference: string;        // unique reference
  description: string;
  metadata: UsdTransactionMetadata | null;  // nullable
  created_at: string;       // ISO 8601
}
```

### 1c. Fix `UsdWalletSummary`
```typescript
export interface UsdWalletSummary {
  balance: number;          // already in dollars, NO division by 100
  last_synced_at: string | null;
  recent_transactions: UsdTransaction[];
}
```

### 1d. Add new types
```typescript
export interface UsdTransactionMetadata {
  rate?: number;
  ngn_amount?: number;
  quote_reference?: string;
}

// Parsed frontend view model (after normalisation)
export interface ParsedUsdTransaction {
  id: number;
  type: UsdTransactionType;
  amount: number;           // parsed to float
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description: string;
  metadata: UsdTransactionMetadata | null;
  createdAt: Date;
  isCredit: boolean;        // derived: balanceAfter > balanceBefore
  amountFormatted: string;  // "$0.71"
  typeLabel: string;        // human-readable
}

export interface UsdWalletSummaryViewModel {
  balance: number;
  balanceFormatted: string;
  lastSyncedAt: Date | null;
  recentTransactions: ParsedUsdTransaction[];
}
```

### 1e. Update helpers
- `getTransactionLabel()`: add `card_refund` → `'Card Refund'`
- `getTransactionIcon()`: add `card_refund` → `'credit'`

### 1f. Update `UsdWalletState`
The `balance` field is already in dollars — no change needed semantically, just ensure the type matches.

---

## Step 2 — Update Service (`src/services/usd-wallet.service.ts`)

### Changes:
1. Map `reference` field from API response
2. Map `metadata` field from API response (pass through as-is)
3. Keep `amount`, `balance_before`, `balance_after` as strings (raw from API)
4. Keep `balance` as-is (already in dollars)

The service should remain a thin pass-through. Parsing should happen in the hook/view layer.

---

## Step 3 — Update Hook (`src/hooks/useUsdWallet.ts`)

### Critical Fixes:

**3a. Fix `formattedUsdBalance`**
```
Current:  `$${(state.balance / 100).toLocaleString(...)}`  // WRONG — divides dollars by 100
Correct:  `$${state.balance.toLocaleString(...)}`           // OK — balance is already dollars
```

**3b. Fix `usdBalanceInDollars`**
```
Current:  state.balance / 100   // WRONG
Correct:  state.balance          // OK — already in dollars
```

**3c. Add transform to `ParsedUsdTransaction[]` when setting state**

In the `fetchUsdWallet` callback, after receiving response data, transform each transaction:
- `amount` → `parseFloat(txn.amount)`
- `balanceBefore` → `parseFloat(txn.balance_before)`
- `balanceAfter` → `parseFloat(txn.balance_after)`
- `isCredit` → `balanceAfter > balanceBefore`
- `amountFormatted` → `$${parseFloat(txn.amount).toFixed(2)}`
- `typeLabel` → from `getTransactionLabel()`
- `createdAt` → `new Date(txn.created_at)`

**3d. Return `ParsedUsdTransaction[]` from hook instead of raw `UsdTransaction[]`**

---

## Step 4 — Fix Wallet Page (`app/dashboard/wallet/page.tsx`)

### 4a. Fix line 77 — Balance fetching fallback
```
Current:  ur.data.balance / 100   // WRONG — double-divides
Correct:  ur.data.balance          // OK — already in dollars
```

### 4b. Fix line 308 — USD balance passed to modal
```
Current:  usdBalance={usdWalletState.balance}            // passes dollars
Modal uses:  fmtUsd(usdBalance / 100)                    // divides by 100 again → WRONG
```
**Fix:** Change modal to use `fmtUsd(usdBalance)` directly since balance is now in dollars.

### 4c. Fix line 352 — USD balance in conversion modal
```
Current:  fmtUsd(usdBalance / 100)   // WRONG
Correct:  fmtUsd(usdBalance)         // OK
```

### 4d. Verify all other balance references
Audit the page for any remaining `balance / 100` patterns related to the USD wallet summary data.

---

## Step 5 — Integration Verification Points

### 5a. Service → Hook data flow
```
API Response
  ↓
UsdWalletService.getSummary()     ← maps fields, keeps raw types
  ↓
useUsdWallet.fetchUsdWallet()      ← transforms to view model, parses strings → numbers
  ↓
Components consume `formattedUsdBalance`, `recentTransactions[]`
```

### 5b. No double-parsing
Ensure `parseFloat()` is called exactly once per string field — in the hook transform step. Downstream components should use the already-parsed view model.

### 5c. Edge cases
- `metadata` is `null` → use optional chaining: `tx.metadata?.rate`
- `last_synced_at` is `null` → show "Not yet synced"
- `recent_transactions` is empty array → show empty state
- `balance` is `0` → display `$0.00`

---

## Summary of Files to Modify

| File | Changes |
|------|---------|
| [`src/types/usd-wallet.types.ts`](/src/types/usd-wallet.types.ts) | Fix `UsdTransactionType`, `UsdTransaction`, `UsdWalletSummary`; add `UsdTransactionMetadata`, `ParsedUsdTransaction`, `UsdWalletSummaryViewModel`; update helpers |
| [`src/services/usd-wallet.service.ts`](/src/services/usd-wallet.service.ts) | Map `reference` and `metadata` fields from API |
| [`src/hooks/useUsdWallet.ts`](/src/hooks/useUsdWallet.ts) | Fix balance division bug; add transaction parsing/transform; return view model |
| [`app/dashboard/wallet/page.tsx`](/app/dashboard/wallet/page.tsx) | Fix balance division bugs at lines 77, 308, 352 |

## Files NOT Modified (but affected)

No new files needed. The existing `useUsdWallet` hook already fetches and stores the data — we are just fixing the data interpretation.

---

## Data Flow Diagram — How the Fix Propagates

```mermaid
flowchart LR
    API["GET /api/v1/usd/wallet/summary<br/>returns balance in dollars,<br/>amount as decimal string"]

    subgraph Service ["UsdWalletService.getSummary()"]
        S_PASSTHROUGH["Passes balance as float (dollars)<br/>Passes amount as string ("0.71")<br/>Maps reference ✅<br/>Maps metadata ✅"]
    end

    subgraph Hook ["useUsdWallet hook"]
        H_FIX_BALANCE["balance: no longer ÷ 100<br/>formattedUsdBalance: direct formatting"]
        H_PARSE["Parses each txn:<br/>parseFloat amount<br/>Derive isCredit<br/>Format typeLabel<br/>Create Date objects"]
    end

    subgraph Page ["Wallet Page"]
        P_FIX_REF["Line 77: use balance directly<br/>Line 308: pass dollars to modal<br/>Line 352: fmtUsd dollars directly"]
    end

    UI["UI renders correctly:<br/>$0.71 balance<br/>Transaction amounts shown properly<br/>Credit/debit indicators correct"]

    API --> Service
    Service --> Hook
    H_FIX_BALANCE --> H_PARSE
    Hook --> Page
    Page --> UI
```

---

## Transaction Type Mapping Table

| API `type` value | Is Credit? | Display Label |
|-----------------|------------|---------------|
| `conversion_in` | ✅ Yes | Conversion In |
| `conversion_out` | ❌ No | Conversion Out |
| `credit` | ✅ Yes | Credit |
| `debit` | ❌ No | Debit |
| `card_funding` | ❌ No | Card Funding |
| `card_refund` | ✅ Yes | Card Refund |
