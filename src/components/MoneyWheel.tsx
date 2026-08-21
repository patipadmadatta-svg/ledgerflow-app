'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface WheelSummary {
  wheelRevenue: number;
  wheelCost: number;
  wheelMargin: number;
  wheelLevy: number;
  wheelOutstanding: number;
  wheelSettled: number;
}

interface MoneyWheelProps {
  summary: WheelSummary;
}

export default function MoneyWheel({ summary }: MoneyWheelProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="glass-card" style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading financial wheel...</p>
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

  const chartData = [
    { name: 'Cost', value: summary.wheelCost || 0, color: 'var(--color-danger)' },
    { name: 'Margin (Profit)', value: summary.wheelMargin || 0, color: 'var(--color-success)' },
    { name: 'Levy (Tax)', value: summary.wheelLevy || 0, color: 'var(--color-warning)' },
    { name: 'Outstanding', value: summary.wheelOutstanding || 0, color: 'var(--color-outstanding)' }
  ].filter(item => item.value > 0); // Only render positive values

  // If there's no data, render a placeholder segment so the wheel is still visible
  const emptyData = chartData.length === 0;
  const finalChartData = emptyData 
    ? [{ name: 'No Data Available', value: 1, color: 'rgba(255, 255, 255, 0.05)' }]
    : chartData;

  const totalBilled = (summary.wheelRevenue || 0) + (summary.wheelLevy || 0);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Money Wheel Summary</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
          Total Billed: {formatCurrency(totalBilled)}
        </span>
      </h3>
      
      <div style={{ position: 'relative', width: '100%', height: '220px', margin: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={finalChartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={emptyData ? 0 : 3}
              dataKey="value"
            >
              {finalChartData.map((entry, index) => (
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

        {/* Center Text Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            Settled / Received
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success)', fontFamily: 'Space Grotesk' }}>
            {formatCurrency(summary.wheelSettled || 0)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem 1rem',
        marginTop: '1.25rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Cost:</span>
          <strong style={{ marginLeft: 'auto' }}>{formatCurrency(summary.wheelCost || 0)}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Margin:</span>
          <strong style={{ marginLeft: 'auto' }}>{formatCurrency(summary.wheelMargin || 0)}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Levy:</span>
          <strong style={{ marginLeft: 'auto' }}>{formatCurrency(summary.wheelLevy || 0)}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-outstanding)' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Owed:</span>
          <strong style={{ marginLeft: 'auto' }}>{formatCurrency(summary.wheelOutstanding || 0)}</strong>
        </div>
      </div>
    </div>
  );
}
