import { useContext } from "react"
import type ReCAPTCHA from "react-google-recaptcha"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { RecaptchaBadge } from "./recaptcha-badge"
import { RecaptchaV2 } from "./recaptcha-v2"

interface CaptchaProps {
    ref: React.RefObject<ReCAPTCHA | null>
    localization: Partial<AuthLocalization>
}

export function Captcha({ ref, localization }: CaptchaProps) {
    const { captcha } = useContext(AuthUIContext)
    if (!captcha) return null

    const showRecaptchaV2 =
        captcha.provider === "google-recaptcha-v2-checkbox" ||
        captcha.provider === "google-recaptcha-v2-invisible"

    const showRecaptchaBadge =
        captcha.provider === "google-recaptcha-v3" ||
        captcha.provider === "google-recaptcha-v2-invisible"

    return (
        <>
            {showRecaptchaV2 && <RecaptchaV2 ref={ref} />}
            {showRecaptchaBadge && <RecaptchaBadge localization={localization} />}
        </>
    )
}
