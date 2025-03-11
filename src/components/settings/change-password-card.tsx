"use client"

import { Loader2 } from "lucide-react"
import { useActionState, useContext, useState } from "react"
import { toast } from "sonner"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

import type { SettingsCardClassNames } from "./settings-card"
import { ChangePasswordCardSkeleton } from "./skeletons/change-password-card-skeleton"

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
        hooks: { useSession, useListAccounts },
        localization: authLocalization,
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
    const [isSetPasswordLoading, setIsSetPasswordLoading] = useState(false)

    const handleSetPassword = async () => {
        const email = sessionData?.user.email

        if (!email) {
            toast.error("Email not found")
            return
        }

        setIsSetPasswordLoading(true)

        const { error } = await authClient.forgetPassword({
            email,
            redirectTo: `${basePath}/${viewPaths.resetPassword}`
        })

        setIsSetPasswordLoading(false)

        if (error) {
            toast.error(error.message || error.statusText)
        } else {
            toast.success(localization.setPasswordEmailSent)
        }
    }

    const formAction = async (_: unknown, formData: FormData) => {
        const currentPassword = formData.get("currentPassword") as string
        const newPassword = formData.get("newPassword") as string

        const { error } = await authClient.changePassword({
            currentPassword,
            newPassword,
            revokeOtherSessions: true
        })

        if (error) {
            toast.error(error.message || error.statusText)
        } else {
            toast.success(localization.changePasswordSuccess)
        }
    }

    const [_, action, isSubmitting] = useActionState(formAction, null)

    if (isPending || !accounts) {
        return <ChangePasswordCardSkeleton className={className} classNames={classNames} />
    }

    const credentialsLinked = accounts.some((acc) => acc.provider === "credential")

    if (!credentialsLinked) {
        return (
            <Card className={cn("w-full overflow-hidden", className, classNames?.base)}>
                <CardHeader className={classNames?.header}>
                    <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.changePassword}
                    </CardTitle>

                    <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                        {localization.setPasswordDescription}
                    </CardDescription>
                </CardHeader>

                <CardFooter
                    className={cn(
                        "border-t bg-muted dark:bg-transparent py-4 md:py-3 flex justify-center md:justify-end",
                        classNames?.footer
                    )}
                >
                    <Button disabled={isSetPasswordLoading} size="sm" onClick={handleSetPassword}>
                        <span className={cn(isSetPasswordLoading && "opacity-0")}>
                            {localization.setPassword}
                        </span>

                        {isSetPasswordLoading && (
                            <span className="absolute">
                                <Loader2 className="animate-spin" />
                            </span>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className={cn("w-full overflow-hidden", className, classNames?.base)}>
            <form action={action}>
                <CardHeader className={classNames?.header}>
                    <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.changePassword}
                    </CardTitle>

                    <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                        {localization.changePasswordDescription}
                    </CardDescription>
                </CardHeader>

                <CardContent className={cn("grid gap-4", classNames?.content)}>
                    <div className="grid gap-2">
                        <Label className={classNames?.label} htmlFor="currentPassword">
                            {localization.currentPassword}
                        </Label>

                        <Input
                            autoComplete="current-password"
                            className={classNames?.input}
                            id="currentPassword"
                            name="currentPassword"
                            placeholder={localization.currentPasswordPlaceholder}
                            required
                            type="password"
                            onChange={() => setDisabled(false)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className={classNames?.label} htmlFor="newPassword">
                            {localization.newPassword}
                        </Label>

                        <Input
                            autoComplete="new-password"
                            className={classNames?.input}
                            id="newPassword"
                            name="newPassword"
                            placeholder={localization.newPasswordPlaceholder}
                            required
                            type="password"
                            onChange={() => setDisabled(false)}
                        />
                    </div>
                </CardContent>

                <CardFooter
                    className={cn(
                        "border-t bg-muted dark:bg-transparent py-4 md:py-3 flex flex-col md:flex-row gap-4 justify-between",
                        classNames?.footer
                    )}
                >
                    <CardDescription className={cn("text-xs md:text-sm", classNames?.instructions)}>
                        {localization.changePasswordInstructions}
                    </CardDescription>

                    <Button
                        className={classNames?.button}
                        disabled={disabled || isSubmitting}
                        size="sm"
                    >
                        <span className={cn(isSubmitting && "opacity-0")}>{localization.save}</span>

                        {isSubmitting && (
                            <span className="absolute">
                                <Loader2 className="animate-spin" />
                            </span>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
