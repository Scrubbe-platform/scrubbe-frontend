import type { Metadata } from "next";
import Demo from "@/components/auth/Demo";

export const metadata: Metadata = {
  title: "Demo Page - Scrubbe",
  description:
    "Scrubbe's AI-driven platform combines SIEM and SOAR for automated threat detection, response, and unified security analytics.",
};

export default function DemoPage() {
  return <Demo />;
}
