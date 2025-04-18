"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import { PasswordInput } from "../password-input"
import { CardContent } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { NewSettingsCard, type SettingsCardClassNames } from "./shared/new-settings-card"
import { InputFieldSkeleton } from "./skeletons/input-field-skeleton"

export interface ChangePasswordCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { provider: string }[] | null
    isPending?: boolean
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
        localization: contextLocalization,
        toast,
        viewPaths
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: sessionData } = useSession()

    if (!skipHook) {
        const result = useListAccounts()
        accounts = result.data
        isPending = result.isPending
    }

    const formSchema = z
        .object({
            currentPassword: z.string().min(1, { message: localization.passwordRequired }),
            newPassword: z.string().min(1, { message: localization.newPasswordRequired }),
            confirmPassword: confirmPasswordEnabled
                ? z.string().min(1, { message: localization.confirmPasswordRequired })
                : z.string().optional()
        })
        .refine((data) => !confirmPasswordEnabled || data.newPassword === data.confirmPassword, {
            message: localization.passwordsDoNotMatch,
            path: ["confirmPassword"]
        })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    })

    const setPasswordForm = useForm()

    const { isSubmitting } = form.formState

    const setPassword = async () => {
        if (!sessionData) return
        const email = sessionData?.user.email

        try {
            await authClient.forgetPassword({
                email,
                redirectTo: `${basePath}/${viewPaths.resetPassword}`,
                fetchOptions: { throw: true }
            })

            toast({ variant: "success", message: localization.forgotPasswordEmail! })
        } catch (error) {
            toast({ variant: "error", message: getLocalizedError({ error, localization }) })
        }
    }

    const changePassword = async ({ currentPassword, newPassword }: z.infer<typeof formSchema>) => {
        try {
            await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
                fetchOptions: { throw: true }
            })

            toast({ variant: "success", message: localization.changePasswordSuccess! })
        } catch (error) {
            toast({ variant: "error", message: getLocalizedError({ error, localization }) })
        }

        form.reset()
    }

    const credentialsLinked = accounts?.some((acc) => acc.provider === "credential")

    if (!isPending && !credentialsLinked) {
        return (
            <Form {...setPasswordForm}>
                <form onSubmit={setPasswordForm.handleSubmit(setPassword)}>
                    <NewSettingsCard
                        title={localization.changePassword}
                        description={localization.setPasswordDescription}
                        actionLabel={localization.setPassword}
                        isPending={isPending}
                        className={className}
                        classNames={classNames}
                    />
                </form>
            </Form>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(changePassword)}>
                <NewSettingsCard
                    title={localization.changePassword}
                    description={localization.changePasswordDescription}
                    actionLabel={localization.save}
                    isPending={isPending}
                    instructions={localization.changePasswordInstructions}
                    className={className}
                    classNames={classNames}
                >
                    <CardContent className={cn("grid gap-6", classNames?.content)}>
                        {isPending || !accounts ? (
                            <>
                                <InputFieldSkeleton classNames={classNames} />
                                <InputFieldSkeleton classNames={classNames} />

                                {confirmPasswordEnabled && (
                                    <InputFieldSkeleton classNames={classNames} />
                                )}
                            </>
                        ) : (
                            <>
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={classNames?.label}>
                                                {localization.currentPassword}
                                            </FormLabel>

                                            <FormControl>
                                                <PasswordInput
                                                    className={classNames?.input}
                                                    autoComplete="current-password"
                                                    placeholder={
                                                        localization.currentPasswordPlaceholder
                                                    }
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={classNames?.label}>
                                                {localization.newPassword}
                                            </FormLabel>

                                            <FormControl>
                                                <PasswordInput
                                                    className={classNames?.input}
                                                    autoComplete="new-password"
                                                    placeholder={
                                                        localization.newPasswordPlaceholder
                                                    }
                                                    enableToggle
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {confirmPasswordEnabled && (
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={classNames?.label}>
                                                    {localization.confirmPassword}
                                                </FormLabel>

                                                <FormControl>
                                                    <PasswordInput
                                                        className={classNames?.input}
                                                        autoComplete="new-password"
                                                        placeholder={
                                                            localization.confirmPasswordPlaceholder
                                                        }
                                                        disabled={isSubmitting}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </CardContent>
                </NewSettingsCard>
            </form>
        </Form>
    )
}
