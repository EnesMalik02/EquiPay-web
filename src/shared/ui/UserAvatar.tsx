"use client";

import Image from "next/image";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface UserAvatarProps {
    /** Display name – first letter is used as fallback */
    name?: string | null;
    /** Remote or local image URL */
    imageUrl?: string | null;
    size?: AvatarSize;
    className?: string;
    /** Override background colour (CSS value) */
    bg?: string;
    /** Override text / icon colour (CSS value) */
    color?: string;
    /** Whether to show a white border ring (useful for stacked avatars) */
    ring?: boolean;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; img: number }> = {
    xs: { container: "w-6 h-6",   text: "text-[9px]",  img: 24 },
    sm: { container: "w-8 h-8",   text: "text-[11px]", img: 32 },
    md: { container: "w-10 h-10", text: "text-sm",      img: 40 },
    lg: { container: "w-12 h-12", text: "text-base",    img: 48 },
    xl: { container: "w-16 h-16", text: "text-xl",      img: 64 },
};

export const UserAvatar = ({
    name,
    imageUrl,
    size = "md",
    className = "",
    bg,
    color,
    ring = false,
}: UserAvatarProps) => {
    const { container, text, img } = sizeMap[size];
    const initial = name?.trim().charAt(0).toUpperCase() ?? "?";

    const defaultBg    = "var(--primary-light)";
    const defaultColor = "var(--primary)";

    const ringClass = ring ? "border-2 border-white" : "";

    if (imageUrl) {
        return (
            <div
                className={`${container} rounded-full overflow-hidden shrink-0 ${ringClass} ${className}`}
                style={{ background: bg ?? defaultBg }}
            >
                <Image
                    src={imageUrl}
                    alt={name ?? "avatar"}
                    width={img}
                    height={img}
                    className="object-cover w-full h-full"
                />
            </div>
        );
    }

    return (
        <div
            className={`${container} rounded-full flex items-center justify-center font-bold shrink-0 ${ringClass} ${className}`}
            style={{
                background: bg ?? defaultBg,
                color: color ?? defaultColor,
            }}
        >
            <span className={text}>{initial}</span>
        </div>
    );
};
