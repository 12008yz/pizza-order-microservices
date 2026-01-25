'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft } from '@phosphor-icons/react';
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
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 text-[#101010] hover:text-gray-600 flex items-center gap-2"
          >
            <CaretLeft size={20} weight="regular" />
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
