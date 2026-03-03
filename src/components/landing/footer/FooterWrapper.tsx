"use client";
import { usePathname } from "next/navigation";
import FooterEzra from "./FooterEzra";
import NewFooter from "./NewFooter";

export default function FooterWrapper() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth") || pathname.startsWith("/data-sources")) {
    return null;
  }

  if (pathname.startsWith("/ezra")) {
    return <FooterEzra />;
  }

  return <NewFooter />;
}
