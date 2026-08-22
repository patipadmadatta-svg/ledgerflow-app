'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StatePill from './StatePill';
import { useTranslation } from '@/lib/LanguageContext';

interface Payer {
  id: string;
  name: string;
}

interface Bill {
  id: string;
  bill_number: string;
  payer_id: string;
  date: string;
  due_date: string;
  billTotal: number;
  totalOutstanding: number;
  state: 'DRAFT' | 'ISSUED' | 'PART_SETTLED' | 'SETTLED' | 'LAPSED';
  payers?: Payer | null;
}

interface BillLedgerProps {
  bills: Bill[];
}

export default function BillLedger({ bills }: BillLedgerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

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

  // Filter bills
  const filteredBills = bills.filter(bill => {
    const payerName = bill.payers?.name?.toLowerCase() || '';
    const billNum = bill.bill_number?.toLowerCase() || '';
    const term = search.toLowerCase();

    const matchesSearch = payerName.includes(term) || billNum.includes(term);
    const matchesFilter = stateFilter === 'ALL' || bill.state === stateFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Ledger Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem' }}>{t('Invoice Ledger')}</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <input 
            type="text"
            placeholder={t('Search by Bill # or Payer...')}
            className="input-control"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', width: '220px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Filter dropdown */}
          <select
            className="input-control"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', cursor: 'pointer' }}
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
          >
            <option value="ALL">{t('All States')}</option>
            <option value="DRAFT">{t('Draft')}</option>
            <option value="ISSUED">{t('Issued')}</option>
            <option value="PART_SETTLED">{t('Part Paid')}</option>
            <option value="SETTLED">{t('Fully Paid')}</option>
            <option value="LAPSED">{t('Overdue')}</option>
          </select>

          {/* Add Bill Button */}
          <Link href="/bills/new" className="btn btn-primary btn-sm">
            + {t('New Bill')}
          </Link>
        </div>
      </div>

      {/* Bills Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Bill #</th>
              <th>Payer</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Total Bill</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length > 0 ? (
              filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td>
                    <strong>{bill.bill_number}</strong>
                  </td>
                  <td>{bill.payers?.name || 'Unknown'}</td>
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
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No bills found matching search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
