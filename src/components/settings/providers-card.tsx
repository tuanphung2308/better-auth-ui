"use client"

import { Loader2 } from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { type SocialProvider, socialProviders } from "../../social-providers"
import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../ui/card"

import ProvidersCardSkeleton from "./skeletons/providers-card-skeleton"

export default function ProvidersCard() {
    const { authClient, colorIcons, noColorIcons, providers } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [accounts, setAccounts] = useState<{ id: string, provider: string }[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const getAccounts = useCallback(async () => {
        setIsLoading(true)
        const { data, error } = await authClient.listAccounts()

        if (error) {
            toast.error(error.message || error.statusText)
        } else if (data) {
            setAccounts(data)
        }

        setIsLoading(false)
    }, [authClient])

    useEffect(() => {
        if (!sessionData) return

        getAccounts()
    }, [getAccounts, sessionData])

    const handleLink = async (provider: SocialProvider) => {
        setActionLoading(provider)
        const callbackURL = window.location.pathname
        const { error } = await authClient.linkSocial({ provider, callbackURL })

        if (error) {
            toast.error(error.message || error.statusText)
            setActionLoading(null)
        }
    }

    const handleUnlink = async (providerId: string) => {
        setActionLoading(providerId)
        const { error } = await authClient.unlinkAccount({ providerId })

        if (error) {
            toast.error(error.message || error.statusText)
        } else {
            await getAccounts()
            toast.success("Provider successfully unlinked")
        }

        setActionLoading(null)
    }

    if (sessionPending || isLoading) {
        return <ProvidersCardSkeleton />
    }

    return (
        <Card className="max-w-lg w-full">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                    Providers
                </CardTitle>

                <CardDescription className="text-xs md:text-sm">
                    Connect your Account with a third-party service.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                {providers?.map((provider) => {
                    const socialProvider = socialProviders.find(sp => sp.provider === provider)
                    if (!socialProvider) return null
                    const isLinked = accounts.some(acc => acc.provider === socialProvider.provider)
                    const isButtonLoading = actionLoading === provider || actionLoading === accounts.find(acc => acc.provider === provider)?.provider

                    return (
                        <Card key={provider} className="flex items-center gap-3 px-4 py-3">
                            {colorIcons ? (
                                <socialProvider.icon className="size-4" color />
                            ) : noColorIcons ? (
                                <socialProvider.icon className="size-4" />
                            ) : (
                                <>
                                    <socialProvider.icon className="size-4 dark:hidden" color />
                                    <socialProvider.icon className="size-4 hidden dark:block" />
                                </>
                            )}

                            <span className="text-sm">
                                {socialProvider.name}
                            </span>

                            <Button
                                className="ms-auto relative"
                                disabled={isButtonLoading}
                                size="sm"
                                type="button"
                                variant={isLinked ? "secondary" : "default"}
                                onClick={() => {
                                    if (actionLoading) return

                                    if (isLinked) {
                                        handleUnlink(accounts.find(acc => acc.provider === provider)!.provider)
                                    } else {
                                        handleLink(provider)
                                    }
                                }}
                            >
                                <span className={isButtonLoading ? "opacity-0" : "opacity-100"}>
                                    {isLinked ? "Unlink" : "Link"}
                                </span>

                                {isButtonLoading && (
                                    <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin" />
                                )}
                            </Button>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    )
}