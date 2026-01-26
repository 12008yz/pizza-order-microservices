'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  HomeIcon,
  HeartIcon,
  FunnelIcon,
  PlaneIcon,
  InfoIcon,
  CheckCircleIcon,
  PlusCircleIcon,
} from '../../common/icons';



interface Tariff {
  id: number;
  providerName: string;
  tariffName: string;
  speed: string;
  speedDesc: string;
  channels: string;
  channelsDesc: string;
  mobile: string;
  mobileDesc: string;
  favoriteLabel: string;
  favoriteDesc: string;
  price: string;
  connectionPrice: string;
  promoText: string;
}

const tariffs: Tariff[] = [
  {
    id: 1,
    providerName: 'Ростелеком',
    tariffName: 'Технологии выгоды. Тест-драйв.',
    speed: '100 Мбит/сек',
    speedDesc: 'Безлимитное соединение',
    channels: '135 каналов · кинотеатр «Wink»',
    channelsDesc: 'Телевидение',
    mobile: '1000 мин · 40 гигабайтов · 50 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '965 р./мес.',
    connectionPrice: 'Подключение от оператора за 500 р.',
    promoText: '90 дней за 0 р.',
  },
  {
    id: 2,
    providerName: 'МТС',
    tariffName: 'Домашний интернет + ТВ',
    speed: '200 Мбит/сек',
    speedDesc: 'Безлимитное соединение',
    channels: '180 каналов · KION',
    channelsDesc: 'Телевидение',
    mobile: '800 мин · 30 гигабайтов · 100 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '890 р./мес.',
    connectionPrice: 'Подключение от оператора за 0 р.',
    promoText: '30 дней за 1 р.',
  },
  {
    id: 3,
    providerName: 'Билайн',
    tariffName: 'Всё в одном',
    speed: '300 Мбит/сек',
    speedDesc: 'Безлимитное соединение',
    channels: '200 каналов · Wink',
    channelsDesc: 'Телевидение',
    mobile: '1500 мин · 50 гигабайтов · 200 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '1100 р./мес.',
    connectionPrice: 'Подключение от оператора за 300 р.',
    promoText: '60 дней за 0 р.',
  },
];

