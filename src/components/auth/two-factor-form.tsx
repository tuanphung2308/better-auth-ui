"use client"

import { useContext, useEffect, useRef, useState } from "react"
import QRCode from "react-qr-code"

import { Loader2, QrCodeIcon, SendIcon } from "lucide-react"
import { useSearchParam } from "../../hooks/use-search-param"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getErrorMessage } from "../../lib/get-error-message"
import { cn } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp"
import { Label } from "../ui/label"
import type { AuthFormClassNames } from "./auth-form"

export interface TwoFactorFormProps {
    className?: string
    classNames?: AuthFormClassNames
    localization: Partial<AuthLocalization>
    onSuccess: () => Promise<void>
}

export function TwoFactorForm({
    className,
    classNames,
    localization,
    onSuccess
}: TwoFactorFormProps) {
    const totpURI = useSearchParam("totpURI")
    const [code, setCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [trustDevice, setTrustDevice] = useState(false)
    const initialSendRef = useRef(false)

    const { basePath, viewPaths, twoFactor, Link, authClient, toast } = useContext(AuthUIContext)
    const {
        hooks: { useSession }
    } = useContext(AuthUIContext)
    const { data: sessionData } = useSession()
    const isTwoFactorEnabled = sessionData?.user.twoFactorEnabled

    const [method, setMethod] = useState<"totp" | "otp">(
        twoFactor?.includes("totp") ? "totp" : "otp"
    )
    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)

    useEffect(() => {
        if (!twoFactor?.includes("totp") && method === "totp") {
            setMethod("otp")
        } else if (!twoFactor?.includes("otp") && method === "otp") {
            setMethod("totp")
        }
    }, [twoFactor, method])

    useEffect(() => {
        if (method === "otp" && cooldownSeconds <= 0 && !initialSendRef.current) {
            initialSendRef.current = true
            sendOtp()
        }
    }, [method, cooldownSeconds])

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
                message: getErrorMessage(error) || localization?.requestFailed
            })
        }

        setIsSendingOtp(false)
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting || code.length !== 6) return

        try {
            setIsSubmitting(true)

            const verifyMethod =
                method === "totp"
                    ? (authClient as AuthClient).twoFactor.verifyTotp
                    : (authClient as AuthClient).twoFactor.verifyOtp

            await verifyMethod({
                code,
                trustDevice,
                fetchOptions: { throw: true }
            })

            if (!isTwoFactorEnabled) {
                toast({
                    variant: "success",
                    message: localization.twoFactorEnabled
                })
            }

            await onSuccess()

            setTimeout(() => {
                setIsSubmitting(false)
            }, 5000)
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization?.requestFailed
            })

            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleVerify}
            className={cn("grid w-full gap-6", className, classNames?.base)}
        >
            {twoFactor?.includes("totp") && totpURI && method === "totp" && (
                <div className="space-y-3">
                    <Label>{localization.twoFactorTotpLabel}</Label>
                    <QRCode className="border shadow-xs" value={totpURI} />
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center">
                    <Label htmlFor="otp">{localization.oneTimePassword}</Label>

                    <Link
                        className={cn(
                            "-my-1 ml-auto inline-block text-sm hover:underline",
                            classNames?.forgotPasswordLink
                        )}
                        href={`${basePath}/${viewPaths.recover}`}
                    >
                        {localization.forgotAuthenticator}
                    </Link>
                </div>

                <InputOTP maxLength={6} id="otp" value={code} onChange={setCode}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="trustDevice"
                    name="trustDevice"
                    checked={trustDevice}
                    onCheckedChange={(checked) => setTrustDevice(checked === true)}
                />
                <Label htmlFor="trustDevice">{localization.trustDevice}</Label>
            </div>

            <div className="grid gap-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {localization.twoFactorAction}
                </Button>

                {method === "otp" && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={sendOtp}
                        disabled={cooldownSeconds > 0 || isSendingOtp}
                    >
                        {isSendingOtp ? <Loader2 className="animate-spin" /> : <SendIcon />}
                        {localization.resendCode}
                        {cooldownSeconds > 0 && ` (${cooldownSeconds}s)`}
                    </Button>
                )}

                {twoFactor && twoFactor.length > 1 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setMethod(method === "totp" ? "otp" : "totp")}
                    >
                        {method === "otp" ? <QrCodeIcon /> : <SendIcon />}
                        {method === "otp"
                            ? localization.continueWithAuthenticator
                            : localization.sendVerificationCode}
                    </Button>
                )}
            </div>
        </form>
    )
}
