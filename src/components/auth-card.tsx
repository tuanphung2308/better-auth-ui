"use client"

import { KeyIcon, Loader2, LockIcon, MailIcon } from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../lib/auth-ui-provider"
import { cn } from "../lib/utils"
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
    username: "Username",
    usernamePlaceholder: "Username"
}

export function AuthCard({
    className,
    emailPassword = true,
    localization,
    magicLink,
    passkey,
    pathname,
    providers = [],
    redirectTo = "/",
    signUpFields,
    socialLayout = "auto",
    username,
    onSessionChange
}: {
    className?: string,
    emailPassword?: boolean,
    localization?: Partial<typeof authCardLocalization>,
    magicLink?: boolean,
    passkey?: boolean,
    pathname?: string,
    providers?: SocialProvider[],
    redirectTo?: string,
    signUpFields?: { field: string, label: string, required?: boolean }[],
    socialLayout?: "auto" | "horizontal" | "vertical",
    username?: boolean,
    onSessionChange?: () => void,

}) {
    localization = { ...authCardLocalization, ...localization }

    if (socialLayout == "auto") {
        socialLayout = providers?.length > 3 ? "horizontal" : "vertical"
    }

    const slug = pathname?.split("/").pop()

    const { authClient, authViews, navigate, LinkComponent } = useContext(AuthUIContext)

    if (!Object.values(authViews).includes(slug!)) {
        console.error(`Invalid auth view: ${slug}`)
    }

    const authView = Object.entries(authViews).find(([_, value]) => value === slug)?.[0] || "signIn" as keyof typeof authViews

    const formAction = async (formData: FormData) => {
        const provider = formData.get("provider") as SocialProvider

        if (provider) {
            const { error } = await authClient.signIn.social({ provider, callbackURL: redirectTo })
            if (error) {
                toast.error(error.message)
            }

            return
        }

        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (authView == "signIn") {
            const { error } = await authClient.signIn.email({ email, password })
            if (error) {
                toast.error(error.message)
            } else {
                onSessionChange?.()
                navigate(redirectTo)
            }
        } else {
            // @ts-expect-error We omit signUp on authClient type for custom fields support
            await authClient.signUp.email({ email, password })
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

    if (authView == "signOut") return <Loader2 className="animate-spin" />

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

                    {magicLink && emailPassword && (
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

                            {passkey && (
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
                <div className="flex justify-center w-full border-t py-4">
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