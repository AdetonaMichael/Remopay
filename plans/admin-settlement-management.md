# Admin Settlement Management — Implementation Plan

## Overview

Implement a full settlement management dashboard for administrators to configure, monitor, and manually trigger the automated settlement system. This is a **new, independent feature** separate from the existing ledger settlement batches (`/admin/ledger/settlement`).

**Backend Base URL:** `/api/v1/admin/settlement`  
**Frontend Route Prefix:** `/admin/settlements`

---

## Architecture

```mermaid
graph TD
    A[app/admin/settlements/] --> B[Dashboard page.tsx]
    A --> C[Config config/page.tsx]
    A --> D[Batches batches/page.tsx]
    A --> E[Batch Detail batches/[id]/page.tsx]
    A --> F[Transactions transactions/page.tsx]

    B --> G[SettlementDashboard Component]
    C --> H[ConfigForm Component]
    D --> I[BatchTable Component]
    E --> J[BatchDetailCard + BatchItemTable]
    F --> K[TransactionTable Component]

    G --> L[StatCard x4]
    G --> M[ConfigStatusCard]
    G --> N[ActionButton x3]

    H --> O[SettlementStatusBadge]

    subgraph "Data Layer"
        P[settlement.types.ts]
        Q[settlement.service.ts]
        R[useSettlement.ts hook]
    end

    G --> R
    H --> R
    I --> R
    J --> R
    K --> R
    R --> Q
    Q --> P
```

---

## File Structure & Detailed Steps

### Step 1: TypeScript Types → [`src/types/settlement.types.ts`](src/types)

All interfaces based on backend API responses, using camelCase conversion where appropriate but respecting backend snake_case for API contracts.

**Key Types:**

| Type | Description |
|------|-------------|
| `SettlementConfig` | Full configuration object (schedule, accounts, emails, retry, notifications) |
| `ConfigAccount` | Commission/VTU account info (bank, account number masked) |
| `UpdateConfigRequest` | PUT request body for updating config |
| `ConfigValidationResult` | Validation response (valid + errors array) |
| `ConfigTestResult` | Account connectivity test response |
| `SettlementDashboardData` | Dashboard overview (config status, latest batch, aggregates) |
| `SettlementBatch` | Batch record (reference, dates, financial fields, status) |
| `SettlementBatchDetail` | Batch detail with items, transactions, payouts, creator |
| `BatchSummary` | Financial summary for a batch |
| `BatchItem` | Individual item in a batch (VTU/funding/reversal) |
| `SettlementTransaction` | Settlement transaction record |
| `GenerateBatchRequest` | POST body for batch generation |
| `ApproveBatchRequest` | POST body for batch approval |
| `SettleBatchRequest` | POST body for batch settlement execution |
| `ExecuteSettlementRequest` | POST body for manual settlement trigger |
| `SettlementExecuteResult` | Manual execution response |
| `SettlementDashboardMonthlyTotals` | Monthly aggregation |

**Status & Type Enums:**

| Enum | Values |
|------|--------|
| `BatchStatus` | `pending`, `processing`, `settled`, `failed`, `partially_settled` |
| `SettlementType` | `commission`, `vtu_principal`, `provider_settlement` |
| `TransactionStatus` | `pending`, `processing`, `success`, `failed` |
| `BatchItemType` | `vtu`, `funding`, `reversal` |
| `SettlementConfigTab` | `schedule`, `commission`, `vtu`, `recipients`, `advanced` |

**Pagination Type:** Reuse `ApiResponse` and `PaginationMeta` from [`src/types/api.types.ts`](src/types/api.types.ts)

### Step 2: API Service → [`src/services/settlement.service.ts`](src/services)

Class `SettlementService` with methods for all 15 endpoints from the guide.

**Methods:**

| Method | API Endpoint | Description |
|--------|-------------|-------------|
| `getDashboard()` | GET `/admin/settlement/dashboard` | Dashboard overview |
| `getConfig()` | GET `/admin/settlement/config` | Get configuration |
| `updateConfig(data)` | PUT `/admin/settlement/config` | Update configuration |
| `validateConfig()` | POST `/admin/settlement/config/validate` | Validate config |
| `testConfig()` | POST `/admin/settlement/config/test` | Test account connectivity |
| `getBatches(params)` | GET `/admin/settlement/batches` | List batches (paginated) |
| `getBatch(id)` | GET `/admin/settlement/batches/{id}` | Batch detail |
| `generateBatch(data)` | POST `/admin/settlement/batches/generate` | Generate batch |
| `approveBatch(id, data)` | POST `/admin/settlement/batches/{id}/approve` | Approve batch |
| `settleBatch(id, data)` | POST `/admin/settlement/batches/{id}/settle` | Settle batch |
| `getBatchItems(batchId, params)` | GET `/admin/settlement/batches/{batchId}/items` | Batch items |
| `getTransactions(params)` | GET `/admin/settlement/transactions` | List transactions |
| `getTransaction(id)` | GET `/admin/settlement/transactions/{id}` | Transaction detail |
| `executeSettlement(data)` | POST `/admin/settlement/execute` | Manual trigger |
| `retryFailed()` | POST `/admin/settlement/retry-failed` | Retry failed |

