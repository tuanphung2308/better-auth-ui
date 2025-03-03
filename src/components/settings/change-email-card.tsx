"use client"

import { useContext, useEffect, useRef } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../lib/auth-ui-provider"

import { SettingsCard, type SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"

export function ChangeEmailCard({
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

    const shownVerifyEmailToast = useRef(false)

    const { authClient, hooks: { useSession } } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending, refetch } = useSession()

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
        const newEmail = formData.get("email") as string || ""
        if (newEmail == sessionData?.user.email) return {}

        const callbackURL = `${window.location.pathname}?verifyEmail=true`

        const { error } = await authClient.changeEmail({ newEmail, callbackURL })

        if (!error) {
            if (sessionData?.user.emailVerified) {
                toast(localization?.emailVerifyChange)
            } else {
                refetch()
            }
        }

        return { error }
    }

    return (
        <SettingsCard
            key={sessionData?.user.email}
            className={className}
            classNames={classNames}
            defaultValue={sessionData?.user?.email}
            description={localization.emailDescription}
            formAction={formAction}
            instructions={localization.emailInstructions}
            isPending={isPending || sessionPending}
            localization={localization}
            name="email"
            placeholder={localization.emailPlaceholder}
            title={localization.email}
        />
    )
}