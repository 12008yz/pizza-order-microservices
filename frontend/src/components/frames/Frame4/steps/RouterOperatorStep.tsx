'use client';

import React from 'react';
import RadioOption from '../../../common/RadioOption';
import StepHeader from '../components/StepHeader';
import OperatorWarningBanner from '../components/OperatorWarningBanner';

interface OperatorOption {
  id: number;
  name: string;
}

interface RouterOperatorStepProps {
  operators: OperatorOption[];
  selectedId: number | null;
  onChange: (operatorId: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_OPERATORS: OperatorOption[] = [
  { id: 1, name: 'Ростелеком' },
  { id: 2, name: 'МТС' },
  { id: 3, name: 'Билайн' },
  { id: 4, name: 'ДОМ.RU' },
  { id: 5, name: 'Мегафон' },
];

export default function RouterOperatorStep({
  operators = DEFAULT_OPERATORS,
  selectedId,
  onChange,
  onNext,
  onBack,
}: RouterOperatorStepProps) {
  return (
    <div className="p-6">
      <StepHeader
        title="Роутер"
        description="От какого оператора у вас роутер?"
      />
      <OperatorWarningBanner className="mb-6" />
      <div className="space-y-3 mb-8">
        {operators.map((opt) => (
          <RadioOption
            key={opt.id}
            label={opt.name}
            selected={selectedId === opt.id}
            onClick={() => onChange(opt.id)}
          />
        ))}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-[10px] border border-[rgba(16,16,16,0.25)]"
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            color: '#101010',
          }}
        >
          Назад
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={selectedId === null}
          className="flex-1 py-3 rounded-[10px] bg-[#101010] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
          }}
        >
          Далее
        </button>
      </div>
    </div>
  );
}
