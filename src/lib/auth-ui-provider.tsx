"use client"

import type { SocialProvider } from "better-auth/social-providers"
import { type ReactNode, createContext, useEffect, useMemo } from "react"
import { toast } from "sonner"

import { RecaptchaV3 } from "../components/captcha/recaptcha-v3"
import { useAuthData } from "../hooks/use-auth-data"
import type { AdditionalFields } from "../types/additional-fields"
import type { AnyAuthClient } from "../types/any-auth-client"
import type { AuthClient } from "../types/auth-client"
import type { AuthHooks } from "../types/auth-hooks"
import type { AuthMutators } from "../types/auth-mutators"
import type { AvatarOptions } from "../types/avatar-options"
import type { CaptchaOptions } from "../types/captcha-options"
import type { DeleteUserOptions } from "../types/delete-user-options"
import type { Link } from "../types/link"
import type { OrganizationOptions } from "../types/organization-options"
import type { PasswordValidation } from "../types/password-validation"
import type { RenderToast } from "../types/render-toast"
import type { SettingsOptions } from "../types/settings-options"
import { type AuthLocalization, authLocalization } from "./auth-localization"
import { type AuthViewPaths, authViewPaths } from "./auth-view-paths"
import type { Provider } from "./social-providers"

const DefaultLink: Link = ({ href, className, children }) => (
    <a className={className} href={href}>
        {children}
    </a>
)

const defaultNavigate = (href: string) => {
    window.location.href = href
}

const defaultReplace = (href: string) => {
    window.location.replace(href)
}

const defaultToast: RenderToast = ({ variant = "default", message }) => {
    if (variant === "default") {
        toast(message)
    } else {
        toast[variant](message)
    }
}

export type AuthUIContextType = {
    authClient: AuthClient
    /**
     * Additional fields for users
     */
    additionalFields?: AdditionalFields
    /**
     * API Key plugin configuration
     */
    apiKey?:
        | {
              /**
               * Prefix for API Keys
               */
              prefix?: string
              /**
               * Metadata for API Keys
               */
              metadata?: Record<string, unknown>
          }
        | boolean
    /**
     * Avatar configuration
     * @default undefined
     */
    avatar?: AvatarOptions
    /**
     * Base path for the auth views
     * @default "/auth"
     */
    basePath: string
    /**
     * Front end base URL for auth API callbacks
     */
    baseURL?: string
    /**
     * Captcha configuration
     */
    captcha?: CaptchaOptions
    /**
     * Enable or disable color icons for both light and dark themes
     * The default is to use color icons for light mode and black & white icons for dark mode
     * @default undefined
     */
    colorIcons?: boolean | undefined
    /**
     * Enable or disable the Confirm Password input
     * @default false
     */
    confirmPassword?: boolean
    /**
     * Enable or disable Credentials support
     * @default true
     */
    credentials?: boolean
    /**
     * Default redirect URL after authenticating
     * @default "/"
     */
    redirectTo: string
    /**
     * Enable or disable user change email support
     * @default true
     */
    changeEmail?: boolean
    /**
     * User Account deletion configuration
     * @default undefined
     */
    deleteUser?: DeleteUserOptions
    /**
     * Show Verify Email card for unverified emails
     */
    emailVerification?: boolean
    /**
     * Enable or disable Forgot Password flow
     * @default true
     */
    forgotPassword?: boolean
    /**
     * Freshness age for Session data
     * @default 60 * 60 * 24
     */
    freshAge: number
    hooks: AuthHooks
    localization: AuthLocalization
    /**
     * Enable or disable Magic Link support
     * @default false
     */
    magicLink?: boolean
    /**
     * Enable or disable Email OTP support
     * @default false
     */
    emailOTP?: boolean
    /**
     * Enable or disable Multi Session support
     * @default false
     */
    multiSession?: boolean
    /** @internal */
    mutators: AuthMutators
    /**
     * Whether the name field should be required
     * @default true
     */
    nameRequired?: boolean
    /**
     * @deprecated use colorIcons instead
     */
    noColorIcons?: boolean
    /**
     * Enable or disable One Tap support
     * @default false
     */
    oneTap?: boolean
    /**
     * Perform some User updates optimistically
     * @default false
     */
    optimistic?: boolean
    /**
     * Organization plugin configuration
     */
    organization?: OrganizationOptions
    /**
     * Enable or disable Passkey support
     * @default false
     */
    passkey?: boolean
    /**
     * Forces better-auth-tanstack to refresh the Session on the auth callback page
     * @default false
     */
    persistClient?: boolean
    /**
     * Array of Social Providers to enable
     * @remarks `SocialProvider[]`
     */
    providers?: SocialProvider[]
    /**
     * Custom OAuth Providers
     * @default false
     */
    otherProviders?: Provider[]
    /**
     * Enable or disable Remember Me checkbox
     * @default false
     */
    rememberMe?: boolean
    settings?: SettingsOptions
    /**
     * Enable or disable Sign Up form
     * @default true
     */
    signUp?: boolean
    /**
     * Array of fields to show in Sign Up form
     * @default ["name"]
     */
    signUpFields?: string[]
    /**
     * Custom social sign in function
     */
    signInSocial?: (params: Parameters<AuthClient["signIn"]["social"]>[0]) => Promise<unknown>
    toast: RenderToast
    /**
     * Enable or disable two-factor authentication support
     * @default undefined
     */
    twoFactor?: ("otp" | "totp")[]
    /**
     * Enable or disable Username support
     * @default false
     */
    username?: boolean
    viewPaths: AuthViewPaths
    /**
     * Navigate to a new URL
     * @default window.location.href
     */
    navigate: typeof defaultNavigate
    /**
     * Called whenever the Session changes
     */
    onSessionChange?: () => void | Promise<void>
    /**
     * Replace the current URL
     * @default navigate
     */
    replace: typeof defaultReplace
    /**
     * @deprecated use avatar.upload instead
     */
    uploadAvatar?: (file: File) => Promise<string | undefined | null>
    /**
     * Custom Link component for navigation
     * @default <a>
     */
    Link: Link
    /**
     * Customize the password validation
     */
    passwordValidation?: PasswordValidation
}

