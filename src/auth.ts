import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Gitlab from "next-auth/providers/gitlab";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { AMPLIFY_SERVER_ENV } from "./generated/amplify-server-env";

// Role definitions matching backend
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type AccountType = "DEVELOPER" | "BUSINESS";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function normalizeEnvValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

const apiBaseUrl =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.API_BASE_URL) ??
  normalizeEnvValue(process.env.API_BASE_URL) ??
  normalizeEnvValue(process.env.NEXT_PUBLIC_API_BASE_URL) ??
  "";

const authSecret =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_SECRET) ??
  normalizeEnvValue(process.env.AUTH_SECRET) ??
  normalizeEnvValue(process.env.NEXTAUTH_SECRET);

const githubClientId =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_GITHUB_ID) ??
  normalizeEnvValue(process.env.AUTH_GITHUB_ID) ??
  normalizeEnvValue(process.env.GITHUB_CLIENT_ID);

const githubClientSecret =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_GITHUB_SECRET) ??
  normalizeEnvValue(process.env.AUTH_GITHUB_SECRET) ??
  normalizeEnvValue(process.env.GITHUB_CLIENT_SECRET);

const googleClientId =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_GOOGLE_ID) ??
  normalizeEnvValue(process.env.AUTH_GOOGLE_ID) ??
  normalizeEnvValue(process.env.GOOGLE_CLIENT_ID);

const googleClientSecret =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_GOOGLE_SECRET) ??
  normalizeEnvValue(process.env.AUTH_GOOGLE_SECRET) ??
  normalizeEnvValue(process.env.GOOGLE_CLIENT_SECRET);

const gitlabClientId =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_GITLAB_ID) ??
  normalizeEnvValue(process.env.AUTH_GITLAB_ID) ??
  normalizeEnvValue(process.env.GITLAB_CLIENT_ID);

const gitlabClientSecret =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_GITLAB_SECRET) ??
  normalizeEnvValue(process.env.AUTH_GITLAB_SECRET) ??
  normalizeEnvValue(process.env.GITLAB_CLIENT_SECRET);

const microsoftClientId =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_MICROSOFT_ENTRA_ID_ID) ??
  normalizeEnvValue(process.env.AUTH_MICROSOFT_ENTRA_ID_ID) ??
  normalizeEnvValue(process.env.MICROSOFT_ENTRA_ID_ID);

const microsoftClientSecret =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_MICROSOFT_ENTRA_ID_SECRET) ??
  normalizeEnvValue(process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET) ??
  normalizeEnvValue(process.env.MICROSOFT_ENTRA_ID_SECRET);

const microsoftIssuer =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_MICROSOFT_ENTRA_ID_ISSUER) ??
  normalizeEnvValue(process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER) ??
  normalizeEnvValue(process.env.MICROSOFT_ENTRA_ID_ISSUER);

const authUrl =
  normalizeEnvValue(AMPLIFY_SERVER_ENV.AUTH_URL) ??
  normalizeEnvValue(process.env.AUTH_URL) ??
  normalizeEnvValue(process.env.NEXTAUTH_URL) ??
  normalizeEnvValue(process.env.FRONTEND_URL) ??
  (process.env.NODE_ENV === "production" ? "https://www.scrubbe.com" : undefined);

function getBackendApiBaseUrl() {
  return apiBaseUrl.replace(/\/+$/, "");
}

