"use client"

import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { ChangePasswordCardPrimitive } from "../primitives/settings/change-password-card-primitive"
import type { SettingsCardClassNames } from "../settings/settings-card"
import { settingsLocalization } from "../settings/settings-cards"

export function ChangePasswordCard({
    className,
    classNames,
    localization,
}: {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<typeof settingsLocalization>
}) {
    const { authClient } = useContext(AuthUIContext)
    const { useSession, useListAccounts } = createAuthHooks(authClient)

    const { user, isPending: sessionPending } = useSession()
    const { accounts, isPending: accountsPending } = useListAccounts()

    return (
        <ChangePasswordCardPrimitive
            accounts={accounts}
            className={className}
            classNames={classNames}
            isPending={sessionPending || accountsPending}
            localization={localization}
            user={user}
        />
    )
}