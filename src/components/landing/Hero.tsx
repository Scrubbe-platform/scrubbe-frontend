"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Image from "next/image";

const scrubbeData = [
  {
    firstLine: "Built for Scale, Trained for",
    secondLine: "Speed",
    specialWord: "Speed",
    description:
      "Scrubbe uses Large Language Models to explain risks, power fraud-aware authentication, and automate response all built for modern digital teams securing users at scale",
  },
  {
    firstLine: "Fraud-Aware",
    secondLine: "Authentication SDK",
    specialWord: "Authentication",
    description:
      "Built-in intelligence for trust, not just access Fingerprint every session. Verify every intent Know your users before they even log in",
  },
  {
    firstLine: "Fraud API as a",
    secondLine: "Service",
    specialWord: "API",
    description:
      "Turn on real-time fraud defense in one API call. Plug in, detect patterns, and stop scams instantly",
  },
  {
    firstLine: "Incident Management &",
    secondLine: "SOAR Automation",
    specialWord: "Management",
    description:
      "From alert to action in seconds, not hours. Let playbooks handle what people shouldn't have to. Your response team's new favorite workflow",
  },
].map((item) => {
  const highlight = (text: string, keyword: string) => {
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="text-blue-600 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return {
    ...item,
    firstLineFormatted: highlight(item.firstLine, item.specialWord),
    secondLineFormatted: highlight(item.secondLine, item.specialWord),
  };
});

// Single corner animation
function CornerAnimation({ width, height }: { width: number; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const currentContainer = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    currentContainer.appendChild(renderer.domElement);

    const nodes: THREE.Mesh[] = [];
    const connections: { line: THREE.Line; node1: number; node2: number }[] =
      [];
    const nodeCount = 20;

    for (let i = 0; i < nodeCount; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x60a5fa),
        transparent: true,
        opacity: 0.7,
      });
      const node = new THREE.Mesh(geometry, material);
      node.position.x = (Math.random() - 0.5) * 30;
      node.position.y = (Math.random() - 0.5) * 15;
      node.position.z = (Math.random() - 0.5) * 10 - 15;

      node.userData = {
        velocityX: (Math.random() - 0.5) * 0.04,
        velocityY: (Math.random() - 0.5) * 0.04,
        velocityZ: (Math.random() - 0.5) * 0.02,
      };

      nodes.push(node);
      scene.add(node);
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.85) {
          const material = new THREE.LineBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.3,
          });
          const geometry = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position,
            nodes[j].position,
          ]);
          const line = new THREE.Line(geometry, material);
          connections.push({ line, node1: i, node2: j });
          scene.add(line);
        }
      }
    }

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      nodes.forEach((node) => {
        node.position.x += node.userData.velocityX;
        node.position.y += node.userData.velocityY;
        node.position.z += node.userData.velocityZ;

        if (Math.abs(node.position.x) > 15) node.userData.velocityX *= -1;
        if (Math.abs(node.position.y) > 8) node.userData.velocityY *= -1;
        if (Math.abs(node.position.z) > 10) node.userData.velocityZ *= -1;
      });

      connections.forEach((conn) => {
        const points = [nodes[conn.node1].position, nodes[conn.node2].position];
        conn.line.geometry.setFromPoints(points);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      return () => {
        if (currentContainer.contains(renderer.domElement)) {
          currentContainer.removeChild(renderer.domElement);
        }
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [width, height]);

  return <div ref={containerRef} className="w-full h-full" />;
}

// HERO section wrapper
export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // State to store window dimensions
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % scrubbeData.length);
        setIsTransitioning(false);
      }, 500); // Half of the transition time for smooth crossfade
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Effect to safely access window object after component mount
  useEffect(() => {
    // Set initial dimensions
    if (typeof window !== "undefined") {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Handle resize events
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Adjusted positions with slight upward shift for each corner
  const corners = [
    { pos: "top-0 left-0", shift: "translate-y-2" },
    { pos: "top-0 right-0", shift: "translate-y-2" },
    { pos: "bottom-0 left-0", shift: "-translate-y-2" },
    { pos: "bottom-0 right-0", shift: "-translate-y-2" },
  ];

  return (
    <div className="w-full bg-[#d6f2ff] overflow-x-hidden">
      <section className="relative w-full max-w-full md:max-w-[1440px] mx-auto h-auto max-h-[650px] overflow-hidden">
        {/* Background Corner Animations */}
        {corners.map(({ pos, shift }, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-1/2 h-1/2 pointer-events-none z-0 transform ${shift}`}
          >
            {windowDimensions.width > 0 && windowDimensions.height > 0 && (
              <CornerAnimation
                width={windowDimensions.width / 2}
                height={windowDimensions.height / 2}
              />
            )}
          </div>
        ))}

        {/* Content container with flex layout to push image to bottom */}
        <article className="flex flex-col w-full max-w-full px-2 sm:px-4 pt-12 relative z-10 overflow-hidden">
          {/* Text content */}
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-[30px] sm:text-[37.5px] md:text-[45px] lg:text-[60px] font-bold text-gray-800 mb-4">
              <div className="h-[135px] lg:h-[180px] relative">
                <div
                  className={`transition-opacity duration-500 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div>{scrubbeData[currentIndex].firstLineFormatted}</div>
                  <div>{scrubbeData[currentIndex].secondLineFormatted}</div>
                </div>
              </div>
            </h1>

            <p
              className={`text-gray-600 max-w-[2xl] h-[96px] w-[360px] sm:w-[601px] md:w-[672px] mx-auto mb-6 text-[16px] sm:text-[18px] md:text-[20px] transition-opacity duration-500 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {scrubbeData[currentIndex].description}
            </p>

            <div className="flex space-x-4 mb-8">
              {/* Primary Button */}
              <button className="text-sm sm:text-base bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md border hover:bg-bluescrubbe-700 transition-colors duration-200">
                Start Free Trial
              </button>

              {/* Secondary Button */}
              <button className="text-sm sm:text-base text-blue-600 px-3 py-2 sm:px-4 sm:py-2 rounded-md border border-blue-600 hover:bg-grayscrubbe-200 transition-colors duration-200">
                See Demo
              </button>
            </div>
          </div>

          {/* Image container that sticks to bottom */}
          <div className="mt-auto w-full max-w-[95%] sm:max-w-[90%] md:max-w-4xl mx-auto">
            <div className="shadow-2xl rounded-xl overflow-hidden">
              <Image
                src="/hero-image.png"
                alt="Scrubbe Dashboard Preview"
                width={507}
                height={342}
                quality={90}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
