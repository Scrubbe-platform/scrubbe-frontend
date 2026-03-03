// API Integration Layer - Main Export File
// This file exports all API-related modules for easy imports

// Core API Client
export { 
  apiClient, 
  apiRequest,
  retryRequest,
  // Error classes
  ApiError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from "./apiClient";

// Services
export { 
  AuthService,
  BusinessService,
  IMSService,
  // Types
  type AuthTokens,
  type User,
  type AuthResponse,
  type LoginRequest,
  type DeveloperSignupRequest,
  type BusinessSignupRequest,
  type OAuthSignupRequest,
  type OAuthLoginRequest,
  type VerifyEmailRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type ChangePasswordRequest,
} from "./services/auth.service";

// Hooks
export {
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
  AuthHooks,
} from "./hooks/auth.hooks";

// Legacy exports for backward compatibility
export { apiClient as default } from "./apiClient";
