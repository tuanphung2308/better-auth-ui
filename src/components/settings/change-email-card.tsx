"use client"

import { useContext, useEffect, useRef } from "react"
import { toast } from "sonner"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"

import { cn } from "../../lib/utils"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
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
        hooks: { useSession },
        localization: authLocalization
    } = useContext(AuthUIContext)
    localization = { ...authLocalization, ...localization }

    const { data: sessionData, isPending: sessionPending, refetch } = useSession()

    useEffect(() => {
        if (!sessionData) return
        if (shownVerifyEmailToast.current) return

        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get("verifyEmail") && !sessionData.user.emailVerified) {
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
        <>
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

            {sessionData?.user && !sessionData?.user.emailVerified && (
                <Card className={classNames?.base}>
                    <CardHeader className={classNames?.header}>
                        <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                            {localization.verifyYourEmail}
                        </CardTitle>

                        <CardDescription className={classNames?.description}>
                            {localization.verifyYourEmailDescription}
                        </CardDescription>
                    </CardHeader>

                    <CardFooter
                        className={cn(
                            "border-t bg-muted dark:bg-transparent py-4 md:py-3 flex flex-col md:flex-row gap-4 justify-between",
                            classNames?.footer
                        )}
                    >
                        test
                    </CardFooter>
                </Card>
            )}
        </>
    )
}
