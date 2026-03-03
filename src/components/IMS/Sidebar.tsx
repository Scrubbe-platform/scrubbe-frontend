/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { IMSSidebar, NavItem, NewMenu, SubSidebar } from "@/lib/constant/index";
import { FaSignOutAlt } from "react-icons/fa";
import useLogout from "@/hooks/useLogout";
import { BsArrowBarLeft } from "react-icons/bs";
import { useSidebar } from "@/lib/stores/useSidebar";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "border-r border-white/20 flex-col justify-between bg-dark px-3 py-5 overflow-auto ",
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
              src="/IMS/logo-white.png"
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

        <div className="border p-1 px-2 rounded-lg flex items-center gap-2 text-white mt-3 w-fit">
          <div className="size-2 rounded-full bg-emerald-400" />
          <span className="text-sm">Acme Payments PROD</span>
        </div>

        <div className="flex items-center gap-1 border border-neutral-400 rounded-lg px-2 mt-3">
          <input placeholder="Search Menu" className="h-9 border-none outline-none bg-transparent text-sm flex-1" />
          <div>
            <Search className="text-white " size={14} />
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-1  mt-[15%] w-full border-b border-white/50 pb-2">
            <p className=" text-sm text-white pl-3 pb-2 uppercase font-medium">Overview</p>
            {NewMenu.overview.map((item) => {
              const active = pathname === item.link;
              const { Icon, link, name, isActive, description, pillBorderColor, pillText, pillTextColor } = item;
              return (
                <Link href={isActive ? link : "#"} key={name} className="w-full">
                  <div
                    className={clsx(
                      "flex  text-white gap-2  h-full rounded-lg cursor-pointer transition-all duration-300 px-3 py-3 w-full",
                      active ? "bg-gradient-to-t from-[#004B571A] to-[#0074834D] border-IMSCyan border" : "bg-transparent",
                    )}
                  >
                    <Icon size={18} />
                    <div className="flex-1 space-y-1 -mt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm transition-all delay-200 duration-100">
                          {name}
                        </p>
                        {pillText &&
                          <p className={`${pillBorderColor || ""} ${pillTextColor || ""} border rounded-full px-1 py-0.5 text-xs`}>{pillText}</p>
                        }
                      </div>
                      <p className="text-xs">
                        {description}
                      </p>
                    </div>
                  </div>
                  {/* Nested children */}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-1  mt-[15%] w-full border-b border-white/50 pb-2">
            <p className=" text-sm text-white pl-3 pb-2 uppercase font-medium">Incident Command</p>
            {NewMenu.incident_command.map((item, index) => {
                           return <AdminSidebarItem item={item} pathname={pathname} key={index} />

            })}
          </div>

          <div className="flex flex-col gap-1  mt-[15%] w-full border-b border-white/50 pb-2">
          <p className=" text-sm text-white pl-3 pb-2 uppercase font-medium">Signals & Control</p>
            {NewMenu.signals_control.map((item,index) => {
                          return  <AdminSidebarItem item={item} pathname={pathname} key={index}/>

            })}
          </div>

          <div className="flex flex-col gap-1  mt-[15%] w-full border-b border-white/50 pb-2">
          <p className=" text-sm text-white pl-3 pb-2 uppercase font-medium">Ezra</p>
            {NewMenu.ezra.map((item, index) => {
              return  <AdminSidebarItem item={item} pathname={pathname} key={index} />
            })}
          </div>

          <div className="flex flex-col gap-1  mt-[15%] w-full border-b border-white/50 pb-2">
          <p className=" text-sm text-white pl-3 pb-2 uppercase font-medium">Reliability Outcomes</p>
            {NewMenu.reliability.map((item,index) => {
              return  <AdminSidebarItem item={item} pathname={pathname} key={index}/>
            })}
          </div>

          <div className="flex flex-col gap-1  mt-[15%] w-full border-b border-white/50 pb-2">
          <p className=" text-sm text-white pl-3 pb-2 uppercase font-medium">Audit & Governance</p>
            {NewMenu.audit.map((item,index) => {
              return  <AdminSidebarItem item={item} pathname={pathname} key={index} />
            })}
          </div>

          <div className="flex flex-col gap-1  mt-[15%] w-full border-b border-white/50 pb-2">
          <p className=" text-sm text-white pl-3 pb-2 uppercase font-medium">Integration</p>
            {NewMenu.integrations.map((item,index) => {
              return  <AdminSidebarItem item={item} pathname={pathname} key={index} />
            })}
          </div>
          <div className="flex flex-col gap-1  mt-[15%] w-full border-b border-white/50 pb-2">
          <p className=" text-sm text-white pl-3 pb-2 uppercase font-medium">Workspace</p>
            {NewMenu.workspace.map((item,index) => {
              return  <AdminSidebarItem item={item} pathname={pathname} key={index} />
            })}
          </div>
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
        <p className=" text-sm text-white pl-3 pb-2">Account</p>
        {SubSidebar.map((item) => {
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



interface SidebarItemProps {
  item: NavItem
  pathname: string;
}

const AdminSidebarItem = ({ item, pathname }: SidebarItemProps) => {
  const { 
    Icon, 
    link, 
    name, 
    isActive, 
    description, 
    pillText, 
    pillBorderColor, 
    pillTextColor 
  } = item;

  // Active state based on current navigation path
  const active = pathname === link;

  return (
       <Link href={link} key={name} className="w-full">
        <div
          className={clsx(
            "flex  text-white gap-2  h-full rounded-lg cursor-pointer transition-all duration-300 px-3 py-3 w-full",
            active ? "bg-gradient-to-t from-[#004B571A] to-[#0074834D] border-IMSCyan border" : "bg-transparent",
          )}
        >
          <Icon size={18} />
          <div className="flex-1 space-y-1 -mt-1">
            <div className="flex items-center justify-between">
              <p className="text-sm transition-all delay-200 duration-100">
                {name}
              </p>
              {pillText &&
                <p className={`${pillBorderColor || ""} ${pillTextColor || ""} border rounded-full px-1 py-0.5 text-xs uppercase`}>{pillText}</p>
              }
            </div>
            <p className="text-xs">
              {description}
            </p>
          </div>
        </div>
        {/* Nested children */}
      </Link>
   );
};

