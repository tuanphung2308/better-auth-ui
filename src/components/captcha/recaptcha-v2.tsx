import { useContext } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { useLang } from "../../hooks/use-lang"
import { useTheme } from "../../hooks/use-theme"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"

export function RecaptchaV2({
    ref,
    localization
}: {
    ref: React.RefObject<ReCAPTCHA | null>
    localization: Partial<AuthLocalization>
}) {
    const { captcha, localization: contextLocalization } = useContext(AuthUIContext)
    localization = { ...contextLocalization, ...localization }
    const { theme } = useTheme()
    const { lang } = useLang()

    if (
        captcha?.provider !== "google-recaptcha-v2-checkbox" &&
        captcha?.provider !== "google-recaptcha-v2-invisible"
    )
        return null

    return (
        <>
            <style>{`
                .grecaptcha-badge {
                    border-radius: var(--radius) !important;
                    --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
                    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow) !important;
                    border-style: var(--tw-border-style) !important;
                    border-width: 1px;
                }

                .dark .grecaptcha-badge {
                    border-color: var(--input) !important;
                }
            `}</style>

            <ReCAPTCHA
                ref={ref}
                key={`${theme}-${lang}`}
                sitekey={captcha.siteKey}
                theme={theme}
                hl={lang}
                size={captcha.provider === "google-recaptcha-v2-invisible" ? "invisible" : "normal"}
                className={cn(
                    captcha.provider === "google-recaptcha-v2-invisible"
                        ? "absolute rounded"
                        : "mx-auto h-[76px] w-[302px] overflow-hidden rounded bg-muted"
                )}
            />
        </>
    )
}
