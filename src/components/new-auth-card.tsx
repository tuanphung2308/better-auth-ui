"use client"

import { KeyIcon, Loader2, LockIcon, MailIcon } from "lucide-react"
import { useContext, useState } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"
import { cn } from "../lib/utils"

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
    forgotPasswordDescription: "Enter your email to reset your password",
    forgotPasswordLink: "Forgot your password?",
    magicLink: "Magic Link",
    magicLinkDescription: "Enter your email to receive a magic link",
    passkey: "Passkey",
    password: "Password",
    signIn: "Sign In",
    signInAction: "Login",
    signInDescription: "Enter your email below to login to your account",
    signInWith: "Sign in with",
    signUp: "Sign Up",
    signUpAction: "Create an account",
    signUpDescription: "Enter your information to create an account",
}

export function NewAuthCard({
    className,
    localization,
    magicLink,
    passkey,
    pathname
}: {
    className?: string,
    localization?: Partial<typeof authCardLocalization>,
    magicLink?: boolean,
    passkey?: boolean,
    pathname?: string
}) {
    localization = { ...authCardLocalization, ...localization }
    const slug = pathname?.split("/").pop()

    const { authClient, authViews, LinkComponent } = useContext(AuthUIContext)

    // throw an error if authViews doesn't have this view in values (not keys)
    if (!Object.values(authViews).includes(slug!)) {
        // slug = authViews.signIn
        // throw new Error(`Invalid Auth View: ${view}`)
    }

    const authView = Object.entries(authViews).find(([_, value]) => value === slug)?.[0] || "signIn" as keyof typeof authViews

    console.log("authView", authView)
    const [loading, setLoading] = useState(false)

    const action = async (formData: FormData) => {
        setLoading(true)

        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (authView == "signIn") {
            await authClient.signIn.email({ email, password })
        } else {
            // @ts-expect-error We omit signUp on authClient type for custom fields support
            await authClient.signUp.email({ email, password })
        }

        setLoading(false)
    }

    return (
        <Card className={cn("max-w-md w-full", className)}>
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                    {localization[authView as keyof typeof localization]}
                </CardTitle>

                <CardDescription className="text-xs md:text-sm">
                    {localization[authView + "Description" as keyof typeof localization]}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form action={action} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">
                            {localization.email}
                        </Label>

                        <Input
                            id="email"
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
                                autoComplete="password"
                                id="password"
                                placeholder="Password"
                                type="password"
                            />
                        </div>
                    )}

                    <Button
                        className="w-full"
                        disabled={loading}
                        type="submit"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            "Login"
                        )}
                    </Button>

                    {magicLink && (
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

                    <div
                        className={cn(
                            "w-full gap-2 flex items-center",
                            "justify-between flex-col"
                        )}
                    >
                        <Button
                            className={cn(
                                "w-full gap-2"
                            )}
                            variant="outline"
                            onClick={async () => {
                                // await signIn.social({
                                //     provider: "google",
                                //     callbackURL: "/dashboard"
                                // })
                            }}
                        >
                            <svg height="1em" viewBox="0 0 256 262" width="0.98em" xmlns="http://www.w3.org/2000/svg">
                                <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                                <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                                <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" fill="#FBBC05" />
                                <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                            </svg>
                            Sign in with Google
                        </Button>

                        <Button
                            className={cn(
                                "w-full gap-2"
                            )}
                            variant="outline"
                            onClick={async () => {
                                // await signIn.social({
                                //     provider: "github",
                                //     callbackURL: "/dashboard"
                                // })
                            }}
                        >
                            <svg
                                height="1em"
                                viewBox="0 0 24 24"
                                width="1em"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                                    fill="currentColor"
                                />
                            </svg>
                            Sign in with Github
                        </Button>
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