import { useContext, useEffect } from "react"

import { useOnSuccessTransition } from "../../hooks/use-success-transition"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getLocalizedError } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"

interface OneTapOpenerProps {
    localization: Partial<AuthLocalization>
    redirectTo?: string
}

export function OneTapOpener({ localization, redirectTo }: OneTapOpenerProps) {
    const { authClient, localization: contextLocalization, toast } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { onSuccess } = useOnSuccessTransition({ redirectTo })

    useEffect(() => {
        ;(authClient as AuthClient).oneTap({
            fetchOptions: {
                onError: ({ error }) => {
                    toast({
                        variant: "error",
                        message: getLocalizedError({ error, localization })
                    })
                },
                onSuccess: () => {
                    onSuccess()
                }
            }
        })
    }, [])

    return null
}
