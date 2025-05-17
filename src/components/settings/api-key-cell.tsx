"use client"

import { KeyIcon, Loader2 } from "lucide-react"
import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import type { SettingsCardClassNames } from "./shared/settings-card"

export interface APIKeyCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
    apiKey: { id: string }
    refetch?: () => Promise<void>
}

export function APIKeyCell({
    className,
    classNames,
    localization,
    apiKey,
    refetch
}: APIKeyCellProps) {
    const {
        localization: contextLocalization,
        mutators: { deleteApiKey },
        toast
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const [isLoading, setIsLoading] = useState(false)

    const handleDeleteApiKey = async () => {
        setIsLoading(true)

        try {
            await deleteApiKey({ keyId: apiKey.id })
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
        <>
            <Card className={cn("flex-row items-center p-4", className, classNames?.cell)}>
                <div className="flex items-center gap-3">
                    <KeyIcon className={cn("size-4", classNames?.icon)} />
                    <span className="text-sm">{apiKey.id}</span>
                </div>

                <Button
                    className={cn(
                        "relative ms-auto",
                        classNames?.button,
                        classNames?.outlineButton
                    )}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteApiKey}
                >
                    {isLoading && <Loader2 className="animate-spin" />}

                    {localization.revoke}
                </Button>
            </Card>
        </>
    )
}
