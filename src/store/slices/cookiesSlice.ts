import type { StateCreator } from "zustand";

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export type cookiesSliceType = {
  cookieConsent: boolean;
  cookiePreferences: CookiePreferences;
  showCookieModal: boolean;

  // Actions
  setShowCookieModal: (show: boolean) => void;
  acceptAllCookies: () => void;
  acceptEssentialOnly: () => void;
  setCookiePreferences: (preferences: CookiePreferences) => void;
  updateCookiePreference: (
    category: keyof CookiePreferences,
    value: boolean
  ) => void;
};

export const createCookiesSlice: StateCreator<cookiesSliceType> = (set) => ({
  cookieConsent: false,
  cookiePreferences: {
    essential: true, // Always required
    analytics: false,
    functional: false,
    marketing: false,
  },
  showCookieModal: false,

  // Action to show/hide the cookie modal
  setShowCookieModal: (show) => set({ showCookieModal: show }),

  // Accept all cookies
  acceptAllCookies: () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    };

    // Set cookie consent in document cookie
    document.cookie = `cookie_consent=true; max-age=${
      365 * 24 * 60 * 60
    }; path=/`;

    set({
      cookieConsent: true,
      cookiePreferences: allAccepted,
      showCookieModal: false,
    });
  },

  // Accept only essential cookies
  acceptEssentialOnly: () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    };

    // Set cookie consent in document cookie
    document.cookie = `cookie_consent=true; max-age=${
      365 * 24 * 60 * 60
    }; path=/`;

    set({
      cookieConsent: true,
      cookiePreferences: essentialOnly,
      showCookieModal: false,
    });
  },

  // Set custom cookie preferences
  setCookiePreferences: (preferences) => {
    // Set cookie consent in document cookie
    document.cookie = `cookie_consent=true; max-age=${
      365 * 24 * 60 * 60
    }; path=/`;

    set({
      cookieConsent: true,
      cookiePreferences: preferences,
      showCookieModal: false,
    });
  },

  // Update a single cookie preference
  updateCookiePreference: (category, value) => {
    // Don't allow essential cookies to be disabled
    if (category === "essential" && !value) return;

    set((state) => ({
      cookiePreferences: {
        ...state.cookiePreferences,
        [category]: value,
      },
    }));
  },
});
