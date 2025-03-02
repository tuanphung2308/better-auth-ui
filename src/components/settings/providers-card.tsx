"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { ProvidersCardPrimitive } from "../primitives/settings/providers-card-primitive"

import type { SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"

export function ProvidersCard({
    className,
    classNames,
    accounts: accountsProp,
    isPending,
    localization
}: {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { id: string, provider: string }[] | null
    isPending?: boolean
    localization?: Partial<typeof settingsLocalization>
}) {
    localization = { ...settingsLocalization, ...localization }

    const { authClient } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    const [accounts, setAccounts] = useState<{ id: string, provider: string }[] | null>(null)
    const [accountsPending, setAccountsPending] = useState(false)

    const getAccounts = useCallback(async () => {
        if (!accounts) setAccountsPending(true)

        const { data, error } = await authClient.listAccounts()

        if (error) toast.error(error.message || error.statusText)

        setAccounts(data)
        setAccountsPending(false)
    }, [authClient, accounts])

    useEffect(() => {
        if (!sessionData || isPending || accountsProp) return

        getAccounts()
    }, [getAccounts, isPending, sessionData, accountsProp])

    return (
        <ProvidersCardPrimitive
            accounts={accounts}
            className={className}
            classNames={classNames}
            isPending={accountsPending}
            localization={localization}
        />
    )
}