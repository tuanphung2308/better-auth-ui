import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useIsRestoring, useQueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { AuthUIProvider, type AuthUIProviderProps } from "../../lib/auth-ui-provider"

export function AuthUIProviderTanstack({
    children,
    authClient,
    onSessionChange,
    ...props
}: {
    children: ReactNode
} & AuthUIProviderProps) {
    const { useListAccounts, useListDeviceSessions, useListSessions, useSession, useUpdateUser } =
        createAuthHooks(authClient)
    const queryClient = useQueryClient()

    const { updateUserAsync } = useUpdateUser()

    const hooks = {
        useIsRestoring,
        useListAccounts,
        useListDeviceSessions,
        useListSessions,
        useSession
    }

    const mutates = {
        updateUser: (params: Record<string, unknown>) =>
            updateUserAsync({ fetchOptions: { throw: false }, ...params })
    }

    return (
        <AuthUIProvider
            authClient={authClient}
            // @ts-ignore
            hooks={hooks}
            // @ts-ignore
            mutates={mutates}
            onSessionChange={() => {
                queryClient.clear()
                onSessionChange?.()
            }}
            {...props}
        >
            {children}
        </AuthUIProvider>
    )
}
