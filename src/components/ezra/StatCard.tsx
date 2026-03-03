"use client";
import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";

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
  <div className="dark:bg-[#111827] bg-white rounded-xl dark:shadow-md p-4 w-full h-[158px] flex flex-col justify-between gap-1 border-t-4 border-blue-400/60 relative">
    <div className=" font-semibold text-colorScBlue text-base">{title}</div>
    <div className={`text-4xl font-bold text-colorScBlue`}>
      {value}
      {postfix}
    </div>
    {subtitle && <div className={`text-sm ${subtitleColor}`}>{subtitle}</div>}
    {progress !== undefined && (
      <ProgressBar color={progressColor} value={progress} />
    )}
    {extra}
    {children}
  </div>
);

export default StatCard;
