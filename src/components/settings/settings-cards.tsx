"use client"

import {
    Building2Icon,
    BuildingIcon,
    KeyRoundIcon,
    type LucideIcon,
    MenuIcon,
    ShieldCheckIcon,
    UserCircle2Icon,
    UsersRoundIcon
} from "lucide-react"
import { useContext } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { OrganizationInvitationsCard } from "../organization/organization-invitations-card"
import { OrganizationMembersCard } from "../organization/organization-members-card"
import { OrganizationSettingsCards } from "../organization/organization-settings-cards"
import { OrganizationsCard } from "../organization/organizations-card"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Label } from "../ui/label"
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

export const settingsViews = [
    "settings",
    "security",
    "apiKeys",
    "organization",
    "organizations",
    "members"
] as const
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

    // Personal settings group
    const personalGroup: NavigationItem[] = [
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
        personalGroup.push({
            view: "apiKeys",
            icon: KeyRoundIcon,
            label: localization.apiKeys
        })
    }

    if (organization) {
        personalGroup.push({
            view: "organizations",
            icon: Building2Icon,
            label: localization.organizations
        })
    }

    // Organization settings group
    const organizationGroup: NavigationItem[] = []

    if (organization) {
        organizationGroup.push({
            view: "organization",
            icon: BuildingIcon,
            label: localization.organization
        })

        organizationGroup.push({
            view: "members",
            icon: UsersRoundIcon,
            label: localization.members
        })
    }

    // Determine which group the current view belongs to
    const isPersonalView = personalGroup.some((item) => item.view === view)
    const isOrganizationView =
        organizationGroup.some((item) => item.view === view) || view === "members"

    // Show navigation for the current group
    const currentNavigationGroup = isOrganizationView ? organizationGroup : personalGroup

    // Flatten all items for finding current item
    const currentItem = currentNavigationGroup.find((item) => item.view === view)

    return (
        <div
            className={cn(
                "flex w-full grow flex-col gap-4 md:flex-row md:gap-12",
                className,
                classNames?.base
            )}
        >
            <div className="flex justify-between gap-2 md:hidden">
                <Label className="font-semibold">
                    {currentItem && (
                        <>
                            <currentItem.icon className={cn("size-4", classNames?.icon)} />
                            {currentItem.label}
                        </>
                    )}
                </Label>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className={cn(classNames?.dropdown?.trigger)} variant="outline">
                            <MenuIcon className={cn(classNames?.dropdown?.menuIcon)} />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className={cn("w-[calc(100svw-2rem)]", classNames?.dropdown?.content)}
                    >
                        {currentNavigationGroup.map((item) => (
                            <DropdownMenuItem key={item.view} asChild>
                                <Link href={`${basePath}/${viewPaths[item.view]}`}>
                                    <item.icon />
                                    {item.label}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="hidden md:block">
                <div className={cn("flex w-60 flex-col gap-1", classNames?.sidebar?.base)}>
                    {currentNavigationGroup.map((item) => (
                        <Link key={item.view} href={`${basePath}/${viewPaths[item.view]}`}>
                            <Button
                                size="lg"
                                className={cn(
                                    "w-full justify-start px-4",
                                    classNames?.sidebar?.button,
                                    view === item.view ? "font-semibold" : "text-foreground/70",
                                    view === item.view && classNames?.sidebar?.buttonActive
                                )}
                                variant="ghost"
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

            {view === "organization" && organization && (
                <OrganizationSettingsCards classNames={classNames} localization={localization} />
            )}

            {view === "organizations" && organization && (
                <div className={cn("flex w-full flex-col", classNames?.cards)}>
                    <OrganizationsCard classNames={classNames?.card} localization={localization} />
                </div>
            )}

            {view === "members" && organization && (
                <div className={cn("flex w-full flex-col gap-4 md:gap-6", classNames?.cards)}>
                    <OrganizationMembersCard
                        classNames={classNames?.card}
                        localization={localization}
                    />

                    <OrganizationInvitationsCard
                        classNames={classNames?.card}
                        localization={localization}
                    />
                </div>
            )}
        </div>
    )
}
