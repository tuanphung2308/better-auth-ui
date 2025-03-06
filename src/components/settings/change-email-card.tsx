"use client"

import { useContext, useEffect, useRef } from "react"
import { toast } from "sonner"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"

import { SettingsCard, type SettingsCardClassNames } from "./settings-card"

export function ChangeEmailCard({
    className,
    classNames,
    isPending,
    localization
}: {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    localization?: Partial<AuthLocalization>
}) {
    const shownVerifyEmailToast = useRef(false)

    const {
        authClient,
        hooks: { useSession },
        localization: authLocalization
    } = useContext(AuthUIContext)
    localization = { ...authLocalization, ...localization }

    const {
        data: sessionData,
        isPending: sessionPending,
        refetch
    } = useSession()

    useEffect(() => {
        if (!sessionData) return
        if (shownVerifyEmailToast.current) return

        const searchParams = new URLSearchParams(window.location.search)
        if (
            searchParams.get("verifyEmail") &&
            !sessionData.user.emailVerified
        ) {
            shownVerifyEmailToast.current = true
            setTimeout(() => toast(localization?.emailVerification))
        }
    }, [localization, sessionData])

    const formAction = async (formData: FormData) => {
        const newEmail = (formData.get("email") as string) || ""
        if (newEmail === sessionData?.user.email) return {}

        const callbackURL = `${window.location.pathname}?verifyEmail=true`

        const { error } = await authClient.changeEmail({
            newEmail,
            callbackURL
        })

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
            field="email"
            formAction={formAction}
            instructions={localization.emailInstructions}
            isPending={isPending || sessionPending}
            label={localization.email}
            localization={localization}
            placeholder={localization.emailPlaceholder}
        />
    )
}
