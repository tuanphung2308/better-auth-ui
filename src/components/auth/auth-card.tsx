"use client"

import { Loader2 } from "lucide-react"
import { useContext, useEffect } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { cn } from "../../lib/utils"
import { SettingsCards, type SettingsCardsClassNames } from "../settings/settings-cards"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { AuthForm, type AuthFormClassNames } from "./auth-form"
import { TwoFactorForm } from "./two-factor-form"

export interface AuthCardClassNames {
    base?: string
    content?: string
    description?: string
    footer?: string
    footerLink?: string
    form?: AuthFormClassNames
    settings?: SettingsCardsClassNames
    header?: string
    title?: string
}

export interface AuthCardProps {
    className?: string
    classNames?: AuthCardClassNames
    callbackURL?: string
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
    pathname?: string
    redirectTo?: string
    /**
     * @default "auto"
     */
    socialLayout?: "auto" | "horizontal" | "grid" | "vertical"
    /**
     * @remarks `AuthView`
     */
    view?: AuthView
}

export function AuthCard({
    className,
    classNames,
    callbackURL,
    localization,
    pathname,
    redirectTo,
    socialLayout = "auto",
    view
}: AuthCardProps) {
    const path = pathname?.split("/").pop()

    const {
        basePath,
        credentials,
        localization: contextLocalization,
        magicLink,
        replace,
        settingsURL,
        signUp,
        viewPaths,
        Link
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    if (path && !Object.values(viewPaths).includes(path)) {
        console.error(`Invalid auth view: ${path}`)
    }

    view =
        view ||
        ((Object.entries(viewPaths).find(([_, value]) => value === path)?.[0] ||
            "signIn") as AuthView)

    useEffect(() => {
        if (view === "settings" && settingsURL) replace(settingsURL)
    }, [replace, settingsURL, view])

    if (["signOut", "callback"].includes(view)) {
        return (
            <AuthForm
                callbackURL={callbackURL}
                classNames={classNames?.form}
                redirectTo={redirectTo}
                view={view}
            />
        )
    }

    if (view === "settings")
        return settingsURL ? (
            <Loader2 className="mx-auto my-auto animate-spin self-center justify-self-center" />
        ) : (
            <SettingsCards
                localization={localization}
                className={cn(className)}
                classNames={classNames?.settings}
            />
        )

    const description =
        !credentials && !magicLink
            ? localization.disabledCredentialsDescription
            : localization[`${view}Description` as keyof typeof localization]

    let footerText: string | undefined = undefined
    let footerLinkText: string | undefined = undefined
    let footerLinkPath: string | undefined = undefined

    if (credentials && signUp && ["signIn", "signUp"].includes(view)) {
        footerText =
            view === "signIn" ? localization.dontHaveAnAccount : localization.alreadyHaveAnAccount
        footerLinkText = view === "signIn" ? localization.signUp : localization.signIn
        footerLinkPath = viewPaths[view === "signIn" ? "signUp" : "signIn"]
    } else if (view === "twoFactorPrompt") {
        footerText = localization.forgotAuthenticator
        footerLinkText = localization.useBackupCode
        footerLinkPath = viewPaths.twoFactorRecovery
    } else if (view === "twoFactorRecovery") {
        footerText = localization.foundAuthenticator
        footerLinkText = localization.useTwoFactorCode
        footerLinkPath = viewPaths.twoFactorPrompt
    }

    return (
        <Card className={cn("w-full max-w-sm text-start", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization[view as keyof typeof localization]}
                </CardTitle>

                {description && (
                    <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                        {description}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className={classNames?.content}>
                {["twoFactorPrompt", "twoFactorRecovery", "twoFactorSetup"].includes(view) ? (
                    <TwoFactorForm
                        callbackURL={callbackURL}
                        classNames={classNames?.form}
                        localization={localization}
                        redirectTo={redirectTo}
                        view={view}
                    />
                ) : (
                    <AuthForm
                        callbackURL={callbackURL}
                        classNames={classNames?.form}
                        localization={localization}
                        redirectTo={redirectTo}
                        socialLayout={socialLayout}
                        view={view}
                    />
                )}
            </CardContent>

            {(footerText || footerLinkText) && (
                <CardFooter
                    className={cn(
                        "justify-center gap-1 text-muted-foreground text-sm",
                        classNames?.footer
                    )}
                >
                    {footerText && <span>{footerText}</span>}

                    <Link
                        className={cn("text-foreground underline", classNames?.footerLink)}
                        href={`${basePath}/${footerLinkPath}`}
                    >
                        {footerLinkText}
                    </Link>
                </CardFooter>
            )}
        </Card>
    )
}
