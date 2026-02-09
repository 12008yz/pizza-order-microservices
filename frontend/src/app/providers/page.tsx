'use client';

import dynamic from 'next/dynamic';
import Frame3LoadingSkeleton from '../../components/Frame3LoadingSkeleton';

const Frame3 = dynamic(() => import('../../components/frames/Frame3'), {
  loading: () => <Frame3LoadingSkeleton />,
  ssr: false,
});

export default function ProvidersPage() {
  return <Frame3 />;
}
