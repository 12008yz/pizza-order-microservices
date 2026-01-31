'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { EquipmentState } from '@tariff/shared-types';

const STORAGE_KEY = 'equipmentSelection';

interface EquipmentContextType {
  equipmentState: EquipmentState | null;
  setEquipmentState: (state: EquipmentState | null) => void;
  clearEquipment: () => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [equipmentState, setEquipmentStateInternal] = useState<EquipmentState | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setEquipmentStateInternal(JSON.parse(saved) as EquipmentState);
    } catch {
      // ignore
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;
    try {
      if (equipmentState) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(equipmentState));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [equipmentState, isHydrated]);

  const setEquipmentState = useCallback((state: EquipmentState | null) => {
    setEquipmentStateInternal(state);
  }, []);

  const clearEquipment = useCallback(() => {
    setEquipmentStateInternal(null);
    if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: EquipmentContextType = { equipmentState, setEquipmentState, clearEquipment };

  return <EquipmentContext.Provider value={value}>{children}</EquipmentContext.Provider>;
};

export function useEquipment(): EquipmentContextType {
  const ctx = useContext(EquipmentContext);
  if (ctx === undefined) throw new Error('useEquipment must be used within EquipmentProvider');
  return ctx;
}
