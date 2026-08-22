'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BillView from '@/components/BillView';

export default function BillDetailPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionStr = localStorage.getItem('ledgerflow_session');
    if (!sessionStr) {
      window.location.href = '/login';
      return;
    }
    const session = JSON.parse(sessionStr);
    const userId = session.userId;

    async function loadBill() {
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/bills/${resolvedParams.id}`, {
          headers: { 'x-user-id': userId }
        });
        if (res.ok) {
          const data = await res.json();
          setBill(data);
        } else {
          setError('Bill not found');
        }
      } catch (err) {
        setError('Failed to load bill detail');
      } finally {
        setLoading(false);
      }
    }

    loadBill();
  }, [params]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading bill details...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error || 'Bill not found'}</h3>
        <Link href="/dashboard" className="btn btn-secondary">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
          &larr; Back to Dashboard
        </Link>
      </div>
      <BillView initialBill={bill} onMutation={() => router.refresh()} />
    </div>
  );
}
