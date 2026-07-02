/**
 * WebMCP Schema Definitions
 * 
 * This file documents all WebMCP data attributes used throughout the RemoPay application
 * for improved AI agent accessibility and interaction.
 * 
 * Reference: https://web.dev/agentic-browsing
 */

// Form Annotations
export const WEBMCP_FORMS = {
  DASHBOARD_FILTER: 'dashboard-filter',
  CUSTOM_DATE_RANGE: 'custom-date-range',
  LOGIN_FORM: 'login-form',
  REGISTRATION_FORM: 'registration-form',
  VTU_TRANSACTION: 'vtu-transaction-form',
  TRANSFER_FORM: 'transfer-form',
  ADMIN_USER_FILTER: 'admin-user-filter',
  ADMIN_TRANSACTION_FILTER: 'admin-transaction-filter',
} as const;

// Input Types
export const WEBMCP_INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  PHONE: 'phone',
  NUMBER: 'number',
  DATE: 'date',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
} as const;

// Actions
export const WEBMCP_ACTIONS = {
  // Dashboard
  FILTER_PERIOD_DAY: 'filter-period-day',
  FILTER_PERIOD_WEEK: 'filter-period-week',
  FILTER_PERIOD_MONTH: 'filter-period-month',
  FILTER_PERIOD_YEAR: 'filter-period-year',
  TOGGLE_CUSTOM_DATE_RANGE: 'toggle-custom-date-range',
  
  // Forms
  SUBMIT_FORM: 'submit-form',
  CANCEL_FORM: 'cancel-form',
  RESET_FORM: 'reset-form',
  
  // CRUD Operations
  VIEW_DETAILS: 'view-details',
  EDIT_ITEM: 'edit-item',
  DELETE_ITEM: 'delete-item',
  DUPLICATE_ITEM: 'duplicate-item',
  
  // Transaction
  INITIATE_TRANSFER: 'initiate-transfer',
  CONFIRM_TRANSACTION: 'confirm-transaction',
  CANCEL_TRANSACTION: 'cancel-transaction',
  
  // User Management
  VERIFY_USER: 'verify-user',
  SUSPEND_USER: 'suspend-user',
  ACTIVATE_USER: 'activate-user',
  ASSIGN_ROLE: 'assign-role',
  
  // Modal
  CLOSE_MODAL: 'close-modal',
  CONFIRM_MODAL: 'confirm-modal',
} as const;

// Table Annotations
export const WEBMCP_TABLES = {
  ADMIN_USERS: 'admin-users-table',
  ADMIN_TRANSACTIONS: 'admin-transactions-table',
  ADMIN_AGENTS: 'admin-agents-table',
  VTU_RECIPIENTS: 'vtu-recipients-table',
  TRANSACTION_HISTORY: 'transaction-history-table',
} as const;

// Modal Annotations
export const WEBMCP_MODALS = {
  TRANSACTION_DETAILS: 'transaction-details-modal',
  USER_DETAILS: 'user-details-modal',
  CONFIRMATION: 'confirmation-modal',
  ERROR: 'error-modal',
  SUCCESS: 'success-modal',
} as const;

// Field Annotations
export const WEBMCP_FIELDS = {
  USER_ID: 'user-id',
  EMAIL: 'email',
  PHONE: 'phone',
  AMOUNT: 'amount',
  REFERENCE: 'reference',
  STATUS: 'status',
  DATE: 'date',
  BALANCE: 'balance',
} as const;

/**
 * Usage Examples
 * 
 * // Form with inputs
 * <form data-webmcp-form="login-form">
 *   <input 
 *     type="email" 
 *     data-webmcp-input="email" 
 *     aria-label="Email address"
 *   />
 *   <button data-webmcp-action="submit-form">Login</button>
 * </form>
 * 
 * // Table
 * <table data-webmcp-table="admin-users-table">
 *   <tr data-webmcp-row="123">
 *     <td data-webmcp-field="email">user@example.com</td>
 *     <button data-webmcp-action="view-details">View</button>
 *   </tr>
 * </table>
 * 
 * // Modal
 * <div data-webmcp-modal="transaction-details-modal" role="dialog">
 *   <div data-webmcp-field="reference">TX-123456</div>
 *   <button data-webmcp-action="close-modal">Close</button>
 * </div>
 */

export type WebMCPForm = typeof WEBMCP_FORMS[keyof typeof WEBMCP_FORMS];
export type WebMCPInputType = typeof WEBMCP_INPUT_TYPES[keyof typeof WEBMCP_INPUT_TYPES];
export type WebMCPAction = typeof WEBMCP_ACTIONS[keyof typeof WEBMCP_ACTIONS];
export type WebMCPTable = typeof WEBMCP_TABLES[keyof typeof WEBMCP_TABLES];
export type WebMCPModal = typeof WEBMCP_MODALS[keyof typeof WEBMCP_MODALS];
export type WebMCPField = typeof WEBMCP_FIELDS[keyof typeof WEBMCP_FIELDS];
