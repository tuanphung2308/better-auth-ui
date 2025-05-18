"use client"

import { KeyIcon } from "lucide-react"
import { useContext, useState } from "react"

import { useLang } from "../../../hooks/use-lang"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import type { ApiKey } from "../../../types/api-key"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { ApiKeyDeleteDialog } from "./api-key-delete-dialog"

export interface APIKeyCellProps {
    className?: string
    classNames?: SettingsCardClassNames
    apiKey: ApiKey
    localization?: Partial<AuthLocalization>
    refetch?: () => Promise<void>
}

export function APIKeyCell({
    className,
    classNames,
    apiKey,
    localization,
    refetch
}: APIKeyCellProps) {
    const { localization: contextLocalization } = useContext(AuthUIContext)
    localization = { ...contextLocalization, ...localization }

    const { lang } = useLang()

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Format expiration date or show "Never expires"
    const formatExpiration = () => {
        if (!apiKey.expiresAt) return localization.neverExpires

        const expiresDate = new Date(apiKey.expiresAt)
        return `${localization.expires} ${expiresDate.toLocaleDateString(lang ?? "en", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })}`
    }

    return (
        <>
            <Card
                className={cn("flex-row items-center gap-3 px-4 py-3", className, classNames?.cell)}
            >
                <KeyIcon className={cn("size-4", classNames?.icon)} />

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{apiKey.name}</span>

                        <span className="text-muted-foreground text-sm">
                            {apiKey.start}
                            {"******"}
                        </span>
                    </div>

                    <div className="text-muted-foreground text-xs">{formatExpiration()}</div>
                </div>

                <Button
                    className={cn(
                        "relative ms-auto",
                        classNames?.button,
                        classNames?.outlineButton
                    )}
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    {localization.delete}
                </Button>
            </Card>

            <ApiKeyDeleteDialog
                classNames={classNames}
                apiKey={apiKey}
                localization={localization}
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                refetch={refetch}
            />
        </>
    )
}
