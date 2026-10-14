import type { Metadata, Viewport } from 'next';
import { GameProvider } from '@/context/GameContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decido Yo',
  description: 'El juego de cartas que decide tu salida.',
  applicationName: 'Decido Yo',
  appleWebApp: { capable: true, title: 'Decido Yo', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#121212',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <GameProvider>
          <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
            {children}
          </main>
        </GameProvider>
      </body>
    </html>
  );
}
