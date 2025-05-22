import { UserIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "../lib/utils"
import type { Profile } from "../types/profile"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Skeleton } from "./ui/skeleton"

export interface UserAvatarClassNames {
    base?: string
    image?: string
    fallback?: string
    fallbackIcon?: string
    skeleton?: string
}

export interface UserAvatarProps {
    classNames?: UserAvatarClassNames
    isPending?: boolean
    size?: "sm" | "default" | "lg" | "xl" | null
    user?: Profile | null
}

/**
 * Displays a user avatar with image and fallback support
 *
 * Renders a user's avatar image when available, with appropriate fallbacks:
 * - Shows a skeleton when isPending is true
 * - Displays first two characters of user's name when no image is available
 * - Falls back to a generic user icon when neither image nor name is available
 */
export function UserAvatar({
    className,
    classNames,
    isPending,
    size,
    user,
    ...props
}: UserAvatarProps & ComponentProps<typeof Avatar>) {
    const name = user?.username || user?.name || user?.fullName || user?.firstName || user?.email
    const src = user?.image || user?.avatar || user?.avatarUrl

    if (isPending) {
        return (
            <Skeleton
                className={cn(
                    "shrink-0 rounded-full",
                    size === "sm"
                        ? "size-6"
                        : size === "lg"
                          ? "size-10"
                          : size === "xl"
                            ? "size-12"
                            : "size-8",
                    className,
                    classNames?.base,
                    classNames?.skeleton
                )}
            />
        )
    }

    return (
        <Avatar
            className={cn(
                "bg-muted",
                size === "sm"
                    ? "size-6"
                    : size === "lg"
                      ? "size-10"
                      : size === "xl"
                        ? "size-12"
                        : "size-8",
                className,
                classNames?.base
            )}
            {...props}
        >
            <AvatarImage
                alt={name || "Avatar"}
                className={classNames?.image}
                src={src || undefined}
            />

            <AvatarFallback
                className={cn("uppercase", classNames?.fallback)}
                delayMs={src ? 600 : undefined}
            >
                {firstTwoCharacters(name) || (
                    <UserIcon className={cn("size-[50%]", classNames?.fallbackIcon)} />
                )}
            </AvatarFallback>
        </Avatar>
    )
}

const firstTwoCharacters = (name?: string | null) => name?.slice(0, 2)
