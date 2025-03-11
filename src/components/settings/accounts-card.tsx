"use client"
import { Loader2 } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"

import type { Session, User } from "better-auth"
import { useSession } from "../../hooks/use-session"
import { UserAvatar } from "../user-avatar"
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
    refetch?: () => void
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
        hooks,
        mutates: { revokeDeviceSession, setActiveSession },
        localization: authLocalization,
        optimistic,
        viewPaths,
        navigate
    } = useContext(AuthUIContext)
    const { useListDeviceSessions } = hooks

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
        if (!optimistic) setActionLoading(sessionToken)

        const { error } = await revokeDeviceSession({ sessionToken })

        if (error) {
            toast.error(error.message || error.statusText)
        } else {
            refetch?.()
        }

        setActionLoading(null)
    }

    const handleSetActiveSession = async (sessionToken: string) => {
        setActionLoading(sessionToken)

        const { error } = await setActiveSession({ sessionToken })

        if (error) {
            toast.error(error.message || error.statusText)
        } else {
            refetch?.()
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
        <Card className={cn("w-full overflow-hidden", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization.accounts}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {localization.accountsDescription}
                </CardDescription>
            </CardHeader>

            <CardContent className={cn("flex flex-col gap-3", classNames?.content)}>
                {deviceSessions?.map((deviceSession) => {
                    const isButtonLoading = actionLoading === deviceSession.session.token

                    return (
                        <Card
                            key={deviceSession.session.id}
                            className={cn("flex items-center gap-3 px-4 py-3", classNames?.cell)}
                        >
                            <div className="flex gap-2 items-center truncate">
                                <UserAvatar
                                    user={deviceSession.user}
                                    classNames={classNames?.avatar}
                                />

                                <div className="flex flex-col truncate">
                                    <div className="font-medium text-sm truncate">
                                        {deviceSession.user.name ||
                                            // @ts-ignore
                                            deviceSession.user.username ||
                                            deviceSession.user.email}
                                    </div>
                                    {(deviceSession.user.name ||
                                        // @ts-ignore
                                        deviceSession.user.username) && (
                                        <div className="text-muted-foreground !font-light text-xs truncate">
                                            {deviceSession.user.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                className={cn("ms-auto relative", classNames?.button)}
                                disabled={!!actionLoading}
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (actionLoading) return

                                    if (deviceSession.session.id === session?.id) {
                                        navigate(`${basePath}/${viewPaths.signOut}`)
                                        return
                                    }

                                    handleSetActiveSession(deviceSession.session.token)
                                }}
                            >
                                <span className={isButtonLoading ? "opacity-0" : "opacity-100"}>
                                    {deviceSession.session.id === session?.id
                                        ? localization.signOut
                                        : localization.switchAccount}
                                </span>

                                {isButtonLoading && (
                                    <span className="absolute">
                                        <Loader2 className="animate-spin" />
                                    </span>
                                )}
                            </Button>
                        </Card>
                    )
                })}
            </CardContent>

            <CardFooter
                className={cn(
                    "border-t bg-muted dark:bg-transparent py-4 md:py-3 flex flex-col md:flex-row gap-4 justify-between",
                    classNames?.footer
                )}
            >
                <CardDescription className={cn("text-xs md:text-sm", classNames?.instructions)}>
                    {localization.accountsInstructions}
                </CardDescription>

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
