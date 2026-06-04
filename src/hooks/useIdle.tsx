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
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef   = useRef(onIdle);
  const onResetRef  = useRef(onReset);
  const hasInteractedRef = useRef(false); // ← track if user ever interacted

  useEffect(() => { onIdleRef.current  = onIdle;  }, [onIdle]);
  useEffect(() => { onResetRef.current = onReset; }, [onReset]);

  useEffect(() => {
    const resetTimer = () => {
      hasInteractedRef.current = true; // mark that real interaction happened
      clearTimeout(timeoutRef.current!);
      setIsIdle(false);
      onResetRef.current?.();
      timeoutRef.current = setTimeout(() => {
        // only go idle if the user actually interacted at some point
        if (hasInteractedRef.current) {
          setIsIdle(true);
          onIdleRef.current?.();
        }
      }, idleTime);
    };

    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timeoutRef.current!);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [idleTime]);

  return isIdle;
};

export default useIdle;
