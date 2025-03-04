"use client"

import { type createAuthClient } from "better-auth/react"
import {
    LogInIcon,
    LogOutIcon,
    PlusCircleIcon,
    SettingsIcon,
    UserRoundPlus
} from "lucide-react"
import { Fragment, useContext } from "react"
import { toast } from "sonner"

import { type AuthLocalization } from "../lib/auth-localization"
import { AuthUIContext } from "../lib/auth-ui-provider"
import { cn } from "../lib/utils"
import type { User } from "../types/user"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "./ui/dropdown-menu"
import { Skeleton } from "./ui/skeleton"
import { UserAvatar, type UserAvatarClassNames } from "./user-avatar"

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

type AuthClient = ReturnType<typeof createAuthClient>
type SessionData = AuthClient["$Infer"]["Session"]

export function UserButton({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: UserButtonClassNames,
    localization?: Partial<AuthLocalization>
}) {
    const {
        basePath,
        hooks: { useSession, useListDeviceSessions },
        localization: authLocalization,
        multiSession,
        settingsUrl,
        viewPaths,
        onSessionChange,
        LinkComponent
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { deviceSessions, isPending: deviceSessionsPending, setActiveSession } = useListDeviceSessions()
    const { data: sessionData, isPending: sessionPending } = useSession()
    const user = sessionData?.user as User

    const isPending = (sessionData && deviceSessionsPending) || sessionPending

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn("rounded-full", classNames?.trigger?.base)}
                disabled={isPending}
            >
                {(isPending) ? (
                    <Skeleton
                        className={cn(
                            "size-8 rounded-full",
                            className, classNames?.base, "bg-muted", classNames?.trigger?.skeleton
                        )}
                    />
                ) : (
                    <UserAvatar
                        className={cn("size-8", className, classNames?.base)}
                        classNames={classNames?.trigger?.avatar}
                        user={user}
                    />
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className={cn("me-3", classNames?.content?.base)}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {(user && !user.isAnonymous) ? (
                    <div className="flex gap-2 p-2 items-center">
                        <UserAvatar
                            classNames={classNames?.content?.avatar}
                            user={user}
                        />

                        <div className="flex flex-col">
                            <div className="font-medium text-sm">
                                {user.name || user.email}
                            </div>

                            {user.name && (
                                <div className="text-muted-foreground !font-light text-xs">
                                    {user.email}
                                </div>
                            )}
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
                        <LinkComponent
                            href={`${basePath}/${viewPaths.signIn}`}
                            to={`${basePath}/${viewPaths.signIn}`}
                        >
                            <DropdownMenuItem
                                className={classNames?.content?.menuItem}
                            >
                                <LogInIcon />
                                {localization.signIn}
                            </DropdownMenuItem>
                        </LinkComponent>

                        <LinkComponent
                            href={`${basePath}/${viewPaths.signUp}`}
                            to={`${basePath}/${viewPaths.signUp}`}
                        >
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <UserRoundPlus />
                                {localization.signUp}
                            </DropdownMenuItem>
                        </LinkComponent>
                    </>
                ) : (
                    <>
                        <LinkComponent
                            href={settingsUrl || `${basePath}/${viewPaths.settings}`}
                            to={settingsUrl || `${basePath}/settings`}
                        >
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <SettingsIcon />
                                {localization.settings}
                            </DropdownMenuItem>
                        </LinkComponent>

                        <LinkComponent
                            href={`${basePath}/${viewPaths.signOut}`}
                            to={`${basePath}/${viewPaths.signOut}`}
                        >
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
                                        onClick={async () => {
                                            const { error } = await setActiveSession?.(session.token)
                                            if (error) {
                                                toast.error(error.message || error.statusText)
                                            } else {
                                                onSessionChange?.()
                                            }
                                        }}
                                    >
                                        <div className="flex gap-2 items-center">
                                            <UserAvatar
                                                classNames={classNames?.content?.avatar}
                                                user={user}
                                            />

                                            <div className="flex flex-col">
                                                <div className="font-medium text-sm">
                                                    {user.name || user.email}
                                                </div>

                                                {user.name && (
                                                    <div className="text-muted-foreground !font-light text-xs">
                                                        {user.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className={classNames?.content?.separator} />
                                </Fragment>
                            ))}

                        <LinkComponent
                            href={`${basePath}/${viewPaths.signIn}`}
                            to={`${basePath}/${viewPaths.signIn}`}
                        >
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