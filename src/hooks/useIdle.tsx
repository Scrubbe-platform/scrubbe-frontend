/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";

const events = [
  "load",
  "mousemove",
  "mousedown",
  "click",
  "scroll",
  "keypress",
];

const useIdle = (idleTime = 300000, onIdle: () => void) => {
  // idleTime is 5 minutes (300,000 milliseconds)
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<any | null>(null);

  const resetTimer = () => {
    clearTimeout(timeoutRef.current);
    setIsIdle(false);
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      if (onIdle && typeof onIdle === "function") {
        onIdle();
      }
    }, idleTime);
  };

  useEffect(() => {
    resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return isIdle;
};

export default useIdle;
