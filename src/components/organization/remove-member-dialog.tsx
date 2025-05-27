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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import { MemberCell } from "./member-cell"

export interface RemoveMemberDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    member: Member & { user: Partial<User> }
}

export function RemoveMemberDialog({
    member,
    classNames,
    localization: localizationProp,
    onOpenChange,
    ...props
}: RemoveMemberDialogProps) {
    const {
        authClient,
        hooks: { useActiveOrganization },
        localization: contextLocalization,
        toast,
        organization
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const { refetch } = useActiveOrganization()

    const builtInRoles = [
        { role: "owner", label: localization.owner },
        { role: "admin", label: localization.admin },
        { role: "member", label: localization.member }
    ]

    const roles = [...builtInRoles, ...(organization?.customRoles || [])]
    const role = roles.find((r) => r.role === member.role)

    const [isRemoving, setIsRemoving] = useState(false)

    const removeMember = async () => {
        setIsRemoving(true)

        try {
            await authClient.organization.removeMember({
                memberIdOrEmail: member.id,
                organizationId: member.organizationId,
                fetchOptions: {
                    throw: true
                }
            })

            toast({
                variant: "success",
                message: localization.memberRemoved
            })

            await refetch?.()
            onOpenChange?.(false)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setIsRemoving(false)
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent
                className={classNames?.dialog?.content}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.removeMember}
                    </DialogTitle>

                    <DialogDescription
                        className={cn("text-xs md:text-sm", classNames?.description)}
                    >
                        {localization.removeMemberConfirmation}
                    </DialogDescription>
                </DialogHeader>

                <MemberCell
                    className={classNames?.cell}
                    member={member}
                    localization={localization}
                    hideActions
                />

                <DialogFooter className={classNames?.dialog?.footer}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange?.(false)}
                        className={cn(classNames?.button, classNames?.outlineButton)}
                        disabled={isRemoving}
                    >
                        {localization.cancel}
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={removeMember}
                        className={cn(classNames?.button, classNames?.destructiveButton)}
                        disabled={isRemoving}
                    >
                        {isRemoving && <Loader2 className="animate-spin" />}
                        {localization.removeMember}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
