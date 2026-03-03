export type FingerprintResponse = {
  success: boolean;
  data: {
    ip: string;
    location?: Record<string, never>; 
    network: {
      isProxy: boolean;
      
    };
    device: {
      os: string;
      browser: string;
      deviceType?: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'other';
    };
    usersDetails: {
      ip: string;
      type: 'ipv4' | 'ipv6';
      latitude: number;
      longitude: number;
      is_eu: boolean;
      continent_code: string;
      continent_name: string;
      country_code: string;
      country_name: string;
      region_name?: string; 
      city?: string; 
      location: {
        capital: string;
        native_name: string;
        flag: string;
        top_level_domains: string[];
        calling_codes: string[];
      };
      connection: {
        asn: number;
        isp: string;
        organization?: string;
      };
      currencies: {
        name: string;
        code: string;
        symbol: string;
      }[];
      timezones: string[];
      languages?: { 
        code: string;
        name: string;
        native: string;
      }[];
    };
    
    additionalData?: Record<string, unknown>;
  };
  
  error?: {
    code: string;
    message: string;
  };
};

// Account types matching the server
export type AccountType = "DEVELOPER" | "BUSINESS";
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

// Base API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Authentication response types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isVerified: boolean;
  accountType: AccountType | null;
  businessId: string | null;
  role: UserRole;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSuccessResponse {
  user: UserResponse;
  tokens: AuthTokens;
}

// Error response type
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

// Password reset response
export interface PasswordResetResponse {
  message: string;
}

// Token validation response
export interface TokenValidationResponse {
  valid: boolean;
  message?: string;
}

// Email verification response
export interface EmailVerificationResponse {
  message: string;
}

// Generic success response
export interface SuccessResponse {
  message: string;
}

// Paginated response helper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}