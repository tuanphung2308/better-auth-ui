import { UserIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "../lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type User = {
    email?: string | null,
    name?: string | null,
    firstName?: string | null,
    fullName?: string | null,
    isAnonymous?: boolean | null,
    image?: string | null,
    avatar?: string | null,
    avatarUrl?: string | null,
}

export function UserAvatar({ user, className, ...props }: { user?: User } & ComponentProps<typeof Avatar>) {
    return (
        <Avatar
            className={cn("bg-muted size-8", className)}
            {...props}
        >
            <AvatarImage
                alt={user?.name || "Avatar"}
                src={(user && !user.isAnonymous)
                    ? (user.image || user.avatar || user.avatarUrl) as string
                    : undefined
                }
            />

            <AvatarFallback className="bg-transparent">
                {firstTwoCharacters(user?.name || user?.fullName || user?.firstName || user?.email) || (
                    <UserIcon className="w-[55%]" />
                )}
            </AvatarFallback>
        </Avatar>
    )
}

const firstTwoCharacters = (name?: string | null) => name?.slice(0, 2).toUpperCase()