"use client"

import { Loader2 } from "lucide-react"
import { useCallback, useContext, useState } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { getErrorMessage } from "../../lib/get-error-message"
import { cn } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { QrCodeDisplay } from "../two-factor/qr-code-display"
import { TwoFactorPrompt } from "../two-factor/two-factor-prompt"
import { TwoFactorRecovery } from "../two-factor/two-factor-recovery"
import type { AuthFormClassNames } from "./auth-form"

export interface TwoFactorFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    localization?: Partial<AuthLocalization>
    view?: AuthView
    redirectTo?: string
}

export function TwoFactorForm({
    className,
    classNames,
    callbackURL,
    localization,
    view,
    redirectTo
}: TwoFactorFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [twoFactorUrl, setTwoFactorUrl] = useState<string>("")

    const {
        authClient,
        baseURL,
        basePath,
        persistClient,
        redirectTo: contextRedirectTo,
        hooks: { useSession },
        localization: contextLocalization,
        navigate,
        viewPaths,
        toast,
        onSessionChange
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }
    const { refetch: refetchSession } = useSession()

    const getRedirectTo = useCallback(
        () =>
            redirectTo ||
            new URLSearchParams(window.location.search).get("redirectTo") ||
            contextRedirectTo,
        [contextRedirectTo, redirectTo]
    )

    const getCallbackURL = useCallback(
        () =>
            `${baseURL}${
                callbackURL ||
                (persistClient
                    ? `${basePath}/${viewPaths.callback}?redirectTo=${getRedirectTo()}`
                    : getRedirectTo())
            }`,
        [baseURL, callbackURL, persistClient, viewPaths, basePath, getRedirectTo]
    )

    const onSuccess = useCallback(async () => {
        setIsLoading(true)

        await refetchSession?.()
        await onSessionChange?.()

        navigate(getRedirectTo())

        setTimeout(() => {
            setIsLoading(false)
        }, 5000)
    }, [refetchSession, onSessionChange, navigate, getRedirectTo])

    const handleTwoFactorPromptSubmit = async (code: string, trustDevice: boolean) => {
        try {
            setIsLoading(true)
            // Validate code format before sending to API
            if (!/^[0-9]{6}$/.test(code)) {
                const errorMsg =
                    localization.invalidTwoFactorCode || "Invalid authentication code format"
                toast({
                    variant: "error",
                    message: errorMsg
                })
                setErrorMessage(errorMsg)
                setIsLoading(false)
                return
            }

            const { error } = (await (authClient as AuthClient).twoFactor.verifyTotp({
                code,
                trustDevice
            })) as Awaited<ReturnType<AuthClient["twoFactor"]["verifyTotp"]>>

            if (error) {
                const errorMsg = error.message || error.statusText
                toast({
                    variant: "error",
                    message: errorMsg
                })
                setErrorMessage(errorMsg)
            } else {
                onSuccess()
            }
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleTwoFactorRecoverySubmit = async (code: string, trustDevice: boolean) => {
        try {
            setIsLoading(true)
            // Validate code format before sending to API
            if (!/^[a-zA-Z0-9]{5}-[a-zA-Z0-9]{5}$/.test(code)) {
                const errorMsg = localization.invalidTwoFactorCode || "Invalid backup code format"
                toast({
                    variant: "error",
                    message: errorMsg
                })
                setErrorMessage(errorMsg)
                setIsLoading(false)
                return
            }

            const { error } = (await (authClient as AuthClient).twoFactor.verifyBackupCode({
                code,
                trustDevice
            })) as Awaited<ReturnType<AuthClient["twoFactor"]["verifyBackupCode"]>>

            if (error) {
                const errorMsg = error.message || error.statusText
                toast({
                    variant: "error",
                    message: errorMsg
                })
                setErrorMessage(errorMsg)
            } else {
                onSuccess()
            }
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleTwoFactorSetupSubmit = async (code: string) => {
        try {
            setIsLoading(true)
            // Validate code format before sending to API
            if (!/^[0-9]{6}$/.test(code)) {
                toast({
                    variant: "error",
                    message:
                        localization.invalidTwoFactorCode || "Invalid authentication code format"
                })
                setIsLoading(false)
                return
            }

            const { error } = (await (authClient as AuthClient).twoFactor.verifyTotp({
                code
            })) as Awaited<ReturnType<AuthClient["twoFactor"]["verifyTotp"]>>

            if (error) {
                toast({
                    variant: "error",
                    message: error.message || error.statusText
                })
            } else {
                toast({
                    variant: "success",
                    message: localization.twoFactorEnabled!
                })
                setTwoFactorUrl("")

                // Check if we need to refresh session data after setup
                const shouldRefresh =
                    sessionStorage.getItem("shouldRefreshAfterTwoFactorSetup") === "true"
                if (shouldRefresh) {
                    sessionStorage.removeItem("shouldRefreshAfterTwoFactorSetup")
                    await refetchSession?.()
                    await onSessionChange?.()
                }

                navigate(getRedirectTo())
            }
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (view === "callback") return <Loader2 className="animate-spin" />

    return (
        <form className={cn("grid w-full gap-6", className, classNames?.base)}>
            {view === "twoFactorPrompt" && (
                <TwoFactorPrompt
                    isSubmitting={isLoading}
                    error={errorMessage}
                    onSubmit={handleTwoFactorPromptSubmit}
                    localization={localization}
                />
            )}

            {view === "twoFactorRecovery" && (
                <TwoFactorRecovery
                    isSubmitting={isLoading}
                    error={errorMessage}
                    onSubmit={handleTwoFactorRecoverySubmit}
                    localization={localization}
                />
            )}

            {view === "twoFactorSetup" && (
                <div className="space-y-6">
                    <QrCodeDisplay
                        uri={twoFactorUrl}
                        className="mb-6"
                        localization={localization}
                    />
                    <TwoFactorPrompt
                        isSubmitting={isLoading}
                        error={errorMessage}
                        isSetup={true}
                        onSubmit={handleTwoFactorSetupSubmit}
                        localization={localization}
                    />
                </div>
            )}
        </form>
    )
}
