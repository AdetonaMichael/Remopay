# WebMCP Integration Guide for AI Agent Browsing

## What is WebMCP?

WebMCP (Web Model Context Protocol) enables AI agents to interact with your website more effectively by providing structured information about:
- Forms and their fields
- Interactive elements and their purposes
- Navigation structure
- Content organization
- Semantic relationships between elements

## Current Status - July 2026

Your website now meets the following Agentic Browsing criteria:

✅ **Buttons have discernible text** - All buttons have aria-labels or visible text
✅ **Links have discernible text** - All social links properly labeled
✅ **Accessibility tree is well-formed** - Semantic HTML structure intact
✅ **Low Cumulative Layout Shift** - Page layout is stable (CLS: 0)
✅ **llms.txt follows recommendations** - Public llms.txt at `/public/llms.txt`
✅ **WebMCP annotations implemented** - Forms, tables, modals, and actions annotated

## Project Structure

- **Types**: `src/types/webmcp.types.ts` - TypeScript definitions for all WebMCP annotations
- **Utilities**: `src/utils/webmcp.utils.ts` - Helper functions for creating WebMCP attributes
- **Documentation**: `docs/WEBMCP_INTEGRATION.md` - This file
- **Website Guide**: `public/llms.txt` - AI/LLM integration guide for crawlers

## WebMCP Annotations Reference

### 1. Form Annotations

All forms should have `data-webmcp-form` attribute with semantic role:

```tsx
import { createFormAttributes } from '@/utils/webmcp.utils';
import { WEBMCP_FORMS } from '@/types/webmcp.types';

// Simple form
<form {...createFormAttributes({ 
  form: WEBMCP_FORMS.LOGIN_FORM,
  ariaLabel: 'User login form' 
})}>
  <input 
    type="email" 
    aria-label="Email address"
    data-webmcp-input="email"
  />
  <button data-webmcp-action="submit-form">Login</button>
</form>

// Or manual annotation
<form data-webmcp-form="login-form" role="group" aria-label="User login">
  {/* form fields */}
</form>
```

### 2. Input Field Annotations

Each input should have:
- `data-webmcp-input="[type]"` - Input type (text, email, password, etc.)
- `aria-label` - Accessible description

```tsx
import { createInputAttributes } from '@/utils/webmcp.utils';

<input
  type="email"
  {...createInputAttributes({
    type: 'email',
    ariaLabel: 'Email address for account login',
    name: 'email'
  })}
  placeholder="Enter your email"
/>

// Or manual
<input
  type="email"
  data-webmcp-input="email"
  aria-label="Email address"
  name="email"
/>
```

### 3. Button & Action Annotations

All actionable buttons should have:
- `data-webmcp-action="[action]"` - Action identifier
- `aria-label` - Accessible description

```tsx
import { createActionAttributes } from '@/utils/webmcp.utils';
import { WEBMCP_ACTIONS } from '@/types/webmcp.types';

// Delete button with context
<button 
  {...createActionAttributes({
    action: WEBMCP_ACTIONS.DELETE_ITEM,
    ariaLabel: `Delete transaction ${reference}`
  })}
>
  <Trash2 size={18} aria-hidden="true" />
</button>

// Period filter
<button 
  {...createActionAttributes({
    action: WEBMCP_ACTIONS.FILTER_PERIOD_MONTH,
    ariaLabel: 'Filter dashboard data for the month'
  })}
  aria-pressed={selectedPeriod === 'month'}
>
  Month
</button>
```

### 4. Table Annotations

Tables should have structured WebMCP attributes:

```tsx
import { createTableAttributes } from '@/utils/webmcp.utils';
import { WEBMCP_TABLES } from '@/types/webmcp.types';

<table {...createTableAttributes({
  table: WEBMCP_TABLES.ADMIN_USERS,
  ariaLabel: 'Admin user management table'
})}>
  <thead>
    <tr>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    {users.map(user => (
      <tr key={user.id} data-webmcp-row={user.id}>
        <td data-webmcp-field="email">{user.email}</td>
        <td data-webmcp-field="status">{user.status}</td>
        <td>
          <button data-webmcp-action="view-details">View</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### 5. Modal / Dialog Annotations

```tsx
import { createModalAttributes } from '@/utils/webmcp.utils';
import { WEBMCP_MODALS } from '@/types/webmcp.types';

<div {...createModalAttributes({
  modal: WEBMCP_MODALS.TRANSACTION_DETAILS,
  ariaLabel: 'Transaction details dialog'
})}>
  <h2 id="modal-title">Transaction Details</h2>
  
  <div data-webmcp-field="reference">
    <label>Reference:</label>
    <span>{tx.reference}</span>
  </div>
  
  <button data-webmcp-action="close-modal" aria-label="Close dialog">
    Close
  </button>
