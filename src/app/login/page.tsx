'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/LanguageContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [payers, setPayers] = useState<any[]>([]);

  // Fetch payers list on mount to check credentials
  useEffect(() => {
    const fetchPayers = async () => {
      try {
        const res = await fetch('/api/payers');
        if (res.ok) {
          const data = await res.json();
          setPayers(data);
        }
      } catch (err) {
        console.error('Failed to load payers:', err);
      }
    };
    fetchPayers();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) {
      setError(t('Email or Phone number is required'));
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const normCred = credential.trim().toLowerCase();

      // Check if matches any payer's phone or email
      const matchedPayer = payers.find((p: any) => {
        const phoneMatch = p.phone && p.phone.trim() === normCred;
        const emailMatch = p.email && p.email.trim().toLowerCase() === normCred;
        return phoneMatch || emailMatch;
      });

      if (matchedPayer) {
        // Save Client Payer Session
        const session = {
          role: 'client',
          payerId: matchedPayer.id,
          name: matchedPayer.name,
          phone: matchedPayer.phone,
          email: matchedPayer.email
        };
        localStorage.setItem('ledgerflow_session', JSON.stringify(session));
        window.dispatchEvent(new Event('storage')); // Notify layouts
        router.push('/client-portal');
      } else {
        // Default to Freelancer Session
        const session = {
          role: 'freelancer',
          name: 'Independent Freelancer',
          email: credential.includes('@') ? normCred : 'freelancer@ledgerflow.com'
        };
        localStorage.setItem('ledgerflow_session', JSON.stringify(session));
        window.dispatchEvent(new Event('storage')); // Notify layouts
        router.push('/dashboard');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginBottom: '0.5rem', color: 'white' }}>
            LedgerFlow
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('Billing ledger & automated reconciliation engine')}
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {t('Login with Email or Phone Number')}
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp / john@doe.com / 9876543210"
              className="input-control"
              value={credential}
              onChange={e => setCredential(e.target.value)}
              style={{
                padding: '0.75rem',
                fontSize: '0.9rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'white'
              }}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', margin: 0 }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0.75rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            disabled={loading}
          >
            {loading ? t('Logging in...') : t('Sign In')}
          </button>
        </form>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
            💡 Demo Guidelines:
          </p>
          <p>
            Enter any active client's email/phone to open their **Client Portal**.<br/>
            Enter anything else to log in as the **Freelancer Dashboard**.
          </p>
        </div>
      </div>
    </div>
  );
}
