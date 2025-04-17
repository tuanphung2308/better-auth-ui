"use client"

import type { SocialProvider } from "better-auth/social-providers"
import { type ReactNode, createContext } from "react"
import { toast } from "sonner"

import { useAuthData } from "../hooks/use-auth-data"
import type { AdditionalFields } from "../types/additional-fields"
import type { AnyAuthClient } from "../types/any-auth-client"
import type { AuthClient } from "../types/auth-client"
import type { AuthHooks } from "../types/auth-hooks"
import type { AuthMutators } from "../types/auth-mutators"
import type { Link } from "../types/link"
import type { RenderToast } from "../types/render-toast"
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
    authClient: AnyAuthClient
    /**
     * Additional fields for users
     */
    additionalFields?: AdditionalFields
    /**
     * Enable or disable Avatar support
     * @default false
     */
    avatar?: boolean
    /**
     * File extension for Avatar uploads
     * @default "png"
     */
    avatarExtension: string
    /**
     * Avatars are resized to 128px unless uploadAvatar is provided, then 256px
     * @default 128 | 256
     */
    avatarSize: number
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
     * Force color icons for both light and dark themes
     * @default false
     */
    colorIcons?: boolean
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
     * Enable or disable email verification for account deletion
     * @default false
     */
    deleteAccountVerification?: boolean
    /**
     * Enable or disable user change email support
     * @default true
     */
    changeEmail?: boolean
    /**
     * Enable or disable User Account deletion
     * @default false
     */
    deleteUser?: boolean
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
    /**
     * @internal
     */
    hooks: AuthHooks
    localization: AuthLocalization
    /**
     * Enable or disable Magic Link support
     * @default false
     */
    magicLink?: boolean
    /**
     * Enable or disable Multi Session support
     * @default false
     */
    multiSession?: boolean
    /** @internal */
    mutators: AuthMutators
    /**
     * Enable or disable name requirement for Sign Up
     * @default true
     */
    nameRequired?: boolean
    /**
     * Force black & white icons for both light and dark themes
     * @default false
     */
    noColorIcons?: boolean
    /**
     * Perform some User updates optimistically
     * @default false
     */
    optimistic?: boolean
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
    /**
     * Array of fields to show in `<SettingsCards />`
     * @default ["name"]
     */
    settingsFields?: string[]
    /**
     * Custom Settings URL
     */
    settingsURL?: string
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
     * Upload an Avatar image and return the URL string
     * @remarks `(file: File) => Promise<string>`
     */
    uploadAvatar?: (file: File) => Promise<string | undefined | null>
    /**
     * Custom Link component for navigation
     * @default <a>
     */
    Link: Link
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
} & Partial<Omit<AuthUIContextType, "viewPaths" | "localization" | "mutators" | "toast" | "hooks">>

export const AuthUIContext = createContext<AuthUIContextType>({} as unknown as AuthUIContextType)

export const AuthUIProvider = ({
    children,
    authClient,
    avatarExtension = "png",
    avatarSize,
    basePath = "/auth",
    baseURL = "",
    redirectTo = "/",
    credentials = true,
    changeEmail = true,
    forgotPassword = true,
    freshAge = 60 * 60 * 24,
    hooks,
    mutators,
    localization,
    nameRequired = true,
    settingsFields = ["name"],
    signUp = true,
    signUpFields = ["name"],
    toast = defaultToast,
    viewPaths,
    navigate,
    replace,
    uploadAvatar,
    Link = DefaultLink,
    ...props
}: AuthUIProviderProps) => {
    const defaultMutates: AuthMutators = {
        deletePasskey: (params) =>
            (authClient as AuthClient).passkey.deletePasskey({
                ...params,
                fetchOptions: { throw: true }
            }),
        revokeDeviceSession: (params) =>
            (authClient as AuthClient).multiSession.revoke({
                ...params,
                fetchOptions: { throw: true }
            }),
        revokeSession: (params) =>
            (authClient as AuthClient).revokeSession({
                ...params,
                fetchOptions: { throw: true }
            }),
        setActiveSession: (params) =>
            (authClient as AuthClient).multiSession.setActive({
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
    }

    const defaultHooks: AuthHooks = {
        useSession: (authClient as AuthClient).useSession,
        useListAccounts: () => useAuthData({ queryFn: authClient.listAccounts }),
        useListDeviceSessions: () =>
            useAuthData({ queryFn: (authClient as AuthClient).multiSession.listDeviceSessions }),
        useListSessions: () => useAuthData({ queryFn: authClient.listSessions }),
        useListPasskeys: (authClient as AuthClient).useListPasskeys
    }

    return (
        <AuthUIContext.Provider
            value={{
                authClient,
                avatarExtension,
                avatarSize: avatarSize || (uploadAvatar ? 256 : 128),
                basePath: basePath === "/" ? "" : basePath,
                baseURL,
                redirectTo,
                changeEmail,
                credentials,
                changeEmail,
                forgotPassword,
                freshAge,
                hooks: { ...defaultHooks, ...hooks },
                mutators: { ...defaultMutates, ...mutators },
                localization: { ...authLocalization, ...localization },
                nameRequired,
                settingsFields,
                signUp,
                signUpFields,
                toast,
                navigate: navigate || defaultNavigate,
                replace: replace || navigate || defaultReplace,
                viewPaths: { ...authViewPaths, ...viewPaths },
                uploadAvatar,
                Link,
                ...props
            }}
        >
            {children}
        </AuthUIContext.Provider>
    )
}
