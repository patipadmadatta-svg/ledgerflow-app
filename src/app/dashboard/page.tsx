'use client';

import React, { useState, useEffect } from 'react';
import MoneyWheel from '@/components/MoneyWheel';
import SettlementSplit from '@/components/SettlementSplit';
import OutstandingPanel from '@/components/OutstandingPanel';
import BillLedger from '@/components/BillLedger';

export default function Dashboard() {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({
    wheelRevenue: 0,
    wheelCost: 0,
    wheelMargin: 0,
    wheelLevy: 0,
    wheelOutstanding: 0,
    wheelSettled: 0
  });
  const [outstanding, setOutstanding] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [billsRes, summaryRes, outstandingRes] = await Promise.all([
        fetch('/api/bills'),
        fetch('/api/wheel/summary'),
        fetch('/api/outstanding')
      ]);

      if (billsRes.ok && summaryRes.ok && outstandingRes.ok) {
        const billsData = await billsRes.json();
        const summaryData = await summaryRes.json();
        const outstandingData = await outstandingRes.json();

        setBills(billsData);
        setSummary(summaryData);
        setOutstanding(outstandingData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-polling refetch every 5 seconds to keep the Money Wheel live and dynamic
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255,255,255,0.05)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Dashboard Analytics...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Welcome Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Overview</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time insights on billing costs, margin tax, and receivable collections.
          </p>
        </div>
      </div>

      {/* Top Financial Charts */}
      <div className="charts-container">
        <MoneyWheel summary={summary} />
        <SettlementSplit 
          wheelSettled={summary.wheelSettled} 
          wheelOutstanding={summary.wheelOutstanding} 
        />
      </div>

      {/* Main split grid: Ledger vs Dues */}
      <div className="dashboard-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <BillLedger bills={bills} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <OutstandingPanel 
            outstandingPayers={outstanding} 
            onMutation={fetchDashboardData} 
          />
        </div>
      </div>
    </div>
  );
}
