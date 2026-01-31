'use client';

import React, { ReactNode } from 'react';
import { AddressProvider, EquipmentProvider } from '@tariff/contexts';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AddressProvider>
      <EquipmentProvider>{children}</EquipmentProvider>
    </AddressProvider>
  );
}
