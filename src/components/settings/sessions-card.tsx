"use client"

import { LaptopIcon, Loader2, SmartphoneIcon } from "lucide-react"
import { useContext, useState } from "react"
import { UAParser } from "ua-parser-js"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

import type { Session } from "better-auth"
import { getErrorMessage } from "../../lib/get-error-message"
import type { SettingsCardClassNames } from "./settings-card"
import { ProvidersCardSkeleton } from "./skeletons/providers-card-skeleton"

export interface SessionsCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
    sessions?: Session[] | null
    skipHook?: boolean
    refetch?: () => Promise<void>
}

export function SessionsCard({
    className,
    classNames,
    isPending,
    localization,
    sessions,
    skipHook,
    refetch
}: SessionsCardProps) {
    const {
        hooks: { useListSessions, useSession },
        mutators: { revokeSession },
        localization: authLocalization,
        navigate,
        toast,
        basePath,
        viewPaths
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    if (!skipHook) {
        const result = useListSessions()
        sessions = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    const { data: sessionData } = useSession()

    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const handleRevoke = async (token: string) => {
        if (token === sessionData?.session?.token) {
            navigate(`${basePath}/${viewPaths.signOut}`)
            return
        }

        setActionLoading(token)

        try {
            await revokeSession({ token })
            refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
            setActionLoading(null)
        }
    }

    if (isPending) {
        return <ProvidersCardSkeleton className={className} classNames={classNames} />
    }

    return (
        <Card className={cn("w-full", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization.sessions}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {localization.sessionsDescription}
                </CardDescription>
            </CardHeader>

            <CardContent className={cn("flex flex-col gap-4", classNames?.content)}>
                {sessions?.map((session) => {
                    const parser = UAParser(session.userAgent as string)

                    const isButtonLoading = actionLoading === session.token

                    return (
                        <Card
                            key={session.id}
                            className={cn(
                                "flex-row items-center gap-3 px-4 py-3",
                                classNames?.cell
                            )}
                        >
                            {parser.device.type === "mobile" ? (
                                <SmartphoneIcon className="size-4" />
                            ) : (
                                <LaptopIcon className="size-4" />
                            )}

                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">
                                    {session.id === sessionData?.session?.id
                                        ? localization.currentSession
                                        : session?.ipAddress}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                    {parser.os.name}, {parser.browser.name}
                                </span>
                            </div>

                            <Button
                                className={cn("relative ms-auto", classNames?.button)}
                                disabled={isButtonLoading}
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    handleRevoke(session.token)
                                }}
                            >
                                <span className={isButtonLoading ? "opacity-0" : "opacity-100"}>
                                    {session.id === sessionData?.session?.id
                                        ? localization.signOut
                                        : localization.revoke}
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
        </Card>
    )
}
