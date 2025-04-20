"use client"

import type { SocialProvider } from "better-auth/social-providers"
import { Loader2 } from "lucide-react"
import { useCallback, useContext, useEffect, useMemo, useRef } from "react"

import { useSearchParam } from "../../hooks/use-search-param"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { getErrorMessage } from "../../lib/get-error-message"
import type { AuthClient } from "../../types/auth-client"
import { ForgotPasswordForm } from "./forms/forgot-password-form"
import { MagicLinkForm } from "./forms/magic-link-form"
import { RecoverAccountForm } from "./forms/recover-account-form"
import { ResetPasswordForm } from "./forms/reset-password-form"
import { SignInForm } from "./forms/sign-in-form"
import { SignUpForm } from "./forms/sign-up-form"
import { TwoFactorForm } from "./forms/two-factor-form"

export type AuthFormClassNames = {
    base?: string
    button?: string
    primaryButton?: string
    forgotPasswordLink?: string
    input?: string
    label?: string
    description?: string
    error?: string
    providerButton?: string
    secondaryButton?: string
    qrCode?: string
    otpInput?: string
    otpInputContainer?: string
}

export interface AuthFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isSubmitting?: boolean
    localization?: Partial<AuthLocalization>
    pathname?: string
    redirectTo?: string
    view?: AuthView
    otpSeparators?: 0 | 1 | 2
}

export function AuthForm({
    className,
    classNames,
    callbackURL: propsCallbackURL,
    isSubmitting,
    localization,
    pathname,
    redirectTo: propsRedirectTo,
    view,
    otpSeparators = 0
}: AuthFormProps) {
    const {
        additionalFields,
        authClient,
        basePath,
        baseURL,
        confirmPassword: confirmPasswordEnabled,
        redirectTo: contextRedirectTo,
        credentials,
        hooks: { useIsRestoring, useSession },
        localization: contextLocalization,
        magicLink,
        navigate,
        persistClient,
        replace,
        signUp,
        signUpFields,
        toast,
        username: usernamePlugin,
        viewPaths,
        onSessionChange
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { refetch: refetchSession } = useSession()

    const isRestoring = useIsRestoring?.()

    const signingOut = useRef(false)
    const isRedirecting = useRef(false)
    const checkingResetPasswordToken = useRef(false)

    const path = pathname?.split("/").pop()

    if (path && !Object.values(viewPaths).includes(path)) {
        console.error(`Invalid auth view: ${path}`)
    }

    view =
        view ||
        ((Object.entries(viewPaths).find(([_, value]) => value === path)?.[0] ||
            "signIn") as AuthView)

    const redirectToParam = useSearchParam("redirectTo")

    const redirectTo = useMemo(
        () => propsRedirectTo || redirectToParam || contextRedirectTo,
        [propsRedirectTo, redirectToParam, contextRedirectTo]
    )

    const getRedirectTo = useCallback(() => redirectTo, [redirectTo])

    const callbackURL = useMemo(
        () =>
            `${baseURL}${
                propsCallbackURL ||
                (persistClient
                    ? `${basePath}/${viewPaths.callback}?redirectTo=${redirectTo}`
                    : redirectTo)
            }`,
        [propsCallbackURL, redirectTo, persistClient, basePath, viewPaths, baseURL]
    )

    const getCallbackURL = useCallback(() => callbackURL, [callbackURL])

    const formAction = async (formData: FormData) => {
        const provider = formData.get("provider") as SocialProvider

        try {
            if (provider) {
                await authClient.signIn.social({
                    provider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                })

                return
            }

            const otherProvider = formData.get("otherProvider") as string

            if (otherProvider) {
                await (authClient as AuthClient).signIn.oauth2({
                    providerId: otherProvider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                })

                return
            }

            if (formData.get("passkey")) {
                await (authClient as AuthClient).signIn.passkey({ fetchOptions: { throw: true } })
                return
            }
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        }
    }

    useEffect(() => {
        if (view !== "signOut") {
            signingOut.current = false
        }

        if (view !== "callback") {
            isRedirecting.current = false
        }
    }, [view])

    useEffect(() => {
        if (view !== "signOut" || signingOut.current) return

        signingOut.current = true
        authClient.signOut().finally(async () => {
            await refetchSession?.()
            await onSessionChange?.()
            replace(`${basePath}/${viewPaths.signIn}`)
        })
    }, [view, authClient, onSessionChange, refetchSession, replace, basePath, viewPaths])

    useEffect(() => {
        if (view !== "resetPassword" || checkingResetPasswordToken.current) return

        checkingResetPasswordToken.current = true

        const searchParams = new URLSearchParams(window.location.search)
        const token = searchParams.get("token")
        if (!token || token === "INVALID_TOKEN") {
            navigate(`${basePath}/${viewPaths.signIn}`)
            setTimeout(() => {
                toast({ variant: "error", message: localization.resetPasswordInvalidToken! })
                checkingResetPasswordToken.current = false
            }, 100)
        }
    }, [basePath, view, viewPaths, navigate, localization, toast])

    useEffect(() => {
        if (view === "magicLink" && !magicLink) {
            replace(`${basePath}/${viewPaths.signIn}`)
        }

        if (view === "signUp" && !signUp) {
            replace(`${basePath}/${viewPaths.signIn}`)
        }

        if (
            (view === "signUp" || view === "forgotPassword" || view === "resetPassword") &&
            !credentials
        ) {
            replace(`${basePath}/${viewPaths.signIn}`)
        }
    }, [basePath, view, viewPaths, credentials, replace, signUp, magicLink])

    useEffect(() => {
        if (view !== "callback" || isRedirecting.current) return

        if (!persistClient) {
            replace(getRedirectTo())
            return
        }

        if (isRestoring) return

        isRedirecting.current = true
        // onSuccess()
    }, [isRestoring, view, replace, persistClient, getRedirectTo])

    if (view === "signOut" || view === "callback") return <Loader2 className="animate-spin" />

    if (view === "signIn") {
        return (
            <SignInForm
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
            />
        )
    }

    if (view === "twoFactor") {
        return (
            <TwoFactorForm
                classNames={classNames}
                localization={localization}
                otpSeparators={otpSeparators}
                redirectTo={redirectTo}
            />
        )
    }

    if (view === "recoverAccount") {
        return (
            <RecoverAccountForm
                className={className}
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
            />
        )
    }

    if (view === "magicLink") {
        return (
            <MagicLinkForm
                className={className}
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
            />
        )
    }

    if (view === "resetPassword") {
        return (
            <ResetPasswordForm
                className={className}
                classNames={classNames}
                localization={localization}
            />
        )
    }

    if (view === "forgotPassword") {
        return (
            <ForgotPasswordForm
                className={className}
                classNames={classNames}
                localization={localization}
            />
        )
    }

    if (view === "signUp") {
        return (
            <SignUpForm
                className={className}
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
            />
        )
    }
}
