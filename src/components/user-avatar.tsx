import { UserIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "../lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type User = {
    name?: string | null,
    isAnonymous?: boolean | null,
    image?: string | null,
}

export function UserAvatar({ user, className, ...props }: { user?: User } & ComponentProps<typeof Avatar>) {
    return (
        <Avatar
            className={cn("bg-muted size-8", className)}
            {...props}
        >
            <AvatarImage
                alt={user?.name || "Avatar"}
                src={user && !user.isAnonymous
                    ? user.image || undefined
                    : undefined
                }
            />

            <AvatarFallback className="bg-transparent">
                {firstTwoCharacters(user?.name) || (
                    <UserIcon className="w-[50%]" />
                )}
            </AvatarFallback>
        </Avatar>
    )
}

const firstTwoCharacters = (name?: string | null) => name?.slice(0, 2).toUpperCase()