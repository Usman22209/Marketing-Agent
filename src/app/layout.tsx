import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MarketAgent | Simple AI Marketing for Products',
  description: 'Easily generate and copy social media posts for your product.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
