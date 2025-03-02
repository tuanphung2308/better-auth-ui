"use client"

import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { DeleteAccountCardPrimitive } from "../primitives/settings/delete-account-card-primitive"
import type { SettingsCardClassNames } from "../settings/settings-card"
import { settingsLocalization } from "../settings/settings-cards"

export function DeleteAccountCard({
    className,
    classNames,
    localization
}: {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<typeof settingsLocalization>
}) {
    const { authClient } = useContext(AuthUIContext)
    const { useSession } = createAuthHooks(authClient)

    const { isPending: sessionPending } = useSession()

    return (
        <DeleteAccountCardPrimitive
            className={className}
            classNames={classNames}
            isPending={sessionPending}
            localization={localization}
        />
    )
}