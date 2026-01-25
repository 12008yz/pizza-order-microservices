'use client';

import { useState, useEffect, useCallback } from 'react';

type ContactMethod = 'max' | 'telegram' | 'phone';
type ConsultationStep = 'phone-input' | 'contact-method' | 'phone-after-method';

interface NotificationItem {
  id: string;
  timer: number;
  title: string;
  content: string;
  hasLink?: boolean;
}

interface ConsultationFlowProps {
  onClose: () => void;
  onSubmit: (data: { phone?: string; method?: ContactMethod }) => void | Promise<void>;
  onSkip?: () => void | Promise<void>;
}

export default function ConsultationFlow({ onClose, onSubmit, onSkip }: ConsultationFlowProps) {
  const [step, setStep] = useState<ConsultationStep>('phone-input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod | null>(null);
  const [phoneError, setPhoneError] = useState(false);
  const [showSkipAfterError, setShowSkipAfterError] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'privacy',
      timer: 7,
      title: 'Автоматически закроется через',
      content: 'Информация полностью конфиденциальна.',
      hasLink: true,
    },
  ]);

  // Таймер для уведомлений
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) =>
        prev
          .map((n) => ({ ...n, timer: n.timer - 1 }))
          .filter((n) => n.timer > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Форматирование номера телефона
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');

    if (digits.length === 0) return '';

    let formatted = '+7 ';
    const rest = digits.startsWith('7') ? digits.slice(1) : digits.startsWith('8') ? digits.slice(1) : digits;

    if (rest.length > 0) formatted += rest.slice(0, 3);
    if (rest.length > 3) formatted += ' ' + rest.slice(3, 6);
    if (rest.length > 6) formatted += ' ' + rest.slice(6, 8);
    if (rest.length > 8) formatted += ' ' + rest.slice(8, 10);

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    // Сбрасываем ошибку и флаг "показать пропустить" при изменении ввода
    setPhoneError(false);
    setShowSkipAfterError(false);
  };

  const handleSubmitPhone = () => {
    if (phoneNumber.replace(/\D/g, '').length >= 11) {
      // Переходим к выбору способа связи
      setStep('contact-method');
    } else {
      // Показываем ошибку
      setPhoneError(true);
      setShowSkipAfterError(true);
    }
  };

  const handleSubmitPhoneAfterMethod = () => {
    if (phoneNumber.replace(/\D/g, '').length >= 11) {
      // Отправляем данные с телефоном и методом связи
      onSubmit({ phone: phoneNumber, method: 'phone' });
    }
  };

  const handleSelectMethod = (method: ContactMethod) => {
    setSelectedMethod(method);
  };

  const handleNextFromMethod = () => {
    if (selectedMethod === 'phone') {
      setStep('phone-after-method');
    } else if (selectedMethod) {
      onSubmit({ phone: phoneNumber, method: selectedMethod });
    }
  };

  const handleBack = () => {
    if (step === 'phone-after-method') {
      setStep('contact-method');
    } else if (step === 'contact-method') {
      setStep('phone-input');
    } else {
      onClose();
    }
  };

  const isPhoneValid = phoneNumber.replace(/\D/g, '').length >= 11;
  const hasInput = phoneNumber.length > 0;

  // Определяем текст и поведение кнопки
  const getButtonConfig = () => {
    if (showSkipAfterError) {
      return { text: 'Пропустить', action: onSkip || onClose, isError: false };
    }
    if (hasInput) {
      return { text: 'Далее', action: handleSubmitPhone, isError: phoneError };
    }
    return { text: 'Пропустить', action: onSkip || onClose, isError: false };
  };

  const buttonConfig = getButtonConfig();

  // Рендер уведомлений
  const renderNotifications = () => (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="box-border absolute bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px]"
          style={{
            width: '360px',
            height: '85px',
            left: '20px',
            top: `${75 + index * 90}px`,
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
            className="absolute"
            style={{
              right: '15px',
              top: '15px',
              width: '16px',
              height: '16px',
              opacity: 0.15,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Timer text */}
          <div
            className="font-normal text-xs leading-[165%]"
            style={{
              position: 'absolute',
              width: '300px',
              height: '20px',
              left: '15px',
              top: '15px',
              color: 'rgba(16, 16, 16, 0.5)',
              letterSpacing: '0.5px',
            }}
          >
            {notification.title} {notification.timer}
          </div>

          {/* Content */}
          <div
            className="font-normal text-sm leading-[105%]"
            style={{
              position: 'absolute',
              width: '330px',
              height: '30px',
              left: '15px',
              top: '40px',
              color: '#101010',
              letterSpacing: '0.5px',
            }}
          >
            {notification.content}
            {notification.hasLink && (
              <>
                {' '}
                <a href="#" className="text-blue-600 underline">
                  Подробнее об этом писали в медиа
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );

  // Экран ввода телефона
  const renderPhoneInput = () => (
    <>
      {renderNotifications()}

      {/* Карточка консультации */}
      <div
        className="box-border absolute bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px]"
        style={{
          width: '360px',
          height: '235px',
          left: '20px',
          top: '490px',
        }}
      >
        {/* Заголовок */}
        <div
          className="absolute font-normal text-xl leading-[125%] flex items-center"
          style={{
            width: '330px',
            height: '25px',
            left: '15px',
            top: '15px',
            color: '#101010',
            letterSpacing: '0.5px',
          }}
        >
          Бесплатная консультация
        </div>

        {/* Подзаголовок */}
        <div
          className="absolute font-normal text-sm leading-[105%]"
          style={{
            width: '330px',
            height: '30px',
            left: '15px',
            top: '50px',
            color: phoneError ? '#FF3B30' : 'rgba(16, 16, 16, 0.25)',
            letterSpacing: '0.5px',
          }}
        >
          {phoneError
            ? 'Неправильный номер телефона. Проверьте и попробуйте снова'
            : 'Напишите номер вашего сотового телефона. Пожалуйста, проверьте правильность'
          }
        </div>

        {/* Поле ввода телефона */}
        <div
          className="box-border absolute rounded-[10px]"
          style={{
            left: '15px',
            right: '15px',
            top: '95px',
            height: '50px',
            border: phoneError
              ? '1px solid #FF3B30'
              : isPhoneValid
                ? '1px solid #101010'
                : '1px solid rgba(16, 16, 16, 0.25)',
          }}
        >
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Номер сотового телефона"
            className="w-full h-full px-[15px] font-normal text-base leading-[125%] bg-transparent outline-none"
            style={{
              color: phoneError ? '#FF3B30' : phoneNumber ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              letterSpacing: '0.5px',
            }}
          />
        </div>

        {/* Кнопка */}
        <button
          onClick={buttonConfig.action}
          className="box-border absolute rounded-[10px] font-normal text-base leading-[315%] flex items-center justify-center text-center text-white"
          style={{
            left: '15px',
            right: '15px',
            top: '160px',
            height: '50px',
            background: '#101010',
            border: '1px solid rgba(16, 16, 16, 0.25)',
            letterSpacing: '0.5px',
            transition: 'background-color 0.2s ease',
          }}
        >
          {buttonConfig.text}
        </button>
      </div>
    </>
  );

  // Экран выбора способа связи
  const renderContactMethod = () => (
    <>
      {/* Подсказка вверху */}
      <div
        className="absolute font-normal text-sm leading-[105%] flex items-center justify-center text-center"
        style={{
          width: '240px',
          height: '30px',
          left: 'calc(50% - 240px/2)',
          top: '75px',
          color: 'rgba(16, 16, 16, 0.15)',
          letterSpacing: '0.5px',
        }}
      >
        Нажмите в открытое пустое место, чтобы выйти из этого режима
      </div>

      {/* Карточка с уведомлением */}
      {notifications.length > 0 && renderNotifications()}

      {/* Карточка консультации */}
      <div
        className="box-border absolute bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px]"
        style={{
          width: '360px',
          height: '350px',
          left: '20px',
          top: '375px',
        }}
      >
        {/* Заголовок */}
        <div
          className="absolute font-normal text-xl leading-[125%] flex items-center"
          style={{
            width: '330px',
            height: '25px',
            left: '15px',
            top: '15px',
            color: '#101010',
            letterSpacing: '0.5px',
          }}
        >
          Консультация
        </div>

        {/* Подзаголовок */}
        <div
          className="absolute font-normal text-sm leading-[105%]"
          style={{
            width: '330px',
            height: '30px',
            left: '15px',
            top: '55px',
            color: 'rgba(16, 16, 16, 0.25)',
            letterSpacing: '0.5px',
          }}
        >
          Напишите нам обо всем, а мы ответим вам. Пожалуйста, проверьте правильность
        </div>

        {/* Опции выбора */}
        <div
          className="absolute flex flex-col gap-[5px]"
          style={{
            width: '330px',
            left: '15px',
            top: '105px',
          }}
        >
          {/* Написать в Max (неактивна) */}
          <div
            className="box-border relative rounded-[10px] cursor-pointer"
            style={{
              height: '50px',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              opacity: 0.25,
            }}
          >
            <div
              className="absolute font-normal text-base leading-[125%] flex items-center"
              style={{
                left: '15px',
                top: '15px',
                color: 'rgba(16, 16, 16, 0.5)',
                letterSpacing: '0.5px',
              }}
            >
              Написать нам в «Max»
            </div>
            <div
              className="absolute w-4 h-4 rounded-full border"
              style={{
                right: '15px',
                top: '17px',
                borderColor: 'rgba(16, 16, 16, 0.5)',
                borderWidth: '1px',
              }}
            />
          </div>

          {/* Написать в Telegram (активна) */}
          <div
            className="box-border relative rounded-[10px] cursor-pointer"
            style={{
              height: '50px',
              border: selectedMethod === 'telegram' ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.25)',
            }}
            onClick={() => handleSelectMethod('telegram')}
          >
            <div
              className="absolute font-normal text-base leading-[125%] flex items-center"
              style={{
                left: '15px',
                top: '15px',
                color: selectedMethod === 'telegram' ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                letterSpacing: '0.5px',
              }}
            >
              Написать нам в «Telegram»
            </div>
            <div
              className="absolute w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                right: '15px',
                top: '17px',
                background: selectedMethod === 'telegram' ? '#101010' : 'transparent',
                border: selectedMethod === 'telegram' ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {selectedMethod === 'telegram' && (
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Перезвонить на номер телефона (активна) */}
          <div
            className="box-border relative rounded-[10px] cursor-pointer"
            style={{
              height: '50px',
              border: selectedMethod === 'phone' ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.25)',
            }}
            onClick={() => handleSelectMethod('phone')}
          >
            <div
              className="absolute font-normal text-base leading-[125%] flex items-center"
              style={{
                left: '15px',
                top: '15px',
                color: '#101010',
                letterSpacing: '0.5px',
              }}
            >
              Перезвонить на номер телефона
            </div>
            <div
              className="absolute w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                right: '15px',
                top: '17px',
                background: selectedMethod === 'phone' ? '#101010' : 'transparent',
                border: selectedMethod === 'phone' ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
              }}
            >
              {selectedMethod === 'phone' && (
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Кнопки внизу */}
        <div
          className="absolute flex gap-[10px]"
          style={{
            left: '15px',
            right: '15px',
            bottom: '15px',
            height: '50px',
          }}
        >
          {/* Кнопка Назад */}
          <button
            onClick={handleBack}
            className="box-border rounded-[10px] flex items-center justify-center"
            style={{
              width: '50px',
              height: '50px',
              border: '1px solid rgba(16, 16, 16, 0.15)',
            }}
          >
            <svg width="12" height="6" viewBox="0 0 12 6" fill="none" style={{ transform: 'rotate(90deg)' }}>
              <path d="M1 1L6 5L11 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Кнопка Далее */}
          <button
            onClick={handleNextFromMethod}
            disabled={!selectedMethod}
            className="box-border flex-1 rounded-[10px] font-normal text-base leading-[315%] flex items-center justify-center text-center text-white"
            style={{
              height: '50px',
              background: selectedMethod ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              letterSpacing: '0.5px',
            }}
          >
            Далее
          </button>
        </div>
      </div>
    </>
  );

  // Экран ввода телефона после выбора метода
  const renderPhoneAfterMethod = () => (
    <>
      {/* Подсказка вверху */}
      <div
        className="absolute font-normal text-sm leading-[105%] flex items-center justify-center text-center"
        style={{
          width: '240px',
          height: '30px',
          left: 'calc(50% - 240px/2)',
          top: '75px',
          color: 'rgba(16, 16, 16, 0.15)',
          letterSpacing: '0.5px',
        }}
      >
        Нажмите в открытое пустое место, чтобы выйти из этого режима
      </div>

      {/* Карточка с уведомлением */}
      {notifications.length > 0 && renderNotifications()}

      {/* Карточка консультации */}
      <div
        className="box-border absolute bg-white border border-[rgba(16,16,16,0.15)] backdrop-blur-[7.5px] rounded-[20px]"
        style={{
          width: '360px',
          height: '240px',
          left: '20px',
          top: '485px',
        }}
      >
        {/* Заголовок */}
        <div
          className="absolute font-normal text-xl leading-[125%] flex items-center"
          style={{
            width: '330px',
            height: '25px',
            left: '15px',
            top: '15px',
            color: '#101010',
            letterSpacing: '0.5px',
          }}
        >
          Консультация
        </div>

        {/* Подзаголовок */}
        <div
          className="absolute font-normal text-sm leading-[105%]"
          style={{
            width: '330px',
            height: '30px',
            left: '15px',
            top: '55px',
            color: 'rgba(16, 16, 16, 0.25)',
            letterSpacing: '0.5px',
          }}
        >
          Напишите номер вашего сотового телефона. Пожалуйста, проверьте правильность
        </div>

        {/* Поле ввода телефона */}
        <div
          className="box-border absolute rounded-[10px]"
          style={{
            left: '15px',
            right: '15px',
            top: '105px',
            height: '50px',
            border: isPhoneValid ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.5)',
          }}
        >
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Номер сотового телефона"
            className="w-full h-full px-[15px] font-normal text-base leading-[125%] bg-transparent outline-none"
            style={{
              color: phoneNumber ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              letterSpacing: '0.5px',
            }}
          />
        </div>

        {/* Кнопки внизу */}
        <div
          className="absolute flex gap-[10px]"
          style={{
            left: '15px',
            right: '15px',
            bottom: '15px',
            height: '50px',
          }}
        >
          {/* Кнопка Назад */}
          <button
            onClick={handleBack}
            className="box-border rounded-[10px] flex items-center justify-center"
            style={{
              width: '50px',
              height: '50px',
              border: '1px solid rgba(16, 16, 16, 0.15)',
            }}
          >
            <svg width="12" height="6" viewBox="0 0 12 6" fill="none" style={{ transform: 'rotate(90deg)' }}>
              <path d="M1 1L6 5L11 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Кнопка Далее */}
          <button
            onClick={handleSubmitPhoneAfterMethod}
            disabled={!isPhoneValid}
            className="box-border flex-1 rounded-[10px] font-normal text-base leading-[315%] flex items-center justify-center text-center text-white"
            style={{
              height: '50px',
              background: isPhoneValid ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              letterSpacing: '0.5px',
            }}
          >
            Далее
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'phone-input') {
          onClose();
        }
      }}
    >
      {/* Main Container */}
      <div className="relative w-[400px] h-[870px] bg-white">
        {/* Background */}
        <div className="absolute left-0 right-[0.06%] top-0 bottom-0 bg-white" />

        {step === 'phone-input' && renderPhoneInput()}
        {step === 'contact-method' && renderContactMethod()}
        {step === 'phone-after-method' && renderPhoneAfterMethod()}
      </div>
    </div>
  );
}
