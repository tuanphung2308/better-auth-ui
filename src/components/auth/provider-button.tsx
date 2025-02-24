import { useContext } from "react"
import { useFormStatus } from "react-dom"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { socialProviders } from "../../social-providers"
import { Button } from "../ui/button"

import type { authLocalization } from "./auth-card"

export function ProviderButton({
    className,
    isLoading,
    localization,
    socialLayout,
    socialProvider
}: {
    className?: string,
    isLoading?: boolean,
    localization: Partial<typeof authLocalization>,
    socialLayout: "auto" | "horizontal" | "vertical",
    socialProvider: typeof socialProviders[number]
}) {
    const { pending } = useFormStatus()
    const { colorIcons } = useContext(AuthUIContext)

    return (
        <Button
            className={cn(socialLayout == "vertical" ? "w-full" : "grow", className)}
            disabled={pending || isLoading}
            formNoValidate
            name="provider"
            value={socialProvider.provider}
            variant="outline"
        >
            <socialProvider.icon color={colorIcons} />

            {socialLayout == "vertical" && (
                <>
                    {localization.signInWith}
                    {" "}
                    {socialProvider.name}
                </>
            )}
        </Button>
    )
}