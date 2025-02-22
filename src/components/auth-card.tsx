"use client"

import { KeyIcon, Loader2, LockIcon, MailIcon } from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../lib/auth-ui-provider"
import { cn, isValidEmail } from "../lib/utils"
import { type SocialProvider, socialProviders } from "../social-providers"

import { ActionButton } from "./auth-card/action-button"
import { ProviderButton } from "./auth-card/provider-button"
import { Button } from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export const authCardLocalization = {
    alreadyHaveAnAccount: "Already have an account?",
    dontHaveAnAccount: "Don't have an account?",
    email: "Email",
    emailPlaceholder: "m@example.com",
    forgotPassword: "Forgot Password",
    forgotPasswordAction: "Send reset link",
    forgotPasswordDescription: "Enter your email to reset your password",
    forgotPasswordLink: "Forgot your password?",
    magicLink: "Magic Link",
    magicLinkAction: "Send magic link",
    magicLinkDescription: "Enter your email to receive a magic link",
    magicLinkEmail: "Check your email for the magic link",
    name: "Name",
    namePlaceholder: "Name",
    passkey: "Passkey",
    password: "Password",
    passwordPlaceholder: "Password",
    signIn: "Sign In",
    signInAction: "Login",
    signInDescription: "Enter your email below to login to your account",
    signInUsernameDescription: "Enter your username below to login to your account",
    signInWith: "Sign in with",
    signUp: "Sign Up",
    signUpAction: "Create an account",
    signUpDescription: "Enter your information to create an account",
    signUpEmail: "Check your email for the verification link",
    username: "Username",
    usernameSignInPlaceholder: "Username or email",
    usernameSignUpPlaceholder: "Username"
}

