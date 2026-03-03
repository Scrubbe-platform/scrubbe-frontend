"use client";
import Cbutton from "@/components/ezra-landing/Cbutton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const navItem = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Contact",
    link: "/#",
  },
];
const NavbarEzra = () => {
  const textColor = "text-gray-800";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        if (window.scrollY > 30) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
      };

      window.addEventListener("scroll", handleScroll);
      // Initial check
      handleScroll();

      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  // Close menu on route change (optional, for better UX)
  useEffect(() => {
    if (menuOpen) {
      const close = () => setMenuOpen(false);
      if (typeof window !== "undefined") {
        window.addEventListener("resize", close);
        return () => window.removeEventListener("resize", close);
      }
    }
  }, [menuOpen]);

  return (
    <section
      className={`w-full h-auto bg-transparent flex justify-center py-3 top-0 z-50 ${
        scrolled ? "sticky backdrop-blur-md" : "absolute"
      } `}
    >
      <nav
        className={`flex ${textColor} h-16 w-full max-w-[1440px] justify-between items-center px-4 md:px-6 lg:px-10 xl:px-20 sticky top-0 z-50 bg-transparent shadow-sm`}
      >
        {/* Hamburger for mobile */}
        <div className="flex items-center md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        {/* Nav links - desktop */}
        <div className="gap-[20px] hidden md:flex">
          {navItem.map((item) => (
            <Link
              href={item.link}
              key={item.label}
              className=" text-white cursor-pointer hover:font-bold transition duration-200 "
            >
              {item.label}
            </Link>
          ))}
        </div>
        {/* Logo */}
        <div className="text-center flex-1 flex justify-center md:justify-center">
          <p className=" text-[32px] sm:text-[48px] md:text-[64px] font-bold text-colorScBlue uppercase font-besley">
            Ezra
          </p>
        </div>
        <div className="hidden md:block">
          <Cbutton onClick={() => router.push("/auth/signin?to=ezra")}>
            Log In
          </Cbutton>
        </div>
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="absolute top-16 left-0 w-full bg-[#181C2A] border-b border-zinc-700 flex flex-col items-center md:hidden animate-fade-in z-50">
            {navItem.map((item) => (
              <Link
                href={item.link}
                key={item.label}
                className="w-full text-center py-4 text-white hover:font-bold border-b border-zinc-800"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="w-full flex justify-center py-4">
              <Cbutton
                onClick={() => router.push("/auth/signin?to=ezra")}
                className="w-11/12"
              >
                Log In
              </Cbutton>
            </div>
          </div>
        )}
      </nav>
    </section>
  );
};

export default NavbarEzra;
