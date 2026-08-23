'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/LanguageContext';

export default function HelpGuideCard() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: '⚡ 1. Set Up Payment UPI VPA',
      desc: 'Configure your UPI VPA ID and payee details in the card widget. All client invoices dynamically generate QR codes matching this profile automatically.',
      icon: '🎯'
    },
    {
      title: '📝 2. Draft & Issue Invoices',
      desc: 'List item descriptions, unit rates, and service fees in the composer. Safe grace-periods auto-trigger overdue late fees and interest tracking.',
      icon: '📊'
    },
    {
      title: '💬 3. WhatsApp Reminders',
      desc: 'Share invoices with clients via WhatsApp. LedgerFlow embeds direct UPI pay links and viewable payment pages in pre-filled reminders.',
      icon: '📲'
    },
    {
      title: '🤖 4. Real-time Auto-Reconciliation',
      desc: 'Use the UPI simulator panel. Simulated client transfers auto-match outstanding invoices, instantly updating the dashboard Money Wheel!',
      icon: '⚙️'
    }
  ];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        📖 {t('How it Works')}
      </h3>
      
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
        New to LedgerFlow? Follow these simple walkthrough steps to test the automatic reconciliation loop.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.825rem' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
          <div>
            <strong>1. Configure payment</strong>: Save your customized VPA in the card widget.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.825rem' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
          <div>
            <strong>2. Simulate Deposit</strong>: Scroll to the simulator, type Aarav Sharma, ₹20,000, and simulate.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.825rem' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
          <div>
            <strong>3. Auto-Reconcile</strong>: See line items auto-settle and Money Wheel update in real-time.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setActiveSlide(0);
          setShowModal(true);
        }}
        className="btn btn-primary btn-sm"
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.45rem 0',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        🎥 {t('Start App Walkthrough')}
      </button>

      {/* Onboarding Guide Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {slides[activeSlide].icon}
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                {slides[activeSlide].title}
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', minHeight: '80px' }}>
                {slides[activeSlide].desc}
              </p>
            </div>

            {/* Slider visual simulation graphics */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '120px'
            }}>
              {activeSlide === 0 && (
                <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#6366f1', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    upi://pay?pa=name@upi&pn=PayeeName
                  </div>
                  <span>Profile QR coordinates linked dynamically across all client billing invoices.</span>
                </div>
              )}
              {activeSlide === 1 && (
                <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ background: 'rgba(100,116,139,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>Draft</span>
                    <span style={{ background: 'rgba(99,102,241,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#6366f1' }}>Issued</span>
                    <span style={{ background: 'rgba(239,68,68,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', color: 'var(--color-danger)' }}>Lapsed</span>
                  </div>
                  <span>Automatic grace trackers alert you of overdue bills and calculate interest metrics.</span>
                </div>
              )}
              {activeSlide === 2 && (
                <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                  <div style={{ color: '#25D366', fontWeight: 'bold', border: '1px solid #25D366', padding: '0.4rem 0.8rem', borderRadius: '8px', display: 'inline-flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    💬 Send Reminder Text
                  </div>
                  <div>Generates prefilled WhatsApp text reminders containing payment QR code links.</div>
                </div>
              )}
              {activeSlide === 3 && (
                <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    <span>Client Deposit ₹20,000</span>
                    <span>➔</span>
                    <span>Matches Aarav's Invoice!</span>
                  </div>
                  <span>Real-time reconciliation automatically flips matching line items to settled status.</span>
                </div>
              )}
            </div>

            {/* Slider Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {slides.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: activeSlide === idx ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {activeSlide > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveSlide(activeSlide - 1)}
                    style={{ padding: '0.35rem 0.75rem' }}
                  >
                    Back
                  </button>
                )}
                {activeSlide < slides.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveSlide(activeSlide + 1)}
                    style={{ padding: '0.35rem 0.75rem' }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '0.35rem 0.75rem' }}
                  >
                    Got It!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
