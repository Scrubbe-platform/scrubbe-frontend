"use client";
import Image from "next/image";
import Link from "next/link";
import { FiSearch, FiBell } from "react-icons/fi";

const NavbarDataS = () => {
  return (
    <>
      {/* Navbar Container */}
      <section className="w-full h-auto  sticky top-0 z-50">
        <nav className=" flex items-center text-gray-800 h-16 w-full  mx-auto sticky top-0 z-50 dark:bg-dark bg-white shadow-sm dark:border-gray-500 border-b border-gray-200">
          {/* Logo - 20% width (1 column) */}
          <div className="col-start-1 col-end-2 row-start-1 row-end-2 flex items-center justify-start h-full pl-4">
            <Link
              href="/"
              className="relative max-w-[250px] h-[60px] flex-shrink-0 mt-2"
            >
              <Image
                src="/scrubbe-logo-01.png"
                alt="scrubbe-logo-01.png"
                width={211}
                height={60}
                className="object-contain"
              />
            </Link>
          </div>

          {/* Search Bar + Right Menu - 80% width (4 columns) */}
          <div className=" w-full flex justify-between items-center px-8 ml-10">
            {/* Search Bar */}
            <div className="flex items-center justify-center flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for anything here..."
                  className="w-full pl-4 pr-12 py-2 dark:bg-transparent dark:border-gray-500 border-gray-200 border  bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <FiSearch size={20} />
                </button>
              </div>
            </div>

            {/* Desktop Right Menu - Bell, Name, and Profile Picture */}
            <aside className="flex items-center gap-4">
              {/* Bell Icon */}
              <button className="p-2 rounded-lg bg-gray-100 cursor-pointer relative">
                <FiBell size={20} className="text-gray-600" />
                {/* Optional notification dot */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Name and Profile Picture */}
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium whitespace-nowrap dark:text-white">
                  Alex Martins
                </span>
                <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all">
                  <Image
                    src="/avatar-blank.jpg"
                    alt="Alex Martins Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </aside>
          </div>
        </nav>
      </section>
    </>
  );
};

export default NavbarDataS;
