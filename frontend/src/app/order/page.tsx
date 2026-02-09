'use client';

import dynamic from 'next/dynamic';

const Frame5 = dynamic(() => import('../../components/frames/Frame5'), {
  loading: () => null,
  ssr: false,
});

export default function OrderPage() {
  return <Frame5 />;
}
