'use client';

import React, { useState, useCallback } from 'react';
import { EquipmentModal } from './components';
import RouterFlow from './RouterFlow';
import type { RouterWizardState } from './types';

interface EquipmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (state: RouterWizardState) => void;
}

export default function EquipmentWizard({
  isOpen,
  onClose,
  onComplete,
}: EquipmentWizardProps) {
  const handleComplete = useCallback(
    (state: RouterWizardState) => {
      onComplete?.(state);
      onClose();
    },
    [onComplete, onClose]
  );

  return (
    <EquipmentModal isOpen={isOpen} onClose={onClose}>
      <RouterFlow
        onComplete={handleComplete}
        onBackFromFirst={onClose}
      />
    </EquipmentModal>
  );
}
