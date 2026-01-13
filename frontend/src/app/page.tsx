'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [cookieCountdown, setCookieCountdown] = useState(7);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  // Cookie countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCookieCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[400px] h-[870px] bg-white mx-auto">
      {/* Cookie Consent Banner - Group 7476 / Rectangle 67 */}
      <div className="absolute w-[360px] h-[115px] left-[20px] top-[75px] bg-white border border-[rgba(5,5,5,0.15)] backdrop-blur-[7.5px] rounded-[20px]">
        {/* Timer text - Автоматически закроется через 7 */}
        <div className="absolute w-[330px] h-[15px] left-[15px] top-[15px] font-['TT_Firs_Neue'] font-normal text-[14px] leading-[115%] text-[rgba(16,16,16,0.5)] tracking-[0.02em]" style={{ wordSpacing: '0.05em' }}>
          Автоматически закроется через {cookieCountdown}
        </div>
        {/* Consent message */}
        <div className="absolute w-[330px] h-[60px] left-[15px] top-[36.6px] font-['TT_Firs_Neue'] font-normal text-[16px] leading-[100%] text-[#101010] tracking-[0.02em]" style={{ wordSpacing: '0.05em' }}>
          Если продолжаете использовать этот портал, вы выражаете согласие на использование файлов куки в соответствии с условиями{' '}
          <a href="#" className="text-blue-600 underline">политики приватности</a> этого портала
        </div>
      </div>

      {/* Main Content Card - Rectangle 30 */}
      <div className="absolute left-[5%] right-[5%] top-[32.76%] bottom-[16.67%] bg-white border border-[rgba(5,5,5,0.15)] backdrop-blur-[7.5px] rounded-[20px]"></div>

      {/* Main Heading - Подключение интернета. Проверьте с нами, это легко */}
      <div className="absolute left-[8.75%] right-[8.75%] top-[34.48%] bottom-[59.77%] font-['TT_Firs_Neue'] font-normal text-[23px] leading-[115%] text-[#101010] tracking-[0.03em]" style={{ wordSpacing: '0.08em' }}>
        Подключение интернета. Проверьте с нами, это легко
      </div>

      {/* Connection Input Field - Group 7432 / Rectangle 31 */}
      <div className="absolute left-[8.75%] right-[8.75%] top-[42.53%] bottom-[51.72%] border border-[#101010] rounded-[10px]"></div>
      {/* Connection Text */}
      <div className="absolute left-[12.5%] right-[20%] top-[44.25%] bottom-[53.45%] flex items-center font-['TT_Firs_Neue'] font-normal text-[16px] leading-[135%] text-[rgba(16,16,16,0.5)] tracking-[0.02em]" style={{ wordSpacing: '0.05em' }}>
        Подключение
      </div>
      {/* Connection Button - кружочек со стрелочкой */}
      <div className="absolute w-[16px] h-[16px] left-[335px] top-[387px] rounded-full bg-[#101010] flex items-center justify-center">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-white">
          <path d="M2 1L6 4L2 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>

      {/* Locality Name Input Field - Group 7514 / Rectangle 31 */}
      <div className="absolute left-[8.75%] right-[8.75%] top-[48.85%] bottom-[45.4%] border border-[rgba(16,16,16,0.25)] rounded-[10px] opacity-50"></div>
      {/* Locality Name Text */}
      <div className="absolute left-[12.5%] right-[20%] top-[50.57%] bottom-[47.13%] flex items-center font-['TT_Firs_Neue'] font-normal text-[16px] leading-[135%] text-[rgba(16,16,16,0.25)] opacity-50 tracking-[0.02em]" style={{ wordSpacing: '0.05em' }}>
        Название населённого пункта
      </div>
      {/* Locality Name Button - кружочек со стрелочкой */}
      <div className="absolute w-[16px] h-[16px] left-[335px] top-[442px] rounded-full border border-[rgba(16,16,16,0.25)] flex items-center justify-center opacity-50">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M2 1L6 4L2 7" stroke="rgba(16,16,16,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>

      {/* Street Input Field - Group 7437 / Rectangle 31 */}
      <div className="absolute left-[8.75%] right-[8.75%] top-[55.17%] bottom-[39.08%] border border-[rgba(16,16,16,0.25)] rounded-[10px] opacity-50"></div>
      {/* Street Text */}
      <div className="absolute left-[12.5%] right-[20%] top-[56.9%] bottom-[40.8%] flex items-center font-['TT_Firs_Neue'] font-normal text-[16px] leading-[135%] text-[rgba(16,16,16,0.25)] opacity-50 tracking-[0.02em]" style={{ wordSpacing: '0.05em' }}>
        Улица
      </div>
      {/* Street Button - кружочек со стрелочкой */}
      <div className="absolute w-[16px] h-[16px] left-[335px] top-[497px] rounded-full border border-[rgba(16,16,16,0.25)] flex items-center justify-center opacity-50">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M2 1L6 4L2 7" stroke="rgba(16,16,16,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>

      {/* House Number Input Field - Group 7438 / Rectangle 31 */}
      <div className="absolute left-[8.75%] right-[8.75%] top-[61.49%] bottom-[32.76%] border border-[rgba(16,16,16,0.25)] rounded-[10px] opacity-50"></div>
      {/* House Number Text */}
      <div className="absolute left-[12.5%] right-[20%] top-[63.22%] bottom-[34.48%] flex items-center font-['TT_Firs_Neue'] font-normal text-[16px] leading-[135%] text-[rgba(16,16,16,0.25)] opacity-50 tracking-[0.02em]" style={{ wordSpacing: '0.05em' }}>
        Номер дома
      </div>
      {/* House Number Button - кружочек со стрелочкой */}
      <div className="absolute w-[16px] h-[16px] left-[335px] top-[552px] rounded-full border border-[rgba(16,16,16,0.25)] flex items-center justify-center opacity-50">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M2 1L6 4L2 7" stroke="rgba(16,16,16,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>

      {/* Privacy Policy Checkbox - Group 7372 / Rectangle 30 */}
      <div className="absolute left-[8.75%] right-[8.75%] top-[67.82%] bottom-[26.44%] border border-[rgba(16,16,16,0.25)] rounded-[10px]"></div>
      {/* Checkbox - круглый: left: calc(50% - 8px - 142px) = 200 - 8 - 142 = 50px, top: calc(50% - 8px + 180px) = 435 - 8 + 180 = 607px */}
      <div 
        className="absolute w-[16px] h-[16px] left-[50px] top-[607px] rounded-full border border-[rgba(16,16,16,0.5)] cursor-pointer flex items-center justify-center"
        onClick={() => setPrivacyChecked(!privacyChecked)}
      >
        {privacyChecked && (
          <div className="w-[10px] h-[10px] rounded-full bg-[#101010]"></div>
        )}
      </div>
      {/* Privacy Policy Text */}
      <div className="absolute left-[19%] right-[11%] top-[68.97%] bottom-[27.59%] font-['TT_Firs_Neue'] font-normal text-[15px] leading-[110%] text-[#101010] tracking-[0.02em]" style={{ wordSpacing: '0.05em' }}>
        Нажмите, чтобы выразить своё согласие
        <br />
        с условиями{' '}
        <a href="#" className="text-blue-600 underline">политики приватности</a>
      </div>

      {/* Show Operators Button - Group 7377 / Rectangle 30 */}
      <div className="absolute left-[8.75%] right-[8.75%] top-[75.86%] bottom-[18.39%] bg-[#101010] border border-[rgba(16,16,16,0.25)] rounded-[10px] flex items-center justify-center">
        <div className="font-['TT_Firs_Neue'] font-normal text-[16px] leading-[335%] text-white text-center tracking-[0.06em]" style={{ wordSpacing: '0.08em' }}>
          Демонстрирование операторов
        </div>
      </div>
    </div>
  );
}
