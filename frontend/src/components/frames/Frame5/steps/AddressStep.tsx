'use client';

import React from 'react';
import { FormField, StepNavigation } from '../components';
import type { AddressData } from '../types';
import type { ValidationErrors } from '../types';

/** Круг + стрелка вправо (как в Frame1 для поля «Номер дома») */
const CIRCLE_PATH = 'M-3.49691e-07 8C-2.80529e-07 9.58225 0.469192 11.129 1.34824 12.4446C2.22729 13.7602 3.47672 14.7855 4.93853 15.391C6.40034 15.9965 8.00887 16.155 9.56072 15.8463C11.1126 15.5376 12.538 14.7757 13.6569 13.6569C14.7757 12.538 15.5376 11.1126 15.8463 9.56072C16.155 8.00887 15.9965 6.40034 15.391 4.93853C14.7855 3.47672 13.7602 2.22729 12.4446 1.34824C11.129 0.469192 9.58225 5.34821e-07 8 6.03983e-07C5.87895 0.00224088 3.84542 0.845815 2.34562 2.34562C0.845813 3.84543 0.00223942 5.87895 -3.49691e-07 8Z';
const ARROW_PATH = 'M7.20461 4.48769L10.2815 7.56461C10.3388 7.62177 10.3841 7.68964 10.4151 7.76434C10.4461 7.83905 10.462 7.91913 10.462 8C10.462 8.08087 10.4461 8.16095 10.4151 8.23565C10.3841 8.31036 10.3388 8.37823 10.2815 8.43538L7.20461 11.5123C7.08914 11.6278 6.93253 11.6926 6.76923 11.6926C6.60593 11.6926 6.44932 11.6278 6.33384 11.5123C6.21837 11.3968 6.1535 11.2402 6.1535 11.0769C6.1535 10.9136 6.21837 10.757 6.33384 10.6415L8.97615 8L6.33384 5.35846C6.27667 5.30129 6.23132 5.23341 6.20037 5.1587C6.16943 5.084 6.1535 5.00393 6.1535 4.92308C6.1535 4.84222 6.16943 4.76215 6.20037 4.68745C6.23132 4.61274 6.27667 4.54487 6.33384 4.48769C6.39102 4.43052 6.4589 4.38516 6.5336 4.35422C6.6083 4.32328 6.68837 4.30735 6.76923 4.30735C6.85009 4.30735 6.93015 4.32328 7.00486 4.35422C7.07956 4.38516 7.14744 4.43052 7.20461 4.48769Z';

function CheckIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
      <path d="M1 3L3 5L7 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldArrowIcon({ active, error }: { active: boolean; error?: boolean }) {
  const circleFill = error ? 'rgb(239, 68, 68)' : active ? '#000000' : '#FFFFFF';
  const circleStroke = error ? 'rgb(239, 68, 68)' : active ? '#000000' : 'rgba(16, 16, 16, 0.35)';
  const arrowFill = error || active ? '#FFFFFF' : '#101010';
  return (
    <svg width={18} height={18} viewBox="-0.5 -0.5 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="block shrink-0 overflow-visible" style={{ overflow: 'visible' }} aria-hidden>
      <path d={CIRCLE_PATH} fill={circleFill} stroke={circleStroke} strokeWidth={1} />
      <path d={ARROW_PATH} fill={arrowFill} />
    </svg>
  );
}

type AddressModalStep = 'city' | 'street' | 'house' | 'apartment';

interface AddressStepProps {
  data: AddressData;
  errors: ValidationErrors;
  onChange: (data: AddressData) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenAddressModal: (step: AddressModalStep) => void;
}

export default function AddressStep({
  data,
  errors,
  onChange,
  onNext,
  onBack,
  onOpenAddressModal,
}: AddressStepProps) {
  const cityValid = data.city.trim().length > 0;
  const streetValid = data.street.trim().length > 0;
  const buildingValid = data.building.trim().length > 0;

  const handleCityChange = (value: string) => onChange({ ...data, city: value });
  const handleStreetChange = (value: string) => onChange({ ...data, street: value });
  const handleBuildingChange = (value: string) => onChange({ ...data, building: value });

  return (
    <div className="flex flex-col w-full">
      <div className="flex-shrink-0 px-[15px] pt-[12px] pb-[15px]">
        <h2
          style={{
            fontFamily: "'TT Firs Neue', sans-serif",
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '125%',
            color: '#101010',
            marginBottom: 10,
          }}
        >
          Формирование заявки
        </h2>
        <p
          style={{
            fontFamily: "'TT Firs Neue', sans-serif",
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.25)',
            marginBottom: 15,
          }}
        >
          Напишите так, как это есть на самом деле. Пожалуйста, проверьте правильность
        </p>

        <div className="flex flex-col gap-[5px]">
          <div style={{ opacity: 0.5 }}>
            <FormField
              value={data.city}
              onChange={handleCityChange}
              placeholder="Название населённого пункта"
              error={errors.city}
              isValid={cityValid}
              disabled
            />
          </div>
          <div style={{ opacity: 0.5 }}>
            <FormField
              value={data.street}
              onChange={handleStreetChange}
              placeholder="Улица"
              error={errors.street}
              isValid={streetValid}
              disabled
            />
          </div>
          <div style={{ opacity: 0.5 }}>
            <FormField
              value={data.building}
              onChange={handleBuildingChange}
              placeholder="Номер дома"
              error={errors.building}
              isValid={buildingValid}
              disabled
            />
          </div>
          <div
            role="button"
            tabIndex={buildingValid ? 0 : -1}
            className={`rounded-[10px] bg-white flex items-center justify-between box-border ${!buildingValid ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              height: 50,
              minHeight: 50,
              paddingLeft: 15,
              paddingRight: 15,
              opacity: !buildingValid ? 0.5 : 1,
              border: errors.apartment
                ? '1px solid rgb(239, 68, 68)'
                : data.apartment
                  ? '1px solid rgba(16, 16, 16, 0.5)'
                  : '1px solid rgba(16, 16, 16, 0.25)',
            }}
            onClick={() => {
              if (buildingValid) {
                onOpenAddressModal('apartment');
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && buildingValid && onOpenAddressModal('apartment')}
          >
            <span
              style={{
                fontFamily: "'TT Firs Neue', sans-serif",
                fontWeight: 400,
                fontSize: 16,
                lineHeight: '125%',
                color: data.apartment ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginRight: 8,
              }}
            >
              {data.apartment ? `кв. ${data.apartment}` : 'Квартира'}
            </span>
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 18,
                height: 18,
                boxSizing: 'border-box',
                border: data.apartment && !errors.apartment ? 'none' : errors.apartment ? '1px solid rgb(239, 68, 68)' : '1px solid rgba(16, 16, 16, 0.25)',
                background: errors.apartment ? 'rgb(239, 68, 68)' : data.apartment && !errors.apartment ? 'rgba(16, 16, 16, 0.5)' : 'transparent',
              }}
            >
              {data.apartment && !errors.apartment ? (
                <CheckIcon filled />
              ) : (
                <FieldArrowIcon active={!data.apartment} error={!!errors.apartment} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-[15px]">
          <StepNavigation onBack={onBack} onNext={onNext} nextLabel="Далее" />
        </div>
      </div>
    </div>
  );
}
