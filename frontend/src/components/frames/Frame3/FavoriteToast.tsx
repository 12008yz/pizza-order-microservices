'use client';

import { useEffect, useState } from 'react';

interface FavoriteToastProps {
   isVisible: boolean;
   onClose: () => void;
}

export default function FavoriteToast({ isVisible, onClose }: FavoriteToastProps) {
   const [shouldRender, setShouldRender] = useState(false);
   const [isAnimating, setIsAnimating] = useState(false);

   useEffect(() => {
      if (isVisible) {
         setShouldRender(true);
         // Небольшая задержка для начала анимации появления
         requestAnimationFrame(() => {
            setIsAnimating(true);
         });

         const timer = setTimeout(() => {
            // Начинаем анимацию исчезновения
            setIsAnimating(false);
            // Убираем компонент из DOM после завершения анимации
            setTimeout(() => {
               setShouldRender(false);
               onClose();
            }, 300);
         }, 5000);
         return () => clearTimeout(timer);
      } else {
         // Если isVisible стал false, начинаем анимацию исчезновения
         setIsAnimating(false);
         setTimeout(() => {
            setShouldRender(false);
         }, 300);
      }
   }, [isVisible, onClose]);

   if (!shouldRender) return null;

   return (
      <div
         style={{
            position: 'absolute',
            width: '205px',
            height: '90px',
            left: 'auto',
            right: '110px',
            top: 'var(--header-tooltip-top)',
            background: '#FFFFFF',
            borderRadius: '20px 10px 20px 20px',
            zIndex: 100,
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
            transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: isAnimating ? 'auto' : 'none',
         }}
      >
         {/* Текст "Все, это сохранено здесь" */}
         <div
            style={{
               position: 'absolute',
               width: '175px',
               height: '15px',
               left: '15px',
               top: '15px',
               fontFamily: "'TT Firs Neue', sans-serif",
               fontWeight: 400,
               fontSize: '14px',
               lineHeight: '105%',
               display: 'flex',
               alignItems: 'center',
               color: '#101010',
            }}
         >
            Все, это сохранено здесь
         </div>

         {/* Кнопка "Класс!" */}
         <button
            onClick={() => {
               setIsAnimating(false);
               setTimeout(() => {
                  setShouldRender(false);
                  onClose();
               }, 300);
            }}
            style={{
               position: 'absolute',
               width: '65px',
               height: '35px',
               left: '15px',
               top: '40px',
               background: '#101010',
               borderRadius: '10px',
               border: 'none',
               fontFamily: "'TT Firs Neue', sans-serif",
               fontWeight: 400,
               fontSize: '14px',
               lineHeight: '105%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               color: '#FFFFFF',
               cursor: 'pointer',
               transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
               e.currentTarget.style.background = '#333333';
            }}
            onMouseLeave={(e) => {
               e.currentTarget.style.background = '#101010';
            }}
         >
            Класс!
         </button>
      </div>
   );
}
