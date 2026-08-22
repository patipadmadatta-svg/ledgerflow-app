'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/LanguageContext';

export default function ClientPortal() {
  const { t } = useTranslation();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  const checkSession = () => {
    const sessionStr = localStorage.getItem('ledgerflow_session');
    if (!sessionStr) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(sessionStr);
    if (parsed.role !== 'client') {
      router.push('/dashboard');
      return;
    }
    setSession(parsed);
  };

  const fetchClientBills = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/bills');
      if (res.ok) {
        const allBills = await res.json();
        // Filter to only bills belonging to this logged-in client
        const clientBills = allBills.filter((b: any) => b.payer_id === session.payerId);
        setBills(clientBills);
      }
    } catch (err) {
      console.error('Failed to load bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    // Re-verify session shifts
    const handleStorageChange = () => checkSession();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (session) {
      fetchClientBills();
    }
  }, [session]);

  const handlePayInvoice = async (bill: any) => {
    if (payingBillId || bill.totalOutstanding <= 0) return;

    setPayingBillId(bill.id);
    const randomUtr = 'UPI' + Math.floor(100000000000 + Math.random() * 900000000000);

    try {
      const res = await fetch('/api/upi/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: randomUtr,
          payerName: session.name,
          amount: bill.totalOutstanding
        })
      });

      if (res.ok) {
        alert(t('Payment successful! UPI Bank Alert received, transaction reconciled.'));
        await fetchClientBills();
      } else {
        const data = await res.json();
        alert(data.error || 'Payment failed');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while processing payment');
    } finally {
      setPayingBillId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading || !session) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
        {t('Loading Client Session...')}
      </div>
    );
  }

  // Aggregate stats
  const totalOwed = bills.reduce((acc, b) => acc + (b.totalOutstanding || 0), 0);
  const unpaidCount = bills.filter(b => b.totalOutstanding > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
      
      {/* Welcome banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>
            {t('Welcome')}, {session.name}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {t('Review and settle your outstanding invoices using instant UPI payments.')}
          </p>
        </div>
        <div style={{
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'var(--color-success)',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          🛡️ {t('Secure Client Session')}
        </div>
      </div>

      {/* Summary grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('Total Outstanding Balance')}</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: totalOwed > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {formatCurrency(totalOwed)}
          </span>
        </div>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('Unpaid Invoices')}</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: unpaidCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {unpaidCount}
          </span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: 'white' }}>
          📄 {t('Your Invoices')}
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t('Invoice Number')}</th>
                <th>{t('Billed Date')}</th>
                <th>{t('Due Date')}</th>
                <th>{t('Status')}</th>
                <th>{t('Outstanding')}</th>
                <th style={{ textAlign: 'right' }}>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No invoices have been billed to your account.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <strong style={{ color: 'white' }}>{bill.bill_number}</strong>
                    </td>
                    <td>{formatDate(bill.date)}</td>
                    <td>
                      <span style={{ color: bill.totalOutstanding > 0 && new Date(bill.due_date) < new Date() ? 'var(--color-danger)' : 'inherit' }}>
                        {formatDate(bill.due_date)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: bill.totalOutstanding <= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: bill.totalOutstanding <= 0 ? 'var(--color-success)' : 'var(--color-warning)',
                        border: bill.totalOutstanding <= 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)'
                      }}>
                        {bill.totalOutstanding <= 0 ? 'PAID' : bill.state}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      {formatCurrency(bill.totalOutstanding)}
                      {bill.lateFees > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.15rem' }}>
                          + {formatCurrency(bill.lateFees)} {t('Late Fee')}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {bill.totalOutstanding > 0 ? (
                        <button
                          type="button"
                          onClick={() => handlePayInvoice(bill)}
                          disabled={payingBillId === bill.id}
                          className="btn btn-primary btn-sm"
                          style={{
                            padding: '0.35rem 0.8rem',
                            fontSize: '0.8rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          {payingBillId === bill.id ? t('Paying...') : t('Pay Invoice')}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('Paid & Settled')}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
