"use client"

import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { type UserButtonClassNames, UserButtonPrimitive } from "../primitives/user-button-primitive"

export function UserButton({
    className,
    classNames,
}: {
    className?: string,
    classNames?: UserButtonClassNames
}) {
    const { authClient } = useContext(AuthUIContext)
    const { useSession, useListDeviceSessions } = createAuthHooks(authClient)
    const { user, isPending: sessionPending } = useSession()
    const { deviceSessions, setActiveSession, setActiveSessionPending } = useListDeviceSessions()

    return (
        <UserButtonPrimitive
            className={className}
            classNames={classNames}
            deviceSessions={deviceSessions}
            isPending={sessionPending || setActiveSessionPending}
            setActiveSession={setActiveSession}
            user={user}
        />
    )
}