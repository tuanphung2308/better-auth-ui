import { useEffect, useState } from "react"

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

    const checkVisible = () => {
        if (!isHydrated) return false
        if (captcha?.hideBadge) return false

        const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement
        if (!iframe) return false

        return true
    }

    const [isVisible, setIsVisible] = useState(checkVisible())

    useEffect(() => {
        if (!captcha) return
        if (captcha.hideBadge) return

        const checkTheme = async () => {
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

        // Listen for changes to html tag?
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === "style" || mutation.attributeName === "lang") {
                    checkTheme()
                }
            }
        })

        observer.observe(document.documentElement, { attributes: true })

        grecaptcha.ready(() => {
            checkTheme()
        })

        return () => {
            observer.disconnect()
        }
    }, [captcha])

    if (!captcha || captcha.provider !== "google-recaptcha-v3") return null

    if (!captcha.hideBadge) {
        return isHydrated && isVisible ? (
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
