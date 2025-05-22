"use client"

import type { Session, User } from "better-auth"
import { KeyIcon, LockIcon, MenuIcon, UserIcon } from "lucide-react"
import { useContext, useState } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { ApiKey } from "../../types/api-key"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { AccountsCard } from "./accounts-card"
import { APIKeysCard } from "./api-key/api-keys-card"
import { ChangeEmailCard } from "./change-email-card"
import { ChangePasswordCard } from "./change-password-card"
import { DeleteAccountCard } from "./delete-account-card"
import { PasskeysCard } from "./passkeys-card"
import { ProvidersCard } from "./providers-card"
import { SessionsCard } from "./sessions-card"
import type { SettingsCardClassNames } from "./shared/settings-card"
import { UpdateFieldCard } from "./shared/update-field-card"
import { TwoFactorCard } from "./two-factor/two-factor-card"
import { UpdateAvatarCard } from "./update-avatar-card"
import { UpdateNameCard } from "./update-name-card"
import { UpdateUsernameCard } from "./update-username-card"

export type SettingsCardsClassNames = {
    base?: string
    card?: SettingsCardClassNames
    cards?: string
    icon?: string
    dropdown?: {
        base?: string
        trigger?: string
        content?: string
        menuIcon?: string
    }
    sidebar?: {
        base?: string
        button?: string
    }
}

export interface SettingsCardsProps {
    className?: string
    classNames?: SettingsCardsClassNames
    localization?: AuthLocalization
}

