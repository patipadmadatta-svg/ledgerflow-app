'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/LanguageContext';

export default function HelpGuideCard() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: '⚡ 1. Set Up UPI VPA',
      desc: 'Configure your custom UPI ID and Payee Name. All client invoices dynamically generate QR codes matching this profile.',
      icon: '🎯'
    },
    {
      title: '📝 2. Issue Invoices',
      desc: 'Create invoices with unit cost, rates, and service fees. Overdue trackers auto-calculate late fees.',
      icon: '📊'
    },
    {
      title: '💬 3. WhatsApp Alerts',
      desc: 'Share invoice details directly on WhatsApp with pre-filled payment URLs and QR codes.',
      icon: '📲'
    },
    {
      title: '🤖 4. Auto-Reconcile',
      desc: 'Simulate transfers in the UPI panel. LedgerFlow matches deposit amounts to bills, auto-settling them instantly.',
      icon: '⚙️'
    }
  ];

  return (
    <>
      {/* Sticky Floating Help Trigger Button on Right Screen Border */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="help-trigger-btn"
        style={{
          position: 'fixed',
          right: 0,
          top: '40%',
          transform: 'translateY(-50%)',
          zIndex: 9999,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #ec4899 100%)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1rem',
          borderRadius: '12px 0 0 12px',
          cursor: 'pointer',
          fontWeight: 600,
          boxShadow: '-4px 0 20px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          writingMode: 'vertical-rl',
          textTransform: 'uppercase',
          fontSize: '0.8rem',
          letterSpacing: '0.05em',
          transition: 'transform 0.2s'
        }}
      >
        <span>📖 {t('How it Works')}</span>
      </button>

      {/* Backdrop overlay when open */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 10000,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Frosted Glass Slide-out Right Sidebar / Drawer */}
      <div 
        className="glass-card"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '380px',
          maxWidth: '90vw',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid var(--border-color)',
          zIndex: 10001,
          padding: '2rem 1.5rem',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          overflowY: 'auto'
        }}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📖 {t('How it Works')}
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.75rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Short Summary Description */}
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Follow these quick steps on the dashboard to experience the real-time auto-reconciliation loop:
        </p>

        {/* Demo Checklist steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.8rem', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong>1. Set Payment Coordinates</strong><br/>
              Save your customized UPI ID in the card widget.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.8rem', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong>2. Simulate Payer Deposit</strong><br/>
              In the simulator, type Aarav Sharma, ₹20,000, and click simulate.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.8rem', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
            <div>
              <strong>3. Auto-Reconcile Dues</strong><br/>
              Watch invoice line items switch to paid status in real-time.
            </div>
          </div>
        </div>

        {/* Embedded Interactive Walkthrough Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            🎥 Interactive Slideshow
          </h4>
          
          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            minHeight: '230px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{slides[activeSlide].icon}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>
                {slides[activeSlide].title}
              </span>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', minHeight: '60px', margin: 0 }}>
              {slides[activeSlide].desc}
            </p>

            {/* Micro mock graphics panel */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '0.75rem',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              {activeSlide === 0 && (
                <div style={{ color: '#6366f1', fontWeight: 500 }}>
                  upi://pay?pa=name@upi&pn=PayeeName
                </div>
              )}
              {activeSlide === 1 && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <span style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Draft</span>
                  <span style={{ border: '1px solid #6366f1', color: '#6366f1', padding: '2px 6px', borderRadius: '4px' }}>Issued</span>
                </div>
              )}
              {activeSlide === 2 && (
                <div style={{ color: '#25D366', fontWeight: 600 }}>
                  💬 Remind Payer on WhatsApp
                </div>
              )}
              {activeSlide === 3 && (
                <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                  ₹20,000 Auto-Matched ➔ Settled!
                </div>
              )}
            </div>

            {/* Slider Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              {/* Bullets */}
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {slides.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: activeSlide === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>

              {/* Prev / Next buttons */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {activeSlide > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveSlide(activeSlide - 1)}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Back
                  </button>
                )}
                {activeSlide < slides.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveSlide(activeSlide + 1)}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsOpen(false)}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .help-trigger-btn:hover {
          transform: translateY(-50%) scale(1.05) !important;
        }
      `}</style>
    </>
  );
}
