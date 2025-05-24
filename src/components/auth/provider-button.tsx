import type { SocialProvider } from "better-auth/social-providers"
import { useCallback, useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { Provider } from "../../lib/social-providers"
import { cn, getLocalizedError, getSearchParam } from "../../lib/utils"
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
        persistClient,
        redirectTo: contextRedirectTo,
        viewPaths,
        social,
        genericOAuth,
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
                const oauth2Params = {
                    providerId: provider.provider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                }

                if (genericOAuth?.signIn) {
                    await genericOAuth.signIn(oauth2Params)

                    setTimeout(() => {
                        setIsSubmitting(false)
                    }, 10000)
                } else {
                    await authClient.signIn.oauth2(oauth2Params)
                }
            } else {
                const socialParams = {
                    provider: provider.provider as SocialProvider,
                    callbackURL: getCallbackURL(),
                    fetchOptions: { throw: true }
                }

                if (social?.signIn) {
                    await social.signIn(socialParams)

                    setTimeout(() => {
                        setIsSubmitting(false)
                    }, 10000)
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
                (colorIcons === true ? (
                    <provider.icon variant="color" className={classNames?.form?.icon} />
                ) : colorIcons === false ? (
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
