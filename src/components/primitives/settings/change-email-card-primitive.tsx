"use client"

import { useContext, useEffect, useRef } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import type { User } from "../../../types/user"
import { SettingsCard, type SettingsCardClassNames } from "../../settings/settings-card"
import { settingsLocalization } from "../../settings/settings-cards"

export function ChangeEmailCardPrimitive({
    className,
    classNames,
    isPending,
    localization,
    refetch,
    user
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    isPending?: boolean,
    localization?: Partial<typeof settingsLocalization>
    refetch?: () => Promise<unknown>
    user?: User
}) {
    const shownVerifyEmailToast = useRef(false)
    localization = { ...settingsLocalization, ...localization }

    const { authClient } = useContext(AuthUIContext)

    useEffect(() => {
        if (!user) return
        if (shownVerifyEmailToast.current) return

        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get("verifyEmail") && !user.emailVerified) {
            shownVerifyEmailToast.current = true
            setTimeout(() => toast(localization?.emailVerification))
        }
    }, [user, localization])

    const formAction = async (formData: FormData) => {
        const newEmail = formData.get("email") as string || ""
        if (newEmail == user?.email) return {}

        const callbackURL = `${window.location.pathname}?verifyEmail=true`

        const { error } = await authClient.changeEmail({ newEmail, callbackURL })

        if (!error) {
            if (user?.emailVerified) {
                toast(localization?.emailVerifyChange)
            } else {
                refetch?.()
            }
        }

        return { error }
    }

    return (
        <SettingsCard
            key={user?.email}
            className={className}
            classNames={classNames}
            defaultValue={user?.email}
            description={localization.emailDescription}
            formAction={formAction}
            instructions={localization.emailInstructions}
            isPending={isPending}
            localization={localization}
            name="email"
            placeholder={localization.emailPlaceholder}
            title={localization.email}
        />
    )
}