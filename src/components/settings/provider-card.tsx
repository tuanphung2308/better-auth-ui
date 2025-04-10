"use client"

import type { SocialProvider } from "better-auth/social-providers"
import { Loader2 } from "lucide-react"
import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

import type { Provider } from "../../lib/social-providers"
import type { AuthClient } from "../../types/auth-client"
import type { FetchError } from "../../types/fetch-error"
import type { SettingsCardClassNames } from "./settings-card"

export interface ProviderCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { accountId: string; provider: string }[] | null
    isPending?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: Partial<AuthLocalization>
    other?: boolean
    provider: Provider
    refetch?: () => void
}

export function ProviderCard({
    className,
    classNames,
    accounts,
    localization,
    other,
    provider,
    refetch
}: ProviderCardProps) {
    const {
        authClient,
        colorIcons,
        mutators: { unlinkAccount },
        localization: authLocalization,
        noColorIcons,
        toast
    } = useContext(AuthUIContext)

    const account = accounts?.find((acc) => acc.provider === provider.provider)
    const isLinked = !!account

    localization = { ...authLocalization, ...localization }

    const [isLoading, setIsLoading] = useState(false)

    const handleLink = async () => {
        setIsLoading(true)
        const callbackURL = `${window.location.pathname}?providerLinked=true`

        if (other) {
            const { error } = await (authClient as AuthClient).oauth2.link({
                providerId: provider.provider as SocialProvider,
                callbackURL
            })

            if (error) {
                toast({
                    variant: "error",
                    message: error.message || error.statusText || localization.requestFailed
                })
            }
        } else {
            const { error } = await authClient.linkSocial({
                provider: provider.provider as SocialProvider,
                callbackURL
            })

            if (error) {
                toast({
                    variant: "error",
                    message: error.message || error.statusText || localization.requestFailed
                })
            }
        }

        setIsLoading(false)
    }

    const handleUnlink = async () => {
        setIsLoading(true)

        try {
            await unlinkAccount({
                accountId: account?.accountId,
                providerId: provider.provider
            })
            refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message:
                    (error as Error).message ||
                    (error as FetchError).statusText ||
                    localization.requestFailed
            })
            setIsLoading(false)
        }
    }

    return (
        <Card className={cn("flex-row items-center gap-3 px-4 py-3", className, classNames?.cell)}>
            {provider.icon &&
                (colorIcons ? (
                    <provider.icon className="size-4" variant="color" />
                ) : noColorIcons ? (
                    <provider.icon className="size-4" />
                ) : (
                    <>
                        <provider.icon className="size-4 dark:hidden" variant="color" />
                        <provider.icon className="hidden size-4 dark:block" />
                    </>
                ))}

            <span className="text-sm">{provider.name}</span>

            <Button
                className={cn("relative ms-auto", classNames?.button)}
                disabled={isLoading}
                size="sm"
                type="button"
                variant={isLinked ? "outline" : "default"}
                onClick={() => {
                    if (isLoading) return

                    if (isLinked) {
                        handleUnlink()
                    } else {
                        handleLink()
                    }
                }}
            >
                <span className={isLoading ? "opacity-0" : "opacity-100"}>
                    {isLinked ? localization.unlink : localization.link}
                </span>

                {isLoading && (
                    <span className="absolute">
                        <Loader2 className="animate-spin" />
                    </span>
                )}
            </Button>
        </Card>
    )
}
