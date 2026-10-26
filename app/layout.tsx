import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'OpenSourceHub — Free Alternatives to Every SaaS Tool',
    template: '%s | OpenSourceHub',
  },
  description:
    'Discover 500+ self-hosted, open-source alternatives to popular SaaS products. Free forever, full data ownership, deploy with Docker.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://opensourcehub.io'),
  openGraph: {
    siteName: 'OpenSourceHub',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased font-sans">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
