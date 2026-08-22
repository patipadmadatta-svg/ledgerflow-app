'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/LanguageContext';

export default function UpiProfileCard() {
  const { t } = useTranslation();
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [editing, setEditing] = useState(false);
  const [tempUpi, setTempUpi] = useState('');
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    // Load config from localStorage
    const sessionStr = localStorage.getItem('ledgerflow_session');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);

    const savedConfigStr = localStorage.getItem('ledgerflow_upi_config');
    if (savedConfigStr) {
      const saved = JSON.parse(savedConfigStr);
      setUpiId(saved.upiId || `${session.name.toLowerCase()}@upi`);
      setPayeeName(saved.payeeName || session.name);
    } else {
      const defaultUpi = `${session.name.toLowerCase()}@upi`;
      const defaultName = session.name;
      setUpiId(defaultUpi);
      setPayeeName(defaultName);
      localStorage.setItem(
        'ledgerflow_upi_config',
        JSON.stringify({ upiId: defaultUpi, payeeName: defaultName })
      );
    }
  }, []);

  const handleStartEdit = () => {
    setTempUpi(upiId);
    setTempName(payeeName);
    setEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUpi.trim() || !tempUpi.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    if (!tempName.trim()) {
      alert('Payee Name is required');
      return;
    }

    setUpiId(tempUpi.trim());
    setPayeeName(tempName.trim());
    setEditing(false);

    localStorage.setItem(
      'ledgerflow_upi_config',
      JSON.stringify({ upiId: tempUpi.trim(), payeeName: tempName.trim() })
    );
  };

  // Generate UPI payment URL
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>
          ⚡ {t('Your Payment QR Code')}
        </h3>
        {!editing && (
          <button 
            type="button" 
            onClick={handleStartEdit}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'underline'
            }}
          >
            {t('Edit')}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>UPI ID (VPA)</label>
            <input 
              type="text" 
              className="input-control" 
              value={tempUpi}
              onChange={e => setTempUpi(e.target.value)}
              placeholder="e.g. test@upi"
              style={{ padding: '0.5rem', fontSize: '0.85rem' }}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payee Name</label>
            <input 
              type="text" 
              className="input-control" 
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              placeholder="e.g. John Doe"
              style={{ padding: '0.5rem', fontSize: '0.85rem' }}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '0.35rem 0' }}>
              Save
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={() => setEditing(false)}
              style={{ flex: 1, padding: '0.35rem 0' }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'white',
            padding: '0.75rem',
            borderRadius: '12px',
            display: 'inline-flex',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={qrCodeUrl} 
              alt="UPI QR Code" 
              style={{ width: '150px', height: '150px', display: 'block' }}
            />
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600, color: 'white' }}>{payeeName}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
              {upiId}
            </div>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            borderTop: '1px dashed var(--border-color)',
            paddingTop: '0.5rem',
            width: '100%'
          }}>
            Clients can scan this QR to pay you directly via GPay, PhonePe, or Paytm.
          </div>
        </div>
      )}
    </div>
  );
}
