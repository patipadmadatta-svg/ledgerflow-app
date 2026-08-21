'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Payer {
  id: string;
  name: string;
  phone: string;
}

export default function BillComposer() {
  const router = useRouter();
  const [payers, setPayers] = useState<Payer[]>([]);
  const [loadingPayers, setLoadingPayers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [payerId, setPayerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [levyRate, setLevyRate] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [state, setState] = useState<'DRAFT' | 'ISSUED'>('ISSUED');
  
  // Lines list state
  const [lines, setLines] = useState<Array<{
    label: string;
    unit_cost: number;
    unit_charge: number;
    qty: number;
    settled: boolean;
  }>>([
    { label: '', unit_cost: 0, unit_charge: 0, qty: 1, settled: false }
  ]);

  // Inline Payer creation state
  const [showInlinePayerForm, setShowInlinePayerForm] = useState(false);
  const [newPayerName, setNewPayerName] = useState('');
  const [newPayerPhone, setNewPayerPhone] = useState('');
  const [newPayerEmail, setNewPayerEmail] = useState('');
  const [newPayerAddress, setNewPayerAddress] = useState('');
  const [creatingPayer, setCreatingPayer] = useState(false);
  const [payerError, setPayerError] = useState('');

  // Fetch payers
  useEffect(() => {
    async function loadPayers() {
      try {
        const res = await fetch('/api/payers');
        if (res.ok) {
          const data = await res.json();
          setPayers(data);
          if (data.length > 0) {
            setPayerId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load payers:', err);
      } finally {
        setLoadingPayers(false);
      }
    }

    // Default due date to 14 days from now
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    setDueDate(defaultDue.toISOString().split('T')[0]);

    loadPayers();
  }, []);

  const handleAddLine = () => {
    setLines([...lines, { label: '', unit_cost: 0, unit_charge: 0, qty: 1, settled: false }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setLines(updated);
  };

  const handleCreatePayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayerName || !newPayerPhone) {
      setPayerError('Name and phone are required');
      return;
    }
    setCreatingPayer(true);
    setPayerError('');
    try {
      const res = await fetch('/api/payers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPayerName,
          phone: newPayerPhone,
          email: newPayerEmail || null,
          address: newPayerAddress || null
        })
      });
      if (res.ok) {
        const created = await res.json();
        setPayers([created, ...payers]);
        setPayerId(created.id);
        setShowInlinePayerForm(false);
        setNewPayerName('');
        setNewPayerPhone('');
        setNewPayerEmail('');
        setNewPayerAddress('');
      } else {
        const errData = await res.json();
        setPayerError(errData.error || 'Failed to create payer');
      }
    } catch (err) {
      setPayerError('Failed to save payer.');
    } finally {
      setCreatingPayer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerId) {
      alert('Please select a payer');
      return;
    }

    // Validate lines
    const validLines = lines.filter(l => l.label.trim() !== '');
    if (validLines.length === 0) {
      alert('Please specify at least one item line with a description label');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer_id: payerId,
          due_date: new Date(dueDate).toISOString(),
          levy_rate: Number(levyRate),
          service_fee: Number(serviceFee),
          service_fee_settled: false,
          state,
          bill_lines: validLines.map(l => ({
            label: l.label,
            unit_cost: Number(l.unit_cost),
            unit_charge: Number(l.unit_charge),
            qty: Number(l.qty),
            settled: Boolean(l.settled)
          }))
        })
      });

      if (res.ok) {
        const createdBill = await res.json();
        router.push(`/dashboard`);
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to save bill'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Math totals for preview
  const lineRevenue = lines.reduce((acc, l) => acc + (Number(l.unit_charge || 0) * Number(l.qty || 0)), 0);
  const lineCost = lines.reduce((acc, l) => acc + (Number(l.unit_cost || 0) * Number(l.qty || 0)), 0);
  const margin = lineRevenue - lineCost;
  const levyAmount = lineRevenue * (Number(levyRate || 0) / 100);
  const billTotal = lineRevenue + Number(serviceFee || 0) + levyAmount;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
      {/* Compose Form */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          Create New Bill
        </h2>

        {/* Payer Selector */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Select Payer</label>
            <button 
              type="button" 
              onClick={() => setShowInlinePayerForm(!showInlinePayerForm)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {showInlinePayerForm ? 'Cancel New Payer' : '+ Create Payer Inline'}
            </button>
          </div>

          {showInlinePayerForm ? (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <h4 style={{ fontSize: '0.95rem' }}>New Payer Details</h4>
              {payerError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{payerError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  placeholder="Payer Name *"
                  className="input-control"
                  value={newPayerName}
                  onChange={e => setNewPayerName(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Phone Number *"
                  className="input-control"
                  value={newPayerPhone}
                  onChange={e => setNewPayerPhone(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                <input 
                  type="email" 
                  placeholder="Email Address (Optional)"
                  className="input-control"
                  value={newPayerEmail}
                  onChange={e => setNewPayerEmail(e.target.value)}
                />
                <textarea 
                  placeholder="Physical Address (Optional)"
                  className="input-control"
                  rows={2}
                  value={newPayerAddress}
                  onChange={e => setNewPayerAddress(e.target.value)}
                />
              </div>
              <button 
                type="button" 
                onClick={handleCreatePayer}
                disabled={creatingPayer}
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-end' }}
              >
                {creatingPayer ? 'Creating...' : 'Save & Select Payer'}
              </button>
            </div>
          ) : (
            <select 
              className="input-control"
              style={{ width: '100%' }}
              value={payerId}
              onChange={e => setPayerId(e.target.value)}
              disabled={loadingPayers}
            >
              {loadingPayers ? (
                <option>Loading payers list...</option>
              ) : payers.length === 0 ? (
                <option value="">No payers available. Create one first.</option>
              ) : (
                payers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                ))
              )}
            </select>
          )}
        </div>

        {/* Date and State */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Due Date</label>
            <input 
              type="date" 
              className="input-control"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Initial State</label>
            <select 
              className="input-control"
              value={state}
              onChange={e => setState(e.target.value as any)}
            >
              <option value="ISSUED">ISSUED</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>
        </div>

        {/* Fees and Levy */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Levy Rate (%)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="input-control"
              value={levyRate}
              onChange={e => setLevyRate(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Service Fee (₹)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="input-control"
              value={serviceFee}
              onChange={e => setServiceFee(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Line Items Builder */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Line Items</label>
            <button 
              type="button" 
              onClick={handleAddLine} 
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.6rem' }}
            >
              + Add Line
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lines.map((line, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr 80px 40px', 
                  gap: '0.5rem', 
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.5rem'
                }}
              >
                <input 
                  type="text" 
                  placeholder="Item label / description" 
                  className="input-control"
                  style={{ padding: '0.5rem' }}
                  value={line.label}
                  onChange={e => handleLineChange(index, 'label', e.target.value)}
                  required
                />
                <input 
                  type="number" 
                  placeholder="Cost/unit" 
                  min="0"
                  step="0.01"
                  className="input-control"
                  style={{ padding: '0.5rem' }}
                  value={line.unit_cost || ''}
                  onChange={e => handleLineChange(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                />
                <input 
                  type="number" 
                  placeholder="Charge/unit" 
                  min="0"
                  step="0.01"
                  className="input-control"
                  style={{ padding: '0.5rem' }}
                  value={line.unit_charge || ''}
                  onChange={e => handleLineChange(index, 'unit_charge', parseFloat(e.target.value) || 0)}
                />
                <input 
                  type="number" 
                  placeholder="Qty" 
                  min="1"
                  className="input-control"
                  style={{ padding: '0.5rem' }}
                  value={line.qty || ''}
                  onChange={e => handleLineChange(index, 'qty', parseInt(e.target.value) || 1)}
                />
                <button 
                  type="button" 
                  onClick={() => handleRemoveLine(index)}
                  disabled={lines.length === 1}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    opacity: lines.length === 1 ? 0.3 : 1
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ flex: 1 }}
            disabled={submitting}
          >
            {submitting ? 'Saving Invoice...' : 'Save & Issue Invoice'}
          </button>
          <button 
            type="button" 
            onClick={() => router.push('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Real-time preview card */}
      <div className="glass-card" style={{ position: 'sticky', top: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
          Live Total Estimations
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Line Revenue:</span>
            <strong>₹ {lineRevenue.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Line Cost:</span>
            <strong style={{ color: 'var(--color-danger)' }}>₹ {lineCost.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Estimated Margin:</span>
            <strong style={{ color: 'var(--color-success)' }}>₹ {margin.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Levy Tax ({levyRate}%):</span>
            <strong style={{ color: 'var(--color-warning)' }}>₹ {levyAmount.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Labor Service Fee:</span>
            <strong>₹ {serviceFee.toFixed(2)}</strong>
          </div>
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '1rem', 
            borderTop: '1px solid var(--border-color)',
            fontSize: '1.2rem'
          }}>
            <span>Total Bill:</span>
            <strong style={{ color: 'var(--color-primary)' }}>₹ {billTotal.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
