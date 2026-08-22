import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Import Types
import { Payer, BillLine, RawBill, UpiTransaction } from './ledgerMath';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isMockMode =
  !supabaseUrl ||
  supabaseUrl.includes('your-supabase-project') ||
  !supabaseAnonKey ||
  supabaseAnonKey.includes('dummy_anon_key');

if (isMockMode) {
  console.log(' LedgerFlow is running in LOCAL MOCK DATABASE mode (fallback from Supabase).');
} else {
  console.log(' LedgerFlow is connected to hosted SUPABASE database:', supabaseUrl);
}

export const supabase = createClient(
  isMockMode ? 'https://dummy.supabase.co' : supabaseUrl,
  isMockMode ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy' : supabaseAnonKey
);

// File Path for Local JSON Fallback DB
const BUILD_DB_PATH = path.join(process.cwd(), 'db_mock.json');
const MOCK_DB_PATH = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? path.join('/tmp', 'db_mock.json')
  : BUILD_DB_PATH;

function readMockDB() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    if (fs.existsSync(BUILD_DB_PATH) && MOCK_DB_PATH !== BUILD_DB_PATH) {
      try {
        fs.copyFileSync(BUILD_DB_PATH, MOCK_DB_PATH);
      } catch (copyErr) {
        console.error('Failed to copy seed DB to /tmp, writing fresh:', copyErr);
        const initialData = {
          payers: [],
          bills: [],
          bill_lines: [],
          cashbridge_offers: [],
          upi_transactions: [],
          users: [],
          pending_otps: []
        };
        fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialData, null, 2));
        return initialData;
      }
    } else {
      const initialData = {
        payers: [],
        bills: [],
        bill_lines: [],
        cashbridge_offers: [],
        upi_transactions: [],
        users: [],
        pending_otps: []
      };
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
  }
  try {
    const data = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.upi_transactions) {
      parsed.upi_transactions = [];
    }
    if (!parsed.users) {
      parsed.users = [];
    }
    if (!parsed.pending_otps) {
      parsed.pending_otps = [];
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse mock DB, resetting:', e);
    const initialData = {
      payers: [],
      bills: [],
      bill_lines: [],
      cashbridge_offers: [],
      upi_transactions: [],
      users: [],
      pending_otps: []
    };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
}

function writeMockDB(data: any) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
}

// ==========================================
// Payers API
// ==========================================

