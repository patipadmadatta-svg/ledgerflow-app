'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/LanguageContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to generate deterministic private user ID from email address
  const getUserIdFromEmail = (emailStr: string) => {
    const cleaned = emailStr.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = (hash << 5) - hash + cleaned.charCodeAt(i);
      hash |= 0;
    }
    return 'usr-' + Math.abs(hash);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t('Email address is required'));
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const cleanedEmail = email.trim();
      const userId = getUserIdFromEmail(cleanedEmail);
      const name = cleanedEmail.includes('@') ? cleanedEmail.split('@')[0] : cleanedEmail;

      // Store active session
      const session = {
        role: 'freelancer',
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: cleanedEmail.toLowerCase(),
        userId: userId
      };

      localStorage.setItem('ledgerflow_session', JSON.stringify(session));
      window.dispatchEvent(new Event('storage')); // Notify header controls
      router.push('/dashboard');
      setLoading(false);
    }, 400);
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
        maxWidth: '400px',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Space Grotesk', marginBottom: '0.5rem', color: 'white' }}>
            LedgerFlow Login
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('Billing ledger & automated reconciliation engine')}
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {t('Enter your Email or Username')}
            </label>
            <input
              type="text"
              placeholder="e.g. freelancer@ledgerflow.com"
              className="input-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {loading ? t('Accessing Dashboard...') : t('Login & Verify')}
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
            💡 Demo Info:
          </p>
          <p>
            Enter any email or name to load your private sandbox dashboard. Distinct emails automatically isolate your datasets!
          </p>
        </div>
      </div>
    </div>
  );
}
