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

type AuthClient = ReturnType<typeof createAuthClient>

export const authViews = ["login", "signup", "forgot-password", "reset-password", "logout"] as const
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
    signup_title: "Sign Up",
    forgot_password_title: "Forgot Password",
    reset_password_title: "Reset Password",
    login_description: "Enter your email below to login to your account",
    signup_description: "Enter your information to create an account",
    forgot_password_description: "Enter your email to reset your password",
    email_label: "Email Address",
    username_label: "Username",
    name_label: "Name",
    password_label: "Password",
    email_placeholder: "m@example.com",
    username_placeholder: "Username",
    name_placeholder: "Name",
    password_placeholder: "Password",
    login_button: "Login",
    signup_button: "Sign Up",
    forgot_password_button: "Send Reset Link",
    reset_password_button: "Reset Password",
    provider_prefix: "Continue with",
    magic_link_provider: "Magic Link",
    passkey_provider: "Passkey",
    password_provider: "Password",
    login_footer: "Don't have an account?",
    signup_footer: "Already have an account?",
    forgot_password: "Forgot your password?",
    login: "Login",
    signup: "Sign Up",
    email_confirmation_text: "Check your email for the confirmation link",
    email_reset_password_text: "Check your email for the password reset link",
    magic_link_email: "Check your email for the Magic Link",
    error: "Error",
    alert: "Alert"
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
    magicLink?: boolean
    startWithMagicLink?: boolean
    passkey?: boolean
    providers?: SocialProvider[]
    socialLayout?: "horizontal" | "vertical"
    localization?: Partial<typeof defaultLocalization>
    disableRouting?: boolean
    disableAnimation?: boolean
    signUpWithName?: boolean
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
    initialView = "login",
    emailPassword = true,
    magicLink,
    startWithMagicLink,
    passkey,
    providers,
    socialLayout,
    localization,
    disableRouting,
    disableAnimation,
    signUpWithName,
    toast,
    LinkComponent = DefaultLink
}: AuthCardProps) {
    localization = { ...defaultLocalization, ...localization }
    navigate = navigate || nextRouter?.push || defaultNavigate
    pathname = pathname || nextRouter?.asPath
    socialLayout = socialLayout || ((providers && providers.length > 3) ? "horizontal" : "vertical")

    const { data: sessionData, isPending } = authClient.useSession()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState(initialView)
    const [isMagicLink, setIsMagicLink] = useState(startWithMagicLink || !emailPassword)
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
                if (isMagicLink) {
                    const { error } = await (authClient.signIn as any).magicLink({ email })
                    apiError = error

                    if (!error) {
                        setEmail("")
                        setAuthToast({
                            description: localization.magic_link_email!,
                            variant: "default"
                        })
                    }
                } else {
                    const { error } = await authClient.signIn.email({ email, password })
                    apiError = error
                }

                break
            }
            case "signup": {
                const { error } = await authClient.signUp.email({ email, password, name })
                apiError = error
                break
            }
            case "forgot-password": {
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
            navigate("/")
        }
    }, [sessionData])

    useEffect(() => {
        if (!pathname) return
        const path = pathname.split("/").pop()

        if (authViews.includes(path as AuthView)) {
            setView(path as AuthView)
        }
    }, [pathname])

    useEffect(() => {
        if (!authToast || !toast) return
        toast(authToast)
    }, [authToast])

    useEffect(() => {
        if (!magicLink) setIsMagicLink(false)
        if (!emailPassword) setIsMagicLink(true)
    }, [magicLink, emailPassword])

    return (
        <Card
            className={cn(((nextRouter && !nextRouter.isReady) || isPending) && "opacity-0",
                !disableAnimation && transitionClass,
                "max-w-sm w-full"
            )}
        >
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                    {localization[`${view.replace("-", "_")}_title` as keyof typeof localization]}
                </CardTitle>

                <CardDescription className="text-xs md:text-sm">
                    {localization[`${view.replace("-", "_")}_description` as keyof typeof localization]}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="grid" onSubmit={onSubmit}>
                    <div
                        className={cn(!signUpWithName || view != "signup" ? hideElementClass : "mb-4",
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
                            disabled={!signUpWithName || view != "signup"}
                        />
                    </div>

                    <div className="grid gap-2 mb-4">
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

                    <div
                        className={cn(((isMagicLink && view == "login") || view == "forgot-password") ? hideElementClass : "mb-4 h-[62px]",
                            !disableAnimation && transitionClass,
                            "grid gap-2"
                        )}
                    >
                        <div className="flex items-center relative">
                            <Label htmlFor="password">
                                {localization.password_label}
                            </Label>

                            <div
                                className={cn(
                                    view == "login" && !isMagicLink ? "h-6" : hideElementClass,
                                    !disableAnimation && transitionClass,
                                    "absolute right-0"
                                )}
                            >
                                <Button
                                    asChild={!disableRouting}
                                    variant="link"
                                    size="sm"
                                    className="text-sm px-1 h-fit hover-underline"
                                    onClick={() => setView("forgot-password")}
                                >
                                    {disableRouting ? (
                                        localization.forgot_password
                                    ) : (
                                        <LinkComponent href="/auth/forgot-password">
                                            {localization.forgot_password}
                                        </LinkComponent>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isMagicLink && view == "login"}
                        />
                    </div>

                    <div className="flex flex-col">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                localization[`${view.replace("-", "_")}_button` as keyof typeof localization]
                            )}
                        </Button>

                        {!toast && (
                            <div
                                className={cn(!authToast ? hideElementClass : "mt-4",
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
                                            authToast?.action.label
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

                        <div
                            className={cn((view != "login" || !magicLink || isMagicLink) ? hideElementClass : "mt-4",
                                !disableAnimation && transitionClass,
                            )}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2 w-full"
                                onClick={() => setIsMagicLink(true)}
                                disabled={view != "login" || !magicLink || isMagicLink}
                            >
                                <MailIcon className="w-4 h-4" />
                                {localization.provider_prefix}
                                {" "}
                                {localization.magic_link_provider}
                            </Button>
                        </div>

                        <div
                            className={cn((view != "login" || !emailPassword || !isMagicLink) ? hideElementClass : "mt-4",
                                !disableAnimation && transitionClass,
                            )}
                        >
                            <Button
                                type="button"
                                variant="secondary"
                                className="gap-2 w-full"
                                onClick={() => setIsMagicLink(false)}
                                disabled={view != "login" || !emailPassword || !isMagicLink}
                            >
                                <LockIcon className="w-4 h-4" />
                                {localization.provider_prefix}
                                {" "}
                                {localization.password_provider}
                            </Button>
                        </div>

                        {passkey && (
                            <div
                                className={cn(view != "login" ? hideElementClass : "mt-4",
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
                                    disabled={view != "login"}
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
                    className={cn(
                        (!providers?.length || !["login", "signup"].includes(view)) ? hideElementClass : "mt-4",
                        "w-full gap-2 flex items-center",
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
                                disabled={loading || !["login", "signup"].includes(view)}
                                onClick={async () => {
                                    const { error } = await authClient.signIn.social({
                                        provider,
                                        callbackURL: "/"
                                    })

                                    if (error) {
                                        setAuthToast({
                                            description: error.message!,
                                            variant: "destructive"
                                        })
                                    }
                                }}
                            >
                                <Icon icon={socialProvider.icon} className="w-4 h-4" />

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
            </CardContent>

            <CardFooter>
                <div className="flex justify-center w-full border-t pt-4">
                    <p className="text-center text-xs text-muted-foreground">
                        {(view == "signup" || view == "forgot-password") ? (
                            localization.signup_footer
                        ) : (
                            localization.login_footer
                        )}

                        <Button
                            asChild={!disableRouting}
                            variant="link"
                            size="sm"
                            className="text-xs px-1 h-fit underline"
                            onClick={() => setView((view == "signup" || view == "forgot-password") ? "login" : "signup")}
                        >
                            {disableRouting ? (
                                (view == "signup" || view == "forgot-password") ? localization.login : localization.signup
                            ) : (
                                <LinkComponent
                                    href={(view == "signup" || view == "forgot-password") ?
                                        "/auth/login"
                                        : "/auth/signup"
                                    }
                                >
                                    {(view == "signup" || view == "forgot-password") ? localization.login : localization.signup}
                                </LinkComponent>
                            )}
                        </Button>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}