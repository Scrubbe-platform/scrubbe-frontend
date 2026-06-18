"use client";

import { useEffect, useState } from "react";

interface AnalogClockProps {
  city: string;
  timeZone: string;
}

interface TimeParts {
  hour: number;
  minute: number;
  second: number;
  dayPeriod: string;
}

function readTimeParts(timeZone: string): TimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const parts = formatter.formatToParts(new Date());
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
    dayPeriod: get("dayPeriod"),
  };
}

// Converts a clock-face angle (degrees, 12 o'clock = 0) into an x/y point on
// a circle of the given radius around the 50,50 center of the SVG viewbox.
function pointOnFace(angleDeg: number, radius: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: 50 + Math.sin(angleRad) * radius,
    y: 50 - Math.cos(angleRad) * radius,
  };
}

export default function AnalogClock({ city, timeZone }: AnalogClockProps) {
  // Starts null so the server-rendered markup and the first client render
  // match (avoids a hydration mismatch from reading "now" on the server).
  const [time, setTime] = useState<TimeParts | null>(null);

  useEffect(() => {
    const tick = () => setTime(readTimeParts(timeZone));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  const hour12 = time ? time.hour % 12 : 0;
  const hourAngle = time ? hour12 * 30 + time.minute * 0.5 : 0;
  const minuteAngle = time ? time.minute * 6 + time.second * 0.1 : 0;
  const secondAngle = time ? time.second * 6 : 0;

  const hourPoint = pointOnFace(hourAngle, 22);
  const minutePoint = pointOnFace(minuteAngle, 32);
  const secondPoint = pointOnFace(secondAngle, 36);

  const digitalReadout = time
    ? `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}:${String(
        time.second,
      ).padStart(2, "0")} ${time.dayPeriod}`
    : "--:--:-- --";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 100 100" className="h-20 w-20 sm:h-24 sm:w-24">
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="white"
          stroke="#111827"
          strokeWidth="3"
        />
        {Array.from({ length: 12 }).map((_, i) => {
          const outer = pointOnFace(i * 30, 44);
          const inner = pointOnFace(i * 30, i % 3 === 0 ? 37 : 40);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#111827"
              strokeWidth={i % 3 === 0 ? 2.2 : 1.4}
              strokeLinecap="round"
            />
          );
        })}
        <line
          x1={50}
          y1={50}
          x2={hourPoint.x}
          y2={hourPoint.y}
          stroke="#111827"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <line
          x1={50}
          y1={50}
          x2={minutePoint.x}
          y2={minutePoint.y}
          stroke="#1d4ed8"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={50}
          y1={50}
          x2={secondPoint.x}
          y2={secondPoint.y}
          stroke="#dc2626"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="2.5" fill="#111827" />
      </svg>
      <div className="text-center">
        <div className="text-sm font-medium text-neutral-900">{city}</div>
        <div className="font-mono text-xs text-neutral-400">
          {digitalReadout}
        </div>
      </div>
    </div>
  );
}
