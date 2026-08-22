import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

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
        <LanguageProvider>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <nav className="nav-links">
                  <Link href="/dashboard" className="nav-link">Dashboard</Link>
                  <Link href="/payers" className="nav-link">Payers</Link>
                </nav>
                <LanguageSelector />
              </div>
            </header>
            <main>
              {children}
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
