import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import HeaderWrapper from '@/components/Headerwrapper';
import { Metadata } from 'next';
import { Hind_Siliguri, Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nexora — Best Online Shopping in Bangladesh',
  description: 'Premium electronics, gadgets, and lifestyle products. Fast delivery and reliable service across Bangladesh.',
  keywords: 'ecommerce, bangladesh, electronics, gadgets, online shop',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-inter), var(--font-hind), sans-serif' }} suppressHydrationWarning>
        <HeaderWrapper />
        <div className="flex-1">{children}</div>
        <Footer />
        <CartDrawer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
          }}
        />
      </body>
    </html>
  );
}
