'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedCheckProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function AnimatedCheck({
  size = 8,
  color = '#FFFFFF',
  strokeWidth = 1.5
}: AnimatedCheckProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (pathRef.current && !mountedRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      mountedRef.current = true;

      // Запускаем анимацию после небольшой задержки для плавности
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }
  }, []);

  // Перезапуск анимации при изменении размера или цвета
  useEffect(() => {
    if (mountedRef.current && pathRef.current) {
      setIsAnimating(false);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    }
  }, [size, color]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        opacity: isAnimating ? 1 : 0,
        transform: isAnimating ? 'scale(1)' : 'scale(0.2)',
        transition: 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <path
        ref={pathRef}
        d="M1.5 4L3.5 6L6.5 2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          strokeDasharray: pathLength > 0 ? pathLength : 0,
          strokeDashoffset: isAnimating ? 0 : pathLength,
          transition: pathLength > 0 ? 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
    </svg>
  );
}
