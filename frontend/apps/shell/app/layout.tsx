import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Агрегатор интернет-провайдеров',
  description: 'Проверьте доступность интернета по вашему адресу и сравните тарифы провайдеров',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
