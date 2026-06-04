/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ReactNode, Suspense } from "react";
import ParticleCanvas from "@/components/auth/Particle";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen overflow-hidden bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid md:grid-cols-2 h-full">
          {/* Left — fills full height, image contained inside */}
          <div className="hidden md:flex justify-center items-center w-full h-full overflow-hidden relative">
            <img
              className=" object-cover absolute w-full h-full"
              src="/IMS/auth/Frame1.jpg"
            />
            <img
              className="object-contain w-full h-[90%] z-10"
              src="/IMS/auth/Frame2.png"
            />
          </div>

          {/* Right — scrollable children only */}
          <div className="w-full h-full overflow-y-auto flex justify-center items-start px-6 md:px-20 py-10">
            {children}
          </div>
        </div>
      </Suspense>
    </div>
  );
}
