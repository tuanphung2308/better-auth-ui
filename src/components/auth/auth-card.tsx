"use client"

import { useContext } from "react"

import { AuthUIContext, type AuthView } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { type SocialProvider } from "../../social-providers"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../ui/card"

import { AuthForm } from "./auth-form"

export const authLocalization = {
    alreadyHaveAnAccount: "Already have an account?",
    disableCredentialsDescription: "Choose a provider to login to your account",
    dontHaveAnAccount: "Don't have an account?",
    email: "Email",
    emailPlaceholder: "m@example.com",
    forgotPassword: "Forgot Password",
    forgotPasswordAction: "Send reset link",
    forgotPasswordDescription: "Enter your email to reset your password",
    forgotPasswordEmail: "Check your email for the password reset link",
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
    resetPassword: "Reset Password",
    resetPasswordAction: "Save new password",
    resetPasswordDescription: "Enter your new password below",
    resetPasswordInvalidToken: "Invalid reset password link",
    resetPasswordSuccess: "Password reset successfully",
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
    localization,
    magicLink,
    passkey,
    pathname,
    providers = [],
    redirectTo,
    signUpName,
    socialLayout = "auto",
    view,
    onSessionChange
}: {
    className?: string,
    callbackURL?: string,
    disableCredentials?: boolean,
    localization?: Partial<typeof authLocalization>,
    magicLink?: boolean,
    passkey?: boolean,
    pathname?: string,
    providers?: SocialProvider[],
    redirectTo?: string,
    signUpName?: boolean,
    socialLayout?: "auto" | "horizontal" | "vertical",
    view?: AuthView,
    onSessionChange?: () => void,
}) {
    localization = { ...authLocalization, ...localization }

    const path = pathname?.split("/").pop()

    const { viewPaths, LinkComponent } = useContext(AuthUIContext)

    if (path && !Object.values(viewPaths).includes(path)) {
        console.error(`Invalid auth view: ${path}`)
    }

    view = view || (Object.entries(viewPaths).find(([_, value]) => value === path)?.[0] || "signIn") as AuthView

    if (view == "signOut") return (
        <AuthForm
            callbackURL={callbackURL}
            className={className}
            disableCredentials={disableCredentials}
            localization={localization}
            magicLink={magicLink}
            passkey={passkey}
            providers={providers}
            redirectTo={redirectTo}
            signUpName={signUpName}
            socialLayout={socialLayout}
            view={view}
            onSessionChange={onSessionChange}
        />
    )

    return (
        <Card className={cn("w-full max-w-sm", className)}>
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                    {localization[view as keyof typeof localization]}
                </CardTitle>

                <CardDescription className="text-xs md:text-sm">
                    {(disableCredentials && !magicLink) ? (
                        localization.disableCredentialsDescription
                    ) : (
                        localization[view + "Description" as keyof typeof localization]
                    )}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <AuthForm
                    callbackURL={callbackURL}
                    className={className}
                    disableCredentials={disableCredentials}
                    localization={localization}
                    magicLink={magicLink}
                    passkey={passkey}
                    providers={providers}
                    redirectTo={redirectTo}
                    signUpName={signUpName}
                    socialLayout={socialLayout}
                    view={view}
                    onSessionChange={onSessionChange}
                />
            </CardContent>

            {!disableCredentials && (
                <CardFooter>
                    <div className="flex justify-center w-full border-t pt-4">
                        <p className="text-center text-sm text-muted-foreground">
                            {view == "signIn" ? localization.dontHaveAnAccount : localization.alreadyHaveAnAccount}
                            {" "}

                            <LinkComponent
                                className="underline text-foreground"
                                href={`${viewPaths[view == "signIn" ? "signUp" : "signIn"]}`}
                                to={`${viewPaths[view == "signIn" ? "signUp" : "signIn"]}`}
                            >
                                {view == "signIn" ? localization.signUp : localization.signIn}
                            </LinkComponent>
                        </p>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}