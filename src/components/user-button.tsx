"use client"

import { type createAuthClient } from "better-auth/react"
import { useContext, useEffect, useState } from "react"

import { AuthUIContext } from "../lib/auth-ui-provider"

import {
    type UserButtonClassNames,
    UserButtonPrimitive,
    type userButtonLocalization
} from "./primitives/user-button-primitive"

type AuthClient = ReturnType<typeof createAuthClient>
type SessionData = AuthClient["$Infer"]["Session"]

export function UserButton({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: UserButtonClassNames,
    localization?: Partial<typeof userButtonLocalization>

}) {
    const { authClient } = useContext(AuthUIContext)
    const [deviceSessions, setDeviceSessions] = useState<SessionData[] | undefined>(undefined)
    const [activeSessionPending, setActiveSessionPending] = useState(false)

    const { data: sessionData, isPending: sessionPending } = authClient.useSession()

    useEffect(() => {
        if (!sessionData) return

        // @ts-expect-error Optional plugin
        authClient.multiSession.listDeviceSessions().then(({ data }) => {
            setDeviceSessions(data)
        })
    }, [sessionData, authClient])

    useEffect(() => {
        setActiveSessionPending(false)
    }, [sessionData])

    return (
        <UserButtonPrimitive
            className={className}
            classNames={classNames}
            deviceSessions={deviceSessions}
            isPending={sessionPending || activeSessionPending}
            localization={localization}
            setActiveSession={(sessionToken) => {
                setActiveSessionPending(true)

                // @ts-expect-error Optional plugin
                authClient?.multiSession.setActive({ sessionToken })
            }}
            user={sessionData?.user}
        />
    )
}