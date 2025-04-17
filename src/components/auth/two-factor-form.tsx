"use client"

import { Loader2, QrCodeIcon, SendIcon } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import QRCode from "react-qr-code"

import { useSearchParam } from "../../hooks/use-search-param"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getErrorMessage } from "../../lib/get-error-message"
import { cn } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp"
import { Label } from "../ui/label"
import type { AuthFormClassNames } from "./auth-form"

export interface TwoFactorFormProps {
    className?: string
    classNames?: AuthFormClassNames
    localization: Partial<AuthLocalization>
    onSuccess: () => Promise<void>
    otpSeparators?: 0 | 1 | 2
}

export function TwoFactorForm({
    className,
    classNames,
    localization,
    onSuccess,
    otpSeparators = 0
}: TwoFactorFormProps) {
    const totpURI = useSearchParam("totpURI")
    const [code, setCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [trustDevice, setTrustDevice] = useState(false)
    const initialSendRef = useRef(false)
    const formRef = useRef<HTMLFormElement>(null)

    const {
        basePath,
        hooks: { useSession },
        viewPaths,
        twoFactor,
        Link,
        authClient,
        toast
    } = useContext(AuthUIContext)

    const { data: sessionData } = useSession()
    const isTwoFactorEnabled = sessionData?.user.twoFactorEnabled

    const [method, setMethod] = useState<"totp" | "otp" | null>(
        twoFactor?.length === 1 ? twoFactor[0] : null
    )

    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)

    useEffect(() => {
        if (!twoFactor?.length) return
        if (twoFactor?.length === 1 && method === null) {
            setMethod(twoFactor[0])
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
        if (isSubmitting) return

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

            if (sessionData && !isTwoFactorEnabled) {
                toast({
                    variant: "success",
                    message: localization.twoFactorEnabled
                })
            }

            await onSuccess()

            // Only clear code after successful submission
            setCode("")

            setTimeout(() => {
                setIsSubmitting(false)
            }, 5000)
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization?.requestFailed
            })

            setIsSubmitting(false)
            setCode("")
        }
    }

    // Auto-submit when 6 digits are entered
    useEffect(() => {
        if (code.length === 6 && !isSubmitting && method !== null) {
            formRef.current?.requestSubmit()
        }
    }, [code, isSubmitting, method])

    // Render OTP input with correct separators based on otpSeparators value
    const renderOTPInput = () => {
        if (otpSeparators === 0) {
            return (
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            )
        }

        if (otpSeparators === 1) {
            return (
                <>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>

                    <InputOTPSeparator />

                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </>
            )
        }

        return (
            <>
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                </InputOTPGroup>

                <InputOTPSeparator />

                <InputOTPGroup>
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                </InputOTPGroup>

                <InputOTPSeparator />

                <InputOTPGroup>
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </>
        )
    }

    return (
        <form
            ref={formRef}
            onSubmit={handleVerify}
            className={cn("grid w-full gap-6", className, classNames?.base)}
        >
            {twoFactor?.includes("totp") && totpURI && method === "totp" && (
                <div className="space-y-3">
                    <Label className={classNames?.label}>{localization.twoFactorTotpLabel}</Label>

                    <QRCode
                        className={cn("border shadow-xs", classNames?.qrCode)}
                        value={totpURI}
                    />
                </div>
            )}

            {method !== null && (
                <>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <Label className={classNames?.label} htmlFor="otp">
                                {localization.oneTimePassword}
                            </Label>

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

                        <InputOTP
                            maxLength={6}
                            id="otp"
                            value={code}
                            onChange={(newValue) => {
                                setCode(newValue)
                            }}
                            containerClassName={classNames?.otpInputContainer}
                            className={classNames?.otpInput}
                            disabled={isSubmitting}
                        >
                            {renderOTPInput()}
                        </InputOTP>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="trustDevice"
                            name="trustDevice"
                            checked={trustDevice}
                            onCheckedChange={(checked) => setTrustDevice(checked === true)}
                            disabled={isSubmitting}
                        />

                        <Label htmlFor="trustDevice" className={classNames?.label}>
                            {localization.trustDevice}
                        </Label>
                    </div>
                </>
            )}

            <div className="grid gap-4">
                {method !== null && (
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={classNames?.actionButton}
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
                        className={classNames?.providerButton}
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
                        className={classNames?.secondaryButton}
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
                        className={classNames?.secondaryButton}
                        onClick={() => setMethod("totp")}
                        disabled={isSubmitting}
                    >
                        <QrCodeIcon />
                        {localization.continueWithAuthenticator}
                    </Button>
                )}
            </div>
        </form>
    )
}
