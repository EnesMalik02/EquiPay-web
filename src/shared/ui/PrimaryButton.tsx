"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size    = "sm" | "md" | "lg";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: Variant;
    size?: Size;
    icon?: ReactNode;
    /** Show icon on the right side instead of the left */
    iconRight?: boolean;
    fullWidth?: boolean;
}

const styles: Record<Variant, { bg: string; color: string; border: string }> = {
    primary: {
        bg:     "var(--foreground)",
        color:  "#fff",
        border: "transparent",
    },
    outline: {
        bg:     "transparent",
        color:  "var(--foreground)",
        border: "var(--border)",
    },
    ghost: {
        bg:     "transparent",
        color:  "var(--primary)",
        border: "transparent",
    },
};

const sizes: Record<Size, string> = {
    sm: "px-3 py-2 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2",
};

/**
 * Reusable button component.
 * Use `variant="primary"` for the main CTA, `"outline"` for secondary actions,
 * `"ghost"` for text-style actions.
 */
export const PrimaryButton = ({
    children,
    variant = "primary",
    size = "md",
    icon,
    iconRight = false,
    fullWidth = false,
    className = "",
    style,
    ...rest
}: PrimaryButtonProps) => {
    const { bg, color, border } = styles[variant];

    return (
        <button
            className={`
                inline-flex items-center justify-center font-bold rounded-xl
                transition-all active:scale-95
                ${sizes[size]}
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
            style={{
                background: bg,
                color,
                border: `1.5px solid ${border}`,
                ...style,
            }}
            {...rest}
        >
            {icon && !iconRight && <span className="shrink-0">{icon}</span>}
            {children}
            {icon && iconRight && <span className="shrink-0">{icon}</span>}
        </button>
    );
};
