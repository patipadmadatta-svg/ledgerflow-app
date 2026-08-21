'use client';

import React, { useState } from 'react';
import StatePill from './StatePill';

interface Payer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
}

interface BillLine {
  id: string;
  bill_id: string;
  label: string;
  unit_cost: number;
  unit_charge: number;
  qty: number;
  settled: boolean;
}

interface Bill {
  id: string;
  bill_number: string;
  payer_id: string;
  date: string;
  due_date: string;
  levy_rate: number;
  service_fee: number;
  service_fee_settled: boolean;
  state: 'DRAFT' | 'ISSUED' | 'PART_SETTLED' | 'SETTLED' | 'LAPSED';
  payers?: Payer | null;
  bill_lines?: BillLine[];
  lineRevenue: number;
  lineCost: number;
  margin: number;
  levyAmount: number;
  billTotal: number;
  outstandingLines: number;
  outstandingFee: number;
  totalOutstanding: number;
}

interface BillViewProps {
  initialBill: Bill;
  onMutation?: () => void;
}

export default function BillView({ initialBill, onMutation }: BillViewProps) {
  const [bill, setBill] = useState<Bill>(initialBill);
  const [updating, setUpdating] = useState<string | null>(null);

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

  // Toggle settled status of a line
  const handleToggleLineSettled = async (lineId: string, currentSettled: boolean) => {
    setUpdating(lineId);
    try {
      const res = await fetch(`/api/bills/${bill.id}/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settled: !currentSettled })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local bill state with recalculated totals returned from API
        setBill(data.bill);
        if (onMutation) onMutation();
      } else {
        alert('Failed to update line status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating line');
    } finally {
      setUpdating(null);
    }
  };

  // Toggle settled status of the service fee
  const handleToggleFeeSettled = async () => {
    setUpdating('service-fee');
    try {
      const res = await fetch(`/api/bills/${bill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_fee_settled: !bill.service_fee_settled })
      });

      if (res.ok) {
        const updatedBill = await res.json();
        setBill(updatedBill);
        if (onMutation) onMutation();
      } else {
        alert('Failed to update service fee status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating service fee');
    } finally {
      setUpdating(null);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async () => {
    if (!confirm(`Are you sure you want to delete invoice ${bill.bill_number}?`)) return;
    try {
      const res = await fetch(`/api/bills/${bill.id}`, { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        alert('Failed to delete invoice');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting invoice');
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Invoice Top Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontFamily: 'Space Grotesk' }}>Invoice {bill.bill_number}</h2>
            <StatePill state={bill.state} />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Created on {formatDate(bill.date)}</p>
          <p style={{ color: bill.state === 'LAPSED' ? 'var(--color-danger)' : 'var(--text-secondary)', fontWeight: 500 }}>
            Due Date: {formatDate(bill.due_date)} {bill.state === 'LAPSED' && '(OVERDUE)'}
          </p>
        </div>
        <button onClick={handleDeleteInvoice} className="btn btn-danger btn-sm">
          Delete Invoice
        </button>
      </div>

      {/* Payer and Ledger Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Billed To
          </h4>
          {bill.payers ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>{bill.payers.name}</strong>
              <span style={{ color: 'var(--text-secondary)' }}>Phone: {bill.payers.phone}</span>
              {bill.payers.email && <span style={{ color: 'var(--text-secondary)' }}>Email: {bill.payers.email}</span>}
              {bill.payers.address && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{bill.payers.address}</span>}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Payer details unavailable.</p>
          )}
        </div>

        {/* Ledger Dues quick-stats */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Outstanding Dues Checklist</h4>
          
          {/* Service Fee Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
            <span>Labor/Service Fee ({formatCurrency(bill.service_fee)})</span>
            <label className="toggle-settled-container">
              <input 
                type="checkbox"
                checked={bill.service_fee_settled}
                onChange={handleToggleFeeSettled}
                disabled={updating === 'service-fee'}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-success)' }}
              />
              <span style={{ color: bill.service_fee_settled ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 500, fontSize: '0.85rem' }}>
                {bill.service_fee_settled ? 'Paid' : 'Unpaid'}
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Outstanding:</span>
            <strong style={{ color: bill.totalOutstanding > 0 ? 'var(--color-warning)' : 'var(--color-success)', fontSize: '1.1rem' }}>
              {formatCurrency(bill.totalOutstanding)}
            </strong>
          </div>
        </div>
      </div>

      {/* Bill Lines Table */}
      <div>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>Line Items Ledger</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Label</th>
                <th>Cost/Unit</th>
                <th>Charge/Unit</th>
                <th>Qty</th>
                <th>Margin</th>
                <th>Total</th>
                <th style={{ textAlign: 'center' }}>Mark Paid</th>
              </tr>
            </thead>
            <tbody>
              {bill.bill_lines && bill.bill_lines.length > 0 ? (
                bill.bill_lines.map((line) => {
                  const lineRev = line.unit_charge * line.qty;
                  const lineCost = line.unit_cost * line.qty;
                  const lineMargin = lineRev - lineCost;
                  return (
                    <tr key={line.id} style={{ opacity: line.settled ? 0.7 : 1 }}>
                      <td>
                        <strong style={{ display: 'block' }}>{line.label}</strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(line.unit_cost)}</td>
                      <td>{formatCurrency(line.unit_charge)}</td>
                      <td>{line.qty}</td>
                      <td style={{ color: lineMargin >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {formatCurrency(lineMargin)}
                      </td>
                      <td><strong>{formatCurrency(lineRev)}</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={line.settled}
                          onChange={() => handleToggleLineSettled(line.id, line.settled)}
                          disabled={updating === line.id}
                          style={{ 
                            width: '18px', 
                            height: '18px', 
                            cursor: 'pointer',
                            accentColor: 'var(--color-success)'
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No lines in this bill.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Totals Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Line Revenue:</span>
            <span>{formatCurrency(bill.lineRevenue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Line Cost:</span>
            <span style={{ color: 'var(--color-danger)' }}>{formatCurrency(bill.lineCost)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Margin (Profit):</span>
            <span style={{ color: 'var(--color-success)' }}>{formatCurrency(bill.margin)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Levy Tax ({bill.levy_rate}%):</span>
            <span>{formatCurrency(bill.levyAmount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Service Labor Fee:</span>
            <span>{formatCurrency(bill.service_fee)}</span>
          </div>
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: '0.75rem',
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}>
            <span>Total Bill:</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(bill.billTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
