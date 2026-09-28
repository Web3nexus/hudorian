'use client';

import { useSyncExternalStore } from 'react';

const TOKEN_KEY = 'hudorian_token';
const EVENT = 'hudorian:token';

function subscribe(onChange: () => void): () => void {
  // A storage event covers other tabs; the custom event covers writes made in
  // this tab, which the browser does not report on its own.
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);

  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function snapshot(): string | null {
  return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
}

/**
 * The signed-in reader's bearer token, or null when signed out.
 *
 * Reads through useSyncExternalStore so the server snapshot and the first
 * client render agree; the value is only trusted after hydration.
 */
export function useStoredToken(): string | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

/**
 * Persist a reader token and notify everything watching for one, so a guest who
 * has just paid sees their archive open without a reload.
 */
export function storeToken(token: string): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event(EVENT));
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Whether a reader is signed in, or null before the token has been read.
 *
 * A missing token means signed out, not unknown, so the hydrated flag is kept
 * separate from the token itself; conflating them leaves a signed-out reader
 * waiting on a loading state that never resolves.
 */
export function useIsSignedIn(): boolean | null {
  const token = useStoredToken();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!hydrated) return null;

  return Boolean(token);
}
