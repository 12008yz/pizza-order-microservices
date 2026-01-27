'use client';

import { useEffect } from 'react';

interface FavoriteToastProps {
   isVisible: boolean;
   onClose: () => void;
}

export default function FavoriteToast({ isVisible, onClose }: FavoriteToastProps) {
   useEffect(() => {
      if (isVisible) {
         const timer = setTimeout(() => {
            onClose();
         }, 5000);
         return () => clearTimeout(timer);
      }
   }, [isVisible, onClose]);

   if (!isVisible) return null;

   return (
      <div
         style={{
            position: 'absolute',
            width: '205px',
            height: '90px',
            left: '85px',
            top: '120px',
            background: '#FFFFFF',
            borderRadius: '20px 10px 20px 20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            animation: 'fadeIn 0.3s ease-out',
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
               fontFamily: 'TT Firs Neue, sans-serif',
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
            onClick={onClose}
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

         <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
   );
}