export type AuthUIProviderProps = {
    children: ReactNode
    /**
     * Better Auth client returned from createAuthClient
     * @default Required
     * @remarks `AuthClient`
     */
    authClient: AnyAuthClient
    /**
     * Avatar configuration
     * @default undefined
     */
    avatar?: boolean | Partial<AvatarOptions>
    /**
     * Settings configuration
     * @default { fields: ["avatar", "name"] }
     */
    settings?: boolean | Partial<SettingsOptions>
    /**
     * @deprecated use settings.fields instead
     */
    settingsFields?: string[]
    /**
     * @deprecated use settings.url instead
     */
    settingsURL?: string
    /**
     * @deprecated use avatar.extension instead
     */
    avatarExtension?: string
    /**
     * @deprecated use avatar.size instead
     */
    avatarSize?: number
    /**
     * @deprecated use deleteUser.verification instead
     */
    deleteAccountVerification?: boolean
    /**
     * User Account deletion configuration
     * @default undefined
     */
    deleteUser?: DeleteUserOptions | boolean
    /**
     * ADVANCED: Custom hooks for fetching auth data
     */
    hooks?: Partial<AuthHooks>
    /**
     * Customize the paths for the auth views
     * @default authViewPaths
     * @remarks `AuthViewPaths`
     */
    viewPaths?: Partial<AuthViewPaths>
    /**
     * Render custom Toasts
     * @default Sonner
     */
    toast?: RenderToast
    /**
     * Customize the Localization strings
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
    /**
     * ADVANCED: Custom mutators for updating auth data
     */
    mutators?: Partial<AuthMutators>
} & Partial<
    Omit<
        AuthUIContextType,
        | "authClient"
        | "viewPaths"
        | "localization"
        | "mutators"
        | "toast"
        | "hooks"
        | "avatar"
        | "settings"
        | "deleteUser"
    >
>

export const AuthUIContext = createContext<AuthUIContextType>({} as unknown as AuthUIContextType)

