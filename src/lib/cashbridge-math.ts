/**
 * CashBridge Math Logic
 * Pure, unit-testable functions for early-cash bill financing.
 */

export interface CashBridgeOffer {
  id?: string;
  bill_id: string;
  amount: number;
  due_date: string;
  discount_rate: number;
  payout_amount: number;
  status: 'ACTIVE' | 'CLAIMED' | 'EXPIRED';
  claimed_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Calculates the payout amount after applying the early cash discount rate.
 * Formula: payoutAmount = amount * (1 - discountRate / 100)
 */
export function calculatePayout(amount: number, discountRate: number): number {
  if (amount < 0 || discountRate < 0 || discountRate > 100) {
    throw new Error('Invalid amount or discount rate');
  }
  const payout = amount * (1 - discountRate / 100);
  return Math.round(payout * 100) / 100;
}

/**
 * Calculates the implied discount rate given a bill amount and payout amount.
 */
export function calculateImpliedRate(amount: number, payoutAmount: number): number {
  if (amount <= 0 || payoutAmount < 0 || payoutAmount > amount) {
    throw new Error('Invalid amounts for implied rate calculation');
  }
  const rate = ((amount - payoutAmount) / amount) * 100;
  return Math.round(rate * 100) / 100;
}
