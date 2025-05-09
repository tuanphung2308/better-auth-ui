import { useContext } from "react"
import { useIsHydrated } from "../../hooks/use-hydrated"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"

export interface RecaptchaV3BadgeProps {
    className?: string
    localization?: Partial<AuthLocalization>
}

export function RecaptchaV3Badge({
    className,
    localization: propLocalization
}: RecaptchaV3BadgeProps) {
    const isHydrated = useIsHydrated()
    const { captcha, localization: contextLocalization } = useContext(AuthUIContext)
    const localization = { ...contextLocalization, ...propLocalization }

    if (!captcha || captcha.provider !== "google-recaptcha-v3") return null

    if (!captcha.hideBadge) {
        return isHydrated ? (
            <style>{`
                .grecaptcha-badge { visibility: visible; }
            `}</style>
        ) : null
    }

    return (
        <p className={cn("text-muted-foreground text-xs", className)}>
            {localization.protectedByRecaptcha} {localization.byContinuingYouAgreeTo} Google{" "}
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