if (process.env.NODE_ENV === "production") {
  console.info("[auth] runtime configuration", {
    hasAuthSecret: Boolean(authSecret),
    hasGithubClientId: Boolean(githubClientId),
    hasGithubClientSecret: Boolean(githubClientSecret),
    hasGitlabClientId: Boolean(gitlabClientId),
    hasGitlabClientSecret: Boolean(gitlabClientSecret),
    authUrl: authUrl ?? null,
  });
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  secret: authSecret,
  providers: [
    Github({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      async profile(profile):Promise<any> {
        return {
          id: profile.id.toString(),
          oAuthProvider: "GITHUB",
          githubUsername: profile.login,
          email: profile.email || `${profile.login}@users.noreply.github.com`,
          image: profile.avatar_url,
          firstName: profile.name?.split(" ")[0] || profile.login,
          lastName: profile.name?.split(" ").slice(1).join(" ") || "",
          isVerified: true,
          name: profile.name || profile.login,
          roles: ["USER"], // Default role for OAuth users
        };
      },
    }),
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      async profile(profile):Promise<any>  {
        return {
          id: profile.sub,
          oAuthProvider: "GOOGLE",
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name || profile.name?.split(" ")[0] || "",
          lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || "",
          isVerified: profile.email_verified || true,
          name: profile.name,
          roles: ["USER"], // Default role for OAuth users
        };
      },
    }),
    Gitlab({
      clientId: gitlabClientId,
      clientSecret: gitlabClientSecret,
      async profile(profile):Promise<any>  {
        return {
          id: profile.id.toString(),
          oAuthProvider: "GITLAB",
          email: profile.email,
          image: profile.avatar_url,
          firstName: profile.name?.split(" ")[0] || profile.username,
          lastName: profile.name?.split(" ").slice(1).join(" ") || "",
          isVerified: true,
          name: profile.name || profile.username,
          roles: ["USER"], // Default role for OAuth users
        };
      },
    }),
    MicrosoftEntraID({
      clientId: microsoftClientId,
      clientSecret: microsoftClientSecret,
      issuer: microsoftIssuer,
      async profile(profile):Promise<any>  {
        return {
          id: profile.oid,
          oAuthProvider: "AZURE",
          email: profile.email || profile.preferred_username,
          image: null,
          firstName: profile.given_name || profile.name?.split(" ")[0] || "",
          lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || "",
          isVerified: true,
          name: profile.name,
          roles: ["USER"], // Default role for OAuth users
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.oAuthProvider = user.oAuthProvider;
        token.githubUsername = user.githubUsername;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.roles = user.roles || ["USER"];
        token.accountType = user.accountType;
        token.businessId = user.businessId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub || "";
      session.user.firstName = token.firstName || '';
      session.user.lastName = token.lastName || '';
      session.user.isVerified = token.isVerified || false
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.email = token.email || "";
      session.user.oAuthProvider = token.oAuthProvider as string;
      session.user.githubUsername = token.githubUsername as string;
      session.user.provider = token.provider as string;
      session.user.providerAccountId = token.providerAccountId as string;
      session.user.roles = (token.roles as UserRole[]) || ["USER"];
      session.user.accountType = token.accountType as AccountType | null;
      session.user.businessId = token.businessId as string | null;
      return session;
    },
    async signIn({ user, account }) {
      if (!account || !user) return false;
      // For OAuth providers, exchange with backend to get real JWT tokens
      if (account.type === "oauth") {
        try {
          const apiUrl = getBackendApiBaseUrl();
          if (!apiUrl) {
            console.warn(
              "OAuth backend exchange skipped because API_BASE_URL / NEXT_PUBLIC_API_BASE_URL is not configured."
            );
            return true;
          }
          const res = await fetch(`${apiUrl}/auth/oauth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              provider_uuid: account.providerAccountId,
              oAuthProvider: user.oAuthProvider,
            }),
          });
          if (res.ok) {
            const json = await res.json();
            const { user: backendUser, tokens } = json?.data ?? {};
            if (tokens) {
              user.accessToken = tokens.accessToken;
              user.refreshToken = tokens.refreshToken;
              user.accountType = backendUser?.accountType ?? null;
              user.businessId = backendUser?.businessId ?? null;
              user.roles = backendUser?.roles ?? ["USER"];
            }
          }
          // Allow sign-in even if backend call fails (handled in SignInForm)
          return true;
        } catch {
          return true;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      const resolvedBaseUrl =
        authUrl ??
        (process.env.NODE_ENV === "production" &&
        /^https?:\/\/localhost(?::\d+)?$/i.test(baseUrl)
          ? "https://www.scrubbe.com"
          : baseUrl);
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${resolvedBaseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === resolvedBaseUrl) return url;
      return resolvedBaseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
});

declare module "next-auth" {
  interface User {
    firstName: string;
    lastName: string;
    isVerified: boolean;
    accessToken: string;
    refreshToken: string;
    email: string;
    oAuthProvider?: string;
    githubUsername?: string;
    provider?: string;
    providerAccountId?: string;
    name: string;
    image?: string | null;
    roles?: UserRole[];
    accountType: AccountType | null;
    businessId: string | null;
  }

  interface Session {
    user: UserSession;
    accessToken?: string;
    refreshToken?: string;
  }
}

export interface UserSession {
  id: string;
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
  email?: string;
  image?: string | null;
  oAuthProvider?: string;
  githubUsername?: string;
  provider?: string;
  providerAccountId?: string;
  name?: string;
  roles?: UserRole[];
  accountType?: AccountType | null;
  businessId?: string | null;
}

// Helper function to check if user has required role
export function hasRole(session: any, requiredRoles: UserRole[]): boolean {
  if (!session?.user?.roles) return false;
  return requiredRoles.some(role => session.user.roles.includes(role));
}

// Helper function to check if user is admin
export function isAdmin(session: any): boolean {
  return hasRole(session, ["ADMIN", "SUPER_ADMIN"]);
}

// Helper function to check if user is super admin
export function isSuperAdmin(session: any): boolean {
  return hasRole(session, ["SUPER_ADMIN"]);
}
