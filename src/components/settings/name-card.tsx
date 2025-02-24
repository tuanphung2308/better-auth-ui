"use client"

import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"

import { SettingsCard, type SettingsCardClassNames } from "./settings-card"
import type { settingsLocalization } from "./settings-cards"

export function NameCard({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    localization?: Partial<typeof settingsLocalization>
}) {
    const { authClient } = useContext(AuthUIContext)
    const { data: sessionData } = authClient.useSession()

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            defaultValue={sessionData?.user.name}
            localization={localization}
            name="name"
        />
    )
}