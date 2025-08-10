"use client"

import { MenuIcon } from "lucide-react"
import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getViewByPath } from "../../lib/utils"
import type { OrganizationViewPath } from "../../server"
import type { AccountViewProps } from "../account/account-view"
import { ApiKeysCard } from "../settings/api-key/api-keys-card"
import { Button } from "../ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "../ui/drawer"
import { Label } from "../ui/label"
import { OrganizationMembersCard } from "./organization-members-card"
import { OrganizationSettingsCards } from "./organization-settings-cards"

export type OrganizationViewPageProps = Omit<AccountViewProps, "view"> & {
    slug?: string
    view?: OrganizationViewPath
}

export function OrganizationView({
    className,
    classNames,
    localization: localizationProp,
    pathname,
    view: viewProp,
    hideNav,
    slug
}: OrganizationViewPageProps) {
    const {
        organization: organizationOptions,
        Link,
        localization: contextLocalization
    } = useContext(AuthUIContext)

    if (!organizationOptions) {
        return null
    }

    const localization = { ...contextLocalization, ...localizationProp }

    const view =
        viewProp ||
        getViewByPath(organizationOptions.viewPaths, pathname) ||
        "SETTINGS"

    const navItems: {
        view: OrganizationViewPath
        label: string
    }[] = [
        { view: "SETTINGS", label: localization.SETTINGS },
        { view: "MEMBERS", label: localization.MEMBERS }
    ]

    if (organizationOptions.apiKey) {
        navItems.push({
            view: "API_KEYS",
            label: localization.API_KEYS
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
                                    {localization.ORGANIZATION}
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="flex flex-col px-4 pb-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.view}
                                        href={`${organizationOptions.basePath}/${organizationOptions.viewPaths[item.view]}`}
                                    >
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
            )}

            {!hideNav && (
                <div className="hidden md:block">
                    <div
                        className={cn(
                            "flex w-60 flex-col gap-1",
                            classNames?.sidebar?.base
                        )}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.view}
                                href={`${organizationOptions.basePath}/${organizationOptions.viewPaths[item.view]}`}
                            >
                                <Button
                                    size="lg"
                                    className={cn(
                                        "w-full justify-start px-4 transition-none",
                                        classNames?.sidebar?.button,
                                        view === item.view
                                            ? "font-semibold"
                                            : "text-foreground/70",
                                        view === item.view &&
                                            classNames?.sidebar?.buttonActive
                                    )}
                                    variant="ghost"
                                >
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {view === "MEMBERS" && (
                <OrganizationMembersCard
                    classNames={classNames?.card}
                    localization={localization}
                />
            )}

            {view === "API_KEYS" && (
                <ApiKeysCard
                    classNames={classNames?.card}
                    localization={localization}
                />
            )}

            {view === "SETTINGS" && (
                <OrganizationSettingsCards
                    classNames={classNames}
                    localization={localization}
                    slug={slug}
                />
            )}
        </div>
    )
}
