# ProtectedPageWrapper - Usage Guide

## Overview
`ProtectedPageWrapper` is a component that prevents unverified users from accessing page content. It checks verification status and either:
1. Shows a loading state while checking verification
2. Redirects to verification page if not verified
3. Renders page content if verified

## Features
✅ Smooth verification checks (no content flash)
✅ Loading state during redirect
✅ Email verification enforcement
✅ Phone verification enforcement
✅ Automatic redirect with `next` parameter for return-to-page functionality
✅ Supports all protected routes

## Usage

### Basic Implementation
Wrap your page content with `ProtectedPageWrapper`:

```tsx
'use client';

import { ProtectedPageWrapper } from '@/components/ProtectedPageWrapper';

export default function YourPage() {
  return (
    <ProtectedPageWrapper requireEmail requirePhone>
      <div className="space-y-8">
        {/* Your page content here */}
      </div>
    </ProtectedPageWrapper>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | React.ReactNode | required | Content to render if verified |
| `requireEmail` | boolean | true | Enforce email verification |
| `requirePhone` | boolean | true | Enforce phone verification |

### Examples

#### Require Both Email and Phone (Recommended)
```tsx
<ProtectedPageWrapper requireEmail requirePhone>
  <Dashboard />
</ProtectedPageWrapper>
```

#### Only Require Phone
```tsx
<ProtectedPageWrapper requireEmail={false} requirePhone={true}>
  <AgentDashboard />
</ProtectedPageWrapper>
```

#### Only Require Email
```tsx
<ProtectedPageWrapper requireEmail={true} requirePhone={false}>
  <SomeFeature />
</ProtectedPageWrapper>
```

## Behavior

### When User is Verified
✅ Shows loading spinner briefly
✅ Renders page content

### When User is Not Email Verified
🔄 Shows loading spinner
🔄 Redirects to `/auth/verify-email?email={email}&next={currentPage}`
- User verifies email
- Auto-redirects back to current page

### When User is Not Phone Verified
🔄 Shows loading spinner
🔄 Redirects to `/auth/verify-phone?phone={number}&next={currentPage}`
- User verifies phone
- Auto-redirects back to current page

## Loading State UI
While verification is being checked, users see:
- Centered loading spinner (animated)
- "Verifying your account" message
- "Please wait..." subtext

## Pages Already Protected
- ✅ `/dashboard` - Full access (email + phone)
- ✅ `/admin` - Full access (email + phone)  
- ✅ `/agent` - Full access (email + phone)

## Pages That Need Protection
Add ProtectedPageWrapper to any new protected route:
- `/dashboard/*` - Sub-routes (airtime, data, bills, etc.)
- `/admin/*` - Sub-routes (users, transactions, reports, etc.)
- `/agent/*` - Sub-routes (customers, commissions, performance, etc.)

## Best Practices

### ✅ DO
- Use at the page level (top component)
- Wrap entire page content
- Use both email and phone requirements
- Include in all customer/agent/admin pages

### ❌ DON'T
- Use multiple wrappers on same page
- Nest ProtectedPageWrapper components
- Mix with other verification guards
- Use on public/auth pages

## Example: Full Page Implementation

```tsx
'use client';

import { ProtectedPageWrapper } from '@/components/ProtectedPageWrapper';
import { Card } from '@/components/shared/Card';

export default function AnalyticsPage() {
  return (
    <ProtectedPageWrapper requireEmail requirePhone>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-2">Your performance data</p>
        </div>

        {/* Content */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Monthly Stats</h2>
          <p className="text-gray-600">Your analytics content here...</p>
        </Card>
      </div>
    </ProtectedPageWrapper>
  );
}
```

## How It Works Under the Hood

1. **Client Check**: Waits for hydration (`isClient`)
2. **Auth Check**: Waits for auth store to load
3. **Verification Check**: 
   - If not authenticated → No redirect (should be caught by other guards)
   - If email required and not verified → Redirect
   - If phone required and not verified → Redirect
   - If verified → Render children
4. **Redirect Handling**: Uses `router.replace()` to prevent back-button bypass

## Troubleshooting

### Loading spinner shows forever
- Check if auth store is initialized
- Verify token is valid in storage
- Check browser console for errors

### Redirects in a loop
- Ensure you're not using ProtectedPageWrapper on verification pages
- Check that auth store is updating correctly

### Page content briefly shows then disappears
- This is normal during redirect
- Use the loading spinner state styling for consistency

## Related Components
- `PhoneVerificationEnforcer` - Global phone verification guard
- `EmailVerificationEnforcer` - Global email verification guard
- `AuthProtectedRoute` - Route-level protection
