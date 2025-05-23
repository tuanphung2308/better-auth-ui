"use client"

import type { Session, User } from "better-auth"
import { KeyRoundIcon, MenuIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react"
import { useContext } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { OrganizationSwitcher } from "../organization/organization-switcher"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { AccountsCard } from "./account/accounts-card"
import { UpdateAvatarCard } from "./account/update-avatar-card"
import { UpdateFieldCard } from "./account/update-field-card"
import { UpdateNameCard } from "./account/update-name-card"
import { UpdateUsernameCard } from "./account/update-username-card"
import { APIKeysCard } from "./api-key/api-keys-card"
import { SecuritySettingsCards } from "./security-settings-cards"
import { ChangeEmailCard } from "./security/change-email-card"
import type { SettingsCardClassNames } from "./shared/settings-card"

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
        buttonActive?: string
    }
}

export const settingsViews = ["settings", "security", "apiKeys"] as const
export type SettingsView = (typeof settingsViews)[number]

export interface SettingsCardsProps {
    className?: string
    classNames?: SettingsCardsClassNames
    localization?: AuthLocalization
    view?: SettingsView
}

export function SettingsCards({ className, classNames, localization, view }: SettingsCardsProps) {
    useAuthenticate()

    const {
        additionalFields,
        apiKey,
        avatar,
        basePath,
        changeEmail,
        hooks,
        localization: contextLocalization,
        multiSession,
        nameRequired,
        settingsFields,
        username,
        viewPaths,
        Link
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { useListDeviceSessions, useSession } = hooks
    const { data: sessionData, isPending: sessionPending } = useSession()

    let deviceSessions: { user: User; session: Session }[] | undefined | null = undefined
    let deviceSessionsPending: boolean | undefined = undefined
    let refetchDeviceSessions: (() => Promise<void>) | undefined = undefined

    if (multiSession) {
        const result = useListDeviceSessions()
        deviceSessions = result.data
        deviceSessionsPending = result.isPending
        refetchDeviceSessions = result.refetch
    }

    return (
        <div
            className={cn(
                "flex w-full grow flex-col gap-4 md:flex-row md:gap-8 xl:gap-12",
                className,
                classNames?.base
            )}
        >
            <OrganizationSwitcher variant="ghost" size="sm" className="md:hidden" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="lg"
                        className={cn(
                            "w-full justify-start md:hidden",
                            classNames?.dropdown?.trigger
                        )}
                        variant="secondary"
                    >
                        {view === "settings" && (
                            <>
                                <UserRoundIcon className={classNames?.icon} />
                                {localization.account}
                            </>
                        )}

                        {view === "security" && (
                            <>
                                <ShieldCheckIcon className={classNames?.icon} />
                                {localization.security}
                            </>
                        )}

                        {view === "apiKeys" && (
                            <>
                                <KeyRoundIcon className={classNames?.icon} />
                                {localization.apiKeys}
                            </>
                        )}

                        <MenuIcon className={cn("ml-auto", classNames?.dropdown?.menuIcon)} />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className={cn("w-[calc(100svw-1rem)]", classNames?.dropdown?.content)}
                >
                    <DropdownMenuItem>
                        <UserRoundIcon />
                        {localization.account}
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <ShieldCheckIcon />
                        {localization.security}
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <KeyRoundIcon />
                        {localization.apiKeys}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:block">
                <div className={cn("grid w-64 gap-1 xl:w-72", classNames?.sidebar?.base)}>
                    <OrganizationSwitcher variant="ghost" className="mb-3" />

                    <Link href={`${basePath}/${viewPaths.settings}`}>
                        <Button
                            size="lg"
                            className={cn(
                                "w-full justify-start",
                                classNames?.sidebar?.button,
                                view === "settings" && classNames?.sidebar?.buttonActive
                            )}
                            variant={view === "settings" ? "secondary" : "ghost"}
                        >
                            <UserRoundIcon className={classNames?.icon} />
                            {localization.account}
                        </Button>
                    </Link>

                    <Link href={`${basePath}/${viewPaths.security}`}>
                        <Button
                            size="lg"
                            className={cn(
                                "w-full justify-start",
                                classNames?.sidebar?.button,
                                view === "security" && classNames?.sidebar?.buttonActive
                            )}
                            variant={view === "security" ? "secondary" : "ghost"}
                        >
                            <ShieldCheckIcon className={classNames?.icon} />
                            {localization.security}
                        </Button>
                    </Link>

                    <Link href={`${basePath}/${viewPaths.apiKeys}`}>
                        <Button
                            size="lg"
                            className={cn(
                                "w-full justify-start",
                                classNames?.sidebar?.button,
                                view === "apiKeys" && classNames?.sidebar?.buttonActive
                            )}
                            variant={view === "apiKeys" ? "secondary" : "ghost"}
                        >
                            <KeyRoundIcon className={classNames?.icon} />
                            {localization.apiKeys}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className={cn("flex w-full flex-col gap-4 md:gap-6", classNames?.cards)}>
                {view === "settings" && (
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

                {view === "security" && (
                    <SecuritySettingsCards classNames={classNames} localization={localization} />
                )}

                {view === "apiKeys" && apiKey && (
                    <APIKeysCard classNames={classNames?.card} localization={localization} />
                )}
            </div>
        </div>
    )
}
