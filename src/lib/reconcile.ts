import { UpiTransaction } from './ledgerMath';

export interface MatchResult {
  status: 'MATCHED' | 'UNMATCHED' | 'PARTIAL_MATCH' | 'IGNORED';
  matchedBillId: string | null;
  matchedLineId: string | null;
  matchedFee: boolean;
  linesToSettle: string[];
  settleServiceFee: boolean;
}

/**
 * Pure function to reconcile a new UPI transaction against a list of candidate bills.
 * Matches using fuzzy payer name matching and exact amount reconciliation.
 */
export function reconcileTransaction(
  transaction: { payerName: string; amount: number },
  candidateBills: any[]
): MatchResult {
  const normTxName = transaction.payerName.trim().toLowerCase();
  const txAmount = transaction.amount;

  if (!normTxName || isNaN(txAmount) || txAmount <= 0) {
    return {
      status: 'UNMATCHED',
      matchedBillId: null,
      matchedLineId: null,
      matchedFee: false,
      linesToSettle: [],
      settleServiceFee: false
    };
  }

  // 1. Filter candidate bills where payer name matches fuzzy
  const matchedBills = candidateBills.filter(bill => {
    if (!bill.payers || !bill.payers.name) return false;
    const normPayerName = bill.payers.name.trim().toLowerCase();
    // Allow partial substring matching (e.g. "Padmadatta Pati" matches "Padmadatta")
    return normPayerName.includes(normTxName) || normTxName.includes(normPayerName);
  });

  // 2. Scan for exact match of a single unsettled line item or flat service fee
  for (const bill of matchedBills) {
    // Only check active bills (ISSUED, PART_SETTLED, LAPSED)
    if (bill.state === 'DRAFT' || bill.state === 'SETTLED') continue;

    // Check single unsettled lines
    if (bill.bill_lines) {
      for (const line of bill.bill_lines) {
        if (!line.settled) {
          const lineTotalCharge = line.unit_charge * line.qty;
          // Float precision margin check
          if (Math.abs(lineTotalCharge - txAmount) < 0.01) {
            return {
              status: 'MATCHED',
              matchedBillId: bill.id,
              matchedLineId: line.id,
              matchedFee: false,
              linesToSettle: [line.id],
              settleServiceFee: false
            };
          }
        }
      }
    }

    // Check service fee
    if (!bill.service_fee_settled && bill.service_fee > 0) {
      if (Math.abs(bill.service_fee - txAmount) < 0.01) {
        return {
          status: 'MATCHED',
          matchedBillId: bill.id,
          matchedLineId: null,
          matchedFee: true,
          linesToSettle: [],
          settleServiceFee: true
        };
      }
    }
  }

  // 3. Scan for lump-sum exact match against total remaining outstanding bill balance
  for (const bill of matchedBills) {
    if (bill.state === 'DRAFT' || bill.state === 'SETTLED') continue;

    const outstanding = bill.totalOutstanding;
    if (Math.abs(outstanding - txAmount) < 0.01) {
      const linesToSettle = (bill.bill_lines || [])
        .filter((l: any) => !l.settled)
        .map((l: any) => l.id);

      return {
        status: 'MATCHED',
        matchedBillId: bill.id,
        matchedLineId: null,
        matchedFee: !bill.service_fee_settled && bill.service_fee > 0,
        linesToSettle,
        settleServiceFee: !bill.service_fee_settled && bill.service_fee > 0
      };
    }
  }

  // 4. Fallback: No matches found
  return {
    status: 'UNMATCHED',
    matchedBillId: null,
    matchedLineId: null,
    matchedFee: false,
    linesToSettle: [],
    settleServiceFee: false
  };
}
