'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/LanguageContext';

interface UpiTransaction {
  id: string;
  utr: string;
  payer_name: string;
  amount: number;
  received_at: string;
  matched_bill_id?: string | null;
  matched_line_id?: string | null;
  status: 'UNMATCHED' | 'MATCHED' | 'PARTIAL_MATCH' | 'IGNORED';
}

interface UpiReconcilePanelProps {
  bills: any[];
  onMutation: () => void;
}

export default function UpiReconcilePanel({ bills, onMutation }: UpiReconcilePanelProps) {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<UpiTransaction[]>([]);
  const [simName, setSimName] = useState('');
  const [simAmount, setSimAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [matchingTxId, setMatchingTxId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/upi/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [bills]);

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simAmount || submitting) return;

    setSubmitting(true);
    const amountVal = Number(simAmount);
    // Generate a mock UTR
    const randomUtr = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);

    try {
      const res = await fetch('/api/upi/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: randomUtr,
          payerName: simName.trim(),
          amount: amountVal
        })
      });

      if (res.ok) {
        setSimName('');
        setSimAmount('');
        await fetchTransactions();
        onMutation(); // Trigger main dashboard update
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to simulate payment');
      }
    } catch (error) {
      console.error(error);
      alert('Error simulating payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualMatch = async (transactionId: string, matchedBillId: string) => {
    if (!matchedBillId) return;

    setMatchingTxId(transactionId);
    try {
      // Find bill to check if it has a service fee or lines
      const bill = bills.find((b: any) => b.id === matchedBillId);
      const matchedLineId = bill?.bill_lines?.find((l: any) => !l.settled)?.id || null;
      const settleServiceFee = !bill?.service_fee_settled && bill?.service_fee > 0;

      const res = await fetch(`/api/upi/transactions/${transactionId}/manual-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchedBillId,
          matchedLineId,
          settleServiceFee
        })
      });

      if (res.ok) {
        await fetchTransactions();
        onMutation(); // Refetch dashboard
      } else {
        alert('Failed to link transaction');
      }
    } catch (err) {
      console.error(err);
      alert('Error linking transaction');
    } finally {
      setMatchingTxId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  // Helper to format date cleanly
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' (' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ')';
  };

  // Filter out draft and fully settled bills for manual match selection
  const unsettledBills = bills.filter(b => b.state !== 'DRAFT' && b.state !== 'SETTLED');

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'Space Grotesk' }}>
          📱 {t('UPI Real-Time Reconciliation')}
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {t('Auto-matches incoming bank alerts to invoice line costs')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }} className="upi-reconcile-grid">
        
        {/* Transactions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {t('Incoming Transaction Stream')}
          </h4>
          <div className="table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>{t('UTR / Payer')}</th>
                  <th>{t('Amount')}</th>
                  <th>{t('Status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No incoming transactions. Use simulation panel to test.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <div style={{ fontWeight: 'bold', color: 'white' }}>{tx.utr}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {tx.payer_name} • {formatDate(tx.received_at)}
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(tx.amount)}</td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: tx.status === 'MATCHED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: tx.status === 'MATCHED' ? 'var(--color-success)' : 'var(--color-danger)',
                          border: tx.status === 'MATCHED' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {tx.status === 'UNMATCHED' ? (
                          <select
                            onChange={(e) => handleManualMatch(tx.id, e.target.value)}
                            disabled={matchingTxId === tx.id}
                            className="input-control"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              width: '120px',
                              cursor: 'pointer',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px'
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled style={{ background: '#09090e' }}>Link Bill...</option>
                            {unsettledBills.map((b) => (
                              <option key={b.id} value={b.id} style={{ background: '#09090e', color: 'white' }}>
                                {b.bill_number} ({b.payers?.name})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matched</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Simulator form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            ⚡ Live Bank Simulator
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
            Simulate a bank webhook event of a UPI payment. Auto-reconciliation matches the sender and charge to settle the invoice instantly.
          </p>

          <form onSubmit={handleSimulatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Sender Name (UPI Display Note)</label>
              <input
                type="text"
                placeholder="e.g. Padmadatta Pati"
                className="input-control"
                style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                value={simName}
                onChange={e => setSimName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Received Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                className="input-control"
                style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                value={simAmount}
                onChange={e => setSimAmount(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm"
              style={{
                width: '100%',
                padding: '0.55rem',
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                marginTop: '0.25rem',
                fontWeight: 600
              }}
            >
              {submitting ? 'Processing Alert...' : 'Simulate UPI Payment'}
            </button>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @media (max-width: 900px) {
          .upi-reconcile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
