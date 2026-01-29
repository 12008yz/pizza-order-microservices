'use client';

import React, { ReactNode } from 'react';
import { EquipmentProvider } from '../../contexts/EquipmentContext';

export default function AppProviders({ children }: { children: ReactNode }) {
  return <EquipmentProvider>{children}</EquipmentProvider>;
}
