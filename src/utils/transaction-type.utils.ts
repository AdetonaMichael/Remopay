/**
 * Map frontend transaction types to backend transaction types
 * Backend stores full transaction type names like "Airtime Recharge"
 * Frontend uses shorthand like "airtime"
 */

const TRANSACTION_TYPE_MAP: Record<string, string> = {
  // Shorthand -> Backend full name
  airtime: 'Airtime Recharge',
  data: 'Data Services',
  electricity: 'Electricity Bill Payment',
  betting: 'Betting Top-up',
  cable_tv: 'Cable TV Subscription',

  // Also support backend names for flexibility
  'Airtime Recharge': 'Airtime Recharge',
  'Data Services': 'Data Services',
  'Electricity Bill Payment': 'Electricity Bill Payment',
  'Betting Top-up': 'Betting Top-up',
  'Cable TV Subscription': 'Cable TV Subscription',
};

/**
 * Convert frontend transaction type to backend transaction type
 * Example: 'airtime' -> 'Airtime Recharge'
 */
export const toBackendTransactionType = (type?: string): string | undefined => {
  if (!type) return undefined;
  return TRANSACTION_TYPE_MAP[type] || type;
};

/**
 * Convert backend transaction type to frontend transaction type
 * Example: 'Airtime Recharge' -> 'airtime'
 */
export const toFrontendTransactionType = (type?: string): string | undefined => {
  if (!type) return undefined;

  const REVERSE_MAP: Record<string, string> = {
    'Airtime Recharge': 'airtime',
    'Data Services': 'data',
    'Electricity Bill Payment': 'electricity',
    'Betting Top-up': 'betting',
    'Cable TV Subscription': 'cable_tv',
  };

  return REVERSE_MAP[type] || type;
};