Singleton export: `export const settlementService = new SettlementService();`

### Step 3: Export Types → [`src/types/index.ts`](src/types)

Add `export * from './settlement.types';`

### Step 4: React Hook → [`src/hooks/useSettlement.ts`](src/hooks)

Hook `useSettlement()` following the same pattern as [`useLedger.ts`](src/hooks/useLedger.ts):

- **State interface:** `UseSettlementState` with data fields, loading states, pagination, error states
- **Operations grouped:**
  - Dashboard: `fetchDashboard()`
  - Config: `fetchConfig()`, `updateConfig()`, `validateConfig()`, `testConfig()`
  - Batches: `fetchBatches()`, `fetchBatch()`, `generateBatch()`, `approveBatch()`, `settleBatch()`, `fetchBatchItems()`
  - Transactions: `fetchTransactions()`, `fetchTransaction()`
  - Actions: `executeSettlement()`, `retryFailed()`
- Uses `useUIStore.addToast` for success/error toasts
- Uses `apiClient` directly through `settlementService`

### Step 5: UI Components → [`src/components/admin/settlement/`](src/components/admin/settlement)

All components follow the existing admin design system (white bg, gray borders, `#d71927` primary color).

#### 5a. [`SettlementStatusBadge.tsx`](src/components/admin/settlement)

Reusable badge for settlement status values.

```tsx
type Props = { status: BatchStatus | TransactionStatus; size?: 'sm' | 'md' };
// Colors:
// settled/success -> green
// pending          -> yellow
// processing       -> blue
// failed           -> red
// partially_settled -> orange
```

Uses [`Badge`](src/components/shared/Badge.tsx) with mapped variants.

#### 5b. [`StatCard.tsx`](src/components/admin/settlement)

Dashboard stat card with icon, label, value.

```tsx
type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // bg+text color classes
  trend?: { value: number; isPositive: boolean };
};
```

Styled like admin dashboard KPI cards ([`app/admin/page.tsx`](app/admin/page.tsx:337-349)): rounded-2xl border, p-6, flex layout with icon container.

#### 5c. [`ActionButton.tsx`](src/components/admin/settlement)

Action button with optional confirmation modal.

```tsx
type Props = {
  label: string;
  icon?: LucideIcon;
  onClick: () => Promise<void>;
  variant?: 'primary' | 'danger' | 'outline';
  confirmMessage?: string; // Shows confirmation modal if provided
  isLoading?: boolean;
};
```

Uses [`Button`](src/components/shared/Button.tsx) + [`Modal`](src/components/shared/Modal.tsx) for confirmation.

#### 5d. [`ConfigStatusCard.tsx`](src/components/admin/settlement)

Shows configuration health status.

```tsx
type Props = {
  isValid: boolean;
  nextRunAt: string | null;
  lastRunAt: string | null;
  enabled: boolean;
  hasCommissionAccount: boolean;
  hasVtuAccount: boolean;
  recipientsCount: number;
};
```

Displays: green/red validity badge, next/last run timestamps, account status indicators, recipients count.

#### 5e. [`ConfigForm.tsx`](src/components/admin/settlement)

Tab-based configuration form with 5 tabs:

| Tab | Fields |
|-----|--------|
| **Schedule** | Cron expression input, enabled toggle, reporting period days (1-365) |
| **Commission Account** | Account name, number, bank code, bank name, min transfer amount |
| **VTU Account** | Account name, number, bank code, bank name, min transfer amount |
| **Recipients** | Email list with add/remove buttons |
| **Advanced** | Retry max attempts (1-10), retry delay minutes, notification prefs (on_success, on_failure) |

```tsx
type Props = {
  config: SettlementConfig | null;
  onSubmit: (data: UpdateConfigRequest) => Promise<void>;
  onValidate: () => Promise<void>;
  onTest: () => Promise<void>;
  isLoading?: boolean;
};
```

Uses [`Input`](src/components/shared/Input.tsx), [`Button`](src/components/shared/Button.tsx), and Tailwind tab UI.

#### 5f. [`BatchTable.tsx`](src/components/admin/settlement)

Data table for settlement batches with:

