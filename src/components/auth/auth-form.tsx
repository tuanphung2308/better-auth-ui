"use client"

import type { SocialProvider } from "better-auth/social-providers"
import { Loader2 } from "lucide-react"
import { useCallback, useContext, useEffect, useRef, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { getErrorMessage } from "../../lib/get-error-message"
import { socialProviders } from "../../lib/social-providers"
import { cn, isValidEmail } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { ConfirmPasswordInput } from "../confirm-password-input"
import { PasswordInput } from "../password-input"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import { ActionButton } from "./action-button"
import { AdditionalFieldInput } from "./additional-field-input"
import { MagicLinkButton } from "./magic-link-button"
import { PasskeyButton } from "./passkey-button"
import { ProviderButton } from "./provider-button"
import { RememberMeCheckbox } from "./remember-me-checkbox"

export type AuthFormClassNames = {
    base?: string
    actionButton?: string
    forgotPasswordLink?: string
    input?: string
    label?: string
    description?: string
    providerButton?: string
    secondaryButton?: string
}

export interface AuthFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    localization?: Partial<AuthLocalization>
    pathname?: string
    redirectTo?: string
    socialLayout?: "auto" | "horizontal" | "grid" | "vertical"
    view?: AuthView
}

export function AuthForm({
    className,
    classNames,
    callbackURL,
    localization,
    pathname,
    redirectTo,
    socialLayout = "auto",
    view
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
        rememberMe,
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

    if (socialLayout === "auto") {
        socialLayout = !credentials
            ? "vertical"
            : providers && providers.length > 2
              ? "horizontal"
              : "vertical"
    }

    const path = pathname?.split("/").pop()

    if (path && !Object.values(viewPaths).includes(path)) {
        console.error(`Invalid auth view: ${path}`)
    }

    view =
        view ||
        ((Object.entries(viewPaths).find(([_, value]) => value === path)?.[0] ||
            "signIn") as AuthView)

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

            let email = formData.get("email") as string
            const password = formData.get("password") as string
            const name = formData.get("name") || ("" as string)

            switch (view) {
                case "signIn": {
                    if (!credentials) {
                        await (authClient as AuthClient).signIn.magicLink({
                            email,
                            callbackURL: getCallbackURL(),
                            fetchOptions: { throw: true }
                        })

                        toast({ variant: "success", message: localization.magicLinkEmail! })
                        return
                    }

                    const params = {
                        password,
                        rememberMe: !rememberMe || formData.has("rememberMe")
                    }

                    if (usernamePlugin) {
                        const username = formData.get("username") as string

                        if (isValidEmail(username)) {
                            email = username
                        } else {
                            await (authClient as AuthClient).signIn.username({
                                username,
                                ...params,
                                fetchOptions: { throw: true }
                            })

                            onSuccess()
                            return
                        }
                    }

                    const response = (await authClient.signIn.email({
                        email,
                        ...params,
                        fetchOptions: { throw: true }
                    })) as Awaited<ReturnType<AuthClient["signIn"]["email"]>>

                    if (response.twoFactorRedirect) {
                        // Redirect to 2FA verification screen if required
                        navigate(`${basePath}/${viewPaths.twoFactor}`)
                    } else {
                        onSuccess()
                    }

                    break
                }

                case "magicLink": {
                    await (authClient as AuthClient).signIn.magicLink({
                        email,
                        callbackURL: getCallbackURL(),
                        fetchOptions: { throw: true }
                    })

                    toast({ variant: "success", message: localization.magicLinkEmail! })
                    break
                }

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
                                    message: `${localization.failedToValidate} ${field}`
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

                case "forgotPassword": {
                    await authClient.forgetPassword({
                        email: email,
                        redirectTo: `${baseURL}${basePath}/${viewPaths.resetPassword}`,
                        fetchOptions: { throw: true }
                    })

                    toast({ variant: "success", message: localization.forgotPasswordEmail! })
                    break
                }

                case "resetPassword": {
                    if (confirmPasswordEnabled) {
                        const confirmPassword = formData.get("confirmPassword") as string
                        if (password !== confirmPassword) {
                            toast({ variant: "error", message: localization.passwordsDoNotMatch! })
                            return
                        }
                    }

                    const searchParams = new URLSearchParams(window.location.search)
                    const token = searchParams.get("token") as string

                    await authClient.resetPassword({
                        newPassword: password,
                        token,
                        fetchOptions: { throw: true }
                    })

                    toast({ variant: "success", message: localization.resetPasswordSuccess! })
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
                        placeholder={
                            view === "signIn"
                                ? localization.usernameSignInPlaceholder
                                : localization.usernamePlaceholder
                        }
                        required
                    />
                </div>
            )}

            {(credentials || (["signIn", "magicLink"].includes(view) && magicLink)) &&
                ((!usernamePlugin && view !== "resetPassword") ||
                    ["signUp", "magicLink", "forgotPassword"].includes(view)) && (
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

            {credentials && ["signUp", "signIn", "resetPassword"].includes(view) && (
                <>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label className={classNames?.label} htmlFor="password">
                                {localization.password}
                            </Label>

                            {view === "signIn" && forgotPassword && (
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
                            autoComplete={
                                ["signUp", "resetPassword"].includes(view)
                                    ? "new-password"
                                    : "password"
                            }
                            className={classNames?.input}
                            enableToggle={view !== "signIn"}
                            placeholder={localization.passwordPlaceholder}
                            required
                        />
                    </div>

                    {confirmPasswordEnabled && ["signUp", "resetPassword"].includes(view) && (
                        <ConfirmPasswordInput classNames={classNames} localization={localization} />
                    )}
                </>
            )}

            {view === "signIn" && rememberMe && <RememberMeCheckbox localization={localization} />}

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
                        className={classNames?.actionButton}
                        isLoading={isLoading}
                        localization={localization}
                    />
                )}

                {magicLink && credentials && view !== "resetPassword" && (
                    <MagicLinkButton
                        className={classNames?.secondaryButton}
                        isLoading={isLoading}
                        localization={localization}
                        view={view}
                    />
                )}
            </div>

            {!["forgotPassword", "resetPassword"].includes(view) &&
                (providers?.length || otherProviders?.length) && (
                    <>
                        {credentials && (
                            <div className="flex items-center gap-2">
                                <Separator className="!w-auto grow" />

                                <span className="flex-shrink-0 text-muted-foreground text-sm">
                                    {localization.orContinueWith}
                                </span>

                                <Separator className="!w-auto grow" />
                            </div>
                        )}

                        <div
                            className={cn(
                                "flex w-full items-center gap-4",
                                "justify-between",
                                socialLayout === "horizontal" && "flex-wrap",
                                socialLayout === "vertical" && "flex-col",
                                socialLayout === "grid" && "grid grid-cols-2"
                            )}
                        >
                            {providers?.map((provider) => {
                                const socialProvider = socialProviders.find(
                                    (socialProvider) => socialProvider.provider === provider
                                )
                                if (!socialProvider) return null

                                return (
                                    <ProviderButton
                                        key={provider}
                                        className={classNames?.providerButton}
                                        isLoading={isLoading}
                                        localization={localization}
                                        socialLayout={socialLayout}
                                        provider={socialProvider}
                                    />
                                )
                            })}

                            {otherProviders?.map((provider) => (
                                <ProviderButton
                                    key={provider.provider}
                                    className={classNames?.providerButton}
                                    isLoading={isLoading}
                                    localization={localization}
                                    socialLayout={socialLayout}
                                    provider={provider}
                                    other
                                />
                            ))}
                        </div>
                    </>
                )}

            {passkey && (
                <PasskeyButton
                    className={classNames?.secondaryButton}
                    isLoading={isLoading}
                    localization={localization}
                />
            )}
        </form>
    )
}
