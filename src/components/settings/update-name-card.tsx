"use client"

import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"

import { SettingsCard, type SettingsCardClassNames } from "./settings-card"
import type { settingsLocalization } from "./settings-cards"

export function UpdateNameCard({
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

    const formAction = async (formData: FormData) => {
        const name = formData.get("name") as string || ""

        if (name == sessionData?.user.name) return {}

        const { error } = await authClient.updateUser({
            name
        })

        return { error }
    }

    return (
        <SettingsCard
            key={sessionData?.user.name}
            className={className}
            classNames={classNames}
            defaultValue={sessionData?.user.name}
            formAction={formAction}
            localization={localization}
            name="name"
        />
    )
}