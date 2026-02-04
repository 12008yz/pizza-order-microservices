'use client';

import { useState, useEffect } from 'react';
import CheckboxOption from '../../common/CheckboxOption';
import RadioOption from '../../common/RadioOption';

interface FilterWizardProps {
   isOpen: boolean;
   onClose: () => void;
   onApply: (filters: {
      services: string[];
      providers: string[];
      sortBy: string;
   }) => void;
}

// Типы услуг
const serviceOptions = [
   { id: 'internet', name: 'Интернет', enabled: true },
   { id: 'internet_mobile', name: 'Интернет, и связь', enabled: true },
   { id: 'internet_tv', name: 'Интернет, и телевидение', enabled: true },
   { id: 'internet_tv_mobile', name: 'Интернет, и телевидение, и связь', enabled: true },
   { id: 'tv', name: 'Телевидение', enabled: false },
];

// Провайдеры
const providerOptions = [
   { id: 'beeline', name: 'Билайн' },
   { id: 'domru', name: 'ДОМ.RU' },
   { id: 'megafon', name: 'Мегафон' },
   { id: 'mts', name: 'МТС' },
   { id: 'rostelecom', name: 'Ростелеком' },
];

// Сортировка
const sortOptions = [
   { id: 'price', name: 'Сортировка по стоимости' },
   { id: 'speed', name: 'Сортировка по скорости' },
   { id: 'popularity', name: 'Сортировка по популярности' },
];

