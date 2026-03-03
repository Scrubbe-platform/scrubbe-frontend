import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Gitlab from "next-auth/providers/gitlab";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// Role definitions matching backend
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type AccountType = "DEVELOPER" | "BUSINESS";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Github({
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
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
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
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
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
