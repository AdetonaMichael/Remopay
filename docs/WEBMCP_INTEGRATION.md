# WebMCP Integration Guide for AI Agent Browsing

## What is WebMCP?

WebMCP (Web Model Context Protocol) enables AI agents to interact with your website more effectively by providing structured information about:
- Forms and their fields
- Interactive elements and their purposes
- Navigation structure
- Content organization

## Current Status

Your website now meets the following Agentic Browsing criteria:

✅ **Buttons have discernible text** - All icon buttons have aria-labels  
✅ **Links have discernible text** - All social links properly labeled  
✅ **Accessibility tree is well-formed** - Semantic HTML structure intact  
✅ **Low Cumulative Layout Shift** - Page layout is stable  

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
