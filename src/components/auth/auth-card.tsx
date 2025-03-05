"use client"

import { Loader2 } from "lucide-react"
import { useContext, useEffect } from "react"

import { type AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthView } from "../../lib/auth-view-paths"
import { cn } from "../../lib/utils"
import { SettingsCards, type SettingsCardsClassNames } from "../settings/settings-cards"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../ui/card"

import { AuthForm, type AuthFormClassNames } from "./auth-form"

export type AuthCardClassNames = {
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

export function AuthCard({
    className,
    classNames,
    callbackURL,
    localization,
    pathname,
    redirectTo,
    socialLayout = "auto",
    view
}: {
    className?: string,
    classNames?: AuthCardClassNames,
    callbackURL?: string,
    localization?: Partial<AuthLocalization>,
    pathname?: string,
    redirectTo?: string,
    socialLayout?: "auto" | "horizontal" | "grid" | "vertical",
    view?: AuthView,
}) {
    const path = pathname?.split("/").pop()

    const {
        credentials,
        localization: authLocalization,
        magicLink,
        replace,
        settingsUrl,
        viewPaths,
        LinkComponent
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    if (path && !Object.values(viewPaths).includes(path)) {
        console.error(`Invalid auth view: ${path}`)
    }

    view = view || (Object.entries(viewPaths).find(([_, value]) => value === path)?.[0] || "signIn") as AuthView

    useEffect(() => {
        if (view == "settings" && settingsUrl) {
            replace(settingsUrl)
        }
    }, [replace, settingsUrl, view])

    if (["signOut", "callback"].includes(view)) return (
        <AuthForm
            callbackURL={callbackURL}
            classNames={classNames?.form}
            localization={localization}
            redirectTo={redirectTo}
            socialLayout={socialLayout}
            view={view}
        />
    )

    if (view == "settings") return settingsUrl ? (
        <Loader2 className="animate-spin" />
    ) : (
        <SettingsCards className={cn(className)} classNames={classNames?.settings} />
    )

    return (
        <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization[view as keyof typeof localization]}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {(!credentials && !magicLink) ? (
                        localization.disabledCredentialsDescription
                    ) : (
                        localization[view + "Description" as keyof typeof localization]
                    )}
                </CardDescription>
            </CardHeader>

            <CardContent className={classNames?.content}>
                <AuthForm
                    callbackURL={callbackURL}
                    classNames={classNames?.form}
                    localization={localization}
                    redirectTo={redirectTo}
                    socialLayout={socialLayout}
                    view={view}
                />
            </CardContent>

            {credentials && (
                <CardFooter className={cn("justify-center text-sm text-muted-foreground gap-1", classNames?.footer)}>
                    {view == "signIn" ? localization.dontHaveAnAccount : localization.alreadyHaveAnAccount}

                    <LinkComponent
                        className={cn("underline text-foreground", classNames?.footerLink)}
                        href={`${viewPaths[view == "signIn" ? "signUp" : "signIn"]}`}
                        to={`${viewPaths[view == "signIn" ? "signUp" : "signIn"]}`}
                    >
                        {view == "signIn" ? localization.signUp : localization.signIn}
                    </LinkComponent>
                </CardFooter>
            )}
        </Card>
    )
}