import { FormEvent, ReactNode, useEffect, useState } from "react"
import { NextRouter } from "next/router"
import { createAuthClient } from "better-auth/react"

import { cn } from "@/lib/utils"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { AlertCircle, Key, Loader2, LockIcon, MailIcon } from "lucide-react"
import { SocialProvider, socialProviders } from "../social-providers"
import { Icon } from "@iconify/react"
import { useIsHydrated } from "../hooks/use-is-hydrated"

type AuthClient = ReturnType<typeof createAuthClient>

export const authViews = ["login", "signup", "magic-link", "forgot-password", "reset-password", "logout"] as const
export type AuthView = typeof authViews[number]

const DefaultLink = (
    { href, className, children }: { href: string, className?: string, children: ReactNode }
) => (
    <a href={href} className={className}>
        {children}
    </a>
)

const defaultNavigate = (href: string) => window.location.href = href

export const defaultLocalization = {
    login_title: "Login",
    signup_title: "Sign up",
    magic_link_title: "Magic link",
    forgot_password_title: "Forgot password",
    reset_password_title: "Reset password",
    login_description: "Enter your email to login to your account",
    signup_description: "Enter your information to create your account",
    magic_link_description: "Enter your email to receive a magic link",
    forgot_password_description: "Enter your email to reset your password",
    provider_description: "Choose a provider to continue",
    email_label: "Email",
    username_label: "Username",
    name_label: "Name",
    password_label: "Password",
    email_placeholder: "m@example.com",
    username_placeholder: "Username",
    name_placeholder: "Name",
    password_placeholder: "Password",
    login_button: "Login",
    signup_button: "Create account",
    magic_link_button: "Send magic link",
    forgot_password_button: "Send reset link",
    reset_password_button: "Save new password",
    provider_prefix: "Continue with",
    magic_link_provider: "Magic Link",
    passkey_provider: "Passkey",
    password_provider: "Password",
    login_footer: "Don't have an account?",
    signup_footer: "Already have an account?",
    forgot_password: "Forgot your password?",
    login: "Login",
    signup: "Sign up",
    verification_link_email: "Check your email for the verification link",
    reset_password_email: "Check your email for the password reset link",
    magic_link_email: "Check your email for the magic link",
    error: "Error",
    alert: "Alert",
    or_continue_with: "Or continue with",
}

type AuthToastOptions = {
    description: string
    variant: "default" | "destructive"
    action?: {
        label: string
        onClick: () => void
    }
}

export interface AuthCardProps {
    authClient: AuthClient,
    navigate?: (url: string) => void
    pathname?: string
    nextRouter?: NextRouter
    initialView?: AuthView
    emailPassword?: boolean
    username?: boolean
    forgotPassword?: boolean
    magicLink?: boolean
    passkey?: boolean
    providers?: SocialProvider[]
    socialLayout?: "horizontal" | "vertical"
    localization?: Partial<typeof defaultLocalization>
    disableRouting?: boolean
    disableAnimation?: boolean
    signUpWithName?: boolean
    callbackURL?: string
    toast?: (options: AuthToastOptions) => void
    LinkComponent?: React.ComponentType<{ href: string, className?: string, children: ReactNode }>
}

const hideElementClass = "opacity-0 scale-y-0 h-0 overflow-hidden"
const transitionClass = "transition-all"

