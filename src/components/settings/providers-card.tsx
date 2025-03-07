"use client"

import type { SocialProvider } from "better-auth/social-providers"
import { Loader2 } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { socialProviders } from "../../lib/social-providers"
import { cn } from "../../lib/utils"
import type { FetchError } from "../../types/fetch-error"
import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../ui/card"

import type { SettingsCardClassNames } from "./settings-card"
import { ProvidersCardSkeleton } from "./skeletons/providers-card-skeleton"

export interface ProvidersCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    /** @internal */
    accounts?: { provider: string }[] | null
    isPending?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: Partial<AuthLocalization>
    /** @internal */
    refetch?: () => Promise<void>
    /** @internal */
    unlinkAccount?: (
        providerId: string
    ) => Promise<{ status?: boolean; code?: string; error?: FetchError | null }>
}

export function ProvidersCard({
    className,
    classNames,
    accounts,
    isPending,
    localization,
    refetch,
    unlinkAccount
}: ProvidersCardProps) {
    const {
        authClient,
        colorIcons,
        hooks,
        localization: authLocalization,
        noColorIcons,
        optimistic,
        providers
    } = useContext(AuthUIContext)
    const { useListAccounts } = hooks

    localization = { ...authLocalization, ...localization }

    if (isPending === undefined && accounts === undefined) {
        const result = useListAccounts()
        accounts = result.accounts
        isPending = result.isPending
        refetch = result.refetch
        unlinkAccount = result.unlinkAccount
    }

    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const hasShownLinkedToast = useRef(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get("providerLinked") && !hasShownLinkedToast.current) {
            hasShownLinkedToast.current = true
            setTimeout(() => {
                toast.success(localization.providerLinkSuccess)

                // Remove the parameter from URL
                params.delete("providerLinked")
                const query = params.toString()
                const url = `${window.location.pathname}${query ? `?${query}` : ""}`
                window.history.replaceState(null, "", url)
            }, 0)
        }
    }, [localization.providerLinkSuccess])

    const handleLink = async (provider: SocialProvider) => {
        setActionLoading(provider)
        const callbackURL = `${window.location.pathname}?providerLinked=true`
        const { error } = await authClient.linkSocial({ provider, callbackURL })

        if (error) {
            toast.error(error.message || error.statusText)
            setActionLoading(null)
        }
    }

    const handleUnlink = async (providerId: string) => {
        if (!unlinkAccount) return toast.error("unlinkAccount is not defined")

        setActionLoading(providerId)

        const { error } = await unlinkAccount(providerId)

        if (error) {
            toast.error(error.message || error.statusText)
        } else {
            toast.success(localization.providerUnlinkSuccess)
            await refetch?.()
        }

        setActionLoading(null)
    }

    if (isPending) {
        return <ProvidersCardSkeleton className={className} />
    }

    return (
        <Card className={cn("w-full", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle
                    className={cn("text-lg md:text-xl", classNames?.title)}
                >
                    {localization.providers}
                </CardTitle>

                <CardDescription
                    className={cn(
                        "text-xs md:text-sm",
                        classNames?.description
                    )}
                >
                    {localization.providersDescription}
                </CardDescription>
            </CardHeader>

            <CardContent
                className={cn("flex flex-col gap-3", classNames?.content)}
            >
                {providers?.map((provider) => {
                    const socialProvider = socialProviders.find(
                        (socialProvider) => socialProvider.provider === provider
                    )
                    if (!socialProvider) return null

                    const isLinked = accounts?.some(
                        (acc) => acc.provider === socialProvider.provider
                    )
                    const isButtonLoading =
                        actionLoading === provider || actionLoading === provider

                    return (
                        <Card
                            key={provider}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3",
                                classNames?.cell
                            )}
                        >
                            {colorIcons ? (
                                <socialProvider.icon className="size-4" color />
                            ) : noColorIcons ? (
                                <socialProvider.icon className="size-4" />
                            ) : (
                                <>
                                    <socialProvider.icon
                                        className="size-4 dark:hidden"
                                        color
                                    />
                                    <socialProvider.icon className="size-4 hidden dark:block" />
                                </>
                            )}

                            <span className="text-sm">
                                {socialProvider.name}
                            </span>

                            <Button
                                className={cn(
                                    "ms-auto relative",
                                    classNames?.button
                                )}
                                disabled={isButtonLoading}
                                size="sm"
                                type="button"
                                variant={isLinked ? "outline" : "default"}
                                onClick={() => {
                                    if (actionLoading) return

                                    if (isLinked) {
                                        handleUnlink(provider)
                                    } else {
                                        handleLink(provider)
                                    }
                                }}
                            >
                                <span
                                    className={
                                        isButtonLoading
                                            ? "opacity-0"
                                            : "opacity-100"
                                    }
                                >
                                    {isLinked
                                        ? localization.unlink
                                        : localization.link}
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
