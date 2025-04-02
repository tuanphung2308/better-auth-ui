import { cn } from "../lib/utils"
import type { User as UserType } from "../types/user"
import { Skeleton } from "./ui/skeleton"
import { UserAvatar, type UserAvatarClassNames } from "./user-avatar"

export interface UserClassNames {
    base?: string
    avatar?: UserAvatarClassNames
    p?: string
    small?: string
    size?: "sm" | "md" | "lg"
}

export interface UserProps {
    className?: string
    classNames?: UserClassNames
    isPending?: boolean
    user?: UserType
}

export function User({ user, className, classNames, isPending }: UserProps) {
    return (
        <div className={cn("flex items-center gap-2 truncate", className, classNames?.base)}>
            <UserAvatar isPending={isPending} user={user} classNames={classNames?.avatar} />

            <div className="flex flex-col truncate text-left">
                {isPending ? (
                    <>
                        <Skeleton className={cn("my-0.5 h-4 w-24 max-w-full", classNames?.p)} />
                        <Skeleton className={cn("my-0.5 h-3 w-32 max-w-full", classNames?.small)} />
                    </>
                ) : (
                    <>
                        <span className={cn("truncate font-medium text-sm", classNames?.p)}>
                            {user?.name || user?.email || "User"}
                        </span>

                        {user?.name && user?.email && (
                            <span
                                className={cn(
                                    "!font-light truncate text-muted-foreground text-xs",
                                    classNames?.small
                                )}
                            >
                                {user.email}
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
