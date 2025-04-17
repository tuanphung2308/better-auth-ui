"use client"

import { Loader2 } from "lucide-react"
import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getErrorMessage } from "../../lib/get-error-message"
import { cn } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import type { AuthFormClassNames } from "./auth-form"

export interface BackupCodeFormProps {
    className?: string
    classNames?: AuthFormClassNames
    localization: Partial<AuthLocalization>
    onSuccess: () => Promise<void>
}

export function BackupCodeForm({
    className,
    classNames,
    localization,
    onSuccess
}: BackupCodeFormProps) {
    const [code, setCode] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { authClient, toast } = useContext(AuthUIContext)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setIsSubmitting(true)

            await (authClient as AuthClient).twoFactor.verifyBackupCode({
                code,
                fetchOptions: { throw: true }
            })

            await onSuccess()

            setTimeout(() => {
                setIsSubmitting(false)
            }, 5000)
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })

            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleVerify}
            className={cn("grid w-full gap-6", className, classNames?.base)}
        >
            <div className="space-y-2">
                <Label htmlFor="backupCode">{localization.backupCode}</Label>

                <Input
                    id="backupCode"
                    name="backupCode"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={localization.backupCodePlaceholder}
                    autoComplete="one-time-code"
                />
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {localization.recoverAction}
            </Button>
        </form>
    )
}
