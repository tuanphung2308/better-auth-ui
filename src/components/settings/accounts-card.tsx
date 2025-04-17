"use client"

import type { Session, User } from "better-auth"
import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { CardContent } from "../ui/card"
import { AccountCell } from "./account-cell"
import type { SettingsCardClassNames } from "./shared/settings-card"
import { SettingsCard } from "./shared/settings-card"
import { SettingsCellSkeleton } from "./skeletons/settings-cell-skeleton"

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
        hooks: { useSession, useListDeviceSessions },
        localization: authLocalization,
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

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            title={localization.accounts}
            description={localization.accountsDescription}
            actionLabel={localization.addAccount}
            formAction={() => navigate(`${basePath}/${viewPaths.signIn}`)}
            instructions={localization.accountsInstructions}
            isPending={isPending}
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
                            activeSessionId={session?.id}
                            localization={localization}
                            refetch={refetch}
                        />
                    ))
                )}
            </CardContent>
        </SettingsCard>
    )
}
