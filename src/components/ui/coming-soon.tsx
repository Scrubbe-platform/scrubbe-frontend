// ComingSoonPage.tsx
import React from "react";
import { BsLinkedin, BsTwitterX } from "react-icons/bs";

const ComingSoonPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-900">
      <div className="mx-4 max-w-xl px-4 py-16 text-center sm:px-6 lg:px-8">
        {/* You can add a logo or brand name here */}
        {/* <img src="/logo.svg" alt="Logo" className="mx-auto h-12 w-auto" /> */}

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Coming Soon
        </h1>
        <p className="mt-4 text-xl text-gray-600 sm:text-2xl">
          We are hard at work bringing you a new and improved experience. Stay
          tuned for updates!
        </p>

        {/* Optional: Add social media links or a simple CTA */}
        <div className="mt-8 flex justify-center space-x-4">
          <a
            href="https://x.com/_Scrubbe"
            className="text-gray-500 hover:text-gray-900 transition-colors duration-200"
            aria-label="Twitter"
            target="_blank"
          >
            <BsTwitterX />
          </a>
          <a
            href="https://www.linkedin.com/company/scrubbe/"
            className="text-gray-500 hover:text-gray-900 transition-colors duration-200"
            aria-label="LinkedIn"
            target="_blank"
          >
            <BsLinkedin />
            {/* LinkedIn SVG Icon */}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
