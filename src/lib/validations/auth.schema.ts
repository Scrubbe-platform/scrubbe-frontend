import { z } from "zod";

// Password validation regex - matches server requirements
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(
    passwordRegex,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  );

// Email validation
const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters")
  .min(1, "Email is required");

// Free email domains that should be rejected for business accounts
const freeEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "mail.com",
  "gmx.com",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
  "msn.com",
  "live.com",
  "ymail.com",
  "inbox.com",
  "me.com",
];

// Business email validation
const businessEmailSchema = emailSchema.refine(
  (email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return !freeEmailDomains.includes(domain);
  },
  {
    message: "Please use a business email address",
  }
);

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Developer signup schema
export const developerSignupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: emailSchema,
    githubUsername: z
      .string()
      .min(2, "GitHub username must be at least 2 characters")
      .max(39, "GitHub username must be less than 39 characters")
      .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid GitHub username format")
      .optional(),
    experience: z
      .string()
      .min(1, "Experience is required")
      .max(50, "Experience must be less than 50 characters"),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Business signup schema
export const businessSignupSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    businessEmail: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .refine(
        (email) => {
          // List of common public email domains
          const publicDomains = [
            "gmail.com",
            "yahoo.com",
            "hotmail.com",
            "outlook.com",
            "aol.com",
            "icloud.com",
            "mail.com",
            "gmx.com",
            "protonmail.com",
            "zoho.com",
            "yandex.com",
            "msn.com",
            "live.com",
            "ymail.com",
            "inbox.com",
            "me.com",
          ];
          const domain = email.split("@")[1]?.toLowerCase();
          return domain && !publicDomains.includes(domain);
        },
        {
          message:
            "Please use your business email address (not a public provider)",
        }
      ),
    businessAddress: z
      .string()
      .min(10, { message: "Please provide a valid address" }),
    companySize: z.string().min(1, { message: "Please select company size" }),
    purpose: z.string().optional(),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Email verification schema
export const verifyEmailSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  code: z
    .string()
    .min(4, "Verification code is required")
    .max(10, "Invalid verification code format"),
});

// Resend OTP schema
export const resendOtpSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema >

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().optional(),
  })
  .refine((data) => !data.confirmNewPassword || data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type DeveloperSignupFormData = z.infer<typeof developerSignupSchema>;
export type BusinessSignupFormData = z.infer<typeof businessSignupSchema>;
