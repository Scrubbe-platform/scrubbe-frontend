import { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = "gradient" | "solid" | "outline-green" | "outline-dark";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  gradient:
    "bg-gradient-to-r from-[#0f2d24] via-[#1a5c3a] to-[#7dcf6e] text-white border-transparent hover:opacity-90",
  solid: "bg-[#22a156] text-white border-transparent hover:bg-[#1a8a47]",
  "outline-green":
    "bg-white dark:bg-transparent text-[#1a6b3c] dark:text-[#22a156] border-[#22a156] hover:bg-[#f0faf4] dark:hover:bg-[#22a156]/10",
  "outline-dark":
    "bg-white dark:bg-transparent text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm gap-2 rounded-lg",
  md: "px-6 py-3 text-base gap-2.5 rounded-xl",
  lg: "px-8 py-4 text-lg gap-3 rounded-2xl",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Button({
  variant = "solid",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        // base
        "inline-flex items-center justify-center font-semibold border transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#22a156]",
        "disabled:opacity-50 disabled:pointer-events-none",
        // variant + size
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}
