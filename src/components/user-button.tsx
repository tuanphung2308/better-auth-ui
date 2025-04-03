"use client"

import {
    ChevronsUpDown,
    LogInIcon,
    LogOutIcon,
    PlusCircleIcon,
    SettingsIcon,
    UserRoundPlus
} from "lucide-react"
import { Fragment, type ReactNode, useContext, useEffect, useState } from "react"

import type { AuthLocalization } from "../lib/auth-localization"
import { AuthUIContext } from "../lib/auth-ui-provider"
import { cn } from "../lib/utils"
import type { User as UserType } from "../types/user"

import type { Session } from "better-auth"
import { Button } from "./ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "./ui/dropdown-menu"
import { User, type UserClassNames } from "./user"
import { UserAvatar, type UserAvatarClassNames } from "./user-avatar"

export interface UserButtonClassNames {
    base?: string
    skeleton?: string
    trigger?: {
        base?: string
        avatar?: UserAvatarClassNames
        user?: UserClassNames
        skeleton?: string
    }
    content?: {
        base?: string
        user?: UserClassNames
        avatar?: UserAvatarClassNames
        menuItem?: string
        separator?: string
    }
}

export interface UserButtonProps {
    className?: string
    classNames?: UserButtonClassNames
    additionalLinks?: {
        href: string
        icon?: ReactNode
        label: ReactNode
        signedIn?: boolean
    }[]
    disableDefaultLinks?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
    /**
     * @default "icon"
     */
    size?: "icon" | "full"
}

type DeviceSession = {
    session: Session
    user: UserType
}

export function UserButton({
    className,
    classNames,
    additionalLinks,
    disableDefaultLinks,
    localization,
    size = "icon"
}: UserButtonProps) {
    const {
        basePath,
        hooks: { useSession, useListDeviceSessions },
        mutates: { setActiveSession },
        localization: authLocalization,
        multiSession,
        settingsUrl,
        toast,
        viewPaths,
        onSessionChange,
        user: contextUser,
        Link
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    let deviceSessions: DeviceSession[] | undefined | null = null
    let deviceSessionsPending = false

    if (multiSession) {
        const { data, isPending } = useListDeviceSessions()
        deviceSessions = data
        deviceSessionsPending = isPending
    }

    const { data: sessionData, isPending: sessionPending } = useSession()
    const user = (contextUser || sessionData?.user) as UserType
    const [activeSessionPending, setActiveSessionPending] = useState(false)

    const isPending = sessionPending || activeSessionPending

    const switchAccount = async (sessionToken: string) => {
        setActiveSessionPending(true)
        const { error } = await setActiveSession({ sessionToken })

        if (error) {
            toast({ variant: "error", message: error.message || error.statusText })
        } else {
            onSessionChange?.()
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies:
    useEffect(() => {
        if (!multiSession) return

        setActiveSessionPending(false)
    }, [sessionData, multiSession])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                asChild={size === "full"}
                className={cn(size === "icon" && "rounded-full", classNames?.trigger?.base)}
            >
                {size === "icon" ? (
                    <UserAvatar
                        isPending={isPending}
                        className={cn("size-8", className, classNames?.base)}
                        classNames={classNames?.trigger?.avatar}
                        user={user}
                    />
                ) : (
                    <Button
                        className={cn("h-fit", className, classNames?.trigger?.base)}
                        variant="outline"
                    >
                        <User
                            user={user}
                            isPending={isPending}
                            classNames={classNames?.trigger?.user}
                        />

                        <ChevronsUpDown className="ml-auto" />
                    </Button>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className={cn("max-w-64", classNames?.content?.base)}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <div className={cn("p-2", classNames?.content?.menuItem)}>
                    {(user && !user.isAnonymous) || isPending ? (
                        <User
                            user={user}
                            isPending={isPending}
                            classNames={classNames?.content?.user}
                        />
                    ) : (
                        <div className="-my-1 text-muted-foreground text-xs">
                            {localization.account}
                        </div>
                    )}
                </div>

                <DropdownMenuSeparator className={classNames?.content?.separator} />

                {additionalLinks?.map(
                    ({ href, icon, label, signedIn }, index) =>
                        (signedIn === undefined ||
                            (signedIn && !!sessionData) ||
                            (!signedIn && !sessionData)) && (
                            <Link key={index} href={href}>
                                <DropdownMenuItem className={classNames?.content?.menuItem}>
                                    {icon}

                                    {label}
                                </DropdownMenuItem>
                            </Link>
                        )
                )}

                {!user || user.isAnonymous ? (
                    <>
                        <Link href={`${basePath}/${viewPaths.signIn}`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <LogInIcon />

                                {localization.signIn}
                            </DropdownMenuItem>
                        </Link>

                        <Link href={`${basePath}/${viewPaths.signUp}`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <UserRoundPlus />

                                {localization.signUp}
                            </DropdownMenuItem>
                        </Link>
                    </>
                ) : (
                    <>
                        {!disableDefaultLinks && (
                            <Link href={settingsUrl || `${basePath}/${viewPaths.settings}`}>
                                <DropdownMenuItem className={classNames?.content?.menuItem}>
                                    <SettingsIcon />

                                    {localization.settings}
                                </DropdownMenuItem>
                            </Link>
                        )}

                        <Link href={`${basePath}/${viewPaths.signOut}`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <LogOutIcon />

                                {localization.signOut}
                            </DropdownMenuItem>
                        </Link>
                    </>
                )}

                {user && multiSession && (
                    <>
                        <DropdownMenuSeparator className={classNames?.content?.separator} />

                        {!deviceSessions && deviceSessionsPending && (
                            <>
                                <DropdownMenuItem
                                    disabled
                                    className={classNames?.content?.menuItem}
                                >
                                    <User isPending={true} classNames={classNames?.content?.user} />
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className={classNames?.content?.separator} />
                            </>
                        )}

                        {deviceSessions
                            ?.filter((sessionData) => sessionData.user.id !== user?.id)
                            .map(({ session, user }) => (
                                <Fragment key={session.id}>
                                    <DropdownMenuItem
                                        className={classNames?.content?.menuItem}
                                        onClick={() => switchAccount(session.token)}
                                    >
                                        <User user={user} classNames={classNames?.content?.user} />
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator
                                        className={classNames?.content?.separator}
                                    />
                                </Fragment>
                            ))}

                        <Link href={`${basePath}/${viewPaths.signIn}`}>
                            <DropdownMenuItem className={classNames?.content?.menuItem}>
                                <PlusCircleIcon />

                                {localization.addAccount}
                            </DropdownMenuItem>
                        </Link>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
