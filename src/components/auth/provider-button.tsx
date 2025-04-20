import type { SocialProvider } from "better-auth/social-providers"
import { useCallback, useContext } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { Provider } from "../../lib/social-providers"
import { cn, getSearchParam } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import type { AuthCardClassNames } from "./auth-card"

interface ProviderButtonProps {
    classNames?: AuthCardClassNames
    callbackURL?: string
    isSubmitting: boolean
    localization: Partial<AuthLocalization>
    other?: boolean
    provider: Provider
    redirectTo?: string
    setIsSubmitting: (value: boolean) => void
    socialLayout: "auto" | "horizontal" | "grid" | "vertical"
}

export function ProviderButton({
    classNames,
    callbackURL: propsCallbackURL,
    isSubmitting,
    localization,
    other,
    provider,
    redirectTo: propsRedirectTo,
    setIsSubmitting,
    socialLayout
}: ProviderButtonProps) {
    const {
        authClient,
        basePath,
        baseURL,
        persistClient,
        redirectTo: contextRedirectTo,
        viewPaths,
        toast,
        colorIcons,
        noColorIcons
    } = useContext(AuthUIContext)

    const getRedirectTo = useCallback(
        () => propsRedirectTo || getSearchParam("redirectTo") || contextRedirectTo,
        [propsRedirectTo, contextRedirectTo]
    )

    const getCallbackURL = useCallback(
        () =>
            `${baseURL}${
                propsCallbackURL ||
                (persistClient
                    ? `${basePath}/${viewPaths.callback}?redirectTo=${getRedirectTo()}`
                    : getRedirectTo())
            }`,
        [propsCallbackURL, persistClient, basePath, viewPaths, baseURL, getRedirectTo]
    )

    const signInSocial = async () => {
        setIsSubmitting(true)

        try {
            if (other) {
                await (authClient as AuthClient).signIn.oauth2({
                    providerId: provider.provider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                })
            } else {
                await authClient.signIn.social({
                    provider: provider.provider as SocialProvider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                })
            }
        } catch (error) {
            toast({
                variant: "error",
                message: error instanceof Error ? error.message : localization.requestFailed
            })

            setIsSubmitting(false)
        }
    }

    return (
        <Button
            className={cn(
                socialLayout === "vertical" ? "w-full" : "grow",
                classNames?.form?.button,
                classNames?.form?.providerButton
            )}
            disabled={isSubmitting}
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
