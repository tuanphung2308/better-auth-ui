"use client"

import type { Session, User } from "better-auth"
import { useContext } from "react"

import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import { CardContent } from "../../ui/card"
import { SettingsCard } from "../shared/settings-card"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { SettingsCellSkeleton } from "../skeletons/settings-cell-skeleton"
import { AccountCell } from "./account-cell"

export interface AccountsCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    deviceSessions?: { user: User; session: Session }[] | null
    isPending?: boolean
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
        hooks: { useListDeviceSessions },
        localization: contextLocalization,
        viewPaths,
        navigate
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    if (!skipHook) {
        const result = useListDeviceSessions()
        deviceSessions = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            title={localization.accounts}
            description={localization.accountsDescription}
            actionLabel={localization.addAccount}
            instructions={localization.accountsInstructions}
            isPending={isPending}
            action={() => navigate(`${basePath}/${viewPaths.signIn}`)}
        >
            <CardContent className={cn("grid gap-4", classNames?.content)}>
                {isPending ? (
                    <SettingsCellSkeleton classNames={classNames} />
                ) : (
                    deviceSessions?.map((deviceSession) => (
                        <AccountCell
                            key={deviceSession.session.id}
                            classNames={classNames}
                            deviceSession={deviceSession}
                            localization={localization}
                            refetch={refetch}
                        />
                    ))
                )}
            </CardContent>
        </SettingsCard>
    )
}
