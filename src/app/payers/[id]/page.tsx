'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatePill from '@/components/StatePill';

export default function PayerProfilePage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [payer, setPayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const sessionStr = localStorage.getItem('ledgerflow_session');
    if (!sessionStr) {
      window.location.href = '/login';
      return;
    }
    const session = JSON.parse(sessionStr);
    const userId = session.userId;

    async function loadPayerProfile() {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/payers/${resolvedParams.id}`, {
          headers: { 'x-user-id': userId }
        });
        if (res.ok) {
          const data = await res.json();
          setPayer(data);
        } else {
          setError('Payer profile not found');
        }
      } catch (err) {
        setError('Failed to load payer profile');
      } finally {
        setLoading(false);
      }
    }

    loadPayerProfile();
  }, [params]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading payer profile...</p>
      </div>
    );
  }

  if (error || !payer) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error || 'Profile not found'}</h3>
        <Link href="/payers" className="btn btn-secondary">
          Return to Payers Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Link href="/payers" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
          &larr; Back to Payers Directory
        </Link>
      </div>

      {/* Payer Summary Card */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Space Grotesk', marginBottom: '0.5rem' }}>{payer.name}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)' }}>
            <span>Phone: {payer.phone}</span>
            {payer.email && <span>Email: {payer.email}</span>}
            {payer.address && <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>{payer.address}</span>}
          </div>
        </div>

        {/* Aggregate Debt visual */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.03)',
          border: '1px solid rgba(245, 158, 11, 0.1)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            Total Outstanding Owed
          </span>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: 'var(--color-warning)',
            fontFamily: 'Space Grotesk',
            marginTop: '0.25rem'
          }}>
            {formatCurrency(payer.totalOwed)}
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Invoices Ledger History</h3>
        
        {payer.bills && payer.bills.length > 0 ? (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Total Bill</th>
                  <th>Outstanding Dues</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payer.bills.map((bill: any) => (
                  <tr key={bill.id}>
                    <td>
                      <strong>{bill.bill_number}</strong>
                    </td>
                    <td>{formatDate(bill.date)}</td>
                    <td>{formatDate(bill.due_date)}</td>
                    <td>{formatCurrency(bill.billTotal)}</td>
                    <td style={{ color: bill.totalOutstanding > 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 500 }}>
                      {formatCurrency(bill.totalOutstanding)}
                    </td>
                    <td>
                      <StatePill state={bill.state} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/bills/${bill.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                        Open Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No bills registered for this payer yet.
          </p>
        )}
      </div>
    </div>
  );
}
