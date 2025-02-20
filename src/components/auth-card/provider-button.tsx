import { useFormStatus } from "react-dom"

import { cn } from "../../lib/utils"
import type { socialProviders } from "../../social-providers"
import type { authCardLocalization } from "../auth-card"
import { Button } from "../ui/button"

export function ProviderButton({
    className,
    localization,
    socialLayout,
    socialProvider
}: {
    className?: string,
    localization: Partial<typeof authCardLocalization>,
    socialLayout: "auto" | "horizontal" | "vertical",
    socialProvider: typeof socialProviders[number]
}) {
    const { pending } = useFormStatus()

    return (
        <Button
            className={cn(
                socialLayout === "vertical" ? "w-full" : "grow",
                className
            )}
            disabled={pending}
            formNoValidate
            name="provider"
            value={socialProvider.provider}
            variant="outline"
        >
            {socialProvider.icon}

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