"use client"

import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"

import { type SettingsCardClassNames } from "./settings-card"
import { UpdateFieldCard } from "./update-field-card"

export function UpdateNameCard({
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
    const { hooks: { useSession }, localization: authLocalization, nameRequired } = useContext(AuthUIContext)
    localization = { ...authLocalization, ...localization }

    const { data: sessionData } = useSession()

    return (
        <UpdateFieldCard
            key={sessionData?.user.name}
            className={className}
            classNames={classNames}
            defaultValue={sessionData?.user.name}
            description={localization.nameDescription}
            instructions={localization.nameInstructions}
            isPending={isPending}
            label={localization.name}
            localization={localization}
            name="name"
            placeholder={localization.namePlaceholder}
            required={nameRequired}
        />
    )
}