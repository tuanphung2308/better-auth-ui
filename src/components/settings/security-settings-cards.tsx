"use client"

import { useContext } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { DeleteAccountCard } from "./account/delete-account-card"
import { PasskeysCard } from "./passkey/passkeys-card"
import { ProvidersCard } from "./providers/providers-card"
import { ChangePasswordCard } from "./security/change-password-card"
import { SessionsCard } from "./security/sessions-card"
import type { SettingsCardsProps } from "./settings-cards"
import { TwoFactorCard } from "./two-factor/two-factor-card"

export function SecuritySettingsCards({ className, classNames, localization }: SettingsCardsProps) {
    const {
        credentials,
        deleteUser,
        hooks,
        localization: contextLocalization,
        otherProviders,
        passkey,
        providers,
        twoFactor
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { useListAccounts, useListPasskeys, useListSessions, useSession } = hooks
    const { isPending: sessionPending } = useSession()

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

    const isPending = accountsPending || sessionsPending || passkeysPending || sessionPending

    return (
        <div className={cn("flex w-full flex-col gap-4 md:gap-6", className, classNames?.cards)}>
            {credentials && (
                <ChangePasswordCard
                    accounts={accounts}
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                    skipHook
                />
            )}

            {(providers?.length || otherProviders?.length) && (
                <ProvidersCard
                    accounts={accounts}
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                    refetch={refetchAccounts}
                    skipHook
                />
            )}

            {twoFactor && credentialsLinked && (
                <TwoFactorCard classNames={classNames?.card} localization={localization} />
            )}

            {passkey && (
                <PasskeysCard
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                    passkeys={passkeys}
                    refetch={refetchPasskeys}
                    skipHook
                />
            )}

            <SessionsCard
                classNames={classNames?.card}
                isPending={isPending}
                localization={localization}
                sessions={sessions}
                refetch={refetchSessions}
                skipHook
            />

            {deleteUser && (
                <DeleteAccountCard
                    accounts={accounts}
                    classNames={classNames?.card}
                    isPending={isPending}
                    localization={localization}
                    skipHook
                />
            )}
        </div>
    )
}
