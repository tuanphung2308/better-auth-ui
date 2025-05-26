"use client"

import type { Organization } from "better-auth/plugins/organization"
import { EllipsisIcon, Loader2, LogOutIcon, SettingsIcon } from "lucide-react"
import { useCallback, useContext, useMemo, useState } from "react"

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
    localization: localizationProp
}: OrganizationCellProps) {
    const {
        authClient,
        basePath,
        localization: contextLocalization,
        viewPaths,
        navigate,
        toast
    } = useContext(AuthUIContext)

    const localization = useMemo(() => ({ ...contextLocalization, ...localizationProp }), [contextLocalization, localizationProp])

    const { refetch: refetchActiveOrganization } = authClient.useActiveOrganization()
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
    const [isManagingOrganization, setIsManagingOrganization] = useState(false)

    const handleManageOrganization = useCallback(async () => {
        setIsManagingOrganization(true)

        try {
            await authClient.organization.setActive({
                organizationId: organization.id,
                fetchOptions: {
                    throw: true
                }
            })

            await refetchActiveOrganization()

            navigate(`${basePath}/${viewPaths.organization}`)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        } finally {
            setIsManagingOrganization(false)
        }
    }, [authClient, organization.id, basePath, viewPaths, navigate, toast, localization, refetchActiveOrganization])

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
                            disabled={isManagingOrganization}
                            size="icon"
                            type="button"
                            variant="outline"
                        >
                            {isManagingOrganization ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <EllipsisIcon className={classNames?.icon} />
                            )}
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={handleManageOrganization}
                            disabled={isManagingOrganization}
                        >
                            <SettingsIcon className={classNames?.icon} />

                            {localization.manageOrganization}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setIsLeaveDialogOpen(true)} variant="destructive">
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
