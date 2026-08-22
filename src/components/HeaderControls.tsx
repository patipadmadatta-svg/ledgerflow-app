'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import LanguageSelector from './LanguageSelector';

export default function HeaderControls() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const loadSession = () => {
    if (typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem('ledgerflow_session');
      if (sessionStr) {
        setSession(JSON.parse(sessionStr));
      } else {
        setSession(null);
      }
    }
  };

  useEffect(() => {
    loadSession();
    window.addEventListener('storage', loadSession);

    // Initial theme loading
    const savedTheme = localStorage.getItem('ledgerflow_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
      }
    }

    return () => window.removeEventListener('storage', loadSession);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.body.classList.add('light-theme');
      localStorage.setItem('ledgerflow_theme', 'light');
    } else {
      setTheme('dark');
      document.body.classList.remove('light-theme');
      localStorage.setItem('ledgerflow_theme', 'dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ledgerflow_session');
    setSession(null);
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
  };

  const isLoginPage = pathname === '/login';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      {!isLoginPage && session && (
        <nav className="nav-links" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/payers" className="nav-link">Payers</Link>
        </nav>
      )}
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        type="button"
        title="Toggle Theme"
        style={{
          background: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1rem',
          color: 'var(--text-primary)',
          transition: 'var(--transition-smooth)'
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <LanguageSelector />

      {!isLoginPage && session && (
        <button
          onClick={handleLogout}
          type="button"
          className="btn btn-secondary btn-sm"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            transition: 'var(--transition-smooth)'
          }}
        >
          Logout
        </button>
      )}
    </div>
  );
}
