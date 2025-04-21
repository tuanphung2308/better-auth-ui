"use client"
import { useContext, useEffect } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { AuthCallback } from "./auth-callback"
import { ForgotPasswordForm } from "./forms/forgot-password-form"
import { MagicLinkForm } from "./forms/magic-link-form"
import { RecoverAccountForm } from "./forms/recover-account-form"
import { ResetPasswordForm } from "./forms/reset-password-form"
import { SignInForm } from "./forms/sign-in-form"
import { SignUpForm } from "./forms/sign-up-form"
import { TwoFactorForm } from "./forms/two-factor-form"
import { SignOut } from "./sign-out"

export type AuthFormClassNames = {
    base?: string
    button?: string
    checkbox?: string
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
    setIsSubmitting?: (isSubmitting: boolean) => void
    view?: AuthView
    otpSeparators?: 0 | 1 | 2
}

export function AuthForm({
    className,
    classNames,
    isSubmitting,
    localization,
    pathname,
    redirectTo,
    setIsSubmitting,
    view,
    otpSeparators = 0
}: AuthFormProps) {
    const {
        basePath,
        credentials,
        localization: contextLocalization,
        magicLink,
        replace,
        signUp: signUpEnabled,
        twoFactor: twoFactorEnabled,
        viewPaths
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const path = pathname?.split("/").pop()

    useEffect(() => {
        if (path && !Object.values(viewPaths).includes(path)) {
            console.error(`Invalid auth view: ${path}`)
            replace(`${basePath}/${viewPaths.signIn}${window.location.search}`)
        }
    }, [path, viewPaths, basePath, replace])

    view =
        view ||
        ((Object.entries(viewPaths).find(([_, value]) => value === path)?.[0] ||
            "signIn") as AuthView)

    // Redirect to appropriate view based on enabled features
    useEffect(() => {
        if (view === "magicLink" && (!magicLink || !credentials)) {
            replace(`${basePath}/${viewPaths.signIn}${window.location.search}`)
        }

        if (view === "signUp" && !signUpEnabled) {
            replace(`${basePath}/${viewPaths.signIn}${window.location.search}`)
        }

        if (
            !credentials &&
            [
                "signUp",
                "forgotPassword",
                "resetPassword",
                "twoFactor",
                "recoverAccount",
                "magicLink"
            ].includes(view)
        ) {
            replace(`${basePath}/${viewPaths.signIn}${window.location.search}`)
        }

        if (["twoFactor", "recoverAccount"].includes(view) && !twoFactorEnabled) {
            replace(`${basePath}/${viewPaths.signIn}${window.location.search}`)
        }
    }, [
        basePath,
        view,
        viewPaths,
        credentials,
        replace,
        signUpEnabled,
        magicLink,
        twoFactorEnabled
    ])

    if (view === "signOut") return <SignOut />
    if (view === "callback") return <AuthCallback redirectTo={redirectTo} />

    if (view === "signIn") {
        return credentials || !magicLink ? (
            <SignInForm
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
            />
        ) : (
            <MagicLinkForm
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
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
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
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
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
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
                setIsSubmitting={setIsSubmitting}
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
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
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
                setIsSubmitting={setIsSubmitting}
            />
        )
    }
}
