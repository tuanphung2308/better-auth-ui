import { useEffect, useState } from "react"

import { useContext } from "react"
import { useIsHydrated } from "../../hooks/use-hydrated"
import { AuthUIContext } from "../../lib/auth-ui-provider"

export function RecaptchaV3Badge() {
    const isHydrated = useIsHydrated()
    const { captcha } = useContext(AuthUIContext)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (captcha?.hideBadge) return

        const checkTheme = () => {
            const isDark =
                document.documentElement.classList.contains("dark") ||
                document.documentElement.getAttribute("style")?.includes("color-scheme: dark")
            const theme = isDark ? "dark" : "light"

            // get lang attribute from html tag
            const lang = document.documentElement.getAttribute("lang") || "en"

            // find iframe with title "reCAPTCHA"
            const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement
            if (iframe) {
                const iframeSrcUrl = new URL(iframe.src)
                iframeSrcUrl.searchParams.set("theme", theme)
                iframeSrcUrl.searchParams.set("hl", lang)
                iframe.src = iframeSrcUrl.toString()

                setIsVisible(true)
            }
        }

        // Listen for changes to html tag?
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === "style" || mutation.attributeName === "lang") {
                    checkTheme()
                }
            }
        })

        observer.observe(document.documentElement, { attributes: true })

        checkTheme()

        return () => {
            observer.disconnect()
        }
    }, [captcha])

    if (!isVisible) return null

    return (
        <>
            {isHydrated && captcha && !captcha.hideBadge && (
                <style>{`
                    .grecaptcha-badge { visibility: visible; }
                `}</style>
            )}
        </>
    )
}
