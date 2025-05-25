"use client"
import {
    Building2Icon,
    KeyRoundIcon,
    MenuIcon,
    ShieldCheckIcon,
    UserCircle2Icon,
    UserRoundIcon
} from "lucide-react"
import { useContext } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { OrganizationsCard } from "../organization/organizations-card"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { AccountSettingsCards } from "./account-settings-cards"
import { APIKeysCard } from "./api-key/api-keys-card"
import { SecuritySettingsCards } from "./security-settings-cards"
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

export const settingsViews = ["settings", "security", "apiKeys", "organizations"] as const
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
        apiKey,
        basePath,
        localization: contextLocalization,
        organization,
        viewPaths,
        Link
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

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
                        variant="secondary"
                    >
                        {view === "settings" && (
                            <>
                                <UserCircle2Icon className={classNames?.icon} />
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
                <div className={cn("grid w-60 gap-1", classNames?.sidebar?.base)}>
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
                            <UserCircle2Icon className={classNames?.icon} />
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

                    <Link href={`${basePath}/${viewPaths.organizations}`}>
                        <Button
                            size="lg"
                            className={cn(
                                "w-full justify-start",
                                classNames?.sidebar?.button,
                                view === "organizations" && classNames?.sidebar?.buttonActive
                            )}
                            variant={view === "organizations" ? "secondary" : "ghost"}
                        >
                            <Building2Icon className={classNames?.icon} />
                            {localization.organizations}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className={cn("flex w-full flex-col gap-4 md:gap-6", classNames?.cards)}>
                {view === "settings" && (
                    <AccountSettingsCards
                        classNames={classNames?.card}
                        localization={localization}
                    />
                )}

                {view === "security" && (
                    <SecuritySettingsCards classNames={classNames} localization={localization} />
                )}

                {view === "apiKeys" && apiKey && (
                    <APIKeysCard classNames={classNames?.card} localization={localization} />
                )}

                {view === "organizations" && organization && (
                    <OrganizationsCard classNames={classNames?.card} localization={localization} />
                )}
            </div>
        </div>
    )
}
