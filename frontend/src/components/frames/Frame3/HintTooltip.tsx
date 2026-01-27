'use client';

import { useEffect } from 'react';

interface HintTooltipProps {
   text: string;
   onAccept: () => void;
   onDecline: () => void;
   position: 'consultation' | 'filter';
}

export default function HintTooltip({ text, onAccept, onDecline, position }: HintTooltipProps) {
   // Автоматическое закрытие через 3 секунды
   useEffect(() => {
      const timer = setTimeout(() => {
         onAccept();
      }, 3000);
      return () => clearTimeout(timer);
   }, [onAccept]);
   // Позиционирование в зависимости от типа подсказки
   const getPositionStyles = () => {
      if (position === 'consultation') {
         // Под иконкой самолёта (консультация)
         // Иконка самолёта: left: 319.2px от header, header left: 20px, width: 40.8px
         // Правая граница иконки: 20 + 319.2 + 40.8 = 380px от левого края контейнера
         // Контейнер: 400px, right = 400 - 380 = 20px
         return {
            right: '20px',
            top: '120px',
         };
      } else {
         // Под иконкой воронки (фильтрация)
         // Иконка воронки: left: 274.6px от header, header left: 20px, width: 40.8px
         // Правая граница иконки: 20 + 274.6 + 40.8 = 335.4px от левого края контейнера
         // Контейнер: 400px, right = 400 - 335.4 = 64.6px
         return {
            right: '64.6px',
            top: '120px',
         };
      }
   };

   const positionStyles = getPositionStyles();

   return (
      <div
         style={{
            position: 'absolute',
            width: '205px',
            height: '90px',
            right: positionStyles.right,
            top: positionStyles.top,
            background: '#FFFFFF',
            borderRadius: '20px 10px 20px 20px',
            zIndex: 100,
         }}
      >
         {/* Текст подсказки */}
         <div
            style={{
               position: 'absolute',
               width: '164px',
               height: '15px',
               left: '15px',
               top: '15px',
               fontFamily: 'TT Firs Neue, sans-serif',
               fontStyle: 'normal',
               fontWeight: 400,
               fontSize: '14px',
               lineHeight: '105%',
               display: 'flex',
               alignItems: 'center',
               color: '#101010',
            }}
         >
            {text}
         </div>

         {/* Кнопка "Класс!" */}
         <button
            onClick={onAccept}
            style={{
               position: 'absolute',
               width: '65px',
               height: '35px',
               left: '15px',
               top: '40px',
               background: '#101010',
               borderRadius: '10px',
               border: 'none',
               fontFamily: 'TT Firs Neue, sans-serif',
               fontStyle: 'normal',
               fontWeight: 400,
               fontSize: '14px',
               lineHeight: '105%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               color: '#FFFFFF',
               cursor: 'pointer',
            }}
         >
            Класс!
         </button>

         {/* Кнопка "Я сам решу" */}
         <button
            onClick={onDecline}
            style={{
               position: 'absolute',
               width: '105px',
               height: '35px',
               left: '85px',
               top: '40px',
               background: 'transparent',
               border: '1px solid rgba(16, 16, 16, 0.25)',
               borderRadius: '10px',
               fontFamily: 'TT Firs Neue, sans-serif',
               fontStyle: 'normal',
               fontWeight: 400,
               fontSize: '14px',
               lineHeight: '105%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               color: '#101010',
               cursor: 'pointer',
               boxSizing: 'border-box',
            }}
         >
            Я сам решу
         </button>
      </div>
   );
}
