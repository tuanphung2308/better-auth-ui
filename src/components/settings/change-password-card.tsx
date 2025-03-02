"use client"

import { useContext } from "react"

import { useListAccounts } from "../../hooks/use-list-accounts"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { ChangePasswordCardPrimitive } from "../primitives/settings/change-password-card-primitive"

import type { SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"

export function ChangePasswordCard({
    className,
    classNames,
    localization
}: {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<typeof settingsLocalization>
}) {
    const { authClient } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = authClient.useSession()
    const { accounts, isPending: accountsPending } = useListAccounts()

    return (
        <ChangePasswordCardPrimitive
            accounts={accounts}
            className={className}
            classNames={classNames}
            isPending={sessionPending || accountsPending}
            localization={localization}
            user={sessionData?.user}
        />
    )
}