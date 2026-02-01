'use client';

import { useState, useEffect } from 'react';

export interface CardsConfig {
  cardWidth: number;
  cardMinHeight: number;
  gap: number;
  paddingLeft: number;
  paddingRight: number;
  peekRight: number;
  containerMargin: number;
}

const DEFAULT_CONFIG: CardsConfig = {
  cardWidth: 360,
  cardMinHeight: 560,
  gap: 5,
  paddingLeft: 20,
  paddingRight: 20,
  peekRight: 7,
  containerMargin: 4,
};

/** Ширина видимой области карусели: paddingLeft + cardWidth + gap + peekRight */
export function getCarouselViewportWidth(config: CardsConfig): number {
  return config.paddingLeft + config.cardWidth + config.gap + config.peekRight;
}

export default function useCardsConfig(): CardsConfig {
  const [config, setConfig] = useState<CardsConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    let cancelled = false;
    fetch('/cards-config.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Not ok'))))
      .then((data: Partial<CardsConfig>) => {
        if (cancelled) return;
        setConfig({
          cardWidth: data.cardWidth ?? DEFAULT_CONFIG.cardWidth,
          cardMinHeight: data.cardMinHeight ?? DEFAULT_CONFIG.cardMinHeight,
          gap: data.gap ?? DEFAULT_CONFIG.gap,
          paddingLeft: data.paddingLeft ?? DEFAULT_CONFIG.paddingLeft,
          paddingRight: data.paddingRight ?? DEFAULT_CONFIG.paddingRight,
          peekRight: data.peekRight ?? DEFAULT_CONFIG.peekRight,
          containerMargin: data.containerMargin ?? DEFAULT_CONFIG.containerMargin,
        });
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_CONFIG);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
