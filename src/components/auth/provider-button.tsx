import { useContext } from "react"
import { useFormStatus } from "react-dom"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { SocialProvider } from "../../lib/social-providers"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

export function ProviderButton({
    className,
    isLoading,
    localization,
    other = false,
    provider,
    socialLayout
}: {
    className?: string
    isLoading?: boolean
    localization: Partial<AuthLocalization>
    other?: boolean
    provider: SocialProvider
    socialLayout: "auto" | "horizontal" | "grid" | "vertical"
}) {
    const { pending } = useFormStatus()
    const { colorIcons, noColorIcons } = useContext(AuthUIContext)

    return (
        <Button
            className={cn(socialLayout === "vertical" ? "w-full" : "grow", className)}
            disabled={pending || isLoading}
            formNoValidate
            name={other ? "otherProvider" : "provider"}
            value={provider.provider}
            variant="outline"
        >
            {colorIcons ? (
                <provider.icon color />
            ) : noColorIcons ? (
                <provider.icon />
            ) : (
                <>
                    <provider.icon className="dark:hidden" color />
                    <provider.icon className="hidden dark:block" />
                </>
            )}

            {socialLayout === "grid" && <>{provider.name}</>}

            {socialLayout === "vertical" && (
                <>
                    {localization.signInWith} {provider.name}
                </>
            )}
        </Button>
    )
}