export async function getPayers(): Promise<Payer[]> {
  if (isMockMode) {
    const db = readMockDB();
    return db.payers;
  }
  const { data, error } = await supabase
    .from('payers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getPayerById(id: string): Promise<Payer | null> {
  if (isMockMode) {
    const db = readMockDB();
    return db.payers.find((p: any) => p.id === id) || null;
  }
  const { data, error } = await supabase
    .from('payers')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPayer(payer: Omit<Payer, 'id' | 'created_at'>): Promise<Payer> {
  if (isMockMode) {
    const db = readMockDB();
    const newPayer: Payer = {
      id: crypto.randomUUID(),
      name: payer.name,
      phone: payer.phone,
      email: payer.email || null,
      address: payer.address || null,
      created_at: new Date().toISOString(),
      user_id: payer.user_id || 'default-freelancer-id'
    };
    db.payers.push(newPayer);
    writeMockDB(db);
    return newPayer;
  }
  const { data, error } = await supabase
    .from('payers')
    .insert([payer])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ==========================================
// Bills API (Nested)
// ==========================================

export async function getBills(): Promise<any[]> {
  if (isMockMode) {
    const db = readMockDB();
    return db.bills
      .map((bill: any) => {
        const payer = db.payers.find((p: any) => p.id === bill.payer_id) || null;
        const lines = db.bill_lines.filter((l: any) => l.bill_id === bill.id) || [];
        return {
          ...bill,
          payers: payer,
          bill_lines: lines
        };
      })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  const { data, error } = await supabase
    .from('bills')
    .select('*, payers(*), bill_lines(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getBillById(id: string): Promise<any> {
  if (isMockMode) {
    const db = readMockDB();
    const bill = db.bills.find((b: any) => b.id === id);
    if (!bill) return null;
    const payer = db.payers.find((p: any) => p.id === bill.payer_id) || null;
    const lines = db.bill_lines.filter((l: any) => l.bill_id === bill.id) || [];
    return {
      ...bill,
      payers: payer,
      bill_lines: lines
    };
  }
  const { data, error } = await supabase
    .from('bills')
    .select('*, payers(*), bill_lines(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createBill(
  bill: {
    payer_id: string;
    due_date: string;
    levy_rate: number;
    service_fee: number;
    service_fee_settled: boolean;
    state: string;
    user_id?: string;
  },
  lines: {
    label: string;
    unit_cost: number;
    unit_charge: number;
    qty: number;
    settled: boolean;
  }[]
): Promise<any> {
  if (isMockMode) {
    const db = readMockDB();

    // Generate bill number Sequence e.g. LF-0001
    const count = db.bills.length + 1;
    const billNumber = `LF-${String(count).padStart(4, '0')}`;

    const newBill = {
      id: crypto.randomUUID(),
      bill_number: billNumber,
      payer_id: bill.payer_id,
      date: new Date().toISOString(),
      due_date: new Date(bill.due_date).toISOString(),
      levy_rate: Number(bill.levy_rate),
      service_fee: Number(bill.service_fee),
      service_fee_settled: Boolean(bill.service_fee_settled),
      state: bill.state,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: bill.user_id || 'default-freelancer-id'
    };

    const newLines = lines.map((line) => ({
      id: crypto.randomUUID(),
      bill_id: newBill.id,
      label: line.label,
      unit_cost: Number(line.unit_cost),
      unit_charge: Number(line.unit_charge),
      qty: Number(line.qty),
      settled: Boolean(line.settled)
    }));

    db.bills.push(newBill);
    db.bill_lines.push(...newLines);
    writeMockDB(db);

    return {
      ...newBill,
      payers: db.payers.find((p: any) => p.id === newBill.payer_id) || null,
      bill_lines: newLines
    };
  }

  // Insert to live Supabase
  const { data: newBill, error: billError } = await supabase
    .from('bills')
    .insert([bill])
    .select()
    .single();

  if (billError) throw billError;

  const linesToInsert = lines.map((line) => ({
    bill_id: newBill.id,
    label: line.label,
    unit_cost: line.unit_cost,
    unit_charge: line.unit_charge,
    qty: line.qty,
    settled: line.settled
  }));

  const { data: newLines, error: linesError } = await supabase
    .from('bill_lines')
    .insert(linesToInsert)
    .select();

  if (linesError) {
    // Attempt rollback
    await supabase.from('bills').delete().eq('id', newBill.id);
    throw linesError;
  }

  // Fetch complete structure
  return getBillById(newBill.id);
}

export async function updateBill(id: string, updates: any): Promise<any> {
  if (isMockMode) {
    const db = readMockDB();
    const index = db.bills.findIndex((b: any) => b.id === id);
    if (index === -1) return null;
    db.bills[index] = {
      ...db.bills[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    writeMockDB(db);
    return getBillById(id);
  }
  const { error } = await supabase
    .from('bills')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return getBillById(id);
}

export async function deleteBill(id: string): Promise<boolean> {
  if (isMockMode) {
    const db = readMockDB();
    db.bills = db.bills.filter((b: any) => b.id !== id);
    db.bill_lines = db.bill_lines.filter((l: any) => l.bill_id !== id);
    db.cashbridge_offers = db.cashbridge_offers.filter((o: any) => o.bill_id !== id);
    writeMockDB(db);
    return true;
  }
  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function updateBillLine(billId: string, lineId: string, updates: any): Promise<any> {
  if (isMockMode) {
    const db = readMockDB();
    const index = db.bill_lines.findIndex((l: any) => l.id === lineId && l.bill_id === billId);
    if (index === -1) return null;
    db.bill_lines[index] = {
      ...db.bill_lines[index],
      ...updates
    };

    // Update bill updatedAt timestamp
    const billIndex = db.bills.findIndex((b: any) => b.id === billId);
    if (billIndex !== -1) {
      db.bills[billIndex].updated_at = new Date().toISOString();
    }
    writeMockDB(db);
    return db.bill_lines[index];
  }
  const { data, error } = await supabase
    .from('bill_lines')
    .update(updates)
    .eq('id', lineId)
    .eq('bill_id', billId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ==========================================
// CashBridge Offers
// ==========================================

export async function getOffers(): Promise<any[]> {
  if (isMockMode) {
    const db = readMockDB();
    return db.cashbridge_offers;
  }
  const { data, error } = await supabase
    .from('cashbridge_offers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createOffer(offer: {
  bill_id: string;
  amount: number;
  due_date: string;
  discount_rate: number;
  payout_amount: number;
  status: string;
}): Promise<any> {
  if (isMockMode) {
    const db = readMockDB();
    const newOffer = {
      id: crypto.randomUUID(),
      ...offer,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.cashbridge_offers.push(newOffer);
    writeMockDB(db);
    return newOffer;
  }
  const { data, error } = await supabase
    .from('cashbridge_offers')
    .insert([offer])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function claimOffer(offerId: string, claimedBy: string): Promise<any> {
  if (isMockMode) {
    const db = readMockDB();
    const index = db.cashbridge_offers.findIndex((o: any) => o.id === offerId);
    if (index === -1) return null;
    db.cashbridge_offers[index] = {
      ...db.cashbridge_offers[index],
      status: 'CLAIMED',
      claimed_by: claimedBy,
      updated_at: new Date().toISOString()
    };
    writeMockDB(db);
    return db.cashbridge_offers[index];
  }
  const { data, error } = await supabase
    .from('cashbridge_offers')
    .update({ status: 'CLAIMED', claimed_by: claimedBy, updated_at: new Date().toISOString() })
    .eq('id', offerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ==========================================
// UPI Transactions API
// ==========================================

export async function getUpiTransactions(): Promise<UpiTransaction[]> {
  if (isMockMode) {
    const db = readMockDB();
    return [...db.upi_transactions].sort((a: any, b: any) => 
      new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
    );
  }
  const { data, error } = await supabase
    .from('upi_transactions')
    .select('*')
    .order('received_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createUpiTransaction(tx: Omit<UpiTransaction, 'id' | 'received_at'>): Promise<UpiTransaction> {
  if (isMockMode) {
    const db = readMockDB();
    const newTx: UpiTransaction = {
      id: crypto.randomUUID(),
      ...tx,
      received_at: new Date().toISOString(),
      user_id: tx.user_id || 'default-freelancer-id'
    };
    db.upi_transactions.push(newTx);
    writeMockDB(db);
    return newTx;
  }
  const { data, error } = await supabase
    .from('upi_transactions')
    .insert([tx])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUpiTransaction(id: string, updates: Partial<UpiTransaction>): Promise<UpiTransaction | null> {
  if (isMockMode) {
    const db = readMockDB();
    const index = db.upi_transactions.findIndex((t: any) => t.id === id);
    if (index === -1) return null;
    db.upi_transactions[index] = {
      ...db.upi_transactions[index],
      ...updates
    };
    writeMockDB(db);
    return db.upi_transactions[index];
  }
  const { data, error } = await supabase
    .from('upi_transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ==========================================
// User Authentication API
// ==========================================

export async function getUserByEmail(email: string): Promise<any | null> {
  const normEmail = email.trim().toLowerCase();
  if (isMockMode) {
    const db = readMockDB();
    return db.users.find((u: any) => u.email.trim().toLowerCase() === normEmail) || null;
  }
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', normEmail)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createUser(user: { email: string; username: string; password_hash: string }): Promise<any> {
  const newUser = {
    email: user.email.trim().toLowerCase(),
    username: user.username.trim(),
    password: user.password_hash
  };

  if (isMockMode) {
    const db = readMockDB();
    const createdUser = {
      id: crypto.randomUUID(),
      ...newUser,
      created_at: new Date().toISOString()
    };
    db.users.push(createdUser);
    writeMockDB(db);
    return createdUser;
  }
  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveOtp(email: string, otp: string): Promise<any> {
  const normEmail = email.trim().toLowerCase();
  if (isMockMode) {
    const db = readMockDB();
    const index = db.pending_otps.findIndex((o: any) => o.email === normEmail);
    const otpData = {
      email: normEmail,
      otp,
      created_at: new Date().toISOString()
    };
    if (index !== -1) {
      db.pending_otps[index] = otpData;
    } else {
      db.pending_otps.push(otpData);
    }
    writeMockDB(db);
    return otpData;
  }
  
  // Clean up any existing OTP entries for this email address to prevent duplicate keys
  await supabase.from('pending_otps').delete().eq('email', normEmail);
  
  const { data, error } = await supabase
    .from('pending_otps')
    .insert([{ email: normEmail, otp }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOtp(email: string): Promise<any | null> {
  const normEmail = email.trim().toLowerCase();
  if (isMockMode) {
    const db = readMockDB();
    return db.pending_otps.find((o: any) => o.email === normEmail) || null;
  }
  const { data, error } = await supabase
    .from('pending_otps')
    .select('*')
    .eq('email', normEmail)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteOtp(email: string): Promise<boolean> {
  const normEmail = email.trim().toLowerCase();
  if (isMockMode) {
    const db = readMockDB();
    db.pending_otps = db.pending_otps.filter((o: any) => o.email !== normEmail);
    writeMockDB(db);
    return true;
  }
  const { error } = await supabase
    .from('pending_otps')
    .delete()
    .eq('email', normEmail);
  if (error) throw error;
  return true;
}

export async function getUserById(id: string): Promise<any | null> {
  if (isMockMode) {
    const db = readMockDB();
    return db.users.find((u: any) => u.id === id) || null;
  }
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  userId: string,
  profile: { upi_id: string; payee_name: string }
): Promise<any | null> {
  if (isMockMode) {
    const db = readMockDB();
    const index = db.users.findIndex((u: any) => u.id === userId);
    if (index === -1) return null;
    db.users[index] = {
      ...db.users[index],
      upi_id: profile.upi_id,
      payee_name: profile.payee_name
    };
    writeMockDB(db);
    return db.users[index];
  }
  const { data, error } = await supabase
    .from('users')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}



