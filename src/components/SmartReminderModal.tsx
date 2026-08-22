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
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-card" style={{
        width: '550px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1.75rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        border: '1px solid var(--border-hover)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <Sparkles size={18} color="var(--color-primary)" />
            AI-Powered Smart Reminder
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Overdue State</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(0,0,0,0.15)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              color: overdueDays > 0 ? 'var(--color-warning)' : 'var(--text-secondary)'
            }}>
              {overdueDays > 0 ? <AlertTriangle size={16} /> : <Clock size={16} />}
              <span>{overdueDays > 0 ? `${overdueDays} Days Overdue` : 'Within Grace Period'}</span>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Payment UPI ID</label>
            <input
              type="text"
              className="input-control"
              style={{ padding: '0.45rem' }}
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        </div>

        {/* Tone Presets Selector */}
        <div>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Select Message Tone
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
                  backgroundColor: tone === t ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface-color)',
                  borderColor: tone === t ? 'var(--color-primary)' : 'var(--border-color)',
                  color: tone === t ? 'white' : 'var(--text-secondary)',
                  fontWeight: tone === t ? 600 : 400
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview Box */}
        <div>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Message Preview
          </label>
          <textarea
            className="input-control"
            style={{
              width: '100%',
              minHeight: '140px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              background: 'rgba(0,0,0,0.3)',
              color: '#d1d5db',
              resize: 'none'
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ flex: 1, textDecoration: 'none', backgroundColor: '#25D366', boxShadow: '0 4px 14px rgba(37, 211, 102, 0.2)' }}
          >
            <Send size={16} style={{ marginRight: '0.25rem' }} />
            Send via WhatsApp
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ width: '120px' }}
          >
            {copied ? (
              <>
                <Check size={16} style={{ marginRight: '0.25rem' }} />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} style={{ marginRight: '0.25rem' }} />
                Copy Text
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
