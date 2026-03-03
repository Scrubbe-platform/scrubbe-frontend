import "next-auth";
import "next-auth/jwt";

// Account types matching the server
export type AccountType = "DEVELOPER" | "BUSINESS";
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

// Extended user interface
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    isVerified: boolean;
    accountType: AccountType | null;
    businessId: string | null;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      name: string | null;
      isVerified: boolean;
      accountType: AccountType | null;
      businessId: string | null;
      role: UserRole;
      accessToken: string;
      refreshToken: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    isVerified?: boolean;
    accountType?: AccountType | null;
    businessId?: string | null;
    role?: UserRole;
    accessToken?: string;
    refreshToken?: string;
  }
}
