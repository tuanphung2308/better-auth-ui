"use client"

import type { createAuthClient } from "better-auth/react"
import type React from "react"
import { type ReactNode, createContext } from "react"

import { useListAccounts } from "../hooks/use-list-accounts"
import { useListDeviceSessions } from "../hooks/use-list-device-sessions"
import { useListSessions } from "../hooks/use-list-sessions"
import { useSession } from "../hooks/use-session"

import { type AuthLocalization, authLocalization } from "./auth-localization"
import { type AuthViewPaths, authViewPaths } from "./auth-view-paths"
import type { SocialProvider } from "./social-providers"

const DefaultLink = ({
    href,
    className,
    children
}: {
    href: string
    className?: string
    children: ReactNode
}) => (
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

export type Link = React.ComponentType<{
    href: string
    to: unknown
    className?: string
    children: ReactNode
}>

export type FieldType = "string" | "number" | "boolean"

export interface AdditionalField {
    description?: ReactNode
    instructions?: ReactNode
    label: ReactNode
    placeholder?: string
    required?: boolean
    type: FieldType
    validate?: (value: string) => Promise<boolean>
}

export interface AdditionalFields {
    [key: string]: AdditionalField
}

const defaultHooks = {
    useSession,
    useListAccounts,
    useListDeviceSessions,
    useListSessions,
    useIsRestoring: () => false
}

export type AuthUIContextType = {
    authClient: Omit<ReturnType<typeof createAuthClient>, "signUp">
    /**
     * Enable or disable avatar support
     * @default false
     */
    avatar?: boolean
    /**
     * File extension for avatar uploads
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
     * Force color icons for both light and dark themes
     * @default false
     */
    colorIcons?: boolean
    /**
     * Enable or disable credentials support
     * @default true
     */
    credentials?: boolean
    /**
     * Default redirect path after sign in
     * @default "/"
     */
    defaultRedirectTo: string
    /**
     * Enable or disable email verification for account deletion
     * @default false
     */
    deleteAccountVerification?: boolean
    /**
     * Enable or disable user account deletion
     * @default false
     */
    deleteUser?: boolean
    /**
     * Enable or disable forgot password support
     * @default false
     */
    forgotPassword?: boolean
    /**
     * Freshness age for session data
     * @default 60 * 60 * 24
     */
    freshAge: number
    localization: AuthLocalization
    /**
     * Enable or disable magic link support
     * @default false
     */
    magicLink?: boolean
    /**
     * Enable or disable multi-session support
     * @default false
     */
    multiSession?: boolean
    /**
     * Enable or disable name requirement for sign up
     * @default true
     */
    nameRequired?: boolean
    /**
     * Force black & white icons for both light and dark themes
     * @default false
     */
    noColorIcons?: boolean
    /**
     * Perform some user updates optimistically
     * @default false
     */
    optimistic?: boolean
    /**
     * Enable or disable passkey support
     * @default false
     */
    passkey?: boolean
    /**
     * Enable or disable persisting the client with better-auth-tanstack
     * @default false
     */
    persistClient?: boolean
    /**
     * Array of social providers to enable
     * @remarks `SocialProvider[]`
     */
    providers?: SocialProvider[]
    /**
     * Enable or disable remember me support
     * @default false
     */
    rememberMe?: boolean
    /**
     * Array of fields to show in `<SettingsCards />`
     * @default ["name"]
     */
    settingsFields?: string[]
    /**
     * Custom settings URL
     */
    settingsUrl?: string
    /**
     * Array of fields to show in Sign Up form
     * @default ["name"]
     */
    signUpFields?: string[]
    /**
     * Enable or disable username support
     * @default false
     */
    username?: boolean
    /**
     * Additional fields for users
     */
    additionalFields?: AdditionalFields
    /**
     * @internal
     */
    hooks: typeof defaultHooks
    viewPaths: AuthViewPaths
    /**
     * Navigate to a new URL
     * @default window.location.href
     */
    navigate: typeof defaultNavigate
    /**
     * Called whenever the session changes
     */
    onSessionChange?: () => void
    /**
     * Replace the current URL
     * @default navigate
     */
    replace: typeof defaultReplace
    /**
     * Upload an avatar image and return the URL string
     * @remarks `(file: File) => Promise<string>`
     */
    uploadAvatar?: (file: File) => Promise<string | undefined | null>
    /**
     * Custom link component for navigation
     * @default <a>
     */
    LinkComponent: Link
}

export type AuthUIProviderProps = {
    /**
     * Your better-auth createAuthClient
     * @default Required
     * @remarks `AuthClient`
     */
    authClient: ReturnType<typeof createAuthClient>
    /**
     * Customize the paths for the auth views
     * @default authViewPaths
     * @remarks `AuthViewPaths`
     */
    viewPaths?: Partial<AuthViewPaths>
    /**
     * Customize the localization strings
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
} & Partial<Omit<AuthUIContextType, "viewPaths" | "localization">>

export const AuthUIContext = createContext<AuthUIContextType>({} as unknown as AuthUIContextType)

export const AuthUIProvider = ({
    children,
    avatarExtension = "png",
    avatarSize,
    basePath = "/auth",
    defaultRedirectTo = "/",
    credentials = true,
    forgotPassword = true,
    freshAge = 60 * 60 * 24,
    hooks = defaultHooks,
    localization,
    nameRequired = true,
    settingsFields = ["name"],
    signUpFields = ["name"],
    viewPaths,
    navigate,
    replace,
    uploadAvatar,
    LinkComponent = DefaultLink,
    ...props
}: {
    children: ReactNode
} & AuthUIProviderProps) => {
    replace = replace || navigate || defaultReplace
    navigate = navigate || defaultNavigate

    avatarSize = uploadAvatar ? 256 : 128

    return (
        <AuthUIContext.Provider
            value={{
                avatarExtension,
                avatarSize,
                basePath: basePath === "/" ? "" : basePath,
                defaultRedirectTo,
                credentials,
                forgotPassword,
                freshAge,
                hooks,
                localization: { ...authLocalization, ...localization },
                nameRequired,
                settingsFields,
                signUpFields,
                navigate,
                replace,
                viewPaths: { ...authViewPaths, ...viewPaths },
                uploadAvatar,
                LinkComponent,
                ...props
            }}
        >
            {children}
        </AuthUIContext.Provider>
    )
}
