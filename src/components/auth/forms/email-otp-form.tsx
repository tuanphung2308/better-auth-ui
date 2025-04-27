"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useCallback, useContext, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useIsHydrated } from "../../../hooks/use-hydrated"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError, getSearchParam } from "../../../lib/utils"
import type { AuthClient } from "../../../types/auth-client"
import { Button } from "../../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import type { AuthFormClassNames } from "../auth-form"

export interface EmailOTPFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    setIsSubmitting?: (value: boolean) => void
}

export function EmailOTPForm({
    className,
    classNames,
    callbackURL: callbackURLProp,
    isSubmitting,
    localization,
    redirectTo: redirectToProp,
    setIsSubmitting
}: EmailOTPFormProps) {
    const isHydrated = useIsHydrated()

    const {
        authClient,
        basePath,
        baseURL,
        persistClient,
        localization: contextLocalization,
        redirectTo: contextRedirectTo,
        viewPaths,
        toast
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const getRedirectTo = useCallback(
        () => redirectToProp || getSearchParam("redirectTo") || contextRedirectTo,
        [redirectToProp, contextRedirectTo]
    )

    const getCallbackURL = useCallback(
        () =>
            `${baseURL}${
                callbackURLProp ||
                (persistClient
                    ? `${basePath}/${viewPaths.callback}?redirectTo=${getRedirectTo()}`
                    : getRedirectTo())
            }`,
        [callbackURLProp, persistClient, basePath, viewPaths, baseURL, getRedirectTo]
    )

    const formSchema = z.object({
        email: z
            .string()
            .min(1, { message: `${localization.email} ${localization.isRequired}` })
            .email({ message: `${localization.email} ${localization.isInvalid}` })
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

    async function sendEmailOTP({ email }: z.infer<typeof formSchema>) {
        try {
            await (authClient as AuthClient).emailOtp.sendVerificationOtp({
                email,
                type: "sign-in",
                fetchOptions: { throw: true }
            })

            // TODO: Handle everything after this
            // navigate(`${basePath}/${viewPaths.twoFactor}${window.location.search}`)
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
                onSubmit={form.handleSubmit(sendEmailOTP)}
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
                        localization.emailOTPAction
                    )}
                </Button>
            </form>
        </Form>
    )
}
