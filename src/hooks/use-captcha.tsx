import { type RefObject, useContext, useRef } from "react"
import type ReCAPTCHA from "react-google-recaptcha"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { AuthUIContext } from "../lib/auth-ui-provider"

// Default captcha endpoints
const DEFAULT_CAPTCHA_ENDPOINTS = ["/sign-up/email", "/sign-in/email", "/forget-password"]

// Sanitize action name for reCAPTCHA
// Google reCAPTCHA only allows A-Za-z/_ in action names
const sanitizeActionName = (action: string): string => {
    // First remove leading slash if present
    let result = action.startsWith("/") ? action.substring(1) : action

    // Convert both kebab-case and path separators to camelCase
    // Example: "/sign-in/email" becomes "signInEmail"
    result = result
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/\/([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/\//g, "")
        .replace(/[^A-Za-z0-9_]/g, "")

    return result
}

export function useCaptcha() {
    const { captcha } = useContext(AuthUIContext)
    // biome-ignore lint/suspicious/noExplicitAny:
    const captchaRef = useRef<any>(null)
    const { executeRecaptcha } = useGoogleReCaptcha()

    const executeCaptcha = async (action: string) => {
        if (!captcha) return ""

        // Sanitize the action name for reCAPTCHA
        const sanitizedAction = sanitizeActionName(action)

        switch (captcha.provider) {
            case "google-recaptcha-v3":
                return (await executeRecaptcha?.(sanitizedAction)) || ""
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

    const getCaptchaHeaders = async (action: string) => {
        if (!captcha) return undefined

        // Use custom endpoints if provided, otherwise use defaults
        const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS

        // Only execute captcha if the action is in the endpoints list
        if (endpoints.includes(action)) {
            return { "x-captcha-response": await executeCaptcha(action) }
        }

        return undefined
    }

    return {
        captchaRef,
        getCaptchaHeaders
    }
}
