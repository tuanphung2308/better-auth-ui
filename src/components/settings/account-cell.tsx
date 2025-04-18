"use client"

import type { Session, User } from "better-auth"
import { EllipsisIcon, Loader2, LogOutIcon, RepeatIcon } from "lucide-react"
import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getErrorMessage } from "../../lib/get-error-message"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { UserView } from "../user-view"
import type { SettingsCardClassNames } from "./shared/settings-card"

export interface AccountCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    deviceSession: { user: User; session: Session }
    localization?: Partial<AuthLocalization>
    refetch?: () => Promise<void>
}

export function AccountCell({
    className,
    classNames,
    deviceSession,
    localization,
    refetch
}: AccountCellProps) {
    const {
        basePath,
        localization: authLocalization,
        hooks: { useSession },
        mutators: { revokeDeviceSession, setActiveSession },
        toast,
        viewPaths,
        navigate
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { data: sessionData } = useSession()
    const [isLoading, setIsLoading] = useState(false)

    const handleRevoke = async () => {
        setIsLoading(true)

        try {
            await revokeDeviceSession({ sessionToken: deviceSession.session.token })
            refetch?.()
        } catch (error) {
            setIsLoading(false)

            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        }
    }

    const handleSetActiveSession = async () => {
        setIsLoading(true)

        try {
            await setActiveSession({ sessionToken: deviceSession.session.token })
            refetch?.()
        } catch (error) {
            setIsLoading(false)

            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        }
    }

    const isCurrentSession = deviceSession.session.id === sessionData?.session.id

    return (
        <Card className={cn("flex-row p-4", className, classNames?.cell)}>
            <UserView user={deviceSession.user} />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className={cn("relative ms-auto", classNames?.button)}
                        disabled={isLoading}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        <span className={isLoading ? "opacity-0" : "opacity-100"}>
                            <EllipsisIcon />
                        </span>

                        {isLoading && (
                            <span className="absolute">
                                <Loader2 className="animate-spin" />
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    {!isCurrentSession && (
                        <DropdownMenuItem onClick={handleSetActiveSession}>
                            <RepeatIcon />

                            {localization.switchAccount}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onClick={() => {
                            if (isCurrentSession) {
                                navigate(`${basePath}/${viewPaths.signOut}`)
                                return
                            }

                            handleRevoke()
                        }}
                    >
                        <LogOutIcon />

                        {isCurrentSession ? localization.signOut : localization.revoke}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Card>
    )
}
