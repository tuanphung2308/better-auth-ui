"use client"

import { useContext } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"

import { ChangeEmailCard } from "./change-email-card"
import { ChangePasswordCard } from "./change-password-card"
import { DeleteAccountCard } from "./delete-account-card"
import { PasskeysCard } from "./passkeys-card"
import { ProvidersCard } from "./providers-card"
import { SessionsCard } from "./sessions-card"
import type { SettingsCardClassNames } from "./settings-card"
import { UpdateAvatarCard } from "./update-avatar-card"
import { UpdateFieldCard } from "./update-field-card"
import { UpdateNameCard } from "./update-name-card"
import { UpdateUsernameCard } from "./update-username-card"

export type SettingsCardsClassNames = {
    base?: string
    card?: SettingsCardClassNames
}

export interface SettingsCardsProps {
    className?: string
    classNames?: SettingsCardsClassNames
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
}

export function SettingsCards({ className, classNames, localization }: SettingsCardsProps) {
    const {
        additionalFields,
        authClient,
        avatar,
        credentials,
        deleteUser,
        hooks,
        nameRequired,
        passkey,
        providers,
        settingsFields,
        username
    } = useContext(AuthUIContext)
    const { useListAccounts, useSession } = hooks
    useAuthenticate()
    const { data: sessionData, isPending: sessionPending } = useSession()
    const { data: accounts, isPending: accountsPending, refetch } = useListAccounts()

    const isPending = sessionPending || accountsPending

    return (
        <div
            className={cn(
                "w-full max-w-xl flex flex-col gap-4 items-center",
                className,
                classNames?.base
            )}
        >
            {avatar && (
                <UpdateAvatarCard
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            {username && (
                <UpdateUsernameCard
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            {(settingsFields?.includes("name") || nameRequired) && (
                <UpdateNameCard
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            <ChangeEmailCard
                classNames={classNames?.card}
                isPending={isPending}
                localization={localization}
            />

            {settingsFields?.map((field) => {
                const additionalField = additionalFields?.[field]
                if (!additionalField) return null

                const { label, description, instructions, placeholder, required, type, validate } =
                    additionalField

                // @ts-expect-error Custom fields are not typed
                const defaultValue = sessionData?.user[field] as unknown

                return (
                    <UpdateFieldCard
                        key={field}
                        classNames={classNames?.card}
                        defaultValue={defaultValue}
                        description={description}
                        field={field}
                        instructions={instructions}
                        isPending={isPending}
                        label={label}
                        localization={localization}
                        placeholder={placeholder}
                        required={required}
                        type={type}
                        validate={validate}
                    />
                )
            })}

            {credentials && (
                <ChangePasswordCard
                    accounts={accounts}
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            {providers?.length && (
                <ProvidersCard
                    accounts={accounts}
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                    refetch={refetch}
                />
            )}

            {passkey && (
                <PasskeysCard
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            <SessionsCard
                classNames={classNames?.card}
                isPending={isPending}
                localization={localization}
            />

            {deleteUser && (
                <DeleteAccountCard
                    accounts={accounts}
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                />
            )}
        </div>
    )
}
