export interface CardAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CardDetailData {
  id: string;
  issuer: string;
  currency: string;
  masked_pan?: string;
  card_number?: string;
  expiry: string;
  cvv: string;
  is_contactless: boolean;
  name: string;
  balance: number;
  balance_updated_at: string;
  auto_approve: boolean;
  created_at: string;
  address: CardAddress;
  type: string;
  status: string;
}

export interface CardTransactionData {
  id: string;
  description: string;
  created_at: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  fee: number;
  status: string;
}

export interface TransactionsPaginationData {
  current_page: number;
  total_pages: number;
  total_records: number;
}