export function SettingsCards({ className, classNames, localization }: SettingsCardsProps) {
    useAuthenticate()
    const [tab, setTab] = useState<"account" | "security" | "api-keys">("account")

    const {
        additionalFields,
        apiKeys: contextApiKeys,
        avatar,
        credentials,
        changeEmail,
        deleteUser,
        hooks,
        localization: contextLocalization,
        multiSession,
        nameRequired,
        otherProviders,
        passkey,
        providers,
        settingsFields,
        username,
        twoFactor
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const {
        useListAccounts,
        useListDeviceSessions,
        useListPasskeys,
        useListSessions,
        useListApiKeys,
        useSession
    } = hooks
    const { data: sessionData, isPending: sessionPending } = useSession()

    const {
        data: accounts,
        isPending: accountsPending,
        refetch: refetchAccounts
    } = useListAccounts()

    const credentialsLinked = accounts?.some((acc) => acc.provider === "credential")

    const {
        data: sessions,
        isPending: sessionsPending,
        refetch: refetchSessions
    } = useListSessions()

    let passkeys: { id: string; createdAt: Date }[] | undefined | null = undefined
    let passkeysPending: boolean | undefined = undefined
    let refetchPasskeys: (() => Promise<void>) | undefined = undefined

    if (passkey) {
        const result = useListPasskeys()
        passkeys = result.data
        passkeysPending = result.isPending
        refetchPasskeys = result.refetch
    }

    let deviceSessions: { user: User; session: Session }[] | undefined | null = undefined
    let deviceSessionsPending: boolean | undefined = undefined
    let refetchDeviceSessions: (() => Promise<void>) | undefined = undefined

    if (multiSession) {
        const result = useListDeviceSessions()
        deviceSessions = result.data
        deviceSessionsPending = result.isPending
        refetchDeviceSessions = result.refetch
    }

    let apiKeys: ApiKey[] | undefined | null = undefined
    let apiKeysPending: boolean | undefined = undefined
    let refetchApiKeys: (() => Promise<void>) | undefined = undefined

    if (contextApiKeys) {
        const result = useListApiKeys()
        apiKeys = result.data
        apiKeysPending = result.isPending
        refetchApiKeys = result.refetch
    }

    return (
        <div
            className={cn(
                "flex w-full grow flex-col gap-4 md:flex-row md:gap-12",
                className,
                classNames?.base
            )}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="lg"
                        className={cn(
                            "w-full justify-start md:hidden",
                            classNames?.dropdown?.trigger
                        )}
                    >
                        {tab === "account" && (
                            <>
                                <UserIcon className={classNames?.icon} />
                                {localization.account}
                            </>
                        )}

                        {tab === "security" && (
                            <>
                                <LockIcon className={classNames?.icon} />
                                {localization.security}
                            </>
                        )}

                        {tab === "api-keys" && (
                            <>
                                <KeyIcon className={classNames?.icon} />
                                {localization.apiKeys}
                            </>
                        )}

                        <MenuIcon className={cn("ml-auto", classNames?.dropdown?.menuIcon)} />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className={cn("w-[calc(100svw-1rem)]", classNames?.dropdown?.content)}
                >
                    <DropdownMenuItem onClick={() => setTab("account")}>
                        <UserIcon />
                        {localization.account}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setTab("security")}>
                        <LockIcon />
                        {localization.security}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setTab("api-keys")}>
                        <KeyIcon />
                        {localization.apiKeys}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:block">
                <div className={cn("grid w-64 gap-1 xl:w-72", classNames?.sidebar?.base)}>
                    <Button
                        size="lg"
                        className={cn("w-full justify-start", classNames?.sidebar?.button)}
                        variant={tab === "account" ? "default" : "ghost"}
                        onClick={() => setTab("account")}
                    >
                        <UserIcon className={classNames?.icon} />
                        {localization.account}
                    </Button>

                    <Button
                        size="lg"
                        className={cn("w-full justify-start", classNames?.sidebar?.button)}
                        variant={tab === "security" ? "default" : "ghost"}
                        onClick={() => setTab("security")}
                    >
                        <LockIcon className={classNames?.icon} />
                        {localization.security}
                    </Button>

                    <Button
                        size="lg"
                        className={cn("w-full justify-start", classNames?.sidebar?.button)}
                        variant={tab === "api-keys" ? "default" : "ghost"}
                        onClick={() => setTab("api-keys")}
                    >
                        <KeyIcon className={classNames?.icon} />
                        {localization.apiKeys}
                    </Button>
                </div>
            </div>

            <div className={cn("flex w-full flex-col gap-4 md:gap-6", classNames?.cards)}>
                {tab === "account" && (
                    <>
                        {avatar && (
                            <UpdateAvatarCard
                                classNames={classNames?.card}
                                isPending={sessionPending}
                                localization={localization}
                            />
                        )}

                        {username && (
                            <UpdateUsernameCard
                                classNames={classNames?.card}
                                isPending={sessionPending}
                                localization={localization}
                            />
                        )}

                        {(settingsFields?.includes("name") || nameRequired) && (
                            <UpdateNameCard
                                classNames={classNames?.card}
                                isPending={sessionPending}
                                localization={localization}
                            />
                        )}

                        {changeEmail && (
                            <ChangeEmailCard
                                classNames={classNames?.card}
                                isPending={sessionPending}
                                localization={localization}
                            />
                        )}

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

                            // @ts-ignore Custom fields are not typed
                            const defaultValue = sessionData?.user[field] as unknown

                            return (
                                <UpdateFieldCard
                                    key={field}
                                    classNames={classNames?.card}
                                    value={defaultValue}
                                    description={description}
                                    name={field}
                                    instructions={instructions}
                                    isPending={sessionPending}
                                    label={label}
                                    localization={localization}
                                    placeholder={placeholder}
                                    required={required}
                                    type={type}
                                    validate={validate}
                                />
                            )
                        })}

                        {multiSession && (
                            <AccountsCard
                                classNames={classNames?.card}
                                deviceSessions={deviceSessions}
                                isPending={deviceSessionsPending}
                                localization={localization}
                                refetch={refetchDeviceSessions}
                                skipHook
                            />
                        )}
                    </>
                )}

                {tab === "security" && (
                    <>
                        {credentials && (
                            <ChangePasswordCard
                                accounts={accounts}
                                classNames={classNames?.card}
                                isPending={sessionPending}
                                localization={localization}
                                skipHook
                            />
                        )}

                        {(providers?.length || otherProviders?.length) && (
                            <ProvidersCard
                                accounts={accounts}
                                classNames={classNames?.card}
                                isPending={accountsPending}
                                localization={localization}
                                refetch={refetchAccounts}
                                skipHook
                            />
                        )}

                        {twoFactor && credentialsLinked && (
                            <TwoFactorCard
                                classNames={classNames?.card}
                                localization={localization}
                            />
                        )}

                        {passkey && (
                            <PasskeysCard
                                classNames={classNames?.card}
                                isPending={passkeysPending}
                                localization={localization}
                                passkeys={passkeys}
                                refetch={refetchPasskeys}
                                skipHook
                            />
                        )}

                        <SessionsCard
                            classNames={classNames?.card}
                            isPending={sessionsPending}
                            localization={localization}
                            sessions={sessions}
                            refetch={refetchSessions}
                            skipHook
                        />

                        {deleteUser && (
                            <DeleteAccountCard
                                accounts={accounts}
                                classNames={classNames?.card}
                                isPending={sessionPending}
                                localization={localization}
                                skipHook
                            />
                        )}
                    </>
                )}

                {tab === "api-keys" && contextApiKeys && (
                    <APIKeysCard
                        classNames={classNames?.card}
                        isPending={apiKeysPending}
                        localization={localization}
                        apiKeys={apiKeys}
                        refetch={refetchApiKeys}
                        skipHook
                    />
                )}
            </div>
        </div>
    )
}
