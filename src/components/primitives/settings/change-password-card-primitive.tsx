"use client"

import { Loader2 } from "lucide-react"
import { useActionState, useContext, useState } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import type { User } from "../../../types/user"
import type { SettingsCardClassNames } from "../../settings/settings-card"
import { settingsLocalization } from "../../settings/settings-cards"
import { ChangePasswordCardSkeleton } from "../../settings/skeletons/change-password-card-skeleton"
import { Button } from "../../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../../ui/card"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"

export function ChangePasswordCardPrimitive({
    className,
    classNames,
    localization,
    accounts,
    isPending,
    user
}: {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<typeof settingsLocalization>
    accounts?: Array<{ provider: string }> | null
    isPending?: boolean
    user?: User
}) {
    localization = { ...settingsLocalization, ...localization }

    const { authClient, basePath, viewPaths } = useContext(AuthUIContext)
    const [disabled, setDisabled] = useState(true)
    const [isSetPasswordLoading, setIsSetPasswordLoading] = useState(false)

    const handleSetPassword = async () => {
        const email = user?.email

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

    const credentialsLinked = accounts.some(acc => acc.provider === "credential")

    if (!credentialsLinked) {
        return (
            <Card className={cn("w-full max-w-lg overflow-hidden", className, classNames?.base)}>
                <CardHeader className={classNames?.header}>
                    <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.changePassword}
                    </CardTitle>

                    <CardDescription className={classNames?.description}>
                        {localization.setPasswordDescription}
                    </CardDescription>
                </CardHeader>

                <CardFooter className={cn("border-t bg-muted dark:bg-transparent py-4 md:py-3 flex justify-end", classNames?.footer)}>
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
        <Card className={cn("w-full max-w-lg overflow-hidden", className, classNames?.base)}>
            <form action={action}>
                <CardHeader className={classNames?.header}>
                    <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.changePassword}
                    </CardTitle>

                    <CardDescription className={classNames?.description}>
                        {localization.changePasswordDescription}
                    </CardDescription>
                </CardHeader>

                <CardContent className={cn("grid gap-4", classNames?.content)}>
                    <div className="grid gap-2">
                        <Label htmlFor="currentPassword">
                            {localization.currentPassword}
                        </Label>

                        <Input
                            autoComplete="current-password"
                            id="currentPassword"
                            name="currentPassword"
                            placeholder={localization.currentPasswordPlaceholder}
                            required
                            type="password"
                            onChange={() => setDisabled(false)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="newPassword">
                            {localization.newPassword}
                        </Label>

                        <Input
                            autoComplete="new-password"
                            id="newPassword"
                            name="newPassword"
                            placeholder={localization.newPasswordPlaceholder}
                            required
                            type="password"
                            onChange={() => setDisabled(false)}
                        />
                    </div>
                </CardContent>

                <CardFooter className={cn("border-t bg-muted dark:bg-transparent py-4 md:py-3 flex gap-4 justify-between", classNames?.footer)}>
                    <CardDescription className={classNames?.instructions}>
                        {localization.changePasswordInstructions}
                    </CardDescription>

                    <Button className="relative" disabled={disabled || isSubmitting}>
                        <span className={cn(isSubmitting && "opacity-0")}>
                            {localization.save}
                        </span>

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