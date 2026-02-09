'use client';

import dynamic from 'next/dynamic';

const Frame4 = dynamic(() => import('../../components/frames/Frame4'), {
  loading: () => null,
  ssr: false,
});

export default function EquipmentPage() {
  return <Frame4 />;
}
