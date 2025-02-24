"use client"

import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"

import { SettingsCard, type SettingsCardClassNames } from "./settings-card"
import type { settingsLocalization } from "./settings-cards"

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
    const { data: sessionData } = authClient.useSession()

    const formAction = async (formData: FormData) => {
        const email = formData.get("email") as string || ""

        if (email == sessionData?.user.email) return {}

        const { error } = await authClient.changeEmail({
            newEmail: email,
            callbackURL: window.location.href.replace(window.location.origin, "")
        })

        return { error }
    }

    return (
        <SettingsCard
            key={sessionData?.user.email}
            className={className}
            classNames={classNames}
            defaultValue={sessionData?.user.email}
            formAction={formAction}
            localization={localization}
            name="email"
        />
    )
}