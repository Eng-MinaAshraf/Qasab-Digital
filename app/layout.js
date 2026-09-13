import "./globals.css";
import "./order-tracking.css";
import { Cairo } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('../components/CartDrawer'));
const Toast = dynamic(() => import('../components/Toast'));
const OrderTrackingCupWidget = dynamic(() => import('../components/OrderTrackingCupWidget'));

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  variable: "--font-cairo",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://qasab-digital.vercel.app'),
  title: "قصب | عصير قصب طبيعي 100% في مصر",
  description: "طازة، طبيعية، مصرية — عصير قصب طازج يومياً من أجود مزارع القصب المصرية بأعلى معايير النظافة والجودة.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cairo.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <Toast />
            <OrderTrackingCupWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
