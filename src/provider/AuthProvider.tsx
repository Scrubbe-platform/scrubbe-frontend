"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale, // <-- This registers the required scale for the Y-Axis
  BarElement,
  Tooltip,
  ArcElement,
  PointElement,
  LineElement,
  Legend
);
export default function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
