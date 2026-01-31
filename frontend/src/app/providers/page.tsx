'use client';

import dynamic from 'next/dynamic';

const Frame3 = dynamic(() => import('../../components/frames/Frame3'), {
  loading: () => (
    <div className="flex min-h-[870px] w-full max-w-[400px] mx-auto items-center justify-center bg-[#F5F5F5]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E30611] border-t-transparent" />
    </div>
  ),
  ssr: false,
});

export default function ProvidersPage() {
  return <Frame3 />;
}
