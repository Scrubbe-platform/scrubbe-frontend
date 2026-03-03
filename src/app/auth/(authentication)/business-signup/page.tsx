import type { Metadata } from "next";
import BusinessSignupForm from "@/components/auth/BusinessSignupForm";

export const metadata: Metadata = {
  title: "Business Signup - Scrubbe",
  description:
    "Scrubbe's AI-driven platform combines SIEM and SOAR for automated threat detection, response, and unified security analytics.",
};

export default function BusinessSignupPage() {
  return <BusinessSignupForm />;
}
