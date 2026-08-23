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
  const [showShareForm, setShowShareForm] = useState(false);
  const [sharePhone, setSharePhone] = useState('');

  useEffect(() => {
    const sessionStr = localStorage.getItem('ledgerflow_session');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    const userId = session.userId;

    async function loadDbProfile() {
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { 'x-user-id': userId }
        });
        if (res.ok) {
          const data = await res.json();
          setUpiId(data.upiId || `${session.name.toLowerCase()}@upi`);
          setPayeeName(data.payeeName || session.name);
          localStorage.setItem('ledgerflow_upi_config', JSON.stringify({
            upiId: data.upiId || `${session.name.toLowerCase()}@upi`,
            payeeName: data.payeeName || session.name
          }));
        } else {
          // Fallback to local
          const savedConfigStr = localStorage.getItem('ledgerflow_upi_config');
          if (savedConfigStr) {
            const saved = JSON.parse(savedConfigStr);
            setUpiId(saved.upiId || `${session.name.toLowerCase()}@upi`);
            setPayeeName(saved.payeeName || session.name);
          } else {
            setUpiId(`${session.name.toLowerCase()}@upi`);
            setPayeeName(session.name);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadDbProfile();
  }, []);

  const handleStartEdit = () => {
    setTempUpi(upiId);
    setTempName(payeeName);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUpi.trim() || !tempUpi.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    if (!tempName.trim()) {
      alert('Payee Name is required');
      return;
    }

    const sessionStr = localStorage.getItem('ledgerflow_session');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    const userId = session.userId;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          upiId: tempUpi.trim(),
          payeeName: tempName.trim()
        })
      });

      if (res.ok) {
        setUpiId(tempUpi.trim());
        setPayeeName(tempName.trim());
        setEditing(false);
        localStorage.setItem(
          'ledgerflow_upi_config',
          JSON.stringify({ upiId: tempUpi.trim(), payeeName: tempName.trim() })
        );
      } else {
        alert('Failed to save profile on server. Keeping local version.');
        setUpiId(tempUpi.trim());
        setPayeeName(tempName.trim());
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Profile saved locally.');
      setUpiId(tempUpi.trim());
      setPayeeName(tempName.trim());
      setEditing(false);
    }
  };

  const handleShareWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharePhone.trim()) {
      alert('Please enter a valid phone number');
      return;
    }
    
    let cleanPhone = sharePhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const qrImageLink = `https://quickchart.io/qr?text=${encodeURIComponent(upiUri)}&width=250&height=250`;
    const messageText = `Hi!\n\nHere is my payment QR Code:\n${qrImageLink}\n\n👤 *Payee Name*: ${payeeName}\n💳 *UPI ID (VPA)*: ${upiId}\n\n🔗 *Pay Directly via UPI Link*:\n${upiUri}\n\nThank you!`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
    setShowShareForm(false);
    setSharePhone('');
  };

  // Generate UPI payment URL
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR`;
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiUri)}&width=180&height=180`;

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
            width: '100%',
            marginBottom: '0.25rem'
          }}>
            Clients can scan this QR to pay you directly via GPay, PhonePe, or Paytm.
          </div>

          {!showShareForm ? (
            <button
              type="button"
              onClick={() => setShowShareForm(true)}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                border: '1px solid #25D366',
                color: '#25D366',
                background: 'transparent',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.4rem 0'
              }}
            >
              💬 {t('Share Payment Details')}
            </button>
          ) : (
            <form onSubmit={handleShareWhatsApp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Client Phone (e.g. 9876543210)"
                className="input-control"
                value={sharePhone}
                onChange={e => setSharePhone(e.target.value)}
                style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                required
              />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '0.35rem 0', fontSize: '0.8rem', background: '#25D366', border: 'none', color: 'white' }}>
                  Send VPA
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowShareForm(false)} style={{ flex: 1, padding: '0.35rem 0', fontSize: '0.8rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
