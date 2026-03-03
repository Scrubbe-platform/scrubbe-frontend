import type { Metadata } from "next";
import DeveloperSignupForm from "@/components/auth/DeveloperSignupForm";

export const metadata: Metadata = {
  title: "Developer Signup - Scrubbe",
  description:
    "Scrubbe's AI-driven platform combines SIEM and SOAR for automated threat detection, response, and unified security analytics.",
};

export default function DeveloperSignupPage() {
  return <DeveloperSignupForm />;
}
