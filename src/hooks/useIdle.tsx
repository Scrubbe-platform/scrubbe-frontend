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

const useIdle = (
  idleTime = 900000,
  onIdle: () => void,
  onReset?: () => void,
) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);
  const onResetRef = useRef(onReset);

  // Keep refs up-to-date to prevent effect re-triggering on callback shifts
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);
  useEffect(() => {
    onResetRef.current = onReset;
  }, [onReset]);

  useEffect(() => {
    // 1. Core Timer Instantiator
    const startTimer = () => {
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
        onIdleRef.current?.();
      }, idleTime);
    };

    // 2. Clear and Restart on Activity
    const handleActivity = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If they were previously idle and are now moving, trigger the reset callback
      setIsIdle(false);
      onResetRef.current?.();

      startTimer();
    };

    // Kick off the timer immediately on mount/load
    startTimer();

    // Bind interaction events safely
    events.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true }),
    );

    // Clean up timers and bindings on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [idleTime]);

  return isIdle;
};

export default useIdle;
