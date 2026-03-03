/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie, setCookie } from 'cookies-next';
import { fetchFingerprint } from './fetcher';

const COOKIE_CONSENT_KEY = 'cookie_consent';

export const getCookieConsent = (): boolean => {
  return getCookie(COOKIE_CONSENT_KEY) === 'true';
};

export const setCookieConsent = (consent: boolean) => {
  setCookie(COOKIE_CONSENT_KEY, consent.toString(), {
    maxAge: 24 * 60 * 60, 
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
};

export const getFingerprintWithConsent = async (): Promise<{
  fingerprint: any;
  hasConsent: boolean;
}> => {
  const hasConsent = getCookieConsent();
  
  if (!hasConsent) {
    return { fingerprint: null, hasConsent: false };
  }

  try {
    const fingerprint = await fetchFingerprint();
    return { fingerprint, hasConsent: true };
  } catch (error) {
    console.error('Failed to fetch fingerprint:', error);
    return { fingerprint: null, hasConsent: true };
  }
};