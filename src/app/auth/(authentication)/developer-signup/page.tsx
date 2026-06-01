import type { Metadata } from "next";
import DeveloperSignupForm from "@/components/auth/DeveloperSignupForm";

export const metadata: Metadata = {
  title: "Developer Signup - Scrubbe",
  description:
    "Join a Scrubbe workspace and collaborate on incident response, integrations, and security operations.",
};

export default function DeveloperSignupPage() {
  return <DeveloperSignupForm />;
}
