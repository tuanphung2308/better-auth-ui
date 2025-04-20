"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, QrCodeIcon, SendIcon } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import QRCode from "react-qr-code"
import * as z from "zod"

import type { BetterFetchError } from "@better-fetch/fetch"
import { useSearchParam } from "../../../hooks/use-search-param"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { getErrorMessage } from "../../../lib/get-error-message"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthClient } from "../../../types/auth-client"
import { Button } from "../../ui/button"
import { Checkbox } from "../../ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { InputOTP } from "../../ui/input-otp"
import { Label } from "../../ui/label"
import type { AuthFormClassNames } from "../auth-form"
import { OTPInputGroup } from "../otp-input-group"
import { useOnSuccessTransition } from "./use-success-transition"

export interface TwoFactorFormProps {
    className?: string
    classNames?: AuthFormClassNames
    localization: Partial<AuthLocalization>
    otpSeparators?: 0 | 1 | 2
    redirectTo?: string
}

export function TwoFactorForm({
    className,
    classNames,
    localization,
    otpSeparators = 0,
    redirectTo
}: TwoFactorFormProps) {
    const totpURI = useSearchParam("totpURI")
    const initialSendRef = useRef(false)

    const {
        basePath,
        hooks: { useSession },
        viewPaths,
        twoFactor,
        Link,
        authClient,
        replace,
        toast
    } = useContext(AuthUIContext)

    const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({ redirectTo })

    const { data: sessionData } = useSession()
    const isTwoFactorEnabled = sessionData?.user.twoFactorEnabled

    const [method, setMethod] = useState<"totp" | "otp" | null>(
        twoFactor?.length === 1 ? twoFactor[0] : null
    )

    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)

    const formSchema = z.object({
        code: z
            .string()
            .min(1, {
                message: `${localization.oneTimePassword} ${localization.isRequired}`
            })
            .min(6, {
                message: `${localization.oneTimePassword} ${localization.isInvalid}`
            }),
        trustDevice: z.boolean().optional()
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { code: "" }
    })

    const isSubmitting = form.formState.isSubmitting || transitionPending

    // biome-ignore lint/correctness/useExhaustiveDependencies:
    useEffect(() => {
        if (method === "otp" && cooldownSeconds <= 0 && !initialSendRef.current) {
            initialSendRef.current = true
            sendOtp()
        }
    }, [method])

    useEffect(() => {
        if (cooldownSeconds <= 0) return

        const timer = setTimeout(() => {
            setCooldownSeconds((prev) => prev - 1)
        }, 1000)
        return () => clearTimeout(timer)
    }, [cooldownSeconds])

    const sendOtp = async () => {
        if (isSendingOtp || cooldownSeconds > 0) return

        try {
            setIsSendingOtp(true)
            await (authClient as AuthClient).twoFactor.sendOtp({ fetchOptions: { throw: true } })
            setCooldownSeconds(60)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })

            if ((error as BetterFetchError).error.code === "INVALID_TWO_FACTOR_COOKIE") {
                replace(`${basePath}/${viewPaths.signIn}`)
            }
        }

        initialSendRef.current = false
        setIsSendingOtp(false)
    }

    async function onSubmit({ code, trustDevice }: z.infer<typeof formSchema>) {
        try {
            const verifyMethod =
                method === "totp"
                    ? (authClient as AuthClient).twoFactor.verifyTotp
                    : (authClient as AuthClient).twoFactor.verifyOtp

            await verifyMethod({
                code: code,
                trustDevice,
                fetchOptions: { throw: true }
            })

            if (sessionData && !isTwoFactorEnabled) {
                toast({
                    variant: "success",
                    message: localization.twoFactorEnabled
                })
            }

            await onSuccess()
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization?.requestFailed
            })

            if ((error as BetterFetchError).error.code === "INVALID_TWO_FACTOR_COOKIE") {
                replace(`${basePath}/${viewPaths.signIn}`)
            }

            form.reset()
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn("grid w-full gap-6", className, classNames?.base)}
            >
                {twoFactor?.includes("totp") && totpURI && method === "totp" && (
                    <div className="space-y-3">
                        <Label className={classNames?.label}>
                            {localization.twoFactorTotpLabel}
                        </Label>

                        <QRCode
                            className={cn("border shadow-xs", classNames?.qrCode)}
                            value={totpURI}
                        />
                    </div>
                )}

                {method !== null && (
                    <>
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center">
                                        <FormLabel className={classNames?.label}>
                                            {localization.oneTimePassword}
                                        </FormLabel>

                                        <Link
                                            className={cn(
                                                "-my-1 ml-auto inline-block text-sm hover:underline",
                                                classNames?.forgotPasswordLink
                                            )}
                                            href={`${basePath}/${viewPaths.recoverAccount}`}
                                        >
                                            {localization.forgotAuthenticator}
                                        </Link>
                                    </div>

                                    <FormControl>
                                        <InputOTP
                                            {...field}
                                            maxLength={6}
                                            onChange={(value) => {
                                                field.onChange(value)

                                                if (value.length === 6) {
                                                    form.handleSubmit(onSubmit)()
                                                }
                                            }}
                                            containerClassName={classNames?.otpInputContainer}
                                            className={classNames?.otpInput}
                                            disabled={isSubmitting}
                                        >
                                            <OTPInputGroup otpSeparators={otpSeparators} />
                                        </InputOTP>
                                    </FormControl>

                                    <FormMessage className={classNames?.error} />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="trustDevice"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>

                                    <FormLabel className={classNames?.label}>
                                        {localization.trustDevice}
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <div className="grid gap-4">
                    {method !== null && (
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(classNames?.button, classNames?.primaryButton)}
                        >
                            {isSubmitting && <Loader2 className="animate-spin" />}
                            {localization.twoFactorAction}
                        </Button>
                    )}

                    {method === "otp" && twoFactor?.includes("otp") && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={sendOtp}
                            disabled={cooldownSeconds > 0 || isSendingOtp || isSubmitting}
                            className={cn(classNames?.button, classNames?.providerButton)}
                        >
                            {isSendingOtp ? <Loader2 className="animate-spin" /> : <SendIcon />}
                            {localization.resendCode}
                            {cooldownSeconds > 0 && ` (${cooldownSeconds}s)`}
                        </Button>
                    )}

                    {method !== "otp" && twoFactor?.includes("otp") && (
                        <Button
                            type="button"
                            variant="secondary"
                            className={cn(classNames?.button, classNames?.secondaryButton)}
                            onClick={() => setMethod("otp")}
                            disabled={isSubmitting}
                        >
                            <SendIcon />
                            {localization.sendVerificationCode}
                        </Button>
                    )}

                    {method !== "totp" && twoFactor?.includes("totp") && (
                        <Button
                            type="button"
                            variant="secondary"
                            className={cn(classNames?.button, classNames?.secondaryButton)}
                            onClick={() => setMethod("totp")}
                            disabled={isSubmitting}
                        >
                            <QrCodeIcon />
                            {localization.continueWithAuthenticator}
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}
