"use client";

import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

// Define the expected shape of the API response

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { post } = useFetch();

  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("No invite token provided.");
      }
      const res = await post(endpoint.auth.decode_invite_token, { token });
      return res.data;
    },
    onSuccess: (data) => {
      // Logic to handle navigation based on the API response
      const { existingUser, inviteData } = data;
      const { email } = inviteData;

      const registrationPath = `/auth/developer-signup?email=${email}&invite=${true}`;
      const loginPath = `/auth/signin?email=${email}`;

      if (existingUser) {
        router.push(loginPath);
      } else {
        router.push(registrationPath);
      }
    },
    onError: (err) => {
      // You can implement more specific error handling here,
      // e.g., redirecting to an error page or showing a toast message.
      console.error("Failed to decode token:", err);
    },
  });

  useEffect(() => {
    if (token) {
      mutateAsync();
    }
  }, [token, mutateAsync]);

  // Fallback UI for when token is null or invalid
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Invalid or Missing Invitation Link
          </h1>
          <p className="mt-2 text-gray-600">
            The link you are using is invalid or has expired. Please contact
            support.
          </p>
        </div>
      </div>
    );
  }

  // Loading state UI
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  // Error state UI
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600">
            Something went wrong
          </h1>
          <p className="mt-2 text-gray-600">
            {error.message ||
              "Failed to process your invitation. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  // Default return, though navigation should prevent this from rendering
  return null;
};

export default Page;
