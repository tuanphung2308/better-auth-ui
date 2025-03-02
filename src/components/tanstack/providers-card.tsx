"use client"

import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { ProvidersCardPrimitive } from "../primitives/settings/providers-card-primitive"
import type { SettingsCardClassNames } from "../settings/settings-card"
import { settingsLocalization } from "../settings/settings-cards"

export function ProvidersCard({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    localization?: Partial<typeof settingsLocalization>
}) {
    const { authClient } = useContext(AuthUIContext)
    const { useListAccounts } = createAuthHooks(authClient)

    const { accounts, isPending, unlinkAccount } = useListAccounts()

    return (
        <ProvidersCardPrimitive
            accounts={accounts}
            className={className}
            classNames={classNames}
            isPending={isPending}
            localization={localization}
            optimistic
            unlinkAccount={unlinkAccount}
        />
    )
}