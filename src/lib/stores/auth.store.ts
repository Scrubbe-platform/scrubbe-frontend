import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginSchema } from "../validations/auth.schema";
import { apiClient } from "../api/client";
import Zod from "zod";
import { developerSignupSchema } from "@/components/auth/DeveloperSignupForm";
import { businessProfileSignupSchema } from "@/components/auth/CompleteBusinessProfile";
import { UserSession } from "@/auth";
import { developerProfileSignupSchema } from "@/components/auth/CompleteDeveloperProfile";
import { AxiosError } from "axios";
import { deleteCookie, setCookie } from "cookies-next";
import { COOKIE_KEYS } from "../constant";
import { businessSignupSchema } from "@/components/auth/BusinessSignupForm";
import { signOut } from "next-auth/react";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type User = {
  accountType: string;
  apiKey: string;
  apiKeyDuration: string;
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  lastName: string;
  oauthProvider_uuid: string;
  oauthprovider: string;
  passwordChangedAt?: string;
  profileImage?: string;
  registerdWithOauth: boolean;
  role: string; // Legacy single role (for backward compatibility)
  roles: UserRole[]; // New roles array from backend
  updatedAt: string;
  username?: string;
  purpose?: string;
};

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<User | null>;
  oauthLogin: (
    email: string,
    provider_uuid: string,
    oAuthProvider: string
  ) => Promise<User | null>;
  developerSignup: (
    data: Zod.infer<typeof developerSignupSchema>
  ) => Promise<void>;
  businessSignup: (
    data: Zod.infer<typeof businessSignupSchema>
  ) => Promise<void>;
  businessProfileSignup: (
    data: Zod.infer<typeof businessProfileSignupSchema> & Partial<UserSession>
  ) => Promise<void>;
  developerProfileSignup: (
    data: Zod.infer<typeof developerProfileSignupSchema> & Partial<UserSession>
  ) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (value: User) => void;
  refreshAccessToken: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  // Role-based methods
  hasRole: (requiredRoles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
};

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null,
      setUser: (value) => {
        set({ user: value });
      },
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const validatedData = loginSchema.parse({ email, password });

          const { data } = await apiClient.post("/auth/login", validatedData);

          set({
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
            isLoading: false,
          });

          setCookie(COOKIE_KEYS.TOKEN, data.tokens.accessToken);
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
          return data.user;
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },
      oauthLogin: async (email, provider_uuid, oAuthProvider) => {
        try {
          set({ isLoading: true, error: null });

          const validatedData = {
            email,
            provider_uuid,
            oAuthProvider,
          };

          const { data } = await apiClient.post(
            "/auth/oauth/login",
            validatedData
          );

          set({
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
            isLoading: false,
          });
          setCookie(COOKIE_KEYS.TOKEN, data.tokens.accessToken);
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);

          return data.user;
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },
      developerSignup: async (signupData) => {
        try {
          set({ isLoading: true, error: null });
          const validatedData = developerSignupSchema.parse(signupData);
          const firstName = validatedData.firstName;
          const lastName = validatedData.lastName;
          const devData = {
            email: validatedData.email,
            password: validatedData.password,
            firstName,
            lastName,
            githubUsername: validatedData.githubUsername?.trim() || undefined,
            experienceLevel: validatedData.experience,
          };
          const { data } = await apiClient.post("/auth/dev/register", devData);
          console.log(devData, data);
          set({
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
            isLoading: false,
          });
          setCookie(COOKIE_KEYS.TOKEN, data.tokens.accessToken);
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Signup failed",
            isLoading: false,
          });
          throw error;
        }
      },
      businessSignup: async (signupData) => {
        try {
          set({ isLoading: true, error: null });
          const validatedData = businessSignupSchema.parse(signupData);

          const newBusinessData = {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.businessEmail,
            password: validatedData.password,
            // businessAddress: validatedData?.businessAddress,
            // companySize: validatedData.companySize,
            // purpose: validatedData.purpose || undefined,
          };

          const { data } = await apiClient.post(
            "/auth/business/register",
            newBusinessData
          );
          set({
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
            isLoading: false,
          });
          setCookie(COOKIE_KEYS.TOKEN, data.tokens.accessToken);
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Signup failed",
            isLoading: false,
          });
          throw error;
        }
      },
      async verifyEmail(code) {
        try {
          const userId = get().user?.id;
          if (!userId) return;
          const value = {
            code,
            userId,
          };
          set({ isLoading: true, error: null });
          await apiClient.post("/auth/verify_email", { ...value });
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Signup failed",
            isLoading: false,
          });
        }
      },
      async resendOTP() {
        try {
          const userId = get().user?.id;
          if (!userId) return;
          const value = {
            userId,
          };
          set({ isLoading: true, error: null });
          await apiClient.post("/auth/resend_otp", { ...value });
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Signup failed",
            isLoading: false,
          });
        }
      },
      businessProfileSignup: async (signupData) => {
        try {
          set({ isLoading: true, error: null });
          //TODO: use the service provider endpoint
          const newBusinessData = {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            id: signupData.id,
            oAuthProvider: signupData.oAuthProvider,
            email: signupData.email,
            isVerified: signupData.isVerified,
            image: signupData.image,
            businessAddress: signupData.businessAddress,
            companySize: signupData.companySize,
          };
          const { data } = await apiClient.post(
            "/auth/oauth/business/register",
            newBusinessData
          );
          set({
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
            isLoading: false,
          });
          setCookie(COOKIE_KEYS.TOKEN, data.tokens.accessToken);
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
          return data?.user;
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Signup failed",
            isLoading: false,
          });
          throw error;
        }
      },
      developerProfileSignup: async (signupData) => {
        try {
          console.log(signupData);
          set({ isLoading: true, error: null });
          const newDevData = {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            id: signupData.id,
            oAuthProvider: signupData.oAuthProvider,
            email: signupData.email,
            isVerified: signupData.isVerified,
            image: signupData.image,
            experienceLevel: signupData.experience,
            githubUsername: signupData.githubUsername,
          };
          const { data } = await apiClient.post(
            "/auth/oauth/dev/register",
            newDevData
          );
          set({
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
            user: data.user,
            isLoading: false,
          });
          setCookie(COOKIE_KEYS.TOKEN, data.tokens.accessToken);
          setCookie(COOKIE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Signup failed",
            isLoading: false,
          });
          throw error;
        }
      },
      logout: async () => {
        try {
          set({ isLoading: true });
          // Call backend logout endpoint
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            try {
              await apiClient.post("/auth/logout", { refreshToken });
            } catch (error) {
              console.error("Backend logout failed:", error);
            }
          }
          await signOut({ redirect: false });
          deleteCookie(COOKIE_KEYS.TOKEN);
          deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
          set({
            token: null,
            refreshToken: null,
            user: null,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      refreshAccessToken: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (!refreshToken) {
            return false;
          }

          const { data } = await apiClient.post("/auth/refresh-token", {
            refreshToken,
          });

          set({
            token: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
          });

          setCookie(COOKIE_KEYS.TOKEN, data.accessToken);
          if (data.refreshToken) {
            setCookie(COOKIE_KEYS.REFRESH_TOKEN, data.refreshToken);
          }

          return true;
        } catch (error) {
          console.error("Token refresh failed:", error);
          // Clear auth state on refresh failure
          set({
            token: null,
            refreshToken: null,
            user: null,
          });
          deleteCookie(COOKIE_KEYS.TOKEN);
          deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
          return false;
        }
      },
      forgotPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          await apiClient.post("/auth/forgot-password", { email });
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Failed to send reset email",
            isLoading: false,
          });
          throw error;
        }
      },
      resetPassword: async (token: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          await apiClient.post("/auth/reset-password", { token, password });
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Failed to reset password",
            isLoading: false,
          });
          throw error;
        }
      },
      clearError: () => set({ error: null }),
      
      // Role-based helper methods
      hasRole: (requiredRoles: UserRole[]) => {
        const user = get().user;
        if (!user?.roles || user.roles.length === 0) return false;
        return requiredRoles.some(role => user.roles.includes(role));
      },
      
      isAdmin: () => {
        const user = get().user;
        if (!user?.roles) return false;
        return user.roles.includes("ADMIN") || user.roles.includes("SUPER_ADMIN");
      },
      
      isSuperAdmin: () => {
        const user = get().user;
        if (!user?.roles) return false;
        return user.roles.includes("SUPER_ADMIN");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Export types for use in components
 
export default useAuthStore;
