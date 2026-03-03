"use client";
import { usePathname } from "next/navigation";
import NavbarDataS from "./NavbarDataS";
import NavbarEzra from "./NavbarEzra";
import NewNavbar from "./NewNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  return pathname.startsWith("/data-sources") ? (
    <NavbarDataS />
  ) : pathname.startsWith("/ezra") ? (
    <NavbarEzra />
  ) : (
    // <Navbar />
    <NewNavbar />
  );
}
