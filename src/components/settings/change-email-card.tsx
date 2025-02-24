"use client"

import { useContext, useEffect, useRef } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../lib/auth-ui-provider"

import { SettingsCard, type SettingsCardClassNames } from "./settings-card"
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
    const shownVerifyEmailToast = useRef(false)
    localization = { ...settingsLocalization, ...localization }

    const { authClient } = useContext(AuthUIContext)
    const { data: sessionData } = authClient.useSession()

    useEffect(() => {
        if (!sessionData) return
        if (shownVerifyEmailToast.current) return

        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get("verifyEmail") && !sessionData.user.emailVerified) {
            shownVerifyEmailToast.current = true
            setTimeout(() => toast(localization?.emailVerification))
        }
    }, [sessionData, localization])

    const formAction = async (formData: FormData) => {
        const email = formData.get("email") as string || ""

        if (email == sessionData?.user.email) return {}

        const { error } = await authClient.changeEmail({
            newEmail: email,
            callbackURL: window.location.href.replace(window.location.origin, "") + "?verifyEmail=true"
        })

        if (!error && sessionData?.user.emailVerified) {
            toast(localization?.emailVerifyChange)
        }

        return { error }
    }

    return (
        <SettingsCard
            key={sessionData?.user.email}
            className={className}
            classNames={classNames}
            defaultValue={sessionData?.user.email}
            description={localization.emailDescription}
            formAction={formAction}
            instructions={localization.emailInstructions}
            localization={localization}
            name="email"
            placeholder={localization.emailPlaceholder}
            title={localization.email}
        />
    )
}