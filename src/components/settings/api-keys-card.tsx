"use client"

import { useContext } from "react"
import { useForm } from "react-hook-form"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { CardContent } from "../ui/card"
import { Form } from "../ui/form"
import { APIKeyCell } from "./api-key-cell"
import { SettingsCard } from "./shared/settings-card"
import type { SettingsCardClassNames } from "./shared/settings-card"
import { SettingsCellSkeleton } from "./skeletons/settings-cell-skeleton"

export interface APIKeysCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    localization?: AuthLocalization
    apiKeys?: { id: string }[] | null
    skipHook?: boolean
    refetch?: () => Promise<void>
}

export function APIKeysCard({
    className,
    classNames,
    isPending,
    localization,
    apiKeys,
    skipHook,
    refetch
}: APIKeysCardProps) {
    const {
        authClient,
        hooks: { useListApiKeys, useSession },
        localization: authLocalization,
        toast
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    if (!skipHook) {
        const result = useListApiKeys()
        apiKeys = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    const addApiKey = async () => {
        try {
            await (authClient as AuthClient).apiKey.create({
                name: "test-key",
                fetchOptions: { throw: true }
            })
            await refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    const form = useForm()

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(addApiKey)}>
                    <SettingsCard
                        className={className}
                        classNames={classNames}
                        actionLabel={localization.create}
                        description={localization.apiKeysDescription}
                        instructions={localization.apiKeysInstructions}
                        isPending={isPending}
                        title={localization.apiKeys}
                    >
                        {(isPending || (apiKeys && apiKeys.length > 0)) && (
                            <CardContent className={cn("grid gap-4", classNames?.content)}>
                                {isPending ? (
                                    <SettingsCellSkeleton classNames={classNames} />
                                ) : (
                                    apiKeys?.map((apiKey) => (
                                        <APIKeyCell
                                            key={apiKey.id}
                                            classNames={classNames}
                                            localization={localization}
                                            apiKey={apiKey}
                                            refetch={refetch}
                                        />
                                    ))
                                )}
                            </CardContent>
                        )}
                    </SettingsCard>
                </form>
            </Form>
        </>
    )
}
