"use client"

import { useContext, useState } from "react"

import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import type { ApiKey } from "../../../types/api-key"
import { CardContent } from "../../ui/card"
import { SettingsCard } from "../shared/settings-card"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { APIKeyCell } from "./api-key-cell"
import { APIKeyDisplayDialog } from "./api-key-display-dialog"
import { CreateAPIKeyDialog } from "./create-api-key-dialog"

export interface APIKeysCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    apiKeys?: ApiKey[] | null
    isPending?: boolean
    localization?: AuthLocalization
    skipHook?: boolean
    refetch?: () => Promise<void>
}

export function APIKeysCard({
    className,
    classNames,
    apiKeys,
    isPending,
    localization,
    skipHook,
    refetch
}: APIKeysCardProps) {
    const {
        hooks: { useListApiKeys },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    if (!skipHook) {
        const result = useListApiKeys()
        apiKeys = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [displayDialogOpen, setDisplayDialogOpen] = useState(false)
    const [createdApiKey, setCreatedApiKey] = useState("")

    const handleCreateApiKey = (apiKey: string) => {
        setCreatedApiKey(apiKey)
        setDisplayDialogOpen(true)
    }

    return (
        <>
            <SettingsCard
                className={className}
                classNames={classNames}
                actionLabel={localization.createApiKey}
                description={localization.apiKeysDescription}
                instructions={localization.apiKeysInstructions}
                isPending={isPending}
                title={localization.apiKeys}
                action={() => setCreateDialogOpen(true)}
            >
                {apiKeys && apiKeys.length > 0 && (
                    <CardContent className={cn("grid gap-4", classNames?.content)}>
                        {apiKeys?.map((apiKey) => (
                            <APIKeyCell
                                key={apiKey.id}
                                classNames={classNames}
                                apiKey={apiKey}
                                localization={localization}
                                refetch={refetch}
                            />
                        ))}
                    </CardContent>
                )}
            </SettingsCard>

            <CreateAPIKeyDialog
                classNames={classNames}
                localization={localization}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleCreateApiKey}
                refetch={refetch}
            />

            <APIKeyDisplayDialog
                classNames={classNames}
                apiKey={createdApiKey}
                localization={localization}
                open={displayDialogOpen}
                onOpenChange={setDisplayDialogOpen}
            />
        </>
    )
}
