"use client"

import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext, useState } from "react"

import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { ApiKey } from "../../../types/api-key"
import type { Refetch } from "../../../types/refetch"
import { Button } from "../../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../ui/dialog"
import type { SettingsCardClassNames } from "../shared/settings-card"

interface ApiKeyDeleteDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    apiKey: ApiKey
    localization?: AuthLocalization
    refetch?: Refetch
}

export function ApiKeyDeleteDialog({
    classNames,
    apiKey,
    localization,
    refetch,
    onOpenChange,
    ...props
}: ApiKeyDeleteDialogProps) {
    const {
        localization: contextLocalization,
        mutators: { deleteApiKey },
        toast
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)

        try {
            await deleteApiKey({ keyId: apiKey.id })
            await refetch?.()
            onOpenChange?.(false)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setIsLoading(false)
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={classNames?.dialog?.content}
            >
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.delete} {localization.apiKey}
                    </DialogTitle>

                    <DialogDescription
                        className={cn("text-xs md:text-sm", classNames?.description)}
                    >
                        {localization.deleteApiKeyConfirmation}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className={classNames?.dialog?.footer}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange?.(false)}
                        disabled={isLoading}
                        className={cn(classNames?.button, classNames?.outlineButton)}
                    >
                        {localization.cancel}
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className={cn(classNames?.button, classNames?.destructiveButton)}
                    >
                        {isLoading && <Loader2 className="animate-spin" />}
                        {localization.delete}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