export default function FilterWizard({ isOpen, onClose, onApply }: FilterWizardProps) {
   const [step, setStep] = useState(1);
   const [selectedServices, setSelectedServices] = useState<string[]>([
      'internet',
      'internet_mobile',
      'internet_tv',
      'internet_tv_mobile',
   ]);
   const [selectedProviders, setSelectedProviders] = useState<string[]>([
      'beeline',
      'domru',
      'megafon',
      'mts',
      'rostelecom',
   ]);
   const [selectedSort, setSelectedSort] = useState('price');

   // Button press states for animations
   const [isBackBtnPressed, setIsBackBtnPressed] = useState(false);
   const [isNextBtnPressed, setIsNextBtnPressed] = useState(false);

   // Анимация появления/исчезновения
   const [isAnimating, setIsAnimating] = useState(false);
   const [shouldRender, setShouldRender] = useState(false);

   // Сбрасываем шаг на 1 при каждом открытии модалки
   useEffect(() => {
      if (isOpen) {
         setStep(1);
         setShouldRender(true);
         // Анимация появления
         requestAnimationFrame(() => {
            setIsAnimating(true);
         });
      } else {
         // Анимация исчезновения
         setIsAnimating(false);
         setTimeout(() => {
            setShouldRender(false);
         }, 300);
      }
   }, [isOpen]);

   if (!shouldRender) return null;

   const handleServiceToggle = (serviceId: string) => {
      const service = serviceOptions.find((s) => s.id === serviceId);
      if (!service?.enabled) return;

      setSelectedServices((prev) =>
         prev.includes(serviceId)
            ? prev.filter((id) => id !== serviceId)
            : [...prev, serviceId]
      );
   };

   const handleProviderToggle = (providerId: string) => {
      setSelectedProviders((prev) =>
         prev.includes(providerId)
            ? prev.filter((id) => id !== providerId)
            : [...prev, providerId]
      );
   };

   const handleNext = () => {
      if (step < 3) {
         setStep(step + 1);
      } else {
         onApply({
            services: selectedServices,
            providers: selectedProviders,
            sortBy: selectedSort,
         });
         onClose();
      }
   };

   const handleBack = () => {
      if (step > 1) {
         setStep(step - 1);
      }
   };

   const handleBackdropClick = () => {
      setIsAnimating(false);
      setTimeout(() => {
         setShouldRender(false);
         onClose();
      }, 300);
   };

   return (
      <div
         onClick={handleBackdropClick}
         className="fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden"
         style={{
            background: '#F5F5F5',
            backdropFilter: 'blur(12.5px)',
            paddingTop: 'var(--sat, 0px)',
            paddingBottom: 'var(--sab, 0px)',
            height: '100dvh',
            boxSizing: 'border-box',
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
         }}
      >
         {/* Контейнер — подсказка сверху, карточка компактная и прижата вниз */}
         <div
            className="relative w-full max-w-[400px] flex flex-col h-full overflow-hidden bg-[#F5F5F5]"
            style={{
               transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
               opacity: isAnimating ? 1 : 0,
               transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
               boxSizing: 'border-box',
            }}
         >
            {/* Шапка: подсказка (клик по пустоте закрывает — обрабатывается корневым onClick) */}
            <div className="flex-shrink-0 cursor-pointer" style={{ minHeight: '105px' }}>
               <div
                  className="font-normal flex items-center justify-center text-center"
                  style={{
                     width: '240px',
                     margin: '0 auto',
                     paddingTop: '75px',
                     height: '30px',
                     fontFamily: 'TT Firs Neue, sans-serif',
                     fontSize: '14px',
                     lineHeight: '105%',
                     color: 'rgba(16, 16, 16, 0.15)',
                     letterSpacing: '0.5px',
                  }}
               >
                  Нажмите в открытое пустое место, чтобы выйти из этого режима
               </div>
            </div>

            {/* Карточка — компактная, прижата вниз с отступом 20px */}
            <div
               onClick={(e) => e.stopPropagation()}
               className="flex flex-col rounded-[20px] bg-white mx-[5%]"
               style={{
                  maxWidth: '360px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  marginTop: 'auto',
                  marginBottom: '20px',
                  padding: '15px',
               }}
            >
               {/* Заголовок */}
               <div
                  style={{
                     fontFamily: 'TT Firs Neue, sans-serif',
                     fontSize: '20px',
                     lineHeight: '125%',
                     color: '#101010',
                     marginBottom: '15px',
                  }}
               >
                  Фильтрация
               </div>
               <div
                  style={{
                     fontFamily: 'TT Firs Neue, sans-serif',
                     fontSize: '14px',
                     lineHeight: '105%',
                     color: 'rgba(16, 16, 16, 0.25)',
                     marginBottom: '20px',
                  }}
               >
                  Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
               </div>

               {/* Контент шага — без прокрутки, высота по содержимому */}
               <div className="flex flex-col gap-[7px]" style={{ marginBottom: '20px' }}>
                  {step === 1 &&
                     serviceOptions.map((service) => (
                        <CheckboxOption
                           key={service.id}
                           label={service.name}
                           checked={selectedServices.includes(service.id) && service.enabled}
                           onChange={() => handleServiceToggle(service.id)}
                           className={!service.enabled ? 'pointer-events-none' : ''}
                           style={!service.enabled ? { opacity: 0.25 } : undefined}
                        />
                     ))}

                  {step === 2 &&
                     providerOptions.map((provider) => (
                        <CheckboxOption
                           key={provider.id}
                           label={provider.name}
                           checked={selectedProviders.includes(provider.id)}
                           onChange={() => handleProviderToggle(provider.id)}
                        />
                     ))}

                  {step === 3 &&
                     sortOptions.map((option) => (
                        <RadioOption
                           key={option.id}
                           label={option.name}
                           selected={selectedSort === option.id}
                           onClick={() => setSelectedSort(option.id)}
                        />
                     ))}
               </div>

               {/* Кнопки навигации */}
               <div className="flex gap-[10px]">
                  <button
                     type="button"
                     onClick={handleBack}
                     disabled={step === 1}
                     onMouseDown={() => setIsBackBtnPressed(true)}
                     onMouseUp={() => setIsBackBtnPressed(false)}
                     onMouseLeave={() => setIsBackBtnPressed(false)}
                     onTouchStart={() => setIsBackBtnPressed(true)}
                     onTouchEnd={() => setIsBackBtnPressed(false)}
                     className="outline-none rounded-[10px] flex items-center justify-center flex-shrink-0 disabled:cursor-not-allowed"
                     style={{
                        width: '50px',
                        height: '50px',
                        border: '1px solid rgba(16, 16, 16, 0.15)',
                        background: 'white',
                        transform: isBackBtnPressed ? 'scale(0.92)' : 'scale(1)',
                        transition: 'transform 0.15s ease-out',
                        cursor: step === 1 ? 'not-allowed' : 'pointer',
                        opacity: step === 1 ? 0.5 : 1,
                     }}
                  >
                     <svg width="12" height="6" viewBox="0 0 12 6" fill="none" style={{ transform: 'rotate(90deg)' }}>
                        <path d="M1 1L6 5L11 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  </button>

                  <button
                     type="button"
                     onClick={handleNext}
                     onMouseDown={() => setIsNextBtnPressed(true)}
                     onMouseUp={() => setIsNextBtnPressed(false)}
                     onMouseLeave={() => setIsNextBtnPressed(false)}
                     onTouchStart={() => setIsNextBtnPressed(true)}
                     onTouchEnd={() => setIsNextBtnPressed(false)}
                     className="outline-none cursor-pointer flex-1 rounded-[10px] flex items-center justify-center text-white min-h-[50px]"
                     style={{
                        background: '#101010',
                        minHeight: '50px',
                        fontFamily: 'TT Firs Neue, sans-serif',
                        fontSize: '16px',
                        transform: isNextBtnPressed ? 'scale(0.97)' : 'scale(1)',
                        transition: 'transform 0.15s ease-out',
                     }}
                  >
                     {step === 3 ? 'Применить' : 'Далее'}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
