import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import type { ReactNode } from "react"

import { AuthUIProvider, type AuthUIProviderProps } from "../../lib/auth-ui-provider"

export function AuthUIProviderTanstack({
    children,
    authClient,
    ...props
}: {
    children: ReactNode
} & AuthUIProviderProps) {
    const { useSession, useListAccounts, useListDeviceSessions } = createAuthHooks(authClient)

    return (
        <AuthUIProvider
            authClient={authClient}
            // @ts-expect-error Ignore these types because they will never perfectly match
            hooks={{ useSession, useListAccounts, useListDeviceSessions }}
            {...props}
        >
            {children}
        </AuthUIProvider>
    )
}