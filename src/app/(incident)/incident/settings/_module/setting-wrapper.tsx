import React, { ReactNode } from "react";

const SettingWrapper = ({
  title,
  description,
  sub,
  children,
}: {
  title: string;
  description: string;
  sub: string;
  children: ReactNode;
}) => {
  return (
    <div className="border dark:border-[#1F2937] border-zinc-500 rounded-xl  p-4 dark:bg-zinc-900 text-black dark:text-white space-y-1">
      <p className="text-lg font-bold">{title}</p>
      <p className="text-sm">{description}</p>
      <p className="text-sm">{sub}</p>
      {children}
    </div>
  );
};

export default SettingWrapper;
