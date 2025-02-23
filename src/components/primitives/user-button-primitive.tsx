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

export const userButtonLocalization = {
    account: "Account",
    addAccount: "Add Account",
    settings: "Settings",
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up"
}

export type UserButtonClassNames = {
    base?: string
    trigger?: {
        base?: string
        avatar?: UserAvatarClassNames
        skeleton?: string
    },
    content?: {
        base?: string
        avatar?: UserAvatarClassNames
        menuItem?: string
        separator?: string
    }
}

export function UserButtonPrimitive({
    className,
    classNames,
    deviceSessions,
    isPending,
    localization,
    setActiveSession,
    user,
    ...props
}: {
    className?: string,
    classNames?: UserButtonClassNames,
    deviceSessions?: SessionData[],
    isPending?: boolean,
    localization?: Partial<typeof userButtonLocalization>,
    setActiveSession?: (sessionToken: string) => void,
    user?: User
} & React.ComponentProps<"div">) {
    localization = { ...userButtonLocalization, ...localization }
    const { basePath, viewPaths, multiSession, settingsUrl, LinkComponent } = useContext(AuthUIContext)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn("rounded-full", classNames?.trigger?.base)}
                disabled={isPending}
            >
                {(isPending) ? (
                    <Skeleton className={cn("size-8 rounded-full", className, classNames?.base, "bg-muted", classNames?.trigger?.skeleton)} {...props} />
                ) : (
                    <UserAvatar className={cn("size-8", className, classNames?.base)} classNames={classNames?.trigger?.avatar} user={user} {...props} />
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent className={cn("me-3", classNames?.content?.base)} onCloseAutoFocus={(e) => e.preventDefault()}>
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
                        {localization.account}
                    </div>
                )}

                <DropdownMenuSeparator className={classNames?.content?.separator} />

                {!user || user.isAnonymous ? (
                    <>
                        <LinkComponent href={`${basePath}/${viewPaths.signIn}`} to={`${basePath}/${viewPaths.signIn}`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <LogInIcon />
                                {localization.signIn}
                            </DropdownMenuItem>
                        </LinkComponent>

                        <LinkComponent href={`${basePath}/${viewPaths.signUp}`} to={`${basePath}/${viewPaths.signUp}`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <UserRoundPlus />
                                {localization.signUp}
                            </DropdownMenuItem>
                        </LinkComponent>
                    </>
                ) : (
                    <>
                        <LinkComponent href={settingsUrl || `${basePath}/settings`} to={settingsUrl || `${basePath}/settings`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <SettingsIcon />
                                {localization.settings}
                            </DropdownMenuItem>
                        </LinkComponent>

                        <LinkComponent href={`${basePath}/${viewPaths.signOut}`} to={`${basePath}/${viewPaths.signOut}`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <LogOutIcon />
                                {localization.signOut}
                            </DropdownMenuItem>
                        </LinkComponent>
                    </>
                )}

                {user && multiSession && (
                    <>
                        <DropdownMenuSeparator className={classNames?.content?.separator} />

                        {deviceSessions?.filter((sessionData) => sessionData.user.id !== user?.id)
                            .map(({ session, user }) => (
                                <Fragment key={session.id}>
                                    <DropdownMenuItem
                                        className={classNames?.content?.menuItem}
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

                                    <DropdownMenuSeparator className={classNames?.content?.separator} />
                                </Fragment>
                            ))}

                        <LinkComponent href={`${basePath}/${viewPaths.signIn}`} to={`${basePath}/${viewPaths.signIn}`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <PlusCircleIcon />
                                {localization.addAccount}
                            </DropdownMenuItem>
                        </LinkComponent>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}