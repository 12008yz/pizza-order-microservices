'use client';

import dynamic from 'next/dynamic';

const Frame3 = dynamic(() => import('../../components/frames/Frame3'), {
  loading: () => null,
  ssr: false,
});

export default function ProvidersPage() {
  return <Frame3 />;
}
