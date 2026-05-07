/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";

const events = [
  "mousemove",
  "mousedown",
  "click",
  "scroll",
  "keydown",
  "touchstart",
];

const useIdle = (idleTime = 900000, onIdle: () => void, onReset?: () => void) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<any | null>(null);
  const onIdleRef = useRef(onIdle);
  const onResetRef = useRef(onReset);

  useEffect(() => { onIdleRef.current = onIdle; }, [onIdle]);
  useEffect(() => { onResetRef.current = onReset; }, [onReset]);

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timeoutRef.current);
      setIsIdle(false);
      onResetRef.current?.();
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
        onIdleRef.current?.();
      }, idleTime);
    };

    resetTimer();
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timeoutRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [idleTime]);

  return isIdle;
};

export default useIdle;