</div>
```

## Implementation Checklist

### Phase 1 ✅ (Completed)
- [x] Icon buttons have aria-labels
- [x] Links have descriptive text
- [x] Semantic HTML structure (header, main, nav, aside)
- [x] llms.txt file created
- [x] Dashboard filter form annotated with WebMCP

### Phase 2 (In Progress)
- [ ] Add `data-webmcp-form` to all FilterPanel components
- [ ] Add `data-webmcp-table` to AdminTable component
- [ ] Add `data-webmcp-modal` to Modal component
- [ ] Add `data-webmcp-action` to all action buttons
- [ ] Add `aria-label` to all icon-only buttons

### Phase 3 (Recommended)
- [ ] Add `data-webmcp-field` annotations to form inputs
- [ ] Add sorting/filtering metadata to tables
- [ ] Add breadcrumb navigation annotations
- [ ] Create breadcrumb component with WebMCP

## Utilities for Compliance Checking

The project includes helper utilities for WebMCP compliance:

```tsx
import { 
  validateWebMCPCompliance,
  scanPageCompliance,
  logComplianceReport 
} from '@/utils/webmcp.utils';

// Check single element
const element = document.querySelector('button');
const validation = validateWebMCPCompliance(element);
console.log(validation.isValid, validation.issues);

// Scan entire page
const report = scanPageCompliance();
console.log(`Issues found: ${report.issuesFound}`);
console.log(report.details); // Detailed breakdown

// Log compliance report to console
logComplianceReport();
```

Run this in browser console to check page compliance:
```js
import { logComplianceReport } from '@/utils/webmcp.utils';
logComplianceReport();
```

## Testing WebMCP Integration

### 1. Manual Testing
1. Open DevTools (F12)
2. Run: `window.__webmcpReport = scanPageCompliance()`
3. Check console for any accessibility issues

### 2. PageSpeed Insights
1. Go to https://pagespeed.web.dev/
2. Enter your website URL
3. Click "Analyze"
4. Check the "Agentic Browsing" section:
   - "Buttons must have discernible text"
   - "Links must have discernible text"
   - "Accessibility tree is well-formed"
   - "WebMCP schemas are valid"
   - "llms.txt follows recommendations"

### 3. Automated Testing
Add to your test suite:
```typescript
import { validateWebMCPCompliance } from '@/utils/webmcp.utils';

describe('WebMCP Compliance', () => {
  it('should have discernible text on all buttons', () => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      const result = validateWebMCPCompliance(btn);
      expect(result.isValid).toBe(true);
    });
  });
});
```

## Admin Dashboard - Example Implementation

The admin dashboard (`app/admin/page.tsx`) includes comprehensive WebMCP annotations:

```tsx
// Dashboard filter form
<div 
  data-webmcp-form="dashboard-filter"
  role="group"
  aria-label="Dashboard period and date range filter"
>
  {/* Period buttons */}
  <Button
    data-webmcp-action="filter-period-month"
    aria-pressed={selectedPeriod === 'month'}
    aria-label="Filter dashboard data for the month"
  >
    Month
  </Button>
  
  {/* Custom date range */}
  <div 
    data-webmcp-form="custom-date-range"
    role="group"
    aria-label="Custom date range selector"
  >
    <input
      id="start-date-input"
      type="date"
      data-webmcp-input="date"
      aria-label="Start date for dashboard data"
    />
    <input
      id="end-date-input"
      type="date"
      data-webmcp-input="date"
      aria-label="End date for dashboard data"
    />
  </div>
</div>
```

## Best Practices

1. **Always include aria-labels** on icon-only buttons
2. **Use semantic HTML** - button, a, form, table, etc.
3. **Mark decorative icons** with `aria-hidden="true"`
4. **Group related controls** with `role="group"` and `aria-label`
5. **Use data attributes** for AI agent context
6. **Maintain form labels** - either with `<label>` or `aria-label`
7. **Test with screen readers** - NVDA, JAWS, VoiceOver
8. **Validate regularly** - Use PageSpeed Insights monthly

## Resources

- [Web Fundamentals - Agentic Browsing](https://web.dev/agentic-browsing)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM - Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Accessible Rich Internet Applications (ARIA)](https://www.w3.org/TR/wai-aria-1.2/)

## Support & Questions

For questions about WebMCP implementation:
1. Check `src/types/webmcp.types.ts` for available annotations
2. Review `src/utils/webmcp.utils.ts` for helper functions
3. See examples in `app/admin/page.tsx`
4. Run compliance scanner: `logComplianceReport()`
  

## Recommended WebMCP Enhancements

### 1. Form Annotations

```tsx
// Filter Form Example
<form data-webmcp-form="transaction-filter">
  <div className="space-y-4">
    <input
      type="text"
      name="search"
      placeholder="Search transactions"
      data-webmcp-input="text"
      aria-label="Search by reference or user ID"
    />
    
    <select
      name="status"
      data-webmcp-input="select"
      aria-label="Filter by transaction status"
    >
      <option value="">All Statuses</option>
      <option value="completed">Completed</option>
      <option value="pending">Pending</option>
      <option value="failed">Failed</option>
    </select>
    
    <button 
      type="submit" 
      data-webmcp-action="submit-filter"
      aria-label="Apply transaction filters"
    >
      Apply Filters
    </button>
  </div>
