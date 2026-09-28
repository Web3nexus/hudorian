'use client';

import React from 'react';
import Link from 'next/link';
import { BookAccess } from '@/types';
import { Book } from '@/types';

const currencySymbols: Record<string, string> = {
  EUR: '€',
  NGN: '₦',
  USD: '$',
  GBP: '£',
};

export const formatPrice = (amount: number, currency: string): string => {
  const symbol = currencySymbols[currency] || `${currency} `;
  return `${symbol}${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function BookCard({ book }: { book: Book }) {
  const cover = book.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80';
  const access: BookAccess | null | undefined = book.access;

  return (
    <article className="group flex flex-col bg-white border border-[#E8E2D8] rounded-xs overflow-hidden hover:shadow-lg transition duration-500">
      <Link href={`/royal-archive/${book.slug}`} className="block relative aspect-3/4 overflow-hidden bg-[#F4EFEA]">
        <img
          src={cover}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden />

        {book.is_featured && (
          <span className="absolute top-4 left-4 px-2.5 py-1 bg-[#C5A880] text-[#141414] text-[9px] font-semibold uppercase tracking-[0.18em] rounded-full">
            Featured
          </span>
        )}

        {access && (
          <span className="absolute top-4 right-4 px-2.5 py-1 bg-black/70 backdrop-blur-md text-[#FAF8F5] text-[9px] font-semibold uppercase tracking-[0.18em] rounded-full">
            {access.loan_type === 'purchase' ? 'In Your Archive' : 'Borrowed'}
          </span>
        )}

        <div className="absolute bottom-0 inset-x-0 p-5">
          {book.collection?.name && (
            <span className="block text-[9px] uppercase tracking-[0.24em] text-[#C5A880] mb-2">
              {book.collection.name}
            </span>
          )}
          <h3 className="font-serif-luxury text-xl font-light text-[#FAF8F5] leading-snug line-clamp-2">
            {book.title}
          </h3>
        </div>
      </Link>

      <div className="p-5 flex flex-col grow">
        <p className="text-xs text-[#141414]/55 font-light mb-4 line-clamp-1">{book.author}</p>

        {book.short_description && (
          <p className="text-sm text-[#141414]/65 font-light leading-relaxed mb-5 line-clamp-3 grow">
            {book.short_description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-[#E8E2D8] flex items-end justify-between gap-3">
          <div>
            {book.allow_purchase ? (
              <>
                <span className="block text-[9px] uppercase tracking-[0.18em] text-[#141414]/45">Outright</span>
                <span className="font-serif-luxury text-lg text-[#141414]">
                  {formatPrice(book.purchase_price, book.currency)}
                </span>
              </>
            ) : (
              <>
                <span className="block text-[9px] uppercase tracking-[0.18em] text-[#141414]/45">Borrow</span>
                <span className="font-serif-luxury text-lg text-[#141414]">
                  {formatPrice(book.rental_price, book.currency)}
                </span>
                <span className="block text-[10px] text-[#141414]/45">
                  {book.effective_rental_days} day term
                </span>
              </>
            )}
          </div>

          <span className="text-[9px] uppercase tracking-[0.18em] px-2 py-1 border border-[#E8E2D8] text-[#141414]/50 rounded-full shrink-0">
            {book.format}
          </span>
        </div>
      </div>
    </article>
  );
}
