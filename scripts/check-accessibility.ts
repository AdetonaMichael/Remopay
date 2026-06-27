#!/usr/bin/env node

/**
 * Accessibility Checker Script
 * 
 * This script helps identify potential accessibility issues in the codebase,
 * specifically looking for icon-only buttons and links without aria-labels.
 * 
 * Usage: npx ts-node scripts/check-accessibility.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface AccessibilityIssue {
  file: string;
  line: number;
  type: 'icon-button' | 'icon-link' | 'missing-alt' | 'unlabeled-form';
  message: string;
  suggestion: string;
}

const issues: AccessibilityIssue[] = [];

// Patterns to look for
const patterns = [
  {
    name: 'Icon-only button without aria-label',
    regex: /<button[^>]*>[\s\n]*<(?:Eye|Trash2|Edit|Plus|Minus|Delete|Mail|Linkedin|Bell|Settings|Menu|Close|X|Check|ChevronDown|ChevronUp|ChevronLeft|ChevronRight)[^>]*\/>/,
    type: 'icon-button' as const,
    suggestion: 'Add aria-label and title attributes to icon-only buttons',
  },
  {
    name: 'Icon-only link without aria-label',
    regex: /<a[^>]*>[\s\n]*<(?:Eye|Trash2|Edit|Plus|Minus|Delete|Mail|Linkedin|Bell|Settings|Menu|Close|X|Check)[^>]*\/>/,
    type: 'icon-link' as const,
    suggestion: 'Add aria-label and title attributes to icon-only links',
  },
  {
    name: 'Image without alt text',
    regex: /<img[^>]*(?<!alt=)[^>]*>/,
    type: 'missing-alt' as const,
    suggestion: 'Add descriptive alt text to all images',
  },
];

function scanFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, lineNumber) => {
      patterns.forEach((pattern) => {
        if (pattern.regex.test(line)) {
          // Check if aria-label already exists
          if (!line.includes('aria-label') && !line.includes('aria-hidden')) {
            issues.push({
              file: filePath.replace(process.cwd(), '.'),
              line: lineNumber + 1,
              type: pattern.type,
              message: pattern.name,
              suggestion: pattern.suggestion,
            });
          }
        }
      });
    });
  } catch (err) {
    // Silently skip files that can't be read
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Skip node_modules and build directories
    if (file === 'node_modules' || file === '.next' || file === 'build' || file === 'dist') {
      return;
    }

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      scanFile(filePath);
    }
  });
}

function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('ACCESSIBILITY AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  if (issues.length === 0) {
    console.log('✓ No accessibility issues found!\n');
    return;
  }

  const groupedByType = issues.reduce(
    (acc, issue) => {
      if (!acc[issue.type]) {
        acc[issue.type] = [];
      }
      acc[issue.type].push(issue);
      return acc;
    },
    {} as Record<string, AccessibilityIssue[]>
  );

  Object.entries(groupedByType).forEach(([type, typeIssues]) => {
    console.log(`\n${type.toUpperCase()} (${typeIssues.length} issues):`);
    console.log('-'.repeat(80));

    typeIssues.forEach((issue) => {
      console.log(`\n  📍 ${issue.file}:${issue.line}`);
      console.log(`  ⚠️  ${issue.message}`);
      console.log(`  💡 ${issue.suggestion}`);
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log(`Total issues: ${issues.length}`);
  console.log('='.repeat(80) + '\n');
}

// Main execution
console.log('Scanning codebase for accessibility issues...\n');
walkDir(path.join(process.cwd(), 'app'));
walkDir(path.join(process.cwd(), 'src'));
printReport();

process.exit(issues.length > 0 ? 1 : 0);
