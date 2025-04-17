"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useContext, useState } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { Button } from "../../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../ui/dialog"

interface BackupCodesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    backupCodes: string[]
}

export function BackupCodesDialog({ open, onOpenChange, backupCodes }: BackupCodesDialogProps) {
    const { localization } = useContext(AuthUIContext)
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        const codeText = backupCodes.join("\n")
        navigator.clipboard.writeText(codeText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{localization.backupCodes}</DialogTitle>
                    <DialogDescription>{localization.backupCodesDescription}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                        <div
                            key={index}
                            className="rounded-md bg-muted p-2 text-center font-mono text-sm"
                        >
                            {code}
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCopy} disabled={copied}>
                        {copied ? (
                            <>
                                <CheckIcon />
                                {localization.copiedToClipboard}
                            </>
                        ) : (
                            <>
                                <CopyIcon />
                                {localization.copyAllCodes}
                            </>
                        )}
                    </Button>

                    <Button type="button" variant="default" onClick={() => onOpenChange(false)}>
                        {localization.continue}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
