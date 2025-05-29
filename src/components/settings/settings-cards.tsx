"use client"

import { MenuIcon } from "lucide-react"
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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer"
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
    drawer?: {
        base?: string
        trigger?: string
        content?: string
        menuIcon?: string
        menuItem?: string
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
            label: localization.account
        },
        {
            view: "security",
            label: localization.security
        }
    ]

    if (apiKey) {
        personalGroup.push({
            view: "apiKeys",
            label: localization.apiKeys
        })
    }

    if (organization) {
        personalGroup.push({
            view: "organizations",
            label: localization.organizations
        })
    }

    // Organization settings group
    const organizationGroup: NavigationItem[] = []

    if (organization) {
        organizationGroup.push({
            view: "organization",
            label: localization.organization
        })

        organizationGroup.push({
            view: "members",
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
                <Label className="font-semibold text-base">{currentItem?.label}</Label>

                <Drawer>
                    <DrawerTrigger asChild>
                        <Button className={cn(classNames?.drawer?.trigger)} variant="outline">
                            <MenuIcon className={cn(classNames?.drawer?.menuIcon)} />
                        </Button>
                    </DrawerTrigger>

                    <DrawerContent className={cn(classNames?.drawer?.content)}>
                        <DrawerHeader>
                            <DrawerTitle className="hidden">{localization.settings}</DrawerTitle>
                        </DrawerHeader>
                        <div className="flex flex-col px-4 pb-4">
                            {currentNavigationGroup.map((item) => (
                                <Link key={item.view} href={`${basePath}/${viewPaths[item.view]}`}>
                                    <Button
                                        size="lg"
                                        className={cn(
                                            "w-full justify-start px-4 transition-none",
                                            classNames?.drawer?.menuItem,
                                            view === item.view
                                                ? "font-semibold"
                                                : "text-foreground/70"
                                        )}
                                        variant="ghost"
                                    >
                                        {item.label}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            <div className="hidden md:block">
                <div className={cn("flex w-60 flex-col gap-1", classNames?.sidebar?.base)}>
                    {currentNavigationGroup.map((item) => (
                        <Link key={item.view} href={`${basePath}/${viewPaths[item.view]}`}>
                            <Button
                                size="lg"
                                className={cn(
                                    "w-full justify-start px-4 transition-none",
                                    classNames?.sidebar?.button,
                                    view === item.view ? "font-semibold" : "text-foreground/70",
                                    view === item.view && classNames?.sidebar?.buttonActive
                                )}
                                variant="ghost"
                            >
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
