'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, Sparkles, AlertTriangle, Clock } from 'lucide-react';

interface SmartReminderModalProps {
  bill: {
    id: string;
    bill_number: string;
    due_date: string;
    billTotal: number;
    totalOutstanding: number;
    daysOverdue: number;
    payers?: {
      name: string;
      phone: string;
      email?: string | null;
    } | null;
  };
  onClose: () => void;
}

type TonePreset = 'polite' | 'friendly' | 'firm' | 'urgent';

export default function SmartReminderModal({ bill, onClose }: SmartReminderModalProps) {
  const overdueDays = bill.daysOverdue || 0;
  const [tone, setTone] = useState<TonePreset>(overdueDays > 7 ? 'firm' : overdueDays > 0 ? 'friendly' : 'polite');
  const [upiId, setUpiId] = useState('payment@upi');
  const [copied, setCopied] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTemplate = (selectedTone: TonePreset): string => {
    const clientName = bill.payers?.name || 'Client';
    const formattedAmount = formatCurrency(bill.totalOutstanding);
    const billNumber = bill.bill_number;
    const dueDateStr = formatDate(bill.due_date);

    switch (selectedTone) {
      case 'polite':
        return `Hi ${clientName}! 😊 Hope you're doing well. Just a gentle heads-up that invoice *${billNumber}* for *${formattedAmount}* is due on ${dueDateStr}.

You can settle it instantly via UPI to:
👉 \`${upiId}\`

Thank you for your business! Let me know if you need any clarification.`;

      case 'friendly':
        return `Hey ${clientName}! 👋 Quick reminder regarding invoice *${billNumber}* for *${formattedAmount}*. 

Please take a moment to clear it when possible. Instant UPI: \`${upiId}\`

Thanks a ton!`;

      case 'firm':
        return `Dear ${clientName},

This is a follow-up regarding invoice *${billNumber}* for *${formattedAmount}*, which was due on ${dueDateStr} and is now *${overdueDays || 5} days overdue*.

Please arrange for payment today via UPI:
👉 \`${upiId}\`

Please reply with the transaction screenshot once transferred so we can update our records.`;

      case 'urgent':
        return `⚠️ *URGENT PAYMENT NOTICE*

Dear ${clientName},
Invoice *${billNumber}* for *${formattedAmount}* is now *${overdueDays || 10} days OVERDUE*. 

Please settle this immediately via UPI to avoid disruption in services:
👉 UPI ID: \`${upiId}\`

Kindly confirm once paid.`;
    }
  };

  const [message, setMessage] = useState(getTemplate(tone));

  // Regenerate template when tone or upiId changes
  useEffect(() => {
    setMessage(getTemplate(tone));
  }, [tone, upiId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phone = bill.payers?.phone || '';
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const countryPrefix = cleanPhone.length === 10 ? '91' : '';
  const whatsappUrl = `https://wa.me/${countryPrefix}${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 5, 10, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(12px)',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '520px',
        maxHeight: '95vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(15, 15, 25, 0.85)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.35rem', fontWeight: 600, fontFamily: 'Space Grotesk' }}>
            <Sparkles size={20} color="#818cf8" style={{ filter: 'drop-shadow(0 0 6px rgba(129, 140, 248, 0.5))' }} />
            WhatsApp Smart Reminder
          </h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.04)', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)'
            }}
            className="close-hover"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>State & Overdue Status</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.8rem',
              background: overdueDays > 0 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)',
              borderRadius: '10px',
              border: overdueDays > 0 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: overdueDays > 0 ? '#f59e0b' : 'var(--text-secondary)'
            }}>
              {overdueDays > 0 ? <AlertTriangle size={16} /> : <Clock size={16} />}
              <span>{overdueDays > 0 ? `${overdueDays} Days Overdue` : 'Within Grace Period'}</span>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Receive Payment UPI ID</label>
            <input
              type="text"
              className="input-control"
              style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        </div>

        {/* Tone Presets Selector */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem', fontWeight: 500 }}>
            Select Generated Tone Preset
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {(['polite', 'friendly', 'firm', 'urgent'] as TonePreset[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className="btn btn-secondary btn-sm"
                style={{
                  textTransform: 'capitalize',
                  padding: '0.5rem 0',
                  borderRadius: '8px',
                  backgroundColor: tone === t ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                  borderColor: tone === t ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  color: tone === t ? 'white' : 'var(--text-secondary)',
                  fontWeight: tone === t ? 600 : 400,
                  fontSize: '0.85rem',
                  boxShadow: tone === t ? '0 0 10px rgba(99,102,241,0.2)' : 'none'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview Box */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem', fontWeight: 500 }}>
            Generated Template Preview
          </label>
          <textarea
            className="input-control"
            style={{
              width: '100%',
              minHeight: '150px',
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '0.88rem',
              lineHeight: '1.45',
              padding: '0.85rem',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px dashed rgba(255,255,255,0.12)',
              color: '#f3f4f6',
              resize: 'none'
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.5rem' }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ 
              flex: 1, 
              textDecoration: 'none', 
              backgroundColor: '#25D366', 
              borderColor: '#20ba5a',
              boxShadow: '0 8px 20px rgba(37, 211, 102, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.92rem',
              borderRadius: '10px',
              padding: '0.65rem'
            }}
          >
            <Send size={16} />
            Send via WhatsApp
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ 
              width: '130px', 
              borderRadius: '10px',
              padding: '0.65rem',
              fontSize: '0.9rem',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy Text
              </>
            )}
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        .close-hover:hover {
          background-color: rgba(255,255,255,0.1) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
