"use client"

import { useContext, useState } from "react"
import QRCode from "react-qr-code"

import { MailIcon, QrCodeIcon } from "lucide-react"
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

                {twoFactor && twoFactor.length > 1 && (
                    <Button
                        type="button"
                        variant="outline"
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

// const handleTwoFactorPromptSubmit = async (code: string, trustDevice: boolean) => {
//     try {
//         setIsLoading(true)
//         // Validate code format before sending to API
//         if (!/^[0-9]{6}$/.test(code)) {
//             const errorMsg =
//                 localization.invalidTwoFactorCode || "Invalid authentication code format"
//             toast({
//                 variant: "error",
//                 message: errorMsg
//             })
//             setErrorMessage(errorMsg)
//             setIsLoading(false)
//             return
//         }

//         const { error } = (await (authClient as AuthClient).twoFactor.verifyTotp({
//             code,
//             trustDevice
//         })) as Awaited<ReturnType<AuthClient["twoFactor"]["verifyTotp"]>>

//         if (error) {
//             const errorMsg = error.message || error.statusText
//             toast({
//                 variant: "error",
//                 message: errorMsg
//             })
//             setErrorMessage(errorMsg)
//         } else {
//             onSuccess()
//         }
//     } catch (error) {
//         toast({
//             variant: "error",
//             message: getErrorMessage(error) || localization.requestFailed
//         })
//     } finally {
//         setIsLoading(false)
//     }
// }

// const handleTwoFactorRecoverySubmit = async (code: string, trustDevice: boolean) => {
//     try {
//         setIsLoading(true)
//         // Validate code format before sending to API
//         if (!/^[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}$/.test(code)) {
//             const errorMsg = localization.invalidTwoFactorCode || "Invalid backup code format"
//             toast({
//                 variant: "error",
//                 message: errorMsg
//             })
//             setErrorMessage(errorMsg)
//             setIsLoading(false)
//             return
//         }

//         const { error } = (await (authClient as AuthClient).twoFactor.verifyBackupCode({
//             code,
//             trustDevice
//         })) as Awaited<ReturnType<AuthClient["twoFactor"]["verifyBackupCode"]>>

//         if (error) {
//             const errorMsg = error.message || error.statusText
//             toast({
//                 variant: "error",
//                 message: errorMsg
//             })
//             setErrorMessage(errorMsg)
//         } else {
//             onSuccess()
//         }
//     } catch (error) {
//         toast({
//             variant: "error",
//             message: getErrorMessage(error) || localization.requestFailed
//         })
//     } finally {
//         setIsLoading(false)
//     }
// }

// const handleTwoFactorSetupSubmit = async (code: string) => {
//     try {
//         setIsLoading(true)
//         // Validate code format before sending to API
//         if (!/^[0-9]{6}$/.test(code)) {
//             toast({
//                 variant: "error",
//                 message: localization.invalidTwoFactorCode || "Invalid authentication code format"
//             })
//             setIsLoading(false)
//             return
//         }

//         const { error } = (await (authClient as AuthClient).twoFactor.verifyTotp({
//             code
//         })) as Awaited<ReturnType<AuthClient["twoFactor"]["verifyTotp"]>>

//         if (error) {
//             toast({
//                 variant: "error",
//                 message: error.message || error.statusText
//             })
//         } else {
//             toast({
//                 variant: "success",
//                 message: localization.twoFactorEnabled!
//             })
//             setTwoFactorUrl("")

//             // Check if we need to refresh session data after setup
//             const shouldRefresh =
//                 sessionStorage.getItem("shouldRefreshAfterTwoFactorSetup") === "true"
//             if (shouldRefresh) {
//                 sessionStorage.removeItem("shouldRefreshAfterTwoFactorSetup")
//                 await refetchSession?.()
//                 await onSessionChange?.()
//             }

//             navigate(getRedirectTo())
//         }
//     } catch (error) {
//         toast({
//             variant: "error",
//             message: getErrorMessage(error) || localization.requestFailed
//         })
//     } finally {
//         setIsLoading(false)
//     }
// }
