"use client"

import {
    Building2Icon,
    KeyRoundIcon,
    type LucideIcon,
    MenuIcon,
    ShieldCheckIcon,
    UserCircle2Icon
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

interface NavigationItem {
    view: SettingsView
    icon: LucideIcon
    label?: string
}

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

    const navigationItems: NavigationItem[] = [
        {
            view: "settings",
            icon: UserCircle2Icon,
            label: localization.account
        },
        {
            view: "security",
            icon: ShieldCheckIcon,
            label: localization.security
        }
    ]

    if (apiKey) {
        navigationItems.push({
            view: "apiKeys",
            icon: KeyRoundIcon,
            label: localization.apiKeys
        })
    }

    if (organization) {
        navigationItems.push({
            view: "organizations",
            icon: Building2Icon,
            label: localization.organizations
        })
    }

    const currentItem = navigationItems.find((item) => item.view === view)

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
                        {currentItem && (
                            <>
                                <currentItem.icon className={classNames?.icon} />
                                {currentItem.label}
                            </>
                        )}

                        <MenuIcon className={cn("ml-auto", classNames?.dropdown?.menuIcon)} />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className={cn("w-[calc(100svw-2rem)]", classNames?.dropdown?.content)}
                >
                    {navigationItems.map((item) => (
                        <DropdownMenuItem key={item.view} asChild>
                            <Link href={`${basePath}/${viewPaths[item.view]}`}>
                                <item.icon />
                                {item.label}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:block">
                <div className={cn("flex w-60 flex-col gap-1", classNames?.sidebar?.base)}>
                    {navigationItems.map((item) => (
                        <Link key={item.view} href={`${basePath}/${viewPaths[item.view]}`}>
                            <Button
                                size="lg"
                                className={cn(
                                    "w-full justify-start",
                                    classNames?.sidebar?.button,
                                    view === item.view && classNames?.sidebar?.buttonActive
                                )}
                                variant={view === item.view ? "secondary" : "ghost"}
                            >
                                <item.icon className={classNames?.icon} />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>

            {view === "settings" && (
                <AccountSettingsCards classNames={classNames} localization={localization} />
            )}

            {view === "security" && (
                <SecuritySettingsCards classNames={classNames} localization={localization} />
            )}

            {view === "apiKeys" && apiKey && (
                <div className={cn("flex w-full flex-col", classNames?.cards)}>
                    <APIKeysCard classNames={classNames?.card} localization={localization} />
                </div>
            )}

            {view === "organizations" && organization && (
                <div className={cn("flex w-full flex-col ", classNames?.cards)}>
                    <OrganizationsCard classNames={classNames?.card} localization={localization} />
                </div>
            )}
        </div>
    )
}
