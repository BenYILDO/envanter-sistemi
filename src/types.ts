export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  currentStock: number;
}

export type TransactionType = 'purchase' | 'sale';
export type PaymentMethod = 'cash' | 'credit' | 'bank_transfer' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  contactId: string;
  items: TransactionItem[];
  paymentMethod: PaymentMethod;
  notes?: string;
  totalAmount: number;
  exchangeRate?: number; // Dolar/TL kuru
  additionalInfo?: string; // Ek bilgiler (fatura, garanti, vs.)
}

export interface TransactionItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  purchasePrice?: number; // Satış işlemlerinde, ürünün alış fiyatı
}

export interface StockMovement {
  id: string;
  productId: string;
  transactionId: string;
  date: string;
  quantity: number; // positive for purchases, negative for sales
  balanceAfter: number;
}

export interface CapitalMovement {
  id: string;
  date: string;
  type: 'investment' | 'withdrawal' | 'profit' | 'loss';
  amount: number;
  description?: string;
}

export interface CapitalSummary {
  totalCapital: number;
  totalInvestments: number;
  totalWithdrawals: number;
  totalProfit: number;
  totalLoss: number;
  currentBalance: number;
}