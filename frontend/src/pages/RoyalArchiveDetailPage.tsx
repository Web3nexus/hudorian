import React from 'react';
import { useParams } from 'react-router-dom';
import BookDetail from '@/components/archive/BookDetail';

export default function RoyalArchiveDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  return <BookDetail slug={slug || ''} />;
}
