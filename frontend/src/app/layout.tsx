import type { Metadata } from 'next'
import './globals.css'

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
        {/* Preload критических шрифтов для улучшения производительности */}
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
      </head>
      <body>{children}</body>
    </html>
  )
}



