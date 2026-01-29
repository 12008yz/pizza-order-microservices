import type { Metadata } from 'next'
import './globals.css'
import AppProviders from '../components/providers/AppProviders'

export const metadata: Metadata = {
  title: 'Агрегатор интернет-провайдеров',
  description: 'Проверьте доступность интернета по вашему адресу и сравните тарифы провайдеров',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        {/* Preload всех шрифтов для параллельной загрузки и улучшения производительности */}
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
        <link
          rel="preload"
          href="/fonts/TTFirsNeue-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/TTFirsNeue-Thin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preconnect для ускорения загрузки */}
        <link rel="preconnect" href="/fonts" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}



