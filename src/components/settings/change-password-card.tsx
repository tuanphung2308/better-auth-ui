"use client"

import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { PasswordInput } from "../password-input"
import { CardContent } from "../ui/card"
import { Label } from "../ui/label"
import type { SettingsCardClassNames } from "./settings-card"
import { SettingsCard } from "./settings-card"
import { InputFieldSkeleton } from "./skeletons/input-field-skeleton"

export interface ChangePasswordCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { provider: string }[] | null
    isPending?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
    skipHook?: boolean
}

export function ChangePasswordCard({
    className,
    classNames,
    accounts,
    isPending,
    localization,
    skipHook
}: ChangePasswordCardProps) {
    const {
        authClient,
        basePath,
        confirmPassword: confirmPasswordEnabled,
        hooks: { useSession, useListAccounts },
        localization: authLocalization,
        toast,
        viewPaths
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { data: sessionData } = useSession()

    if (!skipHook) {
        const result = useListAccounts()
        accounts = result.data
        isPending = result.isPending
    }

    const [disabled, setDisabled] = useState(true)

    const setPassword = async () => {
        const email = sessionData?.user.email
        if (!email) throw new Error("Email not found")

        await authClient.forgetPassword({
            email,
            redirectTo: `${basePath}/${viewPaths.resetPassword}`,
            fetchOptions: { throw: true }
        })

        toast({ variant: "success", message: localization.setPasswordEmailSent! })
    }

    const changePassword = async (formData: FormData) => {
        const currentPassword = formData.get("currentPassword") as string
        const newPassword = formData.get("newPassword") as string

        if (confirmPasswordEnabled) {
            const confirmPassword = formData.get("confirmPassword") as string
            if (newPassword !== confirmPassword && localization.passwordsDoNotMatch) {
                throw new Error(localization.passwordsDoNotMatch)
            }
        }

        await authClient.changePassword({
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
            fetchOptions: { throw: true }
        })

        toast({ variant: "success", message: localization.changePasswordSuccess! })
    }

    const credentialsLinked = accounts?.some((acc) => acc.provider === "credential")

    if (!isPending && !credentialsLinked) {
        return (
            <SettingsCard
                title={localization.changePassword}
                description={localization.setPasswordDescription}
                actionLabel={localization.setPassword}
                formAction={setPassword}
                isPending={isPending}
                className={className}
                classNames={classNames}
            />
        )
    }

    return (
        <SettingsCard
            title={localization.changePassword}
            description={localization.changePasswordDescription}
            actionLabel={localization.save}
            disabled={disabled}
            isPending={isPending}
            instructions={localization.changePasswordInstructions}
            className={className}
            classNames={classNames}
            formAction={changePassword}
        >
            <CardContent className={cn("grid gap-6", classNames?.content)}>
                {isPending || !accounts ? (
                    <>
                        <InputFieldSkeleton classNames={classNames} />
                        <InputFieldSkeleton classNames={classNames} />

                        {confirmPasswordEnabled && <InputFieldSkeleton classNames={classNames} />}
                    </>
                ) : (
                    <>
                        <div className="grid gap-2">
                            <Label className={classNames?.label} htmlFor="currentPassword">
                                {localization.currentPassword}
                            </Label>

                            <PasswordInput
                                id="currentPassword"
                                name="currentPassword"
                                className={classNames?.input}
                                autoComplete="current-password"
                                placeholder={localization.currentPasswordPlaceholder}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className={classNames?.label} htmlFor="newPassword">
                                {localization.newPassword}
                            </Label>

                            <PasswordInput
                                id="newPassword"
                                name="newPassword"
                                className={classNames?.input}
                                autoComplete="new-password"
                                placeholder={localization.newPasswordPlaceholder}
                                required
                                enableToggle
                                onChange={(e) => setDisabled(e.target.value === "")}
                            />
                        </div>

                        {confirmPasswordEnabled && (
                            <div className="grid gap-2">
                                <Label className={classNames?.label} htmlFor="confirmPassword">
                                    {localization.confirmPassword}
                                </Label>

                                <PasswordInput
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className={classNames?.input}
                                    autoComplete="current-password"
                                    placeholder={localization.confirmPasswordPlaceholder}
                                    required
                                    onChange={() => setDisabled(false)}
                                />
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </SettingsCard>
    )
}
