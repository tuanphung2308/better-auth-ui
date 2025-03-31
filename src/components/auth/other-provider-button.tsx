import { useFormStatus } from "react-dom"

import type { AuthLocalization } from "../../lib/auth-localization"
import type { OtherProvider } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

export function OtherProviderButton({
    className,
    isLoading,
    localization,
    socialLayout,
    provider
}: {
    className?: string
    isLoading?: boolean
    localization: Partial<AuthLocalization>
    socialLayout: "auto" | "horizontal" | "grid" | "vertical"
    provider: OtherProvider
}) {
    const { pending } = useFormStatus()

    return (
        <Button
            className={cn(socialLayout === "vertical" ? "w-full" : "grow", className)}
            disabled={pending || isLoading}
            formNoValidate
            name="otherProvider"
            value={provider.id}
            variant="outline"
        >
            {provider.icon}

            {socialLayout === "grid" && <>{provider.id}</>}

            {socialLayout === "vertical" && (
                <>
                    {localization.signInWith} {provider.id}
                </>
            )}
        </Button>
    )
}
