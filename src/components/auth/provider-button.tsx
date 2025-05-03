import type { SocialProvider } from "better-auth/social-providers"
import { useCallback, useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { Provider } from "../../lib/social-providers"
import { cn, getLocalizedError, getSearchParam } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import type { AuthCardClassNames } from "./auth-card"

interface ProviderButtonProps {
    className?: string
    classNames?: AuthCardClassNames
    callbackURL?: string
    isSubmitting: boolean
    localization: Partial<AuthLocalization>
    other?: boolean
    provider: Provider
    redirectTo?: string
    socialLayout: "auto" | "horizontal" | "grid" | "vertical"
    setIsSubmitting: (isSubmitting: boolean) => void
}

export function ProviderButton({
    className,
    classNames,
    callbackURL: callbackURLProp,
    isSubmitting,
    localization,
    other,
    provider,
    redirectTo: redirectToProp,
    socialLayout,
    setIsSubmitting
}: ProviderButtonProps) {
    const {
        authClient,
        basePath,
        baseURL,
        colorIcons,
        noColorIcons,
        persistClient,
        redirectTo: contextRedirectTo,
        viewPaths,
        signInSocial,
        toast
    } = useContext(AuthUIContext)

    const getRedirectTo = useCallback(
        () => redirectToProp || getSearchParam("redirectTo") || contextRedirectTo,
        [redirectToProp, contextRedirectTo]
    )

    const getCallbackURL = useCallback(
        () =>
            `${baseURL}${
                callbackURLProp ||
                (persistClient
                    ? `${basePath}/${viewPaths.callback}?redirectTo=${getRedirectTo()}`
                    : getRedirectTo())
            }`,
        [callbackURLProp, persistClient, basePath, viewPaths, baseURL, getRedirectTo]
    )

    const doSignInSocial = async () => {
        setIsSubmitting(true)

        try {
            if (other) {
                await (authClient as AuthClient).signIn.oauth2({
                    providerId: provider.provider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                })
            } else {
                const socialParams = {
                    provider: provider.provider as SocialProvider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                }

                if (signInSocial) {
                    await signInSocial(socialParams)
                } else {
                    await authClient.signIn.social(socialParams)
                }
            }
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })

            setIsSubmitting(false)
        }
    }

    return (
        <Button
            className={cn(
                socialLayout === "vertical" ? "w-full" : "grow",
                className,
                classNames?.form?.button,
                classNames?.form?.outlineButton,
                classNames?.form?.providerButton
            )}
            disabled={isSubmitting}
            variant="outline"
            onClick={doSignInSocial}
        >
            {provider.icon &&
                (colorIcons ? (
                    <provider.icon variant="color" className={classNames?.form?.icon} />
                ) : noColorIcons ? (
                    <provider.icon className={classNames?.form?.icon} />
                ) : (
                    <>
                        <provider.icon
                            className={cn("dark:hidden", classNames?.form?.icon)}
                            variant="color"
                        />
                        <provider.icon
                            className={cn("hidden dark:block", classNames?.form?.icon)}
                        />
                    </>
                ))}

            {socialLayout === "grid" && provider.name}
            {socialLayout === "vertical" && `${localization.signInWith} ${provider.name}`}
        </Button>
    )
}
