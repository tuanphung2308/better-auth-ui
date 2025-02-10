"use client"

import { type createAuthClient } from "better-auth/react"
import {
    LogInIcon,
    LogOutIcon,
    PlusCircleIcon,
    SettingsIcon,
    UserRoundPlus
} from "lucide-react"
import { Fragment, useEffect, useState } from "react"

import { cn } from "../lib/utils"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "./ui/dropdown-menu"
import { Skeleton } from "./ui/skeleton"
import { UserAvatar } from "./user-avatar"

type User = {
    id?: unknown,
    email?: string | null,
    name?: string | null,
    firstName?: string | null,
    fullName?: string | null,
    isAnonymous?: boolean | null,
    image?: string | null,
    avatar?: string | null,
    avatarUrl?: string | null,
}

type AuthClient = ReturnType<typeof createAuthClient>
type SessionData = AuthClient["$Infer"]["Session"]

export function UserButton({
    className,
    authClient,
    authPath,
    avatarClassName,
    deviceSessions,
    isPending,
    multiSession,
    setActiveSession,
    user
}: {
    className?: string,
    authClient?: ReturnType<typeof createAuthClient>
    authPath?: string,
    avatarClassName?: string
    deviceSessions?: SessionData[],
    isPending?: boolean
    multiSession?: boolean,
    setActiveSession?: (sessionToken: string) => void,
    user?: User,
}) {
    const [currentUser, setCurrentUser] = useState<User | undefined>()
    user = user ?? currentUser

    const [currentIsPending, setCurrentIsPending] = useState(true)
    isPending = isPending ?? currentIsPending

    const [currentDeviceSessions, setCurrentDeviceSessions] = useState<SessionData[] | undefined>()
    deviceSessions = deviceSessions ?? currentDeviceSessions

    authPath = authPath ?? "/auth"

    if (authClient) {
        const { data: sessionData, isPending: sessionPending, refetch } = authClient.useSession()

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            setCurrentIsPending(sessionPending)
            setCurrentUser(sessionData?.user)
        }, [sessionData, sessionPending])

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (!user || !multiSession) return

            // @ts-expect-error Optional plugin
            authClient.multiSession.listDeviceSessions().then(({ data }) => {
                setCurrentDeviceSessions(data)
            })
        }, [user, authClient, multiSession])
    }

    //const { user, isPending } = useSession()
    //const { deviceSessions, setActiveSession, setActiveSessionPending } = useListDeviceSessions()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full">
                {(isPending) ? (
                    <Skeleton className={cn("size-8 rounded-full shadow-xs", className, avatarClassName, "bg-muted")} />
                ) : (
                    <UserAvatar className={cn("size-8", className, avatarClassName)} user={user} />
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent className="me-3" onCloseAutoFocus={(e) => e.preventDefault()}>
                {(user && !user.isAnonymous) ? (
                    <div className="flex gap-2 p-2 items-center">
                        <UserAvatar className={cn("size-8", avatarClassName)} user={user} />

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
                        <a href="/auth/login">
                            <DropdownMenuItem>
                                <LogInIcon />

                                Sign In
                            </DropdownMenuItem>
                        </a>

                        <a href="/auth/signup">
                            <DropdownMenuItem>
                                <UserRoundPlus />

                                Sign Up
                            </DropdownMenuItem>
                        </a>
                    </>
                ) : (
                    <>
                        <a href="/settings">
                            <DropdownMenuItem>
                                <SettingsIcon />

                                Settings
                            </DropdownMenuItem>
                        </a>

                        <a href="/auth/logout">
                            <DropdownMenuItem>
                                <LogOutIcon />

                                Sign Out
                            </DropdownMenuItem>
                        </a>
                    </>
                )}

                {user && multiSession && (
                    <>
                        <DropdownMenuSeparator />

                        {deviceSessions?.filter((sessionData) => sessionData.user.id !== user?.id)
                            .map(({ session, user }) => (
                                <Fragment key={session.id}>
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            if (setActiveSession) {
                                                setActiveSession(session.token)
                                            } else {
                                                // @ts-expect-error Optional plugin
                                                authClient?.multiSession.setActive({
                                                    sessionToken: session.token,
                                                })
                                            }
                                        }}
                                    >
                                        <div className="flex gap-2 items-center">
                                            <UserAvatar className={cn("size-8", avatarClassName)} user={user} />

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

                        <a href="/auth/login">
                            <DropdownMenuItem>
                                <PlusCircleIcon />

                                Add Account
                            </DropdownMenuItem>
                        </a>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu >
    )
}