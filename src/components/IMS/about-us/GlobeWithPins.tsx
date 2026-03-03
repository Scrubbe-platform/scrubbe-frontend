/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { createRoot } from "react-dom/client";
import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const GlobeWithPins = () => {
  const globeEl = useRef<any>(null);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 800
  );

  const markers = [
    { label: "London", lat: 51.5074, lng: -0.1278 },
    { label: "Nairobi", lat: -1.286389, lng: 36.817223 },
    { label: "Lagos", lat: 6.5244, lng: 3.3792 },
    { label: "Cape Town", lat: -33.9249, lng: 18.4241 },
    { label: "Washington DC", lat: 38.9072, lng: -77.0369 },
  ];

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2 });
    }

    const handleResize = () => setWidth(window.innerWidth);

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <div className="py-8">
      <div className="flex flex-col justify-center items-center gap-2">
        <p className="text-3xl md:text-5xl font-bigshotOne">
          Resilience Without Borders
        </p>
        <p className="max-w-xl text-center">
          Our round the clock global operations ensure we’re always online,
          serving you from our key centers of excellence around the world.
        </p>
      </div>

      <Globe
        ref={globeEl}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-day.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        /** ---- ReactNode Markers ---- **/
        htmlElementsData={markers}
        htmlLat={(d: any) => d.lat}
        htmlLng={(d: any) => d.lng}
        htmlAltitude={0.05}
        htmlElement={() => {
          const el = document.createElement("div");
          el.style.pointerEvents = "auto";

          const root = createRoot(el);

          root.render(
            <div className="flex size-6 items-center justify-center px-2 py-1 bg-emerald-500 animate-ping rounded-full shadow text-xs">
              <div></div>
            </div>
          );

          return el;
        }}
        /** ---- Optional: keep or remove the sphere markers ---- **/
        pointsData={markers}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointLabel={(d: any) => d.label}
        pointAltitude={0.04}
        pointColor={() => "orange"}
        pointRadius={0.2}
        height={500}
        width={width}
      />
    </div>
  );
};

export default GlobeWithPins;
