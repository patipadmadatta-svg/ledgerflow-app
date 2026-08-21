'use client';

import React from 'react';
import Link from 'next/link';
import BillComposer from '@/components/BillComposer';

export default function NewBillPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
          &larr; Back to Dashboard
        </Link>
      </div>
      <BillComposer />
    </div>
  );
}