export const AuthUIProvider = ({
    children,
    authClient: authClientProp,
    avatar: avatarProp,
    settings: settingsProp,
    settingsFields,
    settingsURL,
    avatarExtension,
    avatarSize,
    deleteUser: deleteUserProp,
    deleteAccountVerification,
    basePath = "/auth",
    baseURL = "",
    captcha,
    colorIcons,
    redirectTo = "/",
    credentials = true,
    changeEmail = true,
    forgotPassword = true,
    freshAge = 60 * 60 * 24,
    hooks: hooksProp,
    mutators: mutatorsProp,
    localization: localizationProp,
    nameRequired = true,
    noColorIcons,
    organization,
    signUp = true,
    signUpFields = ["name"],
    toast = defaultToast,
    viewPaths: viewPathsProp,
    navigate,
    replace,
    uploadAvatar,
    Link = DefaultLink,
    ...props
}: AuthUIProviderProps) => {
    useEffect(() => {
        if (noColorIcons) {
            console.warn("[Better Auth UI] noColorIcons is deprecated, use colorIcons instead")
        }

        if (uploadAvatar) {
            console.warn("[Better Auth UI] uploadAvatar is deprecated, use avatar.upload instead")
        }

        if (avatarExtension) {
            console.warn(
                "[Better Auth UI] avatarExtension is deprecated, use avatar.extension instead"
            )
        }

        if (avatarSize) {
            console.warn("[Better Auth UI] avatarSize is deprecated, use avatar.size instead")
        }

        if (settingsFields) {
            console.warn(
                "[Better Auth UI] settingsFields is deprecated, use settings.fields instead"
            )
        }

        if (settingsURL) {
            console.warn("[Better Auth UI] settingsURL is deprecated, use settings.url instead")
        }

        if (deleteAccountVerification) {
            console.warn(
                "[Better Auth UI] deleteAccountVerification is deprecated, use deleteUser.verification instead"
            )
        }
    }, [
        noColorIcons,
        uploadAvatar,
        avatarExtension,
        avatarSize,
        settingsFields,
        settingsURL,
        deleteAccountVerification
    ])

    if (noColorIcons) {
        colorIcons = false
    }

    const authClient = authClientProp as AuthClient

    const avatar = useMemo<AvatarOptions | undefined>(() => {
        if (!avatarProp) return

        if (avatarProp === true) {
            return {
                extension: avatarExtension || "png",
                size: avatarSize || (uploadAvatar ? 256 : 128),
                upload: uploadAvatar
            }
        }

        return {
            upload: avatarProp.upload || uploadAvatar,
            extension: avatarProp.extension || avatarExtension || "png",
            size: avatarProp.size || (avatarProp.upload ? 256 : 128)
        }
    }, [avatarProp, avatarExtension, avatarSize, uploadAvatar])

    const settings = useMemo<SettingsOptions | undefined>(() => {
        if (settingsProp === false) return

        if (settingsProp === true || settingsProp === undefined) {
            return {
                url: settingsURL,
                fields: settingsFields || ["avatar", "name"]
            }
        }

        return {
            url: settingsProp.url,
            fields: settingsProp.fields || ["avatar", "name"]
        }
    }, [settingsProp, settingsFields, settingsURL])

    const deleteUser = useMemo<DeleteUserOptions | undefined>(() => {
        if (!deleteUserProp) return

        if (deleteUserProp === true) {
            return {
                verification: deleteAccountVerification
            }
        }

        return deleteUserProp
    }, [deleteUserProp, deleteAccountVerification])

    const defaultMutators = useMemo(() => {
        return {
            deleteApiKey: (params) =>
                authClient.apiKey.delete({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            deletePasskey: (params) =>
                authClient.passkey.deletePasskey({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            revokeDeviceSession: (params) =>
                authClient.multiSession.revoke({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            revokeSession: (params) =>
                authClient.revokeSession({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            setActiveSession: (params) =>
                authClient.multiSession.setActive({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            updateUser: (params) =>
                authClient.updateUser({
                    ...params,
                    fetchOptions: { throw: true }
                }),
            unlinkAccount: (params) =>
                authClient.unlinkAccount({
                    ...params,
                    fetchOptions: { throw: true }
                })
        } as AuthMutators
    }, [authClient])

    const defaultHooks = useMemo(() => {
        return {
            useSession: authClient.useSession,
            useListAccounts: () => useAuthData({ queryFn: authClient.listAccounts }),
            useListDeviceSessions: () =>
                useAuthData({
                    queryFn: authClient.multiSession.listDeviceSessions
                }),
            useListSessions: () => useAuthData({ queryFn: authClient.listSessions }),
            useListPasskeys: authClient.useListPasskeys,
            useListApiKeys: () => useAuthData({ queryFn: authClient.apiKey.list }),
            useListOrganizations: authClient.useListOrganizations
        } as AuthHooks
    }, [authClient])

    const viewPaths = useMemo(() => {
        return { ...authViewPaths, ...viewPathsProp } as AuthViewPaths
    }, [viewPathsProp])

    const localization = useMemo(() => {
        return { ...authLocalization, ...localizationProp } as AuthLocalization
    }, [localizationProp])

    const hooks = useMemo(() => {
        return { ...defaultHooks, ...hooksProp } as AuthHooks
    }, [defaultHooks, hooksProp])

    const mutators = useMemo(() => {
        return { ...defaultMutators, ...mutatorsProp } as AuthMutators
    }, [defaultMutators, mutatorsProp])

    // Remove trailing slash from baseURL
    baseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL

    // Remove trailing slash from basePath
    basePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath

    return (
        <AuthUIContext.Provider
            value={{
                authClient,
                avatar,
                basePath: basePath === "/" ? "" : basePath,
                baseURL,
                captcha,
                colorIcons,
                redirectTo,
                changeEmail,
                credentials,
                deleteUser,
                forgotPassword,
                freshAge,
                hooks,
                mutators,
                localization,
                nameRequired,
                organization,
                settings,
                signUp,
                signUpFields,
                toast,
                navigate: navigate || defaultNavigate,
                replace: replace || navigate || defaultReplace,
                viewPaths,
                Link,
                ...props
            }}
        >
            {captcha?.provider === "google-recaptcha-v3" ? (
                <RecaptchaV3>{children}</RecaptchaV3>
            ) : (
                children
            )}
        </AuthUIContext.Provider>
    )
}
