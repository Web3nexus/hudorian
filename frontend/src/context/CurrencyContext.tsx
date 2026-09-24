'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  region: string;
  rateFromEUR: number; // Conversion rate relative to EUR base
}

export const BASE_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    region: 'Nigeria',
    rateFromEUR: 1540,
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

export const CURRENCIES = BASE_CURRENCIES;

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  convertPrice: (amountInEUR: number | string) => number;
  formatPrice: (amountInEUR: number | string, options?: { showDecimals?: boolean }) => string;
  availableCurrencies: CurrencyConfig[];
  rateProvider: string;
  isLiveRates: boolean;
  refreshRates: (gateway?: 'manual' | 'flutterwave' | 'paystack') => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Default to NGN as requested
  const [currency, setCurrencyState] = useState<CurrencyCode>('NGN');
  const [liveRates, setLiveRates] = useState<Record<CurrencyCode, number>>({
    NGN: 1540,
    USD: 1.08,
    EUR: 1.0,
    GBP: 0.85,
  });
  const [rateProvider, setRateProvider] = useState<string>('ExchangeRate-API');
  const [isLiveRates, setIsLiveRates] = useState<boolean>(false);

  const refreshRates = useCallback(async (gateway: 'manual' | 'flutterwave' | 'paystack' = 'manual') => {
    try {
      const res = await api.getCurrencyRates(gateway, 'EUR');
      if (res?.data?.rates) {
        setLiveRates((prev) => ({
          ...prev,
          ...(res.data.rates as unknown as Record<CurrencyCode, number>),
        }));
        if (res.data.provider) {
          setRateProvider(res.data.provider);
        }
        setIsLiveRates(Boolean(res.data.is_live));
      }
    } catch {
      // Fallback silently to baseline rates
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('hudorian_currency') as CurrencyCode;
    if (saved && BASE_CURRENCIES[saved]) {
      setCurrencyState(saved);
    }
    // Fetch live rates on mount using ExchangeRate-API for general display
    refreshRates('manual');
  }, [refreshRates]);

  const setCurrency = (code: CurrencyCode) => {
    if (BASE_CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('hudorian_currency', code);
    }
  };

  const currentRate = liveRates[currency] ?? BASE_CURRENCIES[currency].rateFromEUR;
  const currentConfig: CurrencyConfig = {
    ...BASE_CURRENCIES[currency],
    rateFromEUR: currentRate,
  };

  const parseAmount = (amountInEUR: number | string): number => {
    if (typeof amountInEUR === 'number') return isNaN(amountInEUR) ? 0 : amountInEUR;
    if (typeof amountInEUR === 'string') {
      const parsed = parseFloat(amountInEUR);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const convertPrice = (amountInEUR: number | string): number => {
    const num = parseAmount(amountInEUR);
    return Math.round(num * currentRate);
  };

  const formatPrice = (amountInEUR: number | string): string => {
    const num = parseAmount(amountInEUR);
    const converted = convertPrice(num);

    if (currency === 'NGN') {
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

  const dynamicCurrencies = Object.values(BASE_CURRENCIES).map((cfg) => ({
    ...cfg,
    rateFromEUR: liveRates[cfg.code] ?? cfg.rateFromEUR,
  }));

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig: currentConfig,
        setCurrency,
        convertPrice,
        formatPrice,
        availableCurrencies: dynamicCurrencies,
        rateProvider,
        isLiveRates,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'NGN' as CurrencyCode,
      currencyConfig: BASE_CURRENCIES.NGN,
      setCurrency: () => {},
      convertPrice: (amt: number | string) => {
        const val = typeof amt === 'string' ? parseFloat(amt) : Number(amt);
        return Math.round((isNaN(val) ? 0 : val) * 1540);
      },
      formatPrice: (amt: number | string) => {
        const val = typeof amt === 'string' ? parseFloat(amt) : Number(amt);
        return `₦${Math.round((isNaN(val) ? 0 : val) * 1540).toLocaleString('en-NG')}`;
      },
      availableCurrencies: Object.values(BASE_CURRENCIES),
      rateProvider: 'ExchangeRate-API',
      isLiveRates: false,
      refreshRates: async () => {},
    };
  }
  return context;
}
