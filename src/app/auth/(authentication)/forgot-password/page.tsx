import type { Metadata } from "next";
import ForgotPassword from "@/components/auth/ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password - Scrubbe",
  description:
    "Scrubbe's AI-driven platform combines SIEM and SOAR for automated threat detection, response, and unified security analytics.",
};

const ForgotPasswordPage = () => {
  return <ForgotPassword />;
};

export default ForgotPasswordPage;
