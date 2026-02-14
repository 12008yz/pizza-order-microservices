'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AddressFormPage from '../components/frames/Frame1';

export default function Home() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isCompleteRef = useRef(false);
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Переход в консультацию по ссылке (с Frame3/4/5): не показывать общий загрузочный экран — только загрузка чанка ConsultationFlow
  useEffect(() => {
    if (searchParams.get('consultation') === '1') {
      isCompleteRef.current = true;
      setLoadingProgress(100);
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    let completedSteps = 0;
    const totalSteps = 5; // DOM, шрифты, Frame1 монтирован, ресурсы Frame1, полная загрузка

    const updateProgress = (step: number) => {
      if (isCompleteRef.current) return;
      completedSteps = Math.max(completedSteps, step);
      const progress = Math.min(95, (completedSteps / totalSteps) * 100);
      setLoadingProgress(progress);
    };

    const finishLoading = () => {
      if (isCompleteRef.current) return;
      isCompleteRef.current = true;
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 300);
    };

    // Шаг 1: DOM готов (20%)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        updateProgress(1);
      });
    } else {
      updateProgress(1);
    }

    // Шаг 2: Шрифты загружены (40%)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(() => {
          updateProgress(2);
        })
        .catch(() => {
          updateProgress(2);
        });
    } else {
      setTimeout(() => updateProgress(2), 200);
    }

    // Шаг 3-5: Отслеживаем загрузку Frame1 и его ресурсов
    let imagesTracked = false;
    let loadedImagesCount = 0;
    let totalImagesCount = 0;

    const checkFrame1Progress = () => {
      if (!frameContainerRef.current || isCompleteRef.current) return;

      // Проверяем, что Frame1 начал рендериться
      const hasContent = frameContainerRef.current.children.length > 0 || 
                        frameContainerRef.current.querySelector('*') !== null;
      
      if (hasContent && completedSteps < 3) {
        updateProgress(3); // Frame1 монтирован (60%)
      }

      // Проверяем загрузку изображений в Frame1
      if (completedSteps >= 3) {
        const images = frameContainerRef.current.querySelectorAll('img');
        
        if (images.length === 0) {
          // Нет изображений, считаем что всё загружено
          if (completedSteps < 5) {
            updateProgress(5);
            finishLoading();
          }
        } else {
          // Подписываемся на события загрузки изображений только один раз
          if (!imagesTracked) {
            imagesTracked = true;
            totalImagesCount = images.length;
            loadedImagesCount = 0;

            const updateImageProgress = () => {
              loadedImagesCount++;
              // Обновляем прогресс по мере загрузки изображений (от 4 до 5)
              const imageProgress = 4 + (loadedImagesCount / totalImagesCount);
              updateProgress(Math.floor(imageProgress * 10) / 10);
              
              if (loadedImagesCount === totalImagesCount && !isCompleteRef.current) {
                updateProgress(5);
                finishLoading();
              }
            };

            // Сначала считаем уже загруженные изображения
            images.forEach((img) => {
              if (img.complete && img.naturalWidth > 0) {
                loadedImagesCount++;
              }
            });

            // Если все изображения уже загружены
            if (loadedImagesCount === totalImagesCount) {
              updateProgress(5);
              finishLoading();
            } else {
              // Подписываемся на события загрузки для оставшихся изображений
              images.forEach((img) => {
                if (!img.complete || img.naturalWidth === 0) {
                  img.addEventListener('load', updateImageProgress, { once: true });
                  img.addEventListener('error', updateImageProgress, { once: true });
                }
              });

              // Обновляем прогресс для уже загруженных изображений
              if (loadedImagesCount > 0) {
                const imageProgress = 4 + (loadedImagesCount / totalImagesCount);
                updateProgress(Math.floor(imageProgress * 10) / 10);
              }
            }

            // Таймаут для изображений (на случай если они не загрузятся)
            setTimeout(() => {
              if (!isCompleteRef.current && loadedImagesCount < totalImagesCount) {
                updateProgress(5);
                finishLoading();
              }
            }, 5000);
          } else {
            // Если уже отслеживаем, просто проверяем текущий прогресс
            if (totalImagesCount > 0) {
              const imageProgress = 4 + (loadedImagesCount / totalImagesCount);
              updateProgress(Math.floor(imageProgress * 10) / 10);
            }
          }
        }
      }
    };

    // Начинаем проверку после небольшой задержки, чтобы Frame1 успел начать рендериться
    setTimeout(() => {
      checkIntervalRef.current = setInterval(() => {
        checkFrame1Progress();
      }, 150);
    }, 200);

    // Таймаут на случай, если что-то не загрузится (максимум 15 секунд)
    const timeout = setTimeout(() => {
      if (!isCompleteRef.current) {
        finishLoading();
      }
    }, 15000);

    return () => {
      clearTimeout(timeout);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return (
    <div ref={frameContainerRef}>
      <AddressFormPage isAppLoading={isLoading} appLoadingProgress={loadingProgress} />
    </div>
  );
}
