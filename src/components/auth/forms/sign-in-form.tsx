"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useIsHydrated } from "../../../hooks/use-hydrated"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError, isValidEmail } from "../../../lib/utils"
import type { AuthClient } from "../../../types/auth-client"
import { PasswordInput } from "../../password-input"
import { Button } from "../../ui/button"
import { Checkbox } from "../../ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import type { AuthFormClassNames } from "../auth-form"
import { useOnSuccessTransition } from "./use-success-transition"

export interface SignInFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
}

export function SignInForm({
    className,
    classNames,
    isSubmitting,
    localization,
    redirectTo
}: SignInFormProps) {
    const isHydrated = useIsHydrated()

    const {
        authClient,
        basePath,
        forgotPassword,
        rememberMe: rememberMeEnabled,
        toast,
        username: usernameEnabled,
        viewPaths,
        navigate,
        Link
    } = useContext(AuthUIContext)

    const { onSuccess, isPending } = useOnSuccessTransition({ redirectTo })

    const formSchema = z.object({
        email: usernameEnabled
            ? z.string().min(1, {
                  message: `${localization.username} ${localization.isRequired}`
              })
            : z
                  .string()
                  .min(1, {
                      message: `${localization.email} ${localization.isRequired}`
                  })
                  .email({
                      message: `${localization.email} ${localization.isInvalid}`
                  }),
        password: z.string().min(1, {
            message: `${localization.password} ${localization.isRequired}`
        }),
        rememberMe: z.boolean().optional()
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: !rememberMeEnabled
        }
    })

    isSubmitting = isSubmitting || form.formState.isSubmitting || isPending

    async function signIn({ email, password, rememberMe }: z.infer<typeof formSchema>) {
        try {
            let response: Record<string, unknown> = {}

            if (usernameEnabled && !isValidEmail(email)) {
                response = await (authClient as AuthClient).signIn.username({
                    username: email,
                    password,
                    rememberMe,
                    fetchOptions: { throw: true }
                })
            } else {
                response = await authClient.signIn.email({
                    email,
                    password,
                    rememberMe,
                    fetchOptions: { throw: true }
                })
            }

            if (response.twoFactorRedirect) {
                navigate(`${basePath}/${viewPaths.twoFactor}`)
            } else {
                onSuccess()
            }
        } catch (error) {
            form.resetField("password")

            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(signIn)}
                noValidate={isHydrated}
                className={cn("grid w-full gap-6", className, classNames?.base)}
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={classNames?.label}>
                                {usernameEnabled ? localization.username : localization.email}
                            </FormLabel>

                            <FormControl>
                                <Input
                                    className={classNames?.input}
                                    type={usernameEnabled ? "text" : "email"}
                                    placeholder={
                                        usernameEnabled
                                            ? localization.signInUsernamePlaceholder
                                            : localization.emailPlaceholder
                                    }
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel className={classNames?.label}>
                                    {localization.password}
                                </FormLabel>

                                {forgotPassword && (
                                    <Link
                                        className={cn(
                                            "text-sm hover:underline",
                                            classNames?.forgotPasswordLink
                                        )}
                                        href={`${basePath}/${viewPaths.forgotPassword}`}
                                    >
                                        {localization.forgotPasswordLink}
                                    </Link>
                                )}
                            </div>

                            <FormControl>
                                <PasswordInput
                                    autoComplete="current-password"
                                    className={classNames?.input}
                                    placeholder={localization.passwordPlaceholder}
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                {rememberMeEnabled && (
                    <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>

                                <FormLabel>{localization.rememberMe}</FormLabel>
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
                        localization.signInAction
                    )}
                </Button>
            </form>
        </Form>
    )
}
