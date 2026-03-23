"use client";
import CButton from "@/components/ui/Cbutton";
import { menuItems, MenuOption } from "@/lib/constant/menu-item";
import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { IconType } from "react-icons";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { VscChevronDown } from "react-icons/vsc";

const textColor = "text-white";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectMenu, setSelectMenu] = useState<number | undefined>();
  const [selectTab, setSelectTab] = useState<MenuOption | undefined>();

  const colors = useCallback((index: number) => {
    switch (index) {
      case 0:
        return {
          secondary: "bg-neutral-200",
          bg: "",
          border: "border-neutral-200",
          text: "text-neutral-200",
        };
      case 1:
        return {
          bg: "bg-blue-400/10",
          secondary: "bg-blue-400",
          border: "border-blue-400",
          text: "text-blue-400",
        };
      case 2:
        return {
          bg: "bg-orange-400/10",
          secondary: "bg-orange-400",
          border: "border-orange-400",
          text: "text-orange-400",
        };
      case 3:
        return {
          bg: "bg-emerald-400/10",
          secondary: "bg-emerald-400",
          border: "border-emerald-400",
          text: "text-emerald-400",
        };
      default:
        return {
          bg: "",
          secondary: "bg-neutral-200",
          border: "border-neutral-200",
          text: "text-neutral-200",
        };
    }
  }, []);

  return (
    <>
      <div className=" w-full mx-auto fixed left-0 right-0 top-0 z-50 bg-black/20 backdrop-blur-sm h-[88px] flex items-center ">
        <div className="flex justify-between items-center px-10 max-w-7xl mx-auto w-full">
          <Link href={"/"} className="h-[30px] w-[220px]">
            <img
              src="/IMS/logo-white.png"
              alt="scrubbe.png"
              className="object-contain h-full "
            />
          </Link>
          <ul className="hidden xl:flex items-center gap-6 text-white ">
            {menuItems.map((item, index) => (
              <div
                onMouseEnter={() => setSelectTab(item.dropdownOptions?.[0])}
                key={item.label}
                className="relative group"
              >
                {item.dropdownOptions ? (
                  <>
                    <button
                      className={`${textColor} text-white font-medium transition-colors flex justify-center gap-1 items-center cursor-pointer whitespace-nowrap py-2 rounded-3xl`}
                    >
                      {item.label} <VscChevronDown />
                    </button>

                    <div className="absolute top-full left-1/2 transform -translate-x-[40%] mt-1 bg-[#090D14] shadow-lg rounded-lg min-w-[630px] z-50 py-4 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
                      {/* <div className="absolute top-full left-1/2 transform -translate-x-1/3 mt-1 bg-[#090D14] shadow-lg rounded-lg min-w-[630px] z-50 visible group-hover:opacity-100 transition-all duration-200"> */}
                      <div className="flex flex-row gap-2">
                        <div className="border-r border-neutral-700">
                          {item.dropdownOptions.map((option) => (
                            <div
                              key={option.label}
                              className={`${
                                option.label == selectTab?.label &&
                                "border-IMSCyan text-IMSCyan"
                              } p-3 flex gap-3  hover:border-IMSCyan transition-colors relative overflow-hidden group/item items-center `}
                              onMouseEnter={() => setSelectTab(option)}
                            >
                              {option.Icon && (
                                <option.Icon
                                  size={16}
                                  className="group-hover/item:text-IMSCyan"
                                />
                              )}
                              <h3
                                className={`font-medium text-nowrap flex-1 text-base group-hover/item:text-IMSCyan cursor-pointer transition-colors`}
                              >
                                {option.label}
                              </h3>
                              <ArrowRight
                                className="group-hover/item:text-IMSCyan invisible group-hover/item:visible"
                                size={15}
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="border-r border-neutral-700 w-[600px] h-[400px] grid grid-cols-[1fr,.3fr] gap-3 p-4">
                            <div className=" space-y-3">
                              <p className="text-sm capitalize text-neutral-500">
                                {selectTab?.id}
                              </p>
                              <p className="text-lg font-bold">
                                {selectTab?.description}
                              </p>
                              <p className="text-base text-neutral-400">
                                {selectTab?.subText}
                              </p>
                              <div className="flex flex-wrap gap-2 border-b border-neutral-500 pb-4">
                                {selectTab?.tags.map((tag) => (
                                  <span
                                    className="text-xs text-neutral-400 border border-neutral-500 rounded-md p-1"
                                    key={tag}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="flex w-full  ">
                                {selectTab?.analytics.map((item) => (
                                  <div
                                    className="space-y-2 flex-1"
                                    key={item.label}
                                  >
                                    <p
                                      className={`text-lg font-semibold ${
                                        item.color || "text-white"
                                      }`}
                                    >
                                      {item.value}
                                    </p>
                                    <p className="text-sm text-neutral-300 ">
                                      {item.label}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="bg-[#0D1219] p-2 border border-neutral-500 rounded-lg min-w-[200px] h-[300px]">
                                <p className="text-sm uppercase text-neutral-300">
                                  {selectTab?.subSection.title}
                                </p>

                                {selectTab?.subSection.code ? (
                                  <div className="bg-black p-2 rounded-sm mt-2">
                                    <CodeHighlighter
                                      code={selectTab.subSection.code.trim()}
                                      language="text-xs"
                                      isCopy={false}
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-2 mt-3">
                                    {selectTab?.subSection.tags.map(
                                      (tag, i) => (
                                        <div
                                          className={`${colors(i).text} ${
                                            colors(i).border
                                          } ${
                                            colors(i).bg
                                          } border flex items-center gap-2 p-2 rounded-lg`}
                                        >
                                          <div
                                            className={`${
                                              colors(i).secondary
                                            } size-2 rounded-full`}
                                          />
                                          <span className="text-xs">{tag}</span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-t border-neutral-600 p-4">
                            <p className="text-base">
                              {/* Governed automation from signal to resolution */}
                            </p>
                            <Link
                              className="border border-IMSCyan p-3 rounded-md text-sm text-IMSCyan font-medium items-center flex justify-between gap-2"
                              href={selectTab?.href || ""}
                            >
                              {selectTab?.hrefLabel}
                              <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                        <div className="pr-3">{selectTab?.rightComponent}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={"#"}
                    className={`${textColor} hover:text-blue-600 transition-colors flex justify-center items-center cursor-pointer whitespace-nowrap py-2`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </ul>

          <div className="flex flex-row gap-3">
            <Link href={"/partners"} prefetch>
              <CButton
                // onClick={() => router.push("/incident/tickets/create")}
                className="w-fit h-[40px] hidden xl:flex bg-transparent hover:bg-transparent text-IMSCyan border border-IMSCyan shadow-none text-base"
              >
                Join Early Design Partners
              </CButton>
            </Link>
            <Link href={"/auth/signin"} prefetch>
              <CButton
                // onClick={() => router.push("/incident/tickets/create")}
                className="w-fit h-[40px] hidden xl:flex bg-IMSCyan shadow-none text-base"
              >
                Get Started
              </CButton>
            </Link>
          </div>

          <div className="flex items-center gap-3 xl:hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-gray-100 rounded-lg cursor-pointer"
            >
              <GiHamburgerMenu size={20} />
            </button>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black z-[1000] xl:hidden ">
          {/* Modal Header */}
          <div className="flex justify-between items-center px-4 h-16 border-b border-gray-200 z-50">
            <Link
              href="/"
              onClick={() => setIsModalOpen(false)}
              className="relative w-[141px] h-[40px] sm:w-[176px] sm:h-[50px] lg:w-[211px] lg:h-[60px]"
            >
              <div className="h-[30px] w-[220px]">
                <Image
                  src="/IMS/logo-white.png"
                  alt="scrubbe.png"
                  fill
                  sizes="(min-width: 360px) 100vw"
                  className="object-contain"
                />
              </div>
            </Link>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 bg-IMSCyan text-black rounded-lg transition-colors cursor-pointer"
            >
              <IoMdClose size={24} className={"black"} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-4 py-6 space-y-4 overflow-y-auto max-h-fit">
            {menuItems.map((item, index) => (
              <div key={item.label} className="w-full">
                <div
                  onClick={() =>
                    setSelectMenu((prev) => (prev == index ? undefined : index))
                  }
                  className={` cursor-pointer py-2 text-lg font-medium text-white hover:text-IMSCyan transition-colors flex justify-between items-center`}
                >
                  {item.label}
                  <ChevronDown
                    className={`${
                      index === selectMenu ? " rotate-180" : "rotate-0"
                    } transition-all duration-250 ease-in-out`}
                  />
                </div>

                {selectMenu === index && (
                  <div className="flex flex-col gap-2 border-t border-IMSCyan/30 py-3">
                    {item.dropdownOptions?.map((options) => (
                      <Link
                        key={options.label}
                        href={options.href}
                        className={` py-2 text-lg font-medium text-white hover:text-IMSCyan transition-colors flex justify-between items-center`}
                      >
                        {options.label} <ArrowRight className="size-4" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-6 border-t border-gray-200 flex flex-col gap-3">
              <CButton
                // onClick={() => router.push("/incident/tickets/create")}
                className="w-full h-[40px] bg-transparent hover:bg-transparent text-IMSCyan border border-IMSCyan shadow-none text-base"
              >
                Join Early Design Partners
              </CButton>
              <Link href={"/auth/signin"} prefetch>
                <CButton className="!text-black h-[40px] bg-IMSCyan  hover:bg-IMSCyan shadow-none text-base">
                  Get Started
                </CButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
