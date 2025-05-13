import { type RefObject, useContext, useRef } from "react"
import type ReCAPTCHA from "react-google-recaptcha"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { AuthUIContext } from "../lib/auth-ui-provider"

export function useCaptcha() {
    const { captcha } = useContext(AuthUIContext)
    // biome-ignore lint/suspicious/noExplicitAny:
    const captchaRef = useRef<any>(null)
    const { executeRecaptcha } = useGoogleReCaptcha()

    const executeCaptcha = async (action: string) => {
        if (!captcha) return ""

        switch (captcha.provider) {
            case "google-recaptcha-v3":
                return (await executeRecaptcha?.(action)) || ""
            case "google-recaptcha-v2-checkbox":
            case "google-recaptcha-v2-invisible": {
                const recaptchaRef = captchaRef as RefObject<ReCAPTCHA>
                if (captchaRef.current) {
                    const response = await recaptchaRef.current.executeAsync()
                    return response || ""
                }
            }
        }

        return ""
    }

    return {
        captchaRef,
        executeCaptcha,
        hasCaptcha: !!captcha?.provider,
        captchaProvider: captcha?.provider
    }
}