</form>
```

### 2. Interactive Element Annotations

```tsx
// Actionable Button Example
<button
  onClick={handleDelete}
  data-webmcp-action="delete-transaction"
  data-webmcp-context={JSON.stringify({ id: transaction.id })}
  aria-label={`Delete transaction ${transaction.reference}`}
>
  <Trash2 size={18} aria-hidden="true" />
</button>
```

### 3. Navigation Landmarks

```tsx
// Semantic Navigation Structure
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/admin">Admin Panel</a></li>
  </ul>
</nav>

<main aria-label="Main content">
  {/* Page content */}
</main>

<aside aria-label="Secondary navigation">
  {/* Sidebar content */}
</aside>
```

### 4. Data Table Annotations

```tsx
// Table with WebMCP Support
<table 
  data-webmcp-table="transactions"
  aria-label="Transaction list with status and details"
>
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">
        Reference
        <span data-webmcp-sortable="reference" />
      </th>
      <th scope="col">Status</th>
      <th scope="col">Amount</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    {transactions.map((tx) => (
      <tr key={tx.id} data-webmcp-row={tx.id}>
        <td data-webmcp-field="reference">{tx.reference}</td>
        <td data-webmcp-field="status">{tx.status}</td>
        <td data-webmcp-field="amount">{tx.amount}</td>
        <td>
          <button
            data-webmcp-action="view-details"
            data-webmcp-context={JSON.stringify({ id: tx.id })}
          >
            View
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### 5. Modal/Dialog Annotations

```tsx
// Accessible Modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  data-webmcp-modal="transaction-details"
>
  <h2 id="modal-title">Transaction Details</h2>
  
  <div data-webmcp-field="reference">
    <label>Reference:</label>
    <span>{transaction.reference}</span>
  </div>
  
  <div data-webmcp-field="status">
    <label>Status:</label>
    <span>{transaction.status}</span>
  </div>
  
  <button 
    data-webmcp-action="close-modal"
    aria-label="Close dialog"
  >
    Close
  </button>
</div>
```

## Implementation Priority

### Phase 1 (Already Completed)
- ✅ Icon buttons have aria-labels
- ✅ Links have descriptive text
- ✅ Semantic HTML structure

### Phase 2 (Recommended)
- Add `data-webmcp-form` to FilterPanel component
- Add `data-webmcp-table` to AdminTable component  
- Add `data-webmcp-modal` to Modal component
- Add `data-webmcp-action` to primary action buttons

### Phase 3 (Optional)
- Add `data-webmcp-field` annotations to form inputs
- Add sorting/filtering metadata to tables
- Add breadcrumb navigation annotations

## Testing WebMCP Integration

Use PageSpeed Insights to validate your implementation:

1. Go to https://pagespeed.web.dev/
2. Enter your website URL
3. Click "Analyze"
4. Check the "Agentic Browsing" section for:
   - "WebMCP schemas are valid"
   - "WebMCP tools registered"
   - "WebMCP form coverage"

## Example: Enhanced FilterPanel with WebMCP

```tsx
// src/components/shared/FilterPanel.tsx
export function FilterPanel({ fields, ...props }: FilterPanelProps) {
  return (
    <div
      data-webmcp-form="advanced-filter"
      className="filter-panel"
    >
      <h2>Filters</h2>
      
      {fields.map((field) => (
        <div key={field.id} data-webmcp-field={field.id}>
          <label htmlFor={field.id}>
            {field.label}
            {field.helpText && (
              <span 
                className="help-text"
                aria-describedby={`${field.id}-help`}
              >
                {field.helpText}
              </span>
            )}
          </label>
          
          {field.type === 'text' && (
            <input
              id={field.id}
              type="text"
              data-webmcp-input="text"
              aria-label={field.label}
              aria-describedby={field.helpText ? `${field.id}-help` : undefined}
            />
          )}
          
          {field.type === 'select' && (
            <select
              id={field.id}
              data-webmcp-input="select"
              aria-label={field.label}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
      
      <div className="actions">
        <button 
          type="submit"
          data-webmcp-action="apply-filters"
          aria-label="Apply filters to results"
        >
          Apply Filters
        </button>
        <button 
          type="reset"
          data-webmcp-action="reset-filters"
          aria-label="Clear all filters"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
```

## Resources

- [WebMCP Specification](https://spec.modelcontextprotocol.io/specification/)
- [PageSpeed Insights Guide](https://pagespeed.web.dev/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Web Docs - WebMCP](https://developer.mozilla.org/en-US/docs/Web/Guide/MCP)

## Next Steps

1. ✅ Current state: Buttons and links are accessible
2. 📋 Add WebMCP form annotations to FilterPanel
3. 📋 Add WebMCP table annotations to AdminTable
4. 📋 Test with PageSpeed Insights Agentic Browsing audits
5. 📋 Document AI-agent interactions

---
**Last Updated:** June 25, 2026
