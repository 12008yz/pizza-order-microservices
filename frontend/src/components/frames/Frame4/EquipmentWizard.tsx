'use client';

import React, { useState, useCallback } from 'react';
import { EquipmentModal } from './components';
import RouterFlow from './RouterFlow';
import TvBoxFlow from './TvBoxFlow';
import type { RouterWizardState, TvBoxWizardState, FullEquipmentWizardState } from './types';

type WizardPhase = 'router' | 'tvbox' | 'done';

interface EquipmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (state: FullEquipmentWizardState) => void;
}

const INITIAL_ROUTER_STATE: RouterWizardState = {
  need: null,
  purchaseOption: null,
  operatorId: null,
  configComplete: false,
};

const INITIAL_TVBOX_STATE: TvBoxWizardState = {
  need: null,
  tvCount: null,
  purchaseOption: null,
  operatorId: null,
};

export default function EquipmentWizard({
  isOpen,
  onClose,
  onComplete,
}: EquipmentWizardProps) {
  const [phase, setPhase] = useState<WizardPhase>('router');
  const [routerState, setRouterState] = useState<RouterWizardState>(INITIAL_ROUTER_STATE);
  const [tvBoxState, setTvBoxState] = useState<TvBoxWizardState>(INITIAL_TVBOX_STATE);

  const handleRouterComplete = useCallback(
    (state: RouterWizardState) => {
      setRouterState(state);
      // После завершения роутера переходим к ТВ-приставке
      setPhase('tvbox');
    },
    []
  );

  const handleTvBoxComplete = useCallback(
    (state: TvBoxWizardState) => {
      setTvBoxState(state);
      // Оба флоу завершены - вызываем onComplete и закрываем
      onComplete?.({
        router: routerState,
        tvBox: state,
      });
      setPhase('done');
      onClose();
    },
    [routerState, onComplete, onClose]
  );

  const handleBackFromTvBox = useCallback(() => {
    // Возврат к роутеру
    setPhase('router');
  }, []);

  const handleClose = useCallback(() => {
    // Сброс состояния при закрытии
    setPhase('router');
    setRouterState(INITIAL_ROUTER_STATE);
    setTvBoxState(INITIAL_TVBOX_STATE);
    onClose();
  }, [onClose]);

  return (
    <EquipmentModal isOpen={isOpen} onClose={handleClose}>
      {phase === 'router' && (
        <RouterFlow
          onComplete={handleRouterComplete}
          onBackFromFirst={handleClose}
        />
      )}
      {phase === 'tvbox' && (
        <TvBoxFlow
          onComplete={handleTvBoxComplete}
          onBackFromFirst={handleBackFromTvBox}
        />
      )}
    </EquipmentModal>
  );
}
