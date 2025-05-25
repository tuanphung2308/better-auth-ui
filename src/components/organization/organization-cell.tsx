"use client"

import type { Organization } from "better-auth/plugins/organization"
import { EllipsisIcon, LogOutIcon } from "lucide-react"
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
import { LeaveOrganizationDialog } from "./leave-organization-dialog"
import { OrganizationView } from "./organization-view"

export interface OrganizationCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    organization: Organization
    localization?: AuthLocalization
}

export function OrganizationCell({
    className,
    classNames,
    organization,
    localization
}: OrganizationCellProps) {
    const { localization: contextLocalization } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)

    return (
        <>
            <Card className={cn("flex-row p-4", className, classNames?.cell)}>
                <OrganizationView organization={organization} localization={localization} />

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
                        <DropdownMenuItem onClick={() => setIsLeaveDialogOpen(true)}>
                            <LogOutIcon className={classNames?.icon} />

                            {localization.leaveOrganization}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Card>

            <LeaveOrganizationDialog
                open={isLeaveDialogOpen}
                onOpenChange={setIsLeaveDialogOpen}
                organization={organization}
                localization={localization}
            />
        </>
    )
}
