import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_KEYS } from "./lib/constant";
import type { UserRole } from "./auth";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/business-signup",
  "/auth/developer-signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/error",
  "/auth/demo-page",
  "/auth/invite",
  "/about",
  "/pricing",
  "/features",
  "/contact",
  "/api/auth",
  "/api-docs",
  "/incident",
];

// Define auth routes that should redirect to dashboard if already logged in
const AUTH_ROUTES = [
  "/auth/signin",
  "/auth/business-signup",
  "/auth/developer-signup",

];

// Define protected routes that require authentication
const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/incident",
  "/ezra/dashboard",
  "/developer",
  "/profile",
  "/settings",
  "/auth/account-setup",
  "/auth/developer-setup",
];

// Define role-based protected routes
const ROLE_PROTECTED_ROUTES: { [key: string]: UserRole[] } = {
  "/admin": ["ADMIN", "SUPER_ADMIN"],
  "/admin/users": ["SUPER_ADMIN"],
  "/admin/settings": ["SUPER_ADMIN"],
  "/admin/business": ["ADMIN", "SUPER_ADMIN"],
  "/api/admin": ["ADMIN", "SUPER_ADMIN"],
};

type JwtPayload = {
  roles?: UserRole[];
  accountType?: "BUSINESS" | "DEVELOPER";
  exp?: number;
};

const AUTH_COOKIE = COOKIE_KEYS.TOKEN;

const isTokenExpired = (payload: JwtPayload | null): boolean => {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
};

const decodeJwtPayload = (token: string | undefined): JwtPayload | null => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

const hasRequiredRole = (
  userRoles: UserRole[] | undefined,
  requiredRoles: UserRole[]
): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  return requiredRoles.some((role) => userRoles.includes(role));
};

const getDefaultRedirect = (payload: JwtPayload | null): string => {
  if (payload?.accountType === "DEVELOPER") {
    return "/developer/dashboard";
  }
  return "/dashboard";
};

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = decodeJwtPayload(token);
  const isLoggedIn = !!token && !!payload && !isTokenExpired(payload);
  const userRoles = payload?.roles;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(prefix =>
    pathname.startsWith(prefix)
  );

  // Check if route is auth route
  const isAuthRoute = AUTH_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // Check for role-based route protection
  const roleProtectedEntry = Object.entries(ROLE_PROTECTED_ROUTES).find(([route]) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  // Allow public routes
  if (isPublicRoute) {
    // If logged in and trying to access auth routes, redirect to dashboard
    if (isAuthRoute && isLoggedIn) {
      return NextResponse.redirect(new URL(getDefaultRedirect(payload), nextUrl));
    }
    return NextResponse.next();
  }

  // Handle role-based protection
  if (roleProtectedEntry) {
    const [route, requiredRoles] = roleProtectedEntry;
    
    // Not logged in - redirect to login
    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", nextUrl);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Logged in but doesn't have required role - redirect to unauthorized
    if (!hasRequiredRole(userRoles, requiredRoles)) {
      return NextResponse.redirect(new URL("/auth/error?error=AccessDenied", nextUrl));
    }
    
    // Has required role - allow access
    return NextResponse.next();
  }

  // If not logged in, don't allow access to protected pages
  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};

// Export helper functions for use in components
export { hasRequiredRole };
