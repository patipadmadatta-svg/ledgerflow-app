-- Sequence for auto-generating bill numbers (LF-0001, LF-0002, etc.)
CREATE SEQUENCE IF NOT EXISTS bill_number_seq START 1;

-- Payers Table
CREATE TABLE IF NOT EXISTS payers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bills Table
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT NOT NULL UNIQUE DEFAULT ('LF-' || lpad(nextval('bill_number_seq')::text, 4, '0')),
  payer_id UUID NOT NULL REFERENCES payers(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  levy_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  service_fee DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  service_fee_settled BOOLEAN NOT NULL DEFAULT false,
  state TEXT NOT NULL CHECK (state IN ('DRAFT', 'ISSUED', 'PART_SETTLED', 'SETTLED', 'LAPSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bill Lines Table
CREATE TABLE IF NOT EXISTS bill_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  unit_cost DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  unit_charge DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  qty INTEGER NOT NULL DEFAULT 1,
  settled BOOLEAN NOT NULL DEFAULT false
);

-- CashBridge Offers Table
CREATE TABLE IF NOT EXISTS cashbridge_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL, -- No FK to make it compatible with external/buyer systems if needed
  amount DOUBLE PRECISION NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  discount_rate DOUBLE PRECISION NOT NULL,
  payout_amount DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CLAIMED', 'EXPIRED')),
  claimed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UPI Transactions Table
CREATE TABLE IF NOT EXISTS upi_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utr TEXT NOT NULL UNIQUE,
  payer_name TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  matched_bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  matched_line_id UUID REFERENCES bill_lines(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('UNMATCHED', 'MATCHED', 'PARTIAL_MATCH', 'IGNORED')),
  user_id TEXT DEFAULT 'default-freelancer-id'
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  upi_id TEXT,
  payee_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pending OTPs Table
CREATE TABLE IF NOT EXISTS pending_otps (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
