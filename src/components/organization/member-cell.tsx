"use client"

import type { User } from "better-auth"
import { EllipsisIcon, UserXIcon } from "lucide-react"
import { useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
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
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

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
                            {member.role}
                        </span>
                    </div>
                </div>

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

                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => setRemoveDialogOpen(true)}
                            variant="destructive"
                        >
                            <UserXIcon className={classNames?.icon} />
                            {localization?.removeMember}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Card>

            <RemoveMemberDialog
                open={removeDialogOpen}
                onOpenChange={setRemoveDialogOpen}
                member={member}
                classNames={classNames}
                localization={localization}
            />
        </>
    )
}
