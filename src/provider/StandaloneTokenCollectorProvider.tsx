"use client";
import React, { ReactNode, useEffect } from "react";
import { setCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/lib/constant";

const StandaloneTokenCollectorProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      try {
        setCookie(COOKIE_KEYS.TOKEN, token);
        // Clear the token from the URL for security
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        console.error("Token validation failed:", error);
        // Handle failed authentication, maybe redirect to login page
      }
    } else {
      // No token found, user is not authenticated
    }
  }, []);
  return <div>{children}</div>;
};

export default StandaloneTokenCollectorProvider;
