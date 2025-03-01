import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { socialProviders } from "../../social-providers"
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
                    const socialProvider = socialProviders.find(socialProvider => socialProvider.provider === provider)
                    if (!socialProvider) return null
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
                                className="ms-auto"
                                size="sm"
                                variant={accounts.find(account => account.provider === socialProvider.provider) ? "secondary" : "default"}
                            >
                                {accounts.find(account => account.provider === socialProvider.provider) ? "Unlink" : "Link"}
                            </Button>
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    )
}