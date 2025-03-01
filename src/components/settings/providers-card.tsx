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

export default function ProvidersCard() {
    const { authClient, colorIcons, noColorIcons, providers } = useContext(AuthUIContext)
    const { data: sessionData } = authClient.useSession()
    const [accounts, setAccounts] = useState<{ id: string, provider: string }[]>([])

    const getAccounts = useCallback(async () => {
        const { data, error } = await authClient.listAccounts()

        if (error) {
            return toast.error(error.message || error.statusText)
        }

        if (data) {
            setAccounts(data)
        }
    }, [authClient])

    useEffect(() => {
        if (!sessionData) return

        getAccounts()
    }, [getAccounts, sessionData])

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
                    if (!socialProvider) return
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