"use client"

import { AlertCircle, Info } from "lucide-react"
import { useState } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { cn } from "../../lib/utils"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { TwoFactorInput } from "./two-factor-input"

export interface TwoFactorRecoveryProps {
    error?: string
    isSubmitting?: boolean
    onSubmit: (code: string, trustDevice: boolean) => void
    localization?: Partial<AuthLocalization>
    className?: string
    onBackToPrompt?: () => void
}

export const TwoFactorRecovery = ({
    error,
    isSubmitting,
    onSubmit,
    localization,
    className
}: TwoFactorRecoveryProps) => {
    const [code, setCode] = useState("")
    const [trustDevice, setTrustDevice] = useState(false)

    const handleCodeChange = (newCode: string) => {
        setCode(newCode)
        if (newCode.length === 11) {
            // Format standard pour les codes de secours: xxxxx-xxxxx
            onSubmit(newCode, trustDevice)
        }
    }

    return (
        <div className={cn("space-y-6", className)}>
            <div className="space-y-2">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{localization?.enterBackupCode}</AlertTitle>
                    <AlertDescription>{localization?.backupCodePlaceholder}</AlertDescription>
                </Alert>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <TwoFactorInput
                            value={code}
                            onChange={handleCodeChange}
                            maxLength={11}
                            isBackupCode={true}
                        />
                    </div>

                    <div className="flex flex-row items-center gap-2">
                        <Checkbox
                            id="trust-device"
                            checked={trustDevice}
                            onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
                            disabled={isSubmitting}
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Label
                                        htmlFor="trust-device"
                                        className="cursor-help text-muted-foreground text-sm"
                                    >
                                        {localization?.rememberDevice}
                                    </Label>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {localization?.rememberDeviceDescription}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </div>
    )
}
