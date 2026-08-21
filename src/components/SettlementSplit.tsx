'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SettlementSplitProps {
  wheelSettled: number;
  wheelOutstanding: number;
}

export default function SettlementSplit({ wheelSettled, wheelOutstanding }: SettlementSplitProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="glass-card" style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading collection metrics...</p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  const total = (wheelSettled || 0) + (wheelOutstanding || 0);
  const settledPercent = total > 0 ? Math.round((wheelSettled / total) * 100) : 0;
  const outstandingPercent = total > 0 ? Math.round((wheelOutstanding / total) * 100) : 0;

  const data = [
    { name: 'Settled', value: wheelSettled || 0, color: 'var(--color-success)', percent: settledPercent },
    { name: 'Outstanding', value: wheelOutstanding || 0, color: 'var(--color-warning)', percent: outstandingPercent }
  ].filter(item => item.value > 0);

  const emptyData = data.length === 0;
  const finalData = emptyData
    ? [{ name: 'No Invoices', value: 1, color: 'rgba(255, 255, 255, 0.05)', percent: 0 }]
    : data;

  const handleSegmentClick = (entry: any) => {
    if (entry.name === 'Outstanding') {
      const panel = document.getElementById('outstanding-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth' });
        // Add a temporary glow animation to highlight it
        panel.style.boxShadow = '0 0 25px rgba(245, 158, 11, 0.4)';
        setTimeout(() => {
          panel.style.boxShadow = 'var(--glass-shadow)';
        }, 1500);
      }
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ marginBottom: '1rem' }}>Collection Status (Settlement Split)</h3>
      
      <div style={{ position: 'relative', width: '100%', height: '220px', margin: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={finalData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={emptyData ? 0 : 4}
              dataKey="value"
              onClick={handleSegmentClick}
              style={{ cursor: 'pointer' }}
            >
              {finalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            {!emptyData && (
              <Tooltip 
                formatter={(value: any) => [formatCurrency(Number(value)), '']}
                contentStyle={{
                  backgroundColor: '#0f0e17',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'white',
                  fontFamily: 'Outfit'
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Collection Rate
          </span>
          <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'Space Grotesk', display: 'block' }}>
            {settledPercent}%
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginTop: '1.25rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--color-success)' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Settled (Received):</span>
          <strong style={{ marginLeft: 'auto' }}>{formatCurrency(wheelSettled)} ({settledPercent}%)</strong>
        </div>
        <div 
          onClick={() => handleSegmentClick({ name: 'Outstanding' })}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem', 
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.03)',
            border: '1px solid rgba(245, 158, 11, 0.05)',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          className="outstanding-shortcut"
        >
          <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--color-warning)' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Outstanding (Owed):</span>
          <strong style={{ marginLeft: 'auto', color: 'var(--color-warning)' }}>
            {formatCurrency(wheelOutstanding)} ({outstandingPercent}%) →
          </strong>
        </div>
      </div>
      
      <style jsx global>{`
        .outstanding-shortcut:hover {
          background-color: rgba(245, 158, 11, 0.08) !important;
          border-color: rgba(245, 158, 11, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
