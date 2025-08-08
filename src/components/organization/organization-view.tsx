"use client"

import { MenuIcon } from "lucide-react"
import { useContext } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getViewByPath } from "../../lib/utils"
import type { OrganizationViewPaths } from "../../server"
import { APIKeysCard } from "../settings/api-key/api-keys-card"
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

export function OrganizationView({
    pathname,
    hideNav
}: {
    pathname?: string
    hideNav?: boolean
}) {
    const { organization: organizationOptions } = useContext(AuthUIContext)

    const view = getViewByPath(organizationOptions?.viewPaths || {}, pathname)

    const navItems: {
        view: keyof OrganizationViewPaths
        label: string
    }[] = [
        { view: "SETTINGS", label: "Settings" },
        { view: "MEMBERS", label: "Members" }
    ]

    if (organizationOptions?.apiKey) {
        navItems.push({ view: "API_KEYS", label: "API Keys" })
    }

    return (
        <div
            className={cn(
                "flex w-full grow flex-col gap-4 md:flex-row md:gap-12"
            )}
        >
            {!hideNav && (
                <div className="flex justify-between gap-2 md:hidden">
                    <Label className="font-semibold text-base">
                        {
                            navItems.find(
                                (i) => i.view === (view || "SETTINGS")
                            )?.label
                        }
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
                                    Organization
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="flex flex-col px-4 pb-4">
                                {navItems.map((item) => (
                                    <a
                                        key={item.view}
                                        href={`${organizationOptions?.basePath}/${organizationOptions?.viewPaths?.[item.view]}`}
                                    >
                                        <Button
                                            size="lg"
                                            className="w-full justify-start px-4 transition-none"
                                            variant="ghost"
                                        >
                                            {item.label}
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>
            )}

            {!hideNav && (
                <div className="hidden md:block">
                    <div className={cn("flex w-60 flex-col gap-1")}>
                        {navItems.map((item) => (
                            <a
                                key={item.view}
                                href={`${organizationOptions?.basePath}/${organizationOptions?.viewPaths?.[item.view]}`}
                            >
                                <Button
                                    size="lg"
                                    className="w-full justify-start px-4 transition-none"
                                    variant="ghost"
                                >
                                    {item.label}
                                </Button>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {view === "MEMBERS" && <OrganizationMembersCard />}
            {view === "API_KEYS" && (
                <div className={cn("flex w-full flex-col")}>
                    <APIKeysCard />
                </div>
            )}
            {!view || view === "SETTINGS" ? (
                <OrganizationSettingsCards />
            ) : null}
        </div>
    )
}
