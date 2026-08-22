'use client';

import React from 'react';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="var(--text-secondary)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="input-control"
        style={{
          padding: '0.35rem 1.75rem 0.35rem 0.6rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          fontFamily: 'Outfit'
        }}
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <option key={code} value={code} style={{ background: '#09090e', color: 'white' }}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
