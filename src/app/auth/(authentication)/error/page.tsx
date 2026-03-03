"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification link has expired or has already been used.";
      case "OAuthSignin":
        return "Error in constructing the OAuth authorization URL.";
      case "OAuthCallback":
        return "Error in handling the OAuth callback.";
      case "OAuthCreateAccount":
        return "Could not create OAuth provider user in the database.";
      case "EmailCreateAccount":
        return "Could not create email provider user in the database.";
      case "Callback":
        return "Error in the OAuth callback handler route.";
      case "OAuthAccountNotLinked":
        return "The email on the account is already linked, but not with this OAuth account.";
      case "EmailSignin":
        return "Sending the e-mail with the verification token failed.";
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again.";
      case "SessionRequired":
        return "You must be signed in to access this page.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="w-full mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="mb-6">
        <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Authentication Error
      </h1>

      <p className="text-gray-600 text-center mb-8 max-w-md">
        {getErrorMessage(error)}
      </p>

      {error && (
        <div className="bg-gray-100 rounded-md p-4 mb-8 max-w-md w-full">
          <p className="text-sm text-gray-500 text-center">
            Error code: <code className="bg-gray-200 px-2 py-1 rounded">{error}</code>
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/auth/signin"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
        >
          Try Again
        </Link>

        <Link
          href="/"
          className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="w-full mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
