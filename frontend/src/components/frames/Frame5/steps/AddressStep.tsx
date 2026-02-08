'use client';

import React from 'react';
import { FormField, StepNavigation, ApartmentSelectModal } from '../components';
import type { AddressData, ApartmentOption } from '../types';
import type { ValidationErrors } from '../types';

interface AddressStepProps {
  data: AddressData;
  errors: ValidationErrors;
  onChange: (data: AddressData) => void;
  onNext: () => void;
  onBack: () => void;
  apartmentOptions: ApartmentOption[];
  selectedApartmentId: string | null;
  onApartmentSelect: (apartmentId: string, apartmentNumber: string, floor?: number) => void;
  apartmentModalOpen: boolean;
  onApartmentModalOpen: (open: boolean) => void;
}

export default function AddressStep({
  data,
  errors,
  onChange,
  onNext,
  onBack,
  apartmentOptions,
  selectedApartmentId,
  onApartmentSelect,
  apartmentModalOpen,
  onApartmentModalOpen,
}: AddressStepProps) {
  const apartmentDisplay = data.apartment ? `кв. ${data.apartment}` : '';

  const cityValid = data.city.trim().length > 0;
  const streetValid = data.street.trim().length > 0;
  const buildingValid = data.building.trim().length > 0;
  const apartmentValid = Boolean(data.apartment);

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
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.25)',
            marginBottom: 15,
          }}
        >
          Напишите так, как это есть на самом деле. Пожалуйста, проверьте правильность
        </p>

        <div className="flex flex-col gap-[8px]">
          <FormField
            value={data.city}
            onChange={(v) => onChange({ ...data, city: v })}
            placeholder="Город"
            error={errors.city}
            isValid={cityValid}
          />
          <FormField
            value={data.street}
            onChange={(v) => onChange({ ...data, street: v })}
            placeholder="Улица"
            error={errors.street}
            isValid={streetValid}
          />
          <FormField
            value={data.building}
            onChange={(v) => onChange({ ...data, building: v })}
            placeholder="Дом"
            error={errors.building}
            isValid={buildingValid}
          />
          <FormField
            value={apartmentDisplay}
            placeholder="Квартира"
            onClick={() => onApartmentModalOpen(true)}
            error={errors.apartment}
            isValid={apartmentValid}
          />
        </div>

        <div className="mt-[15px]">
          <StepNavigation onBack={onBack} onNext={onNext} nextLabel="Далее" />
        </div>
      </div>

      <ApartmentSelectModal
        isOpen={apartmentModalOpen}
        onClose={() => onApartmentModalOpen(false)}
        options={apartmentOptions}
        selectedId={selectedApartmentId}
        onSelect={onApartmentSelect}
        initialFloor={data.floor}
      />
    </div>
  );
}
