export interface Payer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  created_at: string;
}

export interface BillLine {
  id: string;
  bill_id: string;
  label: string;
  unit_cost: number;
  unit_charge: number;
  qty: number;
  settled: boolean;
}

export interface RawBill {
  id: string;
  bill_number: string;
  payer_id: string;
  date: string;
  due_date: string;
  levy_rate: number;
  service_fee: number;
  service_fee_settled: boolean;
  state: 'DRAFT' | 'ISSUED' | 'PART_SETTLED' | 'SETTLED' | 'LAPSED';
  created_at: string;
  updated_at: string;
  payers?: Payer;
  bill_lines?: BillLine[];
}

export interface DerivedBillTotals {
  lineRevenue: number;
  lineCost: number;
  margin: number;
  levyAmount: number;
  billTotal: number;
  outstandingLines: number;
  outstandingFee: number;
  lateFees: number;
  daysOverdue: number;
  totalOutstanding: number;
  derivedState: 'DRAFT' | 'ISSUED' | 'PART_SETTLED' | 'SETTLED' | 'LAPSED';
}

export type ComputedBill = RawBill & DerivedBillTotals;

export interface WheelSummary {
  wheelRevenue: number;
  wheelCost: number;
  wheelMargin: number;
  wheelLevy: number;
  wheelOutstanding: number;
  wheelSettled: number;
}

/**
 * Computes derived values for a single bill and its lines.
 */
export function computeBillTotals(
  bill: {
    levy_rate: number;
    service_fee: number;
    service_fee_settled: boolean;
    due_date: string;
    state: string;
  },
  lines: {
    unit_cost: number;
    unit_charge: number;
    qty: number;
    settled: boolean;
  }[]
): DerivedBillTotals {
  let lineRevenue = 0;
  let lineCost = 0;
  let outstandingLines = 0;

  for (const line of lines) {
    const rev = line.unit_charge * line.qty;
    const cost = line.unit_cost * line.qty;
    lineRevenue += rev;
    lineCost += cost;
    if (!line.settled) {
      outstandingLines += rev;
    }
  }

  const margin = lineRevenue - lineCost;
  const levyAmount = lineRevenue * (bill.levy_rate / 100);
  const baseOutstanding = outstandingLines + (bill.service_fee_settled ? 0 : bill.service_fee);
  
  // Calculate Late Fees: 100 rupees for every 5 days overdue if outstanding > 0
  let lateFees = 0;
  let daysOverdue = 0;
  
  if (baseOutstanding > 0) {
    const dueTime = new Date(bill.due_date).getTime();
    const nowTime = new Date().getTime();
    if (nowTime > dueTime) {
      const diffMs = nowTime - dueTime;
      daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (daysOverdue >= 5) {
        lateFees = Math.floor(daysOverdue / 5) * 100;
      }
    }
  }

  const billTotal = lineRevenue + bill.service_fee + levyAmount + lateFees;
  const outstandingFee = bill.service_fee_settled ? 0 : bill.service_fee;
  const totalOutstanding = baseOutstanding + lateFees;

  // State derivation:
  // if totalOutstanding === billTotal -> ISSUED
  // if 0 < totalOutstanding < billTotal -> PART_SETTLED
  // if totalOutstanding === 0 -> SETTLED
  let derivedState = bill.state as RawBill['state'];

  if (derivedState !== 'DRAFT') {
    if (totalOutstanding === billTotal) {
      derivedState = 'ISSUED';
    } else if (totalOutstanding > 0 && totalOutstanding < billTotal) {
      derivedState = 'PART_SETTLED';
    } else if (totalOutstanding === 0) {
      derivedState = 'SETTLED';
    }
  } else {
    // Draft with payments starts moving
    if (totalOutstanding === 0) {
      derivedState = 'SETTLED';
    } else if (totalOutstanding < billTotal) {
      derivedState = 'PART_SETTLED';
    }
  }

  // Override with LAPSED if overdue and not fully settled
  if (totalOutstanding > 0 && new Date(bill.due_date) < new Date()) {
    derivedState = 'LAPSED';
  }

  return {
    lineRevenue: Math.round(lineRevenue * 100) / 100,
    lineCost: Math.round(lineCost * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    levyAmount: Math.round(levyAmount * 100) / 100,
    billTotal: Math.round(billTotal * 100) / 100,
    outstandingLines: Math.round(outstandingLines * 100) / 100,
    outstandingFee: Math.round(outstandingFee * 100) / 100,
    lateFees,
    daysOverdue,
    totalOutstanding: Math.round(totalOutstanding * 100) / 100,
    derivedState
  };
}

/**
 * Computes wheel-wide totals from all computed bills.
 */
export function computeWheelSummary(bills: ComputedBill[]): WheelSummary {
  let wheelRevenue = 0;
  let wheelCost = 0;
  let wheelMargin = 0;
  let wheelLevy = 0;
  let wheelOutstanding = 0;
  let totalServiceFee = 0;

  for (const bill of bills) {
    wheelRevenue += bill.lineRevenue;
    wheelCost += bill.lineCost;
    wheelMargin += bill.margin;
    wheelLevy += bill.levyAmount;
    wheelOutstanding += bill.totalOutstanding;
    totalServiceFee += bill.service_fee;
  }

  // wheelSettled = wheelRevenue + Σ serviceFee + wheelLevy − wheelOutstanding
  const wheelSettled = wheelRevenue + totalServiceFee + wheelLevy - wheelOutstanding;

  return {
    wheelRevenue: Math.round(wheelRevenue * 100) / 100,
    wheelCost: Math.round(wheelCost * 100) / 100,
    wheelMargin: Math.round(wheelMargin * 100) / 100,
    wheelLevy: Math.round(wheelLevy * 100) / 100,
    wheelOutstanding: Math.round(wheelOutstanding * 100) / 100,
    wheelSettled: Math.round(wheelSettled * 100) / 100
  };
}
