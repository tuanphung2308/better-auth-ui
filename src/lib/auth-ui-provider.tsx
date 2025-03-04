"use client"

import type { createAuthClient } from "better-auth/react"
import { ReactNode, createContext } from "react"

import { useListAccounts } from "../hooks/use-list-accounts"
import { useListDeviceSessions } from "../hooks/use-list-device-sessions"
import { useListSessions } from "../hooks/use-list-sessions"
import { useSession } from "../hooks/use-session"

import { type AuthLocalization, authLocalization } from "./auth-localization"
import type { SocialProvider } from "./social-providers"

const DefaultLink = (
    { href, className, children }: { href: string, className?: string, children: ReactNode }
) => (
    <a className={className} href={href}>
        {children}
    </a>
)

const defaultNavigate = (href: string) => { window.location.href = href }
const defaultReplace = (href: string) => { window.location.replace(href) }

export type Link = React.ComponentType<{ href: string, to: unknown, className?: string, children: ReactNode }>

export const authViewPaths = {
    callback: "callback",
    forgotPassword: "forgot-password",
    magicLink: "magic-link",
    resetPassword: "reset-password",
    settings: "settings",
    signIn: "sign-in",
    signOut: "sign-out",
    signUp: "sign-up",
}

export type FieldType = "string" | "number"

type AdditionalFields = Record<string, {
    description?: string,
    instructions?: string,
    label: string,
    placeholder?: string,
    required?: boolean,
    type: FieldType,
}>

export type AuthView = keyof typeof authViewPaths

const defaultHooks = {
    useSession,
    useListAccounts,
    useListDeviceSessions,
    useListSessions,
    useIsRestoring: () => false,
}

export type AuthUIContextType = {
    authClient: Omit<ReturnType<typeof createAuthClient>, "signUp">
    avatar?: boolean
    avatarExtension: string
    avatarSize: number
    basePath: string
    colorIcons?: boolean
    credentials?: boolean
    defaultRedirectTo: string
    deleteAccountVerification?: boolean
    deleteUser?: boolean
    forgotPassword?: boolean
    freshAge: number
    localization: AuthLocalization
    magicLink?: boolean
    multiSession?: boolean
    nameRequired?: boolean
    noColorIcons?: boolean
    optimistic?: boolean
    passkey?: boolean
    persistClient?: boolean
    providers?: SocialProvider[]
    settingsUrl?: string
    signUpFields?: string[]
    username?: boolean
    additionalFields?: AdditionalFields
    hooks: typeof defaultHooks
    viewPaths: typeof authViewPaths
    navigate: typeof defaultNavigate
    onSessionChange?: () => void
    replace: typeof defaultReplace
    uploadAvatar?: (file: File) => Promise<string | undefined | null>
    LinkComponent: Link
}

export type AuthUIProviderProps = {
    authClient: ReturnType<typeof createAuthClient>
    viewPaths?: Partial<typeof authViewPaths>
    localization?: Partial<AuthLocalization>
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
                basePath: basePath == "/" ? "" : basePath,
                defaultRedirectTo,
                credentials,
                forgotPassword,
                freshAge,
                hooks,
                localization: { ...authLocalization, ...localization },
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