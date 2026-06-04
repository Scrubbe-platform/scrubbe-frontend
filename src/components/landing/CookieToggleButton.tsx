"use client";
import React, { useState } from "react";
import { useAppStore } from "@/store/StoreProvider";
import { RxCookie } from "react-icons/rx";

const cookieCategories = [
  {
    key: "essential" as const,
    title: "Essential cookies",
    description:
      "Required for security, session continuity, consent state, and core site functionality. These are always on.",
    label: "Always active",
    alwaysOn: true,
  },
  {
    key: "analytics" as const,
    title: "Analytics cookies",
    description:
      "Help us understand usage patterns so we can improve product pages, onboarding paths, and documentation quality.",
    label: "Allow analytics",
    alwaysOn: false,
  },
  {
    key: "functional" as const,
    title: "Preference cookies",
    description:
      "Remember selected settings such as region, UI preferences, and previously chosen site options.",
    label: "Remember preferences",
    alwaysOn: false,
  },
  {
    key: "marketing" as const,
    title: "Marketing cookies",
    description:
      "Enable campaign measurement and more relevant follow-up communications across trusted channels.",
    label: "Allow marketing",
    alwaysOn: false,
  },
];

// ── Toggle ────────────────────────────────────────────────────────
function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
        ${checked ? "bg-emerald-500" : "bg-zinc-300"}
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform
          ${checked ? "translate-x-7" : "translate-x-1"}
        `}
      />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────
const CookieToggleButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    cookiePreferences,
    acceptAllCookies,
    acceptEssentialOnly,
    setCookiePreferences,
    updateCookiePreference,
  } = useAppStore((state) => state);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsDialogOpen(false);
  };
  const handleEssentialOnly = () => {
    acceptEssentialOnly();
    setIsDialogOpen(false);
  };
  const handleSavePreferences = () => {
    setCookiePreferences(cookiePreferences);
    setIsDialogOpen(false);
  };
  const handleToggleChange = (category: keyof typeof cookiePreferences) => {
    if (category === "essential") return;
    updateCookiePreference(category, !cookiePreferences[category]);
  };

  return (
    <>
      {/* ── Floating cookie button ── */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-3 left-3 z-50 w-12 h-12 rounded-full text-white bg-zinc-900 hover:bg-zinc-700 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none"
        aria-label="Cookie Settings"
      >
        <RxCookie className="w-6 h-6 fill-white" />
      </button>

      {/* ── Backdrop ── */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsDialogOpen(false)}
        />
      )}

      {/* ── Panel ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-auto sm:right-6
          z-50 w-full sm:w-[450px] max-h-[90dvh] flex flex-col
          bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-300
          ${
            isDialogOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 sm:translate-y-0 sm:opacity-0 pointer-events-none"
          }
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-zinc-100 flex-shrink-0">
          <div className="pr-4">
            <h2 className="text-[17px] font-semibold text-black mb-1">
              Cookie preferences
            </h2>
            <p className="text-[13px] text-zinc-500 leading-relaxed">
              We use essential cookies to keep Scrubbe secure and functional.
              You can choose whether to allow analytics, preferences, and
              marketing cookies, and update your choices at any time.
            </p>
          </div>
          <button
            onClick={() => setIsDialogOpen(false)}
            className="shrink-0 px-3 py-1 text-[13px] font-medium text-zinc-600 border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors mt-0.5"
          >
            Close
          </button>
        </div>

        {/* ── Cookie category cards ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
          {cookieCategories.map((cat) => {
            const isOn =
              cat.alwaysOn ||
              !!cookiePreferences[cat.key as keyof typeof cookiePreferences];

            return (
              <div
                key={cat.key}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4"
              >
                <p className="text-[14px] font-semibold text-black mb-1">
                  {cat.title}
                </p>
                <p className="text-[13px] text-zinc-500 leading-relaxed mb-3">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-black">
                    {cat.label}
                  </span>
                  <Toggle
                    checked={isOn}
                    disabled={cat.alwaysOn}
                    onChange={
                      cat.alwaysOn
                        ? undefined
                        : () =>
                            handleToggleChange(
                              cat.key as keyof typeof cookiePreferences
                            )
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-zinc-100 px-4 pt-3 pb-5 flex-shrink-0">
          <p className="text-[12px] text-black leading-relaxed mb-4">
            Your choices are stored locally in this browser and can be updated
            at any time from the cookie settings button.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEssentialOnly}
              className="flex-1 px-3 py-2.5 text-[13px] font-semibold text-black border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Necessary only
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-3 py-2.5 text-[13px] font-semibold text-black border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Accept all
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 px-3 py-2.5 text-[13px] font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieToggleButton;
