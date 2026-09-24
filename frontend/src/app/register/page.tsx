'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/membership/apply');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-4">
      <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs uppercase tracking-[0.25em] text-[#96754B] font-mono">
        Routing to Membership Application...
      </p>
    </div>
  );
}
