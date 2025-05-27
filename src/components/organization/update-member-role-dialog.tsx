"use client"

import type { User } from "better-auth"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext, useState } from "react"

import type { Member } from "better-auth/plugins/organization"
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
    member: Member & { user: Partial<User> }
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
        organization,
        toast
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const { refetch } = authClient.useActiveOrganization()

    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedRole, setSelectedRole] = useState(member.role)

    const builtInRoles = [
        { role: "owner", label: localization.owner },
        { role: "admin", label: localization.admin },
        { role: "member", label: localization.member }
    ]

    const roles = [...builtInRoles, ...(organization?.customRoles || [])]
    const availableRoles = roles.filter(
        (role) => member.role === "owner" || role.role !== "owner" || true
    )

    const role = roles.find((r) => r.role === member.role)

    const updateMemberRole = async () => {
        if (selectedRole === member.role) {
            toast({
                variant: "error",
                message: `${localization.role} ${localization.isTheSame}`
            })

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
                message: localization.memberRoleUpdated
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
                        {localization.updateRole}
                    </DialogTitle>

                    <DialogDescription
                        className={cn("text-xs md:text-sm", classNames?.description)}
                    >
                        {localization.updateRoleDescription}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <Card className={cn("flex-row items-center p-4", classNames?.cell)}>
                        <div className="flex items-center gap-2">
                            <UserAvatar
                                className="my-0.5"
                                user={member.user}
                                localization={localization}
                            />

                            <div className="grid flex-1 text-left leading-tight">
                                <span className="truncate font-semibold text-sm">
                                    {member.user.email}
                                </span>

                                <span className="truncate text-xs capitalize opacity-70">
                                    {role?.label}
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
                                <SelectItem key={role.role} value={role.role}>
                                    {role.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

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
                        disabled={isUpdating}
                    >
                        {isUpdating && <Loader2 className="animate-spin" />}

                        {localization.updateRole}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
