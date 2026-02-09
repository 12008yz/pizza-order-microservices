'use client';

export default function Frame3LoadingSkeleton() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center overflow-hidden"
      style={{
        height: '100dvh',
        boxSizing: 'border-box',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: '25px',
        background: '#F5F5F5',
      }}
    >
      <div
        className="relative bg-[#F5F5F5]"
        style={{
          width: 400,
          minWidth: 400,
          maxWidth: 400,
          flex: 1,
          minHeight: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Header: 4 круга — Group 7510 (левый), 62.5%, 73.75%, Group 7509 (правый) */}
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            left: 20,
            top: 75,
            background: '#FFFFFF',
            borderRadius: 100,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            left: 250,
            top: 75,
            background: '#FFFFFF',
            borderRadius: 100,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            left: 295,
            top: 75,
            background: '#FFFFFF',
            borderRadius: 100,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            left: 340,
            top: 75,
            background: '#FFFFFF',
            borderRadius: 100,
          }}
        />
        {/* Круг справа под шапкой — Group 7509 top 230 */}
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            left: 340,
            top: 230,
            background: '#FFFFFF',
            borderRadius: 100,
          }}
        />

        {/* Group 7585 — маленькая карточка справа сверху */}
        <div
          style={{
            position: 'absolute',
            width: 205,
            height: 90,
            left: 175,
            top: 120,
            background: '#FFFFFF',
            borderRadius: '20px 10px 20px 20px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 150,
              height: 15,
              left: 15,
              top: 15,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 65,
              height: 35,
              left: 15,
              top: 40,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 105,
              height: 35,
              left: 85,
              top: 40,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          />
        </div>

        {/* Rectangle 30 — основной белый блок */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            top: 280,
            bottom: 100,
            background: '#FFFFFF',
            borderRadius: 20,
          }}
        />

        {/* Контент с фиксированными px (поверх карточки по координатам) */}
        <div
          style={{
            position: 'absolute',
            width: 305,
            height: 50,
            left: 35,
            top: 295,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />
        {/* Точка справа от первого блока (заголовок карточки), по верхнему краю контейнера */}
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            left: 350,
            top: 295,
            background: '#E5E5E5',
            borderRadius: 10,
          }}
        />
        {/* Список блоков: отступ 20px от первого контейнера (295+50+20=365), между блоками 20px */}
        {/* 1-й блок + точка по центру */}
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            left: 35,
            top: 377,
            background: '#E5E5E5',
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 305,
            height: 40,
            left: 60,
            top: 365,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />
        {/* 2-й блок + точка */}
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            left: 35,
            top: 437,
            background: '#E5E5E5',
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 305,
            height: 40,
            left: 60,
            top: 425,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />
        {/* 3-й блок + точка */}
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            left: 35,
            top: 497,
            background: '#E5E5E5',
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 305,
            height: 40,
            left: 60,
            top: 485,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />
        {/* 4-й блок + точка */}
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            left: 35,
            top: 557,
            background: '#E5E5E5',
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 305,
            height: 40,
            left: 60,
            top: 545,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />
        {/* Блоки ниже списка: отступ 20px от последнего (585+20=605) */}
        <div
          style={{
            position: 'absolute',
            width: 125,
            height: 25,
            left: 35,
            top: 605,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 275,
            height: 40,
            left: 35,
            top: 635,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />
        {/* Точка справа от блока 275×40: 17px отступ от правого края */}
        <div
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            right: 30,
            top: 635,
            background: '#E5E5E5',
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 275,
            height: 50,
            left: 90,
            top: 685,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 50,
            height: 50,
            left: 35,
            top: 685,
            background: '#F5F5F5',
            borderRadius: 10,
          }}
        />

        {/* Rectangle 31 — следующая карточка карусели, видна на 7px справа (как в макете) */}
        <div
          style={{
            position: 'absolute',
            left: 393,
            top: 280,
            bottom: 100,
            width: 360,
            background: '#FFFFFF',
            borderRadius: 20,
          }}
        />
      </div>
    </div>
  );
}
