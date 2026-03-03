import React, { useRef, useEffect, useState, useCallback, FC } from "react";

// --- 1. Type Definitions ---
interface MouseState {
  x: number;
  y: number;
  radius: number;
}

// Define the properties for the Particle class
interface ParticleProps {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  speedX: number;
  speedY: number;
  density: number;
  canvasWidth: number;
  canvasHeight: number;
}

// --- 2. Particle Class Definition ---
// Implements the ParticleProps interface to ensure type safety
class Particle implements ParticleProps {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  speedX: number;
  speedY: number;
  density: number;
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 3 + 1;
    this.baseSize = this.size;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.speedY = (Math.random() - 0.5) * 0.6;
    this.density = Math.random() * 30 + 10;
  }

  update(mouse: MouseState) {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;
    const maxDistance = mouse.radius;
    const force = (maxDistance - distance) / maxDistance;
    const directionX = forceDirectionX * force * this.density * 0.03;
    const directionY = forceDirectionY * force * this.density * 0.03;

    if (distance < mouse.radius) {
      this.x -= directionX;
      this.y -= directionY;
      this.size = this.baseSize + 2;
    } else {
      this.size = this.baseSize;
      this.x += this.speedX;
      this.y += this.speedY;
    }

    // Boundary collision detection
    if (this.x < 0 || this.x > this.canvasWidth) this.speedX *= -1;
    if (this.y < 0 || this.y > this.canvasHeight) this.speedY *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

// --- 3. ParticleCanvas Functional Component ---

// Use React.FC (Functional Component) for the component type
const ParticleCanvas: FC = () => {
  // Refs:
  // HTMLCanvasElement for the canvas, number for the animation frame ID, MouseState for mouse data, Particle[] for particles.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const mouseRef = useRef<MouseState>({ x: 0, y: 0, radius: 180 });
  const particlesRef = useRef<Particle[]>([]);

  // State: dimensions for canvas size
  const [dimensions, setDimensions] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >();

  // --- Utility Functions ---

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min((width * height) / 6000, 180);
    const newParticles: Particle[] = []; // Explicitly type the array
    for (let i = 0; i < count; i++) {
      newParticles.push(new Particle(width, height));
    }
    particlesRef.current = newParticles;
  }, []);

  const connectParticles = (ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.3 * (1 - distance / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  };

  // --- Animation Loop ---

  const animate = useCallback(() => {
    const canvas = canvasRef.current;

    // Ensure canvas and context exist (using type guard)
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((p) => {
      p.update(mouseRef.current);
      p.draw(ctx);
    });

    connectParticles(ctx);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // --- useEffect for Setup and Teardown (Lifecycle) ---

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // A type guard is needed because getContext might return null
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Set Canvas Dimensions and Initialize Particles
    canvas.width = dimensions?.width ?? 0;
    canvas.height = dimensions?.height ?? 0;
    initParticles(dimensions?.width || 0, dimensions?.height || 0);

    // 2. Start Animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // 3. Setup Event Listeners

    // Use the correct MouseEvent type for the handler
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };
      window.addEventListener("resize", handleResize);

      // 4. Cleanup Function
      return () => {
        cancelAnimationFrame(animationFrameRef.current);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [animate, dimensions?.width, dimensions?.height, initParticles]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);
  // 5. Render the Canvas element
  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        backgroundColor: "#000",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
};

export default ParticleCanvas;
