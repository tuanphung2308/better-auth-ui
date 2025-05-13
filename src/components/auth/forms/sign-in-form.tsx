"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { BetterFetchOption } from "@better-fetch/fetch"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useIsHydrated } from "../../../hooks/use-hydrated"
import { useOnSuccessTransition } from "../../../hooks/use-success-transition"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError, isValidEmail } from "../../../lib/utils"
import type { AuthClient } from "../../../types/auth-client"
import { RecaptchaBadge } from "../../captcha/recaptcha-badge"
import { RecaptchaV2 } from "../../captcha/recaptcha-v2"
import { PasswordInput } from "../../password-input"
import { Button } from "../../ui/button"
import { Checkbox } from "../../ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import type { AuthFormClassNames } from "../auth-form"

export interface SignInFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    setIsSubmitting?: (isSubmitting: boolean) => void
}

export function SignInForm({
    className,
    classNames,
    isSubmitting,
    localization,
    redirectTo,
    setIsSubmitting
}: SignInFormProps) {
    const isHydrated = useIsHydrated()
    // biome-ignore lint/suspicious/noExplicitAny:
    const captchaRef = useRef<any>(null)
    const { executeRecaptcha } = useGoogleReCaptcha()

    const {
        authClient,
        basePath,
        forgotPassword,
        localization: contextLocalization,
        rememberMe: rememberMeEnabled,
        username: usernameEnabled,
        viewPaths,
        captcha,
        navigate,
        toast,
        Link
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({ redirectTo })

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

    isSubmitting = isSubmitting || form.formState.isSubmitting || transitionPending

    useEffect(() => {
        setIsSubmitting?.(form.formState.isSubmitting || transitionPending)
    }, [form.formState.isSubmitting, transitionPending, setIsSubmitting])

    async function signIn({ email, password, rememberMe }: z.infer<typeof formSchema>) {
        const fetchOptions: BetterFetchOption = { throw: true }

        if (captcha?.provider === "google-recaptcha-v3" && captcha?.siteKey && executeRecaptcha) {
            fetchOptions.headers = {
                "x-captcha-response": await executeRecaptcha("signIn")
            }
        }

        if (captcha?.provider === "google-recaptcha-v2-checkbox" && captcha?.siteKey) {
            fetchOptions.headers = {
                "x-captcha-response": grecaptcha.getResponse()
            }
        }

        if (captcha?.provider === "google-recaptcha-v2-invisible" && captcha?.siteKey) {
            fetchOptions.headers = {
                "x-captcha-response": (await captchaRef.current!.executeAsync()) as string
            }
        }

        try {
            let response: Record<string, unknown> = {}

            if (usernameEnabled && !isValidEmail(email)) {
                response = await (authClient as AuthClient).signIn.username({
                    username: email,
                    password,
                    rememberMe,
                    fetchOptions
                })
            } else {
                response = await authClient.signIn.email({
                    email,
                    password,
                    rememberMe,
                    fetchOptions
                })
            }

            if (response.twoFactorRedirect) {
                navigate(`${basePath}/${viewPaths.twoFactor}${window.location.search}`)
            } else {
                await onSuccess()
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
                                        href={`${basePath}/${viewPaths.forgotPassword}${isHydrated ? window.location.search : ""}`}
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
                            <FormItem className="flex">
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

                <RecaptchaV2 ref={captchaRef} localization={localization} />
                <RecaptchaBadge localization={localization} />

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
