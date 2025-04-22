"use client"

import { FingerprintIcon, Loader2 } from "lucide-react"
import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import type { SettingsCardClassNames } from "./shared/settings-card"

export interface PasskeyCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
    passkey: { id: string; createdAt: Date }
    refetch?: () => Promise<void>
}

export function PasskeyCell({
    className,
    classNames,
    localization,
    passkey,
    refetch
}: PasskeyCellProps) {
    const {
        localization: contextLocalization,
        mutators: { deletePasskey },
        toast
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const [isLoading, setIsLoading] = useState(false)

    const handleDeletePasskey = async () => {
        setIsLoading(true)

        try {
            await deletePasskey({ id: passkey.id })
            refetch?.()
        } catch (error) {
            setIsLoading(false)

            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    return (
        <Card className={cn("flex-row items-center p-4", className, classNames?.cell)}>
            <div className="flex items-center gap-3">
                <FingerprintIcon className={cn("size-4", classNames?.icon)} />
                <span className="text-sm">{passkey.createdAt.toLocaleString()}</span>
            </div>

            <Button
                className={cn("relative ms-auto", classNames?.button, classNames?.outlineButton)}
                disabled={isLoading}
                size="sm"
                variant="outline"
                onClick={handleDeletePasskey}
            >
                {isLoading && <Loader2 className="animate-spin" />}

                {localization.delete}
            </Button>
        </Card>
    )
}
