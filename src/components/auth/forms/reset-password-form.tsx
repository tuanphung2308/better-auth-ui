"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import { PasswordInput } from "../../password-input"
import { Button } from "../../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import type { AuthFormClassNames } from "../auth-form"

export interface ResetPasswordFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
}

export function ResetPasswordForm({
    className,
    classNames,
    isSubmitting,
    localization
}: ResetPasswordFormProps) {
    const tokenChecked = useRef(false)

    const {
        authClient,
        basePath,
        confirmPassword: confirmPasswordEnabled,
        toast,
        viewPaths,
        navigate
    } = useContext(AuthUIContext)

    const formSchema = z
        .object({
            password: z.string().min(1, {
                message: `${localization.password} ${localization.isRequired}`
            }),
            confirmPassword: confirmPasswordEnabled
                ? z.string().min(1, {
                      message: `${localization.confirmPassword} ${localization.isRequired}`
                  })
                : z.string().optional()
        })
        .refine((data) => !confirmPasswordEnabled || data.password === data.confirmPassword, {
            message: localization.passwordsDoNotMatch,
            path: ["confirmPassword"]
        })

    // Infer the type from the schema
    type FormValues = z.infer<typeof formSchema>

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    })

    isSubmitting = isSubmitting || form.formState.isSubmitting

    useEffect(() => {
        if (tokenChecked.current) return

        tokenChecked.current = true
        const searchParams = new URLSearchParams(window.location.search)
        const token = searchParams.get("token")

        if (!token || token === "INVALID_TOKEN") {
            navigate(`${basePath}/${viewPaths.signIn}`)
            setTimeout(() => {
                toast({ variant: "error", message: localization.resetPasswordInvalidToken })
            }, 100)
        }
    }, [basePath, navigate, toast, viewPaths, localization])

    async function resetPassword(values: FormValues) {
        try {
            const searchParams = new URLSearchParams(window.location.search)
            const token = searchParams.get("token") as string

            await authClient.resetPassword({
                newPassword: values.password,
                token,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.resetPasswordSuccess
            })

            navigate(`${basePath}/${viewPaths.signIn}`)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(resetPassword)}
                className={cn("grid w-full gap-6", className, classNames?.base)}
            >
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={classNames?.label}>
                                {localization.newPassword}
                            </FormLabel>

                            <FormControl>
                                <PasswordInput
                                    autoComplete="new-password"
                                    className={classNames?.input}
                                    placeholder={localization.newPasswordPlaceholder}
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
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
                                        autoComplete="new-password"
                                        className={classNames?.input}
                                        placeholder={localization.confirmPasswordPlaceholder}
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>

                                <FormMessage className={classNames?.error} />
                            </FormItem>
                        )}
                    />
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn("w-full", classNames?.button, classNames?.primaryButton)}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        localization.resetPasswordAction
                    )}
                </Button>
            </form>
        </Form>
    )
}
