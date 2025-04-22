"use client"

import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { DeleteAccountDialog } from "./delete-account-dialog"
import { SettingsCard } from "./shared/settings-card"
import type { SettingsCardClassNames } from "./shared/settings-card"

export interface DeleteAccountCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    accounts?: { provider: string }[] | null
    isPending?: boolean
    localization?: AuthLocalization
    skipHook?: boolean
}

export function DeleteAccountCard({
    className,
    classNames,
    accounts,
    isPending,
    localization,
    skipHook
}: DeleteAccountCardProps) {
    const {
        hooks: { useListAccounts },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const [showDialog, setShowDialog] = useState(false)

    if (!skipHook) {
        const result = useListAccounts()
        accounts = result.data
        isPending = result.isPending
    }

    return (
        <div>
            <SettingsCard
                className={className}
                classNames={classNames}
                actionLabel={localization?.deleteAccount}
                description={localization?.deleteAccountDescription}
                isPending={isPending}
                title={localization?.deleteAccount}
                variant="destructive"
                action={() => setShowDialog(true)}
            />

            <DeleteAccountDialog
                classNames={classNames}
                accounts={accounts}
                localization={localization}
                open={showDialog}
                onOpenChange={setShowDialog}
            />
        </div>
    )
}
