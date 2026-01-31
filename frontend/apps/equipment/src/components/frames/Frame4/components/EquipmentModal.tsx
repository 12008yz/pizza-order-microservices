'use client';

import React from 'react';
import { BaseModal } from '@tariff/ui';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function EquipmentModal({
  isOpen,
  onClose,
  children,
  className = '',
}: EquipmentModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} backdropBlur>
      <div
        className={`overflow-hidden ${className}`}
        style={{
          width: '100%',
          maxWidth: '400px',
          maxHeight: 'calc(100vh - 180px)',
          background: '#FFFFFF',
          borderRadius: '20px',
          fontFamily: 'TT Firs Neue, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </BaseModal>
  );
}
