/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ReactNode, Suspense } from "react";
import Spline from "@splinetool/react-spline/next";
import ParticleCanvas from "@/components/auth/Particle";
import Link from "next/link";
import IdleLoader from "@/components/ui/LoaderUI/IdleLoader";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen overflow-hidden bg-white">
      <Suspense fallback={<IdleLoader />}>
        <div className="grid md:grid-cols-2 h-full">
          {/* Left — fills full height, Spline scene contained inside */}
          <div className="hidden md:flex justify-center items-center w-full h-full overflow-hidden relative bg-[#050B18]">
            <Spline
              className="absolute w-full h-full"
              scene="https://prod.spline.design/US9RKuH9CFEk4TPE/scene.splinecode"
            />

            {/* Brand overlay */}
            <div className="absolute inset-0 z-10 flex flex-col  px-10 py-10 pointer-events-none">
              <img
                src="/IMS/whitelogo.png"
                alt="Scrubbe"
                className="h-[30px] w-[220px] object-contain object-left"
              />

              <div className="max-w-2xl mt-10">
                <h1 className="font-besley font-extrabold text-4xl leading-tight text-white text-balance">
                  Autonomous incident investigation and{" "}
                  <span className="text-[#A1FDCB]">remediation</span>
                </h1>
                <p className="mt-4 text-base max-w-xl text-white leading-relaxed">
                  Create your workspace to get started. Configure your systems,
                  invite your team, and let AI agents handle the rest.
                </p>
              </div>
            </div>
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
