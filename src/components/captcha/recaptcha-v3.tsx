import { useContext } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"

export function RecaptchaV3() {
    const { captcha } = useContext(AuthUIContext)
    if (captcha?.provider !== "google-recaptcha-v3") return null

    return (
        <>
            <style>{`
                .grecaptcha-badge { 
                    visibility: hidden; 
                    border-radius: var(--radius) !important;
                    --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
                    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow) !important;
                    border-style: var(--tw-borde    r-style) !important;
                    border-width: 1px;
                }

                .dark .grecaptcha-badge {
                    border-color: var(--input) !important;
                }
            `}</style>

            <script src={`https://www.google.com/recaptcha/api.js?render=${captcha.siteKey}`} />
        </>
    )
}
