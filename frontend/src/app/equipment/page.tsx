'use client';

import dynamic from 'next/dynamic';

const Frame4 = dynamic(() => import('../../components/frames/Frame4'), {
  loading: () => (
    <div className="flex min-h-[100dvh] w-full max-w-[400px] mx-auto items-center justify-center bg-[#F5F5F5]" style={{ paddingTop: 'var(--sat, 0px)', paddingBottom: 'var(--sab, 0px)' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E30611] border-t-transparent" />
    </div>
  ),
  ssr: false,
});

export default function EquipmentPage() {
  return <Frame4 />;
}
