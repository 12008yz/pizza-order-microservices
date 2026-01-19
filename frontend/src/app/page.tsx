'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import AddressFormPage from '../components/AddressFormPage';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Быстрая симуляция загрузки
    intervalId = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalId);
          // Сразу показываем следующую страницу без задержки
          setIsLoading(false);
          return 100;
        }
        return prev + 5; // Увеличиваем шаг для более быстрой загрузки
      });
    }, 30); // Уменьшаем интервал для более плавной анимации

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return <AddressFormPage />;
}
