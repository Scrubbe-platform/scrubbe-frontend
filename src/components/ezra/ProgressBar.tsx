"use client";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  color: string;
}

const ProgressBar = ({ value, color }: ProgressBarProps) => (
  <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1, delay: 0.5, ease: "circIn", type: "tween" }}
      className={`h-1.5 rounded ${color}`}
    />
  </div>
);

export default ProgressBar;
