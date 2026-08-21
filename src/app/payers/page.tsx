'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Payer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  created_at: string;
}

export default function PayerDirectory() {
  const [payers, setPayers] = useState<Payer[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPayers = async () => {
    try {
      const res = await fetch('/api/payers');
      if (res.ok) {
        const data = await res.json();
        setPayers(data);
      }
    } catch (err) {
      console.error('Failed to load payers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayers();
  }, []);

  const handleAddPayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Name and phone are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/payers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email: email || null, address: address || null })
      });

      if (res.ok) {
        setName('');
        setPhone('');
        setEmail('');
        setAddress('');
        fetchPayers();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to save payer'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
      {/* Add Payer Form */}
      <form onSubmit={handleAddPayer} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Add New Payer
        </h3>
        
        <div className="form-group">
          <label>Payer Name *</label>
          <input 
            type="text"
            className="input-control"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="e.g. Acme Corp"
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input 
            type="text"
            className="input-control"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            placeholder="e.g. +91 98765 43210"
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email"
            className="input-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="e.g. finance@acme.com"
          />
        </div>

        <div className="form-group">
          <label>Billing Address</label>
          <textarea 
            className="input-control"
            rows={3}
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. 4th Floor, Tech Hub, Mumbai"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Add Payer'}
        </button>
      </form>

      {/* Directory Table */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Payer Directory</h3>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading directory...</p>
        ) : payers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No payers found. Add one on the left.
          </p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payers.map((payer) => (
                  <tr key={payer.id}>
                    <td>
                      <strong>{payer.name}</strong>
                    </td>
                    <td>{payer.phone}</td>
                    <td>{payer.email || <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/payers/${payer.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                        View Dues Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
