"use client"

import { useContext, useEffect, useRef, useState } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"
import { SettingsCard, type SettingsCardClassNames } from "./settings-card"

export interface ChangeEmailCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    localization?: AuthLocalization
}

export function ChangeEmailCard({
    className,
    classNames,
    isPending,
    localization
}: ChangeEmailCardProps) {
    const shownVerifyEmailToast = useRef(false)

    const {
        authClient,
        emailVerification,
        hooks: { useSession },
        localization: authLocalization,
        toast
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { data: sessionData, isPending: sessionPending, refetch } = useSession()
    const [resendDisabled, setResendDisabled] = useState(false)
    const [disabled, setDisabled] = useState(true)

    useEffect(() => {
        if (!sessionData) return
        if (shownVerifyEmailToast.current) return

        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get("verifyEmail") && !sessionData.user.emailVerified) {
            shownVerifyEmailToast.current = true
            setTimeout(() => toast({ message: localization.emailVerification! }))
        }
    }, [localization, sessionData, toast])

    const changeEmail = async (formData: FormData) => {
        const newEmail = formData.get("email") as string
        if (newEmail === sessionData?.user.email) return {}

        const callbackURL = `${window.location.pathname}?verifyEmail=true`

        await authClient.changeEmail({
            newEmail,
            callbackURL,
            fetchOptions: { throw: true }
        })

        if (sessionData?.user.emailVerified) {
            toast({ message: localization.emailVerifyChange! })
        } else {
            refetch?.()
        }
    }

    const resendVerification = async () => {
        setResendDisabled(true)

        try {
            await authClient.sendVerificationEmail({
                email: sessionData!.user.email,
                fetchOptions: { throw: true }
            })
        } catch (error) {
            setResendDisabled(false)
            throw error
        }

        toast({ variant: "success", message: localization.emailVerification! })
    }

    return (
        <>
            <SettingsCard
                key={sessionData?.user.email}
                className={className}
                classNames={classNames}
                description={localization.emailDescription}
                formAction={changeEmail}
                instructions={localization.emailInstructions}
                isPending={isPending || sessionPending}
                title={localization.email}
                actionLabel={localization.save}
                disabled={disabled}
                localization={localization}
            >
                <CardContent className={classNames?.content}>
                    {isPending ? (
                        <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
                    ) : (
                        <Input
                            key={sessionData?.user.email}
                            className={classNames?.input}
                            defaultValue={sessionData?.user.email}
                            name="email"
                            placeholder={localization.emailPlaceholder}
                            required
                            type="email"
                            onChange={(e) =>
                                setDisabled(e.target.value === sessionData?.user.email)
                            }
                        />
                    )}
                </CardContent>
            </SettingsCard>

            {emailVerification && sessionData?.user && !sessionData?.user.emailVerified && (
                <SettingsCard
                    className={className}
                    classNames={classNames}
                    title={localization.verifyYourEmail}
                    description={localization.verifyYourEmailDescription}
                    actionLabel={localization.resendVerificationEmail}
                    formAction={resendVerification}
                    disabled={resendDisabled}
                />
            )}
        </>
    )
}
