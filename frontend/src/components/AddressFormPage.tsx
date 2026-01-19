'use client';

import { useState } from 'react';

export default function AddressFormPage() {
  const [formData, setFormData] = useState({
    connectionType: '',
    city: '',
    street: '',
    houseNumber: '',
    agreement: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Здесь будет логика отправки формы
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
      {/* 400-1-2-1 - Main Container */}
      <div
        style={{
          position: 'relative',
          width: '400px',
          height: '870px',
          background: '#FFFFFF'
        }}
      >
        {/* Vector - верхний фон (белый) */}
        <div
          style={{
            position: 'absolute',
            left: '0%',
            right: '0.06%',
            top: '10%',
            bottom: '10%',
            background: '#FFFFFF'
          }}
        />

        {/* Group 7510 - Кнопка дом */}
        <div
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            left: '20px',
            top: '75px',
            cursor: 'pointer'
          }}
          onClick={() => console.log('Home clicked')}
        >
          <div
            style={{
              boxSizing: 'border-box',
              position: 'absolute',
              height: '40px',
              width: '40px',
              border: '1px solid rgba(16, 16, 16, 0.15)',
              backdropFilter: 'blur(5px)',
              borderRadius: '100px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.125 9.375L10 2.5L16.875 9.375M3.125 9.375L10 12.5M3.125 9.375L10 9.375M16.875 9.375L10 12.5M16.875 9.375L10 9.375M10 12.5V17.5" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Group 7509 - Кнопка самолет */}
        <div
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            left: '340px',
            top: '75px',
            cursor: 'pointer'
          }}
          onClick={() => console.log('Share clicked')}
        >
          <div
            style={{
              boxSizing: 'border-box',
              position: 'absolute',
              height: '40px',
              width: '40px',
              border: '1px solid rgba(16, 16, 16, 0.15)',
              backdropFilter: 'blur(5px)',
              borderRadius: '100px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 10L10 2.5L17.5 10M2.5 10L10 12.5M2.5 10L10 10M17.5 10L10 12.5M17.5 10L10 10M10 12.5V17.5" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* гигапоиск 2 - Логотип */}
        <div
          style={{
            position: 'absolute',
            width: '140px',
            height: '10px',
            left: '70px',
            top: '90px'
          }}
        >
          <svg width="140" height="10" viewBox="0 0 140 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 9.80556V0.194444H12.5306V4.86111H5.93306V9.80556H0ZM29.0092 0.194444V9.80556H23.0761V6.02778L9.9708 9.80556H4.0377V0.194444H9.9708V3.97222L23.0761 0.194444H29.0092ZM30.5142 9.80556V0.194444H43.0448V4.86111H36.4473V9.80556H30.5142ZM54.0292 4.47222L51.288 7.97222H56.7705L54.0292 4.47222ZM50.6872 0.194444H57.3713L68.017 9.80556H61.3329L59.8121 7.86111H48.2464L46.7256 9.80556H40.0415L50.6872 0.194444ZM68.7731 9.80556V0.194444H83.744V9.80556H77.811V4.86111H64.706V9.80556H68.7731ZM81.454 0H95.16C98.784 0 101.732 3.24722 101.732 7C101.732 10.7528 98.784 14 95.16 14H81.454C77.831 14 74.883 10.7528 74.883 7C74.883 3.24722 77.831 0 81.454 0ZM93.94 5.05556H82.675C81.642 5.05556 80.797 5.93056 80.797 7C80.797 8.06944 81.642 8.94444 82.675 8.94444H93.94C94.973 8.94444 95.818 8.06944 95.818 7C95.818 5.93056 94.973 5.05556 93.94 5.05556ZM107.834 0.194444V9.80556H101.901V6.02778L88.796 9.80556H82.863V0.194444H88.796V3.97222L101.901 0.194444H107.834ZM123.38 8.75V9.80556H105.544C101.92 9.80556 98.972 10.7528 98.972 7C98.972 3.24722 101.92 0.194444 105.544 0.194444H123.38V5.25H106.764C105.732 5.25 104.887 5.93056 104.887 7C104.887 8.06944 105.732 8.75 106.764 8.75H123.38ZM124.88 9.80556V0.194444H130.813V7.66111L141.252 0.194444H149.852L140.332 7L149.852 9.80556H141.252L136.033 7.0722L130.813 9.80556H124.88Z" fill="#101010" />
          </svg>
        </div>

        {/* Rectangle 30 - Основной контейнер формы */}
        <div
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            left: '5%',
            right: '5%',
            top: '29.89%',
            bottom: '16.67%',
            background: '#FFFFFF',
            border: '1px solid rgba(16, 16, 16, 0.15)',
            backdropFilter: 'blur(7.5px)',
            borderRadius: '20px'
          }}
        />

        {/* Текст заголовка */}
        <div
          style={{
            position: 'absolute',
            left: '8.75%',
            right: '8.75%',
            top: '31.61%',
            bottom: '59.77%',
            fontFamily: "'TT Firs Neue', sans-serif",
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '125%',
            color: '#101010',
            display: 'flex',
            alignItems: 'flex-start'
          }}
        >
          Маркетплейс тарифных планов, операторов на твоем адресе. Бесплатно заказать «wi-fi»
        </div>

        {/* Group 7432 - Поле "Подключение" (Select) */}
        <div
          style={{
            position: 'absolute',
            left: '8.75%',
            right: '8.75%',
            top: '42.53%',
            bottom: '51.72%'
          }}
        >
          <div
            style={{
              boxSizing: 'border-box',
              position: 'relative',
              width: '100%',
              height: '100%',
              border: '1px solid #101010',
              borderRadius: '10px',
              background: '#FFFFFF'
            }}
          >
            <select
              value={formData.connectionType}
              onChange={(e) => handleInputChange('connectionType', e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                paddingLeft: '15px',
                paddingRight: '40px',
                border: 'none',
                borderRadius: '10px',
                background: 'transparent',
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '125%',
                color: formData.connectionType ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="" disabled>Подключение</option>
              <option value="internet">Интернет</option>
              <option value="tv">Телевидение</option>
              <option value="phone">Телефония</option>
              <option value="all">Все услуги</option>
            </select>
            <div
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                pointerEvents: 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
                <path d="M4 6L8 10L12 6" stroke="#101010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Group 7514 - Поле "Название населённого пункта" (Input) */}
        <div
          style={{
            position: 'absolute',
            left: '8.75%',
            right: '8.75%',
            top: '48.85%',
            bottom: '45.4%',
            opacity: formData.city ? 1 : 0.5
          }}
        >
          <div
            style={{
              boxSizing: 'border-box',
              position: 'relative',
              width: '100%',
              height: '100%',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              borderRadius: '10px',
              background: '#FFFFFF'
            }}
          >
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Название населённого пункта"
              style={{
                width: '100%',
                height: '100%',
                paddingLeft: '15px',
                paddingRight: '40px',
                border: 'none',
                borderRadius: '10px',
                background: 'transparent',
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '125%',
                color: formData.city ? '#101010' : 'rgba(16, 16, 16, 0.25)',
                outline: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                pointerEvents: 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
                <path d="M4 6L8 10L12 6" stroke="rgba(16, 16, 16, 0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Group 7437 - Поле "Улица" (Input) */}
        <div
          style={{
            position: 'absolute',
            left: '8.75%',
            right: '8.75%',
            top: '55.17%',
            bottom: '39.08%',
            opacity: formData.street ? 1 : 0.5
          }}
        >
          <div
            style={{
              boxSizing: 'border-box',
              position: 'relative',
              width: '100%',
              height: '100%',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              borderRadius: '10px',
              background: '#FFFFFF'
            }}
          >
            <input
              type="text"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              placeholder="Улица"
              style={{
                width: '100%',
                height: '100%',
                paddingLeft: '15px',
                paddingRight: '40px',
                border: 'none',
                borderRadius: '10px',
                background: 'transparent',
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '125%',
                color: formData.street ? '#101010' : 'rgba(16, 16, 16, 0.25)',
                outline: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                pointerEvents: 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
                <path d="M4 6L8 10L12 6" stroke="rgba(16, 16, 16, 0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Group 7438 - Поле "Номер дома" (Input) */}
        <div
          style={{
            position: 'absolute',
            left: '8.75%',
            right: '8.75%',
            top: '61.49%',
            bottom: '32.76%',
            opacity: formData.houseNumber ? 1 : 0.5
          }}
        >
          <div
            style={{
              boxSizing: 'border-box',
              position: 'relative',
              width: '100%',
              height: '100%',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              borderRadius: '10px',
              background: '#FFFFFF'
            }}
          >
            <input
              type="text"
              value={formData.houseNumber}
              onChange={(e) => handleInputChange('houseNumber', e.target.value)}
              placeholder="Номер дома"
              style={{
                width: '100%',
                height: '100%',
                paddingLeft: '15px',
                paddingRight: '40px',
                border: 'none',
                borderRadius: '10px',
                background: 'transparent',
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '125%',
                color: formData.houseNumber ? '#101010' : 'rgba(16, 16, 16, 0.25)',
                outline: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                pointerEvents: 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
                <path d="M4 6L8 10L12 6" stroke="rgba(16, 16, 16, 0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Group 7372 - Чекбокс согласия */}
        <div
          style={{
            position: 'absolute',
            left: '8.75%',
            right: '8.75%',
            top: '67.82%',
            bottom: '26.44%'
          }}
        >
          <div
            style={{
              boxSizing: 'border-box',
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              border: '1px solid rgba(16, 16, 16, 0.25)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '35px',
              paddingRight: '15px',
              background: '#FFFFFF',
              cursor: 'pointer'
            }}
            onClick={() => handleInputChange('agreement', !formData.agreement)}
          >
            <div
              style={{
                boxSizing: 'border-box',
                position: 'absolute',
                width: '16px',
                height: '16px',
                left: '15px',
                border: '1px solid rgba(16, 16, 16, 0.5)',
                borderRadius: '2px',
                background: formData.agreement ? '#101010' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {formData.agreement && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '105%',
                color: '#101010'
              }}
            >
              Покажите своё согласие с условиями политики конфиденциальности портала
            </span>
          </div>
        </div>

        {/* Group 7377 - Кнопка "Показать всех операторов" */}
        <div
          style={{
            position: 'absolute',
            left: '8.75%',
            right: '8.75%',
            top: '75.86%',
            bottom: '18.39%'
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={!formData.agreement}
            style={{
              boxSizing: 'border-box',
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              background: formData.agreement ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: formData.agreement ? 'pointer' : 'not-allowed',
              fontFamily: "'TT Firs Neue', sans-serif",
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '315%',
              textAlign: 'center',
              color: '#FFFFFF',
              outline: 'none'
            }}
          >
            Показать всех операторов
          </button>
        </div>

        {/* Group 7476 - Уведомление о cookies */}
        <div
          style={{
            position: 'absolute',
            width: '360px',
            height: '115px',
            left: '20px',
            top: '75px'
          }}
        >
          <div
            style={{
              boxSizing: 'border-box',
              position: 'absolute',
              width: '360px',
              height: '115px',
              background: '#FFFFFF',
              border: '1px solid rgba(16, 16, 16, 0.15)',
              backdropFilter: 'blur(7.5px)',
              borderRadius: '20px',
              padding: '15px 20px'
            }}
          >
            <div
              style={{
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '125%',
                color: 'rgba(16, 16, 16, 0.5)',
                marginBottom: '5px'
              }}
            >
              Автоматически закроется через 7
            </div>
            <div
              style={{
                fontFamily: "'TT Firs Neue', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '105%',
                color: '#101010'
              }}
            >
              Если продолжаете использовать этот портал, вы выражаете согласие на использование файлов куки в соответствии с условиями политики конфиденциальности портал
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