export default function Frame3() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHomePressed, setIsHomePressed] = useState(false);
  const [isHeartPressed, setIsHeartPressed] = useState(false);
  const [isFunnelPressed, setIsFunnelPressed] = useState(false);
  const [isPlanePressed, setIsPlanePressed] = useState(false);

  return (
    <div
      className="relative w-[400px] h-[870px] bg-[#F5F5F5]"
      style={{ fontFamily: 'TT Firs Neue, sans-serif' }}
    >
      {/* Header группа кнопок */}
      <div className="absolute w-[360px] h-[40px] left-[20px] top-[75px]">
        {/* Кнопка дом (слева) */}
        <div
          className="absolute w-[40px] h-[40px] left-0 top-0 cursor-pointer"
          onClick={() => router.push('/')}
          onMouseDown={() => setIsHomePressed(true)}
          onMouseUp={() => setIsHomePressed(false)}
          onMouseLeave={() => setIsHomePressed(false)}
          onTouchStart={() => setIsHomePressed(true)}
          onTouchEnd={() => setIsHomePressed(false)}
        >
          <div
            className="w-full h-full bg-white rounded-[100px] flex items-center justify-center"
            style={{
              transform: isHomePressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <HomeIcon />
          </div>
        </div>

        {/* Логотип Гигапоиск */}
        <div className="absolute left-[50px] top-[15px] flex items-center">
          <div style={{ width: '140px', height: '10px' }}>
            <svg
              width="140"
              height="10"
              viewBox="0 0 230 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <g clipPath="url(#clip0_13653_131_frame3)">
                <path
                  d="M0 13.8056V0.194444H22.5306V4.86111H5.93306V13.8056H0ZM49.0092 0.194444V13.8056H43.0761V6.02778L29.9708 13.8056H24.0377V0.194444H29.9708V7.97222L43.0761 0.194444H49.0092ZM50.5142 13.8056V0.194444H73.0448V4.86111H56.4473V13.8056H50.5142ZM84.0292 4.47222L81.288 7.97222H86.7705L84.0292 4.47222ZM80.6872 0.194444H87.3713L98.017 13.8056H91.3329L89.8121 11.8611H78.2464L76.7256 13.8056H70.0415L80.6872 0.194444ZM98.7731 13.8056V0.194444H123.744V13.8056H117.811V4.86111H104.706V13.8056H98.7731ZM131.454 0H145.16C148.784 0 151.732 3.24722 151.732 7C151.732 10.7528 148.784 14 145.16 14H131.454C127.831 14 124.883 10.7528 124.883 7C124.883 3.24722 127.831 0 131.454 0ZM143.94 5.05556H132.675C131.642 5.05556 130.797 5.93056 130.797 7C130.797 8.06944 131.642 8.94444 132.675 8.94444H143.94C144.973 8.94444 145.818 8.06944 145.818 7C145.818 5.93056 144.973 5.05556 143.94 5.05556ZM177.834 0.194444V13.8056H171.901V6.02778L158.796 13.8056H152.863V0.194444H158.796V7.97222L171.901 0.194444H177.834ZM203.38 8.75V13.8056H185.544C181.92 13.8056 178.972 10.7528 178.972 7C178.972 3.24722 181.92 0.194444 185.544 0.194444H203.38V5.25H186.764C185.732 5.25 184.887 5.93056 184.887 7C184.887 8.06944 185.732 8.75 186.764 8.75H203.38ZM204.88 13.8056V0.194444H210.813V7.66111L221.252 0.194444H229.852L220.332 7L229.852 13.8056H221.252L216.033 10.0722L210.813 13.8056H204.88Z"
                  fill="#101010"
                />
              </g>
              <defs>
                <clipPath id="clip0_13653_131_frame3">
                  <rect width="230" height="14" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>

        {/* Кнопка избранное */}
        <div
          className="absolute w-[40px] h-[40px] left-[230px] top-0 cursor-pointer"
          onMouseDown={() => setIsHeartPressed(true)}
          onMouseUp={() => setIsHeartPressed(false)}
          onMouseLeave={() => setIsHeartPressed(false)}
          onTouchStart={() => setIsHeartPressed(true)}
          onTouchEnd={() => setIsHeartPressed(false)}
        >
          <div
            className="w-full h-full bg-white rounded-[100px] flex items-center justify-center"
            style={{
              transform: isHeartPressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <HeartIcon />
          </div>
        </div>

        {/* Кнопка фильтр */}
        <div
          className="absolute w-[40px] h-[40px] left-[275px] top-0 cursor-pointer"
          onMouseDown={() => setIsFunnelPressed(true)}
          onMouseUp={() => setIsFunnelPressed(false)}
          onMouseLeave={() => setIsFunnelPressed(false)}
          onTouchStart={() => setIsFunnelPressed(true)}
          onTouchEnd={() => setIsFunnelPressed(false)}
        >
          <div
            className="w-full h-full bg-white rounded-[100px] flex items-center justify-center"
            style={{
              transform: isFunnelPressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <FunnelIcon />
          </div>
        </div>

        {/* Кнопка самолёт (справа) */}
        <div
          className="absolute w-[40px] h-[40px] left-[320px] top-0 cursor-pointer"
          onMouseDown={() => setIsPlanePressed(true)}
          onMouseUp={() => setIsPlanePressed(false)}
          onMouseLeave={() => setIsPlanePressed(false)}
          onTouchStart={() => setIsPlanePressed(true)}
          onTouchEnd={() => setIsPlanePressed(false)}
        >
          <div
            className="w-full h-full bg-white rounded-[100px] flex items-center justify-center"
            style={{
              transform: isPlanePressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <PlaneIcon />
          </div>
        </div>
      </div>

      {/* Горизонтальный скролл с карточками тарифов */}
      <div
        ref={scrollRef}
        className="absolute left-[20px] right-0 top-[135px] flex gap-[20px] overflow-x-auto scrollbar-hide pr-[20px]"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          width: 'calc(100% + 340px)',
        }}
      >
        {tariffs.map((tariff) => (
          <div
            key={tariff.id}
            className="flex-shrink-0 w-[360px] bg-white rounded-[20px]"
            style={{
              scrollSnapAlign: 'start',
            }}
          >
            {/* Заголовок карточки */}
            <div className="relative px-[15px] pt-[15px] pb-[10px]">
              <div className="flex justify-between items-start">
                <div>
                  <div
                    className="text-[rgba(16,16,16,0.5)]"
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '125%',
                    }}
                  >
                    {tariff.providerName}
                  </div>
                  <div
                    className="text-[#101010] mt-[5px]"
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontSize: '18px',
                      fontWeight: 400,
                      lineHeight: '165%',
                    }}
                  >
                    {tariff.tariffName}
                  </div>
                </div>
                <div className="mt-[5px]">
                  <InfoIcon />
                </div>
              </div>
            </div>

            {/* Разделитель */}
            <div className="mx-[15px] h-[1px] bg-[rgba(16,16,16,0.1)]" />

            {/* Скорость */}
            <div className="flex items-start px-[15px] py-[10px]">
              <div className="mr-[10px] mt-[2px]">
                <CheckCircleIcon />
              </div>
              <div>
                <div
                  className="text-[#101010]"
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '155%',
                  }}
                >
                  {tariff.speed}
                </div>
                <div
                  className="text-[rgba(16,16,16,0.5)]"
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '105%',
                  }}
                >
                  {tariff.speedDesc}
                </div>
              </div>
            </div>

            {/* ТВ */}
            <div className="flex items-start px-[15px] py-[5px]">
              <div className="mr-[10px] mt-[2px]">
                <CheckCircleIcon />
              </div>
              <div>
                <div
                  className="text-[#101010]"
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '155%',
                  }}
                >
                  {tariff.channels}
                </div>
                <div
                  className="text-[rgba(16,16,16,0.5)]"
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    lineHeight: '115%',
                  }}
                >
                  {tariff.channelsDesc}
                </div>
              </div>
            </div>

            {/* Мобильное соединение */}
            <div className="flex items-start px-[15px] py-[5px]">
              <div className="mr-[10px] mt-[2px]">
                <CheckCircleIcon />
              </div>
              <div>
                <div
                  className="text-[#101010]"
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '155%',
                  }}
                >
                  {tariff.mobile}
                </div>
                <div
                  className="text-[rgba(16,16,16,0.5)]"
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '105%',
                  }}
                >
                  {tariff.mobileDesc}
                </div>
              </div>
            </div>

            {/* Разделитель перед избранным */}
            <div className="mx-[15px] h-[1px] bg-[rgba(16,16,16,0.1)] mt-[5px]" />

            {/* Добавить в избранное */}
            <div className="flex items-start px-[15px] py-[10px]">
              <div className="mr-[10px] mt-[2px]">
                <PlusCircleIcon />
              </div>
              <div>
                <div
                  className="text-[#101010]"
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '155%',
                  }}
                >
                  {tariff.favoriteLabel}
                </div>
                <div
                  className="text-[rgba(16,16,16,0.5)]"
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '105%',
                  }}
                >
                  {tariff.favoriteDesc}
                </div>
              </div>
            </div>

            {/* Разделитель перед ценой */}
            <div className="mx-[15px] h-[1px] bg-[rgba(16,16,16,0.1)]" />

            {/* Цена */}
            <div className="px-[15px] pt-[15px]">
              <div
                className="text-[#101010]"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '22px',
                  fontWeight: 400,
                  lineHeight: '115%',
                }}
              >
                {tariff.price}
              </div>
              <div
                className="text-[rgba(16,16,16,0.5)] mt-[5px]"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '105%',
                }}
              >
                {tariff.connectionPrice}
              </div>
            </div>

            {/* Кнопка промо */}
            <div className="px-[15px] pt-[15px] pb-[15px]">
              <button
                className="w-full h-[50px] bg-[#101010] rounded-[10px] flex items-center justify-center text-white cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '315%',
                  border: '1px solid rgba(16, 16, 16, 0.1)',
                }}
              >
                {tariff.promoText}
              </button>
            </div>
          </div>
        ))}
        {/* Пустой элемент для правильного отступа в конце */}
        <div className="flex-shrink-0 w-[20px]" />
      </div>

      {/* Стили для скрытия скроллбара */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
