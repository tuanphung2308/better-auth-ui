"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { BetterFetchOption } from "@better-fetch/fetch"
import type ReCAPTCHA from "react-google-recaptcha"
import { useIsHydrated } from "../../../hooks/use-hydrated"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError, getRecaptchaToken } from "../../../lib/utils"
import { RecaptchaBadge } from "../../captcha/recaptcha-badge"
import { RecaptchaV2 } from "../../captcha/recaptcha-v2"
import { Button } from "../../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import type { AuthFormClassNames } from "../auth-form"

export interface ForgotPasswordFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    setIsSubmitting?: (value: boolean) => void
}

export function ForgotPasswordForm({
    className,
    classNames,
    isSubmitting,
    localization,
    setIsSubmitting
}: ForgotPasswordFormProps) {
    const isHydrated = useIsHydrated()
    const {
        authClient,
        basePath,
        baseURL,
        localization: contextLocalization,
        navigate,
        toast,
        viewPaths,
        captcha
    } = useContext(AuthUIContext)
    const recaptchaRef = useRef<ReCAPTCHA>(null)

    localization = { ...contextLocalization, ...localization }

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

    isSubmitting = isSubmitting || form.formState.isSubmitting

    useEffect(() => {
        setIsSubmitting?.(form.formState.isSubmitting)
    }, [form.formState.isSubmitting, setIsSubmitting])

    async function forgotPassword({ email }: z.infer<typeof formSchema>) {
        const fetchOptions: BetterFetchOption = { throw: true }

        if (captcha?.provider === "google-recaptcha-v3" && captcha?.siteKey) {
            fetchOptions.headers = {
                "x-captcha-response": await getRecaptchaToken(captcha.siteKey, "forgotPassword")
            }
        }

        if (captcha?.provider === "google-recaptcha-v2-checkbox" && captcha?.siteKey) {
            fetchOptions.headers = {
                "x-captcha-response": grecaptcha.getResponse()
            }
        }

        if (captcha?.provider === "google-recaptcha-v2-invisible" && captcha?.siteKey) {
            fetchOptions.headers = {
                "x-captcha-response": (await recaptchaRef.current!.executeAsync()) as string
            }
        }

        try {
            await authClient.forgetPassword({
                email,
                redirectTo: `${baseURL}${basePath}/${viewPaths.resetPassword}`,
                fetchOptions
            })

            toast({
                variant: "success",
                message: localization.forgotPasswordEmail
            })

            navigate(`${basePath}/${viewPaths.signIn}${window.location.search}`)
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

                <RecaptchaV2 ref={recaptchaRef} localization={localization} />
                <RecaptchaBadge localization={localization} />

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
