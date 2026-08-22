'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/LanguageContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hash helper to generate deterministic private user ID from email address
  const getUserIdFromEmail = (emailStr: string) => {
    const cleaned = emailStr.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = (hash << 5) - hash + cleaned.charCodeAt(i);
      hash |= 0;
    }
    return 'usr-' + Math.abs(hash);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError(t('Please enter a valid email address'));
      return;
    }

    setLoading(true);
    setError('');

    // Simulate sending OTP
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError(t('Please enter the verification code'));
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      // Allow '1234' as the universal demo verification code
      if (otp.trim() === '1234') {
        const userId = getUserIdFromEmail(email);
        const name = email.split('@')[0];

        // Store active session
        const session = {
          role: 'freelancer',
          name: name.charAt(0).toUpperCase() + name.slice(1),
          email: email.trim().toLowerCase(),
          userId: userId
        };

        localStorage.setItem('ledgerflow_session', JSON.stringify(session));
        window.dispatchEvent(new Event('storage')); // Notify header component
        router.push('/dashboard');
      } else {
        setError(t('Invalid verification code. Enter 1234 for the demo.'));
      }
      setLoading(false);
    }, 500);
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

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('Enter your Email Address')}
              </label>
              <input
                type="email"
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
              {loading ? t('Sending OTP...') : t('Get Verification Code')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              ✉️ {t('OTP has been sent to')}: <strong>{email}</strong>
              <button 
                type="button" 
                onClick={() => { setStep(1); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  padding: '0',
                  marginLeft: '0.5rem',
                  textDecoration: 'underline',
                  fontSize: '0.8rem'
                }}
              >
                Change
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('Enter OTP Code')}
              </label>
              <input
                type="text"
                placeholder="Enter 1234 to verify"
                className="input-control"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                style={{
                  padding: '0.75rem',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  letterSpacing: '0.25em',
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
              {loading ? t('Verifying...') : t('Verify & Login')}
            </button>
          </form>
        )}

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: '1.4'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
            ⚡ Demo Instructions:
          </p>
          <p>
            Enter any email and submit.<br/>
            Enter verification code <strong>1234</strong> to verify and access your private dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
