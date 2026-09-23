'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  region: string;
  rateFromEUR: number; // Conversion rate relative to EUR base
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    region: 'Nigeria',
    rateFromEUR: 1750,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    region: 'United States',
    rateFromEUR: 1.08,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    region: 'European Union',
    rateFromEUR: 1.0,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    region: 'United Kingdom',
    rateFromEUR: 0.85,
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  convertPrice: (amountInEUR: number) => number;
  formatPrice: (amountInEUR: number, options?: { showDecimals?: boolean }) => string;
  availableCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Default to NGN as requested
  const [currency, setCurrencyState] = useState<CurrencyCode>('NGN');

  useEffect(() => {
    const saved = localStorage.getItem('hudorian_currency') as CurrencyCode;
    if (saved && CURRENCIES[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('hudorian_currency', code);
    }
  };

  const currentConfig = CURRENCIES[currency];

  const convertPrice = (amountInEUR: number): number => {
    if (typeof amountInEUR !== 'number' || isNaN(amountInEUR)) return 0;
    return Math.round(amountInEUR * currentConfig.rateFromEUR);
  };

  const formatPrice = (amountInEUR: number, options?: { showDecimals?: boolean }): string => {
    if (typeof amountInEUR !== 'number' || isNaN(amountInEUR)) return `${currentConfig.symbol}0`;
    const converted = convertPrice(amountInEUR);

    if (currency === 'NGN') {
      // Nigerian Naira formatted with standard comma delimiters, no decimals for round elegance
      return `₦${converted.toLocaleString('en-NG')}`;
    }

    if (currency === 'USD') {
      return `$${converted.toLocaleString('en-US')}`;
    }

    if (currency === 'EUR') {
      return `€${converted.toLocaleString('de-DE')}`;
    }

    if (currency === 'GBP') {
      return `£${converted.toLocaleString('en-GB')}`;
    }

    return `${currentConfig.symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig: currentConfig,
        setCurrency,
        convertPrice,
        formatPrice,
        availableCurrencies: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Graceful fallback if rendered outside provider during SSG or isolated tests
    return {
      currency: 'NGN' as CurrencyCode,
      currencyConfig: CURRENCIES.NGN,
      setCurrency: () => {},
      convertPrice: (amt: number) => Math.round(amt * 1750),
      formatPrice: (amt: number) => `₦${Math.round(amt * 1750).toLocaleString('en-NG')}`,
      availableCurrencies: Object.values(CURRENCIES),
    };
  }
  return context;
}

