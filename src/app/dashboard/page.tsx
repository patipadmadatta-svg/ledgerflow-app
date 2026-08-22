'use client';

import React, { useState, useEffect } from 'react';
import MoneyWheel from '@/components/MoneyWheel';
import SettlementSplit from '@/components/SettlementSplit';
import OutstandingPanel from '@/components/OutstandingPanel';
import BillLedger from '@/components/BillLedger';
import { useTranslation } from '@/lib/LanguageContext';
import SmartReminderModal from '@/components/SmartReminderModal';
import UpiReconcilePanel from '@/components/UpiReconcilePanel';

export default function Dashboard() {
  const { t } = useTranslation();
  const [bills, setBills] = useState([]);
  const [activeReminderBill, setActiveReminderBill] = useState<any>(null);
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
    // Redirection / Session Lock Guard
    const sessionStr = localStorage.getItem('ledgerflow_session');
    if (!sessionStr) {
      window.location.href = '/login';
      return;
    }
    const session = JSON.parse(sessionStr);
    if (session.role === 'client') {
      window.location.href = '/client-portal';
      return;
    }

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

  const overdueBillsWithFees = bills.filter((b: any) => b.lateFees > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Welcome Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{t('Overview')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t('Real-time insights on billing costs, margin tax, and receivable collections.')}
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

      {/* UPI Reconciliation Control Panel */}
      <UpiReconcilePanel bills={bills} onMutation={fetchDashboardData} />

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

          {/* Dedicated WhatsApp Reminders Dispatcher Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.15rem', color: '#25D366', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              💬 {t('Send WhatsApp Reminders')}
            </h3>
            {bills.filter((b: any) => b.totalOutstanding > 0 && b.state !== 'DRAFT').length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                All active invoices are fully paid! No reminders needed.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                {bills.filter((b: any) => b.totalOutstanding > 0 && b.state !== 'DRAFT').map((bill: any) => (
                  <div key={bill.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong style={{ color: 'white' }}>{bill.bill_number}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        {bill.payers?.name || 'Payer'}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-warning)', fontWeight: 500, marginTop: '0.15rem' }}>
                        Owes: ₹{bill.totalOutstanding.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveReminderBill(bill)}
                      className="btn btn-secondary btn-sm whatsapp-btn-hover"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        border: '1px solid #25D366',
                        color: '#25D366',
                        background: 'transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      Remind
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Late Fees & Interest Tracker Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.15rem', color: 'var(--color-danger)' }}>
              ⚠️ {t('Late Fees & Overdue Interest')}
            </h3>
            {overdueBillsWithFees.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                No active late fees. All overdue accounts are within the 5-day grace period.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {overdueBillsWithFees.map((bill: any) => (
                  <div key={bill.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(239, 68, 68, 0.02)',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <strong style={{ color: 'white' }}>{bill.bill_number}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        {bill.payers?.name || 'Payer'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {t('Overdue by')} {bill.daysOverdue} {t('days')} (₹100 / 5 days)
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-danger)', fontSize: '0.95rem' }}>
                      + ₹ {bill.lateFees}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {activeReminderBill && (
        <SmartReminderModal 
          bill={activeReminderBill} 
          onClose={() => setActiveReminderBill(null)} 
        />
      )}
      
      <style jsx global>{`
        .whatsapp-btn-hover:hover {
          background-color: rgba(37, 211, 102, 0.1) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
