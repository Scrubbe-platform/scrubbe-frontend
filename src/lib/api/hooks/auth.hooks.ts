"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthService, BusinessService, IMSService } from "../services/auth.service";
import type {
  LoginRequest,
  DeveloperSignupRequest,
  BusinessSignupRequest,
  OAuthSignupRequest,
  OAuthLoginRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
  AuthResponse,
} from "../services/auth.service";
import { ApiError, AuthenticationError, ValidationError } from "../apiClient";

// Generic hook for API calls with loading and error states
function useApiCall<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        
        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
        
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError("An unexpected error occurred");
        setError(apiError);
        
        if (options?.errorMessage) {
          toast.error(options.errorMessage, {
            description: apiError.message,
          });
        } else {
          toast.error(apiError.message);
        }
        
        options?.onError?.(apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, options]
  );

  const clearError = useCallback(() => setError(null), []);

  return { execute, isLoading, error, clearError };
}

// Hook for login
export function useLogin() {
  const router = useRouter();
  
  return useApiCall(AuthService.login, {
    successMessage: "Successfully logged in!",
    errorMessage: "Login failed",
    onSuccess: (data) => {
      // Redirect based on account type
      if (data.user.accountType === "BUSINESS") {
        router.push("/dashboard");
      } else {
        router.push("/developer/dashboard");
      }
    },
  });
}

// Hook for OAuth login
export function useOAuthLogin() {
  const router = useRouter();
  
  return useApiCall(AuthService.oauthLogin, {
    successMessage: "Successfully logged in!",
    errorMessage: "OAuth login failed",
    onSuccess: (data) => {
      if (data.user.accountType === "BUSINESS") {
        router.push("/dashboard");
      } else {
        router.push("/developer/dashboard");
      }
    },
  });
}

// Hook for developer signup
export function useDeveloperSignup() {
  const router = useRouter();
  
  return useApiCall(AuthService.registerDeveloper, {
    successMessage: "Account created successfully! Please verify your email.",
    errorMessage: "Registration failed",
    onSuccess: () => {
      router.push("/auth/verify-email");
    },
  });
}

// Hook for business signup
export function useBusinessSignup() {
  const router = useRouter();
  
  return useApiCall(AuthService.registerBusiness, {
    successMessage: "Account created successfully! Please verify your email.",
    errorMessage: "Registration failed",
    onSuccess: () => {
      router.push("/auth/verify-email");
    },
  });
}

// Hook for OAuth developer signup
export function useOAuthDeveloperSignup() {
  const router = useRouter();
  
  return useApiCall(AuthService.registerDeveloperOAuth, {
    successMessage: "Account created successfully!",
    errorMessage: "OAuth registration failed",
    onSuccess: () => {
      router.push("/auth/developer-setup");
    },
  });
}

// Hook for OAuth business signup
export function useOAuthBusinessSignup() {
  const router = useRouter();
  
  return useApiCall(AuthService.registerBusinessOAuth, {
    successMessage: "Account created successfully!",
    errorMessage: "OAuth registration failed",
    onSuccess: () => {
      router.push("/auth/account-setup");
    },
  });
}

// Hook for email verification
export function useVerifyEmail() {
  const router = useRouter();
  
  return useApiCall(AuthService.verifyEmail, {
    successMessage: "Email verified successfully!",
    errorMessage: "Verification failed",
    onSuccess: () => {
      router.push("/auth/signin");
    },
  });
}

// Hook for resending OTP
export function useResendOTP() {
  return useApiCall(AuthService.resendOTP, {
    successMessage: "Verification code resent!",
    errorMessage: "Failed to resend code",
  });
}

// Hook for forgot password
export function useForgotPassword() {
  return useApiCall(AuthService.forgotPassword, {
    successMessage: "Password reset link sent to your email!",
    errorMessage: "Failed to send reset link",
  });
}

// Hook for reset password
export function useResetPassword() {
  const router = useRouter();
  
  return useApiCall(AuthService.resetPassword, {
    successMessage: "Password reset successfully! Please login.",
    errorMessage: "Password reset failed",
    onSuccess: () => {
      router.push("/auth/signin");
    },
  });
}

// Hook for change password
export function useChangePassword() {
  return useApiCall(AuthService.changePassword, {
    successMessage: "Password changed successfully!",
    errorMessage: "Failed to change password",
  });
}

// Hook for logout
export function useLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(async (refreshToken?: string) => {
    setIsLoading(true);
    try {
      await AuthService.logout(refreshToken);
      toast.success("Logged out successfully!");
      router.push("/auth/signin");
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { logout, isLoading };
}

// Hook for getting current user
export function useCurrentUser() {
  return useApiCall(AuthService.getCurrentUser);
}

// Hook for business setup
export function useBusinessSetup() {
  const router = useRouter();
  
  return useApiCall(BusinessService.setupBusiness, {
    successMessage: "Business setup completed!",
    errorMessage: "Business setup failed",
    onSuccess: () => {
      router.push("/dashboard");
    },
  });
}

// Hook for IMS setup
export function useIMSSetup() {
  return useApiCall(IMSService.setupIMS, {
    successMessage: "IMS setup completed!",
    errorMessage: "IMS setup failed",
  });
}

// Hook for sending invites
export function useSendInvite() {
  return useApiCall(BusinessService.sendInvite, {
    successMessage: "Invite sent successfully!",
    errorMessage: "Failed to send invite",
  });
}

// Hook for accepting invites
export function useAcceptInvite() {
  const router = useRouter();
  
  return useApiCall(BusinessService.acceptInvite, {
    successMessage: "Invite accepted successfully!",
    errorMessage: "Failed to accept invite",
    onSuccess: () => {
      router.push("/auth/signin");
    },
  });
}

// Hook for decoding invite token
export function useDecodeInvite() {
  return useApiCall(BusinessService.decodeInviteToken);
}

// Hook for getting team members
export function useGetMembers() {
  return useApiCall(BusinessService.getMembers);
}

// Hook for validating reset token
export function useValidateResetToken() {
  return useApiCall(AuthService.validateResetToken);
}

// Export all hooks
export const AuthHooks = {
  useLogin,
  useOAuthLogin,
  useDeveloperSignup,
  useBusinessSignup,
  useOAuthDeveloperSignup,
  useOAuthBusinessSignup,
  useVerifyEmail,
  useResendOTP,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
  useLogout,
  useCurrentUser,
  useBusinessSetup,
  useIMSSetup,
  useSendInvite,
  useAcceptInvite,
  useDecodeInvite,
  useGetMembers,
  useValidateResetToken,
};

export default AuthHooks;
