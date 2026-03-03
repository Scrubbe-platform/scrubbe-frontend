"use client";
import { useEffect } from "react";
import { useRedirect } from "./RedirectProvider";
import { setupInterceptors } from "@/lib/axios";

const InterceptorWrapper = () => {
  const { triggerRedirect } = useRedirect();

  useEffect(() => {
    // Pass the function from the Hook to the setup function
    setupInterceptors(triggerRedirect);
  }, [triggerRedirect]);

  return null; // This component doesn't render anything
};

export default InterceptorWrapper;
