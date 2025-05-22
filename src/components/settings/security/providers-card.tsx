"use client"

import { useContext } from "react"

import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { socialProviders } from "../../../lib/social-providers"
import { cn } from "../../../lib/utils"
import { CardContent } from "../../ui/card"
import { SettingsCard } from "../shared/settings-card"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { SettingsCellSkeleton } from "../skeletons/settings-cell-skeleton"
import { ProviderCell } from "./provider-cell"

export interface ProvidersCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { accountId: string; provider: string }[] | null
    isPending?: boolean
    localization?: Partial<AuthLocalization>
    skipHook?: boolean
    refetch?: () => Promise<void>
}

export function ProvidersCard({
    className,
    classNames,
    accounts,
    isPending,
    localization,
    skipHook,
    refetch
}: ProvidersCardProps) {
    const {
        hooks: { useListAccounts },
        localization: contextLocalization,
        otherProviders,
        providers
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    if (!skipHook) {
        const result = useListAccounts()
        accounts = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            title={localization.providers}
            description={localization.providersDescription}
            isPending={isPending}
        >
            <CardContent className={cn("grid gap-4", classNames?.content)}>
                {isPending ? (
                    <SettingsCellSkeleton classNames={classNames} />
                ) : (
                    <>
                        {providers?.map((provider) => {
                            const socialProvider = socialProviders.find(
                                (socialProvider) => socialProvider.provider === provider
                            )

                            if (!socialProvider) return null

                            return (
                                <ProviderCell
                                    key={provider}
                                    classNames={classNames}
                                    account={accounts?.find((acc) => acc.provider === provider)}
                                    provider={socialProvider}
                                    refetch={refetch}
                                />
                            )
                        })}

                        {otherProviders?.map((provider) => (
                            <ProviderCell
                                key={provider.provider}
                                classNames={classNames}
                                account={accounts?.find(
                                    (acc) => acc.provider === provider.provider
                                )}
                                provider={provider}
                                refetch={refetch}
                                other
                            />
                        ))}
                    </>
                )}
            </CardContent>
        </SettingsCard>
    )
}
