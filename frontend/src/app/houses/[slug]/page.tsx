import React from 'react';
import HouseDetailClient from './HouseDetailClient';

export function generateStaticParams() {
  return [
    { slug: 'hudorian-ibiza' },
    { slug: 'hudorian-marbella' },
    { slug: 'hudorian-lagos' },
    { slug: 'hudorian-cape-town' },
    { slug: 'hudorian-cotswolds' },
    { slug: 'hudorian-kyoto' },
  ];
}

export default function HouseDetailPage() {
  return <HouseDetailClient />;
}
