import type { SocialProvider } from "better-auth/social-providers"
import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { Provider } from "../../lib/social-providers"
import { cn } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"

interface ProviderButtonProps {
    className?: string
    isSubmitting: boolean
    localization: Partial<AuthLocalization>
    other?: boolean
    provider: Provider
    setIsSubmitting: (value: boolean) => void
    socialLayout: "auto" | "horizontal" | "grid" | "vertical"
}

export function ProviderButton({
    className,
    isSubmitting,
    localization,
    other,
    provider,
    setIsSubmitting,
    socialLayout
}: ProviderButtonProps) {
    const { authClient, basePath, baseURL, viewPaths, toast, colorIcons, noColorIcons } =
        useContext(AuthUIContext)

    const signInSocial = async () => {
        setIsSubmitting(true)

        try {
            const callbackURL = `${baseURL}${basePath}/${viewPaths.callback}`

            if (other) {
                await (authClient as AuthClient).signIn.oauth2({
                    providerId: provider.provider,
                    callbackURL,
                    fetchOptions: { throw: true }
                })
            } else {
                await authClient.signIn.social({
                    provider: provider.provider as SocialProvider,
                    callbackURL,
                    fetchOptions: { throw: true }
                })
            }
        } catch (error) {
            setIsSubmitting(false)
            toast({
                variant: "error",
                message: error instanceof Error ? error.message : localization.requestFailed
            })
        }
    }

    return (
        <Button
            className={cn(socialLayout === "vertical" ? "w-full" : "grow", className)}
            disabled={isSubmitting}
            formNoValidate
            name={other ? "otherProvider" : "provider"}
            value={provider.provider}
            variant="outline"
            onClick={signInSocial}
        >
            {provider.icon &&
                (colorIcons ? (
                    <provider.icon variant="color" />
                ) : noColorIcons ? (
                    <provider.icon />
                ) : (
                    <>
                        <provider.icon className="dark:hidden" variant="color" />
                        <provider.icon className="hidden dark:block" />
                    </>
                ))}

            {socialLayout === "grid" && provider.name}

            {socialLayout === "vertical" && (
                <>
                    {localization.signInWith} {provider.name}
                </>
            )}
        </Button>
    )
}
