'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import AddressFormPage from '../components/frames/Frame1';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Убрана искусственная задержка - показываем контент сразу после загрузки
    // Проверяем, загружены ли критичные ресурсы (шрифты, изображения)
    const checkResourcesLoaded = () => {
      if (document.readyState === 'complete') {
        setIsLoading(false);
      } else {
        window.addEventListener('load', () => setIsLoading(false));
      }
    };

    checkResourcesLoaded();
  }, []);

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return <AddressFormPage />;
}
