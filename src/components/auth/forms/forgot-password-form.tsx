"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useIsHydrated } from "../../../hooks/use-hydrated"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import { Button } from "../../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import type { AuthFormClassNames } from "../auth-form"

export interface ForgotPasswordFormProps {
    className?: string
    classNames?: AuthFormClassNames
    localization: Partial<AuthLocalization>
}

export function ForgotPasswordForm({
    className,
    classNames,
    localization
}: ForgotPasswordFormProps) {
    const isHydrated = useIsHydrated()
    const { authClient, basePath, baseURL, navigate, toast, viewPaths } = useContext(AuthUIContext)

    const formSchema = z.object({
        email: z
            .string()
            .min(1, {
                message: `${localization.email} ${localization.isRequired}`
            })
            .email({
                message: `${localization.email} ${localization.isInvalid}`
            })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    })

    const isSubmitting = form.formState.isSubmitting

    async function forgotPassword({ email }: z.infer<typeof formSchema>) {
        try {
            await authClient.forgetPassword({
                email,
                redirectTo: `${baseURL}${basePath}/${viewPaths.resetPassword}`,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.forgotPasswordEmail
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
                onSubmit={form.handleSubmit(forgotPassword)}
                noValidate={isHydrated}
                className={cn("grid w-full gap-6", className, classNames?.base)}
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={classNames?.label}>
                                {localization.email}
                            </FormLabel>

                            <FormControl>
                                <Input
                                    className={classNames?.input}
                                    type="email"
                                    placeholder={localization.emailPlaceholder}
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn("w-full", classNames?.button, classNames?.primaryButton)}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        localization.forgotPasswordAction
                    )}
                </Button>
            </form>
        </Form>
    )
}
