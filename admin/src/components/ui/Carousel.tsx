"use client";

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { cn } from "@/lib/utils";

const ARROW_SIZE_PX = 36;
const arrowSvg = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M3 4L6 8L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface CarouselApi {
  scrollToSlide: (index: number) => void;
}

export interface CarouselOptions {
  axis?: "x" | "y";
  dragFree?: boolean;
  align?: "start" | "center" | "end";
  loop?: boolean;
  skipSnaps?: boolean;
  containScroll?: "trimSnaps" | "keepSnaps" | string;
  [key: string]: unknown;
}

export interface CarouselProps {
  children: React.ReactNode;
  options?: CarouselOptions;
  gap?: number;
  className?: string;
  viewportClassName?: string;
  containerClassName?: string;
  showArrows?: boolean;
  overflowY?: "hidden" | "visible";
  onClick?: () => void;
  /** Вызывается при скролле с индексом слайда, который сейчас «в начале» видимой области (0-based). */
  onScrollIndexChange?: (index: number) => void;
}

const defaultOptions: CarouselOptions = {
  axis: "x",
  align: "start",
  dragFree: true,
  loop: false,
};

function getScrollIndex(api: EmblaCarouselType, slideCount: number): number {
  if (slideCount <= 1) return 0;
  const progress = api.scrollProgress();
  const index = Math.round(progress * (slideCount - 1));
  return Math.max(0, Math.min(index, slideCount - 1));
}

export const Carousel = forwardRef<CarouselApi, CarouselProps>(function Carousel(
  {
    children,
    options = {},
    gap = 5,
    className,
    viewportClassName,
    containerClassName,
    showArrows = true,
    overflowY = "hidden",
    onClick,
    onScrollIndexChange,
  },
  ref
) {
  const mergedOptions = { ...defaultOptions, ...options };
  const [emblaRef, emblaApi] = useEmblaCarousel(mergedOptions);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const slideCount = Array.isArray(children) ? children.length : 0;

  useImperativeHandle(
    ref,
    () => ({
      scrollToSlide(index: number) {
        emblaApi?.scrollTo(index, true);
      },
    }),
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = useCallback((api: EmblaCarouselType | undefined) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    updateArrows(emblaApi);
    if (onScrollIndexChange && slideCount > 0) {
      onScrollIndexChange(getScrollIndex(emblaApi, slideCount));
    }
    emblaApi.on("select", () => updateArrows(emblaApi));
    emblaApi.on("scroll", () => {
      updateArrows(emblaApi);
      if (onScrollIndexChange && slideCount > 0) {
        onScrollIndexChange(getScrollIndex(emblaApi, slideCount));
      }
    });
    emblaApi.on("reInit", () => {
      updateArrows(emblaApi);
      if (onScrollIndexChange && slideCount > 0) {
        onScrollIndexChange(getScrollIndex(emblaApi, slideCount));
      }
    });
  }, [emblaApi, updateArrows, onScrollIndexChange, slideCount]);

  return (
    <div className={cn("relative min-w-0 w-full", className)}>
      <div
        ref={emblaRef}
        className={cn("overflow-hidden scrollbar-hide", viewportClassName)}
        style={{
          overflowX: "hidden",
          overflowY,
        }}
        onClick={onClick}
      >
        <div
          className={cn("flex min-w-0", containerClassName)}
          style={{
            gap,
            alignItems: "flex-start",
            touchAction: "pan-y pinch-zoom",
          }}
        >
          {children}
        </div>
      </div>
      {showArrows && (
        <>
          <button
            ref={prevBtnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollPrev();
            }}
            disabled={!canScrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full border-0 bg-white/90 shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white text-[#101010] transition-colors"
            style={{
              width: ARROW_SIZE_PX,
              height: ARROW_SIZE_PX,
              minWidth: ARROW_SIZE_PX,
              minHeight: ARROW_SIZE_PX,
              left: 8,
            }}
            aria-label="Предыдущий"
          >
            <span style={{ transform: "rotate(90deg)", display: "flex" }}>{arrowSvg}</span>
          </button>
          <button
            ref={nextBtnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollNext();
            }}
            disabled={!canScrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full border-0 bg-white/90 shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white text-[#101010] transition-colors"
            style={{
              width: ARROW_SIZE_PX,
              height: ARROW_SIZE_PX,
              minWidth: ARROW_SIZE_PX,
              minHeight: ARROW_SIZE_PX,
              right: 8,
            }}
            aria-label="Следующий"
          >
            <span style={{ transform: "rotate(-90deg)", display: "flex" }}>{arrowSvg}</span>
          </button>
        </>
      )}
    </div>
  );
});
