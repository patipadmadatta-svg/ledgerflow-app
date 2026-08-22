'use client';

import React, { useState } from 'react';
import SmartReminderModal from './SmartReminderModal';
import { useTranslation } from '@/lib/LanguageContext';

interface UnsettledLine {
  billId: string;
  billNumber: string;
  lineId: string;
  label: string;
  unitCharge: number;
  qty: number;
  amount: number;
  dueDate: string;
}

interface UnsettledFee {
  billId: string;
  billNumber: string;
  serviceFee: number;
  dueDate: string;
}

interface OutstandingPayer {
  payerId: string;
  payerName: string;
  phone: string;
  email?: string | null;
  unsettledLines: UnsettledLine[];
  unsettledFees: UnsettledFee[];
  totalOwed: number;
}

interface OutstandingPanelProps {
  outstandingPayers: OutstandingPayer[];
  onMutation?: () => void;
}

export default function OutstandingPanel({ outstandingPayers, onMutation }: OutstandingPanelProps) {
  const { t } = useTranslation();
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeBill, setActiveBill] = useState<any>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle settled status of a line directly
  const handleToggleLine = async (billId: string, lineId: string) => {
    setUpdating(lineId);
    try {
      const res = await fetch(`/api/bills/${billId}/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settled: true }) // Can only mark settled from outstanding panel
      });

      if (res.ok) {
        if (onMutation) onMutation();
      } else {
        alert('Failed to settle line item');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setUpdating(null);
    }
  };

  // Toggle settled status of a fee directly
  const handleToggleFee = async (billId: string) => {
    setUpdating(`fee-${billId}`);
    try {
      const res = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_fee_settled: true })
      });

      if (res.ok) {
        if (onMutation) onMutation();
      } else {
        alert('Failed to settle service fee');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <div className="glass-card" id="outstanding-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', transition: 'var(--transition-smooth)' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontSize: '1.25rem' }}>
        {t('Outstanding Dues by Payer')}
      </h3>

      {outstandingPayers.length === 0 ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          🎉 Zero outstanding dues! All bills are fully settled.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {outstandingPayers.map((payer) => (
            <div key={payer.payerId} className="outstanding-payer-card" style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              {/* Payer Header */}
              <div className="outstanding-payer-header">
                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>{payer.payerName}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{payer.phone}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Owes:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-warning)', fontFamily: 'Space Grotesk' }}>
                    {formatCurrency(payer.totalOwed)}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Unsettled Lines */}
                {payer.unsettledLines.map((line) => (
                  <div key={line.lineId} className="unsettled-item-row">
                    <div className="unsettled-item-label">
                      <input 
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleLine(line.billId, line.lineId)}
                        disabled={updating === line.lineId}
                        style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--color-success)' }}
                      />
                      <span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '0.25rem' }}>{line.billNumber}</span>
                        {line.label} <span style={{ color: 'var(--text-muted)' }}>({line.qty}x)</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due {formatDate(line.dueDate)}</span>
                      <strong style={{ minWidth: '70px', textAlign: 'right' }}>{formatCurrency(line.amount)}</strong>
                      <button
                        type="button"
                        onClick={() => setActiveBill({
                          id: line.billId,
                          bill_number: line.billNumber,
                          due_date: line.dueDate,
                          billTotal: line.amount,
                          totalOutstanding: line.amount,
                          daysOverdue: Math.max(0, Math.floor((new Date().getTime() - new Date(line.dueDate).getTime()) / (1000 * 60 * 60 * 24))),
                          payers: { name: payer.payerName, phone: payer.phone }
                        })}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.95rem', padding: '0 2px' }}
                        title="Send Smart Reminder"
                      >
                        💬
                      </button>
                    </div>
                  </div>
                ))}

                {/* Unsettled Fees */}
                {payer.unsettledFees.map((fee) => (
                  <div key={`fee-${fee.billId}`} className="unsettled-item-row">
                    <div className="unsettled-item-label">
                      <input 
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleFee(fee.billId)}
                        disabled={updating === `fee-${fee.billId}`}
                        style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--color-success)' }}
                      />
                      <span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '0.25rem' }}>{fee.billNumber}</span>
                        Labor Service Fee
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due {formatDate(fee.dueDate)}</span>
                      <strong style={{ minWidth: '70px', textAlign: 'right', color: 'var(--text-primary)' }}>
                        {formatCurrency(fee.serviceFee)}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setActiveBill({
                          id: fee.billId,
                          bill_number: fee.billNumber,
                          due_date: fee.dueDate,
                          billTotal: fee.serviceFee,
                          totalOutstanding: fee.serviceFee,
                          daysOverdue: Math.max(0, Math.floor((new Date().getTime() - new Date(fee.dueDate).getTime()) / (1000 * 60 * 60 * 24))),
                          payers: { name: payer.payerName, phone: payer.phone }
                        })}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.95rem', padding: '0 2px' }}
                        title="Send Smart Reminder"
                      >
                        💬
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
      {activeBill && (
        <SmartReminderModal
          bill={activeBill}
          onClose={() => setActiveBill(null)}
        />
      )}
    </>
  );
}
