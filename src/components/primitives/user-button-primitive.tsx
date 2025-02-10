"use client"

import type { createAuthClient } from "better-auth/react"
import {
    LogInIcon,
    LogOutIcon,
    PlusCircleIcon,
    SettingsIcon,
    UserRoundPlus
} from "lucide-react"
import React, { Fragment, useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { User } from "../../types/user"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Skeleton } from "../ui/skeleton"
import { UserAvatar, type UserAvatarClassNames } from "../user-avatar"

type AuthClient = ReturnType<typeof createAuthClient>
type SessionData = AuthClient["$Infer"]["Session"]

export interface UserButtonClassNames {
    trigger?: {
        base?: string
        avatar?: UserAvatarClassNames
        skeleton?: string
    },
    content?: {
        base?: string
        avatar?: UserAvatarClassNames
    }
}

export function UserButtonPrimitive({
    className,
    classNames,
    deviceSessions,
    isPending,
    setActiveSession,
    user,
    ...props
}: {
    className?: string,
    classNames?: UserButtonClassNames,
    deviceSessions?: SessionData[],
    isPending?: boolean
    setActiveSession?: (sessionToken: string) => void,
    user?: User
} & React.ComponentProps<"div">) {
    const { authPath, authViews, multiSession, settingsUrl, LinkComponent } = useContext(AuthUIContext)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn("rounded-full", classNames?.trigger?.base)}
                disabled={isPending}
            >
                {(isPending) ? (
                    <Skeleton className={cn("size-8 rounded-full", className, "bg-muted", classNames?.trigger?.skeleton)} {...props} />
                ) : (
                    <UserAvatar className={cn("size-8", className)} classNames={classNames?.trigger?.avatar} user={user} {...props} />
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent className="me-3" onCloseAutoFocus={(e) => e.preventDefault()}>
                {(user && !user.isAnonymous) ? (
                    <div className="flex gap-2 p-2 items-center">
                        <UserAvatar className={cn("size-8")} classNames={classNames?.content?.avatar} user={user} />

                        <div className="flex flex-col">
                            {user.name && (
                                <div className="font-medium text-sm">
                                    {user.name}
                                </div>
                            )}

                            <div className="text-muted-foreground !font-light text-xs">
                                {user.email}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-2 py-1 text-muted-foreground !font-light text-xs">
                        Account
                    </div>
                )}

                <DropdownMenuSeparator />

                {!user || user.isAnonymous ? (
                    <>
                        <LinkComponent href={`${authPath}/${authViews.signIn}`} to={`${authPath}/${authViews.signIn}`}>
                            <DropdownMenuItem>
                                <LogInIcon />

                                Sign In
                            </DropdownMenuItem>
                        </LinkComponent>

                        <LinkComponent href={`${authPath}/${authViews.signUp}`} to={`${authPath}/${authViews.signUp}`}>
                            <DropdownMenuItem>
                                <UserRoundPlus />

                                Sign Up
                            </DropdownMenuItem>
                        </LinkComponent>
                    </>
                ) : (
                    <>
                        <LinkComponent href={settingsUrl || `${authPath}/${authViews.settings}`} to={settingsUrl || `${authPath}/${authViews.settings}`}>
                            <DropdownMenuItem>
                                <SettingsIcon />

                                Settings
                            </DropdownMenuItem>
                        </LinkComponent>

                        <LinkComponent href={`${authPath}/${authViews.signOut}`} to={`${authPath}/${authViews.signOut}`}>
                            <DropdownMenuItem>
                                <LogOutIcon />

                                Sign Out
                            </DropdownMenuItem>
                        </LinkComponent>
                    </>
                )}

                {user && multiSession && (
                    <>
                        <DropdownMenuSeparator />

                        {deviceSessions?.filter((sessionData) => sessionData.user.id !== user?.id)
                            .map(({ session, user }) => (
                                <Fragment key={session.id}>
                                    <DropdownMenuItem
                                        onClick={() => setActiveSession?.(session.token)}
                                    >
                                        <div className="flex gap-2 items-center">
                                            <UserAvatar className={cn("size-8")} classNames={classNames?.content?.avatar} user={user} />

                                            <div className="flex flex-col">
                                                {user.name && (
                                                    <div className="font-medium text-sm">
                                                        {user.name}
                                                    </div>
                                                )}

                                                <div className="text-muted-foreground !font-light text-xs">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                </Fragment>
                            ))}

                        <LinkComponent href={`${authPath}/${authViews.signIn}`} to={`${authPath}/${authViews.signIn}`}>
                            <DropdownMenuItem>
                                <PlusCircleIcon />

                                Add Account
                            </DropdownMenuItem>
                        </LinkComponent>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}