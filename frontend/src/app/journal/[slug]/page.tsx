import React from 'react';
import JournalPostClient from './JournalPostClient';

export function generateStaticParams() {
  return [
    { slug: 'the-architecture-of-belonging' },
    { slug: 'the-art-of-the-ember' },
  ];
}

export default function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return <JournalPostClient params={params} />;
}
