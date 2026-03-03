"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useMotionValue, animate } from "framer-motion";

interface StatCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  progress?: number;
  progressColor?: string;
  extra?: ReactNode;
  valueColor?: string;
  subtitleColor?: string;
  children?: ReactNode;
  postfix?: string;
}

const StatCard = ({
  title,
  value,
  subtitle,
  progress,
  progressColor = "bg-blue-500",
  extra,
  subtitleColor = "text-green-400",
  children,
  postfix,
}: StatCardProps) => (
  <div className="bg-[#111827] rounded-xl shadow-md p-3 w-full h-[118px] flex flex-col gap-1 border-t-4 border-blue-400/60 relative">
    <div className="text-[80%] font-semibold text-colorScBlue">{title}</div>
    <div className={`text-[140%] font-bold text-colorScBlue`}>
      {value}
      {postfix}
    </div>
    {subtitle && (
      <div className={`text-[70%] ${subtitleColor}`}>{subtitle}</div>
    )}
    {progress !== undefined && (
      <div className="w-full h-1 bg-gray-700 rounded">
        <div
          className={`h-1 rounded ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
    {extra}
    {children}
  </div>
);

interface AlertCardProps {
  color: string;
  title: string;
  subtitle: string;
}

const AlertCard = ({ color, title, subtitle }: AlertCardProps) => (
  <div className={`rounded-lg p-1 px-2 mb-2 bg-[#232b3b] border-l-4 ${color}`}>
    <div className="font-medium text-white text-[80%]">{title}</div>
    <div className="text-[60%] text-gray-400">{subtitle}</div>
  </div>
);

interface ProgressBarProps {
  value: number;
  color: string;
}

const ProgressBar = ({ value, color }: ProgressBarProps) => (
  <div className="w-full h-1 bg-gray-700 rounded">
    <div className={`h-1 rounded ${color}`} style={{ width: `${value}%` }} />
  </div>
);

const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  initial?: number;
}> = ({ value, duration = 1, initial = 0 }) => {
  const [display, setDisplay] = useState(initial);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return controls.stop;
  }, [value, duration, motionValue]);

  return <span>{display}</span>;
};

export const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col gap-3">
      {/* Top grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          title="Security Score"
          value={<AnimatedNumber initial={20} value={120} duration={50} />}
          subtitle={
            <>
              <span className="inline-flex items-center gap-1 text-green-400">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                +5 from yesterday
              </span>
            </>
          }
          progress={53}
          progressColor="bg-blue-400"
        />
        <StatCard
          title="Active Threats"
          value={<AnimatedNumber value={10} duration={50} />}
          subtitle={
            <>
              <div className="text-red-400 flex items-center gap-1">
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
                -8 resolved today
              </div>
              <div className="text-yellow-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" />
                12 high priority
              </div>
            </>
          }
        />
        <StatCard
          title="Response Time"
          value={<AnimatedNumber initial={3} value={30} duration={50} />}
          postfix="m"
          subtitle={<span className="text-green-400">45% faster than SLA</span>}
        />
      </div>
      {/* AI Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="AI Confidence"
          value={<AnimatedNumber initial={3} value={20} duration={50} />}
          postfix="%"
          subtitle={
            <span className="text-green-400">
              Learning from Analyst feedback
            </span>
          }
        />
      </div>
      {/* Lower section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real time alerts */}
        <div className="bg-[#151e2e] rounded-xl shadow-md p-6 border-t-4 border-blue-400/60 min-h-[220px] flex flex-col">
          <div className="text-[80%] font-semibold text-colorScBlue mb-3">
            Real time alerts
          </div>
          <AlertCard
            color="border-red-400"
            title="Data Exhilaration attempt"
            subtitle="Just now . DLP system"
          />
          <AlertCard
            color="border-green-400"
            title="Data Exhilaration attempt"
            subtitle="Just now . DLP system"
          />
          <AlertCard
            color="border-yellow-400"
            title="Data Exhilaration attempt"
            subtitle="Just now . DLP system"
          />
        </div>
        {/* Identity Risk Scores */}
        <div className="bg-[#151e2e] rounded-xl shadow-md p-6 border-t-4 border-blue-400/60 min-h-[220px] flex flex-col">
          <div className="text-[80%] font-semibold text-colorScBlue mb-3">
            Identity Risk Scores
          </div>
          <div className="mb-4 bg-[#232b3b] p-2 rounded-lg">
            <div className="flex justify-between text-white  text-sm mb-1">
              <span className=" text-[90%]">High Risk Users</span>
              <span className="text-blue-400  text-[90%]">38%</span>
            </div>
            <ProgressBar value={38} color="bg-blue-500" />
          </div>
          <div className="mb-4 bg-[#232b3b] p-2 rounded-lg">
            <div className="flex justify-between text-white text-sm mb-1">
              <span className=" text-[90%]">Abnormal Logins</span>
              <span className="text-green-400  text-[90%]">25%</span>
            </div>
            <ProgressBar value={25} color="bg-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
