"use client"

import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"

import { type SettingsCardClassNames } from "./settings-card"
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
    localization?: Partial<AuthLocalization>
}) {
    const { hooks: { useSession }, localization: authLocalization } = useContext(AuthUIContext)
    localization = { ...authLocalization, ...localization }

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