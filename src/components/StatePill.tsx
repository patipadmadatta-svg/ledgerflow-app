import React from 'react';

interface StatePillProps {
  state: 'DRAFT' | 'ISSUED' | 'PART_SETTLED' | 'SETTLED' | 'LAPSED';
}

export default function StatePill({ state }: StatePillProps) {
  let badgeClass = 'badge-draft';
  let label = state || 'DRAFT';

  switch (state) {
    case 'DRAFT':
      badgeClass = 'badge-draft';
      label = 'DRAFT';
      break;
    case 'ISSUED':
      badgeClass = 'badge-issued';
      label = 'ISSUED';
      break;
    case 'PART_SETTLED':
      badgeClass = 'badge-part-settled';
      label = 'PART PAID';
      break;
    case 'SETTLED':
      badgeClass = 'badge-settled';
      label = 'SETTLED';
      break;
    case 'LAPSED':
      badgeClass = 'badge-lapsed';
      label = 'OVERDUE';
      break;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {label}
    </span>
  );
}