- Columns: Reference, Settlement Date, Status, Items Count, VTU Purchases, Commission, Actions
- Status badges via [`SettlementStatusBadge`](#5a-settlementstatusbadgetsx)
- Filter bar: status dropdown, date range inputs
- Pagination via `AdminTable` component or custom pagination
- Row actions: View (link), Approve, Settle (with confirmation)

```tsx
type Props = {
  batches: SettlementBatch[];
  isLoading: boolean;
  pagination: PaginationMeta | null;
  filters: { status?: string; date_from?: string; date_to?: string; page: number; per_page: number };
  onFiltersChange: (filters: any) => void;
  onApprove: (id: number) => Promise<void>;
  onSettle: (id: number) => Promise<void>;
};
```

#### 5g. [`BatchDetailCard.tsx`](src/components/admin/settlement)

Summary card for batch detail page showing financial breakdown.

```tsx
type Props = {
  batch: SettlementBatch;
  summary: BatchSummary;
  itemsCount: number;
  itemsByType?: { funding: number; vtu: number; reversals: number };
};
```

Displays: batch reference, status, financial summary grid (opening/closing balance, VTU purchases, commission, provider payable, net clearing balance).

#### 5h. [`BatchItemTable.tsx`](src/components/admin/settlement)

Table for batch items with type filter.

```tsx
type Props = {
  items: BatchItem[];
  isLoading: boolean;
  pagination: PaginationMeta | null;
  typeFilter?: string;
  onTypeFilterChange: (type: string) => void;
  totals?: { amount: number; commission: number; fees: number };
};
```

Columns: Transaction Reference, Type, Amount, Commission, Provider Payable, User, Status.

#### 5i. [`TransactionTable.tsx`](src/components/admin/settlement)

Table for settlement transactions.

```tsx
type Props = {
  transactions: SettlementTransaction[];
  isLoading: boolean;
  pagination: PaginationMeta | null;
  filters: { status?: string; type?: string; batch_id?: number; page: number; per_page: number };
  onFiltersChange: (filters: any) => void;
};
```

Columns: Settlement Reference, Type (badge), Gross Amount, Net Amount, Status (badge), Batch Reference (linked), External Reference, Initiated At, Completed At.

### Step 6: Pages → [`app/admin/settlements/`](app/admin/settlements)

All pages follow the admin page pattern: `'use client'`, loading/error states, consistent layout.

#### 6a. [`app/admin/settlements/page.tsx`](app/admin/settlements)

**Settlement Dashboard** - Landing page.

Layout:
```
┌─ Header: "⚙️ Settlement Management" ─────────────────────┐
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Config   │ │ Batches  │ │ Monthly  │ │ Pending  │     │
│  │ Status   │ │ Total    │ │ Settled  │ │ Failed   │     │
│  │ ✅ Valid │ │ 5        │ │ ₦50,200  │ │ 1        │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                            │
│  ┌─ Latest Batch Card ──────────────────────────────────┐  │
│  │ BATCH-20260704-001  ● Settled   Jul 4, 2026         │  │
│  │ VTU: ₦12,500  │ Commission: ₦1,250 │ Items: 47     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─ Quick Actions ─────────────────────────────────────┐   │
│  │ [Generate Batch] [Execute Settlement] [Retry Failed] │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

- 4 StatCards at top (config status, total batches, monthly settled, pending failed)
- Latest batch details card
- 3 ActionButtons for quick actions
- Fetches data via `useSettlement().fetchDashboard()`

#### 6b. [`app/admin/settlements/config/page.tsx`](app/admin/settlements/config)

**Configuration Page** - Full config CRUD.

- Fetches config on mount via `useSettlement().fetchConfig()`
- Renders [`ConfigForm`](#5e-configformtsx)
- Validate and Test buttons in header
- Shows validation results in a success/error banner
- Shows test results per account

#### 6c. [`app/admin/settlements/batches/page.tsx`](app/admin/settlements/batches)

**Batches List** - Paginated table with filters.

- Fetches batches on mount and filter change
- Renders [`BatchTable`](#5f-batchtabletsx)
- "Generate Batch" button triggers modal with date + period_days inputs
- Uses `useSettlement().generateBatch()`

#### 6d. [`app/admin/settlements/batches/[id]/page.tsx`](app/admin/settlements/batches/[id])

**Batch Detail** - Multi-tab detail view.

Tabs:
1. **Overview** - Summary cards via [`BatchDetailCard`](#5g-batchdetailcardtsx)
2. **Items** - [`BatchItemTable`](#5h-batchitemtabletsx) with type filter
3. **Settlements** - Commission + VTU transfer statuses
4. **Payouts** - Provider payouts table

- Fetches batch detail, items separately
- Approve/Settle action buttons in header (conditionally shown based on status)

#### 6e. [`app/admin/settlements/transactions/page.tsx`](app/admin/settlements/transactions)

**Transactions List** - Paginated table with filters.

- Fetches transactions on mount and filter change
- Renders [`TransactionTable`](#5i-transactiontabletsx)
- Filters: status (select), type (select), batch (optional)

### Step 7: Update Sidebar Navigation → [`app/admin/layout.tsx`](app/admin/layout)

Add settlement nav items to the `adminNavItems` array:

```typescript
{ label: 'Settlements', href: '/admin/settlements', icon: CreditCard },
```

Optionally, replace the existing `{ label: 'Settlement Batches', href: '/admin/ledger/settlement', icon: CreditCard }` with a more specific ledger reference or keep both (they are distinct systems).

### Step 8: Export Components → [`src/components/admin/index.ts`](src/components/admin)

Add exports:
```typescript
export { SettlementDashboard } from './settlement/SettlementDashboard';
export { ConfigForm } from './settlement/ConfigForm';
export { BatchTable } from './settlement/BatchTable';
export { BatchDetailCard } from './settlement/BatchDetailCard';
export { TransactionTable } from './settlement/TransactionTable';
export { SettlementStatusBadge } from './settlement/SettlementStatusBadge';
```

---

## Design Guidelines

All components must follow the existing admin design system:

| Element | Style |
|---------|-------|
| Background | `#fafafa` (content area) |
| Cards | `bg-white`, `rounded-2xl`, `border border-[#e5e7eb]`, `shadow-sm` |
| Primary Color | `#d71927` |
| Typography | Gray scale: headings `#111827`, body `#6b7280` |
| Buttons | Primary: `bg-[#d71927]`, secondary: `bg-gray-200` |
| Inputs | `rounded-lg`, `border border-gray-300`, focus ring `#d71927` |
| Badges | Rounded-full with semantic colors (green/yellow/red/blue) |
| Tables | `border-b border-gray-200`, `hover:bg-gray-50` rows |
| Icons | `lucide-react` package |

## Error Handling

All components follow this pattern:
1. **Loading state**: Show skeleton or spinner while fetching
2. **Error state**: Show error card with retry button (via `<Card>` + `AlertCircle` icon)
3. **Empty state**: Show "No data" message
4. **Success**: Display data normally with toast notifications for mutations

API errors use the standard format:
```typescript
{ success: false, message: string, errors?: Record<string, string[]> }
```

Field-level validation errors are displayed inline next to form fields.

## Pagination

All list endpoints use the same pagination pattern:
```typescript
{ current_page: number, per_page: number, total: number, last_page: number }
```

The existing [`AdminTable`](src/components/admin/AdminTable.tsx) component or custom pagination UI with Previous/Next buttons showing "Page X of Y" will be used consistently.

---

## Files to Create (Summary)

| # | File | Purpose |
|---|------|---------|
| 1 | `src/types/settlement.types.ts` | All TypeScript interfaces |
| 2 | `src/services/settlement.service.ts` | API service class |
| 3 | `src/hooks/useSettlement.ts` | React hook |
| 4 | `src/components/admin/settlement/SettlementStatusBadge.tsx` | Status badge |
| 5 | `src/components/admin/settlement/StatCard.tsx` | Stat card |
| 6 | `src/components/admin/settlement/ActionButton.tsx` | Action button |
| 7 | `src/components/admin/settlement/ConfigStatusCard.tsx` | Config health card |
| 8 | `src/components/admin/settlement/ConfigForm.tsx` | Config form |
| 9 | `src/components/admin/settlement/BatchTable.tsx` | Batch table |
| 10 | `src/components/admin/settlement/BatchDetailCard.tsx` | Batch detail card |
| 11 | `src/components/admin/settlement/BatchItemTable.tsx` | Batch items table |
| 12 | `src/components/admin/settlement/TransactionTable.tsx` | Transaction table |
| 13 | `src/components/admin/settlement/SettlementDashboard.tsx` | Dashboard layout |
| 14 | `app/admin/settlements/page.tsx` | Dashboard page |
| 15 | `app/admin/settlements/config/page.tsx` | Config page |
| 16 | `app/admin/settlements/batches/page.tsx` | Batches list page |
| 17 | `app/admin/settlements/batches/[id]/page.tsx` | Batch detail page |
| 18 | `app/admin/settlements/transactions/page.tsx` | Transactions page |

## Files to Modify (Summary)

| # | File | Change |
|---|------|--------|
| 1 | `src/types/index.ts` | Add `export * from './settlement.types'` |
| 2 | `src/components/admin/index.ts` | Export new components |
| 3 | `app/admin/layout.tsx` | Add settlement nav items |
