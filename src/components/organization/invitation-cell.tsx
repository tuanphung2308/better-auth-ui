"use client"

import type { Invitation } from "better-auth/plugins/organization"
import { EllipsisIcon, Loader2, XIcon } from "lucide-react"
import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { UserAvatar } from "../user-avatar"

export interface InvitationCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    invitation: Invitation
    localization?: AuthLocalization
}

export function InvitationCell({
    className,
    classNames,
    invitation,
    localization: localizationProp
}: InvitationCellProps) {
    const {
        authClient,
        organization,
        hooks: { useActiveOrganization },
        localization: contextLocalization,
        toast
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }
    const [isLoading, setIsLoading] = useState(false)

    const { refetch } = useActiveOrganization()

    const builtInRoles = [
        { role: "owner", label: localization.owner },
        { role: "admin", label: localization.admin },
        { role: "member", label: localization.member }
    ]

    const roles = [...builtInRoles, ...(organization?.customRoles || [])]
    const role = roles.find((r) => r.role === invitation.role)

    const handleCancelInvitation = async () => {
        setIsLoading(true)

        try {
            await authClient.organization.cancelInvitation({
                invitationId: invitation.id,
                fetchOptions: { throw: true }
            })

            await refetch()

            toast({
                variant: "success",
                message: localization.invitationCancelled
            })
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setIsLoading(false)
    }

    return (
        <Card className={cn("flex-row items-center p-4", className, classNames?.cell)}>
            <div className="flex flex-1 items-center gap-2">
                <UserAvatar
                    className="my-0.5"
                    user={{ email: invitation.email }}
                    localization={localization}
                />

                <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-semibold text-sm">{invitation.email}</span>

                    <span className="truncate text-muted-foreground text-xs">
                        {localization.expires} {invitation.expiresAt.toLocaleDateString()}
                    </span>
                </div>
            </div>

            <span className="truncate text-sm opacity-70">{role?.label}</span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className={cn(
                            "relative ms-auto",
                            classNames?.button,
                            classNames?.outlineButton
                        )}
                        disabled={isLoading}
                        size="icon"
                        type="button"
                        variant="outline"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <EllipsisIcon className={classNames?.icon} />
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuItem
                        onClick={handleCancelInvitation}
                        disabled={isLoading}
                        variant="destructive"
                    >
                        <XIcon className={classNames?.icon} />
                        {localization.cancelInvitation}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </Card>
    )
}
