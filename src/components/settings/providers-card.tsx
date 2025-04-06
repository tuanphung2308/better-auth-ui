"use client"
import { useContext, useEffect, useRef } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { socialProviders } from "../../lib/social-providers"
import { cn } from "../../lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

import { ProviderCard } from "./provider-card"
import type { SettingsCardClassNames } from "./settings-card"
import { ProvidersCardSkeleton } from "./skeletons/providers-card-skeleton"

export interface ProvidersCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { accountId: string; provider: string }[] | null
    isPending?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: Partial<AuthLocalization>
    skipHook?: boolean
    refetch?: () => void
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
        localization: authLocalization,
        providers,
        otherProviders,
        toast
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    if (!skipHook) {
        const result = useListAccounts()
        accounts = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    const hasRefetched = useRef(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("providerLinked") && !hasRefetched.current) {
            hasRefetched.current = true
            refetch?.()

            // Remove the parameter from URL
            params.delete("providerLinked")
            const query = params.toString()
            const url = `${window.location.pathname}${query ? `?${query}` : ""}`
            window.history.replaceState(null, "", url)
        }
    }, [refetch])

    if (isPending) {
        return <ProvidersCardSkeleton className={className} classNames={classNames} />
    }

    return (
        <Card className={cn("w-full", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization.providers}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {localization.providersDescription}
                </CardDescription>
            </CardHeader>

            <CardContent className={cn("flex flex-col gap-4", classNames?.content)}>
                {providers?.map((provider) => {
                    const socialProvider = socialProviders.find(
                        (socialProvider) => socialProvider.provider === provider
                    )
                    if (!socialProvider) return null

                    return (
                        <ProviderCard
                            key={provider}
                            classNames={classNames}
                            provider={socialProvider}
                            accounts={accounts}
                        />
                    )
                })}

                {otherProviders?.map((provider) => {
                    return (
                        <ProviderCard
                            key={provider.provider}
                            classNames={classNames}
                            provider={provider}
                            accounts={accounts}
                            other
                        />
                    )
                })}
            </CardContent>
        </Card>
    )
}
