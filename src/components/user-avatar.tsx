import { UserIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "../lib/utils"
import type { User } from "../types/user"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export interface UserAvatarClassNames {
    base?: string,
    image?: string,
    fallback?: string,
    fallbackIcon?: string
}

export function UserAvatar({
    user, classNames, className, ...props
}: { user?: User, classNames?: UserAvatarClassNames } & ComponentProps<"div">) {
    const name = user?.name || user?.fullName || user?.firstName || user?.email

    return (
        <Avatar
            className={cn(className, classNames?.base)}
            {...props}
        >
            <AvatarImage
                alt={name || "Avatar"}
                className={classNames?.image}
                src={(user && !user.isAnonymous)
                    ? (user.image || user.avatar || user.avatarUrl) as string
                    : undefined
                }
            />

            <AvatarFallback className={cn("uppercase", classNames?.fallback)} delayMs={100}>
                {firstTwoCharacters(name) || (
                    <UserIcon className={cn("w-[55%]", classNames?.fallbackIcon)} />
                )}
            </AvatarFallback>
        </Avatar>
    )
}

const firstTwoCharacters = (name?: string | null) => name?.slice(0, 2)