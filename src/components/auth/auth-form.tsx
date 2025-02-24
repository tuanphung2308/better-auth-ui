"use client"

import { Loader2 } from "lucide-react"
import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react"
import { toast } from "sonner"

import { AuthUIContext, type AuthView } from "../../lib/auth-ui-provider"
import { cn, isValidEmail } from "../../lib/utils"
import { type SocialProvider, socialProviders } from "../../social-providers"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

import { ActionButton } from "./action-button"
import { authLocalization } from "./auth-card"
import { MagicLinkButton } from "./magic-link-button"
import { PasskeyButton } from "./passkey-button"
import { ProviderButton } from "./provider-button"

export type AuthFormClassNames = {
    base?: string
    actionButton?: string
    forgotPasswordLink?: string
    input?: string
    label?: string
    providerButton?: string
    secondaryButton?: string
}

export function AuthForm({
    className,
    classNames,
    callbackURL,
    localization,
    pathname,
    redirectTo,
    signUpName,
    socialLayout = "auto",
    view,
    onSessionChange
}: {
    className?: string,
    classNames?: AuthFormClassNames,
    callbackURL?: string,
    localization?: Partial<typeof authLocalization>,
    pathname?: string,
    redirectTo?: string,
    signUpName?: boolean,
    socialLayout?: "auto" | "horizontal" | "grid" | "vertical",
    view?: AuthView,
    onSessionChange?: () => void,
}) {
    const getRedirectTo = useCallback(() => redirectTo || new URLSearchParams(window.location.search).get("redirectTo") || "/", [redirectTo])
    const getCallbackURL = useCallback(() => callbackURL || getRedirectTo(), [callbackURL, getRedirectTo])
    const [isLoading, setIsLoading] = useState(false)

    localization = { ...authLocalization, ...localization }

    const {
        authClient,
        credentials,
        forgotPassword,
        magicLink,
        navigate,
        passkey,
        providers,
        username: usernamePlugin,
        viewPaths,
        LinkComponent
    } = useContext(AuthUIContext)

    if (socialLayout == "auto") {
        socialLayout = !credentials ? "vertical" : (providers && providers.length > 3 ? "horizontal" : "vertical")
    }

    const path = pathname?.split("/").pop()

    if (path && !Object.values(viewPaths).includes(path)) {
        console.error(`Invalid auth view: ${path}`)
    }

    view = view || (Object.entries(viewPaths).find(([_, value]) => value === path)?.[0] || "signIn") as AuthView

    const formAction = async (formData: FormData) => {
        const provider = formData.get("provider") as SocialProvider

        if (provider) {
            const { error } = await authClient.signIn.social({ provider, callbackURL: getCallbackURL() })
            if (error) {
                toast.error(error.message || error.statusText)
            } else {
                setIsLoading(true)
            }

            return
        }

        if (formData.get("passkey")) {
            // @ts-expect-error Optional plugin
            const { error } = await authClient.signIn.passkey({ callbackURL: getCallbackURL() })
            if (error) {
                toast.error(error.message || error.statusText)
            } else {
                setIsLoading(true)
            }
            return
        }

        let email = formData.get("email") as string
        const password = formData.get("password") as string
        const name = formData.get("name") || "" as string

        switch (view) {
            case "signIn": {
                if (!credentials) {
                    // @ts-expect-error Optional plugin
                    const { error } = await authClient.signIn.magicLink({ email, callbackURL: getCallbackURL() })

                    if (error) {
                        toast.error(error.message || error.statusText)
                    } else {
                        toast.success(localization.magicLinkEmail)
                    }

                    return
                }

                if (usernamePlugin) {
                    const username = formData.get("username") as string

                    if (!isValidEmail(username)) {
                        // @ts-expect-error Optional plugin
                        const { error } = await authClient.signIn.username({
                            username,
                            password
                        })

                        if (error) {
                            toast.error(error.message || error.statusText)
                        } else {
                            setIsLoading(true)
                            onSessionChange?.()
                            navigate(getRedirectTo())
                        }

                        return
                    } else {
                        email = username
                    }
                }

                const { error } = await authClient.signIn.email({ email, password })
                if (error) {
                    toast.error(error.message || error.statusText)
                } else {
                    setIsLoading(true)
                    onSessionChange?.()
                    navigate(getRedirectTo())
                }

                break
            }

            case "magicLink": {
                // @ts-expect-error Optional plugin
                const { error } = await authClient.signIn.magicLink({ email, callbackURL: getCallbackURL() })

                if (error) {
                    toast.error(error.message || error.statusText)
                } else {
                    toast.success(localization.magicLinkEmail)
                }

                break
            }

            case "signUp": {
                const params = { email, password, name, callbackURL: getCallbackURL() } as Record<string, unknown>

                if (usernamePlugin) {
                    params.username = formData.get("username")
                }

                // @ts-expect-error We omit signUp from the authClient type to support additional fields
                const { data, error } = await authClient.signUp.email(params)

                if (error) {
                    toast.error(error.message || error.statusText)
                } else if (data.token) {
                    setIsLoading(true)
                    onSessionChange?.()
                    navigate(getRedirectTo())
                } else {
                    navigate(viewPaths.signIn)
                    toast.success(localization.signUpEmail)
                }

                break
            }

            case "forgotPassword": {
                const { error } = await authClient.forgetPassword({
                    email: email,
                    redirectTo: window.location.pathname.replace(viewPaths.forgotPassword, viewPaths.resetPassword)
                })

                if (error) {
                    toast.error(error.message || error.statusText)
                } else {
                    toast.success(localization.forgotPasswordEmail)
                    navigate(viewPaths.signIn)
                }

                break
            }

            case "resetPassword": {
                const searchParams = new URLSearchParams(window.location.search)
                const token = searchParams.get("token") as string

                const { error } = await authClient.resetPassword({
                    newPassword: password,
                    token
                })

                if (error) {
                    toast.error(error.message || error.statusText)
                } else {
                    toast.success(localization.resetPasswordSuccess)
                    navigate(viewPaths.signIn)
                }

                break
            }
        }
    }

    const signingOut = useRef(false)
    const checkingResetPasswordToken = useRef(false)

    useEffect(() => {
        if (view != "signOut" || signingOut.current) return

        signingOut.current = true
        authClient.signOut().finally(async () => {
            navigate(getRedirectTo())
            onSessionChange?.()
            signingOut.current = false
        })
    }, [view, authClient, navigate, viewPaths.signIn, onSessionChange, getRedirectTo])

    useEffect(() => {
        if (view != "resetPassword" || checkingResetPasswordToken.current) return

        checkingResetPasswordToken.current = true

        const searchParams = new URLSearchParams(window.location.search)
        const token = searchParams.get("token")
        if (!token || token == "INVALID_TOKEN") {
            navigate(viewPaths.signIn)
            setTimeout(() => {
                toast.error(localization.resetPasswordInvalidToken)
                checkingResetPasswordToken.current = false
            }, 100)
        }
    }, [view, viewPaths, navigate, localization])

    useEffect(() => {
        if (view == "magicLink" && !magicLink) {
            navigate(viewPaths.signIn)
        }

        if (["signUp", "forgotPassword", "resetPassword"].includes(view) && !credentials) {
            navigate(viewPaths.signIn)
        }
    }, [view, viewPaths, credentials, navigate, magicLink])

    if (view == "signOut") return (
        <Loader2 className="animate-spin" />
    )

    return (
        <form
            action={formAction}
            className={cn("grid gap-4 w-full", className, classNames?.base)}
        >
            {credentials && view == "signUp" && signUpName && (
                <div className="grid gap-2">
                    <Label className={classNames?.label} htmlFor="name">
                        {localization.name}
                    </Label>

                    <Input
                        className={classNames?.input}
                        id="name"
                        name="name"
                        placeholder={localization.namePlaceholder}
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
                        placeholder={view == "signIn" ? localization.usernameSignInPlaceholder : localization.usernameSignUpPlaceholder}
                        required
                    />
                </div>
            )}

            {(credentials || (["signIn", "magicLink"].includes(view) && magicLink)) && ((!usernamePlugin && view != "resetPassword") || ["signUp", "magicLink", "forgotPassword"].includes(view)) && (
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
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label className={classNames?.label} htmlFor="password">
                            {localization.password}
                        </Label>

                        {view == "signIn" && forgotPassword && (
                            <LinkComponent
                                className={cn("ml-auto inline-block text-sm hover:underline -my-1",
                                    classNames?.forgotPasswordLink
                                )}
                                href="forgot-password"
                                to="forgot-password"
                            >
                                {localization.forgotPasswordLink}
                            </LinkComponent>
                        )}
                    </div>

                    <Input
                        autoComplete={["signUp", "resetPassword"].includes(view!) ? "new-password" : "password"}
                        className={classNames?.input}
                        id="password"
                        name="password"
                        placeholder={localization.passwordPlaceholder}
                        required
                        type="password"
                    />
                </div>
            )}

            {(credentials || (["signIn", "magicLink"].includes(view) && magicLink)) && (
                <ActionButton
                    authView={view}
                    className={classNames?.actionButton}
                    isLoading={isLoading}
                    localization={localization}
                />
            )}

            {magicLink && credentials && view != "resetPassword" && (
                <MagicLinkButton
                    className={classNames?.secondaryButton}
                    isLoading={isLoading}
                    localization={localization}
                    view={view}
                />
            )}

            {!["forgotPassword", "resetPassword"].includes(view) && providers?.length && (
                <>
                    <div
                        className={cn(
                            "w-full gap-2 flex items-center",
                            "justify-between",
                            socialLayout == "horizontal" && "flex-wrap",
                            socialLayout == "vertical" && "flex-col"
                        )}
                    >
                        {providers?.map((provider) => {
                            const socialProvider = socialProviders.find((socialProvider) => socialProvider.provider == provider)
                            if (!socialProvider) return null

                            return (
                                <ProviderButton
                                    key={provider}
                                    className={classNames?.providerButton}
                                    isLoading={isLoading}
                                    localization={localization}
                                    socialLayout={socialLayout}
                                    socialProvider={socialProvider}
                                />
                            )
                        })}
                    </div>

                    {passkey && (
                        <PasskeyButton
                            className={classNames?.secondaryButton}
                            isLoading={isLoading}
                            localization={localization}
                        />
                    )}
                </>
            )}
        </form>
    )
}