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

export const viewPaths = {
    signUp: "sign-up",
    signIn: "sign-in",
    signOut: "sign-out",
    magicLink: "magic-link",
    forgotPassword: "forgot-password",
    resetPassword: "reset-password"
}

export type AuthView = keyof typeof viewPaths

export type AuthUIContextType = {
    authClient: Omit<ReturnType<typeof createAuthClient>, "signUp">,
    basePath: string,
    viewPaths: typeof viewPaths,
    multiSession: boolean,
    navigate: (href: string) => void
    settingsUrl?: string,
    usernamePlugin?: boolean,
    LinkComponent: Link
}

export type AuthUIProviderProps = {
    authClient: ReturnType<typeof createAuthClient>
    viewPaths?: Partial<typeof viewPaths>
} & Partial<Omit<AuthUIContextType, "viewPaths">>

export const AuthUIContext = createContext<AuthUIContextType>({} as unknown as AuthUIContextType)

export const AuthUIProvider = ({
    children,
    basePath = "/auth",
    viewPaths: viewPathsProp,
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
                viewPaths: { ...viewPaths, ...viewPathsProp },
                basePath,
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