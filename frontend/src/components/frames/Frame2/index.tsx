'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Provider } from '../../../services/api/types';
import { AddressProvider, useAddress } from '../../../contexts/AddressContext';

function ProvidersContent() {
  const router = useRouter();
  const { addressData } = useAddress();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем данные из sessionStorage
    const savedProviders = sessionStorage.getItem('providers');
    const savedAddressData = sessionStorage.getItem('addressData');

    if (savedProviders) {
      try {
        const parsedProviders = JSON.parse(savedProviders);
        setProviders(parsedProviders);
      } catch (error) {
        console.error('Error parsing providers:', error);
      }
    }

    if (savedAddressData) {
      try {
        const parsedAddress = JSON.parse(savedAddressData);
        // Можно использовать parsedAddress для отображения адреса
      } catch (error) {
        console.error('Error parsing address:', error);
      }
    }

    setLoading(false);
  }, []);

  const handleProviderClick = (providerId: number) => {
    router.push(`/providers/${providerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-[#101010] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка провайдеров...</p>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-[#101010] mb-4">
            Провайдеры не найдены
          </h1>
          <p className="text-gray-600 mb-6">
            По указанному адресу не найдено доступных провайдеров. Попробуйте выбрать другой адрес.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors"
          >
            Вернуться к поиску
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="frame-container min-h-screen bg-[#F5F5F5] py-8 overflow-y-auto overflow-x-hidden" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: 'var(--sat, 0px)' }}>
      <div className="w-full max-w-[400px] mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 text-[#101010] hover:text-gray-600 flex items-center gap-2"
          >
            <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
              <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
            </svg>
            Назад
          </button>
          <h1 className="text-3xl font-bold text-[#101010] mb-2">
            Доступные провайдеры
          </h1>
          <p className="text-gray-600">
            {addressData.city && addressData.street && addressData.houseNumber
              ? `${addressData.city}, ${addressData.street}, ${addressData.houseNumber}`
              : 'По вашему адресу'}
          </p>
        </div>

        {/* Список провайдеров */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              onClick={() => handleProviderClick(provider.id)}
              className="bg-white rounded-[20px] p-6 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center mb-4">
                {provider.logo && (
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="w-16 h-16 object-contain mr-4"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-[#101010]">{provider.name}</h3>
                  {provider.rating > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      ⭐ {provider.rating.toFixed(1)} ({provider.reviewsCount} отзывов)
                    </div>
                  )}
                </div>
              </div>
              {provider.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.description}</p>
              )}
              <button className="w-full py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors">
                Посмотреть тарифы
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Frame2() {
  return (
    <AddressProvider>
      <ProvidersContent />
    </AddressProvider>
  );
}
