"use client"

import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { ChangeEmailCardPrimitive } from "../primitives/settings/change-email-card-primitive"

import { type SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"

export function ChangeEmailCard({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    localization?: Partial<typeof settingsLocalization>
}) {
    const { authClient } = useContext(AuthUIContext)
    const { data: sessionData, isPending } = authClient.useSession()

    return (
        <ChangeEmailCardPrimitive
            className={className}
            classNames={classNames}
            isPending={isPending}
            localization={localization}
            user={sessionData?.user}
        />
    )
}