"use client"

import { Loader2 } from "lucide-react"
import { useContext, useState } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { getErrorMessage } from "../../../lib/get-error-message"
import type { AuthClient } from "../../../types/auth-client"
import { PasswordInput } from "../../password-input"
import { Button } from "../../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../ui/dialog"
import { Label } from "../../ui/label"
import { BackupCodesDialog } from "./backup-codes-dialog"

interface TwoFactorPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    isTwoFactorEnabled: boolean
}

export function TwoFactorPasswordDialog({
    open,
    onOpenChange,
    isTwoFactorEnabled
}: TwoFactorPasswordDialogProps) {
    const { localization, authClient, basePath, viewPaths, navigate, toast, twoFactor } =
        useContext(AuthUIContext)
    const [isLoading, setIsLoading] = useState(false)
    const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false)
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [totpURI, setTotpURI] = useState<string | null>(null)

    async function handleEnableTwoFactor(formData: FormData) {
        const password = formData.get("password") as string

        setIsLoading(true)

        try {
            const data = await (authClient as AuthClient).twoFactor.enable({
                password,
                fetchOptions: { throw: true }
            })

            onOpenChange(false)
            setBackupCodes(data.backupCodes)

            if (twoFactor?.includes("totp")) {
                setTotpURI(data.totpURI)
            }

            setTimeout(() => {
                setShowBackupCodesDialog(true)
            }, 250)
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        }

        setIsLoading(false)
    }

    async function handleDisableTwoFactor(formData: FormData) {
        const password = formData.get("password") as string

        setIsLoading(true)

        try {
            await (authClient as AuthClient).twoFactor.disable({
                password,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.twoFactorDisabled
            })

            onOpenChange(false)
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        }

        setIsLoading(false)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        if (isTwoFactorEnabled) {
            handleDisableTwoFactor(formData)
        } else {
            handleEnableTwoFactor(formData)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{localization.twoFactor}</DialogTitle>
                        <DialogDescription>
                            {isTwoFactorEnabled
                                ? localization.twoFactorDisableInstructions
                                : localization.twoFactorEnableInstructions}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{localization.password}</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder={localization.passwordPlaceholder}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                {localization.cancel}
                            </Button>

                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="animate-spin" />}
                                {isTwoFactorEnabled ? localization.disable : localization.enable}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <BackupCodesDialog
                open={showBackupCodesDialog}
                onOpenChange={(open) => {
                    setShowBackupCodesDialog(open)

                    if (!open) {
                        const url = `${basePath}/${viewPaths.twoFactor}`
                        navigate(
                            twoFactor?.includes("totp") && totpURI
                                ? `${url}?totpURI=${totpURI}`
                                : url
                        )
                    }
                }}
                backupCodes={backupCodes}
            />
        </>
    )
}
