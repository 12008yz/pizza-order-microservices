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

   const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
         // Анимация исчезновения
         setIsAnimating(false);
         setTimeout(() => {
            setShouldRender(false);
            onClose();
         }, 300);
      }
   };

   // Определяем высоту и отступ карточки в зависимости от шага
   const getCardStyles = () => {
      if (step === 3) {
         return { height: '350px', top: '375px' };
      }
      return { height: '460px', top: '265px' };
   };

   const cardStyles = getCardStyles();

   return (
      <div
         onClick={handleBackdropClick}
         style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: '#F5F5F5',
            backdropFilter: 'blur(12.5px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
         }}
      >
         {/* Подсказка сверху */}
         <div
            style={{
               position: 'absolute',
               width: '240px',
               top: '75px',
               left: '50%',
               transform: isAnimating ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)',
               fontFamily: 'TT Firs Neue, sans-serif',
               fontStyle: 'normal',
               fontWeight: 400,
               fontSize: '14px',
               lineHeight: '105%',
               textAlign: 'center',
               color: 'rgba(16, 16, 16, 0.25)',
               opacity: isAnimating ? 1 : 0,
               transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
         >
            Нажмите в открытое пустое место, чтобы выйти из этого режима
         </div>

         {/* Карточка фильтра */}
         <div
            onClick={(e) => e.stopPropagation()}
            style={{
               position: 'absolute',
               width: '360px',
               height: cardStyles.height,
               left: '50%',
               transform: isAnimating ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
               top: cardStyles.top,
               background: '#FFFFFF',
               borderRadius: '20px',
               display: 'flex',
               flexDirection: 'column',
               opacity: isAnimating ? 1 : 0,
               transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
         >
            {/* Заголовок */}
            <div style={{ padding: '15px 15px 0 15px' }}>
               <div
                  style={{
                     fontFamily: 'TT Firs Neue, sans-serif',
                     fontStyle: 'normal',
                     fontWeight: 400,
                     fontSize: '20px',
                     lineHeight: '125%',
                     color: '#101010',
                  }}
               >
                  Фильтрация
               </div>
               <div
                  style={{
                     fontFamily: 'TT Firs Neue, sans-serif',
                     fontStyle: 'normal',
                     fontWeight: 400,
                     fontSize: '14px',
                     lineHeight: '105%',
                     color: 'rgba(16, 16, 16, 0.25)',
                     marginTop: '15px',
                  }}
               >
                  Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
               </div>
            </div>

            {/* Контент шага */}
            <div
               style={{
                  flex: 1,
                  padding: '20px 15px 0 15px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px',
               }}
            >
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
            <div
               style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '15px',
               }}
            >
               {/* Кнопка Назад — как во Frame1/Frame4: type="button" для надёжного клика */}
               <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  onMouseDown={() => setIsBackBtnPressed(true)}
                  onMouseUp={() => setIsBackBtnPressed(false)}
                  onMouseLeave={() => setIsBackBtnPressed(false)}
                  onTouchStart={() => setIsBackBtnPressed(true)}
                  onTouchEnd={() => setIsBackBtnPressed(false)}
                  className="outline-none rounded-[10px] flex items-center justify-center disabled:cursor-not-allowed"
                  style={{
                     width: '50px',
                     height: '50px',
                     border: '1px solid rgba(16, 16, 16, 0.15)',
                     background: 'white',
                     boxSizing: 'border-box',
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

               {/* Кнопка Далее/Применить — как во Frame1/Frame4: type="button" для надёжного клика */}
               <button
                  type="button"
                  onClick={handleNext}
                  onMouseDown={() => setIsNextBtnPressed(true)}
                  onMouseUp={() => setIsNextBtnPressed(false)}
                  onMouseLeave={() => setIsNextBtnPressed(false)}
                  onTouchStart={() => setIsNextBtnPressed(true)}
                  onTouchEnd={() => setIsNextBtnPressed(false)}
                  className="outline-none cursor-pointer flex-1 rounded-[10px] flex items-center justify-center text-center text-white"
                  style={{
                     height: '50px',
                     background: '#101010',
                     border: '1px solid rgba(16, 16, 16, 0.25)',
                     fontFamily: 'TT Firs Neue, sans-serif',
                     fontSize: '16px',
                     lineHeight: '315%',
                     letterSpacing: '0.5px',
                     boxSizing: 'border-box',
                     transform: isNextBtnPressed ? 'scale(0.97)' : 'scale(1)',
                     transition: 'transform 0.15s ease-out',
                     cursor: 'pointer',
                  }}
               >
                  {step === 3 ? 'Применить' : 'Далее'}
               </button>
            </div>
         </div>
      </div>
   );
}
