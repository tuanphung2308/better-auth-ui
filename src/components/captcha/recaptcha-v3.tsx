import { useContext, useEffect, useState } from "react"
import { useIsHydrated } from "../../hooks/use-hydrated"
import { useLang } from "../../hooks/use-lang"
import { useTheme } from "../../hooks/use-theme"
import { AuthUIContext } from "../../lib/auth-ui-provider"

export function RecaptchaV3() {
    const isHydrated = useIsHydrated()
    const { theme } = useTheme()
    const { lang } = useLang()
    const { captcha } = useContext(AuthUIContext)
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        if (initialized) return
        if (captcha?.provider !== "google-recaptcha-v3") return

        const checkInitialized = () => {
            const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement
            if (!iframe) return

            iframe.onload = () => {
                setInitialized(true)
            }
        }

        grecaptcha.ready(() => {
            checkInitialized()
            setTimeout(() => setInitialized(true), 100)
        })

        checkInitialized()
    }, [initialized, captcha])

    const checkVisible = () => {
        if (!isHydrated) return false
        if (captcha?.hideBadge) return false

        const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement
        if (!iframe) return false

        const iframeSrcUrl = new URL(iframe.src)
        if (!iframeSrcUrl.searchParams.has("theme")) return false

        return true
    }

    const [isVisible, setIsVisible] = useState(checkVisible())

    useEffect(() => {
        if (!initialized) return
        if (captcha?.provider !== "google-recaptcha-v3") return
        if (captcha.hideBadge) return

        const updateRecaptcha = async () => {
            if (!lang) return

            // find iframe with title "reCAPTCHA"
            const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement
            if (iframe) {
                const iframeSrcUrl = new URL(iframe.src)
                iframe.style.backgroundColor = "transparent"

                iframeSrcUrl.searchParams.set("theme", theme)
                iframeSrcUrl.searchParams.set("hl", lang)

                if (iframeSrcUrl.toString() === iframe.src) return

                iframe.onload = () => {
                    setTimeout(() => {
                        setIsVisible(true)
                    }, 100)
                }

                iframe.src = iframeSrcUrl.toString()
            }
        }

        grecaptcha.ready(() => {
            updateRecaptcha()
        })
    }, [captcha, initialized, theme, lang])

    if (captcha?.provider !== "google-recaptcha-v3") return null

    return (
        <>
            <style>{`
                .grecaptcha-badge { 
                    visibility: hidden${isVisible ? "" : " !important"}; 
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

            <script src={`https://www.google.com/recaptcha/api.js?render=${captcha.siteKey}`} />
        </>
    )
}
