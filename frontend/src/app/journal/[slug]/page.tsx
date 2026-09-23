'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Share2 } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { JournalPost } from '@/types';
import { api } from '@/lib/api';

export default function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [post, setPost] = useState<JournalPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.getJournalPost(slug)
      .then((res) => {
        if (res.data) setPost(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#96754B] animate-pulse">
          Opening Essay...
        </span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif-luxury text-3xl mb-4">Essay Not Found</h1>
        <Link href="/journal" className="text-xs uppercase tracking-[0.2em] underline">
          Return to The Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-4xl mx-auto w-full">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-black/60 hover:text-black mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to The Journal
        </Link>

        {/* Title & Metadata */}
        <div className="space-y-4 mb-10">
          {post.category && (
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B]">
              {post.category.name}
            </span>
          )}
          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] leading-[1.15]">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs uppercase tracking-wider text-black/60 pt-4 border-t border-[#E8E2D8]">
            <span>Words by {post.author_name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.reading_time_minutes} min read
            </span>
          </div>
        </div>

        {/* Cover Media */}
        <div className="relative aspect-16/9 rounded-xs overflow-hidden bg-stone-200 mb-12 shadow-md">
          <img
            src={post.cover_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Excerpt Lead */}
        <p className="font-serif-luxury text-xl sm:text-2xl text-[#141414]/90 font-light italic leading-relaxed mb-10 border-l-2 border-[#96754B] pl-6">
          &ldquo;{post.excerpt}&rdquo;
        </p>

        {/* Body Content */}
        <div className="text-base sm:text-lg text-[#141414]/85 font-light leading-relaxed space-y-6 whitespace-pre-line pb-16 border-b border-[#E8E2D8]">
          {post.content}
        </div>

        {/* Navigation Footer */}
        <div className="pt-8 flex justify-between items-center text-xs uppercase tracking-[0.2em]">
          <Link href="/journal" className="font-semibold text-black hover:text-[#96754B]">
            ← Return to Journal
          </Link>
          <Link href="/membership/apply" className="font-semibold text-[#96754B] hover:underline">
            Apply for Membership
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

