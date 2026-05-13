"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TriangleAlert, Activity, ArrowLeft, Home } from "lucide-react";
import CButton from "@/components/ui/Cbutton";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6 font-sans selection:bg-IMSCyan selection:text-black">
      {/* Background Signal Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(91,143,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(91,143,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-radial-gradient from-IMSCyan/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Animated Error Code */}
        <div className="relative inline-block">
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[120px] font-black text-white leading-none tracking-tighter"
          >
            404
          </motion.h1>
          <motion.div
            animate={{
              x: [-2, 2, -1, 1, 0],
              opacity: [0.5, 0.8, 0.4, 0.9, 0.7],
            }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="absolute inset-0 text-[120px] font-black text-IMSCyan opacity-20 blur-sm select-none"
          >
            404
          </motion.div>
        </div>

        {/* Status Header */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
          <p className="text-gray-400 text-[13px] max-w-md mx-auto leading-relaxed">
            The resource you are looking for has been decommissioned or moved to
            a different node. No corresponding AuditEvent was found for this
            request URI.
          </p>
        </div>

        {/* Technical Metadata Box */}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <CButton
            onClick={() => router.back()}
            className="w-full sm:w-auto border border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <ArrowLeft className="size-4 mr-2" /> Back
          </CButton>
        </div>
      </div>
    </div>
  );
}
