"use client";
import { useState } from "react";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";

export default function Demo() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Set loading state
      setIsLoading(true);

      // Log form values
      console.log(email);

      // Simulate a 5-second delay
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Redirect user to home page
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-w-[320px] max-w-[730px] mx-auto p-6">
      <div className="w-full min-w-[320px] max-w-[730px] mx-auto">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Sign in to view our demo page
        </h1>
        <p className="text-gray-600 mb-6">
          Enter your email address to get started
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="Enter email"
          />

          <CButton type="submit" disabled={isLoading || !email}>
            {isLoading ? " Signing in..." : "Sign in"}
          </CButton>
        </form>
      </div>
    </div>
  );
}
