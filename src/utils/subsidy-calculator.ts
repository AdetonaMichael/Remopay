/**
 * Subsidy Calculator Utility
 *
 * Calculates discounted pricing preview based on subsidy configuration.
 * Supports percentage-based and fixed-amount subsidies with optional min/max caps.
 */

import type { SubsidyPreview, SubsidyType } from '@/types/vtu.types';

/**
 * Calculate subsidy preview for a given original amount.
 *
 * @param originalAmount - The base price before subsidy
 * @param type - 'percentage' or 'fixed'
 * @param value - The subsidy value (percentage or fixed amount)
 * @param minCap - Optional minimum discount cap
 * @param maxCap - Optional maximum discount cap
 *
 * @returns {SubsidyPreview} Detailed breakdown of the subsidized pricing
 */
export function calculateSubsidyPreview(
  originalAmount: number,
  type: SubsidyType,
  value: number,
  minCap?: number | null,
  maxCap?: number | null,
): SubsidyPreview {
  // Calculate raw discount
  let discount =
    type === 'percentage'
      ? originalAmount * (value / 100)
      : value;

  // Apply minimum cap (floor discount)
  if (minCap != null && discount < minCap) {
    discount = minCap;
  }

  // Apply maximum cap (ceiling discount)
  if (maxCap != null && discount > maxCap) {
    discount = maxCap;
  }

  // Ensure non-negative
  discount = Math.max(0, discount);

  // Round to 2 decimal places to avoid floating point issues
  const roundedDiscount = Math.round(discount * 100) / 100;
  const subsidizedAmount = Math.round((originalAmount - roundedDiscount) * 100) / 100;
  const savings = Math.round((originalAmount - subsidizedAmount) * 100) / 100;

  return {
    originalAmount,
    discount: roundedDiscount,
    subsidizedAmount,
    savings,
  };
}
