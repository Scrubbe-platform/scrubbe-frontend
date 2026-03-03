/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Loader2, PanelRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import Switch from "../ui/Switch";
import { FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import { useThemeStore } from "@/store/themeStore";
import {
  developerNavItem,
  ezraNavItem,
  navItem,
  NavItem,
} from "@/lib/constant/index";
import { useState } from "react";
import useLogout from "@/hooks/useLogout";
import useAuthStore from "@/lib/stores/auth.store";
import { MdDarkMode } from "react-icons/md";
import { HiOutlineLogout } from "react-icons/hi";

type Props = {
  type?: "dashboard" | "ezra" | "developer";
};
const Sidebar = ({ type = "dashboard" }: Props) => {
  const pathname = usePathname();
  const [collapse, setCollapse] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { handleLogout } = useLogout();
  const { isLoading } = useAuthStore();
  const [openDropdown, setOpenDropdown] = useState("");

  const sideBarItem: NavItem[] =
    type == "dashboard"
      ? navItem
      : type == "ezra"
      ? ezraNavItem
      : developerNavItem;

  // Only open parent if current route matches parent or any child
  const isParentOpen = (item: (typeof sideBarItem)[number]) => {
    if (pathname === item.link) return true;
    if (item.menu && item.menu.some((child) => pathname === child?.link))
      return true;
    if (openDropdown === item.name) return true;
    return false;
  };

  // Helper: is a child active?
  const isChildActive = (childLink: string) => pathname === childLink;

  // Helper: is a parent active (current route matches parent or any child)?
  const isParentActive = (item: (typeof navItem)[number]) => {
    if (pathname === item.link) return true;
    if (item.menu && item.menu.some((child: any) => pathname === child.link))
      return true;
    return false;
  };

  return (
    <div
      className={clsx(
        "   border-r border-neutral-200 dark:border-blue-400/50 flex flex-col justify-between overflow-auto",
        collapse
          ? " bg-white dark:bg-dark w-fit flex justify-center items-center p-4 pt-6"
          : "relative h-full min-w-[250px] p-4"
      )}
    >
      <div className="relative">
        <div className="flex items-center justify-between">
          {!collapse && (
            <>
              {type == "ezra" ? (
                <p className=" text-colorScBlue text-3xl font-bold  font-besley">
                  EZRA
                </p>
              ) : (
                <div className=" h-10 flex items-center">
                  <Image
                    src="/scrubbe-logo-01.png"
                    alt="scrubbe-logo-01.png"
                    height={160}
                    width={160}
                    className="object-contain"
                  />
                </div>
              )}
            </>
          )}

          <div
            className={clsx(
              "p-2 dark:bg-subDark bg-gray-100 dark:text-white rounded-md w-fit transition-all delay-100 duration-300 ease-in cursor-pointer",
              collapse ? "rotate-180" : "rotate-0"
            )}
            onClick={() => setCollapse((prev) => !prev)}
          >
            <PanelRight className="" size={17} />
          </div>
        </div>
        {/* </Link> */}

        {!collapse && (
          <div className="flex flex-col gap-1 items-center mt-[15%] flex-1 w-full">
            {sideBarItem?.map((item) => {
              const parentActive = isParentActive(item);
              const parentOpen = isParentOpen(item);
              const { Icon, link, name, menu } = item;
              return (
                <div key={name} className="w-full">
                  <div
                    className={clsx(
                      "flex items-center gap-2 max-h-10 h-full rounded-lg cursor-pointer transition-all duration-300 px-3 py-3 w-full",
                      parentActive
                        ? "font-semibold  dark:text-white"
                        : "bg-transparent opacity-60 hover:opacity-100 dark:text-white"
                    )}
                  >
                    <Icon size={18} />
                    <Link href={link} className="flex-1">
                      <p className="text-sm transition-all delay-200 duration-100">
                        {name}
                      </p>
                    </Link>
                    {menu && menu.length > 0 && (
                      <span
                        onClick={() =>
                          setOpenDropdown((prev) => (prev !== name ? name : ""))
                        }
                        className={clsx(
                          "ml-auto transition-transform p-1",
                          parentOpen ? "rotate-90" : "rotate-0"
                        )}
                      >
                        <FiChevronRight />
                      </span>
                    )}
                  </div>
                  {/* Nested children */}
                  {menu && menu.length > 0 && parentOpen && (
                    <div className="ml-8 flex flex-col gap-1 py-1">
                      {menu?.map(({ name, link }) => {
                        return (
                          <div key={name}>
                            <Link
                              href={link}
                              className={clsx(
                                "flex items-center gap-2 rounded px-2 py-2 text-sm transition-all duration-200",
                                isChildActive(link)
                                  ? "text-colorScBlue dark:text-white bg-primary-100 font-semibold "
                                  : "hover:bg-blue-50 dark:hover:bg-primary-100 dark:text-white opacity-80 hover:opacity-100"
                              )}
                            >
                              {name}
                            </Link>

                            {/* {childMenu && childMenu.length > 0 ? (
                          <div className="ml-8 space-y-2 mt-2">
                            {childMenu.map((item) => {
                              const isSelected =
                                selectedDataSource === item?.link;

                              return (
                                <div
                                  onClick={() =>
                                    setSelectedDataSource(item!.link)
                                  }
                                  key={item?.name}
                                  className={clsx(
                                    "flex items-center cursor-pointer gap-2 rounded px-2 py-2 text-sm transition-all duration-200",
                                    isSelected
                                      ? "bg-colorScBlue text-white font-semibold "
                                      : "hover:bg-blue-50 dark:hover:bg-blue-800 dark:text-white opacity-80 hover:opacity-100"
                                  )}
                                >
                                  {item?.name}
                                </div>
                              );
                            })}
                          </div>
                        ) : null} */}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!collapse && (
        <div className="flex flex-col mt-10 gap-2">
          <div className="flex items-center gap-2 justify-between py-3 px-3">
            <div className="flex items-center gap-2">
              <MdDarkMode size={15} className=" dark:text-neutral-100" />
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
          </div>
          <div
            onClick={() => handleLogout()}
            className="flex items-center gap-2 justify-between py-2 px-3 cursor-pointer  hover:text-rose-500 hover:bg-rose-100 transition-all duration-100 opacity-60 hover:opacity-100 rounded-sm "
          >
            <div className="flex items-center gap-2">
              <HiOutlineLogout size={20} className=" dark:text-white" />

              <p className={clsx("text-sm  dark:text-white gap-2")}>Logout</p>
            </div>
            {isLoading && <Loader2 className=" animate-spin" />}
          </div>

          {type == "ezra" && (
            <div className="flex text-sm items-center gap-2 dark:text-white/60 text-black/60 justify-center ">
              <p>Powered by</p>
              <img
                src="/scrubbe-logo-01.png"
                className="w-10 h-10 scale-[2] ml-4 object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
