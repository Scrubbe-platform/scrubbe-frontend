"use client";
import ThemeProvider from "@/components/ThemeProvider";

export default function ThemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
