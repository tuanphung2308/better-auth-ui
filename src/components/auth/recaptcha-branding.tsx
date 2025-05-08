"use client"

import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"

export interface RecaptchaBrandingProps {
    className?: string
    localization?: Partial<AuthLocalization>
}

export function RecaptchaBranding({
    className,
    localization: propLocalization
}: RecaptchaBrandingProps) {
    const { localization: contextLocalization } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...propLocalization }

    return (
        <p className={cn("text-muted-foreground text-xs", className)}>
            {localization.protectedByRecaptcha} {localization.byContinuingYouAgreeTo} Google's{" "}
            <a
                className="text-foreground hover:underline"
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
            >
                {localization.privacyPolicy}
            </a>{" "}
            &{" "}
            <a
                className="text-foreground hover:underline"
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noreferrer"
            >
                {localization.termsOfService}
            </a>
            .
        </p>
    )
}
