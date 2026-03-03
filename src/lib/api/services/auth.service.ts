 import { setCookie, deleteCookie } from "cookies-next";
 import type { UserRole } from "@/auth";
import { COOKIE_KEYS } from "@/lib/constant";
import { apiRequest, ApiError, AuthenticationError } from "../apiClient";

// Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  accountType: "DEVELOPER" | "BUSINESS" | null;
  businessId: string | null;
  roles: UserRole[];
  apiKey?: string;
  apiKeyDuration?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  lastLogin?: string | null;
  oauthprovider?: string;
  oauthProvider_uuid?: string;
  registerdWithOauth?: boolean;
  profileImage?: string | null;
  username?: string;
  purpose?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DeveloperSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  githubUsername?: string;
  experienceLevel: string;
}

export interface BusinessSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessAddress: string;
  companySize: string;
  purpose?: string;
  businessName?: string;
}

export interface OAuthSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  oAuthProvider: string;
  isVerified: boolean;
  image?: string | null;
  experienceLevel?: string;
  githubUsername?: string;
  businessAddress?: string;
  companySize?: string;
}

export interface OAuthLoginRequest {
  email: string;
  provider_uuid: string;
  oAuthProvider: string;
}

export interface VerifyEmailRequest {
  userId: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Auth Service
export const AuthService = {
  // Login with email/password
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>("post", "/auth/login", data);
      this.setAuthCookies(response.tokens);
      return response;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new AuthenticationError("Login failed. Please check your credentials.");
    }
  },

  // OAuth Login
  async oauthLogin(data: OAuthLoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>("post", "/auth/oauth/login", data);
      this.setAuthCookies(response.tokens);
      return response;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new AuthenticationError("OAuth login failed.");
    }
  },

  // Developer Registration
  async registerDeveloper(data: DeveloperSignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>("post", "/auth/dev/register", data);
      this.setAuthCookies(response.tokens);
      return response;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error("Developer registration failed.");
    }
  },

  // Business Registration
  async registerBusiness(data: BusinessSignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>("post", "/auth/business/register", data);
      this.setAuthCookies(response.tokens);
      return response;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error("Business registration failed.");
    }
  },

  // OAuth Developer Registration
  async registerDeveloperOAuth(data: OAuthSignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>("post", "/auth/oauth/dev/register", data);
      this.setAuthCookies(response.tokens);
      return response;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error("OAuth developer registration failed.");
    }
  },

  // OAuth Business Registration
  async registerBusinessOAuth(data: OAuthSignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>("post", "/auth/oauth/business/register", data);
      this.setAuthCookies(response.tokens);
      return response;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new Error("OAuth business registration failed.");
    }
  },

  // Verify Email
  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await apiRequest<void>("post", "/auth/verify_email", data);
  },

  // Resend OTP
  async resendOTP(userId: string): Promise<void> {
    await apiRequest<void>("post", "/auth/resend_otp", { userId });
  },

  // Forgot Password
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiRequest<void>("post", "/auth/forgot-password", data);
  },

  // Reset Password
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiRequest<void>("post", "/auth/reset-password", data);
  },

  // Change Password
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiRequest<void>("post", "/auth/change-password", data);
  },

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiRequest<AuthTokens>("post", "/auth/refresh-token", {
      refreshToken,
    });
    this.setAuthCookies(response);
    return response;
  },

  // Logout
  async logout(refreshToken?: string): Promise<void> {
    try {
      if (refreshToken) {
        await apiRequest<void>("post", "/auth/logout", { refreshToken });
      }
    } finally {
      this.clearAuthCookies();
    }
  },

  // Get Current User
  async getCurrentUser(): Promise<User> {
    return await apiRequest<User>("get", "/auth/me");
  },

  // Validate Reset Token
  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    return await apiRequest<{ valid: boolean }>("post", "/auth/validate-reset-token", { token });
  },

  // Helper: Set auth cookies
  setAuthCookies(tokens: AuthTokens): void {
    setCookie(COOKIE_KEYS.TOKEN, tokens.accessToken);
    setCookie(COOKIE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  // Helper: Clear auth cookies
  clearAuthCookies(): void {
    deleteCookie(COOKIE_KEYS.TOKEN);
    deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
  },
};

// Business Service
export const BusinessService = {
  // Complete Business Setup
  async setupBusiness(data: any): Promise<any> {
    return await apiRequest<any>("put", "/business/setup", data);
  },

  // Get Team Members
  async getMembers(): Promise<any[]> {
    return await apiRequest<any[]>("get", "/business/get_members");
  },

  // Send Invite
  async sendInvite(data: {
    email: string;
    role: string;
    accessPermissions?: string[];
    level?: string;
  }): Promise<void> {
    await apiRequest<void>("post", "/business/send-invite", { value: data });
  },

  // Decode Invite Token
  async decodeInviteToken(token: string): Promise<any> {
    return await apiRequest<any>("post", "/business/decode-invite", { token });
  },

  // Accept Invite
  async acceptInvite(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    businessId: string;
  }): Promise<any> {
    return await apiRequest<any>("post", "/business/accept-invite", data);
  },
};

// IMS Service
export const IMSService = {
  // Setup IMS
  async setupIMS(data: any): Promise<any> {
    return await apiRequest<any>("post", "/ims/setup", data);
  },
};

export default AuthService;
