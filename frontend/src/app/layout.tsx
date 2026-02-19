import type { Metadata } from 'next'
import './globals.css'
import AppProviders from '../components/providers/AppProviders'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Гигапоиск',
  description: 'lorem10',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        {/* Preload только критичных шрифтов — меньше конкуренции за bandwidth, быстрее FCP */}
        <link
          rel="preload"
          href="/fonts/TTFirsNeue-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/TTFirsNeue-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}



