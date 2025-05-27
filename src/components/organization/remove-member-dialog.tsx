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
import { UserAvatar } from "../user-avatar"

export interface RemoveMemberDialogProps extends ComponentProps<typeof Dialog> {
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

export function RemoveMemberDialog({
    member,
    classNames,
    localization: localizationProp,
    onOpenChange,
    ...props
}: RemoveMemberDialogProps) {
    const { authClient, localization: contextLocalization, toast } = useContext(AuthUIContext)
    const { refetch } = authClient.useActiveOrganization()
    const localization = { ...contextLocalization, ...localizationProp }

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
                                {member.role}
                            </span>
                        </div>
                    </div>
                </Card>

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
