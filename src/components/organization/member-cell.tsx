"use client"

import type { User } from "better-auth"
import { EllipsisIcon, UserCogIcon, UserXIcon } from "lucide-react"
import { useContext, useState } from "react"

import type { Member } from "better-auth/plugins/organization"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { UserView } from "../user-view"
import { RemoveMemberDialog } from "./remove-member-dialog"
import { UpdateMemberRoleDialog } from "./update-member-role-dialog"

export interface MemberCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    member: Member & { user: Partial<User> }
    localization?: AuthLocalization
    hideActions?: boolean
}

export function MemberCell({
    className,
    classNames,
    member,
    localization,
    hideActions
}: MemberCellProps) {
    const { organization, localization: contextLocalization } = useContext(AuthUIContext)
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
    const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false)

    const fullLocalization = { ...contextLocalization, ...localization }

    const builtInRoles = [
        { role: "owner", label: fullLocalization.owner },
        { role: "admin", label: fullLocalization.admin },
        { role: "member", label: fullLocalization.member }
    ]

    const roles = [...builtInRoles, ...(organization?.customRoles || [])]
    const role = roles.find((r) => r.role === member.role)

    return (
        <>
            <Card className={cn("flex-row items-center p-4", className, classNames?.cell)}>
                <UserView user={member.user} localization={localization} className="flex-1" />
                <span className="text-sm opacity-70">{role?.label}</span>

                {!hideActions && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className={cn(
                                    "relative ms-auto",
                                    classNames?.button,
                                    classNames?.outlineButton
                                )}
                                size="icon"
                                type="button"
                                variant="outline"
                            >
                                <EllipsisIcon className={classNames?.icon} />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
                            <DropdownMenuItem onClick={() => setUpdateRoleDialogOpen(true)}>
                                <UserCogIcon className={classNames?.icon} />
                                {localization?.updateRole}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => setRemoveDialogOpen(true)}
                                variant="destructive"
                            >
                                <UserXIcon className={classNames?.icon} />
                                {localization?.removeMember}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </Card>

            <RemoveMemberDialog
                open={removeDialogOpen}
                onOpenChange={setRemoveDialogOpen}
                member={member}
                classNames={classNames}
                localization={localization}
            />

            <UpdateMemberRoleDialog
                open={updateRoleDialogOpen}
                onOpenChange={setUpdateRoleDialogOpen}
                member={member}
                classNames={classNames}
                localization={localization}
            />
        </>
    )
}
