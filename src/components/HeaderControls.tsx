'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import LanguageSelector from './LanguageSelector';

export default function HeaderControls() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);

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
    return () => window.removeEventListener('storage', loadSession);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ledgerflow_session');
    setSession(null);
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
  };

  const isLoginPage = pathname === '/login';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      {!isLoginPage && session && (
        <nav className="nav-links" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          {session.role === 'freelancer' ? (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/payers" className="nav-link">Payers</Link>
            </>
          ) : (
            <Link href="/client-portal" className="nav-link">Client Portal</Link>
          )}
        </nav>
      )}
      
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
