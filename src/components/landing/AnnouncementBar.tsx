"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const COOKIE_NAME = "announcement_dismissed";
const COOKIE_EXPIRY_HOURS = 24;

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the cookie exists
    const hasDismissedCookie = document.cookie
      .split("; ")
      .some((row) => row.startsWith(`${COOKIE_NAME}=`));

    // Only show the announcement if cookie doesn't exist
    if (!hasDismissedCookie) {
      setIsVisible(true);

      // Set a timer to hide it after 20 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setDismissedCookie();
      }, 20000);

      // Clear the timer when component unmounts
      return () => clearTimeout(timer);
    }
  }, []);

  // Function to set cookie with 24-hour expiration
  const setDismissedCookie = () => {
    const expiryDate = new Date();
    expiryDate.setTime(
      expiryDate.getTime() + COOKIE_EXPIRY_HOURS * 60 * 60 * 1000
    );
    document.cookie = `${COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissedCookie();
  };

  return (
    <section
      className={`
    fixed top-0 left-0 z-[999] w-full 
    bg-blue-600 text-white 
    transform transition-transform duration-500 ease-in-out
    ${isVisible ? "translate-y-0" : "-translate-y-full"}
  `}
    >
      <nav className="max-w-[1440px] mx-auto w-full flex items-center justify-between px-4 py-3">
        <p className="text-center flex-grow font-medium">
          🛡️ New: Enhanced threat detection features now available! Schedule a
          demo today.
        </p>
        <button
          onClick={handleDismiss}
          className="ml-4 p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close announcement"
        >
          <X size={20} />
        </button>
      </nav>
    </section>
  );
};

export default AnnouncementBar;
