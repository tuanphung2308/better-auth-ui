"use client"

import { useContext } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"

import { KeyIcon, UserIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
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
    tabs?: {
        base?: string
        list?: string
        trigger?: string
        content?: string
    }
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
        avatar,
        credentials,
        deleteUser,
        hooks,
        localization: authLocalization,
        nameRequired,
        passkey,
        providers,
        settingsFields,
        username
    } = useContext(AuthUIContext)
    localization = { ...authLocalization, ...localization }
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
            <Tabs
                defaultValue="account"
                className={cn("flex flex-col w-full gap-4", classNames?.tabs?.base)}
            >
                <TabsList className={cn("grid w-full grid-cols-2", classNames?.tabs?.list)}>
                    <TabsTrigger value="account" className={classNames?.tabs?.trigger}>
                        <UserIcon />
                        {localization.account}
                    </TabsTrigger>

                    <TabsTrigger value="security" className={classNames?.tabs?.trigger}>
                        <KeyIcon />
                        {localization.security}
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="account"
                    className={cn("flex flex-col gap-4", classNames?.tabs?.content)}
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

                        const {
                            label,
                            description,
                            instructions,
                            placeholder,
                            required,
                            type,
                            validate
                        } = additionalField

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
                </TabsContent>

                <TabsContent
                    value="security"
                    className={cn("flex flex-col gap-4", classNames?.tabs?.content)}
                >
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
                </TabsContent>
            </Tabs>
        </div>
    )
}
