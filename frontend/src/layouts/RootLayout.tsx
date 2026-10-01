import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CmsProvider } from '@/lib/cms';
import { CurrencyProvider } from '@/context/CurrencyContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function RootLayout() {
  return (
    <CmsProvider>
      <CurrencyProvider>
        <ScrollToTop />
        <div className="min-h-full flex flex-col bg-[#FAF8F5] text-[#141414]">
          <Outlet />
        </div>
      </CurrencyProvider>
    </CmsProvider>
  );
}
