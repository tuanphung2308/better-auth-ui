"use client"

import { EllipsisIcon, Loader2, LogOutIcon, RepeatIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"

import type { Session, User } from "better-auth"
import type { FetchError } from "../../types/fetch-error"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { UserView } from "../user-view"
import type { SettingsCardClassNames } from "./settings-card"
import { ProvidersCardSkeleton } from "./skeletons/providers-card-skeleton"

export interface AccountsCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    deviceSessions?: { user: User; session: Session }[] | null
    isPending?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: Partial<AuthLocalization>
    skipHook?: boolean
    refetch?: () => Promise<void>
}

export function AccountsCard({
    className,
    classNames,
    deviceSessions,
    isPending,
    localization,
    skipHook,
    refetch
}: AccountsCardProps) {
    const {
        basePath,
        hooks: { useSession, useListDeviceSessions },
        mutators: { revokeDeviceSession, setActiveSession },
        localization: authLocalization,
        toast,
        viewPaths,
        navigate
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    if (!skipHook) {
        const result = useListDeviceSessions()
        deviceSessions = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    const { data: sessionData } = useSession()
    const session = sessionData?.session

    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const handleRevoke = async (sessionToken: string) => {
        setActionLoading(sessionToken)

        try {
            await revokeDeviceSession({ sessionToken })
            refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message:
                    (error as Error).message ||
                    (error as FetchError).statusText ||
                    localization.requestFailed
            })
            setActionLoading(null)
        }
    }

    const handleSetActiveSession = async (sessionToken: string) => {
        setActionLoading(sessionToken)

        try {
            await setActiveSession({ sessionToken })
            refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message:
                    (error as Error).message ||
                    (error as FetchError).statusText ||
                    localization.requestFailed
            })
            setActionLoading(null)
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (actionLoading) window.scrollTo({ top: 0 })

        setActionLoading(null)
    }, [session])

    if (isPending) {
        return <ProvidersCardSkeleton className={className} classNames={classNames} />
    }

    return (
        <Card className={cn("w-full pb-0", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization.accounts}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {localization.accountsDescription}
                </CardDescription>
            </CardHeader>

            <CardContent className={cn("flex flex-col gap-4", classNames?.content)}>
                {deviceSessions?.map((deviceSession) => {
                    const isButtonLoading = actionLoading === deviceSession.session.token

                    return (
                        <Card
                            key={deviceSession.session.id}
                            className={cn("flex-row p-4", classNames?.cell)}
                        >
                            <div className="flex items-center gap-2 truncate">
                                <UserView user={deviceSession.user} />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className={cn("relative ms-auto", classNames?.button)}
                                        disabled={!!actionLoading}
                                        size="icon"
                                        type="button"
                                        variant="outline"
                                    >
                                        <span
                                            className={
                                                isButtonLoading ? "opacity-0" : "opacity-100"
                                            }
                                        >
                                            <EllipsisIcon />
                                        </span>

                                        {isButtonLoading && (
                                            <span className="absolute">
                                                <Loader2 className="animate-spin" />
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent>
                                    {deviceSession.session.id !== session?.id && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                handleSetActiveSession(deviceSession.session.token)
                                            }
                                        >
                                            <RepeatIcon />

                                            {localization.switchAccount}
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (deviceSession.session.id === session?.id) {
                                                navigate(`${basePath}/${viewPaths.signOut}`)
                                                return
                                            }

                                            handleRevoke(deviceSession.session.token)
                                        }}
                                    >
                                        <LogOutIcon />

                                        {deviceSession.session.id === session?.id
                                            ? localization.signOut
                                            : localization.revoke}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Card>
                    )
                })}
            </CardContent>

            <CardFooter
                className={cn(
                    "flex-col justify-between gap-4 rounded-b-xl border-t bg-muted pb-6 md:flex-row dark:bg-transparent",
                    classNames?.footer
                )}
            >
                <span
                    className={cn(
                        "text-muted-foreground text-xs md:text-sm",
                        classNames?.instructions
                    )}
                >
                    {localization.accountsInstructions}
                </span>

                <Button
                    className={classNames?.button}
                    size="sm"
                    onClick={() => navigate(`${basePath}/${viewPaths.signIn}`)}
                >
                    {localization.addAccount}
                </Button>
            </CardFooter>
        </Card>
    )
}
