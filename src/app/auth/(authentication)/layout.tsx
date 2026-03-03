/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ReactNode, Suspense } from "react";
import ParticleCanvas from "@/components/auth/Particle";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-auto relative">
      <Suspense fallback={<div>Loading...</div>}>
        <ParticleCanvas />
        {/* <OverlayWrapper
          sidebarContent={IS_STANDALONE ? <ImsSidebar /> : <AnalyticsSidebar />}
        >
          {IS_STANDALONE ? null : <AuthTabs />} */}
        <div className=" w-full min-h-screen flex justify-center items-center">
          <div className="mx-auto max-w-sm bg-neutral-900 rounded-lg z-50 w-full">
            <div className="flex justify-center pt-3">
              <Link href={"/"} className="">
                <img
                  src="/IMS/logo-white.png"
                  alt="scrubbe.png"
                  className="object-contain h-[30px] w-[100px]"
                />
              </Link>
            </div>
            {children}
          </div>
        </div>
        {/* </OverlayWrapper> */}
      </Suspense>
    </div>
  );
}
