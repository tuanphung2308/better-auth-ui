"use client"

import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"

import { type SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"
import { UpdateFieldCard } from "./update-field-card"

export function UpdateUsernameCard({
    className,
    classNames,
    isPending,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    isPending?: boolean,
    localization?: Partial<typeof settingsLocalization>
}) {
    localization = { ...settingsLocalization, ...localization }

    const { hooks: { useSession } } = useContext(AuthUIContext)
    const { data: sessionData } = useSession()

    // @ts-expect-error Optional plugin
    const defaultValue = sessionData?.user.displayUsername || sessionData?.user.username

    return (
        <UpdateFieldCard
            key={defaultValue}
            className={className}
            classNames={classNames}
            defaultValue={defaultValue}
            description={localization.usernameDescription}
            instructions={localization.usernameInstructions}
            isPending={isPending}
            localization={localization}
            name="username"
            placeholder={localization.usernamePlaceholder}
            title={localization.username}
        />
    )
}