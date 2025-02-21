"use client"

import type { createAuthClient } from "better-auth/react"
import { ReactNode, createContext } from "react"

const DefaultLink = (
    { href, className, children }: { href: string, className?: string, children: ReactNode }
) => (
    <a className={className} href={href} >
        {children}
    </a>
)

const defaultNavigate = (href: string) => window.location.href = href

export type Link = React.ComponentType<{ href: string, to: unknown, className?: string, children: ReactNode }>

export const defaultAuthViews = {
    signUp: "sign-up",
    signIn: "sign-in",
    signOut: "sign-out",
    magicLink: "magic-link",
    forgotPassword: "forgot-password",
    resetPassword: "reset-password",
    settings: "settings",
}

export type AuthUIContextType = {
    authClient: Omit<ReturnType<typeof createAuthClient>, "signUp">,
    authPath: string,
    authViews: typeof defaultAuthViews,
    multiSession: boolean,
    navigate: (href: string) => void
    settingsUrl?: string,
    usernamePlugin?: boolean,
    LinkComponent: Link
}

export type AuthUIProviderProps = {
    authClient: ReturnType<typeof createAuthClient>
    authViews?: Partial<typeof defaultAuthViews>
} & Partial<Omit<AuthUIContextType, "authViews">>

export const AuthUIContext = createContext<AuthUIContextType>({} as unknown as AuthUIContextType)

export const AuthUIProvider = ({
    children,
    authPath = "/auth",
    authViews,
    multiSession = false,
    navigate = defaultNavigate,
    LinkComponent = DefaultLink,
    ...props
}: {
    children: ReactNode
} & AuthUIProviderProps) => {
    return (
        <AuthUIContext.Provider
            value={{
                authViews: { ...defaultAuthViews, ...authViews },
                authPath,
                multiSession,
                navigate,
                LinkComponent,
                ...props
            }}
        >
            {children}
        </AuthUIContext.Provider>
    )
}