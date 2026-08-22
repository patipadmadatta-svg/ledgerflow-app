'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/LanguageContext';

type LoginStep = 'email' | 'otp' | 'password' | 'register';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  // App state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<LoginStep>('email');
  
  // Registration / Sign In parameters
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Helpers
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError(t('Please enter a valid email address'));
      return;
    }

    setLoading(true);
    setError('');
    setSimulatedOtp(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.devOtp) {
          setSimulatedOtp(data.devOtp);
        }
        setStep('otp');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      setError('Network error occurred while requesting verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError(t('Please enter the verification code'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        // If user already exists in the system
        if (data.registered) {
          setStep('password');
        } else {
          // New user registration
          setStep('register');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      console.error(err);
      setError('Network error occurred during code verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(t('Password is required'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        const session = {
          role: 'freelancer',
          name: data.user.username,
          email: data.user.email,
          userId: data.user.id
        };
        localStorage.setItem('ledgerflow_session', JSON.stringify(session));
        window.dispatchEvent(new Event('storage'));
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      console.error(err);
      setError('Network error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(t('Username and password are required'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          username: username.trim(),
          password: password.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        const session = {
          role: 'freelancer',
          name: data.user.username,
          email: data.user.email,
          userId: data.user.id
        };
        localStorage.setItem('ledgerflow_session', JSON.stringify(session));
        window.dispatchEvent(new Event('storage'));
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error occurred during registration.');
    } finally {
      setLoading(false);
    }
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
            LedgerFlow
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {t('Billing ledger & automated reconciliation engine')}
          </p>
        </div>

        {/* Step 1: Input Email */}
        {step === 'email' && (
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
        )}

        {/* Step 2: Input OTP */}
        {step === 'otp' && (
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
                onClick={() => { setStep('email'); setError(''); setSimulatedOtp(null); }}
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
                placeholder="6-digit code"
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

            {simulatedOtp && (
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--color-warning)',
                backgroundColor: 'rgba(245, 158, 11, 0.03)',
                border: '1px dashed rgba(245, 158, 11, 0.2)',
                padding: '0.5rem',
                borderRadius: '6px',
                textAlign: 'center',
                fontWeight: 500
              }}>
                🔑 [Dev Mode] Simulated OTP Code: <strong>{simulatedOtp}</strong>
              </div>
            )}

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
              {loading ? t('Verifying...') : t('Verify Code')}
            </button>
          </form>
        )}

        {/* Step 3 (Returning User): Enter Password */}
        {step === 'password' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'var(--color-success)',
              textAlign: 'center',
              fontWeight: 500
            }}>
              ✅ {t('Email Verified Successfully!')}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('Enter your Password')}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              {loading ? t('Logging in...') : t('Verify & Login')}
            </button>
          </form>
        )}

        {/* Step 3 (New User): Set Username & Password */}
        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'var(--color-success)',
              textAlign: 'center',
              fontWeight: 500
            }}>
              🆕 {t('Create LedgerFlow Account')}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('Choose a Profile Username')}
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                className="input-control"
                value={username}
                onChange={e => setUsername(e.target.value)}
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

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {t('Choose a Password')}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              {loading ? t('Creating Account...') : t('Complete Registration')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
