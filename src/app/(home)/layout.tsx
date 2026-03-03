import NewNavbar from "@/components/landing/header/NewNavbar";
import NewFooter from "@/components/landing/footer/NewFooter";
import React from "react";
import CookieToggleButton from "@/components/landing/CookieToggleButton";
import Chatbot from "@/components/landing/Chatbot";
import CookieConsentModal from "@/components/landing/CookieConsentModal";
import Navbar from "@/components/IMS/Home/Navbar";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";
const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {IS_STANDALONE ? <Navbar /> : <NewNavbar />}
      {children}
      <CookieConsentModal />
      <CookieToggleButton />
      <Chatbot />
      <NewFooter />
    </>
  );
};

export default HomeLayout;
