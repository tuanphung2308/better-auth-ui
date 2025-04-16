"use client"

import { useContext } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
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
    const { localization } = useContext(AuthUIContext)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form action="/api/two-factor">
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{localization.confirmPassword}</DialogTitle>
                        <DialogDescription>{localization.twoFactorInstructions}</DialogDescription>
                    </DialogHeader>

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

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                        >
                            {localization.cancel}
                        </Button>

                        <Button
                            type="submit"
                            variant={isTwoFactorEnabled ? "destructive" : "default"}
                        >
                            {isTwoFactorEnabled ? localization.disable : localization.enable}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
