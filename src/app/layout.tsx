import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'LedgerFlow — Real-Time Margin & Invoice Ledger',
  description: 'Track bills, payer outstanding amounts, cost vs. charge margins, levies, and settlement status with an interactive visual money wheel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <header className="header">
            <div className="brand">
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>LF</div>
              <h1>LedgerFlow</h1>
            </div>
            <nav className="nav-links">
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/payers" className="nav-link">Payers</Link>
            </nav>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
