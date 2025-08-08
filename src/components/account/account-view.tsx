"use client"

import { MenuIcon } from "lucide-react"
import { useContext } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getViewByPath } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { AccountViewPaths } from "../../server"
import { OrganizationsCard } from "../organization/organizations-card"
import { AccountSettingsCards } from "../settings/account-settings-cards"
import { APIKeysCard } from "../settings/api-key/api-keys-card"
import { SecuritySettingsCards } from "../settings/security-settings-cards"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "../ui/drawer"
import { Label } from "../ui/label"

export function AccountView({
    className,
    classNames,
    localization: localizationProp,
    pathname,
    view: viewProp,
    hideNav
}: {
    className?: string
    classNames?: {
        base?: string
        cards?: string
        drawer?: { menuItem?: string }
        sidebar?: { base?: string; button?: string; buttonActive?: string }
        card?: SettingsCardClassNames
    }
    localization?: AuthLocalization
    pathname?: string
    view?: keyof AccountViewPaths
    hideNav?: boolean
}) {
    const {
        apiKey,
        localization: contextLocalization,
        organization,
        account: accountOptions,
        Link
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const view =
        viewProp ||
        getViewByPath(accountOptions?.viewPaths || {}, pathname) ||
        "SETTINGS"

    const navItems: {
        view: keyof AccountViewPaths
        label: string
    }[] = [
        { view: "SETTINGS", label: localization.ACCOUNT || "Account" },
        { view: "SECURITY", label: localization.SECURITY || "Security" }
    ]

    if (apiKey) {
        navItems.push({
            view: "API_KEYS",
            label: localization.API_KEYS || "API Keys"
        })
    }

    if (organization) {
        navItems.push({
            view: "ORGANIZATIONS",
            label: localization.ORGANIZATIONS || "Organizations"
        })
    }

    return (
        <div
            className={cn(
                "flex w-full grow flex-col gap-4 md:flex-row md:gap-12",
                className,
                classNames?.base
            )}
        >
            {!hideNav && (
                <div className="flex justify-between gap-2 md:hidden">
                    <Label className="font-semibold text-base">
                        {navItems.find((i) => i.view === view)?.label}
                    </Label>

                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button variant="outline">
                                <MenuIcon />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle className="hidden">
                                    {localization.SETTINGS}
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="flex flex-col px-4 pb-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.view}
                                        href={`${accountOptions?.basePath}/${accountOptions?.viewPaths?.[item.view]}`}
                                    >
                                        <Button
                                            size="lg"
                                            className={`w-full justify-start px-4 transition-none ${classNames?.drawer?.menuItem || ""} ${
                                                view === item.view
                                                    ? "font-semibold"
                                                    : "text-foreground/70"
                                            }`}
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
            )}

            {!hideNav && (
                <div className="hidden md:block">
                    <div
                        className={`flex w-60 flex-col gap-1 ${classNames?.sidebar?.base || ""}`}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.view}
                                href={`${accountOptions?.basePath}/${accountOptions?.viewPaths?.[item.view]}`}
                            >
                                <Button
                                    size="lg"
                                    className={`w-full justify-start px-4 transition-none ${classNames?.sidebar?.button || ""} ${
                                        view === item.view
                                            ? "font-semibold"
                                            : "text-foreground/70"
                                    } ${view === item.view ? classNames?.sidebar?.buttonActive || "" : ""}`}
                                    variant="ghost"
                                >
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {view === "SETTINGS" && (
                <AccountSettingsCards
                    classNames={classNames}
                    localization={localization}
                />
            )}
            {view === "SECURITY" && (
                <SecuritySettingsCards
                    classNames={classNames}
                    localization={localization}
                />
            )}

            {view === "API_KEYS" && (
                <div
                    className={`flex w-full flex-col ${classNames?.cards || ""}`}
                >
                    <APIKeysCard
                        classNames={classNames?.card}
                        localization={localization}
                    />
                </div>
            )}

            {view === "ORGANIZATIONS" && organization && (
                <div
                    className={`flex w-full flex-col ${classNames?.cards || ""}`}
                >
                    <OrganizationsCard
                        classNames={classNames?.card}
                        localization={localization}
                    />
                </div>
            )}
        </div>
    )
}
