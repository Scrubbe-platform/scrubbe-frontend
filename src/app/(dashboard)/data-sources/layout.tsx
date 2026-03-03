import SideBar from "@/components/data-sources/SideBar";
import NavbarDataS from "@/components/landing/header/NavbarDataS";
import React from "react";

const DataSourcesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <NavbarDataS />
      <div className="w-full h-[calc(100vh-63px)] bg-white">
        <section className="w-full  mx-auto h-full flex flex-row bg-white overflow-hidden">
          <article className="">
            <SideBar />
          </article>
          <article className="w-full">{children}</article>
        </section>
      </div>
    </div>
  );
};

export default DataSourcesLayout;
