import './globals.css';
import PWAInstallButton from '@/components/PWAInstallButton';
import PWARegister from '@/components/PWARegister';

export const metadata = {
  title: 'Banaripara',
  description: 'Banaripara digital information web app',
  manifest: '/manifest.json',
  applicationName: 'Banaripara',
  appleWebApp: {
    capable: true,
    title: 'Banaripara',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>
        <PWARegister />
        {children}
        <PWAInstallButton />
      </body>
    </html>
  );
}
