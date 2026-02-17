'use client';

import React from 'react';
import { FormField, StepNavigation } from '../components';
import type { AddressData } from '../types';
import type { ValidationErrors } from '../types';

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
  const apartmentValid = Boolean(data.apartment?.toString().trim());

  const handleCityChange = (value: string) => onChange({ ...data, city: value });
  const handleStreetChange = (value: string) => onChange({ ...data, street: value });
  const handleBuildingChange = (value: string) => onChange({ ...data, building: value });
  const handleApartmentChange = (value: string) => {
    const raw = value.replace(/^кв\.?\s*/i, '').trim();
    onChange({ ...data, apartment: raw || null });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex-shrink-0 px-[15px] pt-[12px] pb-[20px]">
        <h2
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
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
            fontFamily: 'TT Firs Neue, sans-serif',
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
          <FormField
            value={data.city}
            onChange={handleCityChange}
            placeholder="Название населённого пункта"
            error={errors.city}
            isValid={cityValid}
          />
          <FormField
            value={data.street}
            onChange={handleStreetChange}
            placeholder="Улица"
            error={errors.street}
            isValid={streetValid}
          />
          <FormField
            value={data.building}
            onChange={handleBuildingChange}
            placeholder="Номер дома"
            error={errors.building}
            isValid={buildingValid}
          />
          <FormField
            value={data.apartment ?? ''}
            onChange={handleApartmentChange}
            placeholder="Квартира"
            error={errors.apartment}
            isValid={apartmentValid}
          />
        </div>

        <div className="mt-[15px]">
          <StepNavigation onBack={onBack} onNext={onNext} nextLabel="Далее" />
        </div>
      </div>
    </div>
  );
}
