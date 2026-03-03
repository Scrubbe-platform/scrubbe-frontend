/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/lib/constant/index";
import { FaSignOutAlt } from "react-icons/fa";
import useLogout from "@/hooks/useLogout";
import { BsArrowBarLeft } from "react-icons/bs";
import { useSidebar } from "@/lib/stores/useSidebar";

const Sidebar = () => {
  const pathname = usePathname();

  // Only open parent if current route matches parent or any child

  // Helper: is a child active?

  // Helper: is a parent active (current route matches parent or any child)?

  const { handleLogout } = useLogout();
  const { collapse, toggle } = useSidebar();
  return (
    <div
      className={clsx(
        "border-r border-blue-400/50 flex-col justify-between bg-IMSGreen px-3 py-5 overflow-auto ",
        collapse ? "hidden" : "flex"
      )}
    >
      <div className="relative">
        {/* <Link
          href="/dashboard"
          className="relative w-[141px] h-[40px] sm:w-[176px] sm:h-[50px] lg:w-[211px] lg:h-[60px] "
        > */}
        <div className="flex items-center justify-between">
          <div className="h-[30px] w-[220px]">
            <img
              src="/whitelogo.png"
              alt="scrubbe.png"
              className="object-contain h-full "
            />
          </div>

          <div
            onClick={toggle}
            className={clsx(
              "cursor-pointer",
              collapse
                ? " absolute left-10 top-[10px] bg-IMSLightGreen size-14 rounded-full flex justify-center items-center "
                : ""
            )}
          >
            <BsArrowBarLeft className=" text-white" />
          </div>

          {/* <div
            className={clsx(
              "p-2 dark:bg-subDark bg-gray-100 dark:text-white rounded-md w-fit transition-all delay-100 duration-300 ease-in cursor-pointer",
              collapse ? "rotate-180" : "rotate-0"
            )}
            onClick={() => setCollapse((prev) => !prev)}
          >
            <PanelRight className="" />
          </div> */}
        </div>
        {/* </Link> */}

        <div className="flex flex-col gap-1  mt-[15%] flex-1 w-full">
          {AdminSidebar.map((item) => {
            const active = pathname === item.link;
            const { Icon, link, name, isActive } = item;
            return (
              <Link href={isActive ? link : "#"} key={name} className="w-full">
                <div
                  className={clsx(
                    "flex items-center text-white gap-2 max-h-10 h-full rounded-lg cursor-pointer transition-all duration-300 px-3 py-3 w-full",
                    active ? "bg-IMSLightGreen" : "bg-transparent",
                    isActive ? "opacity-100" : "opacity-40"
                  )}
                >
                  <Icon size={18} />
                  <div className="flex-1">
                    <p className="text-sm transition-all delay-200 duration-100">
                      {name}
                    </p>
                  </div>
                </div>
                {/* Nested children */}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col mt-6 ">
        {/* <div className="flex items-center gap-2 justify-between py-3 px-3">
            <div className="flex items-center gap-2">
              <Moon size={26} className={clsx(" fill-colorScBlue")} />
              <p
                className={clsx(
                  "text-sm transition-all delay-200 duration-100 opacity-60 hover:opacity-100 dark:text-white gap-2"
                )}
              >
                Dark Mode
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
          </div> */}

        <div
          onClick={() => handleLogout()}
          className="flex items-center gap-2 justify-between py-2 px-3 cursor-pointer text-white hover:bg-rose-500 transition-all duration-100 opacity-60 hover:opacity-100 rounded-sm "
        >
          <div className="flex items-center gap-2">
            <FaSignOutAlt className="text-white" />

            <p className={clsx("text-sm text-white gap-2")}>Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