export function AuthCard({
    className,
    callbackURL,
    disableCredentials,
    enableMagicLink,
    enableName,
    enablePasskey,
    localization,
    pathname,
    providers = [],
    redirectTo,
    socialLayout = "auto",
    onSessionChange
}: {
    className?: string,
    callbackURL?: string,
    disableCredentials?: boolean,
    enableMagicLink?: boolean,
    enableName?: boolean,
    enablePasskey?: boolean,
    localization?: Partial<typeof authCardLocalization>,
    pathname?: string,
    providers?: SocialProvider[],
    redirectTo?: string,
    socialLayout?: "auto" | "horizontal" | "vertical",
    onSessionChange?: () => void,
}) {
    const getRedirectTo = () => redirectTo || new URLSearchParams(window.location.search).get("redirectTo") || "/"
    const getCallbackURL = () => callbackURL || getRedirectTo()

    localization = { ...authCardLocalization, ...localization }

    if (socialLayout == "auto") {
        socialLayout = providers?.length > 3 ? "horizontal" : "vertical"
    }

    const slug = pathname?.split("/").pop()

    const { authClient, authViews, navigate, enableUsername, LinkComponent } = useContext(AuthUIContext)

    if (!Object.values(authViews).includes(slug!)) {
        console.error(`Invalid auth view: ${slug}`)
    }

    const authView = Object.entries(authViews).find(([_, value]) => value === slug)?.[0] || "signIn"

    const formAction = async (formData: FormData) => {
        const provider = formData.get("provider") as SocialProvider

        if (provider) {
            const { error } = await authClient.signIn.social({ provider, callbackURL: getCallbackURL() })
            if (error) {
                toast.error(error.message)
            }

            return
        }

        let email = formData.get("email") as string
        const password = formData.get("password") as string
        const name = formData.get("name") || "" as string

        switch (authView) {
            case "signIn": {
                if (enableUsername) {
                    const username = formData.get("username") as string

                    if (!isValidEmail(username)) {
                        // @ts-expect-error Optional plugin
                        const { error } = await authClient.signIn.username({
                            username,
                            password
                        })

                        if (error) {
                            toast.error(error.message)
                        } else {
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
                    toast.error(error.message)
                } else {
                    onSessionChange?.()
                    navigate(getRedirectTo())
                }

                break
            }

            case "magicLink": {
                // @ts-expect-error Optional plugin
                const { error } = await authClient.signIn.magicLink({ email, callbackURL: getCallbackURL() })

                if (error) {
                    toast.error(error.message)
                } else {
                    toast.success(localization.magicLinkEmail)
                }

                break
            }

            case "signUp": {
                const params = { email, password, name, callbackURL: getCallbackURL() } as Record<string, string>

                if (enableUsername) {
                    params.username = formData.get("username") as string
                }

                // @ts-expect-error We omit signUp from the authClient type to support additional fields
                const { data, error } = await authClient.signUp.email(params)

                if (error) {
                    toast.error(error.message)
                } else if (data.token) {
                    onSessionChange?.()
                    navigate(getRedirectTo())
                } else {
                    toast.success(localization.signUpEmail)
                }

                break
            }
        }
    }

    const signingOut = useRef(false)

    useEffect(() => {
        if (authView == "signOut" && !signingOut.current) {
            signingOut.current = true
            authClient.signOut().finally(async () => {
                navigate(authViews.signIn)
                onSessionChange?.()
                signingOut.current = false
            })
        }
    }, [authView, authClient, navigate, authViews.signIn, onSessionChange])

    if (authView == "signOut") return (
        <Loader2 className="animate-spin" />
    )

    return (
        <Card className={cn("max-w-sm w-full", className)}>
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                    {localization[authView as keyof typeof localization]}
                </CardTitle>

                <CardDescription className="text-xs md:text-sm">
                    {localization[authView + "Description" as keyof typeof localization]}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form action={formAction} className="grid gap-4">
                    {authView == "signUp" && enableName && (
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                {localization.name}
                            </Label>

                            <Input
                                id="name"
                                name="name"
                                placeholder={localization.namePlaceholder}
                            />
                        </div>
                    )}

                    {enableUsername && ["signIn", "signUp"].includes(authView) && (
                        <div className="grid gap-2">
                            <Label htmlFor="username">
                                {localization.username}
                            </Label>

                            <Input
                                id="username"
                                name="username"
                                placeholder={authView == "signIn" ? localization.usernameSignInPlaceholder : localization.usernameSignUpPlaceholder}
                                required
                            />
                        </div>
                    )}

                    {(!enableUsername || ["signUp", "magicLink", "forgotPassword"].includes(authView)) && (
                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                {localization.email}
                            </Label>

                            <Input
                                id="email"
                                name="email"
                                placeholder={localization.emailPlaceholder}
                                required
                                type="email"
                            />
                        </div>
                    )}

                    {["signUp", "signIn"].includes(authView) && (
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">
                                    {localization.password}
                                </Label>

                                {authView == "signIn" && (
                                    <LinkComponent
                                        className="ml-auto inline-block text-sm hover:underline -my-1"
                                        href="forgot-password"
                                        to="forgot-password"
                                    >
                                        {localization.forgotPasswordLink}
                                    </LinkComponent>
                                )}
                            </div>

                            <Input
                                autoComplete={["signUp", "resetPassword"].includes(authView!) ? "new-password" : "password"}
                                id="password"
                                name="password"
                                placeholder={localization.passwordPlaceholder}
                                required
                                type="password"
                            />
                        </div>
                    )}

                    <ActionButton
                        authView={authView}
                        localization={localization}
                    />

                    {enableMagicLink && !disableCredentials && (
                        <LinkComponent
                            href={authView == "magicLink" ? authViews.signIn : authViews.magicLink}
                            to={authView == "magicLink" ? authViews.signIn : authViews.magicLink}
                        >
                            <Button
                                className="w-full"
                                variant="secondary"
                            >
                                {authView == "magicLink"
                                    ? <LockIcon />
                                    : <MailIcon />
                                }

                                {localization.signInWith}
                                {" "}

                                {authView == "magicLink"
                                    ? localization.password
                                    : localization.magicLink
                                }
                            </Button>
                        </LinkComponent>
                    )}

                    {authView != "forgotPassword" && (
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
                                            localization={localization}
                                            socialLayout={socialLayout}
                                            socialProvider={socialProvider}
                                        />
                                    )
                                })}
                            </div>

                            {enablePasskey && (
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                >
                                    <KeyIcon />
                                    {localization.signInWith}
                                    {" "}
                                    {localization.passkey}
                                </Button>
                            )}
                        </>
                    )}
                </form>
            </CardContent>

            <CardFooter>
                <div className="flex justify-center w-full border-t pt-4 pb-2">
                    <p className="text-center text-sm text-muted-foreground">
                        {authView == "signIn" ? localization.dontHaveAnAccount : localization.alreadyHaveAnAccount}
                        {" "}

                        <LinkComponent
                            className="underline text-foreground"
                            href={`${authViews[authView == "signIn" ? "signUp" : "signIn"]}`}
                            to={`${authViews[authView == "signIn" ? "signUp" : "signIn"]}`}
                        >
                            {authView == "signIn" ? localization.signUp : localization.signIn}
                        </LinkComponent>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}