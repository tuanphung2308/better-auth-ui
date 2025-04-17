"use client"

import { useContext, useEffect, useState } from "react"
import QRCode from "react-qr-code"

import { Loader2, MailIcon, QrCodeIcon, SendIcon } from "lucide-react"
import { useSearchParam } from "../../hooks/use-search-param"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp"
import { Label } from "../ui/label"
import type { AuthFormClassNames } from "./auth-form"

export interface TwoFactorFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    localization?: Partial<AuthLocalization>
    view?: AuthView
    redirectTo?: string
}

export function TwoFactorForm({ className, classNames, localization }: TwoFactorFormProps) {
    const totpURI = useSearchParam("totpURI")

    const {
        basePath,
        viewPaths,
        localization: contextLocalization,
        twoFactor,
        Link
    } = useContext(AuthUIContext)

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
        if (method === "otp" && cooldownSeconds <= 0) {
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
            await new Promise((resolve) => setTimeout(resolve, 1000))
            // const { data, error } = await (authClient as AuthClient).twoFactor.sendOtp()

            setCooldownSeconds(60)
        } catch (error) {
            console.error("Failed to send OTP:", error)
        }

        setIsSendingOtp(false)
    }

    localization = { ...contextLocalization, ...localization }

    return (
        <form className={cn("grid w-full gap-6", className, classNames?.base)}>
            {twoFactor?.includes("totp") && totpURI && method === "totp" && (
                <div className="space-y-3">
                    <Label>{localization.twoFactorTotpLabel}</Label>
                    <QRCode value={totpURI} />
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
                        href={`${basePath}/${viewPaths.forgotPassword}`}
                    >
                        {localization.forgotAuthenticator}
                    </Link>
                </div>

                <InputOTP maxLength={6} id="otp">
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
                <Checkbox id="trustDevice" name="trustDevice" />
                <Label htmlFor="trustDevice">{localization.trustDevice}</Label>
            </div>

            <div className="grid gap-4">
                <Button type="submit">{localization.twoFactorAction}</Button>

                {method === "otp" && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={sendOtp}
                        disabled={cooldownSeconds > 0 || isSendingOtp}
                    >
                        {isSendingOtp ? <Loader2 className="animate-spin" /> : <SendIcon />}
                        Resend code
                        {cooldownSeconds > 0 && ` (${cooldownSeconds}s)`}
                    </Button>
                )}

                {twoFactor && twoFactor.length > 1 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setMethod(method === "totp" ? "otp" : "totp")}
                    >
                        {method === "otp" ? <QrCodeIcon /> : <MailIcon />}
                        {method === "otp" ? "Continue with Authenticator" : "Send code via Email"}
                    </Button>
                )}
            </div>
        </form>
    )
}
