"use client"

import { ArrowLeftIcon, Loader2 } from "lucide-react"
import { useContext, useEffect } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { socialProviders } from "../../lib/social-providers"
import { cn } from "../../lib/utils"
import { SettingsCards, type SettingsCardsClassNames } from "../settings/settings-cards"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { AuthForm, type AuthFormClassNames } from "./auth-form"
import { MagicLinkButton } from "./magic-link-button"
import { PasskeyButton } from "./passkey-button"
import { ProviderButton } from "./provider-button"

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
    /**
     * @default 0
     */
    otpSeparators?: 0 | 1 | 2
}

export function AuthCard({
    className,
    classNames,
    callbackURL,
    localization,
    pathname,
    redirectTo,
    socialLayout = "auto",
    view,
    otpSeparators = 0
}: AuthCardProps) {
    const path = pathname?.split("/").pop()

    const {
        basePath,
        credentials,
        localization: contextLocalization,
        magicLink,
        passkey,
        providers,
        otherProviders,
        replace,
        settingsURL,
        signUp,
        viewPaths,
        Link
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    if (socialLayout === "auto") {
        socialLayout = !credentials
            ? "vertical"
            : providers && providers.length > 2
              ? "horizontal"
              : "vertical"
    }

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
                otpSeparators={otpSeparators}
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

    return (
        <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
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

            <CardContent className={cn("grid gap-6", classNames?.content)}>
                <div className="grid gap-4">
                    <AuthForm
                        callbackURL={callbackURL}
                        classNames={classNames?.form}
                        localization={localization}
                        redirectTo={redirectTo}
                        view={view}
                        otpSeparators={otpSeparators}
                    />

                    {magicLink &&
                        credentials &&
                        ["forgotPassword", "signUp", "signIn", "magicLink"].includes(view) && (
                            <MagicLinkButton localization={localization} view={view} />
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
                                            className={cn(
                                                classNames?.form?.button,
                                                classNames?.form?.providerButton
                                            )}
                                            localization={localization}
                                            socialLayout={socialLayout}
                                            provider={socialProvider}
                                        />
                                    )
                                })}

                                {otherProviders?.map((provider) => (
                                    <ProviderButton
                                        key={provider.provider}
                                        className={cn(
                                            classNames?.form?.button,
                                            classNames?.form?.providerButton
                                        )}
                                        localization={localization}
                                        socialLayout={socialLayout}
                                        provider={provider}
                                        other
                                    />
                                ))}

                                {passkey && ["signIn", "magicLink"].includes(view) && (
                                    <PasskeyButton
                                        className={cn(
                                            classNames?.form?.button,
                                            classNames?.form?.secondaryButton
                                        )}
                                        localization={localization}
                                    />
                                )}
                            </div>
                        </>
                    )}
            </CardContent>

            {credentials && signUp && (
                <CardFooter
                    className={cn(
                        "justify-center gap-1 text-muted-foreground text-sm",
                        classNames?.footer
                    )}
                >
                    {view === "signIn" || view === "magicLink" ? (
                        localization.dontHaveAnAccount
                    ) : view === "signUp" ? (
                        localization.alreadyHaveAnAccount
                    ) : (
                        <ArrowLeftIcon className="size-3" />
                    )}

                    <Link
                        className={cn("text-foreground underline", classNames?.footerLink)}
                        href={`${basePath}/${viewPaths[view === "signIn" || view === "magicLink" ? "signUp" : "signIn"]}`}
                    >
                        {view === "signIn" || view === "magicLink"
                            ? localization.signUp
                            : view === "signUp"
                              ? localization.signIn
                              : localization.goBack}
                    </Link>
                </CardFooter>
            )}
        </Card>
    )
}
