import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Real Estate Analytics - Investment Intelligence Platform',
  description: 'Advanced AI-powered real estate analytics platform for intelligent investment property research, market analysis, and predictive ROI calculations.',
  keywords: 'AI real estate, investment analytics, machine learning, property analysis, ROI prediction, cap rate analysis, real estate intelligence',
  authors: [{ name: 'AI Real Estate Intelligence' }],
  openGraph: {
    title: 'AI Real Estate Analytics Platform',
    description: 'AI-powered real estate investment analytics and market intelligence platform.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
