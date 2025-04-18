"use client"

import { useContext, useState } from "react"

import { useForm } from "react-hook-form"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { Form } from "../ui/form"
import { DeleteAccountDialog } from "./delete-account-dialog"
import { NewSettingsCard } from "./shared/new-settings-card"
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

    const form = useForm()

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(() => setShowDialog(true))}>
                    <NewSettingsCard
                        title={localization?.deleteAccount}
                        description={localization?.deleteAccountDescription}
                        actionLabel={localization?.deleteAccount}
                        className={className}
                        classNames={classNames}
                        variant="destructive"
                        isPending={isPending}
                    />
                </form>
            </Form>

            <DeleteAccountDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                localization={localization}
                classNames={classNames}
                accounts={accounts}
            />
        </>
    )
}
