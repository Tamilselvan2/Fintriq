import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: '#020817',
};

export const metadata: Metadata = {
  title: 'Fintriq | Financial Dashboard',
  description: 'Financial clarity for modern teams.',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Fintriq',
    statusBarStyle: 'default',
    capable: true,
  },
  icons: {
    apple: '/icons/icon-180x180.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
