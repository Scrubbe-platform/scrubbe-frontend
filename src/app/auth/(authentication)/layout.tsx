/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ReactNode, Suspense } from "react";
import ParticleCanvas from "@/components/auth/Particle";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full relative">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="grid md:grid-cols-2">
          <div className="hidden md:flex justify-center items-center">
            <img className="" src="/IMS/auth/Frame.png" />
          </div>
          <div className=" w-full flex justify-center items-center px-6 md:px-20 md:py-0 py-5">
            {children}
          </div>
        </div>
      </Suspense>
    </div>
  );
}
