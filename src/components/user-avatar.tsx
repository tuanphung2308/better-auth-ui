import { UserIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "../lib/utils"
import type { User } from "../types/user"

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
    user?: User
    classNames?: UserAvatarClassNames
    isPending?: boolean
}

export function UserAvatar({
    user,
    classNames,
    className,
    isPending,
    ...props
}: UserAvatarProps & ComponentProps<typeof Avatar>) {
    const name = user?.name || user?.fullName || user?.firstName || user?.email
    const src = (user?.image || user?.avatar || user?.avatarUrl) as string

    if (isPending) {
        return (
            <Skeleton
                className={cn(
                    "size-8 shrink-0 rounded-full",
                    className,
                    classNames?.base,
                    classNames?.skeleton
                )}
            />
        )
    }

    return (
        <Avatar className={cn("bg-muted", className, classNames?.base)} {...props}>
            <AvatarImage
                alt={name || "Avatar"}
                className={classNames?.image}
                src={user && !user.isAnonymous ? src : undefined}
            />

            <AvatarFallback
                className={cn("uppercase", classNames?.fallback)}
                delayMs={src ? 600 : undefined}
            >
                {firstTwoCharacters(name) || (
                    <UserIcon className={cn("w-[55%]", classNames?.fallbackIcon)} />
                )}
            </AvatarFallback>
        </Avatar>
    )
}

const firstTwoCharacters = (name?: string | null) => name?.slice(0, 2)
