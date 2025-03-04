"use client"

import { useContext } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"

import { ChangeEmailCard } from "./change-email-card"
import { ChangePasswordCard } from "./change-password-card"
import { DeleteAccountCard } from "./delete-account-card"
import { ProvidersCard } from "./providers-card"
import { SessionsCard } from "./sessions-card"
import type { SettingsCardClassNames } from "./settings-card"
import { UpdateAvatarCard } from "./update-avatar-card"
import { UpdateFieldCard } from "./update-field-card"
import { UpdateNameCard } from "./update-name-card"
import { UpdateUsernameCard } from "./update-username-card"

export function SettingsCards({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    localization?: Partial<AuthLocalization>
}) {
    const {
        additionalFields,
        authClient,
        avatar,
        credentials,
        deleteUser,
        hooks: { useSession, useListAccounts },
        username
    } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = useAuthenticate()
    const { accounts, isPending: accountsPending, refetch } = useListAccounts()

    const isPending = sessionPending || accountsPending

    return (
        <div className={cn("w-full max-w-xl flex flex-col gap-4 items-center", className)}>
            {avatar && (
                <UpdateAvatarCard
                    classNames={classNames}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            {username && (
                <UpdateUsernameCard
                    classNames={classNames}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            <UpdateNameCard
                classNames={classNames}
                isPending={isPending}
                localization={localization}
            />

            <ChangeEmailCard
                classNames={classNames}
                isPending={isPending}
                localization={localization}
            />

            {Object.entries(additionalFields || {}).map(([key, { description, instructions, label, placeholder, type, required }]) => {
                // @ts-expect-error Custom fields are not typed
                const defaultValue = sessionData?.user[key] as string

                return (
                    <UpdateFieldCard
                        key={key}
                        classNames={classNames}
                        defaultValue={defaultValue}
                        description={description}
                        instructions={instructions}
                        isPending={isPending}
                        localization={localization}
                        name={key}
                        placeholder={placeholder || label}
                        required={required}
                        title={label}
                        type={type}
                    />
                )
            })}

            {credentials && (
                <ChangePasswordCard
                    accounts={accounts}
                    className={className}
                    classNames={classNames}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            <ProvidersCard
                accounts={accounts}
                classNames={classNames}
                isPending={isPending}
                localization={localization}
                refetch={refetch}
                unlinkAccount={(providerId: string) => authClient.unlinkAccount({ providerId })}
            />

            <SessionsCard
                classNames={classNames}
                isPending={isPending}
                localization={localization}
            />

            {deleteUser && (
                <DeleteAccountCard
                    accounts={accounts}
                    classNames={classNames}
                    isPending={isPending}
                    localization={localization}
                />
            )}
        </div>
    )
}