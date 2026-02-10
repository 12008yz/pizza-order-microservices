'use client';

import dynamic from 'next/dynamic';
import LoadingScreen from '../../components/LoadingScreen';

const Frame5 = dynamic(() => import('../../components/frames/Frame5'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

export default function OrderPage() {
  return <Frame5 />;
}
