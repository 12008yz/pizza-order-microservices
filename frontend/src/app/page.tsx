'use client';

import { useState, useEffect } from 'react';
import AddressSearch from '../components/AddressSearch';

export default function Home() {
  const [cookieCountdown, setCookieCountdown] = useState(7);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  // Cookie countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCookieCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cookieCountdown === 0) {
      const timer = setTimeout(() => setShowCookieBanner(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [cookieCountdown]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[360px] bg-white border border-gray-300 rounded-[20px] shadow-lg z-50 p-4">
          <div className="text-sm text-gray-500 mb-2">
            Автоматически закроется через {cookieCountdown}
          </div>
          <div className="text-sm text-gray-800">
            Если продолжаете использовать этот портал, вы выражаете согласие на использование файлов куки в соответствии с условиями{' '}
            <a href="#" className="text-blue-600 underline">политики приватности</a> этого портала
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <h1 className="text-3xl font-bold text-center mb-8">
            Подключение интернета. Проверьте с нами, это легко
          </h1>

          {/* Компонент поиска по адресу */}
          <AddressSearch />

          {/* Privacy Policy Checkbox */}
          <div className="mt-6 flex items-start">
            <div
              className="w-5 h-5 rounded-full border-2 border-gray-400 cursor-pointer flex items-center justify-center mr-3 mt-1"
              onClick={() => setPrivacyChecked(!privacyChecked)}
            >
              {privacyChecked && (
                <div className="w-3 h-3 rounded-full bg-gray-800"></div>
              )}
            </div>
            <div className="text-sm text-gray-700">
              Нажмите, чтобы выразить своё согласие с условиями{' '}
              <a href="#" className="text-blue-600 underline">политики приватности</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
