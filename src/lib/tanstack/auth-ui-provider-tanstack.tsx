import { AuthUIProvider, type AuthUIProviderProps } from "../../lib/auth-ui-provider"
import { useTanstackOptions } from "./use-tanstack-options"

export function AuthUIProviderTanstack({
    children,
    authClient,
    hooks: hooksProp,
    mutators: mutatorsProp,
    onSessionChange: onSessionChangeProp,
    ...props
}: AuthUIProviderProps) {
    const { hooks, mutators, onSessionChange, optimistic } = useTanstackOptions({ authClient })

    return (
        <AuthUIProvider
            authClient={authClient}
            hooks={{ ...hooks, ...hooksProp }}
            mutators={{ ...mutators, ...mutatorsProp }}
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
