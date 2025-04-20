"use client"

import type { SocialProvider } from "better-auth/social-providers"
import { Loader2 } from "lucide-react"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

import { useSearchParam } from "../../hooks/use-search-param"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { getErrorMessage } from "../../lib/get-error-message"
import { cn } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { ConfirmPasswordInput } from "../confirm-password-input"
import { PasswordInput } from "../password-input"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { ActionButton } from "./action-button"
import { AdditionalFieldInput } from "./additional-field-input"
import { ForgotPasswordForm } from "./forms/forgot-password-form"
import { MagicLinkForm } from "./forms/magic-link-form"
import { RecoverAccountForm } from "./forms/recover-account-form"
import { ResetPasswordForm } from "./forms/reset-password-form"
import { SignInForm } from "./forms/sign-in-form"
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
    socialLayout?: "auto" | "horizontal" | "grid" | "vertical"
    view?: AuthView
    otpSeparators?: 0 | 1 | 2
}

export function AuthForm({
    className,
    classNames,
    callbackURL: propsCallbackURL,
    localization,
    pathname,
    redirectTo: propsRedirectTo,
    socialLayout = "auto",
    view,
    otpSeparators = 0
}: AuthFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const {
        additionalFields,
        authClient,
        basePath,
        baseURL,
        confirmPassword: confirmPasswordEnabled,
        redirectTo: contextRedirectTo,
        credentials,
        forgotPassword,
        hooks: { useIsRestoring, useSession },
        localization: contextLocalization,
        magicLink,
        nameRequired,
        navigate,
        otherProviders,
        passkey,
        persistClient,
        providers,
        replace,
        signUp,
        signUpFields,
        toast,
        username: usernamePlugin,
        viewPaths,
        onSessionChange,
        Link
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

    const onSuccess = useCallback(async () => {
        setIsLoading(true)

        await refetchSession?.()
        await onSessionChange?.()

        navigate(getRedirectTo())

        setTimeout(() => {
            setIsLoading(false)
        }, 5000)
    }, [refetchSession, onSessionChange, navigate, getRedirectTo])

    const formAction = async (formData: FormData) => {
        const provider = formData.get("provider") as SocialProvider

        try {
            if (provider) {
                await authClient.signIn.social({
                    provider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                })

                setIsLoading(true)
                return
            }

            const otherProvider = formData.get("otherProvider") as string

            if (otherProvider) {
                await (authClient as AuthClient).signIn.oauth2({
                    providerId: otherProvider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                })

                setIsLoading(true)
                return
            }

            if (formData.get("passkey")) {
                await (authClient as AuthClient).signIn.passkey({ fetchOptions: { throw: true } })
                onSuccess()
                return
            }

            const email = formData.get("email") as string
            const password = formData.get("password") as string
            const name = formData.get("name") || ("" as string)

            switch (view) {
                case "signUp": {
                    if (confirmPasswordEnabled) {
                        const confirmPassword = formData.get("confirmPassword") as string
                        if (password !== confirmPassword) {
                            toast({ variant: "error", message: localization.passwordsDoNotMatch! })
                            return
                        }
                    }

                    const params = {
                        email,
                        password,
                        name,
                        callbackURL: getCallbackURL()
                    } as Record<string, unknown>

                    if (usernamePlugin) {
                        params.username = formData.get("username")
                    }

                    signUpFields?.map((field) => {
                        if (field === "name") return

                        const additionalField = additionalFields?.[field]
                        if (!additionalField) return

                        if (formData.has(field)) {
                            const value = formData.get(field) as string

                            if (additionalField.validate && !additionalField.validate(value)) {
                                toast({
                                    variant: "error",
                                    message: `${additionalField.label} ${localization.isInvalid}`
                                })
                                return
                            }

                            params[field] =
                                additionalField.type === "number"
                                    ? Number.parseFloat(value)
                                    : additionalField.type === "boolean"
                                      ? value === "on"
                                      : value
                        }
                    })

                    const data = await (authClient as AuthClient).signUp.email({
                        ...params,
                        email: params.email as string,
                        name: params.name as string,
                        password: params.password as string,
                        fetchOptions: { throw: true }
                    })

                    if (data.token) {
                        onSuccess()
                    } else {
                        navigate(`${basePath}/${viewPaths.signIn}`)
                        toast({ variant: "success", message: localization.signUpEmail! })
                    }

                    break
                }
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

        if (["signUp", "forgotPassword", "resetPassword"].includes(view) && !credentials) {
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

        onSuccess()
    }, [isRestoring, view, replace, persistClient, getRedirectTo, onSuccess])

    if (["signOut", "callback"].includes(view)) return <Loader2 className="animate-spin" />

    if (view === "signIn") {
        return (
            <SignInForm
                classNames={classNames}
                localization={localization}
                redirectTo={redirectTo}
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

    return (
        <form action={formAction} className={cn("grid w-full gap-6", className, classNames?.base)}>
            {credentials &&
                view === "signUp" &&
                (nameRequired || signUpFields?.includes("name")) && (
                    <div className="grid gap-2">
                        <Label className={classNames?.label} htmlFor="name">
                            {localization.name}
                        </Label>

                        <Input
                            className={classNames?.input}
                            id="name"
                            name="name"
                            placeholder={localization.namePlaceholder}
                            required={nameRequired}
                        />
                    </div>
                )}

            {credentials && usernamePlugin && ["signIn", "signUp"].includes(view) && (
                <div className="grid gap-2">
                    <Label className={classNames?.label} htmlFor="username">
                        {localization.username}
                    </Label>

                    <Input
                        className={classNames?.input}
                        id="username"
                        name="username"
                        placeholder={localization.usernamePlaceholder}
                        required
                    />
                </div>
            )}

            {(credentials || (["signIn", "magicLink"].includes(view) && magicLink)) &&
                (!usernamePlugin || ["signUp", "magicLink", "forgotPassword"].includes(view)) && (
                    <div className="grid gap-2">
                        <Label className={classNames?.label} htmlFor="email">
                            {localization.email}
                        </Label>

                        <Input
                            className={classNames?.input}
                            id="email"
                            name="email"
                            placeholder={localization.emailPlaceholder}
                            required
                            type="email"
                        />
                    </div>
                )}

            {credentials && ["signUp", "signIn"].includes(view) && (
                <>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label className={classNames?.label} htmlFor="password">
                                {localization.password}
                            </Label>

                            {forgotPassword && (
                                <Link
                                    className={cn(
                                        "-my-1 ml-auto inline-block text-sm hover:underline",
                                        classNames?.forgotPasswordLink
                                    )}
                                    href={`${basePath}/${viewPaths.forgotPassword}`}
                                >
                                    {localization.forgotPasswordLink}
                                </Link>
                            )}
                        </div>

                        <PasswordInput
                            id="password"
                            name="password"
                            autoComplete={["signUp"].includes(view) ? "new-password" : "password"}
                            className={classNames?.input}
                            placeholder={localization.passwordPlaceholder}
                            required
                        />
                    </div>

                    {confirmPasswordEnabled && ["signUp"].includes(view) && (
                        <ConfirmPasswordInput classNames={classNames} localization={localization} />
                    )}
                </>
            )}

            {view === "signUp" &&
                signUpFields
                    ?.filter((field) => field !== "name")
                    .map((field) => {
                        const additionalField = additionalFields?.[field]

                        if (!additionalField) {
                            console.error(`Invalid additional field: ${field}`)
                            return null
                        }

                        return (
                            <AdditionalFieldInput
                                key={field}
                                field={field}
                                additionalField={additionalField}
                                classNames={classNames}
                            />
                        )
                    })}

            <div className="flex flex-col gap-4">
                {(credentials || (["signIn", "magicLink"].includes(view) && magicLink)) && (
                    <ActionButton
                        authView={view}
                        className={cn(classNames?.button, classNames?.primaryButton)}
                        isLoading={isLoading}
                        localization={localization}
                    />
                )}
            </div>
        </form>
    )
}
