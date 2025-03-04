"use client"

import { ReactNode, useContext } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"

export function AuthLoading({ children }: { children: ReactNode }) {
    const { hooks: { useSession } } = useContext(AuthUIContext)
    const { isPending } = useSession()

    if (!isPending) return null

    return (
        <>
            {children}
        </>
    )
}