export function AuthCard({
    authClient,
    navigate,
    pathname,
    nextRouter,
    initialView,
    emailPassword = true,
    forgotPassword = true,
    magicLink,
    passkey,
    providers,
    socialLayout,
    localization,
    disableRouting,
    disableAnimation,
    signUpWithName,
    callbackURL,
    toast,
    LinkComponent = DefaultLink
}: AuthCardProps) {
    const isHydrated = useIsHydrated()
    localization = { ...defaultLocalization, ...localization }
    navigate = navigate || nextRouter?.push || defaultNavigate
    pathname = pathname || nextRouter?.asPath
    socialLayout = socialLayout || ((providers && providers.length > 2 && (emailPassword || magicLink)) ? "horizontal" : "vertical")

    const getCurrentView = () => {
        const currentPathname = isHydrated ? window.location.pathname : pathname
        const path = currentPathname?.split("/").pop()?.split("?")[0]
        if (authViews.includes(path as AuthView)) {
            return path as AuthView
        }

        return null
    }

    const getPathname = (view: AuthView) => {
        const currentPathname = isHydrated ? window.location.pathname : pathname
        const path = currentPathname?.split("/").slice(0, -1).join("/")
        return `${path}/${view}`
    }

    callbackURL = callbackURL || (nextRouter?.query?.callbackURL as string) || "/"

    const { data: sessionData } = authClient.useSession()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState(disableRouting ? initialView : getCurrentView())
    const [authToast, setAuthToast] = useState<AuthToastOptions | null>(null)

    const onSubmit = async (e: FormEvent) => {
        e?.preventDefault()

        setAuthToast(null)
        setLoading(true)

        let apiError: {
            code?: string
            message?: string
            status: number
            statusText: string
        } | null = null

        switch (view) {
            case "login": {
                const { error } = await authClient.signIn.email({ email, password })
                apiError = error

                break
            }
            case "signup": {
                const { error } = await authClient.signUp.email({ email, password, name })
                apiError = error

                break
            }
            case "magic-link": {
                const { error } = await (authClient.signIn as any).magicLink({
                    email,
                    callbackURL
                })
                apiError = error

                if (!error) {
                    setEmail("")
                    setAuthToast({
                        description: localization.magic_link_email!,
                        variant: "default"
                    })
                }

                break
            }
            case "forgot-password": {
                const { error } = await authClient.forgetPassword({
                    email: email,
                    redirectTo: getPathname("reset-password")
                })
                apiError = error

                if (!error) {
                    setView("login")

                    setAuthToast({
                        description: localization.reset_password_email!,
                        variant: "default"
                    })
                }

                break
            }
            case "reset-password": {
                break
            }
        }

        setLoading(false)

        if (apiError?.message) {
            setAuthToast({
                description: apiError.message,
                variant: "destructive"
            })
        }
    }

    useEffect(() => {
        if (sessionData && !(sessionData.user as Record<string, unknown>)?.isAnonymous) {
            navigate(callbackURL)
        }
    }, [sessionData])

    useEffect(() => {
        if (!pathname) return
        const currentView = getCurrentView()

        if (currentView) {
            setView(currentView)
        }
    }, [pathname])

    useEffect(() => {
        if (!authToast || !toast) return
        toast(authToast)
    }, [authToast])

    useEffect(() => {
        if (!view) return

        if (!magicLink && view == "magic-link") setView("login")
        if (magicLink && !emailPassword && view == "login") setView("magic-link")
        if (["signup", "forgot-password", "reset-password"].includes(view) && !emailPassword) setView(magicLink ? "magic-link" : "login")

        if (!disableRouting) {
            console.log("navigate to", getPathname(view))
            setTimeout(() => {
                navigate(getPathname(view))
            })
        }
    }, [magicLink, emailPassword, view])

    return (
        <Card
            className={cn(!view && "opacity-0",
                !disableAnimation && transitionClass,
                "max-w-sm w-full"
            )}
        >
            <CardHeader>
                <CardTitle className="text-2xl">
                    {view && localization[`${view.replace("-", "_")}_title` as keyof typeof localization]}
                </CardTitle>

                <CardDescription>
                    {(emailPassword || magicLink) ? (view && localization[`${view.replace("-", "_")}_description` as keyof typeof localization])
                        : localization.provider_description}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="grid" onSubmit={onSubmit}>
                    {signUpWithName && (
                        <div
                            className={cn(view != "signup" ? hideElementClass : "mb-6",
                                "grid gap-2"
                            )}
                        >
                            <Label htmlFor="name">
                                {localization.name_label}
                            </Label>

                            <Input
                                id="name"
                                required
                                placeholder={localization.name_placeholder}
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                disabled={view != "signup"}
                            />
                        </div>
                    )}

                    {(emailPassword || magicLink) && (
                        <div className="grid gap-2 mb-6">
                            <Label htmlFor="email">
                                {localization.email_label}
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder={localization.email_placeholder}
                                required
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                }}
                                value={email}
                            />
                        </div>
                    )}

                    {emailPassword && (
                        <div
                            className={cn(
                                (view == "magic-link" || view == "forgot-password") ? hideElementClass : "mb-6 h-[62px]",
                                !disableAnimation && transitionClass,
                                "grid gap-2"
                            )}
                        >
                            <div className="flex items-center relative">
                                <Label htmlFor="password">
                                    {localization.password_label}
                                </Label>

                                {forgotPassword && (
                                    <div
                                        className={cn(
                                            view == "login" ? "h-6" : hideElementClass,
                                            !disableAnimation && transitionClass,
                                            "absolute right-0"
                                        )}
                                    >
                                        <Button
                                            asChild={!disableRouting}
                                            variant="link"
                                            size="sm"
                                            className="text-sm px-1 h-fit text-foreground hover-underline"
                                            onClick={() => setView("forgot-password")}
                                            disabled={view != "login"}
                                            tabIndex={view != "login" ? -1 : undefined}
                                        >
                                            {disableRouting ? (
                                                localization.forgot_password
                                            ) : (
                                                <LinkComponent href={getPathname("forgot-password")}>
                                                    {localization.forgot_password}
                                                </LinkComponent>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Input
                                id="password"
                                required
                                type="password"
                                placeholder="Password"
                                autoComplete="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={view == "magic-link" || view == "forgot-password"}
                            />
                        </div>
                    )}

                    {!toast && (
                        <div
                            className={cn(!authToast ? hideElementClass : "mb-6",
                                !disableAnimation && transitionClass,
                            )}
                        >
                            <Alert
                                variant={authToast?.variant}
                                className={authToast?.variant == "destructive" ? "bg-destructive/10" : "bg-foreground/5"}
                            >
                                {authToast?.action && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="absolute top-5 right-4 text-foreground"
                                        onClick={authToast?.action.onClick}
                                    >
                                        {authToast?.action.label}
                                    </Button>
                                )}

                                <AlertCircle className="h-4 w-4" />

                                <AlertTitle>
                                    {authToast?.variant == "destructive" ? localization.error : localization.alert}
                                </AlertTitle>

                                <AlertDescription>
                                    {authToast?.description}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <div className="flex flex-col">
                        {(emailPassword || magicLink) && (
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    view && localization[`${view.replace("-", "_")}_button` as keyof typeof localization]
                                )}
                            </Button>
                        )}

                        <div
                            className={cn((!view || !["signup", "login"].includes(view) || !magicLink) ? hideElementClass : "mt-4",
                                !disableAnimation && transitionClass,
                            )}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2 w-full"
                                onClick={() => {
                                    setView("magic-link")
                                }}
                                disabled={!view || !["signup", "login"].includes(view) || !magicLink}
                            >
                                <MailIcon className="w-4 h-4" />
                                {localization.provider_prefix}
                                {" "}
                                {localization.magic_link_provider}
                            </Button>
                        </div>

                        <div
                            className={cn((view != "magic-link" || !emailPassword) ? hideElementClass : "mt-4",
                                !disableAnimation && transitionClass,
                            )}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2 w-full"
                                onClick={() => setView("login")}
                                disabled={view != "magic-link" || !emailPassword}
                            >
                                <LockIcon className="w-4 h-4" />
                                {localization.provider_prefix}
                                {" "}
                                {localization.password_provider}
                            </Button>
                        </div>

                        {passkey && (
                            <div
                                className={cn(!view || !["login", "magic-link"].includes(view) ? hideElementClass : "mt-4",
                                    !disableAnimation && transitionClass,
                                )}
                            >
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="gap-2 w-full"
                                    onClick={async () => {
                                        const { error } = await (authClient.signIn as any).passkey()

                                        if (error) {
                                            setAuthToast({
                                                description: error.message!,
                                                variant: "destructive"
                                            })
                                        }
                                    }}
                                    disabled={!view || !["login", "magic-link"].includes(view)}
                                >
                                    <Key className="w-4 h-4" />
                                    {localization.provider_prefix}
                                    {" "}
                                    {localization.passkey_provider}
                                </Button>
                            </div>
                        )}
                    </div>
                </form>

                <div
                    className={cn((!view || !providers?.length || !["login", "signup", "magic-link"].includes(view)) ? hideElementClass : "",
                        !disableAnimation && transitionClass,
                        "flex flex-col gap-6"
                    )}
                >
                    {(emailPassword || magicLink || passkey) && (
                        <div className="mt-6 relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                            <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                {localization.or_continue_with}
                            </span>
                        </div>
                    )}

                    <div
                        className={cn(
                            "w-full gap-4 flex items-center",
                            "justify-between flex-wrap transition-all",
                        )}
                    >
                        {providers?.map((provider) => {
                            const socialProvider = socialProviders.find((p) => p.provider == provider)
                            if (!socialProvider) return null
                            return (
                                <Button
                                    key={provider}
                                    variant="outline"
                                    className="grow"
                                    disabled={loading || !view || !["login", "signup", "magic-link"].includes(view)}
                                    onClick={async () => {
                                        const { error } = await authClient.signIn.social({
                                            provider,
                                            callbackURL
                                        })

                                        if (error) {
                                            setAuthToast({
                                                description: error.message!,
                                                variant: "destructive"
                                            })
                                        }
                                    }}
                                >
                                    <Icon icon={socialProvider.icon} />

                                    {socialLayout == "vertical" && (
                                        <>
                                            {localization.provider_prefix}
                                            {" "}
                                            {socialProvider.name}
                                        </>
                                    )}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </CardContent>

            {emailPassword && (
                <CardFooter className="justify-center text-sm text-muted-foreground">
                    {view && (["signup", "forgot-password"].includes(view) ? (
                        localization.signup_footer
                    ) : (
                        localization.login_footer
                    ))}

                    <Button
                        asChild={!disableRouting}
                        variant="link"
                        size="sm"
                        className="text-sm px-1 h-fit underline text-foreground"
                        onClick={() => setView((view == "signup" || view == "forgot-password") ? "login" : "signup")}
                    >
                        {view && (disableRouting ? (
                            ["signup", "forgot-password"].includes(view) ? localization.login : localization.signup
                        ) : (
                            <LinkComponent
                                href={(view == "signup" || view == "forgot-password") ?
                                    getPathname("login")
                                    : getPathname("signup")
                                }
                            >
                                {["signup", "forgot-password"].includes(view) ? localization.login : localization.signup}
                            </LinkComponent>
                        ))}
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}