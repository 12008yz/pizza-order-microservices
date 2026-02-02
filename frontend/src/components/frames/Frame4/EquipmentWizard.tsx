'use client';

import React, { useState, useCallback } from 'react';
import { EquipmentModal } from './components';
import RouterFlow from './RouterFlow';
import TvBoxFlow from './TvBoxFlow';
import type { RouterWizardState, TvBoxWizardState, FullEquipmentWizardState, SimCardWizardState } from './types';

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
  configOption: null,
  configComplete: false,
};

const INITIAL_TVBOX_STATE: TvBoxWizardState = {
  need: null,
  tvCount: null,
  purchaseOption: null,
  operatorId: null,
};

const INITIAL_SIMCARD_STATE: SimCardWizardState = {
  connectionType: null,
  clientStatus: null,
  smartphoneCount: null,
  currentOperator: null,
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
      // Роутер и ТВ-приставка завершены; simCard не заполняется в модальном визарде — передаём начальное состояние
      onComplete?.({
        router: routerState,
        tvBox: state,
        simCard: INITIAL_SIMCARD_STATE,
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
