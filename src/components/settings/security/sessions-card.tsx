"use client"
import { useContext } from "react"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import type { AuthLocalization } from "../../../lib/localization/auth-localization"
import { cn } from "../../../lib/utils"
import { CardContent } from "../../ui/card"
import { SettingsCard } from "../shared/settings-card"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { SettingsCellSkeleton } from "../skeletons/settings-cell-skeleton"
import { SessionCell } from "./session-cell"

export interface SessionsCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
}

export function SessionsCard({ className, classNames, localization }: SessionsCardProps) {
    const {
        hooks: { useListSessions },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: sessions, isPending, refetch } = useListSessions()

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            description={localization.sessionsDescription}
            isPending={isPending}
            title={localization.sessions}
        >
            <CardContent className={cn("grid gap-4", classNames?.content)}>
                {isPending ? (
                    <SettingsCellSkeleton classNames={classNames} />
                ) : (
                    sessions?.map((session) => (
                        <SessionCell
                            key={session.id}
                            classNames={classNames}
                            localization={localization}
                            session={session}
                            refetch={refetch}
                        />
                    ))
                )}
            </CardContent>
        </SettingsCard>
    )
}
