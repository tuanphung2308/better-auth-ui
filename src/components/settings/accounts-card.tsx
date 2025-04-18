"use client"

import type { Session, User } from "better-auth"
import { useContext } from "react"
import { useForm } from "react-hook-form"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { CardContent } from "../ui/card"
import { Form } from "../ui/form"
import { AccountCell } from "./account-cell"
import { NewSettingsCard } from "./shared/new-settings-card"
import type { SettingsCardClassNames } from "./shared/settings-card"
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
        hooks: { useListDeviceSessions },
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

    const form = useForm()

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(() => navigate(`${basePath}/${viewPaths.signIn}`))}>
                <NewSettingsCard
                    className={className}
                    classNames={classNames}
                    title={localization.accounts}
                    description={localization.accountsDescription}
                    actionLabel={localization.addAccount}
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
                                    localization={localization}
                                    refetch={refetch}
                                />
                            ))
                        )}
                    </CardContent>
                </NewSettingsCard>
            </form>
        </Form>
    )
}
