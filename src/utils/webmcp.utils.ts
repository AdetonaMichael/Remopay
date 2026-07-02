/**
 * WebMCP Helper Utilities
 * 
 * Helper functions and utilities for adding WebMCP annotations
 * to form elements and interactive components.
 */

import { 
  WebMCPAction, 
  WebMCPForm, 
  WebMCPInputType,
  WebMCPModal,
  WebMCPTable,
  WEBMCP_ACTIONS 
} from '@/types/webmcp.types';

export interface WebMCPFormProps {
  form: WebMCPForm;
  role?: string;
  ariaLabel?: string;
  className?: string;
}

export interface WebMCPInputProps {
  type: WebMCPInputType;
  ariaLabel?: string;
  name?: string;
}

export interface WebMCPActionProps {
  action: WebMCPAction;
  ariaLabel?: string;
  title?: string;
}

export interface WebMCPTableProps {
  table: WebMCPTable;
  ariaLabel?: string;
}

export interface WebMCPModalProps {
  modal: WebMCPModal;
  ariaLabel?: string;
  ariaModal?: boolean;
}

/**
 * Generate form container attributes for WebMCP
 * Usage: <form {...createFormAttributes(...)}>
 */
export function createFormAttributes(props: WebMCPFormProps) {
  return {
    'data-webmcp-form': props.form,
    role: props.role || 'group',
    'aria-label': props.ariaLabel || `Form: ${props.form}`,
    className: props.className,
  };
}

/**
 * Generate input attributes for WebMCP
 * Usage: <input {...createInputAttributes(...)} />
 */
export function createInputAttributes(props: WebMCPInputProps) {
  return {
    'data-webmcp-input': props.type,
    'aria-label': props.ariaLabel || `${props.type} input`,
    name: props.name,
  };
}

/**
 * Generate action button attributes for WebMCP
 * Usage: <button {...createActionAttributes(...)}>
 */
export function createActionAttributes(props: WebMCPActionProps) {
  return {
    'data-webmcp-action': props.action,
    'aria-label': props.ariaLabel || `Action: ${props.action}`,
    title: props.title,
  };
}

/**
 * Generate table attributes for WebMCP
 * Usage: <table {...createTableAttributes(...)}>
 */
export function createTableAttributes(props: WebMCPTableProps) {
  return {
    'data-webmcp-table': props.table,
    'aria-label': props.ariaLabel || `Data table: ${props.table}`,
  };
}

/**
 * Generate modal attributes for WebMCP
 * Usage: <div {...createModalAttributes(...)}>
 */
export function createModalAttributes(props: WebMCPModalProps) {
  return {
    'data-webmcp-modal': props.modal,
    role: 'dialog',
    'aria-modal': props.ariaModal !== false ? 'true' : 'false',
    'aria-label': props.ariaLabel || `Dialog: ${props.modal}`,
  };
}

/**
 * Create aria-hidden attribute for decorative icons
 * Usage: <Icon {...createDecorationAttributes()} />
 */
export function createDecorationAttributes() {
  return {
    'aria-hidden': 'true',
  };
}

/**
 * Utility to check if an element has WebMCP attributes
 */
export function hasWebMCPAnnotation(element: HTMLElement | null, annotationType: string): boolean {
  if (!element) return false;
  return !!element.getAttribute(`data-webmcp-${annotationType}`);
}

/**
 * Utility to validate WebMCP schema compliance
 */
export function validateWebMCPCompliance(element: HTMLElement): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check buttons have discernible text
  if (element.tagName === 'BUTTON') {
    const hasText = element.textContent?.trim();
    const hasAriaLabel = element.getAttribute('aria-label');
    if (!hasText && !hasAriaLabel) {
      issues.push('Button must have discernible text or aria-label');
    }
  }

  // Check links have discernible text
  if (element.tagName === 'A') {
    const hasText = element.textContent?.trim();
    const hasAriaLabel = element.getAttribute('aria-label');
    if (!hasText && !hasAriaLabel) {
      issues.push('Link must have discernible text or aria-label');
    }
  }

  // Check form inputs have labels
  if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
    const hasLabel = element.getAttribute('aria-label');
    const hasLabelElement = document.querySelector(`label[for="${element.id}"]`);
    if (!hasLabel && !hasLabelElement) {
      issues.push(`${element.tagName} must have aria-label or associated label element`);
    }
  }

  // Check form has data-webmcp-form
  if (element.tagName === 'FORM' && !element.getAttribute('data-webmcp-form')) {
    issues.push('Form should have data-webmcp-form annotation');
  }

  // Check table has data-webmcp-table
  if (element.tagName === 'TABLE' && !element.getAttribute('data-webmcp-table')) {
    issues.push('Table should have data-webmcp-table annotation');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Helper to scan page for WebMCP compliance issues
 */
export function scanPageCompliance(): {
  totalElements: number;
  issuesFound: number;
  details: Record<string, string[]>;
} {
  const buttons = document.querySelectorAll('button');
  const links = document.querySelectorAll('a');
  const forms = document.querySelectorAll('form');
  const tables = document.querySelectorAll('table');

  const details: Record<string, string[]> = {
    buttons: [],
    links: [],
    forms: [],
    tables: [],
  };

  let issuesFound = 0;

  // Check buttons
  buttons.forEach((btn) => {
    const validation = validateWebMCPCompliance(btn);
    if (!validation.isValid) {
      details.buttons.push(...validation.issues);
      issuesFound += validation.issues.length;
    }
  });

  // Check links
  links.forEach((link) => {
    const validation = validateWebMCPCompliance(link);
    if (!validation.isValid) {
      details.links.push(...validation.issues);
      issuesFound += validation.issues.length;
    }
  });

  // Check forms
  forms.forEach((form) => {
    const validation = validateWebMCPCompliance(form);
    if (!validation.isValid) {
      details.forms.push(...validation.issues);
      issuesFound += validation.issues.length;
    }
  });

  // Check tables
  tables.forEach((table) => {
    const validation = validateWebMCPCompliance(table);
    if (!validation.isValid) {
      details.tables.push(...validation.issues);
      issuesFound += validation.issues.length;
    }
  });

  return {
    totalElements: buttons.length + links.length + forms.length + tables.length,
    issuesFound,
    details,
  };
}

/**
 * Helper to log WebMCP compliance report to console
 */
export function logComplianceReport() {
  if (typeof window === 'undefined') return;
  
  const report = scanPageCompliance();
  console.group('🔍 WebMCP Compliance Report');
  console.log(`Total Elements: ${report.totalElements}`);
  console.log(`Issues Found: ${report.issuesFound}`);
  
  if (report.issuesFound > 0) {
    console.error('Issues:', report.details);
  } else {
    console.log('✅ All elements are WebMCP compliant!');
  }
  console.groupEnd();
}
