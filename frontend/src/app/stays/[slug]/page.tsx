import React, { Suspense } from 'react';
import RoomDetailClient from './RoomDetailClient';

export function generateStaticParams() {
  return [
    { slug: 'hudorian-ibiza-horizon-suite' },
    { slug: 'hudorian-ibiza-private-villa-pavilion' },
    { slug: 'hudorian-marbella-horizon-suite' },
    { slug: 'hudorian-marbella-private-villa-pavilion' },
    { slug: 'hudorian-lagos-horizon-suite' },
    { slug: 'hudorian-lagos-private-villa-pavilion' },
    { slug: 'hudorian-cape-town-horizon-suite' },
    { slug: 'hudorian-cape-town-private-villa-pavilion' },
    { slug: 'hudorian-cotswolds-horizon-suite' },
    { slug: 'hudorian-cotswolds-private-villa-pavilion' },
    { slug: 'hudorian-kyoto-horizon-suite' },
    { slug: 'hudorian-kyoto-private-villa-pavilion' },
  ];
}

export default function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">Loading...</div>}>
      <RoomDetailClient params={params} />
    </Suspense>
  );
}
