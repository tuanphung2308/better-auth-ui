"use client"

import type { Session } from "better-auth"
import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { CardContent } from "../ui/card"
import { SessionCell } from "./session-cell"
import { SettingsCard } from "./shared/settings-card"
import type { SettingsCardClassNames } from "./shared/settings-card"
import { SettingsCellSkeleton } from "./skeletons/settings-cell-skeleton"

export interface SessionsCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    localization?: Partial<AuthLocalization>
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
        hooks: { useListSessions },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    if (!skipHook) {
        const result = useListSessions()
        sessions = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            title={localization.sessions}
            description={localization.sessionsDescription}
            isPending={isPending}
        >
            <CardContent className={cn("grid gap-4", classNames?.content)}>
                {isPending ? (
                    <SettingsCellSkeleton classNames={classNames} />
                ) : (
                    sessions?.map((session) => (
                        <SessionCell
                            key={session.id}
                            classNames={classNames}
                            session={session}
                            localization={localization}
                            refetch={refetch}
                        />
                    ))
                )}
            </CardContent>
        </SettingsCard>
    )
}
