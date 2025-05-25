"use client"

import { useContext } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import type { SettingsCardProps } from "../shared/settings-card"
import { UpdateFieldCard } from "./update-field-card"

export function UpdateUsernameCard({
    className,
    classNames,
    localization,
    ...props
}: SettingsCardProps) {
    const {
        hooks: { useSession },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: sessionData } = useSession()
    const value = sessionData?.user.displayUsername || sessionData?.user.username

    return (
        <UpdateFieldCard
            className={className}
            classNames={classNames}
            value={value}
            description={localization.usernameDescription}
            name="username"
            instructions={localization.usernameInstructions}
            label={localization.username}
            localization={localization}
            placeholder={localization.usernamePlaceholder}
            required
            {...props}
        />
    )
}
