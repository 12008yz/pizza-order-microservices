'use client';

import React, { useState, useCallback } from 'react';
import {
  RouterNeedStep,
  RouterPurchaseStep,
  RouterOperatorStep,
  RouterConfigStep,
} from './steps';
import type { RouterNeedOption, PurchaseOption, RouterWizardState } from './types';

export type RouterFlowStep = 'need' | 'purchase' | 'operator' | 'config' | 'done';

interface RouterFlowProps {
  onComplete: (state: RouterWizardState) => void;
  onBackFromFirst?: () => void;
}

const INITIAL_STATE: RouterWizardState = {
  need: null,
  purchaseOption: null,
  operatorId: null,
  configComplete: false,
};

export default function RouterFlow({ onComplete, onBackFromFirst }: RouterFlowProps) {
  const [state, setState] = useState<RouterWizardState>(INITIAL_STATE);
  const [step, setStep] = useState<RouterFlowStep>('need');

  const setNeed = useCallback((need: RouterNeedOption) => {
    setState((s) => ({ ...s, need }));
  }, []);

  const setPurchaseOption = useCallback((purchaseOption: PurchaseOption) => {
    setState((s) => ({ ...s, purchaseOption }));
  }, []);

  const setOperatorId = useCallback((operatorId: number) => {
    setState((s) => ({ ...s, operatorId }));
  }, []);

  const goNextFromNeed = useCallback(() => {
    if (state.need === 'need') {
      setStep('purchase');
      return;
    }
    if (state.need === 'have_from_operator') {
      setStep('operator');
      return;
    }
    if (state.need === 'have_own') {
      setStep('config');
      return;
    }
    // state.need === 'no' — завершаем без дальнейших шагов
    onComplete({ ...state, need: state.need ?? 'no' });
    setStep('done');
  }, [state, onComplete]);

  const goNextFromPurchase = useCallback(() => {
    onComplete(state);
    setStep('done');
  }, [state, onComplete]);

  const goNextFromOperator = useCallback(() => {
    onComplete(state);
    setStep('done');
  }, [state, onComplete]);

  const goNextFromConfig = useCallback(() => {
    setState((s) => ({ ...s, configComplete: true }));
    onComplete({ ...state, configComplete: true });
    setStep('done');
  }, [state, onComplete]);

  const goBack = useCallback(() => {
    if (step === 'purchase') setStep('need');
    else if (step === 'operator') setStep('need');
    else if (step === 'config') setStep('need');
    else if (step === 'need' && onBackFromFirst) onBackFromFirst();
  }, [step, onBackFromFirst]);

  if (step === 'done') return null;

  if (step === 'need') {
    return (
      <RouterNeedStep
        value={state.need}
        onChange={setNeed}
        onNext={goNextFromNeed}
        onBack={onBackFromFirst}
      />
    );
  }

  if (step === 'purchase') {
    return (
      <RouterPurchaseStep
        value={state.purchaseOption}
        onChange={setPurchaseOption}
        onNext={goNextFromPurchase}
        onBack={goBack}
      />
    );
  }

  if (step === 'operator') {
    return (
      <RouterOperatorStep
        selectedId={state.operatorId}
        onChange={setOperatorId}
        onNext={goNextFromOperator}
        onBack={goBack}
      />
    );
  }

  if (step === 'config') {
    return <RouterConfigStep onNext={goNextFromConfig} onBack={goBack} />;
  }

  return null;
}
