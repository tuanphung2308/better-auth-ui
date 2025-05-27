"use client"

import type { User } from "better-auth"
import { EllipsisIcon, ShieldIcon, UserXIcon } from "lucide-react"
import { useContext, useState } from "react"

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
import { UserAvatar } from "../user-avatar"
import { RemoveMemberDialog } from "./remove-member-dialog"
import { UpdateMemberRoleDialog } from "./update-member-role-dialog"

export interface MemberCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    member: {
        id: string
        userId: string
        user: Partial<User>
        role: string
        organizationId: string
    }
    localization?: AuthLocalization
}

export function MemberCell({ className, classNames, member, localization }: MemberCellProps) {
    const { organization, localization: contextLocalization } = useContext(AuthUIContext)
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
    const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false)

    const fullLocalization = { ...contextLocalization, ...localization }

    // Create role labels mapping
    const roleLabels: Record<string, string> = {
        owner: fullLocalization.owner || "Owner",
        admin: fullLocalization.admin || "Admin",
        member: fullLocalization.member || "Member"
    }
    if (organization?.customRoles) {
        for (const { role, label } of organization.customRoles) {
            roleLabels[role] = label
        }
    }

    const getRoleLabel = (role: string) => {
        return roleLabels[role] || role.charAt(0).toUpperCase() + role.slice(1)
    }

    return (
        <>
            <Card className={cn("flex-row items-center p-4", className, classNames?.cell)}>
                <div className="flex items-center gap-2">
                    <UserAvatar className="my-0.5" user={member.user} localization={localization} />

                    <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-semibold text-sm">
                            {member.user?.email || localization?.user}
                        </span>

                        <span className="truncate text-xs capitalize opacity-70">
                            {getRoleLabel(member.role)}
                        </span>
                    </div>
                </div>

                {
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
                                <ShieldIcon className={classNames?.icon} />
                                {localization?.changeRole || "Change Role"}
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
                }
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
