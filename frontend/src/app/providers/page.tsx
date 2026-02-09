'use client';

import dynamic from 'next/dynamic';
import Frame3LoadingSkeleton from '../../components/Frame3LoadingSkeleton';

// Временно: постоянный показ скелетона. Вернуть обычную страницу: SHOW_SKELETON = false.
const SHOW_SKELETON = true;

const Frame3 = dynamic(() => import('../../components/frames/Frame3'), {
  loading: () => <Frame3LoadingSkeleton />,
  ssr: false,
});

export default function ProvidersPage() {
  if (SHOW_SKELETON) {
    return <Frame3LoadingSkeleton />;
  }
  return <Frame3 />;
}
