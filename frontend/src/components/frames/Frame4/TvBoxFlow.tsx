'use client';

import React, { useState, useCallback } from 'react';
import {
  TvBoxNeedStep,
  TvBoxTvCountStep,
  TvBoxPurchaseStep,
  TvBoxOperatorStep,
} from './steps';
import type {
  TvBoxNeedOption,
  TvBoxPurchaseOption,
  TvCountOption,
  TvBoxOperatorOption,
  TvBoxWizardState,
} from './types';

export type TvBoxFlowStep = 'need' | 'tvCount' | 'purchase' | 'operator' | 'done';

interface TvBoxFlowProps {
  onComplete: (state: TvBoxWizardState) => void;
  onBackFromFirst?: () => void;
}

const INITIAL_STATE: TvBoxWizardState = {
  need: null,
  tvCount: null,
  purchaseOption: null,
  operatorId: null,
};

export default function TvBoxFlow({ onComplete, onBackFromFirst }: TvBoxFlowProps) {
  const [state, setState] = useState<TvBoxWizardState>(INITIAL_STATE);
  const [step, setStep] = useState<TvBoxFlowStep>('need');

  const setNeed = useCallback((need: TvBoxNeedOption) => {
    setState((s) => ({ ...s, need }));
  }, []);

  const setTvCount = useCallback((tvCount: TvCountOption) => {
    setState((s) => ({ ...s, tvCount }));
  }, []);

  const setPurchaseOption = useCallback((purchaseOption: TvBoxPurchaseOption) => {
    setState((s) => ({ ...s, purchaseOption }));
  }, []);

  const setOperatorId = useCallback((operatorId: TvBoxOperatorOption) => {
    setState((s) => ({ ...s, operatorId }));
  }, []);

  const goNextFromNeed = useCallback(() => {
    if (state.need === 'need') {
      // Пользователю нужна приставка → выбор количества ТВ
      setStep('tvCount');
      return;
    }
    if (state.need === 'have_from_operator') {
      // Имеется от оператора → выбор оператора
      setStep('operator');
      return;
    }
    if (state.need === 'have_own' || state.need === 'smart_tv') {
      // Имеется своя или Smart TV → завершаем
      onComplete({ ...state, need: state.need });
      setStep('done');
      return;
    }
    // Fallback
    onComplete(state);
    setStep('done');
  }, [state, onComplete]);

  const goNextFromTvCount = useCallback(() => {
    // После выбора количества ТВ → способ приобретения
    setStep('purchase');
  }, []);

  const goNextFromPurchase = useCallback(() => {
    // После выбора способа приобретения → завершаем
    onComplete(state);
    setStep('done');
  }, [state, onComplete]);

  const goNextFromOperator = useCallback(() => {
    // После выбора оператора → завершаем
    onComplete(state);
    setStep('done');
  }, [state, onComplete]);

  const goBack = useCallback(() => {
    if (step === 'tvCount') setStep('need');
    else if (step === 'purchase') setStep('tvCount');
    else if (step === 'operator') setStep('need');
    else if (step === 'need' && onBackFromFirst) onBackFromFirst();
  }, [step, onBackFromFirst]);

  if (step === 'done') return null;

  if (step === 'need') {
    return (
      <TvBoxNeedStep
        selected={state.need}
        onSelect={setNeed}
        onNext={goNextFromNeed}
        onBack={onBackFromFirst || (() => {})}
      />
    );
  }

  if (step === 'tvCount') {
    return (
      <TvBoxTvCountStep
        selected={state.tvCount}
        onSelect={setTvCount}
        onNext={goNextFromTvCount}
        onBack={goBack}
      />
    );
  }

  if (step === 'purchase') {
    return (
      <TvBoxPurchaseStep
        selected={state.purchaseOption}
        onSelect={setPurchaseOption}
        onNext={goNextFromPurchase}
        onBack={goBack}
      />
    );
  }

  if (step === 'operator') {
    return (
      <TvBoxOperatorStep
        selected={state.operatorId}
        onSelect={setOperatorId}
        onNext={goNextFromOperator}
        onBack={goBack}
      />
    );
  }

  return null;
}
