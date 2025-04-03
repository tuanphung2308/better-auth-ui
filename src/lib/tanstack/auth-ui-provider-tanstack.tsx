import { AuthUIProvider, type AuthUIProviderProps } from "../../lib/auth-ui-provider"
import { useTanstackOptions } from "./use-tanstack-options"

export function AuthUIProviderTanstack({
    children,
    authClient,
    hooks: hooksProp,
    mutates: mutatesProp,
    onSessionChange: onSessionChangeProp,
    ...props
}: AuthUIProviderProps) {
    const { hooks, mutates, onSessionChange, optimistic } = useTanstackOptions({ authClient })

    return (
        <AuthUIProvider
            authClient={authClient}
            hooks={{ ...hooks, ...hooksProp }}
            mutates={{ ...mutates, ...mutatesProp }}
            onSessionChange={async () => {
                await onSessionChange()
                await onSessionChangeProp?.()
            }}
            optimistic={optimistic}
            {...props}
        >
            {children}
        </AuthUIProvider>
    )
}
