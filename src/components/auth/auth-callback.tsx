"use client"

import { Loader2 } from "lucide-react"
import { useContext, useEffect, useRef } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { useOnSuccessTransition } from "./forms/use-success-transition"

export function AuthCallback({ redirectTo }: { redirectTo?: string }) {
    const {
        hooks: { useIsRestoring },
        persistClient
    } = useContext(AuthUIContext)

    const isRestoring = useIsRestoring?.()
    const isRedirecting = useRef(false)

    const { onSuccess } = useOnSuccessTransition({ redirectTo })

    useEffect(() => {
        if (isRedirecting.current) return

        if (!persistClient) {
            isRedirecting.current = true
            onSuccess()
            return
        }

        if (isRestoring) return

        isRedirecting.current = true
        onSuccess()
    }, [isRestoring, persistClient, onSuccess])

    return <Loader2 className="animate-spin" />
}
