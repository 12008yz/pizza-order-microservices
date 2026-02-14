'use client';

import React from 'react';
import { FormField, StepNavigation } from '../components';
import { formatPhone, formatBirthDate } from '../hooks/usePhoneInput';
import type { PersonalData } from '../types';
import type { ValidationErrors } from '../types';

interface PersonalDataStepProps {
  data: PersonalData;
  errors: ValidationErrors;
  onChange: (data: PersonalData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PersonalDataStep({
  data,
  errors,
  onChange,
  onNext,
  onBack,
}: PersonalDataStepProps) {
  const handleChange = (field: keyof PersonalData) => (value: string) => {
    if (field === 'phone') {
      const formatted = formatPhone(value) || '+7 ';
      onChange({ ...data, [field]: formatted });
    } else if (field === 'birthDate') {
      onChange({ ...data, [field]: formatBirthDate(value) });
    } else {
      onChange({ ...data, [field]: value });
    }
  };

  const phoneValid = data.phone.replace(/\D/g, '').length === 11;
  const dateParts = data.birthDate.split('.').map(Number);
  const dateValid =
    dateParts.length === 3 &&
    dateParts[0] >= 1 &&
    dateParts[0] <= 31 &&
    dateParts[1] >= 1 &&
    dateParts[1] <= 12 &&
    dateParts[2] >= 1900;
  const firstNameValid = data.firstName.length >= 2 && /^[а-яА-ЯёЁa-zA-Z\s-]+$/.test(data.firstName);
  const lastNameValid = data.lastName.length >= 2 && /^[а-яА-ЯёЁa-zA-Z\s-]+$/.test(data.lastName);

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
            value={data.firstName}
            onChange={handleChange('firstName')}
            placeholder="Имя"
            error={errors.firstName}
            isValid={firstNameValid}
          />
          <FormField
            value={data.lastName}
            onChange={handleChange('lastName')}
            placeholder="Фамилия"
            error={errors.lastName}
            isValid={lastNameValid}
          />
          <FormField
            value={data.birthDate}
            onChange={handleChange('birthDate')}
            placeholder="05.05.2005"
            error={errors.birthDate}
            isValid={dateValid}
            type="tel"
            inputMode="tel"
          />
          <FormField
            value={data.phone}
            onChange={handleChange('phone')}
            placeholder="Номер сотового телефона"
            type="tel"
            inputMode="tel"
            error={errors.phone}
            isValid={phoneValid}
            treatAsEmpty={data.phone.replace(/\D/g, '').length <= 1}
          />
        </div>

        <div className="mt-[15px]">
          <StepNavigation onBack={onBack} onNext={onNext} nextLabel="Далее" />
        </div>
      </div>
    </div>
  );
}
