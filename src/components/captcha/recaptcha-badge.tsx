import { useContext } from "react"
import { useIsHydrated } from "../../hooks/use-hydrated"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthLocalization } from "../../lib/localization/auth-localization"
import { cn } from "../../lib/utils"

export interface RecaptchaV3BadgeProps {
    className?: string
    localization?: Partial<AuthLocalization>
}

export function RecaptchaBadge({
    className,
    localization: propLocalization
}: RecaptchaV3BadgeProps) {
    const isHydrated = useIsHydrated()
    const { captcha, localization: contextLocalization } = useContext(AuthUIContext)
    const localization = { ...contextLocalization, ...propLocalization }

    if (!captcha) return null

    if (!captcha.hideBadge) {
        return isHydrated ? (
            <style>{`
                .grecaptcha-badge { visibility: visible !important; }
            `}</style>
        ) : null
    }

    return (
        <>
            <style>{`
                .grecaptcha-badge { visibility: hidden; }
            `}</style>

            <p className={cn("text-muted-foreground text-xs", className)}>
                {localization.protectedByRecaptcha} {localization.byContinuingYouAgree} Google{" "}
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
        </>
    )
}
