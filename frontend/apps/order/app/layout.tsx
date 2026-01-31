import type { Metadata } from 'next';
import '../globals.css';
import { AddressProvider, EquipmentProvider } from '@tariff/contexts';

export const metadata: Metadata = {
  title: 'Оформление заявки | Агрегатор провайдеров',
  description: 'Оформление заявки на подключение',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AddressProvider>
          <EquipmentProvider>{children}</EquipmentProvider>
        </AddressProvider>
      </body>
    </html>
  );
}
