'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

type ContactMethod = 'max' | 'telegram' | 'phone';
type ConsultationStep = 'contact-method' | 'phone-after-method';

interface NotificationItem {
  id: string;
  timer: number;
  content: string;
  hasLink?: boolean;
}

interface ConsultationFlowProps {
  onClose: () => void;
  onSubmit: (data: { phone?: string; method?: ContactMethod }) => void | Promise<void>;
  onSkip?: () => void | Promise<void>;
}

export default function ConsultationFlow({ onClose, onSubmit, onSkip }: ConsultationFlowProps) {
  const [step, setStep] = useState<ConsultationStep>('contact-method');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod | null>(null);
  const [phoneError, setPhoneError] = useState(false);
  const [showSkipAfterError, setShowSkipAfterError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Анимация появления
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  }, []);

  // Button press states for animations
  const [isMainBtnPressed, setIsMainBtnPressed] = useState(false);
  const [isBackBtnPressed, setIsBackBtnPressed] = useState(false);
  const [isNextBtnPressed, setIsNextBtnPressed] = useState(false);
  const [isPhoneNextBtnPressed, setIsPhoneNextBtnPressed] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'privacy',
      timer: 7,
      content: 'Информация полностью конфиденциальна.',
      hasLink: true,
    },
  ]);

  // Таймер для уведомлений
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    intervalId = setInterval(() => {
      setNotifications((prev) =>
        prev
          .map((n) => ({ ...n, timer: n.timer - 1 }))
          .filter((n) => n.timer > 0)
      );
    }, 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Форматирование номера телефона с ограничением длины
  const formatPhoneNumber = useCallback((value: string) => {
    // Ограничиваем ввод до 11 цифр (максимум для российского номера)
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length === 0) return '';

    let formatted = '+7 ';
    const rest = digits.startsWith('7') ? digits.slice(1) : digits.startsWith('8') ? digits.slice(1) : digits;

    if (rest.length > 0) formatted += rest.slice(0, 3);
    if (rest.length > 3) formatted += ' ' + rest.slice(3, 6);
    if (rest.length > 6) formatted += ' ' + rest.slice(6, 8);
    if (rest.length > 8) formatted += ' ' + rest.slice(8, 10);

    return formatted;
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setPhoneError(false);
    setShowSkipAfterError(false);
  }, [formatPhoneNumber]);

  const handleSubmitPhoneAfterMethod = useCallback(() => {
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    // Валидация: российский номер должен быть строго 11 цифр
    if (phoneDigits.length === 11) {
      onSubmit({ phone: phoneNumber, method: 'phone' });
    }
  }, [phoneNumber, onSubmit]);

  const handleSelectMethod = useCallback((method: ContactMethod) => {
    setSelectedMethod(method);
  }, []);

  const handleNextFromMethod = useCallback(() => {
    if (selectedMethod === 'phone') {
      // Добавляем уведомление о конфиденциальности при переходе на ввод телефона
      setNotifications((prev) => {
        // Проверяем, нет ли уже такого уведомления
        if (!prev.find((n) => n.id === 'privacy-phone')) {
          return [
            ...prev,
            {
              id: 'privacy-phone',
              timer: 7,
              content: 'Информация полностью конфиденциальна.',
              hasLink: true,
            },
          ];
        }
        return prev;
      });
      setStep('phone-after-method');
    } else if (selectedMethod) {
      onSubmit({ phone: phoneNumber, method: selectedMethod });
    }
  }, [selectedMethod, phoneNumber, onSubmit]);

  const handleBack = useCallback(() => {
    if (step === 'phone-after-method') {
      setStep('contact-method');
    } else {
      onClose();
    }
  }, [step, onClose]);

  const isPhoneValid = useMemo(() => {
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    return phoneDigits.length === 11;
  }, [phoneNumber]);

  // Закрытие уведомления
  const handleCloseNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Рендер уведомлений - пиксель перфект по Figma (мемоизирован для оптимизации)
  const renderNotifications = useMemo(() => {
    if (notifications.length === 0) return null;

    return (
      <>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="absolute bg-white rounded-[20px]"
            style={{
              width: '360px',
              height: '90px',
              left: 0,
              top: `${75 + index * 95}px`,
              boxSizing: 'border-box',
              backdropFilter: 'blur(7.5px)',
              transition: 'top 0.3s ease-in-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - right: 37px from right, top: 9.5px */}
            <button
              onClick={() => handleCloseNotification(notification.id)}
              className="absolute flex items-center justify-center"
              style={{
                right: '37px',
                top: '9.5px',
                width: '16px',
                height: '16px',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="rgba(16, 16, 16, 0.15)" />
                <path d="M10.5 5.5L5.5 10.5M5.5 5.5L10.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Timer text - top: 15px from card */}
            <div
              className="absolute font-normal"
              style={{
                width: '300px',
                height: '20px',
                left: '15px',
                top: '15px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '12px',
                lineHeight: '165%',
                color: 'rgba(16, 16, 16, 0.25)',
                letterSpacing: '0.5px',
              }}
            >
              Автоматически закроется через {notification.timer}
            </div>

            {/* Content - top: 45px from card */}
            <div
              className="absolute font-normal"
              style={{
                width: '330px',
                height: '30px',
                left: '15px',
                top: '45px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '14px',
                lineHeight: '105%',
                color: '#101010',
                letterSpacing: '0.5px',
              }}
            >
              {notification.content}
              {notification.hasLink && (
                <>
                  {' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#007AFF] underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Подробнее об этом писали в медиа
                  </a>
                </>
              )}
            </div>
          </div>
        ))}
      </>
    );
  }, [notifications, handleCloseNotification]);

  // Экран выбора способа связи — flex: header влезает, карточка в оставшемся месте, прокрутка только внутри карточки
  const renderContactMethod = () => (
    <div className="flex flex-col flex-1 min-h-0 w-full px-5">
      {/* Шапка: подсказка + место под уведомления (уведомления рендерятся абсолютно поверх) */}
      <div className="flex-shrink-0 relative" style={{ minHeight: '105px' }}>
        {notifications.length === 0 && (
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
        )}
        {renderNotifications}
      </div>

      {/* Карточка консультации — занимает остаток экрана, внутри прокручиваются только опции */}
      <div
        className="flex-1 min-h-0 flex flex-col mx-0 rounded-[20px] bg-white overflow-hidden"
        style={{ maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto', backdropFilter: 'blur(7.5px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 px-[15px] pt-[15px]">
          <div
            className="font-normal"
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '20px',
              lineHeight: '125%',
              color: '#101010',
              letterSpacing: '0.5px',
            }}
          >
            Консультация
          </div>
          <div
            className="font-normal pt-[15px]"
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              lineHeight: '105%',
              color: 'rgba(16, 16, 16, 0.25)',
              letterSpacing: '0.5px',
            }}
          >
            Напишите нам обо всем, а мы ответим вам. Пожалуйста, проверьте правильность
          </div>
        </div>

        {/* Опции выбора — прокручиваемая область */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-[15px] pt-[15px]" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex flex-col gap-[5px] pb-2">
            {/* Написать в Max (неактивна) */}
            <div
              className="rounded-[10px] cursor-pointer flex items-center justify-between px-[15px]"
              style={{
                height: '50px',
                minHeight: '50px',
                border: '1px solid rgba(16, 16, 16, 0.25)',
                opacity: 0.25,
                boxSizing: 'border-box',
              }}
            >
              <span
                className="font-normal"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  lineHeight: '125%',
                  color: 'rgba(16, 16, 16, 0.5)',
                  letterSpacing: '0.5px',
                }}
              >
                Написать нам в «Max»
              </span>
              <div className="w-4 h-4 rounded-full border border-[rgba(16,16,16,0.5)] flex-shrink-0" />
            </div>

            {/* Написать в Telegram */}
            <div
              className="rounded-[10px] cursor-pointer flex items-center justify-between px-[15px]"
              style={{
                height: '50px',
                minHeight: '50px',
                border: selectedMethod === 'telegram' ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.25)',
                boxSizing: 'border-box',
              }}
              onClick={() => handleSelectMethod('telegram')}
            >
              <span
                className="font-normal"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  lineHeight: '125%',
                  color: selectedMethod === 'telegram' ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                  letterSpacing: '0.5px',
                }}
              >
                Написать нам в «Telegram»
              </span>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: selectedMethod === 'telegram' ? '#101010' : 'transparent',
                  border: selectedMethod === 'telegram' ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
                }}
              >
                {selectedMethod === 'telegram' && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>

            {/* Перезвонить на номер телефона */}
            <div
              className="rounded-[10px] cursor-pointer flex items-center justify-between px-[15px]"
              style={{
                height: '50px',
                minHeight: '50px',
                border: selectedMethod === 'phone' ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.25)',
                boxSizing: 'border-box',
              }}
              onClick={() => handleSelectMethod('phone')}
            >
              <span
                className="font-normal"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  lineHeight: '125%',
                  color: '#101010',
                  letterSpacing: '0.5px',
                }}
              >
                Перезвонить на номер телефона
              </span>
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: selectedMethod === 'phone' ? '#101010' : 'transparent',
                  border: selectedMethod === 'phone' ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
                }}
              >
                {selectedMethod === 'phone' && (
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки внизу */}
        <div className="flex-shrink-0 flex gap-[10px] px-[15px] pb-[15px] pt-[10px]">
          <button
            type="button"
            onClick={handleBack}
            onMouseDown={() => setIsBackBtnPressed(true)}
            onMouseUp={() => setIsBackBtnPressed(false)}
            onMouseLeave={() => setIsBackBtnPressed(false)}
            onTouchStart={() => setIsBackBtnPressed(true)}
            onTouchEnd={() => setIsBackBtnPressed(false)}
            className="outline-none cursor-pointer rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{
              width: '50px',
              height: '50px',
              border: '1px solid rgba(16, 16, 16, 0.15)',
              background: 'white',
              boxSizing: 'border-box',
              transform: isBackBtnPressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <svg width="12" height="6" viewBox="0 0 12 6" fill="none" style={{ transform: 'rotate(90deg)' }}>
              <path d="M1 1L6 5L11 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNextFromMethod}
            onMouseDown={() => setIsNextBtnPressed(true)}
            onMouseUp={() => setIsNextBtnPressed(false)}
            onMouseLeave={() => setIsNextBtnPressed(false)}
            onTouchStart={() => setIsNextBtnPressed(true)}
            onTouchEnd={() => setIsNextBtnPressed(false)}
            disabled={!selectedMethod}
            className="outline-none flex-1 rounded-[10px] flex items-center justify-center text-center text-white cursor-pointer min-h-[50px] disabled:cursor-not-allowed"
            style={{
              background: selectedMethod ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '16px',
              lineHeight: '315%',
              letterSpacing: '0.5px',
              boxSizing: 'border-box',
              transform: isNextBtnPressed && selectedMethod ? 'scale(0.97)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            Далее
          </button>
        </div>
      </div>
    </div>
  );

  // Экран ввода телефона — та же flex-структура: header влезает, карточка в оставшемся месте
  const renderPhoneAfterMethod = () => (
    <div className="flex flex-col flex-1 min-h-0 w-full px-5">
      <div className="flex-shrink-0 relative" style={{ minHeight: '105px' }}>
        {notifications.length === 0 && (
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
        )}
        {renderNotifications}
      </div>

      <div
        className="flex-1 min-h-0 flex flex-col mx-0 rounded-[20px] bg-white overflow-hidden"
        style={{ maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto', backdropFilter: 'blur(7.5px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 px-[15px] pt-[15px]">
          <div
            className="font-normal"
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '20px',
              lineHeight: '125%',
              color: '#101010',
              letterSpacing: '0.5px',
            }}
          >
            Консультация
          </div>
          <div
            className="font-normal pt-[15px]"
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              lineHeight: '105%',
              color: 'rgba(16, 16, 16, 0.25)',
              letterSpacing: '0.5px',
            }}
          >
            Напишите номер вашего сотового телефона. Пожалуйста, проверьте правильность
          </div>
        </div>

        <div className="flex-shrink-0 px-[15px] pt-[15px]">
          <div
            className="rounded-[10px] w-full"
            style={{
              height: '50px',
              border: isPhoneValid ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.5)',
              boxSizing: 'border-box',
            }}
          >
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Номер сотового телефона"
              className="w-full h-full px-[15px] bg-transparent outline-none"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '16px',
                lineHeight: '125%',
                color: phoneNumber ? '#101010' : 'rgba(16, 16, 16, 0.25)',
                letterSpacing: '0.5px',
              }}
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-[10px] px-[15px] pb-[15px] pt-[15px]">
          <button
            type="button"
            onClick={handleBack}
            onMouseDown={() => setIsBackBtnPressed(true)}
            onMouseUp={() => setIsBackBtnPressed(false)}
            onMouseLeave={() => setIsBackBtnPressed(false)}
            onTouchStart={() => setIsBackBtnPressed(true)}
            onTouchEnd={() => setIsBackBtnPressed(false)}
            className="outline-none cursor-pointer rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{
              width: '50px',
              height: '50px',
              border: '1px solid rgba(16, 16, 16, 0.15)',
              background: 'white',
              boxSizing: 'border-box',
              transform: isBackBtnPressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <svg width="12" height="6" viewBox="0 0 12 6" fill="none" style={{ transform: 'rotate(90deg)' }}>
              <path d="M1 1L6 5L11 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleSubmitPhoneAfterMethod}
            onMouseDown={() => setIsPhoneNextBtnPressed(true)}
            onMouseUp={() => setIsPhoneNextBtnPressed(false)}
            onMouseLeave={() => setIsPhoneNextBtnPressed(false)}
            onTouchStart={() => setIsPhoneNextBtnPressed(true)}
            onTouchEnd={() => setIsPhoneNextBtnPressed(false)}
            disabled={!isPhoneValid}
            className="outline-none flex-1 rounded-[10px] flex items-center justify-center text-center text-white cursor-pointer min-h-[50px] disabled:cursor-not-allowed"
            style={{
              background: isPhoneValid ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '16px',
              lineHeight: '315%',
              letterSpacing: '0.5px',
              boxSizing: 'border-box',
              transform: isPhoneNextBtnPressed && isPhoneValid ? 'scale(0.97)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            Далее
          </button>
        </div>
      </div>
    </div>
  );

  const handleBackgroundClick = useCallback(() => {
    // Анимация исчезновения
    setIsAnimating(false);
    setTimeout(() => {
      setShouldRender(false);
      if (onSkip) {
        onSkip();
      } else {
        onClose();
      }
    }, 300);
  }, [onSkip, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center bg-[#F5F5F5] overflow-hidden cursor-pointer"
      style={{
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={handleBackgroundClick}
    >
      {/* Main Container — клик по пустоте (подсказка, отступы) всплывает к оверлею и закрывает; карточка stopPropagation */}
      <div
        className="relative w-full max-w-[400px] bg-[#F5F5F5] flex flex-col flex-1 min-h-0 overflow-hidden"
        style={{
          transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxSizing: 'border-box',
        }}
      >
        <div className="absolute left-0 right-[0.06%] top-0 bottom-0 bg-[#F5F5F5]" aria-hidden />

        {step === 'contact-method' && renderContactMethod()}
        {step === 'phone-after-method' && renderPhoneAfterMethod()}
      </div>
    </div>
  );
}
