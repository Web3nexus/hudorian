'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { JournalPost } from '@/types';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';

export default function JournalPage() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { getPageContent } = useCms();

  const heroContent = getPageContent('page_journal', {
    title: 'The HUDORIAN Journal',
    subtitle: 'Essays on architectural proportion, culinary terroir, and the craft of slower living across our Houses.',
    media_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=2000&q=85',
  });

  useEffect(() => {
    api.getJournal()
      .then((res) => {
        if (res.data) setPosts(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Header (Managed by CMS Studio) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-3">
            EDITORIAL DISPATCHES
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] tracking-tight mb-6">
            {heroContent.title || 'The HUDORIAN Journal'}
          </h1>
          <p className="text-base text-[#141414]/70 font-light leading-relaxed">
            {heroContent.subtitle || 'Essays on architectural proportion, culinary terroir, and the craft of slower living across our Houses.'}
          </p>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs uppercase tracking-[0.2em] text-black/50">
            Fetching essays...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500"
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-200">
                    <img
                      src={post.cover_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {post.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] uppercase tracking-wider">
                        {post.category.name}
                      </span>
                    )}
                  </div>

                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-4 text-xs text-[#96754B] uppercase tracking-wider font-medium">
                      <span>{post.author_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.reading_time_minutes} min read
                      </span>
                    </div>

                    <h2 className="font-serif-luxury text-2xl md:text-3xl text-[#141414] leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#141414]/75 font-light leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-8 pt-0">
                  <Link
                    href={`/journal/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#141414] group-hover:text-[#96754B] transition"
                  >
                    Read Essay <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

