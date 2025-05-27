"use client"

import type { User } from "better-auth"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { UserAvatar } from "../user-avatar"

export interface UpdateMemberRoleDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    member: {
        id: string
        userId: string
        user: Partial<User>
        role: string
        organizationId: string
    }
}

export function UpdateMemberRoleDialog({
    member,
    classNames,
    localization: localizationProp,
    onOpenChange,
    ...props
}: UpdateMemberRoleDialogProps) {
    const {
        authClient,
        localization: contextLocalization,
        toast,
        organization
    } = useContext(AuthUIContext)
    const { refetch } = authClient.useActiveOrganization()
    const localization = { ...contextLocalization, ...localizationProp }

    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedRole, setSelectedRole] = useState(member.role)

    // Built-in roles
    const builtInRoles = ["owner", "admin", "member"]

    // Get all roles (built-in + custom), excluding "owner"
    const allRoles = [...builtInRoles, ...(organization?.customRoles?.map((r) => r.role) || [])]
    const availableRoles = allRoles.filter((role) => role !== "owner")

    // Create role labels mapping
    const roleLabels: Record<string, string> = {
        owner: localization.owner || "Owner",
        admin: localization.admin || "Admin",
        member: localization.member || "Member"
    }
    if (organization?.customRoles) {
        for (const { role, label } of organization.customRoles) {
            roleLabels[role] = label
        }
    }

    const getRoleLabel = (role: string) => {
        return roleLabels[role] || role.charAt(0).toUpperCase() + role.slice(1)
    }

    const updateMemberRole = async () => {
        if (selectedRole === member.role) {
            onOpenChange?.(false)
            return
        }

        setIsUpdating(true)

        try {
            await authClient.organization.updateMemberRole({
                memberId: member.id,
                // @ts-ignore - role is a string but the type expects specific values
                role: selectedRole,
                organizationId: member.organizationId,
                fetchOptions: {
                    throw: true
                }
            })

            toast({
                variant: "success",
                message: localization.memberRoleUpdated || "Member role updated successfully"
            })

            await refetch?.()
            onOpenChange?.(false)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setIsUpdating(false)
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent
                className={classNames?.dialog?.content}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.changeRole}
                    </DialogTitle>

                    <DialogDescription
                        className={cn("text-xs md:text-sm", classNames?.description)}
                    >
                        {localization.changeRoleDescription || "Update the role for this member"}
                    </DialogDescription>
                </DialogHeader>

                <Card className={cn("my-4 flex-row items-center p-4", classNames?.cell)}>
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            className="my-0.5"
                            user={member.user}
                            localization={localization}
                        />

                        <div className="grid flex-1 text-left leading-tight">
                            <span className="truncate font-semibold text-sm">
                                {member.user?.email || localization?.user}
                            </span>

                            <span className="truncate text-xs capitalize opacity-70">
                                {getRoleLabel(member.role)}
                            </span>
                        </div>
                    </div>
                </Card>

                <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={localization.selectRole} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                                {getRoleLabel(role)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DialogFooter className={classNames?.dialog?.footer}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange?.(false)}
                        className={cn(classNames?.button, classNames?.outlineButton)}
                        disabled={isUpdating}
                    >
                        {localization.cancel}
                    </Button>

                    <Button
                        type="button"
                        onClick={updateMemberRole}
                        className={cn(classNames?.button, classNames?.primaryButton)}
                        disabled={isUpdating || selectedRole === member.role}
                    >
                        {isUpdating && <Loader2 className="animate-spin" />}
                        {localization.updateRole || "Update Role"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
